import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Content } from '@/types/content';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

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
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
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
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Preview Post
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Preview your content before publishing
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href={route('content-creator.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Posts
                            </Button>
                        </Link>
                        {canEdit && (
                            <Link href={route('content-creator.edit', content.id)}>
                                <Button>
                                    <Edit className="w-4 h-4 mr-2" />
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
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="overflow-hidden">
                        {content.featured_image && (
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={content.featured_image}
                                    alt={content.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-3xl font-bold">
                                    {content.title}
                                </CardTitle>
                                <Badge 
                                    variant={getStatusBadgeColor(content.status)}
                                    className="capitalize"
                                >
                                    {content.status}
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>{content.author || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{format(new Date(content.created_at), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {content.excerpt && (
                                <div className="mb-6">
                                    <p className="text-lg text-gray-600 dark:text-gray-300 italic">
                                        {content.excerpt}
                                    </p>
                                </div>
                            )}
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <div dangerouslySetInnerHTML={{ __html: content.content }} />
                            </div>
                            {(content.tags && content.tags.length > 0) && (
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        Tags:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {content.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(content.categories && content.categories.length > 0) && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        Categories:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {content.categories.map((category, index) => (
                                            <Badge key={index} variant="secondary">
                                                {category}
                                            </Badge>
                                        ))}
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