---
inclusion: fileMatch
fileMatchPattern: "**/*.{test,spec}.{ts,tsx,js,jsx}"
---

# Lumis Testing Standards

## Testing Philosophy
- Test behavior, not implementation
- Write tests that give confidence
- Fast feedback loop
- Maintainable test code

## Test Coverage Requirements
- Services: 80% minimum
- API endpoints: 100% critical paths
- Components: 70% minimum
- Utilities: 90% minimum

## Testing Stack
- Jest: test runner
- React Testing Library: component tests
- Supertest: API integration tests
- Playwright: E2E tests

## Unit Tests (Services & Utilities)

### Service Tests
```typescript
describe('NumerologyService', () => {
  let service: NumerologyService;

  beforeEach(() => {
    service = new NumerologyService();
  });

  it('calculates life path number correctly', () => {
    const result = service.calculateLifePath('1990-05-15');
    expect(result).toBe(3); // 1+9+9+0+0+5+1+5 = 30 -> 3+0 = 3
  });

  it('handles master numbers', () => {
    const result = service.calculateLifePath('1990-11-11');
    expect(result).toBe(11); // Should not reduce
  });
});
```

## Integration Tests (API Endpoints)

### API Test Pattern
```typescript
describe('POST /api/v1/members', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await getTestAuthToken();
  });

  it('creates member with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fullName: 'Test Member',
        relationType: 'friend',
        dateOfBirth: '1995-03-20',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });

  it('returns 400 for invalid date', async () => {
    const response = await request(app)
      .post('/api/v1/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fullName: 'Test Member',
        dateOfBirth: 'invalid-date',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Component Tests

### Component Test Pattern
```typescript
describe('TraitLogger', () => {
  const mockOnSave = jest.fn();

  it('renders trait form', () => {
    render(<TraitLogger category="strength" onSave={mockOnSave} />);
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('calls onSave with correct data', async () => {
    render(<TraitLogger category="pro" onSave={mockOnSave} />);
    
    await userEvent.type(screen.getByLabelText(/description/i), 'Great listener');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSave).toHaveBeenCalledWith({
      category: 'pro',
      description: 'Great listener',
    });
  });
});
```

## E2E Tests (Critical Flows)

### E2E Test Pattern
```typescript
test('user can add member and log first trait', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard');
  await page.click('text=Add Member');

  await page.fill('[name="fullName"]', 'Jane Doe');
  await page.selectOption('[name="relationType"]', 'friend');
  await page.click('button:has-text("Save")');

  await page.waitForURL(/\/members\/[a-f0-9-]+/);
  await page.click('text=Pros & Cons');
  await page.click('text=Add Pro');

  await page.fill('[name="description"]', 'Always supportive');
  await page.click('button:has-text("Save Trait")');

  await expect(page.locator('text=Always supportive')).toBeVisible();
});
```

## Test Data Management

### Factories
```typescript
export const userFactory = (overrides = {}) => ({
  id: uuid(),
  email: 'test@example.com',
  fullName: 'Test User',
  dateOfBirth: '1990-01-01',
  ...overrides,
});

export const memberFactory = (overrides = {}) => ({
  id: uuid(),
  fullName: 'Test Member',
  relationType: 'friend',
  ...overrides,
});
```

## Mocking Guidelines

### Mock External Services
```typescript
jest.mock('@/lib/services/claude.service', () => ({
  ClaudeService: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({
      response: 'Mocked AI response',
    }),
  })),
}));
```

### Mock Database
```typescript
const mockDb = {
  users: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
```

## Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- E2E files: `*.e2e.ts`
- Test suites: `describe('ComponentName', ...)`
- Test cases: `it('does something', ...)` or `test('does something', ...)`

## What to Test
✅ Happy paths
✅ Error cases
✅ Edge cases
✅ User interactions
✅ API responses
✅ State changes
✅ Validation logic

## What NOT to Test
❌ Third-party libraries
❌ Framework internals
❌ Trivial getters/setters
❌ Implementation details
