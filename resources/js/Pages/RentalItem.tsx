import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Edit, History, Plus, Search, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface RentalItem {
    id: number;
    name: string;
    category: string;
    daily_rate: number;
    quantity: number;
    status: 'available' | 'rented' | 'maintenance';
    renter_name: string;
    renter_contact: string;
    rental_start: string;
    rental_end: string;
}

interface Payment {
    id: number;
    rental_item_id: number;
    amount: number;
    payment_date: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    initialItems: RentalItem[];
    initialPayments: any[];
    appCurrency: any;
}

export default function RentalItem({
    auth,
    initialItems,
    initialPayments,
    appCurrency,
}: Props) {
    const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RentalItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] =
        useState(false);
    const [paymentItem, setPaymentItem] = useState<RentalItem | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
    const [selectedItemHistory, setSelectedItemHistory] =
        useState<RentalItem | null>(null);
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const handleAddItem = () => {
        setCurrentItem(null);
        setIsItemDialogOpen(true);
    };

    const handleEditItem = (item: RentalItem) => {
        setCurrentItem(item);
        setIsItemDialogOpen(true);
    };

    const handleDeleteItem = async (id: number) => {
        try {
            await axios.delete(`/rental-item/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const handleDeleteSelectedItems = async () => {
        try {
            await axios.post('/rental-item/bulk-delete', {
                ids: selectedItems,
            });
            fetchItems();
            setSelectedItems([]);
        } catch (error) {
            console.error('Failed to delete items:', error);
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentItem) {
                if (currentItem.id) {
                    // Edit existing item
                    await axios.put(
                        `/rental-item/${currentItem.id}`,
                        currentItem,
                    );
                } else {
                    // Add new item
                    await axios.post('/rental-item', currentItem);
                }
                fetchItems();
                setIsItemDialogOpen(false);
                setCurrentItem(null);
            }
        } catch (error) {
            console.error('Failed to save item:', error);
        }
    };

    const toggleItemSelection = (id: number) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id],
        );
    };

    const filteredItems = useMemo(() => {
        return rentalItems.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                item.renter_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        );
    }, [rentalItems, searchTerm]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage]);

    const pageCount = Math.ceil(filteredItems.length / itemsPerPage);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/rental-item/list');
            if (response.data && response.data.data) {
                setRentalItems(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handlePayment = (item: RentalItem) => {
        setPaymentItem(item);
        setPaymentAmount(item.daily_rate.toString());
        setIsPaymentDialogOpen(true);
    };

    const handlePaymentHistory = async (item: RentalItem) => {
        try {
            const response = await axios.get(
                `/rental-item/${item.id}/payment-history`,
            );
            setSelectedItemHistory(item);
            setPaymentHistory(response.data.data || []);
            setIsPaymentHistoryDialogOpen(true);
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`/rental-item/${paymentItem?.id}/payment`, {
                amount: parseFloat(paymentAmount),
                payment_date: paymentDate,
            });
            setIsPaymentDialogOpen(false);
            fetchItems();
        } catch (error) {
            console.error('Failed to process payment:', error);
        }
    };

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Rental Items
                </h2>
            }
        >
            <Head title="Items" />

            <div className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-700">
                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex justify-between">
                            <div className="flex items-center space-x-2">
                                {canEdit && (
                                    <Button onClick={handleAddItem}>
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Rental Item
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDeleteSelectedItems}
                                        variant="destructive"
                                        disabled={selectedItems.length === 0}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />{' '}
                                        Delete Selected
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search rental items..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-64"
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={
                                                selectedItems.length ===
                                                paginatedItems.length
                                            }
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedItems(
                                                        paginatedItems.map(
                                                            (item) => item.id,
                                                        ),
                                                    );
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
                                                checked={selectedItems.includes(
                                                    item.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleItemSelection(item.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>
                                            {appCurrency.symbol}
                                            {item.daily_rate}
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.status}</TableCell>
                                        <TableCell>
                                            {item.renter_name ? (
                                                <div>
                                                    <p>{item.renter_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {item.renter_contact}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {item.rental_start} to{' '}
                                                        {item.rental_end}
                                                    </p>
                                                </div>
                                            ) : (
                                                'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {canEdit && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditItem(item)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteItem(
                                                                item.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {item.status === 'rented' && (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePayment(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            Pay
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePaymentHistory(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            <History className="mr-1 h-4 w-4" />
                                                            Payment
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredItems.length,
                                )}{' '}
                                of {filteredItems.length} items
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from(
                                    { length: pageCount },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        variant={
                                            currentPage === page
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
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
                    </CardContent>
                </Card>

                <Dialog
                    open={isItemDialogOpen}
                    onOpenChange={setIsItemDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {currentItem?.id
                                    ? 'Edit Rental Item'
                                    : 'Add Rental Item'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveItem}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="name"
                                        className="text-right"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={currentItem?.name || ''}
                                        onChange={(e) =>
                                            setCurrentItem({
                                                ...currentItem!,
                                                name: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="category"
                                        className="text-right"
                                    >
                                        Category
                                    </Label>
                                    <Input
                                        id="category"
                                        value={currentItem?.category || ''}
                                        onChange={(e) =>
                                            setCurrentItem({
                                                ...currentItem!,
                                                category: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="daily_rate"
                                        className="text-right"
                                    >
                                        Daily Rate
                                    </Label>
                                    <Input
                                        id="daily_rate"
                                        type="number"
                                        value={currentItem?.daily_rate || ''}
                                        onChange={(e) =>
                                            setCurrentItem({
                                                ...currentItem!,
                                                daily_rate: parseFloat(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="quantity"
                                        className="text-right"
                                    >
                                        Quantity
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={currentItem?.quantity || ''}
                                        onChange={(e) =>
                                            setCurrentItem({
                                                ...currentItem!,
                                                quantity: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="status"
                                        className="text-right"
                                    >
                                        Status
                                    </Label>
                                    <Select
                                        value={currentItem?.status || ''}
                                        onValueChange={(
                                            value:
                                                | 'available'
                                                | 'rented'
                                                | 'maintenance',
                                        ) =>
                                            setCurrentItem({
                                                ...currentItem!,
                                                status: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">
                                                Available
                                            </SelectItem>
                                            <SelectItem value="rented">
                                                Rented
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                                Maintenance
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {currentItem?.status === 'rented' && (
                                    <>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="renterName"
                                                className="text-right"
                                            >
                                                Renter Name
                                            </Label>
                                            <Input
                                                id="renterName"
                                                value={
                                                    currentItem?.renter_name ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setCurrentItem({
                                                        ...currentItem!,
                                                        renter_name:
                                                            e.target.value,
                                                    })
                                                }
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="renterContact"
                                                className="text-right"
                                            >
                                                Renter Contact
                                            </Label>
                                            <Input
                                                id="renterContact"
                                                value={
                                                    currentItem?.renter_contact ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setCurrentItem({
                                                        ...currentItem!,
                                                        renter_contact:
                                                            e.target.value,
                                                    })
                                                }
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="rentalStart"
                                                className="text-right"
                                            >
                                                Rental Start
                                            </Label>
                                            <Input
                                                id="rentalStart"
                                                type="date"
                                                value={
                                                    currentItem?.rental_start ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setCurrentItem({
                                                        ...currentItem!,
                                                        rental_start:
                                                            e.target.value,
                                                    })
                                                }
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label
                                                htmlFor="rentalEnd"
                                                className="text-right"
                                            >
                                                Rental End
                                            </Label>
                                            <Input
                                                id="rentalEnd"
                                                type="date"
                                                value={
                                                    currentItem?.rental_end ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setCurrentItem({
                                                        ...currentItem!,
                                                        rental_end:
                                                            e.target.value,
                                                    })
                                                }
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

                <Dialog
                    open={isPaymentDialogOpen}
                    onOpenChange={setIsPaymentDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="itemName"
                                        className="text-right"
                                    >
                                        Item
                                    </Label>
                                    <div className="col-span-3">
                                        {paymentItem?.name}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="renter_name"
                                        className="text-right"
                                    >
                                        Renter
                                    </Label>
                                    <div className="col-span-3">
                                        {paymentItem?.renter_name}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="paymentAmount"
                                        className="text-right"
                                    >
                                        Amount
                                    </Label>
                                    <Input
                                        id="paymentAmount"
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) =>
                                            setPaymentAmount(e.target.value)
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="paymentDate"
                                        className="text-right"
                                    >
                                        Payment Date
                                    </Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) =>
                                            setPaymentDate(e.target.value)
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Record Payment</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isPaymentHistoryDialogOpen}
                    onOpenChange={setIsPaymentHistoryDialogOpen}
                >
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Payment History</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Item Name</Label>
                                    <p className="text-sm">
                                        {selectedItemHistory?.name}
                                    </p>
                                </div>
                                <div>
                                    <Label>Renter Name</Label>
                                    <p className="text-sm">
                                        {selectedItemHistory?.renter_name}
                                    </p>
                                </div>
                                <div>
                                    <Label>Rental Period</Label>
                                    <p className="text-sm">
                                        {selectedItemHistory?.rental_start} to{' '}
                                        {selectedItemHistory?.rental_end}
                                    </p>
                                </div>
                                <div>
                                    <Label>Daily Rate</Label>
                                    <p className="text-sm">
                                        {appCurrency.symbol}
                                        {selectedItemHistory?.daily_rate}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Label>Payment Records</Label>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentHistory.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="text-center"
                                                >
                                                    No payment records found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paymentHistory.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>
                                                        {new Date(
                                                            payment.payment_date,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {appCurrency.symbol}
                                                        {Number(
                                                            payment.amount,
                                                        ).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                            Paid
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setIsPaymentHistoryDialogOpen(false)
                                }
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
