import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Edit, Plus, Search, Trash, Users } from 'lucide-react';
import { Payroll } from '../types';
import { formatCurrency } from '../utils/formatting';

interface EmployeesTabProps {
    payrolls: Payroll[];
    selectedPayrolls: number[];
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    canEdit: boolean;
    canDelete: boolean;
    currency_symbol: string;
    onAddPayroll: () => void;
    onEditPayroll: (payroll: Payroll) => void;
    onDeletePayroll: (id: number) => void;
    onDeleteSelectedPayrolls: () => void;
    onTogglePayrollSelection: (id: number) => void;
    onSelectAllPayrolls: (payrolls: Payroll[], selected: boolean) => void;
    onSearchChange: (term: string) => void;
    onPageChange: (page: number) => void;
}

export const EmployeesTab = ({
    payrolls,
    selectedPayrolls,
    searchTerm,
    currentPage,
    itemsPerPage,
    canEdit,
    canDelete,
    currency_symbol,
    onAddPayroll,
    onEditPayroll,
    onDeletePayroll,
    onDeleteSelectedPayrolls,
    onTogglePayrollSelection,
    onSelectAllPayrolls,
    onSearchChange,
    onPageChange,
}: EmployeesTabProps) => {
    const filteredPayrolls = payrolls.filter(
        (payroll) =>
            payroll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payroll.position.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const paginatedPayrolls = filteredPayrolls.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const pageCount = Math.ceil(filteredPayrolls.length / itemsPerPage);

    return (
        <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Employee Management
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center space-x-2">
                        {canEdit && (
                            <Button
                                onClick={onAddPayroll}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Employee
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                onClick={onDeleteSelectedPayrolls}
                                variant="destructive"
                                disabled={selectedPayrolls.length === 0}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                                Selected
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-64 border-gray-300 bg-white pl-10 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-700">
                                <TableHead className="w-[50px] text-gray-900 dark:text-white">
                                    <Checkbox
                                        checked={
                                            selectedPayrolls.length ===
                                            paginatedPayrolls.length
                                        }
                                        onCheckedChange={(checked) =>
                                            onSelectAllPayrolls(
                                                paginatedPayrolls,
                                                !!checked,
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Employee ID
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Name
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Position
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Salary
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Start Date
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPayrolls.map((payroll) => (
                                <TableRow
                                    key={payroll.id}
                                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                >
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <Checkbox
                                            checked={selectedPayrolls.includes(
                                                payroll.id,
                                            )}
                                            onCheckedChange={() =>
                                                onTogglePayrollSelection(
                                                    payroll.id,
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                                        {payroll.employee_id || 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        {payroll.name}
                                    </TableCell>
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {payroll.position}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            Number(payroll.salary) || 0,
                                            currency_symbol,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {payroll.startDate}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                payroll.status === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                            }`}
                                        >
                                            {payroll.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {canEdit && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        onEditPayroll(payroll)
                                                    }
                                                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                                                >
                                                    <Edit className="mr-1 h-3 w-3" />{' '}
                                                    Edit
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        onDeletePayroll(
                                                            payroll.id,
                                                        )
                                                    }
                                                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                                                >
                                                    <Trash className="mr-1 h-3 w-3" />{' '}
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min(
                                currentPage * itemsPerPage,
                                filteredPayrolls.length,
                            )}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {filteredPayrolls.length}
                        </span>{' '}
                        employees
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() =>
                                onPageChange(Math.max(currentPage - 1, 1))
                            }
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Previous
                        </Button>
                        <div className="flex space-x-1">
                            {Array.from(
                                { length: pageCount },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    variant={
                                        currentPage === page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    className={
                                        currentPage === page
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            onClick={() =>
                                onPageChange(
                                    Math.min(currentPage + 1, pageCount),
                                )
                            }
                            disabled={currentPage === pageCount}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
