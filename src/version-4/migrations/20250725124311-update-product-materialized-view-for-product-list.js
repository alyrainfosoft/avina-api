'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP MATERIALIZED VIEW IF EXISTS public.product_list_view;`)
    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_list_view
TABLESPACE pg_default
AS
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
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        ), without_center_diamond_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS diamond_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND pdo_1.id_type = 2 AND pdo_1.is_band IS FALSE
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    products.sort_description,
    products.created_date,
    products.product_type,
    products.setting_style_type,
    products.gender,
    products.id_collection,
    products.id_brand,
    products.setting_diamond_shapes,
    products.is_trending,
    products.parent_id,
    products.is_customization,
    products.company_info_id,
    products.meta_title,
    products.meta_description,
    products.meta_tag,
    products.is_band,
    products.is_single,
    products.is_choose_setting,
    products.setting_diamond_sizes,
    products.is_3d_product,
    products.additional_detail,
    products.certificate,
    products.retail_price,
    products.compare_price,
        CASE
            WHEN products.is_3d_product IS TRUE AND products.is_choose_setting = '1'::"bit" THEN ( SELECT ss.name
               FROM setting_styles ss
              WHERE ss.id = ANY (string_to_array(products.setting_style_type::text, '|'::text)::integer[])
             LIMIT 1)
            ELSE NULL::character varying
        END AS design_no,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_categories.id, 'id_category', product_categories.id_category, 'id_sub_category', product_categories.id_sub_category, 'id_sub_sub_category', product_categories.id_sub_sub_category, 'category_name', categories.slug, 'sub_category_name', sub_categories.slug, 'sub_sub_category', sub_sub_categories.slug)) AS product_categories,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL OR TRIM(BOTH FROM filtered_pmo.id_metal_tone) = ''::text THEN '{}'::integer[]
            ELSE string_to_array(TRIM(BOTH '|' FROM filtered_pmo.id_metal_tone::text), '|'::text)::integer[]
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
     LEFT JOIN product_categories ON product_categories.id_product = products.id AND product_categories.is_deleted = '0'::"bit"
     LEFT JOIN categories ON categories.id = product_categories.id_category
     LEFT JOIN categories sub_categories ON sub_categories.id = product_categories.id_sub_category
     LEFT JOIN categories sub_sub_categories ON sub_sub_categories.id = product_categories.id_sub_sub_category
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
     LEFT JOIN setting_styles ON setting_styles.id = ANY (string_to_array(products.setting_style_type::text, '|'::text)::integer[])
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit"
  GROUP BY products.id
WITH DATA;

ALTER TABLE IF EXISTS public.product_list_view
    OWNER TO postgres;


CREATE INDEX idx_pdo_id_shape
    ON public.product_list_view USING gin
    (jsonb_path_query_array(pdo, '$[*]."id_shape"'::jsonpath))
    TABLESPACE pg_default;
CREATE INDEX idx_product_categories_gin
    ON public.product_list_view USING gin
    (product_categories jsonb_path_ops)
    TABLESPACE pg_default;
CREATE INDEX idx_product_list_company_info_id
    ON public.product_list_view USING btree
    (company_info_id)
    TABLESPACE pg_default;
CREATE INDEX idx_product_list_company_parent
    ON public.product_list_view USING btree
    (company_info_id, parent_id)
    TABLESPACE pg_default;
CREATE INDEX idx_product_pdo_gin
    ON public.product_list_view USING gin
    (pdo jsonb_path_ops)
    TABLESPACE pg_default;
CREATE INDEX idx_product_pmo_gin
    ON public.product_list_view USING gin
    (pmo jsonb_path_ops)
    TABLESPACE pg_default;
CREATE UNIQUE INDEX idx_unique_product_view_id
    ON public.product_list_view USING btree
    (id)
    TABLESPACE pg_default;
      `)
  },
  

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
