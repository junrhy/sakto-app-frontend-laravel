import React from 'react';
import { Link } from '@inertiajs/react';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
  // Don't render pagination if there's only 1 page
  if (links.length <= 3) {
    return null;
  }

  return (
    <div className="flex items-center justify-center mt-6">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {links.map((link, index) => {
          // Skip the "..." links that Laravel generates
          if (link.label.includes('...')) {
            return (
              <span
                key={index}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            );
          }

          // For active, previous, and next links
          return link.url === null ? (
            <span
              key={index}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                link.active
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 cursor-not-allowed'
              }`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ) : (
            <Link
              key={index}
              href={link.url}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                link.active
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          );
        })}
      </nav>
    </div>
  );
} 