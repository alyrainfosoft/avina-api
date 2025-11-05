import { Request } from "express";
import MetalMaster from "../../model/master/attributes/metal/metal-master.model";
import {
  ActiveStatus,
  ConfigStatus,
  ConfiguratorManageKeys,
  DeletedStatus,
} from "../../../utils/app-enumeration";
import { resSuccess, resUnknownError } from "../../../utils/shared-functions";
import { Op, QueryTypes, Transaction } from "sequelize";
import dbContext from "../../../config/db-context";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../utils/app-messages";
import MetalTone from "../../model/master/attributes/metal/metalTone.model";
import Gemstones from "../../model/master/attributes/gemstones.model";
import CutsData from "../../model/master/attributes/cuts.model";
import DiamondShape from "../../model/master/attributes/diamondShape.model";
import CaratSize from "../../model/master/attributes/caratSize.model";
import HeadsData from "../../model/master/attributes/heads.model";
import ShanksData from "../../model/master/attributes/shanks.model";
import SideSettingStyles from "../../model/master/attributes/side-setting-styles.model";
import DiamondGroupMaster from "../../model/master/attributes/diamond-group-master.model";
import GoldKarat from "../../model/master/attributes/metal/gold-karat.model";
import DiamondCaratSize from "../../model/master/attributes/caratSize.model";

const updateConfigFlag = async (
  list: any,
  configType: any,
  model: any,
  trn: Transaction
) => {
  try {
    let where: any = { is_deleted: DeletedStatus.No };
    let oldDataUpdatePayload: any = {};
    let newDataUpdatePayload: any = {};
    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      newDataUpdatePayload = { is_config: ConfigStatus.Yes };
      where = { ...where, is_config: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      newDataUpdatePayload = { is_three_stone: ConfigStatus.Yes };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      newDataUpdatePayload = { is_band: ConfigStatus.Yes };
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      newDataUpdatePayload = { is_bracelet: ConfigStatus.Yes };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      newDataUpdatePayload = { is_pendant: ConfigStatus.Yes };
      where = { ...where, is_pendant: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      newDataUpdatePayload = { is_earring: ConfigStatus.Yes };
      where = { ...where, is_earring: ConfigStatus.Yes };
    }
    await model.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });

    await model.update(newDataUpdatePayload, {
      where: { id: { [Op.in]: list } },
      transaction: trn,
    });
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateDiamondShape = async (
  list: any,
  configType: any,
  trn: Transaction
) => {
  try {
    let where: any = { is_deleted: DeletedStatus.No };
    let oldDataUpdatePayload: any = {};

    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      where = { ...where, is_config: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      where = { ...where, is_pendant: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      where = { ...where, is_earring: ConfigStatus.Yes };
    }
    await DiamondShape.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    const diamondShape = await DiamondShape.findAll({
      where: { is_deleted: DeletedStatus.No },
      transaction: trn,
    });
    const updatedList = [];
    for (let index = 0; index < list.length; index++) {
      const findDiamondShape = diamondShape.find(
        (item: any) => item.id === list[index].id
      );
      if (findDiamondShape) {
        let payload: any = {};
        if (configType === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findDiamondShape.dataValues,
            is_config: ConfigStatus.Yes,
            sort_order: {
              ...findDiamondShape.dataValues.sort_order,
              [ConfiguratorManageKeys.RingConfigurator]: list[index].sort_order,
            },
            diamond_size_id: {
              ...findDiamondShape.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].diamond_size,
            },
            is_diamond: {
              ...findDiamondShape.dataValues.is_diamond,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findDiamondShape.dataValues,
            is_three_stone: ConfigStatus.Yes,
            sort_order: {
              ...findDiamondShape.dataValues.sort_order,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].sort_order,
            },
            diamond_size_id: {
              ...findDiamondShape.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].diamond_size,
            },
            is_diamond: {
              ...findDiamondShape.dataValues.is_diamond,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findDiamondShape.dataValues,
            is_band: ConfigStatus.Yes,
            sort_order: {
              ...findDiamondShape.dataValues.sort_order,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].sort_order,
            },
            diamond_size_id: {
              ...findDiamondShape.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].diamond_size,
            },
            is_diamond: {
              ...findDiamondShape.dataValues.is_diamond,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findDiamondShape.dataValues,
            is_bracelet: ConfigStatus.Yes,
            sort_order: {
              ...findDiamondShape.dataValues.sort_order,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].sort_order,
            },
            diamond_size_id: {
              ...findDiamondShape.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].diamond_size,
            },
            is_diamond: {
              ...findDiamondShape.dataValues.is_diamond,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findDiamondShape.dataValues,
            is_pendent: ConfigStatus.Yes,
            sort_order: {
              ...findDiamondShape.dataValues.sort_order,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].sort_order,
            },
            diamond_size_id: {
              ...findDiamondShape.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].diamond_size,
            },
            is_diamond: {
              ...findDiamondShape.dataValues.is_diamond,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findDiamondShape.dataValues,
            is_earring: ConfigStatus.Yes,
            sort_order: {
              ...findDiamondShape.dataValues.sort_order,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].sort_order,
            },
            diamond_size_id: {
              ...findDiamondShape.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].diamond_size,
            },
            is_diamond: {
              ...findDiamondShape.dataValues.is_diamond,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].diamond_type,
            },
          };
        }

        updatedList.push(payload);
      }
    }
    console.log(updatedList);
    if (updatedList.length > 0) {
      await DiamondShape.bulkCreate(updatedList, {
        updateOnDuplicate: [
          "diamond_size_id",
          "is_diamond",
          "sort_order",
          "is_config",
          "is_band",
          "is_three_stone",
          "is_bracelet",
          "is_pendant",
          "is_earring",
        ],
        transaction: trn,
      });
    }
    return resSuccess();
  } catch (error) {
    console.log("error", error);
    return resUnknownError({ data: error });
  }
};

const updateDiamondCaratSize = async (
  list: any,
  configType: any,
  trn: Transaction
) => {
  try {
    let where: any = { is_deleted: DeletedStatus.No };
    let oldDataUpdatePayload: any = {};

    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      where = { ...where, is_config: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      where = { ...where, is_pendant: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      where = { ...where, is_earring: ConfigStatus.Yes };
    }
    await CaratSize.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    const diamondSize = await CaratSize.findAll({
      where: { is_deleted: DeletedStatus.No },
      transaction: trn,
    });
    const updatedList = [];
    for (let index = 0; index < list.length; index++) {
      const findDiamondSize = diamondSize.find(
        (item: any) => item.id === list[index].id
      );
      if (findDiamondSize) {
        let payload: any = {};
        if (configType === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findDiamondSize.dataValues,
            is_config: ConfigStatus.Yes,
            is_diamond: {
              ...findDiamondSize.dataValues.is_diamond,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findDiamondSize.dataValues,
            is_three_stone: ConfigStatus.Yes,
            is_diamond: {
              ...findDiamondSize.dataValues.is_diamond,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findDiamondSize.dataValues,
            is_band: ConfigStatus.Yes,
            is_diamond: {
              ...findDiamondSize.dataValues.is_diamond,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findDiamondSize.dataValues,
            is_bracelet: ConfigStatus.Yes,
            is_diamond: {
              ...findDiamondSize.dataValues.is_diamond,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findDiamondSize.dataValues,
            is_pendent: ConfigStatus.Yes,
            is_diamond: {
              ...findDiamondSize.dataValues.is_diamond,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findDiamondSize.dataValues,
            is_earring: ConfigStatus.Yes,
            is_diamond: {
              ...findDiamondSize.dataValues.is_diamond,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].diamond_type,
            },
          };
        }

        updatedList.push(payload);
      }
    }

    if (updatedList.length > 0) {
      await CaratSize.bulkCreate(updatedList, {
        updateOnDuplicate: [
          "is_diamond",
          "is_config",
          "is_band",
          "is_three_stone",
          "is_bracelet",
          "is_pendant",
          "is_earring",
        ],
        transaction: trn,
      });
    }
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateHead = async (list: any, configType: any, trn: Transaction) => {
  try {
    let where: any = { is_deleted: DeletedStatus.No };
    let oldDataUpdatePayload: any = {};

    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      where = { ...where, is_config: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      where = { ...where, is_pendant: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      where = { ...where, is_earring: ConfigStatus.Yes };
    }
    await HeadsData.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    const heads = await HeadsData.findAll({
      where: { is_deleted: DeletedStatus.No },
      transaction: trn,
    });
    const updatedList = [];
    for (let index = 0; index < list.length; index++) {
      const findHead = heads.find((item: any) => item.id === list[index].id);
      if (findHead) {
        let payload: any = {};
        if (configType === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findHead.dataValues,
            is_config: ConfigStatus.Yes,
            diamond_shape_id: {
              ...findHead.dataValues.diamond_shape_id,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].diamond_shape,
            },
            diamond_size_id: {
              ...findHead.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].diamond_size,
            },
            sort_order: {
              ...findHead.dataValues.sort_order,
              [ConfiguratorManageKeys.RingConfigurator]: list[index].sort_order,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findHead.dataValues,
            is_three_stone: ConfigStatus.Yes,
            diamond_shape_id: {
              ...findHead.dataValues.diamond_shape_id,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].diamond_shape,
            },
            diamond_size_id: {
              ...findHead.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].diamond_size,
            },
            sort_order: {
              ...findHead.dataValues.sort_order,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findHead.dataValues,
            is_band: ConfigStatus.Yes,
            diamond_shape_id: {
              ...findHead.dataValues.diamond_shape_id,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].diamond_shape,
            },
            diamond_size_id: {
              ...findHead.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].diamond_size,
            },
            sort_order: {
              ...findHead.dataValues.sort_order,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findHead.dataValues,
            is_bracelet: ConfigStatus.Yes,
            diamond_shape_id: {
              ...findHead.dataValues.diamond_shape_id,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].diamond_shape,
            },
            diamond_size_id: {
              ...findHead.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].diamond_size,
            },
            sort_order: {
              ...findHead.dataValues.sort_order,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findHead.dataValues,
            is_pendent: ConfigStatus.Yes,
            diamond_shape_id: {
              ...findHead.dataValues.diamond_shape_id,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].diamond_shape,
            },
            diamond_size_id: {
              ...findHead.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].diamond_size,
            },
            sort_order: {
              ...findHead.dataValues.sort_order,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findHead.dataValues,
            is_earring: ConfigStatus.Yes,
            diamond_shape_id: {
              ...findHead.dataValues.diamond_shape_id,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].diamond_shape,
            },
            diamond_size_id: {
              ...findHead.dataValues.diamond_size_id,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].diamond_size,
            },
            sort_order: {
              ...findHead.dataValues.sort_order,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].sort_order,
            },
          };
        }

        updatedList.push(payload);
      }
    }

    if (updatedList.length > 0) {
      await HeadsData.bulkCreate(updatedList, {
        updateOnDuplicate: [
          "diamond_shape_id",
          "diamond_size_id",
          "sort_order",
          "is_config",
          "is_band",
          "is_three_stone",
          "is_bracelet",
          "is_pendant",
          "is_earring",
        ],
        transaction: trn,
      });
    }
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};
const updateShank = async (list: any, configType: any, trn: Transaction) => {
  try {
    let where: any = { is_deleted: DeletedStatus.No };
    let oldDataUpdatePayload: any = {};

    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      where = { ...where, is_config: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      where = { ...where, is_pendant: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      where = { ...where, is_earring: ConfigStatus.Yes };
    }
    await ShanksData.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    const shanks = await ShanksData.findAll({
      where: { is_deleted: DeletedStatus.No },
      transaction: trn,
    });
    const updatedList = [];
    for (let index = 0; index < list.length; index++) {
      const findShank = shanks.find((item: any) => item.id === list[index].id);
      if (findShank) {
        let payload: any = {};
        if (configType === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findShank.dataValues,
            is_config: ConfigStatus.Yes,
            sort_order: {
              ...findShank.dataValues.sort_order,
              [ConfiguratorManageKeys.RingConfigurator]: list[index].sort_order,
            },
            side_setting_id: {
              ...findShank.dataValues.side_setting_id,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].side_setting,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findShank.dataValues,
            is_three_stone: ConfigStatus.Yes,
            sort_order: {
              ...findShank.dataValues.sort_order,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].sort_order,
            },
            side_setting_id: {
              ...findShank.dataValues.side_setting_id,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].side_setting,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findShank.dataValues,
            is_band: ConfigStatus.Yes,
            sort_order: {
              ...findShank.dataValues.sort_order,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].sort_order,
            },
            side_setting_id: {
              ...findShank.dataValues.side_setting_id,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].side_setting,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findShank.dataValues,
            is_bracelet: ConfigStatus.Yes,
            sort_order: {
              ...findShank.dataValues.sort_order,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].sort_order,
            },
            side_setting_id: {
              ...findShank.dataValues.side_setting_id,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].side_setting,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findShank.dataValues,
            is_pendent: ConfigStatus.Yes,
            sort_order: {
              ...findShank.dataValues.sort_order,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].sort_order,
            },
            side_setting_id: {
              ...findShank.dataValues.side_setting_id,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].side_setting,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findShank.dataValues,
            is_earring: ConfigStatus.Yes,
            sort_order: {
              ...findShank.dataValues.sort_order,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].sort_order,
            },
            side_setting_id: {
              ...findShank.dataValues.side_setting_id,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].side_setting,
            },
          };
        }

        updatedList.push(payload);
      }
    }

    if (updatedList.length > 0) {
      await ShanksData.bulkCreate(updatedList, {
        updateOnDuplicate: [
          "side_setting_id",
          "sort_order",
          "is_config",
          "is_band",
          "is_three_stone",
          "is_bracelet",
          "is_pendant",
          "is_earring",
        ],
        transaction: trn,
      });
    }
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateSideSetting = async (
  list: any,
  configType: any,
  trn: Transaction
) => {
  try {
    let where: any = { is_deleted: DeletedStatus.No };
    let oldDataUpdatePayload: any = {};

    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      where = { ...where, is_config: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      where = { ...where, is_pendant: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      where = { ...where, is_earring: ConfigStatus.Yes };
    }
    await SideSettingStyles.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    const sideSetting = await SideSettingStyles.findAll({
      where: { is_deleted: DeletedStatus.No },
      transaction: trn,
    });
    const updatedList = [];
    for (let index = 0; index < list.length; index++) {
      const findSetting = sideSetting.find(
        (item: any) => item.id === list[index].id
      );
      if (findSetting) {
        let payload: any = {};
        if (configType === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findSetting.dataValues,
            is_config: ConfigStatus.Yes,
            sort_order: {
              ...findSetting.dataValues.sort_order,
              [ConfiguratorManageKeys.RingConfigurator]: list[index].sort_order,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findSetting.dataValues,
            is_three_stone: ConfigStatus.Yes,
            sort_order: {
              ...findSetting.dataValues.sort_order,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findSetting.dataValues,
            is_band: ConfigStatus.Yes,
            sort_order: {
              ...findSetting.dataValues.sort_order,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findSetting.dataValues,
            is_bracelet: ConfigStatus.Yes,
            sort_order: {
              ...findSetting.dataValues.sort_order,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findSetting.dataValues,
            is_pendent: ConfigStatus.Yes,
            sort_order: {
              ...findSetting.dataValues.sort_order,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].sort_order,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findSetting.dataValues,
            is_earring: ConfigStatus.Yes,
            sort_order: {
              ...findSetting.dataValues.sort_order,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].sort_order,
            },
          };
        }

        updatedList.push(payload);
      }
    }

    if (updatedList.length > 0) {
      await SideSettingStyles.bulkCreate(updatedList, {
        updateOnDuplicate: [
          "sort_order",
          "is_config",
          "is_band",
          "is_three_stone",
          "is_bracelet",
          "is_pendant",
          "is_earring",
        ],
        transaction: trn,
      });
    }
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateDiamondColorClarity = async (
  list: any,
  configType: any,
  trn: Transaction
) => {
  try {
    let where: any = {
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
    };
    let oldDataUpdatePayload: any = {};

    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      where = { ...where, is_config: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      where = { ...where, is_pendant: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      where = { ...where, is_earring: ConfigStatus.Yes };
    }
    await DiamondGroupMaster.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    // const diamondGroupMaster = await DiamondGroupMaster.findAll({
    //   where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    //   transaction: trn,
    // });
    const diamondGroupMaster = await dbContext.query(
      `WITH ranked_diamonds AS (
    SELECT 
        id_color, 
        id_clarity, 
        id, 
        JSON_AGG(is_diamond_type) AS diamond_type,
        MAX(CAST(diamond_group_masters.is_config AS int)) AS is_config,
        MAX(CAST(diamond_group_masters.is_band AS int)) AS is_band,
        MAX(CAST(diamond_group_masters.is_three_stone AS int)) AS is_three_stone,
        MAX(CAST(diamond_group_masters.is_bracelet AS int)) AS is_bracelet,
        MAX(CAST(diamond_group_masters.is_pendant AS int)) AS is_pendant,
        MAX(CAST(diamond_group_masters.is_earring AS int)) AS is_earring,
        ROW_NUMBER() OVER (PARTITION BY id_color, id_clarity ORDER BY id ASC) AS row_num
    FROM diamond_group_masters 
    WHERE id_color IS NOT NULL 
    GROUP BY id_color, id_clarity, id
)
SELECT 
	id,
    id_color, 
    id_clarity, 
    STRING_AGG(id::TEXT, ',' ORDER BY id ASC) AS id_list,  
    JSON_AGG(diamond_type) AS diamond_type,  
    MAX(is_config) AS is_config,
    MAX(is_band) AS is_band,
    MAX(is_three_stone) AS is_three_stone,
    MAX(is_bracelet) AS is_bracelet,
    MAX(is_pendant) AS is_pendant,
    MAX(is_earring) AS is_earring
FROM ranked_diamonds
WHERE row_num <= 1 AND id_color IS NOT NULL
GROUP BY id_color, id_clarity, id;
`,
      { type: QueryTypes.SELECT }
    );

    const updatedList = [];
    for (let index = 0; index < list.length; index++) {
      let findColorClarity: any;
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        findColorClarity = diamondGroupMaster.find(
          (item: any) =>
            item.id_color === list[index].id_color &&
            item.id_clarity === list[index].id_clarity &&
            item.is_config === ConfigStatus.Yes
        );

        if (!findColorClarity) {
          findColorClarity = diamondGroupMaster.find(
            (item: any) =>
              item.id_color === list[index].id_color &&
              item.id_clarity === list[index].id_clarity
          );
        }
      } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
        findColorClarity = diamondGroupMaster.find(
          (item: any) =>
            item.id_color === list[index].id_color &&
            item.id_clarity === list[index].id_clarity &&
            item.is_three_stone === ConfigStatus.Yes
        );

        if (!findColorClarity) {
          findColorClarity = diamondGroupMaster.find(
            (item: any) =>
              item.id_color === list[index].id_color &&
              item.id_clarity === list[index].id_clarity
          );
        }
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        findColorClarity = diamondGroupMaster.find(
          (item: any) =>
            item.id_color === list[index].id_color &&
            item.id_clarity === list[index].id_clarity &&
            item.is_pendent === ConfigStatus.Yes
        );

        if (!findColorClarity) {
          findColorClarity = diamondGroupMaster.find(
            (item: any) =>
              item.id_color === list[index].id_color &&
              item.id_clarity === list[index].id_clarity
          );
        }
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        findColorClarity = diamondGroupMaster.find(
          (item: any) =>
            item.id_color === list[index].id_color &&
            item.id_clarity === list[index].id_clarity &&
            item.is_band === ConfigStatus.Yes
        );

        if (!findColorClarity) {
          findColorClarity = diamondGroupMaster.find(
            (item: any) =>
              item.id_color === list[index].id_color &&
              item.id_clarity === list[index].id_clarity
          );
        }
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        findColorClarity = diamondGroupMaster.find(
          (item: any) =>
            item.id_color === list[index].id_color &&
            item.id_clarity === list[index].id_clarity
        );

        if (!findColorClarity) {
          findColorClarity = diamondGroupMaster.find(
            (item: any) =>
              item.id_color === list[index].id_color &&
              item.id_clarity === list[index].id_clarity
          );
        }
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        findColorClarity = diamondGroupMaster.find(
          (item: any) =>
            item.id_color === list[index].id_color &&
            item.id_clarity === list[index].id_clarity &&
            item.is_bracelet === ConfigStatus.Yes
        );

        if (!findColorClarity) {
          findColorClarity = diamondGroupMaster.find(
            (item: any) =>
              item.id_color === list[index].id_color &&
              item.id_clarity === list[index].id_clarity
          );
        }
      }
      if (findColorClarity) {
        let payload: any = {};
        if (configType === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findColorClarity,
            is_config: ConfigStatus.Yes,
            is_diamond_type: {
              ...findColorClarity.is_diamond_type,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findColorClarity,
            is_three_stone: ConfigStatus.Yes,
            is_diamond_type: {
              ...findColorClarity.is_diamond_type,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].diamond_type,
            },
          };

          console.log("payloadpayloadpayloadpayload", payload);
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findColorClarity,
            is_band: ConfigStatus.Yes,
            is_diamond_type: {
              ...findColorClarity.is_diamond_type,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findColorClarity,
            is_bracelet: ConfigStatus.Yes,
            is_diamond_type: {
              ...findColorClarity.is_diamond_type,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findColorClarity,
            is_pendent: ConfigStatus.Yes,
            is_diamond_type: {
              ...findColorClarity.is_diamond_type,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findColorClarity,
            is_earring: ConfigStatus.Yes,
            is_diamond_type: {
              ...findColorClarity.is_diamond_type,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].diamond_type,
            },
          };
        }

        updatedList.push(payload);
      }
    }
    if (updatedList.length > 0) {
      for (const data of updatedList) {
        await DiamondGroupMaster.update(
          {
            is_diamond_type: data.is_diamond_type,
            is_config: data.is_config,
            is_band: data.is_band,
            is_three_stone: data.is_three_stone,
            is_bracelet: data.is_bracelet,
            is_pendant: data.is_pendant,
            is_earring: data.is_earring,
          },
          { where: { id: data.id }, transaction: trn }
        );
      }
    }
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};
export const updateConfiguratorMasterData = async (req: Request) => {
  const trn = await dbContext.transaction();
  try {
    const {
      metal_master,
      metal_tone_master,
      metal_karat_master,
      stone_master,
      cut_master,
      diamond_shape_master,
      diamond_carat_size_master,
      head_master,
      shank_master,
      side_setting_master,
      color_clarity_master,
    } = req.body;

    if (metal_master && metal_master.length > 0) {
      const metalData = await updateConfigFlag(
        metal_master,
        req.params.config_type,
        MetalMaster,
        trn
      );
      if (metalData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return metalData;
      }
    }
    if (metal_tone_master && metal_tone_master.length > 0) {
      const metalToneData = await updateConfigFlag(
        metal_tone_master,
        req.params.config_type,
        MetalTone,
        trn
      );
      if (metalToneData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return metalToneData;
      }
    }
    if (metal_karat_master && metal_karat_master.length > 0) {
      const metalKaratData = await updateConfigFlag(
        metal_karat_master,
        req.params.config_type,
        GoldKarat,
        trn
      );
      if (metalKaratData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return metalKaratData;
      }
    }
    if (stone_master && stone_master.length > 0) {
      const stoneData = await updateConfigFlag(
        stone_master,
        req.params.config_type,
        Gemstones,
        trn
      );
      if (stoneData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return stoneData;
      }
    }
    if (cut_master && cut_master.length > 0) {
      const cutData = await updateConfigFlag(
        cut_master,
        req.params.config_type,
        CutsData,
        trn
      );
      if (cutData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return cutData;
      }
    }
    if (diamond_shape_master && diamond_shape_master.length > 0) {
      const diamondShapeData = await updateDiamondShape(
        diamond_shape_master,
        req.params.config_type,
        trn
      );
      if (diamondShapeData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return diamondShapeData;
      }
    }
    if (diamond_carat_size_master && diamond_carat_size_master.length > 0) {
      const diamondCaratData = await updateDiamondCaratSize(
        diamond_carat_size_master,
        req.params.config_type,
        trn
      );
      if (diamondCaratData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return diamondCaratData;
      }
    }
    if (head_master && head_master.length > 0) {
      const headData = await updateHead(
        head_master,
        req.params.config_type,
        trn
      );
      if (headData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return headData;
      }
    }
    if (shank_master && shank_master.length > 0) {
      const shankData = await updateShank(
        shank_master,
        req.params.config_type,
        trn
      );
      if (shankData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return shankData;
      }
    }
    if (side_setting_master && side_setting_master.length > 0) {
      const sideSettingData = await updateSideSetting(
        side_setting_master,
        req.params.config_type,
        trn
      );
      if (sideSettingData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return sideSettingData;
      }
    }
    if (color_clarity_master && color_clarity_master.length > 0) {
      const colorClarityData = await updateDiamondColorClarity(
        color_clarity_master,
        req.params.config_type,
        trn
      );
      if (colorClarityData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return colorClarityData;
      }
    }

    trn.commit();
    return resSuccess();
  } catch (error) {
    trn.rollback();
    throw error;
  }
};

export const allMasterListData = async (req: Request) => {
  try {
    const where = {
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
    };

    const metalMasterData = await MetalMaster.findAll({
      where,
      attributes: [
        "id",
        "name",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
      ],
    });

    const metalToneData = await MetalTone.findAll({
      where,
      attributes: [
        "id",
        "name",
        "sort_code",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
      ],
    });

    const metalKaratData = await GoldKarat.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
      ],
    });

    const stoneData = await Gemstones.findAll({
      where,
      attributes: [
        "id",
        "name",
        "sort_code",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
      ],
    });

    const diamondCutData = await CutsData.findAll({
      where,
      attributes: [
        "id",
        "value",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
      ],
    });

    const diamondShapeData = await DiamondShape.findAll({
      where,
      attributes: [
        "id",
        "name",
        "sort_code",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        ["is_diamond", "diamond_type"],
        "sort_order",
        ["diamond_size_id", "diamond_size"],
      ],
    });

    const diamondCaratSize = await DiamondCaratSize.findAll({
      order: [["sort_code", "DESC"]],
      where,
      attributes: [
        "id",
        "value",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        ["is_diamond", "diamond_type"],
      ],
    });

    const headData = await HeadsData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "sort_code",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        ["diamond_shape_id", "diamond_shape"],
        ["diamond_size_id", "diamond_size"],
        "sort_order",
      ],
    });

    const shankData = await ShanksData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "sort_code",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        ["side_setting_id", "side_setting"],
        "sort_order",
      ],
    });

    const sideSettingData = await SideSettingStyles.findAll({
      where,
      attributes: [
        "id",
        "name",
        "sort_code",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        "sort_order",
      ],
    });

    const colorClarityData = await dbContext.query(
      `WITH ranked_diamonds AS (
    SELECT 
        id_color, 
        id_clarity, 
        diamond_group_masters.id as id, 
        is_diamond_type AS diamond_type,
		colors.name as color_name,
	clarities.name as clarity_name,
        MAX(CAST(diamond_group_masters.is_config AS int)) AS is_config,
        MAX(CAST(diamond_group_masters.is_band AS int)) AS is_band,
        MAX(CAST(diamond_group_masters.is_three_stone AS int)) AS is_three_stone,
        MAX(CAST(diamond_group_masters.is_bracelet AS int)) AS is_bracelet,
        MAX(CAST(diamond_group_masters.is_pendant AS int)) AS is_pendant,
        MAX(CAST(diamond_group_masters.is_earring AS int)) AS is_earring,
        ROW_NUMBER() OVER (PARTITION BY id_color, id_clarity ORDER BY diamond_group_masters.id ASC) AS row_num
    FROM diamond_group_masters 
	LEFT JOIN colors ON colors.id = diamond_group_masters.id_color
	LEFT JOIN clarities ON clarities.id = diamond_group_masters.id_clarity
    WHERE id_color IS NOT NULL AND diamond_group_masters.is_deleted = '0' AND diamond_group_masters.is_active = '1'
    GROUP BY id_color, id_clarity, diamond_group_masters.id, colors.name, clarity_name
)
SELECT 
	id,
    id_color, 
    id_clarity, 
	clarity_name,
	color_name,
    STRING_AGG(id::TEXT, ',' ORDER BY id ASC) AS id_list,  -- Aggregating ids
    JSON_AGG(diamond_type) AS diamond_type,  -- Aggregating JSON field here
    MAX(is_config) AS is_config,
    MAX(is_band) AS is_band,
    MAX(is_three_stone) AS is_three_stone,
    MAX(is_bracelet) AS is_bracelet,
    MAX(is_pendant) AS is_pendant,
    MAX(is_earring) AS is_earring
FROM ranked_diamonds
WHERE row_num <= 1 AND id_color IS NOT NULL
GROUP BY id_color, id_clarity, id, color_name, clarity_name;`,
      { type: QueryTypes.SELECT }
    );
    const colorClarityList = colorClarityData.map((item: any) => {
      return {
        id: item.id,
        id_color: item.id_color,
        id_clarity: item.id_clarity,
        color_name: item.color_name,
        clarity_name: item.clarity_name,
        id_list: item.id_list,
        diamond_type:
          item.diamond_type &&
          item.diamond_type !== null &&
          item.diamond_type.length === 1
            ? item.diamond_type[0]
            : null,
        is_config: item.is_config,
        is_band: item.is_band,
        is_three_stone: item.is_three_stone,
        is_bracelet: item.is_bracelet,
        is_pendant: item.is_pendant,
        is_earring: item.is_earring,
      };
    });

    const cleanDiamondTypes = (data) => {
      const result = data.map((item) => {
        if (Array.isArray(item.diamond_type)) {
          // Remove null and {} values
          item.diamond_type = item.diamond_type.filter(
            (type) =>
              type !== null &&
              !(typeof type === "object" && Object.keys(type).length === 0)
          );
          // Remove duplicate objects
          const uniqueItems = new Set(
            item.diamond_type.map((type) => JSON.stringify(type))
          );
          item.diamond_type = Array.from(uniqueItems).map((type: any) =>
            JSON.parse(type)
          );
        }
        return item.diamond_type.length === 0
          ? { ...item, diamond_type: null }
          : { ...item, diamond_type: item.diamond_type[0] };
      });

      return result;
    };

    // Clean the data
    const cleanedData = cleanDiamondTypes(colorClarityData);
    return resSuccess({
      data: {
        metal_master: metalMasterData,
        metal_tone_master: metalToneData,
        metal_karat_master: metalKaratData,
        stone_master: stoneData,
        diamond_shape: diamondShapeData,
        diamond_cuts: diamondCutData,
        diamond_carat_size: diamondCaratSize,
        head_master: headData,
        shank_master: shankData,
        side_setting_master: sideSettingData,
        color_clarity_master: colorClarityList,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
