import { usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { useMemo } from 'react';

import type {
    AppCurrencySettings,
    PaginatedResponse,
    TravelBooking,
    TravelPackage,
} from '@/Pages/Travel/travel';
import type { PageProps } from '@/types';

type FetchParams = Record<string, unknown>;

export function useTravelApi(initialCurrency?: AppCurrencySettings | null) {
    const { props } = usePage<PageProps>();

    const currencySettings = useMemo<AppCurrencySettings | null>(() => {
        if (initialCurrency) {
            return initialCurrency;
        }

        const userCurrency = props.auth?.user?.app_currency;

        if (!userCurrency) {
            return null;
        }

        if (typeof userCurrency === 'string') {
            try {
                return JSON.parse(userCurrency) as AppCurrencySettings;
            } catch (error) {
                logDebug(error, 'parse currency');
                return null;
            }
        }

        return userCurrency as AppCurrencySettings;
    }, [initialCurrency, props.auth?.user?.app_currency]);

    const formatCurrency = (value: number) => {
        const currency = currencySettings;
        if (!currency) {
            return `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }

        const {
            symbol,
            decimal_separator = '.',
            thousands_separator = ',',
        } = currency;

        return `${symbol}${Number(value)
            .toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true,
            })
            .replace('.', '{decimal}')
            .replace(/,/g, thousands_separator)
            .replace('{decimal}', decimal_separator)}`;
    };

    const fetchPackages = async (
        params: FetchParams = {},
    ): Promise<PaginatedResponse<TravelPackage>> => {
        const response = await axios.get(route('travel.packages.list'), {
            params,
        });
        return response.data;
    };

    const fetchBookings = async (
        params: FetchParams = {},
    ): Promise<PaginatedResponse<TravelBooking>> => {
        const response = await axios.get(route('travel.bookings.list'), {
            params,
        });
        return response.data;
    };

    const logError = (error: unknown, context: string) => {
        if (!import.meta.env.DEV) {
            return;
        }

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            // eslint-disable-next-line no-console
            console.error(`Travel API ${context} Axios error:`, {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
            });
        } else {
            // eslint-disable-next-line no-console
            console.error(`Travel API ${context} error:`, error);
        }
    };

    return {
        currencySettings,
        formatCurrency,
        fetchPackages,
        fetchBookings,
        logError,
    };
}

function logDebug(error: unknown, context: string) {
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug(`Travel API ${context} debug:`, error);
    }
}
