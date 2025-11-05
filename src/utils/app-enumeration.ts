export enum USER_TYPE {
  Administrator = 1,
  BusinessUser = 2,
  Customer = 3,
  Guest = 4,
  SuperAdmin = 6
}

export enum USER_STATUS {
  PendingVerification = 0,
  PendingApproval = 1,
  Approved = 2,
  Blocked = 3,
  PendingReverification = 4,
}

export enum BANNER_TYPE {
  banner = 1,
  marketing_banner = 2,
  features_sections = 3,
  marketing_popup = 4,
  best_seller = 5,
  The_process = 6,
  new_arriive = 7
}

export enum TEMPLATE_2_BANNER_TYPE {
  banner = 1,
  marketing_banner = 2,
  features_sections = 3,
  marketing_popup = 4,
  home_about_banner = 5,
  home_about_features_section = 6,
  home_about_marketing_section = 7,
  NewCollectionProduct = 8,
  BestSellerProduct = 9
}

export enum TemplateTwoProductSectionType {
  "best_seller" = TEMPLATE_2_BANNER_TYPE.BestSellerProduct,
  "new_collection" = TEMPLATE_2_BANNER_TYPE.NewCollectionProduct
}

export enum ABOUT_US_SECTION_TYPE {
  banner = 'banner',
  FeaturesSection = 'features_section',
  MarketingSection = 'marketing_section'
}

export enum IMAGE_TYPE {
  banner = 1,
  product_promotion = 2,
  testimonial = 3,
  category = 4,
  customer = 5,
  diamondShape = 6,
  gemstones = 7,
  heads = 8,
  shanks = 9,
  settingType = 10,
  goldKT = 11,
  metalTone = 12,
  homeAbout = 13,
  profile = 14,
  headerLogo = 15,
  footerLogo = 16,
  DiamondGroup = 17,
  blog = 18,
  sideSetting = 19,
  caratSize = 20,
  ConfigProduct = 21,
  OurStory = 22,
  BirthstoneProduct = 23,
  FaviconImage = 24,
  jewelry_section = 25,
  diamond_section = 26,
  ProductModel = 27,
  templateThree = 28,
  MegaMenu = 29,
  hookType = 30,
  templateSix = 31,
  aboutUs = 32,
  templateSeven = 33,
  ThemeProvider = 34,
  loaderImage = 35,
  mailTemplateLogo = 36,
  defaultImage = 37,
  pageNotFoundImage = 38,
  shareImage = 39,
  Configurator = 40,
  productNotFound = 41,
  orderNotFound = 42,
  Master = 43,
  templateFour = 44,
  templateEight = 45
}

export enum IS_DIAMOND_TYPE {
  Diamond = 1,
  Gemstone = 2,
}

export enum PRODUCT_IMAGE_TYPE {
  Feature = 1,
  Image = 2,
  IV = 3,
  Video = 4,
  GLB = 5,
  SEO = 6
}

export enum DIAMOND_TYPE {
  natural = 1,
  synthetic = 2,
}

export enum PRODUCT_VIDEO_TYPE {
  Feature = 1,
}

export enum GIFT_PRODUCT_IMAGE_TYPE {
  Thumb = 1,
  Featured = 2,
  Vedio = 3,
}

export enum CONFIG_PRODUCT_IMPORT_FILE_TYPE {
  OneCombination = 1,
  OptimationFile = 2,
  RetailAndDiscount = 3,
  AllConfigProduct = 4,
}

export enum HTTP_METHODS {
  Get = 1,
  Post = 2,
  Put = 3,
  Delete = 4,
  Patch = 5,
}

export enum DATE_FORMAT_TYPE {
  display_format = 1,
  "YYYYMMDD" = 2,
  log_file_name_format = 3,
}

export enum MESSAGE_TYPE {
  Credential = 1,
  Otp = 2,
  Registration = 3,
  NewOrder = 4,
  ProductInquiry = 5,
}

export enum DYNAMIC_MAIL_TYPE {
  AdminAppointment = 1,
  AdminProductInquiry = 2,
  CataloguesNewOrderReceivedAdmin = 3,
  CataloguesNewOrderReceivedUser = 4,
  configuratorOtp = 5,
  CustomerAppointment = 6,
  CustomerProductInquiry = 7,
  CustomerOtp = 8,
  EmailAttachmentInvoice = 9,
  NewOrderReceivedAdmin = 10,
  ResetPassword = 11,
  Registration = 12,
  TexInvoice = 13,
  AdminChangeOrderStatus = 14,
  UserOrderPurchase = 15,
}

export enum ActiveStatus {
  Active = "1",
  InActive = "0",
}

export enum ConfigStatus {
  Yes = "1",
  No = "0",
}

export enum SubscriptionStatus {
  Subscribe = "1",
  UnSubscribe = "0",
}

export enum FeaturedProductStatus {
  Featured = "1",
  InFeatured = "0",
}

export enum TrendingProductStatus {
  Trending = "1",
  InTrending = "0",
}

export enum searchableCategory {
  searchable = 1,
  inSearchable = 0,
}

export enum OrderStatus {
  All = 0,
  Pendding = 1,
  Confirmed = 2,
  Processing = 3,
  OutOfDeliver = 4,
  Delivered = 5,
  Returned = 6,
  Failed = 7,
  Canceled = 8,
  Archived = 9
}

export enum OrderTypes {
  Offline = 1,
  Online = 2,
}

export enum DeliverStatus {
  Pendding = 1,
  Deliver = 2,
}

export enum PaymentStatus {
  InPaid = 0,
  paid = 1,
  Failed = 2,
}

export enum paymentMethod {
  cashOnDelivery = 1,
  paypal = 2,
  affirm = 3,
  YOCO = 4,
  stripe = 5,
  razorpay = 6,
}

export enum SYSTEM_CONFIGURATIONS_KEYS {
  VIEW_ACCESS_ID_ACTION = "VIEW_ACCESS_ID_ACTION",
  ONE_OUNCE_PRICE = "ONE_OUNCE_PRICE",
  ONE_OUNCE_GRAMS = "ONE_OUNCE_GRAMS",
  OUNCE_PRICE = "OUNCE_PRICE",
  GOLD_GRAM_PER_OUNCE = "GOLD_GRAM_PER_OUNCE",
  SILVER_PRICE_PER_GRAM = "SILVER_PRICE_PER_GRAM",
  PLATINUM_PRICE_PER_GRAM = "PLATINUM_PRICE_PER_GRAM",
  GOLD_FORMULA = "GOLD_FORMULA",
  SILVER_FROMULA = "SILVER_FROMULA",
  PLATINUM_FORMULA = "PLATINUM_FORMULA",
  DIAMOND_PRICE_PER_CARAT = "DIAMOND_PRICE_PER_CARAT",
}

export enum SHOPIFY_STORE_KEY {
  THE_CADCO_APP = 'THE_CADCO_APP',
  ZAMELS_APP = 'ZAMELS_APP',
  MAZZUCCHELLIS_APP = 'MAZZUCCHELLIS_APP',
  ZAMELS_STAGING_APP = 'ZAMELS_STAGING_APP',
  ZAMELS_LIVE_APP = 'ZAMELS_LIVE_APP',
  MAZZUCCHELLIS_LIVE_APP = 'MAZZUCCHELLIS_LIVE_APP',
  DDK_APP = 'DDK_APP',
  ZAMELS_RING_CONFIGURATOR_APP = 'ZAMELS_RING_CONFIGURATOR_APP',
  ZEGHANI_APP = 'ZEGHANI_APP',
}

export enum COMPANY_KEYS {
  ROYALE_JEWELERS = "ROYALE_JEWELERS",
  ZEGHANI = "ZEGHANI",
  MAZZ = "MAZZ",
  THE_CAD_CO = "TCC_TECH",
  SOLITAIRE_STORIES = "SOLITAIRE_STORIES",
  DDK = "DDK",
  STELIOS = "STELIOS",
  SIGNI = "SIGNI",
  GLEAMORA = "GLEAMORA",
}

export enum ATTRIBUTE_TYPE {
  DiamondShape = 1,
  Gemstone = 2,
  CaratSize = 3,
  Color = 4,
  Clarity = 5,
  Cut = 6,
  Head = 7,
  Shank = 8,
  SettingStyle = 9,
  GoldKT = 10,
  MetalStone = 11,
  SettingCaratWeight = 12,
  Tags = 13,
}

export enum AllProductTypes {
  Product = 1,
  GiftSet_product = 2,
  Config_Ring_product = 3,
  BirthStone_product = 4,
  Config_band_product = 5,
  Three_stone_config_product = 6,
  Eternity_product = 7,
  LooseDiamond = 8,
  SettingProduct = 9,
  BraceletConfigurator = 10,
  StudConfigurator = 11,
  SingleTreasure = 12,
  PendantConfigurator = 13,
}

export enum STONE_TYPE {
  Center = 1,
  Side = 2,
}

export enum BIRTHSTONE_STONE_TYPE {
  fixed = 1,
  changeable = 2,
}

export enum DISCOUNT_TYPE {
  PAR = 1,
  OTHER = 2,
}

export enum METAL_RATE_FORMULA {
  Gold = 1,
  Silver = 2,
  Platinum = 3,
}

export enum OPTION_TYPE {
  Metal = 1,
  Diamond = 2,
}

export enum FILE_STATUS {
  Uploaded = 1,
  ProcessedSuccess = 2,
  ProcessedError = 3,
}

export enum FILE_BULK_UPLOAD_TYPE {
  ProductUpload = 1,
  ProductZipUpload = 3,
  DiamondGroupUpload = 2,
  ConfigProductUpload = 4,
  MenuItemWithPermission = 5
}

export enum DeletedStatus {
  yes = "1",
  No = "0",
}

export enum SingleProductType {
  DynemicPrice = 1,
  VariantType = 2,
  cataLogueProduct = 3,
}

export enum ECommerce_Type {
  Shopify = "shopify",
  WooCommerce = "woocommerce",
  Valigara = "valigara",
}

export enum EternityProductCombinationType {
  Diamond = 1,
  DiamondGemstone = 2,
  Gemstone = 3,
  GemstoneGemstone = 4,
}
export enum Image_type {
  Banner = 1,
  Masters = 2,
  User = 3,
  Concierge = 4,
  About = 5,
  Preference = 6,
  Popup = 7,
}

export enum Master_type {
  Metal = "metal_master",
  Metal_tone = "metal_tone_master",
  Metal_karat = "metal_karat_master",
  Stone = "stone_master",
  Stone_carat = "stone_carat_master",
  Stone_shape = "stone_shape_master",
  Diamond_color = "diamond_color_master",
  Diamond_clarity = "diamond_clarity_master",
  Diamond_cut = "diamond_cut_master",
  Diamond_certificate = "diamond_certificate_master",
  Diamond_process = "diamond_process_master",
  Item_size = "item_size_master",
  Category_master = "category_master",
  Item_length = "item_length_master",
  Setting_style = "setting_style_master",
  Tag = "tag_master",
  Brand = "brand_master",
  Preference = "select_preference_master",
  Availability = "availability_master",
  CutGrade = "cut_grade_master",
  Polish = "polish_master",
  symmetry = "symmetry_master",
  fluorescenceIntensity = "fluorescence_intensity_master",
  fluorescenceColor = "fluorescence_color_master",
  lab = "lab_master",
  fancyColor = "fancy_color_master",
  fancyColorIntensity = "fancy_color_intensity_master",
  fancyColorOvertone = "fancy_color_overtone_master",
  GirdleThin = "girdle_thin_master",
  GirdleThick = "girdle_thick_master",
  GirdleCondition = "girdle_condition_master",
  culetCondition = "culet_condition_master",
  LaserInscription = "laser_inscription_master",
  certComment = "cert_comment_master",
  country = "country",
  state = "state",
  city = "city",
  TimeToLocation = "time_to_location_master",
  pairSeparable = "pair_separable_master",
  pairStock = "pair_stock_master",
  parcelStones = "parcel_stones_master",
  tradeShow = "trade_show_master",
  shade = "shade_master",
  centerInclusion = "center_inclusion_master",
  blackInclusion = "black_inclusion_master",
  ReportType = "report_type_master",
  labLocation = "lab_location_master",
  milky = "milky_master",
  BGM = "bgm_master",
  pair = "pair_master",
  HandA = "H&A_master",
  growthType = "growth_type_master",
}

export enum Info_Key {
  MetalTone = "metal_tone",
  MetalKarat = "metal_karat",
  StoneMaster = "stone_master",
  ShapeMaster = "shape_master",
  Carat = "carat",
  Color = "color",
  Clarity = "clarity",
  Head = "head",
  Shank = "shank",
  Setting_type = "setting_type",
  Side_setting = "side_setting",
  Brands = "brands",
  Collection = "collection",
  metalMaster = "metal_master",
  cut = "cut",
  MMSize = "mm_size",
  ItemSize = "item_size",
  ItemLength = "item_length",
  tag = "tag",
}
export enum Pagination {
  no = "1",
  yes = "0",
}
export enum ConfiguratorManageKeys {
  RingConfigurator = "RING_CONFIGURATOR",
  ThreeStoneConfigurator = "THREE_STONE_CONFIGURATOR",
  EternityBandConfigurator = "ETERNITY_BAND_CONFIGURATOR",
  BraceletConfigurator = "BRACELET_CONFIGURATOR",
  PendantConfigurator = "PENDANT_CONFIGURATOR",
  EarringConfigurator = "EARRING_CONFIGURATOR",
}

export enum TemplateFiveSectionType {
  Banner = "banner",
  JewelrySection = "jewelry_collection",
  DiamondSection = "diamond_collection",
  CategorySection = "category_section",
  ProductModel = "product_model",
}

export enum TemplateThreeSectionType {
  SplashScreen = "splash_screen",
  DiamondShapeSection = "diamond_shape_section",
  CategorySection = "category_section",
  EventSection = "event_section",
  StyleSection = "style_section",
  ProductModel = "product_model",
  ProductPageBanner = "product_page_banner",
}

export enum TemplateSixSectionType {
  BannerSection = "banner",
  DiamondShapeSection = "diamond_shape_section",
  CategorySection = "category_section",
  SparkleSection = "sparkling_section",
  EventSection = "event_section",
  StyleSection = "style_section",
  ShapeMarqueSection = "shape_marque",
  InstagramSection = "instagram_section",
}

export enum TemplateThreeDiamondShapeSectionType {
  BasicShape = "basic_shape",
  specialShape = "special_shape",
}

export enum MegaMenuType {
  URL = "url",
  SettingType = "setting_type",
  DiamondShape = "diamond_shape",
  Category = "category",
  Brand = "brand",
  Collection = "collection",
  Metal = "metal",
  MetalTone = "metal_tone",
  Gender = "gender",
  Page = "page",
  StaticPage = "static_page",
  Text = "text",
}

export enum MegaMenuTargetType {
  SameType = "same_tab",
  NewType = "new_tab",
}

export enum DIAMOND_ORIGIN {
  Natural = "natural",
  LabGrown = "lab_grown",
}

export enum DIAMOND_INVENTROY_TYPE {
  Local = "local",
  VDB = "vdb",
  Rapnet = "rapnet",
}

export enum SORTING_OPTION {
  BestSeller = "best_seller",
  Newest = "newest",
  Oldest = "oldest",
  PriceLowToHigh = "price_low_to_high",
  PriceHighToLow = "price_high_to_low",
  Popular = "popular",
  Favorite = "favorite",
}

export enum STOCK_PRODUCT_TYPE {
  Product = 1,
  LooseDiamond = 2,
}

export enum STOCK_TRANSACTION_TYPE {
  StockUpdate = 1,
  OrderCreate = 2,
  OrderFailed = 3,
}

export enum STRIPE_PAYMENT_EVENT_TYPE {
  PaymentIntentCreated = "payment_intent.created",
  PaymentSucceeded = "charge.succeeded",
  PaymentPending = "charge.pending",
  PaymentFailed = "charge.failed",
  PaymentExpired = "charge.expired",
}

export enum PAYPAL_PAYMENT_EVENT_TYPE {
  CheckoutOrderApproved = "CHECKOUT.ORDER.APPROVED",
  CheckoutOrderCompleted = "CHECKOUT.ORDER.COMPLETED",
  CheckoutOrderDeclined = "CHECKOUT.ORDER.DECLINED",
  PaymentFailed = "PAYMENT.CAPTURE.DENIED",
  PaymentExpired = "PAYMENT.AUTHORIZATION.EXPIRED",
}

export enum RAZORPAY_PAYMENT_EVENT_TYPE {
  Authorized = "payment.authorized",
  Paid = "order.paid",
  Paused = "subscription.paused",
  Cancelled = "subscription.cancelled",
  Failed = "payment.failed",
  Captured = "payment.captured",
}

export enum COUPON_DISCOUNT_TYPE {
  PercentageDiscount = "percentage_discount",
  FixedAmountDiscount = "fixed_amount_discount",
}

export enum COUPON_DURATION {
  Once = "once",
  Forever = "forever",
}

export enum SHIPPING_METHOD {
  online = 2,
  pickUpStore = 1,
}

export enum CURRENCY_SYMBOL_PLACEMENT {
  Left = "left",
  Right = "right",
}

export enum CURRENCY_RATE_EXCHANGE_TYPE {
  Manually = "manually",
  FreeApi = "free-api",
}

export enum PRODUCT_CUSTOMIZATION_STATUS {
  yes = "1",
  no = "0",
}

export enum SIGN_UP_TYPE {
  System = "system",
  Google = "google",
  Facebook = "facebook",
  Apple = "apple",
  Instagram = "instagram",
  CadcoPanel = "cadco_panel",
}

export enum TemplateSevenSectionType {
  OffersSliderSection = "offers_slider",
  OfferTopSection = "single_offer_top",
  OfferBottomSection = "single_offer_bottom",
  AttractiveJewelrySection = "attractive_jewelry",
  JewellryCategoriesSection = "jewelry_Categories",
  StunningDesginSection = "stunning_desgin",
  FestiveSaleOfferSection = "festive_sale_offer",
  DazzlingAndStylishSection = "dazzling_and_stylish",
  CategoryAndproductsSection = "category_and_products",
  StunningJewelsSection = "stunning_jewels",
  LuminousDesignSection = "luminous_design",
  TestimonialSection = "testimonial",
  TestimonialDetailSection = "testimonial_detail",
  NewAndBlogSection = "new_and_blog",
  BestSeller = "best_seller",
  TemplatefourBanner = 'template_four_banner',

}

export enum ThemeSectionType {
  Header = 'header',
  Footer = 'footer',
  HomePage = 'home_page',
  ProductGrid = 'product_grid',
  ProductCard = 'product_card',
  productFilter = 'product_filter',
  ProductDetail = 'product_detail',
  CreateYourOwn = 'create_your_own',
  Login = 'login',
  Registration = 'registration',
  Toast = 'toast',
  Button = 'button',
  Cart = 'cart',
  Checkout = 'checkout',
  Profile = 'profile',
  VerifiedOTP = 'verified_otp',
  ConfiguratorDetail = 'configurator_detail'
}
export enum LogsType {
  MetalMaster = 'metal_master',
  MetalKarat = 'metal_karat',
  Product = 'product',
  DiamondGroupMater = 'diamond_group_master',
  OrderShippingCity = 'order_shipping_city',
  OrderBillingCity = 'order_billing_city',
  OrderUserBillingAddress = "order_user_billing_address",
  OrderUserShippingAddress = "order_user_shipping_address",
  GiftSetOrder = 'gift_set_order',
  GiftSetOrderShippingCity = 'gift_set_order_shipping_city',
  GiftSetOrderBillingCity = 'gift_set_order_billing_city',
  GiftSetOrderUserBillingAddress = "gift_set_order_user_billing_address",
  GiftSetOrderUserShippingAddress = "gift_set_order_user_shipping_address",
  ConfigProductOrder = 'config_product_order',
  ConfigProductOrderShippingCity = 'config_product_order_shipping_city',
  ConfigProductOrderBillingCity = 'config_product_order_billing_city',
  ConfigProductOrderUserBillingAddress = "config_product_order_user_billing_address",
  ConfigProductOrderUserShippingAddress = "config_product_order_user_shipping_address",
  OrderWithPaypal = 'order_with_paypal',
  OrderShippingCityWithPaypal = 'order_with_paypal_shipping_city',
  OrderBillingCityWithPaypal = 'order_with_paypal_billing_city',
  OrderUserBillingAddressWithPaypal = "order_with_paypal_user_billing_address",
  OrderUserShippingAddressWithPaypal = "order_with_paypal_user_shipping_address",
  Banner = 'banner',
  FeatureSection = 'featureSection',
  MarketingPopup = 'marketing_popup',
  MarketingBanner = 'Marketing_bennar',
  OurStory = 'our_story',
  Address = 'address',
  Enquiry = 'enquiry',
  ProductEnquiry = 'product_enquiry',
  MetalTone = "metal_ton",
  Brand = 'brand',
  DiamondCaratSize = 'diamond_carat_size',
  Clarity = 'clarity',
  Colletion = 'collection',
  Color = 'color',
  Cut = 'cut',
  DiamondShape = 'diamond_shape',
  Gemstone = 'gem_stone',
  Head = 'head',
  HookType = 'hook_type',
  ItemLength = 'item_length',
  ItemSize = 'item_size',
  MMSize = 'mm_size',
  SieveSize = 'sieve_size',
  SettingCaratWeight = 'setting_carat_weight',
  SettingType = 'setting_type',
  Shank = 'shank',
  SideSetting = 'side_setting',
  Tag = 'tag',
  City = 'city',
  Country = 'country',
  Currency = 'currency',
  Master = 'master',
  Page = 'page',
  State = 'state',
  Tax = 'tax',
  TemplateTwoBanner = 'temaplete_two_banner',
  TemplateTwoFeatureSection = 'temaplete_two_feature_section',
  TemplateTwoHomeAboutBanner = 'temaplete_two_home_about_banner',
  TemplateTwoHomeAboutFeature = 'temaplete_two_home_about_feature',
  TemplateTwoHomeAboutMarketing = 'temaplete_two_home_about_marketing',
  TemplateTwoHomeAboutMarketingPopup = 'temaplete_two_home_about_marketing_popup',
  TemplateTwoHomeMarketingSection = 'temaplete_two_home_marketing_section',
  TemplateTwoProductSection = 'temaplete_two_product_section',
  TemplateFiveBanner = 'temaplet_five_banner',
  TemplateFiveCategory = 'temaplet_five_category',
  TemplateFiveDiamond = 'temaplet_five_diamond',
  TemplateFiveJewellry = 'temaplet_five_jewellry',
  TemplateFiveProductModle = 'temaplet_five_product_modle',
  TemplateSixBanner = 'template_six_banner',
  TemplateSixDiamonShape = 'template_six_diamon_shape',
  TemplateSixInstagram = 'template_six_instagram',
  TemplateSixShapeMarque = 'template_six_shape_marque',
  TemplateSixShopBy = 'template_six_Shop_by',
  templateSixSparkling = 'temaplate_Six_sparkling',
  TemplateThreeDiamonshpe = 'temaplate_three_diamondshape',
  TemplateThreeShopBy = 'temaplate_three_shopeby',
  TemplateThreeSplashScreen = 'temaplate_three_splash_screen',
  TemplateSevenOffersSliderSection = "template_seven_offers_slider",
  TemplateSevenOfferTopSection = "template_seven_single_offer_top",
  TemplateSevenOfferBottomSection = "template_seven_single_offer_bottom",
  TemplateSevenAttractiveJewelrySection = "template_seven_attractive_jewelry",
  TemplateSevenJewellryCategoriesSection = "template_seven_jewelry_Categories",
  TemplateSevenStunningDesginSection = "template_seven_stunning_desgin",
  TemplateSevenFestiveSaleOfferSection = "template_seven_festive_sale_offer",
  TemplateSevenDazzlingAndStylishSection = "template_seven_dazzling_and_stylish",
  TemplateSevenCategoryAndproductsSection = "template_seven_category_and_products",
  TemplateSevenStunningJewelsSection = "template_seven_stunning_jewels",
  TemplateSevenLuminousDesignSection = "template_seven_luminous_design",
  TemplateSevenTestimonialSection = "template_seven_testimonial",
  TemplateSevenTestimonialDetailSection = "template_seven_testimonial_detail",
  TemplateSevenNewAndBlogSection = "template_seven_new_and_blog",
  AboutUs = "about_us",
  AllProductCart = "all_product_cart",
  Auth = "auth",
  BirthStoneProduct = "birth_stone_product",
  BirthStoneProductBulkUpload = "birth_stone_product_upload",
  BlogCategory = "blog_category",
  Blog = "blog",
  CartProduct = "cart_product",
  Category = "category",
  Companyinfo = "companyinfo",
  ConfigAllProductBulkUpload = "config_all_product_bulk_upload",
  ConfigBraceletProductBulkUpload = "config_bracelet_product_bulk_upload",
  ConfigEternityProductBulkUpload = "config_eternity_product_bulk_upload",
  ConfigProductBulkUploadNew = "config_product_bulk_upload_new",
  ConfigProductBulkUpload = "config_product_bulk_upload",
  ConfigProductNewDiamondGroupBulkUpload = "config_product_New_diamond_group_bulk_upload",
  Coupon = "coupon",
  Customer = "customer",
  GenralEnquiry = "genral_enquiry",
  Faq = "faq",
  FaqQueAws = "faq_que_aws",
  GiftSetProduct = "gift_set_product",
  GiftSetProductImage = "gift_set_product_image",
  HomeAboutMain = "home_about_main",
  HomeAboutSubContent = "home_about_sub_content",
  InfoSection = "info_section",
  LooseDiamondBulkImport = "loose_diamond_bulk_import",
  LooseDiamondBulkImportImage = "loose_diamond_bulk_import_image",
  MegaMenu = "mega_menu",
  MetaData = "meta_data",
  PaymentTransaction = "payment_transaction",
  GiftSetPaymentTransaction = "gift_set_payment_transaction",
  ConfigPaymentTransaction = "config_payment_transaction",
  PaymentTransactionWithPaypal = "config_payment_transaction_with_paypal",
  ProductBulkUploadWithChooseSetting = "product_bulk_upload_with_choose_setting",
  ProductBulkUploadWithVariant = "product_bulk_upload_with_variant",
  ProductBulkUpload = "product_bulk_upload",
  ProductImageBulkUpload = "product_image_bulk_upload",
  ProductReview = "product_review",
  ProductWishList = "product_wish_list",
  VariantProductWishList = "variant_product_wish_list",
  ProductWishListWithProduct = "product_wish_list_with_product",
  MoveProductCartToWishList = "move_product_cart_to_wish_list",
  RetailDiscountConfigProductBulkUpload = "retail_discount_config_product_bulk_upload",
  RoleApiPermission = "role_api_permission",
  Role = "role",
  RoleConfiguration = "role_configuration",
  MenuItem = "menu_item",
  ShippingCharge = "shipping_charge",
  StaticPage = "static_page",
  Subscription = "subscription",
  Testimonial = "testimonials",
  Themes = "themes",
  WebConfig = "web_config",
  ThemeComponyInfo = "theme_compony_info",
  TpDiamond = "tp_diamond",
  Upload = "upload",
  UserManagement = "user_management",
  Webhook = "webhook",
  MenuItemWithPermission = "menu_item_with_permission",
  StipeTransaction = "stripe_transaction",
  RazorPay = "razor_pay",
  WebhookTransactionSuccess = "webhook_transaction_success",
  WebhookTransactionFailed = "webhook_transaction_failed",
  ClientManage = "client_manage",
  PayPal = "pay_pal",
  Stripe = "stripe",
  MegaMenuAttributes = "mega_menu_acttributes",
  configurator_setting = "configurator_setting",
  StoreAddress = "store_address",
  Filter = "filter",
  EmailTemplate = "email_template",
  LooseDiamondSingle = "loose_diamond_single",
  CustomerAuth = "customer_auth",
  TemplateSevenproductsSection = "template_seven_products",
  Order = 'order',
  companyInfoUpdateByClient = "company_info_update_by_client",
  templateFourBanner = 'template_four_banner',
  templateFourJewelrySection = 'template_four_jewelry_section',
  templateFourPerfectJewelry = 'template_four_perfect_jewelry',
  templateFourCategory = 'template_four_category',
  templateFourNewCollection = 'template_four_new_collection',
  templateFourLatestCollection = 'template_four_latest_collection',
  templateFourAntique = 'template_four_antique',
  templateFourAncient = 'template_four_ancient',
  templateFourJournal = 'template_four_journal',
  templateOneProductSection = 'template_one_product_section',
  theProcess ='the_process',
  newArriveProduct = 'new_arrive_product',
  section="section",
}

export enum LogsActivityType {
  Add = 'ADD',
  Edit = 'EDIT',
  Delete = 'DELETE',
  StatusUpdate = 'STATUS_UPDATE',
  RateUpdate = 'RATE_UPDATE',
  QuantityUpdate = "QUANTITY_UPDATE",
  Register = "REGISTER",
  Login = "LOGIN",
  OTP = "OTP",
  RefreshToken = "REFRESH_TOKEN",
  ChangePassword = "CHANGE_PASSWORD",
  ForgotPassword = "FORGOT_PASSWORD",
  ResetPassword = "RESETPASSWORD",
  ChangeAnyUserPassword = "CHANGE_ANY_USER_PASSWORD",
  CustomerRegister = "CUSTOMER_REGISTER",
  customerRegistrationWithSystem = "CUSTOMER_REGISTER_WITH_SYSTEM",
  customerRegistrationWithGoogle = "CUSTOMER_REGISTER_WITH_GOOGLE",
  AllReadyExistcustomerRegistrationWithGoogle = "All_READY_EXIST_CUSTOMER_REGISTER_WITH_GOOGLE",
  CustomerOTPVerification = "CUSTOMER__OTP_VARIFICATION",
  ResendOTPVerification = "RESEND_OTP_VERIFICATION",
  CustomerInfoUpdate = "CUSTOMER_INFO_UPDATE",
  IsFeatured = "IS_FEATURED",
  IsTranding = "IS_TRANDING",
  BlogDefault = "BLOG_DEFAULT",
  CompanyinfoURLUpdate = "COMPANY_INFO_UPDATE",
  RemoveCoupon = "REMOVE_COUPON",
  OrderStatus = "ORDER_STATUS",
  DeliveryStatus = "DELIVERY_STATUS",
  Subscribe = "SUBSCRIBE",
  LogoUpdate = "LOGO_UPDATE",
  Script = "SCRIPT",
  UpdateFontStyle = "UPDATE_FONT_STYLE",
  DeleteFontStyle = "DELETE_FONT_STYLE",
  UpdateSystemColor = "UPDATE_SYSTEM_COLOR",
  StripeEvent = "STRIPE_EVENT",
  PayPalEvent = "PAYPAL_EVENT",
  RazorpayEvent = "RAZORPAY_EVENT",
  FailedPaymentQuentityManageDiamond = "FAILED_PAYMENT_QUENTITY_MANAGE_DIAMOND",
  FailedPaymentQuentityManageMetal = "FAILED_PAYMENT_QUENTITY_MANAGE_METAL",
  BulkUpload = " BULK_UPLOAD",
  CustomerLogin = "CUSTOMER_LOGIN",
  CustomerOTP = "CUSTOMER_OTP",


}

export enum FontStyleType {
  Google = 'google',
  Font = 'font'
}

export enum FontType {
  Primary = 'primary',
  Secondary = 'secondary'
}

export enum AccessRolePermission {
  Yes = "1",
  No = "0"
}

export enum WantToSendMailDynamic {
  Yes = "1",
  No = "0"
}

export enum FilterType {
  Single = "single",
  Multiple = "multiple",
  Range = "range"
}

export enum FilterMasterKey {
  SettingStyle = 'side-setting',
  Metal = 'metal',
  Category = 'category',
  CategorySubCategory = 'category-subcategory',
  CategorySubCategorySubSubCategory = 'category-subcategory-subsubcategory',
  MetalTone = 'metal-tone',
  DiamondShape = 'diamond-shape',
  Collection = 'collection',
  Gender = 'gender',
  Brand = 'brand',
  DiamondColor = 'diamond-color',
  DiamondClarity = 'diamond-clarity',
  Stone = 'stone',
  cut = 'cut',
  ItemSize = 'item-size',
  ItemLength = 'item-length',
  FluorescenceIntensity = 'fluorescence-intensity',
  FluorescenceColor = 'fluorescence-color',
  FancyColor = 'fancy-color',
  FancyColorIntensity = 'fancy-color-intensity',
  FancyColorOvertone = 'fancy-color-overtone',
  GirdleThin = 'girdle-thin',
  GirdleThick = 'girdle-thick',
  GirdleCondition = 'girdle-condition',
  Polish = 'polish',
  Symmetry = 'symmetry',
  Shade = 'shade',
  Certificate = 'certificate',
  Lab = 'lab',
  Milky = 'milky',
  BGM = 'bgm',
  HandA = 'H&A',
  GrowthType = 'growth-type',
}

export enum FilterItemScope {
  Product = 'product',
  Diamond = 'diamond',
  Both = 'both',
  None = 'none'
}

export enum EmailLogType {
  Success = 'success',
  Error = 'error',
  Pending = 'pending'
}


export enum IMAGE_UPLOAD_TYPE {
  Image = '2',
  Featured_images = '1',
  Thirysix_images = '3',
  Video_upload = '4',
  Glb_upload = '5',
  Meta_image = '6'
}

export enum STUD_PRODUCT_TYPE {
  STUD = 'stud',
  HUGGIES = 'huggies'
}

export enum STUD_SIDE_DIAMOND_TYPE {
  HALO = 'halo',
  HUGGIES = 'huggies'
}

export enum sampleFileType {
  DiamondGroupMater = 'DIAMOND_GROUP_MASTER',
  DynamicProduct = 'DYNAMIC_PRODUCT',
  VariantProduct = 'VARIANT_PRODUCT',
  ChooseSettingRetailProduct = 'CHOOSE_SETTING_RETAIL_PRODUCT',
  ChooseSettingDynamicProduct = 'CHOOSE_SETTING_DYNAMIC_PRODUCT',
  RingConfigurator = 'RING_CONFIGURATOR',
  ThreeStoneConfigurator = 'THREE_STONE_CONFIGURATOR',
  EternityBandConfigurator = 'ETERNITY_BAND_CONFIGURATOR',
  BraceletConfigurator = 'BRACELET_CONFIGURATOR',
  EarringConfigurator = 'EARRING_CONFIGURATOR',
  LooseDiamond = 'LOOSE_DIAMOND',
  BirthStoneProduct = 'BIRTH_STONE_PRODUCT',
  StudConfigProduct = 'STUD_CONFIG_PRODUCT',
  PendantConfigProduct = 'PENDANT_CONFIG_PRODUCT',
}

export enum TemplateFour {
  Banner = 'banner',
  JewelrySection = 'jewelry_section',
  PerfectJewelry = 'perfect_jewelry',
  Category = 'category',
  NewCollection = 'new_collection',
  LatestCollection = 'latest_collection',
  Antique = 'antique',
  Ancient = 'ancient',
  Journal = 'journal'
}
export enum condition{
  productDirect = 'product_direct',
  orderDirect = 'order_direct',
  buys = 'buys',
  gets = 'gets'
}

export enum productFor {
  Free = 'free',
  ApplyDiscount = 'apply_discount',
}

export enum offerType {
  ProductType = 'product_type',
  OrderType = 'order_type',
  BuyXGetY = 'buy_x_get_y',
}

export enum DaysOfWeek {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

export enum BigInt{
  Zero = '0',
  One = '1',
}

export enum userSegments{
New = "new user"
}

export enum isCombined{
  YES = "1",
  NO= "0"
}

export enum offerMethod {
  automatic = "automatic",
  manually = "manually"
}
export enum discount_based_on {
  Products = 'products',
  Categories = 'categories',
  Collections = 'collections',
  Styles = 'styles',
  Events = 'events',
  Lookbooks = 'lookbooks',
  PriceRang = 'price_rang'
}

export enum product_type {
  DynamicSingleProduct = 'daynamic_single_product',
  VariantSingleProduct = 'variant_single_product',
  RingConfigurator = 'ring_configurtor',
  TreeStoneConfigurator = 'tree_stone_configurtor',
  EnternityBandConfigurator = 'enternity_band_configurator',
  BracelateConfigurator = 'bracelate_configurator',
  BirthStoneConfigurator = 'birth_stone_configurator'
}

export enum couponType {
  PercentageDiscount = "PercentageDiscount",
  FixedAmountDiscount = "FixedAmountDiscount",
}

export enum Bale_Type {
  SLIDER = 'slider',
  BALE = 'bale'
}

export enum templateEightSectionTypeEnum {
  FeatureProduct = "feature_product",
  NewArrival = "new_arrival",
  BestDeal = "best_deal",
  Banner = "banner",
  Service = "service",
  Collection = "collection",
  CompanyImage = "company_image"
}

export enum PRICE_CORRECTION_PRODUCT_TYPE {
  DynamicProduct = 'dynamic_product',
  ChooseSettingProduct = 'choose_setting_product',
  RingConfigurator = 'ring_configurator',
  ThreeStoneConfigurator = 'three_stone_configurator',
  EternityBandConfigurator = 'eternity_band_configurator',
  BracelateConfigurator = 'bracelet_configurator',
  StudConfigProduct = 'stud_configurator',
  PendantConfigProduct = 'pendant_configurator'
}
