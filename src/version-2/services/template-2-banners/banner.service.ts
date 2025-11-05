import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import dbContext from "../../../config/db-context";
import { IBannerQueryPagination } from "../../../data/interfaces/common/common.interface";
import { TBitFieldValue } from "../../../data/types/common/common.type";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import Banner from "../../model/banner.model";
import Image from "../../model/image.model";
import { BIT_FIELD_VALUES } from "../../../utils/app-constants";
import {
  ActiveStatus,
  BANNER_TYPE,
  IMAGE_TYPE,
  TEMPLATE_2_BANNER_TYPE,
} from "../../../utils/app-enumeration";
import {
  BANNER_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
} from "../../../utils/shared-functions";
import TemplateTwoBanner from "../../model/template-2-banner.model";

export const addTemplateTwoBanner = async (req: Request) => {
  try {
    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.banner,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await dbContext.transaction();
    try {
      let idImage = null;
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.banner,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }
      await TemplateTwoBanner.create(
        {
          name: req.body.name,
          target_url: req.body.target_url,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          banner_type: TEMPLATE_2_BANNER_TYPE.banner,
          content: req.body.content,
          button_name: req.body.button_name,
          is_deleted: "0",
          banner_text_color: req.body.banner_text_color,
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

export const updateTemplateTwoBanner = async (req: Request) => {
  try {
    const bannerToUpdate = await TemplateTwoBanner.findOne({
      where: { id: req.body.id },
    });

    if (!(bannerToUpdate && bannerToUpdate.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.banner,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await dbContext.transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.banner,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      }
      if (id_image === null) {
        await TemplateTwoBanner.update(
          {
            name: req.body.name,
            target_url: req.body.target_url,
            is_active: ActiveStatus.Active,
            banner_type: TEMPLATE_2_BANNER_TYPE.banner,
            content: req.body.content,
            button_name: req.body.button_name,
            banner_text_color: req.body.banner_text_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: bannerToUpdate.dataValues.id }, transaction: trn }
        );
      } else {
        await TemplateTwoBanner.update(
          {
            name: req.body.name,
            target_url: req.body.target_url,
            content: req.body.content,
            button_name: req.body.button_name,
            is_active: req.body.is_active,
            id_image: id_image,
            banner_text_color: req.body.banner_text_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: bannerToUpdate.dataValues.id }, transaction: trn }
        );
      }

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

export const deleteTemplateTwoBanner = async (req: Request) => {
  try {
    const bannerToDelete = await TemplateTwoBanner.findOne({
      where: { id: req.body.id },
    });

    if (!(bannerToDelete && bannerToDelete.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    await TemplateTwoBanner.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: bannerToDelete.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const getAllTemplateTwoBanners = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
      { banner_type: TEMPLATE_2_BANNER_TYPE.banner },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateTwoBanner.count({
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

    const result = await TemplateTwoBanner.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "target_url",
        "is_active",
        "content",
        "button_name",
        "banner_text_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateTemapleTwoBanner = async (req: Request) => {
  try {
    const BannerExists = await TemplateTwoBanner.findOne({
      where: {
        id: req.body.id,
        banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.banner },
        is_deleted: "0",
      },
    });
    if (BannerExists) {
      const BannerActionInfo = await TemplateTwoBanner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: BannerExists.dataValues.id } }
      );
      if (BannerActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }
  } catch (error) {
    throw error;
  }
};
