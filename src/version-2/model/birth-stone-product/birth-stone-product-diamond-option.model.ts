import { DATE, DECIMAL, INTEGER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import BirthStoneProduct from "./birth-stone-product.model";
import DiamondGroupMaster from "../master/attributes/diamond-group-master.model";


const BirthStoneProductDiamondOption = dbContext.define("birthstone_product_diamond_options", {
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
  id_stone: {
    type: INTEGER
  },
  id_shape: {
    type: INTEGER
  },
  id_clarity: {
    type: INTEGER
  },
  id_carat: {
    type: INTEGER
  },
  id_mm_size: {
    type: INTEGER
  },
  id_color: {
    type: INTEGER
  },
  id_cut: {
    type: INTEGER
  }
});

BirthStoneProductDiamondOption.belongsTo(BirthStoneProduct, {
  foreignKey: "id_product",
  as: "product",
});

BirthStoneProduct.hasMany(BirthStoneProductDiamondOption, {
  foreignKey: "id_product",
  as: "birthstone_PDO",
});

BirthStoneProductDiamondOption.belongsTo(DiamondGroupMaster, {
  foreignKey: "id_diamond_group",
  as: "bs_diamond_group",
});

DiamondGroupMaster.hasMany(BirthStoneProductDiamondOption, {
  foreignKey: "id_diamond_group",
  as: "birthstone_PDO",
});

export default BirthStoneProductDiamondOption;
