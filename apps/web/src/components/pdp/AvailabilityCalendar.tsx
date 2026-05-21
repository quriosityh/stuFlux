'use client';

import { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay,
  startOfWeek, endOfWeek, isWithinInterval
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  blockedDates: { start_date: string; end_date: string }[];
  selectedDates?: { start: Date | null; end: Date | null };
  onSelectDates?: (dates: { start: Date | null; end: Date | null }) => void;
  minRentalDays?: number;
  maxRentalDays?: number;
}

export function AvailabilityCalendar({ 
  blockedDates, 
  selectedDates = { start: null, end: null }, 
  onSelectDates,
  minRentalDays = 1,
  maxRentalDays = 30
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(range => {
      const start = startOfDay(new Date(range.start_date));
      const end = startOfDay(new Date(range.end_date));
      return isWithinInterval(startOfDay(date), { start, end });
    });
  };

  const maxAllowedDate = addMonths(startOfDay(new Date()), 2);

  const handleDateClick = (date: Date) => {
    if (isDateBlocked(date) || isBefore(date, startOfDay(new Date())) || isBefore(maxAllowedDate, date)) return;
    if (!onSelectDates) return;

    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      onSelectDates({ start: date, end: null });
    } else {
      if (isBefore(date, selectedDates.start)) {
        onSelectDates({ start: date, end: null });
      } else {
        // Validate if there's a blocked date in between
        let isValid = true;
        const interval = eachDayOfInterval({ start: selectedDates.start, end: date });
        for (const day of interval) {
          if (isDateBlocked(day)) {
            isValid = false;
            break;
          }
        }
        if (isValid) {
          onSelectDates({ start: selectedDates.start, end: date });
        } else {
          onSelectDates({ start: date, end: null });
        }
      }
    }
  };

  const renderMonth = (monthStart: Date) => {
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(endOfMonth(monthStart));
    const dateFormat = "d";
    const rows = [];
    
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

    // Weekday headers
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
      <div key={d} className="text-center font-semibold text-xs text-foreground/50 py-2">
        {d}
      </div>
    ));

    return (
      <div className="flex-1 w-full max-w-[300px] mx-auto">
        <h3 className="font-syne font-bold text-center mb-4">{format(monthStart, "MMMM yyyy")}</h3>
        <div className="grid grid-cols-7 mb-2">
          {weekDays}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {daysInterval.map((currentDay, idx) => {
            formattedDate = format(currentDay, dateFormat);
            const isBlocked = isDateBlocked(currentDay);
            const isPast = isBefore(currentDay, startOfDay(new Date()));
            const isTooFar = isBefore(maxAllowedDate, currentDay);
            const isCurrentMonth = isSameMonth(currentDay, monthStart);
            
            const isStart = selectedDates.start && isSameDay(currentDay, selectedDates.start);
            const isEnd = selectedDates.end && isSameDay(currentDay, selectedDates.end);
            const isBetween = selectedDates.start && selectedDates.end && 
              isWithinInterval(currentDay, { start: selectedDates.start, end: selectedDates.end }) &&
              !isStart && !isEnd;

            return (
              <div 
                key={currentDay.toString()} 
                className={cn(
                  "aspect-square flex items-center justify-center relative",
                  !isCurrentMonth ? "invisible" : ""
                )}
              >
                {isBetween && (
                  <div className="absolute inset-y-0 left-0 right-0 bg-accent/20" />
                )}
                {isStart && selectedDates.end && (
                  <div className="absolute inset-y-0 right-0 left-1/2 bg-accent/20" />
                )}
                {isEnd && selectedDates.start && (
                  <div className="absolute inset-y-0 left-0 right-1/2 bg-accent/20" />
                )}

                <button
                  onClick={() => handleDateClick(currentDay)}
                  disabled={isPast || isTooFar || isBlocked || !isCurrentMonth}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium relative z-10 transition-colors",
                    isStart || isEnd ? "bg-accent text-black font-bold shadow-md" : 
                    isBetween ? "text-foreground" :
                    isBlocked || isPast || isTooFar ? "text-foreground/30 line-through cursor-not-allowed" :
                    "hover:border border-foreground/20 cursor-pointer"
                  )}
                >
                  {formattedDate}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="py-8" id="availability-section">
      <h2 className="text-xl font-bold font-syne mb-6">Select dates</h2>
      
      <div className="chrome-card rounded-3xl p-6 relative">
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {renderMonth(currentMonth)}
          <div className="hidden md:block w-px bg-border/10" />
          <div className="hidden md:block">
            {renderMonth(addMonths(currentMonth, 1))}
          </div>
        </div>
        
        <button 
          onClick={prevMonth}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-border/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={isBefore(currentMonth, startOfMonth(new Date()))}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button 
          onClick={nextMonth}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-border/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={isBefore(startOfMonth(maxAllowedDate), addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
