import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface StockManagerProps {
    productId: number;
    currentStock: number;
    productName: string;
    productType: string;
    onStockUpdate?: (newStock: number) => void;
}

export default function StockManager({ 
    productId, 
    currentStock, 
    productName, 
    productType,
    onStockUpdate 
}: StockManagerProps) {
    const [newStock, setNewStock] = useState(currentStock.toString());
    const [isUpdating, setIsUpdating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleUpdateStock = () => {
        const stockValue = parseInt(newStock);
        if (isNaN(stockValue) || stockValue < 0) {
            return;
        }

        setIsUpdating(true);
        router.patch(route('products.update-stock', productId), {
            stock_quantity: stockValue
        }, {
            onSuccess: () => {
                setIsUpdating(false);
                setShowForm(false);
                onStockUpdate?.(stockValue);
            },
            onError: () => {
                setIsUpdating(false);
            }
        });
    };

    const getStockStatus = () => {
        if (productType === 'digital' || productType === 'service' || productType === 'subscription') {
            return {
                variant: 'secondary' as const,
                text: 'Unlimited',
                icon: <Package className="w-4 h-4" />
            };
        }
        
        if (currentStock === 0) {
            return {
                variant: 'destructive' as const,
                text: 'Out of Stock',
                icon: <AlertTriangle className="w-4 h-4" />
            };
        }
        
        if (currentStock <= 10) {
            return {
                variant: 'secondary' as const,
                text: `Low Stock (${currentStock})`,
                icon: <AlertTriangle className="w-4 h-4" />
            };
        }
        
        return {
            variant: 'default' as const,
            text: `In Stock (${currentStock})`,
            icon: <CheckCircle className="w-4 h-4" />
        };
    };

    const stockStatus = getStockStatus();

    if (productType === 'digital' || productType === 'service' || productType === 'subscription') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Stock Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        {stockStatus.icon}
                        <Badge variant={stockStatus.variant}>
                            {stockStatus.text}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        This product type doesn't require stock management.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Stock Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        {stockStatus.icon}
                        <Badge variant={stockStatus.variant}>
                            {stockStatus.text}
                        </Badge>
                    </div>

                    {!showForm ? (
                        <Button 
                            variant="outline" 
                            onClick={() => setShowForm(true)}
                            className="w-full"
                        >
                            Update Stock
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="stock-quantity">New Stock Quantity</Label>
                                <Input
                                    id="stock-quantity"
                                    type="number"
                                    min="0"
                                    value={newStock}
                                    onChange={(e) => setNewStock(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleUpdateStock}
                                    disabled={isUpdating}
                                    className="flex-1"
                                >
                                    {isUpdating ? 'Updating...' : 'Save'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowForm(false);
                                        setNewStock(currentStock.toString());
                                    }}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 