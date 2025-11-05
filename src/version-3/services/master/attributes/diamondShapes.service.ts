import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../../helpers/file.helper";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  Pagination,
} from "../../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import dbContext from "../../../../config/db-context";
import Image from "../../../../model/image.model";
import {
  columnValueLowerCase,
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import DiamondShape from "../../../model/master/attributes/diamondShape.model";

export const addDiamondShape = async (req: Request) => {
  try {
    const { name, sort_code } = req.body;
    const slug = createSlug(name);
    const findName = await DiamondShape.findOne({
      where: { name: name, is_deleted: DeletedStatus.No },
    });

    const findSortCode = await DiamondShape.findOne({
      where: { sort_code: sort_code, is_deleted: DeletedStatus.No },
    });
    if (
      (findName && findName.dataValues) ||
      (findSortCode && findSortCode.dataValues)
    ) {
      return resErrorDataExit();
    }
    const trn = await dbContext.transaction();

    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.diamondShape,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }
      const payload = {
        name: name,
        slug: slug,
        sort_code: sort_code,
        created_date: getLocalDate(),
        created_by: req.body.session_res.id_app_user,
        id_image: idImage,
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
      };
      await DiamondShape.create(payload, { transaction: trn });

      await trn.commit();
      return resSuccess({ data: payload });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getDiamondShapes = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await DiamondShape.count({
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

    const result = await DiamondShape.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
        "is_active",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdDiamondShape = async (req: Request) => {
  try {
    const findDiamondShape = await DiamondShape.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    if (!(findDiamondShape && findDiamondShape.dataValues)) {
      return resNotFound();
    }

    return resSuccess({ data: findDiamondShape });
  } catch (error) {
    throw error;
  }
};

export const updateDiamondShape = async (req: Request) => {
  try {
    const { name, sort_code, image_delete = "0" } = req.body;
    const id = req.params.id;
    const slug = createSlug(name);
    const findDiamondShape = await DiamondShape.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    if (findDiamondShape == null) {
      return resErrorDataExit();
    }
    const findName = await DiamondShape.findOne({
      where: {
        name: name,
        id: { [Op.ne]: id },
        is_deleted: DeletedStatus.No,
      },
    });

    const findSortCode = await DiamondShape.findOne({
      where: {
        sort_code: sort_code,
        id: { [Op.ne]: id },
        is_deleted: DeletedStatus.No,
      },
    });
    if (
      (findName && findName.dataValues) ||
      (findSortCode && findSortCode.dataValues)
    ) {
      return resErrorDataExit();
    }
    const trn = await dbContext.transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findDiamondShape.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findDiamondShape.dataValues.id_image },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.diamondShape,
          req.body.session_res.id_app_user,
          findImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageId = imageData.data;
      }

      await DiamondShape.update(
        {
          name: name,
          slug: slug,
          id_image:
            image_delete && image_delete === "1"
              ? null
              : imageId || findDiamondShape.dataValues.id_image,
          sort_code: sort_code,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        {
          where: { id: id, is_deleted: DeletedStatus.No },
          transaction: trn,
        }
      );
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage, null);
      }
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      await trn.rollback();

      throw e;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteDiamondShape = async (req: Request) => {
  try {
    const findShape = await DiamondShape.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findShape && findShape.dataValues)) {
      return resNotFound();
    }
    await DiamondShape.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findShape.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForDiamondShape = async (req: Request) => {
  try {
    const findShape = await DiamondShape.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findShape && findShape.dataValues)) {
      return resNotFound();
    }
    await DiamondShape.update(
      {
        is_active: statusUpdateValue(findShape),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findShape.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
