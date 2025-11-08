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
    HandymanTechnician,
    HandymanWorkOrder,
    HandymanWorkOrderTimeLog,
} from '@/types/handyman';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import {
    HandymanWorkOrderRequestPayload,
    WorkOrderFormDialog,
} from './WorkOrderFormDialog';

interface FieldWorkOrderTrackerProps {
    workOrders: HandymanWorkOrder[];
    technicians: HandymanTechnician[];
    onCreateWorkOrder: (
        payload: HandymanWorkOrderRequestPayload,
    ) => Promise<void>;
    onUpdateWorkOrder: (
        workOrderId: number,
        payload: HandymanWorkOrderRequestPayload,
    ) => Promise<void>;
    submitting?: boolean;
}

const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
    assigned:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    in_progress:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    awaiting_approval:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    completed:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    cancelled:
        'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM dd, yyyy • hh:mm a');
    } catch {
        return value;
    }
};

const formatDuration = (value?: number | null) => {
    if (!value) return '—';
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (!hours) {
        return `${minutes}m`;
    }
    if (!minutes) {
        return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
};

const summarizeTime = (logs?: HandymanWorkOrderTimeLog[]) => {
    if (!logs?.length) return 'No logs';
    const totalMinutes = logs.reduce(
        (sum, log) => sum + (log.duration_minutes ?? 0),
        0,
    );
    return formatDuration(totalMinutes) ?? 'No logs';
};

export function FieldWorkOrderTracker({
    workOrders,
    technicians,
    onCreateWorkOrder,
    onUpdateWorkOrder,
    submitting = false,
}: FieldWorkOrderTrackerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingWorkOrder, setEditingWorkOrder] =
        useState<HandymanWorkOrder | null>(null);

    const stats = workOrders.reduce<Record<string, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] ?? 0) + 1;
        return acc;
    }, {});

    const completed = stats.completed ?? 0;
    const active = (stats.in_progress ?? 0) + (stats.assigned ?? 0);
    const awaiting = stats.awaiting_approval ?? 0;

    const handleCreateWorkOrder = () => {
        setEditingWorkOrder(null);
        setIsDialogOpen(true);
    };

    const handleEditWorkOrder = (workOrder: HandymanWorkOrder) => {
        setEditingWorkOrder(workOrder);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (payload: HandymanWorkOrderRequestPayload) => {
        if (editingWorkOrder) {
            await onUpdateWorkOrder(editingWorkOrder.id, payload);
        } else {
            await onCreateWorkOrder(payload);
        }
        setIsDialogOpen(false);
        setEditingWorkOrder(null);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Active Work Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {active}
                        </div>
                        <p className="text-sm text-gray-500">
                            Currently in field execution
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Awaiting Approval
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {awaiting}
                        </div>
                        <p className="text-sm text-gray-500">
                            Orders needing sign-off or QA
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Completed This Cycle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {completed}
                        </div>
                        <p className="text-sm text-gray-500">
                            Ready for invoicing or archival
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg">Work Order Board</CardTitle>
                    <Button
                        size="sm"
                        onClick={handleCreateWorkOrder}
                        className="w-full sm:w-auto"
                    >
                        New Work Order
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Reference
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Customer
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Schedule
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Scope & Materials
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Time Logs
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
                            {workOrders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {order.reference_number}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.task?.title ??
                                                    'No linked task'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {order.customer_name ??
                                                    'Walk-in'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.customer_contact ?? '—'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.customer_address ??
                                                    'No location recorded'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1 text-sm">
                                            <div>
                                                <p className="text-xs uppercase text-gray-500">
                                                    Scheduled
                                                </p>
                                                <p>
                                                    {formatDateTime(
                                                        order.scheduled_at,
                                                    )}
                                                </p>
                                            </div>
                                            <Separator className="my-1" />
                                            <div>
                                                <p className="text-xs uppercase text-gray-500">
                                                    Actual
                                                </p>
                                                <p>
                                                    {formatDateTime(
                                                        order.started_at,
                                                    )}
                                                </p>
                                                <p>
                                                    {formatDateTime(
                                                        order.completed_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-2 text-sm">
                                            {order.scope_of_work ? (
                                                <p>{order.scope_of_work}</p>
                                            ) : (
                                                <p className="text-gray-500">
                                                    No scope details
                                                </p>
                                            )}
                                            {(order.materials?.length ?? 0) ? (
                                                <div>
                                                    <p className="text-xs uppercase text-gray-500">
                                                        Materials
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.materials
                                                            ?.slice(0, 4)
                                                            .map((material) => (
                                                                <Badge
                                                                    key={`${order.id}-${material}`}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {material}
                                                                </Badge>
                                                            ))}
                                                        {order.materials &&
                                                        order.materials.length >
                                                            4 ? (
                                                            <span className="text-xs text-gray-500">
                                                                +
                                                                {order.materials
                                                                    .length -
                                                                    4}{' '}
                                                                more
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium">
                                                {summarizeTime(order.time_logs)}
                                            </p>
                                            {(order.time_logs ?? [])
                                                .slice(0, 2)
                                                .map((log) => (
                                                    <div
                                                        key={log.id}
                                                        className="flex flex-col gap-0.5 text-xs text-gray-500"
                                                    >
                                                        <span>
                                                            {log.technician
                                                                ?.name ??
                                                                'Unknown tech'}{' '}
                                                            •{' '}
                                                            {formatDuration(
                                                                log.duration_minutes,
                                                            )}
                                                        </span>
                                                        <span>
                                                            {formatDateTime(
                                                                log.started_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            {(order.time_logs?.length ?? 0) >
                                            2 ? (
                                                <span className="text-xs text-gray-500">
                                                    +
                                                    {(order.time_logs?.length ??
                                                        0) - 2}{' '}
                                                    more logs
                                                </span>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                        <Badge
                                            className={
                                                statusColors[order.status] ??
                                                statusColors.draft
                                            }
                                        >
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleEditWorkOrder(order)
                                            }
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Attachments & Documentation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {workOrders.map((order) => (
                        <div
                            key={`attachments-${order.id}`}
                            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {order.reference_number}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {order.attachments?.length ?? 0}{' '}
                                        attachment(s)
                                    </p>
                                </div>
                                <Badge
                                    className={
                                        statusColors[order.status] ??
                                        statusColors.draft
                                    }
                                >
                                    {order.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <Separator className="my-3" />
                            {(order.attachments?.length ?? 0) ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {order.attachments?.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-600"
                                        >
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {attachment.description ??
                                                    attachment.file_type ??
                                                    'Attachment'}
                                            </p>
                                            <p className="truncate text-xs text-gray-500">
                                                {attachment.file_path}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No photos or documents attached yet.
                                </p>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <WorkOrderFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                technicians={technicians}
                workOrder={editingWorkOrder}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    );
}
