import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Plus, LayoutGrid, Columns, Columns3, Trash2, MoreHorizontal, Star, RotateCw, CheckCircle2, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { WidgetComponent } from "@/Components/widgets/WidgetComponent";
import { Widget, Widget as WidgetImport, WidgetType as WidgetTypeImport } from '@/types';
import { useForm, router } from '@inertiajs/react';

interface DashboardType {
    id: number;
    name: string;
    widgets: Widget[];
    column_count?: 1 | 2 | 3;
    is_starred?: boolean;
}

const sampleSalesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
];

const sampleInventoryData = [
    { category: 'Electronics', stock: 856 },
    { category: 'Clothing', stock: 432 },
    { category: 'Books', stock: 234 },
    { category: 'Sports', stock: 389 },
    { category: 'Home', stock: 178 },
];

const sampleOrdersData = [
    { id: '1234', customer: 'John Doe', status: 'pending', amount: 234.50, time: '2 mins ago' },
    { id: '1235', customer: 'Jane Smith', status: 'processing', amount: 129.00, time: '15 mins ago' },
    { id: '1236', customer: 'Bob Johnson', status: 'pending', amount: 445.80, time: '45 mins ago' },
    { id: '1237', customer: 'Alice Brown', status: 'processing', amount: 55.20, time: '1 hour ago' },
];

const sampleTableData = [
    { tableNumber: '1', seats: 4, status: 'occupied', timeRemaining: '45 min', server: 'John D.' },
    { tableNumber: '2', seats: 2, status: 'available', timeRemaining: null, server: null },
    { tableNumber: '3', seats: 6, status: 'reserved', timeRemaining: null, server: null },
    { tableNumber: '4', seats: 4, status: 'occupied', timeRemaining: '15 min', server: 'Sarah M.' },
    { tableNumber: '5', seats: 8, status: 'cleaning', timeRemaining: null, server: null },
    { tableNumber: '6', seats: 2, status: 'occupied', timeRemaining: '90 min', server: 'Mike R.' },
];

interface Props {
    dashboards: DashboardType[];
    currentDashboard: DashboardType;
}

interface WidgetResponse {
    widget: Widget;
}

interface PageProps {
    widget?: {
        id: number;
        type: WidgetTypeImport;
        column: number;
    };
}

export default function Dashboard({ dashboards: initialDashboards, currentDashboard: initialCurrentDashboard }: Props) {
    const [dashboards, setDashboards] = useState<DashboardType[]>(initialDashboards);
    const [currentDashboard, setCurrentDashboard] = useState<DashboardType>(initialCurrentDashboard);
    const [widgets, setWidgets] = useState<WidgetImport[]>(currentDashboard.widgets || []);
    const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetTypeImport | null>(null);
    const [columnCount, setColumnCount] = useState<1 | 2 | 3>(currentDashboard.column_count || 2);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [defaultDashboardId, setDefaultDashboardId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // At the component level, initialize form
    const form = useForm<{
        type: WidgetTypeImport;
        column: number;
        dashboard_id: number;
    }>({
        type: 'sales' as WidgetTypeImport,
        column: 0,
        dashboard_id: currentDashboard.id
    });

    useEffect(() => {
        // Only fetch widgets if needed
        if (!currentDashboard.widgets || currentDashboard.widgets.length === 0) {
            fetchWidgets();
        } else {
            setWidgets(currentDashboard.widgets);
        }
        setLoading(false);
    }, [currentDashboard]);

    const fetchWidgets = () => {
        return new Promise<void>((resolve) => {
            // Initialize with empty array or some default widgets
            setWidgets([]);
            resolve();
        });
    };

    const availableWidgets = [
        'sales',
        'inventory',
        'orders',
        'tables',
        'kitchen',
        'reservations'
    ] as const satisfies WidgetTypeImport[];

    // Modify the addWidget function to use the form from component level
    const addWidget = (type: WidgetTypeImport) => {
        form.setData({
            type: type,
            column: 0,
            dashboard_id: currentDashboard.id
        });

        if (!type) {
            return;
        }

        form.post('/widgets', {
            preserveScroll: true,
            preserveState: true,
            replace: false,
            onSuccess: (response: any) => {
                const newWidget: Widget = {
                    id: response.props.currentDashboard.widgets.slice(-1)[0].id,
                    type: type,
                    column: 0
                };
                
                setWidgets(prevWidgets => [...prevWidgets, newWidget]);
                
                setCurrentDashboard((prevDashboard: DashboardType) => ({
                    ...prevDashboard,
                    widgets: [...(prevDashboard.widgets || []), newWidget]
                }));
                
                setSelectedWidgetType(null);
            },
            onError: (errors) => {
                // Consider adding user-facing error handling here
            }
        });
    };

    const removeWidget = (id: number) => {
        router.delete(`/widgets/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Update local state after successful deletion
                setWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== id));
                
                // Update dashboard state
                setCurrentDashboard((prev: DashboardType) => ({
                    ...prev,
                    widgets: prev.widgets.filter((widget: Widget) => widget.id !== id)
                }));
            },
            onError: (errors) => {
                console.error('Failed to delete widget:', errors);
                // Optionally show an error message to the user
            }
        });
    };

    const moveWidget = (id: number, direction: 'left' | 'right') => {
        const widget = widgets.find(w => w.id === id);
        if (!widget) return;
        
        const newColumn = direction === 'left' 
            ? Math.max(0, widget.column - 1)
            : Math.min(columnCount - 1, widget.column + 1);

        if (newColumn === widget.column) return;

        const updatedWidgets = widgets.map(w => 
            w.id === id ? { ...w, column: newColumn } : w
        );
        
        setWidgets(updatedWidgets);
        
        setCurrentDashboard((prev: DashboardType) => ({
            ...prev,
            widgets: prev.widgets.map((w: Widget) => 
                w.id === id ? { ...w, column: newColumn } : w
            )
        }));

        router.patch(`/widgets/${id}`, {
            column: newColumn
        }, {
            preserveScroll: true,
            preserveState: true,
            onError: (errors) => {
                // Revert both states if the request fails
                setWidgets(currentWidgets =>
                    currentWidgets.map((w: Widget) => 
                        w.id === id ? { ...w, column: widget.column } : w
                    )
                );
                
                setCurrentDashboard((prev: DashboardType) => ({
                    ...prev,
                    widgets: prev.widgets.map((w: Widget) => 
                        w.id === id ? { ...w, column: widget.column } : w
                    )
                }));
            }
        });
    };

    const getColumnClass = () => {
        return `grid-cols-${columnCount} gap-4`;
    };

    const deleteDashboard = () => {
        if (dashboards.length <= 1) {
            return; // Prevent deleting the last dashboard
        }
        
        const updatedDashboards = dashboards.filter(d => d.id !== currentDashboard.id);
        setDashboards(updatedDashboards);
        setCurrentDashboard(updatedDashboards[0]);
        setIsDeleteDialogOpen(false);
    };

    // Add this function near your other utility functions
    const wouldHideWidgets = (newColumnCount: number) => {
        // Check if widgets array exists and has items
        if (!widgets || widgets.length === 0) {
            return false;
        }

        // Add null check when checking columns
        return widgets.some(widget => 
            widget && typeof widget.column !== 'undefined' && widget.column >= newColumnCount
        );
    };

    const updateColumnCount = (newColumnCount: 1 | 2 | 3) => {
        if (wouldHideWidgets(newColumnCount)) {
            return;
        }

        // Optimistically update the UI
        setColumnCount(newColumnCount);
        
        // Make the API request
        router.patch(`/dashboard/${currentDashboard.id}`, {
            column_count: newColumnCount
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Update the current dashboard in state
                setCurrentDashboard((prev: DashboardType) => ({
                    ...prev,
                    column_count: newColumnCount
                }));
                
                // Update the dashboard in the dashboards array
                setDashboards(prevDashboards => 
                    prevDashboards.map(dashboard => 
                        dashboard.id === currentDashboard.id 
                            ? { ...dashboard, column_count: newColumnCount }
                            : dashboard
                    )
                );
            },
            onError: (errors) => {
                // Revert the optimistic update if the request fails
                setColumnCount(currentDashboard.column_count || 2);
                console.error('Failed to update column count:', errors);
                // Optionally show an error message to the user
            }
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {currentDashboard.name}
                </h2>
            }
        >
            <Head title='Dashboard' />
            
            <main className="flex flex-col flex-1">
                <div className="py-0">
                    {/* Dashboard Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Widget selection - Only show in edit mode */}
                            {isEditMode && (
                                <>
                                    <Select 
                                        value={selectedWidgetType || ""} 
                                        onValueChange={(value: string) => {
                                            if (availableWidgets.includes(value as WidgetTypeImport)) {
                                                setSelectedWidgetType(value as WidgetTypeImport);
                                                form.setData(prevData => ({
                                                    ...prevData,
                                                    type: value as WidgetTypeImport
                                                }));
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select widget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableWidgets.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button 
                                        onClick={() => {
                                            if (selectedWidgetType) {
                                                addWidget(selectedWidgetType);
                                            }
                                        }}
                                        disabled={!selectedWidgetType} 
                                        variant="default"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </>
                            )}

                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{currentDashboard.name}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={deleteDashboard}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    // Make API request to update is_starred status
                                    router.patch(`/dashboard/${currentDashboard.id}`, {
                                        is_starred: !currentDashboard.is_starred
                                    }, {
                                        preserveScroll: true,
                                        preserveState: true,
                                        onSuccess: () => {
                                            // Update local state after successful API call
                                            const updatedDashboards = dashboards.map(d => ({
                                                ...d,
                                                is_starred: d.id === currentDashboard.id ? !d.is_starred : d.is_starred
                                            }));
                                            setDashboards(updatedDashboards);
                                            setCurrentDashboard({
                                                ...currentDashboard,
                                                is_starred: !currentDashboard.is_starred
                                            });
                                        },
                                        onError: (errors) => {
                                            console.error('Failed to update dashboard star status:', errors);
                                            // Optionally show an error message to the user
                                        }
                                    });
                                }}
                                className={`${
                                    currentDashboard.is_starred 
                                        ? 'text-yellow-500 hover:text-yellow-600' 
                                        : 'text-gray-400 hover:text-gray-500'
                                }`}
                            >
                                <Star className="h-4 w-4" fill={currentDashboard.is_starred ? "currentColor" : "none"} />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsRefreshing(true);
                                    fetchWidgets().finally(() => {
                                        setTimeout(() => {
                                            setIsRefreshing(false);
                                        }, 1000); // Adjust timing as needed
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <RotateCw 
                                    className={`h-4 w-4 ${
                                        isRefreshing ? 'animate-spin' : ''
                                    }`}
                                />
                            </Button>

                            {/* Add Edit button */}
                            <Button
                                variant={isEditMode ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setIsEditMode(!isEditMode)}
                                className="gap-2"
                            >
                                <Pencil className="h-4 w-4" />
                                {isEditMode ? 'Done' : 'Edit'}
                            </Button>

                            {/* Grid layout selection - Only show in edit mode */}
                            {isEditMode && (
                                <div className="bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                                    <Button 
                                        onClick={() => updateColumnCount(1)} 
                                        variant={columnCount === 1 ? "default" : "ghost"} 
                                        size="sm"
                                        disabled={wouldHideWidgets(1)}
                                        title={wouldHideWidgets(1) ? "Move widgets to column 0 first" : "Single column layout"}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        onClick={() => updateColumnCount(2)} 
                                        variant={columnCount === 2 ? "default" : "ghost"} 
                                        size="sm"
                                        disabled={wouldHideWidgets(2)}
                                        title={wouldHideWidgets(2) ? "Move widgets to columns 0-1 first" : "Two column layout"}
                                    >
                                        <Columns className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        onClick={() => updateColumnCount(3)} 
                                        variant={columnCount === 3 ? "default" : "ghost"} 
                                        size="sm"
                                    >
                                        <Columns3 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-[40px]">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDefaultDashboardId(currentDashboard.id);
                                            // You might want to persist this to the backend
                                            // axios.post('/api/dashboards/set-default', { dashboardId: currentDashboard.id });
                                        }}
                                        disabled={defaultDashboardId === currentDashboard.id}
                                    >
                                        <CheckCircle2 className={`h-4 w-4 mr-2 ${
                                            defaultDashboardId === currentDashboard.id ? 'text-green-500' : ''
                                        }`} />
                                        Use as Default
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                        disabled={dashboards.length <= 1}
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Dashboard
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Update the widget grid */}
                    <div className={`grid ${getColumnClass()} p-4`}>
                        {[...Array(columnCount)].map((_, colIndex) => (
                            <div key={colIndex} className="space-y-4">
                                {currentDashboard.widgets
                                    .filter((widget: WidgetImport) => widget.column === colIndex)
                                    .map((widget: WidgetImport) => (
                                        <WidgetComponent 
                                            key={widget.id} 
                                            widget={widget} 
                                            onRemove={removeWidget}
                                            onMoveLeft={() => moveWidget(widget.id, 'left')}
                                            onMoveRight={() => moveWidget(widget.id, 'right')}
                                            isLeftmost={widget.column === 0}
                                            isRightmost={widget.column === columnCount - 1}
                                            isEditMode={isEditMode}
                                        />
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
