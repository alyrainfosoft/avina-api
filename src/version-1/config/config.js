require("dotenv").config({ path: ".env" });
const configObject = {
    "username": process.env.DB_USER_NAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.SEQUELIZE_DIALECT,
    "port":process.env.DB_PORT,
    "dialectOptions": null

  }

    if(process.env.SSL_UNAUTHORIZED.toString() == "true"){
    configObject.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false // Use only for self-signed certs
      }
    };
  }
  
module.exports = {
  "development": configObject
}