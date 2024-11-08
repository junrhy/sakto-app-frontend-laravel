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
import { Printer, Plus, Minus, Maximize, Minimize, Edit, Trash, Search, QrCode, Trash2, Link2, Check } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DialogTrigger } from "@/Components/ui/dialog";

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    image?: string;
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
    status: 'available' | 'occupied' | 'reserved' | 'joined';
}
  
interface Reservation {
    id: number;
    name: string;
    date: string;
    time: string;
    guests: number;
    tableId: number;
}
  
interface MenuItemFormData {
    name: string;
    price: number;
    category: string;
    image?: string;
}

interface JoinedTable {
    id: number;
    tableIds: number[];
    name: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved';
}

interface PageProps {
    menuItems: MenuItem[];
    tables: Table[];
    tab?: string;
}

interface EditTableData {
    id: number;
    name: string;
    seats: number;
}

export default function PosRestaurant({ menuItems: initialMenuItems, tables: initialTables, tab = 'pos' }: PageProps) {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
    const [tableNumber, setTableNumber] = useState<string>("");
    const [isCompleteSaleDialogOpen, setIsCompleteSaleDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isSplitBillDialogOpen, setIsSplitBillDialogOpen] = useState(false);
    const [splitAmount, setSplitAmount] = useState<number>(2);
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
    const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'available' | 'occupied' | 'reserved' | 'joined'>('all');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
    const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
    const [newMenuItemImage, setNewMenuItemImage] = useState<File | null>(null);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [newTableName, setNewTableName] = useState<string>("");
    const [newTableSeats, setNewTableSeats] = useState<number>(1);
    const [joinedTables, setJoinedTables] = useState<JoinedTable[]>([]);
    const [selectedTablesForJoin, setSelectedTablesForJoin] = useState<number[]>([]);
    const [isJoinTableDialogOpen, setIsJoinTableDialogOpen] = useState(false);
    const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
    const [editTableData, setEditTableData] = useState<EditTableData | null>(null);

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

    const handleJoinTables = () => {
        if (selectedTablesForJoin.length < 2) {
            toast.error('Please select at least 2 tables to join');
            return;
        }

        const selectedTableDetails = selectedTablesForJoin.map(id => 
            tables.find(table => table.id === id)
        ).filter((table): table is Table => table !== undefined);

        // Check if all selected tables are available
        if (!selectedTableDetails.every(table => table.status === 'available')) {
            toast.error('Can only join available tables');
            return;
        }

        const totalSeats = selectedTableDetails.reduce((sum, table) => sum + table.seats, 0);
        const joinedTableNames = selectedTableDetails.map(table => table.name).join(' + ');

        const newJoinedTable: JoinedTable = {
            id: Date.now(),
            tableIds: selectedTablesForJoin,
            name: joinedTableNames,
            seats: totalSeats,
            status: 'available'
        };

        setJoinedTables([...joinedTables, newJoinedTable]);
        
        // Update original tables' status to indicate they're part of a joined table
        setTables(tables.map(table => 
            selectedTablesForJoin.includes(table.id) 
                ? { ...table, status: 'joined' } 
                : table
        ));

        setSelectedTablesForJoin([]);
        setIsJoinTableDialogOpen(false);
        toast.success('Tables joined successfully');
    };

    const handleUnjoinTable = (joinedTable: JoinedTable) => {
        // Restore original tables to available status
        setTables(tables.map(table => 
            joinedTable.tableIds.includes(table.id)
                ? { ...table, status: 'available' }
                : table
        ));

        // Remove the joined table
        setJoinedTables(joinedTables.filter(jt => jt.id !== joinedTable.id));
        toast.success('Tables unjoined successfully');
    };

    const toggleTableSelection = (tableId: number) => {
        setSelectedTablesForJoin(prev => 
            prev.includes(tableId)
                ? prev.filter(id => id !== tableId)
                : [...prev, tableId]
        );
    };

    const filteredTables = useMemo(() => {
        let filtered = tables;
        if (tableStatusFilter !== 'all') {
            filtered = tables.filter(table => table.status === tableStatusFilter);
        }
        // Don't show tables that are part of joined tables unless specifically filtering for them
        if (tableStatusFilter !== 'joined') {
            filtered = filtered.filter(table => table.status !== 'joined');
        }
        return filtered;
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
            router.delete(`/pos-restaurant/menu-item/${id}`, {
                onSuccess: () => {
                    toast.success('Menu item deleted successfully');
                    setMenuItems(menuItems.filter(item => item.id !== id));
                    setSelectedMenuItems(selectedMenuItems.filter(itemId => itemId !== id));
                },
                onError: () => {
                    toast.error('Failed to delete menu item');
                }
            });
        } catch (error) {
            console.error('Error deleting menu item:', error);
            toast.error('Failed to delete menu item');
        }
    };

    const handleDeleteSelectedMenuItems = async () => {
        try {
            router.post('/pos-restaurant/menu-items/bulk-destroy', {
                ids: selectedMenuItems
            }, {
                onSuccess: () => {
                    toast.success('Selected items deleted successfully');
                    setMenuItems(menuItems.filter(item => !selectedMenuItems.includes(item.id)));
                    setSelectedMenuItems([]);
                },
                onError: () => {
                    toast.error('Failed to delete selected items');
                }
            });
        } catch (error) {
            console.error('Error deleting selected items:', error);
            toast.error('Failed to delete selected items');
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await fetch('/pos-restaurant/menu-items');
            const updatedMenuItems = await response.json();
            setMenuItems(updatedMenuItems);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const handleSaveMenuItem = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            const menuItemData: MenuItemFormData = {
                name: currentMenuItem?.name || '',
                price: currentMenuItem?.price || 0,
                category: currentMenuItem?.category || '',
                image: currentMenuItem?.image
            };

            Object.entries(menuItemData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            if (newMenuItemImage) {
                formData.append('image', newMenuItemImage);
            }

            const url = currentMenuItem?.id 
                ? `/pos-restaurant/menu-item/${currentMenuItem.id}` 
                : '/pos-restaurant/menu-items';

            const method = currentMenuItem?.id ? 'PUT' : 'POST';

            await router.post(url, formData, {
                headers: {
                    'X-HTTP-Method-Override': method
                },
                preserveScroll: true,
                onSuccess: async () => {
                    toast.success(`Menu item ${currentMenuItem?.id ? 'updated' : 'added'} successfully`);
                    setIsMenuItemDialogOpen(false);
                    setCurrentMenuItem(null);
                    setNewMenuItemImage(null);

                    // Fetch updated menu items
                    await fetchMenuItems();
                },
                onError: () => {
                    toast.error(`Failed to ${currentMenuItem?.id ? 'update' : 'add'} menu item`);
                }
            });
        } catch (error) {
            console.error('Error saving menu item:', error);
            toast.error('Failed to save menu item');
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

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
            ? menuItems.filter((item: MenuItem) => item.category === selectedCategory)
            : menuItems;
    }, [menuItems, selectedCategory]);

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item: MenuItem) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [menuItems, searchTerm]);

    const paginatedMenuItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMenuItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMenuItems, currentPage]);

    const pageCount = Math.ceil(filteredMenuItems.length / itemsPerPage);
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedMenuItems(paginatedMenuItems.map((item: MenuItem) => item.id));
        } else {
            setSelectedMenuItems([]);
        }
    };

    const handleTabChange = (value: string) => {
        router.get(
            window.location.pathname,
            { tab: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleAddTable = async () => {
        if (newTableName && newTableSeats > 0) {
            try {
                await router.post('/fnb-tables', {
                    name: newTableName,
                    seats: newTableSeats,
                    status: 'available'
                }, {
                    onSuccess: () => {
                        setNewTableName("");
                        setNewTableSeats(1);
                        setIsAddTableDialogOpen(false);
                        toast.success('Table added successfully');
                    },
                    onError: () => {
                        toast.error('Failed to add table');
                    }
                });
            } catch (error) {
                console.error('Error adding table:', error);
                toast.error('Failed to add table');
            }
        } else {
            toast.error('Please enter valid table name and seats');
        }
    };

    const handleRemoveTable = async (id: number) => {
        try {
            await router.delete(`/fnb-tables/${id}`, {
                onSuccess: () => {
                    setTables(tables.filter(table => table.id !== id));
                    toast.success('Table removed successfully');
                },
                onError: () => {
                    toast.error('Failed to remove table');
                }
            });
        } catch (error) {
            console.error('Error removing table:', error);
            toast.error('Failed to remove table');
        }
    };

    const updateTableStatus = async (tableId: number, status: Table['status']) => {
        try {
            await router.put(`/fnb-tables/${tableId}`, {
                status: status
            }, {
                preserveState: true,
                preserveScroll: true,
            });
            
            setTables(prevTables =>
                prevTables.map(table =>
                    table.id === tableId ? { ...table, status } : table
                )
            );
            
            toast.success('Table status updated successfully');
        } catch (error) {
            console.error('Error updating table status:', error);
            toast.error('Failed to update table status');
        }
    };

    const handleEditTable = async () => {
        if (!editTableData) return;

        try {
            await router.put(`/fnb-tables/${editTableData.id}`, {
                name: editTableData.name,
                seats: editTableData.seats
            }, {
                onSuccess: () => {
                    setTables(tables.map(table => 
                        table.id === editTableData.id 
                            ? { ...table, name: editTableData.name, seats: editTableData.seats }
                            : table
                    ));
                    setIsEditTableDialogOpen(false);
                    setEditTableData(null);
                    toast.success('Table updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update table');
                }
            });
        } catch (error) {
            console.error('Error updating table:', error);
            toast.error('Failed to update table');
        }
    };

    const openEditTableDialog = (table: Table) => {
        setEditTableData({
            id: table.id,
            name: table.name,
            seats: table.seats
        });
        setIsEditTableDialogOpen(true);
    };

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

                <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
                    <TabsList className={`grid w-full ${
                        useMediaQuery('(min-width: 640px)') 
                            ? 'grid-cols-4' 
                            : 'grid-cols-2'
                    } gap-0.5 p-0.5 min-h-0 bg-muted h-90`}>
                        <TabsTrigger 
                            value="pos" 
                            className="text-[10px] sm:text-sm md:text-base whitespace-nowrap px-0.5 py-0.5 h-7 sm:h-10 min-h-0 data-[state=active]:bg-background"
                        >
                            POS
                        </TabsTrigger>
                        <TabsTrigger 
                            value="tables" 
                            className="text-[10px] sm:text-sm md:text-base whitespace-nowrap px-0.5 py-0.5 h-7 sm:h-10 min-h-0 data-[state=active]:bg-background"
                        >
                            Tables
                        </TabsTrigger>
                        <TabsTrigger 
                            value="reservations" 
                            className="text-[10px] sm:text-sm md:text-base whitespace-nowrap px-0.5 py-0.5 h-7 sm:h-10 min-h-0 data-[state=active]:bg-background"
                        >
                            Reservations
                        </TabsTrigger>
                        <TabsTrigger 
                            value="menu" 
                            className="text-[10px] sm:text-sm md:text-base whitespace-nowrap px-0.5 py-0.5 h-7 sm:h-10 min-h-0 data-[state=active]:bg-background"
                        >
                            Menu
                        </TabsTrigger>
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
                            {categoryFilteredMenuItems.map((item: MenuItem) => (
                                <Button
                                key={item.id}
                                onClick={() => addItemToOrder(item)}
                                className="h-auto flex flex-col items-center p-2 touch-manipulation bg-gray-700 hover:bg-gray-600 text-white"
                                >
                                <img 
                                    src={item.image || '/placeholder-image.jpg'} 
                                    alt={item.name} 
                                    width={100} 
                                    height={100} 
                                    className="mb-2 rounded" 
                                />
                                <span className="text-center">{item.name}</span>
                                <span>${item.price}</span>
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
                            <div className="flex justify-between items-center">
                                <CardTitle>Table Management</CardTitle>
                                <Button onClick={() => setIsAddTableDialogOpen(true)} className="bg-gray-700 hover:bg-gray-600 text-white">
                                    <Plus className="mr-2 h-4 w-4" /> Add Table
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-end space-x-2">
                                    <Button 
                                        onClick={() => setIsJoinTableDialogOpen(true)}
                                        className="bg-gray-700 hover:bg-gray-600 text-white"
                                        disabled={selectedTablesForJoin.length < 2}
                                    >
                                        Join Selected Tables
                                    </Button>
                                </div>
                                <div>
                                    <Label htmlFor="tableStatusFilter">Filter by Status</Label>
                                    <Select
                                        value={tableStatusFilter}
                                        onValueChange={(value: 'all' | 'available' | 'occupied' | 'reserved' | 'joined') => setTableStatusFilter(value)}
                                    >
                                        <SelectTrigger id="tableStatusFilter" className="bg-white">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="occupied">Occupied</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="joined">Joined</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredTables.map((table) => (
                                    <Card 
                                        key={table.id}
                                        className={`${
                                            selectedTablesForJoin.includes(table.id) ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    >
                                        <CardHeader>
                                            <CardTitle>{table.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Seats: {table.seats}</p>
                                            <p>Status: {table.status}</p>
                                        </CardContent>
                                        <CardFooter className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
                                            {table.status === 'available' && (
                                                <Button
                                                    onClick={() => toggleTableSelection(table.id)}
                                                    variant={selectedTablesForJoin.includes(table.id) ? "default" : "outline"}
                                                    className="w-full md:w-auto"
                                                >
                                                    {selectedTablesForJoin.includes(table.id) ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Link2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                            <Button onClick={() => setTableNumber(table.name)} className="bg-gray-700 hover:bg-gray-600 text-white w-full md:w-auto">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => handleGenerateQR(table)} className="bg-gray-700 hover:bg-gray-600 text-white w-full md:w-auto">
                                                <QrCode className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => openEditTableDialog(table)} className="bg-gray-700 hover:bg-gray-600 text-white w-full md:w-auto">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => handleRemoveTable(table.id)} className="bg-red-500 hover:bg-red-600 text-white w-full md:w-auto">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {joinedTables.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4">Joined Tables</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {joinedTables.map((joinedTable) => (
                                            <Card key={joinedTable.id}>
                                                <CardHeader>
                                                    <CardTitle>{joinedTable.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p>Total Seats: {joinedTable.seats}</p>
                                                    <p>Status: {joinedTable.status}</p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button
                                                        onClick={() => handleUnjoinTable(joinedTable)}
                                                        variant="destructive"
                                                        className="w-full"
                                                    >
                                                        Unjoin Tables
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button 
                                        onClick={handleAddMenuItem}
                                        className="w-full sm:w-auto"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                                    </Button>
                                    <Button 
                                        onClick={handleDeleteSelectedMenuItems} 
                                        variant="destructive" 
                                        disabled={selectedMenuItems.length === 0}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash className="mr-2 h-4 w-4" /> 
                                        <span className="hidden sm:inline">Delete Selected</span>
                                        <span className="sm:hidden">Delete ({selectedMenuItems.length})</span>
                                    </Button>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search menu items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-full"
                                    />
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedMenuItems.length === paginatedMenuItems.length}
                                        onCheckedChange={handleSelectAll}
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
                                {paginatedMenuItems.map((item: MenuItem) => (
                                    <TableRow key={item.id}>
                                    <TableCell>
                                        <Checkbox
                                        checked={selectedMenuItems.includes(item.id)}
                                        onCheckedChange={() => toggleMenuItemSelection(item.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <img 
                                        src={item.image || '/placeholder-image.jpg'} 
                                        alt={item.name} 
                                        width={50} 
                                        height={50} 
                                        className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>${item.price}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditMenuItem(item)}>
                                        <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteMenuItem(item.id)}>
                                        <Trash className="h-4 w-4" />
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
                            onChange={(e) => setCurrentMenuItem({ 
                                ...currentMenuItem!, 
                                name: e.target.value 
                            })}
                            className="col-span-3"
                            required
                        />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Select
                            value={currentMenuItem?.category || ''}
                            onValueChange={(value) => setCurrentMenuItem({ 
                                ...currentMenuItem!, 
                                category: value 
                            })}
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
                            onChange={(e) => setCurrentMenuItem({ 
                                ...currentMenuItem!, 
                                price: parseFloat(e.target.value) 
                            })}
                            className="col-span-3"
                            required
                        />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">Image</Label>
                            <Input
                            id="image"
                            type="file"
                            onChange={handleMenuItemImageChange}
                            className="col-span-3"
                            accept="image/*"
                        />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsMenuItemDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isJoinTableDialogOpen} onOpenChange={setIsJoinTableDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Join Tables</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Selected Tables:</p>
                            <ul className="list-disc list-inside">
                                {selectedTablesForJoin.map(id => {
                                    const table = tables.find(t => t.id === id);
                                    return table ? (
                                        <li key={id}>{table.name} ({table.seats} seats)</li>
                                    ) : null;
                                })}
                            </ul>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsJoinTableDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleJoinTables}>
                                Join Tables
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Table</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tableName" className="text-right">
                                    Table Name
                                </Label>
                                <Input
                                    id="tableName"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g., Table 5"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tableSeats" className="text-right">
                                    Number of Seats
                                </Label>
                                <Input
                                    id="tableSeats"
                                    type="number"
                                    min="1"
                                    value={newTableSeats}
                                    onChange={(e) => setNewTableSeats(parseInt(e.target.value))}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => {
                                    handleAddTable();
                                    setIsAddTableDialogOpen(false);
                                }}
                                disabled={!newTableName || newTableSeats < 1}
                            >
                                Add Table
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditTableDialogOpen} onOpenChange={setIsEditTableDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Table</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editTableName" className="text-right">
                                    Table Name
                                </Label>
                                <Input
                                    id="editTableName"
                                    value={editTableData?.name || ''}
                                    onChange={(e) => setEditTableData(prev => prev ? {...prev, name: e.target.value} : null)}
                                    className="col-span-3"
                                    placeholder="e.g., Table 5"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editTableSeats" className="text-right">
                                    Number of Seats
                                </Label>
                                <Input
                                    id="editTableSeats"
                                    type="number"
                                    min="1"
                                    value={editTableData?.seats || 1}
                                    onChange={(e) => setEditTableData(prev => prev ? {...prev, seats: parseInt(e.target.value)} : null)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditTableDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleEditTable}
                                disabled={!editTableData?.name || (editTableData?.seats || 0) < 1}
                            >
                                Update Table
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
