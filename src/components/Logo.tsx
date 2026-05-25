import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  withWhiteBg?: boolean;
}

export default function Logo({ 
  className = '', 
  size = 'md',
  showText = true,
  withWhiteBg = true
}: LogoProps) {
  // Exact Brand Colors from the provided corporate image
  const goldColor = '#C9A961'; // Rich Champagne Gold
  const redColor = '#B33A3A';  // Deep Ruby Red
  const darkColor = '#1A1A1A';  // Premium Off-black / Charcoal
  const textColor = '#1A1A1A';
  const subTextColor = '#1A1A1A';

  // Scale calculations for size variants
  let scale = 1.0;
  if (size === 'sm') {
    scale = 0.8;
  } else if (size === 'lg') {
    scale = 1.35;
  }

  const logoNode = (
    <div className={`flex items-center space-x-3 select-none ${withWhiteBg ? '' : className}`}>
      {/* Precision Vector Emblem matching the uploaded company identity */}
      <svg 
        width={38 * scale} 
        height={40 * scale} 
        viewBox="0 0 38 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Left Segment: Elegant Gold chevron pointing upwards-left */}
        <path 
          d="M1 21L12 11V34L9 31V20L1 26V21Z" 
          fill={goldColor} 
        />
        <path 
          d="M12 11L1 21V16L12 6V11Z" 
          fill={goldColor}
          opacity="0.9"
        />

        {/* Middle Segment: Bold Red architectural column */}
        <path 
          d="M14 6V37H18V6H14Z" 
          fill={redColor} 
        />

        {/* Right Segment: Sleek Black geometric lines building peak, spelling "P" */}
        <path 
          d="M20 6L31 16V24H27V16L20 9.5V6Z" 
          fill={darkColor} 
        />
        <path 
          d="M20 9.5L27 16V34L20 37V9.5Z" 
          fill={darkColor} 
          opacity="0.9"
        />
        <path 
          d="M27 16H31V23C31 25.5 29 27.5 26.5 27.5H23V24.5H26.5C26.8 24.5 27 24.3 27 24V16Z" 
          fill={darkColor} 
        />
      </svg>

      {/* Corporate Brand Typography (Identical to reference logo image) */}
      {showText && (
        <div className="flex flex-col text-left justify-center select-none" style={{ height: 40 * scale }}>
          <span 
            className="font-sans font-black tracking-[0.22em] leading-none text-zinc-900"
            style={{ 
              fontSize: `${17 * scale}px`, 
              color: textColor,
            }}
          >
            PRIME
          </span>
          <div className="flex items-center space-x-1 pt-1 select-none">
            {/* Horizontal line left wrapper keyline */}
            <div className="h-[1px] bg-zinc-800/40" style={{ width: `${8 * scale}px` }} />
            <span 
              className="font-sans font-extrabold tracking-[0.25em] text-zinc-900 uppercase whitespace-nowrap leading-none" 
              style={{ 
                fontSize: `${6.8 * scale}px`, 
                color: subTextColor,
              }}
            >
              PROPERTY
            </span>
            {/* Horizontal line right wrapper keyline */}
            <div className="h-[1px] bg-zinc-800/40" style={{ width: `${8 * scale}px` }} />
          </div>
        </div>
      )}
    </div>
  );

  // If withWhiteBg is true, wrap the logo inside an executive white background card badge
  if (withWhiteBg) {
    return (
      <div 
        className={`inline-flex items-center bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      >
        {logoNode}
      </div>
    );
  }

  return logoNode;
}

