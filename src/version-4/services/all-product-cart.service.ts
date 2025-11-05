import { Request } from "express";
import {
  ADDRESS_NOT_EXITS,
  BRACELET_PRODUCT_NOT_FOUND,
  CATALOGUE_ORDER_NOT_ALLOWED,
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  DIAMOND_PRICE_NOT_MATCH,
  ERROR_NOT_FOUND,
  ETERNITY_BAND_PRODUCT_NOT_FOUND,
  GIFT_SET_PRODUCT_NOT_FOUND,
  INSUFFICIENT_QUANTITY,
  INVALID_ID,
  ORDER_AMOUNT_WRONG,
  ORDER_NOT_FOUND,
  ORDER_NUMBER_IS_INVALID,
  PRODUCT_ALREADY_EXISTS_IN_CART,
  PRODUCT_DIAMOND_DETAILS_IS_REQUIRES,
  PRODUCT_NOT_FOUND,
  PRODUCT_UNAVAILABLE,
  PRODUCT_VARIANT_NOT_FOUND,
  REQUIRED_ERROR_MESSAGE,
  RING_CONFIG_PRODUCT_NOT_FOUND,
  SETTING_PRODUCT_QUANTITY_ERROR,
  SINGLE_PRODUCT_NOT_FOUND,
  TOTAL_AMOUNT_WRONG,
  TRANSACTION_FAIL_MESSAGE,
  UNPROCESSABLE_ENTITY_CODE,
  USER_NOT_FOUND,
} from "../../utils/app-messages";
import {
  addActivityLogs,
  applyShippingCharge,
  columnValueLowerCase,
  getCompanyIdBasedOnTheCompanyKey,
  formatPrice,
  formatPriceForFloatValue,
  generateInvoicePDF,
  getEmailTemplateContent,
  getLocalDate,
  getLocationBasedOnIPAddress,
  getPriceFormat,
  getWebSettingData,
  prepareMessageFromParams,
  refreshMaterializedProductListView,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
  taxCalculationBasedOnPrice,
  getBraceletConfigProductPrice, getEternityConfigProductPrice, getRingConfigProductPriceForCart, getThreeStoneConfigProductPriceForCart,
  getProductTypeForPriceCorrection,
  formatPriceWithoutSeparator
} from "../../utils/shared-functions";
import { Op, QueryTypes, Sequelize } from "sequelize";
import {
  AllProductTypes,
  ActiveStatus,
  DeliverStatus,
  IMAGE_TYPE,
  OrderStatus,
  PaymentStatus,
  paymentMethod,
  DeletedStatus,
  SingleProductType,
  DIAMOND_INVENTROY_TYPE,
  DIAMOND_ORIGIN,
  STOCK_PRODUCT_TYPE,
  STOCK_TRANSACTION_TYPE,
  SHIPPING_METHOD,
  COUPON_DISCOUNT_TYPE,
  LogsActivityType,
  LogsType,
} from "../../utils/app-enumeration";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import {
  CATALOGUE_ORDER_APP_KEY,
  IN_STOCK_PRODUCT_DELIVERY_TIME,
  OUT_OF_STOCK_PRODUCT_DELIVERY_TIME,
  PAYMENT_METHOD_ID_FROM_LABEL,
  WHITE_METAL_TONE_SORT_CODE,
} from "../../utils/app-constants";
import {
  AFFIRM_TRANSACTION_API_URL,
  INVOICE_LOGO_IMAGE_BASE64,
  PROCESS_ENVIRONMENT,
} from "../../config/env.var";
import {
  mailCatalogueNewOrderAdminReceived,
  mailCatalogueNewOrderUserReceived,
  mailNewOrderAdminReceived,
  mailNewOrderReceived,
} from "./mail.service";
import axios from "axios";
import { initModels } from "../model/index.model";
import { getDiamondByStockNumber } from "./loose-diamond-bulk-import.service";
import dbContext from "../../config/db-context";
import { applyOffer } from "./apply-offer.service";
import { studProductQuery } from "./stud-config-product.service";
import { pendantProductQuery } from "./pendant-config-product.service";
import { applyOfferWithBuyNewOneGetOne } from "./apply-offer-buy-with-new.service";
const crypto = require("crypto");
const paypal = require("@paypal/checkout-server-sdk");
const Razorpay = require("razorpay");



export const addToCartAllProductAPI = async (req: Request) => {
  try {
    const { LooseDiamondGroupMasters, AppUser, Product, DiamondGroupMaster, ProductMetalOption, CartProducts, ConfigProduct, Image, GiftSetProduct, ConfigEternityProduct, BirthStoneProduct, BirthstoneProductMetalOption, ConfigBraceletProduct, StudConfigProduct } = initModels(req);
    const {
      user_id,
      product_id,
      product_details,
      product_type,
      quantity,
      variant_id,
      shopNow = false
    } = req.body;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    if (
      user_id &&
      user_id != "null" &&
      user_id != null &&
      user_id != undefined &&
      user_id != "undefined" &&
      user_id != ""
    ) {

      const userExit = await AppUser.findOne({
        where: { id: user_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
      });

      if (user_id && user_id != null) {
        if (!(userExit && userExit.dataValues)) {
          return resNotFound({ message: USER_NOT_FOUND });
        }
      }
    }

    const id = crypto.randomBytes(20).toString("hex");
    /* ------------SINGLE PRODUCT ADD TO CART------------- */
    let cartData: any;
    // get IP
    const IP = req.headers['x-forwarded-for']
    // get location based in IP
    const location = await getLocationBasedOnIPAddress(IP)
    let country = null
    let locationData = null
    if (location && location.code == DEFAULT_STATUS_CODE_SUCCESS) {
      country = location.data.country
      locationData = location.data
    }
    if (AllProductTypes.Product == product_type) {
      const productExit = await Product.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
      });
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      const variant = await ProductMetalOption.findOne({
        where: {
          id: variant_id,
          id_product: product_id,
          is_deleted: DeletedStatus.No,
          company_info_id: company_info_id?.data,
        },
      });

      if (!(variant && variant.dataValues)) {
        return resNotFound({ message: PRODUCT_VARIANT_NOT_FOUND });
      }
      let cartProductExit: any;
      if (
        user_id &&
          user_id != "null" &&
          user_id != null &&
          user_id != undefined &&
          user_id != "undefined" &&
          user_id != ""
          ? user_id
          : null
      ) {
        cartProductExit = await CartProducts.findOne({
          where: [
            product_details.is_catalogue_design !== undefined &&
              product_details.is_catalogue_design !== null
              ? Sequelize.literal(
                `product_details ->>'is_catalogue_design' = '${product_details.is_catalogue_design}'`
              )
              : {},
            { user_id: user_id },
            { company_info_id: company_info_id?.data },
            { product_id: { [Op.eq]: product_id } },
            { product_type: product_type },
            { variant_id: variant_id },
            {
              is_band: product_details.is_band &&
                product_details.is_band != undefined &&
                product_details.is_band != "undefined"
                ? product_details.is_band
                : null,
            },
            {
              id_metal_tone:
                product_details.metal_tone_id &&
                  product_details.metal_tone_id != undefined &&
                  product_details.metal_tone_id != "undefined"
                  ? product_details.metal_tone_id
                  : null,
            },
            {
              id_size:
                product_details.size &&
                  product_details.size != undefined &&
                  product_details.size &&
                  product_details.size != "undefined" &&
                  product_details.size != null &&
                  product_details.size != "null"

                  ? product_details.size && product_details.size
                  : null,
            },
            {
              id_length:
                product_details.length &&
                  product_details.length != undefined &&
                  product_details.length &&
                  product_details.length != "undefined" &&
                  product_details.length != null &&
                  product_details.length != "null"
                  ? product_details.length && product_details.length
                  : null,
            },
          ],
        });
      }
      if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(cartProductExit.dataValues.quantity) + 1,
          },
          { where: { id: cartProductExit.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { Product_id: cartProductExit?.dataValues?.id, quantity: cartProductExit?.quantity },
          new_data: {
            Product_id: cartProductExit?.dataValues?.id, quantity: quantity,
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)

      } else if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExit.dataValues
      } else {
        cartData = await CartProducts.create({
          id: id,
          user_id:
            user_id &&
              user_id != "null" &&
              user_id != null &&
              user_id != undefined &&
              user_id != "undefined" &&
              user_id != ""
              ? user_id
              : null,
          product_id: product_id,
          variant_id: variant_id,
          is_band: product_details.is_band &&
            product_details.is_band != undefined &&
            product_details.is_band != "undefined"
            ? product_details.is_band
            : null,
          id_metal:
            variant.dataValues.id_metal &&
              variant.dataValues.id_metal != "null" &&
              variant.dataValues.id_metal != null &&
              variant.dataValues.id_metal != undefined &&
              variant.dataValues.id_metal != "undefined" &&
              variant.dataValues.id_metal != ""
              ? variant.dataValues.id_metal
              : null,
          id_karat:
            variant.dataValues.id_karat &&
              variant.dataValues.id_karat != "null" &&
              variant.dataValues.id_karat != null &&
              variant.dataValues.id_karat != undefined &&
              variant.dataValues.id_karat != "undefined" &&
              variant.dataValues.id_karat != ""
              ? variant.dataValues.id_karat
              : null,
          id_size:
            product_details.size &&
              product_details.size != "" &&
              product_details.size != null &&
              product_details.size != "null" &&
              product_details.size != undefined &&
              product_details.size &&
              product_details.size != "undefined"
              ? product_details.size && product_details.size
              : null,
          id_length:
            product_details.length &&
              product_details.length != "" &&
              product_details.length != null &&
              product_details.length != "null" &&
              product_details.length != undefined &&
              product_details.length &&
              product_details.length != "undefined"
              ? product_details.length && product_details.length
              : null,
          id_metal_tone:
            product_details.metal_tone_id &&
              product_details.metal_tone_id != "" &&
              product_details.metal_tone_id != undefined &&
              product_details.metal_tone_id != "undefined" &&
              product_details.metal_tone_id != null &&
              product_details.metal_tone_id != "null"
              ? product_details.metal_tone_id
              : null,
          product_type: AllProductTypes.Product,
          quantity: quantity ? quantity : 1,
          company_info_id: company_info_id?.data,
          product_details: {
            sku: product_details.SKU,
            product_id: product_id,
            metal: product_details.metal_id,
            karat: product_details.karat_id,
            metal_tone: product_details.metal_tone_id,
            size:
              product_details.size && product_details.size != undefined
                ? product_details.size
                : null,
            length: product_details.length,
            image: product_details.image_id,
            is_catalogue_design: product_details.is_catalogue_design || false,
            engraving: product_details?.engraving,
            font_style: product_details?.font_style,
          },
          user_ip: IP,
          user_country: country,
          user_location: locationData,
          created_date: getLocalDate(),
        });
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: null,
          new_data: {
            Product_id: cartData?.dataValues?.id, data: {
              ...cartData?.dataValues
            },
          }
        }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)
      }
    } else if (AllProductTypes.Config_Ring_product == product_type) {
      /* ---------------CONFIG RING PRODUCT ADD TO CART------------- */
      const productExit = await ConfigProduct.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
      let configProductExists;
      if (
        user_id &&
        user_id != "null" &&
        user_id != null &&
        user_id != undefined &&
        user_id != "undefined" &&
        user_id != ""
      ) {
        configProductExists = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: product_id,
            product_type: product_type,
            company_info_id: company_info_id?.data,
            id_size:
              product_details.size &&
                product_details.size != undefined &&
                product_details.size != "" &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size && product_details.size
                : null,
            id_head_metal_tone:
              product_details.head_metal_tone_id &&
                product_details.head_metal_tone_id != "" &&
                product_details.head_metal_tone_id != undefined &&
                product_details.head_metal_tone_id != "undefined" &&
                product_details.head_metal_tone_id != null &&
                product_details.head_metal_tone_id != "null"
                ? product_details.head_metal_tone_id
                : null,
            id_shank_metal_tone:
              product_details.shank_metal_tone_id &&
                product_details.shank_metal_tone_id != "" &&
                product_details.shank_metal_tone_id != undefined &&
                product_details.shank_metal_tone_id != "undefined" &&
                product_details.shank_metal_tone_id != null &&
                product_details.shank_metal_tone_id != "null"
                ? product_details.shank_metal_tone_id
                : null,
            is_band: product_details.is_band,
            id_band_metal_tone:
              product_details.is_band == "1" &&
                product_details.band_metal_tone_id &&
                product_details.band_metal_tone_id != "" &&
                product_details.band_metal_tone_id != undefined &&
                product_details.band_metal_tone_id != "undefined" &&
                product_details.band_metal_tone_id != null &&
                product_details.band_metal_tone_id != "null"
                ? product_details.band_metal_tone_id
                : null,
          },
        });
      }

      if (configProductExists && configProductExists.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(configProductExists.dataValues.quantity) + 1,
          },
          { where: { id: configProductExists.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { config_Ring_product_id: configProductExists?.dataValues?.id, quantity: configProductExists?.quantity },
          new_data: {
            config_Ring_product_id: configProductExists?.dataValues?.id, quantity: quantity
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)
      } else if (configProductExists && configProductExists.dataValues && shopNow.toString() == "true") {
        cartData = configProductExists.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }, { transaction: trn }
            );
            idImage = imageResult.dataValues.id;
          }

          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            quantity: quantity ? quantity : 1,
            id_size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != null &&
                product_details.size != "null" &&
                product_details.size != undefined &&
                product_details.size != "undefined"
                ? product_details.size && product_details.size
                : null,
            id_metal:
              product_details.metal_id &&
                product_details.metal_id != "" &&
                product_details.metal_id != undefined &&
                product_details.metal_id != null &&
                product_details.metal_id != "null" &&
                product_details.metal_id != "undefined"
                ? product_details.metal_id
                : null,
            id_karat:
              product_details.karat_id &&
                product_details.karat_id != "" &&
                product_details.karat_id != undefined &&
                product_details.karat_id != "undefined" &&
                product_details.karat_id != null &&
                product_details.karat_id != "null"
                ? product_details.karat_id
                : null,
            id_head_metal_tone:
              product_details.head_metal_tone_id &&
                product_details.head_metal_tone_id != "" &&
                product_details.head_metal_tone_id != undefined &&
                product_details.head_metal_tone_id != "undefined" &&
                product_details.karat_id != null &&
                product_details.karat_id != "null"
                ? product_details.head_metal_tone_id
                : null,
            id_shank_metal_tone:
              product_details.shank_metal_tone_id &&
                product_details.shank_metal_tone_id != "" &&
                product_details.shank_metal_tone_id != undefined &&
                product_details.shank_metal_tone_id != "undefined" &&
                product_details.shank_metal_tone_id != null &&
                product_details.shank_metal_tone_id != "null"
                ? product_details.shank_metal_tone_id
                : null,
            is_band: product_details.is_band,
            id_band_metal_tone:
              product_details.is_band == "1" &&
                product_details.band_metal_tone_id &&
                product_details.band_metal_tone_id != "" &&
                product_details.band_metal_tone_id != undefined &&
                product_details.band_metal_tone_id != "undefined" &&
                product_details.band_metal_tone_id != null &&
                product_details.band_metal_tone_id != "null"
                ? product_details.band_metal_tone_id
                : null,
            product_type: AllProductTypes.Config_Ring_product,
            company_info_id: company_info_id?.data,
            product_details: {
              sku: product_details.SKU,
              diamond_type: product_details.product_diamond_type,
              product_id: product_id,
              metal: product_details.metal_id,
              karat:
                product_details.karat_id &&
                  product_details.karat_id != "" &&
                  product_details.karat_id != undefined &&
                  product_details.karat_id != "null" &&
                  product_details.karat_id != "undefined" &&
                  product_details.karat_id != null
                  ? product_details.karat_id
                  : null,
              head_metal_tone:
                product_details.head_metal_tone_id &&
                  product_details.head_metal_tone_id != "" &&
                  product_details.head_metal_tone_id != "null" &&
                  product_details.head_metal_tone_id != "undefined" &&
                  product_details.head_metal_tone_id != null &&
                  product_details.head_metal_tone_id != undefined
                  ? product_details.head_metal_tone_id
                  : null,
              shank_metal_tone:
                product_details.shank_metal_tone_id &&
                  product_details.shank_metal_tone_id != "" &&
                  product_details.shank_metal_tone_id != "null" &&
                  product_details.shank_metal_tone_id != "undefined" &&
                  product_details.shank_metal_tone_id != null &&
                  product_details.shank_metal_tone_id != undefined
                  ? product_details.shank_metal_tone_id
                  : null,
              size: product_details.size,
              band_metal_tone:
                product_details.band_metal_tone_id &&
                  product_details.band_metal_tone_id != "" &&
                  product_details.band_metal_tone_id != undefined &&
                  product_details.band_metal_tone_id != "undefined" &&
                  product_details.band_metal_tone_id != null &&
                  product_details.band_metal_tone_id != "null"
                  ? product_details.band_metal_tone_id
                  : null,
              is_band: product_details.is_band,
              head: product_details.head_id,
              shank: product_details.shank_id,
              side_setting: product_details.side_setting_id,
              image: idImage,
              engraving: product_details.engraving,
              font_style: product_details.font_style,
            },
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          }, { transaction: trn });
          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              config_Ring_product_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }
      }
    } else if (AllProductTypes.Three_stone_config_product == product_type) {
      /* ---------------THREE STONE CONFIG RING PRODUCT ADD TO CART------------- */
      const productExit = await ConfigProduct.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
      let configProductExists;
      if (
        user_id &&
        user_id != "null" &&
        user_id != null &&
        user_id != undefined &&
        user_id != "undefined" &&
        user_id != ""
      ) {
        configProductExists = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: product_id,
            product_type: product_type,
            company_info_id: company_info_id?.data,
            id_size:
              product_details.size &&
                product_details.size != undefined &&
                product_details.size != "" &&
                product_details.size != "null" &&
                product_details.size != null &&
                product_details.size != "undefined"
                ? product_details.size && product_details.size
                : null,
            id_head_metal_tone:
              product_details.head_metal_tone_id &&
                product_details.head_metal_tone_id != "" &&
                product_details.head_metal_tone_id != undefined &&
                product_details.head_metal_tone_id != null &&
                product_details.head_metal_tone_id != "null" &&
                product_details.head_metal_tone_id != "undefined"
                ? product_details.head_metal_tone_id
                : null,
            id_shank_metal_tone:
              product_details.shank_metal_tone_id &&
                product_details.shank_metal_tone_id != "" &&
                product_details.shank_metal_tone_id != undefined &&
                product_details.shank_metal_tone_id != "undefined" &&
                product_details.shank_metal_tone_id != null &&
                product_details.shank_metal_tone_id != "null"
                ? product_details.shank_metal_tone_id
                : null,
            is_band: product_details.is_band,
            id_band_metal_tone:
              product_details.is_band == "1" &&
                product_details.band_metal_tone_id &&
                product_details.band_metal_tone_id != "" &&
                product_details.band_metal_tone_id != undefined &&
                product_details.band_metal_tone_id != "undefined" &&
                product_details.band_metal_tone_id != null &&
                product_details.band_metal_tone_id != "null"
                ? product_details.band_metal_tone_id
                : null,
          },
        });
      }

      if (configProductExists && configProductExists.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(configProductExists.dataValues.quantity) + 1,
          },
          { where: { id: configProductExists.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { three_stone_config_product_id: configProductExists?.dataValues?.id, quantity: configProductExists?.quantity },
          new_data: {
            three_stone_config_product_id: configProductExists?.dataValues?.id, quantity: quantity
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)
      } else if (configProductExists && configProductExists.dataValues && shopNow.toString() == "true") {
        cartData = configProductExists.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }
            );
            idImage = imageResult.dataValues.id;
          }

          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            quantity: quantity ? quantity : 1,
            id_size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != null &&
                product_details.size != "null" &&
                product_details.size != undefined &&
                product_details.size != "undefined"
                ? product_details.size && product_details.size
                : null,
            id_metal:
              product_details.metal_id &&
                product_details.metal_id != "" &&
                product_details.metal_id != undefined &&
                product_details.metal_id != "undefined" &&
                product_details.metal_id != null &&
                product_details.metal_id != "null"
                ? product_details.metal_id
                : null,
            id_karat:
              product_details.karat_id &&
                product_details.karat_id != "" &&
                product_details.karat_id != undefined &&
                product_details.karat_id != "undefined" &&
                product_details.karat_id != null &&
                product_details.karat_id != "null"
                ? product_details.karat_id
                : null,
            id_head_metal_tone:
              product_details.head_metal_tone_id &&
                product_details.head_metal_tone_id != "" &&
                product_details.head_metal_tone_id != undefined &&
                product_details.head_metal_tone_id != "undefined" &&
                product_details.head_metal_tone_id != null &&
                product_details.head_metal_tone_id != "null"
                ? product_details.head_metal_tone_id
                : null,
            id_shank_metal_tone:
              product_details.shank_metal_tone_id &&
                product_details.shank_metal_tone_id != "" &&
                product_details.shank_metal_tone_id != undefined &&
                product_details.shank_metal_tone_id != "undefined" &&
                product_details.shank_metal_tone_id != null &&
                product_details.shank_metal_tone_id != "null"
                ? product_details.shank_metal_tone_id
                : null,
            is_band: product_details.is_band,
            id_band_metal_tone:
              product_details.is_band == "1" &&
                product_details.band_metal_tone_id &&
                product_details.band_metal_tone_id != "" &&
                product_details.band_metal_tone_id != undefined &&
                product_details.band_metal_tone_id != "undefined" &&
                product_details.band_metal_tone_id != null &&
                product_details.band_metal_tone_id != "null"
                ? product_details.band_metal_tone_id
                : null,
            product_type: AllProductTypes.Three_stone_config_product,
            company_info_id: company_info_id?.data,
            product_details: {
              sku: product_details.SKU,
              diamond_type: product_details.product_diamond_type,
              product_id: product_id,
              metal: product_details.metal_id,
              karat:
                product_details.karat_id &&
                  product_details.karat_id != "" &&
                  product_details.karat_id != "undefined" &&
                  product_details.karat_id != "null" &&
                  product_details.karat_id != null &&
                  product_details.karat_id != undefined
                  ? product_details.karat_id
                  : null,
              head_metal_tone:
                product_details.head_metal_tone_id &&
                  product_details.head_metal_tone_id != "" &&
                  product_details.head_metal_tone_id != "undefined" &&
                  product_details.head_metal_tone_id != "null" &&
                  product_details.head_metal_tone_id != null &&
                  product_details.head_metal_tone_id != undefined
                  ? product_details.head_metal_tone_id
                  : null,
              shank_metal_tone:
                product_details.shank_metal_tone_id &&
                  product_details.shank_metal_tone_id != "" &&
                  product_details.shank_metal_tone_id != "undefined" &&
                  product_details.shank_metal_tone_id != "null" &&
                  product_details.shank_metal_tone_id != null &&
                  product_details.shank_metal_tone_id != undefined
                  ? product_details.shank_metal_tone_id
                  : null,
              size: product_details.size,
              band_metal_tone:
                product_details.band_metal_tone_id &&
                  product_details.band_metal_tone_id != "" &&
                  product_details.band_metal_tone_id != "undefined" &&
                  product_details.band_metal_tone_id != "null" &&
                  product_details.band_metal_tone_id != null &&
                  product_details.band_metal_tone_id != undefined
                  ? product_details.band_metal_tone_id
                  : null,
              is_band: product_details.is_band,
              head: product_details.head_id,
              shank: product_details.shank_id,
              side_setting: product_details.side_setting_id,
              image: idImage,
              engraving: product_details.engraving,
              font_style: product_details.font_style,
            },
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          });

          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              three_stone_config_product_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }
      }
    } else if (AllProductTypes.GiftSet_product == product_type) {
      /* ---------------GIFT SET PRODUCT ADD TO CART----------------------- */

      const productExit = await GiftSetProduct.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
      let cartProductExit;
      if (
        user_id &&
          user_id != "null" &&
          user_id != null &&
          user_id != undefined &&
          user_id != "undefined" &&
          user_id != ""
          ? user_id
          : null
      ) {
        cartProductExit = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: { [Op.eq]: product_id },
            product_type: product_type,
            company_info_id: company_info_id?.data,
          },
        });
      }

      if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(cartProductExit.dataValues.quantity) + 1,
          },
          { where: { id: cartProductExit.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { giftSet_product_id: cartProductExit?.dataValues?.id, quantity: cartProductExit?.quantity },
          new_data: {
            giftSet_product_id: cartProductExit?.dataValues?.id, quantity: quantity
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)
      } else if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExit.dataValues
      } else {
        cartData = await CartProducts.create({
          id: id,
          user_id:
            user_id &&
              user_id != "null" &&
              user_id != null &&
              user_id != undefined &&
              user_id != "undefined" &&
              user_id != ""
              ? user_id
              : null,
          company_info_id: company_info_id?.data,
          product_id: product_id,
          quantity: quantity ? quantity : 1,
          product_type: AllProductTypes.GiftSet_product,
          product_details: {
            sku: product_details.SKU,
            product_id: product_id,
            price: productExit.dataValues.price,
            image: product_details.id_image,
            engraving: product_details?.engraving,
            font_style: product_details?.font_style,

          },
          created_date: getLocalDate(),
          user_ip: IP,
          user_country: country,
          user_location: locationData,
        });
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: null,
          new_data: {
            giftSet_product_id: cartData?.dataValues?.id, data: {
              ...cartData?.dataValues
            }
          }
        }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)

      }
    } else if (AllProductTypes.BirthStone_product == product_type) {
      /* ---------------BIRTHSTONE PRODUCT ADD TO CART----------------------- */

      const productExit = await BirthStoneProduct.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      const variant = await await BirthstoneProductMetalOption.findOne({
        where: {
          id: variant_id,
          id_product: product_id,
          is_deleted: DeletedStatus.No,
          company_info_id: company_info_id?.data
        },
      });

      if (!(variant && variant.dataValues)) {
        return resNotFound({ message: PRODUCT_VARIANT_NOT_FOUND });
      }

      let cartProductExit;
      if (
        user_id &&
          user_id != "null" &&
          user_id != null &&
          user_id != undefined &&
          user_id != "undefined" &&
          user_id != ""
          ? user_id
          : null
      ) {
        cartProductExit = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: { [Op.eq]: product_id },
            product_type: product_type,
            company_info_id: company_info_id?.data,
            variant_id: variant.dataValues.id,
            id_size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != undefined &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size
                : null,
            id_metal_tone: variant.dataValues.id_metal_tone,
          },
        });
      }
      if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(cartProductExit.dataValues.quantity) + 1,
          },
          { where: { id: cartProductExit.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { birthStone_product_id: cartProductExit?.dataValues?.id, quantity: cartProductExit?.quantity },
          new_data: {
            birthStone_product_id: cartProductExit?.dataValues?.id, quantity: quantity
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)
      } else if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExit.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }
            );
            idImage = imageResult.dataValues.id;
          }
          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            quantity: quantity ? quantity : 1,
            product_type: product_type,
            variant_id: variant.dataValues.id,
            id_size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != undefined &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size
                : null,
            id_metal: variant.dataValues.id_metal,
            id_karat:
              variant.dataValues.id_karat &&
                variant.dataValues.id_karat != "" &&
                variant.dataValues.id_karat != null &&
                variant.dataValues.id_karat != undefined &&
                variant.dataValues.id_karat != "undefined" &&
                variant.dataValues.id_karat != "null"
                ? variant.dataValues.id_karat
                : null,
            id_metal_tone: variant.dataValues.id_metal_tone,
            company_info_id: company_info_id?.data,
            product_details: {
              sku: product_details.SKU,
              product_id: product_id,
              metal: product_details.metal_id,
              karat:
                product_details.karat_id &&
                  product_details.karat_id != "" &&
                  product_details.karat_id != null &&
                  product_details.karat_id != undefined &&
                  product_details.karat_id != "undefined" &&
                  product_details.karat_id != "null"
                  ? product_details.karat_id
                  : null,
              metal_tone:
                product_details.metal_tone_id &&
                  product_details.metal_tone_id != "" &&
                  product_details.metal_tone_id != null &&
                  product_details.metal_tone_id != undefined &&
                  product_details.metal_tone_id != "undefined" &&
                  product_details.metal_tone_id != "null"
                  ? product_details.metal_tone_id
                  : null,
              size:
                product_details.size &&
                  product_details.size != null &&
                  product_details.size != "" &&
                  product_details.size != undefined &&
                  product_details.size != "undefined" &&
                  product_details.size != "null"
                  ? product_details.size
                  : null,
              selected_stone_price: product_details.selected_stone_price
                ? product_details.selected_stone_price
                : null,
              image: idImage,
              engraving: product_details.engraving,
              gemstone: product_details.gemstone,
              font_style: product_details.font_style,

            },
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          });
          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              birthStone_product_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }
      }
    } else if (AllProductTypes.Eternity_product == product_type) {
      const product = await ConfigEternityProduct.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });

      if (!(product && product.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      let cartProductExists;
      if (
        user_id &&
        user_id != "null" &&
        user_id != null &&
        user_id != undefined &&
        user_id != "undefined" &&
        user_id != ""
      ) {
        cartProductExists = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: product_id,
            product_type: product_type,
            company_info_id: company_info_id?.data,
            id_metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != "null" &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined"
                ? product_details.metal_tone_id
                : null,
          },
        });
      }

      if (cartProductExists && cartProductExists.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(cartProductExists.dataValues.quantity) + 1,
          },
          { where: { id: cartProductExists.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { eternity_product_id: cartProductExists?.dataValues?.id, quantity: cartProductExists?.quantity },
          new_data: {
            eternity_product_id: cartProductExists?.dataValues?.id, quantity: quantity
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)

      } else if (cartProductExists && cartProductExists.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExists.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }
            );
            idImage = imageResult.dataValues.id;
          }

          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "" &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            quantity: quantity ? quantity : 1,
            product_type: product_type,
            id_size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != undefined &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size
                : null,
            id_metal: product_details.metal_id,
            id_karat:
              product_details.karat_id &&
                product_details.karat_id != "" &&
                product_details.karat_id != null &&
                product_details.karat_id != undefined &&
                product_details.karat_id != "undefined" &&
                product_details.karat_id != "null"
                ? product_details.karat_id
                : null,
            id_metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined" &&
                product_details.metal_tone_id != "null"
                ? product_details.metal_tone_id
                : null,
            company_info_id: company_info_id?.data,
            product_details: {
              sku: product_details.SKU,
              product_id: product_id,
              metal: product_details.metal_id,
              karat:
                product_details.karat_id &&
                  product_details.karat_id != "" &&
                  product_details.karat_id != null &&
                  product_details.karat_id != undefined &&
                  product_details.karat_id != "undefined" &&
                  product_details.karat_id != "null"
                  ? product_details.karat_id
                  : null,
              metal_tone:
                product_details.metal_tone_id &&
                  product_details.metal_tone_id != "" &&
                  product_details.metal_tone_id != null &&
                  product_details.metal_tone_id != undefined &&
                  product_details.metal_tone_id != "undefined" &&
                  product_details.metal_tone_id != "null"
                  ? product_details.metal_tone_id
                  : null,
              size:
                product_details.size &&
                  product_details.size != "" &&
                  product_details.size != undefined &&
                  product_details.size != "undefined" &&
                  product_details.size != null &&
                  product_details.size != "null"
                  ? product_details.size
                  : null,
              image: idImage,
              diamond_type: product.dataValues.dia_type,
              engraving: product_details.engraving,
              font_style: product_details.font_style,

            },
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          });
          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              eternity_product_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }
      }
    } else if (AllProductTypes.BraceletConfigurator == product_type) {
      const product = await ConfigBraceletProduct.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });

      if (!(product && product.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      let cartProductExists;
      if (
        user_id &&
        user_id != "null" &&
        user_id != null &&
        user_id != undefined &&
        user_id != "undefined" &&
        user_id != ""
      ) {
        cartProductExists = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: product_id,
            product_type: product_type,
            company_info_id: company_info_id?.data,
            id_metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != "null" &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined"
                ? product_details.metal_tone_id
                : null,
          },
        });
      }

      if (cartProductExists && cartProductExists.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(cartProductExists.dataValues.quantity) + 1,
          },
          { where: { id: cartProductExists.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { bracelet_configurator_id: cartProductExists?.dataValues?.id, quantity: cartProductExists?.quantity },
          new_data: {
            bracelet_configurator_id: cartProductExists?.dataValues?.id, quantity: quantity
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)
      } else if (cartProductExists && cartProductExists.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExists.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }
            );
            idImage = imageResult.dataValues.id;
          }

          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            quantity: quantity ? quantity : 1,
            product_type: product_type,
            id_size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != undefined &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size
                : null,
            id_metal: product_details.metal_id,
            id_length:
              product_details.length &&
                product_details.length != "" &&
                product_details.length != undefined &&
                product_details.length != "undefined" &&
                product_details.length != null &&
                product_details.length != "null"
                ? product_details.length
                : null,
            id_karat:
              product_details.karat_id &&
                product_details.karat_id != "" &&
                product_details.karat_id != null &&
                product_details.karat_id != undefined &&
                product_details.karat_id != "undefined" &&
                product_details.karat_id != "null"
                ? product_details.karat_id
                : null,
            id_metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined" &&
                product_details.metal_tone_id != "null"
                ? product_details.metal_tone_id
                : null,
            product_details: {
              sku: product_details.SKU,
              product_id: product_id,
              metal: product_details.metal_id,
              karat:
                product_details.karat_id &&
                  product_details.karat_id != "" &&
                  product_details.karat_id != null &&
                  product_details.karat_id != undefined &&
                  product_details.karat_id != "undefined" &&
                  product_details.karat_id != "null"
                  ? product_details.karat_id
                  : null,
              metal_tone:
                product_details.metal_tone_id &&
                  product_details.metal_tone_id != "" &&
                  product_details.metal_tone_id != null &&
                  product_details.metal_tone_id != undefined &&
                  product_details.metal_tone_id != "undefined" &&
                  product_details.metal_tone_id != "null"
                  ? product_details.metal_tone_id
                  : null,
              size:
                product_details.size &&
                  product_details.size != "" &&
                  product_details.size != undefined &&
                  product_details.size != "undefined" &&
                  product_details.size != null &&
                  product_details.size != "null"
                  ? product_details.size
                  : null,
              length:
                product_details.length &&
                  product_details.length != "" &&
                  product_details.length != undefined &&
                  product_details.length != "undefined" &&
                  product_details.length != null &&
                  product_details.length != "null"
                  ? product_details.length
                  : null,
              image: idImage,
              diamond_type: product.dataValues.dia_type,
              engraving: product_details.engraving,
              font_style: product_details.font_style,

            },
            company_info_id: company_info_id?.data,
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          });
          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              bracelet_configurator_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }
      }
    } else if (AllProductTypes.LooseDiamond == product_type) {
      const product = await LooseDiamondGroupMasters.findOne({
        where: { id: product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });
      if (!(product && product.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      let cartProductExit: any;
      if (
        user_id &&
          user_id != "null" &&
          user_id != null &&
          user_id != undefined &&
          user_id != "undefined" &&
          user_id != ""
          ? user_id
          : null
      ) {
        cartProductExit = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: { [Op.eq]: product_id },
            product_type: product_type,
            company_info_id: company_info_id?.data,
          },
        });
      }

      if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(cartProductExit.dataValues.quantity) + 1,
          },
          { where: { id: cartProductExit.dataValues.id } }
        );
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: { loose_diamond_id: cartProductExit?.dataValues?.id, quantity: cartProductExit?.quantity },
          new_data: {
            loose_diamond_id: cartProductExit?.dataValues?.id, quantity: quantity
          }
        }], null, LogsActivityType.QuantityUpdate, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)
      } else if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExit.dataValues
      } else {
        cartData = await CartProducts.create({
          id: id,
          user_id:
            user_id &&
              user_id != "null" &&
              user_id != null &&
              user_id != undefined &&
              user_id != "undefined" &&
              user_id != ""
              ? user_id
              : null,
          product_id: product_id,
          quantity: quantity ? quantity : 1,
          product_type: product_type,
          product_details: product_details,
          company_info_id: company_info_id?.data,
          created_date: getLocalDate(),
          user_ip: IP,
          user_country: country,
          user_location: locationData,
        });

        await addActivityLogs(req, company_info_id?.data, [{
          old_data: null,
          new_data: {
            loose_diamond_id: cartData?.dataValues?.id, data: {
              ...cartData?.dataValues
            }
          }
        }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)

      }
    } else if (AllProductTypes.SettingProduct == product_type) {
      const productExit = await Product.findOne({
        where: {
          id: product_id,
          is_deleted: DeletedStatus.No,
          company_info_id: company_info_id?.data,
          [Op.or]: {
            is_choose_setting: "1",
          },
        },
      });
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      const variant = await ProductMetalOption.findOne({
        where: {
          id: variant_id,
          id_product: product_id,
          company_info_id: company_info_id?.data,
          is_deleted: DeletedStatus.No,
        },
      });

      if (!(variant && variant.dataValues)) {
        return resNotFound({ message: PRODUCT_VARIANT_NOT_FOUND });
      }

      if (
        !(
          product_details.diamond &&
          product_details.diamond.stock_number &&
          product_details.diamond.inventory_type &&
          product_details.diamond.diamond_origin
        )
      ) {
        return resBadRequest({ message: PRODUCT_DIAMOND_DETAILS_IS_REQUIRES });
      }

      if (
        ![
          DIAMOND_INVENTROY_TYPE.Local,
          DIAMOND_INVENTROY_TYPE.VDB,
          DIAMOND_INVENTROY_TYPE.Rapnet,
        ].includes(product_details.diamond.inventory_type)
      ) {
        return resNotFound({
          message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "Diamond inventory"],
          ]),
        });
      }

      if (
        ![DIAMOND_ORIGIN.Natural, DIAMOND_ORIGIN.LabGrown].includes(
          product_details.diamond.diamond_origin
        )
      ) {
        return resNotFound({
          message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "Diamond origin"],
          ]),
        });
      }

      let cartProductExit: any;
      if (
        user_id &&
          user_id != "null" &&
          user_id != null &&
          user_id != undefined &&
          user_id != "undefined" &&
          user_id != ""
          ? user_id
          : null
      ) {
        cartProductExit = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: { [Op.eq]: product_id },
            product_type: product_type,
            company_info_id: company_info_id?.data,
            variant_id: variant_id,
            id_metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != "null"
                ? product_details.metal_tone_id
                : null,
            id_size:
              product_details.size &&
                product_details.size != undefined &&
                product_details.size != "" &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size && product_details.size
                : null,
            id_length:
              product_details.length &&
                product_details.length != undefined &&
                product_details.length != "" &&
                product_details.length != "undefined" &&
                product_details.length != null &&
                product_details.length != "null"
                ? product_details.length && product_details.length
                : null,
            "product_details.diamond.stock_number":
              product_details.diamond.stock_number,
            "product_details.diamond.inventory_type":
              product_details.diamond.inventory_type,
          },
        });
      }

      if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "false") {
        return resUnprocessableEntity({
          message: PRODUCT_ALREADY_EXISTS_IN_CART,
        });
      } else if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExit.dataValues
      } else {
        cartData = await CartProducts.create({
          id: id,
          user_id:
            user_id &&
              user_id != "null" &&
              user_id != null &&
              user_id != undefined &&
              user_id != "undefined" &&
              user_id != ""
              ? user_id
              : null,
          product_id: product_id,
          variant_id: variant_id,
          company_info_id: company_info_id?.data,
          id_metal:
            variant.dataValues.id_metal &&
              variant.dataValues.id_metal != "null" &&
              variant.dataValues.id_metal != null &&
              variant.dataValues.id_metal != undefined &&
              variant.dataValues.id_metal != "undefined" &&
              variant.dataValues.id_metal != ""
              ? variant.dataValues.id_metal
              : null,
          id_karat:
            variant.dataValues.id_karat &&
              variant.dataValues.id_karat != "null" &&
              variant.dataValues.id_karat != null &&
              variant.dataValues.id_karat != undefined &&
              variant.dataValues.id_karat != "undefined" &&
              variant.dataValues.id_karat != ""
              ? variant.dataValues.id_karat
              : null,
          id_size:
            product_details.size &&
              product_details.size != "" &&
              product_details.size != null &&
              product_details.size != "null" &&
              product_details.size != undefined &&
              product_details.size != "undefined"
              ? product_details.size && product_details.size
              : null,
          id_length:
            product_details.length &&
              product_details.length != "" &&
              product_details.length != null &&
              product_details.length != "null" &&
              product_details.length != undefined &&
              product_details.length != "undefined"
              ? product_details.length && product_details.length
              : null,
          id_metal_tone:
            product_details.metal_tone_id &&
              product_details.metal_tone_id != "" &&
              product_details.metal_tone_id != undefined &&
              product_details.metal_tone_id != "undefined" &&
              product_details.metal_tone_id != null &&
              product_details.metal_tone_id != "null"
              ? product_details.metal_tone_id
              : null,
          product_type: AllProductTypes.SettingProduct,
          quantity: quantity ? quantity : 1,
          product_details: {
            sku: product_details.SKU,
            product_id: product_id,
            metal: product_details.metal_id,
            karat:
              product_details.karat_id &&
                product_details.karat_id != "" &&
                product_details.karat_id != null &&
                product_details.karat_id != undefined &&
                product_details.karat_id != "undefined" &&
                product_details.karat_id != "null"
                ? product_details.karat_id
                : null,
            metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined" &&
                product_details.metal_tone_id != "null"
                ? product_details.metal_tone_id
                : null,
            size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != undefined &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size
                : null,
            length:
              product_details.length &&
                product_details.length != "" &&
                product_details.length != undefined &&
                product_details.length != "undefined" &&
                product_details.length != null &&
                product_details.length != "null"
                ? product_details.length
                : null,
            image: product_details.image_id,
            diamond: {
              id: product_details.diamond.id,
              shape: product_details.diamond.shape,
              price: product_details.diamond.price,
              carat: product_details.diamond.carat,
              cut: product_details.diamond.cut,
              color: product_details.diamond.color,
              clarity: product_details.diamond.clarity,
              image_url: product_details.diamond.image_url,
              video_url: product_details.diamond.video_url,
              other_images_url: product_details.diamond.other_images_url,
              lw: product_details.diamond.lw,
              fluor: product_details.diamond.fluor,
              symmetry: product_details.diamond.symmetry,
              table: product_details.diamond.table,
              measurement_length: product_details.diamond.measurement_length,
              measurement_width: product_details.diamond.measurement_width,
              measurement_depth: product_details.diamond.measurement_depth,
              culet: product_details.diamond.culet,
              polish: product_details.diamond.polish,
              girdle: product_details.diamond.girdle,
              depth: product_details.diamond.depth,
              report: product_details.diamond.report,
              stock_number: product_details.diamond.stock_number,
              diamond_origin: product_details.diamond.diamond_origin,
              certificate_url: product_details.diamond.certificate_url,
              inventory_type: product_details.diamond.inventory_type,

            },
            ...product_details
          },
          created_date: getLocalDate(),
          user_ip: IP,
          user_country: country,
          user_location: locationData,
        });
        await addActivityLogs(req, company_info_id?.data, [{
          old_data: null,
          new_data: {
            setting_product_id: cartData?.dataValues?.id, data: {
              ...cartData?.dataValues
            }
          }
        }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)

      }
    } else if (AllProductTypes.StudConfigurator == product_type) {
      const productExist: any = await dbContext.query(
        `
          SELECT * FROM stud_config_products
            WHERE ID = ${product_id} AND COMPANY_INFO_ID = ${company_info_id?.data} AND is_active = '${ActiveStatus.Active}';
        `,
        { type: QueryTypes.SELECT }
      )
      if (productExist.length == 0) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
      let studProductExists;
      if (
        user_id &&
        user_id != "null" &&
        user_id != null &&
        user_id != undefined &&
        user_id != "undefined" &&
        user_id != ""
      ) {

        const where: any[] = [
          { user_id: user_id },
          { product_id: product_id },
          { product_type: product_type },
          { company_info_id: company_info_id?.data },
          {
            id_metal_tone: product_details.metal_tone_id &&
              product_details.metal_tone_id != "" &&
              product_details.metal_tone_id != undefined &&
              product_details.metal_tone_id != "undefined" &&
              product_details.metal_tone_id != null &&
              product_details.metal_tone_id != "null"
              ? product_details.metal_tone_id
              : null
          },
          Sequelize.where(
            Sequelize.literal(`product_details->>'diamond_type'`),
            `${product_details?.diamond_type}`
          )
        ]

        if (product_details?.color !== null && product_details?.color !== '' && product_details?.color !== 'null') {
          where.push(
            Sequelize.where(
              Sequelize.literal(`product_details->>'color'`),
              `${product_details?.color}`
            )
          );
        }
        if (product_details?.clarity !== null && product_details?.clarity !== '' && product_details?.clarity !== 'null') {
          where.push(
            Sequelize.where(
              Sequelize.literal(`product_details->>'clarity'`),
              `${product_details?.clarity}`
            )
          );
        }
        if (product_details?.cut !== null && product_details?.cut !== '' && product_details?.cut !== 'null') {
          where.push(
            Sequelize.where(
              Sequelize.literal(`product_details->>'cut'`),
              `${product_details?.cut}`
            )
          );
        }

        studProductExists = await CartProducts.findOne({
          where: where,
        });
      }

      if (studProductExists && studProductExists.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(studProductExists.dataValues.quantity) + 1,
          },
          { where: { id: studProductExists.dataValues.id } }
        );
      } else if (studProductExists && studProductExists.dataValues && shopNow.toString() == "true") {
        cartData = studProductExists.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }, { transaction: trn }
            );
            idImage = imageResult.dataValues.id;
          }

          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            quantity: quantity ? quantity : 1,
            id_metal:
              product_details.metal_id &&
                product_details.metal_id != "" &&
                product_details.metal_id != undefined &&
                product_details.metal_id != null &&
                product_details.metal_id != "null" &&
                product_details.metal_id != "undefined"
                ? product_details.metal_id
                : null,
            id_karat:
              product_details.karat_id &&
                product_details.karat_id != "" &&
                product_details.karat_id != undefined &&
                product_details.karat_id != "undefined" &&
                product_details.karat_id != null &&
                product_details.karat_id != "null"
                ? product_details.karat_id
                : null,
            id_metal_tone:
              product_details.head_metal_tone_id &&
                product_details.head_metal_tone_id != "" &&
                product_details.head_metal_tone_id != undefined &&
                product_details.head_metal_tone_id != "undefined" &&
                product_details.karat_id != null &&
                product_details.karat_id != "null"
                ? product_details.head_metal_tone_id
                : null,
            product_type: AllProductTypes.StudConfigurator,
            company_info_id: company_info_id?.data,
            product_details: {
              product_id: product_id,
              image: idImage,
              cut: product_details?.cut && product_details?.cut?.length > 0 ? product_details?.cut : null,
              color: product_details?.color && product_details?.color?.length > 0 ? product_details?.color : null,
              clarity: product_details?.clarity && product_details?.clarity?.length > 0 ? product_details?.clarity : null,
              ...product_details
            },
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          }, { transaction: trn });
          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              config_Ring_product_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }
      }
    } else if (AllProductTypes.SingleTreasure == product_type) {
      const productExit = await Product.findOne({
        where: {
          id: product_id,
          is_deleted: DeletedStatus.No,
          company_info_id: company_info_id?.data,
          [Op.or]: {
            is_choose_setting: "1",
          },
        },
      });
      if (!(productExit && productExit.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      const variant = await ProductMetalOption.findOne({
        where: {
          id: variant_id,
          id_product: product_id,
          company_info_id: company_info_id?.data,
          is_deleted: DeletedStatus.No,
        },
      });

      if (!(variant && variant.dataValues)) {
        return resNotFound({ message: PRODUCT_VARIANT_NOT_FOUND });
      }

      if (
        !(
          product_details.diamond &&
          product_details.diamond.stock_number &&
          product_details.diamond.inventory_type &&
          product_details.diamond.diamond_origin
        )
      ) {
        return resBadRequest({ message: PRODUCT_DIAMOND_DETAILS_IS_REQUIRES });
      }

      if (
        ![
          DIAMOND_INVENTROY_TYPE.Local,
          DIAMOND_INVENTROY_TYPE.VDB,
          DIAMOND_INVENTROY_TYPE.Rapnet,
        ].includes(product_details.diamond.inventory_type)
      ) {
        return resNotFound({
          message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "Diamond inventory"],
          ]),
        });
      }

      if (
        ![DIAMOND_ORIGIN.Natural, DIAMOND_ORIGIN.LabGrown].includes(
          product_details.diamond.diamond_origin
        )
      ) {
        return resNotFound({
          message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "Diamond origin"],
          ]),
        });
      }

      let cartProductExit: any;
      if (
        user_id &&
          user_id != "null" &&
          user_id != null &&
          user_id != undefined &&
          user_id != "undefined" &&
          user_id != ""
          ? user_id
          : null
      ) {
        cartProductExit = await CartProducts.findOne({
          where: {
            user_id: user_id,
            product_id: { [Op.eq]: product_id },
            product_type: product_type,
            company_info_id: company_info_id?.data,
            variant_id: variant_id,
            id_metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != "null"
                ? product_details.metal_tone_id
                : null,
            id_size:
              product_details.size &&
                product_details.size != undefined &&
                product_details.size != "" &&
                product_details.size != "undefined" &&
                product_details.size != null &&
                product_details.size != "null"
                ? product_details.size && product_details.size
                : null,
            id_length:
              product_details.length &&
                product_details.length != undefined &&
                product_details.length != "" &&
                product_details.length != "undefined" &&
                product_details.length != null &&
                product_details.length != "null"
                ? product_details.length && product_details.length
                : null,
            "product_details.diamond.stock_number":
              product_details.diamond.stock_number,
            "product_details.diamond.inventory_type":
              product_details.diamond.inventory_type,
          },
        });
      }

      if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "false") {
        return resUnprocessableEntity({
          message: PRODUCT_ALREADY_EXISTS_IN_CART,
        });
      } else if (cartProductExit && cartProductExit.dataValues && shopNow.toString() == "true") {
        cartData = cartProductExit.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }, { transaction: trn }
            );
            idImage = imageResult.dataValues.id;
          }

          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            variant_id: variant_id,
            company_info_id: company_info_id?.data,
            id_metal:
              variant.dataValues.id_metal &&
                variant.dataValues.id_metal != "null" &&
                variant.dataValues.id_metal != null &&
                variant.dataValues.id_metal != undefined &&
                variant.dataValues.id_metal != "undefined" &&
                variant.dataValues.id_metal != ""
                ? variant.dataValues.id_metal
                : null,
            id_karat:
              variant.dataValues.id_karat &&
                variant.dataValues.id_karat != "null" &&
                variant.dataValues.id_karat != null &&
                variant.dataValues.id_karat != undefined &&
                variant.dataValues.id_karat != "undefined" &&
                variant.dataValues.id_karat != ""
                ? variant.dataValues.id_karat
                : null,
            id_size:
              product_details.size &&
                product_details.size != "" &&
                product_details.size != null &&
                product_details.size != "null" &&
                product_details.size != undefined &&
                product_details.size != "undefined"
                ? product_details.size && product_details.size
                : null,
            id_length:
              product_details.length &&
                product_details.length != "" &&
                product_details.length != null &&
                product_details.length != "null" &&
                product_details.length != undefined &&
                product_details.length != "undefined"
                ? product_details.length && product_details.length
                : null,
            id_metal_tone:
              product_details.metal_tone_id &&
                product_details.metal_tone_id != "" &&
                product_details.metal_tone_id != undefined &&
                product_details.metal_tone_id != "undefined" &&
                product_details.metal_tone_id != null &&
                product_details.metal_tone_id != "null"
                ? product_details.metal_tone_id
                : null,
            product_type: AllProductTypes.SingleTreasure,
            quantity: quantity ? quantity : 1,
            product_details: {
              sku: product_details.SKU,
              product_id: product_id,
              metal: product_details.metal_id,
              karat:
                product_details.karat_id &&
                  product_details.karat_id != "" &&
                  product_details.karat_id != null &&
                  product_details.karat_id != undefined &&
                  product_details.karat_id != "undefined" &&
                  product_details.karat_id != "null"
                  ? product_details.karat_id
                  : null,
              metal_tone:
                product_details.metal_tone_id &&
                  product_details.metal_tone_id != "" &&
                  product_details.metal_tone_id != null &&
                  product_details.metal_tone_id != undefined &&
                  product_details.metal_tone_id != "undefined" &&
                  product_details.metal_tone_id != "null"
                  ? product_details.metal_tone_id
                  : null,
              size:
                product_details.size &&
                  product_details.size != "" &&
                  product_details.size != undefined &&
                  product_details.size != "undefined" &&
                  product_details.size != null &&
                  product_details.size != "null"
                  ? product_details.size
                  : null,
              length:
                product_details.length &&
                  product_details.length != "" &&
                  product_details.length != undefined &&
                  product_details.length != "undefined" &&
                  product_details.length != null &&
                  product_details.length != "null"
                  ? product_details.length
                  : null,
              image: idImage,
              diamond: {
                id: product_details.diamond.id,
                shape: product_details.diamond.shape,
                price: product_details.diamond.price,
                carat: product_details.diamond.carat,
                cut: product_details.diamond.cut,
                color: product_details.diamond.color,
                clarity: product_details.diamond.clarity,
                image_url: product_details.diamond.image_url,
                video_url: product_details.diamond.video_url,
                other_images_url: product_details.diamond.other_images_url,
                lw: product_details.diamond.lw,
                fluor: product_details.diamond.fluor,
                symmetry: product_details.diamond.symmetry,
                table: product_details.diamond.table,
                measurement_length: product_details.diamond.measurement_length,
                measurement_width: product_details.diamond.measurement_width,
                measurement_depth: product_details.diamond.measurement_depth,
                culet: product_details.diamond.culet,
                polish: product_details.diamond.polish,
                girdle: product_details.diamond.girdle,
                depth: product_details.diamond.depth,
                report: product_details.diamond.report,
                stock_number: product_details.diamond.stock_number,
                diamond_origin: product_details.diamond.diamond_origin,
                certificate_url: product_details.diamond.certificate_url,
                inventory_type: product_details.diamond.inventory_type,

              },
              ...product_details
            },
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          }, { transaction: trn });
          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              config_Ring_product_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }

        await addActivityLogs(req, company_info_id?.data, [{
          old_data: null,
          new_data: {
            setting_product_id: cartData?.dataValues?.id, data: {
              ...cartData?.dataValues
            }
          }
        }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user)

      }
    } else if (AllProductTypes.PendantConfigurator == product_type) {
      const productExist: any = await dbContext.query(
        `
          SELECT * FROM config_pendant_products
            WHERE ID = ${product_id} AND COMPANY_INFO_ID = ${company_info_id?.data} AND is_active = '${ActiveStatus.Active}' AND is_deleted = '${DeletedStatus.No}';
        `,
        { type: QueryTypes.SELECT }
      )
      if (productExist.length == 0) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
      let pendantProductExists;
      if (
        user_id &&
        user_id != "null" &&
        user_id != null &&
        user_id != undefined &&
        user_id != "undefined" &&
        user_id != ""
      ) {

        const where: any[] = [
          { user_id: user_id },
          { product_id: product_id },
          { product_type: product_type },
          { company_info_id: company_info_id?.data },
          {
            id_metal_tone: product_details.metal_tone_id &&
              product_details.metal_tone_id != "" &&
              product_details.metal_tone_id != undefined &&
              product_details.metal_tone_id != "undefined" &&
              product_details.metal_tone_id != null &&
              product_details.metal_tone_id != "null"
              ? product_details.metal_tone_id
              : null
          },
          Sequelize.where(
            Sequelize.literal(`product_details->>'diamond_type'`),
            `${product_details?.diamond_type}`
          )
        ]

        if (product_details?.color !== null && product_details?.color !== '' && product_details?.color !== 'null') {
          where.push(
            Sequelize.where(
              Sequelize.literal(`product_details->>'color'`),
              `${product_details?.color}`
            )
          );
        }
        if (product_details?.clarity !== null && product_details?.clarity !== '' && product_details?.clarity !== 'null') {
          where.push(
            Sequelize.where(
              Sequelize.literal(`product_details->>'clarity'`),
              `${product_details?.clarity}`
            )
          );
        }
        if (product_details?.cut !== null && product_details?.cut !== '' && product_details?.cut !== 'null') {
          where.push(
            Sequelize.where(
              Sequelize.literal(`product_details->>'cut'`),
              `${product_details?.cut}`
            )
          );
        }

        pendantProductExists = await CartProducts.findOne({
          where: where,
        });
      }

      if (pendantProductExists && pendantProductExists.dataValues && shopNow.toString() == "false") {
        await CartProducts.update(
          {
            quantity: parseInt(pendantProductExists.dataValues.quantity) + 1,
          },
          { where: { id: pendantProductExists.dataValues.id } }
        );
      } else if (pendantProductExists && pendantProductExists.dataValues && shopNow.toString() == "true") {
        cartData = pendantProductExists.dataValues
      } else {
        let imagePath = null;
        if (req.file) {
          const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
            req.file,
            IMAGE_TYPE.ConfigProduct,
            company_info_id?.data,
            req
          );

          if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return moveFileResult;
          }

          imagePath = moveFileResult.data;
        }
        const trn = await (req.body.db_connection).transaction();
        try {
          let idImage = null;
          if (imagePath) {
            const imageResult = await Image.create(
              {
                image_path: imagePath,
                image_type: IMAGE_TYPE.ConfigProduct,
                created_by: req.body.session_res.id_app_user,
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              }, { transaction: trn }
            );
            idImage = imageResult.dataValues.id;
          }

          cartData = await CartProducts.create({
            id: id,
            user_id:
              user_id &&
                user_id != "null" &&
                user_id != null &&
                user_id != undefined &&
                user_id != "undefined" &&
                user_id != ""
                ? user_id
                : null,
            product_id: product_id,
            quantity: quantity ? quantity : 1,
            id_metal:
              product_details.metal_id &&
                product_details.metal_id != "" &&
                product_details.metal_id != undefined &&
                product_details.metal_id != null &&
                product_details.metal_id != "null" &&
                product_details.metal_id != "undefined"
                ? product_details.metal_id
                : null,
            id_karat:
              product_details.karat_id &&
                product_details.karat_id != "" &&
                product_details.karat_id != undefined &&
                product_details.karat_id != "undefined" &&
                product_details.karat_id != null &&
                product_details.karat_id != "null"
                ? product_details.karat_id
                : null,
            id_metal_tone:
              product_details.head_metal_tone_id &&
                product_details.head_metal_tone_id != "" &&
                product_details.head_metal_tone_id != undefined &&
                product_details.head_metal_tone_id != "undefined" &&
                product_details.karat_id != null &&
                product_details.karat_id != "null"
                ? product_details.head_metal_tone_id
                : null,
            product_type: AllProductTypes.PendantConfigurator,
            company_info_id: company_info_id?.data,
            product_details: {
              product_id: product_id,
              image: idImage,
              cut: product_details?.cut && product_details?.cut?.length > 0 ? product_details?.cut : null,
              color: product_details?.color && product_details?.color?.length > 0 ? product_details?.color : null,
              clarity: product_details?.clarity && product_details?.clarity?.length > 0 ? product_details?.clarity : null,
              ...product_details
            },
            created_date: getLocalDate(),
            user_ip: IP,
            user_country: country,
            user_location: locationData,
          }, { transaction: trn });
          await addActivityLogs(req, company_info_id?.data, [{
            old_data: null,
            new_data: {
              config_Ring_product_id: cartData?.dataValues?.id, data: {
                ...cartData?.dataValues
              }
            }
          }], null, LogsActivityType.Add, LogsType.AllProductCart, req?.body?.session_res?.id_app_user, trn)

          await trn.commit();
        } catch (e) {
          await trn.rollback();
          throw e;
        }
      }
    }
    let count;
    if (
      user_id &&
      user_id != "null" &&
      user_id != null &&
      user_id != undefined &&
      user_id != "undefined" &&
      user_id != ""
    ) {
      count = await CartProducts.sum("quantity", {
        where: { user_id: user_id },
      });
    }
    return resSuccess({ data: { cart_data: cartData, count: count } });
  } catch (error) {
    throw error;
  }
};

export const cartAllProductListByUSerId = async (req: Request) => {
  const { user_id } = req.body;
  const { AppUser, CartProducts, MetalTone } = initModels(req);
  try {
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
    });
    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    const metal_tone = await MetalTone.findOne({
      where: { sort_code: WHITE_METAL_TONE_SORT_CODE, company_info_id: company_info_id?.data },
    });

    const cartProductList = await CartProducts.findAll({
      where: { user_id: userExit.dataValues.id, company_info_id: company_info_id?.data },
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
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_title from config_bracelet_products WHERE id = "product_id") ELSE null END`
          ),
          "product_title",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT sku from config_bracelet_products WHERE id = "product_id") ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT slug from config_bracelet_products WHERE id = "product_id") ELSE null END`
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
            ` CASE WHEN (product_details ->> 'length') = 'null' THEN null ELSE(SELECT length FROM items_lengths WHERE id = CAST (product_details ->> 'length' AS integer))END`
          ),
          "product_length",
        ],
        [
          Sequelize.literal(
            ` CASE WHEN (product_details ->> 'length') = 'null' THEN null ELSE CAST (product_details ->> 'length' AS integer)END`
          ),
          "length_id",
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
            `CASE WHEN (product_details ->> 'band_metal_tone') = 'null' THEN null ELSE (SELECT name FROM metal_tones WHERE id = CAST (product_details ->> 'band_metal_tone' AS integer)) END`
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
            ` CAST (product_details ->> 'band_metal_tone' AS integer)`
          ),
          "band_metal_tone_id",
        ],
        [Sequelize.literal(`product_details ->> 'is_band'`), "is_band"],
        [
          Sequelize.literal(
            ` 1+CAST (product_details ->> 'selected_stone_price' AS DECIMAL(12, 1))`
          ),
          "selected_stone_price",
        ],
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Config_Ring_product
            } THEN 
                (SELECT CEIL((CASE WHEN CAST (product_details ->> 'diamond_type' AS integer) = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
          WHEN "product_type" = ${AllProductTypes.Three_stone_config_product
            } THEN 
                (SELECT CEIL((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
                WHEN "product_type" = ${AllProductTypes.Product}
                      THEN (SELECT CASE WHEN products.product_type = ${SingleProductType.VariantType
            } OR (products.product_type = ${SingleProductType.cataLogueProduct
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
                          gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${SingleProductType.VariantType
            } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
                          products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
                          (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
                          products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price)
 WHEN "product_type" = ${AllProductTypes.GiftSet_product
            } THEN (SELECT  CEIL(price)*"cart_products"."quantity" FROM gift_set_products WHERE id = "product_id") 
                WHEN "product_type" = ${AllProductTypes.BirthStone_product
            } THEN (SELECT CEIL(price)*"cart_products"."quantity" FROM  birthstone_products
LEFT JOIN birthstone_product_metal_options AS birthstone_PMO ON id_product = birthstone_products.id 
WHERE birthstone_PMO.id = "variant_id") WHEN "product_type" = ${AllProductTypes.Eternity_product
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
WHERE config_eternity_products.id  = "product_id") WHEN "product_type" = ${AllProductTypes.LooseDiamond
            }
THEN (
    SELECT
    total_price * "cart_products"."quantity"
FROM loose_diamond_group_masters
WHERE loose_diamond_group_masters.is_deleted = '0'
AND loose_diamond_group_masters.id = "product_id"
) WHEN "product_type" = ${AllProductTypes.BraceletConfigurator
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
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct}  THEN 
            (SELECT diamond_shapes.name FROM product_diamond_options 
            LEFT JOIN diamond_group_masters ON diamond_group_masters.id = id_diamond_group
            INNER JOIN diamond_shapes  ON diamond_shapes.id = diamond_group_masters.id_shape
            WHERE id_product = "product_id" ORDER by id_type ASC LIMIT 1) 

            WHEN "product_type" = ${AllProductTypes.Config_Ring_product} OR "product_type" = ${AllProductTypes.Three_stone_config_product} THEN
            (SELECT diamond_shapes.name FROM config_products 
            LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape_id
            WHERE config_products.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN
            (SELECT diamond_shapes.name FROM birthstone_product_diamond_options 
            LEFT JOIN diamond_shapes ON id_shape = diamond_shapes.id
            WHERE id_product = "product_id" AND birthstone_product_diamond_options.is_deleted = '0' ORDER BY id_type ASC LIMIT 1)

            WHEN "product_type" = ${AllProductTypes.Config_band_product} THEN
            (SELECT diamond_shapes.name FROM config_eternity_product_diamonds  
            INNER JOIN diamond_shapes ON diamond_shapes.id = dia_shape
            WHERE config_eternity_product_diamonds.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
            (SELECT diamond_shapes.name FROM config_bracelet_product_diamonds 
            LEFT JOIN diamond_shapes ON diamond_shapes.id = id_shape
            WHERE config_product_id = "product_id" LIMIT 1)
            END)`),
          "diamond_shape",
        ],
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct}  THEN 
            (SELECT categories.category_name FROM product_categories 
            INNER JOIN categories ON categories.id = id_category
            WHERE id_product = "product_id" ORDER BY product_categories.id ASC LIMIT 1) 

            WHEN "product_type" = ${AllProductTypes.Config_Ring_product} OR "product_type" = ${AllProductTypes.Three_stone_config_product} THEN
            'Ring'

            WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN
            (SELECT categories.category_name FROM birthstone_product_categories 
            INNER JOIN categories ON categories.id = id_category
            WHERE id_product = "product_id" ORDER BY birthstone_product_categories.id ASC LIMIT 1)

            WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN
            'Eternity Band'
            WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
            'Bracelet'
            END)`),
          "category",
        ],
        [
          Sequelize.literal(`
            CASE 
              WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN
                (
                  SELECT 
                    CASE  
                      WHEN remaing_quantity_count IS NOT NULL AND remaing_quantity_count > 0 
                      THEN CURRENT_DATE + INTERVAL '${IN_STOCK_PRODUCT_DELIVERY_TIME} days' 
                      ELSE CURRENT_DATE + INTERVAL '${OUT_OF_STOCK_PRODUCT_DELIVERY_TIME} days' 
                    END AS estimated_date 
                  FROM product_metal_options 
                  WHERE id = "variant_id"
                )
              WHEN "product_type" = ${AllProductTypes.Config_Ring_product} 
                OR "product_type" = ${AllProductTypes.Three_stone_config_product} 
                OR "product_type" = ${AllProductTypes.BirthStone_product} 
                OR "product_type" = ${AllProductTypes.Eternity_product} 
                OR "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
                CURRENT_DATE + INTERVAL '${OUT_OF_STOCK_PRODUCT_DELIVERY_TIME} days'
            END
          `),
          "delivery_date",
        ],
      ],
    });

    return resSuccess({ data: cartProductList });
  } catch (error) {
    throw error;
  }
};

export const cartAllWithBirthstoneProductRetailListByUSerId = async (
  req: any
) => {
  const { user_id } = req.body;
  const { AppUser, CartProducts, CouponData, TaxMaster } = initModels(req);
  try {
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const userExit = await AppUser.findOne({
      where: { id: user_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
    });
    if (!(userExit && userExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const cartProductList = await CartProducts.findAll({
      where: { user_id: userExit.dataValues.id },
      order: [["created_date", "DESC"]],
      attributes: [
        "id",
        "user_id",
        "product_type",
        "product_id",
        "quantity",
        "variant_id",
        "product_details",
        "id_coupon",
        [
          Sequelize.literal(
          `CASE WHEN ("product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure}) ANd (product_details ->> 'is_catalogue_design') = 'false' THEN (SELECT product_type FROM products WHERE id = "product_id")  ELSE null END`
        ), "single_product_type"],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_title from config_bracelet_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN (SELECT name from stud_config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN (SELECT name from config_pendant_products WHERE id = "product_id") ELSE null END`
          ),
          "product_title",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT sku from config_bracelet_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN (SELECT sku from stud_config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN (SELECT sku from config_pendant_products WHERE id = "product_id")  ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT slug from config_bracelet_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN (SELECT slug from stud_config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN (SELECT slug from config_pendant_products WHERE id = "product_id")  ELSE null END`
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
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Config_Ring_product
            } THEN 
                (0)

            WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN
                          (
                              WITH UniqueDGM AS (
                                SELECT DISTINCT ON (SD.ID) 
                                  SD.ID AS pendant_dia_id,
                                  DGM.RATE,
                                  SD.DIA_WEIGHT,
                                  DGM.AVERAGE_CARAT,
                                  SD.DIA_COUNT
                                FROM config_pendant_diamonds SD
                                LEFT JOIN DIAMOND_GROUP_MASTERS DGM 
                                  ON DGM.ID_SHAPE = SD.DIA_SHAPE::INTEGER
                                  AND DGM.COMPANY_INFO_ID = ${company_info_id?.data}
                                  AND DGM.MIN_CARAT_RANGE <= SD.DIA_WEIGHT
                                  AND DGM.MAX_CARAT_RANGE >= SD.DIA_WEIGHT
                                  AND DGM.ID_STONE = CAST(PRODUCT_DETAILS ->> 'stone' AS INTEGER)
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'color' IS NULL OR PRODUCT_DETAILS ->> 'color' = '') AND DGM.ID_COLOR IS NULL)
                                    OR DGM.ID_COLOR = CAST(PRODUCT_DETAILS ->> 'color' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'clarity' IS NULL OR PRODUCT_DETAILS ->> 'clarity' = '') AND DGM.ID_CLARITY IS NULL)
                                    OR DGM.ID_CLARITY = CAST(PRODUCT_DETAILS ->> 'clarity' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'cut' IS NULL OR PRODUCT_DETAILS ->> 'cut' = '') AND DGM.ID_CUTS IS NULL)
                                    OR DGM.ID_CUTS = CAST(PRODUCT_DETAILS ->> 'cut' AS INTEGER)
                                  )
                                WHERE SD.pendant_id = "product_id"
                              )
                              SELECT 
                                COALESCE(SUM((U.RATE * COALESCE(U.average_carat, U.DIA_WEIGHT)) * U.DIA_COUNT), 0) +
                                COALESCE(((CASE WHEN PRODUCT_DETAILS ->> 'diamond_type' = '1' THEN CDGM.RATE ELSE CDGM.SYNTHETIC_RATE END) * (CS.VALUE::DOUBLE PRECISION) * CPP.CENTER_DIA_COUNT), 0) +
                                COALESCE(CASE
                                      WHEN SM.KARAT_ID IS NULL THEN
                                          MM.METAL_RATE * SM.METAL_WT + COALESCE(CPP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(CPP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                      ELSE
                                          MM.METAL_RATE / MM.CALCULATE_RATE * GK.CALCULATE_RATE::DOUBLE PRECISION * SM.METAL_WT +
                                          COALESCE(CPP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(CPP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                  END, 0)
                              FROM config_pendant_products CPP
                              LEFT JOIN config_pendant_metals SM ON SM.pendant_id = CPP.ID
                              LEFT JOIN metal_masters MM ON MM.ID = SM.metal_id
                              LEFT JOIN gold_kts GK ON GK.ID = SM.karat_id
                              LEFT JOIN carat_sizes CS ON CS.ID = CPP.CENTER_DIA_WT
                              LEFT JOIN UniqueDGM U ON TRUE
                              LEFT JOIN DIAMOND_GROUP_MASTERS CDGM 
                                ON CDGM.ID = CAST(PRODUCT_DETAILS ->> 'group_id' AS INTEGER)
                              WHERE CPP.ID = "product_id"
                              AND CPP.is_deleted = '${DeletedStatus.No}'
                              AND CPP.is_active = '${ActiveStatus.Active}'
                              AND CPP.company_info_id = ${company_info_id?.data}
                              GROUP BY CPP.ID,
                               CDGM.RATE,
                                CDGM.SYNTHETIC_RATE,
                                cs.value,
                                CPP.LABOUR_CHARGE,
                                CPP.OTHER_CHARGE,
                                MM.METAL_RATE,
                                MM.CALCULATE_RATE,
                                GK.NAME,
                                GK.CALCULATE_RATE,
                                SM.METAL_WT,
                                SM.KARAT_ID,
                                CPP.CENTER_DIA_COUNT
                            )

            WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN
                          (
                              WITH UniqueDGM AS (
                                SELECT DISTINCT ON (SD.ID) 
                                  SD.ID AS stud_dia_id,
                                  DGM.RATE,
                                  SD.DIA_WEIGHT,
                                  DGM.AVERAGE_CARAT,
                                  SD.DIA_COUNT
                                FROM STUD_DIAMONDS SD
                                LEFT JOIN DIAMOND_GROUP_MASTERS DGM 
                                  ON DGM.ID_SHAPE = SD.DIA_SHAPE::INTEGER
                                  AND DGM.COMPANY_INFO_ID = ${company_info_id?.data}
                                  AND DGM.MIN_CARAT_RANGE <= SD.DIA_WEIGHT
                                  AND DGM.MAX_CARAT_RANGE >= SD.DIA_WEIGHT
                                  AND DGM.ID_STONE = CAST(PRODUCT_DETAILS ->> 'stone' AS INTEGER)
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'color' IS NULL OR PRODUCT_DETAILS ->> 'color' = '') AND DGM.ID_COLOR IS NULL)
                                    OR DGM.ID_COLOR = CAST(PRODUCT_DETAILS ->> 'color' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'clarity' IS NULL OR PRODUCT_DETAILS ->> 'clarity' = '') AND DGM.ID_CLARITY IS NULL)
                                    OR DGM.ID_CLARITY = CAST(PRODUCT_DETAILS ->> 'clarity' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'cut' IS NULL OR PRODUCT_DETAILS ->> 'cut' = '') AND DGM.ID_CUTS IS NULL)
                                    OR DGM.ID_CUTS = CAST(PRODUCT_DETAILS ->> 'cut' AS INTEGER)
                                  )
                                WHERE SD.STUD_ID = "product_id"
                              )
                              SELECT 
                                COALESCE(SUM((U.RATE * COALESCE(U.average_carat, U.DIA_WEIGHT)) * U.DIA_COUNT), 0) +
                                COALESCE(((CASE WHEN PRODUCT_DETAILS ->> 'diamond_type' = '1' THEN CDGM.RATE ELSE CDGM.SYNTHETIC_RATE END) * (CS.VALUE::DOUBLE PRECISION) * SCP.CENTER_DIA_COUNT), 0) +
                                COALESCE(CASE
                                      WHEN SM.KARAT_ID IS NULL THEN
                                          MM.METAL_RATE * SM.METAL_WT + COALESCE(SCP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(SCP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                      ELSE
                                          MM.METAL_RATE / MM.CALCULATE_RATE * GK.CALCULATE_RATE::DOUBLE PRECISION * SM.METAL_WT +
                                          COALESCE(SCP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(SCP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                  END, 0)
                              FROM stud_config_products SCP
                              LEFT JOIN stud_metals SM ON SM.stud_id = SCP.ID
                              LEFT JOIN metal_masters MM ON MM.ID = SM.metal_id
                              LEFT JOIN gold_kts GK ON GK.ID = SM.karat_id
                              LEFT JOIN carat_sizes CS ON CS.ID = SCP.CENTER_DIA_WT
                              LEFT JOIN UniqueDGM U ON TRUE
                              LEFT JOIN DIAMOND_GROUP_MASTERS CDGM 
                                ON CDGM.ID = CAST(PRODUCT_DETAILS ->> 'group_id' AS INTEGER)
                              WHERE SCP.ID = "product_id"
                              GROUP BY SCP.ID,
                               CDGM.RATE,
                                CDGM.SYNTHETIC_RATE,
                                cs.value,
                                SCP.LABOUR_CHARGE,
                                SCP.OTHER_CHARGE,
                                MM.METAL_RATE,
                                MM.CALCULATE_RATE,
                                GK.NAME,
                                SM.METAL_WT,
                                SM.KARAT_ID,
                                GK.CALCULATE_RATE,
                                SCP.CENTER_DIA_COUNT
                            )

          WHEN "product_type" = ${AllProductTypes.Three_stone_config_product
            } THEN 
                (0)
                WHEN "product_type" = ${AllProductTypes.Product}
                      THEN (SELECT CASE WHEN products.product_type = ${SingleProductType.VariantType
            } OR (products.product_type = ${SingleProductType.cataLogueProduct
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
                          gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${SingleProductType.cataLogueProduct} OR products.product_type = ${SingleProductType.VariantType
            } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
                          products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
                          (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
                          products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price LIMIT 1)
 WHEN "product_type" = ${AllProductTypes.GiftSet_product
            } THEN (SELECT  CEIL(price)*"cart_products"."quantity" FROM gift_set_products WHERE id = "product_id") 
                WHEN "product_type" = ${AllProductTypes.BirthStone_product
            } THEN (SELECT CEIL(price)*"cart_products"."quantity" FROM  birthstone_products
LEFT JOIN birthstone_product_metal_options AS birthstone_PMO ON id_product = birthstone_products.id 
WHERE birthstone_PMO.id = "variant_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (0)
 WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} 
 THEN (0)
  WHEN "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure}
    THEN (SELECT CASE WHEN products.product_type = ${SingleProductType.VariantType
            } THEN CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN CEIL((COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+PMO.retail_price + PMO.band_metal_price) - PMO.center_diamond_price) *"cart_products"."quantity" ELSE CEIL((COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+PMO.retail_price)- PMO.center_diamond_price)*"cart_products"."quantity" END 
    ELSE  CASE WHEN PMO.id_karat IS NULL
      THEN CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN 
      CEIL(metal_master.metal_rate*(PMO.metal_weight+PMO.band_metal_weight)+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" ELSE 
        CEIL(metal_master.metal_rate*(PMO.metal_weight)+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum(CASE WHEN PDO.is_band IS false THEN ((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count) END), 0)))*"cart_products"."quantity" END ELSE

        CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN

        CEIL(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*(PMO.metal_weight+PMO.band_metal_weight)+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" 
        
        ELSE 

        CEIL(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum(CASE WHEN PDO.is_band IS false THEN ((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count) END), 0)))*"cart_products"."quantity" 

        END

        END END
        FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product =
        products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product =
        products.id AND PDO.is_deleted = '0' AND PDO.id_type = 2 LEFT OUTER JOIN metal_masters
        AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN
        diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN
        gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${SingleProductType.VariantType
            } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
        products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
        ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
        AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
        (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
        products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price, PMO.band_metal_price,PMO.band_metal_weight,PMO.center_diamond_price) ELSE null END)`),
          "product_price",
        ],
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct}  THEN 
            (SELECT diamond_shapes.name FROM product_diamond_options 
            LEFT JOIN diamond_group_masters ON diamond_group_masters.id = id_diamond_group
            INNER JOIN diamond_shapes  ON diamond_shapes.id = diamond_group_masters.id_shape
            WHERE id_product = "product_id" ORDER by id_type ASC LIMIT 1) 

            WHEN "product_type" = ${AllProductTypes.Config_Ring_product} OR "product_type" = ${AllProductTypes.Three_stone_config_product} THEN
            (SELECT diamond_shapes.name FROM config_products 
            LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape_id
            WHERE config_products.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN
            (SELECT diamond_shapes.name FROM birthstone_product_diamond_options 
            LEFT JOIN diamond_shapes ON id_shape = diamond_shapes.id
            WHERE id_product = "product_id" AND birthstone_product_diamond_options.is_deleted = '0' ORDER BY id_type ASC LIMIT 1)

            WHEN "product_type" = ${AllProductTypes.Config_band_product} THEN
            (SELECT diamond_shapes.name FROM config_eternity_product_diamonds  
            INNER JOIN diamond_shapes ON diamond_shapes.id = dia_shape
            WHERE config_eternity_product_diamonds.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN
            (SELECT diamond_shapes.name FROM stud_config_products
            LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape
            WHERE stud_config_products.id = "product_id")
            
            WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN
            (SELECT diamond_shapes.name FROM config_pendant_products
            LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape
            WHERE config_pendant_products.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
            (SELECT diamond_shapes.name FROM config_bracelet_product_diamonds 
            LEFT JOIN diamond_shapes ON diamond_shapes.id = id_shape
            WHERE config_product_id = "product_id" LIMIT 1)
            END)`),
          "diamond_shape",
        ],
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct}  THEN 
            (SELECT categories.category_name FROM product_categories 
            INNER JOIN categories ON categories.id = id_category
            WHERE id_product = "product_id" ORDER BY product_categories.id ASC LIMIT 1) 

            WHEN "product_type" = ${AllProductTypes.Config_Ring_product} OR "product_type" = ${AllProductTypes.Three_stone_config_product} THEN
            'Ring'
            
            WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN
            'Earring'

            WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN
            'Pendant'

            WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN
            (SELECT categories.category_name FROM birthstone_product_categories 
            INNER JOIN categories ON categories.id = id_category
            WHERE id_product = "product_id" ORDER BY birthstone_product_categories.id ASC LIMIT 1)

            WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN
            'Eternity Band'
            WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
            'Bracelet'
            END)`),
          "category",
        ],
        [
          Sequelize.literal(`
            CASE 
              WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN
                (
                  SELECT 
                    CASE  
                      WHEN remaing_quantity_count IS NOT NULL AND remaing_quantity_count > 0 
                      THEN CURRENT_DATE + INTERVAL '${IN_STOCK_PRODUCT_DELIVERY_TIME} days' 
                      ELSE CURRENT_DATE + INTERVAL '${OUT_OF_STOCK_PRODUCT_DELIVERY_TIME} days' 
                    END AS estimated_date 
                  FROM product_metal_options 
                  WHERE id = "variant_id"
                )
              WHEN "product_type" = ${AllProductTypes.Config_Ring_product} 
                OR "product_type" = ${AllProductTypes.Three_stone_config_product} 
                OR "product_type" = ${AllProductTypes.BirthStone_product} 
                OR "product_type" = ${AllProductTypes.Eternity_product} 
                OR "product_type" = ${AllProductTypes.StudConfigurator} 
                OR "product_type" = ${AllProductTypes.PendantConfigurator} 
                OR "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
                CURRENT_DATE + INTERVAL '${OUT_OF_STOCK_PRODUCT_DELIVERY_TIME} days'
            END
          `),
          "delivery_date",
        ],
        [Sequelize.literal(`'0'`), "diamond_price"],
        [Sequelize.literal(`null`), "diamond_details"],
      ],
    });

    const cartProductListNew = []
        for (let index = 0; index < cartProductList.length; index++) {
          const element = cartProductList[index];
          
          let data = element
          let price = 0
          if (data.dataValues.product_type === AllProductTypes.Config_Ring_product) {
           price = (await getRingConfigProductPriceForCart(req, data.dataValues.product_id, data.dataValues.is_band))* element.dataValues.quantity
          } else if (data.dataValues.product_type === AllProductTypes.Three_stone_config_product) {
            price = (await getThreeStoneConfigProductPriceForCart(req, data.dataValues.product_id, data.dataValues.is_band)) * element.dataValues.quantity
          } else if (data.dataValues.product_type === AllProductTypes.Eternity_product) {
            price = (await getEternityConfigProductPrice(req, data.dataValues.product_id)) * element.dataValues.quantity
          } else if (data.dataValues.product_type === AllProductTypes.BraceletConfigurator) {
            price = (await getBraceletConfigProductPrice(req, data.dataValues.product_id)) * element.dataValues.quantity
          } else {
            price = data.dataValues.product_price
          } 
          cartProductListNew.push({...data, dataValues: {...data.dataValues, product_price: price, single_product_type: data.dataValues.single_product_type } })
        }
    
        if (cartProductListNew.length === 0) {
              return resSuccess({
                data: {
                  cart_count: 0,
                  discount_amount: "0",
                  sub_total: "0",
                  coupon: null,
                  tax: null,
                  total_tax_amount: "0",
                  cart_total: "0",
                  cart_list: [],
                },
              });
        }
    let amountList = []
    for (let index = 0; index < cartProductListNew.length; index++) {
      const element = cartProductListNew[index];
      const productType = await getProductTypeForPriceCorrection(element.dataValues.product_type, element.dataValues.single_product_type)
      const price = await formatPriceWithoutSeparator(element.dataValues.product_price, company_info_id?.data, productType, req)
      amountList.push(price)
    }
    let amount = await amountList.reduce((accumulator: any, currentValue) => {
      return accumulator + currentValue;
    }, 0);
    const cart_list_count = await CartProducts.sum("quantity", {
      where: { user_id: user_id },
    });
    const applyDiscount = await applyOfferWithBuyNewOneGetOne(req,
      {
        discount_amount: 0,
        sub_total: amount,
        cart_list: cartProductListNew,
        cart_total_quantity: cart_list_count
      },
      company_info_id?.data
    )

     let cartProducts = []
    for (let index = 0; index < applyDiscount.data.cart_list.length; index++) {
      const element = applyDiscount.data.cart_list[index];
      const productType = await getProductTypeForPriceCorrection(element.product_type, element.single_product_type)
           cartProducts.push({
          ...element,
              product_price: await req.formatPrice(element.product_price + Number(element?.product_details?.diamond?.price || 0),productType),
          after_discount_product_price: await req.formatPrice(element.after_discount_product_price + Number(element?.product_details?.diamond?.price || 0),productType),
        })
    }

    amount = applyDiscount.data.cart_list
      .map((item: any) => parseFloat(item.after_discount_product_price + Number(item?.product_details?.diamond?.price || 0)))
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);

    const findCoupon = await CouponData.findOne({
      where: {
        id: cartProductList[0].dataValues.id_coupon,
        is_deleted: DeletedStatus.No,
        company_info_id: company_info_id?.data,
      },
    });
    let discount: any = 0;

    if (findCoupon && findCoupon.dataValues) {
      if (
        findCoupon.dataValues.discount_type ==
        COUPON_DISCOUNT_TYPE.PercentageDiscount
      ) {
        // Calculate percentage discount
        discount = (
          (findCoupon.dataValues.percentage_off / 100) * amount
        ).toFixed(2);
      } else if (
        findCoupon.dataValues.discount_type ==
        COUPON_DISCOUNT_TYPE.FixedAmountDiscount
      ) {
        discount = (findCoupon.dataValues.discount_amount).toFixed(2);
      }

      if (
        findCoupon.dataValues.maximum_discount_amount &&
        findCoupon.dataValues.maximum_discount_amount < discount
      ) {
        discount = Number(findCoupon.dataValues.maximum_discount_amount).toFixed(2);
      }
    }

    const discountedAmount: any = Math.max(amount - discount, 0);

    let orderDiscount = applyDiscount.data.orderDiscount || 0;
    const orderDiscountedAmount: any = Math.max(discountedAmount - orderDiscount, 0);

    const taxValues = await TaxMaster.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
    });
    let productTaxAmount: any;
    let productTax: any;
    let allTax = [];
    let taxRateData = [];
    for (const taxData of taxValues) {
      productTax = taxData.dataValues.rate / 100;
      productTaxAmount = orderDiscountedAmount * productTax;

      taxRateData.push({
        rate: taxData.dataValues.rate,
        tax_amount: await req.formatPriceForFloatValue(productTaxAmount),
        name: taxData.dataValues.name,
      });
      allTax.push(Number(productTaxAmount).toFixed(2));
    }


    const sumTotal = allTax.reduce((accumulator, currentValue) => {
      return Number(accumulator) + Number(currentValue);
    }, 0);

    const totalOrderAmount = orderDiscountedAmount + (sumTotal);


    let shippingChargeValue: any = 0;
    let shippingChargeWithoutFormate: any = 0;
    const shippingCharge = await applyShippingCharge(req.body.db_connection, amount, req?.query);
    if (shippingCharge.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      shippingChargeValue = 0;
      shippingChargeWithoutFormate = 0
    } else {
      shippingChargeValue = await req.formatPriceForFloatValue(
        shippingCharge.data.shipping_charge
      );
      shippingChargeWithoutFormate = shippingCharge.data.shipping_charge
    }
    return resSuccess({
      data: {
        cart_count: cart_list_count,
        discount_amount: await req.formatPriceForFloatValue(discount),
        order_discount_amount: await req.formatPriceForFloatValue(orderDiscount),
        sub_total: await req.formatPrice(amount,null),
        shipping_charge: shippingChargeValue || "0",
        order_offer_detail: applyDiscount.data.appliedOrderOffers,
        coupon: {
          id: findCoupon?.dataValues?.id,
          name: findCoupon?.dataValues?.name,
          code: findCoupon?.dataValues?.coupon_code,
          description: findCoupon?.dataValues?.description,
        },
        tax: taxRateData,
        total_tax_amount: await req.formatPrice(sumTotal, null),
        cart_total: await req.formatPrice(
          totalOrderAmount + shippingChargeWithoutFormate,null),
        cart_list: cartProducts,
      },
    });
  } catch (error) {
    throw error;
  }
};

/* ------------------------ get cart product list for shop now --------------------- */
export const getShopNowCartList = async (
  req: any
) => {
  const { cart_ids } = req.params;
  const { CartProducts, CouponData, TaxMaster } = initModels(req);
  try {
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    
    const cartProductList = await CartProducts.findAll({
      where: { id: cart_ids.split(","), company_info_id: company_info_id?.data },
      order: [["created_date", "DESC"]],
      attributes: [
        "id",
        "user_id",
        "product_type",
        "product_id",
        "quantity",
        "variant_id",
        "product_details",
        "id_coupon",
        [
          Sequelize.literal(
          `CASE WHEN ("product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure}) ANd (product_details ->> 'is_catalogue_design') = 'false' THEN (SELECT product_type FROM products WHERE id = "product_id")  ELSE null END`
        ), "single_product_type"],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT name FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_title from config_bracelet_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN (SELECT name from stud_config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN (SELECT name from config_pendant_products WHERE id = "product_id") ELSE null END`
          ),
          "product_title",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT sku from config_bracelet_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN (SELECT sku from stud_config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN (SELECT sku from config_pendant_products WHERE id = "product_id") ELSE null END`
          ),
          "product_sku",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN (SELECT slug from config_bracelet_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN (SELECT slug from stud_config_products WHERE id = "product_id") WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN (SELECT slug from config_pendant_products WHERE id = "product_id") ELSE null END`
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
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Config_Ring_product
            } THEN 
                (SELECT CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN with_band_price * "cart_products"."quantity" ELSE without_band_price * "cart_products"."quantity" END FROM ring_three_stone_configurator_price_view WHERE id = "product_id")

            WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN
                          (
                              WITH UniqueDGM AS (
                                SELECT DISTINCT ON (SD.ID) 
                                  SD.ID AS pendant_dia_id,
                                  DGM.RATE,
                                  SD.DIA_WEIGHT,
                                  DGM.AVERAGE_CARAT,
                                  SD.DIA_COUNT
                                FROM config_pendant_diamonds SD
                                LEFT JOIN DIAMOND_GROUP_MASTERS DGM 
                                  ON DGM.ID_SHAPE = SD.DIA_SHAPE::INTEGER
                                  AND DGM.COMPANY_INFO_ID = ${company_info_id?.data}
                                  AND DGM.MIN_CARAT_RANGE <= SD.DIA_WEIGHT
                                  AND DGM.MAX_CARAT_RANGE >= SD.DIA_WEIGHT
                                  AND DGM.ID_STONE = CAST(PRODUCT_DETAILS ->> 'stone' AS INTEGER)
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'color' IS NULL OR PRODUCT_DETAILS ->> 'color' = '') AND DGM.ID_COLOR IS NULL)
                                    OR DGM.ID_COLOR = CAST(PRODUCT_DETAILS ->> 'color' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'clarity' IS NULL OR PRODUCT_DETAILS ->> 'clarity' = '') AND DGM.ID_CLARITY IS NULL)
                                    OR DGM.ID_CLARITY = CAST(PRODUCT_DETAILS ->> 'clarity' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'cut' IS NULL OR PRODUCT_DETAILS ->> 'cut' = '') AND DGM.ID_CUTS IS NULL)
                                    OR DGM.ID_CUTS = CAST(PRODUCT_DETAILS ->> 'cut' AS INTEGER)
                                  )
                                WHERE SD.pendant_id = "product_id"
                              )
                              SELECT 
                                COALESCE(SUM((U.RATE * COALESCE(U.average_carat, U.DIA_WEIGHT)) * U.DIA_COUNT), 0) +
                                COALESCE(((CASE WHEN PRODUCT_DETAILS ->> 'diamond_type' = '1' THEN CDGM.RATE ELSE CDGM.SYNTHETIC_RATE END) * (CS.VALUE::DOUBLE PRECISION) * CPP.CENTER_DIA_COUNT), 0) +
                                COALESCE(CASE
                                      WHEN SM.KARAT_ID IS NULL THEN
                                          MM.METAL_RATE * SM.METAL_WT + COALESCE(CPP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(CPP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                      ELSE
                                          MM.METAL_RATE / MM.CALCULATE_RATE * GK.CALCULATE_RATE::DOUBLE PRECISION * SM.METAL_WT +
                                          COALESCE(CPP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(CPP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                  END, 0)
                              FROM config_pendant_products CPP
                              LEFT JOIN config_pendant_metals SM ON SM.pendant_id = CPP.ID
                              LEFT JOIN metal_masters MM ON MM.ID = SM.metal_id
                              LEFT JOIN gold_kts GK ON GK.ID = SM.karat_id
                              LEFT JOIN carat_sizes CS ON CS.ID = CPP.CENTER_DIA_WT
                              LEFT JOIN UniqueDGM U ON TRUE
                              LEFT JOIN DIAMOND_GROUP_MASTERS CDGM 
                                ON CDGM.ID = CAST(PRODUCT_DETAILS ->> 'group_id' AS INTEGER)
                              WHERE CPP.ID = "product_id"
                              AND CPP.is_deleted = '${DeletedStatus.No}'
                              AND CPP.is_active = '${ActiveStatus.Active}'
                              AND CPP.company_info_id = ${company_info_id?.data}
                              GROUP BY CPP.ID,
                               CDGM.RATE,
                                CDGM.SYNTHETIC_RATE,
                                cs.value,
                                CPP.LABOUR_CHARGE,
                                CPP.OTHER_CHARGE,
                                MM.METAL_RATE,
                                MM.CALCULATE_RATE,
                                GK.NAME,
                                GK.CALCULATE_RATE,
                                SM.METAL_WT,
                                SM.KARAT_ID,
                                CPP.CENTER_DIA_COUNT
                            )

                WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN
              (
                              WITH UniqueDGM AS (
                                SELECT DISTINCT ON (SD.ID) 
                                  SD.ID AS stud_dia_id,
                                  DGM.RATE,
                                  SD.DIA_WEIGHT,
                                  DGM.AVERAGE_CARAT,
                                  SD.DIA_COUNT
                                FROM STUD_DIAMONDS SD
                                LEFT JOIN DIAMOND_GROUP_MASTERS DGM 
                                  ON DGM.ID_SHAPE = SD.DIA_SHAPE::INTEGER
                                  AND DGM.COMPANY_INFO_ID = ${company_info_id?.data}
                                  AND DGM.MIN_CARAT_RANGE <= SD.DIA_WEIGHT
                                  AND DGM.MAX_CARAT_RANGE >= SD.DIA_WEIGHT
                                  AND DGM.ID_STONE = CAST(PRODUCT_DETAILS ->> 'stone' AS INTEGER)
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'color' IS NULL OR PRODUCT_DETAILS ->> 'color' = '') AND DGM.ID_COLOR IS NULL)
                                    OR DGM.ID_COLOR = CAST(PRODUCT_DETAILS ->> 'color' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'clarity' IS NULL OR PRODUCT_DETAILS ->> 'clarity' = '') AND DGM.ID_CLARITY IS NULL)
                                    OR DGM.ID_CLARITY = CAST(PRODUCT_DETAILS ->> 'clarity' AS INTEGER)
                                  )
                                  AND (
                                    ((PRODUCT_DETAILS ->> 'cut' IS NULL OR PRODUCT_DETAILS ->> 'cut' = '') AND DGM.ID_CUTS IS NULL)
                                    OR DGM.ID_CUTS = CAST(PRODUCT_DETAILS ->> 'cut' AS INTEGER)
                                  )
                                WHERE SD.STUD_ID = "product_id"
                              )
                              SELECT 
                                COALESCE(SUM((U.RATE * COALESCE(U.average_carat, U.DIA_WEIGHT)) * U.DIA_COUNT), 0) +
                                COALESCE(((CASE WHEN PRODUCT_DETAILS ->> 'diamond_type' = '1' THEN CDGM.RATE ELSE CDGM.SYNTHETIC_RATE END) * (CS.VALUE::DOUBLE PRECISION) * SCP.CENTER_DIA_COUNT), 0) +
                                COALESCE(CASE
                                      WHEN SM.KARAT_ID IS NULL THEN
                                          MM.METAL_RATE * SM.METAL_WT + COALESCE(SCP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(SCP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                      ELSE
                                          MM.METAL_RATE / MM.CALCULATE_RATE * GK.CALCULATE_RATE::DOUBLE PRECISION * SM.METAL_WT +
                                          COALESCE(SCP.LABOUR_CHARGE, 0::DOUBLE PRECISION) + COALESCE(SCP.OTHER_CHARGE, 0::DOUBLE PRECISION)
                                  END, 0)
                              FROM stud_config_products SCP
                              LEFT JOIN stud_metals SM ON SM.stud_id = SCP.ID
                              LEFT JOIN metal_masters MM ON MM.ID = SM.metal_id
                              LEFT JOIN gold_kts GK ON GK.ID = SM.karat_id
                              LEFT JOIN carat_sizes CS ON CS.ID = SCP.CENTER_DIA_WT
                              LEFT JOIN UniqueDGM U ON TRUE
                              LEFT JOIN DIAMOND_GROUP_MASTERS CDGM 
                                ON CDGM.ID = CAST(PRODUCT_DETAILS ->> 'group_id' AS INTEGER)
                              WHERE SCP.ID = "product_id"
                              GROUP BY SCP.ID,
                               CDGM.RATE,
                                CDGM.SYNTHETIC_RATE,
                                cs.value,
                                SCP.LABOUR_CHARGE,
                                SCP.OTHER_CHARGE,
                                MM.METAL_RATE,
                                MM.CALCULATE_RATE,
                                GK.NAME,
                                SM.METAL_WT,
                                SM.KARAT_ID,
                                GK.CALCULATE_RATE,
                                SCP.CENTER_DIA_COUNT
                            )

          WHEN "product_type" = ${AllProductTypes.Three_stone_config_product
            } THEN 
                (0)
                WHEN "product_type" = ${AllProductTypes.Product}
                      THEN (SELECT CASE WHEN products.product_type = ${SingleProductType.VariantType
            } OR (products.product_type = ${SingleProductType.cataLogueProduct
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
                          gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${SingleProductType.cataLogueProduct} OR products.product_type = ${SingleProductType.VariantType
            } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
                          products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                          AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
                          (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
                          products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price LIMIT 1)
 WHEN "product_type" = ${AllProductTypes.GiftSet_product
            } THEN (SELECT  CEIL(price)*"cart_products"."quantity" FROM gift_set_products WHERE id = "product_id") 
                WHEN "product_type" = ${AllProductTypes.BirthStone_product
            } THEN (SELECT CEIL(price)*"cart_products"."quantity" FROM  birthstone_products
LEFT JOIN birthstone_product_metal_options AS birthstone_PMO ON id_product = birthstone_products.id 
WHERE birthstone_PMO.id = "variant_id") WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN (0)
 WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} 
 THEN (0)
  WHEN "product_type" = ${AllProductTypes.SettingProduct} OR "product_type" = ${AllProductTypes.SingleTreasure}
    THEN (SELECT CASE WHEN products.product_type = ${SingleProductType.VariantType
            } THEN CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN CEIL((COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+PMO.retail_price + PMO.band_metal_price) - PMO.center_diamond_price) *"cart_products"."quantity" ELSE CEIL((COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+PMO.retail_price)- PMO.center_diamond_price)*"cart_products"."quantity" END 
    ELSE  CASE WHEN PMO.id_karat IS NULL
      THEN CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN 
      CEIL(metal_master.metal_rate*(PMO.metal_weight+PMO.band_metal_weight)+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" ELSE 
        CEIL(metal_master.metal_rate*(PMO.metal_weight)+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum(CASE WHEN PDO.is_band IS false THEN ((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count) END), 0)))*"cart_products"."quantity" END ELSE

        CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN

        CEIL(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*(PMO.metal_weight+PMO.band_metal_weight)+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" 
        
        ELSE 

        CEIL(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight+COALESCE(making_charge, 0)+COALESCE(finding_charge, 0)+COALESCE(other_charge, 0)+
        (COALESCE(sum(CASE WHEN PDO.is_band IS false THEN ((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count) END), 0)))*"cart_products"."quantity" 

        END

        END END
        FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product =
        products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product =
        products.id AND PDO.is_deleted = '0' AND PDO.id_type = 2 LEFT OUTER JOIN metal_masters
        AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN
        diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN
        gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${SingleProductType.VariantType
            } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
        products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
        ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
        AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
        (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
        products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price, PMO.band_metal_price,PMO.band_metal_weight,PMO.center_diamond_price) ELSE null END)`),
          "product_price",
        ],
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct}  THEN 
            (SELECT diamond_shapes.name FROM product_diamond_options 
            LEFT JOIN diamond_group_masters ON diamond_group_masters.id = id_diamond_group
            INNER JOIN diamond_shapes  ON diamond_shapes.id = diamond_group_masters.id_shape
            WHERE id_product = "product_id" ORDER by id_type ASC LIMIT 1) 

            WHEN "product_type" = ${AllProductTypes.Config_Ring_product} OR "product_type" = ${AllProductTypes.Three_stone_config_product} THEN
            (SELECT diamond_shapes.name FROM config_products 
            LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape_id
            WHERE config_products.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN
            (SELECT diamond_shapes.name FROM birthstone_product_diamond_options 
            LEFT JOIN diamond_shapes ON id_shape = diamond_shapes.id
            WHERE id_product = "product_id" AND birthstone_product_diamond_options.is_deleted = '0' ORDER BY id_type ASC LIMIT 1)

            WHEN "product_type" = ${AllProductTypes.Config_band_product} THEN
            (SELECT diamond_shapes.name FROM config_eternity_product_diamonds  
            INNER JOIN diamond_shapes ON diamond_shapes.id = dia_shape
            WHERE config_eternity_product_diamonds.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN
            (SELECT diamond_shapes.name FROM stud_config_products
            LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape
            WHERE stud_config_products.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN
            (SELECT diamond_shapes.name FROM config_pendant_products
            LEFT JOIN diamond_shapes ON diamond_shapes.id = center_dia_shape
            WHERE config_pendant_products.id = "product_id")

            WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
            (SELECT diamond_shapes.name FROM config_bracelet_product_diamonds 
            LEFT JOIN diamond_shapes ON diamond_shapes.id = id_shape
            WHERE config_product_id = "product_id" LIMIT 1)
            END)`),
          "diamond_shape",
        ],
        [
          Sequelize.literal(`(CASE WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct}  THEN 
            (SELECT categories.category_name FROM product_categories 
            INNER JOIN categories ON categories.id = id_category
            WHERE id_product = "product_id" ORDER BY product_categories.id ASC LIMIT 1) 

            WHEN "product_type" = ${AllProductTypes.Config_Ring_product} OR "product_type" = ${AllProductTypes.Three_stone_config_product} THEN
            'Ring'
            
            WHEN "product_type" = ${AllProductTypes.StudConfigurator} THEN
            'Earring'

            WHEN "product_type" = ${AllProductTypes.PendantConfigurator} THEN
            'Pendant'

            WHEN "product_type" = ${AllProductTypes.BirthStone_product} THEN
            (SELECT categories.category_name FROM birthstone_product_categories 
            INNER JOIN categories ON categories.id = id_category
            WHERE id_product = "product_id" ORDER BY birthstone_product_categories.id ASC LIMIT 1)

            WHEN "product_type" = ${AllProductTypes.Eternity_product} THEN
            'Eternity Band'
            WHEN "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
            'Bracelet'
            END)`),
          "category",
        ],
        [
          Sequelize.literal(`
            CASE 
              WHEN "product_type" = ${AllProductTypes.Product} OR "product_type" = ${AllProductTypes.SettingProduct} THEN
                (
                  SELECT 
                    CASE  
                      WHEN remaing_quantity_count IS NOT NULL AND remaing_quantity_count > 0 
                      THEN CURRENT_DATE + INTERVAL '${IN_STOCK_PRODUCT_DELIVERY_TIME} days' 
                      ELSE CURRENT_DATE + INTERVAL '${OUT_OF_STOCK_PRODUCT_DELIVERY_TIME} days' 
                    END AS estimated_date 
                  FROM product_metal_options 
                  WHERE id = "variant_id"
                )
              WHEN "product_type" = ${AllProductTypes.Config_Ring_product} 
                OR "product_type" = ${AllProductTypes.Three_stone_config_product} 
                OR "product_type" = ${AllProductTypes.BirthStone_product} 
                OR "product_type" = ${AllProductTypes.Eternity_product} 
                OR "product_type" = ${AllProductTypes.StudConfigurator} 
                OR "product_type" = ${AllProductTypes.PendantConfigurator} 
                OR "product_type" = ${AllProductTypes.BraceletConfigurator} THEN
                CURRENT_DATE + INTERVAL '${OUT_OF_STOCK_PRODUCT_DELIVERY_TIME} days'
            END
          `),
          "delivery_date",
        ],
        [Sequelize.literal(`'0'`), "diamond_price"],
        [Sequelize.literal(`null`), "diamond_details"],
      ],
    });

    const cartProductListNew = []
        for (let index = 0; index < cartProductList.length; index++) {
          const element = cartProductList[index];
          
          let data = element
          let price = 0
          if (data.dataValues.product_type === AllProductTypes.Config_Ring_product) {
           price = (await getRingConfigProductPriceForCart(req, data.dataValues.product_id, data.dataValues.is_band))* element.dataValues.quantity
          } else if (data.dataValues.product_type === AllProductTypes.Three_stone_config_product) {
            price = (await getThreeStoneConfigProductPriceForCart(req, data.dataValues.product_id, data.dataValues.is_band)) * element.dataValues.quantity
          } else if (data.dataValues.product_type === AllProductTypes.Eternity_product) {
            price = (await getEternityConfigProductPrice(req, data.dataValues.product_id)) * element.dataValues.quantity
          } else if (data.dataValues.product_type === AllProductTypes.BraceletConfigurator) {
            price = (await getBraceletConfigProductPrice(req, data.dataValues.product_id)) * element.dataValues.quantity
          } else {
            price = data.dataValues.product_price
          } 
          cartProductListNew.push({...data, dataValues: {...data.dataValues, product_price: price, single_product_type: data.dataValues.single_product_type } })
        }
    
        if (cartProductListNew.length === 0) {
              return resSuccess({
                data: {
                  cart_count: 0,
                  discount_amount: "0",
                  sub_total: "0",
                  coupon: null,
                  tax: null,
                  total_tax_amount: "0",
                  cart_total: "0",
                  cart_list: [],
                },
              });
        }
    let amountList = []
    for (let index = 0; index < cartProductListNew.length; index++) {
      const element = cartProductListNew[index];
      const productType = await getProductTypeForPriceCorrection(element.dataValues.product_type, element.dataValues.single_product_type)
      const price = await formatPriceWithoutSeparator(element.dataValues.product_price, company_info_id?.data, productType, req)
      amountList.push(price)
    }
    let amount = await amountList.reduce((accumulator: any, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    const cart_list_count = await CartProducts.sum("quantity", {
      where: { id: cart_ids.split(","), company_info_id: company_info_id?.data }
    });
    const applyDiscount = await applyOfferWithBuyNewOneGetOne(req,
      {
        discount_amount: 0,
        sub_total: amount,
        cart_list: cartProductListNew,
        cart_total_quantity: cart_list_count
      },
      company_info_id?.data
    )

    let cartProducts = []
    for (let index = 0; index < applyDiscount.data.cart_list.length; index++) {
      const element = applyDiscount.data.cart_list[index];
      const productType = await getProductTypeForPriceCorrection(element.product_type, element.single_product_type)
           cartProducts.push({
          ...element,
              product_price: await req.formatPrice(element.product_price + Number(element?.product_details?.diamond?.price || 0),productType),
          after_discount_product_price: await req.formatPrice(element.after_discount_product_price + Number(element?.product_details?.diamond?.price || 0),productType),
        })
    }

    amount = applyDiscount.data.cart_list
      .map((item: any) => parseFloat(item.after_discount_product_price + Number(item?.product_details?.diamond?.price || 0)))
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);

    const findCoupon = await CouponData.findOne({
      where: {
        id: cartProductList[0].dataValues.id_coupon,
        is_deleted: DeletedStatus.No,
        company_info_id: company_info_id?.data,
      },
    });
    let discount: any = 0;

    if (findCoupon && findCoupon.dataValues) {
      if (
        findCoupon.dataValues.discount_type ==
        COUPON_DISCOUNT_TYPE.PercentageDiscount
      ) {
        // Calculate percentage discount
        discount = (
          (findCoupon.dataValues.percentage_off / 100) * amount
        ).toFixed(2);
      } else if (
        findCoupon.dataValues.discount_type ==
        COUPON_DISCOUNT_TYPE.FixedAmountDiscount
      ) {
        discount = (findCoupon.dataValues.discount_amount).toFixed(2);
      }

      if (
        findCoupon.dataValues.maximum_discount_amount &&
        findCoupon.dataValues.maximum_discount_amount < discount
      ) {
        discount = Number(findCoupon.dataValues.maximum_discount_amount).toFixed(2);
      }
    }

    const discountedAmount: any = Math.max(amount - discount, 0);

    let orderDiscount = applyDiscount.data.orderDiscount || 0;
    const orderDiscountedAmount: any = Math.max(discountedAmount - orderDiscount, 0);

    const taxValues = await TaxMaster.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
    });
    let productTaxAmount: any;
    let productTax: any;
    let allTax = [];
    let taxRateData = [];
    for (const taxData of taxValues) {
      productTax = taxData.dataValues.rate / 100;
      productTaxAmount = orderDiscountedAmount * productTax;

      taxRateData.push({
        rate: taxData.dataValues.rate,
        tax_amount: await req.formatPriceForFloatValue(productTaxAmount),
        name: taxData.dataValues.name,
      });
      allTax.push(Number(productTaxAmount).toFixed(2));
    }


    const sumTotal = allTax.reduce((accumulator, currentValue) => {
      return Number(accumulator) + Number(currentValue);
    }, 0);

    const totalOrderAmount = orderDiscountedAmount + (sumTotal);

    let shippingChargeValue: any = 0;
    let shippingChargeWithoutFormate: any = 0;
    const shippingCharge = await applyShippingCharge(req.body.db_connection, amount, req?.query);
    if (shippingCharge.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      shippingChargeValue = 0;
      shippingChargeWithoutFormate = 0
    } else {
      shippingChargeValue = await req.formatPriceForFloatValue(
        shippingCharge.data.shipping_charge
      );
      shippingChargeWithoutFormate = shippingCharge.data.shipping_charge
    }
    return resSuccess({
      data: {
        cart_count: cart_list_count,
        discount_amount: await req.formatPriceForFloatValue(discount),
        order_discount_amount: await req.formatPriceForFloatValue(orderDiscount),
        order_offer_detail: applyDiscount.data.appliedOrderOffers,
        sub_total: await req.formatPrice(amount,null),
        shipping_charge: shippingChargeValue || "0",
        coupon: {
          id: findCoupon?.dataValues?.id,
          name: findCoupon?.dataValues?.name,
          code: findCoupon?.dataValues?.coupon_code,
          description: findCoupon?.dataValues?.description,
        },
        tax: taxRateData,
        total_tax_amount: await req.formatPrice(sumTotal,null),
        cart_total: await req.formatPrice(
          totalOrderAmount + shippingChargeWithoutFormate, null),
        cart_list: cartProducts,
      },
    });
  } catch (error) {
    throw error;
  }
};
/* ------------------------ merge cart API (without login add to cart product then user can login then add product in cart ) */

export const mergeCartAddProductAPI = async (req: Request) => {
  try {
    const { AppUser, CartProducts } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const { cart_id } = req.body;
    const user = await AppUser.findOne({
      where: { id: req.body.session_res.id_app_user, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
    });

    if (!(user && user.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    if (cart_id && cart_id.length > 0) {
      const cartList = await CartProducts.findAll({ where: { company_info_id: company_info_id?.data } });
      for (let index = 0; index < cart_id.length; index++) {
        const element = cart_id[index];

        const findCartProduct = cartList.find(
          (t: any) => t.dataValues.id == element
        );
        let findExitProduct: any;
        if (findCartProduct && findCartProduct.dataValues) {
          findExitProduct = cartList.find(
            (t: any) =>
              t.dataValues.product_id ==
              findCartProduct.dataValues.product_id &&
              t.dataValues.product_type ==
              findCartProduct.dataValues.product_type &&
              t.dataValues.user_id == user.dataValues.id
          );
        }

        if (findExitProduct && findExitProduct.dataValues) {
          const deletedData = findCartProduct?.dataValues;
          await CartProducts.destroy({ where: { id: element, company_info_id: company_info_id?.data } });
          await addActivityLogs(req,
            company_info_id?.data,
            [{
              old_data: { cart_product_id: deletedData?.id, data: { ...deletedData } },
              new_data: null  // nothing new, since it's deleted
            }],
            deletedData?.id,
            LogsActivityType.Delete,
            LogsType.AllProductCart,
            req?.body?.session_res?.id_app_user
          );
        } else {
          const oldData = findCartProduct?.dataValues;
          await CartProducts.update(
            {
              user_id: user.dataValues.id,
            },
            { where: { id: element, company_info_id: company_info_id?.data } }
          );
          // build new data manually (only user_id changed)
          const newData = {
            ...oldData,
            user_id: user.dataValues.id
          };
          await addActivityLogs(req,
            company_info_id?.data,
            [{
              old_data: { cart_product_id: oldData?.id, data: { ...oldData } },
              new_data: { cart_product_id: newData?.id, data: { ...newData } }
            }],
            oldData?.id,
            LogsActivityType.Edit,
            LogsType.AllProductCart,
            req?.body?.session_res?.id_app_user
          );
        }

      }

      const count = await CartProducts.sum("quantity", {
        where: { user_id: user.dataValues.id, company_info_id: company_info_id?.data },
      });

      return resSuccess({ data: count });
    } else {
      const count = await CartProducts.sum("quantity", {
        where: { user_id: user.dataValues.id, company_info_id: company_info_id?.data },
      });
      return resSuccess({ data: count });
    }
  } catch (error) {
    throw error;
  }
};

/* ------------------------- add order for All type of product --------------------- */

export const addAllTypeProductWithPaypalOrder = async (req: Request) => {
  try {
    const { AppUser, CartProducts, TaxMaster, Product, ProductImage, ProductMetalOption, ProductDiamondOption, StockChangeLog, LooseDiamondGroupMasters,
      CityData, Orders, OrdersDetails, OrderTransaction, UserAddress, CurrencyData, MetalMaster, GoldKarat, DiamondGroupMaster, DiamondShape, StoneData, Colors,
      ClarityData, DiamondCaratSize, CutsData, MMSizeData, ProductCategory, CategoryData, ConfigProduct, GiftSetProduct, BirthStoneProduct, ConfigBraceletProduct, ConfigEternityProduct, StudConfigProduct } = initModels(req);
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
      shipping_cost,
      coupon_discount,
      currency_code,
      discount,
      app_key = "",
      total_tax,
      cart_ids,
      order_offer_detail
    } = req.body;
    let { product_details } = req.body;

    if (app_key && app_key !== "null" && app_key !== "undefined" && app_key !== "" && app_key == CATALOGUE_ORDER_APP_KEY && user_id == null) {
      return resBadRequest({ message: CATALOGUE_ORDER_NOT_ALLOWED });

    }

    const deliverydays: any = [];
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    if (user_id) {
      const users = await AppUser.findOne({
        where: { id: user_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
      });
      if (!(users && users.dataValues)) {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }

    const taxValues = await TaxMaster.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
    });

    let productTaxAmount: any;
    let productTax: any;
    let allTax = [];
    let taxRateData = [];
    const sub_total_value: any =
      sub_total - (Number(coupon_discount ? coupon_discount : 0) + Number(discount));

    for (const taxData of taxValues) {
      productTax = taxData.dataValues.rate / 100;

      productTaxAmount = Math.ceil(sub_total_value) * productTax;

      taxRateData.push({
        rate: taxData.dataValues.rate,
        tax_amount: productTaxAmount.toFixed(2),
        name: taxData.dataValues.name,
      });
      allTax.push(Number(productTaxAmount).toFixed(2));
    }

    const sumTotal = allTax.reduce((accumulator, currentValue) => {
      return Number(accumulator) + Number(currentValue);
    }, 0);

    const totalOrderAmount = Math.ceil(Math.ceil(sub_total_value)
      + sumTotal + Number(shipping_cost));

    const productDetailsWithDiamond = [];
    const diamondQuantityToCheck = {};
    for (let product of product_details) {
      if (AllProductTypes.SettingProduct == product?.product_type) {
        let errorMessageField = !product?.diamond_price
          ? "Diamond price"
          : !product?.diamond_origin
            ? "Diamond origin"
            : !product?.stock_number
              ? "Diamond stock number"
              : !product?.inventory_type
                ? "Diamond inventory type"
                : null;

        if (errorMessageField) {
          return resBadRequest({
            message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", errorMessageField],
            ]),
          });
        }

        const resDiamond = await getDiamondByStockNumber({
          stock_number: product.stock_number,
          inventory_type: product.inventory_type,
          diamond_origin: product.diamond_origin,
        }, req);

        if (resDiamond.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return resNotFound({
            message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "Diamond"],
            ]),
          });
        }

        if (resDiamond.data.price != product.diamond_price) {
          return resBadRequest({ message: DIAMOND_PRICE_NOT_MATCH });
        }

        productDetailsWithDiamond.push({
          ...product,
          order_details_json: {
            ...product.order_details_json,
            diamond: {
              ...resDiamond.data,
              inventory_type: product.inventory_type,
            },
          },
        });

        if (product.inventory_type === DIAMOND_INVENTROY_TYPE.Local) {
          diamondQuantityToCheck[product.stock_number] = {
            id: resDiamond.data.id,
            stock_number: product.stock_number,
            id_product: [
              ...(diamondQuantityToCheck[product.stock_number]
                ? diamondQuantityToCheck[product.stock_number].id_product
                : []),
              product.product_id,
            ],
            id_variant: [
              ...(diamondQuantityToCheck[product.stock_number]
                ? diamondQuantityToCheck[product.stock_number].id_variant
                : []),
              product.variant_id,
            ],
            inventory_type: product.inventory_type,
            diamond_origin: product.diamond_origin,
            quantity:
              (diamondQuantityToCheck[product.stock_number]?.quantity || 0) + 1,
            available_quantity: resDiamond.data.total_quantity,
            available_remaining_quantity_count:
              resDiamond.data.remaining_quantity_count,
          };
        }
      } else {
        productDetailsWithDiamond.push(product);
      }
    }
    product_details = productDetailsWithDiamond;

    const variantQuantityToCheck = {};
    const productDataForMail = [];
    const configData = await getWebSettingData(req.body.db_connection, company_info_id?.data);
    for (let product of product_details) {
      if (!product.product_id) {
        return resBadRequest({ message: INVALID_ID });
      }

      if (
        AllProductTypes.Product == product.product_type ||
        AllProductTypes.SettingProduct == product.product_type
      ) {
        const products = await Product.findOne({
          where: { id: product.product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
          include: [
            {
              required: false,
              model: ProductImage,
              as: "product_images",
              attributes: ["id", "image_path"],
              where: product.order_details_json.metal_tone
                ? { id_metal_tone: product.order_details_json.metal_tone }
                : {
                  image_path: {
                    [Op.like]: "%WG%", // Use Sequelize Op for a "contains" query
                  },
                },
            },
          ],
        });

        let hasTVImage = products.dataValues?.product_images?.some(
          (img) => img?.image_path?.includes('T2V')
        );
        if (hasTVImage || hasTVImage === true) {
          hasTVImage = products.dataValues?.product_images?.find(
            (img) => img?.image_path?.includes('T2V')
          )?.image_path || products.dataValues?.product_images[0]?.image_path;
        } else {
          hasTVImage = products.dataValues?.product_images[0]?.image_path
        }

        productDataForMail.push({
          product_name: products.dataValues.name,
          product_sku: products.dataValues.sku,
          product_image:
            configData.image_base_url + hasTVImage,
        });

        if (products.dataValues.is_quantity_track && product.variant_id) {
          variantQuantityToCheck[product.variant_id] = {
            id_variant: product.variant_id,
            id_product: product.product_id,
            quantity:
              (variantQuantityToCheck[product.variant_id]?.quantity || 0) +
              product.quantity,
            product_type: STOCK_PRODUCT_TYPE.Product,
            sku: products.dataValues.sku,
          };
        } else {
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
        }
      }
    }

    for (const key in variantQuantityToCheck) {
      const variantToCheck = {
        ...variantQuantityToCheck[key],
      };

      const variantPmo = await ProductMetalOption.findOne({
        where: {
          id: variantToCheck.id_variant,
          id_product: variantToCheck.id_product,
          is_deleted: DeletedStatus.No,
          company_info_id: company_info_id?.data
        },
      });
      if (!(variantPmo && variantPmo.dataValues)) {
        return resNotFound({
          message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "Variant product metal option"],
          ]),
        });
      }
      if (variantPmo.dataValues.remaing_quantity_count <= 0) {
        deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
      } else {
        deliverydays.push(IN_STOCK_PRODUCT_DELIVERY_TIME);
      }
      variantQuantityToCheck[key].remaing_quantity_count = Number(
        variantPmo.dataValues.remaing_quantity_count || 0
      );

      if (
        variantPmo.dataValues.remaing_quantity_count <= 0 &&
        configData.allow_out_of_stock_product_order.toString() === "false"
      ) {
        return resUnprocessableEntity({
          message: PRODUCT_UNAVAILABLE,
          data: {
            variant_id: variantToCheck.id_variant,
            product_id: variantToCheck.id_product,
          },
        });
      }

      if (
        variantPmo.dataValues.remaing_quantity_count <
        variantToCheck.quantity &&
        configData.allow_out_of_stock_product_order.toString() === "false"
      ) {
        return resUnprocessableEntity({
          message: prepareMessageFromParams(INSUFFICIENT_QUANTITY, [
            ["stock_count", variantPmo.dataValues.remaing_quantity_count],
          ]),
          data: {
            variant_id: variantToCheck.id_variant,
            product_id: variantToCheck.id_product,
          },
        });
      }
    }

    for (const key in diamondQuantityToCheck) {
      const diamondToCheck = {
        ...diamondQuantityToCheck[key],
      };

      if (
        diamondToCheck.available_remaining_quantity_count <= 0 &&
        configData.allow_out_of_stock_product_order.toString() === "false"
      ) {
        return resUnprocessableEntity({
          message: PRODUCT_UNAVAILABLE,
          data: {
            stock_number: diamondToCheck.stock_number,
            product_id: diamondToCheck.id_product,
            variant_id: diamondToCheck.id_variant,
          },
        });
      }

      if (
        diamondToCheck.available_remaining_quantity_count <
        diamondToCheck.quantity &&
        configData.allow_out_of_stock_product_order.toString() === "false"
      ) {
        return resUnprocessableEntity({
          message: prepareMessageFromParams(INSUFFICIENT_QUANTITY, [
            ["stock_count", diamondToCheck.available_remaining_quantity_count],
          ]),
          data: {
            stock_number: diamondToCheck.stock_number,
            product_id: diamondToCheck.id_product,
            variant_id: diamondToCheck.id_variant,
          },
        });
      }
    }

    const trn = await (req.body.db_connection).transaction();
    const order_number = crypto.randomInt(1000000000, 9999999999);

    try {
      for (const key in variantQuantityToCheck) {
        const variantToCheck = {
          ...variantQuantityToCheck[key],
        };

        await ProductMetalOption.update(
          {
            remaing_quantity_count:
              variantToCheck.remaing_quantity_count - variantToCheck.quantity,
          },
          { transaction: trn, where: { id: variantToCheck.id_variant, company_info_id: company_info_id?.data } }
        );

        await StockChangeLog.create(
          {
            product_id: variantToCheck.id_product,
            variant_id: variantToCheck.id_variant,
            product_type: STOCK_PRODUCT_TYPE.Product,
            sku: variantToCheck.sku,
            prev_quantity: variantToCheck.remaing_quantity_count,
            new_quantity:
              variantToCheck.remaing_quantity_count - variantToCheck.quantity,
            transaction_type: STOCK_TRANSACTION_TYPE.OrderCreate,
            changed_by: user_id ? user_id : null,
            email: email,
            change_date: getLocalDate(),
            company_info_id: company_info_id?.data
          },
          { transaction: trn }
        );
      }

      for (const key in diamondQuantityToCheck) {
        const diamondToCheck = {
          ...diamondQuantityToCheck[key],
        };

        await LooseDiamondGroupMasters.update(
          {
            remaining_quantity_count:
              diamondToCheck.available_remaining_quantity_count -
              diamondToCheck.quantity,
          },
          { transaction: trn, where: { id: diamondToCheck.id, company_info_id: company_info_id?.data } }
        );

        await StockChangeLog.create(
          {
            product_id: diamondToCheck.id,
            variant_id: null,
            product_type: STOCK_PRODUCT_TYPE.LooseDiamond,
            sku: diamondToCheck.stock_number,
            prev_quantity: diamondToCheck.available_remaining_quantity_count,
            new_quantity:
              diamondToCheck.available_remaining_quantity_count -
              diamondToCheck.quantity,
            transaction_type: STOCK_TRANSACTION_TYPE.OrderCreate,
            changed_by: user_id ? user_id : null,
            email: email,
            change_date: getLocalDate(),
            company_info_id: company_info_id?.data
          },
          { transaction: trn }
        );
      }

      if (
        (!order_billing_address ||
          !order_billing_address.city_id ||
          order_billing_address.city_id == undefined ||
          order_billing_address.city_id == null) &&
        app_key !== CATALOGUE_ORDER_APP_KEY
      ) {
        trn.rollback();
        return resUnknownError({
          message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Billing address city"],
          ]),
        });
      }
      let billingAddresscityNameExistes: any;
      if (app_key !== CATALOGUE_ORDER_APP_KEY) {
        billingAddresscityNameExistes = await CityData.findOne({
          where: [
            columnValueLowerCase(
              "city_name",
              order_billing_address.city_id.toString()
            ),
            { is_deleted: DeletedStatus.No },
            { company_info_id: company_info_id?.data }
          ],
          transaction: trn,
        });
      }
      let billingCityCreateId: any;
      if (
        billingAddresscityNameExistes &&
        billingAddresscityNameExistes.dataValues
      ) {
        billingCityCreateId = billingAddresscityNameExistes.dataValues.id;
      } else {
        if (app_key !== CATALOGUE_ORDER_APP_KEY) {
          const created = await CityData.create(
            {
              city_name: order_billing_address.city_id,
              city_code: order_billing_address.city_id,
              id_state: order_billing_address.state_id,
              created_date: getLocalDate(),
              is_active: ActiveStatus.Active,
              is_deleted: DeletedStatus.No,
              company_info_id: company_info_id?.data,
            },
            { transaction: trn }
          );
          billingCityCreateId = created.dataValues.id;
        }
      }
      if (
        shipping_method == SHIPPING_METHOD.online &&
        (!order_shipping_address.city_id ||
          order_shipping_address.city_id == undefined ||
          order_shipping_address.city_id == null ||
          order_shipping_address.city_id == "") &&
        app_key !== CATALOGUE_ORDER_APP_KEY &&
        app_key.length === 0
      ) {
        trn.rollback();
        return resUnknownError({
          message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Shipping address city"],
          ]),
        });
      }

      let shippingCityCreateId: any;
      if (
        !app_key &&
        app_key.length === 0 &&
        app_key != CATALOGUE_ORDER_APP_KEY
      ) {
        if (
          order_shipping_address &&
          shipping_method == SHIPPING_METHOD.online
        ) {
          const shippingAddresscityNameExistes = await CityData.findOne({
            where: [
              columnValueLowerCase(
                "city_name",
                order_shipping_address.city_id?.toString()
              ),
              { is_deleted: DeletedStatus.No },
              { company_info_id: company_info_id?.data },
            ],
            transaction: trn,
          });

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
                company_info_id: company_info_id?.data,
                id_state: order_shipping_address.state_id,
                created_date: getLocalDate(),
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
              },
              { transaction: trn }
            );
            shippingCityCreateId = created.dataValues.id;
          }
        }
      }

      if (
        parseInt(is_add_address) == 1 &&
        !app_key &&
        app_key.length === 0 &&
        app_key != CATALOGUE_ORDER_APP_KEY
      ) {
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
              company_info_id: company_info_id?.data,
              created_date: getLocalDate(),
            };

            await UserAddress.create(payload, { transaction: trn });
          } else {
            const addressId = await UserAddress.findOne({
              where: { id: order_billing_address.id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
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
                where: { id: addressId.dataValues.id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
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
                company_info_id: company_info_id?.data,
                created_date: getLocalDate(),
              };

              await UserAddress.create(payload, { transaction: trn });
            } else {
              const addressId = await UserAddress.findOne({
                where: { id: order_shipping_address.id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
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
                  where: { id: addressId.dataValues.id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
                  transaction: trn,
                }
              );
            }
          }
        }
      }
      let currency
      if (currency_id && currency_id !== null) {
        currency = await CurrencyData.findOne({ where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, id: currency_id, company_info_id: company_info_id?.data } })
      } else {
        currency = await CurrencyData.findOne({ where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, is_default: "1", company_info_id: company_info_id?.data } })
      }

      const findDefaultCurrency = await CurrencyData.findOne({ where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, is_default: "1", company_info_id: company_info_id?.data } });
      const ordersPayload = {
        order_number: `${configData.order_invoice_number_identity}-${order_number}`,
        user_id: user_id,
        email: email,
        shipping_method: shipping_method,
        pickup_store_id: pickup_store_id,
        coupon_id: coupon_id || null,
        coupon_discount: coupon_discount || 0,
        sub_total: parseFloat(sub_total),
        shipping_cost: parseFloat(shipping_cost),
        discount: parseFloat(discount),
        total_tax: sumTotal,
        order_total: totalOrderAmount,
        payment_method: payment_method,
        currency_id: currency_id,
        default_currency: findDefaultCurrency.dataValues.id,
        currency_rate: Number(currency.dataValues.rate).toFixed(2) || 1,
        order_status: OrderStatus.Pendding,
        payment_status: PaymentStatus.InPaid,
        order_date: getLocalDate(),
        order_type: order_type,
        order_note: order_note,
        order_shipping_address: {
          ...order_shipping_address,
          city_id: shippingCityCreateId || null,
        },
        order_billing_address: {
          ...order_billing_address,
          city_id: billingCityCreateId,
        },
        order_taxs: JSON.stringify(taxRateData),
        created_by: req.body.session_res.id_app_user,
        company_info_id: company_info_id?.data,
        created_date: getLocalDate(),
        offer_details: order_offer_detail,
        cart_ids: cart_ids && cart_ids.length > 0 ? cart_ids.join("|") : null
      };


      const orders = await Orders.create(ordersPayload, { transaction: trn });

      for (let product of product_details) {
        if (!product.product_id) {
          await trn.rollback();
          return resBadRequest({ message: INVALID_ID });
        }

        if (AllProductTypes.Product == product.product_type) {
          const products = await Product.findOne({
            where: { id: product.product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
            include: [
              {
                required: false,
                model: ProductImage,
                as: "product_images",
                attributes: ["id", "image_path"],
                where: product.order_details_json.metal_tone
                  ? { id_metal_tone: product.order_details_json.metal_tone }
                  : {
                    image_path: {
                      [Op.like]: "%WG%", // Use Sequelize Op for a "contains" query
                    },
                  },
              },
              {
                required: false,
                model: ProductMetalOption,
                as: "PMO",
                attributes: [
                  "id",
                  "id_metal",
                  "metal_weight",
                  "id_size",
                  "id_length",
                  "id_m_tone",
                  "side_dia_weight",
                  "side_dia_count",
                  "id_karat",
                ],
                where: { is_deleted: DeletedStatus.No, id: product.variant_id, company_info_id: company_info_id?.data },
                include: [
                  {
                    required: false,
                    model: MetalMaster,
                    as: "metal_master",
                    attributes: ["id", "metal_rate", "name"],
                    where: { company_info_id: company_info_id?.data },
                  },
                  {
                    required: false,
                    model: GoldKarat,
                    as: "metal_karat",
                    attributes: ["id", "calculate_rate", "name"],
                    where: { company_info_id: company_info_id?.data },
                  },
                ],
              },
              {
                required: false,
                model: ProductDiamondOption,
                as: "PDO",
                attributes: [
                  "id",
                  "id_diamond_group",
                  "weight",
                  "count",
                  "id_type",
                ],
                where: { is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
                include: [
                  {
                    required: false,
                    model: DiamondGroupMaster,
                    as: "rate",
                    attributes: ["id", "rate", "synthetic_rate", "id_stone",
                      "id_shape",
                      "id_color",
                      "id_clarity",
                      "id_mm_size",
                      "id_cuts",
                      [Sequelize.literal(`"PDO->rate->stones"."name"`), "stone_name"],
                      [Sequelize.literal(`"PDO->rate->shapes"."name"`), "shape_name"],
                      [Sequelize.literal(`"PDO->rate->colors"."value"`), "color_name"],
                      [Sequelize.literal(`"PDO->rate->clarity"."value"`), "clarity_name"],
                      [Sequelize.literal(`"PDO->rate->carats"."value"`), "carat_name"],
                      [Sequelize.literal(`"PDO->rate->cuts"."value"`), "cut_name"],
                      [Sequelize.literal(`"PDO->rate->mm_size"."value"`), "mm_size_name"],
                    ],

                    where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, company_info_id: company_info_id?.data },
                    include: [
                      { required: false, model: DiamondShape, as: "shapes", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: StoneData, as: "stones", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: Colors, as: "colors", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: ClarityData, as: "clarity", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: DiamondCaratSize, as: "carats", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: CutsData, as: "cuts", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: MMSizeData, as: "mm_size", attributes: [], where: { company_info_id: company_info_id?.data } },
                    ],
                  },
                ],
              },
              {
                required: false,
                model: ProductCategory,
                as: "product_categories",
                attributes: [
                  "id",
                  "id_category",
                  "id_sub_category",
                  "id_sub_sub_category",

                ],
                where: { is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
                include: [
                  {
                    required: false,
                    model: CategoryData,
                    as: "category",
                    attributes: ["id", "category_name"],
                    where: { company_info_id: company_info_id?.data },
                  },
                ]
              },
            ],
          });

          if (!(products && products.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: SINGLE_PRODUCT_NOT_FOUND });
          }
          let diamondRate = products.dataValues.product_type == SingleProductType.VariantType ? 0 : await req.body.db_connection.query(
            `SELECT SUM((CASE
                WHEN DIAMOND_GROUP_MASTERS.RATE IS NOT NULL
                AND DIAMOND_GROUP_MASTERS.RATE != 0 THEN DIAMOND_GROUP_MASTERS.RATE
                ELSE DIAMOND_GROUP_MASTERS.SYNTHETIC_RATE
              END) * PRODUCT_DIAMOND_OPTIONS.COUNT * PRODUCT_DIAMOND_OPTIONS.WEIGHT)
            FROM PRODUCT_DIAMOND_OPTIONS
            LEFT OUTER JOIN DIAMOND_GROUP_MASTERS ON DIAMOND_GROUP_MASTERS.ID = PRODUCT_DIAMOND_OPTIONS.ID_DIAMOND_GROUP
            WHERE PRODUCT_DIAMOND_OPTIONS.ID_PRODUCT = ${product.product_id} AND PRODUCT_DIAMOND_OPTIONS.is_deleted = '${DeletedStatus.No}' ${product.product_type == AllProductTypes.SingleTreasure || product.product_type == AllProductTypes.SettingProduct  ? `AND PRODUCT_DIAMOND_OPTIONS.ID_TYPE = 2` : ''}`,
            { type: QueryTypes.SELECT }
          );
          const metalRates = products.dataValues.product_type == SingleProductType.VariantType ? 0 : await req.body.db_connection.query(
            `SELECT CASE
                WHEN PMO.ID_KARAT IS NULL THEN (METAL.METAL_RATE * PMO.METAL_WEIGHT)
                ELSE (METAL.METAL_RATE / METAL.CALCULATE_RATE * GOLD_KTS.CALCULATE_RATE * PMO.METAL_WEIGHT)
              END
              FROM PRODUCTS
              LEFT OUTER JOIN PRODUCT_METAL_OPTIONS AS PMO ON PMO.ID_PRODUCT = PRODUCTS.ID
              LEFT OUTER JOIN METAL_MASTERS AS METAL ON PMO.ID_METAL = METAL.ID
              LEFT OUTER JOIN GOLD_KTS ON PMO.ID_KARAT = GOLD_KTS.ID
              WHERE PRODUCTS.ID = ${product.product_id}
		      AND PMO.ID = ${product.variant_id}`,
            { type: QueryTypes.SELECT }
          );

          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              variant_id: product.variant_id,
              finding_charge: parseFloat(products.dataValues.finding_charge),
              makring_charge: parseFloat(products.dataValues.making_charge),
              other_charge: parseFloat(products.dataValues.other_charge),
              diamond_rate: diamondRate.map((t: any) => t.sum)[0],
              metal_rate: metalRates.map((t: any) => t.case)[0],
              sub_total: parseFloat(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: products.dataValues,
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (
          AllProductTypes.Config_Ring_product == product.product_type
        ) {
          /* ---------------CONFIG RING PRODUCT ADD TO CART------------- */
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          const products = await ConfigProduct.findOne({
            where: { id: product.product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
            transaction: trn,
          });


          if (!(products && products.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: RING_CONFIG_PRODUCT_NOT_FOUND });
          }
          const productDetail: any = await req.body.db_connection.query(`(SELECT config_products.*, 
            JSON_BUILD_OBJECT(	'id', center_diamond_group_id,
              'dia_cts', center_dia_cts,
                'dia_size', center_dia_size,
              'rate', DGM.rate,
              'synthetic_rate', DGM.synthetic_rate,
              'stone', cen_stone.name,
              'shape', cen_shape.name,
              'color', cen_colors.value,
              'clarity', cen_clarity.value,
              'cuts', cen_cuts.value,
              'mm_size', cen_mm_size.value,
            'carat_size', cen_carat_sizes.value
            ) as center_diamond_detail,
          JSONB_AGG(DISTINCT jsonb_build_object('id', CPM.id,
                 'metal_id',CPM.metal_id,
                 'metal_wt', CPM.metal_wt,
                 'karat_id',CPM.karat_id,
                 'head_shank_band',CPM.head_shank_band,
                 'labor_charge',CPM.labor_charge,
                 'metal_rate',metal.metal_rate,
                 'metal_name', metal.name,
                 'karat_calculate', karat.calculate_rate)) as pmo,
          JSONB_AGG(DISTINCT jsonb_build_object('id', CPD.id,
                 'dia_cts_individual', CPD.dia_cts_individual,
                 'dia_count',CPD.dia_count,
                 'dia_cts',CPD.dia_cts,
                 'dia_size',CPD.dia_size,
                 'product_type',CPD.product_type,
                 'dia_weight',CPD.dia_weight,
                 'rate', CPDGM.rate,
                 'synthetic_rate', CPDGM.synthetic_rate,
                 'stone', stone.name,
                 'shape', shape.name,
                 'color', colors.value,
                 'clarity',clarity.value,
                 'cuts',cuts.value,
                 'mm_size',mm_sizes.value,
                 'carat_size', carat_sizes.value
                )) as PDO
              
              FROM config_products
              LEFT JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id
              LEFT JOIN metal_masters as metal ON metal.id = CPM.metal_id
              LEFT JOIN gold_kts as karat ON karat.id = CPM.karat_id
              LEFT JOIN config_product_diamonds AS CPD ON CPD.config_product_id = config_products.id
              LEFT JOIN diamond_group_masters DGM ON DGM.id = config_products.center_diamond_group_id
              LEFT JOIN gemstones as cen_stone ON cen_stone.id = DGM.id_stone
              LEFT JOIN diamond_shapes AS cen_shape ON cen_shape.id = DGM.id_shape
              LEFT JOIN colors as cen_colors ON cen_colors.id = DGM.id_color
              LEFT JOIN clarities as cen_clarity ON cen_clarity.id = DGM.id_clarity
              LEFT JOIN cuts as cen_cuts ON cen_cuts.id = DGM.id_cuts
              LEFT JOIN mm_sizes as cen_mm_size ON cen_mm_size.id = DGM.id_mm_size
              LEFT JOIN carat_sizes as cen_carat_sizes ON cen_carat_sizes.id = DGM.id_carat
              LEFT JOIN diamond_group_masters CPDGM ON CPDGM.id = CPD.id_diamond_group
              LEFT JOIN gemstones as stone ON stone.id = CPDGM.id_stone
              LEFT JOIN diamond_shapes AS shape ON shape.id = CPDGM.id_shape
              LEFT JOIN colors as colors ON colors.id = CPDGM.id_color
              LEFT JOIN clarities as clarity ON clarity.id = CPDGM.id_clarity
              LEFT JOIN cuts as cuts ON cuts.id = CPDGM.id_cuts
              LEFT JOIN mm_sizes ON mm_sizes.id = CPDGM.id_mm_size
              LEFT JOIN carat_sizes ON carat_sizes.id = CPDGM.id_carat
              WHERE config_products.id = ${product.product_id}
              GROUP BY config_products.id, DGM.id, cen_stone.name, cen_shape.name,
              cen_colors.value, cen_clarity.value, cen_cuts.value, cen_mm_size.value,cen_carat_sizes.value)`, { type: QueryTypes.SELECT })

          let SideDiamondRate: any = await req.body.db_connection.query(
            `SELECT SUM(PDGM.RATE * CPDO.DIA_COUNT * CPDO.DIA_WEIGHT)
                FROM CONFIG_PRODUCT_DIAMONDS AS CPDO
                LEFT OUTER JOIN DIAMOND_GROUP_MASTERS AS PDGM ON CPDO.ID_DIAMOND_GROUP = PDGM.ID
                WHERE CPDO.CONFIG_PRODUCT_ID = ${product.product_id} AND CPDO.IS_DELETED = '${DeletedStatus.No}'
                  AND CASE
                      WHEN ${product.order_details_json.is_band} = 1 THEN CPDO.PRODUCT_TYPE <> ''
                      ELSE LOWER(CPDO.PRODUCT_TYPE) <> 'band'
                END`,
            { type: QueryTypes.SELECT }
          );

          let centerDiamondRate = await req.body.db_connection.query(`(SELECT  
                CASE WHEN config_products.center_dia_type = 1 THEN DGM.rate ELSE DGM.synthetic_rate END *
                CASE WHEN gemstones.is_diamond = 1 THEN 
                  CASE WHEN DGM.average_carat IS NOT NULL 
                  THEN DGM.average_carat 
                  ELSE carat_sizes.value::numeric END ELSE 1 END
              FROM config_products 
              LEFT JOIN diamond_group_masters DGM ON DGM.id = config_products.center_diamond_group_id
              LEFT JOIN gemstones ON gemstones.id = DGM.id_stone
              LEFT JOIN carat_sizes ON carat_sizes.id = DGM.id_carat
              WHERE config_products.id = ${product.product_id})`, {type: QueryTypes.SELECT })
          const metalRates: any = await req.body.db_connection.query(
            `SELECT CASE
                WHEN CPMO.KARAT_ID IS NULL 
                THEN (SUM(METAL_WT * (METAL_MASTER.METAL_RATE)) + COALESCE(SUM(CPMO.LABOR_CHARGE),0))
                ELSE (SUM(METAL_WT * (METAL_MASTER.METAL_RATE / METAL_MASTER.CALCULATE_RATE * GOLD_KTS.CALCULATE_RATE)) + COALESCE(SUM(CPMO.LABOR_CHARGE),0))
              END AS METAL_RATE
              FROM CONFIG_PRODUCT_METALS AS CPMO
              LEFT OUTER JOIN METAL_MASTERS AS METAL_MASTER ON METAL_MASTER.ID = CPMO.METAL_ID
              LEFT OUTER JOIN GOLD_KTS ON GOLD_KTS.ID = CPMO.KARAT_ID
              WHERE CPMO.CONFIG_PRODUCT_ID = ${product.product_id} AND CPMO.IS_DELETED = '${DeletedStatus.No}'
              AND CASE
                  WHEN 0 = 1 THEN CPMO.HEAD_SHANK_BAND <> ''
                  ELSE LOWER(CPMO.HEAD_SHANK_BAND) <> 'band'
                END
            GROUP BY cpmo.karat_id, cpmo.metal_id, CPMO.CONFIG_PRODUCT_ID`,
            { type: QueryTypes.SELECT }
          );
          let diamondCount: any = await req.body.db_connection.query(
            `SELECT sum(CPDO.dia_count) FROM config_product_diamonds AS CPDO  LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CPDO.config_product_id = ${product.product_id} AND CASE WHEN ${product.order_details_json.is_band} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END`,
            { type: QueryTypes.SELECT }
          );
          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: parseFloat(products.dataValues.other_changes),
              makring_charge: parseFloat(products.dataValues.laber_charge),
              diamond_count: diamondCount[0].sum,
              diamond_rate: (SideDiamondRate[0].sum || 0) + (centerDiamondRate[0]?.case || 0),
              metal_rate: metalRates[0].metal_rate,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productDetail[0],
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (
          AllProductTypes.Three_stone_config_product == product.product_type
        ) {
          /* --------------- Three Stone PRODUCT ADD TO CART------------- */
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          const products = await ConfigProduct.findOne({
            where: { id: product.product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
            transaction: trn,
          });
          if (!(products && products.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: RING_CONFIG_PRODUCT_NOT_FOUND });
          }

          let sideDiamondRate: any = await req.body.db_connection.query(
            `SELECT SUM(CASE
            WHEN lower(CPDO.product_type::text) = 'side'::text THEN pdgm.rate * cpdo.dia_count::double precision *
                +CASE
                      WHEN gemstones.is_diamond = 1 THEN
                      CASE
                        WHEN pdgm.average_carat IS NOT NULL THEN pdgm.average_carat
                        ELSE cpdo.dia_weight
                      END
                  ELSE 1::double precision
              END
                    ELSE pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_weight
                END)
                FROM CONFIG_PRODUCT_DIAMONDS AS CPDO
                LEFT OUTER JOIN DIAMOND_GROUP_MASTERS AS PDGM ON CPDO.ID_DIAMOND_GROUP = PDGM.ID
				LEFT OUTER JOIN GEMSTONES ON GEMSTONES.id = PDGM.ID_STONE
                WHERE CPDO.CONFIG_PRODUCT_ID = 115869 AND CPDO.IS_DELETED = '0'
                  AND CASE
                      WHEN 1 = 1 THEN CPDO.PRODUCT_TYPE <> ''
                      ELSE LOWER(CPDO.PRODUCT_TYPE) <> 'band'
                END`,
            { type: QueryTypes.SELECT }
          );
          let centerDiamondRate = await req.body.db_connection.query(`(SELECT  
                CASE WHEN config_products.center_dia_type = 1 THEN DGM.rate ELSE DGM.synthetic_rate END *
                CASE WHEN gemstones.is_diamond = 1 THEN 
                  CASE WHEN DGM.average_carat IS NOT NULL 
                  THEN DGM.average_carat 
                  ELSE carat_sizes.value::numeric END ELSE 1 END
              FROM config_products 
              LEFT JOIN diamond_group_masters DGM ON DGM.id = config_products.center_diamond_group_id
              LEFT JOIN gemstones ON gemstones.id = DGM.id_stone
              LEFT JOIN carat_sizes ON carat_sizes.id = DGM.id_carat
              WHERE config_products.id = ${product.product_id})`, {type: QueryTypes.SELECT })
          const metalRates: any = await req.body.db_connection.query(
            `SELECT CASE
                WHEN CPMO.KARAT_ID IS NULL 
                THEN (SUM(METAL_WT * (METAL_MASTER.METAL_RATE)) + COALESCE(SUM(CPMO.LABOR_CHARGE),0))
                ELSE (SUM(METAL_WT * (METAL_MASTER.METAL_RATE / METAL_MASTER.CALCULATE_RATE * GOLD_KTS.CALCULATE_RATE)) + COALESCE(SUM(CPMO.LABOR_CHARGE),0))
              END AS METAL_RATE
              FROM CONFIG_PRODUCT_METALS AS CPMO
              LEFT OUTER JOIN METAL_MASTERS AS METAL_MASTER ON METAL_MASTER.ID = CPMO.METAL_ID
              LEFT OUTER JOIN GOLD_KTS ON GOLD_KTS.ID = CPMO.KARAT_ID
              WHERE CPMO.CONFIG_PRODUCT_ID = ${product.product_id} AND CPMO.IS_DELETED = '${DeletedStatus.No}'
              AND CASE
                  WHEN 0 = 1 THEN CPMO.HEAD_SHANK_BAND <> ''
                  ELSE LOWER(CPMO.HEAD_SHANK_BAND) <> 'band'
                END
            GROUP BY cpmo.karat_id, cpmo.metal_id, CPMO.CONFIG_PRODUCT_ID`,
            { type: QueryTypes.SELECT }
          );
          let diamondCount: any = await req.body.db_connection.query(
            `SELECT sum(CPDO.dia_count) FROM config_product_diamonds AS CPDO  LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CPDO.config_product_id = ${product.product_id} AND CASE WHEN ${product.order_details_json.is_band} = 1 THEN  CPDO.product_type <> '' ELSE CPDO.product_type <> 'band' END`,
            { type: QueryTypes.SELECT }
          );
          const productDetail: any = await req.body.db_connection.query(`(SELECT config_products.*, 
                  JSON_BUILD_OBJECT(	'id', center_diamond_group_id,
                    'dia_cts', center_dia_cts,
                      'dia_size', center_dia_size,
                    'rate', DGM.rate,
                    'synthetic_rate', DGM.synthetic_rate,
                    'stone', cen_stone.name,
                    'shape', cen_shape.name,
                    'color', cen_colors.value,
                    'clarity', cen_clarity.value,
                    'cuts', cen_cuts.value,
                    'mm_size', cen_mm_size.value,
                  'carat_size', cen_carat_sizes.value
                  ) as center_diamond_detail,
                JSONB_AGG(DISTINCT jsonb_build_object('id', CPM.id,
                       'metal_id',CPM.metal_id,
                       'metal_wt', CPM.metal_wt,
                       'karat_id',CPM.karat_id,
                       'head_shank_band',CPM.head_shank_band,
                       'labor_charge',CPM.labor_charge,
                       'metal_rate',metal.metal_rate,
                       'metal_name',metal.name,
                       'karat_calculate', karat.calculate_rate)) as pmo,
                JSONB_AGG(DISTINCT jsonb_build_object('id', CPD.id,
                       'dia_cts_individual', CPD.dia_cts_individual,
                       'dia_count',CPD.dia_count,
                       'dia_cts',CPD.dia_cts,
                       'dia_size',CPD.dia_size,
                       'product_type',CPD.product_type,
                       'dia_weight',CPD.dia_weight,
                       'rate', CPDGM.rate,
                       'synthetic_rate', CPDGM.synthetic_rate,
                       'stone', stone.name,
                       'shape', shape.name,
                       'color', colors.value,
                       'clarity',clarity.value,
                       'cuts',cuts.value,
                       'mm_size',mm_sizes.value,
                       'carat_size', carat_sizes.value
                      )) as PDO
                    
                    FROM config_products
                    LEFT JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id
                    LEFT JOIN metal_masters as metal ON metal.id = CPM.metal_id
                    LEFT JOIN gold_kts as karat ON karat.id = CPM.karat_id
                    LEFT JOIN config_product_diamonds AS CPD ON CPD.config_product_id = config_products.id
                    LEFT JOIN diamond_group_masters DGM ON DGM.id = config_products.center_diamond_group_id
                    LEFT JOIN gemstones as cen_stone ON cen_stone.id = DGM.id_stone
                    LEFT JOIN diamond_shapes AS cen_shape ON cen_shape.id = DGM.id_shape
                    LEFT JOIN colors as cen_colors ON cen_colors.id = DGM.id_color
                    LEFT JOIN clarities as cen_clarity ON cen_clarity.id = DGM.id_clarity
                    LEFT JOIN cuts as cen_cuts ON cen_cuts.id = DGM.id_cuts
                    LEFT JOIN mm_sizes as cen_mm_size ON cen_mm_size.id = DGM.id_mm_size
                    LEFT JOIN carat_sizes as cen_carat_sizes ON cen_carat_sizes.id = DGM.id_carat
                    LEFT JOIN diamond_group_masters CPDGM ON CPDGM.id = CPD.id_diamond_group
                    LEFT JOIN gemstones as stone ON stone.id = CPDGM.id_stone
                    LEFT JOIN diamond_shapes AS shape ON shape.id = CPDGM.id_shape
                    LEFT JOIN colors as colors ON colors.id = CPDGM.id_color
                    LEFT JOIN clarities as clarity ON clarity.id = CPDGM.id_clarity
                    LEFT JOIN cuts as cuts ON cuts.id = CPDGM.id_cuts
                    LEFT JOIN mm_sizes ON mm_sizes.id = CPDGM.id_mm_size
                    LEFT JOIN carat_sizes ON carat_sizes.id = CPDGM.id_carat
                    WHERE config_products.id = ${product.product_id}
                    GROUP BY config_products.id, DGM.id, cen_stone.name, cen_shape.name,
                    cen_colors.value, cen_clarity.value, cen_cuts.value, cen_mm_size.value,cen_carat_sizes.value)`, { type: QueryTypes.SELECT })
          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: parseFloat(products.dataValues.other_changes),
              makring_charge: parseFloat(products.dataValues.laber_charge),
              diamond_count: diamondCount[0].sum,
              diamond_rate: (sideDiamondRate[0].sum || 0) + (centerDiamondRate[0]?.case || 0),
              metal_rate: metalRates[0].metal_rate,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productDetail[0],
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (AllProductTypes.GiftSet_product == product.product_type) {
          /* ---------------GIFT SET PRODUCT ADD TO CART----------------------- */
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          if (!product.product_id) {
            await trn.rollback();
            return resBadRequest({ message: INVALID_ID });
          }
          const products = await GiftSetProduct.findOne({
            where: { id: product.product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
            transaction: trn,
          });
          if (!(products && products.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: GIFT_SET_PRODUCT_NOT_FOUND });
          }

          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: null,
              makring_charge: null,
              diamond_count: null,
              diamond_rate: null,
              metal_rate: null,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product,
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (AllProductTypes.BirthStone_product == product.product_type) {
          /* ---------------BIRTHSTONE PRODUCT ADD TO CART----------------------- */
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          if (!product.product_id) {
            await trn.rollback();
            return resBadRequest({ message: INVALID_ID });
          }
          const products = await BirthStoneProduct.findOne({
            where: { id: product.product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
            transaction: trn,
          });
          if (!(products && products.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: GIFT_SET_PRODUCT_NOT_FOUND });
          }

          const productDetail = await req.body.db_connection.query(`(SELECT birthstone_products.*,
            JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', BPMO.id,
               'metal_weight', BPMO.metal_weight,
               'plu_no', BPMO.plu_no,
               'price',BPMO.price,
               'id_metal', BPMO.id_metal,
               'karat', gold_kts.name
              )) as BPMO,
            JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', BPE.id,
               'text', BPE.text,
               'max_text_count', BPE.max_text_count
              )) as BPE,
            JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', BPDO.id,
                    'weight', BPDO.weight,
                    'count', BPDO.count,
                    'id_diamond_group', BPDO.id_diamond_group,
					'shape', shape.name,
					'mm_size', mm.value,
					'color', col.value,
					'clarity', cla.value,
					'stone', stone.name,
					'cut', cut.value,							  
                    'id_type', BPDO.id_type
                   )) AS BPDO,
            JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', BPC.id,
                    'id_category', BPC.id_category,
                    'id_sub_category',BPC.id_sub_category,
                    'id_sub_sub_category', BPC.id_sub_sub_category
                   )) AS BPC
            FROM birthstone_products
            LEFT JOIN birthstone_product_metal_options as BPMO ON BPMO.id_product = birthstone_products.id AND BPMO.id = ${product.product_id}
            LEFT JOIN gold_kts ON gold_kts.id = BPMO.id_karat
            LEFT JOIN birthstone_product_engravings as BPE ON BPE.id_product = birthstone_products.id
            LEFT JOIN birthstone_product_diamond_options as BPDO ON BPDO.id_product = birthstone_products.id
            LEFT JOIN birthstone_product_categories as BPC ON BPC.id_product = birthstone_products.id
			LEFT JOIN diamond_group_masters as BDGM ON BDGM.id = BPDO.id_diamond_group
			LEFT JOIN diamond_shapes as shape ON shape.id = BDGM.id_shape
			LEFT JOIN gemstones as stone ON stone.id = BDGM.id_stone
			LEFT JOIN colors as col ON col.id = BDGM.id_color
			LEFT JOIN clarities as cla on cla.id = BDGM.id_clarity
			LEFT JOIN mm_sizes as mm on mm.id = BDGM.id_mm_size
			LEFT JOIN cuts as cut on cut.id = BDGM.id_cuts
            WHERE birthstone_products.id = ${product.product_id}
            GROUP BY birthstone_products.id)`, { type: QueryTypes.SELECT })


          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              variant_id: product.variant_id,
              finding_charge: parseFloat(products.dataValues.finding_charge),
              makring_charge: parseFloat(products.dataValues.making_charge),
              other_charge: parseFloat(products.dataValues.other_charge),
              diamond_count: products.dataValues.gemstone_count,
              diamond_rate: 0,
              metal_rate: 0,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productDetail[0],
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (AllProductTypes.Eternity_product == product.product_type) {
          /* ---------------ETERNITY PRODUCT----------------------- */
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          const productData = await ConfigEternityProduct.findOne({
            where: {
              id: product.product_id,
              is_deleted: DeletedStatus.No,
              company_info_id: company_info_id?.data
            },
          });


          if (!(productData && productData.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: ETERNITY_BAND_PRODUCT_NOT_FOUND });
          }
          const productDetail = await req.body.db_connection.query(`(SELECT CEP.*, 
                  JSON_BUILD_OBJECT(	'id', CEP.diamond_group_id,
                    'dia_cts', CEP.dia_cts,
                    'rate', DGM.rate,
                    'synthetic_rate', DGM.synthetic_rate,
                    'stone', cen_stone.name,
                    'shape', cen_shape.name,
                    'color', cen_colors.value,
                    'clarity', cen_clarity.value,
                    'cuts', cen_cuts.value,
                    'mm_size', cen_mm_size.value,
                  'carat_size', cen_carat_sizes.value
                  ) as diamond_detail,
                JSONB_AGG(DISTINCT jsonb_build_object('id', CEPM.id,
                       'metal_id',CEPM.metal_id,
                       'metal_wt', CEPM.metal_wt,
                       'karat_id',CEPM.karat_id,
                       'labor_charge',CEPM.labour_charge,
                       'metal_rate',metal.metal_rate,
                       'karat_rate', karat.name,
                       'metal_name',metal.name,
                       'karat_calculate', karat.calculate_rate)) as pmo,
                JSONB_AGG(DISTINCT jsonb_build_object('id', CEPD.id,
                       'dia_count',CEPD.dia_count,
                       'dia_cts',CEPD.dia_cts,
                       'dia_weight',CEPD.dia_weight,
                       'rate', CPDGM.rate,
                       'synthetic_rate', CPDGM.synthetic_rate,
                       'stone', stone.name,
                       'shape', shape.name,
                       'color', colors.value,
                       'clarity',clarity.value,
                       'cuts',cuts.value,
                       'mm_size',mm_sizes.value,
                       'carat_size', carat_sizes.value
                      )) as PDO
                    
                    FROM config_eternity_products as CEP
                    LEFT JOIN config_eternity_product_metals AS CEPM ON CEPM.config_eternity_id = CEP.id
                    LEFT JOIN metal_masters as metal ON metal.id = CEPM.metal_id
                    LEFT JOIN gold_kts as karat ON karat.id = CEPM.karat_id
                    LEFT JOIN config_eternity_product_diamonds AS CEPD ON CEPD.config_eternity_product_id = CEP.id
                    LEFT JOIN diamond_group_masters DGM ON DGM.id = CEP.diamond_group_id
                    LEFT JOIN gemstones as cen_stone ON cen_stone.id = DGM.id_stone
                    LEFT JOIN diamond_shapes AS cen_shape ON cen_shape.id = DGM.id_shape
                    LEFT JOIN colors as cen_colors ON cen_colors.id = DGM.id_color
                    LEFT JOIN clarities as cen_clarity ON cen_clarity.id = DGM.id_clarity
                    LEFT JOIN cuts as cen_cuts ON cen_cuts.id = DGM.id_cuts
                    LEFT JOIN mm_sizes as cen_mm_size ON cen_mm_size.id = DGM.id_mm_size
                    LEFT JOIN carat_sizes as cen_carat_sizes ON cen_carat_sizes.id = DGM.id_carat
                    LEFT JOIN diamond_group_masters CPDGM ON CPDGM.id = CEPD.id_diamond_group
                    LEFT JOIN gemstones as stone ON stone.id = CPDGM.id_stone
                    LEFT JOIN diamond_shapes AS shape ON shape.id = CPDGM.id_shape
                    LEFT JOIN colors as colors ON colors.id = CPDGM.id_color
                    LEFT JOIN clarities as clarity ON clarity.id = CPDGM.id_clarity
                    LEFT JOIN cuts as cuts ON cuts.id = CPDGM.id_cuts
                    LEFT JOIN mm_sizes ON mm_sizes.id = CPDGM.id_mm_size
                    LEFT JOIN carat_sizes ON carat_sizes.id = CPDGM.id_carat
                    WHERE CEP.id = ${product.product_id}
                    GROUP BY CEP.id, DGM.id, cen_stone.name, cen_shape.name,
                    cen_colors.value, cen_clarity.value, cen_cuts.value, cen_mm_size.value,cen_carat_sizes.value)`, { type: QueryTypes.SELECT });

          let diamondRate: any = await req.body.db_connection.query(
            `(SELECT 
    SUM(
        (CASE WHEN ${productData.dataValues.dia_type} = 1 THEN PDGM.rate ELSE PDGM.synthetic_rate END) 
        * (CASE WHEN COALESCE(prod_dia_total_count::int, 0) % 2::numeric  = 0 THEN CPDO.dia_count ELSE CPDO.prod_dia_total_count END) 
        * CAST(side_carat.value AS DOUBLE PRECISION)
    ) 
    + 
    COALESCE(SUM(
        (CASE WHEN ${productData.dataValues.dia_type} = 1 THEN CDGM.rate ELSE CDGM.synthetic_rate END) 
        * CEPD.dia_count 
        * CAST(center_carat.value AS DOUBLE PRECISION)
    ), 0) AS total_rate
FROM 
    CONFIG_ETERNITY_PRODUCTS AS CPDO
    LEFT JOIN CONFIG_ETERNITY_PRODUCT_DIAMONDS AS CEPD ON CEPD.config_eternity_product_id = CPDO.id
    LEFT JOIN DIAMOND_GROUP_MASTERS AS PDGM ON CPDO.diamond_group_id = PDGM.ID AND PDGM.is_deleted = '${DeletedStatus.No}'
    LEFT JOIN carat_sizes AS side_carat ON side_carat.id = PDGM.id_carat
    LEFT JOIN DIAMOND_GROUP_MASTERS AS CDGM ON CEPD.id_diamond_group = CDGM.ID
    LEFT JOIN carat_sizes AS center_carat ON center_carat.id = CDGM.id_carat
WHERE 
    CPDO.ID = ${product.product_id} AND CPDO.is_deleted = '${DeletedStatus.No}')`,
            { type: QueryTypes.SELECT }
          );
          const metalRates: any = await req.body.db_connection.query(
            `SELECT CASE
                WHEN CPMO.KARAT_ID IS NULL THEN (SUM(METAL_WT * (METAL_MASTER.METAL_RATE)) + COALESCE(SUM(CPMO.LABOUR_CHARGE),0))
                ELSE (SUM(METAL_WT * (METAL_MASTER.METAL_RATE / METAL_MASTER.CALCULATE_RATE * GOLD_KTS.CALCULATE_RATE)) + COALESCE(SUM(CPMO.LABOUR_CHARGE),0))
              END AS METAL_RATE
                FROM CONFIG_ETERNITY_PRODUCT_METALS AS CPMO
                LEFT OUTER JOIN METAL_MASTERS AS METAL_MASTER ON METAL_MASTER.ID = CPMO.METAL_ID
                LEFT OUTER JOIN GOLD_KTS ON GOLD_KTS.ID = CPMO.KARAT_ID
                WHERE CPMO.CONFIG_ETERNITY_ID = ${product.product_id}
                GROUP BY CONFIG_ETERNITY_ID,
            CPMO.KARAT_ID,
            CPMO.METAL_ID`,
            { type: QueryTypes.SELECT }
          );

          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: parseFloat(productData.dataValues.other_charge),
              makring_charge: parseFloat(productData.dataValues.labour_charge),
              diamond_count: productData.dataValues.prod_dia_total_count,
              diamond_rate: diamondRate[0].total_rate,
              metal_rate: metalRates[0].metal_rate,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productDetail[0],
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (
          AllProductTypes.BraceletConfigurator == product.product_type
        ) {
          /* ---------------BRACELET PRODUCT----------------------- */
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          const productData = await ConfigBraceletProduct.findOne({
            where: {
              id: product.product_id,
              is_deleted: DeletedStatus.No,
              company_info_id: company_info_id?.data,
            },
          });

          if (!(productData && productData.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: BRACELET_PRODUCT_NOT_FOUND });
          }

          let diamondRate: any = await req.body.db_connection.query(
            `(SELECT (COALESCE(SUM(${productData.dataValues.product_diamond_type == 1 ? `PDGM.RATE` : `PDGM.SYNTHETIC_RATE`} * CPDO.DIA_COUNT * CPDO.DIA_WT),0)) AS sum FROM CONFIG_BRACELET_PRODUCT_DIAMONDS AS CPDO LEFT JOIN DIAMOND_GROUP_MASTERS AS PDGM ON PDGM.ID = ID_DIAMOND_GROUP_MASTER AND PDGM.IS_DELETED = '${DeletedStatus.No}' WHERE CPDO.CONFIG_PRODUCT_ID = ${product.product_id} GROUP BY CONFIG_PRODUCT_ID)`,
            { type: QueryTypes.SELECT }
          );

          const metalRates: any = await req.body.db_connection.query(
            `(SELECT CASE WHEN CPMO.ID_KARAT IS NULL THEN (SUM(METAL_WT * (METAL_MASTER.METAL_RATE)) + COALESCE(SUM(CPMO.LABOUR_CHARGE),0)) ELSE (SUM(METAL_WT * (METAL_MASTER.METAL_RATE / METAL_MASTER.CALCULATE_RATE * GOLD_KTS.calculate_rate))) + COALESCE(SUM(CPMO.LABOUR_CHARGE), 0) END AS METAL_RATE FROM CONFIG_BRACELET_PRODUCT_METALS AS CPMO LEFT OUTER JOIN METAL_MASTERS AS METAL_MASTER ON METAL_MASTER.ID = CPMO.ID_METAL LEFT OUTER JOIN GOLD_KTS ON GOLD_KTS.ID = CPMO.ID_KARAT WHERE CPMO.CONFIG_PRODUCT_ID = ${product.product_id} GROUP BY CONFIG_PRODUCT_ID, CPMO.ID_KARAT, CPMO.ID_METAL)`,
            { type: QueryTypes.SELECT }
          );
          const productDetail = await req.body.db_connection.query(
            `(SELECT CBP.*, 
      
                JSONB_AGG(DISTINCT jsonb_build_object('id', CBPM.id,
                       'metal_id',CBPM.id_metal,
                       'metal_wt', CBPM.metal_wt,
                       'karat_id',CBPM.id_karat,
                       'labor_charge',CBPM.labour_charge,
                       'metal_rate',metal.metal_rate,
                       'metal_name',metal.name,
                       'karat_calculate', karat.calculate_rate)) as pmo,
                JSONB_AGG(DISTINCT jsonb_build_object('id', CBPD.id,
                       'dia_count',CBPD.dia_count,
                       'dia_weight',CBPD.dia_wt,
                       'rate', CPDGM.rate,
                       'synthetic_rate', CPDGM.synthetic_rate,
                       'stone', stone.name,
                       'shape', shape.name,
                       'color', colors.value,
                       'clarity',clarity.value,
                       'cuts',cuts.value,
                       'mm_size',mm_sizes.value,
                       'carat_size', carat_sizes.value
                      )) as PDO
                    
                    FROM config_bracelet_products as CBP
                    LEFT JOIN config_bracelet_product_metals AS CBPM ON CBPM.config_product_id = CBP.id
                    LEFT JOIN metal_masters as metal ON metal.id = CBPM.id_metal
                    LEFT JOIN gold_kts as karat ON karat.id = CBPM.id_karat
                    LEFT JOIN config_bracelet_product_diamonds AS CBPD ON CBPD.config_product_id = CBP.id
                    LEFT JOIN diamond_group_masters CPDGM ON CPDGM.id = CBPD.id_diamond_group_master
                    LEFT JOIN gemstones as stone ON stone.id = CPDGM.id_stone
                    LEFT JOIN diamond_shapes AS shape ON shape.id = CPDGM.id_shape
                    LEFT JOIN colors as colors ON colors.id = CPDGM.id_color
                    LEFT JOIN clarities as clarity ON clarity.id = CPDGM.id_clarity
                    LEFT JOIN cuts as cuts ON cuts.id = CPDGM.id_cuts
                    LEFT JOIN mm_sizes ON mm_sizes.id = CPDGM.id_mm_size
                    LEFT JOIN carat_sizes ON carat_sizes.id = CPDGM.id_carat
                    WHERE CBP.id = ${product.product_id}
                    GROUP BY CBP.id)`, { type: QueryTypes.SELECT }
          )
          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: parseFloat(productData.dataValues.other_charge),
              makring_charge: parseFloat(productData.dataValues.labour_charge),
              diamond_count: productData.dataValues.prod_dia_total_count,
              diamond_rate: diamondRate[0].sum,
              metal_rate: metalRates[0].metal_rate,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productDetail[0],
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (AllProductTypes.LooseDiamond == product.product_type) {
          /* ---------------Loose Diamond----------------------- */
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          const productData = await LooseDiamondGroupMasters.findOne({
            where: {
              id: product.product_id,
              is_deleted: DeletedStatus.No,
              company_info_id: company_info_id?.data,
            },
          });

          if (!(productData && productData.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: RING_CONFIG_PRODUCT_NOT_FOUND });
          }

          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: 0,
              makring_charge: 0,
              diamond_count: null,
              diamond_rate: null,
              metal_rate: null,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productData.dataValues,
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (AllProductTypes.SettingProduct == product.product_type || AllProductTypes.SingleTreasure == product.product_type) {
          /* ---------------SETTING PRODUCT----------------------- */
          const products = await Product.findOne({
            where: { id: product.product_id, is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, },
            include: [
              {
                required: false,
                model: ProductImage,
                as: "product_images",
                attributes: ["id", "image_path"],
                where: product.order_details_json.metal_tone
                  ? { id_metal_tone: product.order_details_json.metal_tone }
                  : {
                    image_path: {
                      [Op.like]: "%WG%", // Use Sequelize Op for a "contains" query
                    },
                  },
              },
              {
                required: false,
                model: ProductMetalOption,
                as: "PMO",
                attributes: [
                  "id",
                  "id_metal",
                  "metal_weight",
                  "id_size",
                  "id_length",
                  "id_m_tone",
                  "side_dia_weight",
                  "side_dia_count",
                  "id_karat",
                ],
                where: { is_deleted: DeletedStatus.No, id: product.variant_id, company_info_id: company_info_id?.data, },
                include: [
                  {
                    required: false,
                    model: MetalMaster,
                    as: "metal_master",
                    attributes: ["id", "metal_rate", "name"],
                    where: { company_info_id: company_info_id?.data },
                  },
                  {
                    required: false,
                    model: GoldKarat,
                    as: "metal_karat",
                    attributes: ["id", "calculate_rate", "name"],
                    where: { company_info_id: company_info_id?.data },
                  },
                ],
              },
              {
                required: false,
                model: ProductDiamondOption,
                as: "PDO",
                attributes: [
                  "id",
                  "id_diamond_group",
                  "weight",
                  "count",
                  "id_type",
                ],
                where: { is_deleted: "0", company_info_id: company_info_id?.data },
                include: [
                  {
                    required: false,
                    model: DiamondGroupMaster,
                    as: "rate",
                    attributes: ["id", "rate", "synthetic_rate", "id_stone",
                      "id_shape",
                      "id_color",
                      "id_clarity",
                      "id_mm_size",
                      "id_cuts",
                      [Sequelize.literal(`"PDO->rate->stones"."name"`), "stone_name"],
                      [Sequelize.literal(`"PDO->rate->shapes"."name"`), "shape_name"],
                      [Sequelize.literal(`"PDO->rate->colors"."value"`), "color_name"],
                      [Sequelize.literal(`"PDO->rate->clarity"."value"`), "clarity_name"],
                      [Sequelize.literal(`"PDO->rate->carats"."value"`), "carat_name"],
                      [Sequelize.literal(`"PDO->rate->cuts"."value"`), "cut_name"],
                      [Sequelize.literal(`"PDO->rate->mm_size"."value"`), "mm_size_name"],
                    ],

                    where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, company_info_id: company_info_id?.data, },
                    include: [
                      { required: false, model: DiamondShape, as: "shapes", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: StoneData, as: "stones", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: Colors, as: "colors", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: ClarityData, as: "clarity", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: DiamondCaratSize, as: "carats", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: CutsData, as: "cuts", attributes: [], where: { company_info_id: company_info_id?.data } },
                      { required: false, model: MMSizeData, as: "mm_size", attributes: [], where: { company_info_id: company_info_id?.data } },
                    ],
                  },
                ],
              },
              {
                required: false,
                model: ProductCategory,
                as: "product_categories",
                attributes: [
                  "id",
                  "id_category",
                  "id_sub_category",
                  "id_sub_sub_category",
                ],
                where: { company_info_id: company_info_id?.data },
                include: [
                  {
                    required: false,
                    model: CategoryData,
                    as: "category",
                    attributes: ["id", "category_name"],
                    where: { company_info_id: company_info_id?.data },
                  },
                ]
              },
            ],
          });
          if (!(products && products.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: SINGLE_PRODUCT_NOT_FOUND });
          }

          let diamondRate = products.dataValues.product_type == SingleProductType.VariantType ? 0 : await req.body.db_connection.query(
            `SELECT SUM((CASE
                WHEN DIAMOND_GROUP_MASTERS.RATE IS NOT NULL
                AND DIAMOND_GROUP_MASTERS.RATE != 0 THEN DIAMOND_GROUP_MASTERS.RATE
                ELSE DIAMOND_GROUP_MASTERS.SYNTHETIC_RATE
              END) * PRODUCT_DIAMOND_OPTIONS.COUNT * PRODUCT_DIAMOND_OPTIONS.WEIGHT)
            FROM PRODUCT_DIAMOND_OPTIONS
            LEFT OUTER JOIN DIAMOND_GROUP_MASTERS ON DIAMOND_GROUP_MASTERS.ID = PRODUCT_DIAMOND_OPTIONS.ID_DIAMOND_GROUP
            WHERE PRODUCT_DIAMOND_OPTIONS.ID_PRODUCT = ${product.product_id} AND PRODUCT_DIAMOND_OPTIONS.is_deleted = '${DeletedStatus.No}' ${product.product_type == AllProductTypes.SingleTreasure || product.product_type == AllProductTypes.SettingProduct  ? `AND PRODUCT_DIAMOND_OPTIONS.ID_TYPE = 2` : ''}`,
            { type: QueryTypes.SELECT }
          );
          const metalRates = products.dataValues.product_type == SingleProductType.VariantType ? 0 : await req.body.db_connection.query(
            `SELECT CASE
                WHEN PMO.ID_KARAT IS NULL THEN (METAL.METAL_RATE * PMO.METAL_WEIGHT)
                ELSE (METAL.METAL_RATE / METAL.CALCULATE_RATE * GOLD_KTS.CALCULATE_RATE * PMO.METAL_WEIGHT)
              END
              FROM PRODUCTS
              LEFT OUTER JOIN PRODUCT_METAL_OPTIONS AS PMO ON PMO.ID_PRODUCT = PRODUCTS.ID
              LEFT OUTER JOIN METAL_MASTERS AS METAL ON PMO.ID_METAL = METAL.ID
              LEFT OUTER JOIN GOLD_KTS ON PMO.ID_KARAT = GOLD_KTS.ID
              WHERE PRODUCTS.ID = ${product.product_id}
		      AND PMO.ID = ${product.variant_id}`,
            { type: QueryTypes.SELECT }
          );

          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              variant_id: product.variant_id,
              finding_charge: parseFloat(products.dataValues.finding_charge),
              makring_charge: parseFloat(products.dataValues.making_charge),
              other_charge: parseFloat(products.dataValues.other_charge),
              diamond_rate: diamondRate.map((t: any) => t.sum)[0],
              metal_rate: metalRates.map((t: any) => t.case)[0],
              sub_total: parseFloat(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: products.dataValues,
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );
        } else if (AllProductTypes.StudConfigurator == product.product_type) {
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          const findProduct: any = await req.body.db_connection.query(
            `
              ${studProductQuery} AND SCP.id = ${product.product_id} AND SCP.company_info_id = ${company_info_id?.data} AND SCP.is_active = '${ActiveStatus.Active}'
            `,
            { type: QueryTypes.SELECT }
          )

          if (findProduct.length === 0) {
            await trn.rollback();
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
          }

          const productDetail = await req.body.db_connection.query(`(${studProductQuery} AND SCP.id = ${product.product_id}
                  )`, { type: QueryTypes.SELECT });

          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: parseFloat(findProduct[0]?.other_changes),
              makring_charge: parseFloat(findProduct[0]?.laber_charge),
              diamond_count: findProduct[0]?.total_count,
              diamond_rate: Number(product?.sub_total) - Number(findProduct[0]?.metal_price),
              metal_rate: findProduct[0]?.metal_price,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productDetail[0],
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );

        } else if (AllProductTypes.PendantConfigurator == product.product_type) {
          deliverydays.push(OUT_OF_STOCK_PRODUCT_DELIVERY_TIME);
          const findProduct: any = await req.body.db_connection.query(
            `
              ${pendantProductQuery} AND CPP.id = ${product.product_id} AND CPP.company_info_id = ${company_info_id?.data} AND CPP.is_active = '${ActiveStatus.Active}'
            `,
            { type: QueryTypes.SELECT }
          )

          if (findProduct.length === 0) {
            await trn.rollback();
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Product"]]) });
          }

          const productDetail = await req.body.db_connection.query(`(${pendantProductQuery} AND CPP.id = ${product.product_id}
                  )`, { type: QueryTypes.SELECT });

          const ordersDetails = await OrdersDetails.create(
            {
              order_id: orders.dataValues.id,
              product_id: product.product_id,
              quantity: product.quantity,
              other_charge: parseFloat(findProduct[0]?.other_changes),
              makring_charge: parseFloat(findProduct[0]?.laber_charge),
              diamond_count: findProduct[0]?.total_count,
              diamond_rate: Number(product?.sub_total) - Number(findProduct[0]?.metal_price),
              metal_rate: findProduct[0]?.metal_price,
              sub_total: parseInt(product.sub_total),
              product_tax: await taxCalculationBasedOnPrice(
                parseFloat(product.sub_total),
                taxValues
              ),
              discount_amount: parseFloat(product.discount_amount),
              shipping_cost: parseFloat(product.shipping_cost),
              shipping_method_id: shipping_method,
              delivery_status: DeliverStatus.Pendding,
              payment_status: PaymentStatus.InPaid,
              order_details_json: product.order_details_json,
              product_details_json: productDetail[0],
              company_info_id: company_info_id?.data,
              offer_details: product.offer_details
            },
            { transaction: trn }
          );

        }
      }
      const orderDeliveryDay = Math.max(...deliverydays);
      await Orders.update(
        {
          delivery_days: orderDeliveryDay[0],
        },
        { where: { id: orders.dataValues.id }, transaction: trn }
      );

      if (
        app_key &&
        app_key.length !== 0 &&
        app_key == CATALOGUE_ORDER_APP_KEY
      ) {

        const admin = {
          toEmailAddress: "info@thecadco.com",
          contentTobeReplaced: {
            mail: 'admin',
            email,
            address: order_shipping_address,
            data: productDataForMail,
            order_number: orders.dataValues.order_number,
          },
        };
        const user = {
          toEmailAddress: email,
          contentTobeReplaced: {
            order_number: orders.dataValues.order_number,
            order_date: new Date(
              orders.dataValues.order_date
            ).toLocaleDateString("en-GB"),
            total_amount: orders.dataValues.invoice_amount,
            sub_total_amount: orders.dataValues.sub_total,
            total_tax: orders.dataValues.total_tax,
            discount: orders.dataValues.discount,
            data: productDataForMail,
          },
        };

        await mailCatalogueNewOrderAdminReceived(admin, company_info_id?.data, req);
        await mailCatalogueNewOrderUserReceived(user, company_info_id?.data, req);
        if (user_id && user_id !== null) {
          await CartProducts.destroy({ where: { user_id: user_id, company_info_id: company_info_id?.data } });
          await trn.commit();
          // return resSuccess({data: orders})
          return resSuccess({ data: { orderData: orders.dataValues } });
        } else {
          await trn.commit();
          // return resSuccess({data: orders})
          return resSuccess({ data: { orderData: orders.dataValues } });
        }
      } else {
        if (payment_method == paymentMethod.paypal) {
          const payPalPaymentData = await paymentPalVerification(
            order_number,
            order_total,
            currency.dataValues.code || null,
            configData,
            req.query.company_key
          );
          if (payPalPaymentData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return payPalPaymentData;
          }
          const order_transactions = {
            order_id: orders.dataValues.id,
            order_amount: order_total,
            payment_status: PaymentStatus.InPaid,
            payment_currency:
              payPalPaymentData.data.result.purchase_units[0].amount
                .currency_code,
            payment_datetime: getLocalDate(),
            payment_source_type: "visa",
            payment_json: payPalPaymentData.data.result,
            payment_transaction_id: payPalPaymentData.data.result.id,
            created_by: req.body.session_res.id_app_user,
            company_info_id: company_info_id?.data,
            created_date: getLocalDate(),
          };
          await OrderTransaction.create(order_transactions, {
            transaction: trn,
          });
          await trn.commit();
          // return resSuccess({data: orders})

          return resSuccess({
            data: {
              paypalData: payPalPaymentData.data.result,
              orderData: orders.dataValues,
            },
          });
        } else if (payment_method == paymentMethod.stripe) {
          const stripePamentData = await stripePaymentVerification(
            order_total,
            currency.dataValues.code || null,
            ordersPayload.order_number,
            orders.dataValues.id,
            req.body.session_res.id_app_user,
            company_info_id,
            configData,
            req.query.company_key
          );
          if (stripePamentData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return stripePamentData;
          }
          await trn.commit();
          // return resSuccess({data: orders})

          return resSuccess({
            data: {
              stripeData: stripePamentData.data,
              orderData: orders.dataValues,
            },
          });
        } else if (payment_method == paymentMethod.razorpay) {
          const razorpay = new Razorpay({
            key_id: configData.razorpay_public_key,
            key_secret: configData.razorpay_secret_key,
          });
          const options = {
            amount: Number((order_total * 100).toFixed(0)),
            currency: currency.dataValues.code || null,
            notes: {
              order_number: ordersPayload.order_number,
              order_id: orders.dataValues.id,
              company_info_id: company_info_id?.data,
              company_key: req.query.company_key
            },

          };

          try {
            const order = await razorpay.orders.create(options);
            await trn.commit();
            return resSuccess({
              data: { orderData: orders.dataValues, razorpayData: order },
            });
          } catch (error: any) {
            await trn.rollback();
            return resUnknownError({
              message:
                error.error && error.error.description
                  ? error.error.description
                  : error,
              data: error,
            });
          }
        } else {
          await trn.commit();
          // return resSuccess({data: orders})
          // await refreshMaterializedProductListView(req.body.db_connection);
          return resSuccess({ data: { orderData: orders.dataValues } });
        }
      }
    } catch (error) {
      await trn.rollback();
      return resUnknownError({ data: error });
    }
  } catch (error) {
    throw error;
  }
};

const paymentPalVerification = async (order_number: any, amount: any, currency: any, configData: any, company_key: any) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `${configData.order_invoice_number_identity}-${order_number}`,
        description: company_key,
        amount: {
          currency_code: currency,
          value: amount,
          breakdown: {
            item_total: {
              currency_code: currency,
              value: amount,
            },
          },
        },
      },
    ],
  });

  try {
    const Environment =
      PROCESS_ENVIRONMENT == "development"
        ? paypal.core.SandboxEnvironment
        : paypal.core.LiveEnvironment;
    const paypalClient = new paypal.core.PayPalHttpClient(
      new Environment(configData.paypal_public_key, configData.paypal_secret_key)
    );
    const order = await paypalClient.execute(request);
    return resSuccess({ data: order });
  } catch (e: any) {
    return resUnknownError({ data: e.message });
  }
};

const stripePaymentVerification = async (
  amount: any,
  currency: any,
  order_number: any,
  order_id: any,
  created_by: any,
  company_info_id: any,
  configData: any,
  company_key: any
) => {
  try {
    const stripe = require("stripe")(configData.stripe_secret_key, {
      apiVersion: "2023-10-16",
      appInfo: {
        name: "stripe-samples/accept-a-payment/payment-element",
        version: "0.0.2",
        url: "https://github.com/stripe-samples",
      },
    });
    const paymentIntent = await stripe.paymentIntents.create({
      currency: currency,
      amount: parseInt(amount) * 100,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_number: order_number,
        order_id: order_id,
        order_amount: amount,
        created_by: created_by,
        company_info_id: company_info_id?.data,
        company_key: company_key
      },
    });

    return resSuccess({ data: paymentIntent });
  } catch (error) {
    return resUnknownError({ data: error });
  }
};
export const allTypeProductPaymentTransactionWithPaypal = async (
  req: Request
) => {
  try {
    //   const {
    //     order_id,
    //     order_number,
    //     amount,
    //     status,
    //     currency,
    //     response_json,
    //     paypal_order_id,
    //   } = req.body;
    //   let invoiceDetails: any;
    //   let errors: {
    //     error_status: number;
    //     error_message: any;
    //   }[] = [];

    //   const orderValidate = await Orders.findOne({
    //     where: {
    //       id: order_id,
    //     },
    //   });

    //   if (!(orderValidate && orderValidate.dataValues)) {
    //     return resNotFound({ message: ORDER_NOT_FOUND });
    //   }

    //   const orderNameValidate = await Orders.findOne({
    //     where: {
    //       id: order_id,
    //       order_number: order_number,
    //     },
    //   });

    //   if (!(orderNameValidate && orderNameValidate.dataValues)) {
    //     return resNotFound({ message: ORDER_NUMBER_IS_INVALID });
    //   }

    //   const orderAmontValidate = await Orders.findOne({
    //     where: {
    //       id: order_id,
    //       order_number: order_number,
    //       order_total: amount,
    //     },
    //   });

    //   if (!(orderAmontValidate && orderAmontValidate.dataValues)) {
    //     return resNotFound({ message: ORDER_AMOND_WRONG });
    //   }

    //   const order_details = await OrdersDetails.findAll({
    //     where: { order_id: orderAmontValidate.dataValues.id },
    //   });

    //   let i = (await Invoives.count()) + 1;

    //   const invoice_number = i.toString().padStart(INVOICE_NUMBER_DIGIT, "0");
    //   const trn = await (req.body.db_connection).transaction();

    //   if (status == "SUCCESS") {
    //     try {
    //       const order_transactions = {
    //         order_id: order_id,
    //         order_amount: parseFloat(amount),
    //         payment_status: PaymentStatus.paid,
    //         payment_currency: currency,
    //         payment_datetime: getLocalDate(),
    //         payment_source_type: "visa",
    //         payment_json: response_json,
    //         payment_transaction_id: paypal_order_id,
    //         created_by: req.body.session_res.id_app_user,
    //         created_date: getLocalDate(),
    //       };
    //       const orders = await OrderTransaction.create(order_transactions, {
    //         transaction: trn,
    //       });

    //       await Orders.update(
    //         {
    //           payment_status: PaymentStatus.paid,
    //           modified_date: getLocalDate(),
    //           modified_by: req.body.session_res.id_app_user,
    //         },
    //         { where: { id: order_id }, transaction: trn }
    //       );

    //       await OrdersDetails.update(
    //         {
    //           payment_status: PaymentStatus.paid,
    //         },
    //         { where: { order_id: order_id }, transaction: trn }
    //       );

    //       for (let value of order_details) {
    //         if (
    //           (value.dataValues.order_details_json.product_type ==
    //             AllProductTypes.Product ||
    //             value.dataValues.order_details_json.product_type ==
    //               AllProductTypes.SettingProduct) &&
    //           value.dataValues.variant_id
    //         ) {
    //           const products = await ProductMetalOption.findOne({
    //             where: {
    //               id_product: value.dataValues.product_id,
    //               id: value.dataValues.variant_id,
    //             },
    //             transaction: trn,
    //           });
    //           await ProductMetalOption.update(
    //             {
    //               remaing_quantity_count:
    //                 products.dataValues.remaing_quantity_count &&
    //                 products.dataValues.remaing_quantity_count != null
    //                   ? products.dataValues.remaing_quantity_count -
    //                     value.dataValues.quantity
    //                   : products.dataValues.remaing_quantity_count,
    //             },
    //             { where: { id: products.dataValues.id }, transaction: trn }
    //           );
    //         }
    //       }

    //       const invoiceData = {
    //         invoice_number: `${ORDER_NUMBER_IDENTITY}-${invoice_number}`,
    //         invoice_date: getLocalDate(),
    //         invoice_amount: amount,
    //         billing_address: orderAmontValidate.dataValues.order_billing_address,
    //         shipping_address:
    //           orderAmontValidate.dataValues.order_shipping_address,
    //         order_id: orderAmontValidate.dataValues.id,
    //         transaction_id: orders.dataValues.id,
    //         created_date: getLocalDate(),
    //         created_by: req.body.session_res.id_app_user,
    //       };
    //       invoiceDetails = await Invoives.create(invoiceData, {
    //         transaction: trn,
    //       });
    //       await trn.commit();
    //       // return resSuccess()
    //     } catch (error) {
    //       await trn.rollback();
    //       return resUnknownError({ data: error });
    //     }
    //   } else if (status == "ERROR") {
    //     try {
    //       const order_transactions = {
    //         order_id: order_id,
    //         order_amount: amount,
    //         payment_status: PaymentStatus.Failed,
    //         payment_datetime: getLocalDate(),
    //         payment_json: response_json,
    //         created_by: req.body.session_res.id_app_user,
    //         created_date: getLocalDate(),
    //       };
    //       await OrderTransaction.create(order_transactions, { transaction: trn });

    //       await Orders.update(
    //         {
    //           order_status: OrderStatus.Failed,
    //           payment_status: PaymentStatus.Failed,
    //           modified_date: getLocalDate(),
    //           modified_by: req.body.session_res.id_app_user,
    //         },
    //         { where: { id: order_id }, transaction: trn }
    //       );

    //       await OrdersDetails.update(
    //         {
    //           payment_status: PaymentStatus.Failed,
    //         },
    //         { where: { order_id: order_id }, transaction: trn }
    //       );

    //       await trn.commit();
    //       return resUnknownError({
    //         code: UNPROCESSABLE_ENTITY_CODE,
    //         message: TRANSACTION_FAILD_MESSAGE,
    //       });
    //     } catch (error) {
    //       await trn.rollback();
    //       return resUnknownError({ data: error });
    //     }
    //   }

    //   const result: any = await Invoives.findOne({
    //     where: { order_id: invoiceDetails.dataValues.order_id },
    //     attributes: [
    //       "id",
    //       "invoice_number",
    //       "invoice_date",
    //       "invoice_amount",
    //       "billing_address",
    //       "shipping_address",
    //       "order_id",
    //       [
    //         Sequelize.literal(
    //           `(SELECT contries.country_name FROM contries WHERE id= CAST (shipping_address ->> 'country_id' AS integer))`
    //         ),
    //         "shipping_country",
    //       ],
    //       [
    //         Sequelize.literal(
    //           `(SELECT state_name FROM states WHERE id=  CAST (shipping_address ->> 'state_id' AS integer))`
    //         ),
    //         "shipping_state",
    //       ],
    //       [
    //         Sequelize.literal(
    //           `(SELECT city_name FROM cities WHERE id =  CAST (shipping_address ->> 'city_id' AS integer))`
    //         ),
    //         "shipping_city",
    //       ],
    //       [
    //         Sequelize.literal(
    //           `(SELECT contries.country_name FROM contries WHERE id= CAST (billing_address ->> 'country_id' AS integer))`
    //         ),
    //         "billing_country",
    //       ],
    //       [
    //         Sequelize.literal(
    //           `(SELECT state_name FROM states WHERE id=  CAST (billing_address ->> 'state_id' AS integer))`
    //         ),
    //         "billing_state",
    //       ],
    //       [
    //         Sequelize.literal(
    //           `(SELECT city_name FROM cities WHERE id =  CAST (billing_address ->> 'city_id' AS integer))`
    //         ),
    //         "billing_city",
    //       ],
    //       // [Sequelize.literal(`(SELECT payment_transaction_id FROM order_transactions WHERE order_id = ${invoiceDetails.dataValues.order_id})`), "transactions_id"]
    //     ],
    //     include: [
    //       {
    //         model: Orders,
    //         as: "order_invoice",
    //         attributes: [
    //           "id",
    //           "order_number",
    //           "discount",
    //           "email",
    //           "total_tax",
    //           "order_date",
    //           "payment_method",
    //           "shipping_cost",
    //           "sub_total",
    //           "order_taxs",
    //         ],
    //         include: [
    //           {
    //             model: OrdersDetails,
    //             as: "order",
    //             attributes: [
    //               "quantity",
    //               "sub_total",
    //               "product_tax",
    //               "order_details_json",
    //               "product_id",
    //               "variant_id",
    //               [
    //                 Sequelize.literal(
    //                   `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT CONCAT('${IMAGE_PATH}/' ,image_path) FROM product_images WHERE id = CAST (order_details_json ->> 'image_id' AS integer)) WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT CONCAT('${IMAGE_PATH}/' ,image_path) FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT CONCAT('${IMAGE_PATH}/', image_path) FROM loose_diamond_group_masters where id = "product_id") ELSE (SELECT CONCAT('${IMAGE_PATH}/' ,image_path) FROM images where id = CAST (order_details_json ->> 'image_id' AS integer)) END`
    //                 ),
    //                 "product_image",
    //               ],
    //               [Sequelize.literal("order_total"), "product_price"],
    //               [
    //                 Sequelize.literal(
    //                   `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") ELSE null END`
    //                 ),
    //                 "product_title",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
    //                 ),
    //                 "product_sku",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
    //                 ),
    //                 "product_slug",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (order_details_json ->> 'metal_id' AS integer))`
    //                 ),
    //                 "metal",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `(SELECT gold_kts.name FROM gold_kts WHERE gold_kts.id = CAST (order_details_json ->> 'karat_id' AS integer))`
    //                 ),
    //                 "Karat",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `(SELECT metal_tones.name FROM metal_tones WHERE metal_tones.id = CAST (order_details_json ->> 'metal_tone' AS integer))`
    //                 ),
    //                 "Metal_tone",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'head_metal_tone' AS integer))`
    //                 ),
    //                 "head_metal_tone",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `(SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'shank_metal_tone' AS integer))`
    //                 ),
    //                 "shank_metal_tone",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `CASE WHEN (order_details_json ->> 'band_metal_tone') = 'null' THEN null ELSE (SELECT name FROM metal_tones WHERE id = CAST (order_details_json ->> 'band_metal_tone' AS integer)) END`
    //                 ),
    //                 "band_metal_tone",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `CAST (order_details_json ->> 'head_metal_tone' AS integer)`
    //                 ),
    //                 "head_metal_tone_id",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   ` CAST (order_details_json ->> 'shank_metal_tone' AS integer)`
    //                 ),
    //                 "shank_metal_tone_id",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   ` CAST (order_details_json ->> 'band_metal_tone' AS integer)`
    //                 ),
    //                 "band_metal_tone_id",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `(SELECT items_sizes.size FROM items_sizes WHERE items_sizes.id = CAST (order_details_json ->> 'size_id' AS integer))`
    //                 ),
    //                 "product_size",
    //               ],
    //               [
    //                 Sequelize.literal(
    //                   `(SELECT items_lengths.length FROM items_lengths WHERE items_lengths.id = CAST (order_details_json ->> 'length_id' AS integer))`
    //                 ),
    //                 "product_length",
    //               ],
    //             ],
    //             required: false,
    //           },
    //         ],
    //       },
    //     ],
    //   });

    //   let logo_image = IMAGE_PATH;
    //   let frontend_url = FRONT_END_BASE_URL;
    //   const taxData = JSON.parse(result.dataValues.order_invoice.order_taxs);
    //   const productData: any = [];

    //   for (const data of result.dataValues.order_invoice.order) {
    //     let engravingValue: any;
    //     let singleEngravingStr: any;
    //     if (
    //       data.order_details_json.product_type ==
    //         AllProductTypes.BirthStone_product &&
    //       data.order_details_json.engraving &&
    //       data.order_details_json.engraving.length > 0
    //     ) {
    //       for (
    //         let index = 0;
    //         index < data.order_details_json.engraving.length;
    //         index++
    //       ) {
    //         const element = data.order_details_json.engraving[index];
    //         if (element.value) {
    //           singleEngravingStr = `${element.text}: ${element.value}`;
    //           engravingValue = engravingValue
    //             ? engravingValue + "|" + " " + singleEngravingStr
    //             : singleEngravingStr;
    //         }
    //       }
    //     }
    //     productData.push({
    //       ...data.dataValues,
    //       engraving_value: engravingValue,
    //       engraving:
    //         AllProductTypes.Config_Ring_product ==
    //         data.order_details_json.product_type
    //           ? data.order_details_json.engraving
    //           : "",
    //       product_type: data.order_details_json.product_type,
    //       metal: data.dataValues.metal ? data.dataValues.metal : "",
    //       Karat: data.dataValues.Karat ? data.dataValues.Karat : "",
    //       Metal_tone: data.dataValues.Metal_tone
    //         ? data.dataValues.Metal_tone
    //         : "",
    //       product_size: data.dataValues.product_size
    //         ? data.dataValues.product_size
    //         : "",
    //       product_length: data.dataValues.product_length
    //         ? data.dataValues.product_length
    //         : "",
    //       currency: APP_CURRENCY,
    //       product_price: getPriceFormat(
    //         data.dataValues.sub_total + data.dataValues.product_tax
    //       ),
    //       sub_total: getPriceFormat(data.dataValues.sub_total),
    //       font_style: data.order_details_json?.font_style
    //         ? data.order_details_json?.font_style
    //         : null,
    //     });
    //   }

    //   const userData = await customerUser.findOne({
    //     where: { id_app_user: orderValidate.dataValues.user_id },
    //   });
    //   const mailNewOrderPayload = {
    //     toEmailAddress: result.dataValues.order_invoice.email,
    //     contentTobeReplaced: {
    //       name: userData?.dataValues.full_name
    //         ? userData?.dataValues.full_name
    //         : result.dataValues.billing_address.full_name,
    //       toBeReplace: {
    //         invoice_number: result.dataValues.invoice_number,
    //         invoice_date: new Date(
    //           result.dataValues.invoice_date
    //         ).toLocaleDateString("en-GB"),
    //         total_amount: getPriceFormat(result.dataValues.invoice_amount),
    //         sub_total_amount: getPriceFormat(
    //           result.dataValues.order_invoice.sub_total
    //         ),
    //         currency: APP_CURRENCY,
    //         total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
    //         discount: result.dataValues.order_invoice.discount,
    //         shipping_cost: getPriceFormat(
    //           result.dataValues.order_invoice.shipping_cost
    //         ),
    //         order_number: result.dataValues.order_invoice.order_number,
    //         payment_method:
    //           PAYMENT_METHOD_ID_FROM_LABEL[
    //             result.dataValues.order_invoice.payment_method
    //           ],
    //         order_date: new Date(
    //           result.dataValues.order_invoice.order_date
    //         ).toLocaleDateString("en-GB"),
    //         billing_address: {
    //           house_builing: result.dataValues.billing_address.house_builing,
    //           area_name: result.dataValues.billing_address.area_name,
    //           city: result.dataValues.billing_city,
    //           state: result.dataValues.billing_state,
    //           country: result.dataValues.billing_country,
    //           pincode: result.dataValues.billing_address.pincode,
    //         },
    //         shipping_address: {
    //           house_builing: result.dataValues.shipping_address.house_builing,
    //           area_name: result.dataValues.shipping_address.area_name,
    //           city: result.dataValues.shipping_city,
    //           state: result.dataValues.shipping_state,
    //           country: result.dataValues.shipping_country,
    //           pincode: result.dataValues.shipping_address.pincode,
    //         },
    //         tax_array: taxData,
    //         data: productData,
    //         logo_image,
    //         frontend_url,
    //       },
    //     },
    //     attachments: {
    //       toBeReplace: {
    //         invoice_number: result.dataValues.invoice_number,
    //         invoice_date: new Date(
    //           result.dataValues.invoice_date
    //         ).toLocaleDateString("en-GB"),
    //         pdf_app_logo: INVOICE_LOGO_IMAGE_BASE64,
    //         currency: APP_CURRENCY,
    //         company_number: COMPANY_NUMBER,
    //         company_address: COMPANY_ADDRESS,
    //         total_amount: getPriceFormat(result.dataValues.invoice_amount),
    //         sub_total_amount: getPriceFormat(
    //           result.dataValues.order_invoice.sub_total
    //         ),
    //         total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
    //         discount: getPriceFormat(result.dataValues.order_invoice.discount),
    //         shipping_cost: getPriceFormat(
    //           result.dataValues.order_invoice.shipping_cost
    //         ),
    //         order_number: result.dataValues.order_invoice.order_number,
    //         billing_address: {
    //           house_builing: result.dataValues.billing_address.house_builing,
    //           area_name: result.dataValues.billing_address.area_name,
    //           city: result.dataValues.billing_city,
    //           state: result.dataValues.billing_state,
    //           country: result.dataValues.billing_country,
    //           pincode: result.dataValues.billing_address.pincode,
    //         },
    //         shipping_address: {
    //           house_builing: result.dataValues.shipping_address.house_builing,
    //           area_name: result.dataValues.shipping_address.area_name,
    //           city: result.dataValues.shipping_city,
    //           state: result.dataValues.shipping_state,
    //           country: result.dataValues.shipping_country,
    //           pincode: result.dataValues.shipping_address.pincode,
    //         },
    //         tax_array: taxData,
    //         data: productData,
    //         logo_image,
    //         frontend_url,
    //       },
    //       filename: "invoice.pdf",
    //       content: "../../../templates/mail-template/Tax-invoice.html",
    //     },
    //   };

    //   const admin = {
    //     toEmailAddress: "info@thecadco.com",
    //     contentTobeReplaced: {
    //       name: userData?.dataValues.full_name
    //         ? userData?.dataValues.full_name
    //         : result.dataValues.billing_address.full_name,
    //       toBeReplace: {
    //         invoice_number: result.dataValues.invoice_number,
    //         invoice_date: new Date(
    //           result.dataValues.invoice_date
    //         ).toLocaleDateString("en-GB"),
    //         total_amount: getPriceFormat(result.dataValues.invoice_amount),
    //         sub_total_amount: getPriceFormat(
    //           result.dataValues.order_invoice.sub_total
    //         ),
    //         total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
    //         discount: getPriceFormat(result.dataValues.order_invoice.discount),
    //         shipping_cost: getPriceFormat(
    //           result.dataValues.order_invoice.shipping_cost
    //         ),
    //         order_number: result.dataValues.order_invoice.order_number,
    //         payment_method:
    //           PAYMENT_METHOD_ID_FROM_LABEL[
    //             result.dataValues.order_invoice.payment_method
    //           ],
    //         order_date: new Date(
    //           result.dataValues.order_invoice.order_date
    //         ).toLocaleDateString("en-GB"),
    //         billing_address: {
    //           house_builing: result.dataValues.billing_address.house_builing,
    //           area_name: result.dataValues.billing_address.area_name,
    //           city: result.dataValues.billing_city,
    //           state: result.dataValues.billing_state,
    //           country: result.dataValues.billing_country,
    //         },
    //         shipping_address: {
    //           house_builing: result.dataValues.shipping_address.house_builing,
    //           area_name: result.dataValues.shipping_address.area_name,
    //           city: result.dataValues.shipping_city,
    //           state: result.dataValues.shipping_state,
    //           country: result.dataValues.shipping_country,
    //         },
    //         tax_array: taxData,
    //         data: productData,
    //         logo_image,
    //         frontend_url,
    //       },
    //     },
    //   };

    //   await mailNewOrderReceived(mailNewOrderPayload);
    //   await mailNewOrderAdminReceived(admin);
    //   for (const items of order_details) {
    //     if (orderAmontValidate.dataValues.user_id) {
    //       await CartProducts.destroy({
    //         where: {
    //           user_id: orderAmontValidate.dataValues.user_id,
    //           product_id: items.dataValues.product_id,
    //         },
    //       });
    //     }
    //   }
    //   const cart_list_count = await CartProducts.count({
    //     where: { user_id: orderAmontValidate.dataValues.user_id },
    //   });

    return resSuccess({ data: 0 });
  } catch (error) {
    throw error;
  }
};

export const allTypeProductPaymentTransactionWithAffirm = async (
  req: Request
) => {
  try {
    const { Orders, OrdersDetails, Invoices, OrderTransaction, ProductMetalOption, CustomerUser, CurrencyData, CompanyInfo, CartProducts } = initModels(req);
    const {
      order_id,
      order_number,
      amount,
      status,
      currency,
      response_json,
      checkout_id,
    } = req.body;
    let invoiceDetails: any;
    let errors: {
      error_status: number;
      error_message: any;
    }[] = [];
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const trn = await (req.body.db_connection).transaction();

    const orderValidate = await Orders.findOne({
      where: {
        id: order_id, company_info_id: company_info_id?.data
      },
    });

    if (!(orderValidate && orderValidate.dataValues)) {
      return resNotFound({ message: ORDER_NOT_FOUND });
    }

    const orderNameValidate = await Orders.findOne({
      where: {
        id: order_id,
        order_number: order_number,
        company_info_id: company_info_id?.data,
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
        company_info_id: company_info_id?.data,
      },
    });

    if (!(orderAmontValidate && orderAmontValidate.dataValues)) {
      return resNotFound({ message: ORDER_AMOUNT_WRONG });
    }

    const order_details = await OrdersDetails.findAll({
      where: { order_id: orderAmontValidate.dataValues.id, company_info_id: company_info_id?.data },
    });

    let i = (await Invoices.count()) + 1;
    const configData = await getWebSettingData(req.body.db_connection, company_info_id?.data);

    const invoice_number = i.toString().padStart(configData.invoice_number_generate_digit_count, "0");

    if (status == "SUCCESS") {
      const token = Buffer.from(
        `${configData.affirm_public_key}:${configData.affirm_secret_key}`,
        "utf8"
      ).toString("base64");

      const affirmPayment = await axios
        .post(
          AFFIRM_TRANSACTION_API_URL,
          {
            transaction_id: checkout_id,
            order_id: order_number,
          },
          {
            headers: {
              Authorization: `Basic ${token}`,
            },
          }
        )
        .then((res: any) => {
          return res;
        })
        .catch((error: any) => {
          return error;
        });

      if (affirmPayment.status == DEFAULT_STATUS_CODE_SUCCESS) {
        try {
          const order_transactions = {
            order_id: order_id,
            order_amount: parseFloat(amount),
            payment_status: PaymentStatus.paid,
            payment_currency: currency,
            payment_datetime: getLocalDate(),
            payment_source_type: "visa",
            payment_json: response_json,
            payment_transaction_id: affirmPayment.data.id,
            created_by: req.body.session_res.id_app_user,
            company_info_id: company_info_id?.data,
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
            { where: { id: order_id, company_info_id: company_info_id?.data }, transaction: trn }
          );

          await OrdersDetails.update(
            {
              payment_status: PaymentStatus.paid,
            },
            { where: { order_id: order_id, company_info_id: company_info_id?.data }, transaction: trn }
          );

          for (let value of order_details) {
            if (
              value.dataValues.order_details_json.product_type ==
              AllProductTypes.Product &&
              value.dataValues.variant_id
            ) {
              const products = await ProductMetalOption.findOne({
                where: {
                  id_product: value.dataValues.product_id,
                  id: value.dataValues.variant_id,
                  company_info_id: company_info_id?.data,
                },
                transaction: trn,
              });
              await ProductMetalOption.update(
                {
                  remaing_quantity_count:
                    products.dataValues.remaing_quantity_count &&
                      products.dataValues.remaing_quantity_count != null
                      ? products.dataValues.remaing_quantity_count -
                      value.dataValues.quantity
                      : products.dataValues.remaing_quantity_count,
                },
                { where: { id: products.dataValues.id, company_info_id: company_info_id?.data }, transaction: trn }
              );
            }
          }
          const configData = await getWebSettingData(req.body.db_connection, company_info_id?.data);

          const invoiceData = {
            invoice_number: `${configData.order_invoice_number_identity}-${invoice_number}`,
            invoice_date: getLocalDate(),
            invoice_amount: amount,
            billing_address:
              orderAmontValidate.dataValues.order_billing_address,
            shipping_address:
              orderAmontValidate.dataValues.order_shipping_address,
            order_id: orderAmontValidate.dataValues.id,
            transaction_id: orders.dataValues.id,
            created_date: getLocalDate(),
            created_by: req.body.session_res.id_app_user,
            company_info_id: company_info_id?.data,
          };
          invoiceDetails = await Invoices.create(invoiceData, {
            transaction: trn,
          });
          await trn.commit();
          // return resSuccess()
        } catch (error) {
          await trn.rollback();
          return resUnknownError({ data: error });
        }
      } else {
        await trn.rollback();
        return resUnknownError({ data: affirmPayment });
      }
    } else if (status == "ERROR") {
      try {
        const order_transactions = {
          order_id: order_id,
          order_amount: amount,
          payment_status: PaymentStatus.Failed,
          payment_datetime: getLocalDate(),
          payment_json: response_json,
          created_by: req.body.session_res.id_app_user,
          company_info_id: company_info_id?.data,
          created_date: getLocalDate(),
        };
        await OrderTransaction.create(order_transactions, { transaction: trn });

        await Orders.update(
          {
            order_status: OrderStatus.Failed,
            payment_status: PaymentStatus.Failed,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
          { where: { id: order_id, company_info_id: company_info_id?.data }, transaction: trn }
        );

        await OrdersDetails.update(
          {
            payment_status: PaymentStatus.Failed,
          },
          { where: { order_id: order_id, company_info_id: company_info_id?.data }, transaction: trn }
        );

        await trn.commit();
        return resUnknownError({
          code: UNPROCESSABLE_ENTITY_CODE,
          message: TRANSACTION_FAIL_MESSAGE,
        });
      } catch (error) {
        await trn.rollback();
        return resUnknownError({ data: error });
      }
    }

    const result: any = await Invoices.findOne({
      where: { order_id: order_id, company_info_id: company_info_id?.data },
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
            "order_number",
            "discount",
            "email",
            "total_tax",
            "order_date",
            "shipping_cost",
            "sub_total",
            "order_taxs",
            "payment_method",
            "currency_id"
          ],
          where: { company_info_id: company_info_id?.data },
          include: [
            {
              model: OrdersDetails,
              as: "order",
              where: { company_info_id: company_info_id?.data },
              attributes: [
                "quantity",
                "sub_total",
                "product_tax",
                "order_details_json",
                "product_details_json",
                "product_id",
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT CONCAT('${configData.image_base_url}' ,image_path) FROM product_images WHERE id = CAST (order_details_json ->> 'image_id' AS integer)) WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT CONCAT('${configData.image_base_url}' ,image_path) FROM gift_set_product_images WHERE id_product = "product_id" AND image_type = 1 AND is_deleted = '0') WHEN  CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT CONCAT('${configData.image_base_url}', image_path) FROM loose_diamond_group_masters where id = "product_id") ELSE (SELECT CONCAT('${configData.image_base_url}' ,image_path) FROM images where id = CAST (order_details_json ->> 'image_id' AS integer)) END`
                  ),
                  "product_image",
                ],
                [Sequelize.literal("order_total"), "product_price"],
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT name FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT product_title from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT product_title from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT name from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT product_title from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT product_title from config_bracelet_products WHERE id = "product_id") ELSE null END`
                  ),
                  "product_title",
                ],
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT sku FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT sku from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT sku from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT sku from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT sku from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT sku from config_bracelet_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
                  ),
                  "product_sku",
                ],
                [
                  Sequelize.literal(
                    `CASE WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Product} THEN (SELECT slug FROM products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.GiftSet_product} THEN (SELECT slug from gift_set_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Config_Ring_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Three_stone_config_product} THEN (SELECT slug from config_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BirthStone_product} THEN (SELECT slug from birthstone_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.Eternity_product} THEN (SELECT slug from config_eternity_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.BraceletConfigurator} THEN (SELECT slug from config_bracelet_products WHERE id = "product_id") WHEN CAST (order_details_json ->> 'product_type' AS integer) = ${AllProductTypes.LooseDiamond} THEN (SELECT stock_id from loose_diamond_group_masters WHERE id = "product_id") ELSE null END`
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
              ],
              required: false,
            },
          ],
        },
      ],
    });
    let findCurrency
    if (result.dataValues.order_invoice) {
      findCurrency = await CurrencyData.findOne({ where: { id: result.dataValues.order_invoice.currency_id, company_info_id: company_info_id?.data } })
    } else {
      findCurrency = await CurrencyData.findOne({ where: { is_default: "1", company_info_id: company_info_id?.data } })

    }
    let logo_image = configData.image_base_url;
    let frontend_url = configData.fronted_base_url;
    const taxData = JSON.parse(result.dataValues.order_invoice.order_taxs);
    const productData: any = [];
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
        currency: findCurrency.dataValues.symbol,
        product_price: getPriceFormat(
          data.dataValues.sub_total + data.dataValues.product_tax
        ),
        sub_total: getPriceFormat(data.dataValues.sub_total),
        font_style: data.order_details_json?.font_style
          ? data.order_details_json?.font_style
          : null,
      });
    }

    const userData = await CustomerUser.findOne({
      where: { id_app_user: orderValidate.dataValues.user_id, company_info_id: company_info_id?.data },
    });

    const companyInfoDetails = await CompanyInfo.findOne({
      where: { id: company_info_id?.data },
    });
    let attachmentContent = await getEmailTemplateContent(req);
    if (attachmentContent.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      trn.rollback();
      return attachmentContent
    }
    const attachments: any = {
      invoice_number: result.dataValues.invoice_number,
      invoice_date: new Date(
        result.dataValues.invoice_date
      ).toLocaleDateString("en-GB"),
      pdf_app_logo: INVOICE_LOGO_IMAGE_BASE64,
      currency: findCurrency.dataValues.symbol,
      company_number: companyInfoDetails.dataValues.company_number,
      company_address: companyInfoDetails.dataValues.company_address,
      total_amount: getPriceFormat(result.dataValues.invoice_amount),
      sub_total_amount: getPriceFormat(
        result.dataValues.order_invoice.sub_total
      ),
      total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
      discount: getPriceFormat(result.dataValues.order_invoice.discount),
      shipping_cost: getPriceFormat(
        result.dataValues.order_invoice.shipping_cost
      ),
      order_number: result.dataValues.order_invoice.order_number,
      billing_address: {
        house_builing: result.dataValues.billing_address.house_builing,
        area_name: result.dataValues.billing_address.area_name,
        city: result.dataValues.billing_city,
        state: result.dataValues.billing_state,
        country: result.dataValues.billing_country,
        pincode: result.dataValues.billing_address.pincode,
      },
      shipping_address: {
        house_builing: result.dataValues.shipping_address.house_builing,
        area_name: result.dataValues.shipping_address.area_name,
        city: result.dataValues.shipping_city,
        state: result.dataValues.shipping_state,
        country: result.dataValues.shipping_country,
        pincode: result.dataValues.shipping_address.pincode,
      },
      tax_array: taxData,
      data: productData,
      logo_image,
      frontend_url
    }

    const data = {
      id: result?.dataValues?.id,
      invoice_number: result?.dataValues?.invoice_number,
    }
    const invoiceFromS3 = await generateInvoicePDF(data, attachmentContent.data, attachments, company_info_id?.data, req);

    const mailNewOrderPayload = {
      toEmailAddress: result.dataValues.order_invoice.email,
      contentTobeReplaced: {
        name: userData?.dataValues.full_name
          ? userData?.dataValues.full_name
          : result.dataValues.billing_address.full_name,
        toBeReplace: {
          invoice_number: result.dataValues.invoice_number,
          invoice_date: new Date(
            result.dataValues.invoice_date
          ).toLocaleDateString("en-GB"),
          total_amount: getPriceFormat(result.dataValues.invoice_amount),
          sub_total_amount: getPriceFormat(
            result.dataValues.order_invoice.sub_total
          ),
          currency: findCurrency.dataValues.symbol,
          total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
          discount: result.dataValues.order_invoice.discount,
          shipping_cost: getPriceFormat(
            result.dataValues.order_invoice.shipping_cost
          ),
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
          },
          shipping_address: {
            house_builing: result.dataValues.shipping_address.house_builing,
            area_name: result.dataValues.shipping_address.area_name,
            city: result.dataValues.shipping_city,
            state: result.dataValues.shipping_state,
            country: result.dataValues.shipping_country,
            pincode: result.dataValues.shipping_address.pincode,
          },
          tax_array: taxData,
          data: productData,
          logo_image,
          frontend_url,
        },
      },
      attachments: {
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
          invoice_number: result.dataValues.invoice_number,
          invoice_date: new Date(
            result.dataValues.invoice_date
          ).toLocaleDateString("en-GB"),
          total_amount: getPriceFormat(result.dataValues.invoice_amount),
          sub_total_amount: getPriceFormat(
            result.dataValues.order_invoice.sub_total
          ),
          total_tax: getPriceFormat(result.dataValues.order_invoice.total_tax),
          discount: getPriceFormat(result.dataValues.order_invoice.discount),
          shipping_cost: getPriceFormat(
            result.dataValues.order_invoice.shipping_cost
          ),
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
          logo_image,
          frontend_url,
        },
      },
    };
    await mailNewOrderReceived(mailNewOrderPayload, company_info_id?.data, req);
    await mailNewOrderAdminReceived(admin, company_info_id?.data, req);
    for (const items of order_details) {
      if (orderAmontValidate.dataValues.user_id) {
        await CartProducts.destroy({
          where: {
            user_id: orderAmontValidate.dataValues.user_id,
            product_id: items.dataValues.product_id,
            company_info_id: company_info_id?.data,
          },
        });
      }
    }
    const cart_list_count = await CartProducts.sum("quantity", {
      where: { user_id: orderAmontValidate.dataValues.user_id, company_info_id: company_info_id?.data },
    });

    return resSuccess({ data: cart_list_count });
  } catch (error) {
    throw error;
  }
};

export const cartQuantityUpdate = async (req: Request) => {
  try {
    const { CartProducts } = initModels(req);
    const { cart_id } = req.params;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query, req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const cartProduct = await CartProducts.findOne({ where: { id: cart_id, company_info_id: company_info_id?.data } });

    if (!(cartProduct && cartProduct.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", "Cart Product"],
        ]),
      });
    }

    if (
      cartProduct.dataValues.product_type === AllProductTypes.SettingProduct
    ) {
      return resUnprocessableEntity({
        message: SETTING_PRODUCT_QUANTITY_ERROR,
      });
    }

    if (req.body.quantity <= 0) {
      const deletedData = cartProduct?.dataValues;
      await CartProducts.destroy({ where: { id: cartProduct.dataValues.id, company_info_id: company_info_id?.data } });
      await addActivityLogs(req,
        company_info_id?.data,
        [{
          old_data: { cart_product_id: deletedData?.id, data: { ...deletedData } },
          new_data: null  // nothing new, since it's deleted
        }],
        deletedData?.id,
        LogsActivityType.Delete,
        LogsType.AllProductCart,
        req?.body?.session_res?.id_app_user
      );
    } else {
      const oldData = cartProduct?.dataValues;

      await CartProducts.update(
        {
          quantity: req.body.quantity,
        },
        { where: { id: cartProduct.dataValues.id, company_info_id: company_info_id?.data } }
      );

      // build new data manually (only user_id changed)
      const newData = {
        ...oldData,
        quantity: req?.body?.quantity,
      };
      await addActivityLogs(req,
        company_info_id?.data,
        [{
          old_data: { cart_product_id: oldData?.id, data: { ...oldData } },
          new_data: { cart_product_id: newData?.id, data: { ...newData } }
        }],
        oldData?.id,
        LogsActivityType.Edit,
        LogsType.AllProductCart,
        req?.body?.session_res?.id_app_user
      );
    }
    return resSuccess();
  } catch (error) {
    throw error;
  }
};
