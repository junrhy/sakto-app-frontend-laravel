import ImageUploader from '@/Components/ImageUploader';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Badge } from '@/Components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import VariantManager from '@/Components/VariantManager';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

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

interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    contact_person: string;
    address: string;
}

interface PurchaseRecord {
    id: string;
    supplier_id: string;
    price: string;
    currency: string;
    date: string;
    order_number: string;
    notes: string;
    reorder_point: string;
    reorder_quantity: string;
    lead_time_days: string;
    payment_terms: string;
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
        // Multiple suppliers and purchase records
        suppliers: [] as Supplier[],
        purchase_records: [] as PurchaseRecord[],
    });

    const [newTag, setNewTag] = useState('');
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
        {},
    );

    // Define required fields
    const requiredFields: Record<string, string> = {
        name: 'Product name is required',
        description: 'Product description is required',
        price: 'Product price is required',
        category: 'Product category is required',
        type: 'Product type is required',
    };

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Add new supplier
    const addSupplier = () => {
        const newSupplier: Supplier = {
            id: generateId(),
            name: '',
            email: '',
            phone: '',
            website: '',
            contact_person: '',
            address: '',
        };
        setData('suppliers', [...data.suppliers, newSupplier]);
    };

    // Remove supplier
    const removeSupplier = (supplierId: string) => {
        setData(
            'suppliers',
            data.suppliers.filter((s) => s.id !== supplierId),
        );
        // Also remove associated purchase records
        setData(
            'purchase_records',
            data.purchase_records.filter((p) => p.supplier_id !== supplierId),
        );
    };

    // Update supplier
    const updateSupplier = (
        supplierId: string,
        field: keyof Supplier,
        value: string,
    ) => {
        setData(
            'suppliers',
            data.suppliers.map((s) =>
                s.id === supplierId ? { ...s, [field]: value } : s,
            ),
        );
    };

    // Add new purchase record
    const addPurchaseRecord = () => {
        const newPurchaseRecord: PurchaseRecord = {
            id: generateId(),
            supplier_id: data.suppliers.length > 0 ? data.suppliers[0].id : '',
            price: '',
            currency: currency.code,
            date: '',
            order_number: '',
            notes: '',
            reorder_point: '',
            reorder_quantity: '',
            lead_time_days: '',
            payment_terms: '',
        };
        setData('purchase_records', [
            ...data.purchase_records,
            newPurchaseRecord,
        ]);
    };

    // Remove purchase record
    const removePurchaseRecord = (purchaseId: string) => {
        setData(
            'purchase_records',
            data.purchase_records.filter((p) => p.id !== purchaseId),
        );
    };

    // Update purchase record
    const updatePurchaseRecord = (
        purchaseId: string,
        field: keyof PurchaseRecord,
        value: string,
    ) => {
        setData(
            'purchase_records',
            data.purchase_records.map((p) =>
                p.id === purchaseId ? { ...p, [field]: value } : p,
            ),
        );
    };

    // Validation functions
    const validateField = (fieldName: string, value: any): string => {
        // Required field validation
        if (requiredFields[fieldName] && !value) {
            return requiredFields[fieldName];
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
                if (
                    value &&
                    (isNaN(parseFloat(value)) || parseFloat(value) < 0)
                ) {
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
                if (
                    value &&
                    (isNaN(parseFloat(value)) || parseFloat(value) < 0)
                ) {
                    return 'Weight must be a valid positive number';
                }
                break;
        }

        return '';
    };

    // Handle field changes with validation
    const handleFieldChange = (fieldName: keyof typeof data, value: any) => {
        setData(fieldName, value);

        // Mark field as touched
        setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

        // Validate field
        const error = validateField(fieldName, value);
        setValidationErrors((prev) => ({
            ...prev,
            [fieldName]: error,
        }));
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        // Validate all required fields
        Object.keys(requiredFields).forEach((fieldName) => {
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
                newErrors.stock_quantity =
                    'Stock quantity is required for physical products';
                isValid = false;
            }
        }

        if (data.type === 'digital' && !data.file && data.images.length === 0) {
            newErrors.file =
                'Product file or image is required for digital products';
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
        setTouchedFields((prev) => {
            const newTouched = { ...prev };
            allFields.forEach((field) => {
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
            setValidationErrors((prev) => ({ ...prev, file: '' }));
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
        setData(
            'tags',
            data.tags.filter((tag) => tag !== tagToRemove),
        );
    };

    const isDigitalProduct = data.type === 'digital';

    // Check if form is valid for submission
    const isFormValid = () => {
        return Object.keys(requiredFields).every((field) => {
            const fieldKey = field as keyof typeof data;
            return data[fieldKey] && !validationErrors[field];
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Product
                </h2>
            }
        >
            <Head title="Create Product" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Product</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-5 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
                                        <TabsTrigger
                                            value="basic"
                                            className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                        >
                                            Basic Info
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="details"
                                            className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                        >
                                            Product Details
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="media"
                                            className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                        >
                                            Media & Tags
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="supplier"
                                            className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                        >
                                            Suppliers
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="purchase"
                                            className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                        >
                                            Purchase Records
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Basic Information Tab */}
                                    <TabsContent
                                        value="basic"
                                        className="mt-6 space-y-6"
                                    >
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <InputLabel
                                                    htmlFor="name"
                                                    value="Name"
                                                />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    className={`mt-1 block w-full ${shouldShowError('name') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setTouchedFields(
                                                            (prev) => ({
                                                                ...prev,
                                                                name: true,
                                                            }),
                                                        )
                                                    }
                                                    required
                                                />
                                                {shouldShowError('name') && (
                                                    <InputError
                                                        message={getFieldError(
                                                            'name',
                                                        )}
                                                        className="mt-2"
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="sku"
                                                    value="SKU"
                                                />
                                                <Input
                                                    id="sku"
                                                    type="text"
                                                    className={`mt-1 block w-full ${shouldShowError('sku') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.sku}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            'sku',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setTouchedFields(
                                                            (prev) => ({
                                                                ...prev,
                                                                sku: true,
                                                            }),
                                                        )
                                                    }
                                                    placeholder="Stock Keeping Unit"
                                                />
                                                {shouldShowError('sku') && (
                                                    <InputError
                                                        message={getFieldError(
                                                            'sku',
                                                        )}
                                                        className="mt-2"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="description"
                                                value="Description"
                                            />
                                            <Textarea
                                                id="description"
                                                className={`mt-1 block w-full ${shouldShowError('description') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                value={data.description}
                                                onChange={(e) =>
                                                    handleFieldChange(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    setTouchedFields(
                                                        (prev) => ({
                                                            ...prev,
                                                            description: true,
                                                        }),
                                                    )
                                                }
                                                required
                                            />
                                            {shouldShowError('description') && (
                                                <InputError
                                                    message={getFieldError(
                                                        'description',
                                                    )}
                                                    className="mt-2"
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <div>
                                                <InputLabel
                                                    htmlFor="price"
                                                    value="Price"
                                                />
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                                                        {currency.symbol}
                                                    </span>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        step="0.01"
                                                        className={`mt-1 block w-full pl-8 ${shouldShowError('price') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                        value={data.price}
                                                        onChange={(e) =>
                                                            handleFieldChange(
                                                                'price',
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            setTouchedFields(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    price: true,
                                                                }),
                                                            )
                                                        }
                                                        required
                                                    />
                                                </div>
                                                {shouldShowError('price') && (
                                                    <InputError
                                                        message={getFieldError(
                                                            'price',
                                                        )}
                                                        className="mt-2"
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="category"
                                                    value="Category"
                                                />
                                                <Input
                                                    id="category"
                                                    type="text"
                                                    className={`mt-1 block w-full ${shouldShowError('category') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                    value={data.category}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            'category',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setTouchedFields(
                                                            (prev) => ({
                                                                ...prev,
                                                                category: true,
                                                            }),
                                                        )
                                                    }
                                                    required
                                                />
                                                {shouldShowError(
                                                    'category',
                                                ) && (
                                                    <InputError
                                                        message={getFieldError(
                                                            'category',
                                                        )}
                                                        className="mt-2"
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="type">
                                                    Type
                                                </Label>
                                                <Select
                                                    value={data.type}
                                                    onValueChange={(value) =>
                                                        handleFieldChange(
                                                            'type',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className={
                                                            shouldShowError(
                                                                'type',
                                                            )
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                : ''
                                                        }
                                                    >
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="physical">
                                                            Physical
                                                        </SelectItem>
                                                        <SelectItem value="digital">
                                                            Digital
                                                        </SelectItem>
                                                        <SelectItem value="service">
                                                            Service
                                                        </SelectItem>
                                                        <SelectItem value="subscription">
                                                            Subscription
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {shouldShowError('type') && (
                                                    <InputError
                                                        message={getFieldError(
                                                            'type',
                                                        )}
                                                        className="mt-2"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="status">
                                                Status
                                            </Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) =>
                                                    setData('status', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">
                                                        Draft
                                                    </SelectItem>
                                                    <SelectItem value="published">
                                                        Published
                                                    </SelectItem>
                                                    <SelectItem value="archived">
                                                        Archived
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        Inactive
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.status}
                                                className="mt-2"
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Product Details Tab */}
                                    <TabsContent
                                        value="details"
                                        className="mt-6 space-y-6"
                                    >
                                        {!data.type ? (
                                            <div className="py-8 text-center">
                                                <div className="mb-4 text-gray-500 dark:text-gray-400">
                                                    <svg
                                                        className="mx-auto h-12 w-12"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="mb-2 text-gray-600 dark:text-gray-300">
                                                    Select a product type first
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Choose a product type in the
                                                    Basic Info tab to see
                                                    relevant fields here.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Physical product fields */}
                                                {data.type === 'physical' && (
                                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                        <div>
                                                            <InputLabel
                                                                htmlFor="stock_quantity"
                                                                value="Stock Quantity"
                                                            />
                                                            <Input
                                                                id="stock_quantity"
                                                                type="number"
                                                                min="0"
                                                                className={`mt-1 block w-full ${shouldShowError('stock_quantity') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                                value={
                                                                    data.stock_quantity
                                                                }
                                                                onChange={(e) =>
                                                                    handleFieldChange(
                                                                        'stock_quantity',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    setTouchedFields(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            stock_quantity:
                                                                                true,
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                            {shouldShowError(
                                                                'stock_quantity',
                                                            ) && (
                                                                <InputError
                                                                    message={getFieldError(
                                                                        'stock_quantity',
                                                                    )}
                                                                    className="mt-2"
                                                                />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <InputLabel
                                                                htmlFor="weight"
                                                                value="Weight (kg)"
                                                            />
                                                            <Input
                                                                id="weight"
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                className={`mt-1 block w-full ${shouldShowError('weight') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                                value={
                                                                    data.weight
                                                                }
                                                                onChange={(e) =>
                                                                    handleFieldChange(
                                                                        'weight',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    setTouchedFields(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            weight: true,
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                            {shouldShowError(
                                                                'weight',
                                                            ) && (
                                                                <InputError
                                                                    message={getFieldError(
                                                                        'weight',
                                                                    )}
                                                                    className="mt-2"
                                                                />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <InputLabel
                                                                htmlFor="dimensions"
                                                                value="Dimensions"
                                                            />
                                                            <Input
                                                                id="dimensions"
                                                                type="text"
                                                                className="mt-1 block w-full"
                                                                value={
                                                                    data.dimensions
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'dimensions',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="L x W x H cm"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.dimensions
                                                                }
                                                                className="mt-2"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Product Variants */}
                                                {data.type === 'physical' && (
                                                    <VariantManager
                                                        productId={0} // Will be set after product creation
                                                        productType={data.type}
                                                        currency={currency}
                                                        initialVariants={
                                                            data.variants
                                                        }
                                                        onVariantsChange={
                                                            handleVariantsChange
                                                        }
                                                    />
                                                )}

                                                {/* Digital product fields */}
                                                {isDigitalProduct && (
                                                    <div>
                                                        <Label htmlFor="file">
                                                            Product File
                                                        </Label>
                                                        <Input
                                                            id="file"
                                                            type="file"
                                                            className={`mt-1 block w-full ${shouldShowError('file') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                            onChange={
                                                                handleFileChange
                                                            }
                                                            accept=".pdf,.doc,.docx,.txt,.zip,.rar,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                                                        />
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Max file size:
                                                            100MB. Supported
                                                            formats: PDF, DOC,
                                                            DOCX, TXT, ZIP, RAR,
                                                            MP4, MP3, JPG, PNG,
                                                            GIF
                                                        </p>
                                                        {shouldShowError(
                                                            'file',
                                                        ) && (
                                                            <InputError
                                                                message={getFieldError(
                                                                    'file',
                                                                )}
                                                                className="mt-2"
                                                            />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Service product fields */}
                                                {data.type === 'service' && (
                                                    <div className="py-8 text-center">
                                                        <div className="mb-4 text-gray-500 dark:text-gray-400">
                                                            <svg
                                                                className="mx-auto h-12 w-12"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="mb-2 text-gray-600 dark:text-gray-300">
                                                            Service Product
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Service products
                                                            don't require
                                                            additional physical
                                                            specifications.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Subscription product fields */}
                                                {data.type ===
                                                    'subscription' && (
                                                    <div className="py-8 text-center">
                                                        <div className="mb-4 text-gray-500 dark:text-gray-400">
                                                            <svg
                                                                className="mx-auto h-12 w-12"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <p className="mb-2 text-gray-600 dark:text-gray-300">
                                                            Subscription Product
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Subscription
                                                            products will have
                                                            additional
                                                            configuration
                                                            options in the
                                                            future.
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </TabsContent>

                                    {/* Media & Tags Tab */}
                                    <TabsContent
                                        value="media"
                                        className="mt-6 space-y-6"
                                    >
                                        <ImageUploader
                                            images={data.images}
                                            onImagesChange={(images) =>
                                                setData('images', images)
                                            }
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
                                                onChange={(e) =>
                                                    setNewTag(e.target.value)
                                                }
                                                onKeyDown={addTag}
                                                placeholder="Press Enter to add tags"
                                            />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {data.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            removeTag(tag)
                                                        }
                                                    >
                                                        {tag} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                            <InputError
                                                message={errors.tags}
                                                className="mt-2"
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Suppliers Tab */}
                                    <TabsContent
                                        value="supplier"
                                        className="mt-6 space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Suppliers
                                            </h3>
                                            <Button
                                                type="button"
                                                onClick={addSupplier}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Add Supplier
                                            </Button>
                                        </div>

                                        {data.suppliers.length === 0 ? (
                                            <div className="py-8 text-center">
                                                <div className="mb-4 text-gray-500 dark:text-gray-400">
                                                    <svg
                                                        className="mx-auto h-12 w-12"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="mb-2 text-gray-600 dark:text-gray-300">
                                                    No suppliers added yet
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Add suppliers to track
                                                    multiple sources for this
                                                    product.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {data.suppliers.map(
                                                    (supplier, index) => (
                                                        <Card
                                                            key={supplier.id}
                                                            className="border-2 border-gray-200 dark:border-gray-700"
                                                        >
                                                            <CardHeader className="pb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <CardTitle className="text-base">
                                                                        Supplier{' '}
                                                                        {index +
                                                                            1}
                                                                    </CardTitle>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeSupplier(
                                                                                supplier.id,
                                                                            )
                                                                        }
                                                                        variant="destructive"
                                                                        size="sm"
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`supplier_name_${supplier.id}`}
                                                                            value="Supplier Name"
                                                                        />
                                                                        <Input
                                                                            id={`supplier_name_${supplier.id}`}
                                                                            type="text"
                                                                            value={
                                                                                supplier.name
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateSupplier(
                                                                                    supplier.id,
                                                                                    'name',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Enter supplier name"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`supplier_email_${supplier.id}`}
                                                                            value="Supplier Email"
                                                                        />
                                                                        <Input
                                                                            id={`supplier_email_${supplier.id}`}
                                                                            type="email"
                                                                            value={
                                                                                supplier.email
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateSupplier(
                                                                                    supplier.id,
                                                                                    'email',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="supplier@example.com"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`supplier_phone_${supplier.id}`}
                                                                            value="Supplier Phone"
                                                                        />
                                                                        <Input
                                                                            id={`supplier_phone_${supplier.id}`}
                                                                            type="tel"
                                                                            value={
                                                                                supplier.phone
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateSupplier(
                                                                                    supplier.id,
                                                                                    'phone',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="+1 (555) 123-4567"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`supplier_website_${supplier.id}`}
                                                                            value="Supplier Website"
                                                                        />
                                                                        <Input
                                                                            id={`supplier_website_${supplier.id}`}
                                                                            type="url"
                                                                            value={
                                                                                supplier.website
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateSupplier(
                                                                                    supplier.id,
                                                                                    'website',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="https://www.supplier.com"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`supplier_contact_${supplier.id}`}
                                                                            value="Contact Person"
                                                                        />
                                                                        <Input
                                                                            id={`supplier_contact_${supplier.id}`}
                                                                            type="text"
                                                                            value={
                                                                                supplier.contact_person
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateSupplier(
                                                                                    supplier.id,
                                                                                    'contact_person',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="John Doe"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <InputLabel
                                                                        htmlFor={`supplier_address_${supplier.id}`}
                                                                        value="Supplier Address"
                                                                    />
                                                                    <Textarea
                                                                        id={`supplier_address_${supplier.id}`}
                                                                        value={
                                                                            supplier.address
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateSupplier(
                                                                                supplier.id,
                                                                                'address',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Enter complete supplier address"
                                                                        rows={3}
                                                                    />
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Purchase Records Tab */}
                                    <TabsContent
                                        value="purchase"
                                        className="mt-6 space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Purchase Records
                                            </h3>
                                            <Button
                                                type="button"
                                                onClick={addPurchaseRecord}
                                                variant="outline"
                                                size="sm"
                                                disabled={
                                                    data.suppliers.length === 0
                                                }
                                            >
                                                Add Purchase Record
                                            </Button>
                                        </div>

                                        {data.suppliers.length === 0 ? (
                                            <div className="py-8 text-center">
                                                <div className="mb-4 text-gray-500 dark:text-gray-400">
                                                    <svg
                                                        className="mx-auto h-12 w-12"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="mb-2 text-gray-600 dark:text-gray-300">
                                                    Add suppliers first
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    You need to add suppliers
                                                    before creating purchase
                                                    records.
                                                </p>
                                            </div>
                                        ) : data.purchase_records.length ===
                                          0 ? (
                                            <div className="py-8 text-center">
                                                <div className="mb-4 text-gray-500 dark:text-gray-400">
                                                    <svg
                                                        className="mx-auto h-12 w-12"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="mb-2 text-gray-600 dark:text-gray-300">
                                                    No purchase records yet
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Add purchase records to
                                                    track buying history and
                                                    costs.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {data.purchase_records.map(
                                                    (purchase, index) => (
                                                        <Card
                                                            key={purchase.id}
                                                            className="border-2 border-gray-200 dark:border-gray-700"
                                                        >
                                                            <CardHeader className="pb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <CardTitle className="text-base">
                                                                        Purchase
                                                                        Record{' '}
                                                                        {index +
                                                                            1}
                                                                    </CardTitle>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removePurchaseRecord(
                                                                                purchase.id,
                                                                            )
                                                                        }
                                                                        variant="destructive"
                                                                        size="sm"
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`purchase_supplier_${purchase.id}`}
                                                                            value="Supplier"
                                                                        />
                                                                        <Select
                                                                            value={
                                                                                purchase.supplier_id
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updatePurchaseRecord(
                                                                                    purchase.id,
                                                                                    'supplier_id',
                                                                                    value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select supplier" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {data.suppliers.map(
                                                                                    (
                                                                                        supplier,
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                supplier.id
                                                                                            }
                                                                                            value={
                                                                                                supplier.id
                                                                                            }
                                                                                        >
                                                                                            {supplier.name ||
                                                                                                `Supplier ${supplier.id}`}
                                                                                        </SelectItem>
                                                                                    ),
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`purchase_price_${purchase.id}`}
                                                                            value="Purchase Price"
                                                                        />
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                                                                                {
                                                                                    currency.symbol
                                                                                }
                                                                            </span>
                                                                            <Input
                                                                                id={`purchase_price_${purchase.id}`}
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                className="pl-8"
                                                                                value={
                                                                                    purchase.price
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    updatePurchaseRecord(
                                                                                        purchase.id,
                                                                                        'price',
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                                placeholder="0.00"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`purchase_currency_${purchase.id}`}
                                                                            value="Currency"
                                                                        />
                                                                        <Input
                                                                            id={`purchase_currency_${purchase.id}`}
                                                                            type="text"
                                                                            value={
                                                                                purchase.currency
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updatePurchaseRecord(
                                                                                    purchase.id,
                                                                                    'currency',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="USD"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`purchase_date_${purchase.id}`}
                                                                            value="Purchase Date"
                                                                        />
                                                                        <Input
                                                                            id={`purchase_date_${purchase.id}`}
                                                                            type="date"
                                                                            value={
                                                                                purchase.date
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updatePurchaseRecord(
                                                                                    purchase.id,
                                                                                    'date',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`purchase_order_${purchase.id}`}
                                                                            value="Order Number"
                                                                        />
                                                                        <Input
                                                                            id={`purchase_order_${purchase.id}`}
                                                                            type="text"
                                                                            value={
                                                                                purchase.order_number
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updatePurchaseRecord(
                                                                                    purchase.id,
                                                                                    'order_number',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="PO-2024-001"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`reorder_point_${purchase.id}`}
                                                                            value="Reorder Point"
                                                                        />
                                                                        <Input
                                                                            id={`reorder_point_${purchase.id}`}
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                purchase.reorder_point
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updatePurchaseRecord(
                                                                                    purchase.id,
                                                                                    'reorder_point',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="10"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`reorder_quantity_${purchase.id}`}
                                                                            value="Reorder Quantity"
                                                                        />
                                                                        <Input
                                                                            id={`reorder_quantity_${purchase.id}`}
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                purchase.reorder_quantity
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updatePurchaseRecord(
                                                                                    purchase.id,
                                                                                    'reorder_quantity',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="50"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <InputLabel
                                                                            htmlFor={`lead_time_${purchase.id}`}
                                                                            value="Lead Time (Days)"
                                                                        />
                                                                        <Input
                                                                            id={`lead_time_${purchase.id}`}
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                purchase.lead_time_days
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updatePurchaseRecord(
                                                                                    purchase.id,
                                                                                    'lead_time_days',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="7"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <InputLabel
                                                                        htmlFor={`payment_terms_${purchase.id}`}
                                                                        value="Payment Terms"
                                                                    />
                                                                    <Input
                                                                        id={`payment_terms_${purchase.id}`}
                                                                        type="text"
                                                                        value={
                                                                            purchase.payment_terms
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updatePurchaseRecord(
                                                                                purchase.id,
                                                                                'payment_terms',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Net 30"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <InputLabel
                                                                        htmlFor={`purchase_notes_${purchase.id}`}
                                                                        value="Notes"
                                                                    />
                                                                    <Textarea
                                                                        id={`purchase_notes_${purchase.id}`}
                                                                        value={
                                                                            purchase.notes
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updatePurchaseRecord(
                                                                                purchase.id,
                                                                                'notes',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        placeholder="Additional notes about this purchase..."
                                                                        rows={3}
                                                                    />
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>

                                <div className="mt-8 flex justify-end border-t pt-6">
                                    <PrimaryButton
                                        disabled={processing || !isFormValid()}
                                    >
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
