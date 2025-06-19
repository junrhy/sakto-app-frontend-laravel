import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, SearchIcon, FileDown, Package, Download } from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

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
    products: Product[];
    currency: {
        symbol: string;
    };
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'physical':
            return <Package className="w-4 h-4" />;
        case 'digital':
            return <Download className="w-4 h-4" />;
        case 'service':
            return <span className="w-4 h-4">🔧</span>;
        case 'subscription':
            return <span className="w-4 h-4">🔄</span>;
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

export default function Index({ auth, products, currency }: Props) {
    const [search, setSearch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products;
        const searchLower = search.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower) ||
            getTypeLabel(product.type).toLowerCase().includes(searchLower) ||
            product.sku?.toLowerCase().includes(searchLower) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }, [products, search]);

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(product => product.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(productId => productId !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = products.filter(product => selectedProducts.includes(product.id));
        const headers = ['Name', 'SKU', 'Category', 'Type', 'Price', 'Stock', 'Status', 'Last Updated'];
        const csvData = selectedData.map(product => [
            product.name,
            product.sku || '',
            product.category,
            getTypeLabel(product.type),
            `${currency.symbol}${product.price.toFixed(2)}`,
            product.stock_quantity || 'N/A',
            product.status,
            format(new Date(product.updated_at), 'PPP')
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'products.csv';
        link.click();
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(route('products.destroy', id));
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Products
                    </h2>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-[300px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            />
                        </div>
                        {selectedProducts.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={exportToCSV}
                                className="flex items-center"
                            >
                                <FileDown className="w-4 h-4 mr-2" />
                                Export Selected
                            </Button>
                        )}
                        <Link href={route('products.create')}>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Product
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedProducts.length === filteredProducts.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedProducts.includes(product.id)}
                                                    onCheckedChange={() => toggleSelect(product.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.sku || '-'}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(product.type)}
                                                    <span>{getTypeLabel(product.type)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatCurrency(product.price, currency.symbol)}</TableCell>
                                            <TableCell>
                                                {getStockStatus(product.stock_quantity, product.type)}
                                            </TableCell>
                                            <TableCell>
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
                                            </TableCell>
                                            <TableCell>{format(new Date(product.updated_at), 'PPP')}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                            </svg>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('products.show', product.id)}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('products.edit', product.id)}>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {product.type === 'digital' && product.file_url && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('products.download', product.id)}>
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Download
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(product.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 