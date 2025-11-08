import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    HandymanTask,
    HandymanTaskOverview,
    HandymanTechnician,
} from '@/types/handyman';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { HandymanTaskRequestPayload, TaskFormDialog } from './TaskFormDialog';
import {
    TechnicianFormDialog,
    TechnicianPayload,
} from './TechnicianFormDialog';

interface TechnicianSchedulingBoardProps {
    technicians: HandymanTechnician[];
    tasks: HandymanTask[];
    overview: HandymanTaskOverview[];
    onCreateTask: (payload: HandymanTaskRequestPayload) => Promise<void>;
    onUpdateTask: (
        taskId: number,
        payload: HandymanTaskRequestPayload,
    ) => Promise<void>;
    onCreateTechnician: (payload: TechnicianPayload) => Promise<void>;
    onUpdateTechnician: (
        technicianId: number,
        payload: TechnicianPayload,
    ) => Promise<void>;
    onDeleteTechnician: (technicianId: number) => Promise<void>;
    submitting?: boolean;
    technicianSubmitting?: boolean;
}

const statusColors: Record<string, string> = {
    scheduled:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    in_progress:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    completed:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    cancelled:
        'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    available:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    assigned:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    'off-duty':
        'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
    'on-leave':
        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    overlap: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    double_booked:
        'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    none: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    low: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    high: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    urgent: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

function getStatusBadge(status: string) {
    return (
        statusColors[status] ??
        'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200'
    );
}

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM dd, yyyy • hh:mm a');
    } catch {
        return value;
    }
};

export function TechnicianSchedulingBoard({
    technicians,
    tasks,
    overview,
    onCreateTask,
    onUpdateTask,
    onCreateTechnician,
    onUpdateTechnician,
    onDeleteTechnician,
    submitting = false,
    technicianSubmitting = false,
}: TechnicianSchedulingBoardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<HandymanTask | null>(null);
    const [isTechnicianDialogOpen, setIsTechnicianDialogOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] =
        useState<HandymanTechnician | null>(null);

    const totalTechnicians = technicians.length;
    const statusCounts = useMemo(
        () =>
            technicians.reduce<Record<string, number>>((acc, technician) => {
                acc[technician.status] = (acc[technician.status] ?? 0) + 1;
                return acc;
            }, {}),
        [technicians],
    );

    const workloadByTechnician = useMemo(
        () =>
            technicians.map((technician) => ({
                ...technician,
                assignments: tasks.flatMap((task) =>
                    (task.assignments ?? [])
                        .filter(
                            (assignment) =>
                                assignment.technician_id === technician.id,
                        )
                        .map((assignment) => ({
                            task,
                            assignment,
                        })),
                ),
            })),
        [technicians, tasks],
    );

    const totalTasks = tasks.length;
    const activeTasks =
        overview.find((item) => item.status === 'in_progress')?.total ?? 0;
    const scheduledTasks =
        overview.find((item) => item.status === 'scheduled')?.total ?? 0;

    const handleCreateClick = () => {
        setEditingTask(null);
        setIsDialogOpen(true);
    };

    const handleEditTask = (task: HandymanTask) => {
        setEditingTask(task);
        setIsDialogOpen(true);
    };

    const handleSubmitTask = async (payload: HandymanTaskRequestPayload) => {
        if (editingTask) {
            await onUpdateTask(editingTask.id, payload);
        } else {
            await onCreateTask(payload);
        }
        setIsDialogOpen(false);
        setEditingTask(null);
    };

    const handleCreateTechnician = () => {
        setEditingTechnician(null);
        setIsTechnicianDialogOpen(true);
    };

    const handleEditTechnician = (technician: HandymanTechnician) => {
        setEditingTechnician(technician);
        setIsTechnicianDialogOpen(true);
    };

    const handleDeleteTechnician = (technician: HandymanTechnician) => {
        if (window.confirm(`Remove ${technician.name} from the roster?`)) {
            onDeleteTechnician(technician.id);
        }
    };

    const handleSubmitTechnician = async (payload: TechnicianPayload) => {
        if (editingTechnician) {
            await onUpdateTechnician(editingTechnician.id, payload);
        } else {
            await onCreateTechnician(payload);
        }
        setIsTechnicianDialogOpen(false);
        setEditingTechnician(null);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Total Technicians
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {totalTechnicians}
                        </div>
                        <p className="text-sm text-gray-500">
                            {statusCounts.available ?? 0} available right now
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Active Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {activeTasks} / {totalTasks}
                        </div>
                        <p className="text-sm text-gray-500">
                            Active tasks out of total jobs
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Upcoming Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {scheduledTasks}
                        </div>
                        <p className="text-sm text-gray-500">
                            Scheduled jobs waiting to start
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg">
                        Technician Workload & Conflicts
                    </CardTitle>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCreateTechnician}
                        >
                            New Technician
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleCreateClick}
                            className="sm:w-auto"
                        >
                            New Task
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Technician
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Assignments
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Next Task
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Conflicts
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workloadByTechnician.map((technician) => {
                                const nextTask = technician.assignments
                                    .map((item) => item.task)
                                    .filter((task) => task.scheduled_start_at)
                                    .sort((a, b) =>
                                        (
                                            a.scheduled_start_at ?? ''
                                        ).localeCompare(
                                            b.scheduled_start_at ?? '',
                                        ),
                                    )[0];

                                const conflicts = technician.assignments.filter(
                                    (item) =>
                                        item.assignment.conflict_status &&
                                        item.assignment.conflict_status !==
                                            'none',
                                );

                                return (
                                    <TableRow
                                        key={technician.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {technician.name}
                                                </p>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {technician.specialty ||
                                                        'General technician'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Current load:{' '}
                                                    {technician.current_load} |
                                                    Active assignments:{' '}
                                                    {technician.active_assignments_count ??
                                                        0}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <Badge
                                                className={getStatusBadge(
                                                    technician.status,
                                                )}
                                            >
                                                {technician.status.replace(
                                                    '-',
                                                    ' ',
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="space-y-1">
                                                <p className="text-sm">
                                                    {
                                                        technician.assignments
                                                            .length
                                                    }{' '}
                                                    assignment(s)
                                                </p>
                                                {technician.skills?.length ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {technician.skills
                                                            .slice(0, 3)
                                                            .map((skill) => (
                                                                <Badge
                                                                    key={`${technician.id}-${skill}`}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                        {technician.skills
                                                            .length > 3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +
                                                                {technician
                                                                    .skills
                                                                    .length -
                                                                    3}{' '}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {nextTask ? (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">
                                                        {nextTask.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDateTime(
                                                            nextTask.scheduled_start_at,
                                                        )}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    No upcoming tasks
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {conflicts.length ? (
                                                <div className="space-y-1">
                                                    {conflicts.map((item) => (
                                                        <Badge
                                                            key={
                                                                item.assignment
                                                                    .id
                                                            }
                                                            className={getStatusBadge(
                                                                item.assignment
                                                                    .conflict_status ??
                                                                    'overlap',
                                                            )}
                                                        >
                                                            {
                                                                item.assignment
                                                                    .conflict_status
                                                            }
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Badge
                                                    className={getStatusBadge(
                                                        'none',
                                                    )}
                                                >
                                                    Clear
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-gray-900 dark:text-white">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditTechnician(
                                                            technician,
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteTechnician(
                                                            technician,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Scheduling Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Job
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Schedule
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Technicians
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Priority
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow
                                    key={task.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {task.reference_number}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            <p className="text-sm">
                                                {formatDateTime(
                                                    task.scheduled_start_at,
                                                )}
                                            </p>
                                            <Separator className="my-1" />
                                            <p className="text-sm">
                                                {formatDateTime(
                                                    task.scheduled_end_at,
                                                )}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            {(task.assignments ?? []).map(
                                                (assignment) => (
                                                    <div
                                                        key={assignment.id}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <span>
                                                            {assignment
                                                                .technician
                                                                ?.name ??
                                                                'Unassigned'}
                                                        </span>
                                                        {assignment.is_primary ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                Lead
                                                            </Badge>
                                                        ) : null}
                                                        {assignment.conflict_status &&
                                                        assignment.conflict_status !==
                                                            'none' ? (
                                                            <Badge
                                                                className={getStatusBadge(
                                                                    assignment.conflict_status,
                                                                )}
                                                            >
                                                                {
                                                                    assignment.conflict_status
                                                                }
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                ),
                                            )}
                                            {(task.assignments?.length ?? 0) ===
                                            0 ? (
                                                <span className="text-sm text-gray-500">
                                                    Awaiting assignment
                                                </span>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <Badge
                                            className={getStatusBadge(
                                                task.priority,
                                            )}
                                        >
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                        <Badge
                                            className={getStatusBadge(
                                                task.status,
                                            )}
                                        >
                                            {task.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditTask(task)}
                                        >
                                            <Pencil2Icon className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <TaskFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                technicians={technicians}
                task={editingTask}
                onSubmit={handleSubmitTask}
                submitting={submitting}
            />
            <TechnicianFormDialog
                open={isTechnicianDialogOpen}
                onOpenChange={setIsTechnicianDialogOpen}
                technician={editingTechnician}
                onSubmit={handleSubmitTechnician}
                submitting={technicianSubmitting}
            />
        </div>
    );
}
