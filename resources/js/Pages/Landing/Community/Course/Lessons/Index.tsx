import { useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Clock,
    FileText,
    Lock,
    Play,
    Video,
} from 'lucide-react';

interface Lesson {
    id: number;
    title: string;
    description?: string;
    order_index: number;
    duration_minutes?: number;
    video_url?: string;
    content?: string;
    type?: string;
    is_free_preview?: boolean;
    is_completed?: boolean;
    is_accessible?: boolean;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail_url?: string;
    lessons_count?: number;
    duration_minutes?: number;
    difficulty?: string;
    status?: string;
    is_free?: boolean;
    price?: string;
    currency?: string;
    instructor_name?: string;
    category?: string;
}

interface Member {
    id: number;
    name: string;
    email: string;
    slug: string;
    identifier: string;
}

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    gender: string;
    date_of_birth: string;
    call_number: string;
    sms_number: string;
    address: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface LessonProgress {
    id: number;
    course_enrollment_id: number;
    lesson_id: number;
    status: string;
    time_watched_seconds: number;
    completion_percentage: number;
    started_at: string;
    completed_at: string;
    quiz_answers: any;
    quiz_score: any;
    notes: any;
    created_at: string;
    updated_at: string;
}

interface Enrollment {
    id: number;
    course_id: number;
    contact_id: string;
    student_name: string;
    student_email: string;
    student_phone: string;
    status: string;
    payment_status: string;
    amount_paid: string;
    payment_method: any;
    payment_reference: any;
    enrolled_at: string;
    completed_at: any;
    expires_at: any;
    progress_percentage: number;
    lessons_completed: number;
    certificate_data: any;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    course: any;
    lesson_progress: LessonProgress[];
}

// Progress is actually an Enrollment object directly
type Progress = Enrollment;

interface Props {
    member: Member;
    course: Course;
    lessons: Lesson[];
    progress?: Progress;
    viewingContact?: Contact;
}

export default function LessonsIndex({
    member,
    course,
    lessons,
    progress,
    viewingContact,
}: Props) {
    // Check if user is enrolled
    const isEnrolled = !!progress;

    // Get theme for dark mode support
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Create a map of lesson progress for quick lookup
    const lessonProgressMap = new Map();
    if (progress?.lesson_progress) {
        progress.lesson_progress.forEach((lp: any) => {
            lessonProgressMap.set(lp.lesson_id, lp);
        });
    }

    // Update lessons with progress data
    const lessonsWithProgress = lessons.map((lesson) => {
        const lessonProgress = lessonProgressMap.get(lesson.id);
        return {
            ...lesson,
            is_completed:
                lessonProgress?.status === 'completed' ||
                lesson.is_completed ||
                false,
            is_accessible:
                lesson.is_accessible ||
                lessonProgress?.status === 'completed' ||
                false,
            progress: lessonProgress,
        };
    });

    // Calculate progress based on enrollment data
    const completedLessons =
        progress?.lessons_completed ||
        lessonsWithProgress.filter((lesson) => lesson.is_completed).length;
    const progressPercentage =
        progress?.progress_percentage ||
        (lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0);

    const formatDuration = (minutes: number | undefined | null) => {
        if (!minutes || isNaN(minutes)) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatContactName = (contact: Contact) => {
        const parts = [contact.first_name];
        if (contact.middle_name) {
            parts.push(contact.middle_name);
        }
        parts.push(contact.last_name);
        return parts.join(' ');
    };

    const getLessonIcon = (lesson: Lesson) => {
        if (lesson.video_url) {
            return <Video className="h-4 w-4" />;
        }
        return <FileText className="h-4 w-4" />;
    };

    const getLessonStatusIcon = (lesson: any) => {
        if (lesson.is_completed) {
            return (
                <CheckCircle className="h-5 w-5 text-green-500 sm:h-6 sm:w-6" />
            );
        } else if (lesson.progress?.status === 'started') {
            return (
                <div className="relative">
                    <Play className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
                    <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500 sm:h-3 sm:w-3"></div>
                </div>
            );
        } else if (isEnrolled) {
            return <Play className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />;
        } else {
            return <Lock className="h-5 w-5 text-gray-400 sm:h-6 sm:w-6" />;
        }
    };

    return (
        <>
            <Head title={`${course.title} - Lessons`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href={`/m/${member.slug}/courses/${course.id}${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hidden text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 sm:flex"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Back to Course
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 sm:hidden"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Status Badges */}
                            {viewingContact && (
                                <div className="flex items-center gap-2">
                                    {/* Enrollment Status */}
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            isEnrolled
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}
                                    >
                                        {isEnrolled
                                            ? 'Enrolled'
                                            : 'Not Enrolled'}
                                    </span>

                                    {/* Progress Status */}
                                    {progress && (
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                progress.status === 'completed'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : progress.status ===
                                                        'in_progress'
                                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {progress.status === 'completed'
                                                ? 'Completed'
                                                : progress.status ===
                                                    'in_progress'
                                                  ? 'In Progress'
                                                  : progress.status ||
                                                    'Enrolled'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
                    {/* Course Header */}
                    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mb-6 sm:p-6">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="h-16 w-16 rounded-lg object-cover"
                                            onError={(e) => {
                                                const target =
                                                    e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback =
                                                    target.nextElementSibling as HTMLElement;
                                                if (fallback) {
                                                    fallback.style.display =
                                                        'flex';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-base font-bold text-white ${course.thumbnail_url ? 'hidden' : ''}`}
                                        style={{
                                            display: course.thumbnail_url
                                                ? 'none'
                                                : 'flex',
                                        }}
                                    >
                                        {course.title.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="mb-1 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                                        {course.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <BookOpen className="mr-1 h-3 w-3" />
                                            {course.lessons_count ||
                                                lessons.length}{' '}
                                            lessons
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {formatDuration(
                                                course.duration_minutes,
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                                {course.description}
                            </p>

                            {/* Progress Bar - Mobile */}
                            <div className="mb-4">
                                <div className="mb-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                    <span>Progress</span>
                                    <span>
                                        {completedLessons}/{lessons.length}
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            isEnrolled
                                                ? 'bg-blue-600 dark:bg-blue-500'
                                                : 'bg-gray-400 dark:bg-gray-600'
                                        }`}
                                        style={{
                                            width: `${progressPercentage}%`,
                                        }}
                                    />
                                </div>
                                {progress && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col gap-1">
                                            <span>
                                                Overall:{' '}
                                                {progress.progress_percentage ||
                                                    0}
                                                %
                                            </span>
                                            <span>
                                                Completed:{' '}
                                                {progress.lessons_completed ||
                                                    0}{' '}
                                                lessons
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden gap-6 sm:flex sm:flex-row sm:items-start">
                            <div className="flex-shrink-0">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="h-20 w-20 rounded-lg object-cover lg:h-24 lg:w-24"
                                        onError={(e) => {
                                            const target =
                                                e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback =
                                                target.nextElementSibling as HTMLElement;
                                            if (fallback) {
                                                fallback.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : null}
                                <div
                                    className={`flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white lg:h-24 lg:w-24 lg:text-xl ${course.thumbnail_url ? 'hidden' : ''}`}
                                    style={{
                                        display: course.thumbnail_url
                                            ? 'none'
                                            : 'flex',
                                    }}
                                >
                                    {course.title.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">
                                    {course.title}
                                </h1>
                                <p className="mb-4 text-base text-gray-600 dark:text-gray-300">
                                    {course.description}
                                </p>

                                {/* Progress Bar - Desktop */}
                                <div className="mb-4">
                                    <div className="mb-2 flex flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Progress</span>
                                        <span>
                                            {completedLessons} of{' '}
                                            {lessons.length} lessons completed
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                isEnrolled
                                                    ? 'bg-blue-600 dark:bg-blue-500'
                                                    : 'bg-gray-400 dark:bg-gray-600'
                                            }`}
                                            style={{
                                                width: `${progressPercentage}%`,
                                            }}
                                        />
                                    </div>
                                    {progress && (
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-row items-center gap-2">
                                                <span>
                                                    Overall progress:{' '}
                                                    {progress.progress_percentage ||
                                                        0}
                                                    %
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    Lessons completed:{' '}
                                                    {progress.lessons_completed ||
                                                        0}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    Status:{' '}
                                                    {progress.status ||
                                                        'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Course Stats - Desktop */}
                                <div className="flex flex-row items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <BookOpen className="mr-1 h-4 w-4" />
                                        {course.lessons_count ||
                                            lessons.length}{' '}
                                        lessons
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-1 h-4 w-4" />
                                        {formatDuration(
                                            course.duration_minutes,
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                Course Content
                            </h2>
                        </div>

                        {!isEnrolled && (
                            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-500 dark:bg-yellow-900/20 sm:p-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Lock className="h-4 w-4 text-yellow-400 dark:text-yellow-500 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            <strong>
                                                Enrollment Required:
                                            </strong>{' '}
                                            You need to enroll in this course to
                                            access the lessons.
                                        </p>
                                        <div className="mt-2">
                                            <Link
                                                href={`/m/${member.slug}/courses/${course.id}${
                                                    viewingContact
                                                        ? `?contact_id=${viewingContact.id}`
                                                        : ''
                                                }`}
                                                className="inline-flex items-center rounded-md border border-transparent bg-yellow-100 px-3 py-2 text-sm font-medium leading-4 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50 dark:focus:ring-offset-gray-800"
                                            >
                                                View Course Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {lessonsWithProgress.map((lesson, index) => (
                                <div
                                    key={lesson.id}
                                    className={`p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:p-4 lg:p-6 ${
                                        !isEnrolled ? 'opacity-60' : ''
                                    }`}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                        <div className="flex items-start space-x-3 sm:space-x-4">
                                            <div className="mt-1 flex-shrink-0">
                                                {getLessonStatusIcon(lesson)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3
                                                    className={`text-sm font-medium sm:text-base lg:text-lg ${
                                                        lesson.is_completed
                                                            ? 'text-green-700 dark:text-green-400'
                                                            : 'text-gray-900 dark:text-white'
                                                    }`}
                                                >
                                                    {index + 1}. {lesson.title}
                                                </h3>
                                                {lesson.description && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300 sm:line-clamp-none sm:text-sm lg:text-base">
                                                        {lesson.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:gap-4 sm:text-sm">
                                                    <div className="flex items-center">
                                                        {getLessonIcon(lesson)}
                                                        <span className="ml-1">
                                                            {formatDuration(
                                                                lesson.duration_minutes,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {lesson.is_completed && (
                                                        <span className="flex items-center font-medium text-green-600 dark:text-green-400">
                                                            <CheckCircle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                                            Completed
                                                        </span>
                                                    )}
                                                    {lesson.progress && (
                                                        <>
                                                            {lesson.progress
                                                                .completion_percentage >
                                                                0 &&
                                                                lesson.progress
                                                                    .completion_percentage <
                                                                    100 && (
                                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                                        {
                                                                            lesson
                                                                                .progress
                                                                                .completion_percentage
                                                                        }
                                                                        %
                                                                        complete
                                                                    </span>
                                                                )}
                                                            {lesson.progress
                                                                .status ===
                                                                'started' && (
                                                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                                                    In Progress
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    {!isEnrolled && (
                                                        <span className="flex items-center font-medium text-gray-500 dark:text-gray-400">
                                                            <Lock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                                            Locked
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            {isEnrolled ? (
                                                <Link
                                                    href={`/m/${member.slug}/courses/${course.id}/learn?lesson_id=${lesson.id}${
                                                        viewingContact
                                                            ? `&contact_id=${viewingContact.id}`
                                                            : ''
                                                    }`}
                                                    className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800 sm:w-auto sm:px-4"
                                                >
                                                    {lesson.is_completed
                                                        ? 'Review'
                                                        : 'Learn'}
                                                </Link>
                                            ) : (
                                                <span className="block text-center text-xs text-gray-400 dark:text-gray-500 sm:text-left sm:text-sm">
                                                    Enroll to Access
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
