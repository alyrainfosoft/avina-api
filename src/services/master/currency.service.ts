import { Request } from "express";
import { Op } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import CurrencyData from "../../model/master/currency.model";
import { ActiveStatus } from "../../utils/app-enumeration";
import { CURRENCY_DEFAULT_EXITS, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resBadRequest, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";

export const addCurrency = async (req: Request) => {
    const { name,  rate, created_by } = req.body
    try {
        const payload = {
            currency: name,
            rate: rate,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            is_default: "0",
            created_by: req.body.session_res.id_app_user,
            // updated_by: updated_by
        }


        const currencyNameExistes = await CurrencyData.findOne({ where: { currency: name, is_deleted: "0" } })
        if (currencyNameExistes === null) {
            await CurrencyData.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllCurrency = async (req: Request) => {
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
            { currency: { [Op.iLike]: "%" + pagination.search_text  + "%" } },
        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await CurrencyData.count({
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

    const result = await CurrencyData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "currency",
        "rate",
        "created_date",
        "is_active",
        "is_default"
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }

}

export const getByIdCurrency = async (req: Request) => {
try {
    console.log(req.params.id);
    const currency = await CurrencyData.findOne({ where: { id: req.params.id, is_deleted: "0" } });

    if (!(currency && currency.dataValues)) {
        return resNotFound();
      }
      return resSuccess({data: currency})
} catch (error) {
    throw error
}
}

export const updateCurrency = async (req: Request) => {
    const {id, name, rate, updated_by} = req.body

try {
    const currencyId = await CurrencyData.findOne({ where: { id: id, is_deleted: "0" } })

    if (currencyId) {
      const currencynameExists = await CurrencyData.findOne({ where: { currency: name, id: { [Op.ne]: id }, is_deleted: "0" } });
      console.log(currencynameExists);
      
      if (currencynameExists == null) {
        const currencyInfo = await (CurrencyData.update(
          {
            currency: name,
            rate: rate,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (currencyInfo) {
          const currencyInformation = await CurrencyData.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: currencyInformation})
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

export const deleteCurrency = async (req: Request) => {

    try {
        const CurrencyExists = await CurrencyData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(CurrencyExists)

          if (!(CurrencyExists && CurrencyExists.dataValues)) {
            return resNotFound();
          }
          await CurrencyData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: CurrencyExists.dataValues.id } }
          );
      
          return resSuccess();
    } catch (error) {
        throw error
    }
}

export const statusUpdateCurrency = async (req: Request) => {
try {
    const CurrencyExists = await CurrencyData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (CurrencyExists) {
        const CurrencyActionInfo = await (CurrencyData.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id_app_user
            },
            { where: { id: CurrencyExists.dataValues.id } }
        ));
        if (CurrencyActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}

export const isDefaultCurrency = async (req: Request) => {
  try {
      const CurrencyExists = await CurrencyData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
      const defaultValue = await CurrencyData.findAll({where: {is_deleted: "0", is_default: "1"}})
      if(req.body.is_default == 1) {
        if(defaultValue.length <= 0) {
          if (CurrencyExists) {
            const CurrencyActionInfo = await (CurrencyData.update(
                {
                    is_default: req.body.is_default,
                    modified_date: getLocalDate(),
                    modified_by: req.body.session_res.id_app_user
                },
                { where: { id: CurrencyExists.dataValues.id } }
            ));
            if (CurrencyActionInfo) {
                return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
            } 
        } else {
            return resNotFound();
        }
        } else {
          return resErrorDataExit({message: CURRENCY_DEFAULT_EXITS})
        }
      } else {
        if (CurrencyExists) {
          const CurrencyActionInfo = await (CurrencyData.update(
              {
                  is_default: req.body.is_default,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: CurrencyExists.dataValues.id } }
          ));
          if (CurrencyActionInfo) {
              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound();
      }
      }

      


  } catch (error) {
      throw error
  }
  }