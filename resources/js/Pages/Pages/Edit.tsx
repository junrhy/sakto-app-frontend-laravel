import RichTextEditor from '@/Components/RichTextEditor';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
import { Page, PageFormData } from '@/types/pages';
import { Head, useForm } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    page: Page;
}

interface ValidationErrors {
    [key: string]: string;
}

export default function Edit({ auth, page }: Props) {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {},
    );
    const [localContent, setLocalContent] = useState(page.content);

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const { data, setData, put, processing, errors } = useForm<PageFormData>({
        title: page.title,
        slug: page.slug,
        content: page.content,
        meta_description: page.meta_description || '',
        meta_keywords: page.meta_keywords || '',
        is_published: page.is_published,
        template: page.template || '',
        custom_css: page.custom_css || '',
        custom_js: page.custom_js || '',
        featured_image: null,
    });

    const handleContentChange = (content: string) => {
        setLocalContent(content);
        setData('content', content);
        setValidationErrors((prev) => ({ ...prev, content: '' }));
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
            errors.slug =
                'Slug can only contain lowercase letters, numbers, and hyphens';
        }

        // Content validation
        if (!data.content.trim()) {
            errors.content = 'Content is required';
        } else if (data.content.length < 10) {
            errors.content = 'Content must be at least 10 characters long';
        }

        // Meta description validation
        if (data.meta_description && data.meta_description.length > 160) {
            errors.meta_description =
                'Meta description must not exceed 160 characters';
        }

        // Meta keywords validation
        if (data.meta_keywords) {
            const keywords = data.meta_keywords.split(',').map((k) => k.trim());
            if (keywords.some((k) => k.length === 0)) {
                errors.meta_keywords =
                    'Invalid keyword format. Use comma-separated values';
            }
        }

        // Template validation
        if (data.template && !/^[a-zA-Z0-9-_]+$/.test(data.template)) {
            errors.template =
                'Template name can only contain letters, numbers, hyphens, and underscores';
        }

        // Featured image validation
        if (data.featured_image) {
            const file = data.featured_image as File;
            const validTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
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

        put(route('pages.update', page.id), {
            onSuccess: () => {
                toast.success('Page updated successfully');
                setValidationErrors({});
            },
            onError: (errors) => {
                toast.error('Failed to update page');
                setValidationErrors(errors as ValidationErrors);
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                toast.error('Image must be JPEG, PNG, GIF, or WebP');
                setValidationErrors((prev) => ({
                    ...prev,
                    featured_image: 'Image must be JPEG, PNG, GIF, or WebP',
                }));
                return;
            }
            if (file.size > maxSize) {
                toast.error('Image size must not exceed 5MB');
                setValidationErrors((prev) => ({
                    ...prev,
                    featured_image: 'Image size must not exceed 5MB',
                }));
                return;
            }

            setData('featured_image', file);
            setValidationErrors((prev) => ({ ...prev, featured_image: '' }));
        }
    };

    const getErrorMessage = (field: keyof PageFormData): string | undefined => {
        return validationErrors[field] || errors[field];
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Page" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {canEdit ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Page</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => {
                                                setData(
                                                    'title',
                                                    e.target.value,
                                                );
                                                setValidationErrors((prev) => ({
                                                    ...prev,
                                                    title: '',
                                                }));
                                            }}
                                            required
                                        />
                                        {getErrorMessage('title') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage('title')}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) => {
                                                const newSlug = e.target.value
                                                    .toLowerCase()
                                                    .replace(
                                                        /[^a-z0-9-]/g,
                                                        '-',
                                                    );
                                                setData('slug', newSlug);
                                                setValidationErrors((prev) => ({
                                                    ...prev,
                                                    slug: '',
                                                }));
                                            }}
                                            required
                                        />
                                        {getErrorMessage('slug') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage('slug')}
                                            </p>
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
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage('content')}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_description">
                                            Meta Description
                                        </Label>
                                        <Textarea
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) => {
                                                setData(
                                                    'meta_description',
                                                    e.target.value,
                                                );
                                                setValidationErrors((prev) => ({
                                                    ...prev,
                                                    meta_description: '',
                                                }));
                                            }}
                                            rows={3}
                                        />
                                        {getErrorMessage(
                                            'meta_description',
                                        ) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage(
                                                    'meta_description',
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_keywords">
                                            Meta Keywords
                                        </Label>
                                        <Input
                                            id="meta_keywords"
                                            value={data.meta_keywords}
                                            onChange={(e) => {
                                                setData(
                                                    'meta_keywords',
                                                    e.target.value,
                                                );
                                                setValidationErrors((prev) => ({
                                                    ...prev,
                                                    meta_keywords: '',
                                                }));
                                            }}
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                        {getErrorMessage('meta_keywords') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage(
                                                    'meta_keywords',
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="template">
                                            Template
                                        </Label>
                                        <Select
                                            value={data.template}
                                            onValueChange={(value) => {
                                                setData('template', value);
                                                setValidationErrors((prev) => ({
                                                    ...prev,
                                                    template: '',
                                                }));
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">
                                                    Default Template
                                                </SelectItem>
                                                <SelectItem value="full-width">
                                                    Full Width Template
                                                </SelectItem>
                                                <SelectItem value="sidebar">
                                                    Sidebar Template
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {getErrorMessage('template') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage('template')}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="custom_css">
                                            Custom CSS
                                        </Label>
                                        <Textarea
                                            id="custom_css"
                                            value={data.custom_css}
                                            onChange={(e) => {
                                                setData(
                                                    'custom_css',
                                                    e.target.value,
                                                );
                                                setValidationErrors((prev) => ({
                                                    ...prev,
                                                    custom_css: '',
                                                }));
                                            }}
                                            rows={5}
                                        />
                                        {getErrorMessage('custom_css') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage('custom_css')}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="custom_js">
                                            Custom JavaScript
                                        </Label>
                                        <Textarea
                                            id="custom_js"
                                            value={data.custom_js}
                                            onChange={(e) => {
                                                setData(
                                                    'custom_js',
                                                    e.target.value,
                                                );
                                                setValidationErrors((prev) => ({
                                                    ...prev,
                                                    custom_js: '',
                                                }));
                                            }}
                                            rows={5}
                                        />
                                        {getErrorMessage('custom_js') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage('custom_js')}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="featured_image">
                                            Featured Image
                                        </Label>
                                        {page.featured_image && (
                                            <div className="mb-2">
                                                <img
                                                    src={page.featured_image}
                                                    alt="Current featured image"
                                                    className="max-w-xs rounded-lg"
                                                />
                                            </div>
                                        )}
                                        <Input
                                            id="featured_image"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handleImageChange}
                                        />
                                        {getErrorMessage('featured_image') && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {getErrorMessage(
                                                    'featured_image',
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) =>
                                                setData('is_published', checked)
                                            }
                                        />
                                        <Label htmlFor="is_published">
                                            Published
                                        </Label>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                window.history.back()
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Update Page
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="py-12 text-center">
                            <h2 className="mb-4 text-2xl font-bold">
                                Permission Denied
                            </h2>
                            <p className="text-lg text-gray-700">
                                You do not have permission to edit this page.
                            </p>
                            <Button
                                className="mt-6"
                                onClick={() => window.history.back()}
                            >
                                Go Back
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
