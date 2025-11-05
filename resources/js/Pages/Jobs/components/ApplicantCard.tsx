import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface Applicant {
    id: number;
    name: string;
    email: string;
    phone?: string;
    applications_count: number;
}

interface ApplicantCardProps {
    applicant: Applicant;
}

export default function ApplicantCard({ applicant }: ApplicantCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{applicant.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">{applicant.email}</p>
                {applicant.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{applicant.phone}</p>
                )}
                <p className="mt-2 text-sm font-medium">
                    {applicant.applications_count} application(s)
                </p>
            </CardContent>
        </Card>
    );
}

