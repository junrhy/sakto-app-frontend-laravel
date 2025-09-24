import axios from 'axios';
import { useEffect, useState } from 'react';
import { FuelUpdate, MaintenanceRecord, Truck } from '../types';

export const useFleetManagement = () => {
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [fuelHistory, setFuelHistory] = useState<FuelUpdate[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<
        MaintenanceRecord[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrucks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/transportation/fleet/list');
            setTrucks(response.data || []);
        } catch (error) {
            console.error('Error fetching trucks:', error);
            setError('Failed to fetch trucks');
        } finally {
            setLoading(false);
        }
    };

    const addTruck = async (truckData: {
        plateNumber: string;
        model: string;
        capacity: string;
    }) => {
        try {
            const response = await axios.post('/transportation/fleet', {
                plate_number: truckData.plateNumber,
                model: truckData.model,
                capacity: parseInt(truckData.capacity),
                status: 'Available',
                fuel_level: 0,
                mileage: 0,
            });

            if (response.data) {
                setTrucks((prev) => [...prev, response.data]);
                return response.data;
            }
        } catch (error) {
            console.error('Error adding truck:', error);
            throw error;
        }
    };

    const editTruck = async (updatedTruck: Truck) => {
        try {
            const response = await axios.put(
                `/transportation/fleet/${updatedTruck.id}`,
                {
                    plate_number: updatedTruck.plate_number,
                    model: updatedTruck.model,
                    capacity: updatedTruck.capacity,
                    status: updatedTruck.status,
                    last_maintenance: updatedTruck.last_maintenance,
                    fuel_level: updatedTruck.fuel_level,
                    mileage: updatedTruck.mileage,
                    driver: updatedTruck.driver,
                    driver_contact: updatedTruck.driver_contact,
                },
            );

            if (response.data) {
                setTrucks((prev) =>
                    prev.map((truck) =>
                        truck.id === updatedTruck.id ? response.data : truck,
                    ),
                );
                return response.data;
            }
        } catch (error) {
            console.error('Error updating truck:', error);
            throw error;
        }
    };

    const deleteTruck = async (truckId: string) => {
        try {
            await axios.delete(`/transportation/fleet/${truckId}`);
            setTrucks((prev) => prev.filter((truck) => truck.id !== truckId));
        } catch (error) {
            console.error('Error deleting truck:', error);
            throw error;
        }
    };

    const scheduleMaintenance = async (truckId: string) => {
        try {
            const response = await axios.post(
                `/transportation/fleet/${truckId}/maintenance`,
                {
                    type: 'Routine',
                    description: 'Scheduled maintenance check',
                    cost: 500,
                },
            );

            if (response.data) {
                await fetchTrucks(); // Refresh truck data
                return response.data;
            }
        } catch (error) {
            console.error('Error scheduling maintenance:', error);
            throw error;
        }
    };

    const updateFuelLevel = async (
        truckId: string,
        updateData: { litersAdded: string; cost: string; location: string },
    ) => {
        try {
            const response = await axios.post(
                `/transportation/fleet/${truckId}/fuel`,
                {
                    liters_added: parseFloat(updateData.litersAdded),
                    cost: parseFloat(updateData.cost),
                    location: updateData.location,
                },
            );

            if (response.data) {
                await fetchTrucks(); // Refresh truck data
                return response.data;
            }
        } catch (error) {
            console.error('Error updating fuel level:', error);
            throw error;
        }
    };

    const getFuelHistory = async (truckId: string) => {
        try {
            const response = await axios.get(
                `/transportation/fleet/${truckId}/fuel-history`,
            );
            setFuelHistory(response.data || []);
            return response.data;
        } catch (error) {
            console.error('Error fetching fuel history:', error);
            throw error;
        }
    };

    const getMaintenanceHistory = async (truckId: string) => {
        try {
            const response = await axios.get(
                `/transportation/fleet/${truckId}/maintenance-history`,
            );
            setMaintenanceRecords(response.data || []);
            return response.data;
        } catch (error) {
            console.error('Error fetching maintenance history:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchTrucks();
    }, []);

    return {
        trucks,
        fuelHistory,
        maintenanceRecords,
        loading,
        error,
        addTruck,
        editTruck,
        deleteTruck,
        scheduleMaintenance,
        updateFuelLevel,
        getFuelHistory,
        getMaintenanceHistory,
        fetchTrucks,
    };
};
