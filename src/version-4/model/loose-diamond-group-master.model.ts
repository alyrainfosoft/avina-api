import { BIGINT, DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { Master } from "./master/master.model";
import { DiamondShape } from "./master/attributes/diamondShape.model";
import { Colors } from "./master/attributes/colors.model";
import { ClarityData } from "./master/attributes/clarity.model";
import { CutsData } from "./master/attributes/cuts.model";
import { BrandData } from "./master/attributes/brands.model";
import { StoneData } from "./master/attributes/gemstones.model";
export const LooseDiamondGroupMasters = (dbContext: any) => {
  let looseDiamondGroupMasters = dbContext.define("loose_diamond_group_masters", {
    id: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    stock_id: {
      type: STRING,
    },
    availability: {
      type: BIGINT,
    },
    stone: {
      type: BIGINT,
    },
    stone_type: {
      type: STRING,
    },
    shape: {
      type: BIGINT,
    },
    weight: {
      type: DOUBLE,
    },
    color: {
      type: BIGINT,
    },
    clarity: {
      type: BIGINT,
    },
    mm_size: {
      type: STRING,
    },
    seive_size: {
      type: BIGINT,
    },
    cut_grade: {
      type: BIGINT,
    },
    off_RAP: {
      type: DOUBLE,
    },
    polish: {
      type: BIGINT,
    },
    symmetry: {
      type: BIGINT,
    },
    fluorescence_intensity: {
      type: BIGINT,
    },
    fluorescence_color: {
      type: BIGINT,
    },
    measurements: {
      type: STRING,
    },
    lab: {
      type: BIGINT,
    },
    certificate: {
      type: STRING,
    },
    certificate_url: {
      type: STRING,
    },
    treatment: {
      type: STRING,
    },
    fancy_color: {
      type: BIGINT,
    },
    fancy_color_intensity: {
      type: BIGINT,
    },
    fancy_color_overtone: {
      type: BIGINT,
    },
    depth_per: {
      type: DOUBLE,
    },
    table_per: {
      type: DOUBLE,
    },
    girdle_thin: {
      type: BIGINT,
    },
    girdle_thick: {
      type: BIGINT,
    },
    girdle_per: {
      type: DOUBLE,
    },
    girdle_condition: {
      type: BIGINT,
    },
    culet_size: {
      type: STRING,
    },
    culet_condition: {
      type: BIGINT,
    },
    crown_height: {
      type: DOUBLE,
    },
    crown_angle: {
      type: DOUBLE,
    },
    pavilion_depth: {
      type: DOUBLE,
    },
    pavilion_angle: {
      type: DOUBLE,
    },
    laser_inscription: {
      type: BIGINT,
    },
    cert_comment: {
      type: BIGINT,
    },
    sort_description: {
      type: STRING,
    },
    long_description: {
      type: STRING,
    },
    country: {
      type: BIGINT,
    },
    state: {
      type: BIGINT,
    },
    city: {
      type: BIGINT,
    },
    time_to_location: {
      type: BIGINT,
    },
    in_matched_pair_separable: {
      type: STRING,
    },
    pair_stock: {
      type: STRING,
    },
    parcel_stone: {
      type: BIGINT,
    },
    image_link: {
      type: STRING,
    },
    video_link: {
      type: STRING,
    },
    sari_loupe: {
      type: STRING,
    },
    trade_show: {
      type: BIGINT,
    },
    key_of_symbols: {
      type: STRING,
    },
    shade: {
      type: BIGINT,
    },
    star_length: {
      type: DOUBLE,
    },
    center_inclusion: {
      type: BIGINT,
    },
    black_inclusion: {
      type: BIGINT,
    },
    member_comment: {
      type: STRING,
    },
    report_issue_date: {
      type: DATE,
    },
    report_type: {
      type: STRING,
    },
    lab_location: {
      type: STRING,
    },
    brand: {
      type: BIGINT,
    },
    milky: {
      type: BIGINT,
    },
    eye_clean: {
      type: STRING,
    },
    h_a: {
      type: BIGINT,
    },
    bgm: {
      type: BIGINT,
    },
    growth_type: {
      type: BIGINT,
    },
    total_price: {
      type: DOUBLE,
    },
    price_ct: {
      type: DOUBLE,
    },
    is_active: {
      type: STRING,
    },
    is_deleted: {
      type: STRING,
    },
    created_by: {
      type: BIGINT,
    },
    created_at: {
      type: DATE,
    },
    modified_by: {
      type: BIGINT,
    },
    modified_at: {
      type: DATE,
    },
    deleted_at: {
      type: DATE,
    },
    deleted_by: {
      type: BIGINT,
    },
    image_path: {
      type: STRING
    },
    quantity: {
      type: INTEGER
    },
    remaining_quantity_count: {
      type: INTEGER
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return looseDiamondGroupMasters;
}
