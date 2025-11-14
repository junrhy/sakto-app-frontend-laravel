export type OwnerSidebarSection = {
    id: string;
    label: string;
    href: string;
    isActive?: boolean;
};

type SectionConfig = {
    id: OwnerSidebarSection['id'];
    label: OwnerSidebarSection['label'];
    buildHref: (
        projectIdentifier: string,
        ownerIdentifier: string,
    ) => string | null;
};

const sectionConfigs: SectionConfig[] = [
    {
        id: 'overview',
        label: 'Overview',
        buildHref: (projectIdentifier, ownerIdentifier) => {
            if (projectIdentifier !== 'community') {
                return null;
            }

            return route('customer.communities.show', ownerIdentifier);
        },
    },
    {
        id: 'resources',
        label: 'Resources',
        buildHref: (projectIdentifier, ownerIdentifier) =>
            route('customer.projects.resources.overview', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
    },
    {
        id: 'challenges',
        label: 'Challenges',
        buildHref: (projectIdentifier, ownerIdentifier) =>
            route('customer.projects.challenges.overview', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
    },
    {
        id: 'marketplace',
        label: 'Marketplace',
        buildHref: (projectIdentifier, ownerIdentifier) =>
            route('customer.projects.marketplace.overview', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
    },
    {
        id: 'courses',
        label: 'Courses',
        buildHref: (projectIdentifier, ownerIdentifier) =>
            route('customer.projects.courses.index', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
    },
    {
        id: 'healthcare',
        label: 'Healthcare',
        buildHref: (projectIdentifier, ownerIdentifier) =>
            route('customer.projects.healthcare.index', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
    },
    {
        id: 'mortuary',
        label: 'Mortuary',
        buildHref: (projectIdentifier, ownerIdentifier) =>
            route('customer.projects.mortuary.index', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
    },
    {
        id: 'lending',
        label: 'Lending',
        buildHref: (projectIdentifier, ownerIdentifier) =>
            route('customer.projects.lending.index', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
    },
];

export function buildOwnerSidebarSections(
    projectIdentifier: string,
    ownerIdentifier: string,
    activeSectionId?: string,
): OwnerSidebarSection[] {
    return sectionConfigs
        .map((config) => {
            const href = config.buildHref(projectIdentifier, ownerIdentifier);

            if (!href) {
                return null;
            }

            return {
                id: config.id,
                label: config.label,
                href,
                isActive: activeSectionId
                    ? config.id === activeSectionId
                    : undefined,
            };
        })
        .filter(Boolean) as OwnerSidebarSection[];
}

