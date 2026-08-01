import { useCallback, useState, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, ZoomIn, Loader2 } from 'lucide-react';
import { useApiClient } from '@/lib/api-client';
import { ListingFormData, PhotoObject } from '../types';

type Step1PhotosProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onValidChange?: (valid: boolean) => void;
};

export function Step1Photos({ data, updateData, onValidChange }: Step1PhotosProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const api = useApiClient();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = async (files: File[]) => {
    setError('');
    const currentCount = data.photos.length;
    if (currentCount + files.length > 5) {
      setError('You can only upload up to 5 photos.');
      return;
    }

    const MAX_BYTES = 7 * 1024 * 1024; // 7MB
    for (const file of files) {
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" is too large. Max size is 7MB.`);
        return;
      }
    }

    setUploadingCount(prev => prev + files.length);

    try {
      const uploadPromises = files.map(async (file) => {
        // 1. Get a signed token from our API (user-scoped folder, no listing ID needed)
        const sigResponse = await api.post('uploads/signature').json<{
          upload: {
            timestamp: number;
            folder: string;
            signature: string;
            api_key: string;
            cloud_name: string;
          };
        }>();

        const { timestamp, folder, signature, api_key, cloud_name } = sigResponse.upload;

        // 2. Upload directly to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
        const res = await fetch(cloudinaryUrl, { method: 'POST', body: formData });

        if (!res.ok) {
          const errText = await res.text();
          console.error('Cloudinary error:', errText);
          throw new Error('Failed to upload image to Cloudinary.');
        }

        return res.json();
      });

      const uploadedAssets = await Promise.all(uploadPromises);

      // 3. Validate & sanitize on our backend — returns full photo objects
      const completeResponse = await api.post('uploads/complete', {
        json: { files: uploadedAssets },
      }).json<{ files: PhotoObject[] }>();

      updateData({ photos: [...data.photos, ...completeResponse.files] });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong during upload. Please try again.');
    } finally {
      setUploadingCount(prev => Math.max(0, prev - files.length));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      processFiles(files);
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...data.photos];
    updated.splice(index, 1);
    updateData({ photos: updated });
  };

  // Drag-and-drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOverItem = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropItem = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...data.photos];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    updateData({ photos: reordered });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const isValid = data.photos.length > 0 && uploadingCount === 0;

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-4xl font-display font-bold text-foreground mb-2 flex items-center justify-center lg:justify-start gap-2 text-center lg:text-left">
          <ImageIcon className="w-8 h-8 text-accent" /> Add Photos <span className="text-red-500">*</span>
        </h2>
        <p className="text-foreground/50 text-sm text-center lg:text-left">
          Show off your item. Good lighting and multiple angles help build trust. Up to 5 photos, 7MB each.
        </p>
      </div>

      <div className="flex-3 flex flex-col gap-4">
        {/* Dropzone */}
        {data.photos.length < 5 && (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center w-full min-h-[200px]
              border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
              ${isDragging ? 'border-accent bg-accent/5' : 'border-border/50 bg-surface/50 hover:bg-surface/50'}
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-accent/20' : 'bg-border/50'}`}>
                <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-accent' : 'text-foreground/50'}`} />
              </div>
              <p className="mb-2 text-sm text-foreground/80 font-medium">
                <span className="text-accent hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-foreground/40">PNG, JPG up to 7MB</p>
            </div>
            <input type="file" className="hidden" multiple accept="image/png,image/jpeg,image/webp" onChange={handleFileInput} />
          </label>
        )}

        {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

        {/* Photo Grid */}
        {(data.photos.length > 0 || uploadingCount > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 max-w-[580px]">
            {data.photos.map((photo, i) => (
              <div
                key={photo.url}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOverItem(e)}
                onDrop={(e) => handleDropItem(e, i)}
                onDragEnd={handleDragEnd}
                onClick={() => setPreviewUrl(photo.url)}
                className={`
                  relative aspect-square rounded-xl overflow-hidden group border border-border/50
                  cursor-pointer transition-all duration-200 select-none
                  ${draggedIndex === i ? 'opacity-40 scale-95 border-accent' : 'opacity-100'}
                `}
              >
                <img
                  src={photo.url}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                {/* Zoom icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(i);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-foreground backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Cover badge */}
                {i === 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent text-black text-[10px] font-bold uppercase tracking-wider rounded-md pointer-events-none">
                    Cover Photo
                  </div>
                )}
              </div>
            ))}

            {/* Upload placeholders */}
            {Array.from({ length: uploadingCount }).map((_, idx) => (
              <div
                key={`uploading-${idx}`}
                className="relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-surface/30 flex flex-col items-center justify-center gap-2 select-none"
              >
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="text-xs text-foreground/45">Uploading...</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors z-[110]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] w-full flex items-center justify-center p-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
