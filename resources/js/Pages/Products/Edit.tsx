import { User, Project } from '@/types/index';
import React, { useState } from 'react';
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
    // Supplier related fields
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone?: string;
    supplier_address?: string;
    supplier_website?: string;
    supplier_contact_person?: string;
    // Purchase related fields
    purchase_price?: number;
    purchase_currency?: string;
    purchase_date?: string;
    purchase_order_number?: string;
    purchase_notes?: string;
    reorder_point?: number;
    reorder_quantity?: number;
    lead_time_days?: number;
    payment_terms?: string;
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
        // Supplier related fields
        supplier_name: product.supplier_name || '',
        supplier_email: product.supplier_email || '',
        supplier_phone: product.supplier_phone || '',
        supplier_address: product.supplier_address || '',
        supplier_website: product.supplier_website || '',
        supplier_contact_person: product.supplier_contact_person || '',
        // Purchase related fields
        purchase_price: product.purchase_price?.toString() || '',
        purchase_currency: product.purchase_currency || currency.code,
        purchase_date: product.purchase_date || '',
        purchase_order_number: product.purchase_order_number || '',
        purchase_notes: product.purchase_notes || '',
        reorder_point: product.reorder_point?.toString() || '',
        reorder_quantity: product.reorder_quantity?.toString() || '',
        lead_time_days: product.lead_time_days?.toString() || '',
        payment_terms: product.payment_terms || '',
        _method: 'PUT'
    });

    const [newTag, setNewTag] = useState('');

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
                                                    className="mt-1 block w-full"
                                                    value={data.supplier_email}
                                                    onChange={e => setData('supplier_email', e.target.value)}
                                                    placeholder="supplier@example.com"
                                                />
                                                <InputError message={errors.supplier_email} className="mt-2" />
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
                                                    className="mt-1 block w-full"
                                                    value={data.supplier_website}
                                                    onChange={e => setData('supplier_website', e.target.value)}
                                                    placeholder="https://www.supplier.com"
                                                />
                                                <InputError message={errors.supplier_website} className="mt-2" />
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
                                                        className="mt-1 block w-full pl-8"
                                                        value={data.purchase_price}
                                                        onChange={e => setData('purchase_price', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <InputError message={errors.purchase_price} className="mt-2" />
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