import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../../data/interfaces/common/common.interface";
import MetalMaster from "../../../../model/master/attributes/metal/metal-master.model";
import { ActiveStatus } from "../../../../utils/app-enumeration";
import {
  RATE_IS_REQUIRED,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../../../utils/shared-functions";

export const addMetalMasterData = async (req: Request) => {
  const { slug, name, value, created_by } = req.body;
  try {
    const payload = {
      slug: slug,
      name: name,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: "0",
      created_by: req.body.session_res.id_app_user,
    };

    const nameExists = await MetalMaster.findOne({
      where: { name: name, is_deleted: "0" },
    });

    const slugExistes = await MetalMaster.findOne({
      where: { slug: slug, is_deleted: "0" },
    });

    if (nameExists === null && slugExistes === null) {
      await MetalMaster.create(payload);
      console.log(payload);
      return resSuccess({ data: payload });
    } else {
      return resErrorDataExit();
    }
  } catch (error) {
    throw error;
  }
};

export const getAllMasterData = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    let where = [
      { is_deleted: "0" },
      {
        [Op.or]: [
          { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: "0",
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
      ],
    });

    console.log("----------", result);
    return resSuccess({ data: { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdMetalMasterData = async (req: Request) => {
  try {
    console.log(req.body.id);
    const masterData = await MetalMaster.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    if (!(masterData && masterData.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: masterData });
  } catch (error) {
    throw error;
  }
};

export const updateMetalMasterData = async (req: Request) => {
  const { id, slug, name, value, updated_by } = req.body;

  try {
    const metalMasterId = await MetalMaster.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (metalMasterId) {
      const nameExists = await MetalMaster.findOne({
        where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" },
      });
      const slugExists = await MetalMaster.findOne({
        where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" },
      });

      if (nameExists == null && slugExists == null) {
        const metalMasterInfo = await MetalMaster.update(
          {
            slug: slug,
            name: name,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: metalMasterId.dataValues.id, is_deleted: "0" } }
        );
        if (metalMasterInfo) {
          const metalMasterInformation = await MetalMaster.findOne({
            where: { id: id, is_deleted: "0" },
          });
          return resSuccess({ data: metalMasterInformation });
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

export const deleteMetalMasterData = async (req: Request) => {
  try {
    const metalExists = await MetalMaster.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    console.log(metalExists);

    if (!(metalExists && metalExists.dataValues)) {
      return resNotFound();
    }
    await MetalMaster.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: metalExists.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateMetalMasterData = async (req: Request) => {
  try {
    const metalExists = await MetalMaster.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    if (metalExists) {
      const metalActionInfo = await MetalMaster.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: metalExists.dataValues.id } }
      );
      if (metalActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const metalMasterDropDown = async (req: Request) => {
  try {
    const metalData = await MetalMaster.findAll({
      where: { is_deleted: "0", is_active: "1" },
      attributes: ["id", "name", "slug", "metal_rate", "created_date"],
    });

    return resSuccess({ data: metalData });
  } catch (error) {
    throw error;
  }
};

export const goldRateUpdate = async (req: Request) => {
  try {
    const { id, updated_by, rate } = req.body;
    const metalMasterId = await MetalMaster.findOne({
      where: { id: 1, is_deleted: "0" },
    });
    if (metalMasterId) {
      if (rate) {
        const GoldRateData = await MetalMaster.update(
          {
            metal_rate: rate,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: metalMasterId.dataValues.id, is_deleted: "0" } }
        );
        if (GoldRateData) {
          const GoldRateUpdate = await MetalMaster.findOne({
            where: { id: 1, is_deleted: "0" },
          });
          return resSuccess({ data: GoldRateUpdate });
        }
      } else {
        return resBadRequest({ message: RATE_IS_REQUIRED });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const silverRateUpdate = async (req: Request) => {
  try {
    const { id, updated_by, rate } = req.body;
    const metalMasterId = await MetalMaster.findOne({
      where: { id: 2, is_deleted: "0" },
    });
    if (metalMasterId) {
      if (rate) {
        const SilverRateData = await MetalMaster.update(
          {
            metal_rate: rate,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: metalMasterId.dataValues.id, is_deleted: "0" } }
        );
        if (SilverRateData) {
          const SilverRateUpdate = await MetalMaster.findOne({
            where: { id: 2, is_deleted: "0" },
          });
          return resSuccess({ data: SilverRateUpdate });
        }
      } else {
        return resBadRequest({ message: RATE_IS_REQUIRED });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};
export const platinumRateUpdate = async (req: Request) => {
  try {
    const { id, updated_by, rate } = req.body;
    const metalMasterId = await MetalMaster.findOne({
      where: { id: 3, is_deleted: "0" },
    });
    if (metalMasterId) {
      if (rate) {
        const platinumRateData = await MetalMaster.update(
          {
            metal_rate: rate,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: metalMasterId.dataValues.id, is_deleted: "0" } }
        );
        if (platinumRateData) {
          const platinumRateUpdate = await MetalMaster.findOne({
            where: { id: 3, is_deleted: "0" },
          });
          return resSuccess({ data: platinumRateUpdate });
        }
      } else {
        return resBadRequest({ message: RATE_IS_REQUIRED });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};
