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
            const [fleetStatsResponse, shipmentStatsResponse, cargoStatsResponse, bookingStatsResponse] = await Promise.all([
                axios.get('/transportation/fleet/stats'),
                axios.get('/transportation/shipments/stats'),
                axios.get('/transportation/cargo/stats'),
                axios.get('/transportation/bookings/stats')
            ]);

            const fleetStats = fleetStatsResponse.data || {};
            const shipmentStats = shipmentStatsResponse.data || {};
            const cargoStats = cargoStatsResponse.data || {};
            const bookingStats = bookingStatsResponse.data || {};

            setStats({
                activeShipments: shipmentStats.in_transit_shipments || 0,
                availableTrucks: fleetStats.available_trucks || 0,
                delayedShipments: shipmentStats.delayed_shipments || 0,
                totalRevenue: bookingStats.total_revenue || 0,
                // Trend data
                activeShipmentsTrend: shipmentStats.in_transit_shipments_trend || 0,
                availableTrucksTrend: fleetStats.available_trucks_trend || 0,
                delayedShipmentsTrend: shipmentStats.delayed_shipments_trend || 0,
                totalRevenueTrend: bookingStats.total_revenue_trend || 0,
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
