import { INTEGER, STRING, DATE, TEXT } from "sequelize";

export const CurrencyData = (dbContext: any) => {
  let currencyData = dbContext.define("currency_rates", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    currency: {
      type: STRING,
      allowNull: false,
    },
    rate: {
      type: STRING,
      allowNull: false,
    },
    created_date: {
      type: DATE,
      allowNull: false,
    },
    modified_date: {
      type: DATE,
    },
    created_by: {
      type: INTEGER,
      allowNull: false,
    },
    modified_by: {
      type: INTEGER,
    },
    is_active: {
      type: STRING,
      allowNull: false,
    },
    is_deleted: {
      type: STRING,
    },
    is_default: {
      type: STRING,
    },
    symbol_placement: {
      type: STRING,
    },
    symbol: {
      type: STRING,
    },
    code: {
      type: STRING,
    },
    thousand_token: {
      type: STRING,
    },
    is_use_api: {
      type: STRING,
    },
    exchange_rate_type: {
      type: STRING,
    },
    api_url: {
      type: STRING,
    },
    api_key: {
      type: STRING,
    },
    company_info_id: {
      type: INTEGER
    }
  });
  return currencyData;
}
