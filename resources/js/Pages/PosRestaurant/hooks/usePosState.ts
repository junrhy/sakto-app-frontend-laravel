import { useCallback, useMemo, useState } from 'react';
import {
    BlockedDate,
    JoinedTable,
    MenuItem,
    OrderItem,
    Reservation,
    Table,
} from '../types';

export const usePosState = (
    initialMenuItems: MenuItem[],
    initialTables: Table[],
    initialJoinedTables: JoinedTable[],
    initialReservations: Reservation[] = [],
    initialBlockedDates: BlockedDate[] = [],
) => {
    // Core state
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
    const [tables, setTables] = useState<Table[]>(initialTables);
    const [joinedTables, setJoinedTables] =
        useState<JoinedTable[]>(initialJoinedTables);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [reservations, setReservations] =
        useState<Reservation[]>(initialReservations);
    const [blockedDates, setBlockedDates] =
        useState<BlockedDate[]>(initialBlockedDates);

    // UI state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [tableNumber, setTableNumber] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [tableStatusFilter, setTableStatusFilter] = useState<
        'all' | 'available' | 'occupied' | 'reserved' | 'joined'
    >('all');

    // Dialog states
    const [isCompleteSaleDialogOpen, setIsCompleteSaleDialogOpen] =
        useState(false);
    const [isSplitBillDialogOpen, setIsSplitBillDialogOpen] = useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
    const [isJoinTableDialogOpen, setIsJoinTableDialogOpen] = useState(false);
    const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
    const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);

    // Computed values
    const filteredTables = useMemo(() => {
        if (!Array.isArray(tables)) return [];

        return tableStatusFilter === 'all'
            ? tables
            : tables.filter((table) => table.status === tableStatusFilter);
    }, [tables, tableStatusFilter]);

    const categoryFilteredMenuItems = useMemo(() => {
        if (!Array.isArray(menuItems)) return [];

        return selectedCategory
            ? menuItems.filter((item) => item.category === selectedCategory)
            : menuItems;
    }, [menuItems, selectedCategory]);

    const filteredMenuItems = useMemo(() => {
        if (!Array.isArray(menuItems)) return [];

        const searchTermLower = (searchTerm || '').toLowerCase();
        return menuItems.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTermLower) ||
                item.category.toLowerCase().includes(searchTermLower),
        );
    }, [menuItems, searchTerm]);

    const totalAmount = useMemo(
        () =>
            orderItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0,
            ),
        [orderItems],
    );

    // Callbacks
    const addItemToOrder = useCallback((item: MenuItem) => {
        setOrderItems((prev) => {
            const existingItem = prev.find(
                (orderItem) => orderItem.id === item.id,
            );
            if (existingItem) {
                return prev.map((orderItem) =>
                    orderItem.id === item.id
                        ? { ...orderItem, quantity: orderItem.quantity + 1 }
                        : orderItem,
                );
            } else {
                return [...prev, { ...item, quantity: 1 }];
            }
        });
    }, []);

    const updateItemQuantity = useCallback(
        (itemId: number, newQuantity: number) => {
            if (newQuantity <= 0) {
                setOrderItems((prev) =>
                    prev.filter((item) => item.id !== itemId),
                );
            } else {
                setOrderItems((prev) =>
                    prev.map((item) =>
                        item.id === itemId
                            ? { ...item, quantity: newQuantity }
                            : item,
                    ),
                );
            }
        },
        [],
    );

    const removeItemFromOrder = useCallback((itemId: number) => {
        setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    const clearOrder = useCallback(() => {
        setOrderItems([]);
        setTableNumber('');
    }, []);

    return {
        // State
        menuItems,
        setMenuItems,
        tables,
        setTables,
        joinedTables,
        setJoinedTables,
        orderItems,
        setOrderItems,
        reservations,
        setReservations,
        selectedCategory,
        setSelectedCategory,
        tableNumber,
        setTableNumber,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        tableStatusFilter,
        setTableStatusFilter,

        // Dialog states
        isCompleteSaleDialogOpen,
        setIsCompleteSaleDialogOpen,
        isSplitBillDialogOpen,
        setIsSplitBillDialogOpen,
        isQRDialogOpen,
        setIsQRDialogOpen,
        isMenuItemDialogOpen,
        setIsMenuItemDialogOpen,
        isJoinTableDialogOpen,
        setIsJoinTableDialogOpen,
        isAddTableDialogOpen,
        setIsAddTableDialogOpen,
        isEditTableDialogOpen,
        setIsEditTableDialogOpen,

        // Computed values
        filteredTables,
        categoryFilteredMenuItems,
        filteredMenuItems,
        totalAmount,

        // Data
        blockedDates,

        // Actions
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        clearOrder,
    };
};
