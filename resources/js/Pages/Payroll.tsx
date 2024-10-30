import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Search, DollarSign } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";

interface Employee {
    id: number;
    name: string;
    position: string;
    salary: number;
    startDate: string;
    status: 'active' | 'inactive';
}
  
const INITIAL_EMPLOYEES: Employee[] = [
    { id: 1, name: "John Doe", position: "Manager", salary: 5000, startDate: "2022-01-01", status: 'active' },
    { id: 2, name: "Jane Smith", position: "Developer", salary: 4000, startDate: "2022-02-15", status: 'active' },
    { id: 3, name: "Bob Johnson", position: "Designer", salary: 3500, startDate: "2022-03-01", status: 'inactive' },
];

export default function Payroll() {
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleAddEmployee = () => {
        setCurrentEmployee(null);
        setIsEmployeeDialogOpen(true);
    };

    const handleEditEmployee = (employee: Employee) => {
        setCurrentEmployee(employee);
        setIsEmployeeDialogOpen(true);
    };

    const handleDeleteEmployee = (id: number) => {
        setEmployees(employees.filter(employee => employee.id !== id));
        setSelectedEmployees(selectedEmployees.filter(employeeId => employeeId !== id));
    };

    const handleDeleteSelectedEmployees = () => {
        setEmployees(employees.filter(employee => !selectedEmployees.includes(employee.id)));
        setSelectedEmployees([]);
    };

    const handleSaveEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentEmployee) {
        if (currentEmployee.id) {
            // Edit existing employee
            setEmployees(employees.map(employee => 
            employee.id === currentEmployee.id ? currentEmployee : employee
            ));
        } else {
            // Add new employee
            setEmployees([...employees, { ...currentEmployee, id: Date.now() }]);
        }
        }
        setIsEmployeeDialogOpen(false);
        setCurrentEmployee(null);
    };

    const toggleEmployeeSelection = (id: number) => {
        setSelectedEmployees(prev =>
        prev.includes(id) ? prev.filter(employeeId => employeeId !== id) : [...prev, id]
        );
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEmployees, currentPage]);

    const pageCount = Math.ceil(filteredEmployees.length / itemsPerPage);

    const calculateTotalPayroll = () => {
        return employees.reduce((total, employee) => total + employee.salary, 0);
    };
    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Payroll
                </h2>
            }
        >
            <Head title="Payroll" />

            <div className="py-0">
                <div className="">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 border-2">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <Card className="mb-4">
                                <CardHeader>
                                <CardTitle>Payroll Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                <div className="text-2xl font-bold">Total Monthly Payroll: ${calculateTotalPayroll().toFixed(2)}</div>
                                <div>Total Employees: {employees.length}</div>
                                <div>Active Employees: {employees.filter(e => e.status === 'active').length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                <CardTitle>Employee Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                <div className="flex justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                    <Button onClick={handleAddEmployee}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Employee
                                    </Button>
                                    <Button 
                                        onClick={handleDeleteSelectedEmployees} 
                                        variant="destructive" 
                                        disabled={selectedEmployees.length === 0}
                                    >
                                        <Trash className="mr-2 h-4 w-4" /> Delete Selected
                                    </Button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <Search className="h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search employees..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={selectedEmployees.length === paginatedEmployees.length}
                                            onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedEmployees(paginatedEmployees.map(employee => employee.id));
                                            } else {
                                                setSelectedEmployees([]);
                                            }
                                            }}
                                        />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Salary</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {paginatedEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                        <TableCell>
                                            <Checkbox
                                            checked={selectedEmployees.includes(employee.id)}
                                            onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{employee.name}</TableCell>
                                        <TableCell>{employee.position}</TableCell>
                                        <TableCell>${employee.salary.toFixed(2)}</TableCell>
                                        <TableCell>{employee.startDate}</TableCell>
                                        <TableCell>{employee.status}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditEmployee(employee)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEmployee(employee.id)}>
                                            <Trash className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
                                    </div>
                                    <div className="flex space-x-2">
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                        <Button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        variant={currentPage === page ? "default" : "outline"}
                                        >
                                        {page}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                                        disabled={currentPage === pageCount}
                                    >
                                        Next
                                    </Button>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>

                            <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
                                <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{currentEmployee?.id ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSaveEmployee}>
                                    <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input
                                        id="name"
                                        value={currentEmployee?.name || ''}
                                        onChange={(e) => setCurrentEmployee({ ...currentEmployee!, name: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="position" className="text-right">Position</Label>
                                        <Input
                                        id="position"
                                        value={currentEmployee?.position || ''}
                                        onChange={(e) => setCurrentEmployee({ ...currentEmployee!, position: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="salary" className="text-right">Salary</Label>
                                        <Input
                                        id="salary"
                                        type="number"
                                        value={currentEmployee?.salary || ''}
                                        onChange={(e) => setCurrentEmployee({ ...currentEmployee!, salary: parseFloat(e.target.value) })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="startDate" className="text-right">Start Date</Label>
                                        <Input
                                        id="startDate"
                                        type="date"
                                        value={currentEmployee?.startDate || ''}
                                        onChange={(e) => setCurrentEmployee({ ...currentEmployee!, startDate: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <Select
                                        value={currentEmployee?.status || ''}
                                        onValueChange={(value: 'active' | 'inactive') => setCurrentEmployee({ ...currentEmployee!, status: value })}
                                        >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    </div>
                                    </div>
                                    <DialogFooter>
                                    <Button type="submit">Save</Button>
                                    </DialogFooter>
                                </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
