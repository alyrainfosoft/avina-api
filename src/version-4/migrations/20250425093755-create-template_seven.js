
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create an ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE public.template_seven_type AS ENUM
    ('offers_slider', 'single_offer_top', 'single_offer_bottom', 'attractive_jewelry', 'jewelry_Categories', 'stunning_desgin', 'festive_sale_offer', 'dazzling_and_stylish', 'category_and_products', 'stunning_jewels', 'testimonial', 'template_selevens', 'testimonial_detail', 'new_and_blog', 'luminous_design');
          `);
      

    await queryInterface.createTable('template_seven', {
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
      sub_title_one: {
  allowNull: true,
  type: 'character varying',
},
      description: {
  allowNull: true,
  type: 'character varying',
},
      sub_description: {
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
      id_bg_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_product_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_title_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_offer_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_categories: {
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
      section_type: {
  allowNull: true,
  type:'template_seven_type'
},
      id_products: {
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
    await queryInterface.dropTable('template_seven');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE template_seven_type;
    `);
  }
};
