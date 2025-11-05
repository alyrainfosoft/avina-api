import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  createSlug,
  getCompanyIdBasedOnTheCompanyKey,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType } from "../../../../utils/app-enumeration";
import { Op } from "sequelize";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import { initModels } from "../../../model/index.model";

export const addBrand = async (req: Request) => {
  try {
    const {BrandData} = initModels(req);
    const { name } = req.body;
    const slug = createSlug(name);
    const payload = {
      name: name,
      slug: slug,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findName = await BrandData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    const brand = await BrandData.create(payload);
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: null,
            new_data: {
              brand_id: brand?.dataValues?.id, data: {
                ...brand?.dataValues
              }
            }
          }], brand?.dataValues?.id, LogsActivityType.Add, LogsType.Brand, req?.body?.session_res?.id_app_user)
          
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getBrands = async (req: Request) => {
  try {
    let paginationProps = {};
    const {BrandData} = initModels(req);

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await BrandData.count({
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

    const result = await BrandData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "name", "slug", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateBrand = async (req: Request) => {
  try {
    const { category_id, name } = req.body;
    const {BrandData} = initModels(req);
    const id = req.params.id;
    const slug = createSlug(name);
    const brandId = await BrandData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(brandId && brandId.dataValues)) {
      return resNotFound();
    }

    const findName = await BrandData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await BrandData.update(
      {
        name: name,
        slug: slug,
        category_id: category_id,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );

    const AfterUpdatebrandId = await BrandData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { brand_id: brandId?.dataValues?.id, data: {...brandId?.dataValues} },
      new_data: {
        brand_id: AfterUpdatebrandId?.dataValues?.id, data: { ...AfterUpdatebrandId?.dataValues }
      }
    }], brandId?.dataValues?.id, LogsActivityType.Edit, LogsType.Brand, req?.body?.session_res?.id_app_user)
    
    return resSuccess({
      message: RECORD_UPDATE_SUCCESSFULLY,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteBrand = async (req: Request) => {
  try {
    const {BrandData} = initModels(req);

    const findBrand = await BrandData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findBrand && findBrand.dataValues)) {
      return resNotFound();
    }
    await BrandData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findBrand.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { brand_id: findBrand?.dataValues?.id, data: {...findBrand?.dataValues} },
      new_data: {
        brand_id: findBrand?.dataValues?.id, data: {
          ...findBrand?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findBrand?.dataValues?.id, LogsActivityType.Delete, LogsType.Brand, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForBrand = async (req: Request) => {
  try {
    const {BrandData} = initModels(req);

    const findBrand = await BrandData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findBrand && findBrand.dataValues)) {
      return resNotFound();
    }
    await BrandData.update(
      {
        is_active: statusUpdateValue(findBrand),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findBrand.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { brand_is: findBrand?.dataValues?.id, data: {...findBrand?.dataValues} },
      new_data: {
        brand_is: findBrand?.dataValues?.id, data: {
          ...findBrand?.dataValues, is_active: statusUpdateValue(findBrand),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findBrand?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Brand, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getBrandList = async (req: Request) => {
  try {
    const {BrandData} = initModels(req);

    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const findBrands = await BrandData.findAll({
      where: { is_deleted: DeletedStatus.No ,company_info_id:company_info_id?.data},
      attributes: ["id", "name", "slug"],
    });

    return resSuccess({ data: findBrands });
  } catch (error) {
    throw error;
  }
};
