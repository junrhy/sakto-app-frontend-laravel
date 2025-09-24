import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Calculator, Edit, Link2, Plus, Trash, Unlink } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Table as TableType } from '../types';

interface TablesTabProps {
    tables: TableType[];
    currency_symbol: string;
    canEdit: boolean;
    canDelete: boolean;
    onAddTable: () => void;
    onEditTable: (table: TableType) => void;
    onDeleteTable: (tableId: number) => void;
    onJoinTables: (tableIds: number[]) => void;
    onUnjoinTables: (tableIds: number[]) => void;
    onSetTableStatusFilter: (
        filter: 'all' | 'available' | 'occupied' | 'reserved' | 'joined',
    ) => void;
    tableStatusFilter: 'all' | 'available' | 'occupied' | 'reserved' | 'joined';
}

export const TablesTab: React.FC<TablesTabProps> = ({
    tables,
    currency_symbol,
    canEdit,
    canDelete,
    onAddTable,
    onEditTable,
    onDeleteTable,
    onJoinTables,
    onUnjoinTables,
    onSetTableStatusFilter,
    tableStatusFilter,
}) => {
    const [selectedTables, setSelectedTables] = useState<number[]>([]);

    const filteredTables = useMemo(() => {
        if (!Array.isArray(tables)) return [];

        return tableStatusFilter === 'all'
            ? tables
            : tables.filter((table) => table.status === tableStatusFilter);
    }, [tables, tableStatusFilter]);

    const availableTables = useMemo(
        () => filteredTables.filter((table) => table.status === 'available'),
        [filteredTables],
    );

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'occupied':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'reserved':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'joined':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }, []);

    const getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'available':
                return '🟢';
            case 'occupied':
                return '🔴';
            case 'reserved':
                return '🟡';
            case 'joined':
                return '🔵';
            default:
                return '⚪';
        }
    }, []);

    const handleTableSelect = useCallback(
        (tableId: number, checked: boolean) => {
            if (checked) {
                setSelectedTables((prev) => [...prev, tableId]);
            } else {
                setSelectedTables((prev) =>
                    prev.filter((id) => id !== tableId),
                );
            }
        },
        [],
    );

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedTables(
                    availableTables.map((table) =>
                        typeof table.id === 'number'
                            ? table.id
                            : parseInt(table.id.toString()),
                    ),
                );
            } else {
                setSelectedTables([]);
            }
        },
        [availableTables],
    );

    const handleJoinTables = useCallback(() => {
        if (selectedTables.length >= 2) {
            onJoinTables(selectedTables);
            setSelectedTables([]);
        }
    }, [selectedTables, onJoinTables]);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Table Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage restaurant tables and seating arrangements
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Tables
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {tables.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-gray-900 dark:text-white">
                            <Calculator className="mr-2 h-5 w-5 text-green-500" />
                            Tables Overview
                        </CardTitle>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {canEdit && (
                                <Button
                                    onClick={onAddTable}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Table
                                </Button>
                            )}
                            {selectedTables.length >= 2 && (
                                <Button
                                    onClick={handleJoinTables}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
                                >
                                    <Link2 className="mr-2 h-4 w-4" /> Join
                                    Tables ({selectedTables.length})
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-end space-x-2">
                            <div className="flex-1">
                                <Label htmlFor="tableStatusFilter">
                                    Filter by Status
                                </Label>
                                <Select
                                    value={tableStatusFilter}
                                    onValueChange={onSetTableStatusFilter}
                                >
                                    <SelectTrigger
                                        id="tableStatusFilter"
                                        className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                        <SelectItem
                                            value="all"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            All
                                        </SelectItem>
                                        <SelectItem
                                            value="available"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Available
                                        </SelectItem>
                                        <SelectItem
                                            value="occupied"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Occupied
                                        </SelectItem>
                                        <SelectItem
                                            value="reserved"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Reserved
                                        </SelectItem>
                                        <SelectItem
                                            value="joined"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Joined
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {availableTables.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="selectAllTables"
                                    checked={
                                        selectedTables.length ===
                                            availableTables.length &&
                                        availableTables.length > 0
                                    }
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label
                                    htmlFor="selectAllTables"
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                >
                                    Select All Available (
                                    {availableTables.length})
                                </Label>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredTables.map((table) => (
                            <Card
                                key={table.id}
                                className={`rounded-xl border-gray-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
                                    table.status === 'available'
                                        ? 'border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600'
                                        : table.status === 'occupied'
                                          ? 'border-red-200 hover:border-red-300 dark:border-red-700 dark:hover:border-red-600'
                                          : table.status === 'reserved'
                                            ? 'border-yellow-200 hover:border-yellow-300 dark:border-yellow-700 dark:hover:border-yellow-600'
                                            : 'border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600'
                                }`}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-gray-900 dark:text-white">
                                            {table.status === 'joined' &&
                                            table.joined_with ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {getStatusIcon(
                                                                table.status,
                                                            )}
                                                        </span>
                                                        <span>
                                                            {table.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Joined with:{' '}
                                                        {table.joined_with}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>
                                                        {getStatusIcon(
                                                            table.status,
                                                        )}
                                                    </span>
                                                    <span>{table.name}</span>
                                                </div>
                                            )}
                                        </CardTitle>
                                        {table.status === 'available' && (
                                            <Checkbox
                                                checked={selectedTables.includes(
                                                    typeof table.id === 'number'
                                                        ? table.id
                                                        : parseInt(
                                                              table.id.toString(),
                                                          ),
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleTableSelect(
                                                        typeof table.id ===
                                                            'number'
                                                            ? table.id
                                                            : parseInt(
                                                                  table.id.toString(),
                                                              ),
                                                        checked as boolean,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Seats: {table.seats}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Status:{' '}
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(table.status)}`}
                                        >
                                            {table.status}
                                        </span>
                                    </p>
                                    {table.joined_with && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Joined Tables: {table.joined_with}
                                        </p>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-wrap gap-2">
                                    {table.status === 'available' && (
                                        <>
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        onEditTable(table)
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
                                                        onDeleteTable(
                                                            typeof table.id ===
                                                                'number'
                                                                ? table.id
                                                                : parseInt(
                                                                      table.id.toString(),
                                                                  ),
                                                        )
                                                    }
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    {table.status === 'occupied' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            Complete Order
                                        </Button>
                                    )}
                                    {table.status === 'reserved' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            Check In
                                        </Button>
                                    )}
                                    {table.status === 'joined' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onUnjoinTables([
                                                    typeof table.id === 'number'
                                                        ? table.id
                                                        : parseInt(
                                                              table.id.toString(),
                                                          ),
                                                ])
                                            }
                                            className="text-orange-600 hover:text-orange-700"
                                        >
                                            <Unlink className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {filteredTables.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No tables found for the selected filter.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
