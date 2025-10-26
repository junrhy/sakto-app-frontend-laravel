import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Rocket, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';

interface TrialInstructionsProps {
    projectIdentifier: string;
    className?: string;
}

const getInstructionsByProject = (projectIdentifier: string) => {
    const instructions: Record<string, {
        title: string;
        description: string;
        steps: string[];
        tips: string[];
    }> = {
        trial: {
            title: 'Welcome to Neulify Platform! 🎉',
            description: 'Explore all our apps during your 14-day free trial. Here\'s how to get started:',
            steps: [
                'Browse the available apps on your home screen',
                'Click on any app to explore its features',
                'Set up your profile and preferences',
                'Add team members to collaborate',
                'Try different modules to find what works best for you',
            ],
            tips: [
                'All premium features are unlocked during your trial',
                'Explore the Apps page to see all available modules',
                'Check out our Help Center for detailed guides',
                'Subscribe before your trial ends to keep your data',
            ],
        },
        community: {
            title: 'Community Management Platform',
            description: 'Manage your community effectively with these features:',
            steps: [
                'Set up your community profile and information',
                'Add community members and manage their profiles',
                'Create events and track participation',
                'Manage member contributions and payments',
                'Generate reports for community activities',
            ],
            tips: [
                'Use the member directory to keep track of all members',
                'Set up recurring events for regular activities',
                'Enable online payments for easy contribution collection',
                'Use the kiosk terminal for on-site member management',
            ],
        },
        clinic: {
            title: 'Clinic Management System',
            description: 'Streamline your clinic operations with these tools:',
            steps: [
                'Add patients to your system with complete medical records',
                'Schedule and manage appointments',
                'Track inventory for medicines and supplies',
                'Record patient consultations and prescriptions',
                'Generate billing and payment records',
            ],
            tips: [
                'Use the appointment calendar for better scheduling',
                'Keep inventory updated to avoid stockouts',
                'Record patient medical history for better care',
                'Enable online appointment booking for patients',
            ],
        },
        retail: {
            title: 'Retail & POS System',
            description: 'Manage your retail business efficiently:',
            steps: [
                'Set up your product catalog with prices and images',
                'Add inventory and track stock levels',
                'Process sales using the POS system',
                'Manage customer orders and deliveries',
                'Generate sales reports and analytics',
            ],
            tips: [
                'Use barcode scanning for faster checkout',
                'Set up product variants for different sizes/colors',
                'Enable online store for additional sales channel',
                'Track best-selling items to optimize inventory',
            ],
        },
        restaurant: {
            title: 'Restaurant Management System',
            description: 'Run your restaurant smoothly with these features:',
            steps: [
                'Create your menu with categories and pricing',
                'Set up tables and manage reservations',
                'Process orders using the POS system',
                'Track kitchen orders and delivery',
                'Manage inventory and suppliers',
            ],
            tips: [
                'Use the kitchen display for order management',
                'Enable online ordering for delivery/takeout',
                'Set up table reservations for better planning',
                'Track popular dishes to optimize your menu',
            ],
        },
        transport: {
            title: 'Transportation Management',
            description: 'Manage your transportation business effectively:',
            steps: [
                'Add vehicles and drivers to your fleet',
                'Create booking and scheduling system',
                'Track vehicle locations in real-time',
                'Manage fuel and maintenance records',
                'Generate trip reports and analytics',
            ],
            tips: [
                'Use GPS tracking for real-time monitoring',
                'Schedule regular maintenance to avoid breakdowns',
                'Track fuel consumption for cost optimization',
                'Enable online booking for customer convenience',
            ],
        },
        mortuary: {
            title: 'Mortuary Assistance Fund',
            description: 'Manage your mortuary assistance program:',
            steps: [
                'Register members and their beneficiaries',
                'Collect and track member contributions',
                'Process claims and disbursements',
                'Generate member statements and reports',
                'Track fund balance and sustainability',
            ],
            tips: [
                'Set up automated contribution reminders',
                'Keep beneficiary information updated',
                'Process claims promptly for member satisfaction',
                'Generate monthly reports for transparency',
            ],
        },
        lending: {
            title: 'Lending & Loan Management',
            description: 'Manage your lending business efficiently:',
            steps: [
                'Create loan products with terms and rates',
                'Process loan applications and approvals',
                'Track loan payments and collections',
                'Manage Capital Build-Up (CBU) funds',
                'Generate loan reports and statements',
            ],
            tips: [
                'Set up automated payment reminders',
                'Track overdue accounts for timely collection',
                'Use CBU for member equity building',
                'Generate amortization schedules for transparency',
            ],
        },
        insurance: {
            title: 'Health Insurance Management',
            description: 'Manage your health insurance program:',
            steps: [
                'Register members and their dependents',
                'Collect insurance contributions regularly',
                'Process health insurance claims',
                'Track member coverage and benefits',
                'Generate insurance reports and statements',
            ],
            tips: [
                'Keep member health records updated',
                'Process claims quickly for member satisfaction',
                'Track claim patterns for program improvement',
                'Send contribution reminders to members',
            ],
        },
    };

    return instructions[projectIdentifier] || instructions.trial;
};

export default function TrialInstructions({ projectIdentifier, className = '' }: TrialInstructionsProps) {
    const instructions = getInstructionsByProject(projectIdentifier);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

    // Load completed steps from localStorage on mount
    useEffect(() => {
        const storageKey = `trial-instructions-${projectIdentifier}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCompletedSteps(parsed.completedSteps || []);
                setIsDismissed(parsed.isDismissed || false);
            } catch (e) {
                // Initialize with false for each step
                setCompletedSteps(new Array(instructions.steps.length).fill(false));
            }
        } else {
            setCompletedSteps(new Array(instructions.steps.length).fill(false));
        }
    }, [projectIdentifier, instructions.steps.length]);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (completedSteps.length > 0) {
            const storageKey = `trial-instructions-${projectIdentifier}`;
            localStorage.setItem(storageKey, JSON.stringify({
                completedSteps,
                isDismissed
            }));

            // Auto-hide when all steps are completed
            if (completedSteps.every(step => step === true)) {
                setTimeout(() => {
                    setIsDismissed(true);
                }, 500); // Small delay for better UX
            }
        }
    }, [completedSteps, isDismissed, projectIdentifier]);

    const toggleStep = (index: number) => {
        const newCompletedSteps = [...completedSteps];
        newCompletedSteps[index] = !newCompletedSteps[index];
        setCompletedSteps(newCompletedSteps);
    };

    const completedCount = completedSteps.filter(Boolean).length;
    const totalSteps = instructions.steps.length;

    if (isDismissed) return null;

    return (
        <Alert className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 ${className}`}>
            <AlertDescription>
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                            <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {instructions.title}
                                </h3>
                                <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                                    {completedCount}/{totalSteps}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {instructions.description}
                            </p>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                    style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDismissed(true)}
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {isExpanded && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Getting Started Steps */}
                                <Card className="border-blue-200 dark:border-blue-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
                                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            Getting Started
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {instructions.steps.map((step, index) => (
                                            <div 
                                                key={index} 
                                                className="flex items-start gap-3 cursor-pointer group"
                                                onClick={() => toggleStep(index)}
                                            >
                                                <Checkbox
                                                    checked={completedSteps[index] || false}
                                                    onCheckedChange={() => toggleStep(index)}
                                                    className="mt-0.5 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                />
                                                <div className="flex-1">
                                                    <span className={`text-sm transition-all ${
                                                        completedSteps[index] 
                                                            ? 'text-gray-500 dark:text-gray-500 line-through' 
                                                            : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                                    }`}>
                                                        {step}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Pro Tips */}
                                <Card className="border-blue-200 dark:border-blue-800">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
                                            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            Pro Tips
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {instructions.tips.map((tip, index) => (
                                            <div key={index} className="flex gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                                                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Footer CTA */}
                            <div className="rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <strong className="text-gray-900 dark:text-white">Need help?</strong> Visit our{' '}
                                    <a href={`/${projectIdentifier}/help`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                        Help Center
                                    </a>
                                    {' '}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
}

