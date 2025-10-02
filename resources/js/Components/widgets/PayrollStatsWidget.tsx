import { Card, CardContent } from '@/Components/ui/card';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    AlertCircle,
    Calendar,
    DollarSign,
    Loader2,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Employee {
    id: number;
    name: string;
    email: string;
    position: string;
    salary: number;
    startDate: string;
    status: 'active' | 'inactive';
    client_identifier: string;
}

interface PayrollOverview {
    totalEmployees: number;
    activeEmployees: number;
    totalPayroll: number;
    averageSalary?: number;
    upcomingPayroll?: {
        date: string;
        amount: number;
    };
}

export function PayrollStatsWidget() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [overview, setOverview] = useState<PayrollOverview | null>(null);
    const [currency, setCurrency] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPayrollData();
    }, []);

    const fetchPayrollData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching payroll data from frontend routes...');

            // Use frontend routes that handle authentication properly
            const [employeesResponse, overviewResponse] = await Promise.all([
                fetch('/payroll/list'), // Use the getList route
                fetch('/payroll/overview'), // Use the getOverview route
            ]);

            console.log('Frontend Route Responses:', {
                employeesStatus: employeesResponse.status,
                overviewStatus: overviewResponse.status,
                employeesOk: employeesResponse.ok,
                overviewOk: overviewResponse.ok,
            });

            if (!employeesResponse.ok || !overviewResponse.ok) {
                const employeesText = await employeesResponse.text();
                const overviewText = await overviewResponse.text();

                console.error('Frontend Route Error Details:', {
                    employeesStatus: employeesResponse.status,
                    employeesBody: employeesText.substring(0, 200),
                    overviewStatus: overviewResponse.status,
                    overviewBody: overviewText.substring(0, 200),
                });

                throw new Error(
                    `Frontend route error: Employees (${employeesResponse.status}), Overview (${overviewResponse.status})`,
                );
            }

            const employeesData = await employeesResponse.json();
            const overviewData = await overviewResponse.json();

            console.log('Parsed Data from Frontend Routes:', {
                employeesData: employeesData,
                overviewData: overviewData,
                employeesCount: employeesData?.length || 0,
                currency: employeesData?.currency || overviewData?.currency,
            });

            // Convert object with numeric keys to array and handle string salaries
            let employeesList = [];
            if (Array.isArray(employeesData)) {
                employeesList = employeesData;
            } else if (employeesData && typeof employeesData === 'object') {
                // Convert object with numeric keys to array
                employeesList = Object.values(employeesData).filter(
                    (item) => item && typeof item === 'object' && 'id' in item,
                );
            }

            // Convert salary strings to numbers
            employeesList = employeesList.map((emp) => ({
                ...emp,
                salary: parseFloat(emp.salary) || 0,
            }));

            console.log('Processed Employees:', {
                employeesList: employeesList,
                count: employeesList.length,
            });

            setEmployees(employeesList);
            setOverview(overviewData);
            setCurrency(employeesData?.currency || overviewData?.currency);
        } catch (err) {
            console.error(
                'Error fetching payroll data from frontend routes:',
                err,
            );
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load payroll data',
            );
        } finally {
            setLoading(false);
        }
    };

    // Calculate derived data
    const calculateDerivedData = () => {
        if (!overview || !employees.length) return null;

        const activeEmployees = employees.filter(
            (emp) => emp.status === 'active',
        );
        // Note: Department data not available in database
        // const departments = employees.reduce((acc, emp) => {
        //     const dept = emp.position.split(' ')[0] || 'General';
        //     acc[dept] = (acc[dept] || 0) + 1;
        //     return acc;
        // }, {} as Record<string, number>);

        // const departmentList = Object.entries(departments).map(([name, count]) => ({
        //     name,
        //     count,
        // }));

        const averageSalary =
            activeEmployees.length > 0
                ? activeEmployees.reduce((sum, emp) => sum + emp.salary, 0) /
                  activeEmployees.length
                : 0;

        // Calculate next payroll date (assuming monthly payroll on 15th)
        const now = new Date();
        const nextPayrollDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            15,
        );
        const nextPayrollAmount = activeEmployees.reduce(
            (sum, emp) => sum + emp.salary,
            0,
        );

        // Calculate totals from employees if overview data is not available
        const totalEmployees = employees.length;
        const calculatedTotalPayroll = activeEmployees.reduce(
            (sum, emp) => sum + emp.salary,
            0,
        );

        return {
            totalEmployees: overview?.totalEmployees || totalEmployees,
            activeEmployees:
                overview?.activeEmployees || activeEmployees.length,
            totalPayroll:
                parseFloat(overview?.totalPayroll?.toString() || '0') ||
                calculatedTotalPayroll,
            averageSalary,
            // departments: departmentList, // Removed - no department data in database
            upcomingPayroll: {
                date: nextPayrollDate.toISOString().split('T')[0],
                amount: nextPayrollAmount,
            },
        };
    };

    const derivedData = calculateDerivedData();

    if (loading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-64 items-center justify-center">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Loading payroll data...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {error}
                        </span>
                        <button
                            onClick={fetchPayrollData}
                            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!derivedData) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-64 items-center justify-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        No payroll data available
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Payroll Overview
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Next Payroll:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {derivedData.upcomingPayroll
                            ? new Date(
                                  derivedData.upcomingPayroll.date,
                              ).toLocaleDateString()
                            : 'N/A'}
                    </span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <Card className="border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                    Active Employees
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {derivedData.activeEmployees}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                    Total Salary
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {currency
                                    ? `${currency.symbol}${derivedData.totalPayroll.toLocaleString(
                                          undefined,
                                          {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          },
                                      )}`
                                    : `$${derivedData.totalPayroll.toLocaleString()}`}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                    Average Salary
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {currency
                                    ? `${currency.symbol}${derivedData.averageSalary.toLocaleString(
                                          undefined,
                                          {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          },
                                      )}`
                                    : `$${derivedData.averageSalary.toLocaleString()}`}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                    Next Payroll
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {currency
                                    ? `${currency.symbol}${(
                                          derivedData.upcomingPayroll?.amount ||
                                          0
                                      ).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      })}`
                                    : `$${(derivedData.upcomingPayroll?.amount || 0).toLocaleString()}`}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Employees */}
            <ScrollArea className="h-[calc(100%-20rem)]">
                <div className="space-y-4">
                    {employees.slice(0, 10).map((employee) => (
                        <Card
                            key={employee.id}
                            className="border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <Users className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex items-center justify-between">
                                            <span className="truncate font-medium text-gray-900 dark:text-white">
                                                {employee.name}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {currency
                                                    ? `${currency.symbol}${employee.salary.toLocaleString(
                                                          undefined,
                                                          {
                                                              minimumFractionDigits: 2,
                                                              maximumFractionDigits: 2,
                                                          },
                                                      )}`
                                                    : `$${employee.salary.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <p className="mt-2 truncate text-sm text-gray-500 dark:text-gray-400">
                                            {employee.position}
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
