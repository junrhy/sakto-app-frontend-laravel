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

    // Utility function to refresh data
    const refreshData = useCallback(() => {
        router.reload({
            only: ['menuItems', 'tables', 'reservations', 'blockedDates'],
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

        // Kitchen Orders
        storeKitchenOrder,

        // Utility
        refreshData,
    };
};
