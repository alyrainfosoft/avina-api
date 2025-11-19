
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loose_diamond_group_masters', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      stock_id: {
  allowNull: true,
  type: 'character varying',
},
      availability: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      stone: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      shape: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      weight: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      color: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      clarity: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      cut_grade: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      off_RAP: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      polish: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      symmetry: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      fluorescence_intensity: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      fluorescence_color: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      measurements: {
  allowNull: true,
  type: 'character varying',
},
      lab: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      certificate: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      certificate_url: {
  allowNull: true,
  type: 'character varying',
},
      treatment: {
  allowNull: true,
  type: 'character varying',
},
      fancy_color: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      fancy_color_intensity: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      fancy_color_overtone: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      depth_per: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      table_per: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      girdle_thin: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      girdle_thick: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      girdle_per: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      girdle_condition: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      culet_size: {
  allowNull: true,
  type: 'character varying',
},
      culet_condition: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      crown_height: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      crown_angle: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      pavilion_depth: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      pavilion_angle: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      laser_inscription: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      cert_comment: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      sort_description: {
  allowNull: true,
  type: 'character varying',
},
      long_description: {
  allowNull: true,
  type: 'character varying',
},
      country: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      state: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      city: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      time_to_location: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      in_matched_pair_separable: {
  allowNull: true,
  type: 'character varying',
},
      pair_stock: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      parcel_stone: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      image_link: {
  allowNull: true,
  type: 'character varying',
},
      video_link: {
  allowNull: true,
  type: 'character varying',
},
      sari_loupe: {
  allowNull: true,
  type: 'character varying',
},
      trade_show: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      key_of_symbols: {
  allowNull: true,
  type: 'character varying',
},
      shade: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      star_length: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      center_inclusion: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      black_inclusion: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      member_comment: {
  allowNull: true,
  type: 'character varying',
},
      report_issue_date: {
  allowNull: true,
  type: Sequelize.DATEONLY,
},
      report_type: {
  allowNull: true,
  type: 'character varying',
},
      lab_location: {
  allowNull: true,
  type: 'character varying',
},
      brand: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      milky: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      eye_clean: {
  allowNull: true,
  type: 'character varying',
},
      h_a: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      bgm: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      growth_type: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      total_price: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      price_ct: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      modified_at: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      is_deleted: {
  allowNull: true,
  default:'0',
  type: 'bit(1)',
},
      deleted_by: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      is_active: {
  allowNull: true,
  default:'1',
  type: 'bit(1)',
},
      stone_type: {
  allowNull: true,
  type: 'character varying',
},
      mm_size: {
  allowNull: true,
  type: 'character varying',
},
      seive_size: {
  allowNull: true,
  type: 'character varying',
},
      image_path: {
  allowNull: true,
  type: 'character varying',
},
      quantity: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      remaining_quantity_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('loose_diamond_group_masters');
  }
};
