import { BIGINT, DATE, DECIMAL, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import MetalGroupMaster from "./master/attributes/metal/metal-group-master.model";
import Product from "./product.model";
import MetalMaster from "./master/attributes/metal/metal-master.model";
import GoldKarat from "./master/attributes/metal/gold-karat.model";
import MetalTone from "./master/attributes/metal/metalTone.model";

const ProductMetalOption = dbContext.define("product_metal_options", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_product: {
    type: INTEGER,
    references: {
      model: Product,
      key: "id",
    },
  },
  id_metal_group: {
    type: INTEGER,
    references: {
      model: MetalGroupMaster,
      key: "id",
    },
  },
  metal_weight: {
    type: DECIMAL,
  },
  is_default: {
    type: STRING,
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
  id_metal: {
    type: INTEGER,
  },
  id_metal_tone: {
    type: STRING,
  },
  id_karat: {
    type: INTEGER,
  },
  retail_price: {
    type: DOUBLE,
  },
  compare_price: {
    type: DOUBLE,
  },
  id_size: {
    type: INTEGER,
  },
  id_length: {
    type: INTEGER,
  },
  quantity: {
    type: BIGINT,
  },
  side_dia_weight: {
    type: DOUBLE,
  },
  side_dia_count: {
    type: BIGINT,
  },
  remaing_quantity_count: {
    type: BIGINT,
  },
  id_m_tone: {
    type: INTEGER,
  },
  center_diamond_price: {
    type: DOUBLE,
  },
});

ProductMetalOption.belongsTo(Product, {
  foreignKey: "id_product",
  as: "product",
});
Product.hasMany(ProductMetalOption, {
  foreignKey: "id_product",
  as: "PMO",
});

ProductMetalOption.belongsTo(MetalMaster, {
  foreignKey: "id_metal",
  as: "metal_master",
});
MetalMaster.hasMany(ProductMetalOption, {
  foreignKey: "id_metal",
  as: "PMO",
});

ProductMetalOption.belongsTo(GoldKarat, {
  foreignKey: "id_karat",
  as: "metal_karat",
});
GoldKarat.hasMany(ProductMetalOption, {
  foreignKey: "id_karat",
  as: "PMO",
});

export default ProductMetalOption;
