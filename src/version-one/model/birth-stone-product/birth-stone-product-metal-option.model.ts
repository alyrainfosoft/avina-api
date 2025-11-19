import { DATE, DECIMAL, DOUBLE, INTEGER, STRING } from "sequelize";
import { BirthStoneProduct } from "./birth-stone-product.model";
import { MetalGroupMaster } from "../master/attributes/metal/metal-group-master.model";
import { MetalMaster } from "../master/attributes/metal/metal-master.model";
import { GoldKarat } from "../master/attributes/metal/gold-karat.model";



export const BirthstoneProductMetalOption = (dbContext: any) => {
  let birthstoneProductMetalOption = dbContext.define(
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
          model: BirthStoneProduct(dbContext),
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
      company_info_id: {
        type: INTEGER
      }
    }
  );

  return birthstoneProductMetalOption;
}
