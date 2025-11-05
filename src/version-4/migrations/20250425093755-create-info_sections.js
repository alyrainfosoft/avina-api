
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {

     // Create an ENUM type
     await queryInterface.sequelize.query(`
CREATE TYPE public.info_key AS ENUM
    ('metal_tone', 'metal_karat', 'shape_master', 'carat', 'color', 'clarity', 'head', 'shank', 'setting_type', 'side_setting', 'brands', 'collection', 'stone_master', 'metal_master', 'cut', 'mm_size', 'item_size', 'item_length', 'tag');
    `);

    await queryInterface.createTable('info_sections', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      title: {
  allowNull: true,
  type: 'character varying',
},
      description: {
  allowNull: true,
  type: Sequelize.TEXT,
},
      key: {
  allowNull: false,
  type: 'info_key'
},
      created_by: {
  allowNull: false,
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
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('info_sections');
     // Drop the ENUM type
     await queryInterface.sequelize.query(`
      DROP TYPE info_key;
    `);
  }
};
