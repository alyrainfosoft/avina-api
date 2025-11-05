import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  TemplateFiveSectionType,
} from "../../../utils/app-enumeration";
import {
  BANNER_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
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

export const addCategorySection = async (req: Request) => {
  try {
    const {Image, TemplateFiveData} = initModels(req);
    const {
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order,
      id_category,
    } = req.body;
    const trn = await (req.body.db_connection).transaction();
    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.category,
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
      const TemaplateCategory = await TemplateFiveData.create(
        {
          section_type: TemplateFiveSectionType.CategorySection,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          button_name: button_name,
          is_deleted: DeletedStatus.No,
          button_text_color: button_text_color,
          button_color: button_color,
          sort_order: sort_order,
          id_category: id_category,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_five_category_id: TemaplateCategory?.dataValues?.id, data: {
            ...TemaplateCategory?.dataValues
          }
        }
      }], TemaplateCategory?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateFiveCategory, req?.body?.session_res?.id_app_user,trn)

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

export const updateCategorySection = async (req: Request) => {
  try {
    const {Image, TemplateFiveData} = initModels(req);

    const {
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order,
      id_category,
      image_delete = "0",
    } = req.body;

    const findBanner = await TemplateFiveData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findBanner && findBanner.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findBanner.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findBanner.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.category,
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
        await TemplateFiveData.update(
          {
            section_type: TemplateFiveSectionType.CategorySection,
            link: link,
            is_active: ActiveStatus.Active,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId || findBanner.dataValues.id_image,
            button_name: button_name,
            is_deleted: DeletedStatus.No,
            button_text_color: button_text_color,
            button_color: button_color,
            sort_order: sort_order,
            id_category: id_category,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: findBanner.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      }

      const AfterUpdateFindBanner = await TemplateFiveData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { template_five_category_id: findBanner?.dataValues?.id, data: {...findBanner?.dataValues}},
        new_data: {
          template_five_category_id: AfterUpdateFindBanner?.dataValues?.id, data: {...AfterUpdateFindBanner?.dataValues }
        }
      }], findBanner?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateFiveCategory, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteCategorySection = async (req: Request) => {
  try {
    const {Image, TemplateFiveData} = initModels(req);

    const findBanner = await TemplateFiveData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findBanner && findBanner.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }

    await TemplateFiveData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findBanner.dataValues.id ,company_info_id :req?.body?.session_res?.client_id} }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_five_category_id: findBanner?.dataValues?.id, data: {...findBanner?.dataValues} },
      new_data: {
        template_five_category_id: findBanner?.dataValues?.id, data: {
          ...findBanner?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findBanner?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateFiveCategory, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getCategorySection = async (req: Request) => {
  try {
    const {Image, TemplateFiveData,CategoryData} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateFiveSectionType.CategorySection },
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
      const totalItems = await TemplateFiveData.count({
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

    const result = await TemplateFiveData.findAll({
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
        "id_category",
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [
        { model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: CategoryData, as: "category", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCategorySection = async (req: Request) => {
  try {
    const {Image, TemplateFiveData} = initModels(req);

    const findBanner = await TemplateFiveData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateFiveSectionType.CategorySection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(findBanner && findBanner.dataValues)) {
      return resNotFound({ message: BANNER_NOT_FOUND });
    }
    await TemplateFiveData.update(
      {
        is_active: statusUpdateValue(findBanner),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findBanner.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_five_category_id: findBanner?.dataValues?.id, data: {...findBanner?.dataValues} },
      new_data: {
        template_five_category_id: findBanner?.dataValues?.id, data: {
          ...findBanner?.dataValues, is_active: statusUpdateValue(findBanner),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findBanner?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateFiveCategory, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
