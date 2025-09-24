import DownloadPdfButton from '@/Components/DownloadPdfButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

interface PageProps {
    hostname: string;
}

export default function FAQ({ hostname }: PageProps) {
    return (
        <GuestLayout>
            <Head title="FAQ" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-8 flex items-center justify-between">
                                <h1 className="text-3xl font-bold">
                                    Frequently Asked Questions
                                </h1>
                                <DownloadPdfButton
                                    contentId="faq-content"
                                    fileName={`${hostname}-faq`}
                                />
                            </div>

                            <div id="faq-content" className="space-y-8">
                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        What is {hostname} App?
                                    </h2>
                                    <p className="text-gray-600">
                                        {hostname} App is a comprehensive
                                        business management platform that offers
                                        various modules including POS systems,
                                        inventory management, clinic management,
                                        rental management, and more. It's
                                        designed to help businesses streamline
                                        their operations and improve efficiency.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        How do I get started with {hostname}{' '}
                                        App?
                                    </h2>
                                    <p className="text-gray-600">
                                        Getting started is easy! Simply register
                                        for an account, choose the modules you
                                        need for your business, and follow our
                                        setup guides. Our intuitive interface
                                        makes it simple to begin managing your
                                        business operations right away.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        What features are included in the basic
                                        plan?
                                    </h2>
                                    <p className="text-gray-600">
                                        The basic plan includes essential
                                        features such as user management, basic
                                        reporting, and access to core modules.
                                        Specific features vary by module -
                                        please contact our sales team for
                                        detailed information about our pricing
                                        plans.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        Can I use {hostname} App on mobile
                                        devices?
                                    </h2>
                                    <p className="text-gray-600">
                                        Yes! {hostname} App is fully responsive
                                        and works on all modern devices
                                        including smartphones and tablets. You
                                        can access your business data anytime,
                                        anywhere.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        How secure is my data?
                                    </h2>
                                    <p className="text-gray-600">
                                        We take security seriously. Your data is
                                        protected with industry-standard
                                        encryption, regular backups, and strict
                                        access controls. We comply with all
                                        relevant data protection regulations to
                                        ensure your information is safe.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        Do you offer customer support?
                                    </h2>
                                    <p className="text-gray-600">
                                        Yes, we provide comprehensive customer
                                        support through multiple channels
                                        including email, phone, and chat. Our
                                        support team is available during
                                        business hours to help you with any
                                        questions or issues.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        Can I customize the modules for my
                                        business?
                                    </h2>
                                    <p className="text-gray-600">
                                        Yes, many of our modules offer
                                        customization options to match your
                                        business needs. You can configure
                                        settings, add custom fields, and adjust
                                        workflows to suit your operations.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        How do I update my subscription?
                                    </h2>
                                    <p className="text-gray-600">
                                        You can update your subscription at any
                                        time through your account settings.
                                        Simply navigate to the billing section
                                        to upgrade, downgrade, or modify your
                                        subscription options.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        Is training available?
                                    </h2>
                                    <p className="text-gray-600">
                                        Yes, we provide training resources
                                        including documentation, video
                                        tutorials, and webinars. For enterprise
                                        customers, we also offer personalized
                                        training sessions.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-2 text-xl font-semibold">
                                        What payment methods do you accept?
                                    </h2>
                                    <p className="text-gray-600">
                                        We accept major credit cards, bank
                                        transfers, and other popular payment
                                        methods. Payment options may vary by
                                        region.
                                    </p>
                                </section>

                                <section className="mt-12 border-t border-gray-200 pt-6">
                                    <h2 className="mb-4 text-xl font-semibold">
                                        Still have questions?
                                    </h2>
                                    <p className="text-gray-600">
                                        Can't find the answer you're looking
                                        for? Please contact our support team for
                                        assistance.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
