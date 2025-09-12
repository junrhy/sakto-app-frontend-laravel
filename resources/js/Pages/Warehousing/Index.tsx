import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Package, Truck, Plus, Search } from "lucide-react";

type Product = {
    id: string;
    name: string;
    quantity: number;
    location: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
};

type Order = {
    id: string;
    orderNumber: string;
    status: 'pending' | 'processing' | 'shipped';
    items: number;
    destination: string;
};

export default function Warehousing() {
    const [products, setProducts] = useState<Product[]>([
        { id: '1', name: 'Product A', quantity: 100, location: 'A-123', status: 'in-stock' },
        { id: '2', name: 'Product B', quantity: 5, location: 'B-456', status: 'low-stock' },
        { id: '3', name: 'Product C', quantity: 0, location: 'C-789', status: 'out-of-stock' },
    ]);
    
    const [orders, setOrders] = useState<Order[]>([
        { id: '1', orderNumber: 'ORD001', status: 'pending', items: 3, destination: 'New York' },
        { id: '2', orderNumber: 'ORD002', status: 'processing', items: 5, destination: 'Los Angeles' },
    ]);

    const [newProduct, setNewProduct] = useState({ name: '', quantity: '', location: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const addProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const quantity = parseInt(newProduct.quantity);
        if (isNaN(quantity)) return;
        
        const status = quantity === 0 ? 'out-of-stock' : quantity < 10 ? 'low-stock' : 'in-stock';
        
        setProducts([...products, { 
            id: Date.now().toString(), 
            name: newProduct.name, 
            quantity, 
            location: newProduct.location,
            status
        }]);
        setNewProduct({ name: '', quantity: '', location: '' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in-stock': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'low-stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'out-of-stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'shipped': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Warehousing
                </h2>
            }
        >
            <Head title="Warehousing" />

            <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{products.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {products.filter(p => p.status === 'in-stock').length} in stock
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <Package className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {products.filter(p => p.status === 'low-stock').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Need restocking</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{orders.length}</div>
                            <p className="text-xs text-muted-foreground">Awaiting processing</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Inventory Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Inventory
                            </CardTitle>
                            <CardDescription>Manage your warehouse inventory</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add New Product */}
                            <form onSubmit={addProduct} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h4 className="font-medium text-sm">Add New Product</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <Input
                                        placeholder="Product Name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            type="number"
                                            placeholder="Quantity"
                                            value={newProduct.quantity}
                                            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Location"
                                            value={newProduct.location}
                                            onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Product
                                    </Button>
                                </div>
                            </form>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products or locations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Product List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <div className="flex-1">
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-gray-500">Location: {product.location}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{product.quantity.toLocaleString()}</div>
                                            <Badge className={getStatusColor(product.status)}>
                                                {product.status.replace('-', ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Orders
                            </CardTitle>
                            <CardDescription>Track and manage orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <div className="flex-1">
                                            <div className="font-medium">{order.orderNumber}</div>
                                            <div className="text-sm text-gray-500">
                                                {order.items} items • {order.destination}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                            <div className="mt-2">
                                                <Button variant="outline" size="sm">
                                                    Process
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
