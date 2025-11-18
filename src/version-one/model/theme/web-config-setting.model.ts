import { BOOLEAN, DATE, INTEGER, STRING, TEXT } from "sequelize";
export const WebConfigSetting = (dbContext: any) => {
    let webConfigSetting = dbContext.define("web_config_setting", {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        razorpay_public_key: {
            type: 'character varying',
        },
        razorpay_secret_key: {
            type: 'character varying',
        },
        razorpay_status: {
            type: 'bit',
        },
        razorpay_script: {
            type: 'character varying',
        },
        stripe_public_key: {
            type: 'character varying',
        },
        stripe_secret_key: {
            type: 'character varying',
        },
        stripe_status: {
            type: 'bit',
        },
        stripe_script: {
            type: 'character varying',
        },
        paypal_public_key: {
            type: 'character varying',
        },
        paypal_secret_key: {
            type: 'character varying',
        },
        paypal_status: {
            type: 'bit',
        },
        paypal_script: {
            type: 'character varying',
        },
        yoco_public_key: {
            type: 'character varying',
        },
        yoco_secret_key: {
            type: 'character varying',
        },
        yoco_status: {
            type: 'bit',
        },
        yoco_script: {
            type: 'character varying',
        },
        affirm_public_key: {
            type: 'character varying',
        },
        affirm_secret_key: {
            type: 'character varying',
        },
        affirm_status: {
            type: 'bit',
        },
        affirm_script: {
            type: 'character varying',
        },
        smtp_user_name: {
            type: 'character varying',
        },
        smtp_password: {
            type: 'character varying',
        },
        smtp_host: {
            type: 'character varying',
        },
        smtp_port: {
            type: 'character varying',
        },
        smtp_secure: {
            type: 'character varying',
        },
        smtp_from: {
            type: 'character varying',
        },
        smtp_service: {
            type: 'character varying',
        },
        insta_api_endpoint: {
            type: 'character varying',
        },
        insta_access_token: {
            type: 'character varying',
        },
        image_local_path: {
            type: 'character varying',
        },
        file_local_path: {
            type: 'character varying',
        },
        local_status: {
            type: 'bit'
        },
        s3_bucket_name: {
            type: 'character varying',
        },
        s3_bucket_region: {
            type: 'character varying',
        },
        s3_bucket_secret_access_key: {
            type: 'character varying',
        },
        s3_bucket_status: {
            type: 'bit',
        },
        fronted_base_url: {
            type: 'character varying',
        },
        reset_pass_url: {
            type: 'character varying',
        },
        otp_generate_digit_count: {
            type: INTEGER,
        },
        invoice_number_generate_digit_count: {
            type: INTEGER,
        },
        order_invoice_number_identity: {
            type: 'character varying',
        },
        allow_out_of_stock_product_order: {
            type: BOOLEAN,
        },
        company_id: {
            type: INTEGER
        },
        modified_by: {
            type: INTEGER
        },
        modified_date: {
            type: DATE
        },
        image_base_url: {
            type: 'character varying'
        },
        company_info_id: {
            type: INTEGER
        },
        metal_tone_identifier: {
            type: INTEGER,
        },
        three_stone_glb_key: {
            type: 'character varying',
        },
        band_glb_key: {
            type: 'character varying',
        },
        glb_key: {
            type: 'character varying',
        },
        metal_karat_value: {
            type: TEXT,
        },
        metal_gold_id: {
            type: INTEGER
        },
        metal_silver_id: {
            type: INTEGER
        },
        metal_platinum_id: {
            type: INTEGER
        },
        eternity_band_glb_key: {
            type: 'character varying'
        },
        bracelet_glb_key: {
            type: 'character varying'
        },
        google_font_key: {
            type: 'character varying'
        },
        google_auth_status: {
            type: 'bit'
        },
        google_auth_key: {
            type: 'character varying'
        },
        insta_auth_status: {
            type: 'bit'
        },
        insta_auth_key: {
            type: 'character varying'
        },
        facebook_auth_status: {
            type: 'bit'
        },
        facebook_auth_key: {
            type: 'character varying'
        },
        apple_auth_status: {
            type: 'bit'
        },
        apple_auth_key: {
            type: 'character varying'
        },
        glb_url: {
            type: 'bit'
        },
        insta_secret_key: {
            type: 'character varying'
        },
        gust_user_allowed: {
            type: BOOLEAN
        },
        promo_code_allowed: {
            type: BOOLEAN
        },
        pickup_from_store: {
            type: BOOLEAN
        },
        move_to_wishlist: {
            type: BOOLEAN
        },
        shop_now: {
            type: BOOLEAN
        },
        s3_bucket_access_key: {
            type: 'character varying'
        },
        whats_app_send_message_status: {
            type: BOOLEAN,
        },
        whats_app_send_message_api: {
            type: 'character varying',
        },
        whats_app_send_message_api_token: {
            type: 'character varying',
        },
        google_map_api_key: {
            type: 'character varying',
        },
        pendant_glb_key: {
            type: 'character varying',
        },
        is_login: {
            type: BOOLEAN,
            defaultValue: false,
        },
        is_config_login: {
            type: BOOLEAN,
            defaultValue: false,
        },
        is_sign_up: {
            type: BOOLEAN,
            defaultValue: false,
        },
        stud_glb_key: {
            type: 'character varying',
        }
    });
    return webConfigSetting;
}