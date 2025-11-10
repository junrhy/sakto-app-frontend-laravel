import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen, Clock, Eye, Play, Search, Star, Users } from 'lucide-react';
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
import {
    Community,
    CommunityCollectionItem,
    CommunityCurrency,
} from '../types';

interface CoursesSectionProps {
    id: string;
    courses: CommunityCollectionItem[];
    community: Community;
    projectIdentifier: string;
    appCurrency?: CommunityCurrency | null;
    emptyMessage?: string;
}

interface NormalizedCourse {
    id: number | string;
    title: string;
    description: string;
    slug?: string;
    price?: number | string;
    is_free?: boolean;
    is_featured?: boolean;
    status?: string;
    category?: string;
    instructor_name?: string;
    duration_minutes?: number;
    lessons_count?: number;
    enrolled_count?: number;
    thumbnail_url?: string;
    created_at?: string;
    updated_at?: string;
}

const formatCurrency = (
    value: number | string | undefined,
    currency?: CommunityCurrency | null,
): string => {
    if (value === undefined || value === null) {
        return '';
    }

    const numeric =
        typeof value === 'string' ? Number.parseFloat(value) : Number(value);

    if (Number.isNaN(numeric)) {
        return '';
    }

    const symbol = currency?.symbol ?? '₱';
    const decimal = currency?.decimal_separator ?? '.';
    const thousands = currency?.thousands_separator ?? ',';

    const [whole, fraction = '00'] = numeric.toFixed(2).split('.');
    const wholeWithSeparators = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousands,
    );

    return `${symbol}${wholeWithSeparators}${decimal}${fraction}`;
};

const formatDuration = (durationMinutes?: number): string => {
    if (!durationMinutes || durationMinutes <= 0) {
        return 'N/A';
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }

    return `${minutes}m`;
};

const asId = (value: unknown): string | number | undefined => {
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }
    return undefined;
};

const asString = (value: unknown): string | undefined => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }
    return undefined;
};

const asNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return undefined;
};

const asBoolean = (value: unknown): boolean | undefined => {
    if (typeof value === 'boolean') {
        return value;
    }
    return undefined;
};

const normalizeCourse = (item: CommunityCollectionItem): NormalizedCourse => {
    const record = item as Record<string, unknown>;
    const courseId =
        asId(item.id) ??
        asId(record.course_id) ??
        asString(item.slug) ??
        asString(record.course_slug) ??
        'course-unknown';

    const rawPrice = asNumber(item.price) ?? asNumber(record.course_price);
    const isFreeExplicit = asBoolean(item.is_free);
    const isFree =
        isFreeExplicit ??
        (rawPrice !== undefined ? rawPrice === 0 : undefined);

    return {
        id: courseId,
        title:
            asString(item.title) ??
            asString(item.name) ??
            'Untitled Course',
        description:
            asString(item.description) ??
            asString(record.summary) ??
            '',
        slug: asString(item.slug) ?? asString(record.course_slug),
        price: rawPrice,
        is_free: isFree,
        is_featured:
            asBoolean(item.is_featured) ?? asBoolean(record.featured),
        status:
            asString(item.status) ??
            asString(record.visibility),
        category:
            asString(item.category) ??
            asString(record.category_name),
        instructor_name:
            asString(item.instructor_name) ??
            asString(record.instructor),
        duration_minutes:
            asNumber(item.duration_minutes) ??
            asNumber(record.duration),
        lessons_count:
            asNumber(item.lessons_count) ??
            asNumber(record.lesson_count),
        enrolled_count:
            asNumber(item.enrolled_count) ??
            asNumber(record.enrollments),
        thumbnail_url:
            asString(item.thumbnail_url) ??
            asString(record.cover_image),
        created_at: asString(item.created_at),
        updated_at: asString(item.updated_at),
    };
};

export function CoursesSection({
    id,
    courses,
    community,
    projectIdentifier,
    appCurrency,
    emptyMessage = 'No courses available yet.',
}: CoursesSectionProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const normalizedCourses = useMemo(
        () => courses.map((item) => normalizeCourse(item)),
        [courses],
    );

    const categories = useMemo(() => {
        return Array.from(
            new Set(
                normalizedCourses
                    .map((course) => course.category)
                    .filter(
                        (category): category is string =>
                            typeof category === 'string' && category.trim().length > 0,
                    ),
            ),
        );
    }, [normalizedCourses]);

    const filteredCourses = useMemo(() => {
        let filtered = normalizedCourses;

        if (searchTerm.trim().length > 0) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter((course) => {
                return (
                    course.title.toLowerCase().includes(lower) ||
                    (course.description && course.description.toLowerCase().includes(lower)) ||
                    (course.instructor_name &&
                        course.instructor_name.toLowerCase().includes(lower))
                );
            });
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter((course) => course.category === selectedCategory);
        }

        switch (selectedFilter) {
            case 'free':
                filtered = filtered.filter((course) => Boolean(course.is_free));
                break;
            case 'paid':
                filtered = filtered.filter((course) => !course.is_free);
                break;
            case 'featured':
                filtered = filtered.filter((course) => Boolean(course.is_featured));
                break;
            default:
                break;
        }

        return filtered;
    }, [normalizedCourses, searchTerm, selectedCategory, selectedFilter]);

    if (normalizedCourses.length === 0) {
        return (
            <section id={id} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Courses
                </h3>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <BookOpen className="h-5 w-5" />
                            Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p className="font-medium">{emptyMessage}</p>
                            <p className="mt-1 text-sm">
                                Check back later for new learning opportunities.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section id={id} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Courses
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Browse training programs curated by this community.
                    </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-gray-200">{filteredCourses.length}</span>{' '}
                    course{filteredCourses.length === 1 ? '' : 's'}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder="Search courses by title, instructor, or description"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger className="sm:w-[160px]">
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
                            <Select
                                value={selectedFilter}
                                onValueChange={setSelectedFilter}
                            >
                                <SelectTrigger className="sm:w-[140px]">
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredCourses.map((course) => {
                            const courseIdentifier = course.id ?? course.slug ?? '';
                            const ownerIdentifier =
                                community.slug || community.identifier || community.id;
                            const courseUrl = route('customer.projects.courses.show', {
                                project: projectIdentifier,
                                owner: ownerIdentifier,
                                course: courseIdentifier,
                            });
                            const courseLessonsUrl = route(
                                'customer.projects.courses.lessons',
                                {
                                    project: projectIdentifier,
                                    owner: ownerIdentifier,
                                    course: courseIdentifier,
                                },
                            );

                            return (
                                <Card
                                    key={`course-${courseIdentifier}`}
                                    className="overflow-hidden border border-gray-200 transition-shadow duration-200 hover:shadow-lg dark:border-gray-700"
                                >
                                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="h-full w-full object-cover"
                                                onError={(event) => {
                                                    const target = event.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                                                <div className="text-center">
                                                    <BookOpen className="mx-auto mb-2 h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        {course.title}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {course.is_featured && (
                                            <Badge className="absolute left-2 top-2 bg-yellow-500 text-white hover:bg-yellow-600">
                                                <Star className="mr-1 h-3 w-3" />
                                                Featured
                                            </Badge>
                                        )}
                                        {course.is_free && (
                                            <Badge className="absolute right-2 top-2 bg-green-500 text-white hover:bg-green-600">
                                                Free
                                            </Badge>
                                        )}
                                    </div>

                                    <CardContent className="space-y-4 p-5">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {course.title}
                                            </h4>
                                            {course.description && (
                                                <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {course.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatDuration(course.duration_minutes)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Play className="h-4 w-4" />
                                                <span>{course.lessons_count ?? 0} lessons</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-4 w-4" />
                                                <span>{course.enrolled_count ?? 0} students</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                by{' '}
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {course.instructor_name || 'Unknown Instructor'}
                                                </span>
                                            </div>
                                            {!course.is_free && (
                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(course.price, appCurrency)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="min-w-0 flex-1"
                                            >
                                                <Link href={courseUrl}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Course
                                                </Link>
                                            </Button>
                                            <Button asChild className="min-w-0 flex-1">
                                                <Link href={courseLessonsUrl}>
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    View Lessons
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                            <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p className="font-medium">No courses match the selected filters.</p>
                            <p className="mt-1 text-sm">
                                Try clearing your filters or adjusting the search keywords.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}


