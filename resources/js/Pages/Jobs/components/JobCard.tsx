import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    CheckCircle,
    Edit,
    Eye,
    MoreHorizontal,
    Trash2,
    XCircle,
} from 'lucide-react';
import JobStatusBadge from './JobStatusBadge';

interface Job {
    id: number;
    title: string;
    description: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency: string;
    location?: string;
    employment_type?: string;
    job_category?: string;
    status: 'draft' | 'published' | 'closed';
    is_featured: boolean;
    views_count: number;
    applications_count: number;
    created_at: string;
}

interface JobCardProps {
    job: Job;
    onDelete: (id: number) => void;
    onPublish: (id: number) => void;
    onClose: (id: number) => void;
}

export default function JobCard({
    job,
    onDelete,
    onPublish,
    onClose,
}: JobCardProps) {
    const formatSalary = () => {
        if (!job.salary_min && !job.salary_max) {
            return 'Salary not specified';
        }
        if (job.salary_min && job.salary_max) {
            return `${formatCurrency(job.salary_min, job.salary_currency)} - ${formatCurrency(job.salary_max, job.salary_currency)}`;
        }
        if (job.salary_min) {
            return `From ${formatCurrency(job.salary_min, job.salary_currency)}`;
        }
        if (job.salary_max) {
            return `Up to ${formatCurrency(job.salary_max, job.salary_currency)}`;
        }
        return 'Salary not specified';
    };

    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                {job.title}
                            </CardTitle>
                            {job.is_featured && (
                                <Badge
                                    variant="default"
                                    className="bg-yellow-500"
                                >
                                    Featured
                                </Badge>
                            )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            {job.location && (
                                <span className="flex items-center">
                                    📍 {job.location}
                                </span>
                            )}
                            {job.employment_type && (
                                <span className="flex items-center">
                                    💼 {job.employment_type}
                                </span>
                            )}
                            {job.job_category && (
                                <span className="flex items-center">
                                    🏷️ {job.job_category}
                                </span>
                            )}
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={route('jobs.editJob', job.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            {job.status === 'draft' && (
                                <DropdownMenuItem
                                    onClick={() => onPublish(job.id)}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Publish
                                </DropdownMenuItem>
                            )}
                            {job.status === 'published' && (
                                <DropdownMenuItem
                                    onClick={() => onClose(job.id)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Close
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => onDelete(job.id)}
                                className="text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                        {job.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formatSalary()}
                            </p>
                            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                                <span className="flex items-center">
                                    <Eye className="mr-1 h-3 w-3" />
                                    {job.views_count} views
                                </span>
                                <span className="flex items-center">
                                    📥 {job.applications_count} applications
                                </span>
                            </div>
                        </div>
                        <JobStatusBadge status={job.status} />
                    </div>

                    <Link href={route('jobs.editJob', job.id)}>
                        <Button size="sm" variant="outline" className="w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Job
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
