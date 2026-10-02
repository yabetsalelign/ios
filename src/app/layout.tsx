import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockFlow - Smarter Inventory, Smoother Operations",
  description: "Mobile-first inventory and customer sales ledger for wholesale and distribution",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StockFlow",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

const appearanceBootstrap = `(() => {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const applyAppearance = () => {
    let preference = 'light';
    try {
      const stored = localStorage.getItem('sf_appearance');
      if (stored === 'dark' || stored === 'system') preference = stored;
    } catch {}
    const isDark = preference === 'dark' || (preference === 'system' && media.matches);
    root.dataset.appearance = preference;
    root.dataset.theme = isDark ? 'dark' : 'light';
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', isDark ? '#0b1220' : '#FFFFFF');
  };
  applyAppearance();
  media.addEventListener('change', applyAppearance);
  window.addEventListener('storage', applyAppearance);
  window.addEventListener('stockflow_appearance_change', applyAppearance);
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script id="stockflow-appearance-init" dangerouslySetInnerHTML={{ __html: appearanceBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased select-none">
        {children}
      </body>
    </html>
  );
}
