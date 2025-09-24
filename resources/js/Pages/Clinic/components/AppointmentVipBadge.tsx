import { Badge } from '@/Components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import React from 'react';
import { Appointment } from '../types/appointment';

interface AppointmentVipBadgeProps {
    appointment: Appointment;
    size?: 'sm' | 'default' | 'lg';
    showTooltip?: boolean;
}

const AppointmentVipBadge: React.FC<AppointmentVipBadgeProps> = ({
    appointment,
    size = 'default',
    showTooltip = true,
}) => {
    if (!appointment.is_priority_patient || !appointment.vip_tier) {
        return null;
    }

    const getVipTierConfig = (tier: string) => {
        const configs = {
            gold: {
                name: 'Gold VIP',
                icon: '🥇',
                color: 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700',
                class: 'bg-yellow-500 text-white',
                description: 'Priority scheduling + 5% discount',
            },
            platinum: {
                name: 'Platinum VIP',
                icon: '💎',
                color: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
                class: 'bg-blue-500 text-white',
                description:
                    'Extended consultation + 10% discount + complimentary services',
            },
            diamond: {
                name: 'Diamond VIP',
                icon: '👑',
                color: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
                class: 'bg-purple-500 text-white',
                description:
                    'Full VIP experience + 15% discount + dedicated staff',
            },
        };
        return configs[tier as keyof typeof configs] || configs.gold;
    };

    // Always use local config to ensure consistent structure
    const tierConfig = getVipTierConfig(appointment.vip_tier);

    const badgeContent = (
        <Badge
            variant="outline"
            className={` ${tierConfig.color || tierConfig.class} border-transparent text-white ${size === 'sm' ? 'px-1.5 py-0.5 text-xs' : ''} ${size === 'lg' ? 'px-3 py-1 text-sm' : ''} cursor-pointer transition-colors duration-200`}
        >
            <span className="mr-1">{tierConfig.icon}</span>
            {size === 'sm' ? 'VIP' : tierConfig.name}
        </Badge>
    );

    if (!showTooltip) {
        return badgeContent;
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Priority Level: {appointment.priority_level}
                        </p>
                        <div className="text-xs text-green-600 dark:text-green-400">
                            ✓ Priority Scheduling Enabled
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default AppointmentVipBadge;
