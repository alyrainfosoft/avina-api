import { Request } from "express";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getInitialPaginationFromQuery,
  resNotFound,
  resSuccess,
  prepareMessageFromParams,
  imageAddAndEditInDBAndS3ForOriginalFileName,
  getLocalDate,
} from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { initModels } from "../model/index.model";
import { IMAGE_TYPE_LOCATION, LOG_FOR_SUPER_ADMIN, GLEAMORA_KEY } from "../../utils/app-constants";
import { s3UploadObject } from "../../helpers/s3-client.helper";

// update company details
export const updateGeneralCompanyInfoByClient = async (req: Request) => {
    try {
        const { CompanyInfo, Image} = initModels(req);

        const { company_name, company_email, company_phone, company_address, address_embed_map, address_map_link, copy_right } = req.body

        const companyInfoDetails: any = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id } })

        if (!(companyInfoDetails && companyInfoDetails.dataValues)) {
            return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company Detail"]]) })
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
             
                const trn = await (req.body.db_connection).transaction();
                let headerLogoIdImage = null;
                console.log("files[loader]", files["loader"]);
                if (files["header_logo"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.dark_id_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.dark_id_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["header_logo"][0],
                        IMAGE_TYPE.headerLogo,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id,);
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    headerLogoIdImage = imageData.data;
                } else {
                    headerLogoIdImage = companyInfoDetails.dataValues.dark_id_image
                }
                let footerLogoIdImage = null;
                if (files["footer_logo"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.light_id_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.light_id_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["footer_logo"][0],
                        IMAGE_TYPE.footerLogo,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    footerLogoIdImage = imageData.data;
                } else {
                    footerLogoIdImage = companyInfoDetails.dataValues.light_id_image
                }
                let faviconImage = null;
                if (files["favicon"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.favicon_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.favicon_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["favicon"][0],
                        IMAGE_TYPE.FaviconImage,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    faviconImage = imageData.data;
                } else {
                    faviconImage = companyInfoDetails.dataValues.favicon_image;
        
                }
        
                let loaderImage = null;
                if (files["loader"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.loader_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.loader_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["loader"][0],
                        IMAGE_TYPE.loaderImage,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    loaderImage = imageData.data;
                } else {
                    loaderImage = companyInfoDetails.dataValues.loader_image;
                }
        
                let mailTempLogo = null;
                if (files["mail_tem_logo"]) {
                   
                    const destinationPath = IMAGE_TYPE_LOCATION[IMAGE_TYPE.mailTemplateLogo] + "/" + files["mail_tem_logo"][0].originalname;
                    const data = await s3UploadObject(
                        req.body.db_connection,
                        files["mail_tem_logo"][0].buffer,
                          destinationPath,
                          files["mail_tem_logo"][0].mimetype,
                          req.body.session_res.client_id
                        );
                    if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                            await trn.rollback()
                          return data;
                    }
                    const imageResult = await Image.create({
                        image_path: destinationPath,
                        image_type: IMAGE_TYPE.mailTemplateLogo,
                        created_by: req.body.session_res.id_app_user,
                        company_info_id :req.body.session_res.client_id,
                        created_date: getLocalDate(),
                      });
                    mailTempLogo = imageResult.dataValues.id;
                } else {
                    mailTempLogo = companyInfoDetails.dataValues.mail_tem_logo;
                }
        
                let defaultImage = null;
                if (files["default_image"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.default_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.default_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["default_image"][0],
                        IMAGE_TYPE.defaultImage,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    defaultImage = imageData.data;
                } else {
                    defaultImage = companyInfoDetails.dataValues.default_image
                }
        
                let pageNotFoundImage = null;
                if (files["page_not_found_image"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.page_not_found_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.page_not_found_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["page_not_found_image"][0],
                        IMAGE_TYPE.pageNotFoundImage,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    pageNotFoundImage = imageData.data;
                } else {
                    pageNotFoundImage = companyInfoDetails.dataValues.page_not_found_image
                }
        
                let shareImage = null;
                if (files["share_image"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.share_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.share_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["share_image"][0],
                        IMAGE_TYPE.shareImage,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    shareImage = imageData.data;
                } else {
                    shareImage = companyInfoDetails.dataValues.share_image;
                }
                let productNotFoundImage = null;
                if (files["product_not_found_image"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.product_not_found_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.product_not_found_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["product_not_found_image"][0],
                        IMAGE_TYPE.productNotFound,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    productNotFoundImage = imageData.data;
                } else {
                    productNotFoundImage = companyInfoDetails.dataValues.product_not_found_image;
                }
                let orderNotFoundImage = null;
                if (files["order_not_found_image"]) {
                    let findImage = null;
                    if (companyInfoDetails.dataValues.order_not_found_image) {
                        findImage = await Image.findOne({
                            where: { id: companyInfoDetails.dataValues.order_not_found_image, company_info_id: req?.body?.session_res?.client_id },
                            transaction: trn,
                        });
                    }
                    const imageData = await imageAddAndEditInDBAndS3ForOriginalFileName(
                        req,
                        files["order_not_found_image"][0],
                        IMAGE_TYPE.orderNotFound,
                        req.body.session_res.id_app_user,
                        findImage,
                        req?.body?.session_res?.client_id
                    );
                    if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                        await trn.rollback();
                        return imageData;
                    }
                    orderNotFoundImage = imageData.data;
                } else {
                    orderNotFoundImage = companyInfoDetails.dataValues.order_not_found_image;
                }

        await CompanyInfo.update({
            company_name,
            company_email,
            company_phone,
            company_address,
            address_embed_map,
            address_map_link,
            copy_right,
            dark_id_image: headerLogoIdImage,
            light_id_image: footerLogoIdImage,
            loader_image: loaderImage,
            mail_tem_logo: mailTempLogo,
            default_image: defaultImage,
            page_not_found_image: pageNotFoundImage,
            favicon_image: faviconImage,
            share_image: shareImage,
            product_not_found_image: productNotFoundImage,
            order_not_found_image: orderNotFoundImage,
            script: req.body.script,
            web_primary_color: req.body.primary_color,
            web_secondary_color: req.body.secondary_color
        }, { where: { id: companyInfoDetails.dataValues.id } })

        const AfterUpdatecompanyInfoDetails = await CompanyInfo.findOne({ where: { id: req.body.session_res.client_id } })

        await addActivityLogs(req,req.body.session_res.client_id, [{
            old_data: { compony_id: companyInfoDetails?.dataValues?.id, data: companyInfoDetails?.dataValues },
            new_data: {
                compony_id: companyInfoDetails?.dataValues?.id, data: { ...companyInfoDetails?.dataValues, ...AfterUpdatecompanyInfoDetails?.dataValues }
            }
        }], companyInfoDetails?.dataValues?.id, LogsActivityType.Edit, LogsType.companyInfoUpdateByClient, req?.body?.session_res?.id_app_user)

        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
    } catch (error) {
        throw error
    }
}



export const getCompanyInfoForAdminByClient = async (req: Request) => {
  try {
    const {CompanyInfo,Image} = initModels(req);
    let result ;
    const companyInfo = await CompanyInfo.findOne({
      where: { id: req.body.session_res.client_id, is_active: ActiveStatus.Active },
      attributes: [
        "id",
        "company_name",
        "company_email",
        "company_phone",
        "company_address",
        "address_embed_map",
        "address_map_link",
        "script",
        "web_primary_color",
        "web_secondary_color",
        "copy_right",
        "dark_id_image",
        "light_id_image",
        "favicon_image",
        "loader_image",
        "default_image",
        "page_not_found_image",
        "share_image",
        "product_not_found_image",
        "order_not_found_image",
        "mail_tem_logo"
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

      const loaderImage = await Image.findOne({
        where: { id: companyInfo.dataValues.loader_image },
      })

      const defaultImage = await Image.findOne({
        where: { id: companyInfo.dataValues.default_image },
      })

      const pageNotFoundImage = await Image.findOne({
        where: { id: companyInfo.dataValues.page_not_found_image },
      })

      const shareImage = await Image.findOne({
        where: { id: companyInfo.dataValues.share_image },
      }) 
      
      const productNotFoundImage = await Image.findOne({
        where: { id: companyInfo.dataValues.product_not_found_image },
      })

      const orderNotFoundImage = await Image.findOne({
        where: { id: companyInfo.dataValues.order_not_found_image },
      })

      const mail_tem_logo = await Image.findOne({
        where: { id: companyInfo.dataValues.mail_tem_logo },
      })
      
      const images = {
        darakImage: darkImagedata?.dataValues.image_path,
        lightImage: light_id_image?.dataValues.image_path,
        faviconImage: favicon_id_image?.dataValues.image_path
          ? favicon_id_image?.dataValues.image_path
          : null,
        loaderImage: loaderImage?.dataValues.image_path
          ? loaderImage?.dataValues.image_path
          : null,
        defaultImage: defaultImage?.dataValues.image_path
          ? defaultImage?.dataValues.image_path
          : null,
        pageNotFoundImage: pageNotFoundImage?.dataValues.image_path
          ? pageNotFoundImage?.dataValues.image_path
          : null,
        shareImage: shareImage?.dataValues.image_path
          ? shareImage?.dataValues.image_path
          : null,
        productNotFoundImage: productNotFoundImage?.dataValues.image_path
          ? productNotFoundImage?.dataValues.image_path
          : null,
        orderNotFoundImage: orderNotFoundImage?.dataValues.image_path
          ? orderNotFoundImage?.dataValues.image_path
          : null,
        mailTempLogo: mail_tem_logo?.dataValues.image_path
          ? mail_tem_logo?.dataValues.image_path
          : null
      };

 
      return resSuccess({
        data: {companyInfo,image:images}      
      });
  }
  } catch (error) {
    throw error;
  }
};