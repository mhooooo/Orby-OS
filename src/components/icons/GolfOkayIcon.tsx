'use client';

import React from 'react';

interface GolfOkayIconProps {
  size?: number;
  className?: string;
}

// Brand accent colors
const ACCENT_COLORS = {
  orange: '#FF6B35',    // Bright orange
  bluesky: '#00D4FF',   // Cyan/light blue
  red: '#FF3B3B',       // Red like my blood
  purpp: '#A855F7',     // Purple
  yelloww: '#FBBF24',   // Yellow
};

export function GolfOkayIcon({ size = 32, className = '' }: GolfOkayIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Golf ball */}
      <circle cx="16" cy="16" r="12" fill="currentColor" />
      {/* Colored dimples */}
      <circle cx="12" cy="11" r="2.5" fill={ACCENT_COLORS.orange} />
      <circle cx="20" cy="11" r="2.5" fill={ACCENT_COLORS.bluesky} />
      <circle cx="16" cy="19" r="2.5" fill={ACCENT_COLORS.purpp} />
      <circle cx="9" cy="18" r="2" fill={ACCENT_COLORS.red} />
      <circle cx="23" cy="18" r="2" fill={ACCENT_COLORS.yelloww} />
    </svg>
  );
}
