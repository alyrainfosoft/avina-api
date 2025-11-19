
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create an ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE public.template_five_type AS ENUM
    ('banner', 'jewelry_collection', 'diamond_collection', 'category_section', 'product_model');
          `);
      
    await queryInterface.createTable('template_five', {
      
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      section_type: {
  allowNull: false,
  type: 'template_five_type',
},
      title: {
  allowNull: true,
  type: 'character varying',
},
      sub_title: {
  allowNull: true,
  type: 'character varying',
},
      description: {
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
      link: {
  allowNull: true,
  type: 'character varying',
},
      button_text_color: {
  allowNull: true,
  type: 'character varying',
},
      title_id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_sub_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_active: {allowNull: true,
  type: 'bit(1)',
},
      is_deleted: {allowNull: true,
  type: 'bit(1)',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_collection: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_category: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      sort_order: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('template_five');
    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE template_five_type;
    `);
  }
};
