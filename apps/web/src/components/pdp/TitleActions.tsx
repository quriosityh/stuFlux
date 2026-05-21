import { Share, Heart } from 'lucide-react';

interface TitleActionsProps {
  title: string;
}

export function TitleActions({ title }: TitleActionsProps) {
  return (
    <div className="hidden md:flex flex-col md:flex-row md:items-start justify-between gap-2 mb-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-4xl font-bold font-syne leading-tight text-foreground">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-border/5 transition-colors text-sm font-semibold">
          <Share className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-border/5 transition-colors text-sm font-semibold">
          <Heart className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}
