import { Head } from '@inertiajs/react';
import { useState } from 'react';
import CreditsLayout from '@/Layouts/CreditsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ChevronLeft, ChevronRight, Clock, CreditCard } from 'lucide-react';

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
        }
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Credit Spent History</h2>}
        >
            <Head title="Credit Spent History" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="shadow-lg">
                        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle>Credit Spent History</CardTitle>
                                    <CardDescription>View your credit spent history</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading transaction history...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">No transaction history found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {currentItems.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Badge 
                                                            variant={transaction.type === 'purchased' ? 'default' : 'destructive'}
                                                            className={`px-3 py-1 text-sm font-medium ${
                                                                transaction.type === 'purchased' 
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}
                                                        >
                                                            {transaction.type === 'purchased' ? '+' : '-'}{transaction.amount} Credits
                                                        </Badge>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{transaction.purpose}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <span>Reference: {transaction.reference_id}</span>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(transaction.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Pagination Controls */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, history.length)}</span> of <span className="font-medium">{history.length}</span> entries
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={previousPage}
                                                disabled={currentPage === 1}
                                                className="border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/50 transition-colors"
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={nextPage}
                                                disabled={currentPage === totalPages}
                                                className="border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/50 transition-colors"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
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