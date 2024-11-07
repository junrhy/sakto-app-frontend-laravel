import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Printer, Plus, Minus, Maximize, Minimize, Edit, Trash, Search } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";
import axios from 'axios';
import { toast } from 'sonner';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    created_at?: string;
    updated_at?: string;
}
  
interface OrderItem extends MenuItem {
    quantity: number;
}
  
interface Table {
    id: number;
    name: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved';
}
  
interface Reservation {
    id: number;
    name: string;
    date: string;
    time: string;
    guests: number;
    tableId: number;
}
  
const TABLES: Table[] = [
    { id: 1, name: "Table 1", seats: 4, status: 'available' },
    { id: 2, name: "Table 2", seats: 2, status: 'occupied' },
    { id: 3, name: "Table 3", seats: 6, status: 'reserved' },
    { id: 4, name: "Table 4", seats: 4, status: 'available' },
];

export default function PosRestaurant() {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [tableNumber, setTableNumber] = useState<string>("");
    const [isCompleteSaleDialogOpen, setIsCompleteSaleDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isSplitBillDialogOpen, setIsSplitBillDialogOpen] = useState(false);
    const [splitAmount, setSplitAmount] = useState<number>(2);
    const [tables, setTables] = useState<Table[]>(TABLES);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [newReservation, setNewReservation] = useState<Omit<Reservation, 'id'>>({
        name: '',
        date: '',
        time: '',
        guests: 1,
        tableId: 0,
    });
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
    const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
    const [newMenuItemImage, setNewMenuItemImage] = useState<File | null>(null);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const addItemToOrder = (item: MenuItem) => {
        const existingItem = orderItems.find(orderItem => orderItem.id === item.id);
        if (existingItem) {
        setOrderItems(orderItems.map(orderItem =>
            orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        ));
        } else {
        setOrderItems([...orderItems, { ...item, quantity: 1 }]);
        }
    };

    const removeItemFromOrder = (id: number) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    };

    const updateItemQuantity = (id: number, newQuantity: number) => {
        if (newQuantity > 0) {
        setOrderItems(orderItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
        } else {
        removeItemFromOrder(id);
        }
    };

    const calculateDiscount = (subtotal: number) => {
        if (discountType === 'percentage') {
        return subtotal * (discount / 100);
        } else {
        return discount;
        }
    };

    const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const discountAmount = calculateDiscount(totalAmount);
    const finalTotal = totalAmount - discountAmount;

    const handleCompleteSale = () => {
        setIsCompleteSaleDialogOpen(true);
    };

    const confirmCompleteSale = () => {
        console.log("Order completed for table", tableNumber, "Total:", finalTotal.toFixed(2));
        setOrderItems([]);
        setTableNumber("");
        setIsCompleteSaleDialogOpen(false);
        // Update table status
        setTables(tables.map(table => 
        table.name === tableNumber ? { ...table, status: 'available' } : table
        ));
    };

    const handleSplitBill = () => {
        setIsSplitBillDialogOpen(true);
    };

    const confirmSplitBill = () => {
        const amountPerPerson = finalTotal / splitAmount;
        console.log(`Bill split into ${splitAmount} parts. Each person pays: $${amountPerPerson.toFixed(2)}`);
        setIsSplitBillDialogOpen(false);
    };

    const printKitchenOrder = () => {
        const orderDetails = orderItems.map(item => `${item.quantity}x ${item.name}`).join('\n');
        const kitchenOrder = `
        Table: ${tableNumber}
        Time: ${new Date().toLocaleTimeString()}
        Order:
        ${orderDetails}
        `;
        console.log("Printing kitchen order:", kitchenOrder);
        // In a real application, you would send this to a printer or kitchen display system
    };

    const handleReservation = () => {
        const newReservationWithId = { ...newReservation, id: Date.now() };
        setReservations([...reservations, newReservationWithId]);
        // Update table status
        setTables(tables.map(table => 
        table.id === newReservation.tableId ? { ...table, status: 'reserved' } : table
        ));
        setNewReservation({ name: '', date: '', time: '', guests: 1, tableId: 0 });
    };

    const handleGenerateQR = (table: Table) => {
        setSelectedTable(table);
        setCustomerName(""); // Reset customer name when opening the dialog
        setIsQRDialogOpen(true);
    };

    const printQRCode = () => {
        const printContent = qrCodeRef.current;
        if (printContent) {
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        if (winPrint) {
            winPrint.document.write(`
            <html>
                <head>
                <title>Print QR Code</title>
                <style>
                    body { display: flex; justify-content: center; align-items: center; height: 100vh; }
                    .qr-container { text-align: center; }
                </style>
                </head>
                <body>
                <div class="qr-container">
                    <h2>QR Code for ${selectedTable?.name}</h2>
                    ${customerName ? `<p>Customer: ${customerName}</p>` : ''}
                    ${printContent.innerHTML}
                </div>
                </body>
            </html>
            `);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
            winPrint.close();
        }
        }
    };

    const filteredTables = useMemo(() => {
        if (tableStatusFilter === 'all') {
        return tables;
        }
        return tables.filter(table => table.status === tableStatusFilter);
    }, [tables, tableStatusFilter]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
        fullscreenRef.current?.requestFullscreen();
        setIsFullscreen(true);
        } else {
        document.exitFullscreen();
        setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleAddMenuItem = () => {
        setCurrentMenuItem(null);
        setIsMenuItemDialogOpen(true);
    };

    const handleEditMenuItem = (item: MenuItem) => {
        setCurrentMenuItem(item);
        setIsMenuItemDialogOpen(true);
    };

    const handleDeleteMenuItem = async (id: number) => {
        try {
            await axios.delete(`/api/menu-items/${id}`);
            toast.success('Menu item deleted successfully');
            fetchMenuItems(); // Refresh the menu items
            setSelectedMenuItems(selectedMenuItems.filter(itemId => itemId !== id));
        } catch (error) {
            console.error('Error deleting menu item:', error);
            toast.error('Failed to delete menu item');
        }
    };

    const handleDeleteSelectedMenuItems = async () => {
        try {
            await axios.post('/api/menu-items/bulk-destroy', {
                ids: selectedMenuItems
            });
            toast.success('Selected items deleted successfully');
            fetchMenuItems(); // Refresh the menu items
            setSelectedMenuItems([]);
        } catch (error) {
            console.error('Error deleting selected items:', error);
            toast.error('Failed to delete selected items');
        }
    };

    const handleSaveMenuItem = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            if (currentMenuItem) {
                formData.append('name', currentMenuItem.name);
                formData.append('price', currentMenuItem.price.toString());
                formData.append('category', currentMenuItem.category);
                if (newMenuItemImage) {
                    formData.append('image', newMenuItemImage);
                }
            }

            if (currentMenuItem?.id) {
                // Update existing item
                await axios.post(`/api/menu-items/${currentMenuItem.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                toast.success('Menu item updated successfully');
            } else {
                // Add new item
                await axios.post('/api/menu-items', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                toast.success('Menu item added successfully');
            }
            
            fetchMenuItems(); // Refresh the menu items
            setIsMenuItemDialogOpen(false);
            setCurrentMenuItem(null);
            setNewMenuItemImage(null);
        } catch (error) {
            console.error('Error saving menu item:', error);
            toast.error('Failed to save menu item');
        }
    };

    const handleMenuItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        setNewMenuItemImage(e.target.files[0]);
        }
    };

    const toggleMenuItemSelection = (id: number) => {
        setSelectedMenuItems(prev =>
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const categoryFilteredMenuItems = useMemo(() => {
        return selectedCategory
        ? menuItems.filter(item => item.category === selectedCategory)
        : menuItems;
    }, [menuItems, selectedCategory]);

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [menuItems, searchTerm]);

    const paginatedMenuItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMenuItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMenuItems, currentPage]);

    const pageCount = Math.ceil(filteredMenuItems.length / itemsPerPage);
    
    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('/api/menu-items');
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            toast.error('Failed to load menu items');
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Point of Sale
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" ref={fullscreenRef}>
                <div className="flex justify-between items-center mb-4">
                    <Button onClick={toggleFullscreen} className="bg-gray-700 hover:bg-gray-600 text-white">
                    {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />}
                    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    </Button>
                </div>

                <Tabs defaultValue="pos" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pos">POS</TabsTrigger>
                    <TabsTrigger value="tables">Tables</TabsTrigger>
                    <TabsTrigger value="reservations">Reservations</TabsTrigger>
                    <TabsTrigger value="menu">Menu Management</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pos">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                        <CardHeader>
                            <CardTitle>Menu Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                            <Select onValueChange={(value) => setSelectedCategory(value)}>
                                <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                <SelectItem value="Main">Main Dishes</SelectItem>
                                <SelectItem value="Side">Side Dishes</SelectItem>
                                <SelectItem value="Drink">Drinks</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {categoryFilteredMenuItems.map((item) => (
                                <Button
                                key={item.id}
                                onClick={() => addItemToOrder(item)}
                                className="h-auto flex flex-col items-center p-2 touch-manipulation bg-gray-700 hover:bg-gray-600 text-white"
                                >
                                <img src={item.image} alt={item.name} width={100} height={100} className="mb-2 rounded" />
                                <span className="text-center">{item.name}</span>
                                <span>${item.price.toFixed(2)}</span>
                                </Button>
                            ))}
                            </div>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader>
                            <CardTitle>Current Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                            <Label htmlFor="tableNumber">Table Number</Label>
                            <Input
                                id="tableNumber"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="Enter table number"
                                className="text-lg p-2"
                            />
                            </div>
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Item</TableHead>
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
                                        <Button size="sm" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-lg">{item.quantity}</span>
                                        <Button size="sm" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    </TableCell>
                                    <TableCell>${item.price.toFixed(2)}</TableCell>
                                    <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                                    <TableCell>
                                    <Button variant="destructive" size="sm" onClick={() => removeItemFromOrder(item.id)}>
                                        Remove
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>
                            <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="discountType">Discount Type</Label>
                                <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="discount">Discount</Label>
                                <Input
                                id="discount"
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                placeholder={discountType === 'percentage' ? "Enter percentage" : "Enter amount"}
                                />
                            </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start">
                            <div className="w-full flex justify-between mb-2">
                            <span>Subtotal:</span>
                            <span>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="w-full flex justify-between mb-2">
                            <span>Discount:</span>
                            <span>${discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="w-full flex justify-between mb-4">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold">${finalTotal.toFixed(2)}</span>
                            </div>
                            <div className="w-full flex justify-end space-x-2 mt-4">
                            <Button onClick={printKitchenOrder} disabled={orderItems.length === 0} className="text-lg py-6 bg-gray-700 hover:bg-gray-600 text-white">Print Kitchen Order</Button>
                            <Button onClick={handleSplitBill} disabled={orderItems.length === 0} className="text-lg py-6 bg-gray-700 hover:bg-gray-600 text-white">Split Bill</Button>
                            <Button onClick={handleCompleteSale} disabled={orderItems.length === 0 || !tableNumber} className="text-lg py-6 bg-blue-500 hover:bg-blue-600 text-white">Complete Order</Button>
                            </div>
                        </CardFooter>
                        </Card>
                    </div>
                    </TabsContent>
                    <TabsContent value="tables">
                    <Card>
                        <CardHeader>
                        <CardTitle>Table Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="mb-4">
                            <Label htmlFor="tableStatusFilter">Filter by Status</Label>
                            <Select
                            value={tableStatusFilter}
                            onValueChange={(value: 'all' | 'available' | 'occupied' | 'reserved') => setTableStatusFilter(value)}
                            >
                            <SelectTrigger id="tableStatusFilter" className="bg-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="occupied">Occupied</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredTables.map((table) => (
                            <Card key={table.id}>
                                <CardHeader>
                                <CardTitle>{table.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                <p>Seats: {table.seats}</p>
                                <p>Status: {table.status}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                <Button
                                    variant={table.status === 'available' ? 'outline' : 'secondary'}
                                    onClick={() => setTableNumber(table.name)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white"
                                >
                                    Select
                                </Button>
                                <Button onClick={() => handleGenerateQR(table)} className="bg-gray-700 hover:bg-gray-600 text-white">
                                    Generate QR
                                </Button>
                                </CardFooter>
                            </Card>
                            ))}
                        </div>
                        </CardContent>
                    </Card>
                    </TabsContent>
                    <TabsContent value="reservations">
                    <Card>
                        <CardHeader>
                        <CardTitle>Reservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                            <Label htmlFor="reservationName">Name</Label>
                            <Input
                                id="reservationName"
                                value={newReservation.name}
                                onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
                            />
                            </div>
                            <div>
                            <Label htmlFor="reservationDate">Date</Label>
                            <Input
                                id="reservationDate"
                                type="date"
                                value={newReservation.date}
                                onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                            />
                            </div>
                            <div>
                            <Label htmlFor="reservationTime">Time</Label>
                            <Input
                                id="reservationTime"
                                type="time"
                                value={newReservation.time}
                                onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                            />
                            </div>
                            <div>
                            <Label htmlFor="reservationGuests">Guests</Label>
                            <Input
                                id="reservationGuests"
                                type="number"
                                value={newReservation.guests}
                                onChange={(e) => setNewReservation({ ...newReservation, guests: parseInt(e.target.value) })}
                            />
                            </div>
                            <div>
                            <Label htmlFor="reservationTable">Table</Label>
                            <Select onValueChange={(value) => setNewReservation({ ...newReservation, tableId: parseInt(value) })}>
                                <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select table" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                {tables.filter(table => table.status === 'available').map((table) => (
                                    <SelectItem key={table.id} value={table.id.toString()}>{table.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                        <Button onClick={handleReservation} className="bg-blue-500 hover:bg-blue-600 text-white">Make Reservation</Button>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Table</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {reservations.map((reservation) => (
                                <TableRow key={reservation.id}>
                                <TableCell>{reservation.name}</TableCell>
                                <TableCell>{reservation.date}</TableCell>
                                <TableCell>{reservation.time}</TableCell>
                                <TableCell>{reservation.guests}</TableCell>
                                <TableCell>{tables.find(table => table.id === reservation.tableId)?.name}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                    </TabsContent>
                    <TabsContent value="menu">
                    <Card>
                        <CardHeader>
                        <CardTitle>Menu Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="flex justify-between mb-4">
                            <div className="flex items-center space-x-2">
                            <Button onClick={handleAddMenuItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                            </Button>
                            <Button 
                                onClick={handleDeleteSelectedMenuItems} 
                                variant="destructive" 
                                disabled={selectedMenuItems.length === 0}
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete Selected
                            </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search menu items..."
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
                                    checked={selectedMenuItems.length === paginatedMenuItems.length}
                                    onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedMenuItems(paginatedMenuItems.map(item => item.id));
                                    } else {
                                        setSelectedMenuItems([]);
                                    }
                                    }}
                                />
                                </TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {paginatedMenuItems.map((item) => (
                                <TableRow key={item.id}>
                                <TableCell>
                                    <Checkbox
                                    checked={selectedMenuItems.includes(item.id)}
                                    onCheckedChange={() => toggleMenuItemSelection(item.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    width={50} 
                                    height={50} 
                                    className="rounded-md object-cover"
                                    />
                                </TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>${item.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditMenuItem(item)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteMenuItem(item.id)}>
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-between items-center mt-4">
                            <div>
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMenuItems.length)} of {filteredMenuItems.length} items
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
                    </TabsContent>
                </Tabs>

                <Dialog open={isCompleteSaleDialogOpen} onOpenChange={setIsCompleteSaleDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Order</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Table Number: {tableNumber}</p>
                        <p>Total Amount: ${finalTotal.toFixed(2)}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCompleteSaleDialogOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white">Cancel</Button>
                        <Button onClick={confirmCompleteSale} className="bg-blue-500 hover:bg-blue-600 text-white">Confirm Order</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isSplitBillDialogOpen} onOpenChange={setIsSplitBillDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Split Bill</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="splitAmount">Number of ways to split</Label>
                        <Input
                        id="splitAmount"
                        type="number"
                        value={splitAmount}
                        onChange={(e) => setSplitAmount(parseInt(e.target.value))}
                        min={2}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSplitBillDialogOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white">Cancel</Button>
                        <Button onClick={confirmSplitBill} className="bg-blue-500 hover:bg-blue-600 text-white">Split Bill</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>QR Code for {selectedTable?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                        <Label htmlFor="customerName">Customer Name (Optional)</Label>
                        <Input
                            id="customerName"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                        />
                        </div>
                        <div className="flex flex-col items-center" ref={qrCodeRef}>
                        {selectedTable && (
                            <QRCodeSVG
                            value={`https://your-restaurant-domain.com/menu?table=${selectedTable.id}${customerName ? `&customer=${encodeURIComponent(customerName)}` : ''}`}
                            size={200}
                            />
                        )}
                        <p className="mt-2 text-sm text-gray-500">Scan to view menu</p>
                        {customerName && <p className="mt-1 text-sm">Customer: {customerName}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={printQRCode} className="mr-2 bg-gray-700 hover:bg-gray-600 text-white">
                        <Printer className="mr-2 h-4 w-4" />
                        Print QR Code
                        </Button>
                        <Button onClick={() => setIsQRDialogOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white">Close</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isMenuItemDialogOpen} onOpenChange={setIsMenuItemDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentMenuItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveMenuItem}>
                        <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                            id="name"
                            value={currentMenuItem?.name || ''}
                            onChange={(e) => setCurrentMenuItem({ ...currentMenuItem!, name: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Select
                            value={currentMenuItem?.category || ''}
                            onValueChange={(value) => setCurrentMenuItem({ ...currentMenuItem!, category: value })}
                            >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Main">Main</SelectItem>
                                <SelectItem value="Side">Side</SelectItem>
                                <SelectItem value="Drink">Drink</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={currentMenuItem?.price || ''}
                            onChange={(e) => setCurrentMenuItem({ ...currentMenuItem!, price: parseFloat(e.target.value) })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">Image</Label>
                            <Input
                            id="image"
                            type="file"
                            onChange={handleMenuItemImageChange}
                            className="col-span-3"
                            />
                        </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
