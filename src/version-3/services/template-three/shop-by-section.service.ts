import { Request } from "express";
import dbContext from "../../../config/db-context";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  TemplateThreeSectionType,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import TemplateThreeData from "../../model/template-three.model";
import Image from "../../model/image.model";
import { Op, Sequelize } from "sequelize";
import DiamondShape from "../../model/master/attributes/diamondShape.model";
import categoryData from "../../model/category.model";
import SettingTypeData from "../../model/master/attributes/settingType.model";
import Collection from "../../model/master/attributes/collection.model";

export const addShopBySection = async (req: Request) => {
  try {
    const {
      title,
      link,
      sort_order = null,
      section_type,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      id_category = null,
      id_collection = null,
      id_style = null,
      description,
    } = req.body;
    const trn = await dbContext.transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idImage = null;
      if (files["image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
          IMAGE_TYPE.templateThree,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }

      let idHoverImage = null;
      if (files["hover_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["hover_image"][0],
          IMAGE_TYPE.templateThree,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idHoverImage = imageData.data;
      }
      await TemplateThreeData.create(
        {
          section_type: section_type,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != null &&
            sort_order != "" &&
            sort_order != undefined
              ? sort_order
              : null,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          id_category:
            id_category &&
            id_category != null &&
            id_category != "" &&
            id_category != undefined
              ? id_category
              : null,
          id_collection:
            id_collection &&
            id_collection != null &&
            id_collection != "" &&
            id_collection != undefined
              ? id_collection
              : null,
          id_style:
            id_style &&
            id_style != null &&
            id_style != "" &&
            id_style != undefined
              ? id_style
              : null,
          title: title,
          id_hover_image: idHoverImage,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
          description,
        },
        { transaction: trn }
      );

      await trn.commit();
      return resSuccess();
    } catch (e) {
      console.log(e, "error");
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    console.log(e, "error");
    throw e;
  }
};

export const updateShopBySection = async (req: Request) => {
  try {
    const {
      title,
      link,
      sort_order = null,
      section_type,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      id_category = null,
      id_collection = null,
      id_style = null,
      description,
      image_delete = "0",
      hover_image_delete = "0",
    } = req.body;

    const findShopBySection = await TemplateThreeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findShopBySection && findShopBySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    const trn = await dbContext.transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imageId = null;
      console.log(files["image"], "shfgdjhfgdsfhgsdhfgjh");
      let findImage = null;
      if (findShopBySection.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findShopBySection.dataValues.id_image },
          transaction: trn,
        });
      }
      if (files["image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
          IMAGE_TYPE.templateThree,
          req.body.session_res.id_app_user,
          findImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageId = imageData.data;
      }
      let imageHoverId = null;
      let findHoverImage = null;
      if (findShopBySection.dataValues.id_hover_image) {
        findHoverImage = await Image.findOne({
          where: { id: findShopBySection.dataValues.id_hover_image },
          transaction: trn,
        });
      }
      if (files["hover_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["hover_image"][0],
          IMAGE_TYPE.templateThree,
          req.body.session_res.id_app_user,
          findHoverImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageHoverId = imageData.data;
      }
      {
        await TemplateThreeData.update(
          {
            section_type: section_type,
            link: link,
            id_image:
              image_delete == "1"
                ? null
                : imageId == null
                ? findShopBySection.dataValues.id_image
                : imageId,
            sort_order:
              sort_order &&
              sort_order != null &&
              sort_order != "" &&
              sort_order != undefined
                ? sort_order
                : null,
            button_name: button_name,
            button_color: button_color,
            button_text_color: button_text_color,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            id_category:
              id_category &&
              id_category != null &&
              id_category != "" &&
              id_category != undefined
                ? id_category
                : null,
            id_collection:
              id_collection &&
              id_collection != null &&
              id_collection != "" &&
              id_collection != undefined
                ? id_collection
                : null,
            id_style:
              id_style &&
              id_style != null &&
              id_style != "" &&
              id_style != undefined
                ? id_style
                : null,
            title: title,
            id_hover_image:
              hover_image_delete == "1"
                ? null
                : imageHoverId == null
                ? findShopBySection.dataValues.id_hover_image
                : imageHoverId,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
            description,
          },
          {
            where: { id: findShopBySection.dataValues.id },
            transaction: trn,
          }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage, null);
      }
      if (
        hover_image_delete &&
        hover_image_delete === "1" &&
        findHoverImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findHoverImage, null);
      }
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const deleteShopBySection = async (req: Request) => {
  try {
    const findShopBySection = await TemplateThreeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findShopBySection && findShopBySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateThreeData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findShopBySection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getShopBySection = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      req.query.section_type && req.query.section_type != ""
        ? {
            section_type: req.query.section_type,
          }
        : {},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateThreeData.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

      paginationProps = {
        limit: pagination.per_page_rows,
        offset: (pagination.current_page - 1) * pagination.per_page_rows,
      };
    }

    const result = await TemplateThreeData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "link",
        "is_active",
        "sort_order",
        "id_image",
        "id_hover_image",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "description",
        "id_category",
        "id_collection",
        "id_style",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("hover_image.image_path"), "hover_image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "hover_image", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
        { model: SettingTypeData, as: "style", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForShopBySection = async (req: Request) => {
  try {
    const findShopBySection = await TemplateThreeData.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(findShopBySection && findShopBySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateThreeData.update(
      {
        is_active: statusUpdateValue(findShopBySection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findShopBySection.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const templateThreeAllSectionListForUser = async (req: Request) => {
  try {
    const result = await TemplateThreeData.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No },
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "link",
        "sort_order",
        "id_image",
        "id_hover_image",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "description",
        "id_diamond_shape",
        "id_category",
        "id_collection",
        "id_style",
        "diamond_shape_type",
        "section_type",
        [
          Sequelize.literal(
            `CASE WHEN "hash_tag" IS NULL THEN '{}' ELSE string_to_array("hash_tag", '|') END`
          ),
          "hash_tag",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("hover_image.image_path"), "hover_image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
        [Sequelize.literal("diamond_shape.slug"), "diamond_shape_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "hover_image", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
        { model: SettingTypeData, as: "style", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: DiamondShape, as: "diamond_shape", attributes: [] },
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const templateThreeAllSectionDetailForUser = async (req: Request) => {
  try {
    const result = await TemplateThreeData.findOne({
      where: {
        id: req.params.id,
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
      },
      attributes: [
        "id",
        "title",
        "link",
        "sort_order",
        "id_image",
        "id_hover_image",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "description",
        "id_diamond_shape",
        "id_category",
        "id_collection",
        "id_style",
        "diamond_shape_type",
        "section_type",
        [
          Sequelize.literal(
            `CASE WHEN "hash_tag" IS NULL THEN '{}' ELSE string_to_array("hash_tag", '|') END`
          ),
          "hash_tag",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("hover_image.image_path"), "hover_image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
        [Sequelize.literal("diamond_shape.slug"), "diamond_shape_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "hover_image", attributes: [] },
        { model: categoryData, as: "category", attributes: [] },
        { model: SettingTypeData, as: "style", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: DiamondShape, as: "diamond_shape", attributes: [] },
      ],
    });

    if (!(result && result.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
