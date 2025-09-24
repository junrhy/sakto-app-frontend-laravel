import { Head } from '@inertiajs/react';

interface MaintenanceProps {
    message: string;
}

export default function Maintenance({ message }: MaintenanceProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <Head title="Maintenance Mode" />

            <div className="mx-auto w-full max-w-md">
                <div className="rounded-lg bg-white p-8 shadow-md">
                    <div className="text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto mb-4 h-16 w-16 text-yellow-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>

                        <h1 className="mb-4 text-2xl font-bold text-gray-800">
                            Maintenance Mode
                        </h1>

                        <p className="mb-6 text-gray-600">{message}</p>

                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-500">
                                If you need immediate assistance, please contact
                                the administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
