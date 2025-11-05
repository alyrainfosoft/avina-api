import { Request } from "express";
import { ActiveStatus, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType, TEMPLATE_2_BANNER_TYPE, TemplateTwoProductSectionType } from "../../../utils/app-enumeration";
import { addActivityLogs, getCompanyIdBasedOnTheCompanyKey, getLocalDate, imageAddAndEditInDBAndS3, imageDeleteInDBAndS3, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

export const addTemplateTwoProducts = async (req: Request) => {
    try {
        const { Image, TemplateTwoBanner } = initModels(req)
        const { title, sub_title, content, products = [], product_type = 'best_seller',title_color = null, sub_title_color = null,description_color = null } = req.body

        const trn = await req.body.db_connection.transaction();
        try {
            let idImage = null;
            if (req.file) {
                const imageData = await imageAddAndEditInDBAndS3(req,
                    req.file,
                    IMAGE_TYPE.banner,
                    req.body.session_res.id_app_user,
                    "",
                    req?.body?.session_res?.client_id
                );
                if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
                    await trn.rollback();
                    return imageData;
                }
                idImage = imageData.data;
            }
            const data = await TemplateTwoBanner.create({
                banner_type: TemplateTwoProductSectionType[product_type],
                name: title,
                title: sub_title,
                content: content,
                id_image: idImage,
                product_ids: products,
                created_by: req.body.session_res.id_app_user,
                created_date: getLocalDate(),
                is_deleted: DeletedStatus.No,
                is_active: ActiveStatus.Active,
                company_info_id :req?.body?.session_res?.client_id,
                title_color,
                sub_title_color,
                description_color
            }, { transaction: trn })
            await addActivityLogs(req, req?.body?.session_res?.client_id, [{
                old_data: null,
                new_data: {
                    id: data.dataValues.id, data: { ...data.dataValues }
                }
            }], data.dataValues.id, LogsActivityType.Add, LogsType.TemplateTwoProductSection, req.body.session_res.id_app_user, trn)
            await trn.commit()
            return resSuccess()
        } catch (error) {
            await trn.rollback();
            throw error
        }
    } catch (error) {
        throw error
    }
}

export const updateTemplateTwoProducts = async (req: Request) => {
    try {
        const { title, sub_title, content, products = [], product_type = 'best_seller', image_delete = "0",title_color = null, sub_title_color = null,description_color = null } = req.body
        const { Image, TemplateTwoBanner } = initModels(req)

        const findSection = await TemplateTwoBanner.findOne({ where: { id: req.params.id, banner_type: { [Op.eq]: TemplateTwoProductSectionType[product_type] }, is_deleted: DeletedStatus.No } })

        if (!(findSection && findSection.dataValues)) {
            return resNotFound()
        }

        const trn = await req.body.db_connection.transaction();

        try {
            let imageId = null;
            let findImage = null;
            if (findSection.dataValues.id_image) {
                findImage = await Image.findOne({
                    where: { id: findSection.dataValues.id_image },
                    transaction: trn,
                });
            }
            if (req.file) {
                const imageData = await imageAddAndEditInDBAndS3(req,
                    req.file,
                    IMAGE_TYPE.banner,
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
                imageId = findSection.dataValues.id_image
            }

            await TemplateTwoBanner.update({
                name: title,
                title: sub_title,
                content: content,
                id_image: imageId,
                product_ids: products,
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
                is_active: ActiveStatus.Active,
                title_color,
                sub_title_color,
                description_color
            }, { where: { id: req.params.id, banner_type: { [Op.eq]: TemplateTwoProductSectionType[product_type] }, is_deleted: DeletedStatus.No } })
            if (image_delete && image_delete === "1" && findImage.dataValues) {
                await imageDeleteInDBAndS3(req, findImage, req.body.session_res.client_id);
            }

            const afterUpdateFindSection = await TemplateTwoBanner.findOne({ where: { id: req.params.id, banner_type: { [Op.eq]: TemplateTwoProductSectionType[product_type] }, is_deleted: DeletedStatus.No } })

            await addActivityLogs(req, req?.body?.session_res?.client_id, [{
                old_data: { id: findSection?.dataValues?.id, data: { ...findSection?.dataValues } },
                new_data: {
                    id: afterUpdateFindSection?.dataValues?.id, data: {
                        ...afterUpdateFindSection?.dataValues
                    }
                }
            }], findSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateTwoProductSection, req?.body?.session_res?.id_app_user, trn)
            await trn.commit()
            return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })

        } catch (error) {
            await trn.rollback();
            throw error
        }
    } catch (error) {
        throw error
    }
}

export const getALlTemplateTwoProducts = async (req: Request) => {
    try {
        const { Image, TemplateTwoBanner } = initModels(req)
        let company_info_id: any = {};

        if (req?.body?.session_res?.client_id) {
        company_info_id.data = req.body.session_res.client_id;
        } else {
        const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);

        if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return decrypted;
        }

        company_info_id = decrypted;
        }
        const { product_type = "best_seller" } = req.params
        const data = await TemplateTwoBanner.findOne(
            {
                where: { is_deleted: DeletedStatus.No, banner_type: [TemplateTwoProductSectionType[product_type]], company_info_id: company_info_id?.data },

                attributes: [
                    "id",
                    ["name", "title"],
                    [Sequelize.literal(`(CASE WHEN "banner_type" = ${TEMPLATE_2_BANNER_TYPE.NewCollectionProduct} THEN 'new_collection' ELSE 'best_seller' END)`), "banner_type"],
                    ["title", "sub_title"],
                    "content",
                    "product_ids",
                    "title_color",
                    "sub_title_color",
                    "description_color",
                    [Sequelize.literal(`"image"."image_path"`), "image_path"]
                ],
                include: [
                    {
                        model: Image,
                        as: "image",
                        attributes: [],
                    }
                ]
            }
        )
        let products = []
        if ((data) && (data.dataValues) && (data.dataValues.product_ids)) {
            for (let index = 0; index < data.dataValues.product_ids.length; index++) {
                const element = data.dataValues.product_ids[index];
                const productData = await req.body.db_connection.query(`(WITH filtered_pmo AS (
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
                products.push({ sort_order: element.sort_order, product: productData[0] })
            }
        }
        return resSuccess({ data: { section: data, products } })
    } catch (error) {
        throw error
    }
}