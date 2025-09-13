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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
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
    const [activeTab, setActiveTab] = useState('basic');

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

            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <InertiaLink 
                                href={route('admin.apps.index')}
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                Back to Apps
                            </InertiaLink>
                        </div>
                        <div className="mt-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New App</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new application module to your platform</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-0">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
                                        <TabsTrigger 
                                            value="basic" 
                                            className="px-6 py-4 text-sm font-medium data-[state=active]:bg-gray-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:bg-gray-700/50 dark:data-[state=active]:text-blue-400"
                                        >
                                            Basic Info
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="settings" 
                                            className="px-6 py-4 text-sm font-medium data-[state=active]:bg-gray-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:bg-gray-700/50 dark:data-[state=active]:text-blue-400"
                                        >
                                            Settings
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="categories" 
                                            className="px-6 py-4 text-sm font-medium data-[state=active]:bg-gray-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:bg-gray-700/50 dark:data-[state=active]:text-blue-400"
                                        >
                                            Categories
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="plans" 
                                            className="px-6 py-4 text-sm font-medium data-[state=active]:bg-gray-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:bg-gray-700/50 dark:data-[state=active]:text-blue-400"
                                        >
                                            Subscription Plans
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="styling" 
                                            className="px-6 py-4 text-sm font-medium data-[state=active]:bg-gray-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:bg-gray-700/50 dark:data-[state=active]:text-blue-400"
                                        >
                                            Styling
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="basic" className="p-6 space-y-6 m-0">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Configure the basic details of your app</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                                placeholder="Enter app title"
                                                className={`border border-gray-300 dark:border-gray-600 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                                            />
                                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="route" className="text-sm font-medium text-gray-700 dark:text-gray-300">Route *</Label>
                                            <Input
                                                id="route"
                                                value={data.route}
                                                onChange={e => setData('route', e.target.value)}
                                                placeholder="/dashboard?app=example"
                                                className={`border border-gray-300 dark:border-gray-600 ${errors.route ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                                            />
                                            {errors.route && <p className="text-red-500 text-sm mt-1">{errors.route}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Enter app description"
                                            rows={3}
                                            className={`border border-gray-300 dark:border-gray-600 ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                                        />
                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300">Price *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={e => setData('price', parseFloat(e.target.value) || 0)}
                                                className={`border border-gray-300 dark:border-gray-600 ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                                            />
                                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="rating" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating *</Label>
                                            <Input
                                                id="rating"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={data.rating}
                                                onChange={e => setData('rating', parseFloat(e.target.value) || 0)}
                                                className={`border border-gray-300 dark:border-gray-600 ${errors.rating ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                                            />
                                            {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pricingType" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pricing Type *</Label>
                                            <Select value={data.pricingType} onValueChange={(value: 'free' | 'one-time' | 'subscription') => setData('pricingType', value)}>
                                                <SelectTrigger className={`border border-gray-300 dark:border-gray-600 ${errors.pricingType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}>
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
                                </TabsContent>

                                <TabsContent value="settings" className="p-6 space-y-6 m-0">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">App Settings</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Configure visibility and status settings</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                            <div>
                                                <Label htmlFor="visible" className="text-sm font-medium text-gray-700 dark:text-gray-300">Visible</Label>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Show this app to users</p>
                                            </div>
                                            <Switch
                                                id="visible"
                                                checked={data.visible}
                                                onCheckedChange={checked => setData('visible', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                            <div>
                                                <Label htmlFor="comingSoon" className="text-sm font-medium text-gray-700 dark:text-gray-300">Coming Soon</Label>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mark this app as coming soon</p>
                                            </div>
                                            <Switch
                                                id="comingSoon"
                                                checked={data.comingSoon}
                                                onCheckedChange={checked => setData('comingSoon', checked)}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="categories" className="p-6 space-y-6 m-0">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categories</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Add categories to help users find this app</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Categories</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {data.categories.map(category => (
                                                    <Badge key={category} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                                        {category}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCategory(category)}
                                                            className="ml-1 hover:text-red-500 transition-colors"
                                                        >
                                                            <XMarkIcon className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Predefined Categories</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {PREDEFINED_CATEGORIES.map(category => (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        onClick={() => addPredefinedCategory(category)}
                                                        disabled={data.categories.includes(category)}
                                                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                                    className="flex-1 border border-gray-300 dark:border-gray-600"
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
                                    </div>
                                </TabsContent>

                                <TabsContent value="plans" className="p-6 space-y-6 m-0">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Subscription Plans</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Select which subscription plans include this app</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Included Plans</Label>
                                            <div className="space-y-4">
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
                                                                <Badge key={plan} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                                                    {plan}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePlan(plan)}
                                                                        className="ml-1 hover:text-red-500 transition-colors"
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

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Subscription Plans</Label>
                                            <div className="space-y-4">
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
                                                                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                                    className="flex-1 border border-gray-300 dark:border-gray-600"
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
                                    </div>
                                </TabsContent>

                                <TabsContent value="styling" className="p-6 space-y-6 m-0">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Styling</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Choose the background color for this app</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Color</Label>
                                            <div className="grid grid-cols-6 gap-3">
                                                {PREDEFINED_COLORS.map(color => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setData('bgColor', color)}
                                                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                                            data.bgColor === color ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                        } ${color}`}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                            <Input
                                                value={data.bgColor}
                                                onChange={e => setData('bgColor', e.target.value)}
                                                placeholder="Or enter custom color class"
                                                className="mt-2 border border-gray-300 dark:border-gray-600"
                                            />
                                            {errors.bgColor && <p className="text-red-500 text-sm mt-1">{errors.bgColor}</p>}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-end gap-4">
                            <InertiaLink href={route('admin.apps.index')}>
                                <Button type="button" variant="outline" className="px-6">
                                    Cancel
                                </Button>
                            </InertiaLink>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white px-6"
                            >
                                {processing ? 'Creating...' : 'Create App'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
