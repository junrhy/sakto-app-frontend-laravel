import DownloadPdfButton from '@/Components/DownloadPdfButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

interface PageProps {
    hostname: string;
}

export default function CookiePolicy({ hostname }: PageProps) {
    return (
        <GuestLayout>
            <Head title="Cookie Policy" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-8 flex items-center justify-between">
                                <h1 className="text-3xl font-bold">
                                    Cookie Policy
                                </h1>
                                <DownloadPdfButton
                                    contentId="cookie-content"
                                    fileName={`${hostname}-cookie-policy`}
                                />
                            </div>

                            <div id="cookie-content" className="space-y-6">
                                <section>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        1. What Are Cookies
                                    </h2>
                                    <p>
                                        Cookies are small pieces of text sent by
                                        your web browser by a website you visit.
                                        A cookie file is stored in your web
                                        browser and allows the service or a
                                        third-party to recognize you and make
                                        your next visit easier and more useful
                                        to you.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        2. How We Use Cookies
                                    </h2>
                                    <p>
                                        We use cookies for the following
                                        purposes:
                                    </p>
                                    <ul className="ml-6 mt-2 list-disc">
                                        <li>
                                            Authentication - We use cookies to
                                            identify you when you visit our
                                            website and as you navigate our
                                            website
                                        </li>
                                        <li>
                                            Status - We use cookies to help us
                                            to determine if you are logged into
                                            our website
                                        </li>
                                        <li>
                                            Personalization - We use cookies to
                                            store information about your
                                            preferences and to personalize the
                                            website for you
                                        </li>
                                        <li>
                                            Security - We use cookies as an
                                            element of the security measures
                                            used to protect user accounts and
                                            our website in general
                                        </li>
                                        <li>
                                            Analysis - We use cookies to help us
                                            to analyze the use and performance
                                            of our website and services
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        3. Types of Cookies We Use
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium">
                                                Essential Cookies:
                                            </h3>
                                            <p>
                                                These cookies are necessary for
                                                the website to function and
                                                cannot be switched off. They are
                                                usually only set in response to
                                                actions made by you which amount
                                                to a request for services.
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                Performance Cookies:
                                            </h3>
                                            <p>
                                                These cookies allow us to count
                                                visits and traffic sources so we
                                                can measure and improve the
                                                performance of our site.
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                Functionality Cookies:
                                            </h3>
                                            <p>
                                                These cookies enable the website
                                                to provide enhanced
                                                functionality and
                                                personalization.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        4. Managing Cookies
                                    </h2>
                                    <p>
                                        Most browsers allow you to refuse to
                                        accept cookies and to delete them. The
                                        methods for doing so vary from browser
                                        to browser, and from version to version.
                                        You can however obtain up-to-date
                                        information about blocking and deleting
                                        cookies via these links:
                                    </p>
                                    <ul className="ml-6 mt-2 list-disc">
                                        <li>
                                            Chrome: chrome://settings/cookies
                                        </li>
                                        <li>
                                            Firefox: about:preferences#privacy
                                        </li>
                                        <li>
                                            Safari:
                                            support.apple.com/guide/safari/manage-cookies
                                        </li>
                                        <li>
                                            Edge:
                                            microsoft.com/edge/support/privacy
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        5. Impact of Blocking Cookies
                                    </h2>
                                    <p>
                                        Blocking all cookies will have a
                                        negative impact upon the usability of
                                        many websites. If you block cookies, you
                                        will not be able to use all the features
                                        on our website.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        6. Changes to Cookie Policy
                                    </h2>
                                    <p>
                                        We may update this policy from time to
                                        time by publishing a new version on our
                                        website. You should check this page
                                        occasionally to ensure you are happy
                                        with any changes to this policy.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        7. Contact Us
                                    </h2>
                                    <p>
                                        If you have any questions about our
                                        Cookie Policy, please contact us.
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
