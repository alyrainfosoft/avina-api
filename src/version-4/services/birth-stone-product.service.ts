import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  getCompanyIdBasedOnTheCompanyKey,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  CATEGORY_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  DEFAULT_STATUS_SUCCESS,
  DIAMOND_GROUP_NOT_FOUND,
  ENGRAVING_DATA_NOT_MATCH_ENGRAVING_COUNT,
  ENGRAVING_OPTION_NOT_FOUND,
  GEMSTONE_DATA_NOT_MATCH_GEMSTONE_COUNT,
  GEMSTONE_LIST_INVALID,
  GOLD_WEIGHT_REQUIRES,
  IMAGES_NOT_FOUND,
  INVALID_CATEGORY,
  INVALID_ID,
  ITEM_IS_ALREADY_IN_MODE,
  METAL_IS_REQUIRES,
  NOT_FOUND_MESSAGE,
  PRODUCT_BASIC_PRICE_NOT_FOUND,
  PRODUCT_DIAMOND_OPTION_NOT_FOUND,
  PRODUCT_EXIST_WITH_SAME_SKU,
  PRODUCT_METAL_OPTION_NOT_FOUND,
  PRODUCT_NOT_FOUND,
  RECORD_UPDATE_SUCCESSFULLY,
  TAG_NOT_FOUND,
} from "../../utils/app-messages";
import {
  IProductCategory,
  IProductMetalGoldData,
  IProductMetalSilverData,
  IQueryPagination,
  IValidateProductCategoryPayload,
  IValidateProductTagPayload,
} from "../../data/interfaces/common/common.interface";
import { Op, QueryTypes, Sequelize } from "sequelize";
import {
  ActiveStatus,
  AllProductTypes,
  DeletedStatus,
  FeaturedProductStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  TrendingProductStatus,
} from "../../utils/app-enumeration";
import { initModels } from "../model/index.model";
import { moveFileToS3ByType } from "../../helpers/file.helper";


export const addBirthStoneProductAPI = async (req: Request) => {
  try {
        const { DiamondGroupMaster,BirthStoneProduct, BirthstoneProductEngraving, BirthstoneProductCategory, BirthstoneProductMetalOption, BirthStoneProductDiamondOption} = initModels(req);

    const {
      id_product,
      name,
      sku,
      sort_description,
      long_description,
      product_number,
      engraving_count,
      tag,
      product_categories,
      making_charge,
      finding_charge,
      other_charge,
      gemstone_count,
      product_Gold_metal_options,
      product_silver_options,
      product_platinum_options,
      settingStyleType,
      size,
      length,
      product_diamond_options,
      gender,
      product_engraving,
    } = req.body;

    let slug = name.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");

    if (product_engraving.length != engraving_count) {
      return resBadRequest({
        message: ENGRAVING_DATA_NOT_MATCH_ENGRAVING_COUNT,
      });
    }

    const productsku = await BirthStoneProduct.findOne({
      where: { sku: sku, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (productsku != null) {
      return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
    }

    const validTag = await validateProductTag({
      tag,
      oldTag: "",
    },req?.body?.session_res?.client_id,req);

    if (validTag.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validTag;
    }

    const validPC = await validateProductCategories({
      categories: product_categories,
      id_product: id_product !== 0 ? id_product : null,
    },req?.body?.session_res?.client_id,req);

    if (validPC.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validPC;
    }

    if (
      !product_Gold_metal_options &&
      !product_silver_options &&
      !product_platinum_options
    )
      return resBadRequest({ message: METAL_IS_REQUIRES });

      let activitylogs: any = { category: [], metals: [], diamonds: [], engraving:[] }
      const categories = [];
      const ProductEngraving = [];
      const GoldMetal = [];
      const SilverMetal = [];
      const PlatinumMetal = [];
      const diamonds = []
    const trn = await (req.body.db_connection).transaction();
    try {
      if (id_product === 0) {
        const resProduct = await BirthStoneProduct.create(
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
            product_number: product_number,
            engraving_count: engraving_count,
            gemstone_count: gemstone_count,
            gender: gender == false ? null : gender.join("|"),
            size: size == false ? null : size.join("|"),
            length: length == false ? null : length.join("|"),
            is_active: ActiveStatus.Active,
            is_featured: FeaturedProductStatus.InFeatured,
            is_trending: TrendingProductStatus.InTrending,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
      activitylogs = { ...resProduct.dataValues }
        
        for (const productCategory of product_categories) {
          const data = await BirthstoneProductCategory.create(
            {
              id_product: resProduct.dataValues.id,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              created_by: req.body.session_res.id_app_user,
              company_info_id :req?.body?.session_res?.client_id,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          categories.push(data?.dataValues);
        }
        
        if (product_engraving) {
          for (const engraving of product_engraving) {
            const data = await BirthstoneProductEngraving.create(
              {
                id_product: resProduct.dataValues.id,
                text: engraving.text,
                max_text_count: engraving.text_count,
                created_date: getLocalDate(),
                is_deleted: DeletedStatus.No,
                created_by: req.body.session_res.id_app_user,
                company_info_id :req?.body?.session_res?.client_id,
              },
              { transaction: trn }
            );
            ProductEngraving.push(data?.dataValues);
          }
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
                const data = await BirthstoneProductMetalOption.create(
                  {
                    id_product: resProduct.dataValues.id,
                    id_metal: pmgo.id_metal,
                    metal_weight: pmgo.metal_weight,
                    id_metal_tone: pmgo.id_metal_tone.join("|"),
                    id_karat: pmgo.id_karat,
                    price: pmgo.price ? pmgo.price : null,
                    created_date: getLocalDate(),
                    created_by: req.body.session_res.id_app_user,
                    company_info_id :req?.body?.session_res?.client_id,
                  },
                  { transaction: trn }
                );
                GoldMetal.push(data?.dataValues);
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
              const data = await BirthstoneProductMetalOption.create(
                {
                  id_product: resProduct.dataValues.id,
                  id_metal: pmso.id_metal,
                  metal_weight: pmso.metal_weight,
                  id_metal_tone: pmso.id_metal_tone.join("|"),
                  created_date: getLocalDate(),
                  price: pmso.price ? pmso.price : null,
                  created_by: req.body.session_res.id_app_user,
                  company_info_id :req?.body?.session_res?.client_id,
                },
                { transaction: trn }
              );
              SilverMetal.push(data?.dataValues);
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
              const data = await BirthstoneProductMetalOption.create(
                {
                  id_product: resProduct.dataValues.id,
                  id_metal: pmpo.id_metal,
                  metal_weight: pmpo.metal_weight,
                  id_metal_tone: pmpo.id_metal_tone.join("|"),
                  created_date: getLocalDate(),
                  price: pmpo.price ? pmpo.price : null,
                  created_by: req.body.session_res.id_app_user,
                  company_info_id :req?.body?.session_res?.client_id,
                },
                { transaction: trn }
              );
              PlatinumMetal.push(data?.dataValues);

            }
          }
        }

        if (product_diamond_options) {
          let pdod;

          for (pdod of product_diamond_options) {
            let diamondGroup;

            if (pdod.id_type == 1) {
              diamondGroup = await DiamondGroupMaster.findOne({
                where: {
                  id_stone: pdod.id_stone,
                  id_shape: pdod.id_shape,
                  id_mm_size: pdod.id_mm_size,
                  id_color: pdod.id_color,
                  id_clarity: pdod.id_clarity,
                  id_cuts: pdod.id_cuts,
                  id_carat: pdod.is_carat,
                  is_deleted: DeletedStatus.No,
                  company_info_id :req?.body?.session_res?.client_id,
                },
                transaction: trn,
              });

              if (diamondGroup === null) {
                await trn.rollback();
                return resBadRequest({ message: DIAMOND_GROUP_NOT_FOUND });
              }
            }

            if (pdod.id === 0) {
              const data = await BirthStoneProductDiamondOption.create(
                {
                  id_product: resProduct.dataValues.id,
                  id_diamond_group: diamondGroup
                    ? diamondGroup.dataValues.id
                    : null,
                  id_type: pdod.id_type,
                  count: pdod.count,
                  is_default: pdod.is_default,
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                  company_info_id :req?.body?.session_res?.client_id,
                  id_stone: pdod.id_stone,
                  id_shape: pdod.id_shape,
                  id_mm_size: pdod.id_mm_size,
                  id_color: pdod.id_color,
                  id_clarity: pdod.id_clarity,
                  id_carat: pdod.is_carat,
                  id_cut: pdod.id_cuts,
                },
                { transaction: trn }
              );
              diamonds.push(data?.dataValues);
            }
          }
        }
    
        activitylogs = { ...activitylogs, category: [...categories], metals: [...GoldMetal,...SilverMetal,...PlatinumMetal], diamonds: [...diamonds], engraving:[...ProductEngraving] }
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: activitylogs}], resProduct?.dataValues?.id, LogsActivityType.Add, LogsType.BirthStoneProduct, req?.body?.session_res?.id_app_user,trn)
        await trn.commit();
        return resSuccess({ data: resProduct });
      } else {
      }
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const validateProductTag = async (payload: IValidateProductTagPayload,client_id:number, req: any) => {
  const { tag, oldTag } = payload;
  const { Tag} = initModels(req);
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
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      company_info_id :client_id
    },
  });

  if (validateTag.length !== tagIdsToValidate.length) {
    return resUnprocessableEntity({ message: TAG_NOT_FOUND });
  }

  return resSuccess();
};

const validateProductCategories = async (
  payload: IValidateProductCategoryPayload,client_id:Number, req: any
) => {
  const { BirthstoneProductCategory,CategoryData } = initModels(req);
  const { categories, id_product } = payload;

  let oldProductCategories: IProductCategory[] = [];

  if (id_product) {
    const findAllPC = await BirthstoneProductCategory.findAll({
      where: { id_product, is_deleted: DeletedStatus.No,company_info_id :client_id },
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
        const validateCategory = await CategoryData.findOne({
          attributes: ["id"],
          where: {
            id: category.id_category,
            is_deleted: DeletedStatus.No,
            is_active: ActiveStatus.Active,
            parent_id: { [Op.eq]: null },
            company_info_id :client_id,
          },
          include: category.id_sub_category
            ? {
                model: CategoryData,
                as: "sub_category",
                attributes: ["id"],
                where: {
                  id: category.id_sub_category,
                  is_deleted: DeletedStatus.No,
                  is_active: ActiveStatus.Active,
                  company_info_id :client_id,
                },
                include: category.id_sub_sub_category
                  ? [
                      {
                        model: CategoryData,
                        as: "sub_category",
                        attributes: ["id"],
                        where: {
                          id: category.id_sub_sub_category,
                          is_deleted: DeletedStatus.No,
                          is_active: ActiveStatus.Active,
                          company_info_id :client_id,
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
          const validateCategory = await CategoryData.findOne({
            attributes: ["id"],
            where: {
              id: category.id_category,company_info_id :client_id
            },
            include: category.id_sub_category
              ? {
                  model: CategoryData,
                  as: "sub_category",
                  attributes: ["id"],
                  where: {
                    id: category.id_sub_category,
                    is_deleted: DeletedStatus.No,
                    is_active: ActiveStatus.Active,
                    company_info_id :client_id
                  },
                  include: category.id_sub_sub_category
                    ? [
                        {
                          model: CategoryData,
                          as: "sub_category",
                          attributes: ["id"],
                          where: {
                            id: category.id_sub_sub_category,
                            is_deleted: DeletedStatus.No,
                            is_active: ActiveStatus.Active,
                            company_info_id :client_id
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
          const validateCategory = await CategoryData.findOne({
            attributes: ["id"],
            where: {
              id: category.id_sub_category,company_info_id :client_id
            },
            include: category.id_sub_category
              ? {
                  model: CategoryData,
                  as: "sub_category",
                  attributes: ["id"],
                  where: {
                    id: category.id_sub_sub_category,
                    is_deleted: DeletedStatus.No,
                    is_active: ActiveStatus.Active,
                    company_info_id :client_id
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
      const validateCategory = await CategoryData.findOne({
        attributes: ["id"],
        where: {
          id: category.id_category,
          is_deleted: DeletedStatus.No,
          is_active: ActiveStatus.Active,
          parent_id: { [Op.eq]: null },
          company_info_id :client_id
        },
        include: category.id_sub_category
          ? {
              model: CategoryData,
              as: "sub_category",
              attributes: ["id"],
              where: {
                id: category.id_sub_category,
                is_deleted: DeletedStatus.No,
                is_active: ActiveStatus.Active,
                company_info_id :client_id
              },
              include: category.id_sub_sub_category
                ? [
                    {
                      model: CategoryData,
                      as: "sub_category",
                      attributes: ["id"],
                      where: {
                        id: category.id_sub_sub_category,
                        is_deleted: DeletedStatus.No,
                        is_active: ActiveStatus.Active,
                        company_info_id :client_id,
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

export const getAllBirthstoneProduct = async (req: Request) => {
  try {
    const { BirthStoneProduct, Image} = initModels(req);

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
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

    const totalItems = await BirthStoneProduct.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const result = await BirthStoneProduct.findAll({
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
        "product_number",
        "engraving_count",
        "gemstone_count",
        [Sequelize.literal("image.image_path"), "image_path"],
        [
          Sequelize.literal(`
              (SELECT categories.category_name FROM birthstone_product_categories AS pc
                LEFT OUTER JOIN categories ON categories.id=pc.id_category
              WHERE pc.id_product=birthstone_products.id AND pc.is_deleted='0' ORDER BY pc.id ASC limit 1)
            `),
          "category_name",
        ],
      ],
      include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    // await addRateToProductList(result);
    return resSuccess({ data: { pagination, result } });
  } catch (e) {
    throw e;
  }
};

export const activeInactiveBirthstoneProduct = async (req: Request) => {
  try {
    const { BirthStoneProduct, ProductWish,CartProducts } = initModels(req);
    const { id_product, is_active } = req.body;
    const findProduct = await BirthStoneProduct.findOne({
      where: {
        id: id_product,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
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

    
    await BirthStoneProduct.update(
      {
        is_active: is_active,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findProduct.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    const findProductWish = await ProductWish.findAll({
      where: {
          product_id: findProduct.dataValues.id,
          product_type: [AllProductTypes.BirthStone_product],
      },
    });

    await ProductWish.destroy({
      where: {
        product_id: findProduct.dataValues.id,
        product_type: [AllProductTypes.BirthStone_product],
        company_info_id :req?.body?.session_res?.client_id,
      },
    });
    const findCartProducts = await CartProducts.findAll({
      where: {
        product_id: findProduct.dataValues.id,
        product_type: [AllProductTypes.BirthStone_product],
      },
    });    
    await CartProducts.destroy({
      where: {
        product_id: findProduct.dataValues.id,
        product_type: [AllProductTypes.BirthStone_product],
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { birth_stone_product_id: findProduct?.dataValues?.id, data: {...findProduct?.dataValues},findProductWishdata: findProductWish.map((t: any) => t.dataValues),
      findCartProducts: findCartProducts.map((t: any) => t.dataValues)},
      new_data: [{
        birth_stone_product_id: findProduct?.dataValues?.id, data: {
          ...findProduct?.dataValues, is_active: is_active,
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        },
        findProductWishdata: null,
        findCartProducts: null
      }
    ]
    }], findProduct?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.BirthStoneProduct, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const featuredBirthstoneProductStatusUpdate = async (req: Request) => {
  try {
    const { BirthStoneProduct } = initModels(req);
    const { id_product, is_featured } = req.body;
    const findProduct = await BirthStoneProduct.findOne({
      where: {
        id: id_product,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await BirthStoneProduct.update(
      {
        is_featured: is_featured,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findProduct.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { birth_stone_id: findProduct?.dataValues?.id, is_featured: findProduct?.dataValues?.is_featured},
      new_data: {
        birth_stone_id: findProduct?.dataValues?.id, is_featured: is_featured }
    }], findProduct?.dataValues?.id,LogsActivityType.IsFeatured, LogsType.BirthStoneProduct, req?.body?.session_res?.id_app_user)
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const trendingBirthstoneProductStatusUpdate = async (req: Request) => {
  try {
    const { BirthStoneProduct } = initModels(req);
    const { id_product, is_trending } = req.body;
    const findProduct = await BirthStoneProduct.findOne({
      where: {
        id: id_product,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await BirthStoneProduct.update(
      {
        is_trending: is_trending,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findProduct.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { birth_stone_id: findProduct?.dataValues?.id, is_trending: findProduct?.dataValues?.is_trending},
      new_data: {
        birth_stone_id: findProduct?.dataValues?.id, is_trending: is_trending }
    }], findProduct?.dataValues?.id,LogsActivityType.IsFeatured, LogsType.BirthStoneProduct, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const deleteBirthstoneProduct = async (req: Request) => {
  const trn = await (req.body.db_connection).transaction();
  try {
    const { BirthStoneProduct, BirthstoneProductCategory, BirthstoneProductMetalOption, BirthStoneProductDiamondOption,BirthstoneProductEngraving,ProductWish, CartProducts } = initModels(req);
    const productToBeDelete = await BirthStoneProduct.findOne({
      where: {
        id: req.body.id,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(productToBeDelete && productToBeDelete.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await BirthStoneProduct.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: productToBeDelete.dataValues.id, company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
    );

    await BirthstoneProductCategory.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id, },
        transaction: trn,
      }
    );

    await BirthstoneProductMetalOption.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id, },
        transaction: trn,
      }
    );

    await BirthStoneProductDiamondOption.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id, },
        transaction: trn,
      }
    );

    await BirthstoneProductEngraving.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { id_product: productToBeDelete.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id, },
        transaction: trn,
      }
    );
    const findProductWish = await ProductWish.findAll({
      where: {
          product_id: productToBeDelete.dataValues.id,
          product_type: [AllProductTypes.BirthStone_product],
      },
    });
    await ProductWish.destroy({
      where: {
        product_id: productToBeDelete.dataValues.id,
        product_type: [AllProductTypes.BirthStone_product],
        company_info_id :req?.body?.session_res?.client_id,
      },
      transaction: trn,
    });
    const findCartProducts = await CartProducts.findAll({
      where: {
        product_id: productToBeDelete.dataValues.id,
        product_type: [AllProductTypes.BirthStone_product],
      },
    });  
    await CartProducts.destroy({
      where: {
        product_id: productToBeDelete.dataValues.id,
        product_type: [AllProductTypes.BirthStone_product],
        company_info_id :req?.body?.session_res?.client_id,
      },
      transaction: trn,
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { birthstone_id: productToBeDelete?.dataValues?.id, data: {...productToBeDelete?.dataValues},findProductWishdata: findProductWish.map((t: any) => t.dataValues),
      findCartProducts: findCartProducts.map((t: any) => t.dataValues)},
      new_data: {
        birthstone_id: productToBeDelete?.dataValues?.id, data: {
          ...productToBeDelete?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        },
        findProductWishdata: null,
        findCartProducts:null
      }
    }], productToBeDelete?.dataValues?.id, LogsActivityType.Delete, LogsType.BirthStoneProduct, req?.body?.session_res?.id_app_user,trn)
    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
  }
};

export const editBirthstoneproductApi = async (req: Request) => {
  try {
    const {BirthStoneProduct, BirthStoneProductDiamondOption, BirthstoneProductEngraving, BirthstoneProductCategory, BirthstoneProductMetalOption, DiamondGroupMaster} = initModels(req);
    const {
      id_product,
      name,
      sku,
      sort_description,
      long_description,
      tag,
      product_engraving,
      product_categories,
      making_charge,
      finding_charge,
      other_charge,
      product_number,
      engraving_count,
      product_Gold_metal_options,
      product_silver_options,
      product_platinum_options,
      settingStyleType,
      size,
      length,
      product_diamond_options,
      gender,
      gemstone_count,
    } = req.body;

    let slug = name.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");
    // if (product_engraving.length != engraving_count) {

    //   return resBadRequest({ message: ENGRAVING_DATA_NOT_MATCH_ENGRAVING_COUNT })
    // }
    let resIdProduct = 0;
    let newAddActivityLogs: any[] = [];
    let editActivityLogs: any[] = [];

    if (id_product !== 0) {
      resIdProduct = id_product;
    }
    let productToBeUpdate:any;
    if (id_product !== 0) {
      productToBeUpdate = await BirthStoneProduct.findOne({
        where: {
          id: id_product,
          is_deleted: DeletedStatus.No,
          company_info_id :req?.body?.session_res?.client_id,
        },
      });

      if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
        return resNotFound({ message: PRODUCT_NOT_FOUND });
      }
    }

    const productsku:any = await BirthStoneProduct.findOne({
      where: { sku: sku, id: { [Op.ne]: id_product }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id, },
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
    },req?.body?.session_res?.client_id,req);

    if (validTag.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validTag;
    }

    const validPC = await validateProductCategories({
      categories: product_categories,
      id_product: id_product !== 0 ? id_product : null,
    },req?.body?.session_res?.client_id, req);

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

    const trn = await (req.body.db_connection).transaction();
    try {

      await BirthStoneProduct.update(
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
          product_number: product_number,
          engraving_count: engraving_count,
          gemstone_count: gemstone_count,
          size: size == false ? null : size.join("|"),
          length: length == false ? null : length.join("|"),
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: id_product, company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
      );
      editActivityLogs.push({ 
        old_data:{ birth_stone_product : productToBeUpdate?.dataValues?.id, data:{...productToBeUpdate?.dataValues}}, 
        new_data: { birth_stone_product : productToBeUpdate?.dataValues?.id, data:{
          ...productToBeUpdate?.dataValues,
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
          product_number: product_number,
          engraving_count: engraving_count,
          gemstone_count: gemstone_count,
          size: size == false ? null : size.join("|"),
          length: length == false ? null : length.join("|"),
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        } }
      });
      for (const productCategory of product_categories) {
        if (productCategory.id === 0) {
          const newData:any = await BirthstoneProductCategory.create(
            {
              id_product: id_product,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              created_by: req.body.session_res.id_app_user,
              company_info_id :req?.body?.session_res?.client_id,
              created_date: getLocalDate(),
              is_deleted: productCategory.is_deleted,
            },
            { transaction: trn }
          );
          newAddActivityLogs.push({ old_data: null, new_data: {product_category_id:newData?.dataValues?.id , data:{...newData?.dataValues}} });
        } else {
          await BirthstoneProductCategory.update(
            {
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
              is_deleted: productCategory.is_deleted,
            },
            { where: { id: productCategory.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
          );
          editActivityLogs.push({ 
            old_data:{ product_category_id : productCategory.id, data:{...productCategory?.dataValues}}, 
            new_data: { product_category_id : productCategory.id, data:{
              ...productCategory?.dataValues,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
              is_deleted: productCategory.is_deleted
            } }
          });

        }
      }

      // for (const productCategory of validPC.data) {
      //   await BirthstoneProductCategory.update(
      //     {
      //       is_deleted: DeletedStatus.yes,
      //       modified_by: req.body.session_res.id_app_user,
      //       modified_date: new Date(),
      //     },
      //     { where: { id: productCategory.id }, transaction: trn }
      //   );
      // }

      if (product_engraving) {
        for (const engraving of product_engraving) {
          if (engraving.id == 0) {
            const newData = await BirthstoneProductEngraving.create(
              {
                id_product: id_product,
                text: engraving.text,
                max_text_count: engraving.text_count,
                created_date: getLocalDate(),
                is_deleted: DeletedStatus.No,
                created_by: req.body.session_res.id_app_user,
                company_info_id :req?.body?.session_res?.client_id,
              },
              { transaction: trn }
            );
            newAddActivityLogs.push({ old_data: null, new_data: {product_engraving_id:newData?.dataValues?.id , data:{...newData?.dataValues}} });
          } else {
            let engravingData = await BirthstoneProductEngraving.findOne({
              where: { id: engraving.id, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id,},
              transaction: trn,
            });

            if (!(engravingData && engravingData.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: ENGRAVING_OPTION_NOT_FOUND });
            }

            await BirthstoneProductEngraving.update(
              {
                id_product: id_product,
                text: engraving.text,
                max_text_count: engraving.text_count,
                modified_date: getLocalDate(),
                is_deleted: engraving.is_deleted,
                modified_by: req.body.session_res.id_app_user,
              },
              { where: { id: engraving.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id, }, transaction: trn }
            );
            editActivityLogs.push({ 
              old_data:{ product_engraving_id : engravingData?.dataValues?.id, data:{...engravingData?.dataValues}}, 
              new_data: { product_engraving_id : engravingData?.dataValues?.id, data:{
                ...engravingData?.dataValues,
                id_product: id_product,
                text: engraving.text,
                max_text_count: engraving.text_count,
                modified_date: getLocalDate(),
                is_deleted: engraving.is_deleted,
                modified_by: req.body.session_res.id_app_user,
              } }
            });
          }
        }
      }

      if (product_Gold_metal_options) {
        let pmgo: any;
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
              const newData:any = await BirthstoneProductMetalOption.create(
                {
                  id_product: id_product,
                  id_metal: pmgo.id_metal,
                  metal_weight: pmgo.metal_weight,
                  id_metal_tone: pmgo.id_metal_tone.join("|"),
                  id_karat: pmgo.id_karat,
                  price: pmgo.price ? pmgo.price : null,
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                  company_info_id :req?.body?.session_res?.client_id,
                  is_deleted: pmgo.is_deleted,
                },
                { transaction: trn }
              );
              newAddActivityLogs.push({ old_data: null, new_data: {product_Gold_metal_option_id:newData?.datavalues?.id, data:{...newData?.dataValues}} });
            }
          } else {
            let productMetal = await BirthstoneProductMetalOption.findOne({
              where: { id: pmgo.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id, },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }
            await BirthstoneProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmgo.id_metal,
                metal_weight: pmgo.metal_weight,
                id_metal_tone: pmgo.id_metal_tone.join("|"),
                id_karat: pmgo.id_karat,
                price: pmgo.price ? pmgo.price : null,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmgo.is_deleted,
              },

              { where: { id: pmgo.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
            );
            editActivityLogs.push({ 
              old_data:{ product_Gold_metal_option_id : productMetal?.dataValues?.id, data:{...productMetal?.dataValues}}, 
              new_data: { product_Gold_metal_option_id : productMetal?.dataValues?.id, data:{
                ...productMetal?.dataValues,
                id_product: id_product,
                id_metal: pmgo.id_metal,
                metal_weight: pmgo.metal_weight,
                id_metal_tone: pmgo.id_metal_tone.join("|"),
                id_karat: pmgo.id_karat,
                price: pmgo.price ? pmgo.price : null,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmgo.is_deleted,
              } }
            });
          }
        }
      }

      if (product_silver_options) {
        let pmso: any;

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
            const newData:any = await BirthstoneProductMetalOption.create(
              {
                id_product: id_product,
                id_metal: pmso.id_metal,
                metal_weight: pmso.metal_weight,
                id_metal_tone: pmso.id_metal_tone.join("|"),
                created_date: getLocalDate(),
                price: pmso.price ? pmso.price : null,
                created_by: req.body.session_res.id_app_user,
                company_info_id :req?.body?.session_res?.client_id,
                is_deleted: pmso.is_deleted,
              },
              { transaction: trn }
            );
            newAddActivityLogs.push({ old_data: null, new_data: {product_silver_metal_option_id:newData?.datavalues?.id, data:{...newData?.dataValues} }});

          } else {
            let productMetal = await BirthstoneProductMetalOption.findOne({
              where: { id: pmso.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }
            await BirthstoneProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmso.id_metal,
                metal_weight: pmso.metal_weight,
                id_metal_tone: pmso.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                price: pmso.price ? pmso.price : null,
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmso.is_deleted,
              },

              { where: { id: pmso.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
            );
            editActivityLogs.push({ 
              old_data:{ product_silver_metal_option_id : productMetal?.dataValues?.id, data:{...productMetal?.dataValues}}, 
              new_data: { product_silver_metal_option_id : productMetal?.dataValues?.id, data:{
                ...productMetal?.dataValues,
                id_product: id_product,
                id_metal: pmso.id_metal,
                metal_weight: pmso.metal_weight,
                id_metal_tone: pmso.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                price: pmso.price ? pmso.price : null,
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmso.is_deleted,
              } }
            });
          }
        }
      }

      if (product_platinum_options) {
        let pmpo: any;

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
            const newData:any = await BirthstoneProductMetalOption.create(
              {
                id_product: id_product,
                id_metal: pmpo.id_metal,
                metal_weight: pmpo.metal_weight,
                id_metal_tone: pmpo.id_metal_tone.join("|"),
                created_date: getLocalDate(),
                price: pmpo.price ? pmpo.price : null,
                created_by: req.body.session_res.id_app_user,
                company_info_id :req?.body?.session_res?.client_id,
                is_deleted: pmpo.is_deleted,
              },
              { transaction: trn }
            );
            newAddActivityLogs.push({ old_data: null, new_data: {product_platinum_metal_option_id:newData?.datavalues?.id, data:{...newData?.dataValues} }});

          } else {
            let productMetal = await BirthstoneProductMetalOption.findOne({
              where: { id: pmpo.id, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id},
              transaction: trn,
            });

            if (!(productMetal && productMetal.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
            }

            await BirthstoneProductMetalOption.update(
              {
                id_product: id_product,
                id_metal: pmpo.id_metal,
                metal_weight: pmpo.metal_weight,
                id_metal_tone: pmpo.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                price: pmpo.price ? pmpo.price : null,
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmpo.is_deleted,
              },

              { where: { id: pmpo.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
            );
            editActivityLogs.push({ 
              old_data:{ product_platinum_metal_option_id : productMetal?.dataValues?.id, data:{...productMetal?.dataValues}}, 
              new_data: { product_platinum_metal_option_id : productMetal?.dataValues?.id, data:{
                ...productMetal?.dataValues,
                id_product: id_product,
                id_metal: pmpo.id_metal,
                metal_weight: pmpo.metal_weight,
                id_metal_tone: pmpo.id_metal_tone.join("|"),
                modified_date: getLocalDate(),
                price: pmpo.price ? pmpo.price : null,
                modified_by: req.body.session_res.id_app_user,
                is_deleted: pmpo.is_deleted,
              } }
            });
          }
        }
      }

      if (product_diamond_options) {
        let pdod;

        for (pdod of product_diamond_options) {
          let diamondGroup;

          if (pdod.id_type == 1) {
            diamondGroup = await DiamondGroupMaster.findOne({
              where: {
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_cuts: pdod.id_cuts,
                id_carat: pdod.is_carat,
                is_deleted: DeletedStatus.No,
                company_info_id :req?.body?.session_res?.client_id,
              },
              transaction: trn,
            });

            if (diamondGroup === null) {
              await trn.rollback();
              return resBadRequest({ message: DIAMOND_GROUP_NOT_FOUND });
            }
          }

          if (pdod.id === 0) {
            const newData:any = await BirthStoneProductDiamondOption.create(
              {
                id_product: id_product,
                id_diamond_group: diamondGroup
                  ? diamondGroup.dataValues.id
                  : null,
                id_type: pdod.id_type,
                count: pdod.count,
                is_default: pdod.is_default,
                created_date: getLocalDate(),
                created_by: req.body.session_res.id_app_user,
                company_info_id :req?.body?.session_res?.client_id,
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_carat: pdod.is_carat,
                id_cut: pdod.id_cuts,
                is_deleted: pdod.is_deleted,
              },
              { transaction: trn }
            );
            newAddActivityLogs.push({ old_data: null, new_data: {diamond_group_id:newData?.dataValues?.id, data:{...newData?.dataValues}} });

          } else {
            let diamondOption = await BirthStoneProductDiamondOption.findOne({
              where: { id: pdod.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            });

            if (!(diamondOption && diamondOption.dataValues)) {
              await trn.rollback();
              return resNotFound({ message: PRODUCT_DIAMOND_OPTION_NOT_FOUND });
            }

            await BirthStoneProductDiamondOption.update(
              {
                id_product: id_product,
                id_diamond_group: diamondGroup
                  ? diamondGroup.dataValues.id
                  : null,
                id_type: pdod.id_type,
                count: pdod.count,
                is_default: pdod.is_default,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_carat: pdod.is_carat,
                id_cut: pdod.id_cuts,
                is_deleted: pdod.is_deleted,
              },

              { where: { id: pdod.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
            );
            editActivityLogs.push({ 
              old_data:{ diamond_group_id : diamondOption?.dataValues?.id, data:{...diamondOption?.dataValues}}, 
              new_data: { diamond_group_id : diamondOption?.dataValues?.id, data:{
                ...diamondOption?.dataValues,
                id_product: id_product,
                id_diamond_group: diamondGroup
                  ? diamondGroup.dataValues.id
                  : null,
                id_type: pdod.id_type,
                count: pdod.count,
                is_default: pdod.is_default,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user,
                id_stone: pdod.id_stone,
                id_shape: pdod.id_shape,
                id_mm_size: pdod.id_mm_size,
                id_color: pdod.id_color,
                id_clarity: pdod.id_clarity,
                id_carat: pdod.is_carat,
                id_cut: pdod.id_cuts,
                is_deleted: pdod.is_deleted,
              } }
            });
          }
        }
      }
    
      await addActivityLogs(req?.body?.session_res?.client_id,newAddActivityLogs, null, LogsActivityType.Add, LogsType.BirthStoneProduct, req.body.session_res.id_app_user,trn);

      await addActivityLogs(req?.body?.session_res?.client_id,editActivityLogs, null, LogsActivityType.Edit, LogsType.BirthStoneProduct, req.body.session_res.id_app_user,trn);

      await trn.commit();
      return resSuccess();
    } catch (e: any) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

export const getBirthstoneProductById = async (req: Request) => {
  try {
    let idProduct = req.params.id;
    const { Image,BirthStoneProduct,BirthstoneProductEngraving, BirthstoneProductMetalOption, BirthStoneProductDiamondOption,DiamondGroupMaster,BirthstoneProductCategory } = initModels(req);
    if (!idProduct) return resBadRequest({ message: INVALID_ID });

    const findProduct = await BirthStoneProduct.findOne({
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "product_number",
        "engraving_count",
        "gemstone_count",
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
        [Sequelize.literal("image.image_path"), "image_path"],
        [
          Sequelize.literal(
            `CASE WHEN "birthstone_products"."tag" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_products"."tag", '|')::int[] END`
          ),
          "tag",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "birthstone_products"."size" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_products"."size", '|')::int[] END`
          ),
          "size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "birthstone_products"."length" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_products"."length", '|')::int[] END`
          ),
          "length",
        ],
      ],
      where: {
        id: idProduct,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
      include: [
        { model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id}, required:false},
        {
          required: false,
          model: BirthstoneProductEngraving,
          as: "engravings",
          attributes: [
            "id",
            "id_product",
            "text",
            "max_text_count",
            "is_deleted",
          ],
          where: { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        },
        {
          required: false,
          model: BirthstoneProductMetalOption,
          as: "birthstone_PMO",
          attributes: [
            "id",
            "metal_weight",
            "id_metal",
            "id_metal_tone",
            "plu_no",
            "price",
            [
              Sequelize.literal(
                `CASE WHEN "birthstone_PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_PMO"."id_metal_tone", '|')::int[] END`
              ),
              "metal_tone",
            ],
            "id_karat",
            "is_default",
          ],
          where: { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        },
        {
          required: false,
          model: BirthStoneProductDiamondOption,
          as: "birthstone_PDO",
          attributes: [
            "id",
            "id_diamond_group",
            "id_type",
            "weight",
            "count",
            "is_default",
            "id_stone",
            "id_shape",
            "id_mm_size",
            "id_carat",
            "id_color",
            "id_clarity",
            "id_cut",
          ],
          include: [
            {
              required: false,
              model: DiamondGroupMaster,
              as: "bs_diamond_group",
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
              where: { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
            },
          ],
          where: { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        },
        {
          required: false,
          model: BirthstoneProductCategory,
          as: "birth_stone_product_categories",
          attributes: [
            "id",
            "id_category",
            "id_sub_category",
            "id_sub_sub_category",
          ],
          where: { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        },
      ],
    });

    if (!(findProduct && findProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    return resSuccess({ data: findProduct });
  } catch (e) {
    console.log(e);
    return resUnknownError({ data: e });
  }
};

export const birthstoneProductListUserSide = async (req: any) => {
  try {
    const { Image,BirthStoneProduct, BirthStoneProductDiamondOption, BirthstoneProductMetalOption,MetalMaster, GoldKarat, DiamondGroupMaster, DiamondShape } = initModels(req);
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    pagination.per_page_rows = 40;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [{ is_deleted: DeletedStatus.No }, { is_active: ActiveStatus.Active },{company_info_id:company_info_id?.data}];
    let include = [
      {required: false, model: Image, as: "image", attributes: [] ,where:{company_info_id:company_info_id?.data}},
      {
        required: true,
        model: BirthstoneProductMetalOption,
        as: "birthstone_PMO",
        attributes: [
          "id",
          "id_metal",
          ["price", "Price"],

          [
            Sequelize.literal(
              `(SELECT id FROM wishlist_products WHERE product_id = "birthstone_products"."id" AND product_type = ${
                AllProductTypes.BirthStone_product
              }  AND user_id = ${
              req.query.user_id && req.query.user_id != "" && req.query.user_id != undefined
                && req.query.user_id != null && req.query.user_id != "null" && req.query.user_id != "undefined"
                  ? req.query.user_id
                  : 0
              } AND variant_id = "birthstone_PMO"."id" AND company_info_id = ${company_info_id?.data} LIMIT 1)`
            ),
            "wishlist_id",
          ],
          "id_karat",
          [
            Sequelize.literal(
              `CASE WHEN "birthstone_PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_PMO"."id_metal_tone", '|')::int[] END`
            ),
            "metal_tone",
          ],
        ],
        where: [{ is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data }],
        include: [
          {
            required: false,
            model: MetalMaster,
            as: "metal_master",
            attributes: [],
            where:{company_info_id:company_info_id?.data},
          },
          {
            required: false,
            model: GoldKarat,
            as: "metal_karat",
            attributes: [],
            where:{company_info_id:company_info_id?.data},
          },
        ],
      },
      {
        required: false,
        model: BirthStoneProductDiamondOption,
        as: "birthstone_PDO",
        attributes: [],
        where: { is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data },
        include: [
          {
            required: false,
            model: DiamondGroupMaster,
            as: "bs_diamond_group",
            attributes: [],
            include: [
              {
                required: false,
                model: DiamondShape,
                as: "shapes",
                attributes: [],
                where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:company_info_id?.data },
              },
            ],
            where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:company_info_id?.data },
          },
        ],
      },
    ];
    const totalItems = await (<any>BirthStoneProduct.findAndCountAll(<any>{
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

    const productList = await BirthStoneProduct.findAll(<any>{
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [
        [pagination.sort_by, pagination.order_by],
        [
          { model: BirthstoneProductMetalOption, as: "birthstone_PMO" },

          "id_metal",
          "DESC",
        ],
      ],
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "product_number",
        "engraving_count",
        "gemstone_count",
        "sort_description",
        "long_description",
        "making_charge",
        "finding_charge",
        "other_charge",
        ["product_image", "image_id"],
        [
          Sequelize.literal(
            `(SELECT image_path FROM images WHERE id = "product_image")`
          ),
          "image_path",
        ],
        // [Sequelize.literal(`(SELECT COUNT(*) from wishlist_products where user_id = ${req.query.user_id && req.query.user_id != '' ? req.query.user_id: 0} AND product_id = products.id)`), "is_wishlist"],
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

    const products = await Promise.all(
  productList.map(async (value: any) => {
    const pmo = await Promise.all(
      value.dataValues.birthstone_PMO.map(async (t: any) => {
        return {
          ...t.dataValues,
          Price: await req.formatPrice(t.dataValues.Price, null),
        };
      })
    );

    return {
      ...value.dataValues,
      birthstone_PMO: pmo,
    };
  })
);


    return resSuccess({ data: { pagination, productList:products } });
  } catch (error) {
    throw error;
  }
};

export const birthstoneProductGetByIdUserSide = async (req: any) => {
  const { slug, user_id } = req.body;
  const { Image,BirthStoneProduct,Tag,SizeData,LengthData,MetalTone, BirthstoneProductMetalOption, MetalMaster,GoldKarat, BirthStoneProductDiamondOption,DiamondGroupMaster,DiamondShape,BirthstoneProductEngraving,BirthstoneProductCategory } = initModels(req);
  try {
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }    
    let where = [{ slug: slug }, { is_active: ActiveStatus.Active }, { is_deleted: DeletedStatus.No },{company_info_id:company_info_id?.data}];

    const products = await BirthStoneProduct.findOne({
      where,
      attributes: [
        "id",
        "name",
        "sku",
        "slug",
        "style_no",
        "product_number",
        "engraving_count",
        "gemstone_count",
        "sort_description",
        "long_description",
        "making_charge",
        "finding_charge",
        "other_charge",
        "gender",
        "discount_type",
        "discount_value",
        [
          Sequelize.literal(
            `CASE WHEN "birthstone_products"."tag" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_products"."tag", '|')::int[] END`
          ),
          "tag",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "birthstone_products"."size" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_products"."size", '|')::int[] END`
          ),
          "size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "birthstone_products"."length" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_products"."length", '|')::int[] END`
          ),
          "length",
        ],
      ],
      include: [
        {
          required: false,
          model: BirthstoneProductCategory,
          as: "birth_stone_product_categories",
          attributes: [
            "id",
            [
              Sequelize.literal(
                '(SELECT categories.category_name FROM categories WHERE id = "birth_stone_product_categories"."id_category" )'
              ),
              "category",
            ],
            [
              Sequelize.literal(
                '(SELECT categories.category_name FROM categories WHERE id = "birth_stone_product_categories"."id_sub_category" )'
              ),
              "sub_category",
            ],
            [
              Sequelize.literal(
                '(SELECT categories.category_name FROM categories WHERE id = "birth_stone_product_categories"."id_sub_sub_category" )'
              ),
              "sub_sub_category",
            ],
            "id_category",
            "id_sub_category",
            "id_sub_sub_category",
          ],
          where: { is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data },
        },
        {
          required: false,
          model: BirthstoneProductEngraving,
          as: "engravings",
          attributes: ["id", "id_product", "text", "max_text_count"],
          where: { is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data },
        },
        {
          required: false,
          model: BirthstoneProductMetalOption,
          as: "birthstone_PMO",
          attributes: [
            "id",
            "id_metal",
            "plu_no",
            "price",
            [
              Sequelize.literal(
                `(SELECT id FROM wishlist_products WHERE product_id = "birthstone_products"."id" AND product_type = ${
                  AllProductTypes.BirthStone_product
                }  AND user_id = ${
                  req.body.user_id &&
                  req.body.user_id != "" &&
                  req.body.user_id != undefined &&
                  req.body.user_id != null
                    ? req.body.user_id
                    : 0
                } AND variant_id = "birthstone_PMO"."id")`
              ),
              "wishlist_id",
            ],
            [
              Sequelize.literal(
                '(SELECT metal_masters.name FROM metal_masters WHERE id = "birthstone_PMO"."id_metal" )'
              ),
              "metal_name",
            ],
            [
              Sequelize.literal(
                '(SELECT metal_tones.name FROM metal_tones WHERE id = CAST ("birthstone_PMO"."id_metal_tone" AS integer) )'
              ),
              "metal_tone_name",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "birthstone_PMO"."id_metal_tone" IS NULL THEN '{}'::int[] ELSE string_to_array("birthstone_PMO"."id_metal_tone", '|')::int[] END`
              ),
              "metal_tone",
            ],
            "id_metal_tone",
            [
              Sequelize.literal(
                `CASE WHEN "birthstone_PMO".id_karat IS NULL THEN (SELECT metal_tones.sort_code  FROM metal_tones WHERE id = 46) ELSE null END`
              ),
              "short_code",
            ],
            "id_karat",
          ],
          where: { is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data },
          include: [
            {
              required: false,
              model: MetalMaster,
              as: "metal_master",
              attributes: [],
              where:{company_info_id:company_info_id?.data},
            },
            {
              required: false,
              model: GoldKarat,
              as: "metal_karat",
              attributes: [],
              where:{company_info_id:company_info_id?.data},
            },
          ],
        },
        {
          required: false,
          model: BirthStoneProductDiamondOption,
          as: "birthstone_PDO",
          attributes: [
            "id",
            "id_diamond_group",
            "weight",
            "id_color",
            "id_carat",
            "id_clarity",
            "id_shape",
            "id_stone",
            "id_cut",
            "id_mm_size",
            "id_type",
          ],
          where: { is_deleted: DeletedStatus.No, id_type: 2 ,company_info_id:company_info_id?.data},
          include: [
            {
              required: false,
              model: DiamondGroupMaster,
              as: "bs_diamond_group",
              attributes: [],

              where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:company_info_id?.data },
            },
          ],
        },
      ],
    });

    if (!(products && products.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const Gemstone = await req.body.db_connection.query(
      `SELECT 
    gemstones.id, 
    name, 
    sort_code, 
    slug, 
    is_diamond, 
    gemstone_type, 
    images.image_path 
FROM 
    gemstones 
LEFT OUTER JOIN 
    images ON images.id = id_image 
WHERE 
    gemstones.company_info_id = ${company_info_id?.data} 
    AND gemstones.is_active = '1' 
    AND gemstones.is_deleted = '0' 
    AND gemstones.is_diamond = 2 
ORDER BY 
    CASE 
        WHEN LOWER(sort_code) IN ('january', 'february', 'august', 'may','june','july', 'november', 'december', 'april', 'october', 'september', 'march') 
        THEN TO_DATE(sort_code || '-01', 'Month') 
    END`,
      { type: QueryTypes.SELECT }
    );

    const tages = await Tag.findAll({
      where: { id: products.dataValues.tag,company_info_id:company_info_id?.data },
      attributes: ["id", "name"],
    });

    const size = await SizeData.findAll({
      where: { id: products.dataValues.size,company_info_id:company_info_id?.data },
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
      where: { id: products.dataValues.length ,company_info_id:company_info_id?.data},
      attributes: ["id", "length"],
    });

    const metalTone = products.dataValues.birthstone_PMO.map(
      (t: any) => t.dataValues.metal_tone
    );
    const metal = products.dataValues.birthstone_PMO.map(
      (t: any) => t.dataValues.id_metal
    );
    const karat = products.dataValues.birthstone_PMO.map(
      (t: any) => t.dataValues.id_karat
    );

    // console.log(metals.flat().map((t: any) => t))
    const metal_tone = await MetalTone.findAll({
      where: { id: metalTone.flat().map((t: any) => t),company_info_id:company_info_id?.data },
      attributes: [
        "id",
        "name",
        "sort_code",
        [Sequelize.literal("metal_tone_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "metal_tone_image", attributes: [],where:{company_info_id:company_info_id?.data},required:false }],
    });

    const metal_karat = await GoldKarat.findAll({
      where: {
        id: karat.flat().map((t: any) => t),
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        company_info_id:company_info_id?.data,
      },
      attributes: [
        ["id", "id_karat"],
        "name",
        "slug",
        "id_metal",
        [
          Sequelize.literal(
            '(SELECT metal_masters.name FROM metal_masters WHERE id = "id_metal")'
          ),
          "metal_name",
        ],
        [Sequelize.literal("karat_image.image_path"), "image_path"],
      ],

      order: [["name", "ASC"]],
      include: [{ model: Image, as: "karat_image", attributes: [],where:{company_info_id:company_info_id?.data},required:false }],
    });

    const metals = await MetalMaster.findAll({
      where: {
        id: metal.flat().map((t: any) => t),
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        company_info_id:company_info_id?.data,
      },
      attributes: [["id", "id_metal"], "name", "slug"],
      order: [["id", "ASC"]],
    });
    const gemstone_count = products.dataValues.birthstone_PDO.length;
    let metal_filter = [];
    const metal_value = metals.filter((t: any) => t.id != 1);
    for (let index = 0; index < metal_value.length; index++) {
      const element = metal_value[index];
      metal_filter.push(element.dataValues);
    }
    const metal_karat_list = [...metal_filter, ...metal_karat];

    const productDetail  = {...products.dataValues, birthstone_PMO: await Promise.all( products.dataValues.birthstone_PMO.map(async(value:any) => {
      return {...value.dataValues, price: await req.formatPrice(value.dataValues.price,null)}
    }))}
    return resSuccess({
      data: {
        products: productDetail,
        gemstone_count,
        Gemstone,
        size,
        length,
        tages,
        metal_tone,
        metal_karat,
        metals,
        metal_karat_list,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const birthstoneProductPriceFind = async (req: Request) => {
  try {
    const {BirthStoneProduct, DiamondGroupMaster} = initModels(req);
    const { id_product, metal, karat, select_gemstone, diamond_type } =
      req.body;

      const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const birthStoneProduct = await BirthStoneProduct.findOne({
      where: { id: id_product, is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data },
    });

    if (!(birthStoneProduct && BirthStoneProduct.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    if (BirthStoneProduct.dataValues.gemstone_count != select_gemstone.length) {
      return resBadRequest({ message: GEMSTONE_LIST_INVALID });
    }

    const product_base_price: any = await req.body.db_connection.query(
      `SELECT CASE WHEN birthstone_PMO.id_karat IS NULL 
    THEN(metal_master.metal_rate*birthstone_PMO.metal_weight+(COALESCE(making_charge, 0))+(COALESCE(finding_charge, 0))+(COALESCE(other_charge, 0))+(COALESCE(sum(DGM.rate*birthstone_PDO.count), 0))) 
    ELSE (metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*birthstone_PMO.metal_weight+(COALESCE(making_charge, 0))+(COALESCE(finding_charge, 0))+(COALESCE(other_charge, 0))+(COALESCE(sum(DGM.rate*birthstone_PDO.count), 0))) 
    END FROM birthstone_products 
    LEFT OUTER JOIN birthstone_product_metal_options 
    AS birthstone_PMO ON id_product = birthstone_products.id 
    LEFT OUTER JOIN metal_masters AS metal_master 
    ON metal_master.id = birthstone_PMO.id_metal 
    LEFT OUTER JOIN gold_kts ON gold_kts.id = birthstone_PMO.id_karat
    LEFT OUTER JOIN birthstone_product_diamond_options 
    AS birthstone_PDO ON birthstone_PDO.id_product = birthstone_products.id 
    AND birthstone_PDO.is_deleted = '0' AND birthstone_PDO.id_type = 1
    LEFT OUTER JOIN diamond_group_masters AS DGM ON DGM.id = birthstone_PDO.id_diamond_group
    WHERE CASE WHEN birthstone_PMO.id_karat IS NULL 
    THEN birthstone_products.id = ${id_product} 
    AND birthstone_PMO.id_metal = ${metal}
    ELSE birthstone_products.id = ${id_product} 
    AND birthstone_PMO.id_metal = ${metal}
    AND birthstone_PMO.id_karat = ${karat}
    AND birthstone_products.is_deleted = '0'
    AND birthstone_products.company_info_id = ${company_info_id?.data}
    END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, birthstone_PMO.metal_weight, birthstone_products.making_charge, birthstone_products.finding_charge, birthstone_products.other_charge,birthstone_PMO.id_karat, gold_kts.calculate_rate`,
      { type: QueryTypes.SELECT }
    );

    if (!(product_base_price && product_base_price.length > 0)) {
      return resNotFound({ data: PRODUCT_BASIC_PRICE_NOT_FOUND });
    }

    let gemstoneArray = [];
    for (const gemstone of select_gemstone) {
      const diamondGroup = await DiamondGroupMaster.findOne({
        where: {
          id_stone: gemstone.id_stone,
          id_mm_size: gemstone.id_mm_size,
          id_shape: gemstone.id_shape,
          id_cuts: gemstone.id_cut,
          is_deleted: DeletedStatus.No,
          company_info_id:company_info_id?.data,
        },
      });

      if (!(diamondGroup && diamondGroup.dataValues)) {
        return resNotFound({ message: DIAMOND_GROUP_NOT_FOUND });
      }
      gemstoneArray.push(
        diamond_type == 1
          ? diamondGroup.dataValues.rate
          : diamondGroup.dataValues.synthetic_rate
      );
    }
    const sumTotal = gemstoneArray.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    return resSuccess({
      data: {
        total_price:
          parseFloat(sumTotal) + parseFloat(product_base_price[0].case),
        selected_stone_price: parseFloat(sumTotal),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const addBirthStoneProductImage = async (req: Request) => {
  const { product_id } = req.body;
  const {BirthStoneProduct,Image} = initModels(req);
  try {
    const productDetails = await BirthStoneProduct.findOne({
      where: { id: product_id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (productDetails == null) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        req.file,
        IMAGE_TYPE.BirthstoneProduct,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.BirthstoneProduct,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      }
      if (id_image !== null) {
        const gemstonesInfo = await BirthStoneProduct.update(
          {
            product_image: id_image,
          },

          { where: { id: product_id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        );
        const AfterUpdatefindAboutUsSection = await BirthStoneProduct.findOne({
          where: { id: product_id, is_deleted: DeletedStatus.No},transaction:trn 
        });
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { birth_stone_product_id: productDetails?.dataValues?.id, product_image: productDetails?.dataValues?.product_image},
          new_data: {
            birth_stone_product_id: productDetails?.dataValues?.id, product_image: AfterUpdatefindAboutUsSection?.dataValues?.product_image }
        }], productDetails?.dataValues?.id,LogsActivityType.Edit, LogsType.AboutUs, req?.body?.session_res?.id_app_user,trn)
        if (gemstonesInfo) {
          await trn.commit();
          return resSuccess();
        }
      } else {
        await trn.rollback();
        return resErrorDataExit({ message: IMAGES_NOT_FOUND });
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

export const addBirthStoneProductWithPriceAPI = async (req: Request) => {
  try {
    const {BirthStoneProduct, BirthstoneProductCategory,BirthstoneProductMetalOption, BirthStoneProductDiamondOption,BirthstoneProductEngraving} = initModels(req);
    const {
      id_product,
      name,
      sku,
      sort_description,
      long_description,
      product_number,
      engraving_count,
      tag,
      product_categories,
      making_charge,
      finding_charge,
      other_charge,
      gemstone_count,
      product_engraving,
      product_metal_options,
      style_no,
      gender,
      size,
      length,
      product_diamond_options,
    } = req.body;

    const validTag = await validateProductTag({
      tag,
      oldTag: "",
    },req?.body?.session_res?.client_id,req);

    if (validTag.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validTag;
    }

    const validPC = await validateProductCategories({
      categories: product_categories,
      id_product: id_product !== 0 ? id_product : null,
    },req?.body?.session_res?.client_id, req);

    if (validPC.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validPC;
    }

    let activitylogs: any = { category: [], metals: [], diamonds: [], engraving:[] }
    const categories = [];
    const ProductEngraving = [];
    const GoldMetal = [];
    const diamonds = []

    const trn = await (req.body.db_connection).transaction();
    try {
      if (id_product === 0) {
        const productsku = await BirthStoneProduct.findOne({
          where: { sku: sku, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        });

        if (productsku != null) {
          return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
        }

        // slug create and same slug create then change the slug

        let slug = name
          .toLowerCase()
          .replaceAll(" ", "-")
          .replaceAll(/['/|]/g, "-");

        const sameSlugCount = await BirthStoneProduct.count({
          where: [
            columnValueLowerCase("name", name),
            { is_deleted: DeletedStatus.No },
            {company_info_id :req?.body?.session_res?.client_id}
          ],
        });

        if (sameSlugCount > 0) {
          slug = `${slug}-${sameSlugCount}`;
        }
        if (product_engraving.length != engraving_count) {
          trn.rollback();
          return resBadRequest({
            message: ENGRAVING_DATA_NOT_MATCH_ENGRAVING_COUNT,
          });
        }

        if (
          product_diamond_options.filter((t: any) => t.id_type == 2).length !=
          gemstone_count
        ) {
          trn.rollback();
          return resBadRequest({
            message: GEMSTONE_DATA_NOT_MATCH_GEMSTONE_COUNT,
          });
        }
        if (!product_metal_options && product_metal_options.length == 0)
          return resBadRequest({ message: METAL_IS_REQUIRES });

        const resProduct = await BirthStoneProduct.create(
          {
            name: name,
            sku: sku,
            sort_description: sort_description,
            long_description: long_description,
            tag: tag.join("|"),
            gender: gender == false ? null : gender.join("|"),
            slug: slug,
            making_charge,
            finding_charge,
            other_charge,
            product_number: product_number,
            engraving_count: engraving_count,
            gemstone_count: gemstone_count,
            is_active: ActiveStatus.Active,
            size: size == false ? null : size.join("|"),
            length: length == false ? null : length.join("|"),
            is_featured: FeaturedProductStatus.InFeatured,
            is_trending: TrendingProductStatus.InTrending,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
            style_no: style_no,
          },
          { transaction: trn }
        );

        for (const productCategory of product_categories) {
          const data = await BirthstoneProductCategory.create(
            {
              id_product: resProduct.dataValues.id,
              id_category: productCategory.id_category,
              id_sub_category: productCategory.id_sub_category,
              id_sub_sub_category: productCategory.id_sub_sub_category,
              created_by: req.body.session_res.id_app_user,
              company_info_id :req?.body?.session_res?.client_id,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          categories.push({...data?.dataValues});
        }

        if (product_engraving) {
          for (const engraving of product_engraving) {
            const data = await BirthstoneProductEngraving.create(
              {
                id_product: resProduct.dataValues.id,
                text: engraving.text,
                max_text_count: engraving.text_count,
                created_date: getLocalDate(),
                is_deleted: DeletedStatus.No,
                created_by: req.body.session_res.id_app_user,
                company_info_id :req?.body?.session_res?.client_id,
              },
              { transaction: trn }
            );
            ProductEngraving.push({...data?.dataValues});
          }
        }

        if (product_metal_options) {
          for (let pmgo of product_metal_options) {
            if (
              !pmgo.metal_weight &&
              pmgo.metal_weight == null &&
              pmgo.metal_weight == undefined
            ) {
              await trn.rollback();
              return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
            }
            if (pmgo.id === 0) {
              if (pmgo.metal_weight) {
                const data = await BirthstoneProductMetalOption.create(
                  {
                    id_product: resProduct.dataValues.id,
                    id_metal: pmgo.id_metal,
                    metal_weight: pmgo.metal_weight,
                    id_metal_tone: pmgo.id_metal_tone,
                    id_karat: pmgo.id_karat,
                    plu_no: pmgo.plu_no,
                    price: pmgo.price ? pmgo.price : null,
                    created_date: getLocalDate(),
                    created_by: req.body.session_res.id_app_user,
                    company_info_id :req?.body?.session_res?.client_id,
                  },
                  { transaction: trn }
                );
                GoldMetal.push({...data?.dataValues});
              }
            }
          }
        }

        if (product_diamond_options) {
          let pdod;

          for (pdod of product_diamond_options) {
            if (pdod.id === 0) {
              const data = await BirthStoneProductDiamondOption.create(
                {
                  id_product: resProduct.dataValues.id,
                  // id_diamond_group: diamondGroup ? diamondGroup.dataValues.id : null,
                  id_type: pdod.id_type,
                  count: pdod.count,
                  is_default: pdod.is_default,
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                  company_info_id :req?.body?.session_res?.client_id,
                  id_stone: pdod.id_stone,
                  id_shape: pdod.id_shape,
                  id_mm_size: pdod.id_mm_size,
                  id_color: pdod.id_color,
                  id_clarity: pdod.id_clarity,
                  id_carat: pdod.is_carat,
                  id_cut: pdod.id_cuts,
                  weight: pdod.weight,
                  is_deleted: pdod.is_deleted,
                },
                { transaction: trn }
              );
              diamonds.push({...data?.dataValues});

            }
          }
        }

        activitylogs = { ...activitylogs, category: [...categories], metals: [...GoldMetal], diamonds: [...diamonds], engraving:[...ProductEngraving] }
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: activitylogs}], resProduct?.dataValues?.id, LogsActivityType.Add, LogsType.BirthStoneProduct, req?.body?.session_res?.id_app_user,trn)
        await trn.commit();
        return resSuccess({ data: resProduct });
      } else {
        let productToBeUpdate;
        if (id_product !== 0) {
          productToBeUpdate = await BirthStoneProduct.findOne({
            where: {
              id: id_product,
              is_deleted: DeletedStatus.No,
              company_info_id :req?.body?.session_res?.client_id,
            },
          });

          if (!(productToBeUpdate && productToBeUpdate.dataValues)) {
            return resNotFound({ message: PRODUCT_NOT_FOUND });
          }
        }
        // check same SKU exited or not  (all sku is different)
        const productsku = await BirthStoneProduct.findOne({
          where: { id: { [Op.ne]: id_product }, sku: sku, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        });
        if (productsku != null) {
          return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
        }
        // slug create and same slug create then change the slug

        let slug = name
          .toLowerCase()
          .replaceAll(" ", "-")
          .replaceAll(/['/|]/g, "-");

        const sameSlugCount = await BirthStoneProduct.count({
          where: [
            columnValueLowerCase("name", name),
            { id: { [Op.ne]: id_product } },
            { is_deleted: DeletedStatus.No },
            {company_info_id :req?.body?.session_res?.client_id},
          ],
        });

        if (sameSlugCount > 0) {
          slug = `${slug}-${sameSlugCount}`;
        }
        if (
          product_engraving.filter((t: any) => t.is_deleted == DeletedStatus.No)
            .length != engraving_count
        ) {
          trn.rollback();
          return resBadRequest({
            message: ENGRAVING_DATA_NOT_MATCH_ENGRAVING_COUNT,
          });
        }

        if (
          product_diamond_options.filter(
            (t: any) => t.id_type == 2 && t.is_deleted == DeletedStatus.No
          ).length != gemstone_count
        ) {
          trn.rollback();
          return resBadRequest({
            message: GEMSTONE_DATA_NOT_MATCH_GEMSTONE_COUNT,
          });
        }
        const payload = {
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
          product_number: product_number,
          engraving_count: engraving_count,
          gemstone_count: gemstone_count,
          size: size == false ? null : size.join("|"),
          length: length == false ? null : length.join("|"),
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        }

        await BirthStoneProduct.update(
          payload,
          { where: { id: id_product,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        );
        activitylogs = { ...payload }
        if (product_engraving) {
          for (const engraving of product_engraving) {
            if (engraving.id == 0) {
              const data = await BirthstoneProductEngraving.create(
                {
                  id_product: id_product,
                  text: engraving.text,
                  max_text_count: engraving.text_count,
                  created_date: getLocalDate(),
                  is_deleted: DeletedStatus.No,
                  created_by: req.body.session_res.id_app_user,
                  company_info_id :req?.body?.session_res?.client_id,
                },
                { transaction: trn }
              );
              ProductEngraving.push({...data?.dataValues});
            } else {
              let engravingData = await BirthstoneProductEngraving.findOne({
                where: { id: engraving.id, is_deleted: DeletedStatus.No, company_info_id :req?.body?.session_res?.client_id },
                transaction: trn,
              });

              if (!(engravingData && engravingData.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: ENGRAVING_OPTION_NOT_FOUND });
              }

              await BirthstoneProductEngraving.update(
                {
                  id_product: id_product,
                  text: engraving.text,
                  max_text_count: engraving.text_count,
                  modified_date: getLocalDate(),
                  is_deleted: engraving.is_deleted,
                  modified_by: req.body.session_res.id_app_user,
                },
                {
                  where: { id: engraving.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
                  transaction: trn,
                }
              );
              const data = {
                id_product: engravingData?.dataValues?.id_product,
                text: engravingData?.dataValues?.text,
                max_text_count: engravingData?.dataValues?.max_text_count,
                modified_date: getLocalDate(),
                is_deleted: engravingData?.dataValues?.is_deleted,
                modified_by: req.body.session_res.id_app_user,
              }
              ProductEngraving.push(data);

            }
          }
        }

        for (const productCategory of product_categories) {
          if (productCategory.id === 0) {
            const data = await BirthstoneProductCategory.create(
              {
                id_product: id_product,
                id_category: productCategory.id_category,
                id_sub_category: productCategory.id_sub_category,
                id_sub_sub_category: productCategory.id_sub_sub_category,
                created_by: req.body.session_res.id_app_user,
                company_info_id :req?.body?.session_res?.client_id,
                created_date: getLocalDate(),
                is_deleted: productCategory.is_deleted,
              },
              { transaction: trn }
            );
            categories.push({...data?.dataValues});

          } else {
            let CategoryData = await BirthstoneProductCategory.findOne({
              where: { id: productCategory.id_category, is_deleted: DeletedStatus.No },
              transaction: trn,
            });
            await BirthstoneProductCategory.update(
              {
                id_category: productCategory.id_category,
                id_sub_category: productCategory.id_sub_category,
                id_sub_sub_category: productCategory.id_sub_sub_category,
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
                is_deleted: productCategory.is_deleted,
              },
              { where: { id: productCategory.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
            );
            const data = {
              id_category: CategoryData?.dataValues?.id_category,
              id_sub_category: CategoryData?.dataValues?.id_sub_category,
              id_sub_sub_category: CategoryData?.dataValues?.id_sub_sub_category,
              modified_by: CategoryData?.dataValues?.req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
              is_deleted: CategoryData?.dataValues?.is_deleted,
            }
            categories.push(data);
          }
        }
        if (validPC.data.length > 0) {
          for (const productCategory of validPC.data) {
            await BirthstoneProductCategory.update(
              {
                is_deleted: DeletedStatus.yes,
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
              },
              { where: { id: productCategory.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
            );
          }
        }
        if (product_metal_options) {
          for (let pmgo of product_metal_options) {
            if (
              !pmgo.metal_weight &&
              pmgo.metal_weight == null &&
              pmgo.metal_weight == undefined
            ) {
              await trn.rollback();
              return resBadRequest({ message: GOLD_WEIGHT_REQUIRES });
            }
            if (pmgo.id === 0) {
              if (pmgo.metal_weight) {
                const data = await BirthstoneProductMetalOption.create(
                  {
                    id_product: id_product,
                    id_metal: pmgo.id_metal,
                    metal_weight: Number(pmgo.metal_weight),
                    id_metal_tone: pmgo.id_metal_tone,
                    id_karat: pmgo.id_karat,
                    plu_no: pmgo.plu_no,
                    price: pmgo.price ? pmgo.price : null,
                    created_date: getLocalDate(),
                    created_by: req.body.session_res.id_app_user,
                    company_info_id :req?.body?.session_res?.client_id,
                    is_deleted: pmgo.is_deleted,
                  },
                  { transaction: trn }
                );
                GoldMetal.push({...data?.dataValues});
              }
            } else {
              let productMetal = await BirthstoneProductMetalOption.findOne({
                where: { id: pmgo.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
                transaction: trn,
              });

              if (!(productMetal && productMetal.dataValues)) {
                await trn.rollback();
                return resNotFound({ message: PRODUCT_METAL_OPTION_NOT_FOUND });
              }

              await BirthstoneProductMetalOption.update(
                {
                  id_product: id_product,
                  id_metal: pmgo.id_metal,
                  metal_weight: Number(pmgo.metal_weight),
                  id_metal_tone: pmgo.id_metal_tone,
                  id_karat: pmgo.id_karat,
                  plu_no: pmgo.plu_no,
                  price: pmgo.price ? pmgo.price : null,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                  is_deleted: pmgo.is_deleted,
                },
                { where: { id: pmgo.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
              );
              const data = {
                  id_product: productMetal?.dataValues?.id_product,
                  id_metal: productMetal?.dataValues?.id_metal,
                  metal_weight: productMetal?.dataValues?.metal_weight,
                  id_metal_tone: productMetal?.dataValues?.id_metal_tone,
                  id_karat: productMetal?.dataValues?.id_karat,
                  plu_no: productMetal?.dataValues?.plu_no,
                  price: productMetal?.dataValues?.price ? productMetal?.dataValues?.price : null,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                  is_deleted: productMetal?.dataValues?.is_deleted,
              }
              GoldMetal.push(data);

            }
          }
        }

        if (product_diamond_options) {
          let pdod;

          for (pdod of product_diamond_options) {
            if (pdod.id === 0) {
              const data = await BirthStoneProductDiamondOption.create(
                {
                  id_product: id_product,
                  // id_diamond_group: diamondGroup ? diamondGroup.dataValues.id : null,
                  id_type: pdod.id_type,
                  count: pdod.count,
                  is_default: pdod.is_default,
                  created_date: getLocalDate(),
                  created_by: req.body.session_res.id_app_user,
                  company_info_id :req?.body?.session_res?.client_id,
                  id_stone: pdod.id_stone,
                  id_shape: pdod.id_shape,
                  id_mm_size: pdod.id_mm_size,
                  id_color: pdod.id_color,
                  id_clarity: pdod.id_clarity,
                  id_carat: pdod.is_carat,
                  id_cut: pdod.id_cuts,
                  weight: pdod.weight,
                  is_deleted: pdod.is_deleted,
                },
                { transaction: trn }
              );
              diamonds.push({...data?.dataValues});
            } else {
              let diamondOption = await BirthStoneProductDiamondOption.findOne({
                where: { id: pdod.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
                transaction: trn,
              });

              if (!(diamondOption && diamondOption.dataValues)) {
                await trn.rollback();
                return resNotFound({
                  message: PRODUCT_DIAMOND_OPTION_NOT_FOUND,
                });
              }

              await BirthStoneProductDiamondOption.update(
                {
                  id_product: id_product,
                  // id_diamond_group: diamondGroup ? diamondGroup.dataValues.id : null,
                  id_type: pdod.id_type,
                  count: pdod.count,
                  is_default: pdod.is_default,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                  id_stone: pdod.id_stone,
                  id_shape: pdod.id_shape,
                  id_mm_size: pdod.id_mm_size,
                  id_color: pdod.id_color,
                  id_clarity: pdod.id_clarity,
                  id_carat: pdod.is_carat,
                  id_cut: pdod.id_cuts,
                  weight: pdod.weight,
                  is_deleted: pdod.is_deleted,
                },

                { where: { id: pdod.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
              );
              const data = {
                id_product: diamondOption?.dataValues?.id_product,
                  // id_diamond_group: diamondOption?.dataValues?.diamondGroup ? diamondGroup..dataVadataValues.id : diamondOption?.dataValues?.null,
                  id_type: diamondOption?.dataValues?.id_type,
                  count: diamondOption?.dataValues?.count,
                  is_default: diamondOption?.dataValues?.is_default,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user,
                  id_stone: diamondOption?.dataValues?.id_stone,
                  id_shape: diamondOption?.dataValues?.id_shape,
                  id_mm_size: diamondOption?.dataValues?.id_mm_size,
                  id_color: diamondOption?.dataValues?.id_color,
                  id_clarity: diamondOption?.dataValues?.id_clarity,
                  id_carat: diamondOption?.dataValues?.is_carat,
                  id_cut: diamondOption?.dataValues?.id_cuts,
                  weight: diamondOption?.dataValues?.weight,
                  is_deleted: diamondOption?.dataValues?.is_deleted,
              }
              diamonds.push(data);
            }
          }
        }
        activitylogs = { ...activitylogs, category: [...categories], metals: [...GoldMetal], diamonds: [...diamonds], engraving:[...ProductEngraving] }
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{old_data: activitylogs}], id_product, LogsActivityType.Add, LogsType.BirthStoneProduct, req?.body?.session_res?.id_app_user,trn)
       
        await trn.commit();
        return resSuccess({ data: productToBeUpdate });
      }
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (error) {
    return resUnknownError({ data: error });
  }
};
