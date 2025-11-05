import { Request } from "express";
import AppUser from "../model/app-user.model";
import Product from "../model/product.model";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  PRODUCT_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
  USER_NOT_FOUND,
} from "../../utils/app-messages";
import CartProducts from "../model/cart-product.model";
import {
  AllProductTypes,
  ActiveStatus,
  IMAGE_TYPE,
  PRODUCT_IMAGE_TYPE,
  SingleProductType,
  DeletedStatus,
} from "../../utils/app-enumeration";
import ProductImage from "../model/product-image.model";
import ProductMetalOption from "../model/product-metal-option.model";
import { Op, Sequelize } from "sequelize";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import ProductDiamondOption from "../model/product-diamond-option.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import customerUser from "../model/customer-user.model";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import { WHITE_METAL_TONE_SORT_CODE } from "../../utils/app-constants";
import ConfigProduct from "../model/config-product.model";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import dbContext from "../../config/db-context";
import Image from "../model/image.model";
import ConfigCartProduct from "../model/config-cart-product.model";
import { PROCESS_ENVIRONMENT } from "../../config/env.var";
import { getDiamondByStockNumber } from "./loose-diamond-bulk-import.service";
const crypto = require("crypto");

export const addToCartProductAPI = async (req: Request) => {
  try {
    const {
      user_id,
      product_id,
      metal_id,
      karat_id,
      metal_tone_id,
      size,
      length,
      SKU,
    } = req.body;
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    const productExit = await Product.findOne({
      where: { id: product_id, is_deleted: "0" },
    });
    if (user_id && user_id != null) {
      if (!(userExit && userExit.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }
    if (!(productExit && productExit.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const countryCodeExists = await CartProducts.findOne({
      where: { user_id: user_id, product_id: { [Op.eq]: product_id } },
    });

    if (countryCodeExists && countryCodeExists.dataValues) {
      return resErrorDataExit();
    }

    const id = crypto.randomBytes(20).toString("hex");

    await CartProducts.create({
      id: id,
      user_id: user_id,
      product_id: product_id,
      product_SKU: SKU,
      quantity: 1,
      product_details: { metal_id, karat_id, metal_tone_id, size, length },
      created_date: getLocalDate(),
    });

    const cart_list_count = await CartProducts.sum("quantity", {
      where: { user_id: user_id },
    });

    const config_cart_list_count = await ConfigCartProduct.count({
      where: { user_id: user_id },
    });

    const totalCartCount = cart_list_count + config_cart_list_count;

    return resSuccess({ data: totalCartCount });
  } catch (error) {
    throw error;
  }
};

export const cartProductListByUSerId = async (req: Request) => {
  const { user_id } = req.body;
  let cartProductList = [];

  try {
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    const cartProduct = await CartProducts.findAll({
      where: { user_id: userExit.dataValues.id },
    });

    const metal_tone = await MetalTone.findOne({
      where: { sort_code: WHITE_METAL_TONE_SORT_CODE },
    });

    for (let item of cartProduct) {
      const list = await Product.findOne({
        where: [
          { id: item.dataValues.product_id },
          { is_active: ActiveStatus.Active },
          { is_deleted: "0" },
        ],
        attributes: [
          "id",
          "name",
          "sku",
          "slug",
          "sort_description",
          "long_description",
          "making_charge",
          "finding_charge",
          "other_charge",
          [
            Sequelize.literal(
              `(select id from items_sizes where id = ${
                item.dataValues.product_details.size == "undefined"
                  ? null
                  : item.dataValues.product_details.size
              })`
            ),
            "id_size",
          ],
          [
            Sequelize.literal(
              `(select id from items_sizes where id = ${
                item.dataValues.product_details.length == "undefined"
                  ? null
                  : item.dataValues.product_details.length
              })`
            ),
            "id_length",
          ],
          [
            Sequelize.literal(
              `(select size from items_sizes where id = ${
                item.dataValues.product_details.size == "undefined"
                  ? null
                  : item.dataValues.product_details.size
              })`
            ),
            "size",
          ],
          [
            Sequelize.literal(
              `(select length from items_sizes where id = ${
                item.dataValues.product_details.length == "undefined"
                  ? null
                  : item.dataValues.product_details.length
              })`
            ),
            "length",
          ],
        ],
        include: [
          {
            required: false,
            model: ProductImage,
            as: "product_images",
            attributes: ["image_path", "id_metal_tone"],
            where: {
              image_type: PRODUCT_IMAGE_TYPE.Feature,
              id_metal_tone:
                item.dataValues.product_details.metal_tone_id == ""
                  ? metal_tone?.dataValues.id
                  : item.dataValues.product_details.metal_tone_id,
            },
          },
          {
            required: true,
            model: ProductMetalOption,
            as: "PMO",
            attributes: [
              "id_metal",
              [
                Sequelize.literal(
                  `(select name from metal_masters where id = ${item.dataValues.product_details.metal_id})`
                ),
                "metal",
              ],
              [
                Sequelize.literal(
                  `(select name from metal_tones where id = ${
                    item.dataValues.product_details.metal_tone_id == ""
                      ? metal_tone?.dataValues.id
                      : item.dataValues.product_details.metal_tone_id
                  })`
                ),
                "metal_tone_name",
              ],
              [
                Sequelize.literal(
                  `(select id from metal_tones where id = ${
                    item.dataValues.product_details.metal_tone_id == ""
                      ? metal_tone?.dataValues.id
                      : item.dataValues.product_details.metal_tone_id
                  })`
                ),
                "id_metal_tone",
              ],
              [
                Sequelize.literal(
                  `(select name from gold_kts where id = ${
                    item.dataValues.product_details.karat_id == ""
                      ? null
                      : item.dataValues.product_details.karat_id
                  })`
                ),
                "karat",
              ],
              [
                Sequelize.literal(
                  `(SELECT CASE WHEN "PMO"."id_karat" IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" ELSE products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" AND PMO.id_karat = "PMO"."id_karat" END GROUP BY metal_master.metal_rate, PMO.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name)`
                ),
                "Price",
              ],

              "id_karat",
              [
                Sequelize.literal(
                  `CASE WHEN "PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("PMO"."id_metal_tone", '|')::int[] END`
                ),
                "metal_tone",
              ],
            ],
            where: [
              { id_metal: item.dataValues.product_details.metal_id },
              { id_karat: item.dataValues.product_details.karat_id },
            ],
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
              },
            ],
          },
          {
            required: false,
            model: ProductDiamondOption,
            as: "PDO",
            attributes: [],
            where: { is_deleted: "0" },
            include: [
              {
                required: false,
                model: DiamondGroupMaster,
                as: "rate",
                attributes: [],
                include: [
                  {
                    required: false,
                    model: DiamondShape,
                    as: "shapes",
                    attributes: [],
                    where: { is_deleted: "0", is_active: "1" },
                  },
                ],
                where: { is_deleted: "0", is_active: "1" },
              },
            ],
          },
        ],
      });

      cartProductList.push(list);
    }

    return resSuccess({ data: cartProductList });
  } catch (error) {
    throw error;
  }
};

export const deleteCartProduct = async (req: Request) => {
  try {
    const { user_id, cart_id } = req.body;

    await CartProducts.destroy({ where: { id: cart_id } });

    let cart_list_count;
    if (user_id && user_id != null && user_id != undefined) {
      cart_list_count = await CartProducts.sum("quantity", {
        where: { user_id: user_id },
      });
      cart_list_count = cart_list_count ? cart_list_count : 0;
    } else {
      cart_list_count = 0;
    }
    return resSuccess({
      message: RECORD_DELETE_SUCCESSFULLY,
      data: cart_list_count.toLocaleString(),
    });
  } catch (error) {
    throw error;
  }
};

export const getCartProductListData = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";
    const include = [
      {
        required: false,
        model: AppUser,
        as: "users",
        attributes: [],
        include: [
          {
            required: false,
            model: customerUser,
            as: "customer_user",
            attributes: [],
          },
        ],
      },
    ];
    const where = [
      pagination.search_text
        ? {
            [Op.or]: [
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) from customer_users WHERE id_app_user = user_id AND (full_name ILIKE  '%${pagination.search_text}%' OR email ILIKE  '%${pagination.search_text}%'))`
                ),
                ">",
                "0"
              ),
              Sequelize.where(
                Sequelize.literal(
                  `CASE WHEN "product_type" = ${AllProductTypes.Product} THEN (SELECT COUNT(*) FROM products WHERE id = "product_id" AND name ILIKE '%${pagination.search_text}%') WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT COUNT(*) from gift_set_products WHERE id = "product_id" AND product_title ILIKE '%${pagination.search_text}%') WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT COUNT(*) from config_products WHERE id = "product_id" AND product_title ILIKE '%${pagination.search_text}%') WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT COUNT(*) from birthstone_products WHERE id = "product_id" AND name ILIKE '%${pagination.search_text}%') ELSE null END`
                ),
                ">",
                "0"
              ),
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await CartProducts.count({ where, include });

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

    const result = await CartProducts.findAll({
      ...paginationProps,
      where,
      // order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "user_id",
        "product_type",
        "product_id",
        "product_details",
        "variant_id",
        [Sequelize.literal('"users->customer_user"."full_name"'), "user_name"],
        [Sequelize.literal('"users->customer_user"."email"'), "user_email"],
        [
          Sequelize.literal('"users->customer_user"."mobile"'),
          "user_phone_numer",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
          ),
          "product_title",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN  "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
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
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT image_path FROM product_images WHERE id = CAST (product_details ->> 'image' AS integer)) WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN "product_type" = ${AllProductTypes.LooseDiamond} THEN (SELECT image_path from loose_diamond_group_masters where id = "product_id") ELSE (SELECT image_path FROM images where id = CAST (product_details ->> 'image' AS integer)) END`
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
            `CASE WHEN (product_details ->> 'karat') = null THEN null WHEN (product_details ->> 'karat') = 'null' THEN null  WHEN (product_details ->> 'karat') = 'undefined' THEN NULL WHEN (product_details ->> 'karat') = '' THEN NULL ELSE (SELECT slug FROM gold_kts WHERE id = CAST (product_details ->> 'karat' AS integer)) END`
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
          Sequelize.literal(`CASE WHEN "product_type" = ${
            AllProductTypes.Config_Ring_product
          } THEN
                        (SELECT CASE WHEN
                          'zamles' = '${PROCESS_ENVIRONMENT}'  THEN  CASE WHEN "file_type" != 3 THEN
                          (SELECT  CASE WHEN (CASE WHEN (product_details ->> 'diamond_type') = null THEN 1 WHEN (product_details ->> 'diamond_type') = 'null' THEN 1  WHEN (product_details ->> 'diamond_type') = 'undefined' THEN 1 WHEN (product_details ->> 'diamond_type') = '' THEN 1 ELSE CAST (product_details ->> 'diamond_type' AS integer) END) = 1 THEN
                            ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
                            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity"
                            ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
                            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" END
                             FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON
                             config_products.center_diamond_group_id = DGM.id
                             LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id ,
                              CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN
                              (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0))
                              ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))
                              END  AS metal_rate FROM config_product_metals AS CPMO
                              LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id
                              LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id
                              WHERE CASE WHEN (CASE WHEN (product_details ->> 'is_band') = null THEN 0 WHEN (product_details ->> 'is_band') = 'null' THEN 0  WHEN (product_details ->> 'is_band') = 'undefined' THEN 0 WHEN (product_details ->> 'is_band') = '' THEN 0 ELSE CAST (product_details ->> 'is_band' AS integer) END) = 1 THEN  LOWER(CPMO.head_shank_band) <> ''
                              ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id,
                              CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id )
                              LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate
                              FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON
                              CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN (CASE WHEN (product_details ->> 'is_band') = null THEN 0 WHEN (product_details ->> 'is_band') = 'null' THEN 0  WHEN (product_details ->> 'is_band') = 'undefined' THEN 0 WHEN (product_details ->> 'is_band') = '' THEN 0 ELSE CAST (product_details ->> 'is_band' AS integer) END) = 1 THEN
                              LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <>
                              'band' END GROUP BY config_product_id) product_diamond ON
                              (config_products.id = product_diamond.config_product_id )
                              WHERE config_products.id = "product_id")
                              ELSE (SELECT CASE WHEN (CASE WHEN (product_details ->> 'is_band') = null THEN 0 WHEN (product_details ->> 'is_band') = 'null' THEN 0  WHEN (product_details ->> 'is_band') = 'undefined' THEN 0 WHEN (product_details ->> 'is_band') = '' THEN 0 ELSE CAST (product_details ->> 'is_band' AS integer) END) = 1 THEN SUM(COALESCE(config_products.retail_price, 0)+
                              COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END
                              FROM config_products LEFT OUTER JOIN config_product_metals AS CPM ON
                              CPM.config_product_id = config_products.id WHERE  config_products.id = "config_products"."id" AND
                              CPM.head_shank_band = 'band') END   ELSE CASE WHEN "file_type" != 3 THEN
                              (SELECT  CASE WHEN (CASE WHEN (product_details ->> 'diamond_type') = null THEN 1 WHEN (product_details ->> 'diamond_type') = 'null' THEN 1  WHEN (product_details ->> 'diamond_type') = 'undefined' THEN 1 WHEN (product_details ->> 'diamond_type') = '' THEN 1 ELSE CAST (product_details ->> 'diamond_type' AS integer) END) = 1 THEN
                              ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity"
                              ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" END FROM
                              config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id =
                              DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id,
                                CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+
                                COALESCE(sum(CPMO.labor_charge), 0)) ELSE
                                (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))
                                END  AS metal_rate FROM config_product_metals AS
                                CPMO LEFT OUTER JOIN metal_masters AS metal_master ON
                                metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id
                                 WHERE CASE WHEN (CASE WHEN (product_details ->> 'is_band') = null THEN 0 WHEN (product_details ->> 'is_band') = 'null' THEN 0  WHEN (product_details ->> 'is_band') = 'undefined' THEN 0 WHEN (product_details ->> 'is_band') = '' THEN 0 ELSE CAST (product_details ->> 'is_band' AS integer) END) = 1 THEN  LOWER(CPMO.head_shank_band) <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band'
                                 END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id )
                                 LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate
                                 FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id
                                 WHERE CASE WHEN (CASE WHEN (product_details ->> 'is_band') = null THEN 0 WHEN (product_details ->> 'is_band') = 'null' THEN 0  WHEN (product_details ->> 'is_band') = 'undefined' THEN 0 WHEN (product_details ->> 'is_band') = '' THEN 0 ELSE CAST (product_details ->> 'is_band' AS integer) END) = 1 THEN  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY
                                 config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id )
                                  WHERE config_products.id = "product_id" ) ELSE (SELECT CASE WHEN (CASE WHEN (product_details ->> 'is_band') = null THEN 0 WHEN (product_details ->> 'is_band') = 'null' THEN 0  WHEN (product_details ->> 'is_band') = 'undefined' THEN 0 WHEN (product_details ->> 'is_band') = '' THEN 0 ELSE CAST (product_details ->> 'is_band' AS integer) END) = 1
                                    THEN SUM(COALESCE(config_products.retail_price, 0)+COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END FROM config_products
                                    LEFT OUTER JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id WHERE
                                    config_products.id = "product_id" AND
                                    CPM.head_shank_band = 'band') END END FROM config_products WHERE id = "product_id") WHEN "product_type" = ${
                                      AllProductTypes.Product
                                    }
                            THEN (SELECT CASE WHEN products.product_type = ${
                              SingleProductType.VariantType
                            } THEN (making_charge+finding_charge+other_charge+PMO.retail_price)*"cart_products"."quantity" ELSE  CASE WHEN PMO.id_karat IS NULL
                              THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                                (COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" ELSE
                                (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+
                                (COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" END END
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
                                (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, pmo.metal_weight,
                                products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name, products.product_type, PMO.retail_price)
                                WHEN "product_type" = ${
                                  AllProductTypes.GiftSet_product
                                }
                                THEN (SELECT  ("cart_products"."quantity"*price) FROM gift_set_products WHERE id = "product_id")
                                WHEN "product_type" = ${
                                  AllProductTypes.Three_stone_config_product
                                } THEN
                                (SELECT ((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
                        WHEN "product_type" = ${
                          AllProductTypes.BirthStone_product
                        } THEN (SELECT ("cart_products"."quantity"*price) from birthstone_product_metal_options WHERE CASE WHEN  (product_details ->> 'karat') = 'null' THEN id_product = "product_id" AND id_metal= CAST (product_details ->> 'metal' AS integer) WHEN  (product_details ->> 'karat') = null THEN id_product = "product_id" AND id_metal= CAST (product_details ->> 'metal' AS integer) WHEN  (product_details ->> 'karat') = 'undefined' THEN id_product = "product_id" AND id_metal= CAST (product_details ->> 'metal' AS integer) WHEN  (product_details ->> 'karat') = '' THEN id_product = "product_id" AND id_metal= CAST (product_details ->> 'metal' AS integer)  ELSE id_product = "product_id" AND id_metal= CAST (product_details ->> 'metal' AS integer) AND id_karat = CAST (product_details ->> 'karat' AS integer) AND id_metal_tone = CAST (product_details ->> 'metal_tone' AS character varying) END) WHEN "product_type" = ${
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
                ON config_eternity_products.id = product_diamond.config_eternity_product_id) WHEN "product_type" = ${
                  AllProductTypes.LooseDiamond
                } THEN (SELECT
            total_price * "cart_products"."quantity"
        FROM loose_diamond_group_masters
        WHERE loose_diamond_group_masters.is_deleted = '0'
        AND loose_diamond_group_masters.id = "product_id" ) 
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
      include,
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const cartProductListgustCheckOut = async (req: Request) => {
  try {
    const { cart_id } = req.body;

    const cartProductList = await CartProducts.findAll({
      order: [["created_date", "DESC"]],
      where: { id: { [Op.in]: cart_id } },
      attributes: [
        "id",
        "user_id",
        "product_type",
        "product_id",
        "quantity",
        "variant_id",
        "product_details",
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
          ),
          "product_title",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") ELSE null END`
          ),
          "product_slug",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN (SELECT image_path FROM product_images WHERE id = CAST (product_details ->> 'image' AS integer)) WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') ELSE (SELECT image_path FROM images where id = CAST (product_details ->> 'image' AS integer)) END`
          ),
          "product_image",
        ],
        [
          Sequelize.literal(`CAST (product_details ->> 'image' AS integer)`),
          "product_image_id",
        ],
        [
          Sequelize.literal(
            ` CASE WHEN (product_details ->> 'size') = 'null' THEN null ELSE(SELECT size FROM items_sizes WHERE id = CAST (product_details ->> 'size' AS integer))END`
          ),
          "product_size",
        ],
        [
          Sequelize.literal(
            ` CASE WHEN (product_details ->> 'size') = 'null' THEN null ELSE CAST (product_details ->> 'size' AS integer)END`
          ),
          "size_id",
        ],
        [
          Sequelize.literal(
            `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (product_details ->> 'metal' AS integer))`
          ),
          "product_metal",
        ],
        [
          Sequelize.literal(` CAST (product_details ->> 'metal' AS integer)`),
          "metal_id",
        ],
        [
          Sequelize.literal(
            `CAST (product_details ->> 'metal_tone' AS integer)`
          ),
          "metal_tone_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE  CAST (product_details ->> 'karat' AS integer) END`
          ),
          "karat_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE (SELECT name FROM gold_kts WHERE id = CAST (product_details ->> 'karat' AS integer)) END`
          ),
          "product_karat",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'metal_tone' AS integer))`
          ),
          "Metal_tone",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'head_metal_tone' AS integer))`
          ),
          "head_metal_tone",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'shank_metal_tone' AS integer))`
          ),
          "shank_metal_tone",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'band_metal_tone') = 'null' AND (product_details ->> 'is_band' = '1') THEN null ELSE (SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'band_metal_tone' AS integer)) END`
          ),
          "band_metal_tone",
        ],
        [
          Sequelize.literal(
            `CAST (product_details ->> 'head_metal_tone' AS integer)`
          ),
          "head_metal_tone_id",
        ],
        [
          Sequelize.literal(
            ` CAST (product_details ->> 'shank_metal_tone' AS integer)`
          ),
          "shank_metal_tone_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN (product_details ->> 'is_band') = '1' THEN CAST (product_details ->> 'band_metal_tone' AS integer) ELSE null END`
          ),
          "band_metal_tone_id",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'shank_metal_tone' AS integer))`
          ),
          "shank_metal_tone",
        ],
        [Sequelize.literal(`product_details ->> 'is_band'`), "is_band"],
        [
          Sequelize.literal(
            ` 1+CAST (product_details ->> 'selected_stone_price' AS DECIMAL(12, 1))`
          ),
          "selected_stone_price",
        ],
        [
          Sequelize.literal(`CASE WHEN "product_type" = ${
            AllProductTypes.Config_Ring_product
          } THEN 
                (SELECT ((CASE WHEN CAST (product_details ->> 'diamond_type' AS integer) = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE CPMO.head_shank_band <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE CPDO.product_type <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
          WHEN "product_type" = ${
            AllProductTypes.Three_stone_config_product
          } THEN 
                (SELECT ((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
                WHEN "product_type" = ${AllProductTypes.Product}
                      THEN (SELECT CASE WHEN products.product_type = ${
                        SingleProductType.VariantType
                      } THEN (making_charge+finding_charge+other_charge+PMO.retail_price)*"cart_products"."quantity" ELSE  CASE WHEN PMO.id_karat IS NULL
                        THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                          (COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" ELSE
                          (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+
                          (COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" END END
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
                          (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, pmo.metal_weight,
                          products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name, products.product_type, PMO.retail_price)
                           WHEN "product_type" = ${
                             AllProductTypes.GiftSet_product
                           } THEN (SELECT  price*"cart_products"."quantity" FROM gift_set_products WHERE id = "product_id") 
                WHEN "product_type" = ${
                  AllProductTypes.BirthStone_product
                } THEN (SELECT CASE WHEN birthstone_PMO.id_karat IS NULL 
    THEN(metal_master.metal_rate*birthstone_PMO.metal_weight+(COALESCE(making_charge, 0))+(COALESCE(finding_charge, 0))+(COALESCE(other_charge, 0))+(COALESCE(sum(DGM.rate*birthstone_PDO.count), 0))+(CAST (product_details ->> 'selected_stone_price' AS DECIMAL(12, 1)))) 
    ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*birthstone_PMO.metal_weight+(COALESCE(making_charge, 0))+(COALESCE(finding_charge, 0))+(COALESCE(other_charge, 0))+(COALESCE(sum(DGM.rate*birthstone_PDO.count), 0))+(CAST (product_details ->> 'selected_stone_price' AS DECIMAL(12, 1)))) 
    END*"cart_products"."quantity" FROM birthstone_products 
    LEFT OUTER JOIN birthstone_product_metal_options 
    AS birthstone_PMO ON id_product = birthstone_products.id 
    LEFT OUTER JOIN metal_masters AS metal_master 
    ON metal_master.id = birthstone_PMO.id_metal 
    LEFT OUTER JOIN gold_kts ON gold_kts.id = birthstone_PMO.id_karat
    LEFT OUTER JOIN birthstone_product_diamond_options 
    AS birthstone_PDO ON birthstone_PDO.id_product = birthstone_products.id 
    AND birthstone_PDO.is_deleted = '0' AND birthstone_PDO.id_type = 1
    LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = birthstone_PDO.id_diamond_group
    WHERE CASE WHEN birthstone_PMO.id_karat IS NULL 
    THEN birthstone_products.id = "product_id"
    AND birthstone_PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
    ELSE birthstone_products.id = "product_id"
    AND birthstone_PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
    AND birthstone_PMO.id_karat = CAST (product_details ->> 'karat' AS integer)
    AND birthstone_products.is_deleted = '0'
    END GROUP BY metal_master.metal_rate, birthstone_PMO.metal_weight, birthstone_products.making_charge, birthstone_products.finding_charge, birthstone_products.other_charge,birthstone_PMO.id_karat, gold_kts.name) WHEN "product_type" = ${
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
WHERE config_eternity_products.id  = "product_id") WHEN "product_type" = ${
            AllProductTypes.LooseDiamond
          }
THEN (
    SELECT
    total_price * "cart_products"."quantity"
FROM loose_diamond_group_masters
WHERE loose_diamond_group_masters.is_deleted = '0'
AND loose_diamond_group_masters.id = "product_id"
) ELSE null END`),
          "product_price",
        ],
        [Sequelize.literal(`'0'`), "diamond_price"],
        [Sequelize.literal(`null`), "diamond_details"],
      ],
    });

    const formatedCartProduct = [];
    for (const cartProduct of cartProductList) {
      formatedCartProduct.push(cartProduct.dataValues);
      // Fetch diamond details from the repspective third party diamond API
      // Comment out above line of code (formatedCartProduct.push) if want to use below code
      // if (
      //   cartProduct.dataValues.product_type ===
      //     AllProductTypes.SettingProduct &&
      //   cartProduct.dataValues.product_details?.diamond?.stock_number &&
      //   cartProduct.dataValues.product_details?.diamond?.inventory_type
      // ) {
      //   const diamond = await getDiamondByStockNumber({
      //     stock_number:
      //       cartProduct.dataValues.product_details.diamond.stock_number,
      //     inventory_type:
      //       cartProduct.dataValues.product_details.diamond.inventory_type,
      //     diamond_origin:
      //       cartProduct.dataValues.product_details.diamond.diamond_origin,
      //   });
      //   if (diamond.code === DEFAULT_STATUS_CODE_SUCCESS) {
      //     formatedCartProduct.push({
      //       ...cartProduct.dataValues,
      //       diamond_details: diamond.data,
      //       diamond_price: diamond.data.price,
      //     });
      //   } else {
      //     formatedCartProduct.push(cartProduct.dataValues);
      //   }
      // } else {
      //   formatedCartProduct.push(cartProduct.dataValues);
      // }
    }
    return resSuccess({ data: formatedCartProduct });
  } catch (error) {
    console.log("--------------", error);
    throw error;
  }
};

export const addToCartConfigProductAPI = async (req: Request) => {
  try {
    const {
      user_id,
      product_id,
      metal_id,
      karat_id,
      metal_tone_id,
      ring_size,
      center_diamond_group_id,
      SKU,
      is_band,
    } = req.body;
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    const productExit = await ConfigProduct.findOne({
      where: { id: product_id, is_deleted: "0" },
    });
    if (user_id && user_id != null) {
      if (!(userExit && userExit.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }
    if (!(productExit && productExit.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const configProductExists = await ConfigCartProduct.findOne({
      where: { user_id: user_id, product_id: { [Op.eq]: product_id } },
    });

    if (configProductExists && configProductExists.dataValues) {
      return resErrorDataExit();
    }

    const id = crypto.randomBytes(20).toString("hex");

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

    const trn = await dbContext.transaction();

    try {
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

      await ConfigCartProduct.create({
        id: id,
        user_id: user_id,
        product_id: product_id,
        product_SKU: SKU,
        quantity: 1,
        id_image: idImage,
        product_details: {
          metal_id,
          karat_id,
          metal_tone_id,
          size: ring_size,
          center_diamond_group_id,
          is_band,
        },
        created_date: getLocalDate(),
      });

      const cart_list_count = await CartProducts.sum("quantity", {
        where: { user_id: user_id },
      });

      const config_cart_list_count = await ConfigCartProduct.count({
        where: { user_id: user_id },
      });

      const totalCartCount = cart_list_count + config_cart_list_count;

      await trn.commit();
      return resSuccess({ data: totalCartCount });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const cartConfigProductListByUSerId = async (req: Request) => {
  const { user_id } = req.body;

  try {
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    const metal_tone = await MetalTone.findOne({
      where: { sort_code: WHITE_METAL_TONE_SORT_CODE },
    });

    const cartProduct = await CartProducts.findAll({
      where: { user_id: userExit.dataValues.id },
      attributes: [
        "id",
        "user_id",
        "product_id",
        [Sequelize.literal("0"), "is_config"],
        [Sequelize.literal("product.name"), "product_title"],
        [Sequelize.literal("product.sku"), "product_sku"],
        [
          Sequelize.literal("product_details ->> 'metal_tone_id'"),
          "product_slug",
        ],
        [
          Sequelize.literal(
            `(SELECT image_path FROM product_images WHERE id_product = "product_id" AND image_type = ${PRODUCT_IMAGE_TYPE.Feature} AND id_metal_tone = CASE WHEN product_details ->> 'metal_tone_id' = '' THEN ${metal_tone?.dataValues.id} ELSE CAST (product_details ->> 'metal_tone_id' AS integer) END  LIMIT 1 )`
          ),
          "product_image",
        ],
        [
          Sequelize.literal(
            `(SELECT size FROM items_sizes WHERE id = CAST (product_details ->> 'size' AS integer))`
          ),
          "product_size",
        ],
        [
          Sequelize.literal(`CAST (product_details ->> 'metal_id' AS integer)`),
          "metal_id",
        ],
        [
          Sequelize.literal(`CAST (product_details ->> 'metal_id' AS integer)`),
          "metal_tone_id",
        ],
        [Sequelize.literal(`product_details ->> 'karat_id' `), "karat_id"],
        [
          Sequelize.literal(
            `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (product_details ->> 'metal_id' AS integer))`
          ),
          "product_metal",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM gold_kts WHERE id = CAST (product_details ->> 'karat_id' AS integer))`
          ),
          "product_karat",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM metal_tones WHERE id = CASE WHEN product_details ->> 'metal_tone_id' = '' THEN null ELSE CAST (product_details ->> 'metal_tone_id' AS integer) END)`
          ),
          "Metal_tone",
        ],
        [
          Sequelize.literal(
            `(SELECT length FROM items_lengths WHERE id = CAST (product_details ->> 'length' AS integer))`
          ),
          "product_length",
        ],
        [
          Sequelize.literal(
            `(SELECT  CASE WHEN PMO.id_karat IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal_id' AS integer) ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal_id' AS integer) AND PMO.id_karat = CAST (product_details ->> 'karat_id' AS integer) END GROUP BY metal_master.metal_rate, pmo.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name)`
          ),
          "product_price",
        ],
      ],
      include: [
        {
          model: Product,
          as: "product",
          required: false,
          attributes: [],
        },
      ],
    });

    const configcartProduct = await ConfigCartProduct.findAll({
      where: { user_id: userExit.dataValues.id },
      attributes: [
        "id",
        "user_id",
        "product_id",
        [Sequelize.literal("1"), "is_config"],
        [Sequelize.literal("config_product.product_title"), "product_title"],
        [Sequelize.literal("config_product.sku"), "product_sku"],
        [Sequelize.literal("config_product.slug"), "product_slug"],
        [Sequelize.literal("image.image_path"), "product_image"],
        [
          Sequelize.literal(
            `(SELECT size FROM items_sizes WHERE id = CAST (product_details ->> 'size' AS integer))`
          ),
          "product_size",
        ],
        [
          Sequelize.literal(
            `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (product_details ->> 'metal_id' AS integer))`
          ),
          "product_metal",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM gold_kts WHERE id = CAST (product_details ->> 'karat_id' AS integer))`
          ),
          "product_karat",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'metal_tone_id' AS integer))`
          ),
          "Metal_tone",
        ],
        [
          Sequelize.literal(
            `(SELECT length FROM items_lengths WHERE id = CAST (product_details ->> 'length' AS integer))`
          ),
          "product_length",
        ],
        [Sequelize.literal(`product_details ->> 'is_band'`), "is_band"],
        [
          Sequelize.literal(`CAST (product_details ->> 'metal_id' AS integer)`),
          "metal_id",
        ],
        [
          Sequelize.literal(`CAST (product_details ->> 'metal_id' AS integer)`),
          "metal_tone_id",
        ],
        [Sequelize.literal(`product_details ->> 'karat_id' `), "karat_id"],
        [
          Sequelize.literal(
            `(SELECT ((DGM.rate)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE CPMO.head_shank_band <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE CPDO.product_type <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")`
          ),
          "product_price",
        ],
      ],
      include: [
        {
          model: ConfigProduct,
          as: "config_product",
          required: false,
          attributes: [],
        },
        {
          model: Image,
          as: "image",
          attributes: [],
        },
      ],
    });

    return resSuccess({ data: [...cartProduct, ...configcartProduct] });
  } catch (error) {
    throw error;
  }
};
