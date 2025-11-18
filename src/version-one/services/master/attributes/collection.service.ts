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
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../../utils/app-enumeration";
import { Op, Sequelize } from "sequelize";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import { initModels } from "../../../model/index.model";

export const addCollection = async (req: Request) => {
  try {
    const {Collection} = initModels(req);
    const { name, id_category = null } = req.body;
    const slug = createSlug(name);
    const payload = {
      name: name,
      slug: slug,
      id_category: id_category,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findName = await Collection.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    const collectionData =await Collection.create(payload);

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
            old_data: null,
            new_data: {
              collection_id: collectionData?.dataValues?.id, data: {
                ...collectionData?.dataValues
              }
            }
          }], collectionData?.dataValues?.id, LogsActivityType.Add, LogsType.Colletion, req?.body?.session_res?.id_app_user)
          
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getCollections = async (req: Request) => {
  try {
    const {Collection,CategoryData} = initModels(req);
    let paginationProps = {};

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
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await Collection.count({
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

    const result = await Collection.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "slug",
        "is_active",
        "id_category",
        [Sequelize.literal("category.category_name"), "category_name"],
      ],
      include: [{ model: CategoryData, as: "category", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateCollection = async (req: Request) => {
  try {
    const {Collection} = initModels(req);
    const { id_category = null, name } = req.body;
    const id = req.params.id;
    const slug = createSlug(name);
    const findCollection = await Collection.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id:req?.body?.session_res?.client_id },
    });
    if (!(findCollection && findCollection.dataValues)) {
      return resNotFound();
    }

    const findName = await Collection.findOne({
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
    await Collection.update(
      {
        name: name,
        slug: slug,
        id_category: id_category,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );
    const AfterUpdatefindCollection = await Collection.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { collection_id: findCollection?.dataValues?.id, data: findCollection?.dataValues },
      new_data: {
        collection_id: AfterUpdatefindCollection?.dataValues?.id, data: { ...AfterUpdatefindCollection?.dataValues }
      }
    }], findCollection?.dataValues?.id, LogsActivityType.Edit, LogsType.Colletion, req?.body?.session_res?.id_app_user)
    
    return resSuccess({
      message: RECORD_UPDATE_SUCCESSFULLY,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCollection = async (req: Request) => {
  try {
    const {Collection} = initModels(req);
    const findCollection = await Collection.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCollection && findCollection.dataValues)) {
      return resNotFound();
    }
    await Collection.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCollection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { collection_id: findCollection?.dataValues?.id, data: {...findCollection?.dataValues} },
      new_data: {
        collection_id: findCollection?.dataValues?.id, data: {
          ...findCollection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findCollection?.dataValues?.id, LogsActivityType.Delete, LogsType.Colletion, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCollection = async (req: Request) => {
  try {
    const {Collection} = initModels(req);
    const findCollection = await Collection.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCollection && findCollection.dataValues)) {
      return resNotFound();
    }
    await Collection.update(
      {
        is_active: statusUpdateValue(findCollection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCollection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { collection_id: findCollection?.dataValues?.id, data: {...findCollection?.dataValues} },
      new_data: {
        collection_id: findCollection?.dataValues?.id, data: {
          ...findCollection?.dataValues, is_active: statusUpdateValue(findCollection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCollection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Colletion, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getCollectionList = async (req: Request) => {
  try {
    const {Collection,CategoryData} = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const findCollections = await Collection.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data },
      attributes: [
        "id",
        "name",
        "slug",
        "id_category",
        [Sequelize.literal("category.category_name"), "category_name"],
      ],
      include: [{ model: CategoryData, as: "category", attributes: [],where:{company_info_id:company_info_id?.data},required:false }],
    });

    return resSuccess({ data: findCollections });
  } catch (error) {
    throw error;
  }
};
