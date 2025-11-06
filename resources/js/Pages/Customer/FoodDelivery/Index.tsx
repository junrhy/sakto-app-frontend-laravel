import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { UtensilsIcon, SearchIcon, FilterIcon, StarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { FoodDeliveryRestaurant } from './types';
import RestaurantCard from './components/RestaurantCard';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    restaurants?: FoodDeliveryRestaurant[];
}

export default function FoodDeliveryIndex({ auth, restaurants: initialRestaurants }: Props) {
    const [restaurants, setRestaurants] = useState<FoodDeliveryRestaurant[]>(initialRestaurants || []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [minRating, setMinRating] = useState<string>('all');
    const [maxDeliveryFee, setMaxDeliveryFee] = useState<string>('all');
    const [maxPrepTime, setMaxPrepTime] = useState<string>('all');

    useEffect(() => {
        fetchRestaurants();
    }, [search, sortBy, minRating, maxDeliveryFee, maxPrepTime]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
            };
            if (search) {
                params.search = search;
            }
            if (minRating !== 'all') {
                params.min_rating = minRating;
            }
            if (maxDeliveryFee !== 'all') {
                params.max_delivery_fee = maxDeliveryFee;
            }
            if (maxPrepTime !== 'all') {
                params.max_prep_time = maxPrepTime;
            }
            params.sort_by = sortBy;
            params.sort_order = 'desc';

            const response = await axios.get('/food-delivery/restaurants/list', { params });
            if (response.data.success) {
                setRestaurants(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load restaurants');
        } finally {
            setLoading(false);
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
                                Food Delivery
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Order food from your favorite restaurants
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Food Delivery" />

            <div className="space-y-6 p-6">
                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search restaurants..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rating">Rating</SelectItem>
                                    <SelectItem value="delivery_fee">Delivery Fee</SelectItem>
                                    <SelectItem value="estimated_prep_time">Prep Time</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={minRating} onValueChange={setMinRating}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder="Min Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    <SelectItem value="4">4+ Stars</SelectItem>
                                    <SelectItem value="3">3+ Stars</SelectItem>
                                    <SelectItem value="2">2+ Stars</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Restaurants Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        <p className="mt-2 text-gray-500">Loading restaurants...</p>
                    </div>
                ) : restaurants.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UtensilsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No restaurants found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                formatCurrency={formatCurrency}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

