import { DATE, FLOAT, INTEGER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import Image from "../../image.model";
import DiamondShape from "./diamondShape.model";
import Gemstones from "./gemstones.model";
import MMSize from "./mmSize.model";
import ClarityData from "./clarity.model";
import Colors from "./colors.model";
import CutsData from "./cuts.model";

const DiamondGroupMaster = dbContext.define("diamond_group_masters", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
  },
  id_stone: {
    type: INTEGER,
  },
  id_shape: {
    type: INTEGER,
    references: {
      model: DiamondShape,
      key: "id",
    }
  },
  id_mm_size: {
    type: INTEGER,
  },
  id_color: {
    type: INTEGER,
  },
  id_clarity: {
    type: INTEGER,
  },
  id_cuts: {
    type: INTEGER,
  },
  rate: {
    type: FLOAT,
  },
  is_active: {
    type: STRING,
  },
  created_date: {
    type: DATE,
  },
  modified_date: {
    type: DATE,
  },
  created_by: {
    type: INTEGER,
  },
  modified_by: {
    type: INTEGER,
  },
  is_deleted: {
    type: STRING,
  },
  id_image: {
    type: INTEGER
},
});

DiamondGroupMaster.hasOne(Image, { as: "image", foreignKey: "id", sourceKey: "id_image" });
DiamondGroupMaster.hasOne(Gemstones, { as: "stones", foreignKey: "id", sourceKey: "id_stone" });
DiamondGroupMaster.hasOne(MMSize, { as: "mm_size", foreignKey: "id", sourceKey: "id_mm_size" });
DiamondGroupMaster.hasOne(ClarityData, { as: "clarity", foreignKey: "id", sourceKey: "id_clarity" });
DiamondGroupMaster.hasOne(Colors, { as: "colors", foreignKey: "id", sourceKey: "id_color" });
DiamondGroupMaster.hasOne(CutsData, { as: "cuts", foreignKey: "id", sourceKey: "id_cuts" });


DiamondGroupMaster.belongsTo(DiamondShape, {
  foreignKey: "id_shape",
  as: "shapes",
});

DiamondShape.hasMany(DiamondGroupMaster, {
  foreignKey: "id_shape",
  as: "diamond_shapes",
});

export default DiamondGroupMaster;
