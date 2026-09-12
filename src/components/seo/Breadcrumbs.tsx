import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ol className="mb-5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-brown-deep/60">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={item.url} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3 w-3 text-brown-deep/30" />}
            {isLast ? (
              <span aria-current="page" className="truncate font-semibold text-brown-deep/80 max-w-[220px]">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="truncate transition-colors hover:text-brown max-w-[200px]"
              >
                {item.name}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}