'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Users, ArrowUpDown, X, Plus } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import CustomerFormModal from './CustomerFormModal';

export default function CustomerList() {
  const { customers, currentUser, getCustomerSummary, setSelectedCustomerId, rawTransactions } = useStockFlow();
  const { t } = useLanguage();
  const isManager = currentUser.role === 'manager';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterDebtOnly) {
        const summary = getCustomerSummary(c.id);
        return summary.outstandingBalance > 0;
      }
      return true;
    });
  }, [customers, searchQuery, filterDebtOnly, getCustomerSummary]);

  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.customers.title}</h1>
          <p className="text-xs text-slate-500">{t.customers.subtitle}</p>
        </div>
        {isManager && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.sale.addCustomer}</span>
          </button>
        )}
      </div>

      {/* Search Bar with filter toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t.customers.searchPlaceholder}
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setFilterDebtOnly((prev) => !prev);
            setPage(1);
          }}
          title="Show customers with a balance due"
          className={`h-10 px-3 border rounded-2xl flex items-center gap-1.5 text-xs font-medium transition-all shadow-2xs flex-shrink-0 ${
            filterDebtOnly
              ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
              : 'bg-white border-slate-200/90 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.customers.filterWithBalance}</span>
        </button>
      </div>

      {/* Customer List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {customers.length === 0 ? t.common.noCustomersYet : t.customers.noCustomersFound}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {customers.length === 0
                ? isManager ? t.common.addFirstCustomerHint : t.common.askManagerToAddCustomer
                : t.customers.noCustomersFoundSub}
            </p>
          </div>
        ) : (
          paginatedCustomers.map((customer) => {
            // Warehouse users may be blocked from ledger_transactions by RLS.
            // If rawTransactions is empty for a non-manager, we cannot distinguish
            // "settled" from "data hidden" — show a neutral restricted indicator.
            const hasTransactionAccess = currentUser.role === 'manager' || rawTransactions.length > 0;
            const summary = hasTransactionAccess ? getCustomerSummary(customer.id) : null;
            const hasDebt = summary !== null && summary.outstandingBalance > 0;

            return (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
                className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
              >
                {/* Left: Customer Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700 border border-slate-200/60 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {customer.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">{customer.phone}</p>
                    {summary !== null && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {summary.transactionCount} {t.customers.transactionsCount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Outstanding Balance Pill & Chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    {summary !== null ? (
                      <>
                        <div
                          className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                            hasDebt
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          }`}
                        >
                          {hasDebt
                            ? `${t.customers.amountOwed}: ${summary.outstandingBalance.toLocaleString()} ETB`
                            : `${t.customers.settled} (0 ETB)`}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {t.customers.totalSales}: {summary.totalSales.toLocaleString()} ETB
                        </p>
                      </>
                    ) : (
                      <div className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
                        {'–'}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {filteredCustomers.length > PAGE_SIZE && (
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-500 shadow-2xs">
          <span className="text-[11px]">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredCustomers.length)} of {filteredCustomers.length} customers
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
            >
              Previous
            </button>
            <span className="text-[11px] font-semibold text-slate-700 px-1">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
      <CustomerFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCustomerCreated={(c) => {
          setSelectedCustomerId(c.id);
          setIsAddOpen(false);
        }}
      />
    </div>
  );
}
