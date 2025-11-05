import { DATE, DECIMAL, INTEGER, STRING } from "sequelize";
import dbContext from "../config/db-context";
import DiamondGroupMaster from "./master/attributes/diamond-group-master.model";
// import SettingCaratWeight from "./master/attributes/settingCaratWeight.model";
import Product from "./product.model";
import SettingType from "./master/attributes/settingType.model";

const ProductDiamondOption = dbContext.define("product_diamond_options", {
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
  id_diamond_group: {
    type: INTEGER,
    references: {
      model: DiamondGroupMaster,
      key: "id",
    },
  },
  id_type: {
    type: INTEGER,
  },
  id_setting: {
    type: INTEGER,
    references: {
      model: SettingType,
      key: "id",
    },
  },
  weight: {
    type: DECIMAL,
  },
  count: {
    type: INTEGER,
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
});

ProductDiamondOption.belongsTo(Product, {
  foreignKey: "id_product",
  as: "product",
});

Product.hasMany(ProductDiamondOption, {
  foreignKey: "id_product",
  as: "PDO",
});

ProductDiamondOption.belongsTo(SettingType, {
  foreignKey: "id_setting",
  as: "setting",
});

SettingType.hasMany(ProductDiamondOption, {
  foreignKey: "id_setting",
  as: "PDO",
});


ProductDiamondOption.belongsTo(DiamondGroupMaster, {
  foreignKey: "id_diamond_group",
  as: "rate",
});

DiamondGroupMaster.hasMany(ProductDiamondOption, {
  foreignKey: "id_diamond_group",
  as: "PDO",
});

export default ProductDiamondOption;
