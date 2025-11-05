
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('template_banners', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      name: {
  allowNull: false,
  type: 'character varying',
},
      target_url: {
  allowNull: true,
  type: 'character varying(2048)',
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
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      active_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      expiry_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      banner_type: {
  allowNull: true,
  type: Sequelize.SMALLINT,
},
      content: {
  allowNull: true,
  type: 'character varying',
},
      button_name: {
  allowNull: true,
  type: 'character varying',
},
      sub_title: {
  allowNull: true,
  type: 'character varying',
},
      button_two_name: {
  allowNull: true,
  type: 'character varying',
},
      target_link_two: {
  allowNull: true,
  type: 'character varying',
},
      sort_order: {
  allowNull: true,
  type: 'numeric',
},
      banner_text_color: {
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
      button_hover_color: {
  allowNull: true,
  type: 'character varying',
},
      button_hover_text_color: {
  allowNull: true,
  type: 'character varying',
},
      is_button_transparent: {
  default:'0',
  type: 'bit(1)',
},
      title: {
  allowNull: true,
  type: 'character varying',
},
      product_ids: {
  allowNull: true,
  type: Sequelize.JSON,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('template_banners');
  }
};
