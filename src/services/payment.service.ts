import { Request } from "express";
import Orders from "../model/order.model";
import {
  getLocalDate,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnauthorizedAccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_ERROR,
  DEFAULT_STATUS_ERROR,
  INVOICE_NOT_FOUND,
  ORDER_AMOUNT_WRONG,
  ORDER_NOT_FOUND,
  ORDER_NUMBER_IS_INVALID,
} from "../utils/app-messages";
import {
  FRONT_END_BASE_URL,
  IMAGE_PATH,
  INVOICE_NUMBER_DIGIT,
  ORDER_NUMBER_IDENTITY,
  PAYMENT_METHOD_SECRET_KEY,
} from "../config/env.var";
import dbContext from "../config/db-context";
import {
  PRODUCT_IMAGE_TYPE,
  PaymentStatus,
  STONE_TYPE,
} from "../utils/app-enumeration";
import OrderTransaction from "../model/order-transaction.model";
import OrdersDetails from "../model/order-details.model";
import axios from "axios";
import { mailNewOrderReceived, mailOrderInvoiceReceived } from "./mail.service";
import AppUser from "../model/app-user.model";
import customerUser from "../model/customer-user.model";
import CartProducts from "../model/cart-product.model";
import Invoives from "../model/invoices.model";
import { Sequelize } from "sequelize";
import Product from "../model/product.model";
import ProductImage from "../model/product-image.model";
import path from "path";
import fs from "fs";
export const PaymentTransaction = async (req: Request) => {
  const { order_id, order_number, amount, token } = req.body;
  let invoiceDetails: any;
  let errors: {
    error_status: number;
    error_message: any;
  }[] = [];

  const trn = await dbContext.transaction();

  const orderValidate = await Orders.findOne({
    where: {
      id: order_id,
    },
  });

  if (!(orderValidate && orderValidate.dataValues)) {
    return resNotFound({ message: ORDER_NOT_FOUND });
  }

  const orderNameValidate = await Orders.findOne({
    where: {
      id: order_id,
      order_number: order_number,
    },
  });

  if (!(orderNameValidate && orderNameValidate.dataValues)) {
    return resNotFound({ message: ORDER_NUMBER_IS_INVALID });
  }

  const orderAmontValidate = await Orders.findOne({
    where: {
      id: order_id,
      order_number: order_number,
      order_total: amount,
    },
  });

  if (!(orderAmontValidate && orderAmontValidate.dataValues)) {
    return resNotFound({ message: ORDER_AMOUNT_WRONG });
  }

  const order_details = await OrdersDetails.findAll({
    where: { order_id: orderAmontValidate.dataValues.id },
  });

  let i = (await Invoives.count()) + 1;

  const invoice_number = i.toString().padStart(INVOICE_NUMBER_DIGIT, "0");

  const paymentInfo = await axios
    .post(
      "https://online.yoco.com/v1/charges/",
      {
        token: token,
        amountInCents: amount,
        currency: "ZAR",
      },
      {
        headers: {
          "X-Auth-Secret-Key": PAYMENT_METHOD_SECRET_KEY,
        },
      }
    )
    .then(async (res: any) => {
      try {
        const order_transactions = {
          order_id: order_id,
          order_amount: parseFloat(amount),
          payment_status: PaymentStatus.paid,
          payment_currency: res.data.currency,
          payment_datetime: getLocalDate(),
          payment_source_type: res.data.source.brand,
          payment_json: res.data,
          payment_transaction_id: res.data.source.id,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        };
        const orders = await OrderTransaction.create(order_transactions, {
          transaction: trn,
        });

        await Orders.update(
          {
            payment_status: PaymentStatus.paid,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: order_id }, transaction: trn }
        );

        await OrdersDetails.update(
          {
            payment_status: PaymentStatus.paid,
          },
          { where: { order_id: order_id }, transaction: trn }
        );

        const invoiceData = {
          invoice_number: `${ORDER_NUMBER_IDENTITY}-${invoice_number}`,
          invoice_date: getLocalDate(),
          invoice_amount: amount,
          billing_address: orderAmontValidate.dataValues.order_billing_address,
          shipping_address: orderAmontValidate.dataValues.order_billing_address,
          order_id: orderAmontValidate.dataValues.id,
          transaction_id: orders.dataValues.id,
          created_date: getLocalDate(),
          created_by: req.body.session_res.id_app_user,
        };
        invoiceDetails = await Invoives.create(invoiceData, {
          transaction: trn,
        });
        await trn.commit();
        return res.data;
      } catch (error) {
        errors.push({
          error_status: DEFAULT_STATUS_CODE_ERROR,
          error_message: error,
        });
        await trn.rollback();
        return resUnknownError({ data: error });
      }

      // res.status will contain the HTTP status code
      // res.data will contain the response body
    })
    .catch(async (error: any) => {
      errors.push({
        error_status: error.response.status,
        error_message: error.response.data,
      });
      try {
        const order_transactions = {
          order_id: order_id,
          order_amount: amount,
          payment_status: PaymentStatus.Failed,
          payment_datetime: getLocalDate(),
          payment_json: error,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        };
        await OrderTransaction.create(order_transactions, { transaction: trn });

        await Orders.update(
          {
            payment_status: PaymentStatus.Failed,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: order_id }, transaction: trn }
        );

        await OrdersDetails.update(
          {
            payment_status: PaymentStatus.Failed,
          },
          { where: { order_id: order_id }, transaction: trn }
        );

        await trn.commit();
        return resBadRequest();
      } catch (error) {
        errors.push({
          error_status: DEFAULT_STATUS_CODE_ERROR,
          error_message: error,
        });
        await trn.rollback();
        return resUnknownError({ data: error });
      }
      // handle errors
    });

  if (errors.length > 0) {
    return resUnknownError({ data: errors });
  }

  const result: any = await Invoives.findOne({
    where: { order_id: invoiceDetails.dataValues.order_id },
    attributes: [
      "id",
      "invoice_number",
      "invoice_date",
      "invoice_amount",
      "billing_address",
      "shipping_address",
      "order_id",
      [
        Sequelize.literal(
          `(SELECT contries.country_name FROM contries WHERE id= CAST (shipping_address ->> 'country_id' AS integer))`
        ),
        "shipping_country",
      ],
      [
        Sequelize.literal(
          `(SELECT state_name FROM states WHERE id=  CAST (shipping_address ->> 'state_id' AS integer))`
        ),
        "shipping_state",
      ],
      [
        Sequelize.literal(
          `(SELECT city_name FROM cities WHERE id =  CAST (shipping_address ->> 'city_id' AS integer))`
        ),
        "shipping_city",
      ],
      [
        Sequelize.literal(
          `(SELECT contries.country_name FROM contries WHERE id= CAST (billing_address ->> 'country_id' AS integer))`
        ),
        "billing_country",
      ],
      [
        Sequelize.literal(
          `(SELECT state_name FROM states WHERE id=  CAST (billing_address ->> 'state_id' AS integer))`
        ),
        "billing_state",
      ],
      [
        Sequelize.literal(
          `(SELECT city_name FROM cities WHERE id =  CAST (billing_address ->> 'city_id' AS integer))`
        ),
        "billing_city",
      ],
      // [Sequelize.literal(`(SELECT payment_transaction_id FROM order_transactions WHERE order_id = ${invoiceDetails.dataValues.order_id})`), "transactions_id"]
    ],
    include: [
      {
        model: Orders,
        as: "order_invoice",
        attributes: [
          "id",
          "discount",
          "total_tax",
          "shipping_cost",
          "sub_total",
        ],
        include: [
          {
            model: OrdersDetails,
            as: "order",
            attributes: [
              "quantity",
              "sub_total",
              "product_tax",
              "order_details_json",
              "product_id",
              [
                Sequelize.literal(
                  `(SELECT image_path FROM product_images WHERE id_product = "product_id" AND image_type = ${PRODUCT_IMAGE_TYPE.Feature} AND id_metal_tone = CAST (order_details_json ->> 'metal_tone' AS integer) LIMIT 1)`
                ),
                "product_image",
              ],
              // [Sequelize.literal(`(SELECT CASE WHEN PMO.id_karat IS NULL THEN CASE WHEN PDO.id IS NULL THEN  (metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge) ELSE (metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+DGM.rate*PDO.weight) END ELSE CASE WHEN PDO.id IS null THEN (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+DGM.rate*PDO.weight) END END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE products.id = "product_id" AND PMO.id_metal = CAST (order_details_json ->> 'metal_id' AS integer) AND PMO.id_karat = CAST (order_details_json ->> 'karat_id' AS integer) LIMIT 1)`), "product_price"],
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
              [
                Sequelize.literal(
                  `(SELECT shapes.name FROM products LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN diamond_shapes AS shapes ON shapes.id = DGM.id_shape WHERE products.id = "product_id" AND PDO.id_type = ${STONE_TYPE.Center})`
                ),
                "diamond_shape",
              ],
              [
                Sequelize.literal(
                  `(SELECT gemstones.name FROM products LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gemstones ON gemstones.id = DGM.id_stone WHERE products.id = "product_id" AND PDO.id_type = ${STONE_TYPE.Center})`
                ),
                "diamond",
              ],
              [
                Sequelize.literal(
                  `(SELECT mm_sizes.value FROM products LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN mm_sizes ON mm_sizes.id = DGM.id_mm_size WHERE products.id = "product_id" AND PDO.id_type = ${STONE_TYPE.Center})`
                ),
                "diamond_mm_sizes",
              ],
              [
                Sequelize.literal(
                  `(SELECT colors.value FROM products LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN colors ON colors.id = DGM.id_color WHERE products.id = "product_id" AND PDO.id_type = ${STONE_TYPE.Center})`
                ),
                "diamond_color",
              ],
              [
                Sequelize.literal(
                  `(SELECT clarities.value FROM products LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN clarities ON clarities.id = DGM.id_clarity WHERE products.id = "product_id" AND PDO.id_type = ${STONE_TYPE.Center})`
                ),
                "diamond_clarity",
              ],
              [
                Sequelize.literal(
                  `(SELECT cuts.value FROM products LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN cuts ON cuts.id = DGM.id_cuts WHERE products.id = "product_id" AND PDO.id_type = ${STONE_TYPE.Center})`
                ),
                "diamond_cuts",
              ],
            ],
            required: false,
          },
        ],
      },
    ],
  });
  let logo_image = IMAGE_PATH;
  let frontend_url = FRONT_END_BASE_URL;

  const userData = await customerUser.findOne({
    where: { id_app_user: orderValidate.dataValues.user_id },
  });
  const mailNewOrderPayload = {
    toEmailAddress: userData?.dataValues.email,
    contentTobeReplaced: { name: userData?.dataValues.full_name },
    attachments: {
      toBeReplace: {
        invoice_number: result.dataValues.invoice_number,
        invoice_date: result.dataValues.invoice_date,
        total_amount: result.dataValues.invoice_amount,
        sub_total_amount: result.dataValues.order_invoice.sub_total,
        total_tax: result.dataValues.order_invoice.total_tax,
        discount: result.dataValues.order_invoice.discount,
        shipping_cost: result.dataValues.order_invoice.shipping_cost,
        billing_address: {
          house_builing: result.dataValues.billing_address.house_builing,
          area_name: result.dataValues.billing_address.area_name,
          city: result.dataValues.billing_city,
          state: result.dataValues.billing_state,
          country: result.dataValues.billing_country,
        },
        shipping_address: {
          house_builing: result.dataValues.shipping_address.house_builing,
          area_name: result.dataValues.shipping_address.area_name,
          city: result.dataValues.shipping_city,
          state: result.dataValues.shipping_state,
          country: result.dataValues.shipping_country,
        },
        data: result.dataValues.order_invoice.order,
        logo_image,
        frontend_url,
      },
      filename: "invoice.pdf",
      content: "../../../templates/mail-template/Tax-invoice.html",
    },
  };

  await mailNewOrderReceived(mailNewOrderPayload);

  for (const items of order_details) {
    await CartProducts.destroy({
      where: {
        user_id: orderAmontValidate.dataValues.user_id,
        product_id: items.dataValues.product_id,
      },
    });
  }

  const cart_list_count = await CartProducts.sum("quantity", {
    where: { user_id: orderAmontValidate.dataValues.user_id },
  });

  return resSuccess({ data: { paymentInfo, cart_list_count } });
};

export const invoivesDetailsApi = async (req: Request) => {
  try {
    const { order_id } = req.body;

    const result = await Invoives.findOne({
      where: { order_id: order_id },
      attributes: [
        "id",
        "invoice_number",
        "invoice_date",
        "invoice_amount",
        "billing_address",
        "shipping_address",
        "order_id",
        [
          Sequelize.literal(
            `(SELECT contries.country_name FROM contries WHERE id= CAST (shipping_address ->> 'country_id' AS integer))`
          ),
          "shipping_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CAST (shipping_address ->> 'state_id' AS integer))`
          ),
          "shipping_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CAST (shipping_address ->> 'city_id' AS integer))`
          ),
          "shipping_city",
        ],
        [
          Sequelize.literal(
            `(SELECT contries.country_name FROM contries WHERE id= CAST (billing_address ->> 'country_id' AS integer))`
          ),
          "billing_country",
        ],
        [
          Sequelize.literal(
            `(SELECT state_name FROM states WHERE id=  CAST (billing_address ->> 'state_id' AS integer))`
          ),
          "billing_state",
        ],
        [
          Sequelize.literal(
            `(SELECT city_name FROM cities WHERE id =  CAST (billing_address ->> 'city_id' AS integer))`
          ),
          "billing_city",
        ],
        [
          Sequelize.literal(
            `(SELECT payment_transaction_id FROM order_transactions WHERE order_id = ${order_id})`
          ),
          "transactions_id",
        ],
      ],
      include: [
        {
          model: Orders,
          as: "order_invoice",
          attributes: ["id"],
          include: [
            {
              model: OrdersDetails,
              as: "order",
              attributes: [
                "quantity",
                "sub_total",
                "product_tax",
                "order_details_json",
                "product_id",
                [
                  Sequelize.literal(
                    `(SELECT image_path FROM product_images WHERE id_product = "product_id" AND image_type = ${PRODUCT_IMAGE_TYPE.Feature} AND id_metal_tone = CAST (order_details_json ->> 'metal_tone' AS integer) LIMIT 1)`
                  ),
                  "product_image",
                ],
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
            },
          ],
        },
      ],
    });

    if (!(result && result.dataValues)) {
      return resNotFound({ message: INVOICE_NOT_FOUND });
    }

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
