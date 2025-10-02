import InventoryAnalytics from '@/Components/InventoryAnalytics';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Dialog as PreviewDialog,
    DialogContent as PreviewDialogContent,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart2,
    Download,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
    Upload as UploadIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Product {
    barcode: string;
    id: number;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    price_formatted: string;
    images?: string[];
    category_id: number;
    description?: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const ITEMS_PER_PAGE = 5;

export default function Inventory(props: {
    inventory: Product[];
    categories: Category[];
    appCurrency: any;
}) {
    const [products, setProducts] = useState<Product[]>(props.inventory);

    const [filteredProducts, setFilteredProducts] =
        useState<Product[]>(products);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [newProduct, setNewProduct] = useState<Product>({
        id: 0,
        name: '',
        sku: '',
        quantity: 0,
        price: 0,
        price_formatted: '',
        images: [],
        category_id: props.categories[0]?.id || 0,
        description: '',
        status: 'in_stock',
        barcode: '',
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filters, setFilters] = useState({
        category: 'all',
        minPrice: '',
        maxPrice: '',
        status: 'all',
        dateRange: {
            start: null,
            end: null,
        },
    });
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        null,
    );
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();

        // First apply search filter
        const searchFiltered = products.filter((item) => {
            return Object.keys(item).some((key) => {
                const value = item[key as keyof Product];
                return (
                    typeof value === 'string' &&
                    value.toLowerCase().includes(lowercasedFilter)
                );
            });
        });

        // Then apply category, price, and status filters
        const filtered = searchFiltered.filter((product) => {
            const matchesCategory =
                filters.category === 'all' ||
                product.category_id.toString() === filters.category;
            const matchesPrice =
                (!filters.minPrice ||
                    product.price >= Number(filters.minPrice)) &&
                (!filters.maxPrice ||
                    product.price <= Number(filters.maxPrice));
            const matchesStatus =
                filters.status === 'all' || product.status === filters.status;

            return matchesCategory && matchesPrice && matchesStatus;
        });

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, products, filters]); // Add filters to dependencies

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            router.get(
                '/inventory/products',
                {},
                {
                    preserveState: true,
                    onSuccess: (page: any) => {
                        setProducts(page.props.inventory as Product[]);
                    },
                    onError: () => {
                        toast.error('Failed to fetch products');
                    },
                    onFinish: () => setIsLoading(false),
                },
            );
        } catch (error) {
            console.error('Error fetching products:', error);
            setIsLoading(false);
        }
    };

    const addOrUpdateProduct = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();

            // Add all product fields to formData
            formData.append('name', newProduct.name);
            formData.append('sku', newProduct.sku);
            formData.append('quantity', newProduct.quantity.toString());
            formData.append('price', newProduct.price.toString());
            formData.append('category_id', newProduct.category_id.toString());
            formData.append('description', newProduct.description || '');
            formData.append('status', newProduct.status);
            formData.append('barcode', newProduct.barcode || '');

            // Get file input element and append all selected files
            const fileInput = document.getElementById(
                'images',
            ) as HTMLInputElement;
            if (fileInput && fileInput.files) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append('images[]', fileInput.files[i]);
                }
            }

            if (isEditing) {
                router.post(`/inventory/${newProduct.id}`, formData, {
                    forceFormData: true,
                    preserveState: true,
                    onSuccess: () => {
                        setProducts(
                            products.map((product) =>
                                product.id === newProduct.id
                                    ? newProduct
                                    : product,
                            ),
                        );
                        setNewProduct({
                            id: 0,
                            name: '',
                            sku: '',
                            quantity: 0,
                            price: 0,
                            price_formatted: '',
                            images: [],
                            category_id: 0,
                            description: '',
                            status: 'in_stock',
                            barcode: '',
                        });
                        setIsEditing(false);
                        setIsDialogOpen(false);
                        toast.success('Product updated successfully');
                    },
                    onError: () => toast.error('Failed to update product'),
                    onFinish: () => setIsLoading(false),
                });
            } else {
                router.post('/inventory', formData, {
                    forceFormData: true,
                    preserveState: true,
                    onSuccess: (page: any) => {
                        setProducts([...products, page.props.inventory]);
                        setNewProduct({
                            id: 0,
                            name: '',
                            sku: '',
                            quantity: 0,
                            price: 0,
                            price_formatted: '',
                            images: [],
                            category_id: 0,
                            description: '',
                            status: 'in_stock',
                            barcode: '',
                        });
                        setIsDialogOpen(false);
                        toast.success('Product added successfully');
                    },
                    onError: () => toast.error('Failed to add product'),
                    onFinish: () => setIsLoading(false),
                });
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setIsLoading(false);
        }
    };

    const editProduct = (product: Product) => {
        setNewProduct(product);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const deleteProduct = async (id: number) => {
        try {
            setIsLoading(true);
            router.delete(`/inventory/${id}`, {
                preserveState: true,
                onSuccess: () => {
                    setProducts(
                        products.filter((product) => product.id !== id),
                    );
                    setSelectedProducts(
                        selectedProducts.filter(
                            (productId) => productId !== id,
                        ),
                    );
                    toast.success('Product deleted successfully');
                },
                onError: () => toast.error('Failed to delete product'),
                onFinish: () => setIsLoading(false),
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            setIsLoading(false);
        }
    };

    const toggleProductSelection = (id: number) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((productId) => productId !== id)
                : [...prevSelected, id],
        );
    };

    const deleteSelectedProducts = async () => {
        try {
            setIsLoading(true);
            router.post(
                '/inventory/bulk',
                {
                    ids: selectedProducts,
                },
                {
                    preserveState: true,
                    onSuccess: () => {
                        setProducts(
                            products.filter(
                                (product) =>
                                    !selectedProducts.includes(product.id),
                            ),
                        );
                        setSelectedProducts([]);
                        toast.success('Selected products deleted successfully');
                    },
                    onError: () =>
                        toast.error('Failed to delete selected products'),
                    onFinish: () => setIsLoading(false),
                },
            );
        } catch (error) {
            console.error('Error deleting selected products:', error);
            setIsLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setNewProduct({
            ...newProduct,
            images: newProduct.images?.filter((_, i) => i !== index) || [],
        });
    };

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2),
        );
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/inventory/export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'inventory.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to export products');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            router.post('/inventory/import', formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Products imported successfully');
                    fetchProducts();
                },
                onError: () => toast.error('Failed to import products'),
            });
        }
    };

    const toggleSelectAll = () => {
        const currentPageIds = paginatedProducts.map((product) => product.id);

        if (currentPageIds.every((id) => selectedProducts.includes(id))) {
            // If all current page items are selected, deselect them
            setSelectedProducts(
                selectedProducts.filter((id) => !currentPageIds.includes(id)),
            );
        } else {
            // If not all current page items are selected, select them
            const newSelected = new Set([
                ...selectedProducts,
                ...currentPageIds,
            ]);
            setSelectedProducts(Array.from(newSelected));
        }
    };

    const ImagePreviewModal = () => {
        if (!selectedImageUrl) return null;

        return (
            <PreviewDialog
                open={isImagePreviewOpen}
                onOpenChange={setIsImagePreviewOpen}
            >
                <PreviewDialogContent className="max-w-3xl">
                    <img
                        src={selectedImageUrl}
                        alt="Product preview"
                        className="h-auto w-full"
                        onClick={() => setIsImagePreviewOpen(false)}
                    />
                </PreviewDialogContent>
            </PreviewDialog>
        );
    };

    const resetProduct = () => {
        setNewProduct({
            id: 0,
            name: '',
            sku: '',
            quantity: 0,
            price: 0,
            price_formatted: '',
            images: [],
            category_id: props.categories[0]?.id || 0,
            description: '',
            status: 'in_stock',
            barcode: '',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Inventory
                </h2>
            }
        >
            <Head title="Inventory" />

            {/* Analytics Section */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="mb-4"
                >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </Button>

                {showAnalytics && (
                    <InventoryAnalytics
                        products={products}
                        appCurrency={props.appCurrency}
                    />
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Products</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <label className="cursor-pointer">
                                <Button variant="outline" asChild>
                                    <span>
                                        <UploadIcon className="mr-2 h-4 w-4" />
                                        Import
                                    </span>
                                </Button>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx"
                                    className="hidden"
                                    onChange={handleImport}
                                />
                            </label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Advanced Filters Section */}
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Select
                            value={filters.category}
                            onValueChange={(value) =>
                                setFilters({ ...filters, category: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {props.categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        minPrice: e.target.value,
                                    })
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        maxPrice: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <Select
                            value={filters.status}
                            onValueChange={(value) =>
                                setFilters({ ...filters, status: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="in_stock">
                                    In Stock
                                </SelectItem>
                                <SelectItem value="low_stock">
                                    Low Stock
                                </SelectItem>
                                <SelectItem value="out_of_stock">
                                    Out of Stock
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Existing search and table content */}
                    <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
                        <div className="mb-2 flex w-full items-center md:mb-0 md:w-1/3">
                            <Search className="mr-2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            resetProduct();
                                            setIsEditing(false);
                                        }}
                                        className="w-full md:w-auto"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        New Product
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {isEditing
                                                ? 'Edit Product'
                                                : 'Add New Product'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="name"
                                                className="text-right"
                                            >
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                className="col-span-3"
                                                value={newProduct.name}
                                                onChange={(e) =>
                                                    setNewProduct({
                                                        ...newProduct,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="sku"
                                                className="text-right"
                                            >
                                                SKU
                                            </Label>
                                            <Input
                                                id="sku"
                                                className="col-span-3"
                                                value={newProduct.sku}
                                                onChange={async (e) => {
                                                    const skuValue =
                                                        e.target.value;
                                                    setNewProduct({
                                                        ...newProduct,
                                                        sku: skuValue,
                                                    });
                                                }}
                                                onBlur={async (e) => {
                                                    const skuValue =
                                                        e.target.value;

                                                    // Fetch barcode data without reloading
                                                    try {
                                                        const response =
                                                            await fetch(
                                                                `/inventory/${skuValue}/barcode`,
                                                            );
                                                        if (!response.ok)
                                                            throw new Error(
                                                                'Network response was not ok',
                                                            );
                                                        const page =
                                                            await response.json();
                                                        setNewProduct({
                                                            ...newProduct,
                                                            barcode:
                                                                page.data
                                                                    .barcode, // Adjust according to your JSON structure
                                                        });
                                                    } catch (error) {
                                                        console.error(
                                                            'Error fetching barcode:',
                                                            error,
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="quantity"
                                                className="text-right"
                                            >
                                                Quantity
                                            </Label>
                                            <Input
                                                id="quantity"
                                                className="col-span-3"
                                                type="number"
                                                value={newProduct.quantity}
                                                onChange={(e) =>
                                                    setNewProduct({
                                                        ...newProduct,
                                                        quantity: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="price"
                                                className="text-right"
                                            >
                                                Price
                                            </Label>
                                            <Input
                                                id="price"
                                                className="col-span-3"
                                                type="number"
                                                value={newProduct.price}
                                                onChange={(e) =>
                                                    setNewProduct({
                                                        ...newProduct,
                                                        price: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="category"
                                                className="text-right"
                                            >
                                                Category
                                            </Label>
                                            <Select
                                                value={newProduct.category_id.toString()}
                                                onValueChange={(value) =>
                                                    setNewProduct({
                                                        ...newProduct,
                                                        category_id:
                                                            Number(value),
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {props.categories.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.id
                                                                }
                                                                value={category.id.toString()}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="images"
                                                className="text-right"
                                            >
                                                Images
                                            </Label>
                                            <div className="col-span-3">
                                                <Input
                                                    id="images"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="barcode"
                                                className="text-right"
                                            >
                                                Barcode
                                            </Label>
                                            <Input
                                                id="barcode"
                                                className="col-span-3"
                                                value={newProduct.barcode || ''} // Display barcode
                                                readOnly // Make it read-only
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={addOrUpdateProduct}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : isEditing ? (
                                            'Update Product'
                                        ) : (
                                            'Add Product'
                                        )}
                                    </Button>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="destructive"
                                onClick={deleteSelectedProducts}
                                disabled={selectedProducts.length === 0}
                                className="w-full md:w-auto"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                Selected ({selectedProducts.length})
                            </Button>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={
                                            paginatedProducts.length > 0 &&
                                            paginatedProducts.every((product) =>
                                                selectedProducts.includes(
                                                    product.id,
                                                ),
                                            )
                                        }
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all on current page"
                                    />
                                </TableHead>
                                <TableHead>Images</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedProducts.includes(
                                                product.id,
                                            )}
                                            onCheckedChange={() =>
                                                toggleProductSelection(
                                                    product.id,
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {product.images &&
                                            product.images.length > 0 ? (
                                                product.images
                                                    .slice(0, 3)
                                                    .map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden bg-gray-100"
                                                        >
                                                            <img
                                                                src={image}
                                                                alt={`${product.name} ${index + 1}`}
                                                                className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
                                                                onClick={() => {
                                                                    setSelectedImageUrl(
                                                                        image,
                                                                    );
                                                                    setIsImagePreviewOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className="flex h-[50px] w-[50px] items-center justify-center bg-gray-200">
                                                    <Upload className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            {product.images &&
                                                product.images.length > 3 && (
                                                    <div
                                                        className="flex h-[50px] w-[50px] cursor-pointer items-center justify-center bg-gray-200 hover:bg-gray-300"
                                                        onClick={() => {
                                                            setSelectedImageUrl(
                                                                product
                                                                    .images![3],
                                                            );
                                                            setIsImagePreviewOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        +
                                                        {product.images.length -
                                                            3}
                                                    </div>
                                                )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                        {product.price_formatted}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mr-2"
                                            onClick={() => editProduct(product)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                deleteProduct(product.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                            {Math.min(
                                currentPage * ITEMS_PER_PAGE,
                                filteredProducts.length,
                            )}{' '}
                            of {filteredProducts.length} entries
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            {getPageNumbers().map((pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    variant={
                                        pageNumber === currentPage
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => setCurrentPage(pageNumber)}
                                >
                                    {pageNumber}
                                </Button>
                            ))}
                            <Button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ImagePreviewModal />
        </AuthenticatedLayout>
    );
}
