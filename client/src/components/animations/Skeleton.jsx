import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonBase({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-slate-200 rounded-xl ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

export function DestinationSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md space-y-4">
      <SkeletonBase className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-3/4" />
        <SkeletonBase className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <SkeletonBase className="h-5 w-20" />
        <SkeletonBase className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function HotelSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col md:flex-row gap-4">
      <SkeletonBase className="h-44 md:w-56 w-full rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonBase className="h-6 w-2/3" />
        <SkeletonBase className="h-4 w-1/3" />
        <SkeletonBase className="h-4 w-full" />
        <div className="flex justify-between items-center pt-4">
          <SkeletonBase className="h-6 w-28" />
          <SkeletonBase className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-3 border border-slate-100">
      <div className="flex items-center gap-3">
        <SkeletonBase className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <SkeletonBase className="h-4 w-32" />
          <SkeletonBase className="h-3 w-20" />
        </div>
      </div>
      <SkeletonBase className="h-4 w-1/2" />
      <SkeletonBase className="h-12 w-full" />
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBase className="h-11 w-11 rounded-full" />
        <div className="space-y-1">
          <SkeletonBase className="h-4 w-36" />
          <SkeletonBase className="h-3 w-24" />
        </div>
      </div>
      <SkeletonBase className="h-16 w-full" />
      <SkeletonBase className="h-64 w-full rounded-xl" />
    </div>
  );
}
