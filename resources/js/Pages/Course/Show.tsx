import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Play, Clock, Users, Star, BookOpen, Edit, Trash2, UserPlus, User } from 'lucide-react';
import { toast } from 'sonner';
import ContactSelector from '@/Components/ContactSelector';

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
    auth: any;
    course: Course;
    errors?: any;
    flash?: any;
    viewingContact?: Contact | null;
}

export default function Show({ auth, course, errors, flash, viewingContact }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<{[key: string]: boolean}>({});
    const [checkingEnrollment, setCheckingEnrollment] = useState<{[key: string]: boolean}>({});

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Check enrollment status when contact is selected
    useEffect(() => {
        if (selectedContact) {
            checkEnrollmentStatus(selectedContact);
        } else {
            setIsEnrolled(false);
        }
    }, [selectedContact]);

    // Initial enrollment check when page loads with viewingContact
    useEffect(() => {
        if (viewingContact && !isCheckingEnrollment) {
            // Set the selected contact to the viewing contact for enrollment checking
            setSelectedContact(viewingContact);
        }
    }, []); // Empty dependency array means this runs once on mount

    const checkEnrollmentStatus = async (contact: Contact) => {
        const key = `${course.id}-${contact.id}`;
        setCheckingEnrollment(prev => ({ ...prev, [key]: true }));
        
        try {
            const response = await fetch(`/courses/${course.id}/check-enrollment`, {
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
            
            // Handle both success and direct data response formats
            if (data.success && data.data) {
                setEnrollmentStatus(prev => ({ ...prev, [key]: data.data.is_enrolled }));
                setIsEnrolled(data.data.is_enrolled);
            } else if (data.data && typeof data.data.is_enrolled === 'boolean') {
                // Handle case where response doesn't have success field but has data
                setEnrollmentStatus(prev => ({ ...prev, [key]: data.data.is_enrolled }));
                setIsEnrolled(data.data.is_enrolled);
            } else {
                console.error('Failed to check enrollment status:', data.message || 'Unknown error');
                setEnrollmentStatus(prev => ({ ...prev, [key]: false }));
                setIsEnrolled(false);
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            setEnrollmentStatus(prev => ({ ...prev, [key]: false }));
            setIsEnrolled(false);
        } finally {
            setCheckingEnrollment(prev => ({ ...prev, [key]: false }));
            setIsCheckingEnrollment(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setShowDeleteConfirm(false);
        try {
            await router.delete(`/courses/${course.id}`);
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Failed to delete course');
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
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
        if (course.is_free) {
            return 'Free';
        }
        return `${course.currency} ${course.price?.toFixed(2) || '0.00'}`;
    };

    const handleEnroll = () => {
        if (selectedContact && !isEnrolled) {
            performEnrollment(selectedContact);
        } else if (!selectedContact) {
            setShowContactSelector(true);
        }
    };

    const handleContactSelect = (contact: Contact) => {
        setSelectedContact(contact);
        setShowContactSelector(false);
        // Enrollment status will be checked automatically via useEffect
    };

    const performEnrollment = async (contact: Contact) => {
        setIsEnrolling(true);
        try {
            await router.post(`/courses/${course.id}/enroll`, {
                contact_id: contact.id.toString(),
                student_name: `${contact.first_name} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name}`.trim(),
                student_email: contact.email,
                student_phone: contact.call_number || contact.sms_number || '',
            }, {
                onSuccess: () => {
                    // The backend will redirect to the learn page, so we don't need to do anything here
                    setSelectedContact(null);
                },
                onError: (errors) => {
                    console.error('Error enrolling in course:', errors);
                    if (errors.enrollment) {
                        toast.error(errors.enrollment);
                    } else {
                        toast.error('Failed to enroll in course');
                    }
                    setSelectedContact(null);
                },
                onFinish: () => {
                    setIsEnrolling(false);
                }
            });
        } catch (error: any) {
            console.error('Error enrolling in course:', error);
            toast.error('Failed to enroll in course');
            setIsEnrolling(false);
            setSelectedContact(null);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Course Details</h2>}
        >
            <Head title={course.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {viewingContact && (
                        <div className="mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <div className="font-medium text-blue-900 dark:text-blue-100">
                                                Viewing as {viewingContact.first_name} {viewingContact.last_name}
                                            </div>
                                            <div className="text-sm text-blue-700 dark:text-blue-300">{viewingContact.email}</div>
                                        </div>
                                    </div>
                                    <Link href="/courses">
                                        <Button variant="outline" size="sm">
                                            View as Admin
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                    
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
                                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">{course.title}</CardTitle>
                                            <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
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
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                onClick={handleDeleteClick}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{course.lessons_count}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{course.enrolled_count}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatDuration(course.duration_minutes)}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatPrice(course)}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Price</div>
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
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Instructor</h3>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={course.instructor_avatar || '/images/default-avatar.jpg'}
                                                    alt={course.instructor_name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{course.instructor_name}</div>
                                                    {course.instructor_bio && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">{course.instructor_bio}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {course.requirements && course.requirements.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Requirements</h3>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                                {course.requirements.map((requirement, index) => (
                                                    <li key={index}>{requirement}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">What you'll learn</h3>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                                {course.learning_outcomes.map((outcome, index) => (
                                                    <li key={index}>{outcome}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {course.tags && course.tags.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Tags</h3>
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
                                    <CardTitle className="text-gray-900 dark:text-gray-100">Course Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {errors?.enrollment && (
                                        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                            {errors.enrollment}
                                        </div>
                                    )}
                                    
                                    {selectedContact && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm font-medium text-blue-900">
                                                            {selectedContact.first_name} {selectedContact.last_name}
                                                        </div>
                                                        <div className="text-xs text-blue-700">{selectedContact.email}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedContact(null)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3">
                                        <Button 
                                            onClick={handleEnroll}
                                            disabled={isEnrolling || isCheckingEnrollment || isEnrolled}
                                            className="w-full" 
                                            size="lg"
                                            variant={isEnrolled ? "secondary" : "default"}
                                        >
                                            {isCheckingEnrollment ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Checking...
                                                </>
                                            ) : isEnrolled ? (
                                                <>
                                                    <div className="w-4 h-4 mr-2">✓</div>
                                                    Enrolled
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    {isEnrolling ? 'Enrolling...' : selectedContact ? `Enroll ${selectedContact.first_name}` : 'Enroll'}
                                                </>
                                            )}
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="w-full" 
                                            size="lg"
                                            onClick={() => {
                                                const url = selectedContact 
                                                    ? `/courses/${course.id}/learn?contact_id=${selectedContact.id}`
                                                    : `/courses/${course.id}/learn`;
                                                router.visit(url);
                                            }}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Start Learning
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => {
                                                const url = selectedContact 
                                                    ? `/courses/${course.id}/lessons?contact_id=${selectedContact.id}`
                                                    : `/courses/${course.id}/lessons`;
                                                router.visit(url);
                                            }}
                                        >
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            View Lessons
                                        </Button>
                                    </div>

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

                    {/* Delete Confirmation Dialog */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Delete Course
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={handleDeleteCancel}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteConfirm}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Course'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Selector Modal */}
            <ContactSelector
                isOpen={showContactSelector}
                onClose={() => setShowContactSelector(false)}
                onSelect={handleContactSelect}
                title="Select Contact to Enroll"
            />
        </AuthenticatedLayout>
    );
}
