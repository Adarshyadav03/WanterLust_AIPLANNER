import React from 'react';
import { Compass } from 'lucide-react';

export default function Loader({ message = 'Loading details...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-spin">
          <Compass className="w-8 h-8 text-slate-950 stroke-[2.5]" />
        </div>
      </div>
      <p className="text-slate-300 font-semibold text-sm animate-pulse">{message}</p>
    </div>
  );
}
