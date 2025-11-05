import { Request } from "express";
import {
  createResetToken,
  createUserJWT,
  verifyJWT,
} from "../../helpers/jwt.helper";
import {
  JWT_EXPIRED_ERROR_NAME,
  OTP_EXPIRATION_TIME,
  PASSWORD_SOLT,
} from "../../utils/app-constants";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  FORBIDDEN_CODE,
  INVALID_USERNAME_PASSWORD,
  UNAUTHORIZED_ACCESS_CODE,
  ACCOUNT_NOT_ACTIVE,
  USER_NOT_FOUND,
  USER_NOT_FOUND_WITH_REFRESH_TOKEN,
  ACCOUNT_NOT_VERIFIED,
  ACCOUNT_IS_BLOCKED,
  ACCOUNT_NOT_APPROVED,
  PASSWORD_IS_WRONG,
  INVALID_TOKEN,
  INVALID_OTP,
  USER_EMAIL_ID_ALREADY_VERIFIED,
  NOT_VERIFIED,
  DATA_ALREADY_EXIST,
  RESOURCE_EXPIRED_STATUS_CODE,
  OTP_EXPIRATION_MESSAGE,
  SIGN_IN_TYPE_WRONG_ERROR_MESSAGE,
  RESET_PASSWORD_TYPE_WRONG_ERROR_MESSAGE,
  ROLE_NOT_FOUND,
  USER_ROLE_INACTIVE_ERROR_MESSAGE,
} from "../../utils/app-messages";
import {
  columnValueLowerCase,
  getDecryptedText,
  getEncryptedText,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resError,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnauthorizedAccess,
  resUnknownError,
  resUnprocessableEntity,
  sendMessageInWhatsApp,
} from "../../utils/shared-functions";
import bcrypt from "bcrypt";
import AppUser from "../model/app-user.model";
import {
  ActiveStatus,
  AllProductTypes,
  DeletedStatus,
  IMAGE_TYPE,
  PaymentStatus,
  PRODUCT_IMAGE_TYPE,
  SIGN_UP_TYPE,
  SingleProductType,
  SORTING_OPTION,
  USER_STATUS,
  USER_TYPE,
} from "../../utils/app-enumeration";
import BusinessUser from "../model/business-user.model";
import {
  APP_NAME,
  FRONT_END_BASE_URL,
  IMAGE_PATH,
  OTP_GENERATE_DIGITS,
  RESET_PASSWORD_PATH,
  SEND_OTP_IN_WHATSAPP,
} from "../../config/env.var";
import {
  mailPasswordResetLink,
  mailRegistrationOtp,
  successRegistration,
} from "./mail.service";
import customerUser from "../model/customer-user.model";
import SystemConfiguration from "../model/system-configuration.model";
import dbContext from "../../config/db-context";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import Image from "../model/image.model";
import { Op, QueryTypes, Sequelize, where } from "sequelize";
import HeadsData from "../model/master/attributes/heads.model";
import ShanksData from "../model/master/attributes/shanks.model";
import SideSettingStyles from "../model/master/attributes/side-setting-styles.model";
import DiamondCaratSize from "../model/master/attributes/caratSize.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import Colors from "../model/master/attributes/colors.model";
import ClarityData from "../model/master/attributes/clarity.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import StoneData from "../model/master/attributes/gemstones.model";
import ConfigProduct from "../model/config-product.model";
import ConfigProductMetals from "../model/config-product-metal.model";
import CutsData from "../model/master/attributes/cuts.model";
import ConfigProductDiamonds from "../model/config-product-diamonds.model";
import MenuItem from "../model/menu-items.model";
import CaratSize from "../../model/master/attributes/caratSize.model";
import Collection from "../model/master/attributes/collection.model";
import BrandData from "../model/master/attributes/brands.model";
import CountryData from "../model/master/country.model";
import axios from "axios";
import Invoives from "../model/invoices.model";
import Orders from "../model/order.model";
import couponData from "../model/coupon.model";
import OrdersDetails from "../model/order-details.model";
import Role from "../model/role.model";

export const test = async (req: Request) => {
  try {
    // const mailPayload = {
    //   toEmailAddress: "khushi.vihaainfotech@gmail.com",
    //   contentTobeReplaced: { name: "khushi", OTP: 123456 },
    // };
    // await mailRegistrationOtp(mailPayload);
    const value = await sendMessageInWhatsApp(123456, "6355406590")
    
    return resSuccess({ data: value });
    // let category = "0";
    // let filterCategory = "0";
    // if (!req.query.setting_type && req.query.setting_type == undefined) {
    //   req.query.setting_type = "0";
    // }
    // if (!req.query.gender && req.query.gender == undefined) {
    //   req.query.gender = "0";
    // }
    // if (!req.query.collection && req.query.collection == undefined) {
    //   req.query.collection = "0";
    // }
    // if (!req.query.metal_id && req.query.metal_id == undefined) {
    //   req.query.metal_id = "0";
    // }
    // if (!req.query.metal_tone && req.query.metal_tone == undefined) {
    //   req.query.metal_tone = "0";
    // }
    // if (!req.query.diamond_shape && req.query.diamond_shape == undefined) {
    //   req.query.diamond_shape = "0";
    // }
    // if (!req.query.brand && req.query.brand == undefined) {
    //   req.query.brand = "0";
    // }
    // if (
    //   !req.query.product_category &&
    //   req.query.product_category == undefined
    // ) {
    //   req.query.product_category = "0";
    // }
    // if (!req.query.search_text && req.query.search_text == undefined) {
    //   req.query.search_text = "0";
    // }
    // if (
    //   req.query.product_category &&
    //   req.query.product_category != undefined &&
    //   req.query.product_category != "0"
    // ) {
    //   let categoryName: any = req.query.product_category;
    //   filterCategory = categoryName
    //     .toString()
    //     .toLowerCase()
    //     .split(",")
    //     .map((item: any) => `'${item}'`)
    //     .join(",");
    // }
    // if (
    //   !req.query.min_price &&
    //   !req.query.max_price &&
    //   req.query.min_price == undefined &&
    //   req.query.max_price == undefined
    // ) {
    //   req.query.min_price = "0";
    //   req.query.max_price = "0";
    // }
    // if (
    //   !req.query.min_price &&
    //   req.query.min_price == undefined &&
    //   req.query.max_price &&
    //   req.query.max_price != undefined
    // ) {
    //   req.query.min_price = "0";
    // }
    // if (
    //   req.query.min_price &&
    //   req.query.min_price !== undefined &&
    //   !req.query.max_price &&
    //   req.query.max_price === undefined
    // ) {
    //   req.query.max_price = "0";
    // }
    // req.query.is_choose_setting =
    //   req.query.is_choose_setting === "1" ? "1" : "0";
    // if (req.query.collection != "0") {
    //   const findCollection = await Collection.findOne({
    //     where: {
    //       slug: { [Op.iLike]: `%${req.query.collection}%` },
    //       is_deleted: DeletedStatus.No,
    //     },
    //   });
    //   if (findCollection && findCollection.dataValues) {
    //     req.query.collection = findCollection.dataValues.id;
    //   }
    // }
    // if (req.query.brand != "0") {
    //   const findBrand = await BrandData.findOne({
    //     where: {
    //       slug: { [Op.iLike]: `%${req.query.brand}%` },
    //       is_deleted: DeletedStatus.No,
    //     },
    //   });
    //   if (findBrand && findBrand.dataValues) {
    //     req.query.brand = findBrand.dataValues.id;
    //   }
    // }
    // if (req.query.product_category == "0" && req.query.search_text == "0") {
    //   category = "watch";
    // }
    // let products = await dbContext.query(
    //   `SELECT * FROM product_list_view
    //   WHERE  CASE
    //     		WHEN '${req.query.setting_type}' = '0' THEN TRUE
    //     		ELSE string_to_array(setting_style_type, '|')::int[] && ARRAY[${
    //           req.query.setting_type
    //         }]
    //     	END
    //       AND CASE WHEN '${
    //         req.query.gender
    //       }' = '0' THEN true ELSE string_to_array(gender, '|')::int[] && ARRAY[${
    //     req.query.gender
    //   }] END
    //       AND CASE
    //     		WHEN '${req.query.collection}' = '0' THEN TRUE
    //     		ELSE string_to_array(id_collection, '|')::int[] && ARRAY[${
    //           req.query.collection
    //         }] END
    //       AND CASE WHEN '${
    //         req.query.brand
    //       }' = '0' THEN true ELSE id_brand IN (${req.query.brand}) END
    //       AND CASE
    //     		WHEN '${req.query.search_text}' = '0' THEN TRUE
    //     		ELSE name ILIKE '%${req.query.search_text}%' OR SLUG ILIKE '%${
    //     req.query.search_text
    //   }%' OR SKU ILIKE '%${req.query.search_text}%'
    //     	END
    //     AND CASE
    //     WHEN '${req.query.metal_id}' = '0' THEN TRUE
    //     ELSE EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(pmo) AS item
    //         WHERE item->>'id_metal' = ANY (string_to_array('${
    //           req.query.metal_id
    //         }', ','))
    //     )
    //     END
    //     AND  CASE WHEN '${
    //       req.query.metal_tone
    //     }' = '0' THEN true ELSE CASE WHEN product_type=${
    //     SingleProductType.DynemicPrice
    //   } OR product_type=${SingleProductType.cataLogueProduct} THEN EXISTS (
    //        SELECT 1
    //   FROM jsonb_array_elements(pmo) AS item
    //   WHERE EXISTS (
    //   SELECT 1
    //   FROM jsonb_array_elements_text(item->'metal_tone') AS metal_tone
    //   WHERE CAST(metal_tone.value as INTEGER) IN (${req.query.metal_tone})
    //   )
    //   ) ELSE EXISTS (
    //     SELECT 1
    //     FROM jsonb_array_elements(pmo) AS item
    //     WHERE (item->>'id_metal_tone')::int[] && ARRAY[${req.query.metal_tone}]
    //   ) END END
    //       AND CASE WHEN '${
    //         req.query.diamond_shape
    //       }' = '0' THEN true ELSE CASE WHEN '${
    //     req.query.is_choose_setting
    //   }' = '1' THEN EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(pdo) AS item
    //         WHERE CAST(item->>'id_shape' AS INTEGER) IN (${
    //           req.query.diamond_shape
    //         }) OR string_to_array(setting_diamond_shapes, '|')::int[] && ARRAY[${
    //     req.query.diamond_shape
    //   }]
    //       ) else EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(pdo) AS item
    //         WHERE CAST(item->>'id_shape' AS INTEGER) IN (${
    //           req.query.diamond_shape
    //         })
    //       ) END END
    //     AND CASE WHEN '${
    //       req.query.product_category
    //     }' = '0' THEN true ELSE EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(product_categories) AS category
    //         WHERE category->>'category_name' IN (${
    //           filterCategory == "0" ? `'${filterCategory}'` : filterCategory
    //         }) OR category->>'sub_category_name' IN (${
    //     filterCategory == "0" ? `'${filterCategory}'` : filterCategory
    //   }) OR category->>'sub_sub_category_name' IN (${
    //     filterCategory == "0" ? `'${filterCategory}'` : filterCategory
    //   })
    //       ) END
    //     AND CASE
    //       WHEN '${req.query.category}' = '0' THEN TRUE
    //       ELSE NOT EXISTS (
    //           SELECT 1
    //           FROM jsonb_array_elements(product_categories) AS category
    //           WHERE category->>'category_name' ILIKE '%watch%'
    //       )
    //   END
    //   AND CASE
    //     		WHEN '${req.query.min_price}' = '0' AND '${
    //     req.query.max_price
    //   }' = '0' THEN TRUE
    //         ELSE ExISTS (
    //             SELECT 1
    //             FROM jsonb_array_elements(pmo) AS item
    //             WHERE CAST(item->>'Price' AS INTEGER) ${
    //               req.query.min_price == "0" && req.query.max_price != "0"
    //                 ? `<= ${req.query.max_price}`
    //                 : req.query.min_price != "0" && req.query.max_price == "0"
    //                 ? `>= ${req.query.min_price}`
    //                 : `BETWEEN ${
    //                     req.query.min_price ? req.query.min_price : 0
    //                   } AND ${req.query.max_price}`
    //             }
    //         ) END
    //         ${
    //           req.query.sort_by === SORTING_OPTION.BestSeller
    //             ? `
    //               ORDER BY is_trending DESC, id DESC`
    //             : req.query.sort_by === SORTING_OPTION.Newest
    //             ? "ORDER BY created_date DESC"
    //             : req.query.sort_by === SORTING_OPTION.Oldest
    //             ? "ORDER BY created_date ASC"
    //             : req.query.sort_by === SORTING_OPTION.PriceLowToHigh
    //             ? "ORDER BY (SELECT MIN((item->>'Price')::numeric) FROM  jsonb_array_elements(pmo) AS item) ASC"
    //             : req.query.sort_by === SORTING_OPTION.PriceHighToLow
    //             ? "ORDER BY (SELECT MIN((item->>'Price')::numeric) FROM jsonb_array_elements(pmo) AS item) DESC"
    //             : "ORDER BY id DESC"
    //         }
    //   OFFSET
    //     0 ROWS
    //     FETCH NEXT 20 ROWS ONLY`,
    //   { type: QueryTypes.SELECT }
    // );
    // let productCount = await dbContext.query(
    //   `SELECT * FROM product_list_view
    //   WHERE  CASE
    //     		WHEN '${req.query.setting_type}' = '0' THEN TRUE
    //     		ELSE string_to_array(setting_style_type, '|')::int[] && ARRAY[${
    //           req.query.setting_type
    //         }]
    //     	END
    //       AND CASE WHEN '${
    //         req.query.gender
    //       }' = '0' THEN true ELSE string_to_array(gender, '|')::int[] && ARRAY[${
    //     req.query.gender
    //   }] END
    //       AND CASE
    //     		WHEN '${req.query.collection}' = '0' THEN TRUE
    //     		ELSE string_to_array(id_collection, '|')::int[] && ARRAY[${
    //           req.query.collection
    //         }] END
    //       AND CASE WHEN '${
    //         req.query.brand
    //       }' = '0' THEN true ELSE id_brand IN (${req.query.brand}) END
    //       AND CASE
    //     		WHEN '${req.query.search_text}' = '0' THEN TRUE
    //     		ELSE NAME ILIKE '%${req.query.search_text}%' OR SLUG ILIKE '%${
    //     req.query.search_text
    //   }%' OR SKU ILIKE '%${req.query.search_text}%'
    //     	END
    //     AND CASE
    //     WHEN '${req.query.metal_id}' = '0' THEN TRUE
    //     ELSE EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(pmo) AS item
    //         WHERE item->>'id_metal' = ANY (string_to_array('${
    //           req.query.metal_id
    //         }', ','))
    //     )
    //     END
    //     AND  CASE WHEN '${
    //       req.query.metal_tone
    //     }' = '0' THEN true ELSE CASE WHEN product_type=${
    //     SingleProductType.DynemicPrice
    //   } OR product_type=${SingleProductType.cataLogueProduct} THEN EXISTS (
    //        SELECT 1
    //     FROM jsonb_array_elements(pmo) AS item
    //     WHERE EXISTS (
    //     SELECT 1
    //     FROM jsonb_array_elements_text(item->'metal_tone') AS metal_tone
    //     WHERE CAST(metal_tone.value as INTEGER) IN (${req.query.metal_tone})
    //     )
    //       ) ELSE EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(pmo) AS item
    //         WHERE (item->>'id_metal_tone')::int[] && ARRAY[${
    //           req.query.metal_tone
    //         }]
    //     ) END END
    //                AND CASE WHEN '${
    //                  req.query.diamond_shape
    //                }' = '0' THEN true ELSE CASE WHEN '${
    //     req.query.is_choose_setting
    //   }' = '1' THEN EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(pdo) AS item
    //         WHERE CAST(item->>'id_shape' AS INTEGER) IN (${
    //           req.query.diamond_shape
    //         }) OR string_to_array(setting_diamond_shapes, '|')::int[] && ARRAY[${
    //     req.query.diamond_shape
    //   }]
    //       ) else EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(pdo) AS item
    //         WHERE CAST(item->>'id_shape' AS INTEGER) IN (${
    //           req.query.diamond_shape
    //         })
    //       ) END END
    //        AND CASE WHEN '${
    //          req.query.product_category
    //        }' = '0' THEN true ELSE EXISTS (
    //         SELECT 1
    //         FROM jsonb_array_elements(product_categories) AS category
    //         WHERE category->>'category_name' IN (${
    //           filterCategory == "0" ? `'${filterCategory}'` : filterCategory
    //         }) OR category->>'sub_category_name' IN (${
    //     filterCategory == "0" ? `'${filterCategory}'` : filterCategory
    //   }) OR category->>'sub_sub_category_name' IN (${
    //     filterCategory == "0" ? `'${filterCategory}'` : filterCategory
    //   })
    //       ) END
    //     AND CASE
    //       WHEN '${req.query.category}' = '0' THEN TRUE
    //       ELSE NOT EXISTS (
    //           SELECT 1
    //           FROM jsonb_array_elements(product_categories) AS category
    //           WHERE category->>'category_name' ILIKE '%watch%'
    //       )
    //   END
    //   AND CASE
    //     		WHEN '${req.query.min_price}' = '0' AND '${
    //     req.query.max_price
    //   }' = '0' THEN TRUE
    //         ELSE ExISTS (
    //             SELECT 1
    //             FROM jsonb_array_elements(pmo) AS item
    //             WHERE CAST(item->>'Price' AS INTEGER) ${
    //               req.query.min_price == "0" && req.query.max_price != "0"
    //                 ? `<= ${req.query.max_price}`
    //                 : req.query.min_price != "0" && req.query.max_price == "0"
    //                 ? `>= ${req.query.min_price}`
    //                 : `BETWEEN ${
    //                     req.query.min_price ? req.query.min_price : 0
    //                   } AND ${req.query.max_price}`
    //             }
    //         ) END
    //   `,
    //   { type: QueryTypes.SELECT }
    // );
    // return resSuccess({ data: { count: productCount.length, products } });
    // const { carat_size } = req.body;
    // for (let index = 0; index < carat_size.length; index++) {
    //   const element = carat_size[index];
    //   const sort_code_value = Math.round(parseFloat(element) * 100);
    //   const payload = {
    //     value: element,
    //     slug: element,
    //     sort_code: sort_code_value,
    //     created_date: getLocalDate(),
    //     is_active: ActiveStatus.Active,
    //     is_deleted: DeletedStatus.No,
    //     created_by: 1,
    //   };
    //   await DiamondCaratSize.create(payload);
    // }
    // const array = [
    //   {
    //     title: "Fluorescence",
    //     sort: 1.0,
    //     children: [
    //       {
    //         title: "Fluorescence Intensity",
    //         path: "/attribute/fluorescence/fluorescenceIntensity",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Fluorescence Color",
    //         path: "/attribute/fluorescence/fluorescenceColor",
    //         sort: 2.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Fancy Color",
    //     sort: 2.0,
    //     children: [
    //       {
    //         title: "Fancy Color",
    //         path: "/attribute/fancyColor/fancyColor",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Fancy Color Intensity",
    //         path: "/attribute/fancyColor/fancyColorIntensity",
    //         sort: 2.0,
    //       },
    //       {
    //         title: "Fancy Color Overtone",
    //         path: "/attribute/fancyColor/fancyColorOvertone",
    //         sort: 3.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Girdle",
    //     sort: 3.0,
    //     children: [
    //       {
    //         title: "Girdle Thin",
    //         path: "/attribute/girdle/girdleThin",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Girdle Thick",
    //         path: "/attribute/girdle/girdleThick",
    //         sort: 2.0,
    //       },
    //       {
    //         title: "Girdle Condition",
    //         path: "/attribute/girdle/girdleCondition",
    //         sort: 3.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Pair",
    //     sort: 4.0,
    //     children: [
    //       {
    //         title: "Pair",
    //         path: "/attribute/pair/pair",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Pair Separable",
    //         path: "/attribute/pair/pairSeparable",
    //         sort: 2.0,
    //       },
    //       {
    //         title: "Pair Stock",
    //         path: "/attribute/pair/pairStock",
    //         sort: 3.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Inclusion",
    //     sort: 5.0,
    //     children: [
    //       {
    //         title: "Canter Inclusion",
    //         path: "/attribute/inclusion/centerInclusion",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Black Inclusion",
    //         path: "/attribute/inclusion/blackInclusion",
    //         sort: 2.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "lab",
    //     sort: 6.0,
    //     children: [
    //       {
    //         title: "lab",
    //         path: "/attribute/lab/lab",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "lab Location",
    //         path: "/attribute/lab/labLocation",
    //         sort: 2.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Parcel Stones",
    //     path: "/attribute/parcelStones",
    //     sort: 7.0,
    //   },
    //   {
    //     title: "Availability",
    //     path: "/attribute/availability",
    //     sort: 8.0,
    //   },
    //   {
    //     title: "Polish",
    //     path: "/attribute/polish",
    //     sort: 9.0,
    //   },
    //   {
    //     title: "Symmetry",
    //     path: "/attribute/symmetry",
    //     sort: 10.0,
    //   },
    //   {
    //     title: "Culet Condition",
    //     path: "/attribute/culetCondition",
    //     sort: 11.0,
    //   },
    //   {
    //     title: "Laser Inscription",
    //     path: "/attribute/laserInscription",
    //     sort: 12.0,
    //   },
    //   {
    //     title: "Certificate Comment",
    //     path: "/attribute/certComment",
    //     sort: 13.0,
    //   },
    //   {
    //     title: "Time To Location",
    //     path: "/attribute/timetolocation",
    //     sort: 14.0,
    //   },
    //   {
    //     title: "Trade Show",
    //     path: "/attribute/tradeShow",
    //     sort: 15.0,
    //   },
    //   {
    //     title: "Shade",
    //     path: "/attribute/shade",
    //     sort: 16.0,
    //   },
    //   {
    //     title: "Report Type",
    //     path: "/attribute/reportType",
    //     sort: 17.0,
    //   },
    //   {
    //     title: "Milky",
    //     path: "/attribute/milky",
    //     sort: 18.0,
    //   },
    //   {
    //     title: "BGM",
    //     path: "/attribute/bgm",
    //     sort: 19.0,
    //   },
    //   {
    //     title: "H & A",
    //     path: "/attribute/handA",
    //     sort: 20.0,
    //   },
    //   {
    //     title: "Growth Type",
    //     path: "/attribute/growthType",
    //     sort: 21.0,
    //   },
    //   {
    //     title: "Country",
    //     path: "/attribute/country",
    //     sort: 22.0,
    //   },
    //   {
    //     title: "State",
    //     path: "/attribute/state",
    //     sort: 23.0,
    //   },
    //   {
    //     title: "City",
    //     path: "/attribute/city",
    //     sort: 24.0,
    //   },
    // ];
    // for (let index = 0; index < array.length; index++) {
    //   const element = array[index];
    //   const mainMenu = await MenuItem.create({
    //     name: element.title,
    //     id_parent_menu: 67,
    //     nav_path: element.path ? element.path : null,
    //     menu_location: 1,
    //     sort_order: element.sort,
    //     is_active: "1",
    //     is_deleted: "0",
    //     created_by: 1,
    //     created_date: getLocalDate(),
    //   });
    //   if (element.children && element.children.length !== 0) {
    //     for (let index = 0; index < element.children.length; index++) {
    //       const elementChild = element.children[index];
    //       await MenuItem.create({
    //         name: elementChild.title,
    //         id_parent_menu: mainMenu.dataValues.id,
    //         nav_path: elementChild.path ? elementChild.path : null,
    //         menu_location: 1,
    //         sort_order: elementChild.sort,
    //         is_active: "1",
    //         is_deleted: "0",
    //         created_by: 1,
    //         created_date: getLocalDate(),
    //       });
    //     }
    //   }
    // }
    // const headList = await HeadsData.findAll({ where: { is_deleted: "0" } });
    // const shnakList = await ShanksData.findAll({ where: { is_deleted: "0" } });
    // const sideSettingList = await SideSettingStyles.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const diamondSize = await DiamondCaratSize.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const diamondShape = await DiamondShape.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const colorList = await Colors.findAll({ where: { is_deleted: "0" } });
    // const ClarityList = await ClarityData.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const karatList = await GoldKarat.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const goldList = await MetalMaster.findAll({ where: { is_deleted: "0" } });
    // const gemstone = await StoneData.findAll({ where: { is_deleted: "0" } });
    // const cuts = await CutsData.findAll({ where: { is_deleted: "0" } });
    // const headListFind = (value: any) => {
    //   const list = headList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const shankListFind = (value: any) => {
    //   const list = shnakList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const sideSettingListFind = (value: any) => {
    //   const list = sideSettingList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const diamondSizeListFind = (value: any) => {
    //   const list = diamondSize.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.value, sort: list.dataValues.sort_code };
    // };
    // const diamondShapeListFind = (value: any) => {
    //   const list = diamondShape.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const diamondColorListFind = (value: any) => {
    //   const list = colorList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const diamondClarityListFind = (value: any) => {
    //   const list = ClarityList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.value };
    // };
    // const karatListFind = (value: any) => {
    //   const list = karatList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.slug };
    // };
    // const metalListFind = (value: any) => {
    //   const list = goldList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.slug };
    // };
    // const cutsListFind = (value: any) => {
    //   const list = cuts.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.value, sort: list.dataValues.slug };
    // };
    // const GemstoneListFind = (value: any) => {
    //   const list = gemstone.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.slug };
    // };
    // const configProduct = await ConfigProduct.findAll({
    //   order: [["id", "ASC"]],
    //   where: { is_deleted: "0", product_type: { [Op.iLike]: "three stone" } },
    //   include: [
    //     { model: ConfigProductMetals, as: "CPMO" },
    //     {
    //       model: ConfigProductDiamonds,
    //       as: "CPDO",
    //       where: { product_type: { [Op.iLike]: "side" } },
    //     },
    //   ],
    // });
    // let list = [];
    // for (let index = 0; index < configProduct.length; index++) {
    //   const element = configProduct[index].dataValues;
    //   // console.log("-------------", element.slug.split("-")[3]);
    //   // list.push({
    //   //   product_title: `${
    //   //     element.CPMO[0].metal_id == 1
    //   //       ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //   //       : metalListFind(element.CPMO[0].metal_id).name
    //   //   } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //   //     diamondSizeListFind(element.center_dia_cts).name
    //   //   } Carat ${
    //   //     element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //   //       ? cutsListFind(element.center_dia_cut_id).name
    //   //       : diamondColorListFind(element.center_dia_color).name +
    //   //         " " +
    //   //         diamondClarityListFind(element.center_dia_clarity_id).name
    //   //   } Side ${GemstoneListFind(element.CPDO[0].dia_stone).name} ${
    //   //     headListFind(element.head_type_id).name
    //   //   } ${shankListFind(element.shank_type_id).name} ${
    //   //     sideSettingListFind(element.side_setting_id).name
    //   //   }  Diamond Ring`,
    //   //   product_sort_des: `${
    //   //     element.CPMO[0].metal_id == 1
    //   //       ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //   //       : metalListFind(element.CPMO[0].metal_id).name
    //   //   } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //   //     diamondSizeListFind(element.center_dia_cts).name
    //   //   } Carat ${
    //   //     element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //   //       ? cutsListFind(element.center_dia_cut_id).name
    //   //       : diamondColorListFind(element.center_dia_color).name +
    //   //         " " +
    //   //         diamondClarityListFind(element.center_dia_clarity_id).name
    //   //   } Side ${GemstoneListFind(element.CPDO[0].dia_stone).name} ${
    //   //     headListFind(element.head_type_id).name
    //   //   } ${shankListFind(element.shank_type_id).name} ${
    //   //     sideSettingListFind(element.side_setting_id).name
    //   //   }  Diamond Ring`,
    //   //   product_long_des: `${
    //   //     element.CPMO[0].metal_id == 1
    //   //       ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //   //       : metalListFind(element.CPMO[0].metal_id).name
    //   //   } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //   //     diamondSizeListFind(element.center_dia_cts).name
    //   //   } Carat ${
    //   //     element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //   //       ? cutsListFind(element.center_dia_cut_id).name
    //   //       : diamondColorListFind(element.center_dia_color).name +
    //   //         " " +
    //   //         diamondClarityListFind(element.center_dia_clarity_id).name
    //   //   } Side ${GemstoneListFind(element.CPDO[0].dia_stone).name}  ${
    //   //     headListFind(element.head_type_id).name
    //   //   } ${shankListFind(element.shank_type_id).name} ${
    //   //     sideSettingListFind(element.side_setting_id).name
    //   //   }  Diamond Ring`,
    //   //   slug: `${
    //   //     element.CPMO[0].metal_id == 1
    //   //       ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //   //       : metalListFind(element.CPMO[0].metal_id).sort
    //   //   }-${element.slug.split("-")[3]}-${
    //   //     diamondShapeListFind(element.center_dia_shape_id).sort
    //   //   }-${diamondSizeListFind(element.center_dia_cts).name}-${
    //   //     element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //   //       ? cutsListFind(element.center_dia_cut_id).sort
    //   //       : diamondColorListFind(element.center_dia_color).name +
    //   //         "-" +
    //   //         diamondClarityListFind(element.center_dia_clarity_id).sort
    //   //   }-Side-${GemstoneListFind(element.CPDO[0].dia_stone).name}-${
    //   //     element.CPDO[0].dia_cuts && element.CPDO[0].dia_cuts != undefined
    //   //       ? cutsListFind(element.CPDO[0].dia_cuts).sort
    //   //       : diamondColorListFind(element.CPDO[0].dia_color).name +
    //   //         "-" +
    //   //         diamondClarityListFind(element.CPDO[0].dia_clarity).sort
    //   //   }-${headListFind(element.head_type_id).sort}-${
    //   //     shankListFind(element.shank_type_id).sort
    //   //   }-${sideSettingListFind(element.side_setting_id).sort}`,
    //   //   sku: `${
    //   //     element.CPMO[0].metal_id == 1
    //   //       ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //   //       : metalListFind(element.CPMO[0].metal_id).sort
    //   //   }-${diamondShapeListFind(element.center_dia_shape_id).sort}-${
    //   //     diamondSizeListFind(element.center_dia_cts).name
    //   //   }-${
    //   //     element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //   //       ? cutsListFind(element.center_dia_cut_id).sort
    //   //       : diamondColorListFind(element.center_dia_color).name +
    //   //         "-" +
    //   //         diamondClarityListFind(element.center_dia_clarity_id).sort
    //   //   }-Side-${GemstoneListFind(element.CPDO[0].dia_stone).name}-${
    //   //     headListFind(element.head_type_id).sort
    //   //   }-${shankListFind(element.shank_type_id).sort}-${
    //   //     sideSettingListFind(element.side_setting_id).sort
    //   //   }`,
    //   // });
    //   await ConfigProduct.update(
    //     {
    //       product_title: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //           : metalListFind(element.CPMO[0].metal_id).name
    //       } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       } Carat ${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).name
    //           : diamondColorListFind(element.center_dia_color).name +
    //             " " +
    //             diamondClarityListFind(element.center_dia_clarity_id).name
    //       } Side ${GemstoneListFind(element.CPDO[0].dia_stone).name} ${
    //         headListFind(element.head_type_id).name
    //       } ${shankListFind(element.shank_type_id).name} ${
    //         sideSettingListFind(element.side_setting_id).name
    //       }  Diamond Ring`,
    //       product_sort_des: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //           : metalListFind(element.CPMO[0].metal_id).name
    //       } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       } Carat ${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).name
    //           : diamondColorListFind(element.center_dia_color).name +
    //             " " +
    //             diamondClarityListFind(element.center_dia_clarity_id).name
    //       } Side ${GemstoneListFind(element.CPDO[0].dia_stone).name} ${
    //         headListFind(element.head_type_id).name
    //       } ${shankListFind(element.shank_type_id).name} ${
    //         sideSettingListFind(element.side_setting_id).name
    //       }  Diamond Ring`,
    //       product_long_des: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //           : metalListFind(element.CPMO[0].metal_id).name
    //       } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       } Carat ${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).name
    //           : diamondColorListFind(element.center_dia_color).name +
    //             " " +
    //             diamondClarityListFind(element.center_dia_clarity_id).name
    //       } Side ${GemstoneListFind(element.CPDO[0].dia_stone).name}  ${
    //         headListFind(element.head_type_id).name
    //       } ${shankListFind(element.shank_type_id).name} ${
    //         sideSettingListFind(element.side_setting_id).name
    //       }  Diamond Ring`,
    //       slug: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //           : metalListFind(element.CPMO[0].metal_id).sort
    //       }-${element.slug.split("-")[3]}-${
    //         diamondShapeListFind(element.center_dia_shape_id).sort
    //       }-${diamondSizeListFind(element.center_dia_cts).name}-${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).sort
    //           : diamondColorListFind(element.center_dia_color).name +
    //             "-" +
    //             diamondClarityListFind(element.center_dia_clarity_id).sort
    //       }-Side-${GemstoneListFind(element.CPDO[0].dia_stone).name}-${
    //         element.CPDO[0].dia_cuts && element.CPDO[0].dia_cuts != undefined
    //           ? cutsListFind(element.CPDO[0].dia_cuts).sort
    //           : diamondColorListFind(element.CPDO[0].dia_color).name +
    //             "-" +
    //             diamondClarityListFind(element.CPDO[0].dia_clarity).sort
    //       }-${headListFind(element.head_type_id).sort}-${
    //         shankListFind(element.shank_type_id).sort
    //       }-${sideSettingListFind(element.side_setting_id).sort}`,
    //       sku: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //           : metalListFind(element.CPMO[0].metal_id).sort
    //       }-${diamondShapeListFind(element.center_dia_shape_id).sort}-${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       }-${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).sort
    //           : diamondColorListFind(element.center_dia_color).name +
    //             "-" +
    //             diamondClarityListFind(element.center_dia_clarity_id).sort
    //       }-Side-${GemstoneListFind(element.CPDO[0].dia_stone).name}-${
    //         headListFind(element.head_type_id).sort
    //       }-${shankListFind(element.shank_type_id).sort}-${
    //         sideSettingListFind(element.side_setting_id).sort
    //       }`,
    //     },
    //     { where: { id: element.id } }
    //   );
    // }
    // return resSuccess({ data: list });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const registerSystemUser = async (req: Request) => {
  try {
    const { username, password, user_type } = req.body;

    const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));
    const payload = {
      username,
      pass_hash,
      user_type,
      created_at: getLocalDate(),
    };
    const result = await AppUser.create(payload);

    const jwtPayload = {
      id: result.dataValues.id,
      idAppUser: result.dataValues.id,
      userType: result.dataValues.user_type,
    };
    const data = await createUserJWT(
      result.dataValues.id,
      jwtPayload,
      result.dataValues.user_type
    );

    return resSuccess({
      data: {
        userInfo: result,
        token: data,
      },
    });
  } catch (e) {
    throw e;
  }
};

export const authenticateSystemUser = async (req: Request) => {
  try {
    const { username, password } = req.body;
    let userDetails;

    const appUser = await AppUser.findOne({
      where: { username, is_deleted: DeletedStatus.No, user_type : [USER_TYPE.Administrator, USER_TYPE.BusinessUser] },
    });
    if (!appUser) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const role = await Role.findOne({
      where: { id:appUser?.dataValues?.id_role, is_deleted: DeletedStatus.No },
    });

    if (!role) {
      return resNotFound({ message: ROLE_NOT_FOUND });
    }

    if (role.dataValues.is_active ==  ActiveStatus.InActive ) {
      return resBadRequest({message: USER_ROLE_INACTIVE_ERROR_MESSAGE});
    }

    if (appUser.dataValues.user_type === USER_TYPE.Administrator) {
      userDetails = await AppUser.findOne({
        where: { id: appUser.dataValues.id },
      });
    } else if (appUser.dataValues.user_type === USER_TYPE.BusinessUser) {
      userDetails = await BusinessUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
        attributes: [
          "id",
          "id_app_user",
          "name",
          "email",
          "phone_number",
          "is_active",
          "is_deleted",
          "created_date",
          [Sequelize.literal("image.image_path"), "image_path"],
        ],
        include: [{ model: Image, as: "image", attributes: [] }],
      });
    } else if (appUser.dataValues.user_type === USER_TYPE.Customer) {

      userDetails = await customerUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
      });
      if(userDetails && userDetails.dataValues && userDetails.dataValues.sign_up_type !== SIGN_UP_TYPE.System){ {
        return resNotFound({ message: USER_NOT_FOUND });
      }
    }
    }
    const isPasswordValid = <any>(
      await bcrypt.compare(password, appUser.dataValues.pass_hash)
    );
    if (!isPasswordValid) {
      return resBadRequest({ message: INVALID_USERNAME_PASSWORD });
    }

    if (appUser.dataValues.user_status === USER_STATUS.Blocked) {
      return resError({ message: ACCOUNT_IS_BLOCKED, code: FORBIDDEN_CODE });
    }

    if (appUser.dataValues.is_active === "0") {
      return resError({ message: ACCOUNT_NOT_ACTIVE, code: FORBIDDEN_CODE });
    }

    if (
      appUser.dataValues.user_status === USER_STATUS.PendingVerification ||
      appUser.dataValues.user_status === USER_STATUS.PendingReverification
    ) {
      return resError({
        status: NOT_VERIFIED,
        message: ACCOUNT_NOT_VERIFIED,
        code: FORBIDDEN_CODE,
        data: appUser.dataValues.id,
      });
    }

    if (appUser.dataValues.user_status === USER_STATUS.PendingApproval) {
      return resError({ message: ACCOUNT_NOT_APPROVED, code: FORBIDDEN_CODE });
    }

    const jwtPayload = {
      id:
        userDetails && userDetails.dataValues
          ? userDetails.dataValues.id
          : appUser.dataValues.id,
      id_app_user: appUser.dataValues.id,
      user_type: appUser.dataValues.user_type,
      id_role: appUser.dataValues.id_role,
    };

    const data = createUserJWT(
      appUser.dataValues.id,
      jwtPayload,
      appUser.dataValues.user_type
    );

    return resSuccess({
      data: {
        tokens: data,
        user_detail: userDetails,
        id_role: appUser.dataValues.id_role,
      },
    });
  } catch (e) {
    console.log("-----------------", e);
    throw e;
  }
};

export const authenticateCustomerUserWithOTP = async (req: Request) => {
  try {
    const {
      username,
      password,
      login_with_otp = false,
      remember_me = false,
    } = req.body;
    let userDetails: any;
    const findUserEMail = await customerUser.findOne({
      where: [
        columnValueLowerCase("email", username),
        { sign_up_type: SIGN_UP_TYPE.System },
        { is_deleted: DeletedStatus.No },
      ],
    });

    userDetails = findUserEMail ? findUserEMail : null;
    const findUserPhone = await customerUser.findOne({
      where: {
        mobile: username,
        sign_up_type: SIGN_UP_TYPE.System,
        is_deleted: DeletedStatus.No,
      },
    });

    if (findUserPhone) {
      userDetails = findUserPhone;
    }

    if (!findUserEMail && !findUserPhone) {
      let findUser = await customerUser.findOne({
        where: [
          columnValueLowerCase("email", username),
          { is_deleted: DeletedStatus.No },
        ],
      });

      if (!findUser) {
        findUser = await customerUser.findOne({
          where: {
            mobile: username,
            is_deleted: DeletedStatus.No,
          },
        });
      }
      if (findUser) {
        return resNotFound({
          message: prepareMessageFromParams(SIGN_IN_TYPE_WRONG_ERROR_MESSAGE, [
            ["field_name", findUser.dataValues.sign_up_type],
          ]),
        });
      }

      return resNotFound({ message: USER_NOT_FOUND });
    }

    const appUser = await AppUser.findOne({
      where: {
        id: userDetails.dataValues.id_app_user,
        is_deleted: DeletedStatus.No,
      },
    });

    if (login_with_otp == false) {
      const isPasswordValid = <any>(
        await bcrypt.compare(password, appUser.dataValues.pass_hash)
      );
      if (!isPasswordValid) {
        return resBadRequest({ message: INVALID_USERNAME_PASSWORD });
      }

      if (appUser.dataValues.user_status === USER_STATUS.Blocked) {
        return resError({ message: ACCOUNT_IS_BLOCKED, code: FORBIDDEN_CODE });
      }

      if (appUser.dataValues.is_active === "0") {
        return resError({ message: ACCOUNT_NOT_ACTIVE, code: FORBIDDEN_CODE });
      }

      if (
        appUser.dataValues.user_status === USER_STATUS.PendingVerification ||
        appUser.dataValues.user_status === USER_STATUS.PendingReverification
      ) {
        return resError({
          status: NOT_VERIFIED,
          message: ACCOUNT_NOT_VERIFIED,
          code: FORBIDDEN_CODE,
          data: appUser.dataValues.id,
        });
      }

      if (appUser.dataValues.user_status === USER_STATUS.PendingApproval) {
        return resError({
          message: ACCOUNT_NOT_APPROVED,
          code: FORBIDDEN_CODE,
        });
      }

      if (appUser.dataValues.user_type === USER_TYPE.Administrator) {
        userDetails = await AppUser.findOne({
          where: { id: appUser.dataValues.id },
        });
      } else if (appUser.dataValues.user_type === USER_TYPE.BusinessUser) {
        userDetails = await BusinessUser.findOne({
          where: { id_app_user: appUser.dataValues.id },
          attributes: [
            "id",
            "id_app_user",
            "name",
            "email",
            "phone_number",
            "is_active",
            "is_deleted",
            "created_date",
            [Sequelize.literal("image.image_path"), "image_path"],
          ],
          include: [{ model: Image, as: "image", attributes: [] }],
        });
      } else if (appUser.dataValues.user_type === USER_TYPE.Customer) {
        userDetails = await customerUser.findOne({
          where: { id_app_user: appUser.dataValues.id },
        });
      }

      const jwtPayload = {
        id:
          userDetails && userDetails.dataValues
            ? userDetails.dataValues.id
            : appUser.dataValues.id,
        id_app_user: appUser.dataValues.id,
        user_type: appUser.dataValues.user_type,
        id_role: appUser.dataValues.id_role,
      };

      const data = createUserJWT(
        appUser.dataValues.id,
        jwtPayload,
        remember_me && remember_me == true ? 5 : appUser.dataValues.user_type
      );

      return resSuccess({
        data: {
          tokens: data,
          user_detail: userDetails,
          id_role: appUser.dataValues.id_role,
        },
      });
    } else {
      const currentDate = getLocalDate(); // Get current time
      const expireDate = new Date(currentDate.getTime() + OTP_EXPIRATION_TIME);
      const digits = "0123456789";
      let OTP = "";
      for (let i = 0; i < OTP_GENERATE_DIGITS; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      await AppUser.update(
        {
          one_time_pass: OTP,
          otp_create_date: currentDate,
          otp_expire_date: expireDate,
        },
        { where: { id: appUser.dataValues.id } }
      );
      const mailPayload = {
        toEmailAddress: appUser.dataValues.username,
        contentTobeReplaced: { name: userDetails.dataValues.full_name, OTP },
      };
      await mailRegistrationOtp(mailPayload);
      if (
        appUser.dataValues.user_type === USER_TYPE.Customer &&
        userDetails &&
        userDetails.dataValues &&
        userDetails.dataValues.country_id == "+91" &&
        SEND_OTP_IN_WHATSAPP.toString() == "true"
      ) {
        await sendMessageInWhatsApp(OTP, userDetails.dataValues.mobile);
      }
      return resSuccess({
        data: {
          otp: {
            otp: OTP,
            otp_create_date: currentDate,
            otp_expire_date: expireDate,
          },
          user_detail: userDetails,
          id_role: appUser.dataValues.id_role,
        },
      });
    }
  } catch (e) {
    console.log("----------------------", e);
    throw e;
  }
};

export const refreshAuthorizationToken = async (req: Request) => {
  try {
    const refreshToken = req.body.refresh_token;

    const result = await verifyJWT(refreshToken);
    if (result.code === DEFAULT_STATUS_CODE_SUCCESS) {
      const appUser = await AppUser.findOne({
        where: { refresh_token: refreshToken },
      });
      if (!appUser) {
        return resBadRequest({ message: USER_NOT_FOUND_WITH_REFRESH_TOKEN });
      }

      const jwtPayload = {
        id: appUser.dataValues.id,
        idAppUser: appUser.dataValues.id,
        userType: appUser.dataValues.user_type,
      };
      const data = createUserJWT(
        appUser.dataValues.id,
        jwtPayload,
        appUser.dataValues.user_type
      );
      return resSuccess({ data });
    } else if (
      result.code === UNAUTHORIZED_ACCESS_CODE &&
      result.message === JWT_EXPIRED_ERROR_NAME
    ) {
      return result;
    }

    return resUnknownError(result);
  } catch (e) {
    throw e;
  }
};

export const changePassword = async (req: Request) => {
  try {
    const appUser = await AppUser.findOne({
      where: { id: req.body.session_res.id_app_user },
    });
    if (!appUser) {
      return resBadRequest({ message: USER_NOT_FOUND });
    }

    const isPasswordValid = <any>(
      await bcrypt.compare(req.body.old_password, appUser.dataValues.pass_hash)
    );
    if (!isPasswordValid) {
      return resBadRequest({ message: PASSWORD_IS_WRONG });
    }

    const pass_hash = await bcrypt.hash(
      req.body.new_password,
      Number(PASSWORD_SOLT)
    );

    await AppUser.update(
      {
        pass_hash,
        modified_at: getLocalDate(),
        modified_by: appUser.dataValues.id,
      },
      { where: { id: appUser.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const forgotPassword = async (req: Request) => {
  try {
    const appUser = await AppUser.findOne({
      where: { username: req.body.username, is_deleted: "0" },
    });
    if (!appUser) {
      return resBadRequest({ message: USER_NOT_FOUND });
    }

    let name;
    if (appUser.dataValues.user_type === USER_TYPE.BusinessUser) {
      const businessUser = await BusinessUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
      });
      if (!(businessUser && businessUser.dataValues)) {
        return resBadRequest({ message: USER_NOT_FOUND });
      }
      name = businessUser.dataValues.name;
    } else if (appUser.dataValues.user_type === USER_TYPE.Customer) {
      const customer = await customerUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
      });
      if (!(customer && customer.dataValues)) {
        return resBadRequest({ message: USER_NOT_FOUND });
      }
      const customerUserFind = await customerUser.findOne({
        where: { id_app_user: appUser.dataValues.id,sign_up_type: {[Op.ne]:SIGN_UP_TYPE.System}  },
      })
      if(customerUserFind && customerUserFind.dataValues){
        return resNotFound({ message: prepareMessageFromParams(RESET_PASSWORD_TYPE_WRONG_ERROR_MESSAGE, [["field_name", customerUserFind.dataValues.sign_up_type]]) });
      }
      name = customer.dataValues.full_name;
    }
    const token = createResetToken(appUser.dataValues.id);

    let link = `${FRONT_END_BASE_URL}/${RESET_PASSWORD_PATH}${token}`;
    let logo_image = IMAGE_PATH;
    let frontend_url = FRONT_END_BASE_URL;
    let app_name = APP_NAME;
    const mailPayload = {
      toEmailAddress: appUser.dataValues.username,
      contentTobeReplaced: { name, link,app_name, logo_image, frontend_url },
    };
    
    await mailPasswordResetLink(mailPayload);
    await AppUser.update(
      {
        pass_reset_token: token,
        modified_date: getLocalDate(),
        modified_by: appUser.dataValues.id,
      },
      { where: { id: appUser.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const resetPassword = async (req: Request) => {
  try {
    const tokenRes = await verifyJWT(req.body.token);
    if (tokenRes.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return tokenRes;
    }
    const appUser = await AppUser.findOne({
      where: { id: tokenRes.data.id },
    });
    if (!appUser) {
      return resUnprocessableEntity({ message: USER_NOT_FOUND });
    }

    if (appUser.dataValues.pass_reset_token !== req.body.token) {
      return resUnprocessableEntity({ message: INVALID_TOKEN });
    }

    const pass_hash = await bcrypt.hash(
      req.body.new_password,
      Number(PASSWORD_SOLT)
    );

    await AppUser.update(
      {
        pass_hash,
        pass_reset_token: null,
        modified_date: getLocalDate(),
        modified_by: appUser.dataValues.id,
      },
      { where: { id: appUser.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const changeAnyUserPassword = async (req: Request) => {
  try {
    const { id_app_user, new_password } = req.body;

    const userToUpdate = await AppUser.findOne({
      where: { id: id_app_user, is_deleted: "0" },
    });

    if (!(userToUpdate && userToUpdate.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const pass_hash = await bcrypt.hash(new_password, Number(PASSWORD_SOLT));

    await AppUser.update(
      {
        pass_hash,
        modified_at: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: userToUpdate.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const fetchConfigurationByKey = async (key: string) => {
  try {
    const config = await SystemConfiguration.findOne({
      where: { config_key: key },
    });
    if (config && config.dataValues) {
      return resSuccess({ data: config });
    }
    return resNotFound();
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const registerCustomerUser = async (req: Request) => {
  try {
    const {
      full_name,
      username,
      mobile,
      password,
      country_id,
      confirm_password,
    } = req.body;

    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < OTP_GENERATE_DIGITS; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    console.log(OTP);
    const trn = await dbContext.transaction();
    try {
      const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));

      const emailExists = await customerUser.findOne({
        where: [columnValueLowerCase("email", username), { is_deleted: "0" }],
      });
      const emailIdExists = await AppUser.findOne({
        where: [
          columnValueLowerCase("username", username),
          { is_deleted: "0" },
        ],
      });

      if (emailExists == null && emailIdExists == null) {
        const appUserPayload = await AppUser.create(
          {
            username: username,
            pass_hash: pass_hash,
            user_type: USER_TYPE.Customer,
            user_status: USER_STATUS.PendingVerification,
            is_email_verified: 0,
            created_date: getLocalDate(),
            id_role: 3,
            one_time_pass: OTP,
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        console.log(appUserPayload);

        const CustomerUserPayload = await customerUser.create(
          {
            full_name: full_name,
            email: username,
            id_app_user: appUserPayload.dataValues.id,
            mobile: mobile,
            country_id: country_id,
            created_date: getLocalDate(),
            created_by: appUserPayload.dataValues.id,
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );

        await trn.commit();
        const mailPayload = {
          toEmailAddress: username,
          contentTobeReplaced: { name: full_name, OTP },
        };
        await mailRegistrationOtp(mailPayload);
        if (
          CustomerUserPayload &&
          CustomerUserPayload.dataValues &&
          CustomerUserPayload.dataValues.country_id == "+91" &&
          SEND_OTP_IN_WHATSAPP.toString() == "true"
        ) {
          await sendMessageInWhatsApp(
            OTP,
            CustomerUserPayload.dataValues.mobile
          );
        }
        return resSuccess({ data: CustomerUserPayload });
      } else {
        await trn.rollback();
        return resErrorDataExit();
      }
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const registrationCustomerUserWithThirdParty = async (req: Request) => {
  try {
    const { sign_up_type } = req.body;

    if (sign_up_type === SIGN_UP_TYPE.System) {
      return customerRegistrationWithSystem(req);
    } else if (sign_up_type === SIGN_UP_TYPE.Google) {
      return customerRegistrationWithGoogle(req);
    }
  } catch (e) {
    throw e;
  }
};

const customerRegistrationWithSystem = async (req: Request) => {
  try {
    const { full_name, username, mobile, password, country_id, sign_up_type } =
      req.body;

    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < OTP_GENERATE_DIGITS; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    const trn = await dbContext.transaction();
    try {
      const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));

      const emailExists = await customerUser.findOne({
        where: [
          columnValueLowerCase("email", username),
          { is_deleted: DeletedStatus.No },
        ],
        transaction: trn,
      });

      if (emailExists && emailExists.dataValues) {
        await trn.rollback();
        return resErrorDataExit({
          message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
            ["field_name", "email"],
          ]),
        });
      }
      // if (emailExists && emailExists.dataValues) {
      //   const emailExistsWithSameSigUpType: any = await dbContext.query(
      //     `(SELECT * FROM public.customer_users
      //       WHERE '${SING_UP_TYPE.System}' = ANY (sign_up_type)
      //       AND is_deleted = '${DeletedStatus.No}' AND id = '${emailExists.dataValues.id}')`,
      //     { type: QueryTypes.SELECT, transaction: trn }
      //   );

      //   if (
      //     emailExistsWithSameSigUpType &&
      //     emailExistsWithSameSigUpType.length > 0
      //   ) {
      //     await trn.rollback();
      //     return resErrorDataExit({
      //       message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
      //         ["field_name", "email"],
      //       ]),
      //     });
      //   }
      // }

      const emailIdExists = await AppUser.findOne({
        where: [
          columnValueLowerCase("username", username),
          // emailExists && emailExists.dataValues
          //   ? { id: { [Op.ne]: emailExists.dataValues.id_app_user } }
          //   : {},
          { is_deleted: DeletedStatus.No },
        ],
        transaction: trn,
      });
      if (emailIdExists && emailIdExists.dataValues) {
        await trn.rollback();
        return resErrorDataExit({
          message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
            ["field_name", "email"],
          ]),
        });
      }
      const phoneNumberExists = await customerUser.findOne({
        where: [
          { mobile: mobile },
          { is_deleted: DeletedStatus.No },
          // emailExists && emailExists.dataValues
          //   ? { id: { [Op.ne]: emailExists.dataValues.id } }
          //   : {},
        ],
        transaction: trn,
      });

      if (phoneNumberExists && phoneNumberExists.dataValues) {
        await trn.rollback();
        return resErrorDataExit({
          message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
            ["field_name", "Phone number"],
          ]),
        });
      }
      const currentDate = getLocalDate(); // Get current time
      const expireDate = new Date(currentDate.getTime() + OTP_EXPIRATION_TIME);
      const appUserPayload = await AppUser.create(
        {
          username: username,
          pass_hash: pass_hash,
          user_type: USER_TYPE.Customer,
          user_status: USER_STATUS.PendingVerification,
          is_email_verified: 0,
          created_date: getLocalDate(),
          id_role: 3,
          one_time_pass: OTP,
          otp_create_date: currentDate,
          otp_expire_date: expireDate,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
        },
        { transaction: trn }
      );

      const CustomerUserPayload = await customerUser.create(
        {
          full_name: full_name,
          email: username,
          id_app_user: appUserPayload.dataValues.id,
          mobile: mobile,
          country_id: country_id,
          created_date: getLocalDate(),
          created_by: appUserPayload.dataValues.id,
          is_active: ActiveStatus.Active,
          sign_up_type: SIGN_UP_TYPE.System,
          is_deleted: DeletedStatus.No,
        },
        { transaction: trn }
      );

      await trn.commit();
      const mailPayload = {
        toEmailAddress: username,
        contentTobeReplaced: { name: full_name, OTP },
      };
      await mailRegistrationOtp(mailPayload);
      if (
        CustomerUserPayload &&
        CustomerUserPayload.dataValues &&
        CustomerUserPayload.dataValues.country_id == "+91" &&
        SEND_OTP_IN_WHATSAPP.toString() == "true"
      ) {
        console.log("----++++++======", CustomerUserPayload.dataValues.mobile);
        await sendMessageInWhatsApp(OTP, CustomerUserPayload.dataValues.mobile);
      }
      return resSuccess({ data: CustomerUserPayload });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (error) {
    return resUnprocessableEntity({ data: error });
  }
};

const customerRegistrationWithGoogle = async (req: Request) => {
  try {
    const {
      full_name,
      username,
      mobile,
      country_id,
      third_party_response,
      token,
    } = req.body;

    const trn = await dbContext.transaction();
    try {
      const emailExists = await customerUser.findOne({
        where: [
          columnValueLowerCase("email", username),
          { is_deleted: DeletedStatus.No },
        ],
        transaction: trn,
      });

      if (!emailExists) {
        const findAppUser = await AppUser.findOne({
          where: [
            columnValueLowerCase("username", username),
            { is_deleted: DeletedStatus.No },
          ],
        });

        if (findAppUser && findAppUser.dataValues) {
          await trn.rollback();
          return resErrorDataExit({
            message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
              ["field_name", "email"],
            ]),
          });
        }
        const appUserPayload = await AppUser.create(
          {
            username: username,
            user_type: USER_TYPE.Customer,
            user_status: USER_STATUS.Approved,
            is_email_verified: 1,
            created_date: getLocalDate(),
            id_role: 3,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
          },
          { transaction: trn }
        );

        const CustomerUserPayload = await customerUser.create(
          {
            full_name: full_name,
            email: username,
            id_app_user: appUserPayload.dataValues.id,
            country_id: country_id,
            created_date: getLocalDate(),
            created_by: appUserPayload.dataValues.id,
            is_active: ActiveStatus.Active,
            sign_up_type: SIGN_UP_TYPE.Google,
            third_party_response: third_party_response,
            is_deleted: DeletedStatus.No,
          },
          { transaction: trn }
        );
        await trn.commit();
        let logo_image = IMAGE_PATH;
        let frontend_url = FRONT_END_BASE_URL;

        const mailPayload = {
          toEmailAddress: CustomerUserPayload.dataValues.email,
          contentTobeReplaced: {
            full_name: CustomerUserPayload?.dataValues.full_name,
            logo_image,
            frontend_url,
          },
        };
        await successRegistration(mailPayload);
        const jwtPayload = {
          id: appUserPayload && appUserPayload.dataValues.id,
          id_app_user: appUserPayload.dataValues.id,
          user_type: appUserPayload.dataValues.user_type,
          id_role: appUserPayload.dataValues.id_role,
        };

        const data = createUserJWT(
          appUserPayload.dataValues.id,
          jwtPayload,
          appUserPayload.dataValues.user_type
        );
        const userDetails = await customerUser.findOne({
          where: { id_app_user: appUserPayload.dataValues.id, is_deleted: "0" },
          attributes: [
            "id",
            "full_name",
            "email",
            "mobile",
            "country_id",
            "id_app_user",
            "created_date",
            [Sequelize.literal("image.image_path"), "image_path"],
          ],
          include: [{ model: Image, as: "image", attributes: [] }],
        });
        return resSuccess({ data: { tokens: data, user_detail: userDetails } });
      } else {
        const sameEmailFind = await customerUser.findOne({
          where: {
            sign_up_type: { [Op.eq]: SIGN_UP_TYPE.System },
            id: { [Op.eq]: emailExists.dataValues.id },
          },
        });

        if (sameEmailFind && sameEmailFind.dataValues) {
          await trn.rollback();
          return resErrorDataExit({
            message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
              ["field_name", "email"],
            ]),
          });
        }

        const findAppUser = await AppUser.findOne({
          where: [
            { id: { [Op.ne]: emailExists.dataValues.id_app_user } },
            columnValueLowerCase("username", username),
            { is_deleted: DeletedStatus.No },
          ],
        });

        if (findAppUser && findAppUser.dataValues) {
          await trn.rollback();
          return resErrorDataExit({
            message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
              ["field_name", "email"],
            ]),
          });
        }
        const CustomerUserPayload = await customerUser.update(
          {
            full_name: full_name,
            third_party_response: third_party_response,
            is_deleted: DeletedStatus.No,
          },
          { where: { id: emailExists.dataValues.id }, transaction: trn }
        );

        const updateUserDetail = await customerUser.findOne({
          where: { id: emailExists.dataValues.id },
        });

        const appUser = await AppUser.findOne({
          where: { id: emailExists.dataValues.id_app_user },
        });
        const jwtPayload = {
          id: appUser && appUser.dataValues.id,
          id_app_user: appUser.dataValues.id,
          user_type: appUser.dataValues.user_type,
          id_role: appUser.dataValues.id_role,
        };

        const data = createUserJWT(
          appUser.dataValues.id,
          jwtPayload,
          appUser.dataValues.user_type
        );
        await trn.commit();

        return resSuccess({ data: { tokens: data, user_detail: emailExists } });
      }
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (error) {
    return resUnprocessableEntity({ data: error });
  }
};

export const customerRegisterOtpVerified = async (req: Request) => {
  try {
    const { remember_me = false } = req.body;
    const userData = await AppUser.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    if (!(userData && userData.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }
    if (userData.dataValues.one_time_pass === req.body.OTP) {
      if (
        userData.dataValues.otp_create_date &&
        userData.dataValues.otp_expire_date
      ) {
        if (
          !(
            getLocalDate() >= userData.dataValues.otp_create_date &&
            getLocalDate() <= userData.dataValues.otp_expire_date
          )
        ) {
          return resBadRequest({
            code: RESOURCE_EXPIRED_STATUS_CODE,
            message: OTP_EXPIRATION_MESSAGE,
          });
        }
      }

      await AppUser.update(
        {
          user_status: USER_STATUS.Approved,
          is_email_verified: 1,
          approved_date: getLocalDate(),
          modified_date: getLocalDate(),
        },

        { where: { id: userData.dataValues.id, is_deleted: "0" } }
      );

      const jwtPayload = {
        id: userData && userData.dataValues.id,
        id_app_user: userData.dataValues.id,
        user_type: userData.dataValues.user_type,
        id_role: userData.dataValues.id_role,
      };

      const data = createUserJWT(
        userData.dataValues.id,
        jwtPayload,
        remember_me && remember_me == true ? 5 : userData.dataValues.user_type
      );
      const userDetails = await customerUser.findOne({
        where: { id_app_user: userData.dataValues.id, is_deleted: "0" },
        attributes: [
          "id",
          "full_name",
          "email",
          "mobile",
          "country_id",
          "id_app_user",
          "created_date",
          "sign_up_type",
          "third_party_response",
          "gender",
          [Sequelize.literal("image.image_path"), "image_path"],
        ],
        include: [{ model: Image, as: "image", attributes: [] }],
      });
      let logo_image = IMAGE_PATH;
      let frontend_url = FRONT_END_BASE_URL;

      if (userDetails.dataValues.user_status != USER_STATUS.Approved) {
        const mailPayload = {
          toEmailAddress: userData.dataValues.username,
          contentToBeReplaced: {
            full_name: userDetails?.dataValues.full_name,
            logo_image,
            frontend_url,
          },
        };
        await successRegistration(mailPayload);
      }
      return resSuccess({
        data: {
          tokens: data,
          user_detail: userDetails,
        },
      });
    } else {
      return resBadRequest({ message: INVALID_OTP });
    }
  } catch (error) {
    throw error;
  }
};

export const resendOtpVerification = async (req: Request) => {
  try {
    const userData = await AppUser.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    const customer = await customerUser.findOne({
      where: { id_app_user: userData?.dataValues.id, is_deleted: "0" },
    });
    if (userData) {
      const digits = "0123456789";
      let OTP = "";
      for (let i = 0; i < OTP_GENERATE_DIGITS; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      const currentDate = getLocalDate(); // Get current time
      const expireDate = new Date(currentDate.getTime() + OTP_EXPIRATION_TIME);
      await AppUser.update(
        {
          one_time_pass: OTP,
          otp_create_date: currentDate,
          otp_expire_date: expireDate,
        },

        { where: { id: userData.dataValues.id, is_deleted: "0" } }
      );

      const name = customer?.dataValues.full_name;
      let logo_image = IMAGE_PATH;
      let frontend_url = FRONT_END_BASE_URL;
      const mailPayload = {
        toEmailAddress: userData.dataValues.username,
        contentTobeReplaced: { name, OTP, logo_image, frontend_url },
      };

      await mailRegistrationOtp(mailPayload);
      if (
        userData.dataValues.user_type === USER_TYPE.Customer &&
        customer &&
        customer.dataValues &&
        customer.dataValues.country_id == "+91" &&
        SEND_OTP_IN_WHATSAPP.toString() == "true"
      ) {
        await sendMessageInWhatsApp(OTP, customer.dataValues.mobile);
      }
      return resSuccess();
    } else {
      return resNotFound({ message: USER_NOT_FOUND });
    }
  } catch (error) {
    throw error;
  }
};

export const getProfileForCustomer = async (req: Request) => {
  try {
    const data = await customerUser.findOne({
      where: {
        id_app_user: Number(req.params.id),
        is_deleted: DeletedStatus.No,
      },
      attributes: [
        "id",
        "full_name",
        "email",
        "mobile",
        "country_id",
        "id_app_user",
        "created_date",
        "gender",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    if (data) {
      return resSuccess({ data: data });
    } else {
      return resNotFound();
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const updateProfileForCustomer = async (req: Request) => {
  const {
    full_name,
    mobile,
    updated_by,
    country_id,
    id,
    gender = null,
  } = req.body;

  try {
    const CustomerId = await customerUser.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (CustomerId == null) {
      return resNotFound();
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.profile,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await dbContext.transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.profile,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      }

      const appUserInfo = await AppUser.update(
        {
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },

        {
          where: {
            id: CustomerId.dataValues.id_app_user,
            is_deleted: DeletedStatus.No,
          },
          transaction: trn,
        }
      );

      const customerNumber = await customerUser.findOne({
        where: {
          mobile: mobile,
          id: { [Op.ne]: id },
          is_deleted: DeletedStatus.No,
        },
        transaction: trn,
      });

      if (customerNumber && customerNumber.dataValues) {
        await trn.rollback();

        return resErrorDataExit({
          message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
            ["field_name", "mobile"],
          ]),
        });
      }
      const CustomerInfo = await customerUser.update(
        {
          full_name: full_name,
          mobile: mobile,
          country_id: country_id,
          modified_date: getLocalDate(),
          gender: gender,
          modified_by: req.body.session_res.id_app_user,
          id_image: id_image,
        },

        {
          where: { id: CustomerId.dataValues.id, is_deleted: "0" },
          transaction: trn,
        }
      );
      if (CustomerInfo) {
        const CustomerInformation = await customerUser.findOne({
          where: { id: id, is_deleted: "0" },
          transaction: trn,
        });
        await trn.commit();
        return resSuccess({ data: CustomerInformation });
      }
      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (error) {
    throw error;
  }
};
