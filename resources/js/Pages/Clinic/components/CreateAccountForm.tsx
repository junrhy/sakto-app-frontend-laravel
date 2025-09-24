import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

interface CreateAccountFormProps {
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export function CreateAccountForm({
    onSubmit,
    onCancel,
}: CreateAccountFormProps) {
    const [formData, setFormData] = useState({
        account_type: '',
        account_name: '',
        description: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        credit_limit: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.account_type) {
            newErrors.account_type = 'Account type is required';
        }

        if (!formData.account_name.trim()) {
            newErrors.account_name = 'Account name is required';
        }

        if (
            formData.contact_email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)
        ) {
            newErrors.contact_email = 'Please enter a valid email address';
        }

        if (formData.credit_limit < 0) {
            newErrors.credit_limit = 'Credit limit cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted with data:', formData);

        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        console.log('Form validation passed, submitting...');
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
            // Error handling is done in parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Account Type */}
                <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type *</Label>
                    <Select
                        value={formData.account_type}
                        onValueChange={(value) =>
                            handleInputChange('account_type', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="group">
                                Group (Family/Personal)
                            </SelectItem>
                            <SelectItem value="company">
                                Company/Corporate
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.account_type && (
                        <p className="text-sm text-red-600">
                            {errors.account_type}
                        </p>
                    )}
                </div>

                {/* Account Name */}
                <div className="space-y-2">
                    <Label htmlFor="account_name">Account Name *</Label>
                    <Input
                        id="account_name"
                        type="text"
                        value={formData.account_name}
                        onChange={(e) =>
                            handleInputChange('account_name', e.target.value)
                        }
                        placeholder={
                            formData.account_type === 'company'
                                ? 'Company Name'
                                : 'Family/Group Name'
                        }
                    />
                    {errors.account_name && (
                        <p className="text-sm text-red-600">
                            {errors.account_name}
                        </p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        handleInputChange('description', e.target.value)
                    }
                    placeholder="Optional description or notes about this account"
                    rows={3}
                />
            </div>

            <Card>
                <CardContent className="pt-6">
                    <h4 className="mb-4 text-sm font-medium">
                        Contact Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Contact Person */}
                        <div className="space-y-2">
                            <Label htmlFor="contact_person">
                                Contact Person
                            </Label>
                            <Input
                                id="contact_person"
                                type="text"
                                value={formData.contact_person}
                                onChange={(e) =>
                                    handleInputChange(
                                        'contact_person',
                                        e.target.value,
                                    )
                                }
                                placeholder="Primary contact name"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">Contact Phone</Label>
                            <Input
                                id="contact_phone"
                                type="tel"
                                value={formData.contact_phone}
                                onChange={(e) =>
                                    handleInputChange(
                                        'contact_phone',
                                        e.target.value,
                                    )
                                }
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Contact Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) =>
                                    handleInputChange(
                                        'contact_email',
                                        e.target.value,
                                    )
                                }
                                placeholder="contact@example.com"
                            />
                            {errors.contact_email && (
                                <p className="text-sm text-red-600">
                                    {errors.contact_email}
                                </p>
                            )}
                        </div>

                        {/* Credit Limit */}
                        <div className="space-y-2">
                            <Label htmlFor="credit_limit">Credit Limit</Label>
                            <Input
                                id="credit_limit"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.credit_limit}
                                onChange={(e) =>
                                    handleInputChange(
                                        'credit_limit',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                placeholder="0.00"
                            />
                            {errors.credit_limit && (
                                <p className="text-sm text-red-600">
                                    {errors.credit_limit}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) =>
                                handleInputChange('address', e.target.value)
                            }
                            placeholder="Full address"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                </Button>
            </div>
        </form>
    );
}
