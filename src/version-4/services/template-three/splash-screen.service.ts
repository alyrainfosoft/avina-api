import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  TemplateThreeSectionType,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
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
import { initModels } from "../../model/index.model";

export const addSplashScreen = async (req: Request) => {
  try {
    const {
      title,
      description,
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order = null,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
    } = req.body;
    const trn = await  (req.body.db_connection).transaction();
    try {
      const { TemplateThreeData } = initModels(req);
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.templateThree,
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
      const TemplateThreeSplashScreen = await TemplateThreeData.create(
        {
          section_type: TemplateThreeSectionType.SplashScreen,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          description: description,
          button_name: button_name,
          is_deleted: DeletedStatus.No,
          button_text_color: button_text_color,
          button_color: button_color,
          sort_order:
            sort_order &&
            sort_order !== null &&
            sort_order !== "" &&
            sort_order !== undefined
              ? sort_order
              : null,
          title: title,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_three_splash_screen_id: TemplateThreeSplashScreen?.dataValues?.id, data: {
            ...TemplateThreeSplashScreen?.dataValues
          }
        }
      }], TemplateThreeSplashScreen?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateThreeSplashScreen, req?.body?.session_res?.id_app_user,trn)

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

export const updateSplashScreen = async (req: Request) => {
  try {
      const { TemplateThreeData,Image } = initModels(req);

    const {
      title,
      description,
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order = null,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      image_delete = "0",
    } = req.body;

    const findSplashScreen = await TemplateThreeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSplashScreen && findSplashScreen.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await  (req.body.db_connection).transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findSplashScreen.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findSplashScreen.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.templateThree,
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
        await TemplateThreeData.update(
          {
            section_type: TemplateThreeSectionType.SplashScreen,
            link: link,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId && imageId != null
                ? imageId
                : findSplashScreen.dataValues.id_image,
            description: description,
            button_name: button_name,
            is_deleted: DeletedStatus.No,
            button_text_color: button_text_color,
            button_color: button_color,
            sort_order:
              sort_order &&
              sort_order !== null &&
              sort_order !== "" &&
              sort_order !== undefined
                ? sort_order
                : null,
            title: title,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: findSplashScreen.dataValues.id , company_info_id :req?.body?.session_res?.client_id}, transaction: trn }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      }

      const AfterUpdatefindSplashScreen = await TemplateThreeData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No },
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { template_three_splash_screen_id: findSplashScreen?.dataValues?.id, data: {...findSplashScreen?.dataValues} },
        new_data: {
          template_three_splash_screen_id: AfterUpdatefindSplashScreen?.dataValues?.id, data: { ...AfterUpdatefindSplashScreen?.dataValues }
        }
      }], findSplashScreen?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateThreeSplashScreen, req?.body?.session_res?.id_app_user,trn)
      

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

export const deleteSplashScreen = async (req: Request) => {
  try {
      const { TemplateThreeData } = initModels(req);

    const findSplashScreen = await TemplateThreeData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSplashScreen && findSplashScreen.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateThreeData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSplashScreen.dataValues.id ,company_info_id :req?.body?.session_res?.client_id} }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_three_splash_screen_id: findSplashScreen?.dataValues?.id, data: {...findSplashScreen?.dataValues} },
      new_data: {
        template_three_splash_screen_id: findSplashScreen?.dataValues?.id, data: {
          ...findSplashScreen?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findSplashScreen?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateThreeSplashScreen, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getSplashScreen = async (req: Request) => {
  try {
      const { TemplateThreeData,Image } = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateThreeSectionType.SplashScreen },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateThreeData.count({
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

    const result = await TemplateThreeData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "link",
        "is_active",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] ,where:{company_info_id :req?.body?.session_res?.client_id},required:false}],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForSplashScreen = async (req: Request) => {
  try {
      const { TemplateThreeData } = initModels(req);

    const findSplashScreen = await TemplateThreeData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateThreeSectionType.SplashScreen },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(findSplashScreen && findSplashScreen.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateThreeData.update(
      {
        is_active: statusUpdateValue(findSplashScreen),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSplashScreen.dataValues.id , company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_three_splash_screen_id: findSplashScreen?.dataValues?.id, data: {...findSplashScreen?.dataValues} },
      new_data: {
        template_three_splash_screen_id: findSplashScreen?.dataValues?.id, data: {
          ...findSplashScreen?.dataValues, is_active:  statusUpdateValue(findSplashScreen),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findSplashScreen?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateThreeSplashScreen, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
