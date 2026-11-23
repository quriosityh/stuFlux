'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Booking } from '@/hooks/useBookings';
import { format } from 'date-fns';
import { X, MessageCircle, Star, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

interface Props {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  role: 'renter' | 'lender';
  onActionSuccess?: () => void;
  onOpenReview?: (booking: Booking) => void;
}

export default function BookingDetailSheet({ booking, isOpen, onClose, role, onActionSuccess, onOpenReview }: Props) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const isLender = role === 'lender';
  const totalUpfront = booking.financials.rentTotal + booking.financials.deliveryFee + booking.financials.securityDeposit;
  const earnings = booking.financials.rentTotal + booking.financials.deliveryFee;

  const handleAction = async (action: 'confirm' | 'reject' | 'cancel' | 'complete') => {
    setIsSubmitting(true);
    const token = await getToken();
    if (!token) {
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/proxy/bookings/${booking.id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onActionSuccess?.();
        onClose();
      } else {
        alert(`Failed to perform action: ${action}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChat = () => {
    if (booking.conversation_id) {
      router.push(`/messages/${booking.conversation_id}` as Route);
    } else {
      router.push('/messages' as Route);
    }
    onClose();
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal — slightly lower than center, always fully visible */}
          <div className="fixed inset-0 z-[60] flex items-end sm:items-end justify-center pb-6 sm:pb-10 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="pointer-events-auto w-full max-w-[520px] rounded-3xl shadow-2xl scrollbar-hide overflow-y-auto bg-background border border-border/50"
              style={{ maxHeight: 'min(680px, calc(100vh - 2rem))' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-10 h-1 rounded-full opacity-30" style={{ backgroundColor: 'var(--foreground)' }} />
              </div>

              <div className="px-6 pb-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Booking Detail</p>
                    <h2 className="text-[20px] font-semibold">
                      {booking.phase === 'pending' ? 'Pending Request' :
                        booking.phase === 'confirmed' ? 'Confirmed Booking' :
                          booking.phase === 'active' ? 'Active Rental' : 
                            booking.phase === 'cancelled' ? 'Cancelled Booking' : 'Completed Rental'}
                    </h2>
                  </div>
                  <button onClick={onClose} className="secondary-button p-2 rounded-full">
                    <X size={18} />
                  </button>
                </div>

                {/* Hero Section */}
                {!isLender ? (
                  <div className="flex gap-4 items-center p-3 rounded-2xl" style={{ border: '1px solid var(--border-color)' }}>
                    <img src={booking.listing.image} alt={booking.listing.title} className="w-[56px] h-[56px] rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] truncate">{booking.listing.title}</h3>
                      <p className="text-[13px] text-muted-foreground">Rs {booking.listing.dailyRate} / day</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[12px] text-muted-foreground">📍 {booking.listing.area}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center p-3 rounded-2xl" style={{ border: '1px solid var(--border-color)' }}>
                    <img src={booking.counterpart.avatar} alt={booking.counterpart.name} className="w-[56px] h-[56px] rounded-full object-cover border-2 flex-shrink-0" style={{ borderColor: 'var(--border-color)' }} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[16px]">{booking.counterpart.name}</h3>
                      <p className="text-[13px] text-muted-foreground mt-0.5">Member since {booking.counterpart.joined}</p>
                    </div>
                    <div className="text-right flex flex-col items-end flex-shrink-0 gap-1.5">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'color-mix(in srgb, var(--foreground) 7%, transparent)', border: '1px solid var(--border-color)' }}>
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-bold">{booking.counterpart.rating}</span>
                      </div>
                      <button className="tactile-glitch text-[12px] font-medium">{booking.counterpart.completedRentals} reviews</button>
                    </div>
                  </div>
                )}

                {/* Timeline rows */}
                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[14px] text-muted-foreground">Timeline</span>
                    <span className="font-medium text-[14px]">{format(booking.startDate, 'MMM d')} – {format(booking.endDate, 'MMM d')} ({booking.totalDays} days)</span>
                  </div>
                  {booking.deliveryType === 'delivery' && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-[14px] text-muted-foreground">Handoff</span>
                      <span className="font-semibold text-[14px] text-indigo-500">🚚 {isLender ? 'You deliver' : 'Host delivering'}</span>
                    </div>
                  )}
                  {!isLender && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-[14px] text-muted-foreground">Host Contact</span>
                      <div className="text-right">
                        <p className="font-medium text-[14px]">{booking.counterpart.name}</p>
                        {booking.phase !== 'pending' && <p className="text-[13px] text-muted-foreground mt-0.5">{booking.counterpart.phone}</p>}
                      </div>
                    </div>
                  )}
                  {isLender && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-[14px] text-muted-foreground">Renter Contact</span>
                      <div className="text-right">
                        <p className="font-medium text-[14px]">{booking.counterpart.name}</p>
                        {booking.phase !== 'pending' && <p className="text-[13px] text-muted-foreground mt-0.5">{booking.counterpart.phone}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Financials */}
                <div className="rounded-2xl p-4 space-y-3" style={{ border: '1px solid var(--border-color)' }}>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {isLender ? '💰 Your Earnings' : '💰 Price Breakdown'}
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[13px]">Rent (Rs {booking.listing.dailyRate} × {booking.totalDays} days)</span>
                    <span className="font-medium text-[14px]">Rs {booking.financials.rentTotal.toLocaleString()}</span>
                  </div>
                  {booking.financials.deliveryFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-[13px]">Delivery Fee</span>
                      <span className="font-medium text-[14px]">Rs {booking.financials.deliveryFee.toLocaleString()}</span>
                    </div>
                  )}
                  {!isLender && booking.financials.securityDeposit > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-[13px]">Security Deposit (Refundable)</span>
                      <span className="font-medium text-[14px]">Rs {booking.financials.securityDeposit.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-3 mt-1 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <span className="font-bold text-[15px]">{isLender ? 'Total Earnings' : 'Total Upfront Due'}</span>
                    <span className="font-bold text-[18px]">Rs {(isLender ? earnings : totalUpfront).toLocaleString()}</span>
                  </div>
                  {isLender && booking.financials.securityDeposit > 0 && (
                    <div className="-mx-4 -mb-4 p-4 rounded-b-2xl mt-3" style={{ background: 'color-mix(in srgb, #f59e0b 10%, transparent)', borderTop: '1px solid color-mix(in srgb, #f59e0b 20%, transparent)' }}>
                      <p className="text-[13px] font-medium text-amber-600 flex items-start gap-2">
                        <span className="mt-0.5">⚠️</span>
                        {booking.phase === 'active'
                          ? `Return Rs ${booking.financials.securityDeposit.toLocaleString()} deposit to renter when item is returned.`
                          : `Collect Rs ${booking.financials.securityDeposit.toLocaleString()} cash deposit at handoff.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rental Rules */}
                {!isLender && booking.listing.rules && booking.listing.rules.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">📄 Rental Rules</h4>
                    <ul className="space-y-1.5">
                      {booking.listing.rules.map((rule, idx) => (
                        <li key={idx} className="text-[14px] text-muted-foreground flex gap-2">
                          <span className="mt-0.5 opacity-50">–</span> {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  {isSubmitting ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)]"></div>
                    </div>
                  ) : (
                    <>
                      {isLender && booking.phase === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction('reject')}
                            className="secondary-button flex-1 py-3 text-[14px] rounded-xl font-semibold"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAction('confirm')}
                            className="hyper-liquid flex-1 py-3 text-[14px] rounded-xl font-semibold"
                          >
                            Accept Request
                          </button>
                        </div>
                      )}

                      {isLender && booking.phase === 'active' && (
                        <button
                          onClick={() => handleAction('complete')}
                          className="hyper-liquid w-full py-3.5 text-[14px] rounded-xl font-semibold flex justify-center items-center gap-2"
                        >
                          <Check size={18} />
                          Complete Rental
                        </button>
                      )}

                      {booking.phase === 'completed' && !booking.hasReviewed && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenReview?.(booking);
                          }}
                          className="hyper-liquid w-full py-3.5 text-[14px] rounded-xl font-semibold flex justify-center items-center gap-2"
                        >
                          <Star size={18} />
                          Write Review
                        </button>
                      )}

                      {booking.phase !== 'cancelled' && booking.phase !== 'completed' && (
                        <button
                          onClick={handleChat}
                          className="hyper-liquid w-full py-3.5 text-[14px] rounded-xl flex justify-center items-center gap-2 font-semibold"
                        >
                          <MessageCircle size={18} />
                          {booking.phase === 'pending' ? 'Coordinate Handoff' : 'Chat'}
                        </button>
                      )}

                      {!isLender && (booking.phase === 'pending' || booking.phase === 'confirmed') && (
                        <button
                          onClick={() => handleAction('cancel')}
                          className="secondary-button w-full py-3 text-[14px] rounded-xl font-semibold"
                        >
                          Cancel Request
                        </button>
                      )}
                    </>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
