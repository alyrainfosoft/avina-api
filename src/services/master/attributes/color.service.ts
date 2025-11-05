import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import Colors from "../../../model/master/attributes/colors.model";
import { ActiveStatus } from "../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../../utils/shared-functions";

export const addColors = async (req: Request) => {
  const { slug, name, value, created_by } = req.body;
  try {
    const payload = {
      value: value,
      slug: slug,
      name: name,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: "0",
      created_by: req.body.session_res.id_app_user,
    };

    const nameExists = await Colors.findOne({
      where: { name: name, is_deleted: "0" },
    });

    const slugExistes = await Colors.findOne({
      where: { slug: slug, is_deleted: "0" },
    });

    if (nameExists === null && slugExistes === null) {
      await Colors.create(payload);
      console.log(payload);
      return resSuccess({ data: payload });
    } else {
      return resErrorDataExit();
    }
  } catch (error) {
    throw error;
  }
};

export const getAllColors = async (req: Request) => {
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

export const getByIdColors = async (req: Request) => {
  try {
    console.log(req.params.id);
    const colors = await Colors.findOne({
      where: { id: req.params.id, is_deleted: "0" },
    });

    if (!(colors && colors.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: colors });
  } catch (error) {
    throw error;
  }
};

export const updateColors = async (req: Request) => {
  const { id, slug, name, value, updated_by } = req.body;

  try {
    const ColorsId = await Colors.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (ColorsId) {
      const nameExists = await Colors.findOne({
        where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" },
      });
      const slugExists = await Colors.findOne({
        where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" },
      });

      if (nameExists == null && slugExists == null) {
        const ColorsInfo = await Colors.update(
          {
            value: value,
            slug: slug,
            name: name,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: id, is_deleted: "0" } }
        );
        if (ColorsInfo) {
          const ColorsInformation = await Colors.findOne({
            where: { id: id, is_deleted: "0" },
          });
          return resSuccess({ data: ColorsInformation });
        }
      } else {
        return resErrorDataExit();
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const deleteColors = async (req: Request) => {
  try {
    const ColorsExists = await Colors.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    console.log(ColorsExists);

    if (!(ColorsExists && ColorsExists.dataValues)) {
      return resNotFound();
    }
    await Colors.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: ColorsExists.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateColors = async (req: Request) => {
  try {
    const ColorsExists = await Colors.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    if (ColorsExists) {
      const ColorsActionInfo = await Colors.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: ColorsExists.dataValues.id } }
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
