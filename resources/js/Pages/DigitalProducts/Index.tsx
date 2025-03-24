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
    products: DigitalProduct[];
}

export default function Index({ auth, products }: Props) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Digital Products</h2>}
        >
            <Head title="Digital Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Digital Products</h1>
                        <Link href={route('digital-products.create')}>
                            <Button>Create New Product</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <Card key={product.id} className="hover:shadow-lg transition-shadow">
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
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {product.tags.map((tag) => (
                                            <Badge key={tag} variant="outline">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">
                                            {formatCurrency(product.price)}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link href={route('digital-products.edit', product.id)}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Link href={route('digital-products.show', product.id)}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 