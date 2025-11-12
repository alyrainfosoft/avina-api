import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { ActiveStatus, BANNER_TYPE, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const addMarketingBanner = async (req: Request) => {
  const { name, target_url, expiry_date, created_by, active_date,sub_title,link_one,link_two,button_one,button_two,
      link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      title_color,
      sub_title_color } = req.body
  try {
    const { Image,Banner } = initModels(req);
    
    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType((req.body.db_connection),
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
      const marketingBanner = await Banner.create(
        {
          name: name,
          active_date: active_date,
          expiry_date: expiry_date,
          is_active: ActiveStatus.Active,
          sub_title:sub_title,
          link_one:link_one,
          link_two:link_two,
          button_one:button_one,
          button_two:button_two,
          target_url: link,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          title_color:title_color,
          sub_title_color:sub_title_color,
          id_image: idImage,
          banner_type: BANNER_TYPE.marketing_banner,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          marketing_banner_id: marketingBanner?.dataValues?.id, data: {
            ...marketingBanner?.dataValues
          }
        }
      }], marketingBanner?.dataValues?.id, LogsActivityType.Add, LogsType.MarketingBanner, req?.body?.session_res?.id_app_user,trn)
           
      await trn.commit();
      return resSuccess({ data: marketingBanner });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getAllMarketingBanner = async (req: Request) => {
  try {
    const { Image,Banner } = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id :req?.body?.session_res?.client_id },
      { banner_type: BANNER_TYPE.marketing_banner },
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
        "created_date",
        "created_by",
        "sub_title",
        "link_one",
        "link_two",
        "button_one",
        "button_two",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "title_color",
        "sub_title_color",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "banner_image", attributes: [], where:{ company_info_id :req?.body?.session_res?.client_id },required:false}],
    });


    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const updateMarketingBanner = async (req: Request) => {
  const { id, name, target_url, active_date, updated_by, expiry_date,sub_title,link_one,link_two,button_one,button_two,link,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      title_color,
      sub_title_color } = req.body

  try {
    const { Image,Banner } = initModels(req);

    const bannerId = await Banner.findOne({ where: { id: id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_banner }, is_deleted: DeletedStatus.No, company_info_id :req?.body?.session_res?.client_id } })

    console.log(bannerId)
    if (bannerId == null) {
      return resNotFound()
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType((req.body.db_connection),
        req.file,
        IMAGE_TYPE.banner,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }else{
      id_image = bannerId?.dataValues?.id_image
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
        id_image = bannerId?.dataValues?.id_image
      }

        const bannerInfo = await (Banner.update(
          {
            name: name,
            active_date: active_date,
            expiry_date: expiry_date,
            sub_title:sub_title,
            link_one:link_one,
            link_two:link_two,
            button_one:button_one,
            button_two:button_two,
            target_url: link,
            button_name: button_name,
            button_color: button_color,
            button_text_color: button_text_color,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            title_color:title_color,
            sub_title_color:sub_title_color,
            id_image: id_image ?? null, 
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: bannerId.dataValues.id, is_deleted: DeletedStatus.No, company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        ));

        const bannerInformation = await Banner.findOne({ where: { id: id, is_deleted: "0", company_info_id :req?.body?.session_res?.client_id }, transaction: trn })
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { marketing_banner_id: bannerId?.dataValues?.id, data: {...bannerId?.dataValues} },
          new_data: {
            marketing_banner_id: bannerInformation?.dataValues?.id, data: { ...bannerInformation?.dataValues }
          }
        }], bannerId?.dataValues?.id, LogsActivityType.Edit, LogsType.MarketingBanner, req?.body?.session_res?.id_app_user,trn)
       

        await trn.commit();
        return resSuccess({ data: bannerInformation })
      

    } catch (e) {
      await trn.rollback();
      throw e;
    }

  } catch (error) {

    throw (error);
  }
}

export const deleteMarkingBanner = async (req: Request) => {

  try {
    const { Banner } = initModels(req);

    const MarkingBannerExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_banner }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });

    if (!(MarkingBannerExists && MarkingBannerExists.dataValues)) {
      return resNotFound();
    }
    await Banner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: MarkingBannerExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { marketing_banner_id: MarkingBannerExists?.dataValues?.id, data: {...MarkingBannerExists?.dataValues} },
          new_data: {
            marketing_banner_id: MarkingBannerExists?.dataValues?.id, data: {
              ...MarkingBannerExists?.dataValues, is_deleted: DeletedStatus.yes,
              modified_by: req?.body?.session_res?.id_app_user,
              modified_date: getLocalDate(),
            }
          }
        }], MarkingBannerExists?.dataValues?.id, LogsActivityType.Delete, LogsType.MarketingBanner, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (error) {
    throw error
  }
}

export const statusUpdateMarkingBanner = async (req: Request) => {
  try {
    const { Banner } = initModels(req);

    const MarkingBannerExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_banner }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });
    if (MarkingBannerExists) {
      const MarkingBannerActionInfo = await (Banner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: MarkingBannerExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      ));
      if (MarkingBannerActionInfo) {
        
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
              old_data: { marketing_banner_id: MarkingBannerExists?.dataValues?.id, data: {...MarkingBannerExists?.dataValues} },
              new_data: {
                marketing_banner_id: MarkingBannerExists?.dataValues?.id, data: {
                  ...MarkingBannerExists?.dataValues, is_active: req?.body?.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req?.body?.session_res?.id_app_user,
                }
              }
            }], MarkingBannerExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.MarketingBanner, req?.body?.session_res?.id_app_user)
        
        
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}