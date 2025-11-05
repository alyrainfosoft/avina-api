import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import dbContext from "../config/db-context";
import { IQueryPagination } from "../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../helpers/file.helper";
import categoryData from "../model/category.model";
import Image from "../model/image.model";
import { ActiveStatus, IMAGE_TYPE, searchableCategory } from "../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, Id_IS_REQUIRED, RECORD_UPDATE_SUCCESSFULLY } from "../utils/app-messages";
import { getInitialPaginationFromQuery, getLocalDate, resBadRequest, resErrorDataExit, resNotFound, resSuccess } from "../utils/shared-functions";

// export const addCategory = async (req: Request) => {
//     const {parent_id ,name, position, slug, created_by } = req.body
//     try {
//         const payload = {
//             parent_id: parent_id,
//             slug: slug,
//             category_name: name,
//             position: position,
//             created_date: getLocalDate(),
//             created_by: created_by,
//             is_searchable: searchableCategory.searchable,
//             is_active: ActiveStatus.Active,
//             is_deleted: "0"
//         }

//         const categoryNameExistes = await categoryData.findOne({ where: { category_name: name, parent_id: { [Op.eq]: parent_id } } })

//         // const categoryNameExistes = await categoryData.findOne({where: {[Op.and]: {slug: name, parent_id: parent_id} }})
        
//         if (categoryNameExistes === null) {
//             await categoryData.create(payload)

//             return resSuccess({data: payload});
//         } else {
//             return resErrorDataExit();
//         }
//     } catch (error) {
//         console.log("error", error);
        
//         throw (error)
//     }
// }


export const addCategory = async (req: Request) => {
  try {
  const {parent_id ,name, position, slug, created_by, is_setting_style, is_size, is_length, id_size, id_length } = req.body

    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(
        dbContext,
        req.file,
        IMAGE_TYPE.category,
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
            image_type: IMAGE_TYPE.category,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }
      const payload = {
        parent_id: parent_id,
        slug: slug,
        category_name: name,
        position: position,
        created_date: getLocalDate(),
        created_by: req.body.session_res.id_app_user,
        id_image: idImage,
        is_setting_style: is_setting_style,
        is_size: is_size,
        is_length: is_length,
        id_size: id_size.join("|"),
        id_length: id_length && id_length.join("|"),
        is_searchable: searchableCategory.searchable,
        is_active: ActiveStatus.Active,
        is_deleted: "0"
    }

    const categoryNameExistes = await categoryData.findOne({ where: { category_name: name, parent_id: { [Op.eq]: parent_id }, is_deleted: "0" } })
    const categorySlugExistes = await categoryData.findOne({ where: { slug: slug,  is_deleted: "0" } })
    if (categoryNameExistes === null && categorySlugExistes === null) {
      await categoryData.create(
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

export const getAllCategory = async (req: Request) => {
    try {

          let where = [
            { is_deleted: "0" },
          ];
      
          const totalItems = await categoryData.count({
            where,
          });

          const result = await categoryData.findAll({
            where,
            attributes: [
              "id",
              "parent_id",
              "category_name",
              "slug",
              "position",
              "is_setting_style",
              "is_size",
              "is_length",
              [
                Sequelize.literal(
                  `CASE WHEN "id_size" IS NULL THEN '{}'::int[] ELSE string_to_array("id_size", '|')::int[] END`
                ),
                "id_size",
              ],
              [
                Sequelize.literal(
                  `CASE WHEN "id_length" IS NULL THEN '{}'::int[] ELSE string_to_array("id_length", '|')::int[] END`
                ),
                "id_length",
              ],
              [Sequelize.literal("image.image_path"), "image_path"],
              "is_searchable",
              "created_date",
              "is_active",
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          });

        return resSuccess({ data:  result  })

    } catch (error) {
        throw error
    }

}

export const getAllMainCategory = async (req: Request) => {
  try {
    const maincategoryList = await categoryData.findAll({
      where: {
          parent_id: {
          [Op.eq]: null
        },
        is_deleted: "0"
      },
      attributes: [
        "id",
        "parent_id",
        "category_name",
        "slug",
        "position",
        "is_setting_style",
        "is_size",
        "is_length",
        [
          Sequelize.literal(
            `CASE WHEN "id_size" IS NULL THEN '{}'::int[] ELSE string_to_array("id_size", '|')::int[] END`
          ),
          "id_size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "id_length" IS NULL THEN '{}'::int[] ELSE string_to_array("id_length", '|')::int[] END`
          ),
          "id_length",
        ],
        [Sequelize.literal("image.image_path"), "image_path"],
        "is_searchable",
        "created_date",
        "is_active",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });

  return resSuccess({data: maincategoryList});
  } catch (error) {
    throw error
    
  }
}

export const getAllSubCategory = async (req: Request) => {
  try {
    if(req.body.parent_id != null) {
      const subCategoryList = await categoryData.findAll({
        where: {
            parent_id: {
            [Op.eq]: req.body.parent_id
          },
          is_active: "1",
          is_deleted: "0"
        },
        attributes: [
          "id",
          "parent_id",
          "category_name",
          "slug",
          "position",
          "is_setting_style",
          "is_size",
          "is_length",
          [
            Sequelize.literal(
              `CASE WHEN "id_size" IS NULL THEN '{}'::int[] ELSE string_to_array("id_size", '|')::int[] END`
            ),
            "id_size",
          ],
          [
            Sequelize.literal(
              `CASE WHEN "id_length" IS NULL THEN '{}'::int[] ELSE string_to_array("id_length", '|')::int[] END`
            ),
            "id_length",
          ],
          [Sequelize.literal("image.image_path"), "image_path"],
          "is_searchable",
          "created_date",
          "is_active",
        ],
        include: [{ model: Image, as: "image", attributes: [] }],
      });
  
    return resSuccess({data: subCategoryList});
    } else {
      return resBadRequest({message: Id_IS_REQUIRED});
    }

  } catch (error) {
    throw error
    
  }
}

export const updateCategory = async (req: Request) => {
  const {id, name, parent_id, position, slug, updated_by, is_setting_style, is_size, is_length, id_size, id_length} = req.body

try {

    const CategoryId = await categoryData.findOne({ where: { id: id, is_deleted: "0" } })

  if (CategoryId == null) {
    return resNotFound() 
  }

  let id_image = null;
  let imagePath = null;

  if (req.file) {
    const moveFileResult = await moveFileToS3ByType(
      dbContext,
      req.file,
      IMAGE_TYPE.category,
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
          image_type: IMAGE_TYPE.category,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      id_image = imageResult.dataValues.id;

    }


    const categoryNameExistes = await categoryData.findOne({ where: { category_name: name, id: { [Op.ne]: id }, parent_id: { [Op.eq]: parent_id }, is_deleted: "0" } });
    
    if (categoryNameExistes == null) {
      if (id_image === null) {
        const CategoryInfo = await (categoryData.update(
          {
            category_name: name,
            parent_id: parent_id,
            slug: slug,
            position: position,
            modified_date: getLocalDate(),
            is_setting_style: is_setting_style,
            is_size: is_size,
            is_length: is_length,
            id_size: id_size && id_size.join("|"),
            id_length:  id_length && id_length.join("|"),
            modified_by: req.body.session_res.id_app_user
          },
          
          { where: { id: id, is_deleted: "0" },  transaction: trn  }
        ));
        if (CategoryInfo) {
          const CategoryInformation = await categoryData.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
          await trn.commit();
          return resSuccess({data: CategoryInformation})
  
        }
      } else {
        const CategoryInfo = await (categoryData.update(
          {
            category_name: name,
            parent_id: parent_id,
            slug: slug,
            position: position,
            id_image: id_image,
            is_setting_style: is_setting_style,
            is_size: is_size,
            is_length: is_length,
            id_size: id_size && id_size.join("|"),
            id_length: id_length && id_length.join("|"),
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          },
          
          { where: { id: id, is_deleted: "0" },  transaction: trn  }
        ));
        if (CategoryInfo) {
          const CategoryInformation = await categoryData.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
          await trn.commit();
          return resSuccess({data: CategoryInformation})
  
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
    console.log("e", e)
    throw e;
  }

} catch (error) {

  throw(error);
}

}

export const deleteCategory = async (req: Request) => {

  try {
      const CategoryExists = await categoryData.findOne({ where: { id: req.body.id, is_deleted: "0" } });

      console.log(CategoryExists)

        if (!(CategoryExists && CategoryExists.dataValues)) {
          return resNotFound();
        }
        await categoryData.update(
          {
            is_deleted: "1",
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: CategoryExists.dataValues.id } }
        );
    
        return resSuccess();
  } catch (error) {
      throw error
  }
}

export const statusUpdateCategory = async (req: Request) => {
try {
  const CategoryExists = await categoryData.findOne({ where: { id: req.body.id, is_deleted: "0" } });
  if (CategoryExists) {
      const CategoryActionInfo = await (categoryData.update(
          {
              is_active: req.body.is_active,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user
          },
          { where: { id: CategoryExists.dataValues.id } }
      ));
      if (CategoryActionInfo) {
          return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
      } 
  } else {
      return resNotFound();
  }
} catch (error) {
  throw error
}
}

export const searchablesCategory = async (req: Request) => {
  try {
    const CategoryExists = await categoryData.findOne({ where: { id: req.body.id } });
    if (CategoryExists) {
        const CategoryActionInfo = await (categoryData.update(
            {
              is_searchable: req.body.is_searchable,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user
            },
            { where: { id: CategoryExists.dataValues.id } }
        ));
        if (CategoryActionInfo) {
            return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
        } 
    } else {
        return resNotFound();
    }
  } catch (error) {
    throw error
  }
  }
