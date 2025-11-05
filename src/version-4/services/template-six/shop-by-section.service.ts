import { Request } from "express";
import {
  getCompanyIdBasedOnTheCompanyKey,
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
  TemplateSixSectionType,
} from "../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../../model/index.model";

export const addShopBySection = async (req: Request) => {
  try {
    const { TemplateSixData } = initModels(req);
    const {
      title,
      link,
      sort_order = null,
      section_type,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      id_category = null,
      id_collection = null,
      id_style = null,
      description,
    } = req.body;
    const trn = await (req.body.db_connection).transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let idImage = null;
      if (files["image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
          IMAGE_TYPE.templateSix,
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

      let idHoverImage = null;
      if (files["hover_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["hover_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idHoverImage = imageData.data;
      }
      const temaplateSixShpeBy = await TemplateSixData.create(
        {
          section_type: section_type,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != null &&
            sort_order != "" &&
            sort_order != undefined
              ? sort_order
              : null,
          button_name: button_name,
          button_color: button_color,
          button_text_color: button_text_color,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          id_category:
            id_category &&
            id_category != null &&
            id_category != "" &&
            id_category != undefined
              ? id_category
              : null,
          id_collection:
            id_collection &&
            id_collection != null &&
            id_collection != "" &&
            id_collection != undefined
              ? id_collection
              : null,
          id_style:
            id_style &&
            id_style != null &&
            id_style != "" &&
            id_style != undefined
              ? id_style
              : null,
          title: title,
          id_hover_image: idHoverImage,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
          description,
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_six_shopby_id: temaplateSixShpeBy?.dataValues?.id, data: {
            ...temaplateSixShpeBy?.dataValues
          }
        }
      }], temaplateSixShpeBy?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSixShopBy, req?.body?.session_res?.id_app_user,trn)

      await trn.commit();
      return resSuccess();
    } catch (e) {
      console.log(e, "error");
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    console.log(e, "error");
    throw e;
  }
};

export const updateShopBySection = async (req: Request) => {
  try {
    const { TemplateSixData,Image } = initModels(req);
    const {
      title,
      link,
      sort_order = null,
      section_type,
      button_name,
      button_color,
      button_text_color,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      id_category = null,
      id_collection = null,
      id_style = null,
      description,
      image_delete = "0",
      hover_image_delete = "0",
    } = req.body;

    const findShopBySection = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findShopBySection && findShopBySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    const trn = await (req.body.db_connection).transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imageId = null;
      let findImage = null;
      if (findShopBySection.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findShopBySection.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
          IMAGE_TYPE.templateSix,
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
      let imageHoverId = null;
      let findHoverImage = null;
      if (findShopBySection.dataValues.id_hover_image) {
        findHoverImage = await Image.findOne({
          where: { id: findShopBySection.dataValues.id_hover_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["hover_image"] !== undefined) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["hover_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          findHoverImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageHoverId = imageData.data;
      }
      {
        await TemplateSixData.update(
          {
            section_type: section_type,
            link: link,
            id_image:
              image_delete == "1"
                ? null
                : imageId == null
                ? findShopBySection.dataValues.id_image
                : imageId,
            sort_order:
              sort_order &&
              sort_order != null &&
              sort_order != "" &&
              sort_order != undefined
                ? sort_order
                : null,
            button_name: button_name,
            button_color: button_color,
            button_text_color: button_text_color,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            id_category:
              id_category &&
              id_category != null &&
              id_category != "" &&
              id_category != undefined
                ? id_category
                : null,
            id_collection:
              id_collection &&
              id_collection != null &&
              id_collection != "" &&
              id_collection != undefined
                ? id_collection
                : null,
            id_style:
              id_style &&
              id_style != null &&
              id_style != "" &&
              id_style != undefined
                ? id_style
                : null,
            title: title,
            id_hover_image:
              hover_image_delete == "1"
                ? null
                : imageHoverId == null
                ? findShopBySection.dataValues.id_hover_image
                : imageHoverId,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
            description,
          },
          {
            where: { id: findShopBySection.dataValues.id ,company_info_id :req?.body?.session_res?.client_id},
            transaction: trn,
          }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      }
      if (
        hover_image_delete &&
        hover_image_delete === "1" &&
        findHoverImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findHoverImage,req.body.session_res.client_id);
      }

      const AfterUpdatefindShopBySection= await TemplateSixData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No },transaction:trn
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { template_six_shopby_id: findShopBySection?.dataValues?.id, data: {...findShopBySection?.dataValues}
        },
        new_data: {
          template_six_shopby_id: AfterUpdatefindShopBySection?.dataValues?.id, data: { ...AfterUpdatefindShopBySection?.dataValues }
        }
      }], findShopBySection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSixShopBy, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteShopBySection = async (req: Request) => {
  try {
    const {TemplateSixData} = initModels(req);
    const findShopBySection = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id},
    });

    if (!(findShopBySection && findShopBySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSixData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findShopBySection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_shopby_id: findShopBySection?.dataValues?.id, data:{ ...findShopBySection?.dataValues}},
      new_data: {
        template_six_shopby_id: findShopBySection?.dataValues?.id, data: {
          ...findShopBySection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findShopBySection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSixShopBy, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getShopBySection = async (req: Request) => {
  try {
    const {TemplateSixData,Image, Collection,SettingTypeData,CategoryData} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      req.query.section_type && req.query.section_type != ""
        ? {
            section_type: req.query.section_type,
          }
        : {},
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
      const totalItems = await TemplateSixData.count({
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

    const result = await TemplateSixData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "link",
        "is_active",
        "sort_order",
        "id_image",
        "id_hover_image",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "description",
        "id_category",
        "id_collection",
        "id_style",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("hover_image.image_path"), "hover_image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "hover_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: CategoryData, as: "category", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: SettingTypeData, as: "style", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Collection, as: "collection", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForShopBySection = async (req: Request) => {
  try {
    const { TemplateSixData } = initModels(req);
    const findShopBySection = await TemplateSixData.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(findShopBySection && findShopBySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSixData.update(
      {
        is_active: statusUpdateValue(findShopBySection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findShopBySection.dataValues.id ,company_info_id :req?.body?.session_res?.client_id} }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_shopby_id: findShopBySection?.dataValues?.id, data: {...findShopBySection?.dataValues} },
      new_data: {
        template_six_shopby_id: findShopBySection?.dataValues?.id, data: {
          ...findShopBySection?.dataValues, is_active: statusUpdateValue(findShopBySection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findShopBySection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSixShopBy, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const templateThreeAllSectionListForUser = async (req: Request) => {
  try {
    const { TemplateSixData, Image, SettingTypeData, CategoryData, Collection,DiamondShape } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const result = await TemplateSixData.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No ,company_info_id:company_info_id?.data},
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "link",
        "sort_order",
        "id_image",
        "id_hover_image",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "description",
        "id_diamond_shape",
        "id_category",
        "id_collection",
        "id_style",
        "diamond_shape_type",
        "section_type",
        [
          Sequelize.literal(
            `CASE WHEN "hash_tag" IS NULL THEN '{}' ELSE string_to_array("hash_tag", '|') END`
          ),
          "hash_tag",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("hover_image.image_path"), "hover_image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
        [Sequelize.literal("diamond_shape.slug"), "diamond_shape_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
        { model: Image, as: "hover_image", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
        { model: CategoryData, as: "category", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
        { model: SettingTypeData, as: "style", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
        { model: Collection, as: "collection", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
        { model: DiamondShape, as: "diamond_shape", attributes: [],where:{company_info_id:company_info_id?.data},required:false },
      ],
    });

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const templateThreeAllSectionDetailForUser = async (req: Request) => {
  try {
    const { TemplateSixData, Image, SettingTypeData, CategoryData, Collection, DiamondShape } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const result = await TemplateSixData.findOne({
      where: {
        id: req.params.id,
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
        company_info_id:company_info_id?.data
      },
      attributes: [
        "id",
        "title",
        "link",
        "sort_order",
        "id_image",
        "id_hover_image",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "description",
        "id_diamond_shape",
        "id_category",
        "id_collection",
        "id_style",
        "diamond_shape_type",
        "section_type",
        [
          Sequelize.literal(
            `CASE WHEN "hash_tag" IS NULL THEN '{}' ELSE string_to_array("hash_tag", '|') END`
          ),
          "hash_tag",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("hover_image.image_path"), "hover_image_path"],
        [Sequelize.literal("category.slug"), "category_slug"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("style.slug"), "style_slug"],
        [Sequelize.literal("diamond_shape.slug"), "diamond_shape_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] , where:{company_info_id:company_info_id?.data},required:false},
        { model: Image, as: "hover_image", attributes: [] , where:{company_info_id:company_info_id?.data},required:false},
        { model: CategoryData, as: "category", attributes: [] , where:{company_info_id:company_info_id?.data},required:false},
        { model: SettingTypeData, as: "style", attributes: [] , where:{company_info_id:company_info_id?.data},required:false},
        { model: Collection, as: "collection", attributes: [] , where:{company_info_id:company_info_id?.data},required:false},
        { model: DiamondShape, as: "diamond_shape", attributes: [] , where:{company_info_id:company_info_id?.data},required:false},
      ],
    });

    if (!(result && result.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
