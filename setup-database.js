const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://gfpetuqnyjxyrlxwzjes.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcGV0dXFueWp4eXJseHd6amVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxOTg5MCwiZXhwIjoyMDg4ODk1ODkwfQ.SYihCQXj1CNOLmdyIrG0kSnV_PDTa8Epx4LcwfKbbeo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read the SQL file
    const sql = fs.readFileSync('database-setup.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error setting up database:', error);
      return;
    }
    
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Failed to setup database:', err.message);
  }
}

setupDatabase();