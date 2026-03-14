---
inclusion: fileMatch
fileMatchPattern: "**/*.{service,controller,api}.{ts,js}"
---

# Lumis API Conventions

## Endpoint Structure

### Base URL
- Development: `http://localhost:3001/api/v1`
- Production: `https://api.lumis.app/api/v1`

### Resource Naming
- Plural nouns: `/users`, `/members`, `/traits`
- Nested resources: `/members/:id/incidents`, `/members/:id/journal`
- Actions: `/lumen/query`, `/reports/regenerate`

## Standard Endpoints

### Authentication
```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
```

### User (Self)
```
GET    /users/me
PATCH  /users/me
GET    /users/me/numerology
GET    /users/me/astrology
GET    /users/me/traits
POST   /users/me/traits
PATCH  /users/me/traits/:id
DELETE /users/me/traits/:id
GET    /users/me/report
POST   /users/me/report/regenerate
```

### Members
```
GET    /members
POST   /members
GET    /members/:id
PATCH  /members/:id
DELETE /members/:id (soft delete)
POST   /members/:id/archive
POST   /members/:id/unarchive

GET    /members/:id/numerology
GET    /members/:id/astrology
GET    /members/:id/traits
POST   /members/:id/traits
PATCH  /members/:id/traits/:traitId
DELETE /members/:id/traits/:traitId

GET    /members/:id/incidents
POST   /members/:id/incidents
PATCH  /members/:id/incidents/:incidentId
DELETE /members/:id/incidents/:incidentId

GET    /members/:id/patterns
POST   /members/:id/patterns
PATCH  /members/:id/patterns/:patternId
DELETE /members/:id/patterns/:patternId

GET    /members/:id/interactions
POST   /members/:id/interactions
PATCH  /members/:id/interactions/:interactionId
DELETE /members/:id/interactions/:interactionId

GET    /members/:id/journal
POST   /members/:id/journal
PATCH  /members/:id/journal/:entryId
DELETE /members/:id/journal/:entryId

GET    /members/:id/report
POST   /members/:id/report/regenerate
```

### Lumen (AI Agent)
```
POST   /lumen/query
GET    /lumen/conversations
GET    /lumen/conversations/:id
DELETE /lumen/conversations/:id
POST   /lumen/mode (switch mode)
GET    /lumen/digest/weekly
```

### Insights
```
GET    /insights/dashboard
GET    /insights/energy-map
GET    /insights/emotional-weather
GET    /insights/pattern-alerts
GET    /insights/trigger-map
GET    /insights/calendar
```

### Sharing
```
POST   /sharing/links
GET    /sharing/links/:token
DELETE /sharing/links/:id
PATCH  /sharing/links/:id/visibility
```

## Request/Response Format

### Standard Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-03-12T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date of birth",
    "details": {
      "field": "dateOfBirth",
      "reason": "Must be in the past"
    }
  },
  "meta": {
    "timestamp": "2025-03-12T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalItems": 97
    }
  }
}
```

## Query Parameters

### Filtering
```
GET /members?filter[type]=friend&filter[archived]=false
GET /members/:id/incidents?filter[date][gte]=2025-01-01
```

### Sorting
```
GET /members?sort=name:asc
GET /members/:id/interactions?sort=date:desc
```

### Pagination
```
GET /members?page=2&limit=20
```

### Field Selection
```
GET /members?fields=id,name,photo,relationType
```

### Includes (eager loading)
```
GET /members/:id?include=numerology,astrology,traits
```

## RTK Query API Slices

### User API
```typescript
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['User', 'UserTraits', 'UserReport'],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/users/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    // ... more endpoints
  }),
});
```

### Members API
```typescript
export const membersApi = createApi({
  reducerPath: 'membersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Members', 'Member', 'MemberTraits', 'MemberIncidents', 'MemberReport'],
  endpoints: (builder) => ({
    getMembers: builder.query<Member[], MembersQueryParams>({
      query: (params) => ({
        url: '/members',
        params,
      }),
      providesTags: ['Members'],
    }),
    // ... more endpoints
  }),
});
```

## Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized for this resource
- `NOT_FOUND` - Resource doesn't exist
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AI_SERVICE_ERROR` - Lumen/Claude API error
- `CALCULATION_ERROR` - Numerology/astrology calculation failed

## Rate Limiting
- Standard endpoints: 100 requests/minute
- AI endpoints: 10 requests/minute
- Auth endpoints: 5 requests/minute

## Authentication
- JWT tokens in `Authorization: Bearer <token>` header
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Refresh endpoint: `/auth/refresh`

## Validation Rules
- All dates: ISO 8601 format
- DOB: must be in the past
- Time of birth: HH:MM format (24-hour)
- Place of birth: requires lat/long or city name
- Trait intensity: 1-3 (mild, moderate, strong)
- Emotion tags: from predefined list
- Member relation type: from predefined list

## Service Layer Pattern
```typescript
// members.service.ts
@Injectable()
export class MembersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly numerology: NumerologyService,
    private readonly astrology: AstrologyService,
    private readonly lumen: LumenService,
  ) {}

  async create(userId: string, data: CreateMemberDto): Promise<Member> {
    // Validation
    // Database insert
    // Calculate numerology
    // Calculate astrology
    // Return member
  }
}
```

## Controller Pattern
```typescript
// members.controller.ts
@Controller('members')
@UseGuards(AuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(@User() user, @Query() query: MembersQueryDto) {
    const members = await this.membersService.findAll(user.id, query);
    return { success: true, data: members };
  }
}
```


## Validation Rules

### Date & Time
- All dates: ISO 8601 format
- DOB: must be in the past
- Time of birth: HH:MM format (24-hour)
- Place of birth: requires lat/long or city name

### Traits & Emotions
- Trait intensity: 1-3 (mild, moderate, strong)
- Emotion tags: from predefined list

### Member Relation Type
- Must be one of: friend, family, colleague, partner, acquaintance, boss, mentor, therapist, coach, teacher, student, neighbor, ex-partner, other
- If relation_type is 'other', relation_type_custom is required
- relation_type_custom: max 100 characters, alphanumeric + spaces/hyphens
- Examples of custom types: CEO, HR Manager, Stranger, Roommate, Landlord, Client, Vendor, etc.

### Request Validation Example
```typescript
// Valid
{
  "fullName": "John Doe",
  "relationType": "friend"
}

// Valid with custom
{
  "fullName": "Jane Smith",
  "relationType": "other",
  "relationTypeCustom": "CEO"
}

// Invalid - missing custom when other is selected
{
  "fullName": "Bob Wilson",
  "relationType": "other"
  // Error: relationTypeCustom is required when relationType is 'other'
}
```
