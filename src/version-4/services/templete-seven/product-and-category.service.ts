import { Request } from "express";
import {
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  TemplateSevenSectionType,
} from "../../../utils/app-enumeration";
import {
    
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { initModels } from "../../model/index.model";

export const upsertProductAndCategorySection = async (req: Request) => {
  let trn: any;
  try {
    const { TemplateSevenData } = initModels(req);
    trn = await req.body.db_connection.transaction();

    const clientId = req.body.session_res.client_id;
    const userId = req.body.session_res.id_app_user;

    const existingSections = await TemplateSevenData.findAll({
      where: {
        section_type: TemplateSevenSectionType.CategoryAndproductsSection,
        is_deleted: DeletedStatus.No,
        company_info_id: clientId,
      },
      transaction: trn,
    });

    const existingMap = new Map<number, any>();
    for (const section of existingSections) {
      existingMap.set(section.dataValues.id_categories, section);
    }

    const processedCategories = new Set();

    for (const { id_categories, id_products, sort_order = null } of req.body.products_and_category) {
      processedCategories.add(id_categories);
      const existing = existingMap.get(id_categories);

      const sortOrderValue = sort_order && sort_order !== "" && sort_order !== null ? sort_order : 0;
      const idProductsValue = id_products && id_products.length > 0 ? id_products.join("|") : null;

      if (existing) {
        // Update
        const oldData = { ...existing.dataValues };

        await TemplateSevenData.update(
          {
            section_type: TemplateSevenSectionType.CategoryAndproductsSection,
            is_deleted: DeletedStatus.No,
            sort_order: sortOrderValue,
            id_products: idProductsValue,
            modified_by: userId,
            modified_date: getLocalDate(),
          },
          {
            where: { id: existing.dataValues.id, company_info_id: clientId },
            transaction: trn,
          }
        );

        const updated = await TemplateSevenData.findOne({
          where: { id: existing.dataValues.id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        await addActivityLogs(req,
          clientId,
          [{
            old_data: {
              temaplate_seven_product_category_id: oldData.id,
              data: oldData,
            },
            new_data: {
              temaplate_seven_product_category_id: updated?.dataValues.id,
              data: updated?.dataValues,
            },
          }],
          oldData.id,
          LogsActivityType.Edit,
          LogsType.TemplateSevenCategoryAndproductsSection,
          userId,
          trn
        );
      } else {
        // Create
        const created = await TemplateSevenData.create(
          {
            section_type: TemplateSevenSectionType.CategoryAndproductsSection,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            sort_order: sortOrderValue,
            id_categories,
            id_products: idProductsValue,
            created_by: userId,
            created_date: getLocalDate(),
            company_info_id: clientId,
          },
          { transaction: trn }
        );

        await addActivityLogs(req,
          clientId,
          [{
            old_data: null,
            new_data: {
              temaplate_seven_product_category_id: created.dataValues.id,
              data: created.dataValues,
            },
          }],
          created.dataValues.id,
          LogsActivityType.Add,
          LogsType.TemplateSevenCategoryAndproductsSection,
          userId,
          trn
        );
      }
    }

    // Soft-delete 
    for (const section of existingSections) {
      if (!processedCategories.has(section.dataValues.id_categories)) {
        await TemplateSevenData.update(
          {
            is_deleted: DeletedStatus.yes,
            modified_by: userId,
            modified_date: getLocalDate(),
          },
          {
            where: { id: section.dataValues.id },
            transaction: trn,
          }
        );

          await addActivityLogs(req,
          clientId,
          [{
            old_data: null,
            new_data: {
              temaplate_seven_product_category_id: section.dataValues.id ,
              data: {...section.dataValues,is_deleted: DeletedStatus.yes},
            },
          }],
          section.dataValues.id,
          LogsActivityType.Delete,
          LogsType.TemplateSevenCategoryAndproductsSection,
          userId,
          trn
        );}
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
    const { TemplateSevenData } = initModels(req);
    const ProductAndCategorySection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
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
      { where: { id: ProductAndCategorySection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_product_category_id: ProductAndCategorySection?.dataValues?.id, data:{ ...ProductAndCategorySection?.dataValues} },
      new_data: {
        temaplate_seven_product_category_id: ProductAndCategorySection?.dataValues?.id, data: {
          ...ProductAndCategorySection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], ProductAndCategorySection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSevenCategoryAndproductsSection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getProductAndCategorySection = async (req: Request) => {
  try {
    let paginationProps = {};

    const { TemplateSevenData,CategoryData } = initModels(req);
    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
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
                WHEN "template_seven"."id_products" IS NULL THEN '{}'::int[]
                ELSE string_to_array("template_seven"."id_products", '|')::int[]
                END
            `),
            'id_products',
            ],
            'id_categories',
            [Sequelize.literal("category.slug"), "category_slug"],
            [Sequelize.literal("category.category_name"), "category_category_name"],
      ],
        include:[{
            model:CategoryData,
            as:"category",
            attributes:[],
            where:{company_info_id :req?.body?.session_res?.client_id},
            required:false
        }]
    });

    const products = []
    for (let data of result) {
      if(data.dataValues && data.dataValues.id_products && data.dataValues.id_products.length>0){
        const productDetail = await req.body.db_connection.query(
          `WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name,
            karats.calculate_rate AS karat_calculate_rate,
            pmo.company_info_id
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat AND karats.is_deleted = '0'::"bit" AND karats.is_active = '1'::"bit"
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat(web_config_setting.image_base_url, product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
             LEFT JOIN web_config_setting ON web_config_setting.company_info_id = product_images.company_info_id
          WHERE product_images.is_deleted = '0'::"bit" AND (product_images.image_type = ANY (ARRAY[1, 4]))
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(
                CASE
                    WHEN dgm_1.rate IS NOT NULL AND dgm_1.rate <> 0::double precision THEN dgm_1.rate
                    ELSE dgm_1.synthetic_rate
                END * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        ), without_center_diamond_price AS (
         SELECT pdo_1.id_product,
            sum(
                CASE
                    WHEN dgm_1.rate IS NOT NULL AND dgm_1.rate <> 0::double precision THEN dgm_1.rate
                    ELSE dgm_1.synthetic_rate
                END * pdo_1.weight::double precision * pdo_1.count::double precision) AS diamond_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND pdo_1.id_type = 2 AND pdo_1.is_band IS FALSE
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL OR TRIM(BOTH FROM filtered_pmo.id_metal_tone) = ''::text THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'compare_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'choose_style_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price - filtered_pmo.center_diamond_price::double precision
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
            END
        END)) AS pmo
   
   FROM products
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit" AND products.parent_id IS NULL AND products.id IN (:productId)
  GROUP BY products.id`, {
            type: QueryTypes.SELECT,
            replacements: { productId: data.dataValues.id_products },
  }
        )
        products.push({ ...data.dataValues, id_products: productDetail });
      }
    }
    return resSuccess({ data: noPagination ? result : { pagination, products } });
  } catch (error) {
    console.log("-------------------------", error)
    throw error;
  }
};

export const statusUpdateForProductAndCategorySection = async (req: Request) => {
  try {
    const { TemplateSevenData } = initModels(req);
    const ProductAndCategorySection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]:  TemplateSevenSectionType.CategoryAndproductsSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
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
      { where: { id: ProductAndCategorySection.dataValues.id ,company_info_id :req?.body?.session_res?.client_id} }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_product_category_id: ProductAndCategorySection?.dataValues?.id, data: {...ProductAndCategorySection?.dataValues} },
      new_data: {
        temaplate_seven_product_category_id: ProductAndCategorySection?.dataValues?.id, data: {
          ...ProductAndCategorySection?.dataValues, is_active: statusUpdateValue(ProductAndCategorySection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], ProductAndCategorySection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSevenCategoryAndproductsSection, req?.body?.session_res?.id_app_user)
     
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
