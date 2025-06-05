import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
    };
    client_identifier: string;
}

export default function Create({ auth, client_identifier }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        category: '',
        type: '',
        status: 'draft',
        tags: [] as string[],
        file: null as File | null,
        thumbnail: null as File | null,
    });

    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('digital-products.store'));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'file' | 'thumbnail') => {
        if (e.target.files && e.target.files[0]) {
            setData(field, e.target.files[0]);
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            if (!data.tags.includes(newTag.trim())) {
                setData('tags', [...data.tags, newTag.trim()]);
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Digital Product</h2>}
        >
            <Head title="Create Digital Product" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Digital Product</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <Input
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <Textarea
                                        id="description"
                                        className="mt-1 block w-full"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="price" value="Price" />
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.price} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category" value="Category" />
                                    <Input
                                        id="category"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ebook">Ebook</SelectItem>
                                            <SelectItem value="course">Course</SelectItem>
                                            <SelectItem value="software">Software</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="tags">Tags</Label>
                                    <Input
                                        id="tags"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        onKeyDown={addTag}
                                        placeholder="Press Enter to add tags"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {data.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="cursor-pointer"
                                                onClick={() => removeTag(tag)}
                                            >
                                                {tag} ×
                                            </Badge>
                                        ))}
                                    </div>
                                    <InputError message={errors.tags} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="file">Product File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        className="mt-1 block w-full"
                                        onChange={e => handleFileChange(e, 'file')}
                                        required
                                    />
                                    <InputError message={errors.file} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="thumbnail">Thumbnail</Label>
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        className="mt-1 block w-full"
                                        onChange={e => handleFileChange(e, 'thumbnail')}
                                    />
                                    <InputError message={errors.thumbnail} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton disabled={processing}>
                                        Create Product
                                    </PrimaryButton>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 