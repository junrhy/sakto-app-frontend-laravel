import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { 
    Plus, 
    Edit, 
    Trash, 
    ExternalLink, 
    ShoppingBag, 
    Settings,
    Eye,
    EyeOff,
    CheckCircle,
    Clock,
    DollarSign,
    Store,
    ClipboardList
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import React, { useCallback, useMemo, useState } from 'react';
import { MenuItem } from '../types';
import { OrderVerificationTab } from './OrderVerificationTab';

interface OnlineStore {
    id: number;
    name: string;
    description: string;
    domain: string;
    is_active: boolean;
    menu_items: number[]; // Array of menu item IDs
    created_at: string;
    updated_at: string;
}

interface OnlineOrder {
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
}

interface FoodDeliveryTabProps {
    menuItems: MenuItem[];
    onlineStores?: OnlineStore[];
    onlineOrders?: OnlineOrder[];
    currency_symbol: string;
    canEdit: boolean;
    canDelete: boolean;
    onAddOnlineStore?: (storeData: Omit<OnlineStore, 'id' | 'created_at' | 'updated_at'>) => void;
    onEditOnlineStore?: (id: number, storeData: Partial<OnlineStore>) => void;
    onDeleteOnlineStore?: (id: number) => void;
    onToggleStoreStatus?: (id: number, is_active: boolean) => void;
    onUpdateStoreMenuItems?: (id: number, menuItemIds: number[]) => void;
    onVerifyOrder?: (id: number, status: 'verified' | 'rejected', notes?: string) => void;
    onNegotiatePayment?: (id: number, amount: number, notes?: string) => void;
    onUpdateOrderStatus?: (id: number, status: string) => void;
    onUpdatePaymentStatus?: (id: number, paymentStatus: string, paymentMethod?: string, paymentNotes?: string) => void;
}

export const FoodDeliveryTab: React.FC<FoodDeliveryTabProps> = ({
    menuItems,
    onlineStores = [],
    onlineOrders = [],
    currency_symbol,
    onUpdatePaymentStatus,
    canEdit,
    canDelete,
    onAddOnlineStore,
    onEditOnlineStore,
    onDeleteOnlineStore,
    onToggleStoreStatus,
    onUpdateStoreMenuItems,
    onVerifyOrder,
    onNegotiatePayment,
    onUpdateOrderStatus,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStores, setSelectedStores] = useState<number[]>([]);
    const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
    const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = useState(false);
    const [isDeleteStoreDialogOpen, setIsDeleteStoreDialogOpen] = useState(false);
    const [isMenuItemsDialogOpen, setIsMenuItemsDialogOpen] = useState(false);
    const [editStoreData, setEditStoreData] = useState<OnlineStore | null>(null);
    const [deleteStoreData, setDeleteStoreData] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [menuItemsStoreData, setMenuItemsStoreData] = useState<{
        id: number;
        name: string;
        menu_items: number[];
    } | null>(null);
    const itemsPerPage = 10;

    // Use real data from props
    const [onlineStoresData, setOnlineStoresData] = useState<OnlineStore[]>(onlineStores);

    // Filter online menu items (only items with is_available_online = true)
    const onlineMenuItems = useMemo(() => {
        return menuItems.filter(item => item.is_available_online);
    }, [menuItems]);

    const filteredStores = useMemo(() => {
        if (!Array.isArray(onlineStoresData)) return [];

        const searchTermLower = (searchTerm || '').toLowerCase();
        return onlineStoresData.filter(
            (store) =>
                store.name.toLowerCase().includes(searchTermLower) ||
                store.description.toLowerCase().includes(searchTermLower) ||
                store.domain.toLowerCase().includes(searchTermLower),
        );
    }, [onlineStoresData, searchTerm]);

    const paginatedStores = useMemo(() => {
        if (!Array.isArray(filteredStores)) return [];

        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStores.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStores, currentPage]);

    const pageCount = useMemo(
        () => Math.ceil(filteredStores.length / itemsPerPage),
        [filteredStores.length, itemsPerPage],
    );

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedStores(
                    paginatedStores.map((store: OnlineStore) => store.id),
                );
            } else {
                setSelectedStores([]);
            }
        },
        [paginatedStores],
    );

    const handleSelectStore = useCallback((storeId: number, checked: boolean) => {
        if (checked) {
            setSelectedStores((prev) => [...prev, storeId]);
        } else {
            setSelectedStores((prev) => prev.filter((id) => id !== storeId));
        }
    }, []);

    const handleAddStore = useCallback(() => {
        setIsAddStoreDialogOpen(true);
    }, []);

    const handleEditStore = useCallback((store: OnlineStore) => {
        setEditStoreData(store);
        setIsEditStoreDialogOpen(true);
    }, []);

    const handleDeleteStore = useCallback((store: OnlineStore) => {
        setDeleteStoreData({
            id: store.id,
            name: store.name,
        });
        setIsDeleteStoreDialogOpen(true);
    }, []);

    const handleManageMenuItems = useCallback((store: OnlineStore) => {
        setMenuItemsStoreData({
            id: store.id,
            name: store.name,
            menu_items: store.menu_items,
        });
        setIsMenuItemsDialogOpen(true);
    }, []);

    const handleToggleStoreStatus = useCallback((store: OnlineStore) => {
        if (onToggleStoreStatus) {
            onToggleStoreStatus(store.id, !store.is_active);
        }
    }, [onToggleStoreStatus]);

    const getStatusColor = useCallback((is_active: boolean) => {
        return is_active
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }, []);

    const getMenuItemsCount = useCallback((menuItemIds: number[]) => {
        return menuItemIds.length;
    }, []);

    return (
        <div className="space-y-6">
            <Tabs defaultValue="stores" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stores" className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Online Stores
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Orders
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="stores" className="space-y-6">
                    <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        <ShoppingBag className="mr-2 h-4 w-4 text-purple-500" />
                        Online Stores
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {canEdit && (
                                <Button
                                    onClick={handleAddStore}
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Online Store
                                </Button>
                            )}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Input
                                placeholder="Search online stores..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={
                                            selectedStores.length ===
                                                paginatedStores.length &&
                                            paginatedStores.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Store Name
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Domain
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Menu Items
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedStores.map((store) => (
                                <TableRow
                                    key={store.id}
                                    className="border-gray-200 dark:border-gray-600"
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedStores.includes(store.id)}
                                            onCheckedChange={(checked) =>
                                                handleSelectStore(store.id, checked as boolean)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        <div>
                                            <div className="font-semibold">{store.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {store.description}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <ExternalLink className="h-4 w-4 text-gray-400" />
                                            <button
                                                onClick={() => window.open(`/fnb/store/${store.domain}`, '_blank')}
                                                className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                                                title="Open store in new tab"
                                            >
                                                {store.domain}
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`rounded-full px-2 py-1 text-xs ${getStatusColor(store.is_active)}`}
                                        >
                                            {store.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                                            <span>{getMenuItemsCount(store.menu_items)} items</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleManageMenuItems(store)}
                                                className="text-blue-600 hover:text-blue-700"
                                                title="Manage Menu Items"
                                            >
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditStore(store)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleToggleStoreStatus(store)}
                                                className={store.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                                title={store.is_active ? "Deactivate Store" : "Activate Store"}
                                            >
                                                {store.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            {canDelete && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteStore(store)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {paginatedStores.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm
                                    ? 'No online stores found matching your search.'
                                    : 'No online stores found.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pageCount > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredStores.length,
                                )}{' '}
                                of {filteredStores.length} stores
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 py-1 text-sm">
                                    Page {currentPage} of {pageCount}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, pageCount),
                                        )
                                    }
                                    disabled={currentPage === pageCount}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Store Dialog */}
            <AddStoreDialog
                isOpen={isAddStoreDialogOpen}
                onClose={() => setIsAddStoreDialogOpen(false)}
                onConfirm={(storeData) => {
                    if (onAddOnlineStore) {
                        onAddOnlineStore(storeData);
                    }
                    setIsAddStoreDialogOpen(false);
                }}
            />

            {/* Edit Store Dialog */}
            <EditStoreDialog
                isOpen={isEditStoreDialogOpen}
                onClose={() => setIsEditStoreDialogOpen(false)}
                onConfirm={(id, storeData) => {
                    if (onEditOnlineStore) {
                        onEditOnlineStore(id, storeData);
                    }
                    setIsEditStoreDialogOpen(false);
                }}
                store={editStoreData}
            />

            {/* Delete Store Dialog */}
            <DeleteStoreDialog
                isOpen={isDeleteStoreDialogOpen}
                onClose={() => setIsDeleteStoreDialogOpen(false)}
                onConfirm={() => {
                    if (deleteStoreData && onDeleteOnlineStore) {
                        onDeleteOnlineStore(deleteStoreData.id);
                    }
                    setIsDeleteStoreDialogOpen(false);
                }}
                store={deleteStoreData}
            />

            {/* Manage Menu Items Dialog */}
            <ManageMenuItemsDialog
                isOpen={isMenuItemsDialogOpen}
                onClose={() => setIsMenuItemsDialogOpen(false)}
                onConfirm={(storeId, menuItemIds) => {
                    if (onUpdateStoreMenuItems) {
                        onUpdateStoreMenuItems(storeId, menuItemIds);
                    }
                    setIsMenuItemsDialogOpen(false);
                }}
                store={menuItemsStoreData}
                menuItems={onlineMenuItems}
                currency_symbol={currency_symbol}
            />
                </TabsContent>
                
                <TabsContent value="orders" className="space-y-6">
                    <OrderVerificationTab
                        orders={onlineOrders}
                        currency_symbol={currency_symbol}
                        onVerifyOrder={onVerifyOrder}
                        onNegotiatePayment={onNegotiatePayment}
                        onUpdateStatus={onUpdateOrderStatus}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Add Store Dialog Component
interface AddStoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (storeData: Omit<OnlineStore, 'id' | 'created_at' | 'updated_at'>) => void;
}

const AddStoreDialog: React.FC<AddStoreDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        domain: '',
        is_active: true,
        menu_items: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim() && formData.domain.trim()) {
            onConfirm(formData);
            setFormData({
                name: '',
                description: '',
                domain: '',
                is_active: true,
                menu_items: [],
            });
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            domain: '',
            is_active: true,
            menu_items: [],
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Online Store</DialogTitle>
                    <DialogDescription>
                        Create a new online store for food delivery.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Store Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Enter store name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Enter store description"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                            id="domain"
                            value={formData.domain}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, domain: e.target.value }))
                            }
                            placeholder="store.sakto.com"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Store</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Edit Store Dialog Component
interface EditStoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: number, storeData: Partial<OnlineStore>) => void;
    store: OnlineStore | null;
}

const EditStoreDialog: React.FC<EditStoreDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    store,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        domain: '',
        is_active: true,
    });

    React.useEffect(() => {
        if (store) {
            setFormData({
                name: store.name,
                description: store.description,
                domain: store.domain,
                is_active: store.is_active,
            });
        }
    }, [store]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (store && formData.name.trim() && formData.domain.trim()) {
            onConfirm(store.id, formData);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            domain: '',
            is_active: true,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Online Store</DialogTitle>
                    <DialogDescription>
                        Update the online store information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Store Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Enter store name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Enter store description"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-domain">Domain</Label>
                        <Input
                            id="edit-domain"
                            value={formData.domain}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, domain: e.target.value }))
                            }
                            placeholder="store.sakto.com"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Update Store</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Delete Store Dialog Component
interface DeleteStoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    store: { id: number; name: string } | null;
}

const DeleteStoreDialog: React.FC<DeleteStoreDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    store,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Online Store</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{store?.name}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Manage Menu Items Dialog Component
interface ManageMenuItemsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (storeId: number, menuItemIds: number[]) => void;
    store: { id: number; name: string; menu_items: number[] } | null;
    menuItems: MenuItem[];
    currency_symbol: string;
}

const ManageMenuItemsDialog: React.FC<ManageMenuItemsDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    store,
    menuItems,
    currency_symbol,
}) => {
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);

    React.useEffect(() => {
        if (store) {
            setSelectedMenuItems(store.menu_items);
        }
    }, [store]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (store) {
            onConfirm(store.id, selectedMenuItems);
        }
    };

    const handleClose = () => {
        setSelectedMenuItems([]);
        onClose();
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedMenuItems(menuItems.map(item => item.id));
        } else {
            setSelectedMenuItems([]);
        }
    };

    const handleSelectItem = (itemId: number, checked: boolean) => {
        if (checked) {
            setSelectedMenuItems(prev => [...prev, itemId]);
        } else {
            setSelectedMenuItems(prev => prev.filter(id => id !== itemId));
        }
    };

    const isAllSelected = selectedMenuItems.length === menuItems.length;
    const isIndeterminate = selectedMenuItems.length > 0 && selectedMenuItems.length < menuItems.length;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage Menu Items for "{store?.name}"</DialogTitle>
                    <DialogDescription>
                        Select which menu items will be available in this online store.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el && el.querySelector) {
                                            const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                                            if (input) {
                                                input.indeterminate = isIndeterminate;
                                            }
                                        }
                                    }}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label>Select All ({menuItems.length} items)</Label>
                            </div>
                            <div className="text-sm text-gray-500">
                                {selectedMenuItems.length} selected
                            </div>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {menuItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedMenuItems.includes(item.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectItem(item.id, checked as boolean)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {currency_symbol}{item.price}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
