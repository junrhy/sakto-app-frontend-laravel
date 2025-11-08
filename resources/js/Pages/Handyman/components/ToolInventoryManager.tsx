import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    HandymanInventoryItem,
    HandymanInventoryTransaction,
    HandymanTechnician,
} from '@/types/handyman';
import { format } from 'date-fns';
import { useState } from 'react';
import {
    InventoryItemFormDialog,
    InventoryItemPayload,
} from './InventoryItemFormDialog';
import {
    InventoryTransactionFormDialog,
    InventoryTransactionPayload,
} from './InventoryTransactionFormDialog';

interface ToolInventoryManagerProps {
    items: HandymanInventoryItem[];
    lowStock: HandymanInventoryItem[];
    transactions: HandymanInventoryTransaction[];
    technicians: HandymanTechnician[];
    onCreateItem: (payload: InventoryItemPayload) => Promise<void>;
    onUpdateItem: (
        itemId: number,
        payload: InventoryItemPayload,
    ) => Promise<void>;
    onDeleteItem: (itemId: number) => Promise<void>;
    onRecordTransaction: (
        payload: InventoryTransactionPayload,
    ) => Promise<void>;
    submittingItem?: boolean;
    submittingTransaction?: boolean;
}

const typeColors: Record<'tool' | 'consumable', string> = {
    tool: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    consumable:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

const transactionColors: Record<
    HandymanInventoryTransaction['transaction_type'],
    string
> = {
    check_out: 'text-rose-600 dark:text-rose-300',
    check_in: 'text-emerald-600 dark:text-emerald-300',
    consume: 'text-amber-600 dark:text-amber-300',
    adjust: 'text-indigo-600 dark:text-indigo-300',
};

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM dd, yyyy • hh:mm a');
    } catch {
        return value;
    }
};

export function ToolInventoryManager({
    items,
    lowStock,
    transactions,
    technicians,
    onCreateItem,
    onUpdateItem,
    onDeleteItem,
    onRecordTransaction,
    submittingItem = false,
    submittingTransaction = false,
}: ToolInventoryManagerProps) {
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] =
        useState(false);
    const [editingItem, setEditingItem] =
        useState<HandymanInventoryItem | null>(null);
    const [defaultTransactionItemId, setDefaultTransactionItemId] = useState<
        number | undefined
    >(undefined);

    const totalItems = items.length;
    const totalTools = items.filter((item) => item.type === 'tool').length;
    const totalConsumables = items.filter(
        (item) => item.type === 'consumable',
    ).length;

    const openCreateItem = () => {
        setEditingItem(null);
        setIsItemDialogOpen(true);
    };

    const openEditItem = (item: HandymanInventoryItem) => {
        setEditingItem(item);
        setIsItemDialogOpen(true);
    };

    const handleItemSubmit = async (payload: InventoryItemPayload) => {
        if (editingItem) {
            await onUpdateItem(editingItem.id, payload);
        } else {
            await onCreateItem(payload);
        }
        setIsItemDialogOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = async (item: HandymanInventoryItem) => {
        const confirmed = window.confirm(
            `Remove ${item.name} from inventory? This action cannot be undone.`,
        );
        if (!confirmed) return;
        await onDeleteItem(item.id);
    };

    const openTransactionDialog = (itemId?: number) => {
        setDefaultTransactionItemId(itemId);
        setIsTransactionDialogOpen(true);
    };

    const handleTransactionSubmit = async (
        payload: InventoryTransactionPayload,
    ) => {
        await onRecordTransaction(payload);
        setIsTransactionDialogOpen(false);
        setDefaultTransactionItemId(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Catalog Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {totalItems}
                        </div>
                        <p className="text-sm text-gray-500">
                            {totalTools} tools • {totalConsumables} consumables
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {lowStock.length}
                        </div>
                        <p className="text-sm text-gray-500">
                            Items needing restock attention
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Recent Movements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {transactions.slice(0, 10).length}
                        </div>
                        <p className="text-sm text-gray-500">
                            Last 10 recorded check-ins/out
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg">Inventory Catalog</CardTitle>
                    <Button
                        size="sm"
                        onClick={openCreateItem}
                        className="w-full sm:w-auto"
                    >
                        New Inventory Item
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Item
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Type
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Stock
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Thresholds
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Tracking
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Requires Check-In
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.sku ?? 'No SKU'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.category ?? 'General'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <Badge
                                            className={typeColors[item.type]}
                                        >
                                            {item.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {item.quantity_available}{' '}
                                                available
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity_on_hand} on hand
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                Reorder at {item.reorder_level}
                                            </p>
                                            <p>Minimum {item.minimum_stock}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1 text-xs text-gray-500">
                                            {item.metadata
                                                ? Object.entries(item.metadata)
                                                      .slice(0, 3)
                                                      .map(([key, value]) => (
                                                          <p
                                                              key={`${item.id}-${key}`}
                                                          >
                                                              {key}:{' '}
                                                              {String(value)}
                                                          </p>
                                                      ))
                                                : 'No additional metadata'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                        <Badge variant="outline">
                                            {item.requires_check_in
                                                ? 'Yes'
                                                : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="space-x-2 text-right text-gray-900 dark:text-white">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                openTransactionDialog(item.id)
                                            }
                                        >
                                            Movement
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditItem(item)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteItem(item)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Low Stock Watchlist
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Item
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Available
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Reorder Level
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Gap
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lowStock.map((item) => {
                                const gap = Math.max(
                                    0,
                                    item.reorder_level -
                                        item.quantity_available,
                                );
                                return (
                                    <TableRow
                                        key={`low-stock-${item.id}`}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.category ?? 'General'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {item.quantity_available}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {item.reorder_level}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                                                Need {gap}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg">
                        Recent Transactions
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTransactionDialog()}
                        className="w-full sm:w-auto"
                    >
                        Record Movement
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Timestamp
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Movement
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Item
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Technician
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Quantity
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow
                                    key={transaction.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {formatDateTime(
                                            transaction.transaction_at,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <span
                                            className={
                                                transactionColors[
                                                    transaction.transaction_type
                                                ]
                                            }
                                        >
                                            {transaction.transaction_type.replace(
                                                '_',
                                                ' ',
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {transaction.item?.name ??
                                            'Unknown item'}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {transaction.technician?.name ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                        {transaction.quantity}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <InventoryItemFormDialog
                open={isItemDialogOpen}
                onOpenChange={setIsItemDialogOpen}
                onSubmit={handleItemSubmit}
                item={editingItem}
                submitting={submittingItem}
            />
            <InventoryTransactionFormDialog
                open={isTransactionDialogOpen}
                onOpenChange={setIsTransactionDialogOpen}
                items={items}
                technicians={technicians}
                onSubmit={handleTransactionSubmit}
                submitting={submittingTransaction}
                defaultItemId={defaultTransactionItemId}
            />
        </div>
    );
}
