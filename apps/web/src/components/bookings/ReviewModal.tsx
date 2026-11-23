'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Booking } from '@/hooks/useBookings';
import { X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  role: 'renter' | 'lender';
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Terrible 😞',
  2: 'Poor 😕',
  3: 'Okay 🙂',
  4: 'Good 😊',
  5: 'Excellent! 🌟',
};

export default function ReviewModal({
  booking,
  isOpen,
  onClose,
  role,
  onSuccess,
}: ReviewModalProps) {
  const { getToken } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setRating(5);
      setHoverRating(null);
      setComment('');
      setErrorMessage(null);
      setIsSuccess(false);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!booking) return null;

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const isLender = role === 'lender';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setErrorMessage('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch('/api/proxy/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const payload = (await res.json().catch(() => null)) as {
        error?: { message?: string };
        message?: string;
      } | null;

      if (!res.ok) {
        throw new Error(payload?.error?.message || payload?.message || 'Failed to submit review');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while submitting your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Centered */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="pointer-events-auto w-full max-w-[480px] rounded-[32px] shadow-2xl overflow-hidden chrome-card bg-surface/95 border border-border/30 backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/40">
                <div>
                  <h2 className="text-[19px] font-semibold tracking-tight text-foreground">
                    Write a Review
                  </h2>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {isLender ? 'Rate your experience with the renter' : 'Rate your experience with the host & item'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Success View */}
              {isSuccess ? (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-[18px] font-bold text-foreground">Review Submitted!</h3>
                  <p className="text-[13px] text-muted-foreground max-w-xs">
                    Thank you for sharing your feedback with the university community.
                  </p>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Context Card: Item + Target Person */}
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card/60 border border-border/50">
                    {/* Item Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/40">
                      <img
                        src={booking.listing.image}
                        alt={booking.listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[14px] text-foreground truncate">
                        {booking.listing.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-border/50">
                          <img
                            src={booking.counterpart.avatar}
                            alt={booking.counterpart.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">
                          {isLender ? 'Renter: ' : 'Host: '}
                          <span className="font-medium text-foreground">{booking.counterpart.name}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                      Overall Rating
                    </p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 focus:outline-none transform hover:scale-115 transition-transform duration-150"
                        >
                          <Star
                            size={32}
                            className={`${
                              star <= activeRating
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-muted-foreground/30 hover:text-amber-400/50'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-[13px] font-semibold text-foreground/90 h-5">
                      {RATING_LABELS[activeRating] || ''}
                    </p>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[12px] text-muted-foreground">
                      <label htmlFor="review-comment" className="font-medium">
                        Your Feedback (Optional)
                      </label>
                      <span>{comment.length} / 2000</span>
                    </div>
                    <textarea
                      id="review-comment"
                      rows={4}
                      maxLength={2000}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        isLender
                          ? 'Share how the rental went. Was the item returned on time and in good condition?'
                          : 'Share your experience with this rental. Was the item as described and handoff smooth?'
                      }
                      className="w-full rounded-2xl bg-card border border-border/60 p-3.5 text-[14px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-[var(--accent)] resize-none"
                    />
                  </div>

                  {/* Error display */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[13px]">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="hyper-liquid w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
                      ) : (
                        'Post Review'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
