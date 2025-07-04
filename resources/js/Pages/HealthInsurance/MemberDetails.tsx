import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { useRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { Button } from '@/Components/ui/button';
import { Download, Copy, User, Calendar, Phone, MapPin, CreditCard, AlertTriangle, TrendingUp, FileText, Activity, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import { useTheme } from '@/Components/ThemeProvider';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

interface Member {
    id: string;
    name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    membership_start_date: string;
    contribution_amount: number;
    contribution_frequency: string;
    status: string;
}

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
}

interface Claim {
    id: string;
    member_id: string;
    claim_type: string;
    amount: number;
    date_of_service: string;
    hospital_name: string;
    diagnosis: string;
    status: string;
}

interface Props extends PageProps {
    member: Member;
    contributions: Contribution[];
    claims: Claim[];
    upcomingContributions: {
        due_date: string;
        amount: number;
    }[];
    pastDueContributions: {
        due_date: string;
        amount: number;
    }[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function MemberDetails({ member, contributions, claims, upcomingContributions, pastDueContributions, appCurrency }: Props) {
    const { toPDF, targetRef } = usePDF({
        filename: `member-details-${member.name}.pdf`,
        page: {
            margin: 20,
            format: 'a4',
            orientation: 'portrait'
        }
    });

    const { toast } = useToast();
    const { theme } = useTheme();

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link copied!",
            description: "The member details link has been copied to your clipboard.",
            duration: 3000,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-500';
            case 'inactive':
                return 'bg-red-500';
            case 'approved':
                return 'bg-green-500';
            case 'rejected':
                return 'bg-red-500';
            case 'pending':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return '🟢';
            case 'inactive':
                return '🔴';
            case 'approved':
                return '✅';
            case 'rejected':
                return '❌';
            case 'pending':
                return '⏳';
            default:
                return '⚪';
        }
    };

    const totalPastDue = pastDueContributions.reduce((total, contribution) => total + Number(contribution.amount), 0);
    const nextDueAmount = upcomingContributions.length > 0 ? Number(upcomingContributions[0].amount) : 0;
    const totalDue = totalPastDue + nextDueAmount;

    return (
        <>
            <Head title={`Member Details - ${member.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                        Member Details
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                                        Comprehensive overview of {member.name}'s health insurance information
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={copyLink}
                                        className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                        variant="outline"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Link
                                    </Button>
                                    <Button 
                                        onClick={() => toPDF()} 
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export PDF
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8" ref={targetRef}>
                            {/* Member Information Card */}
                            <Card className="shadow-xl dark:shadow-gray-800/50 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white border-b-0 rounded-t-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <CardTitle className="text-2xl font-bold">Member Information</CardTitle>
                                        </div>
                                        <Badge className={`${getStatusColor(member.status)} text-white px-4 py-2 text-sm font-medium shadow-lg`}>
                                            {getStatusIcon(member.status)} {member.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{format(new Date(member.date_of_birth), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{member.gender}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{member.contact_number}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{member.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Membership Start</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{format(new Date(member.membership_start_date), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contribution Details</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)} / {member.contribution_frequency}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Total Amount Due Card */}
                            <Card className="shadow-xl dark:shadow-gray-800/50 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 text-white border-b-0 rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">Total Amount Due</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Past Due</p>
                                            </div>
                                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                                {appCurrency.symbol}{totalPastDue.toFixed(2)}
                                            </p>
                                            {pastDueContributions.length > 0 && (
                                                <p className="text-sm text-red-500 dark:text-red-400 font-medium mt-2">
                                                    Due Immediately
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Next Due</p>
                                            </div>
                                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {appCurrency.symbol}{nextDueAmount.toFixed(2)}
                                            </p>
                                            {upcomingContributions.length > 0 && (
                                                <p className="text-sm text-blue-500 dark:text-blue-400 mt-2">
                                                    Due: {format(new Date(upcomingContributions[0].due_date), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Due</p>
                                            </div>
                                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                                {appCurrency.symbol}{totalDue.toFixed(2)}
                                            </p>
                                            {upcomingContributions.length > 0 && (
                                                <p className="text-sm text-purple-500 dark:text-purple-400 mt-2">
                                                    Due by: {format(new Date(upcomingContributions[0].due_date), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contributions Card */}
                            <Card className="shadow-xl dark:shadow-gray-800/50 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white border-b-0 rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">Contributions History</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Payment Method</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Reference Number</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {contributions.map((contribution) => (
                                                    <TableRow key={contribution.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                            {format(new Date(contribution.payment_date), 'MMM d, yyyy')}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                            <span className="text-green-600 dark:text-green-400 font-semibold">
                                                                {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="capitalize font-medium text-gray-900 dark:text-gray-100">
                                                            {contribution.payment_method}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100 font-mono text-sm">
                                                            {contribution.reference_number}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Claims Card */}
                            <Card className="shadow-xl dark:shadow-gray-800/50 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white border-b-0 rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">Claims History</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date of Service</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Type</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Hospital</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {claims.map((claim) => (
                                                    <TableRow key={claim.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                            {format(new Date(claim.date_of_service), 'MMM d, yyyy')}
                                                        </TableCell>
                                                        <TableCell className="capitalize font-medium text-gray-900 dark:text-gray-100">
                                                            {claim.claim_type}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                                {appCurrency.symbol}{Number(claim.amount).toFixed(2)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{claim.hospital_name}</TableCell>
                                                        <TableCell>
                                                            <Badge className={`${getStatusColor(claim.status)} text-white px-3 py-1 text-sm font-medium shadow-md`}>
                                                                {getStatusIcon(claim.status)} {claim.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Upcoming Due Card */}
                            <Card className="shadow-xl dark:shadow-gray-800/50 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-700 dark:to-orange-700 text-white border-b-0 rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">Upcoming Due Contributions</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Due Date</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {upcomingContributions.slice(0, 3).map((contribution, index) => (
                                                    <TableRow key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index === 0 ? "bg-yellow-50 dark:bg-yellow-900/20 font-semibold" : ""}`}>
                                                        <TableCell className={`${index === 0 ? "font-semibold" : "font-medium"} text-gray-900 dark:text-gray-100`}>
                                                            {format(new Date(contribution.due_date), 'MMM d, yyyy')}
                                                        </TableCell>
                                                        <TableCell className={`${index === 0 ? "font-semibold" : "font-medium"} text-gray-900 dark:text-gray-100`}>
                                                            <span className="text-orange-600 dark:text-orange-400">
                                                                {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Past Due Card */}
                            <Card className="shadow-xl dark:shadow-gray-800/50 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-700 dark:to-pink-700 text-white border-b-0 rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">Past Due Contributions</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Due Date</TableHead>
                                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pastDueContributions.map((contribution, index) => (
                                                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                            {format(new Date(contribution.due_date), 'MMM d, yyyy')}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-red-600 dark:text-red-400">
                                                            <span className="font-semibold">
                                                                {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 