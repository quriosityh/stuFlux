import { useEffect, useMemo } from 'react';
import { ListingFormData } from '../types';
import { getNearbyAreas, LAHORE_AREAS_DATA } from '@stuflux/types';
import { AreaSelector } from '@/components/shared/AreaSelector';

type Step5AreaProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onValidChange?: (valid: boolean) => void;
};

export function Step5Area({ data, updateData, onValidChange }: Step5AreaProps) {
  const nearbyAreas = useMemo(() => {
    if (!data.area) return [];
    return getNearbyAreas(data.area, LAHORE_AREAS_DATA, 3);
  }, [data.area]);

  const isValid = data.area !== '';

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-1.5">
          Where is this item? <span className="text-red-500">*</span>
        </h2>
        <p className="text-foreground/40 text-sm">
          Select your general area in Lahore. Exact address is only shared after booking.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <AreaSelector
          value={data.area}
          onChange={(area) => updateData({ area })}
        />

        {/* Nearby hint */}
        {data.area && nearbyAreas.length > 0 && (
          <p className="text-[11px] text-accent/60 font-medium">
            ↗ Renters searching {nearbyAreas.map(a => a?.name).filter(Boolean).join(', ')} will also find your item.
          </p>
        )}
      </div>
    </div>
  );
}
