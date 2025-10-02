import axios from 'axios';
import { useEffect, useState } from 'react';
import { Payroll, PayrollPeriod, SalaryHistory, TimeTracking } from '../types';

export const usePayrollData = () => {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([]);
    const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
    const [timeTracking, setTimeTracking] = useState<TimeTracking[]>([]);
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
            console.log('Loading salary history...');
            const response = await axios.get('/payroll/salary-history');
            console.log('Salary history response:', response.data);
            const data = response.data;

            if (Array.isArray(data)) {
                setSalaryHistory(data);
            } else if (data && Array.isArray(data.data)) {
                setSalaryHistory(data.data);
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
            console.log('Loading payroll periods...');
            const response = await axios.get('/payroll/periods');
            console.log('Payroll periods response:', response.data);
            const data = response.data;

            if (Array.isArray(data)) {
                setPayrollPeriods(data);
            } else if (data && Array.isArray(data.data)) {
                setPayrollPeriods(data.data);
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
            console.log('Loading time tracking...');
            const response = await axios.get('/payroll/time-tracking');
            console.log('Time tracking response:', response.data);
            const data = response.data;

            if (Array.isArray(data)) {
                setTimeTracking(data);
            } else if (data && Array.isArray(data.data)) {
                setTimeTracking(data.data);
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
        loading,
        loadPayrolls,
        loadSalaryHistory,
        loadPayrollPeriods,
        loadTimeTracking,
        loadAllData,
    };
};
