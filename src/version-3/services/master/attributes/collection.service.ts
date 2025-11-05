import { Request } from "express";
import {
  columnValueLowerCase,
  createSlug,
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
  Pagination,
} from "../../../../utils/app-enumeration";
import { Op, Sequelize } from "sequelize";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import Collection from "../../../model/master/attributes/collection.model";
import categoryData from "../../../model/category.model";

export const addCollection = async (req: Request) => {
  try {
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
    };

    const findName = await Collection.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }
    await Collection.create(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getCollections = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
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
      include: [{ model: categoryData, as: "category", attributes: [] }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateCollection = async (req: Request) => {
  try {
    const { id_category = null, name } = req.body;
    const id = req.params.id;
    const slug = createSlug(name);
    const findCollection = await Collection.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    if (!(findCollection && findCollection.dataValues)) {
      return resNotFound();
    }

    const findName = await Collection.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
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
      { where: { id: id, is_deleted: DeletedStatus.No } }
    );
    return resSuccess({
      message: RECORD_UPDATE_SUCCESSFULLY,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCollection = async (req: Request) => {
  try {
    const findCollection = await Collection.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findCollection && findCollection.dataValues)) {
      return resNotFound();
    }
    await Collection.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCollection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCollection = async (req: Request) => {
  try {
    const findCollection = await Collection.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
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
      { where: { id: findCollection.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getCollectionList = async (req: Request) => {
  try {
    const findCollections = await Collection.findAll({
      where: { is_deleted: DeletedStatus.No },
      attributes: [
        "id",
        "name",
        "slug",
        "id_category",
        [Sequelize.literal("category.category_name"), "category_name"],
      ],
      include: [{ model: categoryData, as: "category", attributes: [] }],
    });

    return resSuccess({ data: findCollections });
  } catch (error) {
    throw error;
  }
};
