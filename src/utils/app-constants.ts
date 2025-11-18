import {
  ATTRIBUTE_TYPE,
  BIRTHSTONE_STONE_TYPE,
  COMPANY_KEYS,
  COUPON_DISCOUNT_TYPE,
  COUPON_DURATION,
  CURRENCY_RATE_EXCHANGE_TYPE,
  CURRENCY_SYMBOL_PLACEMENT,
  DIAMOND_TYPE,
  DISCOUNT_TYPE,
  DeliverStatus,
  FilterItemScope,
  FilterType,
  FontStyleType,
  FontType,
  HTTP_METHODS,
  IMAGE_TYPE,
  IMAGE_UPLOAD_TYPE,
  LogsActivityType,
  LogsType,
  OrderStatus,
  OrderTypes,
  PRICE_CORRECTION_PRODUCT_TYPE,
  PRODUCT_CUSTOMIZATION_STATUS,
  PRODUCT_IMAGE_TYPE,
  PRODUCT_VIDEO_TYPE,
  SHOPIFY_STORE_KEY,
  SIGN_UP_TYPE,
  STONE_TYPE,
  SYSTEM_CONFIGURATIONS_KEYS,
  SingleProductType,
  ThemeSectionType,
  USER_TYPE,
  paymentMethod,
  templateEightSectionTypeEnum,
} from "./app-enumeration";
import { Op } from "sequelize";

// Region REQUEST RESPONSE CODER
export const SIGNATURE_ALGORITHM = "sha1WithRSAEncryption";

export const CIPHER_ALGORITHM = "aes-128-cbc";

// export const PUBLIC_KEY = fs.readFileSync(
//   path.join(__dirname, "../../../private/req-res-encoder/keys/test.public.pub"),
//   {
//     encoding: "utf8",
//   }
// );
// export const PRIVATE_KEY = fs.readFileSync(
//   path.join(
//     __dirname,
//     "../../../private/req-res-encoder/keys/test.private.pkcs8"
//   ),
//   {
//     encoding: "utf8",
//   }
// );
// End Region

// Region JWT
export const JWT_SECRET_KEY = "JWT_SECRET_KEY";

// Expiration time is in seconds 86400 = 24 hours , 3600 = 60 minute
export const USER_JWT_EXPIRATION_TIME = {
  [USER_TYPE.Administrator]: { tokenTime: 86400, refreshTokenTime: 86400 * 2 },  
  [USER_TYPE.BusinessUser]: { tokenTime: 86400, refreshTokenTime: 86400 * 2 },
  [USER_TYPE.Customer]: { tokenTime: 86400, refreshTokenTime: 86400 * 2 },
  5: { tokenTime: 86400 * 30, refreshTokenTime: 86400 * 60 },
  [USER_TYPE.SuperAdmin]: { tokenTime: 3600 * 2, refreshTokenTime: 3600 * 3 }
};
// OTP Expiration time is in milliseconds

export const OTP_EXPIRATION_TIME = 60 * 1000;
export const RESET_JWT_TOKEN_EXPRATION_TIME = 300;

// delivery time in days

export const OUT_OF_STOCK_PRODUCT_DELIVERY_TIME = 25;
export const IN_STOCK_PRODUCT_DELIVERY_TIME = 7;

export const JWT_EXPIRED_ERROR_NAME = "TokenExpiredError";
export const JWT_EXPIRED_ERROR_MESSAGES = {
  invalidToken: "invalid token",
  jwtMalformed: "jwt malformed",
  jwtSignatureIsRequired: "jwt signature is required",
  jwtAudienceInvalid: "jwt audience invalid",
  jwtIssuerInvalid: "jwt issuer invalid",
  jwtIdInvalid: "jwt id invalid",
  jwtSubjectInvalid: "jwt subject invalid",
};
// End Region

export const PASSWORD_SOLT = 10;

// app key

export const APP_KEY = "efa9d27c05ee331f120164dbc4cb7143";

// client app menu

export const APP_MENU = "a89cb4b8b6fc089520cfbdc6c8f0806ecf6364d638a2010388332240fb4e066e";

// Mail send API end point

export const MAIL_SEND_API_END_POINT = "https://api.vihaainfotech.com/api/email/send";

// Mail send API pass key

export const MAIL_SEND_API_PASS_KEY = "b7f3c9a2e4d8f6b1c3a5e7d9f2b4c6a8e1d3f5b7c9a2e4d8f6b1c3a5e7d9f2b4";


// template menu

export const TEMPLATE_MENU = {
  "TEMPLATEONE": "template 1",
  "TEMPLATETWO": "template 2",
  "TEMPLATETHREE": "template 3",
  "TEMPLATEFOUR": "template 4",
  "TEMPLATEFIVE": "template 5",
  "TEMPLATESIX": "template 6",
  "TEMPLATESEVEN": "template 7",
}

// product models maximum count

export const MAXIMUM_PRODUCT_MODELS_COUNT = 10;
export const PASSWORD_REGEX =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-={}:"<>?/.,';\[\]])[a-zA-Z0-9!@#$%^&*()_+\-={}:"<>?/.,';\[\]]+$/g;

export const USER_TYPE_LIST = Object.keys(USER_TYPE)
  .filter((key) => isNaN(Number(key)))
  .map((key) => USER_TYPE[key as keyof typeof USER_TYPE]);

export const THEME_SECTION_TYPE_LIST = Object.keys(ThemeSectionType)
  .filter((key) => isNaN(Number(key)))
  .map((key) => ThemeSectionType[key as keyof typeof ThemeSectionType]);

export const SING_UP_TYPE_LIST = Object.keys(SIGN_UP_TYPE)
  .filter((key) => isNaN(Number(key)))
  .map((key) => SIGN_UP_TYPE[key as keyof typeof SIGN_UP_TYPE]);

export const FONT_STYLE_TYPE_LIST = Object.keys(FontStyleType)
  .filter((key) => isNaN(Number(key)))
  .map((key) => FontStyleType[key as keyof typeof FontStyleType]);

export const FONT_TYPE_LIST = Object.keys(FontType)
  .filter((key) => isNaN(Number(key)))
  .map((key) => FontType[key as keyof typeof FontType]);

export const CURRENCY_SYMBOL_PLACEMENT_LIST = Object.keys(
  CURRENCY_SYMBOL_PLACEMENT
)
  .filter((key) => isNaN(Number(key)))
  .map(
    (key) =>
      CURRENCY_SYMBOL_PLACEMENT[key as keyof typeof CURRENCY_SYMBOL_PLACEMENT]
  );

export const CURRENCY_RATE_EXCHANGE_TYPE_LIST = Object.keys(
  CURRENCY_RATE_EXCHANGE_TYPE
)
  .filter((key) => isNaN(Number(key)))
  .map(
    (key) =>
      CURRENCY_RATE_EXCHANGE_TYPE[
      key as keyof typeof CURRENCY_RATE_EXCHANGE_TYPE
      ]
);
  
export const FILTER_TYPE_LIST = Object.keys(
  FilterType
)
  .filter((key) => isNaN(Number(key)))
  .map(
    (key) =>
      FilterType[
      key as keyof typeof FilterType
      ]
  );

  export const FILTER_ITEM_SCOPE_LIST = Object.keys(
    FilterItemScope
  )
    .filter((key) => isNaN(Number(key)))
    .map(
      (key) =>
        FilterItemScope[
        key as keyof typeof FilterItemScope
        ]
    );

export const PRICE_CORRECTION_PRODUCT_TYPE_LIST = Object.keys(PRICE_CORRECTION_PRODUCT_TYPE)
  .filter((key) => isNaN(Number(key)))
  .map((key) => PRICE_CORRECTION_PRODUCT_TYPE[key as keyof typeof PRICE_CORRECTION_PRODUCT_TYPE]);
export const IMAGE_TYPE_LOCATION = {
  [IMAGE_TYPE.banner]: "images/banners",
  [IMAGE_TYPE.product_promotion]: "images/product_promotions",
  [IMAGE_TYPE.testimonial]: "images/testimonials",
  [IMAGE_TYPE.category]: "images/category",
  [IMAGE_TYPE.customer]: "images/customers",
  [IMAGE_TYPE.diamondShape]: "images/diamondShapes",
  [IMAGE_TYPE.gemstones]: "images/gemstones",
  [IMAGE_TYPE.heads]: "images/heads",
  [IMAGE_TYPE.shanks]: "images/shanks",
  [IMAGE_TYPE.settingType]: "images/settingType",
  [IMAGE_TYPE.goldKT]: "images/goldKT",
  [IMAGE_TYPE.metalTone]: "images/metalTone",
  [IMAGE_TYPE.homeAbout]: "images/homeAbout",
  [IMAGE_TYPE.profile]: "images/profiles",
  [IMAGE_TYPE.headerLogo]: "images/header",
  [IMAGE_TYPE.footerLogo]: "images/footer",
  [IMAGE_TYPE.FaviconImage]: "images/favicon",
  [IMAGE_TYPE.DiamondGroup]: "images/diamond-group",
  [IMAGE_TYPE.blog]: "images/blog",
  [IMAGE_TYPE.sideSetting]: "images/sideSettingStyle",
  [IMAGE_TYPE.caratSize]: "images/carat/size",
  [IMAGE_TYPE.ConfigProduct]: "images/config-product",
  [IMAGE_TYPE.OurStory]: "images/our-story",
  [IMAGE_TYPE.BirthstoneProduct]: "images/birth-stone-product",
  [IMAGE_TYPE.jewelry_section]: "images/jewelry-section",
  [IMAGE_TYPE.diamond_section]: "images/diamond-section",
  [IMAGE_TYPE.ProductModel]: "images/product-model",
  [IMAGE_TYPE.templateThree]: "images/template-three",
  [IMAGE_TYPE.MegaMenu]: "images/mega-menu",
  [IMAGE_TYPE.hookType]: "images/hook-type",
  [IMAGE_TYPE.templateSix]: "images/template-six",
  [IMAGE_TYPE.aboutUs]: "images/about-us",
  [IMAGE_TYPE.templateSeven]: "images/template-seven",
  [IMAGE_TYPE.ThemeProvider]: "images/theme-provider",
  [IMAGE_TYPE.loaderImage]: "images/loader",
  [IMAGE_TYPE.defaultImage]: "images/default",
  [IMAGE_TYPE.mailTemplateLogo]: "images/mail-template-logo",
  [IMAGE_TYPE.pageNotFoundImage]: "images/page-not-found",
  [IMAGE_TYPE.shareImage]: "images/share-image",
  [IMAGE_TYPE.Configurator]: "images/configurator",
  [IMAGE_TYPE.productNotFound]: "images/product-not-found",
  [IMAGE_TYPE.orderNotFound]: "images/order-not-found",
  [IMAGE_TYPE.templateFour]: "images/template-four",
  [IMAGE_TYPE.templateEight]: "images/template-eight",
};

export const PRODUCT_FILE_LOCATION = "products";
export const PRODUCT_ZIP_LOCATION = "productzips";
export const SUPER_ADMIN_AUTH_API_VERSIONS = '/api/v4';
export const INVOICE_FILE_LOCATION = "/invoices";

export const BIT_FIELD_VALUES = ["0", "1"];

export const DIAMOND_TYPE_FIELD_VALUES = [1, 2];

export const GET_DIAMOND_PLACE_LABEL_FROM_ID = {
  [STONE_TYPE.Center]: "centre",

  [STONE_TYPE.Side]: "side",
};
export const GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID = {
  true: PRODUCT_CUSTOMIZATION_STATUS.yes,

  false: PRODUCT_CUSTOMIZATION_STATUS.no,
};
export const GET_BIRTHSTONE_DIAMOND_PLACE_LABEL_FROM_ID = {
  [BIRTHSTONE_STONE_TYPE.fixed]: "fixed",
  [BIRTHSTONE_STONE_TYPE.changeable]: "changeable",
};

export const DISCOUNT_TYPE_VALUE = {
  [DISCOUNT_TYPE.PAR]: "par",
  [DISCOUNT_TYPE.OTHER]: "other",
};

export const PAYMENT_METHOD_ID_FROM_LABEL = {
  [paymentMethod.cashOnDelivery]: "Cash on delivery",
  [paymentMethod.affirm]: "Affirm",
  [paymentMethod.paypal]: "PayPal",
  [paymentMethod.YOCO]: "yoco",
  [paymentMethod.stripe]: "Card",
  [paymentMethod.razorpay]: "Razorpay",
};

export const GET_DIAMOND_PLACE_ID_FROM_LABEL = {
  [GET_DIAMOND_PLACE_LABEL_FROM_ID[STONE_TYPE.Center]]: 1,
  [GET_DIAMOND_PLACE_LABEL_FROM_ID[STONE_TYPE.Side]]: 2,
};

export const GET_BIRTHSTONE_DIAMOND_PLACE_ID_FROM_LABEL = {
  [GET_BIRTHSTONE_DIAMOND_PLACE_LABEL_FROM_ID[BIRTHSTONE_STONE_TYPE.fixed]]: 1,
  [GET_BIRTHSTONE_DIAMOND_PLACE_LABEL_FROM_ID[
    BIRTHSTONE_STONE_TYPE.changeable
  ]]: 2,
};

export const DISCOUNT_TYPE_PLACE_ID = {
  [DISCOUNT_TYPE_VALUE[DISCOUNT_TYPE.PAR]]: 1,
  [DISCOUNT_TYPE_VALUE[DISCOUNT_TYPE.OTHER]]: 2,
};

export const GET_HTTP_METHODS_LABEL = {
  [HTTP_METHODS.Get]: "GET",
  [HTTP_METHODS.Post]: "POST",
  [HTTP_METHODS.Put]: "PUT",
  [HTTP_METHODS.Delete]: "DELETE",
  [HTTP_METHODS.Patch]: "PATCH",
};

export const PER_PAGE_ROWS = 10;
export const PRODUCT_PER_PAGE_ROW = 20;

// export const getAttributeModelByType = (attributeType: number) => {
//   switch (attributeType) {
//     case ATTRIBUTE_TYPE.CaratSize:
//       return CaratSize;
//     case ATTRIBUTE_TYPE.Clarity:
//       return ClarityData;
//     case ATTRIBUTE_TYPE.Color:
//       return Colors;
//     case ATTRIBUTE_TYPE.Cut:
//       return CutsData;
//     case ATTRIBUTE_TYPE.DiamondShape:
//       return DiamondShape;
//     case ATTRIBUTE_TYPE.Gemstone:
//       return Gemstones;
//     case ATTRIBUTE_TYPE.GoldKT:
//       return GoldKarat;
//     case ATTRIBUTE_TYPE.Head:
//       return HeadsData;
//     case ATTRIBUTE_TYPE.MetalStone:
//       return MetalTone;
//     case ATTRIBUTE_TYPE.SettingCaratWeight:
//       return SettingCaratWeight;
//     case ATTRIBUTE_TYPE.SettingStyle:
//       return SettingType;
//     case ATTRIBUTE_TYPE.Shank:
//       return ShanksData;
//     // case ATTRIBUTE_TYPE.Tags:
//     //   return Tag;
//     default:
//       return null;
//   }
// };

export const RATE_PRICE_DECIMAL_POINT = 3;

export const RATE_CONFIG_KEY_LIST = [
  SYSTEM_CONFIGURATIONS_KEYS.OUNCE_PRICE,
  SYSTEM_CONFIGURATIONS_KEYS.SILVER_PRICE_PER_GRAM,
  SYSTEM_CONFIGURATIONS_KEYS.PLATINUM_PRICE_PER_GRAM,
];

export const SHOPIFY_STORE_KEY_LIST = [
  SHOPIFY_STORE_KEY.THE_CADCO_APP,
  SHOPIFY_STORE_KEY.ZAMELS_APP,
  SHOPIFY_STORE_KEY.MAZZUCCHELLIS_APP,
];

export const PRODUCT_IMAGE_TYPE_LIST = [
  PRODUCT_IMAGE_TYPE.Feature,
  PRODUCT_IMAGE_TYPE.Image,
  PRODUCT_IMAGE_TYPE.IV,
  PRODUCT_IMAGE_TYPE.Video,
  PRODUCT_IMAGE_TYPE.GLB,
];

export const ORDER_STATUS_LIST = [
  OrderStatus.Pendding,
  OrderStatus.Confirmed,
  OrderStatus.Processing,
  OrderStatus.OutOfDeliver,
  OrderStatus.Delivered,
  OrderStatus.Returned,
  OrderStatus.Failed,
  OrderStatus.Canceled,
  OrderStatus.Archived,
];


export const ORDER_STATUS_ID_FROM_LABEL = {
  [OrderStatus.Pendding]: "Pending",
  [OrderStatus.Confirmed]: "Confirmed",
  [OrderStatus.Processing]: "Processing",
  [OrderStatus.OutOfDeliver]: "Out for Delivery",
  [OrderStatus.Delivered]: "Delivered",
  [OrderStatus.Returned]: "Returned",
  [OrderStatus.Failed]: "Failed",
  [OrderStatus.Canceled]: "Canceled",
  [OrderStatus.Archived]: "Archived"
}

export const DELIVERY_STATUS_LIST = [
  DeliverStatus.Pendding,
  DeliverStatus.Deliver,
];

export const PRODUCT_VIDEO_TYPE_LIST = [PRODUCT_VIDEO_TYPE.Feature];

export const PRODUCT_TAX_PERCENTAGE = 15;

export const GENDERLIST = [
  {
    id: 1,
    name: "male",
  },
  {
    id: 2,
    name: "female",
  },
  {
    id: 3,
    name: "unisex",
  },
];

export const WHITE_METAL_TONE_SORT_CODE = "WG";

export const CONFIGURATORE_OTP_EXPIRY_MINUTE = 120;

export const SINGLE_PRODUCT_TYPE_LIST = Object.keys(SingleProductType)
  .filter((key) => isNaN(Number(key)))
  .map((key) => SingleProductType[key as keyof typeof SingleProductType]);

// public API URL

export const PUBLIC_API_URL = [
  "/api/v2/public/shopify/product/list",
  "/api/v2/public/config-select/dropDown/list",
  "/api/v2/public/product/price/find/retail-discount",
  "/api/v2/public/product-images",
  "/api/v3/public/product-images",
  "/api/v4/public/product-images",
  "/api/v4/public/cadco-design-client"
];

export const WOO_COMMERCE_VERSION = "wc/v3";
export const WOO_COMMERCE_CATEGORY = 30;

export const WOO_COMMERCE_HEAD_TONE = ["RG", "WG", "YG"];
export const WOO_COMMERCE_SHANK_TONE = ["RG", "WG", "YG"];
export const WOO_COMMERCE_BAND_TONE = ["NONE", "RG", "WG", "YG"];

export const WOO_COMMERCE_PRODUCT_STATUS = "publish";

export const CONFIG_PRODUCT_METAL_DETAILS = [
  {
    key: "KT_9",
    metal: "gold",
    karat: 9,
    productListField: "product9KTList",
  },
  {
    key: "KT_10",
    metal: "gold",
    karat: 10,
    productListField: "product10KTList",
  },
  {
    key: "KT_14",
    metal: "gold",
    karat: 14,
    productListField: "product14KTList",
  },
  {
    key: "KT_18",
    metal: "gold",
    karat: 18,
    productListField: "product18KTList",
    field: "head_shank",
  },
  {
    key: "KT_22",
    metal: "gold",
    karat: 22,
    productListField: "product22KTList",
  },
  {
    key: "silver",
    metal: "silver",
    karat: null,
    productListField: "productSilverList",
  },
  {
    key: "platinum",
    metal: "platinum",
    karat: null,
    productListField: "productPlatinumList",
  },
];

export const CONFIG_PRODUCT_DIAMOND_DETAILS = [
  {
    key: "natural_dia_clarity_color",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "Product_center_diamond_details",
    stone: "diamond",
  },
  {
    key: "lab_grown_dia_clarity_color",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "Product_center_diamond_details",
    stone: "diamond",
  },
];

export const BRACELET_CONFIG_PRODUCT_DIAMOND_DETAILS = [
  {
    key: "natural_dia_clarity_color",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_fixed_diamond_details",
    stone: "diamond",
  },
  {
    key: "lab_grown_dia_clarity_color",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_fixed_diamond_details",
    stone: "diamond",
  },
];

export const CONFIG_PRODUCT_GEMSTONE_DETAILS = [
  {
    key: "natural_january",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "january",
  },
  {
    key: "synthetic_january",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "january",
  },
  {
    key: "natural_february",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "february",
  },
  {
    key: "synthetic_february",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "february",
  },
  {
    key: "natural_march",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "march",
  },
  {
    key: "synthetic_march",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "march",
  },
  {
    key: "natural_april",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "april",
  },
  {
    key: "synthetic_april",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "april",
  },
  {
    key: "natural_may",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "may",
  },
  {
    key: "synthetic_may",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "may",
  },
  {
    key: "natural_june",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "june",
  },
  {
    key: "synthetic_june",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "june",
  },
  {
    key: "natural_july",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "july",
  },
  {
    key: "synthetic_july",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "july",
  },
  {
    key: "natural_august",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "august",
  },
  {
    key: "synthetic_august",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "august",
  },
  {
    key: "natural_september",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "september",
  },
  {
    key: "synthetic_september",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "september",
  },
  {
    key: "natural_october",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "october",
  },
  {
    key: "synthetic_october",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "october",
  },
  {
    key: "natural_november",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "november",
  },
  {
    key: "synthetic_november",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "november",
  },
  {
    key: "natural_december",
    diamondType: DIAMOND_TYPE.natural,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "december",
  },
  {
    key: "synthetic_december",
    diamondType: DIAMOND_TYPE.synthetic,
    productListField: "product_diamond_details",
    alternateStoneListField: "alternate_stone_diamond_details",
    stone: "december",
  },
];
// MASTER
export const MasterError = {
  metal_master: "Metal",
  metal_tone_master: "Metal tone",
  metal_karat_master: "Metal karat",
  stone_master: "Stone",
  stone_carat_master: "Stone carat",
  stone_shape_master: "Stone shape",
  diamond_color_master: "Diamond color",
  diamond_clarity_master: "Diamond clarity",
  diamond_cut_master: "Diamond cut",
  diamond_certificate_master: "Diamond certificate",
  diamond_process_master: "Diamond Process",
  item_size_master: "Item size",
  item_length_master: "Item length",
  setting_style_master: "Setting style",
  category_master: "Category",
  tag_master: "Tag",
  brand_master: "Brand",
  select_preference_master: "Select Preference",
  availability_master: "availability",
  cut_grade_master: "cut grade",
  polish_master: "polish",
  symmetry_master: "symmetry",
  fluorescence_intensity_master: "fluorescence intensity",
  fluorescence_color_master: "fluorescence color",
  lab_master: "lab",
  fancy_color_master: "fancy color",
  fancy_color_intensity_master: "fancy color intensity",
  fancy_color_overtone_master: "fancy color overtone",
  girdle_thin_master: "girdle thin",
  girdle_thick_master: "girdle thick",
  girdle_condition_master: "girdle condition",
  culet_condition_master: "culet condition",
  laser_inscription_master: "laser inscription",
  cert_comment_master: "cert comment",
  country: "country",
  state: "state",
  city: "city",
  time_to_location_master: "time to location",
  pair_separable_master: "pair separable",
  pair_stock_master: "pair stock",
  parcel_stones_master: "parcel stones",
  trade_show_master: "trade show",
  shade_master: "shade",
  center_inclusion_master: "center inclusion",
  black_inclusion_master: "black inclusion",
  report_type_master: "report type",
  lab_location_master: "lab location",
  milky_master: "milky",
  bgm_master: "bgm",
  pair_master: "pair",
  "H&A_master": "H&A",
  growth_type_master: "growth type",
};

// coupon discount type list

export const COUPON_DISCOUNT_TYPE_LIST = [
  COUPON_DISCOUNT_TYPE.PercentageDiscount,
  COUPON_DISCOUNT_TYPE.FixedAmountDiscount,
];

export const COUPON_DURATION_LIST = [
  COUPON_DURATION.Once,
  COUPON_DURATION.Forever,
];

export const CATALOGUE_ORDER_APP_KEY = "CATALOGUE_ORDER";

// role and permission for master and info section
export const BASE_MASTER_URL = '/master'
export const BASE_INFO_URL = 'info-section'
export const BASE_TEMPLATE_TWO_PRODUCT_URL = '/template/two/product-section'

export const sectionTypeMapWithCompanyInfo = {
  [ThemeSectionType.Header]: 'id_header',
  [ThemeSectionType.Footer]: 'id_footer',
  [ThemeSectionType.HomePage]: 'id_home_page',
  [ThemeSectionType.ProductGrid]: 'id_product_grid',
  [ThemeSectionType.ProductCard]: 'id_product_card',
  [ThemeSectionType.productFilter]: 'id_product_filter',
  [ThemeSectionType.ProductDetail]: 'id_product_detail',
  [ThemeSectionType.CreateYourOwn]: 'id_create_your_own',
  [ThemeSectionType.Login]: 'id_login_page',
  [ThemeSectionType.Registration]: 'id_registration_page',
  [ThemeSectionType.Toast]: 'id_toast',
  [ThemeSectionType.Button]: 'id_button',
  [ThemeSectionType.Cart]: 'id_cart',
  [ThemeSectionType.Checkout]: 'id_checkout',
  [ThemeSectionType.Profile]: 'id_profile',
  [ThemeSectionType.VerifiedOTP]: 'id_otp_verify',
  [ThemeSectionType.ConfiguratorDetail]: 'id_otp_verify'
};


export const AUDIT_LOG_HIDE_BASE_ON_ACTIVITY_TYPE =[LogsActivityType.FailedPaymentQuentityManageMetal,LogsActivityType.FailedPaymentQuentityManageDiamond,LogsActivityType.ResendOTPVerification,LogsActivityType.CustomerOTPVerification,LogsActivityType.OTP];
export const ALLOW_FILE_CONVERT_TO_WEBP_MIME_TYPE = ['image/jpeg', 'image/png', 'image/tiff'];

export const CUSTOMER_USER_ROLE_ID = 0

export const LOG_FOR_SUPER_ADMIN = 0

export const GLEAMORA_KEY = "GLEAMORA"

export const SUPER_ADMIN_CREATED_ROLES_COMPANY_KEY = 0;
export const PAYPAL_ACCEPT_CURRENCY_CODE = [
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'HKD',
  'HUF',
  'ILS',
  'JPY',
  'MYR',
  'MXN',
  'TWD',
  'NZD',
  'NOK',
  'PHP',
  'PLN',
  'GBP',
  'SGD',
  'SEK',
  'CHF',
  'CHF',
  'USD'
]

export const IMAGE_TYPE_LABELS: Record<IMAGE_UPLOAD_TYPE, string> = {
  [IMAGE_UPLOAD_TYPE.Featured_images]: 'Featured Image',
  [IMAGE_UPLOAD_TYPE.Image]: 'Standard Image',
  [IMAGE_UPLOAD_TYPE.Thirysix_images]: '360 View Images',
  [IMAGE_UPLOAD_TYPE.Video_upload]: 'Product Video',
  [IMAGE_UPLOAD_TYPE.Glb_upload]: '3D GLB Model',
  [IMAGE_UPLOAD_TYPE.Meta_image]: 'Meta Image',
};

export const SHOPIFY_STORE = {
  [COMPANY_KEYS.THE_CAD_CO]: SHOPIFY_STORE_KEY.THE_CADCO_APP,
}

// regex for UTC date formate
export const DATE_REGEX =/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/; 
export const TIME_REGEX =/^\d{2}:\d{2}(:\d{2})?$/;

export const AutomaticMaxProductTypeUsageCount = 5
export const AutomaticMaxOrderTypeUsageCount = 1
export const CouponMaxProductTypeUsageCount = 0
export const CouponMaxOrderTypeUsageCount = 1

// Validation: Ensure the code contains only valid characters (A-Z, 0-9)
export const COUPONCODEREGEX = /^[A-Z0-9]+$/;

export const CLIENT_MANAGEMENT_URL = `client-manage`;
export const AUDIT_LOG_HIDE_BASE_ON_LOG_TYPE = [LogsType.Auth];

export const ADD_CADCO_PRODUCT_DETAIL_TO_CLIENT_API_URL = {
  stag: `${process.env.STAGING_API_BASE_URL}v4/public/cadco-design-client`,
  prod: `${process.env.PRODUCTION_API_BASE_URL}v4/public/cadco-design-client`,
}

export const SINGLE_ENTRY_SECTION_TYPES = [
  "feature_product",
  "new_arrival",
  "best_deal"
];

export const TEMPLATE_EIGHT_SECTION_TYPES = Object.values(templateEightSectionTypeEnum);