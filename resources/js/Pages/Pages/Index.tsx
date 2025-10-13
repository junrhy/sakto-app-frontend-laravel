import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Page } from '@/types/pages';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Edit,
    Eye,
    FileDown,
    Filter,
    Grid3X3,
    List,
    Plus,
    SearchIcon,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface PaginatedResponse {
    current_page: number;
    data: Page[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface Props {
    auth: {
        user: any;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    pages: PaginatedResponse;
}

interface FilterState {
    status: string;
    dateFrom: string;
    dateTo: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export default function Index({ auth, pages }: Props) {
    const [search, setSearch] = useState('');
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        dateFrom: '',
        dateTo: '',
        sortBy: 'updated_at',
        sortOrder: 'desc',
    });

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const filteredAndSortedPages = useMemo(() => {
        let result = pages.data;

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (page) =>
                    page.title.toLowerCase().includes(searchLower) ||
                    page.slug.toLowerCase().includes(searchLower) ||
                    page.content.toLowerCase().includes(searchLower),
            );
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
            result = result.filter((page) => {
                if (filters.status === 'published') return page.is_published;
                if (filters.status === 'draft') return !page.is_published;
                return true;
            });
        }

        // Date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            result = result.filter(
                (page) => new Date(page.updated_at) >= fromDate,
            );
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            result = result.filter(
                (page) => new Date(page.updated_at) <= toDate,
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (filters.sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'slug':
                    aValue = a.slug.toLowerCase();
                    bValue = b.slug.toLowerCase();
                    break;
                case 'status':
                    aValue = a.is_published ? 1 : 0;
                    bValue = b.is_published ? 1 : 0;
                    break;
                case 'updated_at':
                default:
                    aValue = new Date(a.updated_at);
                    bValue = new Date(b.updated_at);
                    break;
            }

            if (filters.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return result;
    }, [pages.data, search, filters]);

    const toggleSelectAll = () => {
        if (selectedPages.length === filteredAndSortedPages.length) {
            setSelectedPages([]);
        } else {
            setSelectedPages(filteredAndSortedPages.map((page) => page.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedPages.includes(id)) {
            setSelectedPages(selectedPages.filter((pageId) => pageId !== id));
        } else {
            setSelectedPages([...selectedPages, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = pages.data.filter((page) =>
            selectedPages.includes(page.id),
        );
        const headers = ['Title', 'Slug', 'Status', 'Last Updated'];
        const csvData = selectedData.map((page) => [
            page.title,
            page.slug,
            page.is_published ? 'Published' : 'Draft',
            format(new Date(page.updated_at), 'PPP'),
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pages.csv';
        link.click();
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this page?')) {
            router.delete(route('pages.destroy', id));
        }
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            dateFrom: '',
            dateTo: '',
            sortBy: 'updated_at',
            sortOrder: 'desc',
        });
        setSearch('');
    };

    const hasActiveFilters =
        search ||
        filters.status !== 'all' ||
        filters.dateFrom ||
        filters.dateTo ||
        filters.sortBy !== 'updated_at' ||
        filters.sortOrder !== 'desc';

    const stats = useMemo(() => {
        const total = pages.data.length;
        const published = pages.data.filter((page) => page.is_published).length;
        const drafts = total - published;
        const filtered = filteredAndSortedPages.length;
        return { total, published, drafts, filtered };
    }, [pages.data, filteredAndSortedPages]);

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Pages
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Manage your website pages and content
                            </p>
                        </div>
                        {canEdit && (
                            <Link href={route('pages.create')}>
                                <Button size="lg" className="shadow-lg">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Page
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Total Pages
                                        </p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                                        <svg
                                            className="h-4 w-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Published
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {stats.published}
                                        </p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                                        <svg
                                            className="h-4 w-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                            Drafts
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                                            {stats.drafts}
                                        </p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500">
                                        <svg
                                            className="h-4 w-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                            Filtered
                                        </p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {stats.filtered}
                                        </p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
                                        <Filter className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <Head title="Pages" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Search and Actions Bar */}
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                                    <div className="relative max-w-md flex-1">
                                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                                        <Input
                                            type="search"
                                            placeholder="Search pages by title, slug, or content..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="border-gray-300 bg-white pl-9 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant={
                                                showFilters
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setShowFilters(!showFilters)
                                            }
                                        >
                                            <Filter className="mr-2 h-4 w-4" />
                                            Filters
                                            {hasActiveFilters && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2 text-xs"
                                                >
                                                    Active
                                                </Badge>
                                            )}
                                            {showFilters ? (
                                                <ChevronUp className="ml-2 h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            )}
                                        </Button>

                                        <div className="flex items-center rounded-md border">
                                            <Button
                                                variant={
                                                    viewMode === 'grid'
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setViewMode('grid')
                                                }
                                                className="rounded-r-none"
                                            >
                                                <Grid3X3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant={
                                                    viewMode === 'list'
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setViewMode('list')
                                                }
                                                className="rounded-l-none"
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {hasActiveFilters && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="flex items-center"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Filters
                                        </Button>
                                    )}
                                    {selectedPages.length > 0 && (
                                        <>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedPages.length} selected
                                            </span>
                                            <Button
                                                variant="outline"
                                                onClick={exportToCSV}
                                                className="flex items-center"
                                            >
                                                <FileDown className="mr-2 h-4 w-4" />
                                                Export Selected
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Filter Panel */}
                            {showFilters && (
                                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status-filter">
                                                Status
                                            </Label>
                                            <Select
                                                value={filters.status}
                                                onValueChange={(value) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        status: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All statuses
                                                    </SelectItem>
                                                    <SelectItem value="published">
                                                        Published
                                                    </SelectItem>
                                                    <SelectItem value="draft">
                                                        Draft
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date-from">
                                                Date From
                                            </Label>
                                            <Input
                                                id="date-from"
                                                type="date"
                                                value={filters.dateFrom}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        dateFrom:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date-to">
                                                Date To
                                            </Label>
                                            <Input
                                                id="date-to"
                                                type="date"
                                                value={filters.dateTo}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        dateTo: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sort-by">
                                                Sort By
                                            </Label>
                                            <Select
                                                value={filters.sortBy}
                                                onValueChange={(value) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        sortBy: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="updated_at">
                                                        Last Updated
                                                    </SelectItem>
                                                    <SelectItem value="title">
                                                        Title
                                                    </SelectItem>
                                                    <SelectItem value="slug">
                                                        Slug
                                                    </SelectItem>
                                                    <SelectItem value="status">
                                                        Status
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="sort-order">
                                                Sort Order
                                            </Label>
                                            <Select
                                                value={filters.sortOrder}
                                                onValueChange={(
                                                    value: 'asc' | 'desc',
                                                ) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        sortOrder: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="desc">
                                                        Descending
                                                    </SelectItem>
                                                    <SelectItem value="asc">
                                                        Ascending
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {hasActiveFilters && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span>
                                                    Showing{' '}
                                                    {
                                                        filteredAndSortedPages.length
                                                    }{' '}
                                                    of {pages.data.length} pages
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Content */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAndSortedPages.length === 0 ? (
                                <div className="col-span-full">
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                                <svg
                                                    className="h-8 w-8 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                                No pages found
                                            </h3>
                                            <p className="mb-4 text-gray-600 dark:text-gray-400">
                                                {search || hasActiveFilters
                                                    ? 'Try adjusting your search terms or filters'
                                                    : 'Get started by creating your first page'}
                                            </p>
                                            {!search &&
                                                !hasActiveFilters &&
                                                canEdit && (
                                                    <Link
                                                        href={route(
                                                            'pages.create',
                                                        )}
                                                    >
                                                        <Button>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Create Page
                                                        </Button>
                                                    </Link>
                                                )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                filteredAndSortedPages.map((page) => (
                                    <Card
                                        key={page.id}
                                        className="group border-gray-200 transition-all duration-200 hover:shadow-lg dark:border-gray-700"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={selectedPages.includes(
                                                            page.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleSelect(
                                                                page.id,
                                                            )
                                                        }
                                                    />
                                                    <Badge
                                                        variant={
                                                            page.is_published
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {page.is_published
                                                            ? 'Published'
                                                            : 'Draft'}
                                                    </Badge>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                                />
                                                            </svg>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'pages.show',
                                                                    page.id,
                                                                )}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {canEdit && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'pages.edit',
                                                                        page.id,
                                                                    )}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canEdit && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'pages.duplicate',
                                                                        page.id,
                                                                    )}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Duplicate
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDelete && (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        page.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                                                {page.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                                                        Slug
                                                    </p>
                                                    {page.is_published ? (
                                                        <a
                                                            href={route(
                                                                'pages.public',
                                                                page.slug,
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded bg-blue-50 px-2 py-1 font-mono text-sm text-blue-600 hover:text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            /{page.slug}
                                                        </a>
                                                    ) : (
                                                        <span className="rounded bg-gray-50 px-2 py-1 font-mono text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                                                            /{page.slug}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                                                        Last Updated
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {format(
                                                            new Date(
                                                                page.updated_at,
                                                            ),
                                                            'MMM dd, yyyy',
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Link
                                                        href={route(
                                                            'pages.show',
                                                            page.id,
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    {canEdit && (
                                                        <Link
                                                            href={route(
                                                                'pages.edit',
                                                                page.id,
                                                            )}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    ) : (
                        <Card className="shadow-sm">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={
                                                        selectedPages.length ===
                                                            filteredAndSortedPages.length &&
                                                        filteredAndSortedPages.length >
                                                            0
                                                    }
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                />
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Title
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Slug
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Status
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Last Updated
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAndSortedPages.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="py-12 text-center"
                                                >
                                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                                        <svg
                                                            className="h-8 w-8 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                                        No pages found
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {search ||
                                                        hasActiveFilters
                                                            ? 'Try adjusting your search terms or filters'
                                                            : 'Get started by creating your first page'}
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAndSortedPages.map(
                                                (page) => (
                                                    <TableRow
                                                        key={page.id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                    >
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedPages.includes(
                                                                    page.id,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggleSelect(
                                                                        page.id,
                                                                    )
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {page.title}
                                                        </TableCell>
                                                        <TableCell>
                                                            {page.is_published ? (
                                                                <a
                                                                    href={route(
                                                                        'pages.public',
                                                                        page.slug,
                                                                    )}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-mono text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    /{page.slug}
                                                                </a>
                                                            ) : (
                                                                <span className="font-mono text-sm text-gray-500 dark:text-gray-500">
                                                                    /{page.slug}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    page.is_published
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                            >
                                                                {page.is_published
                                                                    ? 'Published'
                                                                    : 'Draft'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {format(
                                                                new Date(
                                                                    page.updated_at,
                                                                ),
                                                                'MMM dd, yyyy',
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <span className="sr-only">
                                                                            Open
                                                                            menu
                                                                        </span>
                                                                        <svg
                                                                            className="h-4 w-4"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                                                            />
                                                                        </svg>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                'pages.show',
                                                                                page.id,
                                                                            )}
                                                                        >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    {canEdit && (
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    'pages.edit',
                                                                                    page.id,
                                                                                )}
                                                                            >
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                Edit
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {canEdit && (
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    'pages.duplicate',
                                                                                    page.id,
                                                                                )}
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                Duplicate
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {canDelete && (
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    page.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
