import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Menu,
    Play,
    Video,
    X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Lesson {
    id: number | string;
    title: string;
    description?: string;
    duration_minutes?: number | null;
    order_index?: number | null;
    content?: string | null;
    video_url?: string | null;
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
    currentLesson: Lesson | null;
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

const buildLessonUrl = (
    base: string,
    lessonId: number | string,
    additionalQuery?: Record<string, string>,
): string => {
    const url = new URL(base, window.location.origin);
    url.searchParams.set('lesson_id', String(lessonId));

    if (additionalQuery) {
        Object.entries(additionalQuery).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    return url.pathname + url.search;
};

export default function CourseLearn({
    auth,
    community,
    course,
    lessons,
    currentLesson,
    progress,
    isEnrolled,
    project,
}: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [completing, setCompleting] = useState(false);

    const ownerIdentifier = community.slug || community.identifier || community.id;
    const projectIdentifier =
        project ?? community.project_identifier ?? 'community';

    const lessonsUrl = route('customer.projects.courses.lessons', {
        project: projectIdentifier,
        owner: ownerIdentifier,
        course: course.id,
    });

    const learnBaseUrl = route('customer.projects.courses.learn', {
        project: projectIdentifier,
        owner: ownerIdentifier,
        course: course.id,
    });

    const markCompleteRoute = progress
        ? route('customer.projects.courses.progress.complete', {
              project: projectIdentifier,
              owner: ownerIdentifier,
              enrollment: progress.id,
              lesson: currentLesson?.id ?? 0,
          })
        : null;

    const sidebarSections = useMemo(
        () => [
            { id: 'lesson', label: 'Lesson' },
            { id: 'contents', label: 'All Lessons' },
        ],
        [],
    );

    const csrfToken =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';

    const embedUrl = useMemo(() => {
        if (!currentLesson?.video_url) {
            return null;
        }

        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        ];

        for (const pattern of patterns) {
            const match = currentLesson.video_url.match(pattern);
            if (match) {
                return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&showinfo=0`;
            }
        }

        return null;
    }, [currentLesson?.video_url]);

    const handleMarkComplete = useCallback(async () => {
        if (!markCompleteRoute || !currentLesson || !progress) {
            return;
        }

        try {
            setCompleting(true);
            const response = await fetch(markCompleteRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!response.ok) {
                throw new Error('Request failed');
            }

            toast.success('Lesson marked as complete');
            router.reload({
                only: ['course', 'lessons', 'currentLesson', 'progress', 'isEnrolled'],
            });
        } catch (error) {
            toast.error('Unable to mark lesson as complete right now.');
        } finally {
            setCompleting(false);
        }
    }, [csrfToken, markCompleteRoute, currentLesson, progress]);

    return (
        <CustomerLayout
            auth={auth}
            title="Lesson Viewer"
            sidebarSections={sidebarSections}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Lesson Viewer
                    </h2>
                    <Link
                        href={lessonsUrl}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        &larr; Back to Lessons
                    </Link>
                </div>
            }
        >
            <Head title={`${currentLesson?.title ?? 'Lesson'} • ${course.title}`} />

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                                {currentLesson?.title ?? 'Lesson'}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                {course.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currentLesson?.video_url && (
                                <div className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                                    {embedUrl ? (
                                        <iframe
                                            src={embedUrl}
                                            title={currentLesson.title}
                                            className="h-64 w-full sm:h-80"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="flex h-64 w-full items-center justify-center text-gray-500 dark:text-gray-400">
                                            <div className="text-center">
                                                <Video className="mx-auto mb-2 h-10 w-10" />
                                                <p>Video preview unavailable</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatDuration(currentLesson?.duration_minutes)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    Lesson{' '}
                                    {currentLesson?.order_index
                                        ? `#${currentLesson.order_index}`
                                        : 'overview'}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {currentLesson?.is_completed
                                        ? 'Completed'
                                        : 'In Progress'}
                                </span>
                            </div>

                            <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base">
                                {currentLesson?.content ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: currentLesson.content,
                                        }}
                                    />
                                ) : currentLesson?.description ? (
                                    <p>{currentLesson.description}</p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Course content will appear here.
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                {isEnrolled ? (
                                    <Button
                                        onClick={handleMarkComplete}
                                        disabled={
                                            completing ||
                                            currentLesson?.is_completed ||
                                            !progress
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {currentLesson?.is_completed
                                            ? 'Lesson Completed'
                                            : completing
                                              ? 'Marking...'
                                              : 'Mark as Complete'}
                                    </Button>
                                ) : (
                                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
                                        Enroll in this course to track your lesson
                                        progress.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                                Course Progress
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setSidebarOpen((prev) => !prev)}
                            >
                                {sidebarOpen ? (
                                    <X className="h-4 w-4" />
                                ) : (
                                    <Menu className="h-4 w-4" />
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Overall Progress</span>
                                    <span>
                                        {formatProgressPercentage(
                                            progress?.progress_percentage,
                                        )}
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className="h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                                        style={{
                                            width: `${Math.min(
                                                progress?.progress_percentage ?? 0,
                                                100,
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center justify-between">
                                    <span>Status</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {progress?.status
                                            ? progress.status.replace('_', ' ')
                                            : 'Not enrolled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Lessons Completed</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {progress?.lessons_completed ?? 0} of{' '}
                                        {lessons.length}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`border border-gray-200 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 ${
                            sidebarOpen ? 'block' : 'hidden lg:block'
                        }`}
                    >
                        <CardHeader>
                            <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                                Course Content
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Track and switch lessons from the list below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {lessons.map((lesson) => {
                                const lessonUrl = buildLessonUrl(
                                    learnBaseUrl,
                                    lesson.id,
                                );

                                const isActive =
                                    currentLesson &&
                                    String(currentLesson.id) === String(lesson.id);

                                return (
                                    <Link
                                        key={lesson.id}
                                        href={lessonUrl}
                                        preserveScroll
                                        className={`block rounded-md border px-3 py-2 text-sm transition-colors ${
                                            isActive
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200'
                                                : 'border-transparent text-gray-700 hover:border-blue-200 hover:bg-blue-50 dark:text-gray-300 dark:hover:border-blue-600 dark:hover:bg-blue-900/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="truncate">
                                                {lesson.title}
                                            </span>
                                            {lesson.is_completed && (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {formatDuration(lesson.duration_minutes)}
                                        </div>
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}

function formatProgressPercentage(value?: number | null): string {
    if (value === undefined || value === null) {
        return '0%';
    }

    return `${Math.round(value)}%`;
}


