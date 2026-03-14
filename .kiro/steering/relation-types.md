---
inclusion: fileMatch
fileMatchPattern: "**/members/**/*.{ts,tsx}"
---

# Member Relation Types

## Overview
Members can have predefined relation types OR a custom "Other" type that users define themselves.

## Predefined Relation Types

### Personal Relationships
- **Friend** - Close friends, best friends, casual friends
- **Family** - Parents, siblings, children, extended family
- **Partner** - Romantic partner, spouse, significant other
- **Ex-Partner** - Former romantic relationships
- **Neighbor** - People living nearby

### Professional Relationships
- **Colleague** - Coworkers, team members
- **Boss** - Direct manager, supervisor
- **Mentor** - Career mentor, advisor
- **Coach** - Life coach, career coach, executive coach
- **Teacher** - Educators, instructors, professors

### Service Relationships
- **Therapist** - Mental health professionals, counselors
- **Student** - If user is a teacher/mentor

### Social Relationships
- **Acquaintance** - People you know but aren't close with

### Custom Relationship
- **Other** - User-defined custom relation type

## Custom "Other" Field

When user selects "Other", they must provide a custom relation type.

### Common Custom Examples
- CEO
- HR Manager
- Landlord
- Roommate
- Client
- Vendor
- Stranger (someone you encountered)
- Barista (regular service person)
- Doctor
- Lawyer
- Accountant
- Hairdresser
- Personal Trainer
- Spiritual Guide
- Online Friend
- Gaming Buddy
- Study Partner
- Business Partner

### Validation Rules
- Required when "Other" is selected
- Max 100 characters
- Alphanumeric + spaces, hyphens, apostrophes
- Cannot be empty or whitespace only
- Trimmed before saving

### Database Schema
```sql
relation_type VARCHAR(50) NOT NULL
relation_type_custom VARCHAR(100) -- Only populated when relation_type = 'other'
```

### TypeScript Types
```typescript
type PredefinedRelationType = 
  | 'friend'
  | 'family'
  | 'colleague'
  | 'partner'
  | 'acquaintance'
  | 'boss'
  | 'mentor'
  | 'therapist'
  | 'coach'
  | 'teacher'
  | 'student'
  | 'neighbor'
  | 'ex-partner'
  | 'other';

interface Member {
  id: string;
  fullName: string;
  relationType: PredefinedRelationType;
  relationTypeCustom?: string; // Required if relationType === 'other'
  // ... other fields
}
```

### DTO Validation
```typescript
import { IsEnum, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  fullName: string;

  @IsEnum(PredefinedRelationType)
  relationType: PredefinedRelationType;

  @ValidateIf(o => o.relationType === 'other')
  @IsString()
  @MaxLength(100)
  relationTypeCustom?: string;
}
```

### Display Logic
```typescript
const getDisplayRelationType = (member: Member): string => {
  if (member.relationType === 'other' && member.relationTypeCustom) {
    return member.relationTypeCustom;
  }
  
  // Capitalize first letter of predefined types
  return member.relationType.charAt(0).toUpperCase() + member.relationType.slice(1);
};

// Examples:
// { relationType: 'friend' } → "Friend"
// { relationType: 'other', relationTypeCustom: 'CEO' } → "CEO"
// { relationType: 'ex-partner' } → "Ex-partner"
```

### UI Component
```tsx
export const RelationTypeSelector: React.FC<Props> = ({
  value,
  customValue,
  onChange,
  onCustomChange,
}) => {
  const predefinedTypes: PredefinedRelationType[] = [
    'friend',
    'family',
    'colleague',
    'partner',
    'acquaintance',
    'boss',
    'mentor',
    'therapist',
    'coach',
    'teacher',
    'student',
    'neighbor',
    'ex-partner',
    'other',
  ];

  return (
    <div>
      <Select value={value} onChange={onChange}>
        {predefinedTypes.map(type => (
          <option key={type} value={type}>
            {formatRelationType(type)}
          </option>
        ))}
      </Select>
      
      {value === 'other' && (
        <Input
          placeholder="e.g., CEO, HR Manager, Landlord"
          value={customValue}
          onChange={onCustomChange}
          maxLength={100}
          required
        />
      )}
    </div>
  );
};
```

### Filter & Search
```typescript
// Filter members by relation type
const filterByRelationType = (
  members: Member[],
  filterType: PredefinedRelationType | 'all'
): Member[] => {
  if (filterType === 'all') return members;
  return members.filter(m => m.relationType === filterType);
};

// Search includes custom relation types
const searchMembers = (members: Member[], query: string): Member[] => {
  const lowerQuery = query.toLowerCase();
  return members.filter(m => {
    const relationType = m.relationType === 'other' && m.relationTypeCustom
      ? m.relationTypeCustom.toLowerCase()
      : m.relationType.toLowerCase();
    
    return m.fullName.toLowerCase().includes(lowerQuery) ||
           relationType.includes(lowerQuery);
  });
};
```

### Analytics & Insights
```typescript
// Group members by relation type for insights
const groupByRelationType = (members: Member[]): Record<string, Member[]> => {
  return members.reduce((acc, member) => {
    const key = member.relationType === 'other' && member.relationTypeCustom
      ? member.relationTypeCustom
      : member.relationType;
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(member);
    return acc;
  }, {} as Record<string, Member[]>);
};

// Example output:
// {
//   "friend": [member1, member2],
//   "CEO": [member3],
//   "boss": [member4],
//   "Landlord": [member5]
// }
```

### Migration Considerations
If adding this feature to existing data:
- Existing members default to 'acquaintance' or prompt user to categorize
- Batch update UI for users to categorize existing members
- No data loss - all existing members preserved
