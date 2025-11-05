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
  ERROR_NOT_FOUND,
  INVALID_ID,
  ONLY_STATUS_UPDATE,
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
import { ORDER_STATUS_ID_FROM_LABEL, ORDER_STATUS_LIST, PRODUCT_TAX_PERCENTAGE } from "../../utils/app-constants";
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
import { mailSendForOrderStatusUpdate } from "./mail.service";
import customerUser from "../model/customer-user.model";
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
          `SELECT CASE WHEN PMO.id_karat IS NULL THEN (metal.metal_rate*PMO.metal_weight) ELSE (metal.metal_rate/metal.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal ON PMO.id_metal = metal.id LEFT OUTER JOIN gold_kts ON PMO.id_karat = gold_kts.id WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} ELSE products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} AND PMO.id_karat = ${product.order_details_json.karat_id} END`,
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
    const startDateFilter: any =
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

    if (!noPagination) {
      const totalItems = await dbContext.query(
        `(SELECT 
orders.id
FROM orders 
LEFT JOIN customer_users AS CS ON CS.id_app_user = user_id
LEFT JOIN order_details AS OD ON orders.id = OD.order_id 
LEFT JOIN products ON products.id = OD.product_id AND (CAST (order_details_json ->> 'product_type' AS integer) = 1 
													   OR  CAST (order_details_json ->> 'product_type' AS integer) = 9)
LEFT JOIN config_products as CON_P ON CON_P.id = OD.product_id AND (CAST (order_details_json ->> 'product_type' AS integer) = 3 
																	OR CAST (order_details_json ->> 'product_type' AS integer) = 6)
LEFT JOIN gift_set_products as GSP ON GSP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 2
LEFT JOIN birthstone_products as BSP ON BSP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 4
LEFT JOIN config_eternity_products as CEBP ON CEBP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 7
LEFT JOIN config_bracelet_products as CBP ON CBP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 10

LEFT JOIN (
    SELECT DISTINCT ON (id_product) id_product, diamond_shapes.name 
    FROM product_diamond_options 
    LEFT JOIN diamond_group_masters ON diamond_group_masters.id = id_diamond_group
    INNER JOIN diamond_shapes ON diamond_shapes.id = diamond_group_masters.id_shape
    ORDER BY id_product, id_type ASC
) as product_diamond ON product_diamond.id_product = OD.product_id AND (CAST(order_details_json ->> 'product_type' as INTEGER) IN (1,9))

LEFT JOIN diamond_shapes as CPDS ON CPDS.id = center_dia_shape_id

LEFT JOIN diamond_shapes as CEBPDS ON CEBPDS.id = CEBP.dia_shape_id

LEFT JOIN (
    SELECT DISTINCT ON (config_product_id) config_product_id, diamond_shapes.name 
    FROM config_bracelet_product_diamonds 
    INNER JOIN diamond_shapes ON diamond_shapes.id = config_bracelet_product_diamonds.id_shape
    LIMIT 1
) as CBPDS ON CBPDS.config_product_id = OD.product_id

WHERE orders.user_id = ${user_id} AND order_date BETWEEN '${new Date(startDateFilter).toISOString().split("T")[0]
        }' AND '${new Date(endDate).toISOString().split("T")[0]}' 
        ${order_status && order_status != OrderStatus.All.toString()
          ? `AND orders.order_status = '${order_status}'`
          : ""
        }
        ${pagination.search_text
          ? `
          AND (orders.order_number ILIKE '%${pagination.search_text}%' 
          OR CAST(orders.order_total AS character varying) ILIKE '%${pagination.search_text}%'
          OR products.name ILIKE '%${pagination.search_text}%'
          OR products.slug ILIKE '%${pagination.search_text}%'
          OR products.sku ILIKE '%${pagination.search_text}%'
          OR CON_P.product_title ILIKE '%${pagination.search_text}%'
          OR CON_P.slug ILIKE '%${pagination.search_text}%'
          OR CON_P.sku ILIKE '%${pagination.search_text}%'
          OR BSP.name ILIKE '%${pagination.search_text}%'
          OR BSP.slug ILIKE '%${pagination.search_text}%'
          OR BSP.sku ILIKE '%${pagination.search_text}%'
          OR GSP.product_title ILIKE '%${pagination.search_text}%'
          OR GSP.slug ILIKE '%${pagination.search_text}%'
          OR GSP.sku ILIKE '%${pagination.search_text}%'
          OR CEBP.product_title ILIKE '%${pagination.search_text}%'
          OR CEBP.slug ILIKE '%${pagination.search_text}%'
          OR CEBP.sku ILIKE '%${pagination.search_text}%'
          OR CBP.product_title ILIKE '%${pagination.search_text}%'
          OR CBP.slug ILIKE '%${pagination.search_text}%'
          OR CBP.sku ILIKE '%${pagination.search_text}%'
          OR product_diamond.name ILIKE '%${pagination.search_text}%'
          OR CPDS.name ILIKE '%${pagination.search_text}%'
          OR CEBPDS.name ILIKE '%${pagination.search_text}%'
          OR CBPDS.name ILIKE '%${pagination.search_text}%'
          )
          `
          : ""
        }
GROUP BY orders.id
ORDER BY orders.created_date DESC
)`,
        { type: QueryTypes.SELECT }
      );

      if (totalItems.length === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems.length;
      pagination.total_pages = Math.ceil(
        totalItems.length / pagination.per_page_rows
      );
    }

    const result = await dbContext.query(
      `SELECT 
orders.id,
order_number,
orders.user_id,
orders.email,
CS.full_name as user_name,
CEIL(orders.order_total) as order_total,
orders.payment_method,
orders.order_status,
orders.payment_status,
orders.order_date,
orders.order_note,
orders.order_date + ("delivery_days" * INTERVAL '1 day') as delivery_date,
JSON_BUILD_OBJECT('id', order_shipping_address ->> 'id', 'full_name', order_shipping_address ->> 'full_name',
				  'phone_number', order_shipping_address ->> 'phone_number',
				  'house_builing', order_shipping_address ->> 'house_builing',
				  'area_name', order_shipping_address ->> 'area_name',
				  'pincode', order_shipping_address ->> 'pincode',
				  'city_id', order_shipping_address ->> 'city_id',
				  'state_id', order_shipping_address ->> 'state_id',
				  'country_id', order_shipping_address ->> 'country_id',
				  'city', sp_city.city_name,
				  'state', sp_state.state_name,
				  'country', sp_country.country_name
				 ) as order_shipping_address,
JSON_BUILD_OBJECT('id', order_shipping_address ->> 'id', 'full_name', order_shipping_address ->> 'full_name',
				  'phone_number', order_shipping_address ->> 'phone_number',
				  'house_builing', order_shipping_address ->> 'house_builing',
				  'area_name', order_shipping_address ->> 'area_name',
				  'pincode', order_shipping_address ->> 'pincode',
				  'city_id', order_shipping_address ->> 'city_id',
				  'state_id', order_shipping_address ->> 'state_id',
				  'country_id', order_shipping_address ->> 'country_id',
				  'city', bl_city.city_name,
				  'state', bl_state.state_name,
				  'country', bl_country.country_name
				 ) as order_billing_address,
CASE WHEN coupons.id IS NOT NULL THEN JSON_BUILD_OBJECT('id', coupons.id,
				  'coupon_code', coupon_code,
				  'discount_type', coupons.discount_type,
				  'discount_amount', coupons.discount_amount,
				  'description', coupons.description,
				  'percentage_off', coupons.percentage_off,
				  'maximum_discount_amount', maximum_discount_amount
				 ) END AS coupon,
COALESCE(jsonb_agg(DISTINCT CASE WHEN OD.id IS NOT NULL THEN  jsonb_build_object(
	'quantity', OD.quantity,
	'finding_charge', OD.finding_charge,
	'makring_charge', OD.makring_charge,
	'other_charge', OD.other_charge,
	'diamond_count', OD.diamond_count,
	'diamond_rate', OD.diamond_rate,
	'metal_rate', CEIL(OD.metal_rate),
	'sub_total', CEIL(OD.sub_total),
	'product_tax', CEIL(OD.product_tax),
	'delivery_status', OD.delivery_status,
	'payment_status', OD.payment_status,
	'refund_request_id', OD.refund_request_id,
	'order_details_json', OD.order_details_json,
	'product_id', OD.product_id, 
	'product_price', CEIL(OD.sub_total),
	'product_image', CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (1,9) THEN product_images.image_path 
					 WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 2 THEN GSPI.image_path ELSE images.image_path END,
	
	'product_title', CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (1,9) THEN products.name 
					 WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 2 THEN GSP.product_title 
					 WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 4 THEN BSP.name 
					WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (3,6) THEN CON_P.product_title
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 7 THEN CEBP.product_title
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 10 THEN CBP.product_title END,
	'product_sku', CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (1,9) THEN products.sku 
					 WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 2 THEN GSP.sku 
					WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 4 THEN BSP.sku
					WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (3,6) THEN CON_P.sku
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 7 THEN CEBP.sku
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 10 THEN CBP.sku END,
	'product_slug', CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (1,9) THEN products.slug 
					 WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 2 THEN GSP.slug 
					WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 4 THEN BSP.slug
					WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (3,6) THEN CON_P.slug
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 7 THEN CEBP.slug
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 10 THEN CBP.slug END,
	'metal', metal_masters.name,
	'karat', gold_kts.name,
	'head_metal_tone', head_tone.name,
	'shank_metal_tone', shank_tone.name,
	'band_metal_tone', band_tone.name,
	'head_metal_tone_id', CAST (order_details_json ->> 'head_metal_tone' AS integer),
	'shank_metal_tone_id', CAST (order_details_json ->> 'shank_metal_tone' AS integer),
	'band_metal_tone_id', CAST (order_details_json ->> 'band_metal_tone' AS integer),
	'Metal_tone', metal_tones.name,
	'product_size', items_sizes.size,
	'product_length', items_lengths.length,
	'diamond_shape', CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (1,9) THEN product_diamond.name 
					 WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 2 THEN null
					WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (3,6) THEN CPDS.name
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 7 THEN CEBPDS.name
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 10 THEN CBPDS.name END,
	
	'category', CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (1,9) THEN categories.category_name 
					WHEN CAST (order_details_json ->> 'product_type' AS integer) IN (3,6) THEN 'ring'
					 WHEN  CAST (order_details_json ->> 'product_type' AS integer) = 4 THEN b_category.category_name
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 7 THEN CEBPDS.name
					WHEN CAST (order_details_json ->> 'product_type' AS integer) = 10 THEN CBPDS.name END
) END) FILTER (WHERE OD.id IS NOT NULL),
    '[]'::jsonb
) as order
FROM orders 
LEFT JOIN customer_users AS CS ON CS.id_app_user = user_id
LEFT JOIN contries as sp_country ON sp_country.id = CASE WHEN order_shipping_address ->> 'country_id' = '' THEN NULL ELSE CAST(order_shipping_address ->> 'country_id' as INTEGER) END
LEFT JOIN states as sp_state ON sp_state.id = CASE WHEN order_shipping_address ->> 'state_id' = '' THEN NULL ELSE CAST(order_shipping_address ->> 'state_id' as INTEGER) END
LEFT JOIN cities as sp_city ON sp_city.id = CASE WHEN order_shipping_address ->> 'city_id' = '' THEN NULL ELSE CAST(order_shipping_address ->> 'city_id' as INTEGER) END
LEFT JOIN contries as bl_country ON bl_country.id = CASE WHEN order_billing_address ->> 'country_id' = '' THEN NULL ELSE CAST(order_billing_address ->> 'country_id' as INTEGER) END
LEFT JOIN states as bl_state ON bl_state.id = CASE WHEN order_billing_address ->> 'state_id' = '' THEN NULL ELSE CAST(order_billing_address ->> 'state_id' as INTEGER) END
LEFT JOIN cities as bl_city ON bl_city.id = CASE WHEN order_billing_address ->> 'city_id' = '' THEN NULL ELSE CAST(order_billing_address ->> 'city_id' as INTEGER) END
LEFT JOIN coupons ON coupons.id = coupon_id
LEFT JOIN order_details AS OD ON orders.id = OD.order_id 
LEFT JOIN product_images ON product_images.id = CAST (order_details_json ->> 'image_id' AS integer) 
AND (CAST (order_details_json ->> 'product_type' AS integer) = 1 OR  CAST (order_details_json ->> 'product_type' AS integer) = 9)
LEFT JOIN gift_set_product_images as GSPI ON GSPI.id = CAST (order_details_json ->> 'image_id' AS integer) AND CAST (order_details_json ->> 'product_type' AS integer) = 2
LEFT JOIN images on images.id = CAST (order_details_json ->> 'image_id' AS integer) 
AND CAST (order_details_json ->> 'product_type' AS integer) NOT IN (1,9,2)
LEFT JOIN products ON products.id = OD.product_id AND (CAST (order_details_json ->> 'product_type' AS integer) = 1 
													   OR  CAST (order_details_json ->> 'product_type' AS integer) = 9)
LEFT JOIN config_products as CON_P ON CON_P.id = OD.product_id AND (CAST (order_details_json ->> 'product_type' AS integer) = 3 
																	OR CAST (order_details_json ->> 'product_type' AS integer) = 6)
LEFT JOIN gift_set_products as GSP ON GSP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 2
LEFT JOIN birthstone_products as BSP ON BSP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 4
LEFT JOIN config_eternity_products as CEBP ON CEBP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 7
LEFT JOIN config_bracelet_products as CBP ON CBP.id = OD.product_id AND CAST (order_details_json ->> 'product_type' AS integer) = 10
LEFT JOIN metal_masters ON metal_masters.id = CAST (order_details_json ->> 'metal_id' AS integer)
LEFT JOIN gold_kts ON gold_kts.id = CAST (order_details_json ->> 'karat_id' AS integer)
LEFT JOIN metal_tones as head_tone ON head_tone.id = CAST (order_details_json ->> 'head_metal_tone' AS integer)
LEFT JOIN metal_tones as shank_tone ON shank_tone.id = CAST (order_details_json ->> 'shank_metal_tone' AS integer)
LEFT JOIN metal_tones as band_tone ON band_tone.id = CAST (order_details_json ->> 'band_metal_tone' AS integer)
LEFT JOIN metal_tones ON metal_tones.id = CAST (order_details_json ->> 'metal_tone' AS integer)
LEFT JOIN items_sizes ON items_sizes.id = CAST (order_details_json ->> 'size_id' AS integer)
LEFT JOIN items_lengths ON items_lengths.id = CAST (order_details_json ->> 'length_id' AS integer)
-- shape
LEFT JOIN (
    SELECT DISTINCT ON (id_product) id_product, diamond_shapes.name 
    FROM product_diamond_options 
    LEFT JOIN diamond_group_masters ON diamond_group_masters.id = id_diamond_group
    INNER JOIN diamond_shapes ON diamond_shapes.id = diamond_group_masters.id_shape
    ORDER BY id_product, id_type ASC
) as product_diamond ON product_diamond.id_product = OD.product_id AND (CAST(order_details_json ->> 'product_type' as INTEGER) IN (1,9))

LEFT JOIN diamond_shapes as CPDS ON CPDS.id = center_dia_shape_id

LEFT JOIN diamond_shapes as CEBPDS ON CEBPDS.id = CEBP.dia_shape_id

LEFT JOIN (
    SELECT DISTINCT ON (config_product_id) config_product_id, diamond_shapes.name 
    FROM config_bracelet_product_diamonds 
    INNER JOIN diamond_shapes ON diamond_shapes.id = config_bracelet_product_diamonds.id_shape
    LIMIT 1
) as CBPDS ON CBPDS.config_product_id = OD.product_id
-- category
LEFT JOIN product_categories ON product_categories.id_product = OD.product_id AND product_categories.is_deleted = '0'
LEFT JOIN categories ON categories.id = product_categories.id_category
LEFT JOIN birthstone_product_categories ON birthstone_product_categories.id_product = OD.product_id
LEFT JOIN categories as b_category ON b_category.id = birthstone_product_categories.id_category
WHERE orders.user_id = ${user_id} AND order_date BETWEEN '${new Date(startDateFilter).toISOString().split("T")[0]
      }' AND '${new Date(endDate).toISOString().split("T")[0]}' 
        ${order_status && order_status != OrderStatus.All.toString()
        ? `AND orders.order_status = '${order_status}'`
        : ""
      }
        ${pagination.search_text
        ? `
          AND (orders.order_number ILIKE '%${pagination.search_text}%' 
          OR CAST(orders.order_total AS character varying) ILIKE '%${pagination.search_text}%'
          OR products.name ILIKE '%${pagination.search_text}%'
          OR products.slug ILIKE '%${pagination.search_text}%'
          OR products.sku ILIKE '%${pagination.search_text}%'
          OR CON_P.product_title ILIKE '%${pagination.search_text}%'
          OR CON_P.slug ILIKE '%${pagination.search_text}%'
          OR CON_P.sku ILIKE '%${pagination.search_text}%'
          OR BSP.name ILIKE '%${pagination.search_text}%'
          OR BSP.slug ILIKE '%${pagination.search_text}%'
          OR BSP.sku ILIKE '%${pagination.search_text}%'
          OR GSP.product_title ILIKE '%${pagination.search_text}%'
          OR GSP.slug ILIKE '%${pagination.search_text}%'
          OR GSP.sku ILIKE '%${pagination.search_text}%'
          OR CEBP.product_title ILIKE '%${pagination.search_text}%'
          OR CEBP.slug ILIKE '%${pagination.search_text}%'
          OR CEBP.sku ILIKE '%${pagination.search_text}%'
          OR CBP.product_title ILIKE '%${pagination.search_text}%'
          OR CBP.slug ILIKE '%${pagination.search_text}%'
          OR CBP.sku ILIKE '%${pagination.search_text}%'
          OR product_diamond.name ILIKE '%${pagination.search_text}%'
          OR CPDS.name ILIKE '%${pagination.search_text}%'
          OR CEBPDS.name ILIKE '%${pagination.search_text}%'
          OR CBPDS.name ILIKE '%${pagination.search_text}%'
          )
          `
        : ""
      } 
GROUP BY orders.id, CS.full_name, sp_city.id,sp_state.id,sp_country.id, bl_city.id,bl_state.id,bl_country.id,coupons.id
ORDER BY orders.created_date DESC
OFFSET
        ${(pagination.current_page - 1) * pagination.per_page_rows} ROWS
        FETCH NEXT ${pagination.per_page_rows} ROWS ONLY
`,
      { type: QueryTypes.SELECT }
    );

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllOrdersListAdmin = async (req: Request) => {
  try {
    const { start_date, end_date, order_status, search_text } = req.query;

    const startDateFilter =
      start_date != undefined ? start_date : new Date().getFullYear();

    const endDateFilter: any = end_date != undefined ? end_date : new Date();

    const endDate = new Date(endDateFilter);
    endDate.setDate(endDate.getDate() + 1);

    const total_pendding_order = await Orders.count({
      where: [
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
        search_text && search_text != "" && search_text != undefined
          ? {
            [Op.or]: [
              { order_number: { [Op.iLike]: `%${search_text}%` } },
              { email: { [Op.iLike]: `%${search_text}%` } },
              Sequelize.where(
                Sequelize.literal(`order_shipping_address ->> 'full_name'`),
                "ILIKE",
                `%${search_text}%`
              ),
              Sequelize.where(
                Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
                ">=",
                `1`
              ),
            ],
          }
          : {},
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
      search_text && search_text != "" && search_text != undefined
        ? {
          [Op.or]: [
            { order_number: { [Op.iLike]: `%${search_text}%` } },
            { email: { [Op.iLike]: `%${search_text}%` } },
            Sequelize.where(
              Sequelize.literal(`order_shipping_address ->> 'full_name'`),
              "ILIKE",
              `%${search_text}%`
            ),
            Sequelize.where(
              Sequelize.literal(`(SELECT COUNT(customer_users.id) FROM customer_users WHERE customer_users.id_app_user = "orders"."user_id" AND full_name ILIKE '%${search_text}%')`),
              ">=",
              `1`
            ),
          ],
        }
        : {},
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
        [Sequelize.literal(`CEIL("sub_total")`), "sub_total"],
        "discount",
        "total_tax",
        "shipping_cost",
        [Sequelize.literal(`CEIL("order_total")`), "order_total"],
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
        [Sequelize.literal(`CEIL("total_tax")`), "total_tax"],
        "coupon_id",
        [Sequelize.literal(`CEIL("orders"."sub_total")`), "sub_total"],
        [Sequelize.literal(`CEIL("shipping_cost")`), "shipping_cost"],
        "discount",
        "currency_rate",
        [Sequelize.literal(`CEIL("order_total")`), "order_total"],
        "payment_method",
        "currency_id",
        "order_status",
        "payment_status",
        "order_date",
        [
          Sequelize.literal(
            `"order_date" + ("delivery_days" * INTERVAL '1 day')`
          ),
          "delivery_date",
        ],
        "order_type",
        "order_note",
        "order_taxs",
        "coupon_discount",
        [
          Sequelize.literal(`(JSON_BUILD_OBJECT('id', order_shipping_address ->> 'id', 'full_name', order_shipping_address ->> 'full_name',
				  'phone_number', order_shipping_address ->> 'phone_number',
				  'house_builing', order_shipping_address ->> 'house_builing',
				  'area_name', order_shipping_address ->> 'area_name',
				  'pincode', order_shipping_address ->> 'pincode',
				  'city_id', order_shipping_address ->> 'city_id',
				  'state_id', order_shipping_address ->> 'state_id',
				  'country_id', order_shipping_address ->> 'country_id',
				  'city', (SELECT city_name FROM cities WHERE id = CASE WHEN order_shipping_address ->> 'city_id' = '' THEN NULL ELSE CAST(order_shipping_address ->> 'city_id' as INTEGER) END),
				  'state', (SELECT state_name FROM states WHERE id = CASE WHEN order_shipping_address ->> 'state_id' = '' THEN NULL ELSE CAST(order_shipping_address ->> 'state_id' as INTEGER) END),
				  'country', (SELECT country_name FROM contries WHERE id = CASE WHEN order_shipping_address ->> 'country_id' = '' THEN NULL ELSE CAST(order_shipping_address ->> 'country_id' as INTEGER) END)
				 ))`),
          "order_shipping_address",
        ],
        [
          Sequelize.literal(`(JSON_BUILD_OBJECT('id', order_billing_address ->> 'id', 'full_name', order_billing_address ->> 'full_name',
				  'phone_number', order_billing_address ->> 'phone_number',
				  'house_builing', order_billing_address ->> 'house_builing',
				  'area_name', order_billing_address ->> 'area_name',
				  'pincode', order_billing_address ->> 'pincode',
				  'city_id', order_billing_address ->> 'city_id',
				  'state_id', order_billing_address ->> 'state_id',
				  'country_id', order_billing_address ->> 'country_id',
				  'city', (SELECT city_name FROM cities WHERE id = CASE WHEN order_billing_address ->> 'city_id' = '' THEN NULL ELSE CAST(order_billing_address ->> 'city_id' as INTEGER) END),
				  'state', (SELECT state_name FROM states WHERE id = CASE WHEN order_billing_address ->> 'state_id' = '' THEN NULL ELSE CAST(order_billing_address ->> 'state_id' as INTEGER) END),
				  'country', (SELECT country_name FROM contries WHERE id = CASE WHEN order_billing_address ->> 'country_id' = '' THEN NULL ELSE CAST(order_billing_address ->> 'country_id' as INTEGER) END)
				 ))`),
          "order_billing_address",
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
            "product_details_json",
            [Sequelize.literal(`CEIL("order"."sub_total")`), "sub_total"],

            "product_tax",
            "delivery_status",
            "payment_status",
            "refund_request_id",
            "order_details_json",
            "product_id",
            [
              Sequelize.literal(
                `CAST (order_details_json ->> 'product_type' AS integer)`
              ),
              "product_type",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT image_path FROM product_images WHERE id = CAST (order_details_json ->> 'image_id' AS integer)) WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT image_path FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT image_path from loose_diamond_group_masters where id = "product_id") ELSE (SELECT image_path FROM images where id = CAST (order_details_json ->> 'image_id' AS integer)) END`
              ),
              "product_image",
            ],
            [Sequelize.literal(`CEIL("order"."sub_total")`), "product_price"],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_title from config_bracelet_products WHERE id = "product_id") ELSE null END`
              ),
              "product_title",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters) WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT sku from config_bracelet_products WHERE id = "product_id") ELSE null END`
              ),
              "product_sku",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters) WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT slug from config_bracelet_products WHERE id = "product_id") ELSE null END`
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
            [
              Sequelize.literal(`(CASE WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Product} OR CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.SettingProduct}  THEN 
                (SELECT diamond_shapes.name FROM product_diamond_options 
                LEFT JOIN diamond_group_masters ON diamond_group_masters.id = id_diamond_group
                INNER JOIN diamond_shapes  ON diamond_shapes.id = diamond_group_masters.id_shape
                WHERE id_product = "product_id" ORDER by id_type ASC LIMIT 1) 
  
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Config_Ring_product} OR CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Three_stone_config_product} THEN
                (SELECT diamond_shapes.name FROM config_products 
                LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape_id
                WHERE config_products.id = "product_id")
  
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.BirthStone_product} THEN
                (SELECT diamond_shapes.name FROM birthstone_product_diamond_options 
                LEFT JOIN diamond_shapes ON id_shape = diamond_shapes.id
                WHERE id_product = "product_id" AND birthstone_product_diamond_options.is_deleted = '0' ORDER BY id_type ASC LIMIT 1)
  
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Config_band_product} THEN
                (SELECT diamond_shapes.name FROM config_eternity_product_diamonds  
                INNER JOIN diamond_shapes ON diamond_shapes.id = dia_shape
                WHERE config_eternity_product_diamonds.id = "product_id")
  
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.BraceletConfigurator} THEN
                (SELECT diamond_shapes.name FROM config_bracelet_product_diamonds 
                LEFT JOIN diamond_shapes ON diamond_shapes.id = id_shape
                WHERE config_product_id = "product_id" LIMIT 1)
                END)`),
              "diamond_shape",
            ],
            [
              Sequelize.literal(`(CASE WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Product} OR CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.SettingProduct}  THEN 
                (SELECT categories.category_name FROM product_categories 
                INNER JOIN categories ON categories.id = id_category
                WHERE id_product = "product_id" ORDER BY product_categories.id ASC LIMIT 1) 
  
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Config_Ring_product} OR CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Three_stone_config_product} THEN
                'Ring'
  
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.BirthStone_product} THEN
                (SELECT categories.category_name FROM birthstone_product_categories 
                INNER JOIN categories ON categories.id = id_category
                WHERE id_product = "product_id" ORDER BY birthstone_product_categories.id ASC LIMIT 1)
  
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.Eternity_product} THEN
                'Eternity Band'
                WHEN CAST(order_details_json ->> 'product_type' as INTEGER) = ${AllProductTypes.BraceletConfigurator} THEN
                'Bracelet'
                END)`),
              "category",
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
        [Sequelize.literal(`CEIL("orders"."sub_total")`), "sub_total"],
        [Sequelize.literal(`CEIL("orders"."shipping_cost")`), "shipping_cost"],
        [Sequelize.literal(`CEIL("orders"."discount")`), "discount"],
        [Sequelize.literal(`CEIL("orders"."total_tax")`), "total_tax"],
        "currency_rate",
        [Sequelize.literal(`CEIL("orders"."order_total")`), "order_total"],
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
            `(SELECT contries.country_name FROM contries WHERE id= CASE WHEN (order_shipping_address ->> 'country_id') = 'null' OR (order_shipping_address ->> 'country_id') = 'undefined' OR (order_shipping_address ->> 'country_id') = '' OR (order_shipping_address ->> 'country_id') IS NULL THEN NULL ELSE CAST (order_shipping_address ->> 'country_id' AS integer)END) `
          ),
          "shipping_add_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CASE WHEN (order_shipping_address ->> 'state_id') = 'null' OR (order_shipping_address ->> 'state_id') = 'undefined' OR (order_shipping_address ->> 'state_id') = '' OR (order_shipping_address ->> 'state_id') IS NULL THEN NULL ELSE CAST (order_shipping_address ->> 'state_id' AS integer)END)`
          ),
          "shipping_add_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CASE WHEN (order_shipping_address ->> 'city_id') = 'null' OR (order_shipping_address ->> 'city_id') = 'undefined' OR (order_shipping_address ->> 'city_id') = '' OR (order_shipping_address ->> 'city_id') IS NULL THEN NULL ELSE CAST (order_shipping_address ->> 'city_id' AS integer)END)`
          ),
          "shipping_add_city",
        ],
        [
          Sequelize.literal(
            `(SELECT contries.country_name FROM contries WHERE id= CASE WHEN (order_billing_address ->> 'country_id') = 'null' OR (order_billing_address ->> 'country_id') = 'undefined' OR (order_billing_address ->> 'country_id') = '' OR (order_billing_address ->> 'country_id') IS NULL THEN NULL ELSE CAST (order_billing_address ->> 'country_id' AS integer)END)`
          ),
          "billing_add_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CASE WHEN (order_billing_address ->> 'state_id') = 'null' OR (order_billing_address ->> 'state_id') = 'undefined' OR (order_billing_address ->> 'state_id') = '' OR (order_billing_address ->> 'state_id') IS NULL THEN NULL ELSE CAST (order_billing_address ->> 'state_id' AS integer)END)`
          ),
          "billing_add_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CASE WHEN (order_billing_address ->> 'city_id') = 'null' OR (order_billing_address ->> 'city_id') = 'undefined' OR (order_billing_address ->> 'city_id') = '' OR (order_billing_address ->> 'city_id') IS NULL THEN NULL ELSE CAST (order_billing_address ->> 'city_id' AS integer)END)`
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
            "product_details_json",
            [Sequelize.literal(`CEIL("order"."sub_total")`), "sub_total"],
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
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_title from config_bracelet_products WHERE id = "product_id") ELSE null END`
              ),
              "product_name",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT sort_description FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT short_des from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_sort_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_sort_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sort_description from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT sort_description from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_sort_des from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_sort_des from config_bracelet_products WHERE id = "product_id") ELSE null END`
              ),
              "sort_description",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT long_description FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT long_des from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_long_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_long_des from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT long_description from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT long_description from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_long_des from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_long_des from config_bracelet_products WHERE id = "product_id") ELSE null END`
              ),
              "long_description",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT sku from config_bracelet_products WHERE id = "product_id") ELSE null END`
              ),
              "product_sku",
            ],
            [
              Sequelize.literal(
                `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} OR CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.SettingProduct} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id")WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT slug from config_bracelet_products WHERE id = "product_id") ELSE null END`
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
    console.log("-----------------------", error);
    throw error;
  }
};

export const orderStatusUpdate = async (req: Request) => {
  try {
    const orderData = await Orders.findOne({ where: { id: req.body.id } });
    const userDeatil = await customerUser.findOne({ where: { id_app_user: orderData.dataValues.user_id } });
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

    const mailNewOrderPayload = {
      toEmailAddress: orderData.dataValues.email,
      contentTobeReplaced: {
        name: userDeatil.dataValues.full_name || orderData.dataValues.order_shipping_address.full_name,
        order_status: ORDER_STATUS_ID_FROM_LABEL[req.body.order_status as OrderStatus],
        order_date: new Date(orderData.dataValues.order_date).toLocaleDateString("en-GB"),
        order_number: orderData.dataValues.order_number,
      },
    }
    if (orderStatus) {
      await mailSendForOrderStatusUpdate(mailNewOrderPayload);
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
            { payment_transaction_id: { [Op.iLike]: `%${pagination.search_text}%` } },
            Sequelize.where(Sequelize.literal(`CAST(order_amount AS text) `), { [Op.iLike]: `%${pagination.search_text}%` }),
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
            `SELECT CASE WHEN PMO.id_karat IS NULL THEN (metal.metal_rate*PMO.metal_weight) ELSE (metal.metal_rate/metal.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal ON PMO.id_metal = metal.id LEFT OUTER JOIN gold_kts ON PMO.id_karat = gold_kts.id WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} ELSE products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} AND PMO.id_karat = ${product.order_details_json.karat_id} END`,
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
              `SELECT CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CPMO.config_product_id =  ${product.product_id} AND CASE WHEN 0 = 1 THEN  CPMO.head_shank_band <> '' ELSE CPMO.head_shank_band <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id `,
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
          `SELECT CASE WHEN PMO.id_karat IS NULL THEN (metal.metal_rate*PMO.metal_weight) ELSE (metal.metal_rate/metal.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal ON PMO.id_metal = metal.id LEFT OUTER JOIN gold_kts ON PMO.id_karat = gold_kts.id WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} ELSE products.id = ${product.product_id} AND PMO.id_metal = ${product.order_details_json.metal_id} AND PMO.id_karat = ${product.order_details_json.karat_id} END`,
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

export const moveOrderToArchive = async (req: any) => {
  try {
    const { ids } = req.params;
    const errors = [];
    const updateOrder = []

    if (!(ids) || ids.split(",").length < 1) {
      return resBadRequest({ data: ids, message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "ids"]]) });
    }

    const orders = await Orders.findAll({
      where: {
        order_status: {[Op.ne]: OrderStatus.Archived},
      },
    })
    for (let index = 0; index < ids.split(",").length; index++) {
      const element = ids.split(",")[index];
      
      const findOrder = orders.find((t: any) => t.dataValues.id == element);
      if (!(findOrder && findOrder.dataValues)) {
        errors.push(prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", `Order #${element} `]]));
      } else {

        if(findOrder.dataValues.order_status == OrderStatus.Confirmed || findOrder.dataValues.order_status == OrderStatus.Delivered  || findOrder.dataValues.order_status == OrderStatus.Failed) {
          updateOrder.push({...findOrder.dataValues, order_status: OrderStatus.Archived})
        } else {
          errors.push(prepareMessageFromParams(ONLY_STATUS_UPDATE, [["id", `${element} `],
            ["status_1", `${ORDER_STATUS_ID_FROM_LABEL[OrderStatus.Confirmed]} `],
            ["status_2", `${ORDER_STATUS_ID_FROM_LABEL[OrderStatus.Failed]} `],
            ["status_3", `${ORDER_STATUS_ID_FROM_LABEL[OrderStatus.Delivered]} `]
          ]));
        }
      }
    }

    if (errors.length > 0) {
      return resBadRequest({ data: errors });
    }


    await Orders.bulkCreate(updateOrder, { updateOnDuplicate: ["order_status"] });
    return resSuccess({ data: updateOrder });
    
  } catch (error) {

    throw error
  }
};