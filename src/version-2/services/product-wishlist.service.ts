import { Request } from "express";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
} from "../../utils/shared-functions";
import AppUser from "../model/app-user.model";
import Product from "../model/product.model";
import ProductWish from "../model/produc-wish-list.model";
import {
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
  INVALID_ID,
  PRODUCT_NOT_FOUND,
  PRODUCT_VARIANT_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
  REQUIRED_ERROR_MESSAGE,
  USER_NOT_FOUND,
} from "../../utils/app-messages";
import { Op, Sequelize, where } from "sequelize";
import ProductImage from "../model/product-image.model";
import {
  ActiveStatus,
  AllProductTypes,
  DeletedStatus,
  DIAMOND_INVENTROY_TYPE,
  DIAMOND_ORIGIN,
  IMAGE_TYPE,
  PRODUCT_IMAGE_TYPE,
  SingleProductType,
} from "../../utils/app-enumeration";
import customerUser from "../model/customer-user.model";
import ProductMetalOption from "../model/product-metal-option.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import GiftSetProduct from "../model/gift-set-product/gift_set_product.model";
import BirthStoneProduct from "../model/birth-stone-product/birth-stone-product.model";
import BirthstoneProductMetalOption from "../model/birth-stone-product/birth-stone-product-metal-option.model";
import dbContext from "../../config/db-context";
import Image from "../model/image.model";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import ConfigProduct from "../model/config-product.model";
import SizeData from "../model/master/attributes/item-size.model";
import LengthData from "../model/master/attributes/item-length.model";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import { PROCESS_ENVIRONMENT } from "../../config/env.var";
import ConfigEternityProduct from "../model/config-eternity-product.model";
import LooseDiamondGroupMasters from "../model/loose-diamond-group-master.model";
export const addProductWishList = async (req: Request) => {
  try {
    const { user_id, product_id } = req.body;

    const wishListproduct = {
      user_id: user_id,
      product_id: product_id,
      created_date: getLocalDate(),
    };

    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    const productExit = await Product.findOne({
      where: { id: product_id, is_deleted: "0" },
    });

    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    if (!(productExit && productExit.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }
    const addProductData = await ProductWish.create(wishListproduct);

    const wish_list_count = await ProductWish.count({
      where: { user_id: user_id },
    });

    return resSuccess({ data: { wish_list_count, addProductData } });
  } catch (error) {
    throw error;
  }
};

export const getProductWishListByUserId = async (req: Request) => {
  try {
    if (!req.body.user_id) return resBadRequest({ message: INVALID_ID });

    const userData = await AppUser.findOne({ where: { id: req.body.user_id } });
    if (!(userData && userData.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const wishlistData = await ProductWish.findAll({
      where: { user_id: userData.dataValues.id },
    });

    const productId = wishlistData.map((t: any) => t.product_id);

    const ProductList = await Product.findAll({
      where: { id: productId },
      order: [
        [{ model: ProductMetalOption, as: "PMO" }, "id_metal", "ASC"],
        [Sequelize.literal('"PMO->metal_karat"."name"'), "ASC"],
        [Sequelize.literal('"product_images"."id_metal_tone"'), "ASC"],
        [Sequelize.literal('"product_images"."id"'), "ASC"],
      ],
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "sort_description",
        "long_description",
      ],
      include: [
        {
          required: false,
          model: ProductImage,
          as: "product_images",
          attributes: ["id", "image_path", "id_metal_tone", "image_type"],
          where: [{ is_deleted: "0", image_type: PRODUCT_IMAGE_TYPE.Feature }],
        },
        {
          required: false,
          model: ProductMetalOption,
          as: "PMO",

          attributes: [
            "id",
            "id_metal",
            "metal_weight",
            [Sequelize.literal('"PMO->metal_karat"."name"'), "karat"],
            [
              Sequelize.literal(
                `CASE WHEN "PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("PMO"."id_metal_tone", '|')::int[] END`
              ),
              "metal_tone",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "PMO".id_karat IS NULL THEN (SELECT metal_tones.sort_code  FROM metal_tones WHERE id = 46) ELSE null END`
              ),
              "sort_code",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "products"."product_type" = 2 THEN ("PMO"."retail_price"+"products"."making_charge"+"products"."finding_charge"+"products"."other_charge") ELSE (SELECT CASE WHEN "PMO"."id_karat" IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" ELSE products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" AND PMO.id_karat = "PMO"."id_karat" END GROUP BY metal_master.metal_rate, PMO.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name) END`
              ),
              "Price",
            ],
            "retail_price",
            "compare_price",
            "id_karat",
          ],
          where: { is_deleted: "0" },
          include: [
            {
              required: false,
              model: MetalMaster,
              as: "metal_master",
              attributes: [],
            },
            {
              required: false,
              model: GoldKarat,
              as: "metal_karat",
              attributes: [],
              where: { is_deleted: "0", is_active: ActiveStatus.Active },
            },
          ],
        },
      ],
    });

    return resSuccess({ data: ProductList });
  } catch (error) {
    throw error;
  }
};

export const deleteProductWishList = async (req: Request) => {
  try {
    const { user_id, product_id } = req.body;
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    const productExit = await Product.findOne({
      where: { id: product_id, is_deleted: "0" },
    });

    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    if (!(productExit && productExit.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await ProductWish.destroy({
      where: {
        user_id: userExit.dataValues.id,
        product_id: productExit.dataValues.id,
      },
    });

    const wish_list_count = await ProductWish.count({
      where: { user_id: user_id },
    });
    return resSuccess({
      message: RECORD_DELETE_SUCCESSFULLY,
      data: wish_list_count,
    });
  } catch (error) {
    throw error;
  }
};

export const getProductWishListData = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";
    const where = [
      pagination.search_text
        ? {
            [Op.or]: [
              Sequelize.where(
                Sequelize.literal(
                  `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT COUNT(*) FROM products WHERE id = "product_id" AND name ILIKE '%${pagination.search_text}%') WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT COUNT(*) from gift_set_products WHERE id = "product_id" AND product_title ILIKE '%${pagination.search_text}%') WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT COUNT(*) from config_products WHERE id = "product_id" AND product_title ILIKE '%${pagination.search_text}%') WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT COUNT(*) from birthstone_products WHERE id = "product_id" AND name ILIKE '%${pagination.search_text}%') WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT COUNT(*) from from config_eternity_products WHERE id = "product_id" AND product_title ILIKE '%${pagination.search_text}') ELSE null END`
                ),
                ">",
                "0"
              ),
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) from customer_users WHERE id_app_user = user_id AND full_name ILIKE  '%${pagination.search_text}%' OR email ILIKE  '%${pagination.search_text}%')`
                ),
                ">",
                "0"
              ),
            ],
          }
        : {},
    ];
    let include = [
      {
        model: SizeData,
        as: "size",
        attributes: [],
      },
      {
        model: LengthData,
        as: "length",
        attributes: [],
      },
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
      {
        model: MetalTone,
        as: "metal_tone",
        attributes: [],
      },
      {
        model: MetalTone,
        as: "head_metal_tone",
        attributes: [],
      },
      {
        model: MetalTone,
        as: "shank_metal_tone",
        attributes: [],
      },
      {
        model: MetalTone,
        as: "band_metal_tone",
        attributes: [],
      },
      {
        model: customerUser,
        as: "user",
        attributes: [],
      },
    ];
    if (!noPagination) {
      const totalItems = await ProductWish.count({ where, include });

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

    const result = await ProductWish.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "user_id",
        "product_type",
        "product_id",
        // "is_band",
        "product_details",
        "product_type",
        [Sequelize.literal(`"user"."full_name"`), "user_name"],
        [Sequelize.literal(`"user"."email"`), "user_email"],
        [Sequelize.literal(`"user"."mobile"`), "user_phone_number"],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
          ),
          "product_title",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
          ),
          "product_slug",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT image_path FROM product_images WHERE id = CAST (product_details ->> 'id_image' AS integer)) WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT image_path FROM loose_diamond_group_masters where id = "product_id") ELSE (SELECT image_path FROM images where id = CAST (product_details ->> 'id_image' AS integer)) END`
          ),
          "product_image",
        ],
        [
          Sequelize.literal(`CAST (product_details ->> 'id_image' AS integer)`),
          "product_image_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_size" IS NOT NULL THEN json_build_object('id', "size"."id", 'size', "size"."size") ELSE null END`
          ),
          "product_size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_length" IS NOT NULL THEN json_build_object('id', "length"."id", 'length', "length"."length") ELSE null END`
          ),
          "product_length",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "wishlist_products"."id_metal" IS NOT NULL THEN json_build_object('id', "metal"."id", 'name', "metal"."name") ELSE null END`
          ),
          "product_metal",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_karat" IS NOT NULL THEN json_build_object('id', "karat"."id", 'name', "karat"."name", 'slug', "karat"."slug") ELSE null END`
          ),
          "product_karat",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_metal_tone" IS NOT NULL THEN json_build_object('id', "metal_tone"."id", 'name', "metal_tone"."name", 'slug', "metal_tone"."slug", 'sort_code', "metal_tone"."sort_code") ELSE null END`
          ),
          "product_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_head_metal_tone" IS NOT NULL THEN json_build_object('id', "head_metal_tone"."id", 'name', "head_metal_tone"."name", 'slug', "head_metal_tone"."slug", 'sort_code', "head_metal_tone"."sort_code") ELSE null END`
          ),
          "product_head_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_shank_metal_tone" IS NOT NULL THEN json_build_object('id', "shank_metal_tone"."id", 'name', "shank_metal_tone"."name", 'slug', "shank_metal_tone"."slug", 'sort_code', "shank_metal_tone"."sort_code") ELSE null END`
          ),
          "product_shank_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_band_metal_tone" IS NOT NULL THEN json_build_object('id', "band_metal_tone"."id", 'name', "band_metal_tone"."name", 'slug', "band_metal_tone"."slug", 'sort_code', "band_metal_tone"."sort_code") ELSE null END`
          ),
          "product_band_metal_tone",
        ],
        [
          Sequelize.literal(`CASE WHEN "product_type" = ${
            AllProductTypes.Config_Ring_product
          } THEN 
            (SELECT CASE WHEN 
              'zamles' = '${PROCESS_ENVIRONMENT}'  THEN  CASE WHEN "file_type" != 3 THEN 
              (SELECT  CASE WHEN (CASE WHEN (product_details ->> 'diamond_type') = null THEN 1 WHEN (product_details ->> 'diamond_type') = 'null' THEN 1  WHEN (product_details ->> 'diamond_type') = 'undefined' THEN 1 WHEN (product_details ->> 'diamond_type') = '' THEN 1 ELSE CAST (product_details ->> 'diamond_type' AS integer) END) = 1 THEN 
                ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
                (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0))
                ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
                (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) END
                 FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON 
                 config_products.center_diamond_group_id = DGM.id 
                 LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , 
                  CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN 
                  (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) 
                  ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
                  END  AS metal_rate FROM config_product_metals AS CPMO 
                  LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id 
                  LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id 
                  WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  LOWER(CPMO.head_shank_band) <> '' 
                  ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, 
                  CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
                  LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
                  FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON 
                  CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  
                  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 
                  'band' END GROUP BY config_product_id) product_diamond ON 
                  (config_products.id = product_diamond.config_product_id ) 
                  WHERE config_products.id = "product_id") 
                  ELSE (SELECT CASE WHEN "wishlist_products"."is_band" = '1' THEN SUM(COALESCE(config_products.retail_price, 0)+
                  COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END 
                  FROM config_products LEFT OUTER JOIN config_product_metals AS CPM ON 
                  CPM.config_product_id = config_products.id WHERE  config_products.id = "config_products"."id" AND  
                  CPM.head_shank_band = 'band') END   ELSE CASE WHEN "file_type" != 3 THEN 
                  (SELECT  CASE WHEN (CASE WHEN (product_details ->> 'diamond_type') = null THEN 1 WHEN (product_details ->> 'diamond_type') = 'null' THEN 1  WHEN (product_details ->> 'diamond_type') = 'undefined' THEN 1 WHEN (product_details ->> 'diamond_type') = '' THEN 1 ELSE CAST (product_details ->> 'diamond_type' AS integer) END) = 1 THEN 
                  ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) 
                  ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) END FROM 
                  config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = 
                  DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, 
                    CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+
                    COALESCE(sum(CPMO.labor_charge), 0)) ELSE  
                    (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
                    END  AS metal_rate FROM config_product_metals AS 
                    CPMO LEFT OUTER JOIN metal_masters AS metal_master ON 
                    metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id
                     WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  LOWER(CPMO.head_shank_band) <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' 
                     END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
                     LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
                     FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id 
                     WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY 
                     config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id )
                      WHERE config_products.id = "product_id" ) ELSE (SELECT CASE WHEN "wishlist_products"."is_band" = '1' 
                        THEN SUM(COALESCE(config_products.retail_price, 0)+COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END FROM config_products 
                        LEFT OUTER JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id WHERE  
                        config_products.id = "product_id" AND  
                        CPM.head_shank_band = 'band') END END FROM config_products WHERE id = "product_id")
              WHEN "product_type" = ${
                AllProductTypes.Product
              } THEN (SELECT CASE WHEN products.product_type = ${
            SingleProductType.VariantType
          } THEN (making_charge+finding_charge+other_charge+PMO.retail_price)  ELSE  CASE WHEN PMO.id_karat IS NULL THEN
                (metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) 
                ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) 
                END END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id 
                LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' 
                LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal 
                LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group 
                LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat 
                WHERE CASE WHEN products.product_type != ${
                  SingleProductType.VariantType
                } THEN CASE WHEN PMO.id_karat IS NULL 
                THEN products.id = "product_id" AND PMO.id_metal = "wishlist_products"."id_metal" 
                ELSE products.id = "product_id" AND PMO.id_metal = CAST ("wishlist_products"."id_metal" AS integer) 
                AND PMO.id_karat = CASE WHEN ("wishlist_products"."id_karat") IS NULL THEN null ELSE CAST ("wishlist_products"."id_karat" AS integer) 
                END END ELSE PMO.id = variant_id END GROUP BY metal_master.metal_rate, pmo.metal_weight, products.making_charge, products.finding_charge,
                 products.other_charge,PMO.id_karat, gold_kts.name, products.product_type, PMO.retail_price) WHEN "product_type" = ${
                   AllProductTypes.GiftSet_product
                 } 
                 THEN (SELECT  price FROM gift_set_products WHERE id = "product_id") 
                 WHEN "product_type" = ${
                   AllProductTypes.Three_stone_config_product
                 } THEN 
                        (SELECT ((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id") 
            WHEN "product_type" = ${
              AllProductTypes.BirthStone_product
            } THEN (SELECT price FROM  
              birthstone_product_metal_options 
              WHERE CASE WHEN "wishlist_products"."id_karat" IS NOT NULL THEN 
              birthstone_product_metal_options.id_product = "product_id"
              AND birthstone_product_metal_options.id_metal = "wishlist_products"."id_metal" AND birthstone_product_metal_options.id_karat = "wishlist_products"."id_karat"  
              AND birthstone_product_metal_options.id_metal_tone = CAST ("wishlist_products"."id_metal_tone" AS text)  ELSE id_product = "product_id" 
              AND birthstone_product_metal_options.id_metal = ("wishlist_products"."id_metal") END) WHEN "product_type" = ${
                AllProductTypes.Eternity_product
              } THEN (SELECT 
    (CASE 
        WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
        THEN dgm.rate 
        ELSE dgm.synthetic_rate 
    END) 
    + COALESCE(labour_charge, 0) 
    + COALESCE(other_charge, 0) 
    + product_metal.metal_rate 
    + COALESCE(product_diamond.diamond_rate, 0)
FROM config_eternity_products 
LEFT OUTER JOIN diamond_group_masters AS dgm 
    ON config_eternity_products.diamond_group_id = dgm.id
LEFT OUTER JOIN (
    SELECT 
        config_eternity_id,
        cepm.metal_id,
        cepm.karat_id,
        CASE 
            WHEN cepm.karat_id IS NULL
            THEN SUM(metal_wt * mm.metal_rate)
            ELSE SUM(metal_wt * (mm.metal_rate / 31.104 * gk.name / 24))
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
WHERE config_eternity_products.id = "product_id") WHEN "product_type" = ${
            AllProductTypes.LooseDiamond
          } THEN (SELECT total_price FROM loose_diamond_group_masters where id = "product_id") 
    WHEN "product_type" = ${AllProductTypes.SettingProduct}
    THEN 
      (SELECT CASE 
        WHEN products.product_type = 2
          THEN CASE 
              WHEN products.is_choose_setting = '1'
                THEN PMO.retail_price - COALESCE(PMO.center_diamond_price, 0)
              ELSE PMO.RETAIL_PRICE
              END
        ELSE CASE 
            WHEN PMO.id_karat IS NULL
              THEN (metal_master.metal_rate * PMO.metal_weight + (COALESCE(SUM(DGM.rate * PDO.weight * PDO.count), 0)))
            ELSE (metal_master.metal_rate / 31.104 * GOLD_KTS.name / 24 * PMO.metal_weight + (COALESCE(SUM(DGM.RATE * PDO.weight * PDO.count), 0)))
            END
        END
      FROM products
      LEFT JOIN product_metal_options AS PMO ON PMO.id_product = products.id
      LEFT JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal
      LEFT JOIN gold_kts ON gold_kts.id = PMO.id_karat
      LEFT JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '${
        DeletedStatus.No
      }' AND PDO.id_type = 2
      LEFT JOIN diamond_group_masters AS DGM ON DGM.ID = PDO.id_diamond_group
      WHERE products.id = product_id
        AND PMO.id = variant_id
        AND PMO.is_deleted = '${DeletedStatus.No}'
      GROUP BY products.id, GOLD_KTS.id
        ,metal_master.id
        ,PMO.id)
    ELSE
    null END`),
          "product_price",
        ],
      ],
      include,
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const addVariantProductIntoWishList = async (req: Request) => {
  try {
    const {
      user_id,
      product_id,
      product_type,
      id_metal,
      id_karat,
      id_metal_tone,
      variant_id,
      id_image,
      id_size,
      id_length,
      product_details,
      id_head_metal_tone,
      id_shank_metal_tone,
      is_band,
      id_band_metal_tone,
      diamond_stock_number,
      diamond_inventory_type,
      diamond_origin,
      diamond,
    } = req.body;
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: DeletedStatus.No },
    });

    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    const trn = await dbContext.transaction();
    try {
      // single product add to cart

      if (product_type == AllProductTypes.Product) {
        const product = await Product.findOne({
          where: { id: product_id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        if (!(product && product.dataValues)) {
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const variant = await ProductMetalOption.findOne({
          where: {
            id: variant_id,
            id_product: product_id,
            is_deleted: DeletedStatus.No,
          },
          transaction: trn,
        });

        if (!(variant && variant.dataValues)) {
          return resNotFound({ message: PRODUCT_VARIANT_NOT_FOUND });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            product_type: product_type,
            product_id: product_id,
            user_id: user_id,
            variant_id: variant_id,
            id_metal_tone: id_metal_tone,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            variant_id: variant_id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.Product,
            id_size: id_size ? id_size : null,
            id_metal: id_metal,
            id_karat: id_karat ? id_karat : null,
            id_length: id_length ? id_length : null,
            id_metal_tone: id_metal_tone ? id_metal_tone : null,
            product_details: {
              id_image: id_image,
              id_size,
              id_length,
              id_karat,
              id_metal,
              id_metal_tone,
            },
          },
          { transaction: trn }
        );

        // gift set  product add to cart
      } else if (product_type == AllProductTypes.GiftSet_product) {
        const product = await GiftSetProduct.findOne({
          where: { id: product_id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        if (!(product && product.dataValues)) {
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            product_type: product_type,
            product_id: product_id,
            user_id: user_id,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.GiftSet_product,
            id_size: id_size,
            id_length: id_length,
            product_details: { id_image },
          },
          { transaction: trn }
        );

        // birthstone product add to cart
      } else if (product_type == AllProductTypes.BirthStone_product) {
        const product = await BirthStoneProduct.findOne({
          where: { id: product_id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        if (!(product && product.dataValues)) {
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const variant = await BirthstoneProductMetalOption.findOne({
          where: {
            id: variant_id,
            id_product: product_id,
            is_deleted: DeletedStatus.No,
          },
          transaction: trn,
        });

        if (!(variant && variant.dataValues)) {
          return resNotFound({ message: PRODUCT_VARIANT_NOT_FOUND });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            product_type: product_type,
            product_id: product_id,
            user_id: user_id,
            variant_id: variant_id,
            id_metal_tone:
              id_metal_tone &&
              id_metal_tone != "null" &&
              id_metal_tone != undefined &&
              id_metal_tone != "undefined"
                ? id_metal_tone
                : null,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }

        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(dbContext,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            null
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }

        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.ConfigProduct,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            variant_id: variant_id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.BirthStone_product,
            id_size:
              id_size &&
              id_size != "null" &&
              id_size != undefined &&
              id_size != "undefined"
                ? id_size
                : null,
            id_metal: id_metal,
            id_karat:
              id_karat &&
              id_karat != "null" &&
              id_karat != undefined &&
              id_karat != "undefined"
                ? id_karat
                : null,
            id_length:
              id_length &&
              id_length != "null" &&
              id_length != undefined &&
              id_length != "undefined"
                ? id_length
                : null,
            id_metal_tone:
              id_metal_tone &&
              id_metal_tone != "null" &&
              id_metal_tone != undefined &&
              id_metal_tone != "undefined"
                ? id_metal_tone
                : null,
            product_details: { ...product_details, id_image: idImage },
          },
          { transaction: trn }
        );

        // config ring product add to cart
      } else if (product_type == AllProductTypes.Config_Ring_product) {
        const product = await ConfigProduct.findOne({
          where: { id: product_id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        if (!(product && product.dataValues)) {
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            product_type: product_type,
            product_id: product_id,
            user_id: user_id,
            id_head_metal_tone: id_head_metal_tone,
            id_shank_metal_tone: id_shank_metal_tone,
            is_band: is_band,
            id_band_metal_tone: is_band == "1" ? id_band_metal_tone : null,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(dbContext,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            null
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }

        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.ConfigProduct,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.Config_Ring_product,
            id_size:
              id_size &&
              id_size != "null" &&
              id_size != undefined &&
              id_size != "undefined"
                ? id_size
                : null,
            id_metal: id_metal,
            id_karat: id_karat ? id_karat : null,
            id_head_metal_tone: id_head_metal_tone,
            id_shank_metal_tone: id_shank_metal_tone,
            is_band: is_band,
            id_band_metal_tone: is_band == "1" ? id_band_metal_tone : null,
            product_details: { ...product_details, id_image: idImage },
          },
          { transaction: trn }
        );

        // Three stone config product add to wishlist
      } else if (product_type == AllProductTypes.Three_stone_config_product) {
        const product = await ConfigProduct.findOne({
          where: { id: product_id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        if (!(product && product.dataValues)) {
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            product_type: product_type,
            product_id: product_id,
            user_id: user_id,
            id_head_metal_tone: id_head_metal_tone,
            id_shank_metal_tone: id_shank_metal_tone,
            is_band: is_band,
            id_band_metal_tone: is_band == "1" ? id_band_metal_tone : null,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(dbContext,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            null
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }

        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.ConfigProduct,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.Three_stone_config_product,
            id_size:
              id_size &&
              id_size != "null" &&
              id_size != undefined &&
              id_size != "undefined"
                ? id_size
                : null,
            id_metal: id_metal,
            id_karat: id_karat ? id_karat : null,
            id_head_metal_tone: id_head_metal_tone,
            id_shank_metal_tone: id_shank_metal_tone,
            is_band: is_band,
            id_band_metal_tone: is_band == "1" ? id_band_metal_tone : null,
            product_details: { ...product_details, id_image: idImage },
          },
          { transaction: trn }
        );
      } else if (product_type == AllProductTypes.Eternity_product) {
        const product = await ConfigEternityProduct.findOne({
          where: {
            id: product_id,
            is_deleted: DeletedStatus.No,
          },
        });

        if (!(product && product.dataValues)) {
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            product_type: AllProductTypes.Eternity_product,
            id_metal_tone: id_metal_tone,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }

        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(dbContext,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            null
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }

        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.ConfigProduct,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.Eternity_product,
            id_size:
              id_size &&
              id_size != "null" &&
              id_size != undefined &&
              id_size != "undefined"
                ? id_size
                : null,
            id_metal: id_metal,
            id_karat: id_karat ? id_karat : null,
            product_details: { ...product_details, id_image: idImage },
            id_metal_tone: id_metal_tone,
          },
          { transaction: trn }
        );
      } else if (product_type == AllProductTypes.LooseDiamond) {
        const product = await LooseDiamondGroupMasters.findOne({
          where: {
            id: product_id,
            is_deleted: DeletedStatus.No,
            is_active: ActiveStatus.Active,
          },
        });

        if (!(product && product.dataValues)) {
          return resNotFound({
            message: prepareMessageFromParams(ERROR_NOT_FOUND, [
              ["field_name", "Product"],
            ]),
          });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            product_type: AllProductTypes.LooseDiamond,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.LooseDiamond,
            product_details: { ...product_details },
          },
          { transaction: trn }
        );
      } else if (product_type == AllProductTypes.SettingProduct) {
        const product = await Product.findOne({
          where: {
            id: product_id,
            is_deleted: DeletedStatus.No,
            [Op.or]: {
              is_choose_setting: "1",
              product_type: SingleProductType.DynemicPrice,
            },
          },
          transaction: trn,
        });

        if (!(product && product.dataValues)) {
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const variant = await ProductMetalOption.findOne({
          where: {
            id: variant_id,
            id_product: product_id,
            is_deleted: DeletedStatus.No,
          },
          transaction: trn,
        });

        if (!(variant && variant.dataValues)) {
          return resNotFound({ message: PRODUCT_VARIANT_NOT_FOUND });
        }

        if (!diamond) {
          return resBadRequest({
            message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Diamond details"],
            ]),
          });
        }

        if (
          ![
            DIAMOND_INVENTROY_TYPE.Local,
            DIAMOND_INVENTROY_TYPE.VDB,
            DIAMOND_INVENTROY_TYPE.Rapnet,
          ].includes(diamond_inventory_type)
        ) {
          return resNotFound({
            message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "Diamond inventory"],
            ]),
          });
        }

        if (
          ![DIAMOND_ORIGIN.Natural, DIAMOND_ORIGIN.LabGrown].includes(
            diamond_origin
          )
        ) {
          return resNotFound({
            message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "Diamond origin"],
            ]),
          });
        }

        const wishListProductCheck = await ProductWish.findOne({
          where: {
            product_type: product_type,
            product_id: product_id,
            user_id: user_id,
            variant_id: variant_id,
            id_metal_tone: id_metal_tone,
            "product_details.diamond.stock_number": diamond_stock_number,
            "product_details.diamond.inventory_type": diamond_inventory_type,
          },
          transaction: trn,
        });

        if (wishListProductCheck && wishListProductCheck.dataValues) {
          return resErrorDataExit({
            data: ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST,
          });
        }

        await ProductWish.create(
          {
            user_id: userExit.dataValues.id,
            product_id: product.dataValues.id,
            variant_id: variant_id,
            created_date: getLocalDate(),
            product_type: AllProductTypes.SettingProduct,
            id_size: id_size ? id_size : null,
            id_metal: id_metal,
            id_karat: id_karat ? id_karat : null,
            id_length: id_length ? id_length : null,
            id_metal_tone: id_metal_tone ? id_metal_tone : null,
            product_details: {
              id_image: id_image,
              id_size,
              id_length,
              id_karat,
              id_metal,
              id_metal_tone,
              diamond: {
                ...JSON.parse(diamond),
                inventory_type: diamond_inventory_type,
              },
            },
          },
          { transaction: trn }
        );
      }

      const wish_list_count = await ProductWish.count({
        where: { user_id: user_id },
        transaction: trn,
      });

      await trn.commit();
      return resSuccess({ data: { wish_list_count } });
    } catch (error) {
      await trn.rollback();
      return resUnknownError({ data: error });
    }
  } catch (error) {
    throw error;
  }
};

export const getVariantProductWishlistByUserId = async (req: Request) => {
  try {
    const { user_id } = req.params;

    const userData = await AppUser.findOne({
      where: { id: user_id, is_deleted: DeletedStatus.No },
    });
    if (!(userData && userData.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const products = await ProductWish.findAll({
      where: { user_id: userData.dataValues.id },
      attributes: [
        "id",
        "user_id",
        "product_type",
        "product_id",
        "is_band",
        "product_details",
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
          ),
          "product_title",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
          ),
          "product_slug",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT image_path FROM product_images WHERE id = CAST (product_details ->> 'id_image' AS integer)) WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT image_path FROM loose_diamond_group_masters where id = "product_id") ELSE (SELECT image_path FROM images where id = CAST (product_details ->> 'id_image' AS integer)) END`
          ),
          "product_image",
        ],
        [
          Sequelize.literal(`CAST (product_details ->> 'id_image' AS integer)`),
          "product_image_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_size" IS NOT NULL THEN json_build_object('id', "size"."id", 'size', "size"."size") ELSE null END`
          ),
          "product_size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_length" IS NOT NULL THEN json_build_object('id', "length"."id", 'length', "length"."length") ELSE null END`
          ),
          "product_length",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "wishlist_products"."id_metal" IS NOT NULL THEN json_build_object('id', "metal"."id", 'name', "metal"."name") ELSE null END`
          ),
          "product_metal",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_karat" IS NOT NULL THEN json_build_object('id', "karat"."id", 'name', "karat"."name", 'slug', "karat"."slug") ELSE null END`
          ),
          "product_karat",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_metal_tone" IS NOT NULL THEN json_build_object('id', "metal_tone"."id", 'name', "metal_tone"."name", 'slug', "metal_tone"."slug", 'sort_code', "metal_tone"."sort_code") ELSE null END`
          ),
          "product_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_head_metal_tone" IS NOT NULL THEN json_build_object('id', "head_metal_tone"."id", 'name', "head_metal_tone"."name", 'slug', "head_metal_tone"."slug", 'sort_code', "head_metal_tone"."sort_code") ELSE null END`
          ),
          "product_head_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_shank_metal_tone" IS NOT NULL THEN json_build_object('id', "shank_metal_tone"."id", 'name', "shank_metal_tone"."name", 'slug', "shank_metal_tone"."slug", 'sort_code', "shank_metal_tone"."sort_code") ELSE null END`
          ),
          "product_shank_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_band_metal_tone" IS NOT NULL THEN json_build_object('id', "band_metal_tone"."id", 'name', "band_metal_tone"."name", 'slug', "band_metal_tone"."slug", 'sort_code', "band_metal_tone"."sort_code") ELSE null END`
          ),
          "product_band_metal_tone",
        ],
        [
          Sequelize.literal(`CASE WHEN "product_type" = ${
            AllProductTypes.Config_Ring_product
          } THEN 
        (SELECT CASE WHEN 
          'zamles' = '${PROCESS_ENVIRONMENT}'  THEN  CASE WHEN "file_type" != 3 THEN 
          (SELECT  CASE WHEN (CASE WHEN (product_details ->> 'diamond_type') = null THEN 1 WHEN (product_details ->> 'diamond_type') = 'null' THEN 1  WHEN (product_details ->> 'diamond_type') = 'undefined' THEN 1 WHEN (product_details ->> 'diamond_type') = '' THEN 1 ELSE CAST (product_details ->> 'diamond_type' AS integer) END) = 1 THEN 
            ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0))
            ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) END
             FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON 
             config_products.center_diamond_group_id = DGM.id 
             LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , 
              CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN 
              (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) 
              ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
              END  AS metal_rate FROM config_product_metals AS CPMO 
              LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id 
              LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id 
              WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  LOWER(CPMO.head_shank_band) <> '' 
              ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, 
              CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
              LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
              FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON 
              CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  
              LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 
              'band' END GROUP BY config_product_id) product_diamond ON 
              (config_products.id = product_diamond.config_product_id ) 
              WHERE config_products.id = "product_id") 
              ELSE (SELECT CASE WHEN "wishlist_products"."is_band" = '1' THEN SUM(COALESCE(config_products.retail_price, 0)+
              COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END 
              FROM config_products LEFT OUTER JOIN config_product_metals AS CPM ON 
              CPM.config_product_id = config_products.id WHERE  config_products.id = "config_products"."id" AND  
              CPM.head_shank_band = 'band') END   ELSE CASE WHEN "file_type" != 3 THEN 
              (SELECT  CASE WHEN (CASE WHEN (product_details ->> 'diamond_type') = null THEN 1 WHEN (product_details ->> 'diamond_type') = 'null' THEN 1  WHEN (product_details ->> 'diamond_type') = 'undefined' THEN 1 WHEN (product_details ->> 'diamond_type') = '' THEN 1 ELSE CAST (product_details ->> 'diamond_type' AS integer) END) = 1 THEN 
              ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) 
              ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) END FROM 
              config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = 
              DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, 
                CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+
                COALESCE(sum(CPMO.labor_charge), 0)) ELSE  
                (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
                END  AS metal_rate FROM config_product_metals AS 
                CPMO LEFT OUTER JOIN metal_masters AS metal_master ON 
                metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id
                 WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  LOWER(CPMO.head_shank_band) <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' 
                 END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
                 LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
                 FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id 
                 WHERE CASE WHEN "wishlist_products"."is_band" = '1' THEN  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY 
                 config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id )
                  WHERE config_products.id = "product_id" ) ELSE (SELECT CASE WHEN "wishlist_products"."is_band" = '1' 
                    THEN SUM(COALESCE(config_products.retail_price, 0)+COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END FROM config_products 
                    LEFT OUTER JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id WHERE  
                    config_products.id = "product_id" AND  
                    CPM.head_shank_band = 'band') END END FROM config_products WHERE id = "product_id")
          WHEN "product_type" = ${
            AllProductTypes.Product
          } THEN (SELECT CASE WHEN products.product_type = ${
            SingleProductType.VariantType
          } THEN (making_charge+finding_charge+other_charge+PMO.retail_price)  ELSE  CASE WHEN PMO.id_karat IS NULL THEN
            (metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) 
            ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) 
            END END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id 
            LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' 
            LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal 
            LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group 
            LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat 
            WHERE CASE WHEN products.product_type != ${
              SingleProductType.VariantType
            } THEN CASE WHEN PMO.id_karat IS NULL 
            THEN products.id = "product_id" AND PMO.id_metal = "wishlist_products"."id_metal" 
            ELSE products.id = "product_id" AND PMO.id_metal = CAST ("wishlist_products"."id_metal" AS integer) 
            AND PMO.id_karat = CASE WHEN ("wishlist_products"."id_karat") IS NULL THEN null ELSE CAST ("wishlist_products"."id_karat" AS integer) 
            END END ELSE PMO.id = variant_id END GROUP BY metal_master.metal_rate, pmo.metal_weight, products.making_charge, products.finding_charge,
             products.other_charge,PMO.id_karat, gold_kts.name, products.product_type, PMO.retail_price) WHEN "product_type" = ${
               AllProductTypes.GiftSet_product
             } 
             THEN (SELECT  price FROM gift_set_products WHERE id = "product_id") 
             WHEN "product_type" = ${
               AllProductTypes.Three_stone_config_product
             } THEN 
                        (SELECT ((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id") 
        WHEN "product_type" = ${
          AllProductTypes.BirthStone_product
        } THEN (SELECT price FROM  
          birthstone_product_metal_options 
          WHERE CASE WHEN "wishlist_products"."id_karat" IS NOT NULL THEN 
          birthstone_product_metal_options.id_product = "product_id"
          AND birthstone_product_metal_options.id_metal = "wishlist_products"."id_metal" AND birthstone_product_metal_options.id_karat = "wishlist_products"."id_karat"  
          AND birthstone_product_metal_options.id_metal_tone = CAST ("wishlist_products"."id_metal_tone" AS text)  ELSE id_product = "product_id" 
          AND birthstone_product_metal_options.id_metal = ("wishlist_products"."id_metal") END) WHEN "product_type" = ${
            AllProductTypes.Eternity_product
          } THEN (SELECT 
    (CASE 
        WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
        THEN dgm.rate 
        ELSE dgm.synthetic_rate 
    END) 
    + COALESCE(labour_charge, 0) 
    + COALESCE(other_charge, 0) 
    + product_metal.metal_rate 
    + COALESCE(product_diamond.diamond_rate, 0)
FROM config_eternity_products 
LEFT OUTER JOIN diamond_group_masters AS dgm 
    ON config_eternity_products.diamond_group_id = dgm.id
LEFT OUTER JOIN (
    SELECT 
        config_eternity_id,
        cepm.metal_id,
        cepm.karat_id,
        CASE 
            WHEN cepm.karat_id IS NULL
            THEN SUM(metal_wt * mm.metal_rate)
            ELSE SUM(metal_wt * (mm.metal_rate / 31.104 * gk.name / 24))
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
WHERE config_eternity_products.id = "product_id") WHEN "product_type" = ${
            AllProductTypes.LooseDiamond
          } THEN (SELECT total_price FROM loose_diamond_group_masters where id = "product_id") 
  WHEN "product_type" = ${AllProductTypes.SettingProduct}
    THEN 
      (SELECT CASE 
        WHEN products.product_type = 2
          THEN CASE 
              WHEN products.is_choose_setting = '1'
                THEN PMO.retail_price - COALESCE(PMO.center_diamond_price, 0)
              ELSE PMO.RETAIL_PRICE
              END
        ELSE CASE 
            WHEN PMO.id_karat IS NULL
              THEN (metal_master.metal_rate * PMO.metal_weight + (COALESCE(SUM(DGM.rate * PDO.weight * PDO.count), 0)))
            ELSE (metal_master.metal_rate / 31.104 * GOLD_KTS.name / 24 * PMO.metal_weight + (COALESCE(SUM(DGM.RATE * PDO.weight * PDO.count), 0)))
            END
        END
      FROM products
      LEFT JOIN product_metal_options AS PMO ON PMO.id_product = products.id
      LEFT JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal
      LEFT JOIN gold_kts ON gold_kts.id = PMO.id_karat
      LEFT JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '${
        DeletedStatus.No
      }' AND PDO.id_type = 2
      LEFT JOIN diamond_group_masters AS DGM ON DGM.ID = PDO.id_diamond_group
      WHERE products.id = product_id
        AND PMO.id = variant_id
        AND PMO.is_deleted = '${DeletedStatus.No}'
      GROUP BY products.id, GOLD_KTS.id
        ,metal_master.id
        ,PMO.id)
      ELSE null END`),
          "product_price",
        ],
      ],
      include: [
        {
          model: SizeData,
          as: "size",
          attributes: [],
        },
        {
          model: LengthData,
          as: "length",
          attributes: [],
        },
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
        {
          model: MetalTone,
          as: "metal_tone",
          attributes: [],
        },
        {
          model: MetalTone,
          as: "head_metal_tone",
          attributes: [],
        },
        {
          model: MetalTone,
          as: "shank_metal_tone",
          attributes: [],
        },
        {
          model: MetalTone,
          as: "band_metal_tone",
          attributes: [],
        },
      ],
    });

    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};

export const deleteVariantProductWishList = async (req: Request) => {
  try {
    const { whishlist_id, user_id } = req.params;

    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: DeletedStatus.No },
    });

    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const findProduct = await ProductWish.findOne({
      where: { id: whishlist_id, user_id: user_id },
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await ProductWish.destroy({
      where: { id: whishlist_id },
    });

    const wish_list_count = await ProductWish.count({
      where: { user_id: user_id },
    });

    return resSuccess({
      message: RECORD_DELETE_SUCCESSFULLY,
      data: { wish_list_count },
    });
  } catch (error) {
    throw error;
  }
};
