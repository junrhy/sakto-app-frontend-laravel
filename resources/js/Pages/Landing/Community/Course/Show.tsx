import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Play, Clock, Users, Star, BookOpen, User } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    slug: string;
    thumbnail_url?: string;
    video_url?: string;
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
    instructor_bio?: string;
    instructor_avatar?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    requirements?: string[];
    learning_outcomes?: string[];
    created_at: string;
    updated_at: string;
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
    member: {
        id: number;
        name: string;
        email: string;
        contact_number: string | null;
        app_currency: {
            code: string;
            symbol: string;
        } | null;
        created_at: string;
        identifier?: string;
        slug?: string;
    };
    course: Course;
    viewingContact?: Contact | null;
    progress?: any; // Add progress prop for enrollment status
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string;
    phpVersion: string;
    appUrl: string;
}

export default function Show({ member, course, viewingContact, progress, canLogin, canRegister, laravelVersion, phpVersion, appUrl }: Props) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'advanced':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatPrice = (course: Course) => {
        if (course.is_free) {
            return 'Free';
        }
        return `${course.currency} ${course.price?.toFixed(2) || '0.00'}`;
    };

    const getCourseUrl = (courseId: number, path: string = '') => {
        const baseUrl = `/m/${member.slug || member.id}/courses/${courseId}${path}`;
        const urlParams = new URLSearchParams(window.location.search);
        const contactId = urlParams.get('contact_id');
        if (contactId) {
            return `${baseUrl}?contact_id=${contactId}`;
        }
        return baseUrl;
    };

    return (
        <>
            <Head title={`${course.title} - ${member.name}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <Link href={`/m/${member.slug || member.id}`}>
                                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to {member.name}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="sm:hidden">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            
                            {/* Enrollment Status */}
                            {viewingContact && (
                                <div className="flex items-center gap-2">
                                    {/* Enrollment Status */}
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        progress 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {progress ? 'Enrolled' : 'Not Enrolled'}
                                    </span>
                                    
                                    {/* Progress Status */}
                                    {progress && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            progress.status === 'completed' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : progress.status === 'in_progress'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {progress.status === 'completed' ? 'Completed' : 
                                             progress.status === 'in_progress' ? 'In Progress' : 
                                             progress.status || 'Enrolled'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="py-4 sm:py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 order-2 lg:order-1">
                                <Card>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {course.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                                            {course.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6">
                                        {/* Course Stats - Mobile */}
                                        <div className="block sm:hidden mb-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                        {course.lessons_count}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">Lessons</div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                                        {course.enrolled_count}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">Students</div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                        {formatDuration(course.duration_minutes)}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">Duration</div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                        {formatPrice(course)}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">Price</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Course Stats - Desktop */}
                                        <div className="hidden sm:grid sm:grid-cols-4 gap-4 mb-6">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {course.lessons_count}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {course.enrolled_count}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                    {formatDuration(course.duration_minutes)}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                    {formatPrice(course)}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Price</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <Badge className={getDifficultyColor(course.difficulty)}>
                                                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                                            </Badge>
                                            {course.is_featured && (
                                                <Badge className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Featured
                                                </Badge>
                                            )}
                                            {course.category && (
                                                <Badge variant="outline">{course.category}</Badge>
                                            )}
                                        </div>

                                        {course.instructor_name && (
                                            <div className="mb-6">
                                                <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                                    Instructor
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={course.instructor_avatar || '/images/default-avatar.jpg'}
                                                        alt={course.instructor_name}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                                            {course.instructor_name}
                                                        </div>
                                                        {course.instructor_bio && (
                                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-none">
                                                                {course.instructor_bio}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {course.requirements && course.requirements.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                                    Requirements
                                                </h3>
                                                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                                    {course.requirements.map((requirement, index) => (
                                                        <li key={index} className="line-clamp-2 sm:line-clamp-none">{requirement}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                                    What you'll learn
                                                </h3>
                                                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                                    {course.learning_outcomes.map((outcome, index) => (
                                                        <li key={index} className="line-clamp-2 sm:line-clamp-none">{outcome}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {course.tags && course.tags.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                                    Tags
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {course.tags.map((tag, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1 order-1 lg:order-2">
                                <Card>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">
                                            Course Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-6 space-y-4">
                                        <div className="space-y-3">
                                            <Button 
                                                asChild
                                                className={`w-full ${progress?.status === 'completed' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                                size="default"
                                            >
                                                <Link href={getCourseUrl(course.id, '/lessons')}>
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </Button>
                                            
                                            <Button 
                                                asChild
                                                className={`w-full ${progress?.status === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                                                size="default"
                                            >
                                                <Link href={getCourseUrl(course.id, '/learn')}>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    {progress?.status === 'completed' ? 'Review' : 'Start Learning'}
                                                </Link>
                                            </Button>
                                        </div>


                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
