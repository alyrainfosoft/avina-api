import { Request } from "express";

import { DeletedStatus, SingleProductType } from "../../utils/app-enumeration";

import { Op, QueryTypes, Sequelize } from "sequelize";

import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import StoneData from "../model/master/attributes/gemstones.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import MMSizeData from "../model/master/attributes/mmSize.model";
import ClarityData from "../model/master/attributes/clarity.model";
import Colors from "../model/master/attributes/colors.model";
import CutsData from "../model/master/attributes/cuts.model";
import ConfigProduct from "../model/config-product.model";
import HeadsData from "../model/master/attributes/heads.model";
import ShanksData from "../model/master/attributes/shanks.model";
import SideSettingStyles from "../model/master/attributes/side-setting-styles.model";
import DiamondCaratSize from "../model/master/attributes/caratSize.model";
import ConfigProductMetals from "../model/config-product-metal.model";
import ConfigProductDiamonds from "../model/config-product-diamonds.model";
import ConfigEternityProduct from "../model/config-eternity-product.model";
import ConfigEternityProductMetalDetail from "../model/config-eternity-product-metals.model";
import ConfigEternityProductDiamondDetails from "../model/config-eternity-product-diamonds.model";
import ConfigBraceletProduct from "../model/config-bracelet-product.model";
import ConfigBraceletProductMetals from "../model/config-bracelet-product-metals.model";
import HookTypeData from "../model/master/attributes/hook-type.model";
import ItemLengthData from "../../model/master/attributes/item-length.model";
import ConfigBraceletProductDiamonds from "../model/config-bracelet-product-diamond.model";
import dbContext from "../../config/db-context";
import { resSuccess } from "../../utils/shared-functions";

export const dynamicProductExport = async (req: Request) => {
  try {
    const products = await dbContext.query(
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
    WHERE products.is_deleted = '0' AND products.product_type = 1
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
	INNER JOIN diamond_group_masters AS DGM ON DGM.id = pdo.id_diamond_group
    LEFT JOIN gemstones AS stone ON stone.id = DGM.id_stone
    LEFT JOIN setting_styles AS setting ON setting.id = pdo.id_setting
    LEFT JOIN diamond_shapes AS shape ON shape.id = DGM.id_shape
    LEFT JOIN mm_sizes AS mm ON mm.id = DGM.id_mm_size
    LEFT JOIN colors AS col ON col.id = DGM.id_color
    LEFT JOIN clarities AS cla ON cla.id = DGM.id_clarity
    LEFT JOIN cuts AS cut ON cut.id = DGM.id_cuts
    WHERE products.is_deleted = '0' AND products.product_type = 1
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
	CASE WHEN pmrn = 1 THEN CASE WHEN gender IS NOT NULL THEN gender ELSE '' END ELSE '' END AS gender,
	CASE WHEN pmrn = 1 THEN CASE WHEN additional_detail IS NOT NULL THEN additional_detail ELSE '' END ELSE '' END AS additional_detail,
	CASE WHEN pmrn = 1 THEN CASE WHEN certification IS NOT NULL THEN certification ELSE '' END ELSE '' END AS certification,
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

export const variantProductExport = async (req: Request) => {
  try {
    const products = await dbContext.query(
      `WITH ranked AS (
    SELECT 
        products.id AS product_id,
        PMO.id AS PMO_ID,
		CASE WHEN cat.category_name IS NULL THEN '' ELSE cat.category_name END as category,
		CASE WHEN sub_cat.category_name IS NULL THEN '' ELSE sub_cat.category_name END as sub_category,
		CASE WHEN sub_sub_cat.category_name IS NOT NULL THEN sub_sub_cat.category_name ELSE '' END as sub_sub_category,
		CASE WHEN products.name IS NOT NULL THEN products.name ELSE '' END AS name,
        CASE WHEN products.sku IS NOT NULL THEN products.sku ELSE '' END AS sku,
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
    WHERE products.is_deleted = '${DeletedStatus.No}' AND products.product_type = ${SingleProductType.VariantType}
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
    WHERE products.is_deleted = '${DeletedStatus.No}' AND products.product_type = ${SingleProductType.VariantType}
) 
SELECT 
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
    const products = await ConfigProduct.findAll({
      where: [
        { is_deleted: DeletedStatus.No },
        { product_type: { [Op.iLike]: "%ring%" } },
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
        },
        {
          model: ShanksData,
          as: "shanks",
          attributes: ["name"],
        },
        {
          model: SideSettingStyles,
          as: "side_setting",
          attributes: ["name"],
        },
        {
          model: DiamondGroupMaster,
          as: "cender_diamond",
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
            },
            {
              model: DiamondShape,
              as: "shapes",
              attributes: [],
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: Colors,
              as: "colors",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
            },
            {
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigProductMetals,
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
            },
            {
              model: GoldKarat,
              as: "karat",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigProductDiamonds,
          as: "CPDO",
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
            },
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
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

export const threeStoneConfiguratorProductExport = async (req: Request) => {
  try {
    const products = await ConfigProduct.findAll({
      where: [
        { is_deleted: DeletedStatus.No },
        { product_type: { [Op.iLike]: "%three stone%" } },
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
        },
        {
          model: ShanksData,
          as: "shanks",
          attributes: ["name"],
        },
        {
          model: SideSettingStyles,
          as: "side_setting",
          attributes: ["name"],
        },
        {
          model: DiamondGroupMaster,
          as: "cender_diamond",
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
            },
            {
              model: DiamondShape,
              as: "shapes",
              attributes: [],
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: Colors,
              as: "colors",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
            },
            {
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigProductMetals,
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
            },
            {
              model: GoldKarat,
              as: "karat",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigProductDiamonds,
          as: "CPDO",
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
            },
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
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
    const products = await ConfigEternityProduct.findAll({
      order: [["id", "ASC"]],
      where: {
        is_deleted: DeletedStatus.No,
        product_type: { [Op.iLike]: "%Eternity Band%" },
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
        },
        {
          model: DiamondGroupMaster,
          as: "DiamondGroupMaster",
          attributes: [],
          include: [
            {
              model: StoneData,
              as: "stones",
              attributes: [],
            },
            {
              model: DiamondShape,
              as: "shapes",
              attributes: [],
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: Colors,
              as: "colors",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
            },
            {
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigEternityProductMetalDetail,
          as: "metal",
          attributes: [],
          include: [
            {
              model: MetalMaster,
              as: "MetalMaster",
              attributes: [],
            },
            {
              model: GoldKarat,
              as: "KaratMaster",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigEternityProductDiamondDetails,
          as: "diamonds",
          attributes: [],
          include: [
            {
              model: StoneData,
              as: "stone",
              attributes: [],
            },
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
            },
            {
              model: DiamondCaratSize,
              as: "carat",
              attributes: [],
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
    const products = await ConfigBraceletProduct.findAll({
      order: [["id", "ASC"]],
      where: {
        is_deleted: DeletedStatus.No,
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
        },
        {
          model: HookTypeData,
          as: "hook",
          attributes: ["name"],
        },
        {
          model: ItemLengthData,
          as: "length",
          attributes: ["length"],
        },
        {
          model: DiamondCaratSize,
          as: "diamond_total_wt",
          attributes: ["value"],
        },
        {
          model: ConfigBraceletProductMetals,
          as: "config_product_metal_details",
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
            },
            {
              model: GoldKarat,
              as: "karat_detail",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigBraceletProductDiamonds,
          as: "config_product_diamond_details",
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
            },
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
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
