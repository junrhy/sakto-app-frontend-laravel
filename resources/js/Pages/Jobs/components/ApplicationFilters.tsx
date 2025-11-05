import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';

interface Job {
    id: number;
    title: string;
}

interface ApplicationFiltersProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    jobFilter: string;
    setJobFilter: (value: string) => void;
    jobs: Job[];
}

export default function ApplicationFilters({
    statusFilter,
    setStatusFilter,
    jobFilter,
    setJobFilter,
    jobs,
}: ApplicationFiltersProps) {
    const hasActiveFilters = statusFilter !== 'all' || jobFilter !== 'all';

    const clearFilters = () => {
        setStatusFilter('all');
        setJobFilter('all');
    };

    return (
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status:
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter" className="w-[140px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {jobs.length > 0 && (
                <div className="flex items-center space-x-2">
                    <Label htmlFor="job-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Job:
                    </Label>
                    <Select value={jobFilter} onValueChange={setJobFilter}>
                        <SelectTrigger id="job-filter" className="w-[200px]">
                            <SelectValue placeholder="All jobs" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            {jobs.map((job) => (
                                <SelectItem key={job.id} value={job.id.toString()}>
                                    {job.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}

