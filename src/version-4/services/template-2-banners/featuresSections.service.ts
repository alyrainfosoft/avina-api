import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType, TEMPLATE_2_BANNER_TYPE } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const addTemplateTwoFeaturesSections = async (req: Request) => {
  const { title, target_url, button_name, content, sort_order,title_color = null, sub_title_color = null,description_color = null } = req.body
  try {
    const {Image, TemplateTwoBanner} = initModels(req)
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
      const FeaturesSections = await TemplateTwoBanner.create(
        {
          name: title,
          target_url: target_url,
          button_name: button_name,
          is_active: ActiveStatus.Active,
          content: content,
          id_image: idImage,
          sort_order: sort_order,
          is_deleted: DeletedStatus.No,
          banner_type: TEMPLATE_2_BANNER_TYPE.features_sections,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
          title_color,
          sub_title_color,
          description_color
        },
        { transaction: trn }
      );

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_two_feature_section_id: FeaturesSections?.dataValues?.id, data: {
            ...FeaturesSections?.dataValues
          }
        }
      }], FeaturesSections?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateTwoFeatureSection, req?.body?.session_res?.id_app_user,trn)

      await trn.commit();
      return resSuccess({ data: FeaturesSections });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getAllTemplateTwoFeaturesSections = async (req: Request) => {
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
      { banner_type: TEMPLATE_2_BANNER_TYPE.features_sections },
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
        "button_name",
        "sort_order",
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
}

export const updateTemplateTwoFeaturesSections = async (req: Request) => {
  const { id, title, content, target_url,  button_name, sort_order, title_color = null, sub_title_color = null,description_color = null } = req.body

  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    const bannerId = await TemplateTwoBanner.findOne({ where: { id: id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.features_sections }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } })

    if (bannerId == null) {
      return resNotFound()
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
        id_image = bannerId?.dataValues?.id_image
      }

      const payload = {
        name: title,
      target_url: target_url,
      button_name: button_name,
      content: content,
        id_image: id_image ?? null,
        sort_order: sort_order,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
        title_color,
        sub_title_color,
        description_color
      }
        const bannerInfo = await (TemplateTwoBanner.update(
          payload,
          { where: { id: bannerId.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        ));

        const afterUpdatebannerId = await TemplateTwoBanner.findOne({ where: { id: id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.features_sections }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },transaction: trn  })

        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { template_two_feature_section_id: bannerId?.dataValues?.id, data: bannerId?.dataValues },
          new_data: {
            template_two_feature_section_id: afterUpdatebannerId?.dataValues?.id, data: { ...afterUpdatebannerId?.dataValues }
          }
        }], bannerId?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateTwoFeatureSection, req?.body?.session_res?.id_app_user,trn)
        
        await trn.commit();
        return resSuccess()


    } catch (e) {
      await trn.rollback();
      throw e;
    }

  } catch (error) {

    throw (error);
  }
}

export const deleteTemplateTwoFeatureSection = async (req: Request) => {

  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    const FeatureSectionExists = await TemplateTwoBanner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.features_sections }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });

    if (!(FeatureSectionExists && FeatureSectionExists.dataValues)) {
      return resNotFound();
    }
    await TemplateTwoBanner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: FeatureSectionExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,req?.body?.session_res?.client_id,[{
      old_data: { template_two_feature_section_id: FeatureSectionExists?.dataValues?.id, data: {...FeatureSectionExists?.dataValues} },
      new_data: {
        template_two_feature_section_id: FeatureSectionExists?.dataValues?.id, data: {
          ...FeatureSectionExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], FeatureSectionExists?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateTwoFeatureSection, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (error) {
    throw error
  }
}

export const statusUpdateTemplateTwoFeatureSection = async (req: Request) => {
  try {
    const {Image, TemplateTwoBanner} = initModels(req)

    const featureSectionExists = await TemplateTwoBanner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: TEMPLATE_2_BANNER_TYPE.features_sections }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });
    if (featureSectionExists) {
      const featureSectionInfo = await (TemplateTwoBanner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: featureSectionExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      ));
      if (featureSectionInfo) {
        await addActivityLogs(req,req?.body?.session_res?.client_id,req?.body?.session_res?.client_id,[{
          old_data: { template_two_feature_section_id: featureSectionExists?.dataValues?.id, data: {...featureSectionExists?.dataValues} },
          new_data: {
            template_two_feature_section_id: featureSectionExists?.dataValues?.id, data: {
              ...featureSectionExists?.dataValues, is_active: req?.body?.is_active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], featureSectionExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateTwoFeatureSection, req?.body?.session_res?.id_app_user)
          
    
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}