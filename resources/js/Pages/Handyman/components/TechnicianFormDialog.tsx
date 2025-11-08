import { Button } from '@/Components/ui/button';
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
import { HandymanTechnician } from '@/types/handyman';
import { useEffect, useState } from 'react';

export interface TechnicianPayload {
    name: string;
    email?: string | null;
    phone?: string | null;
    specialty?: string | null;
    skills?: string[] | null;
    status?: 'available' | 'assigned' | 'off-duty' | 'on-leave';
    location?: string | null;
    current_load?: number;
}

type TechnicianStatus = NonNullable<TechnicianPayload['status']>;

const statusOptions: TechnicianStatus[] = [
    'available',
    'assigned',
    'off-duty',
    'on-leave',
];

interface TechnicianFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: TechnicianPayload) => Promise<void>;
    technician?: HandymanTechnician | null;
    submitting?: boolean;
}

export function TechnicianFormDialog({
    open,
    onOpenChange,
    onSubmit,
    technician,
    submitting = false,
}: TechnicianFormDialogProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [skills, setSkills] = useState('');
    const [status, setStatus] = useState<TechnicianStatus>('available');
    const [location, setLocation] = useState('');
    const [currentLoad, setCurrentLoad] = useState('0');
    const [notes, setNotes] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        setSubmitError(null);
        setName(technician?.name ?? '');
        setEmail(technician?.email ?? '');
        setPhone(technician?.phone ?? '');
        setSpecialty(technician?.specialty ?? '');
        setSkills(technician?.skills?.join(', ') ?? '');
        setStatus(technician?.status ?? 'available');
        setLocation(technician?.location ?? '');
        setCurrentLoad(String(technician?.current_load ?? 0));
        setNotes('');
    }, [open, technician]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        const payload: TechnicianPayload = {
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            specialty: specialty.trim() || undefined,
            skills: skills
                ? skills
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                : undefined,
            status,
            location: location.trim() || undefined,
            current_load: Number(currentLoad) || 0,
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('Failed to save technician.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {technician ? 'Edit Technician' : 'New Technician'}
                    </DialogTitle>
                    <DialogDescription>
                        Manage your technician roster with specialties, skills,
                        and status.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="handyman-technician-name">Name</Label>
                        <Input
                            id="handyman-technician-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g., Juan Dela Cruz"
                            required
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-technician-email">
                                Email
                            </Label>
                            <Input
                                id="handyman-technician-email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                type="email"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-technician-phone">
                                Phone
                            </Label>
                            <Input
                                id="handyman-technician-phone"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(event.target.value)
                                }
                                placeholder="+63 900 000 0000"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-technician-specialty">
                                Specialty
                            </Label>
                            <Input
                                id="handyman-technician-specialty"
                                value={specialty}
                                onChange={(event) =>
                                    setSpecialty(event.target.value)
                                }
                                placeholder="e.g., HVAC"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-technician-status">
                                Status
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setStatus(value as TechnicianStatus)
                                }
                            >
                                <SelectTrigger id="handyman-technician-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option.replace('-', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="handyman-technician-skills">
                            Skills
                        </Label>
                        <Input
                            id="handyman-technician-skills"
                            value={skills}
                            onChange={(event) => setSkills(event.target.value)}
                            placeholder="Comma-separated e.g., wiring, diagnostics"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="handyman-technician-location">
                                Location
                            </Label>
                            <Input
                                id="handyman-technician-location"
                                value={location}
                                onChange={(event) =>
                                    setLocation(event.target.value)
                                }
                                placeholder="e.g., Makati HQ"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handyman-technician-load">
                                Current Load
                            </Label>
                            <Input
                                id="handyman-technician-load"
                                type="number"
                                min={0}
                                value={currentLoad}
                                onChange={(event) =>
                                    setCurrentLoad(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="handyman-technician-notes">Notes</Label>
                        <Textarea
                            id="handyman-technician-notes"
                            rows={2}
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Optional remarks about availability, certifications, etc."
                        />
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
                            {submitting ? 'Saving...' : 'Save Technician'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
