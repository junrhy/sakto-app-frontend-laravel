import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize, CheckCircle, Clock, BookOpen, Video, FileText, Circle } from 'lucide-react';

// YouTube Video Player Component with Progress Tracking
const YouTubeVideoPlayer = React.memo(({ 
    videoUrl, 
    title, 
    lessonId, 
    onProgress 
}: { 
    videoUrl: string; 
    title: string; 
    lessonId: number; 
    onProgress: (lessonId: number, currentTime: number, duration: number) => void; 
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
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        // Initialize YouTube player when API is ready
        const initializePlayer = () => {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId && iframeRef.current && (window as any).YT) {
                const newPlayer = new (window as any).YT.Player(iframeRef.current, {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        rel: 0,
                        modestbranding: 1,
                        showinfo: 0,
                        enablejsapi: 1,
                        origin: window.location.origin
                    },
                    events: {
                        onReady: () => {
                            setIsReady(true);
                            setPlayer(newPlayer);
                        },
                        onStateChange: (event: any) => {
                            // Clear any existing interval
                            if (progressIntervalRef.current) {
                                clearInterval(progressIntervalRef.current);
                                progressIntervalRef.current = null;
                            }

                            // Track progress when video is playing
                            if (event.data === (window as any).YT.PlayerState.PLAYING) {
                                progressIntervalRef.current = setInterval(() => {
                                    if (newPlayer && newPlayer.getCurrentTime && newPlayer.getDuration) {
                                        const currentTime = newPlayer.getCurrentTime();
                                        const duration = newPlayer.getDuration();
                                        if (currentTime > 0 && duration > 0) {
                                            onProgress(lessonId, currentTime, duration);
                                        }
                                    }
                                }, 2000); // Update every 2 seconds to reduce re-renders
                            }
                        }
                    }
                });
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
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
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
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div ref={iframeRef} className="w-full h-full" />
        </div>
    );
});

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
    appUrl 
}: Props) {
    // Debug logging
    console.log('Learn component props:', { member, course, progress, viewingContact });
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoProgress, setVideoProgress] = useState<{ [lessonId: number]: number }>({});
    const [videoWatched, setVideoWatched] = useState<{ [lessonId: number]: boolean }>({});
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // Get lesson_id from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('lesson_id');

    useEffect(() => {
        // Use lessons from course data and merge with progress data
        if (course.lessons) {
            const lessonsWithProgress = course.lessons.map((lesson: any) => {
                // Find lesson progress for this lesson
                const lessonProgress = progress?.lesson_progress?.find((lp: any) => lp.lesson_id === lesson.id);
                
                return {
                    ...lesson,
                    is_completed: lessonProgress?.status === 'completed',
                    is_accessible: true // All lessons are accessible if enrolled
                };
            });
            
            setLessons(lessonsWithProgress);
            
            // Set current lesson
            if (lessonId) {
                const lesson = lessonsWithProgress.find((l: Lesson) => l.id.toString() === lessonId);
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
                if (viewingContact && !lessonsWithProgress[0].is_completed && progress) {
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

    const handleVideoProgress = React.useCallback((lessonId: number, currentTime: number, duration: number) => {
        const progress = (currentTime / duration) * 100;
        setVideoProgress(prev => ({ ...prev, [lessonId]: progress }));
        
        // Mark as watched if 90% or more of the video has been viewed
        if (progress >= 90) {
            setVideoWatched(prev => ({ ...prev, [lessonId]: true }));
        }
    }, []);

    const getYouTubeEmbedUrl = (videoUrl: string) => {
        // Extract video ID from various YouTube URL formats
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
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

    const checkEnrollmentStatus = async (contact: Contact) => {
        try {
            const response = await fetch(`${appUrl}/m/${member.slug}/courses/${course.id}/check-enrollment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    contact_id: contact.id.toString(),
                }),
            });

            const data = await response.json();
            console.log('Enrollment check response:', data); // Debug log
            
            // Handle the actual response structure
            if (data.data && typeof data.data.is_enrolled === 'boolean') {
                setIsEnrolled(data.data.is_enrolled);
                
                if (data.data.is_enrolled && data.data.enrollment) {
                    // Store enrollment data
                    setEnrollment(data.data.enrollment);
                    
                    // Update lessons to reflect enrollment status
                    setLessons(prev => prev.map(lesson => ({
                        ...lesson,
                        is_accessible: true
                    })));
                } else {
                    // Clear enrollment data if not enrolled
                    setEnrollment(null);
                    
                    // If not enrolled, mark lessons as not accessible
                    setLessons(prev => prev.map(lesson => ({
                        ...lesson,
                        is_accessible: false
                    })));
                }
            } else {
                console.error('Failed to check enrollment status:', data.message || 'Invalid response format');
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
            const response = await fetch(`${appUrl}/m/${member.slug}/courses/enrollments/${progress.id}/progress/${lessonId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (response.ok) {
                console.log('Lesson marked as started successfully');
            } else {
                console.error('Failed to mark lesson as started:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to mark lesson as started:', error);
        }
    };

    const handleLessonComplete = async () => {
        if (!currentLesson || !viewingContact || !progress) return;

        try {
            // Mark lesson as completed using the enrollment ID from progress
            const response = await fetch(`${appUrl}/m/${member.slug}/courses/enrollments/${progress.id}/progress/${currentLesson.id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (response.ok) {
                // Update local state
                setLessons(prev => prev.map(lesson => 
                    lesson.id === currentLesson.id 
                        ? { ...lesson, is_completed: true }
                        : lesson
                ));
                
                // Update current lesson status
                setCurrentLesson(prev => prev ? { ...prev, is_completed: true } : null);
                
                // Move to next lesson
                const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                if (currentIndex < lessons.length - 1) {
                    const nextLesson = lessons[currentIndex + 1];
                    setCurrentLesson(nextLesson);
                    router.visit(`/m/${member.slug}/courses/${course.id}/learn?lesson_id=${nextLesson.id}${viewingContact ? `&contact_id=${viewingContact.id}` : ''}`);
                }
            } else {
                console.error('Failed to mark lesson as complete:', response.statusText);
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
            return <Video className="w-4 h-4" />;
        }
        return <FileText className="w-4 h-4" />;
    };

    const getLessonStatusIcon = (lesson: Lesson) => {
        if (lesson.is_completed) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lesson.is_accessible) {
            return <Play className="h-4 w-4 text-blue-600" />;
        } else {
            return <Circle className="h-4 w-4 text-gray-400" />;
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (!currentLesson) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No lesson found</h2>
                    <p className="text-gray-600 mb-4">This lesson is not available or doesn't exist.</p>
                    <Link
                        href={`/m/${member.slug}/courses/${course.id}/lessons${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={`/m/${member.slug}/courses/${course.id}/lessons${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                                    className="flex items-center text-gray-600 hover:text-gray-900"
                                >
                                    <ChevronLeft className="h-5 w-5 mr-1" />
                                    Back to Lessons
                                </Link>
                            </div>
                            
                            {viewingContact && (
                                <div className="text-sm text-gray-500">
                                    Viewing as: {formatContactName(viewingContact)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Video Player */}
                            {currentLesson.video_url && (
                                <div className="mb-6">
                                    {(() => {
                                        console.log('Processing video URL:', currentLesson.video_url); // Debug log
                                        const embedUrl = getYouTubeEmbedUrl(currentLesson.video_url);
                                        console.log('Generated embed URL:', embedUrl); // Debug log
                                        
                                        if (embedUrl) {
                                            return (
                                                <div>
                                                    <YouTubeVideoPlayer
                                                        videoUrl={currentLesson.video_url}
                                                        title={currentLesson.title}
                                                        lessonId={currentLesson.id}
                                                        onProgress={handleVideoProgress}
                                                    />
                                                    
                                                    {/* Video Progress Indicator */}
                                                    {videoProgress[currentLesson.id] !== undefined && (
                                                        <div className="mt-3">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Video Progress
                                                                </span>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {Math.round(videoProgress[currentLesson.id])}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${videoProgress[currentLesson.id]}%` }}
                                                                />
                                                            </div>
                                                            {videoWatched[currentLesson.id] && (
                                                                <div className="mt-2 text-center">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Video Watched
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Video className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                        <p className="text-gray-600 dark:text-gray-400">Invalid video URL</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                                            {currentLesson.video_url}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            )}

                            {/* Lesson Content */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {currentLesson.title}
                                    </h1>
                                    {currentLesson.is_completed && (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {formatDuration(currentLesson.duration_minutes)}
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        Lesson {currentLesson.order_index}
                                    </div>
                                </div>
                                
                                <div className="prose max-w-none">
                                    {currentLesson.content ? (
                                        <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                                    ) : (
                                        <p className="text-gray-600">{currentLesson.description}</p>
                                    )}
                                </div>
                                
                                {/* Complete Lesson Button */}
                                {viewingContact && (
                                    <div className="mt-8 pt-6 border-t">
                                        {!progress ? (
                                            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="text-yellow-800">
                                                    You need to enroll in this course to track your progress.
                                                </p>
                                            </div>
                                        ) : currentLesson.is_completed ? (
                                            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                                                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                                <p className="text-green-800 font-medium">
                                                    Lesson Completed!
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleLessonComplete}
                                                disabled={
                                                    !!currentLesson.video_url && !videoWatched[currentLesson.id]
                                                }
                                                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                    !!currentLesson.video_url && !videoWatched[currentLesson.id]
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                                                }`}
                                            >
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                {(() => {
                                                    if (currentLesson.video_url && !videoWatched[currentLesson.id]) {
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
                        <div className="lg:col-span-1">
                            {/* Course Info */}
                            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Course Progress
                                </h3>
                                
                                {/* Enrollment Status */}
                                {viewingContact && (
                                    <div className="mb-4 p-3 rounded-md border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Enrollment Status:</span>
                                            <span className={`text-sm px-2 py-1 rounded-full ${
                                                progress 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {progress ? 'Enrolled' : 'Not Enrolled'}
                                            </span>
                                        </div>
                                        {progress && (
                                            <div className="text-xs text-gray-600">
                                                <div>Progress: {progress.progress_percentage}%</div>
                                                <div>Lessons Completed: {progress.lessons_completed}</div>
                                                <div>Status: {progress.status}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Progress Display */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>Overall Progress</span>
                                        <span>{progress ? Math.round(progress.progress_percentage || 0) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(progress?.progress_percentage || 0, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                    <div className="flex items-center justify-between mb-2">
                                        <span>Course:</span>
                                        <span className="font-medium">{course.title}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span>Total Lessons:</span>
                                        <span>{course.lessons_count || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Duration:</span>
                                        <span>{formatDuration(course.duration_minutes)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="px-6 py-4 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Course Content
                                    </h3>
                                </div>
                                
                                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                    {lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                lesson.id === currentLesson.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                            } ${!lesson.is_accessible ? 'opacity-60' : ''}`}
                                            onClick={() => {
                                                if (lesson.is_accessible) {
                                                    setCurrentLesson(lesson);
                                                    router.visit(`/m/${member.slug}/courses/${course.id}/learn?lesson_id=${lesson.id}${viewingContact ? `&contact_id=${viewingContact.id}` : ''}`);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getLessonStatusIcon(lesson)}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${
                                                        lesson.id === currentLesson.id ? 'text-blue-700' : 'text-gray-900'
                                                    }`}>
                                                        {lesson.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDuration(lesson.duration_minutes)}
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
        </>
    );
}
