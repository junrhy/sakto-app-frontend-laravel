import { Card, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SalesWidget } from "./SalesWidget";
import { InventoryWidget } from "./InventoryWidget";
import { OrdersWidget } from "./OrdersWidget";
import { Widget } from "@/types";

interface WidgetComponentProps {
    widget: Widget;
    onRemove: (id: number) => void;
    onMoveLeft: (id: number) => void;
    onMoveRight: (id: number) => void;
    isLeftmost: boolean;
    isRightmost: boolean;
}

export function WidgetComponent({ 
    widget, 
    onRemove, 
    onMoveLeft, 
    onMoveRight, 
    isLeftmost, 
    isRightmost 
}: WidgetComponentProps) {
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
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemove(widget.id)} 
                    className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                >
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>

            {widget.type === "sales" && <SalesWidget />}
            {widget.type === "inventory" && <InventoryWidget />}
            {widget.type === "orders" && <OrdersWidget />}

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
} 