import { Request } from "express";
import Enquiries from "../../model/enquiries.model";
import { getLocalDate, resSuccess } from "../../../utils/shared-functions";
import ProductEnquiries from "../../model/product-enquiry.model";
import { Sequelize } from "sequelize";
import Product from "../../model/product.model";
import { PRODUCT_IMAGE_TYPE } from "../../../utils/app-enumeration";
import { FRONT_END_BASE_URL, IMAGE_PATH } from "../../../config/env.var";
import {
  mailProductInquiryFoeCustomerReceived,
  mailProductInquiryForAdminReceived,
  mailAppointmentForAdminReceived,
  mailAppointmentForCustomerReceived,
} from "../mail.service";
import CompanyInfo from "../../model/companyinfo.model";

export const addEnquiries = async (req: Request) => {
  const { first_name, last_name, email, date, time, phone_number, message } =
    req.body;
  try {
    const payload = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone_number: phone_number,
      message: message,
      date: date,
      time: time,
      enquirie_type: 1,
      created_date: getLocalDate(),
      created_by: req.body.session_res.id_app_user,
    };
    const inquiry = await Enquiries.create(payload);
    const productInquiries = await Enquiries.findOne({
      where: { id: inquiry.dataValues.id },
      attributes: [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "message",
        "date",
        "time",
      ],
    });

    let logo_image = IMAGE_PATH;
    let frontend_url = FRONT_END_BASE_URL;

    const [year, month, day] =
      productInquiries?.dataValues.date != null
        ? productInquiries?.dataValues.date &&
          productInquiries?.dataValues.date.split("-")
        : [0, 0, 0];

    console.log("outputDate", year, month, day);

    const outputDate = `${day}-${month}-${year}`;

    const mailPayload = {
      toEmailAddress: productInquiries?.dataValues.email,
      contentTobeReplaced: {
        full_name: `${productInquiries?.dataValues.first_name}  ${productInquiries?.dataValues.last_name}`,
        logo_image,
        frontend_url,
        date: outputDate,
        time: productInquiries?.dataValues.time,
      },
    };
    const companyInfo = await CompanyInfo.findOne({
      where: { id: 1 },
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
        "dark_id_image",
      ],
    });

    await mailAppointmentForCustomerReceived(mailPayload);
    const adminMailPayload = {
      toEmailAddress: companyInfo?.dataValues.company_email,
      contentTobeReplaced: {
        full_name: `${productInquiries?.dataValues.first_name}  ${productInquiries?.dataValues.last_name}`,
        logo_image,
        frontend_url,
        productInquiries: {
          message: productInquiries?.dataValues.message,
          date: outputDate,
          time: productInquiries?.dataValues.time,
          email: productInquiries?.dataValues.email,
          contact_number: productInquiries?.dataValues.phone_number,
        },
      },
    };

    console.log("companyInfo?.dataValues.company_email", outputDate);

    await mailAppointmentForAdminReceived(adminMailPayload);

    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const addProductEnquiries = async (req: Request) => {
  const {
    full_name,
    email,
    contact_number,
    message,
    product_id,
    metal_id,
    karat_id,
    metal_tone_id,
    size,
    length,
    date,
    time,
  } = req.body;
  try {
    const payload = {
      full_name: full_name,
      email: email,
      contact_number: contact_number,
      message: message,
      date: date,
      time: time,
      product_id: product_id,
      product_json: { metal_id, karat_id, metal_tone_id, size, length },
      created_date: getLocalDate(),
      admin_action: 0,
      created_by: req.body.session_res.id_app_user,
    };
    const inquiry = await ProductEnquiries.create(payload);

    const productInquiries = await ProductEnquiries.findOne({
      where: { id: inquiry.dataValues.id },
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
        [
          Sequelize.literal(
            `(SELECT CONCAT('${IMAGE_PATH}/' ,image_path) FROM product_images WHERE id_product = "product_id" AND image_type = ${PRODUCT_IMAGE_TYPE.Feature} AND id_metal_tone = CAST (product_enquiries.product_json ->> 'metal_tone_id' AS integer) ORDER BY id ASC LIMIT 1)`
          ),
          "product_image",
        ],
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

    let logo_image = IMAGE_PATH;
    let frontend_url = FRONT_END_BASE_URL;

    const mailPayload = {
      toEmailAddress: productInquiries?.dataValues.email,
      contentTobeReplaced: {
        full_name: productInquiries?.dataValues.full_name,
        logo_image,
        frontend_url,
        productInquiries: productInquiries?.dataValues,
      },
    };

    const companyInfo = await CompanyInfo.findOne({
      where: { id: 1 },
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
        "dark_id_image",
      ],
    });

    await mailProductInquiryFoeCustomerReceived(mailPayload);

    console.log("companyInfo", companyInfo?.dataValues.company_email);

    const adminMailPayload = {
      toEmailAddress: companyInfo?.dataValues.company_email,
      contentTobeReplaced: {
        full_name: productInquiries?.dataValues.full_name,
        logo_image,
        frontend_url,
        productInquiries: productInquiries?.dataValues,
      },
    };

    await mailProductInquiryForAdminReceived(adminMailPayload);

    return resSuccess({ data: inquiry });
  } catch (error) {
    throw error;
  }
};
