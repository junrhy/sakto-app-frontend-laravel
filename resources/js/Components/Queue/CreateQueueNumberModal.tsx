import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Plus, Ticket } from 'lucide-react';
import { toast } from 'sonner';

interface QueueType {
    id: number;
    name: string;
    prefix: string;
    is_active: boolean;
}

interface Props {
    queueTypes: QueueType[];
    onQueueNumberCreated: () => void;
}

export default function CreateQueueNumberModal({ queueTypes, onQueueNumberCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        queue_type_id: '',
        customer_name: '',
        customer_contact: ''
    });

    const activeQueueTypes = queueTypes.filter(qt => qt.is_active);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.queue_type_id) {
            toast.error('Please select a queue type');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(route('queue.create-number'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.success(`Queue number ${data.data.queue_number} created successfully!`);
                setOpen(false);
                setFormData({ queue_type_id: '', customer_name: '', customer_contact: '' });
                onQueueNumberCreated();
            } else {
                toast.error(data.message || 'Failed to create queue number');
            }
        } catch (error) {
            toast.error('An error occurred while creating queue number');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Get Queue Number
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ticket className="w-5 h-5" />
                        Get Queue Number
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="queue_type_id">Service Type *</Label>
                        <Select 
                            value={formData.queue_type_id} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, queue_type_id: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                                {activeQueueTypes.map((queueType) => (
                                    <SelectItem key={queueType.id} value={queueType.id.toString()}>
                                        {queueType.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer_name">Name (Optional)</Label>
                        <Input
                            id="customer_name"
                            type="text"
                            value={formData.customer_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer_contact">Contact Number (Optional)</Label>
                        <Input
                            id="customer_contact"
                            type="text"
                            value={formData.customer_contact}
                            onChange={(e) => setFormData(prev => ({ ...prev, customer_contact: e.target.value }))}
                            placeholder="Enter your contact number"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Creating...' : 'Get Queue Number'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
