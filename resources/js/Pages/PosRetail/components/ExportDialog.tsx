import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { useState } from 'react';

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'inventory' | 'sales';
    onExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
    format: 'csv' | 'excel';
    fields: string[];
    dateFrom?: Date;
    dateTo?: Date;
}

const inventoryFields = [
    { id: 'name', label: 'Product Name', default: true },
    { id: 'sku', label: 'SKU', default: true },
    { id: 'barcode', label: 'Barcode', default: false },
    { id: 'category', label: 'Category', default: true },
    { id: 'quantity', label: 'Quantity', default: true },
    { id: 'low_stock_threshold', label: 'Low Stock Threshold', default: false },
    { id: 'price', label: 'Price', default: true },
    { id: 'status', label: 'Status', default: true },
    { id: 'description', label: 'Description', default: false },
    { id: 'created_at', label: 'Created Date', default: false },
];

const salesFields = [
    { id: 'id', label: 'Sale ID', default: true },
    { id: 'date', label: 'Date', default: true },
    { id: 'items', label: 'Items', default: true },
    { id: 'total_amount', label: 'Total Amount', default: true },
    { id: 'payment_method', label: 'Payment Method', default: true },
    { id: 'cash_received', label: 'Cash Received', default: false },
    { id: 'change', label: 'Change', default: false },
];

export default function ExportDialog({
    open,
    onOpenChange,
    type,
    onExport,
}: ExportDialogProps) {
    const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
    const [selectedFields, setSelectedFields] = useState<string[]>(() => {
        const fields = type === 'inventory' ? inventoryFields : salesFields;
        return fields.filter((f) => f.default).map((f) => f.id);
    });
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        type === 'sales'
            ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            : undefined,
    );
    const [dateTo, setDateTo] = useState<Date | undefined>(
        type === 'sales' ? new Date() : undefined,
    );

    const fields = type === 'inventory' ? inventoryFields : salesFields;

    const toggleField = (fieldId: string) => {
        setSelectedFields((prev) =>
            prev.includes(fieldId)
                ? prev.filter((id) => id !== fieldId)
                : [...prev, fieldId],
        );
    };

    const selectAllFields = () => {
        setSelectedFields(fields.map((f) => f.id));
    };

    const deselectAllFields = () => {
        setSelectedFields([]);
    };

    const handleExport = () => {
        if (selectedFields.length === 0) {
            return;
        }

        onExport({
            format: exportFormat,
            fields: selectedFields,
            dateFrom,
            dateTo,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Export {type === 'inventory' ? 'Inventory' : 'Sales'}{' '}
                        Data
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 overflow-y-auto py-4">
                    {/* Format Selection */}
                    <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">
                            Export Format
                        </Label>
                        <Select
                            value={exportFormat}
                            onValueChange={(value: 'csv' | 'excel') =>
                                setExportFormat(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">
                                    CSV (Comma Separated Values)
                                </SelectItem>
                                <SelectItem value="excel">
                                    Excel (.xlsx)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range (for Sales only) */}
                    {type === 'sales' && (
                        <div className="space-y-2">
                            <Label className="text-gray-900 dark:text-white">
                                Date Range (Optional)
                            </Label>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                                        From Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !dateFrom &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateFrom ? (
                                                    format(dateFrom, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={dateFrom}
                                                onSelect={setDateFrom}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                                        To Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !dateTo &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateTo ? (
                                                    format(dateTo, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={dateTo}
                                                onSelect={setDateTo}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Field Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-gray-900 dark:text-white">
                                Select Fields to Export
                            </Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={selectAllFields}
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={deselectAllFields}
                                >
                                    Deselect All
                                </Button>
                            </div>
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-4">
                            {fields.map((field) => (
                                <div
                                    key={field.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={field.id}
                                        checked={selectedFields.includes(
                                            field.id,
                                        )}
                                        onCheckedChange={() =>
                                            toggleField(field.id)
                                        }
                                    />
                                    <Label
                                        htmlFor={field.id}
                                        className="cursor-pointer text-sm font-normal text-gray-900 dark:text-white"
                                    >
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {selectedFields.length === 0 && (
                            <p className="text-sm text-red-500">
                                Please select at least one field to export
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter className="flex justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={selectedFields.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export {selectedFields.length} Field
                        {selectedFields.length !== 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
