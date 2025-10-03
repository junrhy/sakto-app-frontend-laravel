import axios from 'axios';
import { useEffect, useState } from 'react';
import { Payroll, PayrollPeriod, SalaryHistory, TimeTracking } from '../types';

export const usePayrollData = () => {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
    const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
    const [timeTracking, setTimeTracking] = useState<TimeTracking[]>([]);
    const [currency, setCurrency] = useState<{
        symbol: string;
        decimal_separator: string;
        thousands_separator: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    const loadPayrolls = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/payroll/list');
            const data = response.data;

            // Handle different response structures
            if (Array.isArray(data)) {
                setPayrolls(data);
            } else if (data && Array.isArray(data.data)) {
                setPayrolls(data.data);
            } else if (data && typeof data === 'object') {
                // Convert object with numeric keys to array
                const payrollsArray = Object.values(data).filter(
                    (item) => item && typeof item === 'object' && 'id' in item,
                );
                setPayrolls(payrollsArray as Payroll[]);
            } else {
                setPayrolls([]);
            }
        } catch (error) {
            console.error('Error loading payrolls:', error);
            setPayrolls([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSalaryHistory = async () => {
        try {
            const response = await axios.get('/payroll/salary-history');
            const data = response.data;

            if (Array.isArray(data)) {
                setSalaryHistory(data);
            } else if (data && Array.isArray(data.data)) {
                setSalaryHistory(data.data);
            } else if (data && typeof data === 'object') {
                // Handle object with numeric keys (like {0: {...}, 1: {...}, currency: {...}})
                const salaryHistoryData = Object.values(data).filter(
                    (item) =>
                        item &&
                        typeof item === 'object' &&
                        'id' in item &&
                        'employee_id' in item,
                ) as SalaryHistory[];
                setSalaryHistory(salaryHistoryData);

                // Extract currency data if present
                if (data.currency && typeof data.currency === 'object') {
                    setCurrency(data.currency);
                }
            } else {
                setSalaryHistory([]);
            }
        } catch (error) {
            console.error('Error loading salary history:', error);
            setSalaryHistory([]);
        }
    };

    const loadPayrollPeriods = async () => {
        try {
            const response = await axios.get('/payroll/periods');
            const data = response.data;

            if (Array.isArray(data)) {
                setPayrollPeriods(data);
            } else if (data && Array.isArray(data.data)) {
                setPayrollPeriods(data.data);
            } else if (data && typeof data === 'object') {
                // Handle object with numeric keys (like {0: {...}, 1: {...}, currency: {...}})
                const payrollPeriodsData = Object.values(data).filter(
                    (item) =>
                        item &&
                        typeof item === 'object' &&
                        'id' in item &&
                        'period_name' in item,
                ) as PayrollPeriod[];
                setPayrollPeriods(payrollPeriodsData);
            } else {
                setPayrollPeriods([]);
            }
        } catch (error) {
            console.error('Error loading payroll periods:', error);
            setPayrollPeriods([]);
        }
    };

    const loadTimeTracking = async () => {
        try {
            const response = await axios.get('/payroll/time-tracking');
            const data = response.data;

            if (Array.isArray(data)) {
                setTimeTracking(data);
            } else if (data && Array.isArray(data.data)) {
                setTimeTracking(data.data);
            } else if (data && typeof data === 'object') {
                // Handle object with numeric keys (like {0: {...}, 1: {...}, currency: {...}})
                const timeTrackingData = Object.values(data).filter(
                    (item) =>
                        item &&
                        typeof item === 'object' &&
                        'id' in item &&
                        'employee_id' in item,
                ) as TimeTracking[];
                setTimeTracking(timeTrackingData);
            } else {
                setTimeTracking([]);
            }
        } catch (error) {
            console.error('Error loading time tracking:', error);
            setTimeTracking([]);
        }
    };

    const loadAllData = async () => {
        await Promise.all([
            loadPayrolls(),
            loadSalaryHistory(),
            loadPayrollPeriods(),
            loadTimeTracking(),
        ]);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    return {
        payrolls,
        salaryHistory,
        payrollPeriods,
        timeTracking,
        currency,
        loading,
        loadPayrolls,
        loadSalaryHistory,
        loadPayrollPeriods,
        loadTimeTracking,
        loadAllData,
    };
};
