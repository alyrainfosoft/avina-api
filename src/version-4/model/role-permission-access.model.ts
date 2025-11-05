import { DATE, INTEGER, STRING } from "sequelize";
import {Action} from "./action.model";

export const RolePermissionAccess = (dbContext: any) => {
  let rolePermissionAccess = dbContext.define("role_permission_accesses", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_role_permission: {
    type: INTEGER,
  },
  id_action: {
    type: INTEGER,
  },
  access: {
    type: STRING,
  },
  created_by: {
    type: INTEGER,
  },
  created_date: {
    type: DATE,
  },
  modified_by: {
    type: INTEGER,
  },
  modified_date: {
    type: DATE,
  },
  company_info_id :{ 
    type:INTEGER
  }
});
  return rolePermissionAccess;
}
