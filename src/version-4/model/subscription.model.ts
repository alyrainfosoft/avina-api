import { INTEGER, STRING, DATE } from "sequelize"
export const SubscriptionData = (dbContext: any) => {
    let subscriptionData = dbContext.define("subscriptions", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: STRING
        },
        is_subscribe: {
            type: STRING
        },
        modified_date: {
            type: DATE
        },
        modified_by: {
            type: INTEGER
        },
        created_date: {
            type: DATE,
        },
        company_info_id: {
            type: INTEGER
        },
        user_ip: {
            type: 'character varying',
        },
        user_country: {
            type: 'character varying',
        },
        user_location: {
            type: 'character varying',
        }
    });
    return subscriptionData;
}