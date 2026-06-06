import { useState, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import { ListingFormData } from '../types';
import { searchAreas, POPULAR_AREA_IDS, getAreaById, getNearbyAreas, LAHORE_AREAS_DATA, LahoreArea } from '@stuflux/types';

type Step5AreaProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function Step5Area({ data, updateData, onNext, onBack }: Step5AreaProps) {
  const [search, setSearch] = useState('');

  const filteredAreas = useMemo(() => {
    if (!search.trim()) {
      return POPULAR_AREA_IDS.map(id => getAreaById(id, LAHORE_AREAS_DATA)).filter(Boolean) as LahoreArea[];
    }
    return searchAreas(search, LAHORE_AREAS_DATA, 8);
  }, [search]);

  const nearbyAreas = useMemo(() => {
    if (!data.area) return [];
    return getNearbyAreas(data.area, LAHORE_AREAS_DATA, 3);
  }, [data.area]);

  const isValid = data.area !== '';

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Where is this item?</h2>
        <p className="text-foreground/50 text-sm">
          Select your general area in Lahore. Your exact location is only shared after booking.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for your area..."
            className="w-full bg-surface/50 border border-border/50 text-foreground placeholder-white/30 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        {/* Area List */}
        <div>
          <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
            {search ? 'Search Results' : 'Most Relevant Options'}
          </h3>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-surface/50 [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredAreas.length === 0 ? (
              <div className="text-center text-foreground/50 py-8 bg-surface/50 rounded-xl">
                No areas found matching "{search}"
              </div>
            ) : (
              filteredAreas.map((area: LahoreArea) => {
                const isSelected = data.area === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => updateData({ area: area.id })}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                      ${isSelected 
                        ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                        : 'bg-surface/50 border-border/50 hover:bg-border/50'}
                    `}
                  >
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-accent text-black' : 'bg-border/50 text-foreground/50'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                        {area.name}
                      </div>
                      {area.featureCode === 'PPLX' && (
                        <div className="text-sm text-foreground/50">Lahore</div>
                      )}
                    </div>
                    {/* Radio circle */}
                    <div className="ml-auto w-5 h-5 rounded-full border-2 border-border/50 flex items-center justify-center">
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
        
        {data.area && nearbyAreas.length > 0 && (
          <div className="bg-accent/10 text-accent px-4 py-3 rounded-xl border border-accent/20 text-sm font-medium flex items-center justify-between">
            <span>✨ When users search near your area, they will find your item!</span>
            <span className="bg-accent/20 px-2 py-0.5 rounded-full text-xs">{nearbyAreas.length} nearby areas found</span>
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-border/50 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 font-semibold text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="hyper-liquid px-8 py-3 font-bold text-sm text-black disabled:opacity-50 disabled:pointer-events-none"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
