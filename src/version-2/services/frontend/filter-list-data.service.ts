import { Request } from "express";
import { Sequelize } from "sequelize";
import categoryData from "../../model/category.model";
import Image from "../../model/image.model";
import DiamondCaratSize from "../../model/master/attributes/caratSize.model";
import ClarityData from "../../model/master/attributes/clarity.model";
import Colors from "../../model/master/attributes/colors.model";
import DiamondGroupMaster from "../../model/master/attributes/diamond-group-master.model";
import DiamondShape from "../../model/master/attributes/diamondShape.model";
import MetalTone from "../../model/master/attributes/metal/metalTone.model";
import SettingTypeData from "../../model/master/attributes/settingType.model";
import ProductDiamondOption from "../../model/product-diamond-option.model";
import Product from "../../model/product.model";
import { resSuccess } from "../../../utils/shared-functions";
import { ActiveStatus } from "../../../utils/app-enumeration";
import ShanksData from "../../model/master/attributes/shanks.model";
import MetalMaster from "../../model/master/attributes/metal/metal-master.model";

export const diamondFilterListAPI = async (req: Request) => {
  try {
    let where = [{ is_deleted: "0" }, { is_active: "1" }];
    const caratWeightData = await DiamondCaratSize.findAll({
      where,
      order: [["value", "ASC"]],
      attributes: ["id", "value", "slug", "sort_code"],
    });

    const clarityData = await ClarityData.findAll({
      where,

      attributes: ["id", "value", "name", "slug"],
    });

    const colorData = await Colors.findAll({
      where,

      attributes: ["id", "value", "name", "slug"],
    });

    const price = await ProductDiamondOption.findAll({
      where: { is_deleted: "0" },
      attributes: [
        "id",
        "id_product",
        "id_diamond_group",
        "weight",
        [Sequelize.literal("rate.rate*weight"), "finalRate"],
      ],
      order: [["finalRate", "ASC"]],
      include: [
        {
          required: false,
          model: DiamondGroupMaster,
          as: "rate",
          attributes: [],
          where: { is_deleted: "0", is_active: "1" },
        },
      ],
    });

    const maxPrice = price.map((value) => value.dataValues.finalRate);

    return resSuccess({
      data: {
        caratWeight: caratWeightData,
        colorData,
        clarityData,
        minPrice: Math.min(...maxPrice),
        maxPrice: Math.max(...maxPrice),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const metalFilterListAPI = async (req: Request) => {
  try {
    let where = [{ is_deleted: "0" }, { is_active: "1" }];

    const diamondShapeData = await DiamondShape.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const settingStyleData = await SettingTypeData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const metalToneData = await MetalTone.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "id_metal",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
      order: [["id", "ASC"]],
    });

    const categories = await categoryData.findAll({
      where,
      attributes: ["id", ["category_name", "name"], "slug", "parent_id"],
    });

    return resSuccess({
      data: { diamondShapeData, settingStyleData, metalToneData, categories },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const categoryFilterListApI = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: "1" },
      { is_searchable: "1" },
    ];

    const category = await categoryData.findAll({
      where,
      attributes: ["id", "category_name", "parent_id", "slug", "position"],
    });

    return resSuccess({ data: category });
  } catch (error) {
    throw error;
  }
};

export const configMasterDropDown = async (req: Request) => {
  try {
    const diamondShapeList = await DiamondShape.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: "0" },
      attributes: ["id", "name", "slug", "sort_code", "is_diamond"],
    });

    const shankList = await ShanksData.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: "0" },
      attributes: ["id", "name", "slug", "sort_code"],
    });

    return resSuccess({ data: { diamondShapeList, shankList } });
  } catch (error) {
    throw error;
  }
};
