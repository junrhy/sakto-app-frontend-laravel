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

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    status: 'draft' | 'published' | 'archived' | 'inactive';
    sku?: string;
    stock_quantity?: number;
    weight?: number;
    dimensions?: string;
    thumbnail_url?: string;
    file_url?: string;
    tags: string[];
    images?: Array<{
        id?: number;
        image_url: string;
        alt_text?: string;
        is_primary: boolean;
        sort_order: number;
    }>;
    // Multiple suppliers and purchase records
    suppliers?: Supplier[];
    purchase_records?: PurchaseRecord[];
    variants?: any[];
    active_variants?: any[];
    created_at: string;
    updated_at: string;
}

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
    product: Product;
    currency: {
        symbol: string;
        code: string;
    };
}

export default function Edit({ auth, product, currency }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        type: product.type,
        sku: product.sku || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || '',
        status: product.status,
        tags: product.tags || [],
        variants: product.active_variants || [],
        file: null as File | null,
        images: product.images?.map(img => ({
            id: img.id,
            image_url: img.image_url,
            alt_text: img.alt_text || '',
            is_primary: img.is_primary,
            sort_order: img.sort_order,
        })) || [] as Array<{
            id?: number;
            image_url: string;
            alt_text?: string;
            is_primary: boolean;
            sort_order: number;
            file?: File;
        }>,
        // Multiple suppliers and purchase records
        suppliers: product.suppliers || [] as Supplier[],
        purchase_records: product.purchase_records || [] as PurchaseRecord[],
        _method: 'PUT'
    });

    const [newTag, setNewTag] = useState('');

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
        setData('suppliers', data.suppliers.filter(s => s.id !== supplierId));
        // Also remove associated purchase records
        setData('purchase_records', data.purchase_records.filter(p => p.supplier_id !== supplierId));
    };

    // Update supplier
    const updateSupplier = (supplierId: string, field: keyof Supplier, value: string) => {
        setData('suppliers', data.suppliers.map(s => 
            s.id === supplierId ? { ...s, [field]: value } : s
        ));
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
        setData('purchase_records', [...data.purchase_records, newPurchaseRecord]);
    };

    // Remove purchase record
    const removePurchaseRecord = (purchaseId: string) => {
        setData('purchase_records', data.purchase_records.filter(p => p.id !== purchaseId));
    };

    // Update purchase record
    const updatePurchaseRecord = (purchaseId: string, field: keyof PurchaseRecord, value: string) => {
        setData('purchase_records', data.purchase_records.map(p => 
            p.id === purchaseId ? { ...p, [field]: value } : p
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.update', product.id));
    };

    const handleVariantsChange = (variants: any[]) => {
        setData('variants', variants);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
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

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Product</h2>}
        >
            <Head title="Edit Product" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Product</CardTitle>
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
                                            Suppliers
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="purchase"
                                            className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm transition-all duration-200"
                                        >
                                            Purchase Records
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
                                                    className="mt-1 block w-full"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.name} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="sku" value="SKU" />
                                                <Input
                                                    id="sku"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.sku}
                                                    onChange={e => setData('sku', e.target.value)}
                                                    placeholder="Stock Keeping Unit"
                                                />
                                                <InputError message={errors.sku} className="mt-2" />
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="description" value="Description" />
                                            <Textarea
                                                id="description"
                                                className="mt-1 block w-full"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.description} className="mt-2" />
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
                                                        className="mt-1 block w-full pl-8"
                                                        value={data.price}
                                                        onChange={e => setData('price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <InputError message={errors.price} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="category" value="Category" />
                                                <Input
                                                    id="category"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.category}
                                                    onChange={e => setData('category', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.category} className="mt-2" />
                                            </div>

                                            <div>
                                                <Label htmlFor="type">Type</Label>
                                                <Select
                                                    value={data.type}
                                                    onValueChange={(value: 'physical' | 'digital' | 'service' | 'subscription') => setData('type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="physical">Physical</SelectItem>
                                                        <SelectItem value="digital">Digital</SelectItem>
                                                        <SelectItem value="service">Service</SelectItem>
                                                        <SelectItem value="subscription">Subscription</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.type} className="mt-2" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value: 'draft' | 'published' | 'archived' | 'inactive') => setData('status', value)}
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
                                        {/* Physical product fields */}
                                        {data.type === 'physical' && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <InputLabel htmlFor="stock_quantity" value="Stock Quantity" />
                                                    <Input
                                                        id="stock_quantity"
                                                        type="number"
                                                        min="0"
                                                        className="mt-1 block w-full"
                                                        value={data.stock_quantity}
                                                        onChange={e => setData('stock_quantity', e.target.value)}
                                                    />
                                                    <InputError message={errors.stock_quantity} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor="weight" value="Weight (kg)" />
                                                    <Input
                                                        id="weight"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="mt-1 block w-full"
                                                        value={data.weight}
                                                        onChange={e => setData('weight', e.target.value)}
                                                    />
                                                    <InputError message={errors.weight} className="mt-2" />
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
                                                productId={product.id}
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
                                                {product.file_url && (
                                                    <div className="mb-2 p-2 bg-gray-50 rounded border">
                                                        <p className="text-sm text-gray-600">Current file: {product.file_url.split('/').pop()}</p>
                                                    </div>
                                                )}
                                                <Input
                                                    id="file"
                                                    type="file"
                                                    className="mt-1 block w-full"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Max file size: 100MB. Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR, MP4, MP3, JPG, PNG, GIF
                                                </p>
                                                <InputError message={errors.file} className="mt-2" />
                                            </div>
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

                                    {/* Suppliers Tab */}
                                    <TabsContent value="supplier" className="space-y-6 mt-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suppliers</h3>
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
                                            <div className="text-center py-8">
                                                <div className="text-gray-500 dark:text-gray-400 mb-4">
                                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">No suppliers added yet</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Add suppliers to track multiple sources for this product.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {data.suppliers.map((supplier, index) => (
                                                    <Card key={supplier.id} className="border-2 border-gray-200 dark:border-gray-700">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex justify-between items-center">
                                                                <CardTitle className="text-base">Supplier {index + 1}</CardTitle>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => removeSupplier(supplier.id)}
                                                                    variant="destructive"
                                                                    size="sm"
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <InputLabel htmlFor={`supplier_name_${supplier.id}`} value="Supplier Name" />
                                                                    <Input
                                                                        id={`supplier_name_${supplier.id}`}
                                                                        type="text"
                                                                        value={supplier.name}
                                                                        onChange={e => updateSupplier(supplier.id, 'name', e.target.value)}
                                                                        placeholder="Enter supplier name"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`supplier_email_${supplier.id}`} value="Supplier Email" />
                                                                    <Input
                                                                        id={`supplier_email_${supplier.id}`}
                                                                        type="email"
                                                                        value={supplier.email}
                                                                        onChange={e => updateSupplier(supplier.id, 'email', e.target.value)}
                                                                        placeholder="supplier@example.com"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`supplier_phone_${supplier.id}`} value="Supplier Phone" />
                                                                    <Input
                                                                        id={`supplier_phone_${supplier.id}`}
                                                                        type="tel"
                                                                        value={supplier.phone}
                                                                        onChange={e => updateSupplier(supplier.id, 'phone', e.target.value)}
                                                                        placeholder="+1 (555) 123-4567"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`supplier_website_${supplier.id}`} value="Supplier Website" />
                                                                    <Input
                                                                        id={`supplier_website_${supplier.id}`}
                                                                        type="url"
                                                                        value={supplier.website}
                                                                        onChange={e => updateSupplier(supplier.id, 'website', e.target.value)}
                                                                        placeholder="https://www.supplier.com"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`supplier_contact_${supplier.id}`} value="Contact Person" />
                                                                    <Input
                                                                        id={`supplier_contact_${supplier.id}`}
                                                                        type="text"
                                                                        value={supplier.contact_person}
                                                                        onChange={e => updateSupplier(supplier.id, 'contact_person', e.target.value)}
                                                                        placeholder="John Doe"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor={`supplier_address_${supplier.id}`} value="Supplier Address" />
                                                                <Textarea
                                                                    id={`supplier_address_${supplier.id}`}
                                                                    value={supplier.address}
                                                                    onChange={e => updateSupplier(supplier.id, 'address', e.target.value)}
                                                                    placeholder="Enter complete supplier address"
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Purchase Records Tab */}
                                    <TabsContent value="purchase" className="space-y-6 mt-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Purchase Records</h3>
                                            <Button
                                                type="button"
                                                onClick={addPurchaseRecord}
                                                variant="outline"
                                                size="sm"
                                                disabled={data.suppliers.length === 0}
                                            >
                                                Add Purchase Record
                                            </Button>
                                        </div>

                                        {data.suppliers.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="text-gray-500 dark:text-gray-400 mb-4">
                                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">Add suppliers first</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    You need to add suppliers before creating purchase records.
                                                </p>
                                            </div>
                                        ) : data.purchase_records.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="text-gray-500 dark:text-gray-400 mb-4">
                                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">No purchase records yet</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Add purchase records to track buying history and costs.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {data.purchase_records.map((purchase, index) => (
                                                    <Card key={purchase.id} className="border-2 border-gray-200 dark:border-gray-700">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex justify-between items-center">
                                                                <CardTitle className="text-base">Purchase Record {index + 1}</CardTitle>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => removePurchaseRecord(purchase.id)}
                                                                    variant="destructive"
                                                                    size="sm"
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <InputLabel htmlFor={`purchase_supplier_${purchase.id}`} value="Supplier" />
                                                                    <Select
                                                                        value={purchase.supplier_id}
                                                                        onValueChange={(value) => updatePurchaseRecord(purchase.id, 'supplier_id', value)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select supplier" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {data.suppliers.map(supplier => (
                                                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                                                    {supplier.name || `Supplier ${supplier.id}`}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`purchase_price_${purchase.id}`} value="Purchase Price" />
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                                            {currency.symbol}
                                                                        </span>
                                                                        <Input
                                                                            id={`purchase_price_${purchase.id}`}
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            className="pl-8"
                                                                            value={purchase.price}
                                                                            onChange={e => updatePurchaseRecord(purchase.id, 'price', e.target.value)}
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`purchase_currency_${purchase.id}`} value="Currency" />
                                                                    <Input
                                                                        id={`purchase_currency_${purchase.id}`}
                                                                        type="text"
                                                                        value={purchase.currency}
                                                                        onChange={e => updatePurchaseRecord(purchase.id, 'currency', e.target.value)}
                                                                        placeholder="USD"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <InputLabel htmlFor={`purchase_date_${purchase.id}`} value="Purchase Date" />
                                                                    <Input
                                                                        id={`purchase_date_${purchase.id}`}
                                                                        type="date"
                                                                        value={purchase.date}
                                                                        onChange={e => updatePurchaseRecord(purchase.id, 'date', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`purchase_order_${purchase.id}`} value="Order Number" />
                                                                    <Input
                                                                        id={`purchase_order_${purchase.id}`}
                                                                        type="text"
                                                                        value={purchase.order_number}
                                                                        onChange={e => updatePurchaseRecord(purchase.id, 'order_number', e.target.value)}
                                                                        placeholder="PO-2024-001"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <InputLabel htmlFor={`reorder_point_${purchase.id}`} value="Reorder Point" />
                                                                    <Input
                                                                        id={`reorder_point_${purchase.id}`}
                                                                        type="number"
                                                                        min="0"
                                                                        value={purchase.reorder_point}
                                                                        onChange={e => updatePurchaseRecord(purchase.id, 'reorder_point', e.target.value)}
                                                                        placeholder="10"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`reorder_quantity_${purchase.id}`} value="Reorder Quantity" />
                                                                    <Input
                                                                        id={`reorder_quantity_${purchase.id}`}
                                                                        type="number"
                                                                        min="0"
                                                                        value={purchase.reorder_quantity}
                                                                        onChange={e => updatePurchaseRecord(purchase.id, 'reorder_quantity', e.target.value)}
                                                                        placeholder="50"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <InputLabel htmlFor={`lead_time_${purchase.id}`} value="Lead Time (Days)" />
                                                                    <Input
                                                                        id={`lead_time_${purchase.id}`}
                                                                        type="number"
                                                                        min="0"
                                                                        value={purchase.lead_time_days}
                                                                        onChange={e => updatePurchaseRecord(purchase.id, 'lead_time_days', e.target.value)}
                                                                        placeholder="7"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <InputLabel htmlFor={`payment_terms_${purchase.id}`} value="Payment Terms" />
                                                                <Input
                                                                    id={`payment_terms_${purchase.id}`}
                                                                    type="text"
                                                                    value={purchase.payment_terms}
                                                                    onChange={e => updatePurchaseRecord(purchase.id, 'payment_terms', e.target.value)}
                                                                    placeholder="Net 30"
                                                                />
                                                            </div>

                                                            <div>
                                                                <InputLabel htmlFor={`purchase_notes_${purchase.id}`} value="Notes" />
                                                                <Textarea
                                                                    id={`purchase_notes_${purchase.id}`}
                                                                    value={purchase.notes}
                                                                    onChange={e => updatePurchaseRecord(purchase.id, 'notes', e.target.value)}
                                                                    placeholder="Additional notes about this purchase..."
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end mt-8 pt-6 border-t">
                                    <PrimaryButton disabled={processing}>
                                        Update Product
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