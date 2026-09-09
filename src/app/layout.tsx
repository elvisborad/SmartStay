import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SmartStay - Smart Hotel Concierge & Service Automation Platform',
  description: 'Next-generation Digital Hotel Concierge, Task Automation, and Operations Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
