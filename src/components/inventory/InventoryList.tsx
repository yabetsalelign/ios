'use client';

import React, { useState, useMemo } from 'react';
import { Search, ScanBarcode, ArrowLeft, Plus, X, Layers } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function InventoryList() {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    setActiveModal,
    setPreselectedProductId,
  } = useStockFlow();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Filter products by search query and stock status
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'in_stock') {
        return p.currentStockCartons > p.lowStockThresholdCartons;
      }
      if (filterStatus === 'low_stock') {
        return p.currentStockCartons > 0 && p.currentStockCartons <= p.lowStockThresholdCartons;
      }
      if (filterStatus === 'out_of_stock') {
        return p.currentStockCartons === 0;
      }
      return true;
    });
  }, [products, searchQuery, filterStatus]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.inventory.title}</h1>
          <p className="text-xs text-slate-500">{t.inventory.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveModal('add_product');
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.inventory.addProduct}</span>
        </button>
      </div>

      {/* Search Bar with Barcode Scan Affordance */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.inventory.searchPlaceholder}
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          aria-label="Scan barcode or QR"
          className="w-10 h-10 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-2xs flex-shrink-0"
        >
          <ScanBarcode className="w-5 h-5" />
        </button>
      </div>

      {/* Barcode Scanner Modal Simulation */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900">Scan Barcode / QR</h3>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                aria-label="Close scanner"
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-48 h-48 mx-auto my-3 border-2 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center bg-blue-50/40 relative overflow-hidden">
              <ScanBarcode className="w-12 h-12 text-blue-500 animate-pulse" />
              <div className="w-full h-0.5 bg-blue-500 absolute top-1/2 animate-bounce" />
              <p className="text-[11px] text-blue-700 mt-2 font-medium">Position code in frame</p>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Camera scanner ready. Scan any warehouse carton code to jump directly to product details.
            </p>
            <button
              type="button"
              onClick={() => setIsScannerOpen(false)}
              className="mt-4 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {t.inventory.filterAll}
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('in_stock')}
          className={`px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 ${
            filterStatus === 'in_stock'
              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {t.inventory.filterInStock}
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('low_stock')}
          className={`px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 ${
            filterStatus === 'low_stock'
              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {t.inventory.filterLowStock}
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('out_of_stock')}
          className={`px-3.5 py-1.5 rounded-full transition-all flex-shrink-0 ${
            filterStatus === 'out_of_stock'
              ? 'bg-slate-900 text-white font-semibold shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {t.inventory.filterOutOfStock}
        </button>
      </div>

      {/* Products List */}
      <div className="space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">{t.inventory.noProductsFound}</p>
            <p className="text-xs text-slate-400 mt-1">{t.inventory.noProductsFoundSub}</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isLowStock =
              product.currentStockCartons > 0 &&
              product.currentStockCartons <= product.lowStockThresholdCartons;
            const isOutOfStock = product.currentStockCartons === 0;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 group-hover:scale-105 transition-transform">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">SKU: {product.sku}</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {product.currentStockCartons}{' '}
                      <span className="font-normal text-slate-500">{t.inventory.cartons}</span>
                    </p>
                  </div>
                </div>

                {/* Stock Status Pill */}
                <div className="flex-shrink-0 text-right">
                  {isOutOfStock ? (
                    <span className="inline-block text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-full">
                      {t.inventory.outOfStock}
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                      {t.inventory.lowStock}
                    </span>
                  ) : (
                    <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                      {t.inventory.inStock}
                    </span>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">
                    {product.sellingPricePerCarton.toLocaleString()} ETB / ctn
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Product Detail Modal / Sheet */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedProductId(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.inventory.backToStock}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductId(null)}
                aria-label="Close details"
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Hero */}
            <div className="mt-4 text-center">
              <div className="w-32 h-32 mx-auto rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 shadow-xs mb-3">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{selectedProduct.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {selectedProduct.sku}</p>

              <div className="mt-2">
                {selectedProduct.currentStockCartons === 0 ? (
                  <span className="inline-block text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full">
                    {t.inventory.outOfStock}
                  </span>
                ) : selectedProduct.currentStockCartons <= selectedProduct.lowStockThresholdCartons ? (
                  <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                    {t.inventory.lowStock}
                  </span>
                ) : (
                  <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                    {t.inventory.inStock}
                  </span>
                )}
              </div>
            </div>

            {/* 3 Metric Summary Row (Current Stock | Min Stock | Pieces/Carton) */}
            <div className="grid grid-cols-3 gap-2.5 my-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900 font-mono">{selectedProduct.currentStockCartons}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{t.inventory.currentStock}</p>
                <p className="text-[9px] text-slate-400">{t.inventory.cartons}</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-lg font-bold text-slate-900 font-mono">{selectedProduct.lowStockThresholdCartons}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{t.inventory.minStock}</p>
                <p className="text-[9px] text-slate-400">{t.inventory.cartons}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 font-mono">{selectedProduct.piecesPerCarton || 24}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{t.inventory.piecesPerCarton}</p>
                <p className="text-[9px] text-slate-400">metadata</p>
              </div>
            </div>

            {/* Product Specifications Grid */}
            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.inventory.category}</span>
                <span className="font-semibold text-slate-800">{selectedProduct.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.inventory.unit}</span>
                <span className="font-semibold text-slate-800 uppercase">{t.inventory.cartons}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.inventory.sellingPrice}</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedProduct.sellingPricePerCarton.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">{t.inventory.costPrice}</span>
                <span className="font-medium text-slate-700 font-mono">
                  {selectedProduct.costPerCarton.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Action Button: Record Purchase */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setPreselectedProductId(selectedProduct.id);
                  setSelectedProductId(null);
                  setActiveModal('purchase');
                }}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-transform active:scale-[0.99] shadow-sm"
              >
                {t.inventory.addStock}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
