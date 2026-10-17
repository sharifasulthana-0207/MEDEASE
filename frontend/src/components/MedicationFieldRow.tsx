'use client';

import React, { useState } from 'react';
import { MedicationField, FieldStatus } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { Check, Edit2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MedicationFieldRowProps {
  field: MedicationField;
  onVerify: (fieldName: string, action: 'confirmed' | 'edited', newValue?: any) => Promise<void>;
}

export default function MedicationFieldRow({ field, onVerify }: MedicationFieldRowProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value ? String(field.value) : '');
  const [loading, setLoading] = useState(false);

  const isLowConfidence = field.confidence < 0.70 && field.source !== 'user';
  const isNeedsVerification = field.status === 'NEEDS_VERIFICATION' || isLowConfidence;
  const isVerified = field.status === 'VERIFIED' || field.source === 'user';

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onVerify(field.field_name, 'confirmed', field.value);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await onVerify(field.field_name, 'edited', editValue);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (name: string): string => {
    switch (name) {
      case 'medicine_name': return t('field_medicine_name');
      case 'strength': return t('field_strength');
      case 'dosage_form': return t('field_dosage_form');
      case 'frequency': return t('field_frequency');
      case 'duration': return t('field_duration');
      case 'route': return t('field_route');
      default: return name.replace('_', ' ');
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isNeedsVerification
        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Field Details */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {getFieldLabel(field.field_name)}
            </span>

            {/* Status Pill */}
            {isVerified ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {t('status_verified')}
              </span>
            ) : field.status === 'MISSING' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {t('status_missing')}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {t('status_needs_verification')}
              </span>
            )}

            {/* Source Tag */}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              {field.source === 'user' ? '👤 Verified by User' : `🤖 ${field.source}`}
            </span>
          </div>

          {/* Value Display or Edit Input */}
          {isEditing ? (
            <div className="mt-2 flex items-center space-x-2">
              {field.field_name === 'frequency' ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="OD">OD - Once Daily (09:00)</option>
                  <option value="BD">BD - Twice Daily (09:00, 21:00)</option>
                  <option value="TDS">TDS - Three Times Daily (08:00, 14:00, 20:00)</option>
                  <option value="QID">QID - Four Times Daily</option>
                  <option value="HS">HS - At Bedtime (21:30)</option>
                  <option value="SOS">SOS - As Needed</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none w-full max-w-xs"
                  placeholder={`Enter verified ${field.field_name}`}
                />
              )}

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('btn_save')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                {t('btn_cancel')}
              </button>
            </div>
          ) : (
            <div className="flex items-baseline space-x-2">
              <div className="text-base sm:text-lg font-bold text-slate-900">
                {field.value !== null && field.value !== undefined ? String(field.value) : (
                  <span className="italic text-slate-400 font-normal">Not detected</span>
                )}
              </div>
            </div>
          )}

          {/* Validation or Reason Message */}
          {field.validation_message && (
            <p className="text-xs text-amber-800 font-medium mt-1">
              {field.validation_message}
            </p>
          )}

          {/* Technical extraction confidence signal */}
          <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500">
            <span className={`px-2 py-0.5 rounded font-mono font-medium text-[11px] ${
              isLowConfidence
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'bg-slate-100 text-slate-700'
            }`}>
              System Confidence: {Math.round(field.confidence * 100)}%
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Technical extraction signal only)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                setEditValue(field.value ? String(field.value) : '');
                setIsEditing(true);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center space-x-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t('btn_edit')}</span>
            </button>

            {!isVerified && field.value && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('btn_confirm')}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
