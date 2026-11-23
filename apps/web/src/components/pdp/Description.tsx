'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DescriptionProps {
  text: string;
  specs?: Record<string, string>;
}

export function Description({ text, specs: propSpecs }: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Split description and specs
  const specMarkerIndex = text.search(/(?:Specs:|Specifications:)/i);
  let mainDescription = text;
  let rawSpecs = '';

  if (specMarkerIndex !== -1) {
    mainDescription = text.substring(0, specMarkerIndex).trim();
    const markerMatch = text.match(/(?:Specs:|Specifications:)/i);
    if (markerMatch) {
      rawSpecs = text.substring(specMarkerIndex + markerMatch[0].length).trim();
    }
  }

  const parsedSpecs = rawSpecs
    .split('\n')
    .map(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        return {
          label: line.substring(0, colonIndex).trim(),
          value: line.substring(colonIndex + 1).trim(),
        };
      }
      return null;
    })
    .filter((spec): spec is { label: string; value: string } => spec !== null && spec.label !== '' && spec.value !== '');

  // Merge prop-level specs with text-parsed specs (prop specs take priority)
  let specsObj: Record<string, string> = {};
  if (propSpecs && typeof propSpecs === 'object' && !Array.isArray(propSpecs)) {
    specsObj = propSpecs;
  } else if (typeof propSpecs === 'string') {
    try { specsObj = JSON.parse(propSpecs); } catch { specsObj = {}; }
  }
  const propSpecEntries = Object.entries(specsObj)
    .filter(([k, v]) => typeof k === 'string' && typeof v === 'string' && k.trim() && v.trim())
    .map(([label, value]) => ({ label: label.trim(), value: String(value).trim() }));
  const allSpecs = propSpecEntries.length > 0 ? propSpecEntries : parsedSpecs;

  const isLongText = mainDescription.length > 250 || (mainDescription.match(/\n/g) || []).length > 4;

  return (
    <div className="mb-12" id="details-section">
      {/* About this item */}
      <div className="mb-8">
        <h2 className="text-xl font-bold font-syne mb-4">About this item</h2>
        <div className="relative">
          <div 
            className={cn(
              "text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap transition-all duration-300",
              !isExpanded && isLongText && "line-clamp-4 mask-bottom"
            )}
          >
            {mainDescription}
          </div>
          
          {isLongText && !isExpanded && (
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          )}
        </div>

        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent hover:underline hover:text-accent-hover transition-colors"
          >
            {isExpanded ? 'Show less' : 'Show more'}
            <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Specifications Section - Prominent and outside of the 'show more' fold */}
      {allSpecs.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border/10">
          <h3 className="text-lg font-bold font-syne mb-4 tracking-tight">Product Specifications</h3>
          <div className="border border-border/10 rounded-2xl overflow-hidden bg-surface/10 dark:bg-zinc-900/10 divide-y divide-border/10">
            {allSpecs.map((spec, index) => (
              <div 
                key={index}
                className="flex flex-row items-center py-4 px-4 sm:px-6 gap-4 hover:bg-surface/30 dark:hover:bg-zinc-900/30 transition-colors duration-200"
              >
                <span className="text-xs text-foreground/45 uppercase tracking-wider font-semibold w-[40%] sm:w-1/3 shrink-0">
                  {spec.label}
                </span>
                <span className="text-sm font-bold font-manrope text-foreground/90 flex-1 break-words">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
