
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {

     // Create an ENUM type
     await queryInterface.sequelize.query(`
      CREATE TYPE public.template_six_type AS ENUM
    ('banner', 'diamond_shape_section', 'category_section', 'sparkling_section', 'shape_marque', 'event_section', 'style_section', 'instagram_section');
          `);
      
           // Create an ENUM type
           await queryInterface.sequelize.query(`
      CREATE TYPE public.template_three_diamond_shape_section_type AS ENUM
          ('basic_shape', 'special_shape');    `);
      

    await queryInterface.createTable('template_six', {
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
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_hover_image: {
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
      id_style: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      sort_order: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      is_button_transparent: {
  allowNull: true,
  type: 'bit(1)',
},
      button_hover_color: {
  allowNull: true,
  type: 'character varying',
},
      button_text_hover_color: {
  allowNull: true,
  type: 'character varying',
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
  allowNull: false,
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
      id_diamond_shape: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      diamond_shape_type: {
  allowNull: true,
  type: 'template_three_diamond_shape_section_type',
},
      hash_tag: {
  allowNull: true,
  type: 'character varying',
},
      section_type: {
  allowNull: true,
  type: 'template_six_type'
},
      id_title_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_product: {
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
    await queryInterface.dropTable('template_six');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE template_six_type;
    `);

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE template_three_diamond_shape_section_type;
    `);
  }
};
