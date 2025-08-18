import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardStats as DashboardStatsType } from '../types';

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStatsType>({
        activeShipments: 0,
        availableTrucks: 0,
        delayedShipments: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [fleetStatsResponse, shipmentStatsResponse, cargoStatsResponse] = await Promise.all([
                axios.get('/transportation/fleet/stats'),
                axios.get('/transportation/shipments/stats'),
                axios.get('/transportation/cargo/stats')
            ]);

            const fleetStats = fleetStatsResponse.data || {};
            const shipmentStats = shipmentStatsResponse.data || {};
            const cargoStats = cargoStatsResponse.data || {};

            setStats({
                activeShipments: shipmentStats.in_transit_shipments || 0,
                availableTrucks: fleetStats.available_trucks || 0,
                delayedShipments: shipmentStats.delayed_shipments || 0,
                totalRevenue: 0, // This would need to be calculated from actual shipment data
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to fetch dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return {
        stats,
        loading,
        error,
        fetchStats
    };
};
