import { Request } from "express";
import { Op } from "sequelize";
import Colors from "../../../model/master/attributes/colors.model";
import {
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  Pagination,
} from "../../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";

export const addColor = async (req: Request) => {
  try {
    const { name } = req.body;
    const slug = createSlug(name);
    const payload = {
      value: name,
      slug: slug,
      name: name,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
    };

    const findName = await Colors.findOne({
      where: { name: name, is_deleted: DeletedStatus.No },
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await Colors.create(payload);
    console.log(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getColors = async (req: Request) => {
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
              { value: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await Colors.count({
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

    const result = await Colors.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "value", "name", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdColor = async (req: Request) => {
  try {
    const findColor = await Colors.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findColor && findColor.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findColor });
  } catch (error) {
    throw error;
  }
};

export const updateColor = async (req: Request) => {
  try {
    const { name } = req.body;
    const id = req.params.id;
    const slug = createSlug(name);
    const findColor = await Colors.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    if (!(findColor && findColor.dataValues)) {
      return resNotFound();
    }
    const findName = await Colors.findOne({
      where: {
        name: name,
        id: { [Op.ne]: id },
        is_deleted: DeletedStatus.No,
      },
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await Colors.update(
      {
        value: name,
        slug: slug,
        name: name,
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

export const deleteColor = async (req: Request) => {
  try {
    const findColor = await Colors.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findColor && findColor.dataValues)) {
      return resNotFound();
    }
    await Colors.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findColor.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForColor = async (req: Request) => {
  try {
    const findColors = await Colors.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (findColors) {
      const ColorsActionInfo = await Colors.update(
        {
          is_active: statusUpdateValue(findColors),
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: findColors.dataValues.id } }
      );
      if (ColorsActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};
