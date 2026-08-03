'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateRange {
  start: Date | null
  end: Date | null
}

interface BlockedRange {
  start_date: string
  end_date: string
}

interface AvailabilityCalendarProps {
  mode: 'renter' | 'owner' // NEW — drives all behaviour differences
  blockedDates: BlockedRange[]
  selectedDates?: DateRange
  onSelectDates?: (dates: DateRange) => void
  onUnblockRange?: (range: BlockedRange) => void // Owner only — fires when a blocked range is clicked
  minRentalDays?: number
  maxRentalDays?: number
  monthsToShow?: number
  compact?: boolean
}

export function AvailabilityCalendar({
  mode,
  blockedDates,
  selectedDates = { start: null, end: null },
  onSelectDates,
  onUnblockRange,
  minRentalDays = 1,
  maxRentalDays = 30,
  monthsToShow = 2,
  compact = false,
 }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))

  // Owner gets 3 months lookahead, renter gets 2
  const lookaheadMonths = mode === 'owner' ? 3 : 2
  const maxAllowedDate = addMonths(startOfMonth(new Date()), lookaheadMonths);

  const today = startOfDay(new Date())

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  const prevMonth = () => setCurrentMonth(prev => addMonths(prev, -1))

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(range => {
      const start = startOfDay(new Date(range.start_date))
      const end = startOfDay(new Date(range.end_date))
      return isWithinInterval(startOfDay(date), { start, end })
    })
  }

  // Returns the blocked range object that contains this date, if any
  const getBlockedRange = (date: Date): BlockedRange | undefined => {
    return blockedDates.find(range => {
      const start = startOfDay(new Date(range.start_date))
      const end = startOfDay(new Date(range.end_date))
      return isWithinInterval(startOfDay(date), { start, end })
    })
  }

  const handleDateClick = (date: Date) => {
    const isPast = isBefore(date, today)
    const isTooFar = isBefore(maxAllowedDate, date)
    if (isPast || isTooFar) return

    // Owner clicking a blocked date = unblock it
    if (mode === 'owner' && isDateBlocked(date)) {
      const range = getBlockedRange(date)
      if (range && onUnblockRange) onUnblockRange(range)
      return
    }

    // Blocked dates are unclickable for renters
    if (mode === 'renter' && isDateBlocked(date)) return

    if (!onSelectDates) return

    // Range selection logic (same for both modes)
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      onSelectDates({ start: date, end: null })
    } else {
      if (isBefore(date, selectedDates.start)) {
        onSelectDates({ start: date, end: null })
        return
      }
      // Reject range that crosses a blocked date (renter only — owner is blocking, not booking)
      if (mode === 'renter') {
        const interval = eachDayOfInterval({ start: selectedDates.start, end: date })
        const crossesBlocked = interval.some(day => isDateBlocked(day))
        if (crossesBlocked) {
          onSelectDates({ start: date, end: null })
          return
        }
      }
      onSelectDates({ start: selectedDates.start, end: date })
    }
  }

  const renderMonth = (monthStart: Date) => {
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(endOfMonth(monthStart))
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate })

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
      <div key={d} className="text-foreground/50 py-2 text-center text-xs font-semibold">
        {d}
      </div>
    ))

    return (
      <div className="mx-auto w-full max-w-[300px] flex-1">
        <h3 className="font-display mb-4 text-center font-bold">
          {format(monthStart, 'MMMM yyyy')}
        </h3>
        <div className="mb-2 grid grid-cols-7">{weekDays}</div>
        <div className="grid grid-cols-7 gap-y-1">
          {daysInterval.map(currentDay => {
            const isBlocked = isDateBlocked(currentDay)
            const isPast = isBefore(currentDay, today)
            const isTooFar = isBefore(maxAllowedDate, currentDay)
            const isCurrentMonth = isSameMonth(currentDay, monthStart)

            const isStart = !!selectedDates.start && isSameDay(currentDay, selectedDates.start)
            const isEnd = !!selectedDates.end && isSameDay(currentDay, selectedDates.end)
            const isBetween = !!(
              selectedDates.start &&
              selectedDates.end &&
              isWithinInterval(currentDay, {
                start: selectedDates.start,
                end: selectedDates.end,
              }) &&
              !isStart &&
              !isEnd
            )

            // Owner sees blocked ranges as removable (red-tinted), renter sees them as unavailable (strikethrough)
            const blockedStyle =
              mode === 'owner'
                ? 'text-red-400/80 cursor-pointer hover:text-red-400 hover:bg-red-500/10 rounded-full'
                : 'text-foreground/30 line-through cursor-not-allowed'
            const isDisabled =
              isPast || isTooFar || (mode === 'renter' && isBlocked) || !isCurrentMonth

            return (
              <div
                key={currentDay.toString()}
                className={cn(
                  'relative flex aspect-square items-center justify-center',
                  !isCurrentMonth && 'invisible'
                )}
              >
                {/* Range fill strip */}
                {isBetween && <div className="bg-accent/20 absolute inset-y-0 right-0 left-0" />}
                {isStart && selectedDates.end && (
                  <div className="bg-accent/20 absolute inset-y-0 right-0 left-1/2" />
                )}
                {isEnd && selectedDates.start && (
                  <div className="bg-accent/20 absolute inset-y-0 right-1/2 left-0" />
                )}

                <button
                  onClick={() => handleDateClick(currentDay)}
                  disabled={isDisabled}
                  title={mode === 'owner' && isBlocked ? 'Click to unblock this date' : undefined}
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isStart || isEnd
                      ? 'bg-accent font-bold text-black shadow-md'
                      : isBetween
                        ? 'text-foreground'
                        : isBlocked
                          ? blockedStyle
                          : isPast || isTooFar
                            ? 'text-foreground/30 cursor-not-allowed'
                            : 'border-foreground/20 cursor-pointer hover:border'
                  )}
                >
                  {format(currentDay, 'd')}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  

  return (
    <div className={cn(compact ? 'py-0' : 'py-4')} id="availability-section">
      {!compact && (
        <div className="mb-3 flex flex-col items-center lg:flex-row lg:items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-center lg:text-left">
            Select dates
          </h2>
        </div>
      )}

      <div className={cn('relative rounded-3xl', compact ? 'p-2' : 'chrome-card p-4')}>
        <div className="flex flex-col justify-center gap-8 md:flex-row">
          {renderMonth(currentMonth)}
          {monthsToShow >= 2 && (
            <>
              <div className="bg-border/10 hidden w-px md:block" />
              <div className="hidden md:block">{renderMonth(addMonths(currentMonth, 1))}</div>
            </>
          )}
        </div>

        <button
          onClick={prevMonth}
          className="hover:bg-border/10 absolute top-2 left-2 rounded-full p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          disabled={isBefore(currentMonth, startOfMonth(today))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={nextMonth}
          className="hover:bg-border/10 absolute top-2 right-2 rounded-full p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          disabled={isBefore(startOfMonth(maxAllowedDate), addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Compact Legend (Hidden in compact mode) */}
      {!compact && (
        <div className="mt-3 flex items-center gap-4 px-1 text-xs text-foreground/60">
          <span className="flex items-center gap-2">
            <span className="bg-foreground/20 inline-block h-2 w-2 rounded-full" />
            Unavailable
          </span>
          <span className="flex items-center gap-2">
            <span className="bg-accent inline-block h-2 w-2 rounded-full" />
            Selected
          </span>
          {mode === 'owner' && (
            <span className="flex items-center gap-2">
              <span className="bg-red-500/40 inline-block h-2 w-2 rounded-full" />
              Blocked
            </span>
          )}
        </div>
      )}
    </div>
  )
}
