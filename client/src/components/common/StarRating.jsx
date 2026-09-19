import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showCount = false,
  count = 0,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentVal = readOnly ? Number(rating) || 0 : hoverRating || Number(value) || 0;

  if (readOnly) {
    return (
      <div className="inline-flex items-center gap-1">
        <div className="flex items-center text-amber-400">
          {[1, 2, 3, 4, 5].map((star, i) => {
            const isFull = currentVal >= star;
            const isHalf = currentVal >= star - 0.5 && currentVal < star;

            return (
              <motion.span
                key={star}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="relative inline-block"
              >
                <Star
                  className={`${starSizeClasses[size] || 'w-4 h-4'} ${
                    isFull
                      ? 'fill-amber-400 text-amber-400'
                      : isHalf
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-slate-300 fill-slate-100'
                  }`}
                />
              </motion.span>
            );
          })}
        </div>
        {showCount && (
          <span className="text-xs font-bold text-slate-700 ml-1">
            ⭐ {currentVal.toFixed(1)} {count > 0 && <span className="text-slate-400 font-normal">({count})</span>}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 cursor-pointer select-none">
      {[1, 2, 3, 4, 5].map((star, i) => {
        const isFilled = star <= currentVal;

        return (
          <motion.button
            type="button"
            key={star}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.25, rotate: isFilled ? 5 : 0 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 focus:outline-none"
          >
            <Star
              className={`${starSizeClasses[size] || 'w-6 h-6'} transition-colors duration-200 ${
                isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-md' : 'text-slate-300 hover:text-amber-300'
              }`}
            />
          </motion.button>
        );
      })}
      <span className="text-xs font-extrabold text-amber-500 ml-2">
        {currentVal > 0 ? `${currentVal} Star${currentVal > 1 ? 's' : ''}` : 'Select rating'}
      </span>
    </div>
  );
}

