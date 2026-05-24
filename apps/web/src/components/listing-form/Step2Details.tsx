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
};

export function Step2Details({ data, updateData, onNext, onBack }: Step2Props) {
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

  const CONDITIONS = ['New', 'Like new', 'Used', 'Damaged'] as const;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Make it stand out</h2>
        <p className="text-foreground/70">Add specific technical details and choose if you want to publish immediately.</p>
      </div>

      <div className="space-y-10">
        {/* Specifications */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">
              Item Specifications <span className="normal-case text-foreground/50 font-normal ml-2">(Optional)</span>
            </label>
            {!isAddingSpec && (
              <button 
                onClick={() => setIsAddingSpec(true)}
                className="text-accent hover:text-accent-hover text-sm font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Spec
              </button>
            )}
          </div>
          
          {/* Spec List */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="glass-spotlight px-4 py-2 rounded-full flex items-center gap-3">
                <span className="text-foreground/60 font-semibold">{key}:</span>
                <span className="text-foreground font-medium">{value}</span>
                <button 
                  onClick={() => handleRemoveSpec(key)}
                  className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {Object.keys(specs).length === 0 && !isAddingSpec && (
              <div className="w-full chrome-card rounded-xl p-8 border-dashed flex flex-col items-center justify-center text-center opacity-60">
                <p className="text-sm mb-2">No specifications added.</p>
                <p className="text-xs text-foreground/50">Add things like Brand, Model, Year, Dimensions, etc.</p>
              </div>
            )}
          </div>

          {/* Add Spec Form */}
          {isAddingSpec && (
            <div className="chrome-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center animate-in zoom-in-95 duration-200">
              <input 
                type="text" 
                placeholder="e.g. Brand" 
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
              <input 
                type="text" 
                placeholder="e.g. Sony" 
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={() => setIsAddingSpec(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-foreground/10 hover:bg-foreground/20 text-sm flex-1 md:flex-none transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddSpec}
                  disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold bg-accent text-black disabled:opacity-50 text-sm flex-1 md:flex-none transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Item Condition */}
        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">Item Condition</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CONDITIONS.map(cond => (
              <button
                key={cond}
                onClick={() => setCondition(cond)}
                className={cn(
                  "py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-sm",
                  condition === cond 
                    ? "bg-accent text-black shadow-[0_0_15px_rgba(57,255,20,0.3)] transform scale-105" 
                    : "bg-surface border border-border/50 text-foreground/70 hover:bg-foreground/5"
                )}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Status Toggle */}
        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-foreground/80 pl-2">Visibility Status</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setStatus('draft')}
              className={cn(
                "chrome-card rounded-2xl p-6 flex flex-col items-start gap-2 text-left transition-all duration-300",
                status === 'draft' ? "border-2 border-accent shadow-[0_0_20px_rgba(57,255,20,0.15)]" : "opacity-70 hover:opacity-100"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full border-2 mb-2", status === 'draft' ? "border-accent bg-accent" : "border-foreground/30")} />
              <span className="font-display font-bold text-lg">Save as Draft</span>
              <span className="text-sm text-foreground/60">Keep it hidden. You can edit and publish it later.</span>
            </button>
            
            <button
              onClick={() => setStatus('active')}
              className={cn(
                "chrome-card rounded-2xl p-6 flex flex-col items-start gap-2 text-left transition-all duration-300",
                status === 'active' ? "border-2 border-accent shadow-[0_0_20px_rgba(57,255,20,0.15)]" : "opacity-70 hover:opacity-100"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full border-2 mb-2", status === 'active' ? "border-accent bg-accent" : "border-foreground/30")} />
              <span className="font-display font-bold text-lg">Publish Now</span>
              <span className="text-sm text-foreground/60">Make it instantly visible in the marketplace after finishing.</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 rounded-full font-bold transition-colors hover:text-accent hover:bg-foreground/5"
        >
          ← Back
        </button>
        <button 
          onClick={handleNext}
          className="px-8 py-3 rounded-full font-bold liquid-button"
        >
          Next: Availability
        </button>
      </div>
    </div>
  );
}
