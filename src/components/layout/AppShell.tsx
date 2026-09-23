'use client';

import React from 'react';
import { Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import DesktopSidebar from './DesktopSidebar';
import BottomNavigation from './BottomNavigation';
import QuickActionSheet from '../navigation/QuickActionSheet';
import ActionModalScaffold from '../scaffold/ActionModalScaffold';
import ManagerDashboard from '../dashboard/ManagerDashboard';
import InventoryList from '../inventory/InventoryList';
import CustomerList from '../customers/CustomerList';
import CustomerLedger from '../customers/CustomerLedger';
import ReportsView from '../reports/ReportsView';
import WarehouseActivityView from '../warehouse/WarehouseActivityView';

export default function AppShell() {
  const {
    activeTab,
    selectedCustomerId,
    currentUser,
    switchRole,
    isPreviewMobileFrame,
    setIsPreviewMobileFrame,
  } = useStockFlow();

  const isManager = currentUser.role === 'manager';

  // Determine which main view to render based on navigation state
  const renderCurrentView = () => {
    // If a customer is selected, show Customer Ledger
    if (selectedCustomerId) {
      return <CustomerLedger customerId={selectedCustomerId} />;
    }

    switch (activeTab) {
      case 'home':
        return isManager ? <ManagerDashboard /> : <WarehouseActivityView />;
      case 'inventory':
        return <InventoryList />;
      case 'customers':
        return <CustomerList />;
      case 'reports':
        return <ReportsView />;
      case 'activity':
        return <WarehouseActivityView />;
      case 'more':
        return (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
            <h2 className="font-bold text-base text-slate-900">Warehouse Utilities</h2>
            <p className="text-xs text-slate-500 mt-1">Barcode reader calibration, batch logs, and offline queue.</p>
          </div>
        );
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex">
      {/* Desktop Persistent Sidebar (Hidden on mobile, visible on lg+) */}
      {!isPreviewMobileFrame && <DesktopSidebar />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all ${isPreviewMobileFrame ? 'items-center justify-center p-4' : ''}`}>
        
        {/* Mobile Preview Frame Toggle (Discreet floating toolbar on wider screens) */}
        <div className="hidden md:flex fixed top-3 right-4 z-40 items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-sm text-xs">
          <span className="text-slate-500 font-medium">Layout:</span>
          <button
            type="button"
            onClick={() => setIsPreviewMobileFrame(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
              !isPreviewMobileFrame
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Responsive</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMobileFrame(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
              isPreviewMobileFrame
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone Frame</span>
          </button>
        </div>

        {/* Content Container: Unconstrained Responsive on Desktop, Mobile Width on Phone */}
        <main
          className={`w-full min-h-screen flex flex-col bg-slate-50 relative ${
            isPreviewMobileFrame
              ? 'max-w-[412px] h-[860px] max-h-[92vh] rounded-[44px] border-[8px] border-slate-900 shadow-2xl overflow-y-auto'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
          }`}
          style={{
            paddingBottom: isPreviewMobileFrame ? '5.5rem' : undefined,
          }}
        >
          {/* iOS Simulated Status Bar (Shown in iPhone preview mode or mobile header) */}
          <div className="lg:hidden flex items-center justify-between pb-3 pt-1 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                SF
              </div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">StockFlow</span>
            </div>

            {/* Quick Role Switcher Pill for Mobile */}
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => switchRole('manager')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  isManager ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => switchRole('warehouse')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  !isManager ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Warehouse
              </button>
            </div>
          </div>

          {/* Active View Content */}
          <div className="flex-1 pb-24 lg:pb-8">
            {renderCurrentView()}
          </div>

          {/* Fixed Mobile Bottom Navigation (Shown on mobile or in preview frame) */}
          <BottomNavigation />
        </main>
      </div>

      {/* Global Bottom Sheet & Scaffolds */}
      <QuickActionSheet />
      <ActionModalScaffold />
    </div>
  );
}
