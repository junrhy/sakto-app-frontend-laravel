import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Globe, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ApplicationStatusBadge from './components/ApplicationStatusBadge';

interface Job {
    id: number;
    title: string;
    description: string;
    job_board: {
        id: number;
        name: string;
    };
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
}

interface Application {
    id: number;
    job: Job;
    applicant: Applicant;
    cover_letter?: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected';
    notes?: string;
    applied_at: string;
    reviewed_at?: string;
    interview_date?: string;
}

interface Props extends PageProps {
    application: Application;
}

export default function Application({ auth, application }: Props) {
    const [status, setStatus] = useState(application.status);
    const [notes, setNotes] = useState(application.notes || '');
    const [interviewDate, setInterviewDate] = useState(application.interview_date || '');

    const handleStatusUpdate = () => {
        router.put(
            route('jobs.updateApplication', application.id),
            {
                status,
                notes,
                interview_date: interviewDate || null,
            },
            {
                onSuccess: () => {
                    toast.success('Application updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update application');
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href={route('jobs.applications')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Application Details
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {application.applicant.name} - {application.job.title}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Application Details" />

            <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column - Applicant Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Applicant Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {application.applicant.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">{application.applicant.email}</span>
                                    </div>
                                    {application.applicant.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{application.applicant.phone}</span>
                                        </div>
                                    )}
                                    {application.applicant.address && (
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                                            <span className="text-gray-900 dark:text-white">{application.applicant.address}</span>
                                        </div>
                                    )}
                                    {application.applicant.linkedin_url && (
                                        <div className="flex items-center space-x-3">
                                            <Linkedin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <a
                                                href={application.applicant.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                LinkedIn Profile
                                            </a>
                                        </div>
                                    )}
                                    {application.applicant.portfolio_url && (
                                        <div className="flex items-center space-x-3">
                                            <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <a
                                                href={application.applicant.portfolio_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Portfolio
                                            </a>
                                        </div>
                                    )}
                                    <Link href={route('jobs.applicant', application.applicant.id)}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            View Full Profile
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Resume Sections */}
                            {application.applicant.summary && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Professional Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {application.applicant.summary}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {application.applicant.work_experience && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Work Experience</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {application.applicant.work_experience}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {application.applicant.education && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Education</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {application.applicant.education}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {application.applicant.skills && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {application.applicant.skills}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Application Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Job:</span>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {application.job.title}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Job Board:</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {application.job.job_board.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Applied:</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(application.applied_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {application.reviewed_at && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviewed:</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(application.reviewed_at).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {application.cover_letter && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <FileText className="mr-2 h-5 w-5" />
                                            Cover Letter
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                            {application.cover_letter}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Manage Application</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                                <SelectItem value="interviewed">Interviewed</SelectItem>
                                                <SelectItem value="accepted">Accepted</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="mt-2">
                                            <ApplicationStatusBadge status={status} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="interview_date">Interview Date</Label>
                                        <input
                                            id="interview_date"
                                            type="datetime-local"
                                            value={interviewDate}
                                            onChange={(e) => setInterviewDate(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Internal Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add notes about this application..."
                                            rows={6}
                                            className="text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <Button onClick={handleStatusUpdate} className="w-full">
                                        Update Application
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
            </div>
        </AuthenticatedLayout>
    );
}

