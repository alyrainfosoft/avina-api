import { Request } from "express";
import {
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
  TemplateSevenSectionType,
} from "../../../utils/app-enumeration";
import {
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../../model/index.model";

export const addBlogSection = async (req: Request) => {
    const { TemplateSevenData } = initModels(req);
    let trn:any ;
    try {
    const {
      title,
      sub_title,
      id_products,
      sort_order = null,
    } = req.body;

    
        trn =  await (req.body.db_connection).transaction();
      const TemplateSevenBlog = await TemplateSevenData.create(
        {
          section_type: TemplateSevenSectionType.NewAndBlogSection,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != "" &&
            sort_order != null &&
            sort_order != undefined
              ? sort_order
              : 0,
              title:title,
              sub_title:sub_title,
          id_products:id_products && id_products.length > 0 ? id_products.join("|") : null,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          banner_id: TemplateSevenBlog?.dataValues?.id, data: {
            ...TemplateSevenBlog?.dataValues
          }
        }
      }], TemplateSevenBlog?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSevenNewAndBlogSection, req?.body?.session_res?.id_app_user,trn)

      await trn.commit();
      return resSuccess();
    } catch (e) {
        if(trn){
                    await trn.rollback();
                }
      throw e;
    }

};

export const updateBlogSection = async (req: Request) => {
    const { TemplateSevenData } = initModels(req);
    let trn:any;
  try {
    const {
      title,
      sub_title,
      id_products,
      sort_order = null,
 
    } = req.body;

    const findDiamondShapeSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findDiamondShapeSection && findDiamondShapeSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
  
    trn = await (req.body.db_connection).transaction();
    
        await TemplateSevenData.update(
          {
            section_type:  TemplateSevenSectionType.NewAndBlogSection,
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            title:title,
            sub_title:sub_title,
            id_products:id_products && id_products.length > 0 ? id_products.join("|") : null,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: findDiamondShapeSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
        const AfterUpdateFindDiamondShapeSection = await TemplateSevenData.findOne({
          where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
        });
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { temaplate_seven_new_blog_id: findDiamondShapeSection?.dataValues?.id, data: {...findDiamondShapeSection?.dataValues}},
          new_data: {
            temaplate_seven_new_blog_id: AfterUpdateFindDiamondShapeSection?.dataValues?.id, data: { ...AfterUpdateFindDiamondShapeSection?.dataValues }
          }
        }], findDiamondShapeSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSevenNewAndBlogSection, req?.body?.session_res?.id_app_user,trn)
        
     
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
        if(trn){
            await trn.rollback();
        }
      throw e;
    }
};

export const deleteBlogSection = async (req: Request) => {
  try {
    const { TemplateSevenData } = initModels(req);
    const BlogSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(BlogSection && BlogSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: BlogSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_new_blog_id: BlogSection?.dataValues?.id, data: {...BlogSection?.dataValues} },
      new_data: {
        temaplate_seven_new_blog_id: BlogSection?.dataValues?.id, data: {
          ...BlogSection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], BlogSection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSevenNewAndBlogSection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getBlogSection = async (req: Request) => {
  try {
    const { TemplateSevenData } = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type:  TemplateSevenSectionType.NewAndBlogSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                sub_title: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
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
      order: [[pagination.sort_by, pagination.order_by],['sort_order',"ASC"]],
      attributes: [
        "id",
        "is_active",
        "sort_order",
        // Using Sequelize.literal to process the id_products field if it's stored as a concatenated string
        [
            Sequelize.literal(`
                CASE
                WHEN "template_seven"."id_products" IS NULL THEN '{}'::json
                ELSE (
                    SELECT json_agg(json_build_object('id', id, 'name', name))
                    FROM blogs
                    WHERE id IN (
                    SELECT UNNEST(string_to_array("template_seven"."id_products", '|')::int[])
                    )
                )
                END
            `),
            'blogs',
            ],
          
      ]
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForBlogSection = async (req: Request) => {
  try {
    const { TemplateSevenData } = initModels(req);
    const BlogSection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]:  TemplateSevenSectionType.NewAndBlogSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(BlogSection && BlogSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(BlogSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: BlogSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_new_blog_id: BlogSection?.dataValues?.id, data: {...BlogSection?.dataValues} },
      new_data: {
        temaplate_seven_new_blog_id: BlogSection?.dataValues?.id, data: {
          ...BlogSection?.dataValues, is_active: statusUpdateValue(BlogSection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], BlogSection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSevenNewAndBlogSection, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
