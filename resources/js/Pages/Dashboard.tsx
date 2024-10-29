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

type WidgetType = "sales" | "inventory" | "orders";

interface Widget {
  id: number;
  type: WidgetType;
  column: number;
}

interface Dashboard {
  id: number;
  name: string;
  widgets: Widget[];
  favorite?: boolean;
}

const WidgetComponent: React.FC<{ 
  widget: Widget; 
  onRemove: (id: number) => void;
  onMoveLeft: (id: number) => void;
  onMoveRight: (id: number) => void;
  isLeftmost: boolean;
  isRightmost: boolean;
}> = ({ widget, onRemove, onMoveLeft, onMoveRight, isLeftmost, isRightmost }) => {
  return (
    <Card className="h-full mb-4 relative shadow-md border-2 border-gray-300 hover:shadow-lg transition-shadow duration-200 dark:border-gray-600">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b dark:border-gray-700">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {widget.type === "sales" && (
            <>
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              Sales Overview
            </>
          )}
          {widget.type === "inventory" && (
            <>
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              Inventory Status
            </>
          )}
          {widget.type === "orders" && (
            <>
              <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
              Recent Orders
            </>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onRemove(widget.id)} className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Enhanced placeholder content */}
        {widget.type === "sales" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Today's Sales</span>
              <span className="text-lg font-bold text-green-600">$12,543</span>
            </div>
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              Chart Placeholder
            </div>
          </div>
        )}
        {widget.type === "inventory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stock Items</span>
              <span className="text-lg font-bold text-blue-600">1,234</span>
            </div>
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              Inventory Chart
            </div>
          </div>
        )}
        {widget.type === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Orders</span>
              <span className="text-lg font-bold text-purple-600">47</span>
            </div>
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              Orders List
            </div>
          </div>
        )}
      </CardContent>
      <div className="absolute bottom-2 left-2 right-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMoveLeft(widget.id)}
          disabled={isLeftmost}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMoveRight(widget.id)}
          disabled={isRightmost}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default function Dashboard() {
    const [dashboards, setDashboards] = useState<Dashboard[]>([
        { id: 1, name: "Main Dashboard", widgets: [], favorite: false },
    ]);
    const [currentDashboard, setCurrentDashboard] = useState<Dashboard>(dashboards[0]);
    const [newDashboardName, setNewDashboardName] = useState("");
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
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

    const addWidget = () => {
        if (selectedWidgetType) {
            const newWidget: Widget = {
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
                                        onValueChange={(value: string) => setSelectedWidgetType(value as WidgetType)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select widget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sales">Sales Overview</SelectItem>
                                            <SelectItem value="inventory">Inventory Status</SelectItem>
                                            <SelectItem value="orders">Recent Orders</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button 
                                        onClick={addWidget} 
                                        disabled={!selectedWidgetType} 
                                        variant="default"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Widget
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
