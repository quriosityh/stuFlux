import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  categoryName: string;
  categorySlug: string;
  listingTitle: string;
}

export function Breadcrumb({ categoryName, categorySlug, listingTitle }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-xs text-foreground/60 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
      <Link href="/" className="hover:text-foreground transition-colors">
        Explore
      </Link>
      <ChevronRight className="w-3 h-3 mx-2 shrink-0 opacity-50" />
      <Link href={`/?category=${categorySlug}`} className="hover:text-foreground transition-colors">
        {categoryName}
      </Link>
      <ChevronRight className="w-3 h-3 mx-2 shrink-0 opacity-50" />
      <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-[400px]">
        {listingTitle}
      </span>
    </nav>
  );
}
