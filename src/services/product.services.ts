import { Request } from "express";
import { Model, Op, QueryTypes, Sequelize } from "sequelize";
import dbContext from "../config/db-context";
import categoryData from "../model/category.model";
import Product from "../model/product.model";
import fs from "fs";
import {
  ATTRIBUTE_NOT_FOUND,
  CATEGORY_NOT_FOUND,
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
  SETTING_STYLE_TYPE_NOT_FOUND,
  SETTING_TYPE_IS_REQUIRED,
  SIZE_NOT_FOUND,
  TAG_NOT_FOUND,
  UNPROCESSABLE_ENTITY_CODE,
  VIDEOS_NOT_FOUND,
  VIDEO_NOT_FOUND,
} from "../utils/app-messages";
import {
  getDecryptedText,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
  roundDecimalNumber,
} from "../utils/shared-functions";
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
} from "../data/interfaces/common/common.interface";
import {
  ActiveStatus,
  FeaturedProductStatus,
  IMAGE_TYPE,
  METAL_RATE_FORMULA,
  PRODUCT_IMAGE_TYPE,
  SYSTEM_CONFIGURATIONS_KEYS,
  TrendingProductStatus,
} from "../utils/app-enumeration";
import {
  PRODUCT_FILE_LOCATION,
  PRODUCT_PER_PAGE_ROW,
  RATE_CONFIG_KEY_LIST,
  RATE_PRICE_DECIMAL_POINT,
} from "../utils/app-constants";
import ProductCategory from "../model/product-category.model";
import Tag from "../model/master/attributes/tag.model";
import SettingType from "../model/master/attributes/settingType.model";
import MetalGroupMaster from "../model/master/attributes/metal/metal-group-master.model";
import ProductMetalOption from "../model/product-metal-option.model";
import SystemConfiguration from "../model/system-configuration.model";
import { fetchConfigurationByKey } from "./auth.service";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import ProductDiamondOption from "../model/product-diamond-option.model";
import SettingCaratWeight from "../model/master/attributes/settingCaratWeight.model";
import ItemSizeData from "../model/master/attributes/item-size.model";
import ItemLengthData from "../model/master/attributes/item-length.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import { Multer } from "multer";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../helpers/file.helper";
import Image from "../model/image.model";
import { TImageType } from "../data/types/common/common.type";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import ProductImage from "../model/product-image.model";
import ProductVideo from "../model/product-video.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import ProductWish from "../model/produc-wish-list.model";
import CartProducts from "../model/cart-product.model";

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
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "sort_description",
        "long_description",
        "is_featured",
        "is_active",
        "is_trending",
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
          attributes: ["id", "id_metal_group", "metal_weight"],
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
        "is_featured",
        "is_trending",
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
            [
              Sequelize.literal(
                `CASE WHEN "PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("PMO"."id_metal_tone", '|')::int[] END`
              ),
              "metal_tone",
            ],
            "id_karat",
            "is_default",
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

    const metalTone = findProduct?.dataValues.PMO.map(
      (t: any) => t.dataValues.metal_tone
    );

    // console.log(metals.flat().map((t: any) => t))
    const metal_tone = await MetalTone.findAll({
      where: { id: metalTone.flat().map((t: any) => t) },
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

  const validateStyleType = await SettingType.findAll({
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

  const validateSize = await ItemSizeData.findAll({
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

  const validateLength = await ItemLengthData.findAll({
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

    const resVPFRD = await validateProductFileReqData(
      id_product,
      id_metal_tone,
      image_type,
      true
    );
    if (resVPFRD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVPFRD;
    }
    sku = resVPFRD.data;

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
            id_metal_tone: id_metal_tone,
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
      attributes: ["id", "name", "sku"],
      include: [
        {
          required: false,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [
            "id",
            "id_metal_group",
            "metal_weight",
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
    let metalGroup = products.dataValues.PMO.flat().map(
      (value: any) => value.dataValues.metalTone
    );

    const metalTones = metalGroup.flat().map((value: any) => value);

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

export const productListUserSide = async (req: Request) => {
  try {
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    pagination.per_page_rows = PRODUCT_PER_PAGE_ROW;

    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      req.query.setting_type
        ? {
            [Op.or]: [
              {
                setting_style_type: {
                  [Op.iLike]: "%" + req.query.setting_type + "%",
                },
              },
            ],
          }
        : {},
      req.query.gender
        ? {
            [Op.or]: [{ gender: { [Op.iLike]: "%" + req.query.gender + "%" } }],
          }
        : {},
      req.query.metal_tone
        ? Sequelize.where(
            Sequelize.literal(
              `(SELECT COUNT(*) FROM product_metal_options WHERE id_product = products.id AND id_metal_tone LIKE  '%${req.query.metal_tone}%')`
            ),
            ">",
            "0"
          )
        : {},
      req.query.diamond_shape
        ? Sequelize.where(
            Sequelize.literal(
              `(SELECT COUNT(*) FROM product_diamond_options AS PDO LEFT OUTER JOIN diamond_group_masters ON PDO.id_diamond_group = diamond_group_masters.id WHERE PDO.id_product = products.id AND diamond_group_masters.id_shape = ${req.query.diamond_shape})`
            ),
            ">",
            "0"
          )
        : {},
      req.query.product_categoty
        ? Sequelize.where(
            Sequelize.literal(
              `(SELECT COUNT(*) FROM  product_categories  LEFT OUTER JOIN categories ON categories.id = product_categories.id_category OR categories.id = product_categories.id_sub_category OR categories.id = product_categories.id_sub_sub_category WHERE product_categories.id_product = products.id AND categories.category_name ILIKE '%${req.query.product_categoty}%')`
            ),
            ">",
            "0"
          )
        : {},
      req.query.min_price && req.query.max_price
        ? Sequelize.where(
            Sequelize.literal(`(SELECT COUNT(*) FROM products 
      LEFT OUTER JOIN product_metal_options AS PMO ON PMO.id_product = products.id
      LEFT OUTER JOIN metal_masters ON PMO.id_metal = metal_masters.id 
      LEFT OUTER JOIN gold_kts ON PMO.id_karat = gold_kts.id 
      LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id 
      LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group 
      WHERE PMO.id_product = products.id AND PDO.id_product = products.id AND 
      CASE WHEN PMO.id_karat IS NULL THEN  metal_masters.metal_rate*PMO.metal_weight+DGM.rate*PDO.weight+products.making_charge+products.finding_charge+products.other_charge
      BETWEEN ${req.query.min_price} AND ${req.query.max_price} 
      ELSE metal_masters.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+DGM.rate*PDO.weight+making_charge+finding_charge+other_charge BETWEEN ${req.query.min_price} AND ${req.query.max_price}  END
       )`),
            ">",
            "0"
          )
        : {},
    ];
    let include = [
      {
        required: false,
        model: ProductImage,
        as: "product_images",
        attributes: ["image_path", "id_metal_tone"],
        where: { image_type: PRODUCT_IMAGE_TYPE.Feature },
      },
      {
        required: true,
        model: ProductMetalOption,
        as: "PMO",
        attributes: [
          "id_metal",

          // [Sequelize.literal(`CASE WHEN "PMO"."id_karat" IS NULL THEN CASE WHEN "PDO"."id" IS NULL THEN  ("PMO->metal_master"."metal_rate"*"PMO"."metal_weight"+"making_charge"+"finding_charge"+"other_charge") ELSE ("PMO->metal_master"."metal_rate"*"PMO"."metal_weight"+"making_charge"+"finding_charge"+"other_charge"+"PDO->rate"."rate"*"PDO"."weight") END ELSE CASE WHEN "PDO"."id" IS null THEN ("PMO->metal_master"."metal_rate"/31.104*"PMO->metal_karat"."name"/24*"PMO"."metal_weight"+"making_charge"+"finding_charge"+"other_charge") ELSE ("PMO->metal_master"."metal_rate"/31.104*"PMO->metal_karat"."name"/24*"PMO"."metal_weight"+"making_charge"+"finding_charge"+"other_charge"+"PDO->rate"."rate"*"PDO"."weight") END END`), "Price"],
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
          { is_deleted: "0" },
          req.query.metal_id
            ? Sequelize.where(Sequelize.literal('"PMO"."id_metal"'), {
                [Op.eq]: req.query.metal_id,
              })
            : {},
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
    ];
    const totalItems = await (<any>Product.findAndCountAll(<any>{
      where,
      include,
    }));

    if (totalItems.rows.length === 0) {
      return resSuccess({ data: { pagination, productList: [] } });
    }
    pagination.total_items = totalItems.rows.length;
    pagination.total_pages = Math.ceil(
      totalItems.rows.length / pagination.per_page_rows
    );

    const productList = await Product.findAll(<any>{
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [
        [pagination.sort_by, pagination.order_by],
        [{ model: ProductMetalOption, as: "PMO" }, "id_metal", "ASC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_karat", "ASC"],
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
            `(SELECT COUNT(*) from wishlist_products where user_id = ${
              req.query.user_id && req.query.user_id != ""
                ? req.query.user_id
                : 0
            } AND product_id = products.id)`
          ),
          "is_wishlist",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gender", '|')::int[] END`
          ),
          "gender",
        ],
        // "setting_style_type",
        //[Sequelize.literal('"PDO->rate->shapes"."id"'), "diamond_shape_id"],
        // [Sequelize.literal('"PDO->rate"."rate"*"PDO"."weight"'), "diamond_price"],
      ],
      include,
    });

    return resSuccess({ data: { pagination, productList } });
  } catch (error) {
    throw error;
  }
};

export const productGetByIdUserSide = async (req: Request) => {
  const { slug, user_id } = req.body;

  try {
    let where = [{ slug: slug }, { is_active: "1" }, { is_deleted: "0" }];

    const products = await Product.findOne({
      where,
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
        [
          Sequelize.literal(
            `(SELECT  AVG(product_reviews.rating) FROM product_reviews WHERE product_reviews.product_id = "id")`
          ),
          "rating",
        ],
        [
          Sequelize.literal(
            `(SELECT COUNT(*) from wishlist_products where user_id = ${
              user_id && user_id != "" ? user_id : 0
            } AND product_id = products.id)`
          ),
          "is_wishlist",
        ],

        [
          Sequelize.literal(
            `(SELECT SUM (product_diamond_options.weight)  FROM products LEFT OUTER JOIN product_diamond_options ON product_diamond_options.id_product = products.id WHERE products.slug = '${slug}' GROUP BY products.id)`
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
      ],
      include: [
        {
          required: false,
          model: ProductImage,
          as: "product_images",
          attributes: [
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
            "id_metal",
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
                `(SELECT CASE WHEN "PMO"."id_karat" IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" ELSE products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" AND PMO.id_karat = "PMO"."id_karat" END GROUP BY metal_master.metal_rate, PMO.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name)`
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
          attributes: ["id", "id_diamond_group", "weight"],
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

    const size = await ItemSizeData.findAll({
      where: { id: products.dataValues.size },
      attributes: ["id", "size"],
    });

    const length = await ItemLengthData.findAll({
      where: { id: products.dataValues.length },
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
      where: { id: metalTone.flat().map((t: any) => t) },
      attributes: [
        "id",
        "name",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const metal_karat = await GoldKarat.findAll({
      where: { id: karat.flat().map((t: any) => t) },
      attributes: [
        "id",
        "name",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    const metals = await MetalMaster.findAll({
      where: { id: metal.flat().map((t: any) => t) },
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
    });

    const center_diamond_details = await dbContext.query(
      `SELECT gemstones.name as diamond, diamond_shapes.name as shape,  mm_sizes.value as MM_size, colors.value as diamond_color, clarities.value as diamond_clarity, cuts.value as diamond_cut, product_diamond_options.weight FROM products LEFT OUTER JOIN product_diamond_options ON product_diamond_options.id_product = products.id LEFT OUTER JOIN diamond_group_masters ON product_diamond_options.id_diamond_group = diamond_group_masters.id LEFT OUTER JOIN gemstones ON diamond_group_masters.id_stone = gemstones.id LEFT OUTER JOIN diamond_shapes ON diamond_group_masters.id_shape = diamond_shapes.id LEFT OUTER JOIN mm_sizes ON diamond_group_masters.id_mm_size = mm_sizes.id LEFT OUTER JOIN colors ON diamond_group_masters.id_color = colors.id LEFT OUTER JOIN clarities ON diamond_group_masters.id_clarity = clarities.id LEFT OUTER JOIN cuts ON diamond_group_masters.id_cuts = cuts.id WHERE products.slug = '${slug}' AND product_diamond_options.id_type = 1`,
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
    const productList = await Product.findAll({
      where: [
        { is_active: ActiveStatus.Active },
        { is_deleted: "0" },
        { is_featured: FeaturedProductStatus.Featured },
      ],
      order: [
        ["id", "DESC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_metal", "ASC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_karat", "ASC"],
        [{ model: ProductImage, as: "product_images" }, "image_path", "DESC"],
      ],
      attributes: [
        "id",
        "name",
        "sku",
        "sort_description",
        "long_description",
        "slug",
        "making_charge",
        "finding_charge",
        "other_charge",
        [
          Sequelize.literal(
            `CASE WHEN "gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gender", '|')::int[] END`
          ),
          "gender",
        ],
        // "setting_style_type",
        //[Sequelize.literal('"PDO->rate->shapes"."id"'), "diamond_shape_id"],
        // [Sequelize.literal('"PDO->rate"."rate"*"PDO"."weight"'), "diamond_price"],
      ],
      include: [
        {
          required: false,
          model: ProductImage,
          as: "product_images",
          attributes: ["image_path", "id_metal_tone"],
          where: { image_type: PRODUCT_IMAGE_TYPE.Feature },
        },
        {
          required: true,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [
            "id_metal",
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
            { is_deleted: "0" },
            req.query.metal_id
              ? Sequelize.where(Sequelize.literal('"PMO"."id_metal"'), {
                  [Op.eq]: req.query.metal_id,
                })
              : {},
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

    return resSuccess({ data: productList });
  } catch (error) {
    throw error;
  }
};

export const trendingProductListUserSide = async (req: Request) => {
  try {
    const productList = await Product.findAll({
      where: [
        { is_active: ActiveStatus.Active },
        { is_deleted: "0" },
        { is_trending: TrendingProductStatus.Trending },
      ],
      order: [
        ["id", "DESC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_metal", "ASC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_karat", "ASC"],
        [{ model: ProductImage, as: "product_images" }, "image_path", "DESC"],
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "sku",
        "sort_description",
        "long_description",
        "making_charge",
        "finding_charge",
        "other_charge",
        [
          Sequelize.literal(
            `CASE WHEN "gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gender", '|')::int[] END`
          ),
          "gender",
        ],
        // "setting_style_type",
        //[Sequelize.literal('"PDO->rate->shapes"."id"'), "diamond_shape_id"],
        // [Sequelize.literal('"PDO->rate"."rate"*"PDO"."weight"'), "diamond_price"],
      ],
      include: [
        {
          required: false,
          model: ProductImage,
          as: "product_images",
          attributes: ["image_path", "id_metal_tone"],
          where: { image_type: PRODUCT_IMAGE_TYPE.Feature },
        },
        {
          required: true,
          model: ProductMetalOption,
          as: "PMO",
          attributes: [
            "id_metal",
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
            { is_deleted: "0" },
            req.query.metal_id
              ? Sequelize.where(Sequelize.literal('"PMO"."id_metal"'), {
                  [Op.eq]: req.query.metal_id,
                })
              : {},
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

    //  const validateName = await validateSameProductName(
    //   name,
    //   sku,
    //   id_product !== 0 ? id_product : null
    // );
    // if (validateName.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    //   return validateName;
    // }

    const productsku = await Product.findOne({
      where: { name: name, is_deleted: "0" },
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

    if (settingStyleType == false) {
      return resBadRequest({ message: SETTING_TYPE_IS_REQUIRED });
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
        const resProduct = await Product.create(
          {
            name: name,
            sku: sku,
            sort_description: sort_description,
            long_description: long_description,
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
          sort_description: sort_description ? sort_description : null,
          long_description: long_description ? long_description : null,
          tag: tag.join("|"),
          gender: gender == false ? null : gender.join("|"),
          slug: slug,
          making_charge,
          finding_charge,
          other_charge,
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

    return resSuccess({ data: { wish_list_count, cart_list_count } });
  } catch (error) {
    throw error;
  }
};

export const searchProductGlobally = async (req: Request) => {
  try {
    let tags = await Tag.findOne({
      where: { name: { [Op.iLike]: "%" + req.query.search_text + "%" } },
    });

    console.log("----", tags);

    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      req.query.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + req.query.search_text + "%" } },
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM product_categories AS pC LEFT OUTER JOIN categories ON pC.id_category = categories.id WHERE pc.id_product = products.id AND categories.category_name ilike '%${req.query.search_text}%')`
                ),
                ">",
                "0"
              ),
              { tag: { [Op.iLike]: "%" + tags?.dataValues.id + "%" } },
            ],
          }
        : {},
    ];

    const productList = await Product.findAll({
      where,
      order: [
        ["id", "DESC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_metal", "ASC"],
        [{ model: ProductMetalOption, as: "PMO" }, "id_karat", "ASC"],
        [{ model: ProductImage, as: "product_images" }, "image_path", "DESC"],
      ],
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        [
          Sequelize.literal(
            `(SELECT product_images.image_path FROM product_images WHERE product_images.id_product = products.id AND product_images.image_type = 1 LIMIT 1)`
          ),
          "product_image",
        ],
        [
          Sequelize.literal(
            `(SELECT CASE WHEN "PMO"."id_karat" IS NULL THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) ELSE (metal_master.metal_rate/31.104*gold_kts.name/24*PMO.metal_weight+making_charge+finding_charge+other_charge+(COALESCE(sum(DGM.rate*PDO.weight*PDO.count), 0))) END FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product = products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product = products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN PMO.id_karat IS NULL THEN products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" ELSE products.id = "PMO"."id_product" AND PMO.id_metal = "PMO"."id_metal" AND PMO.id_karat = "PMO"."id_karat" END GROUP BY metal_master.metal_rate, PMO.metal_weight, products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.name)`
          ),
          "Price",
        ],
      ],
      include: [
        {
          required: false,
          model: ProductImage,
          as: "product_images",
          attributes: [],
          where: { image_type: PRODUCT_IMAGE_TYPE.Feature },
        },
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
