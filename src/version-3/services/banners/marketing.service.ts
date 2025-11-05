import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import dbContext from "../../../config/db-context";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import Banner from "../../model/banner.model";
import Image from "../../model/image.model";
import { ActiveStatus, BANNER_TYPE, IMAGE_TYPE } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";

export const addMarketingBanner = async (req: Request) => {
  const { name, target_url, expiry_date, created_by, active_date } = req.body
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
      const marketingBanner = await Banner.create(
        {
          name: name,
          target_url: target_url,
          active_date: active_date,
          expiry_date: expiry_date,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          banner_type: BANNER_TYPE.marketing_banner,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      await trn.commit();
      return resSuccess({ data: marketingBanner });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getAllMarketingBanner = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
      { banner_type: BANNER_TYPE.marketing_banner },
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
      const totalItems = await Banner.count({
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

    const result = await Banner.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "target_url",
        "is_active",
        "created_date",
        "created_by",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });


    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const updateMarketingBanner = async (req: Request) => {
  const { id, name, target_url, active_date, updated_by, expiry_date } = req.body

  try {

    const bannerId = await Banner.findOne({ where: { id: id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_banner }, is_deleted: "0" } })

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
        const bannerInfo = await (Banner.update(
          {
            name: name,
            target_url: target_url,
            active_date: active_date,
            expiry_date: expiry_date,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: bannerId.dataValues.id, is_deleted: "0" }, transaction: trn }
        ));

        const bannerInformation = await Banner.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })


        await trn.commit();
        return resSuccess({ data: bannerInformation })
      } else {
        const bannerInfo = await (Banner.update(
          {
            name: name,
            target_url: target_url,
            active_date: active_date,
            expiry_date: expiry_date,
            id_image: id_image,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: bannerId.dataValues.id, is_deleted: "0" }, transaction: trn }
        ));

        const bannerInformation = await Banner.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })


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

export const deleteMarkingBanner = async (req: Request) => {

  try {
    const MarkingBannerExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_banner }, is_deleted: "0" } });

    console.log(MarkingBannerExists)

    if (!(MarkingBannerExists && MarkingBannerExists.dataValues)) {
      return resNotFound();
    }
    await Banner.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: MarkingBannerExists.dataValues.id } }
    );

    return resSuccess();
  } catch (error) {
    throw error
  }
}

export const statusUpdateMarkingBanner = async (req: Request) => {
  try {
    const MarkingBannerExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_banner }, is_deleted: "0" } });
    if (MarkingBannerExists) {
      const MarkingBannerActionInfo = await (Banner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: MarkingBannerExists.dataValues.id } }
      ));
      if (MarkingBannerActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}