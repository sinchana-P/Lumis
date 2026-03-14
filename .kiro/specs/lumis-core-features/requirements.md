# Requirements Document

## Introduction

Lumis is a relationship intelligence platform that combines numerology, Vedic astrology, and behavioral psychology to help users understand themselves and their relationships. The platform provides AI-powered insights, pattern recognition, and timing guidance for personal growth and relationship management.

## Glossary

- **Lumis_Platform**: The complete relationship intelligence application
- **User**: The authenticated person using the platform for self-discovery
- **Member**: A person in the User's relationship network (friend, family, colleague, etc.)
- **Lumen_AI**: The AI agent that provides insights, analysis, and guidance
- **Self_Profile**: The User's personal profile containing biographical and calculated data
- **Member_Profile**: A Member's profile containing biographical and calculated data
- **Numerology_Engine**: The calculation system for numerological values
- **Vedic_Chart_Engine**: The calculation system for Vedic astrology charts
- **Trait_Log**: A record of observed characteristics (pros/cons) with intensity and emotion
- **Incident_Log**: A dated event record with emotional impact
- **Pattern_Log**: A record of recurring behaviors
- **Interaction_Log**: A timestamped interaction record with mood tracking
- **Member_Journal**: A private diary for notes about a specific Member
- **AI_Report**: Generated analysis combining numerology, Vedic astrology, and behavioral data
- **Relationship_Health_Score**: A calculated metric indicating relationship quality
- **Energy_Map**: A visualization showing which Members energize or drain the User
- **Emotional_Weather_Chart**: A time-series visualization of emotional states
- **Pattern_Alert**: A proactive notification about detected behavioral patterns
- **Share_Link**: A private URL for sharing profiles or reports
- **Personal_Year**: A numerological cycle calculated from DOB and current year
- **Personal_Month**: A numerological cycle calculated from Personal Year and current month
- **Personal_Day**: A numerological cycle calculated from Personal Month and current day
- **Transit**: Current planetary position in Vedic astrology affecting the User or Member
- **Analysis_Depth**: Configuration for AI analysis scope (Cosmic/Behavioral/Full_Spectrum)
- **Lumen_Mode**: Interaction style for AI agent (Vent/Guided/Analysis/Advice/Timing)
- **Relation_Type**: Category of relationship (Friend/Family/Colleague/Partner/etc.)
- **Intensity_Rating**: Strength of a trait observation (Mild/Moderate/Strong)
- **Emotion_Tag**: A label for emotional state or response
- **Supabase_Auth**: The authentication system (implemented in authentication-flows spec)
- **Redux_Store**: The client-side state management system
- **RTK_Query**: The data fetching and caching layer
- **Row_Level_Security**: Database-level access control per user

## Requirements

### Requirement 1: User Self Profile Management

**User Story:** As a User, I want to create and manage my self profile, so that I can receive personalized insights based on my numerology and Vedic astrology.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL store the User's name, photo, date of birth, time of birth, and place of birth
2. WHEN the User provides complete birth data, THE Numerology_Engine SHALL calculate Life Path, Expression, Soul Urge, Personality, Birthday, and Maturity numbers
3. WHEN the User provides complete birth data, THE Numerology_Engine SHALL calculate Personal Year, Personal Month, and Personal Day
4. WHEN the User provides complete birth data, THE Vedic_Chart_Engine SHALL calculate Sun sign, Moon sign, Rising sign, Venus sign, Mars sign, and Mercury sign
5. WHEN the User provides complete birth data, THE Vedic_Chart_Engine SHALL calculate the Dominant Element
6. WHEN the User provides complete birth data, THE Vedic_Chart_Engine SHALL calculate current Transits
7. THE Lumis_Platform SHALL allow the User to record self traits including Strengths, Shadows, Triggers, Needs, and Patterns
8. THE Lumis_Platform SHALL store all Self_Profile data with Row_Level_Security

### Requirement 2: AI Self Report Generation

**User Story:** As a User, I want an AI-generated self report, so that I can understand my attachment style, emotional triggers, and relationship patterns.

#### Acceptance Criteria

1. WHEN the User requests a self report, THE Lumen_AI SHALL infer attachment style based on logged data
2. WHEN the User requests a self report, THE Lumen_AI SHALL generate an emotional trigger map
3. WHEN the User requests a self report, THE Lumen_AI SHALL identify relationship patterns
4. THE AI_Report SHALL combine numerology, Vedic astrology, and behavioral data
5. THE Lumis_Platform SHALL store generated AI_Reports for future reference

### Requirement 3: Member Profile Creation

**User Story:** As a User, I want to create profiles for people in my life, so that I can track and analyze my relationships with them.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL allow the User to create a Member_Profile with name, photo, and Relation_Type
2. THE Lumis_Platform SHALL support Relation_Types: Friend, Family, Colleague, Partner, Acquaintance, Boss, Mentor, Therapist, Coach, Teacher, Student, Neighbor, Ex-Partner, and Other
3. WHERE Relation_Type is Other, THE Lumis_Platform SHALL allow the User to enter a custom relation type
4. THE Lumis_Platform SHALL allow the User to add custom tags to a Member_Profile
5. THE Lumis_Platform SHALL allow the User to record date of birth, time of birth, and place of birth for a Member
6. THE Lumis_Platform SHALL allow the User to record relationship start date for a Member
7. THE Lumis_Platform SHALL provide an archive toggle for soft deletion of Member_Profiles
8. WHEN a Member_Profile is archived, THE Lumis_Platform SHALL exclude it from active views while preserving data
9. THE Lumis_Platform SHALL store all Member_Profile data with Row_Level_Security

### Requirement 4: Member Numerology Calculation

**User Story:** As a User, I want automatic numerology calculations for Members, so that I can understand their core numbers and timing cycles.

#### Acceptance Criteria

1. WHEN a Member has complete birth data, THE Numerology_Engine SHALL calculate Life Path, Expression, Soul Urge, Personality, Birthday, and Maturity numbers
2. WHEN a Member has complete birth data, THE Numerology_Engine SHALL calculate Personal Year, Personal Month, and Personal Day
3. WHEN a Member has a date of birth, THE Numerology_Engine SHALL calculate Life Cycles
4. THE Lumis_Platform SHALL display calculated numerology values in the Member_Profile

### Requirement 5: Member Vedic Astrology Calculation

**User Story:** As a User, I want automatic Vedic astrology calculations for Members, so that I can understand their planetary placements and current transits.

#### Acceptance Criteria

1. WHEN a Member has complete birth data, THE Vedic_Chart_Engine SHALL calculate Sun sign, Moon sign, Rising sign, Venus sign, Mars sign, and Mercury sign
2. WHEN a Member has complete birth data, THE Vedic_Chart_Engine SHALL calculate the Dominant Element
3. WHEN a Member has complete birth data, THE Vedic_Chart_Engine SHALL calculate current Transits
4. THE Lumis_Platform SHALL display calculated Vedic astrology values in the Member_Profile

### Requirement 6: Trait Logging

**User Story:** As a User, I want to log pros and cons about Members with intensity and emotions, so that I can track patterns in their behavior.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL allow the User to create a Trait_Log for a Member with pros or cons designation
2. WHEN creating a Trait_Log, THE Lumis_Platform SHALL require an Intensity_Rating of Mild, Moderate, or Strong
3. WHEN creating a Trait_Log, THE Lumis_Platform SHALL allow the User to add Emotion_Tags
4. THE Lumis_Platform SHALL timestamp each Trait_Log
5. THE Lumis_Platform SHALL display Trait_Logs in the Member_Profile

### Requirement 7: Incident Logging

**User Story:** As a User, I want to log specific incidents with Members, so that I can remember important events and their emotional impact.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL allow the User to create an Incident_Log for a Member with a date and description
2. WHEN creating an Incident_Log, THE Lumis_Platform SHALL allow the User to record emotional impact
3. THE Lumis_Platform SHALL display Incident_Logs in chronological order in the Member_Profile
4. THE Lumis_Platform SHALL allow the User to edit or delete Incident_Logs

### Requirement 8: Pattern Logging

**User Story:** As a User, I want to log recurring behaviors I notice in Members, so that I can identify and understand relationship patterns.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL allow the User to create a Pattern_Log for a Member with a description
2. THE Lumis_Platform SHALL timestamp each Pattern_Log
3. THE Lumis_Platform SHALL display Pattern_Logs in the Member_Profile
4. THE Lumis_Platform SHALL allow the User to edit or delete Pattern_Logs

### Requirement 9: Interaction Logging

**User Story:** As a User, I want to log interactions with Members including mood changes, so that I can track how relationships affect my emotional state.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL allow the User to create an Interaction_Log for a Member with date and context
2. WHEN creating an Interaction_Log, THE Lumis_Platform SHALL allow the User to record mood before the interaction
3. WHEN creating an Interaction_Log, THE Lumis_Platform SHALL allow the User to record mood after the interaction
4. THE Lumis_Platform SHALL calculate and display interaction streaks for each Member
5. THE Lumis_Platform SHALL display Interaction_Logs in chronological order in the Member_Profile

### Requirement 10: Member Journal

**User Story:** As a User, I want a private journal for each Member, so that I can write free-form notes and reflections about our relationship.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL provide a Member_Journal for each Member_Profile
2. THE Lumis_Platform SHALL allow the User to create timestamped journal entries with free-text content
3. THE Lumis_Platform SHALL provide full-text search across Member_Journal entries
4. THE Lumis_Platform SHALL provide a distraction-free writing mode for Member_Journal
5. THE Lumis_Platform SHALL store Member_Journal entries with Row_Level_Security

### Requirement 11: AI Relationship Report Generation

**User Story:** As a User, I want AI-generated relationship reports for Members, so that I can understand compatibility, dynamics, and growth opportunities.

#### Acceptance Criteria

1. WHEN the User requests a relationship report for a Member, THE Lumen_AI SHALL calculate a compatibility score
2. WHEN the User requests a relationship report for a Member, THE Lumen_AI SHALL identify the dynamic type
3. WHEN the User requests a relationship report for a Member, THE Lumen_AI SHALL identify tension points
4. WHEN the User requests a relationship report for a Member, THE Lumen_AI SHALL identify growth points
5. WHEN the User requests a relationship report for a Member, THE Lumen_AI SHALL generate a forecast
6. WHEN the User requests a relationship report for a Member, THE Lumen_AI SHALL provide timing guidance based on numerology and Vedic astrology
7. THE AI_Report SHALL combine numerology, Vedic astrology, and logged behavioral data

### Requirement 12: Lumen AI Query Modes

**User Story:** As a User, I want different ways to query Lumen AI, so that I can get the type of insight I need in the moment.

#### Acceptance Criteria

1. THE Lumen_AI SHALL support mood-triggered queries where the User describes their current emotional state
2. THE Lumen_AI SHALL support person deep-dive queries focused on a specific Member
3. THE Lumen_AI SHALL support pattern and conflict analysis queries
4. THE Lumen_AI SHALL support comparison and insight queries between multiple Members
5. THE Lumis_Platform SHALL allow the User to select query mode before starting a conversation

### Requirement 13: Lumen AI Interaction Modes

**User Story:** As a User, I want different interaction styles with Lumen AI, so that I can choose the support I need.

#### Acceptance Criteria

1. THE Lumen_AI SHALL support Vent mode for emotional expression without advice
2. THE Lumen_AI SHALL support Guided mode for structured exploration with questions
3. THE Lumen_AI SHALL support Analysis mode for objective pattern identification
4. THE Lumen_AI SHALL support Advice mode for actionable recommendations
5. THE Lumen_AI SHALL support Timing mode for numerology and Vedic astrology guidance
6. THE Lumis_Platform SHALL allow the User to switch Lumen_Mode during a conversation

### Requirement 14: Lumen AI Analysis Depth

**User Story:** As a User, I want to control how much data Lumen AI uses, so that I can get focused insights.

#### Acceptance Criteria

1. THE Lumen_AI SHALL support Cosmic Analysis_Depth using only numerology and Vedic astrology
2. THE Lumen_AI SHALL support Behavioral Analysis_Depth using only logged data
3. THE Lumen_AI SHALL support Full_Spectrum Analysis_Depth using all available data
4. THE Lumis_Platform SHALL default to Full_Spectrum Analysis_Depth
5. THE Lumis_Platform SHALL allow the User to change Analysis_Depth in settings

### Requirement 15: Lumen AI Conversation Management

**User Story:** As a User, I want my conversations with Lumen AI saved, so that I can review past insights and maintain context.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL store all Lumen_AI conversation history with timestamps
2. THE Lumis_Platform SHALL allow the User to view past conversations
3. THE Lumis_Platform SHALL allow the User to search conversation history
4. THE Lumis_Platform SHALL maintain conversation context within a session
5. THE Lumis_Platform SHALL store conversation history with Row_Level_Security

### Requirement 16: Lumen AI Voice Input

**User Story:** As a User, I want to speak to Lumen AI, so that I can interact naturally without typing.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL provide voice input for Lumen_AI queries
2. WHEN the User speaks, THE Lumis_Platform SHALL transcribe speech to text
3. WHEN transcription completes, THE Lumis_Platform SHALL send the text to Lumen_AI
4. THE Lumis_Platform SHALL provide visual feedback during voice recording

### Requirement 17: Lumen AI Weekly Digest

**User Story:** As a User, I want a weekly summary from Lumen AI, so that I can stay aware of patterns and opportunities.

#### Acceptance Criteria

1. THE Lumen_AI SHALL generate a weekly digest every seven days
2. THE weekly digest SHALL include relationship health trends
3. THE weekly digest SHALL include detected patterns from the past week
4. THE weekly digest SHALL include numerology and Vedic astrology timing guidance for the coming week
5. THE Lumis_Platform SHALL notify the User when a weekly digest is available

### Requirement 18: Lumen AI Psychology Frameworks

**User Story:** As a User, I want Lumen AI to use established psychology frameworks, so that I receive evidence-based insights.

#### Acceptance Criteria

1. THE Lumen_AI SHALL apply attachment theory in relationship analysis
2. THE Lumen_AI SHALL identify cognitive distortions in User reflections
3. THE Lumen_AI SHALL provide emotional regulation guidance
4. THE Lumen_AI SHALL reference Big Five personality traits where applicable
5. THE Lumen_AI SHALL apply Jungian shadow work concepts
6. THE Lumen_AI SHALL use trauma-informed language and approaches
7. THE Lumen_AI SHALL apply Nonviolent Communication principles in advice mode

### Requirement 19: Lumen AI Rate Limiting

**User Story:** As a platform operator, I want to rate limit AI requests, so that I can control costs and prevent abuse.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL limit Lumen_AI requests to 10 per minute per User
2. WHEN the rate limit is exceeded, THE Lumis_Platform SHALL return an error message with retry timing
3. THE Lumis_Platform SHALL track rate limit usage per User
4. THE Lumis_Platform SHALL reset rate limits every 60 seconds

### Requirement 20: Relationship Health Scores

**User Story:** As a User, I want to see health scores for my relationships, so that I can identify which need attention.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL calculate a Relationship_Health_Score for each Member
2. THE Relationship_Health_Score SHALL consider interaction frequency
3. THE Relationship_Health_Score SHALL consider emotional balance from Interaction_Logs
4. THE Relationship_Health_Score SHALL consider trait balance from Trait_Logs
5. THE Lumis_Platform SHALL display Relationship_Health_Scores in the Insights Dashboard

### Requirement 21: Energy Map Visualization

**User Story:** As a User, I want to see which people energize or drain me, so that I can make informed decisions about my time.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL generate an Energy_Map based on mood changes in Interaction_Logs
2. THE Energy_Map SHALL categorize Members as energizing, neutral, or draining
3. THE Energy_Map SHALL provide a visual representation of energy impact
4. THE Lumis_Platform SHALL display the Energy_Map in the Insights Dashboard

### Requirement 22: Insights Dashboard Statistics

**User Story:** As a User, I want to see key statistics about my relationships, so that I can understand my social patterns.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL display the most logged Member in the Insights Dashboard
2. THE Lumis_Platform SHALL calculate and display net emotional balance across all Members
3. THE Lumis_Platform SHALL display total number of active Members
4. THE Lumis_Platform SHALL display total number of logged interactions in the past 30 days

### Requirement 23: Emotional Weather Chart

**User Story:** As a User, I want to see my emotional trends over time, so that I can identify patterns in my mood.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL generate an Emotional_Weather_Chart for the past 30 days
2. THE Emotional_Weather_Chart SHALL visualize mood data from Interaction_Logs
3. THE Emotional_Weather_Chart SHALL show daily emotional averages
4. THE Lumis_Platform SHALL display the Emotional_Weather_Chart in the Insights Dashboard

### Requirement 24: Emotion Frequency Chart

**User Story:** As a User, I want to see which emotions I experience most often, so that I can understand my emotional patterns.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL generate an emotion frequency chart based on Emotion_Tags
2. THE emotion frequency chart SHALL rank emotions by occurrence
3. THE emotion frequency chart SHALL show emotion counts for a configurable time period
4. THE Lumis_Platform SHALL display the emotion frequency chart in the Insights Dashboard

### Requirement 25: Pattern Alerts

**User Story:** As a User, I want proactive notifications about detected patterns, so that I can address issues before they escalate.

#### Acceptance Criteria

1. WHEN the Lumen_AI detects a recurring negative pattern, THE Lumis_Platform SHALL create a Pattern_Alert
2. THE Pattern_Alert SHALL describe the detected pattern
3. THE Pattern_Alert SHALL reference the Members involved
4. THE Pattern_Alert SHALL provide actionable suggestions
5. THE Lumis_Platform SHALL notify the User when a Pattern_Alert is created

### Requirement 26: Trigger Map

**User Story:** As a User, I want to see my emotional triggers across all relationships, so that I can work on my responses.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL generate a trigger map from Trait_Logs and Incident_Logs
2. THE trigger map SHALL identify common triggers across multiple Members
3. THE trigger map SHALL show trigger frequency and intensity
4. THE Lumis_Platform SHALL display the trigger map in the Insights Dashboard

### Requirement 27: Attachment Style Tracker

**User Story:** As a User, I want to track my attachment style over time, so that I can see my personal growth.

#### Acceptance Criteria

1. THE Lumen_AI SHALL infer attachment style from logged data monthly
2. THE Lumis_Platform SHALL store historical attachment style assessments
3. THE Lumis_Platform SHALL visualize attachment style changes over time
4. THE Lumis_Platform SHALL display the attachment style tracker in the Insights Dashboard

### Requirement 28: Numerology and Vedic Astrology Calendar

**User Story:** As a User, I want a calendar showing favorable days and timing guidance, so that I can plan important interactions.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL generate a calendar with best days for each Member based on numerology
2. THE calendar SHALL display Personal_Month themes for the User
3. THE calendar SHALL display relationship forecasts based on Vedic astrology Transits
4. THE calendar SHALL highlight current Transits affecting the User
5. THE Lumis_Platform SHALL display the calendar in the Insights Dashboard

### Requirement 29: Share Link Generation

**User Story:** As a User, I want to share profiles or reports with others, so that I can collaborate or seek external advice.

#### Acceptance Criteria

1. WHERE sharing is enabled, THE Lumis_Platform SHALL generate a private Share_Link for a Member_Profile or AI_Report
2. THE Share_Link SHALL be a unique, unguessable URL
3. THE Lumis_Platform SHALL allow the User to set visibility controls for the Share_Link
4. THE Lumis_Platform SHALL allow the User to set an expiration date for the Share_Link
5. THE Share_Link SHALL provide view-only access to the shared content

### Requirement 30: Share Link Management

**User Story:** As a User, I want to manage my share links, so that I can control who has access to my data.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL display all active Share_Links for the User
2. THE Lumis_Platform SHALL allow the User to revoke a Share_Link at any time
3. WHEN a Share_Link is revoked, THE Lumis_Platform SHALL return an error for subsequent access attempts
4. WHEN a Share_Link expires, THE Lumis_Platform SHALL return an error for access attempts
5. THE Lumis_Platform SHALL track view count for each Share_Link

### Requirement 31: Birthday Reminders

**User Story:** As a User, I want reminders for Member birthdays with numerological significance, so that I can reach out at meaningful times.

#### Acceptance Criteria

1. WHEN a Member's birthday approaches, THE Lumis_Platform SHALL send a reminder notification 7 days in advance
2. THE birthday reminder SHALL include the Member's upcoming Personal_Year number
3. THE birthday reminder SHALL include numerological significance of the new year
4. THE Lumis_Platform SHALL send a reminder notification on the birthday day

### Requirement 32: Check-In Nudges

**User Story:** As a User, I want reminders to log interactions with Members I haven't logged recently, so that I maintain awareness of all relationships.

#### Acceptance Criteria

1. WHEN 30 days pass without an Interaction_Log for a Member, THE Lumis_Platform SHALL send a check-in nudge
2. THE check-in nudge SHALL identify the Member by name
3. THE check-in nudge SHALL show days since last interaction
4. THE Lumis_Platform SHALL allow the User to dismiss or snooze check-in nudges

### Requirement 33: Daily Mood Check-In

**User Story:** As a User, I want a quick daily mood check-in, so that I can build a habit of emotional awareness.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL prompt the User for a daily mood check-in
2. THE daily mood check-in SHALL take no more than 10 seconds to complete
3. THE Lumis_Platform SHALL store daily mood data for trend analysis
4. THE Lumis_Platform SHALL allow the User to skip the daily mood check-in

### Requirement 34: Dark Mode

**User Story:** As a User, I want dark mode, so that I can use the platform comfortably in low-light environments.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL provide a dark mode theme option
2. THE dark mode theme SHALL use dark backgrounds with light text
3. THE Lumis_Platform SHALL preserve the Lumis design aesthetic in dark mode
4. THE Lumis_Platform SHALL remember the User's theme preference

### Requirement 35: Journal Mode

**User Story:** As a User, I want a distraction-free journal mode, so that I can focus on writing without UI clutter.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL provide a journal mode that hides navigation and sidebars
2. THE journal mode SHALL display only the writing area and minimal controls
3. THE Lumis_Platform SHALL allow the User to exit journal mode at any time
4. THE journal mode SHALL auto-save content as the User types

### Requirement 36: Privacy by Default

**User Story:** As a User, I want all my data private by default, so that I feel safe recording sensitive information.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL apply Row_Level_Security to all user data tables
2. THE Lumis_Platform SHALL prevent access to User data by other Users
3. THE Lumis_Platform SHALL not share User data with third parties
4. THE Lumis_Platform SHALL encrypt sensitive data at rest

### Requirement 37: Redux State Management

**User Story:** As a developer, I want centralized state management, so that the application state is predictable and debuggable.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL use Redux_Store for client-side state management
2. THE Redux_Store SHALL manage authentication state
3. THE Redux_Store SHALL manage UI state
4. THE Redux_Store SHALL integrate with RTK_Query for data fetching

### Requirement 38: RTK Query Data Layer

**User Story:** As a developer, I want efficient data fetching and caching, so that the application is fast and reduces server load.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL use RTK_Query for all API requests
2. THE RTK_Query SHALL cache API responses
3. THE RTK_Query SHALL automatically refetch stale data
4. THE RTK_Query SHALL provide loading and error states for all queries

### Requirement 39: Standard API Response Format

**User Story:** As a developer, I want consistent API responses, so that error handling and data parsing are predictable.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL return API responses in a standard format with status, data, and error fields
2. WHEN an API request succeeds, THE Lumis_Platform SHALL return status 200 with data
3. WHEN an API request fails, THE Lumis_Platform SHALL return an appropriate error status with error details
4. THE Lumis_Platform SHALL include request IDs in all API responses for debugging

### Requirement 40: Soft Delete Architecture

**User Story:** As a developer, I want soft deletes for all data, so that Users can recover accidentally deleted information.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL implement soft deletes using an archived flag on all deletable entities
2. WHEN a User deletes a Member_Profile, THE Lumis_Platform SHALL set the archived flag to true
3. WHEN a User deletes a log entry, THE Lumis_Platform SHALL set the archived flag to true
4. THE Lumis_Platform SHALL exclude archived records from default queries
5. THE Lumis_Platform SHALL provide an interface to restore archived records

### Requirement 41: Reusable Component Library

**User Story:** As a developer, I want reusable UI components, so that the interface is consistent and development is efficient.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL provide a DataTable component for tabular data
2. THE Lumis_Platform SHALL provide a ProfileCard component for User and Member profiles
3. THE Lumis_Platform SHALL provide a TraitLogger component for recording traits
4. THE Lumis_Platform SHALL provide a TimelineLog component for chronological entries
5. THE Lumis_Platform SHALL provide an AIReport component for displaying AI-generated insights
6. THE Lumis_Platform SHALL provide a FormField component for consistent form inputs
7. THE Lumis_Platform SHALL provide an EmotionPicker component for selecting emotions
8. THE Lumis_Platform SHALL provide a NumerologyCard component for displaying numerology data
9. THE Lumis_Platform SHALL provide a VedicAstrologyChart component for displaying Vedic astrology data
10. THE Lumis_Platform SHALL provide a LumenChat component for AI conversations

### Requirement 42: Lumis Design System

**User Story:** As a designer, I want a consistent design system, so that the platform feels cohesive and calming.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL use warm cream backgrounds with hex color #F8F6F3
2. THE Lumis_Platform SHALL use soft sage accents with hex color #9CAF9E
3. THE Lumis_Platform SHALL use Crimson Pro serif font for headings
4. THE Lumis_Platform SHALL use generous spacing between UI elements
5. THE Lumis_Platform SHALL use soft shadows for depth
6. THE Lumis_Platform SHALL use gentle hover states for interactive elements
7. THE Lumis_Platform SHALL use focus glow effects for accessibility

### Requirement 43: Numerology Calculation Accuracy

**User Story:** As a User, I want accurate numerology calculations, so that I can trust the insights provided.

#### Acceptance Criteria

1. THE Numerology_Engine SHALL calculate Life Path number using the sum of birth date digits reduced to a single digit or master number
2. THE Numerology_Engine SHALL calculate Expression number from the full birth name
3. THE Numerology_Engine SHALL calculate Soul Urge number from vowels in the birth name
4. THE Numerology_Engine SHALL calculate Personality number from consonants in the birth name
5. THE Numerology_Engine SHALL calculate Birthday number from the day of birth
6. THE Numerology_Engine SHALL calculate Maturity number from Life Path and Expression numbers
7. THE Numerology_Engine SHALL recognize master numbers 11, 22, and 33

### Requirement 44: Vedic Astrology Calculation Accuracy

**User Story:** As a User, I want accurate Vedic astrology calculations, so that I can trust the cosmic timing guidance.

#### Acceptance Criteria

1. THE Vedic_Chart_Engine SHALL calculate planetary positions using Vedic sidereal zodiac
2. THE Vedic_Chart_Engine SHALL apply ayanamsa correction for precession of equinoxes
3. THE Vedic_Chart_Engine SHALL calculate house cusps using birth time and location
4. THE Vedic_Chart_Engine SHALL identify the Ascendant (Rising sign) from the first house cusp
5. THE Vedic_Chart_Engine SHALL calculate current Transits using real-time planetary positions
6. THE Vedic_Chart_Engine SHALL determine Dominant Element from planetary placements

### Requirement 45: Authentication Integration

**User Story:** As a User, I want secure authentication, so that my personal data is protected.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL integrate with Supabase_Auth for user authentication
2. THE Lumis_Platform SHALL require authentication for all protected routes
3. WHEN a User is not authenticated, THE Lumis_Platform SHALL redirect to the login page
4. THE Lumis_Platform SHALL store the authentication token securely in the Redux_Store

### Requirement 46: File Upload for Photos

**User Story:** As a User, I want to upload photos for my profile and Member profiles, so that I can personalize the experience.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL allow the User to upload a profile photo
2. THE Lumis_Platform SHALL allow the User to upload photos for Member_Profiles
3. THE Lumis_Platform SHALL store uploaded photos in Supabase Storage
4. THE Lumis_Platform SHALL validate image file types and sizes before upload
5. THE Lumis_Platform SHALL display uploaded photos in profiles

### Requirement 47: Responsive Design

**User Story:** As a User, I want the platform to work on all my devices, so that I can access it anywhere.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL provide a responsive layout that adapts to screen size
2. THE Lumis_Platform SHALL be usable on mobile devices with screen widths down to 320px
3. THE Lumis_Platform SHALL be usable on tablet devices
4. THE Lumis_Platform SHALL be usable on desktop devices
5. THE Lumis_Platform SHALL optimize touch targets for mobile devices

### Requirement 48: Search Functionality

**User Story:** As a User, I want to search across my data, so that I can quickly find specific information.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL provide search functionality for Member_Profiles by name and tags
2. THE Lumis_Platform SHALL provide search functionality for Member_Journal entries
3. THE Lumis_Platform SHALL provide search functionality for Lumen_AI conversation history
4. THE Lumis_Platform SHALL display search results with relevant context
5. THE Lumis_Platform SHALL highlight search terms in results

### Requirement 49: Data Export

**User Story:** As a User, I want to export my data, so that I have a backup and can use it elsewhere.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL allow the User to export all personal data in JSON format
2. THE exported data SHALL include Self_Profile, all Member_Profiles, and all logs
3. THE exported data SHALL include AI_Reports and conversation history
4. THE Lumis_Platform SHALL provide a download link for the exported data
5. THE Lumis_Platform SHALL notify the User when export is complete

### Requirement 50: Performance Optimization

**User Story:** As a User, I want fast page loads and smooth interactions, so that the platform feels responsive.

#### Acceptance Criteria

1. THE Lumis_Platform SHALL load the initial page in less than 2 seconds on a standard broadband connection
2. THE Lumis_Platform SHALL render Member_Profile pages in less than 500 milliseconds
3. THE Lumis_Platform SHALL use lazy loading for images and heavy components
4. THE Lumis_Platform SHALL use code splitting to reduce initial bundle size
5. THE Lumis_Platform SHALL cache static assets for repeat visits
