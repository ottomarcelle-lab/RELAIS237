import React from 'react';

interface CameroonFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CameroonFlag: React.FC<CameroonFlagProps> = ({ className = '', size = 'md' }) => {
  const dimensions = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-5.5'
  }[size];

  return (
    <span 
      className={`inline-flex items-stretch overflow-hidden rounded-[2px] shadow-xs border border-white/20 ${dimensions} ${className}`}
      title="Cameroun (237)"
      aria-label="Drapeau du Cameroun"
    >
      {/* Vert */}
      <span className="w-1/3 bg-[#007a3d]" />
      {/* Rouge avec étoile jaune */}
      <span className="w-1/3 bg-[#ce1126] relative flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#fcd116] drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      </span>
      {/* Jaune */}
      <span className="w-1/3 bg-[#fcd116]" />
    </span>
  );
};
