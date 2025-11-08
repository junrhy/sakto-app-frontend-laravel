import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { HandymanTechnician, HandymanWorkOrder } from '@/types/handyman';
import { useEffect, useState } from 'react';

const statusOptions: HandymanWorkOrder['status'][] = [
    'draft',
    'assigned',
    'in_progress',
    'awaiting_approval',
    'completed',
    'cancelled',
];

const toDateTimeLocal = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .slice(0, 16);
};

const toIsoStringOrNull = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

const parseCommaSeparated = (value: string) =>
    value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

interface TimeLogFormState {
    id?: number;
    technicianId?: number | null;
    startedAt: string;
    endedAt: string;
    durationMinutes?: string;
    notes?: string;
}

interface WorkOrderFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    technicians: HandymanTechnician[];
    workOrder?: HandymanWorkOrder | null;
    onSubmit: (payload: HandymanWorkOrderRequestPayload) => Promise<void>;
    submitting?: boolean;
}

export interface HandymanWorkOrderRequestPayload {
    status: HandymanWorkOrder['status'];
    task_id?: number | null;
    technician_id?: number | null;
    customer_name?: string | null;
    customer_contact?: string | null;
    customer_address?: string | null;
    scope_of_work?: string | null;
    materials?: string[] | null;
    checklist?: Array<{ label: string; completed: boolean }> | null;
    scheduled_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    notes?: string | null;
    time_logs?: Array<{
        id?: number;
        technician_id?: number | null;
        started_at: string | null;
        ended_at: string | null;
        duration_minutes?: number | null;
        notes?: string | null;
    }>;
    attachments?: Array<{
        id?: number;
        file_path: string;
        file_type?: string | null;
        thumbnail_path?: string | null;
        uploaded_by?: number | null;
        description?: string | null;
    }>;
}

export function WorkOrderFormDialog({
    open,
    onOpenChange,
    technicians,
    workOrder,
    onSubmit,
    submitting = false,
}: WorkOrderFormDialogProps) {
    const [status, setStatus] = useState<HandymanWorkOrder['status']>('draft');
    const [technicianId, setTechnicianId] = useState<number | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [scopeOfWork, setScopeOfWork] = useState('');
    const [materials, setMaterials] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [startedAt, setStartedAt] = useState('');
    const [completedAt, setCompletedAt] = useState('');
    const [notes, setNotes] = useState('');
    const [timeLogs, setTimeLogs] = useState<TimeLogFormState[]>([]);
    const [includeChecklist, setIncludeChecklist] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        setSubmitError(null);
        setStatus(workOrder?.status ?? 'draft');
        setTechnicianId(workOrder?.technician_id ?? null);
        setCustomerName(workOrder?.customer_name ?? '');
        setCustomerContact(workOrder?.customer_contact ?? '');
        setCustomerAddress(workOrder?.customer_address ?? '');
        setScopeOfWork(workOrder?.scope_of_work ?? '');
        setMaterials(
            workOrder?.materials && workOrder.materials.length > 0
                ? workOrder.materials.join(', ')
                : '',
        );
        setScheduledAt(toDateTimeLocal(workOrder?.scheduled_at));
        setStartedAt(toDateTimeLocal(workOrder?.started_at));
        setCompletedAt(toDateTimeLocal(workOrder?.completed_at));
        setNotes(workOrder?.notes ?? '');
        setIncludeChecklist(Boolean(workOrder?.checklist?.length));
        setTimeLogs(
            workOrder?.time_logs?.map((log) => ({
                id: log.id,
                technicianId: log.technician_id ?? null,
                startedAt: toDateTimeLocal(log.started_at),
                endedAt: toDateTimeLocal(log.ended_at),
                durationMinutes: log.duration_minutes
                    ? String(log.duration_minutes)
                    : '',
                notes: log.notes ?? '',
            })) ?? [],
        );
    }, [open, workOrder]);

    const addTimeLog = () => {
        const now = new Date();
        const startLocal = toDateTimeLocal(now.toISOString());
        const endLocal = toDateTimeLocal(
            new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        );
        setTimeLogs((prev) => [
            ...prev,
            {
                startedAt: startLocal,
                endedAt: endLocal,
                durationMinutes: '',
                notes: '',
                technicianId,
            },
        ]);
    };

    const updateTimeLog = (
        index: number,
        field: keyof TimeLogFormState,
        value: string | number | null,
    ) => {
        setTimeLogs((prev) =>
            prev.map((log, idx) =>
                idx === index ? { ...log, [field]: value } : log,
            ),
        );
    };

    const removeTimeLog = (index: number) => {
        setTimeLogs((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        const payload: HandymanWorkOrderRequestPayload = {
            status,
            technician_id: technicianId,
            customer_name: customerName.trim() || undefined,
            customer_contact: customerContact.trim() || undefined,
            customer_address: customerAddress.trim() || undefined,
            scope_of_work: scopeOfWork.trim() || undefined,
            materials: materials ? parseCommaSeparated(materials) : undefined,
            checklist: includeChecklist
                ? [{ label: 'Completed', completed: false }]
                : null,
            scheduled_at: toIsoStringOrNull(scheduledAt),
            started_at: toIsoStringOrNull(startedAt),
            completed_at: toIsoStringOrNull(completedAt),
            notes: notes.trim() || undefined,
            time_logs:
                timeLogs.length > 0
                    ? timeLogs.map((log) => ({
                          id: log.id,
                          technician_id: log.technicianId ?? undefined,
                          started_at: toIsoStringOrNull(log.startedAt),
                          ended_at: toIsoStringOrNull(log.endedAt),
                          duration_minutes: log.durationMinutes
                              ? Number(log.durationMinutes)
                              : null,
                          notes: log.notes ?? null,
                      }))
                    : undefined,
            attachments: workOrder?.attachments?.map((attachment) => ({
                id: attachment.id,
                file_path: attachment.file_path,
                file_type: attachment.file_type ?? null,
                thumbnail_path: attachment.thumbnail_path ?? null,
                uploaded_by: attachment.uploaded_by ?? null,
                description: attachment.description ?? null,
            })),
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('Unable to save work order. Please try again.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {workOrder ? 'Edit Work Order' : 'Create Work Order'}
                    </DialogTitle>
                    <DialogDescription>
                        Coordinate field execution details, including
                        scheduling, assigned technician, and job scope.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-workorder-status">
                                Status
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setStatus(
                                        value as HandymanWorkOrder['status'],
                                    )
                                }
                            >
                                <SelectTrigger id="handyman-workorder-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-workorder-technician">
                                Assigned Technician
                            </Label>
                            <Select
                                value={
                                    technicianId !== null
                                        ? String(technicianId)
                                        : 'none'
                                }
                                onValueChange={(value) =>
                                    setTechnicianId(
                                        value === 'none' ? null : Number(value),
                                    )
                                }
                            >
                                <SelectTrigger id="handyman-workorder-technician">
                                    <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Unassigned
                                    </SelectItem>
                                    {technicians.map((technician) => (
                                        <SelectItem
                                            key={technician.id}
                                            value={String(technician.id)}
                                        >
                                            {technician.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-workorder-scheduled">
                                Scheduled At
                            </Label>
                            <Input
                                id="handyman-workorder-scheduled"
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(event) =>
                                    setScheduledAt(event.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-workorder-started">
                                Started At
                            </Label>
                            <Input
                                id="handyman-workorder-started"
                                type="datetime-local"
                                value={startedAt}
                                onChange={(event) =>
                                    setStartedAt(event.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-workorder-completed">
                                Completed At
                            </Label>
                            <Input
                                id="handyman-workorder-completed"
                                type="datetime-local"
                                value={completedAt}
                                onChange={(event) =>
                                    setCompletedAt(event.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-workorder-customer-name">
                                Customer Name
                            </Label>
                            <Input
                                id="handyman-workorder-customer-name"
                                value={customerName}
                                onChange={(event) =>
                                    setCustomerName(event.target.value)
                                }
                                placeholder="e.g., Jane Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-workorder-customer-contact">
                                Customer Contact
                            </Label>
                            <Input
                                id="handyman-workorder-customer-contact"
                                value={customerContact}
                                onChange={(event) =>
                                    setCustomerContact(event.target.value)
                                }
                                placeholder="e.g., +63 900 000 0000"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="handyman-workorder-customer-address">
                                Customer Address
                            </Label>
                            <Input
                                id="handyman-workorder-customer-address"
                                value={customerAddress}
                                onChange={(event) =>
                                    setCustomerAddress(event.target.value)
                                }
                                placeholder="e.g., 123 Service Lane, Makati"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="handyman-workorder-scope">
                                Scope of Work
                            </Label>
                            <Textarea
                                id="handyman-workorder-scope"
                                rows={3}
                                value={scopeOfWork}
                                onChange={(event) =>
                                    setScopeOfWork(event.target.value)
                                }
                                placeholder="Outline the work order details and expectations."
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="handyman-workorder-materials">
                                Materials
                            </Label>
                            <Input
                                id="handyman-workorder-materials"
                                value={materials}
                                onChange={(event) =>
                                    setMaterials(event.target.value)
                                }
                                placeholder="Comma-separated list e.g., PVC pipe, sealant"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="handyman-workorder-notes">
                                Notes
                            </Label>
                            <Textarea
                                id="handyman-workorder-notes"
                                rows={2}
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                                placeholder="Additional instructions or safety notes."
                            />
                        </div>

                        <div className="flex items-center gap-2 sm:col-span-2">
                            <Checkbox
                                id="handyman-workorder-checklist"
                                checked={includeChecklist}
                                onCheckedChange={(checked) =>
                                    setIncludeChecklist(Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="handyman-workorder-checklist"
                                className="text-sm text-gray-600 dark:text-gray-400"
                            >
                                Include default completion checklist
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Time Logs</Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Track work durations for billing and team
                                    coordination.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTimeLog}
                            >
                                Add Time Log
                            </Button>
                        </div>

                        {timeLogs.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No time logs added yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {timeLogs.map((log, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                    >
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Technician
                                                </Label>
                                                <Select
                                                    value={
                                                        log.technicianId !==
                                                            null &&
                                                        log.technicianId !==
                                                            undefined
                                                            ? String(
                                                                  log.technicianId,
                                                              )
                                                            : 'none'
                                                    }
                                                    onValueChange={(value) =>
                                                        updateTimeLog(
                                                            index,
                                                            'technicianId',
                                                            value === 'none'
                                                                ? null
                                                                : Number(value),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select technician" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Unassigned
                                                        </SelectItem>
                                                        {technicians.map(
                                                            (technician) => (
                                                                <SelectItem
                                                                    key={
                                                                        technician.id
                                                                    }
                                                                    value={String(
                                                                        technician.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        technician.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Duration (minutes)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={
                                                        log.durationMinutes ??
                                                        ''
                                                    }
                                                    onChange={(event) =>
                                                        updateTimeLog(
                                                            index,
                                                            'durationMinutes',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g., 45"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Started At
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={log.startedAt}
                                                    onChange={(event) =>
                                                        updateTimeLog(
                                                            index,
                                                            'startedAt',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                    Ended At
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={log.endedAt}
                                                    onChange={(event) =>
                                                        updateTimeLog(
                                                            index,
                                                            'endedAt',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-1">
                                            <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                Notes
                                            </Label>
                                            <Textarea
                                                rows={2}
                                                value={log.notes ?? ''}
                                                onChange={(event) =>
                                                    updateTimeLog(
                                                        index,
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Add field observations or job site notes."
                                            />
                                        </div>

                                        <div className="mt-3 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeTimeLog(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {submitError && (
                        <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                            {submitError}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Work Order'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
