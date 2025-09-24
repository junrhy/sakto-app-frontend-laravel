import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import {
    Building2,
    Edit,
    Hash,
    Mail,
    Phone,
    Plus,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Biller {
    id: number;
    name: string;
    description?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    account_number?: string;
    category?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function Biller({ auth }: { auth: any }) {
    const [billers, setBillers] = useState<Biller[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(15);
    const [selectedBillers, setSelectedBillers] = useState<number[]>([]);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingBiller, setEditingBiller] = useState<Biller | null>(null);
    const [deletingBiller, setDeletingBiller] = useState<Biller | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contact_person: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        account_number: '',
        category: '',
        is_active: true,
    });

    // Categories for filtering
    const categories = [
        'Utilities',
        'Insurance',
        'Loans',
        'Credit Cards',
        'Subscriptions',
        'Rent/Mortgage',
        'Taxes',
        'Healthcare',
        'Education',
        'Entertainment',
        'Transportation',
        'Other',
    ];

    const fetchBillers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: '15',
                ...(searchTerm && { search: searchTerm }),
                ...(categoryFilter !== 'all' && { category: categoryFilter }),
                ...(statusFilter !== 'all' && {
                    is_active: statusFilter === 'active' ? 'true' : 'false',
                }),
            });

            const response = await axios.get(`/billers/list?${params}`);
            setBillers(response.data.data);
            setTotalPages(response.data.pagination.last_page);
            setTotalItems(response.data.pagination.total);
        } catch (error) {
            console.error('Error fetching billers:', error);
            toast.error('Failed to fetch billers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillers();
    }, [currentPage, searchTerm, categoryFilter, statusFilter]);

    const handleCreateBiller = async () => {
        try {
            await axios.post('/billers', formData);
            toast.success('Biller created successfully');
            setShowCreateDialog(false);
            resetForm();
            fetchBillers();
        } catch (error) {
            console.error('Error creating biller:', error);
            toast.error('Failed to create biller');
        }
    };

    const handleUpdateBiller = async () => {
        if (!editingBiller) return;
        try {
            await axios.put(`/billers/${editingBiller.id}`, formData);
            toast.success('Biller updated successfully');
            setShowEditDialog(false);
            setEditingBiller(null);
            resetForm();
            fetchBillers();
        } catch (error) {
            console.error('Error updating biller:', error);
            toast.error('Failed to update biller');
        }
    };

    const handleDeleteBiller = async (biller: Biller) => {
        setDeletingBiller(biller);
        setShowDeleteDialog(true);
    };

    const confirmDeleteBiller = async () => {
        if (!deletingBiller) return;

        try {
            await axios.delete(`/billers/${deletingBiller.id}`);
            toast.success('Biller deleted successfully');
            setShowDeleteDialog(false);
            setDeletingBiller(null);
            fetchBillers();
        } catch (error) {
            console.error('Error deleting biller:', error);
            toast.error('Failed to delete biller');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedBillers.length) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedBillers.length} billers? This action cannot be undone.`,
        );
        if (!confirmed) return;

        try {
            await axios.post('/billers/bulk-delete', {
                biller_ids: selectedBillers,
            });
            toast.success(
                `Successfully deleted ${selectedBillers.length} billers`,
            );
            setSelectedBillers([]);
            fetchBillers();
        } catch (error) {
            console.error('Error bulk deleting billers:', error);
            toast.error('Failed to delete billers');
        }
    };

    const handleBulkStatusUpdate = async (isActive: boolean) => {
        if (!selectedBillers.length) return;
        try {
            await axios.post('/billers/bulk-update-status', {
                biller_ids: selectedBillers,
                is_active: isActive,
            });
            toast.success(
                `Successfully updated ${selectedBillers.length} billers status`,
            );
            setSelectedBillers([]);
            fetchBillers();
        } catch (error) {
            console.error('Error bulk updating status:', error);
            toast.error('Failed to update billers status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            contact_person: '',
            email: '',
            phone: '',
            website: '',
            address: '',
            account_number: '',
            category: '',
            is_active: true,
        });
    };

    const openEditDialog = (biller: Biller) => {
        setEditingBiller(biller);
        setFormData({
            name: biller.name,
            description: biller.description || '',
            contact_person: biller.contact_person || '',
            email: biller.email || '',
            phone: biller.phone || '',
            website: biller.website || '',
            address: biller.address || '',
            account_number: biller.account_number || '',
            category: biller.category || '',
            is_active: biller.is_active,
        });
        setShowEditDialog(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="container mx-auto py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Billers</h1>
                        <p className="text-muted-foreground">
                            Manage your billers and service providers
                        </p>
                    </div>
                    <Dialog
                        open={showCreateDialog}
                        onOpenChange={setShowCreateDialog}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Biller
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Biller</DialogTitle>
                                <DialogDescription>
                                    Add a new biller or service provider to your
                                    system
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
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
                                        placeholder="Enter biller name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                category: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">
                                        Contact Person
                                    </Label>
                                    <Input
                                        id="contact_person"
                                        value={formData.contact_person}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                contact_person: e.target.value,
                                            })
                                        }
                                        placeholder="Contact person name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="biller@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={formData.website}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                website: e.target.value,
                                            })
                                        }
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_number">
                                        Account Number
                                    </Label>
                                    <Input
                                        id="account_number"
                                        value={formData.account_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                account_number: e.target.value,
                                            })
                                        }
                                        placeholder="Account number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Status</Label>
                                    <Select
                                        value={
                                            formData.is_active
                                                ? 'active'
                                                : 'inactive'
                                        }
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                is_active: value === 'active',
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: e.target.value,
                                        })
                                    }
                                    placeholder="Enter full address"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
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
                                    placeholder="Additional notes or description"
                                    rows={3}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateBiller}>
                                    Create Biller
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search billers..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Categories
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Billers List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Billers ({totalItems})</CardTitle>
                                <CardDescription>
                                    Manage your billers and service providers
                                </CardDescription>
                            </div>
                            {selectedBillers.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedBillers.length} selected
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleBulkStatusUpdate(true)
                                        }
                                    >
                                        Activate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleBulkStatusUpdate(false)
                                        }
                                    >
                                        Deactivate
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                    >
                                        Delete Selected
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="py-8 text-center">Loading...</div>
                        ) : billers.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No billers found. Create your first biller to
                                get started.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {billers.map((biller) => (
                                    <div
                                        key={biller.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Checkbox
                                                checked={selectedBillers.includes(
                                                    biller.id,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedBillers([
                                                            ...selectedBillers,
                                                            biller.id,
                                                        ]);
                                                    } else {
                                                        setSelectedBillers(
                                                            selectedBillers.filter(
                                                                (id) =>
                                                                    id !==
                                                                    biller.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                            />
                                            <div className="flex items-center space-x-3">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {biller.name}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        {biller.category && (
                                                            <span className="flex items-center">
                                                                <Hash className="mr-1 h-3 w-3" />
                                                                {
                                                                    biller.category
                                                                }
                                                            </span>
                                                        )}
                                                        {biller.contact_person && (
                                                            <span className="flex items-center">
                                                                <User className="mr-1 h-3 w-3" />
                                                                {
                                                                    biller.contact_person
                                                                }
                                                            </span>
                                                        )}
                                                        {biller.email && (
                                                            <span className="flex items-center">
                                                                <Mail className="mr-1 h-3 w-3" />
                                                                {biller.email}
                                                            </span>
                                                        )}
                                                        {biller.phone && (
                                                            <span className="flex items-center">
                                                                <Phone className="mr-1 h-3 w-3" />
                                                                {biller.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">
                                                    Created:{' '}
                                                    {formatDate(
                                                        biller.created_at,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    variant={
                                                        biller.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {biller.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEditDialog(biller)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteBiller(
                                                            biller,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.max(1, currentPage - 1),
                                            )
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.min(
                                                    totalPages,
                                                    currentPage + 1,
                                                ),
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Biller</DialogTitle>
                        <DialogDescription>
                            Update the biller information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_name">Name *</Label>
                            <Input
                                id="edit_name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter biller name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_contact_person">
                                Contact Person
                            </Label>
                            <Input
                                id="edit_contact_person"
                                value={formData.contact_person}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact_person: e.target.value,
                                    })
                                }
                                placeholder="Contact person name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_email">Email</Label>
                            <Input
                                id="edit_email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="biller@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_phone">Phone</Label>
                            <Input
                                id="edit_phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_website">Website</Label>
                            <Input
                                id="edit_website"
                                value={formData.website}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        website: e.target.value,
                                    })
                                }
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_account_number">
                                Account Number
                            </Label>
                            <Input
                                id="edit_account_number"
                                value={formData.account_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        account_number: e.target.value,
                                    })
                                }
                                placeholder="Account number"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_is_active">Status</Label>
                            <Select
                                value={
                                    formData.is_active ? 'active' : 'inactive'
                                }
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        is_active: value === 'active',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_address">Address</Label>
                        <Textarea
                            id="edit_address"
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                            placeholder="Enter full address"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_description">Description</Label>
                        <Textarea
                            id="edit_description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Additional notes or description"
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateBiller}>
                            Update Biller
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Biller</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {deletingBiller?.name}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteBiller}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
