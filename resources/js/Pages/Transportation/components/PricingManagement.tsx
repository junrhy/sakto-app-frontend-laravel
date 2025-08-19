import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Trash2, Edit, Plus, Calculator, Eye, Settings } from 'lucide-react';

interface PricingConfig {
    id: number;
    client_identifier: string;
    config_name: string;
    config_type: string;
    base_rates: {
        small: number;
        medium: number;
        large: number;
        heavy: number;
    };
    distance_rates: {
        local: number;
        provincial: number;
        intercity: number;
    };
    weight_rates: {
        light: number;
        medium: number;
        heavy: number;
        very_heavy: number;
    };
    special_handling_rates: {
        refrigeration: number;
        special_equipment: number;
        escort: number;
        urgent: number;
    };
    surcharges: {
        fuel: number;
        peak_hour: number;
        weekend: number;
        holiday: number;
        overtime: number;
    };
    additional_costs: {
        insurance_rate: number;
        toll_rates: {
            local: number;
            provincial: number;
            intercity: number;
        };
        parking_fee_per_day: number;
    };
    currency: string;
    currency_symbol: string;
    decimal_places: number;
    is_active: boolean;
    version: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface PricingPreview {
    base_rate: number;
    distance_rate: number;
    weight_rate: number;
    special_handling_rate: number;
    fuel_surcharge: number;
    peak_hour_surcharge: number;
    weekend_surcharge: number;
    holiday_surcharge: number;
    driver_overtime_rate: number;
    insurance_cost: number;
    toll_fees: number;
    parking_fees: number;
    estimated_cost: number;
    pricing_breakdown: any;
}

const PricingManagement: React.FC = () => {
    const [configs, setConfigs] = useState<PricingConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConfig, setSelectedConfig] = useState<PricingConfig | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Form state for creating/editing configs
    const [configForm, setConfigForm] = useState({
        config_name: '',
        config_type: 'custom',
        description: '',
        base_rates: { small: 3000, medium: 5000, large: 8000, heavy: 12000 },
        distance_rates: { local: 50, provincial: 75, intercity: 100 },
        weight_rates: { light: 0, medium: 500, heavy: 1000, very_heavy: 2000 },
        special_handling_rates: { refrigeration: 2000, special_equipment: 1500, escort: 3000, urgent: 5000 },
        surcharges: { fuel: 0.15, peak_hour: 0.20, weekend: 0.25, holiday: 0.50, overtime: 0.30 },
        additional_costs: {
            insurance_rate: 0.02,
            toll_rates: { local: 0, provincial: 50, intercity: 100 },
            parking_fee_per_day: 200
        },
        currency: 'PHP',
        currency_symbol: '₱',
        decimal_places: 2,
        is_active: true
    });

    // Preview form state
    const [previewForm, setPreviewForm] = useState({
        truck_id: '',
        pickup_date: '',
        pickup_time: '09:00',
        delivery_date: '',
        delivery_time: '17:00',
        cargo_weight: 1000,
        cargo_unit: 'kg',
        distance_km: 50,
        route_type: 'local',
        requires_refrigeration: false,
        requires_special_equipment: false,
        requires_escort: false,
        is_urgent_delivery: false
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await axios.get('/transportation/pricing-configs/list');

            if (response.data.success) {
                setConfigs(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch pricing configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConfig = async () => {
        try {
            const response = await axios.post('/transportation/pricing-configs', configForm);

            if (response.data.success) {
                setConfigs([...configs, response.data.data]);
                setShowCreateDialog(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to create pricing config:', error);
        }
    };

    const handleUpdateConfig = async () => {
        try {
            if (!selectedConfig) return;

            const response = await axios.put(`/transportation/pricing-configs/${selectedConfig.id}`, configForm);

            if (response.data.success) {
                setConfigs(configs.map(config => 
                    config.id === selectedConfig.id ? response.data.data : config
                ));
                setShowEditDialog(false);
                setSelectedConfig(null);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to update pricing config:', error);
        }
    };

    const handleDeleteConfig = async (configId: number) => {
        try {
            const response = await axios.delete(`/transportation/pricing-configs/${configId}`);

            if (response.data.success) {
                setConfigs(configs.filter(config => config.id !== configId));
            }
        } catch (error) {
            console.error('Failed to delete pricing config:', error);
        }
    };

    const handleCalculatePreview = async () => {
        try {
            setPreviewLoading(true);
            
            const response = await axios.get('/transportation/pricing-configs/preview', {
                params: {
                    config_id: selectedConfig?.id,
                    ...previewForm
                }
            });

            if (response.data.success) {
                setPricingPreview(response.data.data);
            }
        } catch (error) {
            console.error('Failed to calculate pricing preview:', error);
        } finally {
            setPreviewLoading(false);
        }
    };

    const resetForm = () => {
        setConfigForm({
            config_name: '',
            config_type: 'custom',
            description: '',
            base_rates: { small: 3000, medium: 5000, large: 8000, heavy: 12000 },
            distance_rates: { local: 50, provincial: 75, intercity: 100 },
            weight_rates: { light: 0, medium: 500, heavy: 1000, very_heavy: 2000 },
            special_handling_rates: { refrigeration: 2000, special_equipment: 1500, escort: 3000, urgent: 5000 },
            surcharges: { fuel: 0.15, peak_hour: 0.20, weekend: 0.25, holiday: 0.50, overtime: 0.30 },
            additional_costs: {
                insurance_rate: 0.02,
                toll_rates: { local: 0, provincial: 50, intercity: 100 },
                parking_fee_per_day: 200
            },
            currency: 'PHP',
            currency_symbol: '₱',
            decimal_places: 2,
            is_active: true
        });
    };

    const populateFormFromConfig = (config: PricingConfig) => {
        setConfigForm({
            config_name: config.config_name,
            config_type: config.config_type,
            description: config.description,
            base_rates: config.base_rates,
            distance_rates: config.distance_rates,
            weight_rates: config.weight_rates,
            special_handling_rates: config.special_handling_rates,
            surcharges: config.surcharges,
            additional_costs: config.additional_costs,
            currency: config.currency,
            currency_symbol: config.currency_symbol,
            decimal_places: config.decimal_places,
            is_active: config.is_active
        });
    };

    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString()}`;
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading pricing configurations...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Pricing Management
                            </CardTitle>
                            <CardDescription>
                                Manage transportation pricing configurations and calculate pricing previews
                            </CardDescription>
                        </div>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Configuration
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create Pricing Configuration</DialogTitle>
                                    <DialogDescription>
                                        Set up a new pricing configuration with custom rates and surcharges.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <Tabs defaultValue="basic" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="rates">Base Rates</TabsTrigger>
                                        <TabsTrigger value="surcharges">Surcharges</TabsTrigger>
                                        <TabsTrigger value="additional">Additional</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="basic" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="config_name">Configuration Name</Label>
                                                <Input
                                                    id="config_name"
                                                    value={configForm.config_name}
                                                    onChange={(e) => setConfigForm({...configForm, config_name: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="config_type">Type</Label>
                                                <Select value={configForm.config_type} onValueChange={(value) => setConfigForm({...configForm, config_type: value})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="custom">Custom</SelectItem>
                                                        <SelectItem value="premium">Premium</SelectItem>
                                                        <SelectItem value="economy">Economy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={configForm.description}
                                                onChange={(e) => setConfigForm({...configForm, description: e.target.value})}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_active"
                                                checked={configForm.is_active}
                                                onCheckedChange={(checked) => setConfigForm({...configForm, is_active: checked})}
                                            />
                                            <Label htmlFor="is_active">Active Configuration</Label>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="rates" className="space-y-4">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Base Rates (per day)</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Small Trucks (1-3 tons)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.base_rates.small}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            base_rates: {...configForm.base_rates, small: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Medium Trucks (4-8 tons)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.base_rates.medium}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            base_rates: {...configForm.base_rates, medium: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Large Trucks (9-15 tons)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.base_rates.large}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            base_rates: {...configForm.base_rates, large: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Heavy Trucks (16+ tons)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.base_rates.heavy}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            base_rates: {...configForm.base_rates, heavy: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-semibold">Distance Rates (per km)</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Local</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.distance_rates.local}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            distance_rates: {...configForm.distance_rates, local: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Provincial</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.distance_rates.provincial}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            distance_rates: {...configForm.distance_rates, provincial: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Intercity</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.distance_rates.intercity}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            distance_rates: {...configForm.distance_rates, intercity: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="surcharges" className="space-y-4">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Surcharge Percentages</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Fuel Surcharge</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={configForm.surcharges.fuel}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            surcharges: {...configForm.surcharges, fuel: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Peak Hour Surcharge</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={configForm.surcharges.peak_hour}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            surcharges: {...configForm.surcharges, peak_hour: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Weekend Surcharge</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={configForm.surcharges.weekend}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            surcharges: {...configForm.surcharges, weekend: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Holiday Surcharge</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={configForm.surcharges.holiday}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            surcharges: {...configForm.surcharges, holiday: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="additional" className="space-y-4">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Special Handling Rates</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Refrigeration (per day)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.special_handling_rates.refrigeration}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            special_handling_rates: {...configForm.special_handling_rates, refrigeration: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Special Equipment (per day)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.special_handling_rates.special_equipment}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            special_handling_rates: {...configForm.special_handling_rates, special_equipment: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Escort Service (per day)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.special_handling_rates.escort}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            special_handling_rates: {...configForm.special_handling_rates, escort: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Urgent Delivery (one-time)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configForm.special_handling_rates.urgent}
                                                        onChange={(e) => setConfigForm({
                                                            ...configForm,
                                                            special_handling_rates: {...configForm.special_handling_rates, urgent: parseFloat(e.target.value)}
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateConfig}>
                                        Create Configuration
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Base Rate (Medium)</TableHead>
                                    <TableHead>Distance Rate (Local)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {configs.map((config) => (
                                    <TableRow key={config.id}>
                                        <TableCell className="font-medium">{config.config_name}</TableCell>
                                        <TableCell>
                                            <Badge variant={config.config_type === 'default' ? 'default' : 'secondary'}>
                                                {config.config_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatCurrency(config.base_rates.medium)}</TableCell>
                                        <TableCell>₱{config.distance_rates.local}/km</TableCell>
                                        <TableCell>
                                            <Badge variant={config.is_active ? 'default' : 'destructive'}>
                                                {config.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedConfig(config);
                                                        setShowPreviewDialog(true);
                                                    }}
                                                >
                                                    <Calculator className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedConfig(config);
                                                        populateFormFromConfig(config);
                                                        setShowEditDialog(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {config.config_type !== 'default' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteConfig(config.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog - Similar structure to Create Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Pricing Configuration</DialogTitle>
                        <DialogDescription>
                            Update the pricing configuration settings.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="basic" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="rates">Base Rates</TabsTrigger>
                            <TabsTrigger value="surcharges">Surcharges</TabsTrigger>
                            <TabsTrigger value="additional">Additional</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit_config_name">Configuration Name</Label>
                                    <Input
                                        id="edit_config_name"
                                        value={configForm.config_name}
                                        onChange={(e) => setConfigForm({...configForm, config_name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_config_type">Type</Label>
                                    <Select value={configForm.config_type} onValueChange={(value) => setConfigForm({...configForm, config_type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Custom</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                            <SelectItem value="economy">Economy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_description">Description</Label>
                                <Textarea
                                    id="edit_description"
                                    value={configForm.description}
                                    onChange={(e) => setConfigForm({...configForm, description: e.target.value})}
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit_is_active"
                                    checked={configForm.is_active}
                                    onCheckedChange={(checked) => setConfigForm({...configForm, is_active: checked})}
                                />
                                <Label htmlFor="edit_is_active">Active Configuration</Label>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="rates" className="space-y-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Base Rates (per day)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Small Trucks (1-3 tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.small}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                base_rates: {...configForm.base_rates, small: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Medium Trucks (4-8 tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.medium}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                base_rates: {...configForm.base_rates, medium: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Large Trucks (9-15 tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.large}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                base_rates: {...configForm.base_rates, large: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Heavy Trucks (16+ tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.heavy}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                base_rates: {...configForm.base_rates, heavy: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                </div>
                                
                                <h4 className="font-semibold">Distance Rates (per km)</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Local</Label>
                                        <Input
                                            type="number"
                                            value={configForm.distance_rates.local}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                distance_rates: {...configForm.distance_rates, local: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Provincial</Label>
                                        <Input
                                            type="number"
                                            value={configForm.distance_rates.provincial}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                distance_rates: {...configForm.distance_rates, provincial: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Intercity</Label>
                                        <Input
                                            type="number"
                                            value={configForm.distance_rates.intercity}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                distance_rates: {...configForm.distance_rates, intercity: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="surcharges" className="space-y-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Surcharge Percentages</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fuel Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={configForm.surcharges.fuel}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                surcharges: {...configForm.surcharges, fuel: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Peak Hour Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={configForm.surcharges.peak_hour}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                surcharges: {...configForm.surcharges, peak_hour: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weekend Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={configForm.surcharges.weekend}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                surcharges: {...configForm.surcharges, weekend: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Holiday Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={configForm.surcharges.holiday}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                surcharges: {...configForm.surcharges, holiday: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="additional" className="space-y-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Special Handling Rates</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Refrigeration (per day)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.special_handling_rates.refrigeration}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                special_handling_rates: {...configForm.special_handling_rates, refrigeration: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Special Equipment (per day)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.special_handling_rates.special_equipment}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                special_handling_rates: {...configForm.special_handling_rates, special_equipment: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Escort Service (per day)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.special_handling_rates.escort}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                special_handling_rates: {...configForm.special_handling_rates, escort: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Urgent Delivery (one-time)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.special_handling_rates.urgent}
                                            onChange={(e) => setConfigForm({
                                                ...configForm,
                                                special_handling_rates: {...configForm.special_handling_rates, urgent: parseFloat(e.target.value)}
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateConfig}>
                            Update Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pricing Preview Dialog */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Pricing Calculator</DialogTitle>
                        <DialogDescription>
                            Calculate pricing preview using {selectedConfig?.config_name}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pickup Date</Label>
                                <Input
                                    type="date"
                                    value={previewForm.pickup_date}
                                    onChange={(e) => setPreviewForm({...previewForm, pickup_date: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Delivery Date</Label>
                                <Input
                                    type="date"
                                    value={previewForm.delivery_date}
                                    onChange={(e) => setPreviewForm({...previewForm, delivery_date: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cargo Weight</Label>
                                <Input
                                    type="number"
                                    value={previewForm.cargo_weight}
                                    onChange={(e) => setPreviewForm({...previewForm, cargo_weight: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Distance (km)</Label>
                                <Input
                                    type="number"
                                    value={previewForm.distance_km}
                                    onChange={(e) => setPreviewForm({...previewForm, distance_km: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                        
                        <Button onClick={handleCalculatePreview} disabled={previewLoading} className="w-full">
                            {previewLoading ? 'Calculating...' : 'Calculate Pricing'}
                        </Button>
                        
                        {pricingPreview && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Base Rate:</span>
                                            <span>{formatCurrency(pricingPreview.base_rate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Distance Rate:</span>
                                            <span>{formatCurrency(pricingPreview.distance_rate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Weight Rate:</span>
                                            <span>{formatCurrency(pricingPreview.weight_rate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Fuel Surcharge:</span>
                                            <span>{formatCurrency(pricingPreview.fuel_surcharge)}</span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between font-bold">
                                            <span>Total Estimated Cost:</span>
                                            <span>{formatCurrency(pricingPreview.estimated_cost)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PricingManagement;
