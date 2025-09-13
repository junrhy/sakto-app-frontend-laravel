import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link as InertiaLink } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    price: number;
    duration_in_days: number;
    project_id?: number;
    project?: {
        id: number;
        name: string;
        identifier: string;
    };
}

interface Props {
    subscriptionPlans: SubscriptionPlan[];
}

const PREDEFINED_CATEGORIES = [
    'Business', 'Sales', 'Inventory', 'Food', 'Medical', 'Healthcare', 'Appointments',
    'Finance', 'Payments', 'Bookings', 'Real Estate', 'Transportation', 'Logistics',
    'HR', 'Travel', 'Communication', 'Marketing', 'CRM', 'Family', 'Genealogy',
    'Personal', 'Events', 'Community', 'Content', 'Products', 'Pages', 'Challenges',
    'Health', 'Insurance', 'Mortuary', 'Funeral', 'Education', 'Training'
];

// Subscription plans will be passed from the controller

const PREDEFINED_COLORS = [
    'bg-blue-100 dark:bg-blue-900/30',
    'bg-orange-100 dark:bg-orange-900/30',
    'bg-red-100 dark:bg-red-900/30',
    'bg-green-100 dark:bg-green-900/30',
    'bg-purple-100 dark:bg-purple-900/30',
    'bg-indigo-100 dark:bg-indigo-900/30',
    'bg-yellow-100 dark:bg-yellow-900/30',
    'bg-gray-100 dark:bg-gray-900/30',
    'bg-pink-100 dark:bg-pink-900/30',
    'bg-cyan-100 dark:bg-cyan-900/30',
    'bg-emerald-100 dark:bg-emerald-900/30',
    'bg-teal-100 dark:bg-teal-900/30',
    'bg-amber-100 dark:bg-amber-900/30',
    'bg-violet-100 dark:bg-violet-900/30',
    'bg-rose-100 dark:bg-rose-900/30',
    'bg-sky-100 dark:bg-sky-900/30',
    'bg-lime-100 dark:bg-lime-900/30',
    'bg-slate-100 dark:bg-slate-900/30'
];

export default function Create({ subscriptionPlans }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        route: '',
        visible: false,
        description: '',
        price: 0,
        categories: [] as string[],
        comingSoon: false,
        pricingType: 'subscription' as 'free' | 'one-time' | 'subscription',
        includedInPlans: [] as string[],
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        rating: 4.5,
        newCategory: '',
        newPlan: ''
    });

    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [showPlanInput, setShowPlanInput] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.apps.store'));
    };

    const addCategory = () => {
        if (data.newCategory.trim() && !data.categories.includes(data.newCategory.trim())) {
            setData('categories', [...data.categories, data.newCategory.trim()]);
            setData('newCategory', '');
            setShowCategoryInput(false);
        }
    };

    const removeCategory = (category: string) => {
        setData('categories', data.categories.filter(c => c !== category));
    };

    const addPlan = () => {
        if (data.newPlan.trim() && !data.includedInPlans.includes(data.newPlan.trim())) {
            setData('includedInPlans', [...data.includedInPlans, data.newPlan.trim()]);
            setData('newPlan', '');
            setShowPlanInput(false);
        }
    };

    const removePlan = (plan: string) => {
        setData('includedInPlans', data.includedInPlans.filter(p => p !== plan));
    };

    const addPredefinedCategory = (category: string) => {
        if (!data.categories.includes(category)) {
            setData('categories', [...data.categories, category]);
        }
    };

    const addPredefinedPlan = (plan: string) => {
        if (!data.includedInPlans.includes(plan)) {
            setData('includedInPlans', [...data.includedInPlans, plan]);
        }
    };

    return (
        <AdminLayout
            title="Create New App"
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Create New App</h2>}
        >
            <Head title="Create New App" />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <div className="mb-6">
                        <InertiaLink 
                            href={route('admin.apps.index')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-1" />
                            Back to Apps
                        </InertiaLink>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">Create New App</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Configure the basic details of your app</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            placeholder="Enter app title"
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="route">Route *</Label>
                                        <Input
                                            id="route"
                                            value={data.route}
                                            onChange={e => setData('route', e.target.value)}
                                            placeholder="/dashboard?app=example"
                                            className={errors.route ? 'border-red-500' : ''}
                                        />
                                        {errors.route && <p className="text-red-500 text-sm mt-1">{errors.route}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Enter app description"
                                        rows={3}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="price">Price *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={e => setData('price', parseFloat(e.target.value) || 0)}
                                            className={errors.price ? 'border-red-500' : ''}
                                        />
                                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="rating">Rating *</Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={data.rating}
                                            onChange={e => setData('rating', parseFloat(e.target.value) || 0)}
                                            className={errors.rating ? 'border-red-500' : ''}
                                        />
                                        {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="pricingType">Pricing Type *</Label>
                                        <Select value={data.pricingType} onValueChange={(value: 'free' | 'one-time' | 'subscription') => setData('pricingType', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">Free</SelectItem>
                                                <SelectItem value="one-time">One Time</SelectItem>
                                                <SelectItem value="subscription">Subscription</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.pricingType && <p className="text-red-500 text-sm mt-1">{errors.pricingType}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>App Settings</CardTitle>
                                <CardDescription>Configure visibility and status settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="visible">Visible</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Show this app to users</p>
                                    </div>
                                    <Switch
                                        id="visible"
                                        checked={data.visible}
                                        onCheckedChange={checked => setData('visible', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="comingSoon">Coming Soon</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Mark this app as coming soon</p>
                                    </div>
                                    <Switch
                                        id="comingSoon"
                                        checked={data.comingSoon}
                                        onCheckedChange={checked => setData('comingSoon', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Categories</CardTitle>
                                <CardDescription>Add categories to help users find this app</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Selected Categories</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {data.categories.map(category => (
                                            <Badge key={category} variant="secondary" className="flex items-center gap-1">
                                                {category}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCategory(category)}
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <XMarkIcon className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Predefined Categories</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {PREDEFINED_CATEGORIES.map(category => (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() => addPredefinedCategory(category)}
                                                disabled={data.categories.includes(category)}
                                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {showCategoryInput ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={data.newCategory}
                                            onChange={e => setData('newCategory', e.target.value)}
                                            placeholder="Enter new category"
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                        />
                                        <Button type="button" onClick={addCategory} size="sm">Add</Button>
                                        <Button type="button" onClick={() => setShowCategoryInput(false)} variant="outline" size="sm">Cancel</Button>
                                    </div>
                                ) : (
                                    <Button type="button" onClick={() => setShowCategoryInput(true)} variant="outline" size="sm">
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Custom Category
                                    </Button>
                                )}
                                {errors.categories && <p className="text-red-500 text-sm">{errors.categories}</p>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Subscription Plans</CardTitle>
                                <CardDescription>Select which subscription plans include this app</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Included Plans</Label>
                                    <div className="space-y-4 mt-2">
                                        {Object.entries(
                                            data.includedInPlans.reduce((acc, planSlug) => {
                                                const plan = subscriptionPlans.find(p => p.slug === planSlug);
                                                const projectName = plan?.project?.name || 'No Project';
                                                if (!acc[projectName]) {
                                                    acc[projectName] = [];
                                                }
                                                acc[projectName].push(planSlug);
                                                return acc;
                                            }, {} as Record<string, string[]>)
                                        ).map(([projectName, plans]) => (
                                            <div key={projectName}>
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {projectName}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {plans.map(plan => (
                                                        <Badge key={plan} variant="secondary" className="flex items-center gap-1">
                                                            {plan}
                                                            <button
                                                                type="button"
                                                                onClick={() => removePlan(plan)}
                                                                className="ml-1 hover:text-red-500"
                                                            >
                                                                <XMarkIcon className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Available Subscription Plans</Label>
                                    <div className="space-y-4 mt-2">
                                        {Object.entries(
                                            subscriptionPlans.reduce((acc, plan) => {
                                                const projectName = plan.project?.name || 'No Project';
                                                if (!acc[projectName]) {
                                                    acc[projectName] = [];
                                                }
                                                acc[projectName].push(plan);
                                                return acc;
                                            }, {} as Record<string, SubscriptionPlan[]>)
                                        ).map(([projectName, plans]) => (
                                            <div key={projectName}>
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {projectName}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {plans.map(plan => (
                                                        <button
                                                            key={plan.id}
                                                            type="button"
                                                            onClick={() => addPredefinedPlan(plan.slug)}
                                                            disabled={data.includedInPlans.includes(plan.slug)}
                                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={`${plan.name} (${plan.slug}) - $${plan.price} (${plan.duration_in_days} days)`}
                                                        >
                                                            {plan.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {showPlanInput ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={data.newPlan}
                                            onChange={e => setData('newPlan', e.target.value)}
                                            placeholder="Enter new plan"
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addPlan())}
                                        />
                                        <Button type="button" onClick={addPlan} size="sm">Add</Button>
                                        <Button type="button" onClick={() => setShowPlanInput(false)} variant="outline" size="sm">Cancel</Button>
                                    </div>
                                ) : (
                                    <Button type="button" onClick={() => setShowPlanInput(true)} variant="outline" size="sm">
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Custom Plan
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Styling</CardTitle>
                                <CardDescription>Choose the background color for this app</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Background Color</Label>
                                    <div className="grid grid-cols-6 gap-2 mt-2">
                                        {PREDEFINED_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setData('bgColor', color)}
                                                className={`w-12 h-12 rounded border-2 ${
                                                    data.bgColor === color ? 'border-blue-500' : 'border-gray-300'
                                                } ${color}`}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                    <Input
                                        value={data.bgColor}
                                        onChange={e => setData('bgColor', e.target.value)}
                                        placeholder="Or enter custom color class"
                                        className="mt-2"
                                    />
                                    {errors.bgColor && <p className="text-red-500 text-sm mt-1">{errors.bgColor}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <InertiaLink href={route('admin.apps.index')}>
                                <Button type="button" variant="outline">Cancel</Button>
                            </InertiaLink>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create App'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
