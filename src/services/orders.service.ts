import { Request } from "express";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnknownError,
} from "../utils/shared-functions";
import {
  ADDRESS_NOT_EXITS,
  INVALID_ID,
  ORDER_NOT_FOUND,
  PRODUCT_NOT_FOUND,
  RECORD_UPDATE_SUCCESSFULLY,
  REQUIRED_ERROR_MESSAGE,
  TOTAL_AMOUNT_WRONG,
  USER_NOT_FOUND,
} from "../utils/app-messages";
import Product from "../model/product.model";
import dbContext from "../config/db-context";
import AppUser from "../model/app-user.model";
import {
  DeliverStatus,
  OrderStatus,
  OrderTypes,
  PRODUCT_IMAGE_TYPE,
  PaymentStatus,
} from "../utils/app-enumeration";
import Orders from "../model/order.model";
import OrdersDetails from "../model/order-details.model";
import { Op, QueryTypes, Sequelize, where } from "sequelize";
import { IQueryPagination } from "../data/interfaces/common/common.interface";
import ProductImage from "../model/product-image.model";
import UserAddress from "../model/address.model";
import { PRODUCT_TAX_PERCENTAGE } from "../utils/app-constants";
import OrderTransaction from "../model/order-transaction.model";
import CartProducts from "../model/cart-product.model";
import { ORDER_NUMBER_IDENTITY } from "../config/env.var";
const crypto = require("crypto");

export const addProductOrder = async (req: Request) => {
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

    if (!user_id) return resBadRequest({ message: INVALID_ID });
    const users = await AppUser.findOne({
      where: { id: user_id, is_deleted: "0" },
    });
    if (!(users && users.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const productTax = PRODUCT_TAX_PERCENTAGE / 100;
    const productTaxAmount: any = sub_total * productTax;

    const totalOrderAmount =
      parseFloat(sub_total) + parseFloat(productTaxAmount.toFixed(2));

    if (totalOrderAmount.toFixed(2) != order_total) {
      return resBadRequest({ message: TOTAL_AMOUNT_WRONG });
    }

    const trn = await dbContext.transaction();
    const order_number = crypto.randomInt(1000000000, 9999999999);

    try {
      if (parseInt(is_add_address) == 1) {
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
            city_id: order_billing_address.city_id,
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
              city_id: order_billing_address.city_id,
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
              city_id: order_shipping_address.city_id,
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
                city_id: order_shipping_address.city_id,
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

      const ordersPayload = {
        order_number: `${ORDER_NUMBER_IDENTITY}-${order_number}`,
        user_id: user_id,
        shipping_method: shipping_method,
        pickup_store_id: pickup_store_id,
        coupon_id,
        sub_total: parseFloat(sub_total),
        shipping_cost: parseFloat(shipping_cost),
        discount: parseFloat(discount),
        total_tax: parseFloat(total_tax),
        order_total: parseFloat(order_total),
        payment_method: payment_method,
        currency_id: currency_id,
        order_status: OrderStatus.Pendding,
        payment_status: PaymentStatus.InPaid,
        order_date: getLocalDate(),
        order_type: order_type,
        order_note: order_note,
        order_shipping_address: order_shipping_address,
        order_billing_address: order_billing_address,
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

export const getAllOrdersUser = async (req: Request) => {
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
        "order_shipping_address",
        "order_billing_address",
      ],
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

    const endDateFilter = end_date != undefined ? end_date : new Date();

    const total_pendding_order = await Orders.count({
      where: { order_status: OrderStatus.Pendding },
    });

    const total_confirm_order = await Orders.count({
      where: { order_status: OrderStatus.Confirmed },
    });

    const total_in_process_order = await Orders.count({
      where: { order_status: OrderStatus.Processing },
    });

    const total_out_of_delivery_order = await Orders.count({
      where: { order_status: OrderStatus.OutOfDeliver },
    });

    const total_delivery_order = await Orders.count({
      where: { order_status: OrderStatus.Delivered },
    });

    const total_cancel_order = await Orders.count({
      where: { order_status: OrderStatus.Canceled },
    });

    const total_fail_order = await Orders.count({
      where: { order_status: OrderStatus.Failed },
    });

    const total_returned_order = await Orders.count({
      where: { order_status: OrderStatus.Returned },
    });
    const all_order = await Orders.count();

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
        [Op.or]: [
          { order_date: { [Op.between]: [startDateFilter, endDateFilter] } },
        ],
      },
      order_status ? { order_status: { [Op.eq]: order_status } } : {},
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
        "order_shipping_address",
        "order_billing_address",
      ],
      include: [
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
            // [Sequelize.literal(`(SELECT CASE WHEN PMO.id_karat IS NULL THEN CASE WHEN PDO.id IS NULL THEN  (metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge) ELSE (metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+DGM.rate*PDO.weight) END ELSE CASE WHEN PDO.id IS null THEN (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+DGM.rate*PDO.weight) END END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE products.id = "product_id" AND PMO.id_metal = CAST (order_details_json ->> 'metal_id' AS integer) AND PMO.id_karat = CAST (order_details_json ->> 'karat_id' AS integer) LIMIT 1 )`), "product_price"],
            [
              Sequelize.literal(
                `(SELECT  CASE WHEN PMO.id_karat IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "product_id" AND PMO.id_metal = CAST (order_details_json ->> 'metal_id' AS integer) ELSE products.id = "product_id" AND PMO.id_metal = CAST (order_details_json ->> 'metal_id' AS integer) AND PMO.id_karat = CAST (order_details_json ->> 'karat_id' AS integer) END GROUP BY metal_master.metal_rate, pmo.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name)`
              ),
              "product_price",
            ],

            [
              Sequelize.literal(
                `(SELECT  AVG(product_reviews.rating) FROM product_reviews WHERE product_reviews.product_id = "order"."product_id")`
              ),
              "rating",
            ],
            [
              Sequelize.literal(
                `(SELECT products.name FROM products WHERE id = "product_id")`
              ),
              "product_name",
            ],
            [
              Sequelize.literal(
                `(SELECT products.sku FROM products WHERE id = "product_id")`
              ),
              "product_sku",
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
          include: [
            {
              required: false,
              model: Product,
              as: "product",
              include: [
                {
                  required: false,
                  model: ProductImage,
                  as: "product_images",
                  attributes: ["image_path", "id_metal_tone", "image_type"],
                  where: [
                    {
                      is_deleted: "0",
                      image_type: PRODUCT_IMAGE_TYPE.Feature,
                      id_metal_tone: [
                        Sequelize.literal(
                          `CAST (order_details_json ->> 'metal_tone' AS integer)`
                        ),
                      ],
                    },
                  ],
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
                `(SELECT  CASE WHEN PMO.id_karat IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "product_id" AND PMO.id_metal = CAST (order_details_json ->> 'metal_id' AS integer) ELSE products.id = "product_id" AND PMO.id_metal = CAST (order_details_json ->> 'metal_id' AS integer) AND PMO.id_karat = CAST (order_details_json ->> 'karat_id' AS integer) END GROUP BY metal_master.metal_rate, pmo.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name)`
              ),
              "product_price",
            ],
            [
              Sequelize.literal(
                `(SELECT  AVG(product_reviews.rating) FROM product_reviews WHERE product_reviews.product_id = 87)`
              ),
              "rating",
            ],
            [
              Sequelize.literal(
                `(SELECT products.name FROM products WHERE id = "product_id")`
              ),
              "product_name",
            ],
            [
              Sequelize.literal(
                `(SELECT products.sku FROM products WHERE id = "product_id")`
              ),
              "product_sku",
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
          include: [
            {
              required: false,
              model: Product,
              as: "product",
              include: [
                {
                  required: false,
                  model: ProductImage,
                  as: "product_images",
                  attributes: ["image_path", "id_metal_tone", "image_type"],
                  where: [
                    {
                      is_deleted: "0",
                      image_type: PRODUCT_IMAGE_TYPE.Feature,
                      id_metal_tone: [
                        Sequelize.literal(
                          `CAST (order_details_json ->> 'metal_tone' AS integer)`
                        ),
                      ],
                    },
                  ],
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

    if (!noPagination) {
      const totalItems = await OrderTransaction.count({});

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await OrderTransaction.findAll({
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
