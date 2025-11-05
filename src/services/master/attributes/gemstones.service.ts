import { Request } from "express";
import { Sequelize, Op } from "sequelize";
import dbContext from "../../../config/db-context";
import { IQueryPagination } from "../../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../../helpers/file.helper";
import Image from "../../../model/image.model";
import Gemstones from "../../../model/master/attributes/gemstones.model";
import { ActiveStatus, IMAGE_TYPE } from "../../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY } from "../../../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../../utils/shared-functions";

export const addGemstones = async (req: Request) => {
    try {
    const { name, slug, sort_code, created_by } = req.body
  
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.gemstones,
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
              image_type: IMAGE_TYPE.gemstones,
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
          id_image: idImage,
          is_active: ActiveStatus.Active,
          is_deleted: "0"
      }
  
      const gemstoneNameExistes = await Gemstones.findOne({ where: { name: name, is_deleted: "0" }, transaction: trn })
      const gemstoneSlugExistes = await Gemstones.findOne({ where: { slug: slug,  is_deleted: "0" }, transaction: trn })
      const gemstoneCodeExistes = await Gemstones.findOne({ where: { sort_code: sort_code,  is_deleted: "0" }, transaction: trn })
      if (gemstoneNameExistes === null && gemstoneSlugExistes === null && gemstoneCodeExistes === null) {
        await Gemstones.create(
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

  export const getAllGemstones = async (req: Request) => {
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
        const totalItems = await Gemstones.count({
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
  
      const result = await Gemstones.findAll({
        ...paginationProps,
        where,
        order: [[pagination.sort_by, pagination.order_by]],
        attributes: [
          "id",
          "name",
          "sort_code",
          "slug",
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

export const getByIdGemstones = async (req: Request) => {
    try {
      const GemstonesInfo = await Gemstones.findOne({ where: { id: req.params.id, is_deleted: "0" },  attributes: [
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
  
      if (!(GemstonesInfo && GemstonesInfo.dataValues)) {
          return resNotFound();
        }
  
  
    return resSuccess({data: GemstonesInfo});
    } catch (error) {
      throw error
      
    }
  }
  
export const updateGemstones = async (req: Request) => {
      const {id, name, slug, sort_code, updated_by} = req.body
    
    try {
    
        const gemstonesId = await Gemstones.findOne({ where: { id: id, is_deleted: "0" } })
      console.log(gemstonesId)
      if (gemstonesId == null) {
        return resErrorDataExit() 
      }

  let id_image = null;
  let imagePath = null;

  if (req.file) {
    const moveFileResult = await moveFileToS3ByType(dbContext,
      req.file,
      IMAGE_TYPE.gemstones,
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
          image_type: IMAGE_TYPE.gemstones,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      id_image = imageResult.dataValues.id;

    }

    const gemstonesNameExistes = await Gemstones.findOne({ where: { name: name, id: { [Op.ne]: id }, is_deleted: "0" } });
    const gemstonesSlugExistes = await Gemstones.findOne({ where: { slug: slug, id: { [Op.ne]: id }, is_deleted: "0" } });
    const gemstoneCodeExistes = await Gemstones.findOne({ where: { sort_code: sort_code, id: { [Op.ne]: id },  is_deleted: "0" }, transaction: trn })

    if (gemstonesNameExistes === null && gemstonesSlugExistes === null && gemstoneCodeExistes === null) {
      if(id_image === null) {
        const gemstonesInfo = await (Gemstones.update(
          {
            name: name,
            slug: slug,
            sort_code: sort_code,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },
      
      { where: { id: id, is_deleted: "0" },  transaction: trn  }
    ));
    
    if (gemstonesInfo) {
      const gemstonesInformation = await Gemstones.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
      await trn.commit();
      return resSuccess({data: gemstonesInformation})

    }else {
      await trn.rollback();
      return resErrorDataExit()
  }
  } else {
    const gemstonesInfo = await (Gemstones.update(
      {
        name: name,
        slug: slug,
        sort_code: sort_code,
        id_image: id_image,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
  
  { where: { id: id, is_deleted: "0" },  transaction: trn  }
));

if (gemstonesInfo) {
  const gemstonesInformation = await Gemstones.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
  await trn.commit();
  return resSuccess({data: gemstonesInformation})

}
  }
  }else {
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
  
  export const deleteGemstones = async (req: Request) => {
  
      try {
          const gemstonesExists = await Gemstones.findOne({ where: { id: req.body.id, is_deleted: "0" } });
    
            if (!(gemstonesExists && gemstonesExists.dataValues)) {
              return resNotFound();
            }
            await Gemstones.update(
              {
                is_deleted: "1",
                modified_by: req.body.session_res.id_app_user,
                modified_date: getLocalDate(),
              },
              { where: { id: gemstonesExists.dataValues.id } }
            );
        
            return resSuccess({message: RECORD_DELETE_SUCCESSFULLY});
      } catch (error) {
          throw error
      }
}
    
export const statusUpdateGemstones = async (req: Request) => {
    try {
      const gemstonesExists = await Gemstones.findOne({ where: { id: req.body.id, is_deleted: "0" } });
      if (gemstonesExists) {
          const GemstonesActionInfo = await (Gemstones.update(
              {
                  is_active: req.body.is_active,
                  modified_date: getLocalDate(),
                  modified_by: req.body.session_res.id_app_user
              },
              { where: { id: gemstonesExists.dataValues.id } }
          ));
          if (GemstonesActionInfo) {
              return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
          } 
      } else {
          return resNotFound();
      }
    } catch (error) {
      throw error
    }
}