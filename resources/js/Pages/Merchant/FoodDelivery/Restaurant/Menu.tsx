import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
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
import { Switch } from '@/Components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import MerchantLayout from '@/Layouts/Merchant/MerchantLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

interface Props extends PageProps {}

interface FoodDeliveryRestaurant {
    id: number;
    name: string;
}

interface FoodDeliveryMenuCategory {
    id: number;
    name: string;
    description?: string;
    display_order: number;
}

interface FoodDeliveryMenuItem {
    id: number;
    restaurant_id: number;
    menu_category_id?: number | null;
    name: string;
    description?: string;
    price: number;
    discount_price?: number | null;
    is_available: boolean;
    is_featured: boolean;
    preparation_time?: number | null;
}

interface MenuItemFormData {
    restaurant_id: number;
    name: string;
    description: string;
    price: string;
    discount_price: string;
    category_id: string;
    is_available: boolean;
    is_featured: boolean;
    preparation_time: string;
}

export default function MerchantRestaurantMenu({ auth }: Props) {
    const [restaurants, setRestaurants] = useState<FoodDeliveryRestaurant[]>(
        [],
    );
    const [categories, setCategories] = useState<FoodDeliveryMenuCategory[]>(
        [],
    );
    const [menuItems, setMenuItems] = useState<FoodDeliveryMenuItem[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodDeliveryMenuItem | null>(
        null,
    );
    const [formData, setFormData] = useState<MenuItemFormData>({
        restaurant_id: 0,
        name: '',
        description: '',
        price: '0',
        discount_price: '',
        category_id: 'none',
        is_available: true,
        is_featured: false,
        preparation_time: '',
    });

    const filteredItems = useMemo(() => {
        if (!selectedRestaurant) return [];
        return menuItems.filter(
            (item) => String(item.restaurant_id) === selectedRestaurant,
        );
    }, [menuItems, selectedRestaurant]);

    useEffect(() => {
        fetchRestaurants();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchMenuItems();
        }
    }, [selectedRestaurant]);

    const fetchRestaurants = async () => {
        try {
            const response = await axios.get(
                '/food-delivery/restaurants/list',
                {
                    params: {
                        client_identifier: (auth.user as any)?.identifier,
                        status: 'all',
                    },
                },
            );

            if (response.data.success && response.data.data) {
                setRestaurants(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedRestaurant(String(response.data.data[0].id));
                }
            }
        } catch (error: any) {
            console.error('Failed to fetch restaurants:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/food-delivery/menu/categories', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });

            if (response.data.success && response.data.data) {
                setCategories(response.data.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('/food-delivery/menu/items', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    restaurant_id: selectedRestaurant,
                },
            });

            if (response.data.success && response.data.data) {
                setMenuItems(response.data.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch menu items:', error);
        }
    };

    const handleCreate = () => {
        if (!selectedRestaurant) return;
        setEditingItem(null);
        setFormData({
            restaurant_id: Number(selectedRestaurant),
            name: '',
            description: '',
            price: '0',
            discount_price: '',
            category_id: 'none',
            is_available: true,
            is_featured: false,
            preparation_time: '',
        });
        setDialogOpen(true);
    };

    const handleEdit = (item: FoodDeliveryMenuItem) => {
        setEditingItem(item);
        setFormData({
            restaurant_id: item.restaurant_id,
            name: item.name,
            description: item.description || '',
            price: String(item.price ?? 0),
            discount_price: item.discount_price
                ? String(item.discount_price)
                : '',
            category_id: item.menu_category_id
                ? String(item.menu_category_id)
                : 'none',
            is_available: !!item.is_available,
            is_featured: !!item.is_featured,
            preparation_time: item.preparation_time
                ? String(item.preparation_time)
                : '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            client_identifier: (auth.user as any)?.identifier,
            category_id:
                formData.category_id === 'none'
                    ? null
                    : Number(formData.category_id),
            restaurant_id: Number(formData.restaurant_id),
            price: parseFloat(formData.price),
            discount_price: formData.discount_price
                ? parseFloat(formData.discount_price)
                : null,
            preparation_time: formData.preparation_time
                ? Number(formData.preparation_time)
                : null,
        };

        try {
            if (editingItem) {
                await axios.put(
                    `/food-delivery/menu/items/${editingItem.id}`,
                    payload,
                );
            } else {
                await axios.post('/food-delivery/menu/items', payload);
            }
            setDialogOpen(false);
            fetchMenuItems();
        } catch (error: any) {
            console.error('Failed to save menu item:', error);
        }
    };

    const handleDelete = async (itemId: number) => {
        if (!confirm('Delete this menu item?')) return;
        try {
            await axios.delete(`/food-delivery/menu/items/${itemId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            fetchMenuItems();
        } catch (error: any) {
            console.error('Failed to delete menu item:', error);
        }
    };

    return (
        <MerchantLayout
            auth={{ user: auth.user }}
            title="Menu Management"
            header={
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Menu Management
                </h2>
            }
        >
            <Head title="Menu Management" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Restaurant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <Label htmlFor="restaurant">Restaurant</Label>
                                <Select
                                    value={selectedRestaurant}
                                    onValueChange={setSelectedRestaurant}
                                >
                                    <SelectTrigger
                                        id="restaurant"
                                        className="mt-1"
                                    >
                                        <SelectValue placeholder="Select a restaurant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {restaurants.map((restaurant) => (
                                            <SelectItem
                                                key={restaurant.id}
                                                value={String(restaurant.id)}
                                            >
                                                {restaurant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="self-end">
                                <Button
                                    onClick={handleCreate}
                                    disabled={!selectedRestaurant}
                                >
                                    Add Menu Item
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Menu Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
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
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right text-gray-900 dark:text-white">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No items available.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {item.menu_category_id
                                                    ? categories.find(
                                                          (category) =>
                                                              category.id ===
                                                              item.menu_category_id,
                                                      )?.name || '—'
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                ₱
                                                {Number(
                                                    item.price ?? 0,
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {item.is_available
                                                    ? 'Available'
                                                    : 'Unavailable'}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="discount_price">
                                    Discount Price
                                </Label>
                                <Input
                                    id="discount_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.discount_price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            discount_price: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            category_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            No category
                                        </SelectItem>
                                        {categories
                                            .sort(
                                                (a, b) =>
                                                    a.display_order -
                                                    b.display_order,
                                            )
                                            .map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="preparation_time">
                                    Preparation Time (minutes)
                                </Label>
                                <Input
                                    id="preparation_time"
                                    type="number"
                                    min="0"
                                    value={formData.preparation_time}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            preparation_time: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Available
                                </span>
                                <Switch
                                    checked={formData.is_available}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            is_available: checked,
                                        })
                                    }
                                />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Featured
                                </span>
                                <Switch
                                    checked={formData.is_featured}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            is_featured: checked,
                                        })
                                    }
                                />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingItem ? 'Save Changes' : 'Create Item'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </MerchantLayout>
    );
}
