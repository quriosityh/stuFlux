import PDPClient from '@/components/pdp/PDPClient';
import { ListingFormData } from '../types';
import { getAreaName, LAHORE_AREAS_DATA } from '@stuflux/types';

type Step7ReviewProps = {
  data: ListingFormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

// Map categories to names for the preview
const CATEGORY_MAP: Record<number, string> = {
  1: 'Electronics', 2: 'Tools', 3: 'Party', 4: 'Sports', 5: 'Home',
  6: 'Music', 7: 'Vehicles', 8: 'Books', 9: 'Fashion', 10: 'Other'
};

export function Step7Review({ data, onBack, onSubmit, isSubmitting }: Step7ReviewProps) {
  // Mock the listing object that PDPClient expects
  const areaName = getAreaName(data.area, LAHORE_AREAS_DATA) || 'Lahore';
  
  const mockListing = {
    title: data.title || 'Untitled Listing',
    description: data.description || 'No description provided.',
    daily_rate: data.daily_rate || 0,
    security_deposit: data.security_deposit || 0,
    min_rental_days: data.min_rental_days || 1,
    max_rental_days: data.max_rental_days || 30,
    delivery_available: data.delivery_available || false,
    city: areaName, // PDPClient expects city, we pass the area string
    category: {
      name: CATEGORY_MAP[data.category_id] || 'Category',
      slug: 'category'
    },
    photos: data.photo_urls.map((url, i) => ({
      url,
      is_primary: i === 0
    })),
    owner: {
      first_name: 'You',
      last_name: '',
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Top Bar for Review step */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Review your listing</h2>
          <p className="text-foreground/50 text-sm">
            This is exactly how renters will see your item.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 font-semibold text-sm text-foreground/50 hover:text-foreground transition-colors disabled:opacity-50"
          >
            ← Edit Details
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="hyper-liquid px-8 py-3 font-bold text-sm text-black disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Publishing...' : '✨ Publish Listing'}
          </button>
        </div>
      </div>

      {/* The actual PDP preview */}
      <div className="bg-background rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl relative">
        {/* We disable pointer events so they don't accidentally navigate away or submit bookings while previewing */}
        <div className="pointer-events-none opacity-90">
          <PDPClient listing={mockListing} availability={data.blocked_dates} />
        </div>
        
        {/* Overlay to catch clicks and prevent interaction in the mock PDP */}
        <div className="absolute inset-0 z-50 cursor-default" title="This is just a preview" />
      </div>
      
    </div>
  );
}
