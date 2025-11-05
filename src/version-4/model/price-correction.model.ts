import { DATE, INTEGER } from "sequelize";

export const PriceCorrection = (dbContext: any) => {
  let priceCorrection = dbContext.define("price_corrections", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER
      },
      round_off: {
        type: INTEGER
      },
      product_type: {
        type: 'price_correction_product_type'
      },
      created_date: {
        type: DATE
      },
      modified_date: {
        type: DATE
      },
      company_info_id: {
        type: INTEGER
      },
      is_active: {
        type: 'bit'
      },
      created_by: {
        type: INTEGER,
        references: {
          model: 'app_users',
          key: 'id'
        }
      },
      modified_by: {
        type: INTEGER,
        references: {
          model: 'app_users',
          key: 'id'
        }
      }
    });
  return priceCorrection
};
