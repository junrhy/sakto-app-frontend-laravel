import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";
import { useShipmentTracking } from "../hooks";

interface ShipmentTrackingHistoryProps {
    shipmentId: string;
}

export default function ShipmentTrackingHistory({ shipmentId }: ShipmentTrackingHistoryProps) {
    const { shipments } = useShipmentTracking();    

    // Find the shipment and get its tracking updates
    const shipment = shipments.find(s => s.id === shipmentId);
    const shipmentUpdates = (shipment?.tracking_updates || []).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Tracking History</h3>
            <div className="space-y-3">
                {shipmentUpdates.map((update) => (
                    <div key={update.id} className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <Badge variant={
                                    update.status === 'Delivered' ? 'default' :
                                    update.status === 'In Transit' ? 'secondary' :
                                    update.status === 'Delayed' ? 'destructive' :
                                    'outline'
                                }>
                                    {update.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground dark:text-gray-400">
                                    {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{update.location}</p>
                            {update.notes && (
                                <p className="mt-1 text-sm text-muted-foreground dark:text-gray-400">{update.notes}</p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground dark:text-gray-400">Updated by: {update.updated_by}</p>
                        </div>
                    </div>
                ))}
                {shipmentUpdates.length === 0 && (
                    <p className="text-sm text-muted-foreground dark:text-gray-400">No tracking updates available.</p>
                )}
            </div>
        </div>
    );
}
