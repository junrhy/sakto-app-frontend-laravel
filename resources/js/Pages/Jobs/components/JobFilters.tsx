import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';

interface JobFiltersProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    categories: string[];
    employmentTypeFilter: string;
    setEmploymentTypeFilter: (value: string) => void;
    employmentTypes: string[];
}

export default function JobFilters({
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    employmentTypeFilter,
    setEmploymentTypeFilter,
    employmentTypes,
}: JobFiltersProps) {
    const hasActiveFilters =
        statusFilter !== 'all' || categoryFilter !== 'all' || employmentTypeFilter !== 'all';

    const clearFilters = () => {
        setStatusFilter('all');
        setCategoryFilter('all');
        setEmploymentTypeFilter('all');
    };

    return (
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status:
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter" className="w-[140px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {categories.length > 0 && (
                <div className="flex items-center space-x-2">
                    <Label htmlFor="category-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category:
                    </Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger id="category-filter" className="w-[140px]">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {employmentTypes.length > 0 && (
                <div className="flex items-center space-x-2">
                    <Label htmlFor="type-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type:
                    </Label>
                    <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                        <SelectTrigger id="type-filter" className="w-[140px]">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {employmentTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}

