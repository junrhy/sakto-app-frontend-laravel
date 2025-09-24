import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import CreditsLayout from '@/Layouts/CreditsLayout';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clock, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface CreditHistory {
    id: number;
    amount: number;
    type: 'spent' | 'purchased';
    purpose: string;
    reference_id: string;
    created_at: string;
}

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
            identifier: string;
        };
    };
    history: CreditHistory[];
}

export default function History({ auth, history: initialHistory }: Props) {
    const [history] = useState<CreditHistory[]>(initialHistory);
    const [loading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalPages = Math.ceil(history.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = history.slice(startIndex, endIndex);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <CreditsLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Credit Spent History
                </h2>
            }
        >
            <Head title="Credit Spent History" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="shadow-lg">
                        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle>Credit Spent History</CardTitle>
                                    <CardDescription>
                                        View your credit spent history
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="py-8 text-center">
                                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                                    <p className="text-gray-500">
                                        Loading transaction history...
                                    </p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                        <CreditCard className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No transaction history found
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {currentItems.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md dark:bg-gray-800 dark:hover:border-blue-800"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            variant={
                                                                transaction.type ===
                                                                'purchased'
                                                                    ? 'default'
                                                                    : 'destructive'
                                                            }
                                                            className={`px-3 py-1 text-sm font-medium ${
                                                                transaction.type ===
                                                                'purchased'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}
                                                        >
                                                            {transaction.type ===
                                                            'purchased'
                                                                ? '+'
                                                                : '-'}
                                                            {transaction.amount}{' '}
                                                            Credits
                                                        </Badge>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                            {
                                                                transaction.purpose
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>
                                                            Reference:{' '}
                                                            {
                                                                transaction.reference_id
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(
                                                        transaction.created_at,
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="mt-8 flex flex-col justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Showing{' '}
                                            <span className="font-medium">
                                                {startIndex + 1}
                                            </span>{' '}
                                            to{' '}
                                            <span className="font-medium">
                                                {Math.min(
                                                    endIndex,
                                                    history.length,
                                                )}
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-medium">
                                                {history.length}
                                            </span>{' '}
                                            entries
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={previousPage}
                                                disabled={currentPage === 1}
                                                className="border-gray-200 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/50"
                                            >
                                                <ChevronLeft className="mr-1 h-4 w-4" />
                                                Previous
                                            </Button>
                                            <div className="rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                Page {currentPage} of{' '}
                                                {totalPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={nextPage}
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                className="border-gray-200 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/50"
                                            >
                                                Next
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CreditsLayout>
    );
}
