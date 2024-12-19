import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
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

type BillItem = {
    id: number;
    amount: number;
    details: string;
    date: string;
};

type PaymentItem = {
    id: number;
    amount: number;
    date: string;
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
    id: number;
    name: string;
    email: string;
    phone: string;
    birthdate: string;
    next_visit_date: string;
    next_visit_time: string;
    client_identifier: string;
    // ... other fields
};

type AppCurrency = {
    symbol: string;
    code: string;
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

const formatCurrency = (amount: number, symbol: string) => {
    return symbol + amount;
};

// Add this near the top of the file, before the component definition
interface ClinicProps {
    initialPatients: Patient[];
    appCurrency: AppCurrency | null;
    error: any;
}

export default function Clinic({ initialPatients = [] as Patient[], appCurrency = null, error = null }: ClinicProps) {
    const currency = appCurrency ? appCurrency.symbol : '$';

    const [patients, setPatients] = useState<Patient[]>(
        initialPatients.filter((patient): patient is Patient => 
            patient !== null && 
            patient !== undefined && 
            typeof patient.name === 'string' &&
            typeof patient.id === 'number'
        )
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
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
    const [additionalBillAmount, setAdditionalBillAmount] = useState('');
    const [additionalBillDetails, setAdditionalBillDetails] = useState('');
    const [additionalBillPatientId, setAdditionalBillPatientId] = useState<string | null>(null);
    const [showingBillHistoryForPatient, setShowingBillHistoryForPatient] = useState<Patient | null>(null);
    const [newCheckupResult, setNewCheckupResult] = useState<Omit<CheckupResult, 'id'>>({ date: '', diagnosis: '', treatment: '', notes: '' });
    const [checkupPatientId, setCheckupPatientId] = useState<string | null>(null);
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

    const deletePatient = async (id: string) => {
        try {
            await axios.delete(`/clinic/patients/${id}`);
            setPatients(patients.filter(p => p.id !== id));
            setDeleteConfirmation(null);
        } catch (error) {
            console.error('Failed to delete patient:', error);
            // Handle error
        }
    };

    const handlePayment = async (patientId: string, amount: number) => {
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }
        try {
            const response = await axios.post(`/clinic/patients/${patientId}/payments`, { amount });
            setPatients(patients.map(patient => 
                patient.id === patientId ? response.data : patient
            ));
        } catch (error) {
            console.error('Failed to process payment:', error);
            // Handle error
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
                amount,
                details: additionalBillDetails
            });
            setPatients(patients.map(patient => 
                patient.id === additionalBillPatientId ? response.data : patient
            ));
            setAdditionalBillAmount('');
            setAdditionalBillDetails('');
            setAdditionalBillPatientId(null);
        } catch (error) {
            console.error('Failed to add bill:', error);
            // Handle error
        }
    };

    const handleAddCheckupResult = async (e: React.FormEvent) => {
        e.preventDefault();
        if (checkupPatientId === null) {
            alert('Please select a patient to add a checkup result.');
            return;
        }
        try {
            const response = await axios.post(`/clinic/patients/${checkupPatientId}/checkups`, newCheckupResult);
            setPatients(patients.map(patient => 
                patient.id === checkupPatientId ? response.data : patient
            ));
            setNewCheckupResult({ date: '', diagnosis: '', treatment: '', notes: '' });
            setCheckupPatientId(null);
        } catch (error) {
            console.error('Failed to add checkup result:', error);
            // Handle error
        }
    };

    const handleDeleteBill = (patientId: string, billId: number) => {
        setPatients(patients.map(patient => 
        patient.id === patientId
            ? {
                ...patient,
                billHistory: patient.billHistory.filter(bill => bill.id !== billId),
                billAmount: patient.billAmount - patient.billHistory.find(bill => bill.id === billId)!.amount,
                balance: patient.balance - patient.billHistory.find(bill => bill.id === billId)!.amount
            }
            : patient
        ));
        // Update the showingBillHistoryForPatient state to reflect the changes
        setShowingBillHistoryForPatient(prev => 
        prev ? {
            ...prev,
            billHistory: prev.billHistory.filter(bill => bill.id !== billId)
        } : null
        );
    };

    const handleDeleteCheckup = (patientId: string, checkupId: number) => {
        setPatients(patients.map(patient => 
        patient.id === patientId
            ? {
                ...patient,
                checkupHistory: patient.checkupHistory.filter(checkup => checkup.id !== checkupId)
            }
            : patient
        ));
    };

    const handleDeletePayment = (patientId: string, paymentId: number) => {
        setPatients(patients.map(patient => 
        patient.id === patientId
            ? {
                ...patient,
                paymentHistory: patient.paymentHistory.filter(payment => payment.id !== paymentId),
                balance: patient.balance + patient.paymentHistory.find(payment => payment.id === paymentId)!.amount
            }
            : patient
        ));
    };

    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const openHistoryDialog = (patient: Patient, historyType: 'bill' | 'checkup' | 'payment') => {
        setShowingHistoryForPatient(patient);
        setActiveHistoryType(historyType);
    };

    const closeHistoryDialog = () => {
        setShowingHistoryForPatient(null);
        setActiveHistoryType(null);
    };

    // Add this new function to open the patient info dialog
    const openPatientInfoDialog = (patient: Patient) => {
        setSelectedPatient(patient);
        setEditingDentalChart(patient.dentalChart);
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
                    dentalChart: editingDentalChart
                });
                setPatients(prevPatients =>
                    prevPatients.map(p =>
                        p.id === selectedPatient.id ? response.data : p
                    )
                );
                setSelectedPatient(response.data);
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
        setEditingDentalChart(patient.dentalChart);
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
                    if (patient.id === parseInt(editingNextVisit.patientId)) {
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

    // Update the handleEditPatient function to format the date properly
    const handleNextVisitClick = (patient: Patient) => {
        // Convert 'NA' to empty string for the input, otherwise use the existing date
        const dateValue = patient.next_visit_date === 'NA' ? '' : patient.next_visit_date;
        
        setEditingNextVisit({ 
            patientId: patient.id.toString(), 
            date: dateValue 
        });
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
                                                    <span>{formatCurrency(patient.billAmount, currency)}</span>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => setAdditionalBillPatientId(patient.id.toString())}
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
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span>{formatCurrency(patient.balance, currency)}</span>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <PlusCircle className="h-4 w-4" /> Add Payment
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Make Payment for {patient.name}</DialogTitle>
                                                            </DialogHeader>
                                                            <form onSubmit={(e) => {
                                                                e.preventDefault();
                                                                const form = e.target as HTMLFormElement;
                                                                const input = form.elements.namedItem('paymentAmount') as HTMLInputElement;
                                                                const amount = parseFloat(input.value);
                                                                if (!isNaN(amount)) {
                                                                    handlePayment(patient.id, amount);
                                                                    input.value = '';
                                                                    (e.target as HTMLFormElement).reset();
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
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditPatient(patient)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeletePatient(patient)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleShowPaymentHistory(patient)}>
                                                        <History className="h-4 w-4" /> Payment
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleShowBillHistory(patient)}>
                                                        <History className="h-4 w-4" /> Bill
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleShowCheckupHistory(patient)}>
                                                        <History className="h-4 w-4" /> Checkup
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

                {/* Replace the existing dialogs with this single dialog */}
                <Dialog open={!!showingHistoryForPatient} onOpenChange={closeHistoryDialog}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                        {activeHistoryType === 'bill' && `Bill History for ${showingHistoryForPatient?.name}`}
                        {activeHistoryType === 'checkup' && `Checkup History for ${showingHistoryForPatient?.name}`}
                        {activeHistoryType === 'payment' && `Payment History for ${showingHistoryForPatient?.name}`}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        {activeHistoryType === 'bill' && (
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2">Date</th>
                                <th className="border border-gray-300 p-2">Amount ({currency})</th>
                                <th className="border border-gray-300 p-2">Details</th>
                                <th className="border border-gray-300 p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {showingHistoryForPatient?.billHistory.map((bill) => (
                                <tr key={bill.id}>
                                <td className="border border-gray-300 p-2">{bill.date}</td>
                                <td className="border border-gray-300 p-2">{formatCurrency(bill.amount)}</td>
                                <td className="border border-gray-300 p-2">{bill.details}</td>
                                <td className="border border-gray-300 p-2">
                                    <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteBill(showingHistoryForPatient.id, bill.id)}
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        )}
                        {activeHistoryType === 'checkup' && (
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2">Date</th>
                                <th className="border border-gray-300 p-2">Diagnosis</th>
                                <th className="border border-gray-300 p-2">Treatment</th>
                                <th className="border border-gray-300 p-2">Notes</th>
                                <th className="border border-gray-300 p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {showingHistoryForPatient?.checkupHistory.map((checkup) => (
                                <tr key={checkup.id}>
                                <td className="border border-gray-300 p-2">{checkup.date}</td>
                                <td className="border border-gray-300 p-2">{checkup.diagnosis}</td>
                                <td className="border border-gray-300 p-2">{checkup.treatment}</td>
                                <td className="border border-gray-300 p-2">{checkup.notes}</td>
                                <td className="border border-gray-300 p-2">
                                    <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteCheckup(showingHistoryForPatient.id, checkup.id)}
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        )}
                        {activeHistoryType === 'payment' && (
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2">Date</th>
                                <th className="border border-gray-300 p-2">Amount ({currency})</th>
                                <th className="border border-gray-300 p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {showingHistoryForPatient?.paymentHistory.map((payment) => (
                                <tr key={payment.id}>
                                <td className="border border-gray-300 p-2">{payment.date}</td>
                                <td className="border border-gray-300 p-2">{formatCurrency(payment.amount)}</td>
                                <td className="border border-gray-300 p-2">
                                    <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeletePayment(showingHistoryForPatient.id, payment.id)}
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
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
            </div>
        </AuthenticatedLayout>
    );
}
