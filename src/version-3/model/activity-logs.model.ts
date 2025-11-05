import { BIGINT, DATE, INTEGER, JSON, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import AppUser from "../../model/app-user.model";

const ActivityLogs = dbContext.define("activity_logs", {
    id: {
        type: BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    log_type: {
        type: STRING,
    },
    activity_type: {
        type: STRING,
    },
    created_date: {
        type: DATE,
    },
    created_by: {
        type: INTEGER,
    },
    modified_by: {
        type: INTEGER,
    },
    modified_date: {
        type: DATE,
    },
    old_value_json: {
        type: JSON
    },
    updated_value_json: {
        type: JSON
    },
    ref_id: {
        type: INTEGER
    }
});

ActivityLogs.belongsTo(AppUser, { foreignKey: "modified_by", as: "User" });


export default ActivityLogs;