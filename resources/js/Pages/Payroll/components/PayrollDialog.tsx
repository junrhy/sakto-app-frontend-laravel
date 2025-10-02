import { Button } from '@/Components/ui/button';
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
import { Payroll } from '../types';

interface PayrollDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentPayroll: Payroll | null;
    onSave: (e: React.FormEvent) => void;
    onPayrollChange: (payroll: Payroll) => void;
}

export const PayrollDialog = ({
    isOpen,
    onClose,
    currentPayroll,
    onSave,
    onPayrollChange,
}: PayrollDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {currentPayroll?.id ? 'Edit Payroll' : 'Add Payroll'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSave}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={currentPayroll?.name || ''}
                                onChange={(e) =>
                                    onPayrollChange({
                                        ...currentPayroll!,
                                        name: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={currentPayroll?.email || ''}
                                onChange={(e) =>
                                    onPayrollChange({
                                        ...currentPayroll!,
                                        email: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">
                                Position
                            </Label>
                            <Input
                                id="position"
                                value={currentPayroll?.position || ''}
                                onChange={(e) =>
                                    onPayrollChange({
                                        ...currentPayroll!,
                                        position: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="salary" className="text-right">
                                Salary
                            </Label>
                            <Input
                                id="salary"
                                type="number"
                                value={currentPayroll?.salary || ''}
                                onChange={(e) =>
                                    onPayrollChange({
                                        ...currentPayroll!,
                                        salary: parseFloat(e.target.value),
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">
                                Start Date
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={currentPayroll?.startDate || ''}
                                onChange={(e) =>
                                    onPayrollChange({
                                        ...currentPayroll!,
                                        startDate: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                value={currentPayroll?.status || ''}
                                onValueChange={(value: 'active' | 'inactive') =>
                                    onPayrollChange({
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
    );
};
