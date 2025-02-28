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
import { Printer, Plus, Minus, Maximize, Minimize, Edit, Trash, Search, QrCode, Trash2, Link2, Check, UtensilsCrossed, Calculator, ShoppingCart } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DialogTrigger } from "@/Components/ui/dialog";
import { Toaster } from "sonner";

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    image?: string;
    public_image_url?: string;
    created_at?: string;
    updated_at?: string;
}
  
interface OrderItem extends MenuItem {
    quantity: number;
    selected?: boolean;
}
  
interface Table {
    id: number | string;
    numericId?: number;
    name: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved' | 'joined';
    joined_with?: string;
    isJoinedTable?: boolean;
    originalTableIds?: number[];
}
  
interface Reservation {
    id: number;
    name: string;
    date: string;
    time: string;
    guests: number;
    tableId: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
    contact?: string;
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
    status: 'available' | 'occupied' | 'reserved' | 'joined';
}

interface PageProps {
    menuItems: MenuItem[];
    tables: Table[];
    tab?: string;
    joinedTables?: JoinedTable[];
    currency_symbol?: string;
}

interface EditTableData {
    id: number;
    name: string;
    seats: number;
}

interface TableResponse {
    props: {
        table: {
            id: number;
            name: string;
            seats: number;
            status: 'available' | 'occupied' | 'reserved' | 'joined';
        }
    }
}

interface Order {
    id: number;
    table_number: string;
    items: OrderItem[];
    status: 'pending' | 'completed';
    created_at?: string;
    updated_at?: string;
}

const processJoinedTables = (tables: Table[]): [Table[], JoinedTable[]] => {
    const joinedTables: JoinedTable[] = [];
    const processedTables = [...tables];
    const processedIds = new Set<number>();

    // First pass: collect all joined table groups
    const joinedGroups = new Map<string, number[]>();
    
    tables.forEach(table => {
        if (table.status === 'joined' && table.joined_with) {
            const joinedIds = table.joined_with.split(',').map(Number);
            const key = joinedIds.sort().join(',');
            if (!joinedGroups.has(key)) {
                joinedGroups.set(key, joinedIds);
            }
        }
    });

    // Second pass: create joined table entries
    joinedGroups.forEach((tableIds) => {
        // Get all tables in this joined group
        const groupTables = tableIds.map(id => 
            tables.find(t => t.id === id)
        ).filter((t): t is Table => t !== undefined);

        if (groupTables.length > 0) {
            // Mark these tables as processed
            tableIds.forEach(id => processedIds.add(id));

            // Create joined table entry
            const joinedTable: JoinedTable = {
                id: Date.now() + Math.random(),
                tableIds: tableIds,
                name: `Table ${groupTables.map(t => 
                    t.name.replace('Table ', '')
                ).join(' & ')}`,
                seats: groupTables.reduce((sum, t) => sum + t.seats, 0),
                status: 'joined'
            };

            joinedTables.push(joinedTable);
        }
    });

    // Filter out individual tables that are part of joined tables
    const remainingTables = processedTables.filter(table => 
        !processedIds.has(table.id as number)
    );

    return [remainingTables, joinedTables];
};

export default function PosRestaurant({ 
    menuItems: initialMenuItems, 
    tables: initialTables, 
    joinedTables: initialJoinedTables = [], 
    tab = 'pos',
    currency_symbol
}: PageProps) {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
    const [tableNumber, setTableNumber] = useState<string>("");
    const [isCompleteSaleDialogOpen, setIsCompleteSaleDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isSplitBillDialogOpen, setIsSplitBillDialogOpen] = useState(false);
    const [splitAmount, setSplitAmount] = useState<number>(2);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [newReservation, setNewReservation] = useState<Omit<Reservation, 'id' | 'status'>>({
        name: '',
        date: '',
        time: '',
        guests: 1,
        tableId: 0,
        notes: '',
        contact: ''
    });
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [tableStatusFilter, setTableStatusFilter] = useState<'all' | 'available' | 'occupied' | 'reserved' | 'joined'>('all');
    const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
    const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
    const [newMenuItemImage, setNewMenuItemImage] = useState<File | null>(null);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [newTableName, setNewTableName] = useState<string>("");
    const [newTableSeats, setNewTableSeats] = useState<number>(1);
    const [joinedTables, setJoinedTables] = useState<JoinedTable[]>(initialJoinedTables);
    const [selectedTablesForJoin, setSelectedTablesForJoin] = useState<number[]>([]);
    const [isJoinTableDialogOpen, setIsJoinTableDialogOpen] = useState(false);
    const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
    const [editTableData, setEditTableData] = useState<EditTableData | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [splitMethod, setSplitMethod] = useState<'equal' | 'item'>('equal');

    // Get the CSRF token from the page props
    const { props } = usePage();
    const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

    // Initialize tables and joined tables
    useEffect(() => {
        const [processedTables, newJoinedTables] = processJoinedTables(initialTables);
        setTables(processedTables);
        setJoinedTables(newJoinedTables);
    }, [initialTables]);

    const addItemToOrder = async (item: MenuItem) => {
        if (!tableNumber) {
            toast.error('Please select a table first');
            return;
        }
        
        try {
            console.log("csrfToken: ", csrfToken);
            const response = await fetch('/pos-restaurant/orders/add-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    table_number: tableNumber,
                    item_id: item.id,
                    quantity: 1,
                    price: item.price,
                    order_id: currentOrder?.id,
                    total: item.price
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add item to order');
            }

            const data = await response.json();
            
            // Check if the item already exists in the order
            const existingItemIndex = orderItems.findIndex(orderItem => orderItem.id === item.id);
            
            if (existingItemIndex !== -1) {
                // If item exists, update its quantity
                const updatedOrderItems = [...orderItems];
                updatedOrderItems[existingItemIndex] = {
                    ...updatedOrderItems[existingItemIndex],
                    quantity: updatedOrderItems[existingItemIndex].quantity + 1
                };
                setOrderItems(updatedOrderItems);
            } else {
                // If item doesn't exist, add it as a new row
                const newOrderItem: OrderItem = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    quantity: 1
                };
                setOrderItems(prevItems => [...prevItems, newOrderItem]);
            }

            // Update current order
            const updatedOrder: Order = {
                id: data.id,
                table_number: data.table_number,
                status: 'pending',
                items: orderItems
            };
            
            setCurrentOrder(updatedOrder);
            toast.success('Item added to order');

        } catch (error) {
            console.error('Error adding item to order:', error);
            toast.error('Failed to add item to order');
        }
    };

    const removeItemFromOrder = async (id: number) => {
        if (!tableNumber) {
            toast.error('No table selected');
            return;
        }
        console.log("Removing item from order:", id);
        try {
            // Store current order items for rollback if needed
            const previousOrderItems = [...orderItems];
            
            // Optimistically update UI
            setOrderItems(orderItems.filter(item => item.id !== id));

            // Send request to backend
            await router.delete(`/pos-restaurant/current-order/${tableNumber}/item/${id}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Item removed from order');
                    
                    // If this was the last item, update table status to available
                    if (orderItems.length === 1) {
                        setTables(prevTables => 
                            prevTables.map(table => 
                                table.name === tableNumber 
                                    ? { ...table, status: 'available' } 
                                    : table
                            )
                        );
                    }
                },
                onError: () => {
                    // Rollback on error
                    setOrderItems(previousOrderItems);
                    toast.error('Failed to remove item from order');
                }
            });

        } catch (error) {
            console.error('Error removing item from order:', error);
            // Rollback on error
            setOrderItems(orderItems);
            toast.error('Failed to remove item from order');
        }
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
        if (!tableNumber) {
            toast.error('Please select a table first');
            return;
        }
        
        if (orderItems.length === 0) {
            toast.error('Please add items to the order');
            return;
        }

        // Show confirmation toast
        toast.custom((t) => (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md w-full">
                <h3 className="font-semibold text-lg mb-2">Complete Order Confirmation</h3>
                <p className="mb-2">Are you sure you want to complete this order?</p>
                <div className="text-sm space-y-1 mb-4">
                    <p>Table: {tableNumber}</p>
                    <p>Total Items: {orderItems.length}</p>
                    <p>Subtotal: {currency_symbol}{totalAmount}</p>
                    <p>Discount: {currency_symbol}{discountAmount}</p>
                    <p className="font-semibold">Final Total: {currency_symbol}{finalTotal}</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toast.dismiss(t)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                            toast.dismiss(t);
                            setIsCompleteSaleDialogOpen(true);
                        }}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        ), {
            duration: 5000,
        });
    };

    const confirmCompleteSale = () => {
        router.post('/pos-restaurant/orders/complete', {
            table_number: tableNumber,
            items: JSON.stringify(orderItems),
            subtotal: totalAmount,
            discount: discount,
            discount_type: discountType,
            total: finalTotal
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setOrderItems([]);
                setTableNumber("");
                setIsCompleteSaleDialogOpen(false);
                // Update table status
                setTables(tables.map(table => 
                    table.name === tableNumber ? { ...table, status: 'available' } : table
                ));
            }
        });
    };

    const handleSplitBill = () => {
        setIsSplitBillDialogOpen(true);
    };

    const confirmSplitBill = () => {
        let amountPerPerson: number;
        const selectedItemsTotal = orderItems
            .filter(item => splitMethod === 'item' ? item.selected : true)
            .reduce((total, item) => total + (item.price * item.quantity), 0);
        
        amountPerPerson = splitMethod === 'equal' 
            ? finalTotal / splitAmount 
            : selectedItemsTotal / splitAmount;

        // Print the split bill details including order items
        const orderItemsDetails = orderItems.map(item => {
            const isSelected = splitMethod === 'item' ? item.selected : true;
            return `
                <tr class="${isSelected ? 'selected-item' : 'unselected-item'}">
                    <td>${item.name}</td>
                    <td>x${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${(item.price * item.quantity)}</td>
                    ${splitMethod === 'item' ? `<td>${isSelected ? '✓' : '-'}</td>` : ''}
                </tr>
            `;
        }).join('');

        const printContent = `
            <html>
                <head>
                    <title>Split Bill</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            max-width: 800px; 
                            margin: 0 auto; 
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 20px; 
                            padding-bottom: 10px;
                            border-bottom: 2px solid #333;
                        }
                        .split-details {
                            margin: 20px 0;
                            padding: 10px;
                            background: #f5f5f5;
                            border-radius: 5px;
                        }
                        .footer { 
                            margin-top: 20px; 
                            text-align: center;
                            padding-top: 10px;
                            border-top: 1px solid #ddd;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 15px 0;
                        }
                        th, td { 
                            padding: 8px; 
                            text-align: left; 
                            border-bottom: 1px solid #ddd; 
                        }
                        .selected-item {
                            background-color: #f0f7ff;
                        }
                        .unselected-item {
                            color: #666;
                        }
                        .totals {
                            margin-top: 15px;
                            padding: 10px;
                            border-top: 2px solid #333;
                        }
                        .split-amount {
                            font-size: 1.2em;
                            font-weight: bold;
                            color: #2563eb;
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Split Bill</h2>
                        <p>Table Number: ${tableNumber}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>

                    <div class="split-details">
                        <h3>Split Method: ${splitMethod === 'equal' ? 'Equal Split' : 'Split by Item'}</h3>
                        <p>Number of ways to split: ${splitAmount}</p>
                    </div>

                    <h3>Order Items:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                                ${splitMethod === 'item' ? '<th>Selected</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItemsDetails}
                        </tbody>
                    </table>

                    <div class="totals">
                        <p>Original Total: ${currency_symbol}${finalTotal}</p>
                        ${splitMethod === 'item' ? `
                            <p>Selected Items Total: ${currency_symbol}${selectedItemsTotal}</p>
                        ` : ''}
                        <div class="split-amount">
                            Amount per person: ${currency_symbol}${amountPerPerson}
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for dining with us!</p>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }

        setIsSplitBillDialogOpen(false);
    };

    const printKitchenOrder = async () => {
        if (orderItems.length === 0 || !tableNumber) {
            toast.error('Please add items and select a table before printing kitchen order');
            return;
        }

        try {
            const response = await router.post('/pos-restaurant/kitchen-order', {
                table_number: tableNumber,
                items: orderItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    notes: '', // Add notes field if needed
                })),
                orderTime: new Date().toISOString(),
            }, {
                preserveState: true,
                onSuccess: () => {
                    // Create a printable format
                    const printWindow = window.open('', '', 'height=600,width=800');
                    if (!printWindow) {
                        toast.error('Please allow pop-ups to print kitchen orders');
                        return;
                    }

                    const orderDetails = orderItems.map(item => 
                        `<tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}x</td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                        </tr>`
                    ).join('');

                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>Kitchen Order - Table ${tableNumber}</title>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; }
                                    .header { text-align: center; margin-bottom: 20px; }
                                    table { width: 100%; border-collapse: collapse; }
                                    .footer { margin-top: 20px; text-align: center; }
                                </style>
                            </head>
                            <body>
                                <div class="header">
                                    <h2>Kitchen Order</h2>
                                    <p>Table: ${tableNumber}</p>
                                    <p>Time: ${new Date().toLocaleTimeString()}</p>
                                    <p>Date: ${new Date().toLocaleDateString()}</p>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Qty</th>
                                            <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orderDetails}
                                    </tbody>
                                </table>
                                <div class="footer">
                                    <p>*** End of Order ***</p>
                                </div>
                            </body>
                        </html>
                    `);

                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();

                    toast.success('Kitchen order sent successfully');
                },
                onError: () => {
                    toast.error('Failed to send kitchen order');
                }
            });
        } catch (error) {
            console.error('Error sending kitchen order:', error);
            toast.error('Failed to send kitchen order');
        }
    };

    const handleReservation = async () => {
        if (!newReservation.name || !newReservation.date || !newReservation.time || !newReservation.tableId) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const response = await router.post('/pos-restaurant/reservations', {
                ...newReservation,
                status: 'pending'
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Reservation created successfully');
                    // Update table status
                    setTables(tables.map(table => 
                        table.id === newReservation.tableId ? { ...table, status: 'reserved' } : table
                    ));
                    // Reset form
                    setNewReservation({
                        name: '',
                        date: '',
                        time: '',
                        guests: 1,
                        tableId: 0,
                        notes: '',
                        contact: ''
                    });
                    // Refresh reservations
                    fetchReservations();
                },
                onError: () => {
                    toast.error('Failed to create reservation');
                }
            });
        } catch (error) {
            console.error('Error creating reservation:', error);
            toast.error('Failed to create reservation');
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await fetch('/pos-restaurant/reservations');
            const data = await response.json();
            setReservations(data);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            toast.error('Failed to fetch reservations');
        }
    };

    const handleCancelReservation = async (id: number) => {
        try {
            await router.delete(`/pos-restaurant/reservations/${id}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Reservation cancelled successfully');
                    fetchReservations();
                },
                onError: () => {
                    toast.error('Failed to cancel reservation');
                }
            });
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            toast.error('Failed to cancel reservation');
        }
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

    const handleJoinTables = async () => {
        if (selectedTablesForJoin.length < 2) {
            toast.error('Please select at least 2 tables to join');
            return;
        }

        const selectedTableDetails = selectedTablesForJoin.map(id => 
            tables.find(table => table.id === id)
        ).filter((table): table is Table => table !== undefined);

        if (!selectedTableDetails.every(table => table.status === 'available')) {
            toast.error('Can only join available tables');
            return;
        }

        try {
            await router.post('/pos-restaurant/tables/join', {
                tableIds: selectedTablesForJoin
            }, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                preserveState: true,
                preserveScroll: true,
                onSuccess: (response: any) => {
                    if (response.tables) {
                        const [processedTables, newJoinedTables] = processJoinedTables(response.tables);
                        setTables(processedTables);
                        setJoinedTables(newJoinedTables);
                    }
                    setSelectedTablesForJoin([]);
                    setIsJoinTableDialogOpen(false);
                    toast.success('Tables joined successfully');
                },
                onError: () => {
                    toast.error('Failed to join tables');
                }
            });
        } catch (error) {
            console.error('Error joining tables:', error);
            toast.error('Failed to join tables');
        }
    };

    const handleUnjoinTable = async (table: Table) => {
        // Check if table is a joined table and has originalTableIds
        if (!table.isJoinedTable || !table.originalTableIds) {
            toast.error('Invalid table configuration for unjoining');
            return;
        }

        try {
            await router.post('/pos-restaurant/tables/unjoin', {
                tableIds: table.originalTableIds
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (response: any) => {
                    if (response.tables) {
                        setTables(response.tables);
                    }
                    toast.success('Tables unjoined successfully');
                },
                onError: () => {
                    toast.error('Failed to unjoin tables');
                }
            });
        } catch (error) {
            console.error('Error unjoining tables:', error);
            toast.error('Failed to unjoin tables');
        }
    };

    const toggleTableSelection = (tableId: number | string) => {
        const numericId = typeof tableId === 'string' 
            ? Number(tableId.replace('joined_', '')) 
            : tableId;
        
        setSelectedTablesForJoin(prev => 
            prev.includes(numericId)
                ? prev.filter(id => id !== numericId)
                : [...prev, numericId]
        );
    };

    const filteredTables = useMemo(() => {
        let filtered = [...tables];
        
        // Add joined tables if not filtered out
        if (tableStatusFilter === 'all' || tableStatusFilter === 'joined') {
            const joinedTableEntries = joinedTables.map(jt => ({
                id: `joined_${jt.id}`,
                numericId: jt.id,
                name: jt.name,
                seats: jt.seats,
                status: 'joined' as const,
                isJoinedTable: true,
                originalTableIds: jt.tableIds
            }));
            filtered = [...filtered, ...joinedTableEntries];
        }

        // Apply status filter
        if (tableStatusFilter !== 'all') {
            filtered = filtered.filter(table => table.status === tableStatusFilter);
        }

        return filtered;
    }, [tables, tableStatusFilter, joinedTables]);

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
        fetchReservations();
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
            { app: "fnb", tab: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleAddTable = async () => {
        if (newTableName && newTableSeats > 0) {
            try {
                await router.post('/pos-restaurant/tables', {
                    name: newTableName,
                    seats: newTableSeats,
                    status: 'available'
                }, {
                    onSuccess: (response: any) => {
                        // Safely access the table data from the response
                        const newTable: Table = {
                            id: response?.table?.id ?? Date.now(), // Fallback to timestamp if id is missing
                            name: newTableName,
                            seats: newTableSeats,
                            status: 'available'
                        };
                        
                        setTables(prevTables => [...prevTables, newTable]);
                        setNewTableName("");
                        setNewTableSeats(1);
                        setIsAddTableDialogOpen(false);
                        toast.success('Table added successfully');
                    },
                    onError: (errors) => {
                        console.error('Error adding table:', errors);
                        toast.error('Failed to add table');
                    },
                    preserveState: true,
                    preserveScroll: true
                });
            } catch (error) {
                console.error('Error adding table:', error);
                toast.error('Failed to add table');
            }
        } else {
            toast.error('Please enter valid table name and seats');
        }
    };

    const handleRemoveTable = async (id: number | string) => {
        const numericId = typeof id === 'string' ? Number(id.replace('joined_', '')) : id;
        try {
            await router.delete(`/pos-restaurant/table/${numericId}`, {
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
            await router.put(`/pos-restaurant/table/${tableId}`, {
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
            await router.put(`/pos-restaurant/table/${editTableData.id}`, {
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
            id: typeof table.id === 'string' ? parseInt(table.id) : table.id,
            name: table.name,
            seats: table.seats
        });
        setIsEditTableDialogOpen(true);
    };

    const handleTableSelection = async (tableName: string) => {
        try {
            const response = await fetch(`/pos-restaurant/current-order/${tableName}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch order items');
            }

            setTableNumber(tableName);

            if (data.order) {
                setCurrentOrder(data.order);
                setOrderItems(data.order.items.map((item: any) => ({
                    id: item.id,
                    name: item.item,
                    price: parseFloat(item.price),
                    quantity: parseInt(item.quantity),
                    category: item.category || '',
                    total: parseFloat(item.total)
                })));
            } else {
                setCurrentOrder(null);
                setOrderItems([]);
            }

            router.get(
                window.location.pathname,
                { tab: 'pos' },
                { preserveState: true, preserveScroll: true }
            );

        } catch (error) {
            console.error('Error fetching current order:', error);
            toast.error('Failed to fetch current order');
            setOrderItems([]);
            setCurrentOrder(null);
        }
    };

    const toggleItemSelection = (itemId: number) => {
        setOrderItems(orderItems.map(item => 
            item.id === itemId ? { ...item, selected: !item.selected } : item
        ));
    };

    const printCurrentBill = () => {
        if (orderItems.length === 0 || !tableNumber) {
            toast.error('No items in current order');
            return;
        }

        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            toast.error('Please allow pop-ups to print bills');
            return;
        }

        const orderItemsDetails = orderItems.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">x${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.price}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        const printContent = `
            <html>
                <head>
                    <title>Bill - Table ${tableNumber}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            max-width: 800px; 
                            margin: 0 auto; 
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 20px; 
                            padding-bottom: 10px;
                            border-bottom: 2px solid #333;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 15px 0;
                        }
                        th, td { 
                            text-align: left; 
                            padding: 8px; 
                            border-bottom: 1px solid #ddd; 
                        }
                        .totals {
                            margin-top: 15px;
                            padding: 10px;
                            border-top: 2px solid #333;
                        }
                        .footer { 
                            margin-top: 20px; 
                            text-align: center;
                            padding-top: 10px;
                            border-top: 1px solid #ddd;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Bill</h2>
                        <p>Table: ${tableNumber}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItemsDetails}
                        </tbody>
                    </table>

                    <div class="totals">
                        <p><strong>Subtotal:</strong> ${currency_symbol}${totalAmount}</p>
                        <p><strong>Discount:</strong> ${currency_symbol}${discountAmount}</p>
                        <p style="font-size: 1.2em;"><strong>Total Amount:</strong> ${currency_symbol}${finalTotal}</p>
                    </div>

                    <div class="footer">
                        <p>Thank you for dining with us!</p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
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
            <Toaster position="top-right" richColors />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addItemToOrder(item);
                                    }}
                                    className="h-auto flex flex-col items-center p-2 touch-manipulation bg-gray-700 hover:bg-gray-600 text-white"
                                    type="button"
                                >
                                    <img 
                                        src={item.image || '/images/no-image.jpg'} 
                                        alt={item.name} 
                                        width={100} 
                                        height={100} 
                                        className="mb-2 rounded" 
                                    />
                                    <span className="text-center">{item.name}</span>
                                    <span>{currency_symbol}{item.price}</span>
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
                                    <TableCell>{currency_symbol}{item.price}</TableCell>
                                    <TableCell>{currency_symbol}{(item.price * item.quantity)}</TableCell>
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
                                <div className="flex items-center gap-4">
                                    <div className="w-1/3">
                                        <Label htmlFor="discountType">Discount Type</Label>
                                        <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-1/3">
                                        <Label htmlFor="discount">Discount</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                            placeholder={discountType === 'percentage' ? "%" : "$"}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start">
                            <div className="w-full flex justify-between mb-2">
                            <span>Subtotal:</span>
                            <span>{currency_symbol}{totalAmount}</span>
                            </div>
                            <div className="w-full flex justify-between mb-2">
                            <span>Discount:</span>
                            <span>{currency_symbol}{discountAmount}</span>
                            </div>
                            <div className="w-full flex justify-between mb-4">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold">{currency_symbol}{finalTotal}</span>
                            </div>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:justify-end gap-2 mt-4">
                                <Button 
                                    onClick={printCurrentBill} 
                                    disabled={orderItems.length === 0} 
                                    className="w-full lg:w-auto text-sm lg:text-base py-4 lg:py-6 bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Print Bill</span>
                                    <span className="sm:hidden">Bill</span>
                                </Button>
                                <Button 
                                    onClick={printKitchenOrder} 
                                    disabled={orderItems.length === 0} 
                                    className="w-full lg:w-auto text-sm lg:text-base py-4 lg:py-6 bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                                >
                                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Kitchen Order</span>
                                    <span className="sm:hidden">Kitchen</span>
                                </Button>
                                <Button 
                                    onClick={handleSplitBill} 
                                    disabled={orderItems.length === 0} 
                                    className="w-full lg:w-auto text-sm lg:text-base py-4 lg:py-6 bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                                >
                                    <Calculator className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Split Bill</span>
                                    <span className="sm:hidden">Split</span>
                                </Button>
                                <Button 
                                    onClick={handleCompleteSale} 
                                    disabled={orderItems.length === 0 || !tableNumber} 
                                    className="w-full lg:w-auto text-sm lg:text-base py-4 lg:py-6 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Complete Order</span>
                                    <span className="sm:hidden">Complete</span>
                                </Button>
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
                                            selectedTablesForJoin.includes(typeof table.id === 'string' ? parseInt(table.id.replace('joined_', '')) : table.id) ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    >
                                        <CardHeader>
                                            <CardTitle>
                                                {table.status === 'joined' && table.joined_with ? (
                                                    <>
                                                        {table.joined_with.split(',')
                                                            .map(id => tables.find(t => t.id === parseInt(id))?.name)
                                                            .filter(Boolean)
                                                            .join(' & ')}
                                                    </>
                                                ) : (
                                                    table.name
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Seats: {table.seats}</p>
                                            <p>Status: {table.status}</p>
                                            {table.status === 'joined' && table.joined_with && (
                                                <p className="text-sm text-gray-500">
                                                    Combined Tables: {table.joined_with.split(',')
                                                        .map(id => tables.find(t => t.id === parseInt(id))?.name)
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                            )}
                                        </CardContent>
                                        <CardFooter className="flex flex-wrap gap-2">
                                            {table.status === 'available' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleTableSelection(table.name)} 
                                                        className="bg-gray-700 hover:bg-gray-600 text-white flex-1"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    {/* Only show join table selection for available tables */}
                                                    <Button
                                                        onClick={() => toggleTableSelection(table.id)}
                                                        variant={selectedTablesForJoin.includes(typeof table.id === 'string' ? parseInt(table.id.replace('joined_', '')) : table.id) ? "default" : "outline"}
                                                        className="flex-1"
                                                    >
                                                        {selectedTablesForJoin.includes(typeof table.id === 'string' ? parseInt(table.id.replace('joined_', '')) : table.id) ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <Link2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    {/* Generate QR, Edit, and Delete buttons for available tables */}
                                                    <Button 
                                                        onClick={() => handleGenerateQR(table)} 
                                                        className="bg-gray-700 hover:bg-gray-600 text-white flex-1"
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        onClick={() => openEditTableDialog(table)} 
                                                        className="bg-gray-700 hover:bg-gray-600 text-white flex-1"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleRemoveTable(table.id)} 
                                                        className="bg-red-500 hover:bg-red-600 text-white flex-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {(table.status === 'occupied' || table.status === 'reserved') && (
                                                <Button 
                                                    onClick={() => handleTableSelection(table.name)} 
                                                    className="bg-gray-700 hover:bg-gray-600 text-white flex-1"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {/* For joined tables, show unjoin button */}
                                            {table.status === 'joined' && (
                                                <Button 
                                                    onClick={() => handleUnjoinTable(table)}
                                                    className="bg-red-500 hover:bg-red-600 text-white flex-1"
                                                >
                                                    Unjoin Table
                                                </Button>
                                            )}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <Label htmlFor="reservationName">Name *</Label>
                                    <Input
                                        id="reservationName"
                                        value={newReservation.name}
                                        onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationContact">Contact Number</Label>
                                    <Input
                                        id="reservationContact"
                                        value={newReservation.contact}
                                        onChange={(e) => setNewReservation({ ...newReservation, contact: e.target.value })}
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationDate">Date *</Label>
                                    <Input
                                        id="reservationDate"
                                        type="date"
                                        value={newReservation.date}
                                        onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationTime">Time *</Label>
                                    <Input
                                        id="reservationTime"
                                        type="time"
                                        value={newReservation.time}
                                        onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationGuests">Number of Guests *</Label>
                                    <Input
                                        id="reservationGuests"
                                        type="number"
                                        min="1"
                                        value={newReservation.guests}
                                        onChange={(e) => setNewReservation({ ...newReservation, guests: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationTable">Table *</Label>
                                    <Select 
                                        value={newReservation.tableId.toString()} 
                                        onValueChange={(value) => setNewReservation({ ...newReservation, tableId: parseInt(value) })}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select table" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tables
                                                .filter(table => table.status === 'available')
                                                .map((table) => (
                                                    <SelectItem key={table.id} value={table.id.toString()}>
                                                        {table.name} ({table.seats} seats)
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="reservationNotes">Notes</Label>
                                    <Input
                                        id="reservationNotes"
                                        value={newReservation.notes}
                                        onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                                        placeholder="Special requests or additional information"
                                    />
                                </div>
                            </div>
                            <Button 
                                onClick={handleReservation} 
                                className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                                disabled={!newReservation.name || !newReservation.date || !newReservation.time || !newReservation.tableId}
                            >
                                Make Reservation
                            </Button>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Current Reservations</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Guests</TableHead>
                                            <TableHead>Table</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reservations.map((reservation) => (
                                            <TableRow key={reservation.id}>
                                                <TableCell>{reservation.name}</TableCell>
                                                <TableCell>{reservation.contact || '-'}</TableCell>
                                                <TableCell>{new Date(reservation.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{reservation.time}</TableCell>
                                                <TableCell>{reservation.guests}</TableCell>
                                                <TableCell>
                                                    {tables.find(table => table.id === reservation.tableId)?.name}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        reservation.status === 'confirmed' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : reservation.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {reservation.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleCancelReservation(reservation.id)}
                                                        disabled={reservation.status === 'cancelled'}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
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
                                        src={item.image || '/images/no-image.jpg'} 
                                        alt={item.name} 
                                        width={50} 
                                        height={50} 
                                        className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{currency_symbol}{item.price}</TableCell>
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
                        <p className="mb-2">Table Number: {tableNumber}</p>
                        <p className="mb-2">Order Items: 
                            <table className="w-full text-sm">
                            {orderItems.map(item => {
                                return <tr key={item.id}>
                                    <td className="pl-2">{item.name}</td>
                                    <td className="text-right">{currency_symbol}{item.price}</td>
                                    <td className="text-right">{currency_symbol}{(item.price * item.quantity)}</td>
                                </tr>
                            })}
                            </table>
                        </p>
                        <p className="mb-2">Subtotal: {currency_symbol}{totalAmount}</p>
                        <p className="mb-2">Discount: {currency_symbol}{discountAmount}</p>
                        <p>Total Amount: {currency_symbol}{finalTotal}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCompleteSaleDialogOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white">Cancel</Button>
                        <Button onClick={confirmCompleteSale} className="bg-blue-500 hover:bg-blue-600 text-white">Confirm Order</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isSplitBillDialogOpen} onOpenChange={setIsSplitBillDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Split Bill</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Label>Split Method</Label>
                            <div className="flex items-center mb-4">
                                <label className="mr-4 flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value="equal"
                                        checked={splitMethod === 'equal'}
                                        onChange={() => setSplitMethod('equal')}
                                        className="form-radio"
                                    />
                                    <span>Equal Split</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value="item"
                                        checked={splitMethod === 'item'}
                                        onChange={() => setSplitMethod('item')}
                                        className="form-radio"
                                    />
                                    <span>Split by Item</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <Label htmlFor="splitAmount">Number of ways to split</Label>
                                <div className="flex items-center">
                                    <Button 
                                        onClick={() => setSplitAmount(Math.max(splitAmount - 1, 2))} 
                                        className="mr-2"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        id="splitAmount"
                                        type="number"
                                        value={splitAmount}
                                        onChange={(e) => setSplitAmount(Math.max(2, parseInt(e.target.value)))}
                                        min={2}
                                        className="w-20 text-center"
                                    />
                                    <Button 
                                        onClick={() => setSplitAmount(splitAmount + 1)} 
                                        className="ml-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Order Items:</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {splitMethod === 'item' && (
                                                <TableHead className="w-[50px]">Select</TableHead>
                                            )}
                                            <TableHead>Item</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orderItems.map(item => (
                                            <TableRow key={item.id}>
                                                {splitMethod === 'item' && (
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={item.selected}
                                                            onCheckedChange={() => toggleItemSelection(item.id)}
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>x{item.quantity}</TableCell>
                                                <TableCell>{currency_symbol}{item.price}</TableCell>
                                                <TableCell>{currency_symbol}{(item.price * item.quantity)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-4 space-y-2 border-t pt-4">
                                <div className="flex justify-between">
                                    <span>Total Amount:</span>
                                    <span>{currency_symbol}{finalTotal}</span>
                                </div>
                                {splitMethod === 'item' && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>Selected Items Total:</span>
                                        <span>{currency_symbol}{orderItems
                                            .filter(item => item.selected)
                                            .reduce((total, item) => total + (item.price * item.quantity), 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold">
                                    <span>Amount per person:</span>
                                    <span>
                                        {currency_symbol}{(splitMethod === 'equal' 
                                            ? finalTotal / splitAmount 
                                            : orderItems
                                                .filter(item => item.selected)
                                                .reduce((total, item) => total + (item.price * item.quantity), 0) / splitAmount
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsSplitBillDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={confirmSplitBill}
                                disabled={splitMethod === 'item' && !orderItems.some(item => item.selected)}
                            >
                                Split Bill
                            </Button>
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
                            value={`https://sakto.app/fnb/menu?table=${selectedTable.id}${customerName ? `&customer=${encodeURIComponent(customerName)}` : ''}`}
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
