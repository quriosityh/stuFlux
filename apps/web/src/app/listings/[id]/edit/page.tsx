import { ListingFormWizard } from '@/components/listing-form/ListingFormWizard';

export default function EditListingPage({ params }: { params: { id: string } }) {
  // In a real implementation, we would fetch the listing data here via Server Component 
  // or pass a prop down to a Client Component that fetches it.
  // For the UI demonstration, we'll pass some mock default values.
  
  const mockData = {
    title: 'Sony A7III with 28-70mm Lens',
    description: 'Great condition camera, perfect for events and vlogging. Comes with 2 batteries and a 64GB SD card.',
    category_id: 1,
    daily_rate: 3500,
    city: 'Lahore',
    address: 'DHA Phase 5',
    status: 'active' as const,
    specs: {
      'Brand': 'Sony',
      'Resolution': '24MP',
      'Sensor': 'Full Frame'
    },
    min_rental_days: 1,
    max_rental_days: 14,
    delivery_available: true,
    delivery_fee: 500,
    security_deposit: 15000,
    photo_urls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop']
  };

  return (
    <main>
      <ListingFormWizard mode="edit" listingId={params.id} defaultValues={mockData} />
    </main>
  );
}
