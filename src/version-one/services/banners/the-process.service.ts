import { Request } from "express";
import { initModels } from "../../model/index.model";
import { ActiveStatus, BANNER_TYPE, DeletedStatus, IMAGE_TYPE, LogsActivityType, LogsType } from "../../../utils/app-enumeration";
import {  RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess } from "../../../utils/shared-functions";
import { Op } from "sequelize";

export const saveTheProcess = async (req: Request) => {
  const {
    id,
    name,
    sub_title,
    description,
    title_color,
    sub_title_color,
    description_color
  } = req.body;

  try {
    const { Banner } = initModels(req);
    const trn = await (req.body.db_connection).transaction();

    try {
      let bannerRecord;
      let isUpdate = !!id;

      if (isUpdate) {
        // Fetch the existing record to check and log old data
        const existing = await Banner.findOne({
          where: {
            id,
            banner_type: BANNER_TYPE.The_process,
            is_deleted: DeletedStatus.No,
            company_info_id: req?.body?.session_res?.client_id,
          },
          transaction: trn,
        });

        if (!existing) {
          await trn.rollback();
          return resNotFound();
        }

        // Perform update
        await Banner.update(
          {
            name,
            sub_title,
            description,
            title_color,
            sub_title_color,
            description_color,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          {
            where: { id, is_deleted: DeletedStatus.No },
            transaction: trn,
          }
        );

        bannerRecord = await Banner.findOne({
          where: { id, is_deleted: DeletedStatus.No },
          transaction: trn,
        });

        // Log update
        await addActivityLogs(
          req?.body?.session_res?.client_id,
          [{
            old_data: {
              feature_section_id: existing?.dataValues?.id,
              data: { ...existing?.dataValues }
            },
            new_data: {
              feature_section_id: bannerRecord?.dataValues?.id,
              data: { ...bannerRecord?.dataValues }
            }
          }],
          existing?.dataValues?.id,
          LogsActivityType.Edit,
          LogsType.theProcess,
          req?.body?.session_res?.id_app_user,
          trn
        );
      } else {
        // Perform insert
        bannerRecord = await Banner.create(
          {
            name,
            sub_title,
            description,
            title_color,
            sub_title_color,
            description_color,
            is_active: ActiveStatus.Active,
            banner_type: BANNER_TYPE.The_process,
            created_by: req.body.session_res.id_app_user,
            company_info_id: req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        // Log create
        await addActivityLogs(
          req?.body?.session_res?.client_id,
          [{
            old_data: null,
            new_data: {
              feature_section_id: bannerRecord?.dataValues?.id,
              data: { ...bannerRecord?.dataValues }
            }
          }],
          bannerRecord?.dataValues?.id,
          LogsActivityType.Add,
          LogsType.theProcess,
          req?.body?.session_res?.id_app_user,
          trn
        );
      }

      await trn.commit();
      return resSuccess({ data: bannerRecord });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};


export const getAllTheaddTheProcess = async (req: Request) => {
  try {
    const {Image, Banner} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id :req?.body?.session_res?.client_id },
      { banner_type: BANNER_TYPE.The_process },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          ],
        }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await Banner.count({
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

    const result = await Banner.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "sub_title",
        "description",
        "title_color",
        "sub_title_color",
        "description_color",
        "is_active",
        "created_date", 
      ],
    });


    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
}

export const deleteTheProcess = async (req: Request) => {

  try {
    const {Banner} = initModels(req);

    const TheProcessExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.The_process }, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } });


    if (!(TheProcessExists && TheProcessExists.dataValues)) {
      return resNotFound();
    }
    await Banner.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: TheProcessExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { feature_section_id: TheProcessExists?.dataValues?.id, data: {...TheProcessExists?.dataValues} },
      new_data: {
        feature_section_id: TheProcessExists?.dataValues?.id, data: {
          ...TheProcessExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], TheProcessExists?.dataValues?.id, LogsActivityType.Delete, LogsType.theProcess, req?.body?.session_res?.id_app_user)

    return resSuccess();
  } catch (error) {
    throw error
  }
}

export const statusUpdateTheProcess = async (req: Request) => {
  try {
    const { Banner} = initModels(req);

    const featureSectionExists = await Banner.findOne({ where: { id: req.body.id, banner_type: { [Op.eq]: BANNER_TYPE.The_process }, is_deleted: DeletedStatus.No, company_info_id :req?.body?.session_res?.client_id } });
    if (featureSectionExists) {
      const featureSectionInfo = await (Banner.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        { where: { id: featureSectionExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
      ));
      if (featureSectionInfo) {
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { feature_section_id: featureSectionExists?.dataValues?.id, data: {...featureSectionExists?.dataValues} },
          new_data: {
            feature_section_id: featureSectionExists?.dataValues?.id, data: {
              ...featureSectionExists?.dataValues, is_active: req?.body?.is_active,
              modified_date: getLocalDate(),
              modified_by: req?.body?.session_res?.id_app_user,
            }
          }
        }], featureSectionExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.theProcess, req?.body?.session_res?.id_app_user)
    
        return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
      }
    } else {
      return resNotFound();
    }
  } catch (error) {
    throw error
  }
}