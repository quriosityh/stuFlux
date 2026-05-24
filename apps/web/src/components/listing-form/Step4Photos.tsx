import { useState, useRef } from 'react';
import { ListingFormData } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Camera, X, ImageIcon, UploadCloud } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Step4Props = {
  data: Partial<ListingFormData>;
  onSubmit: (finalData: Partial<ListingFormData>) => void;
  onBack: () => void;
  isSubmitting: boolean;
};

export function Step4Photos({ data, onSubmit, onBack, isSubmitting }: Step4Props) {
  const [photos, setPhotos] = useState<string[]>(data.photo_urls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real implementation, we would upload to Cloudinary here.
      // For UI mock, we will create a local object URL to display the preview.
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      if (photos.length < 5) {
        setPhotos(prev => [...prev, objectUrl]);
      }
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = () => {
    onSubmit({ photo_urls: photos });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-2">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Showcase Your Item</h2>
        <p className="text-foreground/70">Take clear, well-lit photos. You can add up to 5 pictures.</p>
      </div>

      {/* Photo Capture Section */}
      <div className="chrome-card rounded-2xl p-6 space-y-6">
        
        {/* Hidden Camera Input */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" // Mobile: opens back camera directly
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Photos Grid */}
          {photos.map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group bg-surface border border-border/50">
              <img src={photo} alt={`Item ${idx + 1}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removePhoto(idx)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-4 h-4" />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-2 left-2 bg-accent text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-lg">
                  Cover
                </div>
              )}
            </div>
          ))}

          {/* Add Photo Button Placeholder */}
          {photos.length < 5 && (
            <button 
              onClick={handleCaptureClick}
              className="aspect-square rounded-xl border-2 border-dashed border-border/60 hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-3 text-foreground/50 hover:text-accent transition-all duration-300"
            >
              <Camera className="w-8 h-8" />
              <div className="text-sm font-semibold">
                {photos.length === 0 ? "Take Cover Photo" : "Add Another"}
              </div>
              <div className="text-xs opacity-70">
                {5 - photos.length} remaining
              </div>
            </button>
          )}

        </div>
      </div>

      {/* Final Preview Section */}
      <div className="mt-8 space-y-4">
        <h3 className="font-display font-bold text-xl px-2">Listing Preview</h3>
        <div className="chrome-card rounded-2xl p-1 md:p-6 overflow-hidden">
          
          {/* Card Mockup */}
          <div className="max-w-sm mx-auto bg-background/40 rounded-xl overflow-hidden border border-border/20 shadow-xl">
            {/* Image area */}
            <div className="aspect-[4/3] bg-surface relative flex items-center justify-center border-b border-border/20 overflow-hidden">
               {photos.length > 0 ? (
                 <img src={photos[0]} className="w-full h-full object-cover" />
               ) : (
                 <ImageIcon className="w-12 h-12 text-foreground/20" />
               )}
               {/* Badges */}
               <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                 {data.category_id ? "Category Selected" : "No Category"}
               </div>
               <div className="absolute top-3 right-3 liquid-button !py-1 !px-3 shadow-lg">
                 PKR {data.daily_rate || 0} <span className="text-[10px] ml-1 opacity-80">/day</span>
               </div>
            </div>
            
            {/* Details area */}
            <div className="p-4 space-y-2">
              <h4 className="font-display font-bold text-lg line-clamp-2 leading-tight">
                {data.title || "Your Listing Title"}
              </h4>
              <p className="text-sm text-foreground/60 line-clamp-2">
                {data.description || "Description will appear here..."}
              </p>
              
              <div className="pt-3 flex items-center justify-between text-xs font-semibold text-foreground/50">
                <span className="flex items-center gap-1">📍 {data.city || "City"}</span>
                <span>{data.status === 'active' ? "🟢 Active" : "🟠 Draft"}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 flex justify-between items-center z-50">
        <div className="w-full max-w-2xl mx-auto flex justify-between items-center px-4 md:px-0">
          <button 
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full font-bold transition-colors hover:text-accent hover:bg-foreground/5 disabled:opacity-50"
          >
            ← Back
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || photos.length === 0}
            className={cn(
              "px-8 py-3 rounded-full font-bold flex items-center gap-2",
              isSubmitting || photos.length === 0 ? "glass-spotlight opacity-50 cursor-not-allowed" : "hyper-liquid text-black"
            )}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                {data.status === 'active' ? 'Publish Listing' : 'Save as Draft'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
