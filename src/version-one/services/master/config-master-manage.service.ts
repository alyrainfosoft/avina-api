import { Request } from "express";
import {
  ActiveStatus,
  ConfigStatus,
  ConfiguratorManageKeys,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
} from "../../../utils/app-enumeration";
import { Op, QueryTypes, Transaction } from "sequelize";
import { addActivityLogs, getCompanyIdBasedOnTheCompanyKey, getLocalDate, imageAddAndEditInDBAndS3, resSuccess, resUnknownError } from "../../../utils/shared-functions";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../../../utils/app-messages";
import { initModels } from "../../model/index.model";

const updateConfigFlag = async (
  list: any,
  configType: any,
  model: any,
  trn: Transaction,
  client_id: number,
  req: any
) => {
  try {
    let where: any = { is_deleted: DeletedStatus.No, company_info_id: client_id };
    let oldDataUpdatePayload: any = {};
    let newDataUpdatePayload: any = {};
    let columnKey: string = "";
    if (configType === ConfiguratorManageKeys.RingConfigurator) {
      oldDataUpdatePayload = { is_config: ConfigStatus.No };
      newDataUpdatePayload = { is_config: ConfigStatus.Yes };
      where = { ...where, is_config: ConfigStatus.Yes };
      columnKey = "is_config";
    } else if (configType === ConfiguratorManageKeys.ThreeStoneConfigurator) {
      oldDataUpdatePayload = { is_three_stone: ConfigStatus.No };
      newDataUpdatePayload = { is_three_stone: ConfigStatus.Yes };
      where = { ...where, is_three_stone: ConfigStatus.Yes };
      columnKey = "is_three_stone";
    } else if (configType === ConfiguratorManageKeys.EternityBandConfigurator) {
      oldDataUpdatePayload = { is_band: ConfigStatus.No };
      newDataUpdatePayload = { is_band: ConfigStatus.Yes };
      columnKey = "is_band";
      where = { ...where, is_band: ConfigStatus.Yes };
    } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
      oldDataUpdatePayload = { is_bracelet: ConfigStatus.No };
      newDataUpdatePayload = { is_bracelet: ConfigStatus.Yes };
      where = { ...where, is_bracelet: ConfigStatus.Yes };
      columnKey = "is_bracelet";
    } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
      oldDataUpdatePayload = { is_pendant: ConfigStatus.No };
      newDataUpdatePayload = { is_pendant: ConfigStatus.Yes };
      where = { ...where, is_pendant: ConfigStatus.Yes };
      columnKey = "is_pendant";
    } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
      oldDataUpdatePayload = { is_earring: ConfigStatus.No };
      newDataUpdatePayload = { is_earring: ConfigStatus.Yes };
      where = { ...where, is_earring: ConfigStatus.Yes };
      columnKey = "is_earring";
    }
    const editActivityLogs: any[] = [];

    const oldItems: any = await model.findAll({
      where: where,
      transaction: trn,
    });
    await model.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });

    for (const item of oldItems) {
      editActivityLogs.push({
        old_data: { id: item.id, data: { ...item.dataValues } },
        new_data: {
          id: item.id,
          data: {
            ...item.dataValues,
            [columnKey]: ConfigStatus.No,
          },
        },
      });
    }

    const newItems = await model.findAll({
      where: {
        id: { [Op.in]: list },
        company_info_id: client_id,
      },
      transaction: trn,
    });

    await model.update(newDataUpdatePayload, {
      where: { id: { [Op.in]: list }, company_info_id: client_id },
      transaction: trn,
    });

    for (const item of newItems) {
      editActivityLogs.push({
        old_data: { id: item.id, data: { ...item.dataValues } },
        new_data: {
          id: item.id,
          data: {
            ...item.dataValues,
            [columnKey]: ConfigStatus.Yes,
          },
        },
      });
    }
    if (editActivityLogs.length > 0) {
      await addActivityLogs(req,
        client_id,
        editActivityLogs,
        null,
        LogsActivityType.Edit,
        LogsType.configurator_setting,
        null,
        trn
      );
    }

    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateDiamondShape = async (
  list: any,
  configType: any,
  trn: Transaction,
  client_id: number,
  req: Request
) => {
  try {
    const { DiamondShape, HeadsData, SideSettingStyles } = initModels(req);
    let where: any = { is_deleted: DeletedStatus.No, company_info_id: client_id };
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
      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
      transaction: trn,
    });
    const updatedList = [];
    const editActivityLogs: any[] = [];
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
            is_pendant: ConfigStatus.Yes,
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

        // Check if any field has changed
        const hasChanged =
          JSON.stringify(findDiamondShape.dataValues.sort_order) !== JSON.stringify(payload.sort_order) ||
          JSON.stringify(findDiamondShape.dataValues.diamond_size_id) !== JSON.stringify(payload.diamond_size_id) ||
          JSON.stringify(findDiamondShape.dataValues.is_diamond) !== JSON.stringify(payload.is_diamond);

        if (hasChanged) {
          editActivityLogs.push({
            old_data: { id: findDiamondShape.dataValues.id, data: findDiamondShape.dataValues },
            new_data: { id: findDiamondShape.dataValues.id, data: payload },
          });
        }
      }
    }

    // in active data detail remove 
    const inActiveData = []
    const diamondShapeList = await DiamondShape.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: client_id }, transaction: trn });

    for (let index = 0; index < diamondShapeList.length; index++) {
      const element = diamondShapeList[index].dataValues;
      let payload: any = {};
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        let sortOrder = element.sort_order || {};
        console.log("element.sort_order", element, element.sort_order)
        delete sortOrder[ConfiguratorManageKeys.RingConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.RingConfigurator];
        let findDiamondShape = element.is_diamond || {};
        delete findDiamondShape[ConfiguratorManageKeys.RingConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          is_diamond: findDiamondShape,
        };
      } else if (
        configType === ConfiguratorManageKeys.ThreeStoneConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let findDiamondShape = element.is_diamond || {};
        delete findDiamondShape[ConfiguratorManageKeys.ThreeStoneConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          is_diamond: findDiamondShape,
        };
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EternityBandConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.EternityBandConfigurator];
        let findDiamondShape = element.is_diamond || {};
        delete findDiamondShape[ConfiguratorManageKeys.EternityBandConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          is_diamond: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.BraceletConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.BraceletConfigurator];
        let findDiamondShape = element.is_diamond || {};
        delete findDiamondShape[ConfiguratorManageKeys.BraceletConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          is_diamond: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.PendantConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.PendantConfigurator];
        let findDiamondShape = element.is_diamond || {};
        delete findDiamondShape[ConfiguratorManageKeys.PendantConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          is_diamond: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EarringConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.EarringConfigurator];
        let findDiamondShape = element.is_diamond || {};
        delete findDiamondShape[ConfiguratorManageKeys.EarringConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          is_diamond: findDiamondShape,
        };
      }

      inActiveData.push(payload);
    }
    if (inActiveData.length > 0) {
      await DiamondShape.bulkCreate(inActiveData, {
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



      if (editActivityLogs.length > 0) {
        await addActivityLogs(req,
          client_id,
          editActivityLogs,
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );
      }
    }
    const diamondShapeData = await DiamondShape.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: client_id }, transaction: trn });

    // remove inactive diamond shape id in heads master config setting
    const inactiveDataId = diamondShapeData.map((item: any) => item.dataValues.id);
    if (inactiveDataId.length > 0) {

      if(configType == ConfiguratorManageKeys.RingConfigurator || configType == ConfiguratorManageKeys.EarringConfigurator){
        const findHeads = await HeadsData.findAll({ where: {is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        let updateHeadData: any = [];
        
      for (let index = 0; index < findHeads.length; index++) {
        const element = findHeads[index];
        let data = element.dataValues.diamond_shape_id
        if (data && data[configType]) {
        data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
        }

        updateHeadData.push({
          ...element.dataValues,
          diamond_shape_id: data,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        })
        }
        await HeadsData.bulkCreate(updateHeadData, { updateOnDuplicate: ['diamond_shape_id'], transaction: trn });

        // remove inactive diamond shape id in side setting master config setting
      } else if (configType == ConfiguratorManageKeys.EternityBandConfigurator || configType == ConfiguratorManageKeys.BraceletConfigurator) {
        const findSetting = await SideSettingStyles.findAll({ where: {is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        let updateSideSettingData: any = [];
        
      for (let index = 0; index < findSetting.length; index++) {
        const element = findSetting[index];
        let data = element.dataValues.diamond_shape_id
        if (data && data[configType]) {
        data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
        }

        updateSideSettingData.push({
          ...element.dataValues,
          diamond_shape_id: data,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        })
        }
        await SideSettingStyles.bulkCreate(updateSideSettingData, { updateOnDuplicate: ['diamond_shape_id'], transaction: trn });
      }
      
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
  trn: Transaction,
  client_id: number,
  req: Request
) => {
  try {
    const { DiamondCaratSize, DiamondShape, HeadsData, SideSettingStyles } = initModels(req);

    let where: any = { is_deleted: DeletedStatus.No, company_info_id: client_id };
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
    await DiamondCaratSize.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    const diamondSize = await DiamondCaratSize.findAll({
      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
      transaction: trn,
    });
    const updatedList = [];
    const editActivityLogs: any[] = [];
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
            is_pendant: ConfigStatus.Yes,
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

        // Check if any field has changed
        const hasChanged =
          JSON.stringify(findDiamondSize.dataValues.is_earring) !== JSON.stringify(payload.is_earring) ||
          JSON.stringify(findDiamondSize.dataValues.is_diamond) !== JSON.stringify(payload.is_diamond);

        if (hasChanged) {
          editActivityLogs.push({
            old_data: { id: findDiamondSize.dataValues.id, data: findDiamondSize.dataValues },
            new_data: { id: findDiamondSize.dataValues.id, data: payload },
          });
        }
      }
    }

    // in active data detail remove 
    const inActiveData = []
    const diamondCaratList = await DiamondCaratSize.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No }, transaction: trn });

    for (let index = 0; index < diamondCaratList.length; index++) {
      const element = diamondCaratList[index].dataValues;
      let payload: any = {};
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        let isDiamond = element.is_diamond || {};
        delete isDiamond[ConfiguratorManageKeys.RingConfigurator];
        payload = {
          ...element,
          is_diamond: isDiamond,
        };
      } else if (
        configType === ConfiguratorManageKeys.ThreeStoneConfigurator
      ) {
        let isDiamond = element.is_diamond || {};
        delete isDiamond[ConfiguratorManageKeys.ThreeStoneConfigurator];
        payload = {
          ...element,
          is_diamond: isDiamond,
        };
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        let isDiamond = element.is_diamond || {};
        delete isDiamond[ConfiguratorManageKeys.EternityBandConfigurator];
        payload = {
          ...element,
          is_diamond: isDiamond,
        };
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        let isDiamond = element.is_diamond || {};
        delete isDiamond[ConfiguratorManageKeys.BraceletConfigurator];
        payload = {
          ...element,
          is_diamond: isDiamond,
        };
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        let isDiamond = element.is_diamond || {};
        delete isDiamond[ConfiguratorManageKeys.PendantConfigurator];
        payload = {
          ...element,
          is_diamond: isDiamond,
        };
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        let isDiamond = element.is_diamond || {};
        delete isDiamond[ConfiguratorManageKeys.EarringConfigurator];
        payload = {
          ...element,
          is_diamond: isDiamond,
        };
      }

      inActiveData.push(payload);
    }
    if (inActiveData.length > 0) {
      await DiamondCaratSize.bulkCreate(inActiveData, {
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
      if (editActivityLogs.length > 0) {
        await addActivityLogs(req,
          client_id,
          editActivityLogs,
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );
      }
    }
    if (updatedList.length > 0) {
      await DiamondCaratSize.bulkCreate(updatedList, {
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
      if (editActivityLogs.length > 0) {
        await addActivityLogs(req,
          client_id,
          editActivityLogs,
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );
      }
    }

    // remove inactive diamond size id in diamond shape master, head master & side setting config setting
    const diamondCaratData = await DiamondCaratSize.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: client_id }, transaction: trn });

    const inactiveDataId = diamondCaratData.map((item: any) => item.dataValues.id);
    if (inactiveDataId.length > 0) {

      if (configType == ConfiguratorManageKeys.RingConfigurator || configType == ConfiguratorManageKeys.EarringConfigurator) {
        const findDiamondShape = await DiamondShape.findAll({ where: { is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        const findHeads = await HeadsData.findAll({ where: { is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        let updateDiamondShapeData: any = [];
        for (let index = 0; index < findDiamondShape.length; index++) {
          const element = findDiamondShape[index];
          let data = element.dataValues.diamond_size_id
         
          if (data && data[configType]) {
            data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
          }

          updateDiamondShapeData.push({
            ...element.dataValues,
            diamond_size_id: data,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          })
        }
        await DiamondShape.bulkCreate(updateDiamondShapeData, { updateOnDuplicate: ['diamond_size_id'], transaction: trn });
        
        let updateHeadData: any = [];
        
        for (let index = 0; index < findHeads.length; index++) {
          const element = findHeads[index];
          let data = element.dataValues.diamond_size_id
          if (data && data[configType]) {
            data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
          }

          updateHeadData.push({
            ...element.dataValues,
            diamond_size_id: data,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          })
        }
        await HeadsData.bulkCreate(updateHeadData, { updateOnDuplicate: ['diamond_size_id'], transaction: trn });

        // remove inactive diamond shape id in side setting master config setting
      } else if (configType == ConfiguratorManageKeys.EternityBandConfigurator || configType == ConfiguratorManageKeys.BraceletConfigurator) {
        const findDiamondShape = await DiamondShape.findAll({ where: { is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        
        const findSetting = await SideSettingStyles.findAll({ where: { is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        let updateDiamondShapeData: any = [];
        
        for (let index = 0; index < findDiamondShape.length; index++) {
          const element = findDiamondShape[index];
          let data = element.dataValues.diamond_size_id
          if (data && data[configType]) {
            data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
          }

          updateDiamondShapeData.push({
            ...element.dataValues,
            diamond_size_id: data,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          })
        }
        await DiamondShape.bulkCreate(updateDiamondShapeData, { updateOnDuplicate: ['diamond_size_id'], transaction: trn });
        let updateSideSettingData: any = [];
        
        for (let index = 0; index < findSetting.length; index++) {
          const element = findSetting[index];
          let data = element.dataValues.diamond_size_id
          if (data && data[configType]) {
            data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
          }

          updateSideSettingData.push({
            ...element.dataValues,
            diamond_size_id: data,
            modified_by: req.body.session_res.id_app_user,
            modified_date: getLocalDate(),
          })
        }
        await SideSettingStyles.bulkCreate(updateSideSettingData, { updateOnDuplicate: ['diamond_size_id'], transaction: trn });
      } else if (configType == ConfiguratorManageKeys.ThreeStoneConfigurator) {
        const findDiamondShape = await DiamondShape.findAll({ where: {is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        let updateDiamondShapeData: any = [];
        
        for (let index = 0; index < findDiamondShape.length; index++) {
        const element = findDiamondShape[index];
        let data = element.dataValues.diamond_size_id
        if (data &&data[configType]) {
        data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
        }

        updateDiamondShapeData.push({
          ...element.dataValues,
          diamond_size_id: data,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        })
        }
        await DiamondShape.bulkCreate(updateDiamondShapeData, { updateOnDuplicate: ['diamond_size_id'], transaction: trn });
      
      }
    }
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateHead = async (list: any, configType: any, trn: Transaction, client_id: number, req: Request) => {
  try {
    const { HeadsData } = initModels(req);
    let where: any = { is_deleted: DeletedStatus.No, company_info_id: client_id };
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
      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
      transaction: trn,
    });
    const updatedList = [];
    const editActivityLogs: any[] = [];

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
            is_pendant: ConfigStatus.Yes,
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

        // Check if any field has changed
        const hasChanged =
          JSON.stringify(findHead.dataValues.sort_order) !== JSON.stringify(payload.sort_order) ||
          JSON.stringify(findHead.dataValues.diamond_size_id) !== JSON.stringify(payload.diamond_size_id) ||
          JSON.stringify(findHead.dataValues.diamond_shape_id) !== JSON.stringify(payload.diamond_shape_id);

        if (hasChanged) {
          editActivityLogs.push({
            old_data: { id: findHead.dataValues.id, data: findHead.dataValues },
            new_data: { id: findHead.dataValues.id, data: payload },
          });
        }
      }
    }
    // in active data detail remove 
    const inActiveData = []
    const headList = await HeadsData.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No }, transaction: trn });

    for (let index = 0; index < headList.length; index++) {
      const element = headList[index].dataValues;
      let payload: any = {};
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.RingConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.RingConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.RingConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (
        configType === ConfiguratorManageKeys.ThreeStoneConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.ThreeStoneConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EternityBandConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.EternityBandConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.EternityBandConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.BraceletConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.BraceletConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.BraceletConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.PendantConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.PendantConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.PendantConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EarringConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.EarringConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.EarringConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      }

      inActiveData.push(payload);
    }
    if (inActiveData.length > 0) {
      await HeadsData.bulkCreate(inActiveData, {
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
      if (editActivityLogs.length > 0) {
        await addActivityLogs(req,
          client_id,
          editActivityLogs,
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );
      }
    }

    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};
const updateShank = async (list: any, configType: any, trn: Transaction, client_id: number, req: Request) => {
  try {
    const { ShanksData } = initModels(req);

    let where: any = { is_deleted: DeletedStatus.No, company_info_id: client_id };
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
      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
      transaction: trn,
    });
    const updatedList = [];
    const editActivityLogs: any[] = [];
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
            is_pendant: ConfigStatus.Yes,
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
        // Check if any field has changed
        const hasChanged =
          JSON.stringify(findShank.dataValues.sort_order) !== JSON.stringify(payload.sort_order) ||
          JSON.stringify(findShank.dataValues.is_earring) !== JSON.stringify(payload.is_earring) ||
          JSON.stringify(findShank.dataValues.side_setting_id) !== JSON.stringify(payload.side_setting_id);

        if (hasChanged) {
          editActivityLogs.push({
            old_data: { id: findShank.dataValues.id, data: findShank.dataValues },
            new_data: { id: findShank.dataValues.id, data: payload },
          });
        }
      }
    }
    // in active data detail remove 
    const inActiveData = []
    const shankList = await ShanksData.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No }, transaction: trn });

    for (let index = 0; index < shankList.length; index++) {
      const element = shankList[index].dataValues;
      let payload: any = {};
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.RingConfigurator];
        let sideSettingId = element.side_setting_id || {};
        delete sideSettingId[ConfiguratorManageKeys.RingConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          side_setting_id: sideSettingId,
        };
      } else if (
        configType === ConfiguratorManageKeys.ThreeStoneConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let sideSettingId = element.side_setting_id || {};
        delete sideSettingId[ConfiguratorManageKeys.ThreeStoneConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          side_setting_id: sideSettingId,
        };
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EternityBandConfigurator];
        let sideSettingId = element.side_setting_id || {};
        delete sideSettingId[ConfiguratorManageKeys.EternityBandConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          side_setting_id: sideSettingId,
        };
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.BraceletConfigurator];
        let sideSettingId = element.side_setting_id || {};
        delete sideSettingId[ConfiguratorManageKeys.BraceletConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          side_setting_id: sideSettingId,
        };
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.PendantConfigurator];
        let sideSettingId = element.side_setting_id || {};
        delete sideSettingId[ConfiguratorManageKeys.PendantConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          side_setting_id: sideSettingId,
        };
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EarringConfigurator];
        let sideSettingId = element.side_setting_id || {};
        delete sideSettingId[ConfiguratorManageKeys.EarringConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          side_setting_id: sideSettingId,
        };
      }

      inActiveData.push(payload);
    }
    if (inActiveData.length > 0) {
      await ShanksData.bulkCreate(inActiveData, {
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
      if (editActivityLogs.length > 0) {
        await addActivityLogs(req,
          client_id,
          editActivityLogs,
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );
      }
    }

    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};


const updateMetalKarat = async (list: any, configType: any, trn: Transaction, client_id: number, req: Request) => {
  try {
    const { GoldKarat } = initModels(req);

    let where: any = { is_deleted: DeletedStatus.No, company_info_id: client_id };
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
    await GoldKarat.update(oldDataUpdatePayload, {
      where: where,
      transaction: trn,
    });
    const karats = await GoldKarat.findAll({
      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
      transaction: trn,
    });
    const updatedList = [];
    const editActivityLogs: any[] = [];
    for (let index = 0; index < list.length; index++) {
      const findKarat = karats.find((item: any) => item.id === list[index].id);
      if (findKarat) {
        let payload: any = {};
        if (configType === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findKarat.dataValues,
            is_config: ConfigStatus.Yes,
            sort_order: {
              ...findKarat.dataValues.sort_order,
              [ConfiguratorManageKeys.RingConfigurator]: list[index].sort_order,
            },
            metal_tone_id: {
              ...findKarat.dataValues.metal_tone_id,
              [ConfiguratorManageKeys.RingConfigurator]:
                list[index].metal_tone,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findKarat.dataValues,
            is_three_stone: ConfigStatus.Yes,
            sort_order: {
              ...findKarat.dataValues.sort_order,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].sort_order,
            },
            metal_tone_id: {
              ...findKarat.dataValues.metal_tone_id,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].metal_tone,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findKarat.dataValues,
            is_band: ConfigStatus.Yes,
            sort_order: {
              ...findKarat.dataValues.sort_order,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].sort_order,
            },
            metal_tone_id: {
              ...findKarat.dataValues.metal_tone_id,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].metal_tone,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findKarat.dataValues,
            is_bracelet: ConfigStatus.Yes,
            sort_order: {
              ...findKarat.dataValues.sort_order,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].sort_order,
            },
            metal_tone_id: {
              ...findKarat.dataValues.metal_tone_id,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].metal_tone,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findKarat.dataValues,
            is_pendant: ConfigStatus.Yes,
            sort_order: {
              ...findKarat.dataValues.sort_order,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].sort_order,
            },
            metal_tone_id: {
              ...findKarat.dataValues.metal_tone_id,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].metal_tone,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findKarat.dataValues,
            is_earring: ConfigStatus.Yes,
            sort_order: {
              ...findKarat.dataValues.sort_order,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].sort_order,
            },
            metal_tone_id: {
              ...findKarat.dataValues.metal_tone_id,
              [ConfiguratorManageKeys.EarringConfigurator]:
                list[index].metal_tone,
            },
          };
        }

        updatedList.push(payload);
        // Check if any field has changed
        const hasChanged =
          JSON.stringify(findKarat.dataValues.sort_order) !== JSON.stringify(payload.sort_order) ||
          JSON.stringify(findKarat.dataValues.is_earring) !== JSON.stringify(payload.is_earring) ||
          JSON.stringify(findKarat.dataValues.metal_tone_id) !== JSON.stringify(payload.metal_tone_id);

        if (hasChanged) {
          editActivityLogs.push({
            old_data: { id: findKarat.dataValues.id, data: findKarat.dataValues },
            new_data: { id: findKarat.dataValues.id, data: payload },
          });
        }
      }
    }
    // in active data detail remove 
    const inActiveData = []
    const shankList = await GoldKarat.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No }, transaction: trn });

    for (let index = 0; index < shankList.length; index++) {
      const element = shankList[index].dataValues;
      let payload: any = {};
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.RingConfigurator];
        let metalToneId = element.metal_tone_id || {};
        delete metalToneId[ConfiguratorManageKeys.RingConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          metal_tone_id: metalToneId,
        };
      } else if (
        configType === ConfiguratorManageKeys.ThreeStoneConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let metalToneId = element.metal_tone_id || {};
        delete metalToneId[ConfiguratorManageKeys.ThreeStoneConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          metal_tone_id: metalToneId,
        };
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EternityBandConfigurator];
        let metalToneId = element.metal_tone_id || {};
        delete metalToneId[ConfiguratorManageKeys.EternityBandConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          metal_tone_id: metalToneId,
        };
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.BraceletConfigurator];
        let metalToneId = element.metal_tone_id || {};
        delete metalToneId[ConfiguratorManageKeys.BraceletConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          metal_tone_id: metalToneId,
        };
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.PendantConfigurator];
        let metalToneId = element.metal_tone_id || {};
        delete metalToneId[ConfiguratorManageKeys.PendantConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          metal_tone_id: metalToneId,
        };
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EarringConfigurator];
        let metalToneId = element.metal_tone_id || {};
        delete metalToneId[ConfiguratorManageKeys.EarringConfigurator];

        payload = {
          ...element,
          sort_order: sortOrder,
          metal_tone_id: metalToneId,
        };
      }

      inActiveData.push(payload);
    }
    if (inActiveData.length > 0) {
      await GoldKarat.bulkCreate(inActiveData, {
        updateOnDuplicate: [
          "metal_tone_id",
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
    if (updatedList.length > 0) {
      await GoldKarat.bulkCreate(updatedList, {
        updateOnDuplicate: [
          "metal_tone_id",
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
      if (editActivityLogs.length > 0) {
        await addActivityLogs(req,
          client_id,
          editActivityLogs,
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );
      }
    }

    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateSideSetting = async (
  list: any,
  configType: any,
  trn: Transaction,
  client_id: number,
  req: any
) => {
  try {
    const { SideSettingStyles, ShanksData } = initModels(req);

    let where: any = { is_deleted: DeletedStatus.No, company_info_id: client_id };
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
      where: { is_deleted: DeletedStatus.No, company_info_id: client_id },
      transaction: trn,
    });
    const updatedList = [];
    const editActivityLogs: any[] = [];
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
            diamond_shape_id: list[index].diamond_shape
              ? {
                ...findSetting.dataValues.diamond_shape_id,
                [ConfiguratorManageKeys.RingConfigurator]:
                  list[index].diamond_shape,
              }
              : { ...findSetting.dataValues.diamond_shape_id },
            diamond_size_id: list[index].diamond_size
              ? {
                ...findSetting.dataValues.diamond_size_id,
                [ConfiguratorManageKeys.RingConfigurator]:
                  list[index].diamond_size,
              }
              : { ...findSetting.dataValues.diamond_size_id },
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
            diamond_shape_id: list[index].diamond_shape
              ? {
                ...findSetting.dataValues.diamond_shape_id,
                [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                  list[index].diamond_shape,
              }
              : { ...findSetting.dataValues.diamond_shape_id },
            diamond_size_id: list[index].diamond_size
              ? {
                ...findSetting.dataValues.diamond_size_id,
                [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                  list[index].diamond_size,
              }
              : { ...findSetting.dataValues.diamond_size_id },
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
            diamond_shape_id: list[index].diamond_shape
              ? {
                ...findSetting.dataValues.diamond_shape_id,
                [ConfiguratorManageKeys.EternityBandConfigurator]:
                  list[index].diamond_shape,
              }
              : { ...findSetting.dataValues.diamond_shape_id },
            diamond_size_id: list[index].diamond_size
              ? {
                ...findSetting.dataValues.diamond_size_id,
                [ConfiguratorManageKeys.EternityBandConfigurator]:
                  list[index].diamond_size,
              }
              : { ...findSetting.dataValues.diamond_size_id },
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
            diamond_shape_id: list[index].diamond_shape
              ? {
                ...findSetting.dataValues.diamond_shape_id,
                [ConfiguratorManageKeys.BraceletConfigurator]:
                  list[index].diamond_shape,
              }
              : { ...findSetting.dataValues.diamond_shape_id },
            diamond_size_id: list[index].diamond_size
              ? {
                ...findSetting.dataValues.diamond_size_id,
                [ConfiguratorManageKeys.BraceletConfigurator]:
                  list[index].diamond_size,
              }
              : { ...findSetting.dataValues.diamond_size_id },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findSetting.dataValues,
            is_pendant: ConfigStatus.Yes,
            sort_order: {
              ...findSetting.dataValues.sort_order,
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].sort_order,
            },
            diamond_shape_id: list[index].diamond_shape
              ? {
                ...findSetting.dataValues.diamond_shape_id,
                [ConfiguratorManageKeys.PendantConfigurator]:
                  list[index].diamond_shape,
              }
              : { ...findSetting.dataValues.diamond_shape_id },
            diamond_size_id: list[index].diamond_size
              ? {
                ...findSetting.dataValues.diamond_size_id,
                [ConfiguratorManageKeys.PendantConfigurator]:
                  list[index].diamond_size,
              }
              : { ...findSetting.dataValues.diamond_size_id },
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
            diamond_shape_id: list[index].diamond_shape
              ? {
                ...findSetting.dataValues.diamond_shape_id,
                [ConfiguratorManageKeys.EarringConfigurator]:
                  list[index].diamond_shape,
              }
              : { ...findSetting.dataValues.diamond_shape_id },
            diamond_size_id: list[index].diamond_size
              ? {
                ...findSetting.dataValues.diamond_size_id,
                [ConfiguratorManageKeys.EarringConfigurator]:
                  list[index].diamond_size,
              }
              : { ...findSetting.dataValues.diamond_size_id },
          };
        }

        updatedList.push(payload);
        // Check if any field has changed
        const hasChanged =
          JSON.stringify(findSetting.dataValues.sort_order) !== JSON.stringify(payload.sort_order) ||
          JSON.stringify(findSetting.dataValues.diamond_size_id) !== JSON.stringify(payload.diamond_size_id) ||
          JSON.stringify(findSetting.dataValues.diamond_shape_id) !== JSON.stringify(payload.diamond_shape_id);

        if (hasChanged) {
          editActivityLogs.push({
            old_data: { id: findSetting.dataValues.id, data: findSetting.dataValues },
            new_data: { id: findSetting.dataValues.id, data: payload },
          });
        }
      }
    }
    // in active data detail remove 
    const inActiveData = []
    const sideSettingList = await SideSettingStyles.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No }, transaction: trn });

    for (let index = 0; index < sideSettingList.length; index++) {
      const element = sideSettingList[index].dataValues;
      let payload: any = {};
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.RingConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.RingConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.RingConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (
        configType === ConfiguratorManageKeys.ThreeStoneConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.ThreeStoneConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.ThreeStoneConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EternityBandConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.EternityBandConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.EternityBandConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.BraceletConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.BraceletConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.BraceletConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.PendantConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.PendantConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.PendantConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        let sortOrder = element.sort_order || {};
        delete sortOrder[ConfiguratorManageKeys.EarringConfigurator];
        let diamondSizeId = element.diamond_size_id || {};
        delete diamondSizeId[ConfiguratorManageKeys.EarringConfigurator];
        let findDiamondShape = element.diamond_shape_id || {};
        delete findDiamondShape[ConfiguratorManageKeys.EarringConfigurator];
        payload = {
          ...element,
          sort_order: sortOrder,
          diamond_size_id: diamondSizeId,
          diamond_shape_id: findDiamondShape,
        };
      }

      inActiveData.push(payload);
    }
    if (inActiveData.length > 0) {
      await SideSettingStyles.bulkCreate(inActiveData, {
        updateOnDuplicate: [
          "sort_order",
          "is_config",
          "is_band",
          "is_three_stone",
          "is_bracelet",
          "is_pendant",
          "is_earring",
          "diamond_shape_id",
          "diamond_size_id",
        ],
        transaction: trn,
      });

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
          "diamond_shape_id",
          "diamond_size_id",
        ],
        transaction: trn,
      });
      if (editActivityLogs.length > 0) {
        await addActivityLogs(req,
          client_id,
          editActivityLogs,
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );
      }
    }
    // remove inactive side setting style id in shank master config setting
    const sideSettingData = await SideSettingStyles.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: client_id }, transaction: trn });

    const inactiveDataId = sideSettingData.map((item: any) => item.dataValues.id);
    if (inactiveDataId.length > 0) {

      if (configType == ConfiguratorManageKeys.ThreeStoneConfigurator || configType == ConfiguratorManageKeys.RingConfigurator) {
        const findShanks = await ShanksData.findAll({ where: {is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id } })
        let updateShanksData: any = [];
        
        for (let index = 0; index < findShanks.length; index++) {
        const element = findShanks[index];
        let data = element.dataValues.side_setting_id
        if (data && data[configType]) {
        data[configType] = data[configType].filter(id => !inactiveDataId.includes(id));
        }

        updateShanksData.push({
          ...element.dataValues,
          side_setting_id: data,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        })
        }
        await ShanksData.bulkCreate(updateShanksData, { updateOnDuplicate: ['side_setting_id'], transaction: trn });
      
      }
    }
    return resSuccess();
  } catch (error) {
    return resUnknownError({ data: error });
  }
};

const updateDiamondColorClarity = async (
  list: any,
  configType: any,
  trn: Transaction,
  client_id: number,
  req: any
) => {
  try {
    const { DiamondGroupMaster } = initModels(req);

    let where: any = {
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id: client_id
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
    const diamondGroupMaster = await (req.body.db_connection).query(
      `WITH ranked_diamonds AS (
    SELECT 
        id_color, 
        id_clarity, 
        id, 
        is_diamond_type::TEXT AS is_diamond_type, -- Cast JSON to TEXT
        MAX(CAST(diamond_group_masters.is_config AS int)) AS is_config,
        MAX(CAST(diamond_group_masters.is_band AS int)) AS is_band,
        MAX(CAST(diamond_group_masters.is_three_stone AS int)) AS is_three_stone,
        MAX(CAST(diamond_group_masters.is_bracelet AS int)) AS is_bracelet,
        MAX(CAST(diamond_group_masters.is_pendant AS int)) AS is_pendant,
        MAX(CAST(diamond_group_masters.is_earring AS int)) AS is_earring,
        ROW_NUMBER() OVER (PARTITION BY id_color, id_clarity ORDER BY id ASC) AS row_num
    FROM diamond_group_masters 
    WHERE id_color IS NOT NULL AND company_info_id = ${client_id}
    GROUP BY id_color, id_clarity, id, is_diamond_type::TEXT -- Cast JSON to TEXT for grouping
)
SELECT 
    id,
    id_color, 
    id_clarity, 
    STRING_AGG(id::TEXT, ',' ORDER BY id ASC) AS id_list,  
    is_diamond_type,  
    MAX(is_config) AS is_config,
    MAX(is_band) AS is_band,
    MAX(is_three_stone) AS is_three_stone,
    MAX(is_bracelet) AS is_bracelet,
    MAX(is_pendant) AS is_pendant,
    MAX(is_earring) AS is_earring
FROM ranked_diamonds
WHERE row_num <= 1 AND id_color IS NOT NULL
GROUP BY id_color, id_clarity, id, is_diamond_type;
`,
      { type: QueryTypes.SELECT }
    );

    // in active data detail remove 
    const inActiveData = []
    const sideSettingList = await DiamondGroupMaster.findAll({ where: { ...oldDataUpdatePayload, is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No }, transaction: trn });

    for (let index = 0; index < sideSettingList.length; index++) {
      const element = sideSettingList[index].dataValues;
      let payload: any = {};
      if (configType === ConfiguratorManageKeys.RingConfigurator) {
        let is_diamond_type = element.sort_order || {};
        delete is_diamond_type[ConfiguratorManageKeys.RingConfigurator];
        payload = {
          ...element,
          is_diamond_type: is_diamond_type,

        };
      } else if (
        configType === ConfiguratorManageKeys.ThreeStoneConfigurator
      ) {
        let is_diamond_type = element.sort_order || {};
        delete is_diamond_type[ConfiguratorManageKeys.ThreeStoneConfigurator];
        payload = {
          ...element,
          is_diamond_type: is_diamond_type,

        };
      } else if (
        configType === ConfiguratorManageKeys.EternityBandConfigurator
      ) {
        let is_diamond_type = element.sort_order || {};
        delete is_diamond_type[ConfiguratorManageKeys.EternityBandConfigurator];
        payload = {
          ...element,
          is_diamond_type: is_diamond_type,

        };
      } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
        let is_diamond_type = element.sort_order || {};
        delete is_diamond_type[ConfiguratorManageKeys.BraceletConfigurator];
        payload = {
          ...element,
          is_diamond_type: is_diamond_type,

        };
      } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
        let is_diamond_type = element.sort_order || {};
        delete is_diamond_type[ConfiguratorManageKeys.PendantConfigurator];
        payload = {
          ...element,
          is_diamond_type: is_diamond_type,

        };
      } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
        let is_diamond_type = element.sort_order || {};
        delete is_diamond_type[ConfiguratorManageKeys.EarringConfigurator];
        payload = {
          ...element,
          is_diamond_type: is_diamond_type,

        };
      }

      inActiveData.push(payload);
    }
    if (inActiveData.length > 0) {
      await DiamondGroupMaster.bulkCreate(inActiveData, {
        updateOnDuplicate: [
          "is_diamond_type",
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
            item.is_pendant === ConfigStatus.Yes
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
              ...JSON.parse(findColorClarity.is_diamond_type),
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
              ...JSON.parse(findColorClarity.is_diamond_type),
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (
          configType === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findColorClarity,
            is_band: ConfigStatus.Yes,
            is_diamond_type: {
              ...JSON.parse(findColorClarity.is_diamond_type),
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findColorClarity,
            is_bracelet: ConfigStatus.Yes,
            is_diamond_type: {
              ...JSON.parse(findColorClarity.is_diamond_type),
              [ConfiguratorManageKeys.BraceletConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findColorClarity,
            is_pendant: ConfigStatus.Yes,
            is_diamond_type: {
              ...JSON.parse(findColorClarity.is_diamond_type),
              [ConfiguratorManageKeys.PendantConfigurator]:
                list[index].diamond_type,
            },
          };
        } else if (configType === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findColorClarity,
            is_earring: ConfigStatus.Yes,
            is_diamond_type: {
              ...JSON.parse(findColorClarity.is_diamond_type),
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
        const beforData = await DiamondGroupMaster.findOne({ where: { id: data.id } });
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
          { where: { id: data.id, company_info_id: client_id }, transaction: trn }
        );
        const afterData = await DiamondGroupMaster.findOne({ where: { id: data.id } });

        await addActivityLogs(req,
          client_id,
          [{ old_data: { diamond_group_id: beforData?.dataValues.id, data: { ...beforData?.dataValues } }, new_data: { diamond_group_id: afterData?.dataValues.id, data: { ...afterData?.dataValues } } }],
          null,
          LogsActivityType.Edit,
          LogsType.configurator_setting,
          null,
          trn
        );

      }
    }
    return resSuccess({ data: diamondGroupMaster });
  } catch (error) {
    return resUnknownError({ data: error });
  }
};
export const updateConfiguratorMasterData = async (req: Request) => {
  const { MetalMaster, GoldKarat, StoneData, MetalTone, CutsData } = initModels(req);
  const trn = await (req.body.db_connection).transaction();
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
   
    if (metal_master) {
      const metalData = await updateConfigFlag(
        metal_master,
        req.params.config_type,
        MetalMaster,
        trn,
        req?.body?.session_res?.client_id,
        req
      );
      if (metalData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return metalData;
      }
    }
    if (metal_tone_master) {
      const metalToneData = await updateConfigFlag(
        metal_tone_master,
        req.params.config_type,
        MetalTone,
        trn,
        req?.body?.session_res?.client_id,
        req
      );
      if (metalToneData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return metalToneData;
      }
    }
    if (metal_karat_master) {
      const metalKaratData = await updateMetalKarat(
        metal_karat_master,
        req.params.config_type,
        trn,
        req?.body?.session_res?.client_id,
        req
      );
      if (metalKaratData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return metalKaratData;
      }
    }
    if (stone_master) {
      const stoneData = await updateConfigFlag(
        stone_master,
        req.params.config_type,
        StoneData,
        trn,
        req?.body?.session_res?.client_id,
        req
      );
      if (stoneData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        trn.rollback();
        return stoneData;
      }
    }
    if (cut_master) {
      const cutData = await updateConfigFlag(
        cut_master,
        req.params.config_type,
        CutsData,
        trn,
        req?.body?.session_res?.client_id,
        req
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
        trn,
        req?.body?.session_res?.client_id,
        req
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
        trn,
        req?.body?.session_res?.client_id,
        req
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
        trn,
        req?.body?.session_res?.client_id,
        req
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
        trn,
        req?.body?.session_res?.client_id,
        req
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
        trn,
        req?.body?.session_res?.client_id,
        req
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
        trn,
        req?.body?.session_res?.client_id,
        req
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
    const { MetalMaster, MetalTone, GoldKarat, StoneData, CutsData, DiamondShape, DiamondCaratSize, HeadsData, ShanksData, SideSettingStyles } = initModels(req);
  
    const where = {
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      company_info_id: req?.body?.session_res?.client_id,
    };

    const order: any = [["id", "ASC"]]

    const metalMasterData = await MetalMaster.findAll({
      where,
      order,
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
      order,
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
      order,
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
        ["metal_tone_id", "metal_tone"]
      ],
    });

    const stoneData = await StoneData.findAll({
      where,
      order,
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
      order,
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
      order,
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
      order,
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
      order,
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
      order,
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
        ["diamond_shape_id", "diamond_shape"],
        ["diamond_size_id", "diamond_size"],
      ],
    });

    const colorClarityData = await (req.body.db_connection).query(
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
    WHERE id_color IS NOT NULL AND diamond_group_masters.is_deleted = '0' AND diamond_group_masters.is_active = '1' AND diamond_group_masters.company_info_id =${req?.body?.session_res?.client_id}
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
GROUP BY id_color, id_clarity, id, color_name, clarity_name ORDER BY ID ASC;`,
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

/* ---------------- update image for side setting master for all configurator ---------------- */

export const updateImageForSideSettingForConfig = async (req: Request) => {
  const { SideSettingStyles } = initModels(req);
  const trn = await (req.body.db_connection).transaction();
  try {
    const { side_setting = [] } = req.body
    const { config_type } = req.params
    const files: any = req.files as { [fieldname: string]: Express.Multer.File[] }
    let company_info_id: any = {};
    
        if (req?.body?.session_res?.client_id) {
          company_info_id.data = req.body.session_res.client_id;
        } else {
          const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);
    
          if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
            return decrypted;
          }
    
          company_info_id = decrypted;
        }
    const diamondShape = await SideSettingStyles.findAll({
      where: {
        is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data
      },
      transaction: trn,
    });
    const updatedList = [];
    const editActivityLogs: any[] = [];
    for (let index = 0; index < side_setting.length; index++) {
      const findSideSetting = diamondShape.find(
        (item: any) => item.dataValues.id == side_setting[index].id
      );

      const imageFile = files.find((t: any) => t.fieldname === `side_setting[${index}][image]`)
      let idImage = null;
      if (imageFile) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          imageFile,
          IMAGE_TYPE.sideSetting,
          req.body.session_res.id_app_user,
          "",
          company_info_id?.data
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      } else {
        idImage = side_setting[index].image_delete && side_setting[index].image_delete === "1" ? null : findSideSetting.dataValues.config_image &&findSideSetting.dataValues.config_image[config_type];
      }
      if (findSideSetting && findSideSetting.dataValues) {
        let payload: any = {};
        if (config_type === ConfiguratorManageKeys.RingConfigurator) {
          payload = {
            ...findSideSetting.dataValues,
            config_image: {
              ...findSideSetting.dataValues.config_image,
              [ConfiguratorManageKeys.RingConfigurator]:
                idImage,
            },
          };
        } else if (
          config_type === ConfiguratorManageKeys.ThreeStoneConfigurator
        ) {
          payload = {
            ...findSideSetting.dataValues,
            config_image: {
              ...findSideSetting.dataValues.config_image,
              [ConfiguratorManageKeys.ThreeStoneConfigurator]:
                idImage,
            },
          };
        } else if (
          config_type === ConfiguratorManageKeys.EternityBandConfigurator
        ) {
          payload = {
            ...findSideSetting.dataValues,
            config_image: {
              ...findSideSetting.dataValues.config_image,
              [ConfiguratorManageKeys.EternityBandConfigurator]:
                idImage,
            },
          };
        } else if (config_type === ConfiguratorManageKeys.BraceletConfigurator) {
          payload = {
            ...findSideSetting.dataValues,
            config_image: {
              ...findSideSetting.dataValues.config_image,
              [ConfiguratorManageKeys.BraceletConfigurator]:
                idImage,
            },
          };
        } else if (config_type === ConfiguratorManageKeys.PendantConfigurator) {
          payload = {
            ...findSideSetting.dataValues,
            config_image: {
              ...findSideSetting.dataValues.config_image,
              [ConfiguratorManageKeys.PendantConfigurator]:
                idImage,
            },
          };
        } else if (config_type === ConfiguratorManageKeys.EarringConfigurator) {
          payload = {
            ...findSideSetting.dataValues,
            config_image: {
              ...findSideSetting.dataValues.config_image,
              [ConfiguratorManageKeys.EarringConfigurator]:
                idImage,
            },
          };
        }

        updatedList.push(payload);
        const hasChanged = JSON.stringify(findSideSetting.dataValues.config_image) !== JSON.stringify(payload.config_image)

        if (hasChanged) {
          editActivityLogs.push({
            old_data: { id: findSideSetting.dataValues.id, data: findSideSetting.dataValues },
            new_data: { id: findSideSetting.dataValues.id, data: payload },
          });
        }
      }
      if (updatedList.length > 0) {
        await SideSettingStyles.bulkCreate(updatedList, {
          updateOnDuplicate: [
            "config_image"
          ],
          transaction: trn,
        });

        if (editActivityLogs.length > 0) {
          await addActivityLogs(req,
            company_info_id?.data,
            editActivityLogs,
            null,
            LogsActivityType.Edit,
            LogsType.configurator_setting,
            null,
            trn
          );
        }
      }
    }
    await trn.commit();
    return resSuccess();

  } catch (error) {
    await trn.rollback();
    throw error;
  }
}

export const getSideSettingImageForConfig = async (req: Request) => {
  try {
    const { SideSettingStyles, Image } = initModels(req);
   let company_info_id: any = {};

    if (req?.body?.session_res?.client_id) {
      company_info_id.data = req.body.session_res.client_id;
    } else {
      const decrypted = await getCompanyIdBasedOnTheCompanyKey(req.query, req.body.db_connection);

      if (decrypted.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return decrypted;
      }

      company_info_id = decrypted;
    }
    const { config_type } = req.params
    const sideSetting = await SideSettingStyles.findAll({
      order: [["id", "ASC"]],
      where: { is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data, is_active: ActiveStatus.Active },
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        "config_image",
      ],
    });
    const findImages = await Image.findAll({
      where: { is_deleted: DeletedStatus.No, company_info_id: company_info_id?.data },
    })
    let sideSettingImage = [];
    for (let index = 0; index < sideSetting.length; index++) {
      const data = sideSetting[index]?.dataValues;
      if (data.config_image) {
        const imagePath = findImages.find((item: any) => item.dataValues.id == data.config_image[config_type])
        sideSettingImage.push({ ...data, image_path: imagePath?.dataValues?.image_path })
      } else {
        sideSettingImage.push({ ...data, image_path: null })
      }

    }
    return resSuccess({ data: sideSettingImage });
  } catch (error) {
    throw error
  }
}