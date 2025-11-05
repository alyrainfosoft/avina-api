import { Request } from "express";
import { Model, Op, QueryTypes, Sequelize } from "sequelize";
import dbContext from "../../config/db-context";
import categoryData from "../model/category.model";
import Product from "../model/product.model";
import fs from "fs";
import {
  ATTRIBUTE_NOT_FOUND,
  CATEGORY_NOT_FOUND,
  PRODUCT_METAL_OPTIONS_CENTER_DIAMOND_PRICE_IS_REQUIRED,
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  DIAMOND_GROUP_NOT_FOUND,
  GOLD_WEIGHT_REQUIRES,
  IMAGES_NOT_FOUND,
  IMAGE_NOT_FOUND,
  INVALID_CATEGORY,
  INVALID_ID,
  ITEM_IS_ALREADY_IN_MODE,
  LENGTH_NOT_FOUND,
  METAL_FORMULA_NOT_AVAILABLE,
  METAL_GROUP_NOT_FOUND,
  METAL_IS_REQUIRES,
  METAL_KT_IS_REQUIRES,
  METAL_KT_NOT_FOUND,
  METAL_RATE_CONFIG_NOT_FOUND,
  METAL_TONE_NOT_FOUND,
  PRODUCT_DIAMOND_OPTION_NOT_FOUND,
  PRODUCT_EXIST_WITH_SAME_NAME,
  PRODUCT_EXIST_WITH_SAME_SKU,
  PRODUCT_METAL_OPTION_NOT_FOUND,
  PRODUCT_NOT_FOUND,
  RECORD_UPDATE_SUCCESSFULLY,
  SETTING_DIAMOND_SHAPES_IS_REQUIRED,
  SETTING_STYLE_TYPE_NOT_FOUND,
  SETTING_TYPE_IS_REQUIRED,
  SIZE_NOT_FOUND,
  TAG_NOT_FOUND,
  UNPROCESSABLE_ENTITY_CODE,
  VIDEOS_NOT_FOUND,
  VIDEO_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
} from "../../utils/app-messages";
import {
  columnValueLowerCase,
  getDecryptedText,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  refreshMaterializedProductListView,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
  roundDecimalNumber,
} from "../../utils/shared-functions";
import {
  IProductMetalOptions,
  IProductDiamondOptions,
  TResponseReturn,
  ISaveProductMetalOptionsPayload,
  ISaveSettingStyleTypePayload,
  ISaveProductDiamondOptionsPayload,
  ISaveProductSizePayload,
  ISaveProductLengthPayload,
  IValidateProductTagPayload,
  IValidateProductCategoryPayload,
  IProductCategory,
  IMetalRate,
  IMetalGroupRate,
  IProductMetalSilverData,
  IProductMetalGoldData,
  IQueryPagination,
  IValidateProductCollectionPayload,
  IValidateProductSizePayload,
  IValidateProductLengthPayload,
  IProductVariantMetalData,
  IValidateDiamondShapesPayload,
} from "../../data/interfaces/common/common.interface";
import {
  ActiveStatus,
  AllProductTypes,
  DISCOUNT_TYPE,
  DeletedStatus,
  FeaturedProductStatus,
  IMAGE_TYPE,
  METAL_RATE_FORMULA,
  PRODUCT_IMAGE_TYPE,
  PaymentStatus,
  SORTING_OPTION,
  STOCK_PRODUCT_TYPE,
  STOCK_TRANSACTION_TYPE,
  SYSTEM_CONFIGURATIONS_KEYS,
  SingleProductType,
  TrendingProductStatus,
} from "../../utils/app-enumeration";
import {
  PRODUCT_FILE_LOCATION,
  PRODUCT_PER_PAGE_ROW,
  RATE_CONFIG_KEY_LIST,
  RATE_PRICE_DECIMAL_POINT,
} from "../../utils/app-constants";
import ProductCategory from "../model/product-category.model";
import Tag from "../model/master/attributes/tag.model";
import SettingTypeData from "../model/master/attributes/settingType.model";
import MetalGroupMaster from "../model/master/attributes/metal/metal-group-master.model";
import ProductMetalOption from "../model/product-metal-option.model";
import SystemConfiguration from "../model/system-configuration.model";
import { fetchConfigurationByKey } from "./auth.service";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import ProductDiamondOption from "../model/product-diamond-option.model";
import SettingCaratWeight from "../model/master/attributes/settingCaratWeight.model";
import SizeData from "../model/master/attributes/item-size.model";
import LengthData from "../model/master/attributes/item-length.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import { Multer } from "multer";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../../helpers/file.helper";
import Image from "../model/image.model";
import { TImageType } from "../../data/types/common/common.type";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import ProductImage from "../model/product-image.model";
import ProductVideo from "../model/product-video.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import ProductWish from "../model/produc-wish-list.model";
import CartProducts from "../model/cart-product.model";
import ConfigCartProduct from "../model/config-cart-product.model";
import ConfigProduct from "../model/config-product.model";
import ConfigProductMetals from "../model/config-product-metal.model";
import ConfigProductDiamonds from "../model/config-product-diamonds.model";
import BrandData from "../model/master/attributes/brands.model";
import { NotNull } from "sequelize-typescript";
import { IMAGE_PATH } from "../../config/env.var";
import Collection from "../model/master/attributes/collection.model";
import StockChangeLog from "../model/stock-change-log.model";

export const getAllProduct = async (req: Request) => {
  try {
    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };

    let where = [
      { is_deleted: "0" },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: {
            name: { [Op.iLike]: `%${pagination.search_text}%` },
            sku: { [Op.iLike]: `%${pagination.search_text}%` },
          },
        }
        : {},
    ];

    const totalItems = await Product.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const result = await Product.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [
        pagination.sort_by === "category_name"
          ? [
            Sequelize.literal(`
        (SELECT categories.category_name FROM product_categories AS pc
         LEFT OUTER JOIN categories ON categories.id=pc.id_category
         WHERE pc.id_product=products.id AND pc.is_deleted='0' ORDER BY pc.id ASC limit 1)
      `),
            pagination.order_by,
          ]
          : [pagination.sort_by, pagination.order_by],
      ],
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "sort_description",
        "long_description",
        "is_featured",
        "is_active",
        "product_type",
        "discount_type",
        "discount_value",
        "is_trending",
        "additional_detail",
        [
          Sequelize.literal(
            `CASE WHEN "gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gender", '|')::int[] END`
          ),
          "gender",
        ],
        [
          Sequelize.literal(`
            (SELECT categories.category_name FROM product_categories AS pc
              LEFT OUTER JOIN categories ON categories.id=pc.id_category
            WHERE pc.id_product=products.id AND pc.is_deleted='0' ORDER BY pc.id ASC limit 1)
          `),
          "category_name",
        ],
      ],
      include: [
        {
          required: false,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [
            "id",
            "id_metal_group",
            "metal_weight",
            "retail_price",
            "compare_price",
            [Sequelize.literal('"PMO"."remaing_quantity_count"'), "quantity"],
          ],
          where: { is_deleted: "0" },
        },
      ],
    });

    // await addRateToProductList(result);
    return resSuccess({ data: { pagination, result } });
  } catch (e) {
    throw e;
  }
};

const addRateToProductList = async (productList: any) => {
  const resFMCGR = await fetchMetalConfigGroupRate();
  if (resFMCGR.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    return resFMCGR;
  }
  const rateMetalConfig: IMetalGroupRate[] = resFMCGR.data;
  let pmoPriceList: number[] = [];
  for (let product of productList) {
    if (product.dataValues.PMO) {
      for (let pmo of product.dataValues.PMO) {
      }
    }
  }
};

export const getProductById = async (req: Request) => {
  try {
    let idProduct = req.params.id;
    if (!idProduct) return resBadRequest({ message: INVALID_ID });

    const findProduct = await Product.findOne({
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "id_brand",
        [
          Sequelize.literal(
            `CASE WHEN "gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gender", '|')::int[] END`
          ),
          "gender",
        ],
        "sort_description",
        "long_description",
        "making_charge",
        "finding_charge",
        "other_charge",
        "product_type",
        "discount_type",
        "discount_value",
        "is_featured",
        "is_trending",
        "is_quantity_track",
        "retail_price",
        "compare_price",
        "quantity",
        "additional_detail",
        [
          Sequelize.literal(
            `CASE WHEN "products"."id_collection" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."id_collection", '|')::int[] END`
          ),
          "id_collection",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."tag" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."tag", '|')::int[] END`
          ),
          "tag",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."size" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."size", '|')::int[] END`
          ),
          "size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."length" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."length", '|')::int[] END`
          ),
          "length",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."setting_style_type" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."setting_style_type", '|')::int[] END`
          ),
          "setting_style_type",
        ],
        "is_single",
        "is_choose_setting",
        [
          Sequelize.literal(
            `CASE WHEN "products"."setting_diamond_shapes" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."setting_diamond_shapes", '|')::int[] END`
          ),
          "setting_diamond_shapes",
        ],
      ],
      where: {
        id: idProduct,
        is_deleted: "0",
      },
      include: [
        {
          required: false,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [
            "id",
            "id_metal_group",
            "metal_weight",
            "id_metal",
            "retail_price",
            "compare_price",
            "id_size",
            "id_m_tone",
            "id_length",
            [Sequelize.literal('"PMO"."remaing_quantity_count"'), "quantity"],
            "side_dia_weight",
            "side_dia_count",
            "id_m_tone",
            [
              Sequelize.literal(
                `CASE WHEN "PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("PMO"."id_metal_tone", '|')::int[] END`
              ),
              "metal_tone",
            ],
            "center_diamond_price",
            "id_karat",
            "is_default",
            "is_deleted",
          ],
          where: { is_deleted: "0" },
        },
        {
          required: false,
          model: ProductDiamondOption,
          as: "PDO",
          attributes: [
            "id",
            "id_diamond_group",
            "id_type",
            "id_setting",
            "weight",
            "count",
            "is_default",
            "id_stone",
            "id_shape",
            "id_mm_size",
            "id_color",
            "id_clarity",
            "id_cut",
          ],
          include: [
            {
              required: false,
              model: DiamondGroupMaster,
              as: "rate",
              attributes: [
                "id",
                "id_stone",
                "id_shape",
                "id_mm_size",
                "id_color",
                "id_clarity",
                "id_cuts",
                "rate",
              ],
              where: { is_deleted: "0" },
            },
          ],
          where: { is_deleted: "0" },
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
          where: { is_deleted: "0" },
        },
        {
          required: false,
          model: ProductImage,
          as: "product_images",
          attributes: ["id", "image_path", "image_type", "id_metal_tone"],
          where: { is_deleted: "0" },
        },
        {
          required: false,
          model: ProductVideo,
          as: "product_videos",
          attributes: ["id", "video_path", "video_type", "id_metal_tone"],
          where: { is_deleted: "0" },
        },
      ],
    });

    let metalToneList;
    if (findProduct.dataValues.product_type == SingleProductType.VariantType) {
      metalToneList = findProduct?.dataValues.PMO.map(
        (t: any) => t.dataValues.id_m_tone
      );
    } else {
      const metalTone = findProduct?.dataValues.PMO.map(
        (t: any) => t.dataValues.metal_tone
      );
      metalToneList = metalTone.flat().map((t: any) => t);
    }

    const metal_tone = await MetalTone.findAll({
      where: { id: metalToneList.map((t: any) => t) },
      attributes: [
        "id",
        "name",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    return resSuccess({ data: { findProduct, metal_tone } });
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const validateSameProductName = async (
  name: string,
  sku: string,
  id: number | null = null
) => {
  const productWithSameNameSKU = await Product.findOne({
    where: [
      { [Op.or]: { name, sku }, is_deleted: "0" },
      id ? { id: { [Op.ne]: id } } : {},
    ],
  });
  if (productWithSameNameSKU && productWithSameNameSKU.dataValues) {
    return resUnprocessableEntity({
      message:
        productWithSameNameSKU.dataValues.name === name
          ? PRODUCT_EXIST_WITH_SAME_NAME
          : PRODUCT_EXIST_WITH_SAME_SKU,
    });
  }
  return resSuccess();
};

export const activeInactiveProduct = async (req: Request) => {
  try {
    const { id_product, is_active } = req.body;
    const findProduct = await Product.findOne({
      where: {
        id: id_product,
        is_deleted: "0",
      },
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    if (is_active === findProduct.dataValues.is_active) {
      return resBadRequest({
        message: prepareMessageFromParams(ITEM_IS_ALREADY_IN_MODE, [
          ["item", "Product"],
          ["mode", is_active === "1" ? "activate" : "inactivate"],
        ]),
      });
    }

    await Product.update(
      {
        is_active: is_active,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findProduct.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const deleteProduct = async (req: Request) => {
  const trn = await dbContext.transaction();
  try {
    const productToBeDelete = await Product.findOne({
      where: {
        id: req.body.id,
        is_deleted: "0",
      },
    });

    if (!(productToBeDelete && productToBeDelete.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await Product.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: productToBeDelete.dataValues.id }, transaction: trn }
    );

    await ProductCategory.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: "0" },
        transaction: trn,
      }
    );

    await ProductMetalOption.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: "0" },
        transaction: trn,
      }
    );

    await ProductDiamondOption.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: "0" },
        transaction: trn,
      }
    );

    await ProductImage.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: "0" },
        transaction: trn,
      }
    );

    await ProductVideo.update(
      {
        is_deleted: "1",
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: "0" },
        transaction: trn,
      }
    );

    // const resRename: TResponseReturn = await new Promise((resolve, reject) => {
    //   fs.rename(
    //     `public/${PRODUCT_FILE_LOCATION}/${productToBeDelete.dataValues.sku}`,
    //     `public/${PRODUCT_FILE_LOCATION}/${productToBeDelete.dataValues.sku
    //     }-archive-${getLocalDate().getTime()}`,
    //     function (err: any) {
    //       if (err) {
    //         return resolve(resUnknownError({ data: err }));
    //       }
    //       return resolve(resSuccess());
    //     }
    //   );
    // });

    // if (resRename.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    //   await trn.rollback();
    //   return resRename;
    // }

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
  }
};

export const saveProductBasicDetails = async (req: Request) => {
  try {
    const {
      id_product,
      name,
      sku,
      sort_description,
      long_description,
      tag,
      product_categories,
      making_charge,
      finding_charge,
      other_charge,
      additional_detail = null,
    } = req.body;

    let resIdProduct = 0;
    if (id_product !== 0) {
      resIdProduct = id_product;
    }
    let productToBeUpdate;
    if (id_product !== 0) {
      productToBeUpdate = await Product.findOne({
        where: {
          id: id_product,
          is_deleted: "0",
        },
      });

      if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
    }

    const validateName = await validateSameProductName(
      name,
      sku,
      id_product !== 0 ? id_product : null
    );
    if (validateName.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validateName;
    }

    const validTag = await validateProductTag({
      tag,
      oldTag:
        productToBeUpdate && productToBeUpdate.dataValues.tag
          ? productToBeUpdate.dataValues.tag
          : "",
    });

    if (validTag.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validTag;
    }

    const validPC = await validateProductCategories({
      categories: product_categories,
      id_product: id_product !== 0 ? id_product : null,
    });

    if (validPC.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validPC;
    }

    const trn = await dbContext.transaction();
    try {
      if (id_product === 0) {
        const resProduct = await Product.create(
          {
            name: name,
            sku: sku,
            sort_description: sort_description,
            long_description: long_description,
            additional_detail: additional_detail,
            tag: tag.join("|"),
            making_charge,
            finding_charge,
            other_charge,
            is_active: ActiveStatus.Active,
            is_featured: FeaturedProductStatus.InFeatured,
            is_trending: TrendingProductStatus.InTrending,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        resIdProduct = resProduct.dataValues.id;
        for (const productCategory of product_categories) {
          await ProductCategory.create(
            {
              id_product: resProduct.dataValues.id,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }
      } else {
        await Product.update(
          {
            name: name,
            sku: sku,
            additional_detail: additional_detail,
            sort_description: sort_description ? sort_description : null,
            long_description: long_description ? long_description : null,
            tag: tag.join("|"),
            making_charge,
            finding_charge,
            other_charge,
            modified_by: req.body.session_res.id_app_user,
            modified_date: new Date(),
          },
          { where: { id: id_product }, transaction: trn }
        );

        for (const productCategory of product_categories) {
          if (productCategory.id === 0) {
            await ProductCategory.create(
              {
                id_product: id_product,
                id_category: productCategory.id_category,
                id_sub_category: productCategory.id_sub_category,
                id_sub_sub_category: productCategory.id_sub_sub_category,
                created_by: req.body.session_res.id_app_user,
                created_date: new Date(),
              },
              { transaction: trn }
            );
          } else {
            await ProductCategory.update(
              {
                id_category: productCategory.id_category,
                id_sub_category: productCategory.id_sub_category,
                id_sub_sub_category: productCategory.id_sub_sub_category,
                modified_by: req.body.session_res.id_app_user,
                modified_date: new Date(),
              },
              { where: { id: productCategory.id }, transaction: trn }
            );
          }
        }

        for (const productCategory of validPC.data) {
          await ProductCategory.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: new Date(),
            },
            { where: { id: productCategory.id }, transaction: trn }
          );
        }
      }

      await trn.commit();
      return resSuccess({ data: resIdProduct });
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

const validateProductTag = async (payload: IValidateProductTagPayload) => {
  const { tag, oldTag } = payload;

  let tagIdsToValidate = [];
  let tagIds = oldTag.split("|").map((item) => Number(item));

  for (const id of tag) {
    if (!tagIds.includes(id)) {
      tagIdsToValidate.push(id);
    }
  }

  const validateTag = await Tag.findAll({
    where: {
      id: { [Op.in]: tagIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
  });

  if (validateTag.length !== tagIdsToValidate.length) {
    return resUnprocessableEntity({ message: TAG_NOT_FOUND });
  }

  return resSuccess();
};

const validateProductCollection = async (
  payload: IValidateProductCollectionPayload
) => {
  const { collection, oldCollection } = payload;

  let collectionIdsToValidate = [];
  let collectionIds = oldCollection.split("|").map((item) => Number(item));

  for (const id of collection) {
    if (!collectionIds.includes(id)) {
      collectionIdsToValidate.push(id);
    }
  }

  const validateTag = await Tag.findAll({
    where: {
      id: { [Op.in]: collectionIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
  });

  if (validateTag.length !== collectionIdsToValidate.length) {
    return resUnprocessableEntity({
      message: prepareMessageFromParams(DATA_NOT_FOUND, [
        ["field_name", "Collection"],
      ]),
    });
  }

  return resSuccess();
};

const validateProductSize = async (payload: IValidateProductSizePayload) => {
  const { size, oldSize } = payload;

  let sizeIdsToValidate = [];
  let sizeIds = oldSize.split("|").map((item) => Number(item));

  for (const id of size) {
    if (!sizeIds.includes(id)) {
      sizeIdsToValidate.push(id);
    }
  }

  const validateTag = await Tag.findAll({
    where: {
      id: { [Op.in]: sizeIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
  });

  if (validateTag.length !== sizeIdsToValidate.length) {
    return resUnprocessableEntity({
      message: prepareMessageFromParams(DATA_NOT_FOUND, [
        ["field_name", "Product Size"],
      ]),
    });
  }

  return resSuccess();
};

const validateProductLength = async (
  payload: IValidateProductLengthPayload
) => {
  const { length, oldLength } = payload;

  let lengthIdsToValidate = [];
  let lengthIds = oldLength.split("|").map((item) => Number(item));

  for (const id of length) {
    if (!lengthIds.includes(id)) {
      lengthIdsToValidate.push(id);
    }
  }

  const validateTag = await Tag.findAll({
    where: {
      id: { [Op.in]: lengthIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
  });

  if (validateTag.length !== lengthIdsToValidate.length) {
    return resUnprocessableEntity({
      message: prepareMessageFromParams(DATA_NOT_FOUND, [
        ["field_name", "Product length"],
      ]),
    });
  }

  return resSuccess();
};

const validateDiamondShapes = async (
  payload: IValidateDiamondShapesPayload
) => {
  const { shapes, oldShapes } = payload;

  let shapeIdsToValidate = [];
  let shapeIds = oldShapes.split("|").map((item) => Number(item));

  for (const id of shapes) {
    if (!shapeIds.includes(id)) {
      shapeIdsToValidate.push(id);
    }
  }

  const validateShapes = await DiamondShape.findAll({
    where: {
      id: { [Op.in]: shapeIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
  });

  if (validateShapes.length !== shapeIdsToValidate.length) {
    return resUnprocessableEntity({
      message: prepareMessageFromParams(DATA_NOT_FOUND, [
        ["field_name", "Setting diamond shape"],
      ]),
    });
  }

  return resSuccess();
};

const validateProductCategories = async (
  payload: IValidateProductCategoryPayload
) => {
  const { categories, id_product } = payload;

  let oldProductCategories: IProductCategory[] = [];

  if (id_product) {
    const findAllPC = await ProductCategory.findAll({
      where: { id_product, is_deleted: "0" },
    });

    if (findAllPC.length > 0) {
      oldProductCategories = findAllPC.map((item) => {
        return {
          id: item.dataValues.id,
          id_category: item.dataValues.id_category,
          id_sub_category: item.dataValues.id_sub_category,
          id_sub_sub_category: item.dataValues.id_sub_sub_category,
        };
      });
    }
  }

  for (const category of categories) {
    if (category.id !== 0) {
      const oldPC = oldProductCategories.find(
        (item) => item.id === category.id
      );
      if (oldPC === undefined) {
        return resUnprocessableEntity({ message: CATEGORY_NOT_FOUND });
      }

      oldProductCategories = oldProductCategories.filter(
        (item) => item.id !== category.id
      );

      if (oldPC.id_category !== category.id_category) {
        const validateCategory = await categoryData.findOne({
          attributes: ["id"],
          where: {
            id: category.id_category,
            is_deleted: "0",
            is_active: "1",
            parent_id: { [Op.eq]: null },
          },
          include: category.id_sub_category
            ? {
              model: categoryData,
              as: "sub_category",
              attributes: ["id"],
              where: {
                id: category.id_sub_category,
                is_deleted: "0",
                is_active: "1",
              },
              include: category.id_sub_sub_category
                ? [
                  {
                    model: categoryData,
                    as: "sub_category",
                    attributes: ["id"],
                    where: {
                      id: category.id_sub_sub_category,
                      is_deleted: "0",
                      is_active: "1",
                    },
                  },
                ]
                : [],
            }
            : [],
        });

        if (!(validateCategory && validateCategory.dataValues)) {
          return resUnprocessableEntity({ message: INVALID_CATEGORY });
        }
      } else if (category.id_sub_category) {
        if (oldPC.id_sub_category !== category.id_sub_category) {
          const validateCategory = await categoryData.findOne({
            attributes: ["id"],
            where: {
              id: category.id_category,
            },
            include: category.id_sub_category
              ? {
                model: categoryData,
                as: "sub_category",
                attributes: ["id"],
                where: {
                  id: category.id_sub_category,
                  is_deleted: "0",
                  is_active: "1",
                },
                include: category.id_sub_sub_category
                  ? [
                    {
                      model: categoryData,
                      as: "sub_category",
                      attributes: ["id"],
                      where: {
                        id: category.id_sub_sub_category,
                        is_deleted: "0",
                        is_active: "1",
                      },
                    },
                  ]
                  : [],
              }
              : [],
          });

          if (!(validateCategory && validateCategory.dataValues)) {
            return resUnprocessableEntity({ message: INVALID_CATEGORY });
          }
        } else if (
          category.id_sub_sub_category &&
          oldPC.id_sub_sub_category !== category.id_sub_sub_category
        ) {
          const validateCategory = await categoryData.findOne({
            attributes: ["id"],
            where: {
              id: category.id_sub_category,
            },
            include: category.id_sub_category
              ? {
                model: categoryData,
                as: "sub_category",
                attributes: ["id"],
                where: {
                  id: category.id_sub_sub_category,
                  is_deleted: "0",
                  is_active: "1",
                },
              }
              : [],
          });

          if (!(validateCategory && validateCategory.dataValues)) {
            return resUnprocessableEntity({ message: INVALID_CATEGORY });
          }
        }
      }
    } else {
      const validateCategory = await categoryData.findOne({
        attributes: ["id"],
        where: {
          id: category.id_category,
          is_deleted: "0",
          is_active: "1",
          parent_id: { [Op.eq]: null },
        },
        include: category.id_sub_category
          ? {
            model: categoryData,
            as: "sub_category",
            attributes: ["id"],
            where: {
              id: category.id_sub_category,
              is_deleted: "0",
              is_active: "1",
            },
            include: category.id_sub_sub_category
              ? [
                {
                  model: categoryData,
                  as: "sub_category",
                  attributes: ["id"],
                  where: {
                    id: category.id_sub_sub_category,
                    is_deleted: "0",
                    is_active: "1",
                  },
                },
              ]
              : [],
          }
          : [],
      });

      if (!(validateCategory && validateCategory.dataValues)) {
        return resUnprocessableEntity({ message: INVALID_CATEGORY });
      }
    }
  }

  return resSuccess({ data: oldProductCategories });
};

export const saveMetalDiamondDetails = async (req: Request) => {
  try {
    const {
      id_product,
      setting_style_type,
      size,
      length,
      product_metal_options,
      product_diamond_options,
    } = req.body;

    const productToBeUpdate = await Product.findOne({
      where: { id: id_product, is_deleted: "0" },
    });

    if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const trn = await dbContext.transaction();
    try {
      const resSSST = await saveSettingStyleType({
        settingStyleType: setting_style_type,
        oldSettingStyleType: productToBeUpdate.dataValues.setting_style_type
          ? productToBeUpdate.dataValues.setting_style_type
          : "",
        idProduct: productToBeUpdate.dataValues.id,
        idAppUser: req.body.session_res.id_app_user,
        trn,
      });

      if (resSSST.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return resSSST;
      }

      const resPS = await saveProductSize({
        size: size,
        oldSize: productToBeUpdate.dataValues.size
          ? productToBeUpdate.dataValues.size
          : "",
        idProduct: productToBeUpdate.dataValues.id,
        idAppUser: req.body.session_res.id_app_user,
        trn,
      });

      if (resPS.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return resPS;
      }

      const resPL = await saveProductLength({
        length: length,
        oldLength: productToBeUpdate.dataValues.length
          ? productToBeUpdate.dataValues.length
          : "",
        idProduct: productToBeUpdate.dataValues.id,
        idAppUser: req.body.session_res.id_app_user,
        trn,
      });

      if (resPL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return resPL;
      }

      const resSPMO = await saveProductMetalOptions({
        idProduct: productToBeUpdate.dataValues.id,
        productMetalOptions: product_metal_options,
        idAppUser: req.body.session_res.id_app_user,
        trn,
      });

      if (resSPMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return resSPMO;
      }

      const resSPDO = await saveProductDiamondOptions({
        idProduct: productToBeUpdate.dataValues.id,
        productDiamondOptions: product_diamond_options,
        idAppUser: req.body.session_res.id_app_user,
        trn,
      });

      if (resSPDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return resSPDO;
      }

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

const saveSettingStyleType = async (payload: ISaveSettingStyleTypePayload) => {
  const { settingStyleType, oldSettingStyleType, idProduct, idAppUser, trn } =
    payload;

  let settingStyleTypeIdsToValidate = [];
  let oldSettingStyleTypeIds = oldSettingStyleType
    .split("|")
    .map((item) => Number(item));

  for (const id of settingStyleType) {
    if (!oldSettingStyleTypeIds.includes(id)) {
      settingStyleTypeIdsToValidate.push(id);
    }
  }

  const validateStyleType = await SettingTypeData.findAll({
    where: {
      id: { [Op.in]: settingStyleTypeIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
    transaction: trn,
  });

  if (validateStyleType.length !== settingStyleTypeIdsToValidate.length) {
    return resUnprocessableEntity({ message: SETTING_STYLE_TYPE_NOT_FOUND });
  }

  await Product.update(
    {
      setting_style_type: settingStyleType.join("|"),
      modified_by: idAppUser,
      modified_date: getLocalDate(),
    },
    { where: { id: idProduct }, transaction: trn }
  );

  return resSuccess();
};

const saveProductSize = async (payload: ISaveProductSizePayload) => {
  const { size, oldSize, idProduct, idAppUser, trn } = payload;

  let sizeIdsToValidate = [];
  let sizeIds = oldSize.split("|").map((item) => Number(item));

  for (const id of size) {
    if (!sizeIds.includes(id)) {
      sizeIdsToValidate.push(id);
    }
  }

  const validateSize = await SizeData.findAll({
    where: {
      id: { [Op.in]: sizeIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
    transaction: trn,
  });

  if (validateSize.length !== sizeIdsToValidate.length) {
    return resUnprocessableEntity({ message: SIZE_NOT_FOUND });
  }

  await Product.update(
    {
      size: size.join("|"),
      modified_by: idAppUser,
      modified_date: getLocalDate(),
    },
    { where: { id: idProduct }, transaction: trn }
  );

  return resSuccess();
};

const saveProductLength = async (payload: ISaveProductLengthPayload) => {
  const { length, oldLength, idProduct, idAppUser, trn } = payload;

  let lengthIdsToValidate = [];
  let lengthIds = oldLength.split("|").map((item) => Number(item));

  for (const id of length) {
    if (!lengthIds.includes(id)) {
      lengthIdsToValidate.push(id);
    }
  }

  const validateLength = await LengthData.findAll({
    where: {
      id: { [Op.in]: lengthIdsToValidate },
      is_active: "1",
      is_deleted: "0",
    },
    transaction: trn,
  });

  if (validateLength.length !== lengthIdsToValidate.length) {
    return resUnprocessableEntity({ message: LENGTH_NOT_FOUND });
  }

  await Product.update(
    {
      length: length.join("|"),
      modified_by: idAppUser,
      modified_date: getLocalDate(),
    },
    { where: { id: idProduct }, transaction: trn }
  );

  return resSuccess();
};

const saveProductMetalOptions = async (
  payload: ISaveProductMetalOptionsPayload
) => {
  const { idProduct, productMetalOptions, idAppUser, trn } = payload;

  let findAlreadyAddedPMO = await ProductMetalOption.findAll({
    where: { id_product: idProduct, is_deleted: "0" },
    transaction: trn,
  });
  let pmo: IProductMetalOptions;
  let oldPMO: Model<any, any> | undefined;
  let findMetalGroup: Model<any, any> | null = null;
  for (pmo of productMetalOptions) {
    if (pmo.id !== 0) {
      oldPMO = findAlreadyAddedPMO.find(
        (item) => item.dataValues.id === pmo.id
      );

      if (!(oldPMO !== undefined && oldPMO && oldPMO.dataValues)) {
        return resUnprocessableEntity({
          message: PRODUCT_METAL_OPTION_NOT_FOUND,
        });
      }

      findAlreadyAddedPMO = findAlreadyAddedPMO.filter(
        (item) => item.dataValues.id !== oldPMO?.dataValues.id
      );
      findMetalGroup = await MetalGroupMaster.findOne({
        where: { id: pmo.id_metal_group },
        transaction: trn,
      });

      if (!(findMetalGroup && findMetalGroup.dataValues)) {
        return resUnprocessableEntity({ message: METAL_GROUP_NOT_FOUND });
      }

      if (
        oldPMO.dataValues.id_metal_group !== pmo.id_metal_group &&
        (findMetalGroup.dataValues.is_active === "0" ||
          findMetalGroup.dataValues.is_deleted == "1")
      ) {
        return resUnprocessableEntity({ message: METAL_GROUP_NOT_FOUND });
      }

      if (
        oldPMO.dataValues.id_metal_group !== pmo.id_metal_group ||
        Number(oldPMO.dataValues.metal_weight) !== pmo.metal_weight
      ) {
        await ProductMetalOption.update(
          {
            id_metal_group: pmo.id_metal_group,
            metal_weight: pmo.metal_weight,
            is_default: pmo.is_default,
            modified_by: idAppUser,
            modified_date: getLocalDate(),
          },
          { where: { id: oldPMO.dataValues.id }, transaction: trn }
        );
      }
    } else {
      findMetalGroup = await MetalGroupMaster.findOne({
        where: { id: pmo.id_metal_group, is_active: "1", is_deleted: "0" },
        transaction: trn,
      });
      if (!(findMetalGroup && findMetalGroup.dataValues)) {
        return resUnprocessableEntity({ message: METAL_GROUP_NOT_FOUND + "a" });
      }

      await ProductMetalOption.create(
        {
          id_product: idProduct,
          id_metal_group: pmo.id_metal_group,
          metal_weight: pmo.metal_weight,
          is_default: pmo.is_default,
          created_by: idAppUser,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
    }
  }

  for (const pmo of findAlreadyAddedPMO) {
    await ProductMetalOption.update(
      {
        is_deleted: "1",
        modified_by: idAppUser,
        modified_date: getLocalDate(),
      },
      { where: { id: pmo.dataValues.id }, transaction: trn }
    );
  }
  return resSuccess();
};

const saveProductDiamondOptions = async (
  payload: ISaveProductDiamondOptionsPayload
) => {
  const { productDiamondOptions, idProduct, idAppUser, trn } = payload;

  let findAlreadyAddedPDO = await ProductDiamondOption.findAll({
    where: { id_product: idProduct, is_deleted: "0" },
    transaction: trn,
  });

  let pdo: IProductDiamondOptions;
  let oldPDO: undefined | Model<any, any>;
  for (pdo of productDiamondOptions) {
    if (pdo.id !== 0) {
      oldPDO = findAlreadyAddedPDO.find(
        (item) => item.dataValues.id === pdo.id
      );

      if (!(oldPDO !== undefined && oldPDO && oldPDO.dataValues)) {
        return resUnprocessableEntity({
          message: PRODUCT_DIAMOND_OPTION_NOT_FOUND,
        });
      }

      findAlreadyAddedPDO = findAlreadyAddedPDO.filter(
        (item) => item.dataValues.id !== oldPDO?.dataValues.id
      );

      if (hasAnyDifferenceInOldAndNewPDO(oldPDO, pdo)) {
        const validAttribute = await validateProductDiamondOption(pdo, oldPDO);
        if (validAttribute.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return validAttribute;
        }

        await ProductDiamondOption.update(
          {
            id_diamond_group: pdo.id_diamond_group,
            id_type: pdo.id_type,
            id_setting: pdo.id_setting,
            weight: pdo.weight,
            count: pdo.count,
            is_default: pdo.is_default,
            modified_by: idAppUser,
            modified_date: getLocalDate(),
          },
          { where: { id: oldPDO.dataValues.id }, transaction: trn }
        );
      }
    } else {
      const validAttribute = await validateProductDiamondOption(pdo);
      if (validAttribute.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return validAttribute;
      }

      await ProductDiamondOption.create(
        {
          id_product: idProduct,
          id_diamond_group: pdo.id_diamond_group,
          id_type: pdo.id_type,
          id_setting: pdo.id_setting,
          weight: pdo.weight,
          count: pdo.count,
          is_default: pdo.is_default,
          created_by: idAppUser,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
    }
  }

  for (const pdo of findAlreadyAddedPDO) {
    await ProductDiamondOption.update(
      {
        is_deleted: "1",
        modified_by: idAppUser,
        modified_date: getLocalDate(),
      },
      { where: { id: pdo.dataValues.id }, transaction: trn }
    );
  }
  return resSuccess();
};

const hasAnyDifferenceInOldAndNewPDO = (
  oldPDO: Model<any, any>,
  pdo: IProductDiamondOptions
) => {
  if (
    oldPDO.dataValues.id_diamond_group !== pdo.id_diamond_group ||
    oldPDO.dataValues.id_type !== pdo.id_type ||
    oldPDO.dataValues.id_setting !== pdo.id_setting ||
    Number(oldPDO.dataValues.weight) !== pdo.weight ||
    oldPDO.dataValues.count !== pdo.count ||
    oldPDO.dataValues.is_default !== pdo.is_default
  ) {
    return true;
  }
  return false;
};

// In validateProductDiamondOption funciton we are handling error which is thown manualy
const validateProductDiamondOption = async (
  pdo: IProductDiamondOptions,
  oldPDO?: Model<any, any>
) => {
  try {
    if (
      !oldPDO ||
      oldPDO.dataValues.id_diamond_group !== pdo.id_diamond_group
    ) {
      await validateDiamondAttribute(DiamondGroupMaster, pdo.id_diamond_group);
    }
    if (!oldPDO || oldPDO.dataValues.id_setting !== pdo.id_setting) {
      await validateDiamondAttribute(SettingCaratWeight, pdo.id_setting);
    }

    return resSuccess();
  } catch (e: any) {
    if (e?.code === UNPROCESSABLE_ENTITY_CODE) {
      return e as TResponseReturn;
    }
    throw e;
  }
};

// Function is throwing an error so be careful while using this function
const validateDiamondAttribute = async (
  attributeModel: any,
  attributeId: number
) => {
  const findAttribut = await attributeModel.findOne({
    where: { id: attributeId, is_deleted: "0", is_active: "1" },
  });

  if (!(findAttribut && findAttribut.dataValues)) {
    throw resUnprocessableEntity({ message: ATTRIBUTE_NOT_FOUND });
  }

  return resSuccess;
};

const findMetalRateFromId = async (idMetal: number, idKt?: number) => {
  // Formula for metal
  // Gold = (1850/31.104)*(kt/24)
  // Silver = 999
  // platinum = 950

  const config = await SystemConfiguration.findOne({
    where: { id_metal: idMetal },
  });

  if (!(config && config.dataValues)) {
    return resNotFound({ message: METAL_RATE_CONFIG_NOT_FOUND });
  }

  switch (Number(config.dataValues.config_value)) {
    case METAL_RATE_FORMULA.Gold:
      if (!idKt) {
        return resUnprocessableEntity({ message: METAL_KT_IS_REQUIRES });
      }

      const goldKt = await GoldKarat.findOne({
        where: { id: idKt, is_deleted: "0" },
      });
      if (!(goldKt && goldKt.dataValues)) {
        return resUnprocessableEntity({ message: METAL_KT_NOT_FOUND });
      }

      const ouncePriceConfig = await fetchConfigurationByKey(
        SYSTEM_CONFIGURATIONS_KEYS.OUNCE_PRICE
      );
      if (ouncePriceConfig.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return ouncePriceConfig;
      }

      const goldGramPerOnceConfig = await fetchConfigurationByKey(
        SYSTEM_CONFIGURATIONS_KEYS.GOLD_GRAM_PER_OUNCE
      );
      if (goldGramPerOnceConfig.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return goldGramPerOnceConfig;
      }

      return resSuccess({
        data: roundDecimalNumber(
          (ouncePriceConfig.data.dataValues.config_value /
            goldGramPerOnceConfig.data.dataValues.config_value) *
          (goldKt.dataValues.name / 24),
          RATE_PRICE_DECIMAL_POINT
        ),
      });

    case METAL_RATE_FORMULA.Silver:
      const silverRateConfig = await fetchConfigurationByKey(
        SYSTEM_CONFIGURATIONS_KEYS.SILVER_PRICE_PER_GRAM
      );
      if (silverRateConfig.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return silverRateConfig;
      }
      return resSuccess({
        data: Number(silverRateConfig.data.dataValues.config_value),
      });

    case METAL_RATE_FORMULA.Platinum:
      const platinumRateConfig = await fetchConfigurationByKey(
        SYSTEM_CONFIGURATIONS_KEYS.PLATINUM_PRICE_PER_GRAM
      );
      if (platinumRateConfig.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return platinumRateConfig;
      }
      return resSuccess({
        data: Number(platinumRateConfig.data.dataValues.config_value),
      });

    default:
      return resNotFound({ message: METAL_FORMULA_NOT_AVAILABLE });
  }
};

export const fetchMetalConfigGroupRate = async () => {
  let metalRateList: IMetalRate[] = [];
  let metalConfigGroupRate: IMetalGroupRate[] = [];

  const resMetalRate = await findMetalRateList();
  if (resMetalRate.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    return resMetalRate;
  }
  metalRateList = resMetalRate.data;

  const metalConfigGroupList = await MetalGroupMaster.findAll({
    where: { is_deleted: "0" },
    include: {
      required: false,
      model: GoldKarat,
      as: "KT",
    },
  });

  let metalRate: IMetalRate | undefined;
  for (const metalConfigGroup of metalConfigGroupList) {
    metalRate = metalRateList.find(
      (item) => item.id_metal === metalConfigGroup.dataValues.id_metal
    );

    if (!metalRate) {
      return resNotFound({ message: METAL_RATE_CONFIG_NOT_FOUND });
    }

    if (metalRate.formula === METAL_RATE_FORMULA.Gold) {
      metalConfigGroupRate.push({
        id_metal_config: metalConfigGroup.dataValues.id,
        rate: roundDecimalNumber(
          metalRate.rate *
          (metalConfigGroup.dataValues.KT.dataValues.name / 24),
          RATE_PRICE_DECIMAL_POINT
        ),
      });
    } else if (metalRate.formula === METAL_RATE_FORMULA.Silver) {
      metalConfigGroupRate.push({
        id_metal_config: metalConfigGroup.dataValues.id,
        rate: metalRate.rate,
      });
    } else if (metalRate.formula === METAL_RATE_FORMULA.Platinum) {
      metalConfigGroupRate.push({
        id_metal_config: metalConfigGroup.dataValues.id,
        rate: metalRate.rate,
      });
    }
  }

  return resSuccess({ data: metalConfigGroupRate });
};

const findMetalRateList = async () => {
  let metalRateList: IMetalRate[] = [];
  const rateConfigs = await SystemConfiguration.findAll({
    where: { config_key: { [Op.in]: RATE_CONFIG_KEY_LIST } },
  });

  for (const config of rateConfigs) {
    if (
      config.dataValues.config_key === SYSTEM_CONFIGURATIONS_KEYS.OUNCE_PRICE
    ) {
      const configGoldPerGram = await SystemConfiguration.findOne({
        where: { config_key: SYSTEM_CONFIGURATIONS_KEYS.GOLD_GRAM_PER_OUNCE },
      });

      if (!(configGoldPerGram && configGoldPerGram.dataValues)) {
        return resNotFound({ message: METAL_RATE_CONFIG_NOT_FOUND });
      }

      metalRateList.push({
        id_metal: config.dataValues.id_metal,
        rate: roundDecimalNumber(
          Number(configGoldPerGram.dataValues.config_value) /
          Number(config.dataValues.config_value),
          RATE_PRICE_DECIMAL_POINT
        ),
        formula: config.dataValues.formula,
      });
    } else if (
      config.dataValues.config_key ===
      SYSTEM_CONFIGURATIONS_KEYS.SILVER_PRICE_PER_GRAM
    ) {
      metalRateList.push({
        id_metal: config.dataValues.id_metal,
        rate: Number(config.dataValues.config_value),
        formula: config.dataValues.formula,
      });
    } else if (
      config.dataValues.config_key ===
      SYSTEM_CONFIGURATIONS_KEYS.PLATINUM_PRICE_PER_GRAM
    ) {
      metalRateList.push({
        id_metal: config.dataValues.id_metal,
        rate: Number(config.dataValues.config_value),
        formula: config.dataValues.formula,
      });
    }
  }

  return resSuccess({ data: metalRateList });
};

const validateProductFileReqData = async (
  idProduct: number,
  idMetalTone: NumberConstructor,
  idType: number,
  isImage: boolean
) => {
  const productToBeUpdate = await Product.findOne({
    where: { id: idProduct, is_deleted: "0" },
  });

  if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
    return resNotFound({ message: PRODUCT_NOT_FOUND });
  }

  const toneToBeAdd = await MetalTone.findOne({
    where: { id: idMetalTone, is_deleted: "0" },
  });

  if (!(toneToBeAdd && toneToBeAdd.dataValues)) {
    return resNotFound({ message: METAL_TONE_NOT_FOUND });
  }

  let findFileDetails;
  if (isImage) {
    findFileDetails = await ProductImage.findOne({
      where: {
        id_product: idProduct,
        id_metal_tone: idMetalTone,
        image_type: idType,
        is_deleted: "0",
      },
    });
  } else {
    findFileDetails = await ProductVideo.findOne({
      where: {
        id_product: idProduct,
        id_metal_tone: idMetalTone,
        video_type: idType,
        is_deleted: "0",
      },
    });
  }

  if (
    !(findFileDetails && findFileDetails.dataValues) &&
    toneToBeAdd.dataValues.is_active !== "1"
  ) {
    return resNotFound({ message: METAL_TONE_NOT_FOUND });
  }

  return resSuccess({ data: productToBeUpdate.dataValues.sku });
};

export const addProductImages = async (req: Request) => {
  try {
    const { id_product, id_metal_tone, image_type } = req.body;
    let sku;

    // const resVPFRD = await validateProductFileReqData(
    //   id_product,
    //   id_metal_tone,
    //   image_type,
    //   true
    // );
    // if (resVPFRD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    //   return resVPFRD;
    // }

    const productToBeUpdate = await Product.findOne({
      where: { id: id_product, is_deleted: "0" },
    });

    if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    sku = productToBeUpdate.dataValues.sku;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files.images) {
      return resNotFound({ message: IMAGES_NOT_FOUND });
    }

    console.log(files);

    const trn = await dbContext.transaction();
    try {
      let imageFile;
      for (imageFile of files.images) {
        const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
          imageFile,
          `${PRODUCT_FILE_LOCATION}/${sku}`,
          null
        );
        if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return resMFTL;
        }

        await ProductImage.create(
          {
            id_product: id_product,
            id_metal_tone: id_metal_tone ? id_metal_tone : null,
            image_path: resMFTL.data,
            image_type: image_type,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
      }

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const addProductVideos = async (req: Request) => {
  try {
    const { id_product, id_metal_tone, video_type } = req.body;
    let sku;

    const resVPFRD = await validateProductFileReqData(
      id_product,
      id_metal_tone,
      video_type,
      false
    );
    if (resVPFRD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVPFRD;
    }
    sku = resVPFRD.data;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files.videos) {
      return resNotFound({ message: VIDEOS_NOT_FOUND });
    }

    const trn = await dbContext.transaction();
    try {
      let videoFile;
      for (videoFile of files.videos) {
        const resMFTL = await moveFileToLocation(
          videoFile.filename,
          videoFile.destination,
          `public/${PRODUCT_FILE_LOCATION}/${sku}`,
          videoFile.originalname
        );
        if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return resMFTL;
        }

        await ProductVideo.create(
          {
            id_product: id_product,
            id_metal_tone: id_metal_tone,
            video_path: `${PRODUCT_FILE_LOCATION}/${sku}/${videoFile.originalname}`,
            video_type: video_type,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
      }

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const deleteProductImages = async (req: Request) => {
  try {
    const { id, id_metal_tone, id_product, image_type } = req.body;
    const idAppUser = req.body.session_res.id_app_user;

    if (id) {
      const findImage = await ProductImage.findOne({
        where: { id, id_product, is_deleted: "0" },
      });
      if (!(findImage && findImage.dataValues)) {
        return resNotFound({ message: IMAGE_NOT_FOUND });
      }
      await ProductImage.update(
        {
          is_deleted: "1",
          modified_by: idAppUser,
          modified_date: getLocalDate(),
        },
        { where: { id, id_product, is_deleted: "0" } }
      );
    } else if (id_metal_tone) {
      if (image_type) {
        await ProductImage.update(
          {
            is_deleted: "1",
            modified_by: idAppUser,
            modified_date: getLocalDate(),
          },
          { where: { id_product, id_metal_tone, is_deleted: "0", image_type } }
        );
      } else {
        await ProductImage.update(
          {
            is_deleted: "1",
            modified_by: idAppUser,
            modified_date: getLocalDate(),
          },
          { where: { id_product, id_metal_tone, is_deleted: "0" } }
        );
      }
    }

    return resSuccess();
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const deleteProductVideos = async (req: Request) => {
  try {
    const { id, id_metal_tone, id_product, video_type } = req.body;
    const idAppUser = req.body.session_res.id_app_user;

    if (id) {
      const findVideo = await ProductVideo.findOne({
        where: { id, id_product, is_deleted: "0" },
      });
      if (!(findVideo && findVideo.dataValues)) {
        return resNotFound({ message: VIDEO_NOT_FOUND });
      }
      await ProductVideo.update(
        {
          is_deleted: "1",
          modified_by: idAppUser,
          modified_date: getLocalDate(),
        },
        { where: { id, id_product, is_deleted: "0" } }
      );
    } else if (id_metal_tone) {
      if (video_type) {
        await ProductVideo.update(
          {
            is_deleted: "1",
            modified_by: idAppUser,
            modified_date: getLocalDate(),
          },
          { where: { id_product, id_metal_tone, is_deleted: "0", video_type } }
        );
      } else {
        await ProductVideo.update(
          {
            is_deleted: "1",
            modified_by: idAppUser,
            modified_date: getLocalDate(),
          },
          { where: { id_product, id_metal_tone, is_deleted: "0" } }
        );
      }
    }

    return resSuccess();
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const productMetalToneList = async (req: Request) => {
  try {
    const products = await Product.findOne({
      where: { id: req.body.product_id, is_deleted: "0" },
      attributes: ["id", "name", "sku", "product_type"],
      include: [
        {
          required: false,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [
            "id",
            "id_metal_group",
            "metal_weight",
            "id_m_tone",
            [
              Sequelize.literal(
                `CASE WHEN "PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("PMO"."id_metal_tone", '|')::int[] END`
              ),
              "metalTone",
            ],
          ],
          where: { is_deleted: "0" },
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
          where: { is_deleted: "0" },
        },
      ],
    });

    if (!(products && products.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    let metalTones = [];
    if (products.dataValues.product_type == SingleProductType.DynemicPrice) {
      let metalGroup = products.dataValues.PMO.flat().map(
        (value: any) => value.dataValues.metalTone
      );
      metalTones = metalGroup.flat().map((value: any) => value);
    } else {
      metalTones = products.dataValues.PMO.map(
        (value: any) => value.dataValues.id_m_tone
      );
    }

    const findMetalTone = await MetalTone.findAll({
      where: { id: metalTones },
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    return resSuccess({ data: findMetalTone });
  } catch (error) {
    throw error;
  }
};
const productTypeMetalArrayCreate = async (productList: any) => {
  for (let index = 0; index < productList.length; index++) {
    const element: any = productList[index];
    if (element.product_type === 2) {
      if (element?.pmo && element?.pmo.length > 0) {
        element.pmo.sort((a: any, b: any) => {
          if (a.gold_karat === null && b.gold_karat === null) return 0;
          if (a.gold_karat === null) return 1;
          if (b.gold_karat === null) return -1;

          // First, compare gold_karat
          if (a.gold_karat !== b.gold_karat) {
            return a.gold_karat - b.gold_karat;
          }

          // If gold_karat is the same, compare id_m_tone
          if (a.id_m_tone === null && b.id_m_tone === null) return 0;
          if (a.id_m_tone === null) return 1;
          if (b.id_m_tone === null) return -1;
          return a.id_m_tone - b.id_m_tone;
        });
        for (let metalData of element.pmo) {
          if (metalData.id_metal === 1) {
            const filter = element?.pmo.filter(
              (t: any) => t.id_karat === metalData.id_karat
            );
            const uniqueArray = [
              ...new Set(filter.map((t: any) => t.id_m_tone)),
            ];
            metalData.metal_tone = uniqueArray;
          }
        }
      }
    }
  }
};

const processProductList = async (productList) => {
  let productListData = productList;
  productListData.forEach((product) => {
    if (product.product_type === 2) {
      const productPmo = [];

      product.pmo.forEach((item: any) => {
        const findSameItem = product.pmo.filter(
          (t) => t.id_karat == item.id_karat && t.id_metal == item.id_metal
        );

        productPmo.push({
          ...item,
          metal_tone: findSameItem?.map((t) => t.id_m_tone),
        });
      });
      // console.log(productPmo);
      return (product.pmo = productPmo);
    }
  });

  return productListData;
};
export const productListUserSide = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    pagination.per_page_rows =
      Number(req.query.per_page_rows) || PRODUCT_PER_PAGE_ROW;
    let category = "0";
    let filterCategory = "0";
    if (!req.query.setting_type && req.query.setting_type == undefined) {
      req.query.setting_type = "0";
    }

    if (!req.query.gender && req.query.gender == undefined) {
      req.query.gender = "0";
    }

    if (!req.query.collection && req.query.collection == undefined) {
      req.query.collection = "0";
    }

    if (!req.query.metal_id && req.query.metal_id == undefined) {
      req.query.metal_id = "0";
    }

    if (!req.query.metal_tone && req.query.metal_tone == undefined) {
      req.query.metal_tone = "0";
    }

    if (!req.query.diamond_shape && req.query.diamond_shape == undefined) {
      req.query.diamond_shape = "0";
    }
    if (!req.query.brand && req.query.brand == undefined) {
      req.query.brand = "0";
    }
    if (
      !req.query.product_category &&
      req.query.product_category == undefined
    ) {
      req.query.product_category = "0";
    }

    if (!req.query.search_text && req.query.search_text == undefined) {
      req.query.search_text = "0";
    }
    if (
      req.query.product_category &&
      req.query.product_category != undefined &&
      req.query.product_category != "0"
    ) {
      let categoryName: any = req.query.product_category;
      filterCategory = categoryName
        .toString()
        .toLowerCase()
        .split(",")
        .map((item: any) => `'${item}'`)
        .join(",");
    }

    if (
      !req.query.min_price &&
      !req.query.max_price &&
      req.query.min_price == undefined &&
      req.query.max_price == undefined
    ) {
      req.query.min_price = "0";
      req.query.max_price = "0";
    }

    req.query.is_choose_setting =
      req.query.is_choose_setting === "1" ? "1" : "0";

    if (req.query.collection != "0") {
      const findCollection = await Collection.findOne({
        where: {
          slug: { [Op.iLike]: `%${req.query.collection}%` },
          is_deleted: DeletedStatus.No,
        },
      });
      if (findCollection && findCollection.dataValues) {
        req.query.collection = findCollection.dataValues.id;
      }
    }
    if (req.query.brand != "0") {
      const findBrand = await BrandData.findOne({
        where: {
          slug: { [Op.iLike]: `%${req.query.brand}%` },
          is_deleted: DeletedStatus.No,
        },
      });
      if (findBrand && findBrand.dataValues) {
        req.query.brand = findBrand.dataValues.id;
      }
    }
    if (req.query.product_category == "0" && req.query.search_text == "0") {
      category = "watch";
    }

    const productTotalCount = await dbContext.query(
      `SELECT COUNT(*)
                     FROM products 
         LEFT JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '${DeletedStatus.No
      }'
         LEFT JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group
			LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id  AND PMO.is_deleted = '${DeletedStatus.No
      }'
	LEFT JOIN product_categories  ON product_categories.id_product = products.id  AND product_categories.is_deleted = '${DeletedStatus.No
      }'
	LEFT OUTER JOIN categories ON categories.id = product_categories.id_category OR categories.id = product_categories.id_sub_category OR categories.id = product_categories.id_sub_sub_category AND categories.is_deleted = '${DeletedStatus.No
      }'
		LEFT OUTER  JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal AND metal_master.is_deleted = '${DeletedStatus.No
      }' AND metal_master.is_active = '${ActiveStatus.Active}'
       LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat	
       CROSS JOIN LATERAL (
        SELECT
            SUM(DGM.RATE * PDO.WEIGHT * PDO.COUNT) AS sum_price
        FROM
            PRODUCT_DIAMOND_OPTIONS PDO
        LEFT JOIN
            DIAMOND_GROUP_MASTERS DGM ON DGM.ID = PDO.ID_DIAMOND_GROUP
        WHERE
            PDO.ID_PRODUCT = PRODUCTS.ID
            AND PDO.IS_DELETED = '0'
            AND (PDO.id_type=2 OR '${req.query.is_choose_setting}' != '1')
    ) AS sum_price
	WHERE products.is_deleted = '${DeletedStatus.No}'
         AND products.is_active = '${ActiveStatus.Active}' 
         AND CASE WHEN '${req.query.setting_type
      }' = '0' THEN true ELSE string_to_array(setting_style_type, '|')::int[] && ARRAY[${req.query.setting_type
      }] END
         AND CASE WHEN '${req.query.gender
      }' = '0' THEN true ELSE string_to_array(gender, '|')::int[] && ARRAY[${req.query.gender
      }] END
         AND CASE WHEN '${req.query.collection
      }' = '0' THEN true ELSE string_to_array(id_collection, '|')::int[] && ARRAY[${req.query.collection
      }] END
         AND CASE WHEN '${req.query.brand}' = '0' THEN true ELSE id_brand IN (${req.query.brand
      }) END
		  	AND CASE WHEN '${req.query.metal_id
      }' = '0' THEN true ELSE  PMO.id_metal IN (${req.query.metal_id}) END
			AND  CASE WHEN '${req.query.metal_tone
      }' = '0' THEN true ELSE string_to_array(PMO.id_metal_tone, '|')::int[] && ARRAY[${req.query.metal_tone
      }]  END
			AND CASE WHEN '${req.query.diamond_shape}' = '0' 
        THEN true 
        ELSE 
          DGM.id_shape IN (${req.query.diamond_shape}) OR
        CASE WHEN '${req.query.is_choose_setting
      }'='1' AND products.product_type=2
          THEN  string_to_array(products.setting_diamond_shapes, '|')::int[] && ARRAY[${req.query.diamond_shape
      }]
          ELSE false
        END
        END
			AND CASE WHEN '${req.query.product_category
      }' = '0' THEN true ELSE LOWER(categories.slug) IN (${filterCategory == "0"
        ? `'${filterCategory.toString()}'`
        : filterCategory
      }) END
      AND CASE
		WHEN '${req.query.search_text}' = '0' THEN TRUE
		ELSE PRODUCTS.NAME ILIKE '%${req.query.search_text
      }%' OR PRODUCTS.SLUG ILIKE '%${req.query.search_text
      }%' OR PRODUCTS.SKU ILIKE '%${req.query.search_text
      }%' OR categories.slug ILIKE '%${req.body.search_text
      }%' OR categories.category_name ILIKE '%${req.body.search_text}%'
	END

 GROUP BY products.id
 HAVING  
  CASE WHEN '${category}' = '0' THEN true  ELSE COUNT(CASE WHEN categories.slug ILIKE '%watch%' THEN 1 END) = 0 END
 AND CASE
		WHEN '${req.query.min_price}' = '0' THEN TRUE 
		ELSE SUM(CASE
					WHEN PRODUCTS.PRODUCT_TYPE = 2 
            THEN CASE 
                WHEN CASE WHEN ${req.query.is_choose_setting}='1' 
                    THEN PMO.retail_price - COALESCE(PMO.center_diamond_price,0)
                    ELSE PMO.RETAIL_PRICE
                  END 
                  BETWEEN ${req.query.min_price ? req.query.min_price : 0
      } AND ${req.query.max_price} 
                THEN 1 
                ELSE 0 
              END
					ELSE CASE
						WHEN PMO.ID_KARAT IS NULL THEN 
						CASE WHEN	(METAL_MASTER.METAL_RATE * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
                      COALESCE(sum_price.sum_price, 0) 
                )) BETWEEN ${req.query.min_price ? req.query.min_price : 0
      } AND ${req.query.max_price} THEN 1 ELSE 0 END
						ELSE CASE WHEN (METAL_MASTER.METAL_RATE / 31.104 * GOLD_KTS.NAME / 24 * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
									COALESCE(sum_price.sum_price, 0)  
								)) BETWEEN ${req.query.min_price ? req.query.min_price : 0} AND ${req.query.max_price
      } THEN 1 ELSE 0 END
					END
				END) > 0
	END
 ORDER BY products.id DESC`,
      { type: QueryTypes.SELECT }
    );

    const productList = await dbContext.query(
      `SELECT PROD.* FROM (SELECT
    	PRODUCTS.ID,
    	PRODUCTS.NAME,
    	PRODUCTS.SKU,
    	PRODUCTS.SLUG,
    	PRODUCTS.SORT_DESCRIPTION,
    	PRODUCTS.DISCOUNT_TYPE,
    	PRODUCTS.DISCOUNT_VALUE,
    	PRODUCTS.SETTING_STYLE_TYPE,
    	PRODUCTS.PRODUCT_TYPE,
    	PRODUCTS.GENDER,
      PRODUCTS.ADDITIONAL_DETAIL,
    	PRODUCTS.MAKING_CHARGE,
    	PRODUCTS.FINDING_CHARGE,
    	PRODUCTS.OTHER_CHARGE,
    	PRODUCTS.created_date,
      CASE WHEN PRODUCTS.SIZE IS NULL THEN '{}'::int[] ELSE string_to_array(PRODUCTS.SIZE, '|')::int[] END AS product_size,
      CASE WHEN PRODUCTS.LENGTH IS NULL THEN '{}'::int[] ELSE string_to_array(PRODUCTS.LENGTH, '|')::int[] END AS product_length,
    	JSONB_AGG(
    	DISTINCT JSONB_BUILD_OBJECT(
    			'id',
    			PRODUCT_IMAGES.ID,
    			'image_path',
    			CONCAT(
    				'${IMAGE_PATH}/',
    				PRODUCT_IMAGES.IMAGE_PATH
    			),
    			'id_metal_tone',
    			PRODUCT_IMAGES.ID_METAL_TONE,
    			'image_type',
    			PRODUCT_IMAGES.IMAGE_TYPE
    		)
    	) AS PRODUCT_IMAGES,

    			JSONB_AGG(
    			DISTINCT JSONB_BUILD_OBJECT(
    					'id',
    					PMO.ID,
    					'id_metal',
    					PMO.ID_METAL,
    					'id_karat',
    					PMO.ID_KARAT,
    					'id_size',
    					PMO.ID_SIZE,
    					'id_length',
    					PMO.ID_LENGTH,
    					'side_dia_weight',
    					PMO.SIDE_DIA_WEIGHT,
    					'side_dia_count',
    					PMO.SIDE_DIA_COUNT,
    					'id_m_tone',
    					PMO.ID_M_TONE,
              'quantity',
    					PMO.remaing_quantity_count,
    					'wishlist_id',
    					(
    						SELECT
    							ID
    						FROM
    							WISHLIST_PRODUCTS
    						WHERE
    							PRODUCT_ID = PMO.ID_PRODUCT
    							AND PRODUCT_TYPE = ${AllProductTypes.Product}
    							AND VARIANT_ID = PMO.ID
    							AND USER_ID = ${req.query.user_id &&
        req.query.user_id != "" &&
        req.query.user_id != undefined &&
        req.query.user_id != null &&
        req.query.user_id != "null"
        ? req.query.user_id
        : 0
      }
    						LIMIT
    							1
    					),
    					'metal_tone',
    					CASE
    						WHEN PMO.ID_METAL_TONE IS NULL THEN '{}'::INT[]
    						ELSE STRING_TO_ARRAY(PMO.ID_METAL_TONE, '|')::INT[]
    					END,
    					'gold_karat',
    					GOLD_KTS.NAME,
    					'Price',
    					CASE
    						WHEN PRODUCTS.PRODUCT_TYPE = 2
                  THEN CASE WHEN '${req.query.is_choose_setting}'='1'
                        THEN PMO.retail_price - COALESCE(PMO.center_diamond_price,0)
                        ELSE PMO.RETAIL_PRICE
                      END
    						ELSE CASE
    							WHEN ID_KARAT IS NULL THEN (
    								METAL_MASTER.METAL_RATE * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
                          COALESCE(sum_price.sum_price, 0)
    								)
    							)
    							ELSE (
    								METAL_MASTER.METAL_RATE / 31.104 * GOLD_KTS.NAME / 24 * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
                        COALESCE(sum_price.sum_price, 0)
    								)
    							)
    						END
    					END
    				)
    			)
     AS PMO
    FROM
    	PRODUCTS
    	LEFT JOIN PRODUCT_IMAGES ON PRODUCT_IMAGES.ID_PRODUCT = PRODUCTS.ID
    	AND PRODUCT_IMAGES.IS_DELETED = '${DeletedStatus.No}'
    	AND PRODUCT_IMAGES.IMAGE_TYPE IN (${PRODUCT_IMAGE_TYPE.Feature})
    	LEFT JOIN product_categories  ON product_categories.id_product = products.id  AND product_categories.is_deleted = '${DeletedStatus.No
      }'
    	LEFT OUTER JOIN categories ON categories.id = product_categories.id_category OR categories.id = product_categories.id_sub_category OR categories.id = product_categories.id_sub_sub_category AND categories.is_deleted = '${DeletedStatus.No
      }'
    	LEFT OUTER JOIN PRODUCT_METAL_OPTIONS AS PMO ON PMO.ID_PRODUCT = PRODUCTS.ID AND PMO.IS_DELETED = '${DeletedStatus.No
      }'
    	LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal AND metal_master.is_deleted = '${DeletedStatus.No
      }' AND metal_master.is_active = '${ActiveStatus.Active}'
        LEFT JOIN gold_kts ON gold_kts.id = PMO.id_karat AND gold_kts.is_deleted = '${DeletedStatus.No
      }' AND gold_kts.is_active = '${ActiveStatus.Active}'
    	LEFT JOIN PRODUCT_DIAMOND_OPTIONS AS PDO ON PDO.ID_PRODUCT = PRODUCTS.ID AND PDO.IS_DELETED = '${DeletedStatus.No
      }'
    	AND PDO.IS_DELETED = '${DeletedStatus.No}'
    	LEFT JOIN DIAMOND_GROUP_MASTERS AS DGM ON DGM.ID = PDO.ID_DIAMOND_GROUP
    	CROSS JOIN LATERAL (
            SELECT
                SUM(DGM.RATE * PDO.WEIGHT * PDO.COUNT) AS sum_price
            FROM
                PRODUCT_DIAMOND_OPTIONS PDO
            LEFT JOIN
                DIAMOND_GROUP_MASTERS DGM ON DGM.ID = PDO.ID_DIAMOND_GROUP
            WHERE
                PDO.ID_PRODUCT = PRODUCTS.ID
                AND PDO.IS_DELETED = '${DeletedStatus.No}'
                AND (PDO.id_type=2 OR '${req.query.is_choose_setting}' != '1')
        ) AS sum_price
    WHERE
    	PRODUCTS.IS_DELETED = '${DeletedStatus.No}'
    	AND PRODUCTS.IS_ACTIVE = '${ActiveStatus.Active}'
    	AND CASE
    		WHEN '${req.query.setting_type}' = '0' THEN TRUE
    		ELSE string_to_array(setting_style_type, '|')::int[] && ARRAY[${req.query.setting_type
      }]
    	END
    	AND CASE WHEN '${req.query.gender
      }' = '0' THEN true ELSE string_to_array(gender, '|')::int[] && ARRAY[${req.query.gender
      }] END
    	AND CASE
    		WHEN '${req.query.collection}' = '0' THEN TRUE
    		ELSE string_to_array(id_collection, '|')::int[] && ARRAY[${req.query.collection
      }] END
               AND CASE WHEN '${req.query.brand
      }' = '0' THEN true ELSE id_brand IN (${req.query.brand}) END
    	AND CASE
    		WHEN '${req.query.search_text}' = '0' THEN TRUE
    		ELSE PRODUCTS.NAME ILIKE '%${req.query.search_text
      }%' OR PRODUCTS.SLUG ILIKE '%${req.query.search_text
      }%' OR PRODUCTS.SKU ILIKE '%${req.query.search_text
      }%' OR categories.slug ILIKE '%${req.body.search_text
      }%' OR categories.category_name ILIKE '%${req.body.search_text}%'
    	END

    GROUP BY
    	PRODUCTS.ID
    HAVING CASE WHEN '${req.query.metal_id
      }' = '0' THEN true ELSE SUM(CASE WHEN PMO.ID_METAL IN (${req.query.metal_id
      }) THEN 1 ELSE 0 END) > 0 END
    	AND CASE WHEN '${req.query.metal_tone
      }' = '0' THEN true ELSE SUM(CASE WHEN string_to_array(PMO.id_metal_tone, '|')::int[] && ARRAY[${req.query.metal_tone
      }] THEN 1 ELSE 0 END) > 0 END
    	AND CASE WHEN '${req.query.diamond_shape
      }' = '0' THEN true ELSE SUM(CASE WHEN DGM.ID_SHAPE IN (${req.query.diamond_shape
      }) OR
        CASE WHEN '${req.query.is_choose_setting
      }'='1' AND products.product_type=2
          THEN string_to_array(products.setting_diamond_shapes, '|')::int[] && ARRAY[${req.query.diamond_shape
      }]
          ELSE false
        END THEN 1 ELSE 0 END) > 0 END
    	AND CASE WHEN '${req.query.product_category
      }' = '0' THEN true ELSE SUM(CASE WHEN LOWER(categories.slug)  IN (${filterCategory == "0"
        ? `'${filterCategory.toLocaleLowerCase()}'`
        : filterCategory
      }) THEN 1 ELSE 0 END) > 0 END
      AND CASE WHEN '${category}' = '0' THEN true  ELSE COUNT(CASE WHEN categories.slug ILIKE '%watch%' THEN 1 END) = 0 END
    	AND CASE
    		WHEN '${req.query.min_price}' = '0' THEN TRUE
    		ELSE SUM(CASE
    					WHEN PRODUCTS.PRODUCT_TYPE = 2 THEN CASE
                 WHEN CASE WHEN '${req.query.is_choose_setting}'='1'
                        THEN PMO.retail_price - COALESCE(PMO.center_diamond_price,0)
                        ELSE PMO.RETAIL_PRICE
                      END
                      BETWEEN ${req.query.min_price ? req.query.min_price : 0
      } AND ${req.query.max_price}
                    THEN 1
                    ELSE 0
                  END
    					ELSE CASE
    						WHEN PMO.ID_KARAT IS NULL THEN
    						CASE WHEN	(METAL_MASTER.METAL_RATE * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
                        COALESCE(sum_price.sum_price, 0)
                    )) BETWEEN ${req.query.min_price ? req.query.min_price : 0
      } AND ${req.query.max_price} THEN 1 ELSE 0 END
    						ELSE CASE WHEN (METAL_MASTER.METAL_RATE / 31.104 * GOLD_KTS.NAME / 24 * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
    									COALESCE(sum_price.sum_price, 0)
    								)) BETWEEN ${req.query.min_price ? req.query.min_price : 0} AND ${req.query.max_price
      } THEN 1 ELSE 0 END
    					END
    				END) > 0
    	END) AS PROD
      
    ${pagination.sort_by === SORTING_OPTION.BestSeller
        ? `LEFT JOIN order_details as OD 
            ON OD.product_id=PROD.id and OD.payment_status=${PaymentStatus.paid} and ((OD.order_details_json->>'product_type')::int=${AllProductTypes.Product} OR (od.order_details_json->>'product_type')::int=${AllProductTypes.SettingProduct})
          group by  PROD.id, PROD.name, PROD.sku, PROD.slug, PROD.sort_description, PROD.discount_type, PROD.discount_value, PROD.setting_style_type, PROD.product_type, PROD.gender, PROD.making_charge, PROD.finding_charge, PROD.other_charge, PROD.product_size, PROD.product_length, PROD.product_images, PROD.pmo, PROD.created_date
          ORDER BY count(OD.*) DESC, PROD.id DESC`
        : pagination.sort_by === SORTING_OPTION.Newest
          ? "ORDER BY PROD.created_date DESC"
          : pagination.sort_by === SORTING_OPTION.Oldest
            ? "ORDER BY PROD.created_date ASC"
            : pagination.sort_by === SORTING_OPTION.PriceLowToHigh
              ? "ORDER BY (SELECT MIN((item->>'Price')::numeric) FROM  jsonb_array_elements(PROD.pmo) AS item) ASC"
              : pagination.sort_by === SORTING_OPTION.PriceHighToLow
                ? "ORDER BY (SELECT MIN((item->>'Price')::numeric) FROM jsonb_array_elements(PROD.pmo) AS item) DESC"
                : "ORDER BY PROD.id DESC"
      }
    OFFSET
    ${(pagination.current_page - 1) * pagination.per_page_rows} ROWS
    FETCH NEXT
    	${pagination.per_page_rows} ROWS ONLY`,
      { type: QueryTypes.SELECT }
    );

    pagination.total_items = productTotalCount.length;
    pagination.total_pages = Math.ceil(
      productTotalCount.length / pagination.per_page_rows
    );
    const result = await processProductList(productList);
    return resSuccess({ data: { pagination, productList } });
  } catch (error) {
    throw error;
  }
};

export const productGetByIdUserSide = async (req: Request) => {
  const { slug, user_id } = req.body;
  const isChooseSetting = req.body.is_choose_setting === "1" ? "1" : "0";
  try {
    let where = [
      { slug: slug },
      { is_active: ActiveStatus.Active },
      { is_deleted: DeletedStatus.No },
    ];

    const products = await Product.findOne({
      where,
      order: [[{ model: ProductImage, as: "product_images" }, "id", "ASC"]],
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
        "gender",
        "product_type",
        "discount_type",
        "discount_value",
        "product_type",
        "additional_detail",
        [
          Sequelize.literal(
            `(SELECT CASE WHEN COUNT(orders.*) >= 1 THEN true ELSE false END  FROM order_details LEFT OUTER JOIN orders ON order_id = orders.id WHERE product_id = products.id AND user_id = ${user_id && user_id != "" ? user_id : 0
            })`
          ),
          "is_order_product",
        ],
        [
          Sequelize.literal(
            `(SELECT CASE WHEN COUNT(*) >= 1 THEN true ELSE false END  FROM product_reviews WHERE product_id = products.id AND reviewer_id = ${user_id && user_id != "" ? user_id : 0
            })`
          ),
          "is_added_review",
        ],
        [
          Sequelize.literal(
            `(SELECT COALESCE(AVG(product_reviews.rating), 0) FROM product_reviews WHERE product_reviews.product_id = products.id AND is_approved = '${ActiveStatus.Active}')`
          ),
          "rating",
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(DISTINCT reviewer_id)
            FROM product_reviews
            WHERE product_reviews.product_id = products.id
            AND is_approved = '${ActiveStatus.Active}'
          )`),
          "rating_user_count",
        ],

        [
          Sequelize.literal(
            `(SELECT SUM (product_diamond_options.weight*product_diamond_options.count)  FROM products LEFT OUTER JOIN product_diamond_options ON product_diamond_options.id_product = products.id WHERE products.slug = '${slug}' GROUP BY products.id LIMIT 1)`
          ),
          "total_diamond_weight",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."tag" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."tag", '|')::int[] END`
          ),
          "tag",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."size" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."size", '|')::int[] END`
          ),
          "size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."length" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."length", '|')::int[] END`
          ),
          "length",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."setting_diamond_shapes" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."setting_diamond_shapes", '|')::int[] END`
          ),
          "setting_diamond_shapes",
        ],
      ],
      include: [
        {
          required: false,
          model: ProductCategory,
          as: "product_categories",
          attributes: [
            "id",
            "id_category",
            "id_sub_category",
            "id_sub_sub_category",
            [
              Sequelize.literal(
                `"product_categories->category"."category_name"`
              ),
              "category_name",
            ],
            [
              Sequelize.literal(
                `"product_categories->sub_category"."category_name"`
              ),
              "sub_category_name",
            ],
            [
              Sequelize.literal(
                `"product_categories->sub_sub_category"."category_name"`
              ),
              "sub_sub_category_name",
            ],
          ],
          include: [
            {
              required: false,
              model: categoryData,
              as: "category",
              attributes: [],
            },
            {
              required: false,
              model: categoryData,
              as: "sub_category",
              attributes: [],
            },
            {
              required: false,
              model: categoryData,
              as: "sub_sub_category",
              attributes: [],
            },
          ],
        },
        {
          required: false,
          model: ProductImage,
          as: "product_images",
          attributes: [
            "id",
            "image_path",
            "id_metal_tone",
            "image_type",
            [
              Sequelize.literal(
                '(SELECT metal_tones.sort_code FROM metal_tones WHERE metal_tones.id = "product_images"."id_metal_tone")'
              ),
              "metal_tone_sort_code",
            ],
          ],
          where: [{ is_deleted: "0" }],
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
            [Sequelize.literal('"PMO"."remaing_quantity_count"'), "quantity"],
            [
              Sequelize.literal(
                `(SELECT id FROM wishlist_products WHERE product_id = "PMO"."id_product" AND product_type = ${AllProductTypes.Product
                } AND variant_id = "PMO"."id" AND user_id = ${user_id &&
                  user_id != undefined &&
                  user_id != null &&
                  user_id != "null"
                  ? user_id
                  : 0
                } LIMIT 1)`
              ),
              "wishlist_id",
            ],
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
                `CASE WHEN "products"."product_type" = 3 THEN "PMO"."retail_price" ELSE 0 END `
              ),
              "design_price",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "products"."product_type" = 2 
                  THEN 
                    CASE WHEN '${isChooseSetting}'='1'
                      THEN "PMO"."retail_price" - COALESCE("PMO"."center_diamond_price",0)
                      ELSE "PMO"."retail_price"
                    END
                  ELSE (
                    SELECT 
                      CASE WHEN "PMO"."id_karat" IS NULL 
                        THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                              (COALESCE(sum(
                                CASE WHEN PDO.id_type=1 AND '${isChooseSetting}'='1'
                                  THEN 0
                                  ELSE DGM.rate*PDO.weight*PDO.count
                                END
                              ),0))
                            ) 
                        ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+
                                (COALESCE(sum(
                                  CASE WHEN PDO.id_type=1 AND '${isChooseSetting}'='1'
                                    THEN 0
                                    ELSE DGM.rate*PDO.weight*PDO.count
                                  END
                                ), 0))
                              ) 
                      END 
                    FROM products 
                    LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id 
                    LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' 
                    LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal 
                    LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group 
                    LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat 
                    WHERE 
                      CASE WHEN PMO.id_karat IS NULL 
                        THEN products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" 
                        ELSE products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" AND PMO.id_karat = "PMO"."id_karat" 
                      END 
                    GROUP BY metal_master.metal_rate, PMO.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name) END`
              ),
              "Price",
            ],
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
            [
              Sequelize.literal(
                '(SELECT name FROM diamond_shapes WHERE id = "PDO"."id_shape")'
              ),
              "diamond_shape",
            ],
            [
              Sequelize.literal(
                '(SELECT name FROM gemstones WHERE id = "PDO"."id_stone")'
              ),
              "stone",
            ],
            [
              Sequelize.literal(
                '(SELECT value FROM mm_sizes WHERE id = "PDO"."id_mm_size")'
              ),
              "mm_size",
            ],
            [
              Sequelize.literal(
                '(SELECT value FROM colors WHERE id = "PDO"."id_color")'
              ),
              "diamond_color",
            ],
            [
              Sequelize.literal(
                '(SELECT value FROM clarities WHERE id = "PDO"."id_clarity")'
              ),
              "diamond_clarity",
            ],
            [
              Sequelize.literal(
                '(SELECT value FROM cuts WHERE id = "PDO"."id_cut")'
              ),
              "diamond_cut",
            ],
          ],
          where: { is_deleted: "0" },
          include: [
            {
              required: false,
              model: DiamondGroupMaster,
              as: "rate",
              attributes: [],

              where: { is_deleted: "0", is_active: "1" },
            },
          ],
        },
      ],
    });

    if (!(products && products.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    if (products.dataValues.product_type != 2) {
      if (products.dataValues.PMO.length >= 1) {
        for (let value of products.dataValues.PMO) {
          if (
            value.dataValues.metal_tone &&
            value.dataValues.metal_tone.length > 0
          ) {
            let whishlistIdList = [];
            for (let data of value.dataValues.metal_tone) {
              const wishListProduct: any = await dbContext.query(
                `SELECT id FROM wishlist_products WHERE product_id = ${products.dataValues.id
                } AND product_type = ${AllProductTypes.Product
                } AND variant_id = ${value.dataValues.id
                }  AND id_metal_tone = ${data} AND user_id = ${user_id &&
                  user_id != undefined &&
                  user_id != null &&
                  user_id != "null"
                  ? user_id
                  : 0
                }`,
                { type: QueryTypes.SELECT }
              );
              whishlistIdList.push({
                metal_tone_id: data,
                wishlist_id:
                  wishListProduct.length > 0 ? wishListProduct[0].id : null,
              });
            }

            value.dataValues.wishlist_id_list = whishlistIdList;
          }
        }
      }
    }

    const diamondGroup = products.dataValues.PDO.map(
      (value: any) => value.id_diamond_group
    );

    const findDiamondGroup = await DiamondGroupMaster.findAll({
      where: { id: diamondGroup },
      attributes: ["id", "id_shape"],
    });

    const tages = await Tag.findAll({
      where: { id: products.dataValues.tag },
      attributes: ["id", "name"],
    });

    const size = await SizeData.findAll({
      where: { id: products.dataValues.size },
      order: [
        [
          Sequelize.cast(
            Sequelize.fn(
              "regexp_replace",
              Sequelize.col("slug"),
              "^[^0-9.]+",
              ""
            ),
            "NUMERIC"
          ),
          "ASC",
        ],
      ],
      attributes: ["id", "size"],
    });

    const length = await LengthData.findAll({
      where: { id: products.dataValues.length },
      order: [
        [
          Sequelize.cast(
            Sequelize.fn(
              "regexp_replace",
              Sequelize.col("slug"),
              "[^0-9.]",
              "",
              "g"
            ),
            "FLOAT"
          ),
          "ASC",
        ],
      ],
      attributes: ["id", "length"],
    });

    const diamond_shape = await DiamondShape.findAll({
      where: { id: findDiamondGroup.map((value: any) => value.id_shape) },
      attributes: [
        "id",
        "name",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const metalTone = products.dataValues.PMO.map(
      (t: any) => t.dataValues.metal_tone
    );
    const metal = products.dataValues.PMO.map(
      (t: any) => t.dataValues.id_metal
    );
    const karat = products.dataValues.PMO.map(
      (t: any) => t.dataValues.id_karat
    );

    // console.log(metals.flat().map((t: any) => t))
    const metal_tone = await MetalTone.findAll({
      where: {
        id: metalTone.flat().map((t: any) => t),
        is_deleted: "0",
        is_active: ActiveStatus.Active,
      },
      attributes: [
        "id",
        "name",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const metal_karat = await GoldKarat.findAll({
      where: {
        id: karat.flat().map((t: any) => t),
        is_deleted: "0",
        is_active: ActiveStatus.Active,
      },
      order: [["name", "ASC"]],
      attributes: [
        "id",
        "name",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const metals = await MetalMaster.findAll({
      where: {
        id: metal.flat().map((t: any) => t),
        is_deleted: "0",
        is_active: ActiveStatus.Active,
      },
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
    });

    const center_diamond_details = await dbContext.query(
      `SELECT gemstones.name as diamond, product_diamond_options.count AS count, diamond_shapes.name as shape,  mm_sizes.value as MM_size, colors.value as diamond_color, clarities.value as diamond_clarity, cuts.value as diamond_cut, (product_diamond_options.weight*product_diamond_options.count) AS weight FROM products LEFT OUTER JOIN product_diamond_options ON product_diamond_options.id_product = products.id LEFT OUTER JOIN diamond_group_masters ON product_diamond_options.id_diamond_group = diamond_group_masters.id LEFT OUTER JOIN gemstones ON diamond_group_masters.id_stone = gemstones.id LEFT OUTER JOIN diamond_shapes ON diamond_group_masters.id_shape = diamond_shapes.id LEFT OUTER JOIN mm_sizes ON diamond_group_masters.id_mm_size = mm_sizes.id LEFT OUTER JOIN colors ON diamond_group_masters.id_color = colors.id LEFT OUTER JOIN clarities ON diamond_group_masters.id_clarity = clarities.id LEFT OUTER JOIN cuts ON diamond_group_masters.id_cuts = cuts.id WHERE products.slug = '${slug}' AND product_diamond_options.id_type = 1`,
      { type: QueryTypes.SELECT }
    );
    return resSuccess({
      data: {
        products,
        size,
        length,
        tages,
        diamond_shape,
        metal_tone,
        metal_karat,
        metals,
        center_diamond_details,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const featuredProductListUserSide = async (req: Request) => {
  try {
    const productList = await dbContext.query(
      `SELECT products.id, products.name, products.sku, products.slug, products.sort_description,
  products.discount_type, products.discount_value, products.setting_style_type,products.product_type,
  products.gender, products.making_charge, products.finding_charge, products.other_charge, products.additional_detail,
  (SELECT jsonb_agg(jsonb_build_object('id', product_images.id, 'image_path', product_images.image_path, 'id_metal_tone', product_images.id_metal_tone))
                             FROM product_images
                             WHERE product_images.id_product = products.id AND is_deleted = '0' 
               AND image_type = 1
  ) AS product_images,
  
  (SELECT jsonb_agg(jsonb_build_object('id',p_metal.id, 'id_metal', p_metal.id_metal, 'id_karat', id_karat, 'id_size', id_size,'id_length', id_length, 
                    'side_dia_weight', side_dia_weight,'side_dia_count', side_dia_count, 'id_m_tone', id_m_tone,
                      'wishlist_id', (SELECT id FROM wishlist_products WHERE product_id = p_metal.id_product AND product_type = ${AllProductTypes.Product
      } AND variant_id = p_metal.id AND user_id = ${req.query.user_id &&
        req.query.user_id != "" &&
        req.query.user_id != undefined &&
        req.query.user_id != null &&
        req.query.user_id != "null"
        ? req.query.user_id
        : 0
      } LIMIT 1),
                     'metal_tone', CASE WHEN id_metal_tone IS NULL THEN '{}'::int[] 
                     ELSE string_to_array(id_metal_tone, '|')::int[] END,
                     'gold_karat', gold_kts.name,
                     'Price', CASE WHEN products.product_type = 2 
                     THEN retail_price 
                     ELSE CASE WHEN id_karat IS NULL THEN
                     (metal_master.metal_rate*p_metal.metal_weight+products.making_charge+products.finding_charge+products.other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))
                     ELSE 
                     (metal_master.metal_rate/31.104*gold_kts.name/24*p_metal.metal_weight+products.making_charge+products.finding_charge+products.other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))
                     END
                     END
                    )) 
             FROM product_metal_options AS p_metal 
             LEFT JOIN metal_masters AS metal_master ON metal_master.id = p_metal.id_metal
             LEFT JOIN gold_kts ON gold_kts.id = p_metal.id_karat
             WHERE p_metal.is_deleted = '0'  
             AND id_product = products.id

  ) AS PMO
             
  FROM products 
LEFT  JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0'
LEFT  JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group

WHERE products.is_deleted = '0' 
AND products.is_active = '1' 
AND products.is_featured = '1'
GROUP BY products.id
ORDER BY products.id DESC 

`,
      { type: QueryTypes.SELECT }
    );

    await productTypeMetalArrayCreate(productList);

    return resSuccess({ data: productList });
  } catch (error) {
    throw error;
  }
};

export const trendingProductListUserSide = async (req: Request) => {
  try {
    const productList = await dbContext.query(
      `SELECT products.id, products.name, products.sku, products.slug, products.sort_description,
    products.discount_type, products.discount_value, products.setting_style_type,products.product_type,
    products.gender, products.making_charge, products.finding_charge, products.other_charge,products.additional_detail,
    (SELECT jsonb_agg(jsonb_build_object('id', product_images.id, 'image_path', product_images.image_path, 'id_metal_tone', product_images.id_metal_tone))
                               FROM product_images
                               WHERE product_images.id_product = products.id AND is_deleted = '0' 
                 AND image_type = 1
    ) AS product_images,
    
    (SELECT jsonb_agg(jsonb_build_object('id',p_metal.id, 'id_metal', p_metal.id_metal, 'id_karat', id_karat, 'id_size', id_size,'id_length', id_length, 
                      'side_dia_weight', side_dia_weight,'side_dia_count', side_dia_count, 'id_m_tone', id_m_tone,
                        'wishlist_id', (SELECT id FROM wishlist_products WHERE product_id = p_metal.id_product AND product_type = ${AllProductTypes.Product
      } AND variant_id = p_metal.id AND user_id = ${req.query.user_id &&
        req.query.user_id != "" &&
        req.query.user_id != undefined &&
        req.query.user_id != null &&
        req.query.user_id != "null"
        ? req.query.user_id
        : 0
      } LIMIT 1),
                       'metal_tone', CASE WHEN id_metal_tone IS NULL THEN '{}'::int[] 
                       ELSE string_to_array(id_metal_tone, '|')::int[] END,
                      'gold_karat', gold_kts.name,
                       'Price', CASE WHEN products.product_type = 2 
                       THEN retail_price 
                       ELSE CASE WHEN id_karat IS NULL THEN
                       (metal_master.metal_rate*p_metal.metal_weight+products.making_charge+products.finding_charge+products.other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))
                       ELSE 
                       (metal_master.metal_rate/31.104*gold_kts.name/24*p_metal.metal_weight+products.making_charge+products.finding_charge+products.other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0)))
                       END
                       END
                      )) 
               FROM product_metal_options AS p_metal 
               LEFT JOIN metal_masters AS metal_master ON metal_master.id = p_metal.id_metal
               LEFT JOIN gold_kts ON gold_kts.id = p_metal.id_karat
               WHERE p_metal.is_deleted = '0'  
               AND id_product = products.id
  
    ) AS PMO
               
    FROM products 
  LEFT  JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0'
  LEFT  JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group
  
  WHERE products.is_deleted = '0' 
  AND products.is_active = '1' 
  AND products.is_trending = '1'
  GROUP BY products.id
  ORDER BY products.id DESC 
  
  `,
      { type: QueryTypes.SELECT }
    );

    await productTypeMetalArrayCreate(productList);

    return resSuccess({ data: productList });
  } catch (error) {
    throw error;
  }
};

export const featuredProductStatusUpdate = async (req: Request) => {
  try {
    const { id_product, is_featured } = req.body;
    const findProduct = await Product.findOne({
      where: {
        id: id_product,
        is_deleted: "0",
      },
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await Product.update(
      {
        is_featured: is_featured,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findProduct.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const trendingProductStatusUpdate = async (req: Request) => {
  try {
    const { id_product, is_trending } = req.body;
    const findProduct = await Product.findOne({
      where: {
        id: id_product,
        is_deleted: "0",
      },
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await Product.update(
      {
        is_trending: is_trending,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findProduct.dataValues.id } }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const saveProductMetalOption = async (req: Request) => {
  try {
    const {
      id_product,
      created_by,
      product_Gold_metal_options,
      product_silver_options,
      product_platinum_options,
      settingStyleType,
      size,
      length,
      product_diamond_options,
    } = req.body;

    if (!id_product) return resBadRequest({ message: INVALID_ID });
    const products = await Product.findOne({
      where: { id: id_product, is_deleted: "0" },
    });
    if (!(products && products.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    if (
      !product_Gold_metal_options &&
      !product_silver_options &&
      !product_platinum_options
    )
      return resBadRequest({ message: METAL_IS_REQUIRES });
    const trn = await dbContext.transaction();

    try {
      console.log(settingStyleType);

      if (size) {
        await Product.update(
          {
            size: size.join("|"),
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: id_product }, transaction: trn }
        );
      }

      if (length) {
        await Product.update(
          {
            length: length.join("|"),
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: id_product }, transaction: trn }
        );
      }

      if (settingStyleType) {
        await Product.update(
          {
            setting_style_type: settingStyleType.join("|"),
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: id_product }, transaction: trn }
        );
      }

      if (product_Gold_metal_options) {
        let pmgo: IProductMetalGoldData;
        const validation_gold = product_Gold_metal_options.filter(
          (value: any) => value.metal_weight != null
        );

        if (validation_gold.length == 0) {
          await trn.rollback();
          return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
        }
        for (pmgo of product_Gold_metal_options) {
          if (pmgo.id === 0) {
            await ProductMetalOption.create(
              {
                id_product: id_product,
                id_metal: pmgo.id_metal,
                metal_weight: pmgo.metal_weight,
                id_metal_tone: pmgo.id_metal_tone.join("|"),
                id_karat: pmgo.id_karat,
                created_date: getLocalDate(),
                created_by: req.body.session_res.id_app_user,
              },
              { transaction: trn }
            );
          } else {
            let productMetal = await ProductMetalOption.findOne({
              where: { id: pmgo.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }
            await ProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmgo.id_metal,
                metal_weight: pmgo.metal_weight,
                id_metal_tone: pmgo.id_metal_tone.join("|"),
                id_karat: pmgo.id_karat,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
              },

              { where: { id: pmgo.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      if (product_silver_options) {
        let pmso: IProductMetalSilverData;

        for (pmso of product_silver_options) {
          if (pmso.id_metal == null) {
            await trn.rollback();
            return resBadRequest({ message: METAL_IS_REQUIRES });
          } else {
            if (pmso.id_metal != null) {
              if (pmso.metal_weight == null) {
                await trn.rollback();
                return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
              }
            }
          }

          if (pmso.id === 0) {
            await ProductMetalOption.create(
              {
                id_product: id_product,
                id_metal: pmso.id_metal,
                metal_weight: pmso.metal_weight,
                id_metal_tone: pmso.id_metal_tone.join("|"),
                created_date: getLocalDate(),
                created_by: req.body.session_res.id_app_user,
              },
              { transaction: trn }
            );
          } else {
            let productMetal = await ProductMetalOption.findOne({
              where: { id: pmso.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }
            await ProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmso.id_metal,
                metal_weight: pmso.metal_weight,
                id_metal_tone: pmso.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
              },

              { where: { id: pmso.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      if (product_platinum_options) {
        let pmpo: IProductMetalSilverData;

        for (pmpo of product_platinum_options) {
          if (pmpo.id_metal == null) {
            await trn.rollback();
            return resBadRequest({ message: METAL_IS_REQUIRES });
          } else {
            if (pmpo.id_metal != null) {
              if (pmpo.metal_weight == null) {
                await trn.rollback();
                return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
              }
            }
          }

          if (pmpo.id === 0) {
            await ProductMetalOption.create(
              {
                id_product: id_product,
                id_metal: pmpo.id_metal,
                metal_weight: pmpo.metal_weight,
                id_metal_tone: pmpo.id_metal_tone.join("|"),
                created_date: getLocalDate(),
                created_by: req.body.session_res.id_app_user,
              },
              { transaction: trn }
            );
          } else {
            let productMetal = await ProductMetalOption.findOne({
              where: { id: pmpo.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }

            await ProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmpo.id_metal,
                metal_weight: pmpo.metal_weight,
                id_metal_tone: pmpo.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
              },

              { where: { id: pmpo.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      if (product_diamond_options) {
        let pdod;

        for (pdod of product_diamond_options) {
          let diamondGroup = await DiamondGroupMaster.findOne({
            where: {
              id_stone: pdod.id_stone,
              id_shape: pdod.id_shape,
              id_mm_size: pdod.id_mm_size,
              id_color: pdod.id_color,
              id_clarity: pdod.id_clarity,
              id_cuts: pdod.id_cuts,
              is_deleted: "0",
            },
            transaction: trn,
          });

          if (diamondGroup === null) {
            await trn.rollback();
            return resBadRequest({ message: DIAMOND_GROUP_NOT_FOUND });
          }

          console.log("diamondGroup.dataValues.id", diamondGroup.dataValues.id);

          if (pdod.id === 0) {
            await ProductDiamondOption.create(
              {
                id_product: id_product,
                id_diamond_group: diamondGroup.dataValues.id,
                id_type: pdod.id_type,
                id_setting: pdod.id_setting,
                weight: pdod.weight,
                count: pdod.count,
                is_default: pdod.is_default,
                created_date: getLocalDate(),
                created_by: req.body.session_res.id_app_user,
              },
              { transaction: trn }
            );
          } else {
            let diamondOption = await ProductDiamondOption.findOne({
              where: { id: pdod.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(diamondOption && diamondOption.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_DIAMOND_OPTION_NOT_FOUND });
            }

            await ProductDiamondOption.update(
              {
                id_product: id_product,
                id_diamond_group: diamondGroup.dataValues.id,
                id_type: pdod.id_type,
                id_setting: pdod.id_setting,
                weight: pdod.weight,
                count: pdod.count,
                is_default: pdod.is_default,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
              },

              { where: { id: pdod.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      await trn.commit();
      return resSuccess();
    } catch (error) {
      await trn.rollback();
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

export const addProductAllDetailsApi = async (req: Request) => {
  try {
    const {
      id_product,
      name,
      sku,
      sort_description,
      long_description,
      tag,
      product_categories,
      making_charge,
      finding_charge,
      other_charge,
      product_Gold_metal_options,
      product_silver_options,
      product_platinum_options,
      settingStyleType,
      size,
      length,
      product_diamond_options,
      gender,
      discount_type,
      discount_value,
      product_type,
      additional_detail = null,
    } = req.body;

    let slug = name.toLowerCase().replaceAll(" ", "-");

    let resIdProduct = 0;
    if (id_product !== 0) {
      resIdProduct = id_product;
    }
    let productToBeUpdate;
    if (id_product !== 0) {
      productToBeUpdate = await Product.findOne({
        where: {
          id: id_product,
          is_deleted: "0",
        },
      });

      if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
    }

    const productSKU = await Product.findOne({
      where: { sku: sku, is_deleted: "0" },
    });

    if (productSKU != null) {
      return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
    }

    const validTag = await validateProductTag({
      tag,
      oldTag:
        productToBeUpdate && productToBeUpdate.dataValues.tag
          ? productToBeUpdate.dataValues.tag
          : "",
    });

    if (validTag.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validTag;
    }

    const validPC = await validateProductCategories({
      categories: product_categories,
      id_product: id_product !== 0 ? id_product : null,
    });

    if (validPC.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validPC;
    }

    if (
      !product_Gold_metal_options &&
      !product_silver_options &&
      !product_platinum_options
    )
      return resBadRequest({ message: METAL_IS_REQUIRES });

    const trn = await dbContext.transaction();
    try {
      if (id_product === 0) {
        // slug create and same slug create then change the slug
        const sameSlugCount = await Product.count({
          where: [
            columnValueLowerCase("slug", slug),
            { is_deleted: DeletedStatus.No },
          ],
        });

        if (sameSlugCount > 0) {
          slug = `${slug}-${sameSlugCount}`;
        }

        const resProduct = await Product.create(
          {
            name: name,
            sku: sku,
            additional_detail: additional_detail,
            sort_description: sort_description,
            long_description: long_description,
            tag: tag.join("|"),
            slug: slug,
            making_charge,
            finding_charge,
            other_charge,
            product_type: product_type ? product_type : null,
            discount_type:
              discount_type && discount_type != "" ? discount_type : null,
            discount_value:
              discount_type == DISCOUNT_TYPE.PAR
                ? discount_value / 100
                : discount_value,
            gender: gender == false ? null : gender.join("|"),
            size: size == false ? null : size.join("|"),
            length: length == false ? null : length.join("|"),
            setting_style_type:
              settingStyleType == false ? null : settingStyleType.join("|"),
            is_active: ActiveStatus.Active,
            is_featured: FeaturedProductStatus.InFeatured,
            is_trending: TrendingProductStatus.InTrending,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        for (const productCategory of product_categories) {
          await ProductCategory.create(
            {
              id_product: resProduct.dataValues.id,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }

        if (product_Gold_metal_options) {
          let pmgo: IProductMetalGoldData;
          const validation_gold = product_Gold_metal_options.filter(
            (value: any) => value.metal_weight != null
          );

          if (validation_gold.length == 0) {
            await trn.rollback();
            return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
          }

          for (pmgo of product_Gold_metal_options) {
            if (pmgo.id === 0) {
              if (pmgo.metal_weight) {
                await ProductMetalOption.create(
                  {
                    id_product: resProduct.dataValues.id,
                    id_metal: pmgo.id_metal,
                    metal_weight: pmgo.metal_weight,
                    id_metal_tone: pmgo.id_metal_tone.join("|"),
                    id_karat: pmgo.id_karat,
                    retail_price: pmgo.retail_price,
                    compare_price: pmgo.compare_price,
                    created_date: getLocalDate(),
                    created_by: req.body.session_res.id_app_user,
                  },
                  { transaction: trn }
                );
              }
            }
          }
        }
        if (product_silver_options) {
          let pmso: IProductMetalSilverData;
          for (pmso of product_silver_options) {
            if (pmso.id_metal == null) {
              await trn.rollback();
              return resBadRequest({ message: METAL_IS_REQUIRES });
            } else {
              if (pmso.id_metal != null) {
                if (pmso.metal_weight == null) {
                  await trn.rollback();
                  return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
                }
              }
            }

            if (pmso.id === 0) {
              await ProductMetalOption.create(
                {
                  id_product: resProduct.dataValues.id,
                  id_metal: pmso.id_metal,
                  metal_weight: pmso.metal_weight,
                  id_metal_tone: pmso.id_metal_tone.join("|"),
                  created_date: getLocalDate(),
                  retail_price: pmso.retail_price,
                  compare_price: pmso.compare_price,
                  created_by: req.body.session_res.id_app_user,
                },
                { transaction: trn }
              );
            }
          }
        }

        if (product_platinum_options) {
          let pmpo: IProductMetalSilverData;

          for (pmpo of product_platinum_options) {
            if (pmpo.id_metal == null) {
              await trn.rollback();
              return resBadRequest({ message: METAL_IS_REQUIRES });
            } else {
              if (pmpo.id_metal != null) {
                if (pmpo.metal_weight == null) {
                  await trn.rollback();
                  return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
                }
              }
            }

            if (pmpo.id === 0) {
              await ProductMetalOption.create(
                {
                  id_product: resProduct.dataValues.id,
                  id_metal: pmpo.id_metal,
                  metal_weight: pmpo.metal_weight,
                  id_metal_tone: pmpo.id_metal_tone.join("|"),
                  created_date: getLocalDate(),
                  retail_price: pmpo.retail_price,
                  compare_price: pmpo.compare_price,
                  created_by: req.body.session_res.id_app_user,
                },
                { transaction: trn }
              );
            }
          }
        }

        if (product_diamond_options) {
          let pdod;

          for (pdod of product_diamond_options) {
            let diamondGroup = await DiamondGroupMaster.findOne({
              where: {
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_cuts: pdod.id_cuts,
                is_deleted: "0",
              },
              transaction: trn,
            });

            if (diamondGroup === null) {
              await trn.rollback();
              return resBadRequest({ message: DIAMOND_GROUP_NOT_FOUND });
            }

            console.log(
              "diamondGroup.dataValues.id",
              diamondGroup.dataValues.id
            );

            if (pdod.id === 0) {
              await ProductDiamondOption.create(
                {
                  id_product: resProduct.dataValues.id,
                  id_diamond_group: diamondGroup.dataValues.id,
                  id_type: pdod.id_type,
                  id_setting:
                    pdod.id_setting === null || pdod.id_setting === ""
                      ? null
                      : pdod.id_setting,
                  weight: pdod.weight,
                  count: pdod.count,
                  is_default: pdod.is_default,
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                },
                { transaction: trn }
              );
            }
          }
        }
      } else {
        await Product.update(
          {
            name: name,
            sku: sku,
            additional_detail: additional_detail,
            sort_description: sort_description ? sort_description : null,
            long_description: long_description ? long_description : null,
            tag: tag.join("|"),
            slug: slug,
            making_charge,
            finding_charge,
            other_charge,
            gender: gender == false ? null : gender.join("|"),
            size: size == false ? null : size.join("|"),
            length: length == false ? null : length.join("|"),
            setting_style_type:
              settingStyleType == false ? null : settingStyleType.join("|"),
            modified_by: req.body.session_res.id_app_user,
            modified_date: new Date(),
          },
          { where: { id: id_product }, transaction: trn }
        );

        for (const productCategory of product_categories) {
          if (productCategory.id === 0) {
            await ProductCategory.create(
              {
                id_product: id_product,
                id_category: productCategory.id_category,
                id_sub_category: productCategory.id_sub_category,
                id_sub_sub_category: productCategory.id_sub_sub_category,
                created_by: req.body.session_res.id_app_user,
                created_date: new Date(),
              },
              { transaction: trn }
            );
          } else {
            await ProductCategory.update(
              {
                id_category: productCategory.id_category,
                id_sub_category: productCategory.id_sub_category,
                id_sub_sub_category: productCategory.id_sub_sub_category,
                modified_by: req.body.session_res.id_app_user,
                modified_date: new Date(),
              },
              { where: { id: productCategory.id }, transaction: trn }
            );
          }
        }

        for (const productCategory of validPC.data) {
          await ProductCategory.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: new Date(),
            },
            { where: { id: productCategory.id }, transaction: trn }
          );
        }

        if (product_Gold_metal_options) {
          let pmgo: IProductMetalGoldData;
          const validation_gold = product_Gold_metal_options.filter(
            (value: any) => value.metal_weight != null
          );

          if (validation_gold.length == 0) {
            await trn.rollback();
            return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
          }
          for (pmgo of product_Gold_metal_options) {
            if (pmgo.id === 0) {
              if (pmgo.metal_weight) {
                await ProductMetalOption.create(
                  {
                    id_product: id_product,
                    id_metal: pmgo.id_metal,
                    metal_weight: pmgo.metal_weight,
                    id_metal_tone: pmgo.id_metal_tone.join("|"),
                    id_karat: pmgo.id_karat,
                    retail_price: pmgo.retail_price,
                    compare_price: pmgo.compare_price,
                    created_date: getLocalDate(),
                    created_by: req.body.session_res.id_app_user,
                  },
                  { transaction: trn }
                );
              }
            } else {
              let productMetal = await ProductMetalOption.findOne({
                where: { id: pmgo.id, is_deleted: "0" },
                transaction: trn,
              });

              if (!(productMetal && productMetal.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
              }
              await ProductMetalOption.update(
                {
                  id_product: id_product,
                  id_metal: pmgo.id_metal,
                  metal_weight: pmgo.metal_weight,
                  id_metal_tone: pmgo.id_metal_tone.join("|"),
                  id_karat: pmgo.id_karat,
                  retail_price: pmgo.retail_price,
                  compare_price: pmgo.compare_price,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                },

                { where: { id: pmgo.id, is_deleted: "0" }, transaction: trn }
              );
            }
          }
        }

        if (product_silver_options) {
          let pmso: IProductMetalSilverData;

          for (pmso of product_silver_options) {
            if (pmso.id_metal == null) {
              await trn.rollback();
              return resBadRequest({ message: METAL_IS_REQUIRES });
            } else {
              if (pmso.id_metal != null) {
                if (pmso.metal_weight == null) {
                  await trn.rollback();
                  return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
                }
              }
            }

            if (pmso.id === 0) {
              await ProductMetalOption.create(
                {
                  id_product: id_product,
                  id_metal: pmso.id_metal,
                  metal_weight: pmso.metal_weight,
                  id_metal_tone: pmso.id_metal_tone.join("|"),
                  created_date: getLocalDate(),
                  retail_price: pmso.retail_price,
                  compare_price: pmso.compare_price,
                  created_by: req.body.session_res.id_app_user,
                },
                { transaction: trn }
              );
            } else {
              let productMetal = await ProductMetalOption.findOne({
                where: { id: pmso.id, is_deleted: "0" },
                transaction: trn,
              });

              if (!(productMetal && productMetal.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
              }
              await ProductMetalOption.update(
                {
                  id_product: id_product,
                  id_metal: pmso.id_metal,
                  metal_weight: pmso.metal_weight,
                  retail_price: pmso.retail_price,
                  compare_price: pmso.compare_price,
                  id_metal_tone: pmso.id_metal_tone.join("|"),
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                },

                { where: { id: pmso.id, is_deleted: "0" }, transaction: trn }
              );
            }
          }
        }

        if (product_platinum_options) {
          let pmpo: IProductMetalSilverData;

          for (pmpo of product_platinum_options) {
            if (pmpo.id_metal == null) {
              await trn.rollback();
              return resBadRequest({ message: METAL_IS_REQUIRES });
            } else {
              if (pmpo.id_metal != null) {
                if (pmpo.metal_weight == null) {
                  await trn.rollback();
                  return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
                }
              }
            }

            if (pmpo.id === 0) {
              await ProductMetalOption.create(
                {
                  id_product: id_product,
                  id_metal: pmpo.id_metal,
                  metal_weight: pmpo.metal_weight,
                  retail_price: pmpo.retail_price,
                  compare_price: pmpo.compare_price,
                  id_metal_tone: pmpo.id_metal_tone.join("|"),
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                },
                { transaction: trn }
              );
            } else {
              let productMetal = await ProductMetalOption.findOne({
                where: { id: pmpo.id, is_deleted: "0" },
                transaction: trn,
              });

              if (!(productMetal && productMetal.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
              }

              await ProductMetalOption.update(
                {
                  id_product: id_product,
                  id_metal: pmpo.id_metal,
                  metal_weight: pmpo.metal_weight,
                  retail_price: pmpo.retail_price,
                  compare_price: pmpo.compare_price,
                  id_metal_tone: pmpo.id_metal_tone.join("|"),
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                },

                { where: { id: pmpo.id, is_deleted: "0" }, transaction: trn }
              );
            }
          }
        }

        if (product_diamond_options) {
          let pdod;

          for (pdod of product_diamond_options) {
            let diamondGroup = await DiamondGroupMaster.findOne({
              where: {
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_cuts: pdod.id_cuts,
                is_deleted: "0",
              },
              transaction: trn,
            });

            if (diamondGroup === null) {
              await trn.rollback();
              return resBadRequest({ message: DIAMOND_GROUP_NOT_FOUND });
            }

            console.log(
              "diamondGroup.dataValues.id",
              diamondGroup.dataValues.id
            );

            if (pdod.id === 0) {
              await ProductDiamondOption.create(
                {
                  id_product: id_product,
                  id_diamond_group: diamondGroup.dataValues.id,
                  id_type: pdod.id_type,
                  id_setting: pdod.id_setting,
                  weight: pdod.weight,
                  count: pdod.count,
                  is_default: pdod.is_default,
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                },
                { transaction: trn }
              );
            } else {
              let diamondOption = await ProductDiamondOption.findOne({
                where: { id: pdod.id, is_deleted: "0" },
                transaction: trn,
              });

              if (!(diamondOption && diamondOption.dataValues)) {
                await trn.rollback();
                return resNotFound({
                  message: PRODUCT_DIAMOND_OPTION_NOT_FOUND,
                });
              }

              await ProductDiamondOption.update(
                {
                  id_product: id_product,
                  id_diamond_group: diamondGroup.dataValues.id,
                  id_type: pdod.id_type,
                  id_setting: pdod.id_setting,
                  weight: pdod.weight,
                  count: pdod.count,
                  is_default: pdod.is_default,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                },

                { where: { id: pdod.id, is_deleted: "0" }, transaction: trn }
              );
            }
          }
        }
      }

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

export const editproductApi = async (req: Request) => {
  try {
    const {
      id_product,
      name,
      sku,
      sort_description,
      long_description,
      tag,
      product_categories,
      making_charge,
      finding_charge,
      other_charge,
      product_Gold_metal_options,
      product_silver_options,
      product_platinum_options,
      settingStyleType,
      size,
      length,
      product_diamond_options,
      gender,
      discount_type,
      discount_value,
      additional_detail = null,
    } = req.body;

    let slug = name.replaceAll(" ", "-");

    let resIdProduct = 0;
    if (id_product !== 0) {
      resIdProduct = id_product;
    }
    let productToBeUpdate;
    if (id_product !== 0) {
      productToBeUpdate = await Product.findOne({
        where: {
          id: id_product,
          is_deleted: "0",
        },
      });

      if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
    }

    const productsku = await Product.findOne({
      where: { sku: sku, id: { [Op.ne]: id_product }, is_deleted: "0" },
    });

    if (productsku != null) {
      return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
    }

    const validTag = await validateProductTag({
      tag,
      oldTag:
        productToBeUpdate && productToBeUpdate.dataValues.tag
          ? productToBeUpdate.dataValues.tag
          : "",
    });

    if (validTag.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validTag;
    }

    const validPC = await validateProductCategories({
      categories: product_categories,
      id_product: id_product !== 0 ? id_product : null,
    });

    if (validPC.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validPC;
    }

    // if(settingStyleType == false) {
    //   return resBadRequest({message: SETTING_TYPE_IS_REQUIRED})
    // }

    if (
      !product_Gold_metal_options &&
      !product_silver_options &&
      !product_platinum_options
    )
      return resBadRequest({ message: METAL_IS_REQUIRES });

    const trn = await dbContext.transaction();
    try {
      await Product.update(
        {
          name: name,
          sku: sku,
          additional_detail: additional_detail,
          sort_description: sort_description ? sort_description : null,
          long_description: long_description ? long_description : null,
          tag: tag.join("|"),
          gender: gender == false ? null : gender.join("|"),
          slug: slug,
          making_charge,
          finding_charge,
          other_charge,
          discount_type: discount_type,
          discount_value:
            discount_type == DISCOUNT_TYPE.PAR
              ? discount_value / 100
              : discount_value,
          size: size == false ? null : size.join("|"),
          length: length == false ? null : length.join("|"),
          setting_style_type:
            settingStyleType == false ? null : settingStyleType.join("|"),
          modified_by: req.body.session_res.id_app_user,
          modified_date: new Date(),
        },
        { where: { id: id_product }, transaction: trn }
      );

      for (const productCategory of product_categories) {
        if (productCategory.id === 0) {
          await ProductCategory.create(
            {
              id_product: id_product,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              created_by: req.body.session_res.id_app_user,
              created_date: new Date(),
            },
            { transaction: trn }
          );
        } else {
          await ProductCategory.update(
            {
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              modified_by: req.body.session_res.id_app_user,
              modified_date: new Date(),
            },
            { where: { id: productCategory.id }, transaction: trn }
          );
        }
      }

      for (const productCategory of validPC.data) {
        await ProductCategory.update(
          {
            is_deleted: "1",
            modified_by: req.body.session_res.id_app_user,
            modified_date: new Date(),
          },
          { where: { id: productCategory.id }, transaction: trn }
        );
      }

      if (product_Gold_metal_options) {
        let pmgo: IProductMetalGoldData;
        const validation_gold = product_Gold_metal_options.filter(
          (value: any) => value.metal_weight != null
        );

        if (validation_gold.length == 0) {
          await trn.rollback();
          return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
        }
        for (pmgo of product_Gold_metal_options) {
          if (pmgo.id === 0) {
            if (pmgo.metal_weight) {
              await ProductMetalOption.create(
                {
                  id_product: id_product,
                  id_metal: pmgo.id_metal,
                  metal_weight: pmgo.metal_weight,
                  id_metal_tone: pmgo.id_metal_tone.join("|"),
                  id_karat: pmgo.id_karat,
                  retail_price: pmgo.retail_price,
                  compare_price: pmgo.compare_price,
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                  is_deleted: pmgo.is_deleted,
                },
                { transaction: trn }
              );
            }
          } else {
            let productMetal = await ProductMetalOption.findOne({
              where: { id: pmgo.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }
            await ProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmgo.id_metal,
                metal_weight: pmgo.metal_weight,
                id_metal_tone: pmgo.id_metal_tone.join("|"),
                id_karat: pmgo.id_karat,
                retail_price: pmgo.retail_price,
                compare_price: pmgo.compare_price,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmgo.is_deleted,
              },

              { where: { id: pmgo.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      if (product_silver_options) {
        let pmso: IProductMetalSilverData;

        for (pmso of product_silver_options) {
          if (pmso.id_metal == null) {
            await trn.rollback();
            return resBadRequest({ message: METAL_IS_REQUIRES });
          } else {
            if (pmso.id_metal != null) {
              if (pmso.metal_weight == null) {
                await trn.rollback();
                return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
              }
            }
          }

          if (pmso.id === 0) {
            await ProductMetalOption.create(
              {
                id_product: id_product,
                id_metal: pmso.id_metal,
                metal_weight: pmso.metal_weight,
                id_metal_tone: pmso.id_metal_tone.join("|"),
                created_date: getLocalDate(),
                retail_price: pmso.retail_price,
                compare_price: pmso.compare_price,
                created_by: req.body.session_res.id_app_user,
                is_deleted: pmso.is_deleted,
              },
              { transaction: trn }
            );
          } else {
            let productMetal = await ProductMetalOption.findOne({
              where: { id: pmso.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }
            await ProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmso.id_metal,
                metal_weight: pmso.metal_weight,
                id_metal_tone: pmso.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                retail_price: pmso.retail_price,
                compare_price: pmso.compare_price,
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmso.is_deleted,
              },

              { where: { id: pmso.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      if (product_platinum_options) {
        let pmpo: IProductMetalSilverData;

        for (pmpo of product_platinum_options) {
          if (pmpo.id_metal == null) {
            await trn.rollback();
            return resBadRequest({ message: METAL_IS_REQUIRES });
          } else {
            if (pmpo.id_metal != null) {
              if (pmpo.metal_weight == null) {
                await trn.rollback();
                return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
              }
            }
          }

          if (pmpo.id === 0) {
            await ProductMetalOption.create(
              {
                id_product: id_product,
                id_metal: pmpo.id_metal,
                metal_weight: pmpo.metal_weight,
                id_metal_tone: pmpo.id_metal_tone.join("|"),
                created_date: getLocalDate(),
                retail_price: pmpo.retail_price,
                compare_price: pmpo.compare_price,
                created_by: req.body.session_res.id_app_user,
                is_deleted: pmpo.is_deleted,
              },
              { transaction: trn }
            );
          } else {
            let productMetal = await ProductMetalOption.findOne({
              where: { id: pmpo.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }

            await ProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmpo.id_metal,
                metal_weight: pmpo.metal_weight,
                id_metal_tone: pmpo.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                retail_price: pmpo.retail_price,
                compare_price: pmpo.compare_price,
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmpo.is_deleted,
              },

              { where: { id: pmpo.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      if (product_diamond_options) {
        let pdod;

        for (pdod of product_diamond_options) {
          let diamondGroup = await DiamondGroupMaster.findOne({
            where: {
              id_stone: pdod.id_stone,
              id_shape: pdod.id_shape,
              id_mm_size: pdod.id_mm_size,
              id_color: pdod.id_color,
              id_clarity: pdod.id_clarity,
              id_cuts: pdod.id_cuts,
              is_deleted: "0",
            },
            transaction: trn,
          });

          if (diamondGroup === null) {
            await trn.rollback();
            return resBadRequest({ message: DIAMOND_GROUP_NOT_FOUND });
          }

          console.log("diamondGroup.dataValues.id", diamondGroup.dataValues.id);

          if (pdod.id === 0) {
            await ProductDiamondOption.create(
              {
                id_product: id_product,
                id_diamond_group: diamondGroup.dataValues.id,
                id_type: pdod.id_type,
                id_setting: pdod.id_setting,
                weight: pdod.weight,
                count: pdod.count,
                is_default: pdod.is_default,
                created_date: getLocalDate(),
                created_by: req.body.session_res.id_app_user,
                is_deleted: pdod.is_deleted,
              },
              { transaction: trn }
            );
          } else {
            let diamondOption = await ProductDiamondOption.findOne({
              where: { id: pdod.id, is_deleted: "0" },
              transaction: trn,
            });

            if (!(diamondOption && diamondOption.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_DIAMOND_OPTION_NOT_FOUND });
            }

            await ProductDiamondOption.update(
              {
                id_product: id_product,
                id_diamond_group: diamondGroup.dataValues.id,
                id_type: pdod.id_type,
                id_setting: pdod.id_setting,
                weight: pdod.weight,
                count: pdod.count,
                is_default: pdod.is_default,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pdod.is_deleted,
              },

              { where: { id: pdod.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }
      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

export const wishlistCartListCount = async (req: Request) => {
  try {
    const { user_id } = req.body;

    const wish_list_count = await ProductWish.count({
      where: { user_id: user_id },
    });

    const cart_list_count = await CartProducts.sum("quantity", {
      where: { user_id: user_id },
    });

    const config_cart_list_count = await ConfigCartProduct.count({
      where: { user_id: user_id },
    });

    const totalCartCount = cart_list_count + config_cart_list_count;

    return resSuccess({ data: { wish_list_count, totalCartCount } });
  } catch (error) {
    throw error;
  }
};

export const searchProductGlobally = async (req: Request) => {
  try {
    let tags = await Tag.findOne({
      where: { name: { [Op.iLike]: "%" + req.query.search_text + "%" } },
    });

    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      req.query.search_text
        ? {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + req.query.search_text + "%" } },
            // Sequelize.where(Sequelize.literal(`(SELECT COUNT(*) FROM product_categories AS pC LEFT OUTER JOIN categories ON pC.id_category = categories.id WHERE pc.id_product = products.id AND categories.category_name ilike '%${req.query.search_text}%')`), ">", "0"),
            //  { tag: { [Op.iLike]: "%" +  tags?.dataValues.id + "%" } },
          ],
        }
        : {},
    ];

    const productList = await Product.findAll({
      where,
      order: [
        ["id", "DESC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_metal", "ASC"],
        [
          Sequelize.literal(`CAST("PMO->metal_karat"."name" AS INTEGER)`),
          "ASC",
        ],
      ],
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "additional_detail",
        [
          Sequelize.literal(
            `(SELECT product_images.image_path FROM product_images WHERE product_images.id_product = products.id AND product_images.image_type = 1 ORDER BY  id_metal_tone ASC, id ASC LIMIT 1)`
          ),
          "product_image",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."product_type" = 2 THEN "PMO"."retail_price" ELSE (SELECT CASE WHEN "PMO"."id_karat" IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" ELSE products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" AND PMO.id_karat = "PMO"."id_karat" END GROUP BY metal_master.metal_rate, PMO.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name) END`
          ),
          "Price",
        ],
        "retail_price",
        "compare_price",
      ],
      include: [
        {
          required: true,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [],
          where: [{ is_deleted: "0" }],

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

    return resSuccess({ data: productList });
  } catch (error) {
    throw error;
  }
};

/* config product find based on the sku */

export const getBySKUConfigProductDetails = async (req: Request) => {
  try {
    const { slug } = req.params;

    const configPRoductExit = await ConfigProduct.findOne({
      where: { slug: { [Op.iLike]: `${slug}` }, is_deleted: "0" },
    });

    if (!(configPRoductExit && configPRoductExit.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const product = await ConfigProduct.findOne({
      where: { slug: { [Op.iLike]: `${slug}` }, is_deleted: "0" },
      attributes: [
        "id",
        "shank_type_id",
        "side_setting_id",
        "head_type_id",
        "head_no",
        "shank_no",
        "band_no",
        "ring_no",
        "style_no",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        "center_dia_cts",
        "center_dia_size",
        "center_dia_shape_id",
        "center_dia_clarity_id",
        "center_dia_cut_id",
        "center_dia_mm_id",
        "center_dia_color",
        "slug",
        "center_diamond_group_id",
        "laber_charge",
        "product_type",
        "product_total_diamond",
        "center_dia_type",
      ],
      include: [
        {
          model: DiamondGroupMaster,
          as: "cender_diamond",
          attributes: ["id_stone"],
        },
        {
          required: false,
          model: ConfigProductMetals,
          as: "CPMO",
          attributes: [
            "id",
            "config_product_id",
            "metal_id",
            "karat_id",
            "metal_tone",
            "metal_wt",
            "head_shank_band",
            "labor_charge",
          ],
        },
        {
          required: false,
          model: ConfigProductDiamonds,
          as: "CPDO",
          attributes: [
            "id",
            "config_product_id",
            "product_type",
            "dia_cts_individual",
            "dia_count",
            "dia_cts",
            "dia_size",
            "id_diamond_group",
            "dia_weight",
            "dia_shape",
            "dia_stone",
            "dia_color",
            "dia_mm_size",
            "dia_clarity",
            "dia_cuts",
          ],
        },
      ],
    });

    return resSuccess({ data: product });
  } catch (error) {
    throw error;
  }
};

/* product add and edit with variant data and without variant --- single product and watch product manage in one */

export const addProductWithVariant = async (req: Request) => {
  try {
    const {
      id_product,
      title,
      sku,
      Short_Description,
      long_description,
      tag,
      id_brand,
      collection,
      product_categories,
      making_charge,
      finding_charge,
      other_charge,
      quantity,
      retail_price,
      compare_price,
      product_metal_options,
      is_quantity_track,
      settingStyleType,
      size,
      length,
      product_diamond_options,
      gender,
      discount_type,
      discount_value,
      is_choose_setting,
      is_single,
      setting_diamond_shapes,
      additional_detail = null,
    } = req.body;

    // check if product id is not 0 then check product find
    let productToBeUpdate;
    if (id_product !== 0) {
      productToBeUpdate = await Product.findOne({
        where: {
          id: id_product,
          is_deleted: DeletedStatus.No,
        },
      });

      if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }

      // check same SKU exited or not  (all sku is different)
      const productSKU = await Product.findOne({
        where: {
          id: { [Op.ne]: productToBeUpdate.dataValues.id },
          sku: sku,
          is_deleted: "0",
        },
      });

      if (productSKU != null) {
        return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
      }
    } else {
      // check same SKU exited or not  (all sku is different)
      const productSKU = await Product.findOne({
        where: { sku: sku, is_deleted: "0" },
      });

      if (productSKU != null) {
        return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
      }
    }

    // slug create and same slug create then change the slug
    let slug = title.toLowerCase().replaceAll(" ", "-");
    const sameSlugCount = await Product.count({
      where: [
        columnValueLowerCase("slug", slug),
        { is_deleted: DeletedStatus.No },
      ],
    });

    if (sameSlugCount > 0) {
      slug = `${slug}-${sameSlugCount}`;
    }

    // check the valid tag

    const validTag = await validateProductTag({
      tag,
      oldTag:
        productToBeUpdate && productToBeUpdate.dataValues.tag
          ? productToBeUpdate.dataValues.tag
          : "",
    });

    if (validTag.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validTag;
    }

    // check the valid category

    const validPC = await validateProductCategories({
      categories: product_categories,
      id_product: id_product !== 0 ? id_product : null,
    });

    if (validPC.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validPC;
    }

    // check the valid brand

    if (
      id_brand &&
      id_brand != undefined &&
      id_brand != null &&
      id_brand != ""
    ) {
      const validBrand = await BrandData.findOne({
        where: { id: id_brand, is_deleted: DeletedStatus.No },
      });

      if (!(validBrand && validBrand.dataValues)) {
        return resNotFound({
          message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "Brand"],
          ]),
        });
      }
    }

    // check the valid collection

    const validCollection = await validateProductCollection({
      collection,
      oldCollection:
        productToBeUpdate && productToBeUpdate.dataValues.id_collection
          ? productToBeUpdate.dataValues.id_collection
          : "",
    });

    if (validCollection.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validCollection;
    }

    // check the valid size

    const validSize = await validateProductSize({
      size,
      oldSize:
        productToBeUpdate && productToBeUpdate.dataValues.size
          ? productToBeUpdate.dataValues.size
          : "",
    });

    if (validSize.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validSize;
    }

    // check the valid length

    const validLength = await validateProductLength({
      length,
      oldLength:
        productToBeUpdate && productToBeUpdate.dataValues.length
          ? productToBeUpdate.dataValues.length
          : "",
    });

    if (validLength.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validLength;
    }

    if (is_choose_setting === "1" && is_single === "1") {
      for (const pmo of product_metal_options) {
        if (
          pmo.is_deleted !== "1" &&
          !pmo.center_diamond_price &&
          pmo.center_diamond_price !== 0
        ) {
          return resBadRequest({
            message: PRODUCT_METAL_OPTIONS_CENTER_DIAMOND_PRICE_IS_REQUIRED,
          });
        }
      }
    }

    if (
      is_choose_setting === "1" &&
      (!setting_diamond_shapes || setting_diamond_shapes.length === 0)
    ) {
      return resBadRequest({ message: SETTING_DIAMOND_SHAPES_IS_REQUIRED });
    }

    if (setting_diamond_shapes && setting_diamond_shapes.length > 0) {
      const validShapes = await validateDiamondShapes({
        shapes: setting_diamond_shapes,
        oldShapes:
          productToBeUpdate &&
            productToBeUpdate.dataValues.setting_diamond_shapes
            ? productToBeUpdate.dataValues.setting_diamond_shapes
            : "",
      });

      if (validShapes.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return validShapes;
      }
    }

    let productId: any;
    const trn = await dbContext.transaction();
    // product add and edit process
    try {
      // product add and edit

      if (id_product == 0) {
        const resProduct = await Product.create(
          {
            name: title,
            sku: sku,
            additional_detail: additional_detail,
            sort_description: Short_Description,
            long_description: long_description,
            tag: tag.join("|"),
            slug: slug,
            making_charge,
            finding_charge,
            other_charge,
            id_collection:
              collection &&
                collection != null &&
                collection != undefined &&
                collection.length > 0
                ? collection.join("|")
                : null,
            id_brand:
              id_brand && id_brand != undefined && id_brand != null
                ? id_brand
                : null,
            product_type: SingleProductType.VariantType,
            discount_type:
              discount_type &&
                discount_type != null &&
                discount_type != undefined &&
                discount_type != ""
                ? discount_type
                : null,
            discount_value:
              discount_type &&
                discount_type != null &&
                discount_type != undefined &&
                discount_type != "" &&
                discount_value &&
                discount_value != null
                ? discount_type == DISCOUNT_TYPE.PAR
                  ? discount_value / 100
                  : discount_value
                : null,
            gender: gender && gender.length > 0 ? gender.join("|") : null,
            size: size && size.length > 0 ? size.join("|") : null,
            length: length && length.length > 0 ? length.join("|") : null,
            setting_style_type:
              settingStyleType && settingStyleType.length > 0
                ? settingStyleType.join("|")
                : null,
            is_active: ActiveStatus.Active,
            is_featured: FeaturedProductStatus.InFeatured,
            is_trending: TrendingProductStatus.InTrending,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
            quantity: quantity,
            retail_price: retail_price,
            compare_price: compare_price,
            is_quantity_track: is_quantity_track,
            is_choose_setting: is_choose_setting || "0",
            is_single: is_single || "0",
            setting_diamond_shapes:
              setting_diamond_shapes && setting_diamond_shapes.length > 0
                ? setting_diamond_shapes.join("|")
                : null,
            is_deleted: DeletedStatus.No,
          },
          { transaction: trn }
        );

        productId = resProduct.dataValues.id;
      } else {
        await Product.update(
          {
            name: title,
            sku: sku,
            additional_detail: additional_detail,
            sort_description: Short_Description,
            long_description: long_description,
            tag: tag.join("|"),
            slug: slug,
            making_charge,
            finding_charge,
            other_charge,
            id_collection:
              collection &&
                collection != null &&
                collection != undefined &&
                collection.length > 0
                ? collection.join("|")
                : null,
            id_brand:
              id_brand && id_brand != undefined && id_brand != null
                ? id_brand
                : null,
            product_type: SingleProductType.VariantType,
            discount_type:
              discount_type &&
                discount_type != null &&
                discount_type != undefined &&
                discount_type != ""
                ? discount_type
                : null,
            discount_value:
              discount_type &&
                discount_type != null &&
                discount_type != undefined &&
                discount_type != "" &&
                discount_value &&
                discount_value != null
                ? discount_type == DISCOUNT_TYPE.PAR
                  ? discount_value / 100
                  : discount_value
                : null,
            gender: gender && gender.length > 0 ? gender.join("|") : null,
            size: size && size.length > 0 ? size.join("|") : null,
            length: length && length.length > 0 ? length.join("|") : null,
            setting_style_type:
              settingStyleType && settingStyleType.length > 0
                ? settingStyleType.join("|")
                : null,
            is_featured: FeaturedProductStatus.InFeatured,
            is_trending: TrendingProductStatus.InTrending,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
            quantity: quantity,
            is_quantity_track: is_quantity_track,
            retail_price: retail_price,
            compare_price: compare_price,
            is_choose_setting: is_choose_setting,
            is_single: is_single,
            setting_diamond_shapes:
              setting_diamond_shapes && setting_diamond_shapes.length > 0
                ? setting_diamond_shapes.join("|")
                : null,
          },
          { where: { id: id_product }, transaction: trn }
        );

        productId = id_product;
      }

      // add and update  product category

      for (const productCategory of product_categories) {
        if (productCategory.id === 0) {
          await ProductCategory.create(
            {
              id_product: productId,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
              is_deleted: DeletedStatus.No,
            },
            { transaction: trn }
          );
        } else {
          await ProductCategory.update(
            {
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: productCategory.id }, transaction: trn }
          );
        }
      }

      // delete product category
      if (validPC.data.length > 0) {
        for (const productCategory of validPC.data) {
          await ProductCategory.update(
            {
              is_deleted: DeletedStatus.yes,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: productCategory.id }, transaction: trn }
          );
        }
      }

      // add and update and delete  product metal data
      let productMetalData: IProductVariantMetalData;
      let addVariantList = [];

      if (product_metal_options.length === 1) {
        if (
          product_metal_options[0].id == 0 &&
          (product_metal_options[0].id_metal == null ||
            product_metal_options[0].id_metal == undefined ||
            product_metal_options[0].id_metal == "")
        ) {
          await ProductImage.update(
            {
              is_deleted: DeletedStatus.yes,
            },
            {
              where: {
                id_product: productId,
                id_metal_tone: { [Op.not]: null },
              },
            }
          );
          const productMetalData = await ProductMetalOption.findAll({
            where: {
              id_product: productId,
              is_deleted: DeletedStatus.No,
              id_metal: { [Op.ne]: null },
            },
          });
          await ProductMetalOption.update(
            {
              is_deleted: DeletedStatus.yes,
            },
            { where: { id: productMetalData.map((t: any) => t.dataValues.id) } }
          );
        }
      } else {
        const productMetalData = await ProductMetalOption.findAll({
          where: { id_product: productId, is_deleted: DeletedStatus.No },
        });
        if (
          productMetalData.length == 1 &&
          (productMetalData[0].dataValues.id_metal == null ||
            productMetalData[0].dataValues.id_metal == undefined ||
            productMetalData[0].dataValues.id_metal == "") &&
          (productMetalData[0].dataValues.id_karat == null ||
            productMetalData[0].dataValues.id_karat == undefined ||
            productMetalData[0].dataValues.id_karat == "")
        ) {
          await ProductImage.update(
            {
              is_deleted: DeletedStatus.yes,
            },
            {
              where: {
                id_product: productId,
                id_metal_tone: { [Op.is]: null },
              },
            }
          );
        }
      }

      let stockChangeLogPayload = [];
      for (productMetalData of product_metal_options) {
        if (
          productMetalData.id == 0 &&
          productMetalData.is_deleted == DeletedStatus.No
        ) {
          addVariantList.push({
            id_product: productId,
            metal_weight: productMetalData.metal_weight,
            id_metal: productMetalData.id_metal,
            id_karat:
              productMetalData.id_karat &&
                productMetalData.id_karat != undefined
                ? productMetalData.id_karat
                : null,
            retail_price: productMetalData.retail_price,
            compare_price: productMetalData.compare_price,
            id_size:
              productMetalData.id_size && productMetalData.id_size != undefined
                ? productMetalData.id_size
                : null,
            id_length:
              productMetalData.id_length &&
                productMetalData.id_length != undefined
                ? productMetalData.id_length
                : null,
            quantity: productMetalData.quantity,
            side_dia_weight: productMetalData.side_dia_weight,
            side_dia_count: productMetalData.side_dia_count,
            remaing_quantity_count: productMetalData.quantity,
            id_m_tone: productMetalData.id_metal_tone,
            center_diamond_price: productMetalData.center_diamond_price
              ? Number(productMetalData.center_diamond_price)
              : null,
            is_deleted: DeletedStatus.No,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          });
        } else if (
          productMetalData.id != 0 &&
          productMetalData.is_deleted == DeletedStatus.No
        ) {
          let productMetal = await ProductMetalOption.findOne({
            where: { id: productMetalData.id, is_deleted: DeletedStatus.No },
            transaction: trn,
          });
          if (!(productMetal && productMetal.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
          }

          await ProductMetalOption.update(
            {
              id_product: productId,
              metal_weight: productMetalData.metal_weight,
              id_metal: productMetalData.id_metal,
              id_karat:
                productMetalData.id_karat &&
                  productMetalData.id_karat != undefined
                  ? productMetalData.id_karat
                  : null,
              retail_price: productMetalData.retail_price,
              compare_price: productMetalData.compare_price,
              id_size:
                productMetalData.id_size &&
                  productMetalData.id_size != undefined
                  ? productMetalData.id_size
                  : null,
              id_length:
                productMetalData.id_length &&
                  productMetalData.id_length != undefined
                  ? productMetalData.id_length
                  : null,
              quantity:
                productMetalData.quantity !=
                  productMetal.dataValues.remaing_quantity_count
                  ? Number(productMetal.dataValues.quantity) +
                  Number(productMetalData.quantity) -
                  Number(productMetal.dataValues.remaing_quantity_count)
                  : productMetal.dataValues.quantity,
              side_dia_weight: productMetalData.side_dia_weight,
              side_dia_count: productMetalData.side_dia_count,
              remaing_quantity_count: productMetalData.quantity,
              id_m_tone: productMetalData.id_metal_tone,
              center_diamond_price: productMetalData.center_diamond_price
                ? Number(productMetalData.center_diamond_price)
                : null,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: productMetalData.id }, transaction: trn }
          );

          if (
            is_quantity_track &&
            productMetal.dataValues.remaing_quantity_count !=
            productMetalData.quantity
          ) {
            stockChangeLogPayload.push({
              product_id: productId,
              variant_id: productMetalData.id,
              product_type: STOCK_PRODUCT_TYPE.Product,
              sku: sku,
              prev_quantity: productMetal.dataValues.remaing_quantity_count,
              new_quantity: productMetalData.quantity,
              transaction_type: STOCK_TRANSACTION_TYPE.StockUpdate,
              changed_by: req.body.session_res.id_app_user,
              email: null,
              change_date: getLocalDate(),
            });
          }
        } else if (
          productMetalData.id != 0 &&
          productMetalData.is_deleted == DeletedStatus.yes
        ) {
          console.log("----------------", 1234);
          let productMetal = await ProductMetalOption.findOne({
            where: { id: productMetalData.id, is_deleted: DeletedStatus.No },
            transaction: trn,
          });

          if (!(productMetal && productMetal.dataValues)) {
            await trn.rollback();
            return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
          }

          await ProductMetalOption.update(
            {
              is_deleted: DeletedStatus.yes,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: productMetalData.id }, transaction: trn }
          );
        }
      }

      if (addVariantList.length > 0) {
        const resCreatePmo = await ProductMetalOption.bulkCreate(
          addVariantList,
          {
            transaction: trn,
          }
        );
        for (const rcp of resCreatePmo) {
          if (is_quantity_track) {
            stockChangeLogPayload.push({
              product_id: productId,
              variant_id: rcp.dataValues.id,
              product_type: STOCK_PRODUCT_TYPE.Product,
              sku: sku,
              prev_quantity: 0,
              new_quantity: productMetalData.quantity,
              transaction_type: STOCK_TRANSACTION_TYPE.StockUpdate,
              changed_by: req.body.session_res.id_app_user,
              email: null,
              change_date: getLocalDate(),
            });
          }
        }
      }

      if (stockChangeLogPayload.length > 0) {
        await StockChangeLog.bulkCreate(stockChangeLogPayload, {
          transaction: trn,
        });
      }
      // add  diamond details

      if (product_diamond_options && product_diamond_options.length > 0) {
        let pdod;

        for (pdod of product_diamond_options) {
          let diamondGroup = await DiamondGroupMaster.findOne({
            where: {
              id_stone: pdod.id_stone,
              id_shape: pdod.id_shape,
              id_mm_size: pdod.id_mm_size,
              id_color: pdod.id_color,
              id_clarity: pdod.id_clarity,
              id_cuts: pdod.id_cuts,
              is_deleted: "0",
            },
            transaction: trn,
          });

          if (pdod.id === 0) {
            await ProductDiamondOption.create(
              {
                id_product: productId,
                id_diamond_group:
                  diamondGroup && diamondGroup.dataValues
                    ? diamondGroup.dataValues.id
                    : null,
                id_type: pdod.id_type,
                id_setting: pdod.id_setting,
                weight:
                  pdod.weight && pdod.weight != undefined ? pdod.weight : null,
                count:
                  pdod.count && pdod.count != undefined ? pdod.count : null,
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_cut: pdod.id_cuts,
                is_default: pdod.is_default,
                created_date: getLocalDate(),
                created_by: req.body.session_res.id_app_user,
                is_deleted: pdod.is_deleted,
              },
              { transaction: trn }
            );
          } else {
            let diamondOption = await ProductDiamondOption.findOne({
              where: { id: pdod.id, is_deleted: DeletedStatus.No },
              transaction: trn,
            });

            if (!(diamondOption && diamondOption.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_DIAMOND_OPTION_NOT_FOUND });
            }

            await ProductDiamondOption.update(
              {
                id_product: productId,
                id_diamond_group:
                  diamondGroup && diamondGroup.dataValues
                    ? diamondGroup.dataValues.id
                    : null,
                id_type: pdod.id_type,
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_cut: pdod.id_cuts,
                id_setting: pdod.id_setting,
                weight:
                  pdod.weight && pdod.weight != undefined ? pdod.weight : null,
                count:
                  pdod.count && pdod.count != undefined ? pdod.count : null,
                is_default: pdod.is_default,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pdod.is_deleted,
              },

              { where: { id: pdod.id, is_deleted: "0" }, transaction: trn }
            );
          }
        }
      }

      await trn.commit();
      return resSuccess();
    } catch (error) {
      console.log("----------------", error);

      await trn.rollback();
      return resUnknownError({ data: error });
    }
  } catch (error) {
    console.log("----------------", error);

    throw error;
  }
};

// get all image name based on zip file

export const getAllProductImageNamePublicAPI = async (req: Request) => {
  try {
    const { sku, images } = req.body;

    const product = await Product.findOne({
      where: { sku: sku, is_deleted: DeletedStatus.No },
    });

    const productImages = await ProductImage.findAll({
      where: {
        id_product: product.dataValues.id,
        is_deleted: DeletedStatus.No,
      },
    });
    const metalTones = await MetalTone.findAll({
      where: { is_deleted: DeletedStatus.No },
    });
    let result = [];
    if (product && product.dataValues) {
      for (const tone of metalTones) {
        const filteredImages = images.filter((img) =>
          img
            .toLowerCase()
            .includes(`-${tone.dataValues.sort_code.toLowerCase()}`)
        );
        for (let image of filteredImages) {
          const findImage = productImages.find(
            (img) => img.dataValues.image_path === image
          );

          if (!(findImage && findImage.dataValues)) {
            result.push({
              id_metal_tone: tone.dataValues.id,
              id_product: product.dataValues.id,
              image_path: image,
              image_type: image.toLowerCase().includes(".mp4")
                ? PRODUCT_IMAGE_TYPE.Video
                : image.toLowerCase().includes(".glb")
                  ? PRODUCT_IMAGE_TYPE.GLB
                  :image.toLocaleLowerCase().includes("-meta") ? PRODUCT_IMAGE_TYPE.SEO : PRODUCT_IMAGE_TYPE.Feature,
              is_deleted: DeletedStatus.No,
              created_date: getLocalDate(),
              created_by: null,
            });
          }
        }
      }
    }

    const otherImages = images.filter(
      (img) => !result.map((t) => t.image_path).includes(img)
    );

    if (otherImages.length > 0) {
      for (let image of otherImages) {
        result.push({
          id_metal_tone: null,
          id_product: product.dataValues.id,
          image_path: image,
          image_type: image.toLowerCase().includes(".mp4")
            ? PRODUCT_IMAGE_TYPE.Video
            : image.toLowerCase().includes(".glb")
              ? PRODUCT_IMAGE_TYPE.GLB
              : image.toLocaleLowerCase().includes("-meta") ? PRODUCT_IMAGE_TYPE.SEO : PRODUCT_IMAGE_TYPE.Image,
          is_deleted: DeletedStatus.No,
          created_date: getLocalDate(),
          created_by: null,
        });
      }
    }
    if (result.length > 0) {
      await ProductImage.bulkCreate(result);
    }
    await refreshMaterializedProductListView(dbContext);
    return resSuccess({ data: result });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllProductSlug = async () => {
  try {
    const result = await Product.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
      },
      attributes: ["slug"],
    });

    return resSuccess({ data: result.map((t) => t.dataValues.slug) });
  } catch (error) {
    throw error;
  }
};

export const similarProductList = async (req: Request) => {
  try {
    const {
      category = false,
      sub_category = false,
      collection = false,
      setting_style = false,
      metal_tone = false,
      gender = false,
      limit = 10,
    } = req.query;
    const { slug } = req.params;

    const product = await Product.findOne({
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "id_brand",
        "additional_detail",
        [
          Sequelize.literal(
            `CASE WHEN "gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gender", '|')::int[] END`
          ),
          "gender",
        ],
        "sort_description",
        "long_description",
        "making_charge",
        "finding_charge",
        "other_charge",
        "product_type",
        "discount_type",
        "discount_value",
        "is_featured",
        "is_trending",
        "is_quantity_track",
        "retail_price",
        "compare_price",
        "quantity",
        [
          Sequelize.literal(
            `CASE WHEN "products"."id_collection" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."id_collection", '|')::int[] END`
          ),
          "id_collection",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."tag" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."tag", '|')::int[] END`
          ),
          "tag",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."size" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."size", '|')::int[] END`
          ),
          "size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."length" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."length", '|')::int[] END`
          ),
          "length",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "products"."setting_style_type" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."setting_style_type", '|')::int[] END`
          ),
          "setting_style_type",
        ],
        "is_single",
        "is_choose_setting",
        [
          Sequelize.literal(
            `CASE WHEN "products"."setting_diamond_shapes" IS NULL THEN '{}'::int[] ELSE string_to_array("products"."setting_diamond_shapes", '|')::int[] END`
          ),
          "setting_diamond_shapes",
        ],
      ],
      where: {
        slug: slug,
        is_deleted: DeletedStatus.No,
      },
      include: [
        {
          required: false,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [
            "id",
            "id_metal_group",
            "metal_weight",
            "id_metal",
            "retail_price",
            "compare_price",
            "id_size",
            "id_m_tone",
            "id_length",
            [Sequelize.literal('"PMO"."remaing_quantity_count"'), "quantity"],
            "side_dia_weight",
            "side_dia_count",
            "id_m_tone",
            [
              Sequelize.literal(
                `CASE WHEN "PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("PMO"."id_metal_tone", '|')::int[] END`
              ),
              "metal_tone",
            ],
            "center_diamond_price",
            "id_karat",
            "is_default",
            "is_deleted",
          ],
          where: { is_deleted: DeletedStatus.No },
        },
        {
          required: false,
          model: ProductDiamondOption,
          as: "PDO",
          attributes: [
            "id",
            "id_diamond_group",
            "id_type",
            "id_setting",
            "weight",
            "count",
            "is_default",
            "id_stone",
            "id_shape",
            "id_mm_size",
            "id_color",
            "id_clarity",
            "id_cut",
          ],

          where: { is_deleted: DeletedStatus.No },
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
          where: { is_deleted: DeletedStatus.No },
        },
      ],
    });

    if (!(product && product.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const similarProduct = await dbContext.query(
      `SELECT PROD.* FROM (SELECT
    	PRODUCTS.ID,
    	PRODUCTS.NAME,
    	PRODUCTS.SKU,
    	PRODUCTS.SLUG,
    	PRODUCTS.SORT_DESCRIPTION,
    	PRODUCTS.DISCOUNT_TYPE,
    	PRODUCTS.DISCOUNT_VALUE,
    	PRODUCTS.SETTING_STYLE_TYPE,
    	PRODUCTS.PRODUCT_TYPE,
    	PRODUCTS.GENDER,
    	PRODUCTS.MAKING_CHARGE,
    	PRODUCTS.FINDING_CHARGE,
    	PRODUCTS.OTHER_CHARGE,
    	PRODUCTS.created_date,
      CASE WHEN PRODUCTS.SIZE IS NULL THEN '{}'::int[] ELSE string_to_array(PRODUCTS.SIZE, '|')::int[] END AS product_size,
      CASE WHEN PRODUCTS.LENGTH IS NULL THEN '{}'::int[] ELSE string_to_array(PRODUCTS.LENGTH, '|')::int[] END AS product_length,
    	JSONB_AGG(
    	DISTINCT JSONB_BUILD_OBJECT(
    			'id',
    			PRODUCT_IMAGES.ID,
    			'image_path',
    			CONCAT(
    				'${IMAGE_PATH}/',
    				PRODUCT_IMAGES.IMAGE_PATH
    			),
    			'id_metal_tone',
    			PRODUCT_IMAGES.ID_METAL_TONE,
    			'image_type',
    			PRODUCT_IMAGES.IMAGE_TYPE
    		)
    	) AS PRODUCT_IMAGES,

    			JSONB_AGG(
    			DISTINCT JSONB_BUILD_OBJECT(
    					'id',
    					PMO.ID,
    					'id_metal',
    					PMO.ID_METAL,
    					'id_karat',
    					PMO.ID_KARAT,
    					'id_size',
    					PMO.ID_SIZE,
    					'id_length',
    					PMO.ID_LENGTH,
    					'side_dia_weight',
    					PMO.SIDE_DIA_WEIGHT,
    					'side_dia_count',
    					PMO.SIDE_DIA_COUNT,
    					'id_m_tone',
    					PMO.ID_M_TONE,
              'quantity',
    					PMO.remaing_quantity_count,
    					'wishlist_id',
    					(
    						SELECT
    							ID
    						FROM
    							WISHLIST_PRODUCTS
    						WHERE
    							PRODUCT_ID = PMO.ID_PRODUCT
    							AND PRODUCT_TYPE = ${AllProductTypes.Product}
    							AND VARIANT_ID = PMO.ID
    							AND USER_ID = ${req.query.user_id &&
        req.query.user_id != "" &&
        req.query.user_id != undefined &&
        req.query.user_id != null &&
        req.query.user_id != "null"
        ? req.query.user_id
        : 0
      }
    						LIMIT
    							1
    					),
    					'metal_tone',
    					CASE
    						WHEN PMO.ID_METAL_TONE IS NULL THEN '{}'::INT[]
    						ELSE STRING_TO_ARRAY(PMO.ID_METAL_TONE, '|')::INT[]
    					END,
    					'gold_karat',
    					GOLD_KTS.NAME,
    					'Price',
    					CASE
    						WHEN PRODUCTS.PRODUCT_TYPE = 2
                  THEN CASE WHEN '${req.query.is_choose_setting}'='1'
                        THEN PMO.retail_price - COALESCE(PMO.center_diamond_price,0)
                        ELSE PMO.RETAIL_PRICE
                      END
    						ELSE CASE
    							WHEN ID_KARAT IS NULL THEN (
    								METAL_MASTER.METAL_RATE * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
                          COALESCE(sum_price.sum_price, 0)
    								)
    							)
    							ELSE (
    								METAL_MASTER.METAL_RATE / 31.104 * GOLD_KTS.NAME / 24 * PMO.METAL_WEIGHT + PRODUCTS.MAKING_CHARGE + PRODUCTS.FINDING_CHARGE + PRODUCTS.OTHER_CHARGE + (
                        COALESCE(sum_price.sum_price, 0)
    								)
    							)
    						END
    					END
    				)
    			)
     AS PMO
    FROM
    	PRODUCTS
    	LEFT JOIN PRODUCT_IMAGES ON PRODUCT_IMAGES.ID_PRODUCT = PRODUCTS.ID
    	AND PRODUCT_IMAGES.IS_DELETED = '${DeletedStatus.No}'
    	AND PRODUCT_IMAGES.IMAGE_TYPE IN (${PRODUCT_IMAGE_TYPE.Feature})
    	LEFT JOIN product_categories  ON product_categories.id_product = products.id  AND product_categories.is_deleted = '${DeletedStatus.No
      }'
    	LEFT JOIN PRODUCT_METAL_OPTIONS AS PMO ON PMO.ID_PRODUCT = PRODUCTS.ID AND PMO.IS_DELETED = '${DeletedStatus.No
      }'
    	LEFT JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal
        LEFT JOIN gold_kts ON gold_kts.id = PMO.id_karat
    	LEFT JOIN PRODUCT_DIAMOND_OPTIONS AS PDO ON PDO.ID_PRODUCT = PRODUCTS.ID AND PDO.IS_DELETED = '${DeletedStatus.No
      }'
    	AND PDO.IS_DELETED = '${DeletedStatus.No}'
    	LEFT JOIN DIAMOND_GROUP_MASTERS AS DGM ON DGM.ID = PDO.ID_DIAMOND_GROUP
    	CROSS JOIN LATERAL (
            SELECT
                SUM(DGM.RATE * PDO.WEIGHT * PDO.COUNT) AS sum_price
            FROM
                PRODUCT_DIAMOND_OPTIONS PDO
            LEFT JOIN
                DIAMOND_GROUP_MASTERS DGM ON DGM.ID = PDO.ID_DIAMOND_GROUP
            WHERE
                PDO.ID_PRODUCT = PRODUCTS.ID
                AND PDO.IS_DELETED = '${DeletedStatus.No}'
                AND (PDO.id_type=2 OR '${req.query.is_choose_setting}' != '1')
        ) AS sum_price
         WHERE PRODUCTS.IS_DELETED = '${DeletedStatus.No
      }' AND PRODUCTS.IS_ACTIVE = '${ActiveStatus.Active
      }' AND PRODUCTs.ID != ${product.dataValues.id}
         ${category.toString() == "true"
        ? `AND product_categories.id_category = ${product.dataValues.product_categories[0].dataValues.id_category}`
        : ``
      }
         ${sub_category.toString() == "true"
        ? `AND product_categories.id_sub_category = ${product.dataValues.product_categories[0].dataValues.id_sub_category}`
        : ``
      }
        ${collection.toString() == "true"
        ? `AND string_to_array(id_collection, '|')::int[] && ARRAY[${product.dataValues.id_collection.join(
          ","
        )}]`
        : ``
      }
        ${setting_style.toString() == "true"
        ? `AND string_to_array(setting_style_type, '|')::int[] && ARRAY[${product.dataValues.setting_style_type.join(
          ","
        )}]`
        : ``
      }
        ${gender.toString() == "true"
        ? `AND string_to_array(gender, '|')::int[] && ARRAY[${product.dataValues.gender.join(
          ","
        )}]`
        : ``
      }
        GROUP BY PRODUCTS.ID
        
        ${metal_tone.toString() == "true"
        ? `HAVING SUM(CASE WHEN string_to_array(PMO.id_metal_tone, '|')::int[] && ARRAY[${product.dataValues.PMO[0].dataValues.metal_tone.join(
          ","
        )}] THEN 1 ELSE 0 END) > 0 `
        : ``
      }
         
    ) AS PROD
    ORDER BY PROD.created_date DESC
   LIMIT ${Number(limit)}`,
      { type: QueryTypes.SELECT }
    );

    return resSuccess({ data: similarProduct });
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleProducts = async (req: Request) => {
  try {
    const { product_sku } = req.body;

    await Product.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: {
          sku: {
            [Op.in]: product_sku,
          },
        },
      }
    );

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForMultipleProducts = async (req: Request) => {
  try {
    const { product_sku, is_active } = req.body;

    await Product.update(
      {
        is_active: is_active,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: {
          sku: {
            [Op.in]: product_sku,
          },
        },
      }
    );

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const withoutVariantProductExport = async (req: Request) => {
  try {
    const products = await dbContext.query(
      `SELECT 
1 as id_parent,
main_cat.category_name as category,
sub_cat.category_name as sub_category,
sub_sub_cat.category_name as sub_sub_category,
product.name as title,
product.sku as sku,
brands.name as brand,

(SELECT STRING_AGG(name, ' | ')  as name FROM collections WHERE id IN (
        SELECT UNNEST(STRING_TO_ARRAY(REPLACE(product.id_collection, '|', ','), ','))::INTEGER
        )) as collection,
		
REPLACE(REPLACE(REPLACE(gender, '1', 'male'), '2', 'female'),'3', 'unisex') as gender,

(SELECT STRING_AGG(name, ' | ')  as name FROM tags WHERE id IN (
        SELECT UNNEST(STRING_TO_ARRAY(REPLACE(product.tag, '|', ','), ','))::INTEGER
        )) as tag,

product.sort_description as short_description,
product.long_description as long_description,
(SELECT STRING_AGG(name,  '|') as name FROM setting_styles WHERE id IN (
        SELECT UNNEST(STRING_TO_ARRAY(REPLACE(setting_style_type, '|', ','), ','))::INTEGER
        )) as setting_style_type,
		
is_quantity_track as quantity_track,

(SELECT STRING_AGG(items_sizes.size, '|') as name FROM items_sizes WHERE id IN (
        SELECT UNNEST(STRING_TO_ARRAY(REPLACE(product.size, '|', ','), ','))::INTEGER
        )) as size,
		
(SELECT STRING_AGG(items_lengths.length, '|') as name FROM items_lengths WHERE id IN (
        SELECT UNNEST(STRING_TO_ARRAY(REPLACE(product.length, '|', ','), ','))::INTEGER
        )) as length,
		
metal.name as metal,
karat.name as karat,
tone.sort_code as metal_tone,
PMO.metal_weight as metal_weight,
PMO.quantity as quantity,
PMO.side_dia_weight as side_dia_weight,
PMO.side_dia_count as side_dia_count,
PMO.retail_price as retail_price,
PMO.compare_price as compare_price,

CASE WHEN id_type = 1 THEN 'centre' WHEN id_type = 2 THEN 'side'  END as stone_type,
stone.name as stone,
NULL as stone_category,
NULL as certification,
shape.name as shape,
mm_sizes.value as mm_size,
colors.value as color,
clarity.value as clarity,
cut.value as cut,
setting.name as stone_setting,
PDO.weight as stone_weight,
PDO.count as stone_count,
additional_detail,
NULL as media

FROM products as product
LEFT JOIN product_metal_options as PMO  ON product.id = PMO.id_product
LEFT JOIN metal_masters as metal ON metal.id = PMO.id_metal
LEFT JOIN gold_kts as karat ON karat.id = PMO.id_karat
LEFT JOIN metal_tones as tone ON tone.id = PMO.id_m_tone
LEFT JOIN product_categories as PC ON pc.id_product = product.id
LEFT JOIN categories as main_cat ON main_cat.id = PC.id_category
LEFT JOIN categories as sub_cat ON sub_cat.id = PC.id_sub_category
LEFT JOIN categories as sub_sub_cat ON sub_sub_cat.id = PC.id_sub_sub_category
LEFT JOIN brands ON brands.id = product.id_brand
LEFT JOIN product_diamond_options AS PDO ON PDO.id_product = product.id
LEFT JOIN diamond_group_masters AS DGM ON DGM.id = id_diamond_group
LEFT JOIN gemstones AS stone ON stone.id = DGM.id_stone
LEFT JOIN diamond_shapes AS shape ON shape.id = DGM.id_shape
LEFT JOIN mm_sizes AS mm_sizes ON mm_sizes.id = DGM.id_mm_size
LEFT JOIN colors AS colors ON colors.id = DGM.id_color
LEFT JOIN clarities AS clarity ON clarity.id = DGM.id_color
LEFT JOIN cuts AS cut ON cut.id = DGM.id_cuts
LEFT JOIN setting_styles as setting ON setting.id = id_setting
WHERE product.product_type = ${SingleProductType.VariantType} AND
product.is_deleted = '${DeletedStatus.No}' 
GROUP BY main_cat.category_name,sub_cat.category_name,
sub_sub_cat.category_name, product.id,brands.name,metal.name,karat.name,
tone.sort_code,PMO.id,PDO.id,stone.name,shape.name,mm_sizes.value,colors.value,
clarity.value,cut.value,setting.name
HAVING COUNT(PMO.id) = 1 AND COUNT(PDO.id) <= 1
ORDER BY product.id DESC`,
      { type: QueryTypes.SELECT }
    );
    return resSuccess({ data: products });
  } catch (error) {
    throw error;
  }
};
