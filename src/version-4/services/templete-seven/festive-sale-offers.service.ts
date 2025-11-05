import { Request } from "express";
import {
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  TemplateSevenSectionType,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../../model/index.model";

export const addFestiveSaleOfferSection = async (req: Request) => {
  try {
    const {
      title,
      sub_title,
      description,
      sub_description,
      sub_title_one,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      sort_order = null,
      
    } = req.body;
    const { TemplateSevenData } = initModels(req);
    const trn = await (req.body.db_connection).transaction();
    try {
       
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idBgImage = null;
      if (files["bg_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["bg_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        idBgImage = imageData.data;
      }
      let idProductImage = null;
      if (files["product_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["product_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        idProductImage = imageData.data;
      }
      let idTitleImage = null;
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        idTitleImage = imageData.data;
      }
      let idOfferImage = null;
      if (files["offer_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["offer_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        idOfferImage = imageData.data;
      }

      const TemplateSevenFestiveSale = await TemplateSevenData.create(
        {
          section_type: TemplateSevenSectionType.FestiveSaleOfferSection,
          link: link,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != "" &&
            sort_order != null &&
            sort_order != undefined
              ? sort_order
              : 0,
          title: title,
          sub_title: sub_title,
          sub_title_one:sub_title_one,
          description: description,
          sub_description,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          id_bg_image: idBgImage,
          id_product_image: idProductImage,
          id_offer_image: idOfferImage,
          id_title_image: idTitleImage,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          temaplate_seven_festive_sale_id: TemplateSevenFestiveSale?.dataValues?.id, data: {
            ...TemplateSevenFestiveSale?.dataValues
          }
        }
      }], TemplateSevenFestiveSale?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSevenFestiveSaleOfferSection, req?.body?.session_res?.id_app_user,trn)
           
      await trn.commit();
      return resSuccess();
    } catch (e) {
      console.log(e);
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const updateFestiveSaleOfferSection = async (req: Request) => {
  try {
    const { TemplateSevenData,Image } = initModels(req);
    const {
      title,
      sub_title,
      sub_title_one,
      description,
      sub_description,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      sort_order = null,
      bg_image_delete = "0",
      product_image_delete = "0",
      offer_image_delete = "0",
      title_image_delete = "0"
    } = req.body;

    const findDiamondShapeSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await (req.body.db_connection).transaction();
    try {
     
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let bgImageId = null;
      let findBgImage = null;
      if (findDiamondShapeSection.dataValues.id_bg_image) {
        findBgImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_bg_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["bg_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["bg_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findBgImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        bgImageId = imageData.data;
      }
      let imageTitleId = null;
      let findTitleImage = null;
      if (findDiamondShapeSection.dataValues.id_title_image) {
        findTitleImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_title_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findTitleImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageTitleId = imageData.data;
      }
      let imageOfferId = null;
      let findOfferImage = null;
      if (findDiamondShapeSection.dataValues.id_offer_image) {
        findOfferImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_offer_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["offer_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["offer_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findOfferImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageOfferId = imageData.data;
      }


      let imageProductId = null;
      let findProductImage = null;
      if (findDiamondShapeSection.dataValues.id_product_image ) {
        findProductImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_product_image ,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["product_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["product_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findProductImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageProductId = imageData.data;
      }

      {
        await TemplateSevenData.update(
          {
            section_type: TemplateSevenSectionType.FestiveSaleOfferSection,
            link: link,
            id_bg_image:
            bg_image_delete && bg_image_delete === "1"
              ? null
              : bgImageId != null
              ? bgImageId
              : findDiamondShapeSection.dataValues.id_bg_image,
          id_product_image:
              product_image_delete && product_image_delete === "1"
                ? null
                : imageProductId != null
                ? imageProductId
                : findDiamondShapeSection.dataValues.id_product_image,
                id_offer_image:
                offer_image_delete && offer_image_delete === "1"
                  ? null
                  : imageOfferId != null
                  ? imageOfferId
                  : findDiamondShapeSection.dataValues.id_offer_image,
              id_title_image:
                title_image_delete && title_image_delete === "1"
                  ? null
                  : imageTitleId != null
                  ? imageTitleId
                  : findDiamondShapeSection.dataValues.id_title_image,
  
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            title: title,
            sub_title: sub_title,
            sub_title_one:sub_title_one,
            description: description,
            sub_description: sub_description,
            button_name: button_name,
            button_color: button_color,
            button_text_color: button_text_color,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: findDiamondShapeSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
      }
      if (bg_image_delete && bg_image_delete === "1" && findBgImage.dataValues) {
        await imageDeleteInDBAndS3(req,findBgImage,req.body.session_res.client_id);
      }
      if (product_image_delete && product_image_delete === "1" && findProductImage.dataValues) {
        await imageDeleteInDBAndS3(req,findProductImage,req.body.session_res.client_id);
      }
      if (
        title_image_delete &&
        title_image_delete === "1" &&
        findTitleImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findTitleImage,req.body.session_res.client_id);
      }
      if (
        offer_image_delete &&
        offer_image_delete === "1" &&
        findOfferImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findOfferImage,req.body.session_res.client_id);
      }

      const AfterUpdatefindDiamondShapeSection = await TemplateSevenData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_festive_sale_id: findDiamondShapeSection?.dataValues?.id, data: {...findDiamondShapeSection?.dataValues}},
        new_data: {
          temaplate_seven_festive_sale_id: AfterUpdatefindDiamondShapeSection?.dataValues?.id, data: { ...AfterUpdatefindDiamondShapeSection?.dataValues }
        }
      }], findDiamondShapeSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSevenFestiveSaleOfferSection, req?.body?.session_res?.id_app_user,trn)
      
   
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

export const deleteFestiveSaleOfferSection = async (req: Request) => {
  try {
    const { TemplateSevenData } = initModels(req);
    const FestiveSaleOfferSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(FestiveSaleOfferSection && FestiveSaleOfferSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: FestiveSaleOfferSection.dataValues.id ,company_info_id :req?.body?.session_res?.client_id} }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_festive_sale_id: FestiveSaleOfferSection?.dataValues?.id, data: {...FestiveSaleOfferSection?.dataValues} },
      new_data: {
        temaplate_seven_festive_sale_id: FestiveSaleOfferSection?.dataValues?.id, data: {
          ...FestiveSaleOfferSection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], FestiveSaleOfferSection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSevenFestiveSaleOfferSection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getFestiveSaleOfferSection = async (req: Request) => {
  try {
    const { TemplateSevenData,Image } = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateSevenSectionType.FestiveSaleOfferSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                sub_title: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              {
                sub_description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateSevenData.count({
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

    const result = await TemplateSevenData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "sub_description",
        "sub_title_one",
        "link",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "is_active",
        "sort_order",
        "id_bg_image",
        "description",
        [Sequelize.literal("bg_image.image_path"), "bg_image_path"],
        [Sequelize.literal("product_image.image_path"), "product_image_path"],
        [Sequelize.literal("title_image.image_path"), "title_image_path"],
        [Sequelize.literal("offer_image.image_path"), "offer_image_path"],
      ],
      include: [
        { model: Image, as: "bg_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "product_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "title_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "offer_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },        
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForFestiveSaleOfferSection = async (req: Request) => {
  try {
    const { TemplateSevenData } = initModels(req);
    const FestiveSaleOfferSection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSevenSectionType.FestiveSaleOfferSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(FestiveSaleOfferSection && FestiveSaleOfferSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(FestiveSaleOfferSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: FestiveSaleOfferSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_festive_sale_id: FestiveSaleOfferSection?.dataValues?.id, data: {...FestiveSaleOfferSection?.dataValues} },
      new_data: {
        temaplate_seven_festive_sale_id: FestiveSaleOfferSection?.dataValues?.id, data: {
          ...FestiveSaleOfferSection?.dataValues, is_active: statusUpdateValue(FestiveSaleOfferSection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], FestiveSaleOfferSection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSevenFestiveSaleOfferSection, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
