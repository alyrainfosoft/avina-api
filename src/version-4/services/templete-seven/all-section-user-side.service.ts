import { QueryTypes } from "sequelize";
import { getCompanyIdBasedOnTheCompanyKey, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { DEFAULT_STATUS_CODE_SUCCESS, NOT_FOUND_MESSAGE } from "../../../utils/app-messages";
import { Request } from "express";
import { ActiveStatus, DeletedStatus, PRICE_CORRECTION_PRODUCT_TYPE, SingleProductType, TemplateSevenSectionType } from "../../../utils/app-enumeration";
export const templateSelevensAllSectionListForUser = async (req: any) => {
    try {
      const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
      let result = await (req.body.db_connection).query(
        `(SELECT 
            template_seven.id,
            template_seven.title,
            template_seven.sub_title,
            template_seven.sub_title_one,
            template_seven.description,
            template_seven.sub_description,
            id_categories,
            category.category_name AS category_name,
            category.slug AS slug,
            template_seven.link,
            template_seven.button_name,
            template_seven.button_color,
            template_seven.button_text_color,
            template_seven.is_button_transparent,
            template_seven.button_hover_color,
            template_seven.button_text_hover_color,
            template_seven.section_type,
            id_title_image,
            title_image.image_path AS title_image_path,
            id_product_image,
            product_image.image_path AS product_image_path,
            id_offer_image,
            offer_image.image_path AS offer_image_path,
            id_bg_image,
            bg_image.image_path AS bg_image_path,
            sort_order,
              CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::int[]
            ELSE string_to_array("template_seven"."id_products", '|')::int[]
          END as category_and_products,
CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::int[]
            ELSE string_to_array("template_seven"."id_products", '|')::int[]
          END as category_and_products,
template_seven.product_ids AS products,

         CASE
          WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'new_and_blog' THEN '{}'::json
            ELSE (
              SELECT json_agg(
                json_build_object(
                  'id', b.id,
                  'name', b.name,
                  'slug', b.slug,
                  'image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_image
                  ),
                  'banner_image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_banner_image
                  )
                )
              )
              FROM blogs b
              WHERE template_seven.section_type = 'new_and_blog'
              AND  b.id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as blogs   
          FROM template_seven
          LEFT OUTER JOIN images AS title_image ON template_seven.id_title_image = title_image.id
          LEFT OUTER JOIN images AS product_image ON template_seven.id_product_image = product_image.id
          LEFT OUTER JOIN images AS offer_image ON template_seven.id_offer_image = offer_image.id
          LEFT OUTER JOIN images AS bg_image ON template_seven.id_bg_image = bg_image.id
          LEFT OUTER JOIN categories AS category ON template_seven.id_categories = category.id
          WHERE template_seven.is_active = '${ActiveStatus.Active}' AND template_seven.is_deleted ='${DeletedStatus.No}' AND template_seven.company_info_id = ${company_info_id?.data}
          ORDER BY template_seven.sort_order ASC
          )`,
        { type: QueryTypes.SELECT }
      );
      const resultWithProduct = []
      for (let templateData of result) {
        console.log("templateData", templateData)
      let addCategoryProductDetail = [];
        if(templateData.category_and_products && templateData.category_and_products.length > 0) {
        const product =  await req.body.db_connection.query(`
            WITH filtered_pmo AS (
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
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
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
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_stone
            ELSE pdo.id_stone
        END, 'id_color',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_color
            ELSE pdo.id_color
        END, 'id_clarity',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_clarity
            ELSE pdo.id_clarity
        END, 'id_type', pdo.id_type, 'id_cuts',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_cuts
            ELSE pdo.id_clarity
        END)) AS pdo
   
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
     LEFT JOIN setting_styles ON setting_styles.id = ANY (string_to_array(products.setting_style_type::text, '|'::text)::integer[])
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit" AND products.parent_id IS NULL AND products.id IN (:product_ids)
  GROUP BY products.id
          `, { type: QueryTypes.SELECT,
            replacements: {
              product_ids: templateData.category_and_products
            }
        });
          addCategoryProductDetail = product;
        }
        let addProductDetail = [];
        if(templateData.products && templateData.products != null && templateData.products.length > 0 && templateData.section_type == TemplateSevenSectionType.BestSeller) {
        const product =  await req.body.db_connection.query(`
            WITH filtered_pmo AS (
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
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
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
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_stone
            ELSE pdo.id_stone
        END, 'id_color',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_color
            ELSE pdo.id_color
        END, 'id_clarity',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_clarity
            ELSE pdo.id_clarity
        END, 'id_type', pdo.id_type, 'id_cuts',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_cuts
            ELSE pdo.id_clarity
        END)) AS pdo
   
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
     LEFT JOIN setting_styles ON setting_styles.id = ANY (string_to_array(products.setting_style_type::text, '|'::text)::integer[])
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit" AND products.parent_id IS NULL AND products.id IN (:product_ids)
  GROUP BY products.id
          `, { type: QueryTypes.SELECT,
            replacements: {
              product_ids: templateData.products.map((item: any) => Number(item.id))
            }
        });
          addProductDetail = product;
        }
       resultWithProduct.push({...templateData, products: addProductDetail, category_and_products: addCategoryProductDetail})
      }
      const findRoundingValue = await req.body.db_connection.query(`
      SELECT * FROM price_corrections WHERE product_type In (:product_type) AND company_info_id = :company_info_id AND is_active = :is_active
    `, { type: QueryTypes.SELECT,
      replacements: {
        product_type: [PRICE_CORRECTION_PRODUCT_TYPE.DynamicProduct, PRICE_CORRECTION_PRODUCT_TYPE.ChooseSettingProduct],
        company_info_id: company_info_id?.data,
        is_active: ActiveStatus.Active
      }
    });
    const dynamicProductRoundingValue = findRoundingValue.find((item: any) => item.product_type === PRICE_CORRECTION_PRODUCT_TYPE.DynamicProduct);
    const chooseSettingProductRoundingValue = findRoundingValue.find((item: any) => item.product_type === PRICE_CORRECTION_PRODUCT_TYPE.ChooseSettingProduct);
      const priceFormateConvertData = []
      for (const item of resultWithProduct) { 
        let data = item

        if(item.category_and_products && data.category_and_products.length > 0) {
          data.category_and_products = await Promise.all(item.category_and_products.map(async(t: any) => {
            const productType = t.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? PRICE_CORRECTION_PRODUCT_TYPE.DynamicProduct : null
            const chooseSettingProductType = t.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? PRICE_CORRECTION_PRODUCT_TYPE.ChooseSettingProduct : null
           const productRoundValue = data.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? dynamicProductRoundingValue && dynamicProductRoundingValue.round_off ? {value: dynamicProductRoundingValue.round_off, flag: true} : {value: 0, flag: false} : {value: 0, flag: false}
          const chooseSettingProductRoundValue = data.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? chooseSettingProductRoundingValue && chooseSettingProductRoundingValue.round_off ? {value: chooseSettingProductRoundingValue.round_off, flag: true} : {value: 0, flag: false} : {value: 0, flag: false}
            return {
              ...t,
              pmo: await Promise.all( t.pmo.map(async(value: any) => ({
                ...value,
                Price: await req.formatPrice(value.Price, productType,productRoundValue),
                choose_style_price: await req.formatPrice(value.choose_style_price, chooseSettingProductType,chooseSettingProductRoundValue),
                catalogue_design_price: await req.formatPrice(
                  value.catalogue_design_price,null,{value: 0, flag: false}
                ),
                compare_price: await req.formatPrice(value.compare_price, productType,productRoundValue),
              }))),
            }
          } ))          
        }
        if (item.products && data.products.length > 0) {
          
          data.products = await Promise.all(item.products.map(async(t: any) => {
            const productType = t.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? PRICE_CORRECTION_PRODUCT_TYPE.DynamicProduct : null
            const chooseSettingProductType = t.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? PRICE_CORRECTION_PRODUCT_TYPE.ChooseSettingProduct : null
            const productRoundValue = data.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? dynamicProductRoundingValue && dynamicProductRoundingValue.round_off ? {value: dynamicProductRoundingValue.round_off, flag: true} : {value: 0, flag: false} : {value: 0, flag: false}
          const chooseSettingProductRoundValue = data.product_type == SingleProductType.DynemicPrice || SingleProductType.cataLogueProduct ? chooseSettingProductRoundingValue && chooseSettingProductRoundingValue.round_off ? {value: chooseSettingProductRoundingValue.round_off, flag: true} : {value: 0, flag: false} : {value: 0, flag: false}
            return {
              ...t,
              pmo: await Promise.all(t.pmo.map(async(value: any) => ({
                ...value,
                Price: await req.formatPrice(value.Price, productType,productRoundValue),
                choose_style_price: await req.formatPrice(value.choose_style_price, chooseSettingProductType,chooseSettingProductRoundValue),
                catalogue_design_price: await req.formatPrice(
                  value.catalogue_design_price,null,{value: 0, flag: false}
                ),
                compare_price: await req.formatPrice(value.compare_price, productType,productRoundValue),

              }))),
            }
          } ))
        }

        priceFormateConvertData.push(data);
      }
      
      return resSuccess({ data: priceFormateConvertData });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

export const templateSevensAllSectionDetailForUser = async (req: Request) => {
    try {
      const result = await (req.body.db_connection).query(
        `(SELECT 
            template_seven.id,
            template_seven.title,
            template_seven.sub_title,
            template_seven.sub_title_one,
            template_seven.description,
            template_seven.sub_description,
            id_categories,
            category.category_name AS category_name,
            category.slug AS slug,
            template_seven.link,
            template_seven.button_name,
            template_seven.button_color,
            template_seven.button_text_color,
            template_seven.is_button_transparent,
            template_seven.button_hover_color,
            template_seven.button_text_hover_color,
            template_seven.section_type,
            id_title_image,
            title_image.image_path AS title_image_path,
            id_product_image,
            product_image.image_path AS product_image_path,
            id_offer_image,
            offer_image.image_path AS offer_image_path,
            id_bg_image,
            bg_image.image_path AS bg_image_path,
            sort_order,
                     CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::int[]
            ELSE string_to_array("template_seven"."id_products", '|')::int[]
          END as category_and_products,
CASE
            WHEN "template_seven"."id_products" IS NULL or template_seven.section_type != 'category_and_products' THEN '{}'::int[]
            ELSE string_to_array("template_seven"."id_products", '|')::int[]
          END as category_and_products,
template_seven.product_ids AS products,
         CASE
          WHEN "template_seven"."id_products" IS NULL THEN '{}'::json
            ELSE (
              SELECT json_agg(
                json_build_object(
                  'id', b.id,
                  'name', b.name,
                  'slug', b.slug,
                  'image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_image
                  ),
                  'banner_image', (
                    SELECT i.image_path
                    FROM images i
                    WHERE i.id = b.id_banner_image
                  )
                )
              )
              FROM blogs b
              WHERE template_seven.section_type = 'new_and_blog'
              AND  b.id IN (
                SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
              )
            )
          END as blogs  
          FROM template_seven
          LEFT OUTER JOIN images AS title_image ON template_seven.id_title_image = title_image.id
          LEFT OUTER JOIN images AS product_image ON template_seven.id_product_image = product_image.id
          LEFT OUTER JOIN images AS offer_image ON template_seven.id_offer_image = offer_image.id
          LEFT OUTER JOIN images AS bg_image ON template_seven.id_bg_image = bg_image.id
          LEFT OUTER JOIN categories AS category ON template_seven.id_categories = category.id
          WHERE template_seven.is_active = '${ActiveStatus.Active}' AND template_seven.is_deleted ='${DeletedStatus.No}' AND template_seven.id = ${req.params.id} ORDER BY template_seven.sort_order ASC)`,
        { type: QueryTypes.SELECT }
      );
  
      const resultWithProduct = []
      for (let templateData of result) {
        console.log("templateData", templateData)
      let addCategoryProductDetail = [];
        if(templateData.category_and_products && templateData.category_and_products.length > 0) {
        const product =  await req.body.db_connection.query(`
            WITH filtered_pmo AS (
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
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
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
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_stone
            ELSE pdo.id_stone
        END, 'id_color',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_color
            ELSE pdo.id_color
        END, 'id_clarity',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_clarity
            ELSE pdo.id_clarity
        END, 'id_type', pdo.id_type, 'id_cuts',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_cuts
            ELSE pdo.id_clarity
        END)) AS pdo
   
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
     LEFT JOIN setting_styles ON setting_styles.id = ANY (string_to_array(products.setting_style_type::text, '|'::text)::integer[])
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit" AND products.parent_id IS NULL AND products.id IN (:product_ids)
  GROUP BY products.id
          `, { type: QueryTypes.SELECT,
            replacements: {
              product_ids: templateData.category_and_products
            }
        });
          addCategoryProductDetail = product;
        }
        let addProductDetail = [];
        if(templateData.products && templateData.products != null && templateData.products.length > 0 && templateData.section_type == TemplateSevenSectionType.BestSeller) {
        const product =  await req.body.db_connection.query(`
            WITH filtered_pmo AS (
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
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
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
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_stone
            ELSE pdo.id_stone
        END, 'id_color',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_color
            ELSE pdo.id_color
        END, 'id_clarity',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_clarity
            ELSE pdo.id_clarity
        END, 'id_type', pdo.id_type, 'id_cuts',
        CASE
            WHEN products.product_type = 1 OR products.product_type = 3 THEN dgm.id_cuts
            ELSE pdo.id_clarity
        END)) AS pdo
   
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
     LEFT JOIN setting_styles ON setting_styles.id = ANY (string_to_array(products.setting_style_type::text, '|'::text)::integer[])
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit" AND products.parent_id IS NULL AND products.id IN (:product_ids)
  GROUP BY products.id
          `, { type: QueryTypes.SELECT,
            replacements: {
              product_ids: templateData.products.map((item: any) => Number(item.id))
            }
        });
          addProductDetail = product;
        }
       resultWithProduct.push({...templateData, products: addProductDetail, category_and_products: addCategoryProductDetail})
      }

      if (!(result && result[0])) {
        return resNotFound({ message: NOT_FOUND_MESSAGE });
      }
      return resSuccess({ data: resultWithProduct[0] });
    } catch (error) {
      throw error;
    }
  };
  