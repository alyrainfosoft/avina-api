import { Request } from "express";
import {
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnknownError,
} from "../../utils/shared-functions";
import {
  ADDRESS_NOT_EXITS,
  DEFAULT_STATUS_CODE_SUCCESS,
  INVALID_ID,
  ORDER_NOT_FOUND,
  PRODUCT_NOT_FOUND,
  RECORD_UPDATE_SUCCESSFULLY,
  REQUIRED_ERROR_MESSAGE,
  TOTAL_AMOUNT_WRONG,
  USER_NOT_FOUND,
} from "../../utils/app-messages";
import Product from "../model/product.model";
import dbContext from "../../config/db-context";
import AppUser from "../model/app-user.model";
import {
  AllProductTypes,
  ActiveStatus,
  DeliverStatus,
  OrderStatus,
  OrderTypes,
  PRODUCT_IMAGE_TYPE,
  PaymentStatus,
} from "../../utils/app-enumeration";
import Orders from "../model/order.model";
import OrdersDetails from "../model/order-details.model";
import { Op, QueryTypes, Sequelize, where } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import ProductImage from "../model/product-image.model";
import UserAddress from "../model/address.model";
import { PRODUCT_TAX_PERCENTAGE } from "../../utils/app-constants";
import OrderTransaction from "../model/order-transaction.model";
import CartProducts from "../model/cart-product.model";
import TaxMaster from "../model/master/tax.model";
import GiftSetProduct from "../model/gift-set-product/gift_set_product.model";
import giftSetProductOrder from "../model/gift-set-product/gift_set_product_order.model";
import GiftSetOrdersDetails from "../model/gift-set-product/git_set_product_order_details.model";
import GiftSetProductImages from "../model/gift-set-product/gift_set_product_image.model";
import ConfigProduct from "../model/config-product.model";
import ConfigOrdersDetails from "../model/config-order-details.model";
import {
  IMAGE_PATH,
  ORDER_NUMBER_IDENTITY,
  PAYMENT_CURRENCY_CODE,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET_ID,
  PROCESS_ENVIRONMENT,
} from "../../config/env.var";
import StoneData from "../model/master/attributes/gemstones.model";
import CutsData from "../model/master/attributes/cuts.model";
import MMSizeData from "../model/master/attributes/mmSize.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import CityData from "../model/master/city.model";
import couponData from "../model/coupon.model";
const crypto = require("crypto");
const paypal = require("@paypal/checkout-server-sdk");

/* paypal environment */

const Environment =
  PROCESS_ENVIRONMENT == "development"
    ? paypal.core.SandboxEnvironment
    : paypal.core.LiveEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(PAYPAL_CLIENT_ID, PAYPAL_SECRET_ID)
);

export const addProductOrder = async (req: Request) => {
  try {
    const {
      user_id,
      email,
      coupon_id,
      sub_total,
      order_note,
      is_add_address,
      payment_method,
      order_total,
      currency_id,
      order_shipping_address,
      order_type,
      shipping_method,
      pickup_store_id,
      order_billing_address,
      product_details,
      shipping_cost,
      discount,
      total_tax,
    } = req.body;

    if (user_id) {
      const users = await AppUser.findOne({
        where: { id: user_id, is_deleted: "0" },
      });
      if (!(users && users.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }

    const taxValues = await TaxMaster.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: "0" },
    });

    let productTaxAmount: any;
    let productTax: any;
    let allTax = [];
    let taxRateData = [];
    for (const taxData of taxValues) {
      productTax = taxData.dataValues.rate / 100;
      productTaxAmount = sub_total * productTax;
      console.log(productTaxAmount);

      taxRateData.push({
        rate: taxData.dataValues.rate,
        tax_amount: parseFloat(productTaxAmount.toFixed(2)),
        name: taxData.dataValues.name,
      });
      allTax.push(parseFloat(productTaxAmount.toFixed(2)));
    }

    const sumTotal = allTax.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    const totalOrderAmount =
      parseFloat(sub_total) + parseFloat(sumTotal.toFixed(2));

    console.log("totalOrderAmount", totalOrderAmount);

    if (totalOrderAmount.toFixed(2) != order_total) {
      return resBadRequest({ message: TOTAL_AMOUNT_WRONG });
    }

    const trn = await dbContext.transaction();
    const order_number = crypto.randomInt(1000000000, 9999999999);

    try {
      const billingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_billing_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let billingCityCreateId: any;
      if (
        billingAddresscityNameExistes &&
        billingAddresscityNameExistes.dataValues
      ) {
        billingCityCreateId = billingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_billing_address.city_id,
            city_code: order_billing_address.city_id,
            id_state: order_billing_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        billingCityCreateId = created.dataValues.id;
      }

      const shippingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_shipping_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let shippingCityCreateId: any;
      if (
        shippingAddresscityNameExistes &&
        shippingAddresscityNameExistes.dataValues
      ) {
        shippingCityCreateId = shippingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_shipping_address.city_id,
            city_code: order_shipping_address.city_id,
            id_state: order_shipping_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        shippingCityCreateId = created.dataValues.id;
      }

      if (parseInt(is_add_address) == 1) {
        if (order_billing_address.id && order_shipping_address.id) {
          if (
            order_billing_address.id &&
            parseInt(order_billing_address.id) == 0
          ) {
            const payload = {
              user_id: user_id,
              full_name: order_billing_address.full_name,
              house_building: order_billing_address.house_builing,
              area_name: order_billing_address.area_name,
              pincode: order_billing_address.pincode,
              phone: order_billing_address.phone_number,
              city_id: billingCityCreateId,
              state_id: order_billing_address.state_id,
              country_id: order_billing_address.country_id,
              address_type: 2,
              default_addres: 0,
              is_deleted: 0,
              created_date: getLocalDate(),
            };

            await UserAddress.create(payload, { transaction: trn });
          } else {
            const addressId = await UserAddress.findOne({
              where: { id: order_billing_address.id, is_deleted: "0" },
            });
            if (!(addressId && addressId.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: ADDRESS_NOT_EXITS });
            }
            const addressInfo = await UserAddress.update(
              {
                house_building: order_billing_address.house_builing,
                full_name: order_billing_address.full_name,
                area_name: order_billing_address.area_name,
                pincode: order_billing_address.pincode,
                phone: order_billing_address.phone_number,
                city_id: billingCityCreateId,
                state_id: order_billing_address.state_id,
                country_id: order_billing_address.country_id,
                address_type: 2,
                default_addres: 0,
                modified_date: getLocalDate(),
              },

              {
                where: { id: addressId.dataValues.id, is_deleted: "0" },
                transaction: trn,
              }
            );
          }
          if (order_shipping_address.country_id != null) {
            if (
              order_shipping_address.id &&
              parseInt(order_shipping_address.id) == 0
            ) {
              const payload = {
                user_id: user_id,
                full_name: order_shipping_address.full_name,
                house_building: order_shipping_address.house_builing,
                area_name: order_shipping_address.area_name,
                pincode: order_shipping_address.pincode,
                phone: order_shipping_address.phone_number,
                city_id: shippingCityCreateId,
                state_id: order_shipping_address.state_id,
                country_id: order_shipping_address.country_id,
                address_type: 1,
                default_addres: 0,
                is_deleted: 0,
                created_date: getLocalDate(),
              };

              await UserAddress.create(payload, { transaction: trn });
            } else {
              const addressId = await UserAddress.findOne({
                where: { id: order_shipping_address.id, is_deleted: "0" },
              });
              if (!(addressId && addressId.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: ADDRESS_NOT_EXITS });
              }
              const addressInfo = await UserAddress.update(
                {
                  house_building: order_shipping_address.house_builing,
                  full_name: order_shipping_address.full_name,
                  area_name: order_shipping_address.area_name,
                  pincode: order_shipping_address.pincode,
                  phone: order_shipping_address.phone_number,
                  city_id: shippingCityCreateId,
                  state_id: order_shipping_address.state_id,
                  country_id: order_shipping_address.country_id,
                  address_type: 1,
                  default_addres: 0,
                  modified_date: getLocalDate(),
                },
                {
                  where: { id: addressId.dataValues.id, is_deleted: "0" },
                  transaction: trn,
                }
              );
            }
          }
        }
      }

      const ordersPayload = {
        order_number: `${ORDER_NUMBER_IDENTITY}-${order_number}`,
        user_id: user_id,
        email: email,
        shipping_method: shipping_method,
        pickup_store_id: pickup_store_id,
        coupon_id,
        sub_total: parseFloat(sub_total),
        shipping_cost: parseFloat(shipping_cost),
        discount: parseFloat(discount),
        total_tax: sumTotal,
        order_total: totalOrderAmount,
        payment_method: payment_method,
        currency_id: currency_id,
        order_status: OrderStatus.Pendding,
        payment_status: PaymentStatus.InPaid,
        order_date: getLocalDate(),
        order_type: order_type,
        order_note: order_note,
        order_shipping_address: {
          ...order_shipping_address,
          city_id: shippingCityCreateId,
        },
        order_billing_address: {
          ...order_billing_address,
          city_id: billingCityCreateId,
        },
        order_taxs: JSON.stringify(taxRateData),
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
      };

      const orders = await Orders.create(ordersPayload, { transaction: trn });

      for (let product of product_details) {
        if (!product.product_id) {
          await trn.rollback();
          return resBadRequest({ message: INVALID_ID });
        }
        const products = await Product.findOne({
          where: { id: product.product_id, is_deleted: "0" },
          transaction: trn,
        });
        if (!(products && products.dataValues)) {
          await trn.rollback();
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }
        let diamondRate = await dbContext.query(
          `SELECT sum(diamond_group_masters.rate) FROM product_diamond_options LEFT OUTER JOIN diamond_group_masters ON diamond_group_masters.id = product_diamond_options.id_diamond_group WHERE product_diamond_options.id_product = ${product.product_id}`,
          { type: QueryTypes.SELECT }
        );
        const metalRates = await dbContext.query(
          `SELECT CASE WHEN PMO.id_karat IS NULL THEN (metal.metal_rate*PMO.metal_weight) ELSE (metal.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal ON PMO.id_metal = metal.id LEFT OUTER JOIN gold_kts ON PMO.id_karat = gold_kts.id WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} ELSE products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} AND PMO.id_karat = ${product.order_details_json.karat_id} END`,
          { type: QueryTypes.SELECT }
        );

        const ordersDetails = await OrdersDetails.create(
          {
            order_id: orders.dataValues.id,
            product_id: product.product_id,
            quantity: product.quantity,
            finding_charge: parseFloat(products.dataValues.finding_charge),
            makring_charge: parseFloat(products.dataValues.making_charge),
            other_charge: parseFloat(products.dataValues.other_charge),
            diamond_rate: diamondRate.map((t: any) => t.sum)[0],
            metal_rate: metalRates.map((t: any) => t.case)[0],
            sub_total: parseFloat(product.sub_total),
            product_tax: parseFloat(product.product_tax),
            discount_amount: parseFloat(product.discount_amount),
            shipping_cost: parseFloat(product.shipping_cost),
            shipping_method_id: shipping_method,
            delivery_status: DeliverStatus.Pendding,
            payment_status: PaymentStatus.InPaid,
            order_details_json: product.order_details_json,
          },
          { transaction: trn }
        );
      }

      await trn.commit();
      return resSuccess({ data: null });
    } catch (error) {
      await trn.rollback();
      return resUnknownError({ data: error });
    }
  } catch (error) {
    throw error;
  }
};

export const getAllOrdersUser = async (req: Request) => {
  try {
    const { start_date, end_date, order_status } = req.query;
    const user_id = req.query.user_id;
    const startDateFilter =
      start_date != undefined ? start_date : new Date().getFullYear();

    const endDateFilter: any = end_date != undefined ? end_date : new Date();
    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);
    if (!user_id) return resBadRequest({ message: INVALID_ID });
    const users = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    if (!(users && users.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { user_id: user_id },
      {
        [Op.or]: [{ order_date: { [Op.between]: [startDateFilter, endDate] } }],
      },
      order_status && order_status != OrderStatus.All.toString()
        ? { order_status: { [Op.eq]: order_status } }
        : {},
    ];

    const include: any = [
      {
        model: couponData,
        as: "coupon",
        attributes: [
          "id",
          "coupon_code",
          "discount_type",
          "discount_amount",
          "description",
          "percentage_off",
          "maximum_discount_amount",
        ],
      },
      {
        model: OrdersDetails,
        as: "order",
        attributes: [
          "quantity",
          "finding_charge",
          "makring_charge",
          "other_charge",
          "diamond_count",
          "diamond_rate",
          "metal_rate",
          "sub_total",
          "product_tax",
          "delivery_status",
          "payment_status",
          "refund_request_id",
          "order_details_json",
          "product_id",
          [
            Sequelize.literal(
              `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT image_path FROM product_images WHERE id = CAST (order_details_json ->> 'image_id' AS integer)) WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT image_path from loose_diamond_group_masters where id = "product_id") ELSE (SELECT image_path FROM images where id = CAST (order_details_json ->> 'image_id' AS integer)) END`
            ),
            "product_image",
          ],
          ["sub_total", "product_price"],
          [
            Sequelize.literal(
              `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
            ),
            "product_title",
          ],
          [
            Sequelize.literal(
              `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters) WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") ELSE null END`
            ),
            "product_sku",
          ],
          [
            Sequelize.literal(
              `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters) WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") ELSE null END`
            ),
            "product_slug",
          ],
          [
            Sequelize.literal(
              `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (order_details_json ->> 'metal_id' AS integer))`
            ),
            "metal",
          ],
          [
            Sequelize.literal(
              `(SELECT gold_kts.name FROM gold_kts WHERE gold_kts.id = CAST (order_details_json ->> 'karat_id' AS integer))`
            ),
            "Karat",
          ],
          [
            Sequelize.literal(
              `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'head_metal_tone' AS integer))`
            ),
            "head_metal_tone",
          ],
          [
            Sequelize.literal(
              `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'shank_metal_tone' AS integer))`
            ),
            "shank_metal_tone",
          ],
          [
            Sequelize.literal(
              `CASE WHEN (order_details_json ->> 'band_metal_tone') = 'null' THEN null ELSE (SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'band_metal_tone' AS integer)) END`
            ),
            "band_metal_tone",
          ],
          [
            Sequelize.literal(
              `CAST (order_details_json ->> 'head_metal_tone' AS integer)`
            ),
            "head_metal_tone_id",
          ],
          [
            Sequelize.literal(
              ` CAST (order_details_json ->> 'shank_metal_tone' AS integer)`
            ),
            "shank_metal_tone_id",
          ],
          [
            Sequelize.literal(
              ` CAST (order_details_json ->> 'band_metal_tone' AS integer)`
            ),
            "band_metal_tone_id",
          ],
          [
            Sequelize.literal(
              `(SELECT metal_tones.name FROM metal_tones WHERE metal_tones.id = CAST (order_details_json ->> 'metal_tone' AS integer))`
            ),
            "Metal_tone",
          ],
          [
            Sequelize.literal(
              `(SELECT items_sizes.size FROM items_sizes WHERE items_sizes.id = CAST (order_details_json ->> 'size_id' AS integer))`
            ),
            "product_size",
          ],
          [
            Sequelize.literal(
              `(SELECT items_lengths.length FROM items_lengths WHERE items_lengths.id = CAST (order_details_json ->> 'length_id' AS integer))`
            ),
            "product_length",
          ],
        ],
        required: false,
      },
    ];
    if (!noPagination) {
      const totalItems = <any>await Orders.count(<any>{
        where,
        include,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await Orders.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "order_number",
        [Sequelize.literal(`"orders"."user_id"`), "user_id"],
        "email",
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id")'
          ),
          "user_name",
        ],
        "shipping_method",
        "pickup_store_id",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_type",
        "order_date",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
      ],
      include,
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllOrdersListAdmin = async (req: Request) => {
  try {
    const { start_date, end_date, order_status } = req.query;

    const startDateFilter =
      start_date != undefined ? start_date : new Date().getFullYear();

    const endDateFilter: any = end_date != undefined ? end_date : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const total_pendding_order = await Orders.count({
      where: [
        { order_status: OrderStatus.Pendding },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const total_confirm_order = await Orders.count({
      where: [
        { order_status: OrderStatus.Confirmed },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const total_in_process_order = await Orders.count({
      where: [
        { order_status: OrderStatus.Processing },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const total_out_of_delivery_order = await Orders.count({
      where: [
        { order_status: OrderStatus.OutOfDeliver },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const total_delivery_order = await Orders.count({
      where: [
        { order_status: OrderStatus.Delivered },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const total_cancel_order = await Orders.count({
      where: [
        { order_status: OrderStatus.Canceled },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const total_fail_order = await Orders.count({
      where: [
        { order_status: OrderStatus.Failed },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const total_returned_order = await Orders.count({
      where: [
        { order_status: OrderStatus.Returned },
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });
    const all_order = await Orders.count({
      where: [
        {
          [Op.or]: [
            { order_date: { [Op.between]: [startDateFilter, endDate] } },
          ],
        },
      ],
    });

    const count = {
      all_order,
      total_pendding_order,
      total_confirm_order,
      total_in_process_order,
      total_out_of_delivery_order,
      total_delivery_order,
      total_returned_order,
      total_cancel_order,
      total_fail_order,
    };
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      {
        [Op.or]: [{ order_date: { [Op.between]: [startDateFilter, endDate] } }],
      },
      order_status ? { order_status: { [Op.eq]: order_status } } : {},
    ];
    if (!noPagination) {
      const totalItems = await Orders.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { count, pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await Orders.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "order_number",
        "coupon_id",
        [Sequelize.literal(`"orders"."user_id"`), "user_id"],
        "email",
        [
          Sequelize.literal(`order_shipping_address ->> 'full_name'`),
          "full_name",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id")'
          ),
          "user_name",
        ],
        "shipping_method",
        "pickup_store_id",
        "coupon_id",
        "sub_total",
        "discount",
        "total_tax",
        "shipping_cost",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        "order_type",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
        [Sequelize.literal("coupon.coupon_code"), "coupon_code"],
        [Sequelize.literal("coupon.description"), "coupon_description"],
        [Sequelize.literal("coupon.discount_type"), "coupon_discount_type"],
        [Sequelize.literal("coupon.percentage_off"), "coupon_percentage_off"],
        [Sequelize.literal("coupon.discount_amount"), "coupon_discount_amount"],
        [
          Sequelize.literal("coupon.maximum_discount_amount"),
          "coupon_maximum_discount_amount",
        ],
      ],
      include: [
        {
          model: couponData,
          as: "coupon",
          attributes: [],
        },
      ],
    });

    return resSuccess({
      data: noPagination ? { count, result } : { count, pagination, result },
    });
  } catch (error) {
    throw error;
  }
};

export const orderDetailsAPI = async (req: Request) => {
  const { order_number } = req.body;

  if (!order_number) {
    return resUnknownError({
      message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "order number"],
      ]),
    });
  }

  try {
    const orderDetails = await Orders.findOne({
      where: { order_number: order_number },
      attributes: [
        "id",
        "order_number",
        "user_id",
        "email",
        "shipping_method",
        "pickup_store_id",
        "discount",
        "total_tax",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "currency_rate",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        "order_type",
        "order_note",
        "order_taxs",
        "coupon_discount",
        "order_shipping_address",
        "order_billing_address",
      ],
      include: [
        {
          model: couponData,
          as: "coupon",
          attributes: [
            "id",
            "coupon_code",
            "description",
            "discount_type",
            "percentage_off",
            "discount_amount",
            "maximum_discount_amount",
          ],
        },
        {
          model: OrdersDetails,
          as: "order",
          attributes: [
            "quantity",
            "finding_charge",
            "makring_charge",
            "other_charge",
            "diamond_count",
            "diamond_rate",
            "metal_rate",
            "sub_total",
            "product_tax",
            "delivery_status",
            "payment_status",
            "refund_request_id",
            "order_details_json",
            "product_id",
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT image_path FROM product_images WHERE id = CAST (order_details_json ->> 'image_id' AS integer)) WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT image_path from loose_diamond_group_masters where id = "product_id") ELSE (SELECT image_path FROM images where id = CAST (order_details_json ->> 'image_id' AS integer)) END`
              ),
              "product_image",
            ],
            ["sub_total", "product_price"],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "product_title",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters) WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "product_sku",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters) WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "product_slug",
            ],
            [
              Sequelize.literal(
                `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (order_details_json ->> 'metal_id' AS integer))`
              ),
              "metal",
            ],
            [
              Sequelize.literal(
                `(SELECT gold_kts.name FROM gold_kts WHERE gold_kts.id = CAST (order_details_json ->> 'karat_id' AS integer))`
              ),
              "Karat",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'head_metal_tone' AS integer))`
              ),
              "head_metal_tone",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'shank_metal_tone' AS integer))`
              ),
              "shank_metal_tone",
            ],
            [
              Sequelize.literal(
                `CASE WHEN (order_details_json ->> 'band_metal_tone') = 'null' THEN null ELSE (SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'band_metal_tone' AS integer)) END`
              ),
              "band_metal_tone",
            ],
            [
              Sequelize.literal(
                `CAST (order_details_json ->> 'head_metal_tone' AS integer)`
              ),
              "head_metal_tone_id",
            ],
            [
              Sequelize.literal(
                ` CAST (order_details_json ->> 'shank_metal_tone' AS integer)`
              ),
              "shank_metal_tone_id",
            ],
            [
              Sequelize.literal(
                ` CAST (order_details_json ->> 'band_metal_tone' AS integer)`
              ),
              "band_metal_tone_id",
            ],
            [
              Sequelize.literal(
                `(SELECT metal_tones.name FROM metal_tones WHERE metal_tones.id = CAST (order_details_json ->> 'metal_tone' AS integer))`
              ),
              "Metal_tone",
            ],
            [
              Sequelize.literal(
                `(SELECT items_sizes.size FROM items_sizes WHERE items_sizes.id = CAST (order_details_json ->> 'size_id' AS integer))`
              ),
              "product_size",
            ],
            [
              Sequelize.literal(
                `(SELECT items_lengths.length FROM items_lengths WHERE items_lengths.id = CAST (order_details_json ->> 'length_id' AS integer))`
              ),
              "product_length",
            ],
          ],
          required: false,
        },
      ],
    });

    if (orderDetails == null) {
      return resNotFound();
    }

    for (let index = 0; index < orderDetails.dataValues.order.length; index++) {
      const element = orderDetails.dataValues.order[index];
      orderDetails.dataValues.order[index].dataValues.product_price =
        orderDetails.dataValues.order[index].dataValues.sub_total;
      orderDetails.dataValues.order[index].dataValues.sub_total =
        orderDetails.dataValues.order[index].dataValues.sub_total +
        orderDetails.dataValues.order[index].dataValues.product_tax;
      if (
        element.order_details_json.product_type ==
          AllProductTypes.BirthStone_product &&
        element.order_details_json?.gemstone
      ) {
        for (let j = 0; j < element.order_details_json.gemstone.length; j++) {
          const gemstone = element.order_details_json.gemstone[j];
          const stone = await StoneData.findOne({
            where: { id: gemstone.stone },
          });
          element.order_details_json.gemstone[j].stone_value =
            stone?.dataValues.name;
          const cuts = await CutsData.findOne({ where: { id: gemstone.cut } });
          element.order_details_json.gemstone[j].cut_value =
            cuts?.dataValues.value;
          const mm_size = await MMSizeData.findOne({
            where: { id: gemstone.mm_size },
          });
          element.order_details_json.gemstone[j].mm_size_value =
            mm_size?.dataValues.value;
          const shape = await DiamondShape.findOne({
            where: {
              id:
                gemstone.shape &&
                gemstone.shape != "null" &&
                gemstone.shape != "undefined"
                  ? gemstone.shape
                  : null,
            },
          });
          element.order_details_json.gemstone[j].shape_value =
            shape?.dataValues.name;
        }
      }
    }
    return resSuccess({ data: orderDetails });
  } catch (error) {
    throw error;
  }
};

export const orderDetailsAPIAdmin = async (req: Request) => {
  const { order_number } = req.body;

  if (!order_number) {
    return resUnknownError({
      message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "order number"],
      ]),
    });
  }

  try {
    const orderDetails = await Orders.findOne({
      where: { order_number: order_number },
      attributes: [
        "id",
        "order_number",
        "user_id",
        "email",
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_name",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.email FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_email",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.mobile FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_phone_number",
        ],
        "shipping_method",
        "pickup_store_id",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "currency_rate",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        "order_type",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
        [
          Sequelize.literal(
            `(SELECT payment_transaction_id FROM order_transactions WHERE order_id = "orders"."id" AND payment_status = ${PaymentStatus.paid} LIMIT 1)`
          ),
          "payment_transaction_id",
        ],
        [
          Sequelize.literal(
            `(SELECT contries.country_name FROM contries WHERE id= CAST (order_shipping_address ->> 'country_id' AS integer))`
          ),
          "shipping_add_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CAST (order_shipping_address ->> 'state_id' AS integer))`
          ),
          "shipping_add_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CAST (order_shipping_address ->> 'city_id' AS integer))`
          ),
          "shipping_add_city",
        ],
        [
          Sequelize.literal(
            `(SELECT contries.country_name FROM contries WHERE id= CAST (order_billing_address ->> 'country_id' AS integer))`
          ),
          "billing_add_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CAST (order_billing_address ->> 'state_id' AS integer))`
          ),
          "billing_add_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CAST (order_billing_address ->> 'city_id' AS integer))`
          ),
          "billing_add_city",
        ],
      ],
      include: [
        {
          model: couponData,
          as: "coupon",
          attributes: [
            "id",
            "coupon_code",
            "description",
            "discount_type",
            "percentage_off",
            "discount_amount",
            "maximum_discount_amount",
          ],
        },
        {
          model: OrdersDetails,
          as: "order",
          attributes: [
            "quantity",
            "finding_charge",
            "makring_charge",
            "other_charge",
            "diamond_count",
            "diamond_rate",
            "metal_rate",
            "sub_total",
            "product_tax",
            "delivery_status",
            "payment_status",
            "refund_request_id",
            "order_details_json",
            "product_id",
            "variant_id",
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT CONCAT('${IMAGE_PATH}/' ,image_path) FROM product_images WHERE id = CAST (order_details_json ->> 'image_id' AS integer)) WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT CONCAT('${IMAGE_PATH}/' ,image_path) FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT CONCAT('${IMAGE_PATH}/', image_path) FROM loose_diamond_group_masters where id = "product_id") ELSE (SELECT CONCAT('${IMAGE_PATH}/' ,image_path) FROM images where id = CAST (order_details_json ->> 'image_id' AS integer)) END`
              ),
              "product_image",
            ],
            [Sequelize.literal("order_total"), "product_price"],
            [
              Sequelize.literal(
                `(SELECT  AVG(product_reviews.rating) FROM product_reviews WHERE product_reviews.product_id = 87)`
              ),
              "rating",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "product_name",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT sort_description FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT short_des from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_sort_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_sort_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sort_description from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT sort_description from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_sort_des from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "sort_description",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT long_description FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT long_des from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_long_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_long_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT long_description from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT long_description from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_long_des from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "long_description",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "product_sku",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id")WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") ELSE null END`
              ),
              "product_slug",
            ],
            [
              Sequelize.literal(
                `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (order_details_json ->> 'metal_id' AS integer))`
              ),
              "metal",
            ],
            [
              Sequelize.literal(
                `(SELECT gold_kts.name FROM gold_kts WHERE gold_kts.id = CAST (order_details_json ->> 'karat_id' AS integer))`
              ),
              "Karat",
            ],
            [
              Sequelize.literal(
                `(SELECT metal_tones.name FROM metal_tones WHERE metal_tones.id = CAST (order_details_json ->> 'metal_tone' AS integer))`
              ),
              "Metal_tone",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'head_metal_tone' AS integer))`
              ),
              "head_metal_tone",
            ],
            [Sequelize.literal(`order_details_json ->> 'is_band'`), "is_band"],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT heads.name FROM config_products LEFT OUTER JOIN heads ON heads.id = head_type_id WHERE config_products.id = "product_id") ELSE null END`
              ),
              "head",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT shanks.name FROM config_products LEFT OUTER JOIN shanks ON shanks.id = shank_type_id WHERE config_products.id = "product_id") ELSE null END`
              ),
              "shank",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT side_setting_styles.name FROM config_products LEFT OUTER JOIN side_setting_styles ON side_setting_styles.id = side_setting_id WHERE config_products.id = "product_id") ELSE null END`
              ),
              "side_setting",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT carat_sizes.value FROM config_products LEFT OUTER JOIN carat_sizes ON carat_sizes.id = center_dia_cts WHERE config_products.id = "product_id") ELSE null END`
              ),
              "center_diamond_size",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT diamond_shapes.name FROM config_products LEFT OUTER JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape_id WHERE config_products.id = "product_id") ELSE null END`
              ),
              "center_diamond_shape",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT clarities.value FROM config_products LEFT OUTER JOIN clarities ON clarities.id = center_dia_clarity_id WHERE config_products.id = "product_id") ELSE null END`
              ),
              "center_diamond_clarity",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT colors.value FROM config_products LEFT OUTER JOIN colors ON colors.id = center_dia_color WHERE config_products.id = "product_id") ELSE null END`
              ),
              "center_diamond_color",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'shank_metal_tone' AS integer))`
              ),
              "shank_metal_tone",
            ],
            [
              Sequelize.literal(
                `CASE WHEN (order_details_json ->> 'band_metal_tone') = 'null' THEN null ELSE (SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'band_metal_tone' AS integer)) END`
              ),
              "band_metal_tone",
            ],
            [
              Sequelize.literal(
                `(SELECT items_sizes.size FROM items_sizes WHERE items_sizes.id = CAST (order_details_json ->> 'size_id' AS integer))`
              ),
              "product_size",
            ],
            [
              Sequelize.literal(
                `(SELECT items_lengths.length FROM items_lengths WHERE items_lengths.id = CAST (order_details_json ->> 'length_id' AS integer))`
              ),
              "product_length",
            ],
          ],
          required: false,
        },
      ],
    });

    if (orderDetails == null) {
      return resNotFound();
    }
    for (let index = 0; index < orderDetails.dataValues.order.length; index++) {
      const element = orderDetails.dataValues.order[index];
      orderDetails.dataValues.order[index].dataValues.product_price =
        orderDetails.dataValues.order[index].dataValues.sub_total;
      orderDetails.dataValues.order[index].dataValues.sub_total =
        orderDetails.dataValues.order[index].dataValues.sub_total +
        orderDetails.dataValues.order[index].dataValues.product_tax;
      if (
        element.order_details_json.product_type ==
          AllProductTypes.BirthStone_product &&
        element.order_details_json?.gemstone
      ) {
        for (let j = 0; j < element.order_details_json.gemstone.length; j++) {
          const gemstone = element.order_details_json.gemstone[j];
          const stone = await StoneData.findOne({
            where: { id: gemstone.stone },
          });
          element.order_details_json.gemstone[j].stone = stone?.dataValues.name;
          const cuts = await CutsData.findOne({ where: { id: gemstone.cut } });
          element.order_details_json.gemstone[j].cut = cuts?.dataValues.value;
          const mm_size = await MMSizeData.findOne({
            where: { id: gemstone.mm_size },
          });
          element.order_details_json.gemstone[j].mm_size =
            mm_size?.dataValues.value;
          const shape = await DiamondShape.findOne({
            where: {
              id:
                gemstone.shape &&
                gemstone.shape != "null" &&
                gemstone.shape != "undefined"
                  ? gemstone.shape
                  : null,
            },
          });
          element.order_details_json.gemstone[j].shape = shape?.dataValues.name;
        }
      }
    }

    return resSuccess({ data: orderDetails });
  } catch (error) {
    throw error;
  }
};

export const orderStatusUpdate = async (req: Request) => {
  try {
    const orderData = await Orders.findOne({ where: { id: req.body.id } });

    if (!(orderData && orderData.dataValues)) {
      return resNotFound({ message: ORDER_NOT_FOUND });
    }

    const orderStatus = await Orders.update(
      {
        order_status: req.body.order_status,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: orderData.dataValues.id } }
    );
    if (orderStatus) {
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }
  } catch (error) {
    throw error;
  }
};

export const deliveryStatusUpdate = async (req: Request) => {
  try {
    const orderData = await OrdersDetails.findOne({
      where: { order_id: req.body.order_id },
    });

    if (!(orderData && orderData.dataValues)) {
      return resNotFound({ message: ORDER_NOT_FOUND });
    }

    const orderStatus = await OrdersDetails.update(
      {
        delivery_status: req.body.delivery_status,
      },
      { where: { order_id: orderData.dataValues.order_id } }
    );
    if (orderStatus) {
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }
  } catch (error) {
    throw error;
  }
};

export const orderTransactionList = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === "1";
    const where = [
      pagination.search_text
        ? {
            [Op.or]: [
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) from orders WHERE id = order_id AND email ILIKE  '%${pagination.search_text}%')`
                ),
                ">",
                "0"
              ),
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) from orders WHERE id = order_id AND order_shipping_address ->> 'full_name' ILIKE  '%${pagination.search_text}%')`
                ),
                ">",
                "0"
              ),
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM orders WHERE id = order_id ANd order_number ILIKE '%${pagination.search_text}%')`
                ),
                ">",
                0
              ),
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await OrderTransaction.count({ where });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await OrderTransaction.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "order_id",
        [
          Sequelize.literal(
            '(SELECT orders.order_number FROM orders WHERE id = "order_id")'
          ),
          "order_number",
        ],
        "payment_transaction_id",
        "payment_status",
        "order_amount",
        [
          Sequelize.literal('(SELECT email from orders WHERE id = "order_id")'),
          "gust_email",
        ],
        [
          Sequelize.literal(
            `(SELECT order_shipping_address ->> 'full_name' from orders WHERE id = "order_id")`
          ),
          "gust_name",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name from customer_users LEFT OUTER JOIN orders ON orders.user_id = customer_users.id_app_user WHERE orders.id = "order_id")'
          ),
          "user_name",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.email from customer_users LEFT OUTER JOIN orders ON orders.user_id = customer_users.id_app_user WHERE orders.id = "order_id")'
          ),
          "user_email",
        ],
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const addGiftSetProductOrder = async (req: Request) => {
  try {
    const {
      user_id,
      email,
      coupon_id,
      sub_total,
      order_note,
      is_add_address,
      payment_method,
      order_total,
      currency_id,
      order_shipping_address,
      order_type,
      shipping_method,
      pickup_store_id,
      order_billing_address,
      product_details,
      shipping_cost,
      discount,
      total_tax,
    } = req.body;

    if (user_id) {
      const users = await AppUser.findOne({
        where: { id: user_id, is_deleted: "0" },
      });
      if (!(users && users.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }

    const taxValues = await TaxMaster.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: "0" },
    });

    let productTaxAmount: any;
    let productTax: any;
    let allTax = [];
    let taxRateData = [];
    for (const taxData of taxValues) {
      productTax = taxData.dataValues.rate / 100;
      productTaxAmount = sub_total * productTax;
      console.log(productTaxAmount);

      taxRateData.push({
        rate: taxData.dataValues.rate,
        tax_amount: parseFloat(productTaxAmount.toFixed(2)),
        name: taxData.dataValues.name,
      });
      allTax.push(parseFloat(productTaxAmount.toFixed(2)));
    }

    const sumTotal = allTax.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    console.log("sumTotal", sumTotal);

    const totalOrderAmount =
      parseFloat(sub_total) + parseFloat(sumTotal.toFixed(2));

    console.log("totalOrderAmount", totalOrderAmount);

    if (totalOrderAmount.toFixed(2) != order_total) {
      return resBadRequest({ message: TOTAL_AMOUNT_WRONG });
    }

    const trn = await dbContext.transaction();
    const order_number = crypto.randomInt(1000000000, 9999999999);

    try {
      const billingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_billing_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let billingCityCreateId: any;
      if (
        billingAddresscityNameExistes &&
        billingAddresscityNameExistes.dataValues
      ) {
        billingCityCreateId = billingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_billing_address.city_id,
            city_code: order_billing_address.city_id,
            id_state: order_billing_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        billingCityCreateId = created.dataValues.id;
      }

      const shippingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_shipping_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let shippingCityCreateId: any;
      if (
        shippingAddresscityNameExistes &&
        shippingAddresscityNameExistes.dataValues
      ) {
        shippingCityCreateId = shippingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_shipping_address.city_id,
            city_code: order_shipping_address.city_id,
            id_state: order_shipping_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        shippingCityCreateId = created.dataValues.id;
      }

      if (parseInt(is_add_address) == 1) {
        if (order_billing_address.id && order_shipping_address.id) {
          if (
            order_billing_address.id &&
            parseInt(order_billing_address.id) == 0
          ) {
            const payload = {
              user_id: user_id,
              full_name: order_billing_address.full_name,
              house_building: order_billing_address.house_builing,
              area_name: order_billing_address.area_name,
              pincode: order_billing_address.pincode,
              phone: order_billing_address.phone_number,
              city_id: billingCityCreateId,
              state_id: order_billing_address.state_id,
              country_id: order_billing_address.country_id,
              address_type: 2,
              default_addres: 0,
              is_deleted: 0,
              created_date: getLocalDate(),
            };

            await UserAddress.create(payload, { transaction: trn });
          } else {
            const addressId = await UserAddress.findOne({
              where: { id: order_billing_address.id, is_deleted: "0" },
            });
            if (!(addressId && addressId.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: ADDRESS_NOT_EXITS });
            }
            const addressInfo = await UserAddress.update(
              {
                house_building: order_billing_address.house_builing,
                full_name: order_billing_address.full_name,
                area_name: order_billing_address.area_name,
                pincode: order_billing_address.pincode,
                phone: order_billing_address.phone_number,
                city_id: billingCityCreateId,
                state_id: order_billing_address.state_id,
                country_id: order_billing_address.country_id,
                address_type: 2,
                default_addres: 0,
                modified_date: getLocalDate(),
              },

              {
                where: { id: addressId.dataValues.id, is_deleted: "0" },
                transaction: trn,
              }
            );
          }
          if (order_shipping_address.country_id != null) {
            if (
              order_shipping_address.id &&
              parseInt(order_shipping_address.id) == 0
            ) {
              const payload = {
                user_id: user_id,
                full_name: order_shipping_address.full_name,
                house_building: order_shipping_address.house_builing,
                area_name: order_shipping_address.area_name,
                pincode: order_shipping_address.pincode,
                phone: order_shipping_address.phone_number,
                city_id: shippingCityCreateId,
                state_id: order_shipping_address.state_id,
                country_id: order_shipping_address.country_id,
                address_type: 1,
                default_addres: 0,
                is_deleted: 0,
                created_date: getLocalDate(),
              };

              await UserAddress.create(payload, { transaction: trn });
            } else {
              const addressId = await UserAddress.findOne({
                where: { id: order_shipping_address.id, is_deleted: "0" },
              });
              if (!(addressId && addressId.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: ADDRESS_NOT_EXITS });
              }
              const addressInfo = await UserAddress.update(
                {
                  house_building: order_shipping_address.house_builing,
                  full_name: order_shipping_address.full_name,
                  area_name: order_shipping_address.area_name,
                  pincode: order_shipping_address.pincode,
                  phone: order_shipping_address.phone_number,
                  city_id: shippingCityCreateId,
                  state_id: order_shipping_address.state_id,
                  country_id: order_shipping_address.country_id,
                  address_type: 1,
                  default_addres: 0,
                  modified_date: getLocalDate(),
                },
                {
                  where: { id: addressId.dataValues.id, is_deleted: "0" },
                  transaction: trn,
                }
              );
            }
          }
        }
      }

      const ordersPayload = {
        order_number: `${ORDER_NUMBER_IDENTITY}-${order_number}`,
        user_id: user_id,
        email: email,
        shipping_method: shipping_method,
        pickup_store_id: pickup_store_id,
        coupon_id,
        sub_total: parseFloat(sub_total),
        shipping_cost: parseFloat(shipping_cost),
        discount: parseFloat(discount),
        total_tax: sumTotal,
        order_total: totalOrderAmount,
        payment_method: payment_method,
        currency_id: currency_id,
        order_status: OrderStatus.Pendding,
        payment_status: PaymentStatus.InPaid,
        order_date: getLocalDate(),
        order_type: order_type,
        order_note: order_note,
        order_shipping_address: {
          ...order_shipping_address,
          city_id: shippingCityCreateId,
        },
        order_billing_address: {
          ...order_billing_address,
          city_id: billingCityCreateId,
        },
        order_taxs: JSON.stringify(taxRateData),
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
      };

      const orders = await giftSetProductOrder.create(ordersPayload, {
        transaction: trn,
      });

      for (let product of product_details) {
        if (!product.product_id) {
          await trn.rollback();
          return resBadRequest({ message: INVALID_ID });
        }
        const products = await GiftSetProduct.findOne({
          where: { id: product.product_id, is_deleted: "0" },
          transaction: trn,
        });
        if (!(products && products.dataValues)) {
          await trn.rollback();
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }

        const ordersDetails = await GiftSetOrdersDetails.create(
          {
            order_id: orders.dataValues.id,
            product_id: product.product_id,
            quantity: product.quantity,
            sub_total: parseInt(product.sub_total),
            product_tax: parseFloat(product.product_tax),
            discount_amount: parseFloat(product.discount_amount),
            shipping_cost: parseFloat(product.shipping_cost),
            shipping_method_id: shipping_method,
            delivery_status: DeliverStatus.Pendding,
            payment_status: PaymentStatus.InPaid,
          },
          { transaction: trn }
        );
      }

      await trn.commit();
      return resSuccess({ data: orders });
    } catch (error) {
      await trn.rollback();
      return resUnknownError({ data: error });
    }
  } catch (error) {
    throw error;
  }
};

export const getAllGiftSetProductOrdersUser = async (req: Request) => {
  try {
    const { user_id, start_date, end_date, order_status } = req.query;

    const startDateFilter =
      start_date != undefined ? start_date : new Date().getFullYear();

    const endDateFilter: any = end_date != undefined ? end_date : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    if (!user_id) return resBadRequest({ message: INVALID_ID });
    const users = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    if (!(users && users.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { user_id: user_id },
      {
        [Op.or]: [{ order_date: { [Op.between]: [startDateFilter, endDate] } }],
      },
      order_status && order_status != OrderStatus.All.toString()
        ? { order_status: { [Op.eq]: order_status } }
        : {},
    ];
    if (!noPagination) {
      const totalItems = await giftSetProductOrder.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await giftSetProductOrder.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "order_number",
        "user_id",
        "email",
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_name",
        ],
        "shipping_method",
        "pickup_store_id",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_type",
        "order_date",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const giftSetOrderDetailsAPI = async (req: Request) => {
  const { order_number } = req.body;

  if (!order_number) {
    return resUnknownError({
      message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "order number"],
      ]),
    });
  }

  try {
    const orderDetails = await giftSetProductOrder.findOne({
      where: { order_number: order_number },
      attributes: [
        "id",
        "order_number",
        "user_id",
        "email",
        "shipping_method",
        "pickup_store_id",
        "discount",
        "total_tax",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "currency_rate",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        "order_type",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
      ],
      include: [
        {
          model: GiftSetOrdersDetails,
          as: "gift_order",
          attributes: [
            "quantity",
            "sub_total",
            "product_tax",
            "delivery_status",
            "payment_status",
            "refund_request_id",
            "product_id",
          ],
          required: false,
        },
      ],
    });

    if (orderDetails == null) {
      return resNotFound();
    }
    return resSuccess({ data: orderDetails });
  } catch (error) {
    throw error;
  }
};

export const getAllGiftSetOrdersListAdmin = async (req: Request) => {
  try {
    const { start_date, end_date, order_status } = req.query;

    const startDateFilter =
      start_date != undefined ? start_date : new Date().getFullYear();

    const endDateFilter: any = end_date != undefined ? end_date : new Date();

    const total_pendding_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.Pendding },
    });

    const total_confirm_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.Confirmed },
    });

    const total_in_process_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.Processing },
    });

    const total_out_of_delivery_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.OutOfDeliver },
    });

    const total_delivery_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.Delivered },
    });

    const total_cancel_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.Canceled },
    });

    const total_fail_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.Failed },
    });

    const total_returned_order = await giftSetProductOrder.count({
      where: { order_status: OrderStatus.Returned },
    });
    const all_order = await giftSetProductOrder.count();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const count = {
      all_order,
      total_pendding_order,
      total_confirm_order,
      total_in_process_order,
      total_out_of_delivery_order,
      total_delivery_order,
      total_returned_order,
      total_cancel_order,
      total_fail_order,
    };
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      {
        [Op.or]: [{ order_date: { [Op.between]: [startDateFilter, endDate] } }],
      },
      order_status ? { order_status: { [Op.eq]: order_status } } : {},
    ];
    if (!noPagination) {
      const totalItems = await giftSetProductOrder.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await giftSetProductOrder.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "order_number",
        "user_id",
        "email",
        [
          Sequelize.literal(`order_shipping_address ->> 'full_name'`),
          "full_name",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_name",
        ],
        "shipping_method",
        "pickup_store_id",
        "coupon_id",
        "sub_total",
        "discount",
        "total_tax",
        "shipping_cost",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        "order_type",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
      ],
    });

    return resSuccess({
      data: noPagination ? { count, result } : { count, pagination, result },
    });
  } catch (error) {
    throw error;
  }
};

export const giftSetOrderDetailsAPIAdmin = async (req: Request) => {
  const { order_number } = req.body;

  if (!order_number) {
    return resUnknownError({
      message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "order number"],
      ]),
    });
  }

  try {
    const orderDetails = await giftSetProductOrder.findOne({
      where: { order_number: order_number },
      attributes: [
        "id",
        "order_number",
        "user_id",
        "email",
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_name",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.email FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_email",
        ],
        [
          Sequelize.literal(
            '(SELECT customer_users.mobile FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_phone_number",
        ],

        "shipping_method",
        "pickup_store_id",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "currency_rate",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        "order_type",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
        [
          Sequelize.literal(
            `(SELECT contries.country_name FROM contries WHERE id= CAST (order_shipping_address ->> 'country_id' AS integer))`
          ),
          "shipping_add_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CAST (order_shipping_address ->> 'state_id' AS integer))`
          ),
          "shipping_add_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CAST (order_shipping_address ->> 'city_id' AS integer))`
          ),
          "shipping_add_city",
        ],
        [
          Sequelize.literal(
            `(SELECT contries.country_name FROM contries WHERE id= CAST (order_billing_address ->> 'country_id' AS integer))`
          ),
          "billing_add_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CAST (order_billing_address ->> 'state_id' AS integer))`
          ),
          "billing_add_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CAST (order_billing_address ->> 'city_id' AS integer))`
          ),
          "billing_add_city",
        ],
      ],
      include: [
        {
          model: GiftSetOrdersDetails,
          as: "gift_order",
          attributes: [
            "quantity",
            "sub_total",
            "product_tax",
            "delivery_status",
            "payment_status",
            "refund_request_id",
            "product_id",
            [
              Sequelize.literal(
                `(SELECT gift_set_products.product_title FROM gift_set_products WHERE id = "product_id")`
              ),
              "product_name",
            ],
            [
              Sequelize.literal(
                `(SELECT gift_set_products.sku FROM gift_set_products WHERE id = "product_id")`
              ),
              "product_sku",
            ],
          ],
          required: false,
          include: [
            {
              required: false,
              model: GiftSetProduct,
              as: "product",
              include: [
                {
                  required: false,
                  model: GiftSetProductImages,
                  as: "gift_product_images",
                  attributes: ["id", "image_path", "image_type"],
                  where: [{ is_deleted: "0" }],
                },
              ],
            },
          ],
        },
      ],
    });

    if (orderDetails == null) {
      return resNotFound();
    }

    return resSuccess({ data: orderDetails });
  } catch (error) {
    throw error;
  }
};

export const giftSetOrderStatusUpdate = async (req: Request) => {
  try {
    const orderData = await giftSetProductOrder.findOne({
      where: { id: req.body.id },
    });

    if (!(orderData && orderData.dataValues)) {
      return resNotFound({ message: ORDER_NOT_FOUND });
    }

    const orderStatus = await giftSetProductOrder.update(
      {
        order_status: req.body.order_status,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: orderData.dataValues.id } }
    );
    if (orderStatus) {
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }
  } catch (error) {
    throw error;
  }
};

export const giftSetDeliveryStatusUpdate = async (req: Request) => {
  try {
    const orderData = await GiftSetOrdersDetails.findOne({
      where: { order_id: req.body.order_id },
    });

    if (!(orderData && orderData.dataValues)) {
      return resNotFound({ message: ORDER_NOT_FOUND });
    }

    const orderStatus = await GiftSetOrdersDetails.update(
      {
        delivery_status: req.body.delivery_status,
      },
      { where: { order_id: orderData.dataValues.order_id } }
    );
    if (orderStatus) {
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    }
  } catch (error) {
    throw error;
  }
};

export const addConfigProductOrder = async (req: Request) => {
  try {
    const {
      user_id,
      coupon_id,
      sub_total,
      order_note,
      is_add_address,
      payment_method,
      order_total,
      currency_id,
      order_shipping_address,
      order_type,
      shipping_method,
      pickup_store_id,
      order_billing_address,
      product_details,
      shipping_cost,
      discount,
      total_tax,
    } = req.body;

    if (user_id) {
      const users = await AppUser.findOne({
        where: { id: user_id, is_deleted: "0" },
      });
      if (!(users && users.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }

    const taxValues = await TaxMaster.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: "0" },
    });

    let productTaxAmount: any;
    let productTax: any;
    let allTax = [];
    let taxRateData = [];
    for (const taxData of taxValues) {
      productTax = taxData.dataValues.rate / 100;
      productTaxAmount = sub_total * productTax;
      console.log("taxData", productTaxAmount);

      taxRateData.push({
        rate: taxData.dataValues.rate,
        tax_amount: parseFloat(productTaxAmount),
        name: taxData.dataValues.name,
      });
      allTax.push(parseFloat(productTaxAmount));
    }

    const sumTotal: any = allTax.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    const totalOrderAmount = parseFloat(sub_total) + parseFloat(sumTotal);

    console.log("totalOrderAmount", totalOrderAmount);

    if (totalOrderAmount.toFixed(2) != parseFloat(order_total).toFixed(2)) {
      return resBadRequest({ message: TOTAL_AMOUNT_WRONG });
    }

    const trn = await dbContext.transaction();
    const order_number = crypto.randomInt(1000000000, 9999999999);

    try {
      const billingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_billing_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let billingCityCreateId: any;
      if (
        billingAddresscityNameExistes &&
        billingAddresscityNameExistes.dataValues
      ) {
        billingCityCreateId = billingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_billing_address.city_id,
            city_code: order_billing_address.city_id,
            id_state: order_billing_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        billingCityCreateId = created.dataValues.id;
      }

      const shippingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_shipping_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let shippingCityCreateId: any;
      if (
        shippingAddresscityNameExistes &&
        shippingAddresscityNameExistes.dataValues
      ) {
        shippingCityCreateId = shippingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_shipping_address.city_id,
            city_code: order_shipping_address.city_id,
            id_state: order_shipping_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        shippingCityCreateId = created.dataValues.id;
      }

      if (parseInt(is_add_address) == 1) {
        if (order_billing_address.id && order_shipping_address.id) {
          if (
            order_billing_address.id &&
            parseInt(order_billing_address.id) == 0
          ) {
            const payload = {
              user_id: user_id,
              full_name: order_billing_address.full_name,
              house_building: order_billing_address.house_builing,
              area_name: order_billing_address.area_name,
              pincode: order_billing_address.pincode,
              phone: order_billing_address.phone_number,
              city_id: billingCityCreateId,
              state_id: order_billing_address.state_id,
              country_id: order_billing_address.country_id,
              address_type: 2,
              default_addres: 0,
              is_deleted: 0,
              created_date: getLocalDate(),
            };

            await UserAddress.create(payload, { transaction: trn });
          } else {
            const addressId = await UserAddress.findOne({
              where: { id: order_billing_address.id, is_deleted: "0" },
            });
            if (!(addressId && addressId.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: ADDRESS_NOT_EXITS });
            }
            const addressInfo = await UserAddress.update(
              {
                house_building: order_billing_address.house_builing,
                full_name: order_billing_address.full_name,
                area_name: order_billing_address.area_name,
                pincode: order_billing_address.pincode,
                phone: order_billing_address.phone_number,
                city_id: billingCityCreateId,
                state_id: order_billing_address.state_id,
                country_id: order_billing_address.country_id,
                address_type: 2,
                default_addres: 0,
                modified_date: getLocalDate(),
              },

              {
                where: { id: addressId.dataValues.id, is_deleted: "0" },
                transaction: trn,
              }
            );
          }
          if (order_shipping_address.country_id != null) {
            if (
              order_shipping_address.id &&
              parseInt(order_shipping_address.id) == 0
            ) {
              const payload = {
                user_id: user_id,
                full_name: order_shipping_address.full_name,
                house_building: order_shipping_address.house_builing,
                area_name: order_shipping_address.area_name,
                pincode: order_shipping_address.pincode,
                phone: order_shipping_address.phone_number,
                city_id: shippingCityCreateId,
                state_id: order_shipping_address.state_id,
                country_id: order_shipping_address.country_id,
                address_type: 1,
                default_addres: 0,
                is_deleted: 0,
                created_date: getLocalDate(),
              };

              await UserAddress.create(payload, { transaction: trn });
            } else {
              const addressId = await UserAddress.findOne({
                where: { id: order_shipping_address.id, is_deleted: "0" },
              });
              if (!(addressId && addressId.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: ADDRESS_NOT_EXITS });
              }
              const addressInfo = await UserAddress.update(
                {
                  house_building: order_shipping_address.house_builing,
                  full_name: order_shipping_address.full_name,
                  area_name: order_shipping_address.area_name,
                  pincode: order_shipping_address.pincode,
                  phone: order_shipping_address.phone_number,
                  city_id: shippingCityCreateId,
                  state_id: order_shipping_address.state_id,
                  country_id: order_shipping_address.country_id,
                  address_type: 1,
                  default_addres: 0,
                  modified_date: getLocalDate(),
                },
                {
                  where: { id: addressId.dataValues.id, is_deleted: "0" },
                  transaction: trn,
                }
              );
            }
          }
        }
      }

      const ordersPayload = {
        order_number: `${ORDER_NUMBER_IDENTITY}-${order_number}`,
        user_id: user_id,
        shipping_method: shipping_method,
        pickup_store_id: pickup_store_id,
        coupon_id,
        sub_total: parseFloat(sub_total),
        shipping_cost: parseFloat(shipping_cost),
        discount: parseFloat(discount),
        total_tax: sumTotal,
        order_total: totalOrderAmount,
        payment_method: payment_method,
        currency_id: currency_id,
        order_status: OrderStatus.Pendding,
        payment_status: PaymentStatus.InPaid,
        order_date: getLocalDate(),
        order_type: order_type,
        order_note: order_note,
        order_shipping_address: {
          ...order_shipping_address,
          city_id: shippingCityCreateId,
        },
        order_billing_address: {
          ...order_billing_address,
          city_id: billingCityCreateId,
        },
        order_taxs: JSON.stringify(taxRateData),
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
      };

      const orders = await Orders.create(ordersPayload, { transaction: trn });

      for (let product of product_details) {
        if (!product.product_id) {
          await trn.rollback();
          return resBadRequest({ message: INVALID_ID });
        }

        if (product.is_config == 0) {
          const products = await Product.findOne({
            where: { id: product.product_id, is_deleted: "0" },
            transaction: trn,
          });
          if (!(products && products.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: PRODUCT_NOT_FOUND });
          }

          let diamondRate = await dbContext.query(
            `SELECT sum(diamond_group_masters.rate*product_diamond_options.weight*product_diamond_options.count) FROM product_diamond_options LEFT OUTER JOIN diamond_group_masters ON diamond_group_masters.id = product_diamond_options.id_diamond_group WHERE product_diamond_options.id_product = ${product.product_id}`,
            { type: QueryTypes.SELECT }
          );
          const metalRates = await dbContext.query(
            `SELECT CASE WHEN PMO.id_karat IS NULL THEN (metal.metal_rate*PMO.metal_weight) ELSE (metal.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal ON PMO.id_metal = metal.id LEFT OUTER JOIN gold_kts ON PMO.id_karat = gold_kts.id WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} ELSE products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} AND PMO.id_karat = ${product.order_details_json.karat_id} END`,
            { type: QueryTypes.SELECT }
          );
          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              finding_charge: parseFloat(products.dataValues.finding_charge),
              makring_charge: parseFloat(products.dataValues.making_charge),
              other_charge: parseFloat(products.dataValues.other_charge),
              diamond_rate: diamondRate.map((t: any) => t.sum)[0],
              metal_rate: metalRates.map((t: any) => t.case)[0],
              sub_total: parseInt(product.sub_total),
              product_tax: parseFloat(product.product_tax),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
            },
            { transaction: trn }
          );
        } else {
          if (product.is_config == 1) {
            const products = await ConfigProduct.findOne({
              where: { id: product.product_id, is_deleted: "0" },
              transaction: trn,
            });
            if (!(products && products.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_NOT_FOUND });
            }
            let diamondRate: any = await dbContext.query(
              `SELECT sum(PDGM.rate*CPDO.dia_count) FROM config_product_diamonds AS CPDO  LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CPDO.config_product_id = ${product.product_id} AND CASE WHEN ${product.order_details_json.is_band} = 1 THEN  CPDO.product_type <> '' ELSE CPDO.product_type <> 'band' END`,
              { type: QueryTypes.SELECT }
            );
            const metalRates: any = await dbContext.query(
              `SELECT CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CPMO.config_product_id =  ${product.product_id} AND CASE WHEN 0 = 1 THEN  CPMO.head_shank_band <> '' ELSE CPMO.head_shank_band <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id `,
              { type: QueryTypes.SELECT }
            );
            let diamondCount: any = await dbContext.query(
              `SELECT sum(CPDO.dia_count) FROM config_product_diamonds AS CPDO  LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CPDO.config_product_id = ${product.product_id} AND CASE WHEN ${product.order_details_json.is_band} = 1 THEN  CPDO.product_type <> '' ELSE CPDO.product_type <> 'band' END`,
              { type: QueryTypes.SELECT }
            );
            const ordersDetails = await ConfigOrdersDetails.create(
              {
                order_id: orders.dataValues.id,
                product_id: product.product_id,
                quantity: product.quantity,
                labor_charge: parseFloat(products.dataValues.laber_charge),
                diamond_count: diamondCount[0].sum,
                diamond_rate: diamondRate[0].sum,
                metal_rate: metalRates[0].metal_rate,
                sub_total: parseInt(product.sub_total),
                product_tax: parseFloat(product.product_tax),
                discount_amount: parseFloat(product.discount_amount),
                shipping_cost: parseFloat(product.shipping_cost),
                shipping_method_id: shipping_method,
                delivery_status: DeliverStatus.Pendding,
                payment_status: PaymentStatus.InPaid,
                order_details_json: product.order_details_json,
              },
              { transaction: trn }
            );
          }
        }
      }

      await trn.commit();
      return resSuccess({ data: orders });
    } catch (error) {
      await trn.rollback();
      return resUnknownError({ data: error });
    }
  } catch (error) {
    throw error;
  }
};

export const getAllConfigOrdersUser = async (req: Request) => {
  try {
    const { user_id, start_date, end_date, order_status } = req.query;

    const startDateFilter =
      start_date != undefined ? start_date : new Date().getFullYear();

    const endDateFilter = end_date != undefined ? end_date : new Date();

    if (!user_id) return resBadRequest({ message: INVALID_ID });
    const users = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    if (!(users && users.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { user_id: user_id },
      {
        [Op.or]: [
          { order_date: { [Op.between]: [startDateFilter, endDateFilter] } },
        ],
      },
      order_status && order_status != OrderStatus.All.toString()
        ? { order_status: { [Op.eq]: order_status } }
        : {},
    ];
    if (!noPagination) {
      const totalItems = await Orders.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await Orders.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "order_number",
        "user_id",
        [
          Sequelize.literal(
            '(SELECT customer_users.full_name FROM customer_users WHERE customer_users.id_app_user = "user_id")'
          ),
          "user_name",
        ],
        "shipping_method",
        "pickup_store_id",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_type",
        "order_date",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const configOrderDetailsAPI = async (req: Request) => {
  const { order_number } = req.body;

  if (!order_number) {
    return resUnknownError({
      message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        ["field_name", "order number"],
      ]),
    });
  }
  try {
    const orderDetails = await Orders.findOne({
      where: { order_number: order_number },
      attributes: [
        "id",
        "order_number",
        "user_id",
        "shipping_method",
        "pickup_store_id",
        "discount",
        "total_tax",
        "coupon_id",
        "sub_total",
        "shipping_cost",
        "discount",
        "total_tax",
        "currency_rate",
        "order_total",
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        "order_type",
        "order_note",
        "order_taxs",
        "order_shipping_address",
        "order_billing_address",
      ],
    });

    if (orderDetails == null) {
      return resNotFound();
    }
    return resSuccess({ data: orderDetails });
  } catch (error) {
    throw error;
  }
};

export const addProductWithPaypalOrder = async (req: Request) => {
  try {
    const {
      user_id,
      email,
      coupon_id,
      sub_total,
      order_note,
      is_add_address,
      payment_method,
      order_total,
      currency_id,
      order_shipping_address,
      order_type,
      shipping_method,
      pickup_store_id,
      order_billing_address,
      product_details,
      shipping_cost,
      discount,
      total_tax,
    } = req.body;

    if (user_id) {
      const users = await AppUser.findOne({
        where: { id: user_id, is_deleted: "0" },
      });
      if (!(users && users.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }

    const taxValues = await TaxMaster.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: "0" },
    });

    let productTaxAmount: any;
    let productTax: any;
    let allTax = [];
    let taxRateData = [];
    for (const taxData of taxValues) {
      productTax = taxData.dataValues.rate / 100;
      productTaxAmount = sub_total * productTax;
      console.log(productTaxAmount);

      taxRateData.push({
        rate: taxData.dataValues.rate,
        tax_amount: parseFloat(productTaxAmount.toFixed(2)),
        name: taxData.dataValues.name,
      });
      allTax.push(parseFloat(productTaxAmount.toFixed(2)));
    }

    const sumTotal = allTax.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    const totalOrderAmount =
      parseFloat(sub_total) + parseFloat(sumTotal.toFixed(2));

    console.log("totalOrderAmount", totalOrderAmount);

    if (totalOrderAmount.toFixed(2) != order_total) {
      return resBadRequest({ message: TOTAL_AMOUNT_WRONG });
    }

    const trn = await dbContext.transaction();
    const order_number = crypto.randomInt(1000000000, 9999999999);

    try {
      const billingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_billing_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let billingCityCreateId: any;
      if (
        billingAddresscityNameExistes &&
        billingAddresscityNameExistes.dataValues
      ) {
        billingCityCreateId = billingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_billing_address.city_id,
            city_code: order_billing_address.city_id,
            id_state: order_billing_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        billingCityCreateId = created.dataValues.id;
      }

      const shippingAddresscityNameExistes = await CityData.findOne({
        where: [
          columnValueLowerCase("city_name", order_shipping_address.city_id),
          { is_deleted: "0" },
        ],
      });

      let shippingCityCreateId: any;
      if (
        shippingAddresscityNameExistes &&
        shippingAddresscityNameExistes.dataValues
      ) {
        shippingCityCreateId = shippingAddresscityNameExistes.dataValues.id;
      } else {
        const created = await CityData.create(
          {
            city_name: order_shipping_address.city_id,
            city_code: order_shipping_address.city_id,
            id_state: order_shipping_address.state_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        shippingCityCreateId = created.dataValues.id;
      }

      if (parseInt(is_add_address) == 1) {
        if (order_billing_address.id && order_shipping_address.id) {
          if (
            order_billing_address.id &&
            parseInt(order_billing_address.id) == 0
          ) {
            const payload = {
              user_id: user_id,
              full_name: order_billing_address.full_name,
              house_building: order_billing_address.house_builing,
              area_name: order_billing_address.area_name,
              pincode: order_billing_address.pincode,
              phone: order_billing_address.phone_number,
              city_id: billingCityCreateId,
              state_id: order_billing_address.state_id,
              country_id: order_billing_address.country_id,
              address_type: 2,
              default_addres: 0,
              is_deleted: 0,
              created_date: getLocalDate(),
            };

            await UserAddress.create(payload, { transaction: trn });
          } else {
            const addressId = await UserAddress.findOne({
              where: { id: order_billing_address.id, is_deleted: "0" },
            });
            if (!(addressId && addressId.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: ADDRESS_NOT_EXITS });
            }
            const addressInfo = await UserAddress.update(
              {
                house_building: order_billing_address.house_builing,
                full_name: order_billing_address.full_name,
                area_name: order_billing_address.area_name,
                pincode: order_billing_address.pincode,
                phone: order_billing_address.phone_number,
                city_id: billingCityCreateId,
                state_id: order_billing_address.state_id,
                country_id: order_billing_address.country_id,
                address_type: 2,
                default_addres: 0,
                modified_date: getLocalDate(),
              },

              {
                where: { id: addressId.dataValues.id, is_deleted: "0" },
                transaction: trn,
              }
            );
          }
          if (order_shipping_address.country_id != null) {
            if (
              order_shipping_address.id &&
              parseInt(order_shipping_address.id) == 0
            ) {
              const payload = {
                user_id: user_id,
                full_name: order_shipping_address.full_name,
                house_building: order_shipping_address.house_builing,
                area_name: order_shipping_address.area_name,
                pincode: order_shipping_address.pincode,
                phone: order_shipping_address.phone_number,
                city_id: shippingCityCreateId,
                state_id: order_shipping_address.state_id,
                country_id: order_shipping_address.country_id,
                address_type: 1,
                default_addres: 0,
                is_deleted: 0,
                created_date: getLocalDate(),
              };

              await UserAddress.create(payload, { transaction: trn });
            } else {
              const addressId = await UserAddress.findOne({
                where: { id: order_shipping_address.id, is_deleted: "0" },
              });
              if (!(addressId && addressId.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: ADDRESS_NOT_EXITS });
              }
              const addressInfo = await UserAddress.update(
                {
                  house_building: order_shipping_address.house_builing,
                  full_name: order_shipping_address.full_name,
                  area_name: order_shipping_address.area_name,
                  pincode: order_shipping_address.pincode,
                  phone: order_shipping_address.phone_number,
                  city_id: shippingCityCreateId,
                  state_id: order_shipping_address.state_id,
                  country_id: order_shipping_address.country_id,
                  address_type: 1,
                  default_addres: 0,
                  modified_date: getLocalDate(),
                },
                {
                  where: { id: addressId.dataValues.id, is_deleted: "0" },
                  transaction: trn,
                }
              );
            }
          }
        }
      }

      const ordersPayload = {
        order_number: `${ORDER_NUMBER_IDENTITY}-${order_number}`,
        user_id: user_id,
        email: email,
        shipping_method: shipping_method,
        pickup_store_id: pickup_store_id,
        coupon_id,
        sub_total: parseFloat(sub_total),
        shipping_cost: parseFloat(shipping_cost),
        discount: parseFloat(discount),
        total_tax: sumTotal,
        order_total: totalOrderAmount,
        payment_method: payment_method,
        currency_id: currency_id,
        order_status: OrderStatus.Pendding,
        payment_status: PaymentStatus.InPaid,
        order_date: getLocalDate(),
        order_type: order_type,
        order_note: order_note,
        order_shipping_address: {
          ...order_shipping_address,
          city_id: shippingCityCreateId,
        },
        order_billing_address: {
          ...order_billing_address,
          city_id: billingCityCreateId,
        },
        order_taxs: JSON.stringify(taxRateData),
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
      };

      const orders = await Orders.create(ordersPayload, { transaction: trn });

      for (let product of product_details) {
        if (!product.product_id) {
          await trn.rollback();
          return resBadRequest({ message: INVALID_ID });
        }
        const products = await Product.findOne({
          where: { id: product.product_id, is_deleted: "0" },
          transaction: trn,
        });
        if (!(products && products.dataValues)) {
          await trn.rollback();
          return resNotFound({ message: PRODUCT_NOT_FOUND });
        }
        let diamondRate = await dbContext.query(
          `SELECT sum(diamond_group_masters.rate) FROM product_diamond_options LEFT OUTER JOIN diamond_group_masters ON diamond_group_masters.id = product_diamond_options.id_diamond_group WHERE product_diamond_options.id_product = ${product.product_id}`,
          { type: QueryTypes.SELECT }
        );
        const metalRates = await dbContext.query(
          `SELECT CASE WHEN PMO.id_karat IS NULL THEN (metal.metal_rate*PMO.metal_weight) ELSE (metal.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal ON PMO.id_metal = metal.id LEFT OUTER JOIN gold_kts ON PMO.id_karat = gold_kts.id WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} ELSE products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} AND PMO.id_karat = ${product.order_details_json.karat_id} END`,
          { type: QueryTypes.SELECT }
        );

        const ordersDetails = await OrdersDetails.create(
          {
            order_id: orders.dataValues.id,
            product_id: product.product_id,
            quantity: product.quantity,
            finding_charge: parseFloat(products.dataValues.finding_charge),
            makring_charge: parseFloat(products.dataValues.making_charge),
            other_charge: parseFloat(products.dataValues.other_charge),
            diamond_rate: diamondRate.map((t: any) => t.sum)[0],
            metal_rate: metalRates.map((t: any) => t.case)[0],
            sub_total: parseFloat(product.sub_total),
            product_tax: parseFloat(product.product_tax),
            discount_amount: parseFloat(product.discount_amount),
            shipping_cost: parseFloat(product.shipping_cost),
            shipping_method_id: shipping_method,
            delivery_status: DeliverStatus.Pendding,
            payment_status: PaymentStatus.InPaid,
            order_details_json: product.order_details_json,
          },
          { transaction: trn }
        );
      }

      const paayPalPamentData = await paymentPalVerification(
        order_number,
        totalOrderAmount
      );
      if (paayPalPamentData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return paayPalPamentData;
      }

      await trn.commit();
      return resSuccess({
        data: {
          paypalData: paayPalPamentData.data.result,
          orderData: orders.dataValues,
        },
      });
    } catch (error) {
      await trn.rollback();
      return resUnknownError({ data: error });
    }
  } catch (error) {
    throw error;
  }
};

const paymentPalVerification = async (order_number: any, amount: any) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `${ORDER_NUMBER_IDENTITY}-${order_number}`,
        amount: {
          currency_code: PAYMENT_CURRENCY_CODE,
          value: amount,
          breakdown: {
            item_total: {
              currency_code: PAYMENT_CURRENCY_CODE,
              value: amount,
            },
          },
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    return resSuccess({ data: order });
  } catch (e: any) {
    return resUnknownError({ data: e.message });
  }
};
