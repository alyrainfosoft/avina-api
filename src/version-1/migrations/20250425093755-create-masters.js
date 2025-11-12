
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create an ENUM type
await queryInterface.sequelize.query(`
CREATE TYPE public.master_type AS ENUM
    ('metal_master', 'metal_tone_master', 'metal_karat_master', 'stone_master', 'stone_carat_master', 'stone_shape_master', 'diamond_color_master', 'diamond_clarity_master', 'diamond_cut_master', 'diamond_certificate_master', 'diamond_process_master', 'item_size_master', 'item_length_master', 'setting_style_master', 'tag_master', 'brand_master', 'category_master', 'select_preference_master', 'availability_master', 'cut_grade_master', 'polish_master', 'symmetry_master', 'fluorescence_intensity_master', 'fluorescence_color_master', 'lab_master', 'fancy_color_master', 'fancy_color_intensity_master', 'fancy_color_overtone_master', 'girdle_thin_master', 'girdle_thick_master', 'girdle_condition_master', 'culet_condition_master', 'laser_inscription_master', 'cert_comment_master', 'country', 'state', 'city', 'time_to_location_master', 'pair_separable_master', 'pair_stock_master', 'parcel_stones_master', 'trade_show_master', 'shade_master', 'center_inclusion_master', 'black_inclusion_master', 'report_type_master', 'lab_location_master', 'milky_master', 'bgm_master', 'pair_master', 'H&A_master', 'growth_type_master');
   `);
    // Create an ENUM type
    await queryInterface.sequelize.query(`
CREATE TYPE public.stone_type AS ENUM
    ('gemstone', 'diamond');
    `);
    await queryInterface.createTable('masters', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      name: {
  allowNull: false,
  type: 'character varying',
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
      sort_code: {
  allowNull: true,
  type: 'character varying',
},
      id_parent: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      id_image: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
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
      deleted_by: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      master_type: {
  allowNull: false,
  type: 'master_type'
},
      stone_type: {
  allowNull: true,
  type: 'stone_type',
},
      value: {
  allowNull: true,
  type: 'character varying',
},
      link: {
  allowNull: true,
  type: 'character varying',
},
      import_name: {
  allowNull: true,
  type: 'character varying',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('masters');
    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE master_type;
    `);
    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE stone_type;
    `);
  }
};
