import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  TEMPLATE_2_BANNER_TYPE,
} from "../../../utils/app-enumeration";
import {
  BANNER_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
} from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const addTemplateTwoBanner = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)
    const {button_color = null, button_text_color= null, button_hover_color =null, button_hover_text_color = null, is_button_transparent = '0', title_color = null, sub_title_color = null,description_color = null} = req.body
    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        req.file,
        IMAGE_TYPE.banner,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await req.body.db_connection.transaction();
    try {
      let idImage = null;
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.banner,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }
      const TemplateTwoBannerData = await TemplateTwoBanner.create(
        {
          name: req.body.name,
          target_url: req.body.target_url,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          banner_type: TEMPLATE_2_BANNER_TYPE.banner,
          content: req.body.content,
          button_name: req.body.button_name,
          is_deleted: DeletedStatus.No,
          sort_order: req.body.sort_order || 0,
          banner_text_color: req.body.banner_text_color,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
          button_color,
          button_text_color,
          button_hover_color,
          button_hover_text_color,
          is_button_transparent,
          title_color,
          sub_title_color,
          description_color
        },
        { transaction: trn }
      );

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_two_banner_id: TemplateTwoBannerData?.dataValues?.id, data: {
            ...TemplateTwoBannerData?.dataValues
          }
        }
      }], TemplateTwoBannerData?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateTwoBanner, req?.body?.session_res?.id_app_user,trn)

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

export const updateTemplateTwoBanner = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    const {button_color = null, button_text_color= null, button_hover_color =null, button_hover_text_color = null, is_button_transparent = '0',title_color = null, sub_title_color = null,description_color = null} = req.body

    const bannerToUpdate = await TemplateTwoBanner.findOne({
      where: { id: req.body.id,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(bannerToUpdate && bannerToUpdate.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        req.file,
        IMAGE_TYPE.banner,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await req.body.db_connection.transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.banner,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      }else{
        id_image = bannerToUpdate?.dataValues?.id_image
      }
      
      const payload = {
        name: req.body.name,
        target_url: req.body.target_url,
        content: req.body.content,
        button_name: req.body.button_name,
        is_active: req.body.is_active,
        id_image: id_image ?? null,
        sort_order: req.body.sort_order || 0,
        banner_text_color: req.body.banner_text_color,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
        button_color,
        button_text_color,
        button_hover_color,
        button_hover_text_color,
        is_button_transparent,
        title_color,
        sub_title_color,
        description_color
      }
        await TemplateTwoBanner.update(
          payload,
          { where: { id: bannerToUpdate.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }  
        );
    
      const afterUpdatebannerToUpdate = await TemplateTwoBanner.findOne({
        where: { id: req.body.id },transaction:trn
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { template_two_banner_id: bannerToUpdate?.dataValues?.id, data: {...bannerToUpdate?.dataValues}},
        new_data: {
          template_two_banner_id: afterUpdatebannerToUpdate?.dataValues?.id, data: { ...afterUpdatebannerToUpdate?.dataValues }}
      }], bannerToUpdate?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateTwoBanner, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteTemplateTwoBanner = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    const bannerToDelete = await TemplateTwoBanner.findOne({
      where: { id: req.body.id,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(bannerToDelete && bannerToDelete.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    await TemplateTwoBanner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: bannerToDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_two_banner_id: bannerToDelete?.dataValues?.id, data: {...bannerToDelete?.dataValues} },
      new_data: {
        template_two_banner_id: bannerToDelete?.dataValues?.id, data: {
          ...bannerToDelete?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], bannerToDelete?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateTwoBanner, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const getAllTemplateTwoBanners = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { banner_type: TEMPLATE_2_BANNER_TYPE.banner },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateTwoBanner.count({
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

    const result = await TemplateTwoBanner.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "target_url",
        "is_active",
        "content",
        "sort_order",
        "button_name",
        "banner_text_color",
        "button_color",
        "button_text_color",
        "button_hover_color",
        "button_hover_text_color",
        "is_button_transparent",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateTemapleTwoBanner = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    const BannerExists = await TemplateTwoBanner.findOne({
      where: {
        id: req.body.id,
        banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.banner },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });
    if (BannerExists) {
      const BannerActionInfo = await TemplateTwoBanner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: BannerExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      );
      if (BannerActionInfo) {
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { template_two_banner_id: BannerExists?.dataValues?.id, data: {...BannerExists?.dataValues} },
          new_data: {
            template_two_banner_id: BannerExists?.dataValues?.id, data: {
              ...BannerExists?.dataValues, is_active: req?.body?.is_active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], BannerExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateTwoBanner, req?.body?.session_res?.id_app_user)
          
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
      }
    } else {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }
  } catch (error) {
    throw error;
  }
};
