import { Request } from "express";
import { Op } from "sequelize";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const addCity = async (req: Request) => {
  const { name, code, state_id } = req.body;
  try {
    const {CityData} = initModels(req);
    const payload = {
      city_name: name,
      city_code: code,
      id_state: state_id,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findSortCode = await  CityData.findOne({
      where: [
        columnValueLowerCase("city_code", code),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    const findName = await  CityData.findOne({
      where: [
        columnValueLowerCase("city_name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      findSortCode &&
      findName &&
      findSortCode.dataValues &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    
    const cityData = await  CityData.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        city_id: cityData?.dataValues?.id, data: {
          ...cityData?.dataValues
        }
      }
    }], cityData?.dataValues?.id, LogsActivityType.Add, LogsType.City, req?.body?.session_res?.id_app_user)
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllCity = async (req: Request) => {
  try {
    let paginationProps = {};
    const {CityData} = initModels(req);

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { city_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { city_code: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await  CityData.count({
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

    const result = await  CityData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "city_name",
        "city_code",
        "id_state",
        "created_date",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdCity = async (req: Request) => {
  try {
    const {CityData} = initModels(req);

    const city = await  CityData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(city && city.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: city });
  } catch (error) {
    throw error;
  }
};

export const updateCity = async (req: Request) => {
  try {
    const {CityData} = initModels(req);

    const { name, code, state_id } = req.body;
    const id = req.params.id;
    const findCity = await  CityData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCity && findCity.dataValues)) {
      return resNotFound();
    }

    const findSortCode = await  CityData.findOne({
      where: [
        columnValueLowerCase("city_code", code),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    const findName = await  CityData.findOne({
      where: [
        columnValueLowerCase("city_name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      findSortCode &&
      findSortCode.dataValues &&
      findName &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    const updateCity = await  CityData.update(
      {
        city_name: name,
        city_code: code,
        id_state: state_id,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );
    if (updateCity) {
      const cityData = await  CityData.findOne({
        where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { city_id: findCity?.dataValues?.id, data: {...findCity?.dataValues} },
        new_data: {
          city_id: cityData?.dataValues?.id, data: { ...cityData?.dataValues }
        }
      }], findCity?.dataValues?.id, LogsActivityType.Edit, LogsType.City, req?.body?.session_res?.id_app_user)
      
      return resSuccess({ data: cityData });
    }
  } catch (error) {
    throw error;
  }
};

export const deleteCity = async (req: Request) => {
  try {
    const {CityData} = initModels(req);

    const findCity = await  CityData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCity && findCity.dataValues)) {
      return resNotFound();
    }
    await  CityData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCity.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { city_id: findCity?.dataValues?.id, data: {...findCity?.dataValues} },
      new_data: {
        city_id: findCity?.dataValues?.id, data: {
          ...findCity?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findCity?.dataValues?.id, LogsActivityType.Delete, LogsType.City, req?.body?.session_res?.id_app_user)


    return resSuccess({ data: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCity = async (req: Request) => {
  try {
    const {CityData} = initModels(req);

    const findCity = await  CityData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCity && findCity.dataValues)) {
      return resNotFound();
    }
    await  CityData.update(
      {
        is_active: statusUpdateValue(findCity),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCity.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { city_id: findCity?.dataValues?.id, data: {...findCity?.dataValues} },
      new_data: {
        city_id: findCity?.dataValues?.id, data: {
          ...findCity?.dataValues, is_active: statusUpdateValue(findCity),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCity?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.City, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
