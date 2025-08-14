import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Search, BookOpen, Clock, Users, Star, Play, Eye } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    slug: string;
    price: number;
    is_free: boolean;
    featured: boolean;
    status: string;
    category: string;
    instructor_name: string;
    duration: string;
    lessons_count: number;
    students_count: number;
    rating: number;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

interface CoursesSectionProps {
    member: any;
    courses: Course[];
    contactId?: number;
}

export default function CoursesSection({ member, courses, contactId }: CoursesSectionProps) {
    const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // Get unique categories from courses
    const categories = Array.from(new Set(courses.map(course => course.category).filter(Boolean)));

    // Filter courses based on search term, category, and filter
    useEffect(() => {
        let filtered = courses;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(course => course.category === selectedCategory);
        }

        // Filter by type
        switch (selectedFilter) {
            case 'free':
                filtered = filtered.filter(course => course.is_free);
                break;
            case 'paid':
                filtered = filtered.filter(course => !course.is_free);
                break;
            case 'featured':
                filtered = filtered.filter(course => course.featured);
                break;
            default:
                break;
        }

        setFilteredCourses(filtered);
    }, [courses, searchTerm, selectedCategory, selectedFilter]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        }).format(price || 0);
    };

    const formatDuration = (duration: string) => {
        if (!duration) return 'N/A';
        return duration;
    };

    const getCourseUrl = (course: Course) => {
        const baseUrl = `/m/${member.slug || member.id}/courses/${course.id}`;
        if (contactId) {
            return `${baseUrl}?contact_id=${contactId}`;
        }
        return baseUrl;
    };

    if (courses.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Courses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No courses available yet.</p>
                        <p className="text-sm">Check back later for new courses!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses ({filteredCourses.length})
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="featured">Featured</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-muted relative">
                                {course.image_url ? (
                                    <img
                                        src={course.image_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                                {course.featured && (
                                    <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                                        <Star className="h-3 w-3 mr-1" />
                                        Featured
                                    </Badge>
                                )}
                                {course.is_free && (
                                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                                        Free
                                    </Badge>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {course.description}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatDuration(course.duration)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Play className="h-4 w-4" />
                                            <span>{course.lessons_count || 0} lessons</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{course.students_count || 0} students</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{(course.rating || 0).toFixed(1)}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                by {course.instructor_name || 'Unknown Instructor'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            {course.is_free ? (
                                                <span className="text-sm font-semibold text-green-600">Free</span>
                                            ) : (
                                                <span className="text-sm font-semibold">{formatPrice(course.price)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" className="flex-1">
                                            <Link href={`/m/${member.slug || member.id}/courses/${course.id}${contactId ? `?contact_id=${contactId}` : ''}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Course
                                            </Link>
                                        </Button>
                                        <Button asChild className="flex-1">
                                            <Link href={`/m/${member.slug || member.id}/courses/${course.id}/lessons${contactId ? `?contact_id=${contactId}` : ''}`}>
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                View Lessons
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No courses match your search criteria.</p>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
