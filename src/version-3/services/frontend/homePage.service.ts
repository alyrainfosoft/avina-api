import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import Banner from "../../model/banner.model";
import HomeAboutMain from "../../model/home-about/home-about-main.model";
import HomeAboutSub from "../../model/home-about/home-about-sub.model";
import Image from "../../model/image.model";
import {
  ActiveStatus,
  BANNER_TYPE,
  DeletedStatus,
  TEMPLATE_2_BANNER_TYPE,
  TemplateFiveSectionType,
  TemplateThreeSectionType,
} from "../../../utils/app-enumeration";
import { resSuccess } from "../../../utils/shared-functions";
import OurStory from "../../model/our-stories.model";
import TemplateTwoBanner from "../../model/template-2-banner.model";
import TemplateFiveData from "../../model/template-five.model";
import categoryData from "../../model/category.model";
import Collection from "../../model/master/attributes/collection.model";
import TemplateThreeData from "../../model/template-three.model";

export const getAllBanners = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: "1" },
      { banner_type: BANNER_TYPE.banner },
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "created_date",
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAll3MarketingBanners = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: "1" },
      { banner_type: BANNER_TYPE.marketing_banner },
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "created_date",
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllHomeAndAboutSection = async (req: Request) => {
  try {
    let where = [{ is_deleted: "0" }, { is_active: "1" }];
    const mainContentData = await HomeAboutMain.findAll({
      attributes: ["id", "sort_title", "title", "content", "created_date"],
    });
    const totalItems = await HomeAboutSub.count({
      where,
    });
    const result = await HomeAboutSub.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "content",
        "target_link",
        "button_name",
        "created_date",
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { mainContentData, totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllFeaturesSections = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: "1" },
      { banner_type: BANNER_TYPE.features_sections },
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "created_date",
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getMarketingPopup = async (req: Request) => {
  try {
    const currentDate = `${`${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}`;

    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: BANNER_TYPE.marketing_popup },
      { expiry_date: { [Op.gte]: currentDate } },
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "content",
        "button_name",
        "active_date",
        "expiry_date",
        "created_date",
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllOurStoryList = async (req: Request) => {
  try {
    let where = [{ is_deleted: "0" }, { is_active: "1" }];
    const totalItems = await OurStory.count({
      where,
    });
    const result = await OurStory.findAll({
      where,
      attributes: [
        "id",
        "title",
        "created_date",
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

//////////-------- Template Two Frontend API -------------- /////////////////////

export const getAllTemplateTwoBannersUser = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.banner },
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      attributes: [
        "id",
        ["name", "title"],
        "target_url",
        "content",
        "button_name",
        "banner_text_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoMarketingBannerUser = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.marketing_banner },
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      attributes: [
        "id",
        ["name", "title"],
        "target_link_two",
        "button_two_name",
        "sub_title",
        ["target_url", "target_url_one"],
        "content",
        ["button_name", "button_name_one"],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoFeaturesSectionsUser = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.features_sections },
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "name",
        "target_url",
        "content",
        "button_name",
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getTemplateTwoMarketingPopupUser = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.marketing_popup },
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      attributes: [
        "id",
        ["name", "title"],
        "target_url",
        "content",
        "button_name",
        "active_date",
        "expiry_date",
        "created_date",
        "created_by",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoHomeAboutBannersUser = async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.home_about_banner },
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      attributes: [
        "id",
        ["name", "title"],
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoHomeAboutFeatureSectionUser = async (
  req: Request
) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.home_about_features_section },
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "is_active",
        "content",
        "sub_title",
        "button_name",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoHomeAboutMarketingSectionUser = async (
  req: Request
) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section },
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      attributes: [
        "id",
        ["name", "title"],
        "is_active",
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

//////////-------- Template Three Frontend API -------------- /////////////////////

export const getTemplateThreeBanner = async (req: Request) => {
  try {
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.Banner },
    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "link",
        "is_active",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
export const getTemplateThreeCategorySection = async (req: Request) => {
  try {
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.CategorySection },
    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "link",
        "is_active",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
export const getTemplateThreeJewelrySection = async (req: Request) => {
  try {
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.JewelrySection },
    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "link",
        "is_active",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("title_image.image_path"), "title_image_path"],
        [Sequelize.literal("sub_image.image_path"), "Sub_image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "title_image", attributes: [] },
        { model: Image, as: "sub_image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
export const getTemplateThreeDiamondSection = async (req: Request) => {
  try {
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.DiamondSection },
    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "link",
        "is_active",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("sub_image.image_path"), "Sub_image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "sub_image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const getTemplateFiveProductModelForUser = async (req: Request) => {
  try {
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.ProductModel },
    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "link",
        "sort_order",
        "section_type",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const getTemplateThreeProductModelForUser = async (req: Request) => {
  try {
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateThreeSectionType.ProductModel },
    ];
    const result = await TemplateThreeData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "link",
        "sort_order",
        "section_type",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
