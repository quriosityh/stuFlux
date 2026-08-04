import { ListingFormData } from '../types';
import { getAreaName, LAHORE_AREAS_DATA } from '@stuflux/types';
import { 
  MapPin, 
  Tag, 
  Banknote, 
  ShieldCheck, 
  CalendarDays,
  Truck,
  FileText,
  Sliders,
  Edit3,
  Image as ImageIcon,
  Sparkles,
  Check,
  Info
} from 'lucide-react';

type Step7ReviewProps = {
  data: ListingFormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
  onEditStep?: (step: number) => void;
};

const CATEGORY_MAP: Record<number, string> = {
  1: 'Electronics', 2: 'Tools', 3: 'Party', 4: 'Sports', 5: 'Home',
  6: 'Music', 7: 'Vehicles', 8: 'Books', 9: 'Fashion', 10: 'Other'
};

const CONDITION_MAP: Record<string, { label: string; badge: string }> = {
  like_new: { label: 'Like New', badge: '✨ Like New' },
  good: { label: 'Good', badge: '👍 Good' },
  fair: { label: 'Fair', badge: '👌 Fair' },
  well_used: { label: 'Well Used', badge: '🔧 Well Used' },
};

export function Step7Review({ data, onBack, onSubmit, isSubmitting, onEditStep, isEdit = false }: Step7ReviewProps) {
  const areaName = getAreaName(data.area, LAHORE_AREAS_DATA) || 'Lahore';
  const categoryName = CATEGORY_MAP[data.category_id] || 'Category';
  const conditionInfo = CONDITION_MAP[data.condition] || { label: data.condition || 'Not specified', badge: data.condition || 'Standard' };
  const specEntries = Object.entries(data.specs || {}).filter(([k, v]) => k.trim() && v.trim());

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-500 w-full max-w-5xl mx-auto px-2 sm:px-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              Final Review
            </span>
            <span className="text-xs text-foreground/50">• Step 7 of 7</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Review & Publish</h2>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Double-check your listing details below before putting your item live for renters.
          </p>
        </div>

        {/* Quick Summary Pill for Mobile / Laptop */}
        <div className="hidden sm:flex items-center gap-3 bg-foreground/[0.04] border border-border/40 rounded-2xl px-4 py-2 text-xs text-foreground/70">
          <div className="flex items-center gap-1.5 font-medium">
            <ImageIcon size={14} className="text-accent" /> {data.photos.length} Photos
          </div>
          <span className="text-border/60">•</span>
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            Rs {data.daily_rate?.toLocaleString() || 0}<span className="text-foreground/50 font-normal">/day</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Responsive 2 Columns on Desktop, 1 Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN (7 cols): Photos, Details, Specs & Rules */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. Photos Summary */}
          <div className="chrome-card rounded-2xl sm:rounded-3xl p-4 sm:p-6" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-accent" />
                <h3 className="text-base sm:text-lg font-bold font-display text-foreground">
                  Photos ({data.photos.length})
                </h3>
              </div>
              {onEditStep && (
                <button
                  onClick={() => onEditStep(1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <Edit3 size={13} /> Edit
                </button>
              )}
            </div>

            {data.photos.length > 0 ? (
              <div className="space-y-3">
                {/* Cover Photo */}
                <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-border/30 bg-foreground/[0.03]">
                  <img 
                    src={data.photos[0]?.url} 
                    alt={data.title || "Primary listing photo"} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Sparkles size={11} className="text-accent" /> Cover Photo
                  </div>
                </div>

                {/* Secondary Thumbnails */}
                {data.photos.length > 1 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                    {data.photos.slice(1).map((photo, i) => (
                      <div key={i} className="aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-border/30 bg-foreground/[0.03]">
                        <img 
                          src={photo.url} 
                          alt={`Listing photo ${i + 2}`} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full py-10 rounded-xl sm:rounded-2xl bg-foreground/[0.03] border border-dashed border-border/50 flex flex-col items-center justify-center text-foreground/40 text-sm gap-2">
                <ImageIcon size={28} className="opacity-40" />
                <span>No photos added to this listing</span>
              </div>
            )}
          </div>

          {/* 2. Item Details & Overview */}
          <div className="chrome-card rounded-2xl sm:rounded-3xl p-4 sm:p-6" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold font-display text-foreground flex items-center gap-2">
                <FileText size={18} className="text-accent" /> Item Details
              </h3>
              {onEditStep && (
                <button
                  onClick={() => onEditStep(2)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <Edit3 size={13} /> Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold mb-1">Title</div>
                <div className="text-base sm:text-xl font-semibold text-foreground leading-snug">
                  {data.title || <span className="italic text-foreground/40">Untitled Item</span>}
                </div>
              </div>

              {/* Combined Meta Box: Category, Location, Condition in ONE box with vertical dividers */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-foreground/[0.03] border border-border/40 flex items-center justify-between gap-2 sm:gap-4 divide-x divide-border/30">
                <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                  <div className="text-[10px] text-foreground/50 uppercase tracking-wider font-bold mb-1 truncate">Category</div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground truncate">
                    <Tag size={14} className="text-accent flex-shrink-0" />
                    <span className="truncate">{categoryName}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 px-2 sm:px-4">
                  <div className="text-[10px] text-foreground/50 uppercase tracking-wider font-bold mb-1 truncate">Location</div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground truncate">
                    <MapPin size={14} className="text-accent flex-shrink-0" />
                    <span className="truncate">{areaName}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 pl-2 sm:pl-4">
                  <div className="text-[10px] text-foreground/50 uppercase tracking-wider font-bold mb-1 truncate">Condition</div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                    {conditionInfo.badge}
                  </div>
                </div>
              </div>


              {/* Description */}
              <div className="pt-2">
                <div className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold mb-1.5">Description</div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {data.description || <span className="italic text-foreground/40">No description provided.</span>}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Specifications Section */}
          <div className="chrome-card rounded-2xl sm:rounded-3xl p-4 sm:p-6" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-accent" />
                <h3 className="text-base sm:text-lg font-bold font-display text-foreground">
                  Specifications & Features
                </h3>
              </div>
              {onEditStep && (
                <button
                  onClick={() => onEditStep(3)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <Edit3 size={13} /> Edit
                </button>
              )}
            </div>

            {specEntries.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border/30">
                <table className="w-full text-xs sm:text-sm text-center border-collapse">
                  <thead>
                    <tr className="bg-foreground/[0.04] border-b border-border/30 text-foreground/60 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-4 text-center w-1/2">Feature</th>
                      <th className="py-2.5 px-4 text-center w-1/2">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {specEntries.map(([key, value]) => (
                      <tr key={key} className="hover:bg-foreground/[0.02] transition-colors">
                        <td className="py-2.5 px-4 text-center text-foreground/70 font-medium w-1/2">{key}</td>
                        <td className="py-2.5 px-4 text-center text-foreground font-semibold w-1/2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-foreground/50 flex items-center justify-center gap-2 py-3 text-center">
                <Info size={15} className="text-foreground/40 flex-shrink-0" />
                <span>No custom specifications added.</span>
              </div>
            )}
          </div>

          {/* 4. Rental Rules / Additional Terms (if provided) */}
          {data.rental_rules && data.rental_rules.trim() !== '' && (
            <div className="chrome-card rounded-2xl sm:rounded-3xl p-4 sm:p-6" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-bold font-display text-foreground flex items-center gap-2">
                  <ShieldCheck size={16} className="text-accent" /> Rental Rules & Guidelines
                </h3>
                {onEditStep && (
                  <button
                    onClick={() => onEditStep(4)}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap">
                {data.rental_rules}
              </p>
            </div>
          )}

        </div>


        {/* RIGHT COLUMN (5 cols): Pricing, Availability & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-8">
          
          {/* 1. Pricing & Terms Card */}
          <div className="chrome-card rounded-2xl sm:rounded-3xl p-4 sm:p-6" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold font-display text-foreground flex items-center gap-2">
                <Banknote size={18} className="text-emerald-400" /> Pricing & Terms
              </h3>
              {onEditStep && (
                <button
                  onClick={() => onEditStep(4)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <Edit3 size={13} /> Edit
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Daily Rate Highlight Box */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    Rs
                  </div>
                  <div>
                    <div className="text-[11px] text-foreground/60 font-medium uppercase tracking-wider">Daily Rental Rate</div>
                    <div className="font-extrabold text-xl sm:text-2xl text-foreground">
                      Rs {data.daily_rate?.toLocaleString() || 0}
                      <span className="text-xs font-normal text-foreground/50"> / day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Deposit Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-foreground/[0.03] border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] text-foreground/50 font-medium">Refundable Deposit</div>
                    <div className="font-bold text-sm sm:text-base text-foreground">
                      Rs {data.security_deposit?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Limits */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="p-3 rounded-xl border border-border/40 bg-foreground/[0.03] flex flex-col">
                  <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 mb-1">
                    <CalendarDays size={12} className="text-foreground/40" /> Min Rental
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {data.min_rental_days || 1} {data.min_rental_days === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border/40 bg-foreground/[0.03] flex flex-col">
                  <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 mb-1">
                    <CalendarDays size={12} className="text-foreground/40" /> Max Rental
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {data.max_rental_days || 30} {data.max_rental_days === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
              </div>
              
              {/* Delivery info */}
              <div className="mt-2 p-3 rounded-xl bg-foreground/[0.03] border border-border/40 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground/80">
                  <Truck size={16} className="text-accent flex-shrink-0" />
                  <span>{data.delivery_available ? 'Delivery Available' : 'Pickup Only'}</span>
                </div>
                {data.delivery_available && (
                  <span className="font-semibold text-accent">
                    Rs {data.delivery_fee?.toLocaleString() || 0}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Blocked / Unavailable Dates Summary */}
          {data.blocked_dates && data.blocked_dates.length > 0 && (
            <div className="chrome-card rounded-2xl sm:rounded-3xl p-4 sm:p-6" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                  <CalendarDays size={16} className="text-red-400" />
                  Unavailable Dates ({data.blocked_dates.length})
                </h3>
                {onEditStep && (
                  <button
                    onClick={() => onEditStep(6)}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {data.blocked_dates.map((b, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 font-medium border border-red-500/20">
                    {new Date(b.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {b.end_date !== b.start_date && ` - ${new Date(b.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. Final Call-to-Action Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-accent/15 via-accent/5 to-surface border border-accent/30 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Ready for Market</span>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-foreground mb-1">
              {isEdit ? 'Ready to save changes?' : 'Ready to publish?'}
            </h3>
            <p className="text-xs sm:text-sm text-foreground/70 mb-5 leading-relaxed">
              {isEdit
                ? 'Your updates will be saved while keeping the current listing status.'
                : 'Once published, your item will be active and visible for rental requests on StuFlux.'}
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full hyper-liquid py-3.5 sm:py-4 font-bold text-sm sm:text-base text-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(var(--accent-rgb),0.3)] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>{isEdit ? 'Saving...' : 'Publishing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>{isEdit ? 'Save Changes' : 'Publish Listing'}</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full py-2.5 font-semibold text-xs sm:text-sm text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50 rounded-xl hover:bg-foreground/5 cursor-pointer text-center"
              >
                ← Back to Edit Steps
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-center gap-2 text-[11px] text-foreground/50">
              <Check size={12} className="text-emerald-400" />
              <span>You can pause or edit this listing at any time from your dashboard.</span>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
