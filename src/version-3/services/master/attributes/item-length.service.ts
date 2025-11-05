import { Request } from "express";
import { Op } from "sequelize";
import LengthData from "../../../model/master/attributes/item-length.model";
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

export const addLength = async (req: Request) => {
  try {
    const { value } = req.body;
    const slug = createSlug(value);
    const payload = {
      length: value,
      slug: slug,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
    };

    const findValue = await LengthData.findOne({
      where: [
        columnValueLowerCase("length", value),
        { is_deleted: DeletedStatus.No },
      ],
    });
    if (findValue && findValue.dataValues) {
      return resErrorDataExit();
    }
    await LengthData.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getLengths = async (req: Request) => {
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
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await LengthData.count({
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

    const result = await LengthData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "length", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateLength = async (req: Request) => {
  try {
    const { value } = req.body;
    const id = req.params.id;
    const slug = createSlug(value);
    const findLength = await LengthData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    if (!(findLength && findLength.dataValues)) {
      return resNotFound();
    }
    const findValue = await LengthData.findOne({
      where: [
        columnValueLowerCase("length", value),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
      ],
    });
    if (findValue && findValue.dataValues) {
      return resErrorDataExit();
    }
    await LengthData.update(
      {
        length: value,
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

export const deleteLength = async (req: Request) => {
  try {
    const findLength = await LengthData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findLength && findLength.dataValues)) {
      return resNotFound();
    }
    await LengthData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findLength.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForLength = async (req: Request) => {
  try {
    const findLength = await LengthData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findLength && findLength.dataValues)) {
      return resNotFound();
    }
    await LengthData.update(
      {
        is_active: statusUpdateValue(findLength),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findLength.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
