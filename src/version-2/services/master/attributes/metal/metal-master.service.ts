import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../../../data/interfaces/common/common.interface";
import MetalMaster from "../../../../model/master/attributes/metal/metal-master.model";
import {
  ActiveStatus,
  DeletedStatus,
} from "../../../../../utils/app-enumeration";
import {
  RATE_IS_REQUIRED,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../../utils/app-messages";
import {
  columnValueLowerCase,
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../../utils/shared-functions";

export const addMetal = async (req: Request) => {
  const { name } = req.body;
  try {
    const payload = {
      slug: createSlug(name),
      name: name,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
    };

    const findName = await MetalMaster.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await MetalMaster.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getMetals = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    let where = [
      { is_deleted: DeletedStatus.No },
      {
        [Op.or]: [
          { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: DeletedStatus.No,
      },
    ];

    const totalItems = await MetalMaster.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const result = await MetalMaster.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "slug",
        "created_date",
        "created_by",
        "is_active",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
      ],
    });

    return resSuccess({ data: { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdMetal = async (req: Request) => {
  try {
    const masterData = await MetalMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(masterData && masterData.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: masterData });
  } catch (error) {
    throw error;
  }
};

export const updateMetal = async (req: Request) => {
  try {
    const { name } = req.body;
    const id = req.params.id;
    const findMetal = await MetalMaster.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });

    if (!(findMetal && findMetal.dataValues)) {
      return resNotFound();
    }
    const nameExists = await MetalMaster.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (nameExists && nameExists.dataValues) {
      return resErrorDataExit();
    }
    await MetalMaster.update(
      {
        slug: createSlug(name),
        name: name,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      {
        where: {
          id: findMetal.dataValues.id,
          is_deleted: DeletedStatus.No,
        },
      }
    );
    return resSuccess({
      message: RECORD_UPDATE_SUCCESSFULLY,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteMetal = async (req: Request) => {
  try {
    const findMetal = await MetalMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findMetal && findMetal.dataValues)) {
      return resNotFound();
    }
    await MetalMaster.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findMetal.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForMetal = async (req: Request) => {
  try {
    const findMetal = await MetalMaster.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findMetal && findMetal.dataValues)) {
      return resNotFound();
    }
    await MetalMaster.update(
      {
        is_active: statusUpdateValue(findMetal),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findMetal.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getMetalActiveList = async (req: Request) => {
  try {
    const findMetals = await MetalMaster.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      attributes: ["id", "name", "slug", "metal_rate", "created_date"],
    });

    return resSuccess({ data: findMetals });
  } catch (error) {
    throw error;
  }
};

export const updateMetalRate = async (req: Request) => {
  try {
    const { rate } = req.body;
    if (!rate) {
      return resBadRequest({ message: RATE_IS_REQUIRED });
    }
    const metalMasterId = await MetalMaster.findOne({
      where: { id: req.params.metal_id, is_deleted: DeletedStatus.No },
    });
    if (!(metalMasterId && metalMasterId.dataValues)) {
      return resNotFound();
    }

    await MetalMaster.update(
      {
        metal_rate: rate,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      {
        where: {
          id: metalMasterId.dataValues.id,
          is_deleted: DeletedStatus.No,
        },
      }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
