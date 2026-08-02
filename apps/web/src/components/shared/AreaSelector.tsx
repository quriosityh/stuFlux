import { useState, useMemo } from 'react';
import { Search, MapPin, Check } from 'lucide-react';
import { searchAreas, POPULAR_AREA_IDS, getAreaById, LAHORE_AREAS_DATA, LahoreArea } from '@stuflux/types';

type AreaSelectorProps = {
  value: string;
  onChange: (areaId: string) => void;
};

export function AreaSelector({ value, onChange }: AreaSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredAreas = useMemo(() => {
    if (!search.trim()) {
      return POPULAR_AREA_IDS.map(id => getAreaById(id, LAHORE_AREAS_DATA)).filter(Boolean) as LahoreArea[];
    }
    return searchAreas(search, LAHORE_AREAS_DATA, 8);
  }, [search]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search area…"
          className="w-full bg-surface/40 border border-border/30 text-foreground placeholder-foreground/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent/60 focus:bg-surface/60 transition-all"
        />
      </div>

      {/* Section label */}
      <span className="text-[10px] font-semibold text-foreground/30 uppercase tracking-[0.18em]">
        {search ? 'Results' : 'Popular areas'}
      </span>

      {/* Area list */}
      <div className="flex flex-col divide-y divide-border/15 overflow-y-auto max-h-[340px] rounded-xl border border-border/20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {filteredAreas.length === 0 ? (
          <div className="text-center text-foreground/30 text-sm py-10">
            No areas found for &ldquo;{search}&rdquo;
          </div>
        ) : (
          filteredAreas.map((area: LahoreArea) => {
            const isSelected = value === area.id;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => onChange(area.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
                  ${isSelected
                    ? 'bg-accent/8 text-foreground'
                    : 'hover:bg-surface/60 text-foreground/80'}
                `}
              >
                {/* Pin icon */}
                <MapPin className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-accent' : 'text-foreground/25'}`} />

                {/* Name */}
                <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-foreground' : ''}`}>
                  {area.name}
                </span>

                {/* Checkmark */}
                {isSelected && (
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
