import { useState, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import { ListingFormData, LAHORE_AREAS, Area } from '../types';

type Step5AreaProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function Step5Area({ data, updateData, onNext, onBack }: Step5AreaProps) {
  const [search, setSearch] = useState('');

  const filteredAreas = useMemo(() => {
    if (!search.trim()) return LAHORE_AREAS;
    const lowerSearch = search.toLowerCase();
    return LAHORE_AREAS.filter((area: Area) => 
      area.name.toLowerCase().includes(lowerSearch) || 
      (area.description && area.description.toLowerCase().includes(lowerSearch))
    );
  }, [search]);

  const isValid = data.area !== '';

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Where is this item?</h2>
        <p className="text-white/50 text-sm">
          Select your general area in Lahore. Your exact location is only shared after booking.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for your area..."
            className="w-full bg-[#1A1A24] border border-[#2A2A35] text-white placeholder-white/30 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        {/* Area List */}
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            {search ? 'Search Results' : 'Most Relevant Options'}
          </h3>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1A1A24] [&::-webkit-scrollbar-thumb]:bg-[#2A2A35] [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredAreas.length === 0 ? (
              <div className="text-center text-white/50 py-8 bg-[#1A1A24] rounded-xl">
                No areas found matching "{search}"
              </div>
            ) : (
              filteredAreas.map((area: Area) => {
                const isSelected = data.area === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => updateData({ area: area.id })}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                      ${isSelected 
                        ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                        : 'bg-[#1A1A24] border-[#2A2A35] hover:bg-[#2A2A35]'}
                    `}
                  >
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-accent text-black' : 'bg-[#2A2A35] text-white/50'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-bold ${isSelected ? 'text-accent' : 'text-white'}`}>
                        {area.name}
                      </div>
                      {area.description && (
                        <div className="text-sm text-white/50">{area.description}</div>
                      )}
                    </div>
                    {/* Radio circle */}
                    <div className="ml-auto w-5 h-5 rounded-full border-2 border-[#2A2A35] flex items-center justify-center">
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[#2A2A35] flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 font-semibold text-sm text-white/50 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="liquid-button px-8 py-3 font-bold text-sm text-black disabled:opacity-50 disabled:pointer-events-none"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
