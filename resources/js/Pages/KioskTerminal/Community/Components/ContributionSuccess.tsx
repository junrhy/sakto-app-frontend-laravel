import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
    CheckCircle,
    ArrowLeft,
    Users,
    DollarSign,
} from 'lucide-react';

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
    onBack
}: ContributionSuccessProps) {
    const typeLabel = type === 'health_insurance' ? 'Health Insurance' : 'Mortuary';
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-50">
            <Card className="w-full max-w-2xl border-2 dark:bg-white dark:border-gray-200">
                <CardHeader className="text-center pb-6 dark:bg-white">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-20 h-20 text-green-600" />
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
                        <p className="text-lg text-gray-700 dark:text-gray-700 mb-4">
                            {successData.message}
                        </p>
                    </div>

                    {/* Statistics */}
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-50 rounded-lg w-full max-w-[200px]">
                            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600 dark:text-green-600">
                                {successData.total}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-600">Total Members</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-50 rounded-lg w-full max-w-[200px]">
                            <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-600">
                                {successData.successful}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-600">Successful</div>
                        </div>
                        {successData.failed > 0 && (
                            <div className="text-center p-4 bg-red-50 dark:bg-red-50 rounded-lg w-full max-w-[200px]">
                                <DollarSign className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-red-600 dark:text-red-600">
                                    {successData.failed}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-600">Failed</div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center items-center">
                        <Button 
                            onClick={onBack}
                            variant="outline"
                            className="min-w-[200px] h-12 text-lg dark:bg-white dark:text-gray-900 dark:border-gray-300 dark:hover:bg-gray-50 flex items-center justify-center"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
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