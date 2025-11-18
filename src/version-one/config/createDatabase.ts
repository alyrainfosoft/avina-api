
const { Client } = require('pg');
require("dotenv").config({ path: ".env" });


async function createDatabase() {
  const clientConfigObject = {
    user: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.SSL_UNAUTHORIZED === 'true' ? { rejectUnauthorized: false } : null,
    database: 'postgres', // Connect to 'postgres' to check if your DB exists
  };


const client = new Client(clientConfigObject);

  try {
    await client.connect();

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [ process.env.DB_NAME]);

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`✅ Database '${process.env.DB_NAME}' created successfully.`);
    } else {
      console.log(`✅ Database '${process.env.DB_NAME}' already exists.`);
    }
  } catch (err) {
    console.error('❌ Error creating database:', err);

  } finally {
    await client.end();
  }
}

createDatabase();
