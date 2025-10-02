import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { TrendingUp, Users } from 'lucide-react';
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
            <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-900/20 dark:to-gray-800/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Monthly Payroll
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(totalAmount, currency_symbol)}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-500">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-900/20 dark:to-gray-800/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Employees
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {totalPayrolls}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-500">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-900/20 dark:to-gray-800/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active Employees
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {activePayrolls}
                            </p>
                            <div className="mt-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-500">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
