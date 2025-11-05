import { Request } from "express";
import { initModels } from "../../model/index.model";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType, TemplateFour } from "../../../utils/app-enumeration";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess, statusUpdateValue } from "../../../utils/shared-functions";
import { NOT_FOUND_MESSAGE, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { Op } from "sequelize";

export const addAndUpdatePerfectJewelrySection = async (req: Request) => {
  try {
    const {
      title,
      description,
      sort_order = null,
      title_color=null,
      description_color=null
    } = req.body;
    const { TemplateFourData } = initModels(req);
    const stunningDesingSection = await TemplateFourData.findOne({
      where: { section_type: TemplateFour.PerfectJewelry,
      is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    const trn = await (req.body.db_connection).transaction();
    try {
      if(stunningDesingSection){
        await TemplateFourData.update(
          {
            section_type: TemplateFour.PerfectJewelry,
            is_deleted: DeletedStatus.No,
            sort_order:
              sort_order &&
              sort_order != "" &&
              sort_order != null &&
              sort_order != undefined
                ? sort_order
                : 0,
            title: title,
            description:description,
            title_color,
            description_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: stunningDesingSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
      
      const AfterUpdatestunningDesingSection = await TemplateFourData.findOne({
        where: { id: stunningDesingSection.dataValues.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_dazzling_style_id: stunningDesingSection?.dataValues?.id, data: {...stunningDesingSection?.dataValues}},
        new_data: {
          temaplate_seven_dazzling_style_id: AfterUpdatestunningDesingSection?.dataValues?.id, data: { ...AfterUpdatestunningDesingSection?.dataValues }
        }
      }], stunningDesingSection?.dataValues?.id, LogsActivityType.Edit, LogsType.templateFourPerfectJewelry, req?.body?.session_res?.id_app_user,trn)
    }else{
      const TemplateFourDizzlingStyle = await TemplateFourData.create(
        {
          section_type: TemplateFour.PerfectJewelry,
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
          description:description,
          title_color,
          description_color,
          created_by: req.body.session_res.id_app_user,
          company_info_id :req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: {
            banner_id: TemplateFourDizzlingStyle?.dataValues?.id, data: {
              ...TemplateFourDizzlingStyle?.dataValues
            }
          }
        }], TemplateFourDizzlingStyle?.dataValues?.id, LogsActivityType.Add, LogsType.templateFourPerfectJewelry, req?.body?.session_res?.id_app_user,trn)
      }
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

export const deletePerfectJewelrySection = async (req: Request) => {
  try {
    const { TemplateFourData } = initModels(req);
    
    const PerfectJewelrySection = await TemplateFourData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(PerfectJewelrySection && PerfectJewelrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateFourData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: PerfectJewelrySection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_dazzling_style_id: PerfectJewelrySection?.dataValues?.id, data: {...PerfectJewelrySection?.dataValues} },
      new_data: {
        temaplate_seven_dazzling_style_id: PerfectJewelrySection?.dataValues?.id, data: {
          ...PerfectJewelrySection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], PerfectJewelrySection?.dataValues?.id, LogsActivityType.Delete, LogsType.templateFourPerfectJewelry, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getPerfectJewelrySection = async (req: Request) => {
  try {
    const { TemplateFourData } = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateFour.PerfectJewelry },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              {
                description: { [Op.iLike]: "%" + pagination.search_text + "%" },
              }
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TemplateFourData.count({
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

    const result = await TemplateFourData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "description",
        "title_color",
        "description_color",
        "is_active",
      ]
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForPerfectJewelrySection = async (req: Request) => {
  try {
    const { TemplateFourData } = initModels(req);

    const PerfectJewelrySection = await TemplateFourData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateFour.PerfectJewelry },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(PerfectJewelrySection && PerfectJewelrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateFourData.update(
      {
        is_active: statusUpdateValue(PerfectJewelrySection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: PerfectJewelrySection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_dazzling_style_id: PerfectJewelrySection?.dataValues?.id, data: {...PerfectJewelrySection?.dataValues} },
      new_data: {
        temaplate_seven_dazzling_style_id: PerfectJewelrySection?.dataValues?.id, data: {
          ...PerfectJewelrySection?.dataValues, is_active: statusUpdateValue(PerfectJewelrySection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], PerfectJewelrySection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.templateFourPerfectJewelry, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
