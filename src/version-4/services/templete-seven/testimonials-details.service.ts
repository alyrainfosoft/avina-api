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
import { Op } from "sequelize";
import { initModels } from "../../model/index.model";

export const addTestimonialDetailSection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const {
      title,
      sub_title,
      description,
      sub_description,
      sort_order = null,
    } = req.body;
    const trn = await (req.body.db_connection).transaction();
    try {
      const TemplateSevenTestimonialDetail = await TemplateSevenData.create(
        {
          section_type: TemplateSevenSectionType.TestimonialDetailSection,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          sort_order:
            sort_order &&
            sort_order != "" &&
            sort_order != null &&
            sort_order != undefined
              ? sort_order
              : 0,
          title: title,
          sub_title: sub_title,
          description:description,
          sub_description:sub_description,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          temaplate_seven_testimonials_detail_id: TemplateSevenTestimonialDetail?.dataValues?.id, data: {
            ...TemplateSevenTestimonialDetail?.dataValues
          },

        }
      }], TemplateSevenTestimonialDetail?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSevenTestimonialDetailSection, req?.body?.session_res?.id_app_user,trn)
                  
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

export const updateTestimonialDetailSection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const {
      title,
      sub_title,
      description,
      sub_description,
      sort_order = null,
    } = req.body;

    const stunningDesingSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(stunningDesingSection && stunningDesingSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    const trn = await (req.body.db_connection).transaction();
    try {
     
      {
        await TemplateSevenData.update(
          {
            section_type: TemplateSevenSectionType.TestimonialDetailSection,
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            title: title,
            sub_title: sub_title,
            description:description,
            sub_description:sub_description,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: stunningDesingSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
      }

      const AfterUpdatestunningDesingSection = await TemplateSevenData.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_testimonials_detail_id: stunningDesingSection?.dataValues?.id, data: {...stunningDesingSection?.dataValues}},
        new_data: {
          temaplate_seven_testimonials_detail_id: AfterUpdatestunningDesingSection?.dataValues?.id, data: { ...AfterUpdatestunningDesingSection?.dataValues }
        }
      }], stunningDesingSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSevenTestimonialDetailSection, req?.body?.session_res?.id_app_user,trn)
      
     
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

export const deleteTestimonialDetailSection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const TestimonialDetailSectionSection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(TestimonialDetailSectionSection && TestimonialDetailSectionSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: TestimonialDetailSectionSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_testimonials_detail_id: TestimonialDetailSectionSection?.dataValues?.id, data: {...TestimonialDetailSectionSection?.dataValues}},
      new_data: {
        temaplate_seven_testimonials_detail_id: TestimonialDetailSectionSection?.dataValues?.id, data: {
          ...TestimonialDetailSectionSection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], TestimonialDetailSectionSection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSevenTestimonialDetailSection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getTestimonialDetailSection = async (req: Request) => {
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
      { section_type: TemplateSevenSectionType.TestimonialDetailSection },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                sub_title: { [Op.iLike]: "%" + pagination.search_text + "%" },
              },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              }
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
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "description",
        "sub_description",
        "is_active",
      ]
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForTestimonialDetailSection= async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const TestimonialDetailSectionSection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSevenSectionType.TestimonialDetailSection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id
      },
    });

    if (!(TestimonialDetailSectionSection && TestimonialDetailSectionSection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(TestimonialDetailSectionSection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: TestimonialDetailSectionSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_testimonials_detail_id: TestimonialDetailSectionSection?.dataValues?.id, data: {...TestimonialDetailSectionSection?.dataValues} },
      new_data: {
        temaplate_seven_testimonials_detail_id: TestimonialDetailSectionSection?.dataValues?.id, data: {
          ...TestimonialDetailSectionSection?.dataValues, is_active: statusUpdateValue(TestimonialDetailSectionSection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], TestimonialDetailSectionSection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSevenTestimonialDetailSection, req?.body?.session_res?.id_app_user)
     

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
