const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    // Check if column exists
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='nft_trees' and column_name='category';
    `);
    
    if (checkRes.rows.length === 0) {
      console.log('Adding category column to nft_trees...');
      await client.query(`ALTER TABLE nft_trees ADD COLUMN category VARCHAR(255) DEFAULT 'plantation';`);
      console.log('Column added successfully.');
    } else {
      console.log('Column already exists.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
