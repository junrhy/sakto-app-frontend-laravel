import { useState } from 'react';

interface Contact {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    call_number: string | null;
    sms_number: string | null;
    whatsapp: string | null;
    address: string | null;
    id_picture: string | null;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface ContactsSectionProps {
    contacts: Contact[];
}

export default function ContactsSection({ contacts }: ContactsSectionProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState<
        'all' | 'name' | 'email' | 'phone'
    >('all');
    const [expandedContacts, setExpandedContacts] = useState<Set<number>>(
        new Set(),
    );

    const toggleContactExpansion = (contactId: number) => {
        const newExpanded = new Set(expandedContacts);
        if (newExpanded.has(contactId)) {
            newExpanded.delete(contactId);
        } else {
            newExpanded.add(contactId);
        }
        setExpandedContacts(newExpanded);
    };

    // Filter contacts based on search term and filter type
    const filteredContacts = contacts.filter((contact) => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase();

        switch (filterBy) {
            case 'name':
                const fullName =
                    `${contact.first_name} ${contact.middle_name || ''} ${contact.last_name}`.toLowerCase();
                return fullName.includes(searchLower);
            case 'email':
                return contact.email.toLowerCase().includes(searchLower);
            case 'phone':
                const phoneNumbers = [
                    contact.call_number,
                    contact.sms_number,
                    contact.whatsapp,
                ]
                    .filter(Boolean)
                    .join(' ');
                return phoneNumbers.toLowerCase().includes(searchLower);
            case 'all':
            default:
                const allFields = [
                    contact.first_name,
                    contact.middle_name,
                    contact.last_name,
                    contact.email,
                    contact.call_number,
                    contact.sms_number,
                    contact.whatsapp,
                    contact.address,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return allFields.includes(searchLower);
        }
    });
    if (contacts.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    No members found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No members have been added yet
                </p>
            </div>
        );
    }

    if (searchTerm && filteredContacts.length === 0) {
        return (
            <>
                {/* Filter Section */}
                <div className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Filter Dropdown */}
                        <div className="sm:w-48">
                            <select
                                value={filterBy}
                                onChange={(e) =>
                                    setFilterBy(
                                        e.target.value as
                                            | 'all'
                                            | 'name'
                                            | 'email'
                                            | 'phone',
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="all">All Fields</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg
                        className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        No members found
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search terms or filter
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Filter Section */}
            <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="sm:w-48">
                        <select
                            value={filterBy}
                            onChange={(e) =>
                                setFilterBy(
                                    e.target.value as
                                        | 'all'
                                        | 'name'
                                        | 'email'
                                        | 'phone',
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        >
                            <option value="all">All Fields</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                {searchTerm && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Found {filteredContacts.length} of {contacts.length}{' '}
                        members
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredContacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => toggleContactExpansion(contact.id)}
                        className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:shadow-gray-900/70"
                    >
                        {/* Contact Header */}
                        <div className="p-6">
                            <div className="flex items-center">
                                {/* Contact Avatar */}
                                <div className="mr-4 flex-shrink-0">
                                    {contact.id_picture ? (
                                        <img
                                            src={contact.id_picture}
                                            alt={`${contact.first_name} ${contact.last_name}`}
                                            className="h-12 w-12 rounded-full border-2 border-gray-200 object-cover dark:border-gray-600"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                                            {contact.first_name
                                                .charAt(0)
                                                .toUpperCase()}
                                            {contact.last_name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Contact Name and Click Indicator */}
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                        {contact.first_name}{' '}
                                        {contact.middle_name &&
                                            `${contact.middle_name} `}
                                        {contact.last_name}
                                    </h3>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {expandedContacts.has(contact.id)
                                            ? 'Click to hide details'
                                            : 'Click to view details'}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details - Only show when expanded */}
                            {expandedContacts.has(contact.id) && (
                                <div className="mt-6 space-y-3">
                                    {/* Email */}
                                    <div
                                        className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg
                                            className="mr-3 h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="truncate text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {contact.email}
                                        </a>
                                    </div>

                                    {/* Address */}
                                    {contact.address && (
                                        <div
                                            className="flex items-start text-sm text-gray-600 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg
                                                className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="line-clamp-2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {contact.address}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
