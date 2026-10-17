'use client';

import React from 'react';
import { AdherenceReport } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { Activity } from 'lucide-react';

interface AdherenceCardProps {
  report: AdherenceReport | null;
}

export default function AdherenceCard({ report }: AdherenceCardProps) {
  const { t } = useLanguage();

  const percentage = report ? report.adherence_percentage : 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-teal-500 text-white p-2 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('adherence_rate')}</h3>
            <p className="text-xs text-slate-500">Real-time verified dosage tracking</p>
          </div>
        </div>
        <div className="text-2xl font-black text-teal-600">
          {percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Breakdown Pills */}
      <div className="grid grid-cols-4 gap-2 pt-2 text-center">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
          <span className="text-[11px] font-medium text-slate-500 block">{t('taken')}</span>
          <span className="text-sm font-bold text-emerald-600">{report?.taken_count || 0}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
          <span className="text-[11px] font-medium text-slate-500 block">{t('skipped')}</span>
          <span className="text-sm font-bold text-rose-600">{report?.skipped_count || 0}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
          <span className="text-[11px] font-medium text-slate-500 block">{t('snoozed')}</span>
          <span className="text-sm font-bold text-amber-600">{report?.snoozed_count || 0}</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
          <span className="text-[11px] font-medium text-slate-500 block">{t('upcoming')}</span>
          <span className="text-sm font-bold text-slate-700">{report?.upcoming_count || 0}</span>
        </div>
      </div>
    </div>
  );
}
