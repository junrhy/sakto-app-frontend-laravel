import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import DeleteUserForm from './DeleteUserForm';

export default function DangerZone() {
    return (
        <div className="space-y-6">
            <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        Delete Account
                    </CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400">
                        Permanently delete your account and all of its data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DeleteUserForm className="max-w-xl" hideHeader={true} />
                </CardContent>
            </Card>
        </div>
    );
}
