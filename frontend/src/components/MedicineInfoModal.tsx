'use client';

import React, { useEffect, useState } from 'react';
import { MedicineReference } from '../types';
import { getMedicineInfo } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { X, Pill, ShieldAlert, Sparkles, ExternalLink, CheckCircle } from 'lucide-react';

interface MedicineInfoModalProps {
  canonicalName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MedicineInfoModal({ canonicalName, isOpen, onClose }: MedicineInfoModalProps) {
  const { language, t } = useLanguage();
  const [data, setData] = useState<MedicineReference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && canonicalName) {
      setLoading(true);
      setError(null);
      getMedicineInfo(canonicalName)
        .then((res) => setData(res))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen, canonicalName]);

  if (!isOpen) return null;

  const getLocalizedPurpose = (info: MedicineReference): string => {
    if (language === 'hi' && info.common_purpose_hi) return info.common_purpose_hi;
    if (language === 'te' && info.common_purpose_te) return info.common_purpose_te;
    return info.common_purpose_en || 'Standard pharmaceutical indication.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-teal-500 p-2 rounded-lg text-white">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('medicine_info_title')}</h2>
              <p className="text-xs text-slate-400 font-mono">Formulary Reference Match</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mb-2" />
              <p className="text-sm">Loading verified formulary data...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 text-sm">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Canonical / Generic Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Canonical Name</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-medium">Verified</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{data.canonical_name}</div>
                <div className="text-sm text-slate-600">
                  <strong>{t('generic_name')}:</strong> {data.generic_name}
                </div>
                {data.active_ingredients && data.active_ingredients.length > 0 && (
                  <div className="text-xs text-slate-500">
                    <strong>{t('active_ingredients')}:</strong> {data.active_ingredients.join(', ')}
                  </div>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t('common_purpose')}
                </h4>
                <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-sm text-teal-950 font-medium leading-relaxed">
                  {getLocalizedPurpose(data)}
                </div>
              </div>

              {/* Generic vs Brand Explanation */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t('brand_vs_generic')}
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {data.generic_vs_brand}
                </div>
              </div>

              {/* Strict Medical Disclaimer Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5 text-amber-950">General Information Notice:</strong>
                  {t('medical_disclaimer_notice')}
                </div>
              </div>

              {/* Optional Prototype Card: Find Medicine Online */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>{t('find_online_proto')}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">Prototype Only</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('find_online_disclaimer')}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                    Verified generic: {data.generic_name} ({data.strength || 'Standard dose'})
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
