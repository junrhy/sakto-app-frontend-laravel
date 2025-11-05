import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
    id: number;
    job_board_id: number;
    title: string;
    description: string;
    requirements?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency: string;
    location?: string;
    employment_type?: string;
    job_category?: string;
    status: 'draft' | 'published' | 'closed';
    application_deadline?: string;
    application_url?: string;
    application_email?: string;
    is_featured: boolean;
}

interface Props extends PageProps {
    job: Job;
}

export default function EditJob({ auth, job }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        job_board_id: job.job_board_id,
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        salary_min: job.salary_min?.toString() || '',
        salary_max: job.salary_max?.toString() || '',
        salary_currency: job.salary_currency || 'PHP',
        location: job.location || '',
        employment_type: job.employment_type || '',
        job_category: job.job_category || '',
        status: job.status || 'draft',
        application_deadline: job.application_deadline || '',
        application_url: job.application_url || '',
        application_email: job.application_email || '',
        is_featured: job.is_featured || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...data,
            salary_min: data.salary_min ? parseFloat(data.salary_min) : null,
            salary_max: data.salary_max ? parseFloat(data.salary_max) : null,
        };
        put(route('jobs.updateJob', job.id), {
            data: submitData,
            onSuccess: () => {
                toast.success('Job updated successfully');
            },
            onError: () => {
                toast.error('Failed to update job');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href={route('jobs.jobBoard', job.job_board_id)}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Job
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Update job information
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Job" />

            <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                        <Label htmlFor="title">
                                            Job Title <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g., Senior Software Engineer"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                        <Label htmlFor="description">
                                            Description <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe the job position..."
                                            rows={4}
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                        <Label htmlFor="requirements">Requirements</Label>
                                        <Textarea
                                            id="requirements"
                                            value={data.requirements}
                                            onChange={(e) => setData('requirements', e.target.value)}
                                            placeholder="List the job requirements..."
                                            rows={3}
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.requirements && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.requirements}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="e.g., Manila, Philippines"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.location && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.location}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="employment_type">Employment Type</Label>
                                        <Select
                                            value={data.employment_type}
                                            onValueChange={(value) => setData('employment_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full-time">Full-time</SelectItem>
                                                <SelectItem value="part-time">Part-time</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                                <SelectItem value="freelance">Freelance</SelectItem>
                                                <SelectItem value="internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.employment_type && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.employment_type}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="job_category">Job Category</Label>
                                        <Input
                                            id="job_category"
                                            value={data.job_category}
                                            onChange={(e) => setData('job_category', e.target.value)}
                                            placeholder="e.g., Engineering, Sales"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.job_category && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.job_category}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value as 'draft' | 'published' | 'closed')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="salary_currency">Salary Currency</Label>
                                        <Select
                                            value={data.salary_currency}
                                            onValueChange={(value) => setData('salary_currency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PHP">PHP</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.salary_currency && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.salary_currency}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="salary_min">Minimum Salary</Label>
                                        <Input
                                            id="salary_min"
                                            type="number"
                                            step="0.01"
                                            value={data.salary_min}
                                            onChange={(e) => setData('salary_min', e.target.value)}
                                            placeholder="0.00"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.salary_min && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.salary_min}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="salary_max">Maximum Salary</Label>
                                        <Input
                                            id="salary_max"
                                            type="number"
                                            step="0.01"
                                            value={data.salary_max}
                                            onChange={(e) => setData('salary_max', e.target.value)}
                                            placeholder="0.00"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.salary_max && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.salary_max}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="application_deadline">Application Deadline</Label>
                                        <Input
                                            id="application_deadline"
                                            type="date"
                                            value={data.application_deadline}
                                            onChange={(e) => setData('application_deadline', e.target.value)}
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.application_deadline && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.application_deadline}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="application_email">Application Email</Label>
                                        <Input
                                            id="application_email"
                                            type="email"
                                            value={data.application_email}
                                            onChange={(e) => setData('application_email', e.target.value)}
                                            placeholder="jobs@example.com"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.application_email && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.application_email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 lg:col-span-3">
                                        <Label htmlFor="application_url">Application URL</Label>
                                        <Input
                                            id="application_url"
                                            type="url"
                                            value={data.application_url}
                                            onChange={(e) => setData('application_url', e.target.value)}
                                            placeholder="https://example.com/apply"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.application_url && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.application_url}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 lg:col-span-3">
                                        <Switch
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onCheckedChange={(checked) => setData('is_featured', checked)}
                                        />
                                        <Label htmlFor="is_featured" className="cursor-pointer">
                                            Featured Job
                                        </Label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link href={route('jobs.jobBoard', job.job_board_id)}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Job'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
}

