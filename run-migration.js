/**
 * Database Migration Runner
 * Executes SQL migrations using Supabase REST API
 * 
 * Usage: node run-migration.js <migration-file.sql>
 * Example: node run-migration.js update-incidents-table.sql
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

// Get migration file from command line argument
const migrationFile = process.argv[2] || 'update-incidents-table.sql';

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

// Read SQL file
const sql = fs.readFileSync(migrationFile, 'utf8');

// Extract project reference from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

console.log('🚀 Running database migration...\n');
console.log(`📄 File: ${migrationFile}`);
console.log(`🔗 Project: ${projectRef}\n`);

// Prepare the request
const postData = JSON.stringify({ query: sql });

const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Prefer': 'return=representation'
  }
};

// Try alternative approach using pg_stat_statements
const alternativeOptions = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
  }
};

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

console.log(`📊 Found ${statements.length} SQL statements\n`);

let successCount = 0;
let errorCount = 0;

// Execute each statement using fetch-like approach
async function executeStatement(statement, index) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query: statement + ';' });
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ Statement ${index + 1}: Success`);
          successCount++;
        } else {
          console.log(`⚠️  Statement ${index + 1}: ${res.statusCode} - ${data}`);
          errorCount++;
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Statement ${index + 1}: ${error.message}`);
      errorCount++;
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

// Execute all statements sequentially
async function runMigration() {
  for (let i = 0; i < statements.length; i++) {
    await executeStatement(statements[i], i);
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Migration completed!');
  console.log(`   Successful: ${successCount}`);
  console.log(`   Errors: ${errorCount}\n`);
  
  if (errorCount === statements.length) {
    console.log('⚠️  All statements failed. This might be because:');
    console.log('   1. The exec_sql function is not available');
    console.log('   2. You need to run the SQL directly in Supabase dashboard\n');
    console.log('📋 Copy the SQL from the file and paste it here:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
  }
}

runMigration();
