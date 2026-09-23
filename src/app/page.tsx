'use client';

import { StockFlowProvider } from '../context/StockFlowContext';
import AppShell from '../components/layout/AppShell';

export default function HomePage() {
  return (
    <StockFlowProvider>
      <AppShell />
    </StockFlowProvider>
  );
}
