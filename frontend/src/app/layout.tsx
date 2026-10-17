import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'MEDEASE - Safety-Aware Prescription Understanding & Adherence',
  description: 'Read · Verify · Understand · Remember · Stay Safe. A deterministic, safety-gated medication adherence assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
