'use client';

import React from 'react';
import Image from 'next/image';

export type MediVariant =
  | 'happy'
  | 'wink'
  | 'thinking'
  | 'celebrating'
  | 'helpful'
  | 'upload'
  | 'calendar'
  | 'schedule'
  | 'reminder'
  | 'pharmacy'
  | 'language'
  | 'support'
  | 'empty';

export type MediAnimation = 'none' | 'float' | 'bounce' | 'wave' | 'tilt';

export type MediSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';

interface MediMascotProps {
  variant?: MediVariant;
  size?: MediSize;
  animation?: MediAnimation;
  decorative?: boolean;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

const variantToFile: Record<string, string> = {
  happy: '/mascot/medi-happy.svg',
  wink: '/mascot/medi-wink.svg',
  thinking: '/mascot/medi-thinking.svg',
  celebrating: '/mascot/medi-celebrating.svg',
  helpful: '/mascot/medi-helpful.svg',
  upload: '/mascot/medi-upload.svg',
  calendar: '/mascot/medi-calendar.svg',
  schedule: '/mascot/medi-calendar.svg',
  reminder: '/mascot/medi-reminder.svg',
  pharmacy: '/mascot/medi-pharmacy.svg',
  language: '/mascot/medi-language.svg',
  support: '/mascot/medi-support.svg',
  empty: '/mascot/medi-empty.svg',
};

const sizeDimensions: Record<Exclude<MediSize, 'custom'>, { w: number; h: number; styleClass: string }> = {
  xs: { w: 36, h: 44, styleClass: 'w-9 h-11' },
  sm: { w: 54, h: 65, styleClass: 'w-14 h-16' },
  md: { w: 84, h: 100, styleClass: 'w-20 h-24' },
  lg: { w: 120, h: 144, styleClass: 'w-28 h-36' },
  xl: { w: 160, h: 192, styleClass: 'w-40 h-48' },
  '2xl': { w: 210, h: 252, styleClass: 'w-52 h-64' },
};

const defaultAlts: Record<string, string> = {
  happy: 'Medi the friendly capsule smiling and welcoming you',
  wink: 'Medi the capsule mascot playfully winking',
  thinking: 'Medi the capsule mascot thoughtfully reflecting',
  celebrating: 'Medi the capsule mascot celebrating with a golden trophy and confetti',
  helpful: 'Medi the capsule mascot holding a bright idea lightbulb',
  upload: 'Medi the capsule mascot holding a prescription clipboard',
  calendar: 'Medi the capsule mascot holding a medication calendar',
  schedule: 'Medi the capsule mascot holding a medication calendar',
  reminder: 'Medi the capsule mascot standing beside an alarm clock',
  pharmacy: 'Medi the capsule mascot holding a shopping basket for online medicines',
  language: 'Medi the capsule mascot speaking multiple languages',
  support: 'Medi the capsule mascot wearing a stethoscope and offering supportive care',
  empty: 'Medi the capsule mascot resting calmly',
};

export default function MediMascot({
  variant = 'happy',
  size = 'md',
  animation = 'none',
  decorative = true,
  alt,
  className = '',
  width,
  height,
}: MediMascotProps) {
  const src = variantToFile[variant] || variantToFile.happy;
  const accessibleAlt = decorative ? '' : (alt || defaultAlts[variant] || 'Medi mascot');

  const animationClass = {
    none: '',
    float: 'animate-float motion-reduce:animate-none',
    bounce: 'animate-bounce-subtle motion-reduce:animate-none',
    wave: 'animate-wiggle motion-reduce:animate-none',
    tilt: 'hover:rotate-3 transition-transform duration-300',
  }[animation];

  const dim = size !== 'custom' ? sizeDimensions[size] : { w: width || 84, h: height || 100, styleClass: '' };
  const finalWidth = width || dim.w;
  const finalHeight = height || dim.h;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${dim.styleClass} ${animationClass} ${className}`}
      aria-hidden={decorative}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={accessibleAlt}
        width={finalWidth}
        height={finalHeight}
        className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
