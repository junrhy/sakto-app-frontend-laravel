import { CommunityFilter } from '../types';

interface CommunityEmptyStateProps {
    filter: CommunityFilter;
    searchQuery: string;
    onBrowseAll: () => void;
}

export function CommunityEmptyState({
    filter,
    searchQuery,
    onBrowseAll,
}: CommunityEmptyStateProps) {
    const title = searchQuery
        ? 'No communities found'
        : filter === 'my'
          ? 'No joined communities yet'
          : 'No communities available';

    const description = searchQuery
        ? 'Try adjusting your search terms.'
        : filter === 'my'
          ? 'Join communities from the "All Communities" tab to see them here.'
          : 'No community members have been added yet.';

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
            <svg
                className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>

            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base">
                {title}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                {description}
            </p>

            {filter === 'my' && !searchQuery && (
                <button
                    onClick={onBrowseAll}
                    className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                    Browse All Communities
                </button>
            )}
        </div>
    );
}
