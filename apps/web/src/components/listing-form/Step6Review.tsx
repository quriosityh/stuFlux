'use client';

import { useState, useEffect } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapPin, CheckCircle2, MessageCircle, UploadCloud, FileText, Calendar, Landmark, Truck, Sparkles, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step6Props = {
  data: Partial<ListingFormData>;
  onSubmit: (finalData: Partial<ListingFormData>) => void;
  onBack: () => void;
  isSubmitting: boolean;
  published?: boolean;
  publishedId?: string;
  onPublishComplete?: (id?: string) => void;
};

const CATEGORY_MAP: Record<number, string> = {
  1: 'Electronics',
  2: 'Furniture',
  3: 'Gaming',
  4: 'Fashion & Accessories',
  5: 'Events & Party',
  6: 'Others',
};

export function Step6Review({ data, onSubmit, onBack, isSubmitting, published = false, publishedId, onPublishComplete }: Step6Props) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photos = data.photo_urls || [];
  const categoryName = data.category_id ? CATEGORY_MAP[data.category_id] : 'Uncategorized';

  const handleSaveDraft = () => onSubmit({ status: 'draft' });
  const handlePublishNow = () => onSubmit({ status: 'active' });

  useEffect(() => {
    if (published) {
      const t = setTimeout(() => {
        onPublishComplete && onPublishComplete(publishedId);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [published, publishedId, onPublishComplete]);

  const conditionColor: Record<string, string> = {
    'New': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Like new': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    'Used': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Damaged': 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const specEntries = data.specs ? Object.entries(data.specs) : [];

  if (published) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 px-4 backdrop-blur-2xl">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0B0B13]/90 p-8 shadow-[0_0_80px_-10px_rgba(57,255,20,0.3)] text-center space-y-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.15),transparent_50%)] pointer-events-none" />
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 border border-accent/40 shadow-[0_0_20px_rgba(57,255,20,0.3)] animate-bounce">
            <CheckCircle2 className="h-8 w-8 text-accent" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white">Listing is Live!</h2>
            <p className="max-w-md mx-auto text-sm font-light text-white/50">Your item has been uploaded successfully and is now active on the marketplace.</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/5 bg-[#14141E]/80 p-4 flex gap-4 text-left items-center">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
              {photos[0] ? (
                <img src={photos[0]} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-white/20">No cover</div>
              )}
            </div>
            <div>
              <h4 className="font-display text-lg font-bold text-white leading-tight">{data.title}</h4>
              <p className="text-xs text-white/40 mt-1">{categoryName} · Lahore</p>
              <p className="text-sm font-bold text-accent mt-1">PKR {data.daily_rate?.toLocaleString()} / day</p>
            </div>
          </div>

          <div className="text-xs text-white/30 animate-pulse">Redirecting to your new listing page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      {/* Step Header */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          Step 6 of 6 · Review &amp; Launch
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
          Verify Listing
        </h2>
        <p className="max-w-2xl text-sm font-light text-white/45">
          Your listing layout is complete. Review details as seen by prospective renters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start mt-2">
        
        {/* Left Column: Media Gallery & Core Details */}
        <div className="space-y-6">
          {/* Futuristic Image Gallery */}
          <div className="relative group/gallery rounded-3xl overflow-hidden border border-white/10 bg-[#0E0E18]/80 p-3 shadow-xl">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
              {photos.length > 0 ? (
                <img 
                  src={photos[activePhotoIdx]} 
                  alt="Listing preview" 
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105" 
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/20">
                  <FileText className="w-12 h-12" />
                  <span className="text-sm">No photos uploaded</span>
                </div>
              )}

              {/* Cover Badge */}
              {activePhotoIdx === 0 && photos.length > 0 && (
                <div className="absolute top-4 left-4 bg-accent text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                  Primary Cover
                </div>
              )}

              {/* Category Indicator */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/10">
                {categoryName}
              </div>

              {/* Gallery Controllers */}
              {photos.length > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={() => setActivePhotoIdx(p => Math.max(0, p - 1))}
                    disabled={activePhotoIdx === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-accent hover:text-black border border-white/10 text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActivePhotoIdx(p => Math.min(photos.length - 1, p + 1))}
                    disabled={activePhotoIdx === photos.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-accent hover:text-black border border-white/10 text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Track */}
            {photos.length > 1 && (
              <div className="flex gap-2.5 mt-3 px-1 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhotoIdx(i)}
                    className={cn(
                      'relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 scale-95 hover:scale-100',
                      i === activePhotoIdx 
                        ? 'border-accent shadow-[0_0_12px_rgba(57,255,20,0.4)] opacity-100 scale-100' 
                        : 'border-white/10 opacity-50 hover:opacity-100'
                    )}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0D0D16]/90 p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="font-display font-black text-2xl text-white tracking-tight leading-tight">
                  {data.title || <span className="italic text-white/30">Untitled Listing</span>}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-white/50 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>{data.address ? `${data.address}, ` : ''}{data.city || 'Lahore'}</span>
                </div>
              </div>
              
              <div className={cn(
                'px-3.5 py-1 rounded-full text-xs font-bold border shrink-0 uppercase tracking-wider',
                conditionColor[data.condition || 'New']
              )}>
                {data.condition || 'New'}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent/70">Overview &amp; Details</h3>
              <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-line">
                {data.description || <span className="italic text-white/20">No description provided.</span>}
              </p>
            </div>

            {/* Spec grid */}
            {specEntries.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-accent/70">Technical Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {specEntries.map(([k, v]) => (
                    <div key={k} className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 flex flex-col justify-center">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{k}</span>
                      <span className="text-sm font-bold text-white mt-0.5">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Security Deposit, Delivery Dashboard */}
        <div className="space-y-6">
          {/* Financial & Logistics Dashboard */}
          <div className="rounded-3xl border border-white/10 bg-[#0E0E18] p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

            {/* Price Ring/Bar */}
            <div className="relative group flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] shadow-inner text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Daily Rental Cost</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-accent/70 uppercase">PKR</span>
                <span className="font-display text-4xl font-black text-accent tracking-tighter shadow-accent">
                  {data.daily_rate ? data.daily_rate.toLocaleString() : '0'}
                </span>
                <span className="text-white/45 text-sm font-light">/ day</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="space-y-3.5 text-xs">
              {/* Deposit Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/60">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="text-white/60 font-medium">Security Deposit</span>
                </div>
                {data.security_deposit ? (
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-white text-sm">PKR {data.security_deposit.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">100% Refundable</span>
                  </div>
                ) : (
                  <span className="text-white/30 italic">No Deposit Required</span>
                )}
              </div>

              {/* Duration Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/60">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-white/60 font-medium">Rental Duration</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-white text-sm">
                    {data.min_rental_days || 1} - {data.max_rental_days || 30} Days
                  </span>
                  <span className="text-[9px] text-white/30 tracking-wider mt-0.5 font-light">Min-Max Allowable</span>
                </div>
              </div>

              {/* Delivery Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/60">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-white/60 font-medium">Logistics &amp; Handover</span>
                </div>
                {data.delivery_available ? (
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-accent text-sm">PKR {(data.delivery_fee || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-accent font-bold uppercase tracking-wider mt-0.5">Delivery Available</span>
                  </div>
                ) : (
                  <span className="text-white/30 italic">Self Pickup Only</span>
                )}
              </div>
            </div>

            {/* Rules Dashboard Widget */}
            {data.rules && (
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-2 relative overflow-hidden">
                <div className="flex items-center gap-2 text-orange-400">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Rental Rules &amp; Policies</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed italic font-light">
                  "{data.rules}"
                </p>
              </div>
            )}

            {/* Security Badges */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="flex items-center justify-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-2.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Owner</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-2.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected Deposit</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <button id="step-next-trigger" onClick={handlePublishNow} className="hidden" />

      {/* Footer Navigation */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 border-t border-white/10 pt-6 justify-between">
        <button 
          onClick={onBack} 
          type="button" 
          className="w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all text-white/50 hover:text-white order-3 sm:order-1 text-center"
        >
          ← Adjust Details
        </button>

        <div className="flex w-full sm:w-auto gap-3 order-1 sm:order-2">
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            type="button"
            className="flex-1 sm:flex-none px-6 py-3 rounded-full font-semibold text-sm border border-white/15 text-white/70 hover:text-white hover:border-white/45 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-center"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublishNow}
            disabled={isSubmitting}
            type="button"
            className={cn(
              'flex-1 sm:flex-none px-8 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-transform duration-150 transform-gpu active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.15)]',
              isSubmitting ? 'opacity-40 cursor-not-allowed bg-white/10 text-white/50' : 'liquid-button text-black'
            )}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Launching...</span>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Publish Listing
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
