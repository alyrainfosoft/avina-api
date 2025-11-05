import { Request } from "express";
import { Op, QueryTypes, Sequelize } from "sequelize";
import {
  ActiveStatus,
  BANNER_TYPE,
  DeletedStatus,
  TEMPLATE_2_BANNER_TYPE,
  TemplateFiveSectionType,
  TemplateThreeSectionType,
} from "../../../utils/app-enumeration";
import { getCompanyIdBasedOnTheCompanyKey, resSuccess } from "../../../utils/shared-functions";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

export const getAllBanners = async (req: Request) => {
  try {
    const { Banner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: BANNER_TYPE.banner },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "created_date",
        "content",
        "description",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "title_color",
        "description_color",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "banner_image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAll3MarketingBanners = async (req: Request) => {
  try {
    const { Banner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: BANNER_TYPE.marketing_banner },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "created_date",
        "content",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "title_color",
        "sub_title_color",
        "sub_title",
        "link_one",
        "link_two",
        "button_one",
        "button_two",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "banner_image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllHomeAndAboutSection = async (req: Request) => {
  try {
    const { HomeAboutMain, HomeAboutSub, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [{ is_deleted: DeletedStatus.No }, { is_active: ActiveStatus.Active }, {company_info_id:company_info_id?.data}];
    const mainContentData = await HomeAboutMain.findAll({
      attributes: ["id", "sort_title", "title", "content", "created_date"],
      where:{company_info_id:company_info_id?.data}});
    const totalItems = await HomeAboutSub.count({
      where,
    });
    const result = await HomeAboutSub.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "content",
        "target_link",
        "button_name",
        "created_date",
        "sort_order",
        "title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { mainContentData, totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllFeaturesSections = async (req: Request) => {
  try {
    const { Banner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    } 
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: BANNER_TYPE.features_sections },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "created_date",
        "content",
        "active_date",
        "expiry_date",
        "link_one",
        "id_image",
        "id_bg_image",
        "button_name",
        "button_color",
        "button_text_color",
        "is_button_transparent",
        "button_hover_color",
        "button_text_hover_color",
        "title_color",
        "description_color",
        "is_active",
        "banner_type",
        "created_by",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
        [Sequelize.literal("banner_bg_image.image_path"), "bg_image_path"],

      ],
      include: [{ model: Image, as: "banner_image", attributes: [] },{ model: Image, as: "banner_bg_image", attributes: [], where : { company_info_id :company_info_id?.data },required:false }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getMarketingPopup = async (req: Request) => {
  try {
    const { Banner, Image } = initModels(req);
    const currentDate = `${`${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}`;
    
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: BANNER_TYPE.marketing_popup },
      { expiry_date: { [Op.gte]: currentDate } },      
      {company_info_id:company_info_id?.data},

    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "target_url",
        "content",
        "button_name",
        "active_date",
        "expiry_date",
        "created_date",
        "content",
        [Sequelize.literal("banner_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "banner_image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllOurStoryList = async (req: Request) => {
  try {
    const { OurStory, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [{ is_deleted: DeletedStatus.No }, { is_active: ActiveStatus.Active }, {company_info_id:company_info_id?.data}];
    const totalItems = await OurStory.count({
      where,
    });
    const result = await OurStory.findAll({
      where,
      attributes: [
        "id",
        "title",
        "created_date",
        "content",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

//////////-------- Template Two Frontend API -------------- /////////////////////

export const getAllTemplateTwoBannersUser = async (req: Request) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.banner },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        ["name", "title"],
        "target_url",
        "content",
        "button_name",
        "banner_text_color",
        "button_color",
        "sort_order",
        "button_text_color",
        "button_hover_color",
        "button_hover_text_color",
        "is_button_transparent",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoMarketingBannerUser = async (req: Request) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.marketing_banner },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        ["name", "title"],
        "target_link_two",
        "button_two_name",
        "sub_title",
        ["target_url", "target_url_one"],
        "content",
        ["button_name", "button_name_one"],
        "sort_order",
        "button_color",
        "button_text_color",
        "button_hover_color",
        "button_hover_text_color",
        "is_button_transparent",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoFeaturesSectionsUser = async (req: Request) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.features_sections },
      {company_info_id:company_info_id?.data},

    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "name",
        "target_url",
        "content",
        "button_name",
        "sort_order",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getTemplateTwoMarketingPopupUser = async (req: Request) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.marketing_popup },
      {company_info_id:company_info_id?.data},

    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      attributes: [
        "id",
        ["name", "title"],
        "target_url",
        "content",
        "button_name",
        "active_date",
        "expiry_date",
        "created_date",
        "created_by",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoHomeAboutBannersUser = async (req: Request) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.home_about_banner },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        ["name", "title"],
        "content",
        "button_name",
        "sort_order",
        "button_color",
        "button_text_color",
        "button_hover_color",
        "button_hover_text_color",
        "is_button_transparent",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoHomeAboutFeatureSectionUser = async (
  req: Request
) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.home_about_features_section },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "name",
        "target_url",
        "is_active",
        "content",
        "sub_title",
        "button_name",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoHomeAboutMarketingSectionUser = async (
  req: Request
) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: TEMPLATE_2_BANNER_TYPE.home_about_marketing_section },      
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await TemplateTwoBanner.count({
      where,
    });
    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        ["name", "title"],
        "is_active",
        "content",
        "sort_order",
        "button_name",
        "button_color",
        "button_text_color",
        "button_hover_color",
        "button_hover_text_color",
        "is_button_transparent",
        "title_color",
        "sub_title_color",
        "description_color",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};

export const getAllTemplateTwoProductSectionUser = async (
  req: any
) => {
  try {
    const { TemplateTwoBanner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: [TEMPLATE_2_BANNER_TYPE.BestSellerProduct, TEMPLATE_2_BANNER_TYPE.NewCollectionProduct] },
      {company_info_id:company_info_id?.data}

    ];

    const result = await TemplateTwoBanner.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        ["name", "title"],
        ["title", "sub_title"],
        "content",
        "product_ids",
        "banner_type",
        "title_color",
        "sub_title_color",
        "description_color",
       [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

    let BestSellerProductProducts:any
    let NewCollectionProductProducts:any
    if (result && result.length > 0) {
      for (let index = 0; index < result.length; index++) {
        const data = result[index];
        if ((result) && (data.dataValues) && (data.dataValues.product_ids)) {
          if (data.dataValues.banner_type == TEMPLATE_2_BANNER_TYPE.BestSellerProduct) {
            let productsData:any = await req.body.db_connection.query(`(WITH filtered_pmo AS (
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
  WHERE products.is_deleted = '${DeletedStatus.No}'::"bit" AND products.is_active = '${ActiveStatus.Active}'::"bit" AND products.parent_id IS NULL AND products.id IN (${data.dataValues.product_ids.map((id: any) => id.id).join(",") || 0})
  GROUP BY products.id)`, { type: QueryTypes.SELECT });
            const sortOrderMap = {};
            data.dataValues.product_ids.forEach(p => {
              sortOrderMap[p.id] = p.sort_order;
            });

            // Sort productsData based on the sort_order
            productsData.sort((a, b) => {
              return sortOrderMap[a.id] - sortOrderMap[b.id];
            });
            
            const products:any = productsData.map((t: any) => {
            return {
              ...t,
              pmo: t.pmo.map((value: any) => ({
                ...value,
                Price: req?.formatPrice(value.Price),
              })),
            }
          } )

            BestSellerProductProducts = { ...data.dataValues, products }
          } else if (data.dataValues.banner_type == TEMPLATE_2_BANNER_TYPE.NewCollectionProduct) {
            let productsData:any = await req.body.db_connection.query(`(WITH filtered_pmo AS (
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
  WHERE products.is_deleted = '${DeletedStatus.No}'::"bit" AND products.is_active = '${ActiveStatus.Active}'::"bit" AND products.parent_id IS NULL AND products.id IN (${data.dataValues.product_ids.map((id: any) => id.id).join(",") || 0})
  GROUP BY products.id)`, { type: QueryTypes.SELECT });
            const sortOrderMap = {};
            data.dataValues.product_ids.forEach(p => {
              sortOrderMap[p.id] = p.sort_order;
            });

            // Sort productsData based on the sort_order
            productsData.sort((a, b) => {
              return sortOrderMap[a.id] - sortOrderMap[b.id];
            });
           
             const products:any = productsData.map((t: any) => {
            return {
              ...t,
              pmo: t.pmo.map((value: any) => ({
                ...value,
                Price: req?.formatPrice(value.Price),
              })),
            }
          } ) 
            NewCollectionProductProducts = { ...data.dataValues, products }
          }
          }
      }
    }
    return resSuccess({ data: { best_selling_product: BestSellerProductProducts, new_collection_product: NewCollectionProductProducts } });
  } catch (error) {
    throw error;
  }
};

//////////-------- Template Three Frontend API -------------- /////////////////////

export const getTemplateThreeBanner = async (req: Request) => {
  try {
    const { TemplateFiveData, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.Banner },
      {company_info_id:company_info_id?.data},
    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
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
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
export const getTemplateThreeCategorySection = async (req: Request) => {
  try {
    const { TemplateFiveData, Image, CategoryData } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.CategorySection },
      {company_info_id:company_info_id?.data},
    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
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
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: CategoryData, as: "category", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
export const getTemplateThreeJewelrySection = async (req: Request) => {
  try {
    const { TemplateFiveData, Image, Collection } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.JewelrySection },
      {company_info_id:company_info_id?.data},

    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
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
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("title_image.image_path"), "title_image_path"],
        [Sequelize.literal("sub_image.image_path"), "Sub_image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "title_image", attributes: [] },
        { model: Image, as: "sub_image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};
export const getTemplateThreeDiamondSection = async (req: Request) => {
  try {
    const { TemplateFiveData, Image, Collection } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.DiamondSection },
      {company_info_id:company_info_id?.data},

    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
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
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("sub_image.image_path"), "Sub_image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Image, as: "sub_image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const getTemplateFiveProductModelForUser = async (req: Request) => {
  try {
    const { TemplateFiveData, Image, CategoryData,Collection } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateFiveSectionType.ProductModel },
      {company_info_id:company_info_id?.data},

    ];
    const result = await TemplateFiveData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "link",
        "sort_order",
        "section_type",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: CategoryData, as: "category", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const getTemplateThreeProductModelForUser = async (req: Request) => {
  try {
    const { TemplateThreeData, Image, CategoryData,Collection } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { section_type: TemplateThreeSectionType.ProductModel },
      {company_info_id:company_info_id?.data},

    ];
    const result = await TemplateThreeData.findAll({
      where,
      order: [["sort_order", "ASC"]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "link",
        "sort_order",
        "section_type",
        [Sequelize.literal("image.image_path"), "image_path"],
        [Sequelize.literal("collection.name"), "collection_name"],
        [Sequelize.literal("collection.slug"), "collection_slug"],
        [Sequelize.literal("category.category_name"), "category_name"],
        [Sequelize.literal("category.slug"), "category_slug"],
      ],
      include: [
        { model: Image, as: "image", attributes: [] },
        { model: Collection, as: "collection", attributes: [] },
        { model: CategoryData, as: "category", attributes: [] },
      ],
    });
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};


export const getTheProcess = async (req: Request) => {
  try {
    const { Banner, Image } = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
      { banner_type: BANNER_TYPE.The_process },
      {company_info_id:company_info_id?.data},
    ];
    const totalItems = await Banner.count({
      where,
    });
    const result = await Banner.findAll({
      where,
      attributes: [
        "id",
        "name",
        "sub_title",
        "description",
        "title_color",
        "sub_title_color",
        "description_color",
      ],
    });
    return resSuccess({ data: { totalItems, result } });
  } catch (error) {
    throw error;
  }
};


export const getALlNewArriveProduct = async (req: Request) => {
    try {
        const { banner_type = BANNER_TYPE.new_arriive } = req.params
        const { Banner } = initModels(req);
         const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
        const data = await Banner.findOne(
            {
                where: { is_deleted: DeletedStatus.No, banner_type: banner_type,company_info_id :company_info_id?.data },

                attributes: [
                    "id",
                    "name",
                    "sub_title",
                    "banner_type",
                    "product_ids",
                ]
            }
        )
        let products = []
        if ((data) && (data.dataValues) && (data.dataValues.product_ids)) {
        for (let index = 0; index < data.dataValues.product_ids.length; index++) {
            const element = data.dataValues.product_ids[index];
           const productData = await (req.body.db_connection).query(`(WITH filtered_pmo AS (
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
  WHERE products.is_deleted = '${DeletedStatus.No}'::"bit" AND products.is_active = '${ActiveStatus.Active}'::"bit" AND products.parent_id IS NULL AND products.id = ${element?.id || 0}
  GROUP BY products.id)`, { type: QueryTypes.SELECT });
            products.push({sort_order: element.sort_order, product: productData[0] })
        }
        }
        return resSuccess({ data: { section: data, products } })
    } catch (error) {
        throw error
    }
}


export const getBestSellProduct = async (req: Request) => {
    try {
        const { banner_type = BANNER_TYPE.best_seller } = req.params
        const { Banner } = initModels(req);
         const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
        const data = await Banner.findOne(
            {
                where: { is_deleted: DeletedStatus.No, banner_type: banner_type,company_info_id :company_info_id?.data },

                attributes: [
                    "id",
                    "name",
                    "sub_title",
                    "banner_type",
                    "product_ids",
                ]
            }
        )
        let products = []
        if ((data) && (data.dataValues) && (data.dataValues.product_ids)) {
        for (let index = 0; index < data.dataValues.product_ids.length; index++) {
            const element = data.dataValues.product_ids[index];
           const productData = await (req.body.db_connection).query(`(WITH filtered_pmo AS (
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
  WHERE products.is_deleted = '${DeletedStatus.No}'::"bit" AND products.is_active = '${ActiveStatus.Active}'::"bit" AND products.parent_id IS NULL AND products.id = ${element?.id || 0 }
  GROUP BY products.id)`, { type: QueryTypes.SELECT });
            products.push({sort_order: element.sort_order, product: productData[0] })
        }
        }
        return resSuccess({ data: { section: data, products } })
    } catch (error) {
        throw error
    }
}