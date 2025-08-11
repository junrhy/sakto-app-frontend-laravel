import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Search, Plus, Play, Clock, Users, Star, Filter, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Course {
    id: number;
    title: string;
    description: string;
    slug: string;
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
    created_at: string;
}

export default function Index({ auth }: { auth: any }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFeatured, setShowFeatured] = useState(false);
    const [showFreeOnly, setShowFreeOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: '15',
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory !== 'all' && { category: selectedCategory }),
                ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty }),
                ...(selectedStatus !== 'all' && { status: selectedStatus }),
                ...(showFeatured && { featured: 'true' }),
                ...(showFreeOnly && { is_free: 'true' }),
            });

            const response = await axios.get(`/courses/list?${params}`);
            setCourses(response.data.data);
            setTotalPages(response.data.pagination.last_page);
            setTotalItems(response.data.pagination.total);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/courses/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [currentPage, searchTerm, selectedCategory, selectedDifficulty, selectedStatus, showFeatured, showFreeOnly]);

    const handleFilter = () => {
        setCurrentPage(1);
        fetchCourses();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedDifficulty('all');
        setSelectedStatus('all');
        setShowFeatured(false);
        setShowFreeOnly(false);
        setCurrentPage(1);
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
        if (course.is_free) return 'Free';
        return `${course.currency} ${course.price?.toLocaleString()}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Courses</h2>}
        >
            <Head title="Courses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Create, manage, and track your online courses
                            </p>
                        </div>
                        <Link href={route('courses.create')}>
                            <Button className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create Course
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search courses..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty
                                    </label>
                                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All difficulties" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All difficulties</SelectItem>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showFeatured}
                                        onChange={(e) => setShowFeatured(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured only</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showFreeOnly}
                                        onChange={(e) => setShowFreeOnly(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Free courses only</span>
                                </label>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleFilter} className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loading State */}
                    {loading && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading courses...</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Course Grid */}
                    {!loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg line-clamp-2">
                                                    {course.title}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 mt-2">
                                                    {course.description}
                                                </CardDescription>
                                            </div>
                                            {course.is_featured && (
                                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pb-3">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Badge className={getDifficultyColor(course.difficulty)}>
                                                {course.difficulty}
                                            </Badge>
                                            <Badge className={getStatusColor(course.status)}>
                                                {course.status}
                                            </Badge>
                                            {course.is_free ? (
                                                <Badge className="bg-green-100 text-green-800">Free</Badge>
                                            ) : (
                                                <Badge className="bg-blue-100 text-blue-800">Paid</Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDuration(course.duration_minutes)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{course.lessons_count} lessons</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>{course.enrolled_count} enrolled</span>
                                            </div>
                                            {course.instructor_name && (
                                                <div className="text-sm">
                                                    <span className="font-medium">Instructor:</span> {course.instructor_name}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatPrice(course)}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-0">
                                        <div className="flex gap-2 w-full">
                                            <Link href={route('courses.show', course.id)} className="flex-1">
                                                <Button variant="outline" className="w-full">
                                                    <Play className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={route('courses.edit', course.id)}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && courses.length === 0 && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No courses found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all' || showFeatured || showFreeOnly
                                        ? 'Try adjusting your filters to find more courses.'
                                        : 'Get started by creating your first course.'
                                    }
                                </p>
                                <Link href={route('courses.create')}>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Course
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? "default" : "outline"}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
