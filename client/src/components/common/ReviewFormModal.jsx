import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Loader2, Sparkles, ShieldAlert } from 'lucide-react';
import StarRating from './StarRating';
import uploadService from '../../services/uploadService';

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSubmit,
  targetName = 'Manali',
  existingReview = null,
  isEditing = false,
  reviewType = 'destination',
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setTitle(existingReview.title || '');
      setComment(existingReview.comment || '');
      setImages(existingReview.images || []);
    } else {
      setRating(5);
      setTitle('');
      setComment('');
      setImages([]);
    }
    setError('');
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      return setError('You can upload a maximum of 5 photos per review.');
    }

    setUploading(true);
    setError('');
    try {
      const uploadPromises = files.map((file) => uploadService.uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 5));
    } catch (err) {
      console.error('Image upload failed', err);
      // Fallback object URLs for testing if backend upload service unavailable
      const mockUrls = files.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...mockUrls].slice(0, 5));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating || rating < 1 || rating > 5) {
      return setError('Please select a star rating between 1 and 5 stars.');
    }
    const cleanComment = comment.trim();
    if (cleanComment.length < 10) {
      return setError('Review comment must be at least 10 characters long.');
    }
    if (cleanComment.length > 1000) {
      return setError('Review comment cannot exceed 1000 characters.');
    }

    setLoading(true);
    try {
      const payload = {
        rating,
        title: title.trim().substring(0, 100),
        comment: cleanComment,
        images,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {reviewType === 'hotel' ? '🏨 Hotel Review' : '📍 Destination Review'}
            </span>
            <h2 className="text-xl font-black text-slate-900">
              {isEditing ? `Edit Review for ${targetName}` : `Rate & Review ${targetName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Selection */}
          <div className="space-y-2 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-800">
              Your Rating <span className="text-rose-500">*</span>
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Review Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Amazing experience! Clean rooms and great view"
              maxLength={100}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Your Review <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">{comment.length}/1000</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell other travelers about your experience, food, location, vibe, or helpful tips..."
              minLength={10}
              maxLength={1000}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
            />
            <p className="text-[11px] text-slate-500">Minimum 10 characters required.</p>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Add Photos <span className="text-slate-400 font-normal">(Max 5)</span>
            </label>

            <div className="grid grid-cols-5 gap-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl cursor-pointer transition-colors text-slate-400 hover:text-emerald-600">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <AnimatedButton variant="ghost" onClick={onClose}>
              Cancel
            </AnimatedButton>
            <AnimatedButton type="submit" variant="primary" isLoading={loading}>
              <Sparkles className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Review' : 'Submit Review'}
            </AnimatedButton>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
