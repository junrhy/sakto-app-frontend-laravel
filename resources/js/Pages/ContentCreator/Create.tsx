import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React, { FormEvent, useMemo, useState } from 'react';

interface Props extends PageProps {
    auth: {
        user: any & {
            is_admin?: boolean;
        };
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
    client_identifier: string;
}

export default function Create({ auth, client_identifier }: Props) {
    const { data, setData, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        featured_image: null as File | null,
        author: auth.user.name,
    });

    // Track if a file is selected
    const [fileSelected, setFileSelected] = useState(false);

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const routeUrl = route('content-creator.store');

        // Check if there's a file to upload
        if (data.featured_image instanceof File) {
            // Create FormData for file upload
            const formData = new FormData();

            // Ensure all form fields are properly appended
            formData.append('title', data.title || '');
            formData.append('slug', data.slug || '');
            formData.append('content', data.content || '');
            formData.append('excerpt', data.excerpt || '');
            formData.append('status', data.status || 'draft');
            formData.append('author', data.author || '');
            formData.append('featured_image', data.featured_image);

            // Use Inertia router with FormData
            router.post(routeUrl, formData, {
                forceFormData: true,
                onSuccess: () => {
                    // Success handled by redirect
                },
                onError: (errors) => {
                    console.log('Errors:', errors);
                },
            });
        } else {
            // Use regular data without file
            const formData = {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt,
                status: data.status,
                author: data.author,
            };

            // Use Inertia router with regular data
            router.post(routeUrl, formData, {
                onSuccess: () => {
                    // Success handled by redirect
                },
                onError: (errors) => {
                    console.log('Errors:', errors);
                },
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('featured_image', e.target.files[0]);
            setFileSelected(true);
        } else {
            setData('featured_image', null);
            setFileSelected(false);
        }
    };

    const generateSlug = () => {
        const slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        setData('slug', slug);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('content-creator.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Posts
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                                Create New Post
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Write and publish your post
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Create New Post" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {canEdit ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Main Content */}
                                <div className="space-y-6 lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Post Content</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <InputLabel
                                                    htmlFor="title"
                                                    value="Title"
                                                />
                                                <Input
                                                    id="title"
                                                    type="text"
                                                    value={data.title}
                                                    onChange={(e) =>
                                                        setData(
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full text-lg font-medium"
                                                    placeholder="Enter your post title..."
                                                    required
                                                />
                                                <InputError
                                                    message={errors.title}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="slug"
                                                    value="Slug"
                                                />
                                                <div className="flex space-x-2">
                                                    <Input
                                                        id="slug"
                                                        type="text"
                                                        value={data.slug}
                                                        onChange={(e) =>
                                                            setData(
                                                                'slug',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1 block w-full"
                                                        placeholder="post-url-slug"
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={generateSlug}
                                                        className="mt-1"
                                                    >
                                                        Generate
                                                    </Button>
                                                </div>
                                                <InputError
                                                    message={errors.slug}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="excerpt"
                                                    value="Excerpt"
                                                />
                                                <Textarea
                                                    id="excerpt"
                                                    value={data.excerpt}
                                                    onChange={(e) =>
                                                        setData(
                                                            'excerpt',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full"
                                                    rows={3}
                                                    placeholder="Brief summary of your post..."
                                                />
                                                <InputError
                                                    message={errors.excerpt}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="content"
                                                    value="Content"
                                                />
                                                <Textarea
                                                    id="content"
                                                    value={data.content}
                                                    onChange={(e) =>
                                                        setData(
                                                            'content',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 block w-full"
                                                    rows={15}
                                                    placeholder="Write your post content here..."
                                                    required
                                                />
                                                <InputError
                                                    message={errors.content}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Featured Image
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <Input
                                                    id="featured_image"
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    className="block w-full"
                                                    accept="image/*"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Recommended size: 1200x630px
                                                </p>
                                                <InputError
                                                    message={
                                                        errors.featured_image
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Publish Settings
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="status">
                                                    Status
                                                </Label>
                                                <select
                                                    id="status"
                                                    value={data.status}
                                                    onChange={(e) =>
                                                        setData(
                                                            'status',
                                                            e.target.value as
                                                                | 'draft'
                                                                | 'published',
                                                        )
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                >
                                                    <option value="draft">
                                                        Draft
                                                    </option>
                                                    <option value="published">
                                                        Published
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={errors.status}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div className="border-t pt-4">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <p>
                                                        <strong>Author:</strong>{' '}
                                                        {auth.user.name}
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Created:
                                                        </strong>{' '}
                                                        {new Date().toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Submit Button */}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                {processing
                                                    ? 'Saving...'
                                                    : 'Save Post'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                You don't have permission to create posts.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
