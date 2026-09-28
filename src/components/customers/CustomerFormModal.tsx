'use client';

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { Customer } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated?: (customer: Customer) => void;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  onCustomerCreated,
}: CustomerFormModalProps) {
  const { saveCustomer } = useStockFlow();
  const { language, t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setErrors({ name: language === 'am' ? 'የደንበኛ ስም ማስገባት ግዴታ ነው።' : 'Customer name is required.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await saveCustomer({
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success && result.customer) {
      if (onCustomerCreated) {
        onCustomerCreated(result.customer);
      }
      handleClose();
    } else if (result.validationErrors) {
      setErrors(result.validationErrors);
    }
  };

  const titleText = language === 'am' ? 'አዲስ ደንበኛ ጨምር' : 'Add New Customer';
  const subtitleText = language === 'am' ? 'አዲስ የደንበኛ መረጃ ይመዝግቡ' : 'Add a new customer to StockFlow';
  const nameLabel = language === 'am' ? 'የደንበኛ ስም' : 'Customer Name';
  const namePlaceholder = language === 'am' ? 'ለምሳሌ፦ መርካቶ ሱፐርማርኬት' : 'e.g. Merkato Supermarket';
  const phoneLabel = language === 'am' ? 'ስልክ ቁጥር' : 'Phone Number';
  const addressLabel = language === 'am' ? 'አድራሻ / ቦታ' : 'Address / Location';
  const addressPlaceholder = language === 'am' ? 'ለምሳሌ፦ መርካቶ፣ አዲስ አበባ' : 'e.g. Merkato, Addis Ababa';
  const notesLabel = language === 'am' ? 'ማስታወሻ (አማራጭ)' : 'Notes (optional)';
  const notesPlaceholder = language === 'am' ? 'ለምሳሌ፦ ሳምንታዊ የብድር ውል' : 'e.g. Weekly credit terms';
  const submitText = language === 'am' ? 'ደንበኛ አስቀምጥ' : 'Save Customer';
  const submittingText = language === 'am' ? 'በማስቀመጥ ላይ…' : 'Saving…';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-form-title"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="customer-form-title" className="text-base font-bold text-slate-900 tracking-tight">
                {titleText}
              </h2>
              <p className="text-[11px] text-slate-500">{subtitleText}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close form"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3.5 flex-1">
          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="customer-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              {nameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              id="customer-name-input"
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium shadow-2xs"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="customer-phone-input" className="block text-xs font-semibold text-slate-700 mb-1">
              {phoneLabel}
            </label>
            <input
              id="customer-phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 9... "
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium shadow-2xs font-mono"
            />
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="customer-address-input" className="block text-xs font-semibold text-slate-700 mb-1">
              {addressLabel}
            </label>
            <input
              id="customer-address-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={addressPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium shadow-2xs"
            />
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="customer-notes-input" className="block text-xs font-semibold text-slate-700 mb-1">
              {notesLabel}
            </label>
            <input
              id="customer-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={notesPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium shadow-2xs"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submittingText}</span>
                </>
              ) : (
                <span>{submitText}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
