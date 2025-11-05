import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { IQueryPagination } from "../../../../../data/interfaces/common/common.interface";
import MetalMaster from "../../../../model/master/attributes/metal/metal-master.model";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
} from "../../../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOTHING_CHANGED,
  RATE_IS_REQUIRED,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  refreshAllMaterializedView,
  refreshMaterializedBraceletConfiguratorPriceFindView,
  refreshMaterializedEternityBandConfiguratorPriceFindView,
  refreshMaterializedProductListView,
  refreshMaterializedRingThreeStoneConfiguratorPriceFindView,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  statusUpdateValue,
} from "../../../../../utils/shared-functions";
import GoldKarat from "../../../../model/master/attributes/metal/gold-karat.model";
import { LOG_FOR_SUPER_ADMIN } from "../../../../../utils/app-constants";
import ActivityLogs from "../../../../model/activity-logs.model";
import AppUser from "../../../../model/app-user.model";
import dbContext from "../../../../../config/db-context";

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
    await refreshAllMaterializedView(dbContext);
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
    await refreshAllMaterializedView(dbContext);
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
    await refreshAllMaterializedView(dbContext);
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
    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: { metal_id: findMetal.dataValues.id, data: findMetal.dataValues },
      new_data: {
        metal_id: findMetal.dataValues.id, data: {
          ...findMetal.dataValues, is_active: statusUpdateValue(findMetal),
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        }
      }
    }], findMetal.dataValues.id, LogsActivityType.StatusUpdate, LogsType.MetalMaster, req.body.session_res.id_app_user)
    await refreshAllMaterializedView(dbContext);
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
    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: { metal_id: metalMasterId.dataValues.id, rate: metalMasterId.dataValues.metal_rate, created_date: metalMasterId.dataValues.created_date },
      new_data: { metal_id: metalMasterId, rate: rate, created_date: metalMasterId.dataValues.created_date }
    }], metalMasterId.dataValues.id, LogsActivityType.RateUpdate, LogsType.MetalMaster, req.body.session_res.id_app_user)
    await refreshAllMaterializedView(dbContext);

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const goldKaratRateList = async (req: Request) => {
  try {
    const karatList = await GoldKarat.findAll({
      order: ["name"],
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      attributes: [
        "id",
        "name",
        "slug",
        "id_metal",
        [
          Sequelize.literal(
            `("metal"."metal_rate"/"metal"."calculate_rate" * ("gold_kts"."calculate_rate"))`
          ),
          "karat_rate",
        ],
      ],
      include: [{ model: MetalMaster, attributes: [], as: "metal" }],
    });

    return resSuccess({ data: karatList });
  } catch (error) {
    throw error;
  }
};

export const getActivityLogsForMetalRate = async (req: Request) => {

    try {
      let paginationProps = {};
  
      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      
      const startDateFilter: any =req?.query?.start_date != undefined ? req?.query?.start_date : new Date().getFullYear();

      const endDateFilter: any = req?.query?.end_date != undefined ? req?.query?.end_date : new Date();
      const endDate = new Date(endDateFilter);
      endDate.setDate(endDate.getDate() + 1);
    
      let noPagination = req.query.no_pagination === "1";
      let where:any = [ 
        pagination.search_text
          ? {
              [Op.or]: [
                Sequelize.where(
                  Sequelize.cast(Sequelize.col('log_type'), 'TEXT'),
                  {
                    [Op.iLike]: `%${pagination.search_text}%`
                  }
              ),
                Sequelize.where(
                  Sequelize.cast(Sequelize.col('activity_type'), 'TEXT'),
                  {
                    [Op.iLike]: `%${pagination.search_text}%`
                  }
              ),
              Sequelize.where(
                  Sequelize.literal('User.username'),
                  {
                    [Op.iLike]: `%${pagination.search_text}%`
                  }
                )
              ]
            }
          : {},
          {
            // Apply start and end date filter on created_date
            created_date: {
              [Op.between]: [startDateFilter, endDate]
            }
          },
          {company_info_id: req?.body?.session_res?.client_id},
          {
            log_type: {
              [Op.eq]: LogsType.MetalMaster 
            }
          }
      ];
  
      if (!noPagination) {
        const totalItems = await ActivityLogs.count({
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
  
      const rawResult:any = await ActivityLogs.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
            "id",
            "log_type",
            "activity_type",
            "created_date",
            "created_by",
            "modified_by",
            "modified_date",
            "old_value_json",
            "updated_value_json",
            "ref_id",
            [Sequelize.literal('"User"."username"'), "modified_User"],
        ],
        include:{
          required: false,
          model:AppUser,
          as:'User',
          attributes:[]
        },
      });
      const result = [];

      for (const row of rawResult) {
        const oldJson = row.old_value_json;
        const newJson = row.updated_value_json;
      
        // If oldJson is null or different from newJson, process the row
          const changes:any = findJsonDifferences(oldJson, newJson);
          if(changes?.code !== DEFAULT_STATUS_CODE_SUCCESS){  
            return changes;
          }
      
          // Only push to result if changes are detected
          if (Object.keys(changes?.data).length > 0) {
            result.push({
              id: row.id,
              log_type: row.log_type,
              activity_type: row.activity_type,
              created_date: row.created_date,
              created_by: row.created_by,
              ref_id: row.ref_id,
              change_logs: changes?.data,  // Include only the changed fields in the "comparison" key
              User: row?.User?.username || '',
            });
          }
        }
      
      return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
      throw error;
    }
  };
  const findJsonDifferences = (oldObj, newObj) => {
    try {
      const diff = {};
  
      if (!oldObj || typeof oldObj !== 'object') {
        for (const key in newObj) {
          const value = newObj[key];
  
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            diff[key] = {};
            for (const nestedKey in value) {
              diff[key][nestedKey] = { newValue: value[nestedKey], oldValue: '-' };
            }
          } else if (Array.isArray(value)) {
            diff[key] = value.map(item => ({ newValue: item, oldValue: '-' }));
          } else {
            diff[key] = { newValue: value, oldValue: '-' };
          }
        }
        return resSuccess({ data: diff });
      }
  
      for (const key in newObj) {
        const newValue = newObj[key];
        const oldValue = oldObj[key];
  
        if (Array.isArray(newValue) && Array.isArray(oldValue)) {
          const arrayDiff = [];
          const maxLength = Math.max(newValue.length, oldValue.length);
  
          for (let i = 0; i < maxLength; i++) {
            const oldItem = oldValue[i];
            const newItem = newValue[i];
  
            if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
              if (
                typeof oldItem === 'object' &&
                typeof newItem === 'object' &&
                oldItem !== null &&
                newItem !== null
              ) {
                const itemDiff = findJsonDifferences(oldItem, newItem);
                arrayDiff.push(itemDiff?.data || {});
              } else {
                arrayDiff.push({
                  oldValue: oldItem === undefined ? '-' : oldItem,
                  newValue: newItem === undefined ? '-' : newItem
                });
              }
            }
          }
  
          if (arrayDiff.length > 0) {
            diff[key] = arrayDiff;
          }
  
        } else if (
          typeof newValue === 'object' &&
          newValue !== null &&
          !Array.isArray(newValue)
        ) {
          const nestedResult = findJsonDifferences(oldValue || {}, newValue);
          if (Object.keys(nestedResult?.data || {}).length > 0) {
            diff[key] = nestedResult.data;
          }
  
        } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diff[key] = {
            oldValue: oldValue === undefined ? '-' : oldValue,
            newValue: newValue === undefined ? '-' : newValue
          };
        }
      }
  
      if (Object.keys(diff).length === 0) {
        return resSuccess({ data: { message: NOTHING_CHANGED } });
      }
  
      return resSuccess({ data: diff });
    } catch (error) {
      return resUnknownError(error);
    }
  };