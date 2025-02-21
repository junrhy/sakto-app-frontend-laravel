export type RelationshipType = 'parent' | 'child' | 'spouse' | 'sibling';

export interface FamilyMember {
    id: number;
    first_name: string;
    last_name: string;
    birth_date: string;
    death_date?: string | null;
    gender: 'male' | 'female' | 'other';
    photo: string | null;
    notes: string | null;
    relationships: FamilyRelationship[];
    related_to: FamilyRelationship[];
}

export interface RelatedMemberInfo {
    id: number;
    first_name: string;
    last_name: string;
    birth_date: string;
    death_date: string | null;
}

export interface FamilyRelationship {
    id: number;
    from_member_id: number;
    to_member_id: number;
    relationship_type: RelationshipType;
    created_at?: string;
    updated_at?: string;
    to_member?: RelatedMemberInfo;
    from_member?: RelatedMemberInfo;
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