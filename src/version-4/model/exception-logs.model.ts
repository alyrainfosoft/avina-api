import { BIGINT, DATE, INTEGER, JSON } from "sequelize";
export const ExceptionLogs = (dbContext: any) => {
    let exceptionLogs = dbContext.define("exception_logs", {
        id: {
            type: BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        request_body: {
            type: JSON
        },
        request_query: {
            type: JSON
        },
        request_param: {
            type: JSON
        },
        error: {
            type: JSON
        },
        created_date: {
            type: DATE
        },
        created_by: {
            type: INTEGER,
        },
        response: {
            type: JSON
        }
    });
    return exceptionLogs;
}