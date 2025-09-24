import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import axios from 'axios';
import {
    Activity,
    Calculator,
    DollarSign,
    Edit,
    Plus,
    Search,
    Settings,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
    const [selectedConfig, setSelectedConfig] = useState<PricingConfig | null>(
        null,
    );
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [pricingPreview, setPricingPreview] = useState<PricingPreview | null>(
        null,
    );
    const [previewLoading, setPreviewLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form state for creating/editing configs
    const [configForm, setConfigForm] = useState({
        config_name: '',
        config_type: 'custom',
        description: '',
        base_rates: { small: 3000, medium: 5000, large: 8000, heavy: 12000 },
        distance_rates: { local: 50, provincial: 75, intercity: 100 },
        weight_rates: { light: 0, medium: 500, heavy: 1000, very_heavy: 2000 },
        special_handling_rates: {
            refrigeration: 2000,
            special_equipment: 1500,
            escort: 3000,
            urgent: 5000,
        },
        surcharges: {
            fuel: 0.15,
            peak_hour: 0.2,
            weekend: 0.25,
            holiday: 0.5,
            overtime: 0.3,
        },
        additional_costs: {
            insurance_rate: 0.02,
            toll_rates: { local: 0, provincial: 50, intercity: 100 },
            parking_fee_per_day: 200,
        },
        currency: 'PHP',
        currency_symbol: '₱',
        decimal_places: 2,
        is_active: true,
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
        is_urgent_delivery: false,
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await axios.get(
                '/transportation/pricing-configs/list',
            );

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
            const response = await axios.post(
                '/transportation/pricing-configs',
                configForm,
            );

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

            const response = await axios.put(
                `/transportation/pricing-configs/${selectedConfig.id}`,
                configForm,
            );

            if (response.data.success) {
                setConfigs(
                    configs.map((config) =>
                        config.id === selectedConfig.id
                            ? response.data.data
                            : config,
                    ),
                );
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
            const response = await axios.delete(
                `/transportation/pricing-configs/${configId}`,
            );

            if (response.data.success) {
                setConfigs(configs.filter((config) => config.id !== configId));
            }
        } catch (error) {
            console.error('Failed to delete pricing config:', error);
        }
    };

    const handleCalculatePreview = async () => {
        try {
            setPreviewLoading(true);

            const response = await axios.get(
                '/transportation/pricing-configs/preview',
                {
                    params: {
                        config_id: selectedConfig?.id,
                        ...previewForm,
                    },
                },
            );

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
            base_rates: {
                small: 3000,
                medium: 5000,
                large: 8000,
                heavy: 12000,
            },
            distance_rates: { local: 50, provincial: 75, intercity: 100 },
            weight_rates: {
                light: 0,
                medium: 500,
                heavy: 1000,
                very_heavy: 2000,
            },
            special_handling_rates: {
                refrigeration: 2000,
                special_equipment: 1500,
                escort: 3000,
                urgent: 5000,
            },
            surcharges: {
                fuel: 0.15,
                peak_hour: 0.2,
                weekend: 0.25,
                holiday: 0.5,
                overtime: 0.3,
            },
            additional_costs: {
                insurance_rate: 0.02,
                toll_rates: { local: 0, provincial: 50, intercity: 100 },
                parking_fee_per_day: 200,
            },
            currency: 'PHP',
            currency_symbol: '₱',
            decimal_places: 2,
            is_active: true,
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
            is_active: config.is_active,
        });
    };

    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-US')}`;
    };

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    // Filter configs based on search and status
    const filteredConfigs = configs.filter((config) => {
        const matchesSearch =
            config.config_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            config.config_type
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            config.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && config.is_active) ||
            (statusFilter === 'inactive' && !config.is_active);

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total_configs: configs.length,
        active_configs: configs.filter((config) => config.is_active).length,
        inactive_configs: configs.filter((config) => !config.is_active).length,
        custom_configs: configs.filter(
            (config) => config.config_type === 'custom',
        ).length,
        premium_configs: configs.filter(
            (config) => config.config_type === 'premium',
        ).length,
        economy_configs: configs.filter(
            (config) => config.config_type === 'economy',
        ).length,
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Pricing Management
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage transportation pricing configurations
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                                Loading pricing configurations...
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Pricing Management
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage transportation pricing configurations and
                                calculate pricing previews
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredConfigs.length} configurations
                        </div>
                        <Dialog
                            open={showCreateDialog}
                            onOpenChange={setShowCreateDialog}
                        >
                            <DialogTrigger asChild>
                                <Button className="bg-orange-600 text-white shadow-sm hover:bg-orange-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Configuration
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        <Settings className="h-5 w-5 text-orange-600" />
                                        Create Pricing Configuration
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                                        Set up a new pricing configuration with
                                        custom rates and surcharges.
                                    </DialogDescription>
                                </DialogHeader>

                                <Tabs
                                    defaultValue="basic"
                                    className="space-y-4"
                                >
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="basic">
                                            Basic Info
                                        </TabsTrigger>
                                        <TabsTrigger value="rates">
                                            Base Rates
                                        </TabsTrigger>
                                        <TabsTrigger value="surcharges">
                                            Surcharges
                                        </TabsTrigger>
                                        <TabsTrigger value="additional">
                                            Additional
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="basic"
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="config_name">
                                                    Configuration Name
                                                </Label>
                                                <Input
                                                    id="config_name"
                                                    value={
                                                        configForm.config_name
                                                    }
                                                    onChange={(e) =>
                                                        setConfigForm({
                                                            ...configForm,
                                                            config_name:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="config_type">
                                                    Type
                                                </Label>
                                                <Select
                                                    value={
                                                        configForm.config_type
                                                    }
                                                    onValueChange={(value) =>
                                                        setConfigForm({
                                                            ...configForm,
                                                            config_type: value,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="custom">
                                                            Custom
                                                        </SelectItem>
                                                        <SelectItem value="premium">
                                                            Premium
                                                        </SelectItem>
                                                        <SelectItem value="economy">
                                                            Economy
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={configForm.description}
                                                onChange={(e) =>
                                                    setConfigForm({
                                                        ...configForm,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_active"
                                                checked={configForm.is_active}
                                                onCheckedChange={(checked) =>
                                                    setConfigForm({
                                                        ...configForm,
                                                        is_active: checked,
                                                    })
                                                }
                                            />
                                            <Label htmlFor="is_active">
                                                Active Configuration
                                            </Label>
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="rates"
                                        className="space-y-4"
                                    >
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">
                                                Base Rates (per day)
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Small Trucks (1-3 tons)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .base_rates
                                                                .small
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                base_rates: {
                                                                    ...configForm.base_rates,
                                                                    small: parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Medium Trucks (4-8 tons)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .base_rates
                                                                .medium
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                base_rates: {
                                                                    ...configForm.base_rates,
                                                                    medium: parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Large Trucks (9-15 tons)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .base_rates
                                                                .large
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                base_rates: {
                                                                    ...configForm.base_rates,
                                                                    large: parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Heavy Trucks (16+ tons)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .base_rates
                                                                .heavy
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                base_rates: {
                                                                    ...configForm.base_rates,
                                                                    heavy: parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <h4 className="font-semibold">
                                                Distance Rates (per km)
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Local</Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .distance_rates
                                                                .local
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                distance_rates:
                                                                    {
                                                                        ...configForm.distance_rates,
                                                                        local: parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Provincial</Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .distance_rates
                                                                .provincial
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                distance_rates:
                                                                    {
                                                                        ...configForm.distance_rates,
                                                                        provincial:
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Intercity</Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .distance_rates
                                                                .intercity
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                distance_rates:
                                                                    {
                                                                        ...configForm.distance_rates,
                                                                        intercity:
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="surcharges"
                                        className="space-y-4"
                                    >
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">
                                                Surcharge Percentages
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Fuel Surcharge
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            configForm
                                                                .surcharges.fuel
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                surcharges: {
                                                                    ...configForm.surcharges,
                                                                    fuel: parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Peak Hour Surcharge
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            configForm
                                                                .surcharges
                                                                .peak_hour
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                surcharges: {
                                                                    ...configForm.surcharges,
                                                                    peak_hour:
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Weekend Surcharge
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            configForm
                                                                .surcharges
                                                                .weekend
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                surcharges: {
                                                                    ...configForm.surcharges,
                                                                    weekend:
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Holiday Surcharge
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            configForm
                                                                .surcharges
                                                                .holiday
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                surcharges: {
                                                                    ...configForm.surcharges,
                                                                    holiday:
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                },
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="additional"
                                        className="space-y-4"
                                    >
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">
                                                Special Handling Rates
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Refrigeration (per day)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .special_handling_rates
                                                                .refrigeration
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                special_handling_rates:
                                                                    {
                                                                        ...configForm.special_handling_rates,
                                                                        refrigeration:
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Special Equipment (per
                                                        day)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .special_handling_rates
                                                                .special_equipment
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                special_handling_rates:
                                                                    {
                                                                        ...configForm.special_handling_rates,
                                                                        special_equipment:
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Escort Service (per day)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .special_handling_rates
                                                                .escort
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                special_handling_rates:
                                                                    {
                                                                        ...configForm.special_handling_rates,
                                                                        escort: parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    },
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Urgent Delivery
                                                        (one-time)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            configForm
                                                                .special_handling_rates
                                                                .urgent
                                                        }
                                                        onChange={(e) =>
                                                            setConfigForm({
                                                                ...configForm,
                                                                special_handling_rates:
                                                                    {
                                                                        ...configForm.special_handling_rates,
                                                                        urgent: parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    },
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <DialogFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowCreateDialog(false)
                                        }
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateConfig}
                                        className="bg-orange-600 text-white hover:bg-orange-700"
                                    >
                                        Create Configuration
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.total_configs}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                    Total Configs
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.active_configs}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.premium_configs}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">
                                    Premium
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                                <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {stats.custom_configs}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">
                                    Custom
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search configurations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-gray-200 bg-gray-50 pl-10 focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                            <TableRow className="border-gray-200 dark:border-gray-700">
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Name
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Type
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Base Rate (Medium)
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Distance Rate (Local)
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredConfigs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center"
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <Settings className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                            <span className="text-gray-500 dark:text-gray-400">
                                                No pricing configurations found
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredConfigs.map((config) => (
                                    <TableRow
                                        key={config.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                    >
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                            {config.config_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    config.config_type ===
                                                    'premium'
                                                        ? 'default'
                                                        : config.config_type ===
                                                            'economy'
                                                          ? 'secondary'
                                                          : 'outline'
                                                }
                                                className={
                                                    config.config_type ===
                                                    'premium'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                        : config.config_type ===
                                                            'economy'
                                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                                }
                                            >
                                                {config.config_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {formatCurrency(
                                                config.base_rates.medium,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            ₱
                                            {config.distance_rates.local.toLocaleString(
                                                'en-US',
                                            )}
                                            /km
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    config.is_active
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className={
                                                    config.is_active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }
                                            >
                                                {config.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedConfig(
                                                            config,
                                                        );
                                                        setShowPreviewDialog(
                                                            true,
                                                        );
                                                    }}
                                                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    title="Calculate Pricing"
                                                >
                                                    <Calculator className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedConfig(
                                                            config,
                                                        );
                                                        populateFormFromConfig(
                                                            config,
                                                        );
                                                        setShowEditDialog(true);
                                                    }}
                                                    className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                    title="Edit Configuration"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {config.config_type !==
                                                    'default' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteConfig(
                                                                config.id,
                                                            )
                                                        }
                                                        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Delete Configuration"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Dialog - Similar structure to Create Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                            <Settings className="h-5 w-5 text-orange-600" />
                            Edit Pricing Configuration
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Update the pricing configuration settings.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="basic" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="rates">Base Rates</TabsTrigger>
                            <TabsTrigger value="surcharges">
                                Surcharges
                            </TabsTrigger>
                            <TabsTrigger value="additional">
                                Additional
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit_config_name">
                                        Configuration Name
                                    </Label>
                                    <Input
                                        id="edit_config_name"
                                        value={configForm.config_name}
                                        onChange={(e) =>
                                            setConfigForm({
                                                ...configForm,
                                                config_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_config_type">
                                        Type
                                    </Label>
                                    <Select
                                        value={configForm.config_type}
                                        onValueChange={(value) =>
                                            setConfigForm({
                                                ...configForm,
                                                config_type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">
                                                Custom
                                            </SelectItem>
                                            <SelectItem value="premium">
                                                Premium
                                            </SelectItem>
                                            <SelectItem value="economy">
                                                Economy
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_description">
                                    Description
                                </Label>
                                <Textarea
                                    id="edit_description"
                                    value={configForm.description}
                                    onChange={(e) =>
                                        setConfigForm({
                                            ...configForm,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit_is_active"
                                    checked={configForm.is_active}
                                    onCheckedChange={(checked) =>
                                        setConfigForm({
                                            ...configForm,
                                            is_active: checked,
                                        })
                                    }
                                />
                                <Label htmlFor="edit_is_active">
                                    Active Configuration
                                </Label>
                            </div>
                        </TabsContent>

                        <TabsContent value="rates" className="space-y-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">
                                    Base Rates (per day)
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Small Trucks (1-3 tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.small}
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    base_rates: {
                                                        ...configForm.base_rates,
                                                        small: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Medium Trucks (4-8 tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.medium}
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    base_rates: {
                                                        ...configForm.base_rates,
                                                        medium: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Large Trucks (9-15 tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.large}
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    base_rates: {
                                                        ...configForm.base_rates,
                                                        large: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Heavy Trucks (16+ tons)</Label>
                                        <Input
                                            type="number"
                                            value={configForm.base_rates.heavy}
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    base_rates: {
                                                        ...configForm.base_rates,
                                                        heavy: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <h4 className="font-semibold">
                                    Distance Rates (per km)
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Local</Label>
                                        <Input
                                            type="number"
                                            value={
                                                configForm.distance_rates.local
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    distance_rates: {
                                                        ...configForm.distance_rates,
                                                        local: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Provincial</Label>
                                        <Input
                                            type="number"
                                            value={
                                                configForm.distance_rates
                                                    .provincial
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    distance_rates: {
                                                        ...configForm.distance_rates,
                                                        provincial: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Intercity</Label>
                                        <Input
                                            type="number"
                                            value={
                                                configForm.distance_rates
                                                    .intercity
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    distance_rates: {
                                                        ...configForm.distance_rates,
                                                        intercity: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="surcharges" className="space-y-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">
                                    Surcharge Percentages
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fuel Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={configForm.surcharges.fuel}
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    surcharges: {
                                                        ...configForm.surcharges,
                                                        fuel: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Peak Hour Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                                configForm.surcharges.peak_hour
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    surcharges: {
                                                        ...configForm.surcharges,
                                                        peak_hour: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weekend Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                                configForm.surcharges.weekend
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    surcharges: {
                                                        ...configForm.surcharges,
                                                        weekend: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Holiday Surcharge</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                                configForm.surcharges.holiday
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    surcharges: {
                                                        ...configForm.surcharges,
                                                        holiday: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="additional" className="space-y-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">
                                    Special Handling Rates
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Refrigeration (per day)</Label>
                                        <Input
                                            type="number"
                                            value={
                                                configForm
                                                    .special_handling_rates
                                                    .refrigeration
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    special_handling_rates: {
                                                        ...configForm.special_handling_rates,
                                                        refrigeration:
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Special Equipment (per day)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={
                                                configForm
                                                    .special_handling_rates
                                                    .special_equipment
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    special_handling_rates: {
                                                        ...configForm.special_handling_rates,
                                                        special_equipment:
                                                            parseFloat(
                                                                e.target.value,
                                                            ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Escort Service (per day)</Label>
                                        <Input
                                            type="number"
                                            value={
                                                configForm
                                                    .special_handling_rates
                                                    .escort
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    special_handling_rates: {
                                                        ...configForm.special_handling_rates,
                                                        escort: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Urgent Delivery (one-time)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={
                                                configForm
                                                    .special_handling_rates
                                                    .urgent
                                            }
                                            onChange={(e) =>
                                                setConfigForm({
                                                    ...configForm,
                                                    special_handling_rates: {
                                                        ...configForm.special_handling_rates,
                                                        urgent: parseFloat(
                                                            e.target.value,
                                                        ),
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateConfig}
                            className="bg-orange-600 text-white hover:bg-orange-700"
                        >
                            Update Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pricing Preview Dialog */}
            <Dialog
                open={showPreviewDialog}
                onOpenChange={setShowPreviewDialog}
            >
                <DialogContent className="max-w-2xl border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                            <Calculator className="h-5 w-5 text-orange-600" />
                            Pricing Calculator
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Calculate pricing preview using{' '}
                            {selectedConfig?.config_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pickup Date</Label>
                                <Input
                                    type="date"
                                    value={previewForm.pickup_date}
                                    onChange={(e) =>
                                        setPreviewForm({
                                            ...previewForm,
                                            pickup_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Delivery Date</Label>
                                <Input
                                    type="date"
                                    value={previewForm.delivery_date}
                                    onChange={(e) =>
                                        setPreviewForm({
                                            ...previewForm,
                                            delivery_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cargo Weight</Label>
                                <Input
                                    type="number"
                                    value={previewForm.cargo_weight}
                                    onChange={(e) =>
                                        setPreviewForm({
                                            ...previewForm,
                                            cargo_weight: parseFloat(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Distance (km)</Label>
                                <Input
                                    type="number"
                                    value={previewForm.distance_km}
                                    onChange={(e) =>
                                        setPreviewForm({
                                            ...previewForm,
                                            distance_km: parseFloat(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCalculatePreview}
                            disabled={previewLoading}
                            className="w-full bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                        >
                            {previewLoading
                                ? 'Calculating...'
                                : 'Calculate Pricing'}
                        </Button>

                        {pricingPreview && (
                            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        Pricing Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Base Rate:
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(
                                                    pricingPreview.base_rate,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Distance Rate:
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(
                                                    pricingPreview.distance_rate,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Weight Rate:
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(
                                                    pricingPreview.weight_rate,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Fuel Surcharge:
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(
                                                    pricingPreview.fuel_surcharge,
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between rounded-lg bg-green-100 px-4 py-3 dark:bg-green-900/30">
                                            <span className="text-lg font-semibold text-green-800 dark:text-green-200">
                                                Total Estimated Cost:
                                            </span>
                                            <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                                                {formatCurrency(
                                                    pricingPreview.estimated_cost,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPreviewDialog(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PricingManagement;
