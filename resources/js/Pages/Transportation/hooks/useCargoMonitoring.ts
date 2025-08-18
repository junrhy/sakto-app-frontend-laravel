import { useState, useEffect } from 'react';
import axios from 'axios';
import { CargoItem } from '../types';

export const useCargoMonitoring = () => {
    const [cargoItems, setCargoItems] = useState<CargoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCargoItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/transportation/cargo/list');
            setCargoItems(response.data || []);
        } catch (error) {
            console.error('Error fetching cargo items:', error);
            setError('Failed to fetch cargo items');
        } finally {
            setLoading(false);
        }
    };

    const addCargoItem = async (shipmentId: string, data: {
        name: string;
        quantity: string;
        unit: string;
        description?: string;
        specialHandling?: string;
        temperature?: string;
        humidity?: string;
    }) => {
        try {
            const response = await axios.post('/transportation/cargo', {
                shipment_id: shipmentId,
                name: data.name,
                quantity: parseInt(data.quantity),
                unit: data.unit,
                description: data.description,
                special_handling: data.specialHandling,
                status: 'Loaded',
                temperature: data.temperature ? parseFloat(data.temperature) : undefined,
                humidity: data.humidity ? parseFloat(data.humidity) : undefined
            });
            
            if (response.data) {
                setCargoItems(prev => [...prev, response.data]);
                return response.data;
            }
        } catch (error) {
            console.error('Error adding cargo item:', error);
            throw error;
        }
    };

    const updateCargoStatus = async (cargoId: string, status: CargoItem['status']) => {
        try {
            const response = await axios.post(`/transportation/cargo/${cargoId}/status`, {
                status: status
            });
            
            if (response.data) {
                setCargoItems(prev => prev.map(item => 
                    item.id === cargoId ? { ...item, status } : item
                ));
                return response.data;
            }
        } catch (error) {
            console.error('Error updating cargo status:', error);
            throw error;
        }
    };

    const updateCargoItem = async (cargoId: string, data: {
        shipmentId: string;
        name: string;
        quantity: string;
        unit: string;
        description?: string;
        specialHandling?: string;
        status: string;
        temperature?: string;
        humidity?: string;
    }) => {
        try {
            const response = await axios.put(`/transportation/cargo/${cargoId}`, {
                shipment_id: data.shipmentId,
                name: data.name,
                quantity: parseInt(data.quantity),
                unit: data.unit,
                description: data.description,
                special_handling: data.specialHandling,
                status: data.status,
                temperature: data.temperature ? parseFloat(data.temperature) : undefined,
                humidity: data.humidity ? parseFloat(data.humidity) : undefined
            });
            
            if (response.data) {
                setCargoItems(prev => prev.map(item =>
                    item.id === cargoId ? response.data : item
                ));
                return response.data;
            }
        } catch (error) {
            console.error('Error updating cargo item:', error);
            throw error;
        }
    };

    const deleteCargoItem = async (cargoId: string) => {
        try {
            await axios.delete(`/transportation/cargo/${cargoId}`);
            setCargoItems(prev => prev.filter(item => item.id !== cargoId));
        } catch (error) {
            console.error('Error deleting cargo item:', error);
            throw error;
        }
    };

    const getCargoByShipment = async (shipmentId: string) => {
        try {
            const response = await axios.get(`/transportation/cargo/shipment/${shipmentId}`);
            setCargoItems(response.data || []);
            return response.data;
        } catch (error) {
            console.error('Error fetching cargo by shipment:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchCargoItems();
    }, []);

    return {
        cargoItems,
        loading,
        error,
        addCargoItem,
        updateCargoStatus,
        updateCargoItem,
        deleteCargoItem,
        getCargoByShipment,
        fetchCargoItems
    };
};
