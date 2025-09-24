import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import axios from 'axios';
import { Loader2, Search, UserMinus, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ClinicPaymentAccount, Patient } from '../types';

interface AssignPatientsModalProps {
    account: ClinicPaymentAccount;
    patients: Patient[];
    isOpen: boolean;
    onClose: () => void;
    onPatientsAssigned: () => void;
}

export function AssignPatientsModal({
    account,
    patients,
    isOpen,
    onClose,
    onPatientsAssigned,
}: AssignPatientsModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [activeTab, setActiveTab] = useState('assign');

    // Filter patients based on assignment status
    const assignedPatients = patients.filter(
        (p) => p.clinic_payment_account_id === account.id,
    );
    const unassignedPatients = patients.filter(
        (p) =>
            !p.clinic_payment_account_id ||
            p.clinic_payment_account_id !== account.id,
    );

    // Filter patients based on search term
    const filterPatients = (patientList: Patient[]) => {
        if (!searchTerm) return patientList;
        return patientList.filter(
            (patient) =>
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.arn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    };

    const filteredUnassigned = filterPatients(unassignedPatients);
    const filteredAssigned = filterPatients(assignedPatients);

    const handlePatientToggle = (patientId: string) => {
        setSelectedPatients((prev) =>
            prev.includes(patientId)
                ? prev.filter((id) => id !== patientId)
                : [...prev, patientId],
        );
    };

    const handleAssignPatients = async () => {
        if (selectedPatients.length === 0) {
            toast.error('Please select at least one patient to assign');
            return;
        }

        setIsAssigning(true);
        try {
            const response = await axios.post(
                `/clinic/payment-accounts/${account.id}/assign-patients`,
                {
                    patient_ids: selectedPatients.map((id) => parseInt(id)),
                },
            );

            if (response.data.success) {
                toast.success(
                    `${selectedPatients.length} patient(s) assigned successfully`,
                );
                setSelectedPatients([]);
                onPatientsAssigned();
            }
        } catch (error: any) {
            console.error('Failed to assign patients:', error);
            toast.error(
                error.response?.data?.message || 'Failed to assign patients',
            );
        } finally {
            setIsAssigning(false);
        }
    };

    const handleRemovePatients = async () => {
        if (selectedPatients.length === 0) {
            toast.error('Please select at least one patient to remove');
            return;
        }

        setIsRemoving(true);
        try {
            const response = await axios.post(
                `/clinic/payment-accounts/${account.id}/remove-patients`,
                {
                    patient_ids: selectedPatients.map((id) => parseInt(id)),
                },
            );

            if (response.data.success) {
                toast.success(
                    `${selectedPatients.length} patient(s) removed successfully`,
                );
                setSelectedPatients([]);
                onPatientsAssigned();
            }
        } catch (error: any) {
            console.error('Failed to remove patients:', error);
            toast.error(
                error.response?.data?.message || 'Failed to remove patients',
            );
        } finally {
            setIsRemoving(false);
        }
    };

    const handleSelectAll = (patientList: Patient[]) => {
        const allIds = patientList.map((p) => p.id);
        setSelectedPatients(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedPatients([]);
    };

    const PatientList = ({
        patientList,
        showAssignedBadge = false,
    }: {
        patientList: Patient[];
        showAssignedBadge?: boolean;
    }) => (
        <div className="max-h-96 space-y-2 overflow-y-auto">
            {patientList.length === 0 ? (
                <div className="py-8 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">
                        No patients found
                    </h3>
                    <p className="text-muted-foreground">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'No patients available'}
                    </p>
                </div>
            ) : (
                patientList.map((patient) => (
                    <div
                        key={patient.id}
                        className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                    >
                        <Checkbox
                            checked={selectedPatients.includes(patient.id)}
                            onCheckedChange={() =>
                                handlePatientToggle(patient.id)
                            }
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">
                                        {patient.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {patient.arn} • {patient.email}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {showAssignedBadge && (
                                        <Badge
                                            variant="default"
                                            className="text-xs"
                                        >
                                            Assigned
                                        </Badge>
                                    )}
                                    {patient.billing_type && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {patient.billing_type}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Manage Account Patients
                    </DialogTitle>
                    <DialogDescription>
                        Assign or remove patients for {account.account_name}
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients by name, ARN, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="assign"
                            className="flex items-center"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Patients
                        </TabsTrigger>
                        <TabsTrigger
                            value="manage"
                            className="flex items-center"
                        >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Manage Assigned
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assign" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Available Patients
                                </CardTitle>
                                <CardDescription>
                                    Select patients to assign to this account
                                </CardDescription>
                                {filteredUnassigned.length > 0 && (
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleSelectAll(
                                                    filteredUnassigned,
                                                )
                                            }
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDeselectAll}
                                        >
                                            Deselect All
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                <PatientList patientList={filteredUnassigned} />

                                {selectedPatients.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {selectedPatients.length}{' '}
                                                patient(s) selected
                                            </p>
                                            <Button
                                                onClick={handleAssignPatients}
                                                disabled={isAssigning}
                                            >
                                                {isAssigning && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Assign Selected
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="manage" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Assigned Patients
                                </CardTitle>
                                <CardDescription>
                                    Patients currently assigned to{' '}
                                    {account.account_name}
                                </CardDescription>
                                {filteredAssigned.length > 0 && (
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleSelectAll(
                                                    filteredAssigned,
                                                )
                                            }
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDeselectAll}
                                        >
                                            Deselect All
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                <PatientList
                                    patientList={filteredAssigned}
                                    showAssignedBadge
                                />

                                {selectedPatients.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {selectedPatients.length}{' '}
                                                patient(s) selected
                                            </p>
                                            <Button
                                                variant="destructive"
                                                onClick={handleRemovePatients}
                                                disabled={isRemoving}
                                            >
                                                {isRemoving && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                <UserMinus className="mr-2 h-4 w-4" />
                                                Remove Selected
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
