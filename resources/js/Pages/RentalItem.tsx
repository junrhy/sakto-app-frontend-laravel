import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";

interface RentalItem {
    id: number;
    name: string;
    category: string;
    dailyRate: number;
    quantity: number;
    status: 'available' | 'rented' | 'maintenance';
    renter?: {
      name: string;
      contact: string;
      rentalStart: string;
      rentalEnd: string;
    };
}
  
const INITIAL_RENTAL_ITEMS: RentalItem[] = [
    { id: 1, name: "Lawn Mower", category: "Garden", dailyRate: 25, quantity: 5, status: 'available' },
    { id: 2, name: "Pressure Washer", category: "Cleaning", dailyRate: 35, quantity: 3, status: 'rented', renter: { name: "John Doe", contact: "john@example.com", rentalStart: "2023-06-01", rentalEnd: "2023-06-05" } },
    { id: 3, name: "Drill", category: "Tools", dailyRate: 15, quantity: 10, status: 'available' },
];

export default function RentalItem() {
    const [rentalItems, setRentalItems] = useState<RentalItem[]>(INITIAL_RENTAL_ITEMS);
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RentalItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleAddItem = () => {
        setCurrentItem(null);
        setIsItemDialogOpen(true);
    };

    const handleEditItem = (item: RentalItem) => {
        setCurrentItem(item);
        setIsItemDialogOpen(true);
    };

    const handleDeleteItem = (id: number) => {
        setRentalItems(rentalItems.filter(item => item.id !== id));
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    };

    const handleDeleteSelectedItems = () => {
        setRentalItems(rentalItems.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
    };

    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentItem) {
        if (currentItem.id) {
            // Edit existing item
            setRentalItems(rentalItems.map(item => 
            item.id === currentItem.id ? currentItem : item
            ));
        } else {
            // Add new item
            setRentalItems([...rentalItems, { ...currentItem, id: Date.now() }]);
        }
        }
        setIsItemDialogOpen(false);
        setCurrentItem(null);
    };

    const toggleItemSelection = (id: number) => {
        setSelectedItems(prev =>
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const filteredItems = useMemo(() => {
        return rentalItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.renter?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [rentalItems, searchTerm]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Rental Items
                </h2>
            }
        >
            <Head title="Items" />

            <div className="py-0">
                <div className="">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 border-2">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                        <Card>
                        <CardHeader>
                        <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="flex justify-between mb-4">
                            <div className="flex items-center space-x-2">
                            <Button onClick={handleAddItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Rental Item
                            </Button>
                            <Button 
                                onClick={handleDeleteSelectedItems} 
                                variant="destructive" 
                                disabled={selectedItems.length === 0}
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete Selected
                            </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search rental items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedItems.length === paginatedItems.length}
                                    onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedItems(paginatedItems.map(item => item.id));
                                    } else {
                                        setSelectedItems([]);
                                    }
                                    }}
                                />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Daily Rate</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Renter</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {paginatedItems.map((item) => (
                                <TableRow key={item.id}>
                                <TableCell>
                                    <Checkbox
                                    checked={selectedItems.includes(item.id)}
                                    onCheckedChange={() => toggleItemSelection(item.id)}
                                    />
                                </TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>${item.dailyRate.toFixed(2)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell>
                                    {item.renter ? (
                                    <div>
                                        <p>{item.renter.name}</p>
                                        <p className="text-sm text-gray-500">{item.renter.contact}</p>
                                        <p className="text-sm text-gray-500">{item.renter.rentalStart} to {item.renter.rentalEnd}</p>
                                    </div>
                                    ) : (
                                    "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditItem(item)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-between items-center mt-4">
                            <div>
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                            </div>
                            <div className="flex space-x-2">
                            <Button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                <Button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                variant={currentPage === page ? "default" : "outline"}
                                >
                                {page}
                                </Button>
                            ))}
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                                disabled={currentPage === pageCount}
                            >
                                Next
                            </Button>
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentItem?.id ? 'Edit Rental Item' : 'Add Rental Item'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveItem}>
                            <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                id="name"
                                value={currentItem?.name || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem!, name: e.target.value })}
                                className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Category</Label>
                                <Input
                                id="category"
                                value={currentItem?.category || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem!, category: e.target.value })}
                                className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dailyRate" className="text-right">Daily Rate</Label>
                                <Input
                                id="dailyRate"
                                type="number"
                                value={currentItem?.dailyRate || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem!, dailyRate: parseFloat(e.target.value) })}
                                className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                                <Input
                                id="quantity"
                                type="number"
                                value={currentItem?.quantity || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem!, quantity: parseInt(e.target.value) })}
                                className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <Select
                                value={currentItem?.status || ''}
                                onValueChange={(value: 'available' | 'rented' | 'maintenance') => setCurrentItem({ ...currentItem!, status: value })}
                                >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="rented">Rented</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                            {currentItem?.status === 'rented' && (
                                <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="renterName" className="text-right">Renter Name</Label>
                                    <Input
                                    id="renterName"
                                    value={currentItem?.renter?.name || ''}
                                    onChange={(e) => setCurrentItem({ 
                                        ...currentItem!, 
                                        renter: { ...currentItem.renter!, name: e.target.value } 
                                    })}
                                    className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="renterContact" className="text-right">Renter Contact</Label>
                                    <Input
                                    id="renterContact"
                                    value={currentItem?.renter?.contact || ''}
                                    onChange={(e) => setCurrentItem({ 
                                        ...currentItem!, 
                                        renter: { ...currentItem.renter!, contact: e.target.value } 
                                    })}
                                    className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="rentalStart" className="text-right">Rental Start</Label>
                                    <Input
                                    id="rentalStart"
                                    type="date"
                                    value={currentItem?.renter?.rentalStart || ''}
                                    onChange={(e) => setCurrentItem({ 
                                        ...currentItem!, 
                                        renter: { ...currentItem.renter!, rentalStart: e.target.value } 
                                    })}
                                    className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="rentalEnd" className="text-right">Rental End</Label>
                                    <Input
                                    id="rentalEnd"
                                    type="date"
                                    value={currentItem?.renter?.rentalEnd || ''}
                                    onChange={(e) => setCurrentItem({ 
                                        ...currentItem!, 
                                        renter: { ...currentItem.renter!, rentalEnd: e.target.value } 
                                    })}
                                    className="col-span-3"
                                    />
                                </div>
                                </>
                            )}
                            </div>
                            <DialogFooter>
                            <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                        </DialogContent>
                    </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
