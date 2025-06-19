import { User, Project } from '@/types/index';
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Package, Download, Settings, RefreshCw } from 'lucide-react';
import StockManager from '@/Components/StockManager';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    status: 'draft' | 'published' | 'archived' | 'inactive';
    sku?: string;
    stock_quantity?: number;
    weight?: number;
    dimensions?: string;
    thumbnail_url?: string;
    file_url?: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
    };
    product: Product;
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'physical':
            return <Package className="w-4 h-4" />;
        case 'digital':
            return <Download className="w-4 h-4" />;
        case 'service':
            return <Settings className="w-4 h-4" />;
        case 'subscription':
            return <RefreshCw className="w-4 h-4" />;
        default:
            return <Package className="w-4 h-4" />;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'physical':
            return 'Physical';
        case 'digital':
            return 'Digital';
        case 'service':
            return 'Service';
        case 'subscription':
            return 'Subscription';
        default:
            return type;
    }
};

const getStockStatus = (quantity?: number, type?: string) => {
    if (type === 'digital' || type === 'service' || type === 'subscription') {
        return <Badge variant="secondary">Unlimited</Badge>;
    }
    
    if (quantity === undefined || quantity === null) {
        return <Badge variant="secondary">N/A</Badge>;
    }
    
    if (quantity === 0) {
        return <Badge variant="destructive">Out of Stock</Badge>;
    }
    
    if (quantity <= 10) {
        return <Badge variant="secondary">Low Stock ({quantity})</Badge>;
    }
    
    return <Badge variant="default">In Stock ({quantity})</Badge>;
};

export default function Show({ auth, product }: Props) {
    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Details</h2>}
        >
            <Head title={`${product.name} - Product`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <div className="flex gap-2">
                            <Link href={route('products.edit', product.id)}>
                                <Button variant="outline">Edit</Button>
                            </Link>
                            {product.type === 'digital' && product.file_url && (
                                <Link href={route('products.download', product.id)}>
                                    <Button>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                {product.thumbnail_url && (
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
                                                    : product.status === 'inactive'
                                                    ? 'outline'
                                                    : 'destructive'
                                            }
                                            className="absolute top-2 right-2"
                                        >
                                            {product.status}
                                        </Badge>
                                    </div>
                                )}
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(product.type)}
                                        <span>{getTypeLabel(product.type)} • {product.category}</span>
                                    </div>
                                </CardDescription>
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
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(product.type)}
                                            <span className="text-gray-600">{getTypeLabel(product.type)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
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

                                        {product.sku && (
                                            <div>
                                                <h3 className="font-semibold mb-1">SKU</h3>
                                                <p className="text-gray-600">{product.sku}</p>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="font-semibold mb-1">Category</h3>
                                            <p className="text-gray-600">{product.category}</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-1">Stock Status</h3>
                                            {getStockStatus(product.stock_quantity, product.type)}
                                        </div>

                                        {product.type === 'physical' && (
                                            <>
                                                {product.weight && (
                                                    <div>
                                                        <h3 className="font-semibold mb-1">Weight</h3>
                                                        <p className="text-gray-600">{product.weight} kg</p>
                                                    </div>
                                                )}

                                                {product.dimensions && (
                                                    <div>
                                                        <h3 className="font-semibold mb-1">Dimensions</h3>
                                                        <p className="text-gray-600">{product.dimensions}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div>
                                            <h3 className="font-semibold mb-1">Status</h3>
                                            <Badge
                                                variant={
                                                    product.status === 'published'
                                                        ? 'default'
                                                        : product.status === 'draft'
                                                        ? 'secondary'
                                                        : product.status === 'inactive'
                                                        ? 'outline'
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

                            <StockManager
                                productId={product.id}
                                currentStock={product.stock_quantity || 0}
                                productName={product.name}
                                productType={product.type}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 