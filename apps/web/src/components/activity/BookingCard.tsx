import { ActivityBooking } from './types';
import BookingStatusBadge, { DisplayStatus } from './BookingStatusBadge';
import { differenceInDays, isFuture, isPast } from 'date-fns';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface BookingCardProps {
  booking: ActivityBooking;
  role: 'renter' | 'owner';
  actions?: ReactNode;
}

export default function BookingCard({ booking, role, actions }: BookingCardProps) {
  const otherUser = role === 'renter' ? booking.owner : booking.renter;
  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const getDaysText = () => {
    const today = new Date();
    
    if (booking.status === 'confirmed') {
      if (startDate <= today && endDate >= today) {
        const remaining = differenceInDays(endDate, today);
        return remaining === 0 ? 'Ends today' : `${remaining} days remaining`;
      }
      if (isFuture(startDate)) {
        const startsIn = differenceInDays(startDate, today);
        return startsIn === 0 ? 'Starts today' : `Starts in ${startsIn} days`;
      }
    }
    
    return `${booking.total_days} days`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  let displayStatus: DisplayStatus = 'pending';
  if (booking.status === 'pending') displayStatus = 'pending';
  else if (booking.status === 'rejected') displayStatus = 'declined';
  else if (booking.status === 'completed' || (booking.status === 'confirmed' && isPast(endDate))) displayStatus = 'completed';
  else if (booking.status === 'confirmed') {
    if (isFuture(startDate)) displayStatus = 'upcoming';
    else displayStatus = 'active';
  }

  return (
    <div className="group relative flex flex-col sm:flex-row bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden shadow-md hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)] hover:border-white/10 transition-all duration-300">
      
      {/* Photo Section */}
      <div className="relative w-full sm:w-40 h-36 sm:h-auto shrink-0 bg-zinc-900 border-b sm:border-b-0 sm:border-r border-white/5 overflow-hidden">
        {booking.listing_photo?.url ? (
          <img
            src={booking.listing_photo.url}
            alt={booking.listing.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
            <span className="text-5xl opacity-50">📦</span>
          </div>
        )}
        {/* Subtle gradient overlay to tie the image into the dark card */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#0A0A0A]/80" />
      </div>

      {/* Details Section */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Header row: Title + Status Badge */}
          <div className="flex justify-between items-start gap-3 mb-1">
            <h4 className="font-display font-bold text-base text-white tracking-tight leading-tight line-clamp-1 group-hover:text-accent transition-colors">
              {booking.listing.title}
            </h4>
            <div className="shrink-0">
              <BookingStatusBadge status={displayStatus} />
            </div>
          </div>
          
          {/* Price */}
          <div className="font-display font-semibold text-lg text-accent mb-2">
            {formatCurrency(booking.total_amount)}
          </div>
          
          {/* Meta Information */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 text-sm">
              <CalendarIcon className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-400">
                {formatDate(startDate)} – {formatDate(endDate)} 
                <span className="mx-2 text-zinc-600">•</span> 
                <span className="font-medium text-zinc-300">{getDaysText()}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2.5 text-sm">
              <UserIcon className="w-4 h-4 text-zinc-500" />
              <span className="flex items-center gap-2 text-zinc-400">
                {role === 'renter' ? 'Owner:' : 'Renter:'} 
                <span className="font-medium text-zinc-200 flex items-center gap-2">
                  {otherUser.avatar_url ? (
                    <img 
                      src={otherUser.avatar_url} 
                      alt={otherUser.display_name}
                      width={24} 
                      height={24} 
                      className="rounded-full bg-zinc-800 border border-white/10"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                      {otherUser.display_name.charAt(0)}
                    </div>
                  )}
                  {otherUser.display_name}
                </span>
              </span>
            </div>
          </div>
          
          {booking.message && booking.status === 'pending' && (
            <div className="mt-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-zinc-300 italic leading-relaxed">
              "{booking.message}"
            </div>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="pt-3 mt-2 border-t border-white/5 flex justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
