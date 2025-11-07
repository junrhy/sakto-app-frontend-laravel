import MerchantLayout from '@/Layouts/Merchant/MerchantLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface MerchantProfile {
    business_name: string;
    business_type?: string | null;
    industry?: string | null;
    website?: string | null;
    phone?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
}

interface Stats {
    total_customers: number;
    active_customers: number;
    total_orders: number;
    total_revenue: number;
}

interface DashboardProps extends PageProps {
    profile?: MerchantProfile | null;
    stats: Stats;
}

const cards = [
    {
        key: 'total_customers',
        label: 'Total Customers',
        color: 'from-indigo-500 to-indigo-600',
        formatter: (value: number) => value.toLocaleString(),
    },
    {
        key: 'active_customers',
        label: 'Active Customers',
        color: 'from-emerald-500 to-emerald-600',
        formatter: (value: number) => value.toLocaleString(),
    },
    {
        key: 'total_orders',
        label: 'Orders Processed',
        color: 'from-sky-500 to-sky-600',
        formatter: (value: number) => value.toLocaleString(),
    },
    {
        key: 'total_revenue',
        label: 'Revenue (All Time)',
        color: 'from-amber-500 to-amber-600',
        formatter: (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
] as const;

export default function Dashboard({ auth, profile, stats }: DashboardProps) {
    const contactPhone =
        profile?.phone ??
        (auth.user && 'contact_number' in auth.user
            ? (auth.user as { contact_number?: string }).contact_number ?? null
            : null);

    return (
        <MerchantLayout
            auth={auth}
            title="Merchant Dashboard"
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        Welcome back, {profile?.business_name ?? auth.user?.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Overview of your merchant operations
                    </p>
                </div>
            }
        >
            <Head title="Merchant Dashboard" />

            <div className="space-y-8">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <div
                            key={card.key}
                            className={`rounded-xl bg-gradient-to-br ${card.color} p-[1px] shadow-lg`}
                        >
                            <div className="h-full rounded-xl bg-white p-5 dark:bg-gray-900">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {card.label}
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {card.formatter(stats[card.key])}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Business Profile
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Snapshot of your business information
                                </p>
                            </div>
                            <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
                                <ProfileRow label="Business Name" value={profile?.business_name ?? 'Not set'} />
                                <ProfileRow label="Business Type" value={profile?.business_type ?? 'Not set'} />
                                <ProfileRow label="Industry" value={profile?.industry ?? 'Not set'} />
                                <ProfileRow
                                    label="Website"
                                    value={profile?.website ? (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                        >
                                            {profile.website}
                                        </a>
                                    ) : (
                                        'Not set'
                                    )}
                                />
                                <ProfileRow label="Contact Email" value={auth.user?.email ?? 'Not set'} />
                                <ProfileRow label="Contact Phone" value={contactPhone ?? 'Not set'} />
                                <ProfileRow label="Country" value={profile?.country ?? 'Not set'} />
                                <ProfileRow label="City" value={profile?.city ?? 'Not set'} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                Quick actions
                            </h3>
                            <div className="mt-4 space-y-3">
                                <ActionButton href="#" label="Create new catalog" />
                                <ActionButton href="#" label="Invite team member" />
                                <ActionButton href="#" label="Connect payment channels" />
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                Next steps
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Configure your product catalog</li>
                                <li>• Set delivery and fulfillment preferences</li>
                                <li>• Invite teammates to collaborate</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </MerchantLayout>
    );
}

interface ProfileRowProps {
    label: string;
    value: React.ReactNode;
}

function ProfileRow({ label, value }: ProfileRowProps) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {label}
            </p>
            <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    );
}

interface ActionButtonProps {
    href: string;
    label: string;
}

function ActionButton({ href, label }: ActionButtonProps) {
    return (
        <Link
            href={href}
            className="block rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
            {label}
        </Link>
    );
}
