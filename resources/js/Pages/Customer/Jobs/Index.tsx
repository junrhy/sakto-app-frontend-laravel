import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { buildOwnerSidebarSections } from '@/Pages/Customer/Communities/utils/ownerSidebarSections';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface CommunityJob {
    id?: number | string;
    title?: string;
    description?: string;
    location?: string;
    employment_type?: string;
    job_category?: string;
    salary_min?: number | string | null;
    salary_max?: number | string | null;
    salary_currency?: string | null;
    application_deadline?: string | null;
    status?: string;
    created_at?: string;
    job_board_id?: number | string | null;
}

interface JobsProps extends PageProps {
    community: {
        id: number | string;
        name: string;
        identifier?: string | null;
        slug?: string | null;
        app_currency?: {
            symbol?: string;
            code?: string;
            decimal_separator?: string;
            thousands_separator?: string;
        } | null;
    };
    project: string;
    jobs: CommunityJob[];
}

export default function Jobs({ auth, community, project, jobs }: JobsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [employmentFilter, setEmploymentFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const ownerIdentifier = community.slug ?? community.identifier ?? community.id;
    const projectIdentifier = project ?? 'community';
    const sidebarSections = useMemo(
        () =>
            buildOwnerSidebarSections(
                projectIdentifier,
                String(ownerIdentifier),
                'jobs',
            ),
        [projectIdentifier, ownerIdentifier],
    );

    const employmentOptions = useMemo(() => {
        const set = new Set(
            jobs
                .map((job) => job.employment_type)
                .filter((type): type is string => Boolean(type)),
        );
        return Array.from(set).sort();
    }, [jobs]);

    const locationOptions = useMemo(() => {
        const set = new Set(
            jobs
                .map((job) => job.location)
                .filter((loc): loc is string => Boolean(loc)),
        );
        return Array.from(set).sort();
    }, [jobs]);

    const normalizeSalaryValue = (value: unknown): number | null => {
        if (value === null || value === undefined) {
            return null;
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        const parsed = Number.parseFloat(String(value));
        return Number.isFinite(parsed) ? parsed : null;
    };

    const formatSalary = (job: CommunityJob): string => {
        const min = normalizeSalaryValue(job.salary_min);
        const max = normalizeSalaryValue(job.salary_max);
        const currency =
            job.salary_currency ??
            community.app_currency?.symbol ??
            community.app_currency?.code ??
            '₱';

        if (min === null && max === null) {
            return 'Negotiable';
        }

        if (min !== null && max !== null) {
            if (min === max) {
                return `${currency}${min.toLocaleString()}`;
            }
            return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
        }

        const value = (min ?? max) as number;
        return `${currency}${value.toLocaleString()}`;
    };

    const formatDate = (date?: string | null): string => {
        if (!date) {
            return '';
        }
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) {
            return '';
        }
        return parsed.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch =
                !searchQuery ||
                job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                job.job_category
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchesEmployment =
                employmentFilter === 'all' ||
                job.employment_type === employmentFilter;
            const matchesLocation =
                locationFilter === 'all' || job.location === locationFilter;

            return matchesSearch && matchesEmployment && matchesLocation;
        });
    }, [jobs, searchQuery, employmentFilter, locationFilter]);

    return (
        <CustomerLayout
            auth={auth}
            title={`${community.name} Jobs`}
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Job Opportunities
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Roles published by {community.name}
                        </p>
                    </div>
                    <Button asChild variant="outline" className="hidden sm:inline-flex">
                        <Link
                            href={route('customer.communities.show', {
                                community:
                                    community.slug ?? community.identifier ?? community.id,
                            })}
                        >
                            &larr; Back
                        </Link>
                    </Button>
                </div>
            }
            sidebarSections={sidebarSections}
            sidebarSectionTitle={community.name}
        >
            <Head title={`${community.name} Jobs`} />

            <Card className="border border-gray-200 shadow-sm dark:border-gray-700">
                <CardHeader className="space-y-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Listings ({filteredJobs.length})
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        Browse and apply to open positions. Filter by employment
                        type or location to narrow down the results.
                    </CardDescription>
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            type="text"
                            placeholder="Search title, category, or location..."
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        />
                        <select
                            value={employmentFilter}
                            onChange={(event) =>
                                setEmploymentFilter(event.target.value)
                            }
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        >
                            <option value="all">All Employment Types</option>
                            {employmentOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <select
                            value={locationFilter}
                            onChange={(event) =>
                                setLocationFilter(event.target.value)
                            }
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        >
                            <option value="all">All Locations</option>
                            {locationOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredJobs.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Role
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Type
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Location
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Salary
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Deadline
                                    </TableHead>
                                    <TableHead className="text-right text-gray-900 dark:text-white">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map((job) => (
                                    <TableRow
                                        key={job.id ?? job.title}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/70"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="font-semibold">
                                                {job.title ?? 'Untitled role'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {job.job_category ?? 'General'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {job.employment_type ?? 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {job.location ?? 'Remote / TBD'}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatSalary(job)}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatDate(job.application_deadline) ||
                                                'Open until filled'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={route('jobs.public.job', {
                                                    id: job.id,
                                                    client:
                                                        community.identifier ??
                                                        community.slug ??
                                                        community.id,
                                                })}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                View Details
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-8 text-center text-sm text-gray-600 dark:text-gray-400">
                            No job postings match your filters. Try adjusting
                            your search.
                        </div>
                    )}
                </CardContent>
            </Card>
        </CustomerLayout>
    );
}
