import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Patient } from '../types';

interface EditPatientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onUpdate: (patient: Patient) => void;
}

export const EditPatientDialog: React.FC<EditPatientDialogProps> = ({
    isOpen,
    onClose,
    patient,
    onUpdate
}) => {
    const [editingPatient, setEditingPatient] = React.useState<Patient | null>(patient);

    React.useEffect(() => {
        setEditingPatient(patient);
    }, [patient]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPatient) {
            onUpdate(editingPatient);
        }
    };

    if (!editingPatient) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Edit Patient Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-arn" className="text-gray-900 dark:text-white">ARN (Admission Record Number)</Label>
                        <Input
                            id="edit-arn"
                            value={editingPatient.arn || ''}
                            onChange={(e) => setEditingPatient(prev => 
                                prev ? { ...prev, arn: e.target.value } : null
                            )}
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            placeholder="ARN will be auto-generated if empty"
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-name" className="text-gray-900 dark:text-white">Name</Label>
                        <Input
                            id="edit-name"
                            value={editingPatient.name || ''}
                            onChange={(e) => setEditingPatient(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                            )}
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-email" className="text-gray-900 dark:text-white">Email</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={editingPatient.email || ''}
                            onChange={(e) => setEditingPatient(prev => 
                                prev ? { ...prev, email: e.target.value } : null
                            )}
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-phone" className="text-gray-900 dark:text-white">Phone</Label>
                        <Input
                            id="edit-phone"
                            value={editingPatient.phone || ''}
                            onChange={(e) => setEditingPatient(prev => 
                                prev ? { ...prev, phone: e.target.value } : null
                            )}
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-birthdate" className="text-gray-900 dark:text-white">Birthdate</Label>
                        <Input
                            id="edit-birthdate"
                            type="date"
                            value={editingPatient.birthdate || ''}
                            onChange={(e) => setEditingPatient(prev => 
                                prev ? { ...prev, birthdate: e.target.value } : null
                            )}
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
