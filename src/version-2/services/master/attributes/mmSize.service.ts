import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../../data/interfaces/common/common.interface";
import MMSizeData from "../../../model/master/attributes/mmSize.model";
import {
  ActiveStatus,
  DeletedStatus,
  Pagination,
} from "../../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import {
  columnValueLowerCase,
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../utils/shared-functions";

export const addMMSize = async (req: Request) => {
  try {
    const { value } = req.body;
    const slug = createSlug(value);
    const payload = {
      value: value,
      slug: slug,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
    };

    const findValue = await MMSizeData.findOne({
      where: [
        columnValueLowerCase("slug", slug),
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (findValue && findValue.dataValues) {
      return resErrorDataExit();
    }

    await MMSizeData.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllMMSize = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      {
        [Op.or]: [
          { value: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: DeletedStatus.No,
      },
    ];
    if (!noPagination) {
      const totalItems = await MMSizeData.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await MMSizeData.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "value", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdMMSize = async (req: Request) => {
  try {
    const findSize = await MMSizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findSize });
  } catch (error) {
    throw error;
  }
};

export const updateMMSize = async (req: Request) => {
  try {
    const { value } = req.body;
    const id = req.params.id;
    const slug = createSlug(value);
    const findSize = await MMSizeData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    const valueExists = await MMSizeData.findOne({
      where: [
        columnValueLowerCase("value", value),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
      ],
    });
    if (valueExists && valueExists.dataValues) {
      return resErrorDataExit();
    }

    await MMSizeData.update(
      {
        value: value,
        slug: slug,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteMMSize = async (req: Request) => {
  try {
    const findSize = await MMSizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    console.log(findSize);

    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    await MMSizeData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSize.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForMMSize = async (req: Request) => {
  try {
    const findSize = await MMSizeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findSize && findSize.dataValues)) {
      return resNotFound();
    }
    await MMSizeData.update(
      {
        is_active: statusUpdateValue(findSize),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSize.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
