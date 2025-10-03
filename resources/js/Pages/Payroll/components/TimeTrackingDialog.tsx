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
import { Payroll, TimeTracking } from '../types';

interface TimeTrackingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<TimeTracking>) => void;
    currentTimeTracking?: TimeTracking | null;
    employees: Payroll[];
}

export const TimeTrackingDialog = ({
    isOpen,
    onClose,
    onSave,
    currentTimeTracking,
    employees,
}: TimeTrackingDialogProps) => {
    const [formData, setFormData] = useState<Partial<TimeTracking>>({
        employee_id: '',
        work_date: '',
        clock_in: '',
        clock_out: '',
        hours_worked: 0,
        overtime_hours: 0,
        regular_hours: 0,
        status: 'present',
        notes: '',
        location: '',
    });

    useEffect(() => {
        if (currentTimeTracking) {
            // Format the dates and times for HTML inputs
            const formattedData = {
                ...currentTimeTracking,
                work_date: currentTimeTracking.work_date
                    ? new Date(currentTimeTracking.work_date)
                          .toISOString()
                          .split('T')[0]
                    : '',
                clock_in: currentTimeTracking.clock_in
                    ? new Date(currentTimeTracking.clock_in)
                          .toTimeString()
                          .slice(0, 5)
                    : '',
                clock_out: currentTimeTracking.clock_out
                    ? new Date(currentTimeTracking.clock_out)
                          .toTimeString()
                          .slice(0, 5)
                    : '',
            };
            setFormData(formattedData);
        } else {
            setFormData({
                employee_id: '',
                work_date: '',
                clock_in: '',
                clock_out: '',
                hours_worked: 0,
                overtime_hours: 0,
                regular_hours: 0,
                status: 'present',
                notes: '',
                location: '',
            });
        }
    }, [currentTimeTracking, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Format time fields to include seconds (H:i:s format)
        const formattedData = {
            ...formData,
            clock_in: formData.clock_in ? `${formData.clock_in}:00` : '',
            clock_out: formData.clock_out ? `${formData.clock_out}:00` : '',
        };

        onSave(formattedData);
    };

    const handleChange = (
        field: keyof TimeTracking,
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
                        {currentTimeTracking
                            ? 'Edit Time Entry'
                            : 'Add Time Entry'}
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
                                            key={`time-${employee.id}-${index}`}
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
                                htmlFor="work_date"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Work Date
                            </Label>
                            <Input
                                id="work_date"
                                type="date"
                                value={formData.work_date || ''}
                                onChange={(e) =>
                                    handleChange('work_date', e.target.value)
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label
                                htmlFor="clock_in"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Clock In
                            </Label>
                            <Input
                                id="clock_in"
                                type="time"
                                value={formData.clock_in || ''}
                                onChange={(e) =>
                                    handleChange('clock_in', e.target.value)
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="clock_out"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Clock Out
                            </Label>
                            <Input
                                id="clock_out"
                                type="time"
                                value={formData.clock_out || ''}
                                onChange={(e) =>
                                    handleChange('clock_out', e.target.value)
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label
                                htmlFor="hours_worked"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Hours Worked
                            </Label>
                            <Input
                                id="hours_worked"
                                type="number"
                                step="0.5"
                                value={formData.hours_worked || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'hours_worked',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="overtime_hours"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Overtime Hours
                            </Label>
                            <Input
                                id="overtime_hours"
                                type="number"
                                step="0.5"
                                value={formData.overtime_hours || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'overtime_hours',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="regular_hours"
                                className="text-gray-700 dark:text-gray-300"
                            >
                                Regular Hours
                            </Label>
                            <Input
                                id="regular_hours"
                                type="number"
                                step="0.5"
                                value={formData.regular_hours || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'regular_hours',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <Label
                            htmlFor="status"
                            className="text-gray-700 dark:text-gray-300"
                        >
                            Status
                        </Label>
                        <select
                            id="status"
                            value={formData.status || 'present'}
                            onChange={(e) =>
                                handleChange('status', e.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                        >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="half_day">Half Day</option>
                            <option value="leave">Leave</option>
                        </select>
                    </div>

                    <div>
                        <Label
                            htmlFor="location"
                            className="text-gray-700 dark:text-gray-300"
                        >
                            Location
                        </Label>
                        <Input
                            id="location"
                            value={formData.location || ''}
                            onChange={(e) =>
                                handleChange('location', e.target.value)
                            }
                            className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Office, Remote, Client Site"
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
                            placeholder="Additional notes about this time entry..."
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
                            className="bg-orange-600 text-white hover:bg-orange-700"
                        >
                            {currentTimeTracking ? 'Update' : 'Add'} Time Entry
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
