const fs = require('fs');
const path = require('path');
const { Sequelize, QueryInterface } = require('sequelize');
require("dotenv").config({ path: ".env" });

// Set your DB config here
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER_NAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.SEQUELIZE_DIALECT,
  port: process.env.DB_PORT,
});

// Get the queryInterface for use in seeders
const queryInterface = sequelize.getQueryInterface();

async function getExecutedSeeders() {
  const [results] = await sequelize.query('SELECT name FROM "SeederMeta"');
  return results.map(record => record.name);
}

async function runSeeder(file, executedSeeders) {
  const seederPath = path.join(__dirname, '../src/version-4/seeders', file);
  if (!fs.existsSync(seederPath)) {
    console.warn(`❌ Seeder file not found: ${file}`);
    return;
  }

  if (executedSeeders.includes(file)) {
    console.log(`⏭️  Skipping already executed: ${file}`);
    return;
  }

  const seeder = require(seederPath);

  if (typeof seeder.up === 'function') {
    console.log(`▶️  Running seeder: ${file}`);
    // Pass the queryInterface to the seeder
    await seeder.up(queryInterface, Sequelize);
    await sequelize.query(`
      INSERT INTO "SeederMeta" (name, executed_at)
      VALUES ('${file}', NOW())`
    );
    console.log(`✅ Finished: ${file}`);
  } else {
    console.warn(`⚠️  No 'up' function in: ${file}`);
  }
}

async function run() {
  const args = process.argv.slice(2);
  const flag = args[0];
  const fileArg = args[1];

  const seedersDir = path.join(__dirname, '../src/version-4/seeders');
  const allFiles = fs.readdirSync(seedersDir);
  const executedSeeders = await getExecutedSeeders();

  let seedersToRun = [];

  if (flag === '--all') {
    seedersToRun = allFiles;
  } else if (flag === '--only' && fileArg) {
    seedersToRun = [fileArg];
  } else {
    // Default: run only pending seeders
    seedersToRun = allFiles.filter(file => !executedSeeders.includes(file));
  }

  for (const file of seedersToRun) {
    await runSeeder(file, executedSeeders);
  }

  console.log('🎉 Seeder execution complete.');
}

run().catch(err => {
  console.error('❌ Error running seeders:', err);
  process.exit(1);
});
