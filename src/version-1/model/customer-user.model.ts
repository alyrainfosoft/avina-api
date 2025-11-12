import { ARRAY, DATE, INTEGER, JSON, STRING } from "sequelize";
import {AppUser} from "./app-user.model";
import {Image} from "./image.model";
import {CountryData} from "./master/country.model";

export const CustomerUser = (dbContext: any) => {
  let customerUser = dbContext.define("customer_users", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: STRING,
  },
  email: {
    type: STRING,
  },
  mobile: {
    type: STRING,
  },
  country_id: {
    type: INTEGER,
  },
  id_image: {
    type: INTEGER,
  },
  is_active: {
    type: STRING,
    allowNull: false,
  },
  created_date: {
    type: DATE,
  },
  modified_date: {
    type: DATE,
  },
  created_by: {
    type: INTEGER,
  },
  modified_by: {
    type: INTEGER,
  },
  is_deleted: {
    type: STRING,
  },
  id_app_user: {
    type: INTEGER,
  },
  sign_up_type: {
    type: STRING,
  },
  third_party_response: {
    type: JSON,
  },
  gender: {
    type: STRING,
  },
  company_info_id :{ 
    type:INTEGER
  }
});
  return customerUser;
}
