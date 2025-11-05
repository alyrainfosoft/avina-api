import { Dialect, Sequelize } from "sequelize";
import {
  DB_NAME,
  DB_USER_NAME,
  DB_PASSWORD,
  DB_HOST,
  SEQUELIZE_DIALECT,
  DB_PORT,
  SSL_UNAUTHORIZED,
} from "./env.var";

const dbContext =
  SSL_UNAUTHORIZED.toString() == "true"
    ? new Sequelize(DB_NAME, DB_USER_NAME, DB_PASSWORD, {
        host: DB_HOST,
        dialect: SEQUELIZE_DIALECT as Dialect,
        port: Number(DB_PORT),
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
      // pool: {
      //   max: 50,
      //   min: 0,
      //   acquire: 30000,
      //   idle: 10000,
      //   evict: 10000,
      //   }
      })
    : new Sequelize(DB_NAME, DB_USER_NAME, DB_PASSWORD, {
        host: DB_HOST,
        dialect: SEQUELIZE_DIALECT as Dialect,
        port: Number(DB_PORT),
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
    //  pool: {
    //     max: 50,
    //     min: 0,
    //     acquire: 30000,
    //     idle: 300000,
    //    evict: 300000,
    //     }
      })
export default dbContext;
