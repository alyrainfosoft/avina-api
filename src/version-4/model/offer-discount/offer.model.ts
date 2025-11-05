import { ARRAY, DATE, DECIMAL, INTEGER, STRING, TEXT, TIME } from "sequelize";

export const Offers = (dbContext: any) => {
   const offers = dbContext.define('offers', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      offer_type: {
        type: STRING,
        allowNull: false,
      },
      offer_name: {
        type: STRING,
        allowNull: false,
      },
      coupon_code:{
        type:STRING
      },
      method:{
        type:STRING
      },
      product_type:{
        type: STRING,
        allowNull: false,
      },
      description: {
        type: TEXT,
      },
      image: {
        type: STRING,
        allowNull: true,
      },
      link: {
        type: STRING,
        allowNull: true,
      },
      discount: {
        type: DECIMAL(10, 2),
        allowNull: true,
      },
      discount_type: {
        type: STRING,
        allowNull: true,
      },
      maximum_discount_amount: {
        type: DECIMAL(10, 2),
      },
      per_user_usage_limit: {
        type: STRING,
        allowNull: true,
      },
      total_number_of_usage_limit: {
        type: STRING,
        allowNull: true,
      },
      all_user: {
        type: STRING,
        defaultValue: '0',
      },
      specific_user_segments: {
        type: STRING,
        defaultValue: '0',
      },
      specific_user: {
        type: STRING,
        defaultValue: '0',
      },
      start_date: {
        type: DATE,
      },
      start_time: {
        type: TIME,
      },
      every_week_count: {
        type: INTEGER,
        allowNull: true,
      },
      day_start_time: {
        type: TIME,
        allowNull: true,
      },
      day_end_time: {
        type: TIME,
        allowNull: true,
      },
      days: {
        type: ARRAY(INTEGER),
      },
      end_date: {
        type: DATE,
        allowNull: true,
      },
      end_time: {
        type: TIME,
        allowNull: true,
      },
      product_type_offer_combination: {
        type: STRING,
        defaultValue: '0',
      },
      order_type_offer_combination: {
        type: STRING,
        defaultValue: '0',
      },
      is_active: {
        type: STRING,
        defaultValue: '1',
      },
      is_deleted: {
        type: STRING,
        defaultValue: '0',
      },
      created_at: {
        type: DATE,
        allowNull: true,
      },
      updated_at: {
        type: DATE,
        allowNull: true,
      },
      created_by: {
        type: INTEGER,
      },
      updated_by: {
        type: INTEGER,
      },
      cart_total_amount: {
        type: DECIMAL(10, 0),
      },
      cart_total_quantity: {
        type: INTEGER,
        allowNull: true,
      },
      bxgy_customer_buys_quantity:{
        type:INTEGER
      },
      bxgy_customer_gets_quantity:{
        type:INTEGER
      },
      bxgy_discount_value_type:{
        type:STRING
      },
      bxgy_discount_value:{
        type:DECIMAL(10, 2),
      },
      bxgy_allocation_limit:{
        type:INTEGER
     },
     company_info_id: {
        type: INTEGER,
      }
    });

  return offers;
}