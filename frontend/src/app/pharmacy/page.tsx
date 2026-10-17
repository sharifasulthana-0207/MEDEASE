'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MediMascot from '../../components/MediMascot';
import { PharmacyComparisonData } from '../../types';
import { searchPharmacies } from '../../services/api';
import {
  Search, ArrowLeft, ExternalLink, ShieldCheck,
  TrendingDown, Sparkles, Store, Info, AlertTriangle
} from 'lucide-react';

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState('Paracetamol');
  const [data, setData] = useState<PharmacyComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const quickPicks = [
    'Paracetamol',
    'Pantoprazole',
    'Pan-D',
    'Opox-CV',
    'Aldigesic-SP',
    'Breezy',
    'Amoxicillin'
  ];

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    try {
      setLoading(true);
      setSearched(true);
      const res = await searchPharmacies(term);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Perform initial search on mount
  React.useEffect(() => {
    handleSearch('Paracetamol');
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            <Store className="w-3.5 h-3.5 text-teal-600" />
            <span>Authorized Pharmacy Partners</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-50 via-[#DDF5EF] to-[#FFF9F1] rounded-3xl p-6 sm:p-8 border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Medicine Price & Pharmacy Finder</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Find Legitimate Online Pharmacies
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Compare verified prices and pack sizes for your doctor-prescribed medicine across <strong>Tata 1mg</strong>, <strong>Apollo Pharmacy</strong>, <strong>PharmEasy</strong>, and <strong>Netmeds</strong>.
            </p>
          </div>

          <div className="flex-shrink-0">
            <MediMascot variant="pharmacy" size="xl" animation="bounce" decorative />
          </div>
        </div>

        {/* Search Bar & Quick Picks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-grow">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter medicine name or generic (e.g., Paracetamol, Pan-D, Opox-CV)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Searching...' : 'Compare Prices'}</span>
            </button>
          </form>

          {/* Quick Select Buttons */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Sample Formularies:
            </span>
            {quickPicks.map((pick) => (
              <button
                key={pick}
                type="button"
                onClick={() => {
                  setSearchQuery(pick);
                  handleSearch(pick);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === pick.toLowerCase()
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {pick}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold">Retrieving verified pharmacy listings...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF9F1] border border-amber-200 rounded-2xl p-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Showing Results for</span>
                <h2 className="text-xl font-black text-slate-900">{data.medicine_name}</h2>
              </div>

              {data.lowest_price_provider && (
                <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xs">
                  <TrendingDown className="w-4 h-4 text-emerald-700" />
                  <span>Lowest Price on {data.lowest_price_provider}</span>
                </div>
              )}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.pharmacy_options.map((option, idx) => {
                const isLowest = data.lowest_price_provider === option.provider_name;
                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-3xl p-5 border flex flex-col justify-between space-y-4 transition-all relative ${
                      isLowest
                        ? 'border-emerald-400 shadow-lg ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {isLowest && (
                      <div className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                        🏆 Lowest Price
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs"
                            style={{ backgroundColor: option.logo_color || '#168C89' }}
                          >
                            {option.provider_name.charAt(0)}
                          </div>
                          <span className="font-extrabold text-sm text-slate-900">{option.provider_name}</span>
                        </div>

                        {option.has_verified_pricing ? (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Live Catalog
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-xs text-slate-800 line-clamp-1">{option.product_title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{option.pack_size || 'Standard pack'}</div>
                      </div>

                      {option.has_verified_pricing && option.current_price !== null ? (
                        <div className="pt-2 space-y-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-black text-slate-900">₹{option.current_price?.toFixed(2)}</span>
                            {option.mrp && option.mrp > (option.current_price || 0) && (
                              <>
                                <span className="text-xs text-slate-400 line-through">₹{option.mrp.toFixed(2)}</span>
                                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                  {option.discount_percentage}% OFF
                                </span>
                              </>
                            )}
                          </div>

                          {option.unit_price && (
                            <p className="text-[11px] text-teal-700 font-semibold">
                              ≈ ₹{option.unit_price} / unit
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="pt-2 text-xs text-slate-500 italic">
                          Live pricing available on official store page.
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <a
                        href={option.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs"
                      >
                        <span>View on {option.provider_name}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Disclaimer notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Info className="w-4 h-4 text-teal-600" />
                <span>Patient Safety & Prescription Notice</span>
              </div>
              <p className="leading-relaxed">
                {data.disclaimer}
              </p>
              <p className="text-[11px] text-slate-400">
                Scheduled prescription medications require a physical or verified digital prescription upload on external pharmacy platforms prior to dispatch.
              </p>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
