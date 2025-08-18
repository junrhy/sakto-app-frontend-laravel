import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";
import { TrackingUpdate } from "../types";

interface ShipmentTrackingHistoryProps {
    shipmentId: string;
    trackingHistory: TrackingUpdate[];
}

export default function ShipmentTrackingHistory({ shipmentId, trackingHistory }: ShipmentTrackingHistoryProps) {
    const shipmentUpdates = trackingHistory
        .filter(update => update.shipmentId === shipmentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Tracking History</h3>
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
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                                </span>
                            </div>
                            <p className="mt-1 text-sm">{update.location}</p>
                            {update.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">{update.notes}</p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">Updated by: {update.updatedBy}</p>
                        </div>
                    </div>
                ))}
                {shipmentUpdates.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tracking updates available.</p>
                )}
            </div>
        </div>
    );
}
