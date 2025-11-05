import { Request } from "express";
import { ActiveStatus, DeletedStatus, DYNAMIC_MAIL_TYPE, LogsActivityType, LogsType } from "../../utils/app-enumeration";
import { addActivityLogs, getInitialPaginationFromQuery, getLocalDate, prepareMessageFromParams, resBadRequest, resNotFound, resSuccess, resUnknownError, statusUpdateValue } from "../../utils/shared-functions";
import {  INVALID_MESSAGE_TYPE, MESSAGE_TYPE_MUST_BE_ARRAY, MESSAGE_VALUE_FROM_THIS_ONLY, NOTABLE_TO_INACTIVE_UNTILL_NOT_ASSIGN_OTHER_ONE, NOTABLE_TO_REMOVE_UNTILL_NOT_ASSIGN_OTHER_ONE, ONLY_ABLE_TO_TEMPLATE_EDIT_ERROR_MESSAGE, RECORD_DELETE_SUCCESSFULLY, RECORD_UPDATE_SUCCESSFULLY, TEMPLATE_CREATED_SUCCESS, TEMPLATE_NOT_FOUND, TEMPLATE_UPDATED_SUCCESS } from "../../utils/app-messages";
import { Op } from "sequelize";
import { LOG_FOR_SUPER_ADMIN } from "../../utils/app-constants";
import { initModels } from "../model/index.model";

const updateMessageTypesForOtherTemplates = async (templateId: string | null, message_type: any[], trn: any,client_id:number, req: Request) => {
  try {
    const {EmailTemplate} = initModels(req);
      const allTemplates: any = await EmailTemplate.findAll({
    where: {
      is_deleted: DeletedStatus.No,
      company_info_id :client_id,
      ...(templateId ? { id: { [Op.ne]: templateId } } : {}), // Exclude current template from being updated
    },
  });

  if (allTemplates) {
    for (let template of allTemplates) {
      let existingMessageType: number[] = [];

      try {
        // Ensure existing message_type is a valid array
        existingMessageType = Array.isArray(template?.message_type) ? template.message_type : [];
      } catch (error) {
        console.error("Error parsing message_type:", error);
        existingMessageType = []; // Fallback to an empty array if parsing fails
      }

      // Remove overlapping types that are no longer part of the updated message_type
      const updatedMessageType = existingMessageType.filter((type: number) => !message_type.includes(type));

      // Update the template with the new message_type after removal
      await template.update(
        {
          message_type: updatedMessageType,
        },
        { transaction: trn }
      );
    }
  }
  } catch (error) {
    throw error
  }
};

const checkIfMessageTypeAssignedElsewhere = async (messageType: number, templateId: number,client_id:number, req: Request) => {
  try {
    const {EmailTemplate} = initModels(req);
    const templatesUsingMessageType = await EmailTemplate.findAll({
    where: {
      message_type: { [Op.contains]: [messageType] }, // Check if the message_type array contains the type
      id: { [Op.ne]: templateId }, // Exclude the current template from the check
      is_deleted: DeletedStatus.No,
      company_info_id :client_id,
    },
  });
  return templatesUsingMessageType.length <= 0; // If the length is greater than 0, it means the message type is assigned elsewhere
  } catch (error) {
    throw error
  }
};


export const addOrEditMailTemplate = async (req: Request) => {
  const templateId:any = req?.params?.id; // Get the template ID from URL params (if provided)

  try {
    const {EmailTemplate} = initModels(req);
    const { template_name, subject, body, message_type = [], placeholders } = req.body;
    const isInvoiceRoute = (req as any).email_type; // boolean value you set

    // Validate message_type if it is provided
    let validatedMessageType: any[] = [];
    if (message_type && message_type.length > 0) {
      if (!Array.isArray(message_type)) {
        return resBadRequest({ message: MESSAGE_TYPE_MUST_BE_ARRAY });
      }

      const invalidTypes:any = message_type.filter(
        (type) => !Object.values(DYNAMIC_MAIL_TYPE).includes(type)
      );
      if (invalidTypes.length > 0) {
        const invalidTypesArray = invalidTypes.join(", ");
        const messageTypeKeys = Object.keys(DYNAMIC_MAIL_TYPE).join(", ");
        
        return resBadRequest({
          message: prepareMessageFromParams(
            MESSAGE_VALUE_FROM_THIS_ONLY, 
            [
              ["invalidTypes", invalidTypesArray],
              ["MESSAGE_TYPE", messageTypeKeys]
            ]
          ),
        });
        
      }
      validatedMessageType = message_type; // If valid, store it
    }

    const trn = await (req.body.db_connection).transaction();

    try {
      if (templateId) {
        // If templateId exists, we're editing an existing template
        const existingTemplate: any = await EmailTemplate.findOne({
          where: {
            id: templateId,
            is_deleted: DeletedStatus.No,
            company_info_id :req?.body?.session_res?.client_id,
          },
          transaction: trn  // Ensure the transaction is passed correctly
        });

        if (existingTemplate) {
          let currentMessageType = existingTemplate.message_type;

          // Ensure that currentMessageType is an array
          if (typeof currentMessageType === "string") {
            try {
              currentMessageType = JSON.parse(currentMessageType); // If it's a string, parse it
            } catch (e) {
              return resBadRequest({ message: INVALID_MESSAGE_TYPE });
            }
          }

          if (!Array.isArray(currentMessageType)) {
            currentMessageType = []; // Fallback to empty array if something goes wrong
          }

          // Identify removed message types (those present in currentMessageType but not in validatedMessageType)
          const removedTypes = currentMessageType.filter(
            (type) => !validatedMessageType.includes(type)
          );
          // Check if any of the removed types are still assigned to other templates
          for (const type of removedTypes) {
            const isAssignedElsewhere = await checkIfMessageTypeAssignedElsewhere(type, templateId,req?.body?.session_res?.client_id, req);
            if (isAssignedElsewhere) {
              trn.rollback();
              
              return resBadRequest({
                message:  prepareMessageFromParams(
                  NOTABLE_TO_REMOVE_UNTILL_NOT_ASSIGN_OTHER_ONE, 
                  [
                    ["type", type],
                  ]
                ),
              });
            }
          }

          // Now proceed with updating the template
          const updatedMessageType = validatedMessageType;

          // Remove overlapping message types in other templates
          await updateMessageTypesForOtherTemplates(templateId, validatedMessageType, trn,req?.body?.session_res?.client_id, req);

          // Update the current template with the new message type
          await existingTemplate.update(
            {
              template_name,
              subject,
              body,
              placeholders,
              message_type: updatedMessageType, // Store directly as an array (this will overwrite the old value)
              is_active: ActiveStatus.Active,
              updated_by: req.body.session_res.id_app_user,
              updated_date: new Date(),
              is_invoice :isInvoiceRoute
            },
            { transaction: trn }
          );
          const afterUpdateexistingTemplate = await EmailTemplate.findOne({ where: { id: req.params.id } })

          await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
            old_data: { email_template_id: existingTemplate?.dataValues?.id, data: {...existingTemplate?.dataValues}},
            new_data: {
              email_template_id: afterUpdateexistingTemplate?.dataValues?.id, data: { ...afterUpdateexistingTemplate?.dataValues }
            }
          }], existingTemplate?.dataValues?.id,LogsActivityType.Edit, LogsType.EmailTemplate, req?.body?.session_res?.id_app_user,trn)
          await trn.commit();
          return resSuccess({ message: TEMPLATE_UPDATED_SUCCESS });
        } else {
          return resNotFound();
        }
      } else {
        // If no templateId, create a new template
        await updateMessageTypesForOtherTemplates(null, validatedMessageType, trn,req?.body?.session_res?.client_id, req);

        // Create the new template
        const emailTemplates = await EmailTemplate.create(
          {
            template_name,
            subject,
            body,
            message_type: validatedMessageType, // Store directly as an array
            placeholders,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            created_by: req?.body?.session_res?.id_app_user,
            company_info_id :req?.body?.session_res?.client_id,
            created_date: new Date(),
            is_invoice :isInvoiceRoute
          },
          { transaction: trn }
        );
        await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
          old_data: null,
          new_data: {
            email_template_id: emailTemplates?.dataValues?.id, data: {
              ...emailTemplates?.dataValues
            },
          }
        }], emailTemplates?.dataValues?.id, LogsActivityType.Add, LogsType.EmailTemplate, req?.body?.session_res?.id_app_user,trn);
        await trn.commit();
        return resSuccess({ message: TEMPLATE_CREATED_SUCCESS });
      }
    } catch (e) {
      await trn.rollback();
      console.error(e); // Log the error for debugging
      return resUnknownError(e);
    }
  } catch (e) {
    console.error(e); // Log the error for debugging
    return resUnknownError(e);
  }
};


export const deleteMailTemplate = async (req: Request) => {
  try {
    const {EmailTemplate} = initModels(req);
    const MailTemplate:any = await EmailTemplate.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id},
    });

    if (!(MailTemplate && MailTemplate.dataValues)) {
      return resNotFound({ message: TEMPLATE_NOT_FOUND });
    }

   // Check if the message_type column is an empty array
    if (Array.isArray(MailTemplate.message_type) && MailTemplate.message_type.length > 0) {
      return resBadRequest({ message:prepareMessageFromParams(
        NOTABLE_TO_REMOVE_UNTILL_NOT_ASSIGN_OTHER_ONE, 
        [
          ["type", MailTemplate.message_type],
        ]
      ), });
    }
    
    await EmailTemplate.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: MailTemplate.dataValues.id,company_info_id :req?.body?.session_res?.client_id} }
    );
    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: { email_template_id: MailTemplate?.dataValues?.id, data:{...MailTemplate?.dataValues}},
      new_data: {
        email_template_id: MailTemplate?.dataValues?.id, data: {
          ...MailTemplate?.dataValues,   is_deleted: DeletedStatus.yes,
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        },section_type: MailTemplate?.dataValues?.section_type
      }
    }], MailTemplate?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.EmailTemplate, req?.body?.session_res?.id_app_user)
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (e:any) {
    return resUnknownError(e);
  }
};

export const getMailTemplate = async (req: Request) => {
  try {
    const {EmailTemplate} = initModels(req);

    const templateId = req?.params?.id;  // Check if an 'id' is provided in the URL params
    const isInvoiceRoute = (req as any).email_type; // boolean value you set

    // If an ID is provided, fetch the details for that specific template
    if (templateId) {
      const template = await EmailTemplate.findOne({
        where: {
          is_invoice : isInvoiceRoute,
          id: templateId,  // Match by template_id
          is_deleted: DeletedStatus.No,  // Ensure it's not deleted
          company_info_id :req?.body?.session_res?.client_id,
        },
        attributes: [
          "id", 
          "template_name", 
          "subject", 
          "body", 
          "is_active",
          "is_deleted",
          "message_type", 
          "placeholders",
          "created_date", 
          "modified_date",
          "is_invoice"
        ],
      });

      if (!template) {
        return resBadRequest({message:TEMPLATE_NOT_FOUND});  // Return an error if template is not found
      }

      return resSuccess({ data: template });  // Return the template details
    }

    // Pagination logic starts here if no ID is provided
    let paginationProps = {};
    let pagination = {
      ...getInitialPaginationFromQuery(req.query),  // A function to extract pagination details from query params
      search_text: req.query.search_text || '',      // Search term if present
    };
    let noPagination = req.query.no_pagination === "1";  // Check if pagination should be skipped

    // Build 'where' clause with conditions
    let where: any[] = [
      { is_invoice: isInvoiceRoute },
      { is_deleted: DeletedStatus.No },  // Only fetch templates that are not deleted
      {company_info_id :req?.body?.session_res?.client_id},
    ];

    // Add search filters if search text is present
    if (pagination.search_text) {
      where.push({
        [Op.or]: [
          { template_name: { [Op.iLike]: "%" + pagination.search_text + "%" } }, // Search by template_name
          { subject: { [Op.iLike]: "%" + pagination.search_text + "%" } }, // Search by subject
          { body: { [Op.iLike]: "%" + pagination.search_text + "%" } }, // Search by body
        ],
      });
    }

    // If pagination is enabled
    if (!noPagination) {
      const totalItems = await EmailTemplate.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } }); // No data found
      }

      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows); // Calculate total pages

      paginationProps = {
        limit: pagination.per_page_rows,
        offset: (pagination.current_page - 1) * pagination.per_page_rows, // Offset for pagination
      };
    }

    // Fetch email templates with pagination and search criteria
    const result = await EmailTemplate.findAll({
      ...paginationProps,
      where,
      order: [[pagination.sort_by || 'created_at', pagination.order_by || 'DESC']], // Order by date created or default
      attributes: [
        "id", 
        "template_name", 
        "subject", 
        "body", 
        "is_active",
        "is_deleted",
        "message_type", 
        "placeholders",
        "created_date", 
        "modified_date",
      ],
    });

    // Return the result along with pagination info (if pagination is used)
    return resSuccess({ data: noPagination ? result : { pagination, result } });

  } catch (error) {
    return resUnknownError(error); // Propagate the error
  }
};


export const statusUpdateForMailTemplate = async (req: Request) => {
  try {
    const {EmailTemplate} = initModels(req);

    const MailTemplate:any = await EmailTemplate.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(MailTemplate && MailTemplate.dataValues)) {
      return resNotFound({ message: TEMPLATE_NOT_FOUND });
    }
     // Check if the message_type column is an empty array
     if (Array.isArray(MailTemplate.message_type) && MailTemplate.message_type.length > 0) {
      return resBadRequest({ message:prepareMessageFromParams(
        NOTABLE_TO_INACTIVE_UNTILL_NOT_ASSIGN_OTHER_ONE, 
        [
          ["type", MailTemplate.message_type],
        ]
      ), });
    }

    await EmailTemplate.update(
      {
        is_active: statusUpdateValue(MailTemplate),
        modified_date: getLocalDate(),
        modified_by: req.body.session_res.id_app_user,
      },
      { where: { id: MailTemplate.dataValues.id,company_info_id :req?.body?.session_res?.client_id} }
    );

    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: { email_template_id: MailTemplate?.dataValues?.id, data: {...MailTemplate?.dataValues}},
      new_data: {
        email_template_id: MailTemplate?.dataValues?.id, data: {
          ...MailTemplate?.dataValues,  is_active: statusUpdateValue(MailTemplate),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        },section_type: MailTemplate?.dataValues?.section_type
      }
    }], MailTemplate?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.EmailTemplate, req?.body?.session_res?.id_app_user)

    return resSuccess({ message: TEMPLATE_UPDATED_SUCCESS });
  } catch (error) {
    return resUnknownError(error);
  }
};
