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
  TemplateFour,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../../model/index.model";

export const addAncientSection = async (req: Request) => {
  try {
    const {TemplateFourData} = initModels(req);
    const {
      bg_color,
      title,
      sub_title,
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
      title_color=null,
      sub_title_color=null,
      description_color=null,
      sub_description_color=null,
    } = req.body;
    const trn = await (req.body.db_connection).transaction();
    try {
       
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idBgImage = null;
      if (files["bg_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["bg_image"][0],
          IMAGE_TYPE.templateFour,
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
      let idTitleImage = null;
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateFour,
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
    
      const TemplateFourAncient = await TemplateFourData.create(
        {
          bg_color:bg_color,
          section_type: TemplateFour.Ancient,
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
          description: description,
          sub_description,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          id_bg_image: idBgImage,
          id_title_image: idTitleImage,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          title_color,
          sub_title_color,
          description_color,
          sub_description_color,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          temaplate_seven_stunning_jewellry_id: TemplateFourAncient?.dataValues?.id, data: {
            ...TemplateFourAncient?.dataValues
          }
        }
      }], TemplateFourAncient?.dataValues?.id, LogsActivityType.Add, LogsType.templateFourAncient, req?.body?.session_res?.id_app_user,trn)
                  
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

export const updateAncientSection = async (req: Request) => {
  try {
    const {TemplateFourData,Image} = initModels(req);
    const {
      bg_color,
      title,
      sub_title,
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
      title_image_delete = "0",
      title_color=null,
      sub_title_color=null,
      description_color=null,
      sub_description_color=null,
    } = req.body;

    const stunningJewelrySection = await TemplateFourData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id},
    });

    if (!(stunningJewelrySection && stunningJewelrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await (req.body.db_connection).transaction();
    try {
     
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let bgImageId = null;
      let findBgImage = null;
      if (stunningJewelrySection.dataValues.id_bg_image) {
        findBgImage = await Image.findOne({
          where: { id: stunningJewelrySection.dataValues.id_bg_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["bg_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["bg_image"][0],
          IMAGE_TYPE.templateFour,
          req.body.session_res.id_app_user,
          findBgImage,
          req?.body?.session_res?.client_id,
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        bgImageId = imageData.data;
      }
      let imageTitleId = null;
      let findTitleImage = null;
      if (stunningJewelrySection.dataValues.id_title_image) {
        findTitleImage = await Image.findOne({
          where: { id: stunningJewelrySection.dataValues.id_title_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateFour,
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

      {
        await TemplateFourData.update(
          {
            bg_color,
            section_type: TemplateFour.Ancient,
            link: link,
            id_bg_image:
            bg_image_delete && bg_image_delete === "1"
              ? null
              : bgImageId != null
              ? bgImageId
              : stunningJewelrySection.dataValues.id_bg_image,
              id_title_image:
                title_image_delete && title_image_delete === "1"
                  ? null
                  : imageTitleId != null
                  ? imageTitleId
                  : stunningJewelrySection.dataValues.id_title_image,
  
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
            description: description,
            sub_description: sub_description,
            button_name: button_name,
            button_color: button_color,
            button_text_color: button_text_color,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            title_color,
            sub_title_color,
            description_color,
            sub_description_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: stunningJewelrySection.dataValues.id },
            transaction: trn,
          }
        );
      }
      if (bg_image_delete && bg_image_delete === "1" && findBgImage.dataValues) {
        await imageDeleteInDBAndS3(req,findBgImage,req.body.session_res.client_id);
      }
      if (
        title_image_delete &&
        title_image_delete === "1" &&
        findTitleImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findTitleImage,req.body.session_res.client_id);
      }
      const AfterUpdatestunningJewelrySection = await TemplateFourData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_stunning_jewellry_id: stunningJewelrySection?.dataValues?.id, data: {...stunningJewelrySection?.dataValues}},
        new_data: {
          temaplate_seven_stunning_jewellry_id: AfterUpdatestunningJewelrySection?.dataValues?.id, data: {  ...AfterUpdatestunningJewelrySection?.dataValues }
        }
      }], stunningJewelrySection?.dataValues?.id, LogsActivityType.Edit, LogsType.templateFourAncient, req?.body?.session_res?.id_app_user,trn)
      

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

export const deleteAncientSection = async (req: Request) => {
  try {
    const {TemplateFourData} = initModels(req);
    const AncientSection = await TemplateFourData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(AncientSection && AncientSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateFourData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: AncientSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_stunning_jewellry_id: AncientSection?.dataValues?.id, data: {...AncientSection?.dataValues}},
      new_data: {
        temaplate_seven_stunning_jewellry_id: AncientSection?.dataValues?.id, data: {
          ...AncientSection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], AncientSection?.dataValues?.id, LogsActivityType.Delete, LogsType.templateFourAncient, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getAncientSection = async (req: Request) => {
  try {
    const {TemplateFourData,Image} = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateFour.Ancient },
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
      const totalItems = await TemplateFourData.count({
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

    const result = await TemplateFourData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "sub_description",
        "link",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "title_color",
        "sub_title_color",
        "description_color",
        "sub_description_color",
        "is_active",
        "sort_order",
        "id_bg_image",
        "id_title_image",
        "description",
        [Sequelize.literal("bg_image.image_path"), "bg_image_path"],
        [Sequelize.literal("title_image.image_path"), "title_image_path"],
      ],
      include: [
        { model: Image, as: "bg_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "title_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForAncientSection = async (req: Request) => {
  try {
    const { TemplateFourData } = initModels(req);
    const AncientSection = await TemplateFourData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateFour.Ancient },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(AncientSection && AncientSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateFourData.update(
      {
        is_active: statusUpdateValue(AncientSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: AncientSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_stunning_jewellry_id: AncientSection?.dataValues?.id, data: {...AncientSection?.dataValues} },
      new_data: {
        temaplate_seven_stunning_jewellry_id: AncientSection?.dataValues?.id, data: {
          ...AncientSection?.dataValues, is_active: statusUpdateValue(AncientSection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], AncientSection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.templateFourAncient, req?.body?.session_res?.id_app_user)
     
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
