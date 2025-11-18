import { Request } from "express";
import { addActivityLogs, columnValueLowerCase, getCompanyIdBasedOnTheCompanyKey, getInitialPaginationFromQuery, getLocalDate, resErrorDataExit, resNotFound, resSuccess, statusUpdateValue } from "../../utils/shared-functions";
import { ActiveStatus, DeletedStatus, FilterItemScope, FilterMasterKey, FilterType, LogsActivityType, LogsType, Master_type, Pagination } from "../../utils/app-enumeration";
import { Op, Sequelize } from "sequelize";
import { DEFAULT_STATUS_CODE_SUCCESS, RECORD_UPDATE_SUCCESSFULLY } from "../../utils/app-messages";
import { initModels } from "../model/index.model";
import { LOG_FOR_SUPER_ADMIN } from "../../utils/app-constants";

export const addFilters = async (req: Request) => {
  try {
    const { name, key, filter_select_type = FilterType.Multiple, selected_value = [], item_scope } = req.body
    const {FiltersData} = initModels(req)
    const findSameFilter = await FiltersData.findOne({ where: [columnValueLowerCase("name", name), { company_info_id: req?.body?.session_res?.client_id }] })
    if (findSameFilter && findSameFilter.dataValues) {
      return resErrorDataExit()
    }

    const data = await FiltersData.create({
      name,
      key,
      filter_select_type,
      selected_value: selected_value,
      created_by: req.body.session_res.id_app_user,
      item_scope: item_scope,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      company_info_id: req.body.session_res.client_id
    })
    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: null,
      new_data: {
        filter_id: data?.dataValues?.id, data: {
          ...data?.dataValues
        },
      }
    }], data?.dataValues?.id, LogsActivityType.Add, LogsType.Filter, req?.body?.session_res?.id_app_user)
    return resSuccess({ data: data })
  } catch (error) {
    throw error
  }
}

export const getAllFilters = async (req: Request) => {
  try {
    let paginationProps = {};
    const {CategoryData, FiltersData} = initModels(req)

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    const categories = await CategoryData.findAll({
      where: {
        company_info_id: req.body.session_res.client_id,
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
      },
    })

    let where = [
      { company_info_id: req.body.session_res.client_id },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            { key: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            { filter_select_type: { [Op.iLike]: "%" + pagination.search_text + "%" } },

          ],
        }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await FiltersData.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

      paginationProps = {
        limit: pagination.per_page_rows,
        offset: (pagination.current_page - 1) * pagination.per_page_rows,
      };
    }

    const data = await FiltersData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "key",
        "filter_select_type",
        "is_active",
        "item_scope",
        "selected_value",
      ],
    });

const result = data.map((item) => {
  let selected = item?.dataValues?.selected_value;

      // Parse stringified JSON if needed
      if (typeof selected === 'string') {
        try {
          selected = JSON.parse(selected);
        } catch {
          selected = [];
        }
      }

      // Ensure it's an array
      const selectedValue = Array.isArray(selected)
        ? selected.map((value) => value.id)
        : [];

      if (item?.dataValues?.key === FilterMasterKey.Category) {
        selectedValue.forEach((element) => {
          const categoryIds = categories.map((category) => category.dataValues?.id);
          if (!categoryIds.includes(element)) {
            // Remove the element from selected if it's not in categoryIds
            selected = selected.filter((v) => v.id !== element);
          }
        });

        // Update selected_value if modified
        item.dataValues.selected_value = selected;
      }

      return {
        ...item.dataValues,
      };
    });



    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const editFilters = async (req: Request) => {
  try {
    const {FiltersData} = initModels(req)

    const { name, filter_select_type = FilterType.Multiple, selected_value = [], item_scope } = req.body

    const findSameFilter = await FiltersData.findOne({ where: { id: req.params.id, company_info_id: req?.body?.session_res?.client_id } })
    if (!(findSameFilter && findSameFilter.dataValues)) {
      return resNotFound()
    }

    const data = await FiltersData.update({
      name,
      filter_select_type,
      item_scope,
      selected_value: selected_value,
      modified_by: req.body.session_res.id_app_user,
      modified_date: getLocalDate(),
    }, { where: { id: req.params.id, company_info_id: req?.body?.session_res?.client_id } })

    const afterUpdateFindSameFilter = await FiltersData.findOne({ where: { id: req.params.id } })

    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: { filter_id: findSameFilter?.dataValues?.id, data: {...findSameFilter?.dataValues} },
      new_data: {
        filter_id: afterUpdateFindSameFilter?.dataValues?.id, data: { ...afterUpdateFindSameFilter?.dataValues }
      }
    }], findSameFilter?.dataValues?.id, LogsActivityType.Edit, LogsType.Filter, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY })
  } catch (error) {
    throw error
  }
}

export const statusUpdateForFilter = async (req: Request) => {
  try {
    const {FiltersData} = initModels(req)

    const findFilter = await FiltersData.findOne({
      where: { id: req.params.id, company_info_id: req?.body?.session_res?.client_id },
    });
    if (!(findFilter && findFilter.dataValues)) {
      return resNotFound();
    }
    await FiltersData.update(
      {
        is_active: statusUpdateValue(findFilter),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findFilter.dataValues.id, company_info_id: req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: { filter_id: findFilter?.dataValues?.id, data: {...findFilter?.dataValues} },
      new_data: {
        filter_id: findFilter?.dataValues?.id, data: {
          ...findFilter?.dataValues, is_active: statusUpdateValue(findFilter),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }, section_type: findFilter?.dataValues?.section_type
      }
    }], findFilter?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Filter, req?.body?.session_res?.id_app_user)
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getFilterForUser = async (req: Request) => {
  try {
    const {Image,FiltersData, SettingTypeData, SizeData, LengthData, StoneData, DiamondShape, CategoryData, MetalMaster, MetalTone, BrandData,Master, Colors, ClarityData, CutsData, Collection} = initModels(req)

    const { scope = FilterItemScope.Product } = req.query
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if (company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return company_info_id;
    }
    const data = await FiltersData.findAll({
      where: {
        is_active: ActiveStatus.Active,
        company_info_id: company_info_id?.data,
        [Op.or]: [
          { item_scope: scope },
          { item_scope: FilterItemScope.Both },
        ],
      },
      attributes: [
        "id",
        "name",
        "key",
        "filter_select_type",
        "item_scope",
        "selected_value",
      ],
    });

    const result = data.map((item) => {
      const selectedValue = item.dataValues.selected_value

      return {
        ...item.dataValues,
        selected_value: selectedValue
          ? selectedValue.filter(
            (value: any) =>
              value.item_scope === scope || value.item_scope === FilterItemScope.Both
          )
          : [],
      }
    });

    let settingStyleList = [];
    let metalMasterList = [];
    let categoryList = [];
    let metalToneList = [];
    let diamondShapeList = [];
    let collectionList = [];
    let brandList = [];
    let diamondColorList = [];
    let DiamondClarityList = [];
    let stoneList = [];
    let stoneCutList = [];
    let itemSizeList = [];
    let itemLengthList = [];
    let fluorescenceIntensityList = [];
    let fluorescenceColorList = [];
    let fancyColorList = [];
    let fancyColorIntensityList = [];
    let fancyColorOvertoneList = [];
    let girdleThinList = [];
    let girdleThickList = [];
    let girdleConditionList = [];
    let polishList = [];
    let symmetryList = [];
    let shadeList = [];
    let certificateList = [];
    let labList = [];
    let milkyList = [];
    let bgmList = [];
    let HandAList = [];
    let growthTypeList = [];

    for (let index = 0; index < result.length; index++) {
      const element = result[index].selected_value?.map((x) => x.id);
      const where = { id: { [Op.in]: element }, is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active };

      switch (result[index].key) {
        case FilterMasterKey.SettingStyle:
          settingStyleList = await SettingTypeData.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              [Sequelize.literal("setting_type_image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "setting_type_image", attributes: [] }],
          });
          break;
        case FilterMasterKey.Metal:
          metalMasterList = await MetalMaster.findAll({ where, attributes: ["id", "name", "slug"] });
          break;
        case FilterMasterKey.MetalTone:
          metalToneList = await MetalTone.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "id_metal",
              [Sequelize.literal("metal_tone_image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "metal_tone_image", attributes: [] }],
            order: [["id", "ASC"]],
          });;
          break;
        case FilterMasterKey.DiamondShape:
          diamondShapeList = await DiamondShape.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              [Sequelize.literal("diamond_shape_image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "diamond_shape_image", attributes: [] }],
          });
          break;
        case FilterMasterKey.Collection:
          collectionList = await Collection.findAll({
            where,
            attributes: ["id", "name", "slug", "id_category"],
          });
          break;
        case FilterMasterKey.Brand:
          brandList = await BrandData.findAll({
            where,
            attributes: ["id", "name", "slug"],
          });
          break;
        case FilterMasterKey.DiamondColor:
          diamondColorList = await Colors.findAll({ where, attributes: ['id', ['value', 'name'], 'slug'] });
          break;
        case FilterMasterKey.DiamondClarity:
          DiamondClarityList = await ClarityData.findAll({ where, attributes: ['id', ['value', 'name'], 'slug'] });
          break;
        case FilterMasterKey.Category:
        case FilterMasterKey.CategorySubCategory:
        case FilterMasterKey.CategorySubCategorySubSubCategory:
          categoryList = await CategoryData.findAll({
            where,
            attributes: [
              "id",
              ["category_name", "name"],
              "slug",
              "parent_id",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          });
          break;
        case FilterMasterKey.Stone:
          stoneList = await StoneData.findAll({
            where, attributes: [
              "id",
              "name",
              "slug",
              "sort_code",
              [Sequelize.literal("stone_image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "stone_image", attributes: [] }],
          })
          break;
        case FilterMasterKey.cut:
          stoneCutList = await CutsData.findAll({
            where,
            attributes: [
              "id",
              ["value", "name"],
              "slug"
            ]
          })
          break;
        case FilterMasterKey.ItemSize:
          itemSizeList = await SizeData.findAll({
            where,
            attributes: [
              "id",
              ["size", "name"],
              "slug"
            ]
          })
          break;
        case FilterMasterKey.ItemLength:
          itemLengthList = await LengthData.findAll({
            where,
            attributes: [
              "id",
              ["length", "name"],
              "slug"
            ]
          })
          break;
        case FilterMasterKey.FluorescenceIntensity:
          fluorescenceIntensityList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.FluorescenceColor:
          fluorescenceColorList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.FancyColor:
          fancyColorList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.FancyColorIntensity:
          fancyColorIntensityList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.FancyColorOvertone:
          fancyColorOvertoneList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.GirdleThin:
          girdleThinList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.GirdleThick:
          girdleThickList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.GirdleCondition:
          girdleConditionList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.Polish:
          polishList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.Symmetry:
          symmetryList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.Shade:
          shadeList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.Certificate:
          certificateList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.Lab:
          labList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.Milky:
          milkyList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.BGM:
          bgmList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.HandA:
          HandAList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
        case FilterMasterKey.GrowthType:
          growthTypeList = await Master.findAll({
            where,
            attributes: [
              "id",
              "name",
              "slug",
              "value",
              "link",
              "stone_type",
              "id_parent",
              [Sequelize.literal("image.image_path"), "image_path"],
            ],
            include: [{ model: Image, as: "image", attributes: [] }],
          })
          break;
      }
    }


    return resSuccess({
      data: {
        result,
        setting_style: settingStyleList,
        metal: metalMasterList,
        category: categoryList,
        metal_tone: metalToneList,
        diamond_shape: diamondShapeList,
        diamond_color: diamondColorList,
        diamond_clarity: DiamondClarityList,
        collection: collectionList,
        brand: brandList,
        stone: stoneList,
        cuts: stoneCutList,
        item_size: itemSizeList,
        item_length: itemLengthList,
        fluorescence_intensity: fluorescenceIntensityList,
        fluorescence_color: fluorescenceColorList,
        fancy_color: fancyColorList,
        fancy_color_intensity: fancyColorIntensityList,
        fancy_color_overtone: fancyColorOvertoneList,
        girdle_thin: girdleThinList,
        girdle_thick: girdleThickList,
        girdle_condition: girdleConditionList,
        polish: polishList,
        symmetry: symmetryList,
        shade: shadeList,
        certificate: certificateList,
        lab: labList,
        milky: milkyList,
        BGM: bgmList,
        'H&A': HandAList,
        growth_type: growthTypeList
      }
    })
  } catch (error) {
    throw error
  }
}

export const filterMasterList = async (req: Request) => {
  try {
    const {SettingTypeData,MetalMaster,MetalTone,DiamondShape,Collection,Master,Image, BrandData, Colors, ClarityData, CategoryData, CutsData, StoneData, SizeData, LengthData} = initModels(req)

    const where = { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active, company_info_id: req.body.session_res.client_id }
    const settingStyleList = await SettingTypeData.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("setting_type_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "setting_type_image", attributes: [] }],
    });

    const metalMasterList = await MetalMaster.findAll({ where, attributes: ["id", "name", "slug"] });

    const metalToneList = await MetalTone.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        "id_metal",
        [Sequelize.literal("metal_tone_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "metal_tone_image", attributes: [] }],
      order: [["id", "ASC"]],
    });
    const diamondShapeList = await DiamondShape.findAll({
      where,
      attributes: [
        "id",
        "name",
        "slug",
        [Sequelize.literal("diamond_shape_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "diamond_shape_image", attributes: [] }],
    });
    const collectionList = await Collection.findAll({
      where,
      attributes: ["id", "name", "slug", "id_category"],
    });
    const brandList = await BrandData.findAll({
      where,
      attributes: ["id", "name", "slug"],
    });
    const diamondColorList = await Colors.findAll({ where, attributes: ['id', ['value', 'name'], 'slug'] });
    const DiamondClarityList = await ClarityData.findAll({ where, attributes: ['id', ['value', 'name'], 'slug'] });
    const categoryList = await CategoryData.findAll({
      where,
      attributes: [
        "id",
        ["category_name", "name"],
        "slug",
        "parent_id",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    });
    const stoneList = await StoneData.findAll({
      where, attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [Sequelize.literal("stone_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "stone_image", attributes: [] }],
    })
    const stoneCutList = await CutsData.findAll({
      where,
      attributes: [
        "id",
        ["value", "name"],
        "slug"
      ]
    })
    const itemSizeList = await SizeData.findAll({
      where,
      attributes: [
        "id",
        ["size", "name"],
        "slug"
      ]
    })
    const itemLengthList = await LengthData.findAll({
      where,
      attributes: [
        "id",
        ["length", "name"],
        "slug"
      ]
    })
    const fluorescenceIntensityList = await Master.findAll({
      where: { ...where, master_type: Master_type.fluorescenceIntensity },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const fluorescenceColorList = await Master.findAll({
      where: { ...where, master_type: Master_type.fluorescenceColor },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const fancyColorList = await Master.findAll({
      where: { ...where, master_type: Master_type.fancyColor },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const fancyColorIntensityList = await Master.findAll({
      where: { ...where, master_type: Master_type.fancyColorIntensity },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const fancyColorOvertoneList = await Master.findAll({
      where: { ...where, master_type: Master_type.fancyColorOvertone },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const girdleThinList = await Master.findAll({
      where: { ...where, master_type: Master_type.GirdleThin },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const girdleThickList = await Master.findAll({
      where: { ...where, master_type: Master_type.GirdleThick },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const girdleConditionList = await Master.findAll({
      where: { ...where, master_type: Master_type.GirdleCondition },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const polishList = await Master.findAll({
      where: { ...where, master_type: Master_type.Polish },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const symmetryList = await Master.findAll({
      where: { ...where, master_type: Master_type.symmetry },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const shadeList = await Master.findAll({
      where: { ...where, master_type: Master_type.shade },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const certificateList = await Master.findAll({
      where: { ...where, master_type: Master_type.Diamond_certificate },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const labList = await Master.findAll({
      where: { ...where, master_type: Master_type.lab },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const milkyList = await Master.findAll({
      where: { ...where, master_type: Master_type.milky },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const bgmList = await Master.findAll({
      where: { ...where, master_type: Master_type.BGM },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const HandAList = await Master.findAll({
      where: { ...where, master_type: Master_type.HandA },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })
    const growthTypeList = await Master.findAll({
      where: { ...where, master_type: Master_type.growthType },
      attributes: [
        "id",
        "name",
        "slug",
        "value",
        "link",
        "stone_type",
        "id_parent",
        [Sequelize.literal("image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "image", attributes: [] }],
    })

    return resSuccess({
      data: {
        [FilterMasterKey.SettingStyle]: settingStyleList,
        [FilterMasterKey.Metal]: metalMasterList,
        [FilterMasterKey.MetalTone]: metalToneList,
        [FilterMasterKey.BGM]: bgmList,
        [FilterMasterKey.Brand]: brandList,
        [FilterMasterKey.Category]: categoryList,
        [FilterMasterKey.Certificate]: certificateList,
        [FilterMasterKey.Collection]: collectionList,
        [FilterMasterKey.DiamondClarity]: DiamondClarityList,
        [FilterMasterKey.DiamondColor]: diamondColorList,
        [FilterMasterKey.DiamondShape]: diamondShapeList,
        [FilterMasterKey.FancyColor]: fancyColorList,
        [FilterMasterKey.FancyColorIntensity]: fancyColorIntensityList,
        [FilterMasterKey.FancyColorOvertone]: fancyColorOvertoneList,
        [FilterMasterKey.FluorescenceColor]: fluorescenceColorList,
        [FilterMasterKey.FluorescenceIntensity]: fluorescenceIntensityList,
        [FilterMasterKey.GirdleCondition]: girdleConditionList,
        [FilterMasterKey.GirdleThick]: girdleThickList,
        [FilterMasterKey.GirdleThin]: girdleThinList,
        [FilterMasterKey.GrowthType]: growthTypeList,
        [FilterMasterKey.HandA]: HandAList,
        [FilterMasterKey.ItemLength]: itemLengthList,
        [FilterMasterKey.ItemSize]: itemSizeList,
        [FilterMasterKey.Lab]: labList,
        [FilterMasterKey.Milky]: milkyList,
        [FilterMasterKey.Polish]: polishList,
        [FilterMasterKey.Shade]: shadeList,
        [FilterMasterKey.Stone]: stoneList,
        [FilterMasterKey.Symmetry]: symmetryList,
        [FilterMasterKey.cut]: stoneCutList

      }
    })

  } catch (error) {
    throw error
  }
}