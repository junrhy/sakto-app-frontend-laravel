import { User, Project } from '@/types/index';
import React, { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
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

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
}

export default function Calendar({ auth }: Props) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        return (auth.user as any).is_admin;
    }, [auth.selectedTeamMember, auth.user]);

    useEffect(() => {
        fetchCalendarEvents();
    }, [currentDate]);

    const fetchCalendarEvents = async () => {
        try {
            const response = await fetch('/events/calendar-events');
            if (!response.ok) throw new Error('Failed to fetch calendar events');
            const { data } = await response.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            toast.error('Failed to load calendar events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }); // Start from Sunday
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }); // End on Saturday
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
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight">Events Calendar</h2>}
        >
            <Head title="Events Calendar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-900 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateMonth('prev')}
                                        className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Previous</span>
                                    </Button>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{monthName}</h3>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateMonth('next')}
                                        className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                                {canEdit && (
                                    <Button
                                        className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        onClick={() => window.location.href = '/events/create'}
                                    >
                                        <div className="absolute inset-0 bg-white/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <Plus className="w-4 h-4 mr-2 relative z-10" />
                                        <span className="relative z-10 font-semibold">New Event</span>
                                    </Button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                                </div>
                            ) : (
                                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <div key={day} className="bg-white dark:bg-gray-900 p-2 text-center font-semibold text-gray-900 dark:text-gray-100">
                                                    {day}
                                                </div>
                                            ))}
                                            {days.map((day, index) => (
                                                <div
                                                    key={index}
                                                    className={`bg-white dark:bg-gray-900 p-2 min-h-[120px] ${
                                                        !isSameMonth(day, currentDate)
                                                            ? 'text-gray-400 dark:text-gray-500'
                                                            : 'text-gray-900 dark:text-gray-100'
                                                    } ${isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                >
                                                    <div className={`font-semibold mb-1 ${
                                                        isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''
                                                    }`}>
                                                        {format(day, 'd')}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {getEventsForDay(day).map(event => (
                                                            <TooltipProvider key={event.id}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div
                                                                            className="text-xs p-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/30 truncate border border-blue-200 dark:border-blue-800"
                                                                            onClick={() => canEdit ? window.location.href = `/events/${event.id}/edit` : null}
                                                                        >
                                                                            {event.title}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                                                        <div className="space-y-1">
                                                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</p>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                                {format(new Date(event.start_date), 'h:mm a')} - {event.location}
                                                                            </p>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
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