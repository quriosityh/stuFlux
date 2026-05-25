import ActivityClient from '@/components/activity/ActivityClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity — StuFlux',
  description: 'Manage your active rentals and lending requests.',
};

export default async function ActivityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 lg:pb-8">
      {/* Desktop Top Padding for Navigation */}
      <div className="pt-24 px-4 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl tracking-tight mb-2">Activity</h1>
          <p className="text-foreground/60 text-lg">Manage your rentals and track your earnings.</p>
        </div>
        
        <ActivityClient />
      </div>
    </div>
  );
}
