import React, { useMemo, useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface Relationship {
  id: number;
  from_member_id: number;
  to_member_id: number;
  relationship_type: 'parent' | 'child' | 'spouse';
  created_at: string;
  updated_at: string;
}

interface FamilyMember {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  death_date: string | null;
  gender: 'male' | 'female';
  photo: string | null;
  notes: string | null;
  client_identifier: string;
  created_at: string;
  updated_at: string;
  relationships: Relationship[];
  related_to: Relationship[];
}

interface Props {
  familyMembers: FamilyMember[];
  clientIdentifier: string;
}

interface TreeNode {
  member: FamilyMember;
  spouse?: FamilyMember;
  children: TreeNode[];
}

const PrintableView: React.FC<Props> = ({ familyMembers = [], clientIdentifier }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Find the oldest member to use as root
  const rootMember = useMemo(() => {
    if (!familyMembers.length) return null;
    
    return familyMembers.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.birth_date);
      const currentDate = new Date(current.birth_date);
      return currentDate < oldestDate ? current : oldest;
    });
  }, [familyMembers]);

  // Build the family tree structure
  const buildFamilyTree = (member: FamilyMember): TreeNode => {
    const node: TreeNode = {
      member,
      children: []
    };

    // Find spouse
    const spouseRelation = member.relationships.find((r: Relationship) => r.relationship_type === 'spouse');
    if (spouseRelation) {
      node.spouse = familyMembers.find(m => m.id === spouseRelation.to_member_id);
    }

    // Find children and sort by birth date
    const childrenIds = member.relationships
      .filter((r: Relationship) => r.relationship_type === 'parent')
      .map((r: Relationship) => r.to_member_id);

    const children = familyMembers
      .filter(m => childrenIds.includes(m.id))
      .sort((a, b) => new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime());

    node.children = children.map(child => buildFamilyTree(child));

    return node;
  };

  const calculateAge = (birthDate: string, deathDate: string | null): string => {
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const ageDate = new Date(end.getTime() - birth.getTime());
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    if (deathDate) {
      return `${age} years (${birth.getFullYear()}-${new Date(deathDate).getFullYear()})`;
    }
    
    return `${age} years (${birth.getFullYear()})`;
  };

  const getGenderStyles = (gender: 'male' | 'female', isDead: boolean) => {
    const baseStyles = "p-4 border rounded-lg shadow transition-all duration-200 hover:shadow-lg";
    const aliveStyles = {
      male: "bg-blue-50 border-blue-200",
      female: "bg-pink-50 border-pink-200"
    } as const;
    const deadStyles = {
      male: "bg-gray-100 border-gray-300 opacity-75",
      female: "bg-gray-100 border-gray-300 opacity-75"
    } as const;

    return `${baseStyles} ${isDead ? deadStyles[gender] : aliveStyles[gender]}`;
  };

  const getChildOrder = (child: FamilyMember, parentId: number): string => {
    // Find the parent
    const parent = familyMembers.find(m => m.id === parentId);
    if (!parent) return '';

    // Get all children of the parent, sorted by birth date
    const childrenIds = parent.relationships
      .filter(r => r.relationship_type === 'parent')
      .map(r => r.to_member_id);

    const siblings = familyMembers
      .filter(m => childrenIds.includes(m.id))
      .sort((a, b) => new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime());

    // Find child's position
    const position = siblings.findIndex(sibling => sibling.id === child.id) + 1;
    const total = siblings.length;

    // Get parent's name
    const parentName = `${parent.first_name} ${parent.last_name}`;

    // Create ordinal number
    const ordinal = (n: number): string => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${ordinal(position)} child of ${parentName} (of ${total})`;
  };

  if (!rootMember) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Head title="Printable Family Tree" />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Family Tree</h1>
          <p>No family members found.</p>
        </div>
      </div>
    );
  }

  const familyTree = buildFamilyTree(rootMember);

  // Render a family tree node
  const renderNode = (node: TreeNode, level: number = 0) => {
    const isDead = !!node.member.death_date;
    const memberStyles = getGenderStyles(node.member.gender, isDead);
    
    // Find parent relationship
    const parentRelation = node.member.relationships.find(r => r.relationship_type === 'child');
    const childOrderInfo = parentRelation ? getChildOrder(node.member, parentRelation.to_member_id) : '';
    
    return (
      <div key={node.member.id} style={{ marginLeft: `${level * 40}px`, marginBottom: '20px' }}>
        <div className="flex items-center gap-4">
          <div className={memberStyles}>
            <div className="font-semibold flex items-center gap-2">
              {node.member.gender === 'male' ? '👨' : '👩'}
              {node.member.first_name} {node.member.last_name}
              {isDead && <span className="text-gray-500">✝️</span>}
            </div>
            <div className="text-sm text-gray-600">
              {calculateAge(node.member.birth_date, node.member.death_date)}
            </div>
            {childOrderInfo && (
              <div className="text-xs text-gray-500 mt-1">
                {childOrderInfo}
              </div>
            )}
            {node.member.notes && (
              <div className="text-xs text-gray-500 mt-1 italic">
                {node.member.notes}
              </div>
            )}
          </div>
          
          {node.spouse && (
            <>
              <div className="text-gray-400 text-2xl">⚭</div>
              <div className={getGenderStyles(node.spouse.gender, !!node.spouse.death_date)}>
                <div className="font-semibold flex items-center gap-2">
                  {node.spouse.gender === 'male' ? '👨' : '👩'}
                  {node.spouse.first_name} {node.spouse.last_name}
                  {node.spouse.death_date && <span className="text-gray-500">✝️</span>}
                </div>
                <div className="text-sm text-gray-600">
                  {calculateAge(node.spouse.birth_date, node.spouse.death_date)}
                </div>
                {node.spouse.notes && (
                  <div className="text-xs text-gray-500 mt-1 italic">
                    {node.spouse.notes}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {node.children.length > 0 && (
          <div className="mt-4 border-l-2 border-gray-300 pl-8">
            <div className="text-xs text-gray-500 mb-2">
              Children ({node.children.length}):
            </div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head title="Printable Family Tree" />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Family Tree</h1>
        <div className="mb-4 text-sm text-gray-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-200"></div> Male
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-pink-50 border border-pink-200"></div> Female
            </span>
            <span className="flex items-center gap-1">✝️ Deceased</span>
          </div>
        </div>
        {renderNode(familyTree)}
        
        <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
          Generated on {currentTime.toLocaleDateString()} at {currentTime.toLocaleTimeString()}
        </footer>
      </div>
    </div>
  );
};

export default PrintableView;
