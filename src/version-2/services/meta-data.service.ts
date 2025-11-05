import { Request } from "express";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  Pagination,
} from "../../utils/app-enumeration";
import { Op, Sequelize } from "sequelize";
import MetaDataDetails from "../model/metadata-details.model";
import PageData from "../model/pages.model";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";

export const addMetaData = async (req: Request) => {
  const { title, description, key_word, id_page } = req.body;
  try {
    const payload = {
      title,
      description,
      key_word,
      id_page,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
    };

    await MetaDataDetails.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getMetaData = async (req: Request) => {
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
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              { url: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await MetaDataDetails.count({
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

    const result = await MetaDataDetails.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "description",
        "id_page",
        "key_word",
        "created_date",
        "is_active",
        [Sequelize.literal(`"page"."name"`), "page_name"],
        [Sequelize.literal(`"page"."url"`), "page_url"],
      ],
      include: [{ model: PageData, as: "page", attributes: [] }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdMetaData = async (req: Request) => {
  try {
    const findMetaData = await MetaDataDetails.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findMetaData && findMetaData.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findMetaData });
  } catch (error) {
    throw error;
  }
};

export const updateMetaData = async (req: Request) => {
  try {
    const { title, description, key_word, id_page } = req.body;
    const id = req.params.id;
    const findMetaData = await MetaDataDetails.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    if (!(findMetaData && findMetaData.dataValues)) {
      return resNotFound();
    }

    const updateMetaData = await MetaDataDetails.update(
      {
        title,
        description,
        key_word,
        id_page,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No } }
    );
    if (updateMetaData) {
      const findUpdatedPage = await MetaDataDetails.findOne({
        where: { id: id, is_deleted: DeletedStatus.No },
      });
      return resSuccess({ data: findUpdatedPage });
    }
  } catch (error) {
    throw error;
  }
};

export const deleteMetaData = async (req: Request) => {
  try {
    const findMetaData = await MetaDataDetails.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findMetaData && findMetaData.dataValues)) {
      return resNotFound();
    }
    await MetaDataDetails.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findMetaData.dataValues.id } }
    );

    return resSuccess({ data: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForMetaData = async (req: Request) => {
  try {
    const findMetaData = await MetaDataDetails.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findMetaData && findMetaData.dataValues)) {
      return resNotFound();
    }
    await MetaDataDetails.update(
      {
        is_active: statusUpdateValue(findMetaData),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findMetaData.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getMetaDataListForUser = async (req: Request) => {
  try {
    const findMetaData = await MetaDataDetails.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      attributes: [
        "id",
        "title",
        "description",
        "id_page",
        "key_word",
        "created_date",
        "is_active",
        [Sequelize.literal(`"page"."name"`), "page_name"],
        [Sequelize.literal(`"page"."url"`), "page_url"],
      ],
      include: [{ model: PageData, as: "page", attributes: [] }],
    });

    return resSuccess({ data: findMetaData });
  } catch (error) {
    throw error;
  }
};
