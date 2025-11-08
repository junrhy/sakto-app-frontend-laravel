import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    DollarSign,
    MapPin,
    Send,
} from 'lucide-react';

interface Job {
    id: number;
    title: string;
    description: string;
    requirements?: string;
    location?: string;
    employment_type?: string;
    job_category?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    application_deadline?: string;
    application_url?: string;
    application_email?: string;
    is_featured: boolean;
    created_at: string;
    job_board?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface JobBoard {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    job: Job;
    jobBoard?: JobBoard;
    clientIdentifier?: string;
    canLogin?: boolean;
    canRegister?: boolean;
}

export default function Job({
    job,
    jobBoard,
    clientIdentifier,
    canLogin,
    canRegister,
}: Props) {
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

    const isDeadlinePassed =
        job.application_deadline &&
        new Date(job.application_deadline) < new Date();

    return (
        <GuestLayout>
            <Head title={`${job.title} - Job Details`} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg dark:border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <Link
                                href={
                                    jobBoard
                                        ? clientIdentifier
                                            ? `${route('jobs.public.board', jobBoard.slug)}?client=${encodeURIComponent(clientIdentifier)}`
                                            : route(
                                                  'jobs.public.board',
                                                  jobBoard.slug,
                                              )
                                        : route('jobs.public')
                                }
                                className="flex items-center text-white/90 transition-colors hover:text-white"
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                <span className="font-medium">
                                    Back to Jobs
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Card className="border-0 bg-white/90 shadow-2xl backdrop-blur-sm dark:bg-gray-800/90">
                        <CardContent className="p-8">
                            <div className="mb-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-4 flex items-center space-x-3">
                                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                                {job.title}
                                            </h1>
                                            {job.is_featured && (
                                                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-sm font-semibold text-white shadow-lg">
                                                    ⭐ Featured
                                                </span>
                                            )}
                                        </div>
                                        {jobBoard && (
                                            <p className="mb-6 text-base text-gray-600 dark:text-gray-400">
                                                Posted in:{' '}
                                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {jobBoard.name}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {job.location && (
                                        <div className="flex items-center space-x-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {job.location}
                                            </span>
                                        </div>
                                    )}
                                    {job.employment_type && (
                                        <div className="flex items-center space-x-3 rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                                            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                                                {job.employment_type.replace(
                                                    '-',
                                                    ' ',
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {formatSalary(
                                                job.salary_min,
                                                job.salary_max,
                                                job.salary_currency,
                                            )}
                                        </span>
                                    </div>
                                    {job.application_deadline && (
                                        <div
                                            className={`flex items-center space-x-3 rounded-lg border px-4 py-3 ${
                                                isDeadlinePassed
                                                    ? 'border-red-100 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                                    : 'border-orange-100 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                                            }`}
                                        >
                                            <Calendar
                                                className={`h-5 w-5 ${isDeadlinePassed ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}
                                            />
                                            <span
                                                className={`font-medium ${isDeadlinePassed ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}
                                            >
                                                {formatDate(
                                                    job.application_deadline,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
                                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                                    <div className="mr-3 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                                    Job Description
                                </h2>
                                <div
                                    className="prose prose-lg max-w-none leading-relaxed text-gray-700 dark:text-gray-300"
                                    dangerouslySetInnerHTML={{
                                        __html: job.description.replace(
                                            /\n/g,
                                            '<br />',
                                        ),
                                    }}
                                />
                            </div>

                            {job.requirements && (
                                <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                                    <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                                        <div className="mr-3 h-1 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                                        Requirements
                                    </h2>
                                    <div
                                        className="prose prose-lg max-w-none leading-relaxed text-gray-700 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{
                                            __html: job.requirements.replace(
                                                /\n/g,
                                                '<br />',
                                            ),
                                        }}
                                    />
                                </div>
                            )}

                            {job.job_category && (
                                <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                        {job.job_category}
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                                {!isDeadlinePassed && (
                                    <Link
                                        href={
                                            clientIdentifier
                                                ? `${route('jobs.public.apply', job.id)}?client=${encodeURIComponent(clientIdentifier)}`
                                                : route(
                                                      'jobs.public.apply',
                                                      job.id,
                                                  )
                                        }
                                        className="flex-1"
                                    >
                                        <Button
                                            className="h-14 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl"
                                            size="lg"
                                        >
                                            <Send className="mr-2 h-5 w-5" />
                                            Apply Now
                                        </Button>
                                    </Link>
                                )}
                                {isDeadlinePassed && (
                                    <div className="flex-1">
                                        <Button
                                            className="h-14 w-full cursor-not-allowed bg-gray-400 text-white"
                                            size="lg"
                                            disabled
                                        >
                                            Application Deadline Passed
                                        </Button>
                                    </div>
                                )}
                                {job.application_url && (
                                    <a
                                        href={job.application_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="outline"
                                            className="h-14 w-full border-2 border-indigo-300 text-lg font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                            size="lg"
                                        >
                                            Apply via External Link
                                        </Button>
                                    </a>
                                )}
                            </div>

                            {job.application_email && (
                                <div className="mt-4 text-center text-sm text-gray-600">
                                    Or email your application to:{' '}
                                    <a
                                        href={`mailto:${job.application_email}?subject=Application for ${job.title}`}
                                        className="font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        {job.application_email}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </GuestLayout>
    );
}
