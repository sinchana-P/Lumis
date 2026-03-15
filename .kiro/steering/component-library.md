---
inclusion: fileMatch
fileMatchPattern: "**/*.{tsx,jsx}"
---

# Lumis Component Library Reference

## Shared Components (Always Reuse)

### DataTable
```tsx
<DataTable
  columns={columns}
  data={data}
  onRowClick={(row) => navigate(`/members/${row.id}`)}
  filters={['type', 'archived']}
  sorting={{ key: 'name', direction: 'asc' }}
  pagination={{ pageSize: 20 }}
  emptyState={<EmptyState message="No members yet" action="Add Member" />}
/>
```
Use for: Members list, Traits list, Incidents, Patterns, Interactions

### ProfileCard
```tsx
<ProfileCard
  type="self" | "member"
  data={profileData}
  editable={true}
  showNumerology={true}
  showAstrology={true}
  onEdit={handleEdit}
/>
```
Use for: User profile page, Member profile page

### TraitLogger
```tsx
<TraitLogger
  category="strength" | "shadow" | "trigger" | "need" | "pattern" | "pro" | "con"
  existingTraits={traits}
  onSave={handleSave}
  onDelete={handleDelete}
  showIntensity={category === 'pro' || category === 'con'}
  showEmotionTag={category === 'pro' || category === 'con'}
/>
```
Use for: Self traits section, Member pros/cons section

### TimelineLog
```tsx
<TimelineLog
  entries={entries}
  type="incident" | "interaction" | "journal"
  onAdd={handleAdd}
  onEdit={handleEdit}
  emotionTracking={type === 'interaction'}
  searchable={true}
/>
```
Use for: Incidents log, Interactions log, Journal entries

### AIReport
```tsx
<AIReport
  reportType="self" | "relationship"
  data={reportData}
  regeneratable={true}
  onRegenerate={handleRegenerate}
  loading={isLoading}
/>
```
Use for: AI Self Report, AI Relationship Report

### FormField
```tsx
<FormField
  label="Full Name"
  name="fullName"
  type="text" | "textarea" | "date" | "time" | "select" | "rating" | "emotion-picker"
  value={value}
  onChange={handleChange}
  error={errors.fullName}
  required={true}
  placeholder="Enter your full name"
/>
```
Use for: ALL form inputs across the app

### EmotionPicker
```tsx
<EmotionPicker
  selected={selectedEmotions}
  onChange={handleEmotionChange}
  multiple={true}
  categories={['positive', 'negative', 'neutral']}
/>
```
Use for: Interaction mood tracking, Trait emotion tags

### NumerologyCard
```tsx
<NumerologyCard
  numbers={numerologyData}
  type="core" | "timing"
  expandable={true}
/>
```
Use for: User numerology section, Member numerology section

### AstrologyChart
```tsx
<AstrologyChart
  natalData={natalData}
  transits={currentTransits}
  interactive={true}
  showInterpretations={true}
/>
```
Use for: User astrology section, Member astrology section

### RelationshipHealthScore
```tsx
<RelationshipHealthScore
  score={healthScore}
  trend="up" | "down" | "stable"
  factors={contributingFactors}
/>
```
Use for: Member profile header, Insights dashboard

### EnergyMap
```tsx
<EnergyMap
  members={members}
  energyScores={energyScores}
  onMemberClick={handleMemberClick}
/>
```
Use for: Insights dashboard

### PatternAlert
```tsx
<PatternAlert
  pattern={detectedPattern}
  severity="info" | "warning" | "critical"
  onDismiss={handleDismiss}
  onViewDetails={handleViewDetails}
/>
```
Use for: Dashboard alerts, Member profile alerts

### LumenChat
```tsx
<LumenChat
  mode="vent" | "guided" | "analysis" | "advice" | "timing"
  conversationId={conversationId}
  context={{ userId, memberId }}
  onModeChange={handleModeChange}
/>
```
Use for: Lumen AI agent interface

### Modal
```tsx
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Add Member"
  size="sm" | "md" | "lg" | "xl"
>
  {children}
</Modal>
```
Use for: All modal dialogs

### Button
```tsx
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  loading={isLoading}
  disabled={isDisabled}
  onClick={handleClick}
>
  Save Changes
</Button>
```
Use for: All buttons

## Layout Components

### AppLayout
```tsx
<AppLayout
  sidebar={<Sidebar />}
  header={<Header />}
>
  {children}
</AppLayout>
```

### PageHeader
```tsx
<PageHeader
  title="Members"
  subtitle="People in your life"
  actions={<Button>Add Member</Button>}
  breadcrumbs={breadcrumbs}
/>
```

## Composition Examples

### Member Profile Page
```tsx
<AppLayout>
  <PageHeader title={member.name} />
  <ProfileCard type="member" data={member} />
  <Tabs>
    <Tab label="Pros & Cons">
      <TraitLogger category="pro" />
      <TraitLogger category="con" />
    </Tab>
    <Tab label="Incidents">
      <TimelineLog type="incident" />
    </Tab>
    <Tab label="Patterns">
      <TimelineLog type="pattern" />
    </Tab>
    <Tab label="Interactions">
      <TimelineLog type="interaction" emotionTracking />
    </Tab>
    <Tab label="Journal">
      <TimelineLog type="journal" />
    </Tab>
    <Tab label="AI Report">
      <AIReport reportType="relationship" regeneratable />
    </Tab>
  </Tabs>
</AppLayout>
```

### Self Profile Page
```tsx
<AppLayout>
  <PageHeader title="Your Profile" />
  <ProfileCard type="self" editable />
  <NumerologyCard type="core" />
  <NumerologyCard type="timing" />
  <AstrologyChart />
  <TraitLogger category="strength" />
  <TraitLogger category="shadow" />
  <TraitLogger category="trigger" />
  <TraitLogger category="need" />
  <TraitLogger category="pattern" />
  <AIReport reportType="self" regeneratable />
</AppLayout>
```

## Component Props Patterns

### Common Props (all components should accept)
- `className?: string` - for additional Tailwind classes
- `testId?: string` - for testing
- `loading?: boolean` - loading state
- `error?: string` - error message

### Data Props Naming
- `data` - main data object
- `items` - array of items
- `value` - current value
- `defaultValue` - initial value

### Handler Props Naming
- `onChange` - value changed
- `onSave` - save action
- `onDelete` - delete action
- `onClick` - click action
- `onSubmit` - form submission

## Styling Conventions
- Use Tailwind utility classes
- Component-specific styles in same file
- Theme tokens: `bg-lumis-primary`, `text-lumis-accent`
- Responsive: mobile-first, use `sm:`, `md:`, `lg:` breakpoints
- Dark mode: use `dark:` prefix


### RelationTypeSelector
```tsx
<RelationTypeSelector
  value={relationType}
  customValue={relationTypeCustom}
  onChange={handleRelationTypeChange}
  onCustomChange={handleCustomChange}
  required={true}
/>
```
Use for: Member creation form, Member edit form

**Predefined Options:**
- Friend
- Family
- Colleague
- Partner
- Acquaintance
- Boss
- Mentor
- Therapist
- Coach
- Teacher
- Student
- Neighbor
- Ex-Partner
- Other (shows text input)

**Behavior:**
- When "Other" is selected, show text input field
- Custom text is required when "Other" is selected
- Max 100 characters for custom relation type
- Display custom relation type prominently on member profile


### AnalysisDepthSelector
```tsx
<AnalysisDepthSelector
  value={analysisDepth}
  onChange={handleDepthChange}
  showDescription={true}
/>
```
Use for: User settings page, Lumen chat header

**Options:**
- Cosmic Mode (🌙) - Numerology + Astrology only
- Behavioral Mode (📊) - Logged data only
- Full Spectrum Mode (✨) - Everything (default)

**Behavior:**
- Radio button group or dropdown
- Shows icon + label + description
- Persists to user preferences
- Updates all Lumen interactions immediately
- Shows warning if selected mode has insufficient data

### AnalysisDepthBadge
```tsx
<AnalysisDepthBadge mode={analysisDepth} />
```
Use for: Lumen chat header, AI report headers

**Display:**
- 🌙 Cosmic Mode
- 📊 Behavioral Mode
- ✨ Full Spectrum

**Styling:**
- Small badge/pill
- Color-coded by mode
- Clickable to open depth selector


---

## Danger Action Pattern — Confirmation Modal

**Rule: Any destructive / irreversible action (delete, remove, archive, revoke) MUST show a confirmation modal before executing. Never fire the action directly on click.**

### Pattern

```tsx
const [deletingItem, setDeletingItem] = useState<Item | null>(null);
const [deleteItem, { isLoading: deleting }] = useDeleteItemMutation();

// Trigger — just opens modal, NO side effects
<button onClick={() => setDeletingItem(item)}>Remove</button>

// Modal — shown when deletingItem !== null
{deletingItem && (
  <ConfirmDeleteModal
    label={deletingItem.name}
    onConfirm={async () => { await deleteItem(deletingItem.id); setDeletingItem(null); }}
    onCancel={() => setDeletingItem(null)}
    deleting={deleting}
  />
)}
```

### Modal structure

- **Backdrop**: `rgba(0,0,0,0.25)` + `backdropFilter: blur(4px)` — same as all modals
- **Width**: `maxWidth: 360` (narrower than form modals at 420)
- **Content**: mono label `REMOVE <ENTITY>` → serif quote of the item being deleted → italic serif warning line
- **Actions**: Cancel LEFT (muted border), Confirm RIGHT (`#C47A7A` red background)
- **Confirm button**: disabled + `opacity: 0.6` while `deleting` is true, text changes to `Removing…`
- **Escape key**: always closes without action

### What counts as a danger action

- Deleting any record (trait, member, incident, log, pattern)
- Archiving a member
- Revoking a share link
- Clearing a conversation
- Disconnecting an integration

### What does NOT need a confirmation modal

- Closing/cancelling a form modal
- Toggling visibility (archive toggle that's easily reversible)
- Navigating away from a page
