import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    current_participants: number;
    registration_deadline: string;
    is_public: boolean;
    category: string;
    image: string;
}

export default function Calendar({ auth }: PageProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchCalendarEvents();
    }, [currentDate]);

    const fetchCalendarEvents = async () => {
        try {
            const response = await fetch('/events/calendar-events');
            if (!response.ok) throw new Error('Failed to fetch calendar events');
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    };

    const getEventsForDay = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start_date);
            return isSameDay(eventDate, date);
        });
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1)));
    };

    const days = getDaysInMonth();
    const monthName = format(currentDate, 'MMMM yyyy');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Events Calendar</h2>}
        >
            <Head title="Events Calendar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateMonth('prev')}
                                        className="flex items-center space-x-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Previous</span>
                                    </Button>
                                    <h3 className="text-lg font-semibold">{monthName}</h3>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateMonth('next')}
                                        className="flex items-center space-x-2"
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button
                                    className="flex items-center space-x-2"
                                    onClick={() => window.location.href = '/events/create'}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>New Event</span>
                                </Button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-7 gap-px bg-gray-200">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <div key={day} className="bg-white p-2 text-center font-semibold">
                                                    {day}
                                                </div>
                                            ))}
                                            {days.map((day, index) => (
                                                <div
                                                    key={index}
                                                    className={`bg-white p-2 min-h-[120px] ${
                                                        !isSameMonth(day, currentDate)
                                                            ? 'text-gray-400'
                                                            : ''
                                                    } ${isToday(day) ? 'bg-blue-50' : ''}`}
                                                >
                                                    <div className={`font-semibold mb-1 ${
                                                        isToday(day) ? 'text-blue-600' : ''
                                                    }`}>
                                                        {format(day, 'd')}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {getEventsForDay(day).map(event => (
                                                            <TooltipProvider key={event.id}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div
                                                                            className="text-xs p-1 bg-blue-100 rounded cursor-pointer hover:bg-blue-200 truncate"
                                                                            onClick={() => window.location.href = `/events/${event.id}/edit`}
                                                                        >
                                                                            {event.title}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="space-y-1">
                                                                            <p className="font-semibold">{event.title}</p>
                                                                            <p className="text-sm">{event.description}</p>
                                                                            <p className="text-sm">
                                                                                {format(new Date(event.start_date), 'h:mm a')} - {event.location}
                                                                            </p>
                                                                            <p className="text-sm">
                                                                                {event.current_participants}/{event.max_participants} participants
                                                                            </p>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 