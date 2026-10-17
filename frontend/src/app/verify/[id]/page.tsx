'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams } from 'next/navigation';
import { Prescription } from '../../../types';
import { getPrescription } from '../../../services/api';
import VerificationSplitView from '../../../components/VerificationSplitView';
import { useLanguage } from '../../../hooks/useLanguage';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const prescriptionId = unwrappedParams.id;
  const { t } = useLanguage();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPrescription(prescriptionId);
      setPrescription(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load prescription.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prescriptionId) {
      fetchPrescriptionData();
    }
  }, [prescriptionId]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Prescription ID: {prescriptionId?.slice(0, 8)}...</span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold">Loading prescription verification workspace...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-300 rounded-3xl p-8 text-center text-rose-900 space-y-3">
            <p className="text-base font-bold">Error loading prescription</p>
            <p className="text-xs">{error}</p>
            <button
              onClick={fetchPrescriptionData}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : prescription ? (
          <VerificationSplitView
            prescription={prescription}
            onRefresh={fetchPrescriptionData}
          />
        ) : null}

      </div>
    </div>
  );
}
