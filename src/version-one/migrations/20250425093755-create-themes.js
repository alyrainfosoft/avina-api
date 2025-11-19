
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create an ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE public.theme_section_type AS ENUM
    ('header', 'footer', 'home_page', 'product_grid', 'product_card', 'product_filter', 'product_detail', 'create_your_own', 'login', 'registration', 'toast', 'button', 'cart', 'checkout', 'profile', 'verified_otp', 'configurator_detail');
    `);
    await queryInterface.createTable('themes', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      name: {
  allowNull: true,
  type: 'character varying',
},
      description: {
  allowNull: true,
  type: 'character varying',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      deleted_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      deleted_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      section_type: {
  defaultValue: 'header', // <-- set your default value here
  type: 'theme_section_type'
},
      key: {
  allowNull: true,
  type: 'character varying',
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('themes');

     // Drop the ENUM type
     await queryInterface.sequelize.query(`
      DROP TYPE theme_section_type;
    `);
  }
};