import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import CityData from "./master/city.model";

const UserAddress = dbContext.define("addresses", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
        type: INTEGER,
    },
    full_name: {
      type: STRING
    },
    house_building: {
      type: STRING,
    },
    area_name: {
      type: STRING,
    },
    pincode: {
        type: STRING,
    },
    city_id: {
        type: INTEGER,
    },
    state_id: {
        type: INTEGER,
    },
    country_id: {
        type: INTEGER,
    },
    address_type: {
      type: SMALLINT,
    },
    phone: {
        type: INTEGER,
    },
    default_addres: {
      type: STRING,
    },
    is_deleted: {
      type: STRING,
    },
    created_date: {
      type: DATE,
    },
    modified_date: {
      type: DATE,
    },

  });
  UserAddress.belongsTo(CityData, { foreignKey: "city_id", as: "city" });
  export default UserAddress