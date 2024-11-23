import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Search, DollarSign } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";
import axios from 'axios';

interface Payroll {
    id: number;
    name: string;
    position: string;
    salary: number;
    startDate: string;
    status: 'active' | 'inactive';
}
  
const INITIAL_PAYROLLS: Payroll[] = [
    { id: 1, name: "John Doe", position: "Manager", salary: 5000, startDate: "2022-01-01", status: 'active' },
    { id: 2, name: "Jane Smith", position: "Developer", salary: 4000, startDate: "2022-02-15", status: 'active' },
    { id: 3, name: "Bob Johnson", position: "Designer", salary: 3500, startDate: "2022-03-01", status: 'inactive' },
];

export default function Payroll() {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
    const [currentPayroll, setCurrentPayroll] = useState<Payroll | null>(null);
    const [selectedPayrolls, setSelectedPayrolls] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadPayrolls();
    }, []);

    const loadPayrolls = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/payroll/list');
            setPayrolls(response.data);
        } catch (error) {
            console.error('Error loading payrolls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayroll = () => {
        setCurrentPayroll(null);
        setIsPayrollDialogOpen(true);
    };

    const handleEditPayroll = (payroll: Payroll) => {
        setCurrentPayroll(payroll);
        setIsPayrollDialogOpen(true);
    };

    const handleDeletePayroll = async (id: number) => {
        try {
            await axios.delete(`/payroll/${id}`);
            loadPayrolls();
        } catch (error) {
            console.error('Error deleting payroll:', error);
        }
    };

    const handleDeleteSelectedPayrolls = async () => {
        try {
            await axios.delete('/payroll/bulk', {
                data: { ids: selectedPayrolls }
            });
            loadPayrolls();
            setSelectedPayrolls([]);
        } catch (error) {
            console.error('Error deleting selected payrolls:', error);
        }
    };

    const handleSavePayroll = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentPayroll) {
                if (currentPayroll.id) {
                    await axios.put(`/payroll/${currentPayroll.id}`, currentPayroll);
                } else {
                    await axios.post('/payroll', currentPayroll);
                }
                loadPayrolls();
                setIsPayrollDialogOpen(false);
                setCurrentPayroll(null);
            }
        } catch (error) {
            console.error('Error saving payroll:', error);
        }
    };

    const togglePayrollSelection = (id: number) => {
        setSelectedPayrolls(prev =>
            prev.includes(id) ? prev.filter(payrollId => payrollId !== id) : [...prev, id]
        );
    };

    const filteredPayrolls = useMemo(() => {
        return payrolls.filter(payroll =>
            payroll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payroll.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [payrolls, searchTerm]);

    const paginatedPayrolls = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPayrolls.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPayrolls, currentPage]);

    const pageCount = Math.ceil(filteredPayrolls.length / itemsPerPage);

    const calculateTotalPayroll = () => {
        return payrolls.reduce((total, payroll) => total + payroll.salary, 0);
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

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Card className="mb-4">
                    <CardHeader>
                    <CardTitle>Payroll Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">Total Monthly Payroll: ${calculateTotalPayroll().toFixed(2)}</div>
                    <div>Total Payrolls: {payrolls.length}</div>
                    <div>Active Payrolls: {payrolls.filter(p => p.status === 'active').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle>Payroll Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="flex justify-between mb-4">
                        <div className="flex items-center space-x-2">
                        <Button onClick={handleAddPayroll}>
                            <Plus className="mr-2 h-4 w-4" /> Add Payroll
                        </Button>
                        <Button 
                            onClick={handleDeleteSelectedPayrolls} 
                            variant="destructive" 
                            disabled={selectedPayrolls.length === 0}
                        >
                            <Trash className="mr-2 h-4 w-4" /> Delete Selected
                        </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search payrolls..."
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
                                checked={selectedPayrolls.length === paginatedPayrolls.length}
                                onCheckedChange={(checked) => {
                                if (checked) {
                                    setSelectedPayrolls(paginatedPayrolls.map(payroll => payroll.id));
                                } else {
                                    setSelectedPayrolls([]);
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
                        {paginatedPayrolls.map((payroll) => (
                            <TableRow key={payroll.id}>
                            <TableCell>
                                <Checkbox
                                checked={selectedPayrolls.includes(payroll.id)}
                                onCheckedChange={() => togglePayrollSelection(payroll.id)}
                                />
                            </TableCell>
                            <TableCell>{payroll.name}</TableCell>
                            <TableCell>{payroll.position}</TableCell>
                            <TableCell>${payroll.salary.toFixed(2)}</TableCell>
                            <TableCell>{payroll.startDate}</TableCell>
                            <TableCell>{payroll.status}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditPayroll(payroll)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeletePayroll(payroll.id)}>
                                <Trash className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPayrolls.length)} of {filteredPayrolls.length} payrolls
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

                <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentPayroll?.id ? 'Edit Payroll' : 'Add Payroll'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSavePayroll}>
                        <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                            id="name"
                            value={currentPayroll?.name || ''}
                            onChange={(e) => setCurrentPayroll({ ...currentPayroll!, name: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">Position</Label>
                            <Input
                            id="position"
                            value={currentPayroll?.position || ''}
                            onChange={(e) => setCurrentPayroll({ ...currentPayroll!, position: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="salary" className="text-right">Salary</Label>
                            <Input
                            id="salary"
                            type="number"
                            value={currentPayroll?.salary || ''}
                            onChange={(e) => setCurrentPayroll({ ...currentPayroll!, salary: parseFloat(e.target.value) })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">Start Date</Label>
                            <Input
                            id="startDate"
                            type="date"
                            value={currentPayroll?.startDate || ''}
                            onChange={(e) => setCurrentPayroll({ ...currentPayroll!, startDate: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select
                            value={currentPayroll?.status || ''}
                            onValueChange={(value: 'active' | 'inactive') => setCurrentPayroll({ ...currentPayroll!, status: value })}
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
        </AuthenticatedLayout>
    );
}
