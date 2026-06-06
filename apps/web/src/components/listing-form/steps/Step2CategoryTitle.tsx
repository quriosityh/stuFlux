import { useEffect } from 'react';
import { Camera, Wrench, PartyPopper, Zap, Music, Shirt, Bike, Tent } from 'lucide-react';
import { ListingFormData } from '../types';

type Step2CategoryTitleProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onValidChange?: (valid: boolean) => void;
};

const CATEGORIES = [
  { id: 1, name: 'Power & Energy', icon: Zap },
  { id: 2, name: 'Tools & Home Fix', icon: Wrench },
  { id: 3, name: 'Cameras & Creators', icon: Camera },
  { id: 4, name: 'Music & Audio', icon: Music },
  { id: 5, name: 'Clothing & Fashion', icon: Shirt },
  { id: 6, name: 'Party Essentials', icon: PartyPopper },
  { id: 7, name: 'Bikes & Boards', icon: Bike },
  { id: 8, name: 'Travel & Outdoors', icon: Tent },
];

export function Step2CategoryTitle({ data, updateData, onValidChange }: Step2CategoryTitleProps) {
  const isValid = data.category_id !== 0 && data.title.length >= 3;

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-5xl font-extrabold font-display text-foreground text-center mb-4">What are you listing?</h2>
        <p className="text-foreground/50 text-sm text-center">
          Give your item a clear, descriptive title and select its category.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-10">
        {/* Title Input (Premium Box Style) */}
        <div>
          <label className="block text-[10px] font-bold text-foreground/40 mb-3 uppercase tracking-[0.2em]">Listing Title <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="e.g. Canon EOS R5 Camera Kit"
              className="w-full bg-surface/50 border-2 border-border/20 text-foreground placeholder-white/20 rounded-2xl px-6 py-4 text-lg sm:text-xl md:text-2xl font-display font-bold focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 pr-20"
              maxLength={200}
            />
            <div className={`absolute right-6 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-wider font-mono ${data.title.length < 3 ? 'text-red-400' : 'text-foreground/30'}`}>
              {data.title.length}/200
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div>
          <label className="block text-[10px] font-bold text-foreground/40 mb-4 uppercase tracking-[0.2em]">
            Select Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = data.category_id === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateData({ category_id: cat.id })}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                    ${isSelected 
                      ? 'bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(57,255,20,0.15)]' 
                      : 'bg-surface/50 border-border/50 text-foreground/70 hover:bg-border/50 hover:text-foreground'}
                  `}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-accent' : 'text-foreground/50'}`} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
