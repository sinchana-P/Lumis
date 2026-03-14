# Requirements Document

## Introduction

This document specifies the requirements for implementing authentication flows in the Lumis MVP platform - a private, AI-powered personal intelligence platform. The system will support Google OAuth authentication (Priority 1) and local email/password authentication (Priority 2 for sign up, Priority 3 for sign in), with token management handled via browser localStorage. The implementation spans both Next.js 14 (App Router) frontend and NestJS backend components, integrating with Supabase Auth and PostgreSQL with row-level security.

The authentication system follows Lumis design principles: warm neutrals, soft earth tones, serif fonts (Crimson Pro), and generous spacing. All components use shadcn/ui with Lumis theme tokens and follow the Redux Toolkit + RTK Query architecture pattern.

## Glossary

- **Auth_System**: The complete authentication subsystem including frontend and backend components
- **Frontend_Client**: The Next.js 14 application using App Router with Redux Toolkit and RTK Query
- **Backend_API**: The NestJS backend service with class-validator DTOs
- **Supabase_Auth**: The Supabase authentication service provider
- **Auth_Token**: The primary authentication token identifying the user session (JWT with 15 minute expiration)
- **Access_Token**: The token used for API authorization (JWT with 15 minute expiration)
- **Refresh_Token**: The token used to obtain new access tokens without re-authentication (7 day expiration)
- **Token_Storage**: The browser localStorage mechanism for persisting tokens
- **Google_OAuth_Flow**: The authentication flow using Google as identity provider (Priority 1)
- **Local_Auth_Flow**: The authentication flow using email and password credentials (Priority 2 for sign up, Priority 3 for sign in)
- **User_Credentials**: Email address and password combination for local authentication
- **RTK_Auth_Slice**: The Redux Toolkit Query API slice handling authentication endpoints
- **Users_Table**: The PostgreSQL table storing user data with row-level security enabled
- **Password_Requirements**: Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number
- **Rate_Limiter**: The backend middleware enforcing 5 requests per minute on authentication endpoints
- **User_Preferences**: User settings including analysis_depth_mode initialized on signup

## Requirements

### Requirement 1: Google OAuth Authentication

**User Story:** As a user, I want to sign in with my Google account, so that I can quickly access the platform without creating new credentials.

#### Acceptance Criteria

1. WHEN a user clicks the Google sign in button, THE Frontend_Client SHALL initiate the Google_OAuth_Flow by redirecting to Google's authorization endpoint
2. WHEN Google returns an authorization code to the callback URL, THE Frontend_Client SHALL send the code to the Backend_API at /api/v1/auth/google/callback
3. WHEN the Backend_API receives a valid authorization code, THE Backend_API SHALL exchange it with Supabase_Auth for tokens
4. WHEN Supabase_Auth returns tokens, THE Backend_API SHALL create or update the user record in Users_Table and return a response containing Auth_Token, Access_Token, and Refresh_Token
5. WHEN the Frontend_Client receives authentication tokens, THE RTK_Auth_Slice SHALL store all tokens in Token_Storage
6. WHEN a new user signs in via Google_OAuth_Flow, THE Backend_API SHALL initialize User_Preferences with analysis_depth_mode set to 'full-spectrum'
7. IF Google authorization fails, THEN THE Frontend_Client SHALL display a descriptive error message with warm styling matching the Lumis design system
8. IF the Backend_API cannot exchange the authorization code, THEN THE Backend_API SHALL return a standard error response with success: false and status code 401
9. THE Backend_API SHALL enforce Rate_Limiter on the Google OAuth callback endpoint

### Requirement 2: Local Sign Up Flow

**User Story:** As a new user, I want to create an account with my email and password, so that I can access the platform with credentials I control.

#### Acceptance Criteria

1. WHEN a user submits User_Credentials for sign up, THE Frontend_Client SHALL validate the email format and password against Password_Requirements
2. WHEN User_Credentials are valid, THE RTK_Auth_Slice SHALL send the credentials to the Backend_API at /api/v1/auth/signup
3. WHEN the Backend_API receives sign up credentials, THE Backend_API SHALL validate the input using class-validator DTOs
4. WHEN validation passes, THE Backend_API SHALL create a new user account via Supabase_Auth and insert a record in Users_Table
5. WHEN Supabase_Auth successfully creates the account, THE Backend_API SHALL initialize User_Preferences with analysis_depth_mode set to 'full-spectrum'
6. WHEN the user account is created, THE Backend_API SHALL return a standard response containing success: true, data with Auth_Token, Access_Token, and Refresh_Token, and meta information
7. WHEN the Frontend_Client receives authentication tokens, THE RTK_Auth_Slice SHALL store all tokens in Token_Storage
8. IF the email address is already registered, THEN THE Backend_API SHALL return a standard error response with success: false and status code 409
9. IF Password_Requirements are not met, THEN THE Frontend_Client SHALL display specific validation errors in serif font with warm styling before submission
10. THE Frontend_Client SHALL require passwords to contain at least one uppercase letter, one lowercase letter, one number, and minimum 8 characters total
11. THE Backend_API SHALL enforce Rate_Limiter on the sign up endpoint
12. THE Backend_API SHALL validate input to prevent injection attacks
13. THE Backend_API SHALL exclude email addresses and passwords from all log output

### Requirement 3: Local Sign In Flow

**User Story:** As a registered user, I want to sign in with my email and password, so that I can access my account.

#### Acceptance Criteria

1. WHEN a user submits User_Credentials for sign in, THE RTK_Auth_Slice SHALL send the credentials to the Backend_API at /api/v1/auth/login
2. WHEN the Backend_API receives sign in credentials, THE Backend_API SHALL validate the input using class-validator DTOs
3. WHEN validation passes, THE Backend_API SHALL authenticate the user via Supabase_Auth
4. WHEN Supabase_Auth successfully authenticates the user, THE Backend_API SHALL return a standard response containing success: true, data with Auth_Token, Access_Token, and Refresh_Token, and meta information
5. WHEN the Frontend_Client receives authentication tokens, THE RTK_Auth_Slice SHALL store all tokens in Token_Storage
6. IF the User_Credentials are invalid, THEN THE Backend_API SHALL return a standard error response with success: false and status code 401
7. IF the user account does not exist, THEN THE Backend_API SHALL return a standard error response with success: false and status code 401
8. THE Backend_API SHALL enforce Rate_Limiter on the sign in endpoint
9. THE Backend_API SHALL exclude email addresses and passwords from all log output

### Requirement 4: Token Storage Management

**User Story:** As a user, I want my authentication session to persist across browser sessions, so that I don't have to sign in repeatedly.

#### Acceptance Criteria

1. WHEN the RTK_Auth_Slice stores tokens, THE RTK_Auth_Slice SHALL write the Auth_Token, Access_Token, and Refresh_Token to Token_Storage as separate entries
2. WHEN the Frontend_Client needs to authenticate a request, THE RTK_Auth_Slice SHALL retrieve the Access_Token from Token_Storage
3. WHEN the Frontend_Client initializes, THE RTK_Auth_Slice SHALL check Token_Storage for existing tokens
4. IF tokens exist in Token_Storage at initialization, THEN THE RTK_Auth_Slice SHALL validate the tokens with the Backend_API
5. THE Auth_System SHALL store tokens exclusively in Token_Storage
6. THE Auth_System SHALL store zero authentication tokens in httpOnly cookies
7. THE Auth_System SHALL store zero authentication tokens in environment variables

### Requirement 5: Token Refresh Flow

**User Story:** As a user, I want my session to remain active without interruption, so that I can continue working without re-authenticating.

#### Acceptance Criteria

1. WHEN the Access_Token expires, THE RTK_Auth_Slice SHALL send the Refresh_Token to the Backend_API at /api/v1/auth/refresh
2. WHEN the Backend_API receives a valid Refresh_Token, THE Backend_API SHALL request new tokens from Supabase_Auth
3. WHEN Supabase_Auth returns new tokens, THE Backend_API SHALL return a standard response containing success: true, data with new Auth_Token, Access_Token, and Refresh_Token, and meta information
4. WHEN the Frontend_Client receives new tokens, THE RTK_Auth_Slice SHALL update all tokens in Token_Storage
5. IF the Refresh_Token is invalid or expired, THEN THE Backend_API SHALL return a standard error response with success: false and status code 401
6. IF token refresh fails, THEN THE RTK_Auth_Slice SHALL clear Token_Storage and redirect to the sign in page
7. WHEN the RTK_Auth_Slice receives a 401 response from any API endpoint, THE RTK_Auth_Slice SHALL automatically attempt token refresh before retrying the original request
8. THE Backend_API SHALL enforce Rate_Limiter on the token refresh endpoint

### Requirement 6: Sign Out Flow

**User Story:** As a user, I want to sign out of my account, so that I can protect my data when using shared devices.

#### Acceptance Criteria

1. WHEN a user initiates sign out, THE RTK_Auth_Slice SHALL send a sign out request to the Backend_API at /api/v1/auth/logout with the current Auth_Token
2. WHEN the Backend_API receives a sign out request, THE Backend_API SHALL invalidate the session via Supabase_Auth
3. WHEN the session is invalidated, THE RTK_Auth_Slice SHALL remove all tokens from Token_Storage
4. WHEN tokens are removed, THE Frontend_Client SHALL redirect the user to the sign in page
5. IF the Backend_API sign out request fails, THEN THE RTK_Auth_Slice SHALL still remove all tokens from Token_Storage and redirect to the sign in page

### Requirement 7: API Request Authentication

**User Story:** As a developer, I want all API requests to be properly authenticated, so that user data remains secure.

#### Acceptance Criteria

1. WHEN the RTK_Auth_Slice makes an API request, THE RTK_Auth_Slice SHALL include the Access_Token in the Authorization header
2. WHEN the Backend_API receives a request, THE Backend_API SHALL validate the Access_Token with Supabase_Auth
3. IF the Access_Token is valid, THEN THE Backend_API SHALL process the request
4. IF the Access_Token is invalid or expired, THEN THE Backend_API SHALL return a standard error response with success: false and status code 401
5. WHEN the RTK_Auth_Slice receives a 401 response, THE RTK_Auth_Slice SHALL attempt token refresh before retrying the request
6. THE Backend_API SHALL enforce row-level security on all queries to Users_Table

### Requirement 8: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when authentication fails, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN an authentication error occurs, THE Frontend_Client SHALL display a user-friendly error message styled with warm cream backgrounds and soft sage accents matching the Lumis design system
2. WHEN a network error occurs during authentication, THE Frontend_Client SHALL display a message indicating connectivity issues with serif font styling
3. WHEN validation fails on the Frontend_Client, THE Frontend_Client SHALL display field-specific error messages with gentle focus glow effects
4. THE Backend_API SHALL return structured error responses following the standard format with success: false, error object containing code and message, and meta information
5. IF the Backend_API encounters an unexpected error, THEN THE Backend_API SHALL log the error details excluding any PII and return a generic error message to the Frontend_Client
6. THE Frontend_Client SHALL display error messages using Crimson Pro serif font with generous spacing

### Requirement 9: Security Requirements

**User Story:** As a security-conscious user, I want my authentication data to be handled securely, so that my account cannot be compromised.

#### Acceptance Criteria

1. WHILE in production environment, THE Backend_API SHALL transmit all authentication data over HTTPS connections exclusively
2. WHEN the Backend_API receives input data, THE Backend_API SHALL validate all fields using class-validator DTOs to prevent injection attacks
3. WHEN a user submits authentication forms, THE Frontend_Client SHALL clear sensitive form data from memory after submission
4. THE Backend_API SHALL implement Rate_Limiter restricting authentication endpoints to 5 requests per minute per client
5. WHEN storing tokens, THE RTK_Auth_Slice SHALL use Token_Storage without additional encryption
6. THE Backend_API SHALL configure CORS headers to restrict API access exclusively to the authorized frontend URL
7. THE Backend_API SHALL exclude email addresses, passwords, and other PII from all log output
8. WHILE in production environment, THE Backend_API SHALL enforce HTTPS-only connections and reject HTTP requests
9. THE Backend_API SHALL apply row-level security policies on Users_Table to prevent unauthorized data access

### Requirement 10: UI Component Design

**User Story:** As a user, I want authentication screens that feel warm and inviting, so that I have a pleasant onboarding experience.

#### Acceptance Criteria

1. THE Frontend_Client SHALL render all authentication forms using shadcn/ui components with Lumis theme tokens
2. THE Frontend_Client SHALL apply warm cream background color (#F8F6F3) to all authentication pages
3. THE Frontend_Client SHALL style all form inputs using Crimson Pro serif font
4. THE Frontend_Client SHALL render buttons with 12px border radius and soft shadows
5. WHEN a user hovers over interactive elements, THE Frontend_Client SHALL apply gentle hover state transitions
6. WHEN a user focuses on form inputs, THE Frontend_Client SHALL display focus glow effects with soft sage accent color (#9CAF9E)
7. THE Frontend_Client SHALL apply generous spacing between form elements following the Lumis design system
8. THE Frontend_Client SHALL use reusable FormField components for all input fields
9. THE Frontend_Client SHALL render the Google sign in button with appropriate branding and styling consistent with Lumis design

### Requirement 11: Database Operations

**User Story:** As a system administrator, I want user data to be safely managed in the database, so that no data is permanently lost.

#### Acceptance Criteria

1. WHEN a user account is deleted, THE Backend_API SHALL perform a soft delete by setting a deleted_at timestamp in Users_Table
2. THE Backend_API SHALL apply row-level security policies on all queries to Users_Table
3. WHEN creating a new user record, THE Backend_API SHALL insert the record into Users_Table with appropriate default values
4. WHEN a user signs in via Google_OAuth_Flow, THE Backend_API SHALL update the existing user record if the email already exists in Users_Table
5. THE Backend_API SHALL store user preferences including analysis_depth_mode in the database associated with the user record

