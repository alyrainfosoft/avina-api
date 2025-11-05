import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
import { MetalTone } from "./master/attributes/metal/metalTone.model";
import { Product } from "./product.model";
export const ProductImage = (dbContext: any) => {
  let productImage = dbContext.define("product_images", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: STRING,
      references: {
        model: Product,
        key: "id",
      },
    },
    id_metal_tone: {
      type: STRING,
      references: {
        model: MetalTone,
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
  return productImage;
}
