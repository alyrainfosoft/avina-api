import { Request } from "express";
import multer from "multer";
import { Op, Sequelize } from "sequelize";
import dbContext from "../../config/db-context";
import {
  moveFileToS3ByType,
  moveFileToS3ByTypeAndLocation,
} from "../../helpers/file.helper";
import CompanyInfo from "../model/companyinfo.model";
import Image from "../model/image.model";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
} from "../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import {
  encryptResponseData,
  getLocalDate,
  imageAddAndEditInDBAndS3ForOriginalFileName,
  resNotFound,
  resSuccess,
} from "../../utils/shared-functions";
import TaxMaster from "../model/master/tax.model";
import staticPageData from "../model/static_page.model";

export const addCompanyInfo = async (req: Request) => {
  const {
    company_name,
    company_email,
    company_phone,
    copy_right,
    sort_about,
    web_link,
    facebook_link,
    insta_link,
    youtube_link,
    linkdln_link,
    twitter_link,
    web_primary_color,
    web_secondary_color,
    announce_color,
    announce_text,
    announce_text_color,
    company_address,
    est_shipping_day = null,
    pinterest_link,
    gst_number = null
  } = req.body;

  try {
    const payload = {
      company_name: company_name,
      company_email: company_email,
      company_phone: company_phone,
      copy_right: copy_right,
      sort_about: sort_about,
      web_link: web_link,
      facebook_link: facebook_link,
      insta_link: insta_link,
      youtube_link: youtube_link,
      linkdln_link: linkdln_link,
      twitter_link: twitter_link,
      pinterest_link: pinterest_link,
      web_primary_color: web_primary_color,
      web_secondary_color: web_secondary_color,
      announce_is_active: ActiveStatus.Active,
      announce_color: announce_color,
      announce_text: announce_text,
      announce_text_color: announce_text_color,
      created_date: getLocalDate(),
      company_address: company_address,
      est_shipping_day: est_shipping_day,
      gst_number,
      created_by: req.body.session_res.id_app_user,
    };
    await CompanyInfo.create(payload);
    console.log(payload);
    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const updateCompanyInfo = async (req: Request) => {
  const {
    id,
    company_name,
    company_email,
    company_phone,
    copy_right,
    sort_about,
    web_link,
    facebook_link,
    insta_link,
    youtube_link,
    linkdln_link,
    twitter_link,
    pinterest_link,
    web_primary_color,
    web_secondary_color,
    announce_color,
    announce_text,
    announce_text_color,
    company_address,
    est_shipping_day = null,
    announce_is_active,
    gst_number = null
  } = req.body;

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const companyInfo = await CompanyInfo.findOne({
      where: { id: id },
    });

    const trn = await dbContext.transaction();

    try {
      let darkIdImage = null;
      if (files["dark_image"]) {
        let findImage = null;
        if (companyInfo.dataValues.dark_id_image) {
          findImage = await Image.findOne({
            where: { id: companyInfo.dataValues.dark_id_image },
            transaction: trn,
          });
        }
        const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
          req,
          files["dark_image"][0],
          IMAGE_TYPE.headerLogo,
          req.body.session_res.id_app_user,
          findImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        darkIdImage = imageData.data;
      }
      let lightIdImage = null;
      if (files["light_image"]) {
        let findImage = null;
        if (companyInfo.dataValues.light_id_image) {
          findImage = await Image.findOne({
            where: { id: companyInfo.dataValues.light_id_image },
            transaction: trn,
          });
        }
        const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
          req,
          files["light_image"][0],
          IMAGE_TYPE.footerLogo,
          req.body.session_res.id_app_user,
          findImage
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        lightIdImage = imageData.data;
      }
      let faviconIdImage = null;
      if (files["favicon_image"]) {
        let findImage = null;
        if (companyInfo.dataValues.favicon_image) {
          findImage = await Image.findOne({
            where: { id: companyInfo.dataValues.favicon_image },
            transaction: trn,
          });
        }
        const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
          req,
          files["favicon_image"][0],
          IMAGE_TYPE.FaviconImage,
          req.body.session_res.id_app_user,
          findImage
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        faviconIdImage = imageData.data;
      }

      if (companyInfo) {
        const updatedCompanyInfo = await CompanyInfo.update(
          {
            company_name: company_name,
            company_email: company_email,
            company_phone: company_phone,
            copy_right: copy_right,
            sort_about: sort_about,
            dark_id_image: darkIdImage || companyInfo.dataValues.dark_id_image,
            light_id_image:
              lightIdImage || companyInfo.dataValues.light_id_image,
            favicon_image:
              faviconIdImage || companyInfo.dataValues.favicon_image,
            web_link: web_link,
            facebook_link: facebook_link,
            insta_link: insta_link,
            youtube_link: youtube_link,
            linkdln_link: linkdln_link,
            twitter_link: twitter_link,
            pinterest_link: pinterest_link,
            web_primary_color: web_primary_color,
            web_secondary_color: web_secondary_color,
            announce_is_active: announce_is_active,
            announce_color: announce_color,
            announce_text: announce_text,
            company_address: company_address,
            est_shipping_day: est_shipping_day,
            announce_text_color: announce_text_color,
            modified_date: getLocalDate(),
            gst_number: gst_number,
            modified_by: req.body.session_res.id_app_user,
          },

          { where: { id: companyInfo.dataValues.id }, transaction: trn }
        );
        const updatedData = await CompanyInfo.findOne({
          where: { id: updatedCompanyInfo },
          transaction: trn,
        });
        await trn.commit();
        return resSuccess({
          message: RECORD_UPDATE_SUCCESSFULLY,
          data: updatedData,
        });
      } else {
        await trn.rollback();
        return resNotFound();
      }
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCompanyInfoData = async (req: Request) => {
  try {
    const companyInfo = await CompanyInfo.findAll({
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
        "announce_is_active",
        "announce_color",
        "announce_text",
        "announce_text_color",
        "light_id_image",
        "dark_id_image",
        "favicon_image",
        "company_address",
        "est_shipping_day",
        "pinterest_link",
        "gst_number",
        "key",
        [Sequelize.literal('"dark_image"."image_path"'), "dark_image_path"],
        [Sequelize.literal('"light_image"."image_path"'), "light_image_path"],
        [Sequelize.literal('"favicon"."image_path"'), "favicon_image_path"],
      ],
      include: [
        {
          model: Image,
          as: "dark_image",
          attributes: [],
        },
        {
          model: Image,
          as: "light_image",
          attributes: [],
        },
        {
          model: Image,
          as: "favicon",
          attributes: [],
        },
      ],
    });

    return resSuccess({ data: companyInfo });
  } catch (error) {
    throw error;
  }
};

export const getCompnayInfoCustomer = async (req: Request) => {
  try {
    const companyInfo = await CompanyInfo.findOne({
      where: { key: req.query.key },
      attributes: [
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
        "announce_is_active",
        "announce_color",
        "announce_text",
        "announce_text_color",
        "light_id_image",
        "favicon_image",
        "dark_id_image",
        "pinterest_link",
        "company_address",
        "est_shipping_day",
        "web_restrict_url",
        "gst_number",
      ],
    });
    if (companyInfo) {
      const darkImagedata = await Image.findOne({
        where: { id: companyInfo.dataValues.dark_id_image },
      });
      const light_id_image = await Image.findOne({
        where: { id: companyInfo.dataValues.light_id_image },
      });
      const favicon_id_image = await Image.findOne({
        where: { id: companyInfo.dataValues.favicon_image },
      });
      const images = {
        darakImage: darkImagedata?.dataValues.image_path,
        lightImage: light_id_image?.dataValues.image_path,
        faviconImage: favicon_id_image?.dataValues.image_path
          ? favicon_id_image?.dataValues.image_path
          : null,
      };

      const taxList = await TaxMaster.findAll({
        where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No },
      });

      const staticPageList = await staticPageData.findAll({
        where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
        attributes: ["id", "page_title", "slug"],
      });
      return resSuccess({
        data: {
          companyInfo,
          images: images,
          taxList,
          static_pages: staticPageList,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

export const updateWebRestrictURL = async (req: Request) => {
  try {
    const { web_link } = req.body;
    const updateData = await CompanyInfo.update(
      { web_restrict_url: encryptResponseData(web_link) },
      { where: { key: req.params.key } }
    );
    if (updateData) {
      return resSuccess({
        message: RECORD_UPDATE_SUCCESSFULLY,
        data: null,
      });
    }
  } catch (error) {
    throw error;
  }
};
