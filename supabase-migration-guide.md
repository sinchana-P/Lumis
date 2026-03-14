# Supabase Migration Setup

## Option 1: Using Supabase CLI (Recommended)

### Install Supabase CLI
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link your project
```bash
supabase link --project-ref gfpetuqnyjxyrlxwzjes
```

### Create and run migration
```bash
# Create migration file
supabase migration new update_incidents_table

# Copy the SQL from update-incidents-table.sql to the generated migration file

# Push to database
supabase db push
```

## Option 2: Using Supabase Management API

If you have a Supabase access token, you can use the Management API to execute SQL.

### Get Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Add to .env: `SUPABASE_ACCESS_TOKEN=your_token`

### Run migration with Management API
```bash
node migrate-with-api.js
```

## Option 3: Direct Database Connection

If you have the database password, you can connect directly with psql:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.gfpetuqnyjxyrlxwzjes.supabase.co:5432/postgres" -f update-incidents-table.sql
```

## Which method did you use in mentor buddy?
