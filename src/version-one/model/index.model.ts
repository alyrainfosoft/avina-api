import dbContext from "../../config/db-context";
import { ConfiguratorLogs } from "./3D_configurator/3D-configurator-logs.model";
import { AboutUsData } from "./about-us.model";
import { Action } from "./action.model";
import { ActivityLogs } from "./activity-logs.model";
import { UserAddress } from "./address.model";
import { AppUser } from "./app-user.model";
import { Banner } from "./banner.model";
import { BirthstoneProductCategory } from "./birth-stone-product/birth-stone-product-category.model";
import { BirthStoneProductDiamondOption } from "./birth-stone-product/birth-stone-product-diamond-option.model";
import { BirthstoneProductEngraving } from "./birth-stone-product/birth-stone-product-engraving.model";
import { BirthstoneProductMetalOption } from "./birth-stone-product/birth-stone-product-metal-option.model";
import { BirthStoneProduct } from "./birth-stone-product/birth-stone-product.model";
import { BlogCategoryData } from "./blog-category.model";
import { BlogsData } from "./blogs.model";
import { BusinessUser } from "./business-user.model";
import { CartProducts } from "./cart-product.model";
import { CategoryData } from "./category.model";
import { CompanyInfo } from "./companyinfo.model";
import { ConfigBraceletProductDiamonds } from "./config-bracelet-product-diamond.model";
import { ConfigBraceletProductMetals } from "./config-bracelet-product-metals.model";
import { ConfigBraceletProduct } from "./config-bracelet-product.model";
import { ConfigCartProduct } from "./config-cart-product.model";
import { ConfigEternityProductDiamondDetails } from "./config-eternity-product-diamonds.model";
import { ConfigEternityProductMetalDetail } from "./config-eternity-product-metals.model";
import { ConfigEternityProduct } from "./config-eternity-product.model";
import { ConfigOrdersDetails } from "./config-order-details.model";
import { ConfigPendantDiamonds } from "./config-pendant-diamonds.model";
import { ConfigPendantMetals } from "./config-pendant-metals.model";
import { ConfigPendantProduct } from "./config-pendant-products.model";
import { ConfigProductDiamonds } from "./config-product-diamonds.model";
import { ConfigProductMetals } from "./config-product-metal.model";
import { ConfigProduct } from "./config-product.model";
import { ConfiguratorSettingFile } from "./configurator-setting-file.model";
import { ConfiguratorSetting } from "./configurator-setting.model";
import { CouponData } from "./coupon.model";
import { CustomerUser } from "./customer-user.model";
import { DiamondRanges } from "./diamond-range.model";
import { EamilLog } from "./email-logs.model";
import { EmailTemplate } from "./email-template.model";
import { Enquiries } from "./enquiries.model";
import { ExceptionLogs } from "./exception-logs.model";
import { FAQData } from "./faq-question-answer.model";
import { FiltersData } from "./filters.model";
import { GiftSetProduct } from "./gift-set-product/gift_set_product.model";
import { GiftSetProductImages } from "./gift-set-product/gift_set_product_image.model";
import { GiftSetProductInvoice } from "./gift-set-product/gift_set_product_invoice.model";
import { GiftSetProductOrder } from "./gift-set-product/gift_set_product_order.model";
import { GiftSetProductOrderTransaction } from "./gift-set-product/gift_set_product_transaction.model";
import { GiftSetOrdersDetails } from "./gift-set-product/git_set_product_order_details.model";
import { HomeAboutMain } from "./home-about/home-about-main.model";
import { HomeAboutSub } from "./home-about/home-about-sub.model";
import { Image } from "./image.model";
import { InfoSection } from "./info-section.model";
import { Invoices } from "./invoices.model";
import { LooseDiamondGroupMasters } from "./loose-diamond-group-master.model";
import { BrandData } from "./master/attributes/brands.model";
import { DiamondCaratSize } from "./master/attributes/caratSize.model";
import { ClarityData } from "./master/attributes/clarity.model";
import { Collection } from "./master/attributes/collection.model";
import { Colors } from "./master/attributes/colors.model";
import { CutsData } from "./master/attributes/cuts.model";
import { DiamondGroupMaster } from "./master/attributes/diamond-group-master.model";
import { DiamondShape } from "./master/attributes/diamondShape.model";
import { StoneData } from "./master/attributes/gemstones.model";
import { HeadsData } from "./master/attributes/heads.model";
import { HookTypeData } from "./master/attributes/hook-type.model";
import { LengthData } from "./master/attributes/item-length.model";
import { SizeData } from "./master/attributes/item-size.model";
import { GoldKarat } from "./master/attributes/metal/gold-karat.model";
import { MetalGroupMaster } from "./master/attributes/metal/metal-group-master.model";
import { MetalMaster } from "./master/attributes/metal/metal-master.model";
import { MetalTone } from "./master/attributes/metal/metalTone.model";
import { MMSizeData } from "./master/attributes/mmSize.model";
import { SieveSizeData } from "./master/attributes/seiveSize.model";
import { SettingCaratWeight } from "./master/attributes/settingCaratWeight.model";
import { SettingTypeData } from "./master/attributes/settingType.model";
import { ShanksData } from "./master/attributes/shanks.model";
import { SideSettingStyles } from "./master/attributes/side-setting-styles.model";
import { Tag } from "./master/attributes/tag.model";
import { CityData } from "./master/city.model";
import { CountryData } from "./master/country.model";
import { CurrencyData } from "./master/currency.model";
import { Master } from "./master/master.model";
import { StateData } from "./master/state.model";
import { TaxMaster } from "./master/tax.model";
import { MegaMenus } from "./mega-menu/mega_menu.model";
import { MegaMenuAttributes } from "./mega-menu/mega_menu_attributes.model";
import { MenuItem } from "./menu-items.model";
import { MetaDataDetails } from "./metadata-details.model";
import { LookBook } from "./offer-discount/look-book.model";
import { OfferDetails } from "./offer-discount/offer-detail.model";
import { Offers } from "./offer-discount/offer.model";
import { OfferEligibleCustomers } from "./offer-discount/offers-eligible-customer.model";
import { OrdersDetails } from "./order-details.model";
import { OrderTransaction } from "./order-transaction.model";
import { Orders } from "./order.model";
import { OurStory } from "./our-stories.model";
import { PageData } from "./pages.model";
import { PriceCorrection } from "./price-correction.model";
import { ProductWish } from "./produc-wish-list.model";
import { ProductAttributeValue } from "./product-attribute-value.model";
import { ProductBulkUploadFile } from "./product-bulk-upload-file.model";
import { ProductCategory } from "./product-category.model";
import { ProductDiamondOption } from "./product-diamond-option.model";
import { ProductEnquiries } from "./product-enquiry.model";
import { ProductImage } from "./product-image.model";
import { ProductMetalOption } from "./product-metal-option.model";
import { ProductPriceHistories } from "./product-price-histories.model";
import { ProductReview } from "./product-review.model";
import { ProductSearchHistories } from "./product-search-histories.model";
import { ProductVideo } from "./product-video.model";
import { Product } from "./product.model";
import { ReviewImages } from "./review-images.model";
import { RoleApiPermission } from "./role-api-permission.model";
import { RolePermissionAccessAuditLog } from "./role-permission-access-audit-log.model";
import { RolePermissionAccess } from "./role-permission-access.model";
import { RolePermission } from "./role-permission.model";
import { Role } from "./role.model";
import { SeederMeta } from "./seeder.model";
import { ShippingCharge } from "./shipping-charges.model";
import { StaticPageData } from "./static_page.model";
import { StockChangeLog } from "./stock-change-log.model";
import { StoreAddress } from "./store-address.model";
import { StudConfigProduct } from "./stud-config-product.model";
import { StudDiamonds } from "./stud-diamonds.model";
import { StudMetal } from "./stud-metals.model";
import { SubscriptionData } from "./subscription.model";
import { SystemConfiguration } from "./system-configuration.model";
import { TemplateTwoBanner } from "./template-2-banner.model";
import { TemplateEightData } from "./template-eight.model";
import { TemplateFiveData } from "./template-five.model";
import { TemplateFourData } from "./template-four.model";
import { TemplateSevenData } from "./template-seven.model";
import { TemplateSixData } from "./template-six.model";
import { TemplateThreeData } from "./template-three.model";
import { TestimonialData } from "./testimonial.model";
import { FontStyleFiles } from "./theme/font-style-files.model";
import { ThemeAttributeCustomers } from "./theme/theme-attribute-customers.model";
import { ThemeAttributes } from "./theme/theme-attributes.model";
import { Themes } from "./theme/themes.model";
import { WebConfigSetting } from "./theme/web-config-setting.model";

let modelCache = {};

export const initModels = (req: any, deleted?: boolean) => {
    const companyKey = (req?.body?.session_res?.client_key || req?.query?.company_key || req?.params?.company_key || req.body.company_key as string)
    const sequelize = req.body.db_connection ? req.body.db_connection : dbContext;

    if (modelCache[companyKey] && deleted && deleted == true) {
        delete modelCache[companyKey];
        return ''
    }
    if (modelCache[companyKey]) {
        return modelCache[companyKey];
    }

    const configuratorLogs = ConfiguratorLogs(sequelize);
    const birthstoneProductCategory = BirthstoneProductCategory(sequelize);
    const birthStoneProductDiamondOption = BirthStoneProductDiamondOption(sequelize);
    const birthstoneProductEngraving = BirthstoneProductEngraving(sequelize);
    const birthstoneProductMetalOption = BirthstoneProductMetalOption(sequelize);
    const birthStoneProduct = BirthStoneProduct(sequelize);

    const giftSetOrdersDetails = GiftSetOrdersDetails(sequelize);
    const giftSetProduct = GiftSetProduct(sequelize);
    const giftSetProductOrderTransaction = GiftSetProductOrderTransaction(sequelize);
    const giftSetProductOrder = GiftSetProductOrder(sequelize);
    const giftSetProductInvoice = GiftSetProductInvoice(sequelize);
    const giftSetProductImages = GiftSetProductImages(sequelize);

    const homeAboutSub = HomeAboutSub(sequelize);
    const homeAboutMain = HomeAboutMain(sequelize);

    const goldKarat = GoldKarat(sequelize);
    const metalGroupMaster = MetalGroupMaster(sequelize);
    const metalMaster = MetalMaster(sequelize);
    const metalTone = MetalTone(sequelize);

    const brandData = BrandData(sequelize);

    const diamondCaratSize = DiamondCaratSize(sequelize);

    const clarityData = ClarityData(sequelize);

    const collection = Collection(sequelize);

    const colors = Colors(sequelize);

    const cutsData = CutsData(sequelize);

    const diamondGroupMaster = DiamondGroupMaster(sequelize);

    const diamondShape = DiamondShape(sequelize);

    const stoneData = StoneData(sequelize);

    const headsData = HeadsData(sequelize);

    const hookTypeData = HookTypeData(sequelize);

    const lengthData = LengthData(sequelize);

    const sizeData = SizeData(sequelize);

    const mmSizeData = MMSizeData(sequelize);

    const sieveSizeData = SieveSizeData(sequelize);

    const settingCaratWeight = SettingCaratWeight(sequelize);

    const settingTypeData = SettingTypeData(sequelize);

    const shanksData = ShanksData(sequelize);

    const sideSettingStyles = SideSettingStyles(sequelize);

    const tag = Tag(sequelize);

    const cityData = CityData(sequelize);

    const countryData = CountryData(sequelize);

    const currencyData = CurrencyData(sequelize);

    const master = Master(sequelize);

    const stateData = StateData(sequelize);

    const taxMaster = TaxMaster(sequelize);

    const megaMenuAttributes = MegaMenuAttributes(sequelize);

    const megaMenus = MegaMenus(sequelize);

    const fontStyleFiles = FontStyleFiles(sequelize);

    const themeAttributeCustomers = ThemeAttributeCustomers(sequelize);
    const themes = Themes(sequelize);
    const themeAttributes = ThemeAttributes(sequelize);

    const webConfigSetting = WebConfigSetting(sequelize);

    const aboutUsData = AboutUsData(sequelize);

    const action = Action(sequelize);

    const activityLogs = ActivityLogs(sequelize);

    const userAddress = UserAddress(sequelize);

    const appUser = AppUser(sequelize);

    const banner = Banner(sequelize);

    const blogCategoryData = BlogCategoryData(sequelize);
    const blogsData = BlogsData(sequelize);

    const businessUser = BusinessUser(sequelize);

    const cartProducts = CartProducts(sequelize);

    const categoryData = CategoryData(sequelize);

    const companyInfo = CompanyInfo(sequelize);

    const configBraceletProductDiamonds = ConfigBraceletProductDiamonds(sequelize);
    const configBraceletProductMetals = ConfigBraceletProductMetals(sequelize);
    const configBraceletProduct = ConfigBraceletProduct(sequelize);

    const configCartProduct = ConfigCartProduct(sequelize);
    const configOrderDetails = ConfigOrdersDetails(sequelize);

    const configEternityProductDiamondDetails = ConfigEternityProductDiamondDetails(sequelize);
    const configEternityProductMetalDetail = ConfigEternityProductMetalDetail(sequelize);
    const configEternityProduct = ConfigEternityProduct(sequelize);

    const configProductDiamonds = ConfigProductDiamonds(sequelize);
    const configProductMetals = ConfigProductMetals(sequelize);
    const configProduct = ConfigProduct(sequelize);

    const configuratorSettingFile = ConfiguratorSettingFile(sequelize);
    const configuratorSetting = ConfiguratorSetting(sequelize);

    const couponData = CouponData(sequelize);

    const customerUser = CustomerUser(sequelize);

    const emailLogs = EamilLog(sequelize);
    const emailTemplate = EmailTemplate(sequelize);

    const enquiries = Enquiries(sequelize);

    const exceptionLogs = ExceptionLogs(sequelize);

    const FAQDataModel = FAQData(sequelize);

    const filtersData = FiltersData(sequelize);

    const image = Image(sequelize);

    const infoSection = InfoSection(sequelize);

    const invoices = Invoices(sequelize);

    const looseDiamondGroupMasters = LooseDiamondGroupMasters(sequelize);

    const menuItem = MenuItem(sequelize);

    const metaDataDetails = MetaDataDetails(sequelize);

    const ordersDetails = OrdersDetails(sequelize);
    const orderTransaction = OrderTransaction(sequelize);
    const orders = Orders(sequelize);

    const ourStory = OurStory(sequelize);

    const pageData = PageData(sequelize);

    const productWish = ProductWish(sequelize);

    const productAttributeValue = ProductAttributeValue(sequelize);

    const productBulkUploadFile = ProductBulkUploadFile(sequelize);

    const productCategory = ProductCategory(sequelize);
    const productDiamondOption = ProductDiamondOption(sequelize);
    const productEnquiries = ProductEnquiries(sequelize);
    const productImage = ProductImage(sequelize);
    const productMetalOption = ProductMetalOption(sequelize);
    const productPriceHistories = ProductPriceHistories(sequelize);
    const productReview = ProductReview(sequelize);
    const productSearchHistories = ProductSearchHistories(sequelize);
    const productVideo = ProductVideo(sequelize);
    const product = Product(sequelize);

    const reviewImages = ReviewImages(sequelize);

    const roleApiPermission = RoleApiPermission(sequelize);
    const rolePermissionAccessAuditLog = RolePermissionAccessAuditLog(sequelize);
    const rolePermissionAccess = RolePermissionAccess(sequelize);
    const rolePermission = RolePermission(sequelize);
    const role = Role(sequelize);

    const seederMeta = SeederMeta(sequelize);

    const shippingCharge = ShippingCharge(sequelize);

    const staticPageData = StaticPageData(sequelize);

    const stockChangeLog = StockChangeLog(sequelize);

    const storeAddress = StoreAddress(sequelize);

    const subscriptionData = SubscriptionData(sequelize);

    const systemConfiguration = SystemConfiguration(sequelize);

    const templateTwoBanner = TemplateTwoBanner(sequelize);

    const templateFiveData = TemplateFiveData(sequelize);

    const templateSevenData = TemplateSevenData(sequelize);

    const templateSixData = TemplateSixData(sequelize);

    const templateThreeData = TemplateThreeData(sequelize);

    const templateFourData = TemplateFourData(sequelize);

    const templateEightData = TemplateEightData(sequelize);

    const testimonialData = TestimonialData(sequelize);

    const studConfigProduct = StudConfigProduct(sequelize);

    const studMetal = StudMetal(sequelize);

    const studDiamond = StudDiamonds(sequelize);

    const configPendantProduct = ConfigPendantProduct(sequelize);
    const configPendantDiamonds = ConfigPendantDiamonds(sequelize);
    const configPendantMetals = ConfigPendantMetals(sequelize);

    const offers = Offers(sequelize);
    const offerDetails = OfferDetails(sequelize);
    const lookBook = LookBook(sequelize);
    const offerEligibleCustomers = OfferEligibleCustomers(sequelize);

    const diamondRanges = DiamondRanges(sequelize)
    const priceCorrection = PriceCorrection(sequelize)

    configPendantMetals.belongsTo(configPendantProduct, { as: "metals", foreignKey: "pendant_id" });
    configPendantMetals.belongsTo(metalMaster, { as: "metal", foreignKey: "metal_id" });
    configPendantMetals.belongsTo(goldKarat, { as: "karat", foreignKey: "karat_id" });

    configPendantDiamonds.belongsTo(configPendantProduct, { as: "diamonds", foreignKey: "pendant_id" });
    configPendantDiamonds.belongsTo(diamondShape, { as: "shape", foreignKey: "dia_shape" });
    configPendantDiamonds.belongsTo(mmSizeData, { as: "mm_size", foreignKey: "dia_mm_size" });

    configPendantProduct.belongsTo(mmSizeData, { as: "mm_size", foreignKey: "center_dia_mm_size" });
    configPendantProduct.belongsTo(diamondShape, { as: "dia_shape", foreignKey: "center_dia_shape" });
    configPendantProduct.belongsTo(diamondCaratSize, { as: "dia_wt", foreignKey: "center_dia_wt" });
    configPendantProduct.belongsTo(headsData, { as: "design", foreignKey: "design_type" });
    configPendantProduct.hasOne(configPendantDiamonds, { as: "diamonds", foreignKey: "pendant_id" });
    configPendantProduct.hasOne(configPendantMetals, { as: "metals", foreignKey: "pendant_id" });

    studDiamond.belongsTo(studConfigProduct, { as: "stud_config_product", foreignKey: "stud_id" });
    studDiamond.belongsTo(diamondShape, { as: "shape", foreignKey: "dia_shape" });
    studDiamond.belongsTo(mmSizeData, { as: "mm_size", foreignKey: "dia_mm_size" });

    studMetal.belongsTo(studConfigProduct, { as: "stud_config_product", foreignKey: "stud_id" });
    studMetal.belongsTo(metalMaster, { as: "metal", foreignKey: "metal_id" });
    studMetal.belongsTo(goldKarat, { as: "karat", foreignKey: "karat_id" });

    studConfigProduct.belongsTo(mmSizeData, { as: "mm_size", foreignKey: "center_dia_mm_size" });
    studConfigProduct.belongsTo(diamondShape, { as: "dia_shape", foreignKey: "center_dia_shape" });
    studConfigProduct.belongsTo(diamondCaratSize, { as: "dia_wt", foreignKey: "center_dia_wt" });
    studConfigProduct.belongsTo(headsData, { as: "setting", foreignKey: "setting_type" });
    studConfigProduct.belongsTo(sideSettingStyles, { as: "huggies", foreignKey: "huggies_setting_type" });

    // testimonial data  association
    testimonialData.hasOne(image, { as: "image", foreignKey: "id", sourceKey: "id_image" });

    // template three association
    templateThreeData.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    templateThreeData.hasOne(image, {
        as: "hover_image",
        foreignKey: "id",
        sourceKey: "id_hover_image",
    });
    templateThreeData.hasOne(categoryData, {
        as: "category",
        foreignKey: "id",
        sourceKey: "id_category",
    });
    templateThreeData.hasOne(collection, {
        as: "collection",
        foreignKey: "id",
        sourceKey: "id_collection",
    });
    templateThreeData.hasOne(settingTypeData, {
        as: "style",
        foreignKey: "id",
        sourceKey: "id_style",
    });
    templateThreeData.hasOne(diamondShape, {
        as: "diamond_shape",
        foreignKey: "id",
        sourceKey: "id_diamond_shape",
    });
    // template six association

    templateSixData.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    templateSixData.hasOne(image, {
        as: "mobile_image",
        foreignKey: "id",
        sourceKey: "mobile_banner_image",
    });
    templateSixData.hasOne(image, {
        as: "hover_image",
        foreignKey: "id",
        sourceKey: "id_hover_image",
    });
    templateSixData.hasOne(image, {
        as: "title_image",
        foreignKey: "id",
        sourceKey: "id_title_image",
    });
    templateSixData.hasOne(categoryData, {
        as: "category",
        foreignKey: "id",
        sourceKey: "id_category",
    });
    templateSixData.hasOne(product, {
        as: "product",
        foreignKey: "id",
        sourceKey: "id_product",
    });
    templateSixData.hasOne(collection, {
        as: "collection",
        foreignKey: "id",
        sourceKey: "id_collection",
    });
    templateSixData.hasOne(settingTypeData, {
        as: "style",
        foreignKey: "id",
        sourceKey: "id_style",
    });
    templateSixData.hasOne(diamondShape, {
        as: "diamond_shape",
        foreignKey: "id",
        sourceKey: "id_diamond_shape",
    });

    // template seven association
    templateSevenData.hasOne(image, {
        as: "bg_image",
        foreignKey: "id",
        sourceKey: "id_bg_image",
    });
    templateSevenData.hasOne(image, {
        as: "product_image",
        foreignKey: "id",
        sourceKey: "id_product_image",
    });
    templateSevenData.hasOne(image, {
        as: "title_image",
        foreignKey: "id",
        sourceKey: "id_title_image",
    });

    templateSevenData.hasOne(image, {
        as: "offer_image",
        foreignKey: "id",
        sourceKey: "id_offer_image",
    });

    templateSevenData.hasOne(categoryData, {
        as: "category",
        foreignKey: "id",
        sourceKey: "id_categories",
    });
    // template five association
    templateFiveData.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    templateFiveData.hasOne(image, {
        as: "title_image",
        foreignKey: "id",
        sourceKey: "title_id_image",
    });
    templateFiveData.hasOne(image, {
        as: "sub_image",
        foreignKey: "id",
        sourceKey: "id_sub_image",
    });
    templateFiveData.hasOne(categoryData, {
        as: "category",
        foreignKey: "id",
        sourceKey: "id_category",
    });
    templateFiveData.hasOne(collection, {
        as: "collection",
        foreignKey: "id",
        sourceKey: "id_collection",
    });
    templateFourData.hasOne(image, {
        as: "title_image",
        foreignKey: "id",
        sourceKey: "id_title_image",
    });
    // template four association
    templateFourData.hasOne(image, {
        as: "bg_image",
        foreignKey: "id",
        sourceKey: "id_bg_image",
    });
    templateFourData.hasOne(categoryData, {
        as: "category",
        foreignKey: "id",
        sourceKey: "id_categories",
    });
    // template eight association
    templateEightData.hasOne(image, {
        as: "eight_title_image",
        foreignKey: "id",
        sourceKey: "id_title_image",
    });
    // template two banner association
    templateTwoBanner.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // role permission association
    rolePermission.belongsTo(role, {
        foreignKey: "id_role",
        as: "role",
    });

    role.hasMany(rolePermission, { foreignKey: "id_role", as: "RP" });

    rolePermission.hasMany(rolePermissionAccess, {
        foreignKey: "id_role_permission",
        as: "RPA",
    });

    rolePermissionAccess.belongsTo(rolePermission, {
        foreignKey: "id_role_permission",
        as: "RP",
    });

    rolePermission.belongsTo(menuItem, {
        foreignKey: "id_menu_item",
        as: "menu_item",
    });

    menuItem.hasMany(rolePermission, { foreignKey: "id_menu_item", as: "RP" });

    // role permission access association
    rolePermissionAccess.belongsTo(action, {
        foreignKey: 'id_action',
        as: 'action', // Alias for the relationship
    });

    action.hasMany(rolePermissionAccess, {
        foreignKey: 'id_action',
    });

    // role api permission association

    roleApiPermission.belongsTo(menuItem, { as: "rap", foreignKey: "id_menu_item" })
    menuItem.hasMany(roleApiPermission, { as: "rap", foreignKey: "id_menu_item" })

    roleApiPermission.belongsTo(action, { as: "action", foreignKey: "id_action" })
    action.hasMany(roleApiPermission, { as: "action", foreignKey: "id_action" })
    // review images association

    reviewImages.belongsTo(productReview, { foreignKey: "review_id", as: "product" });

    productReview.hasMany(reviewImages, {
        foreignKey: "review_id",
        as: "product_images",
    });

    // product video association

    productVideo.belongsTo(product, { foreignKey: "id_product", as: "product" });

    product.hasMany(productVideo, {
        foreignKey: "id_product",
        as: "product_videos",
    });

    // product review association
    productReview.belongsTo(product, {
        foreignKey: "product_id",
        as: "product",
    });
    product.hasMany(productReview, {
        foreignKey: "product_id",
        as: "product_Review",
    });
    // product metal option association
    productMetalOption.belongsTo(product, {
        foreignKey: "id_product",
        as: "product",
    });
    product.hasMany(productMetalOption, {
        foreignKey: "id_product",
        as: "PMO",
    });

    productMetalOption.belongsTo(metalMaster, {
        foreignKey: "id_metal",
        as: "metal_master",
    });
    metalMaster.hasMany(productMetalOption, {
        foreignKey: "id_metal",
        as: "PMO",
    });

    productMetalOption.belongsTo(goldKarat, {
        foreignKey: "id_karat",
        as: "metal_karat",
    });
    goldKarat.hasMany(productMetalOption, {
        foreignKey: "id_karat",
        as: "PMO",
    });

    productMetalOption.belongsTo(sizeData, {
        foreignKey: "id_size",
        as: "item_size",
    });
    sizeData.hasMany(productMetalOption, {
        foreignKey: "id_size",
        as: "PMO",
    });
    productMetalOption.belongsTo(lengthData, {
        foreignKey: "id_length",
        as: "item_length",
    });
    lengthData.hasMany(productMetalOption, {
        foreignKey: "id_length",
        as: "PMO",
    });
    productMetalOption.belongsTo(metalTone, {
        foreignKey: "id_m_tone",
        as: "metal_tone",
    });
    metalTone.hasMany(productMetalOption, {
        foreignKey: "id_m_tone",
        as: "PMO",
    });
    // product image association

    productImage.belongsTo(product, { foreignKey: "id_product", as: "product" });

    product.hasMany(productImage, {
        foreignKey: "id_product",
        as: "product_images",
    });

    productImage.belongsTo(metalTone, { foreignKey: "id_metal_tone", as: "metal_tones" });

    metalTone.hasMany(productImage, {
        foreignKey: "id_metal_tone",
        as: "product_images",
    });

    // product enquiry option association

    productEnquiries.belongsTo(product, {
        foreignKey: "product_id",
        as: "product",
    });
    product.hasMany(productEnquiries, {
        foreignKey: "product_id",
        as: "product_enquiry",
    });

    // product diamond option association

    productDiamondOption.belongsTo(product, {
        foreignKey: "id_product",
        as: "product",
    });

    product.hasMany(productDiamondOption, {
        foreignKey: "id_product",
        as: "PDO",
    });

    productDiamondOption.belongsTo(settingTypeData, {
        foreignKey: "id_setting",
        as: "setting",
    });

    settingTypeData.hasMany(productDiamondOption, {
        foreignKey: "id_setting",
        as: "PDO",
    });

    productDiamondOption.belongsTo(diamondGroupMaster, {
        foreignKey: "id_diamond_group",
        as: "rate",
    });

    diamondGroupMaster.hasMany(productDiamondOption, {
        foreignKey: "id_diamond_group",
        as: "PDO",
    });

    productDiamondOption.belongsTo(stoneData, {
        foreignKey: "id_stone",
        as: "p_d_stone",
    });

    stoneData.hasMany(productDiamondOption, {
        foreignKey: "id_stone",
        as: "PDO",
    });

    productDiamondOption.belongsTo(diamondShape, {
        foreignKey: "id_shape",
        as: "p_d_shape",
    });

    diamondShape.hasMany(productDiamondOption, {
        foreignKey: "id_shape",
        as: "PDO",
    });

    productDiamondOption.belongsTo(colors, {
        foreignKey: "id_color",
        as: "p_d_color",
    });

    colors.hasMany(productDiamondOption, {
        foreignKey: "id_color",
        as: "PDO",
    });

    productDiamondOption.belongsTo(clarityData, {
        foreignKey: "id_clarity",
        as: "p_d_clarity",
    });

    clarityData.hasMany(productDiamondOption, {
        foreignKey: "id_clarity",
        as: "PDO",
    });

    productDiamondOption.belongsTo(mmSizeData, {
        foreignKey: "id_mm_size",
        as: "p_d_mm_size",
    });

    mmSizeData.hasMany(productDiamondOption, {
        foreignKey: "id_mm_size",
        as: "PDO",
    });

    productDiamondOption.belongsTo(cutsData, {
        foreignKey: "id_cut",
        as: "p_d_cut",
    });

    cutsData.hasMany(productDiamondOption, {
        foreignKey: "id_cut",
        as: "PDO",
    });
    // product attribute value
    productAttributeValue.belongsTo(product, { foreignKey: "id_product" });
    product.hasMany(productAttributeValue, { foreignKey: "id_product", as: 'PAV' });
    // product wish association
    productWish.hasOne(sizeData, {
        as: "size",
        foreignKey: "id",
        sourceKey: "id_size",
    });
    productWish.hasOne(lengthData, {
        as: "length",
        foreignKey: "id",
        sourceKey: "id_length",
    });
    productWish.hasOne(metalMaster, {
        as: "metal",
        foreignKey: "id",
        sourceKey: "id_metal",
    });
    productWish.hasOne(goldKarat, {
        as: "karat",
        foreignKey: "id",
        sourceKey: "id_karat",
    });
    productWish.hasOne(metalTone, {
        as: "metal_tone",
        foreignKey: "id",
        sourceKey: "id_metal_tone",
    });
    productWish.hasOne(metalTone, {
        as: "head_metal_tone",
        foreignKey: "id",
        sourceKey: "id_head_metal_tone",
    });
    productWish.hasOne(metalTone, {
        as: "shank_metal_tone",
        foreignKey: "id",
        sourceKey: "id_shank_metal_tone",
    });
    productWish.hasOne(metalTone, {
        as: "band_metal_tone",
        foreignKey: "id",
        sourceKey: "id_band_metal_tone",
    });
    productWish.hasOne(customerUser, {
        as: "user",
        foreignKey: "id_app_user",
        sourceKey: "user_id",
    });

    // our story association
    ourStory.hasOne(image, { as: "image", foreignKey: "id", sourceKey: "id_image" });

    // order association
    orders.belongsTo(couponData, {
        foreignKey: "coupon_id",
        as: "coupon",
    });
    orders.belongsTo(currencyData, {
        foreignKey: "currency_id",
        as: "currency",
    });
    orders.belongsTo(storeAddress, {
        foreignKey: "pickup_store_id",
        as: "store_address",
    });
    // order details association
    ordersDetails.belongsTo(product, { foreignKey: "product_id", as: "product" });

    product.hasMany(ordersDetails, {
        foreignKey: "product_id",
        as: "product_image",
    });

    ordersDetails.belongsTo(orders, {
        foreignKey: "order_id",
        as: "product_order",
    });
    orders.hasMany(ordersDetails, {
        foreignKey: "order_id",
        as: "order",
    });
    // meta data details association
    metaDataDetails.belongsTo(pageData, { foreignKey: "id_page", as: "page" });

    // menu item association
    menuItem.belongsTo(menuItem, {
        as: 'parent_menu', // Alias for the relationship
        foreignKey: 'id_parent_menu', // Column name in MenuItem that references the parent MenuItem
    });
    // loose diamond group master association

    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "availability",
        as: "availabilitys",
    });
    looseDiamondGroupMasters.belongsTo(stoneData, {
        foreignKey: "stone",
        as: "stones",
    });
    looseDiamondGroupMasters.belongsTo(diamondShape, {
        foreignKey: "shape",
        as: "shapes",
    });
    looseDiamondGroupMasters.belongsTo(colors, {
        foreignKey: "color",
        as: "colors",
    });
    looseDiamondGroupMasters.belongsTo(clarityData, {
        foreignKey: "clarity",
        as: "claritys",
    });
    looseDiamondGroupMasters.belongsTo(cutsData, {
        foreignKey: "cut_grade",
        as: "cut_grades",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "polish",
        as: "polishs",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "symmetry",
        as: "symmetrys",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "fluorescence_intensity",
        as: "fluorescence_intensitys",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "fluorescence_color",
        as: "fluorescence_colors",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "lab",
        as: "labs",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "fancy_color",
        as: "fancy_colors",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "fancy_color_intensity",
        as: "fancy_color_intensitys",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "fancy_color_overtone",
        as: "fancy_color_overtones",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "girdle_thin",
        as: "girdle_thins",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "girdle_thick",
        as: "girdle_thicks",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "girdle_condition",
        as: "girdle_conditions",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "culet_condition",
        as: "culet_conditions",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "laser_inscription",
        as: "laser_inscriptions",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "cert_comment",
        as: "cert_comments",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "country",
        as: "countrys",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "state",
        as: "states",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "city",
        as: "citys",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "time_to_location",
        as: "time_to_locations",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "parcel_stone",
        as: "parcel_stones",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "trade_show",
        as: "trade_shows",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "shade",
        as: "shades",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "center_inclusion",
        as: "center_inclusions",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "black_inclusion",
        as: "black_inclusions",
    });
    looseDiamondGroupMasters.belongsTo(brandData, {
        foreignKey: "brand",
        as: "brands",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "milky",
        as: "milkys",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "h_a",
        as: "h_as",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "bgm",
        as: "bgms",
    });
    looseDiamondGroupMasters.belongsTo(master, {
        foreignKey: "growth_type",
        as: "growth_types",
    });

    // invoice association

    orders.hasOne(invoices, { as: "invoice", foreignKey: "order_id", });
    invoices.hasOne(orders, { as: "order_invoice", foreignKey: "id", sourceKey: "order_id" });
    invoices.hasOne(orderTransaction, { as: "order_transaction", foreignKey: "id", sourceKey: "transaction_id" });

    // FAQ association

    FAQDataModel.hasOne(FAQDataModel, {
        as: "FAQ_category",
        foreignKey: "id",
        sourceKey: "id_parent",
    });
    // customer user association
    customerUser.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    customerUser.hasOne(countryData, {
        as: "country",
        foreignKey: "id",
        sourceKey: "country_id",
    });
    customerUser.belongsTo(appUser, {
        as: "app_user",
        foreignKey: "id_app_user",
    });

    appUser.hasOne(customerUser, {
        as: "customer_user",
        foreignKey: "id_app_user",
    });


    // coupon association
    couponData.belongsTo(appUser, { foreignKey: "user_id", as: "users" });
    couponData.belongsTo(appUser, { foreignKey: "created_by", as: "created_user" });

    // config setting association
    configuratorSetting.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // config setting file association
    configuratorSettingFile.hasOne(appUser, {
        as: "created_user",
        foreignKey: "id",
        sourceKey: "created_by",
    });

    configuratorSettingFile.belongsTo(configuratorSetting, {
        foreignKey: "id_config_setting",
        as: "config_setting",
    });
    configuratorSetting.hasMany(configuratorSettingFile, {
        foreignKey: "id_config_setting",
        as: "config_setting",
    });
    // config product association
    configProduct.hasOne(diamondGroupMaster, { as: "cender_diamond", foreignKey: "id", sourceKey: "center_diamond_group_id" });

    configProduct.hasOne(headsData, { as: "heads", foreignKey: "id", sourceKey: "head_type_id" });

    configProduct.hasOne(shanksData, { as: "shanks", foreignKey: "id", sourceKey: "shank_type_id" });

    configProduct.hasOne(sideSettingStyles, { as: "side_setting", foreignKey: "id", sourceKey: "side_setting_id" });
    // config product metal association

    configProductMetals.belongsTo(configProduct, {
        foreignKey: "config_product_id",
        as: "config_product",
    });
    configProduct.hasMany(configProductMetals, {
        foreignKey: "config_product_id",
        as: "CPMO",
    });
    configProductMetals.belongsTo(metalMaster, {
        foreignKey: "metal_id",
        as: "metal",
    });
    metalMaster.hasOne(configProductMetals, {
        foreignKey: "metal_id",
        as: "metal",
    });
    configProductMetals.belongsTo(goldKarat, {
        foreignKey: "karat_id",
        as: "karat",
    });
    goldKarat.hasOne(configProductMetals, {
        foreignKey: "karat_id",
        as: "karat",
    });
    // config product diamond association

    configProductDiamonds.belongsTo(configProduct, {
        foreignKey: "config_product_id",
        as: "config_product",
    });
    configProduct.hasMany(configProductDiamonds, {
        foreignKey: "config_product_id",
        as: "CPDO",
    });
    configProductDiamonds.belongsTo(diamondGroupMaster, {
        foreignKey: "id_diamond_group",
        as: "side_diamonds",
    });
    diamondGroupMaster.hasOne(configProductDiamonds, {
        foreignKey: "id_diamond_group",
        as: "side_diamonds",
    });

    configProductDiamonds.hasOne(diamondShape, {
        as: "shape",
        foreignKey: "id",
        sourceKey: "dia_shape",
    });
    configProductDiamonds.hasOne(colors, {
        as: "color",
        foreignKey: "id",
        sourceKey: "dia_color",
    });
    configProductDiamonds.hasOne(clarityData, {
        as: "clarity",
        foreignKey: "id",
        sourceKey: "dia_clarity",
    });
    configProductDiamonds.hasOne(stoneData, {
        as: "stone",
        foreignKey: "id",
        sourceKey: "dia_stone",
    });
    configProductDiamonds.hasOne(cutsData, {
        as: "cuts",
        foreignKey: "id",
        sourceKey: "dia_cuts",
    });
    configProductDiamonds.hasOne(mmSizeData, {
        as: "mm_size",
        foreignKey: "id",
        sourceKey: "dia_mm_size",
    });
    // config order details association
    configOrderDetails.belongsTo(orders, {
        foreignKey: "order_id",
        as: "config_product_order",
    });
    orders.hasMany(configOrderDetails, {
        foreignKey: "order_id",
        as: "config_order",
    });
    // config eternity product
    configEternityProduct.belongsTo(diamondGroupMaster, {
        foreignKey: "diamond_group_id",
        as: "DiamondGroupMaster",
    });

    configEternityProduct.hasOne(clarityData, {
        as: "diamond_clarity",
        foreignKey: "id",
        sourceKey: "dia_clarity_id",
    });

    configEternityProduct.hasOne(colors, {
        as: "diamond_color",
        foreignKey: "id",
        sourceKey: "dia_color",
    });

    configEternityProduct.hasOne(diamondShape, {
        as: "diamond_shape",
        foreignKey: "id",
        sourceKey: "dia_shape_id",
    });

    configEternityProduct.hasOne(cutsData, {
        as: "diamond_cut",
        foreignKey: "id",
        sourceKey: "dia_cut_id",
    });

    configEternityProduct.hasOne(cutsData, {
        as: "diamond_size",
        foreignKey: "id",
        sourceKey: "dia_cts",
    });

    configEternityProduct.hasOne(sideSettingStyles, {
        as: "side_setting",
        foreignKey: "id",
        sourceKey: "side_setting_id",
    });
    // config eternity product metal association
    configEternityProduct.hasOne(configEternityProductMetalDetail, {
        foreignKey: "config_eternity_id",
        as: "metal",
    });

    configEternityProductMetalDetail.belongsTo(configEternityProduct, {
        foreignKey: "config_eternity_id",
        as: "metal",
    });

    configEternityProductMetalDetail.belongsTo(metalMaster, {
        foreignKey: "metal_id",
        as: "MetalMaster",
    });

    configEternityProductMetalDetail.belongsTo(goldKarat, {
        foreignKey: "karat_id",
        as: "KaratMaster",
    });
    // config eternity product diamond association

    configEternityProduct.hasOne(configEternityProductDiamondDetails, {
        foreignKey: "config_eternity_product_id",
        as: "diamonds",
    });

    configEternityProductDiamondDetails.belongsTo(configEternityProduct, {
        foreignKey: "config_eternity_product_id",
        as: "diamonds",
    });

    configEternityProductDiamondDetails.belongsTo(diamondGroupMaster, {
        foreignKey: "id_diamond_group",
        as: "DiamondGroup",
    });

    configEternityProductDiamondDetails.hasOne(diamondShape, {
        as: "shape",
        foreignKey: "id",
        sourceKey: "dia_shape",
    });
    configEternityProductDiamondDetails.hasOne(colors, {
        as: "color",
        foreignKey: "id",
        sourceKey: "dia_color",
    });
    configEternityProductDiamondDetails.hasOne(clarityData, {
        as: "clarity",
        foreignKey: "id",
        sourceKey: "dia_clarity",
    });
    configEternityProductDiamondDetails.hasOne(stoneData, {
        as: "stone",
        foreignKey: "id",
        sourceKey: "dia_stone",
    });
    configEternityProductDiamondDetails.hasOne(cutsData, {
        as: "cuts",
        foreignKey: "id",
        sourceKey: "dia_cuts",
    });
    configEternityProductDiamondDetails.hasOne(diamondCaratSize, {
        as: "carat",
        foreignKey: "id",
        sourceKey: "dia_cts",
    });
    // config cart product association

    configCartProduct.belongsTo(configProduct, {
        foreignKey: "product_id",
        as: "config_product",
    });
    configProduct.hasMany(configCartProduct, {
        foreignKey: "product_id",
        as: "config_product_cart",
    });

    configCartProduct.belongsTo(appUser, {
        foreignKey: "user_id",
        as: "user",
    });
    appUser.hasMany(configCartProduct, {
        foreignKey: "user_id",
        as: "user_detail",
    });

    // config bracelet product association

    configBraceletProduct.hasOne(sideSettingStyles, {
        as: "side_setting",
        foreignKey: "id",
        sourceKey: "setting_type",
    });
    configBraceletProduct.hasOne(hookTypeData, {
        as: "hook",
        foreignKey: "id",
        sourceKey: "hook_type",
    });
    configBraceletProduct.hasOne(lengthData, {
        as: "length",
        foreignKey: "id",
        sourceKey: "product_length",
    });
    configBraceletProduct.hasOne(diamondCaratSize, {
        as: "diamond_total_wt",
        foreignKey: "id",
        sourceKey: "dia_total_wt",
    });

    // config bracelet product metals association
    configBraceletProduct.hasOne(configBraceletProductMetals, {
        foreignKey: "config_product_id",
        as: "config_product_metal_details",
    });

    configBraceletProductMetals.belongsTo(configBraceletProduct, {
        foreignKey: "config_product_id",
        as: "config_product_metal_details",
    });

    configBraceletProductMetals.belongsTo(metalMaster, {
        foreignKey: "id_metal",
        as: "metal_detail",
    });

    configBraceletProductMetals.belongsTo(goldKarat, {
        foreignKey: "id_karat",
        as: "karat_detail",
    });
    // config bracelet product diamonds association

    configBraceletProduct.hasMany(configBraceletProductDiamonds, {
        foreignKey: "config_product_id",
        as: "config_product_diamond_details",
    });

    configBraceletProductDiamonds.belongsTo(configBraceletProduct, {
        foreignKey: "config_product_id",
        as: "config_product_diamond_details",
    });

    configBraceletProductDiamonds.belongsTo(diamondGroupMaster, {
        foreignKey: "id_diamond_group_master",
        as: "diamond_group_master",
    });
    configBraceletProductDiamonds.hasOne(diamondCaratSize, {
        as: "carat",
        foreignKey: "id",
        sourceKey: "id_carat",
    });
    configBraceletProductDiamonds.hasOne(diamondShape, {
        as: "shape",
        foreignKey: "id",
        sourceKey: "id_shape",
    });
    configBraceletProductDiamonds.hasOne(colors, {
        as: "color",
        foreignKey: "id",
        sourceKey: "id_color",
    });
    configBraceletProductDiamonds.hasOne(clarityData, {
        as: "clarity",
        foreignKey: "id",
        sourceKey: "id_clarity",
    });
    configBraceletProductDiamonds.hasOne(stoneData, {
        as: "stone",
        foreignKey: "id",
        sourceKey: "id_stone",
    });
    configBraceletProductDiamonds.hasOne(cutsData, {
        as: "cuts",
        foreignKey: "id",
        sourceKey: "id_cut",
    });

    configBraceletProductDiamonds.hasOne(mmSizeData, {
        as: "mm_size",
        foreignKey: "id",
        sourceKey: "id_mm_size",
    });

    // company info association
    companyInfo.hasOne(image, {
        as: "dark_image",
        foreignKey: "id",
        sourceKey: "dark_id_image",
    });
    companyInfo.hasOne(image, {
        as: "light_image",
        foreignKey: "id",
        sourceKey: "light_id_image",
    });
    companyInfo.hasOne(image, {
        as: "favicon",
        foreignKey: "id",
        sourceKey: "favicon_image",
    });
    companyInfo.hasOne(image, {
        as: "loader",
        foreignKey: "id",
        sourceKey: "loader_image",
    });

    companyInfo.hasOne(image, {
        as: "mail_logo",
        foreignKey: "id",
        sourceKey: "mail_tem_logo",
    });

    companyInfo.hasOne(image, {
        as: "default",
        foreignKey: "id",
        sourceKey: "default_image",
    });

    companyInfo.hasOne(image, {
        as: "page_not_image",
        foreignKey: "id",
        sourceKey: "page_not_found_image",
    });

    companyInfo.hasOne(image, {
        as: "share_images",
        foreignKey: "id",
        sourceKey: "share_image",
    });

    companyInfo.hasOne(image, {
        as: "product_not_images",
        foreignKey: "id",
        sourceKey: "product_not_found_image",
    });

    companyInfo.hasOne(image, {
        as: "order_not_images",
        foreignKey: "id",
        sourceKey: "order_not_found_image",
    });
    // category association

    categoryData.hasOne(image, { as: "image", foreignKey: "id", sourceKey: "id_image" });
    categoryData.belongsTo(categoryData, { as: "parent_category", foreignKey: "parent_id" });
    categoryData.hasMany(categoryData, { as: "sub_category", foreignKey: "parent_id" });

    // cart product association

    cartProducts.belongsTo(product, {
        foreignKey: "product_id",
        as: "product",
    });
    product.hasMany(cartProducts, {
        foreignKey: "product_id",
        as: "product_cart",
    });

    cartProducts.belongsTo(appUser, {
        foreignKey: "user_id",
        as: "users",
    });
    appUser.hasMany(cartProducts, {
        foreignKey: "user_id",
        as: "users_details",
    });

    // business user association

    businessUser.belongsTo(appUser, { foreignKey: "id_app_user", as: "b_app_user" });
    appUser.hasOne(businessUser, {
        foreignKey: "id_app_user",
        as: "business_users",
    });

    businessUser.belongsTo(image, { foreignKey: "id_image", as: "b_image" });
    image.hasOne(businessUser, { foreignKey: "id_image", as: "b_image" });

    // blog association
    blogsData.hasOne(image, {
        as: "banner_image",
        foreignKey: "id",
        sourceKey: "id_banner_image",
    });
    blogsData.hasOne(image, {
        as: "blog_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    blogsData.hasOne(blogCategoryData, {
        as: "category",
        foreignKey: "id",
        sourceKey: "id_category",
    });
    // banner association
    banner.hasOne(image, { as: "banner_image", foreignKey: "id", sourceKey: "id_image" });
    banner.hasOne(image, { as: "banner_bg_image", foreignKey: "id", sourceKey: "id_bg_image" });

    // app user association
    appUser.belongsTo(role, { foreignKey: "id_role", as: "role" });
    role.hasMany(appUser, { foreignKey: "id_role", as: "role_app_user" });
    // user address association
    userAddress.belongsTo(cityData, { foreignKey: "city_id", as: "city" });
    userAddress.belongsTo(stateData, { foreignKey: "state_id", as: "state" });
    userAddress.belongsTo(countryData, { foreignKey: "country_id", as: "country" });
    // activity logs association
    activityLogs.belongsTo(appUser, {
        foreignKey: 'created_by',
        as: 'User'
    });
    // about us association
    aboutUsData.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // theme association
    themes.belongsTo(image, { foreignKey: "id_image", as: "image" });

    // them attributes association
    themeAttributes.belongsTo(themes, {
        foreignKey: "id_theme",
        as: "attributes",
    });
    themes.hasMany(themeAttributes, {
        foreignKey: "id_theme",
        as: "attributes",
    });

    // mega menu attributes association
    megaMenuAttributes.hasOne(image, {
        as: "menu_att_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });

    megaMenuAttributes.hasOne(categoryData, {
        as: "category",
        foreignKey: "id",
        sourceKey: "id_category",
    });
    megaMenuAttributes.hasOne(collection, {
        as: "collection",
        foreignKey: "id",
        sourceKey: "id_collection",
    });
    megaMenuAttributes.hasOne(settingTypeData, {
        as: "style",
        foreignKey: "id",
        sourceKey: "id_setting_type",
    });
    megaMenuAttributes.hasOne(diamondShape, {
        as: "diamond_shape",
        foreignKey: "id",
        sourceKey: "id_diamond_shape",
    });
    megaMenuAttributes.hasOne(brandData, {
        as: "brand",
        foreignKey: "id",
        sourceKey: "id_brand",
    });
    megaMenuAttributes.hasOne(metalMaster, {
        as: "menu_att_metal",
        foreignKey: "id",
        sourceKey: "id_metal",
    });
    megaMenuAttributes.hasOne(metalTone, {
        as: "menu_att_metal_tone",
        foreignKey: "id",
        sourceKey: "id_metal_tone",
    });
    megaMenuAttributes.hasOne(pageData, {
        as: "page",
        foreignKey: "id",
        sourceKey: "id_page",
    });
    megaMenuAttributes.hasOne(staticPageData, {
        as: "static_pages",
        foreignKey: "id",
        sourceKey: "id_static_page",
    });
    megaMenuAttributes.belongsTo(megaMenus, {
        foreignKey: "id_menu",
        as: "menus",
    });
    megaMenus.hasMany(megaMenuAttributes, {
        foreignKey: "id_menu",
        as: "menu_attributes",
    });
    // master association
    master.belongsTo(image, { foreignKey: "id_image", as: "image" });

    // shank association

    shanksData.hasOne(image, {
        as: "shank_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // side setting styles association

    sideSettingStyles.hasOne(image, {
        as: "side_setting_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // setting type association

    settingTypeData.hasOne(image, {
        as: "setting_type_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // hook type association

    hookTypeData.hasOne(image, {
        as: "hook_type_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // stone association

    stoneData.hasOne(image, {
        as: "stone_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });

    // head association
    headsData.hasOne(image, {
        as: "head_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // diamond shape association
    diamondShape.hasOne(image, {
        as: "diamond_shape_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    // diamond group master association

    diamondGroupMaster.hasOne(image, {
        as: "image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    diamondGroupMaster.hasOne(stoneData, {
        as: "stones",
        foreignKey: "id",
        sourceKey: "id_stone",
    });
    diamondGroupMaster.hasOne(mmSizeData, {
        as: "mm_size",
        foreignKey: "id",
        sourceKey: "id_mm_size",
    });
    diamondGroupMaster.hasOne(clarityData, {
        as: "clarity",
        foreignKey: "id",
        sourceKey: "id_clarity",
    });
    diamondGroupMaster.hasOne(colors, {
        as: "colors",
        foreignKey: "id",
        sourceKey: "id_color",
    });
    diamondGroupMaster.hasOne(cutsData, {
        as: "cuts",
        foreignKey: "id",
        sourceKey: "id_cuts",
    });
    diamondGroupMaster.hasOne(diamondCaratSize, {
        as: "carats",
        foreignKey: "id",
        sourceKey: "id_carat",
    });
    diamondGroupMaster.hasOne(sieveSizeData, {
        as: "seive_size",
        foreignKey: "id",
        sourceKey: "id_seive_size",
    });

    diamondGroupMaster.belongsTo(diamondShape, {
        foreignKey: "id_shape",
        as: "shapes",
    });

    diamondShape.hasMany(diamondGroupMaster, {
        foreignKey: "id_shape",
        as: "diamond_shapes",
    });

    // collection association

    collection.belongsTo(categoryData, {
        foreignKey: "id_category",
        as: "category",
    });

    // diamond carat association

    diamondCaratSize.hasOne(image, {
        as: "diamond_carat_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });

    // metal group master association

    metalGroupMaster.belongsTo(metalMaster, {
        foreignKey: "id_metal",
        as: "metal_group_metal",
    });
    metalMaster.hasMany(metalGroupMaster, {
        foreignKey: "id_metal",
        as: "Metal_masters",
    });

    metalGroupMaster.belongsTo(goldKarat, { foreignKey: "id_kt", as: "KT" });
    // metal tone association

    metalTone.hasOne(image, {
        as: "metal_tone_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });

    // gold karat association
    goldKarat.hasOne(image, {
        as: "karat_image",
        foreignKey: "id",
        sourceKey: "id_image",
    });
    goldKarat.belongsTo(metalMaster, {
        as: "metals",
        foreignKey: "id",
        sourceKey: "id_metal",
    });
    // home about sub association
    homeAboutSub.hasOne(image, { as: "image", foreignKey: "id", sourceKey: "id_image" });

    // gift set product association

    giftSetProduct.hasOne(brandData, { as: "brands", foreignKey: "id", sourceKey: "brand_id" });

    // gift set product invoice association
    giftSetProductInvoice.belongsTo(giftSetProductOrder, {
        foreignKey: "order_id",
        as: "gift_set_order_invoice",
    });
    giftSetProductOrder.hasMany(giftSetProductInvoice, {
        foreignKey: "order_id",
        as: "gift_set_invoice",
    });

    // gift set product image association
    giftSetProductImages.belongsTo(giftSetProduct, { foreignKey: "id_product", as: "gift_product" });

    giftSetProduct.hasMany(giftSetProductImages, {
        foreignKey: "id_product",
        as: "gift_product_images",
    });
    // gift set product order details association

    giftSetOrdersDetails.belongsTo(giftSetProduct, { foreignKey: "product_id", as: "product" });

    giftSetProduct.hasMany(giftSetOrdersDetails, {
        foreignKey: "product_id",
        as: "gift_set_product_images",
    });

    giftSetOrdersDetails.belongsTo(giftSetProductOrder, {
        foreignKey: "order_id",
        as: "gift_product_order",
    });
    giftSetProductOrder.hasMany(giftSetOrdersDetails, {
        foreignKey: "order_id",
        as: "gift_order",
    });

    // birthstone product category association
    birthstoneProductCategory.belongsTo(birthStoneProduct, {
        foreignKey: "id_product",
        as: "product",
    });

    birthStoneProduct.hasMany(birthstoneProductCategory, {
        foreignKey: "id_product",
        as: "birth_stone_product_categories",
    });

    birthstoneProductCategory.belongsTo(categoryData, {
        foreignKey: "id_category",
        as: "category",
    });

    birthstoneProductCategory.belongsTo(categoryData, {
        foreignKey: "id_sub_category",
        as: "sub_category",
    });

    birthstoneProductCategory.belongsTo(categoryData, {
        foreignKey: "id_sub_sub_category",
        as: "sub_sub_category",
    });

    // birthstone product engraving association
    birthstoneProductEngraving.belongsTo(birthStoneProduct, {
        foreignKey: "id_product",
        as: "product",
    });

    birthStoneProduct.hasMany(birthstoneProductEngraving, {
        foreignKey: "id_product",
        as: "engravings",
    });

    // birthstone product metal option association
    birthstoneProductMetalOption.belongsTo(birthStoneProduct, {
        foreignKey: "id_product",
        as: "product",
    });
    birthStoneProduct.hasMany(birthstoneProductMetalOption, {
        foreignKey: "id_product",
        as: "birthstone_PMO",
    });

    birthstoneProductMetalOption.belongsTo(metalMaster, {
        foreignKey: "id_metal",
        as: "metal_master",
    });
    metalMaster.hasMany(birthstoneProductMetalOption, {
        foreignKey: "id_metal",
        as: "birthstone_PMO",
    });

    birthstoneProductMetalOption.belongsTo(goldKarat, {
        foreignKey: "id_karat",
        as: "metal_karat",
    });
    goldKarat.hasMany(birthstoneProductMetalOption, {
        foreignKey: "id_karat",
        as: "birthstone_PMO",
    });

    // birthstone product diamond option association
    birthStoneProductDiamondOption.belongsTo(birthStoneProduct, {
        foreignKey: "id_product",
        as: "product",
    });

    birthStoneProduct.hasMany(birthStoneProductDiamondOption, {
        foreignKey: "id_product",
        as: "birthstone_PDO",
    });

    birthStoneProductDiamondOption.belongsTo(diamondGroupMaster, {
        foreignKey: "id_diamond_group",
        as: "bs_diamond_group",
    });

    diamondGroupMaster.hasMany(birthStoneProductDiamondOption, {
        foreignKey: "id_diamond_group",
        as: "birthstone_PDO",
    });

    // birthstone product association
    birthStoneProduct.hasOne(image, { as: "image", foreignKey: "id", sourceKey: "product_image" });

    // product association
    product.belongsTo(product, {
        foreignKey: "parent_id",
        as: "parent_product",
    });
    product.belongsTo(brandData, { foreignKey: "id_brand", as: "brands" });

    // product category association
    productCategory.belongsTo(product, {
        foreignKey: "id_product",
        as: "product",
    });

    product.hasMany(productCategory, {
        foreignKey: "id_product",
        as: "product_categories",
    });

    productCategory.belongsTo(categoryData, {
        foreignKey: "id_category",
        as: "category",
    });

    productCategory.belongsTo(categoryData, {
        foreignKey: "id_sub_category",
        as: "sub_category",
    });

    productCategory.belongsTo(categoryData, {
        foreignKey: "id_sub_sub_category",
        as: "sub_sub_category",
    });
    modelCache[companyKey] = {
        ConfiguratorLogs: configuratorLogs,
        BirthstoneProductCategory: birthstoneProductCategory,
        BirthStoneProductDiamondOption: birthStoneProductDiamondOption,
        BirthstoneProductEngraving: birthstoneProductEngraving,
        BirthstoneProductMetalOption: birthstoneProductMetalOption,
        BirthStoneProduct: birthStoneProduct,
        GiftSetOrdersDetails: giftSetOrdersDetails,
        GiftSetProduct: giftSetProduct,
        GiftSetProductOrderTransaction: giftSetProductOrderTransaction,
        GiftSetProductOrder: giftSetProductOrder,
        GiftSetProductInvoice: giftSetProductInvoice,
        GiftSetProductImages: giftSetProductImages,
        HomeAboutSub: homeAboutSub,
        HomeAboutMain: homeAboutMain,
        GoldKarat: goldKarat,
        MetalGroupMaster: metalGroupMaster,
        MetalMaster: metalMaster,
        MetalTone: metalTone,
        BrandData: brandData,
        DiamondCaratSize: diamondCaratSize,
        ClarityData: clarityData,
        Collection: collection,
        Colors: colors,
        CutsData: cutsData,
        DiamondGroupMaster: diamondGroupMaster,
        DiamondShape: diamondShape,
        StoneData: stoneData,
        HeadsData: headsData,
        HookTypeData: hookTypeData,
        LengthData: lengthData,
        SizeData: sizeData,
        MMSizeData: mmSizeData,
        SieveSizeData: sieveSizeData,
        SettingCaratWeight: settingCaratWeight,
        SettingTypeData: settingTypeData,
        ShanksData: shanksData,
        SideSettingStyles: sideSettingStyles,
        Tag: tag,
        CityData: cityData,
        CountryData: countryData,
        CurrencyData: currencyData,
        Master: master,
        StateData: stateData,
        TaxMaster: taxMaster,
        MegaMenuAttributes: megaMenuAttributes,
        MegaMenus: megaMenus,
        FontStyleFiles: fontStyleFiles,
        ThemeAttributeCustomers: themeAttributeCustomers,
        Themes: themes,
        ThemeAttributes: themeAttributes,
        WebConfigSetting: webConfigSetting,
        AboutUsData: aboutUsData,
        Action: action,
        ActivityLogs: activityLogs,
        UserAddress: userAddress,
        AppUser: appUser,
        Banner: banner,
        BlogCategoryData: blogCategoryData,
        BlogsData: blogsData,
        BusinessUser: businessUser,
        CartProducts: cartProducts,
        CategoryData: categoryData,
        CompanyInfo: companyInfo,
        ConfigBraceletProductDiamonds: configBraceletProductDiamonds,
        ConfigBraceletProductMetals: configBraceletProductMetals,
        ConfigBraceletProduct: configBraceletProduct,
        ConfigCartProduct: configCartProduct,
        ConfigOrdersDetails: configOrderDetails,
        ConfigEternityProductDiamondDetails: configEternityProductDiamondDetails,
        ConfigEternityProductMetalDetail: configEternityProductMetalDetail,
        ConfigEternityProduct: configEternityProduct,
        ConfigProductDiamonds: configProductDiamonds,
        ConfigProductMetals: configProductMetals,
        ConfigProduct: configProduct,
        ConfiguratorSettingFile: configuratorSettingFile,
        ConfiguratorSetting: configuratorSetting,
        CouponData: couponData,
        CustomerUser: customerUser,
        EamilLog: emailLogs,
        EmailTemplate: emailTemplate,
        Enquiries: enquiries,
        ExceptionLogs: exceptionLogs,
        FAQData: FAQDataModel,
        FiltersData: filtersData,
        Image: image,
        InfoSection: infoSection,
        Invoices: invoices,
        LooseDiamondGroupMasters: looseDiamondGroupMasters,
        MenuItem: menuItem,
        MetaDataDetails: metaDataDetails,
        OrdersDetails: ordersDetails,
        OrderTransaction: orderTransaction,
        Orders: orders,
        OurStory: ourStory,
        Offers: offers,
        OfferDetails: offerDetails,
        PageData: pageData,
        ProductWish: productWish,
        ProductAttributeValue: productAttributeValue,
        ProductBulkUploadFile: productBulkUploadFile,
        ProductCategory: productCategory,
        ProductDiamondOption: productDiamondOption,
        ProductEnquiries: productEnquiries,
        ProductImage: productImage,
        ProductMetalOption: productMetalOption,
        ProductPriceHistories: productPriceHistories,
        ProductReview: productReview,
        ProductSearchHistories: productSearchHistories,
        ProductVideo: productVideo,
        Product: product,
        ReviewImages: reviewImages,
        RoleApiPermission: roleApiPermission,
        RolePermissionAccessAuditLog: rolePermissionAccessAuditLog,
        RolePermissionAccess: rolePermissionAccess,
        RolePermission: rolePermission,
        Role: role,
        SeederMeta: seederMeta,
        ShippingCharge: shippingCharge,
        StaticPageData: staticPageData,
        StockChangeLog: stockChangeLog,
        StoreAddress: storeAddress,
        SubscriptionData: subscriptionData,
        SystemConfiguration: systemConfiguration,
        TemplateTwoBanner: templateTwoBanner,
        TemplateFiveData: templateFiveData,
        TemplateSevenData: templateSevenData,
        TemplateSixData: templateSixData,
        TemplateThreeData: templateThreeData,
        TestimonialData: testimonialData,
        StudConfigProduct: studConfigProduct,
        StudMetal: studMetal,
        StudDiamonds: studDiamond,
        TemplateFourData: templateFourData,
        LookBook: lookBook,
        OfferEligibleCustomers: offerEligibleCustomers,
        ConfigPendantProduct: configPendantProduct,
        ConfigPendantDiamonds: configPendantDiamonds,
        ConfigPendantMetals: configPendantMetals,
        DiamondRanges: diamondRanges,
        TemplateEightData:templateEightData,
        PriceCorrection: priceCorrection
    };

    return modelCache[companyKey];
}
