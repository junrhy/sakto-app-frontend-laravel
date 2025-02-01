import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';

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
}

export default function SelfRegistration({ flash = {}, client_identifier }: Props) {
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const urlClientIdentifier = urlParams.get('client_identifier') || client_identifier || '';
    
    const { data, setData, post, processing, errors } = useForm({
        client_identifier: urlClientIdentifier,
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
        post(route('contacts.store-self'));
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
            <Head title="Contact Self Registration" />

            <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Contact Self Registration
                            </h1>
                            <a 
                                href="/"
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                Back to Home
                            </a>
                        </div>

                        {flash.message && (
                            <Alert className="mb-6">
                                <AlertDescription>
                                    {flash.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {flash.error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>
                                    {flash.error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="client_identifier">Client Identifier</Label>
                                <Input
                                    id="client_identifier"
                                    value={data.client_identifier}
                                    onChange={e => setData('client_identifier', e.target.value)}
                                    placeholder="Enter client identifier"
                                    readOnly={!!urlClientIdentifier}
                                    className={urlClientIdentifier ? "bg-gray-100 dark:bg-gray-700" : ""}
                                />
                                {errors.client_identifier && (
                                    <p className="text-sm text-red-600">{errors.client_identifier}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="id_picture">ID Picture</Label>
                                <div className="flex items-center gap-4">
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="ID Preview" 
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500 dark:text-gray-400">No Image</span>
                                        </div>
                                    )}
                                    <Input
                                        id="id_picture"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="flex-1"
                                    />
                                </div>
                                {errors.id_picture && (
                                    <p className="text-sm text-red-600">{errors.id_picture}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-red-600">{errors.first_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">Middle Name</Label>
                                    <Input
                                        id="middle_name"
                                        value={data.middle_name}
                                        onChange={e => setData('middle_name', e.target.value)}
                                    />
                                    {errors.middle_name && (
                                        <p className="text-sm text-red-600">{errors.middle_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-red-600">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={data.gender}
                                    onValueChange={(value: 'male' | 'female' | 'other') => setData('gender', value)}
                                >
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && (
                                    <p className="text-sm text-red-600">{errors.gender}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fathers_name">Father's Name</Label>
                                    <Input
                                        id="fathers_name"
                                        value={data.fathers_name}
                                        onChange={e => setData('fathers_name', e.target.value)}
                                        placeholder="Full name of father"
                                    />
                                    {errors.fathers_name && (
                                        <p className="text-sm text-red-600">{errors.fathers_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mothers_maiden_name">Mother's Maiden Name</Label>
                                    <Input
                                        id="mothers_maiden_name"
                                        value={data.mothers_maiden_name}
                                        onChange={e => setData('mothers_maiden_name', e.target.value)}
                                        placeholder="Mother's full name before marriage"
                                    />
                                    {errors.mothers_maiden_name && (
                                        <p className="text-sm text-red-600">{errors.mothers_maiden_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="call_number">Call Number</Label>
                                    <Input
                                        id="call_number"
                                        value={data.call_number}
                                        onChange={e => setData('call_number', e.target.value)}
                                        placeholder="e.g. +1234567890"
                                    />
                                    {errors.call_number && (
                                        <p className="text-sm text-red-600">{errors.call_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sms_number">SMS Number</Label>
                                    <Input
                                        id="sms_number"
                                        value={data.sms_number}
                                        onChange={e => setData('sms_number', e.target.value)}
                                        placeholder="e.g. +1234567890"
                                    />
                                    {errors.sms_number && (
                                        <p className="text-sm text-red-600">{errors.sms_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <Input
                                        id="whatsapp"
                                        value={data.whatsapp}
                                        onChange={e => setData('whatsapp', e.target.value)}
                                        placeholder="e.g. +1234567890"
                                    />
                                    {errors.whatsapp && (
                                        <p className="text-sm text-red-600">{errors.whatsapp}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook URL</Label>
                                    <Input
                                        id="facebook"
                                        value={data.facebook}
                                        onChange={e => setData('facebook', e.target.value)}
                                        placeholder="e.g. https://facebook.com/username"
                                    />
                                    {errors.facebook && (
                                        <p className="text-sm text-red-600">{errors.facebook}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram URL</Label>
                                    <Input
                                        id="instagram"
                                        value={data.instagram}
                                        onChange={e => setData('instagram', e.target.value)}
                                        placeholder="e.g. https://instagram.com/username"
                                    />
                                    {errors.instagram && (
                                        <p className="text-sm text-red-600">{errors.instagram}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="twitter">Twitter/X URL</Label>
                                    <Input
                                        id="twitter"
                                        value={data.twitter}
                                        onChange={e => setData('twitter', e.target.value)}
                                        placeholder="e.g. https://twitter.com/username"
                                    />
                                    {errors.twitter && (
                                        <p className="text-sm text-red-600">{errors.twitter}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                                    <Input
                                        id="linkedin"
                                        value={data.linkedin}
                                        onChange={e => setData('linkedin', e.target.value)}
                                        placeholder="e.g. https://linkedin.com/in/username"
                                    />
                                    {errors.linkedin && (
                                        <p className="text-sm text-red-600">{errors.linkedin}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>ID Numbers</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addIdNumber}
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add ID Number
                                    </Button>
                                </div>
                                
                                {data.id_numbers.map((idNumber, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="grid grid-cols-2 gap-4 flex-1">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`id_type_${index}`}>ID Type</Label>
                                                    <Select
                                                        value={idNumber.type}
                                                        onValueChange={(value) => updateIdNumber(index, 'type', value)}
                                                    >
                                                        <SelectTrigger>
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
                                                    <Label htmlFor={`id_number_${index}`}>ID Number</Label>
                                                    <Input
                                                        id={`id_number_${index}`}
                                                        value={idNumber.number}
                                                        onChange={(e) => updateIdNumber(index, 'number', e.target.value)}
                                                        placeholder="Enter ID number"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeIdNumber(index)}
                                                className="ml-2"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`id_notes_${index}`}>Notes</Label>
                                            <Input
                                                id={`id_notes_${index}`}
                                                value={idNumber.notes}
                                                onChange={(e) => updateIdNumber(index, 'notes', e.target.value)}
                                                placeholder="Additional notes about this ID (optional)"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {errors.id_numbers && (
                                    <p className="text-sm text-red-600">{errors.id_numbers}</p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Submit Registration
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 