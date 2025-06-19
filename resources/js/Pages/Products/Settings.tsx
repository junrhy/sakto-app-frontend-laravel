import { User, Project } from '@/types/index';
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

interface Settings {
    default_currency: string;
    max_file_size: number;
    allowed_file_types: string[];
    storage_path: string;
    watermark_enabled: boolean;
    watermark_text: string;
    watermark_position: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
    };
    settings: Settings;
}

export default function Settings({ auth, settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        default_currency: settings.default_currency,
        max_file_size: settings.max_file_size,
        allowed_file_types: settings.allowed_file_types.join(', '),
        storage_path: settings.storage_path,
        watermark_enabled: settings.watermark_enabled,
        watermark_text: settings.watermark_text,
        watermark_position: settings.watermark_position,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.settings.update'));
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Products Settings</h2>}
        >
            <Head title="Products Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products Settings</CardTitle>
                            <CardDescription>
                                Configure your products settings and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="default_currency" value="Default Currency" />
                                    <Input
                                        id="default_currency"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.default_currency}
                                        onChange={e => setData('default_currency', e.target.value)}
                                        placeholder="USD"
                                    />
                                    <InputError message={errors.default_currency} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="max_file_size" value="Maximum File Size (MB)" />
                                    <Input
                                        id="max_file_size"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.max_file_size}
                                        onChange={e => setData('max_file_size', parseInt(e.target.value))}
                                        min="1"
                                        max="100"
                                    />
                                    <InputError message={errors.max_file_size} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="allowed_file_types" value="Allowed File Types" />
                                    <Input
                                        id="allowed_file_types"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.allowed_file_types}
                                        onChange={e => setData('allowed_file_types', e.target.value)}
                                        placeholder="pdf, doc, docx, mp4, mp3"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Comma-separated list of allowed file extensions
                                    </p>
                                    <InputError message={errors.allowed_file_types} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="storage_path" value="Storage Path" />
                                    <Input
                                        id="storage_path"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.storage_path}
                                        onChange={e => setData('storage_path', e.target.value)}
                                        placeholder="products"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Path where products will be stored
                                    </p>
                                    <InputError message={errors.storage_path} className="mt-2" />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="watermark_enabled"
                                            checked={data.watermark_enabled}
                                            onChange={e => setData('watermark_enabled', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <Label htmlFor="watermark_enabled">Enable Watermark</Label>
                                    </div>

                                    {data.watermark_enabled && (
                                        <>
                                            <div>
                                                <InputLabel htmlFor="watermark_text" value="Watermark Text" />
                                                <Input
                                                    id="watermark_text"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.watermark_text}
                                                    onChange={e => setData('watermark_text', e.target.value)}
                                                    placeholder="© Your Company Name"
                                                />
                                                <InputError message={errors.watermark_text} className="mt-2" />
                                            </div>

                                            <div>
                                                <Label htmlFor="watermark_position">Watermark Position</Label>
                                                <select
                                                    id="watermark_position"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    value={data.watermark_position}
                                                    onChange={e => setData('watermark_position', e.target.value)}
                                                >
                                                    <option value="top-left">Top Left</option>
                                                    <option value="top-right">Top Right</option>
                                                    <option value="bottom-left">Bottom Left</option>
                                                    <option value="bottom-right">Bottom Right</option>
                                                    <option value="center">Center</option>
                                                </select>
                                                <InputError message={errors.watermark_position} className="mt-2" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton disabled={processing}>
                                        Save Settings
                                    </PrimaryButton>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 