import { Request } from "express";
import {
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  TemplateFour,
} from "../../../utils/app-enumeration";
import {
    
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { initModels } from "../../model/index.model";

export const addProductAndCategorySection = async (req: Request) => {
  try {
    const {
      title,
      id_categories,
      id_products,
      sort_order = null,
      title_color= null,
      bg_color,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
    } = req.body;
    const { TemplateFourData } = initModels(req);
    const trn = await (req.body.db_connection).transaction();
    try {
       
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idTitleImage = null;
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateFour,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        idTitleImage = imageData.data;
      }
      const TemplateFourOfferSlider = await TemplateFourData.create(
        {
          section_type: TemplateFour.LatestCollection,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != "" &&
            sort_order != null &&
            sort_order != undefined
              ? sort_order
              : 0,
          title_color,
          bg_color,
          link,
          button_name,
          button_color,
          button_text_color,
          is_button_transparent,
          button_hover_color,
          button_text_hover_color,
          title: title,
          id_products,
          id_categories,
          id_title_image: idTitleImage,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          temaplate_seven_offers_slider_id: TemplateFourOfferSlider?.dataValues?.id, data: {
            ...TemplateFourOfferSlider?.dataValues
          },section_type: TemplateFour.LatestCollection,
        }
      }], TemplateFourOfferSlider?.dataValues?.id, LogsActivityType.Add, LogsType.templateFourLatestCollection, req?.body?.session_res?.id_app_user,trn)
                      
      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const updateProductAndCategorySection = async (req: Request) => {
  try {
    const { TemplateFourData, Image } = initModels(req);
    const {
      title,
      id_categories,
      id_products,
      sort_order = null,
      title_image_delete = "0",
      title_color= null,
      bg_color,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
    } = req.body;

    const findDiamondShapeSection = await TemplateFourData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let titleImageId = null;
      let findTitleImage = null;
      if (findDiamondShapeSection.dataValues.id_title_image) {
        findTitleImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_title_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateFour,
          req.body.session_res.id_app_user,
          findTitleImage,
          req?.body?.session_res?.client_id,
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        titleImageId = imageData.data;
      }

      {
        await TemplateFourData.update(
          {
            section_type: TemplateFour.LatestCollection,
            id_title_image:
            title_image_delete && title_image_delete === "1"
              ? null
              : titleImageId != null
              ? titleImageId
              : findDiamondShapeSection.dataValues.id_title_image,
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            title: title,
            title_color,
            id_products,
            id_categories,
            bg_color,
            link,
            button_name,
            button_color,
            button_text_color,
            is_button_transparent,
            button_hover_color,
            button_text_hover_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: findDiamondShapeSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
      }
   
      if (title_image_delete && title_image_delete === "1" && findTitleImage.dataValues) {
        await imageDeleteInDBAndS3(req,findTitleImage,req.body.session_res.client_id);
      }
      const AfterUpdatefindDiamondShapeSection = await TemplateFourData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_offers_slider_id: findDiamondShapeSection?.dataValues?.id, data: {...findDiamondShapeSection?.dataValues}},
        new_data: {
          temaplate_seven_offers_slider_id: AfterUpdatefindDiamondShapeSection?.dataValues?.id, data: { ...AfterUpdatefindDiamondShapeSection?.dataValues }
        }
      }], findDiamondShapeSection?.dataValues?.id, LogsActivityType.Edit, LogsType.templateFourLatestCollection, req?.body?.session_res?.id_app_user,trn)
      
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const deleteProductAndCategorySection = async (req: Request) => {
  try {
    const { TemplateFourData } = initModels(req);
    const ProductAndCategorySection = await TemplateFourData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(ProductAndCategorySection && ProductAndCategorySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateFourData.update(
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
    }], ProductAndCategorySection?.dataValues?.id, LogsActivityType.Delete, LogsType.templateFourLatestCollection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getProductAndCategorySection = async (req: Request) => {
  try {
    let paginationProps = {};

    const { TemplateFourData,CategoryData, Image } = initModels(req);
    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateFour.LatestCollection},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              Sequelize.where(
                Sequelize.literal(`category.category_name`),
                {
                  [Op.iLike]: `%${pagination.search_text}%`,
                }
              ),
              Sequelize.literal(`
                EXISTS (
                  SELECT 1 FROM products p
                  WHERE p.id = ANY(string_to_array(template_four.id_products, ',')::int[])
                  AND p.sku ILIKE '%${pagination.search_text}%'
                  AND p.parent_id IS NULL
                )
              `),
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateFourData.count({
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

    const result = await TemplateFourData.findAll({
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
                WHEN  "template_four"."id_products" IS NULL THEN '{}'::int[]
                ELSE string_to_array( "template_four"."id_products", '|')::int[]
                END
            `),
            'id_products',
            ],
            'id_categories',
          'title_color',
          'bg_color',
          'link',
          'button_name',
          'button_color',
          'button_text_color',
          'is_button_transparent',
          'button_hover_color',
          'button_text_hover_color',
          'title',
          'id_title_image',
          [Sequelize.literal("category.slug"), "category_slug"],
          [Sequelize.literal("category.category_name"), "category_category_name"],
          [Sequelize.literal("title_image.image_path"), "title_image_path"]
      ],
        include:[{
            model:CategoryData,
            as:"category",
            attributes:[],
            where:{company_info_id :req?.body?.session_res?.client_id},
            required:false
        },
       { model: Image, as: "title_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ]
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
    throw error;
  }
};

export const statusUpdateForProductAndCategorySection = async (req: Request) => {
  try {
    const { TemplateFourData } = initModels(req);
    const ProductAndCategorySection = await TemplateFourData.findOne({
      where: {
        id: req.params.id,
        // section_type: { [Op.eq]:  TemplateFourSectionType.CategoryAndproductsSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(ProductAndCategorySection && ProductAndCategorySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateFourData.update(
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
    }], ProductAndCategorySection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.templateFourLatestCollection, req?.body?.session_res?.id_app_user)
     
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
