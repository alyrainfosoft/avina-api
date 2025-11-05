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
  TemplateSixSectionType,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import Image from "../../model/image.model";
import { Op, Sequelize } from "sequelize";
import TemplateSixData from "../../model/template-six.model";

export const addShapeMarqueSection = async (req: Request) => {
  try {
    const { title, sort_order = null, text_color } = req.body;
    const trn = await dbContext.transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idOutlineImage = null;
      if (files["outline_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["outline_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idOutlineImage = imageData.data;
      }

      let idFillImage = null;
      if (files["fill_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["fill_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idFillImage = imageData.data;
      }
      await TemplateSixData.create(
        {
          section_type: TemplateSixSectionType.ShapeMarqueSection,
          title,
          sort_order,
          button_text_color: text_color,
          id_image: idOutlineImage,
          id_hover_image: idFillImage,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          created_date: getLocalDate(),
          created_by: req.body.session_res.id_app_user,
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

export const updateShapeMarqueSection = async (req: Request) => {
  try {
    const {
      title,
      link,
      sort_order = null,
      text_color,
      outline_image_delete = "0",
      fill_image_delete = "0",
    } = req.body;

    const findShapeMarqueSection = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findShapeMarqueSection && findShapeMarqueSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    const trn = await dbContext.transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imageId = null;
      let findImage = null;
      if (findShapeMarqueSection.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findShapeMarqueSection.dataValues.id_image },
          transaction: trn,
        });
      }
      if (files["outline_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["outline_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          findImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageId = imageData.data;
      }
      let imageFillId = null;
      let findFillImage = null;
      if (findShapeMarqueSection.dataValues.id_hover_image) {
        findFillImage = await Image.findOne({
          where: { id: findShapeMarqueSection.dataValues.id_hover_image },
          transaction: trn,
        });
      }
      if (files["fill_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["fill_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          findFillImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageFillId = imageData.data;
      }
      {
        await TemplateSixData.update(
          {
            section_type: TemplateSixSectionType.ShapeMarqueSection,
            link: link,
            id_image:
              outline_image_delete == "1"
                ? null
                : imageId == null
                ? findShapeMarqueSection.dataValues.id_image
                : imageId,
            sort_order:
              sort_order &&
              sort_order != null &&
              sort_order != "" &&
              sort_order != undefined
                ? sort_order
                : null,
            button_text_color: text_color,
            title: title,
            id_hover_image:
              outline_image_delete && outline_image_delete === "1"
                ? null
                : imageFillId != null
                ? imageFillId
                : findShapeMarqueSection.dataValues.id_hover_image,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: findShapeMarqueSection.dataValues.id },
            transaction: trn,
          }
        );
      }
      if (
        outline_image_delete &&
        outline_image_delete === "1" &&
        findImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findImage, null);
      }
      if (
        fill_image_delete &&
        fill_image_delete === "1" &&
        findFillImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findFillImage, null);
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

export const deleteShapeMarqueSection = async (req: Request) => {
  try {
    const findShapeMarqueSection = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findShapeMarqueSection && findShapeMarqueSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSixData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findShapeMarqueSection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getShapeMarqueSection = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { section_type: TemplateSixSectionType.ShapeMarqueSection },
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
      const totalItems = await TemplateSixData.count({
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

    const result = await TemplateSixData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "is_active",
        "sort_order",
        ["id_image", "outline_id_image"],
        ["id_hover_image", "fill_id_image"],
        ["button_text_color", "text_color"],
        [Sequelize.literal("image.image_path"), "outline_image_path"],
        [Sequelize.literal("hover_image.image_path"), "fill_image_path"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "hover_image", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForShapeMarqueSection = async (req: Request) => {
  try {
    const findShapeMarqueSection = await TemplateSixData.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(findShapeMarqueSection && findShapeMarqueSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSixData.update(
      {
        is_active: statusUpdateValue(findShapeMarqueSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findShapeMarqueSection.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
