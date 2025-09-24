import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Jobs({ auth }: PageProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Mock job data - replace with actual data from your backend
    const jobs = [
        {
            id: 1,
            title: 'Senior Frontend Developer',
            company: 'Tech Solutions Inc.',
            location: 'Manila, Philippines',
            type: 'Full-time',
            salary: '₱80,000 - ₱120,000',
            category: 'Development',
            posted: '2 days ago',
            description:
                'We are looking for an experienced Frontend Developer to join our team...',
        },
        {
            id: 2,
            title: 'UX/UI Designer',
            company: 'Creative Studios',
            location: 'Cebu, Philippines',
            type: 'Full-time',
            salary: '₱60,000 - ₱90,000',
            category: 'Design',
            posted: '1 day ago',
            description: 'Join our creative team as a UX/UI Designer...',
        },
        // Add more mock jobs as needed
    ];

    return (
        <>
            <Head title="Job Board - Find Your Next Career" />
            <div className="min-h-screen bg-gray-50">
                {/* Navigation */}
                <nav className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center">
                                    <ApplicationLogo className="block h-9 w-auto" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', {
                                                project: 'jobs',
                                            })}
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'jobs',
                                            })}
                                            className="ml-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Search Section */}
                <div className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex gap-4">
                                <select
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Development">
                                        Development
                                    </option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                </select>
                                <select
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={selectedLocation}
                                    onChange={(e) =>
                                        setSelectedLocation(e.target.value)
                                    }
                                >
                                    <option value="all">All Locations</option>
                                    <option value="Manila">Manila</option>
                                    <option value="Cebu">Cebu</option>
                                    <option value="Davao">Davao</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="grid gap-6">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                <Link
                                                    href="#"
                                                    className="hover:text-indigo-600"
                                                >
                                                    {job.title}
                                                </Link>
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {job.company}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                    {job.location}
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                                    {job.type}
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    {job.salary}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:ml-6 md:mt-0">
                                            <Link
                                                href="#"
                                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                            >
                                                Apply Now
                                            </Link>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500">
                                        {job.description}
                                    </p>
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <svg
                                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Posted {job.posted}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                        <div className="mt-8 md:order-1 md:mt-0">
                            <p className="text-center text-base text-gray-400">
                                &copy; 2024 Job Board. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
