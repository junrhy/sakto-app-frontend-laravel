import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Textarea } from '@/Components/ui/textarea';
import { HandymanInventoryItem, HandymanTechnician } from '@/types/handyman';
import { useEffect, useState } from 'react';

export interface InventoryTransactionPayload {
    inventory_item_id: number;
    transaction_type: 'check_out' | 'check_in' | 'consume' | 'adjust';
    quantity: number;
    technician_id?: number | null;
    work_order_id?: number | null;
    details?: Record<string, unknown> | null;
    transaction_at?: string | null;
    recorded_by?: number | null;
}

interface InventoryTransactionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: HandymanInventoryItem[];
    technicians: HandymanTechnician[];
    onSubmit: (payload: InventoryTransactionPayload) => Promise<void>;
    submitting?: boolean;
    defaultItemId?: number;
}

const transactionTypes: InventoryTransactionPayload['transaction_type'][] = [
    'check_out',
    'check_in',
    'consume',
    'adjust',
];

const toDateTimeLocal = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .slice(0, 16);
};

const toIsoOrNull = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

export function InventoryTransactionFormDialog({
    open,
    onOpenChange,
    items,
    technicians,
    onSubmit,
    submitting = false,
    defaultItemId,
}: InventoryTransactionFormDialogProps) {
    const [inventoryItemId, setInventoryItemId] = useState<number | null>(null);
    const [transactionType, setTransactionType] =
        useState<InventoryTransactionPayload['transaction_type']>('check_out');
    const [quantity, setQuantity] = useState('1');
    const [technicianId, setTechnicianId] = useState<number | null>(null);
    const [transactionAt, setTransactionAt] = useState('');
    const [notes, setNotes] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        setSubmitError(null);
        setInventoryItemId(defaultItemId ?? items[0]?.id ?? null);
        setTransactionType('check_out');
        setQuantity('1');
        setTechnicianId(null);
        setTransactionAt(toDateTimeLocal(new Date().toISOString()));
        setNotes('');
    }, [open, items, defaultItemId]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        if (!inventoryItemId) {
            setSubmitError('Please select an inventory item.');
            return;
        }

        const payload: InventoryTransactionPayload = {
            inventory_item_id: inventoryItemId,
            transaction_type: transactionType,
            quantity: Number(quantity) || 0,
            technician_id: technicianId ?? undefined,
            details: notes ? { notes } : undefined,
            transaction_at: toIsoOrNull(transactionAt),
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('Failed to record transaction.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Record Inventory Movement</DialogTitle>
                    <DialogDescription>
                        Track tool usage and consumable adjustments to keep
                        crews stocked.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="handyman-transaction-item">
                            Inventory Item
                        </Label>
                        <Select
                            value={
                                inventoryItemId !== null
                                    ? String(inventoryItemId)
                                    : 'none'
                            }
                            onValueChange={(value) =>
                                setInventoryItemId(
                                    value === 'none' ? null : Number(value),
                                )
                            }
                        >
                            <SelectTrigger id="handyman-transaction-item">
                                <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    Select item
                                </SelectItem>
                                {items.map((itemOption) => (
                                    <SelectItem
                                        key={itemOption.id}
                                        value={String(itemOption.id)}
                                    >
                                        {itemOption.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-transaction-type">
                                Movement Type
                            </Label>
                            <Select
                                value={transactionType}
                                onValueChange={(value) =>
                                    setTransactionType(
                                        value as InventoryTransactionPayload['transaction_type'],
                                    )
                                }
                            >
                                <SelectTrigger id="handyman-transaction-type">
                                    <SelectValue placeholder="Select movement type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {transactionTypes.map((typeOption) => (
                                        <SelectItem
                                            key={typeOption}
                                            value={typeOption}
                                        >
                                            {typeOption.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-transaction-quantity">
                                Quantity
                            </Label>
                            <Input
                                id="handyman-transaction-quantity"
                                type="number"
                                min={0}
                                value={quantity}
                                onChange={(event) =>
                                    setQuantity(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-transaction-technician">
                                Technician (optional)
                            </Label>
                            <Select
                                value={
                                    technicianId !== null
                                        ? String(technicianId)
                                        : 'none'
                                }
                                onValueChange={(value) =>
                                    setTechnicianId(
                                        value === 'none' ? null : Number(value),
                                    )
                                }
                            >
                                <SelectTrigger id="handyman-transaction-technician">
                                    <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Unassigned
                                    </SelectItem>
                                    {technicians.map((technician) => (
                                        <SelectItem
                                            key={technician.id}
                                            value={String(technician.id)}
                                        >
                                            {technician.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-transaction-date">
                                Timestamp
                            </Label>
                            <Input
                                id="handyman-transaction-date"
                                type="datetime-local"
                                value={transactionAt}
                                onChange={(event) =>
                                    setTransactionAt(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="handyman-transaction-notes">
                            Notes
                        </Label>
                        <Textarea
                            id="handyman-transaction-notes"
                            rows={3}
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Add context such as job reference, reason for adjustment, etc."
                        />
                    </div>

                    {submitError && (
                        <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                            {submitError}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Recording...' : 'Record Movement'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
