import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationStatusBadge from './components/ApplicationStatusBadge';

interface Application {
    id: number;
    job: {
        id: number;
        title: string;
        job_board: {
            id: number;
            name: string;
        };
    };
    applicant: {
        id: number;
        name: string;
        email: string;
    };
    cover_letter?: string;
    status:
        | 'pending'
        | 'reviewed'
        | 'shortlisted'
        | 'interviewed'
        | 'accepted'
        | 'rejected';
    applied_at: string;
    reviewed_at?: string;
    interview_date?: string;
}

interface Props extends PageProps {
    applications: Application[];
}

export default function Applications({ auth, applications }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [jobFilter, setJobFilter] = useState<string>('all');

    const jobs = useMemo(() => {
        const jobSet = new Set(applications.map((app) => app.job.id));
        return applications
            .filter((app) => jobSet.has(app.job.id))
            .map((app) => ({
                id: app.job.id,
                title: app.job.title,
            }))
            .filter(
                (job, index, self) =>
                    index === self.findIndex((j) => j.id === job.id),
            );
    }, [applications]);

    const filteredApplications = useMemo(() => {
        let result = applications;

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (app) =>
                    app.job.title.toLowerCase().includes(searchLower) ||
                    app.applicant.name.toLowerCase().includes(searchLower) ||
                    app.applicant.email.toLowerCase().includes(searchLower) ||
                    app.cover_letter?.toLowerCase().includes(searchLower),
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter((app) => app.status === statusFilter);
        }

        // Job filter
        if (jobFilter !== 'all') {
            result = result.filter(
                (app) => app.job.id.toString() === jobFilter,
            );
        }

        return result;
    }, [applications, search, statusFilter, jobFilter]);

    const stats = useMemo(() => {
        const total = applications.length;
        const pending = applications.filter(
            (app) => app.status === 'pending',
        ).length;
        const reviewed = applications.filter(
            (app) => app.status === 'reviewed',
        ).length;
        const shortlisted = applications.filter(
            (app) => app.status === 'shortlisted',
        ).length;
        const interviewed = applications.filter(
            (app) => app.status === 'interviewed',
        ).length;
        const accepted = applications.filter(
            (app) => app.status === 'accepted',
        ).length;
        const rejected = applications.filter(
            (app) => app.status === 'rejected',
        ).length;
        return {
            total,
            pending,
            reviewed,
            shortlisted,
            interviewed,
            accepted,
            rejected,
        };
    }, [applications]);

    const handleStatusUpdate = (id: number, status: string) => {
        router.post(
            route('jobs.updateApplicationStatus', id),
            { status },
            {
                onSuccess: () => {
                    toast.success('Application status updated');
                },
                onError: () => {
                    toast.error('Failed to update status');
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Applications
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Manage job applications
                            </p>
                        </div>
                        <Link href={route('jobs.applicants')}>
                            <Button variant="outline">View Applicants</Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-7">
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    Total
                                </p>
                                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    {stats.total}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                    Pending
                                </p>
                                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                                    {stats.pending}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    Reviewed
                                </p>
                                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    {stats.reviewed}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                    Shortlisted
                                </p>
                                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                                    {stats.shortlisted}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                    Interviewed
                                </p>
                                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                                    {stats.interviewed}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                    Accepted
                                </p>
                                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                                    {stats.accepted}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20">
                            <CardContent className="p-4">
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                    Rejected
                                </p>
                                <p className="text-xl font-bold text-red-900 dark:text-red-100">
                                    {stats.rejected}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <Head title="Applications" />

            <div className="space-y-6">
                {/* Search and Filters */}
                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <div className="relative max-w-md flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search applications..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border-gray-300 bg-white pl-9 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                                />
                            </div>
                            <ApplicationFilters
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                jobFilter={jobFilter}
                                setJobFilter={setJobFilter}
                                jobs={jobs}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Table */}
                {filteredApplications.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {search ||
                                statusFilter !== 'all' ||
                                jobFilter !== 'all'
                                    ? 'No applications found'
                                    : 'No applications yet'}
                            </p>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {search ||
                                statusFilter !== 'all' ||
                                jobFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Applications will appear here when candidates apply to jobs'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Applicant
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Job
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Job Board
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Applied
                                        </TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((application) => (
                                        <TableRow
                                            key={application.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            application
                                                                .applicant.name
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {
                                                            application
                                                                .applicant.email
                                                        }
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 dark:text-white">
                                                {application.job.title}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {application.job.job_board.name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <ApplicationStatusBadge
                                                    status={application.status}
                                                />
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {new Date(
                                                    application.applied_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <Link
                                                    href={route(
                                                        'jobs.application',
                                                        application.id,
                                                    )}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
