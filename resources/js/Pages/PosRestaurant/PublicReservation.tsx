import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { CountryCodeSelector } from '@/Components/CountryCodeSelector';
import { Calendar, Clock, MapPin, Phone, User, Users } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { DateCalendar } from './components/DateCalendar';
import { OpenedDate, Table } from './types';

interface PublicReservationProps {
    tables: Table[];
    openedDates: OpenedDate[];
    restaurantName?: string;
    restaurantAddress?: string;
    restaurantPhone?: string;
    clientIdentifier?: string;
    error?: string;
}

interface ReservationFormData {
    name: string;
    email: string;
    countryCode: string; // This will now store the country code (e.g., 'US') instead of dial code
    phone: string;
    date: string;
    time: string;
    guests: number;
    notes: string;
}

// Country codes mapping for dial codes
const COUNTRY_DIAL_CODES: Record<string, string> = {
    'US': '+1',
    'CA': '+1',
    'GB': '+44',
    'AU': '+61',
    'SG': '+65',
    'MY': '+60',
    'TH': '+66',
    'ID': '+62',
    'JP': '+81',
    'KR': '+82',
    'CN': '+86',
    'HK': '+852',
    'TW': '+886',
    'IN': '+91',
    'DE': '+49',
    'FR': '+33',
    'IT': '+39',
    'ES': '+34',
    'NL': '+31',
    'BE': '+32',
    'CH': '+41',
    'AT': '+43',
    'SE': '+46',
    'NO': '+47',
    'DK': '+45',
    'FI': '+358',
    'BR': '+55',
    'MX': '+52',
    'AR': '+54',
    'CL': '+56',
    'CO': '+57',
    'PE': '+51',
    'VE': '+58',
    'ZA': '+27',
    'EG': '+20',
    'NG': '+234',
    'KE': '+254',
    'MA': '+212',
    'TN': '+216',
    'DZ': '+213',
    'LY': '+218',
    'SD': '+249',
    'ET': '+251',
    'GH': '+233',
    'CI': '+225',
    'SN': '+221',
    'ML': '+223',
    'BF': '+226',
    'NE': '+227',
    'TD': '+235',
    'CM': '+237',
    'CF': '+236',
    'GA': '+241',
    'CG': '+242',
    'CD': '+243',
    'AO': '+244',
    'ZM': '+260',
    'ZW': '+263',
    'BW': '+267',
    'NA': '+264',
    'SZ': '+268',
    'LS': '+266',
    'MW': '+265',
    'MZ': '+258',
    'MG': '+261',
    'MU': '+230',
    'SC': '+248',
    'RE': '+262',
    'YT': '+262',
    'KM': '+269',
    'DJ': '+253',
    'SO': '+252',
    'ER': '+291',
    'UG': '+256',
    'RW': '+250',
    'BI': '+257',
    'TZ': '+255',
    'PH': '+63',
};

export default function PublicReservation({
    tables,
    openedDates,
    restaurantName = 'Restaurant',
    restaurantAddress,
    restaurantPhone,
    clientIdentifier = 'default',
    error,
}: PublicReservationProps) {
    const [formData, setFormData] = useState<ReservationFormData>(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return {
            name: '',
            email: '',
            countryCode: 'US', // Default to USA
            phone: '',
            date: `${year}-${month}-${day}`,
            time: '',
            guests: 2,
            notes: '',
        };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate time slots with 30-minute intervals
    const generateTimeSlots = useCallback(() => {
        const amSlots = [];
        const pmSlots = [];

        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const hours12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayTime = `${hours12}:${minute.toString().padStart(2, '0')} ${period}`;
                const slot = { value: timeString, display: displayTime };

                if (hour < 12) {
                    amSlots.push(slot);
                } else {
                    pmSlots.push(slot);
                }
            }
        }

        return { am: amSlots, pm: pmSlots };
    }, []);

    const timeSlots = useMemo(() => generateTimeSlots(), [generateTimeSlots]);

    // Check if a timeslot is opened
    const isTimeSlotOpened = useCallback(
        (date: string, time: string) => {
            // If no opened dates configured, restaurant is closed - no timeslots available
            if (openedDates.length === 0) return false;

            // Check if this specific date and time is opened
            return openedDates.some((openedDate) => {
                const openedDateStr = openedDate.opened_date.split('T')[0];
                return (
                    openedDateStr === date &&
                    openedDate.timeslots &&
                    openedDate.timeslots.includes(time)
                );
            });
        },
        [openedDates],
    );

    // Reset time when date changes
    useEffect(() => {
        setFormData((prev) => ({ ...prev, time: '' }));
    }, [formData.date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return;
        }
        
        if (!formData.email.trim()) {
            toast.error('Please enter your email');
            return;
        }
        
        if (!formData.phone.trim()) {
            toast.error('Please enter your phone number');
            return;
        }
        
        if (!formData.date || !formData.time) {
            toast.error('Please select date and time');
            return;
        }
        
        if (!isTimeSlotOpened(formData.date, formData.time)) {
            toast.error('This date/time is not available for reservations');
            return;
        }
        
        // Table assignment will be handled by restaurant staff

        setIsSubmitting(true);
        
        try {
            const response = await axios.post('/api/pos-restaurant-public/reservation', {
                ...formData,
                countryCode: COUNTRY_DIAL_CODES[formData.countryCode] || '+1', // Convert country code to dial code
                client_identifier: clientIdentifier,
            });
            
            if (response.data.status === 'success') {
                toast.success('Reservation submitted successfully! We will contact you to confirm.');
                
                // Reset form
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                setFormData({
                    name: '',
                    email: '',
                    countryCode: 'US',
                    phone: '',
                    date: `${year}-${month}-${day}`,
                    time: '',
                    guests: 2,
                    notes: '',
                });
            } else {
                throw new Error(response.data.message || 'Failed to submit reservation');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit reservation. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show error if there's an issue loading data
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="mx-auto max-w-2xl">
                        <Card className="shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Reservation Error
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 text-center">
                                <p className="text-gray-600 dark:text-gray-300">
                                    {error}
                                </p>
                                <Button 
                                    onClick={() => window.location.reload()} 
                                    className="mt-4"
                                >
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                        Make a Reservation
                    </h1>
                    <h2 className="text-xl text-gray-600 dark:text-gray-300">
                        {restaurantName}
                    </h2>
                    {restaurantAddress && (
                        <div className="mt-2 flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="h-4 w-4" />
                            {restaurantAddress}
                        </div>
                    )}
                    {restaurantPhone && (
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Phone className="h-4 w-4" />
                            {restaurantPhone}
                        </div>
                    )}
                </div>

                {/* Reservation Form */}
                <div className="mx-auto max-w-4xl">
                    <Card className="shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Reservation Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter your full name"
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter your email"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="md:col-span-1">
                                        <CountryCodeSelector
                                            value={formData.countryCode}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    countryCode: value,
                                                }))
                                            }
                                            label="Country Code"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="phone">
                                            Phone Number *
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                let phoneValue = e.target.value;
                                                // Remove leading zeros
                                                phoneValue = phoneValue.replace(/^0+/, '');
                                                // Only allow numbers
                                                phoneValue = phoneValue.replace(/[^0-9]/g, '');
                                                // Limit length to 15 digits
                                                phoneValue = phoneValue.slice(0, 15);
                                                
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    phone: phoneValue,
                                                }));
                                            }}
                                            placeholder="Enter your phone number"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Date and Time Selection */}
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Date Selection */}
                                    <div>
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Select Date *
                                        </Label>
                                        <div className="mt-2 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                            <DateCalendar
                                                selectedDate={formData.date}
                                                onDateSelect={(dateStr) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        date: dateStr,
                                                    }));
                                                }}
                                                blockedDates={[]}
                                                minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                                            />
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div>
                                        <Label className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Select Time *
                                        </Label>
                                        <div className="mt-2 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* AM Column */}
                                                <div>
                                                    <h4 className="mb-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        AM
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {timeSlots.am.map((timeSlot) => {
                                                            const isOpened = isTimeSlotOpened(
                                                                formData.date,
                                                                timeSlot.value,
                                                            );
                                                            const isSelected = formData.time === timeSlot.value;

                                                            return (
                                                                <button
                                                                    key={timeSlot.value}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        isOpened &&
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            time: timeSlot.value,
                                                                        }))
                                                                    }
                                                                    disabled={!isOpened}
                                                                    className={`rounded border px-2 py-1 text-xs font-medium transition-all ${
                                                                        isSelected
                                                                            ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                                                                            : !isOpened
                                                                              ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                              : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                                                                    }`}
                                                                >
                                                                    {timeSlot.display}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* PM Column */}
                                                <div>
                                                    <h4 className="mb-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        PM
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {timeSlots.pm.map((timeSlot) => {
                                                            const isOpened = isTimeSlotOpened(
                                                                formData.date,
                                                                timeSlot.value,
                                                            );
                                                            const isSelected = formData.time === timeSlot.value;

                                                            return (
                                                                <button
                                                                    key={timeSlot.value}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        isOpened &&
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            time: timeSlot.value,
                                                                        }))
                                                                    }
                                                                    disabled={!isOpened}
                                                                    className={`rounded border px-2 py-1 text-xs font-medium transition-all ${
                                                                        isSelected
                                                                            ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                                                                            : !isOpened
                                                                              ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                              : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                                                                    }`}
                                                                >
                                                                    {timeSlot.display}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Party Size */}
                                <div>
                                    <Label htmlFor="guests" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Party Size *
                                    </Label>
                                    <Input
                                        id="guests"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.guests}
                                        onChange={(e) => {
                                            const newGuests = parseInt(e.target.value) || 1;
                                            setFormData((prev) => ({
                                                ...prev,
                                                guests: newGuests,
                                            }));
                                        }}
                                        required
                                        className="mt-1"
                                    />
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        We'll assign the best available table for your party size
                                    </p>
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <Label htmlFor="notes">
                                        Special Requests
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        placeholder="Any special requests or notes (optional)"
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Reservation'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
