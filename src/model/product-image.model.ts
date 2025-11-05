import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
import dbContext from "../config/db-context";
import MetalTone from "./master/attributes/metal/metalTone.model";
import Product from "./product.model";

const ProductImage = dbContext.define("product_images", {
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
});

ProductImage.belongsTo(Product, { foreignKey: "id_product", as: "product" });

Product.hasMany(ProductImage, {
  foreignKey: "id_product",
  as: "product_images",
});

ProductImage.belongsTo(MetalTone, { foreignKey: "id_metal_tone", as: "metal_tones" });

MetalTone.hasMany(ProductImage, {
  foreignKey: "id_metal_tone",
  as: "product_images",
});

export default ProductImage;
