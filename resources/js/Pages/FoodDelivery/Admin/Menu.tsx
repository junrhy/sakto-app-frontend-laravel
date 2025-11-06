import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { UtensilsIcon, PlusIcon, EditIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { FoodDeliveryMenuItem, FoodDeliveryMenuCategory, FoodDeliveryRestaurant, MenuItemFormData } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    menuItems?: FoodDeliveryMenuItem[];
    categories?: FoodDeliveryMenuCategory[];
    restaurants?: FoodDeliveryRestaurant[];
}

export default function AdminMenu({ auth, menuItems: initialMenuItems, categories: initialCategories, restaurants: initialRestaurants }: Props) {
    const [menuItems, setMenuItems] = useState<FoodDeliveryMenuItem[]>(initialMenuItems || []);
    const [categories, setCategories] = useState<FoodDeliveryMenuCategory[]>(initialCategories || []);
    const [restaurants, setRestaurants] = useState<FoodDeliveryRestaurant[]>(initialRestaurants || []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [restaurantFilter, setRestaurantFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodDeliveryMenuItem | null>(null);
    const [formData, setFormData] = useState<MenuItemFormData>({
        restaurant_id: '',
        category_id: '',
        name: '',
        description: '',
        image: '',
        price: '',
        discount_price: '',
        is_available: true,
        is_featured: false,
        preparation_time: '15',
        dietary_info: {},
    });

    // Category management state
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FoodDeliveryMenuCategory | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: '',
        display_order: '0',
    });

    useEffect(() => {
        fetchMenuItems();
        fetchCategories();
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (editingItem) {
            setFormData({
                restaurant_id: editingItem.restaurant_id.toString(),
                category_id: editingItem.category_id?.toString() || '',
                name: editingItem.name,
                description: editingItem.description || '',
                image: editingItem.image || '',
                price: editingItem.price.toString(),
                discount_price: editingItem.discount_price?.toString() || '',
                is_available: editingItem.is_available,
                is_featured: editingItem.is_featured,
                preparation_time: editingItem.preparation_time.toString(),
                dietary_info: editingItem.dietary_info || {},
            });
        } else {
            setFormData({
                restaurant_id: '',
                category_id: '',
                name: '',
                description: '',
                image: '',
                price: '',
                discount_price: '',
                is_available: true,
                is_featured: false,
                preparation_time: '15',
                dietary_info: {},
            });
        }
    }, [editingItem]);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/food-delivery/menu/items', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                setMenuItems(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/food-delivery/menu/categories', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error: any) {
            // Categories are optional
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await axios.get('/food-delivery/restaurants/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                setRestaurants(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load restaurants');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                client_identifier: (auth.user as any)?.identifier,
                price: parseFloat(formData.price),
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                preparation_time: parseInt(formData.preparation_time),
            };

            if (editingItem) {
                const response = await axios.put(`/food-delivery/menu/items/${editingItem.id}`, data);
                if (response.data.success) {
                    toast.success('Menu item updated successfully');
                    setDialogOpen(false);
                    setEditingItem(null);
                    fetchMenuItems();
                }
            } else {
                const response = await axios.post('/food-delivery/menu/items', data);
                if (response.data.success) {
                    toast.success('Menu item created successfully');
                    setDialogOpen(false);
                    fetchMenuItems();
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save menu item');
        }
    };

    const handleDelete = async (itemId: number) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;

        try {
            const response = await axios.delete(`/food-delivery/menu/items/${itemId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                toast.success('Menu item deleted successfully');
                fetchMenuItems();
            }
        } catch (error: any) {
            toast.error('Failed to delete menu item');
        }
    };

    // Category management functions
    useEffect(() => {
        if (editingCategory) {
            setCategoryFormData({
                name: editingCategory.name,
                description: editingCategory.description || '',
                display_order: editingCategory.display_order.toString(),
            });
        } else {
            setCategoryFormData({
                name: '',
                description: '',
                display_order: '0',
            });
        }
    }, [editingCategory]);

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...categoryFormData,
                client_identifier: (auth.user as any)?.identifier,
                display_order: parseInt(categoryFormData.display_order),
            };

            if (editingCategory) {
                const response = await axios.put(`/food-delivery/menu/categories/${editingCategory.id}`, data);
                if (response.data.success) {
                    toast.success('Category updated successfully');
                    setCategoryDialogOpen(false);
                    setEditingCategory(null);
                    fetchCategories();
                }
            } else {
                const response = await axios.post('/food-delivery/menu/categories', data);
                if (response.data.success) {
                    toast.success('Category created successfully');
                    setCategoryDialogOpen(false);
                    fetchCategories();
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleCategoryDelete = async (categoryId: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await axios.delete(`/food-delivery/menu/categories/${categoryId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                toast.success('Category deleted successfully');
                fetchCategories();
            }
        } catch (error: any) {
            toast.error('Failed to delete category');
        }
    };

    const formatCurrency = (amount: number) => {
        let currency: { symbol: string; thousands_separator?: string; decimal_separator?: string };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = { symbol: '₱', thousands_separator: ',', decimal_separator: '.' };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const filteredItems = menuItems.filter((item) => {
        const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
        const matchesRestaurant = restaurantFilter === 'all' || item.restaurant_id.toString() === restaurantFilter;
        const matchesCategory = categoryFilter === 'all' || item.category_id?.toString() === categoryFilter;
        return matchesSearch && matchesRestaurant && matchesCategory;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <UtensilsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Centralized Menu Management
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage all menu items across all restaurants
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => {
                        setEditingItem(null);
                        setDialogOpen(true);
                    }}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Menu Item
                    </Button>
                </div>
            }
        >
            <Head title="Menu Management" />

            <div className="space-y-6 p-6">
                {/* Categories Management Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Menu Categories</CardTitle>
                            <Button onClick={() => {
                                setEditingCategory(null);
                                setCategoryDialogOpen(true);
                            }}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">Description</TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">Display Order</TableHead>
                                    <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No categories found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories
                                        .sort((a, b) => a.display_order - b.display_order)
                                        .map((category) => (
                                            <TableRow key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <TableCell className="text-gray-900 dark:text-white">{category.name}</TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {category.description || '—'}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">{category.display_order}</TableCell>
                                                <TableCell className="text-right text-gray-900 dark:text-white">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingCategory(category);
                                                                setCategoryDialogOpen(true);
                                                            }}
                                                        >
                                                            <EditIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCategoryDelete(category.id)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
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

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search menu items..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Restaurants" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Restaurants</SelectItem>
                                    {restaurants.map((restaurant) => (
                                        <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                            {restaurant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Menu Items Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Restaurant</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Category</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Price</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {menuItems
                                        .filter((item) => {
                                            if (restaurantFilter !== 'all' && item.restaurant_id.toString() !== restaurantFilter) return false;
                                            if (categoryFilter !== 'all' && item.category_id?.toString() !== categoryFilter) return false;
                                            if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
                                            return true;
                                        })
                                        .map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <TableCell className="text-gray-900 dark:text-white">{item.name}</TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {restaurants.find(r => r.id === item.restaurant_id)?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {categories.find(c => c.id === item.category_id)?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {item.effective_price ? formatCurrency(item.effective_price) : formatCurrency(item.price)}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item.is_available
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {item.is_available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right text-gray-900 dark:text-white">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setDialogOpen(true);
                                                            }}
                                                        >
                                                            <EditIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Create/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="restaurant_id">Restaurant *</Label>
                                <Select
                                    value={formData.restaurant_id}
                                    onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select restaurant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {restaurants.map((restaurant) => (
                                            <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                                {restaurant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="discount_price">Discount Price</Label>
                                    <Input
                                        id="discount_price"
                                        type="number"
                                        step="0.01"
                                        value={formData.discount_price}
                                        onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="preparation_time">Prep Time (minutes)</Label>
                                    <Input
                                        id="preparation_time"
                                        type="number"
                                        value={formData.preparation_time}
                                        onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_available"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                        className="rounded"
                                    />
                                    <Label htmlFor="is_available">Available</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="rounded"
                                    />
                                    <Label htmlFor="is_featured">Featured</Label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Create/Edit Category Dialog */}
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="category_name">Name *</Label>
                                <Input
                                    id="category_name"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="category_description">Description</Label>
                                <Input
                                    id="category_description"
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="category_display_order">Display Order</Label>
                                <Input
                                    id="category_display_order"
                                    type="number"
                                    min="0"
                                    value={categoryFormData.display_order}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, display_order: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}

