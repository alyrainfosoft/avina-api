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
import DiamondShape from "../../model/master/attributes/diamondShape.model";
import TemplateSixData from "../../model/template-six.model";

export const addDiamondShapeSection = async (req: Request) => {
  try {
    const {
      title,
      link,
      description,
      hash_tag,
      sort_order = null,
      id_diamond_shape,
      diamond_shape_type,
    } = req.body;
    const trn = await dbContext.transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idImage = null;
      if (files["image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
          IMAGE_TYPE.templateSix,
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
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idHoverImage = imageData.data;
      }
      let idTitleImage = null;
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idTitleImage = imageData.data;
      }
      await TemplateSixData.create(
        {
          section_type: TemplateSixSectionType.DiamondShapeSection,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != "" &&
            sort_order != null &&
            sort_order != undefined
              ? sort_order
              : 0,
          id_diamond_shape:
            id_diamond_shape &&
            id_diamond_shape != "" &&
            id_diamond_shape != null &&
            id_diamond_shape != undefined
              ? id_diamond_shape
              : null,
          diamond_shape_type:
            diamond_shape_type &&
            diamond_shape_type != "" &&
            diamond_shape_type != null &&
            diamond_shape_type != undefined
              ? diamond_shape_type
              : null,
          title: title,
          description: description,
          hash_tag: hash_tag && hash_tag.length > 0 ? hash_tag.join("|") : null,
          id_hover_image: idHoverImage,
          id_title_image: idTitleImage,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const updateDiamondShapeSection = async (req: Request) => {
  try {
    const {
      title,
      link,
      description,
      hash_tag,
      sort_order = null,
      id_diamond_shape,
      diamond_shape_type,
      image_delete = "0",
      hover_image_delete = "0",
      title_image_delete = "0",
    } = req.body;

    const findDiamondShapeSection = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await dbContext.transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imageId = null;
      let findImage = null;
      if (findDiamondShapeSection.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_image },
          transaction: trn,
        });
      }
      if (files["image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
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
      let imageTitleId = null;
      let findTitleImage = null;
      if (findDiamondShapeSection.dataValues.id_title_image) {
        findTitleImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_title_image },
          transaction: trn,
        });
      }
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          findTitleImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageTitleId = imageData.data;
      }
      let imageHoverId = null;
      let findHoverImage = null;
      if (findDiamondShapeSection.dataValues.id_hover_image) {
        findHoverImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_hover_image },
          transaction: trn,
        });
      }
      if (files["hover_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["hover_image"][0],
          IMAGE_TYPE.templateSix,
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
        await TemplateSixData.update(
          {
            section_type: TemplateSixSectionType.DiamondShapeSection,
            link: link,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId != null
                ? imageId
                : findDiamondShapeSection.dataValues.id_image,
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            title: title,
            description: description,
            hash_tag:
              hash_tag && hash_tag.length > 0 ? hash_tag.join("|") : null,
            id_hover_image:
              hover_image_delete && hover_image_delete === "1"
                ? null
                : imageHoverId != null
                ? imageHoverId
                : findDiamondShapeSection.dataValues.id_hover_image,
            id_title_image:
              title_image_delete && title_image_delete === "1"
                ? null
                : imageTitleId != null
                ? imageTitleId
                : findDiamondShapeSection.dataValues.id_title_image,
            id_diamond_shape:
              id_diamond_shape &&
              id_diamond_shape != "" &&
              id_diamond_shape != null &&
              id_diamond_shape != undefined
                ? id_diamond_shape
                : null,
            diamond_shape_type:
              diamond_shape_type &&
              diamond_shape_type != "" &&
              diamond_shape_type != null &&
              diamond_shape_type != undefined
                ? diamond_shape_type
                : null,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: findDiamondShapeSection.dataValues.id },
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
        findTitleImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findTitleImage, null);
      }
      if (
        title_image_delete &&
        title_image_delete === "1" &&
        findHoverImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findTitleImage, null);
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

export const deleteDiamondShapeSection = async (req: Request) => {
  try {
    const findDiamondShapeSection = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSixData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findDiamondShapeSection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getDiamondShapeSection = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { section_type: TemplateSixSectionType.DiamondShapeSection },
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
        "link",
        "is_active",
        "sort_order",
        "id_diamond_shape",
        "diamond_shape_type",
        "id_image",
        "id_hover_image",
        "description",
        [
          Sequelize.literal(
            `CASE WHEN "hash_tag" IS NULL THEN '{}' ELSE string_to_array("hash_tag", '|') END`
          ),
          "hash_tag",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("hover_image.image_path"), "hover_image_path"],
        [Sequelize.literal("title_image.image_path"), "title_image_path"],
        [Sequelize.literal("diamond_shape.slug"), "diampnd_shape_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "hover_image", attributes: [] },
        { model: Image, as: "title_image", attributes: [] },
        { model: DiamondShape, as: "diamond_shape", attributes: [] },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForDiamondShapeSection = async (req: Request) => {
  try {
    const findDiamondShapeSection = await TemplateSixData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSixSectionType.DiamondShapeSection },
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSixData.update(
      {
        is_active: statusUpdateValue(findDiamondShapeSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findDiamondShapeSection.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
