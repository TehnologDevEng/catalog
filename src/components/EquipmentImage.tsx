import { Cog } from 'lucide-react';
import { useState } from 'react';

interface EquipmentImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function EquipmentImage({ src, alt, className = '' }: EquipmentImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 p-6 ${className}`}
      >
        <Cog className="w-10 h-10 text-slate-400 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-center text-slate-600 max-w-[18rem]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
