import { Op, Sequelize } from "sequelize";
import { getInitialPaginationFromQuery, resSuccess, resUnknownError } from "../../utils/shared-functions";
import { Request } from "express";
import { AUDIT_LOG_HIDE_BASE_ON_ACTIVITY_TYPE, AUDIT_LOG_HIDE_BASE_ON_LOG_TYPE, LOG_FOR_SUPER_ADMIN } from "../../utils/app-constants";
import { DEFAULT_STATUS_CODE_SUCCESS, NOTHING_CHANGED } from "../../utils/app-messages";
import { initModels } from "../model/index.model";
import { LogsActivityType } from "../../utils/app-enumeration";
  export const getActivityLogsSection = async (req: Request) => {
    try {
      const { ActivityLogs, AppUser} = initModels(req);
      let paginationProps = {};
  
      let pagination = {
        ...getInitialPaginationFromQuery(req.query),
        search_text: req.query.search_text,
      };
      
      const startDateFilter: any =req?.query?.start_date != undefined ? req?.query?.start_date : new Date().getFullYear();

      const endDateFilter: any = req?.query?.end_date != undefined ? req?.query?.end_date : new Date();
      const endDate = new Date(endDateFilter);
      endDate.setDate(endDate.getDate() + 1);
    
      let noPagination = req.query.no_pagination === "1";
      let where:any = [
        req.body.session_res.is_super_admin !== true
          ? {
              company_info_id:req?.body?.session_res?.client_id
            }
          : {company_info_id: {
            [Op.or]: [
              req?.body?.session_res?.client_id,
              LOG_FOR_SUPER_ADMIN
            ]
          }},
        pagination.search_text
          ? {
              [Op.or]: [
                Sequelize.where(
                  Sequelize.cast(Sequelize.col('log_type'), 'TEXT'),
                  {
                    [Op.iLike]: `%${pagination.search_text}%`
                  }
                )
              ]
            }
          : {},
          {
            // Apply start and end date filter on created_date
            created_date: {
              [Op.between]: [startDateFilter, endDate]
            }
          },
          {company_info_id: req?.body?.session_res?.client_id},
          {
            activity_type: {
              [Op.notIn]: AUDIT_LOG_HIDE_BASE_ON_ACTIVITY_TYPE 
            }
          },
          {
            log_type: {
              [Op.notIn]: AUDIT_LOG_HIDE_BASE_ON_LOG_TYPE
            }
          }
      ];
  
      if (!noPagination) {
        const totalItems = await ActivityLogs.count({
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
  
      const rawResult:any = await ActivityLogs.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
            "id",
            "log_type",
            "activity_type",
            "created_date",
            "created_by",
            "modified_by",
            "modified_date",
            "old_value_json",
            "updated_value_json",
            "ref_id"
        ],
        include:{
          required: false,
          model:AppUser,
          as:'User',
          attributes:['username']
        },
        // group: ['activity_logs.id','User.id'],
      });
      const result = [];

      for (const row of rawResult) {
        const oldJson = row.old_value_json;
        const newJson = row.updated_value_json;
      
        // If oldJson is null or different from newJson, process the row
          const changes:any = findJsonDifferences(oldJson, newJson, row.activity_type);
          if(changes?.code !== DEFAULT_STATUS_CODE_SUCCESS){  
            return changes;
          }
      
          // Only push to result if changes are detected
          if (Object.keys(changes?.data).length > 0) {
            result.push({
              id: row.id,
              log_type: row.log_type,
              activity_type: row.activity_type,
              created_date: row.created_date,
              created_by: row.created_by,
              ref_id: row.ref_id,
              change_logs: changes?.data,  // Include only the changed fields in the "comparison" key
              User: row?.User?.username || '',
            });
          }
        }
      
      return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
      throw error;
    }
  };
  const findJsonDifferences = (oldObj, newObj, activity_type: any = '') => {
    try {
      const diff = {};
  
      if (!oldObj || typeof oldObj !== 'object') {
        for (const key in newObj) {
          const value = newObj[key];
  
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            diff[key] = {};
            for (const nestedKey in value) {
              diff[key][nestedKey] = { newValue: value[nestedKey], oldValue: '-' };
            }
          } else if (Array.isArray(value)) {
            diff[key] = value.map(item => ({ newValue: item, oldValue: '-' }));
          } else {
            diff[key] = { newValue: value, oldValue: '-' };
          }
        }
        return resSuccess({ data: diff });
      }
  
      for (const key in newObj) {
        const newValue = newObj[key];
        const oldValue = oldObj[key];
  
        if (Array.isArray(newValue) && Array.isArray(oldValue)) {
          const arrayDiff = [];
          const maxLength = Math.max(newValue.length, oldValue.length);
  
          for (let i = 0; i < maxLength; i++) {
            const oldItem = oldValue[i];
            const newItem = newValue[i];
  
            if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
              if (
                typeof oldItem === 'object' &&
                typeof newItem === 'object' &&
                oldItem !== null &&
                newItem !== null
              ) {
                const itemDiff = findJsonDifferences(oldItem, newItem);
                arrayDiff.push(itemDiff?.data || {});
              } else {
                arrayDiff.push({
                  oldValue: oldItem === undefined ? '-' : oldItem,
                  newValue: newItem === undefined ? '-' : newItem
                });
              }
            }
          }
  
          if (arrayDiff.length > 0) {
            diff[key] = arrayDiff;
          }
  
        } else if (
          typeof newValue === 'object' &&
          newValue !== null &&
          !Array.isArray(newValue)
        ) {
          const nestedResult = findJsonDifferences(oldValue || {}, newValue);
          if (Object.keys(nestedResult?.data || {}).length > 0) {
            diff[key] = nestedResult.data;
          }
  
        } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diff[key] = {
            oldValue: oldValue === undefined ? '-' : oldValue,
            newValue: newValue === undefined ? '-' : newValue
          };
        }
      }
  
      if (Object.keys(diff).length === 0) {
        return resSuccess({ data: {} });
      }

      // Omit `is_deleted` only for `add`
      if (activity_type === LogsActivityType.Add && diff.hasOwnProperty('is_deleted')) {
        delete diff['is_deleted'];
      }
      const auditFields = ['updated_at', 'updated_by', 'modified_by', 'modified_date'];
      const onlyAuditChanges = Object.keys(diff).every(key => auditFields.includes(key));
      if (onlyAuditChanges) {
        return resSuccess({ data: {} }); // skip audit-only changes
      }

      return resSuccess({ data: diff });
    } catch (error) {
      return resUnknownError(error);
    }
  };
  
  
  
  