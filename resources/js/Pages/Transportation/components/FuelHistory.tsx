import { format } from "date-fns";
import { useEffect, useState } from "react";
import axios from "axios";

interface FuelHistoryProps {
    truckId: string;
}

interface FuelUpdate {
    id: string;
    truck_id: string;
    timestamp: string;
    previous_level: string;
    new_level: string;
    liters_added: string;
    cost: string;
    location: string;
    updated_by: string;
}

export default function FuelHistory({ truckId }: FuelHistoryProps) {
    const [fuelHistory, setFuelHistory] = useState<FuelUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFuelHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/transportation/fleet/${truckId}/fuel-history`);
                setFuelHistory(response.data || []);
            } catch (error) {
                console.error('Error fetching fuel history:', error);
                setFuelHistory([]);
            } finally {
                setLoading(false);
            }
        };

        if (truckId) {
            fetchFuelHistory();
        }
    }, [truckId]);

    const truckFuelHistory = fuelHistory
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="font-medium">Fuel History</h3>
                <div className="text-center py-4">Loading fuel history...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Fuel History</h3>
            <div className="space-y-3">
                {truckFuelHistory.map((update) => (
                    <div key={update.id} className="flex items-start space-x-4 border-l-2 border-green-500 pl-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">
                                    {parseFloat(update.liters_added).toFixed(2)} L added
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                                </span>
                            </div>
                            <p className="mt-1 text-sm">
                                Level: {parseFloat(update.previous_level).toFixed(1)}% → {parseFloat(update.new_level).toFixed(1)}%
                            </p>
                            <p className="mt-1 text-sm">
                                Cost: ${parseFloat(update.cost).toFixed(2)} | Location: {update.location}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Updated by: {update.updated_by}
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
