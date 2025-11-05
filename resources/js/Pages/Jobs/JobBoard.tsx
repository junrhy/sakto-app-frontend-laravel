import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, SearchIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import JobCard from './components/JobCard';
import JobFilters from './components/JobFilters';

interface Job {
    id: number;
    title: string;
    description: string;
    requirements?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency: string;
    location?: string;
    employment_type?: string;
    job_category?: string;
    status: 'draft' | 'published' | 'closed';
    application_deadline?: string;
    is_featured: boolean;
    views_count: number;
    applications_count: number;
    created_at: string;
    updated_at: string;
}

interface JobBoard {
    id: number;
    name: string;
    description?: string;
    slug: string;
    is_active: boolean;
}

interface Props extends PageProps {
    jobBoard: JobBoard;
    jobs: Job[];
}

export default function JobBoard({ auth, jobBoard, jobs }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');

    const filteredJobs = useMemo(() => {
        let result = jobs;

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (job) =>
                    job.title.toLowerCase().includes(searchLower) ||
                    job.description.toLowerCase().includes(searchLower) ||
                    job.location?.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter((job) => job.status === statusFilter);
        }

        // Category filter
        if (categoryFilter !== 'all' && categoryFilter) {
            result = result.filter((job) => job.job_category === categoryFilter);
        }

        // Employment type filter
        if (employmentTypeFilter !== 'all' && employmentTypeFilter) {
            result = result.filter((job) => job.employment_type === employmentTypeFilter);
        }

        return result;
    }, [jobs, search, statusFilter, categoryFilter, employmentTypeFilter]);

    const categories = useMemo(() => {
        const cats = jobs.map((job) => job.job_category).filter(Boolean) as string[];
        return Array.from(new Set(cats));
    }, [jobs]);

    const employmentTypes = useMemo(() => {
        const types = jobs.map((job) => job.employment_type).filter(Boolean) as string[];
        return Array.from(new Set(types));
    }, [jobs]);

    const stats = useMemo(() => {
        const total = jobs.length;
        const published = jobs.filter((job) => job.status === 'published').length;
        const drafts = jobs.filter((job) => job.status === 'draft').length;
        const closed = jobs.filter((job) => job.status === 'closed').length;
        const totalApplications = jobs.reduce((sum, job) => sum + job.applications_count, 0);
        return { total, published, drafts, closed, totalApplications };
    }, [jobs]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this job?')) {
            router.delete(route('jobs.destroyJob', id), {
                onSuccess: () => {
                    toast.success('Job deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete job');
                },
            });
        }
    };

    const handlePublish = (id: number) => {
        router.post(
            route('jobs.publishJob', id),
            {},
            {
                onSuccess: () => {
                    toast.success('Job published successfully');
                },
                onError: () => {
                    toast.error('Failed to publish job');
                },
            }
        );
    };

    const handleClose = (id: number) => {
        router.post(
            route('jobs.closeJob', id),
            {},
            {
                onSuccess: () => {
                    toast.success('Job closed successfully');
                },
                onError: () => {
                    toast.error('Failed to close job');
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={route('jobs.index')}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {jobBoard.name}
                                </h1>
                                {jobBoard.description && (
                                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                                        {jobBoard.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Link href={route('jobs.createJob', jobBoard.id)}>
                            <Button size="lg" className="shadow-lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Post Job
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Total Jobs
                                </p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {stats.total}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Published
                                </p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    {stats.published}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                    Drafts
                                </p>
                                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                                    {stats.drafts}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                    Closed
                                </p>
                                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                    {stats.closed}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    Applications
                                </p>
                                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                    {stats.totalApplications}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <Head title={jobBoard.name} />

            <div className="space-y-6">
                    {/* Search and Filters */}
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                                <div className="relative flex-1 max-w-md">
                                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search jobs..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="border-gray-300 bg-white pl-9 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                                    />
                                </div>
                                <JobFilters
                                    statusFilter={statusFilter}
                                    setStatusFilter={setStatusFilter}
                                    categoryFilter={categoryFilter}
                                    setCategoryFilter={setCategoryFilter}
                                    categories={categories}
                                    employmentTypeFilter={employmentTypeFilter}
                                    setEmploymentTypeFilter={setEmploymentTypeFilter}
                                    employmentTypes={employmentTypes}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Jobs Grid */}
                    {filteredJobs.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {search || statusFilter !== 'all' || categoryFilter !== 'all' || employmentTypeFilter !== 'all'
                                        ? 'No jobs found'
                                        : 'No jobs yet'}
                                </p>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {search || statusFilter !== 'all' || categoryFilter !== 'all' || employmentTypeFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Get started by posting your first job'}
                                </p>
                                {!search && statusFilter === 'all' && categoryFilter === 'all' && employmentTypeFilter === 'all' && (
                                    <Link href={route('jobs.createJob', jobBoard.id)} className="mt-6 inline-block">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Post Job
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onDelete={handleDelete}
                                    onPublish={handlePublish}
                                    onClose={handleClose}
                                />
                            ))}
                        </div>
                    )}
            </div>
        </AuthenticatedLayout>
    );
}

