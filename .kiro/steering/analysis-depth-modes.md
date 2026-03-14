---
inclusion: fileMatch
fileMatchPattern: "**/lumen/**/*.{ts,tsx}"
---

# Lumen Analysis Depth Modes

## Overview
Users can control what data sources Lumen uses for analysis. This gives users flexibility to get cosmic-only insights, behavioral-only insights, or comprehensive full-spectrum analysis.

## Three Analysis Depth Modes

### 1. COSMIC MODE 🌙
**Tagline:** "Insights from the stars and numbers"

**Data Sources Used:**
- ✅ User numerology (Life Path, Soul Urge, Personal Year, etc.)
- ✅ User astrology (natal chart, transits)
- ✅ Member numerology
- ✅ Member astrology
- ✅ Cosmic compatibility calculations

**Data Sources Ignored:**
- ❌ User self traits (strengths, shadows, triggers, needs, patterns)
- ❌ Member pros/cons
- ❌ Incidents log
- ❌ Patterns log
- ❌ Interactions log
- ❌ Journal entries
- ❌ Mood check-ins

**Best For:**
- Users who want purely spiritual/cosmic insights
- Those exploring numerology and astrology
- Users who haven't logged much behavioral data yet
- People seeking universal patterns vs. specific incidents

**Example Query & Response:**
```
User: "Why do I feel drained after talking to my mom?"

Lumen (Cosmic Mode):
"Based on your numerology, you're a Life Path 6 (the nurturer) 
and your mom is a Life Path 1 (the independent leader). This 
creates a natural tension where you seek harmony and she seeks 
autonomy. Currently, you're in a Personal Year 4 (building 
boundaries) while she's in a Personal Year 8 (asserting power). 
Your Venus in Cancer craves emotional connection, but her Mars 
in Aries prefers direct action over emotional processing."
```

---

### 2. BEHAVIORAL MODE 📊
**Tagline:** "Insights from what you've observed"

**Data Sources Used:**
- ✅ User self traits (strengths, shadows, triggers, needs, patterns)
- ✅ Member pros/cons with intensity ratings
- ✅ All logged incidents with dates and emotional impact
- ✅ All logged patterns
- ✅ All interactions with mood before/after
- ✅ Journal entries
- ✅ Mood check-ins

**Data Sources Ignored:**
- ❌ Numerology data
- ❌ Astrology data
- ❌ Cosmic compatibility

**Best For:**
- Users who prefer evidence-based psychological analysis
- Those skeptical of astrology/numerology
- Users with extensive logged behavioral data
- People seeking concrete pattern recognition

**Example Query & Response:**
```
User: "Why do I feel drained after talking to my mom?"

Lumen (Behavioral Mode):
"Looking at your logged interactions, I notice a pattern: in 
the last 5 conversations with your mom, your mood shifted from 
'peaceful' to 'drained' or 'anxious' in 4 of them. You've logged 
that she 'makes everything about herself' (strong intensity) and 
'dismisses my feelings' (moderate intensity). You've also noted 
your trigger is 'feeling unheard.' This suggests a dynamic where 
your need for validation isn't being met, activating your 
people-pleasing pattern."
```

---

### 3. FULL SPECTRUM MODE ✨
**Tagline:** "Complete insights from all sources" (Default)

**Data Sources Used:**
- ✅ ALL numerology data
- ✅ ALL astrology data
- ✅ ALL logged behavioral data
- ✅ ALL journal entries and mood check-ins
- ✅ Cross-referencing between cosmic and behavioral layers

**Data Sources Ignored:**
- ❌ None - everything is used

**Best For:**
- Users who want the deepest, most comprehensive analysis
- Those who value both cosmic and behavioral insights
- Users with complete data in both areas
- Default mode for most users

**Example Query & Response:**
```
User: "Why do I feel drained after talking to my mom?"

Lumen (Full Spectrum Mode):
"I see this from multiple angles. Cosmically, you're a Life Path 6 
(nurturer) and she's a Life Path 1 (independent leader), creating 
natural tension. Your Venus in Cancer craves emotional depth, but 
her Mars in Aries prefers action over processing.

Behaviorally, this manifests in your logged data: 4 out of 5 recent 
interactions left you feeling drained. You've noted she 'makes 
everything about herself' and 'dismisses my feelings' - both 
triggering your core need to 'feel heard.'

The cosmic blueprint explains WHY this dynamic exists. The behavioral 
data shows HOW it plays out in reality. You're in a Personal Year 4 
(boundaries), which is actually perfect timing to address this pattern."
```

---

## Implementation

### User Preference Storage
```typescript
interface UserPreferences {
  analysisDepthMode: 'cosmic' | 'behavioral' | 'full-spectrum';
  // ... other preferences
}

// Stored in users table
analysis_depth_mode VARCHAR(20) DEFAULT 'full-spectrum'
```

### API Endpoint
```typescript
// Update analysis depth mode
PATCH /api/v1/users/me/preferences
{
  "analysisDepthMode": "cosmic"
}

// Get current mode
GET /api/v1/users/me/preferences
{
  "analysisDepthMode": "full-spectrum"
}
```

### Context Builder
```typescript
class ContextBuilderService {
  async build(userId: string, mode: AnalysisDepthMode): Promise<LumenContext> {
    const context: LumenContext = {
      analysisDepth: mode,
      user: { profile: await this.getUserProfile(userId) },
      members: [],
      conversationHistory: [],
    };

    // Cosmic data
    if (mode === 'cosmic' || mode === 'full-spectrum') {
      context.user.numerology = await this.getNumerology(userId);
      context.user.astrology = await this.getAstrology(userId);
    }

    // Behavioral data
    if (mode === 'behavioral' || mode === 'full-spectrum') {
      context.user.traits = await this.getUserTraits(userId);
      context.recentMoodCheckIns = await this.getMoodCheckIns(userId);
    }

    return context;
  }
}
```

### System Prompt Injection
```typescript
const buildSystemPrompt = (mode: LumenMode, depth: AnalysisDepthMode): string => {
  let prompt = getBaseModePrompt(mode); // Vent, Guided, Analysis, etc.
  
  // Add depth-specific instructions
  switch (depth) {
    case 'cosmic':
      prompt += `\n\nANALYSIS DEPTH: COSMIC MODE
You have access ONLY to numerology and astrology data.
Do NOT reference logged traits, incidents, patterns, or interactions.
Base all insights on cosmic blueprints, cycles, and transits.`;
      break;
      
    case 'behavioral':
      prompt += `\n\nANALYSIS DEPTH: BEHAVIORAL MODE
You have access ONLY to logged behavioral data.
Do NOT reference numerology, astrology, or cosmic influences.
Base all insights on observed traits, incidents, patterns, and interactions.`;
      break;
      
    case 'full-spectrum':
      prompt += `\n\nANALYSIS DEPTH: FULL SPECTRUM MODE
You have access to ALL data: numerology, astrology, AND logged behavioral data.
Cross-reference cosmic blueprints with observed patterns.
Identify where cosmic tendencies manifest in actual behavior.`;
      break;
  }
  
  return prompt;
};
```

---

## UI/UX Design

### Settings Page
```tsx
<SettingsSection title="AI Analysis Depth">
  <RadioGroup value={analysisDepth} onChange={setAnalysisDepth}>
    <RadioOption value="cosmic">
      <Icon>🌙</Icon>
      <Label>Cosmic Mode</Label>
      <Description>Insights from numerology & astrology only</Description>
    </RadioOption>
    
    <RadioOption value="behavioral">
      <Icon>📊</Icon>
      <Label>Behavioral Mode</Label>
      <Description>Insights from logged data only</Description>
    </RadioOption>
    
    <RadioOption value="full-spectrum" recommended>
      <Icon>✨</Icon>
      <Label>Full Spectrum Mode</Label>
      <Description>Complete insights from all sources (recommended)</Description>
    </RadioOption>
  </RadioGroup>
  
  <InfoBox>
    Your current mode: <strong>{analysisDepth}</strong>
    <br />
    This affects all Lumen conversations and AI reports.
  </InfoBox>
</SettingsSection>
```

### Lumen Chat Interface Indicator
```tsx
<LumenChatHeader>
  <LumenAvatar />
  <LumenInfo>
    <LumenName>Lumen</LumenName>
    <AnalysisDepthBadge mode={analysisDepth}>
      {analysisDepth === 'cosmic' && '🌙 Cosmic Mode'}
      {analysisDepth === 'behavioral' && '📊 Behavioral Mode'}
      {analysisDepth === 'full-spectrum' && '✨ Full Spectrum'}
    </AnalysisDepthBadge>
  </LumenInfo>
  <QuickSettings onClick={openDepthSettings} />
</LumenChatHeader>
```

### Quick Switcher in Chat
```tsx
<DepthSwitcher>
  <CurrentMode onClick={toggleDropdown}>
    {getDepthIcon(analysisDepth)} {getDepthLabel(analysisDepth)}
  </CurrentMode>
  
  <Dropdown>
    <DropdownItem onClick={() => switchDepth('cosmic')}>
      🌙 Cosmic Mode
    </DropdownItem>
    <DropdownItem onClick={() => switchDepth('behavioral')}>
      📊 Behavioral Mode
    </DropdownItem>
    <DropdownItem onClick={() => switchDepth('full-spectrum')}>
      ✨ Full Spectrum Mode
    </DropdownItem>
  </Dropdown>
</DepthSwitcher>
```

---

## AI Report Generation

Reports also respect analysis depth mode:

### Self Report
```typescript
async generateSelfReport(userId: string): Promise<AIReport> {
  const user = await this.userRepo.findById(userId);
  const depth = user.analysisDepthMode;
  
  const context = await this.contextBuilder.buildSelfContext(userId, depth);
  
  const prompt = depth === 'cosmic'
    ? 'Analyze this person based ONLY on their numerology and astrology...'
    : depth === 'behavioral'
    ? 'Analyze this person based ONLY on their logged traits and patterns...'
    : 'Analyze this person using ALL available data...';
  
  return this.generateReport(userId, prompt, context);
}
```

### Relationship Report
```typescript
async generateRelationshipReport(
  userId: string,
  memberId: string
): Promise<AIReport> {
  const user = await this.userRepo.findById(userId);
  const depth = user.analysisDepthMode;
  
  const context = await this.contextBuilder.buildRelationshipContext(
    userId,
    memberId,
    depth
  );
  
  // Report respects depth mode
  return this.generateReport(userId, context, depth);
}
```

---

## Migration & Onboarding

### Existing Users
- Default to 'full-spectrum' mode
- Show one-time tooltip explaining the new feature
- Allow easy switching in settings

### New Users
- Onboarding question: "How would you like Lumen to analyze your relationships?"
- Show all three options with clear descriptions
- Recommend 'full-spectrum' for most users
- Can change anytime in settings

### Data Availability Warnings
```typescript
// If user selects cosmic mode but hasn't entered DOB
if (depth === 'cosmic' && !user.dateOfBirth) {
  showWarning('Cosmic mode requires your date of birth. Please complete your profile.');
}

// If user selects behavioral mode but has no logged data
if (depth === 'behavioral' && !hasLoggedData(userId)) {
  showWarning('Behavioral mode works best with logged data. Start by adding traits or incidents.');
}
```

---

## Analytics & Insights

Track mode usage:
- Which mode is most popular?
- Do users switch modes frequently?
- Correlation between mode and user satisfaction
- Which mode leads to more engagement?

```typescript
// Track mode changes
await analytics.track('analysis_depth_changed', {
  userId,
  fromMode: previousMode,
  toMode: newMode,
  timestamp: new Date(),
});
```

---

## Testing

### Unit Tests
```typescript
describe('ContextBuilder', () => {
  it('includes only cosmic data in cosmic mode', async () => {
    const context = await builder.build(userId, 'cosmic');
    expect(context.user.numerology).toBeDefined();
    expect(context.user.astrology).toBeDefined();
    expect(context.user.traits).toBeUndefined();
  });

  it('includes only behavioral data in behavioral mode', async () => {
    const context = await builder.build(userId, 'behavioral');
    expect(context.user.traits).toBeDefined();
    expect(context.user.numerology).toBeUndefined();
    expect(context.user.astrology).toBeUndefined();
  });

  it('includes all data in full-spectrum mode', async () => {
    const context = await builder.build(userId, 'full-spectrum');
    expect(context.user.numerology).toBeDefined();
    expect(context.user.astrology).toBeDefined();
    expect(context.user.traits).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Lumen Query with Depth Modes', () => {
  it('respects cosmic mode in responses', async () => {
    const response = await lumen.query(userId, 'Why do I feel this way?', 'cosmic');
    expect(response).toContain('Life Path');
    expect(response).not.toContain('logged');
  });
});
```
