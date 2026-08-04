'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInCalendarDays } from 'date-fns';
import { X, MapPin, Truck, MessageSquare, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useApiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface BookingRequestSheetProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  selectedDates: { start: Date | null; end: Date | null };
  initialDelivery?: boolean;
}

export function BookingRequestSheet({
  isOpen,
  onClose,
  listing,
  selectedDates,
  initialDelivery = false,
}: BookingRequestSheetProps) {
  const api = useApiClient();
  const router = useRouter();

  const [wantsDelivery, setWantsDelivery] = useState(initialDelivery);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ conversationId?: string } | null>(null);

  useEffect(() => {
    setWantsDelivery(initialDelivery);
  }, [initialDelivery]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMessage(null);
      setSuccessData(null);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!selectedDates.start || !selectedDates.end) return null;

  const days = differenceInCalendarDays(selectedDates.end, selectedDates.start);
  const dailyRate = listing.daily_rate || 0;
  const subtotal = days * dailyRate;
  const deliveryFee = wantsDelivery && listing.delivery_available ? listing.delivery_fee || 0 : 0;
  const securityDeposit = listing.security_deposit || 0;
  const totalAmount = subtotal + deliveryFee + securityDeposit;

  const areaLabel = listing.area
    ? listing.area.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'the lender';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api
        .post('bookings', {
          json: {
            listing_id: listing.id,
            start_date: format(selectedDates.start!, 'yyyy-MM-dd'),
            end_date: format(selectedDates.end!, 'yyyy-MM-dd'),
            ...(wantsDelivery && listing.delivery_available ? { delivery: true } : {}),
            ...(message.trim() ? { message: message.trim() } : {}),
          },
        })
        .json<{ success: boolean; data?: { conversation_id?: string } }>();

      setSuccessData({
        conversationId: res.data?.conversation_id,
      });
    } catch (err: any) {
      const payload = err?.response ? await err.response.json().catch(() => null) : null;
      setErrorMessage(
        payload?.error?.message ?? payload?.message ?? 'Failed to send request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToChat = () => {
    onClose();
    if (successData?.conversationId) {
      router.push(`/messages/${successData.conversationId}` as Route);
    } else {
      router.push('/messages' as Route);
    }
  };

  const handleGoToBookings = () => {
    onClose();
    router.push('/bookings' as Route);
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

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="pointer-events-auto w-full max-w-[540px] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden bg-background border border-border/40 max-h-[92vh] sm:max-h-[88vh] flex flex-col"
            >
              {/* Header handle / close */}
              <div className="relative pt-4 pb-2 px-6 flex items-center justify-between border-b border-border/10 shrink-0">
                <div className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-foreground/20" />
                <div>
                  <h2 className="font-syne font-bold text-lg text-foreground">
                    {successData ? 'Booking Requested 🎉' : 'Confirm Rental Request'}
                  </h2>
                  <p className="text-xs text-foreground/50">
                    {successData ? 'Your request was dispatched' : 'Review details & send request to lender'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {successData ? (
                  /* Success View */
                  <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-1 max-w-sm mx-auto">
                      <h3 className="font-syne font-bold text-xl text-foreground">Request Sent to Owner!</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">
                        {listing.owner?.display_name || 'The owner'} has been notified via email, push notification, and live stream.
                      </p>
                    </div>

                    {/* Request recap card */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/20 text-left text-sm space-y-2">
                      <div className="flex items-center justify-between font-semibold">
                        <span>{listing.title}</span>
                        <span className="text-emerald-500 font-syne">Pending Approval</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-foreground/60 pt-1 border-t border-border/10">
                        <span>
                          {format(selectedDates.start, 'MMM d')} – {format(selectedDates.end, 'MMM d, yyyy')} ({days} {days === 1 ? 'day' : 'days'})
                        </span>
                        <span className="font-medium text-foreground">Rs. {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleGoToChat}
                        className="hyper-liquid flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} />
                        Message Owner
                      </button>
                      <button
                        onClick={handleGoToBookings}
                        className="secondary-button flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        View in Bookings
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Request Form View */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Item snapshot */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/30 border border-border/20">
                      <img
                        src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80'}
                        alt={listing.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-foreground truncate">{listing.title}</h4>
                        <p className="text-xs text-foreground/60 mt-0.5">
                          Host: <span className="font-medium text-foreground">{listing.owner?.display_name || 'Lender'}</span>
                        </p>
                        <p className="text-xs font-semibold text-[var(--accent)] mt-1">
                          Rs. {dailyRate.toLocaleString()} / day
                        </p>
                      </div>
                    </div>

                    {/* Dates summary */}
                    <div className="p-4 rounded-2xl border border-border/20 bg-background/50 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-widest text-foreground/50">Rental Period</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          {format(selectedDates.start, 'MMM d, yyyy')} → {format(selectedDates.end, 'MMM d, yyyy')}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/10 text-accent">
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Toggle (if available) */}
                    {listing.delivery_available && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                          Handoff Preference
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setWantsDelivery(false)}
                            className={cn(
                              'p-3 rounded-2xl border text-left text-xs transition-all flex flex-col gap-1.5',
                              !wantsDelivery
                                ? 'border-[var(--accent)] bg-accent/10 font-semibold'
                                : 'border-border/20 hover:bg-border/5 text-foreground/70'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className={!wantsDelivery ? 'text-[var(--accent)]' : ''} />
                              <span>Self Pickup</span>
                            </div>
                            <span className="text-[11px] text-foreground/50">Free · {areaLabel}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setWantsDelivery(true)}
                            className={cn(
                              'p-3 rounded-2xl border text-left text-xs transition-all flex flex-col gap-1.5',
                              wantsDelivery
                                ? 'border-[var(--accent)] bg-accent/10 font-semibold'
                                : 'border-border/20 hover:bg-border/5 text-foreground/70'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <Truck size={14} className={wantsDelivery ? 'text-[var(--accent)]' : ''} />
                              <span>Delivery</span>
                            </div>
                            <span className="text-[11px] text-foreground/50">
                              +Rs. {(listing.delivery_fee || 0).toLocaleString()}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pricing Breakdown */}
                    <div className="p-4 rounded-2xl border border-border/20 bg-muted/20 space-y-2.5 text-xs">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
                        Financial Summary
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/70">
                          Rs. {dailyRate.toLocaleString()} × {days} {days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                      </div>
                      {wantsDelivery && listing.delivery_available && (listing.delivery_fee || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Delivery Fee</span>
                          <span className="font-medium">Rs. {(listing.delivery_fee || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {securityDeposit > 0 && (
                        <div className="flex justify-between">
                          <span className="text-foreground/70">
                            Security Deposit <span className="text-foreground/40">(refundable)</span>
                          </span>
                          <span className="font-medium">Rs. {securityDeposit.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border/20 flex justify-between font-syne font-bold text-sm text-foreground">
                        <span>Total Due Upfront</span>
                        <span>Rs. {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Message to Owner */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-foreground/50 flex items-center justify-between">
                        <span>Note to Lender (Optional)</span>
                        <span className="text-[10px] font-normal text-foreground/40">{message.length}/300</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                        placeholder="Introduce yourself or mention any specific requests..."
                        rows={2}
                        className="w-full rounded-2xl border border-border/20 bg-background/60 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                      />
                    </div>

                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
                        {errorMessage}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-foreground/50 justify-center">
                      <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                      <span>Payment and deposit details will be coordinated securely upon confirmation.</span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full hyper-liquid py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                          <span>Sending Request…</span>
                        </>
                      ) : (
                        <span>Confirm & Send Request</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
