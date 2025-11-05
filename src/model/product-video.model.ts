import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
import dbContext from "../config/db-context";
import MetalTone from "./master/attributes/metal/metalTone.model";
import Product from "./product.model";

const ProductVideo = dbContext.define("product_videos", {
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
  video_path: {
    type: STRING,
  },
  video_type: {
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

ProductVideo.belongsTo(Product, { foreignKey: "id_product", as: "product" });

Product.hasMany(ProductVideo, {
  foreignKey: "id_product",
  as: "product_videos",
});

export default ProductVideo;
