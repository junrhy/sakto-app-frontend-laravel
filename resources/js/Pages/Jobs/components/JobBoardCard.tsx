import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import {
    Briefcase,
    Edit,
    ExternalLink,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';

interface JobBoard {
    id: number;
    name: string;
    description?: string;
    slug: string;
    is_active: boolean;
    jobs_count: number;
    published_jobs_count: number;
    client_identifier?: string;
    created_at: string;
    updated_at: string;
}

interface JobBoardCardProps {
    board: JobBoard;
    onDelete: (id: number) => void;
}

export default function JobBoardCard({ board, onDelete }: JobBoardCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            {board.name}
                        </CardTitle>
                        {board.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                {board.description}
                            </p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={route('jobs.jobBoard', board.id)}>
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    View Jobs
                                </Link>
                            </DropdownMenuItem>
                            {board.slug && (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={
                                            board.client_identifier
                                                ? `${route('jobs.public.board', board.slug)}?client=${encodeURIComponent(board.client_identifier)}`
                                                : route(
                                                      'jobs.public.board',
                                                      board.slug,
                                                  )
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Public Page
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href={route('jobs.editBoard', board.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(board.id)}
                                className="text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Total Jobs:{' '}
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {board.jobs_count}
                                </span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                                Published:{' '}
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {board.published_jobs_count}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge
                                variant={
                                    board.is_active ? 'default' : 'secondary'
                                }
                            >
                                {board.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('jobs.jobBoard', board.id)}>
                            <Button size="sm" variant="outline">
                                View
                            </Button>
                        </Link>
                        {board.slug && (
                            <Link
                                href={
                                    board.client_identifier
                                        ? `${route('jobs.public.board', board.slug)}?client=${encodeURIComponent(board.client_identifier)}`
                                        : route('jobs.public.board', board.slug)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button size="sm" variant="outline">
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Public
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
