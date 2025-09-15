import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { UserIcon, MapPin } from 'lucide-react';
import UpdateProfileInformationForm from './UpdateProfileInformationForm';
import UpdateAddressesForm from './UpdateAddressesForm';

interface AccountSettingsProps {
    mustVerifyEmail: boolean;
    status?: string;
    addresses: Array<any>;
}

export default function AccountSettings({ 
    mustVerifyEmail, 
    status, 
    addresses 
}: AccountSettingsProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your account's profile information and email address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                        hideHeader={true}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Addresses
                    </CardTitle>
                    <CardDescription>
                        Manage your delivery and billing addresses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateAddressesForm 
                        addresses={addresses}
                        className="w-full" 
                        hideHeader={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
