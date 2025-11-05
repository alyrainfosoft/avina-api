import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resNotFound,
  resSuccess,
  resUnprocessableEntity,
  statusUpdateValue,
} from "../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../utils/app-enumeration";
import { Op } from "sequelize";
import {
  DATA_NOT_FOUND,
  ERROR_ALREADY_EXIST,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import { initModels } from "../model/index.model";

export const getBlogCategory = async (req: Request) => {
  try {
    const {BlogCategoryData} = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      {company_info_id :req?.body?.session_res?.client_id},
      !noPagination
        ? { is_deleted: DeletedStatus.No }
        : { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await BlogCategoryData.count({
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

    const result = await BlogCategoryData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "name", "slug", "is_active", "sort_order"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdBlogCategory = async (req: Request) => {
  try {
    const {BlogCategoryData} = initModels(req);

    const findBlogCategory = await BlogCategoryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      attributes: ["id", "name", "slug", "is_active", "sort_order"],
    });

    if (!(findBlogCategory && findBlogCategory.dataValues)) {
      return resNotFound();
    }

    return resSuccess({ data: findBlogCategory });
  } catch (error) {
    throw error;
  }
};

export const addBlogCategory = async (req: Request) => {
  try {
    const { name, sort_order = null } = req.body;
    const {BlogCategoryData} = initModels(req);

    const findBlogCategory = await BlogCategoryData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findBlogCategory && findBlogCategory.dataValues) {
      return resUnprocessableEntity({ message: ERROR_ALREADY_EXIST });
    }
    const slug = createSlug(name);
    const blogCategory = await BlogCategoryData.create({
      name,
      slug,
      sort_order,
      is_active: ActiveStatus.Active,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      created_date: getLocalDate(),
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        blog_category_id: blogCategory?.dataValues?.id, data: {
          ...blogCategory?.dataValues
        },
      }
    }], blogCategory?.dataValues?.id, LogsActivityType.Add, LogsType.BlogCategory, req?.body?.session_res?.id_app_user)
              
    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const updateBlogCategory = async (req: Request) => {
  try {
    const {BlogCategoryData} = initModels(req);

    const { name, sort_order } = req.body;
    const id = req.params.id;
    const findBlogCategory = await BlogCategoryData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findBlogCategory && findBlogCategory.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Blog category"],
        ]),
      });
    }

    const findName = await BlogCategoryData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    if (findName && findName.dataValues) {
      return resUnprocessableEntity({ message: ERROR_ALREADY_EXIST });
    }

    await BlogCategoryData.update(
      {
        name: name,
        sort_order: sort_order,
        slug: createSlug(name),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },

      {
        where: {
          id: findBlogCategory.dataValues.id,
          is_deleted: DeletedStatus.No,
          company_info_id :req?.body?.session_res?.client_id,
        },
      }
    );
    const AfterUpdatefindCategorySection = await BlogCategoryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No},
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { blog_category_id: findBlogCategory?.dataValues?.id, data: {...findBlogCategory?.dataValues}},
      new_data: {
        blog_category_id: AfterUpdatefindCategorySection?.dataValues?.id, data: { ...AfterUpdatefindCategorySection?.dataValues }
      }
    }], findBlogCategory?.dataValues?.id,LogsActivityType.Edit, LogsType.BlogCategory, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteBlogCategory = async (req: Request) => {
  try {
    const {BlogCategoryData} = initModels(req);

    const tagToBeDelete = await BlogCategoryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(tagToBeDelete && tagToBeDelete.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Blog category"],
        ]),
      });
    }

    await BlogCategoryData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: tagToBeDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { blog_category_id: tagToBeDelete?.dataValues?.id, data: {...tagToBeDelete?.dataValues}},
      new_data: {
        blog_category_id: tagToBeDelete?.dataValues?.id, data: {
          ...tagToBeDelete?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], tagToBeDelete?.dataValues?.id, LogsActivityType.Delete, LogsType.BlogCategory, req?.body?.session_res?.id_app_user)
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForBlogCategory = async (req: Request) => {
  try {
    const {BlogCategoryData} = initModels(req);

    const { is_active } = req.body;
    const id = req.params.id;
    const findBlogCategory = await BlogCategoryData.findOne({
      where: { id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findBlogCategory && findBlogCategory.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Blog category"],
        ]),
      });
    }

    await BlogCategoryData.update(
      {
        is_active: statusUpdateValue(findBlogCategory),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findBlogCategory.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { blog_category_id: findBlogCategory?.dataValues?.id, data: {...findBlogCategory?.dataValues}},
      new_data: {
        blog_category_id: findBlogCategory?.dataValues?.id, data: {
          ...findBlogCategory?.dataValues, is_active:statusUpdateValue(findBlogCategory),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findBlogCategory?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.BlogCategory, req?.body?.session_res?.id_app_user)
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const blogCategoryList = async (req: Request) => {
  try {
    const {BlogCategoryData} = initModels(req);

    const list = await BlogCategoryData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      attributes: ["id", "name", "slug"],
    });

    return resSuccess({ data: list });
  } catch (error) {
    throw error;
  }
};
