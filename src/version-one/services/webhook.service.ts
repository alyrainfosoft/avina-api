import { Request } from "express";
import {
  AllProductTypes,
  DIAMOND_INVENTROY_TYPE,
  LogsActivityType,
  LogsType,
  PaymentStatus,
  PAYPAL_PAYMENT_EVENT_TYPE,
  RAZORPAY_PAYMENT_EVENT_TYPE,
  SHIPPING_METHOD,
  STOCK_PRODUCT_TYPE,
  STOCK_TRANSACTION_TYPE,
  STRIPE_PAYMENT_EVENT_TYPE,
} from "../../utils/app-enumeration";
import {
  addActivityLogs,
  generateInvoicePDF,
  convertImageUrlToDataURL,
  getLocalDate,
  getPriceFormat,
  refreshMaterializedProductListView,
  resSuccess,
  getWebSettingData,
  convertCurrencySymbolIntoHTMLFormate,
  getEmailTemplateContent
} from "../../utils/shared-functions";
import { Op, Sequelize, Transaction } from "sequelize";
import { LOG_FOR_SUPER_ADMIN, PAYMENT_METHOD_ID_FROM_LABEL } from "../../utils/app-constants";
import { mailNewOrderAdminReceived } from "./mail.service";
import { mailNewOrderReceived } from "./mail.service";
import { DEFAULT_STATUS_CODE_SUCCESS, SUCCESS_SUBSCRIPTION_LIST } from "../../utils/app-messages";
import getSubSequelize from "../../utils/sub-db-connector";
import { initModels } from "../model/index.model";

export const webhookForStripe = async (req: Request) => {
  try {
    const event = req.body;
    const dbConnection = await getSubSequelize(event.data.object.metadata.company_key);
   const reqBody = {...req, body: {...req.body, company_key: event.data.object.metadata.company_key, db_connection: dbConnection}}
    await addActivityLogs(reqBody,LOG_FOR_SUPER_ADMIN,[{
      old_data: null,
      new_data:event
    }], null, LogsActivityType.StripeEvent, LogsType.Stripe, null);
    if (event.type === STRIPE_PAYMENT_EVENT_TYPE.PaymentIntentCreated) {
      
      const create = await createTransactionForStripe(event,reqBody);
      return create;
    } else if (event.type === STRIPE_PAYMENT_EVENT_TYPE.PaymentSucceeded) {
      const PaymentSucceed = await successTransaction(
        event,
        Number(event.data.object.metadata.order_id),
        event.data.object.payment_intent,
        dbConnection,
        reqBody
      );
      return PaymentSucceed;
    } else if (event.type === STRIPE_PAYMENT_EVENT_TYPE.PaymentFailed) {
      const PaymentFailed = await failedTransaction(
        event,
        Number(event.data.object.metadata.order_id),
        event.data.object.payment_intent,
        reqBody,
      );
      return PaymentFailed;
    } else if (event.type === STRIPE_PAYMENT_EVENT_TYPE.PaymentExpired) {
      const PaymentFailed = await failedTransaction(
        event,
        Number(event.data.object.metadata.order_id),
        event.data.object.payment_intent,
        reqBody
      );
      return PaymentFailed;
    } else {
      return resSuccess({ data: event });
    }
  } catch (error) {
    return resSuccess({ data: error });
    throw error;
  }
};

export const webhookForPaypal = async (req: any) => {
  try {
    const event = req.body;

    console.log("----------------------------------++++++++++++++++++++++++++++++", JSON.stringify(event));
    const dbConnection = await getSubSequelize(event.resource?.purchase_units?.[0]?.description);
    
    const reqBody = {...req, body: {...req.body, company_key: event.resource?.purchase_units?.[0]?.description, db_connection: dbConnection}}
    
    const { OrderTransaction } = await initModels(reqBody);
    
    await addActivityLogs(reqBody,LOG_FOR_SUPER_ADMIN,[{
      old_data: null,
      new_data:event
    }], null, LogsActivityType.PayPalEvent, LogsType.PayPal, null);
    const findOrderTransaction = await OrderTransaction.findOne({
      where: {
        payment_transaction_id: event.resource.id,
      },
    });

    if (event.event_type === PAYPAL_PAYMENT_EVENT_TYPE.CheckoutOrderApproved) {
     
      const PaymentSucceed = await successTransaction(
        event,
        findOrderTransaction.dataValues.order_id,
        findOrderTransaction.dataValues.payment_transaction_id,
        dbConnection,
        reqBody
      );
      return PaymentSucceed;
    } else if (
      event.event_type === PAYPAL_PAYMENT_EVENT_TYPE.CheckoutOrderCompleted
      
    ) {

      if (
        findOrderTransaction &&
        findOrderTransaction.dataValues &&
        findOrderTransaction.dataValues.payment_status === PaymentStatus.InPaid
      ) {
        const PaymentFailed = await successTransaction(
          event,
          findOrderTransaction.dataValues.order_id,
          findOrderTransaction.dataValues.payment_transaction_id,
          dbConnection,
          reqBody
        );
        return PaymentFailed;
      }
    } else if (event.event_type === PAYPAL_PAYMENT_EVENT_TYPE.PaymentExpired) {
      const PaymentFailed = await failedTransaction(
        event,
        findOrderTransaction.dataValues.order_id,
        findOrderTransaction.dataValues.payment_transaction_id,
        reqBody
      );
      return PaymentFailed;
    } else if (
      event.event_type === PAYPAL_PAYMENT_EVENT_TYPE.CheckoutOrderDeclined
    ) {
      
      const PaymentFailed = await failedTransaction(
        event,
        findOrderTransaction.dataValues.order_id,
        findOrderTransaction.dataValues.payment_transaction_id,
        reqBody
      );
      return PaymentFailed;
    } else if (event.event_type === PAYPAL_PAYMENT_EVENT_TYPE.PaymentFailed) {
      
      const PaymentFailed = await failedTransaction(
        event,
        findOrderTransaction.dataValues.order_id,
        findOrderTransaction.dataValues.payment_transaction_id,
        reqBody
      );
      return PaymentFailed;
    } else {
      return resSuccess({ data: event });
    }
  } catch (error) {
    return resSuccess({ data: error });
  }
};

export const webhookForAffirm = async (req: Request) => {
  try {
    const event = req.body;
  } catch (error) {
    return resSuccess({ data: error });
  }
};

export const webhookForRazorpay = async (req: Request) => {
  try {
    const { event, payload } = req.body;
    const dbConnection = await getSubSequelize(payload.payment.entity.notes.company_key);

   const reqBody = {...req, body: {...req.body, company_key: payload.payment.entity.notes.company_key, db_connection: dbConnection}}
    
    const {OrderTransaction,Orders} = await initModels(reqBody);
    await addActivityLogs(reqBody,LOG_FOR_SUPER_ADMIN,[{
      old_data: null,
      new_data:event
    }], null, LogsActivityType.RazorpayEvent, LogsType.RazorPay, null);
    let findOrderTransaction = await OrderTransaction.findOne({
      where: {
        payment_transaction_id: payload.payment.entity.id,
      },
    });

    if(!(findOrderTransaction && findOrderTransaction.dataValues)){
      const findOrder:any = await Orders.findOne({
        where: { id: Number(payload.payment.entity.notes.order_id,
        ) },
      });
      const order_transactions = {
        order_id: payload.payment.entity.notes.order_id,
        order_amount: parseFloat(payload.payment.entity.amount),
        payment_status: PaymentStatus.InPaid,
        payment_currency: payload.payment.entity.currency,
        payment_datetime: getLocalDate(),
        payment_source_type: "visa",
        payment_json: payload,
        payment_transaction_id: payload.payment.entity.id,
        company_info_id:findOrder?.dataValues?.company_info_id,
        created_date: getLocalDate(),
      };
     findOrderTransaction =  await OrderTransaction.create(order_transactions);
    }
    await addActivityLogs(reqBody,findOrderTransaction?.dataValues?.company_info_id,[{
      old_data: null,
      new_data: {
        Order_transaction_id: findOrderTransaction?.dataValues?.id, wishlist_data: {
          ...findOrderTransaction?.dataValues
        }}
    }], findOrderTransaction?.dataValues?.id, LogsActivityType.Add, LogsType.RazorPay, null);
    switch (event) {
      // case RAZORPAY_PAYMENT_EVENT_TYPE.Captured: 
      // const captured = await createTransactionForRazorPay(
      //   payload.payment.entity
      // );
      // return resSuccess({ data: captured });
      // case RAZORPAY_PAYMENT_EVENT_TYPE.Authorized:
      //   const create = await createTransactionForRazorPay(
      //     payload.payment.entity
      //   );
      //   return resSuccess({ data: create });
      case RAZORPAY_PAYMENT_EVENT_TYPE.Paid:
        
        const PaymentSucceed = await successTransaction(
          req.body,
          payload.payment ? payload.payment.entity.notes.order_id : payload.order.entity.notes.order_id,
          findOrderTransaction.dataValues.payment_transaction_id,
          dbConnection,
          reqBody
        );
        return PaymentSucceed;
      case RAZORPAY_PAYMENT_EVENT_TYPE.Failed:
       
        const failedPayment = await failedTransaction(
          req.body,
          payload.payment ? payload.payment.entity.notes.order_id : payload.order.entity.notes.order_id,
          findOrderTransaction.dataValues.payment_transaction_id,
          reqBody
        );
        return failedPayment;
      case RAZORPAY_PAYMENT_EVENT_TYPE.Cancelled:
        
        const cancelledPayment = await failedTransaction(
          req.body,
          payload.payment ? payload.payment.entity.notes.order_id : payload.order.entity.notes.order_id,
          findOrderTransaction.dataValues.payment_transaction_id,
          reqBody
        );
        return cancelledPayment;
      default:
        return resSuccess({ data: req.body });
    }
  } catch (error) {
    console.log(error);
    return resSuccess({ data: error });
  }
};

const createTransactionForStripe = async (webhookResponse: any, req: any) => {
  try {
    const {Orders,OrderTransaction} = await initModels(req);
    const findOrder:any = await Orders.findOne({
      where: { id: Number(webhookResponse.data.object.metadata.order_id) },
    });
    const order_transactions = {
      order_id: findOrder.dataValues.id,
      order_amount: parseFloat(
        webhookResponse.data.object.metadata.order_amount
      ),
      payment_status: PaymentStatus.InPaid,
      payment_currency: webhookResponse.data.object.currency,
      payment_datetime: getLocalDate(),
      payment_source_type: "visa",
      payment_json: webhookResponse,
      payment_transaction_id: webhookResponse.data.object.id,
      created_by: findOrder.dataValues.created_by,
      company_info_id:findOrder?.dataValues?.company_info_id,
      created_date: getLocalDate(),
    };
    const orders = await OrderTransaction.create(order_transactions);
    await addActivityLogs(req,findOrder?.dataValues?.company_info_id,[{
      old_data: null,
      new_data: {
        Order_transaction_id: orders?.dataValues?.id, wishlist_data: {
          ...orders?.dataValues
        }}
    }], orders?.dataValues?.id, LogsActivityType.Add, LogsType.StipeTransaction, null);
    return resSuccess({ data: orders });
  } catch (error) {
    console.log(error);
    return resSuccess({ data: error });
  }
};

const createTransactionForRazorPay = async (webhookResponse: any, dbConnection: any) => {
  try {
    const {Orders,OrderTransaction} = await initModels(dbConnection);
    const findOrder = await Orders.findOne({
      where: { id: Number(webhookResponse.notes.order_id) },
    });

    const findOrderTransaction = await OrderTransaction.findOne({
      where: {
        payment_transaction_id: webhookResponse.id,
      },
    })
    if(!(findOrderTransaction && findOrderTransaction.dataValues)){
      const order_transactions = {
        order_id: findOrder.dataValues.id,
        order_amount: parseFloat(webhookResponse.amount),
        payment_status: PaymentStatus.InPaid,
        payment_currency: webhookResponse.currency,
        payment_datetime: getLocalDate(),
        payment_source_type: "visa",
        payment_json: webhookResponse,
        payment_transaction_id: webhookResponse.id,
        created_by: findOrder.dataValues.created_by,
        created_date: getLocalDate(),
      };
      const orders = await OrderTransaction.create(order_transactions);
      await addActivityLogs(dbConnection,findOrder?.dataValues?.company_info_id,[{
        old_data: null,
        new_data: {
          Order_transaction_id: orders?.dataValues?.id, wishlist_data: {
            ...orders?.dataValues
          }}
      }], orders?.dataValues?.id, LogsActivityType.Add, LogsType.RazorPay, null);
      return resSuccess({ data: orders });
    }
    
  } catch (error) {
    console.log(error);
    return resSuccess({ data: error });
  }
};

const successTransaction = async (
  webhookResponse: any,
  order_id: any,
  payment_transaction_id: any,
  dbConnection: any,
  req:any
) => {
  const { Orders,OrderTransaction,Invoices,OrdersDetails, CouponData, CurrencyData, CartProducts,CustomerUser,CompanyInfo,Image } = await initModels(req);
  let i = (await Invoices.count()) + 1;

  const trn = await dbConnection.transaction();

  try {
    const findOrder = await Orders.findOne({
      where: { id: order_id },
      transaction: trn,
    });

    const configData = await getWebSettingData(dbConnection,findOrder?.dataValues?.company_info_id);
    const invoice_number = i.toString().padStart(configData.invoice_number_generate_digit_count, "0");

    const findOrderTransaction = await OrderTransaction.findOne({
      where: {
        payment_transaction_id: payment_transaction_id,company_info_id:findOrder?.dataValues?.company_info_id
      },
      transaction: trn,
    });

    await OrderTransaction.update(
      {
        payment_status: PaymentStatus.paid,
        payment_json: webhookResponse,
      },
      { where: { id: findOrderTransaction.dataValues.id,company_info_id:findOrder?.dataValues?.company_info_id }, transaction: trn }
    );
    await Orders.update(
      {
        payment_status: PaymentStatus.paid,
        modified_date: getLocalDate(),
        modified_by: findOrder.dataValues.created_by,
      },
      { where: { id: findOrder.dataValues.id,company_info_id:findOrder?.dataValues?.company_info_id }, transaction: trn }
    );
    const findOrderDetailTransaction = await OrderTransaction.findAll({
      where: { order_id: order_id },
      transaction: trn,
    });
    await OrdersDetails.update(
      {
        payment_status: PaymentStatus.paid,
      },
      { where: { order_id: findOrder.dataValues.id,company_info_id:findOrder?.dataValues?.company_info_id }, transaction: trn }
    );
    const invoiceData = {
      invoice_number: `${configData.order_invoice_number_identity}-${invoice_number}`,
      invoice_date: getLocalDate(),
      invoice_amount: parseFloat(findOrder.dataValues.order_total),
      billing_address: findOrder.dataValues.order_billing_address,
      shipping_address: findOrder.dataValues.order_shipping_address,
      order_id: findOrder.dataValues.id,
      transaction_id: findOrderTransaction.dataValues.id,
      created_date: getLocalDate(),
      created_by: findOrder.dataValues.created_by,
      company_info_id:findOrder?.dataValues?.company_info_id
    };
    const invoiceDetails = await Invoices.create(invoiceData, {
      transaction: trn,
    });
    const result: any = await Invoices.findOne({
      where: { order_id: invoiceDetails.dataValues.order_id,company_info_id:findOrder?.dataValues?.company_info_id },
      transaction: trn,
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
          required:false,
          model: OrderTransaction,
          where:{company_info_id:findOrder?.dataValues?.company_info_id},
          as: "order_transaction",
          attributes: ["id", "payment_transaction_id"]
        },
        {
          required:false,
          model: Orders,
          as: "order_invoice",
          where:{company_info_id:findOrder?.dataValues?.company_info_id},
          attributes: [
            "id",
            "order_number",
            "discount",
            "email",
            "currency_id",
            [Sequelize.literal(`CEIL("total_tax")`), "total_tax"],
            "order_date",
            "payment_method",
            "coupon_id",
            [Sequelize.literal(`CEIL("coupon_discount")`), "coupon_discount"],
            "shipping_cost",
            [
              Sequelize.literal(`CEIL("order_invoice"."sub_total")`),
              "sub_total",
            ],
            "shipping_method",
            "pickup_store_id",
            "order_taxs",
            "order_number",
            "offer_details"
          ],
          include: [
            {
              required:false,
              model: CouponData,
              as: "coupon",
              where:{company_info_id:findOrder?.dataValues?.company_info_id},
              attributes: [
                "id",
                "coupon_code",
                "description",
                "discount_type",
                "discount_amount",
                "percentage_off",
                "maximum_discount_amount",
              ],
            },
            {
              required:false,
              model: OrdersDetails,
              as: "order",
              where:{company_info_id:findOrder?.dataValues?.company_info_id},
              attributes: [
                "quantity",
                "diamond_rate",
                "discount_amount",
                [
                  Sequelize.literal(`CEIL("order_invoice->order"."sub_total")`),
                  "sub_total",
                ],
                [Sequelize.literal(`CEIL("product_tax")`), "product_tax"],
                "order_details_json",
                "product_id",
                "variant_id",
                "product_details_json",
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT CONCAT('${configData.image_base_url}' ,image_path) FROM product_images WHERE id = CAST (order_details_json ->> 'image_id' AS integer)) WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT CONCAT('${configData.image_base_url}' ,image_path) FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT CONCAT('${configData.image_base_url}', image_path) FROM loose_diamond_group_masters where id = "product_id") ELSE (SELECT CONCAT('${configData.image_base_url}' ,image_path) FROM images where id = CAST (order_details_json ->> 'image_id' AS integer)) END`
                  ),
                  "product_image",
                ],
                [Sequelize.literal(`CEIL("order_total")`), "product_price"],
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_title from config_bracelet_products WHERE id = "product_id") ELSE null END`
                  ),
                  "product_title",
                ],
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT sku from config_bracelet_products WHERE id = "product_id") ELSE null END`
                  ),
                  "product_sku",
                ],
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id")  WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT slug from config_bracelet_products WHERE id = "product_id") ELSE null END`
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
                "offer_details"
              ],
            },
          ],
        },
      ],
    });

    let findCurrency 
    if (result.dataValues.order_invoice.currency_id && result.dataValues.order_invoice.currency_id != null) {
      findCurrency = await CurrencyData.findOne({where: {id: result.dataValues.order_invoice.currency_id, company_info_id:findOrder?.dataValues?.company_info_id}})
    } else {
      findCurrency = await CurrencyData.findOne({where: {is_default: "1", company_info_id:findOrder?.dataValues?.company_info_id}})
    }
        let taxData = JSON.parse(result.dataValues.order_invoice.order_taxs);
        taxData = taxData.map((data: any) => {
          return { ...data, currency: findCurrency.dataValues.symbol, tax_amount: getPriceFormat(data.tax_amount) };
        });
        const productData: any = [];
        const companyInfo = await (<any>CompanyInfo.findOne({
          where: { id: findOrder?.dataValues?.company_info_id },
          attributes: [
            "id",
            "company_name",
            "company_email",
            "company_phone",
            "copy_right",
            "sort_about",
            "web_link",
            "facebook_link",
            "insta_link",
            "youtube_link",
            "linkdln_link",
            "twitter_link",
            "web_primary_color",
            "web_secondary_color",
            "light_id_image",
            "company_phone",
            "dark_id_image",
            "company_address",
            "gst_number",
            "mail_tem_logo"
          ],
        }));
        for (const data of result.dataValues.order_invoice.order) {
          let engravingValue: any;
          let singleEngravingStr: any;
          if (
            data.order_details_json.product_type ==
              AllProductTypes.BirthStone_product &&
            data.order_details_json.engraving &&
            data.order_details_json.engraving.length > 0
          ) {
            for (
              let index = 0;
              index < data.order_details_json.engraving.length;
              index++
            ) {
              const element = data.order_details_json.engraving[index];
              if (element.value) {
                singleEngravingStr = `${element.text}: ${element.value}`;
                engravingValue = engravingValue
                  ? engravingValue + "|" + " " + singleEngravingStr
                  : singleEngravingStr;
              }
            }
          }
          productData.push({
            ...data.dataValues,
            engraving_value: engravingValue,
            discount: getPriceFormat(
                data.dataValues.discount_amount
              ),
            engraving:
              AllProductTypes.Config_Ring_product ==
              data.order_details_json.product_type
                ? data.order_details_json.engraving
                : "",
            product_type: data.order_details_json.product_type,
            metal: data.dataValues.metal ? data.dataValues.metal : "",
            Karat: data.dataValues.Karat ? data.dataValues.Karat : "",
            Metal_tone: data.dataValues.Metal_tone
              ? data.dataValues.Metal_tone
              : "",
            product_size: data.dataValues.product_size
              ? data.dataValues.product_size
              : "",
            product_length: data.dataValues.product_length
              ? data.dataValues.product_length
              : "",
            currency: convertCurrencySymbolIntoHTMLFormate(findCurrency.dataValues.symbol),
            product_price: 
              getPriceFormat(
                data.dataValues.sub_total
              )
            ,
            sub_total:getPriceFormat(data.dataValues.sub_total/ data.dataValues.quantity),
            font_style: data.order_details_json?.font_style
              ? data.order_details_json?.font_style
              : null,
          });
        }
        const findLogo = await Image.findOne({where: {id: companyInfo?.dataValues?.mail_tem_logo}})
        let productNewData: any = [];
        if(result.dataValues.order_invoice.order.length > 0 && result.dataValues.order_invoice.order[0].dataValues.product_details_json != null){
          for (let index = 0; index < result.dataValues.order_invoice.order.length; index++) {
            const data:any = result.dataValues.order_invoice.order[index].dataValues;
      
            let productTitle = ""
            let productSku = ""
            let metalTone = ""
            let quantity = 0
            let purity = ""
            let metalWeight: any = 0
            let rate:any = 0
            let amount:any = 0
            let diamondAmount: any;
            let makingCharges: any = 0
            let otherCharges: any = 0
            let totalAmount = 0
            let discount = 0
            if (data.order_details_json.product_type == AllProductTypes.Product || data.order_details_json.product_type == AllProductTypes.SettingProduct) {
            
              
              productTitle = data.product_title.replace("ct", `K`)
              productSku = data.product_sku
              metalTone = "Metal Tone:" + data?.Metal_tone
              quantity = data.quantity
              totalAmount = data.sub_total?.toFixed(2) - (data?.discount_amount || 0)
              purity = data.Karat !== null ? `${data.Karat}K` : data.metal
              metalWeight = data?.product_details_json?.PMO[0]?.metal_weight + "gm"
              rate = (data.Karat != null ?
              (Number(data?.product_details_json?.PMO[0].metal_karat.calculate_rate) * Number(data?.product_details_json?.PMO[0].metal_master.metal_rate)).toFixed(2)
                : (Number(data?.product_details_json?.PMO[0].metal_master.metal_rate)).toFixed(2)) + "/ gm"
              amount = data.Karat != null ?
                Math.ceil(Number(data?.product_details_json?.PMO[0].metal_karat.calculate_rate) * Number(data?.product_details_json?.PMO[0].metal_master.metal_rate) * Number(data?.product_details_json?.PMO[0]?.metal_weight))
                : Math.ceil(Number(data?.product_details_json?.PMO[0]?.metal_weight) * Number(data?.product_details_json?.PMO[0].metal_master.metal_rate))
                makingCharges = Number(data?.product_details_json?.making_charge) || 0
                otherCharges = (Number(data?.product_details_json.finding_charge) || 0) + (Number(data?.product_details_json.other_charge) || 0)
              diamondAmount = Math.ceil(Number(data?.diamond_rate) || 0)
              discount = data?.discount_amount ? data?.discount_amount : 0;

            } else if (data.order_details_json.product_type == AllProductTypes.Config_Ring_product) {


              const pmoList = data?.order_details_json?.is_band == "0" ? data?.product_details_json?.pmo?.filter((t: any) => t?.head_shank_band?.toLowerCase() != 'band') : data?.product_details_json?.pmo
              productTitle = data.product_title.replace("ct", `K`)
              productSku = data.product_sku
              metalTone = "Head Tone: " + data?.head_metal_tone + "Shank Tone: " + data?.shank_metal_tone + `${data.order_details_json.is_band == "0" ? `` : `Band Tone: ${data?.band_metal_tone}`}`
              quantity = data.quantity
              totalAmount = data.sub_total?.toFixed(2) - (data?.discount_amount || 0)
              purity = data.Karat !== null ? `${data.Karat}K` : data.metal
              metalWeight = pmoList?.reduce((sum: number, item: any) => sum + item.metal_wt, 0).toFixed(2) + "gm";

              rate = (data.Karat != null ?  ((data?.product_details_json?.pmo[0]?.metal_rate) * (data?.product_details_json?.pmo[0]?.karat_calculate)).toFixed(2)  : data?.product_details_json?.pmo[0]?.metal_rate.toFixed(2)) + "/gm"
      
              amount = data.Karat !== null
                ? Math.ceil(pmoList?.reduce((sum: number, item: any) =>
                  sum + (item?.metal_rate * item?.karat_calculate * item?.metal_wt), 0) 
                )
                : Math.ceil(pmoList?.reduce((sum: number, item: any) =>
                  sum + (item?.metal_rate * item?.metal_wt), 0) 
                );
                makingCharges = Math.ceil(pmoList?.reduce((sum: number, item: any) => 
                  sum + item?.labor_charge, 0) 
              );
              otherCharges = Number(data?.finding_charge) || 0 + Number(data?.other_charge) || 0
              diamondAmount = Math.ceil(Number(data?.diamond_rate) || 0)
               discount = data?.discount_amount ? data?.discount_amount : 0;
      
            } else if (data.order_details_json.product_type == AllProductTypes.Three_stone_config_product) {
              

              productTitle = data.product_title.replace("ct", `K`)
              productSku = data.product_sku
              metalTone = "Head Tone: " + data?.head_metal_tone + "Shank Tone: " + data?.shank_metal_tone
              quantity = data.quantity
              totalAmount = data.sub_total?.toFixed(2) - (data?.discount_amount || 0)
              purity = data.Karat !== null ? `${data.Karat}K` : data.metal
              metalWeight = data?.product_details_json?.pmo[0]?.metal_wt + "gm"
              rate = (data.Karat != null ?
               (Number(data?.product_details_json?.pmo[0]?.metal_rate) * Number(data?.product_details_json?.pmo[0]?.karat_calculate)).toFixed(2)
                :  (Number(data?.product_details_json?.pmo[0]?.metal_rate)).toFixed(2)) + "/ gm"
              amount = data.Karat != null ?
              Math.ceil(Number(data?.product_details_json?.pmo[0]?.karat_calculate) * Number(data?.product_details_json?.pmo[0]?.metal_rate) * Number(data?.product_details_json?.pmo[0]?.metal_wt))
                :  Math.ceil(Number(data?.product_details_json?.pmo[0]?.metal_wt) * Number(data?.product_details_json?.pmo[0]?.metal_rate))
              makingCharges = Number(data?.product_details_json?.pmo[0]?.labor_charge) || 0
              otherCharges = Number(data?.finding_charge) || 0 + Number(data?.other_charge) || 0
              diamondAmount = Math.ceil(Number(data?.diamond_rate || 0))
               discount = data?.discount_amount ? data?.discount_amount : 0;  

            } else if (data.order_details_json.product_type == AllProductTypes.Eternity_product) {
      

              productTitle = data.product_title.replace("ct", `K`)
              productSku = data.product_sku
              metalTone = "Metal Tone: " + data?.Metal_tone
              quantity = data.quantity
              totalAmount = data.sub_total?.toFixed(2) - (data?.discount_amount || 0)
              purity = data.Karat !== null ? `${data.Karat}K` : data.metal
              metalWeight = data?.product_details_json?.pmo[0]?.metal_wt + "gm"
              rate = (data.Karat != null ?
              (Number(data?.product_details_json?.pmo[0]?.metal_rate) * Number(data?.product_details_json?.pmo[0]?.karat_calculate)).toFixed(2)
                :  (Number(data?.product_details_json?.pmo[0]?.metal_rate)).toFixed(2)) + "/ gm"
              amount = data.Karat != null ?
              Math.ceil(Number(data?.product_details_json?.pmo[0]?.karat_calculate) * Number(data?.product_details_json?.pmo[0]?.metal_rate) * Number(data?.product_details_json?.pmo[0]?.metal_wt))
                :  Math.ceil(Number(data?.product_details_json?.pmo[0]?.metal_wt) * Number(data?.product_details_json?.pmo[0]?.metal_rate))
              makingCharges = Number(data?.product_details_json?.pmo[0]?.labor_charge) || 0
              otherCharges = Number(data?.finding_charge) || 0 + Number(data?.other_charge) || 0
              diamondAmount = Math.ceil(Number(data?.diamond_rate || 0))
               discount = data?.discount_amount ? data?.discount_amount : 0;
      
            } else if (data.order_details_json.product_type == AllProductTypes.BirthStone_product) {
                    
              productTitle = data.product_title.replace("ct", `K`)
              productSku = data.product_sku
              metalTone = "Metal Tone: " + data?.Metal_tone
              quantity = data.quantity
              totalAmount = data.sub_total?.toFixed(2) - (data?.discount_amount || 0)
              purity = data.Karat !== null ? `${data.Karat}K` : data.metal
              metalWeight = data?.product_details_json?.bpmo[0]?.metal_weight + "gm"
              rate = "-"
              amount = "-"
              makingCharges = "-"
              otherCharges = "-"
              diamondAmount = "-"
               discount = data?.discount_amount ? data?.discount_amount : 0;
      
            } else if (data.order_details_json.product_type == AllProductTypes.BraceletConfigurator) {

              productTitle = data.product_title.replace("ct", `K`)
              productSku = data.product_sku
              metalTone = "Metal Tone: " + data?.Metal_tone
              quantity = data.quantity
              totalAmount = data.sub_total?.toFixed(2) - (data?.discount_amount || 0)
              purity = data.Karat !== null ? `${data.Karat}K` : data.metal
              metalWeight = data?.product_details_json?.pmo[0]?.metal_wt + "gm"
              rate = (data.Karat != null ?
              (Number(data?.product_details_json?.pmo[0].metal_rate) * Number(data?.product_details_json?.pmo[0].karat_calculate)).toFixed(2)
                :  (Number(data?.product_details_json?.pmo[0]?.metal_rate)).toFixed(2)) + "/ gm"
              amount = data.Karat != null ?
              Math.ceil(Number(data?.product_details_json?.pmo[0]?.karat_calculate) * Number(data?.product_details_json?.pmo[0]?.metal_rate) * Number(data?.product_details_json?.pmo[0]?.metal_wt))
                :  Math.ceil(Number(data?.product_details_json?.pmo[0]?.metal_wt) * Number(data?.product_details_json?.pmo[0]?.metal_rate))
              makingCharges = Number(data?.product_details_json?.pmo[0]?.labor_charge) || 0
              otherCharges = Number(data?.finding_charge) || 0 + Number(data?.other_charge) || 0
              diamondAmount = Math.ceil(Number(data?.diamond_rate || 0))
               discount = data?.discount_amount ? data?.discount_amount : 0;
            }
            productNewData.push({
              index: index + 1,
              productTitle,
              productSku,
              metalTone,
              orderNumber: result.dataValues.order_invoice.order_number,
              quantity,
              purity,
              metalWeight,
              rate,
              amount,
              diamondAmount,
              makingCharges,
              otherCharges,
              discount,
              totalAmount})
          }
        }
        
            const userData = await CustomerUser.findOne({
              where: { id_app_user: result.dataValues.order_invoice.user_id || 0,company_info_id:findOrder?.dataValues?.company_info_id},
            });
            let pdfLogo = configData.image_base_url + findLogo.dataValues.image_path
            const logoBase64:any = await convertImageUrlToDataURL(pdfLogo)
        
            if (logoBase64.code == DEFAULT_STATUS_CODE_SUCCESS) {
              pdfLogo = logoBase64.data
            }
            const findCompanyDetails = await CompanyInfo.findOne({where: {id: findOrder?.dataValues?.company_info_id}})
            let attachmentContent = await getEmailTemplateContent(req, true);
            if(attachmentContent.code !== DEFAULT_STATUS_CODE_SUCCESS){
              trn.rollback();
              return attachmentContent
            }
              const attachments:any = {
                  invoice_number: result.dataValues.invoice_number,
                  invoice_date: new Date(
                    result.dataValues.invoice_date
                  ).toLocaleDateString("en-GB"),
                  pdf_app_logo: pdfLogo,
                  currency: convertCurrencySymbolIntoHTMLFormate(findCurrency.dataValues.symbol),
                  payment_method:
                    PAYMENT_METHOD_ID_FROM_LABEL[
                      result.dataValues.order_invoice.payment_method
                    ],
                  pickup_store_id:
                    result.dataValues.order_invoice.shipping_method ==
                    SHIPPING_METHOD.online
                      ? true
                      : false,
                  total_amount: getPriceFormat(result.dataValues.invoice_amount),
                  sub_total_amount: getPriceFormat(
                    result.dataValues.order_invoice.sub_total
                  ),
                  coupon_discount: result.dataValues.order_invoice.coupon_discount || result.dataValues.order_invoice.discount,
                  coupon: result.dataValues.order_invoice?.coupon?.dataValues,
                  total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
                  discount: getPriceFormat(Number(result.dataValues.order_invoice.coupon_discount) + Number(result.dataValues.order_invoice.discount)),
                  shipping_cost: getPriceFormat(
                    result.dataValues.order_invoice.shipping_cost
                  ),
                  order_date: new Date(
                    result.dataValues.order_invoice.order_date
                  ).toLocaleDateString("en-GB"),
                  order_number: result.dataValues.order_invoice.order_number,
                  billing_address: {
                    house_builing: result.dataValues.billing_address.house_builing,
                    area_name: result.dataValues.billing_address.area_name,
                    city: result.dataValues.billing_city,
                    state: result.dataValues.billing_state,
                    country: result.dataValues.billing_country,
                    pincode: result.dataValues.billing_address.pincode,
                    phone_number: result.dataValues.billing_address.phone_number,
                  },
                  shipping_address: {
                    house_builing: result.dataValues.shipping_address.house_builing,
                    area_name: result.dataValues.shipping_address.area_name,
                    city: result.dataValues.shipping_city,
                    state: result.dataValues.shipping_state,
                    country: result.dataValues.shipping_country,
                    pincode: result.dataValues.shipping_address.pincode,
                    phone_number: result.dataValues.shipping_address.phone_number,
                  },
                  tax_array: taxData,
                  data: productData,
                  logo_image: configData.image_base_url + findLogo.dataValues.image_path,
                  frontend_url: configData.fronted_base_url,
                  app_name: companyInfo?.dataValues?.company_name,
                  company_address: companyInfo?.dataValues?.company_address,
                  company_email: companyInfo?.dataValues?.company_email,
                  company_phone: companyInfo?.dataValues?.company_phone,
                  gst_number: companyInfo?.dataValues?.gst_number ? companyInfo?.dataValues?.gst_number : "-",
                  transaction_id: result.dataValues.order_transaction.payment_transaction_id,
                  product_new_data: productNewData

              }
            const data = {
              id:result?.dataValues?.id,
              invoice_number: result?.dataValues?.invoice_number,          
            }
            const invoiceFromS3 = await generateInvoicePDF(data,attachmentContent.data,attachments,findOrder?.dataValues?.company_info_id,req);
              
            const mailNewOrderPayload = {
              toEmailAddress: result.dataValues.order_invoice.email,
              contentTobeReplaced: {
                name: userData?.dataValues.full_name
                  ? userData?.dataValues.full_name
                  : result.dataValues.billing_address.full_name,
                company_number: findCompanyDetails.dataValues.company_phone,
                company_address: findCompanyDetails.dataValues.company_address,
                toBeReplace: {
                  invoice_number: result.dataValues.invoice_number,
                  invoice_date: new Date(
                    result.dataValues.invoice_date
                  ).toLocaleDateString("en-GB"),
                  total_amount: 
                    getPriceFormat(result.dataValues.invoice_amount)
                  ,
                  sub_total_amount: 
                    getPriceFormat(result.dataValues.order_invoice.sub_total)
                  ,
                  pickup_store_id:
                    result.dataValues.order_invoice.shipping_method ==
                    SHIPPING_METHOD.online
                      ? true
                      : false,
                  coupon_discount: Math.ceil(
                    result.dataValues.order_invoice.coupon_discount
                  ),
                  currency: findCurrency.dataValues.symbol,
                  total_tax: 
                    getPriceFormat(result.dataValues.order_invoice.total_tax)
                  ,
                  discount: result.dataValues.order_invoice.discount,
                  shipping_cost:
                    getPriceFormat(result.dataValues.order_invoice.shipping_cost)
                  ,
                  coupon: result.dataValues?.order_invoice?.coupon?.dataValues,
                  order_number: result.dataValues.order_invoice.order_number,
                  payment_method:
                    PAYMENT_METHOD_ID_FROM_LABEL[
                      result.dataValues.order_invoice.payment_method
                    ],
                  order_date: new Date(
                    result.dataValues.order_invoice.order_date
                  ).toLocaleDateString("en-GB"),
                  billing_address: {
                    house_builing: result.dataValues.billing_address.house_builing,
                    area_name: result.dataValues.billing_address.area_name,
                    city: result.dataValues.billing_city,
                    state: result.dataValues.billing_state,
                    country: result.dataValues.billing_country,
                    pincode: result.dataValues.billing_address.pincode,
                    phone_number: result.dataValues.billing_address.phone_number,
                  },
                  shipping_address: {
                    house_builing: result.dataValues.shipping_address.house_builing,
                    area_name: result.dataValues.shipping_address.area_name,
                    city: result.dataValues.shipping_city,
                    state: result.dataValues.shipping_state,
                    country: result.dataValues.shipping_country,
                    pincode: result.dataValues.shipping_address.pincode,
                    phone_number: result.dataValues.shipping_address.phone_number,
                  },
                  tax_array: taxData,
                  data: productData,
                  logo_image: configData.image_base_url + findLogo.dataValues.image_path,
                  frontend_url: configData.fronted_base_url,
                },
              },
              attachments:{
                filename: `${invoiceFromS3?.data?.filename}`,
                content: invoiceFromS3?.data?.content,
              }
            };

    const admin = {
      toEmailAddress: "info@thecadco.com",
      contentTobeReplaced: {
        mail: 'admin',
        name: userData?.dataValues.full_name
          ? userData?.dataValues.full_name
          : result.dataValues.billing_address.full_name,
        toBeReplace: {
          currency: findCurrency.dataValues.symbol,
          invoice_number: result.dataValues.invoice_number,
          invoice_date: new Date(
            result.dataValues.invoice_date
          ).toLocaleDateString("en-GB"),
          total_amount: getPriceFormat(result.dataValues.invoice_amount),
          sub_total_amount: getPriceFormat(
            result.dataValues.order_invoice.sub_total
          ),
          pickup_store_id:
            result.dataValues.order_invoice.shipping_method ==
            SHIPPING_METHOD.online
              ? true
              : false,
          coupon_discount: result.dataValues.order_invoice.coupon_discount,
          total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
          discount: getPriceFormat(result.dataValues.order_invoice.discount),
          shipping_cost: getPriceFormat(
            result.dataValues.order_invoice.shipping_cost
          ),
          coupon: result.dataValues?.order_invoice?.coupon?.dataValues,
          order_number: result.dataValues.order_invoice.order_number,
          payment_method:
            PAYMENT_METHOD_ID_FROM_LABEL[
              result.dataValues.order_invoice.payment_method
            ],
          order_date: new Date(
            result.dataValues.order_invoice.order_date
          ).toLocaleDateString("en-GB"),
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
          tax_array: taxData,
          data: productData,
          logo_image: configData.image_base_url + findLogo.dataValues.image_path,
          frontend_url: configData.fronted_base_url,
        },
      },
    };

    await mailNewOrderAdminReceived(admin,findOrder?.dataValues?.company_info_id, {body: {db_connection: dbConnection}});
    await mailNewOrderReceived(mailNewOrderPayload, findOrder?.dataValues?.company_info_id, { body: { db_connection: dbConnection } });
    if(findOrder.dataValues.cart_ids && findOrder.dataValues.cart_ids != undefined && findOrder.dataValues.cart_ids != null) {
       await CartProducts.destroy({
        where: {
          id: findOrder.dataValues.cart_ids.split(","),company_info_id:findOrder?.dataValues?.company_info_id
        },
      });
    } else if(findOrder.dataValues.user_id) {
      await CartProducts.destroy({
        where: {
          user_id: findOrder.dataValues.user_id,company_info_id:findOrder?.dataValues?.company_info_id
        },
      });
    }

    const cart_list_count = await CartProducts.sum("quantity", {
      where: { user_id: findOrder.dataValues.user_id,company_info_id:findOrder?.dataValues?.company_info_id },
    });
    await addActivityLogs(req,findOrder?.dataValues?.company_info_id,[{
      old_data: null,
      new_data: {
        order_transaction_id: findOrderTransaction?.dataValues?.id, order_transaction_data: {
          ...findOrderTransaction?.dataValues
        },
        invoice_details_id: invoiceDetails?.dataValues?.id, invoice_details_data: {
          ...invoiceDetails?.dataValues
        },
        orders_id: findOrder?.dataValues?.id, 
        order_data: {
          ...findOrder?.dataValues,payment_status: PaymentStatus.paid,
          modified_by: null,
          modified_date: getLocalDate(),
        },
        order_detail_data: findOrderDetailTransaction.map((t)=> ({
          ...t.dataValues,  // Spread the original data
          payment_status: PaymentStatus.paid,  // Add payment status
          modified_by:  null,  // Add modified_by
          modified_date: getLocalDate(),  // Add modified_date
        })),
    }}], findOrderTransaction?.dataValues?.id, LogsActivityType.Add, LogsType.WebhookTransactionSuccess, null,trn)
  
    await trn.commit();
    // await refreshMaterializedProductListView(dbConnection);
    return resSuccess({ data: cart_list_count });
  } catch (error) {
    console.log(error);
    await trn.rollback();
    return resSuccess({ data: error });
  }
};

export const failedTransaction = async (
  webhookResponse: any,
  order_id: any,
  payment_transaction_id: any,
  req: any
) => {
  const dbConnection = req.body.db_connection;
  const trn = await dbConnection.transaction();

  try {
    const {Orders,OrderTransaction, OrdersDetails} = await initModels(dbConnection);
    const findOrder = await Orders.findOne({
      where: { id: order_id },
      transaction: trn,
    });

    const findOrderTransaction = await OrderTransaction.findOne({
      where: {
        payment_transaction_id: payment_transaction_id,company_info_id:findOrder?.dataValues?.company_info_id
      },
      transaction: trn,
    });

    await OrderTransaction.update(
      {
        payment_status: PaymentStatus.Failed,
        payment_json: webhookResponse,
      },
      { where: { id: findOrderTransaction.dataValues.id,company_info_id:findOrder?.dataValues?.company_info_id }, transaction: trn }
    );
    await Orders.update(
      {
        payment_status: PaymentStatus.Failed,
        modified_date: getLocalDate(),
        modified_by: findOrder.dataValues.created_by,
      },
      { where: { id: findOrder.dataValues.id,company_info_id:findOrder?.dataValues?.company_info_id }, transaction: trn }
    );
    const findOrderDetailTransaction = await OrderTransaction.findAll({
      where: {
        where: { order_id: order_id },      },
      transaction: trn,
    });

    await OrdersDetails.update(
      {
        payment_status: PaymentStatus.Failed,
      },
      { where: { order_id: findOrder.dataValues.id,company_info_id:findOrder?.dataValues?.company_info_id }, transaction: trn }
    );

    await handlePaymentFailedQuantity(findOrder.dataValues.id, trn,findOrder?.dataValues?.company_info_id, req);

    await addActivityLogs(req,findOrder?.dataValues?.company_info_id,[{
      old_data: null,
      new_data: {
        order_transaction_id: findOrderTransaction?.dataValues?.id, order_transaction_data: {
          ...findOrderTransaction?.dataValues
        },
        orders_id: findOrder?.dataValues?.id, 
        order_data: {
          ...findOrder?.dataValues,payment_status: PaymentStatus.paid,
          modified_by: null,
          modified_date: getLocalDate(),
        },
        order_detail_data: findOrderDetailTransaction.map((t)=> ({
          ...t.dataValues,  // Spread the original data
          payment_status: PaymentStatus.paid,  // Add payment status
          modified_by:  null,  // Add modified_by
          modified_date: getLocalDate(),  // Add modified_date
        })),
    }}], findOrderTransaction?.dataValues?.id, LogsActivityType.Add, LogsType.WebhookTransactionFailed, null,trn)
  
    await trn.commit();
    // await refreshMaterializedProductListView(dbConnection);
    return resSuccess({ data: findOrderTransaction });
  } catch (error) {
    await trn.rollback();
    return resSuccess({ data: error });
  }
};

const handlePaymentFailedQuantity = async (
  orderId: number,
  trn: Transaction,
  client_id: number,
  req: any
) => {
  const {OrdersDetails, LooseDiamondGroupMasters, StockChangeLog,ProductMetalOption, Product} = await initModels(req);
  const quantityOrderDetails = await OrdersDetails.findAll({
    where: [
      {
        order_id: orderId,
      },
      Sequelize.where(
        Sequelize.literal(`(order_details_json->>'product_type')::integer`),
        {
          [Op.in]: [
            AllProductTypes.Product,
            AllProductTypes.SettingProduct,
            AllProductTypes.LooseDiamond,
          ],
        }
      ),
      {company_info_id:client_id},
    ],
  });

  let variantDetails = {};
  let diamondDetails = {};
  for (const orderData of quantityOrderDetails) {
    if (
      orderData.dataValues.order_details_json.product_type ===
      AllProductTypes.LooseDiamond
    ) {
      diamondDetails[orderData.dataValues.product_id] = {
        id: orderData.dataValues.product_id,
        quantity:
          (diamondDetails[orderData.dataValues.product_id]?.quantity || 0) +
          orderData.dataValues.quantity,
      };
    } else {
      if (orderData.dataValues.variant_id) {
        variantDetails[orderData.dataValues.variant_id] = {
          id_variant: orderData.dataValues.variant_id,
          id_product: orderData.dataValues.product_id,
          quantity:
            (variantDetails[orderData.dataValues.variant_id]?.quantity || 0) +
            orderData.dataValues.quantity,
        };
      }

      if (
        orderData.dataValues.order_details_json?.diamond?.inventory_type ===
        DIAMOND_INVENTROY_TYPE.Local
      ) {
        const diamond = orderData.dataValues.order_details_json?.diamond;
        diamondDetails[diamond.id] = {
          id: diamond.id,
          quantity: (diamondDetails[diamond.id]?.quantity || 0) + 1,
        };
      }
    }
  }

  for (const key in diamondDetails) {
    const looseDiamond = await LooseDiamondGroupMasters.findOne({
      where: { id: diamondDetails[key].id,company_info_id:client_id },
    });
    if (looseDiamond) {
      await LooseDiamondGroupMasters.update(
        {
          remaining_quantity_count:
            looseDiamond.dataValues.remaining_quantity_count +
            diamondDetails[key].quantity,
        },
        { where: { id: diamondDetails[key].id,company_info_id:client_id }, transaction: trn }
      );

      const AfterUpdateLooseDiamond = await LooseDiamondGroupMasters.findOne({
        where: { id: diamondDetails[key].id },
      });
      const stokeChangesLog = await StockChangeLog.create(
        {
          product_id: looseDiamond.dataValues.id,
          variant_id: null,
          product_type: STOCK_PRODUCT_TYPE.LooseDiamond,
          sku: looseDiamond.dataValues.stock_id,
          prev_quantity: looseDiamond.dataValues.remaining_quantity_count,
          new_quantity:
            looseDiamond.dataValues.remaining_quantity_count +
            diamondDetails[key].quantity,
          transaction_type: STOCK_TRANSACTION_TYPE.OrderFailed,
          changed_by: null,
          email: null,
          change_date: getLocalDate(),
          company_info_id:client_id
        },
        { transaction: trn }
      );

      await addActivityLogs(req,client_id,[{
        old_data: {loose_diamond_id : looseDiamond?.dataValues?.id, loose_diamond_data:looseDiamond?.dataValues},
        new_data:{stoke_id : stokeChangesLog?.dataValues?.id, stoke_data:stokeChangesLog?.dataValues,loose_diamond_id : AfterUpdateLooseDiamond?.dataValues?.id, loose_diamond_data:AfterUpdateLooseDiamond?.dataValues}
      }], stokeChangesLog?.dataValues?.id, LogsActivityType.FailedPaymentQuentityManageDiamond, LogsType.Webhook, null,trn);
    }
  }

  for (const key in variantDetails) {
    const pmoData = await ProductMetalOption.findOne({
      attributes: [
        "id_product",
        "id",
        [Sequelize.literal('"product"."sku"'), "sku"],
        [
          Sequelize.literal('"product"."is_quantity_track"'),
          "is_quantity_track",
        ],
        "remaing_quantity_count",
      ],
      where: { id: variantDetails[key].id_variant,company_info_id:client_id },
      include: {
        model: Product,
        as: "product",
        where:{company_info_id:client_id},
      },
    });

    if (pmoData && pmoData.dataValues && pmoData.dataValues.is_quantity_track) {
      await ProductMetalOption.update(
        {
          remaing_quantity_count:
            pmoData.dataValues.remaing_quantity_count +
            variantDetails[key].quantity,
        },
        { where: { id: variantDetails[key].id_variant,company_info_id:client_id }, transaction: trn }
      );
      const AfterUpdatepmoData = await ProductMetalOption.findOne({
        attributes: [
          "id_product",
          "id",
          [Sequelize.literal('"product"."sku"'), "sku"],
          [
            Sequelize.literal('"product"."is_quantity_track"'),
            "is_quantity_track",
          ],
          "remaing_quantity_count",
        ],
        where: { id: variantDetails[key].id_variant },
        include: {
          model: Product,
          as: "product",
        },
      });

      const stokeChangesLog = await StockChangeLog.create(
        {
          product_id: pmoData.dataValues.id_product,
          variant_id: pmoData.dataValues.id,
          product_type: STOCK_PRODUCT_TYPE.Product,
          sku: pmoData.dataValues.sku,
          prev_quantity: pmoData.dataValues.remaing_quantity_count,
          new_quantity:
            pmoData.dataValues.remaing_quantity_count +
            variantDetails[key].quantity,
          transaction_type: STOCK_TRANSACTION_TYPE.OrderFailed,
          changed_by: null,
          email: null,
          change_date: getLocalDate(),
          company_info_id:client_id
        },
        { transaction: trn }
      );
      await addActivityLogs(req,client_id,[{
        old_data: {pmo_data_id : pmoData?.dataValues?.id, pmo_data_data:pmoData?.dataValues},
        new_data:{stoke_id : stokeChangesLog?.dataValues?.id, stoke_data:stokeChangesLog?.dataValues,pmo_data_id : AfterUpdatepmoData?.dataValues?.id, pmo_data_data:AfterUpdatepmoData?.dataValues}
      }], stokeChangesLog?.dataValues?.id, LogsActivityType.FailedPaymentQuentityManageMetal, LogsType.Webhook, null,trn);
    }
  }
};
