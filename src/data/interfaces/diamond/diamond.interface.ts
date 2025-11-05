import { DIAMOND_ORIGIN } from "../../../utils/app-enumeration";

export interface TVDBDiamond {
  id: number;
  stock_num: string;
  vendor_id: number;
  total_sales_price: string;
  size: string;
  city: string;
  state: string;
  country: string;
  available: number;
  cert_num: string;
  shape: string;
  color: string;
  meas_length: string;
  meas_width: string;
  meas_depth: string;
  meas_ratio: null | string;
  image_url: string;
  video_url: string;
  cert_url: string;
  price_per_carat: string;
  lab: string;
  treatment: string;
  data_integrity: boolean;
  sort_priority: number;
  master_diamond_id: null;
  mount_price: null;
  fancy_color_dominant_color: null;
  fancy_color_secondary_color: null;
  fancy_color_overtone: null;
  fancy_color_intensity: null;
  clarity: string;
  cut: string;
  symmetry: string;
  polish: string;
  depth_percent: string;
  table_percent: string;
  girdle_min: string;
  girdle_max: string;
  girdle_condition: string;
  culet_size: string;
  culet_condition: null;
  fluor_color: null;
  fluor_intensity: string;
  has_cert_file: boolean;
  currency_code: null;
  currency_symbol: null;
  total_sales_price_in_currency: null;
  short_title: string;
  is_separable: boolean;
  cash_price: null;
  crown_height: string;
  crown_angle: string;
  pavilion_depth: string;
  pavilion_angle: string;
  laser_inscription: string;
  hearts_and_arrows: string;
  cert_comment: null;
  trade_show: null;
  cash_discount: null;
  parcel_stones: null;
  comments: string;
  eye_clean: string;
  star_length: string;
  shade: string;
  milky: string;
  inclusion_black: string;
  inclusion_center: string;
  inclusion_open: null;
  availability_change_date: null;
  discount_percent: null;
  sell_price: null;
  bgm: string;
  hidden: boolean;
  transcoding_job: null;
  transcoding_status: null;
  transcoded_video_data: null;
  orbital_source_url: null;
  transcoded_video_url: null;
  video_support: string;
  bad_fields: [];
  has_bad_data: boolean;
  data: {};
  girdle_percent: null;
  gem_type: null;
  country_of_origin: null;
  pair: null;
  metals: null;
  brand: string;
  history: null;
  created_at: string;
  updated_at: string;
  treatment_notes: null;
  orbital_url: null;
  whitelisted_video: boolean;
  gdrive_image_url: null;
  gdrive_video_url: null;
  image_source: null;
  image_source_url: null;
  video_source: null;
  video_source_url: null;
  cert_source: null;
  cert_source_url: null;
  source_errors: {};
  jewelry_style: null;
  metal: null;
  mount: null;
  total_stones: null;
  center_type: null;
  center_gem_type: null;
  center_shape: null;
  center_color: null;
  center_clarity: null;
  center_fancy_color_dominant_color: null;
  center_fancy_color_intensity: null;
  center_fluor_intensity: null;
  center_lab: null;
  center_cert_num: null;
  center_treatment: null;
  center_total_stones: null;
  center_size: null;
  center_meas_depth: null;
  center_meas_length: null;
  center_meas_width: null;
  center_meas_ratio: null;
  center_polish: null;
  center_symmetry: null;
  center_cut: null;
  center_depth_percent: null;
  center_table_percent: null;
  center_pair: null;
  s3_image: {
    url: null;
    thumb: {
      url: null;
    };
  };
  image_bad_http_status: boolean;
  image_check_ran_at: null;
  metal_carat: null;
  bad_video_content: boolean;
  s3_video: {
    url: null;
  };
  s3_cert: {
    url: null;
  };
  s3_direct_upload_url: {};
  oscillating_video: boolean;
  video_bad_http_status: boolean;
  video_check_ran_at: null;
  is_thumb_resized: boolean;
  calculated_disc_perc: string;
  side_stone_type: null;
  side_stone_gem_type: null;
  side_stone_total_stones: null;
  side_stone_size: null;
  side_stone_shape: null;
  side_stone_color: null;
  side_stone_clarity: null;
  side_stone_fancy_color_dominant_color: null;
  side_stone_fancy_color_intensity: null;
  lab_grown: boolean;
  jewelry_description: null;
  lab_sync_status: boolean;
  owner_info: null;
  custom_sort_order: null;
  parcel_carat_range_from: null;
  parcel_carat_range_to: null;
  layout: null;
  diamond_category: null;
  pair_stock_num: null;
  is_customizable: null;
  visibility: string;
  growth_type: null;
  tinge: null;
  luster: null;
  location_of_black: null;
  table_inclusion: null;
  table_open: null;
  crown_open: null;
  girdle_open: null;
  pavallion_open: null;
  ownership: null;
  key_to_symbol: string;
  surface_graining: null;
  internal_graining: null;
  indented_natural: null;
  inclusion_pattern: null;
  dor: null;
  rapnet_price: string;
  lab_sequence_no: null;
  fm: null;
  intensity_black_code: null;
  natts_code: null;
  original_stone_no: null;
  stock_status: null;
  carat_group: null;
  carat_group_seq_no: null;
  live_rapa_rate: string;
  stone_detail_url: null;
  new_arrival_date: null;
  shape_sequence_no: null;
  color_sequence_no: null;
  clarity_sequence_no: null;
  certificate_date: null;
  price_date: null;
  color_inclusion: null;
  csv_discount: string;
  max_quantity: null;
  price_variant: null;
  item_tag: null;
  additional_attributes: {};
  diamond_type: null;
  supported_shapes: null;
  scs_sustainable: null;
  scs_climate_neutral: null;
  certification: null;
  incremental_bid_amount: null;
  starting_bid: null;
  jewelry_type: null;
  sub_type: null;
  engravable: boolean;
  parent_id: null;
  tags: null;
  custom_search_text: null;
  jewelry_stock_num: null;
  status: string;
  status_updated_at: null;
  min_color: number;
  max_color: number;
  master_stock_number: null;
  cert_updated_at: null;
  config_field_1: null;
  config_field_2: null;
  sustainability: null;
  is_master_product: null;
  three_d_enabled: boolean;
  product_title: null;
  product_description: null;
  setting_supported_carat_from: null;
  setting_supported_carat_to: null;
  validation_errors: {};
  flagged: null;
  three_d_media: null;
  config_field_3: null;
  config_field_4: null;
  config_field_5: null;
  config_field_6: null;
  config_field_7: null;
  config_field_8: null;
  config_field_9: null;
  config_field_10: null;
  tier: null;
  scrambled_stock_num: null;
  markup_price: string;
  markup_price_per_carat: string;
  diamond_id: number;
  on_hand: number;
  base_price_per_carat: string;
  base_price: string;
  measurement: string;
  video_type: string;
  group_logo_url: null;
  group: null;
  mount_description: string;
  vendor_name: string;
  vendor_phone: string;
  vendor_mobile_phone: string;
  vendor_email: string;
  contact_person: string;
  vendor_street_address: string;
  vendor_city: string;
  vendor_state: string;
  vendor_country: string;
  vendor_zip_code: string;
  vendor_iphone: string;
  vendor_accepts_memo: boolean;
  last_updated_at: string;
  vendor_three_d_settings: null;
  image_thumb_url: string;
  shape_long: string;
  shape_short: string;
  clarity_long: string;
  clarity_short: string;
  cut_long: string;
  cut_short: string;
  polish_long: string;
  polish_short: string;
  symmetry_long: string;
  symmetry_short: string;
  fancy_color_long: null;
  fancy_color_short: null;
  fancy_color_intensity_long: null;
  fancy_color_intensity_short: null;
  fluorescence_intensity_long: string;
  fluorescence_intensity_short: string;
  lab_long: string;
  lab_short: string;
  culet_size_long: string;
  culet_size_short: string;
  girdle_min_long: string;
  girdle_min_short: string;
  girdle_max_long: string;
  girdle_max_short: string;
  fancy_color_overtone_long: null;
  fancy_color_overtone_short: null;
  is_fancy: boolean;
  estimated_delivery: null;
  supplier_comments: null;
  locations: TVDBLocation[];
  original_ppc: null;
  original_tsp: null;
  group_original_tsp: null;
  group_original_ppc: null;
  group_original_discount: null;
  previewable: string;
  image_urls: {
    image_url: string;
    sequence: number;
  }[];
  long_title: string;
  sub_title: string;
  retail_price: null;
  certification_details: {
    icon: null;
    logo: null;
    additional_text: null;
  };
  media: null;
  disable_price_negotiation: null;
  currency_exchange_rate: null;
  special_price: null;
  type: string;
  custom_availability_stone_status: null;
  jbt_detail: null;
  is_linked_pair: boolean;
  pairinfo: null;
  parcel_avg_weight: null;
  item_comment: string;
  supplier_specific_comment: string;
  masked_video_url: string;
  masked_image_url: string;
  masked_cert_url: string;
  sub_title_description: string;
  quality: string;
  hide_price_per_carat: null;
  hide_total_sales_price: null;
  original_stock_num: null;
}

interface TVDBLocation {
  id: number;
  location_name: string;
  street_address: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  contact_person: string;
  contact_email: string;
  mobile_phone: string;
  office_phone: string;
  website: string;
  vendor_id: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  contact_iphone: string;
  mobile_phone_country_code: string;
  contact_phone_country_code: string;
  contact_iphone_country_code: string;
  contact_whatsapp: string;
  contact_whatsapp_country_code: string;
}

type TVDBShape =
  | "Briolette"
  | "Eurocut"
  | "Flanders"
  | "Half Moon"
  | "Kite"
  | "Old Miner"
  | "Bullet"
  | "Hexagonal"
  | "Lozenge"
  | "Tapered Bullet"
  | "Octagonal"
  | "Triangle"
  | "Rose Cut"
  | "Radiant"
  | "Ideal Oval"
  | "Ideal Square"
  | "Square Emerald"
  | "Sig81"
  | "Cushion Modified Brilliant"
  | "Pear"
  | "Ideal Cushion"
  | "Asscher"
  | "Pentagonal"
  | "Star"
  | "Trapezoid"
  | "Cushion"
  | "Trilliant"
  | "Marquise"
  | "Baguette"
  | "Heart"
  | "Shield"
  | "Tapered Baguette"
  | "Round"
  | "Oval"
  | "Emerald"
  | "Princess"
  | "Square"
  | "Ideal Heart"
  | "Other";

type TVDBClarity =
  | "FL"
  | "IF"
  | "VVS1"
  | "VVS2"
  | "VS1"
  | "VS2"
  | "SI1"
  | "SI2"
  | "SI3"
  | "SI"
  | "VS"
  | "VS-SI"
  | "VVS"
  | "I1"
  | "I2"
  | "I3";

type TVDBCut = "Ideal" | "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";

type TVDBSymmetry =
  | "Ideal"
  | "Excellent"
  | "Very Good"
  | "Good"
  | "Fair"
  | "Poor";

type TVDBPolish =
  | "Ideal"
  | "Excellent"
  | "Very Good"
  | "Good"
  | "Fair"
  | "Poor";

type TVDBSorting =
  | "discount_percent"
  | "price_per_carat"
  | "total_sales_price"
  | "meas_ratio"
  | "meas_length"
  | "shape"
  | "size"
  | "color"
  | "clarity"
  | "cut"
  | "polish"
  | "symmetry"
  | "fluor_intensity"
  | "depth_percent"
  | "table_percent"
  | "lab";

export type TRapnetDiamond = {
  sarine_file: null;
  total_purchase_price: number;
  city: string;
  country: string;
  diamond_id: number;
  shape: string;
  size: number;
  color: string;
  fancy_color_dominant_color: string;
  fancy_color_secondary_color: string;
  fancy_color_overtone: string;
  fancy_color_intensity: string;
  clarity: string;
  cut: string;
  symmetry: string;
  polish: string;
  depth_percent: number;
  table_percent: number;
  meas_length: number;
  meas_width: number;
  meas_depth: number;
  girdle_min: string;
  girdle_max: string;
  girdle_condition: string;
  culet_size: string;
  culet_condition: string;
  fluor_color: string;
  fluor_intensity: string;
  has_cert_file: boolean;
  lab: string;
  currency_code: string;
  currency_symbol: string;
  cert_num: string;
  stock_num: string;
  video_url: string;
  has_video: boolean;
  eye_clean: string;
  has_image_file: boolean;
  has_sarineloupe: boolean;
  image_file: string;
  total_sales_price: number;
  total_sales_price_in_currency: number;
  ratio: null;
  is_bgm: boolean;
};

export interface IDiamondFilter {
  current_page: number;
  per_page_rows: number;
  sort_by?: string; // shape, price, carat, cut, color, clarity
  order_by?: string;
  shape?: string; // TVDBShape
  min_carat?: number;
  max_carat?: number;
  diamond_origin?: DIAMOND_ORIGIN;
  min_price?: number;
  max_price?: number;
  color_from?: string; // D-Z
  color_to?: string; // D-Z
  clarity_from?: string; // TVDBClarity
  clarity_to?: string; // TVDBClarity
  cut_from?: string; // TVDBCut
  cut_to?: string; // TVDBCut
  h_a?: string;
  report?: string;
  min_lw_ratio?: number;
  max_lw_ratio?: number;
  fluorescence_intensity?: string;
  polish_from?: string;
  polish_to?: string;
  symmetry_from?: string;
  symmetry_to?: string;
  min_table?: string;
  max_table?: string;
  min_depth?: string;
  max_depth?: string;
}

export interface IDiamondResponse {
  id: string;
  shape: string;
  price: string;
  carat: string;
  cut: string;
  color: string;
  clarity: string;
  image_url: string;
  video_url: string;
  other_images_url: string[];
  lw: null | string;
  fluor: string;
  symmetry: string;
  table: string;
  measurement_length: string;
  measurement_width: string;
  measurement_depth: string;
  culet: string;
  polish: string;
  girdle: string;
  depth: string;
  report: string;
  stock_number: string;
  diamond_origin: string;
  certificate_url: string;
  quantity: number | null;
  remaining_quantity_count: number | null;
}
