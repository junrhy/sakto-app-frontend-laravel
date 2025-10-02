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
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { SalaryHistory } from '../types';
import { formatCurrency } from '../utils/formatting';

interface SalaryHistoryTabProps {
    salaryHistory: SalaryHistory[];
    canEdit: boolean;
    currency_symbol: string;
    onAddSalaryHistory: () => void;
}

export const SalaryHistoryTab = ({
    salaryHistory,
    canEdit,
    currency_symbol,
    onAddSalaryHistory,
}: SalaryHistoryTabProps) => {
    console.log('SalaryHistoryTab received data:', salaryHistory);
    
    return (
        <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Salary History
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6 flex justify-between">
                    <div className="flex items-center space-x-2">
                        {canEdit && (
                            <Button
                                onClick={onAddSalaryHistory}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Salary
                                History
                            </Button>
                        )}
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-700">
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Employee ID
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Previous Salary
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    New Salary
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Change
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Percentage
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Reason
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Effective Date
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(salaryHistory) &&
                                salaryHistory.map((history) => (
                                    <TableRow
                                        key={history.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="font-medium text-gray-900 dark:text-white">
                                            {history.employee_id}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {formatCurrency(
                                                history.previous_salary,
                                                currency_symbol,
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(
                                                history.new_salary,
                                                currency_symbol,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className={`flex items-center gap-1 ${
                                                    history.salary_change >= 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {history.salary_change >= 0 ? (
                                                    <TrendingUp className="h-4 w-4" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4" />
                                                )}
                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        history.salary_change,
                                                        currency_symbol,
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    history.percentage_change >=
                                                    0
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                }`}
                                            >
                                                {history.percentage_change >= 0
                                                    ? '+'
                                                    : ''}
                                                {history.percentage_change.toFixed(
                                                    2,
                                                )}
                                                %
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {history.change_reason}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {history.effective_date}
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
