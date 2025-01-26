import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Plane, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/Components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';

interface Airport {
    iataCode: string;
    name: string;
    cityName: string;
    countryName: string;
    type: 'airport' | 'city';
    label: string;
}

// Add airline information mapping
const airlines: { [key: string]: { logo: string; name: string } } = {
    'PR': {
        logo: 'https://www.philippineairlines.com/images/default-source/default-album/pal-logo.png',
        name: 'Philippine Airlines'
    },
    'CX': {
        logo: 'https://logos-world.net/wp-content/uploads/2023/01/Cathay-Pacific-Logo.png',
        name: 'Cathay Pacific'
    },
    'SQ': {
        logo: 'https://logos-world.net/wp-content/uploads/2020/03/Singapore-Airlines-Logo.png',
        name: 'Singapore Airlines'
    },
    'EK': {
        logo: 'https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo-700x394.png',
        name: 'Emirates'
    },
    'QR': {
        logo: 'https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png',
        name: 'Qatar Airways'
    },
    // Add more airlines as needed
};

interface FlightOffer {
    id: string;
    itineraries: Array<{
        segments: Array<{
            departure: {
                iataCode: string;
                terminal?: string;
                at: string;
            };
            arrival: {
                iataCode: string;
                terminal?: string;
                at: string;
            };
            carrierCode: string;
            number: string;
            aircraft: {
                code: string;
            };
            duration: string;
            numberOfStops: number;
        }>;
    }>;
    price: {
        total: string;
        currency: string;
    };
    numberOfBookableSeats: number;
}

interface PassengerCounts {
    adults: string;
    children: string;
    infants: string;
}

export default function FlightSearch() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [passengers, setPassengers] = useState<PassengerCounts>({
        adults: '1',
        children: '0',
        infants: '0'
    });
    const [travelClass, setTravelClass] = useState('ECONOMY');
    const [searchResults, setSearchResults] = useState<FlightOffer[]>([]);
    const [returnFlights, setReturnFlights] = useState<FlightOffer[]>([]);
    const [searching, setSearching] = useState(false);
    const [flightType, setFlightType] = useState<'one-way' | 'round-trip'>('round-trip');
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

    const handleSearch = async () => {
        if (!origin || !destination || !departureDate) return;

        setSearching(true);
        try {
            // Search for outbound flights
            const outboundResponse = await axios.get('/api/flights/search', {
                params: {
                    origin: origin.toUpperCase(),
                    destination: destination.toUpperCase(),
                    departureDate,
                    adults: parseInt(passengers.adults),
                    children: parseInt(passengers.children),
                    infants: parseInt(passengers.infants),
                    travelClass,
                }
            });
            setSearchResults(outboundResponse.data);

            // If round-trip and return date is set, search for return flights
            if (flightType === 'round-trip' && returnDate) {
                const returnResponse = await axios.get('/api/flights/search', {
                    params: {
                        origin: destination.toUpperCase(),
                        destination: origin.toUpperCase(),
                        departureDate: returnDate,
                        adults: parseInt(passengers.adults),
                        children: parseInt(passengers.children),
                        infants: parseInt(passengers.infants),
                        travelClass,
                    }
                });
                setReturnFlights(returnResponse.data);
            } else {
                setReturnFlights([]);
            }
        } catch (error) {
            console.error('Error searching flights:', error);
        } finally {
            setSearching(false);
        }
    };

    // Clear return date when switching to one-way
    const handleFlightTypeChange = (value: 'one-way' | 'round-trip') => {
        setFlightType(value);
        if (value === 'one-way') {
            setReturnDate('');
            setReturnFlights([]);
        }
    };

    const formatDateTime = (dateTimeString: string) => {
        return format(new Date(dateTimeString), 'MMM d, yyyy HH:mm');
    };

    const formatDuration = (duration: string) => {
        return duration.replace('PT', '').toLowerCase();
    };

    const getTotalPassengers = () => {
        return parseInt(passengers.adults) + parseInt(passengers.children) + parseInt(passengers.infants);
    };

    const handlePassengerChange = (type: keyof PassengerCounts, value: string) => {
        setPassengers(prev => {
            const newPassengers = { ...prev, [type]: value };
            
            // Validate infant count (cannot exceed adult count)
            if (type === 'adults' && parseInt(value) < parseInt(newPassengers.infants)) {
                newPassengers.infants = value;
            }
            
            return newPassengers;
        });
    };

    const getAirlineInfo = (carrierCode: string) => {
        return airlines[carrierCode];
    };

    // Get unique airlines from search results
    const getUniqueAirlines = (flights: FlightOffer[]) => {
        const uniqueAirlines = new Set<string>();
        flights.forEach(offer => {
            offer.itineraries[0].segments.forEach(segment => {
                uniqueAirlines.add(segment.carrierCode);
            });
        });
        return Array.from(uniqueAirlines);
    };

    // Filter flights by selected airlines
    const getFilteredFlights = (flights: FlightOffer[]) => {
        if (selectedAirlines.length === 0) return flights;
        
        return flights.filter(offer => {
            return offer.itineraries[0].segments.some(segment => 
                selectedAirlines.includes(segment.carrierCode)
            );
        });
    };

    // Toggle airline selection
    const toggleAirline = (airlineCode: string) => {
        setSelectedAirlines(prev => {
            if (prev.includes(airlineCode)) {
                return prev.filter(code => code !== airlineCode);
            }
            return [...prev, airlineCode];
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Flight Search
                </h2>
            }
        >
            <Head title="Flight Search" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Flights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Flight Type Selection */}
                                <div className="w-full max-w-[200px]">
                                    <Label>Flight Type</Label>
                                    <Select value={flightType} onValueChange={handleFlightTypeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select flight type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-way">One-way</SelectItem>
                                            <SelectItem value="round-trip">Round-trip</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Route and Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>From (Airport Code)</Label>
                                        <Input
                                            placeholder="Enter airport code (e.g. MNL)"
                                            value={origin}
                                            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                                            maxLength={3}
                                            className="uppercase"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>To (Airport Code)</Label>
                                        <Input
                                            placeholder="Enter airport code (e.g. SIN)"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value.toUpperCase())}
                                            maxLength={3}
                                            className="uppercase"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Departure Date</Label>
                                        <Input
                                            type="date"
                                            value={departureDate}
                                            onChange={(e) => {
                                                setDepartureDate(e.target.value);
                                                if (returnDate && returnDate < e.target.value) {
                                                    setReturnDate('');
                                                }
                                            }}
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Return Date {flightType === 'one-way' && '(Disabled for one-way)'}</Label>
                                        <Input
                                            type="date"
                                            value={returnDate}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            min={departureDate || format(new Date(), 'yyyy-MM-dd')}
                                            disabled={flightType === 'one-way'}
                                            className={flightType === 'one-way' ? 'opacity-50 cursor-not-allowed' : ''}
                                        />
                                    </div>
                                </div>

                                {/* Passengers and Travel Class */}
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                    {/* Passengers Section - Takes up 3 columns */}
                                    <div className="lg:col-span-3 space-y-4">
                                        <Label>Passengers</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm text-gray-500">Adults (12+ years)</Label>
                                                <Select 
                                                    value={passengers.adults} 
                                                    onValueChange={(value) => handlePassengerChange('adults', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select adults" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                                            <SelectItem key={num} value={num.toString()}>
                                                                {num} {num === 1 ? 'Adult' : 'Adults'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm text-gray-500">Children (2-11 years)</Label>
                                                <Select 
                                                    value={passengers.children} 
                                                    onValueChange={(value) => handlePassengerChange('children', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select children" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                                            <SelectItem key={num} value={num.toString()}>
                                                                {num} {num === 1 ? 'Child' : 'Children'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm text-gray-500">Infants (under 2)</Label>
                                                <Select 
                                                    value={passengers.infants} 
                                                    onValueChange={(value) => handlePassengerChange('infants', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select infants" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: parseInt(passengers.adults) + 1 }, (_, i) => (
                                                            <SelectItem key={i} value={i.toString()}>
                                                                {i} {i === 1 ? 'Infant' : 'Infants'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Total passengers: {getTotalPassengers()}
                                        </div>
                                    </div>

                                    {/* Travel Class - Takes up 1 column */}
                                    <div className="space-y-2">
                                        <div className="space-y-3">
                                            <Label>Travel Class</Label>
                                            <p className="text-sm text-gray-500">Select your preferred cabin class</p>
                                            <Select value={travelClass} onValueChange={setTravelClass}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ECONOMY">Economy</SelectItem>
                                                    <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                                                    <SelectItem value="BUSINESS">Business</SelectItem>
                                                    <SelectItem value="FIRST">First</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Button */}
                                <Button
                                    className="w-full md:w-auto"
                                    onClick={handleSearch}
                                    disabled={!origin || !destination || !departureDate || searching}
                                >
                                    {searching ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Plane className="mr-2 h-4 w-4" />
                                            Search Flights
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {(searchResults.length > 0 || returnFlights.length > 0) && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Filter Panel */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Filter by Airlines</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {getUniqueAirlines([...searchResults, ...returnFlights]).map(airlineCode => (
                                                <div key={airlineCode} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`airline-${airlineCode}`}
                                                        checked={selectedAirlines.includes(airlineCode)}
                                                        onChange={() => toggleAirline(airlineCode)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <label htmlFor={`airline-${airlineCode}`} className="flex items-center space-x-2">
                                                        {getAirlineInfo(airlineCode) ? (
                                                            <>
                                                                <span className="text-sm">
                                                                    {getAirlineInfo(airlineCode)?.name}
                                                                </span>
                                                                <img 
                                                                    src={getAirlineInfo(airlineCode)?.logo}
                                                                    alt={`${getAirlineInfo(airlineCode)?.name} logo`}
                                                                    className="h-16 w-auto mb-3 object-contain"
                                                                />
                                                            </>
                                                        ) : (
                                                            <span className="text-sm">{airlineCode}</span>
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Search Results */}
                            <div className="md:col-span-3 space-y-6">
                                {searchResults.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Outbound Flights</h3>
                                        {getFilteredFlights(searchResults).map((offer) => (
                                            <Card key={offer.id}>
                                                <CardContent className="pt-6">
                                                    {offer.itineraries[0].segments.map((segment, index) => (
                                                        <div key={index} className="flex items-center gap-4 mb-4">
                                                            <div className="flex-1">
                                                                <div className="flex justify-between mb-2">
                                                                    <div>
                                                                        <div className="font-semibold">{formatDateTime(segment.departure.at)}</div>
                                                                        <div className="text-sm text-gray-500">{segment.departure.iataCode}</div>
                                                                    </div>
                                                                    <div className="text-center flex flex-col items-center">
                                                                        {getAirlineInfo(segment.carrierCode) ? (
                                                                            <>
                                                                                <img 
                                                                                    src={getAirlineInfo(segment.carrierCode)?.logo} 
                                                                                    alt={`${getAirlineInfo(segment.carrierCode)?.name} logo`}
                                                                                    className="h-16 w-auto mb-3 object-contain"
                                                                                />
                                                                                <div className="text-sm font-medium mb-1">
                                                                                    {getAirlineInfo(segment.carrierCode)?.name}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div className="h-16 w-16 flex items-center justify-center text-gray-400 mb-3">
                                                                                    <Plane className="h-10 w-10" />
                                                                                </div>
                                                                                <div className="text-sm font-medium mb-1">
                                                                                    {segment.carrierCode}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        <div className="text-sm text-gray-500">{formatDuration(segment.duration)}</div>
                                                                        <div className="text-xs">Flight {segment.carrierCode}{segment.number}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-semibold">{formatDateTime(segment.arrival.at)}</div>
                                                                        <div className="text-sm text-gray-500">{segment.arrival.iataCode}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                                        <div>
                                                            <div className="text-lg font-semibold">
                                                                {offer.price.currency} {parseFloat(offer.price.total).toLocaleString()}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <span>{offer.numberOfBookableSeats} seats available</span>
                                                                <span>•</span>
                                                                <span>{travelClass.charAt(0) + travelClass.slice(1).toLowerCase().replace('_', ' ')}</span>
                                                            </div>
                                                        </div>
                                                        <Button>Select Flight</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {returnFlights.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Return Flights</h3>
                                        {getFilteredFlights(returnFlights).map((offer) => (
                                            <Card key={offer.id}>
                                                <CardContent className="pt-6">
                                                    {offer.itineraries[0].segments.map((segment, index) => (
                                                        <div key={index} className="flex items-center gap-4 mb-4">
                                                            <div className="flex-1">
                                                                <div className="flex justify-between mb-2">
                                                                    <div>
                                                                        <div className="font-semibold">{formatDateTime(segment.departure.at)}</div>
                                                                        <div className="text-sm text-gray-500">{segment.departure.iataCode}</div>
                                                                    </div>
                                                                    <div className="text-center flex flex-col items-center">
                                                                        {getAirlineInfo(segment.carrierCode) ? (
                                                                            <>
                                                                                <img 
                                                                                    src={getAirlineInfo(segment.carrierCode)?.logo} 
                                                                                    alt={`${getAirlineInfo(segment.carrierCode)?.name} logo`}
                                                                                    className="h-16 w-auto mb-3 object-contain"
                                                                                />
                                                                                <div className="text-sm font-medium mb-1">
                                                                                    {getAirlineInfo(segment.carrierCode)?.name}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div className="h-16 w-16 flex items-center justify-center text-gray-400 mb-3">
                                                                                    <Plane className="h-10 w-10" />
                                                                                </div>
                                                                                <div className="text-sm font-medium mb-1">
                                                                                    {segment.carrierCode}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        <div className="text-sm text-gray-500">{formatDuration(segment.duration)}</div>
                                                                        <div className="text-xs">Flight {segment.carrierCode}{segment.number}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-semibold">{formatDateTime(segment.arrival.at)}</div>
                                                                        <div className="text-sm text-gray-500">{segment.arrival.iataCode}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                                        <div>
                                                            <div className="text-lg font-semibold">
                                                                {offer.price.currency} {parseFloat(offer.price.total).toLocaleString()}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <span>{offer.numberOfBookableSeats} seats available</span>
                                                                <span>•</span>
                                                                <span>{travelClass.charAt(0) + travelClass.slice(1).toLowerCase().replace('_', ' ')}</span>
                                                            </div>
                                                        </div>
                                                        <Button>Select Flight</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
