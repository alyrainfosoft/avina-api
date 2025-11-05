import { Request } from "express";
import { Op } from "sequelize";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  ActiveStatus,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
} from "../../../utils/app-enumeration";
import {
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
} from "../../../utils/app-messages";
import {
  addActivityLogs,
  columnValueLowerCase,
  getInitialPaginationFromQuery,
  getLocalDate,
  resErrorDataExit,
  resNotFound,
  resSuccess,
} from "../../../utils/shared-functions";
import { statusUpdateValue } from "../../../utils/shared-functions";
import { initModels } from "../../model/index.model";

export const addCountry = async (req: Request) => {
  try {
    const { CountryData } = initModels(req);
    const { name, code } = req.body;

    const payload = {
      country_name: name,
      country_code: code,
      created_date: getLocalDate(),
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
    };

    const findSortCode = await  CountryData.findOne({
      where: [
        columnValueLowerCase("country_code", code),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });

    const findName = await  CountryData.findOne({
      where: [
        columnValueLowerCase("country_name", name),
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      findSortCode &&
      findSortCode.dataValues &&
      findName &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    const country = await  CountryData.create(payload);
    
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: null,
      new_data: {
        country_id: country?.dataValues?.id, data: {
          ...country?.dataValues
        }
      }
    }], country?.dataValues?.id, LogsActivityType.Add, LogsType.Country, req?.body?.session_res?.id_app_user)


    return resSuccess({ data: payload });
  } catch (error) {
    throw error;
  }
};

export const getAllCountry = async (req: Request) => {
  try {
    const { CountryData } = initModels(req);

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
              {
                country_name: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
              {
                country_code: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await  CountryData.count({
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

    const result = await  CountryData.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: ["id", "country_name", "country_code", "is_active"],
    });

    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};


    const s3Abc = new S3Client({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: 'AKIA6ODU7KPESZ6GUVT3',
        secretAccessKey: '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',
      },
    });

export const getPresignedUrl = async (req: Request) => {
  try {

    const { filename, contentType } = req.body;
    console.log('filename', filename)
    console.log('contentType', contentType)
    // if (!filename || !contentType) {
    //   return resErrorDataExit();
    // }

    const key = `uploads/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: 'zeghani-tcc',
      Key: key,
      ContentType: contentType,
    });

    try {
      const signedUrl = await getSignedUrl(s3Abc, command, { expiresIn: 3000 }); // 5 min
      return resSuccess({ data: { url: signedUrl, key } });
    } catch (err) {
      console.error(err);
      return resErrorDataExit();
    }
  } catch (error) {
    throw error;
  }
};



export const getByIdCountry = async (req: Request) => {
  try {
    const { CountryData } = initModels(req);

    const findCountry = await  CountryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findCountry });
  } catch (error) {
    throw error;
  }
};

export const updateCountry = async (req: Request) => {
  try {
    const { CountryData } = initModels(req);

    const { name, code } = req.body;
    const id = req.params.id;
    const findCountry = await  CountryData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }
    const findName = await  CountryData.findOne({
      where: [
        columnValueLowerCase("country_name", name),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    const findSortCode = await  CountryData.findOne({
      where: [
        columnValueLowerCase("country_code", code),
        { id: { [Op.ne]: id } },
        { is_deleted: DeletedStatus.No },
        {company_info_id :req?.body?.session_res?.client_id},
      ],
    });
    if (
      findSortCode &&
      findSortCode.dataValues &&
      findName &&
      findName.dataValues
    ) {
      return resErrorDataExit();
    }
    await  CountryData.update(
      {
        country_name: name,
        country_code: code,
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id } }
    );
    const afterUpdatefindCountry = await  CountryData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No },
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,req?.body?.session_res?.client_id,[{
      old_data: { country_id: findCountry?.dataValues?.id, data: {...findCountry?.dataValues} },
      new_data: {
        country_id: afterUpdatefindCountry?.dataValues?.id, data: { ...afterUpdatefindCountry?.dataValues }
      }
    }], findCountry?.dataValues?.id, LogsActivityType.Edit, LogsType.Coupon, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ data: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const deleteCountry = async (req: Request) => {
  try {
    const { CountryData } = initModels(req);

    const findCountry = await  CountryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }
    await  CountryData.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCountry.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,req?.body?.session_res?.client_id,[{
      old_data: { country_id: findCountry?.dataValues?.id, data: {...findCountry?.dataValues} },
      new_data: {
        country_id: findCountry?.dataValues?.id, data: {
          ...findCountry?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findCountry?.dataValues?.id, LogsActivityType.Delete, LogsType.Country, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCountry = async (req: Request) => {
  try {
    const { CountryData } = initModels(req);

    const findCountry = await  CountryData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });
    if (!(findCountry && findCountry.dataValues)) {
      return resNotFound();
    }

    await  CountryData.update(
      {
        is_active: statusUpdateValue(findCountry),
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: findCountry.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );

    
    await addActivityLogs(req,req?.body?.session_res?.client_id,req?.body?.session_res?.client_id,[{
      old_data: { country_id: findCountry?.dataValues?.id, data: {...findCountry?.dataValues} },
      new_data: {
        country_id: findCountry?.dataValues?.id, data: {
          ...findCountry?.dataValues, is_active: statusUpdateValue(findCountry),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCountry?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Country, req?.body?.session_res?.id_app_user)
      

    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};
