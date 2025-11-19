import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
import { GiftSetProduct } from "./gift_set_product.model";
export const GiftSetProductImages = (dbContext: any) => {
  let giftSetProductImages = dbContext.define("gift_set_product_images", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: STRING,
      references: {
        model: GiftSetProduct(dbContext),
        key: "id",
      },
    },
    image_path: {
      type: STRING,
    },
    image_type: {
      type: SMALLINT,
    },
    is_deleted: {
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
    company_info_id: {
      type: INTEGER
    }
  });

  return giftSetProductImages;
}
