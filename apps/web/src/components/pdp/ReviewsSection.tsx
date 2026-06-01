import { Star } from 'lucide-react';

const mockReviews = [
  {
    id: 1,
    author: "Zainab R.",
    date: "March 2026",
    rating: 5,
    text: "Absolutely fantastic! The camera was in pristine condition, and Ali was super helpful in explaining how the autofocus works. Will definitely rent again.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: 2,
    author: "Omar S.",
    date: "February 2026",
    rating: 5,
    text: "Smooth transaction and great gear. Battery lasted the whole shoot.",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: 3,
    author: "Fatima K.",
    date: "January 2026",
    rating: 4,
    text: "Good experience overall. The lens was slightly dusty on the outside but glass was perfect. Very prompt communication.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80"
  }
];

export function ReviewsSection() {
  const averageRating = (mockReviews.reduce((acc, rev) => acc + rev.rating, 0) / mockReviews.length).toFixed(1);

  return (
    <div className="py-16 px-4 md:px-0 border-t border-border/10" id="reviews-section">
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <div className="flex items-center gap-3 mb-2">
          <Star className="w-8 h-8 text-accent fill-current" />
          <h2 className="text-3xl font-bold font-syne tracking-tight">
            {averageRating} <span className="text-foreground/50 text-xl font-normal">({mockReviews.length} Reviews)</span>
          </h2>
        </div>
        <p className="text-foreground/70 font-medium">What our community says about this item</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 max-w-5xl mx-auto w-full">
        {mockReviews.map((review) => (
          <div 
            key={review.id} 
            className="py-8 border-b border-border/10 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={review.avatar} 
                  alt={review.author} 
                  className="w-12 h-12 rounded-full object-cover border border-border/10"
                />
                <div>
                  <h4 className="font-bold font-syne text-[15px] leading-tight">{review.author}</h4>
                  <span className="text-sm text-foreground/50">{review.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'text-foreground fill-current' : 'text-foreground/20'}`} 
                  />
                ))}
              </div>
            </div>
            <p className="text-[15px] text-foreground/80 leading-relaxed font-medium">
              "{review.text}"
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-10 flex justify-center">
        <button className="px-8 py-3 rounded-full border border-border/20 hover:border-foreground/30 font-semibold text-sm transition-colors duration-300">
          Show all {mockReviews.length} reviews
        </button>
      </div>
    </div>
  );
}
