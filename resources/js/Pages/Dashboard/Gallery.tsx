import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Badge } from '@/Components/ui/badge';
import { motion } from 'framer-motion';
import { PlusCircle, Layout, Calendar, Star, Filter, Trash2, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from '@/Components/ui/dropdown-menu';

interface Dashboard {
    id: number;
    name: string;
    is_default: boolean;
    is_starred: boolean;
    created_at: string;
    app: string;
    widgets_count: number;
    widget_types: {
        [key: string]: number;
    };
    column_count: number;
}

interface User {
    name: string;
    email: string;
}

interface Props {
    auth: {
        user: User;
    };
    dashboards: Dashboard[];
    app: string;
}

export default function Gallery({ auth, dashboards, app }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);
    const [newDashboardName, setNewDashboardName] = useState('');
    const [filters, setFilters] = useState({
        starred: false,
        withWidgets: false,
        withoutWidgets: false,
    });

    const filteredDashboards = dashboards.filter(dashboard => {
        if (filters.starred && !dashboard.is_starred) return false;
        if (filters.withWidgets && dashboard.widgets_count === 0) return false;
        if (filters.withoutWidgets && dashboard.widgets_count > 0) return false;
        return true;
    });

    const createNewDashboard = () => {
        if (newDashboardName.trim()) {
            router.post('/dashboard', {
                name: newDashboardName,
                app: app
            }, {
                onSuccess: () => {
                    setIsCreateDialogOpen(false);
                    setNewDashboardName('');
                    toast.success('Dashboard created successfully');
                },
                onError: () => toast.error('Failed to create dashboard')
            });
        }
    };

    const setAsDefault = (dashboardId: number) => {
        router.post(`/dashboard/${dashboardId}/set-default`, {}, {
            onSuccess: () => toast.success('Default dashboard updated'),
            onError: () => toast.error('Failed to update default dashboard')
        });
    };

    const toggleStar = (dashboardId: number) => {
        router.post(`/dashboard/${dashboardId}/toggle-star`, {}, {
            onSuccess: () => toast.success('Dashboard star status updated'),
            onError: () => toast.error('Failed to update dashboard star status')
        });
    };

    const viewDashboard = (dashboardId: number) => {
        router.get(`/dashboard/${dashboardId}/widgets`, {
            app: app
        });
    };

    const deleteDashboard = () => {
        if (!dashboardToDelete) return;

        router.delete(`/dashboard/${dashboardToDelete.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDashboardToDelete(null);
                toast.success('Dashboard deleted successfully');
            },
            onError: () => toast.error('Failed to delete dashboard')
        });
    };

    const openDeleteDialog = (dashboard: Dashboard) => {
        setDashboardToDelete(dashboard);
        setIsDeleteDialogOpen(true);
    };

    const formatWidgetType = (type: string) => {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Layout className="w-6 h-6 text-primary" />
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Dashboard Gallery
                    </h2>
                </div>
            }
        >
            <Head title="Dashboard Gallery" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                Your Dashboards
                            </h3>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="w-4 h-4" />
                                        Filter
                                        {(filters.starred || filters.withWidgets || filters.withoutWidgets) && (
                                            <Badge variant="secondary" className="ml-1">
                                                {[
                                                    filters.starred && "Starred",
                                                    filters.withWidgets && "With Widgets",
                                                    filters.withoutWidgets && "Without Widgets"
                                                ].filter(Boolean).length}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuCheckboxItem
                                        checked={filters.starred}
                                        onCheckedChange={(checked) => 
                                            setFilters(prev => ({ ...prev, starred: checked }))
                                        }
                                    >
                                        <Star className="w-4 h-4 mr-2" />
                                        Starred
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={filters.withWidgets}
                                        onCheckedChange={(checked) => 
                                            setFilters(prev => ({ 
                                                ...prev, 
                                                withWidgets: checked,
                                                withoutWidgets: checked ? false : prev.withoutWidgets 
                                            }))
                                        }
                                    >
                                        <Layout className="w-4 h-4 mr-2" />
                                        With Widgets
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.withoutWidgets}
                                        onCheckedChange={(checked) => 
                                            setFilters(prev => ({ 
                                                ...prev, 
                                                withoutWidgets: checked,
                                                withWidgets: checked ? false : prev.withWidgets 
                                            }))
                                        }
                                    >
                                        <Layout className="w-4 h-4 mr-2" />
                                        Without Widgets
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 transition-all hover:scale-105">
                                    <PlusCircle className="w-4 h-4" />
                                    Create New Dashboard
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">Create New Dashboard</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <Input
                                        placeholder="Enter dashboard name..."
                                        value={newDashboardName}
                                        onChange={(e) => setNewDashboardName(e.target.value)}
                                        className="h-11"
                                    />
                                    <Button 
                                        onClick={createNewDashboard}
                                        disabled={!newDashboardName.trim()}
                                        className="w-full h-11 text-base font-medium transition-all hover:scale-105"
                                    >
                                        Create Dashboard
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDashboards.map((dashboard, index) => (
                            <motion.div
                                key={dashboard.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Card className="relative h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between text-xl">
                                            <div className="flex items-center gap-2">
                                                {dashboard.name}
                                                {dashboard.is_default && (
                                                    <Badge variant="secondary" className="animate-pulse">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleStar(dashboard.id)}
                                                    className="h-8 w-8"
                                                >
                                                    <Star 
                                                        className={`w-5 h-5 ${dashboard.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                                                    />
                                                </Button>
                                                {!dashboard.is_default && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(dashboard)}
                                                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardTitle>
                                        <CardDescription className="flex flex-col gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Created on {new Date(dashboard.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Layout className="w-4 h-4" />
                                                {dashboard.widgets_count} {dashboard.widgets_count === 1 ? 'widget' : 'widgets'}
                                                {dashboard.widgets_count > 0 && (
                                                    <span className="text-muted-foreground">
                                                        in {dashboard.column_count} {dashboard.column_count === 1 ? 'column' : 'columns'}
                                                    </span>
                                                )}
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {dashboard.widgets_count > 0 ? (
                                            <div className="space-y-3">
                                                <div className="text-sm font-medium text-muted-foreground">Widget Types:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(dashboard.widget_types).map(([type, count]) => (
                                                        <Badge
                                                            key={type}
                                                            variant="outline"
                                                            className="flex items-center gap-1.5"
                                                        >
                                                            {formatWidgetType(type)}
                                                            <span className="px-1.5 py-0.5 rounded-full bg-muted text-xs font-medium">
                                                                {count}
                                                            </span>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-24 bg-muted/30 rounded-lg flex items-center justify-center">
                                                <Layout className="w-8 h-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between gap-4">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => viewDashboard(dashboard.id)}
                                            className="flex-1 transition-all hover:scale-105"
                                        >
                                            View Dashboard
                                        </Button>
                                        {!dashboard.is_default && (
                                            <Button 
                                                variant="secondary"
                                                onClick={() => setAsDefault(dashboard.id)}
                                                className="flex-1 transition-all hover:scale-105"
                                            >
                                                Set as Default
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {filteredDashboards.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 bg-muted/30 rounded-lg"
                        >
                            <Layout className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-lg text-gray-500 dark:text-gray-400">
                                {filters.starred && (filters.withWidgets || filters.withoutWidgets)
                                    ? `No ${filters.withWidgets ? 'starred dashboards with widgets' : 'starred dashboards without widgets'} found.`
                                    : filters.starred
                                    ? "No starred dashboards found. Star some dashboards to see them here."
                                    : filters.withWidgets
                                    ? "No dashboards with widgets found. Add widgets to your dashboards to see them here."
                                    : filters.withoutWidgets
                                    ? "No empty dashboards found. All your dashboards have widgets."
                                    : "No dashboards found. Create your first dashboard to get started."}
                            </p>
                        </motion.div>
                    )}

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Dashboard</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{dashboardToDelete?.name}"? This action cannot be undone
                                    and will remove all associated widgets.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={deleteDashboard}
                                    className="gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Dashboard
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 