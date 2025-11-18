import { Request } from "express";
import { DeletedStatus, SingleProductType } from "../../utils/app-enumeration";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../utils/app-messages";
import { getCompanyIdBasedOnTheCompanyKey, resSuccess } from "../../utils/shared-functions";
import { initModels } from "../model/index.model";

export const dynamicProductExport = async (req: Request) => {
  try {
  
    const products = await (req.body.db_connection).query(
      `WITH ranked AS (
    SELECT 
        products.id AS product_id,
        PMO.id AS PMO_ID,
		CASE WHEN cat.category_name IS NULL THEN '' ELSE cat.category_name END as category,
		CASE WHEN sub_cat.category_name IS NULL THEN '' ELSE sub_cat.category_name END as sub_category,
		CASE WHEN sub_sub_cat.category_name IS NOT NULL THEN sub_sub_cat.category_name ELSE '' END as sub_sub_category,
		CASE WHEN products.name IS NOT NULL THEN products.name ELSE '' END AS name,
        CASE WHEN products.sku IS NOT NULL THEN products.sku ELSE '' END AS sku,
        CASE WHEN pp.sku IS NOT NULL THEN pp.sku ELSE '' END AS parent_sku,
        CASE WHEN products.meta_title IS NOT NULL THEN products.meta_title ELSE '' END AS meta_title,
        CASE WHEN products.meta_description IS NOT NULL THEN products.meta_description ELSE '' END AS meta_description,
        CASE WHEN products.meta_tag IS NOT NULL THEN products.meta_tag ELSE '' END AS meta_tag,
        cASE WHEN products.is_customization = '1' THEN TRUE ELSE FALSE END AS is_customization,
        CASE WHEN products.id_collection IS NOT NULL THEN (SELECT STRING_AGG(name, ' | ') FROM collections WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.id_collection, '|', ','), ',')::INTEGER[])) ELSE '' END AS collection,
        CASE WHEN products.tag IS NOT NULL THEN (SELECT STRING_AGG(name, ' | ') FROM tags WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.tag, '|', ','), ',')::INTEGER[])) ELSE '' END AS tag,
        CASE WHEN products.sort_description IS NOT NULL THEN products.sort_description  ELSE '' END AS short_description,
        CASE WHEN  products.long_description IS NOT NULL THEN products.long_description ELSE '' END AS long_description,
        CASE WHEN  products.making_charge IS NOT NULL THEN products.making_charge::text ELSE '' END AS labour_charge,
        CASE WHEN products.finding_charge IS NOT NULL THEN products.finding_charge::text ELSE '' END AS finding_charge,
        CASE WHEN products.other_charge IS NOT NULL THEN products.other_charge::text ELSE '' END AS other_charge,
		CASE WHEN metal.name IS NOT NULL THEN metal.name ELSE '' END AS metal,
        CASE WHEN karat.name IS NOT NULL THEN karat.name::text ELSE '' END AS karat,
        CASE WHEN pmo.id_metal_tone IS NOT NULL THEN (SELECT STRING_AGG(metal_tones.sort_code, '|') FROM metal_tones WHERE id = ANY(STRING_TO_ARRAY(REPLACE(pmo.id_metal_tone, '|', ','), ',')::INTEGER[])) ELSE '' END AS metal_tone,
        CASE WHEN pmo.metal_weight IS NOT NULL THEN pmo.metal_weight::text ELSE '' END AS metal_weight,
        CASE WHEN pmo.quantity IS NOT NULL THEN pmo.quantity::text ELSE '' END AS quantity,
		CASE WHEN pmo.id_karat IS NULL THEN metal.metal_rate*pmo.metal_weight ELSE (metal.metal_rate/metal.calculate_rate*karat.calculate_rate)*pmo.metal_weight END as metal_price,
		CASE WHEN products.gender IS NOT NULL THEN CASE 
            WHEN products.gender = '1' THEN 'male' 
            WHEN products.gender = '2' THEN 'female' 
            WHEN products.gender = '3' THEN 'unisex' 
            ELSE NULL 
        END ELSE '' END AS gender,
        products.additional_detail AS additional_detail,
        products.certificate AS certification,
        products.shipping_day AS shipping_days,
        (SELECT STRING_AGG(name, '|') FROM setting_styles WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.setting_style_type, '|', ','), ',')::INTEGER[])) AS setting_style_type,
        (SELECT STRING_AGG(size, '|') FROM items_sizes WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.size, '|', ','), ',')::INTEGER[])) AS size,
        (SELECT STRING_AGG(length, '|') FROM items_lengths WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.length, '|', ','), ',')::INTEGER[])) AS length,
		ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY pc.id) AS pcrn,
        ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY PMO.id) AS pmrn
    FROM products
    LEFT JOIN product_metal_options AS PMO 
        ON PMO.id_product = products.id 
        AND PMO.is_deleted = '0'
	LEFT JOIN product_categories AS pc ON pc.id_product = products.id AND pc.is_deleted = '0'
    LEFT JOIN categories AS cat ON cat.id = pc.id_category
    LEFT JOIN categories AS sub_cat ON sub_cat.id = pc.id_sub_category
    LEFT JOIN categories AS sub_sub_cat ON sub_sub_cat.id = pc.id_sub_sub_category
	LEFT JOIN metal_masters AS metal ON metal.id = pmo.id_metal
    LEFT JOIN gold_kts AS karat ON karat.id = pmo.id_karat
	LEFT JOIN products AS pp ON pp.id = products.parent_id
    WHERE products.is_deleted = '0' AND products.product_type IN (1,3) AND products.company_info_id = 1
),
diamond_ranked AS (
    SELECT 
        products.id AS product_id,
        PDO.id AS PDO_ID,
		stone.name AS stone,
        shape.name AS shape,
        mm.value AS mm_size,
        col.value AS color,
        cla.value AS clarity,
        cut.value AS cut,
        CASE 
            WHEN pdo.id_type = 1 THEN 'centre' 
            WHEN pdo.id_type = 2 THEN 'side' 
            ELSE NULL 
        END AS stone_type,
        setting.name AS stone_setting,
        pdo.weight AS stone_weight,
        pdo.count AS stone_count,
		CASE WHEN DGM.rate IS NOT NULL AND DGM.rate != 0 THEN DGM.rate ELSE DGM.synthetic_rate END * pdo.weight*pdo.count as diamond_price,
        ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY PDO.id) AS pdrn
    FROM products
    LEFT JOIN product_diamond_options AS PDO 
        ON PDO.id_product = products.id 
        AND PDO.is_deleted = '0'
	INNER JOIN diamond_group_masters AS DGM ON DGM.id = pdo.id_diamond_group
    LEFT JOIN gemstones AS stone ON stone.id = DGM.id_stone
    LEFT JOIN setting_styles AS setting ON setting.id = pdo.id_setting
    LEFT JOIN diamond_shapes AS shape ON shape.id = DGM.id_shape
    LEFT JOIN mm_sizes AS mm ON mm.id = DGM.id_mm_size
    LEFT JOIN colors AS col ON col.id = DGM.id_color
    LEFT JOIN clarities AS cla ON cla.id = DGM.id_clarity
    LEFT JOIN cuts AS cut ON cut.id = DGM.id_cuts
    WHERE products.is_deleted = '0' AND products.product_type IN (1,3) AND products.company_info_id = 1
),
diamond_totals AS (
    SELECT 
        products.id AS product_id,
        SUM(
            CASE WHEN DGM.rate IS NOT NULL AND DGM.rate != 0 
                 THEN DGM.rate ELSE DGM.synthetic_rate END 
                 * pdo.weight * pdo.count
        ) AS total_diamond_price
    FROM products
    LEFT JOIN product_diamond_options AS PDO 
        ON PDO.id_product = products.id 
        AND PDO.is_deleted = '0'
    INNER JOIN diamond_group_masters AS DGM 
        ON DGM.id = pdo.id_diamond_group
    WHERE products.is_deleted = '0' 
      AND products.product_type IN (1,3) 
      AND products.company_info_id = 1
    GROUP BY products.id
)

SELECT 
    
    CASE WHEN pmrn = 1 then 1 ELSE 0  END as parent_id,
 CASE WHEN pmrn = 1 THEN category ELSE '' END as category,
	CASE WHEN pmrn = 1 THEN sub_category ELSE '' END as sub_category,
	CASE WHEN pmrn = 1 THEN sub_sub_category ELSE '' END AS sub_sub_category,
	CASE WHEN pmrn = 1 THEN name ELSE '' END AS name,
    CASE WHEN pmrn = 1 THEN sku ELSE '' END AS sku,
 	CASE WHEN pmrn = 1 THEN parent_sku ELSE '' END AS parent_sku,
 	CASE WHEN pmrn = 1 THEN is_customization::text ELSE ''  END AS is_customization,
 	CASE WHEN pmrn = 1 THEN collection ELSE '' END AS collection,
 	CASE WHEN pmrn = 1 THEN tag ELSE '' END AS tag,
 	CASE WHEN pmrn = 1 THEN short_description ELSE '' END AS short_description,
 	CASE WHEN pmrn = 1 THEN long_description ELSE '' END AS long_description,
 	CASE WHEN pmrn = 1 THEN CASE WHEN labour_charge IS NULL THEN '' ELSE labour_charge::text END ELSE ''  END AS labour_charge,
 	CASE WHEN pmrn = 1 THEN finding_charge  ELSE '' END AS finding_charge,
 	CASE WHEN pmrn = 1 THEN other_charge ELSE '' END  AS other_charge,
 	CASE WHEN pmrn = 1 THEN setting_style_type ELSE '' END AS setting_style_type,
 	CASE WHEN pmrn = 1 THEN CASE WHEN size IS NOT NULL THEN size ELSE '' END ELSE '' END AS size,
 	CASE WHEN pmrn = 1 THEN CASE WHEN length IS NOT NULL THEN length ELSE '' END ELSE '' END AS length,
	CASE WHEN metal IS NOT NULL THEN metal ELSE '' END AS metal,
	CASE WHEN karat IS NOT NULL THEN karat ELSE '' END AS karat,
	CASE WHEN metal_tone IS NOT NULL THEN metal_tone ELSE '' END AS metal_tone,
	CASE WHEN metal_weight IS NOT NULL THEN metal_weight ELSE '' END AS	metal_weight,
	CASE WHEN quantity IS NOT NULL THEN quantity ELSE '' END AS	quantity,
	CASE WHEN metal_price IS NOT NULL THEN ROUND(metal_price::numeric, 2)::text  ELSE '' END AS metal_price,
	CASE WHEN d.stone IS NOT NULL THEN d.stone ELSE '' END AS stone,
	CASE WHEN d.shape IS NOT NULL THEN d.shape ELSE '' END AS shape	,
	CASE WHEN mm_size IS NOT NULL THEN mm_size ELSE '' END as mm_size,
	CASE WHEN color IS NOT NULL THEN color ELSE '' END	color,
	CASE WHEN clarity IS NOT NULL THEN clarity ELSE '' END clarity,
	CASE WHEN cut IS NOT NULL THEN cut ELSE '' END cut,
	CASE WHEN stone_type IS NOT NULL THEN stone_type ELSE '' END stone_type,
	CASE WHEN stone_setting IS NOT NULL THEN stone_setting ELSE '' END stone_setting,
	CASE WHEN stone_weight IS NOT NULL THEN stone_weight::text ELSE '' END stone_weight,
	CASE WHEN stone_count IS NOT NULL THEN stone_count::text ELSE '' END stone_count,
	CASE WHEN diamond_price IS NOT NULL THEN ROUND(diamond_price::numeric,2)::text ELSE '' END diamond_price,
	CASE WHEN metal_price IS NOT NULL THEN CEIL(ROUND(metal_price::numeric, 2)+ROUND(dt.total_diamond_price::numeric, 2)
	+finding_charge::numeric+other_charge::numeric+labour_charge::numeric)::text  ELSE '' END AS total_product_price,
	CASE WHEN pmrn = 1 THEN CASE WHEN gender IS NOT NULL THEN gender ELSE '' END ELSE '' END AS gender,
	CASE WHEN pmrn = 1 THEN CASE WHEN additional_detail IS NOT NULL THEN additional_detail ELSE '' END ELSE '' END AS additional_detail,
	CASE WHEN pmrn = 1 THEN CASE WHEN certification IS NOT NULL THEN certification ELSE '' END ELSE '' END AS certification,
	CASE WHEN pmrn = 1 THEN CASE WHEN shipping_days IS NOT NULL THEN shipping_days::text ELSE '' END ELSE '' END AS shipping_days,
	CASE WHEN r.meta_title IS NOT NULL THEN r.meta_title ELSE '' END AS meta_title,
    CASE WHEN r.meta_description IS NOT NULL THEN r.meta_description ELSE '' END AS meta_description,
    CASE WHEN r.meta_tag IS NOT NULL THEN r.meta_tag ELSE '' END AS meta_tag
FROM ranked r
LEFT JOIN diamond_ranked d 
    ON r.product_id = d.product_id 
    AND r.pmrn = d.pdrn  
LEFT JOIN diamond_totals dt ON r.product_id = dt.product_id
ORDER BY r.product_id, r.pmrn`,
      { type: QueryTypes.SELECT }
    );

    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};

export const variantProductExport = async (req: Request) => {
  try {

    const products = await (req.body.db_connection).query(
      `WITH ranked AS (
    SELECT 
        products.id AS product_id,
        PMO.id AS PMO_ID,
		CASE WHEN cat.category_name IS NULL THEN '' ELSE cat.category_name END as category,
		CASE WHEN sub_cat.category_name IS NULL THEN '' ELSE sub_cat.category_name END as sub_category,
		CASE WHEN sub_sub_cat.category_name IS NOT NULL THEN sub_sub_cat.category_name ELSE '' END as sub_sub_category,
		CASE WHEN products.name IS NOT NULL THEN products.name ELSE '' END AS name,
        CASE WHEN products.sku IS NOT NULL THEN products.sku ELSE '' END AS sku,
         CASE WHEN products.meta_title IS NOT NULL THEN products.meta_title ELSE '' END AS meta_title,
        CASE WHEN products.meta_description IS NOT NULL THEN products.meta_description ELSE '' END AS meta_description,
        CASE WHEN products.meta_tag IS NOT NULL THEN products.meta_tag ELSE '' END AS meta_tag,
        CASE WHEN products.id_collection IS NOT NULL THEN (SELECT STRING_AGG(name, ' | ') FROM collections WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.id_collection, '|', ','), ',')::INTEGER[])) ELSE '' END AS collection,
        CASE WHEN id_brand IS NOT NULL THEN brand.name ELSE '' END as brand,
		CASE WHEN products.tag IS NOT NULL THEN (SELECT STRING_AGG(name, ' | ') FROM tags WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.tag, '|', ','), ',')::INTEGER[])) ELSE '' END AS tag,
        CASE WHEN products.sort_description IS NOT NULL THEN products.sort_description  ELSE '' END AS short_description,
        CASE WHEN  products.long_description IS NOT NULL THEN products.long_description ELSE '' END AS long_description,
		CASE WHEN is_quantity_track IS NOT NULL THEN is_quantity_track ELSE FALSE END as is_quantity_track,
		CASE WHEN items_sizes.size IS NOT NULL THEN items_sizes.size ELSE '' END as size,
		CASE WHEN items_lengths.length IS NOT NULL THEN items_lengths.length ELSE '' END as length,
		CASE WHEN metal.name IS NOT NULL THEN metal.name ELSE '' END AS metal,
        CASE WHEN karat.name IS NOT NULL THEN karat.name::text ELSE '' END AS karat,
        CASE WHEN id_m_tone IS NOT NULL THEN metal_tone.sort_code ELSE '' END as metal_tone,
        CASE WHEN pmo.metal_weight IS NOT NULL THEN pmo.metal_weight::text ELSE '' END AS metal_weight,
        CASE WHEN pmo.quantity IS NOT NULL THEN pmo.quantity::text ELSE '' END AS quantity,
		CASE WHEN side_dia_weight IS NOT NULL THEN side_dia_weight::text ELSE '' END as side_dia_weight,
		CASE WHEN side_dia_count IS NOT NULL THEN side_dia_count::text ELSE '' END as side_dia_count,
		CASE WHEN PMO.retail_price IS NOT NULL THEN PMO.retail_price::text ELSE '' END as retail_price,
		CASE WHEN PMO.compare_price IS NOT NULL THEN PMO.compare_price::text ELSE '' END as compare_price,
		CASE WHEN products.gender IS NOT NULL THEN CASE 
            WHEN products.gender = '1' THEN 'male' 
            WHEN products.gender = '2' THEN 'female' 
            WHEN products.gender = '3' THEN 'unisex' 
            ELSE NULL 
        END ELSE '' END AS gender,
        products.additional_detail AS additional_detail,
        products.certificate AS certification,
        products.shipping_day AS shipping_days,
        (SELECT STRING_AGG(name, '|') FROM setting_styles WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.setting_style_type, '|', ','), ',')::INTEGER[])) AS setting_style_type,
		ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY pc.id) AS pcrn,
        ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY PMO.id) AS pmrn
    FROM products
    LEFT JOIN product_metal_options AS PMO 
        ON PMO.id_product = products.id 
        AND PMO.is_deleted = '0'
	LEFT JOIN items_sizes ON items_sizes.id = PMO.id_size
	LEFT JOIN items_lengths ON items_lengths.id = PMO.id_length
	LEFT JOIN product_categories AS pc ON pc.id_product = products.id AND pc.is_deleted = '0'
    LEFT JOIN categories AS cat ON cat.id = pc.id_category
    LEFT JOIN categories AS sub_cat ON sub_cat.id = pc.id_sub_category
    LEFT JOIN categories AS sub_sub_cat ON sub_sub_cat.id = pc.id_sub_sub_category
	LEFT JOIN metal_masters AS metal ON metal.id = pmo.id_metal
    LEFT JOIN gold_kts AS karat ON karat.id = pmo.id_karat
	LEFT JOIN brands as brand ON brand.id = products.id_brand
	LEFT JOIN metal_tones as metal_tone ON metal_tone.id = PMO.id_m_tone
    WHERE products.is_deleted = '${DeletedStatus.No}' AND products.product_type = ${SingleProductType.VariantType} AND products.company_info_id = ${req?.body?.session_res?.client_id}
),
diamond_ranked AS (
    SELECT 
        products.id AS product_id,
        PDO.id AS PDO_ID,
		stone.name AS stone,
        shape.name AS shape,
        mm.value AS mm_size,
        col.value AS color,
        cla.value AS clarity,
        cut.value AS cut,
        CASE 
            WHEN pdo.id_type = 1 THEN 'centre' 
            WHEN pdo.id_type = 2 THEN 'side' 
            ELSE NULL 
        END AS stone_type,
        setting.name AS stone_setting,
        pdo.weight AS stone_weight,
        pdo.count AS stone_count,
        ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY PDO.id) AS pdrn
    FROM products
    LEFT JOIN product_diamond_options AS PDO 
        ON PDO.id_product = products.id 
        AND PDO.is_deleted = '0'
    LEFT JOIN gemstones AS stone ON stone.id = PDO.id_stone
    LEFT JOIN setting_styles AS setting ON setting.id = pdo.id_setting
    LEFT JOIN diamond_shapes AS shape ON shape.id = PDO.id_shape
    LEFT JOIN mm_sizes AS mm ON mm.id = PDO.id_mm_size
    LEFT JOIN colors AS col ON col.id = PDO.id_color
    LEFT JOIN clarities AS cla ON cla.id = PDO.id_clarity
    LEFT JOIN cuts AS cut ON cut.id = PDO.id_cut
    WHERE products.is_deleted = '${DeletedStatus.No}' AND products.product_type = ${SingleProductType.VariantType} AND products.company_info_id = ${req?.body?.session_res?.client_id}
) 
SELECT 
  CASE WHEN r.meta_title IS NOT NULL THEN r.meta_title ELSE '' END AS meta_title,
  CASE WHEN r.meta_description IS NOT NULL THEN r.meta_description ELSE '' END AS meta_description,
  CASE WHEN r.meta_tag IS NOT NULL THEN r.meta_tag ELSE '' END AS meta_tag,
  CASE WHEN pmrn = 1 then 1 ELSE 0  END as parent_id,
 	CASE WHEN pmrn = 1 THEN category ELSE '' END as category,
	CASE WHEN pmrn = 1 THEN sub_category ELSE '' END as sub_category,
	CASE WHEN pmrn = 1 THEN sub_sub_category ELSE '' END AS sub_sub_category,
	CASE WHEN pmrn = 1 THEN name ELSE '' END AS title,
    CASE WHEN pmrn = 1 THEN sku ELSE '' END AS sku,
	CASE WHEN pmrn = 1 THEN brand ELSE '' END as brand,
 	CASE WHEN pmrn = 1 THEN collection ELSE '' END AS collection,
	CASE WHEN pmrn = 1 THEN CASE WHEN gender IS NOT NULL THEN gender ELSE '' END ELSE '' END AS gender,
 	CASE WHEN pmrn = 1 THEN tag ELSE '' END AS tag,
 	CASE WHEN pmrn = 1 THEN short_description ELSE '' END AS short_description,
 	CASE WHEN pmrn = 1 THEN long_description ELSE '' END AS long_description,
 	CASE WHEN pmrn = 1 THEN setting_style_type ELSE '' END AS setting_style_type,
	CASE WHEN pmrn = 1 THEN is_quantity_track::text ELSE '' END AS is_quantity_track,
 	CASE WHEN size IS NOT NULL THEN size ELSE '' END AS size,
 	CASE WHEN length IS NOT NULL THEN length ELSE '' END AS length,
	CASE WHEN metal IS NOT NULL THEN metal ELSE '' END AS metal,
	CASE WHEN karat IS NOT NULL THEN karat ELSE '' END AS karat,
	CASE WHEN metal_tone IS NOT NULL THEN metal_tone ELSE '' END AS metal_tone,
	CASE WHEN metal_weight IS NOT NULL THEN metal_weight ELSE '' END AS	metal_weight,
	CASE WHEN quantity IS NOT NULL THEN quantity ELSE '' END AS	quantity,
	CASE WHEN side_dia_weight IS NOT NULL THEN side_dia_weight ELSE '' END side_dia_weight,
	CASE WHEN side_dia_count IS NOT NULL THEN side_dia_count ELSE '' END side_dia_count,
	CASE WHEN retail_price IS NOT NULL THEN retail_price::text ELSE '' END retail_price,
	CASE WHEN compare_price IS NOT NULL THEN compare_price::text ELSE '' END compare_price,
	CASE WHEN stone_type IS NOT NULL THEN stone_type ELSE '' END stone_type,
	CASE WHEN d.stone IS NOT NULL THEN d.stone ELSE '' END AS stone,
	'' as stone_category,
	CASE WHEN pmrn = 1 THEN CASE WHEN certification IS NOT NULL THEN certification ELSE '' END ELSE '' END AS certification,
	CASE WHEN d.shape IS NOT NULL THEN d.shape ELSE '' END AS shape	,
	CASE WHEN mm_size IS NOT NULL THEN mm_size ELSE '' END as mm_size,
	CASE WHEN color IS NOT NULL THEN color ELSE '' END	color,
	CASE WHEN clarity IS NOT NULL THEN clarity ELSE '' END clarity,
	CASE WHEN cut IS NOT NULL THEN cut ELSE '' END cut,
	CASE WHEN stone_setting IS NOT NULL THEN stone_setting ELSE '' END stone_setting,
	CASE WHEN stone_weight IS NOT NULL THEN stone_weight::text ELSE '' END stone_weight,
	CASE WHEN stone_count IS NOT NULL THEN stone_count::text ELSE '' END stone_count,
	CASE WHEN pmrn = 1 THEN CASE WHEN additional_detail IS NOT NULL THEN additional_detail ELSE '' END ELSE '' END AS additional_detail,
	CASE WHEN pmrn = 1 THEN CASE WHEN shipping_days IS NOT NULL THEN shipping_days::text ELSE '' END ELSE '' END AS shipping_days
FROM ranked r
LEFT JOIN diamond_ranked d 
    ON r.product_id = d.product_id 
    AND r.pmrn = d.pdrn  
 
ORDER BY r.product_id, r.pmrn`,
      { type: QueryTypes.SELECT }
    );

    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};

export const ringConfiguratorProductExport = async (req: Request) => {
  try {
    const {ConfigProduct,HeadsData, ShanksData,SideSettingStyles, MetalMaster, GoldKarat, DiamondGroupMaster, ConfigProductMetals, ConfigProductDiamonds, StoneData, DiamondCaratSize, DiamondShape, MMSizeData, ClarityData, Colors, CutsData} = initModels(req);

    const products = await req.body.db_connection.query(
      `WITH ranked AS (
    SELECT 
        config_products.id AS product_id,
       	config_products.product_type as product_type,
		'' as product_style,
		config_products.product_title,
		config_products.sku,
		shanks.name as shank_type,
		side_setting.name as setting_type,
		heads.name as head_type,
		carat.value as center_dia_wt,
		shape.name as center_dia_shape,
		'' as center_dia_mm_size,
		stone.name as center_stone,
		color.value as center_dia_color,
		clarity.value as center_dia_clarity,
		cut.value as center_dia_cut,
	config_products.head_no,
	config_products.shank_no,
	config_products.band_no,
	pmo.head_shank_band,
	metal.name as metal,
	karat.name as karat,
	pmo.metal_wt as metal_wt,
	pmo.labor_charge,
	CASE WHEN center_dia_type = 1 THEN CDGM.rate ELSE CDGM.synthetic_rate END*
	CASE WHEN stone.is_diamond = 1 THEN 
		CASE WHEN CDGM.average_carat::numeric IS NOT NULL THEN CDGM.average_carat::numeric ELSE carat.value::double precision END
	ELSE 1 END
	as center_dia_price,
	CASE WHEN pmo.karat_id IS NULL THEN metal.metal_rate*pmo.metal_wt ELSE (metal.metal_rate/metal.calculate_rate*karat.calculate_rate)*pmo.metal_wt END as metal_price,
	SUM(
            CASE WHEN head_shank_band ILIKE 'band' THEN 0 ELSE CASE WHEN pmo.karat_id IS NULL THEN metal.metal_rate*pmo.metal_wt 
			ELSE (metal.metal_rate/metal.calculate_rate*karat.calculate_rate)*pmo.metal_wt END
			END
        ) OVER (PARTITION BY config_products.id) AS with_out_band_metal_price,
	SUM(
            CASE WHEN pmo.karat_id IS NULL THEN metal.metal_rate*pmo.metal_wt 
			ELSE (metal.metal_rate/metal.calculate_rate*karat.calculate_rate)*pmo.metal_wt END
        ) OVER (PARTITION BY config_products.id) AS with_band_metal_price,
	SUM(
            CASE WHEN head_shank_band ILIKE 'band' THEN 0 ELSE pmo.labor_charge
			END
        ) OVER (PARTITION BY config_products.id) AS with_out_band_labour_change,
	SUM(
           pmo.labor_charge
        ) OVER (PARTITION BY config_products.id) AS with_band_labour_change,
        ROW_NUMBER() OVER (PARTITION BY config_products.id ORDER BY PMO.id) AS pmrn
    FROM config_products
    LEFT JOIN config_product_metals AS PMO 
        ON PMO.config_product_id = config_products.id 
        AND PMO.is_deleted = '0'
	LEFT JOIN shanks ON shanks.id = config_products.shank_type_id
	LEFT JOIN heads on heads.id = config_products.head_type_id
	LEFT JOIN side_setting_styles as side_setting ON side_Setting.id = config_products.side_setting_id
	LEFT JOIN diamond_group_masters as CDGM ON CDGM.id = center_diamond_group_id
	LEFT JOIN carat_sizes as carat ON carat.id = CDGM.id_carat
	LEFT JOIN diamond_shapes as shape ON shape.id = CDGM.id_shape
	LEFT JOIN gemstones as stone ON stone.id = CDGM.id_stone
	LEFT JOIN colors as color ON color.id = CDGM.id_color
	LEFT JOIN clarities as clarity ON clarity.id = CDGM.id_clarity
	LEFT JOIN cuts as cut ON cut.id = CDGM.id_cuts
	LEFT JOIN metal_masters AS metal ON metal.id = pmo.metal_id
    LEFT JOIN gold_kts AS karat ON karat.id = pmo.karat_id
    WHERE config_products.is_deleted = '0' AND config_products.product_type ILIKE 'Ring' AND config_products.company_info_id = 1
),
diamond_ranked AS (
    SELECT 
        config_products.id AS product_id,
		PDO.product_type as side_dia_prod_type,
        PDO.id AS PDO_ID,
		stone.name AS stone,
        shape.name AS shape,
        mm.value AS mm_size,
        col.value AS color,
        cla.value AS clarity,
        cut.value AS cut,
        pdo.dia_weight AS stone_weight,
        pdo.dia_count AS stone_count,
		CASE WHEN DGM.rate IS NOT NULL AND DGM.rate != 0 THEN DGM.rate ELSE DGM.synthetic_rate END * pdo.dia_weight*pdo.dia_count as diamond_price,
        ROW_NUMBER() OVER (PARTITION BY config_products.id ORDER BY PDO.id) AS pdrn
    FROM config_products
    LEFT JOIN config_product_diamonds AS PDO 
        ON PDO.config_product_id = config_products.id 
        AND PDO.is_deleted = '0'
	INNER JOIN diamond_group_masters AS DGM ON DGM.id = pdo.id_diamond_group
    LEFT JOIN gemstones AS stone ON stone.id = DGM.id_stone
    LEFT JOIN diamond_shapes AS shape ON shape.id = DGM.id_shape
    LEFT JOIN mm_sizes AS mm ON mm.id = DGM.id_mm_size
    LEFT JOIN colors AS col ON col.id = DGM.id_color
    LEFT JOIN clarities AS cla ON cla.id = DGM.id_clarity
    LEFT JOIN cuts AS cut ON cut.id = DGM.id_cuts
     WHERE config_products.is_deleted = '0' AND config_products.product_type ILIKE 'Ring' AND config_products.company_info_id = 1
),
product_price AS (
    SELECT 
        products.id AS product_id,
        SUM(
           CASE WHEN PDO.product_type ILIKE 'band' THEN 0 ELSE CASE WHEN DGM.rate IS NOT NULL AND DGM.rate != 0 
                 THEN DGM.rate ELSE DGM.synthetic_rate END 
                 * pdo.dia_weight * pdo.dia_count END
        ) AS with_out_band_diamond_price,
	SUM(
           CASE WHEN DGM.rate IS NOT NULL AND DGM.rate != 0 
                 THEN DGM.rate ELSE DGM.synthetic_rate END 
                 * pdo.dia_weight * pdo.dia_count
        ) AS with_band_diamond_price
    FROM config_products as products
    LEFT JOIN config_product_diamonds AS PDO 
        ON PDO.config_product_id = products.id 
        AND PDO.is_deleted = '0'
    INNER JOIN diamond_group_masters AS DGM 
        ON DGM.id = pdo.id_diamond_group
   WHERE products.is_deleted = '0' AND products.product_type ILIKE 'Ring' AND products.company_info_id = 1
    GROUP BY products.id
) 
SELECT 
    
    CASE WHEN pmrn = 1 then 1 ELSE 0  END as parent_id,
    CASE WHEN pmrn = 1 then product_title ELSE ''  END as product_title ,
    CASE WHEN pmrn = 1 then sku ELSE '' END as sku,
	CASE WHEN pmrn = 1 THEN product_type ELSE '' END as product_type,
 	'' as product_style,
	CASE WHEN pmrn = 1 THEN shank_type ELSE '' END as shank_type,
	CASE WHEN pmrn = 1 THEN setting_type ELSE '' END as setting_type,
	CASE WHEN pmrn = 1 THEN head_type ELSE '' END as head_type,
	CASE WHEN pmrn = 1 THEN center_stone ELSE '' END as center_stone,
	CASE WHEN pmrn = 1 THEN center_dia_wt ELSE '' END as center_dia_wt,
	CASE WHEN pmrn = 1 THEN center_dia_shape ELSE '' END as center_dia_shape,
	CASE WHEN pmrn = 1 THEN center_dia_mm_size ELSE '' END as center_dia_mm_size,
	CASE WHEN pmrn = 1 THEN CASE WHEN center_dia_color IS NOT NULL THEN center_dia_color ELSE '' END ELSE '' END as center_dia_color,
	CASE WHEN pmrn = 1 THEN CASE WHEN center_dia_clarity IS NOT NULL THEN center_dia_clarity ELSE '' END ELSE '' END as center_dia_clarity,
	CASE WHEN pmrn = 1 THEN CASE WHEN center_dia_cut IS NOT NULL THEN center_dia_cut ELSE '' END ELSE '' END as center_dia_cut,
	CASE WHEN side_dia_prod_type IS NOT NULL THEN side_dia_prod_type ELSE '' END as side_dia_prod_type,
	CASE WHEN stone IS NOT NULL THEN stone ELSE '' END as product_dia_type,
	CASE WHEN shape IS NOT NULL THEN shape ELSE '' END as product_dia_shape,
	'' as product_dia_mm_size,
	CASE WHEN clarity IS NOT NULL THEN clarity ELSE '' END as product_dia_clarity,
	CASE WHEN color IS NOT NULL THEN color ELSE '' END as product_dia_color,
	CASE WHEN cut IS NOT NULL THEN cut ELSE '' END as product_dia_cut,
	CASE WHEN stone_weight IS NOT NULL THEN stone_weight::text ELSE '' END as product_dia_carat,
	CASE WHEN stone_count IS NOT NULL THEN stone_count::text ELSE '' END as product_dia_count,
	CASE WHEN diamond_price IS NOT NULL THEN diamond_price::text ELSE '' END as diamond_price,
	CASE WHEN pmrn = 1 THEN head_no ELSE '' END as head_no,
	CASE WHEN pmrn = 1 THEN shank_no ELSE '' END as shank_no,
	CASE WHEN pmrn = 1 THEN band_no ELSE '' END as band_no,
	CASE WHEN head_shank_band IS NOT NULL THEN head_shank_band ELSE '' END as head_shank,
	CASE WHEN metal IS NOT NULL THEN metal ELSE '' END as metal,
	CASE WHEN karat IS NOT NULL THEN karat::text ELSE '' END AS karat,
	CASE WHEN metal_wt IS NOT NULL THEN metal_wt::text ELSE '' END AS	metal_weight,
	CASE WHEN metal_price IS NOT NULL THEN ROUND(metal_price::numeric, 2)::text  ELSE '' END AS metal_price,
	CASE WHEN labor_charge IS NOT NULL THEN ROUND(labor_charge::numeric,2 )::text ELSE '' END AS labor_charge,
	CASE WHEN pmrn = 1 THEN CASE WHEN center_dia_price IS NOT NULL THEN ROUND(center_dia_price::numeric,2)::text ELSE '' END ELSE '' END as center_dia_price,
	CASE WHEN pmrn = 1 THEN CASE WHEN with_out_band_metal_price IS NOT NULL THEN ROUND(with_out_band_metal_price::numeric,2)::text ELSE '' END ELSE ''  END as with_out_band_metal_price,
	CASE WHEN pmrn = 1 THEN CASE WHEN with_band_metal_price IS NOT NULL THEN ROUND(with_band_metal_price::numeric,2)::text ELSE '' END ELSE ''  END as with_band_metal_price,
	CASE WHEN pmrn = 1 THEN CASE WHEN with_out_band_diamond_price IS NOT NULL THEN ROUND(with_out_band_diamond_price::numeric,2)::text ELSE '' END ELSE ''  END as with_out_band_diamond_price,
	CASE WHEN pmrn = 1 THEN CASE WHEN with_band_diamond_price IS NOT NULL THEN ROUND(with_band_diamond_price::numeric,2)::text ELSE '' END ELSE ''  END as with_band_diamond_price,
	CASE WHEN pmrn = 1 THEN CASE WHEN with_out_band_labour_change IS NOT NULL THEN ROUND(with_out_band_labour_change::numeric,2)::text ELSE '' END ELSE ''  END as with_out_band_labour_change,
	CASE WHEN pmrn = 1 THEN CASE WHEN with_band_labour_change IS NOT NULL THEN ROUND(with_band_labour_change::numeric,2)::text ELSE '' END ELSE ''  END as with_out_band_labour_change,
	CASE WHEN pmrn = 1 THEN ROUND((center_dia_price::numeric + with_out_band_metal_price::numeric + with_out_band_diamond_price::numeric + with_out_band_labour_change::numeric)::numeric, 2)::text ELSE '' END as with_out_band_total_product_price,
	CASE WHEN pmrn = 1 THEN ROUND((center_dia_price::numeric + with_band_metal_price::numeric + with_band_diamond_price::numeric + with_band_labour_change::numeric)::numeric, 2)::text ELSE '' END as with_band_total_product_price
	
	
FROM ranked r
FULL JOIN diamond_ranked d 
    ON r.product_id = d.product_id 
    AND r.pmrn = d.pdrn
LEFT JOIN product_price dt 
    ON COALESCE(r.product_id, d.product_id) = dt.product_id

ORDER BY r.product_id, r.pmrn`, {type: QueryTypes.SELECT}
    )

    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};

export const threeStoneConfiguratorProductExport = async (req: Request) => {
  try {
        const {ConfigProduct,HeadsData, ShanksData,SideSettingStyles, MetalMaster, GoldKarat, DiamondGroupMaster, ConfigProductMetals, ConfigProductDiamonds, StoneData, DiamondCaratSize, DiamondShape, MMSizeData, ClarityData, Colors, CutsData} = initModels(req);

    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const products = await ConfigProduct.findAll({
      where: [
        { is_deleted: DeletedStatus.No },
        { product_type: { [Op.iLike]: "%three stone%" } },
        {company_info_id:company_info_id?.data},
      ], 
      attributes: [
        "id",
        "shank_type_id",
        "side_setting_id",
        "head_type_id",
        "head_no",
        "shank_no",
        "band_no",
        "ring_no",
        "style_no",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        "slug",
        "center_dia_cts",
        "center_dia_size",
        "center_dia_shape_id",
        "center_dia_clarity_id",
        "center_dia_cut_id",
        "center_dia_mm_id",
        "center_dia_total_count",
        "center_dia_color",
        "center_diamond_group_id",
        "product_type",
        "product_style",
        "product_total_diamond",
        "style_no",
        "center_dia_type",
      ],
      include: [
        {
          model: HeadsData,
          as: "heads",
          attributes: ["name"],
          where:{ company_info_id:company_info_id?.data},required:false,
        },
        {
          model: ShanksData,
          as: "shanks",
          attributes: ["name"],
          where:{ company_info_id:company_info_id?.data},required:false
        },
        {
          model: SideSettingStyles,
          as: "side_setting",
          attributes: ["name"],
          where:{ company_info_id:company_info_id?.data},required:false
        },
        {
          model: DiamondGroupMaster,
          as: "cender_diamond",
          where:{ company_info_id:company_info_id?.data},required:false,
          attributes: [
            "id",
            [
              Sequelize.literal(`"cender_diamond->stones"."name"`),
              "center_stone",
            ],
            [
              Sequelize.literal(`"cender_diamond->shapes"."name"`),
              "center_stone_shape",
            ],
            [
              Sequelize.literal(`"cender_diamond->mm_size"."value"`),
              "center_stone_mm_size",
            ],
            [
              Sequelize.literal(`"cender_diamond->carats"."value"`),
              "center_stone_size",
            ],
            [
              Sequelize.literal(`"cender_diamond->colors"."name"`),
              "center_stone_color",
            ],
            [
              Sequelize.literal(`"cender_diamond->clarity"."name"`),
              "center_stone_clarity",
            ],
            [
              Sequelize.literal(`"cender_diamond->cuts"."value"`),
              "center_stone_cut",
            ],
          ],
          include: [
            {
              model: StoneData,
              as: "stones",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false
            },
            {
              model: DiamondShape,
              as: "shapes",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false
            },
            {
              model: Colors,
              as: "colors",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false
            },
            {
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false
            },
          ],
        },
        {
          model: ConfigProductMetals,
          where:{ company_info_id:company_info_id?.data},required:false,
          as: "CPMO",
          attributes: [
            "id",
            "metal_id",
            "karat_id",
            "metal_wt",
            "head_shank_band",
            "labor_charge",
            [Sequelize.literal(`"CPMO->metal"."name"`), "metal_name"],
            [Sequelize.literal(`"CPMO->karat"."name"`), "karat_name"],
          ],
          include: [
            {
              model: MetalMaster,
              as: "metal",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: GoldKarat,
              as: "karat",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
          ],
        },
        {
          model: ConfigProductDiamonds,
          as: "CPDO",
          where:{ company_info_id:company_info_id?.data},required:false,
          attributes: [
            "id",
            "product_type",
            "dia_cts_individual",
            "dia_count",
            "id_diamond_group",
            "dia_weight",
            "dia_shape",
            "dia_stone",
            "dia_color",
            "dia_mm_size",
            "dia_clarity",
            "dia_cuts",
            [Sequelize.literal(`"CPDO->stone"."name"`), "dia_stone"],
            [Sequelize.literal(`"CPDO->shape"."name"`), "dia_shape"],
            [Sequelize.literal(`"CPDO->mm_size"."value"`), "dia_mm_size"],
            [Sequelize.literal(`"CPDO->color"."name"`), "dia_color"],
            [Sequelize.literal(`"CPDO->clarity"."name"`), "dia_clarity"],
            [Sequelize.literal(`"CPDO->cuts"."value"`), "dia_cuts"],
          ],
          include: [
            {
              model: StoneData,
              as: "stone",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
          ],
        },
      ],
    });

    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};

export const eternityBandConfiguratorProductExport = async (req: Request) => {
  try {
        const {ConfigEternityProduct,SideSettingStyles, MetalMaster, GoldKarat, DiamondGroupMaster, ConfigEternityProductMetalDetail, ConfigEternityProductDiamondDetails, StoneData, DiamondCaratSize, DiamondShape, MMSizeData, ClarityData, Colors, CutsData} = initModels(req);

    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const products = await ConfigEternityProduct.findAll({
      order: [["id", "ASC"]],
      where: {
        is_deleted: DeletedStatus.No,
        product_type: { [Op.iLike]: "%Eternity Band%" },
        company_info_id:company_info_id?.data,
      },
      attributes: [
        "id",
        "side_setting_id",
        "style_no",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        "dia_cts",
        "dia_shape_id",
        "dia_clarity_id",
        "dia_cut_id",
        "dia_mm_id",
        "dia_color",
        "dia_count",
        "diamond_group_id",
        "prod_dia_total_count",
        "alternate_dia_count",
        "product_type",
        "product_size",
        "product_combo_type",
        "slug",
        "labour_charge",
        "dia_type",
        "id_stone",
        [
          Sequelize.literal(
            `(SELECT SIZE FROM items_sizes WHERE id = "product_size"::INTEGER)`
          ),
          "product_size",
        ],
        [Sequelize.literal(`"side_setting"."name"`), "side_setting_name"],
        [Sequelize.literal(`"DiamondGroupMaster->stones"."name"`), "dia_stone"],
        [Sequelize.literal(`"DiamondGroupMaster->shapes"."name"`), "dia_shape"],
        [
          Sequelize.literal(`"DiamondGroupMaster->mm_size"."value"`),
          "dia_mm_size",
        ],
        [Sequelize.literal(`"DiamondGroupMaster->carats"."value"`), "dia_size"],
        [Sequelize.literal(`"DiamondGroupMaster->colors"."name"`), "dia_color"],
        [
          Sequelize.literal(`"DiamondGroupMaster->clarity"."name"`),
          "dia_clarity",
        ],
        [Sequelize.literal(`"DiamondGroupMaster->cuts"."value"`), "dia_cut"],
        [Sequelize.literal(`"metal"."metal_id"`), "metal_id"],
        [Sequelize.literal(`"metal->MetalMaster"."name"`), "metal_name"],
        [Sequelize.literal(`"metal"."karat_id"`), "karat_id"],
        [Sequelize.literal(`"metal->KaratMaster"."name"`), "karat_name"],
        [Sequelize.literal(`"metal"."metal_wt"`), "metal_wt"],
        [Sequelize.literal(`"diamonds->stone"."name"`), "alt_stone"],
        [Sequelize.literal(`"diamonds->shape"."name"`), "alt_dia_shape"],
        [Sequelize.literal(`"diamonds->color"."name"`), "alt_dia_color"],
        [Sequelize.literal(`"diamonds->clarity"."name"`), "alt_dia_clarity"],
        [Sequelize.literal(`"diamonds->cuts"."value"`), "alt_dia_cut"],
        [Sequelize.literal(`"diamonds->carat"."value"`), "alt_dia_carat"],
      ],
      include: [
        {
          model: SideSettingStyles,
          as: "side_setting",
          attributes: [],
          where:{ company_info_id:company_info_id?.data},required:false,
        },
        {
          model: DiamondGroupMaster,
          as: "DiamondGroupMaster",
          attributes: [],
          where:{ company_info_id:company_info_id?.data},required:false,
          include: [
            {
              model: StoneData,
              as: "stones",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: DiamondShape,
              as: "shapes",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: Colors,
              as: "colors",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
          ],
        },
        {
          model: ConfigEternityProductMetalDetail,
          as: "metal",
          attributes: [],
          where:{ company_info_id:company_info_id?.data},required:false,
          include: [
            {
              model: MetalMaster,
              as: "MetalMaster",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: GoldKarat,
              as: "KaratMaster",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
          ],
        },
        {
          model: ConfigEternityProductDiamondDetails,
          as: "diamonds",
          attributes: [],
          where:{ company_info_id:company_info_id?.data},required:false,
          include: [
            {
              model: StoneData,
              as: "stone",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: DiamondCaratSize,
              as: "carat",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
          ],
        },
      ],
    });

    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};

export const braceletConfiguratorProductExport = async (req: Request) => {
  try {
    const { ConfigBraceletProduct, SideSettingStyles, HookTypeData, LengthData, MetalMaster, GoldKarat,MMSizeData,
      ConfigBraceletProductMetals, ConfigBraceletProductDiamonds, DiamondCaratSize, StoneData,DiamondShape, Colors, ClarityData, CutsData } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const products = await ConfigBraceletProduct.findAll({
      order: [["id", "ASC"]],
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id:company_info_id?.data,
      },
      attributes: [
        "id",
        "product_type",
        "product_style",
        "product_length",
        "setting_type",
        "hook_type",
        "style_no",
        "bracelet_no",
        "product_title",
        "sku",
        "slug",
        "product_sort_des",
        "product_long_des",
        "product_dia_type",
        "metal_weight_type",
      ],
      include: [
        {
          model: SideSettingStyles,
          as: "side_setting",
          attributes: ["name"],
          where:{ company_info_id:company_info_id?.data},required:false,
        },
        {
          model: HookTypeData,
          as: "hook",
          attributes: ["name"],
          where:{ company_info_id:company_info_id?.data},required:false,
        },
        {
          model: LengthData,
          as: "length",
          attributes: ["length"],
          where:{ company_info_id:company_info_id?.data},required:false,
        },
        {
          model: DiamondCaratSize,
          as: "diamond_total_wt",
          attributes: ["value"],
          where:{ company_info_id:company_info_id?.data},required:false,
        },
        {
          model: ConfigBraceletProductMetals,
          as: "config_product_metal_details",
          where:{ company_info_id:company_info_id?.data},required:false,
          attributes: [
            "id",
            "id_metal",
            "id_karat",
            "labour_charge",
            "metal_wt",
            [
              Sequelize.literal(
                `"config_product_metal_details->metal_detail"."name"`
              ),
              "metal_name",
            ],
            [
              Sequelize.literal(
                `"config_product_metal_details->karat_detail"."name"`
              ),
              "karat_name",
            ],
          ],
          include: [
            {
              model: MetalMaster,
              as: "metal_detail",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: GoldKarat,
              as: "karat_detail",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
          ],
        },
        {
          model: ConfigBraceletProductDiamonds,
          as: "config_product_diamond_details",
          where:{ company_info_id:company_info_id?.data},required:false,
          attributes: [
            "id",
            "id_stone",
            "id_shape",
            "id_mm_size",
            "id_carat",
            "id_color",
            "id_clarity",
            "dia_wt",
            "dia_count",
            "alternate_stone",
            [
              Sequelize.literal(
                `"config_product_diamond_details->stone"."name"`
              ),
              "stone_value",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->shape"."name"`
              ),
              "dia_shape",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->mm_size"."value"`
              ),
              "dia_mm_size",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->color"."name"`
              ),
              "dia_color",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->clarity"."name"`
              ),
              "dia_clarity",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->cuts"."value"`
              ),
              "dia_cut",
            ],
          ],
          include: [
            {
              model: StoneData,
              as: "stone",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
              where:{ company_info_id:company_info_id?.data},required:false,
            },
          ],
        },
      ],
    });

    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};
