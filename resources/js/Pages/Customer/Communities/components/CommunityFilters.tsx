import TextInput from '@/Components/TextInput';
import { CommunityFilter } from '../types';

interface CommunityFiltersProps {
    filter: CommunityFilter;
    searchQuery: string;
    joinedCount: number;
    totalCount: number;
    onFilterChange: (filter: CommunityFilter) => void;
    onSearchChange: (value: string) => void;
}

export function CommunityFilters({
    filter,
    searchQuery,
    joinedCount,
    totalCount,
    onFilterChange,
    onSearchChange,
}: CommunityFiltersProps) {
    return (
        <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-shrink-0">
                    <h3 className="text-lg font-medium">Communities</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Total: {filter === 'my' ? joinedCount : totalCount}{' '}
                        {(filter === 'my' ? joinedCount : totalCount) === 1
                            ? 'community'
                            : 'communities'}
                    </p>
                </div>
                <div className="w-full sm:w-auto sm:max-w-sm">
                    <TextInput
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => onFilterChange('my')}
                        className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                            filter === 'my'
                                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        My Communities
                        {joinedCount > 0 && (
                            <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                    filter === 'my'
                                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}
                            >
                                {joinedCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => onFilterChange('all')}
                        className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        All Communities
                        <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                filter === 'all'
                                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {totalCount}
                        </span>
                    </button>
                </nav>
            </div>
        </div>
    );
}

