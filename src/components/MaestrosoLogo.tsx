import React from 'react';
import { MaestrosoEmblem } from './MaestrosoEmblem';

interface MaestrosoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  align?: 'left' | 'center';
}

export function MaestrosoLogo({
  className = '',
  size = 'md',
  showSubtitle = false,
  align = 'left',
}: MaestrosoLogoProps) {
  const pixelMap = {
    sm: { px: 28, text: 'text-xs sm:text-sm', sub: 'text-[8px] sm:text-[9px]', tracking: 'tracking-wider sm:tracking-widest' },
    md: { px: 36, text: 'text-sm sm:text-base md:text-lg', sub: 'text-[9px] sm:text-[10px]', tracking: 'tracking-wider sm:tracking-[0.18em]' },
    lg: { px: 56, text: 'text-xl sm:text-2xl', sub: 'text-[10px] sm:text-xs', tracking: 'tracking-widest sm:tracking-[0.22em]' },
    xl: { px: 80, text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm', tracking: 'tracking-widest sm:tracking-[0.25em]' },
  };

  const current = pixelMap[size];

  if (align === 'center') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <MaestrosoEmblem size={current.px} />
        
        <div className="mt-2 flex flex-col items-center">
          <h1
            className={`font-black font-serif ${current.text} ${current.tracking} text-white leading-none uppercase`}
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(182, 62, 136, 0.35)',
              letterSpacing: '0.15em',
            }}
          >
            MAESTROSO
          </h1>
          {showSubtitle && (
            <p
              className={`font-medium ${current.sub} uppercase tracking-[0.2em] text-[#DDD8E2] mt-1 hidden xs:block`}
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              Piano Practice Tracker
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 select-none min-w-0 ${className}`}>
      <MaestrosoEmblem size={current.px} />

      <div className="flex flex-col justify-center min-w-0">
        <span
          className={`font-black font-serif ${current.text} ${current.tracking} text-white leading-tight uppercase truncate`}
          style={{
            textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 0 16px rgba(182, 62, 136, 0.4)',
            letterSpacing: '0.12em',
          }}
        >
          MAESTROSO
        </span>
        {showSubtitle && (
          <span
            className={`font-medium ${current.sub} uppercase tracking-wider sm:tracking-[0.2em] text-[#DDD8E2] leading-none mt-0.5 hidden sm:inline-block`}
          >
            Piano Practice Tracker
          </span>
        )}
      </div>
    </div>
  );
}
