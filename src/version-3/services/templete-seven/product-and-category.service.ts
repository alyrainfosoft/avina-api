import { Request } from "express";
import dbContext from "../../../config/db-context";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resBadRequest,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  TemplateSevenSectionType,
} from "../../../utils/app-enumeration";
import {
    NOT_ABLE_TO_ADD_SAME_CATEGORY_ERROR_MESSAGE,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  YOU_CAN_NOT_CHANGE_CATEGORY_ERROR_MESSAGE,
} from "../../../utils/app-messages";
import Image from "../../model/image.model";
import { Op, Sequelize } from "sequelize";
import TemplateSevenData from "../../model/template-seven.model";
import categoryData from "../../model/category.model";

export const addAndUpdateProductAndCategorySection = async (req: Request) => {
  let trn: any;
  try {
    trn = await dbContext.transaction();


    // Find all current non-deleted category-product sections
    const existingSections = await TemplateSevenData.findAll({
      where: {
        section_type: TemplateSevenSectionType.CategoryAndproductsSection,
        is_deleted: DeletedStatus.No,
      },
      transaction: trn,
    });

    const existingCategoryMap = new Map();
    for (const section of existingSections) {
      existingCategoryMap.set(section.dataValues.id_categories, section);
    }

    // Track which categories are present in the payload
    const processedCategories = new Set();

    for (const { id_categories, id_products, sort_order = null } of req.body.products_and_category) {
      processedCategories.add(id_categories);

      const existingSection = existingCategoryMap.get(id_categories);

      const commonData = {
        section_type: TemplateSevenSectionType.CategoryAndproductsSection,
        sort_order:
          sort_order && sort_order !== "" && sort_order !== null && sort_order !== undefined ? sort_order : 0,
        id_products: id_products && id_products.length > 0 ? id_products.join("|") : null,
      };

      if (existingSection) {
        // Update
        await TemplateSevenData.update(
          {
            ...commonData,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: existingSection.dataValues.id },
            transaction: trn,
          }
        );
      } else {
        // Create
        await TemplateSevenData.create(
          {
            ...commonData,
            id_categories,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
      }
    }

    // Soft delete sections that exist in DB but not in incoming payload
    for (const section of existingSections) {
      if (!processedCategories.has(section.dataValues.id_categories)) {
        await TemplateSevenData.update(
          {
            is_deleted: DeletedStatus.yes,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: section.dataValues.id },
            transaction: trn,
          }
        );
      }
    }

    await trn.commit();
    return resSuccess();
  } catch (e) {
    if (trn) {
      await trn.rollback();
    }
    throw e;
  }
};

export const deleteProductAndCategorySection = async (req: Request) => {
  try {
    const ProductAndCategorySection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(ProductAndCategorySection && ProductAndCategorySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: ProductAndCategorySection.dataValues.id } }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getProductAndCategorySection = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { section_type:  TemplateSevenSectionType.CategoryAndproductsSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
             
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateSevenData.count({
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

    const result = await TemplateSevenData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by],['sort_order',"ASC"]],
      attributes: [
        "id",
        "is_active",
        "sort_order",
        // Using Sequelize.literal to process the id_products field if it's stored as a concatenated string
        [
            Sequelize.literal(`
                CASE
                WHEN "template_seven"."id_products" IS NULL THEN '{}'::json
                ELSE (
                    SELECT json_agg(json_build_object('id', id, 'name', name,'sku',sku,'pmo',pmo))
                    FROM product_list_view
                    WHERE id IN (
                    SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
                    )
                )
                END
            `),
            'id_products',
            ],
            'id_categories',
            [Sequelize.literal("category.slug"), "category_slug"],
            [Sequelize.literal("category.category_name"), "category_category_name"],
      ],
        include:[{
            model:categoryData,
            as:"category",
            attributes:[]
        }]
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForProductAndCategorySection = async (req: Request) => {
  try {
    const ProductAndCategorySection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]:  TemplateSevenSectionType.CategoryAndproductsSection },
        is_deleted: DeletedStatus.No,
      },
    });

    if (!(ProductAndCategorySection && ProductAndCategorySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(ProductAndCategorySection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: ProductAndCategorySection.dataValues.id } }
    );
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
