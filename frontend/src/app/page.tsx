'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import { loadDemoFixture } from '../services/api';
import MediMascot from '../components/MediMascot';
import {
  HeartDoodle, SparkleDoodle, CapsuleDoodle,
  MedicalCrossDoodle, LeafDoodle, PharmacyStoreDoodle, DecorativeCurvedLine
} from '../components/Doodles';
import {
  ShieldCheck, Upload, Sparkles, AlertTriangle, CheckCircle2,
  Calendar, Volume2, ArrowRight, Pill, FileText, Lock, ShoppingCart,
  Globe, ChevronDown, ChevronUp, Star, Clock, Check
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleDemo = async (type: 'success' | 'controlled_failure' | 'actual_prescription') => {
    try {
      setLoadingDemo(type);
      const res = await loadDemoFixture(type);
      if (res && res.prescription_id) {
        router.push('/verify/' + res.prescription_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDemo(null);
    }
  };

  const steps = [
    { num: '01', title: 'Upload Prescription', desc: 'Capture or upload any handwritten prescription photo or scan.', icon: Upload },
    { num: '02', title: 'Read & Transcribe', desc: 'Optical analysis reads drug names, dosages, and directions without hallucination.', icon: FileText },
    { num: '03', title: 'Safety Gate Verify', desc: 'Uncertain items are flagged. You verify critical directions before any schedule unlocks.', icon: ShieldCheck },
    { num: '04', title: 'Understand in Your Language', desc: 'Clear plain explanations in English, Hindi, and Telugu.', icon: Globe },
    { num: '05', title: 'Schedule Regimens', desc: 'Automated morning, noon, and night dose timetables.', icon: Calendar },
    { num: '06', title: 'Smart Reminders', desc: 'Audio voice alerts and visual reminders so you never miss a dose.', icon: Clock },
    { num: '07', title: 'Find Legitimate Pharmacies', desc: 'Compare verified prices and pack sizes on Tata 1mg, Apollo, PharmEasy, and Netmeds.', icon: ShoppingCart },
  ];

  const faqs = [
    {
      q: 'Does MEDEASE replace my doctor or pharmacist?',
      a: 'Never. Our fundamental philosophy is "AI assists patients; it does not replace doctors or pharmacists." MEDEASE helps you transcribe, verify, understand, and schedule the exact instructions your physician already wrote.'
    },
    {
      q: 'What happens if a doctor\'s handwriting is unreadable?',
      a: 'MEDEASE will never guess or invent missing dosages. Our deterministic Safety Gate blocks automated scheduling and flags ambiguous handwriting for your explicit human confirmation.'
    },
    {
      q: 'How does the Medicine Price & Pharmacy Finder work?',
      a: 'Once your prescription is verified, you can search and compare verified prices from authorized online platforms such as Tata 1mg, Apollo Pharmacy, PharmEasy, and Netmeds. We compare prices on a normalized per-unit (per tablet/capsule) basis with honest links.'
    },
    {
      q: 'Which languages are supported?',
      a: 'MEDEASE supports English, Hindi (हिंदी), and Telugu (తెలుగు) across the entire interface, voice reminders, and medicine purpose explanations.'
    },
    {
      q: 'Is my prescription data safe and private?',
      a: 'Yes. Prescriptions are processed securely. We never sell your personal medical records or transmit identifiable data to third-party ad networks.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Soft Background Pastels & Doodles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#DDF5EF]/80 via-[#FFF9F1] to-[#EDE7FF]/60 rounded-full blur-3xl -z-10 pointer-events-none" />
        <HeartDoodle className="absolute top-12 left-8 text-pink-300 w-6 h-6 animate-pulse hidden sm:block" />
        <SparkleDoodle className="absolute top-24 right-16 text-amber-400 w-7 h-7 hidden sm:block" />
        <CapsuleDoodle className="absolute bottom-16 left-20 text-teal-300 w-8 h-8 hidden sm:block" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Safety Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#DDF5EF] border border-teal-200 text-teal-900 text-xs font-black tracking-wide shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Safety-First Healthcare Assistant · Powered by AI</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Your Prescription, <br />
                <span className="text-teal-700 bg-gradient-to-r from-[#168C89] to-[#126B70] bg-clip-text text-transparent">
                  Made Simple. 💊
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-teal-800/90 max-w-xl">
                Read, understand, organize, and manage your medicines with confidence.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed pt-1">
                Upload doctor prescriptions, verify uncertain handwriting with our deterministic Safety Gate, get audio alerts in English, Hindi & Telugu, and compare verified medicine prices online.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/upload"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Prescription</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 border border-slate-300 shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Open Dashboard</span>
              </Link>

              <Link
                href="/pharmacy"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#FFF9F1] hover:bg-amber-100/60 text-amber-950 font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 border border-amber-200 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-amber-600" />
                <span>Find Medicine 🛒</span>
              </Link>
            </div>

            {/* Trust Quote */}
            <div className="pt-2 flex items-center justify-center lg:justify-start space-x-2 text-xs text-slate-500 font-medium">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>&ldquo;AI assists patients; it does not replace doctors or pharmacists.&rdquo;</span>
            </div>

          </div>

          {/* Right Hero: Large Friendly Medi Mascot Presentation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-72 h-80 sm:w-88 sm:h-96 rounded-full bg-gradient-to-b from-[#DDF5EF] via-[#FFF9F1] to-[#FFE6D9]/50 border-2 border-teal-100 flex items-center justify-center shadow-xl p-6">
              
              <MediMascot
                variant="happy"
                size="2xl"
                animation="float"
                decorative={false}
                alt="Medi, your friendly prescription mascot welcoming you"
              />

              {/* Speech bubble */}
              <div className="absolute -top-4 -right-2 bg-white rounded-2xl px-4 py-2 border border-teal-100 shadow-md flex items-center space-x-2 animate-bounce-subtle">
                <span className="text-sm">👋</span>
                <span className="text-xs font-black text-slate-800">Hi! I&apos;m Medi!</span>
              </div>

              {/* Floating pill badge */}
              <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl px-3.5 py-1.5 border border-slate-200 shadow-md flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-700">Safety Gate Active</span>
              </div>

              <SparkleDoodle className="absolute top-6 left-4 text-amber-400 w-6 h-6" />
              <HeartDoodle className="absolute bottom-8 right-6 text-pink-400 w-5 h-5" />
            </div>
          </div>

        </div>

      </section>

      {/* Featured Benchmark Prototypes Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Try Interactive Prescription Benchmarks
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Explore how MEDEASE handles real clinic cursive and low-confidence safety triggers.
              </p>
            </div>
            <span className="text-xs font-mono bg-teal-50 text-teal-800 font-bold px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
              Ready to Test
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Real Rx from Sai Ram Clinic */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-5 border border-teal-500/30 flex flex-col justify-between space-y-4 shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-teal-400 text-slate-950 px-2 py-0.5 rounded">
                    Real-World Prescription
                  </span>
                  <FileText className="w-4 h-4 text-teal-400" />
                </div>

                {/* Prescription Slip Photo Preview */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-teal-500/30 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fixtures/actual_prescription.png"
                    alt="Sai Ram Clinic handwritten prescription slip"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] text-teal-300 font-medium flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-teal-400" />
                      <span>Original Doctor's Slip</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-white">Sai Ram Clinic (Mr. Aman)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Genuine clinic cursive with 4 drugs: <strong>Opox-CV 200mg</strong>, <strong>Aldigesic-SP</strong>, <strong>Breezy</strong>, and <strong>Pan-D 40mg</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDemo('actual_prescription')}
                disabled={loadingDemo !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
              >
                <span>{loadingDemo === 'actual_prescription' ? 'Loading...' : 'Launch Actual Rx'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Verified Path */}
            <div className="bg-[#DDF5EF]/50 hover:bg-[#DDF5EF] border border-teal-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Verified Benchmark
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                {/* Prescription Slip Photo Preview */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-white border border-teal-200 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fixtures/prescription_success.jpg"
                    alt="Paracetamol verified prescription slip"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] text-white font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Clear Prescription Slip</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">Paracetamol 650mg</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    High-confidence extraction (96%+). All critical fields match reference formulary. Schedule unlocks instantly.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDemo('success')}
                disabled={loadingDemo !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
              >
                <span>{loadingDemo === 'success' ? 'Loading...' : 'Launch Verified Path'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Controlled Failure */}
            <div className="bg-amber-50/60 hover:bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Safety Gate Blocked
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>

                {/* Prescription Slip Photo Preview */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-white border border-amber-300 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fixtures/prescription_controlled_failure.jpg"
                    alt="Ambiguous handwriting prescription slip"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] text-white font-medium flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Ambiguous Cursive Slip</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">Pantoprazole 40mg (~BD~ ?)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Frequency confidence is 58% (&lt;85% threshold). Automated scheduling is strictly locked until verified by patient!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDemo('controlled_failure')}
                disabled={loadingDemo !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
              >
                <span>{loadingDemo === 'controlled_failure' ? 'Loading...' : 'Launch Failure Path'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* How MEDEASE Works: 7-Step Journey */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-teal-700 font-extrabold text-xs uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            <span>Core User Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How MEDEASE Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From handwritten slip to scheduled reminders and price discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                      {st.num}
                    </span>
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Differentiator: Safety-Aware Verification */}
      <section className="bg-gradient-to-b from-[#DDF5EF]/40 via-white to-[#FFF9F1] border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Core Differentiator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Safety-Aware Prescription Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Why we never blindly convert raw LLM output into medical action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Deterministic Safety Gate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We separate technical extraction signals (OCR optical confidence) from clinical validity. Any low-confidence frequency or uncertain name blocks schedule generation.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Formulary Reference Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracted medicine names are matched against verified formulary databases for generic ingredients, standard strengths, and dosage forms.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Multilingual Voice Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spoken audio reminders in English, Hindi, and Telugu ensure patients of all literacy levels take the right pill at the right time.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Medicine Price & Pharmacy Finder Spotlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-teal-500/30 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>New Feature · Honest Price Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Medicine Price & Pharmacy Finder 🛒
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              Find where your verified medicines are in stock across <strong>Tata 1mg</strong>, <strong>Apollo Pharmacy</strong>, <strong>PharmEasy</strong>, and <strong>Netmeds</strong>. Compare normalized unit prices per tablet with 100% honesty.
            </p>
            <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
              <span className="text-xs px-3 py-1 rounded-lg bg-white/10 text-teal-200 border border-white/10">No fabricated prices</span>
              <span className="text-xs px-3 py-1 rounded-lg bg-white/10 text-teal-200 border border-white/10">Per-tablet unit pricing</span>
              <span className="text-xs px-3 py-1 rounded-lg bg-white/10 text-teal-200 border border-white/10">Direct pharmacy links</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/pharmacy"
              className="px-8 py-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
            >
              <span>Explore Pharmacy Finder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about MEDEASE and how we protect your safety.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between space-x-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Safety Notice Callout */}
      <section className="py-8 px-4 max-w-4xl mx-auto text-center border-t border-slate-200">
        <p className="text-xs text-slate-500 italic">
          * MEDEASE does not diagnose, prescribe, change dosages, or substitute medications. It is designed to assist patients in understanding their doctor&apos;s verified instructions.
        </p>
      </section>

    </div>
  );
}
