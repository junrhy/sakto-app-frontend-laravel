import { Card, CardContent } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    Users,
} from 'lucide-react';

interface Loan {
    id: string;
    borrower_name: string;
    amount: number;
    interest_rate: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'paid' | 'defaulted';
    interest_type: 'fixed' | 'compounding';
    installment_frequency?:
        | 'weekly'
        | 'bi-weekly'
        | 'monthly'
        | 'quarterly'
        | 'annually';
    installment_amount?: number;
}

interface LoanPayment {
    id: string;
    loan_id: string;
    amount: number;
    payment_date: string;
}

interface LoanBill {
    id: string;
    loan_id: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
}

export function LoanStatsWidget() {
    // This would typically come from your API
    const loans: Loan[] = [
        {
            id: '1',
            borrower_name: 'John Doe',
            amount: 10000,
            interest_rate: 5.5,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            status: 'active',
            interest_type: 'fixed',
            installment_frequency: 'monthly',
            installment_amount: 1000,
        },
        {
            id: '2',
            borrower_name: 'Jane Smith',
            amount: 15000,
            interest_rate: 6.0,
            start_date: '2024-02-01',
            end_date: '2025-01-31',
            status: 'active',
            interest_type: 'compounding',
            installment_frequency: 'monthly',
            installment_amount: 1500,
        },
    ];

    const payments: LoanPayment[] = [
        {
            id: '1',
            loan_id: '1',
            amount: 1000,
            payment_date: '2024-03-01',
        },
    ];

    const bills: LoanBill[] = [
        {
            id: '1',
            loan_id: '1',
            amount: 1000,
            due_date: '2024-04-01',
            status: 'pending',
        },
        {
            id: '2',
            loan_id: '2',
            amount: 1500,
            due_date: '2024-03-15',
            status: 'overdue',
        },
    ];

    // Calculate statistics
    const totalLoans = loans.length;
    const activeLoans = loans.filter((loan) => loan.status === 'active').length;
    const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalPayments = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
    );
    const overdueBills = bills.filter(
        (bill) => bill.status === 'overdue',
    ).length;
    const collectionRate = (totalPayments / totalAmount) * 100;

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Loan Statistics
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        Collection Rate:
                    </span>
                    <span className="text-sm font-medium">
                        {collectionRate.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Total Loans</span>
                            </div>
                            <span className="text-sm font-medium">
                                ${totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Active Loans</span>
                            </div>
                            <span className="text-sm font-medium">
                                {activeLoans}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Total Payments</span>
                            </div>
                            <span className="text-sm font-medium">
                                ${totalPayments.toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm">Overdue Bills</span>
                            </div>
                            <span className="text-sm font-medium">
                                {overdueBills}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Collection Rate Progress */}
            <div className="mb-6">
                <Progress value={collectionRate} className="h-2" />
            </div>

            {/* Recent Activity */}
            <ScrollArea className="h-[calc(100%-20rem)]">
                <div className="space-y-4">
                    {bills.map((bill) => (
                        <Card
                            key={bill.id}
                            className={
                                bill.status === 'overdue'
                                    ? 'bg-red-50 dark:bg-red-900/20'
                                    : ''
                            }
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        {bill.status === 'overdue' ? (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        ) : bill.status === 'paid' ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-yellow-500" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex items-center justify-between">
                                            <span className="truncate font-medium">
                                                {
                                                    loans.find(
                                                        (loan) =>
                                                            loan.id ===
                                                            bill.loan_id,
                                                    )?.borrower_name
                                                }
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Due:{' '}
                                                {new Date(
                                                    bill.due_date,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="mt-2 truncate text-sm text-gray-500">
                                            ${bill.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
