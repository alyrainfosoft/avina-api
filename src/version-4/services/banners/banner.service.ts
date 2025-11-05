import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { BANNER_TYPE, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
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

export const addBanner = async (req: Request) => {
  try {
    const {Image, Banner} = initModels(req);
    const {link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      title_color,
      description_color,
    } = req.body;
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
      const Benner = await Banner.create(
        {
          name: req.body.name,
          description:req.body.description,
          target_url: link,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          title_color:title_color,
          description_color:description_color,
          active_date: req.body.active_date,
          expiry_date: req.body.expiry_date,
          is_active: req.body.is_active,
          id_image: idImage,
          banner_type: BANNER_TYPE.banner,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      const activityLogs = Benner

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          banner_id: activityLogs?.dataValues?.id, data: {
            ...activityLogs?.dataValues
          }
        }
      }], activityLogs?.dataValues?.id, LogsActivityType.Add, LogsType.Banner, req?.body?.session_res?.id_app_user,trn)
      
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

export const updateBanner = async (req: Request) => {
  try {
    const {Image, Banner} = initModels(req);
const {link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      title_color,
      description_color,
    } = req.body;
    const bannerToUpdate = await Banner.findOne({
      where: { id: req.body.id,company_info_id :req?.body?.session_res?.client_id ,is_deleted:DeletedStatus.No},
    });

    if (!(bannerToUpdate && bannerToUpdate.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND});
    }

    if (req.body.only_active_inactive === "1") {
      await Banner.update(
        {
          is_active: req.body.is_active,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: bannerToUpdate.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      );

      return resSuccess();
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

    const trn = await (req.body.db_connection).transaction();
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
        active_date: req.body.active_date,
        description: req.body.description,
        expiry_date: req.body.expiry_date,
        is_active: req.body.is_active,
        target_url: link,
        button_name: button_name,
        button_color: button_color,
        button_text_color: button_text_color,
        is_button_transparent: is_button_transparent,
        button_hover_color: button_hover_color,
        button_text_hover_color: button_text_hover_color,
        title_color:title_color,
        description_color:description_color,
        id_image: id_image ?? null,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      }

        await Banner.update( payload,
          { where: { id: bannerToUpdate.dataValues.id, company_info_id :req?.body?.session_res?.client_id, }, transaction: trn }
        );
     
        const afterUpdateBanner = await Banner.findOne({
          where: { id: req.body.id,company_info_id :req?.body?.session_res?.client_id },transaction: trn
        });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { banner_id: bannerToUpdate?.dataValues?.id, data: {...bannerToUpdate?.dataValues} },
        new_data: {
          banner_id: afterUpdateBanner?.dataValues?.id, data: { ...afterUpdateBanner.dataValues }
        }
      }], bannerToUpdate?.dataValues?.id, LogsActivityType.Edit, LogsType.Banner, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteBanner = async (req: Request) => {
  try {
    const {Banner} = initModels(req);

    const bannerToDelete = await Banner.findOne({
      where: { id: req.body.id,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(bannerToDelete && bannerToDelete.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    await Banner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: bannerToDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { banner_id: bannerToDelete?.dataValues?.id, data: bannerToDelete?.dataValues },
      new_data: {
        banner_id: bannerToDelete?.dataValues?.id, data: {
          ...bannerToDelete?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], bannerToDelete?.dataValues?.id, LogsActivityType.Delete, LogsType.Banner, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const getAllBanners = async (req: Request) => {

  try {
    const {Image, Banner} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id :req?.body?.session_res?.client_id },
      {banner_type: BANNER_TYPE.banner},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
            { description: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
            { button_name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await Banner.count({
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

    const result = await Banner.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "target_url",
        "is_active",
        "description",
        "button_name",
        ["target_url","link"],
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "title_color",
        "description_color",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "banner_image", attributes: [],where:{ company_info_id :req?.body?.session_res?.client_id },required:false }],
    });


    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

};

export const statusUpdateBanner = async (req: Request) => {
  try {
        const {Banner} = initModels(req);

      const BannerExists = await Banner.findOne({ where: { id: req.body.id,  banner_type: { [Op.eq]: BANNER_TYPE.banner }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id} });
      if (BannerExists) {
          const BannerActionInfo = await (Banner.update(
              {
                  is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: BannerExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
          ));
          if (BannerActionInfo) {

            await addActivityLogs(req,req?.body?.session_res?.client_id,[{
                  old_data: { banner_id: BannerExists?.dataValues?.id, data: BannerExists?.dataValues },
                  new_data: {
                    banner_id: BannerExists?.dataValues?.id, data: {
                      ...BannerExists?.dataValues, is_active: req?.body?.is_active,
                      modified_date: getLocalDate(),
                      modified_by: req?.body?.session_res?.id_app_user,
                    }
                  }
                }], BannerExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Banner, req?.body?.session_res?.id_app_user)
            

              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound();
      }
  } catch (error) {
      throw error
  }
  }