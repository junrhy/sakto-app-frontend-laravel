import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    DollarSign,
    Eye,
    Filter,
    Grid3x3,
    Heart,
    List,
    Mail,
    MapPin,
    SearchIcon,
    Share2,
    Sparkles,
    Tag,
    TrendingUp,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Job {
    id: number;
    title: string;
    description: string;
    location?: string;
    employment_type?: string;
    job_category?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    application_deadline?: string;
    is_featured: boolean;
    created_at: string;
}

interface JobBoard {
    id: number;
    name: string;
    description?: string;
    slug: string;
}

interface Props {
    jobBoard: JobBoard;
    jobs: Job[];
    clientIdentifier?: string;
    canLogin?: boolean;
    canRegister?: boolean;
}

// Skeleton Loader Component
function JobCardSkeleton() {
    return (
        <Card className="animate-pulse border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                    </div>
                    <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                        <div className="h-8 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-8 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Empty State Component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
            <CardContent className="p-16 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                    <Briefcase className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {hasFilters ? 'No jobs found' : 'No jobs available'}
                </h3>
                <p className="mb-6 mt-2 text-gray-600 dark:text-gray-400">
                    {hasFilters
                        ? 'Try adjusting your search or filters to find more opportunities'
                        : 'Check back later for new opportunities'}
                </p>
                {hasFilters && (
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        Clear All Filters
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function JobBoard({
    jobBoard,
    jobs,
    clientIdentifier,
    canLogin,
    canRegister,
}: Props) {
    const [search, setSearch] = useState('');
    const [employmentTypeFilter, setEmploymentTypeFilter] =
        useState<string>('all');
    const [jobCategoryFilter, setJobCategoryFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
    const [salaryRange, setSalaryRange] = useState<{
        min: string;
        max: string;
    }>({ min: '', max: '' });
    const [sortBy, setSortBy] = useState<string>('newest');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [previewJob, setPreviewJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const [copiedJobId, setCopiedJobId] = useState<number | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Load favorites and recent searches from localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem(
            `job-favorites-${jobBoard.id}`,
        );
        if (savedFavorites) {
            setFavorites(new Set(JSON.parse(savedFavorites)));
        }
        const savedSearches = localStorage.getItem(
            `job-recent-searches-${jobBoard.id}`,
        );
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }
    }, [jobBoard.id]);

    // Save favorites to localStorage
    useEffect(() => {
        localStorage.setItem(
            `job-favorites-${jobBoard.id}`,
            JSON.stringify(Array.from(favorites)),
        );
    }, [favorites, jobBoard.id]);

    // Intersection Observer for fade-in animations
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(
                            'opacity-100',
                            'translate-y-0',
                        );
                        entry.target.classList.remove(
                            'opacity-0',
                            'translate-y-4',
                        );
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
        );

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    const employmentTypes = useMemo(() => {
        const types = new Set(
            jobs
                .map((job) => job.employment_type)
                .filter((type): type is string => Boolean(type)),
        );
        return Array.from(types).sort();
    }, [jobs]);

    const jobCategories = useMemo(() => {
        const categories = new Set(
            jobs
                .map((job) => job.job_category)
                .filter((cat): cat is string => Boolean(cat)),
        );
        return Array.from(categories).sort();
    }, [jobs]);

    const locations = useMemo(() => {
        const locs = new Set(
            jobs
                .map((job) => job.location)
                .filter((loc): loc is string => Boolean(loc)),
        );
        return Array.from(locs).sort();
    }, [jobs]);

    // Get popular categories and locations (top 5)
    const popularCategories = useMemo(() => {
        const categoryCounts = new Map<string, number>();
        jobs.forEach((job) => {
            if (job.job_category) {
                categoryCounts.set(
                    job.job_category,
                    (categoryCounts.get(job.job_category) || 0) + 1,
                );
            }
        });
        return Array.from(categoryCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat]) => cat);
    }, [jobs]);

    const popularLocations = useMemo(() => {
        const locationCounts = new Map<string, number>();
        jobs.forEach((job) => {
            if (job.location) {
                locationCounts.set(
                    job.location,
                    (locationCounts.get(job.location) || 0) + 1,
                );
            }
        });
        return Array.from(locationCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([loc]) => loc);
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        let result = [...jobs];

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (job) =>
                    job.title.toLowerCase().includes(searchLower) ||
                    job.description.toLowerCase().includes(searchLower) ||
                    job.location?.toLowerCase().includes(searchLower) ||
                    job.job_category?.toLowerCase().includes(searchLower),
            );
        }

        // Employment type filter
        if (employmentTypeFilter !== 'all') {
            result = result.filter(
                (job) => job.employment_type === employmentTypeFilter,
            );
        }

        // Job category filter
        if (jobCategoryFilter !== 'all') {
            result = result.filter(
                (job) => job.job_category === jobCategoryFilter,
            );
        }

        // Location filter
        if (locationFilter !== 'all') {
            result = result.filter((job) => job.location === locationFilter);
        }

        // Featured filter
        if (showFeaturedOnly) {
            result = result.filter((job) => job.is_featured);
        }

        // Salary range filter
        if (salaryRange.min || salaryRange.max) {
            result = result.filter((job) => {
                const minSalary = salaryRange.min
                    ? parseFloat(salaryRange.min)
                    : 0;
                const maxSalary = salaryRange.max
                    ? parseFloat(salaryRange.max)
                    : Infinity;

                const jobMin = job.salary_min || 0;
                const jobMax = job.salary_max || job.salary_min || Infinity;

                return jobMin <= maxSalary && jobMax >= minSalary;
            });
        }

        // Sort jobs
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                case 'oldest':
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                case 'salary_high':
                    const aMax = a.salary_max || a.salary_min || 0;
                    const bMax = b.salary_max || b.salary_min || 0;
                    return bMax - aMax;
                case 'salary_low':
                    const aMin = a.salary_min || a.salary_max || Infinity;
                    const bMin = b.salary_min || b.salary_max || Infinity;
                    return aMin - bMin;
                default:
                    return 0;
            }
        });

        return result;
    }, [
        jobs,
        search,
        employmentTypeFilter,
        jobCategoryFilter,
        locationFilter,
        showFeaturedOnly,
        salaryRange,
        sortBy,
    ]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        employmentTypeFilter,
        jobCategoryFilter,
        locationFilter,
        showFeaturedOnly,
        salaryRange,
    ]);

    // Pagination logic
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    // Observe job cards for animations
    useEffect(() => {
        if (!observerRef.current) return;

        cardRefs.current.forEach((card) => {
            if (card) {
                observerRef.current?.observe(card);
            }
        });

        return () => {
            cardRefs.current.forEach((card) => {
                if (card) {
                    observerRef.current?.unobserve(card);
                }
            });
        };
    }, [paginatedJobs]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const formatSalary = (min?: number, max?: number, currency?: string) => {
        if (!min && !max) return 'Salary not specified';
        const curr = currency || 'PHP';
        if (min && max)
            return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
        if (min) return `${curr} ${min.toLocaleString()}+`;
        if (max) return `Up to ${curr} ${max.toLocaleString()}`;
        return 'Salary not specified';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getDaysAgo = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return months === 1 ? '1 month ago' : `${months} months ago`;
        }
        const years = Math.floor(diffDays / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
    };

    const toggleFavorite = (jobId: number) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(jobId)) {
                newFavorites.delete(jobId);
            } else {
                newFavorites.add(jobId);
            }
            return newFavorites;
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        if (value.trim() && !recentSearches.includes(value.trim())) {
            const newSearches = [value.trim(), ...recentSearches].slice(0, 5);
            setRecentSearches(newSearches);
            localStorage.setItem(
                `job-recent-searches-${jobBoard.id}`,
                JSON.stringify(newSearches),
            );
        }
    };

    const handleRecentSearchClick = (searchTerm: string) => {
        setSearch(searchTerm);
        setShowRecentSearches(false);
        searchInputRef.current?.focus();
    };

    const shareJob = async (job: Job) => {
        const url = clientIdentifier
            ? `${window.location.origin}${route('jobs.public.job', job.id)}?client=${encodeURIComponent(clientIdentifier)}`
            : `${window.location.origin}${route('jobs.public.job', job.id)}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: job.title,
                    text: job.description.substring(0, 100),
                    url: url,
                });
            } catch (err) {
                // User cancelled or error occurred
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(url);
            setCopiedJobId(job.id);
            setTimeout(() => setCopiedJobId(null), 2000);
        }
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case 'newest':
                return 'Newest First';
            case 'oldest':
                return 'Oldest First';
            case 'salary_high':
                return 'Highest Salary';
            case 'salary_low':
                return 'Lowest Salary';
            default:
                return 'Newest First';
        }
    };

    const setCardRef = (jobId: number, element: HTMLDivElement | null) => {
        if (element) {
            cardRefs.current.set(jobId, element);
        } else {
            cardRefs.current.delete(jobId);
        }
    };

    const JobCard = ({ job }: { job: Job }) => (
        <Card
            ref={(el) => setCardRef(job.id, el)}
            className="group translate-y-4 border border-gray-200 bg-white opacity-0 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600"
        >
            <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                    {/* Header Section */}
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
                        <div className="w-full min-w-0 flex-1 sm:w-auto">
                            <div className="mb-2 flex items-start gap-2 sm:gap-3">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md sm:h-12 sm:w-12">
                                        <Briefcase className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <h3 className="break-words text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 sm:text-xl">
                                            {job.title}
                                        </h3>
                                        {job.is_featured && (
                                            <Badge className="w-fit border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-xs text-white shadow-md sm:text-sm">
                                                <TrendingUp className="mr-1 h-3 w-3" />
                                                Featured
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:gap-3 sm:text-sm">
                                        {job.job_category && (
                                            <Badge
                                                variant="outline"
                                                className="border-gray-300 text-xs dark:border-gray-600"
                                            >
                                                <Tag className="mr-1 h-3 w-3" />
                                                {job.job_category}
                                            </Badge>
                                        )}
                                        {getDaysAgo(job.created_at) && (
                                            <span className="flex items-center">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {getDaysAgo(job.created_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:mt-3">
                                {job.description}
                            </p>
                        </div>
                        {/* Action Buttons - Hidden on mobile for simplicity */}
                        <div className="hidden flex-shrink-0 flex-col gap-2 sm:flex">
                            <button
                                onClick={() => toggleFavorite(job.id)}
                                className={`rounded-lg p-2 transition-colors ${
                                    favorites.has(job.id)
                                        ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-red-500 dark:hover:bg-gray-700'
                                }`}
                                title={
                                    favorites.has(job.id)
                                        ? 'Remove from favorites'
                                        : 'Add to favorites'
                                }
                            >
                                <Heart
                                    className={`h-5 w-5 ${favorites.has(job.id) ? 'fill-current' : ''}`}
                                />
                            </button>
                            <button
                                onClick={() => shareJob(job)}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-indigo-600 dark:hover:bg-gray-700"
                                title="Share job"
                            >
                                {copiedJobId === job.id ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Share2 className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Job Details Grid - Simplified on mobile */}
                    <div className="grid grid-cols-1 gap-2 border-t border-gray-200 pt-3 dark:border-gray-700 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                        {job.location && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400 sm:h-4 sm:w-4" />
                                <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                                    {job.location}
                                </span>
                            </div>
                        )}
                        {job.employment_type && (
                            <div className="hidden items-center gap-2 text-sm sm:flex">
                                <Clock className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                                <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                                    {job.employment_type.replace('-', ' ')}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-green-600 dark:text-green-400 sm:h-4 sm:w-4" />
                            <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                                {formatSalary(
                                    job.salary_min,
                                    job.salary_max,
                                    job.salary_currency,
                                )}
                            </span>
                        </div>
                        {job.application_deadline && (
                            <div className="hidden items-center gap-2 text-sm lg:flex">
                                <Calendar className="h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Deadline
                                    </span>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {formatDate(job.application_deadline)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons - Simplified on mobile */}
                    <div className="flex flex-col items-stretch justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700 sm:flex-row sm:items-center sm:gap-3">
                        <Link
                            href={
                                clientIdentifier
                                    ? `${route('jobs.public.job', job.id)}?client=${encodeURIComponent(clientIdentifier)}`
                                    : route('jobs.public.job', job.id)
                            }
                            className="flex-1"
                        >
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-sm text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg sm:text-base"
                                size="sm"
                            >
                                View Details
                                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => setPreviewJob(job)}
                            className="hidden flex-1 border-gray-300 text-base hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 sm:flex"
                            size="sm"
                        >
                            Quick View
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const JobCardGrid = ({ job }: { job: Job }) => (
        <Card
            ref={(el) => setCardRef(job.id, el)}
            className="group flex translate-y-4 flex-col border border-gray-200 bg-white opacity-0 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600"
        >
            <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md sm:h-12 sm:w-12">
                        <Briefcase className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div className="hidden gap-2 sm:flex">
                        <button
                            onClick={() => toggleFavorite(job.id)}
                            className={`rounded-lg p-2 transition-colors ${
                                favorites.has(job.id)
                                    ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-red-500 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Heart
                                className={`h-4 w-4 ${favorites.has(job.id) ? 'fill-current' : ''}`}
                            />
                        </button>
                        <button
                            onClick={() => shareJob(job)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-indigo-600 dark:hover:bg-gray-700"
                        >
                            {copiedJobId === job.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Share2 className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <h3 className="line-clamp-2 break-words text-base font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 sm:text-lg">
                            {job.title}
                        </h3>
                        {job.is_featured && (
                            <Badge className="w-fit border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-xs text-white shadow-md">
                                <TrendingUp className="mr-1 h-2 w-2" />
                                Featured
                            </Badge>
                        )}
                    </div>
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                        {job.description}
                    </p>
                    <div className="mb-4 space-y-2">
                        {job.location && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{job.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <DollarSign className="h-3 w-3" />
                            <span>
                                {formatSalary(
                                    job.salary_min,
                                    job.salary_max,
                                    job.salary_currency,
                                )}
                            </span>
                        </div>
                        {getDaysAgo(job.created_at) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>{getDaysAgo(job.created_at)}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row">
                    <Link
                        href={
                            clientIdentifier
                                ? `${route('jobs.public.job', job.id)}?client=${encodeURIComponent(clientIdentifier)}`
                                : route('jobs.public.job', job.id)
                        }
                        className="flex-1"
                    >
                        <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-xs hover:from-indigo-700 hover:to-purple-700 sm:text-sm"
                        >
                            Apply
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewJob(job)}
                        className="hidden flex-1 text-sm sm:flex"
                    >
                        Quick View
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const hasActiveFilters =
        Boolean(search) ||
        employmentTypeFilter !== 'all' ||
        jobCategoryFilter !== 'all' ||
        locationFilter !== 'all' ||
        showFeaturedOnly ||
        Boolean(salaryRange.min) ||
        Boolean(salaryRange.max);

    return (
        <GuestLayout>
            <Head title={`${jobBoard.name} - Job Board`} />

            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Enhanced Header */}
                <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 shadow-2xl dark:border-gray-700">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"></div>
                        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl"></div>
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
                            {/* Main Header Content */}
                            <div className="flex-1">
                                {/* Mobile: Simple title only */}
                                <div className="sm:hidden">
                                    <h1 className="break-words text-2xl font-bold tracking-tight text-white">
                                        {jobBoard.name}
                                    </h1>
                                </div>

                                {/* Desktop: Full header with icon, badge, description, and stats */}
                                <div className="hidden sm:block">
                                    <div className="mb-6 flex flex-row items-start gap-4">
                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-xl backdrop-blur-md">
                                            <Briefcase className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-3 flex items-center gap-3">
                                                <h1 className="break-words text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                                                    {jobBoard.name}
                                                </h1>
                                                {jobs.length > 0 && (
                                                    <Badge className="w-fit border-white/30 bg-white/20 px-3 text-sm text-white backdrop-blur-sm">
                                                        <Sparkles className="mr-1 h-3 w-3" />
                                                        {jobs.length}{' '}
                                                        {jobs.length === 1
                                                            ? 'Job'
                                                            : 'Jobs'}
                                                    </Badge>
                                                )}
                                            </div>
                                            {jobBoard.description && (
                                                <p className="max-w-2xl text-lg leading-relaxed text-blue-100 lg:text-xl">
                                                    {jobBoard.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-8 grid grid-cols-4 gap-4">
                                        <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                                                <Briefcase className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-2xl font-bold text-white">
                                                    {jobs.length}
                                                </div>
                                                <div className="text-xs text-blue-100">
                                                    Total Jobs
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                                                <TrendingUp className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-2xl font-bold text-white">
                                                    {
                                                        jobs.filter(
                                                            (j) =>
                                                                j.is_featured,
                                                        ).length
                                                    }
                                                </div>
                                                <div className="text-xs text-blue-100">
                                                    Featured
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                                                <Tag className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-2xl font-bold text-white">
                                                    {jobCategories.length}
                                                </div>
                                                <div className="text-xs text-blue-100">
                                                    Categories
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                                                <MapPin className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-2xl font-bold text-white">
                                                    {locations.length}
                                                </div>
                                                <div className="text-xs text-blue-100">
                                                    Locations
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <Card className="mb-6 border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-4 sm:h-5 sm:w-5" />
                                    <Input
                                        ref={searchInputRef}
                                        type="search"
                                        placeholder="Search jobs..."
                                        value={search}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        onFocus={() =>
                                            setShowRecentSearches(
                                                recentSearches.length > 0,
                                            )
                                        }
                                        onBlur={() =>
                                            setTimeout(
                                                () =>
                                                    setShowRecentSearches(
                                                        false,
                                                    ),
                                                200,
                                            )
                                        }
                                        className="h-10 border-gray-300 pl-9 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:h-12 sm:pl-12 sm:text-base"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                    {/* Recent Searches Dropdown */}
                                    {showRecentSearches &&
                                        recentSearches.length > 0 && (
                                            <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                <div className="p-2">
                                                    <div className="mb-1 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                        Recent Searches
                                                    </div>
                                                    {recentSearches.map(
                                                        (term, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() =>
                                                                    handleRecentSearchClick(
                                                                        term,
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                            >
                                                                <SearchIcon className="h-4 w-4 text-gray-400" />
                                                                {term}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>

                                {/* Quick Filters */}
                                {(popularCategories.length > 0 ||
                                    popularLocations.length > 0) && (
                                    <div className="space-y-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                                        {popularCategories.length > 0 && (
                                            <div>
                                                <span className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Popular Categories:
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {popularCategories.map(
                                                        (cat) => (
                                                            <button
                                                                key={cat}
                                                                onClick={() => {
                                                                    setJobCategoryFilter(
                                                                        jobCategoryFilter ===
                                                                            cat
                                                                            ? 'all'
                                                                            : cat,
                                                                    );
                                                                    setCurrentPage(
                                                                        1,
                                                                    );
                                                                }}
                                                                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                                                                    jobCategoryFilter ===
                                                                    cat
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                                }`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {popularLocations.length > 0 && (
                                            <div>
                                                <span className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Popular Locations:
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {popularLocations.map(
                                                        (loc) => (
                                                            <button
                                                                key={loc}
                                                                onClick={() => {
                                                                    setLocationFilter(
                                                                        locationFilter ===
                                                                            loc
                                                                            ? 'all'
                                                                            : loc,
                                                                    );
                                                                    setCurrentPage(
                                                                        1,
                                                                    );
                                                                }}
                                                                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                                                                    locationFilter ===
                                                                    loc
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                                }`}
                                                            >
                                                                {loc}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Active Filters */}
                                {hasActiveFilters && (
                                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Active filters:
                                        </span>
                                        {employmentTypeFilter !== 'all' && (
                                            <Badge
                                                variant="outline"
                                                className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            >
                                                {employmentTypeFilter
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    employmentTypeFilter
                                                        .slice(1)
                                                        .replace('-', ' ')}
                                                <button
                                                    onClick={() =>
                                                        setEmploymentTypeFilter(
                                                            'all',
                                                        )
                                                    }
                                                    className="ml-2 hover:text-indigo-900 dark:hover:text-indigo-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {jobCategoryFilter !== 'all' && (
                                            <Badge
                                                variant="outline"
                                                className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            >
                                                {jobCategoryFilter}
                                                <button
                                                    onClick={() =>
                                                        setJobCategoryFilter(
                                                            'all',
                                                        )
                                                    }
                                                    className="ml-2 hover:text-indigo-900 dark:hover:text-indigo-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {locationFilter !== 'all' && (
                                            <Badge
                                                variant="outline"
                                                className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            >
                                                {locationFilter}
                                                <button
                                                    onClick={() =>
                                                        setLocationFilter('all')
                                                    }
                                                    className="ml-2 hover:text-indigo-900 dark:hover:text-indigo-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {showFeaturedOnly && (
                                            <Badge
                                                variant="outline"
                                                className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            >
                                                Featured Only
                                                <button
                                                    onClick={() =>
                                                        setShowFeaturedOnly(
                                                            false,
                                                        )
                                                    }
                                                    className="ml-2 hover:text-indigo-900 dark:hover:text-indigo-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {(salaryRange.min ||
                                            salaryRange.max) && (
                                            <Badge
                                                variant="outline"
                                                className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            >
                                                {salaryRange.min &&
                                                salaryRange.max
                                                    ? `${salaryRange.min} - ${salaryRange.max}`
                                                    : salaryRange.min
                                                      ? `Min: ${salaryRange.min}`
                                                      : `Max: ${salaryRange.max}`}
                                                <button
                                                    onClick={() =>
                                                        setSalaryRange({
                                                            min: '',
                                                            max: '',
                                                        })
                                                    }
                                                    className="ml-2 hover:text-indigo-900 dark:hover:text-indigo-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content with Sidebar */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Left Sidebar - Filters */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6 border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                <CardContent className="p-6">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Filters
                                            </h3>
                                        </div>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={() => {
                                                    setEmploymentTypeFilter(
                                                        'all',
                                                    );
                                                    setJobCategoryFilter('all');
                                                    setLocationFilter('all');
                                                    setShowFeaturedOnly(false);
                                                    setSalaryRange({
                                                        min: '',
                                                        max: '',
                                                    });
                                                }}
                                                className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                <X className="h-3 w-3" />
                                                <span>Clear</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        {/* View Toggle */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                View Mode
                                            </label>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={
                                                        viewMode === 'list'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setViewMode('list')
                                                    }
                                                    className="flex-1"
                                                >
                                                    <List className="mr-2 h-4 w-4" />
                                                    List
                                                </Button>
                                                <Button
                                                    variant={
                                                        viewMode === 'grid'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setViewMode('grid')
                                                    }
                                                    className="flex-1"
                                                >
                                                    <Grid3x3 className="mr-2 h-4 w-4" />
                                                    Grid
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Sort By */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Sort By
                                                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                                                    ({getSortLabel()})
                                                </span>
                                            </label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) =>
                                                    setSortBy(e.target.value)
                                                }
                                                className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="newest">
                                                    Newest First
                                                </option>
                                                <option value="oldest">
                                                    Oldest First
                                                </option>
                                                <option value="salary_high">
                                                    Highest Salary
                                                </option>
                                                <option value="salary_low">
                                                    Lowest Salary
                                                </option>
                                            </select>
                                        </div>

                                        {/* Employment Type */}
                                        {employmentTypes.length > 0 && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Employment Type
                                                </label>
                                                <select
                                                    value={employmentTypeFilter}
                                                    onChange={(e) =>
                                                        setEmploymentTypeFilter(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="all">
                                                        All Types
                                                    </option>
                                                    {employmentTypes.map(
                                                        (type) => (
                                                            <option
                                                                key={type}
                                                                value={type}
                                                            >
                                                                {type
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    type
                                                                        .slice(
                                                                            1,
                                                                        )
                                                                        .replace(
                                                                            '-',
                                                                            ' ',
                                                                        )}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                        {/* Job Category */}
                                        {jobCategories.length > 0 && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Job Category
                                                </label>
                                                <select
                                                    value={jobCategoryFilter}
                                                    onChange={(e) =>
                                                        setJobCategoryFilter(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="all">
                                                        All Categories
                                                    </option>
                                                    {jobCategories.map(
                                                        (category) => (
                                                            <option
                                                                key={category}
                                                                value={category}
                                                            >
                                                                {category}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                        {/* Location */}
                                        {locations.length > 0 && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Location
                                                </label>
                                                <select
                                                    value={locationFilter}
                                                    onChange={(e) =>
                                                        setLocationFilter(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="all">
                                                        All Locations
                                                    </option>
                                                    {locations.map(
                                                        (location) => (
                                                            <option
                                                                key={location}
                                                                value={location}
                                                            >
                                                                {location}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                        {/* Featured Jobs */}
                                        <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                                            <input
                                                type="checkbox"
                                                id="featured-only"
                                                checked={showFeaturedOnly}
                                                onChange={(e) =>
                                                    setShowFeaturedOnly(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label
                                                htmlFor="featured-only"
                                                className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Featured Jobs Only
                                            </label>
                                        </div>

                                        {/* Salary Range */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Salary Range
                                            </label>
                                            <div className="space-y-2">
                                                <div>
                                                    <Input
                                                        type="number"
                                                        placeholder="Min salary"
                                                        value={salaryRange.min}
                                                        onChange={(e) =>
                                                            setSalaryRange({
                                                                ...salaryRange,
                                                                min: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="h-10 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        type="number"
                                                        placeholder="Max salary"
                                                        value={salaryRange.max}
                                                        onChange={(e) =>
                                                            setSalaryRange({
                                                                ...salaryRange,
                                                                max: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="h-10 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Side - Jobs List */}
                        <div className="lg:col-span-3">
                            {/* Stats and Results Count - Hidden on mobile */}
                            <div className="mb-6 hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-3">
                                <Card className="border border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-800/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Total Jobs
                                                </p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {jobs.length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-800/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Filtered Results
                                                </p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {filteredJobs.length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-800/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Showing
                                                </p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {filteredJobs.length > 0
                                                        ? `${startIndex + 1}-${Math.min(endIndex, filteredJobs.length)}`
                                                        : '0'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {isLoading ? (
                                <div
                                    className={
                                        viewMode === 'grid'
                                            ? 'grid grid-cols-1 gap-6 md:grid-cols-2'
                                            : 'space-y-6'
                                    }
                                >
                                    {[...Array(6)].map((_, i) => (
                                        <JobCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <EmptyState hasFilters={hasActiveFilters} />
                            ) : (
                                <>
                                    <div
                                        className={
                                            viewMode === 'grid'
                                                ? 'grid grid-cols-1 gap-6 md:grid-cols-2'
                                                : 'space-y-6'
                                        }
                                    >
                                        {paginatedJobs.map((job) =>
                                            viewMode === 'grid' ? (
                                                <JobCardGrid
                                                    key={job.id}
                                                    job={job}
                                                />
                                            ) : (
                                                <JobCard
                                                    key={job.id}
                                                    job={job}
                                                />
                                            ),
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <Card className="mt-6 border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <span>
                                                            Items per page:
                                                        </span>
                                                        <select
                                                            value={itemsPerPage}
                                                            onChange={(e) =>
                                                                handleItemsPerPageChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                        >
                                                            <option value={5}>
                                                                5
                                                            </option>
                                                            <option value={10}>
                                                                10
                                                            </option>
                                                            <option value={20}>
                                                                20
                                                            </option>
                                                            <option value={50}>
                                                                50
                                                            </option>
                                                        </select>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    1,
                                                                )
                                                            }
                                                            disabled={
                                                                currentPage ===
                                                                1
                                                            }
                                                            className="h-9 w-9 border-gray-300 p-0 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <ChevronsLeft className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    currentPage -
                                                                        1,
                                                                )
                                                            }
                                                            disabled={
                                                                currentPage ===
                                                                1
                                                            }
                                                            className="h-9 w-9 border-gray-300 p-0 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </Button>

                                                        <div className="flex items-center gap-1">
                                                            {getPageNumbers().map(
                                                                (
                                                                    page,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {page ===
                                                                        '...' ? (
                                                                            <span className="px-2 py-1 text-gray-500 dark:text-gray-400">
                                                                                ...
                                                                            </span>
                                                                        ) : (
                                                                            <Button
                                                                                variant={
                                                                                    currentPage ===
                                                                                    page
                                                                                        ? 'default'
                                                                                        : 'outline'
                                                                                }
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    handlePageChange(
                                                                                        page as number,
                                                                                    )
                                                                                }
                                                                                className={`h-9 w-9 p-0 ${
                                                                                    currentPage ===
                                                                                    page
                                                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                                                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    page
                                                                                }
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    currentPage +
                                                                        1,
                                                                )
                                                            }
                                                            disabled={
                                                                currentPage ===
                                                                totalPages
                                                            }
                                                            className="h-9 w-9 border-gray-300 p-0 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    totalPages,
                                                                )
                                                            }
                                                            disabled={
                                                                currentPage ===
                                                                totalPages
                                                            }
                                                            className="h-9 w-9 border-gray-300 p-0 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <ChevronsRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Preview Modal */}
                <Dialog
                    open={previewJob !== null}
                    onOpenChange={(open: boolean) => {
                        if (!open) {
                            setPreviewJob(null);
                        }
                    }}
                >
                    <DialogContent className="mx-4 max-h-[90vh] max-w-3xl overflow-y-auto sm:mx-0">
                        {previewJob && (
                            <>
                                <DialogHeader>
                                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-0">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                                                <DialogTitle className="break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                                                    {previewJob.title}
                                                </DialogTitle>
                                                {previewJob.is_featured && (
                                                    <Badge className="w-fit border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-xs text-white sm:text-sm">
                                                        <TrendingUp className="mr-1 h-3 w-3" />
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                                                {previewJob.job_category && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mr-2"
                                                    >
                                                        {
                                                            previewJob.job_category
                                                        }
                                                    </Badge>
                                                )}
                                                {getDaysAgo(
                                                    previewJob.created_at,
                                                ) && (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        Posted{' '}
                                                        {getDaysAgo(
                                                            previewJob.created_at,
                                                        )}
                                                    </span>
                                                )}
                                            </DialogDescription>
                                        </div>
                                        <div className="flex flex-shrink-0 gap-2">
                                            <button
                                                onClick={() =>
                                                    toggleFavorite(
                                                        previewJob.id,
                                                    )
                                                }
                                                className={`rounded-lg p-2 transition-colors ${
                                                    favorites.has(previewJob.id)
                                                        ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                                        : 'text-gray-400 hover:bg-gray-50 hover:text-red-500 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <Heart
                                                    className={`h-4 w-4 sm:h-5 sm:w-5 ${favorites.has(previewJob.id) ? 'fill-current' : ''}`}
                                                />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    shareJob(previewJob)
                                                }
                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-indigo-600 dark:hover:bg-gray-700"
                                            >
                                                {copiedJobId ===
                                                previewJob.id ? (
                                                    <Check className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
                                                ) : (
                                                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="mt-4 space-y-6">
                                    <div>
                                        <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                            Description
                                        </h4>
                                        <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                                            {previewJob.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                        {previewJob.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Location
                                                    </div>
                                                    <div className="truncate text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                                                        {previewJob.location}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {previewJob.employment_type && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400 sm:h-5 sm:w-5" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Employment Type
                                                    </div>
                                                    <div className="text-sm font-medium capitalize text-gray-900 dark:text-white sm:text-base">
                                                        {previewJob.employment_type.replace(
                                                            '-',
                                                            ' ',
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400 sm:h-5 sm:w-5" />
                                            <div className="min-w-0">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Salary
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                                                    {formatSalary(
                                                        previewJob.salary_min,
                                                        previewJob.salary_max,
                                                        previewJob.salary_currency,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {previewJob.application_deadline && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400 sm:h-5 sm:w-5" />
                                                <div className="min-w-0">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Application Deadline
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                                                        {formatDate(
                                                            previewJob.application_deadline,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPreviewJob(null)}
                                            className="flex-1 text-sm sm:text-base"
                                            size="sm"
                                        >
                                            Close
                                        </Button>
                                        <Link
                                            href={
                                                clientIdentifier
                                                    ? `${route('jobs.public.job', previewJob.id)}?client=${encodeURIComponent(clientIdentifier)}`
                                                    : route(
                                                          'jobs.public.job',
                                                          previewJob.id,
                                                      )
                                            }
                                            className="flex-1"
                                        >
                                            <Button
                                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-sm hover:from-indigo-700 hover:to-purple-700 sm:text-base"
                                                size="sm"
                                            >
                                                View Full Details
                                                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={
                                                clientIdentifier
                                                    ? `${route('jobs.public.apply', previewJob.id)}?client=${encodeURIComponent(clientIdentifier)}`
                                                    : route(
                                                          'jobs.public.apply',
                                                          previewJob.id,
                                                      )
                                            }
                                            className="flex-1"
                                        >
                                            <Button
                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-sm hover:from-green-700 hover:to-emerald-700 sm:text-base"
                                                size="sm"
                                            >
                                                Apply Now
                                                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Footer */}
                <footer className="mt-16 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                            <div className="lg:col-span-2">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                                        <Briefcase className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {jobBoard.name}
                                    </span>
                                </div>
                                {jobBoard.description && (
                                    <p className="mb-4 max-w-md text-sm text-gray-600 dark:text-gray-300">
                                        {jobBoard.description}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Find your next career opportunity with us.
                                    Browse through our latest job postings and
                                    discover positions that match your skills
                                    and aspirations.
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                                    Quick Links
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href={
                                                clientIdentifier
                                                    ? `${route('jobs.public.board', jobBoard.slug)}?client=${encodeURIComponent(clientIdentifier)}`
                                                    : route(
                                                          'jobs.public.board',
                                                          jobBoard.slug,
                                                      )
                                            }
                                            className="text-sm text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                                        >
                                            Browse Jobs
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                                    Get In Touch
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span>For job inquiries</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span>Browse all positions</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
                            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    &copy; {new Date().getFullYear()}{' '}
                                    {jobBoard.name}. All rights reserved.
                                </p>
                                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                    <Link
                                        href="#"
                                        className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <Link
                                        href="#"
                                        className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                                    >
                                        Terms of Service
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </GuestLayout>
    );
}
