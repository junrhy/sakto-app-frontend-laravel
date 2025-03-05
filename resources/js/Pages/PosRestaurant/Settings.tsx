import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { PlusCircle, X } from 'lucide-react';

interface SocialLink {
    platform: string;
    url: string;
}

interface OpeningHour {
    day: string;
    hours: string;
    is_open: boolean;
}

interface Settings {
    restaurant_info: {
        restaurant_name: string;
        address: string;
        contact_number: string;
        website: string;
        banner_url: string;
        logo_url: string;
    };
    social_links: Record<string, string>;
    opening_hours: Record<string, string>;
    auth: {
        username: string;
        password: string;
    };
}

interface FormData extends Omit<Settings, 'social_links' | 'opening_hours'> {
    social_links: SocialLink[];
    opening_hours: OpeningHour[];
}

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    settings: Settings;
}

export default function RestaurantSettings({ auth, settings }: Props) {
    // Transform the old social_links object into an array format
    const initialSocialLinks = Object.entries(settings.social_links).map(([platform, url]) => ({
        platform,
        url: url || ''
    }));

    // Transform the old opening_hours object into an array format
    const initialOpeningHours = Object.entries(settings.opening_hours).map(([day, hours]) => ({
        day,
        hours,
        is_open: true
    }));

    const [formData, setFormData] = useState<FormData>({
        restaurant_info: settings.restaurant_info,
        social_links: initialSocialLinks,
        opening_hours: initialOpeningHours,
        auth: settings.auth
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFormData = (path: string, value: any) => {
        const keys = path.split('.');
        setFormData(prev => {
            const newData = { ...prev };
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            social_links: [...prev.social_links, { platform: '', url: '' }]
        }));
    };

    const removeSocialLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            social_links: prev.social_links.filter((_, i) => i !== index)
        }));
    };

    const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
        setFormData(prev => ({
            ...prev,
            social_links: prev.social_links.map((link, i) => 
                i === index ? { ...link, [field]: value } : link
            )
        }));
    };

    const addOpeningHour = () => {
        setFormData(prev => ({
            ...prev,
            opening_hours: [...prev.opening_hours, { day: '', hours: '', is_open: true }]
        }));
    };

    const removeOpeningHour = (index: number) => {
        setFormData(prev => ({
            ...prev,
            opening_hours: prev.opening_hours.filter((_, i) => i !== index)
        }));
    };

    const updateOpeningHour = (index: number, field: keyof OpeningHour, value: any) => {
        setFormData(prev => ({
            ...prev,
            opening_hours: prev.opening_hours.map((hour, i) => 
                i === index ? { ...hour, [field]: value } : hour
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Transform the arrays back to objects for API compatibility
            const transformedData = {
                ...formData,
                social_links: formData.social_links.reduce((acc, { platform, url }) => {
                    if (platform) acc[platform] = url;
                    return acc;
                }, {} as Record<string, string>),
                opening_hours: formData.opening_hours.reduce((acc, { day, hours }) => {
                    if (day) acc[day.toLowerCase()] = hours;
                    return acc;
                }, {} as Record<string, string>)
            };

            await axios.post('/api/pos-restaurant/settings', transformedData);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
            console.error('Failed to save settings:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl leading-tight">Restaurant Settings</h2>}
        >
            <Head title="Restaurant Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Restaurant Settings</CardTitle>
                            <CardDescription>
                                Configure your restaurant information, operating hours, and more.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Tabs defaultValue="restaurant" className="space-y-4">
                                    <TabsList>
                                        <TabsTrigger value="restaurant">Restaurant Info</TabsTrigger>
                                        <TabsTrigger value="media">Media</TabsTrigger>
                                        <TabsTrigger value="social">Social Links</TabsTrigger>
                                        <TabsTrigger value="hours">Operating Hours</TabsTrigger>
                                        <TabsTrigger value="auth">Authentication</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="restaurant">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Restaurant Name</Label>
                                                <Input
                                                    value={formData.restaurant_info.restaurant_name}
                                                    onChange={(e) => updateFormData('restaurant_info.restaurant_name', e.target.value)}
                                                    placeholder="Enter restaurant name"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Contact Number</Label>
                                                <Input
                                                    value={formData.restaurant_info.contact_number}
                                                    onChange={(e) => updateFormData('restaurant_info.contact_number', e.target.value)}
                                                    placeholder="Enter contact number"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Website</Label>
                                                <Input
                                                    value={formData.restaurant_info.website}
                                                    onChange={(e) => updateFormData('restaurant_info.website', e.target.value)}
                                                    placeholder="Enter website URL"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Address</Label>
                                                <Input
                                                    value={formData.restaurant_info.address}
                                                    onChange={(e) => updateFormData('restaurant_info.address', e.target.value)}
                                                    placeholder="Enter restaurant address"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="media">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Banner Image URL</Label>
                                                <Input
                                                    type="url"
                                                    value={formData.restaurant_info.banner_url}
                                                    onChange={(e) => updateFormData('restaurant_info.banner_url', e.target.value)}
                                                    placeholder="Enter banner image URL"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Logo URL</Label>
                                                <Input
                                                    type="url"
                                                    value={formData.restaurant_info.logo_url}
                                                    onChange={(e) => updateFormData('restaurant_info.logo_url', e.target.value)}
                                                    placeholder="Enter logo image URL"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="social">
                                        <div className="space-y-4">
                                            {formData.social_links.map((link, index) => (
                                                <div key={index} className="flex gap-4 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Label>Platform</Label>
                                                        <Input
                                                            value={link.platform}
                                                            onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                                                            placeholder="e.g. Facebook, Instagram, Twitter"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Label>URL</Label>
                                                        <Input
                                                            value={link.url}
                                                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                                                            placeholder="Enter social media URL"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="mt-8"
                                                        onClick={() => removeSocialLink(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addSocialLink}
                                                className="w-full"
                                            >
                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                Add Social Link
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="hours">
                                        <div className="space-y-4">
                                            {formData.opening_hours.map((hour, index) => (
                                                <div key={index} className="flex gap-4 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Label>Day</Label>
                                                        <Input
                                                            value={hour.day}
                                                            onChange={(e) => updateOpeningHour(index, 'day', e.target.value)}
                                                            placeholder="e.g. Monday, Tuesday"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Label>Hours</Label>
                                                        <Input
                                                            value={hour.hours}
                                                            onChange={(e) => updateOpeningHour(index, 'hours', e.target.value)}
                                                            placeholder="e.g. 9:00 AM - 10:00 PM"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="mt-8"
                                                        onClick={() => removeOpeningHour(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addOpeningHour}
                                                className="w-full"
                                            >
                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                Add Operating Hours
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="auth">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Username</Label>
                                                <Input
                                                    value={formData.auth.username}
                                                    onChange={(e) => updateFormData('auth.username', e.target.value)}
                                                    placeholder="Enter username"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Password</Label>
                                                <Input
                                                    type="password"
                                                    onChange={(e) => updateFormData('auth.password', e.target.value)}
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Settings'}
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