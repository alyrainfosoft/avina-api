import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import dbContext from "../../config/db-context";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import AppUser from "../model/app-user.model";
import customerUser from "../model/customer-user.model";
import Image from "../model/image.model";
import { ActiveStatus, IMAGE_TYPE, USER_STATUS, USER_TYPE } from "../../utils/app-enumeration";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { columnValueLowerCase, getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess } from "../../utils/shared-functions";
import { PASSWORD_SOLT } from "../../utils/app-constants";

export const addCustomers = async (req: Request) => {
  try {
    const { full_name, last_name, email, mobile, password, country_id, created_by } = req.body
    const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));
  
      let imagePath = null;
      if (req.file) {
        const moveFileResult = await moveFileToS3ByType(dbContext,
          req.file,
          IMAGE_TYPE.customer,
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
              image_type: IMAGE_TYPE.customer,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );
          idImage = imageResult.dataValues.id;
        }
        
  
        const emailExistes = await customerUser.findOne({ where: [ columnValueLowerCase('email', email), {is_deleted: "0"}]})
        const emailidExistes = await AppUser.findOne({ where: [ columnValueLowerCase('username', email), {is_deleted: "0"}] })

        if(emailExistes == null && emailidExistes == null) {
          const appUserpayload =   await AppUser.create(
            {
              username: email,
              pass_hash: pass_hash,
              user_type: USER_TYPE.Customer,
              user_status: USER_STATUS.Approved,
              is_email_verified: 1,
              created_date: getLocalDate(),
              id_role: 3,
              created_by: req.body.session_res.id_app_user,
              is_active: ActiveStatus.Active,
              is_deleted: "0"
            },
              { transaction: trn }
            );
            console.log(appUserpayload);
            
          const CustomerUserPayload =   await customerUser.create(
            {
              full_name: full_name,
              last_name: last_name,
              email: email,
              id_app_user: appUserpayload.dataValues.id,
              mobile: mobile,
              country_id: country_id,
              created_date: getLocalDate(),
              created_by: req.body.session_res.id_app_user,
              id_image: idImage,
              is_active: ActiveStatus.Active,
              is_deleted: "0"
            },
            { transaction: trn }
          );
            
          await trn.commit();
          return resSuccess({data: CustomerUserPayload});

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

export const getAllCustomer = async (req: Request) => {
    try {

        let pagination: IQueryPagination = {
            ...getInitialPaginationFromQuery(req.query),
          };
        
          let where = [
            { is_deleted: "0" },
            {
              [Op.or]: [
                  { full_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                  { email: { [Op.iLike]: "%" + pagination.search_text + "%" } },
                  { mobile: { [Op.iLike]: "%" + pagination.search_text + "%" } },

              ],
              is_deleted : "0"
          }
          ];
      
          const totalItems = await customerUser.count({
            where,
          });
      
          if (totalItems === 0) {
            return resSuccess({ data: { pagination, result: [] } });
          }
          pagination.total_items = totalItems;
          pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

          const result = await customerUser.findAll({
            where,
            limit: pagination.per_page_rows,
            offset: (pagination.current_page - 1) * pagination.per_page_rows,
            order: [[pagination.sort_by, pagination.order_by]],
            attributes: [
              "id",
              "full_name",
              "email",
              "mobile",
              "country_id",
              [Sequelize.literal("image.image_path"), "image_path"],
              "created_date",
              "is_active",
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          });

        return resSuccess({ data: { pagination, result } })

    } catch (error) {
        throw error
    }

}

export const getByIdCustomer = async (req: Request) => {
  try {
    const testimonialInfo = await customerUser.findOne({ where: { id: req.params.id, is_deleted: "0" }, 
        attributes: [
        "id",
        "full_name",
        "email",
        "mobile",
        "country_id",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    if (!(testimonialInfo && testimonialInfo.dataValues)) {
        return resNotFound();
      }


  return resSuccess({data: testimonialInfo});
  } catch (error) {
    throw error
    
  }
}

export const updateCustomers = async (req: Request) => {
  const { full_name, last_name, email, mobile, updated_by, country_id, id } = req.body


try {

    const CustomerId = await customerUser.findOne({ where: { id: id, is_deleted: "0" } })
 
    console.log(CustomerId)

  if (CustomerId == null) {
    return resNotFound() 
  }

  let id_image = null;
  let imagePath = null;

  if (req.file) {
    const moveFileResult = await moveFileToS3ByType(dbContext,
      req.file,
      IMAGE_TYPE.customer,
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
          image_type: IMAGE_TYPE.customer,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      id_image = imageResult.dataValues.id;

    }
    const customerEmailExistes = await customerUser.findOne({ where: [ columnValueLowerCase('email', email),{ id: { [Op.ne]: id }}, {is_deleted: "0"}]})
    const appUserEmailidExistes = await AppUser.findOne({ where: [ columnValueLowerCase('username', email),{ id: {[Op.ne]: CustomerId.dataValues.id_app_user}}, {is_deleted: "0"}]})
    if (customerEmailExistes == null && appUserEmailidExistes == null) {
      const appUserInfo = await (AppUser.update(
        {
          username: email,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        },
        
        { where: { id: CustomerId.dataValues.id_app_user, is_deleted: "0" },  transaction: trn  }
      ));
        if (id_image === null) {
          const CustomerInfo = await (customerUser.update(
            {
              full_name: full_name,
              email: email,
              mobile: mobile,
              country_id: country_id,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user
            },
            
            { where: { id: CustomerId.dataValues.id, is_deleted: "0" },  transaction: trn  }
          ));
          if (CustomerInfo) {
            const CustomerInformation = await customerUser.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
            await trn.commit();
            return resSuccess({data: CustomerInformation})
    
          }
        } else {
          const CustomerInfo = await (customerUser.update(
            {
              full_name: full_name,
              email: email,
              mobile: mobile,
              country_id: country_id,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user,
              id_image: id_image,
            },
            
            { where: { id: CustomerId.dataValues.id, is_deleted: "0" },  transaction: trn  }
          ));
          if (CustomerInfo) {
            const CustomerInformation = await customerUser.findOne({ where: { id: id, is_deleted: "0" }, transaction: trn })
            await trn.commit();
            return resSuccess({data: CustomerInformation})
    
          }
        }

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

export const deleteCustomers = async (req: Request) => {

  try {
      const CustomersExists = await customerUser.findOne({ where: { id: req.body.id, is_deleted: "0" } });

        if (!(CustomersExists && CustomersExists.dataValues)) {
          return resNotFound();
        }
  const trn = await dbContext.transaction();
        try {
          await AppUser.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: CustomersExists.dataValues.id_app_user }, transaction: trn  }
          );

          await customerUser.update(
            {
              is_deleted: "1",
              modified_by: req.body.session_res.id_app_user,
              modified_date: getLocalDate(),
            },
            { where: { id: CustomersExists.dataValues.id }, transaction: trn  }
          );
          await trn.commit();
          return resSuccess();

        } catch (error) {
          await trn.rollback();
          throw error
        }

  } catch (error) {
      throw error
  }
}

export const statusUpdateCustomers = async (req: Request) => {
try {
  const CustomersExists = await customerUser.findOne({ where: { id: req.body.id, is_deleted: "0" } });
  if (!(CustomersExists && CustomersExists.dataValues)) {
    return resNotFound();
  }
  const trn = await dbContext.transaction();

    try {
      await (AppUser.update(
        {
            is_active: req.body.is_active,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
        },
        { where: { id: CustomersExists.dataValues.id_app_user }, transaction: trn  }
    ));

      await (customerUser.update(
        {
            is_active: req.body.is_active,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
        },
        { where: { id: CustomersExists.dataValues.id }, transaction: trn  }
    ));
        await trn.commit();
        return resSuccess({message: RECORD_UPDATE_SUCCESSFULLY})
    } catch (error) {
      await trn.rollback();
      throw error
    }


} catch (error) {
  throw error
}
}
