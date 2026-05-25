'use client';

import { useState, useRef } from 'react';
import { ListingFormData } from './types';
import { StepIndicator } from './StepIndicator';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Camera, X, ImageIcon, UploadCloud, ChevronLeft, ChevronRight, MapPin, Star, CheckCircle2, MessageCircle } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step4Props = {
  data: Partial<ListingFormData>;
  onSubmit: (finalData: Partial<ListingFormData>) => void;
  onBack: () => void;
  isSubmitting: boolean;
};

const CATEGORY_MAP: Record<number, string> = {
  1: 'Electronics',
  2: 'Furniture',
  3: 'Gaming',
  4: 'Fashion & Accessories',
  5: 'Events & Party',
  6: 'Others',
};

export function Step4Photos({ data, onSubmit, onBack, isSubmitting }: Step4Props) {
  const [photos, setPhotos] = useState<string[]>(data.photo_urls || []);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newUrls = files
      .slice(0, 5 - photos.length)
      .map(f => URL.createObjectURL(f));
    setPhotos(prev => [...prev, ...newUrls]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (activePhoto >= next.length) setActivePhoto(Math.max(0, next.length - 1));
      return next;
    });
  };

  const handleSubmit = () => onSubmit({ photo_urls: photos });

  const categoryName = data.category_id ? CATEGORY_MAP[data.category_id] : null;

  if (showPreview) {
    return <PreviewMode data={data} photos={photos} categoryName={categoryName} onBack={() => setShowPreview(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
  }

  return (
    <div className="min-h-screen relative flex items-start justify-center pt-8 sm:pt-12 pb-24 px-4 bg-[#0B0B13] overflow-hidden">
      {/* Background ambient glow matching the image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full relative z-10 bg-[#0D0D16]/90 backdrop-blur-xl border border-[#2A2A35] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden" style={{ maxWidth: '820px' }}>

        {/* ── Step Indicator (matches steps 1–3) ── */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-2">
          <StepIndicator currentStep={4} totalSteps={4} />
        </div>

        {/* Back button row */}
        <div className="flex items-center px-4 sm:px-10 pb-4 border-b border-[#2A2A35]">
          <button onClick={onBack} className="text-white/50 hover:text-white font-semibold text-xs sm:text-sm transition-colors">
            ← Back
          </button>
        </div>

        {/* Body — scrollable like steps 1–3 */}
        <div className="px-4 sm:px-10 py-6 sm:py-8 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">Showcase Your Item</h2>
            <p className="text-white/50 text-xs sm:text-sm max-w-sm">Add up to 5 clear photos. The first photo is your cover.</p>
          </div>

          {/* Hidden file input — no capture attribute so it works on desktop too */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhoto(idx)}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 transition-all duration-200',
                  activePhoto === idx ? 'border-accent shadow-[0_0_12px_rgba(57,255,20,0.3)]' : 'border-transparent'
                )}
              >
                <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <div className="absolute bottom-2 left-2 bg-accent text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Cover
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add photo slots */}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[#2A2A35] hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-accent transition-all duration-200"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs font-semibold">{photos.length === 0 ? 'Add Photo' : 'Add More'}</span>
                <span className="text-[10px] sm:text-xs opacity-60">{5 - photos.length} left</span>
              </button>
            )}
          </div>

          {photos.length === 0 && (
            <div className="bg-[#161622] border border-dashed border-[#2A2A35] rounded-xl p-8 text-center">
              <ImageIcon className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50 font-medium">No photos added yet</p>
              <p className="text-xs text-white/30 mt-1">Click the grid above to upload images from your device.</p>
            </div>
          )}

          <p className="text-xs text-white/40 text-center">
            💡 Tip: Well-lit photos from multiple angles get <strong className="text-white/60">3x more interest</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-10 py-5 sm:py-6 bg-[#0D0D16] border-t border-[#2A2A35]">
          <button
            onClick={() => setShowPreview(true)}
            disabled={photos.length === 0}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Preview <span className="hidden sm:inline">Listing </span>→
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || photos.length === 0}
            className={cn(
              'px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2',
              isSubmitting || photos.length === 0 ? 'opacity-40 cursor-not-allowed bg-white/10 text-white/50' : 'liquid-button text-black'
            )}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Publishing...</span>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                {data.status === 'active' ? 'Publish Listing' : 'Save Draft'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Full Preview Mode ──────────────────────────────────────────────────────

function PreviewMode({
  data,
  photos,
  categoryName,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  data: Partial<ListingFormData>;
  photos: string[];
  categoryName: string | null;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const prev = () => setActiveIdx(i => Math.max(0, i - 1));
  const next = () => setActiveIdx(i => Math.min(photos.length - 1, i + 1));

  const conditionColor: Record<string, string> = {
    'New': 'text-green-400',
    'Like new': 'text-emerald-400',
    'Used': 'text-yellow-400',
    'Damaged': 'text-red-400',
  };

  const specEntries = data.specs ? Object.entries(data.specs) : [];

  const ownerInitials = 'ME';

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* Preview Banner */}
      <div className="bg-amber-950/60 border-b border-amber-700/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
          <span className="text-base">👁️</span>
          <span>Preview — This is how renters will see your listing. It's not live yet.</span>
        </div>
        <button onClick={onBack} className="text-amber-400 hover:text-amber-200 text-sm font-semibold transition-colors flex-shrink-0">
          ← Edit
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[58%_42%] lg:gap-8 lg:items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* Photo Gallery */}
          <div className="space-y-3">
            {/* Main photo */}
            <div className="relative w-full aspect-video bg-surface rounded-2xl overflow-hidden border border-border/20">
              {photos.length > 0 ? (
                <img src={photos[activeIdx]} alt="Main" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-foreground/30">
                  <ImageIcon className="w-12 h-12" />
                  <span className="text-sm">No photos added yet</span>
                </div>
              )}

              {/* Category badge */}
              {categoryName && (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                  {categoryName}
                </div>
              )}

              {/* Photo counter */}
              {photos.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {activeIdx + 1} / {photos.length}
                </div>
              )}

              {/* Nav arrows */}
              {photos.length > 1 && (
                <>
                  <button onClick={prev} disabled={activeIdx === 0} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={next} disabled={activeIdx === photos.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-2">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      'w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-200',
                      i === activeIdx ? 'border-accent shadow-[0_0_8px_rgba(57,255,20,0.3)]' : 'border-border/30 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Info */}
          <div className="space-y-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground leading-tight">
                {data.title || <span className="italic text-foreground/30">No title added</span>}
              </h1>

              <div className="flex items-center gap-1.5 mt-2 text-foreground/50 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {data.address ? `${data.address}, ` : ''}
                  {data.city || <span className="italic">City not set</span>}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-foreground/20 fill-foreground/20" />)}
                <span className="text-xs text-foreground/40">No reviews yet</span>
              </div>
            </div>

            <div className="border-t border-border/20" />

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground/80">About this item</h3>
              <div className="text-sm text-foreground/70 leading-relaxed">
                {data.description ? (
                  <>
                    <span>{expanded ? data.description : data.description.slice(0, 200)}</span>
                    {data.description.length > 200 && (
                      <button onClick={() => setExpanded(!expanded)} className="text-accent font-semibold ml-1 hover:opacity-80">
                        {expanded ? 'Show less' : '...Read more'}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="italic text-foreground/30">No description added</span>
                )}
              </div>
            </div>

            {/* Specs Grid */}
            {(specEntries.length > 0 || data.condition || data.min_rental_days) && (
              <>
                <div className="border-t border-border/20" />
                <div className="bg-foreground/5 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-foreground/80">Item Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {data.condition && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-foreground/40 uppercase tracking-wider">Condition</p>
                        <p className={cn('text-sm font-semibold', conditionColor[data.condition] || 'text-foreground')}>
                          {data.condition}
                        </p>
                      </div>
                    )}
                    {data.min_rental_days && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-foreground/40 uppercase tracking-wider">Min Rental</p>
                        <p className="text-sm font-semibold text-foreground">{data.min_rental_days} {data.min_rental_days === 1 ? 'day' : 'days'}</p>
                      </div>
                    )}
                    {data.max_rental_days && (
                      <div className="space-y-0.5">
                        <p className="text-xs text-foreground/40 uppercase tracking-wider">Max Rental</p>
                        <p className="text-sm font-semibold text-foreground">{data.max_rental_days} days</p>
                      </div>
                    )}
                    {specEntries.map(([k, v]) => (
                      <div key={k} className="space-y-0.5">
                        <p className="text-xs text-foreground/40 uppercase tracking-wider">{k}</p>
                        <p className="text-sm font-semibold text-foreground">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-6 space-y-4">

          {/* Pricing Card */}
          <div className="bg-surface border border-border/40 rounded-2xl p-5 shadow-lg space-y-4">

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-3xl text-accent">
                PKR {data.daily_rate ? data.daily_rate.toLocaleString() : '—'}
              </span>
              <span className="text-foreground/50 text-sm">/ day</span>
            </div>

            {/* Deposit */}
            {data.security_deposit ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/50">Security Deposit</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">PKR {data.security_deposit.toLocaleString()}</span>
                  <span className="text-[10px] bg-green-950 text-green-400 border border-green-800 px-2 py-0.5 rounded-full font-bold">Refundable</span>
                </div>
              </div>
            ) : null}

            <div className="border-t border-border/20" />

            {/* Duration info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/50">Minimum rental</span>
                <span className="font-semibold text-foreground">{data.min_rental_days || '—'} {(data.min_rental_days || 0) === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/50">Maximum rental</span>
                <span className="font-semibold text-foreground">{data.max_rental_days || '—'} days</span>
              </div>
              {data.delivery_available && (
                <div className="flex justify-between">
                  <span className="text-foreground/50">Delivery fee</span>
                  <span className="font-semibold text-foreground">PKR {(data.delivery_fee || 0).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border/20" />

            {/* Owner Card */}
            <div className="flex items-center gap-3 bg-foreground/5 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-black text-sm flex-shrink-0">
                {ownerInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">You</p>
                <p className="text-xs text-foreground/40">New owner · 0 listings</p>
              </div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-foreground/20 fill-foreground/20" />)}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-green-950/40 border border-green-800/40 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-300 font-medium">Live Photos</span>
              </div>
              <div className="flex items-center gap-2 bg-green-950/40 border border-green-800/40 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-300 font-medium">Verified Profile</span>
              </div>
            </div>

            <div className="border-t border-border/20" />

            <div className="flex items-start gap-2 text-xs text-foreground/40 italic">
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Message the owner to arrange pickup or delivery details.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/30 px-4 py-4 z-50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-sm border-2 border-foreground/20 text-foreground/70 hover:border-foreground/50 hover:text-foreground transition-all duration-200 order-2 sm:order-1"
          >
            ← Back to Photos
          </button>

          <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={() => onSubmit()}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full font-semibold text-sm border-2 border-foreground/20 text-foreground/70 hover:border-foreground/50 hover:text-foreground transition-all duration-200 disabled:opacity-50"
            >
              💾 Save as Draft
            </button>
            <button
              onClick={() => onSubmit()}
              disabled={isSubmitting}
              className={cn(
                'flex-1 sm:flex-none px-8 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2',
                isSubmitting ? 'opacity-50 cursor-not-allowed bg-foreground/10' : 'liquid-button text-black'
              )}
            >
              {isSubmitting ? <span className="animate-pulse">Publishing...</span> : <><UploadCloud className="w-4 h-4" /> Publish Listing</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
