import { Request } from "express";
import { Sequelize, Op } from "sequelize";
import dbContext from "../../../../config/db-context";
import { IQueryPagination } from "../../../../data/interfaces/common/common.interface";
import {  moveFileToS3ByType } from "../../../../helpers/file.helper";
import Image from "../../../../model/image.model";
import MetalTone from "../../../../model/master/attributes/metal/metalTone.model";
import { ActiveStatus, IMAGE_TYPE } from "../../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../../utils/shared-functions";

export const addMetalTones = async (req: Request) => {
    try {
    const { name, slug, created_by, sort_code, metal_master_id } = req.body
  
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.metalTone,
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
              image_type: IMAGE_TYPE.metalTone,
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
          sort_code: sort_code,
          created_date: getLocalDate(),
          created_by: req.body.session_res.id_app_user,
          id_metal: metal_master_id,
          id_image: idImage,
          is_active: ActiveStatus.Active,
          is_deleted: "0"
      }
  
      const metalToneNameExistes = await MetalTone.findOne({ where: { name: name, is_deleted: "0" } })
      const metalToneSlugExistes = await MetalTone.findOne({ where: { slug: slug,  is_deleted: "0" } })
      const metalToneSortCodeExistes = await MetalTone.findOne({ where: { sort_code: sort_code,  is_deleted: "0" } })

      if (metalToneNameExistes == null && metalToneSlugExistes == null && metalToneSortCodeExistes === null) {
        await MetalTone.create(
          payload,
          { transaction: trn }
        );
  
        await trn.commit();
          return resSuccess({data: payload});
      } else {
        await trn.rollback();

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

  export const getAllMetalTones = async (req: Request) => {

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
        const totalItems = await MetalTone.count({
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
  
      const result = await MetalTone.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
          "id",
          "name",
          "slug",
          "sort_code",
          [Sequelize.literal("image.image_path"), "image_path"],
          "created_date",
          "id_metal",
          "is_active",
          "created_by"
        ],
        include: [{ model: Image, as: "image", attributes: [] }],
      });
  
      return resSuccess({ data: noPagination ? result : { pagination, result } });
    } catch (error) {
      throw error;
    }


}

export const getByIdMetalTones = async (req: Request) => {
    try {
      const metalToneInfo = await MetalTone.findOne({ where: { id: req.params.id, is_deleted: "0" },  attributes: [
        "id",
        "name",
        "slug",
        "id_metal",
        "sort_code",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by"
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
  
      if (!(metalToneInfo && metalToneInfo.dataValues)) {
          return resNotFound();
        }
  
  
    return resSuccess({data: metalToneInfo});
    } catch (error) {
      throw error
      
    }
  }
  
export const updateMetalTones = async (req: Request) => {
      const {id, name, slug, sort_code, updated_by, metal_master_id} = req.body
    
    try {
        const metalToneId = await MetalTone.findOne({ where: { id: id, is_deleted: "0" } })
      if (metalToneId == null) {
        return resNotFound() 
      }

  let id_image = null;
  let imagePath = null;

  if (req.file) {
    const moveFileResult = await moveFileToS3ByType(dbContext,
      req.file,
      IMAGE_TYPE.metalTone,
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
          image_type: IMAGE_TYPE.metalTone,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      id_image = imageResult.dataValues.id;

    }

    const metalToneNameExistes = await MetalTone.findOne({ where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" } });
    const metalToneSlugExistes = await MetalTone.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });
    const metalToneSortCodeExistes = await MetalTone.findOne({ where: { sort_code: sort_code, id: { [Op.ne]: id }, is_deleted: "0" } })

    if (metalToneNameExistes == null && metalToneSlugExistes == null && metalToneSortCodeExistes === null) {
      if (id_image === null) {
        const metalToneInfo = await (MetalTone.update(
          {
            name: name,
            slug: slug,
            sort_code: sort_code,
            id_metal: metal_master_id,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
      
      { where: { id: id, is_deleted: "0" },  transaction: trn  }
    ));
    if (metalToneInfo) {
      const metalToneInformation = await MetalTone.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
      await trn.commit();
      return resSuccess({data: metalToneInformation})

    }
      } else {
        const metalToneInfo = await (MetalTone.update(
          {
            name: name,
            slug: slug,
            sort_code: sort_code,
            id_image: id_image,
            id_metal: metal_master_id,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
      
      { where: { id: id, is_deleted: "0" },  transaction: trn  }
    ));
    if (metalToneInfo) {
      const metalToneInformation = await MetalTone.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
      await trn.commit();
      return resSuccess({data: metalToneInformation})

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
  
  export const deleteMetalTones = async (req: Request) => {
  
      try {
          const metalToneExists = await MetalTone.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    
            if (!(metalToneExists && metalToneExists.dataValues)) {
              return resNotFound();
            }
            await MetalTone.update(
              {
                is_deleted: "1",
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
              },
              { where: { id: metalToneExists.dataValues.id } }
            );
        
            return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
      } catch (error) {
          throw error
      }
}
    
export const statusUpdateMetalTones = async (req: Request) => {
    try {
      const metalToneExists = await MetalTone.findOne({ where: { id: req.body.id, is_deleted: "0" } });
      if (metalToneExists) {
          const metalToneActionInfo = await (MetalTone.update(
              {
                  is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: metalToneExists.dataValues.id } }
          ));
          if (metalToneActionInfo) {
              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound();
      }
    } catch (error) {
      throw error
    }
}

export const metalToneDropDownData = async (req: Request) => {
  try {
    const metalData = await MetalTone.findAll({
      where: {id_metal: req.body.metal_master_id ,is_deleted: "0", is_active: "1"},
      attributes: [
          "id",
          "name",
          "slug",
          "created_date"
      ]
  })
  
  return resSuccess({data: metalData})
  } catch (error) {
    throw error
  }
  }