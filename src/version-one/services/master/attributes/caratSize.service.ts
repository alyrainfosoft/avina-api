import { Request } from "express";
import { Op, Sequelize } from "sequelize";
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
import {
  ActiveStatus,
  DeletedStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../../utils/app-enumeration";
import { IQueryPagination } from "../../../../data/interfaces/common/common.interface";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../../utils/app-messages";
import { initModels } from "../../../model/index.model";

export const addCaratSize = async (req: Request) => {
  try {
    const {DiamondCaratSize,Image} = initModels(req);
    const { value } = req.body;
    const slug = createSlug(value);
    const sort_code_value = Math.round(parseFloat(value) * 100);
    const caratSizeValue = await DiamondCaratSize.findOne({
      where: [
        columnValueLowerCase("value", value),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id}
      ],
    });
    if (caratSizeValue && caratSizeValue.dataValues) {
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
        value: value,
        slug: slug,
        id_image: idImage,
        sort_code: sort_code_value,
        created_date: getLocalDate(),
        is_active: ActiveStatus.Active,
        is_deleted: DeletedStatus.No,
        created_by: req.body.session_res.id_app_user,
        company_info_id :req?.body?.session_res?.client_id,
      };

      const DiamondCaratSizeData = await DiamondCaratSize.create(payload, { transaction: trn });
      
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          diamond_carat_size_id: DiamondCaratSizeData?.dataValues?.id, data: {
            ...DiamondCaratSizeData?.dataValues
          }
        }
      }], DiamondCaratSizeData?.dataValues?.id, LogsActivityType.Add, LogsType.DiamondCaratSize, req?.body?.session_res?.id_app_user,trn)
      
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

export const getCaratSizes = async (req: Request) => {
  try {
    const { DiamondCaratSize,Image } = initModels(req);
    let pagination: IQueryPagination = {
      ...getInitialPaginationFromQuery(req.query),
    };

    let noPagination = req.query.no_pagination === Pagination.no;

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      pagination.is_active ? { is_active: pagination.is_active } : {},
      {
        [Op.or]: [
          { value: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: DeletedStatus.No,
      },
    ];
    if (!noPagination) {
      const totalItems = await DiamondCaratSize.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }

    const result = await DiamondCaratSize.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "value",
        "sort_code",
        "slug",
        "is_active",
        "is_diamond",
        "is_config",
        "is_band",
        "is_three_stone",
        "is_bracelet",
        "is_pendant",
        "is_earring",
        [
          Sequelize.literal(
            `CASE WHEN "is_diamond_shape" IS NULL THEN '{}'::int[] ELSE string_to_array("is_diamond_shape", '|')::int[] END`
          ),
          "is_diamond_shape",
        ],
        "id_image",
        [Sequelize.literal("diamond_carat_image.image_path"), "image_path"],
      ],
      include: [{ model: Image, as: "diamond_carat_image", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const getByIdCaratSize = async (req: Request) => {
  try {
    const { DiamondCaratSize } = initModels(req);
    const findCaratSize = await DiamondCaratSize.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCaratSize && findCaratSize.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findCaratSize });
  } catch (error) {
    throw error;
  }
};

export const updateCaratSize = async (req: Request) => {
  try {
    const { DiamondCaratSize,Image } = initModels(req);
    const { value, image_delete = "0" } = req.body;

    const sort_code_value = Math.round(parseFloat(value) * 100);
    const slug = createSlug(value);
    const findCaratSize = await DiamondCaratSize.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCaratSize && findCaratSize.dataValues)) {
      return resNotFound();
    }
    const findName = await DiamondCaratSize.findOne({
      where: [
        columnValueLowerCase("value", value),
        { id: { [Op.ne]: req.params.id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id}
      ],
    });

    if (findName && findName.dataValues) {
      return resErrorDataExit();
    }

    const trn = await (req.body.db_connection).transaction();
    try {
      let imageId = null;
      let findImage = null;
      if (findCaratSize.dataValues.id_image) {
        findImage = await Image.findOne({
          where: { id: findCaratSize.dataValues.id_image ,company_info_id :req?.body?.session_res?.client_id},
          transaction: trn,
        });
      }
      if (req.file) {
        const imageData = await imageAddAndEditInDBAndS3(req,
          req.file,
          IMAGE_TYPE.caratSize,
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
      await DiamondCaratSize.update(
        {
          value: value,
          slug: slug,
          id_image:
            image_delete && image_delete === "1"
              ? null
              : imageId || findCaratSize.dataValues.id_image,
          sort_code: sort_code_value,
          modified_date: getLocalDate(),
          modified_by: req.body.session_res.id_app_user,
        },
        {
          where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
          transaction: trn,
        }
      );
      if (image_delete && image_delete === "1" && findImage.dataValues) {
        await imageDeleteInDBAndS3((req.body.db_connection),findImage,req.body.session_res.client_id);
      }
      const AfterUpdatefindCaratSize = await DiamondCaratSize.findOne({
        where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },transaction:trn 
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { diamond_carat_size_id: findCaratSize?.dataValues?.id, data: {...findCaratSize?.dataValues} },
        new_data: {
          diamond_carat_size_id: AfterUpdatefindCaratSize?.dataValues?.id, data: { ...AfterUpdatefindCaratSize?.dataValues }
        }
      }], findCaratSize?.dataValues?.id, LogsActivityType.Edit, LogsType.DiamondCaratSize, req?.body?.session_res?.id_app_user,trn)
      

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

export const deleteCaratSize = async (req: Request) => {
  try {
    const { DiamondCaratSize } = initModels(req);
    const findCaratSize = await DiamondCaratSize.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCaratSize && findCaratSize.dataValues)) {
      return resNotFound();
    }
    await DiamondCaratSize.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCaratSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { diamond_carat_size_id: findCaratSize?.dataValues?.id, data: {...findCaratSize?.dataValues }},
      new_data: {
        diamond_carat_size_id: findCaratSize?.dataValues?.id, data: {
          ...findCaratSize?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findCaratSize?.dataValues?.id, LogsActivityType.Delete, LogsType.DiamondCaratSize, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCaratSize = async (req: Request) => {
  try {
    const { DiamondCaratSize } = initModels(req);
    const findCaratSize = await DiamondCaratSize.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCaratSize && findCaratSize.dataValues)) {
      return resNotFound();
    }
    await DiamondCaratSize.update(
      {
        is_active: statusUpdateValue(findCaratSize),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCaratSize.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { diamond_carat_size_id: findCaratSize?.dataValues?.id, data: {...findCaratSize?.dataValues} },
      new_data: {
        diamond_carat_size_id: findCaratSize?.dataValues?.id, data: {
          ...findCaratSize?.dataValues, is_active: statusUpdateValue(findCaratSize),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCaratSize?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.DiamondCaratSize, req?.body?.session_res?.id_app_user)


    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
