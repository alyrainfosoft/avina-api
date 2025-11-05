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
  TemplateSevenSectionType,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import Image from "../../model/image.model";
import { Op, Sequelize } from "sequelize";
import TemplateSevenData from "../../model/template-seven.model";

export const addStunningJewelrySection = async (req: Request) => {
  try {
    const {
      title,
      sub_title,
      description,
      sub_description,
      sub_title_one,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      sort_order = null,
      
    } = req.body;
    const trn = await dbContext.transaction();
    try {
       
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idBgImage = null;
      if (files["bg_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["bg_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idBgImage = imageData.data;
      }
      let idProductImage = null;
      if (files["product_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["product_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idProductImage = imageData.data;
      }
      let idTitleImage = null;
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idTitleImage = imageData.data;
      }
    
      await TemplateSevenData.create(
        {
          section_type: TemplateSevenSectionType.StunningJewelsSection,
          link: link,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != "" &&
            sort_order != null &&
            sort_order != undefined
              ? sort_order
              : 0,
          title: title,
          sub_title: sub_title,
          sub_title_one:sub_title_one,
          description: description,
          sub_description,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          id_bg_image: idBgImage,
          id_product_image: idProductImage,
          id_title_image: idTitleImage,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      await trn.commit();
      return resSuccess();
    } catch (e) {
      console.log(e);
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const updateStunningJewelrySection = async (req: Request) => {
  try {
    const {
      title,
      sub_title,
      sub_title_one,
      description,
      sub_description,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      sort_order = null,
      bg_image_delete = "0",
      product_image_delete = "0",
      title_image_delete = "0"
    } = req.body;

    const stunningJewelrySection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(stunningJewelrySection && stunningJewelrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await dbContext.transaction();
    try {
     
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let bgImageId = null;
      let findBgImage = null;
      if (stunningJewelrySection.dataValues.id_bg_image) {
        findBgImage = await Image.findOne({
          where: { id: stunningJewelrySection.dataValues.id_bg_image },
          transaction: trn,
        });
      }
      if (files["bg_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["bg_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findBgImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        bgImageId = imageData.data;
      }
      let imageTitleId = null;
      let findTitleImage = null;
      if (stunningJewelrySection.dataValues.id_title_image) {
        findTitleImage = await Image.findOne({
          where: { id: stunningJewelrySection.dataValues.id_title_image },
          transaction: trn,
        });
      }
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findTitleImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageTitleId = imageData.data;
      }
      let imageOfferId = null;
      let findOfferImage = null;
      if (stunningJewelrySection.dataValues.id_offer_image) {
        findOfferImage = await Image.findOne({
          where: { id: stunningJewelrySection.dataValues.id_offer_image },
          transaction: trn,
        });
      }


      let imageProductId = null;
      let findProductImage = null;
      if (stunningJewelrySection.dataValues.id_offer_image) {
        findProductImage = await Image.findOne({
          where: { id: stunningJewelrySection.dataValues.id_offer_image },
          transaction: trn,
        });
      }
      if (files["product_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["product_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findProductImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageProductId = imageData.data;
      }

      {
        await TemplateSevenData.update(
          {
            section_type: TemplateSevenSectionType.StunningJewelsSection,
            link: link,
            id_bg_image:
            bg_image_delete && bg_image_delete === "1"
              ? null
              : bgImageId != null
              ? bgImageId
              : stunningJewelrySection.dataValues.id_bg_image,
          id_product_image:
              product_image_delete && product_image_delete === "1"
                ? null
                : imageProductId != null
                ? imageProductId
                : stunningJewelrySection.dataValues.id_product_image,
              id_title_image:
                title_image_delete && title_image_delete === "1"
                  ? null
                  : imageTitleId != null
                  ? imageTitleId
                  : stunningJewelrySection.dataValues.id_title_image,
  
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            title: title,
            sub_title: sub_title,
            sub_title_one:sub_title_one,
            description: description,
            sub_description: sub_description,
            button_name: button_name,
            button_color: button_color,
            button_text_color: button_text_color,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: stunningJewelrySection.dataValues.id },
            transaction: trn,
          }
        );
      }
      if (bg_image_delete && bg_image_delete === "1" && findBgImage.dataValues) {
        await imageDeleteInDBAndS3(req,findBgImage, null);
      }
      if (product_image_delete && product_image_delete === "1" && findProductImage.dataValues) {
        await imageDeleteInDBAndS3(req,findProductImage, null);
      }
      if (
        title_image_delete &&
        title_image_delete === "1" &&
        findProductImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findProductImage, null);
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

export const deleteStunningJewelrySection = async (req: Request) => {
  try {
    const StunningJewelrySection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(StunningJewelrySection && StunningJewelrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: StunningJewelrySection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getStunningJewelrySection = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { section_type: TemplateSevenSectionType.StunningJewelsSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                sub_title: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              {
                sub_description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateSevenData.count({
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

    const result = await TemplateSevenData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "sub_description",
        "sub_title_one",
        "link",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "is_active",
        "sort_order",
        "id_bg_image",
        "description",
        [Sequelize.literal("bg_image.image_path"), "bg_image_path"],
        [Sequelize.literal("product_image.image_path"), "product_image_path"],
        [Sequelize.literal("title_image.image_path"), "title_image_path"],
      ],
      include: [
        { model: Image, as: "bg_image", attributes: [] },
        { model: Image, as: "product_image", attributes: [] },
        { model: Image, as: "title_image", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForStunningJewelrySection = async (req: Request) => {
  try {
    const StunningJewelrySection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSevenSectionType.StunningJewelsSection },
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(StunningJewelrySection && StunningJewelrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(StunningJewelrySection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: StunningJewelrySection.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
