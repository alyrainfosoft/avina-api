import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Image from "./image.model";
import categoryData from "./category.model";
import Collection from "./master/attributes/collection.model";
import SettingTypeData from "./master/attributes/settingType.model";
import DiamondShape from "./master/attributes/diamondShape.model";
import BrandData from "./master/attributes/brands.model";
import MetalMaster from "./master/attributes/metal/metal-master.model";
import MetalTone from "./master/attributes/metal/metalTone.model";
import staticPageData from "./static_page.model";

const MegaMenu = dbContext.define("mega_menues", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  slug: {
    type: STRING,
  },
  title: {
    type: STRING,
  },
  sort_order: {
    type: INTEGER,
  },
  menu_type: {
    type: STRING,
  },
  target_type: {
    type: STRING,
  },
  id_image: {
    type: INTEGER,
  },
  id_parent: {
    type: INTEGER,
  },
  id_category: {
    type: INTEGER,
  },
  id_collection: {
    type: INTEGER,
  },
  id_brand: {
    type: INTEGER,
  },
  id_setting_type: {
    type: INTEGER,
  },
  id_diamond_shape: {
    type: INTEGER,
  },
  id_gender: {
    type: INTEGER,
  },
  id_metal_tone: {
    type: INTEGER,
  },
  id_metal: {
    type: INTEGER,
  },
  id_page: {
    type: INTEGER,
  },
  is_active: {
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
MegaMenu.hasOne(Image, {
  as: "image",
  foreignKey: "id",
  sourceKey: "id_image",
});

MegaMenu.hasOne(categoryData, {
  as: "category",
  foreignKey: "id",
  sourceKey: "id_category",
});
MegaMenu.hasOne(Collection, {
  as: "collection",
  foreignKey: "id",
  sourceKey: "id_collection",
});
MegaMenu.hasOne(SettingTypeData, {
  as: "style",
  foreignKey: "id",
  sourceKey: "id_setting_type",
});
MegaMenu.hasOne(DiamondShape, {
  as: "diamond_shape",
  foreignKey: "id",
  sourceKey: "id_diamond_shape",
});
MegaMenu.hasOne(BrandData, {
  as: "brand",
  foreignKey: "id",
  sourceKey: "id_brand",
});
MegaMenu.hasOne(MetalMaster, {
  as: "metal",
  foreignKey: "id",
  sourceKey: "id_metal",
});
MegaMenu.hasOne(MetalTone, {
  as: "metal_tone",
  foreignKey: "id",
  sourceKey: "id_metal_tone",
});
MegaMenu.hasOne(staticPageData, {
  as: "page",
  foreignKey: "id",
  sourceKey: "id_page",
});

export default MegaMenu;
