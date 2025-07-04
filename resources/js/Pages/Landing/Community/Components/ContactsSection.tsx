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
    const [filterBy, setFilterBy] = useState<'all' | 'name' | 'email' | 'phone'>('all');
    const [expandedContacts, setExpandedContacts] = useState<Set<number>>(new Set());

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
                const fullName = `${contact.first_name} ${contact.middle_name || ''} ${contact.last_name}`.toLowerCase();
                return fullName.includes(searchLower);
            case 'email':
                return contact.email.toLowerCase().includes(searchLower);
            case 'phone':
                const phoneNumbers = [
                    contact.call_number,
                    contact.sms_number,
                    contact.whatsapp
                ].filter(Boolean).join(' ');
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
                    contact.address
                ].filter(Boolean).join(' ').toLowerCase();
                return allFields.includes(searchLower);
        }
    });
    if (contacts.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No members found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">No members have been added yet</p>
            </div>
        );
    }

    if (searchTerm && filteredContacts.length === 0) {
        return (
            <>
                {/* Filter Section */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                                />
                            </div>
                        </div>
                        
                        {/* Filter Dropdown */}
                        <div className="sm:w-48">
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value as 'all' | 'name' | 'email' | 'phone')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                            >
                                <option value="all">All Fields</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No members found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search terms or filter</p>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Filter Section */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                            />
                        </div>
                    </div>
                    
                    {/* Filter Dropdown */}
                    <div className="sm:w-48">
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value as 'all' | 'name' | 'email' | 'phone')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
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
                        Found {filteredContacts.length} of {contacts.length} members
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => (
                    <div 
                        key={contact.id} 
                        onClick={() => toggleContactExpansion(contact.id)}
                        className="group bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/70 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer"
                    >
                        {/* Contact Header */}
                        <div className="p-6">
                            <div className="flex items-center">
                                {/* Contact Avatar */}
                                <div className="flex-shrink-0 mr-4">
                                    {contact.id_picture ? (
                                        <img 
                                            src={contact.id_picture} 
                                            alt={`${contact.first_name} ${contact.last_name}`}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {contact.first_name.charAt(0).toUpperCase()}{contact.last_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Contact Name and Click Indicator */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                                        {contact.first_name} {contact.middle_name && `${contact.middle_name} `}{contact.last_name}
                                    </h3>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {expandedContacts.has(contact.id) ? 'Click to hide details' : 'Click to view details'}
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
                                        <svg className="w-4 h-4 mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a 
                                            href={`mailto:${contact.email}`}
                                            className="truncate text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {contact.email}
                                        </a>
                                    </div>

                                    {/* Phone Numbers */}
                                    {contact.call_number && (
                                        <div 
                                            className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4 mr-3 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <a 
                                                href={`tel:${contact.call_number}`}
                                                className="truncate text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {contact.call_number}
                                            </a>
                                        </div>
                                    )}

                                    {contact.sms_number && (
                                        <div 
                                            className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4 mr-3 text-purple-500 dark:text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <a 
                                                href={`sms:${contact.sms_number}`}
                                                className="truncate text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {contact.sms_number}
                                            </a>
                                        </div>
                                    )}

                                    {contact.whatsapp && (
                                        <div 
                                            className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4 mr-3 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                            </svg>
                                            <a 
                                                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="truncate text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {contact.whatsapp}
                                            </a>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {contact.address && (
                                        <div 
                                            className="flex items-start text-sm text-gray-600 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="line-clamp-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
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