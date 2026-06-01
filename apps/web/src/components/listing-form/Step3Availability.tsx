import { useRef, useState } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Camera, ImageIcon, UploadCloud, X } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step3Props = {
  data: Partial<ListingFormData>;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  hideFooter?: boolean;
};

export function Step3Availability({ data, updateData, onNext, onBack, hideFooter }: Step3Props) {
  const [photos, setPhotos] = useState<string[]>(data.photo_urls || []);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = photos.length > 0;

  const handleNext = () => {
    if (isValid) {
      updateData({ photo_urls: photos });
      onNext();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newUrls = files.slice(0, 5 - photos.length).map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newUrls]);
    e.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!event.dataTransfer.files.length) return;
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    const newUrls = files.slice(0, 5 - photos.length).map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newUrls]);
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          <Camera className="h-3.5 w-3.5 text-accent" />
          Step 3 of 4
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Add photos that sell the feeling</h2>
        <p className="max-w-2xl text-sm font-light text-white/45 sm:text-base">The upload area should feel like a showcase, not an attachment box. Drag files in or tap to add them.</p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        className={cn(
          'group rounded-[2rem] border-2 border-dashed p-5 sm:p-6 transition-all duration-300 transform-gpu cursor-pointer',
          isDragging
            ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(57,255,20,0.2),0_0_50px_-20px_rgba(57,255,20,0.7)] scale-[1.01]'
            : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-3">
            <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors', isDragging ? 'bg-accent text-black' : 'bg-white/5 text-white/50')}>
              <UploadCloud className="h-3.5 w-3.5" />
              {isDragging ? 'Drop to add' : 'Drag here or click'}
            </div>
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">Cover shot first. Details second. No clutter.</h3>
            <p className="text-sm font-light text-white/45">Add up to 5 photos. The first image becomes the cover in review and publish.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {photos.length < 5 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/65">
                <Camera className="h-4 w-4 text-accent" />
                {5 - photos.length} slots left
              </div>
            )}
            {photos.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/65">
                <ImageIcon className="h-4 w-4 text-accent" />
                {photos.length} selected
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="group/shot relative aspect-square overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_-24px_rgba(0,0,0,0.8)]">
              <img src={photo} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover/shot:scale-105" />
              {idx === 0 && <div className="absolute left-2 top-2 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white">Cover</div>}
              <button onClick={(event) => { event.stopPropagation(); removePhoto(idx); }} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition-all duration-200 hover:bg-red-500/90 group-hover/shot:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {photos.length < 5 && (
            <div className={cn('group/add flex aspect-square flex-col items-center justify-center rounded-[1.25rem] border border-dashed transition-all duration-300', isDragging ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-black/15 text-white/40 hover:border-accent/60 hover:bg-accent/5 hover:text-accent')}>
              <Camera className="mb-2 h-7 w-7" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em]">Add photo</span>
            </div>
          )}
        </div>

        {photos.length === 0 && (
          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/20 p-5 text-center">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm font-medium text-white/70">No photos added yet</p>
            <p className="mt-1 text-xs text-white/30">A strong first image matters more than a long description here.</p>
          </div>
        )}
      </div>

      <button id="step-next-trigger" onClick={handleNext} className="hidden" />

      {!hideFooter && (
        <div className="mt-4 flex justify-between">
          <button onClick={onBack} className="px-6 py-3 rounded-full font-bold transition-colors hover:text-accent hover:bg-foreground/5">
            ← Back
          </button>
          <button onClick={handleNext} disabled={!isValid} className={cn('px-8 py-3 rounded-full font-bold transition-all duration-300 active:scale-95 transform-gpu', isValid ? 'liquid-button' : 'glass-spotlight opacity-50 cursor-not-allowed')}>
            Next: Review
          </button>
        </div>
      )}
    </div>
  );
}
