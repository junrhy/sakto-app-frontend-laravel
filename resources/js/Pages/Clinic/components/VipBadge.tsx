import { Badge } from '@/Components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import React from 'react';
import { Patient, VipTier } from '../types';

interface VipBadgeProps {
    patient: Patient;
    size?: 'sm' | 'default' | 'lg';
    showTooltip?: boolean;
}

const VipBadge: React.FC<VipBadgeProps> = ({
    patient,
    size = 'default',
    showTooltip = true,
}) => {
    if (!patient.is_vip) {
        return null;
    }

    const getVipTierConfig = (tier: VipTier) => {
        const configs = {
            standard: {
                name: 'Standard',
                icon: '⭐',
                color: 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
                description: 'Regular patient status',
            },
            gold: {
                name: 'Gold VIP',
                icon: '🥇',
                color: 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700',
                description: 'Priority scheduling + 5% discount',
            },
            platinum: {
                name: 'Platinum VIP',
                icon: '💎',
                color: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
                description:
                    'Extended consultation + 10% discount + complimentary services',
            },
            diamond: {
                name: 'Diamond VIP',
                icon: '👑',
                color: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
                description:
                    'Full VIP experience + 15% discount + dedicated staff',
            },
        };
        return configs[tier] || configs.standard;
    };

    const tierConfig =
        patient.vip_tier_display ||
        getVipTierConfig(patient.vip_tier || 'standard');

    const badgeContent = (
        <Badge
            variant="outline"
            className={` ${tierConfig.color} border-transparent text-white ${size === 'sm' ? 'px-1.5 py-0.5 text-xs' : ''} ${size === 'lg' ? 'px-3 py-1 text-sm' : ''} cursor-pointer transition-colors duration-200`}
        >
            <span className="mr-1">{tierConfig.icon}</span>
            {tierConfig.name}
        </Badge>
    );

    if (!showTooltip) {
        return badgeContent;
    }

    const privileges = [];
    if (patient.priority_scheduling) privileges.push('Priority Scheduling');
    if (patient.extended_consultation_time)
        privileges.push('Extended Consultation');
    if (patient.dedicated_staff_assignment) privileges.push('Dedicated Staff');
    if (patient.complimentary_services)
        privileges.push('Complimentary Services');
    if (
        patient.vip_discount_percentage &&
        patient.vip_discount_percentage > 0
    ) {
        privileges.push(`${patient.vip_discount_percentage}% Discount`);
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                        <div className="flex items-center font-semibold">
                            <span className="mr-2">{tierConfig.icon}</span>
                            {tierConfig.name}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {tierConfig.description}
                        </p>
                        {patient.vip_since && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                VIP since:{' '}
                                {new Date(
                                    patient.vip_since,
                                ).toLocaleDateString()}
                            </p>
                        )}
                        {privileges.length > 0 && (
                            <div>
                                <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Active Privileges:
                                </p>
                                <ul className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                                    {privileges.map((privilege, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center"
                                        >
                                            <span className="mr-1 text-green-500">
                                                ✓
                                            </span>
                                            {privilege}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {patient.vip_notes && (
                            <div>
                                <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Notes:
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {patient.vip_notes}
                                </p>
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default VipBadge;
