import { Request } from "express";
import { addActivityLogs, getCompanyIdBasedOnTheCompanyKey, getInitialPaginationFromQuery, getLocalDate, resNotFound, resSuccess, statusUpdateValue } from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, LogsActivityType, LogsType, Pagination } from "../../utils/app-enumeration";
import { Op } from "sequelize";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { initModels } from "../model/index.model";

export const addStoreAddress = async (req: Request) => {
  try {
        const { StoreAddress} = initModels(req);
        const { address, map_link, branch_name,phone_number,timing } = req.body;
        
        const data = await StoreAddress.create({
            address,
            map_link,
            branch_name,
            phone_number,
            timing,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
            is_deleted: DeletedStatus.No,
            is_active: ActiveStatus.Active,
            company_info_id: req.body.session_res.client_id
        })

        await addActivityLogs(req,req?.body?.session_res?.client_id,[{old_data: null, new_data: {city_id: data?.dataValues?.id,data:{...data.dataValues}}}], data.dataValues.id, LogsActivityType.Add, LogsType.StoreAddress, req?.body?.session_res?.id_app_user)

        return resSuccess()
    } catch (error) {
       throw error 
    }
};

export const getAllStoreAddress = async (req: Request) => {
  try {
        const { StoreAddress} = initModels(req);
      
        let paginationProps = {};
    
        let pagination = {
          ...getInitialPaginationFromQuery(req.query),
          search_text: req.query.search_text,
        };
        let noPagination = req.query.no_pagination === Pagination.no;
    
        let where = [
          { is_deleted: DeletedStatus.No },
          { company_info_id: req?.body?.session_res?.client_id },
          pagination.is_active ? { is_active: pagination.is_active } : {},
          pagination.search_text
            ? {
                [Op.or]: [
                  { address: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                  { map_link: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                  { branch_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                  
                ],
              }
            : {},
        ];
    
        if (!noPagination) {
          const totalItems = await StoreAddress.count({
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
    
        const result = await StoreAddress.findAll({
          ...paginationProps,
          where,
          order: [[pagination.sort_by, pagination.order_by]],
          attributes: [
            "id",
            "branch_name",
            "address",
            "map_link",
            "created_date",
            "is_active",
            "phone_number",
            "timing"
          ],
        });
    
        return resSuccess({ data: noPagination ? result : { pagination, result } });
      } catch (error) {
        throw error;
      }
};

export const updateStoreAddress = async (req: Request) => {
  try {
        const { StoreAddress} = initModels(req);
      
        const { id } = req.params;
        const { address, map_link, branch_name,phone_number,timing } = req.body;

        const findStore = await StoreAddress.findOne({ where: { id: id, is_deleted: DeletedStatus.No ,company_info_id: req?.body?.session_res?.client_id} });
        
        if (!(findStore && findStore.dataValues)) {
            return resNotFound();
        }

        await StoreAddress.update({
            address,
            map_link,
            branch_name,
            phone_number,
            timing,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
        }, { where: { id: id, company_info_id: req?.body?.session_res?.client_id } });
        
        await addActivityLogs(req,req?.body?.session_res?.client_id,
          [{ 
            old_data: {city_id: findStore?.dataValues?.id,data:{...findStore?.dataValues}}, 
            new_data: { city_id: findStore?.dataValues?.id,data:{...findStore?.dataValues, address, map_link, branch_name, modified_by: req?.body?.session_res?.id_app_user, modified_date: getLocalDate()} }
          }], findStore?.dataValues.id, LogsActivityType.Edit, LogsType.StoreAddress, req?.body?.session_res?.id_app_user)
        
        return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
    } catch (error) {
        throw error
    }
}

export const deleteStoreAddress = async (req: Request) => {
  try {
        const { StoreAddress} = initModels(req);
      
        const { id } = req.params;
        const findStore = await StoreAddress.findOne({ where: { id: id, is_deleted: DeletedStatus.No,company_info_id: req?.body?.session_res?.client_id } });
        
        if (!(findStore && findStore.dataValues)) {
            return resNotFound();
        }
      await StoreAddress.update(
        {
          is_deleted: DeletedStatus.yes,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: findStore.dataValues.id,company_info_id: req?.body?.session_res?.client_id } }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { city_id: findStore?.dataValues?.id, data: {...findStore?.dataValues} },
        new_data: {
          id: findStore?.dataValues?.id, data: {
            ...findStore?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          }
        }
      }], findStore?.dataValues?.id, LogsActivityType.Delete, LogsType.StoreAddress, req?.body?.session_res?.id_app_user)
  
  
      return resSuccess({ data: RECORD_DELETE_SUCCESSFULLY });
    } catch (error) {
      throw error;
    }
  };
  
  export const statusUpdateForStoreAddress = async (req: Request) => {
    try {
        const { StoreAddress} = initModels(req);

      const findStore = await StoreAddress.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id: req?.body?.session_res?.client_id },
      });
      if (!(findStore && findStore.dataValues)) {
        return resNotFound();
      }
      await StoreAddress.update(
        {
          is_active: statusUpdateValue(findStore),
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: findStore.dataValues.id,company_info_id: req?.body?.session_res?.client_id } }
      );
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { city_id: findStore?.dataValues?.id, data: {...findStore?.dataValues} },
        new_data: {
          id: findStore?.dataValues?.id, data: {
            ...findStore?.dataValues, is_active: statusUpdateValue(findStore),
            modified_date: getLocalDate(),
            modified_by: req?.body?.session_res?.id_app_user,
          }
        }
      }], findStore?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.StoreAddress, req?.body?.session_res?.id_app_user)
        
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (error) {
      throw error;
    }
};
  
export const getAllStoreAddressForUser = async (req: Request) => {
    try {
        const { search_text } = req.query;
        const { StoreAddress} = initModels(req);

    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }

    let where = [
      { is_deleted: DeletedStatus.No },
      {is_active: ActiveStatus.Active},
      { company_info_id: company_info_id?.data},
      {
        [Op.or]: [
          { branch_name: { [Op.iLike]: "%" + search_text + "%" } },
          { address: { [Op.iLike]: "%" + search_text + "%" } },
          { phone_number: { [Op.iLike]: "%" + search_text + "%" } },
          { timing: { [Op.iLike]: "%" + search_text + "%" } },
        ],
      }
    ];

    const result = await StoreAddress.findAll({
            where: where,
            order: [['id', 'DESC']],
            attributes: [
              "id",
              "branch_name",
              "address",
              "map_link",
              "created_date",
              "is_active",
              "phone_number",
              "timing",
            ],
        });
        
    return resSuccess({data: result})
    } catch (error) {
        throw error
    }
}