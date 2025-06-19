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
        sku: '',
        stock_quantity: '',
        weight: '',
        dimensions: '',
        status: 'draft',
        tags: [] as string[],
        file: null as File | null,
        thumbnail: null as File | null,
    });

    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.store'));
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

    const isDigitalProduct = data.type === 'digital';

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Product</h2>}
        >
            <Head title="Create Product" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Product</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <InputLabel htmlFor="sku" value="SKU" />
                                        <Input
                                            id="sku"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.sku}
                                            onChange={e => setData('sku', e.target.value)}
                                            placeholder="Stock Keeping Unit"
                                        />
                                        <InputError message={errors.sku} className="mt-2" />
                                    </div>
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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                <SelectItem value="physical">Physical</SelectItem>
                                                <SelectItem value="digital">Digital</SelectItem>
                                                <SelectItem value="service">Service</SelectItem>
                                                <SelectItem value="subscription">Subscription</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.type} className="mt-2" />
                                    </div>
                                </div>

                                {/* Physical product fields */}
                                {data.type === 'physical' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <InputLabel htmlFor="stock_quantity" value="Stock Quantity" />
                                            <Input
                                                id="stock_quantity"
                                                type="number"
                                                min="0"
                                                className="mt-1 block w-full"
                                                value={data.stock_quantity}
                                                onChange={e => setData('stock_quantity', e.target.value)}
                                            />
                                            <InputError message={errors.stock_quantity} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="weight" value="Weight (kg)" />
                                            <Input
                                                id="weight"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="mt-1 block w-full"
                                                value={data.weight}
                                                onChange={e => setData('weight', e.target.value)}
                                            />
                                            <InputError message={errors.weight} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="dimensions" value="Dimensions" />
                                            <Input
                                                id="dimensions"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.dimensions}
                                                onChange={e => setData('dimensions', e.target.value)}
                                                placeholder="L x W x H cm"
                                            />
                                            <InputError message={errors.dimensions} className="mt-2" />
                                        </div>
                                    </div>
                                )}

                                {/* Digital product fields */}
                                {isDigitalProduct && (
                                    <div>
                                        <Label htmlFor="file">Product File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            className="mt-1 block w-full"
                                            onChange={(e) => handleFileChange(e, 'file')}
                                            accept=".pdf,.doc,.docx,.txt,.zip,.rar,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Max file size: 100MB. Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR, MP4, MP3, JPG, PNG, GIF
                                        </p>
                                        <InputError message={errors.file} className="mt-2" />
                                    </div>
                                )}

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
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        className="mt-1 block w-full"
                                        onChange={(e) => handleFileChange(e, 'thumbnail')}
                                        accept="image/*"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Max file size: 2MB. Supported formats: JPG, PNG, GIF
                                    </p>
                                    <InputError message={errors.thumbnail} className="mt-2" />
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

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                        disabled={processing}
                                    >
                                        Reset
                                    </Button>
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