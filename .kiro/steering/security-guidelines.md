---
inclusion: auto
---

# Lumis Security Guidelines

## Authentication & Authorization

### JWT Token Management
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry
- Store refresh tokens in httpOnly cookies
- Never expose tokens in URLs or logs

### Row-Level Security (RLS)
- Enable RLS on ALL tables
- Users can only access their own data
- Members, traits, logs tied to user_id
- Test RLS policies thoroughly

### Password Requirements
- Minimum 8 characters
- At least one uppercase, lowercase, number
- Use bcrypt with salt rounds >= 10
- Never log or expose passwords

## Input Validation

### Always Validate
- All user inputs on backend
- Use DTO classes with class-validator
- Sanitize HTML content
- Validate file uploads (type, size)

### SQL Injection Prevention
- Use parameterized queries ONLY
- Never concatenate user input into SQL
- Use ORM query builders (TypeORM, Prisma)

### XSS Prevention
- Sanitize all user-generated content
- Use Content Security Policy headers
- Escape output in templates
- Validate emotion tags, relation types against whitelist

## API Security

### Rate Limiting
```typescript
// Standard endpoints: 100 req/min
// AI endpoints: 10 req/min
// Auth endpoints: 5 req/min
```

### CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### Request Size Limits
- JSON body: 10MB max
- File uploads: 5MB max per file
- Reject oversized requests

## Data Privacy

### Encryption
- All data encrypted at rest (Supabase default)
- Use HTTPS only in production
- Encrypt sensitive fields (if needed)

### PII Handling
- Never log PII (emails, names, DOB)
- Anonymize data in error reports
- GDPR compliance: data export, deletion

### Sharing Links
- Generate cryptographically secure tokens
- Implement expiration
- Allow revocation
- Audit access logs

## Environment Variables

### Required Secrets
```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLAUDE_API_KEY=
JWT_SECRET=
JWT_REFRESH_SECRET=
```

### Never Commit
- .env files to git
- API keys in code
- Database credentials
- Use .env.example for templates

## Error Handling

### Safe Error Messages
```typescript
// ❌ Bad
throw new Error(`User ${email} not found in database`);

// ✅ Good
throw new UnauthorizedException('Invalid credentials');
```

### Logging
- Log errors without PII
- Use structured logging
- Monitor for suspicious patterns
- Alert on repeated failures

## File Upload Security

### Validation
- Check file type (MIME type)
- Scan for malware (if possible)
- Limit file size
- Generate unique filenames

### Storage
- Use Supabase Storage with RLS
- Serve files through CDN
- Set proper access policies

## Dependencies

### Keep Updated
- Run `npm audit` regularly
- Update dependencies monthly
- Monitor security advisories
- Use Dependabot or Renovate

### Trusted Sources
- Only install from npm registry
- Review package before installing
- Check package popularity and maintenance

## Deployment Security

### Production Checklist
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] Error messages sanitized
- [ ] Logging configured
- [ ] Monitoring alerts set up

### Infrastructure
- Use managed services (Vercel, Railway)
- Enable DDoS protection
- Regular security audits
- Incident response plan

## Compliance

### GDPR Requirements
- Data export functionality
- Account deletion (hard delete option)
- Privacy policy
- Cookie consent
- Data processing agreements

### Data Retention
- Soft delete by default
- Hard delete on user request
- Backup retention: 30 days
- Audit logs: 90 days
