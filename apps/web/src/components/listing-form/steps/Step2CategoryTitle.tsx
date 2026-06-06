import { Camera, Wrench, PartyPopper, Dumbbell, Home, Music, Car, BookOpen, Shirt, Package } from 'lucide-react';
import { ListingFormData } from '../types';

type Step2CategoryTitleProps = {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const CATEGORIES = [
  { id: 1, name: 'Electronics', icon: Camera },
  { id: 2, name: 'Tools', icon: Wrench },
  { id: 3, name: 'Party', icon: PartyPopper },
  { id: 4, name: 'Sports', icon: Dumbbell },
  { id: 5, name: 'Home', icon: Home },
  { id: 6, name: 'Music', icon: Music },
  { id: 7, name: 'Vehicles', icon: Car },
  { id: 8, name: 'Books', icon: BookOpen },
  { id: 9, name: 'Fashion', icon: Shirt },
  { id: 10, name: 'Other', icon: Package },
];

export function Step2CategoryTitle({ data, updateData, onNext, onBack }: Step2CategoryTitleProps) {
  const isValid = data.category_id !== 0 && data.title.length >= 3;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">What are you listing?</h2>
        <p className="text-white/50 text-sm">
          Pick a category and give your item a clear, descriptive title.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {/* Categories Grid */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = data.category_id === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateData({ category_id: cat.id })}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                    ${isSelected 
                      ? 'bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(57,255,20,0.15)]' 
                      : 'bg-[#1A1A24] border-[#2A2A35] text-white/70 hover:bg-[#2A2A35] hover:text-white'}
                  `}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-accent' : 'text-white/50'}`} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
            Listing Title
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="e.g. Canon EOS R5 Camera Kit"
              className="w-full bg-[#1A1A24] border border-[#2A2A35] text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              maxLength={200}
            />
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium ${data.title.length < 3 ? 'text-red-400' : 'text-white/40'}`}>
              {data.title.length}/200
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[#2A2A35] flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 font-semibold text-sm text-white/50 hover:text-white transition-colors"
        >
          ← Back
        </button>
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
