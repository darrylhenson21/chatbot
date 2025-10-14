const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.rfeklguhprnaindgoygt:9ngPH6k2lPnFUpCt@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function init() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful!');
    console.log('Time:', result.rows[0].now);
    
    console.log('\nChecking if tables exist...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'bots', 'sessions', 'chunks')
    `);
    
    if (tables.rows.length > 0) {
      console.log('✓ Tables found:', tables.rows.map(r => r.table_name).join(', '));
      
      // Check for accounts
      const accountCheck = await pool.query('SELECT COUNT(*) as count FROM accounts');
      console.log('✓ Accounts:', accountCheck.rows[0].count);
      
    } else {
      console.log('✗ No tables found. Initializing database...');
      
      // Read and execute schema
      const schema = fs.readFileSync('/app/database/schema.sql', 'utf-8');
      await pool.query(schema);
      
      console.log('✓ Database initialized successfully!');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

init();
