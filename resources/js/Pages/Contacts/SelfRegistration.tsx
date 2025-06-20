import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useState, useEffect } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { cn } from '@/lib/utils';

interface IdNumber {
    type: string;
    number: string;
    notes?: string;
}

interface Props {
    flash?: {
        message?: string;
        error?: string;
    };
    client_identifier?: string;
    auth?: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function SelfRegistration({ flash = {}, client_identifier, auth }: Props) {
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const urlClientIdentifier = urlParams.get('client_identifier') || client_identifier || '';
    
    const { data, setData, post, processing, errors } = useForm({
        client_identifier: client_identifier || urlClientIdentifier,
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
        id_picture: null as File | null,
        id_numbers: [] as IdNumber[],
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('contacts.store-self'), {
            onSuccess: () => {
                setShowSuccess(true);
            }
        });
    }

    useEffect(() => {
        if (flash.message) {
            setShowSuccess(true);
        }
    }, [flash.message]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
            <Head title="Contact Registration" />

            <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden shadow-2xl sm:rounded-2xl border border-white/20 dark:border-gray-700/50">
                    <div className="p-8 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Contact Registration
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                Complete your contact information to get started
                            </p>
                        </div>

                        {auth?.user && (
                            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/20 dark:to-indigo-400/20 border border-blue-200/50 dark:border-blue-400/30 rounded-xl p-6 backdrop-blur-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-blue-900 dark:text-blue-100 font-medium">
                                            Are you a member of the <span className="font-bold text-blue-700 dark:text-blue-300">{auth.user.name}</span>?
                                        </p>
                                        <p className="text-blue-700 dark:text-blue-200 text-sm">
                                            Please complete your contact information below to continue.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showSuccess && (
                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20 border border-green-200/50 dark:border-green-400/30 rounded-xl p-6 backdrop-blur-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-green-900 dark:text-green-100 font-medium">
                                            Registration Successful!
                                        </p>
                                        <p className="text-green-700 dark:text-green-200 text-sm">
                                            Your contact information has been submitted successfully. We will review your details shortly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {flash.message && (
                            <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                                <AlertDescription>
                                    {flash.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {flash.error && (
                            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
                                <AlertDescription>
                                    {flash.error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Picture</h3>
                                </div>
                                <div className="flex items-center gap-6">
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img 
                                                src={previewUrl} 
                                                alt="ID Preview" 
                                                className="w-32 h-32 object-cover rounded-2xl ring-4 ring-white dark:ring-gray-700 shadow-lg"
                                            />
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl ring-4 ring-white dark:ring-gray-700 shadow-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                            <div className="text-center">
                                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">No Image</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-3">
                                        <Label htmlFor="id_picture" className="text-gray-700 dark:text-gray-300 font-medium">Upload Photo</Label>
                                        <div className="relative">
                                            <Input
                                                id="id_picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/20 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 file:cursor-pointer h-11"
                                            />
                                        </div>
                                        {errors.id_picture && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.id_picture}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-300 font-medium">First Name</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                            placeholder="Enter first name"
                                        />
                                        {errors.first_name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="middle_name" className="text-gray-700 dark:text-gray-300 font-medium">Middle Name</Label>
                                        <Input
                                            id="middle_name"
                                            value={data.middle_name}
                                            onChange={e => setData('middle_name', e.target.value)}
                                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                            placeholder="Enter middle name"
                                        />
                                        {errors.middle_name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.middle_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-300 font-medium">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                            placeholder="Enter last name"
                                        />
                                        {errors.last_name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300 font-medium">Gender</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(value: 'male' | 'female' | 'other') => setData('gender', value)}
                                    >
                                        <SelectTrigger id="gender" className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Family Information</h3>
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

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
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
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Social Media</h3>
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

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Information</h3>
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

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ID Numbers</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addIdNumber}
                                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add ID Number
                                    </Button>
                                </div>
                                
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
                                                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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

                            <div className="flex justify-end pt-8 space-x-4">
                                {showSuccess && (
                                    <Button 
                                        type="button"
                                        onClick={() => {
                                            setShowSuccess(false);
                                            // Reset form data
                                            setData({
                                                client_identifier: client_identifier || urlClientIdentifier,
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
                                                id_picture: null as File | null,
                                                id_numbers: [] as IdNumber[],
                                            });
                                            setPreviewUrl(null);
                                        }}
                                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Register Another</span>
                                        </div>
                                    </Button>
                                )}
                                <Button 
                                    type="submit" 
                                    disabled={processing || showSuccess}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {processing ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Submitting...</span>
                                        </div>
                                    ) : showSuccess ? (
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Submitted Successfully</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Submit Registration</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 