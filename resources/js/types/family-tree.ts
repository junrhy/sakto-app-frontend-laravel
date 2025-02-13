export type RelationshipType = 'parent' | 'child' | 'spouse' | 'sibling';

export interface FamilyMember {
    id: number;
    first_name: string;
    last_name: string;
    birth_date: string;
    death_date?: string | null;
    gender: 'male' | 'female' | 'other';
    photo: string | null;
    notes: string;
    relationships: FamilyRelationship[];
}

export interface FamilyRelationship {
    id: number;
    to_member_id: number;
    relationship_type: RelationshipType;
}

export interface FamilyTreeProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            identifier: string;
        };
    };
    familyMembers: FamilyMember[];
} 