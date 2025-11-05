import { Request } from "express";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import PageData from "../../model/pages.model";
import {
  ActiveStatus,
  DeletedStatus,
  Pagination,
} from "../../../utils/app-enumeration";
import { Op } from "sequelize";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";

export const addPage = async (req: Request) => {
  const { name, description, url } = req.body;
  try {
    const payload = {
      name,
      description,
      url,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_restrict: "0",
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
    };

    await PageData.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getPages = async (req: Request) => {
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
      const totalItems = await PageData.count({
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

    const result = await PageData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "description",
        "url",
        "created_date",
        "is_active",
        "is_restrict",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdPage = async (req: Request) => {
  try {
    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findPage });
  } catch (error) {
    throw error;
  }
};

export const updatePage = async (req: Request) => {
  try {
    const { name, description, url } = req.body;
    const id = req.params.id;
    const findPage = await PageData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }

    const updatePage = await PageData.update(
      {
        name,
        description,
        url,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No } }
    );
    if (updatePage) {
      const findUpdatedPage = await PageData.findOne({
        where: { id: id, is_deleted: DeletedStatus.No },
      });
      return resSuccess({ data: findUpdatedPage });
    }
  } catch (error) {
    throw error;
  }
};

export const deletePage = async (req: Request) => {
  try {
    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    await PageData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findPage.dataValues.id } }
    );

    return resSuccess({ data: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForPage = async (req: Request) => {
  try {
    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    await PageData.update(
      {
        is_active: statusUpdateValue(findPage),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findPage.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const restrictStatusUpdateForPage = async (req: Request) => {
  try {
    const findPage = await PageData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findPage && findPage.dataValues)) {
      return resNotFound();
    }
    await PageData.update(
      {
        is_restrict: findPage.dataValues.is_restrict === "1" ? "0" : "1",
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findPage.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const pageListForDropdown = async (req: Request) => {
  try {
    const result = await PageData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      attributes: ["id", "name", "url"],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
