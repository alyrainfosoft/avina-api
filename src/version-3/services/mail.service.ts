import { APP_NAME, COMPANY_INFO_KEY, DEV_DEFAULT_RECIPIENT, IMAGE_PATH, MAIL_TEMPLATE_LOGO_IMAGE_PATH } from "../../config/env.var";
import EmailHelper from "../../helpers/mail.helper";
import CompanyInfo from "../model/companyinfo.model";
import { MESSAGE_TYPE } from "../../utils/app-enumeration";
import Image from "../model/image.model";

async function prepareAndSendEmail(
  mailTemplate: string,
  mailSubject: string,
  messageType: number,
  payload: any
) {
  try {
    const companyInfo = await (<any>CompanyInfo.findOne({
      where: { key: COMPANY_INFO_KEY },
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
      ],
    }));

    payload = {
      ...payload,
      contentTobeReplaced: {
        ...payload?.contentTobeReplaced,
        insta_url: companyInfo?.insta_link,
        insta_logo: IMAGE_PATH + "/static/insta.png",
        twiiter_url: companyInfo?.twitter_link,
        twitter_logo: IMAGE_PATH + "/static/twitter.png",
        facebook_url: companyInfo?.facebook_link,
        facbook_logo: IMAGE_PATH + "/static/facbook.png",
        youtube_url: companyInfo?.youtube_link,
        youtube_logo: IMAGE_PATH + "/static/youtube.png",
        linked_url: companyInfo?.linkdln_link,
        linked_logo: IMAGE_PATH + "/static/linkedin.png",
        bg_color: companyInfo?.web_primary_color,
        text_color: companyInfo?.web_secondary_color,
        logo_image: IMAGE_PATH  + MAIL_TEMPLATE_LOGO_IMAGE_PATH,
        frontend_url: companyInfo.web_link,
        app_name: companyInfo?.company_name,
        company_phone: companyInfo?.company_phone,
        support_email: companyInfo?.company_email,
        company_address: companyInfo?.company_address,
      },
    };
    const objMail = new EmailHelper();

    const mailInfo = {
      emailTemplate: mailTemplate,
      subject: mailSubject,
      contentToReplace: payload.contentTobeReplaced,
      emailTo: payload.contentTobeReplaced && payload.contentTobeReplaced.mail && payload.contentTobeReplaced.mail == 'admin' ? companyInfo?.company_email : [payload.toEmailAddress,DEV_DEFAULT_RECIPIENT],
      messageType: messageType,
      attachments: payload.attachments,
      client_id: null
    };
    await objMail.prepareEmail(mailInfo);
    objMail.sendMail();
  } catch (e) {}
}

export const mailPasswordResetLink = async (payload: any) => {
  const emailTemplate = "../../../templates/mail-template/reset-password.html";
  const subject = "Reset your " + payload.contentTobeReplaced.app_name + " account password";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.Credential,
    payload
  );
};

export const mailRegistrationOtp = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/customer-verified-otp.html";
  const subject = "User sign up OTP verification";
  await prepareAndSendEmail(emailTemplate, subject, MESSAGE_TYPE.Otp, payload);
};

export const configuratoreVerificationOtp = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/configurator-verified-otp.html";
  const subject = "User sign up OTP verification";
  await prepareAndSendEmail(emailTemplate, subject, MESSAGE_TYPE.Otp, payload);
};

export const successRegistration = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/successfully-registration.html";
  const subject = "Successfully registration";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.Registration,
    payload
  );
};

export const mailNewOrderReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/when-user-order-purchase.html";
  const subject = `Thank You for Your Order #${payload.contentTobeReplaced.toBeReplace.order_number} !`;
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.NewOrder,
    payload
  );
};
export const mailSendForOrderStatusUpdate = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/when-admin-change-order-status.html";
  const subject = `Your Order #${payload.contentTobeReplaced.order_number}  Status Update!`;
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.NewOrder,
    payload
  );
};

export const mailOrderInvoiceReceived = async (payload: any) => {
  const emailTemplate = "../../../templates/mail-template/invoice-order.html";
  const subject = "New order";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.NewOrder,
    payload
  );
};

export const mailProductInquiryFoeCustomerReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/customer-product-inquiry.html";
  const subject = "Product Inquiry";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.ProductInquiry,
    payload
  );
};

export const mailAppointmentForCustomerReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/customer-appointment.html";
  const subject = "New Inquiry";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.ProductInquiry,
    payload
  );
};

export const mailProductInquiryForAdminReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/admin-product-inquiry.html";
  const subject = "New Product Inquiry";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.ProductInquiry,
    payload
  );
};

export const mailAppointmentForAdminReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/admin-appointment.html";
  const subject = "New Inquiry from User";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.ProductInquiry,
    payload
  );
};

export const mailNewOrderAdminReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/new-order-received-admin.html";
  const subject = "Exciting News! A New Order #"+ payload.contentTobeReplaced.toBeReplace.order_number + " Just Arrived";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.NewOrder,
    payload
  );
};

export const mailCatalogueNewOrderAdminReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/catalogues-new-order-received-admin.html";
  const subject = "New order received";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.NewOrder,
    payload
  );
};

export const mailCatalogueNewOrderUserReceived = async (payload: any) => {
  const emailTemplate =
    "../../../templates/mail-template/catalogues-new-order-received-user.html";
  const subject = "create order successfully";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.NewOrder,
    payload
  );
};
