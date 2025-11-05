import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Action from "./action.model";

const RolePermissionAccess = dbContext.define("role_permission_accesses", {
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
});

export default RolePermissionAccess;

RolePermissionAccess.belongsTo(Action, {
  foreignKey: 'id_action',
  as: 'action', // Alias for the relationship
});

Action.hasMany(RolePermissionAccess, {
  foreignKey: 'id_action',
});