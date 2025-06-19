import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Content, ContentFilters } from '@/types/content';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, SearchIcon, Calendar, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface Props extends PageProps {
    content: Content[];
}

export default function Index({ auth, content }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredContent = useMemo(() => {
        let filtered = content;
        
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchLower) ||
                item.content.toLowerCase().includes(searchLower)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        return filtered;
    }, [content, search, statusFilter]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(route('content-creator.destroy', id));
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
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Posts
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage your content
                        </p>
                    </div>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search posts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-[300px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Posts</SelectItem>
                                <SelectItem value="draft">Drafts</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Link href={route('content-creator.create')}>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Post
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Posts" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {filteredContent.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="mx-auto h-12 w-12 text-gray-400">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No posts</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Get started by creating your first post.
                                    </p>
                                    <div className="mt-6">
                                        <Link href={route('content-creator.create')}>
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Post
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredContent.map((item) => (
                                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    {item.featured_image && (
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={item.featured_image}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg font-semibold line-clamp-2">
                                                {item.title}
                                            </CardTitle>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('content-creator.preview', item.id)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('content-creator.edit', item.id)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Badge 
                                                variant={getStatusBadgeColor(item.status)}
                                                className="capitalize"
                                            >
                                                {item.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        {item.excerpt && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                                                {item.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-3 h-3" />
                                                <span>{item.author || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-3 h-3" />
                                                <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 