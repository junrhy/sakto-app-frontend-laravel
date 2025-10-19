import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const usePosApi = () => {
    // Menu Items API calls
    const createMenuItem = useCallback(async (menuItemData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/menu-items', menuItemData, {
                onSuccess: () => {
                    toast.success('Menu item created successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to create menu item',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const updateMenuItem = useCallback(
        async (id: number, menuItemData: any) => {
            return new Promise((resolve) => {
                router.put(`/pos-restaurant/menu-item/${id}`, menuItemData, {
                    onSuccess: () => {
                        toast.success('Menu item updated successfully');
                        resolve(true);
                    },
                    onError: (errors) => {
                        toast.error(
                            (Object.values(errors)[0] as string) ||
                                'Failed to update menu item',
                        );
                        resolve(false);
                    },
                });
            });
        },
        [],
    );

    const deleteMenuItem = useCallback(async (id: number) => {
        return new Promise((resolve) => {
            router.delete(`/pos-restaurant/menu-item/${id}`, {
                onSuccess: () => {
                    toast.success('Menu item deleted successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to delete menu item',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const bulkDeleteMenuItems = useCallback(async (ids: number[]) => {
        return new Promise((resolve) => {
            router.post(
                '/pos-restaurant/menu-items/bulk-destroy',
                { ids },
                {
                    onSuccess: () => {
                        toast.success(
                            `${ids.length} menu items deleted successfully`,
                        );
                        resolve(true);
                    },
                    onError: (errors) => {
                        toast.error(
                            (Object.values(errors)[0] as string) ||
                                'Failed to delete menu items',
                        );
                        resolve(false);
                    },
                },
            );
        });
    }, []);

    // Tables API calls
    const createTable = useCallback(async (tableData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/tables', tableData, {
                onSuccess: () => {
                    toast.success('Table created successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to create table',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const updateTable = useCallback(async (id: number, tableData: any) => {
        return new Promise((resolve) => {
            router.put(`/pos-restaurant/table/${id}`, tableData, {
                onSuccess: () => {
                    toast.success('Table updated successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to update table',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const deleteTable = useCallback(async (id: number) => {
        return new Promise((resolve) => {
            router.delete(`/pos-restaurant/table/${id}`, {
                onSuccess: () => {
                    toast.success('Table deleted successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to delete table',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const joinTables = useCallback(async (tableIds: number[]) => {
        return new Promise((resolve) => {
            router.post(
                '/pos-restaurant/tables/join',
                { tableIds },
                {
                    onSuccess: () => {
                        toast.success('Tables joined successfully');
                        resolve(true);
                    },
                    onError: (errors) => {
                        toast.error(
                            (Object.values(errors)[0] as string) ||
                                'Failed to join tables',
                        );
                        resolve(false);
                    },
                },
            );
        });
    }, []);

    const unjoinTables = useCallback(async (tableIds: number[]) => {
        return new Promise((resolve) => {
            router.post(
                '/pos-restaurant/tables/unjoin',
                { tableIds },
                {
                    onSuccess: () => {
                        toast.success('Tables unjoined successfully');
                        resolve(true);
                    },
                    onError: (errors) => {
                        toast.error(
                            (Object.values(errors)[0] as string) ||
                                'Failed to unjoin tables',
                        );
                        resolve(false);
                    },
                },
            );
        });
    }, []);

    // Orders API calls
    const addItemToOrder = useCallback(async (orderData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/orders/add-item', orderData, {
                onSuccess: (page) => {
                    resolve(page.props);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to add item to order',
                    );
                    resolve(null);
                },
            });
        });
    }, []);

    const removeOrderItem = useCallback(
        async (tableNumber: string, itemId: number) => {
            return new Promise((resolve) => {
                router.delete(
                    `/pos-restaurant/current-order/${tableNumber}/item/${itemId}`,
                    {
                        onSuccess: () => {
                            toast.success('Item removed from order');
                            resolve(true);
                        },
                        onError: (errors) => {
                            toast.error(
                                (Object.values(errors)[0] as string) ||
                                    'Failed to remove item',
                            );
                            resolve(false);
                        },
                    },
                );
            });
        },
        [],
    );

    const completeOrder = useCallback(async (orderData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/orders/complete', orderData, {
                onSuccess: (page) => {
                    toast.success('Order completed successfully');
                    resolve(page.props);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to complete order',
                    );
                    resolve(null);
                },
            });
        });
    }, []);

    // Reservations API calls
    const createReservation = useCallback(async (reservationData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/reservations', reservationData, {
                onSuccess: () => {
                    toast.success('Reservation created successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to create reservation',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const updateReservation = useCallback(
        async (id: number, reservationData: any) => {
            return new Promise((resolve) => {
                router.put(
                    `/pos-restaurant/reservations/${id}`,
                    reservationData,
                    {
                        onSuccess: () => {
                            toast.success('Reservation updated successfully');
                            resolve(true);
                        },
                        onError: (errors) => {
                            toast.error(
                                (Object.values(errors)[0] as string) ||
                                    'Failed to update reservation',
                            );
                            resolve(false);
                        },
                    },
                );
            });
        },
        [],
    );

    const deleteReservation = useCallback(async (id: number) => {
        return new Promise((resolve) => {
            router.delete(`/pos-restaurant/reservations/${id}`, {
                onSuccess: () => {
                    toast.success('Reservation deleted successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to delete reservation',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    // Kitchen Orders API calls
    const storeKitchenOrder = useCallback(async (orderData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/kitchen-order', orderData, {
                onSuccess: () => {
                    toast.success('Kitchen order sent successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to send kitchen order',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    // Table Orders API calls (New System)
    const getTableOrder = useCallback(async (tableName: string) => {
        try {
            const response = await fetch('/pos-restaurant/table-order/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ table_name: tableName }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to get table order');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Failed to get table order:', error);
            return null;
        }
    }, []);

    const saveTableOrder = useCallback(async (orderData: any) => {
        try {
            const response = await fetch('/pos-restaurant/table-order/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(orderData),
            });
            
            if (!response.ok) {
                const responseData = await response.json();
                throw new Error('Failed to save table order: ' + JSON.stringify(responseData));
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save table order:', error);
            return false;
        }
    }, []);

    const completeTableOrder = useCallback(async (tableName: string, paymentData?: {
        payment_amount: number;
        payment_method: 'cash' | 'card';
        change: number;
    }) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/table-order/complete', { 
                table_name: tableName,
                ...paymentData
            }, {
                onSuccess: () => {
                    toast.success('Order completed successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to complete order',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const getAllActiveOrders = useCallback(async () => {
        try {
            const response = await fetch('/pos-restaurant/table-orders/all-active', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to get active orders');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Failed to get active orders:', error);
            return [];
        }
    }, []);

    // Blocked Dates API calls
    const createBlockedDate = useCallback(async (blockedDateData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/blocked-dates', blockedDateData, {
                onSuccess: () => {
                    toast.success('Date blocked successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to block date',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const updateBlockedDate = useCallback(
        async (id: number, blockedDateData: any) => {
            return new Promise((resolve) => {
                router.put(
                    `/pos-restaurant/blocked-dates/${id}`,
                    blockedDateData,
                    {
                        onSuccess: () => {
                            toast.success('Blocked date updated successfully');
                            resolve(true);
                        },
                        onError: (errors) => {
                            toast.error(
                                (Object.values(errors)[0] as string) ||
                                    'Failed to update blocked date',
                            );
                            resolve(false);
                        },
                    },
                );
            });
        },
        [],
    );

    const deleteBlockedDate = useCallback(async (id: number) => {
        return new Promise((resolve) => {
            router.delete(`/pos-restaurant/blocked-dates/${id}`, {
                onSuccess: () => {
                    toast.success('Blocked date removed successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to remove blocked date',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    // Table Schedules API calls
    const setTableSchedule = useCallback(async (scheduleData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/table-schedules', scheduleData, {
                onSuccess: () => {
                    toast.success('Table schedule updated successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to update table schedule',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    // Opened Dates API calls
    const createOpenedDate = useCallback(async (openedDateData: any) => {
        return new Promise((resolve) => {
            router.post('/pos-restaurant/opened-dates', openedDateData, {
                onSuccess: () => {
                    toast.success('Date opened successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to open date',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    const updateOpenedDate = useCallback(
        async (id: number, openedDateData: any) => {
            return new Promise((resolve) => {
                router.put(
                    `/pos-restaurant/opened-dates/${id}`,
                    openedDateData,
                    {
                        onSuccess: () => {
                            toast.success('Opened date updated successfully');
                            resolve(true);
                        },
                        onError: (errors) => {
                            toast.error(
                                (Object.values(errors)[0] as string) ||
                                    'Failed to update opened date',
                            );
                            resolve(false);
                        },
                    },
                );
            });
        },
        [],
    );

    const deleteOpenedDate = useCallback(async (id: number) => {
        return new Promise((resolve) => {
            router.delete(`/pos-restaurant/opened-dates/${id}`, {
                onSuccess: () => {
                    toast.success('Opened date deleted successfully');
                    resolve(true);
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) ||
                            'Failed to delete opened date',
                    );
                    resolve(false);
                },
            });
        });
    }, []);

    // Utility function to refresh data
    const refreshData = useCallback(() => {
        router.reload({
            only: ['menuItems', 'tables', 'reservations', 'blockedDates', 'openedDates', 'tableSchedules'],
        });
    }, []);

    return {
        // Menu Items
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        bulkDeleteMenuItems,

        // Tables
        createTable,
        updateTable,
        deleteTable,
        joinTables,
        unjoinTables,

        // Orders
        addItemToOrder,
        removeOrderItem,
        completeOrder,

        // Reservations
        createReservation,
        updateReservation,
        deleteReservation,

        // Blocked Dates
        createBlockedDate,
        updateBlockedDate,
        deleteBlockedDate,

        // Opened Dates
        createOpenedDate,
        updateOpenedDate,
        deleteOpenedDate,

        // Table Schedules
        setTableSchedule,

        // Kitchen Orders
        storeKitchenOrder,

        // Table Orders (New System)
        getTableOrder,
        saveTableOrder,
        completeTableOrder,
        getAllActiveOrders,

        // Utility
        refreshData,
    };
};
