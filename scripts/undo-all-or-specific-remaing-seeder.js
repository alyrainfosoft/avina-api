const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize instance (update if needed)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER_NAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.SEQUELIZE_DIALECT,
    port: process.env.DB_PORT,
  }
);

const queryInterface = sequelize.getQueryInterface();
const seedersDir = path.join(__dirname, '../src/version-4/seeders');

async function undoSeederFile(filename) {
  const seederPath = path.join(seedersDir, filename);

  if (!fs.existsSync(seederPath)) {
    console.error(`❌ Seeder not found: ${filename}`);
    return;
  }

  const [executed] = await sequelize.query(`
    SELECT name FROM "SeederMeta" WHERE name = '${filename}'
  `);

  if (!executed.length) {
    console.warn(`⚠️ Seeder not marked as executed: ${filename}`);
    return;
  }

  const seeder = require(seederPath);
  if (typeof seeder.down === 'function') {
    console.log(`⏪ Undoing seeder: ${filename}`);
    await seeder.down(queryInterface, Sequelize);
    await sequelize.query(`DELETE FROM "SeederMeta" WHERE name = '${filename}'`);
    console.log(`✅ Undone: ${filename}`);
  } else {
    console.warn(`⚠️ No "down" method in ${filename}`);
  }
}

async function undoAllSeeders() {
  const [executed] = await sequelize.query(`
    SELECT name FROM "SeederMeta" ORDER BY executed_at DESC
  `);

  for (const row of executed) {
    await undoSeederFile(row.name);
  }
}

async function run() {
  const args = process.argv.slice(2);
  const filename = args[0];

  try {
    if (filename) {
      await undoSeederFile(filename);
    } else {
      console.log('⏪ Undoing all executed seeders...');
      await undoAllSeeders();
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeder undo:', err);
    process.exit(1);
  }
}

run();
