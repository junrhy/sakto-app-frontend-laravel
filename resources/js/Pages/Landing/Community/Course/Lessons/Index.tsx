import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Play, CheckCircle, Lock, Clock, BookOpen, Video, FileText, Circle } from 'lucide-react';

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
    viewingContact
}: Props) {
    // Check if user is enrolled
    const isEnrolled = !!progress;
    
    // Create a map of lesson progress for quick lookup
    const lessonProgressMap = new Map();
    if (progress?.lesson_progress) {
        progress.lesson_progress.forEach((lp: any) => {
            lessonProgressMap.set(lp.lesson_id, lp);
        });
    }

    // Update lessons with progress data
    const lessonsWithProgress = lessons.map(lesson => {
        const lessonProgress = lessonProgressMap.get(lesson.id);
        return {
            ...lesson,
            is_completed: lessonProgress?.status === 'completed' || lesson.is_completed || false,
            is_accessible: lesson.is_accessible || lessonProgress?.status === 'completed' || false,
            progress: lessonProgress
        };
    });

    // Calculate progress based on enrollment data
    const completedLessons = progress?.lessons_completed || lessonsWithProgress.filter(lesson => lesson.is_completed).length;
    const progressPercentage = progress?.progress_percentage || (lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0);

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
            return <Video className="w-4 h-4" />;
        }
        return <FileText className="w-4 h-4" />;
    };

    const getLessonStatusIcon = (lesson: any) => {
        if (lesson.is_completed) {
            return <CheckCircle className="h-6 w-6 text-green-500" />;
        } else if (lesson.progress?.status === 'started') {
            return (
                <div className="relative">
                    <Play className="h-6 w-6 text-orange-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
            );
        } else if (isEnrolled) {
            return <Play className="h-6 w-6 text-blue-500" />;
        } else {
            return <Lock className="h-6 w-6 text-gray-400" />;
        }
    };

    return (
        <>
            <Head title={`${course.title} - Lessons`} />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={`/m/${member.slug}/courses/${course.id}${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                                    className="flex items-center text-gray-600 hover:text-gray-900"
                                >
                                    <ChevronLeft className="h-5 w-5 mr-1" />
                                    Back to Course
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
                    {/* Course Header */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <div className="flex items-start space-x-6">
                            {course.image_url && (
                                <img
                                    src={course.image_url}
                                    alt={course.title}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {course.title}
                                </h1>
                                <p className="text-gray-600 mb-4">
                                    {course.description}
                                </p>
                                
                                {/* Enrollment Status */}
                                <div className="mb-4">
                                    {isEnrolled ? (
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Enrolled
                                            </div>
                                            {progress?.status === 'completed' && (
                                                <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Course Completed
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium mb-3">
                                            <Lock className="h-4 w-4 mr-2" />
                                            Not Enrolled - Lessons are locked
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{completedLessons} of {lessons.length} lessons completed</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                isEnrolled ? 'bg-blue-600' : 'bg-gray-400'
                                            }`}
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                    {progress && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Overall progress: {progress.progress_percentage || 0}% • 
                                            Lessons completed: {progress.lessons_completed || 0} • 
                                            Status: {progress.status || 'Unknown'}
                                        </div>
                                    )}
                                </div>

                                {/* Course Stats */}
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        {course.lessons_count || lessons.length} lessons
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {formatDuration(course.duration_minutes)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Course Content
                            </h2>
                        </div>
                        
                        {!isEnrolled && (
                            <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Lock className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Enrollment Required:</strong> You need to enroll in this course to access the lessons.
                                        </p>
                                        <div className="mt-2">
                                            <Link
                                                href={`/m/${member.slug}/courses/${course.id}${
                                                    viewingContact ? `?contact_id=${viewingContact.id}` : ''
                                                }`}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                            >
                                                View Course Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="divide-y divide-gray-200">
                            {lessonsWithProgress.map((lesson, index) => (
                                <div
                                    key={lesson.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors ${
                                        !isEnrolled ? 'opacity-60' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                {getLessonStatusIcon(lesson)}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-medium ${
                                                    lesson.is_completed ? 'text-green-700' : 'text-gray-900'
                                                }`}>
                                                    {index + 1}. {lesson.title}
                                                </h3>
                                                {lesson.description && (
                                                    <p className="text-gray-600 mt-1">
                                                        {lesson.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        {getLessonIcon(lesson)}
                                                        <span className="ml-1">{formatDuration(lesson.duration_minutes)}</span>
                                                    </div>
                                                    {lesson.is_completed && (
                                                        <span className="text-green-600 font-medium flex items-center">
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Completed
                                                        </span>
                                                    )}
                                                    {lesson.progress && (
                                                        <>
                                                            {lesson.progress.completion_percentage > 0 && lesson.progress.completion_percentage < 100 && (
                                                                <span className="text-blue-600 font-medium">
                                                                    {lesson.progress.completion_percentage}% complete
                                                                </span>
                                                            )}
                                                            {lesson.progress.status === 'started' && (
                                                                <span className="text-orange-600 font-medium">
                                                                    In Progress
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    {!isEnrolled && (
                                                        <span className="text-gray-500 font-medium flex items-center">
                                                            <Lock className="h-4 w-4 mr-1" />
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
                                                        viewingContact ? `&contact_id=${viewingContact.id}` : ''
                                                    }`}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    {lesson.is_completed ? 'Review' : 'Learn'}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 text-sm">
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
