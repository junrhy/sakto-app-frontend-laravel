import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, X, LayoutGrid, Columns, Columns3, ChevronLeft, ChevronRight, PlusCircle, Trash2, MoreHorizontal, Star, RotateCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
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
import { ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { WidgetComponent } from "@/Components/widgets/WidgetComponent";
import { Widget as WidgetImport, WidgetType as WidgetTypeImport } from '@/types';

// Remove or comment out these local declarations since we're using the imported types
// type WidgetType = "sales" | "inventory" | "orders" | "tables" | "kitchen" | "reservations";
// interface Widget {
//   id: number;
//   type: WidgetType;
//   column: number;
// }

interface Dashboard {
  id: number;
  name: string;
  widgets: WidgetImport[];
  favorite?: boolean;
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

export default function Dashboard() {
    const [dashboards, setDashboards] = useState<Dashboard[]>([
        { id: 1, name: "Main Dashboard", widgets: [], favorite: false },
    ]);
    const [currentDashboard, setCurrentDashboard] = useState<Dashboard>(dashboards[0]);
    const [newDashboardName, setNewDashboardName] = useState("");
    const [widgets, setWidgets] = useState<WidgetImport[]>([]);
    const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetTypeImport | null>(null);
    const [columnCount, setColumnCount] = useState<1 | 2 | 3>(2);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchWidgets();
        setLoading(false);
    }, [currentDashboard]);

    const createNewDashboard = () => {
        if (newDashboardName.trim()) {
            const newDashboard: Dashboard = {
                id: Date.now(),
                name: newDashboardName,
                widgets: []
            };
            setDashboards([...dashboards, newDashboard]);
            setCurrentDashboard(newDashboard);
            setNewDashboardName("");
        }
    };

    const fetchWidgets = () => {
        return new Promise<void>((resolve) => {
            // Initialize with empty array or some default widgets
            setWidgets([]);
            resolve();
        });
    };

    const availableWidgets: WidgetTypeImport[] = [
        'sales',
        'inventory',
        'orders',
        'tables',
        'kitchen',
        'reservations'
    ];

    const addWidget = (type: WidgetTypeImport) => {
        if (selectedWidgetType) {
            const newWidget: WidgetImport = {
                id: Date.now(),
                type: selectedWidgetType,
                column: 0,
            };
            setWidgets([...widgets, newWidget]);
            setSelectedWidgetType(null);
        }
    };

    const removeWidget = (id: number) => {
        setWidgets(widgets.filter(widget => widget.id !== id));
    };

    const moveWidget = (id: number, direction: 'left' | 'right') => {
        const updatedWidgets = widgets.map(widget => {
            if (widget.id === id) {
                const newColumn = direction === 'left' 
                    ? Math.max(0, widget.column - 1)
                    : Math.min(columnCount - 1, widget.column + 1);
                return { ...widget, column: newColumn };
            }
            return widget;
        });
        setWidgets(updatedWidgets);
    };

    const getColumnClass = () => {
        switch (columnCount) {
        case 1:
            return 'grid-cols-1';
        case 2:
            return 'grid-cols-1 lg:grid-cols-[1fr,2fr]';
        case 3:
            return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        default:
            return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
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

    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />
            
            <main className="flex flex-col min-h-screen">
                <div className="flex-grow">
                    <div className="w-full max-w-7xl mx-auto h-full">
                        {/* Dashboard Controls Bar */}
                        <div className="bg-gray-50 dark:bg-gray-800/80 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Select 
                                        value={selectedWidgetType || ""} 
                                        onValueChange={(value: string) => setSelectedWidgetType(value as WidgetTypeImport)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select widget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sales">Sales Overview</SelectItem>
                                            <SelectItem value="inventory">Inventory Status</SelectItem>
                                            <SelectItem value="orders">Recent Orders</SelectItem>
                                            <SelectItem value="tables">Tables Status</SelectItem>
                                            <SelectItem value="kitchen">Kitchen Orders</SelectItem>
                                            <SelectItem value="reservations">Reservations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button 
                                        onClick={(e) => addWidget(selectedWidgetType!)}
                                        disabled={!selectedWidgetType} 
                                        variant="default"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>

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
                                            const updatedDashboards = dashboards.map(d => ({
                                                ...d,
                                                favorite: d.id === currentDashboard.id ? !d.favorite : d.favorite
                                            }));
                                            setDashboards(updatedDashboards);
                                            setCurrentDashboard({
                                                ...currentDashboard,
                                                favorite: !currentDashboard.favorite
                                            });
                                        }}
                                        className={`${
                                            currentDashboard.favorite 
                                                ? 'text-yellow-500 hover:text-yellow-600' 
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        <Star className="h-4 w-4" fill={currentDashboard.favorite ? "currentColor" : "none"} />
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

                                    <div className="bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                                        <Button onClick={() => setColumnCount(1)} variant={columnCount === 1 ? "default" : "ghost"} size="sm">
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => setColumnCount(2)} variant={columnCount === 2 ? "default" : "ghost"} size="sm">
                                            <Columns className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => setColumnCount(3)} variant={columnCount === 3 ? "default" : "ghost"} size="sm">
                                            <Columns3 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-[40px]">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px]">
                                            <DropdownMenuItem disabled className="opacity-50 cursor-default">
                                                {currentDashboard.name}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {dashboards
                                                .filter(dashboard => dashboard.id !== currentDashboard.id)
                                                .map(dashboard => (
                                                    <DropdownMenuItem
                                                        key={dashboard.id}
                                                        onClick={() => setCurrentDashboard(dashboard)}
                                                    >
                                                        {dashboard.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            <DropdownMenuSeparator />
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <PlusCircle className="h-4 w-4 mr-2" />
                                                        New Dashboard
                                                    </DropdownMenuItem>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Create New Dashboard</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 pt-4">
                                                        <Input
                                                            placeholder="Dashboard name"
                                                            value={newDashboardName}
                                                            onChange={(e) => setNewDashboardName(e.target.value)}
                                                        />
                                                        <Button 
                                                            onClick={createNewDashboard}
                                                            disabled={!newDashboardName.trim()}
                                                            className="w-full"
                                                        >
                                                            Create Dashboard
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
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
                        </div>

                        {/* Widget Grid remains the same */}
                        <div className={`w-full grid gap-8 min-h-[500px] ${getColumnClass()}`}>
                            {Array.from({ length: columnCount }).map((_, columnIndex) => (
                            <div key={columnIndex} className="flex flex-col gap-6 h-full">
                                {widgets
                                .filter(widget => widget.column === columnIndex)
                                .map(widget => (
                                    <WidgetComponent 
                                    key={widget.id} 
                                    widget={widget} 
                                    onRemove={removeWidget}
                                    onMoveLeft={() => moveWidget(widget.id, 'left')}
                                    onMoveRight={() => moveWidget(widget.id, 'right')}
                                    isLeftmost={widget.column === 0}
                                    isRightmost={widget.column === columnCount - 1}
                                    />
                                ))}
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
