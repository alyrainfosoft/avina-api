import { Request } from "express";
import multer from "multer";
import { Op, Sequelize } from "sequelize";
import dbContext from "../config/db-context";
import { moveFileToS3ByType } from "../helpers/file.helper";
import CompanyInfo from "../model/companyinfo.model";
import Image from "../model/image.model";
import { ActiveStatus, IMAGE_TYPE } from "../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../utils/app-messages";
import { getLocalDate, resNotFound, resSuccess } from "../utils/shared-functions";


export const addCompanyInfo = async (req: Request) => {
  const { company_name, company_email, company_phone, copy_right, sort_about, web_link, facebook_link, insta_link,
    youtube_link, linkdln_link, twitter_link, web_primary_color, web_secondary_color, announce_color, announce_text, announce_text_color, created_by } = req.body

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
      web_primary_color: web_primary_color,
      web_secondary_color: web_secondary_color,
      announce_is_active: ActiveStatus.Active,
      announce_color: announce_color,
      announce_text: announce_text,
      announce_text_color: announce_text_color,
      created_date: getLocalDate(),
      created_by: req.body.session_res.id_app_user,
    }
    await CompanyInfo.create(payload)
    console.log(payload);
    return resSuccess({ data: payload });

  } catch (error) {
    throw (error)
  }
}

export const updateCompanyInfo = async (req: Request) => {
  const { id, company_name, company_email, company_phone, copy_right, sort_about, web_link, facebook_link, insta_link,
    youtube_link, linkdln_link, twitter_link, web_primary_color, web_secondary_color, announce_color, announce_text,
    announce_text_color, updated_by, announce_is_active } = req.body

  try {

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let darkImagePath = null;
    let lightImagePath = null;

    if (files['dark_image'] != null) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        files['dark_image'][0],
        IMAGE_TYPE.headerLogo,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      darkImagePath = moveFileResult.data;
    }

    if (files['light_image'] != null) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        files['light_image'][0],
        IMAGE_TYPE.footerLogo,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      lightImagePath = moveFileResult.data;
    }

    const trn = await dbContext.transaction();

    try {
      let darkIdImage = null;
      if (darkImagePath) {
        const imageResult = await Image.create(
          {
            image_path: darkImagePath,
            image_type: IMAGE_TYPE.headerLogo,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        darkIdImage = imageResult.dataValues.id;
      }

      let lightIdImage = null;
      if (lightImagePath) {
        const imageResult = await Image.create(
          {
            image_path: lightImagePath,
            image_type: IMAGE_TYPE.footerLogo,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        lightIdImage = imageResult.dataValues.id;
      }

      const companyinfo = await CompanyInfo.findOne({ where: { id: id }, transaction: trn })
      if (companyinfo) {
        if (darkIdImage !== null && lightIdImage !== null) {
          console.log(darkIdImage, lightIdImage)
          const CategoryInfo = await (CompanyInfo.update(
            {
              company_name: company_name,
              company_email: company_email,
              company_phone: company_phone,
              copy_right: copy_right,
              sort_about: sort_about,
              dark_id_image: darkIdImage,
              light_id_image: lightIdImage,
              web_link: web_link,
              facebook_link: facebook_link,
              insta_link: insta_link,
              youtube_link: youtube_link,
              linkdln_link: linkdln_link,
              twitter_link: twitter_link,
              web_primary_color: web_primary_color,
              web_secondary_color: web_secondary_color,
              announce_is_active: announce_is_active,
              announce_color: announce_color,
              announce_text: announce_text,
              announce_text_color: announce_text_color,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user
            },

            { where: { id: companyinfo.dataValues.id }, transaction: trn }
          ));
          const updatedData = await CompanyInfo.findOne({ where: { id: CategoryInfo }, transaction: trn })
          await trn.commit();
          return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData });
        } else {

          if (darkIdImage == null && lightIdImage != null) {
            console.log("lightIdImage", lightIdImage)
            const CategoryInfo = await (CompanyInfo.update(
              {
                company_name: company_name,
                company_email: company_email,
                company_phone: company_phone,
                copy_right: copy_right,
                sort_about: sort_about,
                // dark_id_image: darkIdImage,
                light_id_image: lightIdImage,
                web_link: web_link,
                facebook_link: facebook_link,
                insta_link: insta_link,
                youtube_link: youtube_link,
                linkdln_link: linkdln_link,
                twitter_link: twitter_link,
                web_primary_color: web_primary_color,
                web_secondary_color: web_secondary_color,
                announce_is_active: announce_is_active,
                announce_color: announce_color,
                announce_text: announce_text,
                announce_text_color: announce_text_color,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
              },

              { where: { id: companyinfo.dataValues.id }, transaction: trn }
            ));
            const updatedData = await CompanyInfo.findOne({ where: { id: CategoryInfo }, transaction: trn })
            await trn.commit();
            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData });


          }

          if (lightIdImage == null && darkIdImage != null) {
            console.log("darkImage", darkIdImage)

            const CategoryInfo = await (CompanyInfo.update(
              {
                company_name: company_name,
                company_email: company_email,
                company_phone: company_phone,
                copy_right: copy_right,
                sort_about: sort_about,
                dark_id_image: darkIdImage,
                // light_id_image: lightIdImage,
                web_link: web_link,
                facebook_link: facebook_link,
                insta_link: insta_link,
                youtube_link: youtube_link,
                linkdln_link: linkdln_link,
                twitter_link: twitter_link,
                web_primary_color: web_primary_color,
                web_secondary_color: web_secondary_color,
                announce_is_active: announce_is_active,
                announce_color: announce_color,
                announce_text: announce_text,
                announce_text_color: announce_text_color,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
              },

              { where: { id: companyinfo.dataValues.id }, transaction: trn }
            ));
            const updatedData = await CompanyInfo.findOne({ where: { id: CategoryInfo }, transaction: trn })
            await trn.commit();
            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData });

          }

          if (darkIdImage == null && lightIdImage == null) {
            console.log("No data updated")
            const CategoryInfo = await (CompanyInfo.update(
              {
                company_name: company_name,
                company_email: company_email,
                company_phone: company_phone,
                copy_right: copy_right,
                sort_about: sort_about,
                // dark_id_image: darkIdImage,
                // light_id_image: lightIdImage,
                web_link: web_link,
                facebook_link: facebook_link,
                insta_link: insta_link,
                youtube_link: youtube_link,
                linkdln_link: linkdln_link,
                twitter_link: twitter_link,
                web_primary_color: web_primary_color,
                web_secondary_color: web_secondary_color,
                announce_is_active: announce_is_active,
                announce_color: announce_color,
                announce_text: announce_text,
                announce_text_color: announce_text_color,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
              },

              { where: { id: companyinfo.dataValues.id }, transaction: trn }
            ));
            const updatedData = await CompanyInfo.findOne({ where: { id: CategoryInfo }, transaction: trn })
            await trn.commit();
            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY, data: updatedData });

          }

        }

      } else {
        await trn.rollback()
        return resNotFound();
      }
    } catch (e) {
      // await trn.rollback();
      throw e;
    }
  } catch (error) {
    throw (error)
  }
}

export const getCompanyInfoData = async (req: Request) => {
  try {
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
        "announce_is_active",
        "announce_color",
        "announce_text",
        "announce_text_color",
        "light_id_image",
        "dark_id_image"

      ],
    })
    if (companyInfo) {
      const darkImagedata = await Image.findOne({ where: { id: companyInfo.dataValues.dark_id_image } })
      const light_id_image = await Image.findOne({ where: { id: companyInfo.dataValues.light_id_image } });
      const images = {
        "headerLogo": darkImagedata?.dataValues.image_path,
        "footerLogo": light_id_image?.dataValues.image_path
      }

      return resSuccess({ data: { companyInfo, images: images } })
    }

  } catch (error) {
    throw error
  }
}

export const getCompnayInfoCustomer = async (req: Request) => {
  try {
    const companyInfo = await CompanyInfo.findOne({
      where: { id: 1 },
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
        "dark_id_image"

      ],
    })
    if (companyInfo) {
      const darkImagedata = await Image.findOne({ where: { id: companyInfo.dataValues.dark_id_image } })
      const light_id_image = await Image.findOne({ where: { id: companyInfo.dataValues.light_id_image } });
      const images = {
        "darakImage": darkImagedata?.dataValues.image_path,
        "lightImage": light_id_image?.dataValues.image_path
      }

      return resSuccess({ data: { companyInfo, images: images } })
    }

  } catch (error) {
    throw error
  }
}