'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import MediMascot from './MediMascot';
import MediOnboardingModal from './MediOnboardingModal';
import {
  Calendar, Upload, Globe, ShoppingCart,
  Sparkles, Menu, X, Compass, ShieldCheck
} from 'lucide-react';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: t('nav_dashboard'), icon: Calendar },
    { href: '/upload', label: t('nav_upload'), icon: Upload },
    { href: '/schedule', label: t('nav_schedule'), icon: Calendar },
    { href: '/pharmacy', label: 'Pharmacy Finder 🛒', icon: ShoppingCart },
  ];

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo with Medi */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 p-1 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <MediMascot variant="happy" size="xs" animation="wave" decorative />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-xl tracking-tight text-white">MEDEASE</span>
                </div>
                <p className="text-[11px] text-teal-200/70 hidden sm:block font-medium">Your Prescription, Made Simple.</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all ${
                      isActive
                        ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Tour + Language Switcher + Mobile Menu Toggle */}
            <div className="flex items-center space-x-2">
              
              {/* Tour trigger button */}
              <button
                type="button"
                onClick={() => setShowTourModal(true)}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFF9F1] text-teal-900 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer shadow-xs"
                title="Open Medi first-time walkthrough tour"
              >
                <Compass className="w-3.5 h-3.5 text-teal-700" />
                <span>Tour 💊</span>
              </button>

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === 'hi'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('te')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === 'te'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  తెలుగు
                </button>
              </div>

              {/* Mobile menu hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-150">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowTourModal(true);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-amber-300 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Take Guided Medi Tour 💊</span>
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Onboarding Tour Modal */}
      <MediOnboardingModal
        forceOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
      />
    </>
  );
}
