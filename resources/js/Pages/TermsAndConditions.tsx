import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import DownloadPdfButton from '@/Components/DownloadPdfButton';

export default function TermsAndConditions() {
    return (
        <GuestLayout>
            <Head title="Terms and Conditions" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-bold">Terms and Conditions</h1>
                                <DownloadPdfButton contentId="terms-content" fileName="sakto-terms-and-conditions" />
                            </div>
                            
                            <div id="terms-content" className="space-y-6">
                                <section>
                                    <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                                    <p>By accessing and using Sakto App, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                                    <p>Permission is granted to temporarily access the materials within Sakto App for personal, non-commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Modify or copy the materials</li>
                                        <li>Use the materials for any commercial purpose</li>
                                        <li>Attempt to decompile or reverse engineer any software contained in Sakto App</li>
                                        <li>Remove any copyright or other proprietary notations from the materials</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">3. User Account</h2>
                                    <p>To access certain features of Sakto App, you may be required to create an account. You agree to:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Provide accurate and complete information</li>
                                        <li>Maintain the security of your account credentials</li>
                                        <li>Promptly update your account information</li>
                                        <li>Accept responsibility for all activities under your account</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">4. Service Modifications</h2>
                                    <p>We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
                                    <p>Sakto App and its suppliers shall not be liable for any damages arising out of or in connection with the use or inability to use the materials on Sakto App, even if we have been notified of the possibility of such damage.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">6. Governing Law</h2>
                                    <p>These terms and conditions are governed by and construed in accordance with the laws of the Philippines and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
                                    <p>We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated terms on the site. Your decision to continue to visit and make use of the site after such changes have been made constitutes your formal acceptance of the new Terms of Use.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">8. Contact Information</h2>
                                    <p>If you have any questions about these Terms and Conditions, please contact us.</p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
} 