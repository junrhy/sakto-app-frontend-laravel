import { format } from "date-fns";
import { FuelUpdate } from "../types";

interface FuelHistoryProps {
    truckId: string;
    fuelHistory: FuelUpdate[];
}

export default function FuelHistory({ truckId, fuelHistory }: FuelHistoryProps) {
    const truckFuelHistory = fuelHistory
        .filter(update => update.truckId === truckId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Fuel History</h3>
            <div className="space-y-3">
                {truckFuelHistory.map((update) => (
                    <div key={update.id} className="flex items-start space-x-4 border-l-2 border-green-500 pl-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">
                                    {update.litersAdded.toFixed(2)} L added
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                                </span>
                            </div>
                            <p className="mt-1 text-sm">
                                Level: {update.previousLevel.toFixed(1)}% → {update.newLevel.toFixed(1)}%
                            </p>
                            <p className="mt-1 text-sm">
                                Cost: ${update.cost.toFixed(2)} | Location: {update.location}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Updated by: {update.updatedBy}
                            </p>
                        </div>
                    </div>
                ))}
                {truckFuelHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground">No fuel history available.</p>
                )}
            </div>
        </div>
    );
}
