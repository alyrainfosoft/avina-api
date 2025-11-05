import { Request } from "express";
import {
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  prepareMessageFromParams,
  resBadRequest,
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
  TemplateFiveSectionType,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  MAXIMUM_PRODUCT_MODELS_ALLOWED,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { MAXIMUM_PRODUCT_MODELS_COUNT } from "../../../utils/app-constants";
import { initModels } from "../../model/index.model";

export const addProductModel = async (req: Request) => {
  try {
    const { TemplateFiveData, Image } = initModels(req);
    const { title, link, sort_order, id_collection, id_category } = req.body;
    const findModels = await TemplateFiveData.findAll({
      where: {
        section_type: TemplateFiveSectionType.ProductModel,
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (findModels.length >= MAXIMUM_PRODUCT_MODELS_COUNT) {
      return resBadRequest({
        message: prepareMessageFromParams(MAXIMUM_PRODUCT_MODELS_ALLOWED, [
          ["field_name", MAXIMUM_PRODUCT_MODELS_COUNT.toString()],
        ]),
      });
    }
    const trn = await (req.body.db_connection).transaction();
    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.ProductModel,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id,
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }
      const TemapleteFiveProductModle = await TemplateFiveData.create(
        {
          section_type: TemplateFiveSectionType.ProductModel,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          is_deleted: DeletedStatus.No,
          sort_order: sort_order,
          title: title,
          id_collection: id_collection || null,
          id_category: id_category || null,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_five_product_modle_id: TemapleteFiveProductModle?.dataValues?.id, data: {
            ...TemapleteFiveProductModle?.dataValues
          }
        }
      }], TemapleteFiveProductModle?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateFiveProductModle, req?.body?.session_res?.id_app_user,trn)

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

export const updateProductModel = async (req: Request) => {
  try {
    const { TemplateFiveData, Image } = initModels(req);
    const {
      title,
      link,
      sort_order,
      id_collection,
      id_category,
      image_delete = "0",
    } = req.body;

    const findModel = await TemplateFiveData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findModel && findModel.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findModel.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findModel.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.ProductModel,
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
            link: link,
            is_active: ActiveStatus.Active,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId || findModel.dataValues.id_image,
            is_deleted: DeletedStatus.No,
            sort_order: sort_order,
            title: title,
            id_collection: id_collection || null,
            id_category: id_category || null,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: findModel.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      } const AfterUpdateFindModel = await TemplateFiveData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { template_five_product_modle_id: findModel?.dataValues?.id, data: findModel?.dataValues},
        new_data: {
          template_five_product_modle_id: AfterUpdateFindModel?.dataValues?.id, data: { ...AfterUpdateFindModel?.dataValues }
        }
      }], findModel?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateFiveProductModle, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteProductModel = async (req: Request) => {
  try {
    const { TemplateFiveData } = initModels(req);
    const findModel = await TemplateFiveData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findModel && findModel.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateFiveData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findModel.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_five_product_modle_id: findModel?.dataValues?.id, data: {...findModel?.dataValues} },
      new_data: {
        template_five_product_modle_id: findModel?.dataValues?.id, data: {
          ...findModel?.dataValues, is_deleted: DeletedStatus.yes,
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findModel?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateFiveProductModle, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getProductModel = async (req: Request) => {
  try {
    const { TemplateFiveData, Image,CategoryData, Collection } = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateFiveSectionType.ProductModel },
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
        "sort_order",
        "id_collection",
        "id_category",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Collection, as: "collection", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: CategoryData, as: "category", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForProductModel = async (req: Request) => {
  try {
    const { TemplateFiveData } = initModels(req);
    const findModel = await TemplateFiveData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateFiveSectionType.ProductModel },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(findModel && findModel.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    if (findModel.dataValues.is_active === "0") {
      const findModels = await TemplateFiveData.findAll({
        where: {
          section_type: TemplateFiveSectionType.ProductModel,
          is_deleted: DeletedStatus.No,
          is_active: ActiveStatus.Active,
          company_info_id :req?.body?.session_res?.client_id,
        },
      });

      if (findModels.length >= MAXIMUM_PRODUCT_MODELS_COUNT) {
        return resBadRequest({
          message: prepareMessageFromParams(MAXIMUM_PRODUCT_MODELS_ALLOWED, [
            ["field_name", MAXIMUM_PRODUCT_MODELS_COUNT.toString()],
          ]),
        });
      }
    }
    await TemplateFiveData.update(
      {
        is_active: statusUpdateValue(findModel),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findModel.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_five_product_modle_id: findModel?.dataValues?.id, data: {...findModel?.dataValues} },
      new_data: {
        template_five_product_modle_id: findModel?.dataValues?.id, data: {
          ...findModel?.dataValues, is_active: statusUpdateValue(findModel),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findModel?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateFiveProductModle, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
