import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Search, Home } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";

interface RentalProperty {
    id: number;
    address: string;
    type: 'apartment' | 'house' | 'condo' | 'townhouse';
    bedrooms: number;
    bathrooms: number;
    rent: number;
    status: 'available' | 'rented' | 'maintenance';
    tenantName?: string;
    leaseStart?: string;
    leaseEnd?: string;
}
  
const INITIAL_PROPERTIES: RentalProperty[] = [
    { id: 1, address: "123 Main St", type: "apartment", bedrooms: 2, bathrooms: 1, rent: 1200, status: "available" },
    { id: 2, address: "456 Elm St", type: "house", bedrooms: 3, bathrooms: 2, rent: 1800, status: "rented", tenantName: "John Doe", leaseStart: "2023-01-01", leaseEnd: "2023-12-31" },
    { id: 3, address: "789 Oak St", type: "condo", bedrooms: 1, bathrooms: 1, rent: 1000, status: "maintenance" },
];

export default function RentalProperty() {
    const [properties, setProperties] = useState<RentalProperty[]>(INITIAL_PROPERTIES);
    const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
    const [currentProperty, setCurrentProperty] = useState<RentalProperty | null>(null);
    const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleAddProperty = () => {
        setCurrentProperty(null);
        setIsPropertyDialogOpen(true);
    };

    const handleEditProperty = (property: RentalProperty) => {
        setCurrentProperty(property);
        setIsPropertyDialogOpen(true);
    };

    const handleDeleteProperty = (id: number) => {
        setProperties(properties.filter(property => property.id !== id));
        setSelectedProperties(selectedProperties.filter(propertyId => propertyId !== id));
    };

    const handleDeleteSelectedProperties = () => {
        setProperties(properties.filter(property => !selectedProperties.includes(property.id)));
        setSelectedProperties([]);
    };

    const handleSaveProperty = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentProperty) {
        if (currentProperty.id) {
            // Edit existing property
            setProperties(properties.map(property => 
            property.id === currentProperty.id ? currentProperty : property
            ));
        } else {
            // Add new property
            setProperties([...properties, { ...currentProperty, id: Date.now() }]);
        }
        }
        setIsPropertyDialogOpen(false);
        setCurrentProperty(null);
    };

    const togglePropertySelection = (id: number) => {
        setSelectedProperties(prev =>
        prev.includes(id) ? prev.filter(propertyId => propertyId !== id) : [...prev, id]
        );
    };

    const filteredProperties = useMemo(() => {
        return properties.filter(property =>
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [properties, searchTerm]);

    const paginatedProperties = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProperties, currentPage]);

    const pageCount = Math.ceil(filteredProperties.length / itemsPerPage);
    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Rental Properties
                </h2>
            }
        >
            <Head title="Properties" />

            <div className="py-0">
                <div className="">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 border-2">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                        <Card>
                            <CardHeader>
                            <CardTitle>Properties</CardTitle>
                            </CardHeader>
                            <CardContent>
                            <div className="flex justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                <Button onClick={handleAddProperty}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Property
                                </Button>
                                <Button 
                                    onClick={handleDeleteSelectedProperties} 
                                    variant="destructive" 
                                    disabled={selectedProperties.length === 0}
                                >
                                    <Trash className="mr-2 h-4 w-4" /> Delete Selected
                                </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search properties..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
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
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {paginatedProperties.map((property) => (
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
                                    <TableCell>${property.rent}</TableCell>
                                    <TableCell>{property.status}</TableCell>
                                    <TableCell>
                                        {property.tenantName ? (
                                        <div>
                                            <p>{property.tenantName}</p>
                                            <p className="text-sm text-gray-500">{property.leaseStart} to {property.leaseEnd}</p>
                                        </div>
                                        ) : (
                                        "N/A"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditProperty(property)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProperty(property.id)}>
                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                ))}
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
                                    onValueChange={(value: 'apartment' | 'house' | 'condo' | 'townhouse') => setCurrentProperty({ ...currentProperty!, type: value })}
                                    >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apartment">Apartment</SelectItem>
                                        <SelectItem value="house">House</SelectItem>
                                        <SelectItem value="condo">Condo</SelectItem>
                                        <SelectItem value="townhouse">Townhouse</SelectItem>
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
                                        <Label htmlFor="tenantName" className="text-right">Tenant Name</Label>
                                        <Input
                                        id="tenantName"
                                        value={currentProperty?.tenantName || ''}
                                        onChange={(e) => setCurrentProperty({ ...currentProperty!, tenantName: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="leaseStart" className="text-right">Lease Start</Label>
                                        <Input
                                        id="leaseStart"
                                        type="date"
                                        value={currentProperty?.leaseStart || ''}
                                        onChange={(e) => setCurrentProperty({ ...currentProperty!, leaseStart: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="leaseEnd" className="text-right">Lease End</Label>
                                        <Input
                                        id="leaseEnd"
                                        type="date"
                                        value={currentProperty?.leaseEnd || ''}
                                        onChange={(e) => setCurrentProperty({ ...currentProperty!, leaseEnd: e.target.value })}
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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
