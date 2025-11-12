import { Request } from "express";
import { addActivityLogs, getCompanyIdBasedOnTheCompanyKey, getInitialPaginationFromQuery, getLocalDate, imageAddAndEditInDBAndS3, imageDeleteInDBAndS3, resNotFound, resSuccess, statusUpdateValue } from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, NOT_FOUND_MESSAGE, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../model/index.model";

export const addAboutUsSection = async (req: Request) => {
    try {
      const {
        title,
        link,
        sub_title,
        sort_order = null,
        section_type,
        button_name,
        button_color,
        button_text_color,
        is_button_transparent = "0",
        button_hover_color,
        button_text_hover_color,
        content,
      } = req.body;
      const trn = await (req.body.db_connection).transaction();
      try {
        const { AboutUsData } = initModels(req);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        let idImage = null;
        if (files["image"]) {
          const imageData = await imageAddAndEditInDBAndS3(req,
            files["image"][0],
            IMAGE_TYPE.aboutUs,
            req.body.session_res.id_app_user,
            "",
            req?.body?.session_res?.client_id
          );
          if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            trn.rollback();
            return imageData;
          }
          idImage = imageData.data;
        }

        const Aboutus = await AboutUsData.create(
          {
            section_type: section_type,
            link: link,
            is_active: ActiveStatus.Active,
            id_image: idImage,
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != null &&
              sort_order != "" &&
              sort_order != undefined
                ? sort_order
                : null,
            button_name: button_name,
            button_color: button_color,
            button_text_color: button_text_color,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            sub_title: sub_title,
            title: title,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
            content: content,
          },
          { transaction: trn }
        );
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: {
            about_us_id: Aboutus?.dataValues?.id, data: {
              ...Aboutus?.dataValues
            },
          }
        }], Aboutus?.dataValues?.id, LogsActivityType.Add, LogsType.AboutUs, req?.body?.session_res?.id_app_user,trn)
                  
        await trn.commit();
        return resSuccess();
      } catch (e) {
        await trn.rollback();
        throw e;
      }
    } catch (e) {
      throw e;
    }
  };
  
  export const updateAboutUsSection = async (req: Request) => {
    try {
      const {
        title,
        link,
        sub_title,
        sort_order = null,
        section_type,
        button_name,
        button_color,
        button_text_color,
        is_button_transparent = "0",
        button_hover_color,
        button_text_hover_color,
        content,
        image_delete = "0",
      } = req.body;
      const { AboutUsData, Image } = initModels(req);
      const findAboutUsSection = await AboutUsData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No },
      });
  
      if (!(findAboutUsSection && findAboutUsSection.dataValues)) {
        return resNotFound({ message: NOT_FOUND_MESSAGE });
      }
      const trn = await (req.body.db_connection).transaction();
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        let imageId = null;
        let findImage = null;
        if (findAboutUsSection.dataValues.id_image) {
          findImage = await Image.findOne({
            where: { id: findAboutUsSection.dataValues.id_image,company_id: req?.body?.session_res?.client_id, },
            transaction: trn,
          });
        }
        if (files["image"] !== undefined) {
          const imageData = await imageAddAndEditInDBAndS3(req,
            files["image"][0],
            IMAGE_TYPE.aboutUs,
            req.body.session_res.id_app_user,
            findImage,
            req?.body?.session_res?.client_id
          );
  
          if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            await trn.rollback();
            return imageData;
          }
          imageId = imageData.data;
        }
        
        {
          await AboutUsData.update(
            {
              section_type: section_type,
              link: link,
              id_image:
                image_delete == "1"
                  ? null
                  : imageId == null
                  ? findAboutUsSection.dataValues.id_image
                  : imageId,
              sort_order:
                sort_order &&
                sort_order != null &&
                sort_order != "" &&
                sort_order != undefined
                  ? sort_order
                  : null,
              button_name: button_name,
              button_color: button_color,
              button_text_color: button_text_color,
              is_button_transparent: is_button_transparent,
              button_hover_color: button_hover_color,
              button_text_hover_color: button_text_hover_color,
              sub_title: sub_title,
              title: title,
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
              content: content,
            },
            {
              where: { id: findAboutUsSection.dataValues.id },
              transaction: trn,
            }
          );
        }
        if (image_delete && image_delete === "1" && findImage.dataValues) {
          await imageDeleteInDBAndS3(req,findImage, req.body.session_res.client_id);
        }
        const AfterUpdatefindAboutUsSection = await AboutUsData.findOne({
          where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
        });
        await addActivityLogs(req,req.body.session_res.client_id,[{
          old_data: { about_us_id: findAboutUsSection?.dataValues?.id, data: {...findAboutUsSection?.dataValues}},
          new_data: {
            about_us_id: AfterUpdatefindAboutUsSection?.dataValues?.id, data: {...AfterUpdatefindAboutUsSection?.dataValues }
          }
        }], findAboutUsSection?.dataValues?.id,LogsActivityType.Edit, LogsType.AboutUs, req?.body?.session_res?.id_app_user,trn)
        
        await trn.commit();
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      } catch (e) {
        await trn.rollback();
        throw e;
      }
    } catch (e) {
      throw e;
    }
  };
  
  export const deleteAboutUsSection = async (req: Request) => {
    try {
      const { AboutUsData } = initModels(req);
      const findAboutUsSection = await AboutUsData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No },
      });
  
      if (!(findAboutUsSection && findAboutUsSection.dataValues)) {
        return resNotFound({ message: NOT_FOUND_MESSAGE });
      }
  
      await AboutUsData.update(
        {
          is_deleted: DeletedStatus.yes,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: findAboutUsSection.dataValues.id } }
      );

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { about_us_id: findAboutUsSection?.dataValues?.id, data: {...findAboutUsSection?.dataValues}},
        new_data: {
          about_us_id: findAboutUsSection?.dataValues?.id, data: {
            ...findAboutUsSection?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          }
        }
      }], findAboutUsSection?.dataValues?.id, LogsActivityType.Delete, LogsType.AboutUs, req?.body?.session_res?.id_app_user)
  
      return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
    } catch (e) {
      throw e;
    }
  };
  
  export const getAboutUsSection = async (req: Request) => {
    try {
      const { AboutUsData,Image } = initModels(req);
      let paginationProps = {};
  
      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      let noPagination = req.query.no_pagination === "1";
  
      let where = [
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id},
        req.query.section_type && req.query.section_type != ""
          ? {
              section_type: req.query.section_type,
            }
          : {},
        pagination.is_active ? { is_active: pagination.is_active } : {},
        pagination.search_text
          ? {
              [Op.or]: [
                { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                {
                    content: { [Op.iLike]: "%" + pagination.search_text + "%" },
                },
                {
                    sub_title: { [Op.iLike]: "%" + pagination.search_text + "%" },
                },
              ],
            }
          : {},
      ];
  
      if (!noPagination) {
        const totalItems = await AboutUsData.count({
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
  
      const result = await AboutUsData.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
          "id",
          "title",
          "link",
          "sub_title",
          "is_active",
          "sort_order",
          "id_image",
          "button_name",
          "button_color",
          "section_type",
          "button_text_color",
          "is_button_transparent",
          "button_hover_color",
          "button_text_hover_color",
          "content",
          [Sequelize.literal("image.image_path"), "image_path"],
          
        ],
        include: [
          { model: Image, as: "image", attributes: [] },
          
        ],
      });
  
      return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
      throw error;
    }
  };
  
  export const statusUpdateForAboutUsSection = async (req: Request) => {
    try {
      const { AboutUsData } = initModels(req);
      const findAboutUsSection = await AboutUsData.findOne({
        where: {
          id: req.params.id,
          is_deleted: DeletedStatus.No,
        },
      });
  
      if (!(findAboutUsSection && findAboutUsSection.dataValues)) {
        return resNotFound({ message: NOT_FOUND_MESSAGE });
      }
      await AboutUsData.update(
        {
          is_active: statusUpdateValue(findAboutUsSection),
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: findAboutUsSection.dataValues.id } }
      );

       await addActivityLogs(req,req.body.session_res.client_id,[{
            old_data: { about_us_id: findAboutUsSection?.dataValues?.id, data: {...findAboutUsSection?.dataValues}},
            new_data: {
              about_us_id: findAboutUsSection?.dataValues?.id, data: {
                ...findAboutUsSection?.dataValues, is_active: statusUpdateValue(findAboutUsSection),
                modified_date: getLocalDate(),
                modified_by: req?.body?.session_res?.id_app_user,
              }
            }
          }], findAboutUsSection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.AboutUs, req?.body?.session_res?.id_app_user)
      

      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (error) {
      throw error;
    }
  };
  
  export const aboutUsSectionListForUser = async (req: Request) => {
    try {
      const { AboutUsData,Image } = initModels(req);
      const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
      if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
        return company_info_id;
      }
      const result = await AboutUsData.findAll({
        where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data, },
        order: [["sort_order", "ASC"]],
        attributes: [
            "id",
            "title",
            "link",
            "sub_title",
            "sort_order",
            "id_image",
            "button_name",
            "section_type",
            "button_color",
            "button_text_color",
            "is_button_transparent",
            "button_hover_color",
            "button_text_hover_color",
            "content",
            [Sequelize.literal("image.image_path"), "image_path"],
          
        ],
        include: [
          { model: Image, as: "image", attributes: [] },
          
        ],
      });
  
      return resSuccess({ data: result });
    } catch (error) {
      throw error;
    }
  };
  
  export const aboutUsSectionDetailForUser = async (req: Request) => {
    try {
      const { AboutUsData, Image } = initModels(req);
      const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
      if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
        return company_info_id;
      }
      const result = await AboutUsData.findOne({
        where: {
          id: req.params.id,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:company_info_id?.data,
        },
        attributes: [
          "id",
            "title",
            "link",
            "sub_title",
            "sort_order",
            "id_image",
            "button_name",
            "button_color",
            "button_text_color",
            "is_button_transparent",
            "button_hover_color",
            "section_type",
            "button_text_hover_color",
            "content",
            [Sequelize.literal("image.image_path"), "image_path"],
         
        ],
        include: [
          { model: Image, as: "image", attributes: [] },
          
        ],
      });
  
      if (!(result && result.dataValues)) {
        return resNotFound({ message: NOT_FOUND_MESSAGE });
      }
      return resSuccess({ data: result });
    } catch (error) {
      throw error;
    }
  };