import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    CalendarRange,
    ChevronRight,
    Clock,
    Compass,
    Mail,
    MapPin,
    Package,
    Phone,
    Star,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';

import type { PageProps } from '@/types';
import type { AppCurrencySettings, TravelPackage } from '@/Pages/Travel/travel';

type TravelAddress = {
    street?: string | null;
    unit_number?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    phone?: string | null;
};

type ThemeConfig = {
    pageBg: string;
    headerBorder: string;
    headerBackground: string;
    headerLabel: string;
    contactIcon: string;
    linkHover: string;
    heroMobileBg: string;
    heroShapePrimary: string;
    heroShapeSecondary: string;
    cardRing: string;
    accentButtonBg: string;
    accentButtonHover: string;
    secondaryButtonBorder: string;
    secondaryButtonText: string;
    secondaryButtonHover: string;
    accentTagBg: string;
    accentTagText: string;
    accentOutlineRing: string;
    accentCardBorder: string;
    accentCardBorderHover: string;
    cardDividerBorder: string;
    accentMutedBg: string;
    accentMutedText: string;
    accentBullet: string;
    accentLinkText: string;
    accentLinkHover: string;
    accentBadgeBorder: string;
    accentBadgeBg: string;
    accentBadgeText: string;
    accentStatusBg: string;
    accentStatusText: string;
    iconBgPrimary: string;
    iconBgSecondary: string;
    iconSecondaryText: string;
    footerBorder: string;
    footerTagLabel: string;
    footerSecondaryHover: string;
};

const themeOptions: Record<string, ThemeConfig> = {
    default: {
        pageBg: 'bg-sky-50',
        headerBorder: 'border-amber-100',
        headerBackground: 'bg-white/95',
        headerLabel: 'text-orange-500',
        contactIcon: 'text-orange-500',
        linkHover: 'hover:text-orange-600',
        heroMobileBg: 'bg-orange-50',
        heroShapePrimary: 'bg-orange-200/40',
        heroShapeSecondary: 'bg-sky-200/30',
        cardRing: 'ring-amber-100',
        accentButtonBg: 'bg-orange-500',
        accentButtonHover: 'hover:bg-orange-600',
        secondaryButtonBorder: 'border-amber-200',
        secondaryButtonText: 'text-orange-600',
        secondaryButtonHover: 'hover:bg-amber-50',
        accentTagBg: 'bg-amber-50',
        accentTagText: 'text-orange-600',
        accentOutlineRing: 'ring-orange-200',
        accentCardBorder: 'border-amber-100',
        accentCardBorderHover: 'hover:border-orange-200',
        cardDividerBorder: 'border-amber-100',
        accentMutedBg: 'bg-amber-50',
        accentMutedText: 'text-amber-700',
        accentBullet: 'bg-orange-500',
        accentLinkText: 'text-orange-500',
        accentLinkHover: 'hover:text-orange-600',
        accentBadgeBorder: 'border-amber-200',
        accentBadgeBg: 'bg-amber-50',
        accentBadgeText: 'text-orange-600',
        accentStatusBg: 'bg-orange-100',
        accentStatusText: 'text-orange-600',
        iconBgPrimary: 'bg-amber-50 text-orange-600',
        iconBgSecondary: 'bg-sky-50',
        iconSecondaryText: 'text-sky-600',
        footerBorder: 'border-amber-100',
        footerTagLabel: 'text-orange-500',
        footerSecondaryHover: 'hover:bg-amber-50',
    },
    ocean: {
        pageBg: 'bg-sky-100',
        headerBorder: 'border-cyan-200',
        headerBackground: 'bg-white/95',
        headerLabel: 'text-sky-600',
        contactIcon: 'text-sky-500',
        linkHover: 'hover:text-sky-700',
        heroMobileBg: 'bg-cyan-50',
        heroShapePrimary: 'bg-sky-200/50',
        heroShapeSecondary: 'bg-indigo-200/30',
        cardRing: 'ring-cyan-200',
        accentButtonBg: 'bg-sky-600',
        accentButtonHover: 'hover:bg-sky-700',
        secondaryButtonBorder: 'border-cyan-200',
        secondaryButtonText: 'text-sky-700',
        secondaryButtonHover: 'hover:bg-cyan-50',
        accentTagBg: 'bg-cyan-100',
        accentTagText: 'text-sky-700',
        accentOutlineRing: 'ring-sky-200',
        accentCardBorder: 'border-cyan-200',
        accentCardBorderHover: 'hover:border-cyan-300',
        cardDividerBorder: 'border-cyan-200',
        accentMutedBg: 'bg-cyan-50',
        accentMutedText: 'text-sky-700',
        accentBullet: 'bg-sky-500',
        accentLinkText: 'text-sky-600',
        accentLinkHover: 'hover:text-sky-700',
        accentBadgeBorder: 'border-cyan-200',
        accentBadgeBg: 'bg-cyan-50',
        accentBadgeText: 'text-sky-700',
        accentStatusBg: 'bg-sky-100',
        accentStatusText: 'text-sky-700',
        iconBgPrimary: 'bg-cyan-100 text-sky-700',
        iconBgSecondary: 'bg-sky-50',
        iconSecondaryText: 'text-sky-600',
        footerBorder: 'border-cyan-200',
        footerTagLabel: 'text-sky-600',
        footerSecondaryHover: 'hover:bg-cyan-50',
    },
    forest: {
        pageBg: 'bg-emerald-50',
        headerBorder: 'border-emerald-200',
        headerBackground: 'bg-white/95',
        headerLabel: 'text-emerald-600',
        contactIcon: 'text-emerald-500',
        linkHover: 'hover:text-emerald-700',
        heroMobileBg: 'bg-emerald-50',
        heroShapePrimary: 'bg-emerald-200/40',
        heroShapeSecondary: 'bg-lime-200/30',
        cardRing: 'ring-emerald-200',
        accentButtonBg: 'bg-emerald-600',
        accentButtonHover: 'hover:bg-emerald-700',
        secondaryButtonBorder: 'border-emerald-200',
        secondaryButtonText: 'text-emerald-700',
        secondaryButtonHover: 'hover:bg-emerald-50',
        accentTagBg: 'bg-emerald-100',
        accentTagText: 'text-emerald-700',
        accentOutlineRing: 'ring-emerald-200',
        accentCardBorder: 'border-emerald-200',
        accentCardBorderHover: 'hover:border-emerald-300',
        cardDividerBorder: 'border-emerald-200',
        accentMutedBg: 'bg-emerald-50',
        accentMutedText: 'text-emerald-700',
        accentBullet: 'bg-emerald-500',
        accentLinkText: 'text-emerald-600',
        accentLinkHover: 'hover:text-emerald-700',
        accentBadgeBorder: 'border-emerald-200',
        accentBadgeBg: 'bg-emerald-50',
        accentBadgeText: 'text-emerald-700',
        accentStatusBg: 'bg-emerald-100',
        accentStatusText: 'text-emerald-700',
        iconBgPrimary: 'bg-emerald-100 text-emerald-700',
        iconBgSecondary: 'bg-lime-50',
        iconSecondaryText: 'text-lime-600',
        footerBorder: 'border-emerald-200',
        footerTagLabel: 'text-emerald-600',
        footerSecondaryHover: 'hover:bg-emerald-50',
    },
    sunset: {
        pageBg: 'bg-rose-50',
        headerBorder: 'border-rose-200',
        headerBackground: 'bg-white/95',
        headerLabel: 'text-rose-500',
        contactIcon: 'text-rose-500',
        linkHover: 'hover:text-rose-600',
        heroMobileBg: 'bg-rose-50',
        heroShapePrimary: 'bg-rose-200/50',
        heroShapeSecondary: 'bg-amber-200/30',
        cardRing: 'ring-rose-200',
        accentButtonBg: 'bg-rose-500',
        accentButtonHover: 'hover:bg-rose-600',
        secondaryButtonBorder: 'border-rose-200',
        secondaryButtonText: 'text-rose-600',
        secondaryButtonHover: 'hover:bg-rose-50',
        accentTagBg: 'bg-rose-100',
        accentTagText: 'text-rose-600',
        accentOutlineRing: 'ring-rose-200',
        accentCardBorder: 'border-rose-200',
        accentCardBorderHover: 'hover:border-rose-300',
        cardDividerBorder: 'border-rose-200',
        accentMutedBg: 'bg-rose-50',
        accentMutedText: 'text-rose-600',
        accentBullet: 'bg-rose-500',
        accentLinkText: 'text-rose-500',
        accentLinkHover: 'hover:text-rose-600',
        accentBadgeBorder: 'border-rose-200',
        accentBadgeBg: 'bg-rose-50',
        accentBadgeText: 'text-rose-600',
        accentStatusBg: 'bg-rose-100',
        accentStatusText: 'text-rose-600',
        iconBgPrimary: 'bg-rose-100 text-rose-600',
        iconBgSecondary: 'bg-amber-50',
        iconSecondaryText: 'text-amber-600',
        footerBorder: 'border-rose-200',
        footerTagLabel: 'text-rose-500',
        footerSecondaryHover: 'hover:bg-rose-50',
    },
};

interface TravelShowProps extends PageProps {
    identifier: string;
    travel: {
        id: number;
        name: string;
        email: string;
        contact_number: string;
        app_currency: string | null;
        created_at: string;
        identifier: string;
        slug: string;
    };
    packages: TravelPackage[];
    appCurrency?: AppCurrencySettings | null;
    canLogin: boolean;
    canRegister: boolean;
    primaryAddress?: TravelAddress | null;
    theme?: string | null;
}

export default function TravelShow({
    travel,
    packages,
    appCurrency,
    canLogin,
    canRegister,
    auth,
    primaryAddress,
    theme: themeParam,
}: TravelShowProps) {
    const activeTheme =
        themeOptions[(themeParam ?? 'default').toLowerCase()] ?? themeOptions.default;
    const formatCurrency = useMemo(() => {
        const symbol = appCurrency?.symbol ?? '₱';
        const thousands = appCurrency?.thousands_separator ?? ',';
        const decimal = appCurrency?.decimal_separator ?? '.';

        return (value: number) => {
            const fixed = Number(value ?? 0).toFixed(2);
            const [whole, fraction] = fixed.split('.');
            const withGrouping = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
            return `${symbol}${withGrouping}${decimal}${fraction}`;
        };
    }, [appCurrency]);

    const formattedPackages = useMemo(() => {
        return packages.map((pkg) => {
            const inclusions = Array.isArray(pkg.inclusions)
                ? pkg.inclusions
                : [];

            return {
                ...pkg,
                inclusions,
                formattedPrice: formatCurrency(pkg.price ?? 0),
                durationLabel:
                    pkg.duration_label ??
                    (pkg.duration_days ? `${pkg.duration_days} days` : 'Custom itinerary'),
            };
        });
    }, [packages, formatCurrency]);

    const journeyStats = useMemo(() => {
        const totalPackages = formattedPackages.length;
        const featuredCount = formattedPackages.filter((pkg) => pkg.is_featured).length;
        const packageTypes = formattedPackages
            .map((pkg) => pkg.package_type)
            .filter((type): type is string => !!type && type.trim().length > 0);
        const uniqueTypes = Array.from(new Set(packageTypes));

        return [
            {
                label: 'Signature itineraries',
                value: totalPackages > 0 ? `${totalPackages}+` : 'Coming soon',
                description: 'Ready-to-book getaways',
            },
            {
                label: 'Signature escapes',
                value: featuredCount > 0 ? `${featuredCount}` : 'Handpicked',
                description: 'Premium experiences',
            },
            {
                label: 'Trip styles covered',
                value: uniqueTypes.length > 0 ? `${uniqueTypes.length}` : 'Custom',
                description:
                    uniqueTypes.length > 0
                        ? uniqueTypes.slice(0, 3).join(', ')
                        : 'Tailored to your goals',
            },
        ];
    }, [formattedPackages]);

    const highlightPackages = useMemo(() => {
        const featured = formattedPackages.filter((pkg) => pkg.is_featured).slice(0, 3);

        if (featured.length > 0) {
            return featured;
        }

        return formattedPackages.slice(0, 3);
    }, [formattedPackages]);

    const heroImages = useMemo(() => {
        const collected = formattedPackages
            .flatMap((pkg) => (Array.isArray(pkg.media) ? pkg.media : []))
            .filter((src): src is string => typeof src === 'string' && src.trim().length > 0);

        if (collected.length >= 3) {
            return collected.slice(0, 3);
        }

        if (collected.length > 0) {
            return collected.slice(0, Math.min(collected.length, 3));
        }

        const fallbackSets: Record<string, string[]> = {
            default: [
                'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
            ],
            ocean: [
                'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80',
            ],
            forest: [
                'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?auto=format&fit=crop&w=900&q=80',
            ],
            sunset: [
                'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=900&q=80',
            ],
        };

        return fallbackSets[themeParam ?? 'default'] ?? fallbackSets.default;
    }, [formattedPackages, themeParam]);

    const hasPackages = formattedPackages.length > 0;

    const formattedAddress = useMemo(() => {
        if (!primaryAddress) {
            return null;
        }

        const parts = [
            primaryAddress.unit_number,
            primaryAddress.street,
            primaryAddress.city,
            primaryAddress.state,
            primaryAddress.postal_code,
            primaryAddress.country,
        ]
            .filter((part) => typeof part === 'string' && part.trim().length > 0)
            .join(', ');

        return parts.length > 0 ? parts : null;
    }, [primaryAddress]);

    const getPrimaryImage = (pkg: TravelPackage): string | null => {
        if (!pkg.media || !Array.isArray(pkg.media)) {
            return null;
        }

        const firstValid = pkg.media.find((src) => typeof src === 'string' && src.trim().length > 0);
        return firstValid ?? null;
    };

    const fallbackPackageImage =
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=900&q=80';

    return (
        <div className={cn('min-h-screen', activeTheme.pageBg)}>
            <Head title={`${travel.name} Travel Packages`} />

            <header className={cn('border-b backdrop-blur', activeTheme.headerBorder, activeTheme.headerBackground)}>
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div>
                            <p className={cn('text-xs uppercase tracking-wide', activeTheme.headerLabel)}>Travel partner</p>
                            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{travel.name}</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 sm:border-l sm:border-slate-200 sm:pl-4">
                            {travel.contact_number && (
                                <div className="flex items-center gap-1.5">
                                    <Phone className={cn('h-4 w-4', activeTheme.contactIcon)} />
                                    <a
                                        href={`tel:${travel.contact_number}`}
                                        className={cn('transition-colors', activeTheme.linkHover)}
                                    >
                                        {travel.contact_number}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Mail className={cn('h-4 w-4', activeTheme.contactIcon)} />
                                <a
                                    href={`mailto:${travel.email}`}
                                    className={cn('transition-colors', activeTheme.linkHover)}
                                >
                                    {travel.email}
                                </a>
                            </div>
                            {formattedAddress && (
                                <div className="hidden items-center gap-1.5 text-slate-500 sm:flex">
                                    <MapPin className={cn('h-4 w-4', activeTheme.contactIcon)} />
                                    <span>{formattedAddress}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {auth.user ? null : (
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            {canLogin && (
                                <Link
                                    href={route('login', { project: 'travel' })}
                                    className={cn('text-sm font-medium text-slate-700 transition-colors', activeTheme.linkHover)}
                                >
                                    Log in
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register', { project: 'travel' })}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={cn(activeTheme.secondaryButtonBorder, activeTheme.secondaryButtonText, activeTheme.secondaryButtonHover)}
                                    >
                                        Create account
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <section className="space-y-6">
                        <div className={cn('relative overflow-hidden rounded-3xl p-6 shadow-lg ring-1 sm:bg-white sm:p-10', activeTheme.heroMobileBg, activeTheme.cardRing)}>
                            <div className={cn('absolute -right-16 -top-16 hidden h-48 w-48 rounded-full blur-3xl sm:block', activeTheme.heroShapePrimary)} />
                            <div className={cn('absolute bottom-0 left-0 hidden h-24 w-24 rounded-full blur-2xl sm:block', activeTheme.heroShapeSecondary)} />
                            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                                <div className="max-w-2xl space-y-3 sm:space-y-4">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1',
                                            activeTheme.accentTagText,
                                            activeTheme.accentOutlineRing,
                                        )}
                                    >
                                        <Compass className="h-4 w-4" />
                                        Hosted by {travel.name}
                                    </span>
                                    <h2 className="text-2xl font-bold text-slate-900 sm:text-4xl">
                                        Discover journeys crafted around the way you like to travel
                                    </h2>
                                    <p className="text-sm text-slate-600 sm:text-base">
        Tailored escapes, reliable partners, and a dedicated concierge to handle the details from day one.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {travel.contact_number && (
                                            <Button
                                                asChild
                                                size="lg"
                                                className={cn(
                                                    'flex items-center gap-2 text-white',
                                                    activeTheme.accentButtonBg,
                                                    activeTheme.accentButtonHover,
                                                )}
                                            >
                                                <a href={`tel:${travel.contact_number}`}>
                                                    <Phone className="h-4 w-4" />
                                                    Talk to a travel expert
                                                </a>
                                            </Button>
                                        )}
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                            className={cn(
                                                'flex items-center gap-2 bg-white',
                                                activeTheme.secondaryButtonBorder,
                                                activeTheme.secondaryButtonText,
                                                activeTheme.secondaryButtonHover,
                                            )}
                                        >
                                            <a href={`mailto:${travel.email}?subject=Travel%20Package%20Inquiry`}>
                                                <Mail className="h-4 w-4" />
                                                Request an itinerary
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                                {heroImages.length > 0 ? (
                                    <div className="relative hidden w-full max-w-sm shrink-0 gap-4 md:flex md:flex-col">
                                        <div className={cn('overflow-hidden rounded-3xl shadow-lg ring-1', activeTheme.cardRing)}>
                                            <img
                                                src={heroImages[0]}
                                                alt="Destination inspiration"
                                                className="h-56 w-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        {heroImages.length > 1 && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {heroImages.slice(1, 3).map((image, index) => (
                                                    <div
                                                        key={`hero-image-${index}`}
                                                        className={cn('overflow-hidden rounded-2xl shadow-md ring-1', activeTheme.cardRing)}
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`Destination highlight ${index + 2}`}
                                                            className="h-32 w-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            'relative hidden min-w-[220px] flex-col items-center gap-4 rounded-2xl bg-white/90 p-6 text-center shadow-md ring-1 md:flex md:px-8',
                                            activeTheme.cardRing,
                                        )}
                                    >
                                        <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', activeTheme.iconBgSecondary, activeTheme.iconSecondaryText)}>
                                            <Users className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                                Trusted since
                                            </p>
                                            <p className="text-3xl font-bold text-slate-900">
                                                {new Date(travel.created_at).getFullYear()}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Helping travellers design memorable journeys tailored to their pace and style.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className={cn('mt-6 rounded-2xl border bg-white p-4 text-sm text-slate-600 sm:hidden', activeTheme.accentCardBorder)}>
                                Seamless planning, secured partners, and pricing transparency—book a consultation to
                                start building your trip.
                            </div>
                            <div className="relative mt-8 hidden gap-4 sm:grid sm:grid-cols-3">
                                {journeyStats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className={cn('rounded-2xl bg-white/80 p-4 shadow-sm ring-1 backdrop-blur', activeTheme.cardRing)}
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                                        <p className="mt-1 text-sm text-slate-600">{stat.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {highlightPackages.length > 0 && (
                            <div className={cn('rounded-2xl border bg-white p-6 shadow-sm sm:p-8', activeTheme.accentCardBorder)}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className={cn('text-xs font-semibold uppercase tracking-wide', activeTheme.accentTagText)}>
                                            Signature experiences
                                        </p>
                                        <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                                            A glimpse of our most-loved journeys
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Crafted for travellers seeking seamless coordination, authentic encounters, and remarkable stays.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                                    {highlightPackages.map((pkg) => {
                                        const primaryImage = getPrimaryImage(pkg);

                                        return (
                                            <div
                                                key={`highlight-${pkg.id}`}
                                                className={cn(
                                                    'group flex h-full flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
                                                    activeTheme.accentCardBorder,
                                                )}
                                            >
                                                <div className="space-y-3">
                                                    <div className={cn('overflow-hidden rounded-2xl shadow-md ring-1', activeTheme.cardRing)}>
                                                        <img
                                                            src={primaryImage ?? fallbackPackageImage}
                                                            alt={`${pkg.title} preview`}
                                                            className="h-36 w-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                                                            activeTheme.accentTagBg,
                                                            activeTheme.accentTagText,
                                                        )}
                                                    >
                                                        <Star className={cn('h-3.5 w-3.5', activeTheme.accentTagText)} />
                                                        {pkg.package_type ?? 'Featured getaway'}
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-slate-900">{pkg.title}</h4>
                                                    <p className="text-sm text-slate-600">
                                                        {pkg.tagline ??
                                                            'Tailor the experience to match your pace, interests, and travel style.'}
                                                    </p>
                                                </div>
                                                <div className={cn('mt-5 flex items-center justify-between text-sm font-medium', activeTheme.accentTagText)}>
                                                    <span>{pkg.durationLabel}</span>
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-1 text-xs transition-colors',
                                                            activeTheme.accentLinkText,
                                                            activeTheme.accentLinkHover,
                                                        )}
                                                    >
                                                        View details
                                                        <ChevronRight className="h-4 w-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 space-y-3 sm:hidden">
                                    {highlightPackages.slice(0, 2).map((pkg) => {
                                        const mobileImage = getPrimaryImage(pkg) ?? fallbackPackageImage;

                                        return (
                                            <div
                                                key={`highlight-mobile-${pkg.id}`}
                                                className={cn('overflow-hidden rounded-2xl border bg-white shadow-sm', activeTheme.accentCardBorder)}
                                            >
                                                <img
                                                    src={mobileImage}
                                                    alt={`${pkg.title} highlight`}
                                                    className="h-40 w-full object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                                <div className="space-y-3 p-4">
                                                    <p className={cn('text-xs font-semibold uppercase tracking-wide', activeTheme.accentLinkText)}>
                                                        {pkg.package_type ?? 'Signature escape'}
                                                    </p>
                                                    <p className="text-base font-semibold text-slate-900">{pkg.title}</p>
                                                    <p className="text-sm text-slate-600 line-clamp-2">
                                                        {pkg.tagline ??
                                                            'Talk to our travel expert to customise this getaway around your schedule.'}
                                                    </p>
                                                    <div className={cn('flex items-center justify-between text-sm', activeTheme.accentTagText)}>
                                                        <span>{pkg.durationLabel}</span>
                                                        <span className="text-xs font-medium">Tap to inquire</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                                    Featured travel packages
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Choose from immersive experiences, premium getaways, or family-friendly tours.
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn('w-fit', activeTheme.accentBadgeBorder, activeTheme.accentBadgeBg, activeTheme.accentBadgeText)}
                            >
                                {formattedPackages.length} itineraries available
                            </Badge>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {hasPackages ? (
                                formattedPackages.map((pkg) => {
                                    const primaryImage = getPrimaryImage(pkg);

                                    return (
                                        <Card
                                            key={pkg.id}
                                            className={cn(
                                                'flex h-full flex-col overflow-hidden border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl',
                                                activeTheme.accentCardBorder,
                                                activeTheme.accentCardBorderHover,
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'relative h-48 w-full overflow-hidden border-b md:h-56',
                                                    activeTheme.cardDividerBorder,
                                                )}
                                            >
                                                <img
                                                    src={primaryImage ?? fallbackPackageImage}
                                                    alt={`${pkg.title} destination`}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </div>
                                            <div className="relative overflow-hidden bg-white p-6">
                                                <div className={cn('absolute -right-6 top-6 h-24 w-24 rounded-full blur-2xl', activeTheme.heroShapePrimary)} />
                                                <div className="relative flex items-start justify-between gap-4">
                                                    <div className="space-y-3">
                                                        <div
                                                            className={cn(
                                                                'inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1',
                                                                activeTheme.accentTagText,
                                                                activeTheme.accentOutlineRing,
                                                            )}
                                                        >
                                                            <Package className={cn('h-3.5 w-3.5', activeTheme.accentTagText)} />
                                                            {pkg.package_type ?? 'Custom journey'}
                                                        </div>
                                                        <CardTitle className="text-xl font-semibold text-slate-900">
                                                            {pkg.title}
                                                        </CardTitle>
                                                        {(pkg.tagline || pkg.description) && (
                                                            <p className="text-sm text-slate-600">
                                                                {pkg.tagline ??
                                                                    (typeof pkg.description === 'string'
                                                                        ? pkg.description.slice(0, 140).concat(
                                                                              pkg.description.length > 140 ? '…' : ''
                                                                          )
                                                                        : 'Bespoke planning for unforgettable moments.')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {pkg.is_featured && (
                                                    <div
                                                        className={cn(
                                                            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm',
                                                            activeTheme.accentButtonBg,
                                                        )}
                                                    >
                                                        <Star className="h-3.5 w-3.5 fill-current" />
                                                            Featured
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={cn('relative mt-4 flex flex-wrap items-center gap-3 text-sm', activeTheme.accentTagText)}>
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-wide ring-1',
                                                            activeTheme.accentTagText,
                                                            activeTheme.accentOutlineRing,
                                                        )}
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                        {pkg.durationLabel}
                                                    </span>
                                                    {pkg.status && (
                                                        <span
                                                            className={cn(
                                                                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
                                                                activeTheme.accentStatusBg,
                                                                activeTheme.accentStatusText,
                                                            )}
                                                        >
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                            {pkg.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="flex flex-1 flex-col justify-between space-y-5 p-6">
                                                {pkg.inclusions.length > 0 && (
                                                    <div className="space-y-3 text-sm text-slate-600">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Signature inclusions
                                                        </p>
                                                        <div className="hidden flex-wrap gap-2 sm:flex">
                                                            {pkg.inclusions.slice(0, 5).map((item) => (
                                                                <span
                                                                    key={item}
                                                                    className={cn(
                                                                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                                                                        activeTheme.accentMutedBg,
                                                                        activeTheme.accentMutedText,
                                                                    )}
                                                                >
                                                                    {item}
                                                                </span>
                                                            ))}
                                                            {pkg.inclusions.length > 5 && (
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                                                                        activeTheme.accentStatusBg,
                                                                        activeTheme.accentStatusText,
                                                                    )}
                                                                >
                                                                    + more experiences
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                'rounded-lg px-3 py-2 text-xs text-slate-600 sm:hidden',
                                                                activeTheme.heroMobileBg,
                                                            )}
                                                        >
                                                            Includes hosted activities, accommodations, and concierge support tailored to your group.
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                                            Starting from
                                                        </p>
                                                        <p className={cn('text-xl font-semibold', activeTheme.accentTagText)}>
                                                            {pkg.formattedPrice}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        className={cn(
                                                            'flex items-center gap-2',
                                                            activeTheme.secondaryButtonBorder,
                                                            activeTheme.secondaryButtonText,
                                                            activeTheme.secondaryButtonHover,
                                                        )}
                                                    >
                                                        <Link
                                                            href={`mailto:${travel.email}?subject=${encodeURIComponent(
                                                                `Inquiry about ${pkg.title}`
                                                            )}`}
                                                        >
                                                            Plan this trip
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                                    <h4 className="text-lg font-semibold text-slate-800">
                                        Packages are getting ready
                                    </h4>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Check back soon to explore curated itineraries from {travel.name}.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <Card className={cn('border shadow-sm', activeTheme.accentCardBorder)}>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-slate-900">
                                    Agency information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', activeTheme.iconBgPrimary)}>
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Agency address
                                        </p>
                                        <p className="font-medium text-slate-800">
                                            {formattedAddress ?? 'Address not available'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', activeTheme.iconBgSecondary, activeTheme.iconSecondaryText)}>
                                        <CalendarRange className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Operating since
                                        </p>
                                        <p className="font-medium text-slate-800">
                                            {new Date(travel.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Contact
                                    </p>
                                    <ul className="mt-2 space-y-1 text-slate-700">
                                        <li>Email: {travel.email}</li>
                                        {travel.contact_number && <li>Phone: {travel.contact_number}</li>}
                                    </ul>
                                </div>
                                <div className={cn('rounded-lg p-4 text-xs', activeTheme.accentMutedBg, activeTheme.accentMutedText)}>
                                    Need a bespoke experience? Reach out to craft a personalised itinerary that fits your travel goals.
                                </div>
                                {travel.contact_number && (
                                    <Button
                                        asChild
                                        className={cn('w-full text-white', activeTheme.accentButtonBg, activeTheme.accentButtonHover)}
                                    >
                                        <a href={`tel:${travel.contact_number}`}>Call {travel.name}</a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card className={cn('border shadow-sm', activeTheme.accentCardBorder)}>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-slate-900">
                                    Why book with us
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-slate-600">
                                <div className={cn('rounded-lg p-4', activeTheme.accentMutedBg)}>
                                    <h4 className={cn('font-semibold', activeTheme.accentTagText)}>Expertly curated packages</h4>
                                    <p className={cn('mt-1 text-sm', activeTheme.accentTagText)}>
                                        Each itinerary is designed with local insight, reliable partners, and top-tier accommodations.
                                    </p>
                                </div>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <span className={cn('mt-1 h-2 w-2 rounded-full', activeTheme.accentBullet)}></span>
                                        Flexible scheduling and private tours
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className={cn('mt-1 h-2 w-2 rounded-full', activeTheme.accentBullet)}></span>
                                        Dedicated travel concierge support
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className={cn('mt-1 h-2 w-2 rounded-full', activeTheme.accentBullet)}></span>
                                        Transparent pricing with no hidden fees
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>

            <footer className={cn('mt-12 border-t bg-white', activeTheme.footerBorder)}>
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="space-y-3">
                            <p className={cn('text-xs font-semibold uppercase tracking-wide', activeTheme.footerTagLabel)}>
                                Travel partner
                            </p>
                            <h3 className="text-xl font-semibold text-slate-900">{travel.name}</h3>
                            <p className="text-sm text-slate-600">
                                Journey planning made effortless—{travel.name} crafts tailored getaways backed by trusted
                                local partners and concierge support from day one.
                            </p>
                            <p className="text-xs text-slate-500">
                                Operating since {new Date(travel.created_at).toLocaleDateString(undefined, { year: 'numeric' })}.
                            </p>
                        </div>

                        <div className="space-y-4 text-sm text-slate-600">
                            <p className={cn('text-xs font-semibold uppercase tracking-wide', activeTheme.footerTagLabel)}>
                                Connect
                            </p>
                            <div className="space-y-3">
                                {travel.contact_number && (
                                    <a
                                        href={`tel:${travel.contact_number}`}
                                        className={cn('flex items-center gap-2 transition-colors', activeTheme.linkHover)}
                                    >
                                        <Phone className={cn('h-4 w-4', activeTheme.contactIcon)} />
                                        <span>{travel.contact_number}</span>
                                    </a>
                                )}
                                <a
                                    href={`mailto:${travel.email}`}
                                    className={cn('flex items-center gap-2 transition-colors', activeTheme.linkHover)}
                                >
                                    <Mail className={cn('h-4 w-4', activeTheme.contactIcon)} />
                                    <span>{travel.email}</span>
                                </a>
                                {formattedAddress && (
                                    <div className="flex items-start gap-2 text-slate-500">
                                        <MapPin className={cn('mt-0.5 h-4 w-4', activeTheme.contactIcon)} />
                                        <span>{formattedAddress}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className={cn('text-xs font-semibold uppercase tracking-wide', activeTheme.footerTagLabel)}>
                                Plan your getaway
                            </p>
                            <p className="text-sm text-slate-600">
                                Ready to start planning? Tell us the experiences you’re after and we’ll tailor the rest.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                                {travel.contact_number && (
                                    <Button
                                        asChild
                                        className={cn('text-white', activeTheme.accentButtonBg, activeTheme.accentButtonHover)}
                                    >
                                        <a href={`tel:${travel.contact_number}`}>
                                            Talk to a travel expert
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    className={cn(
                                        activeTheme.secondaryButtonBorder,
                                        activeTheme.secondaryButtonText,
                                        activeTheme.footerSecondaryHover,
                                    )}
                                >
                                    <a href={`mailto:${travel.email}?subject=Plan%20my%20trip`}>
                                        Request an itinerary
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            'mt-10 flex flex-col items-center justify-between gap-2 border-t border-dashed pt-6 text-xs text-slate-500 sm:flex-row',
                            activeTheme.footerBorder,
                        )}
                    >
                        <p>© {new Date().getFullYear()} {travel.name}. All rights reserved.</p>
                        <p className="text-center sm:text-right">
                            Seamless travel planning • Personalised experiences • Trusted hospitality partners
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
