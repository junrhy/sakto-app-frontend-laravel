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
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import { HandymanTask, HandymanTechnician } from '@/types/handyman';
import { useEffect, useState } from 'react';

const statusOptions: HandymanTask['status'][] = [
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
];

const priorityOptions: HandymanTask['priority'][] = [
    'low',
    'medium',
    'high',
    'urgent',
];

const toDateTimeLocal = (value?: string | null) => {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoStringOrNull = (value?: string | null) => {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString();
};

const parseCommaSeparated = (value: string) =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

interface AssignmentFormState {
    technicianId: number;
    assignedStart: string;
    assignedEnd: string;
}

export interface HandymanTaskRequestPayload {
    title: string;
    description?: string;
    status: HandymanTask['status'];
    priority: HandymanTask['priority'];
    scheduled_start_at: string | null;
    scheduled_end_at: string | null;
    location?: string;
    tags?: string[];
    required_resources?: string[];
    assignments: Array<{
        technician_id: number;
        assigned_start_at: string | null;
        assigned_end_at: string | null;
        is_primary: boolean;
    }>;
}

interface TaskFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    technicians: HandymanTechnician[];
    task?: HandymanTask | null;
    onSubmit: (payload: HandymanTaskRequestPayload) => Promise<void>;
    submitting?: boolean;
}

export function TaskFormDialog({
    open,
    onOpenChange,
    technicians,
    task,
    onSubmit,
    submitting = false,
}: TaskFormDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<HandymanTask['status']>('scheduled');
    const [priority, setPriority] =
        useState<HandymanTask['priority']>('medium');
    const [scheduledStart, setScheduledStart] = useState('');
    const [scheduledEnd, setScheduledEnd] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState('');
    const [requiredResources, setRequiredResources] = useState('');
    const [assignments, setAssignments] = useState<AssignmentFormState[]>([]);
    const [primaryTechnicianId, setPrimaryTechnicianId] = useState<
        number | null
    >(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        setSubmitError(null);
        setTitle(task?.title ?? '');
        setDescription(task?.description ?? '');
        setStatus(task?.status ?? 'scheduled');
        setPriority(task?.priority ?? 'medium');
        const scheduledStartValue = toDateTimeLocal(task?.scheduled_start_at);
        setScheduledStart(
            scheduledStartValue || toDateTimeLocal(new Date().toISOString()),
        );
        const scheduledEndValue = toDateTimeLocal(task?.scheduled_end_at);
        setScheduledEnd(
            scheduledEndValue ||
                toDateTimeLocal(
                    new Date(
                        new Date().getTime() + 24 * 60 * 60 * 1000,
                    ).toISOString(),
                ),
        );
        setLocation(task?.location ?? '');
        setTags(task?.tags ? task.tags.join(', ') : '');
        setRequiredResources(
            task?.required_resources ? task.required_resources.join(', ') : '',
        );

        const existingAssignments =
            task?.assignments?.map((assignment) => ({
                technicianId: assignment.technician_id,
                assignedStart: toDateTimeLocal(assignment.assigned_start_at),
                assignedEnd: toDateTimeLocal(assignment.assigned_end_at),
            })) ?? [];

        setAssignments(existingAssignments);

        const existingPrimary =
            task?.assignments?.find((assignment) => assignment.is_primary)
                ?.technician_id ?? null;

        if (existingPrimary) {
            setPrimaryTechnicianId(existingPrimary);
        } else if (existingAssignments.length > 0) {
            setPrimaryTechnicianId(existingAssignments[0].technicianId);
        } else {
            setPrimaryTechnicianId(null);
        }
    }, [open, task]);

    const handleToggleAssignment = (technicianId: number, checked: boolean) => {
        setAssignments((prev) => {
            if (checked) {
                if (prev.some((item) => item.technicianId === technicianId)) {
                    return prev;
                }
                const defaultStart =
                    scheduledStart || toDateTimeLocal(new Date().toISOString());
                const defaultEnd =
                    scheduledEnd ||
                    toDateTimeLocal(
                        new Date(
                            new Date().getTime() + 60 * 60 * 1000,
                        ).toISOString(),
                    );
                const updated = [
                    ...prev,
                    {
                        technicianId,
                        assignedStart: defaultStart,
                        assignedEnd: defaultEnd,
                    },
                ];
                if (primaryTechnicianId === null) {
                    setPrimaryTechnicianId(technicianId);
                }
                return updated;
            }

            const filtered = prev.filter(
                (item) => item.technicianId !== technicianId,
            );
            if (primaryTechnicianId === technicianId) {
                setPrimaryTechnicianId(
                    filtered.length > 0 ? filtered[0].technicianId : null,
                );
            }
            return filtered;
        });
    };

    const updateAssignment = (
        technicianId: number,
        field: 'assignedStart' | 'assignedEnd',
        value: string,
    ) => {
        setAssignments((prev) =>
            prev.map((assignment) =>
                assignment.technicianId === technicianId
                    ? { ...assignment, [field]: value }
                    : assignment,
            ),
        );
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        const payload: HandymanTaskRequestPayload = {
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            priority,
            scheduled_start_at: toIsoStringOrNull(scheduledStart),
            scheduled_end_at: toIsoStringOrNull(scheduledEnd),
            location: location.trim() || undefined,
            tags: tags ? parseCommaSeparated(tags) : undefined,
            required_resources: requiredResources
                ? parseCommaSeparated(requiredResources)
                : undefined,
            assignments: assignments.map((assignment, index) => ({
                technician_id: assignment.technicianId,
                assigned_start_at: toIsoStringOrNull(assignment.assignedStart),
                assigned_end_at: toIsoStringOrNull(assignment.assignedEnd),
                is_primary:
                    (primaryTechnicianId ?? assignments[0]?.technicianId) ===
                        assignment.technicianId ||
                    (primaryTechnicianId === null && index === 0),
            })),
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('Failed to save task. Please try again.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {task ? 'Edit Task' : 'Create Task'}
                    </DialogTitle>
                    <DialogDescription>
                        Organize technician scheduling by defining assignment
                        timelines and responsibilities.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="handyman-task-title">Title</Label>
                            <Input
                                id="handyman-task-title"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="e.g., AC unit installation"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-task-status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setStatus(value as HandymanTask['status'])
                                }
                            >
                                <SelectTrigger id="handyman-task-status">
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
                            <Label htmlFor="handyman-task-priority">
                                Priority
                            </Label>
                            <Select
                                value={priority}
                                onValueChange={(value) =>
                                    setPriority(
                                        value as HandymanTask['priority'],
                                    )
                                }
                            >
                                <SelectTrigger id="handyman-task-priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-task-start">
                                Scheduled Start
                            </Label>
                            <Input
                                id="handyman-task-start"
                                type="datetime-local"
                                value={scheduledStart}
                                onChange={(event) =>
                                    setScheduledStart(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-task-end">
                                Scheduled End
                            </Label>
                            <Input
                                id="handyman-task-end"
                                type="datetime-local"
                                value={scheduledEnd}
                                onChange={(event) =>
                                    setScheduledEnd(event.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="handyman-task-location">
                                Location
                            </Label>
                            <Input
                                id="handyman-task-location"
                                value={location}
                                onChange={(event) =>
                                    setLocation(event.target.value)
                                }
                                placeholder="Job site address or coordinates"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="handyman-task-description">
                                Description
                            </Label>
                            <Textarea
                                id="handyman-task-description"
                                rows={3}
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Provide task details, scope, or required preparations."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-task-tags">Tags</Label>
                            <Input
                                id="handyman-task-tags"
                                value={tags}
                                onChange={(event) =>
                                    setTags(event.target.value)
                                }
                                placeholder="e.g., HVAC, emergency"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handyman-task-resources">
                                Required Resources
                            </Label>
                            <Input
                                id="handyman-task-resources"
                                value={requiredResources}
                                onChange={(event) =>
                                    setRequiredResources(event.target.value)
                                }
                                placeholder="e.g., ladder, sealant"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Technician Assignments</Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Select technicians and set their assignment
                                    windows. Mark one as primary contact.
                                </p>
                            </div>
                            {assignments.length > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {assignments.length} technician
                                    {assignments.length > 1 ? 's' : ''} assigned
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            <RadioGroup
                                value={
                                    primaryTechnicianId
                                        ? String(primaryTechnicianId)
                                        : undefined
                                }
                                onValueChange={(value) =>
                                    setPrimaryTechnicianId(Number(value))
                                }
                                className="space-y-3"
                            >
                                {technicians.map((technician) => {
                                    const assignment = assignments.find(
                                        (item) =>
                                            item.technicianId === technician.id,
                                    );
                                    const isChecked = Boolean(assignment);

                                    return (
                                        <div
                                            key={technician.id}
                                            className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex flex-1 items-start gap-3">
                                                    <Checkbox
                                                        id={`technician-${technician.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleToggleAssignment(
                                                                technician.id,
                                                                Boolean(
                                                                    checked,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                    <div>
                                                        <Label
                                                            htmlFor={`technician-${technician.id}`}
                                                            className="text-base"
                                                        >
                                                            {technician.name}
                                                        </Label>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {technician.specialty ||
                                                                'General technician'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Current load:{' '}
                                                            {
                                                                technician.current_load
                                                            }{' '}
                                                            | Active
                                                            assignments:{' '}
                                                            {technician.active_assignments_count ??
                                                                0}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Label
                                                        htmlFor={`primary-${technician.id}`}
                                                        className="text-xs text-gray-500 dark:text-gray-400"
                                                    >
                                                        Primary
                                                    </Label>
                                                    <RadioGroupItem
                                                        value={String(
                                                            technician.id,
                                                        )}
                                                        id={`primary-${technician.id}`}
                                                        disabled={!isChecked}
                                                    />
                                                </div>
                                            </div>

                                            {isChecked && (
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                            Assignment Start
                                                        </Label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={
                                                                assignment?.assignedStart ||
                                                                ''
                                                            }
                                                            onChange={(event) =>
                                                                updateAssignment(
                                                                    technician.id,
                                                                    'assignedStart',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                                                            Assignment End
                                                        </Label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={
                                                                assignment?.assignedEnd ||
                                                                ''
                                                            }
                                                            onChange={(event) =>
                                                                updateAssignment(
                                                                    technician.id,
                                                                    'assignedEnd',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                        </div>
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
                            {submitting ? 'Saving...' : 'Save Task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
