import { useCallback, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { ListingFormData } from '../types';

type Step1PhotosProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
};

export function Step1Photos({ data, updateData, onNext }: Step1PhotosProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: File[]) => {
    setError('');
    const currentCount = data.photo_urls.length;
    if (currentCount + files.length > 5) {
      setError('You can only upload up to 5 photos.');
      return;
    }

    // MOCK UPLOAD: In V1, we simulate Cloudinary upload by creating object URLs
    const newUrls = files.map(file => URL.createObjectURL(file));
    updateData({ photo_urls: [...data.photo_urls, ...newUrls] });
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
    const updated = [...data.photo_urls];
    // revoke object URL to avoid memory leaks
    URL.revokeObjectURL(updated[index]);
    updated.splice(index, 1);
    updateData({ photo_urls: updated });
  };

  const isValid = data.photo_urls.length > 0;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-accent" /> Add Photos
        </h2>
        <p className="text-white/50 text-sm">
          Show off your item. Good lighting and multiple angles help build trust. Max 5 photos.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Dropzone */}
        {data.photo_urls.length < 5 && (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center w-full min-h-[200px]
              border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
              ${isDragging ? 'border-accent bg-accent/5' : 'border-[#2A2A35] bg-[#1A1A24]/50 hover:bg-[#1A1A24]'}
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-accent/20' : 'bg-[#2A2A35]'}`}>
                <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-accent' : 'text-white/50'}`} />
              </div>
              <p className="mb-2 text-sm text-white/80 font-medium">
                <span className="text-accent hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-white/40">PNG, JPG up to 5MB</p>
            </div>
            <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileInput} />
          </label>
        )}

        {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

        {/* Photo Grid */}
        {data.photo_urls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
            {data.photo_urls.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden group border border-[#2A2A35]">
                <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                {/* Remove button */}
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Cover badge */}
                {i === 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent text-black text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Cover Photo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-[#2A2A35] flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="liquid-button px-8 py-3 font-bold text-sm text-black disabled:opacity-50 disabled:pointer-events-none"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
