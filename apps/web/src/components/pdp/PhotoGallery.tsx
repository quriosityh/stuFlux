'use client';

import { useState, useRef, useEffect } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PhotoGalleryProps {
  photos: any[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [open, setOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const zoomRef = useRef<any>(null);
  const pointerPos = useRef({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(1);
  const router = useRouter();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newSlide = Math.round(scrollLeft / width) + 1;
    setCurrentSlide(newSlide);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);
  
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-[2/1] md:aspect-[3/1] rounded-3xl bg-gradient-to-br from-accent/20 to-accent-hover/20 mb-8 border border-border/10 flex items-center justify-center" id="photos-section">
        <span className="font-syne font-semibold opacity-50">No photos available</span>
      </div>
    );
  }

  const slides = photos.map(p => ({ src: p.url, alt: title }));
  
  // Mobile: Horizontal Scroll
  // Desktop: Hero + 4 grid

  return (
    <>
      <div className="md:mb-8" id="photos-section">
        {/* Mobile View */}
        <div className="md:hidden relative h-[60vh] max-h-[450px] w-full">

          {/* Image Counter */}
          <div className="absolute bottom-12 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold z-10 tracking-widest text-foreground">
            {currentSlide} / {photos.length}
          </div>

          <div 
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full"
            onScroll={handleScroll}
          >
            {photos.map((photo, i) => (
              <div 
                key={photo.id || i} 
                className="relative w-full h-full shrink-0 snap-center snap-always"
                onClick={() => setOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-2 gap-2 h-[300px] lg:h-[380px] rounded-3xl overflow-hidden relative border border-border/10">
          <div 
            className="relative h-full cursor-pointer group"
            onClick={() => setOpen(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={photos[0].url} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
          
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            {[1, 2, 3, 4].map((i) => {
              const photo = photos[i];
              if (!photo) return <div key={i} className="bg-surface/50 h-full" />;
              return (
                <div 
                  key={photo.id || i} 
                  className="relative h-full cursor-pointer group overflow-hidden"
                  onClick={() => setOpen(true)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={photo.url} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              );
            })}
          </div>

          {photos.length > 5 && (
            <button 
              onClick={() => setOpen(true)}
              className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border/10 font-semibold text-sm flex items-center gap-2 hover:bg-background transition-colors shadow-lg"
            >
              <Grid3X3 className="w-4 h-4" />
              Show all photos
            </button>
          )}
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
        plugins={[Zoom]}
        on={{
          click: () => {
            if (zoomRef.current) {
              if (isZoomed) {
                zoomRef.current.changeZoom(1);
              } else {
                // Find current slide to compute coordinates relative to its center
                const slideEl = document.querySelector('.yarl__slide_current');
                if (slideEl) {
                  const rect = slideEl.getBoundingClientRect();
                  const dx = pointerPos.current.x - rect.x - rect.width / 2;
                  const dy = pointerPos.current.y - rect.y - rect.height / 2;
                  zoomRef.current.changeZoom(2, false, dx, dy);
                } else {
                  zoomRef.current.changeZoom(2);
                }
              }
            }
          },
          zoom: ({ zoom }) => setIsZoomed(zoom > 1)
        }}
        zoom={{
          ref: zoomRef,
          maxZoomPixelRatio: 2,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        styles={{
          slide: { cursor: isZoomed ? 'zoom-out' : 'zoom-in' }
        }}
      />
    </>
  );
}
