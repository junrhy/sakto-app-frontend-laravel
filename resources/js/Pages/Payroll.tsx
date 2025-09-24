import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Edit, Plus, Search, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Payroll {
    id: number;
    name: string;
    email: string;
    position: string;
    salary: number;
    startDate: string;
    status: 'active' | 'inactive';
}

interface Props extends PageProps {
    currency_symbol?: string;
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
}

export default function Payroll({ currency_symbol = '$', auth }: Props) {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
    const [currentPayroll, setCurrentPayroll] = useState<Payroll | null>(null);
    const [selectedPayrolls, setSelectedPayrolls] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

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
                data: { ids: selectedPayrolls },
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
                    await axios.put(
                        `/payroll/${currentPayroll.id}`,
                        currentPayroll,
                    );
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
        setSelectedPayrolls((prev) =>
            prev.includes(id)
                ? prev.filter((payrollId) => payrollId !== id)
                : [...prev, id],
        );
    };

    const filteredPayrolls = useMemo(() => {
        return payrolls.filter(
            (payroll) =>
                payroll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payroll.position
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        );
    }, [payrolls, searchTerm]);

    const paginatedPayrolls = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPayrolls.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPayrolls, currentPage]);

    const pageCount = Math.ceil(filteredPayrolls.length / itemsPerPage);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
            .format(amount)
            .replace('$', currency_symbol);
    };

    const calculateTotalPayroll = () => {
        if (!payrolls || payrolls.length === 0) return 0;
        return payrolls.reduce((total, payroll) => {
            const salary = Number(payroll.salary) || 0;
            return total + salary;
        }, 0);
    };

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Payroll
                </h2>
            }
        >
            <Head title="Payroll" />

            <div className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-700">
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Payroll Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            Total Monthly Payroll:{' '}
                            {formatCurrency(calculateTotalPayroll())}
                        </div>
                        <div>Total Payrolls: {payrolls.length}</div>
                        <div>
                            Active Payrolls:{' '}
                            {
                                payrolls.filter((p) => p.status === 'active')
                                    .length
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payroll Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex justify-between">
                            <div className="flex items-center space-x-2">
                                {canEdit && (
                                    <Button onClick={handleAddPayroll}>
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Payroll
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDeleteSelectedPayrolls}
                                        variant="destructive"
                                        disabled={selectedPayrolls.length === 0}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />{' '}
                                        Delete Selected
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search payrolls..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-64"
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={
                                                selectedPayrolls.length ===
                                                paginatedPayrolls.length
                                            }
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedPayrolls(
                                                        paginatedPayrolls.map(
                                                            (payroll) =>
                                                                payroll.id,
                                                        ),
                                                    );
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
                                                checked={selectedPayrolls.includes(
                                                    payroll.id,
                                                )}
                                                onCheckedChange={() =>
                                                    togglePayrollSelection(
                                                        payroll.id,
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{payroll.name}</TableCell>
                                        <TableCell>
                                            {payroll.position}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                Number(payroll.salary) || 0,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {payroll.startDate}
                                        </TableCell>
                                        <TableCell>{payroll.status}</TableCell>
                                        <TableCell>
                                            {canEdit && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() =>
                                                        handleEditPayroll(
                                                            payroll,
                                                        )
                                                    }
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />{' '}
                                                    Edit
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeletePayroll(
                                                            payroll.id,
                                                        )
                                                    }
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />{' '}
                                                    Delete
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredPayrolls.length,
                                )}{' '}
                                of {filteredPayrolls.length} payrolls
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from(
                                    { length: pageCount },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        variant={
                                            currentPage === page
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, pageCount),
                                        )
                                    }
                                    disabled={currentPage === pageCount}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog
                    open={isPayrollDialogOpen}
                    onOpenChange={setIsPayrollDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {currentPayroll?.id
                                    ? 'Edit Payroll'
                                    : 'Add Payroll'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSavePayroll}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="name"
                                        className="text-right"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={currentPayroll?.name || ''}
                                        onChange={(e) =>
                                            setCurrentPayroll({
                                                ...currentPayroll!,
                                                name: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="email"
                                        className="text-right"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        value={currentPayroll?.email || ''}
                                        onChange={(e) =>
                                            setCurrentPayroll({
                                                ...currentPayroll!,
                                                email: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="position"
                                        className="text-right"
                                    >
                                        Position
                                    </Label>
                                    <Input
                                        id="position"
                                        value={currentPayroll?.position || ''}
                                        onChange={(e) =>
                                            setCurrentPayroll({
                                                ...currentPayroll!,
                                                position: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="salary"
                                        className="text-right"
                                    >
                                        Salary
                                    </Label>
                                    <Input
                                        id="salary"
                                        type="number"
                                        value={currentPayroll?.salary || ''}
                                        onChange={(e) =>
                                            setCurrentPayroll({
                                                ...currentPayroll!,
                                                salary: parseFloat(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="startDate"
                                        className="text-right"
                                    >
                                        Start Date
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={currentPayroll?.startDate || ''}
                                        onChange={(e) =>
                                            setCurrentPayroll({
                                                ...currentPayroll!,
                                                startDate: e.target.value,
                                            })
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="status"
                                        className="text-right"
                                    >
                                        Status
                                    </Label>
                                    <Select
                                        value={currentPayroll?.status || ''}
                                        onValueChange={(
                                            value: 'active' | 'inactive',
                                        ) =>
                                            setCurrentPayroll({
                                                ...currentPayroll!,
                                                status: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
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
