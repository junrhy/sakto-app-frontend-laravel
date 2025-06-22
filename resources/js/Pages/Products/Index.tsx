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
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    SearchIcon, 
    FileDown, 
    Package, 
    Download, 
    ShoppingCart, 
    ListOrdered,
    Filter,
    Grid3X3,
    List,
    MoreHorizontal,
    Star,
    TrendingUp,
    Users,
    Calendar
} from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { useCart } from '@/Components/CartContext';
import { CartButton } from '@/Components/CartButton';
import { ShoppingCartPanel } from '@/Components/ShoppingCart';
import { useTheme } from '@/Components/ThemeProvider';

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
    variants?: Array<{
        id: number;
        sku?: string;
        price?: number;
        stock_quantity: number;
        attributes: Record<string, string>;
        is_active: boolean;
    }>;
    active_variants?: Array<{
        id: number;
        sku?: string;
        price?: number;
        stock_quantity: number;
        attributes: Record<string, string>;
        is_active: boolean;
    }>;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    products: Product[];
    currency: {
        symbol: string;
        code: string;
    };
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'physical':
            return <Package className="w-4 h-4 text-blue-600" />;
        case 'digital':
            return <Download className="w-4 h-4 text-green-600" />;
        case 'service':
            return <span className="w-4 h-4">🔧</span>;
        case 'subscription':
            return <span className="w-4 h-4">🔄</span>;
        default:
            return <Package className="w-4 h-4 text-gray-600" />;
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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'published':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
        case 'archived':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        case 'inactive':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
};

export default function Index({ auth, products, currency }: Props) {
    const [search, setSearch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        status: '',
        priceRange: '',
        stockStatus: ''
    });
    const { addItem, getItemQuantity } = useCart();
    const { theme } = useTheme();

    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower) ||
                product.category.toLowerCase().includes(searchLower) ||
                getTypeLabel(product.type).toLowerCase().includes(searchLower) ||
                product.sku?.toLowerCase().includes(searchLower) ||
                (product.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        // Type filter
        if (filters.type) {
            filtered = filtered.filter(product => product.type === filters.type);
        }

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(product => product.status === filters.status);
        }

        // Price range filter
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            filtered = filtered.filter(product => {
                if (max) {
                    return product.price >= min && product.price <= max;
                }
                return product.price >= min;
            });
        }

        // Stock status filter
        if (filters.stockStatus) {
            filtered = filtered.filter(product => {
                switch (filters.stockStatus) {
                    case 'in-stock':
                        return product.type !== 'physical' || (product.stock_quantity !== undefined && product.stock_quantity > 0);
                    case 'out-of-stock':
                        return product.type === 'physical' && product.stock_quantity !== undefined && product.stock_quantity === 0;
                    case 'low-stock':
                        return product.type === 'physical' && product.stock_quantity !== undefined && product.stock_quantity <= 10 && product.stock_quantity > 0;
                    case 'unlimited':
                        return product.type === 'digital' || product.type === 'service' || product.type === 'subscription';
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [products, search, filters]);

    const clearFilters = () => {
        setFilters({
            category: '',
            type: '',
            status: '',
            priceRange: '',
            stockStatus: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    // Get unique categories, types, and statuses for filter options
    const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
    const types = useMemo(() => [...new Set(products.map(p => p.type))], [products]);
    const statuses = useMemo(() => [...new Set(products.map(p => p.status))], [products]);

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
            return <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">Unlimited</Badge>;
        }
        
        if (quantity === undefined || quantity === null) {
            return <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">N/A</Badge>;
        }
        
        if (quantity === 0) {
            return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
        }
        
        if (quantity <= 10) {
            return <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">Low Stock ({quantity})</Badge>;
        }
        
        return <Badge variant="default" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">In Stock ({quantity})</Badge>;
    };

    const getVariantInfo = (product: Product) => {
        if (!product.active_variants || product.active_variants.length === 0) {
            return null;
        }

        const activeVariants = product.active_variants.filter(v => v.is_active);
        if (activeVariants.length === 0) {
            return null;
        }

        // Get unique attribute keys
        const attributeKeys = new Set<string>();
        activeVariants.forEach(variant => {
            Object.keys(variant.attributes).forEach(key => attributeKeys.add(key));
        });

        return {
            count: activeVariants.length,
            attributes: Array.from(attributeKeys),
            hasVariants: true
        };
    };

    const handleAddToCart = (product: Product) => {
        if (product.type === 'physical' && product.stock_quantity !== undefined && product.stock_quantity <= 0) {
            alert('This product is out of stock');
            return;
        }

        // For products with variants, redirect to product detail page
        if (product.active_variants && product.active_variants.length > 0) {
            router.visit(route('products.show', product.id));
            return;
        }

        // For simple products without variants
        const currentQuantity = getItemQuantity(product.id, 0); // 0 indicates no variant
        if (product.type === 'physical' && product.stock_quantity !== undefined) {
            if (currentQuantity >= product.stock_quantity) {
                alert('Cannot add more items than available in stock');
                return;
            }
        }

        addItem({
            id: product.id,
            productId: product.id,
            variantId: 0, // 0 indicates no variant
            name: product.name,
            quantity: 1,
            price: product.price,
            thumbnail_url: product.thumbnail_url
        });

        alert('Product added to cart!');
    };

    const stats = {
        total: products.length,
        published: products.filter(p => p.status === 'published').length,
        lowStock: products.filter(p => p.type === 'physical' && p.stock_quantity !== undefined && p.stock_quantity <= 10).length,
        categories: new Set(products.map(p => p.category)).size
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                        <div>
                            <h2 className="font-bold text-3xl text-gray-900 dark:text-gray-100">
                                Products
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage your product catalog and inventory
                            </p>
                        </div>
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                            <CartButton />
                            {selectedProducts.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={exportToCSV}
                                    className="flex items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                                >
                                    <FileDown className="w-4 h-4 mr-2" />
                                    Export Selected
                                </Button>
                            )}
                            <Link href={route('product-orders.index')}>
                                <Button variant="outline" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600">
                                    <ListOrdered className="w-4 h-4 mr-2" />
                                    View Orders
                                </Button>
                            </Link>
                            <Link href={route('products.create')}>
                                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Product
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Products</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                                    </div>
                                    <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Published</p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.published}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Low Stock</p>
                                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.lowStock}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Categories</p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.categories}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <Head title="Products" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Search and Filters */}
                    <Card className="mb-8 shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                        <Input
                                            type="search"
                                            placeholder="Search products by name, category, SKU..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="h-8 px-3"
                                        >
                                            <Grid3X3 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="h-8 px-3"
                                        >
                                            <List className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${hasActiveFilters ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''}`}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filters
                                        {hasActiveFilters && (
                                            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                                                {Object.values(filters).filter(v => v !== '').length}
                                            </Badge>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            {showFilters && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                        {/* Category Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={filters.category}
                                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={filters.type}
                                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">All Types</option>
                                                {types.map(type => (
                                                    <option key={type} value={type}>{getTypeLabel(type)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={filters.status}
                                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">All Statuses</option>
                                                {statuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Price Range Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Price Range
                                            </label>
                                            <select
                                                value={filters.priceRange}
                                                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">All Prices</option>
                                                <option value="0-50">Under {currency.symbol}50</option>
                                                <option value="50-100">{currency.symbol}50 - {currency.symbol}100</option>
                                                <option value="100-200">{currency.symbol}100 - {currency.symbol}200</option>
                                                <option value="200-500">{currency.symbol}200 - {currency.symbol}500</option>
                                                <option value="500-">{currency.symbol}500+</option>
                                            </select>
                                        </div>

                                        {/* Stock Status Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Stock Status
                                            </label>
                                            <select
                                                value={filters.stockStatus}
                                                onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">All Stock</option>
                                                <option value="in-stock">In Stock</option>
                                                <option value="out-of-stock">Out of Stock</option>
                                                <option value="low-stock">Low Stock</option>
                                                <option value="unlimited">Unlimited</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Filter Actions */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {filteredProducts.length} of {products.length} products
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearFilters}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-gray-200 dark:border-gray-600"
                                                >
                                                    Clear All Filters
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Products Display */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
                                    {/* Product Image */}
                                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        {product.thumbnail_url ? (
                                            <img
                                                src={product.thumbnail_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                                <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                        {/* Status Badge Overlay */}
                                        <div className="absolute top-3 right-3">
                                            <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                                                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                            </Badge>
                                        </div>
                                        {/* Type Badge Overlay */}
                                        <div className="absolute top-3 left-3">
                                            <div className="flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1">
                                                {getTypeIcon(product.type)}
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {getTypeLabel(product.type)}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Checkbox Overlay */}
                                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                                            <Checkbox
                                                checked={selectedProducts.includes(product.id)}
                                                onCheckedChange={() => toggleSelect(product.id)}
                                                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                                            />
                                        </div>
                                    </div>
                                    
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {product.description}
                                                </p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4" />
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
                                                                <FileDown className="w-4 h-4 mr-2" />
                                                                Download
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">SKU</span>
                                                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{product.sku || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
                                                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                                        {product.category}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Stock</span>
                                                    <div className="text-xs">
                                                        {getStockStatus(product.stock_quantity, product.type)}
                                                    </div>
                                                </div>
                                                {/* Variant Indicator */}
                                                {(() => {
                                                    const variantInfo = getVariantInfo(product);
                                                    if (variantInfo) {
                                                        return (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">Variants</span>
                                                                <Badge variant="secondary" className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                                                                    {variantInfo.count} {variantInfo.attributes.join(', ')}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>

                                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(product.price, currency.symbol)}
                                                    </span>
                                                </div>
                                                
                                                <Button
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={
                                                        product.type === 'physical' && 
                                                        product.stock_quantity !== undefined && 
                                                        product.stock_quantity <= 0
                                                    }
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                                    size="sm"
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    {getVariantInfo(product) ? 'Select' : 'Add'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 dark:bg-gray-700/50">
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead className="w-16">Image</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-32">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.map((product) => (
                                            <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedProducts.includes(product.id)}
                                                        onCheckedChange={() => toggleSelect(product.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        {product.thumbnail_url ? (
                                                            <img
                                                                src={product.thumbnail_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{product.description}</div>
                                                        {/* Variant Indicator */}
                                                        {(() => {
                                                            const variantInfo = getVariantInfo(product);
                                                            if (variantInfo) {
                                                                return (
                                                                    <div className="mt-1">
                                                                        <Badge variant="secondary" className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                                                                            {variantInfo.count} variants ({variantInfo.attributes.join(', ')})
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">{product.sku || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                                        {product.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(product.type)}
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{getTypeLabel(product.type)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(product.price, currency.symbol)}</TableCell>
                                                <TableCell>
                                                    {getStockStatus(product.stock_quantity, product.type)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                                                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={
                                                                product.type === 'physical' && 
                                                                product.stock_quantity !== undefined && 
                                                                product.stock_quantity <= 0
                                                            }
                                                            className="h-8 border-gray-200 dark:border-gray-600"
                                                        >
                                                            <ShoppingCart className="w-3 h-3 mr-1" />
                                                            {getVariantInfo(product) ? 'Select' : 'Add'}
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="w-4 h-4" />
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
                                                                            <FileDown className="w-4 h-4 mr-2" />
                                                                            Download
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDelete(product.id)}
                                                                    className="text-red-600 dark:text-red-400"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {filteredProducts.length === 0 && (
                        <Card className="text-center py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <CardContent>
                                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                    {search ? 'Try adjusting your search terms to find more products.' : 'Get started by creating your first product to build your catalog.'}
                                </p>
                                {!search && (
                                    <Link href={route('products.create')}>
                                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Your First Product
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Shopping Cart Panel */}
            <ShoppingCartPanel currency={currency} />
        </AuthenticatedLayout>
    );
} 