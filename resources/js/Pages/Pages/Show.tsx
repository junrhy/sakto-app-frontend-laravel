import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Page } from '@/types/pages';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { Edit, ArrowLeft } from 'lucide-react';

interface Props {
    auth: { 
        user: any;
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
    page: Page;
}

export default function Show({ auth, page }: Props) {
    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    return (
        <AuthenticatedLayout>
            <Head title={page.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('pages.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Pages
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-2xl">{page.title}</CardTitle>
                                <div className="flex items-center space-x-4">
                                    <Badge variant={page.is_published ? "default" : "secondary"}>
                                        {page.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                    {canEdit && (
                                        <Link href={route('pages.edit', page.id)}>
                                            <Button>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Page
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {page.featured_image && (
                                    <div>
                                        <img
                                            src={page.featured_image}
                                            alt={page.title}
                                            className="w-full max-h-96 object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="prose max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: page.content }} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p className="font-semibold">Slug</p>
                                        <p>{page.slug}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Template</p>
                                        <p>{page.template || 'Default'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Meta Description</p>
                                        <p>{page.meta_description || 'No meta description'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Meta Keywords</p>
                                        <p>{page.meta_keywords || 'No meta keywords'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Created At</p>
                                        <p>{format(new Date(page.created_at), 'PPP')}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Last Updated</p>
                                        <p>{format(new Date(page.updated_at), 'PPP')}</p>
                                    </div>
                                </div>

                                {(page.custom_css || page.custom_js) && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold mb-4">Custom Code</h3>
                                        {page.custom_css && (
                                            <div className="mb-4">
                                                <h4 className="font-medium mb-2">Custom CSS</h4>
                                                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                                    <code>{page.custom_css}</code>
                                                </pre>
                                            </div>
                                        )}
                                        {page.custom_js && (
                                            <div>
                                                <h4 className="font-medium mb-2">Custom JavaScript</h4>
                                                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                                    <code>{page.custom_js}</code>
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 