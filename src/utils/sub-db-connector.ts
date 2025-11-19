import { Dialect, QueryTypes } from "sequelize";
import dbContext from "../config/db-context";
import { prepareMessageFromParams, resNotFound } from "./shared-functions";
import { ERROR_NOT_FOUND } from "./app-messages";
import { Product } from "../version-one/model/product.model";
import { CategoryData } from "../version-one/model/category.model";
import { ProductCategory } from "../version-one/model/product-category.model";
const { Sequelize } = require('sequelize');

const subDBCache = {};

async function getSubSequelize(customerKey:any, trn?:any) {
 

  console.log('customerKey', customerKey);
  if (subDBCache[customerKey]) {
  console.log('OLD Connection');
    return subDBCache[customerKey]; // Reuse connection if already exists
  } 

  let customerInfo: any
  if (!customerKey || customerKey == "" || customerKey == "null" || customerKey == "undefined" || customerKey == undefined || customerKey == null) { 
     customerInfo = await dbContext.query('SELECT id,key,db_name,db_ssl_unauthorized,db_user_name,db_password,db_host,db_dialect,db_port FROM company_infoes ORDER BY ID ASC LIMIT 1', { type: QueryTypes.SELECT, transaction: trn });
      customerInfo = customerInfo[0];
  } else {
    customerInfo = await dbContext.query('SELECT id,key,db_name,db_ssl_unauthorized,db_user_name,db_password,db_host,db_dialect,db_port FROM company_infoes WHERE key = :key', { replacements: { key: customerKey }, type: QueryTypes.SELECT, transaction: trn });
if (!customerInfo || customerInfo.length <= 0) {
      customerInfo = await dbContext.query('SELECT id,key,db_name,db_ssl_unauthorized,db_user_name,db_password,db_host,db_dialect,db_port FROM company_infoes ORDER BY ID ASC LIMIT 1', { type: QueryTypes.SELECT, transaction: trn });
      customerInfo = customerInfo[0];
    } else {
      customerInfo = customerInfo[0];
    }
  }

  const subSequelize = customerInfo.db_ssl_unauthorized.toString() == "true"
      ? new Sequelize(customerInfo.db_name, customerInfo.db_user_name, customerInfo.db_password, {
          host: customerInfo.db_host,
          dialect: customerInfo.db_dialect as Dialect,
          port: Number(customerInfo.db_port),
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
            // useUTC: false, //for reading from database
        }
      //   pool: {
      //   max: 10,
      //   min: 0,
      //   acquire: 30000,
      //   idle: 300000,
      //  evict: 300000,
      //   }
      })
      : new Sequelize(customerInfo.db_name, customerInfo.db_user_name, customerInfo.db_password, {
          host: customerInfo.db_host,
          dialect: customerInfo.db_dialect as Dialect,
          port: Number(customerInfo.db_port),
          define: {
            timestamps: false, // I do not want timestamp fields by default (createdAt, updatedAt)
            freezeTableName: true, // To allow singular table name.  Sequelize will infer the table name to be equal to the model name, without any modifications
          },
          dialectOptions: {
            dateStrings: true,
            typeCast: true,
            // useUTC: false, //for reading from database
        }
        // pool: {
        //   max: 10,
        //   min: 0,
        //   acquire: 30000,
        //   idle: 300000,
        //   evict: 300000,
        // }
      })

  // Optionally test connection
  //await subSequelize.authenticate();

  subDBCache[customerKey] = subSequelize;
  return subSequelize;
}

export default  getSubSequelize;