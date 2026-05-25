import { useState } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Plus, X } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step2Props = {
  data: Partial<ListingFormData>;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  hideFooter?: boolean;
};

const CONDITIONS = ['New', 'Like new', 'Used', 'Damaged'] as const;

export function Step2Details({ data, updateData, onNext, onBack, hideFooter }: Step2Props) {
  const [specs, setSpecs] = useState<Record<string, string>>(data.specs || {});
  const [status, setStatus] = useState<'draft' | 'active'>(data.status || 'active');
  const [condition, setCondition] = useState<ListingFormData['condition']>(data.condition);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [isAddingSpec, setIsAddingSpec] = useState(false);

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecs({ ...specs, [newSpecKey.trim()]: newSpecValue.trim() });
      setNewSpecKey('');
      setNewSpecValue('');
      setIsAddingSpec(false);
    }
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    const newSpecs = { ...specs };
    delete newSpecs[keyToRemove];
    setSpecs(newSpecs);
  };

  const handleNext = () => {
    updateData({ specs, status, condition });
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="flex flex-col items-center text-center space-y-2 mt-2 mb-8">
        <div className="text-accent font-semibold text-[10px] sm:text-xs tracking-widest uppercase">Step 2 of 4</div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">Item Details</h2>
        <p className="text-white/50 text-xs sm:text-sm max-w-sm">Add specific details to build trust with renters and make your item stand out.</p>
      </div>

      <div className="space-y-6">

        {/* Item Condition */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Item Condition</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CONDITIONS.map(cond => (
              <button
                key={cond}
                onClick={() => setCondition(cond)}
                className={cn(
                  'py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm border',
                  condition === cond
                    ? 'liquid-button !border-transparent !text-black shadow-lg shadow-accent/20 scale-105'
                    : 'bg-[#161622] border-[#2A2A35] text-white/60 hover:border-[#3A3A4A] hover:text-white'
                )}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">
              Specifications <span className="normal-case text-white/30 font-normal ml-1">(Optional)</span>
            </label>
            {!isAddingSpec && (
              <button
                onClick={() => setIsAddingSpec(true)}
                className="text-accent text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
              >
                <Plus className="w-3.5 h-3.5" /> Add Spec
              </button>
            )}
          </div>

          {/* Spec Tags */}
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="bg-[#161622] border border-[#2A2A35] px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-white">
                <span className="text-white/50 font-medium">{key}:</span>
                <span className="font-semibold">{value}</span>
                <button
                  onClick={() => handleRemoveSpec(key)}
                  className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors ml-1"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {Object.keys(specs).length === 0 && !isAddingSpec && (
              <p className="text-white/30 text-xs sm:text-sm italic">e.g. Brand: Sony, Year: 2022, Weight: 650g</p>
            )}
          </div>

          {/* Inline Add Form */}
          {isAddingSpec && (
            <div className="bg-[#161622] border border-[#2A2A35] rounded-xl p-3 flex flex-col sm:flex-row gap-2 animate-in zoom-in-95 duration-200">
              <input
                type="text"
                placeholder="Label (e.g. Brand)"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                className="flex-1 bg-[#1A1A2A] border border-[#2A2A35] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white placeholder:text-white/30"
              />
              <input
                type="text"
                placeholder="Value (e.g. Sony)"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()}
                className="flex-1 bg-[#1A1A2A] border border-[#2A2A35] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-white placeholder:text-white/30"
              />
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => setIsAddingSpec(false)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSpec}
                  disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                  className="flex-1 sm:flex-none liquid-button !py-2 !rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Visibility Status */}
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Visibility</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setStatus('draft')}
              className={cn(
                'rounded-xl p-4 flex flex-col items-start gap-1 text-left transition-all duration-200 border',
                status === 'draft'
                  ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(57,255,20,0.15)] text-white'
                  : 'border-[#2A2A35] bg-[#161622] hover:border-[#3A3A4A] text-white/70'
              )}
            >
              <div className={cn('w-3.5 h-3.5 rounded-full border-2 mb-1 transition-colors', status === 'draft' ? 'border-accent bg-accent' : 'border-[#3A3A4A]')} />
              <span className="font-bold text-sm">Save as Draft</span>
              <span className="text-xs text-white/40">Hidden — publish later.</span>
            </button>

            <button
              onClick={() => setStatus('active')}
              className={cn(
                'rounded-xl p-4 flex flex-col items-start gap-1 text-left transition-all duration-200 border',
                status === 'active'
                  ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(57,255,20,0.15)] text-white'
                  : 'border-[#2A2A35] bg-[#161622] hover:border-[#3A3A4A] text-white/70'
              )}
            >
              <div className={cn('w-3.5 h-3.5 rounded-full border-2 mb-1 transition-colors', status === 'active' ? 'border-accent bg-accent' : 'border-[#3A3A4A]')} />
              <span className="font-bold text-sm">Publish Now</span>
              <span className="text-xs text-white/40">Go live immediately.</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden trigger for card footer */}
      <button id="step-next-trigger" onClick={handleNext} className="hidden" />

      {!hideFooter && (
        <div className="mt-4 flex justify-between">
          <button onClick={onBack} className="px-6 py-3 rounded-full font-bold transition-colors hover:text-accent hover:bg-foreground/5">
            ← Back
          </button>
          <button onClick={handleNext} className="px-8 py-3 rounded-full font-bold liquid-button">
            Next: Availability
          </button>
        </div>
      )}
    </div>
  );
}
