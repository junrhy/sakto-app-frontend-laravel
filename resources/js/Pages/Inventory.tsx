import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Plus, Pencil, Trash2, Search, Upload, X } from "lucide-react";
import { router } from '@inertiajs/react';
import { toast, Toaster } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Calendar } from "@/Components/ui/calendar";
import InventoryAnalytics from "@/Components/InventoryAnalytics";
import { Download, Upload as UploadIcon, BarChart2 } from "lucide-react";
import { Dialog as PreviewDialog, DialogContent as PreviewDialogContent } from "@/Components/ui/dialog";

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    images: string[];
    category_id: number;
    description?: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const ITEMS_PER_PAGE = 5;

export default function Inventory(props: { inventory: Product[] }) {
    const [products, setProducts] = useState<Product[]>(props.inventory);

    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [newProduct, setNewProduct] = useState<Product>({
        id: 0,
        name: "",
        sku: "",
        quantity: 0,
        price: 0,
        images: [],
        category_id: 0,
        description: "",
        status: 'in_stock',
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
            end: null
        }
    });
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        
        // First apply search filter
        const searchFiltered = products.filter(item => {
            return Object.keys(item).some(key => {
                const value = item[key as keyof Product];
                return typeof value === 'string' && value.toLowerCase().includes(lowercasedFilter);
            });
        });

        // Then apply category, price, and status filters
        const filtered = searchFiltered.filter(product => {
            const matchesCategory = filters.category === 'all' || product.category_id.toString() === filters.category;
            const matchesPrice = (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
                               (!filters.maxPrice || product.price <= Number(filters.maxPrice));
            const matchesStatus = filters.status === 'all' || product.status === filters.status;
            
            return matchesCategory && matchesPrice && matchesStatus;
        });

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, products, filters]); // Add filters to dependencies

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            router.get('/inventory/products', {}, {
                preserveState: true,
                onSuccess: (page: any) => {
                    setProducts(page.props.inventory as Product[]);
                },
                onError: () => {
                    toast.error('Failed to fetch products');
                },
                onFinish: () => setIsLoading(false),
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            setIsLoading(false);
        }
    };

    const addOrUpdateProduct = async () => {
        try {
            setIsLoading(true);
            if (isEditing) {
                router.put(`/inventory/${newProduct.id}`, {
                    name: newProduct.name,
                    sku: newProduct.sku,
                    quantity: newProduct.quantity,
                    price: newProduct.price,
                    images: newProduct.images,
                    category_id: newProduct.category_id,
                    description: newProduct.description,
                    status: newProduct.status,
                }, {
                    preserveState: true,
                    onSuccess: () => {
                        setProducts(products.map((product) => 
                            product.id === newProduct.id ? newProduct : product
                        ));
                        setNewProduct({ id: 0, name: "", sku: "", quantity: 0, price: 0, images: [], category_id: 0, description: "", status: 'in_stock' });
                        setIsEditing(false);
                        setIsDialogOpen(false);
                        toast.success('Product updated successfully');
                    },
                    onError: () => toast.error('Failed to update product'),
                    onFinish: () => setIsLoading(false),
                });
            } else {
                router.post('/inventory', {
                    name: newProduct.name,
                    sku: newProduct.sku,
                    quantity: newProduct.quantity,
                    price: newProduct.price,
                    images: newProduct.images,
                    category_id: newProduct.category_id,
                    description: newProduct.description,
                    status: newProduct.status,
                }, {
                    preserveState: true,
                    onSuccess: (page: any) => {
                        setProducts([...products, page.props.inventory]);
                        setNewProduct({ id: 0, name: "", sku: "", quantity: 0, price: 0, images: [], category_id: 0, description: "", status: 'in_stock' });
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
                    setProducts(products.filter((product) => product.id !== id));
                    setSelectedProducts(selectedProducts.filter((productId) => productId !== id));
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
        setSelectedProducts(prevSelected =>
        prevSelected.includes(id)
            ? prevSelected.filter(productId => productId !== id)
            : [...prevSelected, id]
        );
    };

    const deleteSelectedProducts = async () => {
        try {
            setIsLoading(true);
            router.delete('/inventory/bulk', {
                data: { ids: selectedProducts },
                preserveState: true,
                onSuccess: () => {
                    setProducts(products.filter((product) => !selectedProducts.includes(product.id)));
                    setSelectedProducts([]);
                    toast.success('Selected products deleted successfully');
                },
                onError: () => toast.error('Failed to delete selected products'),
                onFinish: () => setIsLoading(false),
            });
        } catch (error) {
            console.error('Error deleting selected products:', error);
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            try {
                const formData = new FormData();
                Array.from(files).forEach((file) => {
                    formData.append('images[]', file);
                });

                router.post('/inventory/upload-images', formData, {
                    forceFormData: true,
                    preserveState: true,
                    onSuccess: (response) => {
                        setNewProduct({ 
                            ...newProduct, 
                            images: [...newProduct.images, ...(response.props.urls as string[])] 
                        });
                        toast.success('Images uploaded successfully');
                    },
                    onError: () => toast.error('Failed to upload images'),
                });
            } catch (error) {
                console.error('Error uploading images:', error);
                toast.error('Failed to upload images');
            }
        }
    };

    const removeImage = (index: number) => {
        setNewProduct({
        ...newProduct,
        images: newProduct.images.filter((_, i) => i !== index)
        });
    };

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
        const currentPageIds = paginatedProducts.map(product => product.id);
        
        if (currentPageIds.every(id => selectedProducts.includes(id))) {
            // If all current page items are selected, deselect them
            setSelectedProducts(selectedProducts.filter(id => !currentPageIds.includes(id)));
        } else {
            // If not all current page items are selected, select them
            const newSelected = new Set([...selectedProducts, ...currentPageIds]);
            setSelectedProducts(Array.from(newSelected));
        }
    };

    const ImagePreviewModal = () => {
        if (!selectedImageUrl) return null;
        
        return (
            <PreviewDialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
                <PreviewDialogContent className="max-w-3xl">
                    <img 
                        src={selectedImageUrl} 
                        alt="Product preview" 
                        className="w-full h-auto"
                        onClick={() => setIsImagePreviewOpen(false)}
                    />
                </PreviewDialogContent>
            </PreviewDialog>
        );
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
                
                {showAnalytics && <InventoryAnalytics products={products} />}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
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
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            value={filters.category}
                            onValueChange={(value) => setFilters({ ...filters, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="1">Electronics</SelectItem>
                                <SelectItem value="2">Accessories</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>

                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters({ ...filters, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="in_stock">In Stock</SelectItem>
                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Existing search and table content */}
                    <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center w-full md:w-1/3 mb-2 md:mb-0">
                        <Search className="mr-2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                            <Button onClick={() => {
                                setNewProduct({ id: 0, name: "", sku: "", quantity: 0, price: 0, images: [], category_id: 0, description: "", status: 'in_stock' });
                                setIsEditing(false);
                            }} className="w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add New Product
                            </Button>
                            </DialogTrigger>
                            <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    className="col-span-3"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sku" className="text-right">SKU</Label>
                                <Input
                                    id="sku"
                                    className="col-span-3"
                                    value={newProduct.sku}
                                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                                <Input
                                    id="quantity"
                                    className="col-span-3"
                                    type="number"
                                    value={newProduct.quantity}
                                    onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                                />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Price</Label>
                                <Input
                                    id="price"
                                    className="col-span-3"
                                    type="number"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="images" className="text-right">Images</Label>
                                <div className="col-span-3">
                                    <Input
                                    id="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                    {newProduct.images.map((image, index) => (
                                        <div key={index} className="relative">
                                        <img src={image} alt={`Product ${index + 1}`} width={100} height={100} />
                                        <button
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                                </div>
                            </div>
                            <Button 
                                onClick={addOrUpdateProduct}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    isEditing ? "Update Product" : "Add Product"
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
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedProducts.length})
                        </Button>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={paginatedProducts.length > 0 && 
                                                paginatedProducts.every(product => selectedProducts.includes(product.id))}
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
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() => toggleProductSelection(product.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                {product.images.length > 0 ? (
                                    product.images.slice(0, 3).map((image, index) => (
                                        <img 
                                            key={index} 
                                            src={image} 
                                            alt={`${product.name} ${index + 1}`} 
                                            width={50} 
                                            height={50}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => {
                                                setSelectedImageUrl(image);
                                                setIsImagePreviewOpen(true);
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                {product.images.length > 3 && (
                                    <div 
                                        className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300"
                                        onClick={() => {
                                            setSelectedImageUrl(product.images[3]);
                                            setIsImagePreviewOpen(true);
                                        }}
                                    >
                                        +{product.images.length - 3}
                                    </div>
                                )}
                                </div>
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className="mr-2" onClick={() => editProduct(product)}>
                                <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} entries
                        </div>
                        <div className="flex gap-2">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {getPageNumbers().map(pageNumber => (
                            <Button
                            key={pageNumber}
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNumber)}
                            >
                            {pageNumber}
                            </Button>
                        ))}
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ImagePreviewModal />
            <Toaster />
        </AuthenticatedLayout>
    );
}
