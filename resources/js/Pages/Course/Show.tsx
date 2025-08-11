import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Play, Clock, Users, Star, BookOpen, Edit, Trash2 } from 'lucide-react';

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

interface Props {
    auth: any;
    course: Course;
}

export default function Show({ auth, course }: Props) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Course Details</h2>}
        >
            <Head title={course.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href="/courses">
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Courses
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-bold">{course.title}</CardTitle>
                                            <CardDescription className="mt-2 text-gray-600">
                                                {course.description}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/courses/${course.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{course.lessons_count}</div>
                                            <div className="text-sm text-gray-600">Lessons</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{course.enrolled_count}</div>
                                            <div className="text-sm text-gray-600">Students</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{formatDuration(course.duration_minutes)}</div>
                                            <div className="text-sm text-gray-600">Duration</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">{formatPrice(course)}</div>
                                            <div className="text-sm text-gray-600">Price</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <Badge className={getDifficultyColor(course.difficulty)}>
                                            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                                        </Badge>
                                        <Badge className={getStatusColor(course.status)}>
                                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                        </Badge>
                                        {course.is_featured && (
                                            <Badge className="bg-yellow-100 text-yellow-800">
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
                                            <h3 className="text-lg font-semibold mb-3">Instructor</h3>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={course.instructor_avatar || '/images/default-avatar.jpg'}
                                                    alt={course.instructor_name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium">{course.instructor_name}</div>
                                                    {course.instructor_bio && (
                                                        <div className="text-sm text-gray-600">{course.instructor_bio}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {course.requirements && course.requirements.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                                {course.requirements.map((requirement, index) => (
                                                    <li key={index}>{requirement}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3">What you'll learn</h3>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                                {course.learning_outcomes.map((outcome, index) => (
                                                    <li key={index}>{outcome}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {course.tags && course.tags.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3">Tags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {course.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary">{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Link href={`/courses/${course.id}/learn`}>
                                        <Button className="w-full" size="lg">
                                            <Play className="w-4 h-4 mr-2" />
                                            Start Learning
                                        </Button>
                                    </Link>
                                    
                                    <Button variant="outline" className="w-full">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        View Lessons
                                    </Button>

                                    <div className="text-sm text-gray-600">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>Last updated: {new Date(course.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
