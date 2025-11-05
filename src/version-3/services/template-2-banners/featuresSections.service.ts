import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import dbContext from "../../../config/db-context";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import Image from "../../model/image.model";
import { ActiveStatus, IMAGE_TYPE, TEMPLATE_2_BANNER_TYPE } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";
import TemplateTwoBanner from "../../model/template-2-banner.model";

export const addTemplateTwoFeaturesSections = async (req: Request) => {
  const { title, target_url, button_name, content, sort_order } = req.body
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
      const FeaturesSections = await TemplateTwoBanner.create(
        {
          name: title,
          target_url: target_url,
          button_name: button_name,
          is_active: ActiveStatus.Active,
          content: content,
          id_image: idImage,
          sort_order: sort_order,
          banner_type: TEMPLATE_2_BANNER_TYPE.features_sections,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      await trn.commit();
      return resSuccess({ data: FeaturesSections });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getAllTemplateTwoFeaturesSections = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
      { banner_type: TEMPLATE_2_BANNER_TYPE.features_sections },
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
        "sort_order",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });


    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
}

export const updateTemplateTwoFeaturesSections = async (req: Request) => {
  const { id, title, content, target_url,  button_name, sort_order } = req.body

  try {

    const bannerId = await TemplateTwoBanner.findOne({ where: { id: id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.features_sections }, is_deleted: "0" } })

    console.log(bannerId)
    if (bannerId == null) {
      return resNotFound()
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
        const bannerInfo = await (TemplateTwoBanner.update(
          {
            name: title,
          target_url: target_url,
          button_name: button_name,
          content: content,
          sort_order: sort_order,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: bannerId.dataValues.id, is_deleted: "0" }, transaction: trn }
        ));

        const bannerInformation = await TemplateTwoBanner.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })


        await trn.commit();
        return resSuccess({ data: bannerInformation })
      } else {
        const bannerInfo = await (TemplateTwoBanner.update(
          {
            name: title,
          target_url: target_url,
          button_name: button_name,
          content: content,
            id_image: id_image,
            sort_order: sort_order,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: bannerId.dataValues.id, is_deleted: "0" }, transaction: trn }
        ));

        const bannerInformation = await TemplateTwoBanner.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })


        await trn.commit();
        return resSuccess({ data: bannerInformation })
      }

    } catch (e) {
      await trn.rollback();
      throw e;
    }

  } catch (error) {

    throw (error);
  }
}

export const deleteTemplateTwoFeatureSection = async (req: Request) => {

  try {
    const FeatureSectionExists = await TemplateTwoBanner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.features_sections }, is_deleted: "0" } });

    console.log(FeatureSectionExists)

    if (!(FeatureSectionExists && FeatureSectionExists.dataValues)) {
      return resNotFound();
    }
    await TemplateTwoBanner.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: FeatureSectionExists.dataValues.id } }
    );

    return resSuccess();
  } catch (error) {
    throw error
  }
}

export const statusUpdateTemplateTwoFeatureSection = async (req: Request) => {
  try {
    const featureSectionExists = await TemplateTwoBanner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.features_sections }, is_deleted: "0" } });
    if (featureSectionExists) {
      const featureSectionInfo = await (TemplateTwoBanner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: featureSectionExists.dataValues.id } }
      ));
      if (featureSectionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}