import { Request } from "express";
import { Sequelize, Op } from "sequelize";
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../../utils/app-enumeration";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  createSlug,
  getInitialPaginationFromQuery,
  getLocalDate,
  imageAddAndEditInDBAndS3,
  imageDeleteInDBAndS3,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  statusUpdateValue,
} from "../../../../utils/shared-functions";
import { initModels } from "../../../model/index.model";

export const addShank = async (req: Request) => {
  try {
    const {ShanksData} = initModels(req);
    const { name, sort_code } = req.body;
    const slug = createSlug(name);
    const findName = await ShanksData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    const findSortCode = await ShanksData.findOne({
      where: [
        columnValueLowerCase("sort_code", sort_code),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      (findName && findName.dataValues) ||
      (findSortCode && findSortCode.dataValues)
    ) {
      return resErrorDataExit();
    }
    const trn = await (req.body.db_connection).transaction();
    try {
      let idImage = null;
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.shanks,
          req.body.session_res.id_app_user,
          "",
          req?.body?.session_res?.client_id
        );
        if (imageData.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          trn.rollback();
          return imageData;
        }
        idImage = imageData.data;
      }
      const payload = {
        name: name,
        slug: slug,
        sort_code: sort_code,
        created_date: getLocalDate(),
        created_by: req.body.session_res.id_app_user,
        company_info_id :req?.body?.session_res?.client_id,
        id_image: idImage,
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
      };

      const shank = await ShanksData.create(payload, { transaction: trn });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          shank_id: shank?.dataValues?.id, data: {
            ...shank?.dataValues
          }
        }
      }], shank?.dataValues?.id, LogsActivityType.Add, LogsType.Shank, req?.body?.session_res?.id_app_user,trn)

      await trn.commit();
      return resSuccess({ data: payload });
    } catch (e) {
      await trn.rollback();
      throw e;
    }
  } catch (e) {
    throw e;
  }
};

export const getShanks = async (req: Request) => {
  try {
    const {ShanksData,Image} = initModels(req);

    let paginationProps = {};

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await ShanksData.count({
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

    const result = await ShanksData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        "sort_order",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        "side_setting_id",
        [Sequelize.literal("shank_image.image_path"), "image_path"],
        "is_active",
      ],
      include: [{ model: Image, as: "shank_image", attributes: [], where: {company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdShank = async (req: Request) => {
  try {
    const {ShanksData,Image} = initModels(req);
    const findShank = await ShanksData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        "sort_order",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        "side_setting_id",
        [Sequelize.literal("shank_image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by",
      ],
      include: [{ model: Image, as: "shank_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    if (!(findShank && findShank.dataValues)) {
      return resNotFound();
    }

    return resSuccess({ data: findShank });
  } catch (error) {
    throw error;
  }
};

export const updateShank = async (req: Request) => {
  try {
    const {ShanksData,Image} = initModels(req);
    const { name, sort_code, image_delete = "0" } = req.body;
    const id = req.params.id;
    const slug = createSlug(name);
    const findShank = await ShanksData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findShank && findShank.dataValues)) {
      return resNotFound();
    }
    const findName = await ShanksData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    const findSortCode = await ShanksData.findOne({
      where: [
        columnValueLowerCase("sort_code", sort_code),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      (findName && findName.dataValues) ||
      (findSortCode && findSortCode.dataValues)
    ) {
      return resNotFound();
    }
    const trn = await (req.body.db_connection).transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findShank.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findShank.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.shanks,
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

      const shankInfo = await ShanksData.update(
        {
          name: name,
          slug: slug,
          sort_code: sort_code,
          id_image:
            image_delete && image_delete === "1"
              ? null
              : imageId || findShank.dataValues.id_image,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        {
          where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        }
      );
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3(req,findImage,req.body.session_res.client_id);
      }

      const AfterUpdatefindShank = await ShanksData.findOne({
        where: { id: id, is_deleted: DeletedStatus.No },
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { shank_id: findShank?.dataValues?.id, data: {...findShank?.dataValues} },
        new_data: {
          shank_id: AfterUpdatefindShank?.dataValues?.id, data: { ...AfterUpdatefindShank?.dataValues }
        }
      }], findShank?.dataValues?.id, LogsActivityType.Edit, LogsType.Shank, req?.body?.session_res?.id_app_user,trn)
      
      await trn.commit();
      return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
    } catch (e) {
      await trn.rollback();

      throw e;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteShank = async (req: Request) => {
  try {
    const {ShanksData} = initModels(req);
    const findShank = await ShanksData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findShank && findShank.dataValues)) {
      return resNotFound();
    }
    await ShanksData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findShank.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { shank_id: findShank?.dataValues?.id, data: {...findShank?.dataValues} },
      new_data: {
        shank_id: findShank?.dataValues?.id, data: {
          ...findShank?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findShank?.dataValues?.id, LogsActivityType.Delete, LogsType.Shank, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForShank = async (req: Request) => {
  try {
    const {ShanksData} = initModels(req);
    const findShank = await ShanksData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No },
    });
    if (!(findShank && findShank.dataValues)) {
      return resNotFound();
    }
    await ShanksData.update(
      {
        is_active: statusUpdateValue(findShank),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findShank.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { shank_id: findShank?.dataValues?.id, data: {...findShank?.dataValues }},
      new_data: {
        shank_id: findShank?.dataValues?.id, data: {
          ...findShank?.dataValues, is_active: statusUpdateValue(findShank),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findShank?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Shank, req?.body?.session_res?.id_app_user)
      
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
