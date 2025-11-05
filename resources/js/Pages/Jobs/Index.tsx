import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Briefcase, Plus, SearchIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import JobBoardCard from './components/JobBoardCard';

interface JobBoard {
    id: number;
    name: string;
    description?: string;
    slug: string;
    is_active: boolean;
    jobs_count: number;
    published_jobs_count: number;
    client_identifier?: string;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    jobBoards: JobBoard[];
}

export default function Index({ auth, jobBoards }: Props) {
    const [search, setSearch] = useState('');

    const filteredJobBoards = useMemo(() => {
        if (!search.trim()) {
            return jobBoards;
        }
        const searchLower = search.toLowerCase();
        return jobBoards.filter(
            (board) =>
                board.name.toLowerCase().includes(searchLower) ||
                board.description?.toLowerCase().includes(searchLower)
        );
    }, [jobBoards, search]);

    const stats = useMemo(() => {
        const total = jobBoards.length;
        const active = jobBoards.filter((board) => board.is_active).length;
        const totalJobs = jobBoards.reduce((sum, board) => sum + board.jobs_count, 0);
        const publishedJobs = jobBoards.reduce((sum, board) => sum + board.published_jobs_count, 0);
        return { total, active, totalJobs, publishedJobs };
    }, [jobBoards]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this job board? This will also delete all jobs in this board.')) {
            router.delete(route('jobs.destroyBoard', id), {
                onSuccess: () => {
                    toast.success('Job board deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete job board');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Job Boards
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Manage your job boards and postings
                            </p>
                        </div>
                        <Link href={route('jobs.createBoard')}>
                            <Button size="lg" className="shadow-lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Create Job Board
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Total Boards
                                        </p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <Briefcase className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Active Boards
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {stats.active}
                                        </p>
                                    </div>
                                    <Briefcase className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                            Total Jobs
                                        </p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {stats.totalJobs}
                                        </p>
                                    </div>
                                    <Briefcase className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                            Published Jobs
                                        </p>
                                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                            {stats.publishedJobs}
                                        </p>
                                    </div>
                                    <Briefcase className="h-8 w-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <Head title="Job Boards" />

            <div className="space-y-6">
                    {/* Search Bar */}
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search job boards..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border-gray-300 bg-white pl-9 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Boards Grid */}
                    {filteredJobBoards.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    {search ? 'No job boards found' : 'No job boards yet'}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {search
                                        ? 'Try adjusting your search terms'
                                        : 'Get started by creating your first job board'}
                                </p>
                                {!search && (
                                    <Link href={route('jobs.createBoard')} className="mt-6 inline-block">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Job Board
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredJobBoards.map((board) => (
                                <JobBoardCard
                                    key={board.id}
                                    board={board}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
            </div>
        </AuthenticatedLayout>
    );
}

