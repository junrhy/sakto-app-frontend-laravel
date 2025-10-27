import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Edit, Filter, Plus, Search, ShoppingCart, Trash } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MenuItem } from '../types';

/**
 * Category Display Order Configuration
 * 
 * Define the order in which menu categories should be displayed.
 * Categories will appear in the order specified in this array.
 * Categories not listed here will appear at the end in alphabetical order.
 * 
 * To add a new category or change the order:
 * 1. Add/modify the category name in this array (must match backend category values)
 * 2. Update getCategoryDisplayName() function for the display name
 * 3. Optionally update getCategoryColor() function for custom colors
 */
const CATEGORY_ORDER = ['Main', 'Side', 'Drink'];

interface MenuTabProps {
    menuItems: MenuItem[];
    currency_symbol: string;
    canEdit: boolean;
    canDelete: boolean;
    onAddMenuItem: () => void;
    onEditMenuItem: (item: MenuItem) => void;
    onDeleteMenuItem: (id: number) => void;
    onBulkDeleteMenuItems: (ids: number[]) => void;
    onToggleAvailability?: (
        id: number,
        field: 'is_available_personal' | 'is_available_online',
        value: boolean,
    ) => void;
}

export const MenuTab: React.FC<MenuTabProps> = ({
    menuItems,
    currency_symbol,
    canEdit,
    canDelete,
    onAddMenuItem,
    onEditMenuItem,
    onDeleteMenuItem,
    onBulkDeleteMenuItems,
    onToggleAvailability,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const itemsPerPage = 10;

    // Sort categories based on CATEGORY_ORDER
    const getSortedCategories = useCallback((categories: string[]) => {
        return [...categories].sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a);
            const indexB = CATEGORY_ORDER.indexOf(b);

            // If both categories are in the order array, sort by their index
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            // If only a is in the order array, it comes first
            if (indexA !== -1) return -1;

            // If only b is in the order array, it comes first
            if (indexB !== -1) return 1;

            // If neither is in the order array, sort alphabetically
            return a.localeCompare(b);
        });
    }, []);

    // Get unique categories sorted by CATEGORY_ORDER
    const categories = useMemo(() => {
        if (!Array.isArray(menuItems)) return [];
        const uniqueCategories = Array.from(
            new Set(menuItems.map((item) => item.category)),
        );
        return getSortedCategories(uniqueCategories);
    }, [menuItems, getSortedCategories]);

    const filteredMenuItems = useMemo(() => {
        if (!Array.isArray(menuItems)) return [];

        const searchTermLower = (searchTerm || '').toLowerCase();
        return menuItems.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchTermLower) ||
                item.category.toLowerCase().includes(searchTermLower);
            const matchesCategory =
                selectedCategory === 'all' ||
                item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [menuItems, searchTerm, selectedCategory]);

    const paginatedMenuItems = useMemo(() => {
        if (!Array.isArray(filteredMenuItems)) return [];

        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMenuItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMenuItems, currentPage]);

    // Group paginated items by category
    const groupedMenuItems = useMemo(() => {
        if (!Array.isArray(paginatedMenuItems)) return {};

        return paginatedMenuItems.reduce((groups, item) => {
            const category = item.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {} as Record<string, MenuItem[]>);
    }, [paginatedMenuItems]);

    const pageCount = useMemo(
        () => Math.ceil(filteredMenuItems.length / itemsPerPage),
        [filteredMenuItems.length, itemsPerPage],
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedMenuItems(
                    paginatedMenuItems.map((item: MenuItem) => item.id),
                );
            } else {
                setSelectedMenuItems([]);
            }
        },
        [paginatedMenuItems],
    );

    const handleSelectItem = useCallback((itemId: number, checked: boolean) => {
        if (checked) {
            setSelectedMenuItems((prev) => [...prev, itemId]);
        } else {
            setSelectedMenuItems((prev) => prev.filter((id) => id !== itemId));
        }
    }, []);

    const handleBulkDelete = useCallback(() => {
        if (selectedMenuItems.length > 0) {
            onBulkDeleteMenuItems(selectedMenuItems);
            setSelectedMenuItems([]);
        }
    }, [selectedMenuItems, onBulkDeleteMenuItems]);

    const getCategoryColor = useCallback((category: string) => {
        switch (category.toLowerCase()) {
            case 'main':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'side':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'drink':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }, []);

    const getCategoryDisplayName = useCallback((category: string) => {
        switch (category.toLowerCase()) {
            case 'main':
                return 'Main Dishes';
            case 'side':
                return 'Side Dishes';
            case 'drink':
                return 'Drinks';
            default:
                return category;
        }
    }, []);

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        <ShoppingCart className="mr-2 h-4 w-4 text-purple-500" />
                        Menu Items
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4 flex flex-col gap-4">
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {canEdit && (
                                <Button
                                    onClick={onAddMenuItem}
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Menu Item
                                </Button>
                            )}
                            {canDelete && selectedMenuItems.length > 0 && (
                                <Button
                                    onClick={handleBulkDelete}
                                    variant="destructive"
                                    className="bg-red-500 text-white hover:bg-red-600"
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete Selected ({selectedMenuItems.length})
                                </Button>
                            )}
                        </div>

                        {/* Search and Filter Row */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                <Input
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-8 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                />
                            </div>

                            <div className="flex items-center gap-2 sm:w-64">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <Select
                                    value={selectedCategory}
                                    onValueChange={setSelectedCategory}
                                >
                                    <SelectTrigger className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
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
                                                {getCategoryDisplayName(category)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Select All Checkbox */}
                    {paginatedMenuItems.length > 0 && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                            <Checkbox
                                checked={
                                    selectedMenuItems.length ===
                                        paginatedMenuItems.length &&
                                    paginatedMenuItems.length > 0
                                }
                                onCheckedChange={handleSelectAll}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select All ({paginatedMenuItems.length} items)
                            </span>
                        </div>
                    )}

                    {/* Grouped Card Grid by Category */}
                    <div className="space-y-6 sm:space-y-8">
                        {getSortedCategories(
                            Object.keys(groupedMenuItems),
                        ).map((category) => {
                            const items = groupedMenuItems[category];
                            return (
                                <div key={category}>
                                    {/* Category Header */}
                                    <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                                        <div
                                            className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 ${getCategoryColor(category)}`}
                                        >
                                            <h3 className="text-base font-bold sm:text-lg">
                                                {getCategoryDisplayName(
                                                    category,
                                                )}
                                            </h3>
                                        </div>
                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600"></div>
                                        <span className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                            {items.length}{' '}
                                            {items.length === 1
                                                ? 'item'
                                                : 'items'}
                                        </span>
                                    </div>

                                    {/* Cards Grid for this Category */}
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                        {items.map((item) => (
                                            <Card
                                                key={item.id}
                                                className={`group overflow-hidden transition-all duration-200 hover:shadow-xl ${
                                                    selectedMenuItems.includes(
                                                        item.id,
                                                    )
                                                        ? 'ring-2 ring-purple-500'
                                                        : ''
                                                }`}
                                            >
                                                <div className="relative">
                                                    {/* Image */}
                                                    <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                        <img
                                                            src={
                                                                item.image ||
                                                                '/images/no-image.jpg'
                                                            }
                                                            alt={item.name}
                                                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                        />
                                                        {/* Checkbox Overlay */}
                                                        <div className="absolute left-2 top-2">
                                                            <div className="rounded-md bg-white/90 p-1 shadow-lg backdrop-blur-sm dark:bg-gray-800/90">
                                                                <Checkbox
                                                                    checked={selectedMenuItems.includes(
                                                                        item.id,
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) =>
                                                                        handleSelectItem(
                                                                            item.id,
                                                                            checked as boolean,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card Content */}
                                                    <CardContent className="p-3 sm:p-4">
                                                        {/* Name and Price */}
                                                        <div className="mb-2 sm:mb-3">
                                                            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base lg:text-lg dark:text-white">
                                                                {item.name}
                                                            </h3>
                                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                                <span className="text-xl font-bold text-purple-600 sm:text-2xl dark:text-purple-400">
                                                                    {
                                                                        currency_symbol
                                                                    }
                                                                    {item.price}
                                                                </span>
                                                                {item.delivery_fee && (
                                                                    <span className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                                                        Delivery:{' '}
                                                                        {
                                                                            currency_symbol
                                                                        }
                                                                        {
                                                                            item.delivery_fee
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Availability Section */}
                                                        <div className="mb-2 space-y-1.5 rounded-lg bg-gray-50 p-2 sm:mb-3 sm:space-y-2 sm:p-3 dark:bg-gray-700">
                                                            {/* In Store Availability */}
                                                            <div className="flex items-center justify-between gap-1">
                                                                <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                                                                    <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                        In Store
                                                                    </span>
                                                                    <span
                                                                        className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium sm:px-2 ${
                                                                            item.is_available_personal
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                        }`}
                                                                    >
                                                                        {item.is_available_personal
                                                                            ? 'Yes'
                                                                            : 'No'}
                                                                    </span>
                                                                </div>
                                                                {canEdit &&
                                                                    onToggleAvailability && (
                                                                        <Switch
                                                                            checked={
                                                                                item.is_available_personal
                                                                            }
                                                                            onCheckedChange={(
                                                                                checked,
                                                                            ) =>
                                                                                onToggleAvailability(
                                                                                    item.id,
                                                                                    'is_available_personal',
                                                                                    checked,
                                                                                )
                                                                            }
                                                                            className="data-[state=checked]:bg-green-600"
                                                                        />
                                                                    )}
                                                            </div>

                                                            {/* Online Availability */}
                                                            <div className="flex items-center justify-between gap-1">
                                                                <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                                                                    <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                        Online
                                                                    </span>
                                                                    <span
                                                                        className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium sm:px-2 ${
                                                                            item.is_available_online
                                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                        }`}
                                                                    >
                                                                        {item.is_available_online
                                                                            ? 'Yes'
                                                                            : 'No'}
                                                                    </span>
                                                                </div>
                                                                {canEdit &&
                                                                    onToggleAvailability && (
                                                                        <Switch
                                                                            checked={
                                                                                item.is_available_online
                                                                            }
                                                                            onCheckedChange={(
                                                                                checked,
                                                                            ) =>
                                                                                onToggleAvailability(
                                                                                    item.id,
                                                                                    'is_available_online',
                                                                                    checked,
                                                                                )
                                                                            }
                                                                            className="data-[state=checked]:bg-blue-600"
                                                                        />
                                                                    )}
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2">
                                                            {canEdit && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        onEditMenuItem(
                                                                            item,
                                                                        )
                                                                    }
                                                                    className="flex-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {canDelete && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        onDeleteMenuItem(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    className="flex-1"
                                                                    title="Delete"
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {Object.keys(groupedMenuItems).length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm || selectedCategory !== 'all'
                                    ? 'No menu items found matching your filters.'
                                    : 'No menu items found.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pageCount > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredMenuItems.length,
                                )}{' '}
                                of {filteredMenuItems.length} items
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 py-1 text-sm">
                                    Page {currentPage} of {pageCount}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
