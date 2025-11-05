import { Request } from "express";
import GiftSetProduct from "../model/gift-set-product/gift_set_product.model";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  IMAGES_NOT_FOUND,
  PRODUCT_EXIST_WITH_SAME_SKU,
  PRODUCT_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  THUMB_IMAGE_ONLY_ONE,
  VIDEO_ONLY_ONE,
} from "../../utils/app-messages";
import {
  ActiveStatus,
  AllProductTypes,
  GIFT_PRODUCT_IMAGE_TYPE,
} from "../../utils/app-enumeration";
import dbContext from "../../config/db-context";
import { moveFileToS3ByTypeAndLocation } from "../../helpers/file.helper";
import {
  PRODUCT_FILE_LOCATION,
  PRODUCT_PER_PAGE_ROW,
} from "../../utils/app-constants";
import GiftSetProductImages from "../model/gift-set-product/gift_set_product_image.model";
import { Op, Sequelize } from "sequelize";
import BrandData from "../model/master/attributes/brands.model";

export const addGiftSetProductAPI = async (req: Request) => {
  try {
    const {
      sku,
      product_title,
      short_description,
      brand_id,
      long_description,
      tags,
      gender,
      price,
      thumb_images,
      featured_images,
    } = req.body;

    let slug = product_title.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");
    const productsku = await GiftSetProduct.findOne({
      where: { sku: sku, is_deleted: "0" },
    });

    if (productsku != null) {
      return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
    }

    const trn = await dbContext.transaction();

    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const payload = {
        product_title: product_title,
        sku: sku,
        short_des: short_description,
        long_des: long_description,
        tags: tags && tags.join("|"),
        price: parseFloat(price),
        gender: gender && gender.join("|"),
        is_active: ActiveStatus.Active,
        is_deleted: "0",
        slug: sku,
        brand_id,
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
      };

      const configProduct = await GiftSetProduct.create(payload, {
        transaction: trn,
      });
      let videoFile;

      if (files["video"]) {
        if (files["video"].length > 1) {
          await trn.rollback();
          return resUnknownError({ message: VIDEO_ONLY_ONE });
        }

        for (videoFile of files["video"]) {
          const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
            videoFile,
            `${PRODUCT_FILE_LOCATION}/gift/${sku}`,
            null
          );
          if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return resMFTL;
          }

          await GiftSetProductImages.create(
            {
              id_product: configProduct.dataValues.id,
              image_path: resMFTL.data,
              image_type: GIFT_PRODUCT_IMAGE_TYPE.Vedio,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }
      }

      let thumbImageFile;

      if (files["thumb_images"].length > 1) {
        await trn.rollback();
        return resUnknownError({ message: THUMB_IMAGE_ONLY_ONE });
      }

      if (files["thumb_images"]) {
        for (thumbImageFile of files["thumb_images"]) {
          const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
            thumbImageFile,
            `${PRODUCT_FILE_LOCATION}/gift/${sku}`,
            null
          );
          if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return resMFTL;
          }

          await GiftSetProductImages.create(
            {
              id_product: configProduct.dataValues.id,
              image_path: resMFTL.data,
              image_type: GIFT_PRODUCT_IMAGE_TYPE.Thumb,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }
      }

      if (files["featured_images"]) {
        let featuredImageFile;
        for (featuredImageFile of files["featured_images"]) {
          const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
            featuredImageFile,
            `${PRODUCT_FILE_LOCATION}/gift/${sku}`,
            null
          );
          if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return resMFTL;
          }

          await GiftSetProductImages.create(
            {
              id_product: configProduct.dataValues.id,
              image_path: resMFTL.data,
              image_type: GIFT_PRODUCT_IMAGE_TYPE.Featured,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }
      }

      await trn.commit();
      return resSuccess({});
    } catch (e) {
      console.log("error", e);
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (error) {
    throw error;
  }
};

export const getAllGiftSetProducts = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              {
                product_title: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
              { sku: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { short_des: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { price: { [Op.eq]: pagination.search_text } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await GiftSetProduct.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

      paginationProps = {
        limit: pagination.per_page_rows,
        offset: (pagination.current_page - 1) * pagination.per_page_rows,
      };
    }

    const result = await GiftSetProduct.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "product_title",
        "sku",
        "short_des",
        "long_des",
        "brand_id",
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."tags" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."tags", '|')::int[] END`
          ),
          "tags",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."gender", '|')::int[] END`
          ),
          "genders",
        ],
        "price",
        "is_active",
        "slug",
      ],
      include: [
        {
          required: false,
          model: GiftSetProductImages,
          as: "gift_product_images",
          attributes: ["id", "image_path", "image_type"],
          where: { is_deleted: "0" },
        },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIDGiftSetProducts = async (req: Request) => {
  try {
    const { slug } = req.body;

    let where = [{ is_deleted: "0" }, { slug: slug }];

    const result = await GiftSetProduct.findOne({
      where,
      attributes: [
        "id",
        "product_title",
        "sku",
        "short_des",
        "long_des",
        "brand_id",
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."tags" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."tags", '|')::int[] END`
          ),
          "tags",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."gender", '|')::int[] END`
          ),
          "genders",
        ],
        "price",
        "is_active",
        "slug",
      ],
      include: [
        {
          required: false,
          model: GiftSetProductImages,
          as: "gift_product_images",
          attributes: ["id", "image_path", "image_type"],
          where: { is_deleted: "0" },
        },
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const editGiftSetProductApi = async (req: Request) => {
  try {
    const {
      id,
      sku,
      product_title,
      brand_id,
      short_description,
      long_description,
      tags,
      gender,
      price,
    } = req.body;

    let slug = product_title.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");
    const products = await GiftSetProduct.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (!(products && products.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const productsku = await GiftSetProduct.findOne({
      where: { sku: sku, id: { [Op.ne]: id }, is_deleted: "0" },
    });

    if (productsku != null) {
      return resErrorDataExit({ message: PRODUCT_EXIST_WITH_SAME_SKU });
    }

    const trn = await dbContext.transaction();

    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const payload = {
        product_title: product_title,
        sku: sku,
        short_des: short_description,
        long_des: long_description,
        tags: tags && tags.join("|"),
        price: price,
        gender: gender && gender.join("|"),
        slug: sku,
        brand_id,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      };

      const configProduct = await GiftSetProduct.update(payload, {
        where: { id: id, is_deleted: "0" },
        transaction: trn,
      });
      console.log("-------------------------", files["video"]);
      if (files["video"]) {
        if (files["video"].length > 1) {
          return resUnknownError({ message: VIDEO_ONLY_ONE });
        }

        const vedioFind = await GiftSetProductImages.findAll({
          where: {
            id_product: products.dataValues.id,
            image_type: GIFT_PRODUCT_IMAGE_TYPE.Vedio,
          },
        });

        for (let imageList of vedioFind) {
          await GiftSetProductImages.destroy({
            where: {
              id: imageList.dataValues.id,
              id_product: imageList.dataValues.id_product,
            },
          });
        }

        let videoFile;
        for (videoFile of files["video"]) {
          const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
            videoFile,
            `${PRODUCT_FILE_LOCATION}/gift/${sku}`,
            null
          );
          if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return resMFTL;
          }

          await GiftSetProductImages.create(
            {
              id_product: id,
              image_path: resMFTL.data,
              image_type: GIFT_PRODUCT_IMAGE_TYPE.Vedio,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }
      }

      if (files["thumb_images"]) {
        if (files["thumb_images"].length > 1) {
          return resUnknownError({ message: THUMB_IMAGE_ONLY_ONE });
        }

        const thumbImageFind = await GiftSetProductImages.findAll({
          where: {
            id_product: products.dataValues.id,
            image_type: GIFT_PRODUCT_IMAGE_TYPE.Thumb,
          },
        });

        for (let imageList of thumbImageFind) {
          await GiftSetProductImages.update(
            {
              is_deleted: "1",
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user,
            },
            {
              where: {
                id: imageList.dataValues.id,
                id_product: imageList.dataValues.id_product,
              },
            }
          );
        }

        let thumbImageFile;
        for (thumbImageFile of files["thumb_images"]) {
          const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
            thumbImageFile,
            `${PRODUCT_FILE_LOCATION}/gift/${sku}`,
            null
          );
          if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return resMFTL;
          }

          await GiftSetProductImages.create(
            {
              id_product: id,
              image_path: resMFTL.data,
              image_type: GIFT_PRODUCT_IMAGE_TYPE.Thumb,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }
      }

      if (files["featured_images"]) {
        let featuredImageFile;
        for (featuredImageFile of files["featured_images"]) {
          const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
            featuredImageFile,
            `${PRODUCT_FILE_LOCATION}/gift/${sku}`,
            null
          );
          if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return resMFTL;
          }

          await GiftSetProductImages.create(
            {
              id_product: id,
              image_path: resMFTL.data,
              image_type: GIFT_PRODUCT_IMAGE_TYPE.Featured,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
        }
      }

      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      console.log("error", e);
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (error) {
    throw error;
  }
};

export const statusUpdateGiftSetProduct = async (req: Request) => {
  try {
    const GiftSetProductExists = await GiftSetProduct.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    if (GiftSetProductExists) {
      const giftSetInfo = await GiftSetProduct.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: GiftSetProductExists.dataValues.id } }
      );
      if (giftSetInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const deleteGiftSetProduct = async (req: Request) => {
  try {
    const GiftSetProductExists = await GiftSetProduct.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    if (GiftSetProductExists) {
      const giftSetInfo = await GiftSetProduct.update(
        {
          is_deleted: "1",
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: GiftSetProductExists.dataValues.id } }
      );
      if (giftSetInfo) {
        return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const deleteGiftSetProductImage = async (req: Request) => {
  try {
    const { id, id_product } = req.body;
    const product = await GiftSetProduct.findOne({
      where: { id: id_product, is_deleted: "0" },
    });

    if (!(product && product.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const productImage = await GiftSetProductImages.findOne({
      where: { id: id, is_deleted: "0" },
    });
    if (!(productImage && productImage.dataValues)) {
      return resNotFound({ message: IMAGES_NOT_FOUND });
    }

    const giftSetInfo = await GiftSetProductImages.update(
      {
        is_deleted: "1",
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, id_product: product?.dataValues.id } }
    );
    if (giftSetInfo) {
      return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
    }
  } catch (error) {
    throw error;
  }
};

export const getAllGiftSetProductsUserSide = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };

    pagination.per_page_rows = PRODUCT_PER_PAGE_ROW;
    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      req.query.brand
        ? Sequelize.where(
            Sequelize.literal(
              `(SELECT COUNT(*) FROM brands WHERE brands.id = gift_set_products.brand_id AND brands.name ILIKE  '%${req.query.brand}%')`
            ),
            ">",
            "0"
          )
        : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    const totalItems = await GiftSetProduct.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    paginationProps = {
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
    };

    const result = await GiftSetProduct.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "product_title",
        "sku",
        "short_des",
        "long_des",
        "brand_id",
        [
          Sequelize.literal(
            `(SELECT id FROM wishlist_products WHERE product_id = "gift_set_products"."id" AND product_type = ${
              AllProductTypes.GiftSet_product
            }  AND user_id = ${
              req.query.user_id && req.query.user_id != ""
                ? req.query.user_id
                : 0
            })`
          ),
          "wishlist_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."tags" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."tags", '|')::int[] END`
          ),
          "tags",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."gender", '|')::int[] END`
          ),
          "genders",
        ],
        "price",
        "is_active",
        "slug",
      ],
      include: [
        {
          required: false,
          model: GiftSetProductImages,
          as: "gift_product_images",
          attributes: ["id", "image_path", "image_type"],
          where: { is_deleted: "0" },
        },
      ],
    });

    return resSuccess({ data: { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIDGiftSetProductsUsers = async (req: Request) => {
  try {
    const { slug } = req.body;

    let where = [
      { is_deleted: "0" },
      { is_active: ActiveStatus.Active },
      { slug: slug },
    ];

    const result = await GiftSetProduct.findOne({
      where,
      attributes: [
        "id",
        "product_title",
        "sku",
        "short_des",
        "long_des",
        "brand_id",
        [
          Sequelize.literal(
            `(SELECT id FROM wishlist_products WHERE product_id = "gift_set_products"."id" AND product_type = ${
              AllProductTypes.GiftSet_product
            }  AND user_id = ${
              req.body.user_id && req.body.user_id != "" ? req.body.user_id : 0
            })`
          ),
          "wishlist_id",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."tags" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."tags", '|')::int[] END`
          ),
          "tags",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "gift_set_products"."gender" IS NULL THEN '{}'::int[] ELSE string_to_array("gift_set_products"."gender", '|')::int[] END`
          ),
          "genders",
        ],
        "price",
        "is_active",
        "slug",
      ],
      include: [
        {
          required: false,
          model: GiftSetProductImages,
          as: "gift_product_images",
          attributes: ["id", "image_path", "image_type"],
          where: { is_deleted: "0" },
        },
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
