import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Content, ContentFilters } from '@/types/content';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { Search, Settings, Plus, Trash2, Edit, Eye, ChevronDown } from 'lucide-react';

interface Props extends PageProps {
    content: Content[];
}

export default function Index({ auth, content }: Props) {
    const [filters, setFilters] = useState<ContentFilters>({});
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleFilterChange = (key: keyof ContentFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(content.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (confirm('Are you sure you want to delete selected items?')) {
            // Implement bulk delete
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'default';
            case 'draft':
                return 'secondary';
            case 'archived':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Content Management</h2>}
        >
            <Head title="Content Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div className="flex flex-wrap gap-3">
                                    <Link href={route('content-creator.create')}>
                                        <Button className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Create New Content
                                        </Button>
                                    </Link>
                                    {selectedItems.length > 0 && (
                                        <Button 
                                            variant="destructive" 
                                            onClick={handleBulkDelete}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Selected ({selectedItems.length})
                                        </Button>
                                    )}
                                </div>
                                <Link href={route('content-creator.settings')}>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search content..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <select
                                        value={filters.type || ''}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
                                    >
                                        <option value="">All Types</option>
                                        <option value="article">Article</option>
                                        <option value="page">Page</option>
                                        <option value="post">Post</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="w-12 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    checked={selectedItems.length === content.length}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Author</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {content.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        checked={selectedItems.includes(item.id)}
                                                        onChange={() => handleSelectItem(item.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium">{item.title}</td>
                                                <td className="px-4 py-3 capitalize">{item.type}</td>
                                                <td className="px-4 py-3">
                                                    <Badge 
                                                        variant={getStatusBadgeColor(item.status)}
                                                        className="capitalize"
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">{item.author?.name}</td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Link href={route('content-creator.edit', item.id)}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('content-creator.preview', item.id)}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 