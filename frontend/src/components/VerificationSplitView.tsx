'use client';

import React, { useState } from 'react';
import { Prescription, Medication } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { getPrescriptionImageUrl, verifyMedicationField, scheduleMedication, processPrescription } from '../services/api';
import SafetyGateBanner from './SafetyGateBanner';
import MedicationFieldRow from './MedicationFieldRow';
import MedicineInfoModal from './MedicineInfoModal';
import VoiceReminderPlayer from './VoiceReminderPlayer';
import PharmacyComparisonModal from './PharmacyComparisonModal';
import {
  ZoomIn, ZoomOut, RotateCcw, AlertTriangle, ShieldCheck,
  CheckCircle2, RefreshCw, Calendar, Pill, ArrowRight, Lock, Check, ShoppingCart
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VerificationSplitViewProps {
  prescription: Prescription;
  onRefresh: () => Promise<void>;
}

export default function VerificationSplitView({ prescription, onRefresh }: VerificationSplitViewProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  const [activeMedicineModal, setActiveMedicineModal] = useState<string | null>(null);
  const [selectedMedIndex, setSelectedMedIndex] = useState(0);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [schedulingError, setSchedulingError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [pharmacyModalOpen, setPharmacyModalOpen] = useState(false);

  const medications = prescription.medications || [];
  const currentMed: Medication | null = medications[selectedMedIndex] || medications[0] || null;

  const imageUrl = getPrescriptionImageUrl(prescription.id);

  const handleVerifyField = async (fieldName: string, action: 'confirmed' | 'edited', newValue?: any) => {
    if (!currentMed) return;
    setSchedulingError(null);
    await verifyMedicationField(currentMed.id, fieldName, action, newValue);
    await onRefresh();
  };

  const handleGenerateSchedule = async () => {
    if (!currentMed) return;
    try {
      setIsScheduling(true);
      setSchedulingError(null);
      await scheduleMedication(currentMed.id);
      setScheduleSuccess(true);
      await onRefresh();
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setSchedulingError(err.message || 'Safety Gate blocked schedule creation.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleScheduleAllVerified = async () => {
    try {
      setIsScheduling(true);
      setSchedulingError(null);
      let scheduledCount = 0;
      for (const m of medications) {
        if (m.critical_fields_complete && m.safety_gate_status === 'VERIFIED') {
          await scheduleMedication(m.id);
          scheduledCount++;
        }
      }
      setScheduleSuccess(true);
      await onRefresh();
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setSchedulingError(err.message || 'Error scheduling medications.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleRecheck = async () => {
    try {
      setIsReprocessing(true);
      setSchedulingError(null);
      await processPrescription(prescription.id);
      await onRefresh();
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Provenance Indicator */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800">Provenance:</span>
          <span>{t('provenance_text')}</span>
        </div>
        <button
          type="button"
          onClick={handleRecheck}
          disabled={isReprocessing}
          className="font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin' : ''}`} />
          <span>{t('btn_recheck')}</span>
        </button>
      </div>

      {/* Main Split-View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Top: Original Prescription Image */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold flex items-center space-x-2">
                <span>{t('original_rx')}</span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {prescription.original_filename}
              </p>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
                title="Zoom In"
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
                title="Zoom Out"
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                title="Reset Zoom"
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-auto max-h-[580px] p-4 bg-slate-100 flex items-center justify-center min-h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Prescription slip"
              onError={(e) => {
                const target = e.currentTarget;
                const fallbackFilename = prescription.original_filename || 'actual_prescription.png';
                if (!target.src.includes(`/fixtures/${fallbackFilename}`)) {
                  target.src = `/fixtures/${fallbackFilename}`;
                }
              }}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
              className="max-w-full h-auto object-contain rounded shadow-sm border border-slate-300 bg-white"
            />
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Always cross-reference extracted names and notations with the physician's handwriting.</span>
          </div>
        </div>

        {/* Right / Bottom: Extracted Medication Fields & Safety Gate */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Multiple Medications Tab Selector */}
          {medications.length > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span>Prescribed Medications ({medications.length})</span>
                <span className="text-[11px] font-mono text-slate-400">Select to review each drug</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {medications.map((m, idx) => {
                  const isSelected = idx === selectedMedIndex;
                  const isVerified = m.critical_fields_complete && m.safety_gate_status === 'VERIFIED';
                  return (
                    <button
                      key={m.id || idx}
                      type="button"
                      onClick={() => setSelectedMedIndex(idx)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono opacity-80">#{idx + 1}</span>
                        {isVerified ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Verified" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Needs Verification" />
                        )}
                      </div>
                      <div className="font-bold text-xs truncate">{m.medicine_name_raw}</div>
                      <div className="text-[10px] opacity-70 truncate">{m.strength || m.dosage_form || 'Dose'}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentMed ? (
            <>
              {/* Safety Gate Decision Banner */}
              <SafetyGateBanner
                schedulingAllowed={currentMed.critical_fields_complete}
                status={String(currentMed.safety_gate_status)}
                reasons={currentMed.safety_gate_reasons}
                medicineName={currentMed.medicine_name_raw}
              />

              {/* Technical Confidence Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-blue-900">
                <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Technical extraction confidence</strong> indicates OCR optical signal clarity, not a clinically verified probability. You must review and confirm unverified fields before schedule generation.
                </p>
              </div>

              {/* Extracted Fields List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {t('extracted_fields')}: <span className="text-teal-700">{currentMed.medicine_name_raw}</span>
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {currentMed.critical_fields_complete && currentMed.safety_gate_status === 'VERIFIED' && (
                      <button
                        type="button"
                        onClick={() => setPharmacyModalOpen(true)}
                        className="text-xs font-bold text-amber-950 hover:bg-amber-100 bg-[#FFF9F1] px-3 py-1.5 rounded-xl border border-amber-200 flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                        <span>Find Online 🛒</span>
                      </button>
                    )}

                    {currentMed.active_ingredient && (
                      <button
                        type="button"
                        onClick={() => setActiveMedicineModal(currentMed.medicine_name_normalized || currentMed.medicine_name_raw)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-xl border border-teal-200 flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>{t('btn_medicine_info')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {currentMed.fields && currentMed.fields.map((f) => (
                  <MedicationFieldRow
                    key={f.id || f.field_name}
                    field={f}
                    onVerify={handleVerifyField}
                  />
                ))}
              </div>

              {/* Voice Reminder Audio Preview */}
              <VoiceReminderPlayer
                medicineName={currentMed.medicine_name_raw}
                strength={currentMed.strength}
                frequency={currentMed.frequency}
              />

              {/* Schedule Unlock Action Bar */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                {schedulingError && (
                  <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-xs text-rose-900 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span><strong>Blocked:</strong> {schedulingError}</span>
                  </div>
                )}

                {scheduleSuccess && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Schedule generated successfully! Redirecting to dashboard...</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {currentMed.critical_fields_complete ? (
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{currentMed.medicine_name_raw} is verified & ready to schedule</span>
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium flex items-center space-x-1">
                        <Lock className="w-4 h-4" />
                        <span>Schedule locked until uncertain fields are confirmed</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={handleScheduleAllVerified}
                        disabled={isScheduling}
                        className="px-4 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-sm flex items-center space-x-1.5 transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Schedule All Verified</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleGenerateSchedule}
                      disabled={!currentMed.critical_fields_complete || isScheduling}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                        currentMed.critical_fields_complete
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t('btn_generate_schedule')}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              No medication records found for this prescription.
            </div>
          )}

        </div>
      </div>

      {/* Modal for Medicine Details */}
      {activeMedicineModal && (
        <MedicineInfoModal
          canonicalName={activeMedicineModal}
          isOpen={true}
          onClose={() => setActiveMedicineModal(null)}
        />
      )}

      {/* Modal for Pharmacy & Price Comparison */}
      <PharmacyComparisonModal
        isOpen={pharmacyModalOpen}
        medicationId={currentMed?.id}
        medicineName={currentMed?.medicine_name_raw}
        onClose={() => setPharmacyModalOpen(false)}
      />

    </div>
  );
}
