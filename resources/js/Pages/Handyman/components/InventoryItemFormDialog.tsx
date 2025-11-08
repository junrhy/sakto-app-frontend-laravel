import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
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
import { HandymanInventoryItem } from '@/types/handyman';
import { useEffect, useState } from 'react';

export interface InventoryItemPayload {
    sku?: string | null;
    name: string;
    type: 'tool' | 'consumable';
    category?: string | null;
    unit?: string | null;
    quantity_on_hand?: number;
    quantity_available?: number;
    reorder_level?: number;
    minimum_stock?: number;
    requires_check_in?: boolean;
}

interface InventoryItemFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: InventoryItemPayload) => Promise<void>;
    item?: HandymanInventoryItem | null;
    submitting?: boolean;
}

export function InventoryItemFormDialog({
    open,
    onOpenChange,
    onSubmit,
    item,
    submitting = false,
}: InventoryItemFormDialogProps) {
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [type, setType] = useState<'tool' | 'consumable'>('tool');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('');
    const [quantityOnHand, setQuantityOnHand] = useState('0');
    const [quantityAvailable, setQuantityAvailable] = useState('0');
    const [reorderLevel, setReorderLevel] = useState('0');
    const [minimumStock, setMinimumStock] = useState('0');
    const [requiresCheckIn, setRequiresCheckIn] = useState(true);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        setSubmitError(null);
        setName(item?.name ?? '');
        setSku(item?.sku ?? '');
        setType(item?.type ?? 'tool');
        setCategory(item?.category ?? '');
        setUnit(item?.unit ?? '');
        setQuantityOnHand(String(item?.quantity_on_hand ?? 0));
        setQuantityAvailable(String(item?.quantity_available ?? 0));
        setReorderLevel(String(item?.reorder_level ?? 0));
        setMinimumStock(String(item?.minimum_stock ?? 0));
        setRequiresCheckIn(item?.requires_check_in ?? true);
    }, [open, item]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        const payload: InventoryItemPayload = {
            sku: sku.trim() || undefined,
            name: name.trim(),
            type,
            category: category.trim() || undefined,
            unit: unit.trim() || undefined,
            quantity_on_hand: Number(quantityOnHand) || 0,
            quantity_available: Number(quantityAvailable) || 0,
            reorder_level: Number(reorderLevel) || 0,
            minimum_stock: Number(minimumStock) || 0,
            requires_check_in: requiresCheckIn,
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('Failed to save inventory item.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {item ? 'Edit Inventory Item' : 'New Inventory Item'}
                    </DialogTitle>
                    <DialogDescription>
                        Keep the inventory catalog accurate to support field
                        crews.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="handyman-inventory-name">Name</Label>
                        <Input
                            id="handyman-inventory-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g., Cordless drill"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="handyman-inventory-sku">SKU</Label>
                        <Input
                            id="handyman-inventory-sku"
                            value={sku}
                            onChange={(event) => setSku(event.target.value)}
                            placeholder="Optional unique identifier"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-inventory-type">
                                Type
                            </Label>
                            <Select
                                value={type}
                                onValueChange={(value) =>
                                    setType(value as 'tool' | 'consumable')
                                }
                            >
                                <SelectTrigger id="handyman-inventory-type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tool">Tool</SelectItem>
                                    <SelectItem value="consumable">
                                        Consumable
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-inventory-unit">
                                Unit
                            </Label>
                            <Input
                                id="handyman-inventory-unit"
                                value={unit}
                                onChange={(event) =>
                                    setUnit(event.target.value)
                                }
                                placeholder="e.g., piece, box"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-inventory-category">
                                Category
                            </Label>
                            <Input
                                id="handyman-inventory-category"
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                placeholder="e.g., Electrical"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-inventory-available">
                                Quantity Available
                            </Label>
                            <Input
                                id="handyman-inventory-available"
                                type="number"
                                min={0}
                                value={quantityAvailable}
                                onChange={(event) =>
                                    setQuantityAvailable(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-inventory-on-hand">
                                Quantity On Hand
                            </Label>
                            <Input
                                id="handyman-inventory-on-hand"
                                type="number"
                                min={0}
                                value={quantityOnHand}
                                onChange={(event) =>
                                    setQuantityOnHand(event.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-inventory-reorder">
                                Reorder Level
                            </Label>
                            <Input
                                id="handyman-inventory-reorder"
                                type="number"
                                min={0}
                                value={reorderLevel}
                                onChange={(event) =>
                                    setReorderLevel(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-inventory-minimum">
                                Minimum Stock
                            </Label>
                            <Input
                                id="handyman-inventory-minimum"
                                type="number"
                                min={0}
                                value={minimumStock}
                                onChange={(event) =>
                                    setMinimumStock(event.target.value)
                                }
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <Checkbox
                                id="handyman-inventory-requires-checkin"
                                checked={requiresCheckIn}
                                onCheckedChange={(checked) =>
                                    setRequiresCheckIn(Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="handyman-inventory-requires-checkin"
                                className="text-sm text-gray-600 dark:text-gray-400"
                            >
                                Requires check-in/out tracking
                            </Label>
                        </div>
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
                            {submitting ? 'Saving...' : 'Save Item'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
