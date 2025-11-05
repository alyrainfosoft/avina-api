import { RequestHandler } from "express";
import {
  formatPrice,
  formatPriceForFloatValue,
  getExchangeCurrencyRate,
  getPriceCorrectionBasedOnProduct,
  resUnknownError,
} from "../utils/shared-functions";
import { DEFAULT_STATUS_CODE_ERROR } from "../utils/app-messages";

export const currencyMiddleware: RequestHandler = async (
  req: any,
  res,
  next
) => {
  try {
    // Get the target currency from query parameters (e.g., ?currency=EUR)
    const targetCurrency = req.query.currency || "";
    const currencyRate:any = await getExchangeCurrencyRate(targetCurrency, req);
    const rate = currencyRate && currencyRate.currency.rate || 1;

    // Attach price converter and formatter to the request object
    req.formatPrice = async (price: any, product_type: any, correctionValue: any) => {
      return await formatPrice((Math.ceil(price) * rate), currencyRate.currency.thousand_token, currencyRate.company_info_id, product_type, req, correctionValue);
    };

    req.formatPriceForFloatValue = async (price: any) => {
      return await formatPriceForFloatValue((Math.ceil(price) * rate), currencyRate.thousand_token);
    };
    next();
  } catch (error) {
    return res
      .status(DEFAULT_STATUS_CODE_ERROR)
      .send(resUnknownError({ data: error }));
  }
};
