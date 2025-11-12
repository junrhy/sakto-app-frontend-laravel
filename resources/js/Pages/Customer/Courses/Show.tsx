import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';
import { useMemo } from 'react';

interface Course {
    id: number | string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    difficulty?: string;
    status?: string;
    is_featured?: boolean;
    is_free?: boolean;
    price?: number | string | null;
    currency?: string | null;
    duration_minutes?: number | null;
    lessons_count?: number | null;
    enrolled_count?: number | null;
    instructor_name?: string | null;
    instructor_bio?: string | null;
    tags?: string[] | null;
    requirements?: string[] | null;
    learning_outcomes?: string[] | null;
    category?: string | null;
}

interface CourseProgress {
    id: number;
    status?: string;
    progress_percentage?: number;
    lessons_completed?: number;
}

interface Props extends PageProps {
    community: {
        id: number;
        name: string;
        slug?: string | null;
        identifier?: string | null;
        project_identifier?: string | null;
        app_currency?: {
            symbol?: string;
            decimal_separator?: string;
            thousands_separator?: string;
        } | null;
    };
    course: Course;
    progress?: CourseProgress | null;
    isEnrolled: boolean;
    project?: string;
}

const formatDuration = (minutes?: number | null): string => {
    if (!minutes || minutes <= 0) {
        return 'N/A';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }

    return `${mins}m`;
};

export default function CourseShow({
    auth,
    community,
    course,
    progress,
    isEnrolled,
    project,
}: Props) {
    const ownerIdentifier =
        community.slug || community.identifier || community.id;
    const projectIdentifier =
        project ?? community.project_identifier ?? 'community';

    const lessonsUrl = route('customer.projects.courses.lessons', {
        project: projectIdentifier,
        owner: ownerIdentifier,
        course: course.id,
    });

    const learnUrl = route('customer.projects.courses.learn', {
        project: projectIdentifier,
        owner: ownerIdentifier,
        course: course.id,
    });

    const priceLabel = useMemo(() => {
        if (course.is_free) {
            return 'Free';
        }

        const symbol = community.app_currency?.symbol ?? '₱';
        const decimalSeparator =
            community.app_currency?.decimal_separator ?? '.';
        const thousandsSeparator =
            community.app_currency?.thousands_separator ?? ',';

        const priceValue =
            typeof course.price === 'string'
                ? Number.parseFloat(course.price)
                : Number(course.price);

        if (Number.isNaN(priceValue)) {
            return `${symbol}0${decimalSeparator}00`;
        }

        const [whole, fraction = '00'] = priceValue.toFixed(2).split('.');
        const formattedWhole = whole.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            thousandsSeparator,
        );

        return `${symbol}${formattedWhole}${decimalSeparator}${fraction}`;
    }, [course.price, course.is_free, community.app_currency]);

    const sidebarSections = useMemo(
        () => [
            { id: 'details', label: 'Overview' },
            { id: 'lessons', label: 'Lessons' },
            { id: 'learn', label: 'Start Learning' },
        ],
        [],
    );

    const difficultyBadge = (difficulty?: string) => {
        if (!difficulty) {
            return null;
        }

        const tone = difficulty.toLowerCase();

        const palette =
            tone === 'beginner'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : tone === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : tone === 'advanced'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        return (
            <Badge className={palette}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </Badge>
        );
    };

    return (
        <CustomerLayout
            auth={auth}
            title="Course Details"
            sidebarSections={sidebarSections}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Course Details
                    </h2>
                    <Link
                        href={route(
                            'customer.communities.show',
                            ownerIdentifier,
                        )}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        &larr; Back to Community
                    </Link>
                </div>
            }
        >
            <Head title={`${course.title} • ${community.name}`} />

            <div className="space-y-6">
                <Card className="overflow-hidden border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="gap-4 sm:flex sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex"
                            >
                                <Link
                                    href={route(
                                        'customer.communities.show',
                                        ownerIdentifier,
                                    )}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Communities
                                </Link>
                            </Button>
                            <div>
                                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {course.title}
                                </CardTitle>
                                <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {course.description}
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {difficultyBadge(course.difficulty)}
                            {course.is_featured && (
                                <Badge variant="secondary">Featured</Badge>
                            )}
                            {course.category && (
                                <Badge variant="outline">
                                    {course.category}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {course.lessons_count ?? '—'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Lessons
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatDuration(course.duration_minutes)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Duration
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {course.enrolled_count ?? 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Students
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {priceLabel}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Pricing
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                    isEnrolled
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                }`}
                            >
                                {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                            </span>
                            {progress?.status && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Status: {progress.status.replace('_', ' ')}
                                </span>
                            )}
                            {progress?.progress_percentage !== undefined && (
                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                    Progress:{' '}
                                    {Math.round(progress.progress_percentage)}%
                                </span>
                            )}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                                        Course Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                    {course.learning_outcomes &&
                                    course.learning_outcomes.length > 0 ? (
                                        <ul className="list-inside list-disc space-y-2">
                                            {course.learning_outcomes.map(
                                                (item, index) => (
                                                    <li key={index}>{item}</li>
                                                ),
                                            )}
                                        </ul>
                                    ) : (
                                        <p>
                                            Explore each lesson to see what this
                                            course has to offer.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                                        Instructor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                                            {(
                                                course.instructor_name ||
                                                'Instructor'
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {course.instructor_name ||
                                                    'Instructor'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Course facilitator
                                            </p>
                                        </div>
                                    </div>
                                    {course.instructor_bio && (
                                        <p>{course.instructor_bio}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {course.requirements &&
                            course.requirements.length > 0 && (
                                <Card className="border border-gray-200 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                                            Requirements
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        <ul className="list-inside list-disc space-y-1">
                                            {course.requirements.map(
                                                (item, index) => (
                                                    <li key={index}>{item}</li>
                                                ),
                                            )}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                        {course.tags && course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {course.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Button
                        asChild
                        size="lg"
                        className="flex items-center justify-center gap-2"
                    >
                        <Link href={lessonsUrl}>
                            <BookOpen className="h-5 w-5" />
                            View Lessons
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="flex items-center justify-center gap-2"
                    >
                        <Link href={learnUrl}>
                            <Play className="h-5 w-5" />
                            Start Learning
                        </Link>
                    </Button>
                </div>
            </div>
        </CustomerLayout>
    );
}
