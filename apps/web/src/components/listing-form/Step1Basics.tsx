import { useState } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step1Props = {
  data: Partial<ListingFormData>;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  hideFooter?: boolean;
};

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', icon: '💻' },
  { id: 2, name: 'Furniture', icon: '🛋️' },
  { id: 3, name: 'Gaming', icon: '🎮' },
  { id: 4, name: 'Fashion & Accessories', icon: '👗' },
  { id: 5, name: 'Events & Party', icon: '🎉' },
  { id: 6, name: 'Others', icon: '📦' },
];

export function Step1Basics({ data, updateData, onNext, hideFooter }: Step1Props) {
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(data.category_id);
  const [dailyRate, setDailyRate] = useState<string>(data.daily_rate ? String(data.daily_rate) : '');

  const isValid = title.trim().length > 0 && description.trim().length > 0 && categoryId && dailyRate !== '' && Number(dailyRate) > 0;

  const handleNext = () => {
    if (isValid) {
      updateData({ title, description, category_id: categoryId, daily_rate: Number(dailyRate) });
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="flex flex-col items-center text-center space-y-2 mt-2 mb-8">
        <div className="text-accent font-semibold text-[10px] sm:text-xs tracking-widest uppercase">Step 1 of 4</div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">Create Your Listing</h2>
        <p className="text-white/50 text-xs sm:text-sm max-w-sm">Enter the basic information for your item. You will be able to add photos and availability later.</p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Listing Title</label>
          <div className="bg-[#161622] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl relative focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-300 overflow-hidden group">
            <input
              type="text"
              placeholder="e.g. Sony A7III Camera with Lens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full bg-transparent border-none outline-none px-4 py-3.5 pr-16 text-foreground placeholder:text-foreground/30 focus:ring-0"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground/30 group-focus-within:text-accent transition-colors">
              {title.length}/100
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Category</label>
          <div className="flex flex-wrap gap-2">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border-2',
                  categoryId === cat.id
                    ? 'liquid-button !border-transparent !text-black shadow-lg shadow-accent/20 scale-105'
                    : 'bg-[#161622] border-[#2A2A35] text-white/60 hover:border-[#3A3A4A] hover:text-white'
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Description</label>
          <div className="bg-[#161622] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-300 overflow-hidden group">
            <textarea
              placeholder="What's included? Condition? Any rules for renters?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full bg-transparent border-none outline-none px-4 py-3.5 text-foreground placeholder:text-foreground/30 focus:ring-0 resize-none text-sm leading-relaxed"
            />
            <div className="flex justify-end px-4 pb-2 text-xs text-foreground/30 group-focus-within:text-accent transition-colors">
              {description.length}/1000
            </div>
          </div>
        </div>

        {/* Daily Rate */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Daily Rate</label>
          <div className="bg-[#161622] border border-[#2A2A35] hover:border-[#3A3A4A] rounded-xl flex items-stretch w-full md:w-64 overflow-hidden focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all duration-300">
            <div className="flex items-center justify-center bg-[#1A1A2A] border-r border-[#2A2A35] px-4 font-bold text-accent text-sm">
              PKR
            </div>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              className="flex-grow bg-transparent border-none outline-none px-4 py-3.5 text-foreground placeholder:text-foreground/30 font-display text-lg focus:ring-0"
            />
            <div className="flex items-center pr-4 text-foreground/40 font-medium text-sm">/ day</div>
          </div>
        </div>
      </div>

      {/* Hidden trigger button — clicked by card footer */}
      <button id="step-next-trigger" onClick={handleNext} className="hidden" />

      {/* Inline footer only when not inside modal card */}
      {!hideFooter && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={cn(
              'px-8 py-3 rounded-full font-bold transition-all duration-300',
              isValid ? 'liquid-button' : 'glass-spotlight opacity-50 cursor-not-allowed'
            )}
          >
            Next: Item Details
          </button>
        </div>
      )}
    </div>
  );
}
