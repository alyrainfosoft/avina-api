const { Sequelize,  } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
require("dotenv").config({ path: ".env" });

const migratedDBs = new Set();
(async () => {
    const dbContext =
      process.env.SSL_UNAUTHORIZED.toString() == "true"
        ? new Sequelize(process.env.DB_NAME, process.env.DB_USER_NAME, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: process.env.SEQUELIZE_DIALECT,
            port: Number(process.env.DB_PORT),
            define: {
              timestamps: false, // I do not want timestamp fields by default (createdAt, updatedAt)
              freezeTableName: true, // To allow singular table name.  Sequelize will infer the table name to be equal to the model name, without any modifications
            },
            dialectOptions: {
              ssl: {
                rejectUnauthorized: false,
              },
              dateStrings: true,
              typeCast: true,
              keepAlive: true,
              // useUTC: false, //for reading from database
          }
          })
        : new Sequelize(process.env.DB_NAME, process.env.DB_USER_NAME, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: process.env.SEQUELIZE_DIALECT,
            port: Number(process.env.DB_PORT),
            define: {
              timestamps: false, // I do not want timestamp fields by default (createdAt, updatedAt)
              freezeTableName: true, // To allow singular table name.  Sequelize will infer the table name to be equal to the model name, without any modifications
          },
            dialectOptions: {
              dateStrings: true,
              typeCast: true,
              keepAlive: true,
              // useUTC: false, //for reading from database
          }
        }) 
    const clientList = await dbContext.query(
      "SELECT * FROM company_infoes",
      { type: Sequelize.QueryTypes.SELECT }
  );
  console.log("----------------------------", clientList)
  for (const client of clientList) {
    const { db_name, db_host, db_user_name,db_password,db_port,db_ssl_unauthorized,db_dialect} = client;
    const uniqueKey = `${db_host}:${db_name}`;

  if (migratedDBs.has(uniqueKey)) {
    console.log(`✅ Skipping already migrated DB at ${uniqueKey}`);
    continue;
  } else {
    migratedDBs.add(uniqueKey);
  }
    if (migratedDBs.has(db_name)) {
      console.log(`✅ Skipping already migrated DB: ${db_name}`);
      continue;
    }

     const sequelize = db_ssl_unauthorized.toString() == "true" ? new Sequelize(db_name, db_user_name, db_password, {
            host: db_host,
            dialect: db_dialect,
            port: Number(db_port),
            define: {
              timestamps: false, // I do not want timestamp fields by default (createdAt, updatedAt)
              freezeTableName: true, // To allow singular table name.  Sequelize will infer the table name to be equal to the model name, without any modifications
            },
            dialectOptions: {
              ssl: {
                rejectUnauthorized: false,
              },
              dateStrings: true,
              typeCast: true,
              keepAlive: true,
              // useUTC: false, //for reading from database
          }
          }) : new Sequelize(db_name, db_user_name, db_password, {
            host: db_host,
            dialect: db_dialect,
            port: Number(db_port),
            define: {
              timestamps: false, // I do not want timestamp fields by default (createdAt, updatedAt)
              freezeTableName: true, // To allow singular table name.  Sequelize will infer the table name to be equal to the model name, without any modifications
          },
            dialectOptions: {
              dateStrings: true,
              typeCast: true,
              keepAlive: true,
              // useUTC: false, //for reading from database
          }
        });
    console.log("first connection", sequelize)
                // await sequelize.authenticate();
               

    try {
      const filePathForMigrationsSeeder = ['src/version-4/migrations/*.js', 'src/version-4/seeders/*.js'];
      for (const file_path of filePathForMigrationsSeeder) { 
       const umzug = new Umzug({
                    migrations: {
                        glob: file_path,
                        resolve: ({ name, path, context }) => {
                            const migration = require(path);
                            return {
                                name,
                                up: async () => migration.up(context.queryInterface, context.Sequelize),
                                down: async () => migration.down(context.queryInterface, context.Sequelize),
                            };
                        },
                    },
                    context: {
                        queryInterface: sequelize.getQueryInterface(),
                        Sequelize: Sequelize, // pass Sequelize class
                    },
                    storage: new SequelizeStorage({ sequelize }),
                    logger: console,
                });
    
            await umzug.up();
      }

      migratedDBs.add(db_name);
    } catch (err) {
      console.error(`❌ Migration failed for ${client.key}: ${db_name}`, err.message);
    } finally {
      await sequelize.close();
    }
  }

})();
