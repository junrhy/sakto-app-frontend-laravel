import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Course {
    id: number;
    title: string;
    description: string;
    lessons_count: number;
}

interface Props {
    auth: any;
    course: Course;
}

export default function Create({ auth, course }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        video_url: '',
        duration_minutes: '',
        order_index: (course.lessons_count + 1).toString(),
        is_free_preview: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await router.post(`/courses/${course.id}/lessons`, formData);
            toast.success('Lesson created successfully');
        } catch (error) {
            console.error('Error creating lesson:', error);
            toast.error('Failed to create lesson');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Add Lesson
                </h2>
            }
        >
            <Head title={`Add Lesson - ${course.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <Link href={`/courses/${course.id}/lessons`}>
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Lessons
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Lesson</CardTitle>
                        <CardDescription>
                            Create a new lesson for "{course.title}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Label htmlFor="title">
                                        Lesson Title *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter lesson title"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        placeholder="Brief description of the lesson"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="order_index">Order *</Label>
                                    <Input
                                        id="order_index"
                                        type="number"
                                        value={formData.order_index}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                order_index: e.target.value,
                                            }))
                                        }
                                        placeholder="1"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="duration_minutes">
                                        Duration (minutes)
                                    </Label>
                                    <Input
                                        id="duration_minutes"
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                duration_minutes:
                                                    e.target.value,
                                            }))
                                        }
                                        placeholder="30"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="video_url">Video URL</Label>
                                    <Input
                                        id="video_url"
                                        type="url"
                                        value={formData.video_url}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                video_url: e.target.value,
                                            }))
                                        }
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="is_free_preview">
                                        Access
                                    </Label>
                                    <Select
                                        value={formData.is_free_preview.toString()}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                is_free_preview:
                                                    value === 'true',
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">
                                                Free
                                            </SelectItem>
                                            <SelectItem value="false">
                                                Paid
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="content">Lesson Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            content: e.target.value,
                                        }))
                                    }
                                    placeholder="Detailed lesson content, instructions, or notes..."
                                    rows={8}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSubmitting
                                        ? 'Creating...'
                                        : 'Create Lesson'}
                                </Button>
                                <Link href={`/courses/${course.id}/lessons`}>
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
