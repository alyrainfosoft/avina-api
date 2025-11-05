import { Request } from "express";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";
import { ActiveStatus } from "../../utils/app-enumeration";
import TaxMaster from "../../model/master/tax.model";
import { Op } from "sequelize";
import { RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";

export const addTaxData = async (req: Request) => {
    const { name, rate } = req.body
    const slug = name.replaceAll(" ", "-")
    try {
        const payload = {
            name: name,
            slug: slug,
            rate: rate,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,

        }

        const taxNameExists = await TaxMaster.findOne({ where: { name: name, is_deleted: "0" } });

        if (taxNameExists === null) {
            await TaxMaster.create(payload)
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllTaxData = async (req: Request) => {
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
            { name: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await TaxMaster.count({
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

    const result = await TaxMaster.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "rate",
        "slug",
        "created_date",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const getByIdTax = async (req: Request) => {
try {
    console.log(req.params.id);
    const taxValues = await TaxMaster.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(taxValues && taxValues.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: taxValues})
} catch (error) {
    throw error
}
}

export const updateTaxData = async (req: Request) => {
    const {id, name, rate } = req.body
    const slug = name.replaceAll(" ", "-")
try {
    const taxId = await TaxMaster.findOne({ where: { id: id, is_deleted: "0" } })

    if (taxId) {
      const taxNameExits = await TaxMaster.findOne({ where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" } });
      if (taxNameExits == null) {
        const taxInfo = await (TaxMaster.update(
          {
            name: name,
            rate: rate,
            slug: slug, 
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (taxInfo) {
          const taxInformation = await TaxMaster.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: taxInformation})
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

export const deleteTaxs = async (req: Request) => {

    try {
        const taxExits = await TaxMaster.findOne({ where: { id: req.body.id, is_deleted: "0" } });


          if (!(taxExits && taxExits.dataValues)) {
            return resNotFound();
          }
          await TaxMaster.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: taxExits.dataValues.id } }
          );
      
          return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
        throw error
    }
}

export const statusUpdatetax = async (req: Request) => {
try {
    const taxExits = await TaxMaster.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (taxExits) {
        const StateActionInfo = await (TaxMaster.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: taxExits.dataValues.id } }
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