import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    HandymanInventoryItem,
    HandymanInventoryTransaction,
    HandymanTask,
    HandymanTaskOverview,
    HandymanTechnician,
    HandymanWorkOrder,
} from '@/types/handyman';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ClipboardList, Hammer, PackageSearch, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FieldWorkOrderTracker } from './components/FieldWorkOrderTracker';
import { InventoryItemPayload } from './components/InventoryItemFormDialog';
import { InventoryTransactionPayload } from './components/InventoryTransactionFormDialog';
import { HandymanTaskRequestPayload } from './components/TaskFormDialog';
import { TechnicianPayload } from './components/TechnicianFormDialog';
import { TechnicianSchedulingBoard } from './components/TechnicianSchedulingBoard';
import { ToolInventoryManager } from './components/ToolInventoryManager';
import { HandymanWorkOrderRequestPayload } from './components/WorkOrderFormDialog';

interface HandymanProps extends PageProps {
    technicians: HandymanTechnician[];
    tasks: HandymanTask[];
    taskOverview: HandymanTaskOverview[];
    workOrders: HandymanWorkOrder[];
    workOrdersPagination?: Record<string, unknown> | null;
    inventory: HandymanInventoryItem[];
    inventoryPagination?: Record<string, unknown> | null;
    lowStock: HandymanInventoryItem[];
    inventoryTransactions: HandymanInventoryTransaction[];
    transactionsPagination?: Record<string, unknown> | null;
    appCurrency?: Record<string, unknown>;
    error?: string;
}

const tabOptions = [
    {
        value: 'scheduling',
        label: 'Technician Scheduling Board',
        icon: Wrench,
    },
    {
        value: 'work-orders',
        label: 'Field Work Order Tracker',
        icon: ClipboardList,
    },
    {
        value: 'inventory',
        label: 'Tool & Consumables Inventory',
        icon: PackageSearch,
    },
];

export default function Handyman({
    auth,
    technicians,
    tasks,
    taskOverview,
    workOrders,
    inventory,
    lowStock,
    inventoryTransactions,
    error,
}: HandymanProps) {
    const [activeTab, setActiveTab] = useState('scheduling');
    const [technicianList, setTechnicianList] =
        useState<HandymanTechnician[]>(technicians);
    const [taskList, setTaskList] = useState<HandymanTask[]>(tasks);
    const [overviewList, setOverviewList] =
        useState<HandymanTaskOverview[]>(taskOverview);
    const [taskSubmitting, setTaskSubmitting] = useState(false);
    const [workOrderList, setWorkOrderList] =
        useState<HandymanWorkOrder[]>(workOrders);
    const [workOrderSubmitting, setWorkOrderSubmitting] = useState(false);
    const [inventoryList, setInventoryList] =
        useState<HandymanInventoryItem[]>(inventory);
    const [lowStockList, setLowStockList] =
        useState<HandymanInventoryItem[]>(lowStock);
    const [transactionList, setTransactionList] = useState<
        HandymanInventoryTransaction[]
    >(inventoryTransactions);
    const [inventorySubmitting, setInventorySubmitting] = useState(false);
    const [transactionSubmitting, setTransactionSubmitting] = useState(false);
    const [technicianSubmitting, setTechnicianSubmitting] = useState(false);

    const clientIdentifier = auth?.user?.identifier;

    useEffect(() => {
        setTechnicianList(technicians);
    }, [technicians]);

    useEffect(() => {
        setTaskList(tasks);
    }, [tasks]);

    useEffect(() => {
        setOverviewList(taskOverview);
    }, [taskOverview]);

    useEffect(() => {
        setWorkOrderList(workOrders);
    }, [workOrders]);

    useEffect(() => {
        setInventoryList(inventory);
    }, [inventory]);

    useEffect(() => {
        setLowStockList(lowStock);
    }, [lowStock]);

    useEffect(() => {
        setTransactionList(inventoryTransactions);
    }, [inventoryTransactions]);

    useEffect(() => {
        if (error) {
            toast.error(
                'Unable to load handyman data. Please try again later.',
            );
        }
    }, [error]);

    const refreshTechnicians = async () => {
        if (!clientIdentifier) {
            return;
        }
        try {
            const response = await axios.get('/handyman/technicians', {
                params: { client_identifier: clientIdentifier },
            });
            setTechnicianList(response.data?.data ?? []);
        } catch (refreshError) {
            console.error('Failed to refresh technician list', refreshError);
            toast.error('Failed to refresh technicians');
        }
    };

    const technicianSummary = useMemo(
        () => ({
            total: technicianList.length,
            available: technicianList.filter(
                (tech) => tech.status === 'available',
            ).length,
        }),
        [technicianList],
    );

    const refreshHandymanData = async () => {
        if (!clientIdentifier) {
            return;
        }
        try {
            const [technicianResponse, taskResponse, overviewResponse] =
                await Promise.all([
                    axios.get('/handyman/technicians', {
                        params: { client_identifier: clientIdentifier },
                    }),
                    axios.get('/handyman/tasks', {
                        params: { client_identifier: clientIdentifier },
                    }),
                    axios.get('/handyman/tasks-overview', {
                        params: { client_identifier: clientIdentifier },
                    }),
                ]);

            setTechnicianList(technicianResponse.data?.data ?? []);
            setTaskList(taskResponse.data?.data ?? []);
            setOverviewList(overviewResponse.data?.data ?? []);
        } catch (refreshError) {
            console.error('Failed to refresh handyman data', refreshError);
            toast.error('Failed to refresh scheduling data');
        }
    };

    const refreshWorkOrders = async () => {
        if (!clientIdentifier) {
            return;
        }
        try {
            const response = await axios.get('/handyman/work-orders', {
                params: { client_identifier: clientIdentifier },
            });
            const paginated = response.data?.data;
            const items: HandymanWorkOrder[] =
                paginated?.data ?? paginated ?? [];
            setWorkOrderList(items);
        } catch (refreshError) {
            console.error('Failed to refresh work orders', refreshError);
            toast.error('Failed to refresh work orders');
        }
    };

    const refreshInventory = async () => {
        if (!clientIdentifier) {
            return;
        }
        try {
            const [inventoryResponse, lowStockResponse, transactionsResponse] =
                await Promise.all([
                    axios.get('/handyman/inventory', {
                        params: { client_identifier: clientIdentifier },
                    }),
                    axios.get('/handyman/inventory/low-stock', {
                        params: { client_identifier: clientIdentifier },
                    }),
                    axios.get('/handyman/inventory-transactions', {
                        params: { client_identifier: clientIdentifier },
                    }),
                ]);

            const inventoryData = inventoryResponse.data?.data;
            const inventoryRecords: HandymanInventoryItem[] =
                inventoryData?.data ?? inventoryData ?? [];
            setInventoryList(inventoryRecords);

            setLowStockList(lowStockResponse.data?.data ?? []);

            const transactionData = transactionsResponse.data?.data;
            const transactionsRecords: HandymanInventoryTransaction[] =
                transactionData?.data ?? transactionData ?? [];
            setTransactionList(transactionsRecords);
        } catch (refreshError) {
            console.error('Failed to refresh inventory data', refreshError);
            toast.error('Failed to refresh inventory data');
        }
    };

    const createTask = async (payload: HandymanTaskRequestPayload) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setTaskSubmitting(true);
            await axios.post('/handyman/tasks', {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Task created successfully');
            await refreshHandymanData();
        } catch (createError) {
            console.error('Failed to create task', createError);
            const message = axios.isAxiosError(createError)
                ? ((createError.response?.data?.message as string) ??
                  'Failed to create task')
                : 'Failed to create task';
            toast.error(message);
            throw new Error(message);
        } finally {
            setTaskSubmitting(false);
        }
    };

    const createTechnician = async (payload: TechnicianPayload) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setTechnicianSubmitting(true);
            await axios.post('/handyman/technicians', {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Technician added successfully');
            await refreshTechnicians();
        } catch (createError) {
            console.error('Failed to create technician', createError);
            const message = axios.isAxiosError(createError)
                ? ((createError.response?.data?.message as string) ??
                  'Failed to create technician')
                : 'Failed to create technician';
            toast.error(message);
            throw new Error(message);
        } finally {
            setTechnicianSubmitting(false);
        }
    };

    const updateTechnician = async (
        technicianId: number,
        payload: TechnicianPayload,
    ) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setTechnicianSubmitting(true);
            await axios.put(`/handyman/technicians/${technicianId}`, {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Technician updated successfully');
            await refreshTechnicians();
        } catch (updateError) {
            console.error('Failed to update technician', updateError);
            const message = axios.isAxiosError(updateError)
                ? ((updateError.response?.data?.message as string) ??
                  'Failed to update technician')
                : 'Failed to update technician';
            toast.error(message);
            throw new Error(message);
        } finally {
            setTechnicianSubmitting(false);
        }
    };

    const deleteTechnician = async (technicianId: number) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setTechnicianSubmitting(true);
            await axios.delete(`/handyman/technicians/${technicianId}`, {
                data: { client_identifier: clientIdentifier },
            });
            toast.success('Technician removed');
            await refreshTechnicians();
        } catch (deleteError) {
            console.error('Failed to delete technician', deleteError);
            const message = axios.isAxiosError(deleteError)
                ? ((deleteError.response?.data?.message as string) ??
                  'Failed to delete technician')
                : 'Failed to delete technician';
            toast.error(message);
            throw new Error(message);
        } finally {
            setTechnicianSubmitting(false);
        }
    };

    const updateTask = async (
        taskId: number,
        payload: HandymanTaskRequestPayload,
    ) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setTaskSubmitting(true);
            await axios.put(`/handyman/tasks/${taskId}`, {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Task updated successfully');
            await refreshHandymanData();
        } catch (updateError) {
            console.error('Failed to update task', updateError);
            const message = axios.isAxiosError(updateError)
                ? ((updateError.response?.data?.message as string) ??
                  'Failed to update task')
                : 'Failed to update task';
            toast.error(message);
            throw new Error(message);
        } finally {
            setTaskSubmitting(false);
        }
    };

    const createWorkOrder = async (
        payload: HandymanWorkOrderRequestPayload,
    ) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setWorkOrderSubmitting(true);
            await axios.post('/handyman/work-orders', {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Work order created successfully');
            await refreshWorkOrders();
        } catch (createError) {
            console.error('Failed to create work order', createError);
            const message = axios.isAxiosError(createError)
                ? ((createError.response?.data?.message as string) ??
                  'Failed to create work order')
                : 'Failed to create work order';
            toast.error(message);
            throw new Error(message);
        } finally {
            setWorkOrderSubmitting(false);
        }
    };

    const updateWorkOrder = async (
        workOrderId: number,
        payload: HandymanWorkOrderRequestPayload,
    ) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setWorkOrderSubmitting(true);
            await axios.put(`/handyman/work-orders/${workOrderId}`, {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Work order updated successfully');
            await refreshWorkOrders();
        } catch (updateError) {
            console.error('Failed to update work order', updateError);
            const message = axios.isAxiosError(updateError)
                ? ((updateError.response?.data?.message as string) ??
                  'Failed to update work order')
                : 'Failed to update work order';
            toast.error(message);
            throw new Error(message);
        } finally {
            setWorkOrderSubmitting(false);
        }
    };

    const createInventoryItem = async (payload: InventoryItemPayload) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setInventorySubmitting(true);
            await axios.post('/handyman/inventory', {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Inventory item created successfully');
            await refreshInventory();
        } catch (createError) {
            console.error('Failed to create inventory item', createError);
            const message = axios.isAxiosError(createError)
                ? ((createError.response?.data?.message as string) ??
                  'Failed to create inventory item')
                : 'Failed to create inventory item';
            toast.error(message);
            throw new Error(message);
        } finally {
            setInventorySubmitting(false);
        }
    };

    const updateInventoryItem = async (
        itemId: number,
        payload: InventoryItemPayload,
    ) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setInventorySubmitting(true);
            await axios.put(`/handyman/inventory/${itemId}`, {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Inventory item updated successfully');
            await refreshInventory();
        } catch (updateError) {
            console.error('Failed to update inventory item', updateError);
            const message = axios.isAxiosError(updateError)
                ? ((updateError.response?.data?.message as string) ??
                  'Failed to update inventory item')
                : 'Failed to update inventory item';
            toast.error(message);
            throw new Error(message);
        } finally {
            setInventorySubmitting(false);
        }
    };

    const deleteInventoryItem = async (itemId: number) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setInventorySubmitting(true);
            await axios.delete(`/handyman/inventory/${itemId}`, {
                data: { client_identifier: clientIdentifier },
            });
            toast.success('Inventory item deleted');
            await refreshInventory();
        } catch (deleteError) {
            console.error('Failed to delete inventory item', deleteError);
            const message = axios.isAxiosError(deleteError)
                ? ((deleteError.response?.data?.message as string) ??
                  'Failed to delete inventory item')
                : 'Failed to delete inventory item';
            toast.error(message);
            throw new Error(message);
        } finally {
            setInventorySubmitting(false);
        }
    };

    const recordInventoryTransaction = async (
        payload: InventoryTransactionPayload,
    ) => {
        if (!clientIdentifier) {
            throw new Error('Missing client identifier');
        }
        try {
            setTransactionSubmitting(true);
            await axios.post('/handyman/inventory-transactions', {
                ...payload,
                client_identifier: clientIdentifier,
            });
            toast.success('Inventory movement recorded');
            await refreshInventory();
        } catch (transactionError) {
            console.error(
                'Failed to record inventory transaction',
                transactionError,
            );
            const message = axios.isAxiosError(transactionError)
                ? ((transactionError.response?.data?.message as string) ??
                  'Failed to record inventory transaction')
                : 'Failed to record inventory transaction';
            toast.error(message);
            throw new Error(message);
        } finally {
            setTransactionSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                            <Hammer className="h-7 w-7 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Handyman Operations
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Coordinate technicians, field work orders, and
                                equipment readiness in one place.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm">
                            {technicianSummary.available} of{' '}
                            {technicianSummary.total} technicians available
                        </Badge>
                    </div>
                </div>
            }
        >
            <Head title="Handyman Operations" />

            <div className="space-y-6 p-6">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <TabsList className="hidden overflow-x-auto md:flex">
                            {tabOptions.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center gap-2"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <Select value={activeTab} onValueChange={setActiveTab}>
                            <SelectTrigger className="w-full md:hidden">
                                <SelectValue>
                                    {
                                        tabOptions.find(
                                            (tab) => tab.value === activeTab,
                                        )?.label
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {tabOptions.map((tab) => (
                                    <SelectItem
                                        key={tab.value}
                                        value={tab.value}
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4" />
                                            <span>{tab.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <TabsContent value="scheduling" className="space-y-6">
                        <TechnicianSchedulingBoard
                            technicians={technicianList}
                            tasks={taskList}
                            overview={overviewList}
                            onCreateTask={createTask}
                            onUpdateTask={updateTask}
                            onCreateTechnician={createTechnician}
                            onUpdateTechnician={updateTechnician}
                            onDeleteTechnician={deleteTechnician}
                            submitting={taskSubmitting}
                            technicianSubmitting={technicianSubmitting}
                        />
                    </TabsContent>

                    <TabsContent value="work-orders" className="space-y-6">
                        <FieldWorkOrderTracker
                            workOrders={workOrderList}
                            technicians={technicianList}
                            onCreateWorkOrder={createWorkOrder}
                            onUpdateWorkOrder={updateWorkOrder}
                            submitting={workOrderSubmitting}
                        />
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-6">
                        <ToolInventoryManager
                            items={inventoryList}
                            lowStock={lowStockList}
                            transactions={transactionList}
                            technicians={technicianList}
                            onCreateItem={createInventoryItem}
                            onUpdateItem={updateInventoryItem}
                            onDeleteItem={deleteInventoryItem}
                            onRecordTransaction={recordInventoryTransaction}
                            submittingItem={inventorySubmitting}
                            submittingTransaction={transactionSubmitting}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
