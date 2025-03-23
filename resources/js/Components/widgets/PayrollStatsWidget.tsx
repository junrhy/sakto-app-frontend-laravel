import { Card, CardContent } from "@/Components/ui/card";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Users, DollarSign, Building2, Calendar, Clock, Briefcase } from "lucide-react";
import { Progress } from "@/Components/ui/progress";

interface Employee {
    id: string;
    name: string;
    email: string;
    position: string;
    salary: number;
    startDate: string;
    status: 'active' | 'inactive';
}

interface PayrollOverview {
    total_employees: number;
    active_employees: number;
    total_salary: number;
    average_salary: number;
    departments: {
        name: string;
        count: number;
    }[];
    upcoming_payroll: {
        date: string;
        amount: number;
    };
}

export function PayrollStatsWidget() {
    // This would typically come from your API
    const employees: Employee[] = [
        {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            position: "Software Engineer",
            salary: 75000,
            startDate: "2024-01-01",
            status: "active"
        },
        {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            position: "Product Manager",
            salary: 95000,
            startDate: "2024-02-01",
            status: "active"
        }
    ];

    const overview: PayrollOverview = {
        total_employees: 2,
        active_employees: 2,
        total_salary: 170000,
        average_salary: 85000,
        departments: [
            { name: "Engineering", count: 1 },
            { name: "Product", count: 1 }
        ],
        upcoming_payroll: {
            date: "2024-04-15",
            amount: 85000
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payroll Overview</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Next Payroll:</span>
                    <span className="text-sm font-medium">
                        {new Date(overview.upcoming_payroll.date).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Active Employees</span>
                            </div>
                            <span className="text-sm font-medium">{overview.active_employees}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Total Salary</span>
                            </div>
                            <span className="text-sm font-medium">${overview.total_salary.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">Departments</span>
                            </div>
                            <span className="text-sm font-medium">{overview.departments.length}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                <span className="text-sm">Next Payroll</span>
                            </div>
                            <span className="text-sm font-medium">${overview.upcoming_payroll.amount.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Department Distribution */}
            <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Department Distribution</h4>
                <div className="space-y-4">
                    {overview.departments.map((dept) => (
                        <div key={dept.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{dept.name}</span>
                            </div>
                            <span className="text-sm font-medium">{dept.count} employees</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Employees */}
            <ScrollArea className="h-[calc(100%-20rem)]">
                <div className="space-y-4">
                    {employees.map((employee) => (
                        <Card key={employee.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <Users className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">
                                                {employee.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ${employee.salary.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-2">
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