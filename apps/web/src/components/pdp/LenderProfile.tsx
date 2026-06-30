import { CheckCircle2, MessageCircle, MapPin, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LenderProfileProps {
  owner: {
    display_name: string;
    avatar_url: string | null;
    city: string;
    created_at?: string;
  };
}

export function LenderProfile({ owner }: LenderProfileProps) {
  const mockListings = 12;
  const mockBookings = 45;
  const mockRating = 4.9;
  const mockReviewsCount = 18;

  return (
    <div className="py-16 px-4 md:px-0 border-t border-border/10" id="lender-section">
      <h2 className="text-3xl font-bold font-syne mb-10 tracking-tight">Meet your lender</h2>
      
      {/* OUTER layout – stacks on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* ===== LEFT COLUMN: Lender Card ===== */}
        <div className="w-full lg:w-auto shrink-0">
          {/* 
            INNER CARD – ALWAYS flex-row + flex-nowrap.
            This is the key fix: no responsive direction change here.
            Padding scales down on mobile, gap tightens.
          */}
          <div className="chrome-card rounded-3xl p-5 sm:p-8 flex flex-row flex-nowrap items-center gap-5 sm:gap-8 relative overflow-hidden group">
            {/* Subtle glow effect */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Left side of card: Avatar & Name – fixed width, never w-full */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 shrink-0 w-[160px] sm:w-48">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-surface shadow-lg">
                <img 
                  src={owner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(owner?.display_name || 'User')}&background=random`} 
                  alt={owner?.display_name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold font-syne flex items-center justify-center gap-2">
                  {owner?.display_name}
                </h3>
                <p className="text-[10px] sm:text-xs text-foreground/60 font-semibold uppercase tracking-widest mt-1 sm:mt-1.5 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" /> Verified Student
                </p>
              </div>
            </div>

            {/* Right side of card: Stats – flex-1 so it takes remaining space, always has border-l */}
            <div className="flex flex-col justify-center flex-1 min-w-0 max-w-[140px] sm:max-w-none border-l border-border/10 pl-5 sm:pl-8 gap-4 sm:gap-5 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-syne leading-none">{mockListings}</div>
                <div className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-wider font-semibold mt-1">Listings</div>
              </div>
              <div className="w-full h-px bg-border/10" />
              <div>
                <div className="text-xl sm:text-2xl font-bold font-syne leading-none flex items-center gap-1">
                  {mockRating} <span className="text-accent text-base sm:text-lg">★</span>
                </div>
                <div className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-wider font-semibold mt-1">Rating</div>
              </div>
              <div className="w-full h-px bg-border/10" />
              <div>
                <div className="text-xl sm:text-2xl font-bold font-syne leading-none">{mockBookings}</div>
                <div className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-wider font-semibold mt-1">Rentals Completed</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ===== RIGHT COLUMN: Name, Bio, Reviews, and Actions ===== */}
        <div className="w-full lg:flex-1 space-y-8">
          
          <div>
            <h3 className="text-4xl font-bold font-syne mb-2">
              {owner?.display_name}
            </h3>
            <p className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <span className="font-bold text-foreground">{mockReviewsCount} Reviews</span>
            </p>
          </div>

          <div className="text-foreground/80 leading-relaxed font-medium space-y-6 max-w-2xl">
            <p>
              Hi, I'm {owner?.display_name?.split(' ')[0]}! I'm a student based in {owner?.city} and I love sharing my gear with other students. 
              Always happy to help out and make your rental experience as smooth as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-foreground/50" />
                <span>Lives in {owner?.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-foreground/50" />
                <span>Joined {owner?.created_at ? formatDistanceToNow(new Date(owner.created_at), { addSuffix: true }) : '6 months ago'}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button className="w-full sm:w-auto hyper-liquid px-8 py-3.5 text-sm font-bold flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>Message {owner?.display_name?.split(' ')[0]}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
