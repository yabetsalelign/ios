'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import DesktopSidebar from './DesktopSidebar';
import DesktopHeader from './DesktopHeader';
import BottomNavigation from './BottomNavigation';
import QuickActionSheet from '../navigation/QuickActionSheet';
import ProfileModal from '../profile/ProfileModal';
import LoginView from '../auth/LoginView';
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
    isAuthenticated,
    isHydrated,
    activeTab,
    selectedCustomerId,
    currentUser,
    setIsProfileOpen,
    isPreviewMobileFrame,
    setIsPreviewMobileFrame,
    toast,
    dismissToast,
  } = useStockFlow();

  const { language, setLanguage, t } = useLanguage();
  const isManager = currentUser.role === 'manager';

  // Hydration-safe client detection
  const [mounted, setMounted] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsEmbedded(
      window.self !== window.top ||
      window.location.search.includes('preview=mobile')
    );
  }, []);

  // Prevent server/client layout mismatch and eliminate login flash during auth hydration
  if (!mounted || !isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

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
        return <WarehouseActivityView />;
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex">
      {!isPreviewMobileFrame && !isEmbedded && <DesktopSidebar />}

      <div className="flex-1 flex flex-col min-w-0 transition-all">
        {!isPreviewMobileFrame && !isEmbedded && <DesktopHeader />}

        {!isEmbedded && (
          <aside
            aria-label="Developer Preview Toolbar"
            className="hidden md:flex fixed bottom-4 right-4 z-40 items-center gap-1.5 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-lg text-xs"
          >
            <span className="text-slate-400 font-medium text-[11px]">
              Preview:
            </span>

            <button
              type="button"
              onClick={() => setIsPreviewMobileFrame(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${!isPreviewMobileFrame
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewMobileFrame(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${isPreviewMobileFrame
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-300 hover:text-white'
                }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone 390px</span>
            </button>
          </aside>
        )}

        {isPreviewMobileFrame && !isEmbedded ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
            <div className="relative w-[390px] h-[844px] max-h-[88vh] rounded-[52px] border-[10px] border-slate-900 shadow-2xl overflow-hidden bg-slate-900 flex flex-col">
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-30 pointer-events-none" />

              <iframe
                src="/?preview=mobile"
                title="StockFlow Mobile Preview"
                className="w-full flex-1 border-0 bg-slate-50"
              />
            </div>

            <p className="text-xs text-slate-500 mt-3 font-medium text-center">
              Authoritative 390×844 mobile preview.
            </p>
          </div>
        ) : (
          <main className="w-full min-h-screen flex flex-col bg-slate-50/70 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
            <div
              className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4"
              style={{
                paddingTop: 'max(env(safe-area-inset-top, 0px), 0.5rem)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  SF
                </div>

                <div>
                  <span className="font-bold text-sm text-slate-900 tracking-tight block leading-tight">
                    StockFlow
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block leading-none capitalize">
                    {isManager ? t.sidebar.manager : t.sidebar.warehouse}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'en'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600'
                      }`}
                  >
                    EN
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('am')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'am'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600'
                      }`}
                  >
                    አማ
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shadow-2xs active:scale-95 transition-transform"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>

            <div className="flex-1 pb-32 lg:pb-8">{renderCurrentView()}</div>

            <BottomNavigation />
          </main>
        )}
      </div>

      <ProfileModal />
      <QuickActionSheet />
      <RecordSaleModal />
      <RecordCustomerPaymentModal />
      <RecordPurchaseModal />
      <TransactionSuccessModal />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-start gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl min-w-[260px] max-w-[340px]">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold">{toast.title}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}