import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { ActiveStatus, BANNER_TYPE, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const addMarketingPopup = async (req: Request) => {
  const { name, expiry_date, created_by, button_name, active_date, content, target_url } = req.body
  try {
    const { Image, Banner } = initModels(req);
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
            company_info_id: req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }
      const marketingPopup = await Banner.create(
        {
          name: name,
          active_date: active_date,
          expiry_date: expiry_date,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          content: content,
          button_name: button_name,
          target_url: target_url,
          banner_type: BANNER_TYPE.marketing_popup,
          created_by: req.body.session_res.id_app_user,
          company_info_id: req?.body?.session_res?.client_id,
          is_deleted: DeletedStatus.No,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req?.body?.session_res?.client_id, [{
        old_data: null,
        new_data: {
          marketing_popup_id: marketingPopup?.dataValues?.id, data: {
            ...marketingPopup?.dataValues
          }
        }
      }], marketingPopup?.dataValues?.id, LogsActivityType.Add, LogsType.MarketingPopup, req?.body?.session_res?.id_app_user, trn)


      await trn.commit();
      return resSuccess({ data: marketingPopup });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getAllMarketingPopup = async (req: Request) => {
  try {
    let paginationProps = {};

    const { Banner, Image } = initModels(req);
    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { banner_type: BANNER_TYPE.marketing_popup },
      { is_deleted: DeletedStatus.No },
      { company_info_id: req?.body?.session_res?.client_id },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            { target_url: { [Op.iLike]: "%" + pagination.search_text + "%" } },

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
        "content",
        "button_name",
        "is_active",
        "active_date",
        "expiry_date",
        "created_date",
        "created_by",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "banner_image", attributes: [], where: { company_info_id: req?.body?.session_res?.client_id }, required: false }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const updateMarketingPopup = async (req: Request) => {
  const { id, name, content, active_date, button_name, updated_by, expiry_date, target_url } = req.body

  try {
    const { Banner, Image } = initModels(req);

    const popupId = await Banner.findOne({ where: { id: id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_popup }, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
    if (popupId == null) {
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
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.banner,
            created_by: req.body.session_res.id_app_user,
            company_info_id: req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      } else {
        id_image = popupId?.dataValues?.id_image
      }

      const popupInfo = await (Banner.update(
        {
          name: name,
          content: content,
          target_url: target_url,
          button_name: button_name,
          active_date: active_date,
          expiry_date: expiry_date,
          id_image: id_image ?? null,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: popupId.dataValues.id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id }, transaction: trn }
      ));

      const popupInformation = await Banner.findOne({ where: { id: id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id }, transaction: trn })

      await addActivityLogs(req?.body?.session_res?.client_id, [{
        old_data: { marketing_popup_id: popupId?.dataValues?.id, data: { ...popupId?.dataValues } },
        new_data: {
          marketing_popup_id: popupInformation?.dataValues?.id, data: { ...popupInformation.dataValues }
        }
      }], popupId?.dataValues?.id, LogsActivityType.Edit, LogsType.MarketingPopup, req?.body?.session_res?.id_app_user, trn)

      await trn.commit();
      return resSuccess({ data: popupInformation })


    } catch (e) {
      await trn.rollback();
      throw e;
    }

  } catch (error) {

    throw (error);
  }
}

export const deleteMarketingPopup = async (req: Request) => {

  try {
    const { Banner } = initModels(req);

    const marketingPopupExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_popup }, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } });

    if (!(marketingPopupExists && marketingPopupExists.dataValues)) {
      return resNotFound();
    }
    await Banner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: marketingPopupExists.dataValues.id, company_info_id: req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req, req?.body?.session_res?.client_id, [{
      old_data: { marketing_popup_id: marketingPopupExists?.dataValues?.id, data: { ...marketingPopupExists?.dataValues } },
      new_data: {
        marketing_popup_id: marketingPopupExists?.dataValues?.id, data: {
          ...marketingPopupExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], marketingPopupExists?.dataValues?.id, LogsActivityType.Delete, LogsType.MarketingPopup, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error
  }
}

export const statusUpdateMarketingPopup = async (req: Request) => {
  try {
    const { Banner } = initModels(req);

    const marketingPopupExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.marketing_popup }, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } });
    if (marketingPopupExists) {
      const MarketingPopupInfo = await (Banner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: marketingPopupExists.dataValues.id, company_info_id: req?.body?.session_res?.client_id } }
      ));
      if (MarketingPopupInfo) {
        await addActivityLogs(req, req?.body?.session_res?.client_id, [{
          old_data: { marketing_popup_id: marketingPopupExists?.dataValues?.id, data: { ...marketingPopupExists?.dataValues } },
          new_data: {
            marketing_popup_id: marketingPopupExists?.dataValues?.id, data: {
              ...marketingPopupExists?.dataValues, is_active: req?.body?.is_active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], marketingPopupExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.MarketingPopup, req?.body?.session_res?.id_app_user)


        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}