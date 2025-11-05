import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';

interface JobBoard {
    id: number;
    name: string;
    description?: string;
    slug: string;
    is_active: boolean;
    settings?: any;
}

interface Props extends PageProps {
    jobBoard: JobBoard;
}

export default function EditJobBoard({ auth, jobBoard }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: jobBoard.name || '',
        description: jobBoard.description || '',
        slug: jobBoard.slug || '',
        is_active: jobBoard.is_active ?? true,
        settings: jobBoard.settings || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('jobs.updateBoard', jobBoard.id), {
            onSuccess: () => {
                toast.success('Job board updated successfully');
            },
            onError: () => {
                toast.error('Failed to update job board');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href={route('jobs.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Job Board
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Update job board information
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Job Board" />

            <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Board Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="name">
                                            Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Engineering Jobs, Sales Positions"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe this job board..."
                                            rows={3}
                                            className="text-gray-900 dark:text-white"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            placeholder="URL-friendly identifier"
                                            className="text-gray-900 dark:text-white"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            URL-friendly identifier
                                        </p>
                                        {errors.slug && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link href={route('jobs.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Job Board'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
}

