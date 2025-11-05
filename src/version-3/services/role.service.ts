import { Request } from "express";
import { Model, Op, Sequelize, Transaction } from "sequelize";
import dbContext from "../../config/db-context";
import { IRolePermissionAccess } from "../../data/interfaces/common/common.interface";
import Action from "../model/action.model";
import MenuItem from "../model/menu-items.model";
import RolePermissionAccess from "../model/role-permission-access.model";
import RolePermissionAccessAuditLog from "../model/role-permission-access-audit-log.model";
import RolePermission from "../model/role-permission.model";
import Role from "../model/role.model";
import {
  ACCESS_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  MENU_ITEM_NOT_FOUND,
  ROLE_NOT_FOUND,
  ROLE_WITH_SAME_NAME_AVAILABLE,
  USER_WITH_ROLE_AVAILABLE,
} from "../../utils/app-messages";
import {
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resNotFound,
  resSuccess,
  resUnauthorizedAccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  ActiveStatus,
  DeletedStatus,
  SYSTEM_CONFIGURATIONS_KEYS,
  USER_TYPE,
} from "../../utils/app-enumeration";
import AppUser from "../model/app-user.model";
import BusinessUser from "../model/business-user.model";
import Image from "../model/image.model";
import customerUser from "../model/customer-user.model";
import { fetchConfigurationByKey } from "./auth.service";

export const getAllRoles = async (req: Request) => {
  try {
    let paginationProps = {};
    let pagination = getInitialPaginationFromQuery(req.query);

    let where = [
      { is_deleted: DeletedStatus.No, id: { [Op.ne]: 0 } },
      pagination.is_active ? { is_active: pagination.is_active } : {},
    ];

    let noPagination = req.query.no_pagination === "1";
    if (!noPagination) {
      const totalItems = await Role.count({
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

    const result = await Role.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "role_name",
        "is_active",
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM app_users WHERE app_users.id_role=roles.id AND app_users.is_deleted='${DeletedStatus.No}')`
          ),
          "user_count",
        ],
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM app_users WHERE app_users.id_role=roles.id AND app_users.is_deleted='${DeletedStatus.No}' AND app_users.is_active='${ActiveStatus.Active}')`
          ),
          "active_user_count",
        ],
      ],
      include: {
        model: AppUser,
        as: "app_user",
        attributes: [
          "id",
          [
            Sequelize.literal(
              `CASE 
                WHEN "app_user->business_users->image"."image_path" IS NOT NULL
                  THEN "app_user->business_users->image"."image_path" 
                  ELSE "app_user->customer_user->image"."image_path" 
                END`
            ),
            "image_path",
          ],
        ],
        include: [
          {
            model: BusinessUser,
            as: "business_users",
            attributes: [],
            include: [
              {
                model: Image,
                as: "image",
                attributes: [],
              },
            ],
          },
          {
            model: customerUser,
            as: "customer_user",
            attributes: [],
            include: [
              {
                model: Image,
                as: "image",
                attributes: [],
              },
            ],
          },
        ],
      },
    });
    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (e) {
    throw e;
  }
};

const roleWithSameNameValidation = async (
  role_name: string,
  id: number | null = null
) => {
  const findRoleWithSameName = await Role.findOne({
    where: [
      { role_name: { [Op.iLike]: role_name }, is_deleted: DeletedStatus.No },
      id ? { id: { [Op.ne]: id } } : {},
    ],
  });

  if (findRoleWithSameName && findRoleWithSameName.dataValues) {
    return resUnprocessableEntity({
      message: prepareMessageFromParams(ROLE_WITH_SAME_NAME_AVAILABLE, [
        ["action", id ? "updated" : "added"],
      ]),
    });
  }

  return resSuccess();
};

export const addRole = async (req: Request) => {
  try {
    const nameValidaton = await roleWithSameNameValidation(req.body.role_name);
    if (nameValidaton.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return nameValidaton;
    }

    await Role.create({
      role_name: req.body.role_name,
      is_active: req.body.is_active,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const updateRole = async (req: Request) => {
  try {
    const idRole = parseInt(req.params.id);
    const roleToUpdate = await Role.findOne({
      where: { id: idRole, is_deleted: DeletedStatus.No },
    });

    if (!(roleToUpdate && roleToUpdate.dataValues)) {
      return resNotFound({ message: ROLE_NOT_FOUND });
    }

    if (req.body.only_active_inactive === "1") {
      await Role.update(
        {
          is_active: req.body.is_active,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        },
        { where: { id: roleToUpdate.dataValues.id } }
      );

      return resSuccess();
    }

    const nameValidaton = await roleWithSameNameValidation(
      req.body.role_name,
      idRole
    );
    if (nameValidaton.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return nameValidaton;
    }

    await Role.update(
      {
        role_name: req.body.role_name,
        is_active: req.body.is_active,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: roleToUpdate.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const deleteRole = async (req: Request) => {
  try {
    const idRole = parseInt(req.params.id);

    if (idRole === 0) {
      return resUnauthorizedAccess();
    }

    const roleToDelete = await Role.findOne({
      where: { id: idRole, is_deleted: DeletedStatus.No },
      attributes: [
        "id",
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM app_users WHERE app_users.id_role = roles.id AND app_users.is_deleted = '0')`
          ),
          "user_count",
        ],
      ],
    });

    if (!(roleToDelete && roleToDelete.dataValues)) {
      return resNotFound({ message: ROLE_NOT_FOUND });
    }

    if (parseInt(roleToDelete.dataValues.user_count) !== 0) {
      return resUnprocessableEntity({ message: USER_WITH_ROLE_AVAILABLE });
    }

    await Role.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: roleToDelete.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const getAllActions = async (req: Request) => {
  try {
    let paginationProps = {};
    let pagination = getInitialPaginationFromQuery(req.query);
    let where = [
      { is_deleted: DeletedStatus.No },
      pagination.is_active ? { is_active: pagination.is_active } : {},
    ];

    let noPagination = req.query.no_pagination === "1";
    if (!noPagination) {
      const totalItems = await Action.count({
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

    const result = await Action.findAll({
      ...paginationProps,
      order: [[pagination.sort_by, pagination.order_by]],
      where,
      attributes: ["id", "action_name", "is_active"],
    });
    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (e) {
    throw e;
  }
};

export const getAllMenuItems = async (req: Request) => {
  try {
    let paginationProps = {};
    let pagination = getInitialPaginationFromQuery(req.query);
    let where = [
      { is_deleted: DeletedStatus.No },
      { is_active: ActiveStatus.Active },
    ];

    let noPagination = req.query.no_pagination === "1";
    if (!noPagination) {
      const totalItems = await MenuItem.count({
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

    const result = await MenuItem.findAll({
      ...paginationProps,
      order: [[pagination.sort_by, pagination.order_by]],
      where,
      attributes: [
        "id",
        "name",
        "id_parent_menu",
        "nav_path",
        "menu_location",
        "sort_order",
        "is_active",
      ],
    });
    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (e) {
    throw e;
  }
};

export const fetchRoleConfiguration = async (req: Request) => {
  try {
    const idRole = parseInt(req.params.id);

    const roleToFetch = await Role.findOne({
      where: { id: idRole, is_deleted: DeletedStatus.No },
    });

    if (!(roleToFetch && roleToFetch.dataValues)) {
      return resNotFound({ message: ROLE_NOT_FOUND });
    }

    const result = await RolePermission.findAll({
      where: { id_role: idRole, is_active: ActiveStatus.Active },
      group: ['"role_permissions"."id"'],
      attributes: [
        "id_menu_item",
        [
          Sequelize.fn("array_agg", Sequelize.col('"RPA"."id_action"')),
          "access",
        ],
      ],
      include: [
        {
          model: RolePermissionAccess,
          as: "RPA",
          where: [{ access: "1" }],
          attributes: [],
        },
      ],
    });
    return resSuccess({
      data: { id_role: idRole, role_permission_access: result },
    });
  } catch (e) {
    throw e;
  }
};

const validateMenuItemAndAction = async (
  rolePermissionAccessList: IRolePermissionAccess[],
  trn: Transaction | null = null
) => {
  const findMenuItems = await MenuItem.findAll({
    attributes: ["id"],
    where: {
      is_deleted: DeletedStatus.No,
      // is_active: ActiveStatus.Active
    },
    ...(trn ? { transaction: trn } : {}),
  });

  const findActions = await Action.findAll({
    attributes: ["id"],
    where: {
      is_deleted: DeletedStatus.No,
      //  is_active: ActiveStatus.Active
    },
    ...(trn ? { transaction: trn } : {}),
  });

  const menuItemList = findMenuItems.map((item) => item.dataValues.id);
  const actionList = findActions.map((item) => item.dataValues.id);

  for (const rolePermissionAccess of rolePermissionAccessList) {
    if (!menuItemList.includes(rolePermissionAccess.id_menu_item)) {
      return resNotFound({ message: MENU_ITEM_NOT_FOUND });
    }
    for (const id of rolePermissionAccess.access) {
      if (!actionList.includes(id)) {
        return resNotFound({ message: ACCESS_NOT_FOUND });
      }
    }
  }

  return resSuccess();
};

export const addRoleConfiguration = async (req: Request) => {
  try {
    const nameValidaton = await roleWithSameNameValidation(req.body.role_name);
    if (nameValidaton.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return nameValidaton;
    }

    const validateMenuAction = await validateMenuItemAndAction(
      req.body.role_permission_access
    );
    if (validateMenuAction.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return validateMenuAction;
    }

    let rolePermissionAccessList = [];
    for (const rpa of req.body.role_permission_access) {
      if (rpa.access.length !== 0) {
        rolePermissionAccessList.push(rpa);
      }
    }

    const trn = await dbContext.transaction();
    try {
      const roleResult = await Role.create(
        {
          role_name: req.body.role_name,
          is_active: ActiveStatus.Active,
          created_by: req.body.session_res.id_app_user,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );
      const addRolePermissionAccess = [];
      for (const rolePermissionAccess of rolePermissionAccessList) {
        if (rolePermissionAccess.access.length !== 0) {
          const rpResult = await RolePermission.create(
            {
              id_role: roleResult.dataValues.id,
              id_menu_item: rolePermissionAccess.id_menu_item,
              is_active: ActiveStatus.Active,
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            },
            { transaction: trn }
          );

          for (const idAction of rolePermissionAccess.access) {
            addRolePermissionAccess.push({
              id_role_permission: rpResult.dataValues.id,
              id_action: idAction,
              access: "1",
              created_by: req.body.session_res.id_app_user,
              created_date: getLocalDate(),
            });
          }
        }
      }
      await RolePermissionAccess.bulkCreate(addRolePermissionAccess, {
        transaction: trn,
      });
      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const updateRoleConfiguration = async (req: Request) => {
  const trn = await dbContext.transaction();
  try {
    const idRole = parseInt(req.params.id);

    const roleToUpdate = await Role.findOne({
      where: { id: idRole, is_deleted: DeletedStatus.No },
    });
    if (!(roleToUpdate && roleToUpdate.dataValues)) {
      return resNotFound({ message: ROLE_NOT_FOUND });
    }

    const nameValidaton = await roleWithSameNameValidation(
      req.body.role_name,
      idRole
    );
    if (nameValidaton.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return nameValidaton;
    }

    const validateMenuAction = await validateMenuItemAndAction(
      req.body.role_permission_access,
      trn
    );
    if (validateMenuAction.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await trn.rollback();
      return validateMenuAction;
    }

    await Role.update(
      {
        role_name: req.body.role_name,
        is_active: ActiveStatus.Active,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: idRole }, transaction: trn }
    );

    let rolePermissionAccessList = [];
    for (const rpa of req.body.role_permission_access) {
      if (rpa.access.length !== 0) {
        rolePermissionAccessList.push(rpa);
      }
    }

    await updateRolePermission(
      idRole,
      rolePermissionAccessList,
      req.body.session_res.id_app_user,
      trn
    );

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};

export const changeStatusRoleConfiguration = async (req: Request) => {
  const trn = await dbContext.transaction();
  try {
    const idRole = parseInt(req.params.id);

    const roleToUpdate = await Role.findOne({
      where: { id: idRole, is_deleted: DeletedStatus.No },
    });

    if (!(roleToUpdate && roleToUpdate.dataValues)) {
      return resNotFound({ message: ROLE_NOT_FOUND });
    }

    await Role.update(
      {
        is_active: req.body.is_active,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: idRole }, transaction: trn }
    );

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};

const updateRolePermission = async (
  idRole: number,
  rolePermissionAccessList: IRolePermissionAccess[],
  idAppUser: number,
  trn: Transaction
) => {
  let availableRP = await RolePermission.findAll({
    where: { id_role: idRole },
    transaction: trn,
  });
  const updateRolePermission = [];

  for (const rolePermissionAccess of rolePermissionAccessList) {
    let idRP: number;
    let findAvailableRP = availableRP.find(
      (item) =>
        item.dataValues.id_menu_item === rolePermissionAccess.id_menu_item
    );

    if (findAvailableRP) {
      idRP = findAvailableRP.dataValues.id;
      availableRP = availableRP.filter((item) => {
        return item.dataValues.id !== idRP;
      });

      if (findAvailableRP.dataValues.is_active === "0") {
        updateRolePermission.push({
          ...findAvailableRP.dataValues,
          is_active: ActiveStatus.Active,
          modified_by: idAppUser,
          modified_date: getLocalDate(),
        });
      }
    } else {
      const rpResult = await RolePermission.create(
        {
          id_role: idRole,
          id_menu_item: rolePermissionAccess.id_menu_item,
          is_active: ActiveStatus.Active,
          created_by: idAppUser,
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      idRP = rpResult.dataValues.id;
    }
    await updateRolePermissionAccess(
      idRP,
      rolePermissionAccess.access,
      idAppUser,
      trn
    );
  }
  await RolePermission.bulkCreate(updateRolePermission, {
    transaction: trn,
    updateOnDuplicate: ["is_active", "modified_by", "modified_date"],
  });
  await updateUnavailableMenuPermission(availableRP, idAppUser, trn);
};

const updateRolePermissionAccess = async (
  idRP: number,
  rolePermissionAccessActions: IRolePermissionAccess["access"],
  idAppUser: number,
  trn: Transaction
) => {
  let auditLogPayload = [];
  const updateRolePermission = [];
  const addRolePermission = [];
  let availableRPA = await RolePermissionAccess.findAll({
    where: { id_role_permission: idRP },
    transaction: trn,
  });
  for (const idAction of rolePermissionAccessActions) {
    const findRPA = availableRPA.find(
      (item) => item.dataValues.id_action === idAction
    );

    if (findRPA) {
      availableRPA = availableRPA.filter(
        (item) => item.dataValues.id !== findRPA.dataValues.id
      );

      if (findRPA.dataValues.access === "0") {
        auditLogPayload.push({
          id_role_permission_access: findRPA.dataValues.id,
          old_value: "0",
          new_value: "1",
          changed_by: idAppUser,
          changed_date: getLocalDate(),
        });
        updateRolePermission.push({
          ...findRPA.dataValues,
          access: "1",
          modified_by: idAppUser,
          modified_date: getLocalDate(),
        });
      }
    } else {
      addRolePermission.push({
        id_role_permission: idRP,
        id_action: idAction,
        access: "1",
        created_by: idAppUser,
        created_date: getLocalDate(),
      });
    }
  }

  for (const rpa of availableRPA) {
    if (rpa.dataValues.access === "1") {
      auditLogPayload.push({
        id_role_permission_access: rpa.dataValues.id,
        old_value: "1",
        new_value: "0",
        changed_by: idAppUser,
        changed_date: getLocalDate(),
      });
      updateRolePermission.push({
        ...rpa.dataValues,
        access: "0",
        modified_by: idAppUser,
        modified_date: getLocalDate(),
      });
    }
  }
  if (addRolePermission.length !== 0) {
    await RolePermissionAccess.bulkCreate(addRolePermission, {
      transaction: trn,
    });
  }
  if (updateRolePermission.length !== 0) {
    await RolePermissionAccess.bulkCreate(updateRolePermission, {
      transaction: trn,
      updateOnDuplicate: ["access", "modified_by", "modified_date"],
    });
  }
  if (auditLogPayload.length !== 0) {
    await RolePermissionAccessAuditLog.bulkCreate(auditLogPayload, {
      transaction: trn,
    });
  }
};

const updateUnavailableMenuPermission = async (
  unavailableRolePermission: Model<any, any>[],
  idAppUser: number,
  trn: Transaction
) => {
  let auditLogPayload = [];
  const updateRolePermission = [];
  const updateRolePermissionAccess = [];
  for (const rp of unavailableRolePermission) {
    if (rp.dataValues.is_active === "1") {
      updateRolePermission.push({
        ...rp.dataValues,
        is_active: ActiveStatus.InActive,
        modified_by: idAppUser,
        modified_date: getLocalDate(),
      });

      let availableRPA = await RolePermissionAccess.findAll({
        where: { id_role_permission: rp.dataValues.id },
        transaction: trn,
      });

      for (const rpa of availableRPA) {
        if (rpa.dataValues.access === "1") {
          auditLogPayload.push({
            id_role_permission_access: rpa.dataValues.id,
            old_value: "1",
            new_value: "0",
            changed_by: idAppUser,
            changed_date: getLocalDate(),
          });
          updateRolePermissionAccess.push({
            ...rpa.dataValues,
            access: "0",
            modified_by: idAppUser,
            modified_date: getLocalDate(),
          });
        }
      }
    }
  }
  if (updateRolePermission.length !== 0) {
    await RolePermission.bulkCreate(updateRolePermission, {
      transaction: trn,
      updateOnDuplicate: ["is_active", "modified_by", "modified_date"],
    });
  }
  if (updateRolePermissionAccess.length !== 0) {
    await RolePermissionAccess.bulkCreate(updateRolePermissionAccess, {
      transaction: trn,
      updateOnDuplicate: ["access", "modified_by", "modified_date"],
    });
  }
  if (auditLogPayload.length !== 0) {
    await RolePermissionAccessAuditLog.bulkCreate(auditLogPayload, {
      transaction: trn,
    });
  }
};

export const getUserAccessMenuItems = async (req: Request) => {
  try {
    const idRole = req.body.session_res.id_role;

    const configData = await fetchConfigurationByKey(
      SYSTEM_CONFIGURATIONS_KEYS.VIEW_ACCESS_ID_ACTION
    );
    if (configData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return configData;
    }
    const idAction = configData.data.dataValues.config_value;

    const resultAllData = await MenuItem.findAll({
      order: ["sort_order"],
      attributes: [
        "id",
        "name",
        "id_parent_menu",
        "nav_path",
        "sort_order",
        "icon",
        "menu_location",
      ],
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
      include:
        req.body.session_res.user_type !== USER_TYPE.Administrator
          ? {
              model: RolePermission,
              as: "RP",
              where: { id_role: idRole, is_active: ActiveStatus.Active },
              required: true,
              include: [
                {
                  required: true,
                  model: RolePermissionAccess,
                  as: "RPA",
                  where: { access: "1" },
                  include: [
                    {
                      model: Action,  // Include the Action table
                      as: "action",  // Alias for Action
                      attributes: ["id", "action_name"],  // Fetch only relevant columns
                    },
                  ],
                },
              ],
            }
          : [],
    });
    if (resultAllData.length === 0) {
      const result = await MenuItem.findAll({
        order: ["sort_order"],
        attributes: [
          "id",
          "name",
          "id_parent_menu",
          "nav_path",
          "sort_order",
          "icon",
          "menu_location",
        ],
        where: {
          is_deleted: DeletedStatus.No,
          is_active: ActiveStatus.Active,
          name: { [Op.iLike]: "%dashboard%" },
        },
      });
      return resSuccess({ data: result });
    }

    if(req.body.session_res.user_type == USER_TYPE.Administrator){
      return resSuccess({data:resultAllData});
    }
    
    const result = resultAllData
    .map((menuItem: any) => {
      // Filter to get the permissions for this menu item
      const permissions = menuItem?.dataValues?.RP.flatMap((rolePermission: any) => {
        // Filter to find if there is an action with id 7 (View)
        const hasViewAction = rolePermission?.RPA.some((rolePermissionAccess: any) => rolePermissionAccess?.id_action == idAction);
  
        // Only include permissions if there is an action with id 7 (View)
        if (hasViewAction) {
          return rolePermission?.RPA.map((rolePermissionAccess: any) => {
            return {
              id_action: rolePermissionAccess?.id_action,
              name_action: rolePermissionAccess?.action?.action_name, // Assuming action_name is the action name
            };
          });
        } else {
          // If no action with id 7, return an empty array (i.e., no permissions for this menu)
          return [];
        }
      });
  
      // If there are permissions, return the menu item, else return null (which will be filtered out later)
      if (permissions && permissions.length > 0) {
        return {
          id: menuItem?.dataValues?.id,
          name: menuItem?.dataValues?.name,
          id_parent_menu: menuItem?.dataValues?.id_parent_menu,
          nav_path: menuItem?.dataValues?.nav_path,
          sort_order: menuItem?.dataValues?.sort_order,
          icon: menuItem?.dataValues?.icon,
          menu_location: menuItem?.dataValues?.menu_location,
          permission: permissions,
        };
      }
  
      // If there are no permissions with id_action 7, exclude this menu item by returning null
      return null;
    })
    .filter((menuItem: any) => menuItem !== null); // Remove any null values from the result array
  
  
    return resSuccess({ data: result });
  } catch (e) {
    throw e;
  }
};

export const addMenuItems = async (req: Request) => {
  try {
    const { menu } = req.body;
    const trn = await dbContext.transaction();
    try {
      for (let index = 0; index < menu.length; index++) {
        const element = req.body.menu[index];
        const menuItem = await MenuItem.create(
          {
            name: element.title,
            id_parent_menu: null,
            nav_path: element.nav_path,
            menu_location: element.menu_location,
            sort_order: element.sort_order,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            created_by: 1,
            created_date: getLocalDate(),
            icon: element.icon,
          },
          { transaction: trn }
        );

        if (element.sub_menu && element.sub_menu.length > 0) {
          for (let index = 0; index < element.sub_menu.length; index++) {
            const subElement = element.sub_menu[index];
            const subMenuItem = await MenuItem.create(
              {
                name: subElement.title,
                id_parent_menu: menuItem.dataValues.id,
                nav_path: subElement.nav_path,
                menu_location: subElement.menu_location,
                sort_order: subElement.sort_order,
                is_active: ActiveStatus.Active,
                is_deleted: DeletedStatus.No,
                created_by: 1,
                created_date: getLocalDate(),
                icon: subElement.icon,
              },
              { transaction: trn }
            );

            if (subElement.sub_menu && subElement.sub_menu.length > 0) {
              for (let index = 0; index < subElement.sub_menu.length; index++) {
                const subSubElement = subElement.sub_menu[index];
                const subSubMenuItem = await MenuItem.create(
                  {
                    name: subSubElement.title,
                    id_parent_menu: subMenuItem.dataValues.id,
                    nav_path: subSubElement.nav_path,
                    menu_location: subSubElement.menu_location,
                    sort_order: subSubElement.sort_order,
                    is_active: ActiveStatus.Active,
                    is_deleted: DeletedStatus.No,
                    created_by: 1,
                    created_date: getLocalDate(),
                    icon: subSubElement.icon,
                  },
                  { transaction: trn }
                );
              }
            }
          }
        }
      }

      await trn.commit();
      return resSuccess();
    } catch (error) {
      await trn.rollback();
      console.log("---------------", error);
      return resUnknownError({ data: error });
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
