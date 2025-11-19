import { Request, RequestHandler, Response } from "express";
import {
  PUBLIC_AUTHORIZATION_KEY,
  PUBLIC_AUTHORIZATION_TOKEN,
  SECURE_COMMUNICATION,
} from "../config/env.var";
import { verifyJWT } from "../helpers/jwt.helper";


import { APP_KEY, BASE_INFO_URL, BASE_MASTER_URL, BASE_TEMPLATE_TWO_PRODUCT_URL, CLIENT_MANAGEMENT_URL, JWT_EXPIRED_ERROR_NAME, PUBLIC_API_URL, SUPER_ADMIN_AUTH_API_VERSIONS, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY } from "../utils/app-constants";
import { AccessRolePermission, ActiveStatus, DeletedStatus, USER_TYPE } from "../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_ERROR,
  UNAUTHORIZED_ACCESS_CODE,
  BAD_REQUEST_CODE,
  DEFAULT_STATUS_CODE_SUCCESS,
  AUTHORIZATION_TOKEN_IS_REQUIRED,
  HTTP_METHOD_NOT_FOUND,
  ROLE_API_PERMISSION_NOT_FOUND,
  ROLE_NOT_FOUND,
} from "../utils/app-messages";
import {
  decryptRequestData,
  getMethodFromRequest,
  resBadRequest,
  resUnauthorizedAccess,
  resUnknownError,
} from "../utils/shared-functions";

import getSubSequelize from "../utils/sub-db-connector";
import { initModels } from "../version-one/model/index.model";
import { Op } from "sequelize";


export const publicAuthentication: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(BAD_REQUEST_CODE)
      .send(resBadRequest({ message: AUTHORIZATION_TOKEN_IS_REQUIRED }));
  }
  if (req.headers.authorization === PUBLIC_AUTHORIZATION_KEY) {
    return next();
  }
  return res.status(UNAUTHORIZED_ACCESS_CODE).send(resUnauthorizedAccess());
};

export const verifyAuthorizationToken = async (req: Request, res: Response) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(BAD_REQUEST_CODE)
        .send(resBadRequest({ message: AUTHORIZATION_TOKEN_IS_REQUIRED }));
    }
    const result = await verifyJWT(req.headers.authorization);
    if (result.code === DEFAULT_STATUS_CODE_SUCCESS) {
      return result.data;
    } else if (
      result.code === UNAUTHORIZED_ACCESS_CODE &&
      result.message === JWT_EXPIRED_ERROR_NAME
    ) {
      return res.status(result.code).send(result);
    }
    return res.status(DEFAULT_STATUS_CODE_ERROR).send(resUnknownError());
  } catch (e) {
    return res
      .status(DEFAULT_STATUS_CODE_ERROR)
      .send(resUnknownError({ data: e }));
  }
};

export const authentication: RequestHandler = async (req, res, next) => {
  const data = await verifyAuthorizationToken(req, res);
  if (!res.headersSent) {
    return next();
  }
};

export const tokenVerification: RequestHandler = async (req, res, next) => {
  try {
   
    if (!req.headers.authorization) {
      return res
        .status(BAD_REQUEST_CODE)
        .send(resBadRequest({ message: AUTHORIZATION_TOKEN_IS_REQUIRED }));
    }
    
    if (
      req.body.data &&
      SECURE_COMMUNICATION.toString() == "true" &&
      !PUBLIC_API_URL.includes(req.originalUrl)
    ) {
      const originalObject = req.body.data;
      const drecryptData = JSON.parse(decryptRequestData(originalObject));
      req.body = { ...drecryptData };
    }
    const company_key = req.query.company_key || req.params.company_key || req.body.company_key as string
    if (req.headers.authorization === PUBLIC_AUTHORIZATION_TOKEN) {
      // this is the client db connection 
      //All customer side public api validation
      const dbConnection = req.baseUrl.includes("/api/v4") ? await getSubSequelize(company_key) : null

      req.body["session_res"] = {
        id: null,
        id_app_user: null,
        userType: USER_TYPE.Guest,
        id_role: null,
      };
      req.body["db_connection"] = dbConnection;
      
      // Temporary session because we don't have authentication api
      // req.body["session_res"] = {
      //   id: 1,
      //   id_app_user: 1,
      //   user_type: USER_TYPE.Administrator,
      //   id_role: 0,
      // };
    } else if (req.headers.authorization === PUBLIC_AUTHORIZATION_KEY) {

      // this is the client db connection 
      //Public authentication key 
      const dbConnection = req.baseUrl.includes("/api/v4") ? await getSubSequelize(company_key) : null

      req.body["session_res"] = {
        id: null,
        id_app_user: null,
        userType: USER_TYPE.Guest,
        id_role: null,
        client_id: null,
        otp: null
      };
      req.body["db_connection"] = dbConnection;
    } else {
      //Admin api validati
      const result = await verifyJWT(req.headers.authorization);
      if (result.code === DEFAULT_STATUS_CODE_SUCCESS) {


        if (!result.data.id_app_user) {
          return res
            .status(UNAUTHORIZED_ACCESS_CODE)
            .send(resUnauthorizedAccess());
        }

        if (
          req.body.data &&
          SECURE_COMMUNICATION.toString() == "true" &&
          !PUBLIC_API_URL.includes(req.originalUrl)
        ) {
          const originalObject = req.body.data;
          const drecryptData = JSON.parse(decryptRequestData(originalObject));
          req.body = { ...drecryptData };
        }

        // this is the client db connection
        const dbConnection = req.baseUrl.includes("/api/v4") ? await getSubSequelize(!!result.data.client_key ? result.data.client_key : company_key) : null

        req.body["db_connection"] = dbConnection;
        req.body["session_res"] = result.data;
      } else {
        return res.status(result.code).send(result);
      }
    }
    return next();
  } catch (e) {
    return res
      .status(DEFAULT_STATUS_CODE_ERROR)
      .send(resUnknownError({ data: e }));
  }
};

export const tokenVerificationForV4: RequestHandler = async (req, res, next) => {
  try {
    
    // decrypt the company key
    if (req?.query?.company_key) {
      const companyKey = decryptRequestData(req?.query?.company_key)  
      req.query.company_key =  companyKey && companyKey != '' ? companyKey : req?.query?.company_key 
    }

    if (!req.headers.authorization) {
      return res
        .status(BAD_REQUEST_CODE)
        .send(resBadRequest({ message: AUTHORIZATION_TOKEN_IS_REQUIRED }));
    }
    if (
      req.body.data &&
      SECURE_COMMUNICATION.toString() == "true" &&
      !PUBLIC_API_URL.includes(req.originalUrl)
    ) {
      const originalObject = req.body.data;
      const drecryptData = JSON.parse(decryptRequestData(originalObject));
      req.body = { ...drecryptData };
    }
    const company_key = req.query.company_key || req.params.company_key || req.body.company_key as string
    if (req.headers.authorization === PUBLIC_AUTHORIZATION_TOKEN) {
      // this is the client db connection 
      //All customer side public api validation
      const dbConnection = req.baseUrl.includes("/api/v4") ? await getSubSequelize(company_key) : null

      req.body["session_res"] = {
        id: null,
        id_app_user: null,
        userType: USER_TYPE.Guest,
        id_role: null,
      };
      req.body["db_connection"] = dbConnection;
      
      // Temporary session because we don't have authentication api
      // req.body["session_res"] = {
      //   id: 1,
      //   id_app_user: 1,
      //   user_type: USER_TYPE.Administrator,
      //   id_role: 0,
      // };
    } else if (req.headers.authorization === PUBLIC_AUTHORIZATION_KEY) {

      // this is the client db connection 
      //Public authentication key 
      const dbConnection = req.baseUrl.includes("/api/v4") ? await getSubSequelize(company_key) : null

      req.body["session_res"] = {
        id: null,
        id_app_user: null,
        userType: USER_TYPE.Guest,
        id_role: null,
        client_id: null,
        otp: null
      };
      req.body["db_connection"] = dbConnection;
    } else {
      //Admin api validati
      const result = await verifyJWT(req.headers.authorization);
      if (result.code === DEFAULT_STATUS_CODE_SUCCESS) {


        if (!result.data.id_app_user) {
          return res
            .status(UNAUTHORIZED_ACCESS_CODE)
            .send(resUnauthorizedAccess());
        }

        if (
          req.body.data &&
          SECURE_COMMUNICATION.toString() == "true" &&
          !PUBLIC_API_URL.includes(req.originalUrl)
        ) {
          const originalObject = req.body.data;
          const drecryptData = JSON.parse(decryptRequestData(originalObject));
          req.body = { ...drecryptData };
        }

        // this is the client db connection
        const dbConnection = req.baseUrl.includes("/api/v4") ? await getSubSequelize(!!result.data.client_key ? result.data.client_key : company_key) : null

        req.body["db_connection"] = dbConnection;
        req.body["session_res"] = result.data;
      } else {
        return res.status(result.code).send(result);
      }
    }
    return next();
  } catch (e) {
    return res
      .status(DEFAULT_STATUS_CODE_ERROR)
      .send(resUnknownError({ data: e }));
  }
};
//Admin request authentication
export const authorization: RequestHandler = async (req, res, next) => {
  try {
    // console.log("===========================", req.body.db_connection)
    const models = req.body.db_connection ? initModels(req) : null;
    const userModel = req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS) ? models.AppUser : null;
    const roleModel = req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS) ? models.Role : null;

    const roleApiPermissionModel = req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS) ? models.RoleApiPermission : null;
    const rolePermissionModel = req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS) ? models.RolePermission : null;
    const rolePermissionAccessModel = req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS) ? models.RolePermissionAccess : null;
    const MenuItemModel = req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS) ? models.MenuItem : null;
    const CompanyInfo  = req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS) ? models.CompanyInfo : null;
    if (req.baseUrl.includes(SUPER_ADMIN_AUTH_API_VERSIONS)) {
      const findUser = await userModel.findOne({ where: { id: req.body.session_res.id_app_user } })
      console.log("findUser", findUser)
      const findUserRole = await roleModel.findOne({ where: { id: findUser.dataValues.id_role, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No } });
      if (!(findUserRole && findUserRole.dataValues)) { 
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnauthorizedAccess({ data: ROLE_NOT_FOUND }));
      }
      if (req.originalUrl.includes(CLIENT_MANAGEMENT_URL)) {
        const company = await CompanyInfo.findOne({
              where: { id: req.body.session_res.client_id , key: JSON.parse(await decryptRequestData(APP_KEY)) },
            });

          if (!company) {
              return res
              .status(DEFAULT_STATUS_CODE_ERROR)
              .send(resUnauthorizedAccess({ data: ROLE_API_PERMISSION_NOT_FOUND }));
          }
      }
      if (findUser.dataValues?.user_type == USER_TYPE.Administrator && findUser.dataValues.is_super_admin == true) {
        if (findUser && findUser.dataValues.one_time_pass != req.body.session_res.otp) {
          return res
            .status(DEFAULT_STATUS_CODE_ERROR)
            .send(resUnauthorizedAccess());
        } else {
          return next();
        }
      } else if (req.body.session_res.id_role === 0) {
        return next();

      }
    } else {
      if (
        req.body.session_res.id_role === 0
      ) {
        return next();
      }
    }
    // const apiEndpoint = req.route.path;
    const method = getMethodFromRequest(req.method);

    if (method === 0) {
      return res
        .status(DEFAULT_STATUS_CODE_ERROR)
        .send(resUnauthorizedAccess({ data: HTTP_METHOD_NOT_FOUND }));
    }
    let resultRAP: any;
    const apiEndpoint = "/" + ((req.baseUrl.split("/")[req.baseUrl.split("/").length - 1]) == "admin" || (req.baseUrl.split("/")[req.baseUrl.split("/").length - 1]) == "user" ? req.baseUrl.split("/")[req.baseUrl.split("/").length - 1] : "") + req.route.path
    if (apiEndpoint.startsWith(BASE_MASTER_URL) || apiEndpoint.includes(BASE_INFO_URL) || apiEndpoint.includes(BASE_TEMPLATE_TWO_PRODUCT_URL)) {
      const findUser = await userModel.findOne({ where: { id: req.body.session_res.id_app_user } })
      const findUserRole = await roleModel.findOne({ where: { id: findUser.dataValues.id_role, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No } });
      if (!(findUserRole && findUserRole.dataValues)) { 
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnauthorizedAccess({ data: ROLE_NOT_FOUND }));
      }
      resultRAP = await roleApiPermissionModel.findOne({
        where: {
          http_method: method,
          api_endpoint: apiEndpoint,
          is_active: ActiveStatus.Active,
          master_type: req.params.master_type || req.body.master_type || req.body.info_key || req.params.info_key || req.params.product_type || req.body.product_type || String(req.params.banner_type) || String(req.body.banner_type) || req.params.section_type || req.body.section_type,
          company_info_id : findUser.dataValues.is_super_admin == true
          ? { [Op.or]: [req?.body?.session_res?.client_id, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY] }
          : req?.body?.session_res?.client_id
        },
      });
    } else {
      
      const findUser = await userModel.findOne({ where: { id: req.body.session_res.id_app_user } })
      const findUserRole = await roleModel.findOne({ where: { id: findUser.dataValues.id_role, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No } });
      if (!(findUserRole && findUserRole.dataValues)) { 
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnauthorizedAccess({ data: ROLE_NOT_FOUND }));
      }
      resultRAP = await roleApiPermissionModel.findOne({
        where: {
          http_method: method,
          api_endpoint: apiEndpoint,
          is_active: ActiveStatus.Active,
          company_info_id : findUser.dataValues.is_super_admin == true
          ? { [Op.or]: [req?.body?.session_res?.client_id, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY] }
          : req?.body?.session_res?.client_id
        },
      });
    }

    if (!(resultRAP && resultRAP.dataValues)) {
      return res
        .status(DEFAULT_STATUS_CODE_ERROR)
        .send(resUnauthorizedAccess({ data: ROLE_API_PERMISSION_NOT_FOUND }));
    }
    const findUser = await userModel.findOne({ where: { id: req.body.session_res.id_app_user } })
    const findUserRole = await roleModel.findOne({ where: { id: findUser.dataValues.id_role, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No } });
      if (!(findUserRole && findUserRole.dataValues)) { 
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnauthorizedAccess({ data: ROLE_NOT_FOUND }));
      }
    const menuItem = await MenuItemModel.findOne({ where: { id: resultRAP.dataValues.id_menu_item } })

    if(menuItem && menuItem.dataValues.is_for_super_admin == false && findUser && findUser.dataValues.is_super_admin == true) {
      return next();
    }
    const rolePermission = await rolePermissionModel.findOne({
      where: {
        id_role: req.body.session_res.id_role,
        id_menu_item: resultRAP.dataValues.id_menu_item,
        is_active: ActiveStatus.Active,
        company_info_id : findUser?.dataValues?.is_super_admin == true
          ? { [Op.or]: [req?.body?.session_res?.client_id, SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY] }
          : req?.body?.session_res?.client_id
      },
      include: {
        model: rolePermissionAccessModel,
        as: "RPA",
        required: true,
        where: {
          id_action: resultRAP.dataValues.id_action,
          access: AccessRolePermission.Yes,
        },
      },
    });

    if (!(rolePermission && rolePermission.dataValues)) {
      return res
        .status(DEFAULT_STATUS_CODE_ERROR)
        .send(resUnauthorizedAccess());
    }

    return next();
  } catch (e) {
    return res
      .status(DEFAULT_STATUS_CODE_ERROR)
      .send(resUnknownError({ data: e }));
  }
};

//Customer request authentication
export const customerAuthorization: RequestHandler = async (req, res, next) => {
  try {
    if (req.body.session_res.id_role === 0) {
      return next();
    }
    const method = getMethodFromRequest(req.method);

    if (method === 0) {
      return res
        .status(DEFAULT_STATUS_CODE_ERROR)
        .send(resUnauthorizedAccess({ data: HTTP_METHOD_NOT_FOUND }));
    }

    //Check
    if (parseInt(req.body.session_res.user_type) != USER_TYPE.Customer) {
      return res
        .status(DEFAULT_STATUS_CODE_ERROR)
        .send(resUnauthorizedAccess());
    }

    return next();
  } catch (e) {
    return res
      .status(DEFAULT_STATUS_CODE_ERROR)
      .send(resUnknownError({ data: e }));
  }
};