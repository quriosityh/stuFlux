import { Conversation } from './types';
import Link from 'next/link';

export function ContextListingCard({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex flex-col gap-2">
      <Link href={`/listings/${conversation.listingId}` as any} className="block aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border-color)] relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={conversation.listingImage} 
          alt={conversation.listingTitle} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
          <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md">
            Rs. {conversation.dailyRate.toLocaleString()} / day
          </span>
        </div>
      </Link>
      <div>
        <Link href={`/listings/${conversation.listingId}` as any} className="hover:underline">
          <h2 className="font-syne font-bold text-lg leading-tight">{conversation.listingTitle}</h2>
        </Link>
      </div>
    </div>
  );
}
