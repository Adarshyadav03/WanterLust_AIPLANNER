import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
          <Compass className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-900">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Off the Beaten Path</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or destination you are looking for has been moved or doesn't exist.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
