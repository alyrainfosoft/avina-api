import path from "path";
import fs from "fs";
import handlebars from "handlebars";

import puppeteer from "puppeteer";
import { EmailLogType, WantToSendMailDynamic } from "../utils/app-enumeration";

import { getLocalDate, sendMailAPI } from "../utils/shared-functions";
const nodemailer = require("nodemailer");

export default class EmailHelper {
  private _transporter: any;
  private _emailTemplate: any;
  private _contentToReplace: any;
  private _emailTo: any = [];
  private _emailSubject: any;
  private _messageType: any;
  private _attachments: any;
  private _dynamic: any;
  private _client_id: any;
  private _mail_type: any;

  constructor() {
    this._mail_type = `${(process.env.MAIL_SERVICE) == "gmail" ? "gmail" : ""}`;
    this._transporter = nodemailer.createTransport({
      name: process.env.MAIL_HOST,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      service: `${(process.env.MAIL_SERVICE) == "gmail" ? "gmail" : ""}`,
      secureConnection: process.env.MAIL_SECURE,
      auth: {
        user: process.env.MAIL_USER_NAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  public async prepareEmail(payload: any) {
    this._emailTemplate = payload.emailTemplate;
    this._emailSubject = payload.subject;
    this._contentToReplace = payload.contentToReplace;
    this._emailTo = payload.emailTo;
    this._messageType = payload.messageType;
    this._attachments = payload.attachments;
    this._dynamic = payload.dynamic;
    this._client_id = payload.client_id;
  }
  public async sendMail(EamilLogInstance?: any, appUserId?: any) {
    let htmlToSendFile: any;
    let pdf: any;
    let htmlToSend: any;
    let htmlToSendDaynamic: any;
    let compiledSubject: any;
    if (this._dynamic) {
      const template = handlebars.compile(this._emailTemplate);
      const contentReplacements = this._contentToReplace;
      htmlToSendDaynamic = template(contentReplacements);
      const templateSubject = handlebars.compile(this._emailSubject);
      compiledSubject = templateSubject(contentReplacements);
    } else {
      const filePath = path.join(__dirname, this._emailTemplate);
      const source = fs.readFileSync(filePath, "utf-8").toString();
      const template = handlebars.compile(source);
      const contentReplacements = this._contentToReplace;
      htmlToSend = template(contentReplacements);

      if (this._attachments) {
        const filePathAttachments = path.join(
          __dirname,
          this._attachments.content
        );
        const sourceAttachments = fs
          .readFileSync(filePathAttachments, "utf-8")
          .toString();
        const templateFile = handlebars.compile(sourceAttachments);
        const contentReplacement = this._attachments.toBeReplace;
        htmlToSendFile = templateFile(contentReplacement);
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(htmlToSendFile, { waitUntil: "domcontentloaded" });

        await page.emulateMediaType("screen");
        pdf = await page.pdf();

        await browser.close();
      }
    }
    try {
      // if (PROCESS_ENVIRONMENT === "development") {
      //   this._emailTo = "rakesh.vihaainfotech@gmail.com";
      // }
      if (this._dynamic) {
        await EamilLogInstance.update({
          actual_subject: compiledSubject,
          actual_body: htmlToSendDaynamic,
          to: this._emailTo,
          from: process.env.MAIL_FROM,
          configuration_value: null,
          mail_type: this._mail_type,
          attachment: this._attachments,
          updated_by: appUserId ? appUserId : null,
          updated_at: getLocalDate()
        });

        let sendMailResult = await sendMailAPI((process.env.MAIL_HOST),
          (process.env.MAIL_USER_NAME),
          (process.env.MAIL_PASSWORD),
          (process.env.MAIL_PORT),
          (process.env.MAIL_FROM),
          this._emailTo,
          compiledSubject,
          htmlToSendDaynamic,
          (this._attachments ? this._attachments : null),

        )
        await EamilLogInstance.update({
          response_status: EmailLogType.Success,
          success_response: sendMailResult,
          updated_by: appUserId ? appUserId : null,
          updated_at: getLocalDate()
        });

      } else {

        if (htmlToSendFile) {

          const sendMailResult = await sendMailAPI((process.env.MAIL_HOST),
            (process.env.MAIL_USER_NAME),
            (process.env.MAIL_PASSWORD),
            (process.env.MAIL_PORT),
            (process.env.MAIL_FROM),
            this._emailTo,
            compiledSubject,
            htmlToSendDaynamic,
            pdf,
          )


        } else {

          const sendMailResult = await sendMailAPI((process.env.MAIL_HOST),
            (process.env.MAIL_USER_NAME),
            (process.env.MAIL_PASSWORD),
            (process.env.MAIL_PORT),
            (process.env.MAIL_FROM),
            this._emailTo,
            compiledSubject,
            htmlToSendDaynamic,
          )
        }
      }
      // const setConversationData = {
      //   mailResponse: sendMailResult,
      //   recipient: this._emailTo,
      //   type: this._messageType,
      //   subject: this._emailSubject,
      //   body: htmlToSend,
      //   id: null,
      // };
      // await setConversationHistories(setConversationData);
    } catch (err) {
      if (EamilLogInstance) {
        await EamilLogInstance.update({
          response_status: EmailLogType.Error,
          error_message: err,
          updated_by: appUserId ? appUserId : null,
          updated_at: getLocalDate()
        });
      }
      // saveErrorLogToFile(
      //   {
      //     body: "",
      //     headers: { authorization: "" },
      //     originalUrl: "",
      //     method: "",
      //   },
      //   DEFAULT_STATUS_CODE_ERROR,
      //   err,
      //   this._emailSubject,
      //   false
      // );
    }
  }

  public async reSendMail(payload: any) {
    const { emailTo, emailSubject, htmlToSend, id } = payload;

    try {
      const sendMailResult = await this._transporter.sendMail({
        from: process.env.MAIL_FROM ,
        to: emailTo,
        subject: emailSubject,
        html: htmlToSend,
      });

      // const setConversationData = {
      //   mailResponse: sendMailResult,
      //   recipient: emailTo,
      //   type: null,
      //   subject: emailSubject,
      //   body: htmlToSend,
      //   id: id,
      // };
      // await setConversationHistories(setConversationData);
    } catch (err) {
      // saveErrorLogToFile(
      //   {
      //     body: "userInfo",
      //     headers: { authorization: "" },
      //     originalUrl: "/api/forgot-password",
      //     method: "",
      //   },
      //   DEFAULT_STATUS_CODE_ERROR,
      //   err,
      //   emailTo
      // );
    }
  }
}
