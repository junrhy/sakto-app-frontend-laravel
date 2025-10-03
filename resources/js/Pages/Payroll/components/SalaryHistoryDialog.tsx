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
import { Textarea } from '@/Components/ui/textarea';
import React, { useEffect, useState } from 'react';
import { Payroll, SalaryHistory } from '../types';

interface SalaryHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<SalaryHistory>) => void;
    currentSalaryHistory?: SalaryHistory | null;
    employees: Payroll[];
}

export const SalaryHistoryDialog = ({
    isOpen,
    onClose,
    onSave,
    currentSalaryHistory,
    employees,
}: SalaryHistoryDialogProps) => {
    const [formData, setFormData] = useState<Partial<SalaryHistory>>({
        employee_id: '',
        previous_salary: 0,
        new_salary: 0,
        change_reason: '',
        approved_by: '',
        effective_date: '',
        notes: '',
    });

    useEffect(() => {
        if (currentSalaryHistory) {
            // Format the date for HTML date input (YYYY-MM-DD)
            const formattedData = {
                ...currentSalaryHistory,
                effective_date: currentSalaryHistory.effective_date
                    ? new Date(currentSalaryHistory.effective_date)
                          .toISOString()
                          .split('T')[0]
                    : '',
            };
            setFormData(formattedData);
        } else {
            setFormData({
                employee_id: '',
                previous_salary: 0,
                new_salary: 0,
                change_reason: '',
                approved_by: '',
                effective_date: '',
                notes: '',
            });
        }
    }, [currentSalaryHistory, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (
        field: keyof SalaryHistory,
        value: string | number,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        {currentSalaryHistory
                            ? 'Edit Salary History'
                            : 'Add Salary History'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label
                                htmlFor="employee_id"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Employee
                            </Label>
                            <Select
                                value={formData.employee_id?.toString() || ''}
                                onValueChange={(value) =>
                                    handleChange('employee_id', value)
                                }
                            >
                                <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee, index) => (
                                        <SelectItem
                                            key={`salary-${employee.id}-${index}`}
                                            value={
                                                employee.employee_id?.toString() ||
                                                employee.id.toString()
                                            }
                                        >
                                            {employee.name}{' '}
                                            {employee.employee_id
                                                ? `(ID: ${employee.employee_id})`
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label
                                htmlFor="effective_date"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Effective Date
                            </Label>
                            <Input
                                id="effective_date"
                                type="date"
                                value={formData.effective_date || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'effective_date',
                                        e.target.value,
                                    )
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label
                                htmlFor="previous_salary"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Previous Salary
                            </Label>
                            <Input
                                id="previous_salary"
                                type="number"
                                step="0.01"
                                value={formData.previous_salary || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'previous_salary',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="new_salary"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                New Salary
                            </Label>
                            <Input
                                id="new_salary"
                                type="number"
                                step="0.01"
                                value={formData.new_salary || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'new_salary',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label
                            htmlFor="change_reason"
                            className="text-gray-700 dark:text-gray-300"
                        >
                            Change Reason
                        </Label>
                        <Input
                            id="change_reason"
                            value={formData.change_reason || ''}
                            onChange={(e) =>
                                handleChange('change_reason', e.target.value)
                            }
                            className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="approved_by"
                            className="text-gray-700 dark:text-gray-300"
                        >
                            Approved By
                        </Label>
                        <Input
                            id="approved_by"
                            value={formData.approved_by || ''}
                            onChange={(e) =>
                                handleChange('approved_by', e.target.value)
                            }
                            className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <Label
                            htmlFor="notes"
                            className="text-gray-700 dark:text-gray-300"
                        >
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) =>
                                handleChange('notes', e.target.value)
                            }
                            className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {currentSalaryHistory ? 'Update' : 'Add'} Salary
                            History
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
