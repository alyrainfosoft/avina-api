import { Request } from "express";
import { Op } from "sequelize";
import Tag from "../../../model/master/attributes/tag.model";
import {
  INVALID_ID,
  ITEM_IS_ALREADY_IN_MODE,
  TAG_NOT_FOUND,
  TAG_WITH_SAME_NAME,
} from "../../../utils/app-messages";
import {
  getDecryptedText,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnprocessableEntity,
} from "../../../utils/shared-functions";

export const getAllTags = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
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
      const totalItems = await Tag.count({
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

    const result = await Tag.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "name", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getTagById = async (req: Request) => {
  try {
    let idTag = getDecryptedText(req.params.id);
    if (!idTag) return resBadRequest({ message: INVALID_ID });
    idTag = parseInt(idTag);

    const tag = await Tag.findOne({
      where: { id: idTag, is_deleted: "0" },
      attributes: ["id", "name", "is_active"],
    });

    if (!(tag && tag.dataValues)) {
      return resNotFound({ message: TAG_NOT_FOUND });
    }

    return resSuccess({ data: tag });
  } catch (error) {
    throw error;
  }
};

export const addTag = async (req: Request) => {
  try {
    const { name } = req.body;

    const tagWithSameName = await Tag.findOne({
      where: { name: name, is_deleted: "0" },
    });

    if (tagWithSameName && tagWithSameName.dataValues) {
      return resUnprocessableEntity({ message: TAG_WITH_SAME_NAME });
    }
    await Tag.create({
      name,
      is_active: "1",
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const updateTag = async (req: Request) => {
  try {
    const { id, name } = req.body;

    const tagToBeUpdate = await Tag.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (!(tagToBeUpdate && tagToBeUpdate.dataValues)) {
      return resNotFound({ message: TAG_NOT_FOUND });
    }

    const tagWithSameName = await Tag.findOne({
      where: {
        name: name,
        is_deleted: "0",
        id: { [Op.ne]: tagToBeUpdate.dataValues.id },
      },
    });

    if (tagWithSameName && tagWithSameName.dataValues) {
      return resUnprocessableEntity({ message: TAG_WITH_SAME_NAME });
    }

    await Tag.update(
      {
        name: name,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },

      { where: { id: tagToBeUpdate.dataValues.id, is_deleted: "0" } }
    );

    return resSuccess();
  } catch (error) {
    throw error;
  }
};

export const deleteTag = async (req: Request) => {
  try {
    const tagToBeDelete = await Tag.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    if (!(tagToBeDelete && tagToBeDelete.dataValues)) {
      return resNotFound({ message: TAG_NOT_FOUND });
    }

    await Tag.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: tagToBeDelete.dataValues.id } }
    );

    return resSuccess();
  } catch (error) {
    throw error;
  }
};

export const activeInactiveTag = async (req: Request) => {
  try {
    const { id, is_active } = req.body;

    const tagToAI = await Tag.findOne({
      where: { id, is_deleted: "0" },
    });

    if (!(tagToAI && tagToAI.dataValues)) {
      return resNotFound({ message: TAG_NOT_FOUND });
    }

    if (is_active === tagToAI.dataValues.is_active) {
      return resBadRequest({
        message: prepareMessageFromParams(ITEM_IS_ALREADY_IN_MODE, [
          ["item", "Tag"],
          ["mode", is_active === "1" ? "activate" : "inactivate"],
        ]),
      });
    }

    await Tag.update(
      {
        is_active: is_active,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: tagToAI.dataValues.id } }
    );
    return resSuccess();
  } catch (error) {
    throw error;
  }
};
