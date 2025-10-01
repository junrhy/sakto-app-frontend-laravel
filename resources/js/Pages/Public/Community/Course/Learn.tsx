import { useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Circle,
    Clock,
    FileText,
    Menu,
    Play,
    Video,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// YouTube Video Player Component with Progress Tracking
const YouTubeVideoPlayer = React.memo(
    ({
        videoUrl,
        title,
        lessonId,
        onProgress,
    }: {
        videoUrl: string;
        title: string;
        lessonId: number;
        onProgress: (
            lessonId: number,
            currentTime: number,
            duration: number,
        ) => void;
    }) => {
        const iframeRef = React.useRef<HTMLIFrameElement>(null);
        const [player, setPlayer] = useState<any>(null);
        const [isReady, setIsReady] = useState(false);
        const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
            // Load YouTube API if not already loaded
            if (!(window as any).YT) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag =
                    document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            }

            // Initialize YouTube player when API is ready
            const initializePlayer = () => {
                const videoId = getYouTubeVideoId(videoUrl);
                if (videoId && iframeRef.current && (window as any).YT) {
                    const newPlayer = new (window as any).YT.Player(
                        iframeRef.current,
                        {
                            height: '100%',
                            width: '100%',
                            videoId: videoId,
                            playerVars: {
                                rel: 0,
                                modestbranding: 1,
                                showinfo: 0,
                                enablejsapi: 1,
                                origin: window.location.origin,
                            },
                            events: {
                                onReady: () => {
                                    setIsReady(true);
                                    setPlayer(newPlayer);
                                },
                                onStateChange: (event: any) => {
                                    // Clear any existing interval
                                    if (progressIntervalRef.current) {
                                        clearInterval(
                                            progressIntervalRef.current,
                                        );
                                        progressIntervalRef.current = null;
                                    }

                                    // Track progress when video is playing
                                    if (
                                        event.data ===
                                        (window as any).YT.PlayerState.PLAYING
                                    ) {
                                        progressIntervalRef.current =
                                            setInterval(() => {
                                                if (
                                                    newPlayer &&
                                                    newPlayer.getCurrentTime &&
                                                    newPlayer.getDuration
                                                ) {
                                                    const currentTime =
                                                        newPlayer.getCurrentTime();
                                                    const duration =
                                                        newPlayer.getDuration();
                                                    if (
                                                        currentTime > 0 &&
                                                        duration > 0
                                                    ) {
                                                        onProgress(
                                                            lessonId,
                                                            currentTime,
                                                            duration,
                                                        );
                                                    }
                                                }
                                            }, 2000); // Update every 2 seconds to reduce re-renders
                                    }
                                },
                            },
                        },
                    );
                }
            };

            // Check if API is already ready
            if ((window as any).YT && (window as any).YT.Player) {
                initializePlayer();
            } else {
                // Wait for API to be ready
                (window as any).onYouTubeIframeAPIReady = initializePlayer;
            }

            return () => {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                }
                if (player) {
                    player.destroy();
                }
            };
        }, [videoUrl, lessonId]); // Remove onProgress from dependencies to prevent re-renders

        const getYouTubeVideoId = (url: string) => {
            const patterns = [
                /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
                /youtu\.be\/([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    return match[1];
                }
            }
            return null;
        };

        return (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <div ref={iframeRef} className="h-full w-full" />
            </div>
        );
    },
);

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
    image_url?: string;
    lessons_count?: number;
    duration_minutes?: number;
    difficulty?: string;
    status?: string;
    is_free?: boolean;
    price?: string;
    currency?: string;
    instructor_name?: string;
    category?: string;
    lessons?: Lesson[];
    enrollments?: Enrollment[];
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

interface Progress {
    id: number;
    course_id: number;
    contact_id: string;
    student_name: string;
    student_email: string;
    student_phone?: string;
    status: string;
    payment_status: string;
    amount_paid: string;
    payment_method?: string;
    payment_reference?: string;
    enrolled_at: string;
    completed_at?: string;
    expires_at?: string;
    progress_percentage: number;
    lessons_completed: number;
    certificate_data?: any;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    course?: Course;
    lesson_progress?: any[];
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
    payment_method: string | null;
    payment_reference: string | null;
    enrolled_at: string;
    completed_at: string | null;
    expires_at: string | null;
    progress_percentage: number;
    lessons_completed: number;
    certificate_data: any | null;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    member: Member;
    course: Course;
    progress?: Progress;
    viewingContact?: Contact;
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string;
    phpVersion: string;
    appUrl: string;
}

export default function Learn({
    member,
    course,
    progress,
    viewingContact,
    canLogin,
    canRegister,
    laravelVersion,
    phpVersion,
    appUrl,
}: Props) {
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoProgress, setVideoProgress] = useState<{
        [lessonId: number]: number;
    }>({});
    const [videoWatched, setVideoWatched] = useState<{
        [lessonId: number]: boolean;
    }>({});
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get theme for dark mode support
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Get lesson_id from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('lesson_id');

    useEffect(() => {
        // Use lessons from course data and merge with progress data
        if (course.lessons) {
            const lessonsWithProgress = course.lessons.map((lesson: any) => {
                // Find lesson progress for this lesson
                const lessonProgress = progress?.lesson_progress?.find(
                    (lp: any) => lp.lesson_id === lesson.id,
                );

                return {
                    ...lesson,
                    is_completed: lessonProgress?.status === 'completed',
                    is_accessible: true, // All lessons are accessible if enrolled
                };
            });

            setLessons(lessonsWithProgress);

            // Set current lesson
            if (lessonId) {
                const lesson = lessonsWithProgress.find(
                    (l: Lesson) => l.id.toString() === lessonId,
                );
                if (lesson) {
                    setCurrentLesson(lesson);
                    // Mark lesson as started if contact is viewing and lesson is not completed
                    if (viewingContact && !lesson.is_completed && progress) {
                        markLessonAsStarted(lesson.id);
                    }
                }
            } else if (lessonsWithProgress.length > 0) {
                setCurrentLesson(lessonsWithProgress[0]);
                // Mark first lesson as started if contact is viewing and lesson is not completed
                if (
                    viewingContact &&
                    !lessonsWithProgress[0].is_completed &&
                    progress
                ) {
                    markLessonAsStarted(lessonsWithProgress[0].id);
                }
            }

            setLoading(false);
        }
    }, [course, progress, lessonId, viewingContact]);

    // Check enrollment status when viewingContact changes
    useEffect(() => {
        if (viewingContact) {
            checkEnrollmentStatus(viewingContact);
        }
    }, [viewingContact]);

    const handleVideoProgress = React.useCallback(
        (lessonId: number, currentTime: number, duration: number) => {
            const progress = (currentTime / duration) * 100;
            setVideoProgress((prev) => ({ ...prev, [lessonId]: progress }));

            // Mark as watched if 90% or more of the video has been viewed
            if (progress >= 90) {
                setVideoWatched((prev) => ({ ...prev, [lessonId]: true }));
            }
        },
        [],
    );

    const getYouTubeEmbedUrl = (videoUrl: string) => {
        // Extract video ID from various YouTube URL formats
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        ];

        for (const pattern of patterns) {
            const match = videoUrl.match(pattern);
            if (match) {
                const videoId = match[1];
                return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&enablejsapi=1`;
            }
        }

        return null;
        return null;
    };

    const checkEnrollmentStatus = async (contact: Contact) => {
        try {
            const response = await fetch(
                `${appUrl}/m/${member.slug}/courses/${course.id}/check-enrollment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        contact_id: contact.id.toString(),
                    }),
                },
            );

            const data = await response.json();

            // Handle the actual response structure
            if (data.data && typeof data.data.is_enrolled === 'boolean') {
                setIsEnrolled(data.data.is_enrolled);

                if (data.data.is_enrolled && data.data.enrollment) {
                    // Store enrollment data
                    setEnrollment(data.data.enrollment);

                    // Update lessons to reflect enrollment status
                    setLessons((prev) =>
                        prev.map((lesson) => ({
                            ...lesson,
                            is_accessible: true,
                        })),
                    );
                } else {
                    // Clear enrollment data if not enrolled
                    setEnrollment(null);

                    // If not enrolled, mark lessons as not accessible
                    setLessons((prev) =>
                        prev.map((lesson) => ({
                            ...lesson,
                            is_accessible: false,
                        })),
                    );
                }
            } else {
                console.error(
                    'Failed to check enrollment status:',
                    data.message || 'Invalid response format',
                );
                setIsEnrolled(false);
                setEnrollment(null);
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            setIsEnrolled(false);
            setEnrollment(null);
        }
    };

    const markLessonAsStarted = async (lessonId: number) => {
        if (!viewingContact || !progress) return;

        try {
            // Mark lesson as started using the enrollment ID from progress
            const response = await fetch(
                `${appUrl}/m/${member.slug}/courses/enrollments/${progress.id}/progress/${lessonId}/start`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                // Lesson marked as started successfully
            } else {
                console.error(
                    'Failed to mark lesson as started:',
                    response.statusText,
                );
            }
        } catch (error) {
            console.error('Failed to mark lesson as started:', error);
        }
    };

    const handleLessonComplete = async () => {
        if (!currentLesson || !viewingContact || !progress) return;

        try {
            // Mark lesson as completed using the enrollment ID from progress
            const response = await fetch(
                `${appUrl}/m/${member.slug}/courses/enrollments/${progress.id}/progress/${currentLesson.id}/complete`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                // Update local state
                setLessons((prev) =>
                    prev.map((lesson) =>
                        lesson.id === currentLesson.id
                            ? { ...lesson, is_completed: true }
                            : lesson,
                    ),
                );

                // Update current lesson status
                setCurrentLesson((prev) =>
                    prev ? { ...prev, is_completed: true } : null,
                );

                // Move to next lesson
                const currentIndex = lessons.findIndex(
                    (l) => l.id === currentLesson.id,
                );
                if (currentIndex < lessons.length - 1) {
                    const nextLesson = lessons[currentIndex + 1];
                    setCurrentLesson(nextLesson);
                    router.visit(
                        `/m/${member.slug}/courses/${course.id}/learn?lesson_id=${nextLesson.id}${viewingContact ? `&contact_id=${viewingContact.id}` : ''}`,
                    );
                }
            } else {
                console.error(
                    'Failed to mark lesson as complete:',
                    response.statusText,
                );
            }
        } catch (error) {
            console.error('Failed to mark lesson as complete:', error);
        }
    };

    const formatDuration = (minutes: number | undefined | null) => {
        if (!minutes || isNaN(minutes)) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const getLessonIcon = (lesson: Lesson) => {
        if (lesson.video_url) {
            return <Video className="h-4 w-4" />;
        }
        return <FileText className="h-4 w-4" />;
    };

    const getLessonStatusIcon = (lesson: Lesson) => {
        if (lesson.is_completed) {
            return (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            );
        } else if (lesson.is_accessible) {
            return (
                <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            );
        } else {
            return (
                <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            );
        }
    };

    const formatContactName = (contact: Contact) => {
        const parts = [contact.first_name];
        if (contact.middle_name) {
            parts.push(contact.middle_name);
        }
        parts.push(contact.last_name);
        return parts.join(' ');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        Loading lesson...
                    </p>
                </div>
            </div>
        );
    }

    if (!currentLesson) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
                <div className="max-w-md text-center">
                    <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        No lesson found
                    </h2>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                        This lesson is not available or doesn't exist.
                    </p>
                    <Link
                        href={`/m/${member.slug}/courses/${course.id}/lessons${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        Back to Lessons
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={`${currentLesson.title} - ${course.title}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href={`/m/${member.slug}/courses/${course.id}/lessons${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hidden text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 sm:flex"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Back to Lessons
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

                            {/* Simple Enrollment Status */}
                            {viewingContact && (
                                <div className="flex items-center">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            progress
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}
                                    >
                                        {progress ? 'Enrolled' : 'Not Enrolled'}
                                    </span>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <div className="flex items-center lg:hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    {sidebarOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                        {/* Main Content */}
                        <div className="order-2 lg:order-1 lg:col-span-2">
                            {/* Video Player */}
                            {currentLesson.video_url && (
                                <div className="mb-4 sm:mb-6">
                                    {(() => {
                                        const embedUrl = getYouTubeEmbedUrl(
                                            currentLesson.video_url,
                                        );

                                        if (embedUrl) {
                                            return (
                                                <div>
                                                    <YouTubeVideoPlayer
                                                        videoUrl={
                                                            currentLesson.video_url
                                                        }
                                                        title={
                                                            currentLesson.title
                                                        }
                                                        lessonId={
                                                            currentLesson.id
                                                        }
                                                        onProgress={
                                                            handleVideoProgress
                                                        }
                                                    />

                                                    {/* Video Progress Indicator */}
                                                    {videoProgress[
                                                        currentLesson.id
                                                    ] !== undefined && (
                                                        <div className="mt-3">
                                                            <div className="mb-1 flex items-center justify-between">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Video
                                                                    Progress
                                                                </span>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {Math.round(
                                                                        videoProgress[
                                                                            currentLesson
                                                                                .id
                                                                        ],
                                                                    )}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <div
                                                                    className="h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                                                                    style={{
                                                                        width: `${videoProgress[currentLesson.id]}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            {videoWatched[
                                                                currentLesson.id
                                                            ] && (
                                                                <div className="mt-2 text-center">
                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                                        Video
                                                                        Watched
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                                    <div className="p-4 text-center">
                                                        <Video className="mx-auto mb-2 h-12 w-12 text-gray-400 dark:text-gray-500 sm:h-16 sm:w-16" />
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                            Invalid video URL
                                                        </p>
                                                        <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-500">
                                                            {
                                                                currentLesson.video_url
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            )}

                            {/* Lesson Content */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h1 className="pr-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                                        {currentLesson.title}
                                    </h1>
                                    {currentLesson.is_completed && (
                                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 dark:text-green-400 sm:h-6 sm:w-6" />
                                    )}
                                </div>

                                <div className="mb-4 flex flex-col space-y-2 text-sm text-gray-500 dark:text-gray-400 sm:mb-6 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                                    <div className="flex items-center">
                                        <Clock className="mr-1 h-4 w-4" />
                                        {formatDuration(
                                            currentLesson.duration_minutes,
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="mr-1 h-4 w-4" />
                                        Lesson {currentLesson.order_index}
                                    </div>
                                </div>

                                <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base">
                                    {currentLesson.content ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: currentLesson.content,
                                            }}
                                        />
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {currentLesson.description}
                                        </p>
                                    )}
                                </div>

                                {/* Complete Lesson Button */}
                                {viewingContact && (
                                    <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700 sm:mt-8 sm:pt-6">
                                        {!progress ? (
                                            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-center dark:border-yellow-700 dark:bg-yellow-900/20 sm:p-4">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-300 sm:text-base">
                                                    You need to enroll in this
                                                    course to track your
                                                    progress.
                                                </p>
                                            </div>
                                        ) : currentLesson.is_completed ? (
                                            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center dark:border-green-700 dark:bg-green-900/20 sm:p-4">
                                                <CheckCircle className="mx-auto mb-2 h-5 w-5 text-green-600 dark:text-green-400 sm:h-6 sm:w-6" />
                                                <p className="text-sm font-medium text-green-800 dark:text-green-300 sm:text-base">
                                                    Lesson Completed!
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleLessonComplete}
                                                disabled={
                                                    !!currentLesson.video_url &&
                                                    !videoWatched[
                                                        currentLesson.id
                                                    ]
                                                }
                                                className={`inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:w-auto sm:px-6 sm:py-3 sm:text-base ${
                                                    !!currentLesson.video_url &&
                                                    !videoWatched[
                                                        currentLesson.id
                                                    ]
                                                        ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                                                        : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600'
                                                }`}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                {(() => {
                                                    if (
                                                        currentLesson.video_url &&
                                                        !videoWatched[
                                                            currentLesson.id
                                                        ]
                                                    ) {
                                                        return 'Watch Video First';
                                                    } else {
                                                        return 'Mark as Complete';
                                                    }
                                                })()}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div
                            className={`order-1 lg:order-2 lg:col-span-1 ${
                                sidebarOpen
                                    ? 'fixed inset-y-0 right-0 z-50 w-full bg-white shadow-lg dark:bg-gray-800 lg:relative lg:w-auto lg:bg-transparent lg:shadow-none'
                                    : 'hidden lg:block'
                            }`}
                        >
                            <div
                                className={`${sidebarOpen ? 'h-full overflow-y-auto p-4' : ''}`}
                            >
                                {/* Mobile Close Button */}
                                {sidebarOpen && (
                                    <div className="mb-4 flex justify-end lg:hidden">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }
                                            className="p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}

                                {/* Course Info */}
                                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mb-6 sm:p-6">
                                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                        Course Progress
                                    </h3>

                                    {/* Progress Display */}
                                    <div className="mb-4">
                                        <div className="mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>Overall Progress</span>
                                            <span>
                                                {progress
                                                    ? Math.round(
                                                          progress.progress_percentage ||
                                                              0,
                                                      )
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className="h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                                                style={{
                                                    width: `${Math.min(progress?.progress_percentage || 0, 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span>Course:</span>
                                            <span className="max-w-[60%] text-right font-medium">
                                                {course.title}
                                            </span>
                                        </div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span>Total Lessons:</span>
                                            <span>
                                                {course.lessons_count || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Duration:</span>
                                            <span>
                                                {formatDuration(
                                                    course.duration_minutes,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                            Course Content
                                        </h3>
                                    </div>

                                    <div className="max-h-64 divide-y divide-gray-200 overflow-y-auto dark:divide-gray-700 sm:max-h-96 lg:max-h-96">
                                        {lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`cursor-pointer p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:p-4 ${
                                                    lesson.id ===
                                                    currentLesson.id
                                                        ? 'border-l-4 border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                                                        : ''
                                                } ${!lesson.is_accessible ? 'opacity-60' : ''}`}
                                                onClick={() => {
                                                    if (lesson.is_accessible) {
                                                        setCurrentLesson(
                                                            lesson,
                                                        );
                                                        setSidebarOpen(false); // Close sidebar on mobile
                                                        router.visit(
                                                            `/m/${member.slug}/courses/${course.id}/learn?lesson_id=${lesson.id}${viewingContact ? `&contact_id=${viewingContact.id}` : ''}`,
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {getLessonStatusIcon(
                                                            lesson,
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={`truncate text-sm font-medium ${
                                                                lesson.id ===
                                                                currentLesson.id
                                                                    ? 'text-blue-700 dark:text-blue-300'
                                                                    : 'text-gray-900 dark:text-white'
                                                            }`}
                                                        >
                                                            {lesson.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDuration(
                                                                lesson.duration_minutes,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile overlay for sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </>
    );
}
