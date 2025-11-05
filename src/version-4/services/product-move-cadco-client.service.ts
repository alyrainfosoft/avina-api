// get CADCO detail for the add new data for the client

import { Request } from "express"
import { QueryTypes, where } from "sequelize"
import { addActivityLogs, columnValueLowerCase, createSlug, getCompanyIdBasedOnTheCompanyKey, getLocalDate, prepareMessageFromParams, refreshMaterializedProductListView, resNotFound, resSuccess, resUnknownError, resUnprocessableEntity } from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType, PRODUCT_CUSTOMIZATION_STATUS, SingleProductType } from "../../utils/app-enumeration";
import { CATEGORY_IS_REQUIRES, CATEGORY_NOT_FOUND, DEFAULT_STATUS_CODE_SUCCESS, ERROR_NOT_FOUND, GOLD_WEIGHT_REQUIRES, LONG_DES_IS_REQUIRES, METAL_IS_REQUIRES, METAL_KT_IS_REQUIRES, METAL_TONE_IS_REQUIRES, MIN_MAX_LENGTH_ERROR_MESSAGE, NOT_FOUND_CODE, PRODUCT_EXIST_WITH_SAME_SKU, REQUIRED_ERROR_MESSAGE, SORT_DES_IS_REQUIRES, SUB_CATEGORY_NOT_FOUND, SUB_SUB_CATEGORY_NOT_FOUND, TAG_IS_REQUIRES } from "../../utils/app-messages";
import { ADD_CADCO_PRODUCT_DETAIL_TO_CLIENT_API_URL, DISCOUNT_TYPE_PLACE_ID, GENDERLIST, GET_DIAMOND_PLACE_ID_FROM_LABEL, GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID } from "../../utils/app-constants";
import { initModels } from "../model/index.model";
import { create } from "domain";
import { COMPANY_INFO_KEY } from "../../config/env.var";
import axios from "axios";

export const getCADCOProductDetailsForClient = async (req: Request) => {
  try {
      const { company_key, product_ids, diamond_color, diamond_clarity } = req.body
    const productDetails = await req.body.db_connection.query(`WITH ranked AS (
    SELECT 
        products.id AS product_id,
        PMO.id AS PMO_ID,
		CASE WHEN cat.category_name IS NULL THEN '' ELSE cat.category_name END as category,
		CASE WHEN sub_cat.category_name IS NULL THEN '' ELSE sub_cat.category_name END as sub_category,
		CASE WHEN sub_sub_cat.category_name IS NOT NULL THEN sub_sub_cat.category_name ELSE '' END as sub_sub_category,
		CASE WHEN products.name IS NOT NULL THEN products.name ELSE '' END AS name,
        CASE WHEN products.sku IS NOT NULL THEN products.sku ELSE '' END AS sku,
        CASE WHEN pp.sku IS NOT NULL THEN pp.sku ELSE '' END AS parent_sku,
        CASE WHEN products.meta_title IS NOT NULL THEN products.meta_title ELSE '' END AS meta_title,
        CASE WHEN products.meta_description IS NOT NULL THEN products.meta_description ELSE '' END AS meta_description,
        CASE WHEN products.meta_tag IS NOT NULL THEN products.meta_tag ELSE '' END AS meta_tag,
        cASE WHEN products.is_customization = '1' THEN TRUE ELSE FALSE END AS is_customization,
        CASE WHEN products.id_collection IS NOT NULL THEN (SELECT STRING_AGG(name, ' | ') FROM collections WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.id_collection, '|', ','), ',')::INTEGER[])) ELSE '' END AS collection,
        CASE WHEN products.tag IS NOT NULL THEN (SELECT STRING_AGG(name, ' | ') FROM tags WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.tag, '|', ','), ',')::INTEGER[])) ELSE '' END AS tag,
        CASE WHEN products.sort_description IS NOT NULL THEN products.sort_description  ELSE '' END AS short_description,
        CASE WHEN  products.long_description IS NOT NULL THEN products.long_description ELSE '' END AS long_description,
        CASE WHEN  products.making_charge IS NOT NULL THEN products.making_charge::text ELSE '' END AS labour_charge,
        CASE WHEN products.finding_charge IS NOT NULL THEN products.finding_charge::text ELSE '' END AS finding_charge,
        CASE WHEN products.other_charge IS NOT NULL THEN products.other_charge::text ELSE '' END AS other_charge,
		CASE WHEN metal.name IS NOT NULL THEN metal.name ELSE '' END AS metal,
        CASE WHEN karat.name IS NOT NULL THEN karat.name::text ELSE '' END AS karat,
        CASE WHEN pmo.id_metal_tone IS NOT NULL THEN (SELECT STRING_AGG(metal_tones.sort_code, '|') FROM metal_tones WHERE id = ANY(STRING_TO_ARRAY(REPLACE(pmo.id_metal_tone, '|', ','), ',')::INTEGER[])) ELSE '' END AS metal_tone,
        CASE WHEN pmo.metal_weight IS NOT NULL THEN pmo.metal_weight::text ELSE '' END AS metal_weight,
        CASE WHEN pmo.quantity IS NOT NULL THEN pmo.quantity::text ELSE '' END AS quantity,
		CASE WHEN products.gender IS NOT NULL THEN CASE 
            WHEN products.gender = '1' THEN 'male' 
            WHEN products.gender = '2' THEN 'female' 
            WHEN products.gender = '3' THEN 'unisex' 
            ELSE NULL 
        END ELSE '' END AS gender,
        products.additional_detail AS additional_detail,
        products.certificate AS certification,
        products.shipping_day AS shipping_days,
        (SELECT STRING_AGG(name, '|') FROM setting_styles WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.setting_style_type, '|', ','), ',')::INTEGER[])) AS setting_style_type,
        (SELECT STRING_AGG(size, '|') FROM items_sizes WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.size, '|', ','), ',')::INTEGER[])) AS size,
        (SELECT STRING_AGG(length, '|') FROM items_lengths WHERE id = ANY(STRING_TO_ARRAY(REPLACE(products.length, '|', ','), ',')::INTEGER[])) AS length,
		ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY pc.id) AS pcrn,
        ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY PMO.id) AS pmrn
    FROM products
    LEFT JOIN product_metal_options AS PMO 
        ON PMO.id_product = products.id 
        AND PMO.is_deleted = '0'
	LEFT JOIN product_categories AS pc ON pc.id_product = products.id AND pc.is_deleted = '0'
    LEFT JOIN categories AS cat ON cat.id = pc.id_category
    LEFT JOIN categories AS sub_cat ON sub_cat.id = pc.id_sub_category
    LEFT JOIN categories AS sub_sub_cat ON sub_sub_cat.id = pc.id_sub_sub_category
	LEFT JOIN metal_masters AS metal ON metal.id = pmo.id_metal
    LEFT JOIN gold_kts AS karat ON karat.id = pmo.id_karat
	LEFT JOIN products AS pp ON pp.id = products.parent_id
    WHERE products.is_deleted = '${DeletedStatus.No}'
    AND products.product_type IN (${SingleProductType.DynemicPrice},${SingleProductType.cataLogueProduct})
    AND products.company_info_id = ${req?.body?.session_res?.client_id}
    AND products.id IN (${product_ids.join(',')}) 
),
diamond_ranked AS (
    SELECT 
        products.id AS product_id,
        PDO.id AS PDO_ID,
		stone.name AS stone,
        shape.name AS shape,
        mm.value AS mm_size,
        col.value AS color,
        cla.value AS clarity,
        cut.value AS cut,
        CASE 
            WHEN pdo.id_type = 1 THEN 'centre' 
            WHEN pdo.id_type = 2 THEN 'side' 
            ELSE NULL 
        END AS stone_type,
        setting.name AS stone_setting,
        pdo.weight AS stone_weight,
        pdo.count AS stone_count,
        ROW_NUMBER() OVER (PARTITION BY products.id ORDER BY PDO.id) AS pdrn
    FROM products
    LEFT JOIN product_diamond_options AS PDO 
        ON PDO.id_product = products.id 
        AND PDO.is_deleted = '0'
	INNER JOIN diamond_group_masters AS DGM ON DGM.id = pdo.id_diamond_group
    LEFT JOIN gemstones AS stone ON stone.id = DGM.id_stone
    LEFT JOIN setting_styles AS setting ON setting.id = pdo.id_setting
    LEFT JOIN diamond_shapes AS shape ON shape.id = DGM.id_shape
    LEFT JOIN mm_sizes AS mm ON mm.id = DGM.id_mm_size
    LEFT JOIN colors AS col ON col.id = DGM.id_color
    LEFT JOIN clarities AS cla ON cla.id = DGM.id_clarity
    LEFT JOIN cuts AS cut ON cut.id = DGM.id_cuts
    WHERE products.is_deleted = '${DeletedStatus.No}'
    AND products.product_type IN (${SingleProductType.DynemicPrice},${SingleProductType.cataLogueProduct})
    AND products.company_info_id = ${req?.body?.session_res?.client_id}
    AND products.id IN (${product_ids.join(',')})
) 
SELECT 
    
    CASE WHEN pmrn = 1 then 1 ELSE 0  END as is_parent,
 CASE WHEN pmrn = 1 THEN CASE WHEN category IS NOT NULL THEN category ELSE '' END ELSE '' END as category,
	CASE WHEN pmrn = 1 THEN CASE WHEN sub_category IS NOT NULL THEN sub_category ELSE '' END ELSE '' END as sub_category,
	CASE WHEN pmrn = 1 THEN CASE WHEN sub_sub_category IS NOT NULL THEN sub_sub_category ELSE '' END ELSE '' END AS sub_sub_category,
	CASE WHEN pmrn = 1 THEN CASE WHEN name IS NOT NULL THEN name ELSE '' END ELSE '' END AS name,
    CASE WHEN pmrn = 1 THEN CASE WHEN sku IS NOT NULL THEN sku ELSE '' END ELSE '' END AS sku,
 	CASE WHEN pmrn = 1 THEN CASE WHEN parent_sku IS NOT NULL THEN parent_sku ELSE '' END ELSE '' END AS parent_sku,
 	CASE WHEN pmrn = 1 THEN CASE WHEN is_customization IS NOT NULL THEN is_customization::text ELSE ''  END  ELSE ''  END AS is_customization,
 	CASE WHEN pmrn = 1 THEN CASE WHEN collection IS NOT NULL THEN collection ELSE '' END ELSE '' END AS collection,
 	CASE WHEN pmrn = 1 THEN CASE WHEN tag IS NOT NULL THEN tag ELSE '' END ELSE '' END AS tag,
 	CASE WHEN pmrn = 1 THEN CASE WHEN short_description IS NOT NULL THEN short_description ELSE '' END ELSE '' END AS short_description,
 	CASE WHEN pmrn = 1 THEN CASE WHEN long_description IS NOT NULL THEN long_description ELSE '' END ELSE '' END AS long_description,
 	CASE WHEN pmrn = 1 THEN CASE WHEN labour_charge IS NOT NULL THEN labour_charge::text ELSE '' END ELSE '' END AS labour_charge,
 	CASE WHEN pmrn = 1 THEN CASE WHEN finding_charge IS NOT NULL THEN finding_charge::text ELSE '' END ELSE '' END AS finding_charge,
 	CASE WHEN pmrn = 1 THEN CASE WHEN other_charge IS NOT NULL THEN other_charge::text ELSE '' END ELSE '' END AS other_charge,
 	CASE WHEN pmrn = 1 THEN CASE WHEN setting_style_type IS NOT NULL THEN setting_style_type ELSE '' END ELSE '' END AS setting_style_type,
 	CASE WHEN pmrn = 1 THEN CASE WHEN size IS NOT NULL THEN size ELSE '' END ELSE '' END AS size,
 	CASE WHEN pmrn = 1 THEN CASE WHEN length IS NOT NULL THEN length ELSE '' END ELSE '' END AS length,
	CASE WHEN metal IS NOT NULL THEN metal ELSE '' END AS metal,
	CASE WHEN karat IS NOT NULL THEN karat ELSE '' END AS karat,
	CASE WHEN metal_tone IS NOT NULL THEN metal_tone ELSE '' END AS metal_tone,
	CASE WHEN metal_weight IS NOT NULL THEN metal_weight ELSE '' END AS	metal_weight,
	CASE WHEN quantity IS NOT NULL THEN quantity ELSE '' END AS	quantity,
	CASE WHEN d.stone IS NOT NULL THEN d.stone ELSE '' END AS stone,
	CASE WHEN d.shape IS NOT NULL THEN d.shape ELSE '' END AS shape	,
	CASE WHEN mm_size IS NOT NULL THEN mm_size ELSE '' END as mm_size,
	CASE WHEN color IS NOT NULL THEN color ELSE '' END	color,
	CASE WHEN clarity IS NOT NULL THEN clarity ELSE '' END clarity,
	CASE WHEN cut IS NOT NULL THEN cut ELSE '' END cut,
	CASE WHEN stone_type IS NOT NULL THEN stone_type ELSE '' END stone_type,
	CASE WHEN stone_setting IS NOT NULL THEN stone_setting ELSE '' END stone_setting,
	CASE WHEN stone_weight IS NOT NULL THEN stone_weight::text ELSE '' END stone_weight,
	CASE WHEN stone_count IS NOT NULL THEN stone_count::text ELSE '' END stone_count,
	CASE WHEN pmrn = 1 THEN CASE WHEN gender IS NOT NULL THEN gender ELSE '' END ELSE '' END AS gender,
	CASE WHEN pmrn = 1 THEN CASE WHEN additional_detail IS NOT NULL THEN additional_detail ELSE '' END ELSE '' END AS additional_detail,
	CASE WHEN pmrn = 1 THEN CASE WHEN certification IS NOT NULL THEN certification ELSE '' END ELSE '' END AS certification,
	CASE WHEN pmrn = 1 THEN CASE WHEN shipping_days IS NOT NULL THEN shipping_days::text ELSE '' END ELSE '' END AS shipping_days,
    CASE WHEN r.meta_title IS NOT NULL THEN r.meta_title ELSE '' END AS meta_title,
    CASE WHEN r.meta_description IS NOT NULL THEN r.meta_description ELSE '' END AS meta_description,
    CASE WHEN r.meta_tag IS NOT NULL THEN r.meta_tag ELSE '' END AS meta_tag
FROM ranked r
LEFT JOIN diamond_ranked d 
    ON r.product_id = d.product_id 
    AND r.pmrn = d.pdrn  
WHERE r.product_id IN (${product_ids.join(',')}) 
ORDER BY r.product_id, r.pmrn`, { type: QueryTypes.SELECT })
    
    const data = await axios({
        url: req.body.session_res.client_key === 'CADCO' ? ADD_CADCO_PRODUCT_DETAIL_TO_CLIENT_API_URL['prod'] : ADD_CADCO_PRODUCT_DETAIL_TO_CLIENT_API_URL['stag'],
      method: "POST",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true,
      data: {
        company_key: company_key,
        diamond_color: diamond_color,
        diamond_clarity: diamond_clarity,
        product_details: productDetails
        },
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.PUBLIC_AUTHORIZATION_KEY
        },
      })
        .then((response) => {
          return resSuccess({ data: response.data });
        })
      .catch((error) => {
          return resUnknownError({ data: error });
        });

      return data;
    
  } catch (error) {
    throw error
  }
}

// add cadco product details for the new client

export const addCADCOProductDetailsForClient = async (req: Request) => {
  try {
      const { product_details, company_key } = req.body
      const { CompanyInfo } = initModels(req)
      
      const companyInfo = await CompanyInfo.findOne({
          where: {
              key: company_key
          }
      })

      if(!(companyInfo && companyInfo.dataValues)){
          return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Company key"]]) }); 
      }
      
    const product_list = await getProductsFromRows(product_details, companyInfo.dataValues.id, req)
    
    if (product_list && product_list.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return product_list
    }

    const addProduct = await addProductToDB(product_list.data, 1, companyInfo.dataValues.id, req)
      return resSuccess({data: product_list.data})
  } catch (error) {
    throw error
  }
}

const getProductsFromRows = async (rows: any,client_id:number, req: Request) => {
  let currentProductIndex = -1;
  let productList = [];
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
const {Tag, SettingTypeData, SizeData, LengthData, Collection,DiamondCaratSize, CategoryData, MetalMaster, GoldKarat, MetalTone, StoneData, DiamondGroupMaster, DiamondShape, MMSizeData, Colors, ClarityData, CutsData,BrandData, Product, DiamondRanges} = initModels(req);
    let tagList = await Tag.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let settingTypeList = await SettingTypeData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let itemSizeList = await SizeData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let itemLengthList = await LengthData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let collectionList = await Collection.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let categoryList = await CategoryData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let metalMasterList = await MetalMaster.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let karatList = await GoldKarat.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let metaToneList = await MetalTone.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let gemstoneList = await StoneData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let diamondShapeList = await DiamondShape.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let mmSizeList = await MMSizeData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let diamondColorList = await Colors.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let diamondClarityList = await ClarityData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    let diamondCutList = await CutsData.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });

    let diamondSize = await DiamondCaratSize.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    })
    let diamondGroupMasterList = await DiamondGroupMaster.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    })

    let diamondRange = await DiamondRanges.findAll()

      for (const row of rows) {
      //const resSCI = await setCategoryId(productList);
      if (row.is_parent == "1") {
        currentProductIndex++;
        const productsku = await Product.findOne({
          where: { sku: row.sku, is_deleted: DeletedStatus.No,company_info_id:client_id },
        });
        if (productsku != null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: PRODUCT_EXIST_WITH_SAME_SKU,
          });
          continue
        }
       
        const gender: any =
          row.gender && row.gender != ""
            ? await getPipedGenderIdFromFieldValue(
              GENDERLIST,
              row.gender,
              "name"
            )
            : null;

        if (gender != null && gender.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: gender.message,
          });
        }

        const collection: any =
          row.collection && row.collection != ""
            ? await getPipedIdFromFieldValue(
              collectionList,
              row.collection,
              "name",
              "Collection"
            )
            : null;

          if (collection != null && collection.code !== DEFAULT_STATUS_CODE_SUCCESS) {
              if (collection.code == NOT_FOUND_CODE) {
                  const addNotFound: any = await notFoundProductCreated(Tag, collection.data.notFoundList, client_id, req.body.session_res.id_app_user, 'name');
                  const collectionIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...collection.data.findDataList.map((item: any) => item.dataValues.id)];
                  collection.data = collectionIds && collectionIds.length > 0 ? collectionIds.join("|") : null;
                  collectionList = await Collection.findAll({
                      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
                  });
          } else {
            errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: collection.message,
          });
          }
          
        }
        

        let tags: any =
          row.tag && row.tag != ""
            ? await getPipedIdFromFieldValue(tagList, row.tag, "name", "Tag")
            : null;

        if (tags != null && tags.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          if (tags.code == NOT_FOUND_CODE) {
            const addNotFound:any = await notFoundTagCreated(Tag, tags.data.notFoundList, client_id, req.body.session_res.id_app_user,'name');
            const tagIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...tags.data.findDataList.map((item: any) => item.dataValues.id)];
            tags.data = tagIds && tagIds.length > 0 ? tagIds.join("|") : null;
            tagList = await Tag.findAll({
                  where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
              });
          } else {
            errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: tags.message,
          });
          }
          
        }

        const settingStyle: any =
          row.setting_style_type && row.setting_style_type != ""
            ? await getPipedIdFromFieldValue(
              settingTypeList,
              row.setting_style_type,
              "name",
              "setting style type"
            )
            : null;

          if (
              row.setting_style_type &&
              row.setting_style_type != "" &&
              settingStyle.code !== DEFAULT_STATUS_CODE_SUCCESS
          ) {
              if (settingStyle.code == NOT_FOUND_CODE) {
                  const addNotFound: any = await notFoundProductCreated(SizeData, settingStyle.data.notFoundList, client_id, req.body.session_res.id_app_user, 'name', 'sort_code');
                  const itemSizeIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...settingStyle.data.findDataList.map((item: any) => item.dataValues.id)];
                  settingStyle.data = itemSizeIds && itemSizeIds.length > 0 ? itemSizeIds.join("|") : null;
                  settingTypeList = await SettingTypeData.findAll({
                      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
                  });
              } else {
                  errors.push({
                      product_name: row.name,
                      product_sku: row.sku,
                      error_message: settingStyle.message,
                  });
              }
          }
        let size: any =
          row.size && row.size != ""
            ? await getPipedIdFromFieldValue(
              itemSizeList,
              row.size,
              "size",
              "Size"
            )
            : "";

          if (
              row.size &&
              row.size != "" &&
              size.code !== DEFAULT_STATUS_CODE_SUCCESS
          ) {
              if (size.code == NOT_FOUND_CODE) {
                  const addNotFound: any = await notFoundProductCreated(SizeData, size.data.notFoundList, client_id, req.body.session_res.id_app_user, 'size');
                  const itemSizeIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...size.data.findDataList.map((item: any) => item.dataValues.id)];
                  size.data = itemSizeIds && itemSizeIds.length > 0 ? itemSizeIds.join("|") : null;
                  itemSizeList = await SizeData.findAll({
                      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
                  });
              } else {
                  errors.push({
                      product_name: row.name,
                      product_sku: row.sku,
                      error_message: size.message,
                  });
              }
          }

        const length: any =
          row.length && row.length != ""
            ? await getPipedIdFromFieldValue(
              itemLengthList,
              row.length,
              "length",
              "Length"
            )
            : "";

          if (
              row.length &&
              row.length != "" &&
              length.code !== DEFAULT_STATUS_CODE_SUCCESS
          ) {
              if (length.code == NOT_FOUND_CODE) {
                  const addNotFound: any = await notFoundProductCreated(LengthData, length.data.notFoundList, client_id, req.body.session_res.id_app_user, 'length');
                  const itemLengthIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...length.data.findDataList.map((item: any) => item.dataValues.id)];
                  length.data = itemLengthIds && itemLengthIds.length > 0 ? itemLengthIds.join("|") : null;
                  itemLengthList = await LengthData.findAll({
                      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
                  });
              } else {
                  errors.push({
                      product_name: row.name,
                      product_sku: row.sku,
                      error_message: length.message,
                  });
              }
          }

        productList.push({
          sku: row.sku,
          name: row.name,
          additional_detail: row.additional_detail,
          certificate: row.certification,
          sort_description: row.short_description,
          long_description: row.long_description,
          making_charge: row.labour_charge,
          finding_charge: row.finding_charge,
          other_charge: row.other_charge,
          is_parent: row.is_parent,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          meta_tags: row.meta_tags,
          is_customization:
            row.is_customization &&
              row.is_customization != null &&
              row.is_customization != ""
              ? row.is_customization == "TRUE" ||
                row.is_customization == true ||
                row.is_customization == "true"
                ? GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID["true"]
                : GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID["false"]
              : PRODUCT_CUSTOMIZATION_STATUS.no,
          parent_sku: row.parent_sku || null,
          gender: gender && gender != null ? gender.data : null,
          collection: collection && collection != null ? collection.data : null,
          tag: tags && tags != null ? tags.data : null,
          setting_style_type:
            settingStyle && settingStyle != null ? settingStyle.data : null,
          size: size.data,
          length: length.data,
          product_type: 1,
          discount_type: null,
          shipping_days: row.shipping_days,
          discount_value: row.discount_value,
          product_categories: [],
          product_metal_options: [],
          parent_id: null,
          product_diamond_options: [],
          product_tone_file: [],
        });
        addProductDetailsToProductList(row, productList, currentProductIndex, req.body.diamond_color, req.body.diamond_clarity);
      } else if (row.is_parent == "0") {
        addProductDetailsToProductList(row, productList, currentProductIndex, req.body.diamond_color, req.body.diamond_clarity);
      }
    }
    const resSCI = await setCategoryId(productList, categoryList,CategoryData,client_id, req.body.session_res.id_app_user);

    if (resSCI.code !== DEFAULT_STATUS_CODE_SUCCESS) {

      resSCI.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSMO = await setMetalOptions(productList, metalMasterList, karatList, metaToneList, MetalMaster, GoldKarat, MetalTone,client_id, req.body.session_res.id_app_user );
    if (resSMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {

      resSMO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSDGM = await setDiamondOptions(productList,
      settingTypeList, gemstoneList, diamondShapeList,
      diamondColorList, diamondClarityList, diamondCutList,
      mmSizeList, diamondSize, diamondGroupMasterList,
      SettingTypeData, StoneData, DiamondShape, Colors, ClarityData, CutsData, MMSizeData,client_id, req.body.session_res.id_app_user
    );
    if (resSDGM.code !== DEFAULT_STATUS_CODE_SUCCESS) {

      resSDGM.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSDO = await setDiamondGroupMasterOptions(productList,
       diamondGroupMasterList, diamondSize, DiamondGroupMaster, DiamondCaratSize, diamondRange, client_id, req.body.session_res.id_app_user
    );
    if (resSDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {

      resSDO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }
    return resSuccess({ data: productList });
  } catch (e) {
    throw e;
  }
}; 

const getPipedGenderIdFromFieldValue = async (
  list: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  const genders = fieldValue.split("|");
  let findData: any = [];
  let notFound: any = [];
  genders.map((value: any) => {
    const data = list.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );
    if (!data) {
      notFound.push(value);
    } else {
      findData.push(data);
    }
  });

  let idList = [];
  for (const tag of findData) {
    idList.push(tag.id);
  }

  if (notFound.length > 0) {
    return resNotFound({
      message: prepareMessageFromParams(ERROR_NOT_FOUND, [
        ["field_name", `Gender ${notFound.join(",")}`],
      ]),
    });
  } else {
    return resSuccess({ data: idList.join("|") });
  }
};

const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  returnValue: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.toString().split("|");

  let idList = [];
  let findDataList: any = [];
  let notFoundList: any = [];
  valueList.map((value: any) => {
    const data = model.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );
    if (!data) {
      notFoundList.push(value);
    } else {
      findDataList.push(data);
    }
  });

  if (notFoundList.length > 0) {
    return resNotFound({
      message: prepareMessageFromParams(ERROR_NOT_FOUND, [
        ["field_name", `${returnValue} ${notFoundList.join(",")}`],
      ]),
      data: {notFoundList, findDataList}
    });
  }
  for (const tag of findDataList) {
    tag && idList.push(tag.dataValues.id);
  }
  return resSuccess({ data: idList.join("|") });
};

const notFoundTagCreated = async (model: any, fieldValue: any, client_id:number, user_id:any,add_value:any) => {
  const payLoad = fieldValue.map((t: any) => {
    return {
      [add_value]: t,
      company_info_id: client_id,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      created_date: getLocalDate(),
      created_by: user_id
    }
  });
  const addData = await model.bulkCreate(payLoad);

  return resSuccess({ data: addData });
};  

const notFoundProductCreated = async (model: any, fieldValue: any, client_id:number, user_id:any, add_value: any, sort_code?:any) => {
    let payLoad:any
    if (sort_code) {
        payLoad = fieldValue.map((t: any) => {
            return {
                [add_value]: t,
                slug: createSlug(t),
                [sort_code]: t,
                company_info_id: client_id,
                is_deleted: DeletedStatus.No,
                is_active: ActiveStatus.Active,
                created_date: getLocalDate(),
                created_by: user_id
            }
        });
    } else {
        payLoad = fieldValue.map((t: any) => {
            return {
                [add_value]: t,
                slug: createSlug(t),
                company_info_id: client_id,
                is_deleted: DeletedStatus.No,
                is_active: ActiveStatus.Active,
                created_date: getLocalDate(),
                created_by: user_id
            }
        });
    }
     
  const addData = await model.bulkCreate(payLoad);

  return resSuccess({ data: addData });
}; 

const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number,
  diamondColor: any,
  diamondClarity: any
) => {
  if (productList[currentProductIndex]) {
    if (row.category && row.category !== "") {
      productList[currentProductIndex].product_categories.push({
        ...(row.category && { category: row.category }),
        ...(row.sub_category !== "" ? { sub_category: row.sub_category } : {}),
        ...(row.sub_sub_category !== ""
          ? { sub_sub_category: row.sub_sub_category }
          : {}),
      });
    }
    if (row.metal && row.metal !== "") {
      productList[currentProductIndex].product_metal_options.push({
        karat: row.karat,
        metal: row.metal,
        metal_weight: row.metal_weight,
        quantity: row.quantity,
        metal_tone: row.metal_tone,
        retail_price: row.retail_price,
        compare_price: row.compare_price,
      });
    }
    if (row.stone && row.stone && row.shape !== "" && row.shape !== "") {
      const data = {
        shape: row.shape,
        stone: row.stone,
        color: diamondColor || row.color,
        mm_size: row.mm_size,
        clarity: diamondClarity || row.clarity,
        cut: row.cut,
        stone_type: row.stone_type,
        stone_setting: row.stone_setting,
        stone_weight: row.stone_weight,
        is_default_diamond: row.is_default_diamond,
        stone_count: row.stone_count,
        stone_cost: row.stone_cost,
        rate: null,
      };
      productList[currentProductIndex].product_diamond_options.push(data);
    }
    if (row.image_tone && row.image_tone !== "") {
      productList[currentProductIndex].product_tone_file.push({
        tone: row.image_tone,
        feature_image: row.featured_image && row.featured_image.split("|"),
        video_file: row.video_file && row.video_file.split("|"),
        iv_image: row.image_visualization && row.image_visualization.split("|"),
        other_Images: row.other_Images && row.other_Images.split("|"),
      });
    }
  }
};

const setCategoryId = async (productList: any, categoryList: any, model: any, client_id: number, user_id: number) => {
    let categoryNameList: number[] = [];
    let productCategory;
    let errors: {
        product_name: string;
        product_sku: string;
        error_message: string;
    }[] = [];

    for (let product of productList) {
        for (productCategory of product.product_categories) {
            categoryNameList.push(productCategory.category);
            if (productCategory.sub_category) {
                categoryNameList.push(productCategory.sub_category);
                if (productCategory.sub_sub_category) {
                    categoryNameList.push(productCategory.sub_sub_category);
                }
            }
        }
    }

    let length = productList.length;
    let categoriesLength = 0;
    let i, k;
    for (i = 0; i < length; i++) {
        categoriesLength = productList[i].product_categories.length;

        if (categoriesLength <= 0) {
            errors.push({
                product_name: productList[i].name,
                product_sku: productList[i].name,
                error_message: CATEGORY_IS_REQUIRES,
            });
        }

        for (k = 0; k < categoriesLength; k++) {
            // Add Category Check
            const categoryName = createSlug(productList[i].product_categories[k].category);
            productList[i].product_categories[k].category =
                await getIdFromCategoryName(
                    model,
                    productList[i].product_categories[k].category,
                    categoryList,
                    "category_name",
                    null,
                    categoryName,
                    client_id,
                    user_id
            );
            if (productList[i].product_categories[k].category == undefined) {
                errors.push({
                    product_name: productList[i].name,
                    product_sku: productList[i].name,
                    error_message: CATEGORY_NOT_FOUND,
                });
            }

            let subCategory = categoryName
            if (productList[i].product_categories[k].sub_category) {
                subCategory = createSlug(categoryName + " " + productList[i].product_categories[k].sub_category);
                productList[i].product_categories[k].sub_category =
                    await getIdFromCategoryName(
                        model,
                        productList[i].product_categories[k].sub_category,
                        categoryList,
                        "category_name",
                        productList[i].product_categories[k].category,
                        subCategory,
                        client_id,
                        user_id
                    );

                if (productList[i].product_categories[k].sub_category == undefined) {
                    errors.push({
                        product_name: productList[i].name,
                        product_sku: productList[i].name,
                        error_message: SUB_CATEGORY_NOT_FOUND,
                    });
                }

                let subSubCategory = subCategory
                if (productList[i].product_categories[k].sub_sub_category) {
                    subSubCategory = createSlug(subCategory + " " + productList[i].product_categories[k].sub_sub_category);
                    productList[i].product_categories[k].sub_sub_category =
                        await getIdFromCategoryName(
                            model,
                            productList[i].product_categories[k].sub_sub_category,
                            categoryList,
                            "category_name",
                            productList[i].product_categories[k].sub_category,
                            subSubCategory,
                            client_id,
                            user_id
                        );
              }
                if (
                    productList[i].product_categories[k].sub_sub_category === undefined
                ) {
                    errors.push({
                        product_name: productList[i].name,
                        product_sku: productList[i].name,
                        error_message: SUB_SUB_CATEGORY_NOT_FOUND,
                    });
                }
            }
      }
      
      categoryList = await model.findAll({
                where: {
                  company_info_id: client_id,
                  is_deleted: DeletedStatus.No,
                  is_active: ActiveStatus.Active,
                }
              })
    }

    if (errors.length > 0) {
        return resUnprocessableEntity({ data: errors });
    }
    return resSuccess();
};

const getIdFromCategoryName = async (
    model: any,
    name: string,
    list: any,
    fieldName: string,
    id_parent: any,
    slug: any,
    client_id: any,
    app_user_id: any =  1
) => {
    if (name == null || name == "") {
        return "";
    }
    let findItem = list.find(
        (item: any) =>
            item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
            name.toString().trim().toLocaleLowerCase() &&
            item.dataValues.parent_id == id_parent
    );

    if (findItem) {
        return findItem.dataValues.id;
    } else {
        const category = await model.create({
            category_name: name,
            parent_id: id_parent,
            slug: slug,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            company_info_id: client_id,
            is_searchable: "1",
            created_by: app_user_id || 1
      });
    return category.dataValues.id;

    }
};

const setMetalOptions = async (productList: any, metalList: any, karatList: any, metalToneList: any, MetalMaster: any, GoldKarat, MetalTone: any,client_id: any, user_id: any) => {
  let configMetalNameList = [],
    configKaratNameList = [],
    pmo,
    length = productList.length,
    i,
    k,
    pmoLength = 0;

  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];

  for (let product of productList) {
    for (pmo of product.product_metal_options) {
      pmo.metal &&
        configMetalNameList.push(pmo.metal.toString().toLocaleLowerCase());
      pmo.karat && configKaratNameList.push(pmo.karat);
    }
  }

  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_metal_options.length;
    //Metal should be selected

    for (k = 0; k < pmoLength; k++) {


      const metal: any = await getIdFromName(
        productList[i].product_metal_options[k].metal,
        metalList,
        "name",
        'Metal'
      )
      if (metal && metal.code != DEFAULT_STATUS_CODE_SUCCESS) {
        if (metal && metal.code == NOT_FOUND_CODE) {
          productList[i].product_metal_options[k].metal = await addNotFountData(MetalMaster, 'name','sort_code', metal.data, null, client_id, user_id)
          metalList = await MetalMaster.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: metal.message,
          });
        }

      } else {
        productList[i].product_metal_options[k].metal = metal.data;
      }


      const karat: any = await getIdFromName(
        productList[i].product_metal_options[k].karat,
        karatList,
        "name",
        "Karat"
      );

      if (karat && karat.code != DEFAULT_STATUS_CODE_SUCCESS) {
         if (karat && karat.code == NOT_FOUND_CODE) {
          productList[i].product_metal_options[k].karat = await addNotFountData(GoldKarat, 'name', karat.data, null,karat.data, client_id, user_id)
          karatList = await GoldKarat.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: karat.message,
          });
        }
      } else {
        productList[i].product_metal_options[k].karat = karat.data;
      }

      const metalTone = productList[i].product_metal_options[k].metal_tone;

      const strMetalTone: any = await getPipedIdFromFieldValue(
        metalToneList,
        metalTone,
        "sort_code",
        "Metal Tone"
      );

      if (strMetalTone != null && strMetalTone.code !== DEFAULT_STATUS_CODE_SUCCESS) {
              if (strMetalTone.code == NOT_FOUND_CODE) {
                  const addNotFound: any = await notFoundProductCreated(MetalTone, strMetalTone.data.notFoundList, client_id, user_id, 'name');
                  const collectionIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...strMetalTone.data.findDataList.map((item: any) => item.dataValues.id)];
                  strMetalTone.data = collectionIds && collectionIds.length > 0 ? collectionIds.join("|") : null;
                  metalToneList = await MetalTone.findAll({
                      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
                  });
          } else {
            errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: strMetalTone.message,
          });
          }
          
        }

      productList[i].product_metal_options[k].metal_tone =
        metalTone && metalTone != null && metalTone != ""
          ? strMetalTone.data
          : "";
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const getIdFromName = (name: string, list: any, fieldName: string, returnValue: any) => {
  if (name == null || name == "") {
    return "";
  }

  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );

  if (findItem) {
    return resSuccess({ data: findItem.dataValues.id });
  } else {
    return resNotFound({
      message: prepareMessageFromParams(ERROR_NOT_FOUND, [
        ["field_name", `${returnValue}`],
      ]),
      data: name
    })
  }

};

export const addNotFountData = async (model: any, fieldValue:any,name:any, sort_code:any, sort_code_value:any, client_id:number, user_id:any ) => {

  if (sort_code && sort_code != null) {
    const data = await model.create({
      [fieldValue]: name,
      slug: createSlug(name),
      [sort_code]: sort_code_value,
      company_info_id: client_id,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      created_date: getLocalDate(),
      created_by: user_id || 1
    })
    return data.dataValues.id
  } else {
    const data = await model.create({
      [fieldValue]: name,
      slug: createSlug(name),
      company_info_id: client_id,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      created_date: getLocalDate(),
      created_by: user_id || 1
    })

    return data.dataValues.id
  }
}

const setDiamondOptions = async (productList: any, stoneSettigList: any, gemstoneList: any,
  diamondShapeList: any, diamondColorList: any, diamondClarityList: any,
  diamondCutList: any, mmSizeList: any, diamondSizeList: any, diamondGroupMasterList: any,
  SettingTypeData: any, StoneData: any, DiamondShape: any, ColorData: any, ClarityData: any,
  CutsData:any, MMSizeData:any, client_id:any, user_id:any) => {
  let configGroupNameList = [],
    configStoneSettingList = [],
    pmo,
    length = productList.length,
    i: any,
    k,
    pmoLength = 0;
  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];
  let stoneTypeList: any[] = [];

  for (let product of productList) {
    for (pmo of product.product_diamond_options) {
      pmo.diamond_group &&
        configGroupNameList.push(
          pmo.diamond_group.toString().toLocaleLowerCase()
        );
      pmo.stone_setting &&
        configStoneSettingList.push(
          pmo.stone_setting.toString().toLocaleLowerCase()
        );
    }
  }

  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_diamond_options.length;
    for (k = 0; k < pmoLength; k++) {
      if (productList[i].product_diamond_options[k].stone_type) {
              productList[i].product_diamond_options[k].stone_type =
                GET_DIAMOND_PLACE_ID_FROM_LABEL[
                productList[i].product_diamond_options[k].stone_type
                  .toString()
                  .toLocaleLowerCase()
                ];
            }
      if (productList[i].product_diamond_options[k].stone_setting != null) {
        const stoneSetting: any = await getIdFromName(
          productList[i].product_diamond_options[k].stone_setting,
          stoneSettigList,
          "name",
          "Stone Setting"
        )

        if (stoneSetting.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: stoneSetting.message,
          });
        } else {
          productList[i].product_diamond_options[k].stone_setting = stoneSetting.data;

        }
      }

      //Stone type should not be null

      // stone type center should be one

      stoneTypeList.push({
        stone_type: productList[i].product_diamond_options[k].stone_type,
        stone_count: productList[i].product_diamond_options[k].stone_count,
      });

     
      const mmSize: any = await getIdFromName(
        productList[i].product_diamond_options[k].mm_size,
        mmSizeList,
        "value",
        "MM Size"
      )

      if (productList[i].product_diamond_options[k].mm_size && productList[i].product_diamond_options[k].mm_size != '' && mmSize !== null && mmSize.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        if (mmSize && mmSize.code == NOT_FOUND_CODE) {
          
          productList[i].product_diamond_options[k].mm_size = await addNotFountData(MMSizeData, 'name', mmSize.data, null, mmSize.data, client_id, user_id)
          mmSizeList = await MMSizeData.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: mmSize.message,
          });
        }
      } else {

        productList[i].product_diamond_options[k].mm_size = mmSize.data;
      }

      const stone: any = await getIdFromName(
        productList[i].product_diamond_options[k].stone,
        gemstoneList,
        "name",
        "Stone"
      )

      if (stone.code !== DEFAULT_STATUS_CODE_SUCCESS) {
       if (stone && stone.code == NOT_FOUND_CODE) {
          productList[i].product_diamond_options[k].stone = await addNotFountData(StoneData, 'name', stone.data,'sort_code', stone.data.toUpperCase().slice(0, 3), client_id, user_id)
          gemstoneList = await StoneData.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: stone.message,
          });
        }
      } else {
        productList[i].product_diamond_options[k].stone = stone.data;
      }

      const diamondShape: any = await getIdFromName(
        productList[i].product_diamond_options[k].shape,
        diamondShapeList,
        "name",
        "Diamond Shape"
      )

      if (diamondShape.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        if (diamondShape && diamondShape.code == NOT_FOUND_CODE) {
          productList[i].product_diamond_options[k].shape = await addNotFountData(DiamondShape, 'name', diamondShape.data, 'sort_code', diamondShape.data.toUpperCase().slice(0, 3), client_id, user_id)
          diamondShapeList = await DiamondShape.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: diamondShape.message,
          });
        }
      } else {
        productList[i].product_diamond_options[k].shape = diamondShape.data;
      }

      const diamondColor: any = await getIdFromName(
        productList[i].product_diamond_options[k].color,
        diamondColorList,
        "value",
        "Diamond Color"
      )

      if (diamondColor.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        if (diamondColor && diamondColor.code == NOT_FOUND_CODE) {
          productList[i].product_diamond_options[k].color = await addNotFountData(ColorData, 'name', diamondColor.data,'value', diamondColor.data, client_id, user_id)
          diamondColorList = await ColorData.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: diamondColor.message,
          });
        }
      } else {
        productList[i].product_diamond_options[k].color = diamondColor.data;
      }

      const diamondClarity: any = await getIdFromName(
        productList[i].product_diamond_options[k].clarity,
        diamondClarityList,
        "value",
        "Diamond Clarity"
      )

      if (diamondClarity.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        if (diamondClarity && diamondClarity.code == NOT_FOUND_CODE) {
          productList[i].product_diamond_options[k].clarity = await addNotFountData(ClarityData, 'name', diamondClarity.data,'value', diamondClarity.data, client_id, user_id)
          diamondClarityList = await ClarityData.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: diamondClarity.message,
          });
        }
      } else {
        productList[i].product_diamond_options[k].clarity = diamondClarity.data;
      }

      const diamondCut: any = productList[i].product_diamond_options[k].cut && productList[i].product_diamond_options[k].cut !== null ? await getIdFromName(
        productList[i].product_diamond_options[k].cut,
        diamondCutList,
        "value",
        "Diamond Cut"
      ) : null

      if (diamondCut &&diamondCut !== null && diamondCut.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        if (diamondCut && diamondCut.code == NOT_FOUND_CODE) {
          productList[i].product_diamond_options[k].cut = await addNotFountData(CutsData, 'name', diamondCut.data,null, diamondCut.data, client_id, user_id)
          diamondCutList = await CutsData.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: diamondCut.message,
          });
        }
      } else {
        productList[i].product_diamond_options[k].cut =  diamondCut && diamondCut.data ? diamondCut.data : null;
      }

    }

     }

  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const setDiamondGroupMasterOptions = async (productList:any,
       diamondGroupMasterList:any, diamondSize:any, DiamondGroupMaster:any, DiamondCaratSize:any, diamondRange:any, client_id:any, user_id:any) => {
  let 
    length = productList.length,
    i: any,
    k,
    pmoLength = 0;
  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];

  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_diamond_options.length;
    for (k = 0; k < pmoLength; k++) {

      const diamondGroupMaster = diamondGroupMasterList.find((item) => {
        return (
          // Check the `min_carat_range` and `max_carat_range` conditions
          item.dataValues.min_carat_range <=
          productList[i].product_diamond_options[k].stone_weight &&
          item.dataValues.max_carat_range >=
          productList[i].product_diamond_options[k].stone_weight &&
          // Check each of the other conditions with a fallback to null
          item.dataValues.id_stone ===
          (productList[i].product_diamond_options[k].stone || null) &&
          item.dataValues.id_shape ===
          (productList[i].product_diamond_options[k].shape || null) &&
          item.dataValues.id_color ===
          (productList[i].product_diamond_options[k].color || null) &&
          item.dataValues.id_clarity ===
          (productList[i].product_diamond_options[k].clarity || null) &&
          item.dataValues.id_cuts ===
          (productList[i].product_diamond_options[k].cut || null)
        );
      });
      if (diamondGroupMaster == null) {
        const findRange  = diamondRange.find((item) => {
          return (
            // Check the `min_carat_range` and `max_carat_range` conditions
            Number(item.dataValues.min_carat_range) <=
            productList[i].product_diamond_options[k].stone_weight &&
            Number(item.dataValues.max_carat_range) >=
            productList[i].product_diamond_options[k].stone_weight
          );
        })
         const diamondCaratSize: any = findRange && findRange.dataValues && findRange.dataValues.carat_value !== null ? await getIdFromName(
        findRange.dataValues.carat_value,
        diamondSize,
        "value",
        "Diamond Carat Size"
      ) : null

      let caratSizeValue:any = null
      if (diamondCaratSize &&diamondCaratSize !== null && diamondCaratSize.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        if (diamondCaratSize && diamondCaratSize.code == NOT_FOUND_CODE) {
          caratSizeValue = await addNotFountData(DiamondCaratSize, 'value', diamondCaratSize.data,'sort_code', Math.round(parseFloat(diamondCaratSize.data) * 100), client_id, user_id)
          diamondSize = await DiamondCaratSize.findAll({
            where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
          });
        } else {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: diamondCaratSize.message,
          });
        }
      } else {
        caratSizeValue =  diamondCaratSize && diamondCaratSize.data ? diamondCaratSize.data : null;
        }
        const data = await DiamondGroupMaster.create({
          id_stone: productList[i].product_diamond_options[k].stone,
          min_carat_range: findRange.dataValues.min_carat_range,
          max_carat_range: findRange.dataValues.max_carat_range,
          id_shape: productList[i].product_diamond_options[k].shape,
          id_color: productList[i].product_diamond_options[k].color,
          id_clarity: productList[i].product_diamond_options[k].clarity,
          id_cuts: productList[i].product_diamond_options[k].cut,
          id_carat: caratSizeValue,
          rate: 0,
          company_info_id: client_id,
          is_deleted: DeletedStatus.No,
          is_active: ActiveStatus.Active,
          created_by: user_id,
          created_date: getLocalDate()
        })
        productList[i].product_diamond_options[k].id_diamond_group =
          data?.dataValues.id;
        productList[i].product_diamond_options[k].rate =
          data?.dataValues.rate;
        diamondGroupMasterList = await DiamondGroupMaster.findAll({
          where: { is_deleted: DeletedStatus.No,is_active: ActiveStatus.Active, company_info_id: client_id },
        })
      } else {
        productList[i].product_diamond_options[k].id_diamond_group =
          diamondGroupMaster?.dataValues.id;
        productList[i].product_diamond_options[k].rate =
          diamondGroupMaster?.dataValues.rate;

        if (productList[i].product_diamond_options[k].stone_weight == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Diamond Weight"],
            ]),
          });
        }
      }
    }
  }

  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};


const addProductToDB = async (productList: any, idAppUser: number, client_id: number, req: Request) => {
  const {Product, ProductCategory, ProductDiamondOption, ProductMetalOption,ProductImage} = initModels(req);
  const trn = await (req.body.db_connection).transaction();
  let resProduct,
    productCategory,
    pmo,
    pdo,
    productFile,
    path,
    pcPayload: any = [],
    pmoPayload: any = [],
    pdoPayload: any = [],
    imgPayload: any = [];

  try {
    const activityLogs = []
    for (const product of productList) {
      let productDetails: any = { category: [],metals: [], diamonds:[] }
      let slug = product.name
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll(/['/|]/g, "-");

      const sameSlugCount = await Product.count({
        where: [
          columnValueLowerCase("name", product.name),
          { is_deleted: DeletedStatus.No },
          {company_info_id:client_id},
        ],
        transaction: trn,
      });

      if (sameSlugCount > 0) {
        slug = `${slug}-${sameSlugCount}`;
      }
      resProduct = await Product.create(
        {
          name: product.name,
          sku: product.sku,
          slug: slug,
          gender: product.gender,
          additional_detail: `<p>${product.additional_detail ? product.additional_detail : ""
            }</p>`,
          certificate: product.certificate,
          sort_description: product.sort_description,
          long_description: product.long_description,
          tag: product.tag,
          parent_id: product.parent_id,
          is_customization: product.is_customization,
          id_collection: product.collection,
          setting_style_type: product.setting_style_type,
          size: product.size,
          length: product.length,
          shipping_day: product.shipping_days || 0,
          product_type: product.product_type,
          discount_type: product.discount_type,
          discount_value: product.discount_value,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          meta_tag: product.meta_tag,
          is_quantity_track: false,
          making_charge: product.making_charge ? product.making_charge : 0,
          finding_charge: product.finding_charge ? product.finding_charge : 0,
          other_charge: product.other_charge ? product.other_charge : 0,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_featured: "0",
          is_trending: "0",
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:client_id,
        },
        { transaction: trn }
      );

      productDetails = {...productDetails, products: resProduct.dataValues }
      if (product.parent_sku === null) {
        // Find all products whose parent_sku matches the current product's sku
        productList.forEach((p: any) => {
          if (p.parent_sku === resProduct.dataValues.sku) {
            p.parent_id = resProduct.dataValues.id; // Replace parent_sku with the parent's id
          }
        });
      }
      for (productCategory of product.product_categories) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_category: productCategory.category,
          id_sub_category: productCategory?.sub_category ? productCategory.sub_category : null,
          id_sub_sub_category: productCategory?.sub_sub_category ? productCategory?.sub_sub_category : null,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:client_id,
        }
        pcPayload.push(data);
        productDetails = { ...productDetails, category: [...productDetails.category, { ...data }] }
      }

      for (pmo of product.product_metal_options) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_karat: pmo.karat == "" ? null : pmo.karat,
          id_metal_tone: pmo.metal_tone == "" ? null : pmo.metal_tone,
          metal_weight: pmo.metal_weight,
          id_metal: pmo.metal,
          quantity: pmo.quantity || null,
          remaing_quantity_count: pmo.quantity || null,
          retail_price: pmo.retail_price || null,
          compare_price: pmo.compare_price || null,
          is_default: "0",
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:client_id,
        }
        pmoPayload.push(data);
        productDetails = { ...productDetails, metals: [...productDetails.metals, { ...data }] }

      }

      for (pdo of product.product_diamond_options) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_type: pdo.stone_type && pdo.stone_type != "" ? pdo.stone_type  : null,
          id_setting: pdo.stone_setting == "" ? null : pdo.stone_setting,
          weight: pdo.stone_weight,
          count: pdo.stone_count,
          id_diamond_group: pdo.id_diamond_group,
          is_default: "1",
          id_mm_size: pdo.mm_size || pmo.mm_size != 0 ? pdo.mm_size : null,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          id_shape: pdo.shape,
          id_color: pdo.color,
          id_clarity: pdo.clarity,
          id_cut: pdo.cut,
          id_stone: pdo.stone,
          company_info_id:client_id,
        }
        pdoPayload.push(data);
        productDetails = { ...productDetails, diamonds: [...productDetails.diamonds, { ...data }] }
      }

      activityLogs.push(productDetails)
    }

    await ProductCategory.bulkCreate(pcPayload, { transaction: trn });
    await ProductMetalOption.bulkCreate(pmoPayload, { transaction: trn });
    await ProductDiamondOption.bulkCreate(pdoPayload, { transaction: trn });
    await addActivityLogs(req,client_id,[{ old_data: null, new_data: activityLogs }], null, LogsActivityType.Add, LogsType.Product, idAppUser,trn)
    await trn.commit();
    // await refreshMaterializedProductListView(req.body.db_connection);
    return resSuccess();
  } catch (e) {
    console.log(e);
    await trn.rollback();
    throw e;
  }
};