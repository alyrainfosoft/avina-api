import axios from "axios";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  RAP_NET_ERROR_CODE,
} from "../../utils/app-messages";
import {
  resNotFound,
  resSuccess,
  resUnknownError,
} from "../../utils/shared-functions";
import {
  RAPNET_API_ENDPOINT_DIAMONDS,
  RAPNET_API_HOST,
  RAPNET_API_TOKEN,
  VDB_API_ENDPOINT_DIAMONDS,
  VDB_API_HOST,
  VDB_API_KEY,
  VDB_TOKEN,
} from "../../config/env.var";
import {
  IDiamondFilter,
  IDiamondResponse,
  TRapnetDiamond,
  TVDBDiamond,
} from "../../data/interfaces/diamond/diamond.interface";
import { DIAMOND_ORIGIN } from "../../utils/app-enumeration";
import { PER_PAGE_ROWS } from "../../utils/app-constants";
import { Request } from "express";
import { QueryTypes } from "sequelize";

const getQSParamsFromObject = (qsObject: Object) => {
  const qsParams = { ...qsObject };
  Object.keys(qsParams).forEach((key) => {
    if (!qsParams[key]) {
      delete qsParams[key];
    }
  });

  return Object.keys(qsParams)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(qsParams[key])
    )
    .join("&");
};

export const DIAMOND_COLORS = [
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "O",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export const DIAMOND_CLARITY = [
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "SI3",
  "SI",
  "VS",
  "VS-SI",
  "VVS",
  "I1",
  "I2",
  "I3",
];

export const DIAMOND_CUT = [
  "Poor",
  "Fair",
  "Good",
  "Very Good",
  "Excellent",
  "Ideal",
];

export const DIAMOND_POLISH = [
  "Poor",
  "Fair",
  "Good",
  "Very Good",
  "Excellent",
  "Ideal",
];

export const DIAMOND_SYMMETRY = [
  "Poor",
  "Fair",
  "Good",
  "Very Good",
  "Excellent",
  "Ideal",
];

const getVDBQsFromFilter = (filter: IDiamondFilter) => {
  // page_number: 1 - 1000
  // page_size: 10 - 100
  // type: Diamond, Lab_grown_Diamond
  // shape: Briolette, Eurocut, Flanders, Half Moon, Kite, Old Miner, Bullet, Hexagonal, Lozenge, Tapered Bullet, Octagonal, Triangle, Rose Cut, Radiant, Ideal Oval, Ideal Square, Square Emerald, Sig81, Cushion Modified Brilliant, Pear, Ideal Cushion, Asscher, Pentagonal, Star, Trapezoid, Cushion, Trilliant, Marquise, Baguette, Heart, Shield, Tapered Baguette, Round, Oval, Emerald, Princess, Square, Ideal Heart, Other
  // size: 1 - 100
  // color: D - Z
  // cut: Ideal, Excellent, Very Good, Good, Fair, Poor
  // symmetry: Ideal, Excellent, Very Good, Good, Fair, Poor
  // polish: Ideal, Excellent, Very Good, Good, Fair, Poor
  // depth_percent: 1 - 100
  // table_percent: 1 - 100
  // preference: discount_percent, price_per_carat, total_sales_price, meas_ratio, meas_length, shape, size, color, clarity, cut, polish, symmetry, fluor_intensity, depth_percent, table_percent, lab
  // clarity: VVS1, VVS2, VS1, VS2, SI1, SI2, SI3, SI, VS, VS-SI, VVS, I1, I2, I3, FL, IF
  // fluorescence_intensities: Very Slight, Slight, Very Strong, None, Strong, Medium, Faint
  // labs: GII, LGC, VIVID, FM, SGL, GCAL, AWDC, GIA, AGS, HRD, IGI, DE BEERS, BSC, GSI, ARGYLE, None, Other, EGL USA

  const vdbFilter = {
    type:
      filter.diamond_origin === DIAMOND_ORIGIN.Natural
        ? "Diamond"
        : "Lab_grown_Diamond",
    page_size: filter.per_page_rows,
    page_number: filter.current_page,
    size_from: filter.min_carat,
    size_to: filter.max_carat,
    price_total_from: filter.min_price,
    price_total_to: filter.max_price,
    color_from: filter.color_from,
    color_to: filter.color_to,
    clarity_from: filter.clarity_from || "FL",
    clarity_to: filter.clarity_to || "I3",
    cut_from: filter.cut_from,
    cut_to: filter.cut_to,
    hearts_and_arrows: filter.h_a === "1" ? "Hearts and Arrows" : null,
    meas_ratio_from: filter.min_lw_ratio,
    meas_ratio_to: filter.max_lw_ratio,
    polish_from: filter.polish_from,
    polish_to: filter.polish_to,
    symmetry_from: filter.symmetry_from,
    symmetry_to: filter.symmetry_to,
    table_percent_from: filter.min_table || 1,
    table_percent_to: filter.max_table || 100,
    depth_percent_from: filter.min_depth || 1,
    depth_percent_to: filter.max_depth || 100,
  };

  let vdbQs = getQSParamsFromObject(vdbFilter);

  if (filter.shape) {
    for (const shape of filter.shape.split(",")) {
      vdbQs += `&shapes[]=${shape}`;
    }
  }

  if (filter.report) {
    for (const report of filter.report.split(",")) {
      vdbQs += `&labs[]=${report}`;
    }
  }

  if (filter.fluorescence_intensity) {
    for (const fluorescenceIntensity of filter.fluorescence_intensity.split(
      ","
    )) {
      vdbQs += `&fluorescence_intensities[]=${fluorescenceIntensity}`;
    }
  }

  if (filter.sort_by) {
    if (filter.sort_by === "price") {
      vdbQs += `&preference[]=total_sales_price`;
    } else if (filter.sort_by === "carat") {
      vdbQs += `&preference[]=size`;
    } else {
      vdbQs += `&preference[]=${filter.sort_by}`;
    }

    vdbQs += ` ${filter.order_by || "ASC"}`;
  }

  return vdbQs;
};

export const shapeVDBDiamondList = (diamondList: TVDBDiamond[]) => {
  const shapedList = [];
  for (const diamond of diamondList) {
    shapedList.push(shapeVDBDiamond(diamond));
  }
  return shapedList;
};

export const shapeVDBDiamond = (diamond: TVDBDiamond): IDiamondResponse => {
  return {
    id: diamond.id?.toString(),
    shape: diamond.shape,
    price: diamond.total_sales_price,
    carat: diamond.size,
    cut: diamond.cut,
    color: diamond.color,
    clarity: diamond.clarity,
    image_url: diamond.image_url,
    video_url: diamond.video_url,
    other_images_url: diamond.image_urls?.map((obj) => obj.image_url),
    lw: diamond.meas_ratio,
    fluor: diamond.fluor_intensity,
    symmetry: diamond.symmetry,
    table: diamond.table_percent,
    measurement_length: diamond.meas_length,
    measurement_width: diamond.meas_width,
    measurement_depth: diamond.meas_depth,
    culet: diamond.culet_size,
    polish: diamond.polish,
    girdle: diamond.girdle_condition,
    depth: diamond.depth_percent,
    report: diamond.lab,
    stock_number: diamond.stock_num,
    diamond_origin: diamond.lab_grown
      ? DIAMOND_ORIGIN.LabGrown
      : DIAMOND_ORIGIN.Natural,
    certificate_url: diamond.cert_url,
    quantity: null,
    remaining_quantity_count: null,
  };
};

const getVDBDiamondsService = async (qs: string) => {
  try {
    const vdbDiamondsRes = await axios.get(
      `${VDB_API_HOST}/${VDB_API_ENDPOINT_DIAMONDS}?${qs}`,
      {
        headers: {
          Authorization: `Token token=${VDB_TOKEN}, api_key=${VDB_API_KEY}`,
        },
      }
    );

    if (
      vdbDiamondsRes.data &&
      vdbDiamondsRes.data.response &&
      vdbDiamondsRes.data.response.header
    ) {
      if (
        vdbDiamondsRes.data.response.header.status ===
        DEFAULT_STATUS_CODE_SUCCESS
      ) {
        return resSuccess({
          data: vdbDiamondsRes.data.response.body,
        });
      } else {
        return resUnknownError({ data: vdbDiamondsRes.data.response });
      }
    }

    return resUnknownError({ data: vdbDiamondsRes.data });
  } catch (e: any) {
    return resUnknownError({ data: e?.response?.data || e });
  }
};

export const getVDBDiamonds = async (req: Request) => {
  try {
    let pagination = {
      per_page_rows: req.query.per_page_rows
        ? Number(req.query.per_page_rows)
        : PER_PAGE_ROWS,
      current_page: req.query.current_page ? Number(req.query.current_page) : 1,
      order_by: req.query.order_by
        ? req.query.order_by
        : req.query.sort_by
        ? "ASC"
        : undefined,
      sort_by: req.query.sort_by,
      total_pages: 0,
      total_items: 0,
    };
    const qs = getVDBQsFromFilter(req.query as unknown as IDiamondFilter);

    const resVDB = await getVDBDiamondsService(qs);
    if (resVDB.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVDB;
    }

    pagination.total_items = resVDB.data.total_diamonds_found;
    pagination.total_pages = Math.ceil(
      Number(resVDB.data.total_diamonds_found) / pagination.per_page_rows
    );

    return resSuccess({
      data: {
        result: shapeVDBDiamondList(resVDB.data.diamonds),
        pagination,
      },
    });
  } catch (e: any) {
    throw e;
  }
};

export const getVDBDiamondByStockNumber = async (
  stockNumber: string,
  diamondOrigin: DIAMOND_ORIGIN
) => {
  try {
    const resVDB = await getVDBDiamondsService(
      `type=${
        diamondOrigin === DIAMOND_ORIGIN.Natural
          ? "Diamond"
          : "Lab_grown_Diamond"
      }&stock_num=${stockNumber}`
    );
    if (resVDB.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVDB;
    }

    if (resVDB.data.diamonds?.length > 0) {
      return resSuccess({
        data: shapeVDBDiamond(resVDB.data.diamonds[0]),
      });
    } else {
      return resNotFound();
    }
  } catch (e: any) {
    throw e;
  }
};

const getRapnetBodyFromFilter = (filter: IDiamondFilter) => {
  // page_number: 1
  // page_size: 20
  // sort_by: Price, Shape, Size, Color, Clarity, Cut, Lab
  // sort_direction: Asc, Desc
  // type: TODO
  // shape: Round, Pear, Princess, Marquise, Oval, Radiant, Emerald, Heart, Cushion, Asscher
  // size: 2.1
  // color: D - M
  // cut: Excellent, Very Good, Good, Fair, Poor
  // symmetry: Excellent, Very Good, Good, Fair, Poor
  // polish: Excellent, Very Good, Good, Fair, Poor
  // depth_percent: 66.7
  // table_percent: 54.2
  // clarity: IF, VVS1, VVS2, VS1, VS2, SI1, SI2, SI3, I1, I2, I3
  // fluorescence_intensities: Very Slight, Faint, Medium, Slight, Strong, Very Strong, None
  // labs: GIA, IGI, AGS, HRD, PGS, DCLA, VGR, GCAL, NGTC, GSI, DBGIS, NONE

  const rapnetFilter = {
    // TODO
    // type:
    //   filter.diamond_origin === DIAMOND_ORIGIN.Natural
    //     ? "Diamond"
    //     : "Lab_grown_Diamond",
    page_size: filter.per_page_rows,
    page_number: filter.current_page,
    size_from: filter.min_carat,
    size_to: filter.max_carat,
    price_total_from: filter.min_price,
    price_total_to: filter.max_price,
    color_from: filter.color_from,
    color_to: filter.color_to,
    clarity_from: filter.clarity_from || "FL",
    clarity_to: filter.clarity_to || "I3",
    cut_from: filter.cut_from,
    cut_to: filter.cut_to,
    // TODO
    // hearts_and_arrows: filter.h_a === "1" ? "Hearts and Arrows" : null,
    // meas_ratio_from: filter.min_lw_ratio,
    // meas_ratio_to: filter.max_lw_ratio,
    polish_from: filter.polish_from,
    polish_to: filter.polish_to,
    symmetry_from: filter.symmetry_from,
    symmetry_to: filter.symmetry_to,
    table_percent_from: filter.min_table || 1,
    table_percent_to: filter.max_table || 100,
    depth_percent_from: filter.min_depth || 1,
    depth_percent_to: filter.max_depth || 100,
    ...(filter.shape ? { shape: filter.shape.split(",") } : {}),
    ...(filter.report ? { labs: filter.report.split(",") } : {}),
    ...(filter.fluorescence_intensity
      ? { fluorescence_intensities: filter.fluorescence_intensity.split(",") }
      : {}),
    ...(filter.sort_by
      ? {
          sort_by:
            filter.sort_by === "carat"
              ? "Size"
              : filter.sort_by.charAt(0).toUpperCase() +
                filter.sort_by.slice(1),
        }
      : {}),
    ...(filter.sort_by
      ? { sort_direction: filter.order_by === "ASC" ? "Asc" : "Desc" }
      : {}),
  };

  return rapnetFilter;
};

const getRapnetDiamondsService = async (body: Object, req: Request) => {
  try {
    const data = <any>await (req.body.db_connection).query(
      "SELECT * FROM tp_diamond_responses",
      {
        type: QueryTypes.SELECT,
      }
    );

    return resSuccess({
      data: {
        diamond: data[0].response,
        total_diamond_found: data[0].response.length,
      },
    });

    const rapnetDiamondsRes = await axios.post(
      `${RAPNET_API_HOST}/${RAPNET_API_ENDPOINT_DIAMONDS}`,
      body,
      {
        headers: {
          Authorization: RAPNET_API_TOKEN,
        },
      }
    );

    if (
      rapnetDiamondsRes.data &&
      rapnetDiamondsRes.data.response &&
      rapnetDiamondsRes.data.response.header
    ) {
      if (
        rapnetDiamondsRes.data.response.header.error_code !== RAP_NET_ERROR_CODE
      ) {
        return resSuccess({
          data: rapnetDiamondsRes.data.response.body,
        });
      } else {
        return resUnknownError({ data: rapnetDiamondsRes.data.response });
      }
    }

    return resUnknownError({ data: rapnetDiamondsRes.data });
  } catch (e: any) {
    return resUnknownError({ data: e?.response?.data || e });
  }
};

export const shapeRapnetDiamondList = (diamondList: TRapnetDiamond[]) => {
  const shapedList = [];
  for (const diamond of diamondList) {
    shapedList.push(shapeRapnetDiamond(diamond));
  }
  return shapedList;
};

export const shapeRapnetDiamond = (
  diamond: TRapnetDiamond
): IDiamondResponse => {
  return {
    // TODO: other_images_url, lw, diamond_origin, certificate_url
    id: diamond.diamond_id?.toString(),
    shape: diamond.shape,
    price: diamond.total_sales_price?.toString(),
    carat: diamond.size?.toString(),
    cut: diamond.cut,
    color: diamond.color,
    clarity: diamond.clarity,
    image_url: diamond.image_file,
    video_url: diamond.video_url,
    other_images_url: [],
    lw: null,
    fluor: diamond.fluor_intensity,
    symmetry: diamond.symmetry,
    table: diamond.table_percent?.toString(),
    measurement_length: diamond.meas_length?.toString(),
    measurement_width: diamond.meas_width?.toString(),
    measurement_depth: diamond.meas_depth?.toString(),
    culet: diamond.culet_size,
    polish: diamond.polish,
    girdle: diamond.girdle_condition,
    depth: diamond.depth_percent?.toString(),
    report: diamond.lab,
    stock_number: diamond.stock_num,
    diamond_origin: DIAMOND_ORIGIN.Natural,
    certificate_url: null,
    quantity: null,
    remaining_quantity_count: null,
  };
};

export const getRapnetDiamonds = async (req: Request) => {
  try {
    let pagination = {
      per_page_rows: req.query.per_page_rows
        ? Number(req.query.per_page_rows)
        : PER_PAGE_ROWS,
      current_page: req.query.current_page ? Number(req.query.current_page) : 1,
      order_by: req.query.order_by
        ? req.query.order_by
        : req.query.sort_by
        ? "ASC"
        : undefined,
      sort_by: req.query.sort_by,
      total_pages: 0,
      total_items: 0,
    };

    const rapnetBody = getRapnetBodyFromFilter(
      req.query as unknown as IDiamondFilter
    );

    const resRapnet = await getRapnetDiamondsService(rapnetBody, req);
    if (resRapnet.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resRapnet;
    }

    pagination.total_items = resRapnet.data.total_diamonds_found;
    pagination.total_pages = Math.ceil(
      Number(resRapnet.data.total_diamonds_found) / pagination.per_page_rows
    );

    return resSuccess({
      data: {
        result: shapeRapnetDiamondList(resRapnet.data.diamond),
        pagination,
      },
    });
  } catch (e: any) {
    throw e;
  }
};
