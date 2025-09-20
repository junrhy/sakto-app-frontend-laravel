import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { Crown, Star, Award, Gem } from 'lucide-react';
import { Patient, VipTier, VipTierBenefit } from '../types';
import VipBadge from './VipBadge';

interface VipManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onUpdateVipStatus: (patientId: string, vipData: any) => Promise<void>;
}

const VipManagementDialog: React.FC<VipManagementDialogProps> = ({
    isOpen,
    onClose,
    patient,
    onUpdateVipStatus
}) => {
    const [isVip, setIsVip] = useState(false);
    const [vipTier, setVipTier] = useState<VipTier>('gold');
    const [customDiscountPercentage, setCustomDiscountPercentage] = useState<string>('');
    const [vipNotes, setVipNotes] = useState('');
    const [priorityScheduling, setPriorityScheduling] = useState(false);
    const [extendedConsultationTime, setExtendedConsultationTime] = useState(false);
    const [dedicatedStaffAssignment, setDedicatedStaffAssignment] = useState(false);
    const [complimentaryServices, setComplimentaryServices] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const vipTierBenefits: Record<VipTier, VipTierBenefit> = {
        standard: {
            name: 'Standard',
            discount_percentage: 0.00,
            priority_scheduling: false,
            extended_consultation_time: false,
            dedicated_staff_assignment: false,
            complimentary_services: false,
            color: 'gray',
            icon: '⭐',
            description: 'Regular patient status'
        },
        gold: {
            name: 'Gold VIP',
            discount_percentage: 5.00,
            priority_scheduling: true,
            extended_consultation_time: false,
            dedicated_staff_assignment: false,
            complimentary_services: false,
            color: 'yellow',
            icon: '🥇',
            description: 'Priority scheduling + 5% discount'
        },
        platinum: {
            name: 'Platinum VIP',
            discount_percentage: 10.00,
            priority_scheduling: true,
            extended_consultation_time: true,
            dedicated_staff_assignment: false,
            complimentary_services: true,
            color: 'blue',
            icon: '💎',
            description: 'Extended consultation + 10% discount + complimentary services'
        },
        diamond: {
            name: 'Diamond VIP',
            discount_percentage: 15.00,
            priority_scheduling: true,
            extended_consultation_time: true,
            dedicated_staff_assignment: true,
            complimentary_services: true,
            color: 'purple',
            icon: '👑',
            description: 'Full VIP experience + 15% discount + dedicated staff'
        }
    };

    useEffect(() => {
        if (patient) {
            setIsVip(patient.is_vip || false);
            setVipTier(patient.vip_tier || 'gold');
            setCustomDiscountPercentage(patient.vip_discount_percentage?.toString() || '');
            setVipNotes(patient.vip_notes || '');
            setPriorityScheduling(patient.priority_scheduling || false);
            setExtendedConsultationTime(patient.extended_consultation_time || false);
            setDedicatedStaffAssignment(patient.dedicated_staff_assignment || false);
            setComplimentaryServices(patient.complimentary_services || false);
        }
    }, [patient]);

    const handleTierChange = (tier: VipTier) => {
        setVipTier(tier);
        const benefits = vipTierBenefits[tier];
        
        // Auto-apply tier benefits
        setCustomDiscountPercentage(benefits.discount_percentage.toString());
        setPriorityScheduling(benefits.priority_scheduling);
        setExtendedConsultationTime(benefits.extended_consultation_time);
        setDedicatedStaffAssignment(benefits.dedicated_staff_assignment);
        setComplimentaryServices(benefits.complimentary_services);
    };

    const handleSave = async () => {
        if (!patient) return;

        setIsLoading(true);
        try {
            const vipData = {
                is_vip: isVip,
                vip_tier: isVip ? vipTier : 'standard',
                vip_discount_percentage: isVip ? parseFloat(customDiscountPercentage) || 0 : 0,
                vip_notes: isVip ? vipNotes : '',
                priority_scheduling: isVip ? priorityScheduling : false,
                extended_consultation_time: isVip ? extendedConsultationTime : false,
                dedicated_staff_assignment: isVip ? dedicatedStaffAssignment : false,
                complimentary_services: isVip ? complimentaryServices : false
            };

            await onUpdateVipStatus(patient.id, vipData);
            onClose();
        } catch (error) {
            console.error('Failed to update VIP status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentBenefits = vipTierBenefits[vipTier];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Crown className="h-5 w-5 text-purple-500" />
                        <span>VIP Management</span>
                        {patient && <VipBadge patient={patient} size="sm" />}
                    </DialogTitle>
                </DialogHeader>

                {patient && (
                    <div className="space-y-6">
                        {/* Patient Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    {patient.name}
                                    <Badge variant="outline">{patient.arn || 'No ARN'}</Badge>
                                </CardTitle>
                                <CardDescription>
                                    {patient.email} • {patient.phone}
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* VIP Status Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="vip-status" className="text-base font-medium">
                                    VIP Status
                                </Label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enable VIP privileges for this patient
                                </p>
                            </div>
                            <Switch
                                id="vip-status"
                                checked={isVip}
                                onCheckedChange={setIsVip}
                            />
                        </div>

                        {isVip && (
                            <>
                                <Separator />
                                
                                {/* VIP Tier Selection */}
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">VIP Tier</Label>
                                    <Select value={vipTier} onValueChange={handleTierChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gold">🥇 Gold VIP</SelectItem>
                                            <SelectItem value="platinum">💎 Platinum VIP</SelectItem>
                                            <SelectItem value="diamond">👑 Diamond VIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Tier Benefits Preview */}
                                    <Card className="bg-gray-50 dark:bg-gray-800">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center">
                                                <span className="mr-2">{currentBenefits.icon}</span>
                                                {currentBenefits.name} Benefits
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center">
                                                    <span className={`mr-2 ${currentBenefits.discount_percentage > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {currentBenefits.discount_percentage > 0 ? '✓' : '✗'}
                                                    </span>
                                                    {currentBenefits.discount_percentage}% Discount
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`mr-2 ${currentBenefits.priority_scheduling ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {currentBenefits.priority_scheduling ? '✓' : '✗'}
                                                    </span>
                                                    Priority Scheduling
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`mr-2 ${currentBenefits.extended_consultation_time ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {currentBenefits.extended_consultation_time ? '✓' : '✗'}
                                                    </span>
                                                    Extended Consultation
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`mr-2 ${currentBenefits.dedicated_staff_assignment ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {currentBenefits.dedicated_staff_assignment ? '✓' : '✗'}
                                                    </span>
                                                    Dedicated Staff
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`mr-2 ${currentBenefits.complimentary_services ? 'text-green-500' : 'text-gray-400'}`}>
                                                        {currentBenefits.complimentary_services ? '✓' : '✗'}
                                                    </span>
                                                    Complimentary Services
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Custom Settings */}
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">Custom Settings</Label>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="discount-percentage">Discount Percentage (%)</Label>
                                            <Input
                                                id="discount-percentage"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={customDiscountPercentage}
                                                onChange={(e) => setCustomDiscountPercentage(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Individual Privileges */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="priority-scheduling">Priority Scheduling</Label>
                                            <Switch
                                                id="priority-scheduling"
                                                checked={priorityScheduling}
                                                onCheckedChange={setPriorityScheduling}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="extended-consultation">Extended Consultation</Label>
                                            <Switch
                                                id="extended-consultation"
                                                checked={extendedConsultationTime}
                                                onCheckedChange={setExtendedConsultationTime}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="dedicated-staff">Dedicated Staff</Label>
                                            <Switch
                                                id="dedicated-staff"
                                                checked={dedicatedStaffAssignment}
                                                onCheckedChange={setDedicatedStaffAssignment}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="complimentary-services">Complimentary Services</Label>
                                            <Switch
                                                id="complimentary-services"
                                                checked={complimentaryServices}
                                                onCheckedChange={setComplimentaryServices}
                                            />
                                        </div>
                                    </div>

                                    {/* VIP Notes */}
                                    <div>
                                        <Label htmlFor="vip-notes">VIP Notes</Label>
                                        <Textarea
                                            id="vip-notes"
                                            value={vipNotes}
                                            onChange={(e) => setVipNotes(e.target.value)}
                                            placeholder="Special notes or instructions for VIP treatment..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VipManagementDialog;
