import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  getCompanyIdBasedOnTheCompanyKey,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  prepareMessageFromParams,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnprocessableEntity,
  statusUpdateValue,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  MEGA_MENU_ATTRIBUTE_ADDED_ONLY_THREE_LEVEL,
  NOT_FOUND_MESSAGE,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../utils/app-messages";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
} from "../../utils/app-enumeration";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../model/index.model";

// add mega menu
export const addMegaMenu = async (req: Request) => {
  try {
    const {MegaMenus} = initModels(req);
    const { name, menu_type } = req.body;

    const findSameName = await MegaMenus.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        { company_info_id: req.body.session_res.client_id },
        { menu_type: menu_type }
      ]
    })

    if (findSameName && findSameName.dataValues) {
      return resErrorDataExit()
    }

    const activeCount = await MegaMenus.count({ where: { is_deleted: DeletedStatus.No, menu_type: menu_type, is_active: ActiveStatus.Active, company_info_id: req.body.session_res.client_id } })
    const megaMenu = await MegaMenus.create({
      name,
      menu_type,
      is_active: activeCount > 0 ? ActiveStatus.InActive : ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_date: getLocalDate(),
      created_by: req.body.session_res.id_app_user,
      company_info_id: req.body.session_res.client_id
    });
    await addActivityLogs(req,null, [{
      old_data: null,
      new_data: {
        mega_menu_id: megaMenu?.dataValues?.id, data: megaMenu?.dataValues
      }
    }], megaMenu?.dataValues?.id, LogsActivityType.Add, LogsType.MegaMenu, req?.body?.session_res?.id_app_user)

    return resSuccess({ data: megaMenu })
  } catch (error) {
    throw error
  }
}

// get mega menu
export const getMegaMenu = async (req: Request) => {
  try {
    const {MegaMenus} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id: req?.body?.session_res?.client_id },
      req.query.mega_menu && req.query.mega_menu !== "" ?
        { menu_type: req.query.mega_menu }
        : {},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            {
              [Op.iLike]: Sequelize.literal(`CAST(menu_type AS TEXT) ILIKE '%${pagination.search_text}%'`),
            },
          ],
        }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await MegaMenus.count({
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

    const result = await MegaMenus.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "menu_type",
        "is_active",
        "created_date"
      ]
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    console.log(error)
    throw error
  }
}

// update mega menu

export const updateMegaMenu = async (req: Request) => {
  try {
    const {MegaMenus} = initModels(req);

    const { id } = req.params;
    const { name, menu_type } = req.body;
    const findMenu = await MegaMenus.findOne({
      where: { id: id, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id }
    })

    if (!(findMenu && findMenu.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE })
    }

    const findSameName = await MegaMenus.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        { company_info_id: req.body.session_res.client_id },
        { menu_type: menu_type },
        { id: { [Op.ne]: id } }
      ]
    })

    if (findSameName && findSameName.dataValues) {
      return resErrorDataExit()
    }

    await MegaMenus.update(
      {
        name,
        menu_type,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id } }
    );

    await addActivityLogs(req,null, [{
      old_data: { mega_menu_id: findMenu?.dataValues?.id, data: findMenu?.dataValues },
      new_data: {
        mega_menu_id: findMenu?.dataValues?.id, data: {
          ...findMenu?.dataValues, name,
          menu_type,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user
        }
      }
    }], findMenu?.dataValues?.id, LogsActivityType.Edit, LogsType.MegaMenu, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error
  }
}

// delete mega menu

export const deleteMegaMenu = async (req: Request) => {
  const trn = await req.body.db_connection.transaction();
    const {MegaMenus,MegaMenuAttributes} = initModels(req);

  try {
    const { id } = req.params;
    const findMenu = await MegaMenus.findOne({
      where: { id: id, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id }, transaction: trn
    })

    if (!(findMenu && findMenu.dataValues)) {
      await trn.rollback();
      return resNotFound({ message: NOT_FOUND_MESSAGE })
    }
    await MegaMenus.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id }, transaction: trn }
    );
    const beforeUpdateFindMenuAttributes = await MegaMenuAttributes.findAll({
      where: { id_menu: id, is_deleted: DeletedStatus.No }
    })
    await MegaMenuAttributes.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id_menu: id }, transaction: trn }
    );

    await addActivityLogs(req,null, [{
      old_data: { mega_menu_id: findMenu?.dataValues?.id, data: findMenu?.dataValues, mega_menu_attribute: beforeUpdateFindMenuAttributes.map((t: any) => t.dataValues) },
      new_data: {
        mega_menu_id: findMenu?.dataValues?.id, data: {
          ...findMenu?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }, mega_menu_attribute: beforeUpdateFindMenuAttributes.map((t: any) => {
          return {
            ...t.dataValues,
            is_deleted: DeletedStatus.yes,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user,
          }
        })
      }
    }], findMenu?.dataValues?.id, LogsActivityType.Delete, LogsType.MegaMenu, req?.body?.session_res?.id_app_user, trn)

    await trn.commit();
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    await trn.rollback();
    throw error
  }
}

// status update for mega menu

export const statusUpdateForMegaMenu = async (req: Request) => {
  const {MegaMenus} = initModels(req);

  const trn = await req.body.db_connection.transaction();
  try {
    const { id } = req.params;
    const findMenu = await MegaMenus.findOne({
      where: { id: id, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id }, transaction: trn
    })

    if (!(findMenu && findMenu.dataValues)) {
      await trn.rollback();
      return resNotFound({ message: NOT_FOUND_MESSAGE })
    }

    await MegaMenus.update(
      {
        is_active: ActiveStatus.Active,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id, menu_type: findMenu.dataValues.menu_type }, transaction: trn }
    );
    const beforeUpdateMegaMenu = await MegaMenus.findAll({
      where: { id: { [Op.ne]: id }, menu_type: findMenu.dataValues.menu_type }, transaction: trn
    })
    await MegaMenus.update(
      {
        is_active: ActiveStatus.InActive,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: { [Op.ne]: id }, menu_type: findMenu.dataValues.menu_type }, transaction: trn }
    );

    await addActivityLogs(req,null, [{
      old_data: { mega_menu_id: findMenu?.dataValues?.id, data: [...beforeUpdateMegaMenu?.map((t: any) => t.dataValues), { ...findMenu?.dataValues }] },
      new_data: {
        mega_menu_id: findMenu?.dataValues?.id,
        data: [...beforeUpdateMegaMenu?.map((t: any) => {
          return {
            ...t.dataValues, is_active: ActiveStatus.InActive,
            modified_date: getLocalDate(),
            modified_by: req.body.session_res.id_app_user
          }
        }), {
          ...findMenu?.dataValues,
          is_active: ActiveStatus.Active,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        }]
      }
    }], findMenu?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.MegaMenu, req?.body?.session_res?.id_app_user, trn)


    await trn.commit();
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });

  } catch (error) {
    await trn.rollback();
    throw error
  }
}

// add mega menu attribute

export const addMegaMenuAttribute = async (req: Request) => {
  try {
    const {MegaMenus,MegaMenuAttributes} = initModels(req);

    const {
      title,
      url = null,
      sort_order = null,
      menu_type,
      target_type,
      id_parent = null,
      id_brand = null,
      id_category = null,
      id_collection = null,
      id_setting_type = null,
      id_diamond_shape = null,
      id_gender = null,
      id_metal_tone = null,
      id_metal = null,
      id_page = null,
      id_menu = null,
      id_static_page = null
    } = req.body;

    const findMenu = await MegaMenus.findOne({
      where: { id: id_menu, is_deleted: DeletedStatus.No, company_info_id: req.body.session_res.client_id }
    })

    if (!(findMenu && findMenu.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE })
    }

    if (id_parent && id_parent !== null) {
      const findParentData: any = await MegaMenuAttributes.findOne({ where: { id: id_parent } })
      if (findParentData && findParentData.dataValues && findParentData.dataValues.id_parent != null) {
        const findParentToParentData = await MegaMenuAttributes.findOne({ where: { id: findParentData.dataValues.id_parent } })
        if (findParentToParentData && findParentToParentData.dataValues && findParentToParentData.dataValues.id_parent != null) {
          return resUnprocessableEntity({ message: MEGA_MENU_ATTRIBUTE_ADDED_ONLY_THREE_LEVEL })
        }
      }
    }
    const findSameName = await MegaMenuAttributes.findOne({
      where: [
        columnValueLowerCase("title", title),
        { is_deleted: DeletedStatus.No },
        { id_menu: id_menu },
        { company_info_id: req.body.session_res.client_id },
        {
          id_parent: {
            [Op.eq]: id_parent && id_parent != "" && id_parent != undefined
              ? id_parent
              : null
          }
        }
      ]
    })

    if (findSameName && findSameName.dataValues) {
      return resErrorDataExit();
    }
    const trn = await req.body.db_connection.transaction();
    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.MegaMenu,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }

      const megaMenuAttributesData = await MegaMenuAttributes.create(
        {
          is_active: ActiveStatus.Active,
          id_image: idImage,
          is_deleted: DeletedStatus.No,
          sort_order: sort_order,
          url: url,
          menu_type: menu_type,
          target_type: target_type,
          id_parent:
            id_parent && id_parent != "" && id_parent != undefined
              ? id_parent
              : null,
          id_brand: id_brand,
          id_setting_type: id_setting_type,
          id_category: id_category,
          id_collection: id_collection,
          id_diamond_shape: id_diamond_shape,
          title: title,
          id_gender: id_gender,
          id_metal_tone: id_metal_tone,
          id_metal: id_metal,
          id_static_page,
          created_by: req.body.session_res.id_app_user,
          company_info_id: req?.body?.session_res?.client_id,
          created_date: getLocalDate(),
          id_page,
          id_menu,
        },
        { transaction: trn }
      );

      await addActivityLogs(req,null, [{
        old_data: null,
        new_data: {
          mega_menu_id: megaMenuAttributesData?.dataValues?.id, data: megaMenuAttributesData?.dataValues
        }
      }], megaMenuAttributesData?.dataValues?.id, LogsActivityType.Add, LogsType.MegaMenuAttributes, req?.body?.session_res?.id_app_user, trn);
      await trn.commit();
      return resSuccess();
    } catch (e) {
      console.log(e, "error");
      await trn.rollback();
      throw e;
    }

  } catch (e) {
    console.log(e, "error");
    throw e;
  }
};

// update mega menu attribute

export const updateMegaMenuAttribute = async (req: Request) => {
  try {
    const {MegaMenus,MegaMenuAttributes,Image} = initModels(req);

    const {
      title,
      url = null,
      sort_order = null,
      menu_type,
      target_type,
      id_parent = null,
      id_brand = null,
      id_category = null,
      id_collection = null,
      id_setting_type = null,
      id_diamond_shape = null,
      id_gender = null,
      id_metal_tone = null,
      id_metal = null,
      id_page = null,
      image_delete = "0",
      id_static_page = null,
      id_menu
    } = req.body;

    const findMegaMenuAttribute = await MegaMenuAttributes.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id },
    });

    if (!(findMegaMenuAttribute && findMegaMenuAttribute.dataValues)) {
      return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Mega Menu attribute not found"]]) });
    }

    const findMenu = await MegaMenus.findOne({
      where: { id: id_menu, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id }
    })

    if (!(findMenu && findMenu.dataValues)) {
      return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Mega Menu id not found"]]) })
    }

    if (id_parent && id_parent !== null) {
      const findParentData: any = await MegaMenuAttributes.findOne({ where: { id: id_parent } })
      if (findParentData && findParentData.dataValues && findParentData.dataValues.id_parent != null) {
        const findParentToParentData = await MegaMenuAttributes.findOne({ where: { id: findParentData.dataValues.id_parent } })
        if (findParentToParentData && findParentToParentData.dataValues && findParentToParentData.dataValues.id_parent != null) {
          return resUnprocessableEntity({ message: MEGA_MENU_ATTRIBUTE_ADDED_ONLY_THREE_LEVEL })
        }
      }
    }

    const megaMenu = await MegaMenuAttributes.findOne({
      where: [
        columnValueLowerCase("title", title.toString()),
        { id: { [Op.ne]: findMegaMenuAttribute.dataValues.id } },
        { is_deleted: DeletedStatus.No },
        { id_menu: id_menu },
        { company_info_id: req.body.session_res.client_id },
      ],
    });

    if (megaMenu && megaMenu.dataValues) {
      return resErrorDataExit();
    }
    const trn = await req.body.db_connection.transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findMegaMenuAttribute.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findMegaMenuAttribute.dataValues.id_image, company_info_id: req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.MegaMenu,
          req.body.session_res.id_app_user,
          findImage,
          req?.body?.session_res?.client_id
        );

        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          await trn.rollback();
          return imageData;
        }
        imageId = imageData.data;
      }
      const payload = {
        id_image:
          image_delete && image_delete === "1"
            ? null
            : imageId || findMegaMenuAttribute.dataValues.id_image,
        sort_order: sort_order,
        url: url,
        menu_type: menu_type,
        target_type: target_type,
        id_parent:
          id_parent && id_parent != "" && id_parent != undefined
            ? id_parent
            : null,
        id_brand: id_brand,
        id_setting_type: id_setting_type,
        id_category: id_category,
        id_collection: id_collection,
        id_diamond_shape: id_diamond_shape,
        title: title,
        id_static_page: id_static_page,
        id_gender: id_gender,
        id_metal_tone: id_metal_tone,
        id_metal: id_metal,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
        id_page,
        id_menu
      }
      {
        await MegaMenuAttributes.update(
          payload,
          {
            where: { id: findMegaMenuAttribute.dataValues.id, company_info_id: req?.body?.session_res?.client_id },
            transaction: trn,
          }
        );
      }
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage, req.body.session_res.client_id);
      }

      await addActivityLogs(req,null, [{
        old_data: { mega_menu_id: findMegaMenuAttribute?.dataValues?.id, data: findMegaMenuAttribute?.dataValues },
        new_data: {
          mega_menu_id: findMegaMenuAttribute?.dataValues?.id, data: { ...findMegaMenuAttribute?.dataValues, ...payload }
        }
      }], findMegaMenuAttribute?.dataValues?.id, LogsActivityType.Edit, LogsType.MegaMenuAttributes, req?.body?.session_res?.id_app_user, trn)

      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      await trn.rollback();
      throw e;
    }

  } catch (e) {
    throw e;
  }
};

// delete mega menu attribute
export const deleteMegaMenuAttribute = async (req: Request) => {
  try {
    const {MegaMenuAttributes} = initModels(req);

    const findMegaMenu = await MegaMenuAttributes.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id },
    });

    if (!(findMegaMenu && findMegaMenu.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    const deleteMegaMenuWithChildren = async (id, company_info_id, user_id) => {
      const children = await MegaMenuAttributes.findAll({
        where: {
          id_parent: id,
          company_info_id: company_info_id,
        },
      });

      for (const child of children) {
        await deleteMegaMenuWithChildren(child.dataValues.id, company_info_id, user_id);
      }

      await MegaMenuAttributes.update(
        {
          is_deleted: DeletedStatus.yes,
          modified_by: user_id,
          modified_date: getLocalDate(),
        },
        {
          where: {
            id: id,
            company_info_id: company_info_id,
          },
        }
      );
    };

    // Usage
    await deleteMegaMenuWithChildren(findMegaMenu.dataValues.id, req.body.session_res.client_id, req.body.session_res.id_app_user);

    await addActivityLogs(req,null, [{
      old_data: { mega_menu_id: findMegaMenu?.dataValues?.id, data: findMegaMenu?.dataValues },
      new_data: {
        mega_menu_id: findMegaMenu?.dataValues?.id, data: {
          ...findMegaMenu?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findMegaMenu?.dataValues?.id, LogsActivityType.Delete, LogsType.MegaMenuAttributes, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e) {
    throw e;
  }
};

// get mega menu attribute

export const getMegaMenuAttribute = async (req: Request) => {
  try {
    const {MegaMenuAttributes,Image, CategoryData, Collection, DiamondShape, SettingTypeData, BrandData, MetalMaster, MetalTone, StaticPageData, PageData} = initModels(req);
    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      { company_info_id: req?.body?.session_res?.client_id },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
          [Op.or]: [
            { title: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          ],
        }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await MegaMenuAttributes.count({
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

    const result = await MegaMenuAttributes.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "title",
        "url",
        "menu_type",
        "target_type",
        "id_parent",
        "id_brand",
        "id_setting_type",
        "id_diamond_shape",
        "id_gender",
        "id_metal_tone",
        "id_metal",
        "id_page",
        "sort_order",
        "id_image",
        "id_page",
        "id_category",
        "id_collection",
        "id_setting_type",
        "is_active",
        "id_menu",
        "id_static_page",
        [Sequelize.literal("menu_att_image.image_path"), "image_path"],
        [Sequelize.literal("page.url"), "page_url"],
        [
          Sequelize.literal(`
      COALESCE(
        category.slug,
        collection.slug,
        style.slug,
        brand.slug,
        diamond_shape.slug,
        menu_att_metal.slug,
        menu_att_metal_tone.slug,
        static_pages.slug
      )
    `),
          "menu_slug"
        ],
        [
          Sequelize.literal(`
    COALESCE(
      category.category_name,
      collection.name,
      style.name,
      brand.name,
      diamond_shape.name,
      menu_att_metal.name,
      menu_att_metal_tone.name,
      page.name,
      static_pages.page_title
    )
  `),
          "menu_name"
        ]
      ],
      include: [
        { required: false, model: Image, as: "menu_att_image", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: CategoryData, as: "category", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: SettingTypeData, as: "style", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: Collection, as: "collection", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: BrandData, as: "brand", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: DiamondShape, as: "diamond_shape", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: MetalMaster, as: "menu_att_metal", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: MetalTone, as: "menu_att_metal_tone", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: PageData, as: "page", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: StaticPageData, as: "static_pages", attributes: [], where: { company_info_id: req.body.session_res.client_id } },

      ],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

// status update for mega menu attribute
export const statusUpdateForMegaMenuAttribute = async (req: Request) => {
  try {
    const { MegaMenuAttributes } = initModels(req);
    const findMegaMenu = await MegaMenuAttributes.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
        company_info_id: req?.body?.session_res?.client_id
      },
    });

    if (!(findMegaMenu && findMegaMenu.dataValues)) {
      return resNotFound({ message: NOT_FOUND_MESSAGE });
    }
    await MegaMenuAttributes.update(
      {
        is_active: statusUpdateValue(findMegaMenu),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findMegaMenu.dataValues.id, company_info_id: req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,null, [{
      old_data: { mega_menu_id: findMegaMenu?.dataValues?.id, data: findMegaMenu?.dataValues },
      new_data: {
        mega_menu_id: findMegaMenu?.dataValues?.id, data: {
          ...findMegaMenu?.dataValues, is_active: statusUpdateValue(findMegaMenu),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findMegaMenu?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.MegaMenuAttributes, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

// get mega menu attribute detail API

export const getMegaMenuAttributeDetail = async (req: Request) => {
  try {
    const { Image,MegaMenuAttributes, CategoryData, SettingTypeData, Collection, BrandData, DiamondShape, MetalMaster, MetalTone, StaticPageData, PageData } = initModels(req);

    const findMegaMenu = await MegaMenuAttributes.findAll({
      where: {
        id_menu: req.params.id_menu,
        is_deleted: DeletedStatus.No,
        company_info_id: req.body.session_res.client_id
      },
      attributes: [
        "id",
        "title",
        "url",
        "menu_type",
        "target_type",
        "id_parent",
        "id_brand",
        "id_setting_type",
        "id_diamond_shape",
        "id_gender",
        "id_metal_tone",
        "id_metal",
        "id_page",
        "sort_order",
        "id_image",
        "id_page",
        "id_category",
        "id_collection",
        "id_setting_type",
        "is_active",
        "id_menu",
        "id_static_page",
        [Sequelize.literal("menu_att_image.image_path"), "image_path"],
        [Sequelize.literal("page.url"), "page_url"],
        [
          Sequelize.literal(`
      COALESCE(
        category.slug,
        collection.slug,
        style.slug,
        brand.slug,
        diamond_shape.slug,
        menu_att_metal.slug,
        menu_att_metal_tone.slug,
        static_pages.slug
      )
    `),
          "menu_slug"
        ],
        [
          Sequelize.literal(`
    COALESCE(
      category.category_name,
      collection.name,
      style.name,
      brand.name,
      diamond_shape.name,
      menu_att_metal.name,
      menu_att_metal_tone.name,
      page.name,
      static_pages.page_title
    )
  `),
          "menu_name"
        ]
      ],
      include: [
        { required: false, model: Image, as: "menu_att_image", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: CategoryData, as: "category", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: SettingTypeData, as: "style", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: Collection, as: "collection", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: BrandData, as: "brand", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: DiamondShape, as: "diamond_shape", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: MetalMaster, as: "menu_att_metal", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: MetalTone, as: "menu_att_metal_tone", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: PageData, as: "page", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
        { required: false, model: StaticPageData, as: "static_pages", attributes: [], where: { company_info_id: req.body.session_res.client_id } },
      ],
    });
    return resSuccess({ data: findMegaMenu });
  } catch (e) {
    throw e;
  }
};

// get mega menu for user side

export const getMegaMenuForUser = async (req: Request) => {
  try {
    const { MegaMenus, MegaMenuAttributes,Image, CategoryData, SettingTypeData, Collection, BrandData, DiamondShape, MetalMaster, MetalTone, StaticPageData, PageData } = initModels(req);

    const result = await MegaMenus.findAll({
      where: { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id: (await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection)).data },
      attributes: ["id", "name", "menu_type"],
      include: [{
        required: false,
        where: { is_deleted: DeletedStatus.No },
        model: MegaMenuAttributes,
        as: "menu_attributes",
        attributes: ["id",
          "title",
          "url",
          "menu_type",
          "target_type",
          "id_parent",
          "id_brand",
          "id_setting_type",
          "id_diamond_shape",
          "id_gender",
          "id_metal_tone",
          "id_metal",
          "id_page",
          "sort_order",
          "id_image",
          "id_page",
          "id_category",
          "id_collection",
          "id_setting_type",
          "is_active",
          "id_menu",
          "id_static_page",
          [Sequelize.literal(`"menu_attributes->menu_att_image"."image_path"`), "image_path"],
          [Sequelize.literal(`"menu_attributes->page"."url"`), "page_url"],
          [
            Sequelize.literal(`
        COALESCE(
          "menu_attributes->category".slug,
          "menu_attributes->collection".slug,
          "menu_attributes->style".slug,
          "menu_attributes->brand".slug,
          "menu_attributes->diamond_shape".slug,
          "menu_attributes->menu_att_metal".slug,
          "menu_attributes->menu_att_metal_tone".slug,
          "menu_attributes->static_pages".slug
        )
      `),
            "menu_slug"
          ],
          [
            Sequelize.literal(`
        COALESCE(
          "menu_attributes->category".category_name,
          "menu_attributes->collection".name,
          "menu_attributes->style".name,
          "menu_attributes->brand".name,
          "menu_attributes->diamond_shape".name,
          "menu_attributes->menu_att_metal".name,
          "menu_attributes->menu_att_metal_tone".name,
          "menu_attributes->page".name,
          "menu_attributes->static_pages".page_title
        )
      `),
            "menu_name"
          ]
        ],
        include: [
          { model: Image, as: "menu_att_image", attributes: [] },
          { model: CategoryData, as: "category", attributes: [] },
          { model: SettingTypeData, as: "style", attributes: [] },
          { model: Collection, as: "collection", attributes: [] },
          { model: BrandData, as: "brand", attributes: [] },
          { model: DiamondShape, as: "diamond_shape", attributes: [] },
          { model: MetalMaster, as: "menu_att_metal", attributes: [] },
          { model: MetalTone, as: "menu_att_metal_tone", attributes: [] },
          { model: PageData, as: "page", attributes: [] },
          { model: StaticPageData, as: "static_pages", attributes: [] },
        ]
      }]
    })

    return resSuccess({ data: result })
  } catch (error) {
    throw error
  }
}

// mega menu attribute id parent and sort order update API

export const updateSortOrderMegaMenuAttribute = async (req: Request) => {
  try {
    const { id_menu, attributes = [] } = req.body;
    const { MegaMenus, MegaMenuAttributes } = initModels(req);
    const findMenu = await MegaMenus.findOne({
      where: { id: id_menu, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id }
    })

    if (!(findMenu && findMenu.dataValues)) {
      return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Mega Menu"]]) });
    }

    if (attributes.length > 0) {
      let updateList = []
      let activityLog = []
      for (let index = 0; index < attributes.length; index++) {
        const element = attributes[index];
        const findMegaMenuAttribute = await MegaMenuAttributes.findOne({
          where: { id: element.id, is_deleted: DeletedStatus.No, company_info_id: req?.body?.session_res?.client_id },
        });

        if (!(findMegaMenuAttribute && findMegaMenuAttribute.dataValues)) {
          return resNotFound({ message: prepareMessageFromParams(ERROR_NOT_FOUND, [["field_name", "Mega Menu attribute not found"]]) });
        }

        if (element.id_parent && element.id_parent !== null) {
          const findParentData: any = await MegaMenuAttributes.findOne({ where: { id: element.id_parent } })
          if (findParentData && findParentData.dataValues && findParentData.dataValues.id_parent != null) {
            const findParentToParentData = await MegaMenuAttributes.findOne({ where: { id: findParentData.dataValues.id_parent } })
            if (findParentToParentData && findParentToParentData.dataValues && findParentToParentData.dataValues.id_parent != null) {
              return resUnprocessableEntity({ message: MEGA_MENU_ATTRIBUTE_ADDED_ONLY_THREE_LEVEL })
            }
          }
        }

        updateList.push({
          ...findMegaMenuAttribute?.dataValues,
          id: element.id,
          sort_order: element.sort_order,
          id_parent: element.id_parent,
          modified_by: req.body.session_res.id_app_user,
          modified_date: getLocalDate(),
        })
        activityLog.push({
          old_data: { mega_menu_id: findMegaMenuAttribute?.dataValues?.id, data: findMegaMenuAttribute?.dataValues },
          new_data: {
            mega_menu_id: findMegaMenuAttribute?.dataValues?.id,
            data: {
              ...findMegaMenuAttribute?.dataValues,
              sort_order: element.sort_order,
              id_parent: element.id_parent,
              modified_by: req?.body?.session_res?.id_app_user,
              modified_date: getLocalDate(),
            }
          }
        })
      }
      // await MegaMenuAttributes.bulkCreate(updateList, { updateOnDuplicate: ["sort_order", "id_parent", "modified_by", "modified_date"] });
      if (updateList.length > 0) {
        await MegaMenuAttributes.bulkCreate(updateList, {
          updateOnDuplicate: [
            "sort_order",
            "id_parent",
            "modified_by",
            "modified_date",
          ],
        });
      }
      await addActivityLogs(req,null, activityLog, findMenu?.dataValues?.id, LogsActivityType.Edit, LogsType.MegaMenuAttributes, req?.body?.session_res?.id_app_user)
    }
    return resSuccess()
  } catch (error) {

    throw error
  }
}