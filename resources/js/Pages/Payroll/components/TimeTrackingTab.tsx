import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { AlertCircle, Clock, MapPin, Plus, Timer } from 'lucide-react';
import { TimeTracking } from '../types';
import { getStatusBadgeClass } from '../utils/formatting';

interface TimeTrackingTabProps {
    timeTracking: TimeTracking[];
    canEdit: boolean;
    onAddTimeTracking: () => void;
}

export const TimeTrackingTab = ({
    timeTracking,
    canEdit,
    onAddTimeTracking,
}: TimeTrackingTabProps) => {
    console.log('TimeTrackingTab received data:', timeTracking);
    
    return (
        <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Time Tracking
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6 flex justify-between">
                    <div className="flex items-center space-x-2">
                        {canEdit && (
                            <Button
                                onClick={onAddTimeTracking}
                                className="bg-orange-600 text-white hover:bg-orange-700"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Time Entry
                            </Button>
                        )}
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-700">
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Employee ID
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Work Date
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Clock In
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Clock Out
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Hours Worked
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Overtime
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-white">
                                    Location
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.isArray(timeTracking) &&
                                timeTracking.map((tracking) => (
                                    <TableRow
                                        key={tracking.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="font-medium text-gray-900 dark:text-white">
                                            {tracking.employee_id}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {tracking.work_date}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {tracking.clock_in ? (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    {tracking.clock_in}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {tracking.clock_out ? (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    {tracking.clock_out}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-1">
                                                <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                {tracking.hours_worked}h
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {tracking.overtime_hours > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                    {tracking.overtime_hours}h
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(tracking.status, 'tracking')}`}
                                            >
                                                {tracking.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">
                                            {tracking.location ? (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    {tracking.location}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
