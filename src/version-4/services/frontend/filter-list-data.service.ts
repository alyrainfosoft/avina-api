import { Request } from "express";
import { Sequelize } from "sequelize";
import { getCompanyIdBasedOnTheCompanyKey, resSuccess } from "../../../utils/shared-functions";
import { ActiveStatus, DeletedStatus } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

export const diamondFilterListAPI = async (req: Request) => {
  try {
    const { DiamondCaratSize, ClarityData, Colors, ProductDiamondOption, DiamondGroupMaster } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }   
    let where = [{ is_deleted: DeletedStatus.No }, { is_active: ActiveStatus.Active },{ company_info_id: company_info_id?.data }];
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
      where: { is_deleted: DeletedStatus.No,company_info_id: company_info_id?.data },
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
          where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id: company_info_id?.data },
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
    const {DiamondShape, SettingTypeData, MetalTone,CategoryData, Collection,BrandData,Image} = initModels(req);
    
    let company_info_id: any = {};

    if (req?.body?.session_res?.client_id) {
      company_info_id.data = req.body.session_res.client_id;
    } else {
      const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);

      if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return decrypted;
      }

      company_info_id = decrypted;
    }

    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { company_info_id:company_info_id?.data },
    ];

    const diamondShapeData = await DiamondShape.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("diamond_shape_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "diamond_shape_image", attributes: [] }],
    });

    const settingStyleData = await SettingTypeData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("setting_type_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "setting_type_image", attributes: [] }],
    });

    const metalToneData = await MetalTone.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "id_metal",
        [Sequelize.literal("metal_tone_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "metal_tone_image", attributes: [] }],
      order: [["id", "ASC"]],
    });

    const categories = await CategoryData.findAll({
      where: [
        ...where,
      
      ],
      attributes: [
        "id",
        ["category_name", "name"],
        "slug",
        "parent_id",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const collection = await Collection.findAll({
      where,
      attributes: ["id", "name", "slug", "id_category"],
    });

    const brand = await BrandData.findAll({
      where,
      attributes: ["id", "name", "slug"],
    });

    return resSuccess({
      data: {
        diamondShapeData,
        settingStyleData,
        metalToneData,
        categories,
        collection,
        brand,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const categoryFilterListApI = async (req: Request) => {
  try {
    const { CategoryData } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { is_searchable: "1" },
      { company_info_id:company_info_id?.data },
    ];

    const category = await CategoryData.findAll({
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
    const { DiamondShape, ShanksData } = initModels(req);

    const diamondShapeList = await DiamondShape.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id: req?.body?.session_res?.client_id },
      attributes: ["id", "name", "slug", "sort_code", "is_diamond"],
    });

    const shankList = await ShanksData.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id: req?.body?.session_res?.client_id },
      attributes: ["id", "name", "slug", "sort_code"],
    });

    return resSuccess({ data: { diamondShapeList, shankList } });
  } catch (error) {
    throw error;
  }
};
