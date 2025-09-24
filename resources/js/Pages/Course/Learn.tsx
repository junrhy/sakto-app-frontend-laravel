import ContactSelector from '@/Components/ContactSelector';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import {
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle,
    Circle,
    Download,
    FileText,
    Play,
    User,
    Video,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
            <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <div ref={iframeRef} className="h-full w-full" />
            </div>
        );
    },
);

interface Lesson {
    id: number;
    title: string;
    description: string;
    content: string;
    video_url?: string;
    duration_minutes?: number;
    order: number;
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage?: number;
    time_watched_seconds?: number;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail_url?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    is_free: boolean;
    price?: number;
    currency: string;
    duration_minutes?: number;
    lessons_count: number;
    enrolled_count: number;
    instructor_name?: string;
    category?: string;
}

interface Progress {
    enrollment_id: number;
    course_id: number;
    progress_percentage: number;
    lessons_completed: number;
    total_lessons: number;
    current_lesson_id?: number;
    enrollment_status: string;
    payment_status: string;
}

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    call_number?: string;
    sms_number?: string;
    whatsapp?: string;
    address?: string;
    group?: string[];
    wallet_balance?: number;
}

interface Props {
    auth: any;
    course: Course;
    progress?: Progress;
    flash?: any;
    viewingContact?: Contact | null;
}

export default function Learn({
    auth,
    course,
    progress,
    flash,
    viewingContact,
}: Props) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentProgress, setCurrentProgress] = useState<Progress | null>(
        progress || null,
    );
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);
    const [videoProgress, setVideoProgress] = useState<{
        [lessonId: number]: number;
    }>({});
    const [videoWatched, setVideoWatched] = useState<{
        [lessonId: number]: boolean;
    }>({});

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        fetchLessons();
    }, [viewingContact]);

    // Check enrollment status when viewingContact changes or on initial load
    useEffect(() => {
        if (viewingContact) {
            checkEnrollmentStatus(viewingContact);
        } else {
            setIsEnrolled(false);
            setCurrentProgress(null);
        }
    }, [viewingContact]);

    // Initial enrollment check when page loads with viewingContact
    useEffect(() => {
        if (viewingContact && !isCheckingEnrollment) {
            checkEnrollmentStatus(viewingContact);
        }
    }, []); // Empty dependency array means this runs once on mount

    const fetchLessons = async () => {
        try {
            setLoading(true);

            // Build the API URL with contact_id if available
            let apiUrl = `/courses/${course.id}/lessons/api`;
            if (viewingContact) {
                apiUrl += `?contact_id=${viewingContact.id}`;
            }

            const response = await axios.get(apiUrl);
            const lessonsData = response.data.data || [];

            // Sort lessons by order
            const sortedLessons = lessonsData.sort(
                (a: Lesson, b: Lesson) => a.order - b.order,
            );
            setLessons(sortedLessons);

            // Set first lesson as current if no current lesson
            if (sortedLessons.length > 0 && !currentLesson) {
                setCurrentLesson(sortedLessons[0]);
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
            toast.error('Failed to fetch lessons');
        } finally {
            setLoading(false);
        }
    };

    const handleLessonClick = (lesson: Lesson) => {
        setCurrentLesson(lesson);
    };

    const markLessonAsStarted = async (lessonId: number) => {
        if (!isEnrolled) {
            toast.error(
                'Contact is not enrolled in this course. Please enroll first.',
            );
            return;
        }

        if (!currentProgress?.enrollment_id) {
            toast.error('Enrollment data not available. Please try again.');
            return;
        }

        try {
            const response = await axios.post(
                `/course-enrollments/${currentProgress.enrollment_id}/progress/${lessonId}/start`,
            );

            if (response.data.message) {
                toast.success(response.data.message);
            }

            // Update lesson status locally
            setLessons((prev) =>
                prev.map((lesson) =>
                    lesson.id === lessonId
                        ? { ...lesson, status: 'in_progress' as const }
                        : lesson,
                ),
            );

            // Update current lesson status if it's the one being marked as started
            if (currentLesson?.id === lessonId) {
                setCurrentLesson((prev) =>
                    prev ? { ...prev, status: 'in_progress' as const } : null,
                );
            }
        } catch (error) {
            console.error('Error marking lesson as started:', error);
            toast.error('Failed to mark lesson as started');
        }
    };

    const markLessonAsCompleted = async (lessonId: number) => {
        if (!isEnrolled) {
            toast.error(
                'Contact is not enrolled in this course. Please enroll first.',
            );
            return;
        }

        if (!currentProgress?.enrollment_id) {
            toast.error('Enrollment data not available. Please try again.');
            return;
        }

        try {
            const response = await axios.post(
                `/course-enrollments/${currentProgress.enrollment_id}/progress/${lessonId}/complete`,
            );

            if (response.data.message) {
                toast.success(response.data.message);
            }

            // Update lesson status locally
            setLessons((prev) =>
                prev.map((lesson) =>
                    lesson.id === lessonId
                        ? { ...lesson, status: 'completed' as const }
                        : lesson,
                ),
            );

            // Update current lesson status if it's the one being marked as completed
            if (currentLesson?.id === lessonId) {
                setCurrentLesson((prev) =>
                    prev ? { ...prev, status: 'completed' as const } : null,
                );
            }

            // Refresh progress data to get updated enrollment status and certificate data
            if (viewingContact) {
                await checkEnrollmentStatus(viewingContact);
            }

            // Check if course is now completed and show success message
            const completedLessons =
                lessons.filter((l) => l.status === 'completed').length + 1;
            const newProgressPercentage = Math.round(
                (completedLessons / lessons.length) * 100,
            );

            if (newProgressPercentage >= 100) {
                toast.success(
                    'Congratulations! You have completed the course. You can now download your certificate.',
                );
            }
        } catch (error) {
            console.error('Error marking lesson as completed:', error);
            toast.error('Failed to mark lesson as completed');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-800';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLessonIcon = (lesson: Lesson) => {
        if (lesson.video_url) {
            return <Video className="h-4 w-4" />;
        }
        return <FileText className="h-4 w-4" />;
    };

    const getLessonStatusIcon = (lesson: Lesson) => {
        switch (lesson.status) {
            case 'completed':
                return (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                );
            case 'in_progress':
                return (
                    <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                );
            default:
                return (
                    <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                );
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

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
                console.log('YouTube video ID extracted:', videoId); // Debug log
                return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&enablejsapi=1`;
            }
        }

        console.log('Could not extract YouTube video ID from URL:', videoUrl); // Debug log
        return null;
    };

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

    const checkEnrollmentStatus = async (contact: Contact) => {
        setIsCheckingEnrollment(true);
        try {
            const response = await fetch(
                `/courses/${course.id}/check-enrollment`,
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
            console.log('Enrollment check response:', data); // Debug log

            // Handle the actual response structure
            if (data.data && typeof data.data.is_enrolled === 'boolean') {
                setIsEnrolled(data.data.is_enrolled);

                // If enrolled, fetch the enrollment data to get enrollment_id
                if (data.data.is_enrolled && data.data.enrollment) {
                    setCurrentProgress({
                        enrollment_id: data.data.enrollment.id,
                        course_id: course.id,
                        progress_percentage:
                            data.data.enrollment.progress_percentage || 0,
                        lessons_completed:
                            data.data.enrollment.lessons_completed || 0,
                        total_lessons: lessons.length,
                        enrollment_status: data.data.enrollment.status,
                        payment_status: data.data.enrollment.payment_status,
                    });
                }
            } else {
                console.error(
                    'Failed to check enrollment status:',
                    data.message || 'Invalid response format',
                );
                setIsEnrolled(false);
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            setIsEnrolled(false);
        } finally {
            setIsCheckingEnrollment(false);
        }
    };

    const handleContactSelect = (contact: Contact) => {
        // Navigate to the same page but with the selected contact
        router.visit(`/courses/${course.id}/learn?contact_id=${contact.id}`);
    };

    const handleDownloadCertificate = async () => {
        if (!currentProgress?.enrollment_id) {
            toast.error('Enrollment data not available. Please try again.');
            return;
        }

        try {
            toast.loading('Preparing certificate...');

            // First try to get existing certificate data
            let response = await axios.get(
                `/course-enrollments/${currentProgress.enrollment_id}/certificate/get`,
            );

            // If certificate doesn't exist, generate it
            if (!response.data.success && response.status === 400) {
                toast.loading('Generating certificate...');
                response = await axios.get(
                    `/course-enrollments/${currentProgress.enrollment_id}/certificate`,
                );
            }

            if (response.data.success) {
                const { html, filename } = response.data.data;

                // Create a temporary container for the certificate HTML
                const container = document.createElement('div');
                container.innerHTML = html;
                document.body.appendChild(container);

                // Configure PDF options
                const opt = {
                    margin: [0.3, 0.3, 0.3, 0.3],
                    filename: filename,
                    html2canvas: {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        useCORS: true,
                        logging: false,
                    },
                    jsPDF: {
                        unit: 'in',
                        format: 'letter',
                        orientation: 'portrait' as const,
                        compress: true,
                    },
                };

                // Generate and download PDF
                await html2pdf().set(opt).from(container).save();

                // Clean up
                document.body.removeChild(container);

                toast.success('Certificate downloaded successfully!');
            } else {
                toast.error(
                    response.data.message || 'Failed to generate certificate',
                );
            }
        } catch (error) {
            console.error('Error downloading certificate:', error);
            toast.error('Failed to download certificate. Please try again.');
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Learning
                    </h2>
                }
            >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Loading course content...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Selector Modal */}
                <ContactSelector
                    isOpen={showContactSelector}
                    onClose={() => setShowContactSelector(false)}
                    onSelect={handleContactSelect}
                    title="Select Member to View As"
                />
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Learning: {course.title}
                </h2>
            }
        >
            <Head title={`Learning - ${course.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {viewingContact ? (
                        <div className="mb-6">
                            <div
                                className={`rounded-md border p-4 ${
                                    isEnrolled
                                        ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                                        : 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User
                                            className={`h-5 w-5 ${
                                                isEnrolled
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-orange-600 dark:text-orange-400'
                                            }`}
                                        />
                                        <div>
                                            <div
                                                className={`font-medium ${
                                                    isEnrolled
                                                        ? 'text-blue-900 dark:text-blue-100'
                                                        : 'text-orange-900 dark:text-orange-100'
                                                }`}
                                            >
                                                Viewing as{' '}
                                                {viewingContact.first_name}{' '}
                                                {viewingContact.last_name}
                                            </div>
                                            <div
                                                className={`text-sm ${
                                                    isEnrolled
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-orange-700 dark:text-orange-300'
                                                }`}
                                            >
                                                {isCheckingEnrollment ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                                                        Checking enrollment...
                                                    </div>
                                                ) : isEnrolled ? (
                                                    viewingContact.email
                                                ) : (
                                                    'Not enrolled in this course'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isEnrolled &&
                                            !isCheckingEnrollment && (
                                                <Link
                                                    href={`/courses/${course.id}?contact_id=${viewingContact.id}`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                                    >
                                                        Enroll Contact
                                                    </Button>
                                                </Link>
                                            )}
                                        {isEnrolled &&
                                            !isCheckingEnrollment && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    className="cursor-not-allowed border-green-300 bg-green-50 text-green-600 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
                                                >
                                                    Already Enrolled
                                                </Button>
                                            )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setShowContactSelector(true)
                                            }
                                        >
                                            Change Contact
                                        </Button>
                                        <Link href="/courses">
                                            <Button variant="outline" size="sm">
                                                View as Admin
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        <div>
                                            <div className="font-medium text-yellow-900 dark:text-yellow-100">
                                                No contact selected
                                            </div>
                                            <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                                Select a contact to track lesson
                                                progress
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setShowContactSelector(true)
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        Select Contact
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <Link
                            href={`/courses/${course.id}${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                        >
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Course
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-gray-400">
                                        {course.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {currentLesson ? (
                                        <div>
                                            <div className="mb-6">
                                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                    {currentLesson.title}
                                                </h3>
                                                <p className="mb-4 text-gray-600 dark:text-gray-400">
                                                    {currentLesson.description}
                                                </p>

                                                <div className="mb-4 flex items-center gap-4">
                                                    {getLessonIcon(
                                                        currentLesson,
                                                    )}
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatDuration(
                                                            currentLesson.duration_minutes,
                                                        )}
                                                    </span>
                                                    <Badge
                                                        className={getDifficultyColor(
                                                            course.difficulty,
                                                        )}
                                                    >
                                                        {course.difficulty}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {currentLesson.video_url && (
                                                <div className="mb-6">
                                                    {(() => {
                                                        console.log(
                                                            'Processing video URL:',
                                                            currentLesson.video_url,
                                                        ); // Debug log
                                                        const embedUrl =
                                                            getYouTubeEmbedUrl(
                                                                currentLesson.video_url,
                                                            );
                                                        console.log(
                                                            'Generated embed URL:',
                                                            embedUrl,
                                                        ); // Debug log

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
                                                                        currentLesson
                                                                            .id
                                                                    ] !==
                                                                        undefined && (
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
                                                                            <Progress
                                                                                value={
                                                                                    videoProgress[
                                                                                        currentLesson
                                                                                            .id
                                                                                    ]
                                                                                }
                                                                                className="h-2"
                                                                            />
                                                                            {videoWatched[
                                                                                currentLesson
                                                                                    .id
                                                                            ] && (
                                                                                <div className="mt-2 text-center">
                                                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                                                        Video
                                                                                        Watched
                                                                                    </Badge>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                                                    <div className="text-center">
                                                                        <Video className="mx-auto mb-2 h-16 w-16 text-gray-400 dark:text-gray-500" />
                                                                        <p className="text-gray-600 dark:text-gray-400">
                                                                            Invalid
                                                                            video
                                                                            URL
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                                                                            {
                                                                                currentLesson.video_url
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    })()}

                                                    <div className="mt-4 flex justify-center gap-2">
                                                        <Button
                                                            onClick={() =>
                                                                markLessonAsStarted(
                                                                    currentLesson.id,
                                                                )
                                                            }
                                                            disabled={
                                                                !viewingContact ||
                                                                !isEnrolled ||
                                                                isCheckingEnrollment ||
                                                                currentLesson.status ===
                                                                    'in_progress' ||
                                                                currentLesson.status ===
                                                                    'completed'
                                                            }
                                                        >
                                                            <Play className="mr-2 h-4 w-4" />
                                                            {currentLesson.status ===
                                                            'not_started'
                                                                ? 'Mark as Started'
                                                                : currentLesson.status ===
                                                                    'in_progress'
                                                                  ? 'Video In Progress'
                                                                  : currentLesson.status ===
                                                                      'completed'
                                                                    ? 'Video Completed'
                                                                    : 'Mark as Started'}
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                window.open(
                                                                    currentLesson.video_url,
                                                                    '_blank',
                                                                )
                                                            }
                                                        >
                                                            <Video className="mr-2 h-4 w-4" />
                                                            Open in YouTube
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="prose mb-6 max-w-none">
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: currentLesson.content,
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between border-t pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        markLessonAsStarted(
                                                            currentLesson.id,
                                                        )
                                                    }
                                                    disabled={
                                                        !viewingContact ||
                                                        !isEnrolled ||
                                                        isCheckingEnrollment ||
                                                        currentLesson.status ===
                                                            'in_progress' ||
                                                        currentLesson.status ===
                                                            'completed'
                                                    }
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    {currentLesson.status ===
                                                    'not_started'
                                                        ? 'Mark as Started'
                                                        : currentLesson.status ===
                                                            'in_progress'
                                                          ? 'In Progress'
                                                          : currentLesson.status ===
                                                              'completed'
                                                            ? 'Completed'
                                                            : 'Mark as Started'}
                                                </Button>

                                                <Button
                                                    onClick={() =>
                                                        markLessonAsCompleted(
                                                            currentLesson.id,
                                                        )
                                                    }
                                                    disabled={
                                                        currentLesson.status ===
                                                            'completed' ||
                                                        !viewingContact ||
                                                        !isEnrolled ||
                                                        isCheckingEnrollment ||
                                                        currentLesson.status ===
                                                            'not_started' ||
                                                        (!!currentLesson.video_url &&
                                                            !videoWatched[
                                                                currentLesson.id
                                                            ])
                                                    }
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    {(() => {
                                                        if (
                                                            currentLesson.status ===
                                                            'completed'
                                                        ) {
                                                            return 'Completed';
                                                        } else if (
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
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                                No lessons available
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                This course doesn't have any
                                                lessons yet.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-gray-100">
                                        Course Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {currentProgress && (
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Progress
                                                </span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {
                                                        currentProgress.progress_percentage
                                                    }
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    currentProgress.progress_percentage
                                                }
                                                className="mb-4"
                                            />
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {
                                                    currentProgress.lessons_completed
                                                }{' '}
                                                of{' '}
                                                {currentProgress.total_lessons}{' '}
                                                lessons completed
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t pt-4 dark:border-gray-700">
                                        <h4 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                                            Lessons
                                        </h4>
                                        <div className="space-y-2">
                                            {lessons.map((lesson) => (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() =>
                                                        handleLessonClick(
                                                            lesson,
                                                        )
                                                    }
                                                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                                                        currentLesson?.id ===
                                                        lesson.id
                                                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {getLessonStatusIcon(
                                                            lesson,
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {lesson.title}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {formatDuration(
                                                                    lesson.duration_minutes,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {currentProgress?.progress_percentage ===
                                        100 && (
                                        <div className="border-t pt-4 dark:border-gray-700">
                                            <div className="text-center">
                                                <Award className="mx-auto mb-2 h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                                                <h4 className="font-medium text-green-600 dark:text-green-400">
                                                    Course Completed!
                                                </h4>
                                                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                    Congratulations on
                                                    completing this course!
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={
                                                        handleDownloadCertificate
                                                    }
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Certificate
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Selector Modal */}
            <ContactSelector
                isOpen={showContactSelector}
                onClose={() => setShowContactSelector(false)}
                onSelect={handleContactSelect}
                title="Select Member to View As"
            />
        </AuthenticatedLayout>
    );
}
