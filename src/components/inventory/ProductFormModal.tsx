'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, PackagePlus, Edit3, Upload, Image as ImageIcon, AlertCircle, Loader2, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { uploadProductImage } from '../../lib/supabase/storage';

export default function ProductFormModal() {
  const {
    activeModal,
    setActiveModal,
    preselectedProductId,
    setPreselectedProductId,
    products,
    saveProduct,
    currentUser,
  } = useStockFlow();
  const { t } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Determine if editing or creating
  const editingProduct = preselectedProductId
    ? products.find((p) => p.id === preselectedProductId)
    : undefined;

  const isEditing = Boolean(editingProduct);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [piecesPerCarton, setPiecesPerCarton] = useState<number | string>(24);
  const [sellingPrice, setSellingPrice] = useState<number | string>('');
  const [costPrice, setCostPrice] = useState<number | string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(10);

  // Collapsible secondary details
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // Interaction State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form when opening modal or changing editing product
  useEffect(() => {
    if (activeModal === 'add_product') {
      if (editingProduct) {
        setName(editingProduct.name || '');
        setSku(editingProduct.sku || '');
        setDescription(editingProduct.description || '');
        setCategory(editingProduct.category || '');
        setImage(editingProduct.image || '');
        setImagePreview(editingProduct.image || '');
        setPiecesPerCarton(editingProduct.piecesPerCarton ?? 24);
        setSellingPrice(editingProduct.sellingPricePerCarton ?? '');
        setCostPrice(editingProduct.costPerCarton ?? '');
        setLowStockThreshold(editingProduct.lowStockThresholdCartons ?? 10);
      } else {
        setName('');
        setSku('');
        setDescription('');
        setCategory('');
        setImage('');
        setImagePreview('');
        setPiecesPerCarton(24);
        setSellingPrice('');
        setCostPrice('');
        setLowStockThreshold(10);
      }
      setSelectedFile(null);
      setErrors({});
    }
  }, [activeModal, editingProduct]);

  if (activeModal !== 'add_product') return null;

  const handleClose = () => {
    setActiveModal(null);
    setPreselectedProductId(null);
    setSelectedFile(null);
    setErrors({});
    setShowMoreDetails(false);
  };

  // Image Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getErrorMessage = (errorKey: string): string => {
    if (errorKey === 'productNameRequired') return t.validation.productNameRequired;
    if (errorKey === 'skuRequired') return t.validation.skuRequired;
    if (errorKey === 'skuDuplicate') return t.validation.skuDuplicate;
    if (errorKey === 'priceNegative') return t.validation.priceNegative;
    if (errorKey === 'costNegative') return t.validation.costNegative;
    if (errorKey === 'piecesPositiveInteger') return t.validation.piecesPositiveInteger;
    if (errorKey === 'thresholdNonNegativeInteger') return t.validation.thresholdNonNegativeInteger;
    return errorKey;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Check manager authorization
    if (currentUser.role !== 'manager') {
      setErrors({ general: t.validation.unauthorized });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    let finalImageUrl = image;

    // If a new image file was selected, upload it
    if (selectedFile) {
      setIsUploadingImage(true);
      const uploadResult = await uploadProductImage(selectedFile, sku || 'PROD');
      setIsUploadingImage(false);

      if (uploadResult.error) {
        setErrors({ image: uploadResult.error });
        setShowMoreDetails(true);
        setIsSubmitting(false);
        return;
      }
      if (uploadResult.url) {
        finalImageUrl = uploadResult.url;
      }
    }

    // Auto-generate SKU if left blank (supports simple flow: Name -> Selling Price -> Cost -> Done)
    let effectiveSku = sku.trim().toUpperCase();
    if (!effectiveSku) {
      const prefix = name
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase() || 'PRD';
      let candidate = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      while (products.some((p) => p.sku === candidate && p.id !== editingProduct?.id)) {
        candidate = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      effectiveSku = candidate;
    }

    const result = await saveProduct(
      {
        name,
        sku: effectiveSku,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        image: finalImageUrl || undefined,
        piecesPerCarton: piecesPerCarton === '' ? undefined : Number(piecesPerCarton),
        sellingPricePerCarton: Number(sellingPrice),
        costPerCarton: Number(costPrice),
        lowStockThresholdCartons: lowStockThreshold === '' ? undefined : Number(lowStockThreshold),
      },
      editingProduct?.id
    );

    setIsSubmitting(false);

    if (result.success) {
      handleClose();
    } else if (result.validationErrors) {
      setErrors(result.validationErrors);
      // Auto-expand More Details if any secondary field has an error
      if (
        result.validationErrors.sku ||
        result.validationErrors.piecesPerCarton ||
        result.validationErrors.lowStockThresholdCartons ||
        result.validationErrors.image
      ) {
        setShowMoreDetails(true);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isEditing ? 'bg-amber-50 text-amber-700' : 'bg-slate-900 text-white'
              }`}
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="product-form-title" className="text-base font-bold text-slate-900 tracking-tight">
                {isEditing ? t.addProduct.editTitle : t.addProduct.title}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isEditing ? t.addProduct.editSubtitle : t.addProduct.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close form"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* General Error Banner */}
          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Primary Core Field 1: Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.addProduct.name} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.addProduct.namePlaceholder}
              className={`w-full bg-slate-50/60 border ${
                errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900/10'
              } rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-slate-900 transition-all`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{getErrorMessage(errors.name)}</p>
            )}
          </div>

          {/* Primary Core Fields 2 & 3: Selling Price & Cost Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.addProduct.sellingPrice} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-slate-50/60 font-mono font-semibold border ${
                    errors.sellingPricePerCarton ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900/10'
                  } rounded-xl pl-3.5 pr-12 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-slate-900 transition-all`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  ETB
                </span>
              </div>
              {errors.sellingPricePerCarton && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{getErrorMessage(errors.sellingPricePerCarton)}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.addProduct.costPrice} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-slate-50/60 font-mono font-semibold border ${
                    errors.costPerCarton ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900/10'
                  } rounded-xl pl-3.5 pr-12 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-slate-900 transition-all`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  ETB
                </span>
              </div>
              {errors.costPerCarton && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{getErrorMessage(errors.costPerCarton)}</p>
              )}
            </div>
          </div>

          {/* More Details Collapsible Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowMoreDetails((prev) => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <span>{showMoreDetails ? t.addProduct.lessDetails : t.addProduct.moreDetails}</span>
              {showMoreDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>

          {/* Secondary Fields (Collapsible) */}
          {showMoreDetails && (
            <div className="space-y-4 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.addProduct.photo}
                </label>
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/90 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>{imagePreview ? t.addProduct.changePhoto : t.addProduct.uploadPhoto}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="sm:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>Take photo</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WebP, up to 5 MB</p>
                  </div>
                </div>
                {errors.image && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.image}</p>
                )}
              </div>

              {/* Product code */}
              <div className="grid grid-cols-1 gap-3">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.addProduct.sku} <span className="text-slate-400 font-normal">({t.common.optional})</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder={t.addProduct.skuPlaceholder}
                    className={`w-full bg-slate-50/60 font-mono font-semibold border ${
                      errors.sku ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900/10'
                    } rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-slate-900 transition-all`}
                  />
                  {errors.sku && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{getErrorMessage(errors.sku)}</p>
                  )}
                </div>

              </div>

              {/* Category & Unit Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.addProduct.category}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t.addProduct.categoryPlaceholder}
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.inventory.unit}
                  </label>
                  <div className="w-full bg-slate-100 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 flex items-center justify-between select-none">
                    <span className="uppercase tracking-wider">CARTON</span>
                    <span className="text-[10px] text-slate-500 font-medium">{t.addProduct.unitCarton}</span>
                  </div>
                </div>
              </div>

              {/* Pieces Per Carton & Low Stock Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.addProduct.piecesPerCarton}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={piecesPerCarton}
                    onChange={(e) => setPiecesPerCarton(e.target.value)}
                    placeholder="24"
                    className={`w-full bg-slate-50/60 font-mono border ${
                      errors.piecesPerCarton ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900/10'
                    } rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-slate-900 transition-all`}
                  />
                  {errors.piecesPerCarton && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{getErrorMessage(errors.piecesPerCarton)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.addProduct.lowStockThreshold}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="10"
                    className={`w-full bg-slate-50/60 font-mono border ${
                      errors.lowStockThresholdCartons ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-slate-900/10'
                    } rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-slate-900 transition-all`}
                  />
                  {errors.lowStockThresholdCartons && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{getErrorMessage(errors.lowStockThresholdCartons)}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.addProduct.description} <span className="text-slate-400 font-normal">({t.common.optional})</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.addProduct.descriptionPlaceholder}
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              {t.addProduct.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.99] shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting || isUploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.addProduct.submitting}</span>
                </>
              ) : (
                <span>{isEditing ? t.addProduct.submitEdit : t.addProduct.submit}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
