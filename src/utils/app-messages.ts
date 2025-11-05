import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
} from "../config/env.var";
import {
  DELIVERY_STATUS_LIST,
  ORDER_STATUS_LIST,
  PRODUCT_IMAGE_TYPE_LIST,
  PRODUCT_VIDEO_TYPE_LIST,
} from "./app-constants";
import { COUPON_DISCOUNT_TYPE } from "./app-enumeration";

export const RAP_NET_ERROR_CODE = 1;
export const DEFAULT_STATUS_CODE_SUCCESS = 200;
export const DEFAULT_STATUS_SUCCESS = "success";
export const REGISTRATION_SUCCESSFULLY =
  "You're awesome! You have successfully signed up with us!";

export const DEFAULT_STATUS_CODE_ERROR = 500;
export const DEFAULT_STATUS_ERROR = "error";
export const UNKNOWN_ERROR_TRY_AGAIN =
  "An unknown error occurred! Please try again.";

export const BAD_REQUEST_CODE = 400;
export const BAD_REQUEST_MESSAGE = "Bad request!";

export const UNAUTHORIZED_ACCESS_CODE = 401;
export const UNAUTHORIZED_ACCESS_MESSAGE = "Unauthorized Access!";
export const RESOURCE_EXPIRED_STATUS_CODE = 410;
export const DUPLICATE_ERROR_CODE = 409;
export const OTP_EXPIRATION_MESSAGE =
  "OTP has expired. Please request a new one.";
export const NOT_FOUND_CODE = 404;
export const NOT_FOUND_MESSAGE = "Not found!";
export const PRODUCT_BASIC_PRICE_NOT_FOUND =
  "Product Basic Price Not Found Please Enter valid Data!";

export const UNPROCESSABLE_ENTITY_CODE = 422;
export const UNPROCESSABLE_ENTITY_MESSAGE = "Unprocessable Entity!";

export const FORBIDDEN_CODE = 403;
export const FORBIDDEN_MESSAGE = "Forbidden!";

export const USER_NOT_FOUND = "User not found!";
export const ADDRESS_NOT_EXITS = "Address doesn't exist!";
export const CURRENCY_DEFAULT_EXITS = "Currency default exists!";
export const USER_EMAIL_ID_ALREADY_VERIFIED = "User email is already verified!";
export const INVALID_USERNAME_PASSWORD = "Invalid username or password!";
export const INVALID_OTP = "Invalid OTP!";
export const OTP_EXPIRY_LOGIN_AGAIN = "OTP expired, Please login again.";
export const USER_NOT_FOUND_WITH_REFRESH_TOKEN =
  "User not found with refresh token!";
export const AUTHORIZATION_TOKEN_IS_REQUIRED =
  "A authorization token is required!";
export const SETTING_TYPE_IS_REQUIRED = "setting type is required!";

export const NAME_IS_REQUIRED = "Name is required!";
export const NAME_IS_NON_EMPTY_STRING = "Name must be a non empty string!";
export const NAME_LENGTH_MIN_MAX = "Name must be 3 to 30 characters!";

export const FIRST_NAME_IS_REQUIRED = "First Name is required!";
export const FIRST_NAME_IS_NON_EMPTY_STRING =
  "First Name must be a non empty string!";
export const FIRST_NAME_LENGTH_MIN_MAX =
  "First Name must be 3 to 30 characters!";

export const LAST_NAME_IS_REQUIRED = "Last Name is required!";
export const LAST_NAME_IS_NON_EMPTY_STRING =
  "Last Name must be a non empty string!";
export const LAST_NAME_LENGTH_MIN_MAX = "Last Name must be 3 to 30 characters!";

export const SLUG_IS_REQUIRED = "Slug is required!";
export const SLUG_IS_NON_EMPTY_STRING = "Slug must be a non empty string!";
export const SLUG_LENGTH_MIN_MAX = "Slug must be 3 to 30 characters!";

export const CODE_IS_REQUIRED = "Code is required!";
export const CODE_IS_NON_EMPTY_STRING = "Code must be a non empty string!";
export const CODE_LENGTH_MIN_MAX = "Code must be 3 to 30 characters!";

export const Id_IS_REQUIRED = "Id is required!";

export const RATE_IS_REQUIRED = "Rate is required!";
export const RATE_IS_NON_EMPTY_STRING = "Rate must be a non-empty string!";

export const VALUE_IS_REQUIRED = "value is required!";
export const VALUE_IS_NON_EMPTY = "value must be non-empty!";
export const ROLE_NAME_IS_REQUIRED = "Role name is required!";
export const ROLE_NAME_IS_NON_EMPTY_STRING =
  "Role name must be a non empty string!";
export const ROLE_NAME_LENGTH_MIN_MAX = "Role name must be 2 to 50 characters!";

export const TARGET_URL_REQUIRED = "target url is required!";
export const TARGET_URL_NON_EMPTY_STRING =
  "Target url must be a non empty string!";

export const IS_ACTIVE_REQUIRED = "Is active field required!";
export const IS_ACTIVE_EXPECTED_TYPE_STRING =
  "Is active must be a '0' and '1' string!";

export const ONLY_AI_EXPECTED_TYPE_STRING =
  "Only active and inactive strings must be a '0' and '1' string!";

export const DATE_TYPE_VALIDATION_MESSAGE = "Invalid value for date type!";

export const IMAGE_FILE_NOT_FOUND = "Image file not found!";

export const BANNER_NOT_FOUND = "Banner not found!";

export const ROLE_NOT_FOUND = "Role not found!";

export const USER_WITH_ROLE_AVAILABLE =
  "The role can not be deleted! because some users are available in the system with a given role.";

export const ROLE_WITH_SAME_NAME_AVAILABLE =
  "The role can not be <<action>>! because the role already exists with the same name.";

export const URL_TYPE_VALIDATION_MESSAGE =
  "target url field should be a type of url";

export const ERROR_ALREADY_EXIST = "Data already exists";
export const SAME_SLUG_ALREADY_EXIST = "Same slug already exists";
export const ERROR_PRODUCT_ALREADY_EXIST_IN_WISH_LIST =
  "product already exists in wish list";

export const RECORD_ADD_SUCCESSFULLY = "Record created successfully";
export const RECORD_UPDATE_SUCCESSFULLY = "Record updated successfully";
export const RECORD_DELETE_SUCCESSFULLY = "Record deleted successfully";
export const ROLE_PERMISSION_ACCESS_REQUIRED =
  "The role permission access field is required!";
export const ROLE_PERMISSION_ACCESS_TYPE_ARRAY =
  "Role permission access should be an array!";

export const ID_MENU_ITEM_REQUIRED = "The ID menu item field is required!";
export const ID_MENU_ITEM_TYPE_INTEGER = "Id menu item should be an integer!";

export const ACCESS_REQUIRED = "Access field is required!";
export const ACCESS_TYPE_ARRAY = "Access field should be an array!";
export const ACCESS_ARRAY_VALUE_TYPE_INTEGER =
  "Access array value should be an integer!";

export const ID_MENU_ITEM_UNIQUE =
  "ID menu item value should be unique in array!";
export const ACCESS_ARRAY_VALUE_UNIQUE = "ID menu item should be unique!";

export const MENU_ITEM_NOT_FOUND = "Menu item not found!.";

export const ACCESS_NOT_FOUND = "Access not found!";
export const HTTP_METHOD_NOT_FOUND = "Http method not found!";
export const ROLE_API_PERMISSION_NOT_FOUND = "Role API permission not found!";

export const BUSINESS_USER_NAME_LENGTH_MIN_MAX =
  "Name must be 2 to 100 characters!";

export const SIZE_IS_REQUIRED = "Size is required!";
export const LENGTH_IS_REQUIRED = "Length is required!";

export const PASSWORD_IS_REQUIRED = "Password is required!";
export const PASSWORD_TYPE_NON_EMPTY_STRING =
  "Password must be a non empty string!";
export const INVALID_PASSWORD =
  "Password should be a combination of one uppercase , one lowercase, one special character, one digit, and a minimum of 8 !";
export const CONFIRM_PASSWORD_IS_REQUIRED = "Confirm password is required!";
export const PASSWORD_MUST_BE_SAME = "Passwords must be the same!";
export const PASSWORD_IS_WRONG = "Password is wrong!";

export const EMAIL_IS_REQUIRED = "Email is required!";
export const INVALID_EMAIL = "Email is invalid!";
export const EMAIL_LENGTH_MIN_MAX = "Email must be a 3 to 200 characters!";
export const EMAIL_IS_ALREADY_IN_SUBSCRIPTION_LIST =
  "Email is already on our subscription list.";
export const SUCCESS_SUBSCRIPTION_LIST =
  "You have successfully subscribed for our newsletter.";
export const SUBSCRIPTION_NOT_FOUND =
  "Email doesn't exist in our subscription list.";

export const TRANSACTION_FAIL_MESSAGE = "Transaction Fail!...";
export const COPYRIGHT_IS_REQUIRED = "Copyright is required!";
export const COPYRIGHT_IS_NON_EMPTY_STRING =
  "Copyright must be a non empty string!";

export const MESSAGE_IS_REQUIRED = "Message is required!";
export const MESSAGE_IS_NON_EMPTY_STRING =
  "Message must be a non empty string!";

export const PHONE_NUMBER_IS_REQUIRED = "Phone number is required!";
export const PHONE_NUMBER_IS_NON_EMPTY_STRING =
  "Phone number must be a non empty string!";
export const PHONE_NUMBER_LENGTH_MIN_MAX =
  "Phone number must be a 4 to 20 characters!";

export const ID_ROLE_IS_REQUIRED = "Role id is required!";
export const ID_ROLE_INVALID_TYPE = "Role id must be an integer";

export const INVALID_ID = "Id is invalid!";
export const EMAIL_ALREADY_EXIST =
  "User is already exists with the same email!";

export const USERNAME_IS_REQUIRED = "Username is required!";
export const INVALID_USERNAME = "Username is invalid!";
export const ACCOUNT_NOT_ACTIVE = "Account is inactive!";
export const ACCOUNT_NOT_VERIFIED = "Account is not verified!";
export const NOT_VERIFIED = "Not verified";
export const ACCOUNT_IS_BLOCKED = "Account is blocked!";
export const ACCOUNT_NOT_APPROVED = "Account is not approved!";

export const HOUSE_AND_BUILDING_NAME_IS_REQUIRES =
  "house and building name is required!";
export const HOUSE_AND_BUILDING_NAME_IS_NON_EMPTY_STRING =
  "house and building name must be a non empty string!";

export const AREA_NAME_IS_REQUIRES = "Area  name is required!";
export const AREA_NAME_IS_NON_EMPTY_STRING =
  "Area name must be a non empty string!";

export const PIN_CODE_IS_REQUIRES = "Pin code is required!";
export const PIN_CODE_IS_NON_EMPTY_STRING =
  "Pin code must be a non empty string!";
export const PIN_CODE_LENGTH_MIN_MAX = "Pin code must be a 5 characters!";

export const REQUIRED_ERROR_MESSAGE = "<<field_name>> is required!";
export const DATA_NOT_FOUND = "<<field_name>> not found!";
export const TYPE_NON_EMPTY_STRING_ERROR_MESSAGE =
  "<<field_name>> must be a non empty string!";
export const MIN_MAX_LENGTH_ERROR_MESSAGE =
  "<<field_name>> must be a <<min>> to <<max>> characters!";
export const TYPE_INTEGER_ERROR_MESSAGE = "<<field_name>> must be an integer!";
export const TYPE_DECIMAL_ERROR_MESSAGE =
  "<<field_name>> must be a decimal number!";
export const TYPE_FLOAT_ERROR_MESSAGE =
  "<<field_name>> must be a float number!";
export const TYPE_MIN_MAX_FLOAT_ERROR_MESSAGE =
  "<<field_name>> must be a float number between <<min>> and <<max>>!";
export const TYPE_ARRAY_ERROR_MESSAGE = "<<field_name>> must be an array!";
export const TYPE_ARRAY_NON_EMPTY_ERROR_MESSAGE =
  "<<field_name>> must be an empty array!";
export const TYPE_BIT_ERROR_MESSAGE =
  "<<field_name>> must be a '0' and '1' string!";
export const ITEM_IS_ALREADY_IN_MODE = "<<item>> is already <<mode>>!";
export const DUPLICATE_VALUE_ERROR_MESSAGE = "Duplicate <<field_name>> found!";
export const ONLY_ONE_VALUE_ERROR_MESSAGE =
  "There must be only one <<field_name>> with the value <<value>>!";

export const INVALID_TOKEN = "Token is invalid!";
export const ID_APP_USER_TYPE_INTEGER = "App user id must be an integer!";

export const PRODUCT_NOT_FOUND = "Product not found!";
export const PRODUCT_VARIANT_NOT_FOUND = "Product variant not found!";
export const SINGLE_PRODUCT_NOT_FOUND = "Single Product not found!";
export const RING_CONFIG_PRODUCT_NOT_FOUND = "Ring config Product not found!";
export const GIFT_SET_PRODUCT_NOT_FOUND = "Gift set Product not found!";
export const BIRTHSTONE_PRODUCT_NOT_FOUND = "Birthstone Product not found!";
export const BRACELET_PRODUCT_NOT_FOUND = "Bracelet Product not found!";
export const ETERNITY_BAND_PRODUCT_NOT_FOUND =
  "Eternity band Product not found!";

export const PRODUCT_ATTRIBUTE_NOT_FOUND = "Product attribute not found!";
export const CATEGORY_NOT_FOUND = "Category not found!";
export const PRODUCT_EXIST_WITH_SAME_NAME =
  "Product exists with the same name!";
export const PRODUCT_EXIST_WITH_SAME_SKU = "Product exists with the same sku!";
export const GOLD_WEIGHT_REQUIRES = "Metal Weight is Required!";
export const TAG_IS_REQUIRES = "Tag is Required!";
export const SORT_DES_IS_REQUIRES = "Sort description is Required!";
export const LONG_DES_IS_REQUIRES = "Long description is Required!";
export const CATEGORY_IS_REQUIRES = "Category is Required!";
export const METAL_TONE_IS_REQUIRES = "Metal Tone is Required!";
export const STONE_TYPE_IS_REQUIRES = "stone type is Required!";
export const PRODUCT_IMAGE_TONE_IS_REQUIRES = "Product Image Tone is Required!";
export const STONE_TYPE_NOT_FOUND = "Stone Type Not Found!";
export const THUMB_IMAGE_ONLY_ONE = "Thumb Image Upload Only One!";
export const VIDEO_ONLY_ONE = "Video Upload Only One!";

export const GEMSTONE_LIST_INVALID = "gemstone list invalid";
export const ORDER_NOT_FOUND = "Order Not Found!";
export const ORDER_NUMBER_IS_INVALID = "Order Number is invalid!";
export const ORDER_AMOUNT_WRONG = "Order Amount is wrong!";
export const INVOICE_NOT_FOUND = "Invoice Not Found!";
export const TOTAL_AMOUNT_WRONG = " Total amount is Wrong!";

export const MODEL_NOT_FOUND = "Attribute model not found!";
export const ATTRIBUTE_TYPE_NOT_AVAILABLE =
  "Some of the attribute types are not available!";
export const DUPLICATE_ATTRIBUTE_VALUE_FOUND =
  "Duplicate attribute value found!";
export const TAG_WITH_SAME_NAME = "Tag is available with the same name!";
export const TAG_NOT_FOUND = "Tag not found!";
export const SETTING_STYLE_TYPE_NOT_FOUND = "Setting style type not found!";
export const SIZE_NOT_FOUND = "Size not found!";
export const LENGTH_NOT_FOUND = "Length not found!";
export const METAL_GROUP_NOT_FOUND = "Metal group not found!";
export const METAL_NOT_FOUND = "Metal not found!";
export const DIAMOND_GROUP_NOT_FOUND = "Diamond group not found!";
export const STONE_TYPE_CENTER_SHOULD_BE_ONE =
  "Stone type center should be one!";
export const CENTER_DIAMOND_COUNT_SHOULD_BE_ONE =
  "Center diamond count should be one!";

export const METAL_IS_REQUIRES = "Metal is required!";
export const ENGRAVING_DATA_NOT_MATCH_ENGRAVING_COUNT =
  "Engraving data not match with engraving count";
export const GEMSTONE_DATA_NOT_MATCH_GEMSTONE_COUNT =
  "Gemstone data not match with gemstone count";

export const PRODUCT_METAL_OPTION_NOT_FOUND = "Product metal option not found!";
export const PRODUCT_DIAMOND_OPTION_NOT_FOUND =
  "Product diamond option not found!";
export const ENGRAVING_OPTION_NOT_FOUND = "product engraving option not found!";
export const INVALID_CATEGORY = "Invalid category!";
export const DUPLICATE_TAG_VALUE_FOUND = "Duplicate tags found!";
export const METAL_RATE_CONFIG_NOT_FOUND =
  "Metal rate configuration not found!";
export const METAL_FORMULA_NOT_AVAILABLE = "Metal formula is not available!";
export const METAL_KT_IS_REQUIRES = "Metal carat is required!";
export const METAL_KT_NOT_FOUND = "Metal carat is not found!";
export const ATTRIBUTE_NOT_FOUND = "Attribute is not found!";
export const SUB_CATEGORY_REQUIRED_FOR_SUB_SUB_CATEGORY =
  "Subcategory required for sub sub category";
export const SUB_CATEGORY_NOT_FOUND = "Sub category not found!";
export const SUB_SUB_CATEGORY_NOT_FOUND = "Sub sub category not found!";
export const METAL_DATA_IS_REQUIRED = "Metal data is required!";

export const PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE = `File must be a ${PRODUCT_BULK_UPLOAD_FILE_MIMETYPE}`;
export const PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE = `File size must be less than ${PRODUCT_BULK_UPLOAD_FILE_SIZE}MB`;
export const PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE = `Batch size must be less than or equal to ${PRODUCT_BULK_UPLOAD_BATCH_SIZE}`;
export const FILE_NOT_FOUND = "File not found!";
export const DIAMOND_TYPE_EXPECTED_TYPE = "ID type must be a 1 or 2!";
export const DIAMOND_TYPE_ALREADY_EXITS = "Diamond type already exists!";

export const INVALID_HEADER = "Invalid header!";
export const PRODUCT_IMAGE_EXPECTED_TYPE = `Image type must be from ${PRODUCT_IMAGE_TYPE_LIST}`;
export const PRODUCT_VIDEO_EXPECTED_TYPE = `Video type must be from ${PRODUCT_VIDEO_TYPE_LIST}`;
export const ORDER_STATUS_EXPECTED_TYPE = `Order status type s must be from ${ORDER_STATUS_LIST}`;
export const DELIVERY_STATUS_EXPECTED_TYPE = `Delivery status type must be from ${DELIVERY_STATUS_LIST}`;

export const METAL_TONE_NOT_FOUND = "Metal tone not found!";
export const IMAGES_NOT_FOUND = "Images not found!";
export const ZIP_NOT_FOUND = "Zip not found!";
export const IMAGE_NOT_FOUND = "Image not found!";
export const VIDEO_NOT_FOUND = "Video not found!";
export const VIDEOS_NOT_FOUND = "Videos not found!";
export const ID_OR_METAL_TONE_REQUIRED = "ID or Metal tone is required!";

export const ERROR_NOT_FOUND = "<<field_name>> not found!";
export const DATA_ALREADY_EXIST = "<<field_name>> already exists!";
export const STATUS_UPDATED = "Status Updated";

export const INVALID_INFO_KEY = "Invalid Info Key";
export const PRODUCT_METAL_OPTIONS_CENTER_DIAMOND_PRICE_IS_REQUIRED =
  "Product metal option center diamond price is required!";
export const SETTING_DIAMOND_SHAPES_IS_REQUIRED =
  "Setting diamond shapes is required!";
export const MAXIMUM_PRODUCT_MODELS_ALLOWED =
  "Maximum <<field_name>> product models allowed";
export const PRODUCT_DIAMOND_DETAILS_IS_REQUIRES =
  "Product diamond details is required!";
export const PRODUCT_ALREADY_EXISTS_IN_CART = "Product already exists in cart!";
export const SETTING_PRODUCT_QUANTITY_ERROR =
  "The setting product can only be purchased in a quantity of one.";
export const DIAMOND_PRICE_NOT_MATCH = "Diamond price not match!";
export const PRODUCT_UNAVAILABLE = "The product is currently unavailable!";
export const INSUFFICIENT_QUANTITY =
  "Insufficient quantity available. Only <<stock_count>> items remain in stock.";

export const TYPE_COUPON_DISCOUNT_TYPE_ERROR_MESSAGE = `<<field_name>> must be a '${COUPON_DISCOUNT_TYPE.PercentageDiscount}' and '${COUPON_DISCOUNT_TYPE.FixedAmountDiscount}' string!`;
export const ERROR_PERCENTAGE_INVALID = "Percentage must be a number.";
export const ERROR_ONLY_LOGGED_IN_USERS_CAN_USE_COUPON_CODE =
  "Please log in to use this coupon code. Coupons are available for logged-in users only.";
export const ERROR_PERCENTAGE_TOO_LOW_AND_HIGH =
  "Percentage cannot be less than 0 and more than 100.";
export const ERROR_AMOUNT_INVALID = "Amount must be a valid number.";
export const ERROR_AMOUNT_NEGATIVE = "Amount cannot be negative.";
export const COUPON_CURRENCY_REQUIRED_MESSAGE = "Coupon currency required.";
export const TYPE_SHOULD_ERROR_MESSAGE =
  "<<field_name>> should be either <<value1>> or <<value2>>";
export const ERROR_VALID_DATE = "<<field>> date must be a valid date.";
export const ERROR_FUTURE_DATE = "<<field>> date must be a future date.";
export const ERROR_ORDER_DATE = "<<field1>> must be after <<field2>>.";
export const INVALID_COUPON_MESSAGE = "Invalid coupon code.";
export const COUPON_EXPIRED_MESSAGE = "Coupon code is expired.";
export const COUPON_MIN_AMOUNT_DISCOUNT_AMOUNT_ERROR =
  "The minimum amount must be greater than discount amount.";
export const MIN_REQUIRED_AMOUNT_ERROR =
  "The amount you have entered <<ACTUAL_AMOUNT>> does not meet the required minimum of <<REQUIRED_AMOUNT>>. Please enter at least <<REQUIRED_AMOUNT>>.";
export const MaX_REQUIRED_AMOUNT_ERROR =
  "The entered amount, <<ACTUAL_AMOUNT>> exceeds the maximum limit of <<REQUIRED_AMOUNT>>for this coupon. Please adjust the amount to <<REQUIRED_AMOUNT>> or less.";
export const MIN_MAX_REQUIRED_AMOUNT_ERROR = "The discount amount must be between <<min_amount>> and <<max_amount>>."
export const COUPON_CURRENCY_MISMATCH_MESSAGE =
  "Coupon currency does not match the provided currency.";
export const INVALID_COUPON_TYPE_MESSAGE = "Invalid coupon type.";
export const COUPON_EXPIRED =
  "It has already been used by the maximum number of users allowed.";
export const USER_APPLY_ONLY_ONE_TIME_ERROR =
  "Coupon already used: You have already applied this coupon. This coupon can only be used <<field>>.";
export const USER_LIMIT_APPLY_ONLY_ONE_TIME_ERROR =
  "This coupon has already been used. It can only be applied <<field>> time per customer.";
export const ERROR_MAX_GREATER_THAN_MIN =
  "The maximum value <<maxValue>> must be greater than the minimum value <<minValue>>.";
export const COUPON_CODE_EXISTS =
  "The coupon code already exists. Please use another.";
export const DATE_FORMAT_ERROR = "Date must be in format YYYY-MM-DD.";
export const MIN_AMOUNT_LESS_THAN_MAX_AMOUNT =
  "Min amount must be less than Max amount.";
export const AMOUNT_RANGE_CONFLICT_ERROR =
  "Amount range conflicts with an existing record.";
export const ERROR_INVALID_MASSAGE = "Invalid <<field_name>>.";
export const SIGN_IN_TYPE_WRONG_ERROR_MESSAGE =
  "This account is linked with <<field_name>> Sign-In. Please log in using <<field_name>>.";
export const RESET_PASSWORD_TYPE_WRONG_ERROR_MESSAGE =
  "This account is linked with <<field_name>>. does not allow reset password.";

export const USER_ROLE_INACTIVE_ERROR_MESSAGE = "Your account is currently inactive due to your assigned role being inactive. Please contact your administrator for assistance.";
export const USER_DISABLED_ERROR_MESSAGE = "Your account has been disabled. Please contact support.";
export const YOU_CAN_NOT_CHANGE_CATEGORY_ERROR_MESSAGE = "You cannot change the category. You can only edit products.";
export const NOT_ABLE_TO_ADD_SAME_CATEGORY_ERROR_MESSAGE = "You can't add same category more then one.";
export const DUPLICATE_ATTRIBUTE_VALUE_NOT_ALLOWED = "Duplicate keys are not allowed in the attribute array."
export const ATTRIBUTE_NOT_CHANGEABLE = "<<field_name>> Attribute is not changeable."


export const TEMPLATE_NOT_FOUND = 'Template not found or has been deleted.';
export const TEMPLATE_CREATED_SUCCESS = 'Template created successfully.';
export const TEMPLATE_UPDATED_SUCCESS = 'Template updated successfully.';
export const ONLY_ABLE_TO_TEMPLATE_EDIT_ERROR_MESSAGE = 'You are only able to edit the existing template for this message type.';
export const MESSAGE_TYPE_MUST_BE_ARRAY = "message_type must be an array.";
export const MESSAGE_VALUE_FROM_THIS_ONLY =`Invalid message_type(s):<<invalidTypes>>. Allowed values are: <<MESSAGE_TYPE>>`;
export const INVALID_MESSAGE_TYPE = "Invalid message_type data in the database.";
export const NOTABLE_TO_REMOVE_UNTILL_NOT_ASSIGN_OTHER_ONE = `To proceed, please assign this mail type to a different template first`;
export const NOTABLE_TO_INACTIVE_UNTILL_NOT_ASSIGN_OTHER_ONE = `Cannot inactive message_type <<type>> as it, please assigned to other templates first.`;
export const MENU_NOT_ASSOCIATED_TO_PERMISSIONS = 'Menu item and associated permissions updated successfully'
export const TYPE_BOOLEAN_ERROR_MESSAGE = "The field <<field_name>> must be a boolean (true or false).";
export const FIXED_LENGTH_INTEGER_ERROR_MESSAGE = "The field <<field_name>> must be an integer with exactly <<length>> digits."
export const COMPONY_KEY_NOT_EXIST = "Company key not found!!";

export const MEGA_MENU_ATTRIBUTE_ADDED_ONLY_THREE_LEVEL = 'Category cannot be added. Only 3 levels of categories are allowed.'
export const EMAIL_ALREADY_EXIST_IN_ADMIN = "This email is already registered as an admin."
export const EMAIL_TEMPLATE_NOT_FOUND = `Email template <<templateName>> not found`
export const MISSING_ID_CONFIGURATOR = `We can't provide any configurator by default. You need to add it from the Company Info section first. Once added, it will be available here.`;
export const PRODUCT_ID_MUST_BE_ARRAY = `Product IDs should be provided as an array.`
export const PRODUCT_ID_DUPLICATE_NOT_ALLOW=`Duplicate product IDs are not allowed.`
export const PRODUCT_ID_NOT_FOUND =`Product with ID <<productId>> not found.`
export const NOTHING_CHANGED = 'Nothing changed'
export const ONLY_STATUS_UPDATE = "Only order #<<id>> with status <<status_1>>, <<status_2>>, or <<status_3>> can be archived."

export const ALREDY_EXIST =  `<<field>> already exists. Please delete it first.`
export const PRODUCT_IMAGE_REQUIRES = `Product image is required!`
export const INVALID_METAL_ID = 'Metal Id is invalid!'
export const CATALOGUE_ORDER_NOT_ALLOWED = "Guest users cannot add product inquiries. Please log in to continue."

export const FIELD_IS_REQUIRED = "<<field_name>> is required."
export const MUST_BE_STRING = "<<field_name>> must be a string."
export const  CAN_NOT_BE_EMPTY = "<<field_name>> cannot be empty."
export const ONLY_SMALL_CAPITAL_UNDERSCORES_OR_HYPHENS_ALLOWED = "<<field_name>> must contain only letters, underscores (_), or hyphens (-). Numbers and other special characters are not allowed."

export const DIAMOND_GROUP_MASTER_RATE_SYNTHETIC_RATE_VALIDATION = "At least one of rate or synthetic_rate is required";
export const DIAMOND_GROUP_MASTER_RANGE_VALIDATION = "The provided carat range conflicts with an existing range. Please enter a separate, non-duplicate range.";
// Error message templates
export const INVALID_FIRST_FIELD_VALUE = 'Invalid first_field value. Please provide one of the following: <<valid_values>>.';
export const INVALID_FIRST_FIELD_COMBINATION = 'Invalid first_field value. Only <<valid_value>> is allowed when second_field is not DynamicSingleProduct or VariantSingleProduct.';

// // Error message templates
export const INVALID_DATE_ERROR_MESSAGE = 'The field {{field_name}} must be a valid date in YYYY/MM/DD format.';
export const INVALID_TIME_ERROR_MESSAGE = 'The field {{field_name}} must be a valid time in HH:mm:ss format.';
export const START_DATE_TIME_FUTURE_ERROR = 'The start date-time must be in the future.';
export const END_DATE_TIME_AFTER_START_ERROR  = 'End date-time must be after start date-time.';
export const MIN_LENGTH_ERROR_MESSAGE = "<<field_name>> must be a <<min>>!";
export const BLANK_FILE_ERROR_MESSAGE = "The uploaded file is blank or contains no data rows.";
export const INVALID_HEADER_ERROR_MESSAGE = "Invalid number of headers in the CSV file. Expected <<field_name>> headers.";

export const SECTION_TYPE_NOT_FOUND_MESSAGE = "Section Type Not found!";
export const NO_DATA_IN_EXCEL_FILE_ERROR_MESSAGE = "No data found in the uploaded Excel file.";
