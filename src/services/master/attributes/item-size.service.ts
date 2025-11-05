import { Request } from "express";
import {Op} from "sequelize";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import ItemSizeData from "../../../model/master/attributes/item-size.model";
import { ActiveStatus } from "../../../utils/app-enumeration";
import { RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";


export const addItemSize = async (req: Request) => {
    const { slug, value, created_by, category_id } = req.body
    try {
        const payload = {
            size: value,
            slug: slug,
            created_date: getLocalDate(),
            is_active: ActiveStatus.Active,
            is_deleted: "0",
            created_by: req.body.session_res.id_app_user,
        }

            const slugExistes = await ItemSizeData.findOne({ where: { slug: slug, is_deleted: "0" } });

        if (slugExistes === null) {
            await ItemSizeData.create(payload)
            console.log(payload);
            return resSuccess({data: payload});
        } else {
            return resErrorDataExit();
        }
    } catch (error) {
        throw (error)
    }
}

export const getAllItemSize = async (req: Request) => {
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
            { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },

        ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await ItemSizeData.count({
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

    const result = await ItemSizeData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "size",
        "slug",
        "is_active",
      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
}


export const updateItemSize = async (req: Request) => {
    const {id, slug, category_id, value, updated_by} = req.body

try {
    const ItemSizeId = await ItemSizeData.findOne({ where: { id: id, is_deleted: "0" } })

    if (ItemSizeId) {
      const slugExists = await ItemSizeData.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });

      if (slugExists == null) {
        const ItemSizeInfo = await (ItemSizeData.update(
          {
            size: value,
            slug: slug,
            category_id: category_id,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id
          },
          { where: { id: id, is_deleted: "0" } }
        ));
        if (ItemSizeInfo) {
          const ItemSizeInformation = await ItemSizeData.findOne({ where: { id: id, is_deleted: "0" } })
          return resSuccess({data: ItemSizeInformation})
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

export const deleteItemSize = async (req: Request) => {

    try {
        const ItemSizeExists = await ItemSizeData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        console.log(ItemSizeExists)

          if (!(ItemSizeExists && ItemSizeExists.dataValues)) {
            return resNotFound();
          }
          await ItemSizeData.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: ItemSizeExists.dataValues.id } }
          );
      
          return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
    } catch (error) {
        throw error
    }
}

export const statusUpdateItemSize = async (req: Request) => {
try {
    const ItemSizeExists = await ItemSizeData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    if (ItemSizeExists) {
        const ItemSizeActionInfo = await (ItemSizeData.update(
            {
                is_active: req.body.is_active,
                modified_date: getLocalDate(),
                modified_by: req.body.session_res.id
            },
            { where: { id: ItemSizeExists.dataValues.id } }
        ));
        if (ItemSizeActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
} catch (error) {
    throw error
}
}