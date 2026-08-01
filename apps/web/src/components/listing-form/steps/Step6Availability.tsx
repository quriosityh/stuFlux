import { useEffect, useState } from 'react'
import { X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ListingFormData } from '../types'
import { AvailabilityCalendar } from '@/components/pdp/AvailabilityCalendar'

type Step6AvailabilityProps = {
  data: ListingFormData
  updateData: (data: Partial<ListingFormData>) => void
  onValidChange?: (valid: boolean) => void
  onSkip: () => void
}

export function Step6Availability({
  data,
  updateData,
  onValidChange,
  onSkip,
}: Step6AvailabilityProps) {
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })

  const handleSelectDates = (dates: { start: Date | null; end: Date | null }) => {
    setSelectedDates(dates)

    // When a full range is selected, add it to blocked_dates immediately and clear selection
    if (dates.start && dates.end) {
      const newBlock = {
        start_date: format(dates.start, 'yyyy-MM-dd'),
        end_date: format(dates.end, 'yyyy-MM-dd'),
      }
      updateData({ blocked_dates: [...data.blocked_dates, newBlock] })
      setSelectedDates({ start: null, end: null }) // Reset selection
    }
  }

  const removeBlockedRange = (index: number) => {
    const updated = [...data.blocked_dates]
    updated.splice(index, 1)
    updateData({ blocked_dates: updated })
  }

  const handleUnblockRange = (range: { start_date: string; end_date: string }) => {
    const updated = data.blocked_dates.filter(
      r => r.start_date !== range.start_date || r.end_date !== range.end_date
    )
    updateData({ blocked_dates: updated })
  }
  const isValid = true // optional step is always considered valid
  useEffect(() => {
    onValidChange?.(isValid)
  }, [isValid, onValidChange])

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex h-full flex-col duration-500">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-foreground text-2xl font-bold">
            Block unavailable dates
          </h2>
          <span className="bg-border/50 text-foreground/70 rounded-md px-2 py-1 text-xs font-semibold tracking-wider uppercase">
            Optional
          </span>
        </div>
        <p className="text-foreground/50 text-sm">
          Tap dates when your item isn't available for rent. You can always update this later.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <AvailabilityCalendar
          mode="owner"
          blockedDates={data.blocked_dates}
          selectedDates={selectedDates}
          onSelectDates={handleSelectDates}
          onUnblockRange={handleUnblockRange}  
        />


        {/* Blocked Dates List */}
        {data.blocked_dates.length > 0 && (
          <div className="mt-2">
            <h3 className="text-foreground/50 mb-3 text-xs font-semibold tracking-wider uppercase">
              Blocked Dates
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.blocked_dates.map((range, idx) => (
                <div
                  key={idx}
                  className="bg-border/50 text-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
                >
                  <CalendarIcon className="text-accent h-4 w-4" />
                  <span>
                    {format(new Date(range.start_date), 'MMM d')} -{' '}
                    {format(new Date(range.end_date), 'MMM d')}
                  </span>
                  <button
                    onClick={() => handleUnblockRange(range)}
                    className="text-foreground/50 ml-1 rounded-md p-0.5 transition-colors hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
