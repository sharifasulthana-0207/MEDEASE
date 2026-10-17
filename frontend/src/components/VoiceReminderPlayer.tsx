'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, AlertCircle, Vibrate, BellRing, Smartphone, Check, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getAudioReminderUrl } from '../services/api';

interface VoiceReminderPlayerProps {
  medicineName: string;
  strength?: string;
  frequency?: string;
  compact?: boolean;
}

export default function VoiceReminderPlayer({
  medicineName,
  strength,
  frequency,
  compact = false
}: VoiceReminderPlayerProps) {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [hasVibrationHardware, setHasVibrationHardware] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [vibrationNotice, setVibrationNotice] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vibrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      setHasVibrationHardware(true);
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medease_vibration_enabled');
      if (saved !== null) {
        setVibrationEnabled(saved === 'true');
      }
    }

    // Clean up on unmount
    return () => {
      stopAll();
    };
  }, []);

  const getLanguageDisplayName = (lang: string): string => {
    if (lang === 'te') return 'తెలుగు (Telugu)';
    if (lang === 'hi') return 'हिंदी (Hindi)';
    return 'English';
  };

  const toggleVibration = () => {
    const next = !vibrationEnabled;
    setVibrationEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medease_vibration_enabled', String(next));
    }
    if (next) {
      triggerVibrationPulse([150, 80, 150]);
      showTemporaryNotice('Vibration Alert Enabled (Haptic Motor Active)');
    } else {
      stopVibration();
      showTemporaryNotice('Vibration Alert Disabled');
    }
  };

  const showTemporaryNotice = (msg: string) => {
    setVibrationNotice(msg);
    setTimeout(() => setVibrationNotice(null), 2500);
  };

  // Device Vibration API
  const triggerVibrationPulse = (pattern: number[] = [350, 120, 350, 120, 500]) => {
    if (!vibrationEnabled) return;
    setIsVibrating(true);

    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration API call error:', e);
      }
    }
  };

  const stopVibration = () => {
    setIsVibrating(false);
    if (vibrationTimerRef.current) {
      clearInterval(vibrationTimerRef.current);
      vibrationTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {
        console.warn('Vibration API stop error:', e);
      }
    }
  };

  // Web Audio API Chime
  const playMedicalChime = (): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          resolve();
          return;
        }

        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;

        // Note 1: E5 (659.25 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.2, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        // Note 2: A5 (880.00 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.0, now + 0.1);
        gain2.gain.setValueAtTime(0, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0.22, now + 0.14);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.6);

        setTimeout(() => resolve(), 450);
      } catch {
        resolve();
      }
    });
  };

  // Build localized reminder text strictly in user-selected language
  const getReminderText = (): string => {
    const medStr = `${medicineName} ${strength || ''}`.trim();
    if (language === 'te') {
      return `మీ ధృవీకరించబడిన మందుల షెడ్యూల్ ప్రకారం ${medStr} తీసుకోవడానికి సమయం ఆసన్నమైంది.`;
    }
    if (language === 'hi') {
      return `आपके सत्यापित दवा शेड्यूल के अनुसार ${medStr} लेने का समय हो गया है।`;
    }
    return `It is time to take ${medStr} according to your verified medication schedule.`;
  };

  const reminderText = getReminderText();

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopVibration();
    setIsPlaying(false);
  };

  const fallbackSpeechSynthesis = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsError('Browser Speech Synthesis not available. Visible text is shown below.');
      setIsPlaying(false);
      stopVibration();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(reminderText);
      const voices = window.speechSynthesis.getVoices();

      if (language === 'te') {
        const teVoice = voices.find(v => v.lang.startsWith('te'));
        utterance.lang = 'te-IN';
        if (teVoice) utterance.voice = teVoice;
      } else if (language === 'hi') {
        const hiVoice = voices.find(v => v.lang.startsWith('hi'));
        utterance.lang = 'hi-IN';
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        utterance.lang = 'en-US';
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        stopVibration();
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        stopVibration();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlaying(false);
      stopVibration();
    }
  };

  const handlePlayVoice = async () => {
    try {
      stopAll();
      setTtsError(null);
      setIsPlaying(true);

      // 1. Trigger Initial Medical Alert Chime & Device Vibration
      if (vibrationEnabled) {
        triggerVibrationPulse([350, 120, 350, 120, 500]);
        vibrationTimerRef.current = setInterval(() => {
          if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
            navigator.vibrate([200, 120, 200]);
          }
        }, 1600);
      }

      await playMedicalChime();

      // 2. Play native audio for the selected language from backend audio service
      const audioUrl = getAudioReminderUrl(reminderText, language);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        stopVibration();
      };

      audio.onerror = (e) => {
        console.warn('Backend audio failed, falling back to browser speech synthesis:', e);
        fallbackSpeechSynthesis();
      };

      await audio.play().catch(() => {
        fallbackSpeechSynthesis();
      });

    } catch (err) {
      console.warn('Audio playback error, attempting fallback:', err);
      fallbackSpeechSynthesis();
    }
  };

  const handleTestVibrationOnly = () => {
    triggerVibrationPulse([300, 100, 300, 100, 400]);
    playMedicalChime();
    showTemporaryNotice(`Chime & Haptic Vibration Test (${getLanguageDisplayName(language)})`);
    setTimeout(() => setIsVibrating(false), 1200);
  };

  return (
    <div className={`bg-gradient-to-r from-teal-50 via-slate-50 to-blue-50 border border-teal-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 transition-all ${
      isVibrating ? 'ring-2 ring-teal-500/50' : ''
    }`}>
      {/* Top Header: Title, Controls & Vibration Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl shadow-xs transition-all ${
            isVibrating
              ? 'bg-teal-600 text-white animate-vibrate shadow-teal-500/30'
              : 'bg-teal-600 text-white'
          }`}>
            {isVibrating ? <BellRing className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-900">
                {t('ring_and_voice')}
              </h4>
              {/* Language Badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
                <Globe className="w-3 h-3 mr-1 text-teal-700" />
                {getLanguageDisplayName(language)}
              </span>

              {isVibrating && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  <Vibrate className="w-3 h-3 mr-1 animate-spin" />
                  {t('vibration_active')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Spoken natively in {getLanguageDisplayName(language)} with clinic chime & synced haptics
            </p>
          </div>
        </div>

        {/* Buttons & Toggles */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          {/* Vibration Toggle Button */}
          <button
            type="button"
            onClick={toggleVibration}
            title={vibrationEnabled ? 'Click to mute vibration' : 'Click to enable vibration'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
              vibrationEnabled
                ? 'bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-100'
                : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Vibrate className={`w-3.5 h-3.5 ${vibrationEnabled ? 'text-teal-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Vibration:</span>
            <span className="font-bold">{vibrationEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Test Vibration Button */}
          <button
            type="button"
            onClick={handleTestVibrationOnly}
            title="Test chime and device vibration"
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">{t('test_vibration')}</span>
          </button>

          {/* Play / Stop Primary Action Button */}
          {isPlaying ? (
            <button
              type="button"
              onClick={stopAll}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              <span>{t('stop_voice_reminder')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlayVoice}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>{t('play_voice_reminder')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Temporary Notice or Haptic Device Indicator */}
      {vibrationNotice ? (
        <div className="flex items-center space-x-1.5 text-xs text-teal-800 bg-teal-100/80 px-3 py-1.5 rounded-lg border border-teal-300">
          <Check className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
          <span className="font-medium">{vibrationNotice}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-100/70 px-3 py-1.5 rounded-lg">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-medium text-slate-700">
              {hasVibrationHardware
                ? 'Device Vibration Motor Detected (Active)'
                : 'Haptic Wave Alert Ready (Supported on mobile & touch devices)'}
            </span>
          </div>
          <span className="text-slate-500 font-medium">
            Language: <strong className="text-teal-700">{getLanguageDisplayName(language)}</strong>
          </span>
        </div>
      )}

      {/* Visible Text Reminder (Always Shown for Accessibility and Fallback) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
            Voice Script ({getLanguageDisplayName(language)}):
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            Matched to selected language
          </span>
        </div>
        <p className="text-sm text-slate-900 font-semibold leading-relaxed">
          &ldquo;{reminderText}&rdquo;
        </p>
      </div>

      {ttsError && (
        <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{ttsError}</span>
        </div>
      )}
    </div>
  );
}
