import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { useRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { Button } from '@/Components/ui/button';
import { Download, Copy } from 'lucide-react';
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
            margin: 20, // Add 20px margin on all sides
            format: 'a4',
            orientation: 'portrait'
        }
    });

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
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

    return (
        <>
            <Head title={`Member Details - ${member.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-end gap-2 mb-4">
                        <Button 
                            onClick={copyLink}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </Button>
                        <Button 
                            onClick={() => toPDF()} 
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <Download className="w-4 h-4" />
                            Export to PDF
                        </Button>
                    </div>
                    <div className="space-y-8" ref={targetRef}>
                        {/* Member Information Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gray-50 border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl font-bold text-gray-800">Member Information</CardTitle>
                                    <Badge className={`${getStatusColor(member.status)} text-white px-4 py-1.5 text-sm font-medium`}>
                                        {member.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Name</p>
                                        <p className="text-lg text-gray-900">{member.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                        <p className="text-lg text-gray-900">{format(new Date(member.date_of_birth), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Gender</p>
                                        <p className="text-lg text-gray-900 capitalize">{member.gender}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Contact Number</p>
                                        <p className="text-lg text-gray-900">{member.contact_number}</p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Address</p>
                                        <p className="text-lg text-gray-900">{member.address}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Membership Start Date</p>
                                        <p className="text-lg text-gray-900">{format(new Date(member.membership_start_date), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Contribution Details</p>
                                        <p className="text-lg text-gray-900">
                                            {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)} / {member.contribution_frequency}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Amount Due Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-2xl font-bold text-gray-800">Total Amount Due</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Past Due Amount</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {appCurrency.symbol}
                                            {Number(pastDueContributions.reduce((total, contribution) => total + Number(contribution.amount), 0)).toFixed(2)}
                                        </p>
                                        {pastDueContributions.length > 0 && (
                                            <p className="text-sm text-red-500 font-medium">
                                                Due Immediately
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Next Due Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {appCurrency.symbol}
                                            {upcomingContributions.length > 0 ? Number(upcomingContributions[0].amount).toFixed(2) : '0.00'}
                                        </p>
                                        {upcomingContributions.length > 0 && (
                                            <p className="text-sm text-gray-500">
                                                Due: {format(new Date(upcomingContributions[0].due_date), 'MMM d, yyyy')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2 pt-6 mt-6 border-t">
                                        <p className="text-sm font-medium text-gray-500">Total Amount Due</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {appCurrency.symbol}
                                            {Number(
                                                pastDueContributions.reduce((total, contribution) => total + Number(contribution.amount), 0) +
                                                (upcomingContributions.length > 0 ? Number(upcomingContributions[0].amount) : 0)
                                            ).toFixed(2)}
                                        </p>
                                        {upcomingContributions.length > 0 && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Due by: {format(new Date(upcomingContributions[0].due_date), 'MMM d, yyyy')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contributions Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-2xl font-bold text-gray-800">Contributions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                            <TableHead className="font-semibold">Payment Method</TableHead>
                                            <TableHead className="font-semibold">Reference Number</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contributions.map((contribution) => (
                                            <TableRow key={contribution.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {format(new Date(contribution.payment_date), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="capitalize font-medium">
                                                    {contribution.payment_method}
                                                </TableCell>
                                                <TableCell className="font-medium">{contribution.reference_number}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Claims Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-2xl font-bold text-gray-800">Claims</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold">Date of Service</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                            <TableHead className="font-semibold">Hospital</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {claims.map((claim) => (
                                            <TableRow key={claim.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {format(new Date(claim.date_of_service), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="capitalize font-medium">
                                                    {claim.claim_type}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {appCurrency.symbol}{Number(claim.amount).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="font-medium">{claim.hospital_name}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusColor(claim.status)} text-white px-3 py-1 text-sm font-medium`}>
                                                        {claim.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Upcoming Due Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-2xl font-bold text-gray-800">Upcoming Due Contributions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold">Due Date</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {upcomingContributions.slice(0, 3).map((contribution, index) => (
                                            <TableRow key={index} className={`hover:bg-gray-50 ${index === 0 ? "bg-yellow-50 font-semibold" : ""}`}>
                                                <TableCell className={index === 0 ? "font-semibold" : "font-medium"}>
                                                    {format(new Date(contribution.due_date), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className={index === 0 ? "font-semibold" : "font-medium"}>
                                                    {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Past Due Card */}
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-2xl font-bold text-gray-800">Past Due Contributions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-gray-50">
                                            <TableHead className="font-semibold">Due Date</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pastDueContributions.map((contribution, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {format(new Date(contribution.due_date), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="font-medium text-red-600">
                                                    {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
} 