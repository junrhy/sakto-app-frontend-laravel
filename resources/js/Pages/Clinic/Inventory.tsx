import {
    AlertTriangle,
    Clock,
    Edit,
    Package,
    Package2,
    Pill,
    Plus,
    Search,
    Stethoscope,
    Trash2,
    TrendingDown,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../Components/ui/badge';
import { Button } from '../../Components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../Components/ui/dialog';
import { Input } from '../../Components/ui/input';
import { Label } from '../../Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../Components/ui/table';
import { Textarea } from '../../Components/ui/textarea';
import { formatCurrency } from './utils';

interface InventoryItem {
    id: number;
    name: string;
    description?: string;
    type: 'medicine' | 'equipment' | 'supply' | 'other';
    category?: string;
    sku: string;
    barcode?: string;
    unit_price: number;
    current_stock: number;
    minimum_stock: number;
    maximum_stock?: number;
    unit_of_measure: string;
    expiry_date?: string;
    supplier?: string;
    location?: string;
    is_active: boolean;
    stock_status: 'normal' | 'low_stock' | 'expiring_soon' | 'expired';
    created_at: string;
    updated_at: string;
}

interface InventorySummary {
    total_items: number;
    low_stock_items: number;
    expiring_soon_items: number;
    expired_items: number;
    total_value: number;
}

interface InventoryProps {
    auth: any;
    appCurrency: any;
}

export default function Inventory({ auth, appCurrency }: InventoryProps) {
    const currency = appCurrency ? appCurrency.symbol : '$';
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [summary, setSummary] = useState<InventorySummary>({
        total_items: 0,
        low_stock_items: 0,
        expiring_soon_items: 0,
        expired_items: 0,
        total_value: 0,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [categories, setCategories] = useState<string[]>([]);

    // Dialog states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [stockDialogOpen, setStockDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
        null,
    );
    const [stockAction, setStockAction] = useState<'add' | 'remove' | 'adjust'>(
        'add',
    );

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'medicine' as 'medicine' | 'equipment' | 'supply' | 'other',
        category: '',
        sku: '',
        barcode: '',
        unit_price: 0,
        current_stock: 0,
        minimum_stock: 0,
        maximum_stock: 0,
        unit_of_measure: 'pieces',
        expiry_date: '',
        supplier: '',
        location: '',
        is_active: true,
    });

    const [stockFormData, setStockFormData] = useState({
        quantity: 0,
        unit_price: 0,
        notes: '',
        reference_number: '',
        new_quantity: 0,
    });

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (typeFilter && typeFilter !== 'all')
                params.append('type', typeFilter);
            if (statusFilter && statusFilter !== 'all')
                params.append('stock_status', statusFilter);
            if (categoryFilter && categoryFilter !== 'all')
                params.append('category', categoryFilter);

            const response = await fetch(`/clinic/inventory/api?${params}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data.items.data || []);
                setSummary(data.summary || summary);
            }
        } catch (error) {
            alert('Failed to fetch inventory items');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/clinic/inventory/api/categories', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            alert('Name is required');
            return false;
        }
        if (!formData.sku.trim()) {
            alert('SKU is required');
            return false;
        }
        if (formData.unit_price <= 0) {
            alert('Unit price must be greater than 0');
            return false;
        }
        if (formData.current_stock < 0) {
            alert('Current stock cannot be negative');
            return false;
        }
        if (formData.minimum_stock < 0) {
            alert('Minimum stock cannot be negative');
            return false;
        }
        if (
            formData.maximum_stock &&
            formData.maximum_stock < formData.minimum_stock
        ) {
            alert(
                'Maximum stock must be greater than or equal to minimum stock',
            );
            return false;
        }
        return true;
    };

    const handleAddItem = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const response = await fetch('/clinic/inventory/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Inventory item added successfully');
                setAddDialogOpen(false);
                resetForm();
                fetchItems();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add item');
            }
        } catch (error) {
            alert('Failed to add inventory item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateItem = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetch(
                `/clinic/inventory/api/${selectedItem.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(formData),
                },
            );

            if (response.ok) {
                alert('Inventory item updated successfully');
                setEditDialogOpen(false);
                resetForm();
                fetchItems();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update item');
            }
        } catch (error) {
            alert('Failed to update inventory item');
        }
    };

    const handleStockAction = async () => {
        if (!selectedItem) return;

        try {
            let endpoint = '';
            let payload: any = {};

            switch (stockAction) {
                case 'add':
                    endpoint = `/clinic/inventory/api/${selectedItem.id}/add-stock`;
                    payload = {
                        quantity: stockFormData.quantity,
                        unit_price:
                            stockFormData.unit_price || selectedItem.unit_price,
                        notes: stockFormData.notes,
                        reference_number: stockFormData.reference_number,
                    };
                    break;
                case 'remove':
                    endpoint = `/clinic/inventory/api/${selectedItem.id}/remove-stock`;
                    payload = {
                        quantity: stockFormData.quantity,
                        notes: stockFormData.notes,
                        reference_number: stockFormData.reference_number,
                    };
                    break;
                case 'adjust':
                    endpoint = `/clinic/inventory/api/${selectedItem.id}/adjust-stock`;
                    payload = {
                        new_quantity: stockFormData.new_quantity,
                        notes: stockFormData.notes,
                    };
                    break;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Stock updated successfully');
                setStockDialogOpen(false);
                resetStockForm();
                fetchItems();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update stock');
            }
        } catch (error) {
            alert('Failed to update stock');
        }
    };

    const handleDeleteItem = async (item: InventoryItem) => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        try {
            const response = await fetch(`/clinic/inventory/api/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                alert('Inventory item deleted successfully');
                fetchItems();
            } else {
                alert('Failed to delete inventory item');
            }
        } catch (error) {
            alert('Failed to delete inventory item');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'medicine' as 'medicine' | 'equipment' | 'supply' | 'other',
            category: '',
            sku: '',
            barcode: '',
            unit_price: 0,
            current_stock: 0,
            minimum_stock: 0,
            maximum_stock: 0,
            unit_of_measure: 'pieces',
            expiry_date: '',
            supplier: '',
            location: '',
            is_active: true,
        });
    };

    const resetStockForm = () => {
        setStockFormData({
            quantity: 0,
            unit_price: 0,
            notes: '',
            reference_number: '',
            new_quantity: 0,
        });
    };

    const openEditDialog = (item: InventoryItem) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            type: item.type,
            category: item.category || '',
            sku: item.sku,
            barcode: item.barcode || '',
            unit_price: item.unit_price,
            current_stock: item.current_stock,
            minimum_stock: item.minimum_stock,
            maximum_stock: item.maximum_stock || 0,
            unit_of_measure: item.unit_of_measure,
            expiry_date: item.expiry_date || '',
            supplier: item.supplier || '',
            location: item.location || '',
            is_active: item.is_active,
        });
        setEditDialogOpen(true);
    };

    const openStockDialog = (
        item: InventoryItem,
        action: 'add' | 'remove' | 'adjust',
    ) => {
        setSelectedItem(item);
        setStockAction(action);
        setStockFormData({
            quantity: 0,
            unit_price: item.unit_price,
            notes: '',
            reference_number: '',
            new_quantity: item.current_stock,
        });
        setStockDialogOpen(true);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'medicine':
                return <Pill className="h-4 w-4" />;
            case 'equipment':
                return <Stethoscope className="h-4 w-4" />;
            case 'supply':
                return <Package2 className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'low_stock':
                return (
                    <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                    >
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                    </Badge>
                );
            case 'expiring_soon':
                return (
                    <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        <Clock className="h-3 w-3" />
                        Expiring Soon
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                    >
                        <XCircle className="h-3 w-3" />
                        Expired
                    </Badge>
                );
            default:
                return <Badge variant="default">Normal</Badge>;
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchItems();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, typeFilter, statusFilter, categoryFilter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Inventory Management
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage medicines, equipment, and supplies
                    </p>
                </div>
                <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Item
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Items
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.total_items}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {summary.low_stock_items}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Expiring Soon
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {summary.expiring_soon_items}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Expired
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {summary.expired_items}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Value
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary.total_value, currency)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="min-w-64 flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="supply">Supply</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="expiring_soon">
                            Expiring Soon
                        </SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Items Table */}
            <Card>
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
                                    Price
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Expiry
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-gray-500 dark:text-gray-400"
                                    >
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No items found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {item.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    SKU: {item.sku}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(item.type)}
                                                <span className="capitalize">
                                                    {item.type}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div>
                                                {item.current_stock}{' '}
                                                {item.unit_of_measure}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Min: {item.minimum_stock}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatCurrency(
                                                item.unit_price,
                                                currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {getStatusBadge(item.stock_status)}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {item.expiry_date
                                                ? new Date(
                                                      item.expiry_date,
                                                  ).toLocaleDateString()
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right text-gray-900 dark:text-white">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openStockDialog(
                                                            item,
                                                            'add',
                                                        )
                                                    }
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    <TrendingUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openStockDialog(
                                                            item,
                                                            'remove',
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrendingDown className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEditDialog(item)
                                                    }
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteItem(item)
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Item Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Inventory Item</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="medicine">
                                        Medicine
                                    </SelectItem>
                                    <SelectItem value="equipment">
                                        Equipment
                                    </SelectItem>
                                    <SelectItem value="supply">
                                        Supply
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sku: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="barcode">Barcode</Label>
                            <Input
                                id="barcode"
                                value={formData.barcode}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        barcode: e.target.value,
                                    })
                                }
                                placeholder="Optional barcode"
                            />
                        </div>
                        <div>
                            <Label htmlFor="maximum_stock">Maximum Stock</Label>
                            <Input
                                id="maximum_stock"
                                type="number"
                                value={formData.maximum_stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maximum_stock:
                                            parseInt(e.target.value) || 0,
                                    })
                                }
                                placeholder="Optional maximum stock"
                            />
                        </div>
                        <div>
                            <Label htmlFor="unit_price">Unit Price *</Label>
                            <Input
                                id="unit_price"
                                type="number"
                                step="0.01"
                                value={formData.unit_price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        unit_price:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder={`0.00 ${currency}`}
                            />
                        </div>
                        <div>
                            <Label htmlFor="current_stock">
                                Current Stock *
                            </Label>
                            <Input
                                id="current_stock"
                                type="number"
                                value={formData.current_stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        current_stock:
                                            parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="minimum_stock">
                                Minimum Stock *
                            </Label>
                            <Input
                                id="minimum_stock"
                                type="number"
                                value={formData.minimum_stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        minimum_stock:
                                            parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="unit_of_measure">
                                Unit of Measure *
                            </Label>
                            <Input
                                id="unit_of_measure"
                                value={formData.unit_of_measure}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        unit_of_measure: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="expiry_date">Expiry Date</Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        expiry_date: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="supplier">Supplier</Label>
                            <Input
                                id="supplier"
                                value={formData.supplier}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        supplier: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        location: e.target.value,
                                    })
                                }
                                placeholder="Storage location"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setAddDialogOpen(false);
                                resetForm();
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddItem} disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Item'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Item Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Inventory Item</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-type">Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="medicine">
                                        Medicine
                                    </SelectItem>
                                    <SelectItem value="equipment">
                                        Equipment
                                    </SelectItem>
                                    <SelectItem value="supply">
                                        Supply
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-sku">SKU *</Label>
                            <Input
                                id="edit-sku"
                                value={formData.sku}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sku: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-category">Category</Label>
                            <Input
                                id="edit-category"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-unit_price">
                                Unit Price *
                            </Label>
                            <Input
                                id="edit-unit_price"
                                type="number"
                                step="0.01"
                                value={formData.unit_price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        unit_price:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder={`0.00 ${currency}`}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-minimum_stock">
                                Minimum Stock *
                            </Label>
                            <Input
                                id="edit-minimum_stock"
                                type="number"
                                value={formData.minimum_stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        minimum_stock:
                                            parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-unit_of_measure">
                                Unit of Measure *
                            </Label>
                            <Input
                                id="edit-unit_of_measure"
                                value={formData.unit_of_measure}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        unit_of_measure: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-expiry_date">
                                Expiry Date
                            </Label>
                            <Input
                                id="edit-expiry_date"
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        expiry_date: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-supplier">Supplier</Label>
                            <Input
                                id="edit-supplier"
                                value={formData.supplier}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        supplier: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                                id="edit-location"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        location: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="edit-description">
                                Description
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateItem}>Update Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stock Action Dialog */}
            <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {stockAction === 'add' && 'Add Stock'}
                            {stockAction === 'remove' && 'Remove Stock'}
                            {stockAction === 'adjust' && 'Adjust Stock'}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <h4 className="font-medium">
                                    {selectedItem.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Current Stock: {selectedItem.current_stock}{' '}
                                    {selectedItem.unit_of_measure}
                                </p>
                            </div>

                            {stockAction === 'adjust' ? (
                                <div>
                                    <Label htmlFor="new_quantity">
                                        New Quantity *
                                    </Label>
                                    <Input
                                        id="new_quantity"
                                        type="number"
                                        value={stockFormData.new_quantity}
                                        onChange={(e) =>
                                            setStockFormData({
                                                ...stockFormData,
                                                new_quantity:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                    />
                                </div>
                            ) : (
                                <div>
                                    <Label htmlFor="quantity">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={stockFormData.quantity}
                                        onChange={(e) =>
                                            setStockFormData({
                                                ...stockFormData,
                                                quantity:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            {stockAction === 'add' && (
                                <div>
                                    <Label htmlFor="unit_price">
                                        Unit Price
                                    </Label>
                                    <Input
                                        id="unit_price"
                                        type="number"
                                        step="0.01"
                                        value={stockFormData.unit_price}
                                        onChange={(e) =>
                                            setStockFormData({
                                                ...stockFormData,
                                                unit_price:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            })
                                        }
                                        placeholder={`0.00 ${currency}`}
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={stockFormData.notes}
                                    onChange={(e) =>
                                        setStockFormData({
                                            ...stockFormData,
                                            notes: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="reference_number">
                                    Reference Number
                                </Label>
                                <Input
                                    id="reference_number"
                                    value={stockFormData.reference_number}
                                    onChange={(e) =>
                                        setStockFormData({
                                            ...stockFormData,
                                            reference_number: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setStockDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleStockAction}>
                            {stockAction === 'add' && 'Add Stock'}
                            {stockAction === 'remove' && 'Remove Stock'}
                            {stockAction === 'adjust' && 'Adjust Stock'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
