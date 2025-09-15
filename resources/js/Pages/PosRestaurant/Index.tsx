import React, { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { UtensilsCrossed, Calculator, Check, ShoppingCart, Calendar } from "lucide-react";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Toaster, toast } from "sonner";
import { usePosState } from './hooks/usePosState';
import { usePosApi } from './hooks/usePosApi';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MenuItem, Table, JoinedTable, Reservation, MenuItemFormData, BlockedDate } from './types';

// Lazy load tab components for better performance
const PosTab = lazy(() => import('./components/PosTab').then(module => ({ default: module.PosTab })));
const TablesTab = lazy(() => import('./components/TablesTab').then(module => ({ default: module.TablesTab })));
const ReservationsTab = lazy(() => import('./components/ReservationsTab').then(module => ({ default: module.ReservationsTab })));
const BlockedDatesTab = lazy(() => import('./components/BlockedDatesTab').then(module => ({ default: module.BlockedDatesTab })));
const MenuTab = lazy(() => import('./components/MenuTab').then(module => ({ default: module.MenuTab })));

// Lazy load dialog components
const CompleteOrderDialog = lazy(() => import('./components/dialogs/CompleteOrderDialog').then(module => ({ default: module.CompleteOrderDialog })));
const AddTableDialog = lazy(() => import('./components/dialogs/AddTableDialog').then(module => ({ default: module.AddTableDialog })));
const EditTableDialog = lazy(() => import('./components/dialogs/EditTableDialog').then(module => ({ default: module.EditTableDialog })));
const QRCodeDialog = lazy(() => import('./components/dialogs/QRCodeDialog').then(module => ({ default: module.QRCodeDialog })));
const SplitBillDialog = lazy(() => import('./components/dialogs/SplitBillDialog').then(module => ({ default: module.SplitBillDialog })));
const AddMenuItemDialog = lazy(() => import('./components/dialogs/AddMenuItemDialog').then(module => ({ default: module.AddMenuItemDialog })));
const EditMenuItemDialog = lazy(() => import('./components/dialogs/EditMenuItemDialog').then(module => ({ default: module.EditMenuItemDialog })));
const DeleteMenuItemDialog = lazy(() => import('./components/dialogs/DeleteMenuItemDialog').then(module => ({ default: module.DeleteMenuItemDialog })));

// Loading component for tab switching
const TabLoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-12">
        <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="mt-4 text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we prepare your content</p>
        </div>
    </div>
);

interface PageProps {
    menuItems: MenuItem[];
    tables: Table[];
    tab?: string;
    joinedTables?: JoinedTable[];
    reservations?: Reservation[];
    blockedDates?: BlockedDate[];
    currency_symbol?: string;
}

export default function PosRestaurantIndex({ 
    menuItems, 
    tables, 
    tab = 'pos', 
    joinedTables = [], 
    reservations = [],
    blockedDates = [],
    currency_symbol = '$' 
}: PageProps) {
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState(tab);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    
    // Dialog states
    const [isCompleteSaleDialogOpen, setIsCompleteSaleDialogOpen] = useState(false);
    const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
    const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const [isSplitBillDialogOpen, setIsSplitBillDialogOpen] = useState(false);
    const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] = useState(false);
    const [isEditMenuItemDialogOpen, setIsEditMenuItemDialogOpen] = useState(false);
    const [isDeleteMenuItemDialogOpen, setIsDeleteMenuItemDialogOpen] = useState(false);
    const [editMenuItemData, setEditMenuItemData] = useState<MenuItem | null>(null);
    const [deleteMenuItemData, setDeleteMenuItemData] = useState<{ id: number; name: string; isBulk: boolean; itemCount?: number; selectedIds?: number[] } | null>(null);
    const [editTableData, setEditTableData] = useState<{ id: number; name: string; seats: number } | null>(null);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    // Use custom hooks for state management and API calls
    const posState = usePosState(menuItems, tables, joinedTables, reservations, blockedDates);
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
        // Simulate loading for better UX
        setTimeout(() => {
            setIsTabLoading(false);
        }, 300);
    }, []);

    // POS Tab handlers
    const handleCompleteOrder = useCallback(() => {
        setIsCompleteSaleDialogOpen(true);
    }, []);

    const handleShowQRCode = useCallback(() => {
        // Find the table for the current order
        const table = tables.find(t => t.name === posState.tableNumber);
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

        const orderItemsDetails = posState.orderItems.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${currency_symbol}${item.price}</td>
                <td>${currency_symbol}${(item.price * item.quantity)}</td>
            </tr>
        `).join('');

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
                        <p><strong>Subtotal: ${currency_symbol}${posState.totalAmount}</strong></p>
                        <p><strong>Discount: ${currency_symbol}${discountType === 'percentage' ? (posState.totalAmount * discount / 100) : discount}</strong></p>
                        <p><strong>Total Amount: ${currency_symbol}${posState.totalAmount - (discountType === 'percentage' ? (posState.totalAmount * discount / 100) : discount)}</strong></p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, [posState.orderItems, posState.tableNumber, posState.totalAmount, currency_symbol, discount, discountType]);

    const handlePrintKitchenOrder = useCallback(async () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            toast.error('Please allow pop-ups to print kitchen orders');
            return;
        }

        const orderItemsDetails = posState.orderItems.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.notes || 'No special instructions'}</td>
            </tr>
        `).join('');

        const printContent = `
            <html>
                <head>
                    <title>Kitchen Order</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
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
                    <div class="order-details">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Notes</th>
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

        // Also send to kitchen order API
        try {
            await api.storeKitchenOrder({
                table_number: posState.tableNumber,
                items: posState.orderItems,
                client_identifier: 'current_client' // This should come from auth
            });
            toast.success('Kitchen order sent successfully');
        } catch (error) {
            toast.error('Failed to send kitchen order');
        }
    }, [posState.orderItems, posState.tableNumber, api]);

    const handleConfirmCompleteOrder = useCallback(async () => {
        const orderData = {
            table_number: posState.tableNumber,
            items: JSON.stringify(posState.orderItems),
            subtotal: posState.totalAmount,
            discount: discount,
            discount_type: discountType,
            total: posState.totalAmount - (discountType === 'percentage' ? (posState.totalAmount * discount / 100) : discount)
        };

        const result = await api.completeOrder(orderData);
        if (result) {
            posState.clearOrder();
            setIsCompleteSaleDialogOpen(false);
            api.refreshData();
        }
    }, [posState, discount, discountType, api]);

    // Table handlers
    const handleAddTable = useCallback(async (name: string, seats: number) => {
        const result = await api.createTable({ name, seats, status: 'available' });
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleEditTable = useCallback((table: Table) => {
        setEditTableData({
            id: typeof table.id === 'number' ? table.id : parseInt(table.id.toString()),
            name: table.name,
            seats: table.seats
        });
        setIsEditTableDialogOpen(true);
    }, []);

    const handleConfirmEditTable = useCallback(async (id: number, name: string, seats: number) => {
        const result = await api.updateTable(id, { name, seats });
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleDeleteTable = useCallback(async (tableId: number) => {
        if (confirm('Are you sure you want to delete this table?')) {
            const result = await api.deleteTable(tableId);
            if (result) {
                api.refreshData();
            }
        }
    }, [api]);

    const handleJoinTables = useCallback(async (tableIds: number[]) => {
        const result = await api.joinTables(tableIds);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleUnjoinTables = useCallback(async (tableIds: number[]) => {
        const result = await api.unjoinTables(tableIds);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    // Menu handlers
    const handleAddMenuItem = useCallback(() => {
        setIsAddMenuItemDialogOpen(true);
    }, []);

    const handleConfirmAddMenuItem = useCallback(async (menuItemData: MenuItemFormData) => {
        const result = await api.createMenuItem(menuItemData);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleEditMenuItem = useCallback((item: MenuItem) => {
        setEditMenuItemData(item);
        setIsEditMenuItemDialogOpen(true);
    }, []);

    const handleConfirmEditMenuItem = useCallback(async (id: number, menuItemData: MenuItemFormData) => {
        const result = await api.updateMenuItem(id, menuItemData);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleDeleteMenuItem = useCallback((id: number) => {
        // Find the menu item to get its name
        const menuItem = posState.menuItems.find(item => item.id === id);
        if (menuItem) {
            setDeleteMenuItemData({
                id: id,
                name: menuItem.name,
                isBulk: false
            });
            setIsDeleteMenuItemDialogOpen(true);
        }
    }, [posState.menuItems]);

    const handleConfirmDeleteMenuItem = useCallback(async () => {
        if (deleteMenuItemData) {
            if (deleteMenuItemData.isBulk && deleteMenuItemData.selectedIds) {
                const result = await api.bulkDeleteMenuItems(deleteMenuItemData.selectedIds);
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
            selectedIds: ids
        });
        setIsDeleteMenuItemDialogOpen(true);
    }, []);


    // Reservation handlers
    const handleAddReservation = useCallback(async (reservation: Omit<Reservation, 'id' | 'status'>) => {
        const result = await api.createReservation(reservation);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleUpdateReservation = useCallback(async (id: number, reservation: Partial<Reservation>) => {
        const result = await api.updateReservation(id, reservation);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleDeleteReservation = useCallback(async (id: number) => {
        if (confirm('Are you sure you want to delete this reservation?')) {
            const result = await api.deleteReservation(id);
            if (result) {
                api.refreshData();
            }
        }
    }, [api]);

    const handleConfirmReservation = useCallback(async (id: number) => {
        await handleUpdateReservation(id, { status: 'confirmed' });
    }, [handleUpdateReservation]);

    const handleCancelReservation = useCallback(async (id: number) => {
        await handleUpdateReservation(id, { status: 'cancelled' });
    }, [handleUpdateReservation]);

    // Blocked Dates handlers
    const handleAddBlockedDate = useCallback(async (blockedDate: Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>) => {
        const result = await api.createBlockedDate(blockedDate);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleUpdateBlockedDate = useCallback(async (id: number, blockedDate: Partial<BlockedDate>) => {
        const result = await api.updateBlockedDate(id, blockedDate);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    const handleDeleteBlockedDate = useCallback(async (id: number) => {
        const result = await api.deleteBlockedDate(id);
        if (result) {
            api.refreshData();
        }
    }, [api]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
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
            <Head title="POS Restaurant" />
            <Toaster position="top-right" richColors />

            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                        <TabsList className={`grid w-full ${
                            useMediaQuery('(min-width: 640px)') 
                                ? 'grid-cols-5' 
                                : 'grid-cols-2'
                        } gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 pb-10`}>
                            <TabsTrigger 
                                value="pos" 
                                className="group relative text-sm font-medium whitespace-nowrap px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200 rounded-lg transition-all duration-200 ease-in-out"
                            >
                                <UtensilsCrossed className="w-4 h-4 mr-2 group-data-[state=active]:text-white" />
                                <span className="hidden sm:inline">Point of Sale</span>
                                <span className="sm:hidden">POS</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="tables" 
                                className="group relative text-sm font-medium whitespace-nowrap px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200 rounded-lg transition-all duration-200 ease-in-out"
                            >
                                <Calculator className="w-4 h-4 mr-2 group-data-[state=active]:text-white" />
                                <span className="hidden sm:inline">Tables</span>
                                <span className="sm:hidden">Tables</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="reservations" 
                                className="group relative text-sm font-medium whitespace-nowrap px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200 rounded-lg transition-all duration-200 ease-in-out"
                            >
                                <Check className="w-4 h-4 mr-2 group-data-[state=active]:text-white" />
                                <span className="hidden sm:inline">Reservations</span>
                                <span className="sm:hidden">Reserve</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="blocked-dates" 
                                className="group relative text-sm font-medium whitespace-nowrap px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200 rounded-lg transition-all duration-200 ease-in-out"
                            >
                                <Calendar className="w-4 h-4 mr-2 group-data-[state=active]:text-white" />
                                <span className="hidden sm:inline">Blocked Dates</span>
                                <span className="sm:hidden">Blocked</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="menu" 
                                className="group relative text-sm font-medium whitespace-nowrap px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200 rounded-lg transition-all duration-200 ease-in-out"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2 group-data-[state=active]:text-white" />
                                <span className="hidden sm:inline">Menu</span>
                                <span className="sm:hidden">Menu</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    {isTabLoading && <TabLoadingSpinner />}
                    
                    {!isTabLoading && (
                        <ErrorBoundary>
                            <Suspense fallback={<TabLoadingSpinner />}>
                                {currentTab === "pos" && (
                                    <TabsContent value="pos" className="p-6 pb-8">
                                        <PosTab
                                            menuItems={posState.menuItems}
                                            orderItems={posState.orderItems}
                                            tableNumber={posState.tableNumber}
                                            selectedCategory={posState.selectedCategory}
                                            discount={discount}
                                            discountType={discountType}
                                            currency_symbol={currency_symbol}
                                            tables={tables}
                                            onAddItemToOrder={posState.addItemToOrder}
                                            onUpdateItemQuantity={posState.updateItemQuantity}
                                            onRemoveItemFromOrder={posState.removeItemFromOrder}
                                            onSetTableNumber={posState.setTableNumber}
                                            onSetSelectedCategory={posState.setSelectedCategory}
                                            onSetDiscount={setDiscount}
                                            onSetDiscountType={setDiscountType}
                                            onPrintBill={handlePrintBill}
                                            onShowQRCode={handleShowQRCode}
                                            onCompleteOrder={handleCompleteOrder}
                                            onSplitBill={handleSplitBill}
                                            onPrintKitchenOrder={handlePrintKitchenOrder}
                                        />
                                    </TabsContent>
                                )}
                                
                                {currentTab === "tables" && (
                                    <TabsContent value="tables" className="p-6 pb-8">
                                        <TablesTab
                                            tables={posState.filteredTables}
                                            currency_symbol={currency_symbol}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                            onAddTable={() => setIsAddTableDialogOpen(true)}
                                            onEditTable={handleEditTable}
                                            onDeleteTable={handleDeleteTable}
                                            onJoinTables={handleJoinTables}
                                            onUnjoinTables={handleUnjoinTables}
                                            onSetTableStatusFilter={posState.setTableStatusFilter}
                                            tableStatusFilter={posState.tableStatusFilter}
                                        />
                                    </TabsContent>
                                )}
                                
                                {currentTab === "reservations" && (
                                    <TabsContent value="reservations" className="p-6 pb-8">
                                        <ReservationsTab
                                            reservations={posState.reservations}
                                            tables={posState.tables}
                                            blockedDates={posState.blockedDates}
                                            currency_symbol={currency_symbol}
                                            onAddReservation={handleAddReservation}
                                            onUpdateReservation={handleUpdateReservation}
                                            onDeleteReservation={handleDeleteReservation}
                                            onConfirmReservation={handleConfirmReservation}
                                            onCancelReservation={handleCancelReservation}
                                        />
                                    </TabsContent>
                                )}
                                
                                {currentTab === "blocked-dates" && (
                                    <TabsContent value="blocked-dates" className="p-6 pb-8">
                                        <BlockedDatesTab
                                            blockedDates={posState.blockedDates}
                                            onAddBlockedDate={handleAddBlockedDate}
                                            onUpdateBlockedDate={handleUpdateBlockedDate}
                                            onDeleteBlockedDate={handleDeleteBlockedDate}
                                        />
                                    </TabsContent>
                                )}
                                
                                {currentTab === "menu" && (
                                    <TabsContent value="menu" className="p-6 pb-8">
                                        <MenuTab
                                            menuItems={posState.filteredMenuItems}
                                            currency_symbol={currency_symbol}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                            onAddMenuItem={handleAddMenuItem}
                                            onEditMenuItem={handleEditMenuItem}
                                            onDeleteMenuItem={handleDeleteMenuItem}
                                            onBulkDeleteMenuItems={handleBulkDeleteMenuItems}
                                        />
                                    </TabsContent>
                                )}
                            </Suspense>
                        </ErrorBoundary>
                    )}
                </Tabs>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
                <Suspense fallback={null}>
                    <CompleteOrderDialog
                        isOpen={isCompleteSaleDialogOpen}
                        onClose={() => setIsCompleteSaleDialogOpen(false)}
                        onConfirm={handleConfirmCompleteOrder}
                        orderItems={posState.orderItems}
                        tableNumber={posState.tableNumber}
                        totalAmount={posState.totalAmount}
                        discountAmount={discountType === 'percentage' ? (posState.totalAmount * discount / 100) : discount}
                        finalTotal={posState.totalAmount - (discountType === 'percentage' ? (posState.totalAmount * discount / 100) : discount)}
                        currency_symbol={currency_symbol}
                    />

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
                        discountAmount={discountType === 'percentage' ? (posState.totalAmount * discount / 100) : discount}
                        finalTotal={posState.totalAmount - (discountType === 'percentage' ? (posState.totalAmount * discount / 100) : discount)}
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
