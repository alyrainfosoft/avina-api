import { DATE, DECIMAL, INTEGER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import BirthStoneProduct from "./birth-stone-product.model";
import DiamondGroupMaster from "../master/attributes/diamond-group-master.model";


const BirthstoneProductEngraving = dbContext.define("birthstone_product_engravings", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_product: {
    type: INTEGER
  },
  text: {
    type: STRING
  },
  max_text_count: {
    type: INTEGER
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

BirthstoneProductEngraving.belongsTo(BirthStoneProduct, {
  foreignKey: "id_product",
  as: "product",
});

BirthStoneProduct.hasMany(BirthstoneProductEngraving, {
  foreignKey: "id_product",
  as: "engravings",
});


export default BirthstoneProductEngraving;
