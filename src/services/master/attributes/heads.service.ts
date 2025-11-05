import { Request } from "express";
import { Sequelize, Op, where } from "sequelize";
import dbContext from "../../../config/db-context";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import Image from "../../../model/image.model";
import HeadsData from "../../../model/master/attributes/heads.model";
import { ActiveStatus, IMAGE_TYPE } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";

export const addHeads = async (req: Request) => {
    try {
    const { name, slug, created_by, sort_code } = req.body
  
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.heads,
          null
        );
  
        if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          return moveFileResult;
        }
  
        imagePath = moveFileResult.data;
      }
  
      const trn = await dbContext.transaction();
  
      try {
        let idImage = null;
        if (imagePath) {
          const imageResult = await Image.create(
            {
              image_path: imagePath,
              image_type: IMAGE_TYPE.heads,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }
        const payload = {
          name: name,
          slug: slug,
          created_date: getLocalDate(),
          created_by: req.body.session_res.id_app_user,
          sort_code: sort_code,
          id_image: idImage,
          is_active: ActiveStatus.Active,
          is_deleted: "0"
      }
  
      const headNameExistes = await HeadsData.findOne({ where: { name: name, is_deleted: "0" } })
      const headSlugExistes = await HeadsData.findOne({ where: { slug: slug,  is_deleted: "0" } })
      const headSortCodeExistes = await HeadsData.findOne({ where: { sort_code: sort_code,  is_deleted: "0" } })

      if (headNameExistes === null && headSlugExistes === null && headSortCodeExistes === null) {
        await HeadsData.create(
          payload,
          { transaction: trn }
        );
  
        await trn.commit();
          return resSuccess({data: payload});
      } else {
          return resErrorDataExit();
      }
      
      } catch (e) {
        await trn.rollback();
        throw e;
      }
    } catch (e) {
      throw e;
    }
  }

  export const getAllHeads = async (req: Request) => {
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
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
  
          ],
            }
          : {},
      ];
  
      if (!noPagination) {
        const totalItems = await HeadsData.count({
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
  
      const result = await HeadsData.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
          "id",
          "name",
          "slug",
          "sort_code",
          [Sequelize.literal("image.image_path"), "image_path"],
          "is_active",
        ],
        include: [{ model: Image, as: "image", attributes: [] }],
      });
  
      return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
      throw error;
    }

}

export const getByIdHeads = async (req: Request) => {
    try {
      const headInfo = await HeadsData.findOne({ where: { id: req.params.id, is_deleted: "0" },  attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by"
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
  
      if (!(headInfo && headInfo.dataValues)) {
          return resNotFound();
        }
  
  
    return resSuccess({data: headInfo});
    } catch (error) {
      throw error
      
    }
  }
  
export const updateHeads = async (req: Request) => {
      const {id, name, slug, sort_code, updated_by} = req.body
    
    try {
    
        const headId = await HeadsData.findOne({ where: { id: id, is_deleted: "0" } })
      console.log(headId)
      if (headId == null) {
        return resErrorDataExit() 
      }

  let id_image = null;
  let imagePath = null;

  if (req.file) {
    const moveFileResult = await moveFileToS3ByType(dbContext,
      req.file,
      IMAGE_TYPE.heads,
      null
    );

    if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return moveFileResult;
    }

    imagePath = moveFileResult.data;
  }

  const trn = await dbContext.transaction();
  try {
    if (imagePath) {
      const imageResult = await Image.create(
        {
          image_path: imagePath,
          image_type: IMAGE_TYPE.heads,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      id_image = imageResult.dataValues.id;

    }

    const headNameExistes = await HeadsData.findOne({ where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" } });
    const headSlugExistes = await HeadsData.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });
    const headSortCodeExistes = await HeadsData.findOne({ where: { sort_code: sort_code, id: { [Op.ne]: id }, is_deleted: "0" } });

    if (headNameExistes == null && headSlugExistes == null && headSortCodeExistes == null) {
      if(id_image === null) {
        const headInfo = await (HeadsData.update(
          {
            name: name,
            slug: slug,
            sort_code: sort_code,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
      
      { where: { id: id, is_deleted: "0" },  transaction: trn  }
    ));
    if (headInfo) {
      const headInformation = await HeadsData.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
      await trn.commit();
      return resSuccess({data: headInformation})

    }

  } else {
        const headInfo = await (HeadsData.update(
          {
            name: name,
            slug: slug,
            id_image: id_image,
            sort_code: sort_code,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
      
      { where: { id: id, is_deleted: "0" },  transaction: trn  }
    ));
    if (headInfo) {
      const headInformation = await HeadsData.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
      await trn.commit();
      return resSuccess({data: headInformation})

    }
  }   
} else {
    await trn.rollback();
    return resErrorDataExit()
}

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();

    throw e;
  }
    } catch (error) {
    
      throw(error);
    }
}
  
  export const deleteHeads = async (req: Request) => {
  
      try {
          const headExists = await HeadsData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    
            if (!(headExists && headExists.dataValues)) {
              return resNotFound();
            }
            await HeadsData.update(
              {
                is_deleted: "1",
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
              },
              { where: { id: headExists.dataValues.id } }
            );
        
            return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
      } catch (error) {
          throw error
      }
}
    
export const statusUpdateHeads = async (req: Request) => {
    try {
      const headExists = await HeadsData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
      if (headExists) {
          const headActionInfo = await (HeadsData.update(
              {
                  is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: headExists.dataValues.id } }
          ));
          if (headActionInfo) {
              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound();
      }
    } catch (error) {
      throw error
    }
}