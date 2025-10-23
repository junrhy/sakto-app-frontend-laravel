import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Edit, Plus, Search, ShoppingCart, Trash } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { MenuItem } from '../types';

interface MenuTabProps {
    menuItems: MenuItem[];
    currency_symbol: string;
    canEdit: boolean;
    canDelete: boolean;
    onAddMenuItem: () => void;
    onEditMenuItem: (item: MenuItem) => void;
    onDeleteMenuItem: (id: number) => void;
    onBulkDeleteMenuItems: (ids: number[]) => void;
    onToggleAvailability?: (id: number, field: 'is_available_personal' | 'is_available_online', value: boolean) => void;
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
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const itemsPerPage = 10;

    const filteredMenuItems = useMemo(() => {
        if (!Array.isArray(menuItems)) return [];

        const searchTermLower = (searchTerm || '').toLowerCase();
        return menuItems.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTermLower) ||
                item.category.toLowerCase().includes(searchTermLower),
        );
    }, [menuItems, searchTerm]);

    const paginatedMenuItems = useMemo(() => {
        if (!Array.isArray(filteredMenuItems)) return [];

        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMenuItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMenuItems, currentPage]);

    const pageCount = useMemo(
        () => Math.ceil(filteredMenuItems.length / itemsPerPage),
        [filteredMenuItems.length, itemsPerPage],
    );

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
                    <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
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
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                            <Input
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white pl-8 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={
                                            selectedMenuItems.length ===
                                                paginatedMenuItems.length &&
                                            paginatedMenuItems.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Image
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Name
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Category
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Price
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Delivery Fee
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Availability
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedMenuItems.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="border-gray-200 dark:border-gray-600"
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedMenuItems.includes(
                                                item.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                handleSelectItem(
                                                    item.id,
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <img
                                            src={
                                                item.image ||
                                                '/images/no-image.jpg'
                                            }
                                            alt={item.name}
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(item.category)}`}
                                        >
                                            {item.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {currency_symbol}
                                        {item.price}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {item.delivery_fee
                                            ? `${currency_symbol}${item.delivery_fee}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-3">
                                            {/* In Store Availability Toggle */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        In Store
                                                    </span>
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs ${
                                                            item.is_available_personal
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}
                                                    >
                                                        {item.is_available_personal ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>
                                                {canEdit && onToggleAvailability && (
                                                    <Switch
                                                        checked={item.is_available_personal}
                                                        onCheckedChange={(checked) =>
                                                            onToggleAvailability(item.id, 'is_available_personal', checked)
                                                        }
                                                        className="data-[state=checked]:bg-green-600"
                                                    />
                                                )}
                                            </div>
                                            
                                            {/* Online Availability Toggle */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        Online
                                                    </span>
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs ${
                                                            item.is_available_online
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                        }`}
                                                    >
                                                        {item.is_available_online ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </div>
                                                {canEdit && onToggleAvailability && (
                                                    <Switch
                                                        checked={item.is_available_online}
                                                        onCheckedChange={(checked) =>
                                                            onToggleAvailability(item.id, 'is_available_online', checked)
                                                        }
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        onEditMenuItem(item)
                                                    }
                                                    className="text-blue-600 hover:text-blue-700"
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
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {paginatedMenuItems.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm
                                    ? 'No menu items found matching your search.'
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
