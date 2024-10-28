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

interface Product {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    images: string[];
}

const ITEMS_PER_PAGE = 5;

export default function Inventory(props: { inventory: Product[] }) {
    const inventory = props.inventory || [];

    const [products, setProducts] = useState<Product[]>(inventory);

    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [newProduct, setNewProduct] = useState<Product>({
        id: 0,
        name: "",
        sku: "",
        quantity: 0,
        price: 0,
        images: [],
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = products.filter(item => {
        return Object.keys(item).some(key => {
            const value = item[key as keyof Product];
            return typeof value === 'string' && value.toLowerCase().includes(lowercasedFilter);
        });
        });
        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [searchTerm, products]);

    const addOrUpdateProduct = () => {
        if (isEditing) {
        setProducts(products.map((product) => (product.id === newProduct.id ? newProduct : product)));
        } else {
        setProducts([...products, { ...newProduct, id: Date.now() }]);
        }
        setNewProduct({ id: 0, name: "", sku: "", quantity: 0, price: 0, images: [] });
        setIsEditing(false);
        setIsDialogOpen(false);
    };

    const editProduct = (product: Product) => {
        setNewProduct(product);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const deleteProduct = (id: number) => {
        setProducts(products.filter((product) => product.id !== id));
        setSelectedProducts(selectedProducts.filter((productId) => productId !== id));
    };

    const toggleProductSelection = (id: number) => {
        setSelectedProducts(prevSelected =>
        prevSelected.includes(id)
            ? prevSelected.filter(productId => productId !== id)
            : [...prevSelected, id]
        );
    };

    const deleteSelectedProducts = () => {
        setProducts(products.filter((product) => !selectedProducts.includes(product.id)));
        setSelectedProducts([]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
        const newImages: string[] = [];
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
            newImages.push(reader.result as string);
            if (newImages.length === files.length) {
                setNewProduct({ ...newProduct, images: [...newProduct.images, ...newImages] });
            }
            };
            reader.readAsDataURL(file);
        });
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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Inventory
                </h2>
            }
        >
            <Head title="Inventory" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <Card>
                                <CardHeader>
                                <CardTitle>Product List</CardTitle>
                                </CardHeader>
                                <CardContent>
                                <div className="mb-4 flex justify-between items-center">
                                    <div className="flex items-center w-1/3">
                                    <Search className="mr-2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                    </div>
                                    <div className="flex gap-2">
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                        <Button onClick={() => {
                                            setNewProduct({ id: 0, name: "", sku: "", quantity: 0, price: 0, images: [] });
                                            setIsEditing(false);
                                        }}>
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
                                        <Button onClick={addOrUpdateProduct}>
                                            {isEditing ? "Update Product" : "Add Product"}
                                        </Button>
                                        </DialogContent>
                                    </Dialog>
                                    <Button 
                                        variant="destructive" 
                                        onClick={deleteSelectedProducts}
                                        disabled={selectedProducts.length === 0}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedProducts.length})
                                    </Button>
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Select</TableHead>
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
                                                <img key={index} src={image} alt={`${product.name} ${index + 1}`} width={50} height={50} />
                                                ))
                                            ) : (
                                                <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center">
                                                <Upload className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            {product.images.length > 3 && (
                                                <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center">
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
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
