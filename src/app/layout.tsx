import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockFlow - Smarter Inventory, Smoother Operations",
  description: "Mobile-first inventory and customer sales ledger for wholesale and distribution",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StockFlow",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // themeColor is intentionally omitted here — the inline appearance bootstrap
  // script manages it dynamically to match the user's dark/light preference.
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
    const color = isDark ? '#0b1220' : '#FFFFFF';
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColor);
    }
    themeColor.setAttribute('content', color);
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
