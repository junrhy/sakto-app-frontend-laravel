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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Circle,
    Clock,
    Edit,
    Lock,
    Play,
    Plus,
    Trash2,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Lesson {
    id: number;
    title: string;
    description?: string;
    content?: string;
    video_url?: string;
    duration_minutes?: number;
    order_index: number;
    status: 'not_started' | 'in_progress' | 'completed';
    is_free_preview: boolean;
    created_at: string;
    updated_at: string;
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
    lessons: Lesson[];
    viewingContact?: Contact | null;
}

export default function Index({
    auth,
    course,
    lessons,
    viewingContact,
}: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        viewingContact || null,
    );

    const handleDeleteLesson = (lesson: Lesson) => {
        setLessonToDelete(lesson);
    };

    const handleDeleteConfirm = async () => {
        if (!lessonToDelete) return;

        setIsDeleting(true);
        try {
            await router.delete(
                `/courses/${course.id}/lessons/${lessonToDelete.id}`,
            );
            toast.success('Lesson deleted successfully');
            setLessonToDelete(null);
        } catch (error) {
            console.error('Error deleting lesson:', error);
            toast.error('Failed to delete lesson');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleContactSelect = (contact: Contact) => {
        setSelectedContact(contact);
        setShowContactSelector(false);
        // Navigate to the lessons page with the selected contact
        router.visit(`/courses/${course.id}/lessons?contact_id=${contact.id}`);
    };

    const handleViewAsAdmin = () => {
        setSelectedContact(null);
        router.visit(`/courses/${course.id}/lessons`);
    };
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                );
            case 'in_progress':
                return (
                    <Circle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                );
            default:
                return (
                    <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const completedLessons = lessons.filter(
        (lesson) => lesson.status === 'completed',
    ).length;
    const progressPercentage =
        lessons.length > 0
            ? Math.round((completedLessons / lessons.length) * 100)
            : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Course Lessons
                </h2>
            }
        >
            <Head title={`${course.title} - Lessons`} />

            <div className="space-y-6">
                <div className="mb-6">
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {viewingContact ? (
                                    <>
                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <div className="font-medium text-blue-900 dark:text-blue-100">
                                                Viewing as{' '}
                                                {viewingContact.first_name}{' '}
                                                {viewingContact.last_name}
                                            </div>
                                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                                {viewingContact.email}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                Viewing as Admin
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                All lessons overview
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowContactSelector(true)}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Select Member
                                </Button>
                                {viewingContact && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleViewAsAdmin}
                                    >
                                        View as Admin
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/courses/${course.id}${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                        >
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Course
                            </Button>
                        </Link>
                        <Link href={`/courses/${course.id}/lessons/create`}>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Lesson
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {course.title}
                                        </CardTitle>
                                        <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                                            {viewingContact
                                                ? `Course Lessons - Viewing ${viewingContact.first_name}'s Progress`
                                                : 'Course Lessons'}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {viewingContact
                                                ? 'Contact Progress'
                                                : 'Overall Progress'}
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {progressPercentage}%
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {completedLessons} of{' '}
                                            {lessons.length} lessons completed
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                                            style={{
                                                width: `${progressPercentage}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                <div className="space-y-4">
                                    {lessons.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                                No lessons available
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                This course doesn't have any
                                                lessons yet.
                                            </p>
                                        </div>
                                    ) : (
                                        lessons.map((lesson, index) => (
                                            <Card
                                                key={lesson.id}
                                                className="transition-shadow hover:shadow-md dark:hover:shadow-gray-800/50"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-1 items-center gap-4">
                                                            <div className="flex-shrink-0">
                                                                {getStatusIcon(
                                                                    lesson.status,
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="mb-1 flex items-center gap-2">
                                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                        Lesson{' '}
                                                                        {
                                                                            lesson.order_index
                                                                        }
                                                                        :{' '}
                                                                        {
                                                                            lesson.title
                                                                        }
                                                                    </h3>
                                                                    {!lesson.is_free_preview && (
                                                                        <Lock className="h-4 w-4 text-gray-400" />
                                                                    )}
                                                                </div>
                                                                {lesson.description && (
                                                                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                                        {
                                                                            lesson.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-4 w-4" />
                                                                        <span>
                                                                            {formatDuration(
                                                                                lesson.duration_minutes,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <Badge
                                                                        className={getStatusColor(
                                                                            lesson.status,
                                                                        )}
                                                                    >
                                                                        {viewingContact
                                                                            ? `${viewingContact.first_name}'s ${lesson.status.replace('_', ' ')}`
                                                                            : lesson.status.replace(
                                                                                  '_',
                                                                                  ' ',
                                                                              )}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-shrink-0 gap-2">
                                                            <Link
                                                                href={`/courses/${course.id}/learn?lesson=${lesson.id}${viewingContact ? `&contact_id=${viewingContact.id}` : ''}`}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Play className="mr-2 h-4 w-4" />
                                                                    {lesson.status ===
                                                                    'completed'
                                                                        ? 'Review'
                                                                        : 'Start'}
                                                                </Button>
                                                            </Link>
                                                            <Link
                                                                href={`/courses/${course.id}/lessons/${lesson.id}/edit`}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() =>
                                                                    handleDeleteLesson(
                                                                        lesson,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {lessons.length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total Lessons
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {completedLessons}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {viewingContact
                                                ? 'Contact Completed'
                                                : 'Completed'}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="mb-2 text-sm text-gray-600">
                                        Course Details
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Difficulty:</span>
                                            <Badge className="bg-gray-100 text-gray-800">
                                                {course.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <Badge className="bg-green-100 text-green-800">
                                                {course.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Duration:</span>
                                            <span>
                                                {formatDuration(
                                                    course.duration_minutes,
                                                )}
                                            </span>
                                        </div>
                                        {course.instructor_name && (
                                            <div className="flex justify-between">
                                                <span>Instructor:</span>
                                                <span>
                                                    {course.instructor_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <Link
                                        href={`/courses/${course.id}/learn${viewingContact ? `?contact_id=${viewingContact.id}` : ''}`}
                                    >
                                        <Button className="w-full" size="lg">
                                            <Play className="mr-2 h-4 w-4" />
                                            Continue Learning
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Contact Selector Modal */}
                {showContactSelector && (
                    <ContactSelector
                        isOpen={showContactSelector}
                        onClose={() => setShowContactSelector(false)}
                        onSelect={handleContactSelect}
                        title="Select Member to View Lessons"
                    />
                )}

                {/* Delete Confirmation Dialog */}
                {lessonToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Lesson
                            </h3>
                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete "
                                {lessonToDelete.title}"? This action cannot be
                                undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setLessonToDelete(null)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                >
                                    {isDeleting
                                        ? 'Deleting...'
                                        : 'Delete Lesson'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
