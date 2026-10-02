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
    appearance: string;
    light: string;
    dark: string;
    system: string;
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
    editProduct: string;
    barcode: string;
    description: string;
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
    searchCustomer: string;
    addCustomer: string;
    searchProduct: string;
    inStock: string;
    price: string;
    outOfStock: string;
    noCustomersFound: string;
    noProductsFound: string;
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
    noDebtNotice: string;
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

  // ── Add Product / Edit Product ────────────────────────────────
  addProduct: {
    title: string;
    subtitle: string;
    editTitle: string;
    editSubtitle: string;
    name: string;
    namePlaceholder: string;
    sku: string;
    skuPlaceholder: string;
    barcode: string;
    barcodePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    category: string;
    categoryPlaceholder: string;
    photo: string;
    uploadPhoto: string;
    changePhoto: string;
    piecesPerCarton: string;
    sellingPrice: string;
    costPrice: string;
    lowStockThreshold: string;
    unitCarton: string;
    moreDetails: string;
    lessDetails: string;
    submit: string;
    submitEdit: string;
    submitting: string;
    cancel: string;
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
    productNameRequired: string;
    skuRequired: string;
    skuDuplicate: string;
    barcodeDuplicate: string;
    piecesPositiveInteger: string;
    thresholdNonNegativeInteger: string;
    saleTotalZero: string;
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
    noCustomersYet: string;
    addFirstCustomerHint: string;
    noProductsYet: string;
    addFirstProductHint: string;
    noProductsInStock: string;
    addStockBeforeSale: string;
    completeSaleDetails: string;
    selectProductAndQuantity: string;
    stockAfter: string;
    askManagerToAddCustomer: string;
    askManagerToAddProduct: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH
// ─────────────────────────────────────────────────────────────────────────────
export const en: Translations = {
  auth: {
    title: 'Sign in to StockFlow',
    subtitle: 'Sign in to manage products, stock, customers, and sales.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    managerRole: 'Manager',
    warehouseRole: 'Warehouse',
    managerDesc: 'Manage products, sales, customer balances, and reports.',
    warehouseDesc: 'Manage stock, receive deliveries, and record sales.',
    quickDemo: 'Demo accounts',
    fillManager: 'Manager (Alex Morgan)',
    fillWarehouse: 'Warehouse (Dawit Haile)',
    loginAs: 'Sign in as',
    productLine: 'Inventory',
    footer: 'StockFlow — Stock and sales',
  },
  profile: {
    title: 'Profile & Settings',
    subtitle: 'Your account and app settings',
    roleLabel: 'Current Role',
    permissions: 'Your access',
    managerBadge: 'Manager',
    warehouseBadge: 'Warehouse',
    managerScope: 'Full access to products, sales, customer balances, and reports.',
    warehouseScope: 'Manage stock, receive deliveries, and record sales.',
    language: 'Language',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    currency: 'Currency',
    offlineStatus: 'Data Sync',
    ready: 'Connected & Synced',
    logout: 'Sign out',
    switchRole: 'Switch Role Experience',
    close: 'Close',
    systemPreferences: 'Business Settings',
    trackingUnit: 'Stock Unit',
    trackingUnitValue: 'Cartons',
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
    warehouseRestriction: 'Warehouse access',
    warehouseRestrictionNote:
      'Only the manager can see stock value and customer balances.',
    totalStock: 'Total Stock Value',
    totalStockSub: 'Estimated stock value',
    amountOwedTotal: 'Customers Who Owe Money',
    amountOwedTotalSub: 'Total balances due',
    inStock: 'In Stock',
    inStockSub: 'Ready in warehouse',
    comingIn: 'Coming In',
    comingInSub: 'From stock added',
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
    subtitle: 'Stock changes and deliveries',
    totalItems: 'Total Stock',
    comingIn: 'Coming In',
    sold: 'Sold',
    recentActivity: 'Recent stock changes',
    logActivity: 'Record stock change',
  },
  inventory: {
    title: 'Stock',
    subtitle: 'Manage products and carton counts',
    searchPlaceholder: 'Search by product name or code…',
    addProduct: 'New Product',
    filterAll: 'All',
    filterInStock: 'In Stock',
    filterLowStock: 'Low Stock',
    filterOutOfStock: 'Out of Stock',
    noProductsFound: 'No products found',
    noProductsFoundSub: 'Try another name or product code',
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
    editProduct: 'Edit Product',
    barcode: 'Barcode',
    description: 'Description',
    scanTitle: 'Scan barcode',
    scanHint: 'Place a barcode in the frame to find the product.',
    scanDone: 'Done',
    metadata: 'Info',
    perCarton: '/ ctn',
  },
  customers: {
    title: 'Customers',
    subtitle: 'Customers and payment history',
    searchPlaceholder: 'Search by name, phone, or location…',
    filterWithBalance: 'Balance due',
    noCustomersFound: 'No customers found',
    noCustomersFoundSub: 'Try a different name or phone number',
    transactionsCount: 'transactions',
    amountOwed: 'Balance Due',
    totalSales: 'Total Sales',
    allCustomers: 'All Customers',
    outstanding: 'Balance Due',
    settled: 'Settled',
  },
  ledger: {
    outstanding: 'Balance Due',
    totalSales: 'Total Sales',
    totalPaid: 'Paid',
    amountOwed: 'Balance Due',
    recordPayment: 'Record Payment',
    newSale: 'Record Sale',
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
    accountProfile: 'Customer details',
    accountProfileSub: 'Contact details and notes',
    accountName: 'Customer',
    phone: 'Phone',
    address: 'Address',
    notes: 'Notes',
    none: 'None',

  },
  reports: {
    title: 'Reports',
    subtitle: 'Money owed, best-selling products, and low stock',
    totalSales: 'Total Sales',
    totalPaid: 'Total Paid',
    totalOwed: 'Total balance due',
    topCustomers: 'Customers Who Owe Most',
    topStock: 'Most stock',
    cartons: 'cartons',
    viewAll: 'View all',
    customersWhoOwe: 'Customers Who Owe Money',
    stockMovement: 'Stock changes',
    salesSummaries: 'Best-selling products',
    lowStockReorder: 'Low-stock / reorder list',
    totalDispatched: 'Total Outgoing',
    totalReceived: 'Total Incoming',
    netMovement: 'Net Movement',
    cashCollected: 'Payments received',
    creditExtended: 'Credit given',
    reorderNow: 'Add Stock',
    allCustomersSettled: 'No customers owe money.',
    allStockHealthy: 'All products are above the low-stock level.',
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
    sell: 'Record Sale',
    sellSub: 'Sell products to a customer',
    addStock: 'Add Stock',
    addStockSub: 'Add received cartons to stock',
    customerPaid: 'Record Payment',
    customerPaidSub: 'Record money received from a customer',
    newProduct: 'New Product',
    newProductSub: 'Add a new product to StockFlow',
    managerOnly: 'Manager only',
  },
  sale: {
    title: 'Record Sale',
    subtitle: 'Add products sold to a customer',
    chooseCustomer: 'Choose customer',
    currentOwes: 'Balance Due',
    products: 'Products',
    addProduct: 'Add product',
    item: 'Item',
    howManyCartons: 'How many cartons?',
    pricePerCarton: 'Price per carton (ETB)',
    lineSubtotal: 'Subtotal',
    totalSale: 'Total amount',
    paymentTerms: 'Payment',
    paidInFull: 'Paid in Full',
    partial: 'Partial',
    fullCredit: 'Full Credit',
    amountPaid: 'Amount paid (ETB)',
    paymentMethod: 'Payment method',
    stillOwes: 'Balance Due',
    notes: 'Notes (optional)',
    notesPlaceholder: 'e.g. Order number or batch note…',
    submit: 'Record Sale',
    submitting: 'Saving…',
    etb: 'ETB',
    searchCustomer: 'Search customer…',
    addCustomer: 'Add Customer',
    searchProduct: 'Search product…',
    inStock: 'In Stock',
    price: 'Price',
    outOfStock: 'Out of stock',
    noCustomersFound: 'No customers found',
    noProductsFound: 'No products found',
  },
  payment: {
    title: 'Record Payment',
    subtitle: 'Add a payment from a customer',
    chooseCustomer: 'Choose customer',
    currentOwes: 'Balance Due',
    amountPaid: 'Amount received (ETB)',
    paymentMethod: 'Payment method',
    referenceNo: 'Receipt or reference number (optional)',
    referencePlaceholder: 'e.g. Telebirr or bank reference',
    newBalance: 'Balance after payment',
    submit: 'Record Payment',
    submitting: 'Saving…',
    etb: 'ETB',
    noDebtNotice: 'This customer has no balance due.',
  },
  purchase: {
    title: 'Add Stock',
    subtitle: 'Add received cartons to stock',
    chooseProduct: 'Choose product',
    currentStock: 'In stock now',
    howManyCartons: 'How many cartons received?',
    costPerCarton: 'Cost per carton (ETB)',
    totalCost: 'Total cost',
    supplierNote: 'Supplier (optional)',
    supplierPlaceholder: 'e.g. Supplier name',
    submit: 'Add Stock',
    submitting: 'Adding stock…',
    etb: 'ETB',
  },
  addProduct: {
    title: 'New Product',
    subtitle: 'Add a product to your stock',
    editTitle: 'Edit Product',
    editSubtitle: 'Update product details',
    name: 'Product name',
    namePlaceholder: 'e.g. Shower Gel 500ml',
    sku: 'Product code (SKU)',
    skuPlaceholder: 'e.g. SH-001',
    barcode: 'Barcode',
    barcodePlaceholder: 'Enter barcode',
    description: 'Description',
    descriptionPlaceholder: 'Size, packaging, or other details…',
    category: 'Category',
    categoryPlaceholder: 'e.g. Cosmetics and personal care',
    photo: 'Product photo',
    uploadPhoto: 'Upload image',
    changePhoto: 'Change image',
    piecesPerCarton: 'Pieces per carton',
    sellingPrice: 'Selling price per carton (ETB)',
    costPrice: 'Cost per carton (ETB)',
    lowStockThreshold: 'Low-stock alert (cartons)',
    unitCarton: 'Stock is counted in cartons.',
    moreDetails: 'More details',
    lessDetails: 'Less detail',
    submit: 'Add Product',
    submitEdit: 'Update Product',
    submitting: 'Saving…',
    cancel: 'Cancel',
    comingSoon: 'Coming Soon',
    comingSoonDetail:
      'Add product details, stock levels, prices, and carton size.',
    gotIt: 'Got it',
  },
  success: {
    sale: {
      title: 'Sale recorded',
      customer: 'Customer',
      items: 'Items sold',
      total: 'Total amount',
      paid: 'Paid',
      stillOwes: 'Balance Due',
      stockLeft: 'Stock left',
      ref: 'Reference',
    },
    payment: {
      title: 'Payment recorded',
      customerPaid: 'Amount received',
      stillOwes: 'Balance Due',
      stockNote: 'Stock was unchanged.',
      ref: 'Reference',
    },
    purchase: {
      title: 'Stock Added',
      added: 'Cartons added',
      newStock: 'New stock level',
      balanceNote: 'Customer balances did not change.',
      ref: 'Reference',
    },
    done: 'Done',
  },
  validation: {
    chooseCustomer: 'Please choose a customer.',
    addOneProduct: 'Please add at least one product.',
    chooseProduct: 'Please choose a product.',
    productNotFound: "We couldn't find that product.",
    enterCartons: 'Enter the number of cartons.',
    cartonsWholeNumber: 'Cartons must be a whole number.',
    insufficientStock: (available) => `Only ${available} cartons are in stock.`,
    priceNegative: 'Price cannot be negative.',
    amountPaidNegative: 'Amount cannot be negative.',
    amountPaidExceedsTotal: (paid, total) =>
      `Amount paid (${paid.toLocaleString()} ETB) is more than the sale total (${total.toLocaleString()} ETB).`,
    choosePaymentMethod: 'Choose a payment method.',
    noOutstandingBalance: 'This customer has no balance to pay.',
    enterPaymentAmount: 'Enter the amount received.',
    paymentExceedsBalance: (balance) =>
      `The customer's balance due is ${balance.toLocaleString()} ETB.`,
    costNegative: 'Cost cannot be negative.',
    unauthorized: 'Only a manager can do this.',
    productNameRequired: 'Enter a product name.',
    skuRequired: 'Enter a product code.',
    skuDuplicate: 'A product with this code already exists.',
    barcodeDuplicate: 'A product with this barcode already exists.',
    piecesPositiveInteger: 'Enter a whole number of pieces greater than 0.',
    thresholdNonNegativeInteger: 'Enter a whole number, 0 or more.',
    saleTotalZero: 'Sale total must be greater than zero ETB.',
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
    tryAgain: 'Try again',
    noData: 'No records yet',
    switch: 'Switch',
    cash: 'Cash',
    telebirr: 'Telebirr',
    bankTransfer: 'Bank Transfer',
    dismiss: 'Dismiss',
    noCustomersYet: 'No customers yet',
    addFirstCustomerHint: 'Add a customer to record a sale or payment.',
    noProductsYet: 'No products yet',
    addFirstProductHint: 'Add a product, then add stock before recording a sale.',
    noProductsInStock: 'No products are in stock.',
    addStockBeforeSale: 'Add stock before recording a sale.',
    completeSaleDetails: 'Choose a customer and product, then enter cartons.',
    selectProductAndQuantity: 'Select a product and enter cartons received.',
    stockAfter: 'After adding',
    askManagerToAddCustomer: 'Ask a manager to add a customer.',
    askManagerToAddProduct: 'Ask a manager to add a product.',
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
    appearance: 'ገጽታ',
    light: 'ብርሃን',
    dark: 'ጨለማ',
    system: 'የመሣሪያው ቅንብር',
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
    editProduct: 'እቃ አስተካክል',
    barcode: 'ባርኮድ',
    description: 'መግለጫ',
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
    colOwes: 'ያልተከፈለ',
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
    currentOwes: 'ያልተከፈለ ሂሳብ',
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
    stillOwes: 'ቀሪ ሂሳብ',
    notes: 'ማስታወሻ (አማራጭ)',
    notesPlaceholder: 'ለምሳሌ፦ የትዕዛዝ ቁጥር ወይም የባች ማስታወሻ',
    submit: 'ሽያጭ አስቀምጥ',
    submitting: 'በማስቀመጥ ላይ…',
    etb: 'ብር',
    searchCustomer: 'ደንበኛ ፈልግ…',
    addCustomer: 'አዲስ ደንበኛ',
    searchProduct: 'ምርት ፈልግ…',
    inStock: 'በስቶክ ያለ',
    price: 'ዋጋ',
    outOfStock: 'ስቶክ አልቋል',
    noCustomersFound: 'ደንበኛ አልተገኘም',
    noProductsFound: 'ምርት አልተገኘም',
  },
  payment: {
    title: 'ደንበኛ ከፈለ',
    subtitle: 'ደንበኛ የከፈለ ገንዘብ ምዝገባ',
    chooseCustomer: 'ደንበኛ ምረጥ',
    currentOwes: 'ያልተከፈለ ሂሳብ',
    amountPaid: 'የከፈለው ብር',
    paymentMethod: 'እንዴት ከፈለ?',
    referenceNo: 'ደረሰኝ ወይም ማጣቀሻ ቁጥር (አስፈላጊ ካልሆነ)',
    referencePlaceholder: 'ለምሳሌ፦ Telebirr TRX123456 ወይም ባንክ ደረሰኝ',
    newBalance: 'ከዚህ ክፍያ በኋላ ሂሳብ',
    submit: 'ክፍያ አስቀምጥ',
    submitting: 'በሂደት ላይ…',
    etb: 'ብር',
    noDebtNotice: 'ይህ ደንበኛ ያለበት ዕዳ 0 ብር ነው። ክፍያ መመዝገብ አይቻልም።',
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
    editTitle: 'እቃ አስተካክል',
    editSubtitle: 'የእቃውን መረጃ ያሻሽሉ',
    name: 'የእቃው ስም',
    namePlaceholder: 'ለምሳሌ፦ ሻወር ጄል 500ml',
    sku: 'SKU (የእቃ መለያ ኮድ)',
    skuPlaceholder: 'ለምሳሌ፦ SH-001',
    barcode: 'ባርኮድ',
    barcodePlaceholder: 'ለምሳሌ፦ 690123456701 (በእጅ አስገባ)',
    description: 'መግለጫ',
    descriptionPlaceholder: 'የእቃው ዝርዝር ሁኔታ፣ ማስታወሻ…',
    category: 'ምድብ',
    categoryPlaceholder: 'ለምሳሌ፦ መዋቢያ ወይም የቤት እቃ',
    photo: 'የእቃው ፎቶ',
    uploadPhoto: 'ፎቶ ጫን',
    changePhoto: 'ፎቶ ቀይር',
    piecesPerCarton: 'ፕስ / ካርቶን (በአንድ ካርቶን)',
    sellingPrice: 'የካርቶን መሸጫ ዋጋ (ብር)',
    costPrice: 'የካርቶን ወጪ (ብር)',
    lowStockThreshold: 'አነስተኛ ክምችት ማስጠንቀቂያ (ካርቶን)',
    unitCarton: 'መለኪያ = ካርቶን (የመጋዘን መደበኛ መለኪያ)',
    moreDetails: 'ተጨማሪ ዝርዝሮች',
    lessDetails: 'ያነሱ ዝርዝሮች',
    submit: 'እቃ መዝግብ',
    submitEdit: 'መረጃ አሻሽል',
    submitting: 'በመመዝገብ ላይ…',
    cancel: 'ሰርዝ',
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
      stillOwes: 'ቀሪ ሂሳብ',
      stockLeft: 'የቀረ እቃ',
      ref: 'ቁጥር',
    },
    payment: {
      title: 'ክፍያ ተቀምጧል',
      customerPaid: 'የከፈለው',
      stillOwes: 'ቀሪ ሂሳብ',
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
    insufficientStock: (available) => `ካለው ክምችት በላይ ነው: ${available} ካርቶን`,
    priceNegative: 'ዋጋ ከዜሮ ያነሰ መሆን አይቻልም።',
    amountPaidNegative: 'ክፍያ ከዜሮ ያነሰ መሆን አይቻልም።',
    amountPaidExceedsTotal: (paid, total) =>
      `${paid.toLocaleString()} ብር ከሽያጭ ጠቅላላ ${total.toLocaleString()} ብር ይበልጣል።`,
    choosePaymentMethod: 'ደንበኛ እንዴት እንደከፈለ ይምረጡ።',
    noOutstandingBalance: 'ይህ ደንበኛ ሂሳብ የለበትም።',
    enterPaymentAmount: 'ደንበኛ ስንት እንደከፈለ ያስገቡ።',
    paymentExceedsBalance: (balance) =>
      `የደንበኛው ያልተከፈለ ሂሳብ ${balance.toLocaleString()} ብር ብቻ ነው።`,
    costNegative: 'ወጪ ከዜሮ ያነሰ መሆን አይቻልም።',
    unauthorized: 'ይህን ድርጊት ሥራ አስኪያጅ ብቻ ማድረግ ይችላል።',
    productNameRequired: 'የእቃ ስም ማስገባት ግዴታ ነው።',
    skuRequired: 'SKU (የእቃ መለያ ኮድ) ማስገባት ግዴታ ነው።',
    skuDuplicate: 'በዚህ SKU የተመዘገበ እቃ አስቀድሞ አለ።',
    barcodeDuplicate: 'በዚህ ባርኮድ የተመዘገበ እቃ አስቀድሞ አለ።',
    piecesPositiveInteger: 'በካርቶን ያለው ፕስ ሙሉ አዎንታዊ ቁጥር መሆን አለበት።',
    thresholdNonNegativeInteger: 'ዝቅተኛ ክምችት ማስጠንቀቂያ 0 ወይም ከዚያ በላይ ሙሉ ቁጥር መሆን አለበት።',
    saleTotalZero: 'የሽያጭ ድምር ከ 0 ብር በላይ መሆን አለበት።',
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
    noCustomersYet: 'ገና ደንበኛ የለም',
    addFirstCustomerHint: 'ሽያጭ ወይም ክፍያ ለመመዝገብ ደንበኛ ያክሉ።',
    noProductsYet: 'ገና ምርት የለም',
    addFirstProductHint: 'ምርት ያክሉ፣ ከዚያ ሽያጭ ከመመዝገብዎ በፊት እቃ ያስገቡ።',
    noProductsInStock: 'በክምችት ውስጥ ምርት የለም።',
    addStockBeforeSale: 'ሽያጭ ከመመዝገብዎ በፊት እቃ ያስገቡ።',
    completeSaleDetails: 'ደንበኛና ምርት ይምረጡ፣ ከዚያ የካርቶን ብዛት ያስገቡ።',
    selectProductAndQuantity: 'ምርት ይምረጡና የገቡትን ካርቶኖች ብዛት ያስገቡ።',
    stockAfter: 'ከጨመሩ በኋላ',
    askManagerToAddCustomer: 'ደንበኛ እንዲጨምር ሥራ አስኪያጅን ይጠይቁ።',
    askManagerToAddProduct: 'ምርት እንዲጨምር ሥራ አስኪያጅን ይጠይቁ።',
  },
};

export const translations: Record<Language, Translations> = { en, am };
