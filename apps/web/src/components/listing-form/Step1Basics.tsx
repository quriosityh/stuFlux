import { useState, useEffect } from 'react';
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
};

// Mock categories since we are focusing on UI right now without full API integration
const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', icon: '💻' },
  { id: 2, name: 'Furniture', icon: '🛋️' },
  { id: 3, name: 'Gaming', icon: '🎮' },
  { id: 4, name: 'Fashion & Accessories', icon: '👗' },
  { id: 5, name: 'Events & Party', icon: '🎉' },
  { id: 6, name: 'Others', icon: '📦' },
];

export function Step1Basics({ data, updateData, onNext }: Step1Props) {
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(data.category_id);
  const [dailyRate, setDailyRate] = useState<string>(data.daily_rate ? String(data.daily_rate) : '');

  const isValid = title.trim().length > 0 && description.trim().length > 0 && categoryId && dailyRate !== '' && Number(dailyRate) > 0;

  const handleNext = () => {
    if (isValid) {
      updateData({
        title,
        description,
        category_id: categoryId,
        daily_rate: Number(dailyRate)
      });
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mt-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Tell us about your item</h2>
        <p className="text-foreground/80 text-lg">Share some basic info to help renters find what they need.</p>
      </div>

      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-foreground/90 pl-2">Listing Title</label>
          <div className="bg-surface border-2 border-foreground/20 hover:border-foreground/40 rounded-xl relative focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent focus-within:bg-background transition-all duration-300 overflow-hidden group">
            <input
              type="text"
              placeholder="e.g. Sony A7III with 28-70mm Lens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full bg-transparent border-none outline-none px-4 py-4 pr-16 text-foreground placeholder:text-foreground/40 focus:ring-0 text-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground/40 group-focus-within:text-accent transition-colors">
              {title.length}/100
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-foreground/90 pl-2">Category</label>
          <div className="flex flex-wrap gap-3">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 border-2",
                  categoryId === cat.id
                    ? "bg-accent border-accent text-black shadow-[0_0_15px_rgba(57,255,20,0.3)] transform scale-105"
                    : "bg-surface border-foreground/30 text-foreground/80 hover:bg-foreground/10 hover:border-foreground/50 hover:-translate-y-1"
                )}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-foreground/90 pl-2">Description</label>
          <div className="bg-surface border-2 border-foreground/20 hover:border-foreground/40 rounded-xl focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent focus-within:bg-background transition-all duration-300 overflow-hidden group">
            <textarea
              placeholder="Describe the condition, what's included, and any important rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={5}
              className="w-full bg-transparent border-none outline-none px-4 py-4 text-foreground placeholder:text-foreground/40 focus:ring-0 resize-none text-base leading-relaxed"
            />
            <div className="flex justify-end px-4 pb-3 text-xs font-medium text-foreground/40 group-focus-within:text-accent transition-colors">
              {description.length}/1000
            </div>
          </div>
        </div>

        {/* Daily Rate */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-wider text-foreground/90 pl-2">Daily Rate</label>
          <div className="bg-surface border-2 border-foreground/20 hover:border-foreground/40 rounded-xl flex items-center w-full md:w-1/2 relative overflow-hidden focus-within:!border-accent focus-within:ring-1 focus-within:ring-accent focus-within:bg-background transition-all duration-300">
            <div className="flex-shrink-0 flex items-center justify-center bg-foreground/10 border-r-2 border-foreground/20 px-5 py-4 font-bold text-accent">
              PKR
            </div>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              className="flex-grow bg-transparent border-none outline-none px-4 py-4 text-foreground placeholder:text-foreground/40 font-display text-xl focus:ring-0 text-center"
            />
            <span className="flex-shrink-0 pr-5 text-foreground/50 font-medium">/ day</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={cn(
            "px-8 py-3 rounded-full font-bold transition-all duration-300",
            isValid
              ? "liquid-button"
              : "glass-spotlight opacity-50 cursor-not-allowed"
          )}
        >
          Next: Item Details
        </button>
      </div>
    </div>
  );
}
