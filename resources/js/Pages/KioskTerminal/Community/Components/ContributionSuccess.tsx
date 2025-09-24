import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { ArrowLeft, CheckCircle, DollarSign, Users } from 'lucide-react';

interface ContributionSuccessProps {
    type: 'health_insurance' | 'mortuary';
    successData: {
        total: number;
        successful: number;
        failed: number;
        message: string;
    };
    onBack: () => void;
}

export default function ContributionSuccess({
    type,
    successData,
    onBack,
}: ContributionSuccessProps) {
    const typeLabel =
        type === 'health_insurance' ? 'Health Insurance' : 'Mortuary';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-50">
            <Card className="w-full max-w-2xl border-2 dark:border-gray-200 dark:bg-white">
                <CardHeader className="pb-6 text-center dark:bg-white">
                    <div className="mb-4 flex justify-center">
                        <CheckCircle className="h-20 w-20 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-600">
                        Success!
                    </CardTitle>
                    <CardDescription className="text-xl dark:text-gray-700">
                        {typeLabel} contributions submitted successfully
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 dark:bg-white">
                    {/* Success Message */}
                    <div className="text-center">
                        <p className="mb-4 text-lg text-gray-700 dark:text-gray-700">
                            {successData.message}
                        </p>
                    </div>

                    {/* Statistics */}
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="w-full max-w-[200px] rounded-lg bg-green-50 p-4 text-center dark:bg-green-50">
                            <Users className="mx-auto mb-2 h-8 w-8 text-green-600" />
                            <div className="text-2xl font-bold text-green-600 dark:text-green-600">
                                {successData.total}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-600">
                                Total Members
                            </div>
                        </div>
                        <div className="w-full max-w-[200px] rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-50">
                            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-600">
                                {successData.successful}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-600">
                                Successful
                            </div>
                        </div>
                        {successData.failed > 0 && (
                            <div className="w-full max-w-[200px] rounded-lg bg-red-50 p-4 text-center dark:bg-red-50">
                                <DollarSign className="mx-auto mb-2 h-8 w-8 text-red-600" />
                                <div className="text-2xl font-bold text-red-600 dark:text-red-600">
                                    {successData.failed}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-600">
                                    Failed
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center">
                        <Button
                            onClick={onBack}
                            variant="outline"
                            className="flex h-12 min-w-[200px] items-center justify-center text-lg dark:border-gray-300 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-50"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Main Menu
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center text-sm text-gray-500 dark:text-gray-500">
                        <p>Contributions have been recorded in the system.</p>
                        <p>You can view the details in the main application.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
