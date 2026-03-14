/**
 * Database Migration using Supabase Management API
 * Requires: SUPABASE_ACCESS_TOKEN in .env
 * 
 * Get token from: https://supabase.com/dashboard/account/tokens
 * 
 * Usage: node migrate-with-api.js
 */

const https = require('https');
const fs = require('fs');

require('dotenv').config({ path: './backend/.env' });

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = 'gfpetuqnyjxyrlxwzjes';

if (!accessToken) {
  console.error('❌ Missing SUPABASE_ACCESS_TOKEN in backend/.env');
  console.log('\n📝 To get an access token:');
  console.log('   1. Go to https://supabase.com/dashboard/account/tokens');
  console.log('   2. Generate a new token');
  console.log('   3. Add to backend/.env: SUPABASE_ACCESS_TOKEN=your_token\n');
  process.exit(1);
}

const sql = fs.readFileSync('update-incidents-table.sql', 'utf8');

console.log('🚀 Running migration via Management API...\n');

const postData = JSON.stringify({
  query: sql
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${accessToken}`,
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Migration applied successfully!\n');
      console.log('Changes:');
      console.log('  • Added incident_type column (positive/negative/neutral)');
      console.log('  • Renamed severity → intensity');
      console.log('  • Updated constraints\n');
    } else {
      console.log(`⚠️  Status: ${res.statusCode}`);
      console.log(`Response: ${data}\n`);
      
      if (res.statusCode === 401) {
        console.log('❌ Invalid access token. Please check:');
        console.log('   1. Token is correct in backend/.env');
        console.log('   2. Token has not expired');
        console.log('   3. Generate new token at: https://supabase.com/dashboard/account/tokens\n');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(postData);
req.end();
