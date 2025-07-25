import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageFormData } from '@/types/pages';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { toast } from 'sonner';
import RichTextEditor from '@/Components/RichTextEditor';

interface ValidationErrors {
    [key: string]: string;
}

interface Props {
    auth: { 
        user: any;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
}

export default function Create({ auth }: Props) {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [localContent, setLocalContent] = useState('');

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const { data, setData, post, processing, errors } = useForm<PageFormData>({
        title: '',
        slug: '',
        content: '',
        meta_description: '',
        meta_keywords: '',
        is_published: false,
        template: '',
        custom_css: '',
        custom_js: '',
        featured_image: null,
    });

    const handleContentChange = (content: string) => {
        setLocalContent(content);
        setData('content', content);
        setValidationErrors(prev => ({ ...prev, content: '' }));
    };

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        // Title validation
        if (!data.title.trim()) {
            errors.title = 'Title is required';
        } else if (data.title.length < 3) {
            errors.title = 'Title must be at least 3 characters long';
        }

        // Slug validation
        if (!data.slug.trim()) {
            errors.slug = 'Slug is required';
        } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
            errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }

        // Content validation
        if (!data.content.trim()) {
            errors.content = 'Content is required';
        } else if (data.content.length < 10) {
            errors.content = 'Content must be at least 10 characters long';
        }

        // Meta description validation
        if (data.meta_description && data.meta_description.length > 160) {
            errors.meta_description = 'Meta description must not exceed 160 characters';
        }

        // Meta keywords validation
        if (data.meta_keywords) {
            const keywords = data.meta_keywords.split(',').map(k => k.trim());
            if (keywords.some(k => k.length === 0)) {
                errors.meta_keywords = 'Invalid keyword format. Use comma-separated values';
            }
        }

        // Template validation
        if (data.template && !/^[a-zA-Z0-9-_]+$/.test(data.template)) {
            errors.template = 'Template name can only contain letters, numbers, hyphens, and underscores';
        }

        // Featured image validation
        if (data.featured_image) {
            const file = data.featured_image as File;
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                errors.featured_image = 'Image must be JPEG, PNG, GIF, or WebP';
            } else if (file.size > maxSize) {
                errors.featured_image = 'Image size must not exceed 5MB';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        post(route('pages.store'), {
            onSuccess: () => {
                toast.success('Page created successfully');
                setValidationErrors({});
            },
            onError: (errors) => {
                toast.error('Failed to create page');
                setValidationErrors(errors as ValidationErrors);
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                toast.error('Image must be JPEG, PNG, GIF, or WebP');
                setValidationErrors(prev => ({ ...prev, featured_image: 'Image must be JPEG, PNG, GIF, or WebP' }));
                return;
            }
            if (file.size > maxSize) {
                toast.error('Image size must not exceed 5MB');
                setValidationErrors(prev => ({ ...prev, featured_image: 'Image size must not exceed 5MB' }));
                return;
            }

            setData('featured_image', file);
            setValidationErrors(prev => ({ ...prev, featured_image: '' }));
        }
    };

    const getErrorMessage = (field: keyof PageFormData): string | undefined => {
        return validationErrors[field] || errors[field];
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Page" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {canEdit ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Page</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={e => {
                                                setData('title', e.target.value);
                                                setValidationErrors(prev => ({ ...prev, title: '' }));
                                            }}
                                            required
                                        />
                                        {getErrorMessage('title') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('title')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={e => {
                                                const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                                                setData('slug', newSlug);
                                                setValidationErrors(prev => ({ ...prev, slug: '' }));
                                            }}
                                            required
                                        />
                                        {getErrorMessage('slug') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('slug')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="content">Content</Label>
                                        <RichTextEditor
                                            content={localContent}
                                            onChange={handleContentChange}
                                            placeholder="Write your page content here..."
                                        />
                                        {getErrorMessage('content') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('content')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <Textarea
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={e => {
                                                setData('meta_description', e.target.value);
                                                setValidationErrors(prev => ({ ...prev, meta_description: '' }));
                                            }}
                                            rows={3}
                                        />
                                        {getErrorMessage('meta_description') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('meta_description')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                        <Input
                                            id="meta_keywords"
                                            value={data.meta_keywords}
                                            onChange={e => {
                                                setData('meta_keywords', e.target.value);
                                                setValidationErrors(prev => ({ ...prev, meta_keywords: '' }));
                                            }}
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                        {getErrorMessage('meta_keywords') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('meta_keywords')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="template">Template</Label>
                                        <Select
                                            value={data.template}
                                            onValueChange={(value) => {
                                                setData('template', value);
                                                setValidationErrors(prev => ({ ...prev, template: '' }));
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">Default Template</SelectItem>
                                                <SelectItem value="full-width">Full Width Template</SelectItem>
                                                <SelectItem value="sidebar">Sidebar Template</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {getErrorMessage('template') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('template')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="custom_css">Custom CSS</Label>
                                        <Textarea
                                            id="custom_css"
                                            value={data.custom_css}
                                            onChange={e => {
                                                setData('custom_css', e.target.value);
                                                setValidationErrors(prev => ({ ...prev, custom_css: '' }));
                                            }}
                                            rows={5}
                                        />
                                        {getErrorMessage('custom_css') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('custom_css')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="custom_js">Custom JavaScript</Label>
                                        <Textarea
                                            id="custom_js"
                                            value={data.custom_js}
                                            onChange={e => {
                                                setData('custom_js', e.target.value);
                                                setValidationErrors(prev => ({ ...prev, custom_js: '' }));
                                            }}
                                            rows={5}
                                        />
                                        {getErrorMessage('custom_js') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('custom_js')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="featured_image">Featured Image</Label>
                                        <Input
                                            id="featured_image"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handleImageChange}
                                        />
                                        {getErrorMessage('featured_image') && (
                                            <p className="text-sm text-red-600 mt-1">{getErrorMessage('featured_image')}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) => setData('is_published', checked)}
                                        />
                                        <Label htmlFor="is_published">Publish immediately</Label>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Create Page
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold mb-4">Permission Denied</h2>
                            <p className="text-lg text-gray-700">You do not have sufficient permissions to create new pages.</p>
                            <p className="text-lg text-gray-700">Please contact an administrator if you need access.</p>
                            <Button className="mt-6" onClick={() => window.history.back()}>
                                Go Back
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 