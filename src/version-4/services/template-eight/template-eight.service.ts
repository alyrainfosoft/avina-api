import { Request } from "express";
import { initModels } from "../../model/index.model";
import { addActivityLogs, resNotFound, resSuccess, getLocalDate, imageAddAndEditInDBAndS3, statusUpdateValue, getCompanyIdBasedOnTheCompanyKey } from "../../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, NOT_FOUND_MESSAGE, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY, SECTION_TYPE_NOT_FOUND_MESSAGE } from "../../../utils/app-messages";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { SINGLE_ENTRY_SECTION_TYPES, TEMPLATE_EIGHT_SECTION_TYPES } from "../../../utils/app-constants";

function buildSectionPayload(reqBody: any) {
  return {
    title: reqBody.title,
    sub_title: reqBody.sub_title,
    description: reqBody.description,
    sub_description: reqBody.sub_description,
    title_color: reqBody.title_color,
    sub_title_color: reqBody.sub_title_color,
    description_color: reqBody.description_color,
    sub_description_color: reqBody.sub_description_color,
    link: reqBody.link,
    button_name: reqBody.button_name,
    button_color: reqBody.button_color,
    button_text_color: reqBody.button_text_color,
    is_button_transparent: reqBody.is_button_transparent ?? false,
    button_hover_color: reqBody.button_hover_color,
    button_text_hover_color: reqBody.button_text_hover_color,
    sort_order: reqBody.sort_order ?? 0,
    section_type: reqBody.section_type,
    is_active: reqBody.is_active ?? ActiveStatus.Active,
    is_deleted: DeletedStatus.No,
    product_ids: Array.isArray(reqBody.product_ids)
        ? reqBody.product_ids
        : JSON.parse(reqBody.product_ids),
    start_date: reqBody?.start_date,
    end_date: reqBody?.end_date,
    company_info_id: reqBody?.session_res?.client_id,
  };
}

export const upsertSection = async (req: Request) => {
  try {
    const { TemplateEightData, Image } = initModels(req);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let idTitleImage = null;
    let findTitleImage = null;

    // If updating, try to find existing image
    if (req.params.id) {
      const existingSection = await TemplateEightData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No },
      });
      if (existingSection?.dataValues?.id_title_image) {
        findTitleImage = await Image.findOne({
          where: { id: existingSection.dataValues.id_title_image },
        });
      }
    }

    // Handle image upload/edit
    if (files && files["title_image"]) {
      const imageData = await imageAddAndEditInDBAndS3(
        req,
        files["title_image"][0],
        IMAGE_TYPE.templateEight, // Use your enum value for templateEight
        req.body.session_res.id_app_user,
        findTitleImage,
        req?.body?.session_res?.client_id
      );

      if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return imageData;
      }
      idTitleImage = imageData.data;
    }

    const payload = {
      ...buildSectionPayload(req.body),
      id_title_image: idTitleImage != null ? idTitleImage : req.body.id_title_image // fallback if not uploading new image
    };
    if (!(TEMPLATE_EIGHT_SECTION_TYPES.includes(payload.section_type))) {
        return resNotFound({ message: SECTION_TYPE_NOT_FOUND_MESSAGE });
    }
    const trn = await (req.body.db_connection).transaction();
    try {
    

      if (SINGLE_ENTRY_SECTION_TYPES.includes(payload.section_type)) {
        let section = await TemplateEightData.findOne({
          where: { section_type: payload.section_type, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        if (section) {
          const oldData = { ...section.dataValues };
          await TemplateEightData.update(
            { ...payload, modified_date: getLocalDate() },
            { where: { id: section.dataValues.id }, transaction: trn }
          );
          const updatedSection = await TemplateEightData.findOne({
            where: { id: section.dataValues.id, is_deleted: DeletedStatus.No },
            transaction: trn,
          });
          await addActivityLogs(req, req?.body?.session_res?.client_id, [{
            old_data: { section_id: oldData.id, data: oldData },
            new_data: { section_id: updatedSection?.dataValues?.id, data: { ...updatedSection?.dataValues } }
          }], oldData.id, LogsActivityType.Edit, LogsType.section, req?.body?.session_res?.id_app_user, trn);
          await trn.commit();
          return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
        } else {
          const newSection = await TemplateEightData.create(
            { ...payload, created_date: getLocalDate() },
            { transaction: trn }
          );
          await addActivityLogs(req, req?.body?.session_res?.client_id, [{
            old_data: null,
            new_data: { section_id: newSection?.dataValues?.id, data: { ...newSection?.dataValues } }
          }], newSection?.dataValues?.id, LogsActivityType.Add, LogsType.section, req?.body?.session_res?.id_app_user, trn);
          await trn.commit();
          return resSuccess();
        }
      } else {
        if (req.params.id) {
          const section = await TemplateEightData.findOne({
            where: { id: req.params.id, is_deleted: DeletedStatus.No },
            transaction: trn,
          });
          if (!section) {
            await trn.rollback();
            return resNotFound({ message: NOT_FOUND_MESSAGE });
          }
          const oldData = { ...section.dataValues };
          await TemplateEightData.update(
            { ...payload, modified_date: getLocalDate() },
            { where: { id: section.dataValues.id }, transaction: trn }
          );
          const updatedSection = await TemplateEightData.findOne({
            where: { id: section.dataValues.id, is_deleted: DeletedStatus.No },
            transaction: trn,
          });
          await addActivityLogs(req, req?.body?.session_res?.client_id, [{
            old_data: { section_id: oldData.id, data: oldData },
            new_data: { section_id: updatedSection?.dataValues?.id, data: { ...updatedSection?.dataValues } }
          }], oldData.id, LogsActivityType.Edit, LogsType.section, req?.body?.session_res?.id_app_user, trn);
          await trn.commit();
          return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
        } else {
          const newSection = await TemplateEightData.create(
            { ...payload, created_date: getLocalDate() },
            { transaction: trn }
          );
          await addActivityLogs(req, req?.body?.session_res?.client_id, [{
            old_data: null,
            new_data: { section_id: newSection?.dataValues?.id, data: { ...newSection?.dataValues } }
          }], newSection?.dataValues?.id, LogsActivityType.Add, LogsType.section, req?.body?.session_res?.id_app_user, trn);
          await trn.commit();
          return resSuccess();
        }
      }
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};


export const activateInactiveSection = async (req: Request) => {
  try {
    const { TemplateEightData } = initModels(req);

    const section = await TemplateEightData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(section && section.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateEightData.update({
      is_active: statusUpdateValue(section),
      modified_date: getLocalDate(),
    }, { where: { id: section.dataValues.id } });

    await addActivityLogs(req, req?.body?.session_res?.client_id, [{
      old_data: { section_id: section?.dataValues?.id, data: { ...section?.dataValues } },
      new_data: { section_id: section?.dataValues?.id, data: { ...section?.dataValues, is_active: statusUpdateValue(section), modified_date: getLocalDate() } }
    }], section?.dataValues?.id, LogsActivityType.Delete, LogsType.section, req?.body?.session_res?.id_app_user);

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};


export const deleteSection = async (req: Request) => {
  try {
    const { TemplateEightData } = initModels(req);

    const section = await TemplateEightData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });

    if (!(section && section.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateEightData.update({
      is_deleted: DeletedStatus.yes,
      is_active: ActiveStatus.InActive,
      modified_date: getLocalDate(),
    }, { where: { id: section.dataValues.id } });

    await addActivityLogs(req, req?.body?.session_res?.client_id, [{
      old_data: { section_id: section?.dataValues?.id, data: { ...section?.dataValues } },
      new_data: { section_id: section?.dataValues?.id, data: { ...section?.dataValues, is_deleted: DeletedStatus.yes, is_active: ActiveStatus.InActive, modified_date: getLocalDate() } }
    }], section?.dataValues?.id, LogsActivityType.Delete, LogsType.section, req?.body?.session_res?.id_app_user);

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getAllSections = async (req: Request) => {
  try {
    const { TemplateEightData, Image } = initModels(req);

    const sections = await TemplateEightData.findAll({
      where: { is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id },
        attributes: [
                "id",
                "title",
                "sub_title",
                "description",
                "sub_description",
                "title_color",
                "sub_title_color",
                "description_color",
                "sub_description_color",
                "link",
                "button_name",
                "button_color",
                "button_text_color",
                "is_button_transparent",
                "button_hover_color",
                "button_text_hover_color",
                "sort_order",
                "section_type",
                "is_active",
                "product_ids",
                "id_title_image",
                "start_date",
                "end_date",
                [Sequelize.literal("eight_title_image.image_path"), "title_image_path"],
            ],
            include: [
                { model: Image, as: "eight_title_image", attributes: [], where:{company_info_id :req?.body?.session_res?.client_id},required:false },
            ],
    });

    for (const section of sections) {
      if (
        section.dataValues.section_type === SINGLE_ENTRY_SECTION_TYPES[0] &&
        Array.isArray(section.dataValues.product_ids)
      ) {
        let products = [];
        for (let index = 0; index < section.dataValues.product_ids.length; index++) {
          const element = section.dataValues.product_ids[index];
          const productData = await (req.body.db_connection).query(
            `(WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name,
            karats.calculate_rate AS karat_calculate_rate,
            pmo.company_info_id
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat AND karats.is_deleted = '0'::"bit" AND karats.is_active = '1'::"bit"
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat(web_config_setting.image_base_url, product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
             LEFT JOIN web_config_setting ON web_config_setting.company_info_id = product_images.company_info_id
          WHERE product_images.is_deleted = '0'::"bit" AND (product_images.image_type = ANY (ARRAY[1, 4]))
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(
                CASE
                    WHEN dgm_1.rate IS NOT NULL AND dgm_1.rate <> 0::double precision THEN dgm_1.rate
                    ELSE dgm_1.synthetic_rate
                END * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        ), without_center_diamond_price AS (
         SELECT pdo_1.id_product,
            sum(
                CASE
                    WHEN dgm_1.rate IS NOT NULL AND dgm_1.rate <> 0::double precision THEN dgm_1.rate
                    ELSE dgm_1.synthetic_rate
                END * pdo_1.weight::double precision * pdo_1.count::double precision) AS diamond_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND pdo_1.id_type = 2 AND pdo_1.is_band IS FALSE
          GROUP BY pdo_1.id_product
        )
 SELECT 
   products.id,
    products.name,
    products.sku,
    products.slug,
    products.product_type,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL OR TRIM(BOTH FROM filtered_pmo.id_metal_tone) = ''::text THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'compare_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'choose_style_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price - filtered_pmo.center_diamond_price::double precision
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
            END
        END)) AS pmo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '${DeletedStatus.No}'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
  WHERE products.is_deleted = '${DeletedStatus.No}'::"bit" AND products.is_active = '${ActiveStatus.Active}'::"bit" AND products.parent_id IS NULL AND products.id = ${element?.id}
  GROUP BY products.id)`, { type: QueryTypes.SELECT });
          products.push({ sort_order: element.sort_order, product: productData[0] });
        }
        section.dataValues.products = products;
      }
    }

    return resSuccess({ data: sections });
  } catch (e) {
    throw e;
  }
};

export const getAllSectionsUser = async (req: any) => {
  try {
    const { TemplateEightData, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const sections = await TemplateEightData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, company_info_id: company_info_id?.data },
        attributes: [
            "id",
            "title",
            "sub_title",
            "description",
            "sub_description",
            "title_color",
            "sub_title_color",
            "description_color",
            "sub_description_color",
            "link",
            "button_name",
            "button_color",
            "button_text_color",
            "is_button_transparent",
            "button_hover_color",
            "button_text_hover_color",
            "sort_order",
            "section_type",
            "is_active",
            "product_ids",
            "start_date",
            "end_date",
            [Sequelize.literal("eight_title_image.image_path"), "title_image_path"],
        ],
        include: [
            { model: Image, as: "eight_title_image", attributes: [], where:{company_info_id :company_info_id?.data},required:false },
        ],
    });

    for (const section of sections) {
      if (
        section.dataValues.section_type === SINGLE_ENTRY_SECTION_TYPES[0] &&
        Array.isArray(section.dataValues.product_ids)
      ) {
        let products = [];
        for (let index = 0; index < section.dataValues.product_ids.length; index++) {
          const element = section.dataValues.product_ids[index];
          const productData = await (req.body.db_connection).query(
            `(WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name,
            karats.calculate_rate AS karat_calculate_rate,
            pmo.company_info_id
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat AND karats.is_deleted = '0'::"bit" AND karats.is_active = '1'::"bit"
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat(web_config_setting.image_base_url, product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
             LEFT JOIN web_config_setting ON web_config_setting.company_info_id = product_images.company_info_id
          WHERE product_images.is_deleted = '0'::"bit" AND (product_images.image_type = ANY (ARRAY[1, 4]))
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(
                CASE
                    WHEN dgm_1.rate IS NOT NULL AND dgm_1.rate <> 0::double precision THEN dgm_1.rate
                    ELSE dgm_1.synthetic_rate
                END * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        ), without_center_diamond_price AS (
         SELECT pdo_1.id_product,
            sum(
                CASE
                    WHEN dgm_1.rate IS NOT NULL AND dgm_1.rate <> 0::double precision THEN dgm_1.rate
                    ELSE dgm_1.synthetic_rate
                END * pdo_1.weight::double precision * pdo_1.count::double precision) AS diamond_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND pdo_1.id_type = 2 AND pdo_1.is_band IS FALSE
          GROUP BY pdo_1.id_product
        )
 SELECT 
   products.id,
    products.name,
    products.sku,
    products.slug,
    products.product_type,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL OR TRIM(BOTH FROM filtered_pmo.id_metal_tone) = ''::text THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'compare_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'choose_style_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price - filtered_pmo.center_diamond_price::double precision
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
            END
        END)) AS pmo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '${DeletedStatus.No}'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
     LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
  WHERE products.is_deleted = '${DeletedStatus.No}'::"bit" AND products.is_active = '${ActiveStatus.Active}'::"bit" AND products.parent_id IS NULL AND products.id = ${element?.id}
  GROUP BY products.id)`, { type: QueryTypes.SELECT });
          if (productData[0] && Array.isArray(productData[0].pmo)) {
            productData[0].pmo = await Promise.all(productData[0].pmo.map(async pmoItem => ({
              ...pmoItem,
              Price: await req.formatPrice(pmoItem.Price, productData[0].product_type)
            })));
          }
          products.push({ sort_order: element.sort_order, product: productData[0] });

        }
        section.dataValues.products = products;
      }
    }

    return resSuccess({ data: sections });
  } catch (e) {
    console.log("Error in getAllSectionsUser:", e);
    throw e;
  }
};