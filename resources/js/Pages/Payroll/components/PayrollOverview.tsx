import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { Payroll } from '../types';
import { calculateTotalPayroll, formatCurrency } from '../utils/formatting';

interface PayrollOverviewProps {
    payrolls: Payroll[];
    currency_symbol: string;
}

export const PayrollOverview = ({
    payrolls,
    currency_symbol,
}: PayrollOverviewProps) => {
    const totalPayrolls = Array.isArray(payrolls) ? payrolls.length : 0;
    const activePayrolls = Array.isArray(payrolls)
        ? payrolls.filter((p) => p.status === 'active').length
        : 0;
    const totalAmount = calculateTotalPayroll(payrolls);

    return (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-700 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Total Monthly Payroll
                            </p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {formatCurrency(totalAmount, currency_symbol)}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-700 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                Total Employees
                            </p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {totalPayrolls}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-700 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                Active Employees
                            </p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                {activePayrolls}
                            </p>
                            <div className="mt-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                                >
                                    {totalPayrolls > 0
                                        ? Math.round(
                                              (activePayrolls / totalPayrolls) *
                                                  100,
                                          )
                                        : 0}
                                    % Active
                                </Badge>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
