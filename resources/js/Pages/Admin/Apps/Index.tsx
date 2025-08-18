import { Head, Link as InertiaLink, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { 
    PlusIcon, 
    MagnifyingGlassIcon, 
    EllipsisVerticalIcon,
    EyeIcon,
    EyeSlashIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/Layouts/Admin/AdminLayout';

interface App {
    title: string;
    route: string;
    visible: boolean;
    description: string;
    price: number;
    categories: string[];
    comingSoon: boolean;
    pricingType: 'free' | 'one-time' | 'subscription';
    includedInPlans?: string[];
    bgColor: string;
    rating: number;
}

interface Props {
    apps: App[];
}

export default function Index({ apps }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    const { delete: destroy } = useForm();

    // Get unique categories
    const categories = Array.from(new Set(apps.flatMap(app => app.categories))).sort();

    // Filter apps based on search and category
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || app.categories.includes(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const handleDelete = (index: number) => {
        if (confirm('Are you sure you want to delete this app?')) {
            destroy(route('admin.apps.destroy', index));
        }
    };

    const handleReorder = (fromIndex: number, toIndex: number) => {
        const newOrder = [...apps];
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);
        
        // Update the order via API
        fetch(route('admin.apps.reorder'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                order: newOrder.map((_, index) => index)
            })
        }).then(() => {
            window.location.reload();
        });
    };

    return (
        <AdminLayout
            title="Manage Apps"
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manage Apps</h2>}
        >
            <Head title="Manage Apps" />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Apps</h1>
                            <p className="text-gray-600 dark:text-gray-400">Configure and manage your application modules</p>
                        </div>
                        <InertiaLink href={route('admin.apps.create')}>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add New App
                            </Button>
                        </InertiaLink>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search apps..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Apps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredApps.map((app, index) => (
                            <Card key={index} className="relative">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{app.title}</CardTitle>
                                            <CardDescription className="mt-1 line-clamp-2">
                                                {app.description}
                                            </CardDescription>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <EllipsisVerticalIcon className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink href={route('admin.apps.edit', index)}>
                                                        <PencilIcon className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {index > 0 && (
                                                    <DropdownMenuItem onClick={() => handleReorder(index, index - 1)}>
                                                        <ArrowUpIcon className="h-4 w-4 mr-2" />
                                                        Move Up
                                                    </DropdownMenuItem>
                                                )}
                                                {index < apps.length - 1 && (
                                                    <DropdownMenuItem onClick={() => handleReorder(index, index + 1)}>
                                                        <ArrowDownIcon className="h-4 w-4 mr-2" />
                                                        Move Down
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDelete(index)}
                                                    className="text-red-600 dark:text-red-400"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-3">
                                    {/* Status Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        {app.visible ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                Visible
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <EyeSlashIcon className="h-3 w-3 mr-1" />
                                                Hidden
                                            </Badge>
                                        )}
                                        
                                        {app.comingSoon && (
                                            <Badge variant="outline" className="border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-200">
                                                Coming Soon
                                            </Badge>
                                        )}
                                        
                                        <Badge variant="outline">
                                            {app.pricingType}
                                        </Badge>
                                        
                                        <Badge variant="outline">
                                            ${app.price}
                                        </Badge>
                                        
                                        <Badge variant="outline">
                                            ⭐ {app.rating}
                                        </Badge>
                                    </div>

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-1">
                                        {app.categories.map(category => (
                                            <Badge key={category} variant="secondary" className="text-xs">
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Route */}
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Route:</strong> {app.route}
                                    </div>

                                    {/* Background Color Preview */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                                        <div 
                                            className={`w-6 h-6 rounded border ${app.bgColor.includes('bg-') ? app.bgColor : ''}`}
                                            style={{ 
                                                backgroundColor: !app.bgColor.includes('bg-') ? app.bgColor : undefined
                                            }}
                                        />
                                        <span className="text-xs text-gray-500">{app.bgColor}</span>
                                    </div>

                                    {/* Included Plans */}
                                    {app.includedInPlans && app.includedInPlans.length > 0 && (
                                        <div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Plans: </span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {app.includedInPlans.map(plan => (
                                                    <Badge key={plan} variant="outline" className="text-xs">
                                                        {plan}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredApps.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No apps found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
