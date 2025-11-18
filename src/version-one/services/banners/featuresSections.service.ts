import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { ActiveStatus, BANNER_TYPE, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, imageAddAndEditInDBAndS3, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const saveFeatureSection = async (req: Request) => {
  const {
    id,
    name,
    content,
    active_date,
    expiry_date,
    link,
    button_name,
    button_color,
    button_text_color,
    is_button_transparent,
    button_hover_color,
    button_text_hover_color,
    title_color,
    description_color,
    id_image= '0',
    id_bg_image= '0',
  } = req.body;

  const { Banner } = initModels(req);
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const userId = req.body.session_res.id_app_user;
  const clientId = req.body.session_res.client_id;

  const trn = await (req.body.db_connection).transaction();
  try {
    let idBgImage = null;
    if (files?.["bg_image"]) {
      const imageData = await imageAddAndEditInDBAndS3(
        req,
        files["bg_image"][0],
        IMAGE_TYPE.banner,
        userId,
        "",
        clientId
      );
      if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return imageData;
      }
      idBgImage = imageData.data;
    }

    let idImage = null;
    if (files?.["image"]) {
      const imageData = await imageAddAndEditInDBAndS3(
        req,
        files["image"][0],
        IMAGE_TYPE.banner,
        userId,
        "",
        clientId
      );
      if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return imageData;
      }
      idImage = imageData.data;
    }

    let resultBanner;
    const isUpdate = !!id;

    if (isUpdate) {
      const existingBanner = await Banner.findOne({
        where: {
          id,
          banner_type: BANNER_TYPE.features_sections,
          is_deleted: DeletedStatus.No,
          company_info_id: clientId,
        },
        transaction: trn
      });

      if (!existingBanner) {
        await trn.rollback();
        return resNotFound();
      }

      await Banner.update(
        {
          name,
          content,
          link_one: link,
          active_date,
          expiry_date,
          id_image: idImage !== undefined && idImage !== null
            ? parseInt(idImage)
            : (id_image !== '0' ? parseInt(id_image) : null),

          id_bg_image: idBgImage !== undefined && idBgImage !== null
            ? parseInt(idBgImage)
            : (id_bg_image !== '0' ? parseInt(id_bg_image) : null),
          target_url: link,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          title_color:title_color,
          description_color:description_color,
          modified_by: userId,
          modified_date: getLocalDate(),
        },
        {
          where: { id },
          transaction: trn,
        }
      );

      resultBanner = await Banner.findOne({
        where: { id, is_deleted: DeletedStatus.No },
        transaction: trn,
      });

      await addActivityLogs(
        clientId,
        [{
          old_data: {
            feature_section_id: existingBanner?.id,
            data: { ...existingBanner?.dataValues }
          },
          new_data: {
            feature_section_id: resultBanner?.id,
            data: { ...resultBanner?.dataValues }
          }
        }],
        id,
        LogsActivityType.Edit,
        LogsType.FeatureSection,
        userId,
        trn
      );
    } else {
      resultBanner = await Banner.create(
        {
          name,
          content,
          active_date,
          expiry_date,
          link_one: link,
          id_image: idImage,
          id_bg_image: idBgImage,
          target_url: link,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          title_color:title_color,
          description_color:description_color,
          is_active: ActiveStatus.Active,
          banner_type: BANNER_TYPE.features_sections,
          created_by: userId,
          company_info_id: clientId,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      await addActivityLogs(
        clientId,
        [{
          old_data: null,
          new_data: {
            feature_section_id: resultBanner?.id,
            data: { ...resultBanner?.dataValues }
          }
        }],
        resultBanner?.id,
        LogsActivityType.Add,
        LogsType.FeatureSection,
        userId,
        trn
      );
    }

    await trn.commit();
    return resSuccess({ data: resultBanner });
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};

export const getAllFeaturesSections = async (req: Request) => {
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
      { banner_type: BANNER_TYPE.features_sections },
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
        "content",
        "is_active",
        "created_date",
        "active_date",
        "expiry_date",
        "created_by",
        "button_name",
        "id_image",
        "id_bg_image",
        ["link_one","link"],
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "title_color",
        "description_color",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
        [Sequelize.literal("banner_bg_image.image_path"), "bg_image_path"],
      ],
      include: [{ model: Image, as: "banner_image", attributes: [], where : { company_info_id :req?.body?.session_res?.client_id },required:false },{ model: Image, as: "banner_bg_image", attributes: [], where : { company_info_id :req?.body?.session_res?.client_id },required:false }],
    });


    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
}

export const deleteFeatureSection = async (req: Request) => {

  try {
    const {Banner} = initModels(req);

    const FeatureSectionExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.features_sections }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });


    if (!(FeatureSectionExists && FeatureSectionExists.dataValues)) {
      return resNotFound();
    }
    await Banner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: FeatureSectionExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { feature_section_id: FeatureSectionExists?.dataValues?.id, data: {...FeatureSectionExists?.dataValues} },
      new_data: {
        feature_section_id: FeatureSectionExists?.dataValues?.id, data: {
          ...FeatureSectionExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], FeatureSectionExists?.dataValues?.id, LogsActivityType.Delete, LogsType.FeatureSection, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (error) {
    throw error
  }
}

export const statusUpdateFeatureSection = async (req: Request) => {
  try {
    const { Banner} = initModels(req);

    const featureSectionExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.features_sections }, is_deleted: DeletedStatus.No, company_info_id :req?.body?.session_res?.client_id } });
    if (featureSectionExists) {
      const featureSectionInfo = await (Banner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: featureSectionExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      ));
      if (featureSectionInfo) {
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { feature_section_id: featureSectionExists?.dataValues?.id, data: {...featureSectionExists?.dataValues} },
          new_data: {
            feature_section_id: featureSectionExists?.dataValues?.id, data: {
              ...featureSectionExists?.dataValues, is_active: req?.body?.is_active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], featureSectionExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.FeatureSection, req?.body?.session_res?.id_app_user)
    
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}