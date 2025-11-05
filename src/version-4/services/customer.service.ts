import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  USER_STATUS,
  USER_TYPE,
} from "../../utils/app-enumeration";
import {
  DATA_ALREADY_EXIST,
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageDeleteInDBAndS3,
  prepareMessageFromParams,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../utils/shared-functions";
import { PASSWORD_SOLT } from "../../utils/app-constants";
import { initModels } from "../model/index.model";

export const addCustomers = async (req: Request) => {
  try {
    
    const {
      full_name,
      last_name,
      email,
      mobile,
      password,
      country_id,
      created_by,
    } = req.body;
    const {Image,CustomerUser,AppUser} = initModels(req)
    const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));

    let imagePath = null;
    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        req.file,
        IMAGE_TYPE.customer,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await (req.body.db_connection).transaction();

    try {
      let idImage = null;
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.customer,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
        idImage = imageResult.dataValues.id;
      }

      const emailExistes = await CustomerUser.findOne({
        where: [columnValueLowerCase("email", email), { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }],
      });
      const emailidExistes = await AppUser.findOne({
        where: [columnValueLowerCase("username", email), { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id }],
      });
      const customerNumber = await CustomerUser.findOne({
        where: { mobile: mobile, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        transaction: trn,
      });

      if (customerNumber && customerNumber.dataValues) {
        await trn.rollback();

        return resErrorDataExit({
          message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
            ["field_name", "mobile"],
          ]),
        });
      }
      if (emailExistes == null && emailidExistes == null) {
        const appUserpayload = await AppUser.create(
          {
            username: email,
            pass_hash: pass_hash,
            user_type: USER_TYPE.Customer,
            user_status: USER_STATUS.Approved,
            is_email_verified: 1,
            created_date: getLocalDate(),
            id_role: 0,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
          },
          { transaction: trn }
        );

        const CustomerUserPayload = await CustomerUser.create(
          {
            full_name: full_name,
            last_name: last_name,
            email: email,
            id_app_user: appUserpayload.dataValues.id,
            mobile: mobile,
            country_id: country_id,
            created_date: getLocalDate(),
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            id_image: idImage,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
          },
          { transaction: trn }
        );
        await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: null,
          new_data: {
            app_user_id: appUserpayload?.dataValues?.id, app_user_data: {
              ...appUserpayload?.dataValues
            },
            customer_user_id: CustomerUserPayload?.dataValues?.id, customer_user_data: {
              ...CustomerUserPayload?.dataValues
            }
          }
        }], appUserpayload?.dataValues?.id, LogsActivityType.Add, LogsType.Customer, req?.body?.session_res?.id_app_user,trn)
    
        await trn.commit();
        return resSuccess({ data: CustomerUserPayload });
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
};

export const getAllCustomer = async (req: Request) => {
  try {
    const {Image,CustomerUser,AppUser} = initModels(req)

    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      {
        [Op.or]: [
          { full_name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { email: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { mobile: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: DeletedStatus.No,
      },
    ];

    const totalItems = await CustomerUser.count({
      where,
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const result = await CustomerUser.findAll({
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
      include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    return resSuccess({ data: { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdCustomer = async (req: Request) => {
  try {
    const {Image,CustomerUser,ProductSearchHistories} = initModels(req)

    const userInfo = await CustomerUser.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      attributes: [
        "id",
        "full_name",
        "email",
        "mobile",
        "country_id",
        "id_app_user",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
      ],
      include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });
    if (!(userInfo && userInfo.dataValues)) {
      return resNotFound();
    }
    const userRecentSearch = await ProductSearchHistories.findAll({
      where: { user_id: userInfo.dataValues.id_app_user,company_info_id :req?.body?.session_res?.client_id },
      limit: 10,
      order: [["modified_date", "DESC"]],
      attributes: ["id", "value"],
    });

    const data = {
      ...userInfo.dataValues,
      recent_search: userRecentSearch,
    };

    return resSuccess({
      data: data,
    });
  } catch (error) {
    throw error;
  }
};

export const updateCustomers = async (req: Request) => {
  const {
    full_name,
    last_name,
    email,
    mobile,
    image_delete = "0",
    country_id,
    id,
  } = req.body;
    const {Image,CustomerUser,AppUser} = initModels(req)

  try {
    const CustomerId = await CustomerUser.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (CustomerId == null) {
      return resNotFound();
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        req.file,
        IMAGE_TYPE.customer,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.customer,
            created_by: req.body.session_res.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      }
      const customerEmailExistes = await CustomerUser.findOne({
        where: [
          columnValueLowerCase("email", email),
          { id: { [Op.ne]: id } },
          { is_deleted: DeletedStatus.No },
          {company_info_id :req?.body?.session_res?.client_id}
        ],
      });
      const appUserEmailidExistes = await AppUser.findOne({
        where: [
          columnValueLowerCase("username", email),
          { id: { [Op.ne]: CustomerId.dataValues.id_app_user } },
          { is_deleted: DeletedStatus.No },
          {company_info_id :req?.body?.session_res?.client_id},
        ],
      });

      const customerNumber = await CustomerUser.findOne({
        where: {
          mobile: mobile,
          id: { [Op.ne]: id },
          is_deleted: DeletedStatus.No,
          company_info_id :req?.body?.session_res?.client_id,
        },
        transaction: trn,
      });

      if (customerNumber && customerNumber.dataValues) {
        await trn.rollback();

        return resErrorDataExit({
          message: prepareMessageFromParams(DATA_ALREADY_EXIST, [
            ["field_name", "mobile"],
          ]),
        });
      }
      if (customerEmailExistes == null && appUserEmailidExistes == null) {
        const appUserInfo = await AppUser.update(
          {
            username: email,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          },

          {
            where: { id: CustomerId.dataValues.id_app_user, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
        if (id_image === null) {
          const CustomerInfo = await CustomerUser.update(
            {
              full_name: full_name,
              email: email,
              mobile: mobile,
              country_id: country_id,
              id_image:
                image_delete == "1" ? null : CustomerId.dataValues.id_image,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user,
            },

            {
              where: { id: CustomerId.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            }
          );

          if (image_delete && image_delete == "1") {
            const findImage = await Image.findOne({
              where: { id: CustomerId.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            });
            await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
          }

          if (CustomerInfo) {
            const CustomerInformation = await CustomerUser.findOne({
              where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            });

            await addActivityLogs(req,req?.body?.session_res?.client_id,[{
              old_data: { customer_user_id: CustomerId?.dataValues?.id, app_customer_data: CustomerId?.dataValues},
              new_data: {
                customer_user_id: CustomerInformation?.dataValues?.id, data: { ...CustomerInformation?.dataValues }
              }
            }], CustomerId?.dataValues?.id,LogsActivityType.Edit, LogsType.Customer, req?.body?.session_res?.id_app_user,trn)
          
            await trn.commit();
            return resSuccess({ data: CustomerInformation });
          }
        } else {
          const CustomerInfo = await CustomerUser.update(
            {
              full_name: full_name,
              email: email,
              mobile: mobile,
              country_id: country_id,
              modified_date: getLocalDate(),
              modified_by: req.body.session_res.id_app_user,
              id_image: id_image,
            },

            {
              where: { id: CustomerId.dataValues.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            }
          );
          if (CustomerInfo) {
            const CustomerInformation = await CustomerUser.findOne({
              where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
              transaction: trn,
            });
            await addActivityLogs(req,req?.body?.session_res?.client_id,[{
              old_data: { customer_user_id: CustomerId?.dataValues?.id, app_customer_data: {...CustomerId?.dataValues}},
              new_data: {
                customer_user_id: CustomerInformation?.dataValues?.id, data: {  ...CustomerInformation?.dataValues }
              }
            }], CustomerId?.dataValues?.id,LogsActivityType.Edit, LogsType.Customer, req?.body?.session_res?.id_app_user,trn)
          
            await trn.commit();
            return resSuccess({ data: CustomerInformation });
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
    throw error;
  }
};

export const deleteCustomers = async (req: Request) => {
  try {
    const {Image,CustomerUser,AppUser} = initModels(req)

    const CustomersExists = await CustomerUser.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    const AppUserExists = await AppUser.findOne({
      where: { id: CustomersExists.dataValues.id_app_user, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(CustomersExists && CustomersExists.dataValues)) {
      return resNotFound();
    }
    const trn = await (req.body.db_connection).transaction();
    try {
      await AppUser.update(
        {
          is_deleted: DeletedStatus.yes,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        {
          where: { id: CustomersExists.dataValues.id_app_user,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        }
      );

      await CustomerUser.update(
        {
          is_deleted: DeletedStatus.yes,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: CustomersExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
      );

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { customer_id: CustomersExists?.dataValues?.id, customer_data:{... CustomersExists?.dataValues}, app_user_id: CustomersExists?.dataValues?.id, app_user_data: {...CustomersExists?.dataValues}},
        new_data: {
          customer_id: CustomersExists?.dataValues?.id, customer_data: {
            ...CustomersExists?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          },
          app_user_id: AppUserExists?.dataValues?.id, app_user_data: {
            ...AppUserExists?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          }
        }
      }], CustomersExists?.dataValues?.id, LogsActivityType.Delete, LogsType.Customer, req?.body?.session_res?.id_app_user,trn)
      
      await trn.commit();
      return resSuccess();
    } catch (error) {
      await trn.rollback();
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

export const statusUpdateCustomers = async (req: Request) => {
  try {
    const {Image,CustomerUser,AppUser} = initModels(req)

    const CustomersExists = await CustomerUser.findOne({
      where: { id: req.body.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    const AppUserExists = await AppUser.findOne({
      where: { id: CustomersExists.dataValues.id_app_user, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id},
    });
    if (!(CustomersExists && CustomersExists.dataValues)) {
      return resNotFound();
    }
    const trn = await (req.body.db_connection).transaction();
    try {
      await AppUser.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        {
          where: { id: CustomersExists.dataValues.id_app_user,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        }
      );

      await CustomerUser.update(
        {
          is_active: req.body.is_active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        { where: { id: CustomersExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
      );

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { customer_id: CustomersExists?.dataValues?.id, customer_data: {...CustomersExists?.dataValues}, app_user_id: CustomersExists?.dataValues?.id, app_user_data: {...CustomersExists?.dataValues}},
        new_data: {
          customer_id: CustomersExists?.dataValues?.id, customer_data: {
            ...CustomersExists?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          },
          app_user_id: AppUserExists?.dataValues?.id, app_user_data: {
            ...AppUserExists?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          }
        }
      }], CustomersExists?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Customer, req?.body?.session_res?.id_app_user,trn)
      
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (error) {
      await trn.rollback();
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
