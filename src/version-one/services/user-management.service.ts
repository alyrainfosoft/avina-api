import { Request } from "express";
import { literal, Op, Sequelize, Transaction } from "sequelize";
import {
  addActivityLogs,
  columnValueLowerCase,
  getDecryptedText,
  getInitialPaginationFromQuery,
  getLocalDate,
  resBadRequest,
  resNotFound,
  resSuccess,
  superAdminWhere,
} from "../../utils/shared-functions";
import bcrypt from "bcrypt";
import { PASSWORD_SOLT, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY } from "../../utils/app-constants";
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
  DEFAULT_STATUS_CODE_SUCCESS,
  EMAIL_ALREADY_EXIST,
  INVALID_ID,
  ROLE_NOT_FOUND,
  USER_NOT_FOUND,
} from "../../utils/app-messages";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import { initModels } from "../model/index.model";

const checkBURoleAndEmailAvailability = async (
  idRole: number,
  email: string | null = null,
  trn: Transaction | null = null,
  ignoredId: number | null = null,
  client_id: number,
  req: Request
) => {
  const { Role,AppUser } = initModels(req);
  const findRole = await Role.findOne({
    where: { id: idRole, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    ...(trn ? { transaction: trn } : {}),
  });

  if (!(findRole && findRole.dataValues)) {
    return resNotFound({ message: ROLE_NOT_FOUND });
  }

  if (email) {
    const findUserWithEmail = await AppUser.findOne({
      where: [
        columnValueLowerCase("username", email),
        { is_deleted: DeletedStatus.No },
        {company_info_id :client_id},
        ignoredId ? { id: { [Op.ne]: ignoredId } } : {},
      ],
      ...(trn ? { transaction: trn } : {}),
    });

    if (findUserWithEmail && findUserWithEmail.dataValues) {
      return resNotFound({ message: EMAIL_ALREADY_EXIST });
    }
  }
  return resSuccess();
};

export const getAllBusinessUsers = async (req: Request) => {
  try {
    const { Role,AppUser,BusinessUser,Image } = initModels(req);

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };

    const updateRoleserdata =  await AppUser.findOne({where:{id:req?.body?.session_res?.id_app_user}});

    if(!updateRoleserdata){
      return resNotFound();
    }

    const isSuperAdmin = updateRoleserdata?.getDataValue('is_super_admin') === true;

    let where = [
      ...(isSuperAdmin
        ? [
            {
              company_info_id: {
                [Op.or]: [req?.body?.session_res?.client_id, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY], // Super admin sees their company + global
              },
            },
          ]
        : [
            { company_info_id: req?.body?.session_res?.client_id },
            Sequelize.literal(`NOT EXISTS (
            SELECT 1 
            FROM app_users 
            INNER JOIN roles ON roles.id = app_users.id_role
            WHERE (roles.is_super_admin = true OR roles.is_sub_admin = true)
            AND app_users.id = "business_users"."id_app_user"
            )`),
          ]),
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              {name: { [Op.iLike]: `%${pagination.search_text}%` }},
              {email: { [Op.iLike]: `%${pagination.search_text}%` }},
              {phone_number: { [Op.iLike]: `%${pagination.search_text}%` }},
              Sequelize.where(Sequelize.literal('"app_user->role"."role_name"'), "ILIKE", `%${pagination.search_text}%`),
            ],
          }
        : {},
    ];
    const totalItems = await BusinessUser.count({
      where,
      include: [
        { model: AppUser, as: "app_user", attributes: [], required:false ,
          include:[{ model:Role, as:'role',attributes: [], required:false}]
        },
        { model: Image, as: "image", attributes: [], required:false },
      ]
    });

    if (totalItems === 0) {
      return resSuccess({ data: { pagination, result: [] } });
    }
    pagination.total_items = totalItems;
    pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

    const result = await BusinessUser.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      include: [
        { model: AppUser, as: "app_user", attributes: [], required:false ,
          include:[{ model:Role, as:'role',attributes: [], required:false}]
        },
        { model: Image, as: "image", attributes: [], required:false },
      ],
      attributes: [
        "id",
        "name",
        "email",
        "phone_number",
        "is_active",
        [Sequelize.literal("app_user.id_role"), "id_role"],
        [Sequelize.col("app_user.role.role_name"), "role_name"],
        [Sequelize.literal("image.image_path"), "image_path"],
        [
          Sequelize.literal(`(
            SELECT username 
            FROM app_users 
            WHERE app_users.id = business_users.created_by
          )`),
          "created_by_username"
        ],
        [Sequelize.literal("app_user.is_super_admin"),"is_super_admin"],
      ],
    });
    return resSuccess({ data: { pagination, result } });
  } catch (e) {
    throw e;
  }
};

export const getBusinessUserById = async (req: Request) => {
  try {
    const { BusinessUser, AppUser, Role } = initModels(req);
    let idBusinessUser = getDecryptedText(req.params.id);
    if (!idBusinessUser) return resBadRequest({ message: INVALID_ID });
    idBusinessUser = parseInt(idBusinessUser);

    const result = await BusinessUser.findOne({
      where: { id: idBusinessUser, is_deleted: DeletedStatus.No },
      include: { model: AppUser, as: "app_user", attributes: [], required:false ,
      include:[{ model:Role, as:'role',attributes: [], required:false}]
    },
      attributes: [
        "id",
        "name",
        "email",
        "phone_number",
        "is_active",
        [Sequelize.literal("app_user.is_super_admin"),"is_super_admin"],
        [Sequelize.literal("app_user.id_role"), "id_role"],
        [Sequelize.col("app_user.role.role_name"), "role_name"],
      ],
    });

    if (result) {
      return resSuccess({ data: result });
    }

    return resNotFound({ message: USER_NOT_FOUND });
  } catch (e) {
    throw e;
  }
};

export const addBusinessUser = async (req: Request) => {
  const trn = await (req.body.db_connection).transaction();
  const { BusinessUser, AppUser, Role, Image } = initModels(req);
  try {
    const { email, password, name, phone_number, id_role, is_active } =
      req.body;
    let idImage = null;
    const appUser = await AppUser.findOne({
      where: { id: req?.body?.session_res?.id_app_user, is_deleted: DeletedStatus.No ,...superAdminWhere(req?.body?.session_res?.client_id) },
      transaction: trn,
    });

    if (!appUser) {
      await trn.rollback();
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const findRole = await Role.findOne({
      where: { id: id_role, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      ...(trn ? { transaction: trn } : {}),
    });
    const roleEmailChecker = await checkBURoleAndEmailAvailability(
      id_role,
      email,
      trn,
      null,
      appUser?.dataValues?.is_super_admin ? [req?.body?.session_res?.client_id, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY] : req?.body?.session_res?.client_id,
      req
    );

    if (roleEmailChecker.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return roleEmailChecker;
    }

    const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        req.file,
        IMAGE_TYPE.profile,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return moveFileResult;
      }

      const imageResult = await Image.create(
        {
          image_path: moveFileResult.data,
          image_type: IMAGE_TYPE.profile,
          created_by: req.body.session_res.id_app_user, 
          company_info_id: req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      idImage = imageResult.dataValues.id;
    }
    const resultAU = await AppUser.create(
      {
        username: email,
        pass_hash,
        id_role,
        user_type: USER_TYPE.BusinessUser,
        is_super_admin:findRole?.dataValues?.is_super_admin,
        user_status: USER_STATUS.Approved,
        is_email_verified: "1",
        is_active,
        created_by: req.body.session_res.id_app_user, 
        company_info_id:findRole?.dataValues?.is_super_admin == true ? SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY : req?.body?.session_res?.client_id,
        created_date: getLocalDate(),
      },
      { transaction: trn }
    );

    const businessUser = await BusinessUser.create(
      {
        id_app_user: resultAU.dataValues.id,
        name,
        email,
        phone_number,
        is_active,
        id_image: idImage,
        created_by: req.body.session_res.id_app_user, 
        company_info_id:findRole?.dataValues?.is_super_admin == true ? SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY : req?.body?.session_res?.client_id,
        created_date: getLocalDate(),
      },
      { transaction: trn }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        app_user_id: resultAU?.dataValues?.id, app_user_data: {
          ...resultAU?.dataValues
        },
        business_user_id: businessUser?.dataValues?.id, business_user_data: {
          ...businessUser?.dataValues
        }
      }
    }], resultAU?.dataValues?.id, LogsActivityType.Add, LogsType.UserManagement, req?.body?.session_res?.id_app_user,trn)
    
    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};

export const updateBusinessUser = async (req: Request) => {
  const trn = await (req.body.db_connection).transaction();
  const { BusinessUser, AppUser, Role, Image } = initModels(req);

  try {
    const { name, phone_number, id_role, is_active } = req.body;
    let idImage = null;
    const appUser = await AppUser.findOne({
      where: { id: req?.body?.session_res?.id_app_user, is_deleted: DeletedStatus.No ,...superAdminWhere(req?.body?.session_res?.client_id) },
      transaction: trn,
    });

    if (!appUser) {
      await trn.rollback();
      return resNotFound({ message: USER_NOT_FOUND });
    }
    const isSuperAdmin = !appUser?.dataValues?.is_super_admin ? {company_info_id : req?.body?.session_res?.client_id} :{}; 


    const findRole = await Role.findOne({
      where: { id: id_role, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active},
      ...(trn ? { transaction: trn } : {}),
    });

    let idBusinessUser = getDecryptedText(req.params.id);
    if (!idBusinessUser) return resBadRequest({ message: INVALID_ID });
    idBusinessUser = parseInt(idBusinessUser);

    const buToUpdate = await BusinessUser.findOne({
      where: { id: idBusinessUser, is_deleted: DeletedStatus.No,...isSuperAdmin },
      transaction: trn,
    });

    if (!(buToUpdate && buToUpdate.dataValues)) {
      await trn.rollback();
      return resNotFound({ message: USER_NOT_FOUND });
    }

    if (req.body.only_active_inactive === "1") {
      await AppUser.update(
        {
          is_active,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: buToUpdate.dataValues.id_app_user,...isSuperAdmin }, transaction: trn }
      );

      await BusinessUser.update(
        {
          is_active,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: buToUpdate.dataValues.id ,...isSuperAdmin}, transaction: trn }
      );

      const afterupdateToUpdate = await AppUser.findOne({
        where: { id: idBusinessUser, is_deleted: DeletedStatus.No },
        transaction: trn,
      });
  
      const CustomerInformation = await BusinessUser.findOne({
        where: { id: buToUpdate.dataValues.id, is_deleted: DeletedStatus.No },
        transaction: trn,
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { app_user_id: buToUpdate?.dataValues?.id, app_user_data: {...buToUpdate?.dataValues} ,business_id: buToUpdate?.dataValues?.id, business_data: {...buToUpdate?.dataValues}  },
        
        new_data: { app_user_id: afterupdateToUpdate?.dataValues?.id, app_user_data: {...afterupdateToUpdate?.dataValues} ,business_id: CustomerInformation?.dataValues?.id, business_data:{... CustomerInformation?.dataValues}  },

      }], buToUpdate?.dataValues?.id,LogsActivityType.Edit, LogsType.UserManagement, req?.body?.session_res?.id_app_user,trn)
    
      await trn.commit();
      return resSuccess();
    }

    if (buToUpdate.dataValues.id_role !== id_role) {

     
      const roleEmailChecker = await checkBURoleAndEmailAvailability(
        id_role,
        null,
        trn,
        null,
        appUser?.dataValues?.is_super_admin ? [req?.body?.session_res?.client_id, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY] : req?.body?.session_res?.client_id,
        req
      );

      if (roleEmailChecker.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return roleEmailChecker;
      }
    }

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(req.body.db_connection,
        req.file,
        IMAGE_TYPE.profile,
        req?.body?.session_res?.client_id,
        req
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return moveFileResult;
      }

      if (buToUpdate.dataValues.id_image) {
        idImage = buToUpdate.dataValues.id_image;
        await Image.update(
          {
            image_path: moveFileResult.data,
            image_type: IMAGE_TYPE.profile,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          },
          { where: { id: buToUpdate.dataValues.id_image,...isSuperAdmin }, transaction: trn }
        );
      } else {
        const imageResult = await Image.create(
          {
            image_path: moveFileResult.data,
            image_type: IMAGE_TYPE.profile,
            created_by: req.body.session_res.id_app_user, 
            company_info_id: req?.body?.session_res?.client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        idImage = imageResult.dataValues.id;
      }
    }

    await AppUser.update(
      {
        is_active,
        id_role,
        user_type: USER_TYPE.BusinessUser,
        is_super_admin:findRole?.dataValues?.is_super_admin,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
        company_info_id:findRole?.dataValues?.is_super_admin == true ? SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY : req?.body?.session_res?.client_id,
      },
      { where: { id: buToUpdate.dataValues.id_app_user,...isSuperAdmin }, transaction: trn }
    );

    await BusinessUser.update(
      {
        name,
        phone_number,
        is_active,
        id_image: idImage,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
        company_info_id:findRole?.dataValues?.is_super_admin == true ? SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY : req?.body?.session_res?.client_id,

      },
      { where: { id: buToUpdate.dataValues.id,...isSuperAdmin }, transaction: trn }
    );
    const afterupdateToUpdate = await AppUser.findOne({
      where: { id: idBusinessUser, is_deleted: DeletedStatus.No },
      transaction: trn,
    });

    const CustomerInformation = await BusinessUser.findOne({
      where: { id: buToUpdate.dataValues.id, is_deleted: DeletedStatus.No },
      transaction: trn,
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { app_user_id: buToUpdate?.dataValues?.id, app_user_data: {...buToUpdate?.dataValues} ,business_id: buToUpdate?.dataValues?.id, business_data: {...buToUpdate?.dataValues}  },
      
      new_data: { app_user_id: afterupdateToUpdate?.dataValues?.id, app_user_data: {...afterupdateToUpdate?.dataValues} ,business_id: CustomerInformation?.dataValues?.id, business_data: {...CustomerInformation?.dataValues}  },

    }], buToUpdate?.dataValues?.id,LogsActivityType.Edit, LogsType.UserManagement, req?.body?.session_res?.id_app_user,trn)
  
    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};

export const deleteBusinessUser = async (req: Request) => {
  const trn = await (req.body.db_connection).transaction();
  const { BusinessUser, AppUser, Role, Image } = initModels(req);

  try {
    let idBusinessUser = getDecryptedText(req.params.id);
    if (!idBusinessUser) return resBadRequest({ message: INVALID_ID });
    idBusinessUser = parseInt(idBusinessUser);
    const appUser = await AppUser.findOne({
      where: { id: req?.body?.session_res?.id_app_user, is_deleted: DeletedStatus.No ,...superAdminWhere(req?.body?.session_res?.client_id) },
      transaction: trn,
    });

    const isSuperAdmin = !appUser?.dataValues?.is_super_admin ? {company_info_id : req?.body?.session_res?.client_id} :{}; 

    if (!appUser) {
      await trn.rollback();
      return resNotFound({ message: USER_NOT_FOUND });
    }
    const buToDelete = await BusinessUser.findOne({
      where: { id: idBusinessUser, is_deleted: DeletedStatus.No, ...isSuperAdmin},
    });

    if (!(buToDelete && buToDelete.dataValues)) {
      await trn.rollback();
      return resNotFound({ message: USER_NOT_FOUND });
    }

    await AppUser.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: buToDelete.dataValues.id_app_user,...isSuperAdmin }, transaction: trn }
    );

    await BusinessUser.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: buToDelete.dataValues.id,...isSuperAdmin }, transaction: trn }
    );

    const afterupdateToUpdate = await AppUser.findOne({
      where: { id: idBusinessUser, is_deleted: DeletedStatus.No },
      transaction: trn,
    });

    const CustomerInformation = await BusinessUser.findOne({
      where: { id: buToDelete.dataValues.id, is_deleted: DeletedStatus.No },
      transaction: trn,
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { business_user_id: buToDelete?.dataValues?.id, customer_data: {...buToDelete?.dataValues}},
      new_data: {
        business_user_id: CustomerInformation?.dataValues?.id, customer_data: {
          ...CustomerInformation?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        },
        app_user_id: afterupdateToUpdate?.dataValues?.id, app_user_data: {
          ...afterupdateToUpdate?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
      
    }], afterupdateToUpdate?.dataValues?.id, LogsActivityType.Delete, LogsType.UserManagement, req?.body?.session_res?.id_app_user,trn)
    
    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};
