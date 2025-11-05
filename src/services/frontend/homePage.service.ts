import { Request } from "express";
import { Sequelize } from "sequelize";
import Banner from "../../model/banner.model";
import HomeAboutMain from "../../model/home-about/home-about-main.model";
import HomeAboutSub from "../../model/home-about/home-about-sub.model";
import Image from "../../model/image.model";
import { BANNER_TYPE } from "../../utils/app-enumeration";
import { resSuccess } from "../../utils/shared-functions";

export const getAllBanners = async (req: Request) => {
    try {
          let where = [
            { is_deleted: "0" },
            { is_active: "1"},
            {banner_type: BANNER_TYPE.banner}

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
        return resSuccess({ data: {totalItems, result } })

    } catch (error) {
        throw error
    }

} 

export const getAll3MarketingBanners = async (req: Request) => {
    try {
          let where = [
            { is_deleted: "0" },
            { is_active: "1"},
            {banner_type: BANNER_TYPE.marketing_banner}

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
        return resSuccess({ data: {totalItems, result } })

    } catch (error) {
        throw error
    }

} 

export const getAllHomeAndAboutSection = async (req: Request) => {
    try {
          let where = [
            { is_deleted: "0" },
            { is_active: "1"},
          ];
          const mainContentData = await HomeAboutMain.findAll({
            attributes: [
                "id",
                "sort_title",
                "title",
                "content",
                "created_date"
            ]
          })
          const totalItems = await HomeAboutSub.count({
            where,
          });
          const result = await HomeAboutSub.findAll({
            where,
            order:[['sort_order', 'ASC']],
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
        return resSuccess({ data: {mainContentData,totalItems, result } })

    } catch (error) {
        throw error
    }

}

export const getAllFeaturesSections = async (req: Request) => {
    try {
          let where = [
            { is_deleted: "0" },
            { is_active: "1"},
            {banner_type: BANNER_TYPE.features_sections}

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
        return resSuccess({ data: {totalItems, result } })

    } catch (error) {
        throw error
    }

} 

export const getMarketingPopup =async (req: Request) => {
  try {
    let where = [
      { is_deleted: "0" },
      { is_active: "1"},
      {banner_type: BANNER_TYPE.marketing_popup}
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
  return resSuccess({ data: {totalItems, result } })

} catch (error) {
  throw error
}
}