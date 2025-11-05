'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

  sequelize = process.env.SSL_UNAUTHORIZED.toString() == "true"
      ? new Sequelize(process.env.DB_NAME, process.env.DB_USER_NAME, process.env.DB_PASSWORD, {
          host: process.env.DB_HOST,
          dialect: process.env.SEQUELIZE_DIALECT,
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
            // useUTC: false, //for reading from database
          },
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
            // useUTC: false, //for reading from database
          },
        });


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
