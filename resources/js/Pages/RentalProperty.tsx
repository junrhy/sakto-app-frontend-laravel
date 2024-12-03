import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Search, Home, History } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";
import axios from 'axios';

interface RentalProperty {
    id: number;
    address: string;
    type: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial' | 'office' | 'retail' | 'industrial' | 'warehouse' | 'building' | 'residential-lot' | 'commercial-lot' | 'agricultural-lot';
    bedrooms: number;
    bathrooms: number;
    rent: number;
    status: 'available' | 'rented' | 'maintenance';
    tenant_name?: string;
    lease_start?: string;
    lease_end?: string;
    last_payment_received?: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    payments?: {
        payment_date: string;
        amount: number;
    }[];
}

interface PaymentRecord {
    id: number;
    rental_property_id: number;
    amount: string;
    payment_date: string;
    reference: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface PropertyAnalytics {
    totalProperties: number;
    occupancyRate: number;
    totalRentCollected: number;
    propertiesRented: number;
    propertiesAvailable: number;
    propertiesInMaintenance: number;
    averageRent: number;
}

export default function RentalProperty(props: { initialProperties: RentalProperty[], initialPayments: any[], appCurrency: any }) {
    const [properties, setProperties] = useState<RentalProperty[]>(props.initialProperties || []);
    const [payments, setPayments] = useState<any[]>(props.initialPayments || []);
    const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
    const [currentProperty, setCurrentProperty] = useState<RentalProperty | null>(null);
    const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [paymentProperty, setPaymentProperty] = useState<RentalProperty | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
    const [selectedPropertyHistory, setSelectedPropertyHistory] = useState<RentalProperty | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
    const [analytics, setAnalytics] = useState<PropertyAnalytics>({
        totalProperties: 0,
        occupancyRate: 0,
        totalRentCollected: 0,
        propertiesRented: 0,
        propertiesAvailable: 0,
        propertiesInMaintenance: 0,
        averageRent: 0
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/rental-property/list', {
                params: {
                    search: searchTerm,
                    page: currentPage,
                    per_page: itemsPerPage
                }
            });
            if (response.data && response.data.data && response.data.data.properties) {
                const properties = response.data.data.properties;
                setProperties(properties);
                calculateAnalytics(properties);
            } else {
                console.error('Invalid response format:', response);
                setProperties([]);
            }
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            setProperties([]);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateAnalytics = (properties: RentalProperty[]) => {
        const total = properties.length;
        const rented = properties.filter(p => p.status === 'rented').length;
        const available = properties.filter(p => p.status === 'available').length;
        const maintenance = properties.filter(p => p.status === 'maintenance').length;
        
        const totalRent = properties.reduce((sum, prop) => sum + prop.rent, 0);
        const avgRent = total > 0 ? totalRent / total : 0;
        const occupancy = total > 0 ? (rented / total) * 100 : 0;

        setAnalytics({
            totalProperties: total,
            occupancyRate: occupancy,
            totalRentCollected: totalRent,
            propertiesRented: rented,
            propertiesAvailable: available,
            propertiesInMaintenance: maintenance,
            averageRent: avgRent
        });
    };

    const handleAddProperty = () => {
        setCurrentProperty(null);
        setIsPropertyDialogOpen(true);
    };

    const handleEditProperty = (property: RentalProperty) => {
        setCurrentProperty(property);
        setIsPropertyDialogOpen(true);
    };

    const handleDeleteProperty = async (id: number) => {
        try {
            await axios.delete(`/rental-property/${id}`);
            fetchProperties();
        } catch (error) {
            console.error('Failed to delete property:', error);
        }
    };

    const handleDeleteSelectedProperties = async () => {
        try {
            await axios.post('/rental-property/bulk', {
                ids: selectedProperties
            });
            fetchProperties();
            setSelectedProperties([]);
        } catch (error) {
            console.error('Failed to delete properties:', error);
        }
    };

    const handleSaveProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentProperty) {
                if (currentProperty.id) {
                    // Edit existing property
                    await axios.put(`/rental-property/${currentProperty.id}`, currentProperty);
                } else {
                    // Add new property
                    await axios.post('/rental-property', currentProperty);
                }
                fetchProperties();
                setIsPropertyDialogOpen(false);
                setCurrentProperty(null);
            }
        } catch (error) {
            console.error('Failed to save property:', error);
        }
    };

    const togglePropertySelection = (id: number) => {
        setSelectedProperties(prev =>
        prev.includes(id) ? prev.filter(propertyId => propertyId !== id) : [...prev, id]
        );
    };

    const filteredProperties = useMemo(() => {
        if (!Array.isArray(properties)) {
            console.warn('Properties is not an array:', properties);
            return [];
        }
        
        return properties.filter(property =>
            property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (property.tenant_name && property.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [properties, searchTerm]);

    const paginatedProperties = useMemo(() => {
        if (!Array.isArray(filteredProperties) || filteredProperties.length === 0) {
            return [];
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProperties, currentPage]);

    const pageCount = Math.ceil(filteredProperties.length / itemsPerPage);
    
    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentProperty) {
            try {
                await axios.post(`/rental-property/${paymentProperty.id}/payment`, {
                    amount: paymentAmount,
                    payment_date: paymentDate
                });
                fetchProperties();
                setIsPaymentDialogOpen(false);
                setPaymentProperty(null);
                setPaymentAmount("");
            } catch (error) {
                console.error('Failed to record payment:', error);
            }
        }
    };

    const handlePayment = (property: RentalProperty) => {
        setPaymentProperty(property);
        setPaymentAmount(property.rent.toString());
        setIsPaymentDialogOpen(true);
    };

    const handlePaymentHistory = async (property: RentalProperty) => {
        try {
            const response = await axios.get(`/rental-property/${property.id}/payment-history`);
            setSelectedPropertyHistory(property);
            setPaymentHistory(response.data.data || []);
            setIsPaymentHistoryDialogOpen(true);
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Rental Properties
                </h2>
            }
        >
            <Head title="Properties" />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Card>
                    <CardHeader>
                        <CardTitle>Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.totalProperties}</div>
                                    <p className="text-xs text-muted-foreground">Properties</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                                    <div className="h-4 w-4 text-muted-foreground">%</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.occupancyRate.toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground">Rented</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                    <div className="h-4 w-4 text-muted-foreground">{props.appCurrency.symbol}</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analytics.totalRentCollected.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Monthly</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Rented</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.propertiesRented}</div>
                                    <p className="text-xs text-muted-foreground">Properties</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Available</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.propertiesAvailable}</div>
                                    <p className="text-xs text-muted-foreground">Properties</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.propertiesInMaintenance}</div>
                                    <p className="text-xs text-muted-foreground">Properties</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button 
                                    onClick={handleAddProperty}
                                    className="flex-1 sm:flex-none"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Property
                                </Button>
                                <Button 
                                    onClick={handleDeleteSelectedProperties} 
                                    variant="destructive" 
                                    disabled={selectedProperties.length === 0}
                                    className="flex-1 sm:flex-none"
                                >
                                    <Trash className="mr-2 h-4 w-4" /> Delete Selected
                                </Button>
                            </div>
                            <div className="relative flex-1 sm:max-w-xs">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search properties..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8"
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedProperties.length === paginatedProperties.length}
                                        onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedProperties(paginatedProperties.map(property => property.id));
                                        } else {
                                            setSelectedProperties([]);
                                        }
                                        }}
                                    />
                                    </TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Bedrooms</TableHead>
                                    <TableHead>Bathrooms</TableHead>
                                    <TableHead>Rent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Last Payment</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center">
                                            Loading properties...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedProperties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center">
                                            No properties found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedProperties.map((property) => (
                                        <TableRow key={property.id}>
                                        <TableCell>
                                            <Checkbox
                                            checked={selectedProperties.includes(property.id)}
                                            onCheckedChange={() => togglePropertySelection(property.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{property.address}</TableCell>
                                        <TableCell>{property.type}</TableCell>
                                        <TableCell>{property.bedrooms}</TableCell>
                                        <TableCell>{property.bathrooms}</TableCell>
                                        <TableCell>{props.appCurrency.symbol}{property.rent}</TableCell>
                                        <TableCell>{property.status}</TableCell>
                                        <TableCell>
                                            {property.tenant_name ? (
                                            <div>
                                                <p>{property.tenant_name}</p>
                                                <p className="text-sm text-gray-500">{property.lease_start} to {property.lease_end}</p>
                                            </div>
                                            ) : (
                                            "N/A"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {payments && payments.length > 0 ? (
                                                <div className="flex flex-col">
                                                    <span>
                                                        {payments[payments.length - 1].payment_date}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {props.appCurrency.symbol}
                                                        {payments[payments.length - 1].amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                'No payments'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleEditProperty(property)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => handleDeleteProperty(property.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                                {property.status === 'rented' && (
                                                    <>
                                                        <Button 
                                                            variant="default" 
                                                            size="sm"
                                                            onClick={() => handlePayment(property)}
                                                        >
                                                            Pay
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handlePaymentHistory(property)}
                                                        >
                                                            <History className="h-4 w-4 mr-1" />
                                                            Payment
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                </TableBody>
                            </Table>
                            <div className="flex justify-between items-center mt-4">
                                <div>
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} properties
                                </div>
                                <div className="flex space-x-2">
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                                    <Button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    variant={currentPage === page ? "default" : "outline"}
                                    >
                                    {page}
                                    </Button>
                                ))}
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                                    disabled={currentPage === pageCount}
                                >
                                    Next
                                </Button>
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
                            <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{currentProperty?.id ? 'Edit Property' : 'Add Property'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveProperty}>
                                <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="address" className="text-right">Address</Label>
                                    <Input
                                    id="address"
                                    value={currentProperty?.address || ''}
                                    onChange={(e) => setCurrentProperty({ ...currentProperty!, address: e.target.value })}
                                    className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <Select
                                        value={currentProperty?.type || ''}
                                        onValueChange={(value) => setCurrentProperty({ ...currentProperty!, type: value as RentalProperty['type'] })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="apartment">Apartment</SelectItem>
                                            <SelectItem value="house">House</SelectItem>
                                            <SelectItem value="condo">Condominium</SelectItem>
                                            <SelectItem value="townhouse">Townhouse</SelectItem>
                                            <SelectItem value="commercial">Commercial Space</SelectItem>
                                            <SelectItem value="office">Office Space</SelectItem>
                                            <SelectItem value="retail">Retail Space</SelectItem>
                                            <SelectItem value="industrial">Industrial Space</SelectItem>
                                            <SelectItem value="warehouse">Warehouse</SelectItem>
                                            <SelectItem value="building">Building</SelectItem>
                                            <SelectItem value="residential-lot">Residential Lot</SelectItem>
                                            <SelectItem value="commercial-lot">Commercial Lot</SelectItem>
                                            <SelectItem value="agricultural-lot">Agricultural Lot</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bedrooms" className="text-right">Bedrooms</Label>
                                    <Input
                                    id="bedrooms"
                                    type="number"
                                    value={currentProperty?.bedrooms || ''}
                                    onChange={(e) => setCurrentProperty({ ...currentProperty!, bedrooms: parseInt(e.target.value) })}
                                    className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bathrooms" className="text-right">Bathrooms</Label>
                                    <Input
                                    id="bathrooms"
                                    type="number"
                                    value={currentProperty?.bathrooms || ''}
                                    onChange={(e) => setCurrentProperty({ ...currentProperty!, bathrooms: parseInt(e.target.value) })}
                                    className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="rent" className="text-right">Rent</Label>
                                    <Input
                                    id="rent"
                                    type="number"
                                    value={currentProperty?.rent || ''}
                                    onChange={(e) => setCurrentProperty({ ...currentProperty!, rent: parseInt(e.target.value) })}
                                    className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">Status</Label>
                                    <Select
                                    value={currentProperty?.status || ''}
                                    onValueChange={(value: 'available' | 'rented' | 'maintenance') => setCurrentProperty({ ...currentProperty!, status: value })}
                                    >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="rented">Rented</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                {currentProperty?.status === 'rented' && (
                                    <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tenant_name" className="text-right">Tenant Name</Label>
                                        <Input
                                        id="tenant_name"
                                        value={currentProperty?.tenant_name || ''}
                                        onChange={(e) => setCurrentProperty({ ...currentProperty!, tenant_name: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lease_start" className="text-right">Lease Start</Label>
                                        <Input
                                        id="lease_start"
                                        type="date"
                                        value={currentProperty?.lease_start || ''}
                                        onChange={(e) => setCurrentProperty({ ...currentProperty!, lease_start: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lease_end" className="text-right">Lease End</Label>
                                        <Input
                                        id="lease_end"
                                        type="date"
                                        value={currentProperty?.lease_end || ''}
                                        onChange={(e) => setCurrentProperty({ ...currentProperty!, lease_end: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="last_payment_received" className="text-right">Last Payment</Label>
                                        <Input
                                            id="last_payment_received"
                                            type="date"
                                            value={currentProperty?.last_payment_received || ''}
                                            onChange={(e) => setCurrentProperty({ ...currentProperty!, last_payment_received: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    </>
                                )}
                                </div>
                                <DialogFooter>
                                <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Record Payment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handlePaymentSubmit}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="propertyAddress" className="text-right">Property</Label>
                                            <div className="col-span-3">
                                                {paymentProperty?.address}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="tenant_name" className="text-right">Tenant</Label>
                                            <div className="col-span-3">
                                                {paymentProperty?.tenant_name}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="paymentAmount" className="text-right">Amount</Label>
                                            <Input
                                                id="paymentAmount"
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="paymentDate" className="text-right">Payment Date</Label>
                                            <Input
                                                id="paymentDate"
                                                type="date"
                                                value={paymentDate}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Record Payment</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isPaymentHistoryDialogOpen} onOpenChange={setIsPaymentHistoryDialogOpen}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Payment History</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Property Address</Label>
                                            <p className="text-sm">{selectedPropertyHistory?.address}</p>
                                        </div>
                                        <div>
                                            <Label>Tenant Name</Label>
                                            <p className="text-sm">{selectedPropertyHistory?.tenant_name}</p>
                                        </div>
                                        <div>
                                            <Label>Lease Period</Label>
                                            <p className="text-sm">
                                                {selectedPropertyHistory?.lease_start} to {selectedPropertyHistory?.lease_end}
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Monthly Rent</Label>
                                            <p className="text-sm">{props.appCurrency.symbol}{selectedPropertyHistory?.rent}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Label>Payment Records</Label>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Reference</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paymentHistory.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center">
                                                            No payment records found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paymentHistory.map((payment) => (
                                                        <TableRow key={payment.id}>
                                                            <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                                            <TableCell>{props.appCurrency.symbol}{Number(payment.amount).toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800">
                                                                    Paid
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>{payment.reference}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsPaymentHistoryDialogOpen(false)}>
                                        Close
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                </div>
        </AuthenticatedLayout>
    );
}
