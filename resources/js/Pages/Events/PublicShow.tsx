import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    CreditCard,
    DollarSign,
    MapPin,
    Tag,
    UserPlus,
    Users,
} from 'lucide-react';

interface Event {
    message: string;
    data: {
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
        is_paid_event: boolean;
        event_price: number;
        currency: string;
        payment_instructions: string;
        category: string;
        image: string;
    };
}

interface Props extends PageProps {
    event: Event;
}

export default function PublicShow({ event }: Props) {
    const isRegistrationOpen =
        new Date(event.data.registration_deadline) > new Date();
    const isEventFull =
        event.data.max_participants > 0 &&
        event.data.current_participants >= event.data.max_participants;
    const isEventPast = new Date(event.data.end_date) < new Date();
    const isEventUpcoming = new Date(event.data.start_date) > new Date();
    const isEventOngoing = !isEventPast && !isEventUpcoming;

    const formatPrice = (
        price: number | string | null | undefined,
        currency: string,
    ) => {
        if (price === null || price === undefined) return 'Free';
        const numericPrice =
            typeof price === 'number' ? price : parseFloat(price) || 0;
        return `${currency} ${numericPrice.toFixed(2)}`;
    };

    return (
        <>
            <Head title={event.data.title} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Hero Section */}
                <div className="relative h-[150px] w-full overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${event.data.image || '/images/event-placeholder.jpg'})`,
                            filter: 'brightness(0.6) saturate(1.2)',
                        }}
                    />
                    <div className="absolute inset-0 bg-blue-700/80" />
                    <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8">
                        <div className="text-white">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-2 text-3xl font-bold text-white"
                            >
                                {event.data.title}
                            </motion.h1>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="secondary"
                                    className="border-0 bg-emerald-500/90 text-white hover:bg-emerald-600/90"
                                >
                                    <Tag className="mr-1 h-3 w-3" />
                                    {event.data.category}
                                </Badge>
                                {event.data.is_paid_event && (
                                    <Badge
                                        variant="secondary"
                                        className="border-0 bg-amber-500/90 text-white hover:bg-amber-600/90"
                                    >
                                        <DollarSign className="mr-1 h-3 w-3" />
                                        Paid Event
                                    </Badge>
                                )}
                                {isEventPast ? (
                                    <Badge
                                        variant="secondary"
                                        className="border-0 bg-red-500/90 text-white hover:bg-red-600/90"
                                    >
                                        Past
                                    </Badge>
                                ) : isEventUpcoming ? (
                                    <Badge
                                        variant="secondary"
                                        className="border-0 bg-green-500/90 text-white hover:bg-green-600/90"
                                    >
                                        Upcoming
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="border-0 bg-blue-500/90 text-white hover:bg-blue-600/90"
                                    >
                                        Ongoing
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="space-y-6 md:col-span-2">
                                <Card className="overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="border-b bg-blue-600 text-white">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">
                                                    {event.data.title}
                                                </CardTitle>
                                                <CardDescription className="mt-2 text-blue-100">
                                                    Join us for an exciting
                                                    event that you won't want to
                                                    miss!
                                                </CardDescription>
                                            </div>
                                            {isRegistrationOpen &&
                                                !isEventFull &&
                                                !isEventPast && (
                                                    <Link
                                                        href={`/events/${event.data.id}/public-register`}
                                                    >
                                                        <Button className="flex transform items-center bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-emerald-700 hover:to-green-700 hover:shadow-xl">
                                                            <UserPlus className="mr-2 h-4 w-4" />
                                                            Register Now
                                                        </Button>
                                                    </Link>
                                                )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="flex items-start rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 transition-all duration-200 hover:from-blue-100 hover:to-indigo-100">
                                                    <Calendar className="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            Event Date
                                                        </p>
                                                        <div className="text-slate-600">
                                                            {format(
                                                                new Date(
                                                                    event.data.start_date,
                                                                ),
                                                                'MMMM d, yyyy',
                                                            )}{' '}
                                                            -{' '}
                                                            {format(
                                                                new Date(
                                                                    event.data.end_date,
                                                                ),
                                                                'MMMM d, yyyy',
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-4 transition-all duration-200 hover:from-emerald-100 hover:to-green-100">
                                                    <MapPin className="mr-3 mt-0.5 h-5 w-5 text-emerald-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            Location
                                                        </p>
                                                        <div className="text-slate-600">
                                                            {
                                                                event.data
                                                                    .location
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4 transition-all duration-200 hover:from-purple-100 hover:to-pink-100">
                                                    <Users className="mr-3 mt-0.5 h-5 w-5 text-purple-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            Participants
                                                        </p>
                                                        <div className="text-slate-600">
                                                            {event.data
                                                                .current_participants ||
                                                                0}{' '}
                                                            registered
                                                            {event.data
                                                                .max_participants >
                                                                0 && (
                                                                <span className="font-medium text-blue-600">
                                                                    {` (${Math.max(0, (event.data.max_participants || 0) - (event.data.current_participants || 0))} spots remaining)`}
                                                                </span>
                                                            )}
                                                            {event.data
                                                                .max_participants ===
                                                                0 &&
                                                                ' (Unlimited spots)'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start rounded-lg border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-4 transition-all duration-200 hover:from-orange-100 hover:to-amber-100">
                                                    <Clock className="mr-3 mt-0.5 h-5 w-5 text-orange-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            Registration
                                                            Deadline
                                                        </p>
                                                        <div className="text-slate-600">
                                                            {format(
                                                                new Date(
                                                                    event.data.registration_deadline,
                                                                ),
                                                                'MMMM d, yyyy',
                                                            )}
                                                            {!isRegistrationOpen && (
                                                                <div className="mt-1 text-sm font-medium text-red-600">
                                                                    Registration
                                                                    is closed
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Information Section */}
                                            {event.data.is_paid_event && (
                                                <div className="mt-8">
                                                    <h3 className="mb-4 flex items-center text-xl font-semibold text-slate-900">
                                                        <CreditCard className="mr-2 h-5 w-5 text-amber-600" />
                                                        Payment Information
                                                    </h3>
                                                    <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
                                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                            <div className="flex items-center rounded-lg border border-amber-200 bg-white/60 p-4">
                                                                <DollarSign className="mr-3 h-6 w-6 text-amber-600" />
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">
                                                                        Event
                                                                        Price
                                                                    </p>
                                                                    <div className="text-2xl font-bold text-amber-700">
                                                                        {formatPrice(
                                                                            event
                                                                                .data
                                                                                .event_price,
                                                                            event
                                                                                .data
                                                                                .currency,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {event.data
                                                                .payment_instructions && (
                                                                <div className="md:col-span-2">
                                                                    <div className="rounded-lg border border-amber-200 bg-white/60 p-4">
                                                                        <p className="mb-2 font-semibold text-slate-900">
                                                                            Payment
                                                                            Instructions
                                                                        </p>
                                                                        <div className="whitespace-pre-line leading-relaxed text-slate-600">
                                                                            {
                                                                                event
                                                                                    .data
                                                                                    .payment_instructions
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-8">
                                                <h3 className="mb-4 text-xl font-semibold text-slate-900">
                                                    About This Event
                                                </h3>
                                                <div className="prose prose-gray max-w-none">
                                                    <div className="whitespace-pre-line leading-relaxed text-slate-600">
                                                        {event.data.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="sticky top-6 border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                                    <CardHeader className="border-b bg-blue-600 text-white">
                                        <CardTitle className="text-xl">
                                            Registration Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-4">
                                                <p className="mb-2 font-semibold text-slate-900">
                                                    Event Status
                                                </p>
                                                {isEventFull ? (
                                                    <div className="flex items-center text-red-600">
                                                        <div className="mr-2 h-2 w-2 rounded-full bg-red-600"></div>
                                                        This event is full
                                                    </div>
                                                ) : isRegistrationOpen ? (
                                                    <div className="flex items-center text-emerald-600">
                                                        <div className="mr-2 h-2 w-2 rounded-full bg-emerald-600"></div>
                                                        Registration is open
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-red-600">
                                                        <div className="mr-2 h-2 w-2 rounded-full bg-red-600"></div>
                                                        Registration is closed
                                                    </div>
                                                )}
                                            </div>

                                            {event.data.is_paid_event && (
                                                <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
                                                    <p className="mb-2 flex items-center font-semibold text-slate-900">
                                                        <CreditCard className="mr-2 h-4 w-4 text-amber-600" />
                                                        Payment Required
                                                    </p>
                                                    <div className="text-slate-600">
                                                        <div className="mb-1 text-lg font-bold text-amber-700">
                                                            {formatPrice(
                                                                event.data
                                                                    .event_price,
                                                                event.data
                                                                    .currency,
                                                            )}
                                                        </div>
                                                        <p className="text-sm">
                                                            Payment will be
                                                            collected during
                                                            registration
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {isRegistrationOpen &&
                                                !isEventFull &&
                                                !isEventPast && (
                                                    <div className="pt-4">
                                                        <Link
                                                            href={`/events/${event.data.id}/public-register`}
                                                            className="w-full"
                                                        >
                                                            <Button className="flex w-full transform items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl">
                                                                <UserPlus className="mr-2 h-4 w-4" />
                                                                Register for
                                                                this Event
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
