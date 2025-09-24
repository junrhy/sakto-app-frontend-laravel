import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

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

export default function Edit({ auth, course }: Props) {
    const [formData, setFormData] = useState({
        title: course.title,
        description: course.description,
        slug: course.slug,
        thumbnail_url: course.thumbnail_url || '',
        video_url: course.video_url || '',
        difficulty: course.difficulty,
        status: course.status,
        is_featured: course.is_featured,
        is_free: course.is_free,
        price: course.price || 0,
        currency: course.currency,
        duration_minutes: course.duration_minutes || 0,
        tags: course.tags || [],
        requirements: course.requirements || [],
        learning_outcomes: course.learning_outcomes || [],
        instructor_name: course.instructor_name || '',
        instructor_bio: course.instructor_bio || '',
        instructor_avatar: course.instructor_avatar || '',
        category: course.category || '',
        subcategory: course.subcategory || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const [newTag, setNewTag] = useState('');
    const [newRequirement, setNewRequirement] = useState('');
    const [newOutcome, setNewOutcome] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await axios.put(`/courses/${course.id}`, formData);

            if (response.data.success) {
                toast.success('Course updated successfully!');
                router.visit(route('courses.index'));
            } else {
                toast.error(response.data.message || 'Failed to update course');
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Failed to update course. Please try again.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            updateFormData('tags', [...formData.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        updateFormData(
            'tags',
            formData.tags.filter((_, i) => i !== index),
        );
    };

    const addRequirement = () => {
        if (
            newRequirement.trim() &&
            !formData.requirements.includes(newRequirement.trim())
        ) {
            updateFormData('requirements', [
                ...formData.requirements,
                newRequirement.trim(),
            ]);
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        updateFormData(
            'requirements',
            formData.requirements.filter((_, i) => i !== index),
        );
    };

    const addOutcome = () => {
        if (
            newOutcome.trim() &&
            !formData.learning_outcomes.includes(newOutcome.trim())
        ) {
            updateFormData('learning_outcomes', [
                ...formData.learning_outcomes,
                newOutcome.trim(),
            ]);
            setNewOutcome('');
        }
    };

    const removeOutcome = (index: number) => {
        updateFormData(
            'learning_outcomes',
            formData.learning_outcomes.filter((_, i) => i !== index),
        );
    };

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        updateFormData('slug', slug);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Edit Course
                </h2>
            }
        >
            <Head title={`Edit ${course.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Edit Course
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Update your course details and structure
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Update the essential details about your
                                    course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="title">
                                            Course Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                updateFormData(
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter course title"
                                            className={
                                                errors.title
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="slug">Slug</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="slug"
                                                value={formData.slug}
                                                onChange={(e) =>
                                                    updateFormData(
                                                        'slug',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="course-slug"
                                                className={
                                                    errors.slug
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={generateSlug}
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                        {errors.slug && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            updateFormData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Describe your course..."
                                        rows={4}
                                        className={
                                            errors.description
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="difficulty">
                                            Difficulty *
                                        </Label>
                                        <Select
                                            value={formData.difficulty}
                                            onValueChange={(value: any) =>
                                                updateFormData(
                                                    'difficulty',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                        {errors.difficulty && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.difficulty}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value: any) =>
                                                updateFormData('status', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">
                                                    Draft
                                                </SelectItem>
                                                <SelectItem value="published">
                                                    Published
                                                </SelectItem>
                                                <SelectItem value="archived">
                                                    Archived
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="duration">
                                            Duration (minutes)
                                        </Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={formData.duration_minutes}
                                            onChange={(e) =>
                                                updateFormData(
                                                    'duration_minutes',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            placeholder="120"
                                        />
                                        {errors.duration_minutes && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.duration_minutes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) =>
                                                updateFormData(
                                                    'category',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Programming, Design, Business"
                                        />
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="subcategory">
                                            Subcategory
                                        </Label>
                                        <Input
                                            id="subcategory"
                                            value={formData.subcategory}
                                            onChange={(e) =>
                                                updateFormData(
                                                    'subcategory',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Web Development, UI/UX, Marketing"
                                        />
                                        {errors.subcategory && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.subcategory}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media & Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Media & Links</CardTitle>
                                <CardDescription>
                                    Add images and video content for your course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="thumbnail_url">
                                        Thumbnail URL
                                    </Label>
                                    <Input
                                        id="thumbnail_url"
                                        value={formData.thumbnail_url}
                                        onChange={(e) =>
                                            updateFormData(
                                                'thumbnail_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://example.com/thumbnail.jpg"
                                        type="url"
                                    />
                                    {errors.thumbnail_url && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.thumbnail_url}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="video_url">Video URL</Label>
                                    <Input
                                        id="video_url"
                                        value={formData.video_url}
                                        onChange={(e) =>
                                            updateFormData(
                                                'video_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://youtube.com/watch?v=..."
                                        type="url"
                                    />
                                    {errors.video_url && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.video_url}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                                <CardDescription>
                                    Set the pricing for your course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_free"
                                        checked={formData.is_free}
                                        onCheckedChange={(checked) =>
                                            updateFormData('is_free', checked)
                                        }
                                    />
                                    <Label htmlFor="is_free">Free Course</Label>
                                </div>

                                {!formData.is_free && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="price">Price</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) =>
                                                    updateFormData(
                                                        'price',
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                placeholder="29.99"
                                            />
                                            {errors.price && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.price}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="currency">
                                                Currency
                                            </Label>
                                            <Select
                                                value={formData.currency}
                                                onValueChange={(value: any) =>
                                                    updateFormData(
                                                        'currency',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PHP">
                                                        PHP
                                                    </SelectItem>
                                                    <SelectItem value="USD">
                                                        USD
                                                    </SelectItem>
                                                    <SelectItem value="EUR">
                                                        EUR
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.currency && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.currency}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Instructor Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Instructor Information</CardTitle>
                                <CardDescription>
                                    Add details about the course instructor
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="instructor_name">
                                        Instructor Name
                                    </Label>
                                    <Input
                                        id="instructor_name"
                                        value={formData.instructor_name}
                                        onChange={(e) =>
                                            updateFormData(
                                                'instructor_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="John Doe"
                                    />
                                    {errors.instructor_name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.instructor_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="instructor_bio">
                                        Instructor Bio
                                    </Label>
                                    <Textarea
                                        id="instructor_bio"
                                        value={formData.instructor_bio}
                                        onChange={(e) =>
                                            updateFormData(
                                                'instructor_bio',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Tell us about the instructor..."
                                        rows={3}
                                    />
                                    {errors.instructor_bio && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.instructor_bio}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="instructor_avatar">
                                        Instructor Avatar URL
                                    </Label>
                                    <Input
                                        id="instructor_avatar"
                                        value={formData.instructor_avatar}
                                        onChange={(e) =>
                                            updateFormData(
                                                'instructor_avatar',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://example.com/avatar.jpg"
                                        type="url"
                                    />
                                    {errors.instructor_avatar && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.instructor_avatar}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                                <CardDescription>
                                    Add tags, requirements, and learning
                                    outcomes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Tags */}
                                <div>
                                    <Label>Tags</Label>
                                    <div className="mb-2 flex gap-2">
                                        <Input
                                            value={newTag}
                                            onChange={(e) =>
                                                setNewTag(e.target.value)
                                            }
                                            placeholder="Add a tag"
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(), addTag())
                                            }
                                        />
                                        <Button type="button" onClick={addTag}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-blue-800"
                                            >
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeTag(index)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div>
                                    <Label>Requirements</Label>
                                    <div className="mb-2 flex gap-2">
                                        <Input
                                            value={newRequirement}
                                            onChange={(e) =>
                                                setNewRequirement(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Add a requirement"
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                addRequirement())
                                            }
                                        />
                                        <Button
                                            type="button"
                                            onClick={addRequirement}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.requirements.map(
                                            (requirement, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 rounded bg-gray-100 p-2"
                                                >
                                                    <span className="flex-1">
                                                        {requirement}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeRequirement(
                                                                index,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                {/* Learning Outcomes */}
                                <div>
                                    <Label>Learning Outcomes</Label>
                                    <div className="mb-2 flex gap-2">
                                        <Input
                                            value={newOutcome}
                                            onChange={(e) =>
                                                setNewOutcome(e.target.value)
                                            }
                                            placeholder="Add a learning outcome"
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                addOutcome())
                                            }
                                        />
                                        <Button
                                            type="button"
                                            onClick={addOutcome}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.learning_outcomes.map(
                                            (outcome, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 rounded bg-green-100 p-2"
                                                >
                                                    <span className="flex-1">
                                                        {outcome}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeOutcome(index)
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>
                                    Configure additional course settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onCheckedChange={(checked) =>
                                            updateFormData(
                                                'is_featured',
                                                checked,
                                            )
                                        }
                                    />
                                    <Label htmlFor="is_featured">
                                        Featured Course
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Updating...' : 'Update Course'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
