import { Request } from "express";
import {
  ActiveStatus,
  AllProductTypes,
  COUPON_DISCOUNT_TYPE,
  COUPON_DURATION,
  DeletedStatus,
  LogsActivityType,
  LogsType,
  Pagination,
  SingleProductType,
} from "../../utils/app-enumeration";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  resBadRequest,
  resErrorDataExit,
  resNotFound,
  resSuccess,
  resUnknownError,
  statusUpdateValue,
} from "../../utils/shared-functions";
import {
  COUPON_CODE_EXISTS,
  COUPON_EXPIRED,
  COUPON_EXPIRED_MESSAGE,
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_AMOUNT_INVALID,
  ERROR_AMOUNT_NEGATIVE,
  ERROR_ONLY_LOGGED_IN_USERS_CAN_USE_COUPON_CODE,
  INVALID_COUPON_TYPE_MESSAGE,
  MaX_REQUIRED_AMOUNT_ERROR,
  MIN_REQUIRED_AMOUNT_ERROR,
  RECORD_DELETE_SUCCESSFULLY,
  RECORD_UPDATE_SUCCESSFULLY,
  USER_APPLY_ONLY_ONE_TIME_ERROR,
  USER_LIMIT_APPLY_ONLY_ONE_TIME_ERROR,
} from "../../utils/app-messages";
import { Op, Sequelize } from "sequelize";
import { IQueryPagination } from "../../data/interfaces/common/common.interface";
import { initModels } from "../model/index.model";


export const addCoupon = async (req: Request) => {
  try {
    const {
      name,
      coupon_code,
      discount_type,
      description,
      percentage_off = null,
      discount_amount = null,
      duration,
      start_date,
      end_date,
      max_total_amount = null,
      min_total_amount = 0,
      maximum_discount_amount,
      usage_limit,
      user_limits,
    } = req.body;
    const {CouponData} = initModels(req);
    const couponCode = coupon_code.toUpperCase().replace(/\s/g, "");

    let records: any = {
      name,
      description,
      coupon_code: couponCode,
      discount_type,
      percentage_off,
      discount_amount,
      duration,
      usage_limit,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      max_total_amount,
      min_total_amount,
      maximum_discount_amount,
      is_active: ActiveStatus.Active,
      is_deleted: DeletedStatus.No,
      created_date: getLocalDate(),
      created_by: req.body?.session_res?.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      user_limits: user_limits,
    };

    const findCoupon = await CouponData.findOne({
      where: { coupon_code: couponCode, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (findCoupon && findCoupon.dataValues) {
      return resErrorDataExit({
        message: COUPON_CODE_EXISTS,
      });
    }
    const coupon = await CouponData.create(records);
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: null,
        new_data: {
          coupon_id: coupon?.dataValues?.id, data: {
            ...coupon?.dataValues
          }
        }
      }], coupon?.dataValues?.id, LogsActivityType.Add, LogsType.Coupon, req?.body?.session_res?.id_app_user)
    
    return resSuccess();
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const editCoupon = async (req: Request) => {
  try {
    const {
      name,
      coupon_code,
      discount_type,
      percentage_off = null,
      discount_amount = null,
      duration,
      start_date,
      end_date,
      description,
      min_total_amount,
      max_total_amount = null,
      maximum_discount_amount,
      usage_limit,
      user_limits,
    } = req.body;
    const { id } = req.params;
    const {CouponData} = initModels(req);
    const findCoupon = await CouponData.findOne({
      where: {
        id: id,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }

    const couponCode = coupon_code.toUpperCase().replace(/\s/g, "");

    const findCouponCode = await CouponData.findOne({
      where: {
        coupon_code: couponCode,
        is_deleted: DeletedStatus.No,
        id: { [Op.ne]: req.params.id },
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (findCouponCode && findCouponCode.dataValues) {
      return resErrorDataExit({
        message: COUPON_CODE_EXISTS,
      });
    }

    let records: any = {
      name,
      coupon_code: couponCode,
      discount_type,
      percentage_off,
      discount_amount,
      duration,
      usage_limit,
      start_date,
      end_date,
      description,
      min_total_amount,
      max_total_amount,
      maximum_discount_amount,
      user_limits,
      updated_date: getLocalDate(),
      updated_by: req.body?.session_res?.id_app_user,
    };

    await CouponData.update(records, {
      where: {
        id: id,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    const afterUpdatefindCoupon = await CouponData.findOne({
      where: {
        id: id,
        is_deleted: DeletedStatus.No,
      },
    });

    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { coupon_id: findCoupon?.dataValues?.id, data: {...findCoupon?.dataValues}},
      new_data: {
        coupon_id: afterUpdatefindCoupon?.dataValues?.id, data: { ...afterUpdatefindCoupon?.dataValues }
      }
    }], findCoupon?.dataValues?.id,LogsActivityType.Edit, LogsType.Coupon, req?.body?.session_res?.id_app_user)
  
    return resSuccess({ message: RECORD_UPDATE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const getCoupons = async (req: Request) => {
  try {
    const {CouponData,AppUser} = initModels(req);
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
          { name: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { coupon_code: { [Op.iLike]: "%" + pagination.search_text + "%" } },
          { description: { [Op.iLike]: "%" + pagination.search_text + "%" } },
        ],
        is_deleted: DeletedStatus.No,
      },
    ];
    if (!noPagination) {
      const totalItems = await CouponData.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);
    }
    const result = await CouponData.findAll({
      where,
      limit: pagination.per_page_rows,
      offset: (pagination.current_page - 1) * pagination.per_page_rows,
      order: [[pagination.sort_by, pagination.order_by]],
      attributes: [
        "id",
        "name",
        "coupon_code",
        "description",
        "discount_type",
        "percentage_off",
        "discount_amount",
        "duration",
        "usage_limit",
        "min_total_amount",
        "max_total_amount",
        "maximum_discount_amount",
        "start_date",
        "end_date",
        "user_id",
        "is_active",
        "max_total_amount",
        "user_limits",
        [Sequelize.literal("created_user.username"), "created_user_name"],
      ],
      include: [{ model: AppUser, as: "created_user", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id},required:false }],
    });
    return resSuccess({ data: noPagination ? result : { pagination, result } });
  } catch (error) {
    throw error;
  }
};

export const deleteCoupon = async (req: Request) => {
  try {
    const {CouponData} = initModels(req);
    const findCoupon = await CouponData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }
    await CouponData.update(
      {
        is_deleted: DeletedStatus.yes,
        deleted_by: req.body.session_res.id_app_user,
        deleted_date: getLocalDate(),
      },
      { where: { id: findCoupon.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { coupon_id: findCoupon?.dataValues?.id, data: {...findCoupon?.dataValues}},
      new_data: {
        coupon_id: findCoupon?.dataValues?.id, data: {
          ...findCoupon?.dataValues, is_deleted: DeletedStatus.yes,
          modified_by: req?.body?.session_res?.id_app_user,
          modified_date: getLocalDate(),
        }
      }
    }], findCoupon?.dataValues?.id, LogsActivityType.Delete, LogsType.Coupon, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const statusUpdateForCoupon = async (req: Request) => {
  try {
    const {CouponData} = initModels(req);
    const findCoupon = await CouponData.findOne({
      where: { id: req.params.id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
    });

    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }
    await CouponData.update(
      {
        is_active: statusUpdateValue(findCoupon),
        updated_date: getLocalDate(),
        updated_by: req.body.session_res.id_app_user,
      },
      { where: { id: findCoupon.dataValues.id,company_info_id :req?.body?.session_res?.client_id } }
    );
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
      old_data: { coupon_id: findCoupon?.dataValues?.id, data: {...findCoupon?.dataValues}},
      new_data: {
        coupon_id: findCoupon?.dataValues?.id, data: {
          ...findCoupon?.dataValues, is_active: statusUpdateValue(findCoupon),
          modified_date: getLocalDate(),
          modified_by: req?.body?.session_res?.id_app_user,
        }
      }
    }], findCoupon?.dataValues?.id, LogsActivityType.StatusUpdate, LogsType.Coupon, req?.body?.session_res?.id_app_user)
    
    return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
  } catch (error) {
    throw error;
  }
};

export const applyCoupon = async (req: Request) => {
  const { coupon_code, currency } = req.body;
  // Function to apply coupon
  try {
    const {CouponData,CartProducts} = initModels(req);
    let discount = 0;
    let discountedAmount = 0;
    let cartProductList = [];
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    if (
      req.body.session_res.id_app_user &&
      req.body.session_res.id_app_user != null
    ) {
      cartProductList = await CartProducts.findAll({
        where: { user_id: req.body.session_res.id_app_user,company_info_id:company_info_id?.data },
        order: [["created_date", "DESC"]],
        attributes: [
          "id",
          "user_id",
          [
            Sequelize.literal(`CEIL(CASE WHEN "product_type" = ${
              AllProductTypes.Config_Ring_product
            } THEN 
                  (SELECT ((CASE WHEN CAST (product_details ->> 'diamond_type' AS integer) = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
            WHEN "product_type" = ${
              AllProductTypes.Three_stone_config_product
            } THEN 
                  (SELECT ((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
                  WHEN "product_type" = ${AllProductTypes.Product}
                        THEN (SELECT CASE WHEN products.product_type = ${
                          SingleProductType.VariantType
                        } OR (products.product_type = ${
              SingleProductType.cataLogueProduct
            } AND (product_details ->> 'is_catalogue_design') = 'true') THEN (PMO.retail_price)*"cart_products"."quantity" ELSE  CASE WHEN PMO.id_karat IS NULL
                          THEN(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                            (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" ELSE
                            (metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                            (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" END END
                            FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product =
                            products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product =
                            products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters
                            AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN
                            diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN
                            gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${
                              SingleProductType.VariantType
                            } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
                            products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                            ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                            AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
                            (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
                            products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price)
   WHEN "product_type" = ${
     AllProductTypes.GiftSet_product
   } THEN (SELECT  price*"cart_products"."quantity" FROM gift_set_products WHERE id = "product_id") 
                  WHEN "product_type" = ${
                    AllProductTypes.BirthStone_product
                  } THEN (SELECT price*"cart_products"."quantity" FROM  birthstone_products
  LEFT JOIN birthstone_product_metal_options AS birthstone_PMO ON id_product = birthstone_products.id 
  WHERE birthstone_PMO.id = "variant_id") WHEN "product_type" = ${
              AllProductTypes.Eternity_product
            } THEN (SELECT 
      (((CASE 
          WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
          THEN dgm.rate 
          ELSE dgm.synthetic_rate 
      END)*(CASE WHEN product_combo_type = 1 OR product_combo_type = 3 THEN CAST(prod_dia_total_count AS double precision) ELSE CAST(dia_count AS double precision) END)*CAST(carat_sizes.value AS double precision)) 
      + COALESCE(labour_charge, 0) 
      + COALESCE(other_charge, 0) 
      + product_metal.metal_rate 
      + 
    COALESCE(product_diamond.diamond_rate, 0)) * "cart_products"."quantity"
  FROM config_eternity_products 
  LEFT OUTER JOIN diamond_group_masters AS dgm 
  ON config_eternity_products.diamond_group_id = dgm.id
  LEFT OUTER JOIN carat_sizes ON  dgm.id_carat = carat_sizes.id
  LEFT OUTER JOIN (
      SELECT 
          config_eternity_id,
          cepm.metal_id,
          cepm.karat_id,
          CASE 
              WHEN cepm.karat_id IS NULL
              THEN SUM(metal_wt * mm.metal_rate)
              ELSE SUM(metal_wt * (mm.metal_rate / mm.calculate_rate * gk.calculate_rate))
          END AS metal_rate
      FROM config_eternity_product_metals AS cepm
      LEFT OUTER JOIN metal_masters AS mm 
          ON mm.id = cepm.metal_id
      LEFT OUTER JOIN gold_kts AS gk 
          ON gk.id = cepm.karat_id
      GROUP BY config_eternity_id, cepm.karat_id, cepm.metal_id
  ) product_metal
  ON config_eternity_products.id = product_metal.config_eternity_id
  LEFT OUTER JOIN (
      SELECT 
          config_eternity_product_id,
          COALESCE(SUM(
              (CASE 
                  WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
                  THEN sdgm.rate 
                  ELSE sdgm.synthetic_rate 
              END) 
              * CAST(cepd.dia_count AS double precision) 
              * CAST(cts.value AS double precision)
          ), 0) AS diamond_rate
      FROM config_eternity_product_diamonds AS cepd
      LEFT OUTER JOIN diamond_group_masters AS sdgm 
          ON cepd.id_diamond_group = sdgm.id
      LEFT OUTER JOIN carat_sizes AS cts 
          ON cts.id = cepd.dia_weight
      GROUP BY config_eternity_product_id
  ) product_diamond
  ON config_eternity_products.id = product_diamond.config_eternity_product_id
  WHERE config_eternity_products.id  = "product_id") WHEN "product_type" = ${
              AllProductTypes.LooseDiamond
            }
  THEN (
      SELECT
      total_price * "cart_products"."quantity"
  FROM loose_diamond_group_masters
  WHERE loose_diamond_group_masters.is_deleted = '0'
  AND loose_diamond_group_masters.id = "product_id"
  ) WHEN "product_type" = ${
              AllProductTypes.BraceletConfigurator
            } THEN (SELECT CASE
    WHEN ID_KARAT IS NULL THEN (METAL_MASTERS.METAL_RATE * METAL_WT + PRODUCT_DIAMOND_DETAILS.DIAMOND_RATE)
    ELSE ((METAL_MASTERS.METAL_RATE / METAL_MASTERS.CALCULATE_RATE * GOLD_KTS.calculate_rate * METAL_WT + LABOUR_CHARGE) + PRODUCT_DIAMOND_DETAILS.DIAMOND_RATE)
  END
  FROM CONFIG_BRACELET_PRODUCTS
  INNER JOIN CONFIG_BRACELET_PRODUCT_METALS ON CONFIG_PRODUCT_ID = CONFIG_BRACELET_PRODUCTS.ID
  LEFT OUTER JOIN
    (SELECT CONFIG_PRODUCT_ID,
      (COALESCE(SUM(PDGM.RATE * CPDO.DIA_COUNT * CPDO.DIA_WT),0)) AS DIAMOND_RATE
      FROM CONFIG_BRACELET_PRODUCT_DIAMONDS AS CPDO
      LEFT JOIN DIAMOND_GROUP_MASTERS AS PDGM ON PDGM.ID = ID_DIAMOND_GROUP_MASTER
      GROUP BY CONFIG_PRODUCT_ID) PRODUCT_DIAMOND_DETAILS ON PRODUCT_DIAMOND_DETAILS.CONFIG_PRODUCT_ID = CONFIG_BRACELET_PRODUCTS.ID
  LEFT JOIN METAL_MASTERS ON ID_METAL = METAL_MASTERS.ID
  LEFT JOIN GOLD_KTS ON ID_KARAT = GOLD_KTS.ID
  WHERE CONFIG_BRACELET_PRODUCTS.ID = "product_id") ELSE null END)`),
            "product_price",
          ],
          [Sequelize.literal(`'0'`), "diamond_price"],
          [Sequelize.literal(`null`), "diamond_details"],
        ],
      });
    } else {
      cartProductList = await CartProducts.findAll({
        where: { id: req.body.cart_id },
        order: [["created_date", "DESC"]],
        attributes: [
          "id",
          "user_id",
          [
            Sequelize.literal(`(CASE WHEN "product_type" = ${
              AllProductTypes.Config_Ring_product
            } THEN 
                  (SELECT CEIL((CASE WHEN CAST (product_details ->> 'diamond_type' AS integer) = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
            WHEN "product_type" = ${
              AllProductTypes.Three_stone_config_product
            } THEN 
                  (SELECT CEIL((CASE WHEN ${`CAST (product_details ->> 'diamond_type' AS integer)`} = 1 THEN DGM.rate ELSE DGM.synthetic_rate END)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0))*"cart_products"."quantity" FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPMO.head_shank_band <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${`CAST (product_details ->> 'is_band' AS integer)`} = 1 THEN  CPDO.product_type <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE config_products.id = "product_id")
                  WHEN "product_type" = ${AllProductTypes.Product}
                        THEN (SELECT CASE WHEN products.product_type = ${
                          SingleProductType.VariantType
                        } OR (products.product_type = ${
              SingleProductType.cataLogueProduct
            } AND (product_details ->> 'is_catalogue_design') = 'true') THEN CEIL(PMO.retail_price)*"cart_products"."quantity" ELSE  CASE WHEN PMO.id_karat IS NULL
                          THEN CEIL(metal_master.metal_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                            (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" ELSE
                            CEIL(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate*PMO.metal_weight+making_charge+finding_charge+other_charge+
                            (COALESCE(sum((CASE WHEN DGM.rate IS NULL THEN DGM.synthetic_rate ELSE DGM.rate END)*PDO.weight*PDO.count), 0)))*"cart_products"."quantity" END END
                            FROM products LEFT OUTER JOIN product_metal_options AS PMO ON id_product =
                            products.id LEFT OUTER JOIN product_diamond_options AS PDO ON PDO.id_product =
                            products.id AND PDO.is_deleted = '0' LEFT OUTER JOIN metal_masters
                            AS metal_master ON metal_master.id = PMO.id_metal LEFT OUTER JOIN
                            diamond_group_masters AS DGM ON DGM.id = PDO.id_diamond_group LEFT OUTER JOIN
                            gold_kts ON gold_kts.id = PMO.id_karat WHERE CASE WHEN products.product_type = ${
                              SingleProductType.VariantType
                            } THEN products.id = "product_id" AND PMO.id = "variant_id" ELSE  CASE WHEN PMO.id_karat IS NULL THEN
                            products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                            ELSE products.id = "product_id" AND PMO.id_metal = CAST (product_details ->> 'metal' AS integer)
                            AND PMO.id_karat = CASE WHEN (product_details ->> 'karat') = 'null' THEN null ELSE CAST
                            (product_details ->> 'karat' AS integer) END END END GROUP BY metal_master.metal_rate, metal_master.calculate_rate, pmo.metal_weight,
                            products.making_charge, products.finding_charge, products.other_charge,PMO.id_karat, gold_kts.calculate_rate, products.product_type, PMO.retail_price)
   WHEN "product_type" = ${
     AllProductTypes.GiftSet_product
   } THEN (SELECT  CEIL(price)*"cart_products"."quantity" FROM gift_set_products WHERE id = "product_id") 
                  WHEN "product_type" = ${
                    AllProductTypes.BirthStone_product
                  } THEN (SELECT CEIL(price)*"cart_products"."quantity" FROM  birthstone_products
  LEFT JOIN birthstone_product_metal_options AS birthstone_PMO ON id_product = birthstone_products.id 
  WHERE birthstone_PMO.id = "variant_id") WHEN "product_type" = ${
              AllProductTypes.Eternity_product
            } THEN (SELECT 
      (((CASE 
          WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
          THEN dgm.rate 
          ELSE dgm.synthetic_rate 
      END)*(CASE WHEN product_combo_type = 1 OR product_combo_type = 3 THEN CAST(prod_dia_total_count AS double precision) ELSE CAST(dia_count AS double precision) END)*CAST(carat_sizes.value AS double precision)) 
      + COALESCE(labour_charge, 0) 
      + COALESCE(other_charge, 0) 
      + product_metal.metal_rate 
      + 
    COALESCE(product_diamond.diamond_rate, 0)) * "cart_products"."quantity"
  FROM config_eternity_products 
  LEFT OUTER JOIN diamond_group_masters AS dgm 
  ON config_eternity_products.diamond_group_id = dgm.id
  LEFT OUTER JOIN carat_sizes ON  dgm.id_carat = carat_sizes.id
  LEFT OUTER JOIN (
      SELECT 
          config_eternity_id,
          cepm.metal_id,
          cepm.karat_id,
          CASE 
              WHEN cepm.karat_id IS NULL
              THEN SUM(metal_wt * mm.metal_rate)
              ELSE SUM(metal_wt * (mm.metal_rate / mm.calculate_rate * gk.calculate_rate))
          END AS metal_rate
      FROM config_eternity_product_metals AS cepm
      LEFT OUTER JOIN metal_masters AS mm 
          ON mm.id = cepm.metal_id
      LEFT OUTER JOIN gold_kts AS gk 
          ON gk.id = cepm.karat_id
      GROUP BY config_eternity_id, cepm.karat_id, cepm.metal_id
  ) product_metal
  ON config_eternity_products.id = product_metal.config_eternity_id
  LEFT OUTER JOIN (
      SELECT 
          config_eternity_product_id,
          COALESCE(SUM(
              (CASE 
                  WHEN CAST(product_details ->> 'diamond_type' AS integer) = 1 
                  THEN sdgm.rate 
                  ELSE sdgm.synthetic_rate 
              END) 
              * CAST(cepd.dia_count AS double precision) 
              * CAST(cts.value AS double precision)
          ), 0) AS diamond_rate
      FROM config_eternity_product_diamonds AS cepd
      LEFT OUTER JOIN diamond_group_masters AS sdgm 
          ON cepd.id_diamond_group = sdgm.id
      LEFT OUTER JOIN carat_sizes AS cts 
          ON cts.id = cepd.dia_weight
      GROUP BY config_eternity_product_id
  ) product_diamond
  ON config_eternity_products.id = product_diamond.config_eternity_product_id
  WHERE config_eternity_products.id  = "product_id") WHEN "product_type" = ${
              AllProductTypes.LooseDiamond
            }
  THEN (
      SELECT
      total_price * "cart_products"."quantity"
  FROM loose_diamond_group_masters
  WHERE loose_diamond_group_masters.is_deleted = '0'
  AND loose_diamond_group_masters.id = "product_id"
  ) WHEN "product_type" = ${
              AllProductTypes.BraceletConfigurator
            } THEN (SELECT CASE
    WHEN ID_KARAT IS NULL THEN CEIL(METAL_MASTERS.METAL_RATE * METAL_WT + PRODUCT_DIAMOND_DETAILS.DIAMOND_RATE)*"cart_products"."quantity"
    ELSE CEIL((METAL_MASTERS.METAL_RATE / METAL_MASTERS.CALCULATE_RATE * GOLD_KTS.calculate_rate * METAL_WT + LABOUR_CHARGE) + PRODUCT_DIAMOND_DETAILS.DIAMOND_RATE)*"cart_products"."quantity"
  END
  FROM CONFIG_BRACELET_PRODUCTS
  INNER JOIN CONFIG_BRACELET_PRODUCT_METALS ON CONFIG_PRODUCT_ID = CONFIG_BRACELET_PRODUCTS.ID
  LEFT OUTER JOIN
    (SELECT CONFIG_PRODUCT_ID,
      (COALESCE(SUM(PDGM.RATE * CPDO.DIA_COUNT * CPDO.DIA_WT),0)) AS DIAMOND_RATE
      FROM CONFIG_BRACELET_PRODUCT_DIAMONDS AS CPDO
      LEFT JOIN DIAMOND_GROUP_MASTERS AS PDGM ON PDGM.ID = ID_DIAMOND_GROUP_MASTER
      GROUP BY CONFIG_PRODUCT_ID) PRODUCT_DIAMOND_DETAILS ON PRODUCT_DIAMOND_DETAILS.CONFIG_PRODUCT_ID = CONFIG_BRACELET_PRODUCTS.ID
  LEFT JOIN METAL_MASTERS ON ID_METAL = METAL_MASTERS.ID
  LEFT JOIN GOLD_KTS ON ID_KARAT = GOLD_KTS.ID
  WHERE CONFIG_BRACELET_PRODUCTS.ID = "product_id") ELSE null END)`),
            "product_price",
          ],,
          [Sequelize.literal(`'0'`), "diamond_price"],
          [Sequelize.literal(`null`), "diamond_details"],
        ],
      });
    }

    let amount = cartProductList
      .map((item: any) => Math.ceil(item.dataValues.product_price))
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);

    amount = Math.ceil(amount);

    // Check if the coupon code exists

const todayUtc = new Date(Date.UTC(
  new Date().getUTCFullYear(),
  new Date().getUTCMonth(),
  new Date().getUTCDate()
)).toISOString().split('T')[0];
    console.log("------------------------------",todayUtc)
    const recordsExists: any = await CouponData.findOne({
      where: {
        coupon_code: coupon_code,
        company_info_id:company_info_id?.data,
        [Op.and]: [
    Sequelize.literal(`start_date AT TIME ZONE 'UTC' <= '${todayUtc}'`),
    Sequelize.literal(`end_date AT TIME ZONE 'UTC' >= '${todayUtc}'`)
  ]
      },
    });

    if (!(recordsExists && recordsExists.dataValues)) {
      return resNotFound({
        message: COUPON_EXPIRED_MESSAGE,
      });
    }
    if (
      (recordsExists.dataValues.user_limits &&
        recordsExists.dataValues.usage_limit &&
        !req.body.session_res.id_app_user) ||
      (recordsExists.dataValues.user_limits &&
        !req.body.session_res.id_app_user) ||
      (recordsExists.dataValues.usage_limit &&
        !req.body.session_res.id_app_user)
    ) {
      return resBadRequest({
        message: ERROR_ONLY_LOGGED_IN_USERS_CAN_USE_COUPON_CODE,
      });
    }
    const validAmount = validateAmount(amount);
    if (validAmount.code != DEFAULT_STATUS_CODE_SUCCESS) {
      return validAmount;
    }

    if (recordsExists.dataValues.min_total_amount >= amount) {
      return resBadRequest({
        data: amount,
        message: prepareMessageFromParams(MIN_REQUIRED_AMOUNT_ERROR, [
          ["ACTUAL_AMOUNT", `${amount}`],
          ["REQUIRED_AMOUNT", `${recordsExists.dataValues.min_total_amount}`],
        ]),
      }); //
    }

    if (recordsExists.dataValues.max_total_amount <= amount) {
      return resBadRequest({
        data: amount,
        message: prepareMessageFromParams(MaX_REQUIRED_AMOUNT_ERROR, [
          ["ACTUAL_AMOUNT", `${amount}`],
          ["REQUIRED_AMOUNT", `${recordsExists.dataValues.max_total_amount}`],
        ]),
      }); //
    }

    if (
      recordsExists.dataValues.discount_type ==
      COUPON_DISCOUNT_TYPE.PercentageDiscount
    ) {
      // Calculate percentage discount
      discount = (recordsExists.dataValues.percentage_off / 100) * amount;
    } else if (
      recordsExists.dataValues.discount_type ==
      COUPON_DISCOUNT_TYPE.FixedAmountDiscount
    ) {
      // Flat discount
      discount = amount - recordsExists.dataValues.discount_amount;
    } else {
      return resNotFound({
        message: INVALID_COUPON_TYPE_MESSAGE,
      });
    }

    // checkLimitationOfCoupon Function to check if usage limits are exceeded and handle coupon verification

    const result: any = await checkLimitationOfCoupon(
      recordsExists.dataValues,
      req.body.session_res.id_app_user,
      company_info_id?.data,
      req
    );
    if (result && result.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return result;
    }

    // check if maximum discount amount is set and discount amount is grater then maximum discount amount so, set discount is maximum discount amount.
    if (
      recordsExists.dataValues.maximum_discount_amount &&
      recordsExists.dataValues.maximum_discount_amount < discount
    ) {
      discount = recordsExists.dataValues.maximum_discount_amount;
    }

    // Ensure discount does not exceed the amount
    discountedAmount = Math.max(amount - discount, 0);

    await CartProducts.update(
      {
        id_coupon: recordsExists.dataValues.id,
      },
      { where: { user_id: req.body.session_res.id_app_user } }
    );
    return {
      coupon_id: recordsExists.dataValues.id,
      original_amount: amount,
      discounted_amount: discountedAmount,
      discount_value: discount,
      currency: currency,
    };
  } catch (error) {
    return resUnknownError({
      data: error,
    });
  }
};

export const validateAmount = (amount: number) => {
  // Check if the amount is a number and is not NaN
  if (typeof amount !== "number" || isNaN(amount)) {
    return resBadRequest({ data: amount, message: ERROR_AMOUNT_INVALID });
  }

  // Check if the amount is non-negative
  if (amount < 0) {
    return resBadRequest({ data: amount, message: ERROR_AMOUNT_NEGATIVE });
  }

  return resSuccess(); // No error
};

// Function to check if usage limits are exceeded and handle coupon verification
export const checkLimitationOfCoupon = async (
  couponData: any,
  user_id: any,
  company_info_id: any, 
  req: Request
) => {
  try {
    const {Orders} = initModels(req);
    // Check the total count of times this coupon has been used
    const couponUsedByUserCount: any = await Orders.count({
      where: {
        coupon_id: couponData.id,company_info_id:company_info_id,
      },
      group: ["user_id", "coupon_id"],
    });

    // If the usage limit has been reached, mark the coupon as expired
    if (
      couponData.usage_limit &&
      couponUsedByUserCount &&
      couponUsedByUserCount.length >= couponData.usage_limit
    ) {
      return resBadRequest({ message: COUPON_EXPIRED });
    }
    // If the coupon's usage limit is reached and the coupon type is 'Once', check if the user has used it; if so, expire the coupon for this user
    if (couponData.duration == COUPON_DURATION.Once) {
      const coupon: any = await Orders.findOne({
        where: {
          coupon_id: couponData.id,
          user_id: user_id,
          company_info_id:company_info_id,
        },
      });

      if (coupon) {
        return resBadRequest({
          message: prepareMessageFromParams(USER_APPLY_ONLY_ONE_TIME_ERROR, [
            ["field", "Once"],
          ]),
        });
      }
    } else {
      const findUser: any = await Orders.findAll({
        where: {
          coupon_id: couponData.id,
          user_id: user_id,
          company_info_id:company_info_id?.data,
        },
      });
      if (!user_id && couponData.user_limits && couponData.usage_limit) {
        return resBadRequest({
          message: ERROR_ONLY_LOGGED_IN_USERS_CAN_USE_COUPON_CODE,
        });
      }
      if (couponData.user_limits && findUser.length > couponData.user_limits) {
        return resBadRequest({
          message: prepareMessageFromParams(
            USER_LIMIT_APPLY_ONLY_ONE_TIME_ERROR,
            [["field", couponData.user_limits]]
          ),
        });
      }
    }
    return resSuccess();
  } catch (error) {
    resUnknownError({ data: error });
  }
};

export const couponDetails = async (req: Request) => {
  try {
    const { id } = req.params;
    const {CouponData,AppUser} = initModels(req);
    const findCoupon = await CouponData.findOne({
      where: { id: id, is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
      attributes: [
        "id",
        "name",
        "coupon_code",
        "description",
        "discount_type",
        "percentage_off",
        "discount_amount",
        "duration",
        "usage_limit",
        "min_total_amount",
        "max_total_amount",
        "maximum_discount_amount",
        "start_date",
        "end_date",
        "user_id",
        "user_limits",
        "is_active",
        "max_total_amount",
        [Sequelize.literal("created_user.username"), "created_user_name"],
      ],
      include: [{required: false, model: AppUser, as: "created_user", attributes: [],where:{company_info_id :req?.body?.session_res?.client_id} }],
    });
    if (!(findCoupon && findCoupon.dataValues)) {
      return resNotFound();
    }
    return resSuccess({ data: findCoupon.dataValues });
  } catch (error) {
    throw error;
  }
};

export const removeCoupon = async (req: Request) => {
  try {
    const {CartProducts,CouponData} = initModels(req);
    const { cart_id } = req.body;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }

    const findCartProduct = await CartProducts.findOne({
      where: { id: cart_id, company_info_id:company_info_id?.data },
    }) 
    const findCoupon = await CouponData.findOne({where: { id: findCartProduct.dataValues.id_coupon, is_deleted: DeletedStatus.No,company_info_id:company_info_id?.data }});
    
    await CartProducts.update(
      {
        id_coupon: null,
      },
      {
        where: { id: cart_id, company_info_id:company_info_id?.data },
      }
    );
    await addActivityLogs(req,company_info_id?.data,[{
      old_data: { coupon_id: findCoupon?.dataValues?.id, id_coupon: findCoupon?.dataValues?.id_coupon},
      new_data: {
        coupon_id: findCoupon?.dataValues?.id, 
          id_coupon: null,
      }
    }], findCoupon?.dataValues?.id, LogsActivityType.RemoveCoupon, LogsType.Coupon, req?.body?.session_res?.id_app_user)
    
    return resSuccess();
  } catch (error) {
    throw error;
  }
};
