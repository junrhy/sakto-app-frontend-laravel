import { User, Project } from '@/types/index';
import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import VariantManager from '@/Components/VariantManager';
import ImageUploader from '@/Components/ImageUploader';

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
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
    client_identifier: string;
    currency: {
        symbol: string;
        code: string;
    };
}

export default function Create({ auth, client_identifier, currency }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        category: '',
        type: '',
        sku: '',
        stock_quantity: '',
        weight: '',
        dimensions: '',
        status: 'draft',
        tags: [] as string[],
        file: null as File | null,
        images: [] as Array<{
            id?: number;
            image_url: string;
            alt_text?: string;
            is_primary: boolean;
            sort_order: number;
            file?: File;
        }>,
        variants: [] as any[],
        // Supplier related fields
        supplier_name: '',
        supplier_email: '',
        supplier_phone: '',
        supplier_address: '',
        supplier_website: '',
        supplier_contact_person: '',
        // Purchase related fields
        purchase_price: '',
        purchase_currency: currency.code,
        purchase_date: '',
        purchase_order_number: '',
        purchase_notes: '',
        reorder_point: '',
        reorder_quantity: '',
        lead_time_days: '',
        payment_terms: '',
    });

    const [newTag, setNewTag] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    // Define required fields
    const requiredFields: Record<string, string> = {
        name: 'Product name is required',
        description: 'Product description is required',
        price: 'Product price is required',
        category: 'Product category is required',
        type: 'Product type is required',
    };

    // Validation functions
    const validateField = (fieldName: string, value: any): string => {
        // Required field validation
        if (requiredFields[fieldName as keyof typeof requiredFields] && !value) {
            return requiredFields[fieldName as keyof typeof requiredFields];
        }

        // Specific field validations
        switch (fieldName) {
            case 'name':
                if (value && value.length < 3) {
                    return 'Product name must be at least 3 characters long';
                }
                if (value && value.length > 255) {
                    return 'Product name must be less than 255 characters';
                }
                break;
            case 'description':
                if (value && value.length < 10) {
                    return 'Product description must be at least 10 characters long';
                }
                if (value && value.length > 2000) {
                    return 'Product description must be less than 2000 characters';
                }
                break;
            case 'price':
                if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
                    return 'Price must be a valid positive number';
                }
                break;
            case 'category':
                if (value && value.length < 2) {
                    return 'Category must be at least 2 characters long';
                }
                break;
            case 'sku':
                if (value && value.length < 3) {
                    return 'SKU must be at least 3 characters long';
                }
                break;
            case 'stock_quantity':
                if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
                    return 'Stock quantity must be a valid positive number';
                }
                break;
            case 'weight':
                if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
                    return 'Weight must be a valid positive number';
                }
                break;
            case 'supplier_email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Please enter a valid email address';
                }
                break;
            case 'supplier_website':
                if (value && !/^https?:\/\/.+/.test(value)) {
                    return 'Please enter a valid URL starting with http:// or https://';
                }
                break;
            case 'purchase_price':
                if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
                    return 'Purchase price must be a valid positive number';
                }
                break;
        }

        return '';
    };

    // Handle field changes with validation
    const handleFieldChange = (fieldName: keyof typeof data, value: any) => {
        setData(fieldName, value);
        
        // Mark field as touched
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        
        // Validate field
        const error = validateField(fieldName, value);
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        // Validate all required fields
        Object.keys(requiredFields).forEach(fieldName => {
            const fieldKey = fieldName as keyof typeof data;
            const error = validateField(fieldName, data[fieldKey]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        // Validate conditional required fields based on product type
        if (data.type === 'physical') {
            if (!data.stock_quantity) {
                newErrors.stock_quantity = 'Stock quantity is required for physical products';
                isValid = false;
            }
        }

        if (data.type === 'digital' && !data.file && data.images.length === 0) {
            newErrors.file = 'Product file or image is required for digital products';
            isValid = false;
        }

        setValidationErrors(newErrors);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Mark all fields as touched
        const allFields = Object.keys(data);
        setTouchedFields(prev => {
            const newTouched = { ...prev };
            allFields.forEach(field => {
                newTouched[field] = true;
            });
            return newTouched;
        });

        // Validate form
        if (!validateForm()) {
            return;
        }

        post(route('products.store'));
    };

    // Get field error (frontend validation takes precedence)
    const getFieldError = (fieldName: string): string => {
        return validationErrors[fieldName] || (errors as any)[fieldName] || '';
    };

    // Check if field is invalid
    const isFieldInvalid = (fieldName: string): boolean => {
        return !!(validationErrors[fieldName] || (errors as any)[fieldName]);
    };

    // Check if field should show error
    const shouldShowError = (fieldName: string): boolean => {
        return touchedFields[fieldName] && isFieldInvalid(fieldName);
    };

    const handleVariantsChange = (variants: any[]) => {
        setData('variants', variants);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
            // Clear file validation error when file is selected
            setValidationErrors(prev => ({ ...prev, file: '' }));
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            if (!data.tags.includes(newTag.trim())) {
                setData('tags', [...data.tags, newTag.trim()]);
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    const isDigitalProduct = data.type === 'digital';

    // Check if form is valid for submission
    const isFormValid = () => {
        return Object.keys(requiredFields).every(field => {
            const fieldKey = field as keyof typeof data;
            return data[fieldKey] && !validationErrors[field];
        });
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Product</h2>}
        >
            <Head title="Create Product" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Product</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <TabsTrigger 
                                            value="basic"
                                            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            Basic Info
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="details"
                                            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            Product Details
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="media"
                                            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            Media & Tags
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="supplier"
                                            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            Supplier Info
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="purchase"
                                            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            Purchase Info
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Basic Information Tab */}
                                    <TabsContent value="basic" className="space-y-6 mt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="name" value="Name" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    className={`mt-1 block w-full ${shouldShowError('name') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.name}
                                                    onChange={e => handleFieldChange('name', e.target.value)}
                                                    onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                                                    required
                                                />
                                                {shouldShowError('name') && (
                                                    <InputError message={getFieldError('name')} className="mt-2" />
                                                )}
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="sku" value="SKU" />
                                                <Input
                                                    id="sku"
                                                    type="text"
                                                    className={`mt-1 block w-full ${shouldShowError('sku') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.sku}
                                                    onChange={e => handleFieldChange('sku', e.target.value)}
                                                    onBlur={() => setTouchedFields(prev => ({ ...prev, sku: true }))}
                                                    placeholder="Stock Keeping Unit"
                                                />
                                                {shouldShowError('sku') && (
                                                    <InputError message={getFieldError('sku')} className="mt-2" />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="description" value="Description" />
                                            <Textarea
                                                id="description"
                                                className={`mt-1 block w-full ${shouldShowError('description') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                value={data.description}
                                                onChange={e => handleFieldChange('description', e.target.value)}
                                                onBlur={() => setTouchedFields(prev => ({ ...prev, description: true }))}
                                                required
                                            />
                                            {shouldShowError('description') && (
                                                <InputError message={getFieldError('description')} className="mt-2" />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <InputLabel htmlFor="price" value="Price" />
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                        {currency.symbol}
                                                    </span>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        step="0.01"
                                                        className={`mt-1 block w-full pl-8 ${shouldShowError('price') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                        value={data.price}
                                                        onChange={e => handleFieldChange('price', e.target.value)}
                                                        onBlur={() => setTouchedFields(prev => ({ ...prev, price: true }))}
                                                        required
                                                    />
                                                </div>
                                                {shouldShowError('price') && (
                                                    <InputError message={getFieldError('price')} className="mt-2" />
                                                )}
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="category" value="Category" />
                                                <Input
                                                    id="category"
                                                    type="text"
                                                    className={`mt-1 block w-full ${shouldShowError('category') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.category}
                                                    onChange={e => handleFieldChange('category', e.target.value)}
                                                    onBlur={() => setTouchedFields(prev => ({ ...prev, category: true }))}
                                                    required
                                                />
                                                {shouldShowError('category') && (
                                                    <InputError message={getFieldError('category')} className="mt-2" />
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="type">Type</Label>
                                                <Select
                                                    value={data.type}
                                                    onValueChange={(value) => handleFieldChange('type', value)}
                                                >
                                                    <SelectTrigger className={shouldShowError('type') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="physical">Physical</SelectItem>
                                                        <SelectItem value="digital">Digital</SelectItem>
                                                        <SelectItem value="service">Service</SelectItem>
                                                        <SelectItem value="subscription">Subscription</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {shouldShowError('type') && (
                                                    <InputError message={getFieldError('type')} className="mt-2" />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.status} className="mt-2" />
                                        </div>
                                    </TabsContent>

                                    {/* Product Details Tab */}
                                    <TabsContent value="details" className="space-y-6 mt-6">
                                        {!data.type ? (
                                            <div className="text-center py-8">
                                                <div className="text-gray-500 dark:text-gray-400 mb-4">
                                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">Select a product type first</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Choose a product type in the Basic Info tab to see relevant fields here.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Physical product fields */}
                                                {data.type === 'physical' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div>
                                                            <InputLabel htmlFor="stock_quantity" value="Stock Quantity" />
                                                            <Input
                                                                id="stock_quantity"
                                                                type="number"
                                                                min="0"
                                                                className={`mt-1 block w-full ${shouldShowError('stock_quantity') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                                value={data.stock_quantity}
                                                                onChange={e => handleFieldChange('stock_quantity', e.target.value)}
                                                                onBlur={() => setTouchedFields(prev => ({ ...prev, stock_quantity: true }))}
                                                            />
                                                            {shouldShowError('stock_quantity') && (
                                                                <InputError message={getFieldError('stock_quantity')} className="mt-2" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <InputLabel htmlFor="weight" value="Weight (kg)" />
                                                            <Input
                                                                id="weight"
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                className={`mt-1 block w-full ${shouldShowError('weight') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                                value={data.weight}
                                                                onChange={e => handleFieldChange('weight', e.target.value)}
                                                                onBlur={() => setTouchedFields(prev => ({ ...prev, weight: true }))}
                                                            />
                                                            {shouldShowError('weight') && (
                                                                <InputError message={getFieldError('weight')} className="mt-2" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <InputLabel htmlFor="dimensions" value="Dimensions" />
                                                            <Input
                                                                id="dimensions"
                                                                type="text"
                                                                className="mt-1 block w-full"
                                                                value={data.dimensions}
                                                                onChange={e => setData('dimensions', e.target.value)}
                                                                placeholder="L x W x H cm"
                                                            />
                                                            <InputError message={errors.dimensions} className="mt-2" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Product Variants */}
                                                {data.type === 'physical' && (
                                                    <VariantManager
                                                        productId={0} // Will be set after product creation
                                                        productType={data.type}
                                                        currency={currency}
                                                        initialVariants={data.variants}
                                                        onVariantsChange={handleVariantsChange}
                                                    />
                                                )}

                                                {/* Digital product fields */}
                                                {isDigitalProduct && (
                                                    <div>
                                                        <Label htmlFor="file">Product File</Label>
                                                        <Input
                                                            id="file"
                                                            type="file"
                                                            className={`mt-1 block w-full ${shouldShowError('file') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                            onChange={handleFileChange}
                                                            accept=".pdf,.doc,.docx,.txt,.zip,.rar,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Max file size: 100MB. Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR, MP4, MP3, JPG, PNG, GIF
                                                        </p>
                                                        {shouldShowError('file') && (
                                                            <InputError message={getFieldError('file')} className="mt-2" />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Service product fields */}
                                                {data.type === 'service' && (
                                                    <div className="text-center py-8">
                                                        <div className="text-gray-500 dark:text-gray-400 mb-4">
                                                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-300 mb-2">Service Product</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Service products don't require additional physical specifications.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Subscription product fields */}
                                                {data.type === 'subscription' && (
                                                    <div className="text-center py-8">
                                                        <div className="text-gray-500 dark:text-gray-400 mb-4">
                                                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-300 mb-2">Subscription Product</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Subscription products will have additional configuration options in the future.
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </TabsContent>

                                    {/* Media & Tags Tab */}
                                    <TabsContent value="media" className="space-y-6 mt-6">
                                        <ImageUploader
                                            images={data.images}
                                            onImagesChange={(images) => setData('images', images)}
                                            maxImages={10}
                                            maxFileSize={2}
                                        />

                                        <div>
                                            <Label htmlFor="tags">Tags</Label>
                                            <Input
                                                id="tags"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={newTag}
                                                onChange={e => setNewTag(e.target.value)}
                                                onKeyDown={addTag}
                                                placeholder="Press Enter to add tags"
                                            />
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {data.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="cursor-pointer"
                                                        onClick={() => removeTag(tag)}
                                                    >
                                                        {tag} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                            <InputError message={errors.tags} className="mt-2" />
                                        </div>
                                    </TabsContent>

                                    {/* Supplier Information Tab */}
                                    <TabsContent value="supplier" className="space-y-6 mt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="supplier_name" value="Supplier Name" />
                                                <Input
                                                    id="supplier_name"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.supplier_name}
                                                    onChange={e => setData('supplier_name', e.target.value)}
                                                    placeholder="Enter supplier name"
                                                />
                                                <InputError message={errors.supplier_name} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="supplier_email" value="Supplier Email" />
                                                <Input
                                                    id="supplier_email"
                                                    type="email"
                                                    className={`mt-1 block w-full ${shouldShowError('supplier_email') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.supplier_email}
                                                    onChange={e => handleFieldChange('supplier_email', e.target.value)}
                                                    onBlur={() => setTouchedFields(prev => ({ ...prev, supplier_email: true }))}
                                                    placeholder="supplier@example.com"
                                                />
                                                {shouldShowError('supplier_email') && (
                                                    <InputError message={getFieldError('supplier_email')} className="mt-2" />
                                                )}
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="supplier_phone" value="Supplier Phone" />
                                                <Input
                                                    id="supplier_phone"
                                                    type="tel"
                                                    className="mt-1 block w-full"
                                                    value={data.supplier_phone}
                                                    onChange={e => setData('supplier_phone', e.target.value)}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                                <InputError message={errors.supplier_phone} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="supplier_website" value="Supplier Website" />
                                                <Input
                                                    id="supplier_website"
                                                    type="url"
                                                    className={`mt-1 block w-full ${shouldShowError('supplier_website') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.supplier_website}
                                                    onChange={e => handleFieldChange('supplier_website', e.target.value)}
                                                    onBlur={() => setTouchedFields(prev => ({ ...prev, supplier_website: true }))}
                                                    placeholder="https://www.supplier.com"
                                                />
                                                {shouldShowError('supplier_website') && (
                                                    <InputError message={getFieldError('supplier_website')} className="mt-2" />
                                                )}
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="supplier_contact_person" value="Contact Person" />
                                                <Input
                                                    id="supplier_contact_person"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.supplier_contact_person}
                                                    onChange={e => setData('supplier_contact_person', e.target.value)}
                                                    placeholder="John Doe"
                                                />
                                                <InputError message={errors.supplier_contact_person} className="mt-2" />
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="supplier_address" value="Supplier Address" />
                                            <Textarea
                                                id="supplier_address"
                                                className="mt-1 block w-full"
                                                value={data.supplier_address}
                                                onChange={e => setData('supplier_address', e.target.value)}
                                                placeholder="Enter complete supplier address"
                                                rows={3}
                                            />
                                            <InputError message={errors.supplier_address} className="mt-2" />
                                        </div>
                                    </TabsContent>

                                    {/* Purchase Information Tab */}
                                    <TabsContent value="purchase" className="space-y-6 mt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <InputLabel htmlFor="purchase_price" value="Purchase Price" />
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                        {currency.symbol}
                                                    </span>
                                                    <Input
                                                        id="purchase_price"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className={`mt-1 block w-full pl-8 ${shouldShowError('purchase_price') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                        value={data.purchase_price}
                                                        onChange={e => handleFieldChange('purchase_price', e.target.value)}
                                                        onBlur={() => setTouchedFields(prev => ({ ...prev, purchase_price: true }))}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {shouldShowError('purchase_price') && (
                                                    <InputError message={getFieldError('purchase_price')} className="mt-2" />
                                                )}
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="purchase_currency" value="Purchase Currency" />
                                                <Input
                                                    id="purchase_currency"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.purchase_currency}
                                                    onChange={e => setData('purchase_currency', e.target.value)}
                                                    placeholder="USD"
                                                />
                                                <InputError message={errors.purchase_currency} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="purchase_date" value="Purchase Date" />
                                                <Input
                                                    id="purchase_date"
                                                    type="date"
                                                    className="mt-1 block w-full"
                                                    value={data.purchase_date}
                                                    onChange={e => setData('purchase_date', e.target.value)}
                                                />
                                                <InputError message={errors.purchase_date} className="mt-2" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="purchase_order_number" value="Purchase Order Number" />
                                                <Input
                                                    id="purchase_order_number"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.purchase_order_number}
                                                    onChange={e => setData('purchase_order_number', e.target.value)}
                                                    placeholder="PO-2024-001"
                                                />
                                                <InputError message={errors.purchase_order_number} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="payment_terms" value="Payment Terms" />
                                                <Input
                                                    id="payment_terms"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.payment_terms}
                                                    onChange={e => setData('payment_terms', e.target.value)}
                                                    placeholder="Net 30"
                                                />
                                                <InputError message={errors.payment_terms} className="mt-2" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <InputLabel htmlFor="reorder_point" value="Reorder Point" />
                                                <Input
                                                    id="reorder_point"
                                                    type="number"
                                                    min="0"
                                                    className="mt-1 block w-full"
                                                    value={data.reorder_point}
                                                    onChange={e => setData('reorder_point', e.target.value)}
                                                    placeholder="10"
                                                />
                                                <InputError message={errors.reorder_point} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="reorder_quantity" value="Reorder Quantity" />
                                                <Input
                                                    id="reorder_quantity"
                                                    type="number"
                                                    min="0"
                                                    className="mt-1 block w-full"
                                                    value={data.reorder_quantity}
                                                    onChange={e => setData('reorder_quantity', e.target.value)}
                                                    placeholder="50"
                                                />
                                                <InputError message={errors.reorder_quantity} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="lead_time_days" value="Lead Time (Days)" />
                                                <Input
                                                    id="lead_time_days"
                                                    type="number"
                                                    min="0"
                                                    className="mt-1 block w-full"
                                                    value={data.lead_time_days}
                                                    onChange={e => setData('lead_time_days', e.target.value)}
                                                    placeholder="7"
                                                />
                                                <InputError message={errors.lead_time_days} className="mt-2" />
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="purchase_notes" value="Purchase Notes" />
                                            <Textarea
                                                id="purchase_notes"
                                                className="mt-1 block w-full"
                                                value={data.purchase_notes}
                                                onChange={e => setData('purchase_notes', e.target.value)}
                                                placeholder="Additional notes about the purchase..."
                                                rows={3}
                                            />
                                            <InputError message={errors.purchase_notes} className="mt-2" />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end mt-8 pt-6 border-t">
                                    <PrimaryButton disabled={processing || !isFormValid()}>
                                        Create Product
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