import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import StateData from "../../model/master/state.model";
import { ActiveStatus } from "../../utils/app-enumeration";
import { RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";


export const addState = async (req: Request) => {
    const { name, code, image, created_by, country_id } = req.body
    try {
        const payload = {
            state_name: name,
            state_code: code,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            id_country: country_id,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,

        }

        const StateCodeExists = await StateData.findOne({ where: { state_code: code, is_deleted: "0" } });

        const stateNameExistes = await StateData.findOne({ where: { state_name: name, is_deleted: "0" } })
        if (StateCodeExists === null && stateNameExistes === null) {
            await StateData.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllState = async (req: Request) => {
  try {
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: "0" },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { state_name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
            { state_code: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await StateData.count({
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

    const result = await StateData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "state_name",
        "state_code",
        "created_date",
        "id_country",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const getByIdState = async (req: Request) => {
try {
    console.log(req.params.id);
    const state = await StateData.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(state && state.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: state})
} catch (error) {
    throw error
}
}

export const updateState = async (req: Request) => {
    const {id, name, code, country_id, updated_by} = req.body

try {
    const stateId = await StateData.findOne({ where: { id: id, is_deleted: "0" } })

    if (stateId) {
      const StateCodeExists = await StateData.findOne({ where: { state_code: code, id: { [Op.ne]: id }, is_deleted: "0" } });
      if (StateCodeExists == null) {
        const StateInfo = await (StateData.update(
          {
            state_name: name,
            state_code: code,
            id_country: country_id, 
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (StateInfo) {
          const StateInformation = await StateData.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: StateInformation})
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

export const deleteState = async (req: Request) => {

    try {
        const StateExists = await StateData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(StateExists)

          if (!(StateExists && StateExists.dataValues)) {
            return resNotFound();
          }
          await StateData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: StateExists.dataValues.id } }
          );
      
          return resSuccess();
    } catch (error) {
        throw error
    }
}

export const statusUpdateState = async (req: Request) => {
try {
    const StateExists = await StateData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (StateExists) {
        const StateActionInfo = await (StateData.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: StateExists.dataValues.id } }
        ));
        if (StateActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}