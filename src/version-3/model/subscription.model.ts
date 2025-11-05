import { INTEGER, STRING, DATE } from "sequelize"
import dbContext from "../../config/db-context";

const SubscriptionData = dbContext.define("subscriptions", {
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



export default SubscriptionData;