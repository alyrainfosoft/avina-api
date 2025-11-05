import { Request } from "express";
import { OTP_GENERATE_DIGITS } from "../../../config/env.var";
import dbContext from "../../../config/db-context";
import ConfiguratoreLogs from "../../model/3D_configurator/3D-configurator-logs.model";
import {
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resError,
  resNotFound,
  resSuccess,
} from "../../../utils/shared-functions";
import {
  INVALID_OTP,
  OTP_EXPIRY_LOGIN_AGAIN,
  REQUIRED_ERROR_MESSAGE,
  USER_NOT_FOUND,
} from "../../../utils/app-messages";
import { CONFIGURATORE_OTP_EXPIRY_MINUTE } from "../../../utils/app-constants";
import {
  configuratoreVerificationOtp,
  mailRegistrationOtp,
} from "../mail.service";

export const authenticate3dConfiguratorSystemUser = async (req: Request) => {
  try {
    const { user_name, detail_json } = req.body;

    if (!user_name) {
      return resError({
        message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "user_name"],
        ]),
      });
    }

    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < OTP_GENERATE_DIGITS; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    const userExit = await ConfiguratoreLogs.findOne({
      where: { username: user_name },
    });

    if (!(userExit && userExit.dataValues)) {
      var expiryDate =
        new Date().getTime() + CONFIGURATORE_OTP_EXPIRY_MINUTE * 60 * 1000;

      const userCreate = await ConfiguratoreLogs.create({
        username: user_name,
        otp: OTP,
        created_date: getLocalDate(),
        otp_expiry_date: new Date(expiryDate),
        detail_json: detail_json,
        login_count: 1,
      });

      const mailPayload = {
        toEmailAddress: user_name,
        contentTobeReplaced: { name: user_name, OTP },
      };
      await mailRegistrationOtp(mailPayload);

      return resSuccess({ data: userCreate });
    } else {
      var expiryDate =
        new Date().getTime() + CONFIGURATORE_OTP_EXPIRY_MINUTE * 60 * 1000;

      const updateUse = await ConfiguratoreLogs.update(
        {
          otp: OTP,
          modified_date: getLocalDate(),
          otp_expiry_date: new Date(expiryDate),
          login_count: userExit.dataValues.login_count + 1,
          detail_json: detail_json,
        },
        { where: { id: userExit.dataValues.id } }
      );

      const mailPayload = {
        toEmailAddress: user_name,

        contentTobeReplaced: { name: user_name, OTP },
      };
      await configuratoreVerificationOtp(mailPayload);

      return resSuccess({ data: userExit.dataValues });
    }
  } catch (e) {
    throw e;
  }
};

export const loginOtpverificationConfigUser = async (req: Request) => {
  try {
    const { user_name, otp } = req.body;

    if (!user_name) {
      return resError({
        message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "user_name"],
        ]),
      });
    }

    if (!otp) {
      return resError({
        message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "OTP"],
        ]),
      });
    }

    const useExit = await ConfiguratoreLogs.findOne({
      where: { username: user_name },
    });

    if (!(useExit && useExit.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    if (otp == useExit.dataValues.otp) {
      if (new Date() < new Date(useExit.dataValues.otp_expiry_date)) {
        return resSuccess();
      } else {
        return resBadRequest({ message: OTP_EXPIRY_LOGIN_AGAIN });
      }
    } else {
      return resBadRequest({ message: INVALID_OTP });
    }
  } catch (error) {
    throw error;
  }
};

export const otpvVeificationConfigUser = async (req: Request) => {
  try {
    const { user_name } = req.body;

    if (!user_name) {
      return resError({
        message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", "user_name"],
        ]),
      });
    }

    const userExits = await ConfiguratoreLogs.findOne({
      where: { username: user_name },
    });

    if (!(userExits && userExits.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    console.log(new Date() > new Date(userExits.dataValues.otp_expiry_date));

    if (new Date() < new Date(userExits.dataValues.otp_expiry_date)) {
      return resSuccess();
    } else {
      return resBadRequest({ message: OTP_EXPIRY_LOGIN_AGAIN });
    }
  } catch (error) {
    throw error;
  }
};
