import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import DownloadPdfButton from '@/Components/DownloadPdfButton';

interface PageProps {
    hostname: string;
}

export default function PrivacyPolicy({ hostname }: PageProps) {
    return (
        <GuestLayout>
            <Head title="Privacy Policy" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                                <DownloadPdfButton contentId="privacy-content" fileName={`${hostname}-privacy-policy`} />
                            </div>
                            
                            <div id="privacy-content" className="space-y-6">
                                <section>
                                    <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                                    <p>Welcome to {hostname} App. We are committed to protecting your personal information and your right to privacy. This policy specifically details how we handle your data, including information obtained through Google services integration.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                                    <p>We collect information that you provide directly to us, including:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Account information (name, email, password)</li>
                                        <li>Profile information</li>
                                        <li>Usage data and preferences</li>
                                    </ul>
                                    
                                    <h3 className="text-lg font-semibold mt-4 mb-2">Google User Data</h3>
                                    <p>When you choose to connect your Google account, we may access:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Basic profile information (name, email, profile picture)</li>
                                        <li>Google Calendar data (for scheduling and availability)</li>
                                        <li>Google Drive access (for document storage and sharing)</li>
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

                                    <h3 className="text-lg font-semibold mt-4 mb-2">Use of Google User Data</h3>
                                    <p>Google user data is specifically used for:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Authentication and account creation</li>
                                        <li>Calendar integration for scheduling appointments</li>
                                        <li>Document storage and sharing through Google Drive</li>
                                        <li>Enhancing user experience through personalization</li>
                                    </ul>
                                    <p className="mt-2">We do not sell, rent, or share your Google user data with third parties except as necessary to provide our services or as required by law.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                                    <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
                                    
                                    <h3 className="text-lg font-semibold mt-4 mb-2">Google Data Security</h3>
                                    <p>For Google user data, we implement additional security measures:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Encryption in transit and at rest</li>
                                        <li>Regular security audits and monitoring</li>
                                        <li>Limited employee access based on need-to-know basis</li>
                                        <li>Secure OAuth 2.0 authentication flow</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                                    <p>You have the right to:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Access your personal information</li>
                                        <li>Correct inaccurate data</li>
                                        <li>Request deletion of your data</li>
                                        <li>Object to processing of your data</li>
                                        <li>Revoke Google account access at any time</li>
                                        <li>Request a copy of your Google data we store</li>
                                        <li>Limit the Google data we can access</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">6. Data Retention and Deletion</h2>
                                    <p>We retain Google user data only for as long as necessary to provide our services. When you disconnect your Google account or delete your {hostname} account:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>We immediately revoke our access to your Google account</li>
                                        <li>Your Google data is deleted from our active systems within 30 days</li>
                                        <li>Backup copies are deleted within 90 days</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">7. Limited Use Disclosure</h2>
                                    <p>Our use and transfer of information received from Google APIs to any other app will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
                                    <p>If you have any questions about this Privacy Policy or our handling of Google user data, please contact us at:</p>
                                    <ul className="list-disc ml-6 mt-2">
                                        <li>Email: jrcrodua@gmail.com</li>
                                        <li>Phone: +639083602817</li>
                                        <li>Address: Sitio Fabrica, Brgy. Poblacion, Sagbayan, Bohol</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
                                    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and, if the changes significantly affect your rights or our usage of Google user data, we will provide a more prominent notice and obtain consent where required.</p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
} 