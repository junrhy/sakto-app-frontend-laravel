import React, { useState, useCallback } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Calendar, AlertTriangle } from "lucide-react";
import { BlockedDate } from '../types';

interface BlockedDatesTabProps {
    blockedDates: BlockedDate[];
    onAddBlockedDate: (blockedDate: Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>) => void;
    onUpdateBlockedDate: (id: number, blockedDate: Partial<BlockedDate>) => void;
    onDeleteBlockedDate: (id: number) => void;
}

export const BlockedDatesTab: React.FC<BlockedDatesTabProps> = ({
    blockedDates,
    onAddBlockedDate,
    onUpdateBlockedDate,
    onDeleteBlockedDate,
}) => {
    const [newBlockedDate, setNewBlockedDate] = useState<Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>>({
        blocked_date: new Date().toISOString().split('T')[0], // Default to today
        start_time: '',
        end_time: '',
        is_full_day: true,
        reason: '',
        client_identifier: 'current_client' // This should come from auth
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<BlockedDate>>({});

    const handleSubmitBlockedDate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newBlockedDate.blocked_date) {
            // Validate time range if not full day
            if (!newBlockedDate.is_full_day && (!newBlockedDate.start_time || !newBlockedDate.end_time)) {
                alert('Please provide both start and end times for time range blocking.');
                return;
            }
            
            if (!newBlockedDate.is_full_day && newBlockedDate.start_time >= newBlockedDate.end_time) {
                alert('End time must be after start time.');
                return;
            }

            onAddBlockedDate(newBlockedDate);
            setNewBlockedDate({
                blocked_date: new Date().toISOString().split('T')[0], // Reset to today
                start_time: '',
                end_time: '',
                is_full_day: true,
                reason: '',
                client_identifier: 'current_client'
            });
        }
    }, [newBlockedDate, onAddBlockedDate]);

    const handleEdit = useCallback((blockedDate: BlockedDate) => {
        setEditingId(blockedDate.id);
        setEditData({
            blocked_date: blockedDate.blocked_date,
            start_time: blockedDate.start_time,
            end_time: blockedDate.end_time,
            is_full_day: blockedDate.is_full_day,
            reason: blockedDate.reason
        });
    }, []);

    const handleSaveEdit = useCallback(() => {
        if (editingId && editData.blocked_date) {
            // Validate time range if not full day
            if (!editData.is_full_day && (!editData.start_time || !editData.end_time)) {
                alert('Please provide both start and end times for time range blocking.');
                return;
            }
            
            if (!editData.is_full_day && editData.start_time && editData.end_time && editData.start_time >= editData.end_time) {
                alert('End time must be after start time.');
                return;
            }

            onUpdateBlockedDate(editingId, editData);
            setEditingId(null);
            setEditData({});
        }
    }, [editingId, editData, onUpdateBlockedDate]);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setEditData({});
    }, []);

    const handleDelete = useCallback((id: number) => {
        if (confirm('Are you sure you want to remove this blocked date?')) {
            onDeleteBlockedDate(id);
        }
    }, [onDeleteBlockedDate]);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    const formatTimeRange = useCallback((blockedDate: BlockedDate) => {
        if (blockedDate.is_full_day) {
            return 'All day';
        }
        if (blockedDate.start_time && blockedDate.end_time) {
            return `${blockedDate.start_time} - ${blockedDate.end_time}`;
        }
        return 'Time range';
    }, []);

    const sortedBlockedDates = [...blockedDates].sort((a, b) => 
        new Date(a.blocked_date).getTime() - new Date(b.blocked_date).getTime()
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blocked Dates Management</h2>
                        <p className="text-gray-600 dark:text-gray-400">Block specific dates to prevent reservations</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Blocked Dates</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{blockedDates.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-red-500" />
                        Blocked Dates
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Add New Blocked Date Form */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6 mb-6 border border-red-200 dark:border-red-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Block New Date</h3>
                    <form onSubmit={handleSubmitBlockedDate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label htmlFor="blockedDate">Date to Block *</Label>
                                <Input
                                    id="blockedDate"
                                    type="date"
                                    value={newBlockedDate.blocked_date}
                                    onChange={(e) => setNewBlockedDate({ ...newBlockedDate, blocked_date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                />
                            </div>
                            <div>
                                <Label htmlFor="blockingType">Blocking Type</Label>
                                <Select 
                                    value={newBlockedDate.is_full_day ? 'full_day' : 'time_range'} 
                                    onValueChange={(value) => setNewBlockedDate({ 
                                        ...newBlockedDate, 
                                        is_full_day: value === 'full_day',
                                        start_time: value === 'full_day' ? '' : newBlockedDate.start_time,
                                        end_time: value === 'full_day' ? '' : newBlockedDate.end_time
                                    })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Select blocking type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <SelectItem value="full_day" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Full Day
                                        </SelectItem>
                                        <SelectItem value="time_range" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                                            Time Range
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {!newBlockedDate.is_full_day && (
                                <>
                                    <div>
                                        <Label htmlFor="startTime">Start Time *</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={newBlockedDate.start_time}
                                            onChange={(e) => setNewBlockedDate({ ...newBlockedDate, start_time: e.target.value })}
                                            required={!newBlockedDate.is_full_day}
                                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endTime">End Time *</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={newBlockedDate.end_time}
                                            onChange={(e) => setNewBlockedDate({ ...newBlockedDate, end_time: e.target.value })}
                                            required={!newBlockedDate.is_full_day}
                                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="md:col-span-2">
                                <Label htmlFor="blockedReason">Reason (Optional)</Label>
                                <Textarea
                                    id="blockedReason"
                                    value={newBlockedDate.reason}
                                    onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                                    placeholder="e.g., Private event, Maintenance, Holiday"
                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                    rows={3}
                                />
                            </div>
                        </div>
                            <Button 
                                type="submit"
                                className="w-full md:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {newBlockedDate.is_full_day ? 'Block Date' : 'Block Time Range'}
                            </Button>
                        </form>
                    </div>

                    {/* Blocked Dates List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blocked Dates</h3>
                        
                        {sortedBlockedDates.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No blocked dates found.</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Add dates above to prevent reservations.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {sortedBlockedDates.map((blockedDate) => (
                                    <Card key={blockedDate.id} className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    {editingId === blockedDate.id ? (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <Label htmlFor={`edit-date-${blockedDate.id}`}>Date</Label>
                                                                <Input
                                                                    id={`edit-date-${blockedDate.id}`}
                                                                    type="date"
                                                                    value={editData.blocked_date || ''}
                                                                    onChange={(e) => setEditData({ ...editData, blocked_date: e.target.value })}
                                                                    min={new Date().toISOString().split('T')[0]}
                                                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`edit-blocking-type-${blockedDate.id}`}>Blocking Type</Label>
                                                                <Select 
                                                                    value={editData.is_full_day ? 'full_day' : 'time_range'} 
                                                                    onValueChange={(value) => setEditData({ 
                                                                        ...editData, 
                                                                        is_full_day: value === 'full_day',
                                                                        start_time: value === 'full_day' ? '' : editData.start_time,
                                                                        end_time: value === 'full_day' ? '' : editData.end_time
                                                                    })}
                                                                >
                                                                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                                                        <SelectValue placeholder="Select blocking type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                                                        <SelectItem value="full_day" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                                                                            Full Day
                                                                        </SelectItem>
                                                                        <SelectItem value="time_range" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                                                                            Time Range
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            {!editData.is_full_day && (
                                                                <>
                                                                    <div>
                                                                        <Label htmlFor={`edit-start-time-${blockedDate.id}`}>Start Time</Label>
                                                                        <Input
                                                                            id={`edit-start-time-${blockedDate.id}`}
                                                                            type="time"
                                                                            value={editData.start_time || ''}
                                                                            onChange={(e) => setEditData({ ...editData, start_time: e.target.value })}
                                                                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor={`edit-end-time-${blockedDate.id}`}>End Time</Label>
                                                                        <Input
                                                                            id={`edit-end-time-${blockedDate.id}`}
                                                                            type="time"
                                                                            value={editData.end_time || ''}
                                                                            onChange={(e) => setEditData({ ...editData, end_time: e.target.value })}
                                                                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}
                                                            <div>
                                                                <Label htmlFor={`edit-reason-${blockedDate.id}`}>Reason</Label>
                                                                <Textarea
                                                                    id={`edit-reason-${blockedDate.id}`}
                                                                    value={editData.reason || ''}
                                                                    onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                                                                    placeholder="Reason for blocking this date"
                                                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={handleSaveEdit}
                                                                    className="bg-green-500 hover:bg-green-600 text-white"
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                    {formatDate(blockedDate.blocked_date)}
                                                                </h4>
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                                <span className="font-medium">Time:</span> {formatTimeRange(blockedDate)}
                                                            </div>
                                                            {blockedDate.reason && (
                                                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                                    <span className="font-medium">Reason:</span> {blockedDate.reason}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Blocked on {new Date(blockedDate.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {editingId !== blockedDate.id && (
                                                    <div className="flex gap-2 ml-4">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleEdit(blockedDate)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive"
                                                            onClick={() => handleDelete(blockedDate.id)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
