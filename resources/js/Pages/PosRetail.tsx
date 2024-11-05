import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Upload } from 'lucide-react';
import { Dialog as PreviewDialog, DialogContent as PreviewDialogContent } from "@/Components/ui/dialog";
import { useEffect } from "react";

interface Product {
    id: number;
    name: string;
    price: number;
    price_formatted: string;
    images: string[];
    quantity: number; // Add this line to include inventory quantity
}
  
interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    price_formatted: string;
}
  
const ITEMS_PER_PAGE = 5;

export default function PosRetail(props: { products: Product[], appCurrency: any }) {
    const [products, setProducts] = useState<Product[]>(props.products);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isCompleteSaleDialogOpen, setIsCompleteSaleDialogOpen] = useState(false);
    const [cashReceived, setCashReceived] = useState<string>("");
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const regex = new RegExp(term.split('').join('.*'), 'i');
        setFilteredProducts(
          products.filter((product) => regex.test(product.name))
        );
        setCurrentPage(1);
      };
    
    const addItemToOrder = (product: Product) => {
        if (product.quantity > 0) {
            const existingItem = orderItems.find(item => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity < product.quantity) {
                    setOrderItems(orderItems.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    ));
                    setProducts(products.map(p => 
                        p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
                    ));
                } else {
                    alert("Cannot add more items than available in inventory.");
                }
            } else {
                setOrderItems([...orderItems, { ...product, quantity: 1 }]);
                setProducts(products.map(p => 
                    p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
                ));
            }
        } else {
            alert("This product is out of stock.");
        }
    };
    
    const removeItemFromOrder = (id: number) => {
        const itemToRemove = orderItems.find(item => item.id === id);
        if (itemToRemove) {
            setProducts(products.map(p => 
                p.id === id ? { ...p, quantity: p.quantity + itemToRemove.quantity } : p
            ));
        }
        setOrderItems(orderItems.filter((item) => item.id !== id));
    };
    
    const updateItemQuantity = (id: number, newQuantity: number) => {
        const product = products.find(p => p.id === id);
        const existingItem = orderItems.find(item => item.id === id);
        
        if (product && existingItem) {
            // Calculate the difference in quantity
            const quantityDifference = newQuantity - existingItem.quantity;

            if (newQuantity <= product.quantity + existingItem.quantity && newQuantity >= 0) {
                setOrderItems(orderItems.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                ));
                // Update product quantity based on the difference
                setProducts(products.map(p => 
                    p.id === id ? { ...p, quantity: p.quantity - quantityDifference } : p
                ));
            } else {
                alert("Cannot add more items than available in inventory.");
            }
        } else {
            alert("Product not found.");
        }
    };
    
    const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    
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
    
    const handleCompleteSale = () => {
        setIsCompleteSaleDialogOpen(true);
    };
    
    const confirmCompleteSale = async () => {
        const cashReceivedAmount = parseFloat(cashReceived);
        if (paymentMethod === 'cash' && (isNaN(cashReceivedAmount) || cashReceivedAmount < totalAmount)) {
            alert("Invalid amount received. Please enter a valid amount.");
            return;
        }

        const change = paymentMethod === 'cash' ? cashReceivedAmount - totalAmount : 0;

        // Prepare sale data
        const saleData = {
            items: orderItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total_amount: totalAmount,
            cash_received: paymentMethod === 'cash' ? cashReceivedAmount : null,
            change: paymentMethod === 'cash' ? change : null,
            payment_method: paymentMethod // Add payment method to the data
        };

        // Handle cash payment processing
        if (paymentMethod === 'cash') {
            alert(`Sale completed!\nTotal: $${totalAmount.toFixed(2)}\nPayment Method: Cash Received: $${cashReceivedAmount.toFixed(2)}\nChange: $${change.toFixed(2)}`);
        } else {
            alert(`Sale completed!\nTotal: $${totalAmount.toFixed(2)}\nPayment Method: Card Payment`);
        }

        // Send sale data to the backend using Inertia
        try {
            await router.post('/pos-retail', saleData);
            // Reset the order and close the dialog
            setOrderItems([]);
            setCashReceived("");
            setIsCompleteSaleDialogOpen(false);
        } catch (error) {
            console.error("Error completing sale:", error);
            alert("There was an error completing the sale. Please try again.");
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
                    Point of Sale
                </h2>
            }
        >
            <Head title="Retail" />

            <ImagePreviewModal />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-2">
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>In Stock</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {product.images.length > 0 ? (
                                                        product.images.slice(0, 3).map((image, index) => (
                                                            <div 
                                                                key={index}
                                                                className="w-[50px] h-[50px] overflow-hidden bg-gray-100 flex items-center justify-center"
                                                            >
                                                                <img 
                                                                    src={image} 
                                                                    alt={`${product.name} ${index + 1}`}
                                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onClick={() => {
                                                                        setSelectedImageUrl(image);
                                                                        setIsImagePreviewOpen(true);
                                                                    }}
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center">
                                                            <Upload className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.price_formatted}</TableCell>
                                            <TableCell>{product.quantity}</TableCell>
                                            <TableCell>
                                                <Button size="sm" onClick={() => addItemToOrder(product)} disabled={product.quantity === 0} className="p-4">
                                                    Add
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
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Current Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="p-4">-</Button>
                                                <span>{item.quantity}</span>
                                                <Button size="sm" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-4">+</Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.price_formatted}</TableCell>
                                        <TableCell>{props.appCurrency.symbol}{(item.price * item.quantity).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => removeItemFromOrder(item.id)} className="p-4">
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div>Total: {props.appCurrency.symbol}{totalAmount.toFixed(2)}</div>
                        <Button onClick={handleCompleteSale} disabled={orderItems.length === 0} className="p-4">Complete Sale</Button>
                    </CardFooter>
                </Card>
            </div>

            <Dialog open={isCompleteSaleDialogOpen} onOpenChange={setIsCompleteSaleDialogOpen}>
                <DialogContent aria-describedby="complete-sale-description" className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Complete Sale</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</Label>
                        <select 
                            id="paymentMethod" 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                        </select>
                        {paymentMethod === 'cash' && (
                            <>
                                <Label htmlFor="cashReceived" className="block text-sm font-medium text-gray-700 mt-4">Cash Received</Label>
                                <Input
                                    id="cashReceived"
                                    type="number"
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    placeholder="Enter amount received"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                                />
                            </>
                        )}
                    </div>
                    <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setIsCompleteSaleDialogOpen(false)} className="p-4">Cancel</Button>
                        <Button onClick={confirmCompleteSale} className="bg-blue-600 text-white hover:bg-blue-700 p-4">Confirm Sale</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> 
        </AuthenticatedLayout>
    );
}
