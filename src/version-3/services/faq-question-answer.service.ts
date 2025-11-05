import { Request } from "express";
import FAQData from "../model/faq-question-answer.model";
import {
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus } from "../../utils/app-enumeration";
import { Op, Sequelize } from "sequelize";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";

export const addFAQCategory = async (req: Request) => {
  try {
    const { category_name, sort_order } = req.body;
    const findCategory = await FAQData.findOne({
      where: [
        columnValueLowerCase("category_name", category_name),
        { is_deleted: DeletedStatus.No },
      ],
    });
    if (findCategory && findCategory.dataValues) {
      return resErrorDataExit();
    }
    const slug = category_name.toLowerCase().replace(/ /g, "-");
    const category = await FAQData.create({
      category_name,
      slug,
      sort_order,
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    return resSuccess({ data: category });
  } catch (error) {
    throw error;
  }
};

export const getAllFAQCategory = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { category_name: { [Op.not]: null } },
      !noPagination
        ? { is_deleted: DeletedStatus.No }
        : { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              {
                category_name: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await FAQData.count({
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

    const result = await FAQData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "category_name",
        "is_active",
        "slug",
        "created_date",
        "sort_order",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdFAQCategory = async (req: Request) => {
  try {
    const result = await FAQData.findOne({
      where: { is_deleted: DeletedStatus.No, id: req.params.id },
      attributes: [
        "id",
        "category_name",
        "is_active",
        "slug",
        "created_date",
        "sort_order",
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const updateFAQCategory = async (req: Request) => {
  try {
    const { category_name, sort_order } = req.body;

    const findCategory = await FAQData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findCategory && findCategory.dataValues)) {
      return resNotFound();
    }
    const sameDataFind = await FAQData.findOne({
      where: [
        columnValueLowerCase("category_name", category_name),
        { is_deleted: DeletedStatus.No },
        { id: { [Op.ne]: req.params.id } },
      ],
    });
    if (sameDataFind && sameDataFind.dataValues) {
      return resErrorDataExit();
    }
    const slug = category_name.toLowerCase().replace(/ /g, "-");
    const category = await FAQData.update(
      {
        category_name,
        slug,
        sort_order,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCategory.dataValues.id } }
    );

    return resSuccess({ data: category });
  } catch (error) {
    throw error;
  }
};

export const addFAQQuestionAnswer = async (req: Request) => {
  try {
    const { id_category, question, answer, sort_order } = req.body;

    const category = await FAQData.create({
      id_parent: id_category || null,
      question,
      answer,
      sort_order,
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    return resSuccess({ data: category });
  } catch (error) {
    throw error;
  }
};

export const getAllFAQQuestionAnswer = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { category_name: { [Op.eq]: null } },
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              {
                question: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
              { answer: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await FAQData.count({
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

    const result = await FAQData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "question",
        "answer",
        "is_active",
        "created_date",
        "id_parent",
        "sort_order",
        [Sequelize.literal(`"FAQ_category"."category_name"`), "category_name"],
      ],
      include: [{ model: FAQData, as: "FAQ_category", attributes: [] }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdFAQQuestionAnswer = async (req: Request) => {
  try {
    const result = await FAQData.findOne({
      where: { is_deleted: DeletedStatus.No, id: req.params.id },
      attributes: [
        "id",
        "question",
        "answer",
        "is_active",
        "created_date",
        "id_parent",
        "sort_order",
        [Sequelize.literal(`"FAQ_category"."category_name"`), "category_name"],
      ],
      include: [{ model: FAQData, as: "FAQ_category", attributes: [] }],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const updateFAQQuestionAnswer = async (req: Request) => {
  try {
    const { id_category, question, answer, sort_order } = req.body;
    const findFAQQuestionAnswer = await FAQData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findFAQQuestionAnswer && findFAQQuestionAnswer.dataValues)) {
      return resNotFound();
    }
    await FAQData.update(
      {
        id_parent: id_category || null,
        question,
        answer,
        sort_order,
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
      },
      { where: { id: findFAQQuestionAnswer.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteFAQSection = async (req: Request) => {
  try {
    const findFAQSection = await FAQData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(findFAQSection && findFAQSection.dataValues)) {
      return resNotFound();
    }
    await FAQData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findFAQSection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForFAQSection = async (req: Request) => {
  try {
    const findFAQSection = await FAQData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findFAQSection && findFAQSection.dataValues)) {
      return resNotFound();
    }
    await FAQData.update(
      {
        is_active: statusUpdateValue(findFAQSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findFAQSection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getAllFAQSectionForUser = async (req: Request) => {
  try {
    const result = await FAQData.findAll({
      order: [["sort_order", "ASC"]],
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      attributes: [
        "id",
        "id_parent",
        "category_name",
        "is_active",
        "slug",
        "question",
        "answer",
        "created_date",
        "sort_order",
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
