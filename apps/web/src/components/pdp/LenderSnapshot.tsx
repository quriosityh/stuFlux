import { CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LenderSnapshotProps {
  owner: {
    display_name: string;
    avatar_url: string | null;
    city: string;
    created_at?: string;
  };
}

export function LenderSnapshot({ owner }: LenderSnapshotProps) {
  return (
    <div className="flex items-center gap-4 py-6 border-y border-border/10 mb-6">
      <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-border/10">
        <img 
          src={owner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(owner?.display_name || 'User')}&background=random`} 
          alt={owner?.display_name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-accent fill-accent text-background" />
        </div>
      </div>
      <div>
        <h3 className="font-syne font-bold text-base md:text-lg text-foreground">Listed by {owner?.display_name}</h3>
        <p className="text-sm text-foreground/70 mt-1 font-medium">
          {owner?.city} 
          {owner?.created_at && (
             <span className="opacity-60"> • Joined {formatDistanceToNow(new Date(owner.created_at), { addSuffix: true })}</span>
          )}
        </p>
      </div>
    </div>
  );
}
