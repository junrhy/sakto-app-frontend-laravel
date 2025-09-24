import { CartButton } from '@/Components/CartButton';
import { useCart } from '@/Components/CartContext';
import { ShoppingCartPanel } from '@/Components/ShoppingCart';
import { useTheme } from '@/Components/ThemeProvider';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { useToast } from '@/Components/ui/use-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Download,
    Edit,
    Eye,
    FileDown,
    Filter,
    Flag,
    Grid3X3,
    List,
    ListOrdered,
    MoreHorizontal,
    Package,
    Plus,
    SearchIcon,
    ShoppingCart,
    Star,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// Product Image Carousel Component for Grid View
const ProductImageCarousel = ({
    images,
    productName,
}: {
    images: string[];
    productName: string;
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (images.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt={productName}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        );
    }

    return (
        <div className="group relative h-full w-full">
            {/* Main Image */}
            <img
                src={images[currentImageIndex]}
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Image Counter */}
            <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {currentImageIndex + 1} / {images.length}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                    );
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
            >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                    );
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
            >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>

            {/* Image Dots */}
            {images.length > 2 && (
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                            }}
                            className={`h-2 w-2 rounded-full transition-colors ${
                                index === currentImageIndex
                                    ? 'bg-white'
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Compact Product Image Component for Table View
const CompactProductImage = ({
    images,
    productName,
}: {
    images: string[];
    productName: string;
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (images.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
                <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt={productName}
                className="h-full w-full object-cover"
            />
        );
    }

    return (
        <div className="group relative h-full w-full">
            {/* Main Image */}
            <img
                src={images[currentImageIndex]}
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                className="h-full w-full object-cover"
            />

            {/* Image Counter Badge */}
            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {images.length}
            </div>

            {/* Navigation on Hover */}
            <div className="absolute inset-0 flex items-center justify-between bg-black/20 px-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1,
                        );
                    }}
                    className="rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                >
                    <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                            prev === images.length - 1 ? 0 : prev + 1,
                        );
                    }}
                    className="rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                >
                    <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

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
    images?: Array<{
        id: number;
        image_url: string;
        alt_text?: string;
        is_primary: boolean;
        sort_order: number;
    }>;
    // Supplier related fields
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone?: string;
    supplier_address?: string;
    supplier_website?: string;
    supplier_contact_person?: string;
    // Purchase related fields
    purchase_price?: number;
    purchase_currency?: string;
    purchase_date?: string;
    purchase_order_number?: string;
    purchase_notes?: string;
    reorder_point?: number;
    reorder_quantity?: number;
    lead_time_days?: number;
    payment_terms?: string;
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
    // Review-related fields
    average_rating?: number;
    reviews_count?: number;
    rating_distribution?: { [key: number]: number };
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
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
    products: Product[];
    currency: {
        symbol: string;
        code: string;
    };
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'physical':
            return <Package className="h-4 w-4 text-blue-600" />;
        case 'digital':
            return <Download className="h-4 w-4 text-green-600" />;
        case 'service':
            return <span className="h-4 w-4">🔧</span>;
        case 'subscription':
            return <span className="h-4 w-4">🔄</span>;
        default:
            return <Package className="h-4 w-4 text-gray-600" />;
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
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50';
        case 'archived':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50';
        case 'inactive':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50';
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
        stockStatus: '',
    });
    const { addItem, getItemQuantity } = useCart();
    const { theme } = useTheme();
    const { toast } = useToast();

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description.toLowerCase().includes(searchLower) ||
                    product.category.toLowerCase().includes(searchLower) ||
                    getTypeLabel(product.type)
                        .toLowerCase()
                        .includes(searchLower) ||
                    product.sku?.toLowerCase().includes(searchLower) ||
                    (product.tags || []).some((tag) =>
                        tag.toLowerCase().includes(searchLower),
                    ),
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(
                (product) => product.category === filters.category,
            );
        }

        // Type filter
        if (filters.type) {
            filtered = filtered.filter(
                (product) => product.type === filters.type,
            );
        }

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(
                (product) => product.status === filters.status,
            );
        }

        // Price range filter
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            filtered = filtered.filter((product) => {
                if (max) {
                    return product.price >= min && product.price <= max;
                }
                return product.price >= min;
            });
        }

        // Stock status filter
        if (filters.stockStatus) {
            filtered = filtered.filter((product) => {
                switch (filters.stockStatus) {
                    case 'in-stock':
                        return (
                            product.type !== 'physical' ||
                            (product.stock_quantity !== undefined &&
                                product.stock_quantity > 0)
                        );
                    case 'out-of-stock':
                        return (
                            product.type === 'physical' &&
                            product.stock_quantity !== undefined &&
                            product.stock_quantity === 0
                        );
                    case 'low-stock':
                        return (
                            product.type === 'physical' &&
                            product.stock_quantity !== undefined &&
                            product.stock_quantity <= 10 &&
                            product.stock_quantity > 0
                        );
                    case 'unlimited':
                        return (
                            product.type === 'digital' ||
                            product.type === 'service' ||
                            product.type === 'subscription'
                        );
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
            stockStatus: '',
        });
    };

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== '',
    );

    // Get unique categories, types, and statuses for filter options
    const categories = useMemo(
        () => [...new Set(products.map((p) => p.category))],
        [products],
    );
    const types = useMemo(
        () => [...new Set(products.map((p) => p.type))],
        [products],
    );
    const statuses = useMemo(
        () => [...new Set(products.map((p) => p.status))],
        [products],
    );

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map((product) => product.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(
                selectedProducts.filter((productId) => productId !== id),
            );
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = products.filter((product) =>
            selectedProducts.includes(product.id),
        );
        const headers = [
            'Name',
            'SKU',
            'Category',
            'Type',
            'Price',
            'Stock',
            'Status',
            'Last Updated',
        ];
        const csvData = selectedData.map((product) => [
            product.name,
            product.sku || '',
            product.category,
            getTypeLabel(product.type),
            `${currency.symbol}${(Number(product.price) || 0).toFixed(2)}`,
            product.stock_quantity || 'N/A',
            product.status,
            format(new Date(product.updated_at), 'PPP'),
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
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

    const getProductImages = (product: Product) => {
        const images: string[] = [];

        // Add images from the images array (sorted by sort_order)
        if (product.images && product.images.length > 0) {
            const sortedImages = [...product.images].sort(
                (a, b) => a.sort_order - b.sort_order,
            );
            sortedImages.forEach((img) => {
                if (img.image_url) {
                    images.push(img.image_url);
                }
            });
        }

        // Add thumbnail_url if no images array or as fallback
        if (product.thumbnail_url && !images.includes(product.thumbnail_url)) {
            images.push(product.thumbnail_url);
        }

        return images;
    };

    const getProductImage = (product: Product) => {
        const images = getProductImages(product);
        return images.length > 0 ? images[0] : null;
    };

    const getStockStatus = (quantity?: number, type?: string) => {
        if (
            type === 'digital' ||
            type === 'service' ||
            type === 'subscription'
        ) {
            return (
                <Badge
                    variant="secondary"
                    className="border-gray-200 bg-gray-100 text-xs text-gray-700 dark:border-gray-600/50 dark:bg-gray-800/50 dark:text-gray-300"
                >
                    Unlimited
                </Badge>
            );
        }

        if (quantity === undefined || quantity === null) {
            return (
                <Badge
                    variant="secondary"
                    className="border-gray-200 bg-gray-100 text-xs text-gray-700 dark:border-gray-600/50 dark:bg-gray-800/50 dark:text-gray-300"
                >
                    N/A
                </Badge>
            );
        }

        if (quantity === 0) {
            return (
                <Badge variant="destructive" className="text-xs">
                    Out of Stock
                </Badge>
            );
        }

        if (quantity <= 10) {
            return (
                <Badge
                    variant="secondary"
                    className="border-orange-200 bg-orange-100 text-xs text-orange-700 dark:border-orange-700/50 dark:bg-orange-900/30 dark:text-orange-300"
                >
                    Low Stock ({quantity})
                </Badge>
            );
        }

        return (
            <Badge
                variant="default"
                className="border-green-200 bg-green-100 text-xs text-green-700 dark:border-green-700/50 dark:bg-green-900/30 dark:text-green-300"
            >
                In Stock ({quantity})
            </Badge>
        );
    };

    const getVariantInfo = (product: Product) => {
        if (!product.active_variants || product.active_variants.length === 0) {
            return null;
        }

        const activeVariants = product.active_variants.filter(
            (v) => v.is_active,
        );
        if (activeVariants.length === 0) {
            return null;
        }

        // Get unique attribute keys
        const attributeKeys = new Set<string>();
        activeVariants.forEach((variant) => {
            Object.keys(variant.attributes).forEach((key) =>
                attributeKeys.add(key),
            );
        });

        return {
            count: activeVariants.length,
            attributes: Array.from(attributeKeys),
            hasVariants: true,
        };
    };

    const handleAddToCart = (product: Product) => {
        if (
            product.type === 'physical' &&
            product.stock_quantity !== undefined &&
            product.stock_quantity <= 0
        ) {
            toast({
                title: 'Out of Stock',
                description: 'This product is out of stock',
                variant: 'destructive',
            });
            return;
        }

        // For products with variants, redirect to product detail page
        if (product.active_variants && product.active_variants.length > 0) {
            router.visit(route('products.show', product.id));
            return;
        }

        // For simple products without variants
        const currentQuantity = getItemQuantity(product.id, 0); // 0 indicates no variant
        if (
            product.type === 'physical' &&
            product.stock_quantity !== undefined
        ) {
            if (currentQuantity >= product.stock_quantity) {
                toast({
                    title: 'Stock Limit Reached',
                    description:
                        'Cannot add more items than available in stock',
                    variant: 'destructive',
                });
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
            type: product.type,
            weight: product.weight || 0,
            thumbnail_url: getProductImage(product) || product.thumbnail_url,
        });

        toast({
            title: 'Success',
            description: 'Product added to cart!',
        });
    };

    const stats = {
        total: products.length,
        published: products.filter((p) => p.status === 'published').length,
        lowStock: products.filter(
            (p) =>
                p.type === 'physical' &&
                p.stock_quantity !== undefined &&
                p.stock_quantity <= 10,
        ).length,
        categories: new Set(products.map((p) => p.category)).size,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Products
                            </h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Manage your product catalog and inventory
                            </p>
                        </div>
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                            <CartButton />
                            {selectedProducts.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={exportToCSV}
                                    className="flex items-center border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export Selected
                                </Button>
                            )}
                            <Link href={route('product-orders.index')}>
                                <Button
                                    variant="outline"
                                    className="border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <ListOrdered className="mr-2 h-4 w-4" />
                                    View Orders
                                </Button>
                            </Link>
                            <Link href={route('products.reported-reviews')}>
                                <Button
                                    variant="outline"
                                    className="border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <Flag className="mr-2 h-4 w-4" />
                                    Reported Reviews
                                </Button>
                            </Link>
                            {canEdit && (
                                <Link href={route('products.create')}>
                                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Product
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-700/50 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Total Products
                                        </p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-700/50 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Published
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {stats.published}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-700/50 dark:from-orange-900/20 dark:to-orange-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                            Low Stock
                                        </p>
                                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                            {stats.lowStock}
                                        </p>
                                    </div>
                                    <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-700/50 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                            Categories
                                        </p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {stats.categories}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <Head title="Products" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Search and Filters */}
                    <Card className="mb-8 border-0 bg-white/50 shadow-sm backdrop-blur-sm dark:bg-gray-800/50">
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-x-6 lg:space-y-0">
                                <div className="max-w-md flex-1">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                        <Input
                                            type="search"
                                            placeholder="Search products by name, category, SKU..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="w-full border-gray-200 bg-white pl-10 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                                        <Button
                                            variant={
                                                viewMode === 'grid'
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="h-8 px-3"
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={
                                                viewMode === 'list'
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="h-8 px-3"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800 ${hasActiveFilters ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''}`}
                                        onClick={() =>
                                            setShowFilters(!showFilters)
                                        }
                                    >
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filters
                                        {hasActiveFilters && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-2 h-5 w-5 p-0 text-xs"
                                            >
                                                {
                                                    Object.values(
                                                        filters,
                                                    ).filter((v) => v !== '')
                                                        .length
                                                }
                                            </Badge>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            {showFilters && (
                                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                        {/* Category Filter */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Category
                                            </label>
                                            <select
                                                value={filters.category}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        category:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    All Categories
                                                </option>
                                                {categories.map((category) => (
                                                    <option
                                                        key={category}
                                                        value={category}
                                                    >
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Type Filter */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Type
                                            </label>
                                            <select
                                                value={filters.type}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        type: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    All Types
                                                </option>
                                                {types.map((type) => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {getTypeLabel(type)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Status
                                            </label>
                                            <select
                                                value={filters.status}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        status: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    All Statuses
                                                </option>
                                                {statuses.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Price Range Filter */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Price Range
                                            </label>
                                            <select
                                                value={filters.priceRange}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        priceRange:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    All Prices
                                                </option>
                                                <option value="0-50">
                                                    Under {currency.symbol}50
                                                </option>
                                                <option value="50-100">
                                                    {currency.symbol}50 -{' '}
                                                    {currency.symbol}100
                                                </option>
                                                <option value="100-200">
                                                    {currency.symbol}100 -{' '}
                                                    {currency.symbol}200
                                                </option>
                                                <option value="200-500">
                                                    {currency.symbol}200 -{' '}
                                                    {currency.symbol}500
                                                </option>
                                                <option value="500-">
                                                    {currency.symbol}500+
                                                </option>
                                            </select>
                                        </div>

                                        {/* Stock Status Filter */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Stock Status
                                            </label>
                                            <select
                                                value={filters.stockStatus}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        stockStatus:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    All Stock
                                                </option>
                                                <option value="in-stock">
                                                    In Stock
                                                </option>
                                                <option value="out-of-stock">
                                                    Out of Stock
                                                </option>
                                                <option value="low-stock">
                                                    Low Stock
                                                </option>
                                                <option value="unlimited">
                                                    Unlimited
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Filter Actions */}
                                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-600">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {filteredProducts.length} of{' '}
                                            {products.length} products
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearFilters}
                                                    className="border-gray-200 text-gray-600 hover:text-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
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
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group overflow-hidden border-0 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:bg-gray-800/50"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <ProductImageCarousel
                                            images={getProductImages(product)}
                                            productName={product.name}
                                        />
                                    </div>

                                    <CardHeader className="pb-3">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                                    {product.name}
                                                </h3>
                                                <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                                                    {product.description}
                                                </p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route(
                                                                'products.show',
                                                                product.id,
                                                            )}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {canEdit && (
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'products.edit',
                                                                    product.id,
                                                                )}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {product.type ===
                                                        'digital' &&
                                                        product.file_url && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'products.download',
                                                                        product.id,
                                                                    )}
                                                                >
                                                                    <FileDown className="mr-2 h-4 w-4" />
                                                                    Download
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                    {canDelete && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Product Meta Information */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {/* Type Badge */}
                                                <div className="flex items-center space-x-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">
                                                    {getTypeIcon(product.type)}
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {getTypeLabel(
                                                            product.type,
                                                        )}
                                                    </span>
                                                </div>
                                                {/* Status Badge */}
                                                <Badge
                                                    className={`text-xs ${getStatusColor(product.status)}`}
                                                >
                                                    {product.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        product.status.slice(1)}
                                                </Badge>
                                            </div>
                                            {/* Checkbox */}
                                            <Checkbox
                                                checked={selectedProducts.includes(
                                                    product.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleSelect(product.id)
                                                }
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        SKU
                                                    </span>
                                                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                                                        {product.sku || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Category
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-gray-200 bg-gray-50 text-xs dark:border-gray-600/50 dark:bg-gray-700/50"
                                                    >
                                                        {product.category}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Stock
                                                    </span>
                                                    <div className="text-xs">
                                                        {getStockStatus(
                                                            product.stock_quantity,
                                                            product.type,
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Variant Indicator */}
                                                {(() => {
                                                    const variantInfo =
                                                        getVariantInfo(product);
                                                    if (variantInfo) {
                                                        return (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Variants
                                                                </span>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="border-purple-200 bg-purple-50 text-xs text-purple-700 dark:border-purple-700/50 dark:bg-purple-900/30 dark:text-purple-300"
                                                                >
                                                                    {
                                                                        variantInfo.count
                                                                    }{' '}
                                                                    {variantInfo.attributes.join(
                                                                        ', ',
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>

                                            <div className="border-t border-gray-100 pt-2 dark:border-gray-700">
                                                {/* Review Summary */}
                                                {(product.average_rating ||
                                                    product.reviews_count) && (
                                                    <div className="mb-2 flex items-center space-x-2">
                                                        <div className="flex items-center space-x-1">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-3 w-3 ${
                                                                        star <=
                                                                        Math.round(
                                                                            product.average_rating ||
                                                                                0,
                                                                        )
                                                                            ? 'fill-current text-yellow-400'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {product.average_rating?.toFixed(
                                                                1,
                                                            ) || '0.0'}{' '}
                                                            (
                                                            {product.reviews_count ||
                                                                0}
                                                            )
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="mb-3 flex items-center justify-between">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(
                                                            product.price,
                                                            currency.symbol,
                                                        )}
                                                    </span>
                                                </div>

                                                <Button
                                                    onClick={() =>
                                                        handleAddToCart(product)
                                                    }
                                                    disabled={
                                                        product.type ===
                                                            'physical' &&
                                                        product.stock_quantity !==
                                                            undefined &&
                                                        product.stock_quantity <=
                                                            0
                                                    }
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                                                    size="sm"
                                                >
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    {getVariantInfo(product)
                                                        ? 'Select'
                                                        : 'Add'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-0 bg-white/50 shadow-sm backdrop-blur-sm dark:bg-gray-800/50">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 dark:bg-gray-700/50">
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={
                                                        selectedProducts.length ===
                                                            filteredProducts.length &&
                                                        filteredProducts.length >
                                                            0
                                                    }
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                />
                                            </TableHead>
                                            <TableHead className="w-16">
                                                Image
                                            </TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-32">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.map((product) => (
                                            <TableRow
                                                key={product.id}
                                                className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedProducts.includes(
                                                            product.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleSelect(
                                                                product.id,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="relative">
                                                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                                            <CompactProductImage
                                                                images={getProductImages(
                                                                    product,
                                                                )}
                                                                productName={
                                                                    product.name
                                                                }
                                                            />
                                                        </div>
                                                        {/* Image Count Tooltip */}
                                                        {(() => {
                                                            const imageCount =
                                                                getProductImages(
                                                                    product,
                                                                ).length;
                                                            if (
                                                                imageCount > 1
                                                            ) {
                                                                return (
                                                                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                                                                        {
                                                                            imageCount
                                                                        }
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {product.name}
                                                        </div>
                                                        <div className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                                                            {
                                                                product.description
                                                            }
                                                        </div>
                                                        {/* Variant Indicator */}
                                                        {(() => {
                                                            const variantInfo =
                                                                getVariantInfo(
                                                                    product,
                                                                );
                                                            if (variantInfo) {
                                                                return (
                                                                    <div className="mt-1">
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="border-purple-200 bg-purple-50 text-xs text-purple-700 dark:border-purple-700/50 dark:bg-purple-900/30 dark:text-purple-300"
                                                                        >
                                                                            {
                                                                                variantInfo.count
                                                                            }{' '}
                                                                            variants
                                                                            (
                                                                            {variantInfo.attributes.join(
                                                                                ', ',
                                                                            )}
                                                                            )
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">
                                                    {product.sku || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-gray-200 bg-gray-50 dark:border-gray-600/50 dark:bg-gray-700/50"
                                                    >
                                                        {product.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(
                                                            product.type,
                                                        )}
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                                            {getTypeLabel(
                                                                product.type,
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(
                                                        product.price,
                                                        currency.symbol,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStockStatus(
                                                        product.stock_quantity,
                                                        product.type,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`text-xs ${getStatusColor(product.status)}`}
                                                    >
                                                        {product.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            product.status.slice(
                                                                1,
                                                            )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    product,
                                                                )
                                                            }
                                                            disabled={
                                                                product.type ===
                                                                    'physical' &&
                                                                product.stock_quantity !==
                                                                    undefined &&
                                                                product.stock_quantity <=
                                                                    0
                                                            }
                                                            className="h-8 border-gray-200 dark:border-gray-600"
                                                        >
                                                            <ShoppingCart className="mr-1 h-3 w-3" />
                                                            {getVariantInfo(
                                                                product,
                                                            )
                                                                ? 'Select'
                                                                : 'Add'}
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'products.show',
                                                                            product.id,
                                                                        )}
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {canEdit && (
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                'products.edit',
                                                                                product.id,
                                                                            )}
                                                                        >
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {product.type ===
                                                                    'digital' &&
                                                                    product.file_url && (
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    'products.download',
                                                                                    product.id,
                                                                                )}
                                                                            >
                                                                                <FileDown className="mr-2 h-4 w-4" />
                                                                                Download
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                {canDelete && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                product.id,
                                                                            )
                                                                        }
                                                                        className="text-red-600 dark:text-red-400"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                )}
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
                        <Card className="bg-white/50 py-12 text-center backdrop-blur-sm dark:bg-gray-800/50">
                            <CardContent>
                                <Package className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    No products found
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-gray-500 dark:text-gray-400">
                                    {search
                                        ? 'Try adjusting your search terms to find more products.'
                                        : 'Get started by creating your first product to build your catalog.'}
                                </p>
                                {!search && canEdit && (
                                    <Link href={route('products.create')}>
                                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                            <Plus className="mr-2 h-4 w-4" />
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
