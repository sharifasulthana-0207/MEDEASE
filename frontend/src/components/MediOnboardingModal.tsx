'use client';

import React, { useState, useEffect } from 'react';
import MediMascot, { MediVariant } from './MediMascot';
import { SparkleDoodle, HeartDoodle } from './Doodles';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

interface MediOnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceOpen?: boolean;
}

interface OnboardingStep {
  title: string;
  subtitle: string;
  variant: MediVariant;
  mascotAnimation: 'float' | 'bounce' | 'tilt' | 'wave';
  pillTag: string;
  bulletPoints: string[];
  ctaText: string;
}

export default function MediOnboardingModal({
  isOpen,
  onClose,
  forceOpen = false,
}: MediOnboardingModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setInternalOpen(true);
      setCurrentStep(0);
      return;
    }

    if (isOpen !== undefined) {
      setInternalOpen(isOpen);
      return;
    }

    // Check localStorage for first-time onboarding
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('medease_onboarding_completed');
      if (!seen) {
        setInternalOpen(true);
      }
    }
  }, [forceOpen, isOpen]);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('medease_onboarding_completed', 'true');
    }
    setInternalOpen(false);
    if (onClose) onClose();
  };

  const steps: OnboardingStep[] = [
    {
      title: "Hi! I'm Medi, Your Prescription Buddy 💊",
      subtitle: 'Upload handwritten or digital doctor prescriptions with ease.',
      variant: 'upload',
      mascotAnimation: 'wave',
      pillTag: 'Step 1 · Read',
      bulletPoints: [
        'Take a clear photo or select a prescription image.',
        'Our optical clinical engine transcribes medicines and dosage forms.',
        'Never guess ambiguous handwriting or abbreviations.',
      ],
      ctaText: 'Next: Safety Check',
    },
    {
      title: 'Safety-First Verification 🛡️',
      subtitle: 'AI assists patients, but safety comes first.',
      variant: 'thinking',
      mascotAnimation: 'tilt',
      pillTag: 'Step 2 · Verify',
      bulletPoints: [
        'MEDEASE highlights uncertain or low-confidence lines for your confirmation.',
        'Critical instructions (name, strength, frequency) must be confirmed before scheduling.',
        'No invented medical instructions or automatic substitutions.',
      ],
      ctaText: 'Next: Easy Schedules',
    },
    {
      title: 'Personalized Daily Schedules 📅',
      subtitle: 'Clear, timely timetables tailored to your lifestyle.',
      variant: 'calendar',
      mascotAnimation: 'float',
      pillTag: 'Step 3 · Schedule',
      bulletPoints: [
        'Automatic morning, afternoon, and bedtime dose organization.',
        'Follows doctor directions like "Before Breakfast (B/F)" or "Twice Daily".',
        'Prevents duplicate doses and tracks full treatment duration.',
      ],
      ctaText: 'Next: Reminders & Finder',
    },
    {
      title: 'Smart Reminders & Pharmacy Finder 🛒',
      subtitle: 'Stay on track and find verified medicines online.',
      variant: 'celebrating',
      mascotAnimation: 'bounce',
      pillTag: 'Step 4 · Remind & Find',
      bulletPoints: [
        'Multilingual voice and visual reminders in English, Hindi, and Telugu.',
        'Find legitimate online pharmacies (1mg, Apollo, PharmEasy, Netmeds).',
        'Compare verified prices and pack sizes with complete honesty.',
      ],
      ctaText: 'Get Started with MEDEASE',
    },
  ];

  if (!internalOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to MEDEASE Onboarding"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFDF9] rounded-3xl max-w-xl w-full border border-teal-100 shadow-2xl overflow-hidden relative">
        
        {/* Top Pastel Ribbon */}
        <div className="bg-gradient-to-r from-teal-600 via-[#168C89] to-[#126B70] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
              {step.pillTag}
            </span>
            <span className="text-xs text-teal-100 font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Medi Mascot Display Area with soft pastel circle */}
          <div className="flex flex-col items-center justify-center relative py-2">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#DDF5EF] to-[#FFF9F1] border border-teal-100 flex items-center justify-center relative shadow-inner">
              <MediMascot
                variant={step.variant}
                size="lg"
                animation={step.mascotAnimation}
                decorative={false}
                alt={step.title}
              />
              <SparkleDoodle className="absolute -top-1 -right-2 text-amber-400 w-5 h-5" />
              <HeartDoodle className="absolute -bottom-1 -left-2 text-pink-400 w-4 h-4" />
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center space-x-2 mt-4">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentStep ? 'w-7 bg-teal-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {step.subtitle}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="bg-[#FFF9F1] border border-amber-100 rounded-2xl p-4 sm:p-5 space-y-2.5 text-left">
            {step.bulletPoints.map((point, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium py-2 px-3 cursor-pointer"
              >
                Skip intro
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>{step.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
