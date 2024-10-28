import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

type Product = {
    id: string;
    name: string;
    quantity: number;
    location: string;
};

type ShipmentType = {
    id: string;
    orderNumber: string;
    status: string;
    destination: string;
};

export default function Warehousing() {
    const currency = '$';
    const [products, setProducts] = useState<Product[]>([
        { id: '1', name: 'Product A', quantity: 100, location: 'Warehouse 1' },
        { id: '2', name: 'Product B', quantity: 150, location: 'Warehouse 2' },
    ]);
    const [newProduct, setNewProduct] = useState({ name: '', quantity: '', location: '' });

    // New state for receiving
    const [receivingItems, setReceivingItems] = useState({ poNumber: '', items: '', quantity: '' });
    
    // New state for shipping
    const [shipments, setShipments] = useState<ShipmentType[]>([
        { id: '1', orderNumber: 'ORD001', status: 'Pending', destination: 'New York' },
    ]);

    const addProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const quantity = parseInt(newProduct.quantity);
        if (isNaN(quantity)) return;
        setProducts([...products, { 
            id: Date.now().toString(), 
            name: newProduct.name, 
            quantity, 
            location: newProduct.location 
        }]);
        setNewProduct({ name: '', quantity: '', location: '' });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Warehousing
                </h2>
            }
        >
            <Head title="Warehousing" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <Tabs defaultValue="inventory" className="space-y-4">
                                <TabsList className="grid w-full grid-cols-7">
                                    <TabsTrigger value="receiving">Receiving</TabsTrigger>
                                    <TabsTrigger value="putaway">Putaway</TabsTrigger>
                                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                                    <TabsTrigger value="stocktaking">Stocktaking</TabsTrigger>
                                    <TabsTrigger value="picking">Picking</TabsTrigger>
                                    <TabsTrigger value="packing">Packing</TabsTrigger>
                                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                                </TabsList>

                                {/* Receiving Tab */}
                                <TabsContent value="receiving">
                                    <form className="space-y-4">
                                        <Input
                                            placeholder="PO Number"
                                            value={receivingItems.poNumber}
                                            onChange={(e) => setReceivingItems({ ...receivingItems, poNumber: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Items"
                                            value={receivingItems.items}
                                            onChange={(e) => setReceivingItems({ ...receivingItems, items: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Quantity"
                                            value={receivingItems.quantity}
                                            onChange={(e) => setReceivingItems({ ...receivingItems, quantity: e.target.value })}
                                        />
                                        <Button>Process Receipt</Button>
                                    </form>
                                </TabsContent>

                                {/* Putaway Tab */}
                                <TabsContent value="putaway">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Pending Putaway Tasks</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Receipt ID</TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Suggested Location</TableHead>
                                                    <TableHead>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>REC001</TableCell>
                                                    <TableCell>Product A</TableCell>
                                                    <TableCell>Zone A-123</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline">Complete Putaway</Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                {/* Inventory Tab */}
                                <TabsContent value="inventory">
                                    <form onSubmit={addProduct} className="mb-6 space-y-4">
                                        <Input
                                            placeholder="Product Name"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            required
                                        />
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
                                        <Button type="submit">Add Product</Button>
                                    </form>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product Name</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Location</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell>{product.quantity}</TableCell>
                                                    <TableCell>{product.location}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                {/* Stocktaking Tab */}
                                <TabsContent value="stocktaking">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <Input placeholder="Scan Location" />
                                            <Button>Start Count</Button>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Location</TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>System Quantity</TableHead>
                                                    <TableHead>Counted Quantity</TableHead>
                                                    <TableHead>Variance</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {/* Add your stocktaking data here */}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                {/* Picking Tab */}
                                <TabsContent value="picking">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Pick Lists</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order ID</TableHead>
                                                    <TableHead>Items</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>PICK001</TableCell>
                                                    <TableCell>3 items</TableCell>
                                                    <TableCell>Pending</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline">Start Picking</Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                {/* Packing Tab */}
                                <TabsContent value="packing">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <Input placeholder="Scan Order Number" />
                                            <Button>Start Packing</Button>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order ID</TableHead>
                                                    <TableHead>Items</TableHead>
                                                    <TableHead>Packing Status</TableHead>
                                                    <TableHead>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {/* Add your packing data here */}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                {/* Shipping Tab */}
                                <TabsContent value="shipping">
                                    <div className="space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order Number</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Destination</TableHead>
                                                    <TableHead>Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {shipments.map((shipment) => (
                                                    <TableRow key={shipment.id}>
                                                        <TableCell>{shipment.orderNumber}</TableCell>
                                                        <TableCell>{shipment.status}</TableCell>
                                                        <TableCell>{shipment.destination}</TableCell>
                                                        <TableCell>
                                                            <Button variant="outline">Process Shipment</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
