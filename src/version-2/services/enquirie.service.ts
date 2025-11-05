import { Request } from "express";
import Enquiries from "../model/enquiries.model";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
} from "../../utils/shared-functions";
import { Op, QueryTypes, Sequelize } from "sequelize";
import ProductEnquiries from "../model/product-enquiry.model";
import Product from "../model/product.model";
import { RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import ProductMetalOption from "../model/product-metal-option.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import dbContext from "../../config/db-context";
import ProductImage from "../model/product-image.model";
import { PRODUCT_IMAGE_TYPE } from "../../utils/app-enumeration";

export const getAllGeneralEnquiries = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { enquirie_type: "1" },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              {
                first_name: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              { last_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { email: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await Enquiries.count({
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

    const result = await Enquiries.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "message",
        "created_date",
        "date",
        "time",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllProductEnquiries = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { full_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { email: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { message: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) from products WHERE id = product_id AND name ILIKE  '%${pagination.search_text}%')`
                ),
                ">",
                "0"
              ),
              Sequelize.where(
                Sequelize.literal(
                  `(SELECT COUNT(*) from products WHERE id = product_id AND sku ILIKE  '%${pagination.search_text}%')`
                ),
                ">",
                "0"
              ),
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await ProductEnquiries.count({
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

    const result = await ProductEnquiries.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "full_name",
        "email",
        "contact_number",
        "message",
        "product_id",
        "admin_action",
        "admin_comments",
        "date",
        "time",
        [
          Sequelize.literal(
            '(SELECT products.name FROM products WHERE products.id = "product_id")'
          ),
          "product_name",
        ],
        [
          Sequelize.literal(
            '(SELECT products.sku FROM products WHERE products.id = "product_id")'
          ),
          "product_sku",
        ],
        "product_json",
      ],
      include: [
        {
          required: false,
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "sku",
            "sort_description",
            "long_description",
          ],
        },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const updateProductEnquiries = async (req: Request) => {
  try {
    const { id, action, comments } = req.body;

    const productEnquiries = await ProductEnquiries.findOne({
      where: { id: id },
    });
    if (productEnquiries) {
      const enquiriesActionInfo = await ProductEnquiries.update(
        {
          admin_action: action,
          admin_comments: comments,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: productEnquiries.dataValues.id } }
      );
      if (enquiriesActionInfo) {
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error;
  }
};

export const productEnquiriesDetails = async (req: Request) => {
  try {
    const { id } = req.body;

    const inquiriesDetails = await ProductEnquiries.findOne({
      where: { id: id },
      attributes: [
        "id",
        "full_name",
        "email",
        "product_id",
        "contact_number",
        "message",
        "admin_action",
        "admin_comments",
        "date",
        "time",
        [Sequelize.literal('"product"."name"'), "product_name"],
        [Sequelize.literal('"product"."sku"'), "product_sku"],
        [
          Sequelize.literal('"product"."sort_description"'),
          "product_sort_description",
        ],
        [
          Sequelize.literal(
            `(SELECT metal_masters.name FROM metal_masters WHERE metal_masters.id = CAST (product_enquiries.product_json ->> 'metal_id' AS integer))`
          ),
          "metal",
        ],
        [
          Sequelize.literal(
            `(SELECT gold_kts.name FROM gold_kts WHERE gold_kts.id = CAST (product_enquiries.product_json ->> 'karat_id' AS integer))`
          ),
          "Karat",
        ],
        [
          Sequelize.literal(
            `(SELECT metal_tones.name FROM metal_tones WHERE metal_tones.id = CAST (product_enquiries.product_json ->> 'metal_tone_id' AS integer))`
          ),
          "Metal_tone",
        ],
        [
          Sequelize.literal(
            `(SELECT items_sizes.size FROM items_sizes WHERE items_sizes.id = CAST (product_enquiries.product_json ->> 'size' AS integer))`
          ),
          "product_size",
        ],
        [
          Sequelize.literal(
            `(SELECT items_lengths.length FROM items_lengths WHERE items_lengths.id = CAST (product_enquiries.product_json ->> 'length' AS integer))`
          ),
          "product_length",
        ],
        "product_json",
      ],
      include: [
        {
          required: false,
          model: Product,
          as: "product",
          attributes: [],
        },
      ],
    });

    const product_image = await ProductImage.findAll({
      where: {
        id_product: inquiriesDetails?.dataValues.product_id,
        image_type: PRODUCT_IMAGE_TYPE.Feature,
        id_metal_tone: inquiriesDetails?.dataValues.product_json.metal_tone_id,
      },
      attributes: ["image_path"],
    });

    if (inquiriesDetails == null) {
      return resNotFound();
    }

    return resSuccess({ data: { inquiriesDetails, product_image } });
  } catch (error) {
    throw error;
  }
};
