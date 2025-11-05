import { Request } from "express";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { resSuccess } from "../../utils/shared-functions";
import {
  AllProductTypes,
  DeletedStatus,
  SingleProductType,
} from "../../utils/app-enumeration";
import { initModels } from "../model/index.model";

export const customerReports = async (req: Request) => {
  try {
    const {CustomerUser} = initModels(req);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const startDateFilter =
      req.query.start_date && req.query.start_date != undefined
        ? req.query.start_date
        : startDate;

    const endDateFilter: any =
      req.query.end_date && req.query.end_date != undefined
        ? req.query.end_date
        : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const list = await CustomerUser.findAll({
      order: [["created_date", "ASC"]],
      where: {
        is_deleted: DeletedStatus.No,
        created_date: {
          [Op.between]: [startDateFilter, endDate],
        },
        company_info_id :req?.body?.session_res?.client_id
      },
      attributes: [
        "id",
        "full_name",
        "email",
        ["mobile", "phone_number"],
        ["country_id", "country_name"],
        ["country_id", "country_code"],
        "is_active",
        "created_date",
      ],
    });

    return resSuccess({ data: list });
  } catch (error) {
    throw error;
  }
};

export const customerSubscriberReports = async (req: Request) => {
  try {
    const {SubscriptionData} = initModels(req);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const startDateFilter =
      req.query.start_date && req.query.start_date != undefined
        ? req.query.start_date
        : startDate;

    const endDateFilter: any =
      req.query.end_date && req.query.end_date != undefined
        ? req.query.end_date
        : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const list = await SubscriptionData.findAll({
      order: [["created_date", "ASC"]],
      where: {
        created_date: {
          [Op.between]: [startDateFilter, endDate],
        },
        company_info_id :req?.body?.session_res?.client_id,
      },
      attributes: ["id", "email", "is_subscribe", "created_date"],
    });

    return resSuccess({ data: list });
  } catch (error) {
    throw error;
  }
};

export const wishlistProductReports = async (req: Request) => {
  try {
    const {ProductWish, CustomerUser} = initModels(req);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const startDateFilter =
      req.query.start_date && req.query.start_date != undefined
        ? req.query.start_date
        : startDate;

    const endDateFilter: any =
      req.query.end_date && req.query.end_date != undefined
        ? req.query.end_date
        : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const list = await ProductWish.findAll({
      order: [["created_date", "ASC"]],
      where: {
        created_date: {
          [Op.between]: [startDateFilter, endDate],
        },
        company_info_id :req?.body?.session_res?.client_id,
      },
      attributes: [
        "id",
        "user_id",
        "product_type",
        "product_id",
        [Sequelize.literal(`"user"."full_name"`), "user_name"],
        [Sequelize.literal(`"user"."email"`), "user_email"],
        [Sequelize.literal(`"user"."mobile"`), "user_phone_number"],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "product_name",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "product_slug",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT sort_description FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT short_des from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_sort_des from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sort_description from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "sort_description",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT long_description FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT long_des from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_long_des from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT long_description from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "long_description",
        ],
        "created_date",
      ],
      include: [
        {
          model: CustomerUser,
          as: "user",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
          required:false
        },
      ],
    });

    return resSuccess({ data: list });
  } catch (error) {
    throw error;
  }
};

export const cartProductReports = async (req: Request) => {
  try {
    const {CartProducts, AppUser, CustomerUser} = initModels(req);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const startDateFilter =
      req.query.start_date && req.query.start_date != undefined
        ? req.query.start_date
        : startDate;

    const endDateFilter: any =
      req.query.end_date && req.query.end_date != undefined
        ? req.query.end_date
        : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const list = await CartProducts.findAll({
      order: [["created_date", "ASC"]],
      where: {
        created_date: {
          [Op.between]: [startDateFilter, endDate],
        },
        company_info_id :req?.body?.session_res?.client_id,
      },
      attributes: [
        "id",
        "user_id",
        [Sequelize.literal('"users->customer_user"."full_name"'), "user_name"],
        [Sequelize.literal('"users->customer_user"."email"'), "user_email"],
        [
          Sequelize.literal('"users->customer_user"."mobile"'),
          "user_phone_numer",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "product_name",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") ELSE null END`
          ),
          "product_slug",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT image_path FROM product_images WHERE id = CAST (product_details ->> 'image' AS integer)) WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') ELSE (SELECT image_path FROM images where id = CAST (product_details ->> 'image' AS integer)) END`
          ),
          "product_image",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'image') = null THEN NULL WHEN (product_details ->> 'image') = 'null' THEN null WHEN (product_details ->> 'image') = 'undefined' THEN null WHEN (product_details ->> 'image') = '' THEN NULL  ELSE  CAST (product_details ->> 'image' AS integer) END`
          ),
          "product_image_id",
        ],
        [
          Sequelize.literal(
            ` CASE WHEN (product_details ->> 'size') = null THEN null WHEN (product_details ->> 'size') = 'null' THEN null  WHEN (product_details ->> 'size') = 'undefined' THEN NULL WHEN (product_details ->> 'size') = '' THEN NULL ELSE(SELECT size FROM items_sizes WHERE id = CAST (product_details ->> 'size' AS integer))END`
          ),
          "product_size",
        ],
        [
          Sequelize.literal(
            ` CASE WHEN (product_details ->> 'size') = null THEN null WHEN (product_details ->> 'size') = 'null' THEN null  WHEN (product_details ->> 'size') = 'undefined' THEN NULL WHEN (product_details ->> 'size') = '' THEN NULL ELSE CAST (product_details ->> 'size' AS integer)END`
          ),
          "size_id",
        ],
        [
          Sequelize.literal(
            ` CASE WHEN (product_details ->> 'length') = null THEN null WHEN (product_details ->> 'length') = 'null' THEN null  WHEN (product_details ->> 'length') = 'undefined' THEN NULL WHEN (product_details ->> 'length') = '' THEN NULL ELSE(SELECT length FROM items_lengths WHERE id = CAST (product_details ->> 'length' AS integer))END`
          ),
          "product_length",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'length') = null THEN null WHEN (product_details ->> 'length') = 'null' THEN null  WHEN (product_details ->> 'length') = 'undefined' THEN NULL WHEN (product_details ->> 'length') = '' THEN NULL ELSE CAST (product_details ->> 'length' AS integer)END`
          ),
          "length_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'metal') = null THEN null WHEN (product_details ->> 'metal') = 'null' THEN null  WHEN (product_details ->> 'metal') = 'undefined' THEN NULL WHEN (product_details ->> 'metal') = '' THEN NULL ELSE (SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (product_details ->> 'metal' AS integer)) END`
          ),
          "product_metal",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'metal') = null THEN null WHEN (product_details ->> 'metal') = 'null' THEN null  WHEN (product_details ->> 'metal') = 'undefined' THEN NULL WHEN (product_details ->> 'metal') = '' THEN NULL ELSE CAST (product_details ->> 'metal' AS integer) END`
          ),
          "metal_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'metal_tone') = null THEN null WHEN (product_details ->> 'metal_tone') = 'null' THEN null  WHEN (product_details ->> 'metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'metal_tone') = '' THEN NULL ELSE CAST (product_details ->> 'metal_tone' AS integer) END`
          ),
          "metal_tone_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'karat') = null THEN null WHEN (product_details ->> 'karat') = 'null' THEN null  WHEN (product_details ->> 'karat') = 'undefined' THEN NULL WHEN (product_details ->> 'karat') = '' THEN NULL ELSE  CAST (product_details ->> 'karat' AS integer) END`
          ),
          "karat_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'karat') = null THEN null WHEN (product_details ->> 'karat') = 'null' THEN null  WHEN (product_details ->> 'karat') = 'undefined' THEN NULL WHEN (product_details ->> 'karat') = '' THEN NULL ELSE (SELECT name FROM gold_kts WHERE id = CAST (product_details ->> 'karat' AS integer)) END`
          ),
          "product_karat",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'metal_tone') = null THEN null WHEN (product_details ->> 'metal_tone') = 'null' THEN null  WHEN (product_details ->> 'metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'metal_tone') = '' THEN NULL ELSE (SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'metal_tone' AS integer)) END`
          ),
          "Metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'head_metal_tone') = null THEN null WHEN (product_details ->> 'head_metal_tone') = 'null' THEN null  WHEN (product_details ->> 'head_metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'head_metal_tone') = '' THEN NULL ELSE (SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'head_metal_tone' AS integer)) END`
          ),
          "head_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'shank_metal_tone') = null THEN null WHEN (product_details ->> 'shank_metal_tone') = 'null' THEN null  WHEN (product_details ->> 'shank_metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'shank_metal_tone') = '' THEN NULL ELSE (SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'shank_metal_tone' AS integer)) END`
          ),
          "shank_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'band_metal_tone') = null THEN null WHEN (product_details ->> 'band_metal_tone') = 'null' THEN null  WHEN (product_details ->> 'band_metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'band_metal_tone') = '' THEN NULL ELSE (SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'band_metal_tone' AS integer)) END`
          ),
          "band_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'head_metal_tone') = null THEN null WHEN (product_details ->> 'head_metal_tone') = 'null' THEN null  WHEN (product_details ->> 'head_metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'head_metal_tone') = '' THEN NULL ELSE CAST (product_details ->> 'head_metal_tone' AS integer) END`
          ),
          "head_metal_tone_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'shank_metal_tone') = null THEN null WHEN (product_details ->> 'shank_metal_tone') = 'null' THEN null  WHEN (product_details ->> 'shank_metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'shank_metal_tone') = '' THEN NULL ELSE CAST (product_details ->> 'shank_metal_tone' AS integer) END`
          ),
          "shank_metal_tone_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'band_metal_tone') = null THEN null WHEN (product_details ->> 'band_metal_tone') = 'null' THEN null  WHEN (product_details ->> 'band_metal_tone') = 'undefined' THEN NULL WHEN (product_details ->> 'band_metal_tone') = '' THEN NULL ELSE CAST (product_details ->> 'band_metal_tone' AS integer) END`
          ),
          "band_metal_tone_id",
        ],
        [Sequelize.literal(`product_details ->> 'is_band'`), "is_band"],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'selected_stone_price') = null THEN null WHEN (product_details ->> 'selected_stone_price') = 'null' THEN null  WHEN (product_details ->> 'selected_stone_price') = 'undefined' THEN NULL WHEN (product_details ->> 'selected_stone_price') = '' THEN NULL ELSE 1+CAST (product_details ->> 'selected_stone_price' AS DECIMAL(12, 1)) END`
          ),
          "selected_stone_price",
        ],
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${
            AllProductTypes.Config_Ring_product
          } THEN 
                (SELECT CEIL((CASE WHEN CAST (product_details ->> 'diamond_type' AS integer) = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
          WHEN "product_type" = ${
            AllProductTypes.Three_stone_config_product
          } THEN 
                (SELECT CEIL((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
                WHEN "product_type" = ${AllProductTypes.Product}
                      THEN (SELECT CASE WHEN products.product_type = ${
                        SingleProductType.VariantType
                      } OR (products.product_type = ${
            SingleProductType.cataLogueProduct
          } AND (product_details ->> 'is_catalogue_design') = 'true') THEN CEIL(PMO.retail_price)*"cart_products"."quantity" ELSE  CASE WHEN PMO.id_karat IS NULL
                        THEN CEIL(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                          (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" ELSE
                          CEIL(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                          (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" END END
                          FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product =
                          products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product =
                          products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters
                          AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN
                          diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN
                          gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${
                            SingleProductType.VariantType
                          } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
                          products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
                          (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
                          products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price LIMIT 1)
 WHEN "product_type" = ${
   AllProductTypes.GiftSet_product
 } THEN (SELECT  CEIL(price)*"cart_products"."quantity" FROM gift_set_products WHERE id = "product_id") 
                WHEN "product_type" = ${
                  AllProductTypes.BirthStone_product
                } THEN (SELECT CEIL(price)*"cart_products"."quantity" FROM  birthstone_products
LEFT JOIN birthstone_product_metal_options AS birthstone_PMO ON id_product = birthstone_products.id 
WHERE birthstone_PMO.id = "variant_id") WHEN "product_type" = ${
            AllProductTypes.Eternity_product
          } THEN (SELECT 
    (((CASE 
        WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
        THEN dgm.rate 
        ELSE dgm.synthetic_rate 
    END)*(CASE WHEN product_combo_type = 1 OR product_combo_type = 3 THEN CAST(prod_dia_total_count AS double precision) ELSE CAST(dia_count AS double precision) END)*CAST(carat_sizes.value AS double precision)) 
    + COALESCE(labour_charge, 0) 
    + COALESCE(other_charge, 0) 
    + product_metal.metal_rate 
    + 
	COALESCE(product_diamond.diamond_rate, 0)) * "cart_products"."quantity"
FROM config_eternity_products 
LEFT OUTER JOIN diamond_group_masters AS dgm 
ON config_eternity_products.diamond_group_id = dgm.id
LEFT OUTER JOIN carat_sizes ON  dgm.id_carat = carat_sizes.id
LEFT OUTER JOIN (
    SELECT 
        config_eternity_id,
        cepm.metal_id,
        cepm.karat_id,
        CASE 
            WHEN cepm.karat_id IS NULL
            THEN SUM(metal_wt * mm.metal_rate)
            ELSE SUM(metal_wt * (mm.metal_rate / mm.calculate_rate * gk.calculate_rate))
        END AS metal_rate
    FROM config_eternity_product_metals AS cepm
    LEFT OUTER JOIN metal_masters AS mm 
        ON mm.id = cepm.metal_id
    LEFT OUTER JOIN gold_kts AS gk 
        ON gk.id = cepm.karat_id
    GROUP BY config_eternity_id, cepm.karat_id, cepm.metal_id
) product_metal
ON config_eternity_products.id = product_metal.config_eternity_id
LEFT OUTER JOIN (
    SELECT 
        config_eternity_product_id,
        COALESCE(SUM(
            (CASE 
                WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
                THEN sdgm.rate 
                ELSE sdgm.synthetic_rate 
            END) 
            * CAST(cepd.dia_count AS double precision) 
            * CAST(cts.value AS double precision)
        ), 0) AS diamond_rate
    FROM config_eternity_product_diamonds AS cepd
    LEFT OUTER JOIN diamond_group_masters AS sdgm 
        ON cepd.id_diamond_group = sdgm.id
    LEFT OUTER JOIN carat_sizes AS cts 
        ON cts.id = cepd.dia_weight
    GROUP BY config_eternity_product_id
) product_diamond
ON config_eternity_products.id = product_diamond.config_eternity_product_id
WHERE config_eternity_products.id  = "product_id") WHEN "product_type" = ${
            AllProductTypes.LooseDiamond
          }
THEN (
    SELECT
    total_price * "cart_products"."quantity"
FROM loose_diamond_group_masters
WHERE loose_diamond_group_masters.is_deleted = '0'
AND loose_diamond_group_masters.id = "product_id"
) WHEN "product_type" = ${
            AllProductTypes.BraceletConfigurator
          } THEN (SELECT CASE
	WHEN ID_KARAT IS NULL THEN CEIL(METAL_MASTERS.METAL_RATE * METAL_WT + PRODUCT_DIAMOND_DETAILS.DIAMOND_RATE)*"cart_products"."quantity"
	ELSE CEIL((METAL_MASTERS.METAL_RATE / METAL_MASTERS.CALCULATE_RATE * GOLD_KTS.calculate_rate * METAL_WT + LABOUR_CHARGE) + PRODUCT_DIAMOND_DETAILS.DIAMOND_RATE)*"cart_products"."quantity"
END
FROM CONFIG_BRACELET_PRODUCTS
INNER JOIN CONFIG_BRACELET_PRODUCT_METALS ON CONFIG_PRODUCT_ID = CONFIG_BRACELET_PRODUCTS.ID
LEFT OUTER JOIN
	(SELECT CONFIG_PRODUCT_ID,
		(COALESCE(SUM(PDGM.RATE * CPDO.DIA_COUNT * CPDO.DIA_WT),0)) AS DIAMOND_RATE
		FROM CONFIG_BRACELET_PRODUCT_DIAMONDS AS CPDO
		LEFT JOIN DIAMOND_GROUP_MASTERS AS PDGM ON PDGM.ID = ID_DIAMOND_GROUP_MASTER
		GROUP BY CONFIG_PRODUCT_ID) PRODUCT_DIAMOND_DETAILS ON PRODUCT_DIAMOND_DETAILS.CONFIG_PRODUCT_ID = CONFIG_BRACELET_PRODUCTS.ID
LEFT JOIN METAL_MASTERS ON ID_METAL = METAL_MASTERS.ID
LEFT JOIN GOLD_KTS ON ID_KARAT = GOLD_KTS.ID
WHERE CONFIG_BRACELET_PRODUCTS.ID = "product_id") ELSE null END)`),
          "product_price",
        ],
      ],
      include: [
        {
          required: false,
          model: AppUser,
          as: "users",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
          include: [
            {
              required: false,
              model: CustomerUser,
              as: "customer_user",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
          ],
        },
      ],
    });

    return resSuccess({ data: list });
  } catch (error) {
    throw error;
  }
};

export const topSellingProductReports = async (req: Request) => {
  try {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const startDateFilter: any =
      req.query.start_date && req.query.start_date != undefined
        ? new Date(req.query.start_date as any)
        : startDate;

    const endDateFilter: any =
      req.query.end_date && req.query.end_date != undefined
        ? req.query.end_date
        : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const list = await req.body.db_connection.query(
      `(SELECT 
            OD.product_id,
            count(OD.product_id) as order_count,
            CAST (order_details_json ->> 'product_type' as integer) as product_type,
            CASE WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
              AllProductTypes.Product
            } THEN (SELECT name FROM products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.GiftSet_product
      } THEN (SELECT product_title from gift_set_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.Config_Ring_product
      } THEN (SELECT product_title from config_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.Three_stone_config_product
      } THEN (SELECT product_title from config_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.BirthStone_product
      } THEN (SELECT name from birthstone_products WHERE id = OD.product_id) ELSE null END As product_name,
            CASE WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
              AllProductTypes.Product
            } THEN (SELECT sku FROM products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.GiftSet_product
      } THEN (SELECT sku from gift_set_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.Config_Ring_product
      } THEN (SELECT sku from config_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.Three_stone_config_product
      } THEN (SELECT product_title from config_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.BirthStone_product
      } THEN (SELECT sku from birthstone_products WHERE id = OD.product_id) ELSE null END As product_sku,
            CASE WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
              AllProductTypes.Product
            } THEN (SELECT slug FROM products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.GiftSet_product
      } THEN (SELECT slug from gift_set_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.Config_Ring_product
      } THEN (SELECT slug from config_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.Three_stone_config_product
      } THEN (SELECT product_title from config_products WHERE id = OD.product_id) WHEN CAST (order_details_json ->> 'product_type' as integer) = ${
        AllProductTypes.BirthStone_product
      } THEN (SELECT slug from birthstone_products WHERE id = OD.product_id) ELSE null END As product_slug

        FROM 
            order_details as OD 
        LEFT OUTER JOIN orders ON (orders.id = OD.order_id AND OD.company_info_id = ${req?.body?.session_res?.client_id})
        WHERE OD.company_info_id = ${req?.body?.session_res?.client_id} AND orders.created_date BETWEEN '${startDateFilter
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")}' AND '${endDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
        GROUP BY 
            OD.product_id, CAST (order_details_json ->> 'product_type' as integer)
        ORDER BY 
            count(OD.product_id) DESC)`,
      { type: QueryTypes.SELECT }
    );
    return resSuccess({ data: list });
  } catch (error) {
    throw error;
  }
};
