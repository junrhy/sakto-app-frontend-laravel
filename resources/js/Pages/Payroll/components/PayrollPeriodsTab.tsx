import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Calendar, Plus, Users } from 'lucide-react';
import { PayrollPeriod } from '../types';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatting';

interface PayrollPeriodsTabProps {
    payrollPeriods: PayrollPeriod[];
    canEdit: boolean;
    currency_symbol: string;
    onAddPayrollPeriod: () => void;
}

export const PayrollPeriodsTab = ({
    payrollPeriods,
    canEdit,
    currency_symbol,
    onAddPayrollPeriod,
}: PayrollPeriodsTabProps) => {
    return (
        <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    Payroll Periods
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6 flex justify-between">
                    <div className="flex items-center space-x-2">
                        {canEdit && (
                            <Button
                                onClick={onAddPayrollPeriod}
                                className="bg-gray-600 text-white hover:bg-gray-700"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Period
                            </Button>
                        )}
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-700">
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Period Name
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Start Date
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    End Date
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Total Amount
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Employee Count
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Created By
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(payrollPeriods) &&
                                payrollPeriods.map((period) => (
                                    <TableRow
                                        key={period.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="font-medium text-gray-900 dark:text-white">
                                            {period.period_name}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {new Date(
                                                period.start_date,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {new Date(
                                                period.end_date,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(period.status, 'period')}`}
                                            >
                                                {period.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(
                                                period.total_amount,
                                                currency_symbol,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                {period.employee_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {period.created_by}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
