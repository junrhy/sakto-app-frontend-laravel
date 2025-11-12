interface QuickAction {
    title: string;
    description: string;
    href: string;
    color: 'blue' | 'green' | 'orange' | 'purple';
}

const colorClasses: Record<
    QuickAction['color'],
    {
        container: string;
        title: string;
        description: string;
        button: string;
        buttonHover: string;
        buttonDark: string;
        buttonDarkHover: string;
    }
> = {
    blue: {
        container:
            'border-blue-100 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
        title: 'text-blue-800 dark:text-blue-300',
        description: 'text-blue-700 dark:text-blue-200',
        button: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        buttonDark: 'dark:bg-blue-500',
        buttonDarkHover: 'dark:hover:bg-blue-600',
    },
    green: {
        container:
            'border-green-100 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
        title: 'text-green-800 dark:text-green-300',
        description: 'text-green-700 dark:text-green-200',
        button: 'bg-green-600',
        buttonHover: 'hover:bg-green-700',
        buttonDark: 'dark:bg-green-500',
        buttonDarkHover: 'dark:hover:bg-green-600',
    },
    orange: {
        container:
            'border-orange-100 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20',
        title: 'text-orange-800 dark:text-orange-300',
        description: 'text-orange-700 dark:text-orange-200',
        button: 'bg-orange-600',
        buttonHover: 'hover:bg-orange-700',
        buttonDark: 'dark:bg-orange-500',
        buttonDarkHover: 'dark:hover:bg-orange-600',
    },
    purple: {
        container:
            'border-purple-100 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
        title: 'text-purple-800 dark:text-purple-300',
        description: 'text-purple-700 dark:text-purple-200',
        button: 'bg-purple-600',
        buttonHover: 'hover:bg-purple-700',
        buttonDark: 'dark:bg-purple-500',
        buttonDarkHover: 'dark:hover:bg-purple-600',
    },
};

interface QuickActionsGridProps {
    actions: QuickAction[];
}

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => {
                const colors = colorClasses[action.color];
                return (
                    <div
                        key={action.title}
                        className={`rounded-lg border p-6 shadow ${colors.container}`}
                    >
                        <h4 className={`mb-2 font-semibold ${colors.title}`}>
                            {action.title}
                        </h4>
                        <p className={`text-sm ${colors.description}`}>
                            {action.description}
                        </p>
                        <div className="mt-4">
                            <a
                                href={action.href}
                                className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out ${colors.button} ${colors.buttonHover} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:${colors.buttonDark} dark:${colors.buttonDarkHover} dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800`}
                            >
                                Go to {action.title}
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
