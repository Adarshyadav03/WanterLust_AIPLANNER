import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = FolderOpen, title = 'No items found', message = 'There are no items to show at the moment.', actionLabel, onAction }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 max-w-md mx-auto text-center my-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
