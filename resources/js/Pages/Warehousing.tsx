import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

type Product = {
    id: string;
    name: string;
    quantity: number;
    location: string;
};

export default function Warehousing() {
    //   const { currency } = useApp();
    const currency = '$';

    const [products, setProducts] = useState<Product[]>([
        { id: '1', name: 'Product A', quantity: 100, location: 'Warehouse 1' },
        { id: '2', name: 'Product B', quantity: 150, location: 'Warehouse 2' },
    ]);
    const [newProduct, setNewProduct] = useState({ name: '', quantity: '', location: '' });

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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
