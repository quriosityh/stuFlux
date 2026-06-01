import { useState } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BadgeInfo, Boxes, CheckCircle2, Layers3, Plus, Sparkles, X } from 'lucide-react';

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
  { id: 1, name: 'Electronics', icon: '💻', description: 'Cameras, laptops, audio gear, and tech rentals.' },
  { id: 2, name: 'Furniture', icon: '🛋️', description: 'Home, office, and staging pieces with presence.' },
  { id: 3, name: 'Gaming', icon: '🎮', description: 'Consoles, controllers, and immersive play setups.' },
  { id: 4, name: 'Fashion & Accessories', icon: '👗', description: 'Wearables, bags, and styling pieces for the moment.' },
  { id: 5, name: 'Events & Party', icon: '🎉', description: 'Decor, sound, and event-ready essentials.' },
  { id: 6, name: 'Others', icon: '📦', description: 'Anything else that deserves a clean listing.' },
];

const CONDITIONS = ['New', 'Like new', 'Used', 'Damaged'] as const;

export function Step1Basics({ data, updateData, onNext, hideFooter }: Step1Props) {
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(data.category_id);
  const [dailyRate, setDailyRate] = useState<string>(data.daily_rate ? String(data.daily_rate) : '');
  const [condition, setCondition] = useState<ListingFormData['condition']>(data.condition);
  const [specs, setSpecs] = useState<Record<string, string>>(data.specs || {});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [isAddingSpec, setIsAddingSpec] = useState(false);

  const isValid = title.trim().length > 0 && description.trim().length > 0 && categoryId && dailyRate !== '' && Number(dailyRate) > 0;

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecs({ ...specs, [newSpecKey.trim()]: newSpecValue.trim() });
      setNewSpecKey('');
      setNewSpecValue('');
      setIsAddingSpec(false);
    }
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    const next = { ...specs };
    delete next[keyToRemove];
    setSpecs(next);
  };

  const handleNext = () => {
    if (isValid) {
      updateData({ title, description, category_id: categoryId, daily_rate: Number(dailyRate), condition, specs });
      onNext();
    }
  };

  const conditionDescriptions: Record<string, string> = {
    New: 'Unused and untouched.',
    'Like new': 'Near-perfect condition.',
    Used: 'Clean and well cared for.',
    Damaged: 'Visible wear, still usable.',
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Step 1 of 4
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">The Basics</h2>
        <p className="max-w-2xl text-sm font-light text-white/45 sm:text-base">
          A great listing starts with a clear title, a detailed description, and the right category.
        </p>
      </div>

      <div className="space-y-10">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Listing title</label>
          <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] px-4 py-3 shadow-sm transition-all duration-300 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50">
            <input
              type="text"
              placeholder="e.g. Professional DJ Set with Turntables"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full border-none bg-transparent text-center font-display text-2xl font-bold tracking-tight text-white placeholder:text-white/18 outline-none sm:text-3xl"
            />
            <div className="mt-2 text-center text-[11px] uppercase tracking-[0.3em] text-white/30">
              {title.length}/100
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Description</label>
          <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] px-4 py-4 transition-all duration-300 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50">
            <textarea
              placeholder="A quick story, what’s included, and anything renters should know."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={6}
              className="w-full resize-none border-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/25"
            />
            <div className="mt-2 flex justify-end text-[11px] uppercase tracking-[0.3em] text-white/28">{description.length}/1000</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Category</label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-300 transform-gpu',
                  categoryId === cat.id
                    ? 'border-accent/80 bg-accent/10 shadow-[0_0_0_1px_rgba(57,255,20,0.2),0_18px_40px_-24px_rgba(57,255,20,0.65)] scale-[1.01]'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-0.5'
                )}
              >
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl transition-all duration-300', categoryId === cat.id ? 'border-accent/40 bg-black/20' : 'border-white/10 bg-black/15')}>
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-white">{cat.name}</span>
                    {categoryId === cat.id && <CheckCircle2 className="h-4 w-4 text-accent" />}
                  </div>
                  <p className="mt-1 text-sm font-light text-white/45">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Price per day</label>
            <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] p-3 transition-all duration-300 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/50">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="flex h-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 px-3 text-xs font-bold tracking-widest text-accent">PKR</div>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  className="w-full border-none bg-transparent font-display text-2xl font-bold text-white outline-none placeholder:text-white/20"
                />
                <span className="text-xs font-semibold uppercase tracking-widest text-white/35">/day</span>
              </div>
              <p className="mt-2 px-2 text-xs font-light text-white/35">Set a competitive daily rate.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Condition</label>
            <div className="grid h-full grid-cols-2 gap-3">
              {CONDITIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setCondition(option)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl border text-center transition-all duration-300 transform-gpu',
                    condition === option
                      ? 'border-emerald-400/60 bg-emerald-400/10 shadow-sm scale-[1.03]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                  )}
                >
                  <div className="font-display text-base font-bold text-white">{option}</div>
                  <p className="mt-1 text-xs font-light text-white/45">{conditionDescriptions[option]}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Specifications (Optional)</label>
            {!isAddingSpec && (
              <button onClick={() => setIsAddingSpec(true)} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-accent transition-colors hover:opacity-80">
                <Plus className="h-3.5 w-3.5" /> Add Spec
              </button>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[#14141E] p-4 min-h-[80px]">
            <div className="flex flex-wrap gap-3">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
                  <span className="text-white/45">{key}:</span>
                  <span className="font-semibold">{value}</span>
                  <button onClick={() => handleRemoveSpec(key)} className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-white/45 transition-colors hover:bg-red-500/15 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {Object.keys(specs).length === 0 && !isAddingSpec && (
                <div className="flex items-center justify-center w-full h-full text-sm font-light italic text-white/28">
                  e.g. Brand: Sony, Model: A7 III, Color: Black
                </div>
              )}
            </div>

            {isAddingSpec && (
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  placeholder="Label (e.g. Brand)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/70"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Sony)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/70"
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsAddingSpec(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5">Cancel</button>
                  <button onClick={handleAddSpec} disabled={!newSpecKey.trim() || !newSpecValue.trim()} className="rounded-xl px-3 py-2 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 liquid-button active:scale-95 transform-gpu">
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button id="step-next-trigger" onClick={handleNext} className="hidden" />

      {!hideFooter && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={cn(
              'px-8 py-3 rounded-full font-bold transition-all duration-300 active:scale-95 transform-gpu',
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
