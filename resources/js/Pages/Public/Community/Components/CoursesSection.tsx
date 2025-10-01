import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Link } from '@inertiajs/react';
import { BookOpen, Clock, Eye, Play, Search, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Course {
    id: number;
    title: string;
    description: string;
    slug: string;
    price: string;
    is_free: boolean;
    is_featured: boolean;
    status: string;
    category: string | null;
    instructor_name: string | null;
    duration_minutes: number;
    lessons_count: number;
    enrolled_count: number;
    thumbnail_url?: string;
    created_at: string;
    updated_at: string;
}

interface CoursesSectionProps {
    member: any;
    courses: Course[];
    contactId?: number;
}

export default function CoursesSection({
    member,
    courses,
    contactId,
}: CoursesSectionProps) {
    const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // Get unique categories from courses
    const categories = Array.from(
        new Set(
            courses
                .map((course) => course.category)
                .filter((category): category is string => category !== null),
        ),
    );

    // Filter courses based on search term, category, and filter
    useEffect(() => {
        let filtered = courses;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (course) =>
                    course.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    course.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (course.instructor_name &&
                        course.instructor_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())),
            );
        }

        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(
                (course) => course.category === selectedCategory,
            );
        }

        // Filter by type
        switch (selectedFilter) {
            case 'free':
                filtered = filtered.filter((course) => course.is_free);
                break;
            case 'paid':
                filtered = filtered.filter((course) => !course.is_free);
                break;
            case 'featured':
                filtered = filtered.filter((course) => course.is_featured);
                break;
            default:
                break;
        }

        setFilteredCourses(filtered);
    }, [courses, searchTerm, selectedCategory, selectedFilter]);

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        }).format(parseFloat(price) || 0);
    };

    const formatDuration = (durationMinutes: number) => {
        if (!durationMinutes || durationMinutes === 0) return 'N/A';
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        if (hours > 0) {
            return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
        }
        return `${minutes}m`;
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
                    <div className="py-8 text-center text-muted-foreground">
                        <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p>No courses available yet.</p>
                        <p className="text-sm">
                            Check back later for new courses!
                        </p>
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
                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedFilter}
                            onValueChange={setSelectedFilter}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="featured">
                                    Featured
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            className="overflow-hidden transition-shadow hover:shadow-lg"
                        >
                            <div className="relative aspect-video bg-muted">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target =
                                                e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove(
                                                'hidden',
                                            );
                                        }}
                                    />
                                ) : null}
                                <div
                                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 ${course.thumbnail_url ? 'hidden' : ''}`}
                                >
                                    <div className="text-center">
                                        <BookOpen className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {course.title}
                                        </p>
                                    </div>
                                </div>
                                {course.is_featured && (
                                    <Badge className="absolute left-2 top-2 bg-yellow-500 hover:bg-yellow-600">
                                        <Star className="mr-1 h-3 w-3" />
                                        Featured
                                    </Badge>
                                )}
                                {course.is_free && (
                                    <Badge className="absolute right-2 top-2 bg-green-500 hover:bg-green-600">
                                        Free
                                    </Badge>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="mb-1 line-clamp-2 text-lg font-semibold">
                                            {course.title}
                                        </h3>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {formatDuration(
                                                    course.duration_minutes,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Play className="h-4 w-4" />
                                            <span>
                                                {course.lessons_count || 0}{' '}
                                                lessons
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {course.enrolled_count || 0}{' '}
                                                students
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                by{' '}
                                                {course.instructor_name ||
                                                    'Unknown Instructor'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            {!course.is_free && (
                                                <span className="text-sm font-semibold">
                                                    {formatPrice(course.price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="min-w-0 flex-1"
                                        >
                                            <Link
                                                href={`/m/${member.slug || member.id}/courses/${course.id}${contactId ? `?contact_id=${contactId}` : ''}`}
                                            >
                                                <Eye className="mr-1 h-4 w-4 sm:mr-2" />
                                                <span className="hidden sm:inline">
                                                    View Course
                                                </span>
                                                <span className="sm:hidden">
                                                    Course
                                                </span>
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            className="min-w-0 flex-1"
                                        >
                                            <Link
                                                href={`/m/${member.slug || member.id}/courses/${course.id}/lessons${contactId ? `?contact_id=${contactId}` : ''}`}
                                            >
                                                <BookOpen className="mr-1 h-4 w-4 sm:mr-2" />
                                                <span className="hidden sm:inline">
                                                    View Lessons
                                                </span>
                                                <span className="sm:hidden">
                                                    Lessons
                                                </span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                        <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p>No courses match your search criteria.</p>
                        <p className="text-sm">
                            Try adjusting your filters or search terms.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
