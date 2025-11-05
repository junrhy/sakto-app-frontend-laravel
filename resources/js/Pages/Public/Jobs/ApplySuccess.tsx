import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Job {
    id: number;
    title: string;
    job_board?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Props {
    job: Job;
    canLogin?: boolean;
    canRegister?: boolean;
}

export default function ApplySuccess({ job, canLogin, canRegister }: Props) {
    return (
        <GuestLayout>
            <Head title="Application Submitted Successfully" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
                        <CardContent className="p-16 text-center">
                            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl">
                                <CheckCircle className="h-12 w-12 text-white" />
                            </div>

                            <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
                                Application Submitted Successfully!
                            </h1>

                            <p className="mb-3 text-xl text-gray-700 dark:text-gray-300">
                                Thank you for applying to <strong className="text-indigo-600 dark:text-indigo-400">{job.title}</strong>
                            </p>

                            <p className="mb-10 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                We have received your application and will review it shortly. You will be contacted if we
                                would like to proceed with your application.
                            </p>

                            {job.job_board && (
                                <div className="flex justify-center mb-8">
                                    <Link href={route('jobs.public.board', job.job_board.slug)}>
                                        <Button className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                                            <ArrowRight className="mr-2 h-5 w-5" />
                                            View More Jobs
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </GuestLayout>
    );
}
