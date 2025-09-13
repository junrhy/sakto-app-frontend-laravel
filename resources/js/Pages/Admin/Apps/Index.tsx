import { Head, Link as InertiaLink, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { 
    PlusIcon, 
    MagnifyingGlassIcon, 
    EllipsisVerticalIcon,
    EyeIcon,
    EyeSlashIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/Layouts/Admin/AdminLayout';

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
    rating: number;
}

interface Props {
    apps: App[];
}

export default function Index({ apps }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPricingType, setSelectedPricingType] = useState<string | null>(null);
    const [selectedVisibility, setSelectedVisibility] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedApps, setSelectedApps] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({
        visible: null as boolean | null,
        pricingType: null as string | null,
        price: null as number | null
    });
    
    const { delete: destroy, patch } = useForm();

    // Get unique categories and pricing types
    const categories = Array.from(new Set(apps.flatMap(app => app.categories))).sort();
    const pricingTypes = Array.from(new Set(apps.map(app => app.pricingType))).sort();

    // Filter apps based on search and filters
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || app.categories.includes(selectedCategory);
        const matchesPricingType = !selectedPricingType || app.pricingType === selectedPricingType;
        const matchesVisibility = !selectedVisibility || 
            (selectedVisibility === 'visible' && app.visible) ||
            (selectedVisibility === 'hidden' && !app.visible);
        return matchesSearch && matchesCategory && matchesPricingType && matchesVisibility;
    });

    // Bulk operations
    const handleSelectAll = () => {
        if (selectedApps.length === filteredApps.length) {
            setSelectedApps([]);
        } else {
            setSelectedApps(filteredApps.map(app => app.id));
        }
    };

    const handleSelectApp = (appId: number) => {
        setSelectedApps(prev => 
            prev.includes(appId) 
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
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
        if (bulkEditData.visible !== null) updates.visible = bulkEditData.visible;
        if (bulkEditData.pricingType !== null) updates.pricingType = bulkEditData.pricingType;
        if (bulkEditData.price !== null) updates.price = bulkEditData.price;
        
        if (Object.keys(updates).length === 0) return;
        
        // Update each selected app
        selectedApps.forEach(appId => {
            patch(route('admin.apps.update', appId), {
                ...updates,
                _method: 'PATCH'
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
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                order: orderMapping
            })
        }).then(() => {
            window.location.reload();
        });
    };

    return (
        <AdminLayout
            title="Apps Management"
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Apps Management</h2>}
        >
            <Head title="Apps Management" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Modules</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {filteredApps.length} of {apps.length} apps
                                    {selectedApps.length > 0 && ` • ${selectedApps.length} selected`}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <InertiaLink href={route('admin.apps.create')}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add New App
                                    </Button>
                                </InertiaLink>
                            </div>
                        </div>
                    </div>
                    </div>

                {/* Search and Controls */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Bar */}
                        <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                type="text"
                                    placeholder="Search apps by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Squares2X2Icon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
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
                                className={showFilters ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}
                            >
                                <FunnelIcon className="h-4 w-4 mr-2" />
                                Filters
                                {(selectedCategory || selectedPricingType || selectedVisibility) && (
                                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                        {[selectedCategory, selectedPricingType, selectedVisibility].filter(Boolean).length}
                                    </Badge>
                                )}
                            </Button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Pricing Type
                                        </label>
                                        <select
                                            value={selectedPricingType || ''}
                                            onChange={(e) => setSelectedPricingType(e.target.value || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">All Pricing Types</option>
                                            {pricingTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Visibility
                                        </label>
                                        <select
                                            value={selectedVisibility || ''}
                                            onChange={(e) => setSelectedVisibility(e.target.value || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="">All Apps</option>
                                            <option value="visible">Visible Only</option>
                                            <option value="hidden">Hidden Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline" onClick={clearFilters} size="sm">
                                        <XMarkIcon className="h-4 w-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedApps.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {selectedApps.length} app{selectedApps.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setShowBulkEdit(!showBulkEdit)}
                                    className="text-blue-700 border-blue-300 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/20"
                                >
                                    Bulk Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Edit Form */}
                {showBulkEdit && selectedApps.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Bulk Edit {selectedApps.length} App{selectedApps.length > 1 ? 's' : ''}
                                </h3>
                                <Button variant="ghost" size="sm" onClick={cancelBulkEdit}>
                                    <XMarkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Visibility
                                    </label>
                                    <select
                                        value={bulkEditData.visible === null ? '' : bulkEditData.visible.toString()}
                                        onChange={(e) => setBulkEditData(prev => ({ 
                                            ...prev, 
                                            visible: e.target.value === '' ? null : e.target.value === 'true' 
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">No change</option>
                                        <option value="true">Make visible</option>
                                        <option value="false">Make hidden</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Pricing Type
                                    </label>
                                    <select
                                        value={bulkEditData.pricingType || ''}
                                        onChange={(e) => setBulkEditData(prev => ({ 
                                            ...prev, 
                                            pricingType: e.target.value || null 
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">No change</option>
                                        {pricingTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Price
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="No change"
                                        value={bulkEditData.price || ''}
                                        onChange={(e) => setBulkEditData(prev => ({ 
                                            ...prev, 
                                            price: e.target.value ? parseFloat(e.target.value) : null 
                                        }))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="outline" onClick={cancelBulkEdit}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleBulkEdit}
                                    disabled={bulkEditData.visible === null && bulkEditData.pricingType === null && bulkEditData.price === null}
                                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                                >
                                    Apply Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Apps Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredApps.map((app, index) => (
                            <Card key={app.id} className="relative group hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Checkbox
                                                checked={selectedApps.includes(app.id)}
                                                onCheckedChange={() => handleSelectApp(app.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg truncate">{app.title}</CardTitle>
                                                <CardDescription className="mt-1 line-clamp-2 text-sm">
                                                {app.description}
                                            </CardDescription>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <EllipsisVerticalIcon className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink href={route('admin.apps.edit', app.id)}>
                                                        <PencilIcon className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {index > 0 && (
                                                    <DropdownMenuItem onClick={() => handleReorder(index, index - 1)}>
                                                        <ArrowUpIcon className="h-4 w-4 mr-2" />
                                                        Move Up
                                                    </DropdownMenuItem>
                                                )}
                                                {index < filteredApps.length - 1 && (
                                                    <DropdownMenuItem onClick={() => handleReorder(index, index + 1)}>
                                                        <ArrowDownIcon className="h-4 w-4 mr-2" />
                                                        Move Down
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDelete(app.id)}
                                                    className="text-red-600 dark:text-red-400"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-2" />
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
                                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                Visible
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <EyeSlashIcon className="h-3 w-3 mr-1" />
                                                Hidden
                                            </Badge>
                                        )}
                                        {app.comingSoon && (
                                            <Badge variant="outline" className="border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-200">
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
                                        {app.categories.slice(0, 2).map(category => (
                                            <Badge key={category} variant="secondary" className="text-xs">
                                                {category}
                                            </Badge>
                                        ))}
                                        {app.categories.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{app.categories.length - 2} more
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                            {app.bgColor && app.bgColor !== '' && !app.bgColor.includes('bg-') && (
                                        <div 
                                                    className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600"
                                            style={{ 
                                                        backgroundColor: app.bgColor.includes('#') || app.bgColor.includes('rgb') 
                                                            ? app.bgColor 
                                                            : `#${app.bgColor}`
                                            }}
                                                    title={`Theme color: ${app.bgColor}`}
                                        />
                                            )}
                                            <span className="text-xs text-gray-500">⭐ {app.rating}</span>
                                    </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" asChild>
                                                <InertiaLink href={route('admin.apps.edit', app.id)}>
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
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <Checkbox
                                                checked={selectedApps.length === filteredApps.length && filteredApps.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            App
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Pricing
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Categories
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredApps.map((app, index) => (
                                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedApps.includes(app.id)}
                                                    onCheckedChange={() => handleSelectApp(app.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {app.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                        {app.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {app.visible ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            <EyeIcon className="h-3 w-3 mr-1" />
                                                            Visible
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            <EyeSlashIcon className="h-3 w-3 mr-1" />
                                                            Hidden
                                                        </Badge>
                                                    )}
                                                    {app.comingSoon && (
                                                        <Badge variant="outline" className="border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-200">
                                                            Coming Soon
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        ${app.price.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {app.pricingType}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {app.categories.slice(0, 2).map(category => (
                                                        <Badge key={category} variant="secondary" className="text-xs">
                                                            {category}
                                                        </Badge>
                                                    ))}
                                                    {app.categories.length > 2 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{app.categories.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <InertiaLink href={route('admin.apps.edit', app.id)}>
                                                            <PencilIcon className="h-4 w-4" />
                                                        </InertiaLink>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <EllipsisVerticalIcon className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {index > 0 && (
                                                                <DropdownMenuItem onClick={() => handleReorder(index, index - 1)}>
                                                                    <ArrowUpIcon className="h-4 w-4 mr-2" />
                                                                    Move Up
                                                                </DropdownMenuItem>
                                                            )}
                                                            {index < filteredApps.length - 1 && (
                                                                <DropdownMenuItem onClick={() => handleReorder(index, index + 1)}>
                                                                    <ArrowDownIcon className="h-4 w-4 mr-2" />
                                                                    Move Down
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(app.id)}
                                                                className="text-red-600 dark:text-red-400"
                                                            >
                                                                <TrashIcon className="h-4 w-4 mr-2" />
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
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No apps found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchQuery || selectedCategory || selectedPricingType || selectedVisibility
                                    ? "Try adjusting your search or filter criteria."
                                    : "Get started by creating a new app."}
                            </p>
                            <div className="mt-6">
                                <InertiaLink href={route('admin.apps.create')}>
                                    <Button>
                                        <PlusIcon className="h-4 w-4 mr-2" />
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
