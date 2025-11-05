import { APP_NAME, COMPANY_INFO_KEY, IMAGE_PATH } from "../../config/env.var";
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
      ],
    }));

    const darkImagedata = await Image.findOne({
      where: { id: companyInfo.dataValues.dark_id_image },
    });

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
        logo_image:
          IMAGE_PATH +
          "/" +
          darkImagedata?.dataValues.image_path
            .replace(".webp", ".png")
            .replace(".svg", ".png"),
        frontend_url: companyInfo.web_link,
        app_name: companyInfo?.company_name,
        company_phone: companyInfo?.company_phone,
        support_email: companyInfo?.company_email,
      },
    };

    const objMail = new EmailHelper();

    const mailInfo = {
      emailTemplate: mailTemplate,
      subject: mailSubject,
      contentToReplace: payload.contentTobeReplaced,
      emailTo: payload.contentTobeReplaced && payload.contentTobeReplaced.mail && payload.contentTobeReplaced.mail == 'admin' ? companyInfo?.company_email : payload.toEmailAddress,
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
  const subject = "Reset your " + APP_NAME + " account password";
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.Credential,
    payload
  );
};

export const mailRegistationOtp = async (payload: any) => {
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
  const subject = `New order #${payload.contentTobeReplaced.toBeReplace.order_number} received`
  await prepareAndSendEmail(
    emailTemplate,
    subject,
    MESSAGE_TYPE.NewOrder,
    payload
  );
};
