'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lock, Unlock } from 'lucide-react';

interface SafetyGateBannerProps {
  schedulingAllowed: boolean;
  status: string;
  reasons: string[];
  medicineName?: string;
}

export default function SafetyGateBanner({
  schedulingAllowed,
  status,
  reasons,
  medicineName
}: SafetyGateBannerProps) {
  const { t } = useLanguage();

  if (schedulingAllowed && status === 'VERIFIED') {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="bg-emerald-600 text-white p-2 rounded-lg flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-emerald-950 flex items-center space-x-1.5">
                <span>{t('schedule_unlocked_title')}</span>
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                <Unlock className="w-3 h-3 mr-1" />
                VERIFIED
              </span>
            </div>
            <p className="text-sm text-emerald-800 mt-1">
              All critical fields for <strong>{medicineName || 'this medication'}</strong> have passed reference checks and human verification. Scheduling is active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Blocked / Needs Verification state
  return (
    <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="bg-amber-600 text-white p-2 rounded-lg flex-shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-amber-950">
              {t('schedule_blocked_title')}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
              <Lock className="w-3 h-3 mr-1" />
              {status || 'NEEDS VERIFICATION'}
            </span>
          </div>

          <p className="text-sm text-amber-900 mt-1 font-medium">
            MEDEASE has blocked automated schedule generation until all critical details are verified from the original prescription.
          </p>

          {reasons && reasons.length > 0 && (
            <div className="mt-3 bg-white/80 border border-amber-300 rounded-lg p-3 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-700" />
                Blocking Reasons Detected by Safety Gate:
              </div>
              <ul className="list-disc list-inside text-xs sm:text-sm text-amber-950 space-y-1">
                {reasons.map((r, idx) => (
                  <li key={idx} className="font-medium">{r}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-amber-800 mt-2">
            Please review the highlighted fields below and click <strong>Confirm Field</strong> or <strong>Edit</strong> to resolve uncertainties.
          </p>
        </div>
      </div>
    </div>
  );
}
