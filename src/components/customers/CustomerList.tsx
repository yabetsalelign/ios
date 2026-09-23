'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Users, ArrowUpDown, X } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';

export default function CustomerList() {
  const { customers, getCustomerSummary, setSelectedCustomerId } = useStockFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-xs text-slate-500">Wholesale clients and financial balances</p>
        </div>
      </div>

      {/* Search Bar with filter toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, phone or location..."
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFilterDebtOnly((prev) => !prev)}
          title="Filter only customers with outstanding balance"
          className={`h-10 px-3 border rounded-2xl flex items-center gap-1.5 text-xs font-medium transition-all shadow-2xs flex-shrink-0 ${
            filterDebtOnly
              ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
              : 'bg-white border-slate-200/90 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">With Balance</span>
        </button>
      </div>

      {/* Customer List matching Screen 11 */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const summary = getCustomerSummary(customer.id);
            const hasDebt = summary.outstandingBalance > 0;

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
                    <p className="text-[11px] text-slate-400">{customer.phone}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {summary.transactionCount} transactions recorded
                    </p>
                  </div>
                </div>

                {/* Right: Outstanding Balance Pill & Chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                        hasDebt
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                      }`}
                    >
                      {hasDebt
                        ? `Outstanding: ${summary.outstandingBalance.toLocaleString()} ETB`
                        : 'Outstanding: 0 ETB'}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Total Sales: {summary.totalSales.toLocaleString()} ETB
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
