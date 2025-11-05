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

export const addAndUpdateAttractiveJewellrySection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const {
      title,
      sub_title,
      sort_order = null,
    } = req.body;
    const trn = await (req.body.db_connection).transaction();
    const findDiamondShapeSection = await TemplateSevenData.findOne({
      where: { section_type: TemplateSevenSectionType.AttractiveJewelrySection ,company_info_id :req?.body?.session_res?.client_id,is_deleted: DeletedStatus.No},
      transaction:trn
    });
    try {
     if(findDiamondShapeSection){

        await TemplateSevenData.update(
          {
            section_type: TemplateSevenSectionType.AttractiveJewelrySection,
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
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id: findDiamondShapeSection.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
        
      const AfterUpdateFindDiamondShapeSection = await TemplateSevenData.findOne({
        where: { id: findDiamondShapeSection.dataValues.id, is_deleted: DeletedStatus.No},transaction:trn 
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { temaplate_seven_attrachtiv_jewellry_id: findDiamondShapeSection?.dataValues?.id, data: {...findDiamondShapeSection?.dataValues}},
        new_data: {
          temaplate_seven_attrachtiv_jewellry_id: AfterUpdateFindDiamondShapeSection?.dataValues?.id, data: { ...AfterUpdateFindDiamondShapeSection?.dataValues }
        }
      }], findDiamondShapeSection?.dataValues?.id, LogsActivityType.Edit, LogsType.TemplateSevenAttractiveJewelrySection, req?.body?.session_res?.id_app_user,trn)
      
      }else{
        const TemplateSevenAttractiveJewellry = await TemplateSevenData.create(
          {
            section_type: TemplateSevenSectionType.AttractiveJewelrySection,
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
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: {
            temaplate_seven_attrachtiv_jewellry_id: TemplateSevenAttractiveJewellry?.dataValues?.id, data: {
              ...TemplateSevenAttractiveJewellry?.dataValues
            }
          }
        }], TemplateSevenAttractiveJewellry?.dataValues?.id, LogsActivityType.Add, LogsType.TemplateSevenAttractiveJewelrySection, req?.body?.session_res?.id_app_user,trn)
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

export const deleteAttractiveJewellrySection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);

    const AttractiveJewellrySection = await TemplateSevenData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(AttractiveJewellrySection && AttractiveJewellrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }

    await TemplateSevenData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: AttractiveJewellrySection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_attrachtiv_jewellry_id: AttractiveJewellrySection?.dataValues?.id, data: {...AttractiveJewellrySection?.dataValues} },
      new_data: {
        temaplate_seven_attrachtiv_jewellry_id: AttractiveJewellrySection?.dataValues?.id, data: {
          ...AttractiveJewellrySection?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], AttractiveJewellrySection?.dataValues?.id, LogsActivityType.Delete, LogsType.TemplateSevenAttractiveJewelrySection, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

export const getAttractiveJewellrySection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { section_type: TemplateSevenSectionType.AttractiveJewelrySection },
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
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "sub_title",
        "is_active",
      ]
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForAttractiveJewellrySection = async (req: Request) => {
  try {
    const {TemplateSevenData} = initModels(req);
    const AttractiveJewellrySection = await TemplateSevenData.findOne({
      where: {
        id: req.params.id,
        section_type: { [Op.eq]: TemplateSevenSectionType.AttractiveJewelrySection },
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(AttractiveJewellrySection && AttractiveJewellrySection.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await TemplateSevenData.update(
      {
        is_active: statusUpdateValue(AttractiveJewellrySection),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: AttractiveJewellrySection.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { temaplate_seven_attrachtiv_jewellry_id: AttractiveJewellrySection?.dataValues?.id, data: {...AttractiveJewellrySection?.dataValues} },
      new_data: {
        temaplate_seven_attrachtiv_jewellry_id: AttractiveJewellrySection?.dataValues?.id, data: {
          ...AttractiveJewellrySection?.dataValues, is_active:  statusUpdateValue(AttractiveJewellrySection),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], AttractiveJewellrySection?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.TemplateSevenAttractiveJewelrySection, req?.body?.session_res?.id_app_user)
      

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
