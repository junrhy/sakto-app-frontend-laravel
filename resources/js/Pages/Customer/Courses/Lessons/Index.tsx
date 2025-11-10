import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    Play,
    ShieldCheck,
} from 'lucide-react';
import { useMemo } from 'react';

interface Lesson {
    id: number | string;
    title: string;
    description?: string;
    duration_minutes?: number | null;
    order_index?: number | null;
    is_completed?: boolean;
    is_accessible?: boolean;
    progress?: {
        status?: string;
        completion_percentage?: number;
    } | null;
}

interface Course {
    id: number | string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    lessons_count?: number | null;
    duration_minutes?: number | null;
}

interface CourseProgress {
    id: number;
    status?: string;
    progress_percentage?: number;
    lessons_completed?: number;
    lesson_progress?: Array<{
        lesson_id: number;
        status: string;
        completion_percentage?: number;
    }>;
}

interface Props extends PageProps {
    community: {
        id: number;
        name: string;
        slug?: string | null;
        identifier?: string | null;
        project_identifier?: string | null;
    };
    course: Course;
    lessons: Lesson[];
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

const formatProgressPercentage = (value?: number | null): string => {
    if (value === undefined || value === null) {
        return '0%';
    }

    return `${Math.round(value)}%`;
};

export default function LessonsIndex({
    auth,
    community,
    course,
    lessons,
    progress,
    isEnrolled,
    project,
}: Props) {
    const ownerIdentifier = community.slug || community.identifier || community.id;
    const projectIdentifier =
        project ?? community.project_identifier ?? 'community';

    const backToCourseUrl = route('customer.projects.courses.show', {
        project: projectIdentifier,
        owner: ownerIdentifier,
        course: course.id,
    });

    const learnRouteBase = route('customer.projects.courses.learn', {
        project: projectIdentifier,
        owner: ownerIdentifier,
        course: course.id,
    });

    const sidebarSections = useMemo(
        () => [
            { id: 'overview', label: 'Overview' },
            { id: 'content', label: 'Course Content' },
        ],
        [],
    );

    const completedLessons =
        progress?.lessons_completed ??
        lessons.filter((lesson) => lesson.is_completed).length;

    const totalLessons = lessons.length;
    const progressPercentage =
        progress?.progress_percentage ??
        (totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0);

    return (
        <CustomerLayout
            auth={auth}
            title="Course Lessons"
            sidebarSections={sidebarSections}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Course Lessons
                    </h2>
                    <Link
                        href={backToCourseUrl}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        &larr; Back to Course
                    </Link>
                </div>
            }
        >
            <Head title={`${course.title} • Lessons`} />

            <div className="space-y-6">
                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                            {course.title}
                        </CardTitle>
                        {course.description && (
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                {course.description}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {course.lessons_count ?? lessons.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Lessons
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                                {formatDuration(course.duration_minutes)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Duration
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                                {completedLessons}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Lessons Completed
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
                                {formatProgressPercentage(progressPercentage)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Overall Progress
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Course Content
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            Track your progress as you complete each lesson.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lessons.map((lesson, index) => {
                            const lessonLearnUrl = `${learnRouteBase}?lesson_id=${lesson.id}`;
                            const completionLabel =
                                lesson.progress?.status === 'completed' ||
                                lesson.is_completed
                                    ? 'Completed'
                                    : lesson.progress?.status === 'started'
                                      ? 'In Progress'
                                      : isEnrolled
                                        ? 'Not Started'
                                        : 'Locked';

                            return (
                                <div
                                    key={lesson.id}
                                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex flex-1 items-start gap-3">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                                            {lesson.is_completed ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <BookOpen className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {index + 1}.
                                                </span>
                                                <span className="truncate">
                                                    {lesson.title}
                                                </span>
                                            </div>
                                            {lesson.description && (
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                    {lesson.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDuration(
                                                        lesson.duration_minutes,
                                                    )}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    {completionLabel}
                                                </span>
                                                {lesson.progress?.completion_percentage &&
                                                    lesson.progress
                                                        .completion_percentage > 0 && (
                                                        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300">
                                                            {formatProgressPercentage(
                                                                lesson.progress
                                                                    .completion_percentage,
                                                            )}
                                                            complete
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {isEnrolled ? (
                                            <Button
                                                asChild
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Link href={lessonLearnUrl}>
                                                    <Play className="h-4 w-4" />
                                                    {lesson.is_completed
                                                        ? 'Review'
                                                        : 'Start'}
                                                </Link>
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Enroll to access
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}


