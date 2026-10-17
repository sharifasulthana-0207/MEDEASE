'use client';

import React, { useEffect, useState } from 'react';
import { Reminder, AdherenceReport } from '../../types';
import { getTodaySchedule, getAdherenceReport } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import TodayScheduleTimeline from '../../components/TodayScheduleTimeline';
import AdherenceCard from '../../components/AdherenceCard';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [adherence, setAdherence] = useState<AdherenceReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const [rems, adh] = await Promise.all([
        getTodaySchedule().catch(() => []),
        getAdherenceReport().catch(() => null)
      ]);
      setReminders(rems);
      setAdherence(adh);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 text-white p-2 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{t('nav_schedule')}</h1>
              <p className="text-xs text-slate-500">Human-verified regimens and reminder schedules</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <div className="inline-block animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full mb-3" />
                <p className="text-sm">Loading active schedules...</p>
              </div>
            ) : (
              <TodayScheduleTimeline
                reminders={reminders}
                onStatusChange={loadSchedule}
              />
            )}
          </div>

          <div>
            <AdherenceCard report={adherence} />
          </div>
        </div>

      </div>
    </div>
  );
}
