/**
 * Database Migration using Supabase Management API
 * 
 * Usage: node migrate-db.js
 */

const https = require('https');
const fs = require('fs');

require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const sql = fs.readFileSync('update-incidents-table.sql', 'utf8');

console.log('🚀 Applying database migration...\n');

// Use Supabase's database webhook/query endpoint
const postData = sql;

const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/query',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain',
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
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
      console.log('Please run the SQL manually:');
      console.log(`https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\nPlease run the SQL manually in Supabase dashboard:');
  console.log(`https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
  console.log('Copy the content from: update-incidents-table.sql');
});

req.write(postData);
req.end();
