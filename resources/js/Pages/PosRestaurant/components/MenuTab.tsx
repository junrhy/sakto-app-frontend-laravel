import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { Plus, Edit, Trash, Search, ShoppingCart } from "lucide-react";
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
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
    const itemsPerPage = 10;

    const filteredMenuItems = useMemo(() => {
        if (!Array.isArray(menuItems)) return [];
        
        const searchTermLower = (searchTerm || '').toLowerCase();
        return menuItems.filter(item => 
            item.name.toLowerCase().includes(searchTermLower) ||
            item.category.toLowerCase().includes(searchTermLower)
        );
    }, [menuItems, searchTerm]);

    const paginatedMenuItems = useMemo(() => {
        if (!Array.isArray(filteredMenuItems)) return [];
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMenuItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMenuItems, currentPage]);

    const pageCount = useMemo(() => 
        Math.ceil(filteredMenuItems.length / itemsPerPage), 
        [filteredMenuItems.length, itemsPerPage]
    );

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            setSelectedMenuItems(paginatedMenuItems.map((item: MenuItem) => item.id));
        } else {
            setSelectedMenuItems([]);
        }
    }, [paginatedMenuItems]);

    const handleSelectItem = useCallback((itemId: number, checked: boolean) => {
        if (checked) {
            setSelectedMenuItems(prev => [...prev, itemId]);
        } else {
            setSelectedMenuItems(prev => prev.filter(id => id !== itemId));
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
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h2>
                        <p className="text-gray-600 dark:text-gray-400">Manage restaurant menu items and pricing</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{menuItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2 text-purple-500" />
                        Menu Items
                    </CardTitle>
                </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        {canEdit && (
                            <Button onClick={onAddMenuItem} className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Menu Item
                            </Button>
                        )}
                        {canDelete && selectedMenuItems.length > 0 && (
                            <Button 
                                onClick={handleBulkDelete}
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Selected ({selectedMenuItems.length})
                            </Button>
                        )}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search menu items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedMenuItems.length === paginatedMenuItems.length && paginatedMenuItems.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-gray-900 dark:text-white">Image</TableHead>
                            <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                            <TableHead className="text-gray-900 dark:text-white">Category</TableHead>
                            <TableHead className="text-gray-900 dark:text-white">Price</TableHead>
                            <TableHead className="text-gray-900 dark:text-white">Delivery Fee</TableHead>
                            <TableHead className="text-gray-900 dark:text-white">Availability</TableHead>
                            <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedMenuItems.map((item) => (
                            <TableRow key={item.id} className="border-gray-200 dark:border-gray-600">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMenuItems.includes(item.id)}
                                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <img 
                                        src={item.image || '/images/no-image.jpg'} 
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white font-medium">
                                    {item.name}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                                        {item.category}
                                    </span>
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                    {currency_symbol}{item.price}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                    {item.delivery_fee ? `${currency_symbol}${item.delivery_fee}` : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            item.is_available_personal 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {item.is_available_personal ? 'Personal' : 'Not Available'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            item.is_available_online 
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                        }`}>
                                            {item.is_available_online ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {canEdit && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => onEditMenuItem(item)}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                onClick={() => onDeleteMenuItem(item.id)}
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
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No menu items found matching your search.' : 'No menu items found.'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pageCount > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMenuItems.length)} of {filteredMenuItems.length} items
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
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
