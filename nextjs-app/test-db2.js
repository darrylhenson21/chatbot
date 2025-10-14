const { Pool } = require('pg');

// Try direct connection (non-pooler)
const pool = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.rfeklguhprnaindgoygt',
  password: '9ngPH6k2lPnFUpCt',
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Testing direct connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Success!', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('✗ Error:', error.message);
    
    // Try alternative
    console.log('\nTrying transaction mode...');
    const pool2 = new Pool({
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      user: 'postgres.rfeklguhprnaindgoygt',
      password: '9ngPH6k2lPnFUpCt',
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      const result2 = await pool2.query('SELECT NOW()');
      console.log('✓ Transaction mode works!', result2.rows[0]);
      await pool2.end();
    } catch (error2) {
      console.error('✗ Transaction mode error:', error2.message);
      await pool2.end();
    }
  }
}

test();
