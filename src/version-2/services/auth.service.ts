import { Request } from "express";
import {
  createResetToken,
  createUserJWT,
  verifyJWT,
} from "../../helpers/jwt.helper";
import {
  JWT_EXPIRED_ERROR_NAME,
  PASSWORD_SOLT,
} from "../../utils/app-constants";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  FORBIDDEN_CODE,
  INVALID_USERNAME_PASSWORD,
  UNAUTHORIZED_ACCESS_CODE,
  ACCOUNT_NOT_ACTIVE,
  USER_NOT_FOUND,
  USER_NOT_FOUND_WITH_REFRESH_TOKEN,
  ACCOUNT_NOT_VERIFIED,
  ACCOUNT_IS_BLOCKED,
  ACCOUNT_NOT_APPROVED,
  PASSWORD_IS_WRONG,
  INVALID_TOKEN,
  INVALID_OTP,
  USER_EMAIL_ID_ALREADY_VERIFIED,
  NOT_VERIFIED,
} from "../../utils/app-messages";
import {
  columnValueLowerCase,
  getDecryptedText,
  getEncryptedText,
  getLocalDate,
  resBadRequest,
  resError,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import bcrypt from "bcrypt";
import AppUser from "../model/app-user.model";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  USER_STATUS,
  USER_TYPE,
} from "../../utils/app-enumeration";
import BusinessUser from "../model/business-user.model";
import {
  FRONT_END_BASE_URL,
  IMAGE_PATH,
  OTP_GENERATE_DIGITS,
  RESET_PASSWORD_PATH,
} from "../../config/env.var";
import {
  mailPasswordResetLink,
  mailRegistationOtp,
  successRegistration,
} from "./mail.service";
import customerUser from "../model/customer-user.model";
import SystemConfiguration from "../model/system-configuration.model";
import dbContext from "../../config/db-context";
import { moveFileToS3ByType } from "../../helpers/file.helper";
import Image from "../model/image.model";
import { Op, Sequelize } from "sequelize";
import HeadsData from "../model/master/attributes/heads.model";
import ShanksData from "../model/master/attributes/shanks.model";
import SideSettingStyles from "../model/master/attributes/side-setting-styles.model";
import DiamondCaratSize from "../model/master/attributes/caratSize.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import Colors from "../model/master/attributes/colors.model";
import ClarityData from "../model/master/attributes/clarity.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import StoneData from "../model/master/attributes/gemstones.model";
import ConfigProduct from "../model/config-product.model";
import ConfigProductMetals from "../model/config-product-metal.model";
import CutsData from "../model/master/attributes/cuts.model";
import ConfigProductDiamonds from "../model/config-product-diamonds.model";
import MenuItem from "../model/menu-items.model";
import CaratSize from "../../model/master/attributes/caratSize.model";

export const test = async (req: Request) => {
  try {
    const { carat_size } = req.body;
    for (let index = 0; index < carat_size.length; index++) {
      const element = carat_size[index];
      const sort_code_value = Math.round(parseFloat(element) * 100);
      const payload = {
        value: element,
        slug: element,
        sort_code: sort_code_value,
        created_date: getLocalDate(),
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
        created_by: 1,
      };

      await DiamondCaratSize.create(payload);
    }
    // const array = [
    //   {
    //     title: "Fluorescence",
    //     sort: 1.0,
    //     children: [
    //       {
    //         title: "Fluorescence Intensity",
    //         path: "/attribute/fluorescence/fluorescenceIntensity",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Fluorescence Color",
    //         path: "/attribute/fluorescence/fluorescenceColor",
    //         sort: 2.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Fancy Color",
    //     sort: 2.0,
    //     children: [
    //       {
    //         title: "Fancy Color",
    //         path: "/attribute/fancyColor/fancyColor",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Fancy Color Intensity",
    //         path: "/attribute/fancyColor/fancyColorIntensity",
    //         sort: 2.0,
    //       },
    //       {
    //         title: "Fancy Color Overtone",
    //         path: "/attribute/fancyColor/fancyColorOvertone",
    //         sort: 3.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Girdle",
    //     sort: 3.0,
    //     children: [
    //       {
    //         title: "Girdle Thin",
    //         path: "/attribute/girdle/girdleThin",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Girdle Thick",
    //         path: "/attribute/girdle/girdleThick",
    //         sort: 2.0,
    //       },
    //       {
    //         title: "Girdle Condition",
    //         path: "/attribute/girdle/girdleCondition",
    //         sort: 3.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Pair",
    //     sort: 4.0,
    //     children: [
    //       {
    //         title: "Pair",
    //         path: "/attribute/pair/pair",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Pair Separable",
    //         path: "/attribute/pair/pairSeparable",
    //         sort: 2.0,
    //       },
    //       {
    //         title: "Pair Stock",
    //         path: "/attribute/pair/pairStock",
    //         sort: 3.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Inclusion",
    //     sort: 5.0,
    //     children: [
    //       {
    //         title: "Canter Inclusion",
    //         path: "/attribute/inclusion/centerInclusion",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "Black Inclusion",
    //         path: "/attribute/inclusion/blackInclusion",
    //         sort: 2.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "lab",
    //     sort: 6.0,
    //     children: [
    //       {
    //         title: "lab",
    //         path: "/attribute/lab/lab",
    //         sort: 1.0,
    //       },
    //       {
    //         title: "lab Location",
    //         path: "/attribute/lab/labLocation",
    //         sort: 2.0,
    //       },
    //     ],
    //   },
    //   {
    //     title: "Parcel Stones",
    //     path: "/attribute/parcelStones",
    //     sort: 7.0,
    //   },
    //   {
    //     title: "Availability",
    //     path: "/attribute/availability",
    //     sort: 8.0,
    //   },
    //   {
    //     title: "Polish",
    //     path: "/attribute/polish",
    //     sort: 9.0,
    //   },
    //   {
    //     title: "Symmetry",
    //     path: "/attribute/symmetry",
    //     sort: 10.0,
    //   },
    //   {
    //     title: "Culet Condition",
    //     path: "/attribute/culetCondition",
    //     sort: 11.0,
    //   },
    //   {
    //     title: "Laser Inscription",
    //     path: "/attribute/laserInscription",
    //     sort: 12.0,
    //   },
    //   {
    //     title: "Certificate Comment",
    //     path: "/attribute/certComment",
    //     sort: 13.0,
    //   },
    //   {
    //     title: "Time To Location",
    //     path: "/attribute/timetolocation",
    //     sort: 14.0,
    //   },
    //   {
    //     title: "Trade Show",
    //     path: "/attribute/tradeShow",
    //     sort: 15.0,
    //   },
    //   {
    //     title: "Shade",
    //     path: "/attribute/shade",
    //     sort: 16.0,
    //   },
    //   {
    //     title: "Report Type",
    //     path: "/attribute/reportType",
    //     sort: 17.0,
    //   },
    //   {
    //     title: "Milky",
    //     path: "/attribute/milky",
    //     sort: 18.0,
    //   },
    //   {
    //     title: "BGM",
    //     path: "/attribute/bgm",
    //     sort: 19.0,
    //   },
    //   {
    //     title: "H & A",
    //     path: "/attribute/handA",
    //     sort: 20.0,
    //   },
    //   {
    //     title: "Growth Type",
    //     path: "/attribute/growthType",
    //     sort: 21.0,
    //   },
    //   {
    //     title: "Country",
    //     path: "/attribute/country",
    //     sort: 22.0,
    //   },
    //   {
    //     title: "State",
    //     path: "/attribute/state",
    //     sort: 23.0,
    //   },
    //   {
    //     title: "City",
    //     path: "/attribute/city",
    //     sort: 24.0,
    //   },
    // ];

    // for (let index = 0; index < array.length; index++) {
    //   const element = array[index];
    //   const mainMenu = await MenuItem.create({
    //     name: element.title,
    //     id_parent_menu: 67,
    //     nav_path: element.path ? element.path : null,
    //     menu_location: 1,
    //     sort_order: element.sort,
    //     is_active: "1",
    //     is_deleted: "0",
    //     created_by: 1,
    //     created_date: getLocalDate(),
    //   });

    //   if (element.children && element.children.length !== 0) {
    //     for (let index = 0; index < element.children.length; index++) {
    //       const elementChild = element.children[index];
    //       await MenuItem.create({
    //         name: elementChild.title,
    //         id_parent_menu: mainMenu.dataValues.id,
    //         nav_path: elementChild.path ? elementChild.path : null,
    //         menu_location: 1,
    //         sort_order: elementChild.sort,
    //         is_active: "1",
    //         is_deleted: "0",
    //         created_by: 1,
    //         created_date: getLocalDate(),
    //       });
    //     }
    //   }
    // }
    // const headList = await HeadsData.findAll({ where: { is_deleted: "0" } });
    // const shnakList = await ShanksData.findAll({ where: { is_deleted: "0" } });
    // const sideSettingList = await SideSettingStyles.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const diamondSize = await DiamondCaratSize.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const diamondShape = await DiamondShape.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const colorList = await Colors.findAll({ where: { is_deleted: "0" } });
    // const ClarityList = await ClarityData.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const karatList = await GoldKarat.findAll({
    //   where: { is_deleted: "0" },
    // });
    // const goldList = await MetalMaster.findAll({ where: { is_deleted: "0" } });
    // const gemstone = await StoneData.findAll({ where: { is_deleted: "0" } });
    // const cuts = await CutsData.findAll({ where: { is_deleted: "0" } });

    // const headListFind = (value: any) => {
    //   const list = headList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const shankListFind = (value: any) => {
    //   const list = shnakList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const sideSettingListFind = (value: any) => {
    //   const list = sideSettingList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const diamondSizeListFind = (value: any) => {
    //   const list = diamondSize.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.value, sort: list.dataValues.sort_code };
    // };
    // const diamondShapeListFind = (value: any) => {
    //   const list = diamondShape.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const diamondColorListFind = (value: any) => {
    //   const list = colorList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.sort_code };
    // };
    // const diamondClarityListFind = (value: any) => {
    //   const list = ClarityList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.value };
    // };
    // const karatListFind = (value: any) => {
    //   const list = karatList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.slug };
    // };
    // const metalListFind = (value: any) => {
    //   const list = goldList.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.slug };
    // };
    // const cutsListFind = (value: any) => {
    //   const list = cuts.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.value, sort: list.dataValues.slug };
    // };
    // const GemstoneListFind = (value: any) => {
    //   const list = gemstone.find((t: any) => t.dataValues.id == value);
    //   return { name: list.dataValues.name, sort: list.dataValues.slug };
    // };
    // const configProduct = await ConfigProduct.findAll({
    //   order: [["id", "ASC"]],
    //   where: { is_deleted: "0", product_type: { [Op.iLike]: "three stone" } },
    //   include: [
    //     { model: ConfigProductMetals, as: "CPMO" },
    //     {
    //       model: ConfigProductDiamonds,
    //       as: "CPDO",
    //       where: { product_type: { [Op.iLike]: "side" } },
    //     },
    //   ],
    // });
    // let list = [];
    // for (let index = 0; index < configProduct.length; index++) {
    //   const element = configProduct[index].dataValues;
    //   // console.log("-------------", element.slug.split("-")[3]);

    //   list.push({

    //     product_title: `${
    //       element.CPMO[0].metal_id == 1
    //         ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //         : metalListFind(element.CPMO[0].metal_id).name
    //     } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //       diamondSizeListFind(element.center_dia_cts).name
    //     } Carat ${
    //       element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //         ? cutsListFind(element.center_dia_cut_id).name
    //         : diamondColorListFind(element.center_dia_color).name +
    //           " " +
    //           diamondClarityListFind(element.center_dia_clarity_id).name
    //     } ${
    //       headListFind(element.head_type_id).name
    //     } ${shankListFind(element.shank_type_id).name} ${
    //       sideSettingListFind(element.side_setting_id).name
    //     }  Diamond Ring`,
    //     product_sort_des: `${
    //       element.CPMO[0].metal_id == 1
    //         ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //         : metalListFind(element.CPMO[0].metal_id).name
    //     } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //       diamondSizeListFind(element.center_dia_cts).name
    //     } Carat ${
    //       element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //         ? cutsListFind(element.center_dia_cut_id).name
    //         : diamondColorListFind(element.center_dia_color).name +
    //           " " +
    //           diamondClarityListFind(element.center_dia_clarity_id).name
    //     } ${
    //       headListFind(element.head_type_id).name
    //     } ${shankListFind(element.shank_type_id).name} ${
    //       sideSettingListFind(element.side_setting_id).name
    //     }  Diamond Ring`,
    //     product_long_des: `${
    //       element.CPMO[0].metal_id == 1
    //         ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //         : metalListFind(element.CPMO[0].metal_id).name
    //     } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //       diamondSizeListFind(element.center_dia_cts).name
    //     } Carat ${
    //       element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //         ? cutsListFind(element.center_dia_cut_id).name
    //         : diamondColorListFind(element.center_dia_color).name +
    //           " " +
    //           diamondClarityListFind(element.center_dia_clarity_id).name
    //     }  ${
    //       headListFind(element.head_type_id).name
    //     } ${shankListFind(element.shank_type_id).name} ${
    //       sideSettingListFind(element.side_setting_id).name
    //     }  Diamond Ring`,
    //     slug: `${
    //       element.CPMO[0].metal_id == 1
    //         ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //         : metalListFind(element.CPMO[0].metal_id).sort
    //     }-${element.slug.split("-")[3]}-${
    //       diamondShapeListFind(element.center_dia_shape_id).sort
    //     }-${diamondSizeListFind(element.center_dia_cts).name}-${
    //       element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //         ? cutsListFind(element.center_dia_cut_id).sort
    //         : diamondColorListFind(element.center_dia_color).name +
    //           "-" +
    //           diamondClarityListFind(element.center_dia_clarity_id).sort
    //     }-${headListFind(element.head_type_id).sort}-${
    //       shankListFind(element.shank_type_id).sort
    //     }-${sideSettingListFind(element.side_setting_id).sort}`,
    //     sku: `${
    //       element.CPMO[0].metal_id == 1
    //         ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //         : metalListFind(element.CPMO[0].metal_id).sort
    //     }-${diamondShapeListFind(element.center_dia_shape_id).sort}-${
    //       diamondSizeListFind(element.center_dia_cts).name
    //     }-${
    //       element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //         ? cutsListFind(element.center_dia_cut_id).sort
    //         : diamondColorListFind(element.center_dia_color).name +
    //           "-" +
    //           diamondClarityListFind(element.center_dia_clarity_id).sort
    //     }-${
    //       headListFind(element.head_type_id).sort
    //     }-${shankListFind(element.shank_type_id).sort}-${
    //       sideSettingListFind(element.side_setting_id).sort
    //     }`,
    //   });
    //   await ConfigProduct.update(
    //     {
    //       product_title: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //           : metalListFind(element.CPMO[0].metal_id).name
    //       } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       } Carat ${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).name
    //           : diamondColorListFind(element.center_dia_color).name +
    //             " " +
    //             diamondClarityListFind(element.center_dia_clarity_id).name
    //       } ${
    //         headListFind(element.head_type_id).name
    //       } ${shankListFind(element.shank_type_id).name} ${
    //         sideSettingListFind(element.side_setting_id).name
    //       }  Diamond Ring`,
    //       product_sort_des: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //           : metalListFind(element.CPMO[0].metal_id).name
    //       } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       } Carat ${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).name
    //           : diamondColorListFind(element.center_dia_color).name +
    //             " " +
    //             diamondClarityListFind(element.center_dia_clarity_id).name
    //       } ${
    //         headListFind(element.head_type_id).name
    //       } ${shankListFind(element.shank_type_id).name} ${
    //         sideSettingListFind(element.side_setting_id).name
    //       }  Diamond Ring`,
    //       product_long_des: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).name}KT`
    //           : metalListFind(element.CPMO[0].metal_id).name
    //       } ${diamondShapeListFind(element.center_dia_shape_id).name} ${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       } Carat ${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).name
    //           : diamondColorListFind(element.center_dia_color).name +
    //             " " +
    //             diamondClarityListFind(element.center_dia_clarity_id).name
    //       }  ${
    //         headListFind(element.head_type_id).name
    //       } ${shankListFind(element.shank_type_id).name} ${
    //         sideSettingListFind(element.side_setting_id).name
    //       }  Diamond Ring`,
    //       slug: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //           : metalListFind(element.CPMO[0].metal_id).sort
    //       }-${element.slug.split("-")[3]}-${
    //         diamondShapeListFind(element.center_dia_shape_id).sort
    //       }-${diamondSizeListFind(element.center_dia_cts).name}-${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).sort
    //           : diamondColorListFind(element.center_dia_color).name +
    //             "-" +
    //             diamondClarityListFind(element.center_dia_clarity_id).sort
    //       }-${
    //         element.CPDO[0].dia_cuts && element.CPDO[0].dia_cuts != undefined
    //           ? cutsListFind(element.CPDO[0].dia_cuts).sort
    //           : diamondColorListFind(element.CPDO[0].dia_color).name +
    //             "-" +
    //             diamondClarityListFind(element.CPDO[0].dia_clarity).sort
    //       }-${headListFind(element.head_type_id).sort}-${
    //         shankListFind(element.shank_type_id).sort
    //       }-${sideSettingListFind(element.side_setting_id).sort}`,
    //       sku: `${
    //         element.CPMO[0].metal_id == 1
    //           ? `${karatListFind(element.CPMO[0].karat_id).sort}`
    //           : metalListFind(element.CPMO[0].metal_id).sort
    //       }-${diamondShapeListFind(element.center_dia_shape_id).sort}-${
    //         diamondSizeListFind(element.center_dia_cts).name
    //       }-${
    //         element.center_dia_cut_id && element.center_dia_cut_id != undefined
    //           ? cutsListFind(element.center_dia_cut_id).sort
    //           : diamondColorListFind(element.center_dia_color).name +
    //             "-" +
    //             diamondClarityListFind(element.center_dia_clarity_id).sort
    //       }-${
    //         headListFind(element.head_type_id).sort
    //       }-${shankListFind(element.shank_type_id).sort}-${
    //         sideSettingListFind(element.side_setting_id).sort
    //       }`,
    //     },
    //     { where: { id: element.id } }
    //   );
    // }
    // return resSuccess({ data: list });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const registerSystemUser = async (req: Request) => {
  try {
    const { username, password, user_type } = req.body;

    const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));
    const payload = {
      username,
      pass_hash,
      user_type,
      created_at: getLocalDate(),
    };
    const result = await AppUser.create(payload);

    const jwtPayload = {
      id: result.dataValues.id,
      idAppUser: result.dataValues.id,
      userType: result.dataValues.user_type,
    };
    const data = await createUserJWT(
      result.dataValues.id,
      jwtPayload,
      result.dataValues.user_type
    );

    return resSuccess({
      data: {
        userInfo: result,
        token: data,
      },
    });
  } catch (e) {
    throw e;
  }
};

export const authenticateSystemUser = async (req: Request) => {
  try {
    const { username, password } = req.body;
    let userDetails;

    const appUser = await AppUser.findOne({
      where: { username, is_deleted: "0" },
    });
    if (!appUser) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const isPasswordValid = <any>(
      await bcrypt.compare(password, appUser.dataValues.pass_hash)
    );
    if (!isPasswordValid) {
      return resBadRequest({ message: INVALID_USERNAME_PASSWORD });
    }

    if (appUser.dataValues.user_status === USER_STATUS.Blocked) {
      return resError({ message: ACCOUNT_IS_BLOCKED, code: FORBIDDEN_CODE });
    }

    if (appUser.dataValues.is_active === "0") {
      return resError({ message: ACCOUNT_NOT_ACTIVE, code: FORBIDDEN_CODE });
    }

    if (
      appUser.dataValues.user_status === USER_STATUS.PendingVerification ||
      appUser.dataValues.user_status === USER_STATUS.PendingReverification
    ) {
      return resError({
        status: NOT_VERIFIED,
        message: ACCOUNT_NOT_VERIFIED,
        code: FORBIDDEN_CODE,
        data: appUser.dataValues.id,
      });
    }

    if (appUser.dataValues.user_status === USER_STATUS.PendingApproval) {
      return resError({ message: ACCOUNT_NOT_APPROVED, code: FORBIDDEN_CODE });
    }

    if (appUser.dataValues.user_type === USER_TYPE.Administrator) {
      userDetails = await AppUser.findOne({
        where: { id: appUser.dataValues.id },
      });
    } else if (appUser.dataValues.user_type === USER_TYPE.BusinessUser) {
      userDetails = await BusinessUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
        attributes: [
          "id",
          "id_app_user",
          "name",
          "email",
          "phone_number",
          "is_active",
          "is_deleted",
          "created_date",
          [Sequelize.literal("image.image_path"), "image_path"],
        ],
        include: [{ model: Image, as: "image", attributes: [] }],
      });
    } else if (appUser.dataValues.user_type === USER_TYPE.Customer) {
      userDetails = await customerUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
      });
    }

    const jwtPayload = {
      id:
        userDetails && userDetails.dataValues
          ? userDetails.dataValues.id
          : appUser.dataValues.id,
      id_app_user: appUser.dataValues.id,
      user_type: appUser.dataValues.user_type,
      id_role: appUser.dataValues.id_role,
    };

    const data = createUserJWT(
      appUser.dataValues.id,
      jwtPayload,
      appUser.dataValues.user_type
    );

    return resSuccess({
      data: {
        tokens: data,
        user_detail: userDetails,
        id_role: appUser.dataValues.id_role,
      },
    });
  } catch (e) {
    throw e;
  }
};

export const refreshAuthorizationToken = async (req: Request) => {
  try {
    const refreshToken = req.body.refresh_token;

    const result = await verifyJWT(refreshToken);
    if (result.code === DEFAULT_STATUS_CODE_SUCCESS) {
      const appUser = await AppUser.findOne({
        where: { refresh_token: refreshToken },
      });
      if (!appUser) {
        return resBadRequest({ message: USER_NOT_FOUND_WITH_REFRESH_TOKEN });
      }

      const jwtPayload = {
        id: appUser.dataValues.id,
        idAppUser: appUser.dataValues.id,
        userType: appUser.dataValues.user_type,
      };
      const data = createUserJWT(
        appUser.dataValues.id,
        jwtPayload,
        appUser.dataValues.user_type
      );
      return resSuccess({ data });
    } else if (
      result.code === UNAUTHORIZED_ACCESS_CODE &&
      result.message === JWT_EXPIRED_ERROR_NAME
    ) {
      return result;
    }

    return resUnknownError(result);
  } catch (e) {
    throw e;
  }
};

export const changePassword = async (req: Request) => {
  try {
    const appUser = await AppUser.findOne({
      where: { id: req.body.session_res.id_app_user },
    });
    if (!appUser) {
      return resBadRequest({ message: USER_NOT_FOUND });
    }

    const isPasswordValid = <any>(
      await bcrypt.compare(req.body.old_password, appUser.dataValues.pass_hash)
    );
    if (!isPasswordValid) {
      return resBadRequest({ message: PASSWORD_IS_WRONG });
    }

    const pass_hash = await bcrypt.hash(
      req.body.new_password,
      Number(PASSWORD_SOLT)
    );

    await AppUser.update(
      {
        pass_hash,
        modified_at: getLocalDate(),
        modified_by: appUser.dataValues.id,
      },
      { where: { id: appUser.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const forgotPassword = async (req: Request) => {
  try {
    const appUser = await AppUser.findOne({
      where: { username: req.body.username, is_deleted: "0" },
    });
    if (!appUser) {
      return resBadRequest({ message: USER_NOT_FOUND });
    }

    let name;
    if (appUser.dataValues.user_type === USER_TYPE.BusinessUser) {
      const businessUser = await BusinessUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
      });
      if (!(businessUser && businessUser.dataValues)) {
        return resBadRequest({ message: USER_NOT_FOUND });
      }
      name = businessUser.dataValues.name;
    } else if (appUser.dataValues.user_type === USER_TYPE.Customer) {
      const customer = await customerUser.findOne({
        where: { id_app_user: appUser.dataValues.id },
      });
      if (!(customer && customer.dataValues)) {
        return resBadRequest({ message: USER_NOT_FOUND });
      }
      name = customer.dataValues.full_name;
    }

    const token = createResetToken(appUser.dataValues.id);

    let link = `${FRONT_END_BASE_URL}/${RESET_PASSWORD_PATH}${token}`;
    let logo_image = IMAGE_PATH;
    let frontend_url = FRONT_END_BASE_URL;
    const mailPayload = {
      toEmailAddress: appUser.dataValues.username,
      contentTobeReplaced: { name, link, logo_image, frontend_url },
    };
    await mailPasswordResetLink(mailPayload);

    await AppUser.update(
      {
        pass_reset_token: token,
        modified_date: getLocalDate(),
        modified_by: appUser.dataValues.id,
      },
      { where: { id: appUser.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const resetPassword = async (req: Request) => {
  try {
    const tokenRes = await verifyJWT(req.body.token);
    if (tokenRes.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return tokenRes;
    }
    const appUser = await AppUser.findOne({
      where: { id: tokenRes.data.id },
    });
    if (!appUser) {
      return resUnprocessableEntity({ message: USER_NOT_FOUND });
    }

    if (appUser.dataValues.pass_reset_token !== req.body.token) {
      return resUnprocessableEntity({ message: INVALID_TOKEN });
    }

    const pass_hash = await bcrypt.hash(
      req.body.new_password,
      Number(PASSWORD_SOLT)
    );

    await AppUser.update(
      {
        pass_hash,
        pass_reset_token: null,
        modified_date: getLocalDate(),
        modified_by: appUser.dataValues.id,
      },
      { where: { id: appUser.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const changeAnyUserPassword = async (req: Request) => {
  try {
    const { id_app_user, new_password } = req.body;

    const userToUpdate = await AppUser.findOne({
      where: { id: id_app_user, is_deleted: "0" },
    });

    if (!(userToUpdate && userToUpdate.dataValues)) {
      return resNotFound({ message: USER_NOT_FOUND });
    }

    const pass_hash = await bcrypt.hash(new_password, Number(PASSWORD_SOLT));

    await AppUser.update(
      {
        pass_hash,
        modified_at: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: userToUpdate.dataValues.id } }
    );

    return resSuccess();
  } catch (e) {
    throw e;
  }
};

export const fetchConfigurationByKey = async (key: string) => {
  try {
    const config = await SystemConfiguration.findOne({
      where: { config_key: key },
    });
    if (config && config.dataValues) {
      return resSuccess({ data: config });
    }
    return resNotFound();
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

export const registerCustomerUser = async (req: Request) => {
  try {
    const {
      full_name,
      username,
      mobile,
      password,
      country_id,
      confirm_password,
    } = req.body;

    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < OTP_GENERATE_DIGITS; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    console.log(OTP);
    const trn = await dbContext.transaction();
    try {
      const pass_hash = await bcrypt.hash(password, Number(PASSWORD_SOLT));

      const emailExistes = await customerUser.findOne({
        where: [columnValueLowerCase("email", username), { is_deleted: "0" }],
      });
      const emailidExistes = await AppUser.findOne({
        where: [
          columnValueLowerCase("username", username),
          { is_deleted: "0" },
        ],
      });

      if (emailExistes == null && emailidExistes == null) {
        const appUserpayload = await AppUser.create(
          {
            username: username,
            pass_hash: pass_hash,
            user_type: USER_TYPE.Customer,
            user_status: USER_STATUS.PendingVerification,
            is_email_verified: 0,
            created_date: getLocalDate(),
            id_role: 3,
            one_time_pass: OTP,
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );
        console.log(appUserpayload);

        const CustomerUserPayload = await customerUser.create(
          {
            full_name: full_name,
            email: username,
            id_app_user: appUserpayload.dataValues.id,
            mobile: mobile,
            country_id: country_id,
            created_date: getLocalDate(),
            created_by: appUserpayload.dataValues.id,
            is_active: ActiveStatus.Active,
            is_deleted: "0",
          },
          { transaction: trn }
        );

        await trn.commit();
        const mailPayload = {
          toEmailAddress: username,
          contentTobeReplaced: { name: full_name, OTP },
        };
        await mailRegistationOtp(mailPayload);

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

export const customerRegisterOtpVerified = async (req: Request) => {
  try {
    const userData = await AppUser.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });

    if (userData) {
      if (userData.dataValues.one_time_pass === req.body.OTP) {
        await AppUser.update(
          {
            user_status: USER_STATUS.Approved,
            is_email_verified: 1,
            approved_date: getLocalDate(),
            modified_date: getLocalDate(),
          },

          { where: { id: userData.dataValues.id, is_deleted: "0" } }
        );

        const jwtPayload = {
          id: userData && userData.dataValues.id,
          id_app_user: userData.dataValues.id,
          user_type: userData.dataValues.user_type,
          id_role: userData.dataValues.id_role,
        };

        const data = createUserJWT(
          userData.dataValues.id,
          jwtPayload,
          userData.dataValues.user_type
        );
        const userDetails = await customerUser.findOne({
          where: { id_app_user: userData.dataValues.id, is_deleted: "0" },
          attributes: [
            "id",
            "full_name",
            "email",
            "mobile",
            "country_id",
            "id_app_user",
            "created_date",
            [Sequelize.literal("image.image_path"), "image_path"],
          ],
          include: [{ model: Image, as: "image", attributes: [] }],
        });
        let logo_image = IMAGE_PATH;
        let frontend_url = FRONT_END_BASE_URL;

        const mailPayload = {
          toEmailAddress: userData.dataValues.username,
          contentTobeReplaced: {
            full_name: userDetails?.dataValues.full_name,
            logo_image,
            frontend_url,
          },
        };
        await successRegistration(mailPayload);

        return resSuccess({
          data: {
            tokens: data,
            user_detail: userDetails,
          },
        });
      } else {
        return resBadRequest({ message: INVALID_OTP });
      }
    } else {
      return resNotFound({ message: USER_NOT_FOUND });
    }
  } catch (error) {
    throw error;
  }
};

export const resendOtpVerification = async (req: Request) => {
  try {
    const userData = await AppUser.findOne({
      where: { id: req.body.id, is_deleted: "0" },
    });
    const customer = await customerUser.findOne({
      where: { id_app_user: userData?.dataValues.id, is_deleted: "0" },
    });
    if (userData) {
      if (userData.dataValues.is_email_verified === "0") {
        const digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < OTP_GENERATE_DIGITS; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        await AppUser.update(
          {
            one_time_pass: OTP,
          },

          { where: { id: userData.dataValues.id, is_deleted: "0" } }
        );
        const name = customer?.dataValues.full_name;
        let logo_image = IMAGE_PATH;
        let frontend_url = FRONT_END_BASE_URL;
        const mailPayload = {
          toEmailAddress: userData.dataValues.username,
          contentTobeReplaced: { name, OTP, logo_image, frontend_url },
        };

        console.log("----------------------------");
        await mailRegistationOtp(mailPayload);
        return resSuccess();
      } else {
        return resBadRequest({ message: USER_EMAIL_ID_ALREADY_VERIFIED });
      }
    } else {
      return resNotFound({ message: USER_NOT_FOUND });
    }
  } catch (error) {
    throw error;
  }
};

export const updateProfileForCustomer = async (req: Request) => {
  const { full_name, mobile, updated_by, country_id, id } = req.body;

  try {
    const CustomerId = await customerUser.findOne({
      where: { id: id, is_deleted: "0" },
    });

    if (CustomerId == null) {
      return resNotFound();
    }

    let id_image = null;
    let imagePath = null;

    if (req.file) {
      const moveFileResult = await moveFileToS3ByType(dbContext,
        req.file,
        IMAGE_TYPE.profile,
        null
      );

      if (moveFileResult.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return moveFileResult;
      }

      imagePath = moveFileResult.data;
    }

    const trn = await dbContext.transaction();
    try {
      if (imagePath) {
        const imageResult = await Image.create(
          {
            image_path: imagePath,
            image_type: IMAGE_TYPE.profile,
            created_by: req.body.session_res.id_app_user,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );

        id_image = imageResult.dataValues.id;
      }

      const appUserInfo = await AppUser.update(
        {
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },

        {
          where: { id: CustomerId.dataValues.id_app_user, is_deleted: "0" },
          transaction: trn,
        }
      );

      const CustomerInfo = await customerUser.update(
        {
          full_name: full_name,
          mobile: mobile,
          country_id: country_id,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
          id_image: id_image,
        },

        {
          where: { id: CustomerId.dataValues.id, is_deleted: "0" },
          transaction: trn,
        }
      );
      if (CustomerInfo) {
        const CustomerInformation = await customerUser.findOne({
          where: { id: id, is_deleted: "0" },
          transaction: trn,
        });
        await trn.commit();
        return resSuccess({ data: CustomerInformation });
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
