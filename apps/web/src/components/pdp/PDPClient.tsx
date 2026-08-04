'use client';

import { useState, useEffect, useRef } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { useApiClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';
import { Breadcrumb } from './Breadcrumb';
import { TitleActions } from './TitleActions';
import { PhotoGallery } from './PhotoGallery';
import { ListingMeta } from './ListingMeta';
import { LenderSnapshot } from './LenderSnapshot';
import { ItemHighlights } from './ItemHighlights';
import { Description } from './Description';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { BookingCard } from './BookingCard';
import { ReviewsSection } from './ReviewsSection';
import { LenderProfile } from './LenderProfile';
import { PDPStickyNav } from './PDPStickyNav';
import { PDPMobileNav } from './PDPMobileNav';
import { TrustStrip } from './TrustStrip';

interface PDPClientProps {
  listing: any;
  availability: any[];
}

export default function PDPClient({ listing, availability }: PDPClientProps) {
  const api = useApiClient();
  const { isSignedIn } = useAuth();
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showNavBookingCTA, setShowNavBookingCTA] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ── Scroll sentinel: show sticky nav CTA once the booking sidebar scrolls off-screen ──
  useEffect(() => {
    const handleScroll = () => {
      const anchor = document.getElementById('booking-card-anchor');
      if (!anchor) return;
      setShowNavBookingCTA(anchor.getBoundingClientRect().bottom <= 64);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!listing) return null;

  // ── Booking request ──────────────────────────────────────────────────────
  const handleBookingRequest = async ({ delivery = false }: { delivery?: boolean } = {}) => {
    if (!isSignedIn) {
      window.location.href = '/auth/sign-in';
      return;
    }
    if (!selectedDates.start || !selectedDates.end) return;

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await api
        .post('bookings', {
          json: {
            listing_id: listing.id,
            start_date: format(selectedDates.start, 'yyyy-MM-dd'),
            end_date: format(selectedDates.end, 'yyyy-MM-dd'),
            ...(delivery && listing.delivery_available ? { delivery: true } : {}),
          },
        })
        .json<{ success: boolean; data?: { conversation_id?: string } }>();

      setBookingSuccess(true);

      // Navigate to the conversation thread if the API returns one
      if (res.data?.conversation_id) {
        setTimeout(() => {
          window.location.href = `/messages/${res.data!.conversation_id}`;
        }, 800);
      }
    } catch (e: any) {
      const payload = e?.response
        ? await e.response.json().catch(() => null)
        : null;
      setBookingError(
        payload?.error?.message ?? payload?.message ?? 'Failed to request booking. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookClick = ({ delivery = false }: { delivery?: boolean } = {}) => {
    if (!selectedDates.start || !selectedDates.end) {
      const el = document.getElementById('availability-section');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      handleBookingRequest({ delivery });
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const days =
    selectedDates.start && selectedDates.end
      ? differenceInCalendarDays(selectedDates.end, selectedDates.start)
      : 0;

  return (
    <>
      <PDPMobileNav />
      <PDPStickyNav
        dailyRate={listing.daily_rate}
        showBookingCTA={showNavBookingCTA}
        onBookClick={handleBookClick}
        canBook={!!selectedDates.start && !!selectedDates.end}
      />

      <div className="mx-auto md:px-4 md:py-8 pb-32 md:pb-8 max-w-7xl">
        {/* Desktop breadcrumb + title */}
        <div className="hidden md:block">
          <Breadcrumb
            categoryName={listing.category?.name || 'Category'}
            categorySlug={listing.category?.slug || 'category'}
            listingTitle={listing.title}
          />
          <TitleActions title={listing.title} />
        </div>

        {/* Photo gallery */}
        <PhotoGallery photos={listing.photos} title={listing.title} />

        {/* Two-column layout */}
        <div className="px-4 md:px-0 flex flex-col md:flex-row gap-12 relative z-10 bg-background md:bg-transparent -mt-8 pt-8 rounded-t-[32px] md:rounded-none md:mt-6 md:pt-0">

          {/* ── LEFT COLUMN (60%) ─────────────────────────────────────── */}
          <div className="flex-1 md:w-3/5 lg:w-[60%] w-full min-w-0">

            {/* Meta: title (mobile), area, rating, review count + condition badge */}
            <ListingMeta
              title={listing.title}
              city={listing.area ?? listing.city}
              rating={listing.rating == null ? 0 : Number(listing.rating)}
              reviewCount={Number(listing.review_count ?? 0)}
              condition={listing.condition}
            />

            {/* Lender snapshot */}
            <LenderSnapshot owner={listing.owner} />

            <div className="md:hidden w-full h-px bg-border/10 my-6" />

            {/* Logistics highlights */}
            <ItemHighlights
              deliveryAvailable={listing.delivery_available}
              minRentalDays={listing.min_rental_days}
              securityDeposit={listing.security_deposit}
              rentalRules={listing.rental_rules}
              area={listing.area}
            />

            <div className="md:hidden w-full h-px bg-border/10 my-6" />

            {/* Description + specs */}
            <Description text={listing.description} />

            <div className="md:hidden w-full h-px bg-border/10 my-6" />

            {/* Availability calendar */}
            <AvailabilityCalendar
              mode="renter"
              blockedDates={availability}
              selectedDates={selectedDates}
              onSelectDates={setSelectedDates}
              minRentalDays={listing.min_rental_days}
              maxRentalDays={listing.max_rental_days}
            />

            {/* Reviews — real API, client-side fetch */}
            <ReviewsSection
              listingId={listing.id}
              initialAverage={listing.rating == null ? 0 : Number(listing.rating)}
              initialCount={Number(listing.review_count ?? 0)}
            />

          </div>

          {/* ── RIGHT COLUMN (40%) — Desktop sticky sidebar ───────────── */}
          <div id="booking-sidebar" className="hidden md:block md:w-2/5 lg:w-[40%] w-full relative">
            <div id="booking-card-anchor" className="sticky top-32 max-w-[380px] ml-auto">
              {bookingSuccess ? (
                <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/8 p-8 text-center">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="font-bold text-emerald-400 text-lg font-syne">Request sent!</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    The owner will confirm shortly. Redirecting to your conversation…
                  </p>
                </div>
              ) : (
                <>
                  {bookingError && (
                    <div className="mb-3 rounded-2xl border border-red-400/30 bg-red-400/8 px-4 py-3 text-sm text-red-400">
                      {bookingError}
                    </div>
                  )}
                  <BookingCard
                    dailyRate={listing.daily_rate}
                    securityDeposit={listing.security_deposit}
                    selectedDates={selectedDates}
                    onBookingRequest={handleBookClick}
                    isSticky={false}
                    deliveryAvailable={listing.delivery_available}
                    deliveryFee={listing.delivery_fee}
                    area={listing.area}
                    minRentalDays={listing.min_rental_days}
                    maxRentalDays={listing.max_rental_days}
                  />
                </>
              )}
            </div>
          </div>

          {/* ── MOBILE BOTTOM BAR ─────────────────────────────────────── */}
          <div className="md:hidden">
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/10 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              {bookingSuccess ? (
                <p className="text-center text-emerald-400 font-bold text-sm py-2">
                  Request sent! The owner will confirm shortly. 🎉
                </p>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold font-syne text-xl">Rs. {listing.daily_rate.toLocaleString()}</div>
                    <div className="text-sm text-foreground/60 font-medium">
                      {selectedDates.start && selectedDates.end ? (
                        `For ${days} day${days !== 1 ? 's' : ''} · ${format(selectedDates.start, 'MMM d')} – ${format(selectedDates.end, 'MMM d')}`
                      ) : (
                        'Per day'
                      )}
                    </div>
                    {bookingError && (
                      <p className="text-xs text-red-400 mt-1">{bookingError}</p>
                    )}
                  </div>
                  <button
                    disabled={bookingLoading}
                    onClick={() => {
                      if (!selectedDates.start || !selectedDates.end) {
                        document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        handleBookingRequest({ delivery: false });
                      }
                    }}
                    className="hyper-liquid px-8 py-3 text-sm flex-1 max-w-[200px] disabled:opacity-50"
                  >
                    {bookingLoading
                      ? 'Sending…'
                      : !selectedDates.start || !selectedDates.end
                        ? 'Check Dates'
                        : 'Request'}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* LenderProfile section */}
        <LenderProfile owner={listing.owner} listingId={listing.id} />

        {/* Trust strip */}
        <TrustStrip />
      </div>
    </>
  );
}
