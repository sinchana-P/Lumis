# Implementation Plan: Authentication Flows

## Overview

This implementation plan covers the complete authentication system for Lumis, including Google OAuth (Priority 1), local sign up (Priority 2), and local sign in (Priority 3). The implementation follows a bottom-up approach, starting with foundational infrastructure, then building core authentication flows, and finally integrating everything with the UI layer.

The system uses Next.js 14 App Router with Redux Toolkit + RTK Query on the frontend, and NestJS with Supabase Auth on the backend. All components follow the Lumis design system with warm cream backgrounds, soft sage accents, and Crimson Pro serif typography.

## Tasks

- [x] 1. Backend: Set up authentication infrastructure
  - [x] 1.1 Create NestJS auth module structure
    - Create `src/auth` directory with module, controller, service, and guards subdirectories
    - Set up AuthModule with necessary imports and providers
    - Configure Supabase client with environment variables
    - _Requirements: 1.3, 2.4, 3.3_
  
  - [x] 1.2 Create DTOs with class-validator decorators
    - Create `GoogleCallbackDto` with code validation
    - Create `SignUpDto` with email and password validation (8+ chars, uppercase, lowercase, number)
    - Create `SignInDto` with email and password validation
    - Create `RefreshTokenDto` with refresh_token validation
    - _Requirements: 2.3, 2.10, 3.2, 9.2_
  
  - [x] 1.3 Set up rate limiting middleware
    - Configure @nestjs/throttler with 5 requests per minute limit
    - Apply ThrottlerGuard globally or to auth routes
    - _Requirements: 1.9, 2.11, 3.8, 5.8, 9.4_
  
  - [x] 1.4 Create auth guard for protected routes
    - Implement AuthGuard that extracts and validates JWT tokens
    - Integrate with Supabase Auth for token validation
    - Attach user object to request context
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [x] 1.5 Write unit tests for DTOs and guards
    - Test DTO validation rules with valid and invalid inputs
    - Test AuthGuard with valid, invalid, and missing tokens
    - Test rate limiter behavior
    - _Requirements: 2.3, 9.2_

- [ ] 2. Backend: Implement database schema and operations
  - [ ] 2.1 Create users table migration
    - Write SQL migration for users table with all fields (id, email, name, avatar_url, provider, analysis_depth_mode, timestamps)
    - Add indexes on email and provider columns
    - Implement soft delete with deleted_at column
    - _Requirements: 11.1, 11.3_
  
  - [ ] 2.2 Set up row-level security policies
    - Enable RLS on users table
    - Create policy for users to select their own data
    - Create policy for users to update their own data
    - Create policy for service role to insert users
    - _Requirements: 7.6, 9.9, 11.2_
  
  - [ ] 2.3 Create users service for database operations
    - Implement createUser method with default preferences
    - Implement updateUser method for OAuth updates
    - Implement findUserByEmail method
    - Implement soft delete method
    - _Requirements: 11.3, 11.4_
  
  - [ ]* 2.4 Write unit tests for users service
    - Test user creation with default preferences
    - Test user updates for existing OAuth users
    - Test soft delete functionality
    - _Requirements: 11.1, 11.3, 11.4_

- [ ] 3. Backend: Implement Google OAuth flow (Priority 1)
  - [ ] 3.1 Create Google OAuth callback endpoint
    - Implement POST /api/v1/auth/google/callback route
    - Apply rate limiting (5 req/min)
    - Validate GoogleCallbackDto
    - _Requirements: 1.2, 1.9_
  
  - [ ] 3.2 Implement Google OAuth service logic
    - Exchange authorization code with Supabase Auth
    - Handle token response from Supabase
    - Create or update user record in database
    - Initialize user preferences with analysis_depth_mode='full-spectrum' for new users
    - Return standard response format with tokens and user data
    - _Requirements: 1.3, 1.4, 1.6, 11.4, 11.5_
  
  - [ ] 3.3 Implement error handling for OAuth flow
    - Handle invalid authorization codes (401)
    - Handle Supabase Auth errors
    - Return structured error responses
    - Exclude PII from logs
    - _Requirements: 1.8, 8.4, 8.5, 9.7_
  
  - [ ]* 3.4 Write property test for Google OAuth token exchange
    - **Property 2: Backend token exchange for valid OAuth codes**
    - **Validates: Requirements 1.3, 1.4**
  
  - [ ]* 3.5 Write unit tests for Google OAuth flow
    - Test successful OAuth callback with new user
    - Test successful OAuth callback with existing user
    - Test invalid authorization code handling
    - Test user preference initialization
    - _Requirements: 1.3, 1.4, 1.6, 1.8_

- [ ] 4. Backend: Implement local sign up flow (Priority 2)
  - [ ] 4.1 Create sign up endpoint
    - Implement POST /api/v1/auth/signup route
    - Apply rate limiting (5 req/min)
    - Validate SignUpDto with class-validator
    - _Requirements: 2.2, 2.3, 2.11_
  
  - [ ] 4.2 Implement sign up service logic
    - Create user account via Supabase Auth
    - Insert user record in database
    - Initialize user preferences with analysis_depth_mode='full-spectrum'
    - Return standard response format with tokens and user data
    - _Requirements: 2.4, 2.5, 2.6, 11.3, 11.5_
  
  - [ ] 4.3 Implement sign up error handling
    - Handle duplicate email errors (409)
    - Handle validation errors (400)
    - Return structured error responses
    - Exclude email and password from logs
    - _Requirements: 2.8, 2.12, 2.13, 8.4, 9.7_
  
  - [ ]* 4.4 Write property test for user account creation
    - **Property 9: User account creation**
    - **Validates: Requirements 2.4, 11.3**
  
  - [ ]* 4.5 Write unit tests for sign up flow
    - Test successful sign up with valid credentials
    - Test duplicate email rejection
    - Test password validation enforcement
    - Test preference initialization
    - _Requirements: 2.4, 2.5, 2.6, 2.8_

- [ ] 5. Backend: Implement local sign in flow (Priority 3)
  - [ ] 5.1 Create sign in endpoint
    - Implement POST /api/v1/auth/login route
    - Apply rate limiting (5 req/min)
    - Validate SignInDto with class-validator
    - _Requirements: 3.1, 3.2, 3.8_
  
  - [ ] 5.2 Implement sign in service logic
    - Authenticate user via Supabase Auth
    - Return standard response format with tokens and user data
    - _Requirements: 3.3, 3.4_
  
  - [ ] 5.3 Implement sign in error handling
    - Handle invalid credentials (401)
    - Handle non-existent user (401)
    - Return structured error responses
    - Exclude email and password from logs
    - _Requirements: 3.6, 3.7, 3.9, 8.4, 9.7_
  
  - [ ]* 5.4 Write property test for user authentication
    - **Property 12: User authentication via Supabase**
    - **Validates: Requirements 3.3**
  
  - [ ]* 5.5 Write unit tests for sign in flow
    - Test successful sign in with valid credentials
    - Test invalid credentials rejection
    - Test non-existent user handling
    - _Requirements: 3.3, 3.4, 3.6, 3.7_

- [ ] 6. Backend: Implement token management endpoints
  - [ ] 6.1 Create token refresh endpoint
    - Implement POST /api/v1/auth/refresh route
    - Apply rate limiting (5 req/min)
    - Validate RefreshTokenDto
    - _Requirements: 5.1, 5.8_
  
  - [ ] 6.2 Implement token refresh service logic
    - Validate refresh token with Supabase Auth
    - Request new tokens from Supabase
    - Return standard response format with new tokens
    - Handle invalid/expired refresh tokens (401)
    - _Requirements: 5.2, 5.3, 5.5_
  
  - [ ] 6.3 Create sign out endpoint
    - Implement POST /api/v1/auth/logout route
    - Apply AuthGuard to require authentication
    - _Requirements: 6.1_
  
  - [ ] 6.4 Implement sign out service logic
    - Invalidate session via Supabase Auth
    - Return success response
    - _Requirements: 6.2_
  
  - [ ] 6.5 Create token validation endpoint
    - Implement GET /api/v1/auth/validate route
    - Apply AuthGuard to require authentication
    - Return user data from request context
    - _Requirements: 4.4, 7.2_
  
  - [ ]* 6.6 Write property test for token refresh
    - **Property 17: Backend token refresh processing**
    - **Validates: Requirements 5.2**
  
  - [ ]* 6.7 Write unit tests for token management
    - Test successful token refresh
    - Test invalid refresh token handling
    - Test sign out session invalidation
    - Test token validation
    - _Requirements: 5.2, 5.3, 5.5, 6.2_

- [ ] 7. Checkpoint - Backend implementation complete
  - Ensure all backend tests pass
  - Verify rate limiting works correctly
  - Verify error responses follow standard format
  - Ask the user if questions arise

- [-] 8. Frontend: Set up Redux Toolkit and RTK Query infrastructure
  - [x] 8.1 Create Redux store configuration
    - Set up store with Redux Toolkit configureStore
    - Configure middleware for RTK Query
    - Add dev tools integration
    - _Requirements: 1.5, 2.7, 3.5_
  
  - [x] 8.2 Create auth slice for state management
    - Define AuthState interface (user, isAuthenticated, isLoading, error)
    - Implement setUser, clearUser, setLoading, setError actions
    - Create selectors for auth state
    - _Requirements: 1.5, 2.7, 3.5_
  
  - [x] 8.3 Create localStorage token management utilities
    - Implement storeTokens function to save all three tokens
    - Implement getTokens function to retrieve tokens
    - Implement clearTokens function to remove all tokens
    - Use keys: lumis_auth_token, lumis_access_token, lumis_refresh_token
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_
  
  - [ ]* 8.4 Write property test for token storage completeness
    - **Property 3: Token storage completeness**
    - **Validates: Requirements 1.5, 2.7, 3.5, 4.1**
  
  - [ ]* 8.5 Write unit tests for auth slice and token utilities
    - Test auth slice actions and reducers
    - Test token storage, retrieval, and clearing
    - Test localStorage key naming
    - _Requirements: 4.1, 4.2_

- [-] 9. Frontend: Create RTK Query auth API slice
  - [x] 9.1 Set up base query with token injection
    - Create baseQuery that adds Authorization header with access token
    - Extract access token from localStorage
    - _Requirements: 7.1, 7.5_
  
  - [x] 9.2 Implement automatic token refresh on 401
    - Create baseQueryWithReauth wrapper
    - Detect 401 responses and trigger token refresh
    - Retry original request with new access token
    - Clear tokens and redirect to sign in if refresh fails
    - _Requirements: 5.6, 5.7, 7.5_
  
  - [x] 9.3 Create auth API endpoints
    - Define googleCallback mutation endpoint
    - Define signUp mutation endpoint
    - Define signIn mutation endpoint
    - Define refreshToken mutation endpoint
    - Define signOut mutation endpoint
    - Define validateToken query endpoint
    - _Requirements: 1.2, 2.2, 3.1, 5.1, 6.1_
  
  - [x] 9.4 Implement token storage on successful authentication
    - Add onQueryStarted hooks to store tokens after successful auth
    - Update auth slice state with user data
    - _Requirements: 1.5, 2.7, 3.5, 4.1_
  
  - [ ]* 9.5 Write property test for automatic retry with token refresh
    - **Property 19: Automatic retry with token refresh on 401**
    - **Validates: Requirements 5.7, 7.5**
  
  - [ ]* 9.6 Write unit tests for RTK Query auth API
    - Test base query token injection
    - Test automatic token refresh on 401
    - Test token storage after successful auth
    - Test all endpoint mutations and queries
    - _Requirements: 5.7, 7.1, 7.5_

- [-] 10. Frontend: Create form validation utilities
  - [x] 10.1 Implement email validation function
    - Validate email format using regex or library
    - Return error message for invalid emails
    - _Requirements: 2.1_
  
  - [x] 10.2 Implement password validation function
    - Check minimum 8 characters
    - Check for at least one uppercase letter
    - Check for at least one lowercase letter
    - Check for at least one number
    - Return specific error messages for each unmet requirement
    - _Requirements: 2.1, 2.9, 2.10_
  
  - [ ]* 10.3 Write property test for frontend credential validation
    - **Property 6: Frontend credential validation**
    - **Validates: Requirements 2.1, 2.10**
  
  - [ ]* 10.4 Write unit tests for validation functions
    - Test email validation with valid and invalid formats
    - Test password validation with various invalid passwords
    - Test password validation with valid passwords
    - _Requirements: 2.1, 2.9, 2.10_

- [-] 11. Frontend: Create reusable auth UI components
  - [x] 11.1 Create AuthLayout component
    - Implement layout with warm cream background (#F8F6F3)
    - Add centered card with soft shadow
    - Include Lumis branding
    - Apply generous spacing
    - _Requirements: 10.2, 10.7_
  
  - [x] 11.2 Create AuthErrorDisplay component
    - Display error messages with warm styling and soft sage accents
    - Use Crimson Pro serif font
    - Implement dismissible alert
    - Add auto-dismiss after 5 seconds
    - _Requirements: 8.1, 8.6_
  
  - [x] 11.3 Create FormField wrapper component
    - Wrap shadcn/ui input components
    - Apply Lumis theme tokens
    - Use Crimson Pro serif font
    - Add focus glow effects with soft sage accent (#9CAF9E)
    - Display field-specific error messages below inputs
    - _Requirements: 8.3, 10.3, 10.4, 10.5, 10.6, 10.8_
  
  - [ ]* 11.4 Write unit tests for UI components
    - Test AuthLayout rendering
    - Test AuthErrorDisplay with various error messages
    - Test FormField with valid and invalid states
    - _Requirements: 8.1, 8.3, 10.3_

- [-] 12. Frontend: Implement Google OAuth sign in (Priority 1)
  - [x] 12.1 Create GoogleSignInButton component
    - Style with Google branding and Lumis theme
    - Add 12px border radius and soft shadows
    - Implement hover state transitions
    - Include loading state
    - _Requirements: 10.4, 10.5, 10.9_
  
  - [x] 12.2 Implement Google OAuth initiation
    - Redirect to Google authorization URL on button click
    - Include necessary OAuth parameters (client_id, redirect_uri, scope)
    - _Requirements: 1.1_
  
  - [x] 12.3 Create OAuth callback page
    - Extract authorization code from URL parameters
    - Call googleCallback mutation with code
    - Handle success by redirecting to dashboard
    - Handle errors by displaying error message
    - _Requirements: 1.2, 1.7_
  
  - [x] 12.4 Implement token storage after OAuth success
    - Store all three tokens in localStorage
    - Update auth slice with user data
    - _Requirements: 1.5_
  
  - [ ]* 12.5 Write property test for Google OAuth API invocation
    - **Property 1: Google OAuth callback API invocation**
    - **Validates: Requirements 1.2**
  
  - [ ]* 12.6 Write integration test for Google OAuth flow
    - Test complete flow from button click to dashboard redirect
    - Mock Google OAuth service
    - Verify token storage
    - _Requirements: 1.1, 1.2, 1.5_

- [-] 13. Frontend: Implement local sign up form (Priority 2)
  - [x] 13.1 Create SignUpForm component
    - Add email input field with FormField wrapper
    - Add password input field with FormField wrapper
    - Add confirm password input field with FormField wrapper
    - Style with Lumis theme (warm cream, soft sage, Crimson Pro)
    - Add generous spacing between fields
    - _Requirements: 10.1, 10.2, 10.3, 10.7, 10.8_
  
  - [x] 13.2 Implement client-side validation
    - Validate email format on blur
    - Validate password requirements on blur
    - Validate password confirmation matches
    - Display field-specific error messages
    - Prevent submission if validation fails
    - _Requirements: 2.1, 2.9, 8.3_
  
  - [x] 13.3 Implement form submission
    - Call signUp mutation with validated credentials
    - Clear sensitive form data from memory after submission
    - Handle success by redirecting to dashboard
    - Handle errors by displaying error messages
    - _Requirements: 2.2, 9.3_
  
  - [x] 13.4 Create sign up page
    - Use AuthLayout wrapper
    - Include SignUpForm component
    - Add link to sign in page
    - Add GoogleSignInButton as alternative
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 13.5 Write property test for valid credentials API call
    - **Property 7: Valid credentials trigger API call**
    - **Validates: Requirements 2.2, 3.1**
  
  - [ ]* 13.6 Write integration test for sign up flow
    - Test complete flow from form submission to dashboard redirect
    - Test validation error display
    - Test duplicate email handling
    - _Requirements: 2.1, 2.2, 2.8_

- [-] 14. Frontend: Implement local sign in form (Priority 3)
  - [x] 14.1 Create SignInForm component
    - Add email input field with FormField wrapper
    - Add password input field with FormField wrapper
    - Style with Lumis theme
    - Add generous spacing between fields
    - _Requirements: 10.1, 10.2, 10.3, 10.7, 10.8_
  
  - [x] 14.2 Implement form submission
    - Call signIn mutation with credentials
    - Clear sensitive form data from memory after submission
    - Handle success by redirecting to dashboard
    - Handle errors by displaying error messages
    - _Requirements: 3.1, 9.3_
  
  - [x] 14.3 Create sign in page
    - Use AuthLayout wrapper
    - Include SignInForm component
    - Add link to sign up page
    - Add GoogleSignInButton as alternative
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 14.4 Write integration test for sign in flow
    - Test complete flow from form submission to dashboard redirect
    - Test invalid credentials handling
    - Test non-existent user handling
    - _Requirements: 3.1, 3.6, 3.7_

- [-] 15. Frontend: Implement token initialization and validation
  - [x] 15.1 Create auth initialization logic
    - Check localStorage for existing tokens on app startup
    - Call validateToken query if tokens exist
    - Update auth slice with user data if tokens are valid
    - Clear tokens and redirect to sign in if tokens are invalid
    - _Requirements: 4.3, 4.4_
  
  - [x] 15.2 Add auth initialization to app root
    - Call initialization logic in root layout or app component
    - Show loading state while validating tokens
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 15.3 Write property test for token validation on initialization
    - **Property 14: Token validation on initialization**
    - **Validates: Requirements 4.4**
  
  - [ ]* 15.4 Write unit tests for auth initialization
    - Test initialization with valid tokens
    - Test initialization with invalid tokens
    - Test initialization with no tokens
    - _Requirements: 4.3, 4.4_

- [-] 16. Frontend: Implement sign out functionality
  - [x] 16.1 Create sign out function
    - Call signOut mutation
    - Clear all tokens from localStorage
    - Clear auth slice state
    - Redirect to sign in page
    - Handle backend errors gracefully (still clear tokens)
    - _Requirements: 6.1, 6.3, 6.4, 6.5_
  
  - [x] 16.2 Add sign out button to UI
    - Add sign out button to navigation or user menu
    - Call sign out function on click
    - _Requirements: 6.1_
  
  - [ ]* 16.3 Write property test for token cleanup on sign out
    - **Property 22: Token cleanup on sign out**
    - **Validates: Requirements 6.3, 6.4**
  
  - [ ]* 16.4 Write integration test for sign out flow
    - Test complete sign out process
    - Verify token removal
    - Verify redirect to sign in page
    - _Requirements: 6.1, 6.3, 6.4_

- [ ] 17. Checkpoint - Core authentication flows complete
  - Ensure all frontend tests pass
  - Verify Google OAuth flow works end-to-end
  - Verify local sign up flow works end-to-end
  - Verify local sign in flow works end-to-end
  - Verify token refresh works automatically
  - Verify sign out works correctly
  - Ask the user if questions arise

- [ ] 18. Security hardening and production readiness
  - [ ] 18.1 Configure CORS on backend
    - Set CORS headers to restrict API access to authorized frontend URL
    - Reject requests from unauthorized origins
    - _Requirements: 9.6_
  
  - [ ] 18.2 Enforce HTTPS in production
    - Configure backend to reject HTTP requests in production
    - Ensure all authentication data transmitted over HTTPS
    - _Requirements: 9.1, 9.8_
  
  - [ ] 18.3 Audit logging for PII exclusion
    - Review all log statements in auth module
    - Ensure email, password, and tokens are never logged
    - Add sanitization for error logs
    - _Requirements: 2.13, 3.9, 9.7_
  
  - [ ] 18.4 Configure environment variables
    - Set up .env files for development and production
    - Document required environment variables (Supabase URL, keys, Google OAuth credentials)
    - Add .env.example file
    - _Requirements: 1.3, 2.4_
  
  - [ ]* 18.5 Write property test for PII exclusion from logs
    - **Property 11: PII exclusion from logs**
    - **Validates: Requirements 2.13, 3.9, 9.7**
  
  - [ ]* 18.6 Write property test for HTTPS enforcement
    - **Property 29: HTTPS enforcement in production**
    - **Validates: Requirements 9.1, 9.8**

- [ ] 19. Error handling refinement
  - [ ] 19.1 Implement comprehensive error mapping
    - Map all Supabase error codes to user-friendly messages
    - Map all validation errors to specific field errors
    - Ensure all errors follow standard response format
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [ ] 19.2 Add error logging with context
    - Log all authentication errors with request_id and timestamp
    - Use appropriate log levels (ERROR, WARN, INFO)
    - Implement structured logging with JSON format
    - _Requirements: 8.5_
  
  - [ ]* 19.3 Write property test for structured error response format
    - **Property 28: Structured error response format**
    - **Validates: Requirements 8.4**
  
  - [ ]* 19.4 Write unit tests for error handling
    - Test error mapping for all error types
    - Test error logging without PII
    - Test error display on frontend
    - _Requirements: 8.1, 8.4, 8.5_

- [ ] 20. Integration and end-to-end testing
  - [ ]* 20.1 Write E2E test for Google OAuth flow
    - Test complete flow from sign in button to dashboard
    - Mock Google OAuth service
    - Verify token storage and user state
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 20.2 Write E2E test for local sign up flow
    - Test complete flow from form submission to dashboard
    - Test validation errors
    - Test duplicate email handling
    - _Requirements: 2.1, 2.2, 2.8_
  
  - [ ]* 20.3 Write E2E test for local sign in flow
    - Test complete flow from form submission to dashboard
    - Test invalid credentials handling
    - _Requirements: 3.1, 3.6_
  
  - [ ]* 20.4 Write E2E test for token refresh flow
    - Simulate expired access token
    - Verify automatic refresh and retry
    - _Requirements: 5.1, 5.7_
  
  - [ ]* 20.5 Write E2E test for sign out flow
    - Test complete sign out process
    - Verify token cleanup and redirect
    - _Requirements: 6.1, 6.3, 6.4_

- [ ] 21. Final checkpoint and documentation
  - Ensure all tests pass (unit, property, integration, E2E)
  - Verify test coverage meets 80% minimum
  - Run security audit on dependencies
  - Test all flows in production-like environment
  - Document any known limitations or edge cases
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Implementation follows priority order: Google OAuth (P1) → Local Sign Up (P2) → Local Sign In (P3)
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- Integration tests verify complete flows end-to-end
- All components follow Lumis design system with warm cream backgrounds, soft sage accents, and Crimson Pro serif typography
