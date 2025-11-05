import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
import { CityData } from "./master/city.model";
import { StateData } from "./master/state.model";
import { CountryData } from "./master/country.model";
export const UserAddress = (dbContext: any) => {
  let userAddress = dbContext.define("addresses", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
    },
    full_name: {
      type: STRING,
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
    company_info_id: {
      type: INTEGER
    }
  });

  return userAddress;
}
