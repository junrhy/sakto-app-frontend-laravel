import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Plus, LayoutGrid, Columns, Columns3, MoreHorizontal, Star, RotateCw, CheckCircle2, Pencil, Edit } from "lucide-react";
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
import { Input } from "@/Components/ui/input";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { PageProps } from '@/types';

interface DashboardType {
    id: number;
    name: string;
    widgets: Widget[];
    column_count?: 1 | 2 | 3;
    is_starred?: boolean;
    is_default?: boolean;
    app: AppType;
}

interface Props extends PageProps {
    dashboards: DashboardType[];
    currentDashboard: DashboardType;
}

// Add this type definition near the top with other interfaces
type AppType = 'retail' | 'fnb' | 'genealogy' | 'contacts' | 'email' | 'lending' | 'payroll' | 'rental-item' | 'sms' | null;

export default function Dashboard({ dashboards: initialDashboards, currentDashboard: initialCurrentDashboard, auth }: Props) {
    const url = usePage().url;
    const appParam = new URLSearchParams(url.split('?')[1]).get('app') as AppType;

    const [dashboards, setDashboards] = useState<DashboardType[]>(initialDashboards);
    const [currentDashboard, setCurrentDashboard] = useState<DashboardType>({
        ...initialCurrentDashboard,
        widgets: initialCurrentDashboard.widgets || []
    });
    const [widgets, setWidgets] = useState<WidgetImport[]>(initialCurrentDashboard.widgets || []);
    const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetTypeImport | null>(null);
    const [columnCount, setColumnCount] = useState<1 | 2 | 3>(currentDashboard.column_count || 2);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [defaultDashboardId, setDefaultDashboardId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [newDashboardName, setNewDashboardName] = useState(currentDashboard.name);

    // At the component level, initialize form
    const form = useForm<{
        type: WidgetTypeImport;
        column: number;
        dashboard_id: number;
    }>({
        type: 'retail_sales' as WidgetTypeImport,
        column: 0,
        dashboard_id: currentDashboard.id
    });

    const getAvailableWidgets = (type: AppType): WidgetTypeImport[] => {
        if (type === 'retail') {
            return ['retail_sales', 'retail_inventory', 'retail_orders'] as WidgetTypeImport[];
        }
        if (type === 'fnb') {
            return ['fnb_tables', 'fnb_kitchen', 'fnb_reservations'] as WidgetTypeImport[];
        }
        if (type === 'genealogy') {
            return ['genealogy_stats'] as unknown as WidgetTypeImport[];
        }
        if (type === 'contacts') {
            return ['contacts'] as unknown as WidgetTypeImport[];
        }
        if (type === 'email') {
            return ['emails_sent'] as unknown as WidgetTypeImport[];
        }
        if (type === 'lending') {
            return ['loan_stats'] as unknown as WidgetTypeImport[];
        }
        if (type === 'payroll') {
            return ['payroll_stats'] as unknown as WidgetTypeImport[];
        }
        if (type === 'rental-item') {
            return ['rental_item_stats'] as unknown as WidgetTypeImport[];
        }
        if (type === 'sms') {
            return ['sms_stats'] as unknown as WidgetTypeImport[];
        }
        return [];
    };

    const availableWidgets = getAvailableWidgets(appParam);

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
                    column: 0,
                    order: widgets.length
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
        switch (columnCount) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-2';
            case 3:
                return 'grid-cols-3';
            default:
                return 'grid-cols-2';
        }
    };

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

    const moveWidgetVertically = (id: number, direction: 'up' | 'down') => {
        const widget = widgets.find(w => w.id === id);
        if (!widget) return;

        // Get widgets in the same column, sorted by order
        const columnWidgets = widgets
            .filter(w => w.column === widget.column)
            .sort((a, b) => a.order - b.order);
        
        const currentIndex = columnWidgets.findIndex(w => w.id === id);
        if (currentIndex === -1) return;

        // Check if move is possible
        if (
            (direction === 'up' && currentIndex === 0) || 
            (direction === 'down' && currentIndex === columnWidgets.length - 1)
        ) {
            return;
        }

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const swapWidget = columnWidgets[newIndex];

        // Create a new array with the swapped positions
        const updatedColumnWidgets = [...columnWidgets];
        updatedColumnWidgets[currentIndex] = swapWidget;
        updatedColumnWidgets[newIndex] = widget;

        // Update the full widgets array with the new order
        const updatedWidgets = widgets.map(w => {
            const updatedWidget = updatedColumnWidgets.find(uw => uw.id === w.id);
            return updatedWidget || w;
        });

        // Optimistically update the UI
        setWidgets(updatedWidgets);
        setCurrentDashboard(prev => ({
            ...prev,
            widgets: updatedWidgets
        }));

        // Make API request
        router.patch(`/widgets/${id}/reorder`, {
            direction
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page: any) => {
                if (page.props.currentDashboard) {
                    setWidgets(page.props.currentDashboard.widgets);
                    setCurrentDashboard(page.props.currentDashboard);
                }
            },
            onError: () => {
                // Revert changes on error
                setWidgets(widgets);
                setCurrentDashboard(prev => ({
                    ...prev,
                    widgets: widgets
                }));
            }
        });
    };

    const renameDashboard = () => {
        router.patch(`/dashboard/${currentDashboard.id}`, {
            name: newDashboardName
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCurrentDashboard(prev => ({
                    ...prev,
                    name: newDashboardName
                }));
                setDashboards(prevDashboards => 
                    prevDashboards.map(dashboard => 
                        dashboard.id === currentDashboard.id 
                            ? { ...dashboard, name: newDashboardName }
                            : dashboard
                    )
                );
                setIsRenameDialogOpen(false); // Close the dialog after renaming
            },
            onError: (errors) => {
                console.error('Failed to rename dashboard:', errors);
                // Optionally show an error message to the user
            }
        });
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // Dropped outside a valid drop zone
        if (!destination) return;

        // No movement
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        const sourceColumn = parseInt(source.droppableId);
        const destinationColumn = parseInt(destination.droppableId);
        const widgetId = parseInt(result.draggableId);

        // Find the widget that was dragged
        const widget = currentDashboard.widgets.find(w => w.id === widgetId);
        if (!widget) return;

        // Update the widget's column and order
        router.patch(`/widgets/${widgetId}`, {
            column: destinationColumn,
            order: destination.index
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Update local state
                const updatedWidgets = [...currentDashboard.widgets];
                const movedWidget = updatedWidgets.find(w => w.id === widgetId);
                if (movedWidget) {
                    movedWidget.column = destinationColumn;
                    // Update order of widgets in the destination column
                    updatedWidgets.forEach(w => {
                        if (w.column === destinationColumn && w.id !== widgetId) {
                            if (destination.index <= w.order) {
                                w.order += 1;
                            }
                        }
                    });
                    movedWidget.order = destination.index;
                }

                setCurrentDashboard(prev => ({
                    ...prev,
                    widgets: updatedWidgets
                }));
                setWidgets(updatedWidgets);
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
            auth={auth}
        >
            <Head title='Dashboard' />
            
            <main className="flex flex-col flex-1">
                <div className="py-0">
                    {/* Dashboard Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Dashboard Switcher */}
                            <Select
                                value={currentDashboard.id.toString()}
                                onValueChange={(value) => {
                                    const dashboardId = parseInt(value);
                                    router.get(`/dashboard/${dashboardId}/widgets`, {
                                        app: appParam
                                    });
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select dashboard" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dashboards
                                        .filter(dashboard => dashboard.app === appParam)
                                        .map((dashboard) => (
                                            <SelectItem 
                                                key={dashboard.id} 
                                                value={dashboard.id.toString()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {dashboard.name}
                                                    {dashboard.is_default && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    )}
                                                    {dashboard.is_starred && (
                                                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>

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
                                                    {type === "retail_sales" ? "Retail Sales" 
                                                    : type === "retail_inventory" ? "Retail Inventory" 
                                                    : type === "retail_orders" ? "Retail Orders" 
                                                    : type === "fnb_tables" ? "F&B Tables" 
                                                    : type === "fnb_kitchen" ? "F&B Kitchen" 
                                                    : type === "fnb_reservations" ? "F&B Reservations"
                                                    : type === "genealogy_stats" ? "Genealogy Stats"
                                                    : (type as string).replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
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

                                    {/* Column layout buttons */}
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
                                </>
                            )}

                            <AlertDialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Rename Dashboard</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Enter a new name for the dashboard:
                                        </AlertDialogDescription>
                                        <Input 
                                            value={newDashboardName} 
                                            onChange={(e) => setNewDashboardName(e.target.value)} 
                                            placeholder="New Dashboard Name" 
                                        />
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setIsRenameDialogOpen(false)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={renameDashboard} className="bg-blue-600 hover:bg-blue-700 text-white">
                                            Rename
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
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent default behavior if necessary
                                    setIsRefreshing(true);
                                    window.location.reload();
                                }}
                                disabled={isRefreshing}
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

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-[40px]">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    {!currentDashboard.is_default && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                router.post(`/dashboard/${currentDashboard.id}/set-default`, {}, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                    onSuccess: () => {
                                                        setDefaultDashboardId(currentDashboard.id);
                                                        setCurrentDashboard(prev => ({
                                                            ...prev,
                                                            is_default: true
                                                        }));
                                                        // Update other dashboards in the list
                                                        setDashboards(prevDashboards => 
                                                            prevDashboards.map(dashboard => ({
                                                                ...dashboard,
                                                                is_default: dashboard.id === currentDashboard.id
                                                            }))
                                                        );
                                                    },
                                                    onError: (errors) => {
                                                        console.error('Failed to set default dashboard:', errors);
                                                    }
                                                });
                                            }}
                                            disabled={defaultDashboardId === currentDashboard.id}
                                        >
                                            <CheckCircle2 className={`h-4 w-4 mr-2 ${
                                                defaultDashboardId === currentDashboard.id ? 'text-green-500' : ''
                                            }`} />
                                            Set as Default
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setIsRenameDialogOpen(true)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Rename Dashboard
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Update the widget grid */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className={`grid ${getColumnClass()} gap-4`}>
                            {[...Array(columnCount)].map((_, colIndex) => (
                                <Droppable droppableId={colIndex.toString()} key={colIndex}>
                                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`space-y-4 ${
                                                isEditMode 
                                                    ? 'p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 min-h-[200px] relative' +
                                                      (snapshot.isDraggingOver ? ' border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : '')
                                                    : ''
                                            }`}
                                        >
                                            {isEditMode && (
                                                <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                    Column {colIndex + 1}
                                                </div>
                                            )}
                                            {currentDashboard.widgets
                                                .filter((widget: WidgetImport) => {
                                                    // Filter widgets based on app parameter
                                                    if (appParam === 'retail') {
                                                        return ['retail_sales', 'retail_inventory', 'retail_orders'].includes(widget.type);
                                                    }
                                                    if (appParam === 'fnb') {
                                                        return ['fnb_tables', 'fnb_kitchen', 'fnb_reservations'].includes(widget.type);
                                                    }
                                                    if (appParam === 'genealogy') {
                                                        return ['genealogy_stats'].includes(widget.type);
                                                    }
                                                    if (appParam === 'contacts') {
                                                        return ['contacts'].includes(widget.type);
                                                    }
                                                    if (appParam === 'email') {
                                                        return ['emails_sent'].includes(widget.type);
                                                    }
                                                    if (appParam === 'lending') {
                                                        return ['loan_stats'].includes(widget.type);
                                                    }
                                                    if (appParam === 'payroll') {
                                                        return ['payroll_stats'].includes(widget.type);
                                                    }
                                                    if (appParam === 'rental-item') {
                                                        return ['rental_item_stats'].includes(widget.type);
                                                    }
                                                    if (appParam === 'sms') {
                                                        return ['sms_stats'].includes(widget.type);
                                                    }
                                                    return false;
                                                })
                                                .filter((widget: WidgetImport) => widget.column === colIndex)
                                                .sort((a, b) => a.order - b.order)
                                                .map((widget: WidgetImport, index: number, filteredWidgets: WidgetImport[]) => (
                                                    <Draggable
                                                        key={widget.id}
                                                        draggableId={widget.id.toString()}
                                                        index={index}
                                                        isDragDisabled={!isEditMode}
                                                    >
                                                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                                                            >
                                                                <WidgetComponent 
                                                                    key={widget.id} 
                                                                    widget={widget} 
                                                                    onRemove={removeWidget}
                                                                    onMoveLeft={() => moveWidget(widget.id, 'left')}
                                                                    onMoveRight={() => moveWidget(widget.id, 'right')}
                                                                    onMoveUp={() => moveWidgetVertically(widget.id, 'up')}
                                                                    onMoveDown={() => moveWidgetVertically(widget.id, 'down')}
                                                                    isLeftmost={widget.column === 0}
                                                                    isRightmost={widget.column === columnCount - 1}
                                                                    isTopmost={index === 0}
                                                                    isBottommost={index === filteredWidgets.length - 1}
                                                                    isEditMode={isEditMode}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
