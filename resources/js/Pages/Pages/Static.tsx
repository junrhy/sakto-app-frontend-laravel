import React from 'react';
import { Link } from '@inertiajs/react';

interface StaticProps {
    slug: string;
}

const Static: React.FC<StaticProps> = ({ slug }) => {
    const host = window.location.origin;
    const familyId = 'b6ac6642-4a05-4ede-9423-54adb9a0b9f1';

    if (slug === 'bitaganfamily') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMEwzNiAxOG0wIDBsMTggMTgiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bitagan Family</h1>
                        <p className="text-lg text-gray-600">Explore and manage your family connections</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Family Tree Card */}
                        <Link 
                            href={`${host}/family-tree/${familyId}/full-view`}
                            className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Family Tree</h2>
                                <p className="text-gray-600">View the complete family tree structure and relationships</p>
                            </div>
                        </Link>

                        {/* Printable Family Tree Card */}
                        <Link 
                            href={`${host}/family-tree/${familyId}/printable`}
                            className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">Printable Family Tree</h2>
                                <p className="text-gray-600">Download and print your family tree for keepsakes</p>
                            </div>
                        </Link>

                        {/* Family Members Card */}
                        <Link 
                            href={`${host}/family-tree/${familyId}/members`}
                            className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Family Members</h2>
                                <p className="text-gray-600">View and manage your family members' information</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Static;
