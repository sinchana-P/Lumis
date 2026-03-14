# Implementation Plan: Lumis Core Features

## Overview

This implementation plan covers the complete Lumis MVP platform - a relationship intelligence application combining numerology, Vedic astrology, and behavioral psychology. The implementation is structured in 7 phases for incremental delivery and validation.

**Technology Stack:**
- Frontend: Next.js 14 (App Router), React 18, TypeScript, Redux Toolkit, RTK Query, Tailwind CSS
- Backend: NestJS, PostgreSQL (Supabase), Supabase Auth
- AI: Gemini 1.5 Flash, Groq + Llama 3.1 70B, Cohere embeddings
- External: Swiss Ephemeris for Vedic astrology calculations

**Implementation Approach:**
- Each phase builds on previous phases
- Testing tasks are optional (marked with *)
- Checkpoints ensure incremental validation
- All tasks reference specific requirements for traceability

## Tasks

## Phase 1: Core Infrastructure

- [ ] 1. Set up project structure and configuration
  - [x] 1.1 Initialize Next.js 14 project with TypeScript and App Router
    - Create Next.js project with `create-next-app`
    - Configure TypeScript with strict mode
    - Set up App Router directory structure
    - _Requirements: 37.1, 45.1_
  
  - [x] 1.2 Initialize NestJS backend project with TypeScript
    - Create NestJS project with CLI
    - Configure TypeScript and module structure
    - Set up environment variable management
    - _Requirements: 37.1, 45.1_
  
  - [x] 1.3 Configure Supabase connection and authentication
    - Set up Supabase project and obtain credentials
    - Install Supabase client libraries
    - Configure authentication helpers for Next.js
    - _Requirements: 45.1, 45.2_

  - [x] 1.4 Set up Redux Toolkit store with RTK Query
    - Install Redux Toolkit and React-Redux
    - Create store configuration with slices
    - Configure RTK Query base API with Supabase auth headers
    - _Requirements: 37.1, 37.2, 37.3, 37.4, 38.1_
  
  - [x] 1.5 Configure Tailwind CSS with Lumis design system
    - Install and configure Tailwind CSS
    - Define custom colors (cream, sage) and fonts (Crimson Pro)
    - Set up custom spacing, shadows, and transitions
    - Configure dark mode support
    - _Requirements: 42.1, 42.2, 42.3, 42.4, 42.5, 42.6, 42.7, 34.1_
  
  - [ ]* 1.6 Write unit tests for store configuration
    - Test Redux store initialization
    - Test RTK Query middleware integration
    - _Requirements: 37.1_

- [ ] 2. Create database schema and Row-Level Security policies
  - [ ] 2.1 Create user profiles and authentication tables
    - Create `user_profiles` table with bio data fields
    - Create `user_numerology` table for calculated values
    - Create `user_vedic_chart` table for astrology data
    - _Requirements: 1.1, 1.8, 36.1_
  
  - [ ] 2.2 Create member profiles and calculation tables
    - Create `members` table with relationship data
    - Create `member_numerology` table
    - Create `member_vedic_chart` table
    - Add archived flag for soft deletes
    - _Requirements: 3.1, 3.2, 3.7, 3.9, 40.1_
  
  - [ ] 2.3 Create logging tables for behavioral tracking
    - Create `trait_logs` table with intensity and emotions
    - Create `incident_logs` table with emotional impact
    - Create `pattern_logs` table
    - Create `interaction_logs` table with mood tracking
    - Create `journal_entries` table
    - Add archived flags to all log tables
    - _Requirements: 6.1, 7.1, 8.1, 9.1, 10.1, 40.2_

  - [ ] 2.4 Create AI and conversation tables
    - Create `ai_reports` table with JSONB content
    - Create `lumen_conversations` table with mode and settings
    - Create `lumen_messages` table with role and metadata
    - Set up pgvector extension for embeddings
    - _Requirements: 2.5, 15.1, 15.5_
  
  - [ ] 2.5 Create notifications and sharing tables
    - Create `notifications` table with type and read status
    - Create `share_links` table with tokens and expiration
    - Create `daily_mood_logs` table
    - Create `pattern_alerts` table
    - _Requirements: 25.1, 29.1, 29.2, 33.1_
  
  - [ ] 2.6 Implement Row-Level Security policies for all tables
    - Create RLS policy for user_profiles (users see only their own)
    - Create RLS policies for members (users see only their own)
    - Create RLS policies for all log tables (via member ownership)
    - Create RLS policies for conversations and messages
    - Create public access policy for valid share links
    - _Requirements: 1.8, 3.9, 10.5, 15.5, 36.1, 36.2_
  
  - [ ]* 2.7 Write property test for Row-Level Security isolation
    - **Property 13: Row-Level Security Isolation**
    - **Validates: Requirements 1.8, 3.9, 36.1, 36.2**
    - Test that users cannot access other users' data
    - _Requirements: 36.1, 36.2_

- [ ] 3. Build shared UI component library
  - [x] 3.1 Create base components (Button, Card, Input, FormField)
    - Implement Button with variants (primary, secondary, ghost)
    - Implement Card with Lumis styling
    - Implement Input with label and error states
    - Implement FormField wrapper component
    - _Requirements: 41.6, 42.1, 42.2, 42.5, 42.6_
  
  - [x] 3.2 Create layout components (AppLayout, Sidebar, Header, MobileNav)
    - Implement AppLayout with sidebar and main content area
    - Implement Sidebar with navigation links
    - Implement Header with user menu and theme toggle
    - Implement MobileNav for responsive navigation
    - _Requirements: 47.1, 47.2, 47.5_

  - [x] 3.3 Create specialized components (EmotionPicker, TimelineLog, Modal)
    - Implement EmotionPicker with common emotion tags
    - Implement TimelineLog for chronological entries
    - Implement Modal with overlay and close handling
    - _Requirements: 41.7_
  
  - [ ] 3.4 Implement dark mode theme toggle
    - Create ThemeToggle component
    - Implement dark mode CSS classes
    - Add theme persistence to localStorage
    - _Requirements: 34.1, 34.2, 34.3, 34.4_
  
  - [ ]* 3.5 Write unit tests for UI components
    - Test Button variants and interactions
    - Test Input validation display
    - Test Modal open/close behavior
    - Test theme toggle functionality
    - _Requirements: 41.1-41.10_

- [ ] 4. Implement authentication flow
  - [ ] 4.1 Create authentication API endpoints in NestJS
    - Implement AuthGuard for protected routes
    - Create token extraction and validation logic
    - Set up global exception filter for errors
    - _Requirements: 45.2, 45.3_
  
  - [ ] 4.2 Create authentication pages in Next.js
    - Create /login page with email/password form
    - Create /signup page with registration form
    - Implement form validation
    - _Requirements: 45.1_
  
  - [ ] 4.3 Implement authentication Redux slice and actions
    - Create auth slice with user and session state
    - Implement setUser, setSession, clearAuth actions
    - Add auth state to Redux store
    - _Requirements: 37.2, 45.4_
  
  - [ ] 4.4 Create protected route middleware for Next.js
    - Implement middleware to check authentication
    - Redirect unauthenticated users to login
    - Preserve redirect URL for post-login navigation
    - _Requirements: 45.2, 45.3_

  - [ ]* 4.5 Write property test for authentication requirement
    - **Property 16: Authentication Required for Protected Routes**
    - **Validates: Requirements 45.2, 45.3**
    - Test that protected routes redirect without valid token
    - _Requirements: 45.2, 45.3_

- [ ] 5. Checkpoint - Core infrastructure complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Profile & Member Management

- [ ] 6. Implement numerology calculation engine
  - [ ] 6.1 Create NumerologyService with core calculation functions
    - Implement reduceToSingleDigit with master number preservation
    - Implement calculateLifePath from birth date
    - Implement calculateExpression from full name
    - Implement calculateSoulUrge from vowels
    - Implement calculatePersonality from consonants
    - Implement calculateBirthday from day
    - Implement calculateMaturity from Life Path + Expression
    - _Requirements: 1.2, 4.1, 43.1, 43.2, 43.3, 43.4, 43.5, 43.6, 43.7_
  
  - [ ] 6.2 Implement personal timing calculations
    - Implement calculatePersonalYear from birth date and current year
    - Implement calculatePersonalMonth from Personal Year and month
    - Implement calculatePersonalDay from Personal Month and day
    - _Requirements: 1.3, 4.2_
  
  - [ ] 6.3 Create API endpoints for numerology calculations
    - Create GET /api/profile/numerology endpoint
    - Create GET /api/members/:id/numerology endpoint
    - Implement caching of calculated values
    - _Requirements: 1.2, 1.3, 4.1, 4.2_
  
  - [ ]* 6.4 Write property test for complete numerology calculation
    - **Property 5: Complete Numerology Calculation**
    - **Validates: Requirements 1.2, 1.3, 4.1, 4.2**
    - Test that all 9 numbers are calculated for valid inputs
    - _Requirements: 1.2, 1.3, 4.1, 4.2_
  
  - [ ]* 6.5 Write property test for master number preservation
    - **Property 6: Master Number Preservation**
    - **Validates: Requirements 43.7**
    - Test that 11, 22, 33 are not reduced further
    - _Requirements: 43.7_

  - [ ]* 6.6 Write property test for Life Path calculation correctness
    - **Property 7: Life Path Calculation Correctness**
    - **Validates: Requirements 43.1**
    - Test Life Path equals reduced sum of date components
    - _Requirements: 43.1_
  
  - [ ]* 6.7 Write property test for personal timing consistency
    - **Property 8: Personal Timing Consistency**
    - **Validates: Requirements 1.3, 4.2**
    - Test Personal Year constant within calendar year
    - _Requirements: 1.3, 4.2_

- [ ] 7. Implement Vedic astrology calculation engine
  - [ ] 7.1 Set up Swiss Ephemeris library integration
    - Install swiss-ephemeris npm package
    - Configure ephemeris data file path
    - Set up Lahiri ayanamsa for sidereal calculations
    - _Requirements: 44.1, 44.2_
  
  - [ ] 7.2 Create VedicAstrologyService with planetary calculations
    - Implement calculateJulianDay from date and time
    - Implement getPlanetPosition for Sun, Moon, Venus, Mars, Mercury
    - Implement calculateHouses with Placidus system
    - Implement getZodiacSign from longitude
    - _Requirements: 1.4, 5.1, 44.1, 44.3, 44.4_
  
  - [ ] 7.3 Implement dominant element and transit calculations
    - Implement calculateDominantElement from planetary signs
    - Implement calculateTransits for Jupiter, Saturn, Mars
    - Implement getTransitSignificance for house meanings
    - _Requirements: 1.5, 1.6, 5.2, 5.3, 44.6_
  
  - [ ] 7.4 Create API endpoints for Vedic astrology calculations
    - Create GET /api/profile/vedic endpoint
    - Create GET /api/members/:id/vedic endpoint
    - Implement caching of calculated charts
    - _Requirements: 1.4, 1.5, 1.6, 5.1, 5.2, 5.3_
  
  - [ ]* 7.5 Write property test for complete Vedic chart calculation
    - **Property 9: Complete Vedic Chart Calculation**
    - **Validates: Requirements 1.4, 1.5, 1.6, 5.1, 5.2, 5.3**
    - Test all planetary signs, element, and transits calculated
    - _Requirements: 1.4, 1.5, 1.6, 5.1, 5.2, 5.3_

  - [x] 7.6 Write property test for dominant element validity
    - **Property 10: Dominant Element Validity**
    - **Validates: Requirements 1.5, 5.2**
    - Test element is exactly one of Fire, Earth, Air, Water
    - _Requirements: 1.5, 5.2_
  
  - [ ]* 7.7 Write property test for transit structure completeness
    - **Property 11: Transit Structure Completeness**
    - **Validates: Requirements 1.6, 5.3**
    - Test each transit has all required fields
    - _Requirements: 1.6, 5.3_

- [ ] 8. Build user self profile management
  - [ ] 8.1 Create ProfileCard component for displaying profile data
    - Implement photo display with fallback avatar
    - Display name and birth data
    - Add edit and action buttons
    - _Requirements: 1.1_
  
  - [ ] 8.2 Create NumerologyCard component for displaying calculations
    - Display all 6 core numbers with labels
    - Display Personal Year, Month, Day
    - Highlight master numbers (11, 22, 33)
    - Add expandable explanations
    - _Requirements: 1.2, 1.3, 41.8_
  
  - [ ] 8.3 Create VedicAstrologyChart component for chart display
    - Display Sun, Moon, Rising, Venus, Mars, Mercury signs
    - Display dominant element
    - Show current transits with significance
    - _Requirements: 1.4, 1.5, 1.6, 41.9_
  
  - [ ] 8.4 Create profile API endpoints and RTK Query hooks
    - Create GET /api/profile endpoint
    - Create PUT /api/profile endpoint
    - Create POST /api/profile/photo endpoint for uploads
    - Create RTK Query hooks for profile operations
    - _Requirements: 1.1, 1.8, 46.1, 46.3_
  
  - [ ] 8.5 Create /profile page with profile editing
    - Implement profile form with name, photo, birth data
    - Add self traits recording (strengths, shadows, triggers, needs, patterns)
    - Display calculated numerology and Vedic chart
    - Implement form validation
    - _Requirements: 1.1, 1.7_

  - [ ]* 8.6 Write property test for profile data round-trip
    - **Property 1: Profile Data Round-Trip**
    - **Validates: Requirements 1.1, 3.1, 3.5, 3.6**
    - Test storing and retrieving profile returns equivalent data
    - _Requirements: 1.1_
  
  - [ ]* 8.7 Write unit tests for profile components
    - Test ProfileCard rendering with complete data
    - Test NumerologyCard master number highlighting
    - Test VedicAstrologyChart transit display
    - _Requirements: 1.1, 1.2, 1.4_

- [ ] 9. Build member profile management
  - [ ] 9.1 Create member API endpoints and RTK Query hooks
    - Create GET /api/members endpoint with filtering
    - Create POST /api/members endpoint
    - Create GET /api/members/:id endpoint
    - Create PUT /api/members/:id endpoint
    - Create DELETE /api/members/:id endpoint (soft delete)
    - Create POST /api/members/:id/restore endpoint
    - Create RTK Query hooks for all member operations
    - _Requirements: 3.1, 3.7, 3.9, 40.1, 40.5_
  
  - [ ] 9.2 Create /members page with member list
    - Display all active members in grid/list view
    - Add filter by relation type
    - Add filter by tags
    - Add search by name
    - Add "Add Member" button
    - Show archived members toggle
    - _Requirements: 3.1, 3.9, 48.1_
  
  - [ ] 9.3 Create member creation form with validation
    - Implement name, photo, relation type fields
    - Add relation type dropdown with all 14 types
    - Add custom relation type field (conditional on "Other")
    - Add tags input with autocomplete
    - Add birth data fields (date, time, place)
    - Add relationship start date field
    - Implement validation for required fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 9.4 Create /members/[id] page for member detail view
    - Display member profile with ProfileCard
    - Display calculated numerology with NumerologyCard
    - Display Vedic chart with VedicAstrologyChart
    - Add tabs for logs, journal, and insights
    - Add archive/restore button
    - _Requirements: 3.1, 4.1, 4.2, 5.1, 5.2, 5.3_

  - [ ]* 9.5 Write property test for relation type validation
    - **Property 20: Relation Type Validation**
    - **Validates: Requirements 3.2**
    - Test only valid relation types are accepted
    - _Requirements: 3.2_
  
  - [ ]* 9.6 Write property test for custom relation type conditional
    - **Property 21: Custom Relation Type Conditional**
    - **Validates: Requirements 3.3**
    - Test custom type allowed only for "Other"
    - _Requirements: 3.3_
  
  - [ ]* 9.7 Write property test for soft delete preservation
    - **Property 17: Soft Delete Preservation**
    - **Validates: Requirements 3.7, 40.1, 40.2, 40.3**
    - Test deletion sets archived flag without removing data
    - _Requirements: 3.7, 40.1_
  
  - [ ]* 9.8 Write property test for archived entity exclusion
    - **Property 18: Archived Entity Exclusion**
    - **Validates: Requirements 3.8, 40.4**
    - Test archived entities excluded from default queries
    - _Requirements: 3.8, 40.4_

- [ ] 10. Implement file upload for photos
  - [ ] 10.1 Create file upload API endpoint with validation
    - Create POST /api/upload endpoint
    - Implement file type validation (images only)
    - Implement file size validation (5MB limit)
    - Upload to Supabase Storage with unique filenames
    - Return signed URL for uploaded file
    - _Requirements: 46.1, 46.2, 46.3, 46.4_
  
  - [ ] 10.2 Create ImageUpload component with preview
    - Implement file input with drag-and-drop
    - Show image preview before upload
    - Display upload progress
    - Handle upload errors
    - _Requirements: 46.1, 46.2, 46.5_
  
  - [ ]* 10.3 Write unit tests for file upload validation
    - Test file type rejection for non-images
    - Test file size rejection over 5MB
    - Test successful upload flow
    - _Requirements: 46.4_

- [ ] 11. Checkpoint - Profile and member management complete
  - Ensure all tests pass, ask the user if questions arise.


## Phase 3: Logging & Tracking

- [ ] 12. Implement trait logging system
  - [ ] 12.1 Create TraitLogger component with form
    - Implement pro/con toggle
    - Add description text area
    - Add intensity slider (mild/moderate/strong)
    - Integrate EmotionPicker for emotion tags
    - Add character count display
    - _Requirements: 6.1, 6.2, 6.3, 41.3_
  
  - [ ] 12.2 Create trait log API endpoints
    - Create GET /api/members/:id/traits endpoint
    - Create POST /api/members/:id/traits endpoint
    - Create PUT /api/traits/:id endpoint
    - Create DELETE /api/traits/:id endpoint (soft delete)
    - _Requirements: 6.1, 6.4, 6.5_
  
  - [ ] 12.3 Display trait logs in member profile
    - Show traits grouped by pro/con
    - Display intensity with visual indicators
    - Show emotion tags as badges
    - Add edit and delete actions
    - _Requirements: 6.5_
  
  - [ ]* 12.4 Write property test for trait log round-trip
    - **Property 2: Trait Log Round-Trip**
    - **Validates: Requirements 6.1, 6.3, 6.4**
    - Test creating and retrieving trait returns equivalent data
    - _Requirements: 6.1, 6.3, 6.4_
  
  - [ ]* 12.5 Write property test for intensity rating validation
    - **Property 22: Intensity Rating Validation**
    - **Validates: Requirements 6.2**
    - Test only mild/moderate/strong accepted
    - _Requirements: 6.2_

- [ ] 13. Implement incident logging system
  - [ ] 13.1 Create IncidentLogger component with form
    - Add date picker for incident date
    - Add description text area
    - Add emotional impact slider (-5 to +5)
    - _Requirements: 7.1, 7.2_
  
  - [ ] 13.2 Create incident log API endpoints
    - Create GET /api/members/:id/incidents endpoint
    - Create POST /api/members/:id/incidents endpoint
    - Create PUT /api/incidents/:id endpoint
    - Create DELETE /api/incidents/:id endpoint (soft delete)
    - _Requirements: 7.1, 7.4_

  - [ ] 13.3 Display incident logs in chronological timeline
    - Use TimelineLog component for display
    - Sort by incident date (newest first)
    - Show emotional impact with color coding
    - Add edit and delete actions
    - _Requirements: 7.3, 7.4_
  
  - [ ]* 13.4 Write unit tests for incident logging
    - Test date picker validation
    - Test emotional impact slider range
    - Test chronological sorting
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14. Implement pattern logging system
  - [ ] 14.1 Create PatternLogger component with form
    - Add description text area for pattern
    - Add timestamp display
    - _Requirements: 8.1, 8.2_
  
  - [ ] 14.2 Create pattern log API endpoints
    - Create GET /api/members/:id/patterns endpoint
    - Create POST /api/members/:id/patterns endpoint
    - Create PUT /api/patterns/:id endpoint
    - Create DELETE /api/patterns/:id endpoint (soft delete)
    - _Requirements: 8.1, 8.3, 8.4_
  
  - [ ] 14.3 Display pattern logs in member profile
    - Show patterns as cards with timestamps
    - Add edit and delete actions
    - _Requirements: 8.3, 8.4_

- [ ] 15. Implement interaction logging system
  - [ ] 15.1 Create InteractionLogger component with form
    - Add date picker for interaction date
    - Add context text area
    - Add mood before slider (-5 to +5)
    - Add mood after slider (-5 to +5)
    - Show mood delta calculation
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 15.2 Create interaction log API endpoints
    - Create GET /api/members/:id/interactions endpoint
    - Create POST /api/members/:id/interactions endpoint
    - Create PUT /api/interactions/:id endpoint
    - Create DELETE /api/interactions/:id endpoint (soft delete)
    - Create GET /api/members/:id/interaction-streak endpoint
    - _Requirements: 9.1, 9.4, 9.5_

  - [ ] 15.3 Display interaction logs in chronological timeline
    - Use TimelineLog component for display
    - Show mood before/after with visual indicators
    - Display interaction streak badge
    - Add edit and delete actions
    - _Requirements: 9.4, 9.5_
  
  - [ ]* 15.4 Write property test for interaction log round-trip
    - **Property 3: Interaction Log Round-Trip**
    - **Validates: Requirements 9.1, 9.2, 9.3**
    - Test creating and retrieving interaction returns equivalent data
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 15.5 Write property test for interaction streak calculation
    - **Property 35: Interaction Streak Calculation**
    - **Validates: Requirements 9.4**
    - Test streak equals consecutive days with interactions
    - _Requirements: 9.4_
  
  - [ ]* 15.6 Write property test for chronological ordering
    - **Property 23: Chronological Ordering**
    - **Validates: Requirements 7.3, 9.5**
    - Test logs ordered by date consistently
    - _Requirements: 7.3, 9.5_

- [ ] 16. Implement member journal system
  - [ ] 16.1 Create MemberJournal component with editor
    - Implement rich text editor for journal entries
    - Add auto-save functionality
    - Show timestamp for each entry
    - Implement distraction-free journal mode
    - _Requirements: 10.1, 10.2, 10.4, 35.1, 35.2, 35.4_
  
  - [ ] 16.2 Create journal API endpoints with search
    - Create GET /api/members/:id/journal endpoint
    - Create POST /api/members/:id/journal endpoint
    - Create PUT /api/journal/:id endpoint
    - Create DELETE /api/journal/:id endpoint (soft delete)
    - Create GET /api/journal/search endpoint with full-text search
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 16.3 Implement journal mode UI state
    - Add journal mode toggle to UI slice
    - Hide navigation and sidebars in journal mode
    - Add exit journal mode button
    - _Requirements: 35.1, 35.2, 35.3_

  - [ ]* 16.4 Write property test for journal entry round-trip
    - **Property 4: Journal Entry Round-Trip**
    - **Validates: Requirements 10.2**
    - Test creating and retrieving entry returns same content
    - _Requirements: 10.2_
  
  - [ ]* 16.5 Write property test for journal search results
    - **Property 36: Journal Search Results**
    - **Validates: Requirements 10.3**
    - Test all results contain search term (case-insensitive)
    - _Requirements: 10.3_

- [ ] 17. Checkpoint - Logging and tracking complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: AI Integration

- [ ] 18. Set up AI service infrastructure
  - [ ] 18.1 Configure Gemini 1.5 Flash client
    - Install Google Generative AI SDK
    - Configure API key and client initialization
    - Implement generateContent wrapper method
    - _Requirements: 11.7, 12.1-12.5_
  
  - [ ] 18.2 Configure Groq + Llama 3.1 70B client
    - Install Groq SDK
    - Configure API key and client initialization
    - Implement chat completions wrapper method
    - _Requirements: 11.7, 12.1-12.5_
  
  - [ ] 18.3 Configure Cohere embeddings client
    - Install Cohere SDK
    - Configure API key and client initialization
    - Implement embed wrapper method
    - _Requirements: 15.1, 15.3_
  
  - [ ] 18.4 Set up pgvector for conversation embeddings
    - Enable pgvector extension in Supabase
    - Create embeddings table with vector column
    - Create vector similarity search function
    - _Requirements: 15.3_

- [ ] 19. Build context builder service
  - [ ] 19.1 Create ContextBuilderService for AI queries
    - Implement buildContext method with depth parameter
    - Implement cosmic depth (numerology + Vedic only)
    - Implement behavioral depth (logs only)
    - Implement full spectrum depth (all data)
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 19.2 Implement query-specific context building
    - Add mood query context (recent interactions, emotional state)
    - Add person query context (specific member data)
    - Add pattern query context (pattern logs across members)
    - Add comparison query context (multiple member data)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 19.3 Implement context formatting for AI prompts
    - Format numerology data for prompt
    - Format Vedic chart data for prompt
    - Format interaction logs for prompt
    - Format trait and pattern logs for prompt
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 19.4 Write property test for analysis depth data filtering
    - **Property 27: Analysis Depth Data Filtering**
    - **Validates: Requirements 14.1, 14.2, 14.3**
    - Test cosmic includes only numerology/Vedic, behavioral only logs
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 20. Implement Lumen AI service
  - [ ] 20.1 Create LumenAIService with query processing
    - Implement processQuery method with mode and depth
    - Implement shouldUseGroq logic (speed vs quality)
    - Implement model routing (Gemini vs Groq)
    - _Requirements: 12.1-12.5, 13.1-13.5_
  
  - [ ] 20.2 Build system prompts for each interaction mode
    - Create vent mode prompt (no advice, validation only)
    - Create guided mode prompt (Socratic questioning)
    - Create analysis mode prompt (objective patterns)
    - Create advice mode prompt (actionable recommendations)
    - Create timing mode prompt (numerology/astrology focus)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 20.3 Implement psychology framework integration
    - Add attachment theory references to prompts
    - Add cognitive distortion identification
    - Add emotional regulation guidance
    - Add Big Five personality trait references
    - Add Jungian shadow work concepts
    - Add trauma-informed language guidelines
    - Add Nonviolent Communication principles
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [ ] 20.4 Implement conversation management
    - Store conversation with mode, query type, analysis depth
    - Store messages with role (user/assistant) and metadata
    - Retrieve conversation history for context
    - Generate and store embeddings for semantic search
    - _Requirements: 15.1, 15.2, 15.4_
  
  - [ ]* 20.5 Write property test for conversation context preservation
    - **Property 26: Conversation Context Preservation**
    - **Validates: Requirements 15.1, 15.4**
    - Test all messages stored and retrieved in order
    - _Requirements: 15.1, 15.4_

- [ ] 21. Implement rate limiting for AI requests
  - [ ] 21.1 Create RateLimitService with per-user tracking
    - Implement checkLimit method with 10 requests per minute
    - Track request counts per user with 60-second windows
    - Implement automatic cleanup of expired limits
    - _Requirements: 19.1, 19.3, 19.4_
  
  - [ ] 21.2 Apply rate limiting to AI endpoints
    - Add rate limit check before processing queries
    - Return error with retry-after on limit exceeded
    - _Requirements: 19.1, 19.2_
  
  - [ ]* 21.3 Write property test for rate limit enforcement
    - **Property 28: Rate Limit Enforcement**
    - **Validates: Requirements 19.1**
    - Test 11th request within 60 seconds rejected
    - _Requirements: 19.1_
  
  - [ ]* 21.4 Write property test for rate limit error response
    - **Property 29: Rate Limit Error Response**
    - **Validates: Requirements 19.2**
    - Test error includes code and retry-after value
    - _Requirements: 19.2_
  
  - [ ]* 21.5 Write property test for per-user rate limit isolation
    - **Property 30: Per-User Rate Limit Isolation**
    - **Validates: Requirements 19.3**
    - Test different users have independent limits
    - _Requirements: 19.3_

- [ ] 22. Build Lumen AI chat interface
  - [ ] 22.1 Create LumenChat component with message display
    - Display conversation messages with role indicators
    - Show timestamps for each message
    - Implement typing indicator during AI response
    - Render markdown in AI responses
    - _Requirements: 12.1-12.5, 41.10_

  - [ ] 22.2 Create mode and query type selectors
    - Add mode selector (vent/guided/analysis/advice/timing)
    - Add query type selector (mood/person/pattern/comparison)
    - Add analysis depth selector (cosmic/behavioral/full spectrum)
    - Allow mode switching during conversation
    - _Requirements: 12.5, 13.6, 14.5_
  
  - [ ] 22.3 Implement voice input for queries
    - Add voice recording button with visual feedback
    - Integrate Web Speech API for transcription
    - Send transcribed text to AI service
    - Handle transcription errors
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [ ] 22.4 Create Lumen API endpoints
    - Create POST /api/lumen/query endpoint
    - Create GET /api/lumen/conversations endpoint
    - Create GET /api/lumen/conversations/:id endpoint
    - Create POST /api/lumen/conversations/:id/messages endpoint
    - Create GET /api/lumen/conversations/search endpoint
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [ ] 22.5 Create /lumen page with chat interface
    - Display LumenChat component
    - Add conversation history sidebar
    - Add new conversation button
    - Show context indicators (which member/data being analyzed)
    - _Requirements: 12.1-12.5, 13.1-13.6_
  
  - [ ]* 22.6 Write property test for conversation search results
    - **Property 37: Conversation Search Results**
    - **Validates: Requirements 15.3**
    - Test all results contain search term in messages
    - _Requirements: 15.3_

- [ ] 23. Implement AI report generation
  - [ ] 23.1 Create AIReportService for report generation
    - Implement generateSelfReport method
    - Implement generateRelationshipReport method
    - Parse AI responses into structured report content
    - Store reports in database
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 11.1-11.7_
  
  - [ ] 23.2 Create self report generation logic
    - Infer attachment style from interaction patterns
    - Generate emotional trigger map
    - Identify relationship patterns across members
    - Integrate numerology and Vedic insights
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 23.3 Create relationship report generation logic
    - Calculate compatibility score from numerology and Vedic data
    - Identify dynamic type (growth partnership, challenging mirror, etc.)
    - Identify tension points from logs and cosmic data
    - Identify growth points and opportunities
    - Generate 3-month forecast based on transits and cycles
    - Provide timing guidance for important interactions
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [ ] 23.4 Create AIReport component for displaying reports
    - Display report sections with formatting
    - Show compatibility scores with visual indicators
    - Display timing guidance prominently
    - Add export and share options
    - _Requirements: 2.1-2.5, 11.1-11.7, 41.5_
  
  - [ ] 23.5 Create report API endpoints
    - Create POST /api/reports/self endpoint
    - Create POST /api/reports/relationship/:memberId endpoint
    - Create GET /api/reports endpoint
    - Create GET /api/reports/:id endpoint
    - _Requirements: 2.5, 11.1-11.7_
  
  - [ ]* 23.6 Write property test for AI report data integration
    - **Property 24: AI Report Data Integration**
    - **Validates: Requirements 2.4, 11.7**
    - Test report incorporates numerology, Vedic, and behavioral data
    - _Requirements: 2.4, 11.7_
  
  - [ ]* 23.7 Write property test for AI report persistence
    - **Property 25: AI Report Persistence**
    - **Validates: Requirements 2.5**
    - Test storing and retrieving report returns same content
    - _Requirements: 2.5_

- [ ] 24. Implement weekly digest generation
  - [ ] 24.1 Create weekly digest generation service
    - Implement generateWeeklyDigest method
    - Calculate relationship health trends for past week
    - Detect patterns from past week's logs
    - Generate timing guidance for coming week
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [ ] 24.2 Schedule weekly digest generation
    - Create cron job to run every 7 days
    - Generate digest for all active users
    - Create notification when digest is ready
    - _Requirements: 17.1, 17.5_

  - [ ] 24.3 Create GET /api/lumen/weekly-digest endpoint
    - Return latest weekly digest for user
    - _Requirements: 17.1-17.5_
  
  - [ ]* 24.4 Write property test for weekly digest generation
    - **Property 44: Weekly Digest Generation**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
    - Test digest generated every 7 days with required sections
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 25. Checkpoint - AI integration complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Insights & Analytics

- [ ] 26. Implement relationship health scores
  - [ ] 26.1 Create health score calculation service
    - Calculate score from interaction frequency
    - Factor in emotional balance (mood deltas)
    - Factor in trait balance (pro/con ratio)
    - Normalize score to 0-100 range
    - _Requirements: 20.1, 20.2, 20.3, 20.4_
  
  - [ ] 26.2 Create RelationshipHealthScore component
    - Display score with color coding (red/yellow/green)
    - Show score breakdown (frequency, emotional, traits)
    - Add trend indicator (improving/declining)
    - _Requirements: 20.5_
  
  - [ ] 26.3 Create GET /api/insights/health-scores endpoint
    - Calculate scores for all active members
    - Return scores sorted by value
    - _Requirements: 20.1-20.5_
  
  - [ ]* 26.4 Write property test for health score calculation
    - **Property 32: Relationship Health Score Calculation**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4**
    - Test score considers frequency, emotional balance, trait balance
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [ ] 27. Implement energy map visualization
  - [ ] 27.1 Create energy map calculation service
    - Calculate average mood delta per member from interactions
    - Categorize as energizing (positive), neutral, or draining (negative)
    - Calculate energy score (-100 to +100)
    - _Requirements: 21.1, 21.2_

  - [ ] 27.2 Create EnergyMap component with scatter plot
    - Use Recharts for scatter plot visualization
    - Color code members (green/gray/red)
    - Display member avatars as data points
    - Add hover tooltips with details
    - Add click to navigate to member profile
    - _Requirements: 21.2, 21.3_
  
  - [ ] 27.3 Create GET /api/insights/energy-map endpoint
    - Calculate energy scores for all members
    - Return member data with energy scores and interaction counts
    - _Requirements: 21.1, 21.2_
  
  - [ ]* 27.4 Write property test for energy map categorization
    - **Property 33: Energy Map Categorization**
    - **Validates: Requirements 21.1, 21.2**
    - Test each member categorized as exactly one of energizing/neutral/draining
    - _Requirements: 21.1, 21.2_

- [ ] 28. Implement emotional weather chart
  - [ ] 28.1 Create emotional weather data aggregation
    - Aggregate mood data by day for past 30 days
    - Calculate daily average mood from interactions
    - Identify dominant emotion per day
    - _Requirements: 23.1, 23.2, 23.3_
  
  - [ ] 28.2 Create EmotionalWeatherChart component
    - Use Recharts for line chart with area fill
    - Apply color gradient based on mood (red to green)
    - Add date range selector (7d/30d/90d/1y)
    - Show hover tooltips with daily details
    - Display emotion icons on significant days
    - _Requirements: 23.1, 23.2, 23.3_
  
  - [ ] 28.3 Create GET /api/insights/emotional-weather endpoint
    - Return daily mood data for requested time range
    - Include interaction counts and dominant emotions
    - _Requirements: 23.1, 23.2, 23.3_
  
  - [ ]* 28.4 Write property test for emotional weather time range
    - **Property 34: Emotional Weather Time Range**
    - **Validates: Requirements 23.1**
    - Test 30-day request returns exactly 30 data points
    - _Requirements: 23.1_

- [ ] 29. Implement insights dashboard statistics
  - [ ] 29.1 Create dashboard statistics calculation
    - Calculate most logged member
    - Calculate net emotional balance across all members
    - Count total active members
    - Count interactions in past 30 days
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

  - [ ] 29.2 Create GET /api/insights/statistics endpoint
    - Return all dashboard statistics in single response
    - _Requirements: 22.1, 22.2, 22.3, 22.4_
  
  - [ ] 29.3 Display statistics in insights dashboard
    - Show key metrics in card layout
    - Add visual indicators and icons
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [ ] 30. Implement emotion frequency chart
  - [ ] 30.1 Create emotion frequency aggregation
    - Count occurrences of each emotion tag
    - Rank emotions by frequency
    - Support configurable time period filtering
    - _Requirements: 24.1, 24.2, 24.3_
  
  - [ ] 30.2 Create emotion frequency chart component
    - Use Recharts for bar chart visualization
    - Display top 10 emotions
    - Add time period selector
    - _Requirements: 24.1, 24.2, 24.3_
  
  - [ ] 30.3 Create GET /api/insights/emotion-frequency endpoint
    - Return emotion counts for requested time period
    - Sort by frequency descending
    - _Requirements: 24.1, 24.2, 24.3, 24.4_

- [ ] 31. Implement trigger map
  - [ ] 31.1 Create trigger map aggregation service
    - Extract triggers from trait logs and incident logs
    - Identify common triggers across multiple members
    - Calculate trigger frequency and intensity
    - _Requirements: 26.1, 26.2, 26.3_
  
  - [ ] 31.2 Create trigger map visualization component
    - Display triggers grouped by frequency
    - Show intensity with visual indicators
    - List members associated with each trigger
    - _Requirements: 26.1, 26.2, 26.3_
  
  - [ ] 31.3 Create GET /api/insights/trigger-map endpoint
    - Return aggregated trigger data
    - _Requirements: 26.1, 26.2, 26.3, 26.4_

- [ ] 32. Implement attachment style tracker
  - [ ] 32.1 Create attachment style inference service
    - Infer attachment style from interaction patterns monthly
    - Store historical assessments with timestamps
    - _Requirements: 27.1, 27.2_

  - [ ] 32.2 Create attachment style tracker visualization
    - Display attachment style changes over time
    - Use line chart or timeline visualization
    - Show current attachment style prominently
    - _Requirements: 27.3, 27.4_
  
  - [ ] 32.3 Create GET /api/insights/attachment-history endpoint
    - Return historical attachment style assessments
    - _Requirements: 27.1, 27.2, 27.3, 27.4_

- [ ] 33. Build insights dashboard page
  - [ ] 33.1 Create /insights page with all visualizations
    - Display relationship health scores section
    - Display energy map
    - Display emotional weather chart
    - Display dashboard statistics
    - Display emotion frequency chart
    - Display trigger map
    - Display attachment style tracker
    - Implement responsive grid layout
    - _Requirements: 20.5, 21.3, 23.4, 24.4, 26.4, 27.4_
  
  - [ ] 33.2 Add filtering and time range controls
    - Add global time range selector
    - Add member filtering options
    - Sync filters across all visualizations
    - _Requirements: 23.1, 24.3_

- [ ] 34. Implement numerology and Vedic astrology calendar
  - [ ] 34.1 Create calendar generation service
    - Calculate best days for each member based on numerology
    - Display Personal Month themes for user
    - Show relationship forecasts based on transits
    - Highlight current transits affecting user
    - _Requirements: 28.1, 28.2, 28.3, 28.4_
  
  - [ ] 34.2 Create calendar visualization component
    - Display month view with day cells
    - Color code days by favorability
    - Show transit indicators
    - Add hover tooltips with details
    - _Requirements: 28.1, 28.2, 28.3, 28.4_
  
  - [ ] 34.3 Create calendar API endpoints
    - Create GET /api/calendar?month=YYYY-MM endpoint
    - Create GET /api/calendar/best-days/:memberId endpoint
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5_
  
  - [ ] 34.4 Add calendar to insights dashboard
    - Display calendar below other visualizations
    - Add month navigation controls
    - _Requirements: 28.5_

- [ ] 35. Checkpoint - Insights and analytics complete
  - Ensure all tests pass, ask the user if questions arise.


## Phase 6: Notifications & Sharing

- [ ] 36. Implement notification system
  - [ ] 36.1 Create notification data model and API
    - Create GET /api/notifications endpoint
    - Create PUT /api/notifications/:id/read endpoint
    - Create DELETE /api/notifications/:id endpoint
    - _Requirements: 25.5, 31.1, 31.4, 32.1, 17.5_
  
  - [ ] 36.2 Create notification display component
    - Display notifications in header dropdown
    - Show unread count badge
    - Group by type (birthday, check-in, pattern alert, digest)
    - Add mark as read and dismiss actions
    - _Requirements: 25.5, 31.1, 31.4, 32.1_
  
  - [ ] 36.3 Add notifications to Redux store
    - Create notifications slice
    - Implement addNotification and removeNotification actions
    - _Requirements: 25.5_

- [ ] 37. Implement pattern alerts
  - [ ] 37.1 Create pattern detection service
    - Analyze logs for recurring negative patterns
    - Identify members involved in patterns
    - Generate actionable suggestions
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [ ] 37.2 Create pattern alert generation
    - Create pattern_alerts table entry
    - Create notification for user
    - _Requirements: 25.1, 25.5_
  
  - [ ] 37.3 Display pattern alerts in UI
    - Show alerts in notifications dropdown
    - Create dedicated pattern alerts page
    - Allow dismissing alerts
    - _Requirements: 25.5_
  
  - [ ]* 37.4 Write property test for pattern alert creation
    - **Property 40: Pattern Alert Creation**
    - **Validates: Requirements 25.1, 25.2, 25.3, 25.4**
    - Test alert created with description, member IDs, suggestions
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [ ]* 37.5 Write property test for pattern alert notification
    - **Property 41: Pattern Alert Notification**
    - **Validates: Requirements 25.5**
    - Test notification generated for each alert
    - _Requirements: 25.5_

- [ ] 38. Implement birthday reminders
  - [ ] 38.1 Create birthday reminder service
    - Check for upcoming birthdays daily
    - Create reminder 7 days before birthday
    - Create reminder on birthday day
    - Include Personal Year number and significance
    - _Requirements: 31.1, 31.2, 31.3, 31.4_

  - [ ] 38.2 Schedule birthday reminder checks
    - Create cron job to run daily
    - Generate reminders for all users
    - _Requirements: 31.1, 31.4_
  
  - [ ]* 38.3 Write property test for birthday reminder timing
    - **Property 42: Birthday Reminder Timing**
    - **Validates: Requirements 31.1, 31.4**
    - Test reminders created 7 days before and on birthday
    - _Requirements: 31.1, 31.4_

- [ ] 39. Implement check-in nudges
  - [ ] 39.1 Create check-in nudge service
    - Identify members with no interactions in 30 days
    - Create check-in nudge notification
    - Include days since last interaction
    - _Requirements: 32.1, 32.2, 32.3_
  
  - [ ] 39.2 Implement nudge dismissal and snooze
    - Allow dismissing nudges
    - Allow snoozing nudges for 7 days
    - _Requirements: 32.4_
  
  - [ ] 39.3 Schedule check-in nudge generation
    - Create cron job to run daily
    - Generate nudges for all users
    - _Requirements: 32.1_
  
  - [ ]* 39.4 Write property test for check-in nudge timing
    - **Property 43: Check-In Nudge Timing**
    - **Validates: Requirements 32.1**
    - Test nudge created after 30 days without interaction
    - _Requirements: 32.1_

- [ ] 40. Implement daily mood check-in
  - [ ] 40.1 Create daily mood check-in prompt
    - Display modal or banner for daily check-in
    - Provide quick mood selector (1-10 scale)
    - Add optional emotion tags
    - Complete in under 10 seconds
    - _Requirements: 33.1, 33.2_
  
  - [ ] 40.2 Create daily mood log storage
    - Store mood rating and emotions in daily_mood_logs table
    - Allow skipping check-in
    - _Requirements: 33.1, 33.3, 33.4_
  
  - [ ] 40.3 Schedule daily mood check-in prompt
    - Show prompt once per day at user's preferred time
    - Track completion to avoid duplicate prompts
    - _Requirements: 33.1_

- [ ] 41. Implement share link system
  - [ ] 41.1 Create share link generation service
    - Generate cryptographically random 32-byte tokens
    - Create share_links table entry with token
    - Set visibility controls (what to show)
    - Set optional expiration date
    - _Requirements: 29.1, 29.2, 29.3, 29.4_

  - [ ] 41.2 Create share link API endpoints
    - Create POST /api/share/profile/:memberId endpoint
    - Create POST /api/share/report/:reportId endpoint
    - Create GET /api/share endpoint (list user's links)
    - Create DELETE /api/share/:id endpoint (revoke)
    - Create GET /api/shared/:token endpoint (public access)
    - _Requirements: 29.1, 29.5, 30.1, 30.2, 30.3_
  
  - [ ] 41.3 Implement share link access control
    - Check token validity
    - Check expiration date
    - Check revoked status
    - Increment view count on access
    - Return error for invalid/expired/revoked links
    - _Requirements: 29.5, 30.3, 30.4, 30.5_
  
  - [ ] 41.4 Create share link management UI
    - Add share button to member profiles and reports
    - Show share link modal with URL and settings
    - Display active share links list
    - Add revoke action
    - Show view counts
    - _Requirements: 30.1, 30.2, 30.5_
  
  - [ ]* 41.5 Write property test for share link access control
    - **Property 14: Share Link Access Control**
    - **Validates: Requirements 29.5, 30.3, 30.4**
    - Test access succeeds if valid, fails if revoked/expired
    - _Requirements: 29.5, 30.3, 30.4_
  
  - [ ]* 41.6 Write property test for share link view count increment
    - **Property 15: Share Link View Count Increment**
    - **Validates: Requirements 30.5**
    - Test each access increments count by exactly one
    - _Requirements: 30.5_

- [ ] 42. Checkpoint - Notifications and sharing complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Polish & Optimization

- [ ] 43. Implement search functionality
  - [ ] 43.1 Create member search with name and tags
    - Implement search by name (case-insensitive)
    - Implement search by tags
    - Display results with highlighting
    - _Requirements: 48.1, 48.4, 48.5_
  
  - [ ] 43.2 Create journal search with full-text
    - Implement full-text search across journal entries
    - Display results with context snippets
    - Highlight search terms in results
    - _Requirements: 48.2, 48.4, 48.5_

  - [ ] 43.3 Create conversation search
    - Implement search across Lumen AI conversations
    - Search in both user and assistant messages
    - Display results with message context
    - _Requirements: 48.3, 48.4, 48.5_
  
  - [ ] 43.4 Create global search API endpoint
    - Create GET /api/search endpoint with type parameter
    - Support members, journal, conversations types
    - Return unified search results
    - _Requirements: 48.1, 48.2, 48.3_
  
  - [ ]* 43.5 Write property test for member search by name
    - **Property 38: Member Search by Name**
    - **Validates: Requirements 48.1**
    - Test all results contain search term in name (case-insensitive)
    - _Requirements: 48.1_
  
  - [ ]* 43.6 Write property test for member search by tags
    - **Property 39: Member Search by Tags**
    - **Validates: Requirements 48.1**
    - Test all results have at least one matching tag
    - _Requirements: 48.1_

- [ ] 44. Implement data export
  - [ ] 44.1 Create data export service
    - Collect all user profile data
    - Collect all member profiles and calculations
    - Collect all logs (traits, incidents, patterns, interactions, journal)
    - Collect all AI reports and conversations
    - Format as JSON with proper structure
    - _Requirements: 49.1, 49.2, 49.3_
  
  - [ ] 44.2 Create data export API endpoints
    - Create POST /api/export endpoint (request export)
    - Create GET /api/export/:id endpoint (download file)
    - Generate export asynchronously
    - Store export file temporarily
    - _Requirements: 49.1, 49.4_
  
  - [ ] 44.3 Create data export UI
    - Add export button in settings
    - Show export progress
    - Provide download link when ready
    - Send notification when export completes
    - _Requirements: 49.4, 49.5_
  
  - [ ]* 44.4 Write property test for export completeness
    - **Property 48: Export Completeness**
    - **Validates: Requirements 49.1, 49.2, 49.3**
    - Test export includes all user data types
    - _Requirements: 49.1, 49.2, 49.3_

- [ ] 45. Implement responsive design optimizations
  - [ ] 45.1 Optimize layouts for mobile devices
    - Ensure all pages work on 320px width screens
    - Optimize touch targets (minimum 44x44px)
    - Test on mobile devices
    - _Requirements: 47.2, 47.5_

  - [ ] 45.2 Optimize layouts for tablet devices
    - Test on tablet screen sizes
    - Adjust grid layouts for medium screens
    - _Requirements: 47.3_
  
  - [ ] 45.3 Optimize layouts for desktop devices
    - Utilize full screen width effectively
    - Implement multi-column layouts where appropriate
    - _Requirements: 47.4_
  
  - [ ]* 45.4 Write unit tests for responsive breakpoints
    - Test component rendering at different screen sizes
    - Test mobile navigation behavior
    - _Requirements: 47.1, 47.2, 47.3, 47.4_

- [ ] 46. Implement performance optimizations
  - [ ] 46.1 Add code splitting for heavy components
    - Lazy load charts (Recharts components)
    - Lazy load AI chat interface
    - Lazy load journal editor
    - _Requirements: 50.4_
  
  - [ ] 46.2 Optimize images with Next.js Image component
    - Replace img tags with Next.js Image
    - Configure image optimization settings
    - Use WebP format where supported
    - _Requirements: 50.3_
  
  - [ ] 46.3 Add database indexes for performance
    - Index user_id on all user-owned tables
    - Index member_id on all log tables
    - Index created_at for chronological queries
    - Index archived flag for filtering
    - _Requirements: 50.2_
  
  - [ ] 46.4 Implement API response caching
    - Cache numerology calculations (1 day)
    - Cache Vedic chart calculations (1 day)
    - Cache insights data (1 hour)
    - Use ETags for conditional requests
    - _Requirements: 50.2_
  
  - [ ] 46.5 Optimize bundle size
    - Enable tree shaking in production
    - Analyze bundle with webpack-bundle-analyzer
    - Remove unused dependencies
    - _Requirements: 50.4_
  
  - [ ]* 46.6 Write performance tests
    - Test initial page load time < 2 seconds
    - Test member profile render < 500ms
    - Test API response time < 200ms (p95)
    - _Requirements: 50.1, 50.2_

- [ ] 47. Implement error handling and validation
  - [ ] 47.1 Create global error boundary
    - Wrap app with ErrorBoundary component
    - Display user-friendly error messages
    - Log errors to console (future: error tracking service)
    - _Requirements: 39.3_

  - [ ] 47.2 Implement API error handling middleware
    - Create GlobalExceptionFilter in NestJS
    - Map exceptions to standard error responses
    - Include request IDs for traceability
    - _Requirements: 39.1, 39.2, 39.3, 39.4_
  
  - [ ] 47.3 Add form validation across all forms
    - Validate required fields
    - Validate email format
    - Validate date formats
    - Validate file types and sizes
    - Display field-level errors
    - _Requirements: 46.4_
  
  - [ ]* 47.4 Write property test for API response format
    - **Property 45: Success Response Structure**
    - **Validates: Requirements 39.1, 39.2**
    - Test success responses have status, data, requestId, timestamp
    - _Requirements: 39.1, 39.2_
  
  - [ ]* 47.5 Write property test for error response format
    - **Property 46: Error Response Structure**
    - **Validates: Requirements 39.1, 39.3**
    - Test error responses have status, error object, requestId, timestamp
    - _Requirements: 39.1, 39.3_
  
  - [ ]* 47.6 Write property test for request ID uniqueness
    - **Property 47: Request ID Uniqueness**
    - **Validates: Requirements 39.4**
    - Test different requests have different requestIds
    - _Requirements: 39.4_

- [ ] 48. Create home/dashboard page
  - [ ] 48.1 Create / (home) page with dashboard
    - Display welcome message with user name
    - Show quick stats (member count, recent interactions)
    - Display recent activity feed
    - Add quick action buttons (add member, log interaction, chat with Lumen)
    - Show upcoming birthdays
    - Display latest pattern alerts
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 31.1_
  
  - [ ] 48.2 Add navigation to all main sections
    - Link to /profile
    - Link to /members
    - Link to /insights
    - Link to /lumen
    - Link to /settings
    - _Requirements: 47.1_

- [ ] 49. Create settings page
  - [ ] 49.1 Create /settings page with user preferences
    - Add theme toggle (light/dark)
    - Add analysis depth default setting
    - Add notification preferences
    - Add data export button
    - Add account management options
    - _Requirements: 14.5, 34.4, 49.1_

  - [ ] 49.2 Persist user preferences
    - Store theme preference in localStorage
    - Store analysis depth in user profile
    - Store notification preferences in database
    - _Requirements: 34.4, 14.5_

- [ ] 50. Final testing and quality assurance
  - [ ]* 50.1 Run all property-based tests
    - Execute all property tests with 100+ iterations
    - Verify all properties pass
    - Document any edge cases discovered
    - _Requirements: All_
  
  - [ ]* 50.2 Run all unit tests
    - Execute complete test suite
    - Verify 80%+ code coverage
    - Fix any failing tests
    - _Requirements: All_
  
  - [ ]* 50.3 Perform manual testing of critical flows
    - Test complete onboarding flow
    - Test member creation and logging
    - Test AI chat with all modes
    - Test insights dashboard
    - Test sharing functionality
    - _Requirements: All_
  
  - [ ]* 50.4 Test authentication and security
    - Verify RLS policies prevent cross-user access
    - Test protected routes redirect correctly
    - Verify share links work as expected
    - Test rate limiting enforcement
    - _Requirements: 36.1, 36.2, 45.2, 45.3, 19.1_
  
  - [ ]* 50.5 Test responsive design on multiple devices
    - Test on mobile (320px, 375px, 414px widths)
    - Test on tablet (768px, 1024px widths)
    - Test on desktop (1280px, 1920px widths)
    - _Requirements: 47.1, 47.2, 47.3, 47.4_
  
  - [ ]* 50.6 Performance testing and optimization
    - Measure page load times
    - Measure API response times
    - Optimize slow queries
    - Optimize large bundle sizes
    - _Requirements: 50.1, 50.2, 50.3, 50.4, 50.5_

- [ ] 51. Final checkpoint - Complete MVP ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Checkpoints ensure incremental validation at the end of each phase
- All implementation uses TypeScript for type safety
- All user data is protected by Row-Level Security policies
- The implementation follows the Lumis design system for consistent UX
