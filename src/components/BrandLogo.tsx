import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  showText?: boolean;
  textClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'icon',
  showText = false,
  textClassName = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Size mapping for the logo badge (generous view without excessive padding)
  const sizeClasses = {
    sm: 'w-9 h-9 rounded-lg p-0.5',
    md: 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-1',
    lg: 'w-16 h-16 rounded-2xl p-1.5',
    xl: 'w-24 h-24 rounded-2xl p-2',
  };

  const fullSizeClasses = {
    sm: 'w-24 h-24 p-2',
    md: 'w-32 h-32 p-3',
    lg: 'w-48 h-48 p-4',
    xl: 'w-64 h-64 p-6',
  };

  if (variant === 'full') {
    return (
      <div
        className={`bg-white rounded-2xl shadow-xl border border-zinc-200 flex flex-col items-center justify-center text-center shrink-0 overflow-hidden ${fullSizeClasses[size]} ${className}`}
      >
        <img
          src="/logo.svg"
          alt="Movie Perfect Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* High-contrast crisp white badge matching user's uploaded logo */}
      <div
        className={`relative bg-white shadow-md shadow-sky-950/30 border border-zinc-100 flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 overflow-hidden ${sizeClasses[size]}`}
      >
        {!imgFailed ? (
          <img
            src="/logo-icon.svg"
            alt="Movie Perfect"
            className="w-full h-full object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          /* Inline SVG fallback with exact faceted geometric MP polygons */
          <svg
            viewBox="0 0 450 250"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="0,250 76,250 152,130 76,130" fill="#0055b8" />
            <polygon points="76,130 152,130 196,250 120,250" fill="#002b70" />
            <polygon points="120,250 196,250 238,65 162,65" fill="#0055b8" />
            <polygon points="162,65 238,65 282,250 206,250" fill="#002b70" />
            <polygon points="206,250 282,250 324,0 248,0" fill="#0055b8" />
            <path d="M 248,0 L 440,0 L 344,148 L 260,148 L 292,98 L 328,98 L 360,48 L 272,48 Z" fill="#0055b8" />
          </svg>
        )}
      </div>

      {showText && (
        <div className={`flex flex-col text-left ${textClassName}`}>
          <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
            Movie Perfect
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-sky-400 uppercase mt-0.5">
            Movie & Series Vault
          </span>
        </div>
      )}
    </div>
  );
};
