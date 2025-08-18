import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    DashboardStats, 
    ShipmentTracking, 
    FleetManagement, 
    CargoMonitoring 
} from './components';

export default function Transportation() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Transportation
                </h2>
            }
        >
            <Head title="Transportation" />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Dashboard Stats */}
                <DashboardStats />

                <div className="grid grid-cols-1 gap-6 mt-6">
                    {/* Shipment Tracking Section */}
                    <div className="space-y-6">
                        <ShipmentTracking />
                    </div>

                    {/* Fleet Management Section */}
                    <div className="space-y-6">
                        <FleetManagement />
                    </div>

                    {/* Cargo Monitoring Section */}
                    <div className="space-y-6">
                        <CargoMonitoring />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
