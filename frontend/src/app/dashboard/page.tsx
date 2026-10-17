'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Reminder, AdherenceReport } from '../../types';
import { getTodaySchedule, getAdherenceReport, loadDemoFixture, cleanupScheduleDuplicates } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import AdherenceCard from '../../components/AdherenceCard';
import TodayScheduleTimeline from '../../components/TodayScheduleTimeline';
import MediMascot from '../../components/MediMascot';
import PharmacyComparisonModal from '../../components/PharmacyComparisonModal';
import MediOnboardingModal from '../../components/MediOnboardingModal';
import { SparkleDoodle, HeartDoodle } from '../../components/Doodles';
import {
  Upload, Sparkles, AlertTriangle, ShieldCheck,
  Calendar, CheckCircle2, ArrowRight, FileText, RotateCcw,
  ShoppingCart, Pill, Compass, Clock, Check
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [adherence, setAdherence] = useState<AdherenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  // Pharmacy modal state
  const [pharmacyModalOpen, setPharmacyModalOpen] = useState(false);
  const [selectedPharmacyMedicine, setSelectedPharmacyMedicine] = useState<string>('Paracetamol');
  
  // Tour modal state
  const [tourOpen, setTourOpen] = useState(false);

  const fetchData = async () => {
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
    fetchData();
  }, []);

  const handleLaunchDemo = async (type: 'success' | 'controlled_failure' | 'actual_prescription') => {
    try {
      setDemoLoading(type);
      const res = await loadDemoFixture(type);
      if (res && res.prescription_id) {
        router.push('/verify/' + res.prescription_id);
      }
    } catch (err) {
      console.error('Failed to load demo:', err);
    } finally {
      setDemoLoading(null);
    }
  };

  const handleCleanupDuplicates = async () => {
    try {
      setCleaning(true);
      await cleanupScheduleDuplicates();
      await fetchData();
    } catch (err) {
      console.error('Failed to cleanup duplicates:', err);
    } finally {
      setCleaning(false);
    }
  };

  // Extract unique active medicines for quick cards
  const uniqueMedicines = Array.from(
    new Set(reminders.map((r) => r.medicine_name_normalized || r.medicine_name))
  ).map((medName) => {
    const sample = reminders.find(
      (r) => (r.medicine_name_normalized || r.medicine_name) === medName
    );
    return {
      name: medName,
      strength: sample?.strength || 'Standard',
      form: sample?.dosage_form || 'Tablet',
      totalDoses: reminders.filter(
        (r) => (r.medicine_name_normalized || r.medicine_name) === medName
      ).length,
    };
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8 selection:bg-teal-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Area with Medi Mascot Greeting */}
        <div className="bg-gradient-to-r from-teal-50 via-[#DDF5EF] to-[#FFF9F1] rounded-3xl p-6 sm:p-8 border border-teal-100/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 text-center md:text-left z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white text-teal-800 text-xs font-black shadow-2xs border border-teal-100">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>MEDEASE Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hello! Welcome to your Medication Hub 💙
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Track your verified doctor regimens, stay up to date with doses, and discover authorized online pharmacy pricing.
            </p>
          </div>

          <div className="flex items-center space-x-3 z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/70 backdrop-blur-xs flex items-center justify-center p-1 border border-teal-100 shadow-inner">
              <MediMascot variant="happy" size="md" animation="bounce" decorative />
            </div>
          </div>

          {/* Doodles */}
          <SparkleDoodle className="absolute top-4 right-8 text-amber-400 w-5 h-5 opacity-60 pointer-events-none" />
          <HeartDoodle className="absolute bottom-4 left-8 text-pink-300 w-5 h-5 opacity-60 pointer-events-none" />
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <Link
              href="/upload"
              className="p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex flex-col items-center justify-center space-y-1.5 shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Prescription</span>
            </Link>

            <Link
              href="/schedule"
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Full Schedule</span>
            </Link>

            <Link
              href="/pharmacy"
              className="p-3.5 rounded-2xl bg-[#FFF9F1] hover:bg-amber-50 text-amber-950 border border-amber-200 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <span>Pharmacy Finder</span>
            </Link>

            <button
              type="button"
              onClick={() => handleLaunchDemo('actual_prescription')}
              disabled={demoLoading !== null}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <FileText className="w-5 h-5 text-teal-400" />
              <span className="truncate">{demoLoading === 'actual_prescription' ? 'Loading...' : 'Sai Ram Real Rx'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunchDemo('controlled_failure')}
              disabled={demoLoading !== null}
              className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="truncate">{demoLoading === 'controlled_failure' ? 'Loading...' : 'Test Failure'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="p-3.5 rounded-2xl bg-[#EDE7FF] hover:bg-[#DDD5FF] text-purple-900 border border-purple-200 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Compass className="w-5 h-5 text-purple-700" />
              <span>Take Tour 💊</span>
            </button>

          </div>
        </div>

        {/* Verified Medicine Cards Carousel / Grid */}
        {uniqueMedicines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Active Verified Medicines ({uniqueMedicines.length})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Click &quot;Find Online&quot; to compare prices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {uniqueMedicines.map((med, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                        Verified
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {med.totalDoses} doses today
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 truncate">
                      {med.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {med.strength} · {med.form}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPharmacyMedicine(med.name);
                        setPharmacyModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                      <span>Find Online 🛒</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adherence Overview + Safety Gate Policy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdherenceCard report={adherence} />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Deterministic Gate Active</span>
              </div>
              <h4 className="text-base font-black text-slate-900 leading-snug">
                Safety Verification Principle
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scheduling is permanently blocked for medications with missing or uncertain frequency, duration, or unverified drug identity.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Status: Active Safety Core</span>
              <button
                type="button"
                onClick={handleCleanupDuplicates}
                disabled={cleaning}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${cleaning ? 'animate-spin' : ''}`} />
                <span>{cleaning ? 'Cleaning...' : 'Deduplicate'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Medication Timeline */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold">Loading medication schedule...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-12 border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#FFF9F1] flex items-center justify-center p-2 border border-amber-100">
              <MediMascot variant="empty" size="md" animation="tilt" decorative />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">No medicines scheduled for today 💊</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a doctor prescription or launch one of the interactive demo benchmarks to see your daily timetable.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/upload"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Prescription</span>
              </Link>
            </div>
          </div>
        ) : (
          <TodayScheduleTimeline
            reminders={reminders}
            onStatusChange={fetchData}
          />
        )}

      </div>

      {/* Pharmacy Comparison Modal */}
      <PharmacyComparisonModal
        medicineName={selectedPharmacyMedicine}
        isOpen={pharmacyModalOpen}
        onClose={() => setPharmacyModalOpen(false)}
      />

      {/* Medi Onboarding Tour Modal */}
      <MediOnboardingModal
        forceOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

    </div>
  );
}
