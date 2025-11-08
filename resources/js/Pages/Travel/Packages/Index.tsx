import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Edit, Plus, RefreshCcw, Star, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
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
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';

import { useTravelApi } from '@/Pages/Travel/useTravelApi';
import type {
    AppCurrencySettings,
    PaginatedResponse,
    TravelPackage,
    TravelPackageStatus,
    TravelPackageType,
} from '@/Pages/Travel/travel';

interface TravelPackagesPageProps extends PageProps {
    packages: PaginatedResponse<TravelPackage>;
    filters: {
        status?: TravelPackageStatus | null;
        package_type?: TravelPackageType | null;
    };
    appCurrency?: AppCurrencySettings | null;
}

type PackageFormState = {
    title: string;
    slug: string;
    tagline: string;
    description: string;
    duration_days: string;
    duration_label: string;
    price: string;
    inclusions: string[];
    package_type: TravelPackageType;
    status: TravelPackageStatus;
    is_featured: boolean;
};

const DEFAULT_FORM_STATE: PackageFormState = {
    title: '',
    slug: '',
    tagline: '',
    description: '',
    duration_days: '',
    duration_label: '',
    price: '',
    inclusions: [],
    package_type: 'standard',
    status: 'draft',
    is_featured: false,
};

const STATUS_LABELS: Record<TravelPackageStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
};

const PACKAGE_TYPES: TravelPackageType[] = ['standard', 'premium', 'luxury'];

export default function TravelPackagesIndex({
    packages,
    filters,
    appCurrency,
}: TravelPackagesPageProps) {
    const [packageData, setPackageData] =
        useState<PaginatedResponse<TravelPackage>>(packages);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        TravelPackageStatus | 'all'
    >((filters.status as TravelPackageStatus) || 'all');
    const [typeFilter, setTypeFilter] = useState<TravelPackageType | 'all'>(
        (filters.package_type as TravelPackageType) || 'all',
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formState, setFormState] =
        useState<PackageFormState>(DEFAULT_FORM_STATE);
    const [activePackage, setActivePackage] = useState<TravelPackage | null>(
        null,
    );
    const [saving, setSaving] = useState(false);

    const {
        currencySettings,
        formatCurrency,
        fetchPackages: apiFetchPackages,
        logError,
    } = useTravelApi(appCurrency ?? null);

    useEffect(() => {
        setPackageData(packages);
    }, [packages]);

    const handleOpenCreate = () => {
        setFormState(DEFAULT_FORM_STATE);
        setActivePackage(null);
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (pkg: TravelPackage) => {
        setActivePackage(pkg);
        setFormState({
            title: pkg.title ?? '',
            slug: pkg.slug ?? '',
            tagline: pkg.tagline ?? '',
            description: pkg.description ?? '',
            duration_days: pkg.duration_days ? String(pkg.duration_days) : '',
            duration_label: pkg.duration_label ?? '',
            price: pkg.price ? String(pkg.price) : '',
            inclusions: pkg.inclusions ?? [],
            package_type: (pkg.package_type as TravelPackageType) || 'standard',
            status: (pkg.status as TravelPackageStatus) || 'draft',
            is_featured: Boolean(pkg.is_featured),
        });
        setIsEditOpen(true);
    };

    const handleCloseDialogs = () => {
        setIsCreateOpen(false);
        setIsEditOpen(false);
        setActivePackage(null);
        setFormState(DEFAULT_FORM_STATE);
    };

    const loadPackages = async (page?: number) => {
        try {
            setLoading(true);
            const data = await apiFetchPackages({
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                package_type: typeFilter !== 'all' ? typeFilter : undefined,
                page: page ?? packageData?.current_page ?? 1,
            });

            setPackageData(data);
        } catch (error: any) {
            logError(error, 'fetch packages');
            toast.error('Failed to fetch travel packages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePackage = async () => {
        try {
            setSaving(true);
            const payload = {
                ...formState,
                duration_days: formState.duration_days
                    ? Number(formState.duration_days)
                    : null,
                price: formState.price ? Number(formState.price) : 0,
            };

            if (activePackage) {
                await axios.put(
                    route('travel.packages.update', activePackage.id),
                    payload,
                );
                toast.success('Travel package updated successfully.');
            } else {
                await axios.post(route('travel.packages.store'), payload);
                toast.success('Travel package created successfully.');
            }

            handleCloseDialogs();
            await loadPackages();
        } catch (error: any) {
            if (error?.response?.status === 422) {
                const message =
                    error.response.data?.message ||
                    'Validation error. Please review the form and try again.';
                toast.error(message);
            } else {
                logError(error, 'save package');
                toast.error('Failed to save travel package. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePackage = async (pkg: TravelPackage) => {
        try {
            setLoading(true);
            await axios.delete(route('travel.packages.destroy', pkg.id));
            toast.success('Travel package deleted successfully.');
            await loadPackages(
                packageData?.data.length === 1 && packageData.current_page > 1
                    ? packageData.current_page - 1
                    : packageData.current_page,
            );
        } catch (error: any) {
            logError(error, 'delete package');
            toast.error('Failed to delete travel package. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inclusionText = formState.inclusions.join('\\n');

    const handleInclusionChange = (value: string) => {
        setFormState((prev) => ({
            ...prev,
            inclusions: value
                .split('\\n')
                .map((item) => item.trim())
                .filter(Boolean),
        }));
    };

    const handleRefresh = () => {
        loadPackages();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void handleSavePackage();
    };

    const cardDescription = useMemo(() => {
        if (!packageData?.total) {
            return 'Manage and curate exciting travel packages for your customers.';
        }
        return `Showing ${packageData.data.length} of ${packageData.total} packages.`;
    }, [packageData]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
                            Travel Packages
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Configure your tour offerings and highlight premium
                            experiences.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Package
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Travel Packages" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            Packages Overview
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {cardDescription}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid gap-3 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    placeholder="Search packages..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) =>
                                        setStatusFilter(
                                            value as
                                                | TravelPackageStatus
                                                | 'all',
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="published">
                                            Published
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Package Type</Label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={(value) =>
                                        setTypeFilter(
                                            value as TravelPackageType | 'all',
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by package type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All types
                                        </SelectItem>
                                        {PACKAGE_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() +
                                                    type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mb-4 flex items-center gap-2">
                            <Button
                                onClick={() => loadPackages()}
                                disabled={loading}
                            >
                                Apply Filters
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setTypeFilter('all');
                                    loadPackages(1);
                                }}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                        </div>

                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Package
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Type
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Duration
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Price
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Featured
                                            </TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-white">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center text-gray-900 dark:text-white"
                                                >
                                                    Loading packages...
                                                </TableCell>
                                            </TableRow>
                                        ) : packageData?.data?.length ? (
                                            packageData.data.map((pkg) => (
                                                <TableRow
                                                    key={pkg.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {pkg.title}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {pkg.tagline}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="capitalize text-gray-900 dark:text-white">
                                                        {pkg.package_type}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {pkg.duration_label ||
                                                            `${pkg.duration_days ?? '-'} days`}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {formatCurrency(
                                                            pkg.price,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <Badge
                                                            variant={
                                                                pkg.status ===
                                                                'published'
                                                                    ? 'default'
                                                                    : pkg.status ===
                                                                        'draft'
                                                                      ? 'secondary'
                                                                      : 'outline'
                                                            }
                                                        >
                                                            {STATUS_LABELS[
                                                                pkg.status as TravelPackageStatus
                                                            ] ?? pkg.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {pkg.is_featured ? (
                                                            <div className="flex items-center gap-1 text-amber-500">
                                                                <Star className="h-4 w-4 fill-current" />
                                                                <span>
                                                                    Featured
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">
                                                                Standard
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <span className="sr-only">
                                                                        Open
                                                                        menu
                                                                    </span>
                                                                    <div className="h-4 w-4">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                            className="h-4 w-4"
                                                                        >
                                                                            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                                                                        </svg>
                                                                    </div>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleOpenEdit(
                                                                            pkg,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={() =>
                                                                        handleDeletePackage(
                                                                            pkg,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center text-gray-900 dark:text-white"
                                                >
                                                    No travel packages found.
                                                    Create your first package to
                                                    get started.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>
                                Page {packageData?.current_page ?? 1} of{' '}
                                {packageData?.last_page ?? 1}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        loadPackages(
                                            (packageData?.current_page ?? 1) -
                                                1,
                                        )
                                    }
                                    disabled={
                                        loading ||
                                        (packageData?.current_page ?? 1) <= 1
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        loadPackages(
                                            (packageData?.current_page ?? 1) +
                                                1,
                                        )
                                    }
                                    disabled={
                                        loading ||
                                        (packageData?.current_page ?? 1) >=
                                            (packageData?.last_page ?? 1)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={isCreateOpen || isEditOpen}
                onOpenChange={handleCloseDialogs}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {activePackage
                                ? 'Edit Travel Package'
                                : 'Create Travel Package'}
                        </DialogTitle>
                        <DialogDescription>
                            {activePackage
                                ? 'Update the details of your travel package.'
                                : 'Provide the information below to publish a new travel package.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="title">Package Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formState.title}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            title: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    placeholder="boracay-getaway-package"
                                    value={formState.slug}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            slug: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                                id="tagline"
                                placeholder="Short highlight for this package"
                                value={formState.tagline}
                                onChange={(event) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        tagline: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                rows={5}
                                placeholder="Detailed description, activities, and value proposition."
                                value={formState.description}
                                onChange={(event) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        description: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="duration_days">
                                    Duration (Days)
                                </Label>
                                <Input
                                    id="duration_days"
                                    type="number"
                                    min="1"
                                    value={formState.duration_days}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            duration_days: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="duration_label">
                                    Duration Label
                                </Label>
                                <Input
                                    id="duration_label"
                                    placeholder="3 days, 2 nights"
                                    value={formState.duration_label}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            duration_label: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="price">Base Price</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formState.price}
                                onChange={(event) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        price: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="inclusions">
                                Inclusions (one per line)
                            </Label>
                            <Textarea
                                id="inclusions"
                                rows={4}
                                placeholder="Hotel accommodation\nDaily breakfast\nGuided tours\nAirport transfers"
                                value={inclusionText}
                                onChange={(event) =>
                                    handleInclusionChange(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Package Type</Label>
                                <Select
                                    value={formState.package_type}
                                    onValueChange={(value) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            package_type:
                                                value as TravelPackageType,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select package type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PACKAGE_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() +
                                                    type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formState.status}
                                    onValueChange={(value) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            status: value as TravelPackageStatus,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="published">
                                            Published
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_featured"
                                checked={formState.is_featured}
                                onCheckedChange={(value) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        is_featured: Boolean(value),
                                    }))
                                }
                            />
                            <Label htmlFor="is_featured">
                                Feature this package
                            </Label>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCloseDialogs}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Package'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
