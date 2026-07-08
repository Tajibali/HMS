import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Enterprise HMS Pro',
  description: 'Role-Based High-Performance Medical System Layout',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}