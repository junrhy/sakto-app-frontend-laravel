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
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowUpRightSquare, PlusIcon, UserPlus, XIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    auth: { user: any };
    client_identifier: string;
}

interface IdNumber {
    type: string;
    number: string;
    notes?: string;
}

interface FormData {
    first_name: string;
    middle_name: string;
    last_name: string;
    gender: 'male' | 'female' | 'other';
    date_of_birth: string;
    fathers_name: string;
    mothers_maiden_name: string;
    email: string;
    call_number: string;
    sms_number: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    address: string;
    notes: string;
    id_picture: File | null;
    id_numbers: IdNumber[];
    group: string[];
}

export default function Create({ auth, client_identifier }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: 'male' as 'male' | 'female' | 'other',
        date_of_birth: '',
        fathers_name: '',
        mothers_maiden_name: '',
        email: '',
        call_number: '',
        sms_number: '',
        whatsapp: '',
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        address: '',
        notes: '',
        id_picture: null,
        id_numbers: [],
        group: [],
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('id_picture', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addIdNumber = () => {
        setData('id_numbers', [
            ...data.id_numbers,
            { type: '', number: '', notes: '' },
        ]);
    };

    const removeIdNumber = (index: number) => {
        setData(
            'id_numbers',
            data.id_numbers.filter((_, i) => i !== index),
        );
    };

    const updateIdNumber = (
        index: number,
        field: keyof IdNumber,
        value: string,
    ) => {
        const updatedIdNumbers = [...data.id_numbers];
        updatedIdNumbers[index] = {
            ...updatedIdNumbers[index],
            [field]: value,
        };
        setData('id_numbers', updatedIdNumbers);
    };

    const addGroup = () => {
        setData('group', [...data.group, '']);
    };

    const removeGroup = (index: number) => {
        setData(
            'group',
            data.group.filter((_, i) => i !== index),
        );
    };

    const updateGroup = (index: number, value: string) => {
        const newGroups = [...data.group];
        newGroups[index] = value;
        setData('group', newGroups);
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('contacts.store'), {
            forceFormData: true,
            onError: (errors: Record<string, string>) => {
                if (errors.id_picture?.includes('413')) {
                    setFileError(
                        'The image file is too large. Please choose a smaller file (max 2MB).',
                    );
                }
            },
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="relative overflow-hidden p-6">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-10 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 dark:opacity-20"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg dark:from-blue-600 dark:to-purple-700">
                                <UserPlus className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-200">
                                    Add Contact
                                </h2>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                    Create a new contact in your database
                                </p>
                            </div>
                        </div>
                        <Link
                            href={
                                route('contacts.self-registration') +
                                `?client_identifier=${client_identifier}`
                            }
                            className="group relative flex transform items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                        >
                            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 blur transition-opacity group-hover:opacity-100"></div>
                            <ArrowUpRightSquare className="relative z-10 mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="relative z-10 font-semibold">
                                Public Registration Form
                            </span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Add Contact" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card className="border border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                        <CardHeader className="pb-6">
                            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-200">
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* ID Picture Section */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
                                        Profile Picture
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="flex items-center gap-6">
                                        {previewUrl ? (
                                            <div className="group relative">
                                                <img
                                                    src={previewUrl}
                                                    alt="ID Preview"
                                                    className="h-32 w-32 rounded-lg object-cover shadow-lg ring-2 ring-gray-200 transition-all duration-200 group-hover:ring-blue-500 dark:ring-gray-700 dark:group-hover:ring-blue-400"
                                                />
                                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                                            </div>
                                        ) : (
                                            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg ring-2 ring-gray-200 dark:from-gray-800 dark:to-gray-700 dark:ring-gray-700">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">
                                                    No Image
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <Label
                                                htmlFor="id_picture"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Upload Photo
                                            </Label>
                                            <Input
                                                id="id_picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-blue-400"
                                            />
                                            {fileError && (
                                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {fileError}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information Section */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                                        Personal Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="first_name"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                First Name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'first_name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-green-400"
                                            />
                                            {errors.first_name && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.first_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="middle_name"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Middle Name
                                            </Label>
                                            <Input
                                                id="middle_name"
                                                value={data.middle_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'middle_name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-green-400"
                                            />
                                            {errors.middle_name && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.middle_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="last_name"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Last Name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'last_name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-green-400"
                                            />
                                            {errors.last_name && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.last_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="gender"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Gender
                                            </Label>
                                            <Select
                                                value={data.gender}
                                                onValueChange={(
                                                    value:
                                                        | 'male'
                                                        | 'female'
                                                        | 'other',
                                                ) => setData('gender', value)}
                                            >
                                                <SelectTrigger
                                                    id="gender"
                                                    className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-green-400"
                                                >
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent className="border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                                                    <SelectItem value="male">
                                                        Male
                                                    </SelectItem>
                                                    <SelectItem value="female">
                                                        Female
                                                    </SelectItem>
                                                    <SelectItem value="other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.gender}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="date_of_birth"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Date of Birth
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) =>
                                                    setData(
                                                        'date_of_birth',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-green-400"
                                            />
                                            {errors.date_of_birth && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.date_of_birth}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-green-400"
                                            />
                                            {errors.email && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Family Information */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <div className="mr-3 h-2 w-2 rounded-full bg-purple-500"></div>
                                        Family Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="fathers_name"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Father's Name
                                            </Label>
                                            <Input
                                                id="fathers_name"
                                                value={data.fathers_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'fathers_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Full name of father"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-purple-400"
                                            />
                                            {errors.fathers_name && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.fathers_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="mothers_maiden_name"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Mother's Maiden Name
                                            </Label>
                                            <Input
                                                id="mothers_maiden_name"
                                                value={data.mothers_maiden_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'mothers_maiden_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Mother's full name before marriage"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-purple-400"
                                            />
                                            {errors.mothers_maiden_name && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.mothers_maiden_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <div className="mr-3 h-2 w-2 rounded-full bg-indigo-500"></div>
                                        Contact Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="call_number"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Call Number
                                            </Label>
                                            <Input
                                                id="call_number"
                                                value={data.call_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'call_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. +1234567890"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-indigo-400"
                                            />
                                            {errors.call_number && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.call_number}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="sms_number"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                SMS Number
                                            </Label>
                                            <Input
                                                id="sms_number"
                                                value={data.sms_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'sms_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. +1234567890"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-indigo-400"
                                            />
                                            {errors.sms_number && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.sms_number}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="whatsapp"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                WhatsApp
                                            </Label>
                                            <Input
                                                id="whatsapp"
                                                value={data.whatsapp}
                                                onChange={(e) =>
                                                    setData(
                                                        'whatsapp',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. +1234567890"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-indigo-400"
                                            />
                                            {errors.whatsapp && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.whatsapp}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <div className="mr-3 h-2 w-2 rounded-full bg-pink-500"></div>
                                        Social Media
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="facebook"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Facebook URL
                                            </Label>
                                            <Input
                                                id="facebook"
                                                value={data.facebook}
                                                onChange={(e) =>
                                                    setData(
                                                        'facebook',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. https://facebook.com/username"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-pink-400"
                                            />
                                            {errors.facebook && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.facebook}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="instagram"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Instagram URL
                                            </Label>
                                            <Input
                                                id="instagram"
                                                value={data.instagram}
                                                onChange={(e) =>
                                                    setData(
                                                        'instagram',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. https://instagram.com/username"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-pink-400"
                                            />
                                            {errors.instagram && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.instagram}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="twitter"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Twitter/X URL
                                            </Label>
                                            <Input
                                                id="twitter"
                                                value={data.twitter}
                                                onChange={(e) =>
                                                    setData(
                                                        'twitter',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. https://twitter.com/username"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-pink-400"
                                            />
                                            {errors.twitter && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.twitter}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="linkedin"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                LinkedIn URL
                                            </Label>
                                            <Input
                                                id="linkedin"
                                                value={data.linkedin}
                                                onChange={(e) =>
                                                    setData(
                                                        'linkedin',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. https://linkedin.com/in/username"
                                                className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-pink-400"
                                            />
                                            {errors.linkedin && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.linkedin}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <div className="mr-3 h-2 w-2 rounded-full bg-amber-500"></div>
                                        Additional Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="address"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Address
                                            </Label>
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={(e) =>
                                                    setData(
                                                        'address',
                                                        e.target.value,
                                                    )
                                                }
                                                className="min-h-[100px] border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-amber-400"
                                            />
                                            {errors.address && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.address}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="notes"
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Notes
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        'notes',
                                                        e.target.value,
                                                    )
                                                }
                                                className="min-h-[100px] border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-amber-400"
                                            />
                                            {errors.notes && (
                                                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    {errors.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ID Numbers Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            <div className="mr-3 h-2 w-2 rounded-full bg-emerald-500"></div>
                                            ID Numbers
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addIdNumber}
                                            className="group relative border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-600 dark:bg-gray-900/80 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20"
                                        >
                                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 blur transition-opacity group-hover:opacity-10"></div>
                                            <PlusIcon className="relative z-10 mr-2 h-4 w-4" />
                                            <span className="relative z-10">
                                                Add ID Number
                                            </span>
                                        </Button>
                                    </div>
                                    <Separator className="my-4" />

                                    {data.id_numbers.map((idNumber, index) => (
                                        <div
                                            key={index}
                                            className="space-y-4 rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 dark:border-emerald-700 dark:from-emerald-900/20 dark:to-green-900/20"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="grid flex-1 grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`id_type_${index}`}
                                                            className="font-medium text-gray-700 dark:text-gray-300"
                                                        >
                                                            ID Type
                                                        </Label>
                                                        <Select
                                                            value={
                                                                idNumber.type
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                updateIdNumber(
                                                                    index,
                                                                    'type',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-emerald-400">
                                                                <SelectValue placeholder="Select ID type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                                                                <SelectItem value="SSS">
                                                                    SSS
                                                                </SelectItem>
                                                                <SelectItem value="TIN">
                                                                    TIN
                                                                </SelectItem>
                                                                <SelectItem value="GSIS">
                                                                    GSIS
                                                                </SelectItem>
                                                                <SelectItem value="PhilHealth">
                                                                    PhilHealth
                                                                </SelectItem>
                                                                <SelectItem value="Pag-IBIG">
                                                                    Pag-IBIG
                                                                </SelectItem>
                                                                <SelectItem value="Other">
                                                                    Other
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`id_number_${index}`}
                                                            className="font-medium text-gray-700 dark:text-gray-300"
                                                        >
                                                            ID Number
                                                        </Label>
                                                        <Input
                                                            id={`id_number_${index}`}
                                                            value={
                                                                idNumber.number
                                                            }
                                                            onChange={(e) =>
                                                                updateIdNumber(
                                                                    index,
                                                                    'number',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Enter ID number"
                                                            className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-emerald-400"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeIdNumber(index)
                                                    }
                                                    className="ml-2 text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`id_notes_${index}`}
                                                    className="font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Notes
                                                </Label>
                                                <Input
                                                    id={`id_notes_${index}`}
                                                    value={idNumber.notes}
                                                    onChange={(e) =>
                                                        updateIdNumber(
                                                            index,
                                                            'notes',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Additional notes about this ID (optional)"
                                                    className="border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-emerald-400"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {errors.id_numbers && (
                                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                            {errors.id_numbers}
                                        </p>
                                    )}
                                </div>

                                {/* Group Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            <div className="mr-3 h-2 w-2 rounded-full bg-orange-500"></div>
                                            Groups
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addGroup}
                                            className="group relative border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 dark:border-gray-600 dark:bg-gray-900/80 dark:hover:border-orange-600 dark:hover:bg-orange-900/20"
                                        >
                                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500 to-red-600 opacity-0 blur transition-opacity group-hover:opacity-10"></div>
                                            <PlusIcon className="relative z-10 mr-1 h-4 w-4" />
                                            <span className="relative z-10 text-xs">
                                                Add Group
                                            </span>
                                        </Button>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="space-y-3">
                                        {data.group.map((group, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3"
                                            >
                                                <Input
                                                    type="text"
                                                    value={group}
                                                    onChange={(e) =>
                                                        updateGroup(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter group name"
                                                    className="flex-1 border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-orange-400"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeGroup(index)
                                                    }
                                                    className="text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.group && (
                                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                            {errors.group}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-8">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="group relative transform bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                                    >
                                        <div className="absolute inset-0 rounded-md bg-white/20 opacity-0 blur transition-opacity group-hover:opacity-100"></div>
                                        <span className="relative z-10 font-semibold">
                                            {processing
                                                ? 'Saving...'
                                                : 'Save Contact'}
                                        </span>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
