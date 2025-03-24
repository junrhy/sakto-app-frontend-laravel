import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface DigitalProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    type: string;
    status: 'draft' | 'published' | 'archived';
    thumbnail_url: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    product: DigitalProduct;
}

export default function Show({ auth, product }: Props) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Digital Product Details</h2>}
        >
            <Head title={`${product.name} - Digital Product`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <div className="flex gap-2">
                            <Link href={route('digital-products.edit', product.id)}>
                                <Button variant="outline">Edit</Button>
                            </Link>
                            <Link href={route('digital-products.download', product.id)}>
                                <Button>Download</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="aspect-video relative mb-4">
                                    <img
                                        src={product.thumbnail_url}
                                        alt={product.name}
                                        className="object-cover rounded-md w-full h-full"
                                    />
                                    <Badge
                                        variant={
                                            product.status === 'published'
                                                ? 'default'
                                                : product.status === 'draft'
                                                ? 'secondary'
                                                : 'destructive'
                                        }
                                        className="absolute top-2 right-2"
                                    >
                                        {product.status}
                                    </Badge>
                                </div>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>{product.category}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag) => (
                                                <Badge key={tag} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Product Type</h3>
                                        <p className="text-gray-600 capitalize">{product.type}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-1">Price</h3>
                                        <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-1">Category</h3>
                                        <p className="text-gray-600">{product.category}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-1">Status</h3>
                                        <Badge
                                            variant={
                                                product.status === 'published'
                                                    ? 'default'
                                                    : product.status === 'draft'
                                                    ? 'secondary'
                                                    : 'destructive'
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-1">Created At</h3>
                                        <p className="text-gray-600">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-1">Last Updated</h3>
                                        <p className="text-gray-600">
                                            {new Date(product.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 