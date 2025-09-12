import { useState, useEffect } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/Components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { PackageIcon } from "lucide-react";
import { CargoItem, CargoUnloading, CargoUnloadingFormData, CargoUnloadingSummary } from "../types";
import { useCargoUnloading } from "../hooks";

interface CargoUnloadingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    cargoItem: CargoItem;
    onUnloadingUpdate: () => void;
}

export default function CargoUnloadingDialog({ isOpen, onClose, cargoItem, onUnloadingUpdate }: CargoUnloadingDialogProps) {
    const { loading, error, getUnloadings, createUnloading, updateUnloading, deleteUnloading, getUnloadingSummary } = useCargoUnloading();
    
    const [unloadings, setUnloadings] = useState<CargoUnloading[]>([]);
    const [summary, setSummary] = useState<CargoUnloadingSummary | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUnloading, setEditingUnloading] = useState<CargoUnloading | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [unloadingToDelete, setUnloadingToDelete] = useState<CargoUnloading | null>(null);
    
    const [newUnloading, setNewUnloading] = useState<CargoUnloadingFormData>({
        quantity_unloaded: '',
        unload_location: '',
        notes: '',
        unloaded_at: new Date().toISOString().slice(0, 16),
        unloaded_by: ''
    });

    const [editingUnloadingData, setEditingUnloadingData] = useState<CargoUnloadingFormData>({
        quantity_unloaded: '',
        unload_location: '',
        notes: '',
        unloaded_at: '',
        unloaded_by: ''
    });

    useEffect(() => {
        if (isOpen && cargoItem.id) {
            loadUnloadingData();
        }
    }, [isOpen, cargoItem.id]);

    const loadUnloadingData = async () => {
        try {
            const [unloadingsData, summaryData] = await Promise.all([
                getUnloadings(cargoItem.id),
                getUnloadingSummary(cargoItem.id)
            ]);
            setUnloadings(unloadingsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to load unloading data:', error);
        }
    };

    const handleAddUnloading = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUnloading(cargoItem.id, newUnloading);
            setNewUnloading({
                quantity_unloaded: '',
                unload_location: '',
                notes: '',
                unloaded_at: new Date().toISOString().slice(0, 16),
                unloaded_by: ''
            });
            setIsAddDialogOpen(false);
            await loadUnloadingData();
            onUnloadingUpdate();
        } catch (error) {
            console.error('Failed to add unloading:', error);
        }
    };

    const handleEditUnloading = (unloading: CargoUnloading) => {
        setEditingUnloading(unloading);
        setEditingUnloadingData({
            quantity_unloaded: unloading.quantity_unloaded.toString(),
            unload_location: unloading.unload_location,
            notes: unloading.notes || '',
            unloaded_at: new Date(unloading.unloaded_at).toISOString().slice(0, 16),
            unloaded_by: unloading.unloaded_by || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUnloading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUnloading) return;
        
        try {
            await updateUnloading(cargoItem.id, editingUnloading.id, editingUnloadingData);
            setIsEditDialogOpen(false);
            setEditingUnloading(null);
            await loadUnloadingData();
            onUnloadingUpdate();
        } catch (error) {
            console.error('Failed to update unloading:', error);
        }
    };

    const handleDeleteUnloading = (unloading: CargoUnloading) => {
        setUnloadingToDelete(unloading);
        setShowDeleteDialog(true);
    };

    const confirmDeleteUnloading = async () => {
        if (!unloadingToDelete) return;
        
        try {
            await deleteUnloading(cargoItem.id, unloadingToDelete.id);
            setShowDeleteDialog(false);
            setUnloadingToDelete(null);
            await loadUnloadingData();
            onUnloadingUpdate();
        } catch (error) {
            console.error('Failed to delete unloading:', error);
        }
    };

    const getStatusBadge = () => {
        if (!summary) return null;
        
        if (summary.is_fully_unloaded) {
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Fully Delivered</Badge>;
        } else if (summary.is_partially_unloaded) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Partially Delivered</Badge>;
        } else {
            return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Not Delivered</Badge>;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <PackageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-gray-900 dark:text-gray-100">Cargo Unloading Management</DialogTitle>
                                <DialogDescription className="text-gray-600 dark:text-gray-400">
                                    Manage unloading records for {cargoItem.name}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quantity</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {summary.total_quantity.toLocaleString()} {cargoItem.unit}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Unloaded</div>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {summary.total_unloaded.toLocaleString()} {cargoItem.unit}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</div>
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {summary.remaining_quantity.toLocaleString()} {cargoItem.unit}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</div>
                                    <div className="mt-2">
                                        {getStatusBadge()}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Unloading Records</h3>
                        <Button 
                            onClick={() => setIsAddDialogOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={summary?.is_fully_unloaded}
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Unloading
                        </Button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                <TableRow className="border-gray-200 dark:border-gray-700">
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date & Time</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Location</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Quantity</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Unloaded By</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Notes</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {unloadings.map((unloading) => (
                                    <TableRow key={unloading.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {new Date(unloading.unloaded_at).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {unloading.unload_location}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {unloading.quantity_unloaded.toLocaleString()} {cargoItem.unit}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {unloading.unloaded_by || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {unloading.notes || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditUnloading(unloading)}
                                                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    title="Edit unloading record"
                                                >
                                                    <Pencil2Icon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteUnloading(unloading)}
                                                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Delete unloading record"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {unloadings.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No unloading records found. Add the first unloading record to get started.
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Unloading Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">Add Unloading Record</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddUnloading}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 items-center gap-4">
                                <Input 
                                    placeholder="Quantity Unloaded" 
                                    type="number" 
                                    value={newUnloading.quantity_unloaded} 
                                    onChange={(e) => setNewUnloading({ ...newUnloading, quantity_unloaded: e.target.value })}
                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                                <Input 
                                    placeholder="Unload Location" 
                                    value={newUnloading.unload_location} 
                                    onChange={(e) => setNewUnloading({ ...newUnloading, unload_location: e.target.value })}
                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <Input 
                                placeholder="Unloaded By" 
                                value={newUnloading.unloaded_by} 
                                onChange={(e) => setNewUnloading({ ...newUnloading, unloaded_by: e.target.value })}
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Input 
                                placeholder="Notes" 
                                value={newUnloading.notes} 
                                onChange={(e) => setNewUnloading({ ...newUnloading, notes: e.target.value })}
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Input 
                                type="datetime-local"
                                value={newUnloading.unloaded_at} 
                                onChange={(e) => setNewUnloading({ ...newUnloading, unloaded_at: e.target.value })}
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Unloading'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Unloading Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Unloading Record</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUnloading}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 items-center gap-4">
                                <Input 
                                    placeholder="Quantity Unloaded" 
                                    type="number" 
                                    value={editingUnloadingData.quantity_unloaded} 
                                    onChange={(e) => setEditingUnloadingData({ ...editingUnloadingData, quantity_unloaded: e.target.value })}
                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                                <Input 
                                    placeholder="Unload Location" 
                                    value={editingUnloadingData.unload_location} 
                                    onChange={(e) => setEditingUnloadingData({ ...editingUnloadingData, unload_location: e.target.value })}
                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <Input 
                                placeholder="Unloaded By" 
                                value={editingUnloadingData.unloaded_by} 
                                onChange={(e) => setEditingUnloadingData({ ...editingUnloadingData, unloaded_by: e.target.value })}
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Input 
                                placeholder="Notes" 
                                value={editingUnloadingData.notes} 
                                onChange={(e) => setEditingUnloadingData({ ...editingUnloadingData, notes: e.target.value })}
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Input 
                                type="datetime-local"
                                value={editingUnloadingData.unloaded_at} 
                                onChange={(e) => setEditingUnloadingData({ ...editingUnloadingData, unloaded_at: e.target.value })}
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Unloading'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-gray-900 dark:text-gray-100">Delete Unloading Record</DialogTitle>
                                <DialogDescription className="text-gray-600 dark:text-gray-400">
                                    This action cannot be undone.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Location:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">{unloadingToDelete?.unload_location}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantity:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {unloadingToDelete?.quantity_unloaded} {cargoItem.unit}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {unloadingToDelete ? new Date(unloadingToDelete.unloaded_at).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setUnloadingToDelete(null);
                            }}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={confirmDeleteUnloading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={loading}
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            {loading ? 'Deleting...' : 'Delete Record'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
