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

export const addOffersBottomSection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const {
      title,
      sub_title,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      sort_order = null,
    } = req.body;
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
  
      const TEmplateSevenBottomOffer =await TemplateSevenData.create(
        {
          section_type: TemplateSevenSectionType.OfferBottomSection,
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
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          id_bg_image: idBgImage,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          temaplate_seven_offers_bottom_id: TEmplateSevenBottomOffer?.dataValues?.id, data: {
            ...TEmplateSevenBottomOffer?.dataValues
          }
        }
      }], TEmplateSevenBottomOffer?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSevenOfferBottomSection, req?.body?.session_res?.id_app_user,trn)
                
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

export const updateOffersBottomSection = async (req: Request) => {
  try {
    const {TemplateSevenData,Image} = initModels(req);
    const {
      title,
      sub_title,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      sort_order = null,
      bg_image_delete = "0"
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
          where: { id: findDiamondShapeSection.dataValues.id_bg_image },
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
  
      {
        await TemplateSevenData.update(
          {
            section_type: TemplateSevenSectionType.OfferBottomSection,
            link: link,
            id_bg_image:
              bg_image_delete && bg_image_delete === "1"
                ? null
                : bgImageId != null
                ? bgImageId
                : findDiamondShapeSection.dataValues.id_bg_image,
  
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
      const AfterUpdatefindDiamondShapeSection = await TemplateSevenData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_offers_bottom_id: findDiamondShapeSection?.dataValues?.id, data: {...findDiamondShapeSection?.dataValues}},
        new_data: {
          temaplate_seven_offers_bottom_id: AfterUpdatefindDiamondShapeSection?.dataValues?.id, data: {  ...AfterUpdatefindDiamondShapeSection?.dataValues }
        }
      }], findDiamondShapeSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSevenOfferBottomSection, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteOfferBottomSection = async (req: Request) => {
  try {
    const { TemplateSevenData } = initModels(req);
    const OffersBottomSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(OffersBottomSection && OffersBottomSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: OffersBottomSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_offers_bottom_id: OffersBottomSection?.dataValues?.id, data: {...OffersBottomSection?.dataValues} },
      new_data: {
        temaplate_seven_offers_bottom_id: OffersBottomSection?.dataValues?.id, data: {
          ...OffersBottomSection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], OffersBottomSection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSevenOfferBottomSection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getOffersBottomSection = async (req: Request) => {
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
      { section_type: TemplateSevenSectionType.OfferBottomSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                sub_title: { [Op.iLike]: "%" + pagination.search_text + "%" },
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
      ],
      include: [
        { model: Image, as: "bg_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForOffersBottomSection = async (req: Request) => {
  try {
    const { TemplateSevenData,Image } = initModels(req);

    const OffersBottomSection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSevenSectionType.OfferBottomSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(OffersBottomSection && OffersBottomSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(OffersBottomSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: OffersBottomSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_offers_bottom_id: OffersBottomSection?.dataValues?.id, data: OffersBottomSection?.dataValues },
      new_data: {
        temaplate_seven_offers_bottom_id: OffersBottomSection?.dataValues?.id, data: {
          ...OffersBottomSection?.dataValues, is_active: statusUpdateValue(OffersBottomSection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], OffersBottomSection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSevenOfferBottomSection, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
