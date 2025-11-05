import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';

interface Job {
    id: number;
    title: string;
    job_board?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Props {
    job: Job;
    clientIdentifier?: string;
    canLogin?: boolean;
    canRegister?: boolean;
}

export default function Apply({ job, clientIdentifier, canLogin, canRegister }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        cover_letter: '',
        address: '',
        linkedin_url: '',
        portfolio_url: '',
        work_experience: '',
        education: '',
        skills: '',
        certifications: '',
        languages: '',
        summary: '',
        client_identifier: clientIdentifier || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure client_identifier is included in form data
        if (clientIdentifier) {
            setData('client_identifier', clientIdentifier);
        }
        post(route('jobs.public.apply.submit', job.id));
    };

    return (
        <GuestLayout>
            <Head title={`Apply for ${job.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg dark:border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <Link
                                href={clientIdentifier 
                                    ? `${route('jobs.public.job', job.id)}?client=${encodeURIComponent(clientIdentifier)}`
                                    : route('jobs.public.job', job.id)
                                }
                                className="flex items-center text-white/90 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                <span className="font-medium">Back to Job</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
                            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Apply for {job.title}</CardTitle>
                            <CardDescription className="text-base mt-2 text-gray-600 dark:text-gray-400">
                                Please fill out the form below to submit your application. All fields marked with * are required.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Full Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-600">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.address && (
                                                <p className="text-sm text-red-600">{errors.address}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                <div className="space-y-2">
                                    <Label htmlFor="cover_letter">Cover Letter</Label>
                                    <Textarea
                                        id="cover_letter"
                                        value={data.cover_letter}
                                        onChange={(e) => setData('cover_letter', e.target.value)}
                                        rows={4}
                                        placeholder="Tell us why you're interested in this position..."
                                        className="text-gray-900 dark:text-white"
                                    />
                                    {errors.cover_letter && (
                                        <p className="text-sm text-red-600">{errors.cover_letter}</p>
                                    )}
                                </div>

                                {/* Professional Information */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Professional Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                                            <Input
                                                id="linkedin_url"
                                                type="url"
                                                value={data.linkedin_url}
                                                onChange={(e) => setData('linkedin_url', e.target.value)}
                                                placeholder="https://linkedin.com/in/yourprofile"
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.linkedin_url && (
                                                <p className="text-sm text-red-600">{errors.linkedin_url}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="portfolio_url">Portfolio URL</Label>
                                            <Input
                                                id="portfolio_url"
                                                type="url"
                                                value={data.portfolio_url}
                                                onChange={(e) => setData('portfolio_url', e.target.value)}
                                                placeholder="https://yourportfolio.com"
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.portfolio_url && (
                                                <p className="text-sm text-red-600">{errors.portfolio_url}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="work_experience">Work Experience</Label>
                                        <Textarea
                                            id="work_experience"
                                            value={data.work_experience}
                                            onChange={(e) => setData('work_experience', e.target.value)}
                                            rows={4}
                                            placeholder="List your previous work experience..."
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.work_experience && (
                                            <p className="text-sm text-red-600">{errors.work_experience}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="education">Education</Label>
                                        <Textarea
                                            id="education"
                                            value={data.education}
                                            onChange={(e) => setData('education', e.target.value)}
                                            rows={3}
                                            placeholder="List your educational background..."
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.education && (
                                            <p className="text-sm text-red-600">{errors.education}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="skills">Skills</Label>
                                        <Textarea
                                            id="skills"
                                            value={data.skills}
                                            onChange={(e) => setData('skills', e.target.value)}
                                            rows={2}
                                            placeholder="List your skills (comma-separated or as a list)..."
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.skills && (
                                            <p className="text-sm text-red-600">{errors.skills}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="certifications">Certifications</Label>
                                            <Textarea
                                                id="certifications"
                                                value={data.certifications}
                                                onChange={(e) => setData('certifications', e.target.value)}
                                                rows={2}
                                                placeholder="List any relevant certifications..."
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.certifications && (
                                                <p className="text-sm text-red-600">{errors.certifications}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="languages">Languages</Label>
                                            <Textarea
                                                id="languages"
                                                value={data.languages}
                                                onChange={(e) => setData('languages', e.target.value)}
                                                rows={2}
                                                placeholder="List languages you speak..."
                                                className="text-gray-900 dark:text-white"
                                            />
                                            {errors.languages && (
                                                <p className="text-sm text-red-600">{errors.languages}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="summary">Professional Summary</Label>
                                        <Textarea
                                            id="summary"
                                            value={data.summary}
                                            onChange={(e) => setData('summary', e.target.value)}
                                            rows={3}
                                            placeholder="Brief summary of your professional background..."
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.summary && (
                                            <p className="text-sm text-red-600">{errors.summary}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Error Alert */}
                                {errors && 'error' in errors && (errors as any).error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{(errors as any).error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Submit Button */}
                                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Link href={clientIdentifier 
                                        ? `${route('jobs.public.job', job.id)}?client=${encodeURIComponent(clientIdentifier)}`
                                        : route('jobs.public.job', job.id)
                                    }>
                                        <Button type="button" variant="outline" className="h-12 px-6 border-2">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-5 w-5" />
                                                Submit Application
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </GuestLayout>
    );
}
