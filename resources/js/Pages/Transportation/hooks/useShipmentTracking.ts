import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shipment, TrackingUpdate } from '../types';

export const useShipmentTracking = () => {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [trackingHistory, setTrackingHistory] = useState<TrackingUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchShipments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/transportation/shipments/list');
            setShipments(response.data || []);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            setError('Failed to fetch shipments');
        } finally {
            setLoading(false);
        }
    };

    const addShipment = async (shipmentData: {
        truckId: string;
        driver: string;
        destination: string;
        origin: string;
        departureDate: string;
        arrivalDate: string;
        cargo: string;
        weight: string;
        customerContact: string;
        priority: string;
    }) => {
        try {
            const response = await axios.post('/transportation/shipments', {
                truck_id: shipmentData.truckId,
                driver: shipmentData.driver,
                destination: shipmentData.destination,
                origin: shipmentData.origin,
                departure_date: shipmentData.departureDate,
                arrival_date: shipmentData.arrivalDate,
                status: 'Scheduled',
                cargo: shipmentData.cargo,
                weight: parseFloat(shipmentData.weight) || 0,
                customer_contact: shipmentData.customerContact,
                priority: shipmentData.priority
            });
            
            if (response.data) {
                setShipments(prev => [...prev, response.data]);
                return response.data;
            }
        } catch (error) {
            console.error('Error adding shipment:', error);
            throw error;
        }
    };

    const editShipment = async (shipment: Shipment) => {
        try {
            const response = await axios.put(`/transportation/shipments/${shipment.id}`, {
                truck_id: shipment.truck_id,
                driver: shipment.driver,
                destination: shipment.destination,
                origin: shipment.origin,
                departure_date: shipment.departure_date,
                arrival_date: shipment.arrival_date,
                status: shipment.status,
                cargo: shipment.cargo,
                weight: shipment.weight,
                current_location: shipment.current_location,
                estimated_delay: shipment.estimated_delay,
                customer_contact: shipment.customer_contact,
                priority: shipment.priority
            });
            
            if (response.data) {
                setShipments(prev => prev.map(s => 
                    s.id === shipment.id ? response.data : s
                ));
                return response.data;
            }
        } catch (error) {
            console.error('Error updating shipment:', error);
            throw error;
        }
    };

    const deleteShipment = async (shipmentId: string) => {
        try {
            await axios.delete(`/transportation/shipments/${shipmentId}`);
            setShipments(prev => prev.filter(s => s.id !== shipmentId));
        } catch (error) {
            console.error('Error deleting shipment:', error);
            throw error;
        }
    };

    const updateShipmentStatus = async (shipmentId: string, updateData: {
        status: string;
        location: string;
        notes?: string;
    }) => {
        try {
            const response = await axios.post(`/transportation/shipments/${shipmentId}/status`, {
                status: updateData.status,
                location: updateData.location,
                notes: updateData.notes
            });
            
            if (response.data) {
                await fetchShipments(); // Refresh shipment data
                return response.data;
            }
        } catch (error) {
            console.error('Error updating shipment status:', error);
            throw error;
        }
    };

    const getTrackingHistory = async (shipmentId: string) => {
        try {
            const response = await axios.get(`/transportation/shipments/${shipmentId}/tracking-history`);
            setTrackingHistory(response.data || []);
            return response.data;
        } catch (error) {
            console.error('Error fetching tracking history:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    return {
        shipments,
        trackingHistory,
        loading,
        error,
        addShipment,
        editShipment,
        deleteShipment,
        updateShipmentStatus,
        getTrackingHistory,
        fetchShipments
    };
};
