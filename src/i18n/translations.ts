/**
 * StockFlow — Centralized UI Translations
 * English (en) + Amharic (am)
 *
 * Rules:
 * - Only translate UI labels, buttons, headings, helper text, validation messages.
 * - NEVER translate business data: customer names, product names, SKUs, phone numbers,
 *   transaction references, amounts, or city names.
 * - Amharic wording is chosen for natural everyday business use in Ethiopia,
 *   not for literal word-for-word translation.
 */

export type Language = 'en' | 'am';

export interface Translations {
  // ── Navigation ──────────────────────────────────────────────
  nav: {
    home: string;
    stock: string;
    customers: string;
    reports: string;
    activity: string;
    more: string;
    recordAction: string;
  };

  // ── Sidebar ──────────────────────────────────────────────────
  sidebar: {
    tagline: string;
    manager: string;
    warehouse: string;
    quickAction: string;
    dashboard: string;
    stock: string;
    customers: string;
    reports: string;
    activity: string;
    more: string;
  };

  // ── Dashboard / Home ─────────────────────────────────────────
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    subtitleManager: string;
    subtitleWarehouse: string;
    warehouseRestriction: string;
    warehouseRestrictionNote: string;
    totalStock: string;
    totalStockSub: string;
    amountOwedTotal: string;
    amountOwedTotalSub: string;
    inStock: string;
    inStockSub: string;
    comingIn: string;
    comingInSub: string;
    sold: string;
    soldSub: string;
    lowStock: string;
    lowStockSub: string;
    recentActivity: string;
    viewAll: string;
    cartons: string;
    items: string;
    purchase: string;
    sale: string;
  };

  // ── Warehouse View ───────────────────────────────────────────
  warehouse: {
    title: string;
    subtitle: string;
    totalItems: string;
    comingIn: string;
    sold: string;
    recentDispatches: string;
    logDispatch: string;
  };

  // ── Stock / Inventory ─────────────────────────────────────────
  inventory: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    addProduct: string;
    filterAll: string;
    filterInStock: string;
    filterLowStock: string;
    filterOutOfStock: string;
    noProductsFound: string;
    noProductsFoundSub: string;
    cartons: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    // Product Detail
    backToStock: string;
    currentStock: string;
    minStock: string;
    piecesPerCarton: string;
    category: string;
    unit: string;
    sellingPrice: string;
    costPrice: string;
    addStock: string;
  };

  // ── Customers ─────────────────────────────────────────────────
  customers: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterWithBalance: string;
    noCustomersFound: string;
    noCustomersFoundSub: string;
    transactionsCount: string;
    amountOwed: string;
    totalSales: string;
    allCustomers: string;
    outstanding: string;
    settled: string;
  };

  // ── Customer Ledger ───────────────────────────────────────────
  ledger: {
    outstanding: string;
    totalSales: string;
    totalPaid: string;
    amountOwed: string;
    recordPayment: string;
    newSale: string;
    transactions: string;
    accountSummary: string;
    noTransactions: string;
    backToCustomers: string;
    saleType: string;
    paymentType: string;
    adjustmentType: string;
    runningBalance: string;
    settled: string;
  };

  // ── Reports ───────────────────────────────────────────────────
  reports: {
    title: string;
    subtitle: string;
    totalSales: string;
    totalPaid: string;
    totalOwed: string;
    topCustomers: string;
    topStock: string;
    cartons: string;
    viewAll: string;
  };

  // ── Quick Action Sheet ────────────────────────────────────────
  quickAction: {
    title: string;
    subtitle: string;
    sell: string;
    sellSub: string;
    addStock: string;
    addStockSub: string;
    customerPaid: string;
    customerPaidSub: string;
    newProduct: string;
    newProductSub: string;
    managerOnly: string;
  };

  // ── Sell Products Modal ───────────────────────────────────────
  sale: {
    title: string;
    subtitle: string;
    chooseCustomer: string;
    currentOwes: string;
    products: string;
    addProduct: string;
    item: string;
    howManyCartons: string;
    pricePerCarton: string;
    lineSubtotal: string;
    totalSale: string;
    paymentTerms: string;
    paidInFull: string;
    partial: string;
    fullCredit: string;
    amountPaid: string;
    paymentMethod: string;
    stillOwes: string;
    notes: string;
    notesPlaceholder: string;
    submit: string;
    submitting: string;
    etb: string;
  };

  // ── Customer Payment Modal ────────────────────────────────────
  payment: {
    title: string;
    subtitle: string;
    chooseCustomer: string;
    currentOwes: string;
    amountPaid: string;
    paymentMethod: string;
    referenceNo: string;
    referencePlaceholder: string;
    newBalance: string;
    submit: string;
    submitting: string;
    etb: string;
  };

  // ── Add Stock / Purchase Modal ────────────────────────────────
  purchase: {
    title: string;
    subtitle: string;
    chooseProduct: string;
    currentStock: string;
    howManyCartons: string;
    costPerCarton: string;
    totalCost: string;
    supplierNote: string;
    supplierPlaceholder: string;
    submit: string;
    submitting: string;
    etb: string;
  };

  // ── Add Product Scaffold ──────────────────────────────────────
  addProduct: {
    title: string;
    subtitle: string;
    comingSoon: string;
    comingSoonDetail: string;
    gotIt: string;
  };

  // ── Success Dialogs ───────────────────────────────────────────
  success: {
    sale: {
      title: string;
      customer: string;
      items: string;
      total: string;
      paid: string;
      stillOwes: string;
      stockLeft: string;
      ref: string;
    };
    payment: {
      title: string;
      customerPaid: string;
      stillOwes: string;
      stockNote: string;
      ref: string;
    };
    purchase: {
      title: string;
      added: string;
      newStock: string;
      balanceNote: string;
      ref: string;
    };
    done: string;
  };

  // ── Validation Errors ─────────────────────────────────────────
  validation: {
    chooseCustomer: string;
    addOneProduct: string;
    chooseProduct: string;
    productNotFound: string;
    enterCartons: string;
    cartonsWholeNumber: string;
    insufficientStock: (available: number) => string;
    priceNegative: string;
    amountPaidNegative: string;
    amountPaidExceedsTotal: (paid: number, total: number) => string;
    choosePaymentMethod: string;
    noOutstandingBalance: string;
    enterPaymentAmount: string;
    paymentExceedsBalance: (balance: number) => string;
    costNegative: string;
    unauthorized: string;
  };

  // ── Common ────────────────────────────────────────────────────
  common: {
    cancel: string;
    save: string;
    close: string;
    search: string;
    optional: string;
    required: string;
    etb: string;
    cartons: string;
    language: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH
// ─────────────────────────────────────────────────────────────────────────────
export const en: Translations = {
  nav: {
    home: 'Home',
    stock: 'Stock',
    customers: 'Customers',
    reports: 'Reports',
    activity: 'Activity',
    more: 'More',
    recordAction: 'New Action',
  },
  sidebar: {
    tagline: 'Distribution Ledger',
    manager: 'Manager',
    warehouse: 'Warehouse',
    quickAction: 'New Action',
    dashboard: 'Home',
    stock: 'Stock',
    customers: 'Customers',
    reports: 'Reports',
    activity: 'Activity',
    more: 'More',
  },
  dashboard: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    subtitleManager: "Here's what's happening with your business today.",
    subtitleWarehouse: "Here's today's stock and dispatch overview.",
    warehouseRestriction: 'Warehouse View',
    warehouseRestrictionNote:
      'Financial details (stock value & customer balances) are only visible to the manager.',
    totalStock: 'Total Stock Value',
    totalStockSub: 'Estimated wholesale value',
    amountOwedTotal: 'Total Owed by Customers',
    amountOwedTotalSub: 'Sum of all customer balances',
    inStock: 'In Stock',
    inStockSub: 'Ready in warehouse',
    comingIn: 'Coming In',
    comingInSub: 'From purchases',
    sold: 'Sold',
    soldSub: 'Dispatched to customers',
    lowStock: 'Low Stock',
    lowStockSub: 'Needs restocking',
    recentActivity: 'Recent Activity',
    viewAll: 'View all',
    cartons: 'cartons',
    items: 'items',
    purchase: 'Added',
    sale: 'Sold',
  },
  warehouse: {
    title: 'Warehouse',
    subtitle: 'Physical stock movement & dispatch activity',
    totalItems: 'Total Stock',
    comingIn: 'Coming In',
    sold: 'Sold',
    recentDispatches: 'Recent Dispatches',
    logDispatch: 'Log Activity',
  },
  inventory: {
    title: 'Stock',
    subtitle: 'Track and manage physical stock in cartons',
    searchPlaceholder: 'Search by product name or SKU…',
    addProduct: 'New Product',
    filterAll: 'All',
    filterInStock: 'In Stock',
    filterLowStock: 'Low Stock',
    filterOutOfStock: 'Out of Stock',
    noProductsFound: 'No products found',
    noProductsFoundSub: 'Try a different product name or SKU',
    cartons: 'cartons',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    backToStock: 'Back to Stock',
    currentStock: 'In Stock',
    minStock: 'Min. Stock',
    piecesPerCarton: 'Pieces / Carton',
    category: 'Category',
    unit: 'Unit',
    sellingPrice: 'Selling Price / Carton',
    costPrice: 'Cost Price / Carton',
    addStock: 'Add Stock',
  },
  customers: {
    title: 'Customers',
    subtitle: 'Customer accounts and payment history',
    searchPlaceholder: 'Search by name, phone, or location…',
    filterWithBalance: 'Owes Money',
    noCustomersFound: 'No customers found',
    noCustomersFoundSub: 'Try a different name or phone number',
    transactionsCount: 'transactions',
    amountOwed: 'Owes',
    totalSales: 'Total Sales',
    allCustomers: 'All Customers',
    outstanding: 'Owes',
    settled: 'Settled',
  },
  ledger: {
    outstanding: 'Amount Owed',
    totalSales: 'Total Sales',
    totalPaid: 'Paid',
    amountOwed: 'Still Owes',
    recordPayment: 'Customer Paid',
    newSale: 'Sell Products',
    transactions: 'Activity',
    accountSummary: 'Summary',
    noTransactions: 'No transactions yet',
    backToCustomers: 'All Customers',
    saleType: 'Sale',
    paymentType: 'Payment',
    adjustmentType: 'Adjustment',
    runningBalance: 'Balance',
    settled: 'Settled',
  },
  reports: {
    title: 'Reports',
    subtitle: 'Business summaries and financial overview',
    totalSales: 'Total Sales',
    totalPaid: 'Total Paid',
    totalOwed: 'Total Owed',
    topCustomers: 'Top Customers (Amount Owed)',
    topStock: 'Stock Holdings',
    cartons: 'cartons',
    viewAll: 'View all',
  },
  quickAction: {
    title: 'What do you want to do?',
    subtitle: 'Choose a business action to continue',
    sell: 'Sell Products',
    sellSub: 'Give products to a customer and record the sale',
    addStock: 'Add Stock',
    addStockSub: 'Add cartons received into the warehouse',
    customerPaid: 'Customer Paid',
    customerPaidSub: 'Record money received from a customer',
    newProduct: 'New Product',
    newProductSub: 'Add a new product to StockFlow',
    managerOnly: 'Manager only',
  },
  sale: {
    title: 'Sell Products',
    subtitle: 'Record products given to a customer',
    chooseCustomer: 'Choose customer',
    currentOwes: 'Currently owes',
    products: 'Products',
    addProduct: 'Add product',
    item: 'Item',
    howManyCartons: 'How many cartons?',
    pricePerCarton: 'Price per carton (ETB)',
    lineSubtotal: 'Subtotal',
    totalSale: 'Total Amount',
    paymentTerms: 'Payment',
    paidInFull: 'Paid in Full',
    partial: 'Partial',
    fullCredit: 'Full Credit',
    amountPaid: 'Amount paid (ETB)',
    paymentMethod: 'How did they pay?',
    stillOwes: 'Still Owes',
    notes: 'Notes (optional)',
    notesPlaceholder: 'e.g. Delivery note no., truck number…',
    submit: 'Save Sale',
    submitting: 'Saving…',
    etb: 'ETB',
  },
  payment: {
    title: 'Customer Paid',
    subtitle: 'Record money received from a customer',
    chooseCustomer: 'Choose customer',
    currentOwes: 'Currently owes',
    amountPaid: 'Amount received (ETB)',
    paymentMethod: 'How did they pay?',
    referenceNo: 'Receipt or reference no. (optional)',
    referencePlaceholder: 'e.g. Telebirr TRX123456 or bank slip #',
    newBalance: 'New balance after payment',
    submit: 'Save Payment',
    submitting: 'Saving…',
    etb: 'ETB',
  },
  purchase: {
    title: 'Add Stock',
    subtitle: 'Add cartons received into the warehouse',
    chooseProduct: 'Choose product',
    currentStock: 'In stock now',
    howManyCartons: 'How many cartons received?',
    costPerCarton: 'Cost per carton (ETB)',
    totalCost: 'Total Purchase Cost',
    supplierNote: 'Supplier / source note (optional)',
    supplierPlaceholder: 'e.g. Factory Import Container #8',
    submit: 'Add to Stock',
    submitting: 'Saving…',
    etb: 'ETB',
  },
  addProduct: {
    title: 'New Product',
    subtitle: 'Add a new product to the catalog',
    comingSoon: 'Coming Soon',
    comingSoonDetail:
      'New Product form will support: product name, SKU, category, starting stock, selling price per carton, and pieces per carton.',
    gotIt: 'Got it',
  },
  success: {
    sale: {
      title: 'Sale Saved',
      customer: 'Customer',
      items: 'Items sold',
      total: 'Total amount',
      paid: 'Paid',
      stillOwes: 'Still owes',
      stockLeft: 'Stock left',
      ref: 'Reference',
    },
    payment: {
      title: 'Payment Saved',
      customerPaid: 'Amount received',
      stillOwes: 'Customer still owes',
      stockNote: 'Stock was not affected.',
      ref: 'Reference',
    },
    purchase: {
      title: 'Stock Added',
      added: 'Cartons added',
      newStock: 'New stock level',
      balanceNote: 'Customer balances were not affected.',
      ref: 'Reference',
    },
    done: 'Done',
  },
  validation: {
    chooseCustomer: 'Please choose a customer.',
    addOneProduct: 'Please add at least one product.',
    chooseProduct: 'Please choose a product.',
    productNotFound: 'This product could not be found in the catalog.',
    enterCartons: 'Enter the number of cartons.',
    cartonsWholeNumber: 'Cartons must be a whole number.',
    insufficientStock: (available) => `Only ${available} cartons are available.`,
    priceNegative: 'Price cannot be less than 0.',
    amountPaidNegative: 'Amount paid cannot be less than 0.',
    amountPaidExceedsTotal: (paid, total) =>
      `Amount paid (${paid.toLocaleString()} ETB) is more than the sale total (${total.toLocaleString()} ETB).`,
    choosePaymentMethod: 'Please choose how the customer paid.',
    noOutstandingBalance: 'This customer has no balance to pay.',
    enterPaymentAmount: 'Enter how much the customer paid.',
    paymentExceedsBalance: (balance) =>
      `The customer only owes ${balance.toLocaleString()} ETB.`,
    costNegative: 'Cost cannot be less than 0.',
    unauthorized: 'Only the manager can perform this action.',
  },
  common: {
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    search: 'Search',
    optional: 'optional',
    required: 'required',
    etb: 'ETB',
    cartons: 'cartons',
    language: 'Language',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AMHARIC (አማርኛ)
// Natural, everyday Amharic for an Ethiopian business / warehouse environment.
// ─────────────────────────────────────────────────────────────────────────────
export const am: Translations = {
  nav: {
    home: 'መነሻ',
    stock: 'እቃ',
    customers: 'ደንበኞች',
    reports: 'ሪፖርት',
    activity: 'እንቅስቃሴ',
    more: 'ተጨማሪ',
    recordAction: 'አዲስ',
  },
  sidebar: {
    tagline: 'የስርጭት ደብተር',
    manager: 'ሥራ አስኪያጅ',
    warehouse: 'መጋዘን',
    quickAction: 'አዲስ',
    dashboard: 'መነሻ',
    stock: 'እቃ',
    customers: 'ደንበኞች',
    reports: 'ሪፖርት',
    activity: 'እንቅስቃሴ',
    more: 'ተጨማሪ',
  },
  dashboard: {
    greetingMorning: 'እንደምን አደሩ',
    greetingAfternoon: 'ደህና ቆዩ',
    greetingEvening: 'እንደምን ዋሉ',
    subtitleManager: 'የዛሬ የንግድ ሁኔታ ይህ ነው።',
    subtitleWarehouse: 'የዛሬ የእቃ አስተዳደር ሁኔታ ይህ ነው።',
    warehouseRestriction: 'የመጋዘን ቅርጽ',
    warehouseRestrictionNote:
      'የሂሳብ ዝርዝሮች (የእቃ ዋጋና የደንበኛ ሂሳብ) ለሥራ አስኪያጅ ብቻ ይታያሉ።',
    totalStock: 'ጠቅላላ የእቃ ዋጋ',
    totalStockSub: 'የጅምላ ዋጋ ግምት',
    amountOwedTotal: 'ደንበኞች የሚከፍሉት ጠቅላላ',
    amountOwedTotalSub: 'ሁሉም የደንበኛ ሂሳቦች ድምር',
    inStock: 'ያለ እቃ',
    inStockSub: 'በመጋዘን ዝግጁ',
    comingIn: 'የሚገባ',
    comingInSub: 'ከግዢ',
    sold: 'የተሸጠ',
    soldSub: 'ለደንበኞች የተላከ',
    lowStock: 'ያነሰ እቃ',
    lowStockSub: 'እንደገና ይሙሉ',
    recentActivity: 'የቅርብ ጊዜ እንቅስቃሴ',
    viewAll: 'ሁሉ ይመልከቱ',
    cartons: 'ካርቶን',
    items: 'ዓይነት',
    purchase: 'ገብቷል',
    sale: 'ወጥቷል',
  },
  warehouse: {
    title: 'መጋዘን',
    subtitle: 'የእቃ ዝውውርና የላክ እቃ ዝርዝር',
    totalItems: 'ጠቅላላ እቃ',
    comingIn: 'የሚገባ',
    sold: 'የወጣ',
    recentDispatches: 'ቅርብ ጊዜ ላኮች',
    logDispatch: 'እቃ ምዝገባ',
  },
  inventory: {
    title: 'እቃ',
    subtitle: 'የካርቶን እቃ ክምችት አስተዳደር',
    searchPlaceholder: 'እቃ ይፈልጉ…',
    addProduct: 'አዲስ እቃ',
    filterAll: 'ሁሉም',
    filterInStock: 'ያለ እቃ',
    filterLowStock: 'ያነሰ',
    filterOutOfStock: 'አልቋል',
    noProductsFound: 'እቃ አልተገኘም',
    noProductsFoundSub: 'ሌላ ስም ወይም ኮድ ሞክሩ',
    cartons: 'ካርቶን',
    inStock: 'ያለ እቃ',
    lowStock: 'ያነሰ',
    outOfStock: 'አልቋል',
    backToStock: 'ወደ እቃ ዝርዝር',
    currentStock: 'ያለ ብዛት',
    minStock: 'ዝቅተኛ ብዛት',
    piecesPerCarton: 'ፕስ / ካርቶን',
    category: 'ዓይነት',
    unit: 'ክፍል',
    sellingPrice: 'የሽያጭ ዋጋ / ካርቶን',
    costPrice: 'የዋጋ ወጪ / ካርቶን',
    addStock: 'እቃ ጨምር',
  },
  customers: {
    title: 'ደንበኞች',
    subtitle: 'የደንበኛ ሂሳቦችና ክፍያ ታሪክ',
    searchPlaceholder: 'ደንበኛ ፈልጉ…',
    filterWithBalance: 'ሂሳብ ያላቸው',
    noCustomersFound: 'ደንበኛ አልተገኘም',
    noCustomersFoundSub: 'ሌላ ስም ወይም ስልክ ሞክሩ',
    transactionsCount: 'ግብይቶች',
    amountOwed: 'የሚከፍለው',
    totalSales: 'ጠቅላላ ሽያጭ',
    allCustomers: 'ሁሉም ደንበኞች',
    outstanding: 'ሂሳብ',
    settled: 'ወረቀት ጸዳ',
  },
  ledger: {
    outstanding: 'የሚከፍለው',
    totalSales: 'ጠቅላላ ሽያጭ',
    totalPaid: 'ከፍሏል',
    amountOwed: 'አሁንም ሂሳብ',
    recordPayment: 'ደንበኛ ከፈለ',
    newSale: 'ሸጥ',
    transactions: 'ታሪክ',
    accountSummary: 'ማጠቃለያ',
    noTransactions: 'ምንም ግብይት የለም',
    backToCustomers: 'ደንበኞች',
    saleType: 'ሽያጭ',
    paymentType: 'ክፍያ',
    adjustmentType: 'ማስተካከያ',
    runningBalance: 'ሂሳብ',
    settled: 'ጸዳ',
  },
  reports: {
    title: 'ሪፖርት',
    subtitle: 'የንግድ ሂሳብ ማጠቃለያ',
    totalSales: 'ጠቅላላ ሽያጭ',
    totalPaid: 'ጠቅላላ ክፍያ',
    totalOwed: 'ጠቅላላ ሂሳብ',
    topCustomers: 'ከፍተኛ ሂሳብ ያላቸው ደንበኞች',
    topStock: 'የእቃ ክምችት',
    cartons: 'ካርቶን',
    viewAll: 'ሁሉ ይመልከቱ',
  },
  quickAction: {
    title: 'ምን ማድረግ ይፈልጋሉ?',
    subtitle: 'ማድረግ የሚፈልጉትን ዓይነት ይምረጡ',
    sell: 'ሸጥ',
    sellSub: 'ለደንበኛ እቃ ስጥና ሽያጩን ምዝግብ',
    addStock: 'እቃ ጨምር',
    addStockSub: 'የደረሰ ካርቶን ወደ መጋዘን ጨምር',
    customerPaid: 'ደንበኛ ከፈለ',
    customerPaidSub: 'ደንበኛ የከፈለ ገንዘብ ምዝገባ',
    newProduct: 'አዲስ እቃ',
    newProductSub: 'አዲስ ዓይነት እቃ ወደ ሲስተም ጨምር',
    managerOnly: 'ሥራ አስኪያጅ ብቻ',
  },
  sale: {
    title: 'ሽያጭ',
    subtitle: 'ለደንበኛ እቃ ስጥና ሽያጩን ምዝገባ',
    chooseCustomer: 'ደንበኛ ምረጥ',
    currentOwes: 'አሁን ሂሳቡ',
    products: 'እቃዎች',
    addProduct: 'እቃ ጨምር',
    item: 'ዓይነት',
    howManyCartons: 'ስንት ካርቶን?',
    pricePerCarton: 'የካርቶን ዋጋ (ብር)',
    lineSubtotal: 'ድምር',
    totalSale: 'ጠቅላላ',
    paymentTerms: 'ክፍያ',
    paidInFull: 'ሙሉ ከፈለ',
    partial: 'ከፊል',
    fullCredit: 'ሙሉ ሂሳብ',
    amountPaid: 'ያከፈለው ብር',
    paymentMethod: 'እንዴት ከፈለ?',
    stillOwes: 'አሁንም ሂሳብ',
    notes: 'ማስታወሻ (አስፈላጊ ካልሆነ ትቶ ይሄ)',
    notesPlaceholder: 'ለምሳሌ፦ ደረሰኝ ቁጥር፣ ተሽከርካሪ…',
    submit: 'ሽያጩን አስቀምጥ',
    submitting: 'በሂደት ላይ…',
    etb: 'ብር',
  },
  payment: {
    title: 'ደንበኛ ከፈለ',
    subtitle: 'ደንበኛ የከፈለ ገንዘብ ምዝገባ',
    chooseCustomer: 'ደንበኛ ምረጥ',
    currentOwes: 'አሁን ሂሳቡ',
    amountPaid: 'የከፈለው ብር',
    paymentMethod: 'እንዴት ከፈለ?',
    referenceNo: 'ደረሰኝ ወይም ማጣቀሻ ቁጥር (አስፈላጊ ካልሆነ)',
    referencePlaceholder: 'ለምሳሌ፦ Telebirr TRX123456 ወይም ባንክ ደረሰኝ',
    newBalance: 'ከዚህ ክፍያ በኋላ ሂሳብ',
    submit: 'ክፍያ አስቀምጥ',
    submitting: 'በሂደት ላይ…',
    etb: 'ብር',
  },
  purchase: {
    title: 'እቃ ጨምር',
    subtitle: 'የደረሰ ካርቶን ወደ መጋዘን ጨምር',
    chooseProduct: 'እቃ ምረጥ',
    currentStock: 'አሁን ያለ ብዛት',
    howManyCartons: 'ስንት ካርቶን ደረሰ?',
    costPerCarton: 'የካርቶን ወጪ (ብር)',
    totalCost: 'ጠቅላላ ወጪ',
    supplierNote: 'አቅራቢ / ምንጭ ማስታወሻ (አስፈላጊ ካልሆነ)',
    supplierPlaceholder: 'ለምሳሌ፦ Container #8',
    submit: 'እቃ ጨምር',
    submitting: 'በሂደት ላይ…',
    etb: 'ብር',
  },
  addProduct: {
    title: 'አዲስ እቃ',
    subtitle: 'አዲስ ዓይነት እቃ ወደ ካታሎግ ጨምር',
    comingSoon: 'በቅርቡ ይመጣል',
    comingSoonDetail:
      'አዲስ እቃ ፎርም ሲቀርብ፦ ስም፣ ኮድ፣ ዓይነት፣ የጀምር ብዛት፣ የሽያጭ ዋጋ፣ ፕስ በካርቶን ይካተታሉ።',
    gotIt: 'ገባኝ',
  },
  success: {
    sale: {
      title: 'ሽያጩ ተቀምጧል',
      customer: 'ደንበኛ',
      items: 'የተሸጠ እቃ',
      total: 'ጠቅላላ',
      paid: 'ከፍሏል',
      stillOwes: 'አሁንም ሂሳብ',
      stockLeft: 'የቀረ እቃ',
      ref: 'ቁጥር',
    },
    payment: {
      title: 'ክፍያ ተቀምጧል',
      customerPaid: 'የከፈለው',
      stillOwes: 'አሁንም ሂሳቡ',
      stockNote: 'የእቃ ክምችት አልተቀየረም።',
      ref: 'ቁጥር',
    },
    purchase: {
      title: 'እቃ ተጨምሯል',
      added: 'የተጨመረ ካርቶን',
      newStock: 'አዲስ ድምር',
      balanceNote: 'የደንበኛ ሂሳብ አልተቀየረም።',
      ref: 'ቁጥር',
    },
    done: 'ተጠናቋል',
  },
  validation: {
    chooseCustomer: 'ደንበኛ ይምረጡ።',
    addOneProduct: 'ቢያንስ አንድ እቃ ያክሉ።',
    chooseProduct: 'እቃ ይምረጡ።',
    productNotFound: 'ይህ እቃ በካታሎግ ውስጥ አልተገኘም።',
    enterCartons: 'ስንት ካርቶን እንደሆነ ያስገቡ።',
    cartonsWholeNumber: 'ካርቶን ሙሉ ቁጥር መሆን አለበት።',
    insufficientStock: (available) => `${available} ካርቶን ብቻ ይገኛል።`,
    priceNegative: 'ዋጋ ከዜሮ ያነሰ መሆን አይቻልም።',
    amountPaidNegative: 'ክፍያ ከዜሮ ያነሰ መሆን አይቻልም።',
    amountPaidExceedsTotal: (paid, total) =>
      `${paid.toLocaleString()} ብር ከሽያጭ ጠቅላላ ${total.toLocaleString()} ብር ይበልጣል።`,
    choosePaymentMethod: 'ደንበኛ እንዴት እንደከፈለ ይምረጡ።',
    noOutstandingBalance: 'ይህ ደንበኛ ሂሳብ የለበትም።',
    enterPaymentAmount: 'ደንበኛ ስንት እንደከፈለ ያስገቡ።',
    paymentExceedsBalance: (balance) =>
      `ደንበኛ ${balance.toLocaleString()} ብር ብቻ ሂሳብ አለበት።`,
    costNegative: 'ወጪ ከዜሮ ያነሰ መሆን አይቻልም።',
    unauthorized: 'ይህን ድርጊት ሥራ አስኪያጅ ብቻ ማድረግ ይችላል።',
  },
  common: {
    cancel: 'ሰርዝ',
    save: 'አስቀምጥ',
    close: 'ዝጋ',
    search: 'ፈልግ',
    optional: 'አስፈላጊ ካልሆነ',
    required: 'ያስፈልጋል',
    etb: 'ብር',
    cartons: 'ካርቶን',
    language: 'ቋንቋ',
  },
};

export const translations: Record<Language, Translations> = { en, am };
