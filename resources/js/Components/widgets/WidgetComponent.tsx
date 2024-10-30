import { Card, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SalesWidget } from "./SalesWidget";
import { InventoryWidget } from "./InventoryWidget";
import { OrdersWidget } from "./OrdersWidget";
import { TablesWidget } from "./TablesWidget";
import { KitchenWidget } from "./KitchenWidget";
import { ReservationsWidget } from "./ReservationsWidget";
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
                    {(widget.type as string) === "sales" && (
                        <>
                            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                            Sales Overview
                        </>
                    )}
                    {(widget.type as string) === "inventory" && (
                        <>
                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                            Inventory Status
                        </>
                    )}
                    {(widget.type as string) === "orders" && (
                        <>
                            <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                            Recent Orders
                        </>
                    )}
                    {(widget.type as string) === "tables" && (
                        <>
                            <span className="h-2 w-2 bg-orange-500 rounded-full"></span>
                            Table Status
                        </>
                    )}
                    {(widget.type as string) === "kitchen" && (
                        <>
                            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                            Kitchen Orders
                        </>
                    )}
                    {(widget.type as string) === "reservations" && (
                        <>
                            <span className="h-2 w-2 bg-yellow-500 rounded-full"></span>
                            Reservations
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

            {(widget.type as string) === "sales" && <SalesWidget />}
            {(widget.type as string) === "inventory" && <InventoryWidget />}
            {(widget.type as string) === "orders" && <OrdersWidget />}
            {(widget.type as string) === "tables" && <TablesWidget />}
            {(widget.type as string) === "kitchen" && <KitchenWidget />}
            {(widget.type as string) === "reservations" && <ReservationsWidget />}

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