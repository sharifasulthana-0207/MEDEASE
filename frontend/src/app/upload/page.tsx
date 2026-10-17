'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { uploadPrescription, processPrescription, loadDemoFixture } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import MediMascot from '../../components/MediMascot';
import { SparkleDoodle, HeartDoodle } from '../../components/Doodles';
import {
  UploadCloud, FileImage, AlertTriangle,
  CheckCircle2, ArrowRight, X, ArrowLeft, ShieldCheck, Sparkles, FileText
} from 'lucide-react';

export default function UploadPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [qualityWarning, setQualityWarning] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleLaunchDemo = async (type: 'actual_prescription' | 'success' | 'controlled_failure') => {
    try {
      setDemoLoading(type);
      const res = await loadDemoFixture(type);
      if (res && res.prescription_id) {
        router.push(`/verify/${res.prescription_id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load demo fixture.');
    } finally {
      setDemoLoading(null);
    }
  };

  const steps = [
    t('processing_step1'),
    t('processing_step2'),
    t('processing_step3'),
    t('processing_step4')
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    setQualityWarning([]);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setCurrentStep(0);
      setErrorMessage(null);

      const uploadRes = await uploadPrescription(selectedFile);
      if (uploadRes.warning && uploadRes.warning.length > 0) {
        setQualityWarning(uploadRes.warning);
      }

      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 600));

      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 700));

      setCurrentStep(3);
      await processPrescription(uploadRes.prescription_id);
      await new Promise(r => setTimeout(r, 500));

      router.push(`/verify/${uploadRes.prescription_id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process prescription.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 px-4 sm:px-6 lg:px-8 selection:bg-teal-100">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Prescription Upload Workspace</span>
          </div>
        </div>

        {/* Header with Upload Medi */}
        <div className="bg-gradient-to-r from-teal-50 via-[#DDF5EF] to-[#FFF9F1] rounded-3xl p-6 sm:p-7 border border-teal-100 flex items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center space-x-2 text-teal-800 font-extrabold text-xs uppercase tracking-wider">
              <span>Step 1 · Prescription Reading</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Upload Your Prescription 📄
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload a clear photo or supported document to begin. Medi will help extract and organize your medicines safely.
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center p-1 border border-teal-100 shadow-inner">
              <MediMascot variant="upload" size="md" animation="tilt" decorative />
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs sm:text-sm text-rose-900 flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-200 hover:border-teal-500 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all bg-[#DDF5EF]/20 hover:bg-[#DDF5EF]/40 space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <p className="text-base font-extrabold text-slate-900">
                  {t('upload_drop')}
                </p>
                <p className="text-xs text-slate-500">
                  {t('upload_support')}
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <span className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 flex items-center space-x-2">
                  <FileImage className="w-4 h-4 text-teal-600" />
                  <span>{t('btn_choose_file')}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden max-h-[420px] flex items-center justify-center p-4 border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl!}
                  alt="Prescription Preview"
                  className="max-h-[380px] w-auto object-contain rounded-xl shadow-lg"
                />

                {!isProcessing && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setQualityWarning([]);
                    }}
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow transition-colors cursor-pointer"
                    aria-label="Remove prescription image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {qualityWarning.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Image Quality Notice:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {qualityWarning.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isProcessing ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                      <span>Processing Prescription</span>
                    </span>
                    <span>Step {currentStep + 1} of {steps.length}</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    {steps.map((s, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center space-x-2 text-xs transition-opacity ${
                          idx === currentStep
                            ? 'text-teal-900 font-bold opacity-100'
                            : idx < currentStep
                            ? 'text-slate-400 opacity-60'
                            : 'text-slate-300 opacity-40'
                        }`}
                      >
                        {idx < currentStep ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : idx === currentStep ? (
                          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleUploadAndAnalyze}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>{t('btn_process')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Prescription Slips Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Don't have a prescription handy? Try Sample Demo Slips
              </h2>
            </div>
            <span className="text-[11px] font-mono bg-teal-50 text-teal-800 font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              Instant Test
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Click on any prescription slip photo below to instantly test optical reading, the safety verification gate, and pharmacy price matching.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* 1. Real Rx */}
            <div className="border border-slate-200 hover:border-teal-400 rounded-2xl p-3 bg-slate-50/70 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between group shadow-2xs">
              <div className="space-y-2">
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fixtures/actual_prescription.png"
                    alt="Sai Ram Clinic handwritten prescription slip photo"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-teal-300 text-[9px] font-bold px-2 py-0.5 rounded">
                    Real Doctor Handwriting
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800">Sai Ram Clinic (Mr. Aman)</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Opox-CV, Aldigesic-SP, Breezy & Pan-D clinic cursive.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchDemo('actual_prescription')}
                disabled={demoLoading !== null}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>{demoLoading === 'actual_prescription' ? 'Loading...' : 'Try This Slip'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Clear Verified */}
            <div className="border border-slate-200 hover:border-emerald-400 rounded-2xl p-3 bg-slate-50/70 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between group shadow-2xs">
              <div className="space-y-2">
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fixtures/prescription_success.jpg"
                    alt="Paracetamol clear prescription slip photo"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-emerald-700/80 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    Verified High Confidence
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800">Paracetamol 650mg</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Clear printed slip. Unlocks schedule immediately.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchDemo('success')}
                disabled={demoLoading !== null}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>{demoLoading === 'success' ? 'Loading...' : 'Try This Slip'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Controlled Failure */}
            <div className="border border-slate-200 hover:border-amber-400 rounded-2xl p-3 bg-slate-50/70 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between group shadow-2xs">
              <div className="space-y-2">
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fixtures/prescription_controlled_failure.jpg"
                    alt="Ambiguous handwriting prescription slip photo"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-amber-700/80 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    Safety Gate Trigger
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800">Pantoprazole 40mg (~BD~ ?)</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Ambiguous frequency handwriting. Blocks automated scheduling.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchDemo('controlled_failure')}
                disabled={demoLoading !== null}
                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>{demoLoading === 'controlled_failure' ? 'Loading...' : 'Try This Slip'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
