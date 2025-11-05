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

export const addDiamondSection = async (req: Request) => {
  try {
    const { Image, TemplateFiveData } = initModels(req);
    const {
      title,
      sub_title,
      description,
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order,
      id_collection,
    } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const trn = await (req.body.db_connection).transaction();
    try {
      let idImage = null;
      if (files["image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
          IMAGE_TYPE.jewelry_section,
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

      let idSubImage = null;
      if (files["sub_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["sub_image"][0],
          IMAGE_TYPE.jewelry_section,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idSubImage = imageData.data;
      }
      const temapleteDiamond = await TemplateFiveData.create(
        {
          section_type: TemplateFiveSectionType.DiamondSection,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          sub_title: sub_title,
          description: description,
          button_name: button_name,
          is_deleted: DeletedStatus.No,
          button_text_color: button_text_color,
          button_color: button_color,
          sort_order: sort_order,
          title: title,
          id_sub_image: idSubImage,
          id_collection: id_collection,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_five_diamon_section_id: temapleteDiamond?.dataValues?.id, data: {
            ...temapleteDiamond?.dataValues
          }
        }
      }], temapleteDiamond?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateFiveDiamond, req?.body?.session_res?.id_app_user,trn)

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

export const updateDiamondSection = async (req: Request) => {
  try {
    const { Image, TemplateFiveData } = initModels(req);
    const {
      title,
      sub_title,
      description,
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order,
      id_collection,
      sub_image_delete = "0",
      image_delete = "0",
    } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

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
      let findSubImage = null;
      if (findBanner.dataValues.id_sub_image) {
        findSubImage = await Image.findOne({
          where: { id: findBanner.dataValues.id_sub_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (files["image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["image"][0],
          IMAGE_TYPE.jewelry_section,
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
      let imageSubId = null;
      if (files["sub_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["sub_image"][0],
          IMAGE_TYPE.jewelry_section,
          req.body.session_res.id_app_user,
          findSubImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageSubId = imageData.data;
      }
      {
        await TemplateFiveData.update(
          {
            section_type: TemplateFiveSectionType.DiamondSection,
            link: link,
            is_active: ActiveStatus.Active,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId || findBanner.dataValues.id_image,
            sub_title: sub_title,
            description: description,
            button_name: button_name,
            is_deleted: DeletedStatus.No,
            button_text_color: button_text_color,
            button_color: button_color,
            sort_order: sort_order,
            title: title,
            id_sub_image: imageSubId || findBanner.dataValues.id_sub_image,
            id_collection: id_collection,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { where: { id: findBanner.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      }
      if (
        sub_image_delete &&
        sub_image_delete === "1" &&
        findSubImage.dataValues
      ) {
        await imageDeleteInDBAndS3(req,findSubImage,req.body.session_res.client_id);
      }
      const AfterUpdateFindBanner = await TemplateFiveData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { template_five_diamon_section_id: findBanner?.dataValues?.id, data: {...findBanner?.dataValues}},
        new_data: {
          template_five_diamon_section_id: AfterUpdateFindBanner?.dataValues?.id, data: { ...AfterUpdateFindBanner?.dataValues }
        }
      }], findBanner?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateFiveDiamond, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteDiamondSection = async (req: Request) => {
  try {
    const { TemplateFiveData } = initModels(req);
    const findBanner = await TemplateFiveData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id},
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
      { where: { id: findBanner.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_five_diamon_section_id: findBanner?.dataValues?.id, data: {...findBanner?.dataValues} },
      new_data: {
        template_five_diamon_section_id: findBanner?.dataValues?.id, data: {
          ...findBanner?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findBanner?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateFiveDiamond, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getDiamondSection = async (req: Request) => {
  try {
    const { TemplateFiveData,Image,Collection } = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateFiveSectionType.DiamondSection },
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
        "sub_title",
        "link",
        "is_active",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        "id_collection",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("sub_image.image_path"), "Sub_image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Image, as: "sub_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
        { model: Collection, as: "collection", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false },
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForDiamondSection = async (req: Request) => {
  try {
    const { TemplateFiveData } = initModels(req);
    const findBanner = await TemplateFiveData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateFiveSectionType.DiamondSection },
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
      old_data: { template_five_diamon_section_id: findBanner?.dataValues?.id, data: {...findBanner?.dataValues} },
      new_data: {
        template_five_diamon_section_id: findBanner?.dataValues?.id, data: {
          ...findBanner?.dataValues, is_active: statusUpdateValue(findBanner),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findBanner?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateFiveDiamond, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
