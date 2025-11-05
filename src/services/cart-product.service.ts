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
} from "../utils/shared-functions";
import {
  PRODUCT_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
  USER_NOT_FOUND,
} from "../utils/app-messages";
import CartProducts from "../model/cart-product.model";
import { ActiveStatus, PRODUCT_IMAGE_TYPE } from "../utils/app-enumeration";
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
import { WHITE_METAL_TONE_SORT_CODE } from "../utils/app-constants";
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

    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
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

    return resSuccess({ data: cart_list_count });
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

    await CartProducts.destroy({
      where: {
        user_id: userExit.dataValues.id,
        product_id: productExit.dataValues.id,
      },
    });

    const cart_list_count = await CartProducts.sum("quantity", {
      where: { user_id: user_id },
    });
    return resSuccess({
      message: RECORD_DELETE_SUCCESSFULLY,
      data: cart_list_count,
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

    if (!noPagination) {
      const totalItems = await CartProducts.count({});

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
      attributes: [
        "user_id",
        [Sequelize.literal('"users->customer_user"."full_name"'), "user_name"],
      ],
      include: [
        {
          required: false,
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "sku",
            "slug",
            "sort_description",
            "long_description",
          ],
        },
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
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};
