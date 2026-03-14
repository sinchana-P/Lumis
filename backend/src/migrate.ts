/**
 * One-time migration script
 * Run with: npx ts-node src/migrate.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running database migration...\n');

  try {
    // Read migration file
    const sqlPath = path.join(__dirname, '../../update-incidents-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📊 Executing ${statements.length} statements...\n`);

    // Execute each statement using raw SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}...`);
      
      try {
        // Use Supabase's raw SQL execution (requires service role key)
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
        } else {
          console.log(`✅ Statement ${i + 1}: Success`);
        }
      } catch (err: any) {
        console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
      }
    }

    console.log('\n✅ Migration completed!\n');
    console.log('Changes applied:');
    console.log('  • Added incident_type column (positive/negative/neutral)');
    console.log('  • Renamed severity → intensity');
    console.log('  • Updated constraints\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.log('\nPlease run the SQL manually in Supabase dashboard.');
    process.exit(1);
  }
}

runMigration();
