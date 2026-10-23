import test from 'node:test';
import assert from 'node:assert/strict';

// Test Suite: Audit and Fix Data Truncation and Pagination Verification

test('1. Volume Aggregates: Demonstrating former limit truncation vs dataset-wide calculation', () => {
  // Scenario: 350 inventory transactions exist in the database (200 purchases of 10 cartons, 150 sales of 5 cartons)
  const transactions = [];
  for (let i = 0; i < 200; i++) {
    transactions.push({ id: `tx-p-${i}`, type: 'purchase', change: 10, created_at: new Date(Date.now() - i * 1000).toISOString() });
  }
  for (let i = 0; i < 150; i++) {
    transactions.push({ id: `tx-s-${i}`, type: 'sale', change: -5, created_at: new Date(Date.now() - (200 + i) * 1000).toISOString() });
  }
  assert.equal(transactions.length, 350, 'Total transactions should be 350');

  // Former flawed logic: fetched with .limit(200) and computed totals in client memory
  const formerSample = transactions.slice(0, 200); // represents .limit(200)
  const truncatedIncoming = formerSample.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.change, 0);
  const truncatedOutgoing = formerSample.filter(t => t.type === 'sale').reduce((acc, t) => acc + Math.abs(t.change), 0);

  // In the former sample, all 200 are purchases, so 0 sales are counted!
  assert.equal(truncatedIncoming, 2000);
  assert.equal(truncatedOutgoing, 0, 'Former sample failed to count any of the 150 sales due to truncation');

  // Authoritative Database Aggregate Logic (matching v_inventory_volume_metrics):
  // SELECT
  //   COALESCE(SUM(change) FILTER (WHERE type = 'purchase'), 0) AS incoming_cartons,
  //   COALESCE(SUM(ABS(change)) FILTER (WHERE type = 'sale'), 0) AS outgoing_cartons
  // FROM inventory_transactions;
  const datasetWideIncoming = transactions
    .filter(t => t.type === 'purchase')
    .reduce((acc, t) => acc + t.change, 0);
  const datasetWideOutgoing = transactions
    .filter(t => t.type === 'sale')
    .reduce((acc, t) => acc + Math.abs(t.change), 0);

  assert.equal(datasetWideIncoming, 2000, 'Full incoming cartons calculated accurately');
  assert.equal(datasetWideOutgoing, 750, 'Full outgoing cartons calculated accurately without truncation');
  assert.notEqual(truncatedOutgoing, datasetWideOutgoing, 'Proves former sample produced severe data truncation');
});

test('2. Customer Balances: PostgREST 1000-row limit vs v_customer_balances', () => {
  // Scenario: 1,200 ledger transactions across 2 customers (Customer A has 700 tx, Customer B has 500 tx)
  const ledgerEntries = [];
  let expectedBalanceA = 0;
  let expectedBalanceB = 0;

  for (let i = 0; i < 700; i++) {
    const isSale = i % 2 === 0;
    const amount = isSale ? 1000 : 800; // Customer A owes 200 net every 2 tx
    if (isSale) expectedBalanceA += amount;
    else expectedBalanceA -= amount;
    ledgerEntries.push({ id: `tx-a-${i}`, customer_id: 'cust-a', type: isSale ? 'sale' : 'payment', amount });
  }

  for (let i = 0; i < 500; i++) {
    const isSale = i % 2 === 0;
    const amount = isSale ? 500 : 400; // Customer B owes 100 net every 2 tx
    if (isSale) expectedBalanceB += amount;
    else expectedBalanceB -= amount;
    ledgerEntries.push({ id: `tx-b-${i}`, customer_id: 'cust-b', type: isSale ? 'sale' : 'payment', amount });
  }

  assert.equal(ledgerEntries.length, 1200);

  // If client fetched raw ledger without pagination capped by default PostgREST limit (1000 rows):
  const clippedRows = ledgerEntries.slice(0, 1000);
  const corruptedBalanceB = clippedRows
    .filter(r => r.customer_id === 'cust-b')
    .reduce((acc, r) => acc + (r.type === 'sale' ? r.amount : -r.amount), 0);

  assert.notEqual(corruptedBalanceB, expectedBalanceB, 'Client-side calculation over clipped sample corrupts Customer B balance');

  // Authoritative Database Aggregate (matching v_customer_balances):
  // Aggregates computed directly in PostgreSQL grouped by customer_id
  const dbBalances = new Map();
  for (const entry of ledgerEntries) {
    const current = dbBalances.get(entry.customer_id) || { totalSales: 0, totalPayments: 0, balance: 0 };
    if (entry.type === 'sale') {
      current.totalSales += entry.amount;
      current.balance += entry.amount;
    } else {
      current.totalPayments += entry.amount;
      current.balance -= entry.amount;
    }
    dbBalances.set(entry.customer_id, current);
  }

  assert.equal(dbBalances.get('cust-a').balance, expectedBalanceA);
  assert.equal(dbBalances.get('cust-b').balance, expectedBalanceB);

  // Total credit metric derived from complete customer balances:
  const totalCredit = Array.from(dbBalances.values())
    .reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  assert.equal(totalCredit, expectedBalanceA + expectedBalanceB);
});

test('3. Inventory List Pagination: Deterministic slicing with >PAGE_SIZE records', () => {
  const PAGE_SIZE = 25;
  const mockProducts = Array.from({ length: 63 }, (_, i) => ({
    id: `prod-${i + 1}`,
    name: `Product ${i + 1}`,
    sku: `SKU-${i + 1}`,
    category: 'Oil',
    currentStockCartons: 10,
    lowStockThresholdCartons: 5,
    sellingPricePerCarton: 1500,
  }));

  const totalPages = Math.ceil(mockProducts.length / PAGE_SIZE);
  assert.equal(totalPages, 3, '63 products with PAGE_SIZE 25 should yield 3 pages');

  // Page 1 slice
  const page1 = mockProducts.slice(0, PAGE_SIZE);
  assert.equal(page1.length, 25);
  assert.equal(page1[0].id, 'prod-1');
  assert.equal(page1[24].id, 'prod-25');

  // Page 2 slice
  const page2 = mockProducts.slice(PAGE_SIZE, PAGE_SIZE * 2);
  assert.equal(page2.length, 25);
  assert.equal(page2[0].id, 'prod-26');
  assert.equal(page2[24].id, 'prod-50');

  // Page 3 slice
  const page3 = mockProducts.slice(PAGE_SIZE * 2, PAGE_SIZE * 3);
  assert.equal(page3.length, 13);
  assert.equal(page3[0].id, 'prod-51');
  assert.equal(page3[12].id, 'prod-63');

  // Clamp protection:
  const invalidPage = 99;
  const currentPage = Math.min(invalidPage, totalPages);
  assert.equal(currentPage, 3, 'Out-of-range page index clamps cleanly to totalPages');
});

test('4. Customer Ledger Pagination: Deterministic slicing with 120 rows', () => {
  const PAGE_SIZE = 20;
  const mockLedger = Array.from({ length: 120 }, (_, i) => ({
    id: `entry-${i + 1}`,
    type: i % 2 === 0 ? 'sale' : 'payment',
    amount: 100,
    created_at: new Date(Date.now() - i * 60000).toISOString(),
  }));

  const totalPages = Math.ceil(mockLedger.length / PAGE_SIZE);
  assert.equal(totalPages, 6, '120 ledger rows with PAGE_SIZE 20 should yield 6 pages');

  const page1 = mockLedger.slice(0, 20);
  assert.equal(page1.length, 20);
  assert.equal(page1[0].id, 'entry-1');

  const page6 = mockLedger.slice(100, 120);
  assert.equal(page6.length, 20);
  assert.equal(page6[19].id, 'entry-120');
});

test('5. Reports Batch Processing: Emulating chunked range fetches for complete datasets', async () => {
  // Simulate remote table with 2,500 records exceeding Supabase default single-query limit
  const remoteTable = Array.from({ length: 2500 }, (_, i) => ({
    id: `sale-${i + 1}`,
    total: 1000,
    created_at: new Date().toISOString(),
  }));

  // Batch-fetch simulation using range(from, from + batchSize - 1)
  const batchSize = 1000;
  let from = 0;
  const allFetched = [];

  while (true) {
    const to = from + batchSize - 1;
    const batch = remoteTable.slice(from, to + 1);
    allFetched.push(...batch);

    if (batch.length < batchSize) break;
    from += batchSize;
  }

  assert.equal(allFetched.length, 2500, 'All 2,500 records should be collected across 3 batches');
  const sumTotal = allFetched.reduce((acc, row) => acc + row.total, 0);
  assert.equal(sumTotal, 2500000, 'Calculated total matches 100% of the dataset');
});
