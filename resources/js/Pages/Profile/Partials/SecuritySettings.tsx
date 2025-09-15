import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Shield } from 'lucide-react';
import UpdatePasswordForm from './UpdatePasswordForm';

export default function SecuritySettings() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Password
                    </CardTitle>
                    <CardDescription>
                        Ensure your account is using a long, random password to stay secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdatePasswordForm className="max-w-xl" hideHeader={true} />
                </CardContent>
            </Card>
        </div>
    );
}
