import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useState } from 'react';
import { PlusIcon, XIcon, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';

interface IdNumber {
    id?: number;
    type: string;
    number: string;
    notes?: string;
}

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender: 'male' | 'female' | 'other';
    date_of_birth?: string;
    fathers_name?: string;
    mothers_maiden_name?: string;
    email: string;
    call_number?: string;
    sms_number?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    address?: string;
    notes?: string;
    id_picture?: string;
    id_numbers?: IdNumber[];
    group?: string[];
    created_at: string;
    updated_at: string;
}

interface Props {
    auth: { user: any };
    contact: Contact;
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
    id_picture: File | string | null;
    id_numbers: IdNumber[];
    group: string[];
    _method: string;
}

export default function Edit({ auth, contact }: Props) {
    // Parse id_numbers if it's a string
    const parseIdNumbers = (idNumbers: any) => {
        if (!idNumbers) return [];
        if (Array.isArray(idNumbers)) return idNumbers;
        try {
            return typeof idNumbers === 'string' ? JSON.parse(idNumbers) : [];
        } catch (e) {
            console.error('Error parsing id_numbers:', e);
            return [];
        }
    };

    const { data, setData, post, processing, errors } = useForm<FormData>({
        first_name: contact.first_name || '',
        middle_name: contact.middle_name || '',
        last_name: contact.last_name || '',
        gender: contact.gender || 'male',
        date_of_birth: contact.date_of_birth || '',
        fathers_name: contact.fathers_name || '',
        mothers_maiden_name: contact.mothers_maiden_name || '',
        email: contact.email || '',
        call_number: contact.call_number || '',
        sms_number: contact.sms_number || '',
        whatsapp: contact.whatsapp || '',
        facebook: contact.facebook || '',
        instagram: contact.instagram || '',
        twitter: contact.twitter || '',
        linkedin: contact.linkedin || '',
        address: contact.address || '',
        notes: contact.notes || '',
        id_picture: contact.id_picture || null,
        id_numbers: parseIdNumbers(contact.id_numbers),
        group: contact.group || [],
        _method: 'PUT'
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(contact.id_picture || null);
    const [fileError, setFileError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null); // Reset error on new file selection
        
        if (file) {
            // Check file size (e.g., limit to 2MB)
            const maxSize = 2 * 1024 * 1024; // 2MB in bytes
            if (file.size > maxSize) {
                setFileError('Image size must be less than 2MB');
                e.target.value = ''; // Reset input
                return;
            }

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
            { type: '', number: '', notes: '' }
        ]);
    };

    const removeIdNumber = (index: number) => {
        setData('id_numbers', data.id_numbers.filter((_: IdNumber, i: number) => i !== index));
    };

    const updateIdNumber = (index: number, field: keyof IdNumber, value: string) => {
        const updatedIdNumbers = [...data.id_numbers];
        updatedIdNumbers[index] = {
            ...updatedIdNumbers[index],
            [field]: value
        };
        setData('id_numbers', updatedIdNumbers);
    };

    const addGroup = () => {
        setData('group', [...data.group, '']);
    };

    const removeGroup = (index: number) => {
        setData('group', data.group.filter((_, i) => i !== index));
    };

    const updateGroup = (index: number, value: string) => {
        const newGroups = [...data.group];
        newGroups[index] = value;
        setData('group', newGroups);
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('contacts.update', contact.id), {
            ...data,
            forceFormData: true,
            onError: (errors: Record<string, string>) => {
                if (errors.id_picture?.includes('413')) {
                    setFileError('The image file is too large. Please choose a smaller file (max 2MB).');
                }
            }
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="relative overflow-hidden p-6">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 opacity-10 dark:opacity-20"></div>
                    
                    <div className="relative flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl shadow-lg">
                            <Edit3 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                Edit Contact
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Update contact information
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Edit Contact" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                Edit Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* ID Picture Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                        Profile Picture
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="flex items-center gap-6">
                                        {previewUrl ? (
                                            <div className="relative group">
                                                <img 
                                                    src={previewUrl} 
                                                    alt="ID Preview" 
                                                    className="w-32 h-32 object-cover rounded-lg ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all duration-200"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg flex items-center justify-center">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">No Image</span>
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="id_picture" className="text-gray-700 dark:text-gray-300 font-medium">Upload Photo</Label>
                                            <Input
                                                id="id_picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {(errors.id_picture || fileError) && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                                                    {fileError || errors.id_picture}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                        Personal Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-300 font-medium">First Name</Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={e => setData('first_name', e.target.value)}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.first_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="middle_name" className="text-gray-700 dark:text-gray-300 font-medium">Middle Name</Label>
                                            <Input
                                                id="middle_name"
                                                value={data.middle_name}
                                                onChange={e => setData('middle_name', e.target.value)}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.middle_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.middle_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-300 font-medium">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={e => setData('last_name', e.target.value)}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.last_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300 font-medium">Gender</Label>
                                            <Select
                                                value={data.gender}
                                                onValueChange={(value: 'male' | 'female' | 'other') => setData('gender', value)}
                                            >
                                                <SelectTrigger id="gender" className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.gender}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_of_birth" className="text-gray-700 dark:text-gray-300 font-medium">Date of Birth</Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={e => setData('date_of_birth', e.target.value)}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.date_of_birth && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.date_of_birth}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Family Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                        Family Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fathers_name" className="text-gray-700 dark:text-gray-300 font-medium">Father's Name</Label>
                                            <Input
                                                id="fathers_name"
                                                value={data.fathers_name}
                                                onChange={e => setData('fathers_name', e.target.value)}
                                                placeholder="Full name of father"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.fathers_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.fathers_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mothers_maiden_name" className="text-gray-700 dark:text-gray-300 font-medium">Mother's Maiden Name</Label>
                                            <Input
                                                id="mothers_maiden_name"
                                                value={data.mothers_maiden_name}
                                                onChange={e => setData('mothers_maiden_name', e.target.value)}
                                                placeholder="Mother's full name before marriage"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.mothers_maiden_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.mothers_maiden_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                                        Contact Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="call_number" className="text-gray-700 dark:text-gray-300 font-medium">Call Number</Label>
                                            <Input
                                                id="call_number"
                                                value={data.call_number}
                                                onChange={e => setData('call_number', e.target.value)}
                                                placeholder="e.g. +1234567890"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.call_number && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.call_number}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sms_number" className="text-gray-700 dark:text-gray-300 font-medium">SMS Number</Label>
                                            <Input
                                                id="sms_number"
                                                value={data.sms_number}
                                                onChange={e => setData('sms_number', e.target.value)}
                                                placeholder="e.g. +1234567890"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.sms_number && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.sms_number}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp" className="text-gray-700 dark:text-gray-300 font-medium">WhatsApp</Label>
                                            <Input
                                                id="whatsapp"
                                                value={data.whatsapp}
                                                onChange={e => setData('whatsapp', e.target.value)}
                                                placeholder="e.g. +1234567890"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.whatsapp && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.whatsapp}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                        <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                                        Social Media
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="facebook" className="text-gray-700 dark:text-gray-300 font-medium">Facebook URL</Label>
                                            <Input
                                                id="facebook"
                                                value={data.facebook}
                                                onChange={e => setData('facebook', e.target.value)}
                                                placeholder="e.g. https://facebook.com/username"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.facebook && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.facebook}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="instagram" className="text-gray-700 dark:text-gray-300 font-medium">Instagram URL</Label>
                                            <Input
                                                id="instagram"
                                                value={data.instagram}
                                                onChange={e => setData('instagram', e.target.value)}
                                                placeholder="e.g. https://instagram.com/username"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.instagram && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.instagram}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="twitter" className="text-gray-700 dark:text-gray-300 font-medium">Twitter/X URL</Label>
                                            <Input
                                                id="twitter"
                                                value={data.twitter}
                                                onChange={e => setData('twitter', e.target.value)}
                                                placeholder="e.g. https://twitter.com/username"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.twitter && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.twitter}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin" className="text-gray-700 dark:text-gray-300 font-medium">LinkedIn URL</Label>
                                            <Input
                                                id="linkedin"
                                                value={data.linkedin}
                                                onChange={e => setData('linkedin', e.target.value)}
                                                placeholder="e.g. https://linkedin.com/in/username"
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                                            />
                                            {errors.linkedin && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.linkedin}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                                        Additional Information
                                    </h3>
                                    <Separator className="my-4" />
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-gray-700 dark:text-gray-300 font-medium">Address</Label>
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200 min-h-[100px]"
                                            />
                                            {errors.address && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.address}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="group" className="text-gray-700 dark:text-gray-300 font-medium">Groups</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addGroup}
                                                    className="text-xs relative group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-md blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                                    <PlusIcon className="h-4 w-4 mr-1 relative z-10" />
                                                    <span className="relative z-10">Add Group</span>
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {data.group.map((group, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input
                                                            type="text"
                                                            value={group}
                                                            onChange={(e) => updateGroup(index, e.target.value)}
                                                            placeholder="Enter group name"
                                                            className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeGroup(index)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                                        >
                                                            <XIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300 font-medium">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={e => setData('notes', e.target.value)}
                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200 min-h-[100px]"
                                            />
                                            {errors.notes && (
                                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                                    {errors.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ID Numbers Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                                            ID Numbers
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addIdNumber}
                                            className="relative group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-md blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                            <PlusIcon className="w-4 h-4 mr-2 relative z-10" />
                                            <span className="relative z-10">Add ID Number</span>
                                        </Button>
                                    </div>
                                    <Separator className="my-4" />
                                    
                                    {data.id_numbers.map((idNumber: IdNumber, index: number) => (
                                        <div key={index} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-lg space-y-4 border border-emerald-200 dark:border-emerald-700">
                                            <div className="flex justify-between items-start">
                                                <div className="grid grid-cols-2 gap-6 flex-1">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`id_type_${index}`} className="text-gray-700 dark:text-gray-300 font-medium">ID Type</Label>
                                                        <Select
                                                            value={idNumber.type}
                                                            onValueChange={(value) => updateIdNumber(index, 'type', value)}
                                                        >
                                                            <SelectTrigger className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200">
                                                                <SelectValue placeholder="Select ID type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                                                <SelectItem value="SSS">SSS</SelectItem>
                                                                <SelectItem value="TIN">TIN</SelectItem>
                                                                <SelectItem value="GSIS">GSIS</SelectItem>
                                                                <SelectItem value="PhilHealth">PhilHealth</SelectItem>
                                                                <SelectItem value="Pag-IBIG">Pag-IBIG</SelectItem>
                                                                <SelectItem value="Other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`id_number_${index}`} className="text-gray-700 dark:text-gray-300 font-medium">ID Number</Label>
                                                        <Input
                                                            id={`id_number_${index}`}
                                                            value={idNumber.number}
                                                            onChange={(e) => updateIdNumber(index, 'number', e.target.value)}
                                                            placeholder="Enter ID number"
                                                            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeIdNumber(index)}
                                                    className="ml-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`id_notes_${index}`} className="text-gray-700 dark:text-gray-300 font-medium">Notes</Label>
                                                <Input
                                                    id={`id_notes_${index}`}
                                                    value={idNumber.notes}
                                                    onChange={(e) => updateIdNumber(index, 'notes', e.target.value)}
                                                    placeholder="Additional notes about this ID (optional)"
                                                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {errors.id_numbers && (
                                        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                            {errors.id_numbers}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-8">
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-white/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="relative z-10 font-semibold">
                                            {processing ? 'Updating...' : 'Update Contact'}
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