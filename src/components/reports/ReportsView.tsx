'use client';

import React, { useEffect, useState } from 'react';
import { Users, Download, AlertTriangle, CheckCircle2, Package, TrendingUp } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase/client';

type ReportSale = {
  id: string;
  total_amount: number;
  created_at: string;
};

type ReportSaleItem = {
  sale_id: string;
  product_id: string;
  quantity_cartons: number;
  subtotal: number;
};

function escapeCsv(value: string | number): string {
  const text = String(value);
  const safeText = /^[=+@\-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export default function ReportsView() {
  const {
    currentUser,
    customers,
    getCustomerSummary,
    products,
    setActiveModal,
    setPreselectedProductId,
  } = useStockFlow();
  const { t } = useLanguage();
  const [sales, setSales] = useState<ReportSale[]>([]);
  const [saleItems, setSaleItems] = useState<ReportSaleItem[]>([]);
  const [salesLoaded, setSalesLoaded] = useState(false);
  const [salesLoadFailed, setSalesLoadFailed] = useState(false);
  const salesDataReady = salesLoaded || !isSupabaseConfigured;
  const salesDataUnavailable = salesLoadFailed || !isSupabaseConfigured;

  useEffect(() => {
    if (currentUser.role !== 'manager' || !isSupabaseConfigured) return;

    let isActive = true;
    const loadSales = async () => {
      const [salesResult, itemsResult] = await Promise.all([
        supabase.from('sales').select('id, total_amount, created_at'),
        supabase.from('sale_items').select('sale_id, product_id, quantity_cartons, subtotal'),
      ]);

      if (!isActive) return;
      if (salesResult.error || itemsResult.error) {
        console.error('Failed to load report sales data:', salesResult.error || itemsResult.error);
        setSalesLoadFailed(true);
      } else {
        setSales(salesResult.data ?? []);
        setSaleItems(itemsResult.data ?? []);
      }
      setSalesLoaded(true);
    };

    void loadSales();
    return () => {
      isActive = false;
    };
  }, [currentUser.role]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return { date, key, total: 0 };
  });
  const activityByDay = new Map(activityDays.map((day) => [day.key, day]));
  const salesLastSevenDays = sales.filter((sale) => {
    const date = new Date(sale.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const day = activityByDay.get(key);
    if (day) day.total += Number(sale.total_amount);
    return Boolean(day);
  });
  const recentSaleIds = new Set(salesLastSevenDays.map((sale) => sale.id));

  // Customer balances come from the existing ledger selector.
  const customerBalances = customers
    .map((c) => ({ ...c, summary: getCustomerSummary(c.id) }))
    .sort((a, b) => b.summary.outstandingBalance - a.summary.outstandingBalance);

  const customersWithDebt = customerBalances.filter((c) => c.summary.outstandingBalance > 0);

  const productSalesById = new Map<string, { quantity: number; revenue: number }>();
  saleItems.filter((item) => recentSaleIds.has(item.sale_id)).forEach((item) => {
    const current = productSalesById.get(item.product_id) ?? { quantity: 0, revenue: 0 };
    current.quantity += Number(item.quantity_cartons);
    current.revenue += Number(item.subtotal);
    productSalesById.set(item.product_id, current);
  });
  const productBestSellers = products
    .map((product) => ({ ...product, ...(productSalesById.get(product.id) ?? { quantity: 0, revenue: 0 }) }))
    .filter((product) => product.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Low stock uses current stock and thresholds from context.
  const lowStockProducts = products
    .filter((p) => p.currentStockCartons <= p.lowStockThresholdCartons)
    .sort((a, b) => a.currentStockCartons - b.currentStockCartons);

  const sevenDaySales = activityDays.reduce((total, day) => total + day.total, 0);
  const trendMax = Math.max(...activityDays.map((day) => day.total), 1);

  const exportReport = () => {
    const rows: (string | number)[][] = [
      ['Section', 'Item', 'Quantity', 'Amount ETB', 'Details'],
      ['Summary', 'Sales', '', sevenDaySales, 'Last 7 days'],
      ...activityDays.map((day) => [
        'Sales', day.date.toLocaleDateString(), '', day.total, 'Daily total, last 7 days',
      ]),
      ...productBestSellers.map((product) => [
        'Best-selling products', product.name, product.quantity, product.revenue, product.sku,
      ]),
      ...customersWithDebt.map((customer) => [
        'Customers who owe', customer.name, '', customer.summary.outstandingBalance,
        `Total sales: ${customer.summary.totalSales}; phone: ${customer.phone}`,
      ]),
      ...lowStockProducts.map((product) => [
        'Low stock', product.name, product.currentStockCartons, '', `Reorder threshold: ${product.lowStockThresholdCartons}`,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `stockflow-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (currentUser.role !== 'manager') return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.reports.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Money owed, best-selling products, and low stock</p>
        </div>
        <button
          type="button"
          onClick={exportReport}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white shadow-2xs transition-colors flex-shrink-0"
        >
          <Download className="w-3 h-3" />
          <span>Export CSV</span>
        </button>
      </div>

      <section aria-label="Sales summary" className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-500">Total sales</h2>
              <p className="mt-0.5 text-lg font-bold text-slate-900 font-mono tabular-nums">
                {salesDataUnavailable ? 'Not available' : !salesDataReady ? 'Loading...' : sevenDaySales.toLocaleString()}
                {!salesDataUnavailable && salesDataReady && <span className="ml-1 text-xs font-sans font-medium text-slate-400">ETB</span>}
              </p>
              <p className="text-[10px] text-slate-400">Last 7 days</p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 sm:w-3/5 sm:gap-3" aria-label="Daily sales totals">
            {!salesDataReady || salesDataUnavailable ? (
              <p className="col-span-7 py-2 text-center text-[11px] text-slate-400">
                {salesDataUnavailable ? 'Sales data isn\'t available.' : 'Loading sales...'}
              </p>
            ) : activityDays.map((day) => (
              <div key={day.key} className="min-w-0 text-center" title={`${day.date.toLocaleDateString()}: ${day.total.toLocaleString()} ETB`}>
                <div className="flex h-8 items-end justify-center">
                  <div
                    className={`w-full max-w-6 rounded-t-sm ${day.total > 0 ? 'bg-blue-700' : 'bg-slate-100'}`}
                    style={{ height: `${day.total > 0 ? Math.max((day.total / trendMax) * 100, 12) : 8}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 truncate text-[9px] font-mono text-slate-500">
                  {day.total.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 })}
                </p>
                <p className="text-[9px] text-slate-400">{day.date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Best-selling products</h2>
              <p className="text-[10px] text-slate-400">Cartons sold in the last 7 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="col-span-6">Product</span>
            <span className="col-span-2 text-right">Sold</span>
            <span className="col-span-4 text-right">Revenue</span>
          </div>
          {!salesDataReady || productBestSellers.length === 0 ? (
            <p className="px-4 py-7 text-center text-xs text-slate-500">
              {salesDataUnavailable ? 'Product sales aren\'t available.' : !salesDataReady ? 'Loading sales...' : 'No products sold in the last 7 days.'}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {productBestSellers.map((product, index) => (
                <div key={product.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs">
                  <div className="col-span-6 min-w-0 flex items-center gap-2">
                    <span className="text-slate-400 font-semibold w-4 flex-shrink-0">{index + 1}.</span>
                    <p className="min-w-0 flex-1 truncate font-semibold text-slate-900">{product.name}</p>
                  </div>
                  <div className="col-span-2 text-right font-semibold text-slate-700 font-mono tabular-nums">{product.quantity.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans font-medium">ctn</span></div>
                  <div className="col-span-4 text-right font-bold text-slate-900 font-mono tabular-nums">{product.revenue.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans font-medium">ETB</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-rose-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.reports.customersWhoOwe}</h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs overflow-hidden">
          {customersWithDebt.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1.5" />
              <p className="text-sm font-semibold text-slate-700">{t.reports.allCustomersSettled}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="col-span-5">Customer</span>
                <span className="col-span-3 text-right">Total sales</span>
                <span className="col-span-4 text-right">Owes</span>
              </div>
              {customersWithDebt.map((customer, index) => (
                <div key={customer.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs hover:bg-slate-50/60 transition-colors">
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 font-semibold w-4 flex-shrink-0">{index + 1}.</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{customer.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <p className="font-semibold text-slate-700 font-mono tabular-nums">{customer.summary.totalSales.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">ETB</p>
                  </div>
                  <div className="col-span-4 text-right">
                    <p className="font-bold text-rose-700 font-mono tabular-nums">{customer.summary.outstandingBalance.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">ETB</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Low-stock and reorder</h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs overflow-hidden">
          {lowStockProducts.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-slate-700">{t.reports.allStockHealthy}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockProducts.map((product) => {
                const isOut = product.currentStockCartons === 0;
                return (
                  <div key={product.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Min: {product.lowStockThresholdCartons} cartons · In stock: {product.currentStockCartons} cartons</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOut ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isOut ? t.inventory.outOfStock : t.inventory.lowStock}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPreselectedProductId(product.id);
                          setActiveModal('purchase');
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-2.5 py-1 bg-blue-50 hover:bg-blue-100 transition-colors whitespace-nowrap"
                      >
                        {t.reports.reorderNow}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
