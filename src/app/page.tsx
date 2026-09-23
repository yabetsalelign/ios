'use client';

import { StockFlowProvider } from '../context/StockFlowContext';
import { LanguageProvider } from '../context/LanguageContext';
import AppShell from '../components/layout/AppShell';

export default function HomePage() {
  return (
    <LanguageProvider>
      <StockFlowProvider>
        <AppShell />
      </StockFlowProvider>
    </LanguageProvider>
  );
}
