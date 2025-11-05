import { Request } from "express";
import { Op, QueryTypes, Sequelize } from "sequelize";
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
import { initModels } from "../../model/index.model";

export const addBanner = async (req: Request) => {
  try {
    const {TemplateSixData} = initModels(req);
    const {
      title,
      description,
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order = null,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
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
      let idMobileImage = null;
      if (files["mobile_image"]) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files["mobile_image"][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          ""
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idMobileImage = imageData.data;
      }
      const TemaplateSixBanner = await TemplateSixData.create(
        {
          section_type: TemplateSixSectionType.BannerSection,
          link: link,
          is_active: ActiveStatus.Active,
          id_image: idImage,
          description: description,
          button_name: button_name,
          is_deleted: DeletedStatus.No,
          button_text_color: button_text_color,
          button_color: button_color,
          mobile_banner_image: idMobileImage,
          sort_order:
            sort_order &&
            sort_order !== null &&
            sort_order !== "" &&
            sort_order !== undefined
              ? sort_order
              : null,
          title: title,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          is_button_transparent: is_button_transparent,
          button_hover_color: button_hover_color,
          button_text_hover_color: button_text_hover_color,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_six_banner_id: TemaplateSixBanner?.dataValues?.id, data: {
            ...TemaplateSixBanner?.dataValues
          }
        }
      }], TemaplateSixBanner?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSixBanner, req?.body?.session_res?.id_app_user,trn)

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
    const {TemplateSixData,Image} = initModels(req);

    const {
      title,
      description,
      link,
      button_name,
      button_color,
      button_text_color,
      sort_order = null,
      is_button_transparent = "0",
      button_hover_color,
      button_text_hover_color,
      image_delete = "0",
      mobile_image_delete = "0"
    } = req.body;

    const findSplashScreen = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSplashScreen && findSplashScreen.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let imageId = null;
      let mobileImageId = null;
      let findImage = null;
      let findMobileImage = null;
      if (findSplashScreen.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findSplashScreen.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (findSplashScreen.dataValues.mobile_banner_image) {
        findMobileImage = await Image.findOne({
          where: { id: findSplashScreen.dataValues.mobile_banner_image },
          transaction: trn,
        });
      }
      if (files["image"]) {
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
      } else {
        imageId = findSplashScreen.dataValues.id_image;
      }
    
      if (files['mobile_image']) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          files['mobile_image'][0],
          IMAGE_TYPE.templateSix,
          req.body.session_res.id_app_user,
          findMobileImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        mobileImageId = imageData.data;
      } else {
        mobileImageId = findSplashScreen.dataValues.mobile_banner_image;
      }
      {
        await TemplateSixData.update(
          {
            section_type: TemplateSixSectionType.BannerSection,
            link: link,
            id_image:
              image_delete && image_delete === "1"
                ? null
                : imageId,
            mobile_banner_image:
            mobile_image_delete && mobile_image_delete === "1"
                ? null
                : mobileImageId,
            description: description,
            button_name: button_name,
            is_deleted: DeletedStatus.No,
            button_text_color: button_text_color,
            button_color: button_color,
            sort_order:
              sort_order &&
              sort_order !== null &&
              sort_order !== "" &&
              sort_order !== undefined
                ? sort_order
                : null,
            title: title,
            is_button_transparent: is_button_transparent,
            button_hover_color: button_hover_color,
            button_text_hover_color: button_text_hover_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: findSplashScreen.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      }
      if (mobile_image_delete && mobile_image_delete === "1" && findMobileImage.dataValues) {
        await imageDeleteInDBAndS3(req,findMobileImage,req.body.session_res.client_id);
      }
      const AfterUpdateFindSplashScreen = await TemplateSixData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No },transaction:trn
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { template_six_banner_id: findSplashScreen?.dataValues?.id, data: {...findSplashScreen?.dataValues} },
        new_data: {
          template_six_banner_id: AfterUpdateFindSplashScreen?.dataValues?.id, data: { ...AfterUpdateFindSplashScreen?.dataValues }
        }
      }], findSplashScreen?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSixBanner, req?.body?.session_res?.id_app_user,trn)
      
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

export const deleteBanner = async (req: Request) => {
  try {
    const {TemplateSixData,Image} = initModels(req);

    const findSplashScreen = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSplashScreen && findSplashScreen.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSixData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSplashScreen.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_banner_id: findSplashScreen?.dataValues?.id, data: {...findSplashScreen?.dataValues} },
      new_data: {
        template_six_banner_id: findSplashScreen?.dataValues?.id, data: {
          ...findSplashScreen?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findSplashScreen?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSixBanner, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getBanner = async (req: Request) => {
  try {
    const {TemplateSixData,Image} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateSixSectionType.BannerSection },
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
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "sort_order",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("mobile_image.image_path"), "mobile_image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }, { model: Image, as: "mobile_image", attributes: [] }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForBanner = async (req: Request) => {
  try {
    const {TemplateSixData,Image} = initModels(req);

    const findSplashScreen = await TemplateSixData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSixSectionType.BannerSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(findSplashScreen && findSplashScreen.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSixData.update(
      {
        is_active: statusUpdateValue(findSplashScreen),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSplashScreen.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_banner_id: findSplashScreen?.dataValues?.id, data: {...findSplashScreen?.dataValues} },
      new_data: {
        template_six_banner_id: findSplashScreen?.dataValues?.id, data: {
          ...findSplashScreen?.dataValues, is_active: statusUpdateValue(findSplashScreen),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findSplashScreen?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSixBanner, req?.body?.session_res?.id_app_user)
      

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const templateSixAllSectionListForUser = async (req: Request) => {
  try {
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const result = await req.body.db_connection.query(
      `(SELECT template_six.id, template_six.title, template_six.link, template_six.sort_order,
 template_six.id_image, template_six.id_hover_image, template_six.id_title_image, template_six.mobile_banner_image,
  template_six.id_product, template_six.button_name, template_six.button_color,mobile_image.image_path AS mobile_image_path,
   template_six.button_text_color, template_six.is_button_transparent, template_six.button_hover_color,
    template_six.button_text_hover_color, template_six.description, template_six.id_diamond_shape,
     template_six.id_category, template_six.id_collection, template_six.id_style, template_six.diamond_shape_type,
      template_six.section_type, CASE WHEN hash_tag IS NULL THEN '{}' ELSE string_to_array(hash_tag, '|') END AS hash_tag,
       Image.image_path AS image_path, hover_image.image_path AS hover_image_path, title_image.image_path AS title_image_path,
        category.slug AS category_slug, collection.slug AS collection_slug, style.slug AS style_slug, diamond_shape.slug 
        AS diamond_shape_slug, null AS product_slug, null AS product_sku, null AS product_name,
		null as pmo,null as pdo,null as product_images,null as product_categories
        FROM template_six AS template_six LEFT OUTER JOIN images AS image ON template_six.id_image = Image.id 
        LEFT OUTER JOIN images AS hover_image ON template_six.id_hover_image = hover_image.id
        LEFT OUTER JOIN images AS mobile_image ON template_six.mobile_banner_image = mobile_image.id
        LEFT OUTER JOIN images AS title_image ON template_six.id_title_image = title_image.id 
        LEFT OUTER JOIN categories AS category ON template_six.id_category = category.id 
        LEFT OUTER JOIN setting_styles AS style ON template_six.id_style = style.id 
        LEFT OUTER JOIN collections AS collection ON template_six.id_collection = collection.id 
        LEFT OUTER JOIN diamond_shapes AS diamond_shape ON template_six.id_diamond_shape = diamond_shape.id 
        WHERE template_six.is_active = '1' AND template_six.is_deleted = '0' AND template_six.company_info_id = ${company_info_id?.data} ORDER BY template_six.sort_order ASC)`,
      { type: QueryTypes.SELECT }
    );

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const templateSixAllSectionDetailForUser = async (req: Request) => {
  try {
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const result = await  req.body.db_connection.query(
      `(SELECT template_six.id, template_six.title, template_six.link, template_six.sort_order,
 template_six.id_image, template_six.id_hover_image, template_six.id_title_image, template_six.mobile_banner_image,
  template_six.id_product, template_six.button_name, template_six.button_color,mobile_image.image_path AS mobile_image_path,
   template_six.button_text_color, template_six.is_button_transparent, template_six.button_hover_color,
    template_six.button_text_hover_color, template_six.description, template_six.id_diamond_shape,
     template_six.id_category, template_six.id_collection, template_six.id_style, template_six.diamond_shape_type,
      template_six.section_type, CASE WHEN hash_tag IS NULL THEN '{}' ELSE string_to_array(hash_tag, '|') END AS hash_tag,
       Image.image_path AS image_path, hover_image.image_path AS hover_image_path, title_image.image_path AS title_image_path,
        category.slug AS category_slug, collection.slug AS collection_slug, style.slug AS style_slug, diamond_shape.slug 
        AS diamond_shape_slug, null AS product_slug, null AS product_sku, null AS product_name,
		null as pmo,null as pdo,null as product_images,null as product_categories
        FROM template_six AS template_six LEFT OUTER JOIN images AS image ON template_six.id_image = Image.id 
        LEFT OUTER JOIN images AS hover_image ON template_six.id_hover_image = hover_image.id
         LEFT OUTER JOIN images AS mobile_image ON template_six.mobile_banner_image = mobile_image.id 
        LEFT OUTER JOIN images AS title_image ON template_six.id_title_image = title_image.id 
        LEFT OUTER JOIN categories AS category ON template_six.id_category = category.id 
        LEFT OUTER JOIN setting_styles AS style ON template_six.id_style = style.id 
        LEFT OUTER JOIN collections AS collection ON template_six.id_collection = collection.id 
        LEFT OUTER JOIN diamond_shapes AS diamond_shape ON template_six.id_diamond_shape = diamond_shape.id 
        WHERE template_six.is_active = '1' AND template_six.is_deleted = '0' AND template_six.id = ${req.params.id} AND template_six.company_info_id = ${company_info_id?.data} ORDER BY template_six.sort_order ASC)`,
      { type: QueryTypes.SELECT }
    );
    if (!(result && result[0])) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    return resSuccess({ data: result[0] });
  } catch (error) {
    throw error;
  }
};
