import EmailHelper from "../../helpers/mail.helper";
import { ActiveStatus, DeletedStatus, DYNAMIC_MAIL_TYPE, EmailLogType, WantToSendMailDynamic } from "../../utils/app-enumeration";
import {  getLocalDate, getWebSettingData, prepareMessageFromParams, resBadRequest } from "../../utils/shared-functions";
import { Op } from "sequelize";
import { EMAIL_TEMPLATE_NOT_FOUND } from "../../utils/app-messages";
import { initModels } from "../model/index.model";

async function prepareAndSendEmail(
  req: any,
  mailTemplate: string,
  mailSubject: string,
  messageType: number,
  payload: any,
  client_id?:number,
  EamilLogInstance?:any,
  appUserId?: any,
) {
  try {
    const {CompanyInfo,Image} = initModels(req);
    const companyInfo = await (<any>CompanyInfo.findOne({
      where: { id: client_id },
      attributes: [
        "id",
        "company_name",
        "company_email",
        "company_phone",
        "copy_right",
        "sort_about",
        "web_link",
        "facebook_link",
        "insta_link",
        "youtube_link",
        "linkdln_link",
        "twitter_link",
        "web_primary_color",
        "web_secondary_color",
        "light_id_image",
        "company_phone",
        "dark_id_image",
        "company_address",
        "gst_number",
        "mail_tem_logo"
      ],
    }));

    const configData = await getWebSettingData(req.body.db_connection,client_id);

    const mailLogoPath = await Image.findOne({where:{id:companyInfo.dataValues.mail_tem_logo}})
   
    payload = {
      ...payload,
      contentTobeReplaced: {
        ...payload?.contentTobeReplaced,
        logo_image: configData?.image_base_url + mailLogoPath?.dataValues?.image_path,
        frontend_url: companyInfo.web_link,
        app_name: companyInfo?.company_name,
        bg_color: companyInfo?.web_primary_color,
        text_color: companyInfo?.web_secondary_color,
        company_phone: companyInfo?.company_phone,
        support_email: companyInfo?.company_email,
        company_address: companyInfo?.company_address,
        gst_number: companyInfo?.gst_number
      },
    };

    const objMail = new EmailHelper(configData);

    const mailInfo = {
      emailTemplate: mailTemplate,
      subject: mailSubject,
      contentToReplace: payload.contentTobeReplaced,
      emailTo: payload.contentTobeReplaced && payload.contentTobeReplaced.mail && payload.contentTobeReplaced.mail == 'admin' ? companyInfo?.company_email : payload.toEmailAddress,
      messageType: messageType,
      attachments: payload.attachments,
      dynamic: payload?.dynamic ? payload?.dynamic : false,
      client_id: configData

    };
    await objMail.prepareEmail(mailInfo);
    objMail.sendMail(EamilLogInstance,appUserId);
  } catch (e) {
    if(EamilLogInstance){
      await EamilLogInstance.update({
        response_status: EmailLogType.Error,
        error_message: e,
        updated_by: appUserId ? appUserId : null ,
        updated_at: getLocalDate()
      });
    }
  }
}

export const mailPasswordResetLink = async (payload: any,clientId:number, req: any) => {

    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.ResetPassword,clientId, req);

};

export const mailRegistrationOtp = async (payload: any,clientId:number, req: any) => {
      await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.CustomerOtp,clientId, req);
 
};

export const configuratoreVerificationOtp = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.configuratorOtp,clientId, req);
};

export const successRegistration = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.Registration,clientId, req);
};

export const mailNewOrderReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.UserOrderPurchase,clientId, req);
};

export const mailOrderInvoiceReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.EmailAttachmentInvoice,clientId, req);
};

export const mailProductInquiryFoeCustomerReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.CustomerProductInquiry,clientId, req);
};

export const mailAppointmentForCustomerReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.CustomerAppointment,clientId, req);
};

export const mailProductInquiryForAdminReceived = async (payload: any,clientId:number, req: any) => {
  await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.AdminProductInquiry,clientId, req);
};

export const mailAppointmentForAdminReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.AdminAppointment,clientId, req);
};

export const mailNewOrderAdminReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.NewOrderReceivedAdmin,clientId, req);
};

export const mailCatalogueNewOrderAdminReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.CataloguesNewOrderReceivedAdmin,clientId, req);
};

export const mailCatalogueNewOrderUserReceived = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.CataloguesNewOrderReceivedUser,clientId, req);
};
export const mailSendForOrderStatusUpdate = async (payload: any,clientId:number, req: any) => {
    await sendMailByMessageType(payload, DYNAMIC_MAIL_TYPE.AdminChangeOrderStatus,clientId, req);
};

export const sendMailByMessageType = async (payload: any,DYNAMIC_MAIL_TYPE:any,clientId:number, req: any, appUserId:any=null) => {
  payload.dynamic = true;
  const {EmailTemplate, EamilLog} = initModels(req);    
  try {
  // If no template ID is provided, we are creating a new template
  const existingTemplate = await EmailTemplate.findOne({
    where: {
      message_type: {
        [Op.contains]: [DYNAMIC_MAIL_TYPE], // Checks if DYNAMIC_MAIL_TYPE contains 1
      },
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id: clientId
    },
  });  
  if(existingTemplate){
    const rawHtmlContent = existingTemplate?.dataValues?.body.replace(/\\n/g, '\n');

    const EamilLogData:any = await EamilLog.create({
      raw_subject: existingTemplate?.dataValues?.subject,
      containt_replace_payload: payload,
      raw_body: rawHtmlContent,
      mail_for:DYNAMIC_MAIL_TYPE,
      response_status: EmailLogType.Pending,
      is_dunamic: true,
      company_info_id:clientId,
      created_by: appUserId ? appUserId : null ,
      created_at: getLocalDate(),
      updated_at: getLocalDate()
    });
    await prepareAndSendEmail(
      req,
      rawHtmlContent,
      existingTemplate.dataValues.subject,
      DYNAMIC_MAIL_TYPE,
      payload,
      clientId,
      EamilLogData,
      appUserId
    );  
  }else{
    await EamilLog.create({
      containt_replace_payload: payload,
      mail_for:DYNAMIC_MAIL_TYPE,
      response_status: EmailLogType.Pending,
      error_message: prepareMessageFromParams(EMAIL_TEMPLATE_NOT_FOUND, [["templateName", DYNAMIC_MAIL_TYPE],]),
      is_dunamic: true,
      company_info_id:clientId,
      created_by: appUserId ? appUserId : null ,
      created_at: getLocalDate(),
      updated_at: getLocalDate(),
    });
  }
}catch(e){
  await EamilLog.create({
    containt_replace_payload: payload,
    response_status: EmailLogType.Pending,
    error_message: e,
    is_dunamic: true,
    company_info_id:clientId,
    created_by: appUserId ? appUserId : null ,
    created_at: getLocalDate(),
    updated_at: getLocalDate(),
  });
   
}
  
};