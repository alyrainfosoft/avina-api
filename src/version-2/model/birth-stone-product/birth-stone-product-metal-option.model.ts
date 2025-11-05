import { DATE, DECIMAL, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import BirthStoneProduct from "./birth-stone-product.model";
import MetalGroupMaster from "../master/attributes/metal/metal-group-master.model";
import MetalMaster from "../master/attributes/metal/metal-master.model";
import GoldKarat from "../master/attributes/metal/gold-karat.model";

const BirthstoneProductMetalOption = dbContext.define(
  "birthstone_product_metal_options",
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: INTEGER,
      references: {
        model: BirthStoneProduct,
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
    plu_no: {
      type: STRING,
    },
    price: {
      type: DOUBLE,
    },
  }
);

BirthstoneProductMetalOption.belongsTo(BirthStoneProduct, {
  foreignKey: "id_product",
  as: "product",
});
BirthStoneProduct.hasMany(BirthstoneProductMetalOption, {
  foreignKey: "id_product",
  as: "birthstone_PMO",
});

BirthstoneProductMetalOption.belongsTo(MetalMaster, {
  foreignKey: "id_metal",
  as: "metal_master",
});
MetalMaster.hasMany(BirthstoneProductMetalOption, {
  foreignKey: "id_metal",
  as: "birthstone_PMO",
});

BirthstoneProductMetalOption.belongsTo(GoldKarat, {
  foreignKey: "id_karat",
  as: "metal_karat",
});
GoldKarat.hasMany(BirthstoneProductMetalOption, {
  foreignKey: "id_karat",
  as: "birthstone_PMO",
});

export default BirthstoneProductMetalOption;
