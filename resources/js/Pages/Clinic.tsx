import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/Components/ui/dialog";
import { Pencil, Trash2, PlusCircle, History, FileText, DollarSign, Plus, Edit } from 'lucide-react';
import { Textarea } from "@/Components/ui/textarea";
import { ScrollArea } from "@/Components/ui/scroll-area";
import DentalChart from '@/Components/DentalChart';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Search } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Clock } from "lucide-react";

type BillItem = {
    id: number;
    patient_id: number;
    bill_number: string;
    bill_date: string;
    bill_amount: string;
    bill_status: string | null;
    bill_details: string;
    created_at: string;
    updated_at: string;
};

type PaymentItem = {
    id: number;
    patient_id: number;
    payment_date: string;
    payment_amount: string;
    payment_method: string;
    payment_notes: string;
    created_at: string;
    updated_at: string;
};

type CheckupResult = {
    id: number;
    date: string;
    diagnosis: string;
    treatment: string;
    notes: string;
};

type ToothData = {
    id: number;
    status: 'healthy' | 'decayed' | 'filled' | 'missing';
};

type Patient = {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthdate: string;
    next_visit_date: string;
    next_visit_time: string;
    total_bills: number;
    total_payments: number;
    balance: number;
    bills: BillItem[];
    payments: PaymentItem[];
    checkups: CheckupResult[];
    dental_chart: ToothData[];
};

type AppCurrency = {
    symbol: string;
    code: string;
};

type CheckupDate = {
    date: Date | undefined;
};

type TimePickerProps = {
    value: string;
    onChange: (value: string) => void;
};

const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr || dateTimeStr === 'NA') return 'N/A';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

const formatCurrency = (amount: number | string, symbol: string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formattedAmount = numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return symbol + formattedAmount;
};

// Add this near the top of the file, before the component definition
interface ClinicProps {
    auth: {
        user: any & {
            is_admin?: boolean;
        };
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    initialPatients: Patient[];
    appCurrency: AppCurrency | null;
    error: any;
}

export default function Clinic({ auth, initialPatients = [] as Patient[], appCurrency = null, error = null }: ClinicProps) {
    const currency = appCurrency ? appCurrency.symbol : '$';

    const [patients, setPatients] = useState<Patient[]>(
        initialPatients.map(patient => ({
            ...patient,
            id: patient.id.toString()
        }))
    );
    const [newPatient, setNewPatient] = useState({ 
        name: '', 
        dateOfBirth: '', 
        contactNumber: '', 
        email: '', 
    });
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirmation, setDeleteConfirmation] = useState<Patient | null>(null);
    const [additionalBillAmount, setAdditionalBillAmount] = useState('');
    const [additionalBillDetails, setAdditionalBillDetails] = useState('');
    const [additionalBillPatientId, setAdditionalBillPatientId] = useState<string | null>(null);
    const [showingBillHistoryForPatient, setShowingBillHistoryForPatient] = useState<Patient | null>(null);
    const [newCheckupResult, setNewCheckupResult] = useState<Omit<CheckupResult, 'id'> & { date: string }>({ date: '', diagnosis: '', treatment: '', notes: '' });
    const [checkupPatient, setCheckupPatient] = useState<Patient | null>(null);
    const [showingCheckupHistoryForPatient, setShowingCheckupHistoryForPatient] = useState<Patient | null>(null);
    const [showingPaymentHistoryForPatient, setShowingPaymentHistoryForPatient] = useState<Patient | null>(null);
    const patientsPerPage = 15;

    // Add this new state for managing the bill history dialog
    const [isBillHistoryDialogOpen, setIsBillHistoryDialogOpen] = useState(false);

    // Add these new state variables at the beginning of the component
    const [isCheckupHistoryDialogOpen, setIsCheckupHistoryDialogOpen] = useState(false);
    const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);

    // Update these state variables
    const [showingHistoryForPatient, setShowingHistoryForPatient] = useState<Patient | null>(null);
    const [activeHistoryType, setActiveHistoryType] = useState<'bill' | 'checkup' | 'payment' | null>(null);

    // Add this new state for managing the patient info dialog
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Add this new state for managing the dental chart
    const [editingDentalChart, setEditingDentalChart] = useState<ToothData[]>([]);

    // Add this new state for managing the dental chart dialog
    const [isDentalChartDialogOpen, setIsDentalChartDialogOpen] = useState(false);

    // First, add a new state for managing the next visit date
    const [editingNextVisit, setEditingNextVisit] = useState<{patientId: string, date: string} | null>(null);

    // Add this new state for loading status
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Add this state near your other states
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    // Add this state near your other state declarations
    const [isCheckupDialogOpen, setIsCheckupDialogOpen] = useState(false);

    const [checkupDateTime, setCheckupDateTime] = useState<CheckupDate>({ date: undefined });

    // Check if current team member has admin or manager role
    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredPatients.length / patientsPerPage);

    const calculateAge = (dateOfBirth: string): number => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        }
        return age;
    };

    const addPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/clinic/patients', newPatient);
            setPatients([...patients, response.data]);
            setNewPatient({ name: '', dateOfBirth: '', contactNumber: '', email: '' });
        } catch (error) {
            console.error('Failed to add patient:', error);
            // Handle error (show toast notification, etc.)
        }
    };

    const updatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPatient) {
            try {
                await axios.put(`/clinic/patients/${editingPatient.id}`, editingPatient);
                setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p));
                setEditingPatient(null);
            } catch (error) {
                console.error('Failed to update patient:', error);
                // Handle error
            }
        }
    };

    const handleDeletePatient = (patient: Patient) => {
        setDeleteConfirmation(patient);
    };

    const deletePatient = async (id: string) => {
        try {
            await axios.delete(`/clinic/patients/${id}`);
            setPatients(patients.filter(p => p.id !== id));
            setDeleteConfirmation(null);
        } catch (error) {
            console.error('Failed to delete patient:', error);
            // Handle error (show toast notification, etc.)
        }
    };

    const handlePayment = async (patientId: string, amount: number) => {
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }
        try {
            const response = await axios.post(`/clinic/patients/${patientId}/payments`, { 
                patient_id: patientId,
                payment_amount: amount,
                payment_date: new Date().toISOString(),
                payment_method: 'cash',
                payment_notes: 'Payment for bill'
            });

            // Update the patients state directly
            setPatients(prevPatients => 
                prevPatients.map(patient => {
                    if (patient.id === patientId) {
                        const newPayment = response.data;
                        const updatedPayments = [...patient.payments, newPayment];
                        const newTotalPayments = parseFloat(patient.total_payments.toString()) + amount;
                        
                        return {
                            ...patient,
                            payments: updatedPayments,
                            total_payments: newTotalPayments,
                            balance: patient.total_bills - newTotalPayments
                        };
                    }
                    return patient;
                })
            );

            // Reset states to close dialogs
            setShowingHistoryForPatient(null);
            setActiveHistoryType(null);
            setShowingPaymentHistoryForPatient(null);
            setShowingBillHistoryForPatient(null);
            setShowingCheckupHistoryForPatient(null);

        } catch (error: any) {
            console.error('Failed to process payment:', error);
            alert(error.response?.data?.message || 'Failed to process payment. Please try again.');
        }
    };

    const handleAdditionalBill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (additionalBillPatientId === null) {
            alert('Please select a patient to add a bill.');
            return;
        }
        const amount = parseFloat(additionalBillAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid bill amount.');
            return;
        }
        try {
            const response = await axios.post(`/clinic/patients/${additionalBillPatientId}/bills`, {
                patient_id: additionalBillPatientId,
                bill_number: Math.floor(Math.random() * 1000000),
                bill_date: new Date().toISOString(),
                bill_amount: amount,
                bill_details: additionalBillDetails
            });
            setAdditionalBillAmount('');
            setAdditionalBillDetails('');
            setAdditionalBillPatientId(null);

            // Close the dialog
            const dialogTrigger = document.querySelector('[data-state="open"]') as HTMLElement;
            if (dialogTrigger) {
                dialogTrigger.click();
            }
        } catch (error) {
            console.error('Failed to add bill:', error);
            // Handle error
        }
    };

    const handleDeleteBill = async (patientId: string, billId: number) => {
        try {
            await axios.delete(`/clinic/patients/${patientId}/bills/${billId}`);
            
            // Update patients state
            setPatients(patients.map(patient => {
                if (patient.id === patientId) {
                    const billAmount = parseFloat(patient.bills.find(b => b.id === billId)?.bill_amount || '0');
                    const updatedBills = patient.bills.filter(bill => bill.id !== billId);
                    
                    // Also update the showing history patient if it's the same patient
                    if (showingHistoryForPatient?.id === patientId) {
                        setShowingHistoryForPatient({
                            ...showingHistoryForPatient,
                            bills: updatedBills
                        });
                    }
                    
                    return {
                        ...patient,
                        bills: updatedBills,
                        total_bills: patient.total_bills - billAmount
                    };
                }
                return patient;
            }));
        } catch (error) {
            console.error('Failed to delete bill:', error);
        }
    };

    const handleDeleteCheckup = async (patientId: string, checkupId: number) => {
        try {
            await axios.delete(`/clinic/patients/${patientId}/checkups/${checkupId}`);
            
            // Update patients state
            setPatients(patients.map(patient => {
                if (patient.id === patientId) {
                    const updatedCheckups = patient.checkups.filter(checkup => checkup.id !== checkupId);
                    
                    // Also update the showing history patient if it's the same patient
                    if (showingHistoryForPatient?.id === patientId) {
                        setShowingHistoryForPatient({
                            ...showingHistoryForPatient,
                            checkups: updatedCheckups
                        });
                    }
                    
                    return {
                        ...patient,
                        checkups: updatedCheckups
                    };
                }
                return patient;
            }));
        } catch (error) {
            console.error('Failed to delete checkup:', error);
        }
    };

    const handleDeletePayment = async (patientId: string, paymentId: number) => {
        try {
            await axios.delete(`/clinic/patients/${patientId}/payments/${paymentId}`);
            
            // Update patients state
            setPatients(patients.map(patient => {
                if (patient.id === patientId) {
                    const paymentAmount = parseFloat(patient.payments.find(p => p.id === paymentId)?.payment_amount || '0');
                    const updatedPayments = patient.payments.filter(payment => payment.id !== paymentId);
                    
                    // Also update the showing history patient if it's the same patient
                    if (showingHistoryForPatient?.id === patientId) {
                        setShowingHistoryForPatient({
                            ...showingHistoryForPatient,
                            payments: updatedPayments
                        });
                    }
                    
                    return {
                        ...patient,
                        payments: updatedPayments,
                        total_payments: patient.total_payments - paymentAmount,
                        balance: patient.balance + paymentAmount // Add the payment amount back to balance
                    };
                }
                return patient;
            }));
        } catch (error) {
            console.error('Failed to delete payment:', error);
        }
    };

    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

    // Add this new function to open the patient info dialog
    const openPatientInfoDialog = (patient: Patient) => {
        setSelectedPatient(patient);
        setEditingDentalChart(patient.dental_chart);
    };

    // Add this function to handle tooth status changes
    const handleToothClick = (toothId: number) => {
        setEditingDentalChart((prev) =>
        prev.map((tooth) =>
            tooth.id === toothId
            ? {
                ...tooth,
                status:
                    tooth.status === 'healthy'
                    ? 'decayed'
                    : tooth.status === 'decayed'
                    ? 'filled'
                    : tooth.status === 'filled'
                    ? 'missing'
                    : 'healthy',
                }
            : tooth
        )
        );
    };

    // Update the saveDentalChartChanges function
    const saveDentalChartChanges = async () => {
        if (selectedPatient) {
            try {
                const response = await axios.put(`/clinic/patients/${selectedPatient.id}/dental-chart`, {
                    dental_chart: editingDentalChart
                });
                setPatients(prevPatients =>
                    prevPatients.map(p =>
                        p.id === selectedPatient.id ? { ...p, dental_chart: response.data.dental_chart } : p
                    )
                );
                setIsDentalChartDialogOpen(false);
            } catch (error) {
                console.error('Failed to update dental chart:', error);
                // Handle error
            }
        }
    };

    // Add this new function to open the dental chart dialog
    const openDentalChartDialog = (patient: Patient) => {
        setSelectedPatient(patient);
        setEditingDentalChart(patient.dental_chart || []);
        setIsDentalChartDialogOpen(true);
    };

    // Add a function to handle the next visit update
    const handleNextVisitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNextVisit) {
            try {
                const response = await axios.put(`/clinic/patients/${editingNextVisit.patientId}/next-visit`, {
                    next_visit_date: editingNextVisit.date
                });
                
                const nextVisitDate = editingNextVisit.date === 'NA' 
                    ? 'NA' 
                    : response.data.next_visit_date || editingNextVisit.date;
                
                setPatients(patients.map(patient => {
                    if (patient.id === editingNextVisit.patientId) {
                        return {
                            ...patient,
                            next_visit_date: nextVisitDate,
                            next_visit_time: response.data.next_visit_time || patient.next_visit_time
                        };
                    }
                    return patient;
                }));
                
                // Close the dialog
                const dialogTrigger = document.querySelector('[data-state="open"]') as HTMLElement;
                if (dialogTrigger) {
                    dialogTrigger.click();
                }
                
                setEditingNextVisit(null);
            } catch (error) {
                console.error('Failed to update next visit:', error);
            }
        }
    };

    // Add this function near your other handler functions
    const handleEditPatient = (patient: Patient) => {
        setEditingPatient(patient);
    };

    // Update the handleShowBillHistory function
    const handleShowBillHistory = async (patient: Patient) => {
        try {
            setIsLoadingHistory(true);
            const response = await axios.get(`/clinic/patients/${patient.id}/bills`);
            
            // Update the patient's bills with the fetched data
            const updatedPatient = {
                ...patient,
                bills: response.data.bills // Direct assignment since the response format matches our type
            };
            
            // Update the patients state to include the new bill data
            setPatients(prevPatients => 
                prevPatients.map(p => 
                    p.id === patient.id ? updatedPatient : p
                )
            );
            
            setShowingHistoryForPatient(updatedPatient);
            setActiveHistoryType('bill');
        } catch (error) {
            console.error('Failed to fetch bill history:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Update the handleShowPaymentHistory function
    const handleShowPaymentHistory = async (patient: Patient) => {
        try {
            setIsLoadingHistory(true);
            const response = await axios.get(`/clinic/patients/${patient.id}/payments`);
            
            // Update the patient's payments with the fetched data
            const updatedPatient = {
                ...patient,
                payments: response.data.payments // Assuming the response contains a payments array
            };
            
            // Update the patients state to include the new payment data
            setPatients(prevPatients => 
                prevPatients.map(p => 
                    p.id === patient.id ? updatedPatient : p
                )
            );
            
            setShowingHistoryForPatient(updatedPatient);
            setActiveHistoryType('payment');
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Update the handleShowCheckupHistory function
    const handleShowCheckupHistory = async (patient: Patient) => {
        try {
            setIsLoadingHistory(true);
            const response = await axios.get(`/clinic/patients/${patient.id}/checkups`);
            
            // Update the patient's checkups with the fetched data
            const updatedPatient = {
                ...patient,
                checkups: response.data.checkups // Assuming the response contains a checkups array
            };
            
            // Update the patients state to include the new checkup data
            setPatients(prevPatients => 
                prevPatients.map(p => 
                    p.id === patient.id ? updatedPatient : p
                )
            );
            
            setShowingHistoryForPatient(updatedPatient);
            setActiveHistoryType('checkup');
        } catch (error) {
            console.error('Failed to fetch checkup history:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Add this function near your other handler functions
    const handleAddCheckup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkupPatient || !checkupDateTime.date) return;

        // Use only the date
        const dateStr = format(checkupDateTime.date, 'yyyy-MM-dd');
        const combinedResult = {
            ...newCheckupResult,
            checkup_date: dateStr
        };

        try {
            const response = await axios.post(`/clinic/patients/${checkupPatient.id}/checkups`, combinedResult);
            
            // Update the patients state with the new checkup data
            setPatients(prevPatients => 
                prevPatients.map(patient => 
                    patient.id === checkupPatient.id 
                    ? {
                        ...patient,
                        checkups: [...(patient.checkups || []), response.data]
                    }
                    : patient
                )
            );

            // Reset form and close dialog
            setNewCheckupResult({ date: '', diagnosis: '', treatment: '', notes: '' });
            setCheckupDateTime({ date: undefined });
            setCheckupPatient(null);
            setIsCheckupDialogOpen(false);
        } catch (error) {
            console.error('Failed to add checkup:', error);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Clinic
                </h2>
            }
        >
            <Head title="Clinic" />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Tabs defaultValue="patients" className="space-y-4">
                    <TabsList>
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="add-patient">Add Patient</TabsTrigger>
                    </TabsList>

                    <TabsContent value="patients">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col sm:flex-row gap-2">

                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search patients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-full"
                                    />
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Next Visit</TableHead>
                                        <TableHead>Total Bills ({currency})</TableHead>
                                        <TableHead>Balance ({currency})</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentPatients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell 
                                                className="cursor-pointer hover:bg-gray-100" 
                                                onClick={() => openPatientInfoDialog(patient)}
                                            >
                                                {patient.id}
                                            </TableCell>
                                            <TableCell>{patient.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span>{formatDateTime(patient.next_visit_date)}</span>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => setEditingNextVisit({ 
                                                                    patientId: patient.id.toString(), 
                                                                    date: patient.next_visit_date 
                                                                })}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Next Visit for {patient.name}</DialogTitle>
                                                            </DialogHeader>
                                                            <form onSubmit={handleNextVisitUpdate} className="space-y-4">
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Label htmlFor="noNextVisit">No next visit scheduled</Label>
                                                                        <Input
                                                                            id="noNextVisit"
                                                                            type="checkbox"
                                                                            className="w-4 h-4"
                                                                            checked={editingNextVisit?.date === 'NA'}
                                                                            onChange={(e) => setEditingNextVisit(prev => 
                                                                                prev ? { ...prev, date: e.target.checked ? 'NA' : '' } : null
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    {editingNextVisit?.date !== 'NA' && (
                                                                        <div>
                                                                            <Label htmlFor="nextVisitDate">Next Visit Date & Time</Label>
                                                                            <Input
                                                                                id="nextVisitDate"
                                                                                type="datetime-local"
                                                                                value={editingNextVisit?.date || ''}
                                                                                onChange={(e) => setEditingNextVisit(prev => 
                                                                                    prev ? { ...prev, date: e.target.value || 'NA' } : null
                                                                                )}
                                                                                required={editingNextVisit?.date !== 'NA'}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button type="submit">Update Next Visit</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span>{formatCurrency(patient.total_bills, currency)}</span>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => setAdditionalBillPatientId(patient.id)}
                                                            >
                                                                <PlusCircle className="h-4 w-4" /> Add Bill
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Add Bill</DialogTitle>
                                                            </DialogHeader>
                                                            <form onSubmit={handleAdditionalBill} className="space-y-4">
                                                                <div>
                                                                    <Label htmlFor="additionalBillAmount">Bill Amount ({currency})</Label>
                                                                    <Input
                                                                        id="additionalBillAmount"
                                                                        type="number"
                                                                        value={additionalBillAmount}
                                                                        onChange={(e) => setAdditionalBillAmount(e.target.value)}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="additionalBillDetails">Bill Details</Label>
                                                                    <Textarea
                                                                        id="additionalBillDetails"
                                                                        value={additionalBillDetails}
                                                                        onChange={(e) => setAdditionalBillDetails(e.target.value)}
                                                                        required
                                                                    />
                                                                </div>
                                                                <Button type="submit">Add Bill</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="outline" size="sm" onClick={() => handleShowBillHistory(patient)}>
                                                        <History className="h-4 w-4" /> Bill History
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span>{formatCurrency(patient.balance, currency)}</span>
                                                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <PlusCircle className="h-4 w-4" /> Add Payment
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Make Payment for {patient.name}</DialogTitle>
                                                            </DialogHeader>
                                                            <form onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                const form = e.target as HTMLFormElement;
                                                                const input = form.elements.namedItem('paymentAmount') as HTMLInputElement;
                                                                const amount = parseFloat(input.value);
                                                                if (!isNaN(amount)) {
                                                                    await handlePayment(patient.id, amount);
                                                                    form.reset();
                                                                    setIsPaymentDialogOpen(false); // Close the dialog
                                                                }
                                                            }} 
                                                            className="space-y-4"
                                                            >
                                                                <div>
                                                                    <Label htmlFor="paymentAmount">Payment Amount ({currency})</Label>
                                                                    <Input
                                                                        id="paymentAmount"
                                                                        name="paymentAmount"
                                                                        type="number"
                                                                        placeholder="Enter amount"
                                                                        required
                                                                    />
                                                                </div>
                                                                <Button type="submit">Make Payment</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="outline" size="sm" onClick={() => handleShowPaymentHistory(patient)}>
                                                        <History className="h-4 w-4" /> Payment History
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                                            {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => handleEditPatient(patient)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                                                                            {canDelete && (
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeletePatient(patient)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            setCheckupPatient(patient);
                                                            setIsCheckupDialogOpen(true);
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4" /> Add Checkup
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleShowCheckupHistory(patient)}>
                                                        <History className="h-4 w-4" /> Checkup History
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openDentalChartDialog(patient)}>
                                                        Dental Chart
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex justify-between items-center mt-4">
                                <div>
                                    Showing {((currentPage - 1) * patientsPerPage) + 1} to {Math.min(currentPage * patientsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                        <Button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            variant={currentPage === page ? "default" : "outline"}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                                        disabled={currentPage === pageCount}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                    </TabsContent>

                    <TabsContent value="add-patient">
                    <form onSubmit={addPatient} className="space-y-4">
                        <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={newPatient.name}
                            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                            required
                        />
                        </div>
                        <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            value={newPatient.dateOfBirth}
                            onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                            required
                        />
                        </div>
                        <div>
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                            id="contactNumber"
                            value={newPatient.contactNumber}
                            onChange={(e) => setNewPatient({ ...newPatient, contactNumber: e.target.value })}
                            required
                        />
                        </div>
                        <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                            required
                        />
                        </div>
                        <Button type="submit">Add Patient</Button>
                    </form>
                    </TabsContent>
                </Tabs>

                {/* Add this dialog component before the delete confirmation dialog */}
                <Dialog open={!!showingHistoryForPatient} onOpenChange={(open) => !open && setShowingHistoryForPatient(null)}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {activeHistoryType === 'bill' && `Bill History - ${showingHistoryForPatient?.name}`}
                                {activeHistoryType === 'payment' && `Payment History - ${showingHistoryForPatient?.name}`}
                                {activeHistoryType === 'checkup' && `Checkup History - ${showingHistoryForPatient?.name}`}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center p-4">
                                    Loading history...
                                </div>
                            ) : (
                                activeHistoryType === 'bill' && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Bill #</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead>Amount ({currency})</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {showingHistoryForPatient?.bills?.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center">
                                                        No bills found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                showingHistoryForPatient?.bills?.map((bill) => (
                                                    <TableRow key={bill.id}>
                                                        <TableCell>{bill.bill_number}</TableCell>
                                                        <TableCell>{formatDateTime(bill.bill_date)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm text-gray-500">{bill.bill_details}</span>
                                                                {bill.bill_status && (
                                                                    <span className="text-xs text-gray-400">Status: {bill.bill_status}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{formatCurrency(parseFloat(bill.bill_amount), currency)}</TableCell>
                                                        <TableCell className="text-right">
                                                                                        {canDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteBill(showingHistoryForPatient.id, bill.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                )
                            )}
                            {activeHistoryType === 'payment' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount ({currency})</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showingHistoryForPatient?.payments?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center">
                                                    No payments found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            showingHistoryForPatient?.payments?.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{formatDateTime(payment.payment_date)}</TableCell>
                                                    <TableCell>{formatCurrency(parseFloat(payment.payment_amount), currency)}</TableCell>
                                                    <TableCell className="capitalize">{payment.payment_method}</TableCell>
                                                    <TableCell>{payment.payment_notes}</TableCell>
                                                    <TableCell className="text-right">
                                                                                    {canDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeletePayment(showingHistoryForPatient.id, payment.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                            {activeHistoryType === 'checkup' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Diagnosis</TableHead>
                                            <TableHead>Treatment</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {showingHistoryForPatient?.checkups?.map((checkup) => (
                                            <TableRow key={checkup.id}>
                                                <TableCell>{formatDateTime(checkup.date)}</TableCell>
                                                <TableCell>{checkup.diagnosis}</TableCell>
                                                <TableCell>{checkup.treatment}</TableCell>
                                                <TableCell>{checkup.notes}</TableCell>
                                                <TableCell className="text-right">
                                                                                {canDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteCheckup(showingHistoryForPatient.id, checkup.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add this new Dialog for the dental chart */}
                <Dialog open={isDentalChartDialogOpen} onOpenChange={setIsDentalChartDialogOpen}>
                    <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Dental Chart for {selectedPatient?.name}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh]">
                        {selectedPatient && (
                        <div className="space-y-4">
                            <DentalChart
                            teethData={editingDentalChart}
                            onToothClick={handleToothClick}
                            />
                            <Button onClick={saveDentalChartChanges}>Save Dental Chart</Button>
                        </div>
                        )}
                    </ScrollArea>
                    </DialogContent>
                </Dialog>

                {/* Add this dialog component near your other dialogs */}
                <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Patient Details</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={updatePatient} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingPatient?.name || ''}
                                    onChange={(e) => setEditingPatient(prev => 
                                        prev ? { ...prev, name: e.target.value } : null
                                    )}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingPatient?.email || ''}
                                    onChange={(e) => setEditingPatient(prev => 
                                        prev ? { ...prev, email: e.target.value } : null
                                    )}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editingPatient?.phone || ''}
                                    onChange={(e) => setEditingPatient(prev => 
                                        prev ? { ...prev, phone: e.target.value } : null
                                    )}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-birthdate">Birthdate</Label>
                                <Input
                                    id="edit-birthdate"
                                    type="date"
                                    value={editingPatient?.birthdate || ''}
                                    onChange={(e) => setEditingPatient(prev => 
                                        prev ? { ...prev, birthdate: e.target.value } : null
                                    )}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingPatient(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add this Dialog component near your other dialogs */}
                <Dialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete {deleteConfirmation?.name}? This action cannot be undone.</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => deleteConfirmation && deletePatient(deleteConfirmation.id)}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add Checkup Dialog */}
                <Dialog open={isCheckupDialogOpen} onOpenChange={setIsCheckupDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Checkup Record for {checkupPatient?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCheckup} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !checkupDateTime.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {checkupDateTime.date ? (
                                                format(checkupDateTime.date, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={checkupDateTime.date}
                                            onSelect={(date) => setCheckupDateTime({ date: date || undefined })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Textarea
                                    id="diagnosis"
                                    value={newCheckupResult.diagnosis}
                                    onChange={(e) => setNewCheckupResult(prev => ({ ...prev, diagnosis: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="treatment">Treatment</Label>
                                <Textarea
                                    id="treatment"
                                    value={newCheckupResult.treatment}
                                    onChange={(e) => setNewCheckupResult(prev => ({ ...prev, treatment: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={newCheckupResult.notes}
                                    onChange={(e) => setNewCheckupResult(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => {
                                    setIsCheckupDialogOpen(false);
                                    setNewCheckupResult({ date: '', diagnosis: '', treatment: '', notes: '' });
                                    setCheckupDateTime({ date: undefined });
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Checkup</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
