import { Request } from "express";
import Enquiries from "../../model/enquiries.model";
import { getLocalDate, resSuccess } from "../../utils/shared-functions";
import ProductEnquiries from "../../model/product-enquiry.model";

export const addEnquiries = async (req: Request) => {
    const { first_name, last_name, email, created_by, phone_number, message } = req.body
    try {
        const payload = {
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: phone_number,
            message: message,
            enquirie_type: 1,
            created_date: getLocalDate(),
            created_by: req.body.session_res.id_app_user,
        }
            await Enquiries.create(payload)
            console.log(payload);
            return resSuccess({data: payload});

    } catch (error) {
        throw (error)
    }
}

export const addProductEnquiries = async (req: Request) => {
    const { full_name, email, contact_number, message, product_id, metal_id, karat_id, metal_tone_id, size, length  } = req.body
    try {

        const payload = {
            full_name: full_name,
            email: email,
            contact_number: contact_number,
            message: message,
            product_id: product_id,
            product_json: { metal_id, karat_id, metal_tone_id, size, length },
            created_date: getLocalDate(),
            admin_action: 0,
            created_by: req.body.session_res.id_app_user,
        }
            await ProductEnquiries.create(payload)
            console.log(payload);
            return resSuccess({data: payload});

    } catch (error) {
        throw (error)
    }
}