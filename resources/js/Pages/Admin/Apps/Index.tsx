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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { getIconByName } from '@/lib/iconLibrary';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    EyeSlashIcon,
    FunnelIcon,
    ListBulletIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    Squares2X2Icon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Head, Link as InertiaLink, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface App {
    id: number;
    title: string;
    route: string;
    visible: boolean;
    description: string;
    price: number;
    categories: string[];
    comingSoon: boolean;
    pricingType: 'free' | 'one-time' | 'subscription';
    includedInPlans?: string[];
    bgColor: string;
    icon?: string;
    rating: number;
}

interface Props {
    apps: App[];
}

export default function Index({ apps }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [selectedPricingType, setSelectedPricingType] = useState<
        string | null
    >(null);
    const [selectedVisibility, setSelectedVisibility] = useState<string | null>(
        null,
    );
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedApps, setSelectedApps] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({
        visible: null as boolean | null,
        pricingType: null as string | null,
        price: null as number | null,
    });

    const { delete: destroy, patch } = useForm();

    // Get unique categories and pricing types
    const categories = Array.from(
        new Set(apps.flatMap((app) => app.categories)),
    ).sort();
    const pricingTypes = Array.from(
        new Set(apps.map((app) => app.pricingType)),
    ).sort();

    // Filter apps based on search and filters
    const filteredApps = apps.filter((app) => {
        const matchesSearch =
            app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            !selectedCategory || app.categories.includes(selectedCategory);
        const matchesPricingType =
            !selectedPricingType || app.pricingType === selectedPricingType;
        const matchesVisibility =
            !selectedVisibility ||
            (selectedVisibility === 'visible' && app.visible) ||
            (selectedVisibility === 'hidden' && !app.visible);
        return (
            matchesSearch &&
            matchesCategory &&
            matchesPricingType &&
            matchesVisibility
        );
    });

    // Bulk operations
    const handleSelectAll = () => {
        if (selectedApps.length === filteredApps.length) {
            setSelectedApps([]);
        } else {
            setSelectedApps(filteredApps.map((app) => app.id));
        }
    };

    const handleSelectApp = (appId: number) => {
        setSelectedApps((prev) =>
            prev.includes(appId)
                ? prev.filter((id) => id !== appId)
                : [...prev, appId],
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedPricingType(null);
        setSelectedVisibility(null);
    };

    const handleBulkEdit = () => {
        if (selectedApps.length === 0) return;

        const updates: any = {};
        if (bulkEditData.visible !== null)
            updates.visible = bulkEditData.visible;
        if (bulkEditData.pricingType !== null)
            updates.pricingType = bulkEditData.pricingType;
        if (bulkEditData.price !== null) updates.price = bulkEditData.price;

        if (Object.keys(updates).length === 0) return;

        // Update each selected app
        selectedApps.forEach((appId) => {
            patch(route('admin.apps.update', appId), {
                ...updates,
                _method: 'PATCH',
            });
        });

        // Reset bulk edit state
        setShowBulkEdit(false);
        setBulkEditData({ visible: null, pricingType: null, price: null });
        setSelectedApps([]);
    };

    const cancelBulkEdit = () => {
        setShowBulkEdit(false);
        setBulkEditData({ visible: null, pricingType: null, price: null });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this app?')) {
            destroy(route('admin.apps.destroy', id));
        }
    };

    const handleReorder = (fromIndex: number, toIndex: number) => {
        const newOrder = [...filteredApps];
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);

        // Create order mapping where keys are new positions and values are app IDs
        const orderMapping: { [key: number]: number } = {};
        newOrder.forEach((app, index) => {
            orderMapping[index] = app.id;
        });

        // Update the order via API
        fetch(route('admin.apps.reorder'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                order: orderMapping,
            }),
        }).then(() => {
            window.location.reload();
        });
    };

    return (
        <AdminLayout
            title="Apps Management"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Apps Management
                </h2>
            }
        >
            <Head title="Apps Management" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Application Modules
                                </h1>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                    {filteredApps.length} of {apps.length} apps
                                    {selectedApps.length > 0 &&
                                        ` • ${selectedApps.length} selected`}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <InertiaLink href={route('admin.apps.create')}>
                                    <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add New App
                                    </Button>
                                </InertiaLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Controls */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search apps by name or description..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={
                                        viewMode === 'grid'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Squares2X2Icon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={
                                        viewMode === 'list'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    <ListBulletIcon className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Filter Toggle */}
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={
                                    showFilters
                                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                        : ''
                                }
                            >
                                <FunnelIcon className="mr-2 h-4 w-4" />
                                Filters
                                {(selectedCategory ||
                                    selectedPricingType ||
                                    selectedVisibility) && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                                    >
                                        {
                                            [
                                                selectedCategory,
                                                selectedPricingType,
                                                selectedVisibility,
                                            ].filter(Boolean).length
                                        }
                                    </Badge>
                                )}
                            </Button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Category
                                        </label>
                                        <select
                                            value={selectedCategory || ''}
                                            onChange={(e) =>
                                                setSelectedCategory(
                                                    e.target.value || null,
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">
                                                All Categories
                                            </option>
                                            {categories.map((category) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Pricing Type
                                        </label>
                                        <select
                                            value={selectedPricingType || ''}
                                            onChange={(e) =>
                                                setSelectedPricingType(
                                                    e.target.value || null,
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">
                                                All Pricing Types
                                            </option>
                                            {pricingTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Visibility
                                        </label>
                                        <select
                                            value={selectedVisibility || ''}
                                            onChange={(e) =>
                                                setSelectedVisibility(
                                                    e.target.value || null,
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Apps</option>
                                            <option value="visible">
                                                Visible Only
                                            </option>
                                            <option value="hidden">
                                                Hidden Only
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        size="sm"
                                    >
                                        <XMarkIcon className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedApps.length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {selectedApps.length} app
                                {selectedApps.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setShowBulkEdit(!showBulkEdit)
                                    }
                                    className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                                >
                                    Bulk Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Edit Form */}
                {showBulkEdit && selectedApps.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Bulk Edit {selectedApps.length} App
                                    {selectedApps.length > 1 ? 's' : ''}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelBulkEdit}
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Visibility
                                    </label>
                                    <select
                                        value={
                                            bulkEditData.visible === null
                                                ? ''
                                                : bulkEditData.visible.toString()
                                        }
                                        onChange={(e) =>
                                            setBulkEditData((prev) => ({
                                                ...prev,
                                                visible:
                                                    e.target.value === ''
                                                        ? null
                                                        : e.target.value ===
                                                          'true',
                                            }))
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">No change</option>
                                        <option value="true">
                                            Make visible
                                        </option>
                                        <option value="false">
                                            Make hidden
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Pricing Type
                                    </label>
                                    <select
                                        value={bulkEditData.pricingType || ''}
                                        onChange={(e) =>
                                            setBulkEditData((prev) => ({
                                                ...prev,
                                                pricingType:
                                                    e.target.value || null,
                                            }))
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">No change</option>
                                        {pricingTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Price
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="No change"
                                        value={bulkEditData.price || ''}
                                        onChange={(e) =>
                                            setBulkEditData((prev) => ({
                                                ...prev,
                                                price: e.target.value
                                                    ? parseFloat(e.target.value)
                                                    : null,
                                            }))
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelBulkEdit}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBulkEdit}
                                    disabled={
                                        bulkEditData.visible === null &&
                                        bulkEditData.pricingType === null &&
                                        bulkEditData.price === null
                                    }
                                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                                >
                                    Apply Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Apps Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredApps.map((app, index) => (
                            <Card
                                key={app.id}
                                className="group relative transition-shadow duration-200 hover:shadow-lg"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-1 items-start gap-3">
                                            <Checkbox
                                                checked={selectedApps.includes(
                                                    app.id,
                                                )}
                                                onCheckedChange={() =>
                                                    handleSelectApp(app.id)
                                                }
                                                className="mt-1"
                                            />
                                            <div className="flex flex-1 items-start gap-3">
                                                {app.icon && (
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                                        {React.createElement(
                                                            getIconByName(
                                                                app.icon,
                                                            ),
                                                            {
                                                                className:
                                                                    'w-5 h-5 text-gray-600 dark:text-gray-300',
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <CardTitle className="truncate text-lg">
                                                        {app.title}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1 line-clamp-2 text-sm">
                                                        {app.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <EllipsisVerticalIcon className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink
                                                        href={route(
                                                            'admin.apps.edit',
                                                            app.id,
                                                        )}
                                                    >
                                                        <PencilIcon className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {index > 0 && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleReorder(
                                                                index,
                                                                index - 1,
                                                            )
                                                        }
                                                    >
                                                        <ArrowUpIcon className="mr-2 h-4 w-4" />
                                                        Move Up
                                                    </DropdownMenuItem>
                                                )}
                                                {index <
                                                    filteredApps.length - 1 && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleReorder(
                                                                index,
                                                                index + 1,
                                                            )
                                                        }
                                                    >
                                                        <ArrowDownIcon className="mr-2 h-4 w-4" />
                                                        Move Down
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDelete(app.id)
                                                    }
                                                    className="text-red-600 dark:text-red-400"
                                                >
                                                    <TrashIcon className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Primary Status */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {app.visible ? (
                                                <Badge
                                                    variant="default"
                                                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                >
                                                    <EyeIcon className="mr-1 h-3 w-3" />
                                                    Visible
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <EyeSlashIcon className="mr-1 h-3 w-3" />
                                                    Hidden
                                                </Badge>
                                            )}
                                            {app.comingSoon && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-200"
                                                >
                                                    Coming Soon
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                ${app.price.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {app.pricingType}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-1">
                                        {app.categories
                                            .slice(0, 2)
                                            .map((category) => (
                                                <Badge
                                                    key={category}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {category}
                                                </Badge>
                                            ))}
                                        {app.categories.length > 2 && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                +{app.categories.length - 2}{' '}
                                                more
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            {app.bgColor &&
                                                app.bgColor !== '' &&
                                                !app.bgColor.includes(
                                                    'bg-',
                                                ) && (
                                                    <div
                                                        className="h-4 w-4 rounded border border-gray-200 dark:border-gray-600"
                                                        style={{
                                                            backgroundColor:
                                                                app.bgColor.includes(
                                                                    '#',
                                                                ) ||
                                                                app.bgColor.includes(
                                                                    'rgb',
                                                                )
                                                                    ? app.bgColor
                                                                    : `#${app.bgColor}`,
                                                        }}
                                                        title={`Theme color: ${app.bgColor}`}
                                                    />
                                                )}
                                            <span className="text-xs text-gray-500">
                                                ⭐ {app.rating}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <InertiaLink
                                                    href={route(
                                                        'admin.apps.edit',
                                                        app.id,
                                                    )}
                                                >
                                                    <PencilIcon className="h-3 w-3" />
                                                </InertiaLink>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <Checkbox
                                                checked={
                                                    selectedApps.length ===
                                                        filteredApps.length &&
                                                    filteredApps.length > 0
                                                }
                                                onCheckedChange={
                                                    handleSelectAll
                                                }
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            App
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Pricing
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Categories
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredApps.map((app, index) => (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedApps.includes(
                                                        app.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleSelectApp(app.id)
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {app.icon && (
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                                            {React.createElement(
                                                                getIconByName(
                                                                    app.icon,
                                                                ),
                                                                {
                                                                    className:
                                                                        'w-5 h-5 text-gray-600 dark:text-gray-300',
                                                                },
                                                            )}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {app.title}
                                                        </div>
                                                        <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                                                            {app.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {app.visible ? (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        >
                                                            <EyeIcon className="mr-1 h-3 w-3" />
                                                            Visible
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            <EyeSlashIcon className="mr-1 h-3 w-3" />
                                                            Hidden
                                                        </Badge>
                                                    )}
                                                    {app.comingSoon && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-200"
                                                        >
                                                            Coming Soon
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        $
                                                        {app.price.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {app.pricingType}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {app.categories
                                                        .slice(0, 2)
                                                        .map((category) => (
                                                            <Badge
                                                                key={category}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {category}
                                                            </Badge>
                                                        ))}
                                                    {app.categories.length >
                                                        2 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            +
                                                            {app.categories
                                                                .length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <InertiaLink
                                                            href={route(
                                                                'admin.apps.edit',
                                                                app.id,
                                                            )}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </InertiaLink>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <EllipsisVerticalIcon className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {index > 0 && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleReorder(
                                                                            index,
                                                                            index -
                                                                                1,
                                                                        )
                                                                    }
                                                                >
                                                                    <ArrowUpIcon className="mr-2 h-4 w-4" />
                                                                    Move Up
                                                                </DropdownMenuItem>
                                                            )}
                                                            {index <
                                                                filteredApps.length -
                                                                    1 && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleReorder(
                                                                            index,
                                                                            index +
                                                                                1,
                                                                        )
                                                                    }
                                                                >
                                                                    <ArrowDownIcon className="mr-2 h-4 w-4" />
                                                                    Move Down
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        app.id,
                                                                    )
                                                                }
                                                                className="text-red-600 dark:text-red-400"
                                                            >
                                                                <TrashIcon className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredApps.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="py-12 text-center">
                            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No apps found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchQuery ||
                                selectedCategory ||
                                selectedPricingType ||
                                selectedVisibility
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by creating a new app.'}
                            </p>
                            <div className="mt-6">
                                <InertiaLink href={route('admin.apps.create')}>
                                    <Button>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add New App
                                    </Button>
                                </InertiaLink>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
