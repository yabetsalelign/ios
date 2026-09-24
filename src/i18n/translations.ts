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
  // ── Authentication / Login ────────────────────────────────────
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    signIn: string;
    managerRole: string;
    warehouseRole: string;
    managerDesc: string;
    warehouseDesc: string;
    quickDemo: string;
    fillManager: string;
    fillWarehouse: string;
    loginAs: string;
    productLine: string;
    footer: string;
  };

  // ── Profile & Settings ─────────────────────────────────────────
  profile: {
    title: string;
    subtitle: string;
    roleLabel: string;
    permissions: string;
    managerBadge: string;
    warehouseBadge: string;
    managerScope: string;
    warehouseScope: string;
    language: string;
    currency: string;
    offlineStatus: string;
    ready: string;
    logout: string;
    switchRole: string;
    close: string;
    systemPreferences: string;
    trackingUnit: string;
    trackingUnitValue: string;
    currencyValue: string;
    developerFrame: string;
    previewOn: string;
    previewOff: string;
  };

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
    recentActivity: string;
    logActivity: string;
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
    scanTitle: string;
    scanHint: string;
    scanDone: string;
    metadata: string;
    perCarton: string;
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
    dateRef: string;
    type: string;
    amount: string;
    accountProfile: string;
    accountProfileSub: string;
    accountName: string;
    phone: string;
    address: string;
    notes: string;
    none: string;
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
    customersWhoOwe: string;
    stockMovement: string;
    salesSummaries: string;
    lowStockReorder: string;
    totalDispatched: string;
    totalReceived: string;
    netMovement: string;
    cashCollected: string;
    creditExtended: string;
    reorderNow: string;
    allCustomersSettled: string;
    allStockHealthy: string;
    colCustomer: string;
    colProduct: string;
    colSellPrice: string;
    colStock: string;
    colSold: string;
    colTotalSales: string;
    colOwes: string;
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
    backToStock: string;
    backToCustomers: string;
    backToDashboard: string;
    loading: string;
    errorTitle: string;
    tryAgain: string;
    noData: string;
    switch: string;
    cash: string;
    telebirr: string;
    bankTransfer: string;
    dismiss: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH
// ─────────────────────────────────────────────────────────────────────────────
export const en: Translations = {
  auth: {
    title: 'Sign In to StockFlow',
    subtitle: 'Choose a role or sign in to manage products, stock, customers, and sales.',
    email: 'Email address',
    password: 'Password',
    signIn: 'Sign In',
    managerRole: 'Manager',
    warehouseRole: 'Warehouse Staff',
    managerDesc: 'Full access: sales, customer balances, reports, and inventory.',
    warehouseDesc: 'Stock access: carton counts, receiving, and inventory activity.',
    quickDemo: 'Quick Demo Access',
    fillManager: 'Manager (Alex Morgan)',
    fillWarehouse: 'Warehouse (Dawit Haile)',
    loginAs: 'Log in as',
    productLine: 'Inventory',
    footer: 'StockFlow — Product, inventory, customer, and sales management',
  },
  profile: {
    title: 'Profile & Settings',
    subtitle: 'Account details and system preferences',
    roleLabel: 'Current Role',
    permissions: 'Assigned Permissions',
    managerBadge: 'Manager Account',
    warehouseBadge: 'Warehouse Account',
    managerScope: 'Full access: pricing, customer balances, sales, and reports.',
    warehouseScope: 'Stock work: carton counts, receiving, and inventory activity.',
    language: 'Interface Language',
    currency: 'Currency Standard',
    offlineStatus: 'Sync & Local Storage',
    ready: 'Online & Synchronized',
    logout: 'Sign Out',
    switchRole: 'Switch Role Experience',
    close: 'Close',
    systemPreferences: 'System Preferences',
    trackingUnit: 'Inventory unit',
    trackingUnitValue: 'Cartons (ctn)',
    currencyValue: 'ETB (Ethiopian Birr)',
    developerFrame: 'Developer iPhone Frame',
    previewOn: 'On',
    previewOff: 'Off',
  },
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
    tagline: 'Inventory & Sales',
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
    subtitleWarehouse: "Here's today's stock overview.",
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
    soldSub: 'Sold to customers',
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
    subtitle: 'Stock movements and receiving activity',
    totalItems: 'Total Stock',
    comingIn: 'Coming In',
    sold: 'Sold',
    recentActivity: 'Recent Stock Activity',
    logActivity: 'Record Activity',
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
    scanTitle: 'Scan barcode',
    scanHint: 'Place the product barcode in the frame to open its stock details.',
    scanDone: 'Done',
    metadata: 'info',
    perCarton: '/ ctn',
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
    dateRef: 'Date / Ref',
    type: 'Type',
    amount: 'Amount',
    accountProfile: 'Account profile',
    accountProfileSub: 'Customer contact and notes',
    accountName: 'Account name',
    phone: 'Customer phone',
    address: 'Business address',
    notes: 'Customer notes',
    none: 'None',

  },
  reports: {
    title: 'Reports',
    subtitle: 'Who owes money, best-selling products, and low stock',
    totalSales: 'Total Sales',
    totalPaid: 'Total Paid',
    totalOwed: 'Total Owed',
    topCustomers: 'Top Customers (Amount Owed)',
    topStock: 'Stock Holdings',
    cartons: 'cartons',
    viewAll: 'View all',
    customersWhoOwe: 'Customers Who Owe Money',
    stockMovement: 'Stock Movement Summary',
    salesSummaries: 'Best-selling products',
    lowStockReorder: 'Low-stock / reorder list',
    totalDispatched: 'Total Outgoing',
    totalReceived: 'Total Incoming',
    netMovement: 'Net Movement',
    cashCollected: 'Cash & Electronic Paid',
    creditExtended: 'Credit Extended',
    reorderNow: 'Add Stock',
    allCustomersSettled: 'All customer accounts are fully settled.',
    allStockHealthy: 'All products are above the minimum stock level.',
    colCustomer: 'Customer',
    colProduct: 'Product',
    colSellPrice: 'Sell price',
    colStock: 'Stock',
    colSold: 'Sold',
    colTotalSales: 'Total sales',
    colOwes: 'Owes',
  },
  quickAction: {
    title: 'What do you want to do?',
    subtitle: 'Choose a business action to continue',
    sell: 'Sell Products',
    sellSub: 'Give products to a customer and record the sale',
    addStock: 'Add Stock',
    addStockSub: 'Record cartons received into stock',
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
    notesPlaceholder: 'e.g. Order number or batch note…',
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
    subtitle: 'Record cartons received into stock',
    chooseProduct: 'Choose product',
    currentStock: 'In stock now',
    howManyCartons: 'How many cartons received?',
    costPerCarton: 'Cost per carton (ETB)',
    totalCost: 'Total Purchase Cost',
    supplierNote: 'Supplier / source note (optional)',
    supplierPlaceholder: 'e.g. Factory batch or supplier name',
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
    backToStock: 'Back to Stock',
    backToCustomers: 'Back to Customers',
    backToDashboard: 'Back to Dashboard',
    loading: 'Loading…',
    errorTitle: "Couldn't load content",
    tryAgain: 'Try Again',
    noData: 'No records available',
    switch: 'Switch',
    cash: 'Cash',
    telebirr: 'Telebirr',
    bankTransfer: 'Bank Transfer',
    dismiss: 'Dismiss',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AMHARIC (አማርኛ)
// Natural, everyday Amharic for an Ethiopian business / warehouse environment.
// ─────────────────────────────────────────────────────────────────────────────
export const am: Translations = {
  auth: {
    title: 'ወደ StockFlow ይግቡ',
    subtitle: 'ምርት፣ እቃ፣ ደንበኛና ሽያጭ ለማስተዳደር ሚና ይምረጡ ወይም ይግቡ።',
    email: 'የኢሜይል አድራሻ',
    password: 'የይለፍ ቃል',
    signIn: 'ግባ',
    managerRole: 'ሥራ አስኪያጅ',
    warehouseRole: 'የመጋዘን ሠራተኛ',
    managerDesc: 'ሙሉ አስተዳደር፦ ሽያጭ፣ የደንበኞች ሂሳብ፣ ሪፖርቶችና እቃ ክምችት',
    warehouseDesc: 'የእቃ ሥራ፦ የካርቶን ቆጠራ፣ መቀበልና የእቃ እንቅስቃሴ',
    quickDemo: 'የሙከራ መለያዎች',
    fillManager: 'ሥራ አስኪያጅ (Alex Morgan)',
    fillWarehouse: 'የመጋዘን ሠራተኛ (Dawit Haile)',
    loginAs: 'በዚህ ግባ፦',
    productLine: 'እቃ',
    footer: 'StockFlow — የምርት፣ እቃ፣ ደንበኛና ሽያጭ አስተዳደር',
  },
  profile: {
    title: 'መገለጫና ምርጫዎች',
    subtitle: 'የመለያ ዝርዝር እና የስርዓት ምርጫዎች',
    roleLabel: 'የተመደበ ሚና',
    permissions: 'የተሰጡ ፈቃዶች',
    managerBadge: 'የሥራ አስኪያጅ መለያ',
    warehouseBadge: 'የመጋዘን መለያ',
    managerScope: 'ሙሉ አስተዳደር፦ ዋጋዎች፣ የደንበኛ ሂሳብ፣ ሽያጭና ሪፖርቶች።',
    warehouseScope: 'የእቃ ሥራ፦ የካርቶን ቆጠራ፣ መቀበልና የእቃ እንቅስቃሴ።',
    language: 'የስርዓቱ ቋንቋ',
    currency: 'የገንዘብ ምንዛሬ',
    offlineStatus: 'የማመሳሰል ሁኔታ',
    ready: 'የተገናኘ & ዝግጁ',
    logout: 'ውጣ',
    switchRole: 'ሚና ቀይር',
    close: 'ዝጋ',
    systemPreferences: 'የስርዓት ምርጫዎች',
    trackingUnit: 'የእቃ መለኪያ',
    trackingUnitValue: 'ካርቶን',
    currencyValue: 'ብር (የኢትዮጵያ ብር)',
    developerFrame: 'የገንቢ iPhone ፍሬም',
    previewOn: 'በርቷል',
    previewOff: 'ጠፍቷል',
  },
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
    tagline: 'እቃና ሽያጭ',
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
    soldSub: 'ለደንበኞች የተሸጠ',
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
    subtitle: 'የእቃ ዝውውርና ቀረቤታ እንቅስቃሴ',
    totalItems: 'ጠቅላላ እቃ',
    comingIn: 'የሚገባ',
    sold: 'የወጣ',
    recentActivity: 'ቅርብ ጊዜ የእቃ እንቅስቃሴ',
    logActivity: 'እቃ ምዝገባ',
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
    scanTitle: 'ባርኮድ ይቃኙ',
    scanHint: 'የእቃውን ባርኮድ በፍሬሙ ውስጥ ያስቀምጡ።',
    scanDone: 'ተጠናቋል',
    metadata: 'መረጃ',
    perCarton: '/ ካርቶን',
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
    outstanding: 'የቀረ ዕዳ',
    totalSales: 'ጠቅላላ ሽያጭ',
    totalPaid: 'የተከፈለ',
    amountOwed: 'የሚከፈል',
    recordPayment: 'ክፍያ መመዝገብ',
    newSale: 'አዲስ ሽያጭ',
    transactions: 'ግብይቶች',
    accountSummary: 'የደንበኛ ማጠቃለያ',
    noTransactions: 'እስካሁን ግብይት የለም',
    backToCustomers: 'ሁሉም ደንበኞች',
    saleType: 'ሽያጭ',
    paymentType: 'ክፍያ',
    adjustmentType: 'ማስተካከያ',
    runningBalance: 'ቀሪ ሂሳብ',
    settled: 'ተጠናቋል',
    dateRef: 'ቀን / መለያ',
    type: 'አይነት',
    amount: 'መጠን',
    accountProfile: 'የደንበኛ መረጃ',
    accountProfileSub: 'ስልክ እና ማስታወሻ',
    accountName: 'ስም',
    phone: 'ስልክ',
    address: 'አድራሻ',
    notes: 'ማስታወሻ',
    none: 'የለም',
  },
  reports: {
    title: 'ሪፖርቶች',
    subtitle: 'ዕዳ፣ ምርጥ ሽያጮች እና ዝቅተኛ ስቶክ',
    totalSales: 'ጠቅላላ ሽያጭ',
    totalPaid: 'የተከፈለ',
    totalOwed: 'ጠቅላላ ዕዳ',
    topCustomers: 'ምርጥ ደንበኞች',
    topStock: 'ምርጥ ምርቶች',
    cartons: 'ካርቶኖች',
    viewAll: 'ሁሉን ይመልከቱ',
    customersWhoOwe: 'ዕዳ ያለባቸው ደንበኞች',
    stockMovement: 'የስቶክ እንቅስቃሴ',
    salesSummaries: 'ምርጥ የሚሸጡ ምርቶች',
    lowStockReorder: 'ዝቅተኛ ስቶክ',
    totalDispatched: 'የወጣ',
    totalReceived: 'የገባ',
    netMovement: 'ጠቅላላ እንቅስቃሴ',
    cashCollected: 'ጥሬ እና የኤሌክትሮኒክስ ክፍያ',
    creditExtended: 'የተሰጠ ዕዳ',
    reorderNow: 'ስቶክ ጨምር',
    allCustomersSettled: 'ሁሉም ደንበኞች ክፍያቸውን ጨርሰዋል።',
    allStockHealthy: 'ሁሉም ምርቶች በቂ ስቶክ አላቸው።',
    colCustomer: 'ደንበኛ',
    colProduct: 'ምርት',
    colSellPrice: 'የሽያጭ ዋጋ',
    colStock: 'ስቶክ',
    colSold: 'የተሸጠ',
    colTotalSales: 'ጠቅላላ ሽያጭ',
    colOwes: 'ዕዳ',
  },

  quickAction: {
    title: 'ምን ማድረግ ይፈልጋሉ?',
    subtitle: 'ለመቀጠል አንድ ድርጊት ይምረጡ',
    sell: 'ምርት ሽጥ',
    sellSub: 'ለደንበኛ ምርት ሰጥተው ሽያጩን ይመዝግቡ',
    addStock: 'እቃ ጨምር',
    addStockSub: 'የደረሰ ካርቶን ወደ ስቶክ ይመዝግቡ',
    customerPaid: 'ደንበኛ ከፈለ',
    customerPaidSub: 'ከደንበኛ የተቀበሉትን ገንዘብ ይመዝግቡ',
    newProduct: 'አዲስ ምርት',
    newProductSub: 'አዲስ ምርት ወደ StockFlow ጨምር',
    managerOnly: 'ለሥራ አስኪያጅ ብቻ',
  },

  sale: {
    title: 'ምርት ሽጥ',
    subtitle: 'ለደንበኛ የተሰጠ ምርት ይመዝግቡ',
    chooseCustomer: 'ደንበኛ ምረጥ',
    currentOwes: 'አሁን ያለበት ዕዳ',
    products: 'ምርቶች',
    addProduct: 'ምርት ጨምር',
    item: 'ምርት',
    howManyCartons: 'ስንት ካርቶን?',
    pricePerCarton: 'የካርቶን ዋጋ (ብር)',
    lineSubtotal: 'ንዑስ ድምር',
    totalSale: 'ጠቅላላ ሽያጭ',
    paymentTerms: 'የክፍያ ሁኔታ',
    paidInFull: 'ሙሉ ከፍሏል',
    partial: 'በከፊል',
    fullCredit: 'ሙሉ ዕዳ',
    amountPaid: 'የከፈለው (ብር)',
    paymentMethod: 'እንዴት ከፈለ?',
    stillOwes: 'አሁንም የሚከፍል',
    notes: 'ማስታወሻ (አማራጭ)',
    notesPlaceholder: 'ለምሳሌ፦ የትዕዛዝ ቁጥር ወይም የባች ማስታወሻ',
    submit: 'ሽያጭ አስቀምጥ',
    submitting: 'በማስቀመጥ ላይ…',
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
    optional: 'አማራጭ',
    required: 'አስፈላጊ',
    etb: 'ብር',
    cartons: 'ካርቶን',
    language: 'ቋንቋ',
    backToStock: 'ወደ ስቶክ',
    backToCustomers: 'ወደ ደንበኞች',
    backToDashboard: 'ወደ ዳሽቦርድ',
    loading: 'በመጫን ላይ...',
    errorTitle: 'ስህተት',
    tryAgain: 'እንደገና ሞክር',
    noData: 'መረጃ የለም',
    switch: 'ቀይር',
    cash: 'ጥሬ ገንዘብ',
    telebirr: 'ቴሌብር',
    bankTransfer: 'ባንክ',
    dismiss: 'ዝጋ',
  },
};

export const translations: Record<Language, Translations> = { en, am };
