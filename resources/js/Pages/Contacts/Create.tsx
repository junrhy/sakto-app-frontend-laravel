import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useState } from 'react';
import { PlusIcon, XIcon, ArrowUpRightSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';

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
            { type: '', number: '', notes: '' }
        ]);
    };

    const removeIdNumber = (index: number) => {
        setData('id_numbers', data.id_numbers.filter((_, i) => i !== index));
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
        post(route('contacts.store'), {
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
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Add Contact
                    </h2>
                    <Link 
                        href={route('contacts.self-registration') + `?client_identifier=${client_identifier}`} 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition-colors"
                    >
                        <ArrowUpRightSquare className="w-4 h-4 mr-2" />
                        Self Registration Form
                    </Link>
                </div>
            }
        >
            <Head title="Add Contact" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-white dark:bg-gray-800/40 shadow-lg backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* ID Picture Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Picture</h3>
                                    <Separator className="my-4" />
                                    <div className="flex items-center gap-6">
                                        {previewUrl ? (
                                            <img 
                                                src={previewUrl} 
                                                alt="ID Preview" 
                                                className="w-32 h-32 object-cover rounded-lg ring-2 ring-gray-200 dark:ring-gray-700"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg ring-2 ring-gray-200 dark:ring-gray-700 flex items-center justify-center">
                                                <span className="text-gray-500 dark:text-gray-400">No Image</span>
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="id_picture" className="text-gray-700 dark:text-gray-300">Upload Photo</Label>
                                            <Input
                                                id="id_picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {fileError && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-300">First Name</Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={e => setData('first_name', e.target.value)}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="middle_name" className="text-gray-700 dark:text-gray-300">Middle Name</Label>
                                            <Input
                                                id="middle_name"
                                                value={data.middle_name}
                                                onChange={e => setData('middle_name', e.target.value)}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.middle_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.middle_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={e => setData('last_name', e.target.value)}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">Gender</Label>
                                            <Select
                                                value={data.gender}
                                                onValueChange={(value: 'male' | 'female' | 'other') => setData('gender', value)}
                                            >
                                                <SelectTrigger id="gender" className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Family Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Family Information</h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fathers_name" className="text-gray-700 dark:text-gray-300">Father's Name</Label>
                                            <Input
                                                id="fathers_name"
                                                value={data.fathers_name}
                                                onChange={e => setData('fathers_name', e.target.value)}
                                                placeholder="Full name of father"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.fathers_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.fathers_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mothers_maiden_name" className="text-gray-700 dark:text-gray-300">Mother's Maiden Name</Label>
                                            <Input
                                                id="mothers_maiden_name"
                                                value={data.mothers_maiden_name}
                                                onChange={e => setData('mothers_maiden_name', e.target.value)}
                                                placeholder="Mother's full name before marriage"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.mothers_maiden_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.mothers_maiden_name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="call_number" className="text-gray-700 dark:text-gray-300">Call Number</Label>
                                            <Input
                                                id="call_number"
                                                value={data.call_number}
                                                onChange={e => setData('call_number', e.target.value)}
                                                placeholder="e.g. +1234567890"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.call_number && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.call_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sms_number" className="text-gray-700 dark:text-gray-300">SMS Number</Label>
                                            <Input
                                                id="sms_number"
                                                value={data.sms_number}
                                                onChange={e => setData('sms_number', e.target.value)}
                                                placeholder="e.g. +1234567890"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.sms_number && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.sms_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp" className="text-gray-700 dark:text-gray-300">WhatsApp</Label>
                                            <Input
                                                id="whatsapp"
                                                value={data.whatsapp}
                                                onChange={e => setData('whatsapp', e.target.value)}
                                                placeholder="e.g. +1234567890"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.whatsapp && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.whatsapp}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Social Media</h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="facebook" className="text-gray-700 dark:text-gray-300">Facebook URL</Label>
                                            <Input
                                                id="facebook"
                                                value={data.facebook}
                                                onChange={e => setData('facebook', e.target.value)}
                                                placeholder="e.g. https://facebook.com/username"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.facebook && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.facebook}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="instagram" className="text-gray-700 dark:text-gray-300">Instagram URL</Label>
                                            <Input
                                                id="instagram"
                                                value={data.instagram}
                                                onChange={e => setData('instagram', e.target.value)}
                                                placeholder="e.g. https://instagram.com/username"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.instagram && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.instagram}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="twitter" className="text-gray-700 dark:text-gray-300">Twitter/X URL</Label>
                                            <Input
                                                id="twitter"
                                                value={data.twitter}
                                                onChange={e => setData('twitter', e.target.value)}
                                                placeholder="e.g. https://twitter.com/username"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.twitter && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.twitter}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin" className="text-gray-700 dark:text-gray-300">LinkedIn URL</Label>
                                            <Input
                                                id="linkedin"
                                                value={data.linkedin}
                                                onChange={e => setData('linkedin', e.target.value)}
                                                placeholder="e.g. https://linkedin.com/in/username"
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                            {errors.linkedin && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.linkedin}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Information</h3>
                                    <Separator className="my-4" />
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 min-h-[100px]"
                                            />
                                            {errors.address && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={e => setData('notes', e.target.value)}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 min-h-[100px]"
                                            />
                                            {errors.notes && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ID Numbers Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ID Numbers</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addIdNumber}
                                            className="border-gray-300 dark:border-gray-700"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Add ID Number
                                        </Button>
                                    </div>
                                    <Separator className="my-4" />
                                    
                                    {data.id_numbers.map((idNumber, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg space-y-4 border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start">
                                                <div className="grid grid-cols-2 gap-6 flex-1">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`id_type_${index}`} className="text-gray-700 dark:text-gray-300">ID Type</Label>
                                                        <Select
                                                            value={idNumber.type}
                                                            onValueChange={(value) => updateIdNumber(index, 'type', value)}
                                                        >
                                                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                                                                <SelectValue placeholder="Select ID type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
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
                                                        <Label htmlFor={`id_number_${index}`} className="text-gray-700 dark:text-gray-300">ID Number</Label>
                                                        <Input
                                                            id={`id_number_${index}`}
                                                            value={idNumber.number}
                                                            onChange={(e) => updateIdNumber(index, 'number', e.target.value)}
                                                            placeholder="Enter ID number"
                                                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeIdNumber(index)}
                                                    className="ml-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`id_notes_${index}`} className="text-gray-700 dark:text-gray-300">Notes</Label>
                                                <Input
                                                    id={`id_notes_${index}`}
                                                    value={idNumber.notes}
                                                    onChange={(e) => updateIdNumber(index, 'notes', e.target.value)}
                                                    placeholder="Additional notes about this ID (optional)"
                                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {errors.id_numbers && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.id_numbers}</p>
                                    )}
                                </div>

                                {/* Group Selection */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="group" className="text-gray-700 dark:text-gray-300">Groups</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addGroup}
                                            className="text-xs"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-1" />
                                            Add Group
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
                                                    className="flex-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeGroup(index)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.group && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.group}</p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-6">
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        Save Contact
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