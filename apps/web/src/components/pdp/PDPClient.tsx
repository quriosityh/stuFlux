'use client';

import { useState, useEffect, useRef } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { Breadcrumb } from './Breadcrumb';
import { TitleActions } from './TitleActions';
import { PhotoGallery } from './PhotoGallery';
import { ListingMeta } from './ListingMeta';
import { LenderSnapshot } from './LenderSnapshot';
import { ItemHighlights } from './ItemHighlights';
import { Description } from './Description';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { ReviewsSection } from './ReviewsSection';
import { LenderProfile } from './LenderProfile';
import { BookingCard } from './BookingCard';
import { PDPStickyNav } from './PDPStickyNav';
import { PDPMobileNav } from './PDPMobileNav';

interface PDPClientProps {
  listing: any;
  availability: any[];
}

export default function PDPClient({ listing, availability }: PDPClientProps) {
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showNavBookingCTA, setShowNavBookingCTA] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show booking CTA in navbar when the BookingCard starts going behind the nav
    const handleScroll = () => {
      const rightCol = document.getElementById('booking-sidebar');
      const anchor = document.getElementById('booking-card-anchor');
      if (!rightCol || !anchor) return;

      const rightColRect = rightCol.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      
      // Show CTA when the card's bottom is at or above the nav (~64px)
      const cardIsOverlappingNav = anchorRect.bottom <= 64;
      setShowNavBookingCTA(cardIsOverlappingNav);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!listing) return null;

  const handleBookingRequest = () => {
    // Handle booking logic here
    console.log("Booking requested for dates:", selectedDates);
    alert(`Booking requested for Rs. ${listing.daily_rate}/day from ${selectedDates.start?.toLocaleDateString()} to ${selectedDates.end?.toLocaleDateString()}`);
  };

  const handleBookClick = () => {
    if (!selectedDates.start || !selectedDates.end) {
      const el = document.getElementById('availability-section');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      handleBookingRequest();
    }
  };

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
        <div className="hidden md:block">
          <Breadcrumb 
            categoryName={listing.category?.name || 'Category'} 
            categorySlug={listing.category?.slug || 'category'} 
            listingTitle={listing.title} 
          />
          <TitleActions title={listing.title} />
        </div>
        
        <PhotoGallery photos={listing.photos} title={listing.title} />

        <div className="px-4 md:px-0 flex flex-col md:flex-row gap-12 relative z-10 bg-background md:bg-transparent -mt-8 pt-8 rounded-t-[32px] md:rounded-none md:mt-6 md:pt-0">
          
          {/* LEFT COLUMN (60%) */}
          <div className="flex-1 md:w-3/5 lg:w-[60%] w-full min-w-0">
            <ListingMeta 
              title={listing.title}
              city={listing.city} 
              reviewCount={7}
              rating={3.9}
            />

            <LenderSnapshot owner={listing.owner} />
            <div className="md:hidden w-full h-px bg-border/10 my-6" />
            
            <ItemHighlights 
              deliveryAvailable={listing.delivery_available}
              minRentalDays={listing.min_rental_days}
              securityDeposit={listing.security_deposit}
            />
            <div className="md:hidden w-full h-px bg-border/10 my-6" />
            
            <Description text={listing.description} />
            <div className="md:hidden w-full h-px bg-border/10 my-6" />
            
            <AvailabilityCalendar 
              blockedDates={availability}
              selectedDates={selectedDates}
              onSelectDates={setSelectedDates}
              minRentalDays={listing.min_rental_days}
              maxRentalDays={listing.max_rental_days}
            />
          </div>

          {/* RIGHT COLUMN (40%) - Desktop Sticky Sidebar */}
          <div id="booking-sidebar" className="hidden md:block md:w-2/5 lg:w-[40%] w-full relative">
            <div id="booking-card-anchor" className="sticky top-32 max-w-[380px] ml-auto">
              <BookingCard 
                dailyRate={listing.daily_rate}
                securityDeposit={listing.security_deposit}
                selectedDates={selectedDates}
                onBookingRequest={handleBookingRequest}
                isSticky={false} // Container handles stickiness
              />
            </div>
          </div>

          {/* MOBILE BOTTOM BAR */}
          <div className="md:hidden">
            
            {/* Fixed Bottom Booking Bar for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/10 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold font-syne text-xl">Rs. {listing.daily_rate.toLocaleString()}</div>
                  <div className="text-sm text-foreground/60 font-medium">
                    {selectedDates.start && selectedDates.end ? (
                      `For ${differenceInCalendarDays(selectedDates.end, selectedDates.start)} days • ${format(selectedDates.start, 'MMM d')} - ${format(selectedDates.end, 'd')}`
                    ) : (
                      'Per day'
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    // On mobile, if dates aren't selected, scroll to calendar. Else, book.
                    if (!selectedDates.start || !selectedDates.end) {
                      document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      handleBookingRequest();
                    }
                  }}
                  className="hyper-liquid px-8 py-3 text-sm flex-1 max-w-[200px]"
                >
                  {!selectedDates.start || !selectedDates.end ? 'Check Dates' : 'Request'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* FULL-WIDTH SECTIONS BELOW THE TWO-COLUMN LAYOUT */}
        <div ref={reviewsRef}>
          <ReviewsSection />
        </div>

        <LenderProfile owner={listing.owner} />

      </div>
    </>
  );
}
