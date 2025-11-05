import { Request } from "express";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  SingleProductType,
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

export const addSparkleSection = async (req: Request) => {
  try {
    const { link, id_product, sort_order } = req.body;
    const {TemplateSixData} = initModels(req);
    const TemapletSixSparking = await TemplateSixData.create({
      link,
      id_product,
      sort_order,
      section_type: TemplateSixSectionType.SparkleSection,
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      created_date: getLocalDate(),
    });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          template_six_sparkling_id: TemapletSixSparking?.dataValues?.id, data: {
            ...TemapletSixSparking?.dataValues
          }
        }
      }], TemapletSixSparking?.dataValues?.id, LogsActivityType.Add, LogsType.templateSixSparkling, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const updateSparkleSection = async (req: Request) => {
  try {
    const {TemplateSixData,Image} = initModels(req);
    const { link, id_product, sort_order } = req.body;
    const findData = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findData && findData.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSixData.update(
      {
        link,
        id_product,
        sort_order,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findData.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    const AfterUpdatefindData = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_sparkling_id: findData?.dataValues?.id, data: {...findData?.dataValues}
      },
      new_data: {
        template_six_sparkling_id: AfterUpdatefindData?.dataValues?.id, data: { ...AfterUpdatefindData?.dataValues }      }
    }], findData?.dataValues?.id, LogsActivityType.Edit, LogsType.templateSixSparkling, req?.body?.session_res?.id_app_user)
    
    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const deleteSparkleSection = async (req: Request) => {
  try {
    const {TemplateSixData} = initModels(req);
    const findSparkle = await TemplateSixData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findSparkle && findSparkle.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSixData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findSparkle.dataValues.id ,company_info_id :req?.body?.session_res?.client_id} }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_sparkling_id: findSparkle?.dataValues?.id, data: {...findSparkle?.dataValues} },
      new_data: {
        template_six_sparkling_id: findSparkle?.dataValues?.id, data: {
          ...findSparkle?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findSparkle?.dataValues?.id, LogsActivityType.Delete, LogsType.templateSixSparkling, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getSparkleSection = async (req: Request) => {
  try {
    const {TemplateSixData,Product} = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";
    const include = [{ model: Product, as: "product", attributes: [] }];
    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateSixSectionType.SparkleSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              Sequelize.where(
                Sequelize.literal('"product"."name"'),
                "ILIKE",
                `%${pagination.search_text}%`
              ),
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateSixData.count({
        where,
        include,
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
        "link",
        "id_product",
        "sort_order",
        "is_active",
        [Sequelize.literal("product.name"), "product_name"],
      ],
      include,
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForSparkleSection = async (req: Request) => {
  try {
    const {TemplateSixData} = initModels(req);
    const findSparkle = await TemplateSixData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSixSectionType.SparkleSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(findSparkle && findSparkle.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSixData.update(
      {
        is_active: statusUpdateValue(findSparkle),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findSparkle.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { template_six_sparkling_id: findSparkle?.dataValues?.id, data: {...findSparkle?.dataValues} },
      new_data: {
        template_six_sparkling_id: findSparkle?.dataValues?.id, data: {
          ...findSparkle?.dataValues, is_active: statusUpdateValue(findSparkle),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findSparkle?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.templateSixSparkling, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
export const productSKUList = async (req: Request) => {
  try {
    
    const {Product, ProductCategory, CategoryData } = initModels(req);
    const products = await Product.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, product_type: [SingleProductType.DynemicPrice, SingleProductType.cataLogueProduct] ,company_info_id: req?.body?.session_res?.client_id, parent_id: null },
      attributes: ["id", "sku"],
      include: [{
        required: false,
        model:ProductCategory,
        as:'product_categories',
        attributes:[ 
          "id_product",
          "id_category",
          "id_sub_category",
          "id_sub_sub_category"
        ],
        include: [{
          required: false,
          model:CategoryData,
          as:'category',
          attributes:['id','parent_id','slug','category_name']
        }, {
          required: false,
          model:CategoryData,
          as:'sub_category',
          attributes:['id','parent_id','slug','category_name']

        },{
          model:CategoryData,
          as:'sub_sub_category',
          attributes:['id','parent_id','slug','category_name']
        }]
      }],

    });

    const transformedProducts = products.map(product => {
      const productData = product.toJSON();

      const categoryInfo = productData.product_categories?.[0];

      return {
        id: productData.id,
        sku: productData.sku,
        category: categoryInfo?.category || null,
        sub_category: categoryInfo?.sub_category || null,
        sub_sub_category: categoryInfo?.sub_sub_category || null,
      };
    });
    return resSuccess({ data: transformedProducts });
  } catch (error) {
    console.log("------------------------" , error);
    throw error;
  }
};
