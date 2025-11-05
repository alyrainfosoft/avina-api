import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../../../data/interfaces/common/common.interface";
import MetalGroupMaster from "../../../../model/master/attributes/metal/metal-group-master.model";
import { ActiveStatus } from "../../../../utils/app-enumeration";
import { RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../../utils/shared-functions";


export const addMetalGroupMasterData = async (req: Request) => {
    const {  name, metal_master_id, kt_id, metal_tone_id, created_by } = req.body
    try {
        const payload = {
            name: name,
            id_metal: metal_master_id,
            id_kt: kt_id,
            id_metal_tone: metal_tone_id,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,
        }

            const nameExists = await MetalGroupMaster.findOne({ where: { name: name, is_deleted: "0" } });


        if (nameExists === null) {
            await MetalGroupMaster.create(payload)
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllMetalGroupMasterData = async (req: Request) => {
    try {

        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
          };
      
          let where = [
            { is_deleted: "0" },
            {
              [Op.or]: [
                  { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },

              ],
              is_deleted : "0"
          }
          ];
      
          const totalItems = await MetalGroupMaster.count({
            where,
          });
      
          if (totalItems === 0) {
            return resSuccess({ data: { pagination, result: [] } });
          }
          pagination.total_items = totalItems;
          pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

          const result = await MetalGroupMaster.findAll({
            where,
            limit: pagination.per_page_rows,
            offset: (pagination.current_page - 1) * pagination.per_page_rows,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
              "id",
              "name",
              "id_metal",
              "id_kt",
              "id_metal_tone",
              "created_date",
              "is_active",
            ],
            
          });

          console.log("----------" ,result)
        return resSuccess({ data: { pagination, result } })

    } catch (error) {
        throw error
    }

}

export const getByIdMetalGroupMasterData = async (req: Request) => {
    try {
        console.log(req.body.id);
        const masterData = await MetalGroupMaster.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    
        if (!(masterData && masterData.dataValues)) {
            return resNotFound();
          }
          return resSuccess({data: masterData})
    } catch (error) {
        throw error
    }
}

export const updateMetalGroupMasterData = async (req: Request) => {
    const {id, metal_master_id, name, kt_id, metal_tone_id, updated_by} = req.body

try {
    const metalMasterId = await MetalGroupMaster.findOne({ where: { id: id, is_deleted: "0" } })

    if (metalMasterId) {
      const nameExists = await MetalGroupMaster.findOne({ where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" } });

      if (nameExists == null) {
        const metalMasterInfo = await (MetalGroupMaster.update(
          {
            name: name,
            id_metal: metal_master_id,
            id_kt: kt_id,
            id_metal_tone: metal_tone_id,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: metalMasterId.dataValues.id, is_deleted: "0" } }
        ));
        if (metalMasterInfo) {
          const metalMasterInformation = await MetalGroupMaster.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: metalMasterInformation})
        }
      } else {
        return resErrorDataExit()
      }
    } else {
        return resNotFound() 
    }

} catch (error) {
    throw(error);
}

}

export const deleteMetalGroupMasterData = async (req: Request) => {

  try {
      const metalExists = await MetalGroupMaster.findOne({ where: { id: req.body.id, is_deleted: "0" } });

      console.log(metalExists)

        if (!(metalExists && metalExists.dataValues)) {
          return resNotFound();
        }
        await MetalGroupMaster.update(
          {
            is_deleted: "1",
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: metalExists.dataValues.id } }
        );
    
        return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
  } catch (error) {
      throw error
  }
}

export const statusUpdateMetalGroupMasterData = async (req: Request) => {
try {
  const metalExists = await MetalGroupMaster.findOne({ where: { id: req.body.id, is_deleted: "0" } });
  if (metalExists) {
      const metalActionInfo = await (MetalGroupMaster.update(
          {
              is_active: req.body.is_active,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user
          },
          { where: { id: metalExists.dataValues.id } }
      ));
      if (metalActionInfo) {
          return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
      } 
  } else {
      return resNotFound();
  }
} catch (error) {
  throw error
}
}
