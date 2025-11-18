import { BIGINT, DATE, DOUBLE, INTEGER, NUMBER, STRING } from "sequelize";
import { AppUser } from "./app-user.model";
export const CouponData = (dbContext: any) => {
  let couponData = dbContext.define("coupons", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING,
    },
    description: {
      type: STRING,
    },
    coupon_code: {
      type: STRING,
    },
    discount_type: {
      type: STRING,
    },
    percentage_off: {
      type: STRING,
    },
    discount_amount: {
      type: DOUBLE,
    },
    discount_amount_currency: {
      type: STRING,
    },
    duration: {
      type: STRING,
    },
    usage_limit: {
      type: NUMBER,
    },
    min_total_amount: {
      type: NUMBER,
    },
    max_total_amount: {
      type: NUMBER,
    },
    maximum_discount_amount: {
      type: NUMBER,
    },
    start_date: {
      type: DATE,
    },
    end_date: {
      type: DATE,
    },
    user_id: {
      type: INTEGER,
    },
    is_active: {
      type: STRING,
    },
    is_deleted: {
      type: STRING,
    },
    deleted_by: {
      type: INTEGER,
    },
    deleted_date: {
      type: DATE,
    },
    created_by: {
      type: INTEGER,
    },
    created_date: {
      type: DATE,
    },
    updated_by: {
      type: INTEGER,
    },
    updated_date: {
      type: DATE,
    },
    user_limits: {
      type: BIGINT,
    },
    company_info_id: {
      type: INTEGER
    }
  });
  return couponData;
}
