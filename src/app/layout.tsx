import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'SmartStay - Smart Hotel Concierge & Service Automation Platform',
  description: 'Next-generation Digital Hotel Concierge, Task Automation, and Operations Dashboard',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
