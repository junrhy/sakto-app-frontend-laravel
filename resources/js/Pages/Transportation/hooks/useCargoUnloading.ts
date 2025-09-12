import { useState, useCallback } from 'react';
import { CargoUnloading, CargoUnloadingFormData, CargoUnloadingSummary } from '../types';

export function useCargoUnloading() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUnloadings = useCallback(async (cargoItemId: string): Promise<CargoUnloading[]> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/transportation/cargo/${cargoItemId}/unloadings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch unloadings');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createUnloading = useCallback(async (cargoItemId: string, unloadingData: CargoUnloadingFormData): Promise<CargoUnloading> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/transportation/cargo/${cargoItemId}/unloadings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    quantity_unloaded: parseInt(unloadingData.quantity_unloaded),
                    unload_location: unloadingData.unload_location,
                    notes: unloadingData.notes,
                    unloaded_at: unloadingData.unloaded_at,
                    unloaded_by: unloadingData.unloaded_by,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create unloading');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUnloading = useCallback(async (cargoItemId: string, unloadingId: string, unloadingData: CargoUnloadingFormData): Promise<CargoUnloading> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/transportation/cargo/${cargoItemId}/unloadings/${unloadingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    quantity_unloaded: parseInt(unloadingData.quantity_unloaded),
                    unload_location: unloadingData.unload_location,
                    notes: unloadingData.notes,
                    unloaded_at: unloadingData.unloaded_at,
                    unloaded_by: unloadingData.unloaded_by,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update unloading');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUnloading = useCallback(async (cargoItemId: string, unloadingId: string): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/transportation/cargo/${cargoItemId}/unloadings/${unloadingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete unloading');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getUnloadingSummary = useCallback(async (cargoItemId: string): Promise<CargoUnloadingSummary> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/transportation/cargo/${cargoItemId}/unloadings/summary`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch unloading summary');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getUnloadings,
        createUnloading,
        updateUnloading,
        deleteUnloading,
        getUnloadingSummary,
    };
}
