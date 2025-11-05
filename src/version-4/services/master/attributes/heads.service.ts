import { Request } from "express";
import { Sequelize, Op, where } from "sequelize";
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

export const addHead = async (req: Request) => {
  try {
    const { HeadsData,Image } = initModels(req);
    const { name, sort_code } = req.body;
    const slug = createSlug(name);
    const findName = await HeadsData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id },
      ],
    });
    const findSortCode = await HeadsData.findOne({
      where: [
        columnValueLowerCase("sort_code", sort_code),
        { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
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
          IMAGE_TYPE.caratSize,
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
        created_date: getLocalDate(),
        created_by: req.body.session_res.id_app_user,
        company_info_id :req?.body?.session_res?.client_id,
        sort_code: sort_code,
        id_image: idImage,
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
      };

      const head = await HeadsData.create(payload, { transaction: trn });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          head_id: head?.dataValues?.id, data: {
            ...head?.dataValues
          }
        }
      }], head?.dataValues?.id, LogsActivityType.Add, LogsType.Head, req?.body?.session_res?.id_app_user,trn)

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

export const getHeads = async (req: Request) => {
  try {
    const { HeadsData,Image } = initModels(req);
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
      const totalItems = await HeadsData.count({
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

    const result = await HeadsData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "slug",
        "sort_code",
        [Sequelize.literal("head_image.image_path"), "image_path"],
        "is_active",
      ],
      include: [{ model: Image, as: "head_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdHead = async (req: Request) => {
  try {
    const { HeadsData,Image } = initModels(req);
    const findHead = await HeadsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No ,company_info_id :req?.body?.session_res?.client_id},
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
        "diamond_size_id",
        "diamond_shape_id",
        [Sequelize.literal("image.image_path"), "image_path"],
        "created_date",
        "is_active",
        "created_by",
      ],
      include: [{ model: Image, as: "image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    if (!(findHead && findHead.dataValues)) {
      return resNotFound();
    }

    return resSuccess({ data: findHead });
  } catch (error) {
    throw error;
  }
};

export const updateHead = async (req: Request) => {
  try {
    const { HeadsData,Image } = initModels(req);
    const { name, sort_code, image_delete = "0" } = req.body;
    const id = req.params.id;
    const slug = createSlug(name);
    const findHead = await HeadsData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findHead && findHead.dataValues)) {
      return resNotFound();
    }
    const findName = await HeadsData.findOne({
      where: [
        columnValueLowerCase("name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id },
      ],
    });

    const findSortCode = await HeadsData.findOne({
      where: [
        columnValueLowerCase("sort_code", sort_code),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        { company_info_id :req?.body?.session_res?.client_id },
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
      let imageId = null;
      let findImage = null;
      if (findHead.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findHead.dataValues.id_image,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.heads,
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
      await HeadsData.update(
        {
          name: name,
          slug: slug,
          id_image:
            image_delete && image_delete === "1"
              ? null
              : imageId || findHead.dataValues.id_image,
          sort_code: sort_code,
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
      const afterUpdatefindHead = await HeadsData.findOne({
        where: { id: id, is_deleted: DeletedStatus.No },transaction:trn
      });

    
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { head_id:findHead?.dataValues?.id, data:{...findHead?.dataValues} },
        new_data: {
          head_id:afterUpdatefindHead?.dataValues?.id, data: { ...afterUpdatefindHead?.dataValues }
        }
      }],findHead?.dataValues?.id, LogsActivityType.Edit, LogsType.Head, req?.body?.session_res?.id_app_user,trn)

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

export const deleteHead = async (req: Request) => {
  try {
    const { HeadsData } = initModels(req);
    const headExists = await HeadsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(headExists && headExists.dataValues)) {
      return resNotFound();
    }
    await HeadsData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: headExists.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { head_id: headExists?.dataValues?.id, data:{... headExists?.dataValues} },
      new_data: {
        head_id: headExists?.dataValues?.id, data: {
          ...headExists?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], headExists?.dataValues?.id, LogsActivityType.Delete, LogsType.Head, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForHead = async (req: Request) => {
  try {
    const { HeadsData } = initModels(req);
    const findHead = await HeadsData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findHead && findHead.dataValues)) {
      return resNotFound();
    }
    await HeadsData.update(
      {
        is_active: statusUpdateValue(findHead),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findHead.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { head_id: findHead?.dataValues?.id, data: {...findHead?.dataValues}},
      new_data: {
        head_id: findHead?.dataValues?.id, data: {
          ...findHead?.dataValues, is_active:  statusUpdateValue(findHead),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findHead?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Head, req?.body?.session_res?.id_app_user)
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
