import { Request } from "express";
import {
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
  Pagination,
} from "../../utils/app-enumeration";
import { Op } from "sequelize";
import BlogCategoryData from "../model/blog-category.model";
import {
  DATA_NOT_FOUND,
  ERROR_ALREADY_EXIST,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";

export const getBlogCategory = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
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
    const findBlogCategory = await BlogCategoryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
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

    const findBlogCategory = await BlogCategoryData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (findBlogCategory && findBlogCategory.dataValues) {
      return resUnprocessableEntity({ message: ERROR_ALREADY_EXIST });
    }
    const slug = createSlug(name);
    await BlogCategoryData.create({
      name,
      slug,
      sort_order,
      is_active: ActiveStatus.Active,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const updateBlogCategory = async (req: Request) => {
  try {
    const { name, sort_order } = req.body;
    const id = req.params.id;
    const findBlogCategory = await BlogCategoryData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
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
      ],
    });

    if (findName && findName.dataValues) {
      return resUnprocessableEntity({ message: ERROR_ALREADY_EXIST });
    }

    await BlogCategoryData.update(
      {
        name: name,
        slug: createSlug(name),
        sort_order: sort_order,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },

      {
        where: {
          id: findBlogCategory.dataValues.id,
          is_deleted: DeletedStatus.No,
        },
      }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteBlogCategory = async (req: Request) => {
  try {
    const tagToBeDelete = await BlogCategoryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
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
      { where: { id: tagToBeDelete.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForBlogCategory = async (req: Request) => {
  try {
    const { is_active } = req.body;
    const id = req.params.id;
    const findBlogCategory = await BlogCategoryData.findOne({
      where: { id, is_deleted: DeletedStatus.No },
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
      { where: { id: findBlogCategory.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const blogCategoryList = async (req: Request) => {
  try {
    const list = await BlogCategoryData.findAll({
      where: { is_deleted: DeletedStatus.No },
      attributes: ["id", "name", "slug"],
    });

    return resSuccess({ data: list });
  } catch (error) {
    throw error;
  }
};
