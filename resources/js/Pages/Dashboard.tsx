import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, X, LayoutGrid, Columns, Columns3, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"

type WidgetType = "sales" | "inventory" | "orders";

interface Widget {
  id: number;
  type: WidgetType;
  column: number;
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
    <Card className="h-full mb-4 relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">
          {widget.type === "sales" && "Sales Overview"}
          {widget.type === "inventory" && "Inventory Status"}
          {widget.type === "orders" && "Recent Orders"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onRemove(widget.id)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Placeholder content for each widget type */}
        {widget.type === "sales" && <p>Sales data visualization would go here.</p>}
        {widget.type === "inventory" && <p>Inventory levels and alerts would be displayed here.</p>}
        {widget.type === "orders" && <p>A list of recent orders would be shown here.</p>}
      </CardContent>
      <div className="absolute bottom-2 left-2 right-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMoveLeft(widget.id)}
          disabled={isLeftmost}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMoveRight(widget.id)}
          disabled={isRightmost}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default function Dashboard() {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
    const [columnCount, setColumnCount] = useState<1 | 2 | 3>(2);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWidgets();
        setLoading(false);
    }, []);

    const fetchWidgets = () => {
        // Initialize with empty array or some default widgets
        setWidgets([]);
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <main className="flex flex-col min-h-screen">
                                <div className="flex-grow p-8">
                                    <div className="w-full max-w-7xl mx-auto h-full">
                                    <div className="w-full flex justify-between max-w-7xl mb-8">
                                        <div className="flex space-x-4 mb-4">
                                        <Select value={selectedWidgetType || ""} onValueChange={(value: string) => setSelectedWidgetType(value as WidgetType)}>
                                            <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select widget" />
                                            </SelectTrigger>
                                            <SelectContent>
                                            <SelectItem value="sales">Sales Overview</SelectItem>
                                            <SelectItem value="inventory">Inventory Status</SelectItem>
                                            <SelectItem value="orders">Recent Orders</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={addWidget} disabled={!selectedWidgetType}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        </div>
                                        <div className="flex space-x-2">
                                        <Button onClick={() => setColumnCount(1)} variant={columnCount === 1 ? "default" : "outline"}>
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => setColumnCount(2)} variant={columnCount === 2 ? "default" : "outline"}>
                                            <Columns className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => setColumnCount(3)} variant={columnCount === 3 ? "default" : "outline"}>
                                            <Columns3 className="h-4 w-4" />
                                        </Button>
                                        </div>
                                    </div>

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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
