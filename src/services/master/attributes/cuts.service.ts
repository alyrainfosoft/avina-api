import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import CutsData from "../../../model/master/attributes/cuts.model";
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

export const addCuts = async (req: Request) => {
  const { slug, value, created_by } = req.body;
  try {
    const payload = {
      value: value,
      slug: slug,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: "0",
      created_by: req.body.session_res.id_app_user,
    };

    const valueExists = await CutsData.findOne({
      where: { slug: slug, is_deleted: "0" },
    });

    const slugExistes = await CutsData.findOne({
      where: { value: value, is_deleted: "0" },
    });

    if (valueExists === null && slugExistes === null) {
      await CutsData.create(payload);
      console.log(payload);
      return resSuccess({ data: payload });
    } else {
      return resErrorDataExit();
    }
  } catch (error) {
    throw error;
  }
};

export const getAllCuts = async (req: Request) => {
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
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await CutsData.count({
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

    const result = await CutsData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "value",
        "slug",
        "created_date",
        "created_by",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdCuts = async (req: Request) => {
  try {
    console.log(req.params.id);
    const Cuts = await CutsData.findOne({
      where: { id: req.params.id, is_deleted: "0" },
    });

    if (!(Cuts && Cuts.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: Cuts });
  } catch (error) {
    throw error;
  }
};

export const updateCuts = async (req: Request) => {
  const { id, slug, value, updated_by } = req.body;

  try {
    const CutsId = await CutsData.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (CutsId) {
      const valueExists = await CutsData.findOne({
        where: { value: value, id: { [Op.ne]: id }, is_deleted: "0" },
      });
      const slugExists = await CutsData.findOne({
        where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" },
      });

      if (valueExists == null && slugExists == null) {
        const CutsInfo = await CutsData.update(
          {
            value: value,
            slug: slug,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: id, is_deleted: "0" } }
        );
        if (CutsInfo) {
          const CutsInformation = await CutsData.findOne({
            where: { id: id, is_deleted: "0" },
          });
          return resSuccess({ data: CutsInformation });
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

export const deleteCuts = async (req: Request) => {
  try {
    const CutsExists = await CutsData.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    console.log(CutsExists);

    if (!(CutsExists && CutsExists.dataValues)) {
      return resNotFound();
    }
    await CutsData.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: CutsExists.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateCuts = async (req: Request) => {
  try {
    const CutsExists = await CutsData.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    if (CutsExists) {
      const CutsActionInfo = await CutsData.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: CutsExists.dataValues.id } }
      );
      if (CutsActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};
