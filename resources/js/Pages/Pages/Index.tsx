import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Page } from '@/types/pages';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, SearchIcon, FileDown } from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

interface PaginatedResponse {
    current_page: number;
    data: Page[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface Props {
    pages: PaginatedResponse;
}

export default function Index({ pages }: Props) {
    const [search, setSearch] = useState('');
    const [selectedPages, setSelectedPages] = useState<number[]>([]);

    const filteredPages = useMemo(() => {
        if (!search.trim()) return pages.data;
        const searchLower = search.toLowerCase();
        return pages.data.filter(page => 
            page.title.toLowerCase().includes(searchLower) ||
            page.slug.toLowerCase().includes(searchLower) ||
            page.content.toLowerCase().includes(searchLower)
        );
    }, [pages.data, search]);

    const toggleSelectAll = () => {
        if (selectedPages.length === filteredPages.length) {
            setSelectedPages([]);
        } else {
            setSelectedPages(filteredPages.map(page => page.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedPages.includes(id)) {
            setSelectedPages(selectedPages.filter(pageId => pageId !== id));
        } else {
            setSelectedPages([...selectedPages, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = pages.data.filter(page => selectedPages.includes(page.id));
        const headers = ['Title', 'Slug', 'Status', 'Last Updated'];
        const csvData = selectedData.map(page => [
            page.title,
            page.slug,
            page.is_published ? 'Published' : 'Draft',
            format(new Date(page.updated_at), 'PPP')
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pages.csv';
        link.click();
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this page?')) {
            router.delete(route('pages.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Pages
                    </h2>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search pages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-[300px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            />
                        </div>
                        {selectedPages.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={exportToCSV}
                                className="flex items-center"
                            >
                                <FileDown className="w-4 h-4 mr-2" />
                                Export Selected
                            </Button>
                        )}
                        <Link href={route('pages.create')}>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Page
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Pages" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPages.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4">
                                                No pages found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPages.map((page) => (
                                            <TableRow key={page.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedPages.includes(page.id)}
                                                        onCheckedChange={() => toggleSelect(page.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{page.title}</TableCell>
                                                <TableCell>
                                                    {page.is_published ? (
                                                        <a 
                                                            href={route('pages.static', page.slug)} 
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            {page.slug}
                                                        </a>
                                                    ) : (
                                                        page.slug
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={page.is_published ? "default" : "secondary"}>
                                                        {page.is_published ? 'Published' : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(page.updated_at), 'PPP')}</TableCell>
                                                <TableCell className="text-right">
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
                                                                <Link href={route('pages.show', page.id)}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('pages.edit', page.id)}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => handleDelete(page.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 