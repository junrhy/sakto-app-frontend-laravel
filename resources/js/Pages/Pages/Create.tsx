import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageFormData } from '@/types/pages';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { toast } from 'sonner';

export default function Create() {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('pages.store'), {
            onSuccess: () => {
                toast.success('Page created successfully');
            },
            onError: () => {
                toast.error('Failed to create page');
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('featured_image', e.target.files[0]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Page" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                                        onChange={e => setData('title', e.target.value)}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={e => setData('slug', e.target.value)}
                                        required
                                    />
                                    {errors.slug && (
                                        <p className="text-sm text-red-600">{errors.slug}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={e => setData('content', e.target.value)}
                                        required
                                        rows={10}
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-red-600">{errors.content}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={data.meta_description}
                                        onChange={e => setData('meta_description', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.meta_description && (
                                        <p className="text-sm text-red-600">{errors.meta_description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                    <Input
                                        id="meta_keywords"
                                        value={data.meta_keywords}
                                        onChange={e => setData('meta_keywords', e.target.value)}
                                    />
                                    {errors.meta_keywords && (
                                        <p className="text-sm text-red-600">{errors.meta_keywords}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="template">Template</Label>
                                    <Input
                                        id="template"
                                        value={data.template}
                                        onChange={e => setData('template', e.target.value)}
                                    />
                                    {errors.template && (
                                        <p className="text-sm text-red-600">{errors.template}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="custom_css">Custom CSS</Label>
                                    <Textarea
                                        id="custom_css"
                                        value={data.custom_css}
                                        onChange={e => setData('custom_css', e.target.value)}
                                        rows={5}
                                    />
                                    {errors.custom_css && (
                                        <p className="text-sm text-red-600">{errors.custom_css}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="custom_js">Custom JavaScript</Label>
                                    <Textarea
                                        id="custom_js"
                                        value={data.custom_js}
                                        onChange={e => setData('custom_js', e.target.value)}
                                        rows={5}
                                    />
                                    {errors.custom_js && (
                                        <p className="text-sm text-red-600">{errors.custom_js}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="featured_image">Featured Image</Label>
                                    <Input
                                        id="featured_image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {errors.featured_image && (
                                        <p className="text-sm text-red-600">{errors.featured_image}</p>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 