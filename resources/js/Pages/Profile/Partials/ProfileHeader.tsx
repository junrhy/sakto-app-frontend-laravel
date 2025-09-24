import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    ArrowRightStartOnRectangleIcon,
    CreditCardIcon,
    HomeIcon,
    QuestionMarkCircleIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { Link as InertiaLink } from '@inertiajs/react';

interface ProfileHeaderProps {
    isLoadingSubscription: boolean;
    subscription: any;
    credits: number;
    auth: {
        user: {
            name: string;
            identifier?: string;
        };
        project: {
            identifier: string;
        };
        selectedTeamMember: {
            full_name: string;
        };
    };
    formatNumber: (num: number | undefined | null) => string;
}

export default function ProfileHeader({
    isLoadingSubscription,
    subscription,
    credits,
    auth,
    formatNumber,
}: ProfileHeaderProps) {
    return (
        <>
            {/* Message for users without subscription */}
            {!isLoadingSubscription && !subscription && (
                <div className="fixed left-0 right-0 top-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 py-1 text-center text-sm text-white">
                    <span className="font-medium">
                        Subscribe to a plan to continue using all features!
                    </span>
                    <Button
                        variant="link"
                        size="sm"
                        className="ml-2 h-auto p-0 text-white underline"
                        onClick={() =>
                            (window.location.href = route(
                                'subscriptions.index',
                            ))
                        }
                    >
                        View Plans
                    </Button>
                </div>
            )}

            <div
                className={`fixed ${!isLoadingSubscription && !subscription ? 'top-7' : 'top-0'} left-0 right-0 z-10 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80`}
            >
                <div className="container mx-auto px-4 pt-4">
                    <div className="mb-4 flex flex-col items-center">
                        <div className="mb-2 flex w-full items-center justify-between">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-gray-900 dark:text-white" />
                                <div className="ml-2">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {auth.user.name}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden items-center sm:flex">
                                    <div className="flex items-center overflow-hidden rounded-lg bg-gray-100 shadow-sm dark:bg-gray-700">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                (window.location.href = route(
                                                    'credits.spent-history',
                                                    {
                                                        clientIdentifier:
                                                            auth.user
                                                                .identifier,
                                                    },
                                                ))
                                            }
                                            className="rounded-l-lg rounded-r-none border-r border-gray-200 px-3 py-1.5 text-gray-900 hover:bg-gray-200 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                                        >
                                            <span className="text-sm font-medium">
                                                {formatNumber(credits)} Credits
                                            </span>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="flex items-center gap-1.5 rounded-l-none rounded-r-lg border-0 bg-gradient-to-r from-orange-400 to-orange-500 font-semibold text-white shadow-lg transition-all duration-200 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)] hover:from-orange-500 hover:to-orange-600 hover:shadow-xl dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700"
                                            onClick={() =>
                                                (window.location.href =
                                                    route('credits.buy'))
                                            }
                                        >
                                            <CreditCardIcon className="h-4 w-4" />
                                            Buy
                                        </Button>
                                    </div>
                                </div>
                                {/* Mobile Credits Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/10 hover:text-blue-100 sm:hidden"
                                    onClick={() =>
                                        (window.location.href =
                                            route('credits.buy'))
                                    }
                                >
                                    <CreditCardIcon className="h-5 w-5" />
                                </Button>
                                <div className="relative inline-block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex h-auto items-center gap-2 border-0 px-3 py-2 font-normal text-gray-900 no-underline transition-colors duration-200 hover:bg-white/10 hover:text-blue-900 hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white"
                                            >
                                                <UserIcon className="h-5 w-5" />
                                                <span>
                                                    {auth.selectedTeamMember
                                                        ?.full_name ||
                                                        auth.user.name}
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            alignOffset={0}
                                            sideOffset={8}
                                            className="z-50 w-56 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                            onCloseAutoFocus={(e) =>
                                                e.preventDefault()
                                            }
                                            collisionPadding={16}
                                        >
                                            <DropdownMenuItem>
                                                <HomeIcon className="mr-2 h-5 w-5" />
                                                <InertiaLink
                                                    href={route('home')}
                                                    className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                >
                                                    Home
                                                </InertiaLink>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem>
                                                <QuestionMarkCircleIcon className="mr-2 h-5 w-5" />
                                                <InertiaLink
                                                    href="/help"
                                                    className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                >
                                                    Help
                                                </InertiaLink>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <ArrowRightStartOnRectangleIcon className="mr-2 h-5 w-5" />
                                                <InertiaLink
                                                    href={route('logout', {
                                                        project:
                                                            auth.project
                                                                ?.identifier ||
                                                            '',
                                                    })}
                                                    method="post"
                                                    as="button"
                                                    className="w-full text-left text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                >
                                                    Logout
                                                </InertiaLink>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
