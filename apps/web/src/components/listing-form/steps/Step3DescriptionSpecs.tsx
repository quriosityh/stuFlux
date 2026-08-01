import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { ListingFormData } from '../types';

type Step3DescriptionSpecsProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onValidChange?: (valid: boolean) => void;
};

const CONDITIONS = [
  { id: 'like_new', label: '✨ Like New', desc: 'Used once or twice, perfect condition' },
  { id: 'good', label: '👍 Good', desc: 'Minor signs of wear, fully functional' },
  { id: 'fair', label: '👌 Fair', desc: 'Noticeable wear, works fine' },
  { id: 'well_used', label: '🔧 Well Used', desc: 'Heavy wear, still usable' },
] as const;

export function Step3DescriptionSpecs({ data, updateData, onValidChange }: Step3DescriptionSpecsProps) {
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const isValid = data.description.length >= 10 && data.condition !== '';

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    updateData({
      specs: { ...data.specs, [newSpecKey.trim()]: newSpecValue.trim() }
    });
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (key: string) => {
    const newSpecs = { ...data.specs };
    delete newSpecs[key];
    updateData({ specs: newSpecs });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-4xl font-display font-bold text-foreground mb-2 text-center lg:text-left">Describe your item</h2>
        <p className="text-foreground/50 text-sm">
          Tell renters what's included, any quirks, and the condition.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {/* Description Input */}
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={data.description}
              onChange={(e) => updateData({ description: e.target.value })}
              placeholder="e.g. Includes original charger and 2 batteries. Lens is scratch-free..."
              className="w-full h-32 bg-surface/50 border border-border/50 text-foreground placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              maxLength={2000}
            />
            <div className={`absolute right-4 bottom-3 text-xs font-medium ${data.description.length < 10 ? 'text-red-400' : 'text-foreground/40'}`}>
              {data.description.length}/2000
            </div>
          </div>
        </div>

        {/* Condition Grid */}
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
            Condition <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {CONDITIONS.map((cond) => {
              const isSelected = data.condition === cond.id;
              return (
                <button
                  key={cond.id}
                  onClick={() => updateData({ condition: cond.id })}
                  className={`
                    flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left
                    ${isSelected
                      ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                      : 'bg-surface/50 border-border/50 hover:bg-border/50'}
                  `}
                >
                  <span className={`font-bold mb-1 ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                    {cond.label}
                  </span>
                  <span className={`text-xs ${isSelected ? 'text-foreground/80' : 'text-foreground/50'}`}>
                    {cond.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specs */}
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-4 uppercase tracking-wider">
            Specifications (Optional)
          </label>
          <div className="space-y-4">
            {Object.keys(data.specs).length > 0 && (
              <div className="overflow-hidden rounded-xl border border-border/40">
                <table className="w-full text-xs sm:text-sm text-center border-collapse">
                  <thead>
                    <tr className="bg-foreground/[0.04] border-b border-border/40 text-foreground/60 font-semibold uppercase text-[10px] sm:text-xs tracking-wider">
                      <th className="py-2.5 px-3 text-center w-1/2">Feature</th>
                      <th className="py-2.5 px-3 text-center w-1/2">Detail</th>
                      <th className="py-2.5 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {Object.entries(data.specs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-foreground/[0.02] transition-colors group">
                        <td className="py-2.5 px-3 text-center text-foreground/70 font-medium w-1/2">{key}</td>
                        <td className="py-2.5 px-3 text-center text-foreground font-semibold w-1/2">{value}</td>
                        <td className="py-2.5 px-2 text-center w-10">
                          <button
                            onClick={() => handleRemoveSpec(key)}
                            className="p-1 text-foreground/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove specification"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                placeholder="Feature (e.g. Brand)"
                className="w-1/2 bg-surface/50 border border-border/50 text-foreground placeholder-foreground/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-center focus:outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()}
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Detail (e.g. Sony)"
                className="w-1/2 bg-surface/50 border border-border/50 text-foreground placeholder-foreground/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-center focus:outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()}
              />
              <button
                onClick={handleAddSpec}
                disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                className="p-2.5 bg-border/50 text-foreground rounded-xl hover:bg-accent hover:text-black transition-colors disabled:opacity-40 flex-shrink-0 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
