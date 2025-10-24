import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps as InertiaPageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calculator,
    Calendar,
    Check,
    ChefHat,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    UtensilsCrossed,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePosApi } from './hooks/usePosApi';
import { usePosState } from './hooks/usePosState';
import {
    BlockedDate,
    JoinedTable,
    MenuItem,
    MenuItemFormData,
    OpenedDate,
    Reservation,
    Sale,
    Table,
} from './types';

// Lazy load tab components for better performance
const PosTab = lazy(() =>
    import('./components/PosTab').then((module) => ({
        default: module.PosTab,
    })),
);
const TablesTab = lazy(() =>
    import('./components/TablesTab').then((module) => ({
        default: module.TablesTab,
    })),
);
const ReservationsTab = lazy(() =>
    import('./components/ReservationsTab').then((module) => ({
        default: module.ReservationsTab,
    })),
);
const BlockedDatesTab = lazy(() =>
    import('./components/BlockedDatesTab').then((module) => ({
        default: module.BlockedDatesTab,
    })),
);
const OpenedDatesTab = lazy(() =>
    import('./components/OpenedDatesTab').then((module) => ({
        default: module.OpenedDatesTab,
    })),
);
const MenuTab = lazy(() =>
    import('./components/MenuTab').then((module) => ({
        default: module.MenuTab,
    })),
);

const KitchenTab = lazy(() =>
    import('./components/KitchenTab').then((module) => ({
        default: module.KitchenTab,
    })),
);

const SalesTab = lazy(() =>
    import('./components/SalesTab').then((module) => ({
        default: module.SalesTab,
    })),
);

const FoodDeliveryTab = lazy(() =>
    import('./components/FoodDeliveryTab').then((module) => ({
        default: module.FoodDeliveryTab,
    })),
);

// Lazy load dialog components
const AddTableDialog = lazy(() =>
    import('./components/dialogs/AddTableDialog').then((module) => ({
        default: module.AddTableDialog,
    })),
);
const EditTableDialog = lazy(() =>
    import('./components/dialogs/EditTableDialog').then((module) => ({
        default: module.EditTableDialog,
    })),
);
const QRCodeDialog = lazy(() =>
    import('./components/dialogs/QRCodeDialog').then((module) => ({
        default: module.QRCodeDialog,
    })),
);
const SplitBillDialog = lazy(() =>
    import('./components/dialogs/SplitBillDialog').then((module) => ({
        default: module.SplitBillDialog,
    })),
);
const AddMenuItemDialog = lazy(() =>
    import('./components/dialogs/AddMenuItemDialog').then((module) => ({
        default: module.AddMenuItemDialog,
    })),
);
const EditMenuItemDialog = lazy(() =>
    import('./components/dialogs/EditMenuItemDialog').then((module) => ({
        default: module.EditMenuItemDialog,
    })),
);
const DeleteMenuItemDialog = lazy(() =>
    import('./components/dialogs/DeleteMenuItemDialog').then((module) => ({
        default: module.DeleteMenuItemDialog,
    })),
);

// Loading component for tab switching
const TabLoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-12">
        <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <div className="mt-4 text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Loading...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we prepare your content
            </p>
        </div>
    </div>
);

interface TableSchedule {
    id: number;
    tableId: number;
    scheduleDate: string;
    timeslots: string[];
    status: 'available' | 'unavailable' | 'joined';
    joinedWith?: string | null;
    notes?: string | null;
}

interface PageProps extends InertiaPageProps {
    menuItems: MenuItem[];
    tables: Table[];
    tab?: string;
    joinedTables?: JoinedTable[];
    reservations?: Reservation[];
    blockedDates?: BlockedDate[];
    openedDates?: OpenedDate[];
    tableSchedules?: TableSchedule[];
    sales?: Sale[];
    onlineStores?: Array<{
        id: number;
        name: string;
        description: string;
        domain: string;
        is_active: boolean;
        menu_items: number[];
        settings: any;
        verification_required: string;
        payment_negotiation_enabled: boolean;
        created_at: string;
        updated_at: string;
    }>;
    onlineOrders?: Array<{
        id: number;
        order_number: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        delivery_address: string;
        items: Array<{
            id: number;
            name: string;
            quantity: number;
            price: number;
        }>;
        subtotal: number;
        delivery_fee: number;
        tax_amount: number;
        total_amount: number;
        status: string;
        verification_status: string;
        verification_notes?: string;
        payment_negotiation_enabled: boolean;
        negotiated_amount?: number;
        payment_notes?: string;
        payment_status: string;
        payment_method?: string;
        verified_at?: string;
        created_at: string;
        online_store: {
            id: number;
            name: string;
            domain: string;
        };
    }>;
    currency_symbol?: string;
}

export default function PosRestaurantIndex({
    menuItems,
    tables,
    tab = 'reservations',
    joinedTables = [],
    reservations = [],
    blockedDates = [],
    openedDates = [],
    tableSchedules = [],
    sales = [],
    onlineStores = [],
    onlineOrders = [],
    currency_symbol = '$',
    auth,
}: PageProps) {
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState(tab);
    const [showMobileTabs, setShowMobileTabs] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
        'percentage',
    );
    const [serviceCharge, setServiceCharge] = useState(0);
    const [serviceChargeType, setServiceChargeType] = useState<
        'percentage' | 'fixed'
    >('percentage');
    const [customerName, setCustomerName] = useState<string>('');
    const [customerNotes, setCustomerNotes] = useState<string>('');
    const [showCheckout, setShowCheckout] = useState(false);

    // Dialog states
    const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
    const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const [isSplitBillDialogOpen, setIsSplitBillDialogOpen] = useState(false);
    const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] =
        useState(false);
    const [isEditMenuItemDialogOpen, setIsEditMenuItemDialogOpen] =
        useState(false);
    const [isDeleteMenuItemDialogOpen, setIsDeleteMenuItemDialogOpen] =
        useState(false);
    const [editMenuItemData, setEditMenuItemData] = useState<MenuItem | null>(
        null,
    );
    const [deleteMenuItemData, setDeleteMenuItemData] = useState<{
        id: number;
        name: string;
        isBulk: boolean;
        itemCount?: number;
        selectedIds?: number[];
    } | null>(null);
    const [editTableData, setEditTableData] = useState<{
        id: number;
        name: string;
        seats: number;
        location?: string;
    } | null>(null);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Pre-filled reservation data for cross-tab navigation
    const [prefilledReservation, setPrefilledReservation] = useState<{
        date: string;
        time: string;
        tableIds?: number[];
    } | null>(null);

    // Use custom hooks for state management and API calls
    const posState = usePosState(
        menuItems,
        tables,
        joinedTables,
        reservations,
        blockedDates,
    );
    const api = usePosApi();

    // Sync currentTab with the tab prop
    useEffect(() => {
        setCurrentTab(tab);
    }, [tab]);

    // Permissions (these would come from your auth system)
    const canEdit = true;
    const canDelete = true;

    const handleTabChange = useCallback((value: string) => {
        setIsTabLoading(true);
        setCurrentTab(value);
        setShowMobileTabs(false); // Close mobile tabs after selection

        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const appParam = urlParams.get('app') || 'fnb';

        // Update URL with both app and tab parameters
        router.get(
            `/pos-restaurant?app=${appParam}&tab=${value}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: [], // Don't reload any props, just update URL
                onFinish: () => {
                    setTimeout(() => {
                        setIsTabLoading(false);
                    }, 300);
                },
            },
        );
    }, []);

    // Handle creating reservation from TablesTab
    const handleCreateReservationFromTable = useCallback(
        (date: string, time: string, tableIds: number[]) => {
            // Set pre-filled data
            setPrefilledReservation({ date, time, tableIds });

            // Switch to reservations tab
            handleTabChange('reservations');
        },
        [handleTabChange],
    );

    // POS Tab handlers
    const handleCompleteOrder = useCallback(() => {
        // Order completion is now handled in the payment dialog
        // This function is called after payment is confirmed
    }, []);

    const handleShowQRCode = useCallback(() => {
        // Find the table for the current order
        const table = tables.find((t) => t.name === posState.tableNumber);
        if (table) {
            setSelectedTable(table);
            setIsQRDialogOpen(true);
        }
    }, [tables, posState.tableNumber]);

    const handleSplitBill = useCallback(() => {
        setIsSplitBillDialogOpen(true);
    }, []);

    const handlePrintBill = useCallback(() => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            toast.error('Please allow pop-ups to print bills');
            return;
        }

        const orderItemsDetails = posState.orderItems
            .map(
                (item) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${currency_symbol}${item.price}</td>
                <td>${currency_symbol}${item.price * item.quantity}</td>
            </tr>
        `,
            )
            .join('');

        const printContent = `
            <html>
                <head>
                    <title>Restaurant Bill</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        .bill-details { margin-bottom: 20px; }
                        .bill-details h3 { margin-bottom: 10px; color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .total-section { border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Restaurant Bill</h2>
                        <p>Table Number: ${posState.tableNumber}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>
                    <div class="bill-details">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsDetails}
                            </tbody>
                        </table>
                    </div>
                    <div class="total-section">
                        <p><strong>Subtotal: ${currency_symbol}${posState.totalAmount.toFixed(2)}</strong></p>
                        <p><strong>Discount: -${currency_symbol}${(discountType === 'percentage' ? (posState.totalAmount * discount) / 100 : discount).toFixed(2)}</strong></p>
                        <p><strong>Service Charge: +${currency_symbol}${(serviceChargeType === 'percentage' ? (posState.totalAmount * serviceCharge) / 100 : serviceCharge).toFixed(2)}</strong></p>
                        <p style="font-size: 1.2em; margin-top: 10px; border-top: 2px solid #333; padding-top: 10px;"><strong>Total Amount: ${currency_symbol}${(posState.totalAmount - (discountType === 'percentage' ? (posState.totalAmount * discount) / 100 : discount) + (serviceChargeType === 'percentage' ? (posState.totalAmount * serviceCharge) / 100 : serviceCharge)).toFixed(2)}</strong></p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, [
        posState.orderItems,
        posState.tableNumber,
        posState.totalAmount,
        currency_symbol,
        discount,
        discountType,
        serviceCharge,
        serviceChargeType,
    ]);

    const handlePrintKitchenOrder = useCallback(async () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            toast.error('Please allow pop-ups to print kitchen orders');
            return;
        }

        const orderItemsDetails = posState.orderItems
            .map(
                (item) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
            </tr>
        `,
            )
            .join('');

        const customerInfoSection = customerName
            ? `
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Customer Name:</strong> ${customerName}</p>
                ${customerNotes ? `<p><strong>Special Requests:</strong> ${customerNotes}</p>` : ''}
            </div>
        `
            : '';

        const printContent = `
            <html>
                <head>
                    <title>Kitchen Order</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        .customer-info { background-color: #fff3cd; border: 2px solid #ff9800; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
                        .customer-info h3 { margin-top: 0; margin-bottom: 10px; color: #ff6f00; }
                        .customer-info p { margin: 5px 0; }
                        .order-details { margin-bottom: 20px; }
                        .order-details h3 { margin-bottom: 10px; color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Kitchen Order</h2>
                        <p>Table Number: ${posState.tableNumber}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>
                    ${customerInfoSection}
                    <div class="order-details">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsDetails}
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, [
        posState.orderItems,
        posState.tableNumber,
        customerName,
        customerNotes,
    ]);

    // Table Order handlers (New System)
    const handleLoadTableOrder = useCallback(
        async (tableName: string) => {
            try {
                const response = await api.getTableOrder(tableName);
                if (
                    response &&
                    response.items &&
                    Array.isArray(response.items) &&
                    response.items.length > 0
                ) {
                    // Update the order items state with loaded data
                    posState.setOrderItems(response.items);
                    // Update discount settings if available
                    if (response.discount !== undefined) {
                        setDiscount(Number(response.discount));
                    }
                    if (response.discount_type) {
                        setDiscountType(
                            response.discount_type as 'percentage' | 'fixed',
                        );
                    }
                    // Update service charge settings if available
                    if (response.service_charge !== undefined) {
                        setServiceCharge(Number(response.service_charge));
                    }
                    if (response.service_charge_type) {
                        setServiceChargeType(
                            response.service_charge_type as
                                | 'percentage'
                                | 'fixed',
                        );
                    }
                    // Load customer information if available
                    if (response.customer_name) {
                        setCustomerName(response.customer_name);
                    }
                    if (response.customer_notes) {
                        setCustomerNotes(response.customer_notes);
                    }
                    console.log('Loaded order for table:', tableName, response);
                } else {
                    // Clear order items if no saved order
                    posState.setOrderItems([]);
                    setDiscount(0);
                    setServiceCharge(0);
                    setCustomerName('');
                    setCustomerNotes('');
                }
            } catch (error) {
                console.error('Failed to load table order:', error);
                // Clear order items on error
                posState.setOrderItems([]);
                setDiscount(0);
                setServiceCharge(0);
                setCustomerName('');
                setCustomerNotes('');
            }
        },
        [api, posState, setDiscount, setDiscountType],
    );

    const handleSaveTableOrder = useCallback(
        async (tableName: string, orderData: any) => {
            try {
                await api.saveTableOrder(orderData);
            } catch (error) {
                console.error('Failed to save table order:', error);
            }
        },
        [api],
    );

    const handleCompleteTableOrder = useCallback(
        async (
            tableName: string,
            paymentData?: {
                payment_amount: number;
                payment_method: 'cash' | 'card';
                change: number;
            },
        ) => {
            try {
                await api.completeTableOrder(tableName, paymentData);
                // Clear the order items after completion
                posState.clearOrder();
            } catch (error) {
                console.error('Failed to complete table order:', error);
            }
        },
        [api, posState],
    );

    // Table handlers
    const handleAddTable = useCallback(
        async (name: string, seats: number, location: string) => {
            const result = await api.createTable({
                name,
                seats,
                location,
                status: 'available',
            });
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleEditTable = useCallback((table: Table) => {
        setEditTableData({
            id:
                typeof table.id === 'number'
                    ? table.id
                    : parseInt(table.id.toString()),
            name: table.name,
            seats: table.seats,
            location: table.location,
        });
        setIsEditTableDialogOpen(true);
    }, []);

    const handleConfirmEditTable = useCallback(
        async (id: number, name: string, seats: number, location: string) => {
            const result = await api.updateTable(id, { name, seats, location });
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleUpdateTableStatus = useCallback(
        async (table: Table) => {
            const result = await api.updateTable(
                typeof table.id === 'number'
                    ? table.id
                    : parseInt(table.id.toString()),
                {
                    name: table.name,
                    seats: table.seats,
                    status: table.status,
                },
            );
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleDeleteTable = useCallback(
        async (tableId: number) => {
            if (confirm('Are you sure you want to delete this table?')) {
                const result = await api.deleteTable(tableId);
                if (result) {
                    api.refreshData();
                }
            }
        },
        [api],
    );

    const handleJoinTables = useCallback(
        async (tableIds: number[]) => {
            const result = await api.joinTables(tableIds);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleUnjoinTables = useCallback(
        async (tableIds: number[]) => {
            const result = await api.unjoinTables(tableIds);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleSetTableSchedule = useCallback(
        async (data: {
            tableIds: number[];
            date: string;
            time: string;
            status: 'available' | 'unavailable' | 'joined';
            joinedWith?: string;
        }) => {
            const result = await api.setTableSchedule(data);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    // Menu handlers
    const handleAddMenuItem = useCallback(() => {
        setIsAddMenuItemDialogOpen(true);
    }, []);

    const handleConfirmAddMenuItem = useCallback(
        async (menuItemData: MenuItemFormData) => {
            const result = await api.createMenuItem(menuItemData);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleEditMenuItem = useCallback((item: MenuItem) => {
        setEditMenuItemData(item);
        setIsEditMenuItemDialogOpen(true);
    }, []);

    const handleConfirmEditMenuItem = useCallback(
        async (id: number, menuItemData: MenuItemFormData) => {
            const result = await api.updateMenuItem(id, menuItemData);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleDeleteMenuItem = useCallback(
        (id: number) => {
            // Find the menu item to get its name
            const menuItem = posState.menuItems.find((item) => item.id === id);
            if (menuItem) {
                setDeleteMenuItemData({
                    id: id,
                    name: menuItem.name,
                    isBulk: false,
                });
                setIsDeleteMenuItemDialogOpen(true);
            }
        },
        [posState.menuItems],
    );

    const handleConfirmDeleteMenuItem = useCallback(async () => {
        if (deleteMenuItemData) {
            if (deleteMenuItemData.isBulk && deleteMenuItemData.selectedIds) {
                const result = await api.bulkDeleteMenuItems(
                    deleteMenuItemData.selectedIds,
                );
                if (result) {
                    api.refreshData();
                }
            } else if (!deleteMenuItemData.isBulk) {
                const result = await api.deleteMenuItem(deleteMenuItemData.id);
                if (result) {
                    api.refreshData();
                }
            }
        }
    }, [deleteMenuItemData, api]);

    const handleBulkDeleteMenuItems = useCallback((ids: number[]) => {
        setDeleteMenuItemData({
            id: 0, // Not used for bulk delete
            name: '', // Not used for bulk delete
            isBulk: true,
            itemCount: ids.length,
            selectedIds: ids,
        });
        setIsDeleteMenuItemDialogOpen(true);
    }, []);

    const handleToggleAvailability = useCallback(
        async (
            id: number,
            field: 'is_available_personal' | 'is_available_online',
            value: boolean,
        ) => {
            const result = await api.toggleMenuItemAvailability(
                id,
                field,
                value,
            );
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    // Reservation handlers
    const handleAddReservation = useCallback(
        async (reservation: Omit<Reservation, 'id' | 'status'>) => {
            const result = await api.createReservation(reservation);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleUpdateReservation = useCallback(
        async (id: number, reservation: Partial<Reservation>) => {
            const result = await api.updateReservation(id, reservation);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleDeleteReservation = useCallback(
        async (id: number) => {
            if (confirm('Are you sure you want to delete this reservation?')) {
                const result = await api.deleteReservation(id);
                if (result) {
                    api.refreshData();
                }
            }
        },
        [api],
    );

    const handleConfirmReservation = useCallback(
        async (id: number) => {
            await handleUpdateReservation(id, { status: 'confirmed' });
        },
        [handleUpdateReservation],
    );

    const handleCancelReservation = useCallback(
        async (id: number) => {
            await handleUpdateReservation(id, { status: 'cancelled' });
        },
        [handleUpdateReservation],
    );

    // Blocked Dates handlers
    const handleAddBlockedDate = useCallback(
        async (
            blockedDate: Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>,
        ) => {
            const result = await api.createBlockedDate(blockedDate);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleUpdateBlockedDate = useCallback(
        async (id: number, blockedDate: Partial<BlockedDate>) => {
            const result = await api.updateBlockedDate(id, blockedDate);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleDeleteBlockedDate = useCallback(
        async (id: number) => {
            const result = await api.deleteBlockedDate(id);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    // Opened Dates handlers
    const handleAddOpenedDate = useCallback(
        async (
            openedDate: Omit<OpenedDate, 'id' | 'created_at' | 'updated_at'>,
        ) => {
            const result = await api.createOpenedDate(openedDate);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleUpdateOpenedDate = useCallback(
        async (id: number, openedDate: Partial<OpenedDate>) => {
            const result = await api.updateOpenedDate(id, openedDate);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    const handleDeleteOpenedDate = useCallback(
        async (id: number) => {
            const result = await api.deleteOpenedDate(id);
            if (result) {
                api.refreshData();
            }
        },
        [api],
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="hidden items-center space-x-3 xl:flex">
                    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2">
                        <UtensilsCrossed className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                            Food & Beverage
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Food & Beverage Management System
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Food and Beverage Management System" />

            <div className="-mt-6 min-h-screen">
                <div className="w-full">
                    <div className="overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Tabs
                            value={currentTab}
                            onValueChange={handleTabChange}
                            className="w-full"
                        >
                            {/* Mobile Tab Toggle Button */}
                            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 lg:hidden">
                                <button
                                    onClick={() =>
                                        setShowMobileTabs(!showMobileTabs)
                                    }
                                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl ${
                                        currentTab === 'pos'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                            : currentTab === 'tables'
                                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                              : currentTab === 'reservations'
                                                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                                                : currentTab === 'blocked-dates'
                                                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                                                  : currentTab ===
                                                      'opened-dates'
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                                    : currentTab === 'menu'
                                                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                                                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                    }`}
                                >
                                    <span className="flex items-center">
                                        {currentTab === 'pos' && (
                                            <>
                                                <UtensilsCrossed className="mr-2 h-4 w-4" />
                                                Point of Sale
                                            </>
                                        )}
                                        {currentTab === 'tables' && (
                                            <>
                                                <Calculator className="mr-2 h-4 w-4" />
                                                Tables
                                            </>
                                        )}
                                        {currentTab === 'reservations' && (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Reservations
                                            </>
                                        )}
                                        {currentTab === 'blocked-dates' && (
                                            <>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Blocked Dates
                                            </>
                                        )}
                                        {currentTab === 'opened-dates' && (
                                            <>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Opened Dates
                                            </>
                                        )}
                                        {currentTab === 'menu' && (
                                            <>
                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                                Menu
                                            </>
                                        )}
                                    </span>
                                    <svg
                                        className={`h-5 w-5 transition-transform duration-200 ${showMobileTabs ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Main Layout: Content on Left, Tabs on Right */}
                            <div className="flex flex-col lg:flex-row">
                                {/* Tabs Sidebar - Right on desktop, Hidden by default on mobile */}
                                <div
                                    className={`order-1 mb-6 border-b border-gray-200 px-4 pb-12 pt-4 dark:border-gray-600 lg:order-2 lg:mb-0 lg:w-64 lg:border-b-0 lg:border-l lg:p-4 ${showMobileTabs ? 'block' : 'hidden lg:block'} ${showCheckout && currentTab === 'pos' ? 'lg:hidden' : ''}`}
                                >
                                    <TabsList className="flex h-auto w-full flex-col gap-2 bg-transparent p-0">
                                        <TabsTrigger
                                            value="pos"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <UtensilsCrossed className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Point of Sale
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="tables"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <Calculator className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Tables
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="reservations"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <Check className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Reservations
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="blocked-dates"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <Calendar className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Blocked Dates
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="opened-dates"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <Calendar className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Opened Dates
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="menu"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Menu
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="kitchen"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <ChefHat className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Kitchen
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="sales"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <TrendingUp className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Sales
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="food-delivery"
                                            className="group relative w-full justify-start rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700 dark:data-[state=inactive]:hover:text-gray-200"
                                        >
                                            <ShoppingBag className="mr-2 h-4 w-4 group-data-[state=active]:text-white" />
                                            Food Delivery
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Content Area - Left on desktop */}
                                <div
                                    className={`order-2 flex-1 lg:order-1 ${showCheckout && currentTab === 'pos' ? '' : 'lg:mr-6'}`}
                                >
                                    {isTabLoading && <TabLoadingSpinner />}

                                    {!isTabLoading && (
                                        <ErrorBoundary>
                                            <Suspense
                                                fallback={<TabLoadingSpinner />}
                                            >
                                                {currentTab === 'pos' && (
                                                    <TabsContent
                                                        value="pos"
                                                        className="m-0 p-0"
                                                    >
                                                        <PosTab
                                                            menuItems={
                                                                posState.menuItems
                                                            }
                                                            orderItems={
                                                                posState.orderItems
                                                            }
                                                            tableNumber={
                                                                posState.tableNumber
                                                            }
                                                            selectedCategory={
                                                                posState.selectedCategory
                                                            }
                                                            discount={discount}
                                                            discountType={
                                                                discountType
                                                            }
                                                            serviceCharge={
                                                                serviceCharge
                                                            }
                                                            serviceChargeType={
                                                                serviceChargeType
                                                            }
                                                            currency_symbol={
                                                                currency_symbol
                                                            }
                                                            tables={tables}
                                                            tableSchedules={
                                                                tableSchedules
                                                            }
                                                            reservations={
                                                                posState.reservations
                                                            }
                                                            onAddItemToOrder={
                                                                posState.addItemToOrder
                                                            }
                                                            onUpdateItemQuantity={
                                                                posState.updateItemQuantity
                                                            }
                                                            onRemoveItemFromOrder={
                                                                posState.removeItemFromOrder
                                                            }
                                                            onSetTableNumber={
                                                                posState.setTableNumber
                                                            }
                                                            onSetSelectedCategory={
                                                                posState.setSelectedCategory
                                                            }
                                                            onSetDiscount={
                                                                setDiscount
                                                            }
                                                            onSetDiscountType={
                                                                setDiscountType
                                                            }
                                                            onSetServiceCharge={
                                                                setServiceCharge
                                                            }
                                                            onSetServiceChargeType={
                                                                setServiceChargeType
                                                            }
                                                            customerName={
                                                                customerName
                                                            }
                                                            customerNotes={
                                                                customerNotes
                                                            }
                                                            onSetCustomerName={
                                                                setCustomerName
                                                            }
                                                            onSetCustomerNotes={
                                                                setCustomerNotes
                                                            }
                                                            showCheckout={
                                                                showCheckout
                                                            }
                                                            onSetShowCheckout={
                                                                setShowCheckout
                                                            }
                                                            onPrintBill={
                                                                handlePrintBill
                                                            }
                                                            onShowQRCode={
                                                                handleShowQRCode
                                                            }
                                                            onCompleteOrder={
                                                                handleCompleteOrder
                                                            }
                                                            onSplitBill={
                                                                handleSplitBill
                                                            }
                                                            onLoadTableOrder={
                                                                handleLoadTableOrder
                                                            }
                                                            onSaveTableOrder={
                                                                handleSaveTableOrder
                                                            }
                                                            onCompleteTableOrder={
                                                                handleCompleteTableOrder
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab === 'tables' && (
                                                    <TabsContent
                                                        value="tables"
                                                        className="m-0 p-0"
                                                    >
                                                        <TablesTab
                                                            tables={
                                                                posState.filteredTables
                                                            }
                                                            reservations={
                                                                posState.reservations
                                                            }
                                                            openedDates={
                                                                openedDates
                                                            }
                                                            blockedDates={
                                                                posState.blockedDates
                                                            }
                                                            tableSchedules={
                                                                tableSchedules
                                                            }
                                                            currency_symbol={
                                                                currency_symbol
                                                            }
                                                            canEdit={canEdit}
                                                            canDelete={
                                                                canDelete
                                                            }
                                                            onAddTable={() =>
                                                                setIsAddTableDialogOpen(
                                                                    true,
                                                                )
                                                            }
                                                            onEditTable={
                                                                handleEditTable
                                                            }
                                                            onUpdateTableStatus={
                                                                handleUpdateTableStatus
                                                            }
                                                            onDeleteTable={
                                                                handleDeleteTable
                                                            }
                                                            onJoinTables={
                                                                handleJoinTables
                                                            }
                                                            onUnjoinTables={
                                                                handleUnjoinTables
                                                            }
                                                            onSetTableStatusFilter={
                                                                posState.setTableStatusFilter
                                                            }
                                                            tableStatusFilter={
                                                                posState.tableStatusFilter
                                                            }
                                                            onSetTableSchedule={
                                                                handleSetTableSchedule
                                                            }
                                                            onCreateReservation={
                                                                handleCreateReservationFromTable
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab ===
                                                    'reservations' && (
                                                    <TabsContent
                                                        value="reservations"
                                                        className="m-0 p-0"
                                                    >
                                                        <ReservationsTab
                                                            reservations={
                                                                posState.reservations
                                                            }
                                                            tables={
                                                                posState.tables
                                                            }
                                                            blockedDates={
                                                                posState.blockedDates
                                                            }
                                                            openedDates={
                                                                openedDates
                                                            }
                                                            tableSchedules={
                                                                tableSchedules
                                                            }
                                                            currency_symbol={
                                                                currency_symbol
                                                            }
                                                            auth={auth}
                                                            onAddReservation={
                                                                handleAddReservation
                                                            }
                                                            onUpdateReservation={
                                                                handleUpdateReservation
                                                            }
                                                            onDeleteReservation={
                                                                handleDeleteReservation
                                                            }
                                                            onConfirmReservation={
                                                                handleConfirmReservation
                                                            }
                                                            onCancelReservation={
                                                                handleCancelReservation
                                                            }
                                                            prefilledData={
                                                                prefilledReservation
                                                            }
                                                            onClearPrefilledData={() =>
                                                                setPrefilledReservation(
                                                                    null,
                                                                )
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab ===
                                                    'blocked-dates' && (
                                                    <TabsContent
                                                        value="blocked-dates"
                                                        className="m-0 p-0"
                                                    >
                                                        <BlockedDatesTab
                                                            blockedDates={
                                                                posState.blockedDates
                                                            }
                                                            openedDates={
                                                                openedDates
                                                            }
                                                            onAddBlockedDate={
                                                                handleAddBlockedDate
                                                            }
                                                            onUpdateBlockedDate={
                                                                handleUpdateBlockedDate
                                                            }
                                                            onDeleteBlockedDate={
                                                                handleDeleteBlockedDate
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab ===
                                                    'opened-dates' && (
                                                    <TabsContent
                                                        value="opened-dates"
                                                        className="m-0 p-0"
                                                    >
                                                        <OpenedDatesTab
                                                            openedDates={
                                                                openedDates
                                                            }
                                                            onAddOpenedDate={
                                                                handleAddOpenedDate
                                                            }
                                                            onUpdateOpenedDate={
                                                                handleUpdateOpenedDate
                                                            }
                                                            onDeleteOpenedDate={
                                                                handleDeleteOpenedDate
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab === 'menu' && (
                                                    <TabsContent
                                                        value="menu"
                                                        className="m-0 p-0"
                                                    >
                                                        <MenuTab
                                                            menuItems={
                                                                posState.filteredMenuItems
                                                            }
                                                            currency_symbol={
                                                                currency_symbol
                                                            }
                                                            canEdit={canEdit}
                                                            canDelete={
                                                                canDelete
                                                            }
                                                            onAddMenuItem={
                                                                handleAddMenuItem
                                                            }
                                                            onEditMenuItem={
                                                                handleEditMenuItem
                                                            }
                                                            onDeleteMenuItem={
                                                                handleDeleteMenuItem
                                                            }
                                                            onBulkDeleteMenuItems={
                                                                handleBulkDeleteMenuItems
                                                            }
                                                            onToggleAvailability={
                                                                handleToggleAvailability
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab === 'kitchen' && (
                                                    <TabsContent
                                                        value="kitchen"
                                                        className="m-0 p-0"
                                                    >
                                                        <KitchenTab
                                                            currency_symbol={
                                                                currency_symbol
                                                            }
                                                            clientIdentifier={
                                                                (
                                                                    auth.user as any
                                                                ).identifier ||
                                                                ''
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab === 'sales' && (
                                                    <TabsContent
                                                        value="sales"
                                                        className="m-0 p-0"
                                                    >
                                                        <SalesTab
                                                            sales={sales || []}
                                                            currency_symbol={
                                                                currency_symbol
                                                            }
                                                        />
                                                    </TabsContent>
                                                )}

                                                {currentTab ===
                                                    'food-delivery' && (
                                                    <TabsContent
                                                        value="food-delivery"
                                                        className="m-0 p-0"
                                                    >
                                                        <FoodDeliveryTab
                                                            menuItems={
                                                                posState.menuItems
                                                            }
                                                            onlineStores={
                                                                onlineStores
                                                            }
                                                            onlineOrders={
                                                                onlineOrders
                                                            }
                                                            currency_symbol={
                                                                currency_symbol
                                                            }
                                                            canEdit={true}
                                                            canDelete={true}
                                                            onAddOnlineStore={async (
                                                                storeData,
                                                            ) => {
                                                                const result =
                                                                    await api.createOnlineStore(
                                                                        storeData,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onEditOnlineStore={async (
                                                                id,
                                                                storeData,
                                                            ) => {
                                                                const result =
                                                                    await api.updateOnlineStore(
                                                                        id,
                                                                        storeData,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onDeleteOnlineStore={async (
                                                                id,
                                                            ) => {
                                                                const result =
                                                                    await api.deleteOnlineStore(
                                                                        id,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onToggleStoreStatus={async (
                                                                id,
                                                                is_active,
                                                            ) => {
                                                                const result =
                                                                    await api.toggleOnlineStoreStatus(
                                                                        id,
                                                                        is_active,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onUpdateStoreMenuItems={async (
                                                                id,
                                                                menuItemIds,
                                                            ) => {
                                                                const result =
                                                                    await api.updateOnlineStoreMenuItems(
                                                                        id,
                                                                        menuItemIds,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onVerifyOrder={async (
                                                                id,
                                                                status,
                                                                notes,
                                                            ) => {
                                                                const result =
                                                                    await api.verifyOrder(
                                                                        id,
                                                                        status,
                                                                        notes,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onNegotiatePayment={async (
                                                                id,
                                                                amount,
                                                                notes,
                                                            ) => {
                                                                const result =
                                                                    await api.negotiatePayment(
                                                                        id,
                                                                        amount,
                                                                        notes,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onUpdateOrderStatus={async (
                                                                id,
                                                                status,
                                                            ) => {
                                                                const result =
                                                                    await api.updateOrderStatus(
                                                                        id,
                                                                        status,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                            onUpdatePaymentStatus={async (
                                                                id,
                                                                paymentStatus,
                                                                paymentMethod,
                                                                paymentNotes,
                                                            ) => {
                                                                const result =
                                                                    await api.updatePaymentStatus(
                                                                        id,
                                                                        paymentStatus,
                                                                        paymentMethod,
                                                                        paymentNotes,
                                                                    );
                                                                if (result) {
                                                                    api.refreshData();
                                                                }
                                                            }}
                                                        />
                                                    </TabsContent>
                                                )}
                                            </Suspense>
                                        </ErrorBoundary>
                                    )}
                                </div>
                                {/* End Content Area */}
                            </div>
                            {/* End Main Layout */}
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <Suspense fallback={null}>
                <AddTableDialog
                    isOpen={isAddTableDialogOpen}
                    onClose={() => setIsAddTableDialogOpen(false)}
                    onConfirm={handleAddTable}
                />

                <EditTableDialog
                    isOpen={isEditTableDialogOpen}
                    onClose={() => setIsEditTableDialogOpen(false)}
                    onConfirm={handleConfirmEditTable}
                    editTableData={editTableData}
                />

                <QRCodeDialog
                    isOpen={isQRDialogOpen}
                    onClose={() => setIsQRDialogOpen(false)}
                    selectedTable={selectedTable}
                />

                <SplitBillDialog
                    isOpen={isSplitBillDialogOpen}
                    onClose={() => setIsSplitBillDialogOpen(false)}
                    orderItems={posState.orderItems}
                    tableNumber={posState.tableNumber}
                    totalAmount={posState.totalAmount}
                    discountAmount={
                        discountType === 'percentage'
                            ? (posState.totalAmount * discount) / 100
                            : discount
                    }
                    serviceChargeAmount={
                        serviceChargeType === 'percentage'
                            ? (posState.totalAmount * serviceCharge) / 100
                            : serviceCharge
                    }
                    finalTotal={
                        posState.totalAmount -
                        (discountType === 'percentage'
                            ? (posState.totalAmount * discount) / 100
                            : discount) +
                        (serviceChargeType === 'percentage'
                            ? (posState.totalAmount * serviceCharge) / 100
                            : serviceCharge)
                    }
                    currency_symbol={currency_symbol}
                />

                <AddMenuItemDialog
                    isOpen={isAddMenuItemDialogOpen}
                    onClose={() => setIsAddMenuItemDialogOpen(false)}
                    onConfirm={handleConfirmAddMenuItem}
                />

                <EditMenuItemDialog
                    isOpen={isEditMenuItemDialogOpen}
                    onClose={() => setIsEditMenuItemDialogOpen(false)}
                    onConfirm={handleConfirmEditMenuItem}
                    menuItem={editMenuItemData}
                />

                <DeleteMenuItemDialog
                    isOpen={isDeleteMenuItemDialogOpen}
                    onClose={() => setIsDeleteMenuItemDialogOpen(false)}
                    onConfirm={handleConfirmDeleteMenuItem}
                    menuItemName={deleteMenuItemData?.name}
                    isBulkDelete={deleteMenuItemData?.isBulk}
                    itemCount={deleteMenuItemData?.itemCount}
                    selectedIds={deleteMenuItemData?.selectedIds}
                />
            </Suspense>
        </AuthenticatedLayout>
    );
}
