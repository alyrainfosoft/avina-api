
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {

    // Define the custom ENUM type in PostgreSQL
    await queryInterface.sequelize.query(`
      CREATE TYPE public.about_us_section_type AS ENUM('banner', 'features_section', 'marketing_section');
    `);
    await queryInterface.createTable('about_us', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      title: {
  allowNull: true,
  type: 'character varying',
},
      sub_title: {
  allowNull: true,
  type: 'character varying',
},
      button_name: {
  allowNull: true,
  type: 'character varying',
},
      button_color: {
  allowNull: true,
  type: 'character varying',
},
      button_text_color: {
  allowNull: true,
  type: 'character varying',
},
      link: {
  allowNull: true,
  type: 'character varying',
},
      content: {
  allowNull: true,
  type: 'character varying',
},
      button_hover_color: {
  allowNull: true,
  type: 'character varying',
},
      button_text_hover_color: {
  allowNull: true,
  type: 'character varying',
},
      id_image: {
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
      section_type: {
  allowNull: true,
  type: 'about_us_section_type',
},
      sort_order: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_button_transparent: {
  allowNull: false,
  default:'0',
  type: 'bit(1)',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('about_us');
    // Drop the custom type in PostgreSQL
    await queryInterface.sequelize.query(`
    DROP TYPE about_us_section_type;
  `);
  }
};
