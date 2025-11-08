import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, SearchIcon, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Applicant {
    id: number;
    name: string;
    email: string;
    phone?: string;
    applications_count: number;
    created_at: string;
}

interface Props extends PageProps {
    applicants: Applicant[];
}

export default function Applicants({ auth, applicants }: Props) {
    const [search, setSearch] = useState('');

    const filteredApplicants = useMemo(() => {
        if (!search.trim()) {
            return applicants;
        }
        const searchLower = search.toLowerCase();
        return applicants.filter(
            (applicant) =>
                applicant.name.toLowerCase().includes(searchLower) ||
                applicant.email.toLowerCase().includes(searchLower) ||
                applicant.phone?.toLowerCase().includes(searchLower),
        );
    }, [applicants, search]);

    const handleDelete = (id: number) => {
        if (
            confirm(
                'Are you sure you want to delete this applicant? This will also delete all their applications.',
            )
        ) {
            // Note: Delete functionality would need to be implemented in the controller
            toast.error('Delete functionality not yet implemented');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Applicants
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Manage job applicants and their profiles
                        </p>
                    </div>
                    <Link href={route('jobs.applications')}>
                        <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Applications
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Applicants" />

            <div className="space-y-6">
                {/* Search Bar */}
                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search applicants by name, email, or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-gray-300 bg-white pl-9 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Applicants Table */}
                {filteredApplicants.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UserPlus className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                {search
                                    ? 'No applicants found'
                                    : 'No applicants yet'}
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {search
                                    ? 'Try adjusting your search terms'
                                    : 'Applicants will appear here when they apply to jobs'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Name
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Email
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Phone
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Applications
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Created
                                        </TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplicants.map((applicant) => (
                                        <TableRow
                                            key={applicant.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="font-medium text-gray-900 dark:text-white">
                                                {applicant.name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {applicant.email}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {applicant.phone || '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {applicant.applications_count}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {new Date(
                                                    applicant.created_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <Link
                                                    href={route(
                                                        'jobs.applicant',
                                                        applicant.id,
                                                    )}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
