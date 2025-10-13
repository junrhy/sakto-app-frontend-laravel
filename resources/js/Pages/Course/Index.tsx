import ContactSelector from '@/Components/ContactSelector';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    BookOpen,
    Clock,
    Filter,
    Play,
    Plus,
    Search,
    Star,
    User,
    UserPlus,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    const [showFilters, setShowFilters] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [showViewContactSelector, setShowViewContactSelector] =
        useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        null,
    );
    const [viewingContact, setViewingContact] = useState<Contact | null>(null);
    const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(
        null,
    );
    const [viewingCourseId, setViewingCourseId] = useState<number | null>(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState<{
        [key: string]: boolean;
    }>({});
    const [checkingEnrollment, setCheckingEnrollment] = useState<{
        [key: string]: boolean;
    }>({});

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: '15',
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory !== 'all' && {
                    category: selectedCategory,
                }),
                ...(selectedDifficulty !== 'all' && {
                    difficulty: selectedDifficulty,
                }),
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

    const checkEnrollmentStatus = async (
        courseId: number,
        contactId: number,
    ) => {
        const key = `${courseId}-${contactId}`;
        setCheckingEnrollment((prev) => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(
                `/courses/${courseId}/check-enrollment`,
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
                        contact_id: contactId.toString(),
                    }),
                },
            );

            const data = await response.json();

            // Handle both success and direct data response formats
            if (data.success && data.data) {
                setEnrollmentStatus((prev) => ({
                    ...prev,
                    [key]: data.data.is_enrolled,
                }));
            } else if (
                data.data &&
                typeof data.data.is_enrolled === 'boolean'
            ) {
                // Handle case where response doesn't have success field but has data
                setEnrollmentStatus((prev) => ({
                    ...prev,
                    [key]: data.data.is_enrolled,
                }));
            } else {
                console.error(
                    'Failed to check enrollment status:',
                    data.message || 'Unknown error',
                );
                setEnrollmentStatus((prev) => ({ ...prev, [key]: false }));
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            setEnrollmentStatus((prev) => ({ ...prev, [key]: false }));
        } finally {
            setCheckingEnrollment((prev) => ({ ...prev, [key]: false }));
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [
        currentPage,
        searchTerm,
        selectedCategory,
        selectedDifficulty,
        selectedStatus,
        showFeatured,
        showFreeOnly,
    ]);

    // Check enrollment status when viewingContact changes
    useEffect(() => {
        if (viewingContact && courses.length > 0) {
            courses.forEach((course) => {
                checkEnrollmentStatus(course.id, viewingContact.id);
            });
        }
    }, [viewingContact, courses]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedDifficulty('all');
        setSelectedStatus('all');
        setShowFeatured(false);
        setShowFreeOnly(false);
        setCurrentPage(1);
    };

    const handleContactSelect = (contact: Contact) => {
        setSelectedContact(contact);
        setShowContactSelector(false);

        // Check enrollment status first
        if (enrollingCourseId) {
            checkEnrollmentStatus(enrollingCourseId, contact.id);
        }
    };

    const performEnrollment = async (courseId: number, contact: Contact) => {
        const key = `${courseId}-${contact.id}`;
        const isEnrolled = enrollmentStatus[key];

        if (isEnrolled) {
            toast.info(
                `${contact.first_name} is already enrolled in this course`,
            );
            setSelectedContact(null);
            setEnrollingCourseId(null);
            return;
        }

        try {
            await router.post(
                `/courses/${courseId}/enroll`,
                {
                    contact_id: contact.id.toString(),
                    student_name:
                        `${contact.first_name} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name}`.trim(),
                    student_email: contact.email,
                    student_phone:
                        contact.call_number || contact.sms_number || '',
                },
                {
                    onSuccess: () => {
                        // The backend will redirect to the learn page
                        setSelectedContact(null);
                        setEnrollingCourseId(null);
                        // Update enrollment status
                        setEnrollmentStatus((prev) => ({
                            ...prev,
                            [key]: true,
                        }));
                    },
                    onError: (errors) => {
                        console.error('Error enrolling in course:', errors);
                        if (errors.enrollment) {
                            toast.error(errors.enrollment);
                        } else {
                            toast.error('Failed to enroll in course');
                        }
                        setSelectedContact(null);
                        setEnrollingCourseId(null);
                    },
                },
            );
        } catch (error: any) {
            console.error('Error enrolling in course:', error);
            toast.error('Failed to enroll in course');
            setSelectedContact(null);
            setEnrollingCourseId(null);
        }
    };

    const handleViewContactSelect = (contact: Contact) => {
        setViewingContact(contact);
        setShowViewContactSelector(false);
    };

    const viewCourseAsContact = (courseId: number) => {
        if (viewingContact) {
            router.visit(
                `/courses/${courseId}?contact_id=${viewingContact.id}`,
            );
        }
    };

    const viewLessonsAsContact = (courseId: number) => {
        if (viewingContact) {
            router.visit(
                `/courses/${courseId}/lessons?contact_id=${viewingContact.id}`,
            );
        }
    };

    const viewLearnAsContact = (courseId: number) => {
        if (viewingContact) {
            router.visit(
                `/courses/${courseId}/learn?contact_id=${viewingContact.id}`,
            );
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
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Courses
                </h2>
            }
        >
            <Head title="Courses" />

            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Course Management
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Create, manage, and track your online courses
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowViewContactSelector(true)}
                            className="flex items-center gap-2"
                        >
                            <User className="h-4 w-4" />
                            {viewingContact
                                ? `View as ${viewingContact.first_name}`
                                : 'Select Member'}
                        </Button>
                        <Link href={route('courses.create')}>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Create Course
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Toggle Button */}
                <div className="mb-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            placeholder="Search courses..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Category
                                    </label>
                                    <Select
                                        value={selectedCategory}
                                        onValueChange={setSelectedCategory}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All categories
                                            </SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Difficulty
                                    </label>
                                    <Select
                                        value={selectedDifficulty}
                                        onValueChange={setSelectedDifficulty}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All difficulties" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All difficulties
                                            </SelectItem>
                                            <SelectItem value="beginner">
                                                Beginner
                                            </SelectItem>
                                            <SelectItem value="intermediate">
                                                Intermediate
                                            </SelectItem>
                                            <SelectItem value="advanced">
                                                Advanced
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status
                                    </label>
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={setSelectedStatus}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All statuses
                                            </SelectItem>
                                            <SelectItem value="published">
                                                Published
                                            </SelectItem>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="archived">
                                                Archived
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showFeatured}
                                        onChange={(e) =>
                                            setShowFeatured(e.target.checked)
                                        }
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Featured only
                                    </span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showFreeOnly}
                                        onChange={(e) =>
                                            setShowFreeOnly(e.target.checked)
                                        }
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Free courses only
                                    </span>
                                </label>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {loading && (
                    <Card className="py-12 text-center">
                        <CardContent>
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Loading courses...
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Course Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card
                                key={course.id}
                                className="transition-shadow hover:shadow-lg dark:hover:shadow-gray-800/50"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-2 text-lg text-gray-900 dark:text-gray-100">
                                                {course.title}
                                            </CardTitle>
                                            <CardDescription className="mt-2 line-clamp-2 text-gray-600 dark:text-gray-400">
                                                {course.description}
                                            </CardDescription>
                                        </div>
                                        {course.is_featured && (
                                            <Star className="h-5 w-5 fill-current text-yellow-500 dark:text-yellow-400" />
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="pb-3">
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <Badge
                                            className={getDifficultyColor(
                                                course.difficulty,
                                            )}
                                        >
                                            {course.difficulty}
                                        </Badge>
                                        <Badge
                                            className={getStatusColor(
                                                course.status,
                                            )}
                                        >
                                            {course.status}
                                        </Badge>
                                        {course.is_free ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                Free
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                                Paid
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <span>
                                                {formatDuration(
                                                    course.duration_minutes,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <span>
                                                {course.lessons_count} lessons
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <span>
                                                {course.enrolled_count} enrolled
                                            </span>
                                        </div>
                                        {course.instructor_name && (
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    Instructor:
                                                </span>{' '}
                                                {course.instructor_name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatPrice(course)}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0">
                                    {viewingContact ? (
                                        <div className="flex w-full flex-col gap-2">
                                            <div className="mb-2 rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-700 dark:bg-blue-900/20">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-blue-900 dark:text-blue-100">
                                                                Viewing as{' '}
                                                                {
                                                                    viewingContact.first_name
                                                                }{' '}
                                                                {
                                                                    viewingContact.last_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                                                {
                                                                    viewingContact.email
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setViewingContact(
                                                                null,
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        viewCourseAsContact(
                                                            course.id,
                                                        )
                                                    }
                                                >
                                                    <Play className="mr-1 h-4 w-4" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        viewLessonsAsContact(
                                                            course.id,
                                                        )
                                                    }
                                                >
                                                    <BookOpen className="mr-1 h-4 w-4" />
                                                    Lessons
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        viewLearnAsContact(
                                                            course.id,
                                                        )
                                                    }
                                                >
                                                    <Play className="mr-1 h-4 w-4" />
                                                    Learn
                                                </Button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (selectedContact) {
                                                            performEnrollment(
                                                                course.id,
                                                                selectedContact,
                                                            );
                                                        } else {
                                                            setEnrollingCourseId(
                                                                course.id,
                                                            );
                                                            setShowContactSelector(
                                                                true,
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        checkingEnrollment[
                                                            `${course.id}-${viewingContact?.id}`
                                                        ]
                                                    }
                                                    className="flex-1"
                                                >
                                                    {checkingEnrollment[
                                                        `${course.id}-${viewingContact?.id}`
                                                    ] ? (
                                                        <>
                                                            <div className="mr-1 h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600 dark:border-gray-400"></div>
                                                            Checking...
                                                        </>
                                                    ) : enrollmentStatus[
                                                          `${course.id}-${viewingContact?.id}`
                                                      ] ? (
                                                        <>
                                                            <div className="mr-1 h-4 w-4 text-green-600 dark:text-green-400">
                                                                ✓
                                                            </div>
                                                            Enrolled
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="mr-1 h-4 w-4" />
                                                            Enroll
                                                        </>
                                                    )}
                                                </Button>
                                                <Link
                                                    href={route(
                                                        'courses.edit',
                                                        course.id,
                                                    )}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex w-full gap-2">
                                            <Link
                                                href={route(
                                                    'courses.show',
                                                    course.id,
                                                )}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEnrollingCourseId(
                                                        course.id,
                                                    );
                                                    setShowContactSelector(
                                                        true,
                                                    );
                                                }}
                                            >
                                                <UserPlus className="mr-1 h-4 w-4" />
                                                Enroll
                                            </Button>
                                            <Link
                                                href={route(
                                                    'courses.edit',
                                                    course.id,
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && courses.length === 0 && (
                    <Card className="py-12 text-center">
                        <CardContent>
                            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                No courses found
                            </h3>
                            <p className="mb-4 text-gray-600 dark:text-gray-400">
                                {searchTerm ||
                                selectedCategory !== 'all' ||
                                selectedDifficulty !== 'all' ||
                                selectedStatus !== 'all' ||
                                showFeatured ||
                                showFreeOnly
                                    ? 'Try adjusting your filters to find more courses.'
                                    : 'Get started by creating your first course.'}
                            </p>
                            <Link href={route('courses.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Course
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex gap-2">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === currentPage
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Contact Selector Modal for Enrollment */}
            <ContactSelector
                isOpen={showContactSelector}
                onClose={() => {
                    setShowContactSelector(false);
                    setEnrollingCourseId(null);
                }}
                onSelect={handleContactSelect}
                title="Select Contact to Enroll"
            />

            {/* Contact Selector Modal for Viewing */}
            <ContactSelector
                isOpen={showViewContactSelector}
                onClose={() => setShowViewContactSelector(false)}
                onSelect={handleViewContactSelect}
                title="Select Member to View As"
            />
        </AuthenticatedLayout>
    );
}
