'use client';

import React from 'react';

interface DoodleProps {
  className?: string;
  size?: number;
}

export function HeartDoodle({ className = 'text-pink-400', size = 20 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function SparkleDoodle({ className = 'text-amber-400', size = 20 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
    </svg>
  );
}

export function CapsuleDoodle({ className = 'text-teal-500', size = 22 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-30 12 12)" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="6" x2="12" y2="18" transform="rotate(-30 12 12)" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function MedicalCrossDoodle({ className = 'text-teal-600', size = 20 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="9" y="3" width="6" height="18" rx="2" />
      <rect x="3" y="9" width="18" height="6" rx="2" />
    </svg>
  );
}

export function LeafDoodle({ className = 'text-emerald-500', size = 20 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  );
}

export function PharmacyStoreDoodle({ className = 'text-teal-700', size = 24 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
      <path d="M12 7v3" />
      <path d="M10.5 8.5h3" />
    </svg>
  );
}

export function DecorativeCurvedLine({ className = 'text-teal-300', width = 120, height = 24 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 24" fill="none" className={className}>
      <path d="M4 18 C30 2 60 26 90 8 C100 2 110 6 116 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
    </svg>
  );
}
