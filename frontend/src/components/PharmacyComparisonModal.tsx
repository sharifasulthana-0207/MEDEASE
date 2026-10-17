'use client';

import React, { useEffect, useState } from 'react';
import MediMascot from './MediMascot';
import { PharmacyComparisonData, PharmacyOption } from '../types';
import { getMedicationPharmacyOptions, searchPharmacies } from '../services/api';
import {
  X, ExternalLink, ShieldCheck, AlertTriangle,
  Tag, CheckCircle2, TrendingDown, Store, ArrowRight, Info
} from 'lucide-react';

interface PharmacyComparisonModalProps {
  medicationId?: string;
  medicineName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PharmacyComparisonModal({
  medicationId,
  medicineName,
  isOpen,
  onClose,
}: PharmacyComparisonModalProps) {
  const [data, setData] = useState<PharmacyComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        if (medicationId) {
          const res = await getMedicationPharmacyOptions(medicationId);
          setData(res);
        } else if (medicineName) {
          const res = await searchPharmacies(medicineName);
          setData(res);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load pharmacy pricing.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, medicationId, medicineName]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Medicine Price & Pharmacy Finder"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-[#FFFDF9] rounded-3xl max-w-3xl w-full border border-teal-100 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-[#168C89] to-[#126B70] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center p-1 border border-white/20">
              <MediMascot variant="pharmacy" size="sm" animation="bounce" decorative />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Medicine Price & Pharmacy Finder 🛒
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Compare
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Explore legitimate online pharmacies for your prescribed medicine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close pharmacy finder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="inline-block animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full" />
              <p className="text-sm font-semibold">Comparing verified pharmacy listings...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs sm:text-sm text-rose-900 flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Prescribed Medicine Summary Card */}
              <div className="bg-[#FFF9F1] border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Prescribed Medicine
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      {data.medicine_name}
                      {data.strength && <span className="text-sm font-semibold text-teal-700 ml-2">({data.strength})</span>}
                    </h3>
                  </div>

                  {data.is_prescription_verified ? (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Prescription</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold self-start sm:self-auto">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Verification Pending</span>
                    </div>
                  )}
                </div>

                {data.active_ingredient && (
                  <p className="text-xs text-slate-600">
                    <strong>Active Generic:</strong> {data.active_ingredient}
                  </p>
                )}

                {data.safety_notice && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{data.safety_notice}</span>
                  </div>
                )}
              </div>

              {/* Price Comparator Overview Banner */}
              {data.is_prescription_verified && data.lowest_price_provider && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm text-emerald-950">
                  <div className="flex items-center space-x-2.5">
                    <TrendingDown className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>
                      Lowest comparable price found on <strong>{data.lowest_price_provider}</strong>!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 hidden sm:inline">
                    Normalized per unit
                  </span>
                </div>
              )}

              {/* Pharmacy Options Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
                  <span>Available Pharmacy Options ({data.pharmacy_options.length})</span>
                  <span className="text-[11px] font-mono text-slate-400">Unit Price Comparison</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {data.pharmacy_options.map((option, idx) => {
                    const isLowest = data.lowest_price_provider === option.provider_name;
                    return (
                      <div
                        key={idx}
                        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-3 relative ${
                          isLowest
                            ? 'border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        {isLowest && (
                          <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                            <span>🏆 Lowest Price</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          {/* Pharmacy Logo & Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-2xs"
                                style={{ backgroundColor: option.logo_color || '#168C89' }}
                              >
                                {option.provider_name.charAt(0)}
                              </div>
                              <span className="font-extrabold text-sm text-slate-900">
                                {option.provider_name}
                              </span>
                            </div>

                            {option.has_verified_pricing ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                                Verified Price
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                Live Search
                              </span>
                            )}
                          </div>

                          {/* Product Title & Pack size */}
                          <div>
                            <div className="font-bold text-xs text-slate-800 line-clamp-1">
                              {option.product_title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {option.pack_size || 'Standard package'}
                            </div>
                          </div>

                          {/* Price Details */}
                          {option.has_verified_pricing && option.current_price !== null ? (
                            <div className="pt-1 space-y-1">
                              <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-black text-slate-900">
                                  ₹{option.current_price?.toFixed(2)}
                                </span>
                                {option.mrp && option.mrp > (option.current_price || 0) && (
                                  <>
                                    <span className="text-xs text-slate-400 line-through">
                                      ₹{option.mrp.toFixed(2)}
                                    </span>
                                    {option.discount_percentage && (
                                      <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        {option.discount_percentage}% OFF
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>

                              {option.unit_price && (
                                <p className="text-[11px] text-teal-700 font-semibold">
                                  ≈ ₹{option.unit_price} / unit ({option.dosage_form || 'dose'})
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="pt-2 text-xs text-slate-500 italic">
                              Live catalog search available. Check live pricing directly on platform.
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2 border-t border-slate-100">
                          <a
                            href={option.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs"
                          >
                            <span>View on {option.provider_name}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safety & Prescription Requirement Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-800 font-bold">
                  <Info className="w-4 h-4 text-teal-600" />
                  <span>Important Patient Purchase Information</span>
                </div>
                <p className="leading-relaxed">
                  {data.disclaimer}
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  MEDEASE does not sell medicines, receive commissions, or substitute prescription formulations. Always consult your doctor before modifying any treatment.
                </p>
              </div>

            </>
          ) : null}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Tata 1mg · Apollo Pharmacy · PharmEasy · Netmeds
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
