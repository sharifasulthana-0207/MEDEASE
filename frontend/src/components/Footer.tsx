'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ShieldAlert, Info } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-start space-x-3 text-sm text-slate-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block mb-0.5">Medical & Safety Disclaimer</span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t('disclaimer')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
          <p>© 2026 MEDEASE. Safety-Aware Prescription Understanding & Adherence Assistant.</p>
          <p className="mt-2 sm:mt-0 font-medium text-slate-400">Read · Verify · Understand · Remember · Stay Safe</p>
        </div>
      </div>
    </footer>
  );
}
