'use client';

import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
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

import RecordSaleModal from '../transactions/RecordSaleModal';
import RecordCustomerPaymentModal from '../transactions/RecordCustomerPaymentModal';
import RecordPurchaseModal from '../transactions/RecordPurchaseModal';
import TransactionSuccessModal from '../transactions/TransactionSuccessModal';

export default function AppShell() {
  const {
    activeTab,
    selectedCustomerId,
    currentUser,
    switchRole,
    isPreviewMobileFrame,
    setIsPreviewMobileFrame,
  } = useStockFlow();

  const { language, setLanguage, t } = useLanguage();
  const isManager = currentUser.role === 'manager';

  // Detect whether we are embedded inside a preview iframe without hydration mismatch or cascading render
  const isEmbedded = React.useSyncExternalStore(
    () => () => {},
    () => window.self !== window.top || window.location.search.includes('preview=mobile'),
    () => false
  );

  const renderCurrentView = () => {
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
            <h2 className="font-bold text-base text-slate-900">{t.warehouse.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Barcode reader calibration, batch logs, and offline queue.
            </p>
          </div>
        );
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex">
      {/* Desktop Sidebar (hidden on mobile via lg:flex, and omitted in iframe or phone preview mode) */}
      {!isPreviewMobileFrame && !isEmbedded && <DesktopSidebar />}

      <div className="flex-1 flex flex-col min-w-0 transition-all">
        {/* Floating top-right toolbar: Layout toggle + Language switcher (Desktop only, omitted inside preview iframe) */}
        {!isEmbedded && (
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
              <span>Full</span>
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
              <span>iPhone</span>
            </button>

            {/* Language Switcher */}
            <span className="w-px h-4 bg-slate-200 mx-1" />
            <button
              type="button"
              aria-label="Switch to English"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                language === 'en'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              aria-label="Switch to Amharic"
              onClick={() => setLanguage('am')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                language === 'am'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              አማ
            </button>
          </div>
        )}

        {/* When development iPhone preview is selected on desktop, render an isolated 390px viewport iframe so CSS breakpoints evaluate at 390px */}
        {isPreviewMobileFrame && !isEmbedded ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            <div className="relative w-[390px] h-[844px] max-h-[88vh] rounded-[52px] border-[10px] border-slate-900 shadow-2xl overflow-hidden bg-slate-900 flex flex-col">
              {/* Dynamic Island Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-30 pointer-events-none" />
              <iframe
                src="/?preview=mobile"
                title="StockFlow 390px Viewport Mobile Preview"
                className="w-full flex-1 border-0 bg-slate-50"
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium text-center">
              Authoritative 390px viewport iframe. Use Chrome DevTools Device Mode (390×844) for native touch testing.
            </p>
          </div>
        ) : (
          /* Real responsive application layout (Full desktop or native mobile viewport) */
          <main className="w-full min-h-screen flex flex-col bg-slate-50 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Mobile header bar with role switcher + language toggle */}
            <div className="lg:hidden flex items-center justify-between pb-3 pt-1 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  SF
                </div>
                <span className="font-bold text-sm text-slate-900 tracking-tight">StockFlow</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile language switcher */}
                <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-[10px] font-semibold">
                  <button
                    type="button"
                    aria-label="English"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      language === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    aria-label="Amharic"
                    onClick={() => setLanguage('am')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      language === 'am' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    አማ
                  </button>
                </div>

                {/* Role switcher pill */}
                <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => switchRole('manager')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      isManager ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    {t.sidebar.manager}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchRole('warehouse')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      !isManager ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    {t.sidebar.warehouse}
                  </button>
                </div>
              </div>
            </div>

            {/* Active View Content */}
            <div className="flex-1 pb-24 lg:pb-8">{renderCurrentView()}</div>

            {/* Mobile Bottom Navigation with elevated + button */}
            <BottomNavigation />
          </main>
        )}
      </div>

      {/* Global transaction modals and action sheet */}
      <QuickActionSheet />
      <RecordSaleModal />
      <RecordCustomerPaymentModal />
      <RecordPurchaseModal />
      <TransactionSuccessModal />
      <ActionModalScaffold />
    </div>
  );
}
