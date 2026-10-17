'use client';

import React, { useState, useMemo } from 'react';
import { Reminder } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { updateReminderStatus } from '../services/api';
import {
  Clock, Check, X, Bell, CheckCircle2,
  Pill, BellRing, Upload, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import VoiceReminderPlayer from './VoiceReminderPlayer';
import MediMascot from './MediMascot';

interface TodayScheduleTimelineProps {
  reminders: Reminder[];
  onStatusChange: () => Promise<void>;
}

interface GroupedSlot {
  timeKey: string; // e.g. "09:00"
  timeFormatted: string; // e.g. "09:00 AM"
  periodLabel: string; // e.g. "Morning", "Afternoon", "Evening / Night"
  rawDate: Date;
  reminders: Reminder[];
  totalCount: number;
  takenCount: number;
  isComplete: boolean;
}

export default function TodayScheduleTimeline({ reminders, onStatusChange }: TodayScheduleTimelineProps) {
  const { t } = useLanguage();
  const [actingId, setActingId] = useState<string | null>(null);
  const [bulkActingSlot, setBulkActingSlot] = useState<string | null>(null);
  const [activeAudioReminderId, setActiveAudioReminderId] = useState<string | null>(null);


  const formatTime = (isoString: string): string => {
    try {
      const dt = new Date(isoString);
      return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getPeriodLabel = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'Morning Dose';
    if (hour >= 12 && hour < 17) return 'Afternoon Dose';
    if (hour >= 17 && hour < 21) return 'Evening Dose';
    return 'Night Dose';
  };

  // 1. Deduplicate reminders per unique medicine and time slot
  // Priority: taken (4) > snoozed (3) > skipped (2) > upcoming (1)
  const deduplicatedReminders = useMemo(() => {
    if (!reminders || reminders.length === 0) return [];

    const priority: Record<string, number> = { taken: 4, snoozed: 3, skipped: 2, upcoming: 1 };
    const map = new Map<string, Reminder>();

    for (const rem of reminders) {
      const normName = (rem.medicine_name_normalized || rem.medicine_name || '').trim().toLowerCase();
      const dt = new Date(rem.scheduled_for);
      const timeSlot = isNaN(dt.getTime())
        ? rem.scheduled_for
        : `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
      const key = `${timeSlot}_${normName}`;

      if (!map.has(key)) {
        map.set(key, rem);
      } else {
        const existing = map.get(key)!;
        const existingPri = priority[existing.status] || 0;
        const newPri = priority[rem.status] || 0;
        if (newPri > existingPri) {
          map.set(key, rem);
        }
      }
    }

    return Array.from(map.values());
  }, [reminders]);

  // 2. Group deduplicated reminders into Time Slots
  const groupedSlots = useMemo((): GroupedSlot[] => {
    if (deduplicatedReminders.length === 0) return [];

    const groups: { [key: string]: Reminder[] } = {};

    for (const rem of deduplicatedReminders) {
      const dt = new Date(rem.scheduled_for);
      const timeKey = isNaN(dt.getTime())
        ? '09:00'
        : `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;

      if (!groups[timeKey]) {
        groups[timeKey] = [];
      }
      groups[timeKey].push(rem);
    }

    // Convert into sorted array of GroupedSlot
    const slots: GroupedSlot[] = Object.keys(groups)
      .sort()
      .map(timeKey => {
        const items = groups[timeKey];
        const firstDt = new Date(items[0].scheduled_for);
        const hour = isNaN(firstDt.getTime()) ? parseInt(timeKey.split(':')[0]) || 9 : firstDt.getHours();
        const timeFormatted = isNaN(firstDt.getTime()) ? timeKey : formatTime(items[0].scheduled_for);
        const takenCount = items.filter(r => r.status === 'taken').length;

        // Sort items: upcoming first, then taken
        items.sort((a, b) => {
          if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
          if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
          return a.medicine_name.localeCompare(b.medicine_name);
        });

        return {
          timeKey,
          timeFormatted,
          periodLabel: getPeriodLabel(hour),
          rawDate: firstDt,
          reminders: items,
          totalCount: items.length,
          takenCount,
          isComplete: takenCount === items.length
        };
      });

    return slots;
  }, [deduplicatedReminders]);

  // 3. Determine the current active slot (earliest slot with upcoming or snoozed doses)
  const activeSlot = useMemo(() => {
    return groupedSlots.find(slot => slot.reminders.some(r => r.status === 'upcoming' || r.status === 'snoozed')) || null;
  }, [groupedSlots]);

  const allCompleted = groupedSlots.length > 0 && groupedSlots.every(s => s.isComplete);

  const handleAction = async (reminderId: string, status: 'taken' | 'skipped' | 'snoozed') => {
    try {
      setActingId(reminderId);
      await updateReminderStatus(reminderId, status);
      await onStatusChange();
    } finally {
      setActingId(null);
    }
  };

  const handleTakeAllInSlot = async (slot: GroupedSlot) => {
    const upcoming = slot.reminders.filter(r => r.status === 'upcoming' || r.status === 'snoozed');
    if (upcoming.length === 0) return;

    try {
      setBulkActingSlot(slot.timeKey);
      for (const item of upcoming) {
        await updateReminderStatus(item.id, 'taken');
      }
      await onStatusChange();
    } finally {
      setBulkActingSlot(null);
    }
  };

  if (!reminders || reminders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex justify-center">
          <MediMascot variant="calendar" size="lg" animation="float" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-black text-slate-800">{t('no_medicines_today')}</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Upload a prescription to verify dosage, frequency, and food instructions. Once verified, your personalized daily schedule will appear right here.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('cta_upload')}</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <span>{t('nav_dashboard')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section: Current Due Doses / Celebration */}
      {allCompleted ? (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-teal-800 space-y-3">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>All Daily Doses Completed</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Great job! You are 100% on track today.
          </h3>
          <p className="text-sm text-slate-300 max-w-lg">
            All scheduled medications for today have been marked as taken. Your next doses will activate tomorrow morning according to your verified regimen.
          </p>
        </div>
      ) : activeSlot ? (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 space-y-5">
          {/* Header of Active Slot */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Next Due Routine
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {activeSlot.periodLabel}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2 mt-0.5">
                  <span>{activeSlot.timeFormatted}</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({activeSlot.takenCount} of {activeSlot.totalCount} taken)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action: Take All in this slot */}
            {activeSlot.reminders.filter(r => r.status === 'upcoming').length > 1 && (
              <button
                type="button"
                onClick={() => handleTakeAllInSlot(activeSlot)}
                disabled={bulkActingSlot === activeSlot.timeKey}
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>
                  {bulkActingSlot === activeSlot.timeKey ? 'Updating...' : `Take All (${activeSlot.reminders.filter(r => r.status === 'upcoming').length}) at ${activeSlot.timeFormatted}`}
                </span>
              </button>
            )}
          </div>

          {/* Medicines due in this active slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeSlot.reminders.map((rem) => {
              const isTaken = rem.status === 'taken';
              const isSkipped = rem.status === 'skipped';
              const isActing = actingId === rem.id;

              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isTaken
                      ? 'bg-teal-950/40 border-teal-700/60 text-slate-200'
                      : 'bg-slate-800/80 border-slate-700 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Pill className={`w-4 h-4 ${isTaken ? 'text-teal-400' : 'text-teal-300'}`} />
                        <span className="font-bold text-base tracking-tight">
                          {rem.medicine_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {rem.strength ? `${rem.strength} • ` : ''}{rem.dosage_form || 'Tablet'} • Standard Oral Administration
                      </p>
                    </div>

                    {isTaken && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-400" />
                        Taken
                      </span>
                    )}
                  </div>

                  {/* Actions for upcoming */}
                  {!isTaken && !isSkipped && (
                    <div className="flex items-center space-x-2 mt-3.5 pt-3 border-t border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => handleAction(rem.id, 'taken')}
                        disabled={isActing}
                        className="flex-1 py-2 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('mark_taken')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(rem.id, 'skipped')}
                        disabled={isActing}
                        className="py-2 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        <span>{t('mark_skipped')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(rem.id, 'snoozed')}
                        disabled={isActing}
                        className="py-2 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 font-semibold text-xs transition-colors"
                      >
                        <span>{t('mark_snoozed')}</span>
                      </button>
                    </div>
                  )}

                  {isSkipped && (
                    <div className="mt-2 text-xs font-semibold text-rose-400 flex items-center space-x-1">
                      <X className="w-3.5 h-3.5" />
                      <span>Dose skipped</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Audio & Vibration alert player for active routine medicines */}
          {activeSlot.reminders.some(r => r.status === 'upcoming') && (
            <VoiceReminderPlayer
              medicineName={
                activeSlot.reminders
                  .filter(r => r.status === 'upcoming')
                  .map(r => r.medicine_name)
                  .join(', ')
              }
              strength={
                activeSlot.reminders
                  .filter(r => r.status === 'upcoming')
                  .map(r => r.strength)
                  .filter(Boolean)
                  .join(', ')
              }
            />
          )}
        </div>
      ) : null}


      {/* Grouped Daily Schedule Timeline */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>{t('todays_medicines')} (Grouped by Time Slot)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organized chronologically. Medications scheduled at the same time are grouped together to prevent confusion.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
            {groupedSlots.reduce((acc, s) => acc + s.takenCount, 0)} of {groupedSlots.reduce((acc, s) => acc + s.totalCount, 0)} doses taken today
          </div>
        </div>

        {/* Time Slot Groups */}
        <div className="space-y-6">
          {groupedSlots.map((slot) => {
            return (
              <div
                key={slot.timeKey}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/40"
              >
                {/* Slot Header */}
                <div className="bg-slate-100/80 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80">
                  <div className="flex items-center space-x-3">
                    <div className="font-mono font-bold text-sm text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                      {slot.timeFormatted}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {slot.periodLabel}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {slot.totalCount} {slot.totalCount === 1 ? 'medicine' : 'medicines'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {slot.isComplete ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        {slot.takenCount} / {slot.totalCount} taken
                      </span>
                    )}

                    {!slot.isComplete && slot.reminders.filter(r => r.status === 'upcoming').length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleTakeAllInSlot(slot)}
                        disabled={bulkActingSlot === slot.timeKey}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                      >
                        Take All
                      </button>
                    )}
                  </div>
                </div>

                {/* Slot Medications List */}
                <div className="divide-y divide-slate-100 bg-white">
                  {slot.reminders.map((rem) => {
                    const isTaken = rem.status === 'taken';
                    const isSkipped = rem.status === 'skipped';
                    const isSnoozed = rem.status === 'snoozed';
                    const isActing = actingId === rem.id;

                    return (
                      <div key={rem.id} className="transition-colors">
                        <div
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isTaken ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-start space-x-3">

                          <div className={`p-2 rounded-xl mt-0.5 ${isTaken ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {isTaken ? <CheckCircle2 className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold text-sm ${isTaken ? 'text-slate-800 line-through opacity-80' : 'text-slate-900'}`}>
                                {rem.medicine_name}
                              </span>
                              {rem.strength && (
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {rem.strength}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {rem.dosage_form || 'Tablet'} • Standard oral administration
                              {rem.acted_at && isTaken && ` • Taken at ${formatTime(rem.acted_at)}`}
                            </div>
                          </div>
                        </div>

                        {/* Status / Actions */}
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {isTaken ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                              <Check className="w-3.5 h-3.5 mr-1" />
                              {t('taken')}
                            </span>
                          ) : isSkipped ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200/60">
                              <X className="w-3.5 h-3.5 mr-1" />
                              {t('skipped')}
                            </span>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              {isSnoozed && (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                  Snoozed +15m
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleAction(rem.id, 'taken')}
                                disabled={isActing}
                                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                              >
                                {isActing ? 'Saving...' : t('mark_taken')}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(rem.id, 'skipped')}
                                disabled={isActing}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                              >
                                {t('mark_skipped')}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(rem.id, 'snoozed')}
                                disabled={isActing}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200 transition-colors cursor-pointer"
                              >
                                +15m
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveAudioReminderId(activeAudioReminderId === rem.id ? null : rem.id)}
                                title="Ring voice alert with device vibration"
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  activeAudioReminderId === rem.id
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                }`}
                              >
                                <BellRing className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Voice & Vibration Player for this specific medication */}
                      {activeAudioReminderId === rem.id && (
                        <div className="p-3.5 bg-slate-50 border-t border-slate-200/80">
                          <VoiceReminderPlayer
                            medicineName={rem.medicine_name}
                            strength={rem.strength}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
