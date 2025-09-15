import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { MenuItemFormData } from '../../types';

interface AddMenuItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (menuItemData: MenuItemFormData) => void;
}

export const AddMenuItemDialog: React.FC<AddMenuItemDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [formData, setFormData] = useState<MenuItemFormData>({
        name: '',
        price: 0,
        category: '',
        image: '',
        delivery_fee: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim() && formData.price > 0 && formData.category) {
            onConfirm(formData);
            resetForm();
            onClose();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: 0,
            category: '',
            image: '',
            delivery_fee: 0,
        });
    };

    const handleInputChange = (field: keyof MenuItemFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="e.g., Grilled Chicken"
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                <SelectTrigger className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    <SelectItem value="Main" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Main Dishes</SelectItem>
                                    <SelectItem value="Side" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Side Dishes</SelectItem>
                                    <SelectItem value="Drink" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Drinks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">
                                Image URL
                            </Label>
                            <Input
                                id="image"
                                value={formData.image}
                                onChange={(e) => handleInputChange('image', e.target.value)}
                                className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="delivery_fee" className="text-right">
                                Delivery Fee
                            </Label>
                            <Input
                                id="delivery_fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.delivery_fee}
                                onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
                                className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">
                            Add Menu Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
