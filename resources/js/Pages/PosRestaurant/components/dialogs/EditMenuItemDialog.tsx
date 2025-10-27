import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { ImagePlus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { MenuItem, MenuItemFormData } from '../../types';

interface EditMenuItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: number, menuItemData: MenuItemFormData) => void;
    menuItem: MenuItem | null;
}

export const EditMenuItemDialog: React.FC<EditMenuItemDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    menuItem,
}) => {
    const [formData, setFormData] = useState<MenuItemFormData>({
        name: '',
        price: 0,
        category: '',
        image: '',
        delivery_fee: 0,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update form data when menuItem changes or dialog opens
    useEffect(() => {
        if (menuItem && isOpen) {
            setFormData({
                name: menuItem.name || '',
                price: menuItem.price || 0,
                category: menuItem.category || '',
                image: menuItem.image || '',
                delivery_fee: menuItem.delivery_fee || 0,
            });
            setImagePreview('');
            setImageFile(null);
        }
    }, [menuItem, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            formData.name.trim() &&
            formData.price > 0 &&
            formData.category &&
            menuItem
        ) {
            // If there's a new image file, convert to base64
            if (imageFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const updatedFormData = {
                        ...formData,
                        image: reader.result as string,
                    };
                    onConfirm(menuItem.id, updatedFormData);
                    resetForm();
                    onClose();
                };
                reader.readAsDataURL(imageFile);
            } else {
                onConfirm(menuItem.id, formData);
                resetForm();
                onClose();
            }
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
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (
        field: keyof MenuItemFormData,
        value: string | number,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData((prev) => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Menu Item</DialogTitle>
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
                                onChange={(e) =>
                                    handleInputChange('name', e.target.value)
                                }
                                className="col-span-3 border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
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
                                onChange={(e) =>
                                    handleInputChange(
                                        'price',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="col-span-3 border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    handleInputChange('category', value)
                                }
                            >
                                <SelectTrigger className="col-span-3 border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                    <SelectItem
                                        value="Main"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Main Dishes
                                    </SelectItem>
                                    <SelectItem
                                        value="Side"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Side Dishes
                                    </SelectItem>
                                    <SelectItem
                                        value="Drink"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Drinks
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="pt-2 text-right">Image</Label>
                            <div className="col-span-3 space-y-3">
                                {/* Image Preview */}
                                {(imagePreview || formData.image) && (
                                    <div className="relative">
                                        <img
                                            src={imagePreview || formData.image}
                                            alt="Preview"
                                            className="h-32 w-full rounded-lg object-cover"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="absolute right-2 top-2"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="flex-1"
                                    >
                                        <ImagePlus className="mr-2 h-4 w-4" />
                                        {imagePreview || formData.image
                                            ? 'Change Image'
                                            : 'Upload Image'}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Optional URL Input */}
                                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                    or
                                </div>
                                <Input
                                    value={formData.image}
                                    onChange={(e) => {
                                        handleInputChange(
                                            'image',
                                            e.target.value,
                                        );
                                        if (e.target.value) {
                                            setImagePreview('');
                                            setImageFile(null);
                                        }
                                    }}
                                    className="border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    placeholder="Or paste image URL"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="delivery_fee"
                                className="text-right"
                            >
                                Delivery Fee
                            </Label>
                            <Input
                                id="delivery_fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.delivery_fee}
                                onChange={(e) =>
                                    handleInputChange(
                                        'delivery_fee',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="col-span-3 border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-purple-500 text-white hover:bg-purple-600"
                        >
                            Update Menu Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
