import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Content } from '@/types/content';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Edit, User } from 'lucide-react';
import { useMemo } from 'react';

interface Props extends PageProps {
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
    content: Content;
}

export default function Preview({ auth, content }: Props) {
    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'default';
            case 'draft':
                return 'secondary';
            case 'archived':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Preview Post
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Preview your content before publishing
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href={route('content-creator.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Posts
                            </Button>
                        </Link>
                        {canEdit && (
                            <Link
                                href={route('content-creator.edit', content.id)}
                            >
                                <Button>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Post
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Preview: ${content.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card className="overflow-hidden">
                        {content.featured_image && (
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={content.featured_image}
                                    alt={content.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-3xl font-bold">
                                    {content.title}
                                </CardTitle>
                                <Badge
                                    variant={getStatusBadgeColor(
                                        content.status,
                                    )}
                                    className="capitalize"
                                >
                                    {content.status}
                                </Badge>
                            </div>
                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>{content.author || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {format(
                                            new Date(content.created_at),
                                            'MMM d, yyyy',
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {content.excerpt && (
                                <div className="mb-6">
                                    <p className="text-lg italic text-gray-600 dark:text-gray-300">
                                        {content.excerpt}
                                    </p>
                                </div>
                            )}
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: content.content,
                                    }}
                                />
                            </div>
                            {content.tags && content.tags.length > 0 && (
                                <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Tags:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {content.tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {content.categories &&
                                content.categories.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            Categories:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {content.categories.map(
                                                (category, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                    >
                                                        {category}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
