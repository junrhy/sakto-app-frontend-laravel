import MerchantLayout from '@/Layouts/Merchant/MerchantLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface Props extends PageProps {
    restaurantId: number;
}

export default function RestaurantShow({ auth, restaurantId }: Props) {
    return (
        <MerchantLayout
            auth={{ user: auth.user }}
            title="Restaurant Details"
            header={
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Restaurant #{restaurantId}
                </h2>
            }
        >
            <Head title="Restaurant Details" />

            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                Detailed restaurant management tools can be built here.
            </div>
        </MerchantLayout>
    );
}
