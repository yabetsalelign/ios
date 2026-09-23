'use client';

import React, { useState } from 'react';
import { ArrowLeft, Phone, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

interface CustomerLedgerProps {
  customerId: string;
}

export default function CustomerLedger({ customerId }: CustomerLedgerProps) {
  const {
    customers,
    getCustomerLedgerData,
    setSelectedCustomerId,
    setActiveModal,
    setPreselectedCustomerId,
  } = useStockFlow();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'summary'>('transactions');

  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">{t.customers.noCustomersFound}</p>
        <button
          type="button"
          onClick={() => setSelectedCustomerId(null)}
          className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          {t.ledger.backToCustomers}
        </button>
      </div>
    );
  }

  const { entries, summary } = getCustomerLedgerData(customerId);
  const hasDebt = summary.outstandingBalance > 0;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <button
          type="button"
          onClick={() => setSelectedCustomerId(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.ledger.backToCustomers}</span>
        </button>
        <div
          className={`text-right px-2.5 py-1 rounded-xl text-xs font-bold border ${
            hasDebt
              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          }`}
        >
          <span className="text-[10px] block font-medium opacity-80 uppercase tracking-wider">{t.ledger.amountOwed}</span>
          <span className="font-mono">{summary.outstandingBalance.toLocaleString()} ETB</span>
        </div>
      </div>

      {/* Customer Name & Info Card */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{customer.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="font-mono">{customer.phone}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {customer.address}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Total Sales */}
        <div className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-3 text-center shadow-2xs">
          <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">{t.ledger.totalSales}</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 font-mono">
            {summary.totalSales.toLocaleString()}
          </p>
          <p className="text-[9px] font-semibold text-emerald-700">ETB</p>
        </div>

        {/* Total Paid */}
        <div className="bg-[#F0FDF4] border border-slate-200/70 rounded-2xl p-3 text-center shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{t.ledger.totalPaid}</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 font-mono">
            {summary.totalPaid.toLocaleString()}
          </p>
          <p className="text-[9px] font-semibold text-slate-500">ETB</p>
        </div>

        {/* Total Credit / Outstanding */}
        <div className="bg-[#FFF1F2] border border-rose-100 rounded-2xl p-3 text-center shadow-2xs">
          <p className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider">{t.ledger.amountOwed}</p>
          <p className="text-base sm:text-lg font-extrabold text-rose-700 mt-0.5 font-mono">
            {summary.outstandingBalance.toLocaleString()}
          </p>
          <p className="text-[9px] font-semibold text-rose-600">ETB</p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            setPreselectedCustomerId(customerId);
            setActiveModal('payment');
          }}
          className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-[0.99]"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t.ledger.recordPayment}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPreselectedCustomerId(customerId);
            setActiveModal('sale');
          }}
          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-[0.99]"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t.ledger.newSale}</span>
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="bg-slate-200/70 p-1 rounded-xl flex items-center text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('transactions')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeSubTab === 'transactions'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.ledger.transactions}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('summary')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeSubTab === 'summary'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.ledger.accountSummary}
        </button>
      </div>

      {/* Tab 1: Chronological Ledger Entries */}
      {activeSubTab === 'transactions' ? (
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="col-span-3">Date / Ref</span>
            <span className="col-span-2">Type</span>
            <span className="col-span-4 text-right">Amount</span>
            <span className="col-span-3 text-right">{t.ledger.runningBalance}</span>
          </div>

          {/* Ledger Rows */}
          <div className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t.ledger.noTransactions}
              </div>
            ) : (
              entries.map((entry) => {
                const isSale = entry.type === 'Sale';
                const isPayment = entry.type === 'Payment';

                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-12 gap-2 px-3.5 py-3 items-center hover:bg-slate-50/50 transition-colors text-xs"
                  >
                    {/* Date & Ref */}
                    <div className="col-span-3 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{entry.date.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{entry.referenceNumber}</p>
                    </div>

                    {/* Type Pill */}
                    <div className="col-span-2">
                      <span
                        className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSale
                            ? 'bg-blue-50 text-blue-700'
                            : isPayment
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSale ? t.ledger.saleType : isPayment ? t.ledger.paymentType : t.ledger.adjustmentType}
                      </span>
                    </div>

                    {/* Amount (Positive = Sale credit added, Negative = Payment settled) */}
                    <div className="col-span-4 text-right">
                      <p
                        className={`font-bold font-mono ${
                          isPayment
                            ? 'text-emerald-700'
                            : isSale
                            ? 'text-slate-900'
                            : 'text-amber-700'
                        }`}
                      >
                        {isSale ? `+${entry.amount.toLocaleString()}` : `${entry.amount.toLocaleString()}`}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{entry.description}</p>
                    </div>

                    {/* Running Balance */}
                    <div className="col-span-3 text-right">
                      <p className="font-bold text-slate-900 font-mono">
                        {entry.runningBalance.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-slate-400">ETB</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Account Summary & Metadata */
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs space-y-3 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Account Profile</h3>
            <p className="text-slate-500 text-[11px]">Primary wholesale ledger attributes</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Account Name</span>
              <span className="font-semibold text-slate-800">{customer.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Customer Phone</span>
              <span className="font-mono text-slate-800">{customer.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Business Address</span>
              <span className="text-slate-800">{customer.address}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Ledger Ground Truth</span>
              <span className="font-medium text-emerald-700">Chronological Transaction Stream</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Customer Notes</span>
              <span className="text-slate-700 italic">{customer.notes || 'None'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
