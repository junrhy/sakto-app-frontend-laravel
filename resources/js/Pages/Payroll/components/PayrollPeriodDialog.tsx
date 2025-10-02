import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { PayrollPeriod } from '../types';

interface PayrollPeriodDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<PayrollPeriod>) => void;
    currentPayrollPeriod?: PayrollPeriod | null;
}

export const PayrollPeriodDialog = ({
    isOpen,
    onClose,
    onSave,
    currentPayrollPeriod
}: PayrollPeriodDialogProps) => {
    const [formData, setFormData] = useState<Partial<PayrollPeriod>>({
        period_name: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        total_amount: 0,
        employee_count: 0,
        created_by: '',
        notes: ''
    });

    useEffect(() => {
        if (currentPayrollPeriod) {
            setFormData(currentPayrollPeriod);
        } else {
            setFormData({
                period_name: '',
                start_date: '',
                end_date: '',
                status: 'draft',
                total_amount: 0,
                employee_count: 0,
                created_by: '',
                notes: ''
            });
        }
    }, [currentPayrollPeriod, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field: keyof PayrollPeriod, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        {currentPayrollPeriod ? 'Edit Payroll Period' : 'Add Payroll Period'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="period_name" className="text-gray-700 dark:text-gray-300">
                            Period Name
                        </Label>
                        <Input
                            id="period_name"
                            value={formData.period_name || ''}
                            onChange={(e) => handleChange('period_name', e.target.value)}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="e.g., January 2024"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_date" className="text-gray-700 dark:text-gray-300">
                                Start Date
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date || ''}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date" className="text-gray-700 dark:text-gray-300">
                                End Date
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date || ''}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="total_amount" className="text-gray-700 dark:text-gray-300">
                                Total Amount
                            </Label>
                            <Input
                                id="total_amount"
                                type="number"
                                step="0.01"
                                value={formData.total_amount || ''}
                                onChange={(e) => handleChange('total_amount', parseFloat(e.target.value) || 0)}
                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="employee_count" className="text-gray-700 dark:text-gray-300">
                                Employee Count
                            </Label>
                            <Input
                                id="employee_count"
                                type="number"
                                value={formData.employee_count || ''}
                                onChange={(e) => handleChange('employee_count', parseInt(e.target.value) || 0)}
                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
                            Status
                        </Label>
                        <select
                            id="status"
                            value={formData.status || 'draft'}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        >
                            <option value="draft">Draft</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="created_by" className="text-gray-700 dark:text-gray-300">
                            Created By
                        </Label>
                        <Input
                            id="created_by"
                            value={formData.created_by || ''}
                            onChange={(e) => handleChange('created_by', e.target.value)}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            rows={3}
                            placeholder="Additional notes about this payroll period..."
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {currentPayrollPeriod ? 'Update' : 'Add'} Payroll Period
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
