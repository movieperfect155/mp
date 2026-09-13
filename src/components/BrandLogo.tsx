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
          alt="Mobile Perfect Logo"
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
            alt="Mobile Perfect"
            className="w-full h-full object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          /* Inline SVG fallback with exact faceted geometric MP polygons */
          <svg
            viewBox="0 0 500 250"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="60,125 116,125 66,230 10,230" fill="#1555d8" />
            <polygon points="116,125 154,125 104,230 66,230" fill="#0b2469" />
            <polygon points="154,125 210,25 166,25 104,230" fill="#1d69f2" />
            <polygon points="210,25 246,25 186,230 152,230" fill="#0c256a" />
            <polygon points="246,25 302,25 206,230 186,230" fill="#0084ff" />
            <path d="M 286,25 L 450,25 L 398,139 L 282,139 L 308,85 L 366,85 L 380,53 L 300,53 Z" fill="#0099ff" />
          </svg>
        )}
      </div>

      {showText && (
        <div className={`flex flex-col text-left ${textClassName}`}>
          <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
            Mobile Perfect
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-sky-400 uppercase mt-0.5">
            Movie & Series Vault
          </span>
        </div>
      )}
    </div>
  );
};
