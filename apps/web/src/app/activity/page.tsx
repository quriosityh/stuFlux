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
      <div className="pt-14 px-4 max-w-[860px] mx-auto space-y-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
            <h1 className="text-[32px] font-extrabold tracking-tight font-display leading-none">Activity</h1>
          </div>
          <p className="text-foreground/50 text-[13px] pl-4">Manage your rentals and track your earnings.</p>
        </div>
        
        <ActivityClient />
      </div>
    </div>
  );
}
