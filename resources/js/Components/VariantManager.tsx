import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Variant {
    id?: number;
    sku?: string;
    price?: number;
    stock_quantity: number;
    weight?: number;
    dimensions?: string;
    thumbnail_url?: string;
    attributes: Record<string, string>;
    is_active: boolean;
}

interface VariantManagerProps {
    productId: number;
    productType: string;
    currency: { symbol: string; code: string };
    initialVariants?: Variant[];
    onVariantsChange?: (variants: Variant[]) => void;
}

export default function VariantManager({ 
    productId, 
    productType, 
    currency, 
    initialVariants = [], 
    onVariantsChange 
}: VariantManagerProps) {
    const [variants, setVariants] = useState<Variant[]>(initialVariants);
    const [editingVariant, setEditingVariant] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVariant, setNewVariant] = useState<Partial<Variant>>({
        stock_quantity: 0,
        attributes: {},
        is_active: true
    });
    const [editingVariantData, setEditingVariantData] = useState<Partial<Variant>>({});

    // Common attribute options
    const commonAttributes = {
        color: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray'],
        size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        material: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather', 'Synthetic'],
        style: ['Casual', 'Formal', 'Sport', 'Vintage', 'Modern', 'Classic', 'Trendy'],
        gender: ['Men', 'Women', 'Unisex', 'Boys', 'Girls'],
        age_group: ['Infant', 'Toddler', 'Kids', 'Teen', 'Adult', 'Senior']
    };

    const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);

    // Update variants when initialVariants prop changes
    useEffect(() => {
        setVariants(initialVariants);
    }, [initialVariants]);

    useEffect(() => {
        if (onVariantsChange) {
            onVariantsChange(variants);
        }
    }, [variants, onVariantsChange]);

    const addAttribute = (key: string, value: string, isEditing = false) => {
        if (isEditing) {
            setEditingVariantData(prev => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [key]: value
                }
            }));
        } else {
            setNewVariant(prev => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [key]: value
                }
            }));
        }
    };

    const removeAttribute = (key: string, isEditing = false) => {
        if (isEditing) {
            setEditingVariantData(prev => {
                const newAttributes = { ...prev.attributes };
                delete newAttributes[key];
                return {
                    ...prev,
                    attributes: newAttributes
                };
            });
        } else {
            setNewVariant(prev => {
                const newAttributes = { ...prev.attributes };
                delete newAttributes[key];
                return {
                    ...prev,
                    attributes: newAttributes
                };
            });
        }
    };

    const handleAddVariant = () => {
        if (Object.keys(newVariant.attributes || {}).length === 0) {
            alert('Please add at least one attribute');
            return;
        }

        const variant: Variant = {
            ...newVariant as Variant,
            stock_quantity: newVariant.stock_quantity || 0,
            attributes: newVariant.attributes || {},
            is_active: newVariant.is_active ?? true
        };

        setVariants(prev => [...prev, variant]);
        setNewVariant({
            stock_quantity: 0,
            attributes: {},
            is_active: true
        });
        setShowAddForm(false);
    };

    const handleEditVariant = (index: number) => {
        const variant = variants[index];
        setEditingVariantData({
            ...variant,
            attributes: { ...variant.attributes }
        });
        setEditingVariant(index);
    };

    const handleSaveVariant = (index: number) => {
        if (Object.keys(editingVariantData.attributes || {}).length === 0) {
            alert('Please add at least one attribute');
            return;
        }

        const updatedVariant: Variant = {
            ...variants[index],
            ...editingVariantData as Variant,
            stock_quantity: editingVariantData.stock_quantity || 0,
            attributes: editingVariantData.attributes || {},
            is_active: editingVariantData.is_active ?? true
        };

        setVariants(prev => prev.map((v, i) => i === index ? updatedVariant : v));
        setEditingVariant(null);
        setEditingVariantData({});
    };

    const handleCancelEdit = () => {
        setEditingVariant(null);
        setEditingVariantData({});
    };

    const handleDeleteVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const toggleVariantActive = (index: number) => {
        setVariants(prev => prev.map((v, i) => 
            i === index ? { ...v, is_active: !v.is_active } : v
        ));
    };

    if (productType !== 'physical') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">
                        Variants are only available for physical products.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Product Variants</CardTitle>
                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                        variant="outline"
                        size="sm"
                        type="button"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Variant Form */}
                {showAddForm && (
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Variant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={newVariant.sku || ''}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                                        placeholder="Optional SKU"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="price">Price Override</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={newVariant.price || ''}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                                        placeholder="Leave empty to use product price"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="stock">Stock Quantity</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={newVariant.stock_quantity || 0}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="weight">Weight Override (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        value={newVariant.weight || ''}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                                        placeholder="Leave empty to use product weight"
                                    />
                                </div>
                            </div>

                            {/* Attributes Section */}
                            <div>
                                <Label>Attributes</Label>
                                <div className="space-y-2">
                                    {Object.entries(commonAttributes).map(([key, options]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <Select
                                                value={newVariant.attributes?.[key] || ''}
                                                onValueChange={(value) => addAttribute(key, value)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue placeholder={key} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {options.map(option => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {newVariant.attributes?.[key] && (
                                                <Badge variant="secondary">
                                                    {key}: {newVariant.attributes[key]}
                                                    <button
                                                        onClick={() => removeAttribute(key)}
                                                        className="ml-1 text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is-active"
                                    checked={newVariant.is_active ?? true}
                                    onCheckedChange={(checked) => setNewVariant(prev => ({ ...prev, is_active: checked }))}
                                />
                                <Label htmlFor="is-active">Active</Label>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleAddVariant} type="button">
                                    <Save className="h-4 w-4 mr-2" />
                                    Add Variant
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewVariant({
                                            stock_quantity: 0,
                                            attributes: {},
                                            is_active: true
                                        });
                                    }}
                                    type="button"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Variants List */}
                <div className="space-y-4">
                    {variants.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No variants added yet. Click "Add Variant" to get started.
                        </p>
                    ) : (
                        variants.map((variant, index) => (
                            <Card key={index} className={!variant.is_active ? 'opacity-60' : ''}>
                                <CardContent className="pt-4">
                                    {editingVariant === index ? (
                                        // Edit Mode
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`edit-sku-${index}`}>SKU</Label>
                                                    <Input
                                                        id={`edit-sku-${index}`}
                                                        value={editingVariantData.sku || ''}
                                                        onChange={(e) => setEditingVariantData(prev => ({ ...prev, sku: e.target.value }))}
                                                        placeholder="Optional SKU"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`edit-price-${index}`}>Price Override</Label>
                                                    <Input
                                                        id={`edit-price-${index}`}
                                                        type="number"
                                                        step="0.01"
                                                        value={editingVariantData.price || ''}
                                                        onChange={(e) => setEditingVariantData(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                                                        placeholder="Leave empty to use product price"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`edit-stock-${index}`}>Stock Quantity</Label>
                                                    <Input
                                                        id={`edit-stock-${index}`}
                                                        type="number"
                                                        value={editingVariantData.stock_quantity || 0}
                                                        onChange={(e) => setEditingVariantData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`edit-weight-${index}`}>Weight Override (kg)</Label>
                                                    <Input
                                                        id={`edit-weight-${index}`}
                                                        type="number"
                                                        step="0.01"
                                                        value={editingVariantData.weight || ''}
                                                        onChange={(e) => setEditingVariantData(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                                                        placeholder="Leave empty to use product weight"
                                                    />
                                                </div>
                                            </div>

                                            {/* Edit Attributes Section */}
                                            <div>
                                                <Label>Attributes</Label>
                                                <div className="space-y-2">
                                                    {Object.entries(commonAttributes).map(([key, options]) => (
                                                        <div key={key} className="flex items-center gap-2">
                                                            <Select
                                                                value={editingVariantData.attributes?.[key] || ''}
                                                                onValueChange={(value) => addAttribute(key, value, true)}
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue placeholder={key} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {options.map(option => (
                                                                        <SelectItem key={option} value={option}>
                                                                            {option}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {editingVariantData.attributes?.[key] && (
                                                                <Badge variant="secondary">
                                                                    {key}: {editingVariantData.attributes[key]}
                                                                    <button
                                                                        onClick={() => removeAttribute(key, true)}
                                                                        className="ml-1 text-red-500 hover:text-red-700"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`edit-is-active-${index}`}
                                                    checked={editingVariantData.is_active ?? true}
                                                    onCheckedChange={(checked) => setEditingVariantData(prev => ({ ...prev, is_active: checked }))}
                                                />
                                                <Label htmlFor={`edit-is-active-${index}`}>Active</Label>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button onClick={() => handleSaveVariant(index)} type="button">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleCancelEdit}
                                                    type="button"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex gap-1">
                                                        {Object.entries(variant.attributes).map(([key, value]) => (
                                                            <Badge key={key} variant="outline" className="text-xs">
                                                                {key}: {value}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    {!variant.is_active && (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">SKU:</span>
                                                        <span className="ml-1 font-mono">{variant.sku || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Price:</span>
                                                        <span className="ml-1">
                                                            {variant.price 
                                                                ? formatCurrency(variant.price, currency.symbol)
                                                                : 'Use product price'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Stock:</span>
                                                        <span className="ml-1">{variant.stock_quantity}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Weight:</span>
                                                        <span className="ml-1">
                                                            {variant.weight ? `${variant.weight}kg` : 'Use product weight'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={variant.is_active}
                                                    onCheckedChange={() => toggleVariantActive(index)}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditVariant(index)}
                                                    type="button"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteVariant(index)}
                                                    type="button"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 