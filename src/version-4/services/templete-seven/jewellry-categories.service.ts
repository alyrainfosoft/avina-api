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

export const addJewellryCategoriesSection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const {
      id_categories,
      title,
      link,
      sort_order = null,
    } = req.body;
    const trn = await(req.body.db_connection).transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let idTitleImage = null;
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSeven,
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

      const TemaplateSevenJewellryCategory = await TemplateSevenData.create(
        {
          section_type: TemplateSevenSectionType.JewellryCategoriesSection, 
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != "" &&
            sort_order != null &&
            sort_order != undefined
              ? sort_order
              : 0,
          id_categories: id_categories,
          id_title_image: idTitleImage,
          title,
          link,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          temaplate_seven_jewellry_category_id: TemaplateSevenJewellryCategory?.dataValues?.id, data: {
            ...TemaplateSevenJewellryCategory?.dataValues
          }
        }
      }], TemaplateSevenJewellryCategory?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSevenJewellryCategoriesSection, req?.body?.session_res?.id_app_user,trn)
              
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

export const updateJewellryCategoriesSection = async (req: Request) => {
  try {
    const {TemplateSevenData,Image} = initModels(req);

    const {
      title,
      id_categories,
      link,
      sort_order = null,
      title_image_delete = "0"
    } = req.body;

    const findDiamondShapeSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await(req.body.db_connection).transaction();
    try {

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let titleImageId = null;
      let findTitleImage = null;
      if (findDiamondShapeSection.dataValues.id_title_image) {
        findTitleImage = await Image.findOne({
          where: { id: findDiamondShapeSection.dataValues.id_title_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["title_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["title_image"][0],
          IMAGE_TYPE.templateSeven,
          req.body.session_res.id_app_user,
          findTitleImage,
          req?.body?.session_res?.client_id,
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        titleImageId = imageData.data;
      }

      {
        await TemplateSevenData.update(
          {
            section_type: TemplateSevenSectionType.JewellryCategoriesSection,
            title,
            is_deleted: DeletedStatus.No,
            id_title_image:
              title_image_delete && title_image_delete === "1"
                ? null
                : titleImageId != null
                ? titleImageId
                : findDiamondShapeSection.dataValues.id_title_image,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            link,
            id_categories:id_categories,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: findDiamondShapeSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
      }
    
      if (title_image_delete && title_image_delete === "1" && findTitleImage.dataValues) {
        await imageDeleteInDBAndS3(req,findTitleImage,req.body.session_res.client_id);
      }
      const AfterUpdatefindDiamondShapeSection = await TemplateSevenData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_jewellry_category_id: findDiamondShapeSection?.dataValues?.id, data: {...findDiamondShapeSection?.dataValues}},
        new_data: {
          temaplate_seven_jewellry_category_id: AfterUpdatefindDiamondShapeSection?.dataValues?.id, data: { ...AfterUpdatefindDiamondShapeSection?.dataValues }
        }
      }], findDiamondShapeSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSevenJewellryCategoriesSection, req?.body?.session_res?.id_app_user,trn)
      
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      console.log(e);
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const deleteJewellryCategoriesSection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);

    const JewellryCategoriesSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(JewellryCategoriesSection && JewellryCategoriesSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: JewellryCategoriesSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_jewellry_category_id: JewellryCategoriesSection?.dataValues?.id, data: {...JewellryCategoriesSection?.dataValues} },
      new_data: {
        temaplate_seven_jewellry_category_id: JewellryCategoriesSection?.dataValues?.id, data: {
          ...JewellryCategoriesSection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], JewellryCategoriesSection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSevenJewellryCategoriesSection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getJewellryCategoriesSection = async (req: Request) => {
  try {
    const {TemplateSevenData,Image, CategoryData} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateSevenSectionType.JewellryCategoriesSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
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
        "is_active",
        "sort_order",
        "id_title_image",
        "link",
        "id_categories",
        [Sequelize.literal("title_image.image_path"), "title_image_path"],
        [Sequelize.literal("category.slug"), "slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
      ],
      include: [
        { model: Image, as: "title_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: CategoryData, as: "category", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForJewellryCategoriesSection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);

    const JewellryCategoriesSection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSevenSectionType.JewellryCategoriesSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(JewellryCategoriesSection && JewellryCategoriesSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(JewellryCategoriesSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: JewellryCategoriesSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_jewellry_category_id: JewellryCategoriesSection?.dataValues?.id, data: {...JewellryCategoriesSection?.dataValues} },
      new_data: {
        temaplate_seven_jewellry_category_id: JewellryCategoriesSection?.dataValues?.id, data: {
          ...JewellryCategoriesSection?.dataValues, is_active: statusUpdateValue(JewellryCategoriesSection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], JewellryCategoriesSection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSevenJewellryCategoriesSection, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
