import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
    auth: any;
}

export default function Create({ auth }: Props) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        slug: '',
        thumbnail_url: '',
        video_url: '',
        difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        status: 'draft' as 'draft' | 'published' | 'archived',
        is_featured: false,
        is_free: true,
        price: 0,
        currency: 'PHP',
        duration_minutes: 0,
        tags: [] as string[],
        requirements: [] as string[],
        learning_outcomes: [] as string[],
        instructor_name: '',
        instructor_bio: '',
        instructor_avatar: '',
        category: '',
        subcategory: '',
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
            const response = await axios.post('/courses', formData);
            
            if (response.data.success) {
                toast.success('Course created successfully!');
                router.visit(route('courses.index'));
            } else {
                toast.error(response.data.message || 'Failed to create course');
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Failed to create course. Please try again.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            updateFormData('tags', [...formData.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        updateFormData('tags', formData.tags.filter((_, i) => i !== index));
    };

    const addRequirement = () => {
        if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
            updateFormData('requirements', [...formData.requirements, newRequirement.trim()]);
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        updateFormData('requirements', formData.requirements.filter((_, i) => i !== index));
    };

    const addOutcome = () => {
        if (newOutcome.trim() && !formData.learning_outcomes.includes(newOutcome.trim())) {
            updateFormData('learning_outcomes', [...formData.learning_outcomes, newOutcome.trim()]);
            setNewOutcome('');
        }
    };

    const removeOutcome = (index: number) => {
        updateFormData('learning_outcomes', formData.learning_outcomes.filter((_, i) => i !== index));
    };

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        updateFormData('slug', slug);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Create Course</h2>}
        >
            <Head title="Create Course" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Set up your course details and structure
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Provide the essential details about your course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Course Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => updateFormData('title', e.target.value)}
                                            placeholder="Enter course title"
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="slug">Slug</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="slug"
                                                value={formData.slug}
                                                onChange={(e) => updateFormData('slug', e.target.value)}
                                                placeholder="course-slug"
                                                className={errors.slug ? 'border-red-500' : ''}
                                            />
                                            <Button type="button" variant="outline" onClick={generateSlug}>
                                                Generate
                                            </Button>
                                        </div>
                                        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => updateFormData('description', e.target.value)}
                                        placeholder="Describe your course..."
                                        rows={4}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="difficulty">Difficulty *</Label>
                                        <Select value={formData.difficulty} onValueChange={(value: any) => updateFormData('difficulty', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.difficulty && <p className="text-red-500 text-sm mt-1">{errors.difficulty}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={formData.status} onValueChange={(value: any) => updateFormData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={formData.duration_minutes}
                                            onChange={(e) => updateFormData('duration_minutes', parseInt(e.target.value) || 0)}
                                            placeholder="120"
                                        />
                                        {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                                    </div>
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
                                        onCheckedChange={(checked) => updateFormData('is_free', checked)}
                                    />
                                    <Label htmlFor="is_free">Free Course</Label>
                                </div>

                                {!formData.is_free && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="price">Price *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className={errors.price ? 'border-red-500' : ''}
                                            />
                                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PHP">PHP</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Media */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Media</CardTitle>
                                <CardDescription>
                                    Add images and videos for your course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                                    <Input
                                        id="thumbnail_url"
                                        value={formData.thumbnail_url}
                                        onChange={(e) => updateFormData('thumbnail_url', e.target.value)}
                                        placeholder="https://example.com/thumbnail.jpg"
                                    />
                                    {errors.thumbnail_url && <p className="text-red-500 text-sm mt-1">{errors.thumbnail_url}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="video_url">Preview Video URL</Label>
                                    <Input
                                        id="video_url"
                                        value={formData.video_url}
                                        onChange={(e) => updateFormData('video_url', e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                    {errors.video_url && <p className="text-red-500 text-sm mt-1">{errors.video_url}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instructor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Instructor Information</CardTitle>
                                <CardDescription>
                                    Details about the course instructor
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="instructor_name">Instructor Name</Label>
                                        <Input
                                            id="instructor_name"
                                            value={formData.instructor_name}
                                            onChange={(e) => updateFormData('instructor_name', e.target.value)}
                                            placeholder="John Doe"
                                        />
                                        {errors.instructor_name && <p className="text-red-500 text-sm mt-1">{errors.instructor_name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="instructor_avatar">Instructor Avatar URL</Label>
                                        <Input
                                            id="instructor_avatar"
                                            value={formData.instructor_avatar}
                                            onChange={(e) => updateFormData('instructor_avatar', e.target.value)}
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                        {errors.instructor_avatar && <p className="text-red-500 text-sm mt-1">{errors.instructor_avatar}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="instructor_bio">Instructor Bio</Label>
                                    <Textarea
                                        id="instructor_bio"
                                        value={formData.instructor_bio}
                                        onChange={(e) => updateFormData('instructor_bio', e.target.value)}
                                        placeholder="Tell us about the instructor..."
                                        rows={3}
                                    />
                                    {errors.instructor_bio && <p className="text-red-500 text-sm mt-1">{errors.instructor_bio}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Categories</CardTitle>
                                <CardDescription>
                                    Organize your course with categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => updateFormData('category', e.target.value)}
                                            placeholder="e.g., Technology, Business, Health"
                                        />
                                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="subcategory">Subcategory</Label>
                                        <Input
                                            id="subcategory"
                                            value={formData.subcategory}
                                            onChange={(e) => updateFormData('subcategory', e.target.value)}
                                            placeholder="e.g., Programming, Marketing, Fitness"
                                        />
                                        {errors.subcategory && <p className="text-red-500 text-sm mt-1">{errors.subcategory}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                                <CardDescription>
                                    Add tags to help students find your course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add a tag..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <Button type="button" onClick={addTag}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(index)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                                <CardDescription>
                                    What students need to know before taking this course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newRequirement}
                                        onChange={(e) => setNewRequirement(e.target.value)}
                                        placeholder="Add a requirement..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                    />
                                    <Button type="button" onClick={addRequirement}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {formData.requirements.length > 0 && (
                                    <ul className="space-y-2">
                                        {formData.requirements.map((requirement, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                <span className="flex-1">{requirement}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRequirement(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Learning Outcomes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Learning Outcomes</CardTitle>
                                <CardDescription>
                                    What students will learn from this course
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newOutcome}
                                        onChange={(e) => setNewOutcome(e.target.value)}
                                        placeholder="Add a learning outcome..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                                    />
                                    <Button type="button" onClick={addOutcome}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {formData.learning_outcomes.length > 0 && (
                                    <ul className="space-y-2">
                                        {formData.learning_outcomes.map((outcome, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                <span className="flex-1">{outcome}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOutcome(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>
                                    Additional course settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onCheckedChange={(checked) => updateFormData('is_featured', checked)}
                                    />
                                    <Label htmlFor="is_featured">Featured Course</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                {processing ? 'Creating...' : 'Create Course'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
