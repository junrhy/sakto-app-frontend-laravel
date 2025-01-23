import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import DownloadPdfButton from '@/Components/DownloadPdfButton';

export default function PrivacyPolicy() {
    return (
        <GuestLayout>
            <Head title="Privacy Policy" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                                <DownloadPdfButton contentId="privacy-content" fileName="sakto-privacy-policy" />
                            </div>
                            
                            <div id="privacy-content" className="space-y-6">
                                <section>
                                    <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                                    <p>Welcome to Sakto App. We are committed to protecting your personal information and your right to privacy.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                                    <p>We collect information that you provide directly to us, including:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Account information (name, email, password)</li>
                                        <li>Profile information</li>
                                        <li>Usage data and preferences</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                                    <p>We use the information we collect to:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Provide, maintain, and improve our services</li>
                                        <li>Process your transactions</li>
                                        <li>Send you technical notices and support messages</li>
                                        <li>Communicate with you about products, services, and events</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                                    <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                                    <p>You have the right to:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Access your personal information</li>
                                        <li>Correct inaccurate data</li>
                                        <li>Request deletion of your data</li>
                                        <li>Object to processing of your data</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
                                    <p>If you have any questions about this Privacy Policy, please contact us.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
                                    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
} 