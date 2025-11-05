import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Globe, Eye } from 'lucide-react';

interface Application {
    id: number;
    job: {
        id: number;
        title: string;
        job_board: {
            id: number;
            name: string;
        };
    };
    cover_letter?: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected';
    applied_at: string;
}

interface Applicant {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    work_experience?: string;
    education?: string;
    skills?: string;
    certifications?: string;
    languages?: string;
    summary?: string;
    applications: Application[];
}

interface Props extends PageProps {
    applicant: Applicant;
}

export default function Applicant({ auth, applicant }: Props) {
    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            interviewed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href={route('jobs.applicants')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {applicant.name}
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Applicant Profile
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={applicant.name} />

            <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Profile */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">{applicant.email}</span>
                                    </div>
                                    {applicant.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{applicant.phone}</span>
                                        </div>
                                    )}
                                    {applicant.address && (
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                                            <span className="text-gray-900 dark:text-white">{applicant.address}</span>
                                        </div>
                                    )}
                                    {applicant.linkedin_url && (
                                        <div className="flex items-center space-x-3">
                                            <Linkedin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <a
                                                href={applicant.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                LinkedIn Profile
                                            </a>
                                        </div>
                                    )}
                                    {applicant.portfolio_url && (
                                        <div className="flex items-center space-x-3">
                                            <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <a
                                                href={applicant.portfolio_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Portfolio
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Resume Sections */}
                            {applicant.summary && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Professional Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {applicant.summary}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {applicant.work_experience && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Work Experience</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {applicant.work_experience}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {applicant.education && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Education</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {applicant.education}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {applicant.skills && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {applicant.skills}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {applicant.certifications && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Certifications</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {applicant.certifications}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {applicant.languages && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Languages</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {applicant.languages}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Applications */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Applications ({applicant.applications.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {applicant.applications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <p className="text-gray-600 dark:text-gray-400">
                                                No applications yet
                                            </p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                                    <TableHead className="text-gray-900 dark:text-white">Job</TableHead>
                                                    <TableHead className="text-gray-900 dark:text-white">Job Board</TableHead>
                                                    <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                                    <TableHead className="text-gray-900 dark:text-white">Applied</TableHead>
                                                    <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {applicant.applications.map((application) => (
                                                    <TableRow key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <TableCell className="text-gray-900 dark:text-white font-medium">
                                                            {application.job.title}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {application.job.job_board.name}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            <Badge className={getStatusColor(application.status)}>
                                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {new Date(application.applied_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right text-gray-900 dark:text-white">
                                                            <Link href={route('jobs.application', application.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
            </div>
        </AuthenticatedLayout>
    );
}

