import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Eye, SearchIcon, FileDown } from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import ChallengeForm from '@/Components/Challenges/ChallengeForm';

interface User {
    id: number;
    name: string;
    email: string;
    identifier: string;
}

interface Reward {
    type: 'badge' | 'points' | 'achievement';
    value: string;
}

interface Challenge {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    goal_type: 'steps' | 'calories' | 'distance' | 'time' | 'weight' | 'other';
    goal_value: number;
    goal_unit: string;
    participants: number[];
    visibility: 'public' | 'private' | 'friends' | 'family' | 'coworkers';
    rewards: Reward[];
}

interface Props {
    auth: {
        user: User;
    };
    challenges: Challenge[];
}

export default function Index({ auth, challenges: initialChallenges }: Props) {
    const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [search, setSearch] = useState('');
    const [selectedChallenges, setSelectedChallenges] = useState<number[]>([]);
    const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
    const [goalTypeFilter, setGoalTypeFilter] = useState<string>('all');

    const filteredChallenges = useMemo(() => {
        let filtered = challenges;
        
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(challenge => 
                challenge.title.toLowerCase().includes(searchLower) ||
                challenge.description.toLowerCase().includes(searchLower)
            );
        }

        if (visibilityFilter !== 'all') {
            filtered = filtered.filter(challenge => challenge.visibility === visibilityFilter);
        }

        if (goalTypeFilter !== 'all') {
            filtered = filtered.filter(challenge => challenge.goal_type === goalTypeFilter);
        }

        return filtered;
    }, [challenges, search, visibilityFilter, goalTypeFilter]);

    const toggleSelectAll = () => {
        if (selectedChallenges.length === filteredChallenges.length) {
            setSelectedChallenges([]);
        } else {
            setSelectedChallenges(filteredChallenges.map(challenge => challenge.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedChallenges.includes(id)) {
            setSelectedChallenges(selectedChallenges.filter(challengeId => challengeId !== id));
        } else {
            setSelectedChallenges([...selectedChallenges, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = challenges.filter(challenge => selectedChallenges.includes(challenge.id));
        const headers = ['Title', 'Goal Type', 'Goal Value', 'Visibility', 'Start Date', 'End Date'];
        const csvData = selectedData.map(challenge => [
            challenge.title,
            challenge.goal_type,
            `${challenge.goal_value} ${challenge.goal_unit}`,
            challenge.visibility,
            format(new Date(challenge.start_date), 'PPP'),
            format(new Date(challenge.end_date), 'PPP')
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'challenges.csv';
        link.click();
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this challenge?')) {
            router.delete(route('challenges.destroy', id));
        }
    };

    const handleCreateChallenge = async (formData: Record<string, any>): Promise<void> => {
        try {
            await router.post(route('challenges.store'), formData);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Failed to create challenge:', error);
        }
    };

    const handleUpdateChallenge = async (id: number, formData: Record<string, any>): Promise<void> => {
        try {
            await router.put(route('challenges.update', id), formData);
            setSelectedChallenge(null);
        } catch (error) {
            console.error('Failed to update challenge:', error);
        }
    };

    const getVisibilityBadgeColor = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return 'default';
            case 'private':
                return 'secondary';
            case 'friends':
                return 'outline';
            case 'family':
                return 'outline';
            case 'coworkers':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Challenges
                    </h2>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search challenges..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-[300px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            />
                        </div>
                        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                                <SelectValue placeholder="Filter by visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Visibilities</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="friends">Friends</SelectItem>
                                <SelectItem value="family">Family</SelectItem>
                                <SelectItem value="coworkers">Coworkers</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={goalTypeFilter} onValueChange={setGoalTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                                <SelectValue placeholder="Filter by goal type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Goal Types</SelectItem>
                                <SelectItem value="steps">Steps</SelectItem>
                                <SelectItem value="calories">Calories</SelectItem>
                                <SelectItem value="distance">Distance</SelectItem>
                                <SelectItem value="time">Time</SelectItem>
                                <SelectItem value="weight">Weight</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedChallenges.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={exportToCSV}
                                className="flex items-center"
                            >
                                <FileDown className="w-4 h-4 mr-2" />
                                Export Selected
                            </Button>
                        )}
                        <Button onClick={() => setIsFormOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Challenge
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Challenges" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedChallenges.length === filteredChallenges.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Goal</TableHead>
                                        <TableHead>Visibility</TableHead>
                                        <TableHead>Participants</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredChallenges.map((challenge) => (
                                        <TableRow key={challenge.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedChallenges.includes(challenge.id)}
                                                    onCheckedChange={() => toggleSelect(challenge.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{challenge.title}</TableCell>
                                            <TableCell>
                                                {challenge.goal_value} {challenge.goal_unit}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={getVisibilityBadgeColor(challenge.visibility)}
                                                    className="capitalize"
                                                >
                                                    {challenge.visibility}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{challenge.participants.length}</TableCell>
                                            <TableCell>{format(new Date(challenge.start_date), 'PPP')}</TableCell>
                                            <TableCell>{format(new Date(challenge.end_date), 'PPP')}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                            </svg>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('challenges.show', challenge.id)}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedChallenge(challenge)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(challenge.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <ChallengeForm
                    challenge={null}
                    onSubmit={handleCreateChallenge}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {selectedChallenge && (
                <ChallengeForm
                    challenge={selectedChallenge}
                    onSubmit={(formData: Partial<Challenge>) => handleUpdateChallenge(selectedChallenge.id, formData)}
                    onClose={() => setSelectedChallenge(null)}
                />
            )}
        </AuthenticatedLayout>
    );
} 