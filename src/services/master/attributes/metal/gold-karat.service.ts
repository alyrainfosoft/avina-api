import { Request } from "express";
import { Sequelize, Op } from "sequelize";
import dbContext from "../../../../config/db-context";
import { IQueryPagination } from "../../../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../../../helpers/file.helper";
import Image from "../../../../model/image.model";
import GoldKarat from "../../../../model/master/attributes/metal/gold-karat.model";
import { ActiveStatus, IMAGE_TYPE } from "../../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../../../utils/shared-functions";

export const addGoldKarat = async (req: Request) => {
  try {
    const { name, slug, metal_master_id } = req.body;

    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.goldKT,
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
            image_type: IMAGE_TYPE.goldKT,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }
      const payload = {
        name: name,
        slug: slug,
        created_date: getLocalDate(),
        created_by: req.body.session_res.id_app_user,
        id_image: idImage,
        is_active: ActiveStatus.Active,
        id_metal: metal_master_id,
        is_deleted: "0",
      };

      const goldKTNameExistes = await GoldKarat.findOne({
        where: { name: name, is_deleted: "0" },
      });
      const goldKTSlugExistes = await GoldKarat.findOne({
        where: { slug: slug, is_deleted: "0" },
      });
      if (goldKTNameExistes === null && goldKTSlugExistes === null) {
        await GoldKarat.create(payload, { transaction: trn });

        await trn.commit();
        return resSuccess({ data: payload });
      } else {
        return resErrorDataExit();
      }
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getAllGoldKTs = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    let where = [
      { is_deleted: "0" },
      {
        [Op.or]: [{ slug: { [Op.iLike]: "%" + pagination.search_text + "%" } }],
        is_deleted: "0",
      },
    ];

    const totalItems = await GoldKarat.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const result = await GoldKarat.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by",
        "id_metal",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    return resSuccess({ data: { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdGoldKTs = async (req: Request) => {
  try {
    const goldKTInfo = await GoldKarat.findOne({
      where: { id: req.params.id, is_deleted: "0" },
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by",
        "id_metal",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    if (!(goldKTInfo && goldKTInfo.dataValues)) {
      return resNotFound();
    }

    return resSuccess({ data: goldKTInfo });
  } catch (error) {
    throw error;
  }
};

export const updateGoldKTs = async (req: Request) => {
  const { id, name, slug, updated_by, metal_master_id } = req.body;

  try {
    const goldKTId = await GoldKarat.findOne({
      where: { id: id, is_deleted: "0" },
    });
    if (goldKTId == null) {
      return resNotFound();
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.goldKT,
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
            image_type: IMAGE_TYPE.goldKT,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      }

      const goldKTNameExistes = await GoldKarat.findOne({
        where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" },
      });
      const GoldKtslugExistes = await GoldKarat.findOne({
        where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" },
      });

      if (goldKTNameExistes == null && GoldKtslugExistes == null) {
        if (id_image === null) {
          const goldKTInfo = await GoldKarat.update(
            {
              name: name,
              slug: slug,
              id_metal: metal_master_id,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user,
            },

            {
              where: { id: goldKTId.dataValues.id, is_deleted: "0" },
              transaction: trn,
            }
          );
          if (goldKTInfo) {
            const goldKTInformation = await GoldKarat.findOne({
              where: { id: id, is_deleted: "0" },
              transaction: trn,
            });
            await trn.commit();
            return resSuccess({ data: goldKTInformation });
          }
        } else {
          const goldKTInfo = await GoldKarat.update(
            {
              name: name,
              slug: slug,
              id_image: id_image,
              id_metal: metal_master_id,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user,
            },

            {
              where: { id: goldKTId.dataValues.id, is_deleted: "0" },
              transaction: trn,
            }
          );
          if (goldKTInfo) {
            const goldKTInformation = await GoldKarat.findOne({
              where: { id: id, is_deleted: "0" },
              transaction: trn,
            });
            await trn.commit();
            return resSuccess({ data: goldKTInformation });
          }
        }
      } else {
        await trn.rollback();
        return resErrorDataExit();
      }

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();

      throw e;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteGoldKts = async (req: Request) => {
  try {
    const goldKTExists = await GoldKarat.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    if (!(goldKTExists && goldKTExists.dataValues)) {
      return resNotFound();
    }
    await GoldKarat.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: goldKTExists.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateGoldKts = async (req: Request) => {
  try {
    const goldKTExists = await GoldKarat.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    if (goldKTExists) {
      const goldKTActionInfo = await GoldKarat.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: goldKTExists.dataValues.id } }
      );
      if (goldKTActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const goldKtDropDownData = async (req: Request) => {
  try {
    const metalData = await GoldKarat.findAll({
      where: {
        id_metal: req.body.metal_master_id,
        is_deleted: "0",
        is_active: "1",
      },
      attributes: ["id", "name", "slug", "created_date"],
    });

    return resSuccess({ data: metalData });
  } catch (error) {
    throw error;
  }
};
