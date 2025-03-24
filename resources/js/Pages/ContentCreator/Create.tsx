import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Content } from '@/types/content';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Card } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { FormEvent } from 'react';

interface Props extends PageProps {
    client_identifier: string;
}

export default function Create({ auth, client_identifier }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        type: 'article',
        featured_image: null as File | null,
        meta_title: '',
        meta_description: '',
        tags: [] as string[],
        categories: [] as string[],
        author_id: auth.user.id,
        scheduled_at: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('content.store'));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('featured_image', e.target.files[0]);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Content</h2>}
        >
            <Head title="Create Content" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Tabs defaultValue="content" className="w-full">
                                    <TabsList>
                                        <TabsTrigger value="content">Content</TabsTrigger>
                                        <TabsTrigger value="meta">Meta</TabsTrigger>
                                        <TabsTrigger value="settings">Settings</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="content" className="space-y-6">
                                        <div>
                                            <InputLabel htmlFor="title" value="Title" />
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="slug" value="Slug" />
                                            <Input
                                                id="slug"
                                                type="text"
                                                value={data.slug}
                                                onChange={e => setData('slug', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.slug} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="content" value="Content" />
                                            <Textarea
                                                id="content"
                                                value={data.content}
                                                onChange={e => setData('content', e.target.value)}
                                                className="mt-1 block w-full"
                                                rows={10}
                                                required
                                            />
                                            <InputError message={errors.content} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="excerpt" value="Excerpt" />
                                            <Textarea
                                                id="excerpt"
                                                value={data.excerpt}
                                                onChange={e => setData('excerpt', e.target.value)}
                                                className="mt-1 block w-full"
                                                rows={3}
                                            />
                                            <InputError message={errors.excerpt} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="featured_image" value="Featured Image" />
                                            <Input
                                                id="featured_image"
                                                type="file"
                                                onChange={handleImageChange}
                                                className="mt-1 block w-full"
                                                accept="image/*"
                                            />
                                            <InputError message={errors.featured_image} className="mt-2" />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="meta" className="space-y-6">
                                        <div>
                                            <InputLabel htmlFor="meta_title" value="Meta Title" />
                                            <Input
                                                id="meta_title"
                                                type="text"
                                                value={data.meta_title}
                                                onChange={e => setData('meta_title', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.meta_title} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="meta_description" value="Meta Description" />
                                            <Textarea
                                                id="meta_description"
                                                value={data.meta_description}
                                                onChange={e => setData('meta_description', e.target.value)}
                                                className="mt-1 block w-full"
                                                rows={3}
                                            />
                                            <InputError message={errors.meta_description} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="tags" value="Tags" />
                                            <Input
                                                id="tags"
                                                type="text"
                                                value={data.tags.join(', ')}
                                                onChange={e => setData('tags', e.target.value.split(',').map(tag => tag.trim()))}
                                                className="mt-1 block w-full"
                                                placeholder="Enter tags separated by commas"
                                            />
                                            <InputError message={errors.tags} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="categories" value="Categories" />
                                            <Input
                                                id="categories"
                                                type="text"
                                                value={data.categories.join(', ')}
                                                onChange={e => setData('categories', e.target.value.split(',').map(cat => cat.trim()))}
                                                className="mt-1 block w-full"
                                                placeholder="Enter categories separated by commas"
                                            />
                                            <InputError message={errors.categories} className="mt-2" />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="space-y-6">
                                        <div>
                                            <InputLabel htmlFor="status" value="Status" />
                                            <Select
                                                value={data.status}
                                                onValueChange={(value: 'draft' | 'published' | 'archived') => setData('status', value)}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="archived">Archived</option>
                                            </Select>
                                            <InputError message={errors.status} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="type" value="Type" />
                                            <Select
                                                value={data.type}
                                                onValueChange={(value: 'article' | 'page' | 'post') => setData('type', value)}
                                            >
                                                <option value="article">Article</option>
                                                <option value="page">Page</option>
                                                <option value="post">Post</option>
                                            </Select>
                                            <InputError message={errors.type} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="scheduled_at" value="Schedule Publication" />
                                            <Input
                                                id="scheduled_at"
                                                type="datetime-local"
                                                value={data.scheduled_at}
                                                onChange={e => setData('scheduled_at', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.scheduled_at} className="mt-2" />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton disabled={processing}>
                                        Create Content
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 